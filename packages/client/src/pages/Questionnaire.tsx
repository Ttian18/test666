import { useState } from "react";
import { ChevronLeft, ChevronRight, Check, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { OnboardingUtils } from "@/utils/onboarding";

const Questionnaire = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    monthlyBudget: "",
    income: "",
    expenseCategories: [] as string[],
    customCategory: "",
    spendingStyle: [3],
    savingPriority: [3],
    financialGoals: [3],
    savingsGoal: "",
    deadline: "",
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const expenseCategories = [
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Healthcare",
    "Education",
    "Travel",
    "Housing",
    "Utilities",
    "Subscriptions",
  ];

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      expenseCategories: prev.expenseCategories.includes(category)
        ? prev.expenseCategories.filter((c) => c !== category)
        : [...prev.expenseCategories, category],
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(6); // Show summary
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    OnboardingUtils.markQuestionnaireCompleted();
    localStorage.setItem("userProfile", JSON.stringify(formData));
    console.log("🏠 Navigating to home after completing questionnaire");
    navigate("/home");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Monthly Budget</CardTitle>
              <p className="text-muted-foreground">
                How much do you plan to spend each month?
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="budget">Monthly Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="2000"
                  value={formData.monthlyBudget}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      monthlyBudget: e.target.value,
                    }))
                  }
                  className="text-lg"
                />
              </div>
              <div>
                <Label htmlFor="income">Monthly Income (Optional)</Label>
                <Input
                  id="income"
                  type="number"
                  placeholder="3500"
                  value={formData.income}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, income: e.target.value }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
              <p className="text-muted-foreground">
                Which categories do you typically spend on?
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {expenseCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={formData.expenseCategories.includes(category)}
                      onCheckedChange={() => handleCategoryToggle(category)}
                    />
                    <Label htmlFor={category} className="text-sm">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>

              <div>
                <Label htmlFor="custom">Other Category</Label>
                <Input
                  id="custom"
                  placeholder="Add custom category..."
                  value={formData.customCategory}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      customCategory: e.target.value,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Spending Preferences</CardTitle>
              <p className="text-muted-foreground">
                Tell us about your spending style
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Spending Style</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  1 = Very Conservative, 5 = Very Liberal
                </p>
                <Slider
                  value={formData.spendingStyle}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, spendingStyle: value }))
                  }
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Conservative</span>
                  <span>Moderate</span>
                  <span>Liberal</span>
                </div>
              </div>

              <div>
                <Label>Saving Priority</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  How important is saving money to you?
                </p>
                <Slider
                  value={formData.savingPriority}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, savingPriority: value }))
                  }
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Financial Goals</CardTitle>
              <p className="text-muted-foreground">
                How focused are you on financial planning?
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Financial Planning Focus</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  1 = Just tracking, 5 = Detailed planning
                </p>
                <Slider
                  value={formData.financialGoals}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, financialGoals: value }))
                  }
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Savings Goal</CardTitle>
              <p className="text-muted-foreground">
                Set a target to work towards
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="savings-goal">Target Amount ($)</Label>
                <Input
                  id="savings-goal"
                  type="number"
                  placeholder="5000"
                  value={formData.savingsGoal}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      savingsGoal: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="deadline">Target Date</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      deadline: e.target.value,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Profile Summary</CardTitle>
              <p className="text-muted-foreground">Review your information</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium">Monthly Budget</p>
                    <p className="text-sm text-muted-foreground">
                      ${formData.monthlyBudget}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(1)}
                  >
                    <Edit size={16} />
                  </Button>
                </div>

                <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium">Selected Categories</p>
                    <p className="text-sm text-muted-foreground">
                      {formData.expenseCategories.length} categories selected
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(2)}
                  >
                    <Edit size={16} />
                  </Button>
                </div>

                {formData.savingsGoal && (
                  <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium">Savings Goal</p>
                      <p className="text-sm text-muted-foreground">
                        ${formData.savingsGoal} by {formData.deadline}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(5)}
                    >
                      <Edit size={16} />
                    </Button>
                  </div>
                )}
              </div>

              <Button
                onClick={handleFinish}
                className="w-full bg-gradient-primary hover:opacity-90 h-12 text-lg font-semibold"
              >
                <Check className="mr-2" size={20} />
                Complete Setup
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-gradient-primary p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Personal Finance Setup</h1>
          {currentStep < 6 && (
            <span className="text-white/80 text-sm">
              Step {currentStep} of {totalSteps}
            </span>
          )}
        </div>
        {currentStep < 6 && (
          <Progress value={progress} className="h-2 bg-white/20" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-sm mx-auto">{renderStep()}</div>
      </div>

      {/* Navigation */}
      {currentStep < 6 && (
        <div className="p-6 bg-background border-t">
          <div className="flex gap-3 max-w-sm mx-auto">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex-1"
            >
              <ChevronLeft size={18} className="mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 bg-gradient-primary hover:opacity-90"
            >
              {currentStep === totalSteps ? "Review" : "Next"}
              <ChevronRight size={18} className="ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questionnaire;
