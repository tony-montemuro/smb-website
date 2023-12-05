/* ===== IMPORTS ===== */
import { useEffect } from "react";

function Imgur({ id, isAlbum }) {
  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//s.imgur.com/min/embed.js";
    script.async = true;
    document.body.appendChild(script);
  
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  /* ===== IMGUR COMPONENT ===== */
  return (
    <blockquote className="imgur-embed-pub" lang="en" data-id={ isAlbum ? `a/${ id }` : id } >
      {/* eslint-disable jsx-a11y/anchor-has-content */}
      <a href={`//imgur.com/${ isAlbum ? `a/${ id }` : id }`}></a>
    </blockquote>
  );
};

/* ===== EXPORTS ===== */
export default Imgur;