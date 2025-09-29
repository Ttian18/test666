/**
 * API Service - General API client for reports and analytics
 * Handles spending summaries, categories, merchants, and chart data
 */
class ApiService {
    private static readonly API_BASE = import.meta.env.VITE_API_URL || "";
  
    /**
     * Get spending summary for reports
     * @param options - Query options
     * @returns Promise with spending summary data
     */
    static async getSpendingSummary(options: {
      period?: string;
      category?: string;
      user_id?: number;
    }): Promise<{
      total_spent: number;
      transaction_count: number;
      categories: Array<{
        category: string;
        amount: number;
        count: number;
        percentage: number;
      }>;
      transaction_category_breakdown: Record<string, number>;
      merchant_category_breakdown: Record<string, number>;
      trend: number[];
      trend_labels: string[];
    }> {
      const queryParams = new URLSearchParams();
      if (options.period) queryParams.append("period", options.period);
      if (options.category && options.category !== "all")
        queryParams.append("category", options.category);
  
      const queryString = queryParams.toString();
      const url = `${this.API_BASE}/api/insights/summary${
        queryString ? `?${queryString}` : ""
      }`;
  
      console.log("🔍 Fetching spending summary from:", url);
      console.log("🔍 Category parameter:", options.category);
      console.log("🔍 API_BASE:", this.API_BASE);
  
      // Get auth token from localStorage
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
  
      if (token) {
        headers["x-auth-token"] = token;
      }
  
      const response = await fetch(url, {
        method: "GET",
        headers,
      });
  
      if (!response.ok) {
        console.error(
          "❌ Fetch spending summary error - Status:",
          response.status
        );
        console.error("❌ Response:", await response.text());
        throw new Error(`Failed to fetch spending summary: ${response.status}`);
      }
  
      const result = await response.json();
  
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch spending summary");
      }
  
      const data = result.data;
      const summary = data.summary;
      const periodBreakdown = data.periodBreakdown || [];
  
      // Transform insights data into expected format
      const totalSpent = summary.totalAmount || 0;
      const transactionCount = summary.totalTransactions || 0;
  
      // Get category data from insights
      // If a specific category is selected, get all categories for context in dropdown
      // If "all" is selected, get all categories normally
      const categoryResponse = await this.getCategoryAnalysis("");
      const allCategories = categoryResponse.categories.map((cat: any) => ({
        category: cat.category,
        amount: cat.totalAmount,
        count: cat.transactionCount,
        percentage: cat.percentage,
      }));
  
      // Create transaction_category_breakdown for the frontend
      const transactionCategoryBreakdown: Record<string, number> = {};
      const merchantCategoryBreakdown: Record<string, number> = {};
  
      // If a specific category is selected, only show that category's data in the breakdown
      if (options.category && options.category !== "all") {
        // For filtered view, only show the selected category
        transactionCategoryBreakdown[options.category] = totalSpent;
        merchantCategoryBreakdown[options.category] = totalSpent;
      } else {
        // For "all" view, show all categories
        allCategories.forEach((cat: any) => {
          transactionCategoryBreakdown[cat.category] = cat.amount;
          merchantCategoryBreakdown[cat.category] = cat.amount;
        });
      }
  
      // Create trend data from period breakdown
      const trendLabels = periodBreakdown.map((period: any) => period.period);
      const trendValues = periodBreakdown.map(
        (period: any) => period.totalAmount
      );
  
      // Return appropriate categories based on filter
      const categoriesToReturn =
        options.category && options.category !== "all"
          ? [
              {
                category: options.category,
                amount: totalSpent,
                count: transactionCount,
                percentage: 100,
              },
            ]
          : allCategories;
  
      const finalResult = {
        total_spent: totalSpent,
        transaction_count: transactionCount,
        categories: categoriesToReturn,
        transaction_category_breakdown: transactionCategoryBreakdown,
        merchant_category_breakdown: merchantCategoryBreakdown,
        trend: trendValues,
        trend_labels: trendLabels,
      };
  
