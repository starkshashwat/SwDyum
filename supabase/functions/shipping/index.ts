import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import crypto from "node:crypto"
import { Buffer } from "node:buffer"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const VELOCITY_BASE_URL = Deno.env.get('VELOCITY_BASE_URL') || 'https://shazam.velocity.in'

// ── Crypto Helpers ──────────────────────────────────────────────────────────

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12

function getEncryptionKey() {
    const keyStr = Deno.env.get('CREDENTIAL_ENCRYPTION_KEY') || '32_char_super_secret_key_swadyum'
    const key = Buffer.from(keyStr, 'utf-8')
    if (key.length === 32) return key
    const paddedKey = Buffer.alloc(32)
    key.copy(paddedKey)
    return paddedKey
}

function encrypt(text: string) {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    const authTag = cipher.getAuthTag()
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

function decrypt(encryptedText: string) {
    if (!encryptedText || typeof encryptedText !== 'string') return ''
    const parts = encryptedText.split(':')
    if (parts.length !== 3) return ''
    
    try {
        const key = getEncryptionKey()
        const iv = Buffer.from(parts[0], 'hex')
        const authTag = Buffer.from(parts[1], 'hex')
        const encryptedData = parts[2]
        
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
        decipher.setAuthTag(authTag)
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
        decrypted += decipher.final('utf8')
        return decrypted
    } catch {
        return ''
    }
}

// ── Velocity Helpers ─────────────────────────────────────────────────────────

async function getOrCreateVelocityProvider(supabaseAdmin: any) {
    const { data: provider } = await supabaseAdmin
        .from('shipping_providers')
        .select('id')
        .eq('code', 'velocity')
        .maybeSingle()

    if (provider?.id) return provider.id

    const { data: newProvider, error } = await supabaseAdmin
        .from('shipping_providers')
        .insert([{ name: 'Velocity', code: 'velocity', active: true }])
        .select('id')
        .single()

    if (error) throw error
    return newProvider.id
}

async function getVelocityAuthToken(supabaseAdmin: any) {
  const { data: creds, error } = await supabaseAdmin
      .from('shipping_credentials')
      .select('encrypted_username, encrypted_api_key')
      .eq('active', true)
      .maybeSingle()

  if (error || !creds) throw new Error('Velocity credentials not configured')
  
  const username = decrypt(creds.encrypted_username)
  const password = decrypt(creds.encrypted_api_key)

  if (!username || !password) {
      throw new Error('Could not decrypt Velocity credentials. Please re-enter them.')
  }

  let formattedUsername = username.trim()
  if (/^\d{10}$/.test(formattedUsername)) {
      formattedUsername = `+91${formattedUsername}`
  }

  const response = await fetch(`${VELOCITY_BASE_URL}/custom/api/v1/auth-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: formattedUsername, password })
  })
  
  if (!response.ok) {
      const txt = await response.text()
      throw new Error(`Velocity Auth failed (${response.status}): ${txt}`)
  }
  const res = await response.json()
  return res.token
}

async function fetchVelocity(endpoint: string, options: any, supabaseAdmin: any) {
    const token = await getVelocityAuthToken(supabaseAdmin)
    const response = await fetch(`${VELOCITY_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
            ...options.headers
        }
    })
    
    if (!response.ok) {
        const txt = await response.text()
        throw new Error(`Velocity error ${response.status}: ${txt}`)
    }
    
    return await response.json()
}

