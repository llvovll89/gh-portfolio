import { Component, type ErrorInfo, type ReactNode } from "react";
import { FeedbackPage } from "./FeedbackPage";

type Props = { children: ReactNode; pageName?: string };
type State = { hasError: boolean };

export class PageErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };
    static getDerivedStateFromError(): State { return { hasError: true }; }
    componentDidCatch(error: Error, info: ErrorInfo) { console.error("[PageErrorBoundary]", this.props.pageName, error, info.componentStack); }
    render() {
        if (!this.state.hasError) return this.props.children;
        return <FeedbackPage kind="error" onRetry={() => window.location.reload()} onHome={() => this.setState({ hasError: false })} />;
    }
}
