import { useEffect, useRef } from 'react';

const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export default function useInactivityLogout(isLoggedIn, onLogout) {
  const timer = useRef(null);

  useEffect(() => {
    if (!isLoggedIn) return;

    const reset = () => {
      clearTimeout(timer.current);
      timer.current = setTimeout(onLogout, TIMEOUT_MS);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach((e) => window.addEventListener(e, reset));
    reset();

    return () => {
      clearTimeout(timer.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [isLoggedIn, onLogout]);
}
