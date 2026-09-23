import fs from 'fs';

let c = fs.readFileSync('frontend/pages/Messages.jsx', 'utf8');

const target = `<div className={\`flex max-w-[82%] flex-col gap-1 sm:max-w-[70%] \${mine ? "items-end" : "items-start"}\`}>`;

const replacement = `<div className={\`flex max-w-[82%] gap-2 sm:max-w-[70%] \${mine ? "flex-row-reverse items-end" : "flex-row items-end"}\`}>
                                                                {!mine && activeChat?.partner?.isGroup && (
                                                                    <Avatar src={msg.sender?.avatarUrl} alt={msg.sender?.fullName || 'User'} label={msg.sender?.fullName || 'U'} className="h-7 w-7 rounded-full shrink-0 border border-white/5 object-cover mb-6 bg-white/5" />
                                                                )}
                                                                <div className={\`flex flex-col gap-1 \${mine ? "items-end" : "items-start"}\`}>`;

c = c.replace(target, replacement);

const endTarget = `                                                                </div>
                                                            </div>
                                                        </motion.div>`;

const endReplacement = `                                                                </div>
                                                            </div>
                                                            </div>
                                                        </motion.div>`;

if (c.includes(endTarget)) {
    c = c.replace(endTarget, endReplacement);
    fs.writeFileSync('frontend/pages/Messages.jsx', c);
    console.log("Successfully injected Avatar into Group Chat messages.");
} else {
    console.log("End target found: false");
}
