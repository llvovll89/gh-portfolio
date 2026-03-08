import {useContext, useEffect} from "react";
import {NavigationContext} from "../context/NavigationContext";
import {useNavigate} from "react-router-dom";
import {DEFAULT} from "../routes/route";

export const useRedirectionPage = () => {
    const navigation = useNavigate();
    const {selectedPathState} = useContext(NavigationContext);

    useEffect(() => {
        if (selectedPathState.list.length === 0) {
            navigation(DEFAULT);
        }
    }, [selectedPathState]);
};
