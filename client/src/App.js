/* ===== IMPORTS ===== */
import { supabase } from "./database/SupabaseClient";
import { useReducer, useState } from "react";
import NotificationRead from "./database/read/NotificationRead";
import ProfileRead from "./database/read/ProfileRead";
import Session from "./database/authentication/Session";

const App = () => {
  /* ===== VARIABLES ===== */
  const defaultUser = {
    id: undefined,
    notificationCount: 0,
    profile: undefined
  };
  const defaultImages = {
    games: {},
    users: {}
  }

  /* ===== STATES & REDUCERS ===== */
  const [user, setUser] = useState(defaultUser);
  const [messages, setMessages] = useState([]);
  const [images, dispatchImages] = useReducer((state, action) => {
    const set = action.set, field = action.field, data = action.data;
    if (set === "games" || set === "users") {
      return { ...state, [set]: { ...state[set], [field]: data } };
    } else {
      return state;
    }
  }, defaultImages);

  /* ===== FUNCTIONS ===== */

  // database functions to load data
  const { queryNotificationCount } = NotificationRead();
  const { queryUserProfile } = ProfileRead();

  // database function used to retrieve the current session
  const { getSession } = Session();

  // FUNCTION 1: toArray - takes a parameter, and converts it to an array
  // PRECONDITIONS (1 parameter):
  // 1.) e: some element; typically, it's either a string, or an array of strings
  // POSTCONDITIONS (1 possible outcome):
  // an array is returned. if e is just a string, it is wrapped in an array, and if e is already an array, it is simply returned
  const toArray = (e) => {
    return Array.isArray(e) ? e : [e];
  };

  // FUNCTION 2: addMessage - function that takes a message, and it's type, and adds it to the array of messages
  // PRECONDITIONS (2 parameters):
  // 1.) messageArr: either an erray of messages, or a string value, representing the message(s) to be rendered as a message popup 
  // to the client
  // 2.) type: a string value specifying the type of message, which has impacts on styling. either "error" or "success"
  // POSTCONDITIONS (1 possible outcome):
  // a new object is greated using the two parameters, and the object is pushed into the messages state array
  const addMessage = (messageArr, type) => {
    const newMessageArr = toArray(messageArr).map(message => ({ message, type }));
    setMessages(messages.concat(newMessageArr));
  };

  // FUNCTION 3: updateUser - async function that loads user data based on a uuid user id
  // PRECONDITIONS (1 parameter):
  // 1.) userId: a unique uuid value that belongs to exactly one authenticated user
  // this value also might be null if no user is currently signed in
  // POSTCONDITIONS (2 possible outcomes):
  // if the session object is defined (meaning user is logged in), we use userId field to load the user's
  // notification count & profile, and update the user state by calling the setUser() function
  // if the session object is null, we call the setUser() function with the default user object
  const updateUser = async userId => {
    // two different cases: a null userId, or a userId belonging to a user
    if (userId) {
      try {
        // concurrently make all necessary database calls
        const [count, profile] = await Promise.all(
          [queryNotificationCount(), queryUserProfile(userId, addMessage)]
        );

        // update the user state
        setUser({
          id: userId,
          notificationCount: count,
          profile: profile
        });

      } catch (error) {
        // if there is an error, we want to render a message to the user
        addMessage("User information failed to load, meaning the application may not work as intented. The database server may be experiencing some issues.", "error");
      }
      
    } else {
      // if we have a null user id, there is no current user. simply set the state to default value
      setUser({ ...defaultUser, id: null });
    }
  };

  // FUNCTION 4: isModerator - function that determines if the current user is a moderator or not
  // PRECONDITIONS (1 parameter):
  // 1.) abb (OPTIONAL): a string corresponding to the primary key of a game. if this string is provided, this function will
  // check if the current moderator is a moderator for the particular game associated with `abb`. otherwise, it's a general check
  // POSTCONDITIONS (2 possible outcomes):
  // if the user is defined, and they either are an administrator, or moderate [at least 1 game OR the game specified by abb, if it's
  // defined], return true
  // otherwise, return false
  const isModerator = abb => {
    if (abb) {
      return user.id !== undefined && user.profile && (user.profile.administrator || user.profile.game.some(game => game.abb === abb));
    }
    return user.id !== undefined && user.profile && (user.profile.administrator || user.profile.game.length > 0);
  };

  // FUNCTION 5: callSessionListener - this function is called once just to run the supabase session listener function, which will be called
  // each time a change in session occurs
  // PRECONDITIONS (1 condition):
  // this function should be run exactly once: when the application is first loaded. the listener function defined within this function,
  // however, may be run any number of times
  // POSTCONDTIONS (1 possible outcome):
  // the session object is initialized to the current session, and the supabase.auth.onAuthStateChange listener function is called
  // this function will typically call the updateUser function each time it itself is called, with the exception of the case
  // when the new session's user id is the same as the current session's user id
  const callSessionListener = async () => {
    // define variable used to keep track of the session object
    let session = null;
    try {
      // grab session from database
      session = await getSession();

      // if query is successful, let's update user data accordingly
      updateUser(session ? session.user.id : null);

    } catch (error) {
      // otherwise, render an error message
      addMessage("Session data failed to load, meaning the application may not work as intented. The database server may be experiencing some issues.", "error");
    }

    // listener for changes to the auth state
    supabase.auth.onAuthStateChange((event, newSession) => {
      // special case: the current session's user id is the same as the previous session's user id
      if (event === "SIGNED_IN" && session && newSession && newSession.user.id === session.user.id) {
        return;
      }

      // otherwise, update the user data
      updateUser(newSession ? newSession.user.id : null);
      session = newSession;
    });
  };

  // FUNCTION 6: handleMessageClose - function that is executed when the user closes a message popup
  // PRECONDITIONS (1 parameter):
  // 1.) index: the index-th element to be removed from the messages array, causing it to immediately unrender
  // POSTCONDITIONS (1 possible outcome):
  // the message popup is closed
  const handleMessageClose = index => {
    setMessages(messages.filter((_, i) => i !== index));
  };

  return { 
    user, 
    messages,
    images,
    dispatchImages,
    addMessage,
    updateUser,
    isModerator,
    callSessionListener,
    handleMessageClose
  };
};

/* ===== EXPORTS ===== */
export default App;