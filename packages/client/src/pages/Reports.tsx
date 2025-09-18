import { useState, useEffect } from "react";
import {
  TrendingUp,
  Calendar,
  Filter,
  TrendingDown,
  Loader2,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
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
  LineChart,
  Line,
} from "recharts";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";

const Reports = () => {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [timeframe, setTimeframe] = useState("monthly");
  const [category, setCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [merchantsData, setMerchantsData] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [dataKey, setDataKey] = useState(0); // Force re-render key
  const [displayValues, setDisplayValues] = useState({
    totalSpent: 0,
    transactionCount: 0,
    currentCategory: "all",
  });

  useEffect(() => {
    loadCategories();
  }, [timeframe, user?.id]);

  useEffect(() => {
    console.log("🔍 useEffect triggered - category changed to:", category);
    loadReportData();
  }, [timeframe, category]);

  const loadCategories = async () => {
    try {
      // Get categories from user's actual spending data instead of predefined list
      const response = await apiService.getSpendingSummary({
        period: timeframe,
        user_id: user?.id || 1,
      });

      if (response?.transaction_category_breakdown) {
        // Extract categories from user's spending data and sort by spending amount (highest to lowest)
        const userCategories = Object.entries(
          response.transaction_category_breakdown
        )
          .filter(
            ([category, amount]) =>
              category && category.trim() !== "" && Number(amount) > 0
          )
          .sort(([_, a], [__, b]) => Number(b) - Number(a)) // Sort by amount descending
          .map(([category, _]) => category); // Extract just the category names

        setAvailableCategories(userCategories);
        console.log("User's actual categories:", userCategories);
      } else {
        // Fallback to predefined categories if no user data
        const fallbackResponse = await apiService.getCategories();
        const fallbackCategories = fallbackResponse.predefined_categories || [];
        setAvailableCategories(fallbackCategories);
        console.log("Using fallback categories:", fallbackCategories);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
      // Set some default categories as fallback - match the schema
      setAvailableCategories([
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
        "Other",
      ]);
    }
  };

  const loadReportData = async () => {
    setIsLoading(true);
    try {
      const userId = 1; // TODO: Get from auth context

      console.log("🔍 Loading report data with category:", category);
      console.log("🔍 Loading report data with timeframe:", timeframe);

      // Test API call directly
      const testUrl = `http://localhost:5001/api/insights/summary${
        category !== "all" ? `?category=${encodeURIComponent(category)}` : ""
      }`;
      console.log("🔍 Test URL would be:", testUrl);

      // Load summary data
      const summaryResponse = await apiService.getSpendingSummary({
        period: timeframe,
        category: category,
        user_id: userId,
      });
      // Clear previous data first to force re-render
      setSummaryData(null);
      setMerchantsData(null);
      setChartData(null);

      // Set new data
      setSummaryData({ ...summaryResponse }); // Spread to ensure new object reference
      console.log("🔍 Summary data received:", summaryResponse);

      // Load merchants data
      const merchantsResponse = await apiService.getMerchants({
        period: timeframe,
        limit: 10,
        user_id: userId,
        category: category,
      });
      setMerchantsData({ ...merchantsResponse }); // Spread to ensure new object reference
      console.log("🔍 Merchants data received:", merchantsResponse);

      // Load chart data
      const chartResponse = await apiService.getChartData({
        period: timeframe,
        category: category,
        chart_type: "spending",
        user_id: userId,
      });
      setChartData({ ...chartResponse }); // Spread to ensure new object reference

      // Increment data key to force re-render
      setDataKey((prev) => prev + 1);

      // Update display values directly
      setDisplayValues({
        totalSpent: summaryResponse.total_spent || 0,
        transactionCount: summaryResponse.transaction_count || 0,
        currentCategory: category,
      });
    } catch (error) {
      console.error("Failed to load report data:", error);
      console.error("Error details:", error);
      toast({
        title: "Error",
        description: `Failed to load report data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadReportData();
  };

  // Prepare data for charts with validation
  const prepareCategoryData = () => {
    if (!summaryData?.transaction_category_breakdown) return [];

    // Validate that transaction_category_breakdown is an object
    if (
      typeof summaryData.transaction_category_breakdown !== "object" ||
      summaryData.transaction_category_breakdown === null
    ) {
      console.warn(
        "Invalid transaction_category_breakdown data:",
        summaryData.transaction_category_breakdown
      );
      return [];
    }

    const rawData = Object.entries(summaryData.transaction_category_breakdown);

    const filteredData = rawData.filter(([_, value]) => {
      // Ensure value is a valid number
      const numValue = Number(value);
      return !isNaN(numValue) && numValue > 0;
    });

    const processedData = filteredData
      .map(([category, amount], index) => ({
        name: category || "Unknown",
        value: Number(amount) || 0,
        color: getCategoryColor(category || "Unknown", index),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4); // Only show top 4 spending categories

    return processedData;
  };

  const prepareTrendData = () => {
    if (!summaryData?.trend || !summaryData?.trend_labels) return [];

    // Validate that trend and trend_labels are arrays
    if (
      !Array.isArray(summaryData.trend) ||
      !Array.isArray(summaryData.trend_labels)
    ) {
      console.warn("Invalid trend data:", {
        trend: summaryData.trend,
        trend_labels: summaryData.trend_labels,
      });
      return [];
    }

    // Ensure trend_labels and trend arrays have the same length
    const maxLength = Math.min(
      summaryData.trend_labels.length,
      summaryData.trend.length
    );

    return summaryData.trend_labels
      .slice(0, maxLength)
      .map((label: string, index: number) => {
        const amount = summaryData.trend[index];
        return {
          period: label || `Period ${index + 1}`,
          amount: Number(amount) || 0,
        };
      });
  };

  const prepareMerchantsData = () => {
    // Try top_merchants first, then fall back to merchants
    const merchantsList =
      merchantsData?.top_merchants || merchantsData?.merchants;

    if (!merchantsList) return [];

    // Validate that merchantsList is an array
    if (!Array.isArray(merchantsList)) {
      console.warn("Invalid merchants data:", merchantsList);
      return [];
    }

    return merchantsList
      .filter((merchant: any) => {
        // Ensure merchant has required properties
        return (
          merchant &&
          typeof merchant.merchant === "string" &&
          merchant.merchant.trim() !== ""
        );
      })
      .map((merchant: any) => ({
        merchant: merchant.merchant || "Unknown Merchant",
        amount:
          Number(
            merchant.total_spent || merchant.totalAmount || merchant.amount
          ) || 0,
      }))
      .filter((item) => item.amount > 0); // Only show merchants with spending
  };

  const getCategoryColor = (category: string, index: number) => {
    const colors = [
      "#8B5CF6",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#3B82F6",
      "#06B06D4",
      "#84CC16",
      "#F97316",
      "#EC4899",
      "#6366F1",
    ];
    return colors[index % colors.length];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Validate and prepare data for rendering
  const validateData = () => {
    const errors = [];

    if (!summaryData) {
      errors.push("No summary data available");
    } else {
      if (
        !summaryData.transaction_category_breakdown ||
        typeof summaryData.transaction_category_breakdown !== "object"
      ) {
        errors.push("Invalid transaction category breakdown data");
      }
      if (
        !Array.isArray(summaryData.trend) ||
        !Array.isArray(summaryData.trend_labels)
      ) {
        errors.push("Invalid trend data structure");
      }
      if (
        typeof summaryData.total_spent !== "number" ||
        isNaN(summaryData.total_spent)
      ) {
        errors.push("Invalid total spent amount");
      }
    }

    if (
      !merchantsData ||
      (!Array.isArray(merchantsData.top_merchants) &&
        !Array.isArray(merchantsData.merchants))
    ) {
      errors.push("Invalid merchants data structure");
    }

    if (errors.length > 0) {
      console.warn("Data validation errors:", errors);
    }

    return errors.length === 0;
  };

  const isDataValid = validateData();
  const categoryData = prepareCategoryData();
  const trendData = prepareTrendData();
  const merchantsDataForChart = prepareMerchantsData();

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
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-64">
                <SelectValue>
                  {category === "all" ? "All Categories" : category}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="w-64">
                <SelectItem value="all">
                  <div className="flex items-center justify-between w-full">
                    <span>All Categories</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {summaryData?.transaction_count || 0} transactions
                    </span>
                  </div>
                </SelectItem>
                {availableCategories.map((cat) => {
                  const categoryAmount =
                    summaryData?.transaction_category_breakdown?.[cat] || 0;
                  const percentage =
                    summaryData?.total_spent > 0
                      ? (
                          (categoryAmount / summaryData.total_spent) *
                          100
                        ).toFixed(1)
                      : "0";

                  return (
                    <SelectItem key={cat} value={cat}>
                      <div className="flex items-center justify-between w-full">
                        <span>{cat}</span>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-xs text-muted-foreground">
                            {formatCurrency(categoryAmount)}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({percentage}%)
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              {["daily", "weekly", "monthly", "yearly"].map((period) => (
                <Button
                  key={period}
                  variant={timeframe === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe(period)}
                  className={
                    timeframe === period ? "bg-primary text-white" : ""
                  }
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                console.log("🔍 Direct API test for category:", category);
                try {
                  const response = await fetch(
                    `http://localhost:5001/api/insights/summary${
                      category !== "all"
                        ? `?category=${encodeURIComponent(category)}`
                        : ""
                    }`,
                    {
                      method: "GET",
                      headers: { "Content-Type": "application/json" },
                    }
                  );
                  const data = await response.json();
                  console.log("🔍 Direct API response:", data);
                } catch (error) {
                  console.error("🔍 Direct API error:", error);
                }
              }}
            >
              Test API
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span>Loading reports...</span>
            </div>
          </div>
        ) : !isDataValid ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-muted-foreground mb-2">
                ⚠️ Data validation issues detected
              </div>
              <div className="text-sm text-muted-foreground">
                Check console for details
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Metric Cards */}
            <div
              key={`metrics-${category}-${timeframe}-${dataKey}`}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            >
              <Card className="themed-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Spent
                      </p>
                      <p className="text-2xl font-bold text-expense">
                        {formatCurrency(displayValues.totalSpent)}
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
                      <p className="text-sm text-muted-foreground">
                        Transaction Count
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {displayValues.transactionCount}
                      </p>
                    </div>
                    <div className="text-primary">📊</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="themed-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Period</p>
                      <p className="text-2xl font-bold text-warning">
                        {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                      </p>
                    </div>
                    <div className="text-warning">📅</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="themed-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="text-2xl font-bold text-success">
                        {category === "all" ? "All" : category}
                      </p>
                    </div>
                    <div className="text-success">🏷️</div>
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
                  {categoryData.length > 0 ? (
                    <>
                      <div className="h-56 mb-4">
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
                              minAngle={3}
                            >
                              {categoryData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value) =>
                                formatCurrency(Number(value))
                              }
                              labelFormatter={(label) => `${label}`}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground mb-1">
                          Showing top 4 spending categories
                        </div>
                        {categoryData.map((category, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-1 rounded-lg hover:bg-secondary/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              <span className="font-medium">
                                {category.name}
                              </span>
                            </div>
                            <span className="font-bold">
                              {formatCurrency(category.value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      No category data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Spending Trend */}
              <Card className="themed-card">
                <CardHeader>
                  <CardTitle>Spending Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  {trendData.length > 0 ? (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={trendData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="period"
                            fontSize={11}
                            tick={{ fontSize: 11 }}
                          />
                          <YAxis fontSize={11} tick={{ fontSize: 11 }} />
                          <Tooltip
                            formatter={(value) => formatCurrency(Number(value))}
                          />
                          <Line
                            type="monotone"
                            dataKey="amount"
                            stroke="#8B5CF6"
                            strokeWidth={2}
                            dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      No trend data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
              {/* Top Merchants */}
              <Card className="themed-card">
                <CardHeader>
                  <CardTitle>Top Merchants</CardTitle>
                </CardHeader>
                <CardContent>
                  {merchantsDataForChart.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={merchantsDataForChart}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="merchant"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            fontSize={11}
                            tick={{ fontSize: 11 }}
                          />
                          <YAxis fontSize={11} tick={{ fontSize: 11 }} />
                          <Tooltip
                            formatter={(value) => formatCurrency(Number(value))}
                          />
                          <Bar
                            dataKey="amount"
                            fill="#10B981"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      No merchant data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Merchant Category Breakdown */}
              <Card className="themed-card">
                <CardHeader>
                  <CardTitle>Merchant Category Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {summaryData?.merchant_category_breakdown &&
                  typeof summaryData.merchant_category_breakdown ===
                    "object" ? (
                    <div className="space-y-6">
                      {Object.entries(summaryData.merchant_category_breakdown)
                        .filter(([_, value]) => {
                          const numValue = Number(value);
                          return !isNaN(numValue) && numValue > 0;
                        })
                        .sort(([_, a], [__, b]) => Number(b) - Number(a))
                        .map(([category, amount], index) => (
                          <div key={index}>
                            <div className="flex justify-between mb-2">
                              <span className="font-medium">{category}</span>
                              <span className="font-semibold">
                                {formatCurrency(Number(amount))}
                              </span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.min(
                                    (Number(amount) /
                                      (Number(summaryData.total_spent) || 1)) *
                                      100,
                                    100
                                  )}%`,
                                  backgroundColor: getCategoryColor(
                                    category,
                                    index
                                  ),
                                }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      No merchant category data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
