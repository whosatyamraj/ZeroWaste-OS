import {
  ResponsiveContainer,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  Legend,
} from 'recharts';

interface ChartProps {
  data: Record<string, unknown>[];
  height?: number;
  className?: string;
}

interface AreaChartProps extends ChartProps {
  dataKey: string;
  dataKey2?: string;
  color?: string;
  color2?: string;
  gradient?: boolean;
}

interface BarChartProps extends ChartProps {
  dataKey: string;
  dataKey2?: string;
  color?: string;
  color2?: string;
}

interface PieChartProps extends ChartProps {
  dataKey: string;
  nameKey: string;
  colors?: string[];
}

interface LineChartProps extends ChartProps {
  lines: { dataKey: string; color: string; name?: string }[];
}

const CHART_COLORS = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Record<string, unknown>[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-medium" style={{ color: entry.color as string }}>
          {entry.name as string}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : String(entry.value)}
        </p>
      ))}
    </div>
  );
};

export function AreaChartComponent({ data, height = 300, dataKey, dataKey2, color = '#10b981', color2 = '#06b6d4', gradient = true }: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
          {dataKey2 && (
            <linearGradient id={`gradient-${dataKey2}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color2} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color2} stopOpacity={0} />
            </linearGradient>
          )}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={gradient ? `url(#gradient-${dataKey})` : color}
          fillOpacity={gradient ? 1 : 0.1}
        />
        {dataKey2 && (
          <Area
            type="monotone"
            dataKey={dataKey2}
            stroke={color2}
            strokeWidth={2}
            fill={gradient ? `url(#gradient-${dataKey2})` : color2}
            fillOpacity={gradient ? 1 : 0.1}
          />
        )}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}

export function BarChartComponent({ data, height = 300, dataKey, dataKey2, color = '#10b981', color2 = '#06b6d4' }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
        {dataKey2 && <Bar dataKey={dataKey2} fill={color2} radius={[4, 4, 0, 0]} />}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

export function PieChartComponent({ data, height = 300, dataKey, nameKey, colors = CHART_COLORS }: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Tooltip content={<CustomTooltip />} />
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={4}
          dataKey={dataKey}
          nameKey={nameKey}
          strokeWidth={0}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Legend iconType="circle" iconSize={8} formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>} />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}

export function LineChartComponent({ data, height = 300, lines }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={8} formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>} />
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            name={line.name || line.dataKey}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
