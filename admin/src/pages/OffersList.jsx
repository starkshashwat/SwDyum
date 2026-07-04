import { useState } from 'react';
import { Percent, Clock, Plus, Edit2, Trash2, Check, X } from 'lucide-react';

export default function OffersList() {
  // Mock data for UI presentation since Offers table isn't fully scaffolded in backend yet
  const [offers, setOffers] = useState([
    {
      id: 1,
      name: 'Summer Mega Sale',
      type: 'Percentage',
      value: '15%',
      target: 'All Products',
      status: 'Active',
      endDate: '2026-08-31'
    },
    {
      id: 2,
      name: 'Buy 2 Get 1 Free on Mango Pickle',
      type: 'BOGO',
      value: 'Buy 2 Get 1',
      target: 'Signature Mango Pickle',
      status: 'Scheduled',
      endDate: '2026-10-15'
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offers & Promotions</h1>
          <p className="text-sm text-gray-500">Manage site-wide automatic discounts and flash sales.</p>
        </div>
        <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium text-sm">
          <Plus className="w-4 h-4" /> Create Offer
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
                <th className="p-4">Offer Name</th>
                <th className="p-4">Type & Value</th>
                <th className="p-4">Applies To</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {offers.map((offer) => (
                <tr key={offer.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <span className="font-bold text-gray-900">{offer.name}</span>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Ends {new Date(offer.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-4 font-medium text-gray-900">
                    <span className="flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-1 rounded w-fit">
                      <Percent className="w-3 h-3" /> {offer.type}: {offer.value}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">
                    {offer.target}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      offer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {offer.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button className="p-2 text-gray-400 hover:text-black rounded-md hover:bg-gray-100 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
