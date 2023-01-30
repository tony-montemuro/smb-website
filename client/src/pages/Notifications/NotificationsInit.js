import { useState } from "react";

const NotificationsInit = () => {
    /* ===== STATES ===== */
    const [notifications, setNotifications] = useState(null);
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(true);

    /* ===== FUNCTIONS ===== */

    // function that initializes the states of the page given the notificationList parameter, an array of notification objects
    const init = (notificationList) => {
        setNotifications(notificationList);
        setLoading(false);
    };

    return { loading, notifications, init };
};

export default NotificationsInit;