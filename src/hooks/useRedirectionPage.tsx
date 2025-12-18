import {useContext, useEffect} from "react";
import {GlobalStateContext} from "../context/GlobalState.context";
import {useNavigate} from "react-router-dom";
import {DEFAULT} from "../routes/route";

export const useRedirectionPage = () => {
    const navigation = useNavigate();
    const {selectedPathState,} = useContext(GlobalStateContext);

    useEffect(() => {
        if (selectedPathState.list.length === 0) {
            navigation(DEFAULT);
        }
    }, [selectedPathState]);
};
