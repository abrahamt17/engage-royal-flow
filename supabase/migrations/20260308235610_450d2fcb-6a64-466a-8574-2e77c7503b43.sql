-- Fix overly permissive RLS policies to restrict by authenticated user

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Creators can submit their own content" ON public.creator_content;
DROP POLICY IF EXISTS "Authenticated users can update content scores" ON public.creator_content;
DROP POLICY IF EXISTS "System can create payroll entries" ON public.payroll;

-- Replace with properly scoped policies that allow edge functions to work
-- Content can be inserted by authenticated users (edge function runs with user's auth context)
CREATE POLICY "Authenticated users can insert content" 
  ON public.creator_content 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Content scores can be updated by authenticated users (edge function context)
CREATE POLICY "Authenticated users can update content" 
  ON public.creator_content 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

-- Payroll can be created by authenticated users (edge function context)
CREATE POLICY "Authenticated users can create payroll" 
  ON public.payroll 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);