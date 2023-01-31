import { useState } from "react";

const NotificationsInit = () => {
    /* ===== STATES ===== */
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState(null);
    const [selected, setSelected] = useState([]);
    const [currentNotif, setCurrentNotif] = useState(null);

    /* ===== FUNCTIONS ===== */

    // function that initializes the states of the page given the notificationList parameter, an array of notification objects
    const init = (notificationList) => {
        setNotifications(notificationList);
        setLoading(false);
    };

    return { loading, notifications, currentNotif, setCurrentNotif, init };
};

export default NotificationsInit;