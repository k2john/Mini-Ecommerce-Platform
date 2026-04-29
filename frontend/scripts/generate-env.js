const fs = require('fs');

let api = process.env.NG_APP_API_URL || 'https://final-ecommerce-33sd.onrender.com/api';

// remove trailing slash
while (api.endsWith('/')) {
  api = api.slice(0, -1);
}

fs.mkdirSync('src/assets', { recursive: true });

fs.writeFileSync(
  'src/assets/env.js',
  `window.__env = {
  apiUrl: '${api}',
};
`
);

console.log("env.js generated successfully");