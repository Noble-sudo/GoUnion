import fs from 'fs';

let code = fs.readFileSync('frontend/components/feed/CreateStatusModal.jsx', 'utf8');

// We need to add the import for CameraModal if not present.
if (!code.includes('CameraModal')) {
    code = code.replace(
        'import { Avatar } from "../ui/Avatar";',
        'import { Avatar } from "../ui/Avatar";\nimport { CameraModal } from "../chat/CameraModal";'
    );
}

// Add state for showing camera
code = code.replace(
    'const [isSubmitting, setIsSubmitting] = useState(false);',
    'const [isSubmitting, setIsSubmitting] = useState(false);\n      const [showCamera, setShowCamera] = useState(false);'
);

// Add the CameraModal component rendering
const cameraModalJsx = `
      {showCamera && (
        <CameraModal 
          onClose={() => setShowCamera(false)} 
          onCapture={(file) => {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setShowCamera(false);
          }} 
        />
      )}
`;

code = code.replace(
    /<\/AnimatePresence>\)\);/g,
    `</AnimatePresence>${cameraModalJsx}));`
);

// Change the camera button from <input> to trigger the state
const oldCameraLabel = `[_jsx(Camera, { size: 20 }), _jsx("span", { className: "text-[10px] font-black uppercase tracking-widest hidden sm:inline", children: "Camera" }), _jsx("input", { type: "file", className: "hidden", accept: "image/*,video/*", capture: "environment", onChange: handleImageChange })]`;
const newCameraLabel = `[_jsx(Camera, { size: 20 }), _jsx("span", { className: "text-[10px] font-black uppercase tracking-widest hidden sm:inline", children: "Camera" })]`;

code = code.replace(oldCameraLabel, newCameraLabel);
code = code.replace(
    `className: "flex items-center gap-2 hover:text-primary transition-colors cursor-pointer"`,
    `className: "flex items-center gap-2 hover:text-primary transition-colors cursor-pointer", onClick: (e) => { e.preventDefault(); setShowCamera(true); }`
);

fs.writeFileSync('frontend/components/feed/CreateStatusModal.jsx', code);
console.log('Patched CreateStatusModal.jsx');
