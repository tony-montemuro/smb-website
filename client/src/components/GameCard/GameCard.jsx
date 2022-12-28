import "./gamecard.css";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import GameCardInit from "./GameCardInit";

function GameCard({ game }) {
    // states and functions from the init file
    const { img, mapImg } = GameCardInit();

    // code that is executed when the page is first loaded
    useEffect(() => {
        mapImg(game.abb);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // game card component
    return (
        <Link className="gamecard" to={ { pathname: `/games/${ game.abb }` } }>
            <img src={ img } alt={ `${ game.name } Box Art` }></img>
            <p>{ game.name } </p>
        </Link>
    );
};

export default GameCard;