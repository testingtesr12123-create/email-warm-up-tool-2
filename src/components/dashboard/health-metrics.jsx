"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, TrendingUp, Mail, AlertCircle } from "lucide-react";

export const HealthMetrics = ({ accountId }) => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealth();
  }, [accountId]);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bearer_token") || "demo_token";
      
      const response = await fetch(`/api/warmup/health/${accountId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch health data");
      }

      const data = await response.json();
      setHealth(data);
    } catch (err) {
      console.error("Failed to load health metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading health metrics...</div>;
  }

  if (!health) {
    return null;
  }

  const getHealthColor = (score) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    if (score >= 50) return "text-orange-600";
    return "text-red-600";
  };

  const getHealthBgColor = (score) => {
    if (score >= 90) return "bg-green-50 dark:bg-green-950";
    if (score >= 70) return "bg-yellow-50 dark:bg-yellow-950";
    if (score >= 50) return "bg-orange-50 dark:bg-orange-950";
    return "bg-red-50 dark:bg-red-950";
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className={getHealthBgColor(health.currentHealthScore)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Health Score</CardTitle>
          <Heart className={`h-4 w-4 ${getHealthColor(health.currentHealthScore)}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getHealthColor(health.currentHealthScore)}`}>
            {health.currentHealthScore}
          </div>
          <p className="text-xs text-muted-foreground mt-1 capitalize">
            {health.healthStatus} • Avg: {health.averageHealthScore}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Engagement</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{health.metrics.engagementScore}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            Open: {health.metrics.openRate}% • Reply: {health.metrics.replyRate}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{health.metrics.totalSent}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {health.warmupProgress.day} days active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Issues</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {health.metrics.totalBounces + health.metrics.totalSpamReports}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {health.metrics.totalBounces} bounces • {health.metrics.totalSpamReports} spam
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
