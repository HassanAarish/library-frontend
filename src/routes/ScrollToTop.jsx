import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** New page → start at the top (but keep in-page #anchor jumps). */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
};

export default ScrollToTop;
