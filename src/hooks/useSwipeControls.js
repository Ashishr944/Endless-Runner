import { useEffect, useRef } from 'react';

export function useSwipeControls(actions) {
  const start = useRef(null);

  useEffect(() => {
    const onStart = (event) => {
      const touch = event.changedTouches[0];
      start.current = { x: touch.clientX, y: touch.clientY, t: performance.now() };
    };

    const onEnd = (event) => {
      if (!start.current) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - start.current.x;
      const dy = touch.clientY - start.current.y;
      const elapsed = performance.now() - start.current.t;
      start.current = null;
      if (elapsed > 700 || Math.max(Math.abs(dx), Math.abs(dy)) < 38) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) actions.right();
        else actions.left();
      } else if (dy < 0) {
        actions.jump();
      } else {
        actions.slide();
      }
    };

    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend', onEnd);
    };
  }, [actions]);
}
