ALTER TABLE public.creator_content
  DROP CONSTRAINT IF EXISTS creator_content_performance_score_check;

ALTER TABLE public.creator_content
  DROP CONSTRAINT IF EXISTS creator_content_audience_match_score_check;

ALTER TABLE public.creator_content
  ADD CONSTRAINT creator_content_performance_score_check
  CHECK (performance_score >= 0 AND performance_score <= 100);

ALTER TABLE public.creator_content
  ADD CONSTRAINT creator_content_audience_match_score_check
  CHECK (audience_match_score >= 0 AND audience_match_score <= 100);
