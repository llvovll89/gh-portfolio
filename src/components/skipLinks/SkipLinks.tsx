/**
 * SkipLinks - Accessibility component for keyboard navigation
 * Allows users to skip to main content sections
 */
export const SkipLinks = () => {
    const handleSkip = (event: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        event.preventDefault();
        const target = document.getElementById(targetId);
        if (target) {
            target.focus();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <nav
            aria-label="Skip links"
            className="skip-links"
        >
            <a
                href="#main-content"
                onClick={(e) => handleSkip(e, 'main-content')}
                className="skip-link"
            >
                Skip to main content
            </a>
            <a
                href="#main-navigation"
                onClick={(e) => handleSkip(e, 'main-navigation')}
                className="skip-link"
            >
                Skip to navigation
            </a>
            <a
                href="#header-tabs"
                onClick={(e) => handleSkip(e, 'header-tabs')}
                className="skip-link"
            >
                Skip to file tabs
            </a>
        </nav>
    );
};
