/* ===== IMPORTS ===== */
import { useEffect, useRef } from "react";

function Imgur({ id, isAlbum }) {
  /* ===== REFS ===== */

  // Used to isolate the Imgur embed in its own DOM subtree
  const containerRef = useRef(null);

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create the blockquote imperatively so React never tracks this node
    const blockquote = document.createElement("blockquote");
    blockquote.className = "imgur-embed-pub";
    blockquote.lang = "en";
    blockquote.setAttribute("data-id", isAlbum ? `a/${id}` : id);

    const anchor = document.createElement("a");
    anchor.href = `//imgur.com/${isAlbum ? `a/${id}` : id}`;
    blockquote.appendChild(anchor);
    container.appendChild(blockquote);

    const script = document.createElement("script");
    script.src = "//s.imgur.com/min/embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = "";
      }

      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [id, isAlbum]);

  /* ===== IMGUR COMPONENT ===== */

  // React owns just the div wrapper, Imgur safely maintains contents within `containerRef`
  return <div ref={ containerRef } />;
};

/* ===== EXPORTS ===== */
export default Imgur;
