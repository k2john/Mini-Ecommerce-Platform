const runtimeApiUrl = (globalThis as { __env?: { apiUrl?: string } }).__env?.apiUrl;
const apiUrl = (runtimeApiUrl || 'https://ecommerce-server-eys5.onrender.com/api').replace(/\/+$/, '');

export const environment = {
  production: true,
  apiUrl,
};
