import { useState } from "react";
import { TrendingUp, Calendar, Filter, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TopNavigation from "@/components/TopNavigation";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const Reports = () => {
  const [timeframe, setTimeframe] = useState("Month");

  const categoryData = [
    { name: "Food & Dining", value: 450, color: "#8B5CF6" },
    { name: "Transportation", value: 320, color: "#10B981" },
    { name: "Shopping", value: 280, color: "#F59E0B" },
    { name: "Entertainment", value: 190, color: "#EF4444" },
  ];

  const dailyData = [
    { day: "Mon", amount: 60 },
    { day: "Tue", amount: 45 },
    { day: "Wed", amount: 80 },
    { day: "Thu", amount: 120 },
    { day: "Fri", amount: 150 },
    { day: "Sat", amount: 180 },
    { day: "Sun", amount: 90 },
  ];

  const totalSpent = 1240;
  const budgetProgress = [
    { category: "Food & Dining", spent: 450, budget: 585, color: "#8B5CF6" },
    { category: "Transportation", spent: 320, budget: 416, color: "#10B981" },
    { category: "Shopping", spent: 280, budget: 364, color: "#F59E0B" },
    { category: "Entertainment", spent: 190, budget: 247, color: "#EF4444" },
  ];

  const recentExpenses = [
    {
      name: "Fresh Market Cafe",
      category: "Food & Dining",
      amount: 67.5,
      change: "+12%",
    },
    { name: "Uber", category: "Transportation", amount: 45.3, change: "-5%" },
    { name: "Amazon", category: "Shopping", amount: 89.99, change: "+23%" },
    { name: "Netflix", category: "Entertainment", amount: 15.99, change: "0%" },
  ];

  return (
    <div className="page-background-reports">
      <TopNavigation />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Spending Reports
            </h1>
            <p className="text-muted-foreground">Your financial insights</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {["Week", "Month", "Year"].map((period) => (
                <Button
                  key={period}
                  variant={timeframe === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe(period)}
                  className={
                    timeframe === period ? "bg-primary text-white" : ""
                  }
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="themed-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold text-expense">
                    ${totalSpent}
                  </p>
                </div>
                <div className="text-expense">$</div>
              </div>
            </CardContent>
          </Card>

          <Card className="themed-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">vs Last Month</p>
                  <p className="text-2xl font-bold text-success">-8%</p>
                </div>
                <div className="text-success">
                  <TrendingDown size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="themed-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold text-primary">$403</p>
                </div>
                <div className="text-primary">📅</div>
              </div>
            </CardContent>
          </Card>

          <Card className="themed-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Daily</p>
                  <p className="text-2xl font-bold text-warning">$57.60</p>
                </div>
                <div className="text-warning">📊</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Spending by Category */}
          <Card className="themed-card">
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                {categoryData.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <span className="font-bold">${category.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Spending This Week */}
          <Card className="themed-card">
            <CardHeader>
              <CardTitle>Daily Spending This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="amount"
                      fill="#8B5CF6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
          {/* Recent Expenses */}
          <Card className="themed-card">
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentExpenses.map((expense, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <p className="font-semibold">{expense.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {expense.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${expense.amount}</p>
                      <p
                        className={`text-xs ${
                          expense.change.startsWith("+")
                            ? "text-expense"
                            : expense.change.startsWith("-")
                            ? "text-success"
                            : "text-muted-foreground"
                        }`}
                      >
                        {expense.change}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Budget Progress */}
          <Card className="themed-card">
            <CardHeader>
              <CardTitle>Budget Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {budgetProgress.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{item.category}</span>
                      <span className="font-semibold">
                        ${item.spent} / ${item.budget}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            (item.spent / item.budget) * 100,
                            100
                          )}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;
