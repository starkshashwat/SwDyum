// Swadyum — Shiprocket API Frontend Helper
// Calls our local proxy server at localhost:3001 to avoid CORS issues

const PROXY_BASE = 'http://localhost:3001/api/shiprocket';

// Small delay helper
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const shiprocketApi = {
  // ─── Step 1: Create Order on Shiprocket ───────────────────────────────────
  createOrder: async (order, formData) => {
    const names = (formData.name || '').trim().split(/\s+/);
    const firstName = names[0] || 'Valued';
    const lastName = names.slice(1).join(' ') || 'Customer';

    const phone = (formData.phone || '')
      .replace(/\D/g, '')
      .slice(-10);

    const totalWeight = (order.items || []).reduce(
      (sum, item) => sum + item.quantity * 0.5,
      0.5
    );

    const payload = {
      order_id: order.id,
      order_date: new Date(order.date)
        .toISOString()
        .replace('T', ' ')
        .substring(0, 16),
      pickup_location: import.meta.env.VITE_PICKUP_LOCATION || 'Primary',

      // Billing / Shipping Address
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: formData.address,
      billing_city: formData.city,
      billing_pincode: String(formData.zip),
      billing_state: formData.state,
      billing_country: 'India',
      billing_email: formData.email,
      billing_phone: phone,
      shipping_is_billing: true,

      // Items
      order_items: (order.items || []).map((item) => ({
        name: item.name,
        sku: `SWD-${(item.slug || 'PICKLE').substring(0, 8).toUpperCase()}-${item.weight}`,
        units: item.quantity,
        selling_price: String(item.price),
        discount: '',
        tax: '',
        hsn: 2001,
      })),

      payment_method:
        order.paymentMethod === 'Cash on Delivery' ? 'COD' : 'Prepaid',
      sub_total: order.subtotal,

      // Parcel dimensions (cm) & weight (kg)
      length: 15,
      breadth: 15,
      height: 15,
      weight: totalWeight,
    };

    const res = await fetch(`${PROXY_BASE}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Proxy error ${res.status}`);
    return res.json();
  },

  // ─── Step 2: Assign AWB to Shipment ───────────────────────────────────────
  assignAwb: async (shipmentId) => {
    const res = await fetch(`${PROXY_BASE}/assign-awb`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shipment_id: shipmentId }),
    });
    if (!res.ok) throw new Error(`AWB proxy error ${res.status}`);
    return res.json();
  },

  // ─── Step 3: Generate Shipping Label ──────────────────────────────────────
  generateLabel: async (shipmentId) => {
    const res = await fetch(`${PROXY_BASE}/generate-label`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shipment_id: [shipmentId] }),
    });
    if (!res.ok) throw new Error(`Label proxy error ${res.status}`);
    return res.json();
  },

  // ─── Step 4: Track Live Shipment ──────────────────────────────────────────
  trackShipment: async (awb) => {
    const res = await fetch(`${PROXY_BASE}/track/${awb}`);
    if (!res.ok) throw new Error(`Track proxy error ${res.status}`);
    return res.json();
  },

  // ─── Composite: Full Order Sync (create → AWB → label) ────────────────────
  syncOrder: async (order, formData) => {
    console.log('🚀 Syncing order to Shiprocket:', order.id);

    // 1. Create order
    const createRes = await shiprocketApi.createOrder(order, formData);
    console.log('📦 Shiprocket create-order response:', createRes);

    if (!createRes.shipment_id) {
      throw new Error(
        createRes.message ||
          createRes.error ||
          'Shiprocket order creation failed'
      );
    }

    const shipmentId = createRes.shipment_id;
    const shiprocketOrderId = createRes.order_id;

    // 2. Assign AWB (small delay so Shiprocket processes the order first)
    await delay(3000);
    const awbRes = await shiprocketApi.assignAwb(shipmentId);
    console.log('📬 Shiprocket AWB response:', awbRes);

    const awb =
      awbRes?.response?.data?.awb_code ||
      awbRes?.awb_code ||
      null;
    const courierName =
      awbRes?.response?.data?.courier_name ||
      awbRes?.courier_name ||
      'Shiprocket Courier';

    // 3. Generate label
    let labelUrl = null;
    if (awb) {
      try {
        await delay(2000);
        const labelRes = await shiprocketApi.generateLabel(shipmentId);
        console.log('🏷️ Shiprocket label response:', labelRes);
        labelUrl =
          labelRes?.label_url ||
          labelRes?.others?.label_url ||
          null;
      } catch (labelErr) {
        console.warn('Label generation failed (non-critical):', labelErr);
      }
    }

    return {
      awb,
      courierName,
      labelUrl,
      shipmentId,
      shiprocketOrderId,
    };
  },
};

export default shiprocketApi;
