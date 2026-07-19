/* ===== IMPORTS ===== */
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { BrowserRouter } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { MuiTheme } from "./utils/Themes";
import { ThemeProvider } from "@mui/material";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// create root, and render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter future={ {
    v7_relativeSplatPath: true,
    v7_startTransition: true
  } }>
    <ThemeProvider theme={ MuiTheme }>
      <LocalizationProvider dateAdapter={ AdapterDayjs }>
        <App />
      </LocalizationProvider>
    </ThemeProvider>
  </BrowserRouter>
);
