import "./gamecard.css";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import GameCardInit from "./GameCardInit";

function GameCard({ name, abb }) {
    const { img, mapImg } = GameCardInit();

    useEffect(() => {
        mapImg(abb);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        // <div className='game-card'>
        //     <img src={img} alt='Box art'></img>
        //     <Link to={{pathname: `/games/${abb}`}}> {name} </Link>
        // </div>

        <Link className="card-link" to={{pathname: `/games/${abb}`}}>
            <img src={img} alt='Box art'></img>
            <p>{name} </p>
        </Link>
    );
}

export default GameCard;