export default function DonutChart({ data, size = 150, thickness = 18 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offsetAccum = 0;

  return (
    <div className="donut-chart-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          style={{ stroke: "var(--border-color)" }}
          strokeWidth={thickness}
        />
        {total > 0 &&
          data.map((d, i) => {
            if (!d.value) return null;
            const fraction = d.value / total;
            const dash = fraction * circumference;
            const gap = circumference - dash;
            const rotation = (offsetAccum / total) * 360 - 90;
            offsetAccum += d.value;
            return (
              <circle
                key={d.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                style={{ stroke: d.color, transition: "stroke-dasharray 0.4s ease" }}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${gap}`}
                transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
              />
            );
          })}
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="donut-chart-total">
          {total}
        </text>
      </svg>
      <div className="donut-chart-legend">
        {data.map((d) => (
          <div className="donut-chart-legend-item" key={d.label}>
            <span className="donut-chart-dot" style={{ background: d.color }} />
            <span className="donut-chart-legend-label">{d.label}</span>
            <span className="donut-chart-legend-value">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
