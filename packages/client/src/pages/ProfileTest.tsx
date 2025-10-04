import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Utensils, DollarSign, Bell, Shield } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

const ProfileTest = () => {
  const { profile, loading, error, updateProfile } = useProfile();

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

  const handleTestUpdate = async () => {
    try {
      await updateProfile("basicInfo", {
        name: "测试用户",
        phone: {
          countryCode: "+86",
          number: "13800138000",
          isVerified: false,
        },
      });
      console.log("更新成功");
    } catch (error) {
      console.error("更新失败:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">User Profile 测试页面</h1>

      {/* 完成度显示 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>资料完成度</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg">
              {profile?.completionPercentage || 0}%
            </Badge>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${profile?.completionPercentage || 0}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 基本信息 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            基本信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>姓名:</strong> {profile?.basicInfo?.name || "未设置"}
            </div>
            <div>
              <strong>邮箱:</strong> {profile?.basicInfo?.email || "未设置"}
            </div>
            <div>
              <strong>手机:</strong>{" "}
              {profile?.basicInfo?.phone?.number || "未设置"}
            </div>
            <div>
              <strong>性别:</strong>{" "}
              {profile?.basicInfo?.gender?.value || "未设置"}
            </div>
          </div>
          <Button onClick={handleTestUpdate} className="mt-4">
            测试更新基本信息
          </Button>
        </CardContent>
      </Card>

      {/* 饮食偏好 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="w-5 h-5" />
            饮食偏好
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <strong>饮食限制:</strong>{" "}
              {profile?.dietaryPreferences?.restrictions?.dietary?.length > 0
                ? profile.dietaryPreferences.restrictions.dietary
                    .map((d: any) => d.type)
                    .join(", ")
                : "未设置"}
            </div>
            <div>
              <strong>过敏信息:</strong>{" "}
              {profile?.dietaryPreferences?.restrictions?.allergies?.length > 0
                ? profile.dietaryPreferences.restrictions.allergies
                    .map((a: any) => a.allergen)
                    .join(", ")
                : "未设置"}
            </div>
            <div>
              <strong>菜系偏好:</strong>{" "}
              {profile?.dietaryPreferences?.cuisines?.preferred?.length > 0
                ? profile.dietaryPreferences.cuisines.preferred
                    .map((c: any) => c.cuisine)
                    .join(", ")
                : "未设置"}
            </div>
            <div>
              <strong>辣度承受:</strong>{" "}
              {profile?.dietaryPreferences?.tastes?.spiceTolerance?.level ||
                "未设置"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 财务设置 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            财务设置
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <strong>月收入:</strong>{" "}
              {profile?.financialSettings?.monthlyIncome
                ? `¥${profile.financialSettings.monthlyIncome}`
                : "未设置"}
            </div>
            <div>
              <strong>月预算:</strong>{" "}
              {profile?.financialSettings?.monthlyBudget
                ? `¥${profile.financialSettings.monthlyBudget}`
                : "未设置"}
            </div>
            <div>
              <strong>货币:</strong>{" "}
              {profile?.financialSettings?.currency || "未设置"}
            </div>
            <div>
              <strong>价格偏好:</strong>{" "}
              {profile?.financialSettings?.priceRangePreference || "未设置"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 通知设置 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            通知设置
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <strong>邮件通知:</strong>{" "}
              {profile?.notificationSettings?.channels?.email ? "开启" : "关闭"}
            </div>
            <div>
              <strong>推送通知:</strong>{" "}
              {profile?.notificationSettings?.channels?.push ? "开启" : "关闭"}
            </div>
            <div>
              <strong>短信通知:</strong>{" "}
              {profile?.notificationSettings?.channels?.sms ? "开启" : "关闭"}
            </div>
            <div>
              <strong>预算提醒:</strong>{" "}
              {profile?.notificationSettings?.types?.budgetAlerts
                ? "开启"
                : "关闭"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 隐私设置 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            隐私设置
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <strong>资料可见性:</strong>{" "}
              {profile?.privacySettings?.profileVisibility || "未设置"}
            </div>
            <div>
              <strong>显示真实姓名:</strong>{" "}
              {profile?.privacySettings?.showRealName ? "是" : "否"}
            </div>
            <div>
              <strong>显示位置:</strong>{" "}
              {profile?.privacySettings?.showLocation ? "是" : "否"}
            </div>
            <div>
              <strong>数据分析:</strong>{" "}
              {profile?.privacySettings?.dataCollection?.analytics
                ? "开启"
                : "关闭"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 原始数据 */}
      <Card>
        <CardHeader>
          <CardTitle>原始数据 (调试用)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-xs">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileTest;
