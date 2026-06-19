export const RouteLoading = () => {
    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-[2px] overflow-hidden">
            <div
                className="h-full bg-linear-to-r from-primary via-blue-400 to-primary"
                style={{ animation: 'loading-bar 1.2s ease-in-out infinite' }}
            />
        </div>
    );
};
