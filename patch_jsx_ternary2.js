import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    /                                \)}\r?\n                            <\/footer>\r?\n                        <\/>/,
    '                                )}\n                            </footer>\n                            )}\n                        </>'
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log("Fixed JSX ternary closure with regex!");
