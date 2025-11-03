import type { FC, ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  children?: ReactNode;
}

const PageHeader: FC<PageHeaderProps> = ({ title, children }) => {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="font-headline text-3xl font-bold">{title}</h1>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
};

export default PageHeader;
