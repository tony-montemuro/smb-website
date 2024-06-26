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
        return <p key={ `${ line }_${ index }` }>{ line }</p>;
      })}
    </li>
  );
};

/* ===== EXPORTS ===== */
export default Rule;