/* ===== IMPORTS ===== */
import { createTheme } from "@mui/material";

/* ===== EXPORTS ===== */
export const MuiTheme = createTheme({
    palette: {
        background: {
            paper: "#333"
        },
        mode: "dark",
        primary: {
            main: "rgb(var(--color-link))"
        },
        secondary: {
        main: "#039be5"
        }
    },
    typography: {
        fontFamily: "var(--font)",
    }
});