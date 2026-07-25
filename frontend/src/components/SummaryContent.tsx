type Props = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export default function SummaryContent({ title, description, children }: Props) {
  return (
    <section className="content-card glass" style={{ display: "grid", gap: 24, padding: "32px" }}>
      <div>
        <h2 className="title-md">{title} Analysis</h2>
        <p className="muted">{description}</p>
      </div>
      {children}
    </section>
  );
}
