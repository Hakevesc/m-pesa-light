import { GetServerSideProps } from 'next';
import { AppShell } from '@/components/AppShell';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PhoneFrame } from '@/components/PhoneFrame';
import { getFlowById, getScreenById } from '@/lib/registry';
import { Icon } from '@/components/Icon';

export default function FlowScreenPage({ flowId, screenId }: { flowId: string; screenId: string }) {
  const flow = getFlowById(flowId);
  const screen = getScreenById(screenId);

  return (
    <AppShell
      title={flow.label}
      subtitle={`${flow.screens.length} screens · current: ${screen.title}`}
      actions={<ThemeToggle />}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
        <section className="card section-card">
          <div className="section-heading">
            <h2>Flow Steps</h2>
            <p>{flow.description}</p>
          </div>
          {flow.screens.map((id, index) => {
            const item = getScreenById(id);
            return (
              <a key={id} href={`/flows/${flow.id}/${id}`} className={`nav-link ${id === screen.id ? 'active' : ''}`}>
                <Icon name={item.icon} />
                <span style={{ flex: 1 }}>{index + 1}. {item.title}</span>
              </a>
            );
          })}
        </section>

        <div className="phone-preview-wrap">
          <PhoneFrame>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <button className="icon-button"><Icon name="arrow-left" /></button>
                <strong style={{ fontSize: 18 }}>{screen.title}</strong>
              </div>
              <div style={{
                borderRadius: 24,
                padding: 24,
                background: 'var(--color-surface)',
                border: '1px solid var(--color-stroke)',
                boxShadow: 'var(--shadow-soft)'
              }}>
                <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{flow.label}</div>
                <p style={{ color: 'var(--color-on-surface-low)', lineHeight: 1.6 }}>
                  Step {flow.screens.indexOf(screen.id) + 1} of {flow.screens.length}. This placeholder is ready for the migrated screen component.
                </p>
                <button className="primary-button" style={{ marginTop: 20 }}>Continue</button>
              </div>
            </div>
          </PhoneFrame>
        </div>
      </div>
    </AppShell>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const flowId = String(context.params?.flowId ?? 'send-money');
  const screenId = String(context.params?.screenId ?? getFlowById(flowId).firstScreenId);

  return {
    props: { flowId, screenId }
  };
};
