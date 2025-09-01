// Transaction and Voucher Type Definitions
// Matches backend Prisma models and service interfaces

export interface Transaction {
  id: number;
  user_id: number;
  date: string;
  amount: number;
  category: string;
  merchant: string;
  source: "manual" | "voucher";
  receipt_img?: string | null;
  merchant_category?: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

export interface CreateTransactionRequest {
  date: string;
  amount: number;
  category: string;
  merchant: string;
  source: "manual" | "voucher";
  receipt_img?: string;
  merchant_category?: string;
}

export interface Voucher {
  id: number;
  user_id: number;
  image_path: string;
  parsed_data: ParsedReceiptData;
  timestamp: string;
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

export interface ParsedReceiptData {
  date: string;
  time: string;
  merchant: string;
  total_amount: number;
  tax_amount: number;
  items: ReceiptItem[];
  payment_method: string;
  transaction_id?: string;
  merchant_category?: string;
  transaction_category?: string;
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

export interface VoucherUploadResponse {
  message: string;
  voucher: Voucher;
  transaction?: Transaction;
  parsedData: ParsedReceiptData;
}

export interface TransactionStats {
  totalTransactions: number;
  totalAmount: number;
  averageAmount: number;
  categoryBreakdown: CategoryBreakdown[];
}

export interface CategoryBreakdown {
  category: string;
  totalAmount: number;
  transactionCount: number;
}

export interface TransactionFilters {
  category?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface BulkVoucherResult {
  successful: number;
  failed: number;
  results: Array<{
    filename: string;
    success: boolean;
    voucher_id?: number;
    transaction_id?: number;
    parsed_data?: ParsedReceiptData;
  }>;
  errors: Array<{
    filename: string;
    error: string;
  }>;
}
