/* ===== IMPORTS ===== */
import RuleLogic from "./Rule.js";

function Rule({ rule }) {
  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { splitRule } = RuleLogic();

  /* ===== RULE COMPONENT ===== */
  return (
    <li>
      { splitRule(rule).map((line, index) => {
        const key = `${ index }-${ line.trim() || "empty" }`;
        return <p key={ key }>{ line }</p>;
      })}
    </li>
  );
};

/* ===== EXPORTS ===== */
export default Rule;