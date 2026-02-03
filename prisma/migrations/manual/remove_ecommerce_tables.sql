-- Migration: Remove ecommerce tables (now handled by Shopify)
-- Run this manually in production database
-- Order matters due to foreign key constraints

-- Step 1: Drop junction/child tables first (they reference parent tables)
DROP TABLE IF EXISTS "order_items" CASCADE;
DROP TABLE IF EXISTS "cart_items" CASCADE;
DROP TABLE IF EXISTS "product_variants" CASCADE;

-- Step 2: Drop main tables
DROP TABLE IF EXISTS "orders" CASCADE;
DROP TABLE IF EXISTS "carts" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;

-- Step 3: Drop category and discount tables
DROP TABLE IF EXISTS "product_categories" CASCADE;
DROP TABLE IF EXISTS "discount_codes" CASCADE;

-- Step 4: Drop enums (these are PostgreSQL types)
DROP TYPE IF EXISTS "ProductType" CASCADE;
DROP TYPE IF EXISTS "OrderStatus" CASCADE;
DROP TYPE IF EXISTS "PaymentStatus" CASCADE;
DROP TYPE IF EXISTS "FulfillmentStatus" CASCADE;
DROP TYPE IF EXISTS "DiscountType" CASCADE;
DROP TYPE IF EXISTS "DiscountApplicableTo" CASCADE;
