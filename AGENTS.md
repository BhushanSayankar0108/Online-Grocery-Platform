# AGENTS.md

## Project Overview

Project: **Online Grocery E-Commerce Platform**

This is a responsive online grocery e-commerce platform with: - A
public/customer-facing website - An admin panel - A Node.js/Express
backend - MongoDB database

Team responsibilities: - Public customer-facing website: current user -
Admin panel: project partner - Backend: both team members will work on
it together later

The current priority is the public customer-facing website, especially
the homepage.

## Technology Stack

### Frontend

-   React.js
-   Vite
-   JavaScript
-   ESLint

### Backend

-   Node.js
-   Express.js
-   CORS
-   dotenv

### Database

-   MongoDB
-   Mongoose when backend/database integration begins

### Tools

-   VS Code
-   Git
-   GitHub

## Repository Structure

Intended structure:

``` text
Online-Grocery-Platform/
├── AGENTS.md
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
└── backend/
    ├── server.js
    ├── package.json
    └── ...
```

The frontend is a Vite React application. The backend currently has a
basic Express server.

## Current Development Status

Frontend runs on:

``` text
http://localhost:5173
```

Backend runs on:

``` text
http://localhost:5000
```

The backend currently has a basic `GET /` endpoint that confirms the API
is running.

Do not unnecessarily rebuild or recreate the existing frontend or
backend setup.

# Product Requirements

The platform should support:

-   Customer registration/login
-   Customer profile
-   Multiple saved addresses
-   Location/PIN/serviceability validation
-   Product browsing and search
-   Categories, sub-categories and brands
-   Product variants and images
-   Stock availability
-   Cart
-   Wishlist
-   Coupons/offers
-   Delivery zones and slots
-   Online payment and COD
-   Orders and order tracking
-   Previous orders and reorder
-   Cancellation
-   Returns and refunds
-   Product reviews
-   Notifications
-   Admin management of customers, products, categories, brands,
    inventory, orders, payments, delivery, coupons, reviews, CMS and
    reports

# Homepage Requirements

The homepage should have a **premium, modern grocery e-commerce
appearance**.

The provided visual reference has a clean green/white grocery aesthetic
with: - Top information bar - Main navbar - Search - Account/cart -
Navigation links - Large hero section - Shop by category - Promotional
banners - Deal/product cards - Why Choose Us - Testimonials -
Newsletter - Footer

Do not copy the reference website directly. Use it for layout, hierarchy
and visual inspiration.

## Recommended Homepage Structure

``` text
Top Information Bar
        ↓
Main Navbar
        ↓
Navigation Menu
        ↓
Hero Section
        ↓
Shop by Category
        ↓
Promotional Banners
        ↓
Deal of the Day / Featured Products
        ↓
Why Choose Us
        ↓
Customer Testimonials
        ↓
Newsletter / Exclusive Offers
        ↓
Footer
```

## Recommended React Components

``` text
frontend/
└── src/
    ├── components/
    │   ├── TopBar.jsx
    │   ├── Navbar.jsx
    │   ├── Navigation.jsx
    │   ├── Hero.jsx
    │   ├── CategorySection.jsx
    │   ├── CategoryCard.jsx
    │   ├── PromoBanner.jsx
    │   ├── ProductCard.jsx
    │   ├── DealsSection.jsx
    │   ├── WhyChooseUs.jsx
    │   ├── Testimonials.jsx
    │   ├── Newsletter.jsx
    │   └── Footer.jsx
    ├── pages/
    │   └── Home.jsx
    ├── assets/
    ├── App.jsx
    └── main.jsx
```

Adjust this to the existing project conventions if needed.

# Design Direction

The website should feel: - Premium - Modern - Clean - Professional -
Trustworthy - Fresh - Easy to navigate - Suitable for an Indian grocery
e-commerce business

Avoid: - Clutter - Excessive colors - Cheap-looking UI - Basic
tutorial-template appearance - Direct imitation of Amazon, Blinkit,
Zepto or another major brand

## Color Direction

Use a grocery-oriented green/white visual direction: - Primary:
deep/forest green - Secondary: fresh green - Background: white or very
light neutral - Text: dark charcoal - Accent: restrained warm color for
offers/discounts

Use a consistent design-token system rather than random hardcoded
colors.

Example:

``` css
:root {
  --primary: ...;
  --primary-dark: ...;
  --secondary: ...;
  --background: ...;
  --surface: ...;
  --text: ...;
  --muted-text: ...;
  --border: ...;
  --accent: ...;
}
```

