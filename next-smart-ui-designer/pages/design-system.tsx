import { AppShell } from '@/components/AppShell';
import { ThemeToggle } from '@/components/ThemeToggle';
import { designTokens, downloadJson, themes } from '@/lib/registry';

const colorGroups = [
  { label: 'Brand', keys: ['primary', 'primaryDark', 'primaryDarker', 'primaryContainer', 'onPrimary'] },
  { label: 'Surface', keys: ['surface', 'surfaceContainer', 'background', 'onBackground', 'onSurface', 'onSurfaceLow'] },
  { label: 'Feedback', keys: ['success', 'warning', 'error', 'info'] },
  { label: 'Utility', keys: ['stroke', 'overlay'] }
];

export default function DesignSystemPage() {
  return (
    <AppShell
      title="Design System"
      subtitle="Colors, typography, icons, avatars, images, effects and tokens"
      actions={<ThemeToggle />}
    >
      <div className="grid">
        <section className="card section-card">
          <div className="section-heading">
            <h2>Theme Tokens</h2>
            <p>Light and dark theme color definitions used by the Smart UI Designer.</p>
          </div>
          <div className="grid cols-2">
            {Object.values(themes).map((theme) => (
              <div key={theme.id} className="token-swatch">
                <div className="swatch-preview" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDarker})` }} />
                <strong>{theme.label} Theme</strong>
                <span className="token-value">{theme.id}</span>
                <button className="secondary-button" onClick={() => downloadJson(`mpesa-${theme.id}-colors.json`, theme.colors)}>
                  Export colors
                </button>
              </div>
            ))}
          </div>
        </section>

        {colorGroups.map((group) => (
          <section key={group.label} className="card section-card">
            <div className="section-heading">
              <h2>{group.label} Colors</h2>
              <p>Copy-ready semantic color tokens.</p>
            </div>
            <div className="grid cols-4">
              {group.keys.map((key) => {
                const value = themes.light.colors[key];
                return (
                  <div key={key} className="token-swatch">
                    <div className="swatch-preview" style={{ background: value }} />
                    <div className="token-name">{key}</div>
                    <div className="token-value">{value}</div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <section className="card section-card">
          <div className="section-heading">
            <h2>Typography System</h2>
            <p>Heading, body, caption and label styles.</p>
          </div>
          <div className="grid cols-2">
            {Object.entries(designTokens.typography).map(([name, token]) => (
              <div key={name} className="token-swatch">
                <div style={{
                  fontSize: token.fontSize,
                  lineHeight: token.lineHeight,
                  fontWeight: token.fontWeight,
                  letterSpacing: token.letterSpacing,
                  textTransform: token.textTransform
                }}>
                  {name} sample text
                </div>
                <div className="token-value">{token.fontSize} / {token.lineHeight} / {token.fontWeight}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="card section-card">
          <div className="section-heading">
            <h2>Spacing, Radius, Shadow, Blur and Stroke</h2>
            <p>Foundation values used by buttons, cards, modals and overlays.</p>
          </div>
          <div className="grid cols-3">
            {Object.entries(designTokens.spacing).map(([name, value]) => (
              <div key={name} className="token-swatch">
                <div className="token-name">spacing.{name}</div>
                <div className="token-value">{value}</div>
              </div>
            ))}
            {Object.entries(designTokens.radius).map(([name, value]) => (
              <div key={name} className="token-swatch">
                <div className="token-name">radius.{name}</div>
                <div className="token-value">{value}</div>
              </div>
            ))}
            {Object.entries(designTokens.shadow).map(([name, value]) => (
              <div key={name} className="token-swatch">
                <div className="token-name">shadow.{name}</div>
                <div className="token-value">{value}</div>
              </div>
            ))}
            {Object.entries(designTokens.blur).map(([name, value]) => (
              <div key={name} className="token-swatch">
                <div className="token-name">blur.{name}</div>
                <div className="token-value">{value}</div>
              </div>
            ))}
            {Object.entries(designTokens.stroke).map(([name, value]) => (
              <div key={name} className="token-swatch">
                <div className="token-name">stroke.{name}</div>
                <div className="token-value">{value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="card section-card">
          <div className="section-heading">
            <h2>Icons, Avatars, Images and Logos</h2>
            <p>Reusable media and icon system placeholders.</p>
          </div>
          <div className="grid cols-4">
            <div className="token-swatch">
              <div className="swatch-preview" style={{ display: 'grid', placeItems: 'center', background: 'var(--color-primary-container)', color: 'var(--color-primary-darker)' }}>M</div>
              <div className="token-name">M-PESA Logo</div>
              <div className="token-value">assets/M-PESA-red-logo.svg</div>
            </div>
            <div className="token-swatch">
              <div className="swatch-preview" style={{ display: 'grid', placeItems: 'center', background: 'var(--color-surface-container)' }}>AM</div>
              <div className="token-name">Avatar Initials</div>
              <div className="token-value">radius.full / primary gradient</div>
            </div>
            <div className="token-swatch">
              <div className="swatch-preview" style={{ display: 'grid', placeItems: 'center', background: 'var(--color-surface-container)' }}>QR</div>
              <div className="token-name">QR Asset</div>
              <div className="token-value">assets/qr-scan.svg</div>
            </div>
            <div className="token-swatch">
              <div className="swatch-preview" style={{ display: 'grid', placeItems: 'center', background: 'var(--color-surface-container)' }}>Fayda</div>
              <div className="token-name">Fayda Logo</div>
              <div className="token-value">assets/fayda-logo-hq.png</div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
