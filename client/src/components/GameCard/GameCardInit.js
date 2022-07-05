import { useState } from "react";
import { supabase } from "../SupabaseClient/SupabaseClient";

const GameCardInit = () => {
    // states
    const [img, setImg] = useState(null);
    
    // function that will return an image from an abbreviation (abb)
    const mapImg = async (abb) => {
        try {
            const { data, error } = await supabase.storage.from('games').download(`${abb}.png`);
            if (error) {
                throw error;
            }
            const url = URL.createObjectURL(data);
            setImg(url);
        } catch (error) {
            alert("Error downloading image: ", error.message);
        }
    }

    return { img, mapImg };
};

export default GameCardInit;