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
import Records from "./pages/Records/Records";

function App() {
  // states
  const [session, setSession] = useState(null);
  const [isMod, setIsMod] = useState(null);

   // function that queries the mod table to see if current user is a mod
   const queryMods = async () => {
     try {
      // initialize 
      const userId = supabase.auth.user() ? supabase.auth.user().id : null;

      // perform query, if necessary
      if (userId) {
        const { data: mods, error, status } = await supabase
          .from("moderator")
          .select("user_id")
          .eq("user_id", userId)

        // error handling
        if (error && status !== 406) {
          throw error;
        }
  
        // if data is not empty, this means match was found -> user is mod
        if (mods.length > 0) {
          console.log(mods);
          setIsMod(true);
        } else {
          setIsMod(false);
        }
      } else {
        setIsMod(false);
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
