"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";
import { Smile } from "lucide-react";

export const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
    fetchWeeklyStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("bearer_token") || "demo_token";
      
      const response = await fetch("/api/dashboard/overview", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyStats = async () => {
    try {
      const endDate = new Date();
      
      // This is a mock calculation - in production, you'd aggregate from all accounts
      const mockWeeklyData = {
        warmupSent: 237,
        landedInbox: 229,
        savedFromSpam: 8,
        emailsReceived: 76,
        dailyBreakdown: Array.from({ length: 7 }, (_, i) => {
          const date = subDays(endDate, 6 - i);
          return {
            date: format(date, "dd MMM"),
            sent: Math.floor(Math.random() * 40) + 20,
            replied: Math.floor(Math.random() * 15) + 5,
            savedFromSpam: Math.floor(Math.random() * 3),
          };
        }),
      };
      
      setWeeklyStats(mockWeeklyData);
    } catch (err) {
      console.error("Failed to fetch weekly stats:", err);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">Error: {error || "No data available"}</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status) => {
    const variants = {
      warming_up: "default",
      paused: "secondary",
      not_started: "secondary",
      completed: "default",
    };
    return <Badge variant={variants[status] || "secondary"}>{status.replace("_", " ")}</Badge>;
  };

  // Calculate success rate
  const successRate = weeklyStats 
    ? Math.round((weeklyStats.landedInbox / weeklyStats.warmupSent) * 100)
    : 0;

  const getSuccessRating = (rate) => {
    if (rate >= 95) return { text: "Super", color: "text-green-600" };
    if (rate >= 85) return { text: "Great", color: "text-blue-600" };
    if (rate >= 70) return { text: "Good", color: "text-yellow-600" };
    return { text: "Needs Work", color: "text-red-600" };
  };

  const rating = getSuccessRating(successRate);

  // Pie chart data
  const pieData = weeklyStats ? [
    { name: "Landed in inbox", value: weeklyStats.landedInbox, color: "#10b981" },
    { name: "Saved from spam", value: weeklyStats.savedFromSpam, color: "#ef4444" },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Summary (last 7 days)</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Warmup emails sent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">
                {weeklyStats?.warmupSent || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Landed in inbox
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">
                {weeklyStats?.landedInbox || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Saved from spam
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-600">
                {weeklyStats?.savedFromSpam || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Emails received
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-600">
                {weeklyStats?.emailsReceived || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Rate Banner */}
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border-cyan-200 dark:border-cyan-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <p className="text-2xl font-semibold text-cyan-700 dark:text-cyan-400">
              {successRate}% of your warmup emails landed in inbox
            </p>
            <div className="flex items-center gap-2">
              <Smile className={`h-6 w-6 ${rating.color}`} />
              <span className={`text-2xl font-bold ${rating.color}`}>{rating.text}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Inbox vs Spam Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Inbox vs Spam</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-3 w-3 rounded-sm bg-green-500" />
                    <span className="text-3xl font-bold text-green-600">{successRate}%</span>
                    <span className="text-sm text-muted-foreground">({weeklyStats?.landedInbox})</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Landed from inbox</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-3 w-3 rounded-sm bg-red-500" />
                    <span className="text-3xl font-bold text-red-600">{100 - successRate}%</span>
                    <span className="text-sm text-muted-foreground">({weeklyStats?.savedFromSpam})</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Saved from spam</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warmup Email Sent Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Warmup email sent</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyStats?.dailyBreakdown || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Bar dataKey="sent" stackId="a" fill="#3b82f6" name="Sent" />
                <Bar dataKey="replied" stackId="a" fill="#ec4899" name="Replied" />
                <Bar dataKey="savedFromSpam" stackId="a" fill="#ef4444" name="Saved from spam" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentActivity.length === 0 ? (
            <p className="text-muted-foreground text-sm">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{activity.email}</p>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(activity.warmupStatus)}
                      <span className="text-xs text-muted-foreground">
                        Day {activity.warmupDay} • {activity.dailyLimit} emails/day
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(activity.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
