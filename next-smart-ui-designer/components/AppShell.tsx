import type { ReactNode } from 'react';
import { DesignerSidebar } from './DesignerSidebar';

export function AppShell({ title, subtitle, children, actions }: { title: string; subtitle: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="page-shell">
      <div className="app-shell">
        <DesignerSidebar />
        <main className="main-content">
          <header className="topbar">
            <div className="topbar-title">
              <strong>{title}</strong>
              <span>{subtitle}</span>
            </div>
            {actions ?? null}
          </header>
          <div className="content">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
