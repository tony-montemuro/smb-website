/* ===== IMPORTS ===== */
import "./Home.css";
import { useEffect } from "react";
import HomeLogic from "./Home.js";

function Home() {
  /* ===== STATES & FUNCTIONS ===== */

  // states and functions from the js file
  const { submissions, getSubmissions } = HomeLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the home component mounts
  useEffect(() => {
    getSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== HOME COMPONENT ===== */
  return (
    <>
      <div className="home-header">
        <h1>Welcome to SMBElite!</h1>
        <i>The website for all things Monkey Ball ILs</i>
      </div>
      <div className="home-body">
        <h2>Recent Submissions</h2>
      </div>
    </>
  );
};

/* ===== EXPORTS ===== */
export default Home;