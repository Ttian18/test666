// Transaction-related type definitions and interfaces

export const TransactionCategories = {
  FOOD_DINING: "Food & Dining",
  TRANSPORTATION: "Transportation",
  SHOPPING: "Shopping",
  ENTERTAINMENT: "Entertainment",
  HEALTHCARE: "Healthcare",
  UTILITIES: "Utilities",
  HOUSING: "Housing",
  EDUCATION: "Education",
  TRAVEL: "Travel",
  OTHER: "Others",
};

export const TransactionSources = {
  MANUAL: "manual",
  VOUCHER: "voucher",
  IMPORT: "import",
  API: "api",
};

export const PaymentMethods = {
  CASH: "cash",
  CREDIT_CARD: "credit_card",
  DEBIT_CARD: "debit_card",
  BANK_TRANSFER: "bank_transfer",
  DIGITAL_WALLET: "digital_wallet",
  CHECK: "check",
  OTHER: "other",
};

// Transaction entity interface
export const TransactionInterface = {
  id: "number",
  userId: "number",
  date: "Date",
  amount: "number",
  category: "string",
  merchant: "string",
  source: "string",
  receiptImg: "string",
  merchantCategory: "string",
  createdAt: "Date",
  updatedAt: "Date",
};

// Voucher entity interface
export const VoucherInterface = {
  id: "number",
  userId: "number",
  imagePath: "string",
  parsedData: "object",
  timestamp: "Date",
  createdAt: "Date",
  updatedAt: "Date",
};

// Receipt item interface
export const ReceiptItemInterface = {
  name: "string",
  quantity: "number",
  unitPrice: "number",
  lineTotal: "number",
  itemCategory: "string",
};

// Parsed receipt data interface
export const ParsedReceiptInterface = {
  date: "string",
  time: "string",
  merchant: "string",
  merchantAddress: "string",
  merchantPhone: "string",
  items: "array",
  subtotal: "number",
  taxAmount: "number",
  totalAmount: "number",
  currency: "string",
  paymentMethod: "string",
  receiptNumber: "string",
  notes: "string",
  category: "string",
  merchantCategory: "string",
  transactionCategory: "string",
};

// Transaction creation request interface
export const TransactionCreateRequestInterface = {
  userId: "number",
  date: "Date",
  amount: "number",
  category: "string",
  merchant: "string",
  source: "string",
  receiptImg: "string",
  merchantCategory: "string",
};

// Voucher upload request interface
export const VoucherUploadRequestInterface = {
  userId: "number",
  imageFile: "File",
  parsedData: "object",
};

// Transaction statistics interface
export const TransactionStatsInterface = {
  totalAmount: "number",
  totalCount: "number",
  averageAmount: "number",
  categoryBreakdown: "array",
  monthlyTrend: "array",
  topMerchants: "array",
};

// Insights response interface
export const InsightsResponseInterface = {
  summary: "object",
  categories: "array",
  trends: "array",
  recommendations: "array",
};
