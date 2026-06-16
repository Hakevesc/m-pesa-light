'use client';

import { useRef, useState } from 'react';
import { Download, FileJson, ImageIcon, Smartphone } from 'lucide-react';
import { designTokens, downloadJson, screens } from '@/lib/registry';
import { exportPhonePreviewAsPng } from '@/lib/export';

export function ExportDropdown() {
  const [open, setOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);

  async function exportPng() {
    setOpen(false);
    await exportPhonePreviewAsPng(previewRef.current, 'mpesa-screen.png');
  }

  return (
    <div className="topbar-actions">
      <div style={{ position: 'relative' }}>
        <button className="secondary-button" onClick={() => setOpen((value) => !value)}>
          <Download size={16} />
          Export
        </button>

        {open && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 220,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-stroke)',
            borderRadius: '14px',
            boxShadow: 'var(--shadow-medium)',
            overflow: 'hidden',
            zIndex: 20
          }}>
            <button className="nav-link" onClick={() => downloadJson('mpesa-tokens.json', designTokens)}>
              <FileJson size={16} />
              Tokens JSON
            </button>
            <button className="nav-link" onClick={() => downloadJson('mpesa-screens.json', screens)}>
              <Smartphone size={16} />
              Screens JSON
            </button>
            <button className="nav-link" onClick={exportPng}>
              <ImageIcon size={16} />
              Preview PNG
            </button>
          </div>
        )}
      </div>

      <div ref={previewRef} style={{ display: 'none' }} />
    </div>
  );
}
