You are a Senior Full Stack Architect.

The existing Swadyum Admin Panel UI already exists.

Your task is NOT to create a demo dashboard.

Your task is to transform the admin panel into the master operating system of the entire ecommerce platform.

---

CRITICAL REQUIREMENT

The Admin Panel must be the SINGLE SOURCE OF TRUTH.

Every frontend component must fetch its data from the database through APIs.

Nothing should be hardcoded on the frontend.

Any change made inside the admin panel should instantly reflect throughout the website.

No code changes.

No redeployment.

No developer intervention.

Admin panel controls everything.

---

REAL TIME SYNCHRONIZATION

When admin updates:

Product Name

Product Images

Product Gallery

Product Videos

Pricing

Discount

Offer

Inventory

Category

Banner

Announcement

Homepage Section

Blog

Recipe

Review

SEO

Coupon

Navigation Menu

Footer Content

Loyalty Rules

Referral Rules

Subscription Plans

The changes must automatically update on:

Homepage

Collection Pages

Product Pages

Search Results

Cart

Checkout

Blog Pages

Footer

Header

Mobile Site

Desktop Site

Without refreshing deployment.

---

DATABASE DRIVEN SYSTEM

Build a headless architecture.

Frontend reads everything from APIs.

Admin writes everything to database.

Database is the source of truth.

Never hardcode:

Text

Images

Buttons

Links

Prices

Discounts

SEO Data

Sections

Banners

Menus

---

PRODUCT MANAGEMENT MODULE

Admin should be able to:

Create Product

Edit Product

Delete Product

Archive Product

Duplicate Product

Upload Images

Upload Videos

Manage Variants

Manage Pricing

Manage Inventory

Manage SEO

Manage Product Benefits

Manage Product Ingredients

Manage Product FAQ

Manage Product Nutrition

Manage Product Story

When a product is edited:

Collection pages update automatically

Product pages update automatically

Search updates automatically

Homepage sections update automatically

Related products update automatically

---

CATEGORY MANAGEMENT

Admin should be able to:

Create Categories

Create Subcategories

Upload Category Banner

Edit Category Description

Edit Category SEO

Hide Category

Feature Category

Changes automatically reflect across:

Menus

Filters

Homepage

Category Pages

Search Results

---

HOMEPAGE BUILDER

Create a visual homepage builder.

Admin can:

Add Section

Remove Section

Hide Section

Duplicate Section

Reorder Section

Schedule Section

Edit Section Content

Upload Images

Upload Videos

Change Buttons

Change Links

Supported Sections:

Hero

Trust Bar

Featured Products

Story Section

Benefits

Combo Offer

Testimonials

Recipes

FAQ

Newsletter

Instagram Feed

Every change must instantly update frontend.

---

WEBSITE BUILDER

Create Shopify-like page management.

Admin can create:

Homepage

Landing Pages

Festival Pages

Campaign Pages

Collection Pages

Static Pages

No coding required.

---

BANNER MANAGEMENT

Admin can manage:

Desktop Banner

Tablet Banner

Mobile Banner

Category Banner

Popup Banner

Offer Banner

Festival Banner

Admin can:

Upload Images

Set CTA

Set Link

Schedule Banner

Enable/Disable

Track Clicks

Changes instantly reflect frontend.

---

ANNOUNCEMENT SYSTEM

Admin can:

Create Announcement

Set Priority

Set Start Date

Set End Date

Enable Disable

Site-wide visibility.

Changes instantly update frontend.

---

SEO MANAGEMENT

Admin can edit:

Meta Title

Meta Description

Keywords

Canonical URL

Open Graph

Schema Markup

Sitemap

Redirects

Robots.txt

Changes immediately affect frontend pages.

---

MEDIA LIBRARY

Create centralized media system.

Store:

Images

Videos

Icons

Documents

Features:

Folders

Tags

Search

Compression

WebP Conversion

Reuse Assets

---

OFFERS SYSTEM

Create:

Percentage Discounts

Flat Discounts

BOGO

Combo Offers

Category Discounts

Product Discounts

Flash Sales

Festival Sales

Auto Start

Auto End

Frontend automatically calculates discounts.

---

COUPON SYSTEM

Admin can:

Create Coupon

Edit Coupon

Disable Coupon

Track Usage

Track Revenue

Track Conversion

Coupon logic automatically applies at checkout.

---

ORDER MANAGEMENT

Integrate Razorpay.

Integrate Shiprocket.

Flow:

Order Created

↓

Payment Success

↓

Create Order

↓

Push To Shiprocket

↓

Generate AWB

↓

Assign Courier

↓

Update Tracking

↓

Update Customer

Admin panel displays all statuses in real time.

---

REVIEW SYSTEM

Customer submits review.

Admin approves review.

Approved review automatically appears on:

Product Page

Homepage Testimonials

Review Widgets

---

LOYALTY PROGRAM

Admin controls:

Points Rules

Redemption Rules

Reward Rules

Tier System

Bronze

Silver

Gold

Platinum

Changes instantly affect customer accounts.

---

REFERRAL SYSTEM

Admin controls:

Referral Reward

Referral Coupon

Referral Commission

Referral Dashboard

---

ANALYTICS SYSTEM

Dashboard must show:

Revenue

Profit

Orders

Customers

Conversion Rate

AOV

LTV

RTO Rate

Subscription Revenue

Top Products

Top Categories

Top Cities

Coupon Performance

Offer Performance

Traffic Sources

All data should be live.

---

ROLE MANAGEMENT

Super Admin

Marketing Manager

Operations Manager

Customer Support

Content Manager

Inventory Manager

Custom Roles

Permission Based Access.

---

TECHNICAL REQUIREMENTS

Use Server Actions.

Use API Routes.

Use PostgreSQL.

Use Prisma.

Use Redis Caching.

Use Webhooks.

Use Revalidation.

Use Real Time Updates.

Use Optimized Queries.

Use Modular Architecture.

Support 100,000+ monthly visitors.

Support 10,000+ monthly orders.

---

FINAL GOAL

Build a Shopify Plus level admin panel where the entire Swadyum website is controlled from the admin panel and every change made by the admin is automatically reflected throughout the frontend website in real time.
