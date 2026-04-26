declare interface Window {
    dataLayer: unknown[];
    gtag: (command: string, ...args: unknown[]) => void;
}
