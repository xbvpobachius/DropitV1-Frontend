-- Update user_progress table to track onboarding steps
ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS product_selected boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS store_created boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS calendar_viewed boolean DEFAULT false;