/* ===== IMPORTS ===== */
import { useState } from "react";
import NotificationDelete from "../../database/delete/NotificationDelete";

const Notifications = () => {
    /* ===== STATES ===== */
    const [notifications, setNotifications] = useState({
        all: [],
        selected: [],
        current: null
    });

    /* ===== FUNCTIONS ===== */

    // database functions
    const { deleteNotification } = NotificationDelete();

    // FUNCTION 1: init - update the notifications state's all parameter with the array of user notifications
    // PRECONDITIONS (1 condition):
    // the 'user' state from the userContext should be fully loaded
    // POSTCONDITIONS (1 possible outcome):
    // the setNotifications() function is called, and the `all` parameter is updaded with the notifs parameter
    const init = (notifs) => {
        setNotifications({ ...notifications, all: notifs });
    };

    // FUNCTION 2: toggleSelection - toggle a notification object between selected and unselected
    // PRECONDITIONS (1 parameter):
    // 1.) id: the id of a notification
    // POSTCONDITIONS (2 possible outcomes)
    // the notifications.selected array is first searched, to see if the notification corresponding with id is already selected
    // if it is (idIndex > -1), we call the setNotification hook, and set the selected field to the selected array with the
    // element corresponding to the id parameter removed
    // if it is not (idIndex < 0), we call the setNotification hook, and set the selected field to the selected array with the
    // id parameter appended to the end
    const toggleSelection = id => {
        const idIndex = notifications.selected.indexOf(id);
        if (idIndex > -1) {
            setNotifications({ ...notifications, selected: [...notifications.selected.slice(0, idIndex), ...notifications.selected.slice(idIndex+1)] });
        } else {
            setNotifications({ ...notifications, selected: [...notifications.selected, id] });
        }
    };

    // FUNCTION 3: toggleSelectionAll - toggle all notification objects between selected and unselected
    // PRECONDITIONS (none)
    // POSTCONDITIONS (2 possible outcomes)
    // if all notifications are selected, we call the setNotification hook, and set the selected field to an empty array
    // if any other number of notifications are selected (including none of them), we call the setNotification hook, and set 
    // the selected field to the array of notification.all notif_date fields
    const toggleSelectionAll = () => {
        if (notifications.selected.length === notifications.all.length) {
            setNotifications({ ...notifications, selected: [] });
        } else {
            setNotifications({ ...notifications, selected: notifications.all.map(row => row.notif_date) });
        }
    };

    // FUNCTION 4: removeSelected - remove all selected notifications from the database
    // PRECONDITIONS (1 condition):
    // the notifications.selected array must be non-empty. this is enforced by the application
    // POSTCONDITIONS (1 possible outcomes):
    // a concurrent call to the database is made to remove all notifications by notif_date. this function
    // will await all calls, and once they have all been resolved, the page reloads.
    const removeSelected = async () => {
        // make concurrent delete calls to database
        const promises = notifications.selected.map(notif_date => deleteNotification(notif_date));
        await Promise.all(promises);

        // once all deletes have occurred successfully, reload the page
        window.location.reload();
    };

    return { 
        notifications, 
        setNotifications,
        init, 
        toggleSelectionAll, 
        toggleSelection,
        removeSelected
    };
};

/* ===== EXPORTS ===== */
export default Notifications;