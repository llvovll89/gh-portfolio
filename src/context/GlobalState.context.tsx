/**
 * GlobalState.context.tsx
 * 하위 4개 Context를 하나의 GlobalStateProvider로 합성해 App.tsx에서 사용.
 * 각 컴포넌트는 개별 Context를 직접 import해 불필요한 리렌더링을 방지.
 */
import { ThemeProvider } from "./ThemeContext";
import { LayoutProvider } from "./LayoutContext";
import { NavigationProvider } from "./NavigationContext";
import { TerminalProvider } from "./TerminalContext";
import { ToastProvider } from "./ToastContext";

// 개별 Context 및 타입 재-export (편의용)
export { ThemeContext, useThemeContext } from "./ThemeContext";
export type { SelectedThemeState } from "./ThemeContext";

export { LayoutContext, useLayoutContext } from "./LayoutContext";
export type { LayoutState } from "./LayoutContext";

export { NavigationContext, useNavigationContext } from "./NavigationContext";
export type { SelectedPathState } from "./NavigationContext";

export { TerminalContext, useTerminalContext } from "./TerminalContext";

export { useToast } from "./ToastContext";
export type { ToastType } from "./ToastContext";

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
