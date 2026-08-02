export interface NavItem { href: string; label: string; icon: string; desc: string; badge?: 'roles' | 'keys' | 'history' }

export const NAV: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: 'pulse', desc: 'System overview & agent status' },
  { href: '/roles', label: 'Agent Roles', icon: 'layers', desc: 'Configure provider & model per role', badge: 'roles' },
  { href: '/workflow', label: 'Workflow', icon: 'nodes', desc: 'Agent pipeline and connections' },
  { href: '/run', label: 'Runner', icon: 'play', desc: 'Run pipeline and inspect output' },
  { href: '/keys', label: 'API Keys', icon: 'key', desc: 'Your credentials, stored locally', badge: 'keys' },
  { href: '/history', label: 'History', icon: 'clock', desc: 'Previous pipeline executions', badge: 'history' },
  { href: '/settings', label: 'Settings', icon: 'sliders', desc: 'Theme, language, data & backup' },
];
