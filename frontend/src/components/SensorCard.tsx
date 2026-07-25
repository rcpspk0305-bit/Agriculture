import LiveChart from "./LiveChart";

type Props = {
  label: string;
  value: string;
  unit?: string;
  hint: string;
  series?: number[];
};

export default function SensorCard({ label, value, unit, hint, series = [10, 20, 15, 25, 22, 30] }: Props) {
  return (
    <article className="kpi glass" style={{ padding: "20px", display: "grid", gap: 12 }}>
      <div className="between">
        <p style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>{label}</p>
        <span className="badge" style={{ fontSize: 10 }}>{hint}</span>
      </div>
      <div className="between" style={{ alignItems: "flex-end" }}>
        <h4 style={{ fontSize: 32, margin: 0 }}>{value}<span style={{ fontSize: 16, color: "var(--muted)", marginLeft: 4 }}>{unit}</span></h4>
        <div style={{ width: 60, height: 30 }}>
           <LiveChart data={series} />
        </div>
      </div>
    </article>
  );
}
