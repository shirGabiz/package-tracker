import { useState } from 'react';
import { useAuth } from './useAuth';

export function LoginPage() {
  const { signInWithGoogle, signInWithFacebook, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      setError('Failed to sign in with Google');
      console.error(err);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      setError(null);
      await signInWithFacebook();
    } catch (err) {
      setError('Failed to sign in with Facebook');
      console.error(err);
    }
  };

  return (
    <main
      style={{
        fontFamily: 'system-ui, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        margin: 0,
        padding: 0,
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '3rem',
          borderRadius: 12,
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          textAlign: 'center',
          maxWidth: 400,
        }}
      >
        <h1 style={{ margin: '0 0 0.5rem', color: '#333' }}>Package Tracker</h1>
        <p style={{ margin: '0 0 2rem', color: '#666' }}>Track all your deliveries in one place</p>

        {error && <div style={{ color: '#d32f2f', marginBottom: '1rem', fontSize: '0.9rem' }}>⚠️ {error}</div>}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            marginBottom: '0.75rem',
            fontSize: '1rem',
            border: '1px solid #ddd',
            borderRadius: 6,
            background: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            if (!loading) e.currentTarget.style.background = '#f5f5f5';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#fff';
          }}
        >
          {loading ? 'Signing in...' : '🔵 Sign in with Google'}
        </button>

        <button
          onClick={handleFacebookSignIn}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            border: '1px solid #ddd',
            borderRadius: 6,
            background: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => {
            if (!loading) e.currentTarget.style.background = '#f5f5f5';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#fff';
          }}
        >
          {loading ? 'Signing in...' : '🔵 Sign in with Facebook'}
        </button>
      </div>
    </main>
  );
}
