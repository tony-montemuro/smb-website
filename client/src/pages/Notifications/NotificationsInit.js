import { useState } from "react";
import NotificationsDelete from "../../database/delete/NotificationsDelete";

const NotificationsInit = () => {
    /* ===== STATES ===== */
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState({
        all: [],
        selected: [],
        current: null
    });

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { remove } = NotificationsDelete();

    // function that initializes the states of the page given the notificationList parameter, an array of notification objects
    const init = (notifs) => {
        setNotifications({ ...notifications, all: notifs });
        setLoading(false);
        console.log(notifs);
    };

    // function that will toggle a notification between the selected and unselected state
    const toggleSelection = id => {
        const idIndex = notifications.selected.indexOf(id);
        if (idIndex > -1) {
            setNotifications({ ...notifications, selected: [...notifications.selected.slice(0, idIndex), ...notifications.selected.slice(idIndex+1)] });
        } else {
            setNotifications({ ...notifications, selected: [...notifications.selected, id] });
        }
    };

    // function that will toggle all the notifications from selected to unselected state
    const toggleSelectionAll = () => {
        if (notifications.selected.length === notifications.all.length) {
            setNotifications({ ...notifications, selected: [] });
        } else {
            setNotifications({ ...notifications, selected: notifications.all.map(row => row.notif_date) });
        }
    };

    // function that will remove the selected notifications from the database
    const removeSelected = async () => {
        // make concurrent delete calls to database
        const promises = notifications.selected.map(notif_date => remove(notif_date));
        await Promise.all(promises);

        // once all deletes have occurred successfully, reload the page
        window.location.reload();
    };

    return { 
        loading, 
        notifications, 
        setNotifications,
        init, 
        toggleSelectionAll, 
        toggleSelection,
        removeSelected
    };
};

export default NotificationsInit;