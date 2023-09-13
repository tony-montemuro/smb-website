/* ===== IMPORTS ===== */
import { supabase } from "./database/SupabaseClient";
import { useReducer, useState } from "react";
import CountriesRead from "./database/read/CountriesRead";
import GameRead from "./database/read/GameRead";
import ModeratorRead from "./database/read/ModeratorRead";
import NotificationRead from "./database/read/NotificationRead";
import ProfileRead from "./database/read/ProfileRead";
import Session from "./database/authentication/Session";

const App = () => {
  /* ===== VARIABLES ===== */
  const defaultUser = {
    id: undefined,
    email: undefined,
    notifications: [],
    profile: undefined,
    is_mod: false
  };
  const defaultStaticCache = {
    countries: [],
    games: []
  };

  /* ===== STATES & REDUCERS ===== */
  const [user, setUser] = useState(defaultUser);
  const [staticCache, setStaticCache] = useState(defaultStaticCache);
  const [messages, setMessages] = useState([]);
  const [images, dispatchImages] = useReducer((state, action) => {
    return { ...state, [action.field]: action.data }
  }, null);

  /* ===== FUNCTIONS ===== */

  // database functions to load data
  const { queryCountries } = CountriesRead();
  const { queryGames } = GameRead();
  const { isModerator } = ModeratorRead();
  const { queryUserNotifications } = NotificationRead();
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

  // FUNCTION 3: updateUserData - async function that loads user data based on a session object
  // PRECONDITIONS (1 parameter):
  // 1.) session: an object that is returned by the database containing information about the current user's session
  // this value also might be null if no user is currently signed in
  // POSTCONDITIONS (2 possible outcomes):
  // if the session object is defined (meaning user is logged in), we use the user.id field to load the user's
  // notifications, profile, and whether or not they are a moderator, and update the user state by calling the setUser() function
  // if the session object is null, we call the setUser() function with the default user object
  const updateUserData = async (session) => {
    // two different cases: a null session, or a session belonging to a user
    if (session) {
      // make concurrent api calls to database to load user data
      const user = session.user, userId = user.id;

      try {
        // concurrently make all necessary database calls
        const [notifs, profile, is_mod] = await Promise.all(
          [queryUserNotifications(), queryUserProfile(userId, addMessage), isModerator(userId)]
        );

        // update the user state
        setUser({
          id: userId,
          email: user.email,
          notifications: notifs,
          profile: profile,
          is_mod: is_mod
        });

      } catch (error) {
        // if there is an error, we want to render a message to the user
        addMessage("User information failed to load, meaning the application may not work as intented. The database server may be experiencing some issues.", "error");
      }
      
    } else {
      // if we have a null session, there is no current user. simply set the state to default value
      setUser({ ...defaultUser, id: null });
    }
  };

  // FUNCTION 4: callSessionListener - this function is called once just to run the supabase session listener function, which will be called
  // each time a change in session occurs
  // PRECONDITIONS (1 condition):
  // this function should be run exactly once: when the application is first loaded. the listener function defined within this function,
  // however, may be run any number of times
  // POSTCONDTIONS (1 possible outcome):
  // the session object is initialized to the current session, and the supabase.auth.onAuthStateChange listener function is called
  // this function will typically call the updateUserData function each time it itself is called, with the exception of the case
  // when the new session's user id is the same as the current session's user id
  const callSessionListener = async () => {
    // define variable used to keep track of the session object
    let session = null;
    try {
      // grab session from database
      session = await getSession();

      // if query is successful, let's update user data accordingly
      updateUserData(session);

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
      updateUserData(newSession);
      session = newSession;
    });
  };

  // FUNCTION 5: loadData - async function that will make concurrent api calls to the database
  // PRECONDITIONS (1 condition):
  // this function should be run exactly once: when the application is first loaded
  // POSTCONDTIONS (1 possible outcome):
  // the list of countries, games, moderators, and profiles are all loaded from the database.
  // the games and profiles arrays are cleaned, and finally, are used to set the static cache state by
  // calling the setStaticCache() function
  const loadData = async () => {
    try {
      // make concurrent api calls to database to load data
      const [countries, games] = await Promise.all(
        [queryCountries(), queryGames()]
      );

      // clean up the many-to-many relationships present in each game object
      games.forEach(game => {
        // first, handle the game <==> monkey relationship
        game.monkey = [];
        game.game_monkey.forEach(row => game.monkey.push(row.monkey));
        delete game.game_monkey;

        // next, handle the game <==> region relationship
        game.region = [];
        game.game_region.forEach(row => game.region.push(row.region));
        delete game.game_region;

        // next, handle the game <==> rule relationship
        game.rule = [];
        game.game_rule.forEach(row => game.rule.push(row.rule));
        delete game.game_rule;

        // finally, handle the game <==> platform relationship
        game.platform = [];
        game.game_platform.forEach(row => game.platform.push(row.platform));
        delete game.game_platform;
      });

      // update static cache
      const staticCache = {
        countries: countries,
        games: games
      };
      setStaticCache(staticCache);

    } catch (error) {
      // if any errors were detected, let the user know, and do not update cache
      addMessage("Many resources failed to load, meaning the application may not work as intented. The database server may be experiencing some issues.", "error");
    }
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
    staticCache, 
    messages,
    images,
    dispatchImages,
    addMessage,
    callSessionListener,
    loadData,
    handleMessageClose
  };
};

/* ===== EXPORTS ===== */
export default App;