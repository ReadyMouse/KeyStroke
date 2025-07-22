import { useState } from 'react';
import styles from '@/styles/app.module.css';

export default function KnowledgeQueryPage() {
  const [knowledgeQuery, setKnowledgeQuery] = useState('');

  return (
    <div className={styles.container}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🧑‍💻</div>
        <h1>Knowledge Query</h1>
        <p style={{ fontSize: '1.2rem', color: 'rgba(var(--foreground-rgb), 0.7)', marginTop: '0.5rem' }}>
          RAG + KG: Contextual Answers
        </p>
      </div>

      {/* Knowledge Query Module */}
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
            Knowledge Query
          </h2>
          <p style={{ 
            fontSize: '1.3rem', 
            color: 'rgba(var(--foreground-rgb), 0.7)', 
            marginBottom: '2rem',
            fontWeight: '500'
          }}>
            RAG + KG: Contextual Answers
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
              Get intelligent, contextual answers using Retrieval-Augmented Generation (RAG) 
              and Knowledge Graphs (KG). Ask questions about your documents and get 
              accurate, relevant responses.
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            alignItems: 'center',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <textarea
              placeholder="Ask your question here... (e.g., 'What are the key points from my documents?')"
              value={knowledgeQuery}
              onChange={(e) => setKnowledgeQuery(e.target.value)}
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '1rem',
                border: '2px solid rgba(var(--card-border-rgb), 0.3)',
                borderRadius: '8px',
                fontSize: '1rem',
                resize: 'vertical',
                fontFamily: 'inherit',
                backgroundColor: 'rgba(var(--card-rgb), 0.05)',
                color: 'rgb(var(--foreground-rgb))',
                lineHeight: '1.5'
              }}
            />
            
            <button 
              onClick={() => {
                if (knowledgeQuery.trim()) {
                  alert('Knowledge query feature coming soon!');
                  setKnowledgeQuery('');
                } else {
                  alert('Please enter a question first.');
                }
              }}
              style={{
                backgroundColor: 'rgba(var(--card-rgb), 0.2)',
                color: 'rgb(var(--foreground-rgb))',
                border: '1px solid rgba(var(--card-border-rgb), 0.3)',
                borderRadius: '8px',
                padding: '1rem 2.5rem',
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
              Get Answer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 