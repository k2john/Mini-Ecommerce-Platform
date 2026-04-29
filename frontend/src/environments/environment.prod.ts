const runtimeApiUrl = (globalThis as { __env?: { apiUrl?: string } }).__env?.apiUrl;
const apiUrl = (runtimeApiUrl || 'https://final-ecommerce-33sd.onrender.com/api').replace(/\/+$/, '');

export const environment = {
  production: true,
  apiUrl,
};
