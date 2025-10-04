import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { User, Camera, MapPin, Loader2, Info, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BasicInfoSectionProps {
  profile: any;
  onUpdate: (data: any) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  profile,
  onUpdate,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [locationDetecting, setLocationDetecting] = useState(false);
  const [phoneVerifying, setPhoneVerifying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // 头像上传处理
  const handleAvatarUpload = async (file: File) => {
    try {
      setIsUploading(true);

      // 文件验证
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "文件类型错误",
          description: "请上传 JPG、PNG 或 WebP 格式的图片",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "文件过大",
          description: "图片大小不能超过 2MB",
          variant: "destructive",
        });
        return;
      }

      // 这里应该调用上传API
      // const result = await uploadAvatar(file);

      toast({
        title: "头像更新成功",
        description: "您的头像已成功更新",
      });
    } catch (error) {
      toast({
        title: "上传失败",
        description: "头像上传失败，请重试",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // 自动检测位置
  const detectLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "位置检测失败",
        description: "浏览器不支持位置检测",
        variant: "destructive",
      });
      return;
    }

    setLocationDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // 这里应该调用反向地理编码API
          const locationData = {
            country: "中国",
            state: "北京市",
            city: "北京市",
            coordinates: { lat: latitude, lng: longitude },
          };

          onUpdate({
            location: {
              country: { code: "CN", name: "中国" },
              city: { name: "北京市" },
              coordinates: { lat: latitude, lng: longitude },
              timezone: "Asia/Shanghai",
              isPublic: false,
            },
          });

          toast({
            title: "位置更新成功",
            description: "位置信息已更新",
          });
        } catch (error) {
          toast({
            title: "位置解析失败",
            description: "无法解析位置信息",
            variant: "destructive",
          });
        } finally {
          setLocationDetecting(false);
        }
      },
      () => {
        toast({
          title: "位置检测失败",
          description: "请检查权限设置",
          variant: "destructive",
        });
        setLocationDetecting(false);
      }
    );
  };

  // 手机号验证
  const verifyPhone = async (phone: string) => {
    if (!phone || phone.length < 10) {
      toast({
        title: "手机号无效",
        description: "请输入有效的手机号",
        variant: "destructive",
      });
      return;
    }

    setPhoneVerifying(true);

    try {
      // 这里应该调用验证API
      // await verifyPhoneAPI(phone);

      toast({
        title: "验证码已发送",
        description: "请查收短信验证码",
      });
    } catch (error) {
      toast({
        title: "发送失败",
        description: "验证码发送失败",
        variant: "destructive",
      });
    } finally {
      setPhoneVerifying(false);
    }
  };

  // 获取姓名首字母
  const getInitials = (name: string): string => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    if (words.length === 1) {
      return /[\u4e00-\u9fa5]/.test(name)
        ? name.substring(0, 2)
        : name.substring(0, 1).toUpperCase();
    }
    return words
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          基本信息
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 头像上传区域 */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={profile?.basicInfo?.avatar?.url}
                alt={profile?.basicInfo?.name}
              />
              <AvatarFallback className="text-lg">
                {getInitials(profile?.basicInfo?.name || "")}
              </AvatarFallback>
            </Avatar>

            {/* 上传进度指示器 */}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Camera className="w-4 h-4 mr-2" />
              {isUploading ? "上传中..." : "更换头像"}
            </Button>

            {profile?.basicInfo?.avatar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpdate({ avatar: null })}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleAvatarUpload(file);
            }}
          />
        </div>

        {/* 基本信息表单 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">姓名 *</Label>
            <Input
              id="name"
              value={profile?.basicInfo?.name || ""}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="请输入您的姓名"
            />
          </div>

          <div>
            <Label htmlFor="email">邮箱</Label>
            <div className="flex items-center gap-2">
              <Input
                id="email"
                value={profile?.basicInfo?.email || ""}
                disabled
                className="flex-1"
              />
              <Badge
                variant={
                  profile?.basicInfo?.isEmailVerified ? "default" : "secondary"
                }
              >
                {profile?.basicInfo?.isEmailVerified ? "已验证" : "未验证"}
              </Badge>
            </div>
          </div>

          <div>
            <Label htmlFor="phone">手机号</Label>
            <div className="flex items-center gap-2">
              <Input
                id="phone"
                value={profile?.basicInfo?.phone?.number || ""}
                onChange={(e) =>
                  onUpdate({
                    phone: {
                      ...profile?.basicInfo?.phone,
                      number: e.target.value,
                    },
                  })
                }
                placeholder="请输入手机号"
                className="flex-1"
              />
              {profile?.basicInfo?.phone?.isVerified ? (
                <Badge variant="default" className="text-xs">
                  已验证
                </Badge>
              ) : profile?.basicInfo?.phone?.number ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => verifyPhone(profile.basicInfo.phone.number)}
                  disabled={phoneVerifying}
                >
                  {phoneVerifying ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    "验证"
                  )}
                </Button>
              ) : null}
            </div>
          </div>

          <div>
            <Label htmlFor="dateOfBirth">生日</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={
                profile?.basicInfo?.dateOfBirth
                  ? `${profile.basicInfo.dateOfBirth.year}-${String(
                      profile.basicInfo.dateOfBirth.month
                    ).padStart(2, "0")}-${String(
                      profile.basicInfo.dateOfBirth.day
                    ).padStart(2, "0")}`
                  : ""
              }
              onChange={(e) => {
                const date = new Date(e.target.value);
                onUpdate({
                  dateOfBirth: {
                    year: date.getFullYear(),
                    month: date.getMonth() + 1,
                    day: date.getDate(),
                    showAge: true,
                    showBirthday: true,
                  },
                });
              }}
              max={new Date().toISOString().split("T")[0]}
            />
            {profile?.basicInfo?.dateOfBirth && (
              <p className="text-xs text-muted-foreground mt-1">
                年龄:{" "}
                {new Date().getFullYear() - profile.basicInfo.dateOfBirth.year}{" "}
                岁
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="gender">性别</Label>
            <select
              id="gender"
              value={profile?.basicInfo?.gender?.value || ""}
              onChange={(e) =>
                onUpdate({
                  gender: {
                    value: e.target.value as any,
                    isPublic: false,
                  },
                })
              }
              className="w-full px-3 py-2 border border-input bg-background rounded-md"
            >
              <option value="">请选择</option>
              <option value="male">男性</option>
              <option value="female">女性</option>
              <option value="non_binary">其他</option>
              <option value="prefer_not_to_say">不愿透露</option>
            </select>
          </div>

          <div>
            <Label htmlFor="language">首选语言</Label>
            <select
              id="language"
              value={profile?.basicInfo?.language?.primary || "zh-CN"}
              onChange={(e) =>
                onUpdate({
                  language: {
                    primary: e.target.value,
                    secondary: [],
                  },
                })
              }
              className="w-full px-3 py-2 border border-input bg-background rounded-md"
            >
              <option value="zh-CN">简体中文</option>
              <option value="zh-TW">繁體中文</option>
              <option value="en-US">English (US)</option>
              <option value="ja-JP">日本語</option>
              <option value="ko-KR">한국어</option>
            </select>
          </div>
        </div>

        {/* 位置信息 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>位置信息</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={detectLocation}
              disabled={locationDetecting}
            >
              {locationDetecting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <MapPin className="w-4 h-4 mr-2" />
              )}
              {locationDetecting ? "检测中..." : "自动检测"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="country">国家/地区</Label>
              <select
                id="country"
                value={profile?.basicInfo?.location?.country?.code || ""}
                onChange={(e) =>
                  onUpdate({
                    location: {
                      ...profile?.basicInfo?.location,
                      country: {
                        code: e.target.value,
                        name: e.target.options[e.target.selectedIndex].text,
                      },
                    },
                  })
                }
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="">请选择</option>
                <option value="CN">中国</option>
                <option value="US">美国</option>
                <option value="JP">日本</option>
                <option value="KR">韩国</option>
                <option value="SG">新加坡</option>
              </select>
            </div>

            <div>
              <Label htmlFor="city">城市</Label>
              <Input
                id="city"
                value={profile?.basicInfo?.location?.city?.name || ""}
                onChange={(e) =>
                  onUpdate({
                    location: {
                      ...profile?.basicInfo?.location,
                      city: { name: e.target.value },
                    },
                  })
                }
                placeholder="请输入城市名称"
              />
            </div>
          </div>
        </div>

        {/* 个人简介 */}
        <div>
          <Label htmlFor="bio">个人简介</Label>
          <Textarea
            id="bio"
            value={profile?.basicInfo?.bio?.content || ""}
            onChange={(e) =>
              onUpdate({
                bio: {
                  content: e.target.value,
                  lastUpdated: new Date(),
                  isPublic: false,
                },
              })
            }
            placeholder="简单介绍一下自己..."
            maxLength={200}
            className="mt-2 resize-none"
            rows={3}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-muted-foreground">
              用于个性化推荐和社交功能
            </p>
            <p className="text-xs text-muted-foreground">
              {(profile?.basicInfo?.bio?.content || "").length}/200
            </p>
          </div>
        </div>

        {/* 数据使用说明 */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>数据使用说明</AlertTitle>
          <AlertDescription className="text-sm">
            您的基本信息将用于个性化推荐、位置服务和账户安全。
            我们承诺保护您的隐私，详情请查看
            <a href="/privacy" className="text-primary hover:underline">
              隐私政策
            </a>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default BasicInfoSection;
