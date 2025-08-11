/*
  # Complete SaaS Confeitaria Schema

  1. New Tables
    - `user_subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `email` (text, unique)
      - `stripe_customer_id` (text)
      - `stripe_subscription_id` (text)
      - `subscription_status` (text with check constraint)
      - `current_period_start` (timestamptz)
      - `current_period_end` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `customers`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `email` (text)
      - `phone` (text)
      - `address` (text)
      - `created_at` (timestamptz)
      - `user_id` (uuid, foreign key)
    - `products`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `description` (text)
      - `price` (numeric)
      - `category` (text)
      - `stock` (integer)
      - `active` (boolean)
      - `created_at` (timestamptz)
      - `user_id` (uuid, foreign key)
    - `orders`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key)
      - `status` (text)
      - `total` (numeric)
      - `delivery_date` (date)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `user_id` (uuid, foreign key)
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)
      - `quantity` (integer)
      - `price` (numeric)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Service role can manage all subscriptions for webhook processing

  3. Functions
    - `update_updated_at_column()` trigger function for automatic timestamp updates

  4. Indexes
    - Performance indexes on frequently queried columns
*/

-- Create update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'canceled', 'past_due', 'trialing')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on user_subscriptions
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_subscriptions
CREATE POLICY "Users can read their own subscription"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all subscriptions"
  ON user_subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for user_subscriptions
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_email ON user_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  address text,
  created_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS on customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policy for customers
CREATE POLICY "Users can manage their own customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) DEFAULT 0,
  category text DEFAULT 'Outros',
  stock integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS on products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy for products
CREATE POLICY "Users can manage their own products"
  ON products
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  status text DEFAULT 'Pendente',
  total numeric(10,2) DEFAULT 0,
  delivery_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS on orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy for orders
CREATE POLICY "Users can manage their own orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1 NOT NULL,
  price numeric(10,2) DEFAULT 0 NOT NULL
);

-- Enable RLS on order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policy for order_items
CREATE POLICY "Users can manage order items for their orders"
  ON order_items
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  ));