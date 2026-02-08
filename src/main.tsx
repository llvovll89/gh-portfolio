import { createRoot } from "react-dom/client";
import App from "./App";
import "./global.css";
import { BrowserRouter } from "react-router-dom";
import "./i18n/i18n";

createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);
