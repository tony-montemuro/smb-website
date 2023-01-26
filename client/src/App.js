import { useState, useEffect, useReducer } from "react";
import { Route, Routes } from "react-router-dom";
import { supabase } from "./database/SupabaseClient";

import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import GameSelect from "./pages/GameSelect/GameSelect";
import Game from "./pages/Game/Game";
import Levelboard from "./pages/Levelboard/Levelboard"
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

function App() {
  /* ===== STATES & REDUCERS ===== */
  const [session, setSession] = useState(null);
  const [isMod, setIsMod] = useState(null);
  const [countries, setCountries] = useState(null);
  const [games, setGames] = useState(null);
  const [levels, setLevels] = useState(null);
  const [profiles, setProfiles] = useState(null);
  const [scoreSubmissions, setScoreSubmissions] = useState(null);
  const [timeSubmissions, setTimeSubmissions] = useState(null);
  const [images, dispatchImages] = useReducer((state, action) => {
    return { ...state, [action.field]: action.data }
  }, null);

  /* ===== VARIABLES ===== */
  const scoreSubmissionState = { state: scoreSubmissions, setState: setScoreSubmissions };
  const timeSubmissionState = { state: timeSubmissions, setState: setTimeSubmissions };
  const imageReducer = { reducer: images, dispatchImages: dispatchImages };

  // load functions from the load file
  const { 
    queryMods,
    loadCountries, 
    loadGames, 
    loadLevels, 
    loadGameMonkeys,
    loadAllMonkeys, 
    loadProfiles,
    loadGameRegions,
    loadAllRegions
  } = AppRead();

  // code that is executed on page load
  useEffect(() => {
    // async function that will make concurrent api calls to the database
    const loadData = async () => {
      // CONCURRENT API CALLS

      const [countries, games, levels, gameMonkeys, allMonkeys, profiles, gameRegions, allRegions] = await Promise.all(
        [loadCountries(), loadGames(), loadLevels(), loadGameMonkeys(), loadAllMonkeys(), loadProfiles(), loadGameRegions(), loadAllRegions()]
      );

      // HANDLE MANY-TO-MANY RELATIONSHIPS

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

      // UPDATE STATES

      setCountries(countries);
      setGames(games);
      setLevels(levels);
      setProfiles(profiles);
    };

    // first, the session is loaded into the session hook
    setSession(supabase.auth.session());
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // next, load data
    loadData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // code that is executed each time the session is changed
  useEffect(() => {
    queryMods(setIsMod);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return (
    <>
      <Navbar isMod={ isMod } />
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/login" element={<Login />}/>
          <Route path="/profile" element={<Profile cache={ { profiles: profiles, countries: countries, imageReducer: imageReducer } } />}/>
          <Route path="/games" element={<GameSelect cache={ { games: games, imageReducer: imageReducer } } />}/>
          <Route path="games/:game" element={<Game cache={ { games: games, levels: levels } } />}/>
          <Route path="games/:game/main/medals" element={
            <Medals cache={ { games: games, scoreSubmissionState: scoreSubmissionState, timeSubmissionState: timeSubmissionState, imageReducer: imageReducer } } />
          }/>
          <Route path="games/:game/misc/medals" element={
            <Medals cache={ { games: games, scoreSubmissionState: scoreSubmissionState, timeSubmissionState: timeSubmissionState, imageReducer: imageReducer } } />
          }/>
          <Route path="games/:game/main/totalizer" element={
            <Totalizer cache={ { games: games, levels: levels, scoreSubmissionState: scoreSubmissionState, timeSubmissionState: timeSubmissionState, imageReducer: imageReducer } } />
          }/>
          <Route path="games/:game/misc/totalizer" element={
            <Totalizer cache={ { games: games, levels: levels, scoreSubmissionState: scoreSubmissionState, timeSubmissionState: timeSubmissionState, imageReducer: imageReducer } } />
          }/>
          <Route path="games/:game/main/score" element={
            <Records cache={ { games: games, levels: levels, submissionState: scoreSubmissionState } } />
          }/>
          <Route path="games/:game/main/time" element={
            <Records cache={ { games: games, levels: levels, submissionState: timeSubmissionState } } />
          }/>
          <Route path="games/:game/misc/score" element={
            <Records cache={ { games: games, levels: levels, submissionState: scoreSubmissionState } } />
          }/>
          <Route path="games/:game/misc/time" element={
            <Records cache={ { games: games, levels: levels, submissionState: timeSubmissionState } } />
          }/>
          <Route path="games/:game/main/score/:levelid" element={
            <Levelboard cache={ { 
              games: games,
              levels: levels,
              submissionState: scoreSubmissionState,
              isMod: isMod,
              profiles: profiles,
              imageReducer: imageReducer
            } } />
          }/>
          <Route path="games/:game/main/time/:levelid" element={
            <Levelboard cache={ { 
              games: games,
              levels: levels,
              submissionState: timeSubmissionState,
              isMod: isMod,
              profiles: profiles,
              imageReducer: imageReducer
            } } />
          }/>
          <Route path="games/:game/misc/score/:levelid" element={
            <Levelboard cache={ { 
              games: games,
              levels: levels,
              submissionState: scoreSubmissionState,
              isMod: isMod,
              profiles: profiles,
              imageReducer: imageReducer
            } } />
          }/>
          <Route path="games/:game/misc/time/:levelid" element={
            <Levelboard cache={ { 
              games: games,
              levels: levels,
              submissionState: timeSubmissionState,
              isMod: isMod,
              profiles: profiles,
              imageReducer: imageReducer
            } } />
          }/>
          <Route path="/resources" element={<Resources />}></Route>
          <Route path="/submissions" element={
            <Submissions cache={ { isMod: isMod, games: games, scoreSubmissionState: scoreSubmissionState, timeSubmissionState: timeSubmissionState } } />
          } />
          <Route path="/support" element={ <Support /> }/>
          <Route path="/user/:userId" element={<User cache={ { games: games, profiles: profiles, imageReducer: imageReducer } } />}/>
          <Route path="/user/:userId/:game/main" element={
            <UserStats cache={ { profiles: profiles, games: games, levels: levels, scoreSubmissionState: scoreSubmissionState, timeSubmissionState: timeSubmissionState, imageReducer: imageReducer } } />
          }/>
          <Route path="/user/:userId/:game/misc" element={
            <UserStats cache={ { profiles: profiles, games: games, levels: levels, scoreSubmissionState: scoreSubmissionState, timeSubmissionState: timeSubmissionState, imageReducer: imageReducer } } />
          }/>
        </Routes>
      </div>
    </>
  );
}

export default App;
