const fs = require('fs');
let c = fs.readFileSync('frontend/App.jsx', 'utf8');

if (!c.includes('api.users.me()')) {
    c = c.replace(
        /const AppRoutes = \(\) => \{\s*const \{ isAuthenticated \} = useAuthStore\(\);/,
        `const AppRoutes = () => {
    const { isAuthenticated, updateUser } = useAuthStore();

    useEffect(() => {
      if (isAuthenticated) {
        import('./services/api').then(({ api }) => {
          api.users.me().then(me => {
             if (me && me.id) updateUser(me);
          }).catch(console.error);
        });
      }
    }, [isAuthenticated]);`
    );
    fs.writeFileSync('frontend/App.jsx', c);
    console.log("Patched AppRoutes to auto-fetch user");
} else {
    console.log("Already patched");
}
