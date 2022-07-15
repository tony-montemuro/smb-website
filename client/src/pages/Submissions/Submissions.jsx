import { useEffect } from "react";
import SubmissionInit from "./SubmissionsInit";

function Submissions() {
  const { gameList, submissions, checkForMod } = SubmissionInit();

  useEffect(() => {
    checkForMod();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // once submissions has a property for each game, this means that our querying has completed
    // and we can proceed
    if (gameList.length > 0 && Object.keys(submissions).length === gameList.length) {
        console.log(submissions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissions]);

  return (
    <>
    
    </>
  );
}

export default Submissions;