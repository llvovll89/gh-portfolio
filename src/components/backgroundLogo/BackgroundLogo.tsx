interface BackgroundLogoProps {
    opacity?: number;
    size?: string;
}

export const BackgroundLogo = ({ opacity, size }: BackgroundLogoProps) => {
    return (
        <div
            className={`absolute inset-0 opacity-${opacity ?? 50} bg-no-repeat bg-center`}
            style={{
                backgroundImage: "url('/assets/logo/GH_logo_small_white.png')",
                backgroundSize: `${size ?? '15%'}`
            }}
        />
    );
};