import { supabase } from './supabaseClient';

const CUSTOMERS_KEY = 'swadyum_customers';
const ORDERS_KEY = 'swadyum_orders';

// Seed default customers if empty (Local Fallback Database)
const seedCustomers = () => {
  if (!localStorage.getItem(CUSTOMERS_KEY)) {
    const defaultCustomers = [
      {
        id: "cust_01",
        name: "Siddharth Raj",
        email: "siddharth@gmail.com",
        password: "password123",
        phone: "+91 98765 43210",
        address: "402, Heritage Plaza, Fraser Road",
        city: "Patna",
        state: "Bihar",
        zip: "800001"
      }
    ];
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(defaultCustomers));
  }
};

const seedOrders = () => {
  if (!localStorage.getItem(ORDERS_KEY)) {
    const defaultOrders = [
      {
        id: "ord_1001",
        customerId: "cust_01",
        date: "2026-06-15T10:30:00.000Z",
        items: [
          { slug: "mango-pickle", name: "Swadyum Mango Pickle", weight: "250g", price: 289, quantity: 2, image: "/prod_mango.png" }
        ],
        subtotal: 578,
        shipping: 50,
        total: 628,
        status: "Delivered",
        paymentMethod: "Cash on Delivery",
        shippingDetails: {
          name: "Siddharth Raj",
          address: "402, Heritage Plaza, Fraser Road",
          city: "Patna",
          state: "Bihar",
          zip: "800001"
        }
      }
    ];
    localStorage.setItem(ORDERS_KEY, JSON.stringify(defaultOrders));
  }
};

seedCustomers();
seedOrders();

