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
import User from "./pages/User/User";
import Totalizer from "./pages/Totalizer/Totalizer";
import Medals from "./pages/Medals/Medals";
import UserStats from "./pages/UserStats/UserStats";
import Submissions from "./pages/Submissions/Submissions";


function App() {
  // states
  const [session, setSession] = useState(null);
  const [isMod, setIsMod] = useState(false);

   // function that queries the mod table to see if current user is a mod
   const queryMods = async () => {
     try {
       // initialize 
       const userId = supabase.auth.user() ? supabase.auth.user().id : null;
 
       const { data: mods, error, status } = await supabase
         .from("moderator")
         .select("user_id")
 
       if (error && status !== 406) {
         throw error;
       }
 
       // now, iterate through each mod. if a match is detected, update state
       for (const mod of mods) {
         if (mod.user_id === userId) {
           setIsMod(true);
         }
       }
 
     } catch (error) {
        console.log(error);
     }
   }

   useEffect(() => {
    setSession(supabase.auth.session());
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);
 
   useEffect(() => {
     queryMods();
     // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [session]);

  return (
    <>
      <Navbar isMod={ isMod } />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/submissions" element={<Submissions />} />
          <Route path="/games" element={<GameSelect />}/>
          <Route path="games/:game" element={<Game />}/>
          <Route path="games/:game/totalizer" element={<Totalizer />} />
          <Route path="games/:game/medals" element={<Medals />} />
          <Route path="games/:game/:mode/:levelid" element={<Levelboard />}/>
          <Route path="/resources" element={<Resources />}></Route>
          <Route path="/support" element={<Support />}/>
          <Route path="/login" element={<Login />}/>
          <Route path="/profile" element={<Profile />}/>
          <Route path="/user/:userId" element={<User />}/>
          <Route path="/user/:userId/:game" element={<UserStats />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
