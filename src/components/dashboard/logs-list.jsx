"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { format } from "date-fns";

export const LogsList = ({ accountId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchLogs();
  }, [accountId, offset]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bearer_token") || "demo_token";
      
      const response = await fetch(
        `/api/warmup/logs/${accountId}?limit=${limit}&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch logs");
      }

      const data = await response.json();
      setLogs(data.logs);
      setTotal(data.total);
    } catch (err) {
      console.error("Failed to load logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    const variants = {
      send: "default",
      open: "secondary",
      reply: "secondary",
      move_to_inbox: "outline",
      mark_important: "outline",
    };
    return (
      <Badge variant={variants[action] || "secondary"}>
        {action.replace("_", " ")}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    const variants = {
      success: "default",
      pending: "secondary",
      failed: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (loading && logs.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading logs...</p>
        </CardContent>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No activity logs yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {offset + 1} - {Math.min(offset + limit, total)} of {total} logs
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start justify-between border-b pb-4 last:border-0"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getActionBadge(log.actionType)}
                  {getStatusBadge(log.status)}
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm:ss")}
                  </span>
                </div>
                {log.recipientEmail && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">To:</span>{" "}
                    {log.recipientEmail}
                  </p>
                )}
                {log.subject && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Subject:</span>{" "}
                    {log.subject}
                  </p>
                )}
                {log.errorMessage && (
                  <p className="text-sm text-destructive">
                    Error: {log.errorMessage}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {total > limit && (
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0 || loading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= total || loading}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
