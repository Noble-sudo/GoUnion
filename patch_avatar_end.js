import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(/<\/motion\.div>\r?\n\s+<\/React\.Fragment>/g, '  </div>\n                                                        </motion.div>\n                                                    </React.Fragment>');

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log("Successfully closed avatar div");
