const fs = require('fs');

let content = fs.readFileSync('backend/src/app.js', 'utf8');

content = content.replace(
  /import \{ usersRouter \} from '\.\/routes\/users\.js';/,
  `import { usersRouter } from './routes/users.js';\nimport { institutionsRouter } from './routes/institutions.js';`
);

content = content.replace(
  /apiRouter\.use\('\/users', usersRouter\);/,
  `apiRouter.use('/users', usersRouter);\napiRouter.use('/institutions', institutionsRouter);`
);

fs.writeFileSync('backend/src/app.js', content);
console.log('app.js patched to include institutionsRouter');
