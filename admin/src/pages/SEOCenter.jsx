import { useState } from 'react';
import { Search, Globe, Link as LinkIcon, ShieldAlert, CheckCircle, Smartphone } from 'lucide-react';

export default function SEOCenter() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SEO Center</h1>
          <p className="text-sm text-gray-500">Manage search engine visibility and metadata.</p>
        </div>
      </div>

      {/* SEO Health Score */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
              <circle cx="48" cy="48" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="226" strokeDashoffset="45" className="text-green-500" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-bold text-gray-900">80</span>
              <span className="text-[10px] font-bold text-green-500 uppercase">Good</span>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Overall SEO Health</h2>
            <p className="text-sm text-gray-500 mt-1 max-w-md">Your site is well-optimized. There are a few missing meta descriptions on older products that need attention.</p>
          </div>
        </div>
        <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm">
          Run Full Audit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Navigation / Sections */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <button className="w-full text-left px-4 py-3 bg-gray-50 border-b border-gray-200 font-medium text-gray-900 flex items-center gap-3">
              <Globe className="w-5 h-5 text-blue-500" /> Global Settings
            </button>
            <button className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-200 font-medium text-gray-700 flex items-center gap-3 transition-colors">
              <Search className="w-5 h-5 text-gray-400" /> Product SEO
            </button>
            <button className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-200 font-medium text-gray-700 flex items-center gap-3 transition-colors">
              <LinkIcon className="w-5 h-5 text-gray-400" /> Redirect Manager
            </button>
            <button className="w-full text-left px-4 py-3 hover:bg-gray-50 font-medium text-gray-700 flex items-center gap-3 transition-colors">
              <Smartphone className="w-5 h-5 text-gray-400" /> Mobile Usability
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-bold text-gray-900">Global SEO Settings</h3>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Homepage Title Tag</label>
                <input 
                  type="text" 
                  defaultValue="Swadyum | Authentic Homemade Indian Pickles"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                />
                <p className="text-xs text-gray-500 text-right">45 / 60 characters</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Homepage Meta Description</label>
                <textarea 
                  rows={3}
                  defaultValue="Discover the true taste of India with Swadyum's handcrafted pickles and murabbas. Made with cold-pressed oils and organic spices."
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                />
                <p className="text-xs text-gray-500 text-right">129 / 160 characters</p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500" /> Sitemap auto-generates daily
                </div>
                <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors font-medium text-sm">
                  Save Changes
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
