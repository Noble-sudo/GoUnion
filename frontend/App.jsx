import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { Sidebar } from "./components/layout/Sidebar";
import { RightSidebar } from "./components/layout/RightSidebar";
import { TopNav } from "./components/layout/TopNav";
import { MobileNav } from "./components/layout/MobileNav";
import { PwaInstallBanner } from "./components/layout/PwaInstallBanner";
import { Dashboard } from "./pages/Dashboard";
import { Landing } from "./pages/Landing";
import { Konnect } from "./pages/Konnect";
import { Teaky } from "./pages/Teaky";
import { InstitutionFeed } from "./pages/InstitutionFeed";
import { Login } from "./pages/Login";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { Groups } from "./pages/Groups";
import { Messages } from "./pages/Messages";
import { Profile } from "./pages/Profile";
import { PostDetail } from "./pages/PostDetail";
import { GroupDetails } from "./pages/GroupDetails";
import { AdminPanel } from "./pages/AdminPanel";
import { Settings } from "./pages/Settings";
import { Notifications } from "./pages/Notifications";
import { DownloadPage } from "./pages/Download";
import { SoundFeed } from "./pages/SoundFeed";
import { ConfirmEmail } from "./pages/ConfirmEmail";
import { ConfirmIdentity } from "./pages/ConfirmIdentity";
import { Onboarding } from "./pages/Onboarding";
import { useAuthStore } from "./store";
import { PwaUpdater } from "./components/pwa/PwaUpdater";
import { ToastProvider } from "./components/ui/Toast";
import { ConfirmProvider } from "./components/ui/ConfirmProvider";
import { usePushNotifications } from "./hooks/usePushNotifications";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 20, refetchOnWindowFocus: false },
  },
});

const AppLayout = ({ children }) => {
  const location = useLocation();
  const isMessages = location.pathname === '/messages' || (location.pathname.startsWith('/groups/') && location.pathname !== '/groups');
  const isKonnect = location.pathname === '/konnect' || location.pathname.startsWith('/institutions/');
  
  return (
    <div className="flex min-h-screen bg-[var(--rc-bg)] text-white selection:bg-[var(--rc-go)] selection:text-black">
      <Sidebar />
      <div className={`flex-1 pb-20 md:ml-[72px] lg:ml-[260px] md:pb-0 ${!isMessages && !isKonnect ? 'lg:mr-[300px]' : ''}`}>
        {!isKonnect && <TopNav />}
        <main className={isMessages || isKonnect ? "w-full" : "px-4 py-6 md:px-8 max-w-5xl mx-auto"}>
          {children}
        </main>
      </div>
      {!isMessages && !isKonnect && <RightSidebar />}
      {!isMessages && <MobileNav />}
    </div>
  );
};

const PrivateRoute = ({ children, noLayout }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if ((!user?.institution_id || user?.verification_status === 'REJECTED') && !['admin', 'moderator'].includes(user?.role) && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (noLayout) return <>{children}</>;
  return <AppLayout>{children}</AppLayout>;
};

const AppRoutes = () => {
    const { isAuthenticated, updateUser } = useAuthStore();
    usePushNotifications();

    useEffect(() => {
      if (isAuthenticated) {
        import('./services/api').then(({ api }) => {
          api.users.me().then(me => {
             if (me && me.id) updateUser(me);
          }).catch(console.error);
        });
      }
    }, [isAuthenticated]);

  return (
    <ErrorBoundary>
      <PwaUpdater />
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/download" element={<DownloadPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        
        <Route path="/" element={isAuthenticated ? <PrivateRoute><Dashboard /></PrivateRoute> : <Landing />} />
        
        {/* Onboarding doesn't use the standard layout to avoid distractions */}
        <Route path="/onboarding" element={isAuthenticated ? <Onboarding /> : <Navigate to="/login" />} />
        
        <Route path="/groups" element={<PrivateRoute><Groups /></PrivateRoute>} />
        <Route path="/groups/:id" element={<PrivateRoute><GroupDetails /></PrivateRoute>} />
        <Route path="/messages" element={<PrivateRoute noLayout><Messages /></PrivateRoute>} />
        <Route path="/profile/:username" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/post/:id" element={<PrivateRoute><PostDetail /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute noLayout><AdminPanel /></PrivateRoute>} />
        <Route path="/konnect" element={<PrivateRoute><Konnect /></PrivateRoute>} />
        <Route path="/institutions/:id" element={<PrivateRoute><InstitutionFeed /></PrivateRoute>} />
        <Route path="/teaky" element={<PrivateRoute><Teaky /></PrivateRoute>} />
        <Route path="/sound/:soundName" element={<PrivateRoute><SoundFeed /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ErrorBoundary>
  );
};

import { SocketProvider } from './components/SocketProvider';

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ConfirmProvider>
          <BrowserRouter>
            <SocketProvider>
              <PwaInstallBanner />
                <AppRoutes />
            </SocketProvider>
          </BrowserRouter>
        </ConfirmProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;
