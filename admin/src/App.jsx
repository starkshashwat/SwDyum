import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminLayout from './components/AdminLayout';
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
import OffersList from './pages/OffersList';
import CouponsList from './pages/CouponsList';
import SubscriptionsList from './pages/SubscriptionsList';
import AnnouncementsList from './pages/AnnouncementsList';
import RecipesList from './pages/RecipesList';
import SEOCenter from './pages/SEOCenter';
import Inbox from './pages/Inbox';
import AccountDeletionList from './pages/AccountDeletionList';
import InvoicesList from './pages/InvoicesList';
import './index.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Admin Routes */}
      <Route element={<AdminLayout />}>
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
        <Route path="/offers" element={<OffersList />} />
        <Route path="/coupons" element={<CouponsList />} />
        <Route path="/subscriptions" element={<SubscriptionsList />} />

        {/* Customers */}
        <Route path="/customers" element={<CustomersList />} />
        <Route path="/customers/:id" element={<CustomerDetails />} />

        {/* Reviews */}
        <Route path="/reviews" element={<ReviewsList />} />

        {/* Data Deletion */}
        <Route path="/account-deletion" element={<AccountDeletionList />} />

        {/* CMS & Content */}
        <Route path="/announcements" element={<AnnouncementsList />} />
        <Route path="/recipes" element={<RecipesList />} />

        {/* Growth & Analytics */}
        <Route path="/seo" element={<SEOCenter />} />

        {/* Inbox */}
        <Route path="/inbox" element={<Inbox />} />

        {/* Settings */}
        <Route path="/settings" element={<div className="p-4">Settings Component (Coming Soon)</div>} />
      </Route>
    </Routes>
  );
}

export default App;
