/* ===== IMPORTS ===== */
import { Emulators, General, PausingRule, ProofRequirements, Regions, ReplayErrors, ScoreCalculation, Types } from "./Content.jsx";
import styles from "./Overview.module.css";
import Container from "../../components/Container/Container.jsx";
import FrontendHelper from "../../helper/FrontendHelper";

function Overview({ imageReducer }) {
  /* ===== VARIABLES ===== */
  const headers = [
    "general",
    "types",
    "score_calculation",
    "pausing_rule",
    "proof_requirements",
    "regions",
    "replay_errors",
    "emulators"
  ];

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { snakeToTitle } = FrontendHelper();
  
  // FUNCTION 1: getContent - function that, given a header, returns the content of the container
  // PRECONDITIONS (1 parameter):
  // 1.) header: a string containing the name of the header
  // POSTCONDITIONS (1 possible outcome):
  // the React component related to `header` is returned
  const getContent = header => {
    switch(header) {
      case "general": return <General />;
      case "types": return <Types />;
      case "score_calculation": return <ScoreCalculation />;
      case "pausing_rule": return <PausingRule />;
      case "proof_requirements": return <ProofRequirements />;
      case "regions": return <Regions imageReducer={ imageReducer } />;
      case "replay_errors": return <ReplayErrors />;
      case "emulators": return <Emulators />;
      default: return null;
    };
  };

  /* ===== OVERVIEW COMPONENT ===== */
  return (
    <div id="overview" className={ styles.overview }>

      { /* First, render the name of the page */ }
      <h1>Overview</h1>

      { /* Render a container for each section of this page */ }
      { headers.map(header => {
        return (
          <div id={ header } key={ header }>
            <Container title={ snakeToTitle(header) }>
              { getContent(header) }
            </Container>
          </div>
        );
      })}
      
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Overview;