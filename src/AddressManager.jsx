import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function AddressManager({ customerId }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    label: 'Home',
    full_name: '',
    phone: '',
    email: '',
    house_number: '',
    street: '',
    area: '',
    city: '',
    state: '',
    pin_code: '',
    is_default: false
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (customerId) fetchAddresses();
  }, [customerId]);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('customer_id', customerId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (address = null) => {
    setError('');
    if (address) {
      setEditingAddress(address);
      setFormData(address);
    } else {
      setEditingAddress(null);
      setFormData({
        label: 'Home',
        full_name: '',
        phone: '',
        email: '',
        house_number: '',
        street: '',
        area: '',
        city: '',
        state: '',
        pin_code: '',
        is_default: addresses.length === 0
      });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Validate
      if (!formData.full_name || !formData.phone || !formData.street || !formData.city || !formData.state || !formData.pin_code) {
        throw new Error('Please fill all required fields');
      }

      const payload = {
        ...formData,
        customer_id: customerId,
        country: 'India'
      };

      if (formData.is_default) {
        // Unset others
        await supabase.from('addresses').update({ is_default: false }).eq('customer_id', customerId);
      }

      if (editingAddress) {
        const { error: updateErr } = await supabase.from('addresses').update(payload).eq('id', editingAddress.id);
        if (updateErr) throw updateErr;
      } else {
        const { error: insertErr } = await supabase.from('addresses').insert([payload]);
        if (insertErr) throw insertErr;
      }

      setIsFormOpen(false);
      fetchAddresses();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await supabase.from('addresses').delete().eq('id', id);
      fetchAddresses();
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  const setAsDefault = async (id) => {
    try {
      await supabase.from('addresses').update({ is_default: false }).eq('customer_id', customerId);
      await supabase.from('addresses').update({ is_default: true }).eq('id', id);
      fetchAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-4 text-center text-gray-500">Loading addresses...</div>;

  return (
    <div className="space-y-6">
      {!isFormOpen && (
        <div className="flex justify-end">
          <button 
            onClick={() => handleOpenForm()}
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 text-sm font-medium"
          >
            + Add New Address
          </button>
        </div>
      )}

      {isFormOpen ? (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="font-bold text-lg mb-4">{editingAddress ? 'Edit Address' : 'New Address'}</h3>
          
          {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Full Name *</label>
                <input type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-black focus:outline-none" required />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Label (e.g. Home, Office)</label>
                <input type="text" value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-black focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Phone Number *</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-black focus:outline-none" required />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-black focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">House/Apt Number</label>
                <input type="text" value={formData.house_number} onChange={e => setFormData({...formData, house_number: e.target.value})} className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-black focus:outline-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-gray-700 font-medium mb-1">Street Address *</label>
                <input type="text" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-black focus:outline-none" required />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Area / Locality</label>
                <input type="text" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-black focus:outline-none" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">City *</label>
                <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-black focus:outline-none" required />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">State *</label>
                <input type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-black focus:outline-none" required />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">PIN Code *</label>
              <input type="text" value={formData.pin_code} onChange={e => setFormData({...formData, pin_code: e.target.value})} className="w-1/3 border border-gray-300 p-2 rounded focus:ring-2 focus:ring-black focus:outline-none" required />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="is_default" checked={formData.is_default} onChange={e => setFormData({...formData, is_default: e.target.checked})} className="w-4 h-4" />
              <label htmlFor="is_default" className="text-gray-700 cursor-pointer">Set as default address</label>
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button type="submit" disabled={saving} className="bg-black text-white px-6 py-2 rounded font-medium disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Address'}
              </button>
              <button type="button" onClick={() => setIsFormOpen(false)} className="text-gray-600 hover:text-black font-medium">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.length === 0 ? (
            <div className="col-span-2 text-center p-8 bg-gray-50 rounded-lg text-gray-500 border border-gray-200">
              You haven't saved any addresses yet.
            </div>
          ) : (
            addresses.map(addr => (
              <div key={addr.id} className={`p-4 rounded-lg border ${addr.is_default ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{addr.full_name}</span>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{addr.label}</span>
                    {addr.is_default && <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full">Default</span>}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mt-2">
                  {[addr.house_number, addr.street, addr.area].filter(Boolean).join(', ')}<br />
                  {addr.city}, {addr.state} {addr.pin_code}
                </p>
                <p className="text-sm text-gray-600 mt-1">Phone: {addr.phone}</p>
                
                <div className="flex gap-3 mt-4 pt-3 border-t border-gray-100 text-sm font-medium">
                  <button onClick={() => handleOpenForm(addr)} className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button onClick={() => handleDelete(addr.id)} className="text-red-600 hover:text-red-800">Delete</button>
                  {!addr.is_default && (
                    <button onClick={() => setAsDefault(addr.id)} className="text-gray-500 hover:text-black ml-auto">Set as Default</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
