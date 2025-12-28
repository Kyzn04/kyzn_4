import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { type Profile } from "@shared/schema";

interface StatRadarProps {
  stats: Profile;
}

export function StatRadar({ stats }: StatRadarProps) {
  const data = [
    { subject: 'INT', A: stats.intelligence, fullMark: 100 },
    { subject: 'STR', A: stats.strength, fullMark: 100 },
    { subject: 'CHA', A: stats.charisma, fullMark: 100 },
    { subject: 'SEN', A: stats.sense, fullMark: 100 },
    { subject: 'AGI', A: stats.agility, fullMark: 100 },
    { subject: 'VIT', A: stats.vitality, fullMark: 100 },
  ];

  return (
    <div className="w-full h-[300px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="var(--border)" strokeDasharray="3 3" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: 'var(--foreground)', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700 }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Stats"
            dataKey="A"
            stroke="var(--primary)"
            strokeWidth={3}
            fill="var(--primary)"
            fillOpacity={0.2}
          />
        </RadarChart>
      </ResponsiveContainer>
      
      {/* Decorative overlays */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex items-center justify-center">
        <div className="w-[140%] h-[1px] bg-primary/10 rotate-45 absolute" />
        <div className="w-[140%] h-[1px] bg-primary/10 -rotate-45 absolute" />
      </div>
    </div>
  );
}