## Typography

Use one consistent modern font family. Prioritize: - Strong readable
headings - Clean body text - Clear prices - Distinct CTAs - Good visual
hierarchy

Do not use too many fonts.

## Layout

Prioritize: - Consistent spacing - Clear hierarchy - Responsive design -
Clean product cards - Appropriate rounded corners - Subtle
borders/shadows - Whitespace - Consistent buttons - Consistent image
ratios

Support desktop, tablet and mobile.

# Product Cards

Product cards should eventually support: - Product image - Product
name - Variant/weight - MRP where applicable - Selling price -
Discount - Stock state - Add to Cart - Wishlist action

Keep product cards reusable and consistent.

# Category Section

Possible categories include: - Fruits & Vegetables - Dairy & Eggs -
Snacks & Munchies - Beverages - Breakfast & Cereals - Bakery & Bread -
Household Essentials - Personal Care & Beauty

These are examples; final categories should match project data.

# Promotional Sections

Possible content: - Weekend offers - Limited-time discounts - Free
delivery - Express delivery - Seasonal offers - Featured products

Avoid excessive banners.

# Why Choose Us

Possible benefits: - Quality products - Affordable prices - Fast
delivery - Secure payments - Easy returns

Use simple icons and short descriptions.

# Testimonials

Can include: - Customer quote - Customer name - Rating - Optional avatar

Keep it clean and concise.

# Footer

Possible sections: - About - Quick links - Customer service -
Categories - Contact information - Social links - Payment methods -
Privacy Policy - Terms & Conditions - Return/Refund Policy -
Shipping/Delivery Policy

Only expose pages that actually exist or are planned.

# Backend Context

The eventual backend stack is:

``` text
Node.js
Express.js
MongoDB
Mongoose
```

The frontend will eventually communicate with the backend through REST
APIs.

Expected API areas:

``` text
/api/auth
/api/customers
/api/products
/api/categories
/api/brands
/api/cart
/api/wishlist
/api/orders
/api/payments
/api/delivery
/api/coupons
/api/reviews
/api/notifications
```

Do not implement all of these unless requested.

# Database Context

The planned MongoDB data model covers these concepts:

-   Customer
-   Customer Address
-   Admin
-   Category
-   Sub-category
-   Brand
-   Product
-   Product Variant
-   Product Image
-   Inventory
-   Inventory History
-   Product Batch
-   Cart
-   Wishlist
-   Order
-   Order Item
-   Payment
-   Delivery Zone
-   Delivery Slot
-   Coupon
-   Order Coupon
-   Review
-   Notification
-   CMS Content
-   Admin Activity Log

The previous design was relational-style for planning. MongoDB
implementation should use appropriate document/schema design rather than
blindly converting tables into collections.

# Important Business Rules

## Customer/Admin

Customer and Admin are separate concepts. Do not introduce a common User
table unless the requirements change.

Customer status should support active/inactive behavior.

## Location/Delivery

Addresses can contain: - Address details - PIN code - Latitude -
Longitude - Delivery zone

Location belongs to the address because serviceability depends on the
delivery address.

Validate: - PIN/serviceability - Delivery zone - Store coverage -
Minimum order - Delivery charge - Available delivery slots

## Product

Products can have: - Category - Sub-category - Brand - SKU - Barcode -
Weight - Unit - Minimum/maximum quantity - Status - Images - Variants

Variants can have: - Variant name - MRP - Selling price - GST
percentage - Reverse-charge flag where applicable - SKU - Barcode -
Status

Do not interpret the reverse-charge flag as a reverse GST percentage.

## Inventory

Support: - Stock quantity - Reserved quantity - Available quantity -
Low-stock threshold - Status - Inventory history - Batch/expiry
information

## Cart/Wishlist

The conceptual design combines cart and cart-item, and wishlist and
wishlist-item. Do not add unnecessary cart price storage unless the
design changes.

## Orders

Order contains: - Customer - Delivery address - Order status -
Subtotal - Delivery charge - Discount - Tax - Total amount - Delivery
instructions - Order items

Order item contains: - Product variant - Quantity - Price - Line total

The order-level subtotal is intentional.

## Order Status

``` text
Order Placed
      ↓
Confirmed
      ↓
Picking
      ↓
Packed
      ↓
Out for Delivery
      ↓
Delivered
```

Use the existing order status field rather than creating an unnecessary
status table.

## Payments

Supported methods: - UPI - Cards - Net banking - Wallets - COD - UPI on
Delivery

