'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { Bell, Download, Home, Layers, ListFilter, Search, Smartphone } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { FlowChooser } from '@/components/FlowChooser';
import { ScenarioRunner } from '@/components/ScenarioRunner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { HomeScreenPreview } from '@/components/HomeScreenPreview';
import { PhoneFrame } from '@/components/PhoneFrame';
import { flows, getScreenById, groupScreensByGroup, scenarios } from '@/lib/registry';
import { Icon } from '@/components/Icon';

function GenericScreenPreview({ title, group }: { title: string; group: string }) {
  return (
    <PhoneFrame>
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button className="icon-button"><Icon name="arrow-left" size={20} /></button>
          <strong style={{ fontSize: 18 }}>{title}</strong>
        </div>
        <div style={{
          borderRadius: 24,
          padding: 24,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-stroke)',
          boxShadow: 'var(--shadow-soft)'
        }}>
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{group}</div>
          <p style={{ color: 'var(--color-on-surface-low)', lineHeight: 1.6 }}>
            This screen is registered in the Smart UI Designer and is ready to be migrated from the legacy HTML source.
          </p>
          <button className="primary-button" style={{ marginTop: 20 }}>Continue</button>
        </div>
      </div>
    </PhoneFrame>
  );
}

export default function PresentationPage() {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('screen') ?? 'lehulum-home';
  const view = searchParams.get('view');
  const selectedScreen = getScreenById(selectedId);
  const groupedScreens = useMemo(() => groupScreensByGroup(), []);

  function renderPreview() {
    if (selectedScreen.id === 'lehulum-home') return <HomeScreenPreview />;
    return <GenericScreenPreview title={selectedScreen.title} group={selectedScreen.group} />;
  }

  return (
    <AppShell
      title="Presentation"
      subtitle="Phone preview, sidebar screen links, flow chooser, export and scenario testing"
      actions={
        <div className="topbar-actions">
          <div className="icon-button"><Search size={18} /></div>
          <FlowChooser />
          <ThemeToggle />
          <button className="icon-button"><Download size={18} /></button>
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 280px', gap: 20, alignItems: 'start' }}>
        <section className="card section-card">
          <div className="section-heading">
            <h2>Screens</h2>
            <p>Current screen registry.</p>
          </div>
          {Object.entries(groupedScreens).map(([group, items]) => (
            <div key={group}>
              <div className="nav-section-label">{group}</div>
              {items.map((screen) => (
                <a
                  key={screen.id}
                  href={screen.path}
                  className={`nav-link ${screen.id === selectedScreen.id ? 'active' : ''}`}
                >
                  <Icon name={screen.icon} />
                  <span>{screen.title}</span>
                </a>
              ))}
            </div>
          ))}
        </section>

        <div className="phone-preview-wrap">
          {renderPreview()}
        </div>

        <section className="card section-card">
          <div className="section-heading">
            <h2>Flows and Scenarios</h2>
            <p>Choose a flow or run a scenario.</p>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div className="nav-section-label">Flows</div>
            {flows.map((flow) => (
              <a key={flow.id} href={getScreenById(flow.firstScreenId).path} className="nav-link">
                <Icon name={flow.icon} />
                <span>{flow.label}</span>
              </a>
            ))}
          </div>

          <div>
            <div className="nav-section-label">Scenario Library</div>
            {scenarios.slice(0, 8).map((scenario) => (
              <div key={scenario.id} className="scenario-item" style={{ padding: 10 }}>
                <div className="scenario-icon"><Icon name={scenario.type === 'state' ? 'layout' : 'bell'} size={18} /></div>
                <div>
                  <strong>{scenario.name}</strong>
                  <span>{scenario.description}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <ScenarioRunner />
    </AppShell>
  );
}
