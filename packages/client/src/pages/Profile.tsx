import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Utensils,
  DollarSign,
  Bell,
  Shield,
  CheckCircle,
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import BasicInfoSection from "@/components/profile/BasicInfoSection";
import DietaryPreferencesSection from "@/components/profile/DietaryPreferencesSection";
import FinancialSettingsSection from "@/components/profile/FinancialSettingsSection";
import NotificationSettingsSection from "@/components/profile/NotificationSettingsSection";
import PrivacySettingsSection from "@/components/profile/PrivacySettingsSection";

const Profile = () => {
  const { profile, loading, error, updateProfile } = useProfile();
  const [activeTab, setActiveTab] = useState("basic-info");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">加载失败</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const sections = [
    {
      id: "basic-info",
      title: "基本信息",
      icon: User,
      component: BasicInfoSection,
      completionRequired: true,
    },
    {
      id: "dietary-preferences",
      title: "饮食偏好",
      icon: Utensils,
      component: DietaryPreferencesSection,
    },
    {
      id: "financial-settings",
      title: "财务设置",
      icon: DollarSign,
      component: FinancialSettingsSection,
    },
    {
      id: "notification-settings",
      title: "通知设置",
      icon: Bell,
      component: NotificationSettingsSection,
    },
    {
      id: "privacy-settings",
      title: "隐私设置",
      icon: Shield,
      component: PrivacySettingsSection,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 页面标题和进度 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">个人资料</h1>

        {/* 完成度指示器 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-medium">资料完整度</span>
              <Badge variant="outline" className="text-sm">
                {profile?.completionPercentage || 0}%
              </Badge>
            </div>

            <Progress
              value={profile?.completionPercentage || 0}
              className="mb-4"
            />

            <div className="flex flex-wrap gap-2">
              {sections.map((section) => {
                const isCompleted = section.completionRequired
                  ? (profile?.completionPercentage || 0) > 20
                  : true;

                return (
                  <Badge
                    key={section.id}
                    variant={isCompleted ? "default" : "outline"}
                    className="text-xs"
                  >
                    <section.icon className="w-3 h-3 mr-1" />
                    {section.title}
                    {isCompleted && <CheckCircle className="w-3 h-3 ml-1" />}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 标签页导航 */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          {sections.map((section) => (
            <TabsTrigger
              key={section.id}
              value={section.id}
              className="flex items-center gap-2"
            >
              <section.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{section.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* 标签页内容 */}
        {sections.map((section) => {
          const Component = section.component;
          return (
            <TabsContent key={section.id} value={section.id}>
              <Component
                profile={profile}
                onUpdate={(data) => {
                  updateProfile(section.id.replace("-", ""), data);
                }}
              />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default Profile;
