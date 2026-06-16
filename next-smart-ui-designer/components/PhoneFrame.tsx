import type { ReactNode } from 'react';

export function PhoneFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`phone-frame ${className ?? ''}`}>
      <div className="status-bar">
        <span>10:00</span>
        <div className="status-icons" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9z" fill="currentColor" /><path d="M5 13l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" fill="currentColor" /><path d="M9 17l2 2c1.1-1.1 2.9-1.1 4 0l2-2c-2.21-2.21-5.79-2.21-8 0z" fill="currentColor" /></svg>
          <svg viewBox="0 0 24 24" fill="none"><path d="M5 12.55a11 11 0 0 1 14.08 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M1.42 9a16 16 0 0 1 21.16 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><line x1="12" y1="20" x2="12.01" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          <svg viewBox="0 0 28 14" fill="none"><rect x="0" y="1" width="22" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.5" /><rect x="2" y="3" width="16" height="8" rx="1" fill="currentColor" /><rect x="24" y="4" width="2" height="6" rx="1" fill="currentColor" /></svg>
        </div>
      </div>
      <div className="phone-screen">
        {children}
      </div>
    </div>
  );
}
