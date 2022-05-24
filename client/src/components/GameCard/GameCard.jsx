import "./gamecard.css";
import React from "react";
import {Link} from "react-router-dom";
import GameCardInit from "./GameCardInit";

function GameCard({ name, abb }) {
    const { mapImg } = GameCardInit();
    const img = mapImg(abb);

    return (
        <div className='game-card'>
            <img src={img} alt='Box art'></img>
            <Link to={{pathname: `/games/${abb}`}}> {name} </Link>
        </div>
    );
}

export default GameCard;