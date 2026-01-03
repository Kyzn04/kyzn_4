import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';

interface StatRadarProps {
  stats: any;
  max?: number;
}

export function StatRadar({ stats, max = 500 }: StatRadarProps) {
  // Determine if this is Core or Kaizen based on keys
  const isKaizen = 'spi' in stats || 'wis' in stats;
  
  const data = isKaizen ? [
    { subject: 'STR', A: stats.str, fullMark: 100 },
    { subject: 'INT', A: stats.int, fullMark: 100 },
    { subject: 'SPI', A: stats.spi, fullMark: 100 },
    { subject: 'VIT', A: stats.vit, fullMark: 100 },
    { subject: 'WIS', A: stats.wis, fullMark: 100 },
    { subject: 'DIS', A: stats.dis, fullMark: 100 },
  ] : [
    { subject: 'STR', A: stats.str, fullMark: 500 },
    { subject: 'AGI', A: stats.agi, fullMark: 500 },
    { subject: 'VIT', A: stats.vit, fullMark: 500 },
    { subject: 'INT', A: stats.int, fullMark: 500 },
    { subject: 'SEN', A: stats.sen, fullMark: 500 },
    { subject: 'CHA', A: stats.cha, fullMark: 500 },
  ];

  const currentMax = isKaizen ? 100 : 500;

  return (
    <div className="w-full h-[300px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(0, 229, 255, 0.2)" strokeDasharray="3 3" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: 'rgba(0, 229, 255, 0.8)', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700 }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, currentMax]} tick={false} axisLine={false} />
          <Radar
            name="Stats"
            dataKey="A"
            stroke="rgba(0, 229, 255, 1)"
            strokeWidth={2}
            fill="rgba(0, 229, 255, 1)"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
      
      {/* Decorative hexagonal border overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-48 h-48 border border-cyan-500/10 rounded-full animate-pulse" />
      </div>
    </div>
  );
}
