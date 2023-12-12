/* ===== IMPORTS ===== */
import { ProfileContext } from "../../utils/Contexts";
import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const User = () => {
    /* ===== VARIABLES ===== */
    const navigateTo = useNavigate();

    /* ===== CONTEXTS ===== */

    // profile state from profile context
    const { profile } = useContext(ProfileContext);

    /* ===== MEMOS ===== */

    // memo to store search params object to prevent unnecessary rerenders of recent submissions
    const searchParams = useMemo(() => {
        const params = new URLSearchParams();
        params.append("profile_id", profile.id);
        return params;
    }, [profile.id]);

    // memo to store the array of socials (avoid recompute)
    const socials = useMemo(() => {
        const socialKeys = ["youtube_handle", "twitch_username", "twitter_handle", "discord"];
        const socials = [];
        socialKeys.forEach(key => {
            if (profile[key]) {
                socials.push(profile[key]);
            }
        });
        return socials;
    }, [profile]);

    // memo to store the array of details (avoid recompute)
    const details = useMemo(() => {
        const detailKeys = ["bio", "birthday"];
        const details = [];
        detailKeys.forEach(key => {
            if (profile[key]) {
                details.push(profile[key]);
            }
        });
        return details; 
    }, [profile]);

    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: code that executes when user clicks a game row
    // PRECONDITIONS (1 parameter):
    // 1.) game: an object containing the `abb` key, which refers to the primary key of a game
    // POSTCONDITIONS (1 possible outcome):
    // the user is navigated to the page associated with the game
    const onGameRowClick = game => {
        navigateTo(`/games/${ game.abb }`);
    };

    return { searchParams, socials, details, onGameRowClick };
};

/* ===== EXPORTS ===== */
export default User;