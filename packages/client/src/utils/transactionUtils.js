import {
  TransactionCategories,
  MerchantCategories,
} from "../types/transaction.js";

// Format currency amounts
export const formatCurrency = (amount, currency = "USD") => {
  if (amount == null || amount === "") return "—";

  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return "—";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(numAmount);
};

// Format dates
export const formatDate = (dateString) => {
  if (!dateString) return "—";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return "—";
  }
};

// Format date for input fields (YYYY-MM-DD)
export const formatDateForInput = (dateString) => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    return date.toISOString().split("T")[0];
  } catch (error) {
    return "";
  }
};

// Get status badge for voucher
export const getVoucherStatus = (parsedData) => {
  if (!parsedData || Object.keys(parsedData).length === 0) {
    return { text: "pending", className: "chip--muted" };
  }

  return { text: "processed", className: "chip--ok" };
};

// Validate file upload
export const validateFile = (file) => {
  if (!file) return "No file selected";

  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "image/gif",
    "image/bmp",
    "image/tiff",
  ];

  if (file.size > maxSize) {
    return "File size must be less than 10MB";
  }

  if (!allowedTypes.includes(file.type)) {
    return "File type not supported. Please use JPG, PNG, WEBP, HEIC, GIF, BMP, or TIFF";
  }

  return null;
};

// Get category options for dropdown
export const getCategoryOptions = () => {
  return Object.entries(TransactionCategories).map(([key, value]) => ({
    value: value,
    label: value,
  }));
};

// Get merchant category options for dropdown
export const getMerchantCategoryOptions = () => {
  return Object.entries(MerchantCategories).map(([key, value]) => ({
    value: value,
    label: value,
  }));
};

// Parse receipt items for display
export const parseReceiptItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  return items.map((item) => ({
    name: item.name || "Unknown Item",
    quantity: item.quantity || 1,
    unit_price: item.unit_price || 0,
    line_total: item.line_total || 0,
    item_category: item.item_category || "Others",
  }));
};

// Calculate receipt totals
export const calculateReceiptTotals = (parsedData) => {
  if (!parsedData) return null;

  const items = parseReceiptItems(parsedData.items);
  const subtotal = items.reduce((sum, item) => sum + (item.line_total || 0), 0);
  const tax = parsedData.tax_amount || 0;
  const total = parsedData.total_amount || subtotal + tax;

  return {
    subtotal,
    tax,
    total,
    itemCount: items.length,
  };
};

// Format receipt details for display
export const formatReceiptDetails = (parsedData) => {
  if (!parsedData) return null;

  const totals = calculateReceiptTotals(parsedData);
  const items = parseReceiptItems(parsedData.items);

  return {
    merchant: parsedData.merchant || "Unknown Merchant",
    address: parsedData.merchant_address || "No address",
    phone: parsedData.merchant_phone || "No phone",
    date: formatDate(parsedData.date),
    time: parsedData.time || "No time",
    receiptNumber: parsedData.receipt_number || "No receipt number",
    paymentMethod: parsedData.payment_method || "Unknown",
    currency: parsedData.currency || "USD",
    items,
    totals,
    notes: parsedData.notes || "",
  };
};

// Generate summary statistics
export const generateTransactionStats = (transactions) => {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return {
      totalSpent: 0,
      transactionCount: 0,
      averageAmount: 0,
      categoryBreakdown: {},
      monthlyBreakdown: {},
    };
  }

  const totalSpent = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const transactionCount = transactions.length;
  const averageAmount = totalSpent / transactionCount;

  // Category breakdown
  const categoryBreakdown = transactions.reduce((acc, t) => {
    const category = t.category || "Others";
    acc[category] = (acc[category] || 0) + (t.amount || 0);
    return acc;
  }, {});

  // Monthly breakdown
  const monthlyBreakdown = transactions.reduce((acc, t) => {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    acc[monthKey] = (acc[monthKey] || 0) + (t.amount || 0);
    return acc;
  }, {});

  return {
    totalSpent,
    transactionCount,
    averageAmount,
    categoryBreakdown,
    monthlyBreakdown,
  };
};

// Sort transactions by various criteria
export const sortTransactions = (
  transactions,
  sortBy = "date",
  sortOrder = "desc"
) => {
  if (!Array.isArray(transactions)) return [];

  const sorted = [...transactions].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case "date":
        aValue = new Date(a.date);
        bValue = new Date(b.date);
        break;
      case "amount":
        aValue = a.amount || 0;
        bValue = b.amount || 0;
        break;
      case "merchant":
        aValue = (a.merchant || "").toLowerCase();
        bValue = (b.merchant || "").toLowerCase();
        break;
      case "category":
        aValue = (a.category || "").toLowerCase();
        bValue = (b.category || "").toLowerCase();
        break;
      default:
        aValue = new Date(a.date);
        bValue = new Date(b.date);
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return sorted;
};

// Filter transactions
export const filterTransactions = (transactions, filters = {}) => {
  if (!Array.isArray(transactions)) return [];

  return transactions.filter((transaction) => {
    // Date range filter
    if (filters.startDate) {
      const transactionDate = new Date(transaction.date);
      const startDate = new Date(filters.startDate);
      if (transactionDate < startDate) return false;
    }

    if (filters.endDate) {
      const transactionDate = new Date(transaction.date);
      const endDate = new Date(filters.endDate);
      if (transactionDate > endDate) return false;
    }

    // Amount range filter
    if (filters.minAmount && transaction.amount < filters.minAmount) {
      return false;
    }

    if (filters.maxAmount && transaction.amount > filters.maxAmount) {
      return false;
    }

    // Category filter
    if (filters.category && transaction.category !== filters.category) {
      return false;
    }

    // Merchant filter
    if (filters.merchant) {
      const merchantLower = (transaction.merchant || "").toLowerCase();
      const filterLower = filters.merchant.toLowerCase();
      if (!merchantLower.includes(filterLower)) return false;
    }

    return true;
  });
};
