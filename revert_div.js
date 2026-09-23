import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(/  <\/div>\n                                                        <\/motion\.div>\n                                                    <\/React\.Fragment>/g, '                                                        </motion.div>\n                                                    </React.Fragment>');

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log("Reverted the extra closing div");
