"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Trash2, TestTube } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export const EmailAccountList = ({ accounts, loading, onRefresh }) => {
  const [actionLoading, setActionLoading] = useState(null);

  const handleAction = async (accountId, action) => {
    setActionLoading(accountId);
    try {
      const token = localStorage.getItem("bearer_token") || "demo_token";
      let url = "";
      let method = "POST";

      switch (action) {
        case "start":
          url = `/api/warmup/start/${accountId}`;
          break;
        case "pause":
          url = `/api/warmup/pause/${accountId}`;
          break;
        case "stop":
          url = `/api/warmup/stop/${accountId}`;
          break;
        case "test":
          url = `/api/email/test-connection/${accountId}`;
          break;
        case "delete":
          url = `/api/email/accounts?id=${accountId}`;
          method = "DELETE";
          break;
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${action} account`);
      }

      const data = await response.json();
      
      if (action === "test") {
        if (data.smtp && data.imap) {
          toast.success("Connection test successful!");
        } else {
          toast.error("Connection test failed");
        }
      } else {
        toast.success(`Successfully ${action === "delete" ? "deleted" : action + "ed"} account`);
      }
      
      onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to ${action} account`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: "default",
      paused: "secondary",
      error: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getWarmupStatusBadge = (status) => {
    const variants = {
      warming_up: "default",
      paused: "secondary",
      not_started: "secondary",
      completed: "default",
    };
    return <Badge variant={variants[status] || "secondary"}>{status.replace("_", " ")}</Badge>;
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading accounts...</div>;
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground mb-2">No email accounts connected yet</p>
        <p className="text-sm text-muted-foreground">Connect your first email account to get started</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Warm-up</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Daily Limit</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => {
            const progress = (account.warmupDay / 15) * 100;
            return (
              <TableRow key={account.id}>
                <TableCell className="font-medium">{account.email}</TableCell>
                <TableCell className="capitalize">{account.provider}</TableCell>
                <TableCell>{getStatusBadge(account.status)}</TableCell>
                <TableCell>{getWarmupStatusBadge(account.warmupStatus)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={progress} className="w-20" />
                    <span className="text-xs text-muted-foreground">
                      Day {account.warmupDay}/15
                    </span>
                  </div>
                </TableCell>
                <TableCell>{account.dailyLimit}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {account.warmupStatus === "not_started" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAction(account.id, "start")}
                        disabled={actionLoading === account.id}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    {account.warmupStatus === "warming_up" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAction(account.id, "pause")}
                        disabled={actionLoading === account.id}
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                    )}
                    {(account.warmupStatus === "warming_up" || account.warmupStatus === "paused") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAction(account.id, "stop")}
                        disabled={actionLoading === account.id}
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction(account.id, "test")}
                      disabled={actionLoading === account.id}
                    >
                      <TestTube className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction(account.id, "delete")}
                      disabled={actionLoading === account.id}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
