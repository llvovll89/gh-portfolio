import { FaGithub } from "react-icons/fa";

export const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="absolute bottom-0 left-0 w-full h-12 bg-main flex items-center justify-between px-4">
            <p className="text-white/50 text-xs">© {year} Geon Ho Kim. All rights reserved.</p>
            <a
                href="https://github.com/llvovll89"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors duration-200"
                aria-label="GitHub 프로필"
            >
                <FaGithub className="w-4 h-4" />
            </a>
        </footer>
    );
};
