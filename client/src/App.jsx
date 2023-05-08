/* ===== IMPORTS ===== */
import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { UserContext, StaticCacheContext } from "./Contexts";
import AppLogic from "./App.js";
import Game from "./pages/Game/Game.jsx";
import GameLayout from "./components/GameLayout/GameLayout";
import GameSelect from "./pages/GameSelect/GameSelect.jsx";
import Home from "./pages/Home/Home.jsx";
import Levelboard from "./pages/Levelboard/Levelboard.jsx";
import Login from "./pages/Login/Login.jsx";
import Medals from "./pages/Medals/Medals.jsx";
import Navbar from "./components/Navbar/Navbar.jsx";
import Notifications from "./pages/Notifications/Notifications.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import Records from "./pages/Records/Records.jsx";
import Resources from "./pages/Resources/Resources.jsx";
import SubmissionHistory from "./pages/SubmissionHistory/SubmissionHistory.jsx";
import Submissions from "./pages/Submissions/Submissions.jsx";
import Support from "./pages/Support/Support.jsx";
import Totalizer from "./pages/Totalizer/Totalizer.jsx";
import User from "./pages/User/User.jsx";
import UserStats from "./pages/UserStats/UserStats.jsx";

function App() {
  /* ===== STATES AND FUNCTIONS ===== */

  // states and functions from the js file
  const {
    user, 
    staticCache, 
    submissions,
    images,
    dispatchSubmissions,
    dispatchImages,
    callSessionListener,
    loadData
  } = AppLogic();

  /* ===== VARIABLES ===== */
  const submissionReducer = { state: submissions, dispatchSubmissions: dispatchSubmissions };
  const imageReducer = { reducer: images, dispatchImages: dispatchImages };

  /* ===== EFFECTS ===== */

  // code that is executed when the application is first loaded (when app component mounts)
  useEffect(() => {
    callSessionListener();
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== APP COMPONENT ===== */
  return (
    <UserContext.Provider value={ { user } }>
      <StaticCacheContext.Provider value={ { staticCache } }>
        { /* Render the navbar at the top of the application */ }
        <Navbar />

        { /* The app div is a set of routes. Each route corresponds to a page. */ }
        <div className="app">
          <Routes>
            <Route path="/" element={ <Home /> }/>
            <Route path="/submissions" element={
              <Submissions submissionReducer={ submissionReducer } />
            } />
            <Route path="/games" element={<GameSelect imageReducer={ imageReducer } />}/>
            <Route path="/resources" element={<Resources />}></Route>
            <Route path="/support" element={ <Support /> }/>
            <Route path="/notifications" element={ <Notifications /> } />
            <Route path="/login" element={ <Login /> }/>
            <Route path="/profile" element={ <Profile imageReducer={ imageReducer } /> }/>
            <Route path="/games/:abb" element={ <GameLayout imageReducer={ imageReducer } /> } >
              <Route index element={ <Game /> } />
              <Route path="main" element={ <Game /> }/>
              <Route path="misc" element={ <Game /> }/>
              <Route path="main/medals/score" element={
                <Medals imageReducer={ imageReducer } submissionReducer={ submissionReducer } />
              }/>
              <Route path="main/medals/time" element={
                <Medals imageReducer={ imageReducer } submissionReducer={ submissionReducer } />
              }/>
              <Route path="misc/medals/score" element={
                <Medals imageReducer={ imageReducer } submissionReducer={ submissionReducer } />
              }/>
              <Route path="misc/medals/time" element={
                <Medals imageReducer={ imageReducer } submissionReducer={ submissionReducer } />
              }/>
              <Route path="main/totalizer/score" element={
                <Totalizer imageReducer={ imageReducer } submissionReducer={ submissionReducer } />
              }/>
              <Route path="main/totalizer/time" element={
                <Totalizer imageReducer={ imageReducer } submissionReducer={ submissionReducer } />
              }/>
              <Route path="misc/totalizer/score" element={
                <Totalizer imageReducer={ imageReducer } submissionReducer={ submissionReducer } />
              }/>
              <Route path="misc/totalizer/time" element={
                <Totalizer imageReducer={ imageReducer } submissionReducer={ submissionReducer } />
              }/>
              <Route path="main/score" element={
                <Records submissionReducer={ submissionReducer } />
              }/>
              <Route path="main/time" element={
                <Records submissionReducer={ submissionReducer } />
              }/>
              <Route path="misc/score" element={
                <Records submissionReducer={ submissionReducer } />
              }/>
              <Route path="misc/time" element={
                <Records submissionReducer={ submissionReducer } />
              }/>
              <Route path="main/score/:levelid" element={
                <Levelboard imageReducer={ imageReducer } submissionReducer={ submissionReducer } />
              }/>
              <Route path="main/time/:levelid" element={
                <Levelboard imageReducer={ imageReducer } submissionReducer={ submissionReducer } />
              }/>
              <Route path="misc/score/:levelid" element={
                <Levelboard imageReducer={ imageReducer } submissionReducer={ submissionReducer } />
              }/>
              <Route path="misc/time/:levelid" element={
                <Levelboard imageReducer={ imageReducer } submissionReducer={ submissionReducer } />
              }/>
              <Route path="main/score/:levelid/:userid" element={
                <SubmissionHistory />
              }/>
              <Route path="misc/score/:levelid/:userid" element={
                <SubmissionHistory />
              }/>
              <Route path="main/time/:levelid/:userid" element={
                <SubmissionHistory />
              }/>
              <Route path="misc/time/:levelid/:userid" element={
                <SubmissionHistory />
              }/>
            </Route>
            <Route path="/user/:userId" element={<User imageReducer={ imageReducer } />}/>
            <Route path="/user/:userId/:game/main/score" element={
              <UserStats submissionReducer={ submissionReducer } />
            }/>
            <Route path="/user/:userId/:game/misc/score" element={
              <UserStats submissionReducer={ submissionReducer } />
            }/>
            <Route path="/user/:userId/:game/main/time" element={
              <UserStats submissionReducer={ submissionReducer } />
            }/>
            <Route path="/user/:userId/:game/misc/time" element={
              <UserStats submissionReducer={ submissionReducer } />
            }/>
          </Routes>
        </div>
      </StaticCacheContext.Provider>
    </UserContext.Provider>
  );
};

/* ===== EXPORTS ===== */
export default App;