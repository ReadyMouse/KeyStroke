import { Cards } from '@/components/cards';
import { useState } from 'react';
import styles from '@/styles/app.module.css';

export default function Home() {
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqs = [
    {
      question: "Why is Autonomys better than say Filecoin, IPFS or Storj?",
      answer: "Filecoin and others require on-going storage fees. Autonomys require a single payment that covers processing the document for blockchain storage. Once stored, its stored forever. No on-going fees."
    },
    {
      question: "Have other questions?",
      answer: "We'd love to hear from you! Please visit our GitHub repository to submit questions, report issues, or contribute to the project. You can create an issue or start a discussion there."
    }
  ];

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };
  return (
    <main style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      padding: '2rem',
      minHeight: '100vh'
    }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center',
        gap: '1rem',
        marginBottom: '3rem'
      }}>
        <div style={{ fontSize: '8rem' }}>🧑‍💻</div>
        <h1 style={{ margin: 0 }}>KeyStroke</h1>
        <p style={{ fontSize: '1.2rem', color: 'rgba(var(--foreground-rgb), 0.7)', margin: 0 }}>
          Connected, Contextual Answers at each KeyStroke
        </p>
        <p style={{ fontSize: '1rem', color: 'rgba(var(--foreground-rgb), 0.6)', margin: 0 }}>
          A third-party Auto Drive interface
        </p>
      </div>
      
      <Cards />
      
      {/* FAQ Section */}
      <div style={{ 
        maxWidth: '800px', 
        width: '100%', 
        marginTop: '4rem',
        marginBottom: '2rem'
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: '2rem',
          fontSize: '2rem',
          color: 'rgb(var(--foreground-rgb))'
        }}>
          Frequently Asked Questions
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, index) => (
            <div key={index} style={{
              backgroundColor: 'rgba(var(--card-rgb), 0.1)',
              border: '1px solid rgba(var(--card-border-rgb), 0.3)',
              borderRadius: '8px',
              overflow: 'hidden',
              transition: 'all 0.2s ease-in-out'
            }}>
              <button
                onClick={() => toggleFAQ(index)}
                style={{
                  width: '100%',
                  padding: '1.5rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: 'rgb(var(--foreground-rgb))',
                  fontSize: '1.1rem',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(var(--card-rgb), 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <span>{faq.question}</span>
                <span style={{ 
                  fontSize: '1.5rem', 
                  transition: 'transform 0.2s ease-in-out',
                  transform: expandedFAQ === index ? 'rotate(45deg)' : 'rotate(0deg)'
                }}>
                  {expandedFAQ === index ? '−' : '+'}
                </span>
              </button>
              
              {expandedFAQ === index && (
                <div style={{
                  padding: '0 1.5rem 1.5rem 1.5rem',
                  borderTop: '1px solid rgba(var(--card-border-rgb), 0.2)',
                  backgroundColor: 'rgba(var(--callout-rgb), 0.3)'
                }}>
                  <p style={{ 
                    margin: 0, 
                    lineHeight: '1.6',
                    color: 'rgba(var(--foreground-rgb), 0.8)'
                  }}>
                    {index === 1 ? (
                      <>
                        We'd love to hear from you! Please visit our{' '}
                        <a 
                          href="https://github.com/ReadyMouse/smirking-face" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            color: 'rgba(var(--foreground-rgb), 0.9)',
                            textDecoration: 'underline',
                            fontWeight: '500'
                          }}
                        >
                          GitHub repository
                        </a>
                        {' '}to submit questions, report issues, or contribute to the project. You can create an issue or start a discussion there.
                      </>
                    ) : (
                      faq.answer
                    )}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
