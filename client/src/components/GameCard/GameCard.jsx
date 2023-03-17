/* ===== IMPORTS ===== */
import "./GameCard.css";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import GameCardLogic from "./GameCard.js";

function GameCard({ game, imageReducer }) {
    /* ===== VARIABLES ===== */
    const PLACEHOLDER_IMAGE_URL = "https://place-hold.it/200x284";

    /* ===== STATES AND FUNCTIONS ===== */

    // states and functions from js file
    const { img, fetchBoxArt } = GameCardLogic();

    /* ===== EFFECTS ===== */

    // code that is executed when the component is first loaded
    useEffect(() => {
        fetchBoxArt(game.abb, imageReducer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ===== GAME CARD COMPONENT ===== */
    return (
        // this component is fairly simple: an image, as well as text. the image will be loaded upon component render.
        <Link className="gamecard" to={ { pathname: `/games/${ game.abb }` } }>
            <img src={ img ? img : PLACEHOLDER_IMAGE_URL } alt={ `${ game.name } Box Art` }></img>
            <p>{ game.name } </p>
        </Link>
    );
};

export default GameCard;