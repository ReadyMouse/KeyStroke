import styles from '@/styles/app.module.css';

export default function DocumentArchivalPage() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🧑‍💻</div>
        <h1>Document Archival</h1>
        <p style={{ fontSize: '1.2rem', color: 'rgba(var(--foreground-rgb), 0.7)', marginTop: '0.5rem' }}>
          Secure, Permanent Storage on Autonomys
        </p>
      </div>

      {/* Document Archival Module */}
      <div style={{ 
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <div style={{
          backgroundColor: 'rgba(var(--card-rgb), 0.1)',
          border: '2px solid rgba(var(--card-border-rgb), 0.3)',
          borderRadius: '12px',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
          transition: 'transform 0.2s ease-in-out, border-color 0.2s ease-in-out'
        }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '1rem', 
            color: 'rgb(var(--foreground-rgb))',
            fontWeight: '600'
          }}>
            Document Archival
          </h2>
          <p style={{ 
            fontSize: '1.3rem', 
            color: 'rgba(var(--foreground-rgb), 0.7)', 
            marginBottom: '2rem',
            fontWeight: '500'
          }}>
            One-Time-Fee: Forever Storage on Autonomys
          </p>
          <div style={{
            backgroundColor: 'rgba(var(--callout-rgb), 0.5)',
            border: '1px solid rgba(var(--callout-border-rgb), 0.3)',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <p style={{ 
              fontSize: '1rem', 
              color: 'rgba(var(--foreground-rgb), 0.8)',
              margin: 0,
              lineHeight: '1.6'
            }}>
              Secure, permanent document storage with blockchain verification. 
              Your documents are stored on the decentralized Autonomys network 
              with cryptographic proof of ownership and integrity.
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            alignItems: 'center',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            <div style={{
              backgroundColor: 'rgba(var(--card-rgb), 0.05)',
              border: '2px dashed rgba(var(--card-border-rgb), 0.3)',
              borderRadius: '8px',
              padding: '2rem',
              width: '100%',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'rgba(var(--card-border-rgb), 0.5)';
              e.target.style.backgroundColor = 'rgba(var(--card-rgb), 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'rgba(var(--card-border-rgb), 0.3)';
              e.target.style.backgroundColor = 'rgba(var(--card-rgb), 0.05)';
            }}
            >
              <p style={{ 
                fontSize: '1.1rem', 
                color: 'rgba(var(--foreground-rgb), 0.7)',
                margin: 0
              }}>
                📁 Drop files here or click to upload
              </p>
              <p style={{ 
                fontSize: '0.9rem', 
                color: 'rgba(var(--foreground-rgb), 0.5)',
                margin: '0.5rem 0 0 0'
              }}>
                Supported: PDF, DOC, TXT, Images, and more
              </p>
            </div>
            
            <button 
              onClick={() => alert('Document archival feature coming soon!')}
              style={{
                backgroundColor: 'rgba(var(--card-rgb), 0.2)',
                color: 'rgb(var(--foreground-rgb))',
                border: '1px solid rgba(var(--card-border-rgb), 0.3)',
                borderRadius: '8px',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(var(--card-rgb), 0.3)';
                e.target.style.borderColor = 'rgba(var(--card-border-rgb), 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(var(--card-rgb), 0.2)';
                e.target.style.borderColor = 'rgba(var(--card-border-rgb), 0.3)';
              }}
            >
              Archive Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 