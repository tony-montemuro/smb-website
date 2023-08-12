/* ===== IMPORTS ===== */
import { useState } from "react";

const Users = () => {
    /* ===== STATES ===== */
    const [users, setUsers] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // FUNCTION 1
    const prepareUsers = profiles => {
        setUsers(profiles.sort((a, b) => {
            return a.username > b.username;
        }));
    };

    return { users, prepareUsers };
};

/* ===== EXPORTS ===== */
export default Users;