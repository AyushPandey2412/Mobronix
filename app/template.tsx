/** Per-navigation enter transition (App Router remounts templates on route change).
 *  CSS-only fade so navigations feel instant — no animation runtime. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-m-fade">{children}</div>;
}
