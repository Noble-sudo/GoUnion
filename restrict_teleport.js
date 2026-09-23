const fs = require('fs');
let content = fs.readFileSync('frontend/components/admin/CampusManager.jsx', 'utf8');

content = content.replace(
    "import { motion, AnimatePresence } from 'framer-motion';",
    "import { motion, AnimatePresence } from 'framer-motion';\nimport { useAuthStore } from '../../store';"
);

content = content.replace(
    "const queryClient = useQueryClient();",
    "const queryClient = useQueryClient();\n    const currentUser = useAuthStore((state) => state.user);"
);

content = content.replace(
    "<button \n                                    onClick={() => handleTeleport(campus)}\n                                    className=\"text-xs font-bold text-white hover:text-blue-400 transition-colors mr-3\"\n                                >\n                                    Teleport\n                                </button>",
    "{currentUser?.email === 'ezeilodavid292@gmail.com' && (\n                                    <button \n                                        onClick={() => handleTeleport(campus)}\n                                        className=\"text-xs font-bold text-white hover:text-blue-400 transition-colors mr-3\"\n                                    >\n                                        Teleport\n                                    </button>\n                                )}"
);

fs.writeFileSync('frontend/components/admin/CampusManager.jsx', content);
console.log('Restricted Teleport button');
