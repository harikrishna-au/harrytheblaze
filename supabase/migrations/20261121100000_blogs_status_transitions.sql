-- Blog moderation lifecycle:  (insert) → pending → published | rejected
--
-- The blogs table is written with the public anon key, so the database is the
-- only place this can be enforced. New posts must start as pending, and only a
-- pending post can change status. Published and rejected are final (an admin
-- can still delete a post).

CREATE OR REPLACE FUNCTION public.enforce_blog_status_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status IS DISTINCT FROM 'pending' THEN
      RAISE EXCEPTION 'New blog posts must start as pending (got %)', NEW.status
        USING ERRCODE = 'check_violation';
    END IF;
    NEW.published_at := NULL;
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT (OLD.status = 'pending' AND NEW.status IN ('published', 'rejected')) THEN
      RAISE EXCEPTION 'Blog status cannot change from % to %', OLD.status, NEW.status
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  -- published_at is set once, on publish, and never moved afterwards.
  IF NEW.status = 'published' AND OLD.status = 'pending' THEN
    NEW.published_at := COALESCE(NEW.published_at, now());
  ELSIF NEW.published_at IS DISTINCT FROM OLD.published_at THEN
    NEW.published_at := OLD.published_at;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS blogs_status_transition ON public.blogs;
CREATE TRIGGER blogs_status_transition
  BEFORE INSERT OR UPDATE ON public.blogs
  FOR EACH ROW EXECUTE FUNCTION public.enforce_blog_status_transition();
