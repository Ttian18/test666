import { useState, useEffect } from "react";
import { User, Settings, Edit, Save, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Jason Li",
    email: "JL@example.com",
    monthlyBudget: "2000",
    income: "3500",
    savingsGoal: "5000",
    deadline: "2024-12-31",
  });

  useEffect(() => {
    const saved = localStorage.getItem('userProfile');
    if (saved) {
      const parsedData = JSON.parse(saved);
      setProfileData(prev => ({
        ...prev,
        monthlyBudget: parsedData.monthlyBudget || prev.monthlyBudget,
        income: parsedData.income || prev.income,
        savingsGoal: parsedData.savingsGoal || prev.savingsGoal,
        deadline: parsedData.deadline || prev.deadline,
      }));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your changes have been saved successfully",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary p-6 text-white">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/home')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-white/80">Manage your account settings</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Profile Header */}
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="text-xl font-semibold bg-gradient-primary text-white">
                  {profileData.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={profileData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="font-semibold text-lg"
                    />
                    <Input
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      type="email"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold">{profileData.name}</h2>
                    <p className="text-muted-foreground">{profileData.email}</p>
                  </>
                )}
              </div>
              <Button
                variant={isEditing ? "default" : "outline"}
                size="icon"
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
              >
                {isEditing ? <Save size={18} /> : <Edit size={18} />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings size={20} className="text-primary" />
              Financial Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget">Monthly Budget</Label>
                <Input
                  id="budget"
                  type="number"
                  value={profileData.monthlyBudget}
                  onChange={(e) => handleInputChange('monthlyBudget', e.target.value)}
                  disabled={!isEditing}
                  className={isEditing ? "" : "bg-muted"}
                />
              </div>
              <div>
                <Label htmlFor="income">Monthly Income</Label>
                <Input
                  id="income"
                  type="number"
                  value={profileData.income}
                  onChange={(e) => handleInputChange('income', e.target.value)}
                  disabled={!isEditing}
                  className={isEditing ? "" : "bg-muted"}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="savings">Savings Goal</Label>
                <Input
                  id="savings"
                  type="number"
                  value={profileData.savingsGoal}
                  onChange={(e) => handleInputChange('savingsGoal', e.target.value)}
                  disabled={!isEditing}
                  className={isEditing ? "" : "bg-muted"}
                />
              </div>
              <div>
                <Label htmlFor="deadline">Target Date</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={profileData.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  disabled={!isEditing}
                  className={isEditing ? "" : "bg-muted"}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Savings Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-success">
                {((parseInt(profileData.income) - parseInt(profileData.monthlyBudget)) / parseInt(profileData.income) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">
                ${parseInt(profileData.income) - parseInt(profileData.monthlyBudget)}/month
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Goal Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">23%</p>
              <p className="text-xs text-muted-foreground">
                ${Math.round(parseInt(profileData.savingsGoal) * 0.23)} saved
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Account Actions */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/questionnaire')}
            >
              <User size={18} className="mr-2" />
              Retake Questionnaire
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/reports')}
            >
              <Settings size={18} className="mr-2" />
              Export Data
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Settings size={18} className="mr-2" />
              Reset All Data
            </Button>
          </CardContent>
        </Card>

        <div className="pb-20">
          {/* Spacer for bottom navigation */}
        </div>
      </div>
    </div>
  );
};

export default Profile;