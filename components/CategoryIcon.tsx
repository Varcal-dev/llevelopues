const P: Record<string, React.ReactNode> = {
  gift: <><rect x="4" y="9" width="16" height="11" rx="1.5" /><path d="M12 9v11M4 13h16M12 9c-3-4-6-3-5 0M12 9c3-4 6-3 5 0" /></>,
  home: <><path d="M4 11l8-7 8 7" /><path d="M6 10v10h12V10" /><path d="M10 20v-6h4v6" /></>,
  dumbbell: <><path d="M6 8v8M3 10v4M18 8v8M21 10v4M6 12h12" /></>,
  phone: <><rect x="7" y="3" width="10" height="18" rx="2" /><path d="M11 18h2" /></>,
  shirt: <><path d="M8 4l-5 4 3 3 2-1v10h8V10l2 1 3-3-5-4c-1 2-5 2-8 0Z" /></>,
  bear: <><circle cx="12" cy="13" r="6" /><circle cx="7" cy="7" r="2" /><circle cx="17" cy="7" r="2" /><path d="M10 13h.01M14 13h.01M11 16h2" /></>,
};

export default function CategoryIcon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[name] ?? P.gift}
    </svg>
  );
}
