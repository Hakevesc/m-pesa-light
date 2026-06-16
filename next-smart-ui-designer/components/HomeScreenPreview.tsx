import Image from 'next/image';
import { Bell, Eye, EyeOff, Plus } from 'lucide-react';
import { PhoneFrame } from './PhoneFrame';

const actions = [
  { label: 'Merchant\nPayment', src: '/assets/Merchant Payemnt.svg' },
  { label: 'Bill\nPayment', src: '/assets/Bill Payment.svg' },
  { label: 'Credit &\nSaving', src: '/assets/Credit Saving.svg' },
  { label: 'Transfer\nMoney', src: '/assets/Transfer Money.svg' },
  { label: 'Airtime/\nPackage', src: '/assets/Airtime Package.svg' },
  { label: 'More\nServices', src: '/assets/More Services.svg' }
];

const transactions = [
  { name: 'Aster Mequanent', type: 'Bank', amount: '+220.00', positive: true, logo: '/assets/banks logo/cbe-logo.png' },
  { name: 'Henok Chala', type: 'Airtime', amount: '-1,020.00', positive: false, logo: '/assets/banks logo/M-PESA-logo-icon.png' },
  { name: 'Henok Chala', type: 'Airtime', amount: '-50.00', positive: false, logo: '/assets/banks logo/M-PESA-logo-icon.png' }
];

export function HomeScreenPreview() {
  return (
    <PhoneFrame>
      <div style={{ padding: '0 16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-darker))', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 800 }}>AM</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Good Morning, Aster</div>
              <div style={{ fontSize: 12, color: 'var(--color-on-surface-low)' }}>Welcome back</div>
            </div>
          </div>
          <button className="icon-button"><Bell size={20} /></button>
        </div>

        <div style={{
          borderRadius: 24,
          padding: 18,
          background: 'linear-gradient(180deg, var(--color-primary-darker), var(--color-primary-dark))',
          color: 'white',
          boxShadow: 'var(--shadow-medium)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Main Balance</div>
              <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>* * * * *</div>
            </div>
            <button style={{ border: 0, borderRadius: 999, background: 'rgba(255,255,255,0.18)', color: 'white', padding: '8px 12px', display: 'flex', gap: 6, alignItems: 'center', fontWeight: 700 }}>
              <Plus size={16} /> Add
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>Reward</div>
              <div style={{ fontWeight: 700 }}>****</div>
            </div>
            <div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>Errif</div>
              <div style={{ fontWeight: 700 }}>****</div>
            </div>
            <button className="icon-button" style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.16)', color: 'white', border: 0 }}><EyeOff size={16} /></button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
          {actions.map((action) => (
            <button key={action.label} style={{ border: 0, borderRadius: 18, background: 'var(--color-surface)', padding: 12, boxShadow: 'var(--shadow-soft)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <Image src={action.src} alt="" width={40} height={40} />
              <span style={{ whiteSpace: 'pre-line', textAlign: 'center', fontSize: 11, fontWeight: 700, lineHeight: 1.25 }}>{action.label}</span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <strong>Transactions</strong>
            <span style={{ color: 'var(--color-primary)', fontSize: 12, fontWeight: 700 }}>See all</span>
          </div>
          {transactions.map((item) => (
            <div key={item.name + item.amount} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, background: 'var(--color-surface)', marginBottom: 8 }}>
              <Image src={item.logo} alt="" width={36} height={36} style={{ borderRadius: 10 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{item.name}</div>
                <div style={{ fontSize: 11, color: 'var(--color-on-surface-low)' }}>{item.type}</div>
              </div>
              <div style={{ textAlign: 'right', color: item.positive ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 800, fontSize: 13 }}>{item.amount}</div>
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}
