/* ===== IMPORTS ===== */
import "./App.css";
import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { MessageContext, StaticCacheContext, UserContext } from "./utils/Contexts";
import AppLogic from "./App.js";
import Approvals from "./pages/Approvals/Approvals.jsx";
import Game from "./pages/Game/Game.jsx";
import GameLayout from "./components/GameLayout/GameLayout";
import GameSelect from "./pages/GameSelect/GameSelect.jsx";
import Home from "./pages/Home/Home.jsx";
import Levelboard from "./pages/Levelboard/Levelboard.jsx";
import Medals from "./pages/Medals/Medals.jsx";
import MessagePopup from "./components/MessagePopup/MessagePopup.jsx";
import Moderator from "./pages/Moderator/Moderator.jsx";
import ModeratorLayout from "./components/ModeratorLayout/ModeratorLayout.jsx";
import Navbar from "./components/Navbar/Navbar.jsx";
import Notifications from "./pages/Notifications/Notifications.jsx";
import Post from "./pages/Post/Post.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import Records from "./pages/Records/Records.jsx";
import Reports from "./pages/Reports/Reports.jsx";
import Resources from "./pages/Resources/Resources.jsx";
import SubmissionHistory from "./pages/SubmissionHistory/SubmissionHistory.jsx";
import Submissions from "./pages/Submissions/Submissions.jsx";
import Support from "./pages/Support/Support.jsx";
import Totalizer from "./pages/Totalizer/Totalizer.jsx";
import User from "./pages/User/User.jsx";
import UserLayout from "./components/UserLayout/UserLayout.jsx";
import UserStats from "./pages/UserStats/UserStats.jsx";

function App() {
  /* ===== STATES AND FUNCTIONS ===== */

  // states and functions from the js file
  const {
    user, 
    staticCache, 
    messages,
    submissions,
    images,
    dispatchSubmissions,
    dispatchImages,
    addMessage,
    callSessionListener,
    loadData,
    handleMessageClose
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
              <Route path="/submissions" element={
                <Submissions imageReducer={ imageReducer } submissionReducer={ submissionReducer } />
              } />
              <Route path="/games" element={<GameSelect imageReducer={ imageReducer } />}/>
              <Route path="/resources" element={<Resources />}></Route>
              <Route path="/support" element={ <Support /> }/>
              <Route path="/notifications" element={ <Notifications /> } />
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
                <Route path="main/score/:levelid/:profileId" element={
                  <SubmissionHistory />
                }/>
                <Route path="misc/score/:levelid/:profileId" element={
                  <SubmissionHistory />
                }/>
                <Route path="main/time/:levelid/:profileId" element={
                  <SubmissionHistory />
                }/>
                <Route path="misc/time/:levelid/:profileId" element={
                  <SubmissionHistory />
                }/>
              </Route>
              <Route path="/user/:profileId" element={ <UserLayout imageReducer={ imageReducer } /> } >
                <Route index element={ <User />} />
                <Route path=":game/main/score" element={
                  <UserStats submissionReducer={ submissionReducer } />
                }/>
                <Route path=":game/misc/score" element={
                  <UserStats submissionReducer={ submissionReducer } />
                }/>
                <Route path=":game/main/time" element={
                  <UserStats submissionReducer={ submissionReducer } />
                }/>
                <Route path=":game/misc/time" element={
                  <UserStats submissionReducer={ submissionReducer } />
                }/>
              </Route>
              <Route path="moderator" element={ <ModeratorLayout /> } >
                <Route index element={ <Moderator /> } />
                <Route path="approvals" element={
                  <Approvals />
                }/>
                <Route path="reports" element={
                  <Reports />
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