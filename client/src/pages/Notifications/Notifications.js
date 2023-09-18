/* ===== IMPORTS ===== */
import { isBefore } from "date-fns";
import { MessageContext, UserContext } from "../../utils/Contexts";
import { useContext, useReducer, useState } from "react";
import NotificationDelete from "../../database/delete/NotificationDelete";
import NotificationRead from "../../database/read/NotificationRead";
import PageControls from "../../components/PageControls/PageControls";

const Notifications = () => {
    /* ===== VARIABLES ===== */
    const notificationsInit = {
        all: undefined,     // store all current notification objects
        current: null,      // stores either nothing, or a notification object to display in popup view
        selected: {},       // stores the notif_dates of all the selected notifications, partitioned by page number
        submitting: true,  // a boolean flag that checks whether or not the user is attempting to delete submissions
        total: 0            // stores the total number of notifications the user has
    };

    /* ===== REDUCER FUNCTIONS ===== */

    // REDUCER FUNCTION 1: reducer - function that will be the reducer function for the notifications reducer
    // PRECONDITIONS (2 parameters):
    // 1.) state: stores the information of the recent state stored in the reducer hook
    // 2.) action: an object that typically has two parameters:
        // a.) field: specifies which field this function should update
        // b.) payload: an data type OR object that stores information used in the operations (type depends on field)
    // POSTCONDITIONS (3 possible outcomes):
    // if field is `reset`, the function will return the initial value of the `notifications` state (notificationsInit)
    // if field is `all`, `current`, `submitting`, or `total`, the function simply update that field using the payload data
    // if field is `selected`, the payload will have an additional field called `pageNum`, which we will use to update the
    // `selected` object
    // otherwise, this reducer function does nothing
    const reducer = (state, action) => {
        const field = action.field, payload = action.payload;

        // case 1: simply return the initial `notifications` value
        if (field === "reset") {
            return notificationsInit;
        }

        // case 2: simply update the field using payload
        if (["all", "current", "submitting", "total"].includes(field)) {
            return {
                ...state,
                [field]: payload
            }
        }

        // case 3: update the `selected` field using the `payload.pageNum` and `payload.data`
        if (field === "selected") {
            return {
                ...state,
                selected: {
                    ...state.selected,
                    [payload.pageNum]: payload.data
                }
            };
        }

        // case 4: function executed using an invalid `action.field`. just do nothing
        return state;
    };

    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    // user state & update user function from user context
    const { user, updateUser } = useContext(UserContext);

    /* ===== STATES ===== */
    const [notifications, dispatchNotifications] = useReducer(reducer, notificationsInit);
    const [pageNum, setPageNum] = useState(1);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { deleteNotification } = NotificationDelete();
    const { queryNotifications } = NotificationRead();

    // helper functions
    const { getStartAndEnd } = PageControls();

    // FUNCTION 1: updateNotifications - function that updates the notifications.all state
    // PRECONDITIONS (1 parameter):
    // 1.) notifsPerPage: an integer that specifies the number of notifications that should render on each page
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is a success, we use `notifications` and `count` to update the notification state hook by calling the 
    // `dispatchNotifications()` function
    // if the query was a failure, simply render an error to the client
    const updateNotifications = async notifsPerPage => {
        // first, compute the range of notifs to grab based on the parameters
        const { start, end } = getStartAndEnd(notifsPerPage, pageNum);

        try {
            // attempt to grab all relevant notifications, and make necessary updates to notifications state by calling
            // the `dispatchNotifications()` function
            const { notificationsList, count } = await queryNotifications(start, end);
            dispatchNotifications({ field: "all", payload: notificationsList });
            dispatchNotifications({ field: "selected", payload: {
                data: notifications.selected[pageNum] ? notifications.selected[pageNum] : [],
                pageNum: pageNum
            }});
            dispatchNotifications({ field: "total", payload: count });
            dispatchNotifications({ field: "submitting", payload: false });

        } catch (error) {
            // render an error message to the client
            addMessage("Your notifications failed to load.", "error");
        };
    };

    // FUNCTION 2: getSelectedCount - function that counts up the number of notifications currently selected by the user
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // we loop through the keys of the `notifications.selected` object, and count up the number of notifications in each array,
    // and return this value
    const getSelectedCount = () => {
        let total = 0;
        const keys = Object.keys(notifications.selected);
        for (let key of keys) {
            total += notifications.selected[key].length;
        }
        return total;
    };

    // FUNCTION 3: areAllNotifsSelected - boolean function that checks if, on any page, all notifications are selected or not
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if each notification on the page corresponds to a notification stored in the `selected` object, return true
    // otherwise, return false
    const areAllNotifsSelected = () => {
        // first, let's get an array of all notification dates
        const notifDates = notifications.all.map(notification => notification.notif_date);

        // now, we can compare the two arrays
        for (let i = 0; i < notifDates.length; i++) {
            const selected = notifications.selected[pageNum];
            if (i >= selected.length || notifDates[i] !== selected[i]) {
                return false;
            }
        }

        // if we made it this far, the two arrays are identical. return true
        return true;
    };

    // FUNCTION 4: toggleSelection - toggle a notification object between selected and unselected
    // PRECONDITIONS (1 parameter):
    // 1.) id: the id of a notification
    // POSTCONDITIONS (2 possible outcomes)
    // the notifications.selected[pageNum] array is first searched, to see if the notification corresponding with id is already 
    // selected. if it is (idIndex > -1), we call the dispatchNotifications function, and set the selected field to the selected array 
    // with the element corresponding to the id parameter removed
    // if it is not (idIndex < 0), we call the dispatchNotifications hook, and set the selected[pageNum] array to the selected array 
    // with the id parameter added to the array, in order (by date)
    const toggleSelection = id => {
        const idIndex = notifications.selected[pageNum].indexOf(id);
        
        // if notification is found, remove it from the selected object
        if (idIndex > -1) {
            dispatchNotifications({ field: "selected", payload: {
                data: [...notifications.selected[pageNum].slice(0, idIndex), ...notifications.selected[pageNum].slice(idIndex+1)],
                pageNum: pageNum
            }});
        } 
        
        // otherwise, add it to the selected object
        else {
            dispatchNotifications({ field: "selected", payload: {
                data: [...notifications.selected[pageNum], id].sort((a, b) => isBefore(new Date(a), new Date(b))),
                pageNum: pageNum
            }})
        }
    };

    // FUNCTION 5: toggleSelectionAll - toggle all notification objects between selected and unselected
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes)
    // if all notifications are selected, we call the dispatchNotifications function, and set the selected field to an empty array
    // if any other number of notifications are selected (including none of them), we call the dispatchNotifications, and update
    // the object of selected notifications
    const toggleSelectionAll = () => {
        // if all notifications on current page are selected, unselect them all
        if (areAllNotifsSelected(pageNum)) {
            dispatchNotifications({ field: "selected", payload: { data: [], pageNum: pageNum }})
        } 
        
        // otherwise, select all notifications
        else {
            dispatchNotifications({ field: "selected", payload: { 
                data: notifications.all.map(row => row.notif_date),
                pageNum: pageNum
            }});
        }
    };

    // FUNCTION 6: removeSelected - remove all selected notifications from the database
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // this function attempts to make many queries, including a set of queries to delete each selected notification, as well as 
    // updating the user
    // if any of these queries fail, this function will render an error message to the user
    // otherwise, a success message is rendered to the user
    const removeSelected = async () => {
        // create array of promises
        dispatchNotifications({ field: "submitting", payload: true });
        let promises = [];
        Object.keys(notifications.selected).forEach(key => {
            const pagePromises = notifications.selected[key].map(notif_date => deleteNotification(notif_date));
            promises = promises.concat(pagePromises);
        });

        try {
            // attempt to delete all notifications
            await Promise.all(promises);

            // next, reset component state (both notifications and page number), and also update the user state
            dispatchNotifications({ field: "reset" });
            await updateUser(user.id);
            setPageNum(1);

            // finally, render a success message to the user
            addMessage("Notifications successfully deleted.", "success");

        } catch (error) {
            addMessage("One or more notifications failed to delete. Refresh the page and try again.", "error");
        } finally {
            dispatchNotifications({ field: "submitting", payload: false });
        }
    };

    // FUNCTION 7: handleRowClick - code that is executed when the user clicks on a notification
    // PRECONDITIONS (1 parameter)
    // 1.) notification: a notification object corresponding to the clicked row
    // POSTCONDITIONS (1 possible outcome):
    // a popup will immediately be rendered once the dispatchNotifications function is called
    const handleRowClick = notification => {
        dispatchNotifications({ field: "current", payload: notification });
    };

    // FUNCTION 8: changePage - code that is executed when the user attempts to change pages
    // PRECONDITIONS (1 parameter):
    // 1.) newPageNum: the page the user wants to access
    // POSTCONDITIONS (1 possible outcome):
    // not only do we update the pageNum state hook by calling the `setPageNum` hook, we also update the `all` field of the
    // notifications object back to undefined, while we wait for new notifications to load in
    const changePage = newPageNum => {
        setPageNum(newPageNum);
        dispatchNotifications({ field: "all", payload: undefined });
    };

    return { 
        notifications, 
        pageNum,
        dispatchNotifications,
        updateNotifications,
        areAllNotifsSelected,
        getSelectedCount,
        toggleSelection,
        toggleSelectionAll, 
        removeSelected,
        handleRowClick,
        changePage
    };
};

/* ===== EXPORTS ===== */
export default Notifications;