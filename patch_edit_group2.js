import fs from 'fs';
let file = fs.readFileSync('frontend/components/groups/EditGroupModal.jsx', 'utf8');
file = file.replace(
  'import { useToast } from "../../hooks/useToast";',
  'import { useToast } from "../ui/Toast";'
);
fs.writeFileSync('frontend/components/groups/EditGroupModal.jsx', file);
