/* ===== IMPORTS ===== */
import styles from "./Icon.module.css";

function ModIcon({ title }) {
  /* ===== MOD ICON ===== */
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="400"
      height="400"
      version="1"
      viewBox="0 0 300 300"
      className={ styles.icon }
    >
      <path
        d="M2417 2671c-241-45-312-62-326-77-10-10-236-291-501-624s-489-612-496-620c-12-13-37 8-184 155l-170 170-107-108-108-107 188-188 187-187-187-187-188-187-45 16c-82 29-167-6-208-87-47-94-23-156 112-288 128-126 184-146 276-100 81 41 116 126 87 208l-16 45 187 188 187 187 187-187 188-188 107 108 108 107-170 170c-147 147-168 172-155 184 8 7 295 237 637 510 342 274 624 505 627 514s28 145 56 302 54 295 57 308c3 15 1 22-8 21-8-1-153-27-322-58zm202-320c-18-100-37-181-43-181-11 0-218 62-226 67-2 2 63 71 145 153s151 147 153 145-11-85-29-184zm-251-249c68-21 122-43 121-48-3-10-1118-904-1129-904-3 0-17 11-30 25l-24 26 469 469 470 470s55-17 123-38z"
        transform="matrix(.1 0 0 -.1 0 300)"
      ></path>
      <title>{ title }</title>
    </svg>
  );
}

/* ===== EXPORTS ===== */
export default ModIcon;