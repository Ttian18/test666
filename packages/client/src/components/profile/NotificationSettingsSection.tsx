import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, Smartphone, MessageSquare, Clock } from "lucide-react";

interface NotificationSettingsSectionProps {
  profile: any;
  onUpdate: (data: any) => void;
}

const NotificationSettingsSection: React.FC<
  NotificationSettingsSectionProps
> = ({ profile, onUpdate }) => {
  const [channels, setChannels] = useState({
    email: profile?.notificationSettings?.channels?.email ?? true,
    push: profile?.notificationSettings?.channels?.push ?? true,
    sms: profile?.notificationSettings?.channels?.sms ?? false,
    inApp: profile?.notificationSettings?.channels?.inApp ?? true,
  });

  const [types, setTypes] = useState({
    budgetAlerts: profile?.notificationSettings?.types?.budgetAlerts ?? true,
    expenseReminders:
      profile?.notificationSettings?.types?.expenseReminders ?? true,
    savingsGoalUpdates:
      profile?.notificationSettings?.types?.savingsGoalUpdates ?? true,
    unusualSpending:
      profile?.notificationSettings?.types?.unusualSpending ?? true,
    restaurantRecommendations:
      profile?.notificationSettings?.types?.restaurantRecommendations ?? true,
    menuAnalysis: profile?.notificationSettings?.types?.menuAnalysis ?? true,
    specialOffers: profile?.notificationSettings?.types?.specialOffers ?? true,
    accountSecurity:
      profile?.notificationSettings?.types?.accountSecurity ?? true,
    productUpdates:
      profile?.notificationSettings?.types?.productUpdates ?? true,
    weeklyReports: profile?.notificationSettings?.types?.weeklyReports ?? true,
    monthlyReports:
      profile?.notificationSettings?.types?.monthlyReports ?? true,
  });

  const [timing, setTiming] = useState({
    quietHours: {
      enabled:
        profile?.notificationSettings?.timing?.quietHours?.enabled ?? false,
      start:
        profile?.notificationSettings?.timing?.quietHours?.start ?? "22:00",
      end: profile?.notificationSettings?.timing?.quietHours?.end ?? "08:00",
    },
    timezone:
      profile?.notificationSettings?.timing?.timezone ?? "Asia/Shanghai",
    weeklyReportDay:
      profile?.notificationSettings?.timing?.weeklyReportDay ?? 0,
    monthlyReportDate:
      profile?.notificationSettings?.timing?.monthlyReportDate ?? 1,
  });

  const [frequency, setFrequency] = useState({
    budgetAlerts:
      profile?.notificationSettings?.frequency?.budgetAlerts ?? "daily",
    recommendations:
      profile?.notificationSettings?.frequency?.recommendations ??
      "daily_digest",
    reports: profile?.notificationSettings?.frequency?.reports ?? "monthly",
  });

  const updateChannels = (key: string, value: boolean) => {
    const newChannels = { ...channels, [key]: value };
    setChannels(newChannels);
    onUpdate({ channels: newChannels });
  };

  const updateTypes = (key: string, value: boolean) => {
    const newTypes = { ...types, [key]: value };
    setTypes(newTypes);
    onUpdate({ types: newTypes });
  };

  const updateTiming = (key: string, value: any) => {
    const newTiming = { ...timing, [key]: value };
    setTiming(newTiming);
    onUpdate({ timing: newTiming });
  };

  const updateFrequency = (key: string, value: string) => {
    const newFrequency = { ...frequency, [key]: value };
    setFrequency(newFrequency);
    onUpdate({ frequency: newFrequency });
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Notification channels */}
        <div>
          <Label className="text-base font-medium">Notification Channels</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="font-medium">Email Notifications</div>
                  <div className="text-sm text-muted-foreground">
                    Receive email reminders
                  </div>
                </div>
              </div>
              <Switch
                checked={channels.email}
                onCheckedChange={(checked) => updateChannels("email", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-green-500" />
                <div>
                  <div className="font-medium">Push Notifications</div>
                  <div className="text-sm text-muted-foreground">
                    Mobile push reminders
                  </div>
                </div>
              </div>
              <Switch
                checked={channels.push}
                onCheckedChange={(checked) => updateChannels("push", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-orange-500" />
                <div>
                  <div className="font-medium">SMS Notifications</div>
                  <div className="text-sm text-muted-foreground">
                    Important SMS reminders
                  </div>
                </div>
              </div>
              <Switch
                checked={channels.sms}
                onCheckedChange={(checked) => updateChannels("sms", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-purple-500" />
                <div>
                  <div className="font-medium">In-App Notifications</div>
                  <div className="text-sm text-muted-foreground">
                    In-app message reminders
                  </div>
                </div>
              </div>
              <Switch
                checked={channels.inApp}
                onCheckedChange={(checked) => updateChannels("inApp", checked)}
              />
            </div>
          </div>
        </div>

        {/* Notification types */}
        <div>
          <Label className="text-base font-medium">Notification Types</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {[
              {
                key: "budgetAlerts",
                label: "Budget Alerts",
                icon: "💰",
                description: "Budget exceeded or near limit",
              },
              {
                key: "expenseReminders",
                label: "Expense Reminders",
                icon: "💳",
                description: "Large or unusual spending",
              },
              {
                key: "savingsGoalUpdates",
                label: "Savings Goals",
                icon: "🎯",
                description: "Savings progress and goal achievement",
              },
              {
                key: "unusualSpending",
                label: "Unusual Spending",
                icon: "⚠️",
                description: "Unusual spending patterns detected",
              },
              {
                key: "restaurantRecommendations",
                label: "Restaurant Recommendations",
                icon: "🍽️",
                description: "Personalized restaurant suggestions",
              },
              {
                key: "menuAnalysis",
                label: "Menu Analysis",
                icon: "📊",
                description: "Menu analysis results",
              },
              {
                key: "specialOffers",
                label: "Special Offers",
                icon: "🎉",
                description: "Promotions and special deals",
              },
              {
                key: "accountSecurity",
                label: "Account Security",
                icon: "🔒",
                description: "Login alerts and security reminders",
              },
              {
                key: "productUpdates",
                label: "Product Updates",
                icon: "🆕",
                description: "New features and product updates",
              },
              {
                key: "weeklyReports",
                label: "Weekly Reports",
                icon: "📈",
                description: "Weekly spending reports",
              },
              {
                key: "monthlyReports",
                label: "Monthly Reports",
                icon: "📊",
                description: "Monthly spending analysis reports",
              },
            ].map((type) => (
              <div
                key={type.key}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{type.icon}</span>
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {type.description}
                    </div>
                  </div>
                </div>
                <Switch
                  checked={types[type.key as keyof typeof types]}
                  onCheckedChange={(checked) => updateTypes(type.key, checked)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Notification timing */}
        <div>
          <Label className="text-base font-medium">Notification Timing</Label>
          <div className="space-y-4 mt-3">
            {/* Quiet hours */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Quiet Hours</span>
                </div>
                <Switch
                  checked={timing.quietHours.enabled}
                  onCheckedChange={(checked) =>
                    updateTiming("quietHours", {
                      ...timing.quietHours,
                      enabled: checked,
                    })
                  }
                />
              </div>

              {timing.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Start Time</Label>
                    <input
                      type="time"
                      value={timing.quietHours.start}
                      onChange={(e) =>
                        updateTiming("quietHours", {
                          ...timing.quietHours,
                          start: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">End Time</Label>
                    <input
                      type="time"
                      value={timing.quietHours.end}
                      onChange={(e) =>
                        updateTiming("quietHours", {
                          ...timing.quietHours,
                          end: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Report timing settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Weekly Report Day</Label>
                <select
                  value={timing.weeklyReportDay}
                  onChange={(e) =>
                    updateTiming("weeklyReportDay", parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-input bg-background rounded-md mt-1"
                >
                  {weekDays.map((day, index) => (
                    <option key={index} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-sm">Monthly Report Date</Label>
                <select
                  value={timing.monthlyReportDate}
                  onChange={(e) =>
                    updateTiming("monthlyReportDate", parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-input bg-background rounded-md mt-1"
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((date) => (
                    <option key={date} value={date}>
                      Day {date}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Timezone settings */}
            <div>
              <Label className="text-sm">Timezone</Label>
              <select
                value={timing.timezone}
                onChange={(e) => updateTiming("timezone", e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md mt-1"
              >
                <option value="Asia/Shanghai">Beijing Time (UTC+8)</option>
                <option value="America/New_York">New York Time (UTC-5)</option>
                <option value="Europe/London">London Time (UTC+0)</option>
                <option value="Asia/Tokyo">Tokyo Time (UTC+9)</option>
                <option value="America/Los_Angeles">
                  Los Angeles Time (UTC-8)
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification frequency */}
        <div>
          <Label className="text-base font-medium">
            Notification Frequency
          </Label>
          <div className="space-y-4 mt-3">
            <div>
              <Label className="text-sm">Budget Alert Frequency</Label>
              <div className="flex gap-2 mt-1">
                {[
                  { value: "immediate", label: "Immediate" },
                  { value: "daily", label: "Daily" },
                  { value: "weekly", label: "Weekly" },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={
                      frequency.budgetAlerts === option.value
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      updateFrequency("budgetAlerts", option.value)
                    }
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm">Recommendation Frequency</Label>
              <div className="flex gap-2 mt-1">
                {[
                  { value: "real_time", label: "Real-time" },
                  { value: "daily_digest", label: "Daily Digest" },
                  { value: "weekly_digest", label: "Weekly Digest" },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={
                      frequency.recommendations === option.value
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      updateFrequency("recommendations", option.value)
                    }
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm">Report Frequency</Label>
              <div className="flex gap-2 mt-1">
                {[
                  { value: "weekly", label: "Weekly" },
                  { value: "monthly", label: "Monthly" },
                  { value: "quarterly", label: "Quarterly" },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={
                      frequency.reports === option.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => updateFrequency("reports", option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notification preview */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-primary" />
            <span className="font-medium">Notification Preview</span>
          </div>
          <div className="space-y-2 text-sm">
            <p>
              • Budget Alerts:{" "}
              {frequency.budgetAlerts === "immediate"
                ? "Immediate notification"
                : frequency.budgetAlerts === "daily"
                ? "Daily digest"
                : "Weekly digest"}
            </p>
            <p>
              • Restaurant Recommendations:{" "}
              {frequency.recommendations === "real_time"
                ? "Real-time push"
                : frequency.recommendations === "daily_digest"
                ? "Daily digest"
                : "Weekly digest"}
            </p>
            <p>
              • Spending Reports:{" "}
              {frequency.reports === "weekly"
                ? "Weekly delivery"
                : frequency.reports === "monthly"
                ? "Monthly delivery"
                : "Quarterly delivery"}
            </p>
            {timing.quietHours.enabled && (
              <p>
                • Quiet Hours: {timing.quietHours.start} -{" "}
                {timing.quietHours.end}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettingsSection;
