import {GlobalStateProvider} from "./context/GlobalState.context";
import {KeyboardProvider} from "./context/KeyboardState.context";
import {Default} from "./pages/default/Default";

function App() {
    return (
        <GlobalStateProvider>
            <KeyboardProvider>
                <Default />
            </KeyboardProvider>
        </GlobalStateProvider>
    );
}

export default App;
