/* ===== IMPORTS ===== */
import "./App.css";
import { MessageContext, StaticCacheContext, UserContext } from "./utils/Contexts";
import { Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import AppLogic from "./App.js";
import Approvals from "./pages/Approvals/Approvals.jsx";
import Game from "./pages/Game/Game.jsx";
import GameLayout from "./components/GameLayout/GameLayout.jsx";
import GameSelect from "./pages/GameSelect/GameSelect.jsx";
import GettingStarted from "./pages/GettingStarted/GettingStarted.jsx";
import Home from "./pages/Home/Home.jsx";
import Levelboard from "./pages/Levelboard/Levelboard.jsx";
import Medals from "./pages/Medals/Medals.jsx";
import MessagePopup from "./components/MessagePopup/MessagePopup.jsx";
import Moderator from "./pages/Moderator/Moderator.jsx";
import ModeratorLayout from "./components/ModeratorLayout/ModeratorLayout.jsx";
import Navbar from "./components/Navbar/Navbar.jsx";
import News from "./pages/News/News.jsx";
import Notifications from "./pages/Notifications/Notifications.jsx";
import Post from "./pages/Post/Post.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import Overview from "./pages/Overview/Overview.jsx";
import Records from "./pages/Records/Records.jsx";
import Reports from "./pages/Reports/Reports.jsx";
import ResourcesLayout from "./components/ResourcesLayout/ResourcesLayout.jsx";
import SignIn from "./pages/SignIn/SignIn.jsx";
import SubmissionHistory from "./pages/SubmissionHistory/SubmissionHistory.jsx";
import Support from "./pages/Support/Support.jsx";
import Totalizer from "./pages/Totalizer/Totalizer.jsx";
import User from "./pages/User/User.jsx";
import Users from "./pages/Users/Users.jsx";
import UserLayout from "./components/UserLayout/UserLayout.jsx";
import UserStats from "./pages/UserStats/UserStats.jsx";

function App() {
  /* ===== STATES AND FUNCTIONS ===== */

  // states and functions from the js file
  const {
    user, 
    staticCache, 
    messages,
    images,
    dispatchImages,
    addMessage,
    callSessionListener,
    loadData,
    handleMessageClose
  } = AppLogic();

  /* ===== VARIABLES ===== */
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
    <MessageContext.Provider value={ { addMessage } }>
      <StaticCacheContext.Provider value={ { staticCache } }>
        <UserContext.Provider value={ { user } }>
          { /* Render the navbar at the top of the application */ }
          <Navbar imageReducer={ imageReducer } />

          { /* The app div is a set of routes, as well as any messages. Each route corresponds to a page. */ }
          <div className="app">

            { /* Render any message popups. */ }
            { messages.map((row, index) => {
              return <MessagePopup 
                message={ row.message } 
                type={ row.type }
                index={ index }
                onClose={ handleMessageClose }
                key={ index }
              />;
            })}

            { /* App routes */ }
            <Routes>
              <Route path="/" element={ <Home /> }/>
              <Route path="/games" element={<GameSelect imageReducer={ imageReducer } />}/>
              <Route path="/users" element={ <Users imageReducer={ imageReducer } /> } />
              <Route path="/news" element={ <News /> } />
              <Route path="/support" element={ <Support /> }/>
              <Route path="/notifications" element={ <Notifications /> } />
              <Route path="/profile" element={ <Profile imageReducer={ imageReducer } /> }/>
              <Route path="/signin" element={ <SignIn /> } />
              <Route path="/games/:abb" element={ <GameLayout imageReducer={ imageReducer } /> } >
                <Route index element={ <Game /> } />
                <Route path=":category" element={ <Game /> }/>
                <Route path=":category/medals/score" element={
                  <Medals imageReducer={ imageReducer } />
                }/>
                <Route path=":category/medals/time" element={
                  <Medals imageReducer={ imageReducer } />
                }/>
                <Route path=":category/totalizer/score" element={
                  <Totalizer imageReducer={ imageReducer } />
                }/>
                <Route path=":category/totalizer/time" element={
                  <Totalizer imageReducer={ imageReducer } />
                }/>
                <Route path=":category/score" element={
                  <Records />
                }/>
                <Route path=":category/time" element={
                  <Records />
                }/>
                <Route path=":category/score/:levelid" element={
                  <Levelboard imageReducer={ imageReducer } />
                }/>
                <Route path=":category/time/:levelid" element={
                  <Levelboard imageReducer={ imageReducer } />
                }/>
                <Route path=":category/score/:levelid/:profileId/normal" element={
                  <SubmissionHistory />
                }/>
                <Route path=":category/score/:levelid/:profileId/tas" element={
                  <SubmissionHistory />
                }/>
                <Route path=":category/time/:levelid/:profileId/normal" element={
                  <SubmissionHistory />
                }/>
                <Route path=":category/time/:levelid/:profileId/tas" element={
                  <SubmissionHistory />
                }/>
              </Route>
              <Route path="/user/:profileId" element={ <UserLayout imageReducer={ imageReducer } /> } >
                <Route index element={ <User />} />
                <Route path=":game/:category/score" element={
                  <UserStats />
                }/>
                <Route path=":game/:category/time" element={
                  <UserStats />
                }/>
              </Route>
              <Route path="resources" element={ <ResourcesLayout /> } >
                <Route index element={ <Overview imageReducer={ imageReducer } /> } />
                <Route path="overview" element={ <Overview imageReducer={ imageReducer } /> } />
                <Route path="getting_started" element={ <GettingStarted /> } />
              </Route>
              <Route path="moderator" element={ <ModeratorLayout /> } >
                <Route index element={ <Moderator /> } />
                <Route path="approvals" element={
                  <Approvals imageReducer={ imageReducer } />
                }/>
                <Route path="reports" element={
                  <Reports imageReducer={ imageReducer } />
                }/>
                <Route path="post" element={
                  <Post />
                }/>
              </Route>
            </Routes>
          </div>
        </UserContext.Provider>
      </StaticCacheContext.Provider>
    </MessageContext.Provider>
  );
};

/* ===== EXPORTS ===== */
export default App;