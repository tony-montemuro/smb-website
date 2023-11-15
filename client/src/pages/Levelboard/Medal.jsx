/* ===== IMPORTS ===== */
import BronzeIcon from "../../assets/svg/Icons/BronzeIcon.jsx";
import GoldIcon from "../../assets/svg/Icons/GoldIcon.jsx";
import PlatinumIcon from "../../assets/svg/Icons/PlatinumIcon.jsx";
import SilverIcon from "../../assets/svg/Icons/SilverIcon.jsx";

function Medal({ medal }) {
  /* ===== MEDAL COMPONENT ===== */
  switch(medal) {
    case "platinum": return <PlatinumIcon />;
    case "gold": return <GoldIcon />;
    case "silver": return <SilverIcon />;
    case "bronze":  return <BronzeIcon />;
    default: return null;
  };
};

/* ===== EXPORTS ===== */
export default Medal;