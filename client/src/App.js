import { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { supabase } from "./components/SupabaseClient/SupabaseClient";
import Load from "./Load";

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

function App() {
  /* ===== STATES ===== */
  const [session, setSession] = useState(null);
  const [isMod, setIsMod] = useState(null);
  const [countries, setCountries] = useState(null);
  const [games, setGames] = useState(null);
  const [levels, setLevels] = useState(null);
  const [monkeys, setMonkeys] = useState(null);
  const [profiles, setProfiles] = useState(null);

  // load functions from the load file
  const { 
    queryMods,
    loadCountries, 
    loadGames, 
    loadLevels, 
    loadMonkeys, 
    loadProfiles 
  } = Load();

  // code that is executed on page load
  useEffect(() => {
    // first, the session is loaded into the session hook
    setSession(supabase.auth.session());
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // next, load data
    loadCountries(setCountries);
    loadGames(setGames);
    loadLevels(setLevels);
    loadMonkeys(setMonkeys);
    loadProfiles(setProfiles);

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
          <Route path="/profile" element={<Profile />}/>
          <Route path="/games" element={<GameSelect />}/>
          <Route path="games/:game" element={<Game />}/>
          <Route path="games/:game/main/totalizer" element={<Totalizer />}/>
          <Route path="games/:game/misc/totalizer" element={<Totalizer />}/>
          <Route path="games/:game/main/medals" element={<Medals />}/>
          <Route path="games/:game/misc/medals" element={<Medals />}/>
          <Route path="games/:game/main/score" element={<Records />} />
          <Route path="games/:game/main/time" element={<Records />} />
          <Route path="games/:game/misc/score" element={<Records />} />
          <Route path="games/:game/misc/time" element={<Records />} />
          <Route path="games/:game/main/time/:levelid" element={<Levelboard isMod={ isMod } />}/>
          <Route path="games/:game/main/score/:levelid" element={<Levelboard isMod={ isMod } />}/>
          <Route path="games/:game/misc/time/:levelid" element={<Levelboard isMod={ isMod } />}/>
          <Route path="games/:game/misc/score/:levelid" element={<Levelboard isMod={ isMod } />}/>
          <Route path="/resources" element={<Resources />}></Route>
          <Route path="/submissions" element={<Submissions isMod={ isMod } />} />
          <Route path="/support" element={<Support />}/>
          <Route path="/user/:userId" element={<User />}/>
          <Route path="/user/:userId/:game/main" element={<UserStats />}/>
          <Route path="/user/:userId/:game/misc" element={<UserStats />}/>
        </Routes>
      </div>
    </>
  );
}

export default App;
