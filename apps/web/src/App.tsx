import { FormEvent, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { isDemoAuthMode } from './firebase';
import { LoginPage } from './LoginPage';
import { AuthProvider, useAuth } from './useAuth';

type PackageStatus = 'PENDING' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED';

interface PackageItem {
  id: string;
  title: string;
  trackingNumber: string;
  carrier: string;
  status: PackageStatus;
  source: 'MANUAL';
}

const initialPackages: PackageItem[] = [
  {
    id: 'pkg-1',
    title: 'Laptop Sleeve',
    trackingNumber: 'TRK-145782',
    carrier: 'DHL',
    status: 'IN_TRANSIT',
    source: 'MANUAL',
  },
];

export function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();
  const [packages, setPackages] = useState<PackageItem[]>(initialPackages);

  if (loading) {
    return (
      <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p>Loading...</p>
      </main>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<ListPage packages={packages} />} />
      <Route path="/add" element={<AddPage onAdd={(pkg) => setPackages((current) => [pkg, ...current])} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function ListPage({ packages }: { packages: PackageItem[] }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Package Tracker</h1>
          <p style={{ margin: '0.5rem 0 0', color: '#666' }}>Welcome, {user?.displayName || user?.email}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/add')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              background: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            + Add package
          </button>
          {!isDemoAuthMode ? (
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              style={{
                padding: '0.75rem 1rem',
                fontSize: '0.9rem',
                background: '#f0f0f0',
                color: '#333',
                border: 'none',
                borderRadius: 6,
                cursor: signingOut ? 'not-allowed' : 'pointer',
                opacity: signingOut ? 0.6 : 1,
              }}
            >
              {signingOut ? 'Signing out...' : 'Sign out'}
            </button>
          ) : null}
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {packages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
            <p>No packages yet. Click "Add package" to get started.</p>
          </div>
        ) : (
          packages.map((item) => (
            <article
              key={item.id}
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: 8,
                padding: '1.25rem',
                background: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'box-shadow 0.2s',
              }}
              onMouseOver={(event) => {
                event.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
              }}
              onMouseOut={(event) => {
                event.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '0.5rem' }}>{item.title}</strong>
                  <div style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6 }}>
                    {item.carrier ? <div>Carrier: {item.carrier}</div> : null}
                    {item.trackingNumber ? <div>Tracking: {item.trackingNumber}</div> : null}
                  </div>
                </div>
                <div
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 6,
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    background: getStatusColor(item.status),
                    color: '#fff',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.status.replaceAll('_', ' ')}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}

function AddPage({ onAdd }: { onAdd: (pkg: PackageItem) => void }) {
  const navigate = useNavigate();
  const [text, setText] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanText = text.trim();
    if (!cleanText) {
      return;
    }

    onAdd({
      id: `pkg-${Date.now()}`,
      title: cleanText,
      trackingNumber: '',
      carrier: '',
      status: 'PENDING',
      source: 'MANUAL',
    });
    navigate('/');
  };

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 600, margin: '0 auto' }}>
      <h1>Add a new package</h1>
      <p style={{ color: '#666' }}>Describe what you're expecting. You can add details later.</p>

      <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="E.g., MacBook Pro from Amazon, DHL express..."
          autoFocus
          required
          style={{
            width: '100%',
            minHeight: '150px',
            padding: '1rem',
            fontSize: '1rem',
            border: '1px solid #ddd',
            borderRadius: 8,
            fontFamily: 'inherit',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            type="submit"
            style={{
              flex: 1,
              padding: '0.75rem',
              fontSize: '1rem',
              background: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Save package
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              flex: 1,
              padding: '0.75rem',
              fontSize: '1rem',
              background: '#f0f0f0',
              color: '#333',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}

function getStatusColor(status: PackageStatus): string {
  const colors: Record<PackageStatus, string> = {
    PENDING: '#9e9e9e',
    IN_TRANSIT: '#2196f3',
    OUT_FOR_DELIVERY: '#ff9800',
    DELIVERED: '#4caf50',
  };

  return colors[status];
}
