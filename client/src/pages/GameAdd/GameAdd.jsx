/* ===== IMPORTS ===== */
import styles from "./GameAdd.module.css";
import { useState } from "react";
import MetadataForm from "./Forms/MetadataForm.jsx";

function GameAdd() {
  /* ===== STATES ===== */
  const [pageNumber, setPageNumber] = useState(1); 
  const [unlockedPages, setUnlockedPages] = useState([1]);
  const pageToForm = {
    1: <MetadataForm 
        pageNumber={ pageNumber }
        unlockedPages={ unlockedPages }
        setUnlockedPages={ setUnlockedPages }
      />
  };

  /* ===== GAME ADD COMPONENT ===== */
  return (
    <div className={ styles.gameAdd }>
      <h1>Add Game</h1>
      { pageToForm[pageNumber] }
    </div>
  );
};

export default GameAdd;