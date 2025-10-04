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
      label: "餐饮",
      icon: "🍽️",
      color: "bg-red-100 text-red-800",
    },
    {
      key: "groceries",
      label: "食材",
      icon: "🛒",
      color: "bg-green-100 text-green-800",
    },
    {
      key: "entertainment",
      label: "娱乐",
      icon: "🎬",
      color: "bg-purple-100 text-purple-800",
    },
    {
      key: "transportation",
      label: "交通",
      icon: "🚗",
      color: "bg-blue-100 text-blue-800",
    },
    {
      key: "other",
      label: "其他",
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
          财务设置
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 收入信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="monthlyIncome">月收入</Label>
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
                placeholder="请输入月收入"
                className="pl-8"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                ¥
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="incomeSource">收入来源</Label>
            <select
              id="incomeSource"
              className="w-full px-3 py-2 border border-input bg-background rounded-md"
              onChange={(e) => onUpdate({ incomeSource: e.target.value })}
            >
              <option value="salary">工资</option>
              <option value="freelance">自由职业</option>
              <option value="business">创业</option>
              <option value="investment">投资</option>
              <option value="other">其他</option>
            </select>
          </div>
        </div>

        {/* 预算设置 */}
        <div>
          <Label htmlFor="monthlyBudget">月度预算</Label>
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
              placeholder="请输入月度预算"
              className="pl-8"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              ¥
            </span>
          </div>
          {monthlyIncome > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              预算占收入比例:{" "}
              {((monthlyBudget / monthlyIncome) * 100).toFixed(1)}%
            </p>
          )}
        </div>

        {/* 预算分配总览 */}
        {monthlyBudget > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>预算分配</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  已分配: {formatCurrency(totalAllocated)}
                </Badge>
                <Badge variant={remaining >= 0 ? "default" : "destructive"}>
                  {remaining >= 0 ? "剩余" : "超支"}:{" "}
                  {formatCurrency(Math.abs(remaining))}
                </Badge>
              </div>
            </div>

            {/* 进度条 */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>预算使用情况</span>
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

            {/* 详细分配 */}
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

                    {/* 快速设置按钮 */}
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
                        清零
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 储蓄目标 */}
        <div>
          <Label>储蓄目标</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div>
              <Label className="text-sm">目标金额</Label>
              <Input
                type="number"
                placeholder="10000"
                onChange={(e) =>
                  onUpdate({
                    savingsGoals: [
                      {
                        targetAmount: parseFloat(e.target.value) || 0,
                        purpose: "紧急基金",
                        monthlyTarget: 0,
                      },
                    ],
                  })
                }
              />
            </div>
            <div>
              <Label className="text-sm">目标日期</Label>
              <Input
                type="date"
                onChange={(e) =>
                  onUpdate({
                    savingsGoals: [
                      {
                        targetDate: new Date(e.target.value),
                        purpose: "紧急基金",
                        monthlyTarget: 0,
                      },
                    ],
                  })
                }
              />
            </div>
            <div>
              <Label className="text-sm">用途</Label>
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
                <option value="紧急基金">紧急基金</option>
                <option value="旅行">旅行</option>
                <option value="购房">购房</option>
                <option value="教育">教育</option>
                <option value="投资">投资</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>
        </div>

        {/* 消费偏好 */}
        <div>
          <Label>消费偏好</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            <div>
              <Label className="text-sm">价格区间</Label>
              <select
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                onChange={(e) =>
                  onUpdate({ priceRangePreference: e.target.value })
                }
              >
                <option value="budget">经济实惠</option>
                <option value="mid_range">中等价位</option>
                <option value="premium">高端消费</option>
                <option value="luxury">奢华消费</option>
              </select>
            </div>
            <div>
              <Label className="text-sm">支付方式</Label>
              <div className="space-y-1">
                {["支付宝", "微信支付", "信用卡", "现金"].map((method) => (
                  <label key={method} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        const currentMethods =
                          profile?.financialSettings?.paymentMethods || [];
                        const newMethods = e.target.checked
                          ? [...currentMethods, method]
                          : currentMethods.filter((m: string) => m !== method);
                        onUpdate({ paymentMethods: newMethods });
                      }}
                    />
                    <span className="text-sm">{method}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm">数据分享</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      onUpdate({ showIncomeInReports: e.target.checked })
                    }
                  />
                  <span className="text-sm">在报告中显示收入</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      onUpdate({ shareFinancialData: e.target.checked })
                    }
                  />
                  <span className="text-sm">分享财务数据</span>
                </label>
              </div>
            </div>
            <div>
              <Label className="text-sm">货币</Label>
              <select
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                onChange={(e) => onUpdate({ currency: e.target.value })}
              >
                <option value="CNY">人民币 (¥)</option>
                <option value="USD">美元 ($)</option>
                <option value="EUR">欧元 (€)</option>
                <option value="JPY">日元 (¥)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 智能建议 */}
        {monthlyIncome > 0 && monthlyBudget > 0 && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="font-medium">智能建议</span>
            </div>
            <div className="space-y-2 text-sm">
              {monthlyBudget > monthlyIncome * 0.8 && (
                <p className="text-yellow-600">
                  ⚠️ 预算占收入比例较高，建议控制在80%以内
                </p>
              )}
              {totalAllocated > monthlyBudget && (
                <p className="text-red-600">
                  ❌ 预算分配超出总额，请调整各项支出
                </p>
              )}
              {monthlyIncome > 0 && monthlyBudget < monthlyIncome * 0.3 && (
                <p className="text-green-600">
                  ✅ 预算设置合理，有足够的储蓄空间
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
