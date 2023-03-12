import { useState, useEffect, useReducer } from "react";
import { Route, Routes } from "react-router-dom";
import { supabase } from "./database/SupabaseClient";

import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import GameSelect from "./pages/GameSelect/GameSelect";
import Game from "./pages/Game/Game";
import Levelboard from "./pages/Levelboard/Levelboard"
import Session from "./database/authentication/Session";
import Support from "./pages/Support/Support";
import Resources from "./pages/Resources/Resources";
import Login from "./pages/Login/Login";
import Profile from "./pages/Profile/Profile";
import User from "./pages/User/User";
import Totalizer from "./pages/Totalizer/Totalizer";
import Medals from "./pages/Medals/Medals";
import UserStats from "./pages/UserStats/UserStats";
import Submissions from "./pages/Submissions/Submissions";
import Records from "./pages/Records/Records";
import AppRead from "./database/read/AppRead";
import Notifications from "./pages/Notifications/Notifications";

function App() {
  /* ===== STATES & REDUCERS ===== */
  const [session, setSession] = useState(undefined);
  const [countries, setCountries] = useState(null);
  const [games, setGames] = useState(null);
  const [levels, setLevels] = useState(null);
  const [moderators, setModerators] = useState(null);
  const [profiles, setProfiles] = useState(null);
  const [isMod, setIsMod] = useState(null);
  const [notifications, setNotifications] = useState(null);
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

  /* ===== VARIABLES ===== */
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
    loadUserNotifications
  } = AppRead();

  // load database functions
  const { getSession } = Session();

  // async function that will make concurrent api calls to the database
  const loadData = async () => {
    // make concurrent api calls to database to load data
    const [countries, games, levels, moderators, gameMonkeys, allMonkeys, profiles, gameRegions, allRegions] = await Promise.all(
      [loadCountries(), loadGames(), loadLevels(), loadModerators(), loadGameMonkeys(), loadAllMonkeys(), loadProfiles(), loadGameRegions(), loadAllRegions()]
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

    // update states
    setCountries(countries);
    setGames(games);
    setLevels(levels);
    setModerators(moderators);
    setProfiles(profiles);
  };

  // async function that loads the user notifications, and checks the mod status
  const updateSessionData = async (newSession) => {
    if (newSession) {
      // first, let's handle notifications
      const user = newSession.user;
      const notifs = await loadUserNotifications(user.id);
      setNotifications(notifs);

      // next, let's check for mod status
      const modList = await loadModerators();
      setIsMod(modList.some(row => row.user_id === user.id));
      
    } else {
      setIsMod(false);
    }
  };

  // async function that is used to set the session, and also listens for session changes
  const sessionSetter = async () => {
    // get the new session, update the session state hook, and update relevant session hooks (notifications, isMod)
    const session = await getSession();
    setSession(session);
    updateSessionData(session);

    // listener for changes to the auth state
    supabase.auth.onAuthStateChange((event, newSession) => {
      // special case: the current session is the same as the previous session
      if (session && newSession && session.user.id === newSession.user.id) {
        return;
      }

      // otherwise, we want to update the session state hook, and update relevant session data
      setSession(newSession);
      updateSessionData(newSession);
    });
  };

  // code that is executed on page load
  useEffect(() => {
    sessionSetter();
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // app component
  return (
    <>
      <Navbar cache={ { isMod: isMod, notifications: notifications, session: session } } />
      <div className="app">
        <Routes>
          <Route path="/" element={ <Home /> }/>
          <Route path="/submissions" element={
            <Submissions cache={ { isMod: isMod, games: games, submissionReducer: submissionReducer} } />
          } />
          <Route path="/games" element={<GameSelect cache={ { games: games, imageReducer: imageReducer } } />}/>
          <Route path="/resources" element={<Resources />}></Route>
          <Route path="/support" element={ <Support /> }/>
          <Route path="/notifications" element={ <Notifications cache={ { notifications: notifications, isMod: isMod } } /> } />
          <Route path="/login" element={ <Login /> }/>
          <Route path="/profile" element={ <Profile cache={ { profiles: profiles, countries: countries, imageReducer: imageReducer, session: session } } /> }/>
          <Route path="games/:game" element={<Game cache={ { games: games, levels: levels } } />}/>
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
              isMod: isMod,
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
              isMod: isMod,
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
              isMod: isMod,
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
              isMod: isMod,
              profiles: profiles,
              imageReducer: imageReducer
            } } />
          }/>
          <Route path="/user/:userId" element={<User cache={ { games: games, profiles: profiles, imageReducer: imageReducer } } />}/>
          <Route path="/user/:userId/:game/main" element={
            <UserStats cache={ { profiles: profiles, games: games, levels: levels, submissionReducer: submissionReducer, imageReducer: imageReducer } } />
          }/>
          <Route path="/user/:userId/:game/misc" element={
            <UserStats cache={ { profiles: profiles, games: games, levels: levels, submissionReducer: submissionReducer, imageReducer: imageReducer } } />
          }/>
        </Routes>
      </div>
    </>
  );
};

export default App;