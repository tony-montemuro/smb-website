/* ===== IMPORTS ===== */
import FrontendHelper from "../../helper/FrontendHelper";

/* ===== FUNCTIONS ===== */

// helper functions
const { dateB2F } = FrontendHelper();

/* ===== EXPORTS ===== */

// EXPORT 1: Live position component - render the live position field, based on the `id` and `submittedAt` parameters
export function LivePosition({ position, id, submittedAt }) {
  return position ?
    dateB2F(id) === dateB2F(submittedAt) ? position : (
        <span title="Date does not match the timestamp it was submitted at, so live position could not be calculated.">
          -
        </span>
      )
    : 
      <span title="Not a live submission.">-</span>;
};

// EXPORT 2: Position component - render the position field, based on the `id` and `submittedAt` parameters
export function Position(position, id, submittedAt) {
  return dateB2F(id) === dateB2F(submittedAt) ? position : (
    <span title="Date does not match the timestamp it was submitted at, so position could not be calculated.">
      -
    </span>
  );
};