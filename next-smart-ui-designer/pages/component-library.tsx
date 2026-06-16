'use client';

import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { ThemeToggle } from '@/components/ThemeToggle';
import { components } from '@/lib/registry';
import { Icon } from '@/components/Icon';

function ButtonPreview() {
  const [shape, setShape] = useState<'normal' | 'half' | 'circle'>('normal');
  const [loading, setLoading] = useState(false);

  const radius = shape === 'normal' ? 14 : shape === 'half' ? 999 : '50%';

  return (
    <div className="card section-card">
      <div className="section-heading">
        <h2>Button Playground</h2>
        <p>Live preview for button variants, shapes and states.</p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button className={shape === 'normal' ? 'primary-button' : 'secondary-button'} onClick={() => setShape('normal')}>Normal</button>
        <button className={shape === 'half' ? 'primary-button' : 'secondary-button'} onClick={() => setShape('half')}>Half Rectangle</button>
        <button className={shape === 'circle' ? 'primary-button' : 'secondary-button'} onClick={() => setShape('circle')}>Circle</button>
      </div>

      <div className="grid cols-3">
        <button className="primary-button" style={{ borderRadius: radius }} onClick={() => setLoading(true)}>
          {loading ? <Loader2 size={18} className="spin" /> : <Check size={18} />}
          Primary
        </button>
        <button className="secondary-button" style={{ borderRadius: radius }}>Secondary</button>
        <button className="secondary-button" style={{ borderRadius: radius, opacity: 0.5 }} disabled>Disabled</button>
        <button className="secondary-button" style={{ borderRadius: radius }}>Text Link</button>
        <button className="secondary-button" style={{ borderRadius: radius }}><Icon name="send" /> With Icon</button>
        <button className="icon-button" style={{ borderRadius: radius }}><Icon name="bell" /></button>
      </div>
    </div>
  );
}

export default function ComponentLibraryPage() {
  return (
    <AppShell
      title="Component Library"
      subtitle="Reusable components, variants, props, states and token dependencies"
      actions={<ThemeToggle />}
    >
      <div className="grid">
        <ButtonPreview />

        <section className="card section-card">
          <div className="section-heading">
            <h2>Component Catalog</h2>
            <p>{components.length} components documented for migration.</p>
          </div>

          <div className="grid cols-2">
            {components.map((component) => (
              <article key={component.id} className="card section-card" style={{ boxShadow: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                  <div>
                    <div className="pill">{component.category}</div>
                    <h3 style={{ margin: '12px 0 6px', fontSize: 18 }}>{component.name}</h3>
                    <p style={{ margin: 0, color: 'var(--color-on-surface-low)', lineHeight: 1.5 }}>{component.description}</p>
                  </div>
                </div>

                <div className="grid cols-2">
                  <div>
                    <strong style={{ fontSize: 12 }}>Props</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                      {component.props.map((prop) => <span key={prop} className="pill">{prop}</span>)}
                    </div>
                  </div>
                  <div>
                    <strong style={{ fontSize: 12 }}>States</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                      {component.states.map((state) => <span key={state} className="pill">{state}</span>)}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <strong style={{ fontSize: 12 }}>Variants</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {component.variants.map((variant) => <span key={variant} className="pill">{variant}</span>)}
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <strong style={{ fontSize: 12 }}>Token Dependencies</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {component.tokens.map((token) => <span key={token} className="pill">{token}</span>)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
