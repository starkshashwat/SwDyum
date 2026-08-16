import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import CategoriesList from './pages/CategoriesList';
import CategoryEditor from './pages/CategoryEditor';
import ProductsList from './pages/ProductsList';
import ProductEditor from './pages/ProductEditor';
import InventoryList from './pages/InventoryList';
import OrdersManager from './pages/OrdersManager';
import OrderRedirect from './pages/OrderRedirect';
import CustomersList from './pages/CustomersList';
import CustomerDetails from './pages/CustomerDetails';
import ReviewsList from './pages/ReviewsList';
import CouponsList from './pages/CouponsList';
import Inbox from './pages/Inbox';
import AccountDeletionList from './pages/AccountDeletionList';
import InvoicesList from './pages/InvoicesList';
import ShippingSettings from './pages/ShippingSettings';
import ShippingReports from './pages/ShippingReports';
import WhatsAppTemplates from './pages/WhatsAppTemplates';
import EmailTemplates from './pages/EmailTemplates';
import NotificationSettings from './pages/NotificationSettings';
import AutomationsList from './pages/AutomationsList';
import AutomationEditor from './pages/AutomationEditor';
import './index.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Admin Routes — ProtectedRoute verifies the backend
          session (GET /api/auth/session) and role before AdminLayout ever
          renders any nested page. */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Categories */}
        <Route path="/categories" element={<CategoriesList />} />
        <Route path="/categories/:id" element={<CategoryEditor />} />

        {/* Products */}
        <Route path="/products" element={<ProductsList />} />
        <Route path="/products/:id" element={<ProductEditor />} />

        {/* Inventory */}
        <Route path="/inventory" element={<InventoryList />} />

        {/* Orders — master-detail split view */}
        <Route path="/orders" element={<OrdersManager />} />
        <Route path="/orders/:id" element={<OrderRedirect />} />

        {/* Invoices */}
        <Route path="/invoices" element={<InvoicesList />} />

        {/* Commerce & Promotions */}
        <Route path="/coupons" element={<CouponsList />} />

        {/* Customers */}
        <Route path="/customers" element={<CustomersList />} />
        <Route path="/customers/:id" element={<CustomerDetails />} />

        {/* Reviews */}
        <Route path="/reviews" element={<ReviewsList />} />

        {/* Data Deletion */}
        <Route path="/account-deletion" element={<AccountDeletionList />} />

        {/* Inbox */}
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/whatsapp-templates" element={<WhatsAppTemplates />} />
        <Route path="/email-templates" element={<EmailTemplates />} />
        <Route path="/notification-settings" element={<NotificationSettings />} />

        {/* Settings */}
        <Route path="/shipping-settings" element={<ShippingSettings />} />
        <Route path="/shipping-reports" element={<ShippingReports />} />
        <Route path="/automations" element={<AutomationsList />} />
        <Route path="/automations/:id" element={<AutomationEditor />} />
        <Route path="/settings" element={<div className="p-4">Settings Component (Coming Soon)</div>} />
      </Route>
    </Routes>
  );
}

export default App;
