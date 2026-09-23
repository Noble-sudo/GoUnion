import fs from 'fs';

let dashboard = fs.readFileSync('frontend/pages/Dashboard.jsx', 'utf8');

const regex = /\{posts\.length === 0 \? \([\s\S]*? \) : \(\s*posts\.map\(\(post\)/;

const fixed = `{posts.length === 0 ? (
                activeTab === "following" ? (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-6 py-20 text-center">
                    <p className="rc-label">Your network is quiet</p>
                    <h2 className="mt-3 text-2xl font-black text-white">No posts from your connections</h2>
                    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/42">
                      When people you follow share posts or videos, they'll appear here. Connect with more students or check the 'For You' tab to discover what's happening on campus.
                    </p>
                  </div>
                ) : activeTab === "trending" ? (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-6 py-20 text-center">
                    <p className="rc-label">Nothing trending yet</p>
                    <h2 className="mt-3 text-2xl font-black text-white">Campus is warming up</h2>
                    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/42">
                      The most liked and discussed posts will bubble up here. Start engaging with posts to help them trend!
                    </p>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-6 py-20 text-center">
                    <p className="rc-label">Campus Pulse is quiet</p>
                    <h2 className="mt-3 text-2xl font-black text-white">Be the first to drop something.</h2>
                    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/42">
                      Start with a question, campus update, event, or thought your community can respond to.
                    </p>
                  </div>
                )
              ) : (
                posts.map((post)`;

dashboard = dashboard.replace(regex, fixed);
fs.writeFileSync('frontend/pages/Dashboard.jsx', dashboard);
