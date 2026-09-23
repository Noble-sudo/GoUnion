with open('C:/gounion/New folder (4)/GoUnion-Unified/frontend/pages/Login.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

import_search = '  const [fullName, setFullName] = useState("");'
import_replace = import_search + '''
  const [suspendedState, setSuspendedState] = useState(null);
  const [appealText, setAppealText] = useState("");
  const [appealSubmitting, setAppealSubmitting] = useState(false);
'''
text = text.replace(import_search, import_replace)

catch_search = '''    } catch (error) {
      const isTimeout = error.code === "ECONNABORTED"'''
catch_replace = '''    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.is_suspended) {
        setSuspendedState(error.response.data);
        return;
      }
      const isTimeout = error.code === "ECONNABORTED"'''
text = text.replace(catch_search, catch_replace)

render_search = '            <form onSubmit={handleSubmit} className="space-y-5">'
render_replace = '''            {suspendedState ? (
              <div className="space-y-6">
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
                  <h3 className="text-xl font-black text-red-400 mb-2">Account Suspended</h3>
                  <p className="text-sm text-red-300/80 mb-4">{suspendedState.suspension_reason}</p>
                  
                  {suspendedState.appeal_status === 'none' && (
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (!appealText.trim()) return;
                      setAppealSubmitting(true);
                      try {
                        await api.auth.submitAppeal(suspendedState.email || email, password, appealText);
                        setSuspendedState(prev => ({ ...prev, appeal_status: 'pending' }));
                      } catch(err) {
                        setError("Failed to submit appeal. Try again.");
                      } finally {
                        setAppealSubmitting(false);
                      }
                    }} className="space-y-3">
                      <textarea 
                        required 
                        value={appealText} 
                        onChange={(e) => setAppealText(e.target.value)} 
                        placeholder="State your case for appeal..." 
                        className="w-full min-h-[100px] rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-red-500/50"
                      ></textarea>
                      <button type="submit" disabled={appealSubmitting} className="w-full rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 py-3 text-sm font-bold transition disabled:opacity-50">
                        {appealSubmitting ? "Submitting..." : "Submit Appeal"}
                      </button>
                    </form>
                  )}
                  {suspendedState.appeal_status === 'pending' && (
                    <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-4 text-yellow-200 text-sm font-bold">
                      Your appeal is under review.
                    </div>
                  )}
                  {suspendedState.appeal_status === 'rejected' && (
                    <div className="rounded-xl bg-black/20 border border-white/5 p-4 text-white/50 text-sm font-bold">
                      Your appeal was rejected.
                    </div>
                  )}
                </div>
                <button type="button" onClick={() => { setSuspendedState(null); setError(null); }} className="w-full text-center text-sm text-white/45 hover:text-white transition">
                  Back to Login
                </button>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-5">'''

text = text.replace(render_search, render_replace)

form_close_search = '''              </div>
            </form>

            <button type="button" onClick={switchMode}'''

form_close_replace = '''              </div>
            </form>
            )}

            <button type="button" onClick={switchMode}'''

text = text.replace(form_close_search, form_close_replace)

with open('C:/gounion/New folder (4)/GoUnion-Unified/frontend/pages/Login.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
