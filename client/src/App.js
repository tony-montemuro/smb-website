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
    games: [],
    profiles: []
  };

  /* ===== STATES & REDUCERS ===== */
  const [user, setUser] = useState(defaultUser);
  const [staticCache, setStaticCache] = useState(defaultStaticCache);
  const [submissions, dispatchSubmissions] = useReducer((state, action) => {
    const submissionAbb = state[action.abb] || {};
    const submissionCategory = submissionAbb[action.category] || {};
    return {
      ...state,
      [action.abb]: {
        ...submissionAbb,
        [action.category]: {
          ...submissionCategory,
          [action.type]: action.data
        }
      }
    };
  }, {});
  const [images, dispatchImages] = useReducer((state, action) => {
    return { ...state, [action.field]: action.data }
  }, null);

  /* ===== FUNCTIONS ===== */

  // database functions to load data
  const { queryCountries } = CountriesRead();
  const { queryGames } = GameRead();
  const { queryModerators, isModerator } = ModeratorRead();
  const { queryUserNotifications } = NotificationRead();
  const { queryProfiles, queryUserProfile } = ProfileRead();

  // database function used to retrieve the current session
  const { getSession } = Session();

  // FUNCTION 1: updateUserData - async function that loads user data based on a session object
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
      const [notifs, profile, is_mod] = await Promise.all(
        [queryUserNotifications(), queryUserProfile(userId), isModerator(userId)]
      );

      // update the user state
      setUser({
        id: userId,
        email: user.email,
        notifications: notifs,
        profile: profile,
        is_mod: is_mod
      });
      
    } else {
      // if we have a null session, there is no current user. simply set the state to default value
      setUser({ ...defaultUser, id: null });
    }
  };

  // FUNCTION 2: callSessionListener - this function is called once just to run the supabase session listener function, which will be called
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
    let session = await getSession();
    updateUserData(session);

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

  // FUNCTION 3: loadData - async function that will make concurrent api calls to the database
  // PRECONDITIONS (1 condition):
  // this function should be run exactly once: when the application is first loaded
  // POSTCONDTIONS (1 possible outcome):
  // the list of countries, games, moderators, and profiles are all loaded from the database.
  // the games and profiles arrays are cleaned, and finally, are used to set the static cache state by
  // calling the setStaticCache() function
  const loadData = async () => {
    // make concurrent api calls to database to load data
    const [countries, games, moderators, profiles] = await Promise.all(
      [queryCountries(), queryGames(), queryModerators(), queryProfiles()]
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
    });

    // add the mod field to each profile object
    profiles.forEach(profile => {
      profile.mod = false;
      moderators.forEach(moderator => {
        if (profile.id === moderator.profile_id) {
          profile.mod = true;
        }
      });
    });

    console.log(countries);
    console.log(games);
    console.log(moderators);
    console.log(profiles);

    // update static cache
    setStaticCache({
      countries: countries,
      games: games,
      moderators: moderators,
      profiles: profiles
    });
  };

  return { 
    user, 
    staticCache, 
    submissions,
    images,
    dispatchSubmissions,
    dispatchImages,
    callSessionListener, 
    loadData
  };
};

/* ===== EXPORTS ===== */
export default App;