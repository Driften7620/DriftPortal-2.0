export function getPasswordUpdateRedirectUrl() {
  const redirectUrl = new URL(import.meta.env.BASE_URL, window.location.origin);
  redirectUrl.searchParams.set('auth', 'update-password');
  return redirectUrl.toString();
}

export function isPasswordUpdateRedirect() {
  return new URLSearchParams(window.location.search).get('auth') === 'update-password';
}

export function clearPasswordUpdateRedirect() {
  const appUrl = new URL(import.meta.env.BASE_URL, window.location.origin);
  appUrl.hash = '/';
  window.location.replace(appUrl.toString());
}
