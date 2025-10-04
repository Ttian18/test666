import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Shield,
  Eye,
  EyeOff,
  Search,
  MessageSquare,
  Clock,
  Key,
  Info,
} from "lucide-react";

interface PrivacySettingsSectionProps {
  profile: any;
  onUpdate: (data: any) => void;
}

const PrivacySettingsSection: React.FC<PrivacySettingsSectionProps> = ({
  profile,
  onUpdate,
}) => {
  const [profileVisibility, setProfileVisibility] = useState(
    profile?.privacySettings?.profileVisibility || "private"
  );
  const [showRealName, setShowRealName] = useState(
    profile?.privacySettings?.showRealName || false
  );
  const [showLocation, setShowLocation] = useState(
    profile?.privacySettings?.showLocation || false
  );
  const [showAge, setShowAge] = useState(
    profile?.privacySettings?.showAge || false
  );

  const [dataCollection, setDataCollection] = useState({
    analytics: profile?.privacySettings?.dataCollection?.analytics || false,
    personalization:
      profile?.privacySettings?.dataCollection?.personalization || false,
    marketing: profile?.privacySettings?.dataCollection?.marketing || false,
    thirdPartySharing:
      profile?.privacySettings?.dataCollection?.thirdPartySharing || false,
  });

  const [activityVisibility, setActivityVisibility] = useState({
    transactions:
      profile?.privacySettings?.activityVisibility?.transactions || "private",
    recommendations:
      profile?.privacySettings?.activityVisibility?.recommendations ||
      "private",
    reviews: profile?.privacySettings?.activityVisibility?.reviews || "private",
  });

  const [searchable, setSearchable] = useState({
    byEmail: profile?.privacySettings?.searchable?.byEmail || false,
    byPhone: profile?.privacySettings?.searchable?.byPhone || false,
    byName: profile?.privacySettings?.searchable?.byName || false,
  });

  const [twoFactorAuth, setTwoFactorAuth] = useState({
    enabled: profile?.privacySettings?.twoFactorAuth?.enabled || false,
    method: profile?.privacySettings?.twoFactorAuth?.method || "email",
  });

  const updateDataCollection = (key: string, value: boolean) => {
    const newDataCollection = { ...dataCollection, [key]: value };
    setDataCollection(newDataCollection);
    onUpdate({ dataCollection: newDataCollection });
  };

  const updateActivityVisibility = (key: string, value: string) => {
    const newActivityVisibility = { ...activityVisibility, [key]: value };
    setActivityVisibility(newActivityVisibility);
    onUpdate({ activityVisibility: newActivityVisibility });
  };

  const updateSearchable = (key: string, value: boolean) => {
    const newSearchable = { ...searchable, [key]: value };
    setSearchable(newSearchable);
    onUpdate({ searchable: newSearchable });
  };

  const updateTwoFactorAuth = (key: string, value: any) => {
    const newTwoFactorAuth = { ...twoFactorAuth, [key]: value };
    setTwoFactorAuth(newTwoFactorAuth);
    onUpdate({ twoFactorAuth: newTwoFactorAuth });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          隐私设置
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 账户隐私 */}
        <div>
          <Label className="text-base font-medium">账户隐私</Label>
          <div className="space-y-4 mt-3">
            <div>
              <Label className="text-sm">资料可见性</Label>
              <div className="flex gap-2 mt-1">
                {[
                  {
                    value: "public",
                    label: "公开",
                    icon: Eye,
                    description: "所有人可见",
                  },
                  {
                    value: "friends",
                    label: "好友",
                    icon: MessageSquare,
                    description: "仅好友可见",
                  },
                  {
                    value: "private",
                    label: "私密",
                    icon: EyeOff,
                    description: "仅自己可见",
                  },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={
                      profileVisibility === option.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => {
                      setProfileVisibility(option.value);
                      onUpdate({ profileVisibility: option.value });
                    }}
                    className="flex items-center gap-2"
                  >
                    <option.icon className="w-4 h-4" />
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">显示真实姓名</div>
                  <div className="text-sm text-muted-foreground">
                    在公开资料中显示
                  </div>
                </div>
                <Switch
                  checked={showRealName}
                  onCheckedChange={(checked) => {
                    setShowRealName(checked);
                    onUpdate({ showRealName: checked });
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">显示位置信息</div>
                  <div className="text-sm text-muted-foreground">
                    显示所在城市
                  </div>
                </div>
                <Switch
                  checked={showLocation}
                  onCheckedChange={(checked) => {
                    setShowLocation(checked);
                    onUpdate({ showLocation: checked });
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">显示年龄</div>
                  <div className="text-sm text-muted-foreground">
                    显示年龄信息
                  </div>
                </div>
                <Switch
                  checked={showAge}
                  onCheckedChange={(checked) => {
                    setShowAge(checked);
                    onUpdate({ showAge: checked });
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 数据使用 */}
        <div>
          <Label className="text-base font-medium">数据使用</Label>
          <div className="space-y-3 mt-3">
            {[
              {
                key: "analytics",
                label: "分析数据收集",
                description: "用于改进产品功能和用户体验",
                icon: "📊",
              },
              {
                key: "personalization",
                label: "个性化数据使用",
                description: "用于提供个性化推荐和服务",
                icon: "🎯",
              },
              {
                key: "marketing",
                label: "营销数据使用",
                description: "用于发送相关广告和促销信息",
                icon: "📢",
              },
              {
                key: "thirdPartySharing",
                label: "第三方数据共享",
                description: "与合作伙伴共享匿名数据",
                icon: "🤝",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                </div>
                <Switch
                  checked={
                    dataCollection[item.key as keyof typeof dataCollection]
                  }
                  onCheckedChange={(checked) =>
                    updateDataCollection(item.key, checked)
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* 活动隐私 */}
        <div>
          <Label className="text-base font-medium">活动隐私</Label>
          <div className="space-y-4 mt-3">
            {[
              { key: "transactions", label: "交易记录", icon: "💳" },
              { key: "recommendations", label: "推荐记录", icon: "🍽️" },
              { key: "reviews", label: "评价记录", icon: "⭐" },
            ].map((item) => (
              <div key={item.key}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{item.icon}</span>
                  <Label className="text-sm">{item.label}</Label>
                </div>
                <div className="flex gap-2">
                  {[
                    { value: "private", label: "私密" },
                    { value: "friends", label: "好友" },
                    { value: "public", label: "公开" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        activityVisibility[
                          item.key as keyof typeof activityVisibility
                        ] === option.value
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        updateActivityVisibility(item.key, option.value)
                      }
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 搜索和联系 */}
        <div>
          <Label className="text-base font-medium">搜索和联系</Label>
          <div className="space-y-3 mt-3">
            {[
              {
                key: "byEmail",
                label: "通过邮箱搜索",
                description: "允许其他用户通过邮箱找到您",
              },
              {
                key: "byPhone",
                label: "通过手机号搜索",
                description: "允许其他用户通过手机号找到您",
              },
              {
                key: "byName",
                label: "通过姓名搜索",
                description: "允许其他用户通过姓名找到您",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.description}
                  </div>
                </div>
                <Switch
                  checked={searchable[item.key as keyof typeof searchable]}
                  onCheckedChange={(checked) =>
                    updateSearchable(item.key, checked)
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* 数据保留 */}
        <div>
          <Label className="text-base font-medium">数据保留</Label>
          <div className="space-y-3 mt-3">
            <div>
              <Label className="text-sm">数据保留期限</Label>
              <select
                className="w-full px-3 py-2 border border-input bg-background rounded-md mt-1"
                onChange={(e) => onUpdate({ dataRetention: e.target.value })}
                defaultValue={
                  profile?.privacySettings?.dataRetention || "2years"
                }
              >
                <option value="1year">1年</option>
                <option value="2years">2年</option>
                <option value="5years">5年</option>
                <option value="forever">永久保留</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">自动删除非活跃数据</div>
                <div className="text-sm text-muted-foreground">
                  自动删除长期未使用的数据
                </div>
              </div>
              <Switch
                checked={profile?.privacySettings?.autoDeleteInactive || false}
                onCheckedChange={(checked) =>
                  onUpdate({ autoDeleteInactive: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* 通讯权限 */}
        <div>
          <Label className="text-base font-medium">通讯权限</Label>
          <div className="space-y-3 mt-3">
            <div>
              <Label className="text-sm">允许接收消息</Label>
              <div className="flex gap-2 mt-1">
                {[
                  { value: "everyone", label: "所有人" },
                  { value: "friends", label: "仅好友" },
                  { value: "none", label: "不允许" },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={
                      profile?.privacySettings?.allowMessages === option.value
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => onUpdate({ allowMessages: option.value })}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm">允许接收通知</Label>
              <div className="flex gap-2 mt-1">
                {[
                  { value: "everyone", label: "所有人" },
                  { value: "friends", label: "仅好友" },
                  { value: "none", label: "不允许" },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={
                      profile?.privacySettings?.allowNotifications ===
                      option.value
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      onUpdate({ allowNotifications: option.value })
                    }
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 两步验证 */}
        <div>
          <Label className="text-base font-medium">两步验证</Label>
          <div className="space-y-4 mt-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-medium">启用两步验证</div>
                  <div className="text-sm text-muted-foreground">
                    增强账户安全性
                  </div>
                </div>
              </div>
              <Switch
                checked={twoFactorAuth.enabled}
                onCheckedChange={(checked) =>
                  updateTwoFactorAuth("enabled", checked)
                }
              />
            </div>

            {twoFactorAuth.enabled && (
              <div>
                <Label className="text-sm">验证方式</Label>
                <div className="flex gap-2 mt-1">
                  {[
                    { value: "sms", label: "短信", icon: "📱" },
                    { value: "email", label: "邮箱", icon: "📧" },
                    { value: "authenticator", label: "验证器", icon: "🔐" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        twoFactorAuth.method === option.value
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        updateTwoFactorAuth("method", option.value)
                      }
                      className="flex items-center gap-2"
                    >
                      <span>{option.icon}</span>
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 隐私说明 */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>隐私保护说明</AlertTitle>
          <AlertDescription className="text-sm">
            我们重视您的隐私保护。所有数据都经过加密存储，仅在必要时用于提供服务。
            您可以随时修改这些设置，或联系我们的隐私团队了解更多信息。
            <a href="/privacy" className="text-primary hover:underline ml-1">
              查看完整隐私政策
            </a>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default PrivacySettingsSection;
