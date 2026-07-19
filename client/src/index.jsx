/* ===== IMPORTS ===== */
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { BrowserRouter } from "react-router";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MuiTheme } from "./utils/Themes";
import { ThemeProvider } from "@mui/material";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// create root, and render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <ThemeProvider theme={ MuiTheme }>
      <LocalizationProvider dateAdapter={ AdapterDayjs }>
        <App />
      </LocalizationProvider>
    </ThemeProvider>
  </BrowserRouter>
);
