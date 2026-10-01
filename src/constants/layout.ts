export const LAYOUT_CONSTANTS = {
    MOBILE_SIDEBAR_WIDTH: 0,
    DESKTOP_SIDEBAR_WIDTH_COLLAPSED: 40,
    DESKTOP_SIDEBAR_WIDTH_EXPANDED: 250,
    HEADER_HEIGHT: 40,
    FOOTER_MIN_HEIGHT: 32,
    BREADCRUMB_HEIGHT: 28,
    STATUS_BAR_HEIGHT: 24,
} as const;

// Notices sit below navigation and blocking project dialogs.
export const SURFACE_LAYERS = { notice: 40, projectDialog: 100 } as const;
