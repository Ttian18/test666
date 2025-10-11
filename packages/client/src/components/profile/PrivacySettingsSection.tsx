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
          Privacy Settings
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Account privacy */}
        <div>
          <Label className="text-base font-medium">Account Privacy</Label>
          <div className="space-y-4 mt-3">
            <div>
              <Label className="text-sm">Profile Visibility</Label>
              <div className="flex gap-2 mt-1">
                {[
                  {
                    value: "public",
                    label: "Public",
                    icon: Eye,
                    description: "Visible to everyone",
                  },
                  {
                    value: "friends",
                    label: "Friends",
                    icon: MessageSquare,
                    description: "Visible to friends only",
                  },
                  {
                    value: "private",
                    label: "Private",
                    icon: EyeOff,
                    description: "Visible to you only",
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
                  <div className="font-medium">Show Real Name</div>
                  <div className="text-sm text-muted-foreground">
                    Display in public profile
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
                  <div className="font-medium">Show Location</div>
                  <div className="text-sm text-muted-foreground">
                    Display city
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
                  <div className="font-medium">Show Age</div>
                  <div className="text-sm text-muted-foreground">
                    Display age information
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

        {/* Data usage */}
        <div>
          <Label className="text-base font-medium">Data Usage</Label>
          <div className="space-y-3 mt-3">
            {[
              {
                key: "analytics",
                label: "Analytics Data Collection",
                description:
                  "Used to improve product features and user experience",
                icon: "📊",
              },
              {
                key: "personalization",
                label: "Personalization Data Usage",
                description:
                  "Used to provide personalized recommendations and services",
                icon: "🎯",
              },
              {
                key: "marketing",
                label: "Marketing Data Usage",
                description:
                  "Used to send relevant ads and promotional information",
                icon: "📢",
              },
              {
                key: "thirdPartySharing",
                label: "Third-party Data Sharing",
                description: "Share anonymous data with partners",
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

        {/* Activity privacy */}
        <div>
          <Label className="text-base font-medium">Activity Privacy</Label>
          <div className="space-y-4 mt-3">
            {[
              { key: "transactions", label: "Transaction History", icon: "💳" },
              {
                key: "recommendations",
                label: "Recommendation History",
                icon: "🍽️",
              },
              { key: "reviews", label: "Review History", icon: "⭐" },
            ].map((item) => (
              <div key={item.key}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{item.icon}</span>
                  <Label className="text-sm">{item.label}</Label>
                </div>
                <div className="flex gap-2">
                  {[
                    { value: "private", label: "Private" },
                    { value: "friends", label: "Friends" },
                    { value: "public", label: "Public" },
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

        {/* Search and contact */}
        <div>
          <Label className="text-base font-medium">Search and Contact</Label>
          <div className="space-y-3 mt-3">
            {[
              {
                key: "byEmail",
                label: "Search by Email",
                description: "Allow others to find you by email",
              },
              {
                key: "byPhone",
                label: "Search by Phone",
                description: "Allow others to find you by phone number",
              },
              {
                key: "byName",
                label: "Search by Name",
                description: "Allow others to find you by name",
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

        {/* Data retention */}
        <div>
          <Label className="text-base font-medium">Data Retention</Label>
          <div className="space-y-3 mt-3">
            <div>
              <Label className="text-sm">Data Retention Period</Label>
              <select
                className="w-full px-3 py-2 border border-input bg-background rounded-md mt-1"
                onChange={(e) => onUpdate({ dataRetention: e.target.value })}
                defaultValue={
                  profile?.privacySettings?.dataRetention || "2years"
                }
              >
                <option value="1year">1 Year</option>
                <option value="2years">2 Years</option>
                <option value="5years">5 Years</option>
                <option value="forever">Forever</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Auto-delete Inactive Data</div>
                <div className="text-sm text-muted-foreground">
                  Automatically delete long-unused data
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

        {/* Communication permissions */}
        <div>
          <Label className="text-base font-medium">
            Communication Permissions
          </Label>
          <div className="space-y-3 mt-3">
            <div>
              <Label className="text-sm">Allow Messages From</Label>
              <div className="flex gap-2 mt-1">
                {[
                  { value: "everyone", label: "Everyone" },
                  { value: "friends", label: "Friends Only" },
                  { value: "none", label: "No One" },
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
              <Label className="text-sm">Allow Notifications From</Label>
              <div className="flex gap-2 mt-1">
                {[
                  { value: "everyone", label: "Everyone" },
                  { value: "friends", label: "Friends Only" },
                  { value: "none", label: "No One" },
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

        {/* Two-factor authentication */}
        <div>
          <Label className="text-base font-medium">
            Two-Factor Authentication
          </Label>
          <div className="space-y-4 mt-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-medium">
                    Enable Two-Factor Authentication
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Enhance account security
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
                <Label className="text-sm">Verification Method</Label>
                <div className="flex gap-2 mt-1">
                  {[
                    { value: "sms", label: "SMS", icon: "📱" },
                    { value: "email", label: "Email", icon: "📧" },
                    {
                      value: "authenticator",
                      label: "Authenticator",
                      icon: "🔐",
                    },
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

        {/* Privacy notice */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Privacy Protection Notice</AlertTitle>
          <AlertDescription className="text-sm">
            We value your privacy protection. All data is encrypted in storage
            and only used when necessary to provide services. You can modify
            these settings at any time, or contact our privacy team for more
            information.
            <a href="/privacy" className="text-primary hover:underline ml-1">
              View complete privacy policy
            </a>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default PrivacySettingsSection;
