import Link from 'next/link';

import styles from '@/styles/app.module.css';

export const Cards = () => {
  return (
    <div className={styles.grid}>
      <Link href="/document-archival" className={styles.card} rel="noopener noreferrer">
        <h2>
          Document Archival
        </h2>
        <p>Secure, permanent document storage with blockchain verification.</p>
      </Link>
      <Link href="/knowledge-query" className={styles.card} rel="noopener noreferrer">
        <h2>
          Knowledge Query
        </h2>
        <p>RAG + KG: Get contextual answers to your questions.</p>
      </Link>
    </div>
  );
};
