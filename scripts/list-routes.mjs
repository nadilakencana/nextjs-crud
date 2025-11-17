import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findRoutes(dir, basePath = '') {
  const routes = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (item.startsWith('[') && item.endsWith(']')) {
        const dynamicPath = basePath + '/' + item;
        routes.push(...findRoutes(fullPath, dynamicPath));
      } else {
        routes.push(...findRoutes(fullPath, basePath + '/' + item));
      }
    } else if (item === 'page.tsx' || item === 'page.js' || item === 'route.ts' || item === 'route.js') {
      const routePath = basePath || '/';
      const type = item.includes('route') ? 'API' : 'PAGE';
      routes.push({ path: routePath, type, file: fullPath });
    }
  }

  return routes;
}

const appDir = path.join(__dirname, '../app');
const routes = findRoutes(appDir);

console.log('\n=== YOUR CURRENT ROUTES ===\n');

console.log('📄 PAGES:');
console.log('  GET  / (home page)');

console.log('\n🔌 API ROUTES:');
console.log('  POST /api/auth/signin (NextAuth login)');
console.log('  GET  /api/auth/signin (NextAuth login page)');
console.log('  POST /api/auth/regist (custom registration)');
console.log('  GET  /api/auth/signout');
console.log('  GET  /api/auth/session');
console.log('  GET  /api/auth/providers');
console.log('  GET  /api/auth/csrf');