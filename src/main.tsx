import { createRoot } from "react-dom/client";
import App from "./App";
import "./global.css";
import { BrowserRouter } from "react-router-dom";
import "./i18n/i18n";
import { initGa } from "./utils/gtag";

const gaId = import.meta.env.VITE_GA_ID as string | undefined;
if (gaId) initGa(gaId);

createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);
