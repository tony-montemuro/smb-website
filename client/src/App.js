/* ===== IMPORTS ===== */
import { useEffect, useReducer, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { supabase } from "./database/SupabaseClient";
import { UserContext, StaticCacheContext } from "./Contexts";
import AppRead from "./database/read/AppRead";
import Game from "./pages/Game/Game.jsx";
import GameSelect from "./pages/GameSelect/GameSelect.jsx";
import Home from "./pages/Home/Home";
import Levelboard from "./pages/Levelboard/Levelboard";
import Login from "./pages/Login/Login";
import Medals from "./pages/Medals/Medals";
import Navbar from "./components/Navbar/Navbar";
import Notifications from "./pages/Notifications/Notifications";
import Profile from "./pages/Profile/Profile";
import Records from "./pages/Records/Records";
import Resources from "./pages/Resources/Resources";
import Session from "./database/authentication/Session";
import Submissions from "./pages/Submissions/Submissions";
import Support from "./pages/Support/Support";
import Totalizer from "./pages/Totalizer/Totalizer";
import User from "./pages/User/User.jsx";
import UserStats from "./pages/UserStats/UserStats";

function App() {
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
  const [countries, setCountries] = useState(null);
  const [games, setGames] = useState(null);
  const [levels, setLevels] = useState(null);
  const [moderators, setModerators] = useState(null);
  const [profiles, setProfiles] = useState(null);
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

  /* ===== MORE VARIABLES ===== */
  const submissionReducer = { state: submissions, dispatchSubmissions: dispatchSubmissions };
  const imageReducer = { reducer: images, dispatchImages: dispatchImages };

  /* ===== FUNCTIONS ===== */

  // load functions from the load file
  const { 
    loadCountries, 
    loadGames, 
    loadLevels, 
    loadModerators,
    loadGameMonkeys,
    loadAllMonkeys, 
    loadProfiles,
    loadGameRegions,
    loadAllRegions,
    loadUserNotifications,
    loadUserProfile,
    isModerator,
    newLoadGames,
  } = AppRead();

  // load the getSession function
  const { getSession } = Session();  

  // async function that loads user data based on a session object
  const updateUserData = async (session) => {
    // two different cases: a null session, or a session belonging to a user
    if (session) {
      // make concurrent api calls to database to load user data
      const user = session.user;
      const [notifs, profile, is_mod] = await Promise.all(
        [loadUserNotifications(user.id), loadUserProfile(user.id), isModerator(user.id)]
      );

      // update the user state
      setUser({
        id: user.id,
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

  // async function that is used to fetch the current session, and also listens for session changes
  // from the session object, a user state hook object will be generated
  const loadSession = async () => {
    // get the new session, and update session data
    const session = await getSession();
    updateUserData(session);

    // listener for changes to the auth state
    supabase.auth.onAuthStateChange((event, newSession) => {
      // special case: the current session is the same as the previous session
      if (session && newSession && session.user.id === newSession.user.id) {
        return;
      }

      // otherwise, update the user data
      updateUserData(newSession);
    });
  };

  // async function that will make concurrent api calls to the database
  const loadData = async () => {
    // make concurrent api calls to database to load data
    const [countries, newGames, games, levels, moderators, gameMonkeys, allMonkeys, newProfiles, profiles, gameRegions, allRegions] = await Promise.all(
      [loadCountries(), newLoadGames(), loadGames(), loadLevels(), loadModerators(), loadGameMonkeys(), loadAllMonkeys(), loadProfiles(), loadProfiles(), loadGameRegions(), loadAllRegions()]
    );

    // assign monkeys to each game
    games.forEach(game => {
      const gameMonkeysFiltered = gameMonkeys.filter(row => row.game === game.abb);
      const arr = [];
      gameMonkeysFiltered.forEach(row => {
        arr.push(allMonkeys.find(e => e.id === row.monkey));
      });
      game.monkeys = arr;
    });

    // assign regions to each game
    games.forEach(game => {
      const gameRegionsFiltered = gameRegions.filter(row => row.game === game.abb);
      const arr = [];
      gameRegionsFiltered.forEach(row => {
        arr.push(allRegions.find(e => e.id === row.region))
      });
      game.regions = arr;
    });

    // clean up the many-to-many relationships present in each game object
    newGames.forEach(game => {
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
    newProfiles.forEach(profile => {
      profile.mod = false;
      moderators.forEach(moderator => {
        if (profile.id === moderator.user_id) {
          profile.mod = true;
        }
      });
    });

    // update states
    setCountries(countries);
    setGames(games);
    setLevels(levels);
    setModerators(moderators);
    setProfiles(profiles);
    setStaticCache({
      countries: countries,
      games: newGames,
      profiles: newProfiles
    });
    console.log(newGames);
  };

  // code that is executed on page load
  useEffect(() => {
    loadSession();
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== APP COMPONENT ===== */
  return (
    <UserContext.Provider value={ { user } }>
      <StaticCacheContext.Provider value={ { staticCache } }>
        <Navbar />
        <div className="app">
          <Routes>
            <Route path="/" element={ <Home /> }/>
            <Route path="/submissions" element={
              <Submissions cache={ { games: games, submissionReducer: submissionReducer } } />
            } />
            <Route path="/games" element={<GameSelect imageReducer={ imageReducer } />}/>
            <Route path="/resources" element={<Resources />}></Route>
            <Route path="/support" element={ <Support /> }/>
            <Route path="/notifications" element={ <Notifications /> } />
            <Route path="/login" element={ <Login /> }/>
            <Route path="/profile" element={ <Profile cache={ { profiles: profiles, countries: countries, imageReducer: imageReducer } } /> }/>
            <Route path="games/:game" element={ <Game /> }/>
            <Route path="games/:game/main/medals" element={
              <Medals cache={ { games: games, submissionReducer: submissionReducer, imageReducer: imageReducer } } />
            }/>
            <Route path="games/:game/misc/medals" element={
              <Medals cache={ { games: games, submissionReducer: submissionReducer, imageReducer: imageReducer } } />
            }/>
            <Route path="games/:game/main/totalizer" element={
              <Totalizer cache={ { games: games, levels: levels, submissionReducer: submissionReducer, imageReducer: imageReducer } } />
            }/>
            <Route path="games/:game/misc/totalizer" element={
              <Totalizer cache={ { games: games, levels: levels, submissionReducer: submissionReducer, imageReducer: imageReducer } } />
            }/>
            <Route path="games/:game/main/score" element={
              <Records cache={ { games: games, levels: levels, submissionReducer: submissionReducer } } />
            }/>
            <Route path="games/:game/main/time" element={
              <Records cache={ { games: games, levels: levels, submissionReducer: submissionReducer } } />
            }/>
            <Route path="games/:game/misc/score" element={
              <Records cache={ { games: games, levels: levels, submissionReducer: submissionReducer } } />
            }/>
            <Route path="games/:game/misc/time" element={
              <Records cache={ { games: games, levels: levels, submissionReducer: submissionReducer } } />
            }/>
            <Route path="games/:game/main/score/:levelid" element={
              <Levelboard cache={ { 
                games: games,
                levels: levels,
                moderators: moderators,
                submissionReducer: submissionReducer,
                profiles: profiles,
                imageReducer: imageReducer
              } } />
            }/>
            <Route path="games/:game/main/time/:levelid" element={
              <Levelboard cache={ { 
                games: games,
                levels: levels,
                moderators: moderators,
                submissionReducer: submissionReducer,
                profiles: profiles,
                imageReducer: imageReducer
              } } />
            }/>
            <Route path="games/:game/misc/score/:levelid" element={
              <Levelboard cache={ { 
                games: games,
                levels: levels,
                moderators: moderators,
                submissionReducer: submissionReducer,
                profiles: profiles,
                imageReducer: imageReducer
              } } />
            }/>
            <Route path="games/:game/misc/time/:levelid" element={
              <Levelboard cache={ { 
                games: games,
                levels: levels,
                moderators: moderators,
                submissionReducer: submissionReducer,
                profiles: profiles,
                imageReducer: imageReducer
              } } />
            }/>
            <Route path="/user/:userId" element={<User imageReducer={ imageReducer } />}/>
            <Route path="/user/:userId/:game/main" element={
              <UserStats cache={ { profiles: profiles, games: games, levels: levels, submissionReducer: submissionReducer, imageReducer: imageReducer } } />
            }/>
            <Route path="/user/:userId/:game/misc" element={
              <UserStats cache={ { profiles: profiles, games: games, levels: levels, submissionReducer: submissionReducer, imageReducer: imageReducer } } />
            }/>
          </Routes>
        </div>
      </StaticCacheContext.Provider>
    </UserContext.Provider>
  );
};

export default App;