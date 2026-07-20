
-- 1. Roles enum + user_roles table
CREATE TYPE public.app_role AS ENUM ('super_admin', 'payment_manager', 'support');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id);
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- 2. Registrations table
CREATE TYPE public.payment_status AS ENUM ('pending', 'verified', 'rejected');

CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_code TEXT UNIQUE,
  full_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  email TEXT NOT NULL,
  course_id TEXT NOT NULL,
  course_title TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  utr TEXT NOT NULL,
  screenshot_path TEXT,
  payment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  status public.payment_status NOT NULL DEFAULT 'pending',
  remarks TEXT,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX registrations_mobile_course_unique ON public.registrations (mobile, course_id);
CREATE INDEX registrations_created_at_idx ON public.registrations (created_at DESC);
CREATE INDEX registrations_status_idx ON public.registrations (status);

GRANT INSERT ON public.registrations TO anon;
GRANT INSERT ON public.registrations TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.registrations TO authenticated;
GRANT ALL ON public.registrations TO service_role;

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Anyone can create a registration
CREATE POLICY "Anyone can submit registration"
  ON public.registrations FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read all
CREATE POLICY "Admins can read all registrations"
  ON public.registrations FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

-- Payment managers + super admins can update (verify/reject)
CREATE POLICY "Admins can update registrations"
  ON public.registrations FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin')
    OR public.has_role(auth.uid(), 'payment_manager')
    OR public.has_role(auth.uid(), 'support')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin')
    OR public.has_role(auth.uid(), 'payment_manager')
    OR public.has_role(auth.uid(), 'support')
  );

-- Only super admin can delete
CREATE POLICY "Super admins can delete registrations"
  ON public.registrations FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Auto-generate student_code CL-YYYY-00001
CREATE SEQUENCE public.registrations_seq START 1;

CREATE OR REPLACE FUNCTION public.set_student_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.student_code IS NULL THEN
    NEW.student_code := 'CL-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.registrations_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_set_student_code
BEFORE INSERT ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.set_student_code();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_registrations_updated_at
BEFORE UPDATE ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Storage policies for payment-proofs bucket
CREATE POLICY "Anyone can upload payment proof"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "Admins can read payment proofs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'payment-proofs' AND public.is_admin(auth.uid()));

CREATE POLICY "Super admins can delete payment proofs"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'payment-proofs' AND public.has_role(auth.uid(), 'super_admin'));
