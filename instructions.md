# Swadyum Order Management System - Complete Implementation Instructions

## Objective

Build a production-ready ecommerce order management system similar to premium ecommerce platforms like Shopify. Every feature must be fully functional with proper backend integration, database updates, and admin controls. No dummy data or placeholder functionality.

---

# 1. Checkout Flow

## Successful Payment Flow

When a customer completes payment successfully:

1. Verify payment from Razorpay (server-side verification only).
2. Create the order in the database.
3. Mark order status as:

   * Payment Status: **Paid**
   * Order Status: **Pending**
4. Reduce inventory automatically.
5. Save shipping address.
6. Save billing details.
7. Generate invoice.
8. Create order timeline.
9. Send customer to **Thank You Page**.
10. Display order number.
11. Show estimated delivery.
12. Show purchased products.
13. Show payment details.
14. Show shipping address.
15. Show "Track Order" button.
16. Show "Continue Shopping" button.

The order should only be created after successful payment verification.

---

# 2. Failed Payment

If payment fails:

* Do NOT create an order.
* Do NOT reduce inventory.
* Keep cart items.
* Show payment failed page.
* Allow retry payment.

---

# 3. Customer Dashboard → Orders

Only show successfully paid orders.

Do NOT show:

* Failed payments
* Cancelled checkout sessions
* Abandoned carts

Each order card should display:

* Order Number
* Date
* Thumbnail
* Product Name
* Quantity
* Price
* Total Amount
* Payment Status
* Delivery Status
* Courier Name
* Tracking Number
* Expected Delivery
* View Order
* Download Receipt (not Tax Invoice)

Clicking an order should open:

* Complete Order Details
* Timeline
* Delivery Address
* Payment Details
* Ordered Products
* Quantity
* SKU
* Variant
* Discounts
* Shipping Charges
* Taxes
* Total

Customers should NOT see admin invoices.

---

# 4. Address Management

## First Order

Customer must enter:

* Full Name
* Mobile Number
* Email
* House Number
* Street
* Landmark
* Area
* City
* State
* PIN Code
* Country

Validate all fields.

---

## Second Order onwards

Automatically prefill saved address.

Provide:

* Edit Address
* Add New Address
* Delete Address
* Set Default Address

Allow multiple saved addresses.

---

# 5. Admin Dashboard → Orders

Every successful payment should instantly create a new order.

No page refresh required.

Display:

* Order Number
* Customer Name
* Phone
* Email
* Payment Status
* Order Status
* Date
* Total
* Products
* Coupon Used
* Shipping Method
* Courier
* Tracking Number
* Delivery Address

Order status badges:

* Pending
* Confirmed
* Packed
* Ready to Ship
* Shipped
* Out for Delivery
* Delivered
* Cancelled
* Returned
* Refunded

Payment badges:

* Paid
* Pending
* Refunded
* Partially Refunded

---

# 6. Order Details (Admin)

Every order should have a complete details page.

Include:

Customer Information

* Name
* Mobile
* Email

Shipping Address

Billing Address

Products

For every product:

* Product Name
* Category
* SKU
* Variant
* Quantity
* Price
* Discount
* Final Price

Payment

* Payment Gateway
* Razorpay Payment ID
* Order ID
* Transaction ID
* Payment Date
* Payment Status

Coupon

If coupon used:

Display:

Coupon Used

Coupon Code

Discount Amount

Coupon Type

Shipping

Courier

Tracking Number

Shipment Status

Estimated Delivery

Weight

Package Size

Timeline

Order Created

Payment Received

Inventory Reduced

Packed

Shipped

Delivered

Cancelled

Refunded

Every event should have timestamp.

---

# 7. Inventory Management

Immediately after successful payment:

Reduce inventory automatically.

Example:

Product Inventory = 100

Customer orders 3

Inventory becomes:

97

If stock reaches zero:

Automatically mark:

Out Of Stock

Disable purchase.

If inventory is low:

Show Low Stock warning.

Inventory should be restored if:

Order cancelled before shipping.

Inventory should NOT restore after delivery.

---

# 8. Coupon Tracking

If coupon applied:

Admin should see:

Coupon Used

Coupon Code

Discount

Campaign

Usage Count

Customer Name

Order Number

Coupon analytics should update automatically.

---

# 9. Invoice Module (Admin Only)

Create separate Admin Menu:

Invoices

Customer must NOT see invoices.

Invoice section should include:

Invoice Number

Order Number

Invoice Date

GST Details (future ready)

Customer Details

Billing Address

Shipping Address

Product Table

Tax

Discount

Shipping Charges

Grand Total

PDF Download

Print Invoice

Resend Invoice

Invoice Status

Invoice Search

Invoice Filters

---

# 10. Inventory Dashboard

Complete inventory management.

Include:

Current Stock

Reserved Stock

Available Stock

Incoming Stock

Low Stock

Out Of Stock

SKU

Barcode

Category

Brand

Purchase Cost

Selling Price

Profit Margin

Stock History

Inventory Logs

Inventory Export

CSV Import

---

# 11. Admin Dashboard Analytics

Dashboard Cards

Today's Orders

Today's Revenue

Weekly Revenue

Monthly Revenue

Pending Orders

Delivered Orders

Cancelled Orders

Average Order Value

Refunds

Products Sold

Inventory Value

Top Selling Products

Top Categories

New Customers

Returning Customers

Coupon Usage

COD vs Online Payments (future ready)

Revenue Graph

Sales Graph

Inventory Graph

---

# 12. Order Filters

Admin should filter by:

Date

Customer

Product

Category

Coupon

Payment Status

Order Status

Delivery Status

Amount

City

State

PIN Code

Courier

---

# 13. Search

Search using:

Customer Name

Phone

Email

Order Number

Invoice Number

Tracking Number

SKU

Product Name

Coupon Code

---

# 14. Export

Export Orders:

CSV

Excel

PDF

Export:

Invoices

Customers

Inventory

Sales

Coupons

---

# 15. Notifications

Immediately after successful payment:

Admin:

New Order Notification

Customer:

Order Confirmation

Payment Confirmation

Shipping Updates

Delivery Updates

Cancellation Updates

Refund Updates

---

# 16. Customer History

Admin should see:

Total Orders

Total Spend

Average Order Value

First Order Date

Last Order Date

Coupons Used

Favourite Products

Addresses

Order History

Refund History

Cancellation History

---

# 17. Security

Never trust frontend payment confirmation.

Always verify payment from backend before:

Creating Order

Reducing Inventory

Generating Invoice

Updating Dashboard

Everything must happen inside a database transaction so partial failures cannot create inconsistent data.

---

# 18. Database Requirements

Create proper relational tables:

* Orders
* Order Items
* Customers
* Addresses
* Products
* Inventory
* Inventory Logs
* Coupons
* Coupon Usage
* Payments
* Invoices
* Shipments
* Order Timeline

Use foreign keys, indexes, and database constraints to maintain data integrity.

---

# 19. Performance Requirements

* Real-time admin dashboard updates.
* Paginated order listing.
* Server-side filtering and search.
* Optimized database queries.
* Inventory updates must be atomic.
* Prevent duplicate orders from repeated payment callbacks.
* Prevent race conditions during simultaneous purchases.

---

# 20. Final Requirement

This should be implemented as a complete production-ready ecommerce backend for Swadyum.

No mock data.
No placeholder buttons.
No incomplete CRUD operations.

Every button, filter, search, invoice, inventory update, coupon usage, payment verification, dashboard metric, order status, and notification must be fully functional and connected to the database with proper validation, error handling, and audit logging.
