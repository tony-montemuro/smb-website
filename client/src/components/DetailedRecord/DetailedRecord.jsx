/* ===== IMPORTS ===== */
import { Link, useLocation } from "react-router-dom";
import { red } from "@mui/material/colors";
import styles from "./DetailedRecord.module.css";
import CheckIcon from "@mui/icons-material/Check";
import FrontendHelper from "../../helper/FrontendHelper";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";

function DetailedRecord({ submission, iconSize, timerType }) {
  /* ===== FUNCTIONS ===== */
  const { recordB2F } = FrontendHelper();

  /* ===== VARIABLES ===== */
  const location = useLocation();
  const path = location.pathname.split("/");
  const abb = path[2];
  const category = path[3];
  const type = path[4];
  const levelName = path[5];
  const profileId = path[6];
  const historyPath = `/games/${ abb }/${ category }/${ type }/${ levelName }/${ submission.profile ? submission.profile.id : profileId }/${ submission.tas ? "tas" : "normal" }`;
  const record = recordB2F(submission.record, type, timerType);

  /* ===== LEVELBOARD RECORD COMPONENT ===== */
  return (
    <span className={ styles.detailedRecord }>

      { /* If submission is approved, render a checkbox next to the record */ }
      { submission.approve ? 
        <div className="inline-icon">
          <CheckIcon 
            color="success"
            fontSize={ iconSize }
            titleAccess="This submission has been approved by a moderator."
          />
        </div>
      :

        // If submission has a report, render a warning icon next to the record 
        submission.report ?
          <div className="inline-icon">
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

      { /* Render the record, and render the link, depending on whether or not `profileId` is defined. */ }
      { profileId ?
        record
      :
        <Link to={ historyPath }>{ record }</Link>
      }
      
    </span>
  );

};

/* ===== EXPORTS ===== */
export default DetailedRecord;