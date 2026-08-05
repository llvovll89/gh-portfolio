import { matchPath, useLocation } from "react-router-dom";
import { NOT_FOUND, routesPath } from "../routes/route";

export const useMatchedRoute = () => {
    const location = useLocation();
    return routesPath.find(
        (route) =>
            route.path !== NOT_FOUND &&
            Boolean(matchPath({ path: route.path, end: true }, location.pathname)),
    );
};
