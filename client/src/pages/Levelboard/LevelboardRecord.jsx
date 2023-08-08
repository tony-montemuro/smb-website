/* ===== IMPORTS ===== */
import { Link, useLocation } from "react-router-dom";
import { red } from "@mui/material/colors";
import CheckIcon from "@mui/icons-material/Check";
import FrontendHelper from "../../helper/FrontendHelper";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";

function LevelboardRecord({ submission, iconSize }) {
  /* ===== VARIABLES ===== */
  const location = useLocation();
  const path = location.pathname.split("/");
  const abb = path[2];
  const category = path[3];
  const type = path[4];
  const levelName = path[5];

  /* ===== FUNCTIONS ===== */
  const { recordB2F } = FrontendHelper();

  /* ===== LEVELBOARD RECORD COMPONENT ===== */
  return (
    <span>

      { /* If submission is approved, render a checkbox next to the record */ }
      { submission.approved ? 
        <div className="levelboard-aligned-span">
          <CheckIcon 
            fontSize={ iconSize }
            titleAccess="This submission has been approved by a moderator."
          />
        </div>
      :

        // If submission has a report, render a warning icon next to the record 
        submission.report ?
          <div className="levelboard-aligned-span">
            <WarningRoundedIcon 
              fontSize={ iconSize }
              titleAccess="This submission has been reported." 
              sx={{ color: red[500] }} 
            />
          </div>
        :

          // Otherwise, render no icon
          null
      }

      { /* Render the record, as well as a link to the user's submission history on the chart. */ }
      <Link to={ `/games/${ abb }/${ category }/${ type }/${ levelName }/${ submission.profile.id }` }>
        { recordB2F(submission.details.record, type) }
      </Link>
      
    </span>
  );

};

/* ===== EXPORTS ===== */
export default LevelboardRecord;