// ── Main Handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Unauthorized: Missing Authorization header')

    const token = authHeader.replace(/^Bearer\s+/i, '')
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) throw new Error('Unauthorized: Invalid or expired session')

    const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).maybeSingle()
    const userRole = (profile?.role || '').toLowerCase()
    if (!['admin', 'super admin', 'super_admin', 'editor', 'manager'].some(r => userRole.includes(r))) {
      throw new Error(`Forbidden: Admin access required (Current role: ${profile?.role || 'none'})`)
    }

    const payload = await req.json()
    const { action } = payload

    if (action === 'save_credentials') {
        const { username, password } = payload
        if (!username || !password) throw new Error('Username and password are required')

        const providerId = await getOrCreateVelocityProvider(supabaseAdmin)
        const lastFour = username.trim().slice(-4).padStart(4, '0')

        await supabaseAdmin.from('shipping_credentials').update({ active: false }).eq('provider_id', providerId).eq('active', true)

        const { data, error } = await supabaseAdmin.from('shipping_credentials').insert([{
            provider_id: providerId,
            encrypted_username: encrypt(username.trim()),
            encrypted_api_key: encrypt(password.trim()),
            key_last_four: lastFour,
            active: true,
            updated_by_admin_id: user.id,
            created_by_admin_id: user.id
        }]).select().single()

        if (error) throw error
        return new Response(JSON.stringify({ success: true, data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (action === 'credential_status') {
        const { data, error } = await supabaseAdmin
            .from('shipping_credentials')
            .select('key_last_four, test_status, last_tested_at, updated_by_admin_id')
            .eq('active', true)
            .maybeSingle()

        if (error) throw error

        if (!data) {
            return new Response(JSON.stringify({ data: { status: 'not_configured' } }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        let updatedByAdminName = null
        if (data.updated_by_admin_id) {
            const { data: adminProfile } = await supabaseAdmin.from('profiles').select('name').eq('id', data.updated_by_admin_id).maybeSingle()
            if (adminProfile) updatedByAdminName = adminProfile.name
        }

        return new Response(JSON.stringify({
            data: {
                key_masked: `••••••${data.key_last_four || '****'}`,
                test_status: data.test_status || 'not_tested',
                last_tested_at: data.last_tested_at,
                updated_by: updatedByAdminName
            }
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (action === 'test_connection') {
        let testStatus = 'connected'
        let message = 'Successfully connected to Velocity API.'
        const lastTestedAt = new Date().toISOString()
        try {
            await getVelocityAuthToken(supabaseAdmin)
            await supabaseAdmin.from('shipping_credentials').update({ test_status: 'connected', last_tested_at: lastTestedAt }).eq('active', true)
        } catch (e: any) {
            testStatus = 'invalid_key'
            message = e.message || 'Authentication failed'
            await supabaseAdmin.from('shipping_credentials').update({ test_status: 'invalid_key', last_tested_at: lastTestedAt }).eq('active', true)
        }

        return new Response(JSON.stringify({ status: testStatus, message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (action === 'sync_warehouse') {
        const { warehouse_id } = payload
        const { data: warehouse } = await supabaseAdmin.from('warehouses').select('*').eq('id', warehouse_id).single()
        if (!warehouse) throw new Error('Warehouse not found')

        const velocityPayload = {
            name: warehouse.name,
            phone_number: warehouse.phone || '',
            email: warehouse.email || '',
            contact_person: warehouse.name,
            address_attributes: {
                street_address: warehouse.address || '',
                zip: warehouse.pincode || '',
                city: warehouse.city || '',
                state: warehouse.state || '',
                country: warehouse.country || 'India'
            }
        }

        const res = await fetchVelocity('/custom/api/v1/warehouse', {
            method: 'POST',
            body: JSON.stringify(velocityPayload)
        }, supabaseAdmin)

        const velocityWarehouseId = res?.payload?.warehouse_id || res?.data?.warehouse_id || res?.warehouse_id || res?.id

        if (velocityWarehouseId) {
            await supabaseAdmin.from('warehouses').update({
                velocity_warehouse_id: String(velocityWarehouseId),
                updated_at: new Date().toISOString()
            }).eq('id', warehouse_id)

            return new Response(JSON.stringify({ success: true, velocity_warehouse_id: velocityWarehouseId }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        throw new Error(`Velocity did not return a warehouse ID: ${JSON.stringify(res)}`)
    }

    if (action === 'sync_shipment') {
        const { shipment_id } = payload
        const { data: shipment } = await supabaseAdmin.from('shipments').select('*').eq('id', shipment_id).single()
        if (!shipment) throw new Error('Shipment not found')

        const trackingRes = await fetchVelocity('/custom/api/v1/order-tracking', {
            method: 'POST',
            body: JSON.stringify({ awbs: [shipment.awb_code] })
        }, supabaseAdmin)

        if (trackingRes.meta?.success && trackingRes.data?.length > 0) {
            const newStatus = trackingRes.data[0].status || shipment.velocity_status
            await supabaseAdmin.from('shipments').update({
                velocity_status: newStatus,
                customer_visible_status: newStatus,
                last_synced_at: new Date().toISOString()
            }).eq('id', shipment_id)
            return new Response(JSON.stringify({ success: true, status: newStatus }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }
        throw new Error('Failed to track shipment from Velocity')
    }

    if (action === 'cancel_shipment') {
        const { shipment_id } = payload
        const { data: shipment } = await supabaseAdmin.from('shipments').select('*').eq('id', shipment_id).single()
        if (!shipment) throw new Error('Shipment not found')

        const res = await fetchVelocity('/custom/api/v1/cancel-order', {
            method: 'POST',
            body: JSON.stringify({ awbs: [shipment.awb_code] })
        }, supabaseAdmin)

        await supabaseAdmin.from('shipments').update({ is_canceled: true, velocity_status: 'Cancelled' }).eq('id', shipment_id)
        await supabaseAdmin.from('shipment_events').insert([{ shipment_id, velocity_status: 'Cancelled', event_time: new Date().toISOString(), created_by_admin_id: user.id }])

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (action === 'create_shipment' || action === 'create_reverse_shipment') {
        // Because building the full Velocity JSON payload is complex (requires order details, items, warehouses, dimensions),
        // we delegate the heavy lifting to the Edge function but it requires mapping logic.
        // For the sake of this migration, we'll implement a basic structure that the user can expand upon.
        
        throw new Error('Create shipment logic requires the full velocity payload mapping which is currently migrating to edge.')
    }

    throw new Error(`Unknown action: ${action}`)

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
