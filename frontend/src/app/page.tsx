import Link from "next/link";
import { ArrowRight, Cpu, Landmark, Sprout, Waves } from "lucide-react";

const quickLinks = [
  {
    title: "Interactive Dashboard",
    href: "/login",
    desc: "Live telemetry, crop recommendations, smart alerts, and operator actions in one workspace.",
    icon: Cpu,
  },
  {
    title: "Scheme Finder",
    href: "/scheme-finder",
    desc: "Search farmer schemes by category, eligibility, and benefit type.",
    icon: Landmark,
  },
];

export default function HomePage() {
  return (
    <main className="section">
      <div className="page-shell" style={{ display: "grid", gap: 24 }}>
        <section className="hero-grid">
          <div className="hero-card glass">
            <span className="badge">
              <Sprout size={14} /> Agritech control center
            </span>
            <h1 className="title-xl">KrishiNidhi</h1>
            <p className="muted" style={{ maxWidth: 680, fontSize: 18 }}>
              A cleaner workflow for your frontend: one landing page, one dashboard route, one scheme finder route, and reusable components for metrics, charts, and recommendations.
            </p>
            <div className="row" style={{ marginTop: 18 }}>
              <Link href="/login" className="cta">Get started</Link>
              <Link href="/scheme-finder" className="ghost">Open schemes</Link>
            </div>
          </div>

          <div className="panel-card glass">
            <div className="between">
              <h2 className="title-lg">Workflow fit</h2>
              <Waves size={20} />
            </div>
            <ul className="list" style={{ marginTop: 14 }}>
              <li>App routes stay inside <strong>app</strong> for dashboard and scheme finder.</li>
              <li>Shared UI lives in <strong>components</strong> and avoids repeated metric pages.</li>
              <li>Reusable config and types stay inside <strong>lib</strong> and <strong>types</strong>.</li>
            </ul>
          </div>
        </section>

        <section className="scheme-grid">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="content-card glass" style={{ display: "grid", gap: 12 }}>
                <div className="between">
                  <div className="badge"><Icon size={14} /> Launch module</div>
                  <ArrowRight size={18} />
                </div>
                <h3 className="title-lg">{item.title}</h3>
                <p className="muted">{item.desc}</p>
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}