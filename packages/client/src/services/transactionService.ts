import {
  Transaction,
  CreateTransactionRequest,
  VoucherUploadResponse,
  TransactionStats,
  TransactionFilters,
  BulkVoucherResult,
  Voucher,
} from "@/types/transaction";

/**
 * Transaction Service - Frontend API client for transaction and voucher operations
 * Handles both manual transaction creation and AI-powered receipt processing
 */
class TransactionService {
  private static readonly API_BASE = import.meta.env.VITE_API_URL || "";

  /**
   * Create a new manual transaction
   * @param transactionData - Transaction data to create
   * @param token - Authentication token
   * @returns Promise with created transaction
   */
  static async createTransaction(
    transactionData: CreateTransactionRequest,
    token: string
  ): Promise<{ message: string; transaction: Transaction }> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-auth-token": token,
    };

    console.log("🔍 Creating transaction:", transactionData);

    const response = await fetch(`${this.API_BASE}/api/transactions`, {
      method: "POST",
      headers,
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      console.error("❌ Transaction creation error - Status:", response.status);

      let errorMessage = "Failed to create transaction";
      try {
        const error = await response.json();
        console.error("❌ Transaction creation error - Response:", error);
        errorMessage = error.error || error.message || errorMessage;
      } catch (parseError) {
        console.error("❌ Could not parse error response:", parseError);
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("✅ Transaction created successfully:", result.transaction.id);
    return result;
  }

  /**
   * Upload and process a receipt with AI
   * @param file - Receipt image file
   * @param token - Authentication token
   * @param options - Processing options
   * @returns Promise with voucher and transaction data
   */
  static async uploadReceipt(
    file: File,
    token: string,
    options: { createTransaction?: boolean } = { createTransaction: false }
  ): Promise<VoucherUploadResponse> {
    const formData = new FormData();
    formData.append("receipt", file);

    const headers: Record<string, string> = {
      "x-auth-token": token,
    };

    console.log("🔍 Uploading receipt:", file.name, "Size:", file.size);

    const response = await fetch(
      `${this.API_BASE}/api/transactions/vouchers/upload`,
      {
        method: "POST",
        headers,
        body: formData,
      }
    );

    if (!response.ok) {
      console.error("❌ Receipt upload error - Status:", response.status);

      let errorMessage = "Failed to process receipt";
      try {
        const error = await response.json();
        console.error("❌ Receipt upload error - Response:", error);
        errorMessage = error.error || error.message || errorMessage;
      } catch (parseError) {
        console.error("❌ Could not parse error response:", parseError);
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("✅ Receipt processed successfully:", {
      voucherId: result.voucher.id,
      transactionId: result.transaction?.id,
      merchant: result.parsedData.merchant,
      amount: result.parsedData.total_amount,
    });

    return result;
  }

  /**
   * Get all transactions for the authenticated user
   * @param token - Authentication token
   * @param filters - Optional filters for transactions
   * @returns Promise with array of transactions
   */
  static async getUserTransactions(
    token: string,
    filters: TransactionFilters = {}
  ): Promise<{ transactions: Transaction[]; count: number; userId: number }> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-auth-token": token,
    };

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (filters.category) queryParams.append("category", filters.category);
    if (filters.startDate) queryParams.append("startDate", filters.startDate);
    if (filters.endDate) queryParams.append("endDate", filters.endDate);
    if (filters.limit) queryParams.append("limit", filters.limit.toString());
    if (filters.offset) queryParams.append("offset", filters.offset.toString());

    const queryString = queryParams.toString();
    const url = `${this.API_BASE}/api/transactions${
      queryString ? `?${queryString}` : ""
    }`;

    console.log("🔍 Fetching user transactions from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      console.error("❌ Fetch transactions error - Status:", response.status);

      let errorMessage = "Failed to fetch transactions";
      try {
        const error = await response.json();
        console.error("❌ Fetch transactions error - Response:", error);
        errorMessage = error.error || error.message || errorMessage;
      } catch (parseError) {
        console.error("❌ Could not parse error response:", parseError);
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log(
      "✅ Fetched transactions successfully:",
      result.count,
      "transactions"
    );
    return result;
  }

  /**
   * Get transaction statistics for the authenticated user
   * @param token - Authentication token
   * @param options - Optional date range for statistics
   * @returns Promise with transaction statistics
   */
  static async getTransactionStats(
    token: string,
    options: { startDate?: string; endDate?: string } = {}
  ): Promise<{ stats: TransactionStats }> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-auth-token": token,
    };

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (options.startDate) queryParams.append("startDate", options.startDate);
    if (options.endDate) queryParams.append("endDate", options.endDate);

    const queryString = queryParams.toString();
    const url = `${this.API_BASE}/api/transactions/stats${
      queryString ? `?${queryString}` : ""
    }`;

    console.log("🔍 Fetching transaction stats from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      console.error("❌ Fetch stats error - Status:", response.status);

      let errorMessage = "Failed to fetch transaction statistics";
      try {
        const error = await response.json();
        console.error("❌ Fetch stats error - Response:", error);
        errorMessage = error.error || error.message || errorMessage;
      } catch (parseError) {
        console.error("❌ Could not parse error response:", parseError);
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("✅ Fetched transaction stats successfully");
    return result;
  }

  /**
   * Get all vouchers for the authenticated user
   * @param token - Authentication token
   * @param options - Optional filters
   * @returns Promise with array of vouchers
   */
  static async getUserVouchers(
    token: string,
    options: {
      limit?: number;
      offset?: number;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<{ vouchers: Voucher[]; count: number; userId: number }> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-auth-token": token,
    };

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (options.limit) queryParams.append("limit", options.limit.toString());
    if (options.offset) queryParams.append("offset", options.offset.toString());
    if (options.startDate) queryParams.append("startDate", options.startDate);
    if (options.endDate) queryParams.append("endDate", options.endDate);

    const queryString = queryParams.toString();
    const url = `${this.API_BASE}/api/transactions/vouchers${
      queryString ? `?${queryString}` : ""
    }`;

    console.log("🔍 Fetching user vouchers from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      console.error("❌ Fetch vouchers error - Status:", response.status);

      let errorMessage = "Failed to fetch vouchers";
      try {
        const error = await response.json();
        console.error("❌ Fetch vouchers error - Response:", error);
        errorMessage = error.error || error.message || errorMessage;
      } catch (parseError) {
        console.error("❌ Could not parse error response:", parseError);
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("✅ Fetched vouchers successfully:", result.count, "vouchers");
    return result;
  }

  /**
   * Update a transaction
   * @param transactionId - ID of transaction to update
   * @param updateData - Data to update (only valid database fields)
   * @param token - Authentication token
   * @returns Promise with updated transaction
   */
  static async updateTransaction(
    transactionId: number,
    updateData: Partial<CreateTransactionRequest>,
    token: string
  ): Promise<{ message: string; transaction: Transaction }> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-auth-token": token,
    };

    console.log("🔍 Updating transaction:", transactionId, updateData);

    const response = await fetch(
      `${this.API_BASE}/api/transactions/${transactionId}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      console.error("❌ Transaction update error - Status:", response.status);

      let errorMessage = "Failed to update transaction";
      try {
        const error = await response.json();
        console.error("❌ Transaction update error - Response:", error);
        errorMessage = error.error || error.message || errorMessage;
      } catch (parseError) {
        console.error("❌ Could not parse error response:", parseError);
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("✅ Transaction updated successfully:", result.transaction.id);
    return result;
  }

  /**
   * Delete a transaction
   * @param transactionId - ID of transaction to delete
   * @param token - Authentication token
   * @returns Promise with success message
   */
  static async deleteTransaction(
    transactionId: number,
    token: string
  ): Promise<{ message: string }> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-auth-token": token,
    };

    console.log("🔍 Deleting transaction:", transactionId);

    const response = await fetch(
      `${this.API_BASE}/api/transactions/${transactionId}`,
      {
        method: "DELETE",
        headers,
      }
    );

    if (!response.ok) {
      console.error("❌ Transaction deletion error - Status:", response.status);

      let errorMessage = "Failed to delete transaction";
      try {
        const error = await response.json();
        console.error("❌ Transaction deletion error - Response:", error);
        errorMessage = error.error || error.message || errorMessage;
      } catch (parseError) {
        console.error("❌ Could not parse error response:", parseError);
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("✅ Transaction deleted successfully");
    return result;
  }
}

export default TransactionService;
