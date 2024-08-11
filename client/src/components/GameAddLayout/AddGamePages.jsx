/* ===== IMPORTS ===== */
import styles from "./AddGamePages.module.css";
import LooksOneOutlinedIcon from "@mui/icons-material/LooksOneOutlined";
import LooksTwoOutlinedIcon from "@mui/icons-material/LooksTwoOutlined";
import Looks3OutlinedIcon from "@mui/icons-material/Looks3Outlined";
import Looks4OutlinedIcon from "@mui/icons-material/Looks4Outlined";

function AddGamePage({ name, index, page, setPage }) {
  /* ===== VARIABLES ===== */
  const pageNumber = page.number;
  const unlockedPages = page.unlocked;
  const isPageUnlocked = unlockedPages.includes(index);
  const numberComponents = {
    1: <LooksOneOutlinedIcon />,
    2: <LooksTwoOutlinedIcon />,
    3: <Looks3OutlinedIcon />,
    4: <Looks4OutlinedIcon />
  }

  /* ===== ADD GAME PAGE COMPONENT ===== */
  return (
    <div 
      className={ `${ styles.pageBtn } center${ pageNumber === index ? ` ${ styles.selected }` : "" }${ !isPageUnlocked ? ` ${ styles.disabled }` : "" }` }
      onClick={ isPageUnlocked ? () => setPage({ ...page, number: index }) : null } 
    >
      { numberComponents[index] }&nbsp;{ name }
    </div>
  );
};

function AddGamePages({ page, setPage, pageNames }) {
  /* ===== ADD GAME PAGES COMPONENT ===== */
  return (
    <div className={ styles.addGamePages }>
      { pageNames.map((name, index) => {
        return (
          <AddGamePage 
            name={ name } 
            index={ index+1 }
            page={ page }
            setPage={ setPage }
            key={ name }
          />
        );
      })}
    </div>
  )
};

/* ===== EXPORTS ===== */
export default AddGamePages;