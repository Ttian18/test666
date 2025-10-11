import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Target, Shield } from "lucide-react";

interface FinancialSettingsSectionProps {
  profile: any;
  onUpdate: (data: any) => void;
}

const FinancialSettingsSection: React.FC<FinancialSettingsSectionProps> = ({
  profile,
  onUpdate,
}) => {
  const [monthlyIncome, setMonthlyIncome] = useState(
    profile?.financialSettings?.monthlyIncome || 0
  );
  const [monthlyBudget, setMonthlyBudget] = useState(
    profile?.financialSettings?.monthlyBudget || 0
  );
  const [budgetAllocation, setBudgetAllocation] = useState(
    profile?.financialSettings?.budgetCategories || {
      dining: 0,
      groceries: 0,
      entertainment: 0,
      transportation: 0,
      other: 0,
    }
  );

  const categories = [
    {
      key: "dining",
      label: "Dining",
      icon: "🍽️",
      color: "bg-red-100 text-red-800",
    },
    {
      key: "groceries",
      label: "Groceries",
      icon: "🛒",
      color: "bg-green-100 text-green-800",
    },
    {
      key: "entertainment",
      label: "Entertainment",
      icon: "🎬",
      color: "bg-purple-100 text-purple-800",
    },
    {
      key: "transportation",
      label: "Transportation",
      icon: "🚗",
      color: "bg-blue-100 text-blue-800",
    },
    {
      key: "other",
      label: "Other",
      icon: "📦",
      color: "bg-gray-100 text-gray-800",
    },
  ];

  const updateBudgetAllocation = (category: string, value: number) => {
    const newAllocation = {
      ...budgetAllocation,
      [category]: Math.max(0, Math.min(monthlyBudget, value)),
    };
    setBudgetAllocation(newAllocation);
    onUpdate({
      budgetCategories: newAllocation,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
    }).format(amount);
  };

  const getPercentage = (amount: number) => {
    return monthlyBudget > 0
      ? ((amount / monthlyBudget) * 100).toFixed(1)
      : "0";
  };

  const totalAllocated = Object.values(budgetAllocation).reduce(
    (sum, value) => sum + value,
    0
  );
  const remaining = monthlyBudget - totalAllocated;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Financial Settings
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Income information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="monthlyIncome">Monthly Income</Label>
            <div className="relative">
              <Input
                id="monthlyIncome"
                type="number"
                value={monthlyIncome}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setMonthlyIncome(value);
                  onUpdate({ monthlyIncome: value });
                }}
                placeholder="Enter monthly income"
                className="pl-8"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                ¥
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="incomeSource">Income Source</Label>
            <select
              id="incomeSource"
              className="w-full px-3 py-2 border border-input bg-background rounded-md"
              onChange={(e) => onUpdate({ incomeSource: e.target.value })}
            >
              <option value="salary">Salary</option>
              <option value="freelance">Freelance</option>
              <option value="business">Business</option>
              <option value="investment">Investment</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Budget settings */}
        <div>
          <Label htmlFor="monthlyBudget">Monthly Budget</Label>
          <div className="relative">
            <Input
              id="monthlyBudget"
              type="number"
              value={monthlyBudget}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setMonthlyBudget(value);
                onUpdate({ monthlyBudget: value });
              }}
              placeholder="Enter monthly budget"
              className="pl-8"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              ¥
            </span>
          </div>
          {monthlyIncome > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Budget as % of income:{" "}
              {((monthlyBudget / monthlyIncome) * 100).toFixed(1)}%
            </p>
          )}
        </div>

        {/* Budget allocation overview */}
        {monthlyBudget > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Budget Allocation</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  Allocated: {formatCurrency(totalAllocated)}
                </Badge>
                <Badge variant={remaining >= 0 ? "default" : "destructive"}>
                  {remaining >= 0 ? "Remaining" : "Over"}:{" "}
                  {formatCurrency(Math.abs(remaining))}
                </Badge>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Budget Usage</span>
                <span>{getPercentage(totalAllocated)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    totalAllocated > monthlyBudget
                      ? "bg-red-500"
                      : totalAllocated > monthlyBudget * 0.8
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      (totalAllocated / monthlyBudget) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Detailed allocation */}
            <div className="space-y-3">
              {categories.map((category) => {
                const amount = budgetAllocation[category.key] || 0;
                const percentage = getPercentage(amount);

                return (
                  <div key={category.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{category.icon}</span>
                        <Label className="font-medium">{category.label}</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={amount}
                          onChange={(e) =>
                            updateBudgetAllocation(
                              category.key,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-24 text-right"
                          min="0"
                          max={monthlyBudget}
                        />
                        <span className="text-sm text-muted-foreground w-12">
                          {percentage}%
                        </span>
                      </div>
                    </div>

                    <Slider
                      value={[amount]}
                      onValueChange={([value]) =>
                        updateBudgetAllocation(category.key, value)
                      }
                      max={monthlyBudget}
                      step={50}
                      className="w-full"
                    />

                    {/* Quick set buttons */}
                    <div className="flex gap-2">
                      {[10, 20, 30].map((percent) => (
                        <Button
                          key={percent}
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateBudgetAllocation(
                              category.key,
                              (monthlyBudget * percent) / 100
                            )
                          }
                          className="text-xs"
                        >
                          {percent}%
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateBudgetAllocation(category.key, 0)}
                        className="text-xs"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Savings goals */}
        <div>
          <Label>Savings Goals</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div>
              <Label className="text-sm">Target Amount</Label>
              <Input
                type="number"
                placeholder="10000"
                onChange={(e) =>
                  onUpdate({
                    savingsGoals: [
                      {
                        targetAmount: parseFloat(e.target.value) || 0,
                        purpose: "Emergency Fund",
                        monthlyTarget: 0,
                      },
                    ],
                  })
                }
              />
            </div>
            <div>
              <Label className="text-sm">Target Date</Label>
              <Input
                type="date"
                onChange={(e) =>
                  onUpdate({
                    savingsGoals: [
                      {
                        targetDate: new Date(e.target.value),
                        purpose: "Emergency Fund",
                        monthlyTarget: 0,
                      },
                    ],
                  })
                }
              />
            </div>
            <div>
              <Label className="text-sm">Purpose</Label>
              <select
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                onChange={(e) =>
                  onUpdate({
                    savingsGoals: [
                      {
                        purpose: e.target.value,
                        monthlyTarget: 0,
                      },
                    ],
                  })
                }
              >
                <option value="Emergency Fund">Emergency Fund</option>
                <option value="Travel">Travel</option>
                <option value="Home Purchase">Home Purchase</option>
                <option value="Education">Education</option>
                <option value="Investment">Investment</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Spending preferences */}
        <div>
          <Label>Spending Preferences</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            <div>
              <Label className="text-sm">Price Range</Label>
              <select
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                onChange={(e) =>
                  onUpdate({ priceRangePreference: e.target.value })
                }
              >
                <option value="budget">Budget-friendly</option>
                <option value="mid_range">Mid-range</option>
                <option value="premium">Premium</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
            <div>
              <Label className="text-sm">Payment Methods</Label>
              <div className="space-y-1">
                {["Alipay", "WeChat Pay", "Credit Card", "Cash"].map(
                  (method) => (
                    <label key={method} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          const currentMethods =
                            profile?.financialSettings?.paymentMethods || [];
                          const newMethods = e.target.checked
                            ? [...currentMethods, method]
                            : currentMethods.filter(
                                (m: string) => m !== method
                              );
                          onUpdate({ paymentMethods: newMethods });
                        }}
                      />
                      <span className="text-sm">{method}</span>
                    </label>
                  )
                )}
              </div>
            </div>
            <div>
              <Label className="text-sm">Data Sharing</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      onUpdate({ showIncomeInReports: e.target.checked })
                    }
                  />
                  <span className="text-sm">Show income in reports</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      onUpdate({ shareFinancialData: e.target.checked })
                    }
                  />
                  <span className="text-sm">Share financial data</span>
                </label>
              </div>
            </div>
            <div>
              <Label className="text-sm">Currency</Label>
              <select
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                onChange={(e) => onUpdate({ currency: e.target.value })}
              >
                <option value="CNY">Chinese Yuan (¥)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="JPY">Japanese Yen (¥)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Smart suggestions */}
        {monthlyIncome > 0 && monthlyBudget > 0 && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="font-medium">Smart Suggestions</span>
            </div>
            <div className="space-y-2 text-sm">
              {monthlyBudget > monthlyIncome * 0.8 && (
                <p className="text-yellow-600">
                  ⚠️ Budget is relatively high as % of income, consider keeping
                  it under 80%
                </p>
              )}
              {totalAllocated > monthlyBudget && (
                <p className="text-red-600">
                  ❌ Budget allocation exceeds total, please adjust expenses
                </p>
              )}
              {monthlyIncome > 0 && monthlyBudget < monthlyIncome * 0.3 && (
                <p className="text-green-600">
                  ✅ Budget is reasonable with good savings room
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialSettingsSection;
