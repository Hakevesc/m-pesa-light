import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { ThemeToggle } from '@/components/ThemeToggle';
import { components, flows, screens } from '@/lib/registry';
import { Icon } from '@/components/Icon';

const cards = [
  { title: 'Design System', href: '/design-system', description: 'Colors, typography, icons, avatars, images, effects and editable token foundations.', icon: 'layout' },
  { title: 'Presentation', href: '/presentation', description: 'Phone preview, screen registry, flow chooser, export dropdown and scenario runner.', icon: 'smartphone' },
  { title: 'Component Library', href: '/component-library', description: 'Reusable component documentation with props, variants, states and token dependencies.', icon: 'layout' }
];

export default function HomePage() {
  return (
    <AppShell
      title="M-PESA Smart UI Designer"
      subtitle="Next.js design system foundation for gradual migration"
      actions={<ThemeToggle />}
    >
      <div className="grid cols-3" style={{ marginBottom: 24 }}>
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="card section-card" style={{ display: 'block' }}>
            <div className="brand-mark" style={{ marginBottom: 16 }}><Icon name={card.icon} size={22} /></div>
            <h2 style={{ margin: 0, fontSize: 20 }}>{card.title}</h2>
            <p style={{ color: 'var(--color-on-surface-low)', lineHeight: 1.6 }}>{card.description}</p>
          </Link>
        ))}
      </div>

      <div className="grid cols-3">
        <section className="card section-card">
          <div className="section-heading">
            <h2>Registered Screens</h2>
            <p>{screens.length} screens indexed from the current HTML project.</p>
          </div>
          <div className="grid">
            {screens.slice(0, 8).map((screen) => (
              <a key={screen.id} href={screen.path} className="nav-link">
                <Icon name={screen.icon} />
                <span>{screen.title}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="card section-card">
          <div className="section-heading">
            <h2>Registered Flows</h2>
            <p>{flows.length} flows mapped to first-screen navigation.</p>
          </div>
          <div className="grid">
            {flows.map((flow) => (
              <a key={flow.id} href={`/presentation?screen=${flow.firstScreenId}`} className="nav-link">
                <Icon name={flow.icon} />
                <span>{flow.label}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="card section-card">
          <div className="section-heading">
            <h2>Component Coverage</h2>
            <p>{components.length} components documented for Next.js implementation.</p>
          </div>
          <div className="grid cols-2">
            {components.slice(0, 10).map((component) => (
              <div key={component.id} className="token-swatch">
                <strong>{component.name}</strong>
                <span className="token-value">{component.category}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
