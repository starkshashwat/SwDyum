import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, Search, Download, Printer, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PAGE_SIZE = 20;

export default function InvoicesList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => { fetchInvoices(); }, [page, searchTerm, dateFrom, dateTo]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('invoices')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (searchTerm.trim()) {
        query = query.or(`invoice_number.ilike.%${searchTerm.trim()}%,order_id.ilike.%${searchTerm.trim()}%,customer_name.ilike.%${searchTerm.trim()}%`);
      }
      if (dateFrom) query = query.gte('invoice_date', new Date(dateFrom).toISOString());
      if (dateTo) {
        const end = new Date(dateTo); end.setHours(23,59,59,999);
        query = query.lte('invoice_date', end.toISOString());
      }

      const from = page * PAGE_SIZE;
      query = query.range(from, from + PAGE_SIZE - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      setInvoices(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const generatePDF = (inv) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('SWADYUM', 14, 22);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Authentic Bihari Pickles', 14, 28);
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('TAX INVOICE', 140, 22);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: ${inv.invoice_number}`, 140, 32);
    doc.text(`Date: ${format(new Date(inv.invoice_date), 'dd MMM yyyy')}`, 140, 38);
    doc.text(`Order #: ${inv.order_id}`, 140, 44);
    if (inv.gst_number) doc.text(`GSTIN: ${inv.gst_number}`, 140, 50);
    
    // Customer
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 14, 52);
    doc.setFont('helvetica', 'normal');
    doc.text(inv.customer_name || '', 14, 58);
    doc.text(inv.customer_email || '', 14, 64);
    doc.text(inv.customer_phone || '', 14, 70);
    
    const billing = inv.billing_address || {};
    const billAddr = [billing.address, billing.city, billing.state, billing.zip || billing.pin_code].filter(Boolean).join(', ');
    if (billAddr) doc.text(billAddr, 14, 76);
    
    // Shipping Address
    const shipping = inv.shipping_address || {};
    const shipAddr = [shipping.address, shipping.city, shipping.state, shipping.zip || shipping.pin_code].filter(Boolean).join(', ');
    if (shipAddr) {
      doc.setFont('helvetica', 'bold');
      doc.text('Ship To:', 110, 52);
      doc.setFont('helvetica', 'normal');
      doc.text(shipping.name || '', 110, 58);
      doc.text(shipAddr, 110, 64, { maxWidth: 80 });
    }

    // Products table
    const products = inv.product_details || [];
    const tableData = products.map(p => [
      p.name, p.sku || '', p.variant || '', p.quantity, `₹${p.unit_price}`, p.discount ? `₹${p.discount}` : '—', `₹${p.final_price}`
    ]);

    doc.autoTable({
      startY: 88,
      head: [['Product', 'SKU', 'Variant', 'Qty', 'Price', 'Discount', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [0, 0, 0], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      columnStyles: { 3: { halign: 'center' }, 4: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right' } }
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    // Summary
    doc.setFontSize(10);
    doc.text(`Subtotal:`, 140, finalY); doc.text(`₹${inv.subtotal}`, 185, finalY, { align: 'right' });
    if (inv.discount > 0) { doc.text(`Discount:`, 140, finalY + 6); doc.text(`-₹${inv.discount}`, 185, finalY + 6, { align: 'right' }); }
    doc.text(`Shipping:`, 140, finalY + 12); doc.text(`₹${inv.shipping_charges}`, 185, finalY + 12, { align: 'right' });
    if (inv.tax > 0) { doc.text(`Tax:`, 140, finalY + 18); doc.text(`₹${inv.tax}`, 185, finalY + 18, { align: 'right' }); }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    const totalY = finalY + (inv.tax > 0 ? 28 : 22);
    doc.text(`Grand Total:`, 140, totalY); doc.text(`₹${inv.grand_total}`, 185, totalY, { align: 'right' });

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your purchase! | www.swadyum.com', 14, 280);

    doc.save(`${inv.invoice_number}.pdf`);
  };

  const handlePrint = (inv) => {
    generatePDF(inv);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500">{totalCount} invoice{totalCount !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={fetchInvoices} className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by invoice #, order #, or customer..."
            value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(0); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm" />
        </div>
        <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(0); }}
          className="border border-gray-200 rounded-md px-3 py-2 text-sm" />
        <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(0); }}
          className="border border-gray-200 rounded-md px-3 py-2 text-sm" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="p-4">Invoice #</th>
                <th className="p-4">Order #</th>
                <th className="p-4">Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Grand Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500"><RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />Loading...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500"><FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />No invoices found.</td></tr>
              ) : invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="p-4 font-mono font-medium text-gray-900">{inv.invoice_number}</td>
                  <td className="p-4"><span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{inv.order_id}</span></td>
                  <td className="p-4 text-gray-500">{format(new Date(inv.invoice_date), 'dd MMM yyyy')}</td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{inv.customer_name || 'Guest'}</div>
                    <div className="text-xs text-gray-500">{inv.customer_email}</div>
                  </td>
                  <td className="p-4 font-semibold">₹{Number(inv.grand_total).toLocaleString('en-IN')}</td>
                  <td className="p-4"><span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">{inv.status}</span></td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => generatePDF(inv)} title="Download PDF"
                        className="p-2 text-gray-400 hover:text-black rounded-md hover:bg-gray-100">
                        <Download className="w-4 h-4" />
                      </button>
                      <button onClick={() => handlePrint(inv)} title="Print Invoice"
                        className="p-2 text-gray-400 hover:text-black rounded-md hover:bg-gray-100">
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">Page {page + 1} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0}
                className="px-3 py-1.5 border border-gray-200 rounded-md text-sm disabled:opacity-40 hover:bg-white">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages-1, p+1))} disabled={page >= totalPages-1}
                className="px-3 py-1.5 border border-gray-200 rounded-md text-sm disabled:opacity-40 hover:bg-white">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
