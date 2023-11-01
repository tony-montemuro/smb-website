/* ===== IMPORTS ===== */
import styles from "./Icon.module.css";

function LiveIcon() {
  /* ===== LIVE ICON COMPONENT ===== */
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={ styles.icon }
      data-testid="VideocamIcon"
      version="1.1"
      viewBox="0 0 24 24"
    >
      <path d="M17 6.583v-3.5c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11z"></path>
      <text
        xmlSpace="preserve"
        style={{}}
        x="2.014"
        y="21.973"
        strokeWidth="0.816"
        fontFamily="Microsoft JhengHei UI"
        fontSize="9.794"
        fontStretch="normal"
        fontStyle="normal"
        fontVariant="normal"
        fontWeight="normal"
      >
        <tspan
          x="2.014"
          y="21.973"
          style={{}}
          strokeWidth="0.816"
          fontFamily="Microsoft JhengHei UI"
          fontStretch="normal"
          fontStyle="normal"
          fontVariant="normal"
          fontWeight="normal"
        >
          LIVE
        </tspan>
        <title>Has live proof</title>
      </text>
    </svg>
  );
}

/* ===== EXPORTS ===== */
export default LiveIcon;