export const RouteLoading = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
                {/* Spinner */}
                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />

                {/* Text */}
                <p className="text-white text-sm tracking-wide animate-pulse">
                    Loading page...
                </p>
            </div>
        </div>
    )
};