import fs from 'fs';

let c = fs.readFileSync('backend/src/routes/conversations.js', 'utf8');

c = c.replace(
    "import { forbidden, notFound } from '../utils/httpError.js';",
    "import { forbidden, notFound, HttpError } from '../utils/httpError.js';"
);

// I actually used `throw new HttpError(403, ...)` in patch_message_enforcement.js.
// Let me just replace `throw new HttpError(403, ...)` with `throw forbidden(...)` to be completely safe and clean.
c = c.replace(
    /throw new HttpError\(403, ('.*?')\);/g,
    "throw forbidden($1);"
);

fs.writeFileSync('backend/src/routes/conversations.js', c);
console.log("Fixed HttpError and imports in conversations.js!");
