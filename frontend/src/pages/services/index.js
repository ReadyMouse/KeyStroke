import { useState } from 'react';
import styles from '@/styles/app.module.css';

export default function ServicesPage() {
  const [knowledgeQuery, setKnowledgeQuery] = useState('');

  return (
    <div className={styles.container}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😏</div>
        <h1>Smirking Face Services</h1>
        <p style={{ fontSize: '1.2rem', color: 'rgba(var(--foreground-rgb), 0.7)', marginTop: '0.5rem' }}>
          Advanced AI Services on Blockchain
        </p>
      </div>

      {/* Document Archival and Knowledge Query Modules */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '2rem', 
        marginBottom: '3rem',
        maxWidth: '1200px',
        margin: '0 auto 3rem auto'
      }}>
        {/* Document Archival Module */}
        <div style={{
          backgroundColor: 'rgba(var(--card-rgb), 0.1)',
          border: '2px solid rgba(var(--card-border-rgb), 0.3)',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
          transition: 'transform 0.2s ease-in-out, border-color 0.2s ease-in-out',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.borderColor = 'rgba(var(--card-border-rgb), 0.5)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.borderColor = 'rgba(var(--card-border-rgb), 0.3)';
        }}
        >
          <h2 style={{ 
            fontSize: '1.8rem', 
            marginBottom: '0.5rem', 
            color: 'rgb(var(--foreground-rgb))',
            fontWeight: '600'
          }}>
            Document Archival
          </h2>
          <p style={{ 
            fontSize: '1.1rem', 
            color: 'rgba(var(--foreground-rgb), 0.7)', 
            marginBottom: '1.5rem',
            fontWeight: '500'
          }}>
            One-Time-Fee: Forever Storage on Autonomys
          </p>
          <div style={{
            backgroundColor: 'rgba(var(--callout-rgb), 0.5)',
            border: '1px solid rgba(var(--callout-border-rgb), 0.3)',
            borderRadius: '8px',
            padding: '1rem',
            marginTop: '1rem'
          }}>
            <p style={{ 
              fontSize: '0.9rem', 
              color: 'rgba(var(--foreground-rgb), 0.8)',
              margin: 0
            }}>
              Secure, permanent document storage with blockchain verification
            </p>
          </div>
        </div>

        {/* Knowledge Query Module */}
        <div style={{
          backgroundColor: 'rgba(var(--card-rgb), 0.1)',
          border: '2px solid rgba(var(--card-border-rgb), 0.3)',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
          transition: 'transform 0.2s ease-in-out, border-color 0.2s ease-in-out'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.borderColor = 'rgba(var(--card-border-rgb), 0.5)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.borderColor = 'rgba(var(--card-border-rgb), 0.3)';
        }}
        >
          <h2 style={{ 
            fontSize: '1.8rem', 
            marginBottom: '0.5rem', 
            color: 'rgb(var(--foreground-rgb))',
            fontWeight: '600'
          }}>
            Knowledge Query
          </h2>
          <p style={{ 
            fontSize: '1.1rem', 
            color: 'rgba(var(--foreground-rgb), 0.7)', 
            marginBottom: '1.5rem',
            fontWeight: '500'
          }}>
            RAG + KG: Contextual Answers
          </p>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            alignItems: 'center'
          }}>
            <textarea
              placeholder="Ask your question here..."
              value={knowledgeQuery}
              onChange={(e) => setKnowledgeQuery(e.target.value)}
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '0.75rem',
                border: '2px solid rgba(var(--card-border-rgb), 0.3)',
                borderRadius: '8px',
                fontSize: '0.9rem',
                resize: 'vertical',
                fontFamily: 'inherit',
                backgroundColor: 'rgba(var(--card-rgb), 0.05)',
                color: 'rgb(var(--foreground-rgb))'
              }}
            />
            <button 
              onClick={() => {
                if (knowledgeQuery.trim()) {
                  alert('Knowledge query feature coming soon!');
                  setKnowledgeQuery('');
                }
              }}
              style={{
                backgroundColor: 'rgba(var(--card-rgb), 0.2)',
                color: 'rgb(var(--foreground-rgb))',
                border: '1px solid rgba(var(--card-border-rgb), 0.3)',
                borderRadius: '8px',
                padding: '0.75rem 2rem',
                fontSize: '1rem',
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
              Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 