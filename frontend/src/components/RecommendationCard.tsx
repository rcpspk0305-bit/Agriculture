import React from 'react';

type Props = {
  title: string;
  items: string[];
  footer?: string;
};

export default function RecommendationCard({ title, items, footer }: Props) {
  return (
    <article className="panel-card glass" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 className="title-sm" style={{ margin: 0 }}>{title}</h3>
      <ul className="list" style={{ margin: 0, padding: 0 }}>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      {footer && (
        <div style={{ 
          marginTop: 'auto', 
          paddingTop: '16px', 
          borderTop: '1px solid var(--border)', 
          fontSize: '12px', 
          color: 'var(--muted)', 
          fontWeight: 600,
          letterSpacing: '0.02em'
        }}>
          {footer}
        </div>
      )}
    </article>
  );
}
