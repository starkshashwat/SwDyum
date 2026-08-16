import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function ShippingSettings() {
    const [activeTab, setActiveTab] = useState('credentials');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Credentials State
    const [credentialStatus, setCredentialStatus] = useState(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Warehouses State
    const [warehouses, setWarehouses] = useState([]);
    const [warehouseForm, setWarehouseForm] = useState(null);
    const [syncingWarehouseId, setSyncingWarehouseId] = useState(null);

    // Dimension Presets State
    const [presets, setPresets] = useState([]);
    const [presetForm, setPresetForm] = useState(null);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const invokeShipping = async (payload) => {
        const { data: { session } } = await supabase.auth.getSession();
        const headers = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
        const res = await supabase.functions.invoke('shipping', { body: payload, headers });
        if (res.error) {
            let message = res.error.message;
            try {
                const body = await res.error.context?.json();
                if (body?.error) message = body.error;
            } catch {}
            throw new Error(message || 'Failed to execute shipping function');
        }
        if (res.data?.error) {
            throw new Error(res.data.error);
        }
        return res.data;
    };

    const loadData = async () => {
        try {
            setLoading(true);
            setError('');
            if (activeTab === 'credentials') {
                const data = await invokeShipping({ action: 'credential_status' });
                setCredentialStatus(data.data || data);
            } else if (activeTab === 'warehouses') {
                const { data, error } = await supabase
                    .from('warehouses')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (error) throw error;
                setWarehouses(data || []);
            } else if (activeTab === 'presets') {
                const { data, error } = await supabase
                    .from('package_dimension_presets')
                    .select('*')
                    .order('sort_order', { ascending: true });
                if (error) throw error;
                setPresets(data || []);
            }
        } catch (err) {
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCredentials = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            setSuccessMsg('');
            await invokeShipping({ action: 'save_credentials', username, password });
            setUsername('');
            setPassword('');
            setSuccessMsg('Velocity credentials saved and encrypted successfully.');
            loadData();
        } catch (err) {
            setError(err.message || 'Failed to save credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleTestConnection = async () => {
        try {
            setLoading(true);
            setError('');
            setSuccessMsg('');
            const data = await invokeShipping({ action: 'test_connection' });
            if (data.status === 'connected') {
                setSuccessMsg(data.message || 'Successfully connected to Velocity API.');
            } else {
                setError(data.message || 'Connection test failed.');
            }
            loadData();
        } catch (err) {
            setError(err.message || 'Test failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveWarehouse = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');

            if (warehouseForm.is_default) {
                // If making this default, unset others
                let query = supabase.from('warehouses').update({ is_default: false });
                if (warehouseForm.id) {
                    query = query.neq('id', warehouseForm.id);
                } else {
                    query = query.neq('id', '00000000-0000-0000-0000-000000000000'); // dummy to apply to all
                }
                await query;
            }

            if (warehouseForm.id) {
                const { error } = await supabase
                    .from('warehouses')
                    .update(warehouseForm)
                    .eq('id', warehouseForm.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('warehouses')
                    .insert([warehouseForm]);
                if (error) throw error;
            }
            setWarehouseForm(null);
            setSuccessMsg('Warehouse saved.');
            loadData();
        } catch (err) {
            setError(err.message || 'Failed to save warehouse.');
        } finally {
            setLoading(false);
        }
    };

    const handleSyncWarehouse = async (warehouseId) => {
        try {
            setSyncingWarehouseId(warehouseId);
            setError('');
            setSuccessMsg('');
            const data = await invokeShipping({ action: 'sync_warehouse', warehouse_id: warehouseId });
            setSuccessMsg(`Warehouse synced to Velocity. ID: ${data.velocity_warehouse_id}`);
            loadData();
        } catch (err) {
            setError(err.message || 'Failed to sync warehouse to Velocity.');
        } finally {
            setSyncingWarehouseId(null);
        }
    };

    const handleSavePreset = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            if (presetForm.id) {
                const { error } = await supabase
                    .from('package_dimension_presets')
                    .update(presetForm)
                    .eq('id', presetForm.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('package_dimension_presets')
                    .insert([presetForm]);
                if (error) throw error;
            }
            setPresetForm(null);
            setSuccessMsg('Preset saved.');
            loadData();
        } catch (err) {
            setError(err.message || 'Failed to save preset.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePreset = async (id) => {
        if (!confirm('Are you sure you want to delete this preset?')) return;
        try {
            setLoading(true);
            const { error } = await supabase
                .from('package_dimension_presets')
                .delete()
                .eq('id', id);
            if (error) throw error;
            setSuccessMsg('Preset deleted.');
            loadData();
        } catch (err) {
            setError(err.message || 'Failed to delete.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Shipping Settings (Velocity)</h1>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                    {error}
                </div>
            )}
            {successMsg && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
                    {successMsg}
                </div>
            )}

            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {['credentials', 'warehouses', 'presets'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === tab
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </nav>
            </div>

            {/* CREDENTIALS TAB */}
            {activeTab === 'credentials' && (
                <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Velocity Account Credentials</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Enter your Velocity (ShipFast) account username and password. These are encrypted at rest and used to obtain a short-lived auth token for all API calls.
                    </p>
                    
                    {credentialStatus && credentialStatus.status !== 'not_configured' && (
                        <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">Username (last 4):</span>
                                <span className="text-sm font-mono bg-white px-2 py-1 border rounded">{credentialStatus.key_masked}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">Connection Status:</span>
                                <span>
                                    {credentialStatus.test_status === 'connected' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Connected</span>}
                                    {credentialStatus.test_status === 'invalid_key' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Invalid Credentials</span>}
                                    {credentialStatus.test_status === 'error' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Connection Error</span>}
                                    {!credentialStatus.test_status && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Untested</span>}
                                </span>
                            </div>
                            {credentialStatus.last_tested_at && (
                                <div className="text-xs text-gray-500">Last tested: {new Date(credentialStatus.last_tested_at).toLocaleString()}</div>
                            )}
                            {credentialStatus.updated_by && (
                                <div className="text-xs text-gray-500 mt-1">Last updated by: {credentialStatus.updated_by}</div>
                            )}
                            
                            <div className="mt-4">
                                <button onClick={handleTestConnection} disabled={loading} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    {loading ? 'Testing...' : 'Test Connection'}
                                </button>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSaveCredentials} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Velocity Username (Phone Number)</label>
                            <input 
                                type="text" 
                                required
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                                placeholder="e.g. 9876543210"
                                autoComplete="off"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Velocity Password</label>
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                                placeholder="Enter password"
                                autoComplete="new-password"
                            />
                        </div>
                        <button type="submit" disabled={loading || !username || !password} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                            {loading ? 'Saving...' : 'Save & Encrypt Credentials'}
                        </button>
                    </form>
                </div>
            )}

            {/* WAREHOUSES TAB */}
            {activeTab === 'warehouses' && (
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-900">Warehouses / Pickups</h2>
                        <button onClick={() => setWarehouseForm({})} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700">Add Warehouse</button>
                    </div>

                    {warehouseForm ? (
                        <form onSubmit={handleSaveWarehouse} className="border p-4 rounded-md mb-6 grid grid-cols-2 gap-4 bg-gray-50">
                            <div className="col-span-2"><h3 className="font-medium text-gray-900">{warehouseForm.id ? 'Edit' : 'Add'} Warehouse</h3></div>
                            <div><label className="block text-sm text-gray-700">Name</label><input required value={warehouseForm.name || ''} onChange={e=>setWarehouseForm({...warehouseForm, name: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded px-3 py-1" /></div>
                            <div><label className="block text-sm text-gray-700">Pickup Location (Alias)</label><input value={warehouseForm.pickup_location || ''} onChange={e=>setWarehouseForm({...warehouseForm, pickup_location: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded px-3 py-1" /></div>
                            <div><label className="block text-sm text-gray-700">Phone</label><input value={warehouseForm.phone || ''} onChange={e=>setWarehouseForm({...warehouseForm, phone: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded px-3 py-1" /></div>
                            <div><label className="block text-sm text-gray-700">Email</label><input type="email" value={warehouseForm.email || ''} onChange={e=>setWarehouseForm({...warehouseForm, email: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded px-3 py-1" /></div>
                            <div><label className="block text-sm text-gray-700">Address</label><input value={warehouseForm.address || ''} onChange={e=>setWarehouseForm({...warehouseForm, address: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded px-3 py-1" /></div>
                            <div><label className="block text-sm text-gray-700">City</label><input value={warehouseForm.city || ''} onChange={e=>setWarehouseForm({...warehouseForm, city: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded px-3 py-1" /></div>
                            <div><label className="block text-sm text-gray-700">State</label><input value={warehouseForm.state || ''} onChange={e=>setWarehouseForm({...warehouseForm, state: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded px-3 py-1" /></div>
                            <div><label className="block text-sm text-gray-700">Pincode</label><input required value={warehouseForm.pincode || ''} onChange={e=>setWarehouseForm({...warehouseForm, pincode: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded px-3 py-1" /></div>
                            <div className="col-span-2 flex items-center">
                                <input type="checkbox" checked={warehouseForm.is_default || false} onChange={e=>setWarehouseForm({...warehouseForm, is_default: e.target.checked})} className="mr-2" id="is_default" />
                                <label htmlFor="is_default" className="text-sm text-gray-700">Set as Default Warehouse</label>
                            </div>
                            <div className="col-span-2 flex justify-end space-x-2 mt-2">
                                <button type="button" onClick={() => setWarehouseForm(null)} className="px-4 py-2 border rounded text-sm hover:bg-gray-100">Cancel</button>
                                <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700">Save</button>
                            </div>
                        </form>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City/Pin</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Velocity ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Default</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {warehouses.map(w => (
                                        <tr key={w.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{w.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{w.city}, {w.pincode}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {w.velocity_warehouse_id ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">{w.velocity_warehouse_id}</span>
                                                ) : (
                                                    <span className="text-gray-400 italic">Not synced</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {w.is_default && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Default</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                                <button onClick={() => setWarehouseForm(w)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                                <button 
                                                    onClick={() => handleSyncWarehouse(w.id)} 
                                                    disabled={syncingWarehouseId === w.id}
                                                    className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                                                >
                                                    {syncingWarehouseId === w.id ? 'Syncing...' : 'Sync to Velocity'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {warehouses.length === 0 && (
                                        <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No warehouses configured.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* PRESETS TAB */}
            {activeTab === 'presets' && (
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-900">Package Dimension Presets (Weight Based)</h2>
                        <button onClick={() => setPresetForm({})} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700">Add Preset</button>
                    </div>

                    {presetForm ? (
                        <form onSubmit={handleSavePreset} className="border p-4 rounded-md mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50">
                            <div className="col-span-full"><h3 className="font-medium text-gray-900">{presetForm.id ? 'Edit' : 'Add'} Preset</h3></div>
                            <div className="col-span-2"><label className="block text-sm text-gray-700">Label (e.g. 0 to 0.5 kg)</label><input required value={presetForm.label || ''} onChange={e=>setPresetForm({...presetForm, label: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded px-3 py-1" /></div>
                            <div><label className="block text-sm text-gray-700">Sort Order</label><input type="number" required value={presetForm.sort_order || 0} onChange={e=>setPresetForm({...presetForm, sort_order: parseInt(e.target.value)})} className="mt-1 block w-full border border-gray-300 rounded px-3 py-1" /></div>
                            <div><label className="block text-sm text-gray-700">Default?</label><input type="checkbox" checked={presetForm.is_default || false} onChange={e=>setPresetForm({...presetForm, is_default: e.target.checked})} className="mt-3" /></div>
                            
                            <div><label className="block text-sm text-gray-700">Min Wt (kg)</label><input type="number" step="0.001" required value={presetForm.min_weight_kg || ''} onChange={e=>setPresetForm({...presetForm, min_weight_kg: parseFloat(e.target.value)})} className="mt-1 block w-full border border-gray-300 rounded px-3 py-1" /></div>
                            <div><label className="block text-sm text-gray-700">Max Wt (kg)</label><input type="number" step="0.001" required value={presetForm.max_weight_kg || ''} onChange={e=>setPresetForm({...presetForm, max_weight_kg: parseFloat(e.target.value)})} className="mt-1 block w-full border border-gray-300 rounded px-3 py-1" /></div>
                            <div><label className="block text-sm text-gray-700">Length (cm)</label><input type="number" step="0.1" required value={presetForm.length_cm || ''} onChange={e=>setPresetForm({...presetForm, length_cm: parseFloat(e.target.value)})} className="mt-1 block w-full border border-gray-300 rounded px-3 py-1" /></div>
                            <div><label className="block text-sm text-gray-700">Breadth (cm)</label><input type="number" step="0.1" required value={presetForm.breadth_cm || ''} onChange={e=>setPresetForm({...presetForm, breadth_cm: parseFloat(e.target.value)})} className="mt-1 block w-full border border-gray-300 rounded px-3 py-1" /></div>
                            <div><label className="block text-sm text-gray-700">Height (cm)</label><input type="number" step="0.1" required value={presetForm.height_cm || ''} onChange={e=>setPresetForm({...presetForm, height_cm: parseFloat(e.target.value)})} className="mt-1 block w-full border border-gray-300 rounded px-3 py-1" /></div>
                            
                            <div className="col-span-full flex justify-end space-x-2 mt-2">
                                <button type="button" onClick={() => setPresetForm(null)} className="px-4 py-2 border rounded text-sm hover:bg-gray-100">Cancel</button>
                                <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700">Save</button>
                            </div>
                        </form>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight Range (kg)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dimensions (L×B×H)</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {presets.map(p => (
                                        <tr key={p.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.sort_order}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.label}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.min_weight_kg} - {p.max_weight_kg}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.length_cm} × {p.breadth_cm} × {p.height_cm} cm</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                                <button onClick={() => setPresetForm(p)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                                <button onClick={() => handleDeletePreset(p.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {presets.length === 0 && (
                                        <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No presets configured.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
