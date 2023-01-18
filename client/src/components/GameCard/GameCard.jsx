import "./gamecard.css";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import GameCardInit from "./GameCardInit";

function GameCard({ game }) {
    // states and functions from init file
    const { img, fetchBoxArt } = GameCardInit();

    // code that is executed when the page is first loaded
    useEffect(() => {
        fetchBoxArt(game.abb);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // game card component
    return (
        <Link className="gamecard" to={ { pathname: `/games/${ game.abb }` } }>
            <img src={ img ? img : `https://place-hold.it/${ 200 }x${ 284 }` } alt={ `${ game.name } Box Art` }></img>
            <p>{ game.name } </p>
        </Link>
    );
};

export default GameCard;