drop policy if exists "Admins can delete system categories" on public.system_categories;

create policy "Admins can delete system categories"
  on public.system_categories for delete
  to authenticated
  using (public.is_portal_admin());