// Check if string is UUID
const isUuid = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const mockDb = {
  // Local CRUD utilities (used as fallbacks)
  getLocalCustomers: () => {
    return JSON.parse(localStorage.getItem(CUSTOMERS_KEY)) || [];
  },

  getLocalOrders: () => {
    return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
  },

  saveLocalCustomer: (customerData) => {
    const customers = mockDb.getLocalCustomers();
    const existingIdx = customers.findIndex(c => c.id === customerData.id || c.email.toLowerCase() === customerData.email.toLowerCase());
    
    if (existingIdx > -1) {
      customers[existingIdx] = { ...customers[existingIdx], ...customerData };
    } else {
      customers.push(customerData);
    }
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  },

  saveLocalOrder: (orderData) => {
    const orders = mockDb.getLocalOrders();
    orders.push(orderData);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  },

  updateLocalOrder: (updatedOrder) => {
    const orders = mockDb.getLocalOrders();
    const idx = orders.findIndex((o) => o.id === updatedOrder.id);
    if (idx > -1) {
      orders[idx] = { ...orders[idx], ...updatedOrder };
    } else {
      orders.push(updatedOrder);
    }
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  },

  // Auth Operations
  loginCustomer: async (email, password) => {
    try {
      // 1. Try Authenticating with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        // Fallback to local storage credentials check
        const localCustomers = mockDb.getLocalCustomers();
        const localUser = localCustomers.find(
          c => c.email.toLowerCase() === email.toLowerCase() && c.password === password
        );
        if (localUser) {
          const { password: _, ...userNoPassword } = localUser;
          return userNoPassword;
        }
        return { error: error.message };
      }

      const user = data.user;
      
      // 2. Fetch profile details from Profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        // If profile table fails (e.g. table doesn't exist yet), return mock/metadata profile
        return {
          id: user.id,
          name: user.user_metadata?.name || 'Valued Customer',
          email: user.email,
          phone: user.user_metadata?.phone || '',
          address: '',
          city: '',
          state: '',
          zip: ''
        };
      }

      return profile;
    } catch (err) {
      return { error: err.message };
    }
  },

  registerCustomer: async (customerData) => {
    try {
      // 1. Sign up user via Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: customerData.email,
        password: customerData.password,
        options: {
          data: {
            name: customerData.name,
            phone: customerData.phone
          }
        }
      });

      if (error) {
        return { error: error.message };
      }

      const user = data.user;
      
      // 2. Try inserting a row into the public profiles table
      const profile = {
        id: user.id,
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        address: '',
        city: '',
        state: '',
        zip: ''
      };

      const { error: insertError } = await supabase
        .from('profiles')
        .insert([profile]);

      if (insertError) {
        // Table probably doesn't exist. Fall back to local storage profile registry.
        mockDb.saveLocalCustomer(profile);
      }

      return profile;
    } catch (err) {
      return { error: err.message };
    }
  },

  updateCustomer: async (customerId, updatedFields) => {
    // Attempt Edge Function update first (bypasses RLS, covers both UUIDs and WhatsApp phone numbers)
    try {
      const response = await fetch('https://dligrptvajjsbzlcpjsk.supabase.co/functions/v1/whatsapp-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'update_profile',
          id: customerId,
          ...updatedFields
        })
      });

      const result = await response.json();

      if (response.ok && result.data) {
        // Also update local storage session if it exists
        const saved = localStorage.getItem('swadyum_current_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.id === customerId) {
            localStorage.setItem('swadyum_current_user', JSON.stringify(result.data));
          }
        }
        return result.data;
      } else {
        console.error('Edge function update failed:', result.error);
      }
    } catch (e) {
      console.error('Update error:', e);
      // Fallback to local update below
    }

    // Fallback to local storage update
    const customers = mockDb.getLocalCustomers();
    const idx = customers.findIndex(c => c.id === customerId);
    if (idx > -1) {
      customers[idx] = { ...customers[idx], ...updatedFields };
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
      return customers[idx];
    }
    return null;
  },

  // Orders Operations
  getOrdersByCustomer: async (customerId) => {
    if (isUuid(customerId)) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_id', customerId);

        if (!error && data) {
          // Format jsonb fields if returned as string
          return data.map(o => ({
            ...o,
            items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items,
            shippingDetails: typeof o.shipping_details === 'string' ? JSON.parse(o.shipping_details) : o.shipping_details,
            paymentMethod: o.payment_method
          }));
        }
      } catch (e) {
        // Fallback to local
      }
    }

    // Local fallback
    const orders = mockDb.getLocalOrders();
    return orders.filter(o => o.customerId === customerId);
  },

  getOrderById: async (orderId) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (!error && data) {
        const parsedOrder = {
          ...data,
          items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items,
          shippingDetails: typeof data.shipping_details === 'string' ? JSON.parse(data.shipping_details) : data.shipping_details,
          paymentMethod: data.payment_method,
          trackingId: data.tracking_id || null,
          courierName: data.courier_name || 'BlueDart Express'
        };

        // Attach realistic Shiprocket tracking history checkpoints if tracking ID exists
        if (parsedOrder.trackingId) {
          const baseDate = new Date(parsedOrder.date);
          parsedOrder.trackingHistory = [
            { checkpoint: "Patna Warehouse", status: "Shipment details uploaded & package picked up by courier", time: new Date(baseDate.getTime() + 1000 * 60 * 30).toISOString() },
            { checkpoint: "Patna Terminal Hub", status: "Sorted and dispatched to regional airport hub", time: new Date(baseDate.getTime() + 1000 * 60 * 120).toISOString() },
            { checkpoint: "In Transit", status: "Flight departed, package in route to destination city", time: new Date(baseDate.getTime() + 1000 * 60 * 240).toISOString() }
          ];

          if (parsedOrder.status.toLowerCase() === 'delivered') {
            parsedOrder.trackingHistory.push({
              checkpoint: "Doorstep Delivery",
              status: "Shipment delivered successfully with OTP authentication",
              time: new Date(baseDate.getTime() + 1000 * 60 * 480).toISOString()
            });
          }
        }
        return parsedOrder;
      }
    } catch (e) {
      // Fallback to local
    }

    // Local fallback
    const orders = mockDb.getLocalOrders();
    const localOrder = orders.find(o => o.id === orderId) || null;
    if (localOrder) {
      if (!localOrder.trackingId) {
        localOrder.trackingId = `SR-AWB-${Math.floor(Math.random() * 900000 + 100000)}`;
        localOrder.courierName = 'Shiprocket (BlueDart Express)';
      }
      const baseDate = new Date(localOrder.date);
      localOrder.trackingHistory = [
        { checkpoint: "Patna Warehouse", status: "Package picked up by courier", time: new Date(baseDate.getTime() + 1000 * 60 * 30).toISOString() },
        { checkpoint: "Patna Terminal Hub", status: "Sorted and dispatched to regional airport hub", time: new Date(baseDate.getTime() + 1000 * 60 * 120).toISOString() },
        { checkpoint: "In Transit", status: "Flight departed, package in route to destination city", time: new Date(baseDate.getTime() + 1000 * 60 * 240).toISOString() }
      ];
    }
    return localOrder;
  },

  createOrder: async (orderData) => {
    const orders = mockDb.getLocalOrders();
    const orderId = 'ord_' + (1000 + orders.length + 1);
    
    const newOrder = {
      id: orderId,
      date: new Date().toISOString(),
      status: "Processing",
      trackingId: `SR-AWB-${Math.floor(Math.random() * 900000 + 100000)}`,
      courierName: 'Shiprocket (BlueDart Express)',
      ...orderData
    };

    // If customer is a logged-in Supabase user, insert into Supabase orders table
    if (orderData.customerId && isUuid(orderData.customerId)) {
      try {
        const supabaseOrder = {
          id: orderId,
          customer_id: orderData.customerId,
          date: newOrder.date,
          items: orderData.items,
          subtotal: orderData.subtotal,
          shipping: orderData.shipping,
          total: orderData.total,
          status: "Processing",
          payment_method: orderData.paymentMethod,
          shipping_details: orderData.shippingDetails,
          tracking_id: newOrder.trackingId,
          courier_name: newOrder.courierName
        };

        const { error } = await supabase
          .from('orders')
          .insert([supabaseOrder]);

        if (!error) {
          // Trigger the Edge Function call asynchronously to sync with Shiprocket
          supabase.functions.invoke('shiprocket-sync', {
            body: { orderId: orderId }
          }).then(({ data, error: fnError }) => {
            if (fnError || !data || !data.success) {
              console.log("Supabase function call skipped/failed. Running in mock tracking mode.");
            }
          }).catch(() => {
            // fail silently, falls back to pre-seeded mock tracking
          });
        } else {
          // Fall back to saving locally
          mockDb.saveLocalOrder(newOrder);
        }
      } catch (e) {
        mockDb.saveLocalOrder(newOrder);
      }
    } else {
      mockDb.saveLocalOrder(newOrder);
    }

    return newOrder;
  }
};
