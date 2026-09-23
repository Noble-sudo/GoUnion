import fs from 'fs';

let c = fs.readFileSync('frontend/components/admin/UserDirectory.jsx', 'utf8');

const rowContent = `
                  <motion.tr 
                    key={user.id} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img src={user.avatarUrl || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-full border border-white/10 object-cover" />
                        <div>
                          <div className="font-bold text-white">{user.fullName}</div>
                          <div className="text-xs text-white/50">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white/70">
                      {user.university || 'No campus'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-red-500/10 text-red-400"><ShieldAlert size={12}/> Admin</span>
                      ) : user.role === 'moderator' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-blue-500/10 text-blue-400"><ShieldCheck size={12}/> Mod</span>
                      ) : (
                        <span className="text-white/50 text-xs">User</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isActive ?? true ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-green-500/10 text-green-400"><CheckCircle size={12}/> Active</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-white/10 text-white/50"><Ban size={12}/> Suspended</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white/50">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.role !== 'admin' && (
                          <button 
                            onClick={() => handlePromote(user.id, 'admin')}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                            title="Promote to Admin"
                          >
                            <UserCog size={16} />
                          </button>
                        )}
                        {user.role !== 'moderator' && user.role !== 'admin' && (
                          <button 
                            onClick={() => handlePromote(user.id, 'moderator')}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-blue-500/20 text-white/40 hover:text-blue-400 transition-colors"
                            title="Promote to Mod"
                          >
                            <UserCheck size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleToggleStatus(user.id)}
                          className={\`p-1.5 rounded-lg \${user.isActive ?? true ? 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white' : 'bg-red-500/10 hover:bg-green-500/20 text-red-400 hover:text-green-400'} transition-colors\`}
                          title={user.isActive ?? true ? "Suspend User" : "Reactivate User"}
                        >
                          <UserX size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
`;

c = c.replace(/<motion\.tr><\/motion\.tr>/g, rowContent);
fs.writeFileSync('frontend/components/admin/UserDirectory.jsx', c);
console.log('Restored table rows!');
