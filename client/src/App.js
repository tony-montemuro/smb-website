import Navbar from "./components/Navbar/Navbar";
import Home from "./components/Home/Home";
import Games from "./components/Games/Games";
import Support from "./components/Support/Support";
import { Route, Routes } from "react-router-dom";
import Resources from "./components/Resources/Resources";


function App() {
  return (
    <>
      <Navbar />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/games" element={<Games />}/>
          <Route path="/resources" element={<Resources />}></Route>
          <Route path="/support" element={<Support />}/>
        </Routes>
      </div>
    </>
  );
}

export default App;
