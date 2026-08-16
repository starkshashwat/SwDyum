// ============================================================================
// utils/resilientQuery.js
// ----------------------------------------------------------------------------
// Many tables defined in migrations/v2_normalized_schema may not have been
// applied to the live Supabase database yet. Rather than crashing with
// "column X does not exist" or "Could not find a relationship", this helper
// retries queries by progressively stripping unsupported features.
//
// Usage:
//   const { data, error, count } = await resilientQuery(supabaseAdmin, {
//       table: 'products',
//       select: '*, product_variants(*), product_images(*)',
//       order: 'sort_order',
//       filters: (q) => q.eq('is_active', true),
//       range: [0, 24],
//       single: false,
//   });
// ============================================================================

import { logger } from './logger.js';

/**
 * Executes a Supabase select query with automatic fallback when columns or
 * related tables are missing from the schema.
 *
 * @param {object} supabase  - Supabase client (admin or anon)
 * @param {object} opts
 * @param {string} opts.table         - Table name
 * @param {string} opts.select        - Select expression (may include joins)
 * @param {string} [opts.order]       - Column to order by (e.g. 'sort_order')
 * @param {string} [opts.orderFallback='created_at'] - Fallback order column
 * @param {boolean} [opts.ascending=true]
 * @param {function} [opts.filters]   - (query) => query with additional filters
 * @param {number[]} [opts.range]     - [from, to] for pagination
 * @param {boolean} [opts.single]     - Use .single()
 * @param {boolean} [opts.count]      - Request count ('exact')
 * @returns {Promise<{data, error, count, fallbacks}>}
 */
export async function resilientQuery(supabase, opts) {
    const {
        table,
        select: origSelect,
        order: origOrder,
        orderFallback = 'created_at',
        ascending = true,
        filters,
        range,
        single = false,
        count: wantCount = false,
    } = opts;

    let selectExpr = origSelect || '*';
    let orderCol = origOrder || null;
    const fallbacks = []; // track what we had to strip

    const buildAndRun = async () => {
        const selectOpts = wantCount ? { count: 'exact' } : undefined;
        let q = supabase.from(table).select(selectExpr, selectOpts);
        if (orderCol) q = q.order(orderCol, { ascending });
        if (range) q = q.range(range[0], range[1]);
        if (filters) q = filters(q);
        if (single) q = q.single();
        return q;
    };

    let result = await buildAndRun();

    // Strip joined tables that don't exist (relationship or table not found errors)
    while (result.error && (result.error.message?.includes('relationship') || result.error.message?.includes('Could not find the'))) {
        const missingMatch = result.error.message.match(/between '[^']+' and '([^']+)'/i) ||
                             result.error.message.match(/table 'public\.([^']+)'/i) ||
                             result.error.message.match(/table '([^']+)'/i);
        if (missingMatch && missingMatch[1]) {
            const missingTable = missingMatch[1];
            logger.warn(`resilientQuery(${table}): stripping unmigrated join '${missingTable}' from select`);
            fallbacks.push(`stripped_${missingTable}`);
            const tableRegex = new RegExp(`,?\\s*${missingTable}\\([^)]*\\)`, 'g');
            const updatedExpr = selectExpr.replace(tableRegex, '').replace(/^,\s*/, '').replace(/,\s*$/, '').trim();
            if (updatedExpr === selectExpr) break; // prevent infinite loop
            selectExpr = updatedExpr || '*';
            result = await buildAndRun();
        } else {
            logger.warn(`resilientQuery(${table}): stripping all joins from select — ${result.error.message}`);
            fallbacks.push('joins_stripped');
            const joinPattern = /,?\s*\w+\([^)]*\)/g;
            selectExpr = selectExpr.replace(joinPattern, '').replace(/,\s*$/, '').trim() || '*';
            result = await buildAndRun();
            break;
        }
    }

    // Strip sort column if it doesn't exist
    if (result.error && orderCol && result.error.message?.includes(orderCol)) {
        logger.warn(`resilientQuery(${table}): falling back from ${orderCol} to ${orderFallback} — ${result.error.message}`);
        fallbacks.push('order_fallback');
        orderCol = orderFallback;
        result = await buildAndRun();
    }

    // Strip any remaining missing column errors by removing the order entirely
    if (result.error && result.error.message?.includes('does not exist') && orderCol) {
        logger.warn(`resilientQuery(${table}): removing order clause entirely — ${result.error.message}`);
        fallbacks.push('order_removed');
        orderCol = null;
        result = await buildAndRun();
    }

    return { ...result, fallbacks };
}