Payment may need: - Initiation - Success - Failure - Timeout - Refund -
Partial refund - Webhooks - Transaction ID

## Delivery

Delivery zones can define: - PIN code - Delivery charge - Free-delivery
threshold - Minimum order amount - Status

Delivery slots can define: - Zone - Date - Start/end time - Maximum
orders - Booked orders - Slot type - Status

## Coupons

Coupons can support: - Code - Description - Discount type/value -
Minimum order - Maximum discount - Start/end dates - Usage limit -
Status

Prefer existing coupon and delivery-zone rules over unnecessary
additional discount-rule systems.

# Code Quality

-   Inspect existing code before changing it.
-   Preserve working code unless there is a clear reason to change it.
-   Use meaningful names.
-   Keep components focused.
-   Prefer reusable React components.
-   Avoid unnecessary abstraction.
-   Follow ESLint.
-   Use modern JavaScript.
-   Handle errors properly.
-   Validate user input.
-   Avoid unnecessary dependencies.
-   Avoid large monolithic components.
-   Do not leave unnecessary debug logging in finished code.

# React Rules

-   Use functional components.
-   Use hooks appropriately.
-   Avoid unnecessary state.
-   Keep repeated UI reusable.
-   Keep data separate from presentation where practical.
-   Do not add a state-management library unless needed.

# CSS Rules

-   Follow the existing styling approach.
-   Do not mix styling systems without a reason.
-   Avoid large amounts of inline styling.
-   Make responsive behavior part of the implementation.

# Git/GitHub Workflow

The project is shared by two developers.

Do not overwrite or reset another developer's work.

Before significant work:

``` bash
git pull
```

Use meaningful branches when the team workflow allows:

``` text
feature/homepage
feature/navbar
feature/hero-section
feature/category-section
```

Use small logical commits:

``` text
feat: add homepage hero section
feat: add category cards
style: improve homepage spacing
fix: correct mobile navbar
```

Never commit: - `.env` - Passwords - API keys - Database credentials -
Private tokens - `node_modules`

Ensure `.gitignore` covers local/sensitive files.

# Working With the Partner

The partner is responsible for the admin panel.

Avoid changing admin-panel files unless coordinated.

Coordinate before changing shared configuration such as: -
`package.json` - Vite configuration - ESLint configuration - global
CSS - routing configuration

# Design Research

The mentor asked the team to research premium website design and color
combinations.

Useful inspiration: - Pinterest - Dribbble - Behance - Awwwards -
Mobbin - Godly - SiteInspire - Land-book - Coolors - Typewolf

Study: - Color palettes - Typography - Navbar - Hero sections - Product
cards - Category cards - CTA buttons - Spacing - Visual hierarchy -
Checkout/cart UI - Responsive layouts

Use references for inspiration. Do not copy another site's complete
design, assets, text or branding.

# Development Order

Preferred order for the public website:

1.  Global design system
2.  Navbar/top bar
3.  Hero section
4.  Category section
5.  Promotional sections
6.  Product/deal section
7.  Why Choose Us
8.  Testimonials
9.  Newsletter
10. Footer
11. Responsive/mobile refinement
12. Routing and additional customer pages
13. API integration when backend is ready

Work incrementally. After each major section: - Run the app - Check
desktop - Check mobile - Check console errors - Verify existing
functionality

# Important Codex Instructions

1.  Inspect the existing repository before making changes.
2.  Do not assume the repository is empty.
3.  Do not recreate the frontend/backend setup unnecessarily.
4.  Follow existing project conventions when reasonable.
5.  Make the smallest coherent change needed.
6.  Explain files changed and why.
7.  Do not install dependencies unless necessary.
8.  Do not change backend during frontend tasks unless explicitly
    requested.
9.  Do not change the admin panel during public-website tasks unless
    explicitly requested.
10. Never expose or commit credentials.
11. Do not fabricate API endpoints or backend behavior that has not been
    implemented.
12. If backend integration is not ready, use clearly separated mock
    data.
13. Keep the design premium and production-oriented.
14. Ensure responsive desktop/tablet/mobile behavior.
15. Prefer reusable components.
16. Before large architectural changes, explain the proposed approach.

# Immediate Goal

Build the **premium public grocery website homepage in React.js**.

Visual direction: - Green/white grocery aesthetic - Premium but
approachable - Large hero section - Product/category imagery - Category
navigation - Promotional offers - Product cards - Trust/benefit
section - Customer reviews - Newsletter - Professional footer

The design must be original and suitable for the project's own branding.

Do not start backend/database implementation unless explicitly
requested.
