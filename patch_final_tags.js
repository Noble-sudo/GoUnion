const fs = require('fs');
let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

c = c.replace(
    /<\/div>\r?\n\r?\n\s*<\/div>\r?\n\s*<div className="p-3 bg-\[#050505\]">/g,
    `</div>\n                    <div className="p-3 bg-[#050505]">`
);

c = c.replace(
    /<\/div>\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\s*<\/div>\r?\n\s*<\/motion\.div>/g,
    `</div>\n                                                            </div>\n                                                            </div>\n                                                          </motion.div>`
);

// Also remove `)}` if that was the "unterminated regex" error because of the extra `)}`?
// Oh wait:
// 869|                                                                </div>
// 870|                                                            </motion.div>
// 871|          )}
c = c.replace(
    /<\/motion\.div>\r?\n\s*\)\}\r?\n\s*<\/React\.Fragment>/g,
    `</motion.div>\n                                                      </React.Fragment>`
);

fs.writeFileSync('frontend/pages/Messages.jsx', c);
console.log('Fixed unmatched divs and brace');
