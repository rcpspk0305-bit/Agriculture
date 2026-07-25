"use client";

import React from 'react';

type Props = {
  data: number[];
  color?: string;
};

export default function LiveChart({ data, color = "var(--primary)" }: Props) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const width = 100;
  const height = 40;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg 
      viewBox={`0 0 ${width} ${height}`} 
      style={{ width: '100%', height: '100%', overflow: 'visible' }}
      preserveAspectRatio="none"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        style={{ filter: 'drop-shadow(0 0 4px var(--primary-glow))' }}
      />
    </svg>
  );
}
