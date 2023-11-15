/* ===== IMPORTS ===== */
import styles from "./Icon.module.css";

function BananaIcon({ title }) {
  /* ===== NORMAL ICON COMPONENT ===== */
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={ styles.icon }
      width="341.333"
      height="341.333"
      version="1"
      viewBox="0 0 256 256"
    >
      <path
        d="M358 2125c-10-13-18-27-18-32 0-4 32-30 70-57 39-27 74-54 79-60s19-160 31-341l22-330 87-190 86-191 145-136 145-137 264-126 264-126 290-9 290-8 62 50 62 49-61 58c-46 44-103 80-236 151-479 253-473 249-656 402-93 79-211 174-262 213-91 69-94 72-238 293-122 186-151 237-172 304l-24 82 28 25c16 15 47 40 69 58l40 31-24 26c-24 26-26 26-175 26-148-1-151-1-168-25z"
        transform="matrix(.1 0 0 -.1 0 256)"
      ></path>
      <title>{ title }</title>
    </svg>
  );
}

/* ===== EXPORTS ===== */
export default BananaIcon;