import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store";

// Pages that should not get a Pulse entry underneath them.
const SKIP = ["/", "/login", "/download", "/forgot-password", "/reset-password", "/confirm-email", "/confirm-identity", "/onboarding", "/admin"];

// If the app opens straight on a page (refresh, notification tap, shared link), put Pulse underneath it
// so the phone's back button lands on Pulse instead of closing the app.
export const BackToPulse = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    if (!isAuthenticated || SKIP.includes(location.pathname)) return;
    const idx = window.history.state?.idx ?? 0;
    if (idx !== 0) return;
    const target = location.pathname + location.search + location.hash;
    navigate("/", { replace: true });
    navigate(target);
  }, []);

  return null;
};
