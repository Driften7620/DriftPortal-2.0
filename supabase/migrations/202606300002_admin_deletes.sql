create policy "Admins can delete system locations"
  on public.system_locations for delete
  to authenticated
  using (public.is_portal_admin());
