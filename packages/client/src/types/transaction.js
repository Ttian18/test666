// Transaction and Voucher Types

export const TransactionCategories = {
  FOOD_DINING: "Food & Dining",
  SHOPPING: "Shopping",
  TRANSPORTATION: "Transportation",
  ENTERTAINMENT: "Entertainment",
  HEALTHCARE: "Healthcare",
  UTILITIES: "Utilities",
  TRAVEL: "Travel",
  EDUCATION: "Education",
  OTHERS: "Others",
};

export const MerchantCategories = {
  RESTAURANT: "Restaurant",
  GROCERY: "Grocery",
  RETAIL: "Retail",
  GAS_STATION: "Gas Station",
  PHARMACY: "Pharmacy",
  OTHERS: "Others",
};

// Receipt item structure
export const ReceiptItem = {
  name: String,
  quantity: Number,
  unit_price: Number,
  line_total: Number,
  item_category: String,
};

// Parsed receipt data structure
export const ParsedReceiptData = {
  date: String, // YYYY-MM-DD
  time: String, // HH:MM
  merchant: String,
  merchant_address: String,
  merchant_phone: String,
  items: Array, // Array of ReceiptItem
  subtotal: Number,
  tax_amount: Number,
  total_amount: Number,
  currency: String, // "USD"
  payment_method: String,
  receipt_number: String,
  notes: String,
  category: String, // Transaction category
  merchant_category: String, // Merchant category
};

// Voucher structure
export const Voucher = {
  id: Number,
  user_id: Number,
  image_path: String,
  parsed_data: Object, // ParsedReceiptData
  timestamp: String, // ISO date string
  created_at: String,
  updated_at: String,
};

// Transaction structure
export const Transaction = {
  id: Number,
  user_id: Number,
  date: String, // ISO date string
  amount: Number,
  category: String,
  merchant: String,
  source: String, // "voucher", "manual", etc.
  receipt_img: String,
  merchant_category: String,
  created_at: String,
  updated_at: String,
};

// API Response structures
export const VouchersResponse = {
  vouchers: Array, // Array of Voucher
};

export const TransactionsResponse = {
  transactions: Array, // Array of Transaction
};

export const UploadResponse = {
  message: String,
  voucher_id: Number,
  transaction_id: Number,
  parsed_data: Object, // ParsedReceiptData
  editable_fields: Array, // Array of field names
  database_status: String,
};

export const BulkUploadResponse = {
  message: String,
  results: Array, // Array of upload results
  errors: Array, // Array of error objects
};

export const BulkUploadResult = {
  filename: String,
  voucher_id: Number,
  success: Boolean,
  parsed_data: Object, // ParsedReceiptData
};

export const BulkUploadError = {
  filename: String,
  error: String,
};

export const VoucherUpdateRequest = {
  merchant: String,
  date: String,
  total_amount: Number,
  category: String,
  notes: String,
};

export const VoucherConfirmRequest = {
  category: String,
  notes: String,
};

export const CategoriesResponse = {
  categories: Array, // Array of category strings
};

// Form state types
export const VoucherEditForm = {
  merchant: String,
  date: String,
  total_amount: String, // String for input handling
  category: String,
  notes: String,
};

// UI State types
export const TransactionUIState = {
  txUserId: String,
  receiptFile: File,
  bulkFiles: Array, // Array of Files
  uploadLoading: Boolean,
  bulkLoading: Boolean,
  vouchers: Array, // Array of Voucher
  vouchersLoading: Boolean,
  transactions: Array, // Array of Transaction
  transactionsLoading: Boolean,
  voucherEditId: Number,
  voucherEditForm: Object, // VoucherEditForm
  confirmingVoucherId: Number,
  deletingVoucherId: Number,
};
