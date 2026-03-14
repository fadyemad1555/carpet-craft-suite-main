
-- Create products table for carpet inventory
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'تركي',
  size TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'قطعة',
  color TEXT NOT NULL,
  material TEXT NOT NULL,
  purchase_price NUMERIC NOT NULL DEFAULT 0,
  sale_price NUMERIC NOT NULL DEFAULT 0,
  quantity NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read products
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);

-- Allow all authenticated users to insert products
CREATE POLICY "Anyone can insert products" ON public.products FOR INSERT WITH CHECK (true);

-- Allow all authenticated users to update products
CREATE POLICY "Anyone can update products" ON public.products FOR UPDATE USING (true);

-- Allow all authenticated users to delete products
CREATE POLICY "Anyone can delete products" ON public.products FOR DELETE USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
