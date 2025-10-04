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

  const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          通知设置
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 通知渠道 */}
        <div>
          <Label className="text-base font-medium">通知渠道</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="font-medium">邮件通知</div>
                  <div className="text-sm text-muted-foreground">
                    接收邮件提醒
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
                  <div className="font-medium">推送通知</div>
                  <div className="text-sm text-muted-foreground">
                    手机推送提醒
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
                  <div className="font-medium">短信通知</div>
                  <div className="text-sm text-muted-foreground">
                    重要消息短信提醒
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
                  <div className="font-medium">应用内通知</div>
                  <div className="text-sm text-muted-foreground">
                    应用内消息提醒
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

        {/* 通知类型 */}
        <div>
          <Label className="text-base font-medium">通知类型</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {[
              {
                key: "budgetAlerts",
                label: "预算提醒",
                icon: "💰",
                description: "预算超支或接近限制",
              },
              {
                key: "expenseReminders",
                label: "支出提醒",
                icon: "💳",
                description: "大额支出或异常消费",
              },
              {
                key: "savingsGoalUpdates",
                label: "储蓄目标",
                icon: "🎯",
                description: "储蓄进度和目标达成",
              },
              {
                key: "unusualSpending",
                label: "异常消费",
                icon: "⚠️",
                description: "检测到异常消费模式",
              },
              {
                key: "restaurantRecommendations",
                label: "餐厅推荐",
                icon: "🍽️",
                description: "个性化餐厅推荐",
              },
              {
                key: "menuAnalysis",
                label: "菜单分析",
                icon: "📊",
                description: "菜单分析结果通知",
              },
              {
                key: "specialOffers",
                label: "特价信息",
                icon: "🎉",
                description: "优惠活动和特价信息",
              },
              {
                key: "accountSecurity",
                label: "账户安全",
                icon: "🔒",
                description: "登录异常和安全提醒",
              },
              {
                key: "productUpdates",
                label: "产品更新",
                icon: "🆕",
                description: "新功能和产品更新",
              },
              {
                key: "weeklyReports",
                label: "周报",
                icon: "📈",
                description: "每周消费报告",
              },
              {
                key: "monthlyReports",
                label: "月报",
                icon: "📊",
                description: "每月消费分析报告",
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

        {/* 通知时间 */}
        <div>
          <Label className="text-base font-medium">通知时间</Label>
          <div className="space-y-4 mt-3">
            {/* 免打扰时间 */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">免打扰时间</span>
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
                    <Label className="text-sm">开始时间</Label>
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
                    <Label className="text-sm">结束时间</Label>
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

            {/* 报告时间设置 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">周报发送时间</Label>
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
                <Label className="text-sm">月报发送日期</Label>
                <select
                  value={timing.monthlyReportDate}
                  onChange={(e) =>
                    updateTiming("monthlyReportDate", parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-input bg-background rounded-md mt-1"
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((date) => (
                    <option key={date} value={date}>
                      {date}日
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 时区设置 */}
            <div>
              <Label className="text-sm">时区</Label>
              <select
                value={timing.timezone}
                onChange={(e) => updateTiming("timezone", e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md mt-1"
              >
                <option value="Asia/Shanghai">北京时间 (UTC+8)</option>
                <option value="America/New_York">纽约时间 (UTC-5)</option>
                <option value="Europe/London">伦敦时间 (UTC+0)</option>
                <option value="Asia/Tokyo">东京时间 (UTC+9)</option>
                <option value="America/Los_Angeles">洛杉矶时间 (UTC-8)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 通知频率 */}
        <div>
          <Label className="text-base font-medium">通知频率</Label>
          <div className="space-y-4 mt-3">
            <div>
              <Label className="text-sm">预算提醒频率</Label>
              <div className="flex gap-2 mt-1">
                {[
                  { value: "immediate", label: "立即" },
                  { value: "daily", label: "每日" },
                  { value: "weekly", label: "每周" },
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
              <Label className="text-sm">推荐通知频率</Label>
              <div className="flex gap-2 mt-1">
                {[
                  { value: "real_time", label: "实时" },
                  { value: "daily_digest", label: "每日汇总" },
                  { value: "weekly_digest", label: "每周汇总" },
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
              <Label className="text-sm">报告频率</Label>
              <div className="flex gap-2 mt-1">
                {[
                  { value: "weekly", label: "每周" },
                  { value: "monthly", label: "每月" },
                  { value: "quarterly", label: "每季度" },
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

        {/* 通知预览 */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-primary" />
            <span className="font-medium">通知预览</span>
          </div>
          <div className="space-y-2 text-sm">
            <p>
              • 预算提醒:{" "}
              {frequency.budgetAlerts === "immediate"
                ? "立即通知"
                : frequency.budgetAlerts === "daily"
                ? "每日汇总"
                : "每周汇总"}
            </p>
            <p>
              • 餐厅推荐:{" "}
              {frequency.recommendations === "real_time"
                ? "实时推送"
                : frequency.recommendations === "daily_digest"
                ? "每日汇总"
                : "每周汇总"}
            </p>
            <p>
              • 消费报告:{" "}
              {frequency.reports === "weekly"
                ? "每周发送"
                : frequency.reports === "monthly"
                ? "每月发送"
                : "每季度发送"}
            </p>
            {timing.quietHours.enabled && (
              <p>
                • 免打扰时间: {timing.quietHours.start} -{" "}
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
