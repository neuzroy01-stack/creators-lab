-- Safe function to submit a registration (callable without authentication)
-- Uses SECURITY DEFINER to bypass RLS since the public form has no auth.
CREATE OR REPLACE FUNCTION public.submit_registration(
  p_full_name TEXT,
  p_mobile TEXT,
  p_email TEXT,
  p_course_id TEXT,
  p_course_title TEXT,
  p_amount NUMERIC,
  p_utr TEXT,
  p_screenshot_path TEXT DEFAULT NULL,
  p_remarks TEXT DEFAULT NULL
)
RETURNS TABLE (id UUID, student_code TEXT, error TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing RECORD;
  v_id UUID;
  v_code TEXT;
BEGIN
  -- Check for duplicate (same mobile + course)
  SELECT id, student_code, status INTO v_existing
  FROM public.registrations
  WHERE mobile = p_mobile AND course_id = p_course_id
  LIMIT 1;

  IF FOUND THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, 
      'duplicate: You already have a registration for this course (' || COALESCE(v_existing.student_code, v_existing.id::TEXT) || '). Contact us on WhatsApp for help.';
    RETURN;
  END IF;

  -- Insert the registration (trigger will auto-generate student_code)
  INSERT INTO public.registrations (
    full_name, mobile, email, course_id, course_title, amount, utr,
    screenshot_path, remarks, status
  ) VALUES (
    p_full_name, p_mobile, p_email, p_course_id, p_course_title, p_amount, p_utr,
    p_screenshot_path, p_remarks, 'pending'
  )
  RETURNING id, student_code INTO v_id, v_code;

  RETURN QUERY SELECT v_id, v_code, NULL::TEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_registration(
  TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, TEXT, TEXT, TEXT
) TO anon, authenticated;
