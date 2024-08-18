/* ===== IMPORTS ===== */
import { useRef } from "react";
import AssetsFormLogic from "./AssetsForm.js";
import Container from "../../components/Container/Container.jsx";
import FormHelperText from "@mui/material/FormHelperText";
import styles from "./AssetsForm.module.css";

function AssetsForm({ imageReducer }) {
  /* ===== VARIABLES ===== */
  const dimensions = {
    boxArt: {
      MAX_WIDTH: 256,
      MAX_HEIGHT: 363
    }
  };
  const fileTypes = {
    boxArt: ["png"]
  };
  
  /* ===== STATES & FUNCTIONS ===== */

  // states & functions from the js file
  const { error, uploading, handleBoxArtSubmit } = AssetsFormLogic(imageReducer, dimensions, fileTypes);
  
  /* ===== REFS ===== */
  const boxArtRef = useRef(null);

  /* ===== ASSET FORM COMPONENT ===== */
  return (
    <Container title="Game Assets">
      <div className={ styles.form }>

        { /* Form description */ }
        <span>On this screen, you will upload graphical assets specific to this game.</span>
        <span>Currently, the only game-specific asset is <strong>box art</strong>. In the future, this will likely be expanded.</span>

        { /* Box art form */ }
        <form id="box-art-form" className={ styles.form } onSubmit={ e => handleBoxArtSubmit(e, boxArtRef) }>
          <h3>Box Art</h3>
          <span>
            <strong>Box Art is optional.</strong>
            &nbsp;Box Art assets must be a <strong>PNG</strong>. The standard dimensions are&nbsp; 
            <strong>{ dimensions.boxArt.MAX_WIDTH } × { dimensions.boxArt.MAX_HEIGHT } pixels</strong>,
            however, the dimensions can be less for non-traditional box art.
          </span>
          <div>
            <label htmlFor="boxart-upload"></label>
            <input
              type="file"
              id="boxart-upload"
              accept={ fileTypes.boxArt.map(type => `.${ type }`).join(",") }
              title="Upload Box Art"
              ref={ boxArtRef }
              required
            />
            { error ? <FormHelperText error>{ error }</FormHelperText> : null }
          </div>
          <button type="submit" disabled={ uploading }>Upload Box Art</button>
        </form>

      </div>
    </Container>
  );
};

/* ===== EXPORTS ===== */
export default AssetsForm;