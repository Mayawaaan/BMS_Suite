import React, { createContext, useContext, useRef } from 'react';

const LenisContext = createContext(null);

export const useLenis = () => useContext(LenisContext);

export const SmoothScrollProvider = ({ children }) => {
  // Safe smooth scroll ref that preserves native trackpad and mousewheel gestures
  const scrollRef = useRef({
    scrollTo: (target, options = {}) => {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', ...options });
      } else {
        const main = document.querySelector('main');
        if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    stop: () => {},
    start: () => {},
    raf: () => {},
    destroy: () => {},
  });

  return (
    <LenisContext.Provider value={scrollRef.current}>
      {children}
    </LenisContext.Provider>
  );
};
