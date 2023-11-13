/* ===== IMPORTS ===== */
import styles from "./Positions.module.css";
import FrontendHelper from "../../helper/FrontendHelper";

/* ===== FUNCTIONS ===== */

// helper functions
const { dateB2F } = FrontendHelper();

// FUNCTION 1: renderPosition - boolean function that determines whether or not a position component should render the position value
// PRECONDITIONS (2 parameters):
// 1.) id: a string storing the timestamp that the submission was submitted at
// 2.) submittedAt: a string storing the timestamp that the submission was achieved at
// POSTCONDITIONS (2 possible outcomes):
// if the two dates match (excluding exact time), return true
// otherwise, return false
const renderPosition = (id, submittedAt) => dateB2F(id) === dateB2F(submittedAt);

/* ===== EXPORTS ===== */

// EXPORT 1: renderPosition function
export { renderPosition };

// EXPORT 2: Position disclaimer component - render a disclaimer regarding the position and live position fields
export function PositionDisclaimer() {
  return (
    <div className={ styles.disclaimer }>
      <details>
        <summary><h3>About Position</h3></summary>
        <div className={ styles.details }>
          <span><strong>Position</strong> and <strong>Live Position</strong> are both recorded the moment the submission is first created, meaning these values may become inaccurate as time passes.</span>
          <ul>
            <li><strong>Position</strong> compares the submission against all other active submissions of the chart.</li>
            <li><strong>Live Position</strong> is only calculated if the submission has a live proof, and compares the submission against all other active live submissions of the chart.</li>
          </ul>
          <span>Neither of these values are recorded if the date of the submission does not match the date it was submitted.</span>
        </div>
      </details>
    </div>
  );
};

// EXPORT 3: Live position component - render the live position field, based on the `id` and `submittedAt` parameters
export function LivePosition({ position, id, submittedAt }) {
  console.log(id);
  console.log(submittedAt);
  return position ?
    renderPosition(id, submittedAt) ? position : (
        <span title="Date does not match the timestamp it was submitted at, so live position could not be calculated.">
          -
        </span>
      )
    : 
      <span title="Not a live submission.">-</span>;
};

// EXPORT 4: Position component - render the position field, based on the `id` and `submittedAt` parameters
export function Position({ position, id, submittedAt }) {
  return renderPosition(id, submittedAt) ? position : (
    <span title="Date does not match the timestamp it was submitted at, so position could not be calculated.">
      -
    </span>
  );
};