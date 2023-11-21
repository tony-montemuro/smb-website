/* ===== IMPORTS ===== */
import RuleLogic from "./Rule.js";

function Rule({ rule }) {
  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { splitRule } = RuleLogic();

  /* ===== RULE COMPONENT ===== */
  return (
    <li>
      { splitRule(rule).map(line => {
        return <p key={ line }>{ line }</p>;
      })}
    </li>
  );
};

/* ===== EXPORTS ===== */
export default Rule;