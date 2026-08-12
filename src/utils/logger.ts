const isDev = import.meta.env.DEV;

export const logger = {
    info: (msg: string, ...args: unknown[]) => {
        if (isDev) console.info(`[INFO] ${msg}`, ...args);
    },

    warn: (msg: string, ...args: unknown[]) => {
        if (isDev) console.warn(`[WARN] ${msg}`, ...args);
    },

    error: (msg: string, error?: unknown) => {
        console.error(`[ERROR] ${msg}`, error ?? "");
    },
};
