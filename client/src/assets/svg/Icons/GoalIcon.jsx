/* ===== IMPORTS ===== */
import styles from "./Icon.module.css";

function GoalIcon({ goal }) {
  /* ===== FUNCTION ===== */

  // FUNCTION 1: goalToColor - simple function which converts goal string to a color
  // PRECONDITIONS: NONE
  // POSTCONDITIONS (1 possible outcome):
  // the string containing an rbg color value associated with `goal` is returned
  const goalToColor = () => {
    switch (goal) {
      case "blue": return "rgb(58,105,164)";
      case "green": return "rgb(55,173,88)";
      case "red": return "rgb(174,60,67)";
      default: return "rgb(255,255,255)";
    };
  };

  /* ===== GOAL ICON COMPONENT ===== */
  return goal && (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={ styles.icon }
      style={ { fill: goalToColor() } }
      width="498.667"
      height="498.667"
      version="1"
      viewBox="0 0 374 374"
    >
      <path
        d="M1690 3590c-330-46-602-181-835-415-281-281-420-618-420-1020 0-397 135-730 411-1013l104-107 2-435 3-435h310l3 158c3 157 3 157 25 152 88-21 207-28 517-32 288-4 382-2 498 11 78 9 149 19 157 22 12 5 15-19 17-153l3-158h320l3 449 2 449 89 92c258 270 401 626 401 1000 0 389-148 744-425 1020-207 208-442 336-723 395-111 24-359 34-462 20zm350-120c173-22 347-80 505-171 83-47 235-163 235-179 0-7-310-10-907-10H967l18 20c34 38 160 129 240 175 249 142 534 199 815 165zm1094-1227l69-6-6-126c-16-356-158-669-411-909-182-172-401-285-656-339-118-25-382-25-500 0-536 113-936 512-1045 1042-9 44-19 140-22 213l-6 132h1254c690 0 1285-3 1323-7zM2477 674c-2-3-39-11-81-19-140-27-351-38-621-32-245 6-329 13-452 38l-53 10v168l60-25c339-138 742-136 1079 4l66 28 3-84c2-47 1-86-1-88z"
        transform="matrix(.1 0 0 -.1 0 374)"
      ></path>
      <path
        d="M1760 2015c-224-63-365-308-306-532 64-241 295-379 531-318 156 41 281 174 316 336 14 67 6 180-17 239-46 117-146 220-254 261-73 28-197 34-270 14z"
        transform="matrix(.1 0 0 -.1 0 374)"
      ></path>
      <title>This chart is for runs in the { goal } goal only.</title>
    </svg>
  );
}

export default GoalIcon;