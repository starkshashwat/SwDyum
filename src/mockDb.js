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
    // Check if id is a UUID (meaning it's a Supabase Auth User ID)
    if (isUuid(customerId)) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(updatedFields)
          .eq('id', customerId)
          .select()
          .single();

        if (!error && data) {
          return data;
        }
      } catch (e) {
        // Fallback to local update
      }
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
        return {
          ...data,
          items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items,
          shippingDetails: typeof data.shipping_details === 'string' ? JSON.parse(data.shipping_details) : data.shipping_details,
          paymentMethod: data.payment_method
        };
      }
    } catch (e) {
      // Fallback to local
    }

    // Local fallback
    const orders = mockDb.getLocalOrders();
    return orders.find(o => o.id === orderId) || null;
  },

  createOrder: async (orderData) => {
    const orders = mockDb.getLocalOrders();
    const orderId = 'ord_' + (1000 + orders.length + 1);
    
    const newOrder = {
      id: orderId,
      date: new Date().toISOString(),
      status: "Processing",
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
          shipping_details: orderData.shippingDetails
        };

        const { error } = await supabase
          .from('orders')
          .insert([supabaseOrder]);

        if (error) {
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
