import { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { supabase } from "./components/SupabaseClient/SupabaseClient";

import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import GameSelect from "./pages/GameSelect/GameSelect";
import Game from "./pages/Game/Game";
import Levelboard from "./pages/Levelboard/Levelboard"
import Support from "./pages/Support/Support";
import Resources from "./pages/Resources/Resources";
import Login from "./pages/Login/Login";
import Profile from "./pages/Profile/Profile";


function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    setSession(supabase.auth.session());
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <>
      <Navbar />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/games" element={<GameSelect />}/>
          <Route path="games/:game" element={<Game />}/>
          <Route path="games/:game/:mode/:levelid" element={<Levelboard />}/>
          <Route path="/resources" element={<Resources />}></Route>
          <Route path="/support" element={<Support />}/>
          <Route path="/login" element={<Login />}/>
          <Route path="/profile" element={<Profile session={session}/>}/>
        </Routes>
      </div>
    </>
  );
}

export default App;
