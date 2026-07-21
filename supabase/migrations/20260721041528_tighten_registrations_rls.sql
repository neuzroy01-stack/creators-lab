-- Tighten UPDATE policy: support role can view but NOT update registrations.
-- Only super_admin and payment_manager can verify/reject payments.
DROP POLICY IF EXISTS "Admins can update registrations" ON public.registrations;

CREATE POLICY "Payment managers and super admins can update registrations"
  ON public.registrations FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin')
    OR public.has_role(auth.uid(), 'payment_manager')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin')
    OR public.has_role(auth.uid(), 'payment_manager')
  );
