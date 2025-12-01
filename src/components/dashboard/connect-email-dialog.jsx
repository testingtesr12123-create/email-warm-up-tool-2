"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const ConnectEmailDialog = ({ open, onOpenChange, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState("gmail");
  const [formData, setFormData] = useState({
    email: "",
    smtp_host: "smtp.gmail.com",
    smtp_port: 587,
    smtp_secure: true,
    imap_host: "imap.gmail.com",
    imap_port: 993,
    username: "",
    password: "",
    daily_limit: 30,
  });

  const handleProviderChange = (value) => {
    setProvider(value);
    if (value === "gmail") {
      setFormData((prev) => ({
        ...prev,
        smtp_host: "smtp.gmail.com",
        smtp_port: 587,
        imap_host: "imap.gmail.com",
        imap_port: 993,
      }));
    } else if (value === "outlook") {
      setFormData((prev) => ({
        ...prev,
        smtp_host: "smtp.office365.com",
        smtp_port: 587,
        imap_host: "outlook.office365.com",
        imap_port: 993,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("bearer_token") || "demo_token";
      
      const response = await fetch("/api/email/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          provider,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to connect account");
      }

      toast.success("Email account connected successfully!");
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        email: "",
        smtp_host: "smtp.gmail.com",
        smtp_port: 587,
        smtp_secure: true,
        imap_host: "imap.gmail.com",
        imap_port: 993,
        username: "",
        password: "",
        daily_limit: 30,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to connect account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connect Email Account</DialogTitle>
          <DialogDescription>
            Enter your email credentials to connect your account for warm-up
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider">Provider *</Label>
              <Select value={provider} onValueChange={handleProviderChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gmail">Gmail</SelectItem>
                  <SelectItem value="outlook">Outlook</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                placeholder="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-3">SMTP Configuration</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp_host">SMTP Host *</Label>
                <Input
                  id="smtp_host"
                  placeholder="smtp.example.com"
                  value={formData.smtp_host}
                  onChange={(e) => setFormData({ ...formData, smtp_host: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp_port">SMTP Port *</Label>
                <Input
                  id="smtp_port"
                  type="number"
                  placeholder="587"
                  value={formData.smtp_port}
                  onChange={(e) => setFormData({ ...formData, smtp_port: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="smtp_secure"
                  checked={formData.smtp_secure}
                  onCheckedChange={(checked) => setFormData({ ...formData, smtp_secure: checked })}
                />
                <Label htmlFor="smtp_secure">Use TLS/SSL</Label>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-3">IMAP Configuration</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="imap_host">IMAP Host *</Label>
                <Input
                  id="imap_host"
                  placeholder="imap.example.com"
                  value={formData.imap_host}
                  onChange={(e) => setFormData({ ...formData, imap_host: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imap_port">IMAP Port *</Label>
                <Input
                  id="imap_port"
                  type="number"
                  placeholder="993"
                  value={formData.imap_port}
                  onChange={(e) => setFormData({ ...formData, imap_port: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="daily_limit">Daily Email Limit</Label>
            <Input
              id="daily_limit"
              type="number"
              min="1"
              max="100"
              placeholder="30"
              value={formData.daily_limit}
              onChange={(e) => setFormData({ ...formData, daily_limit: parseInt(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of emails to send per day (1-100)
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Connecting..." : "Connect Account"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