      console.log("✅ Fetched spending summary successfully");
      console.log("🔍 Final result:", finalResult);
      return finalResult;
    }
  
    /**
     * Get category analysis from insights
     */
    static async getCategoryAnalysis(queryString: string = ""): Promise<{
      categories: Array<{
        category: string;
        totalAmount: number;
        transactionCount: number;
        percentage: number;
      }>;
    }> {
      const url = `${this.API_BASE}/api/insights/categories${queryString}`;
  
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
  
      if (token) {
        headers["x-auth-token"] = token;
      }
  
      const response = await fetch(url, {
        method: "GET",
        headers,
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch category analysis");
      }
  
      const result = await response.json();
      return result.success ? result.data : { categories: [] };
    }
  
    /**
     * Get available categories
     * @returns Promise with categories data
     */
    static async getCategories(): Promise<{
      predefined_categories: string[];
      user_categories: string[];
    }> {
      const url = `${this.API_BASE}/api/transactions/categories`;
  
      console.log("🔍 Fetching categories from:", url);
  
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        console.error("❌ Fetch categories error - Status:", response.status);
        throw new Error("Failed to fetch categories");
      }
  
      const result = await response.json();
      console.log("✅ Fetched categories successfully");
  
      return {
        predefined_categories: result.categories || [],
        user_categories: result.categories || [],
      };
    }
  
    /**
     * Get top merchants
     * @param options - Query options
     * @returns Promise with merchants data
     */
    static async getMerchants(options: {
      period?: string;
      limit?: number;
      user_id?: number;
      category?: string;
    }): Promise<{
      merchants: Array<{
        merchant: string;
        amount: number;
        count: number;
      }>;
      top_merchants: Array<{
        merchant: string;
        amount: number;
        count: number;
      }>;
    }> {
      const queryParams = new URLSearchParams();
      if (options.limit) queryParams.append("limit", options.limit.toString());
      if (options.category && options.category !== "all")
        queryParams.append("category", options.category);
  
      const queryString = queryParams.toString();
      const url = `${this.API_BASE}/api/insights/merchants${
        queryString ? `?${queryString}` : ""
      }`;
  
      console.log("🔍 Fetching merchants from:", url);
  
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
  
      if (token) {
        headers["x-auth-token"] = token;
      }
  
      const response = await fetch(url, {
        method: "GET",
        headers,
      });
  
      if (!response.ok) {
        console.error("❌ Fetch merchants error - Status:", response.status);
        throw new Error("Failed to fetch merchants");
      }
  
      const result = await response.json();
  
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch merchants");
      }
  
      const merchants = result.data.merchants.map((m: any) => ({
        merchant: m.merchant,
        total_spent: m.totalAmount,
        amount: m.totalAmount,
        count: m.transactionCount,
      }));
  
      console.log("✅ Fetched merchants successfully");
      return {
        merchants,
        top_merchants: merchants, // Frontend expects top_merchants
      };
    }
  
    /**
     * Get chart data for reports
     * @param options - Query options
     * @returns Promise with chart data
     */
    static async getChartData(options: {
      period?: string;
      category?: string;
      user_id?: number;
    }): Promise<{
      daily: Array<{ date: string; amount: number }>;
      monthly: Array<{ month: string; amount: number }>;
      categories: Array<{ category: string; amount: number }>;
    }> {
      const queryParams = new URLSearchParams();
      if (options.period) queryParams.append("period", options.period);
      if (options.category && options.category !== "all")
        queryParams.append("category", options.category);
  
      const queryString = queryParams.toString();
      const url = `${this.API_BASE}/api/insights/trends${
        queryString ? `?${queryString}` : ""
      }`;
  
      console.log("🔍 Fetching chart data from:", url);
  
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
  
      if (token) {
        headers["x-auth-token"] = token;
      }
  
      const response = await fetch(url, {
        method: "GET",
        headers,
      });
  
      if (!response.ok) {
        console.error("❌ Fetch chart data error - Status:", response.status);
        throw new Error("Failed to fetch chart data");
      }
  
      const result = await response.json();
  
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch chart data");
      }
  
      const trendData = result.data.periodData || [];
  
      // Transform trend data into chart format
      const daily: Array<{ date: string; amount: number }> = [];
      const monthly: Array<{ month: string; amount: number }> = [];
  
      trendData.forEach((item: any) => {
        if (options.period === "daily") {
          daily.push({
            date: item.period,
            amount: item.totalAmount,
          });
        } else {
          monthly.push({
            month: item.period,
            amount: item.totalAmount,
          });
        }
      });
  
      // Get category data
      const categoryResponse = await this.getCategoryAnalysis();
      const categories = categoryResponse.categories.map((cat: any) => ({
        category: cat.category,
        amount: cat.totalAmount,
      }));
  
      console.log("✅ Fetched chart data successfully");
      return { daily, monthly, categories };
    }
  }
  
  export const apiService = ApiService;
  export default ApiService;
  