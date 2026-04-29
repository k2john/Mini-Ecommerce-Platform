const runtimeApiUrl = (globalThis as { __env?: { apiUrl?: string } }).__env?.apiUrl;
const apiUrl = (runtimeApiUrl || 'https://your-api.onrender.com/api').replace(/\/+$/, '');

export const environment = {
  production: true,
  apiUrl,
};
