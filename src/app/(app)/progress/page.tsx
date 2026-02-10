"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Trophy,
  Flame,
  Dumbbell,
  Calendar,
  Weight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Stats {
  totalWorkouts: number;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  currentStreak: number;
  longestStreak: number;
  volumeThisWeek: number;
}

interface VolumePoint {
  date: string;
  volume: number;
}

interface PR {
  exerciseId: string;
  exerciseName: string;
  maxWeight: number;
  maxWeightReps: number;
  maxWeightDate: string;
  estimated1RM: number;
}

export default function ProgressPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [volume, setVolume] = useState<VolumePoint[]>([]);
  const [prs, setPrs] = useState<PR[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats").then((r) => r.json()),
      fetch("/api/stats/volume?period=weekly").then((r) => r.json()),
      fetch("/api/stats/prs").then((r) => r.json()),
    ])
      .then(([s, v, p]) => {
        if (s && !s.error) setStats(s);
        if (Array.isArray(v)) setVolume(v);
        if (Array.isArray(p)) setPrs(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Progress</h1>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  const formatVolume = (v: number) =>
    v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toString();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Progress</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4 text-primary" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Streak
              </span>
            </div>
            <p className="text-2xl font-bold">{stats?.currentStreak || 0}</p>
            <p className="text-[10px] text-muted-foreground">
              days · best {stats?.longestStreak || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                This Week
              </span>
            </div>
            <p className="text-2xl font-bold">{stats?.workoutsThisWeek || 0}</p>
            <p className="text-[10px] text-muted-foreground">
              workouts · {stats?.workoutsThisMonth || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-3">
            <div className="flex items-center gap-2 mb-1">
              <Dumbbell className="h-4 w-4 text-primary" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Total
              </span>
            </div>
            <p className="text-2xl font-bold">{stats?.totalWorkouts || 0}</p>
            <p className="text-[10px] text-muted-foreground">workouts logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-3">
            <div className="flex items-center gap-2 mb-1">
              <Weight className="h-4 w-4 text-primary" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Volume
              </span>
            </div>
            <p className="text-2xl font-bold">
              {formatVolume(stats?.volumeThisWeek || 0)}
            </p>
            <p className="text-[10px] text-muted-foreground">kg this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Volume chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Weekly Volume
          </CardTitle>
        </CardHeader>
        <CardContent>
          {volume.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No volume data yet. Complete some workouts to see trends.
            </div>
          ) : (
            <div className="h-48 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volume}>
                  <defs>
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => {
                      const date = new Date(d);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                    }}
                    labelFormatter={(d) => `Week of ${d}`}
                    formatter={(v) => [`${Number(v).toLocaleString()} kg`, "Volume"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#volumeGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PR table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            Personal Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {prs.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No PRs yet. Complete some workouts to track your progress.
            </div>
          ) : (
            <div className="space-y-0">
              {/* Header */}
              <div className="grid grid-cols-[1fr_4rem_3.5rem_4rem] gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-1 py-1.5 border-b">
                <span>Exercise</span>
                <span className="text-right">Weight</span>
                <span className="text-right">Reps</span>
                <span className="text-right">Est 1RM</span>
              </div>
              {prs.slice(0, 15).map((pr) => (
                <div
                  key={pr.exerciseId}
                  className="grid grid-cols-[1fr_4rem_3.5rem_4rem] gap-2 text-sm px-1 py-2 border-b last:border-0"
                >
                  <span className="font-medium truncate">{pr.exerciseName}</span>
                  <span className="text-right text-muted-foreground">
                    {pr.maxWeight} kg
                  </span>
                  <span className="text-right text-muted-foreground">
                    {pr.maxWeightReps}
                  </span>
                  <span className="text-right font-semibold text-primary">
                    {pr.estimated1RM}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
