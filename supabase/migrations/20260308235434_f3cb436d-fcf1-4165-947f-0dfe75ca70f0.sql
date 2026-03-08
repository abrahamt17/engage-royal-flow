-- Allow authenticated users to insert content metrics and trigger payroll
ALTER POLICY "Brands view campaign content" ON public.creator_content 
  USING (
    campaign_creator_id IN (
      SELECT cc.id 
      FROM campaign_creators cc
      JOIN campaigns c ON cc.campaign_id = c.id
      JOIN brands b ON c.brand_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

CREATE POLICY "Creators can submit their own content" 
  ON public.creator_content 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update content scores" 
  ON public.creator_content 
  FOR UPDATE 
  USING (true);

-- Allow payroll inserts and updates
CREATE POLICY "System can create payroll entries" 
  ON public.payroll 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Brands can update payroll status" 
  ON public.payroll 
  FOR UPDATE 
  USING (
    campaign_creator_id IN (
      SELECT cc.id 
      FROM campaign_creators cc
      JOIN campaigns c ON cc.campaign_id = c.id
      JOIN brands b ON c.brand_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );