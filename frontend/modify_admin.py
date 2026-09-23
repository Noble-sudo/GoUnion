with open('C:/gounion/New folder (4)/GoUnion-Unified/frontend/pages/AdminPanel.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

import_search = "import BroadcastCenter from '../components/admin/BroadcastCenter';"
import_replace = import_search + "\nimport SuspensionAppeals from '../components/admin/SuspensionAppeals';"
text = text.replace(import_search, import_replace)

lucide_search = "    Settings, LogOut, ChevronRight, Activity, Search\n} from 'lucide-react';"
lucide_replace = "    Settings, LogOut, ChevronRight, Activity, Search, Scale\n} from 'lucide-react';"
text = text.replace(lucide_search, lucide_replace)

nav_search = "        { id: 'moderation', label: 'Moderation Queue', icon: ShieldAlert },"
nav_replace = nav_search + "\n        { id: 'appeals', label: 'Appeals', icon: Scale },"
text = text.replace(nav_search, nav_replace)

render_search = "            case 'moderation': return <ModerationQueue />;"
render_replace = render_search + "\n            case 'appeals': return <SuspensionAppeals />;"
text = text.replace(render_search, render_replace)

with open('C:/gounion/New folder (4)/GoUnion-Unified/frontend/pages/AdminPanel.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
