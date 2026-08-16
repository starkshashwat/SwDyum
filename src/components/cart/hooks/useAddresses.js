import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';

/**
 * Fetch and manage saved addresses from Supabase for the current user.
 * Used by AddressSection to display saved addresses for one-tap selection.
 */
export default function useAddresses(currentUser) {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [error, setError] = useState(null);

    const fetchAddresses = useCallback(async () => {
        if (!currentUser || !currentUser.id) {
            setAddresses([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchErr } = await supabase
                .from('addresses')
                .select('*')
                .eq('customer_id', currentUser.id)
                .order('is_default', { ascending: false })
                .order('created_at', { ascending: false });

            if (fetchErr) throw fetchErr;
            setAddresses(data || []);
            // Auto-select the default address only if nothing is selected.
            // Functional form avoids the stale selectedAddress closure.
            const defaultAddr = (data || []).find((a) => a.is_default);
            setSelectedAddress((prev) => prev ?? defaultAddr ?? null);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    const selectAddress = useCallback((address) => {
        setSelectedAddress(address);
    }, []);

    const saveNewAddress = useCallback(async (formData) => {
        if (!currentUser || !currentUser.id) return null;
        setError(null);
        try {
            if (formData.is_default) {
                await supabase
                    .from('addresses')
                    .update({ is_default: false })
                    .eq('customer_id', currentUser.id);
            }
            const payload = {
                customer_id: currentUser.id,
                label: formData.label || 'Home',
                full_name: formData.full_name,
                phone: formData.phone,
                email: formData.email || '',
                house_number: formData.house_number || '',
                street: formData.street,
                area: formData.area || '',
                city: formData.city,
                state: formData.state,
                pin_code: formData.pin_code,
                country: 'India',
                is_default: formData.is_default || addresses.length === 0,
            };
            const { data, error: insertErr } = await supabase.from('addresses').insert([payload]).select().single();
            if (insertErr) throw insertErr;
            await fetchAddresses();
            setSelectedAddress(data);
            return data;
        } catch (e) {
            setError(e.message);
            return null;
        }
    }, [currentUser, addresses.length, fetchAddresses]);

    return {
        addresses,
        loading,
        selectedAddress,
        error,
        selectAddress,
        saveNewAddress,
        refreshAddresses: fetchAddresses,
    };
}