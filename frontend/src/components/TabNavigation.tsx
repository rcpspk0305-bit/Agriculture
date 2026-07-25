import { LayoutDashboard, LucideIcon } from "lucide-react";

type SimpleTab = { id: string; label: string; hint: string; icon?: LucideIcon };

type Props = {
  activeTab: string;
  onChange: (tab: string) => void;
  summaryTabs: SimpleTab[];
  metricTabs: (SimpleTab & { valueKey: string })[];
};

export default function TabNavigation({
  activeTab,
  onChange,
  summaryTabs,
  metricTabs,
}: Props) {
  return (
    <section className="glass" style={{ padding: "16px", borderRadius: "32px", background: "rgba(255,255,255,0.03)" }}>
      <div className="tab-row" style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {/* Overview Tab */}
        <button 
          className={`nav-pill ${activeTab === "overview" ? "active" : ""}`} 
          onClick={() => onChange("overview")}
        >
          <LayoutDashboard size={18} />
          <span>Overview</span>
        </button>

        {/* Metric Tabs */}
        {metricTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button 
              key={tab.id} 
              className={`nav-pill ${activeTab === tab.id ? "active" : ""}`} 
              onClick={() => onChange(tab.id)}
            >
              {Icon && <Icon size={18} />}
              <span>{tab.label}</span>
            </button>
          );
        })}

        {/* Summary Tabs */}
        {summaryTabs.map((tab) => (
          <button 
            key={tab.id} 
            className={`nav-pill ${activeTab === tab.id ? "active" : ""}`} 
            onClick={() => onChange(tab.id)}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <style jsx>{`
        .nav-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          border-radius: 99px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: var(--muted);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 500;
          font-size: 14px;
        }
        .nav-pill:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          transform: translateY(-1px);
        }
        .nav-pill.active {
          background: var(--surface-high);
          border-color: var(--primary);
          color: white;
          box-shadow: 0 4px 20px rgba(0, 209, 102, 0.2);
        }
        .nav-pill span {
          white-space: nowrap;
        }
      `}</style>
    </section>
  );
}
