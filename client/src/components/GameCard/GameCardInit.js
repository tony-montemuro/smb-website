import { useState } from "react";
import { supabase } from "../../database/SupabaseClient";

const GameCardInit = () => {
    /* ===== STATES ===== */
    const [img, setImg] = useState(null);

    /* ===== FUNCTIONS ===== */
    
    // function that will return an image from an abbreviation (abb)
    const mapImg = async (abb) => {
        try {
            // query supabase storage for the image
            const { data, error } = await supabase.storage
                .from('games')
                .download(`${ abb }.png`);

            // error handling
            if (error) {
                throw error;
            }

            // update url react state
            const url = URL.createObjectURL(data);
            setImg(url);

        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    };

    return { img, mapImg };
};

export default GameCardInit;