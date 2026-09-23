import fs from 'fs';

let c = fs.readFileSync('frontend/components/admin/ModerationQueue.jsx', 'utf8');

if (!c.includes("import { Link }")) {
    c = c.replace(
        "import { Shield, Check, X, AlertTriangle, UserX, Image as ImageIcon } from 'lucide-react';",
        "import { Shield, Check, X, AlertTriangle, UserX, Image as ImageIcon, ExternalLink } from 'lucide-react';\nimport { Link } from 'react-router-dom';"
    );
}

// 1. Update handleTakeDown to prompt for reason
const handleTakeDownRegex = /const handleTakeDown = \(id\) => \{[\s\S]*?\};/;
const newHandleTakeDown = `const handleTakeDown = (id) => {
    const reason = window.prompt("Are you sure you want to take this down? Provide a reason/warning to the creator:");
    if (reason !== null && reason.trim() !== "") {
      resolveMutation.mutate({ id, status: 'resolved', take_down_reason: reason.trim() });
    } else if (reason !== null) {
      alert("A reason is required to take down a post.");
    }
  };`;
c = c.replace(handleTakeDownRegex, newHandleTakeDown);

// Note: Ensure resolution property matches the mutation fn.
const mutationFnRegex = /mutationFn: \(\{ id, status, resolution \}\) => api\.reports\.resolve\(id, status, resolution\),/;
const newMutationFn = `mutationFn: ({ id, status, take_down_reason }) => api.reports.resolve(id, status, take_down_reason),`;
c = c.replace(mutationFnRegex, newMutationFn);

// 2. Add "View Post" link inside Post Preview
const postPreviewRegex = /<span className="text-xs text-white\/40 mb-2 block uppercase tracking-widest font-bold">Post Preview<\/span>/;
const newPostPreview = `<div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-white/40 uppercase tracking-widest font-bold">Post Preview</span>
                      <Link to={\`/post/\${report.post.id}\`} target="_blank" className="text-xs text-primary hover:underline flex items-center gap-1">
                         <ExternalLink className="w-3 h-3"/> View full post
                      </Link>
                    </div>`;
c = c.replace(postPreviewRegex, newPostPreview);

fs.writeFileSync('frontend/components/admin/ModerationQueue.jsx', c);
console.log('Patched ModerationQueue logic successfully!');
