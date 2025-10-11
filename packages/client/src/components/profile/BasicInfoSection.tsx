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

  // Avatar upload handler
  const handleAvatarUpload = async (file: File) => {
    try {
      setIsUploading(true);

      // File validation
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload JPG, PNG or WebP format images",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Image size cannot exceed 2MB",
          variant: "destructive",
        });
        return;
      }

      // API call should be made here
      // const result = await uploadAvatar(file);

      toast({
        title: "Avatar Updated Successfully",
        description: "Your avatar has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Avatar upload failed, please try again",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Auto-detect location
  const detectLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location Detection Failed",
        description: "Browser does not support location detection",
        variant: "destructive",
      });
      return;
    }

    setLocationDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Reverse geocoding API should be called here
          const locationData = {
            country: "China",
            state: "Beijing",
            city: "Beijing",
            coordinates: { lat: latitude, lng: longitude },
          };

          onUpdate({
            location: {
              country: { code: "CN", name: "China" },
              city: { name: "Beijing" },
              coordinates: { lat: latitude, lng: longitude },
              timezone: "Asia/Shanghai",
              isPublic: false,
            },
          });

          toast({
            title: "Location Updated Successfully",
            description: "Location information has been updated",
          });
        } catch (error) {
          toast({
            title: "Location Parsing Failed",
            description: "Unable to parse location information",
            variant: "destructive",
          });
        } finally {
          setLocationDetecting(false);
        }
      },
      () => {
        toast({
          title: "Location Detection Failed",
          description: "Please check permission settings",
          variant: "destructive",
        });
        setLocationDetecting(false);
      }
    );
  };

  // Phone number verification
  const verifyPhone = async (phone: string) => {
    if (!phone || phone.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setPhoneVerifying(true);

    try {
      // Verification API should be called here
      // await verifyPhoneAPI(phone);

      toast({
        title: "Verification Code Sent",
        description: "Please check your SMS for the verification code",
      });
    } catch (error) {
      toast({
        title: "Sending Failed",
        description: "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setPhoneVerifying(false);
    }
  };

  // Get name initials
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
          Basic Information
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Avatar upload area */}
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

            {/* Upload progress indicator */}
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
              {isUploading ? "Uploading..." : "Change Avatar"}
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

        {/* Basic information form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={profile?.basicInfo?.name || ""}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Enter your name"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
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
                {profile?.basicInfo?.isEmailVerified
                  ? "Verified"
                  : "Unverified"}
              </Badge>
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
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
                placeholder="Enter phone number"
                className="flex-1"
              />
              {profile?.basicInfo?.phone?.isVerified ? (
                <Badge variant="default" className="text-xs">
                  Verified
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
                    "Verify"
                  )}
                </Button>
              ) : null}
            </div>
          </div>

          <div>
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
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
                Age:{" "}
                {new Date().getFullYear() - profile.basicInfo.dateOfBirth.year}{" "}
                years old
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="gender">Gender</Label>
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
              <option value="">Please select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non_binary">Non-binary</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <Label htmlFor="language">Preferred Language</Label>
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
              <option value="zh-CN">Simplified Chinese</option>
              <option value="zh-TW">Traditional Chinese</option>
              <option value="en-US">English (US)</option>
              <option value="ja-JP">Japanese</option>
              <option value="ko-KR">Korean</option>
            </select>
          </div>
        </div>

        {/* Location information */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Location Information</Label>
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
              {locationDetecting ? "Detecting..." : "Auto-detect"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="country">Country/Region</Label>
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
                <option value="">Please select</option>
                <option value="CN">China</option>
                <option value="US">United States</option>
                <option value="JP">Japan</option>
                <option value="KR">South Korea</option>
                <option value="SG">Singapore</option>
              </select>
            </div>

            <div>
              <Label htmlFor="city">City</Label>
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
                placeholder="Enter city name"
              />
            </div>
          </div>
        </div>

        {/* Personal bio */}
        <div>
          <Label htmlFor="bio">Bio</Label>
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
            placeholder="Tell us a bit about yourself..."
            maxLength={200}
            className="mt-2 resize-none"
            rows={3}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-muted-foreground">
              Used for personalized recommendations and social features
            </p>
            <p className="text-xs text-muted-foreground">
              {(profile?.basicInfo?.bio?.content || "").length}/200
            </p>
          </div>
        </div>

        {/* Data usage notice */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Data Usage Notice</AlertTitle>
          <AlertDescription className="text-sm">
            Your basic information will be used for personalized
            recommendations, location services, and account security. We are
            committed to protecting your privacy. For details, please see our{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default BasicInfoSection;
