import "./userstats.css";
import React, { useEffect } from "react";
import UserStatsInit from "./UserStatsInit";

function UserStats() {
    const { title, checkPath } = UserStatsInit();

    useEffect(() => {
        checkPath();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

  return (
    <div>{title}</div>
  );
}

export default UserStats;