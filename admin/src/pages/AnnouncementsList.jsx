import { useState } from 'react';
import { Megaphone, Plus, Edit2, Trash2, Check, X, Clock } from 'lucide-react';

export default function AnnouncementsList() {
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      text: 'Free shipping on all orders over ₹999!',
      type: 'Shipping',
      status: 'Active',
      endDate: null
    },
    {
      id: 2,
      text: 'Use code DIWALI20 for 20% off all pickles!',
      type: 'Offer',
      status: 'Scheduled',
      endDate: '2026-10-31'
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcement Bar</h1>
          <p className="text-sm text-gray-500">Manage the scrolling text banner at the top of your website.</p>
        </div>
        <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium text-sm">
          <Plus className="w-4 h-4" /> Add Announcement
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
                <th className="p-4 w-1/2">Announcement Text</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {announcements.map((announcement) => (
                <tr key={announcement.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-start gap-3">
                      <Megaphone className="w-5 h-5 text-purple-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">{announcement.text}</p>
                        {announcement.endDate && (
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Ends {new Date(announcement.endDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">
                    {announcement.type}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      announcement.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {announcement.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button className="p-2 text-gray-400 hover:text-black rounded-md hover:bg-gray-100 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
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
