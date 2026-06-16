'use client';

import { useRouter } from 'next/navigation';
import { ChevronDown, ListFilter } from 'lucide-react';
import { useState } from 'react';
import { flows, getFirstScreenForFlow } from '@/lib/registry';
import { Icon } from './Icon';

export function FlowChooser() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(flows[0]);

  function selectFlow(flowId: string) {
    const flow = flows.find((item) => item.id === flowId) ?? flows[0];
    const firstScreen = getFirstScreenForFlow(flow.id);
    setSelected(flow);
    setOpen(false);
    router.push(firstScreen.path);
  }

  return (
    <div style={{ position: 'relative' }}>
      <button className="secondary-button" onClick={() => setOpen((value) => !value)}>
        <ListFilter size={16} />
        Flow: {selected.label}
        <ChevronDown size={16} />
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: 260,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-stroke)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-medium)',
          overflow: 'hidden',
          zIndex: 30
        }}>
          {flows.map((flow) => (
            <button
              key={flow.id}
              className="nav-link"
              onClick={() => selectFlow(flow.id)}
              style={{ borderRadius: 0, borderBottom: '1px solid var(--color-stroke)' }}
            >
              <Icon name={flow.icon} />
              <span style={{ flex: 1 }}>
                <strong style={{ display: 'block', fontSize: 13 }}>{flow.label}</strong>
                <span style={{ display: 'block', marginTop: 2, color: 'var(--color-on-surface-low)', fontSize: 11 }}>{flow.description}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
