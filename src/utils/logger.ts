const isDev = import.meta.env.DEV

/**
 * 표준화된 로거 유틸리티
 * - DEV: 콘솔 출력
 * - PROD: error만 콘솔 출력 (추후 Sentry 등 연동 시 이 파일만 수정)
 */
export const logger = {
    info: (msg: string, ...args: unknown[]) => {
        if (isDev) console.info(`[INFO] ${msg}`, ...args)
    },

    warn: (msg: string, ...args: unknown[]) => {
        if (isDev) console.warn(`[WARN] ${msg}`, ...args)
    },

    error: (msg: string, error?: unknown) => {
        console.error(`[ERROR] ${msg}`, error ?? '')
        // TODO: Sentry.captureException(error) 연동 시 여기에 추가
    },
}
