import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Props = {
    children: ReactNode
    pageName?: string
}

type State = {
    hasError: boolean
    error: Error | null
}

export class PageErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error(`[ErrorBoundary] ${this.props.pageName ?? 'Page'} crashed:`, error, info.componentStack)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null })
    }

    render() {
        if (!this.state.hasError) return this.props.children

        return (
            <section className="w-full min-h-dvh flex items-center justify-center bg-[#0f1117] select-none px-4">
                <div className="absolute top-20 left-20 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center gap-6 text-center max-w-md w-full">
                    <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                        <svg className="w-12 h-12 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-bold text-white/90">
                            {this.props.pageName ? `${this.props.pageName} 페이지` : '페이지'}에서 오류가 발생했습니다
                        </h2>
                        <p className="text-sm text-white/50">
                            예상치 못한 오류가 발생했습니다. 다시 시도하거나 홈으로 이동해주세요.
                        </p>
                        {this.state.error && (
                            <p className="mt-1 text-xs text-rose-400/70 font-mono bg-rose-500/5 border border-rose-500/10 rounded-lg px-3 py-2 break-all">
                                {this.state.error.message}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3 flex-wrap justify-center">
                        <button
                            onClick={this.handleReset}
                            className="cursor-pointer px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/80 font-semibold rounded-xl text-sm transition-all duration-200"
                        >
                            다시 시도
                        </button>
                        <Link
                            to="/"
                            onClick={this.handleReset}
                            className="px-5 py-2.5 bg-primary hover:bg-primary/80 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-primary/20"
                        >
                            홈으로 이동
                        </Link>
                    </div>
                </div>
            </section>
        )
    }
}
