/**
 * GlobalState.context.tsx
 * 하위 4개 Context를 하나의 GlobalStateProvider로 합성해 App.tsx에서 사용.
 * 각 컴포넌트는 개별 Context를 직접 import해 불필요한 리렌더링을 방지.
 */
import { ThemeProvider } from "./ThemeContext";
import { LayoutProvider } from "./LayoutProvider";
import { NavigationProvider } from "./NavigationProvider";
import { TerminalProvider } from "./TerminalContext";
import { ToastProvider } from "./ToastContext";

/** App.tsx 에서 사용하는 합성 Provider */
export const GlobalStateProvider = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>
        <LayoutProvider>
            <NavigationProvider>
                <TerminalProvider>
                    <ToastProvider>
                        {children}
                    </ToastProvider>
                </TerminalProvider>
            </NavigationProvider>
        </LayoutProvider>
    </ThemeProvider>
);
