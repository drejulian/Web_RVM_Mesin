export function getWebRvmUrl(fallback = '') {
  const configuredUrl = process.env.NEXT_PUBLIC_WEB_RVM_URL?.trim();

  if (configuredUrl) {
    return configuredUrl;
  }

  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  return fallback;
}