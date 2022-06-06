import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import GameSelect from "./pages/GameSelect/GameSelect";
import Game from "./pages/Game/Game";
import Levelboard from "./pages/Levelboard/Levelboard"
import Support from "./pages/Support/Support";
import { Route, Routes } from "react-router-dom";
import Resources from "./pages/Resources/Resources";


function App() {
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
        </Routes>
      </div>
    </>
  );
}

export default App;
