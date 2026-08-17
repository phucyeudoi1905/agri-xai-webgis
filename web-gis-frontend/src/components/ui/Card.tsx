import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return <section className={`card ${className}`.trim()}>{children}</section>;
}

interface CardHeadProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function CardHead({ title, subtitle, actions }: CardHeadProps) {
  return (
    <header className="card-head">
      <div className="card-head-titles">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions}
    </header>
  );
}

export function CardBody({ children, className = '' }: CardProps) {
  return <div className={`card-body ${className}`.trim()}>{children}</div>;
}
