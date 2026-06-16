'use client';

import { useState } from 'react';
import { Beaker, X } from 'lucide-react';
import { scenarios } from '@/lib/registry';
import { Icon } from './Icon';

export function ScenarioRunner() {
  const [open, setOpen] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  const active = scenarios.find((scenario) => scenario.id === activeScenario);

  return (
    <>
      <button className="fab" onClick={() => setOpen(true)} aria-label="Open test scenarios">
        <Beaker size={22} />
      </button>

      {open && (
        <div className="scenario-panel">
          <div className="scenario-panel-header">
            <div>
              <h3>Test Scenarios</h3>
              <div style={{ marginTop: 2, fontSize: 12, color: 'var(--color-on-surface-low)' }}>Run UI state simulations</div>
            </div>
            <button className="icon-button" onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="scenario-list">
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                className="scenario-item"
                onClick={() => {
                  setActiveScenario(scenario.id);
                  setOpen(false);
                }}
              >
                <div className="scenario-icon">
                  <Icon name={scenario.type === 'toast' ? 'bell' : scenario.type === 'state' ? 'layout' : 'bell'} />
                </div>
                <div style={{ flex: 1 }}>
                  <strong>{scenario.name}</strong>
                  <span>{scenario.description}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {active && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--color-overlay)',
            zIndex: 80,
            display: 'grid',
            placeItems: 'center',
            padding: 24
          }}
          onClick={() => setActiveScenario(null)}
        >
          <div
            style={{
              width: 'min(360px, 100%)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-stroke)',
              borderRadius: '24px',
              padding: 24,
              boxShadow: 'var(--shadow-modal)',
              textAlign: 'center'
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              margin: '0 auto 16px',
              display: 'grid',
              placeItems: 'center',
              background: active.tone === 'success' ? '#E8F9EC' : active.tone === 'error' ? '#FFF1F2' : 'var(--color-primary-container)',
              color: active.tone === 'success' ? '#1FC83B' : active.tone === 'error' ? '#FE353D' : 'var(--color-primary-darker)'
            }}>
              <Icon name={active.type === 'state' ? 'layout' : 'bell'} size={28} />
            </div>
            <h2 style={{ margin: 0, fontSize: 20 }}>{active.name}</h2>
            <p style={{ margin: '10px 0 20px', color: 'var(--color-on-surface-low)', lineHeight: 1.5 }}>{active.description}</p>
            <button className="primary-button" style={{ width: '100%' }} onClick={() => setActiveScenario(null)}>
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
}
