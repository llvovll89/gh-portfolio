import type { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
}

// 모든 목록형 페이지가 같은 제목 위계(h1 크기·굵기·간격)를 쓰도록 하는 공통 헤더
export const PageHeader = ({ title, description, actions }: PageHeaderProps) => (
    <header className="page-header">
        <div className="page-header-text">
            <h1>{title}</h1>
            {description && <p>{description}</p>}
        </div>
        {actions && <div className="page-header-actions">{actions}</div>}
    </header>
);
