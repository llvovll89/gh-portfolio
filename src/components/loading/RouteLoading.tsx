import { BackgroundLogo } from "../backgroundLogo/BackgroundLogo";

export const RouteLoading = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e1e1e] overflow-hidden">
            {/* Background glow orbs */}
            <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl animate-pulse delay-300" />

            {/* Background logo */}
            <BackgroundLogo opacity={5} size="20%" />

            {/* Main content */}
            <div className="relative z-10 flex flex-col items-center gap-8">
                {/* Multi-ring spinner */}
                <div className="relative w-20 h-20 flex items-center justify-center">
                    {/* Outer ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-white/10 border-t-blue-400 animate-spin" style={{ animationDuration: '1.2s' }} />
                    {/* Middle ring */}
                    <div className="absolute inset-2 rounded-full border-2 border-white/10 border-t-purple-400 animate-spin" style={{ animationDuration: '0.9s', animationDirection: 'reverse' }} />
                    {/* Inner dot */}
                    <div className="w-3 h-3 rounded-full bg-cyan-400/80 animate-pulse" />
                </div>

                {/* Text & progress */}
                <div className="flex flex-col items-center gap-3">
                    <p className="text-white/80 text-sm font-medium tracking-[0.2em] uppercase">
                        Loading
                    </p>

                    {/* Animated dots */}
                    <div className="flex gap-1.5">
                        {[0, 1, 2, 3].map((i) => (
                            <span
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-blue-400/60 animate-bounce"
                                style={{ animationDelay: `${i * 0.15}s` }}
                            />
                        ))}
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-48 h-0.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 rounded-full" style={{ animation: 'loading-bar 1.5s ease-in-out infinite' }} />
                </div>
            </div>
        </div>
    );
};
