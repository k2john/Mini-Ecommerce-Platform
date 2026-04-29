const runtimeApiUrl = (globalThis as { __env?: { apiUrl?: string } }).__env?.apiUrl;
const apiUrl = (runtimeApiUrl || 'https://mini-e-commerce-platform-group11.onrender.com/api').replace(/\/+$/, '');

export const environment = {
  production: true,
  apiUrl,
};
