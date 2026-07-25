"use client";

import React from 'react';
import Link from 'next/link';
import { Home, LayoutDashboard, MessageSquare, Settings } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="glass" style={{ 
      position: 'fixed', 
      bottom: '24px', 
      left: '50%', 
      transform: 'translateX(-50%)', 
      display: 'flex', 
      gap: '8px', 
      padding: '8px',
      zIndex: 1000,
      backdropFilter: 'blur(20px)'
    }}>
      <NavItem href="/" icon={<Home size={20} />} label="Home" />
      <NavItem href="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
      <NavItem href="/chat" icon={<MessageSquare size={20} />} label="AI Chat" />
      <NavItem href="/settings" icon={<Settings size={20} />} label="Settings" />
    </nav>
  );
}

function NavItem({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  return (
    <Link href={href} style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px', 
      padding: '10px 16px', 
      borderRadius: '16px',
      color: 'var(--text)',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: 500,
      transition: 'all 0.2s ease'
    }} className="ghost">
      {icon}
      <span>{label}</span>
    </Link>
  );
}
