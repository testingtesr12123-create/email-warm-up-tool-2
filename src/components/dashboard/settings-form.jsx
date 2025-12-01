"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export const SettingsForm = ({ accountId }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [randomizeMin, setRandomizeMin] = useState(30);
  const [randomizeMax, setRandomizeMax] = useState(40);
  const [replyRate, setReplyRate] = useState(35);
  const [customTagPart1, setCustomTagPart1] = useState("could");
  const [customTagPart2, setCustomTagPart2] = useState("forty");

  useEffect(() => {
    fetchSettings();
  }, [accountId]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bearer_token") || "demo_token";
      
      const response = await fetch(`/api/warmup/settings/${accountId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        // Settings don't exist yet, use defaults
        setSettings({
          id: 0,
          emailAccountId: accountId,
          enabled: true,
          dailyLimit: 30,
          enableReplies: true,
          enableOpens: true,
          enableMarkImportant: true,
          pauseWeekends: false,
          rampUpDays: 15,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("bearer_token") || "demo_token";
      
      const response = await fetch(`/api/warmup/settings/${accountId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          enabled: settings.enabled,
          dailyLimit: settings.dailyLimit,
          enableReplies: settings.enableReplies,
          enableOpens: settings.enableOpens,
          enableMarkImportant: settings.enableMarkImportant,
          pauseWeekends: settings.pauseWeekends,
          rampUpDays: settings.rampUpDays,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      toast.success("Settings saved successfully!");
      fetchSettings();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading settings...</p>
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Warm-Up Settings</CardTitle>
        <CardDescription>
          Configure your email warm-up parameters to boost deliverability
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Warm-up description */}
        <div className="bg-muted/50 p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">
            Warming up an IP address involves sending low volumes of email on your dedicated IP and then systematically increasing your email volume over a period of time.
          </p>
        </div>

        {/* Enable Warm-up Toggle */}
        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label className="text-base">Email Warmup Enabled</Label>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, enabled: checked })
            }
          />
        </div>

        <div className="border-t" />

        {/* Total number of warm up emails per day */}
        <div className="space-y-2">
          <Label htmlFor="dailyLimit" className="text-base">Total number of warm up emails per day</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Maximum number of warm up emails that could be sent via this email account per day
          </p>
          <Input
            id="dailyLimit"
            type="number"
            min="1"
            max="40"
            value={settings.dailyLimit}
            onChange={(e) =>
              setSettings({ ...settings, dailyLimit: Math.min(40, parseInt(e.target.value) || 1) })
            }
          />
          <div className="flex items-start gap-2 mt-2 text-xs text-amber-600 dark:text-amber-500">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>Total number of warm-up emails per day shouldn't be more than 40</p>
          </div>
        </div>

        <div className="border-t" />

        {/* Daily Rampup */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base">Daily Rampup</Label>
            <Switch
              checked={settings.rampUpDays > 0}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, rampUpDays: checked ? 15 : 0 })
              }
            />
          </div>
          
          {settings.rampUpDays > 0 && (
            <div className="space-y-2 pl-4">
              <Label htmlFor="rampUpDays" className="text-sm">Rampup increment value per day (suggested 5 per day)</Label>
              <Input
                id="rampUpDays"
                type="number"
                min="1"
                max="30"
                value={settings.rampUpDays}
                onChange={(e) =>
                  setSettings({ ...settings, rampUpDays: parseInt(e.target.value) || 1 })
                }
              />
            </div>
          )}
          
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              If you are using a new domain, turn "Daily Rampup". It will naturally progress the number of emails you send each day, instead of jumpscaring ESPs with bulk messages. This prevents Email Service Providers (Gmail, Zoho etc…) from flagging your account for unusual activity.
            </p>
          </div>
        </div>

        <div className="border-t" />

        {/* Randomise number of warm up emails per day */}
        <div className="space-y-3">
          <Label className="text-base">Randomise number of warm up emails per day</Label>
          <p className="text-sm text-muted-foreground">
            Maximum number of emails that could be sent via this email account per day
          </p>
          
          <div className="space-y-4 pt-2">
            <Slider
              min={1}
              max={40}
              step={1}
              value={[randomizeMin, randomizeMax]}
              onValueChange={([min, max]) => {
                setRandomizeMin(min);
                setRandomizeMax(max);
              }}
              className="w-full"
            />
            <div className="flex items-center justify-between">
              <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md font-medium">
                {randomizeMin}
              </div>
              <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md font-medium">
                {randomizeMax}
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>To look more human, randomize the number of emails sent everyday.</p>
          </div>
        </div>

        <div className="border-t" />

        {/* Reply Rate */}
        <div className="space-y-2">
          <Label htmlFor="replyRate" className="text-base">Reply Rate (%)</Label>
          <p className="text-sm text-muted-foreground">
            Suggested - 20, Maximum - 100
          </p>
          <Input
            id="replyRate"
            type="number"
            min="0"
            max="100"
            value={replyRate}
            onChange={(e) => setReplyRate(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
          />
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>Set the reply rate between 30-40% to boost deliverability and reputation.</p>
          </div>
        </div>

        <div className="border-t" />

        {/* Custom Warmup Identifier Tag */}
        <div className="space-y-3">
          <Label className="text-base">Custom Warmup Identifier Tag</Label>
          <p className="text-sm text-muted-foreground">
            Use this two-worded tag to filter out any warmup emails from your inbox.
          </p>
          
          <div className="flex items-center gap-2">
            <Input
              placeholder="could"
              value={customTagPart1}
              onChange={(e) => setCustomTagPart1(e.target.value)}
              className="flex-1"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              placeholder="forty"
              value={customTagPart2}
              onChange={(e) => setCustomTagPart2(e.target.value)}
              className="flex-1"
            />
            <span className="text-muted-foreground">=</span>
            <div className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono">
              {customTagPart1}-{customTagPart2}
            </div>
          </div>
          
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>The Custom Warmup Identifier Tag helps to filter out any warm up emails from your inbox.</p>
          </div>
        </div>

        <div className="border-t" />

        {/* Existing automation features */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Automation Features</h4>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-open Emails</Label>
              <p className="text-sm text-muted-foreground">
                Automatically open received warm-up emails
              </p>
            </div>
            <Switch
              checked={settings.enableOpens}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableOpens: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-reply</Label>
              <p className="text-sm text-muted-foreground">
                Send automatic replies to warm-up emails
              </p>
            </div>
            <Switch
              checked={settings.enableReplies}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableReplies: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mark as Important</Label>
              <p className="text-sm text-muted-foreground">
                Mark received emails as important
              </p>
            </div>
            <Switch
              checked={settings.enableMarkImportant}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableMarkImportant: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Pause on Weekends</Label>
              <p className="text-sm text-muted-foreground">
                Pause warm-up activities on Saturdays and Sundays
              </p>
            </div>
            <Switch
              checked={settings.pauseWeekends}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, pauseWeekends: checked })
              }
            />
          </div>
        </div>

        {/* Enable Auto-adjust warmup/sending ratio */}
        <div className="border-t pt-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="autoAdjust"
              className="mt-1"
            />
            <div className="space-y-1">
              <Label htmlFor="autoAdjust" className="cursor-pointer">
                Enable Auto-adjust warmup/sending ratio
              </Label>
              <p className="text-sm text-muted-foreground">
                Would you like us to adjust the warmups to optimize for email deliverability.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
