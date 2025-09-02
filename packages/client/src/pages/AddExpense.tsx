import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Camera,
  Calendar,
  Tag,
  DollarSign,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Edit,
  Trash2,
  Save,
  X,
  Receipt,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TopNavigation from "@/components/TopNavigation";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import * as Schema from "schema";
import { useAuthContext } from "@/contexts/AuthContext";
import TransactionService from "@/services/transactionService";
import {
  CreateTransactionRequest,
  ParsedReceiptData,
  Transaction,
} from "@/types/transaction";
import { Badge } from "@/components/ui/badge";

const AddExpense = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token, user } = useAuthContext();

  const [expenseData, setExpenseData] = useState({
    amount: "",
    category: "",
    merchant: "",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parsedReceiptData, setParsedReceiptData] =
    useState<ParsedReceiptData | null>(null);
  const [processingStatus, setProcessingStatus] = useState<
    "idle" | "uploading" | "processing" | "completed" | "error"
  >("idle");
  const [showReceiptDetails, setShowReceiptDetails] = useState(false);
  const [voucherId, setVoucherId] = useState<number | null>(null);

  // Transaction list state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [hasLoadedTransactions, setHasLoadedTransactions] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<
    number | null
  >(null);
  const [editTransactionForm, setEditTransactionForm] = useState({
    amount: "",
    category: "",
    merchant: "",
    date: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setExpenseData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearReceipt = () => {
    setReceiptFile(null);
    setParsedReceiptData(null);
    setProcessingStatus("idle");
    setIsProcessing(false);
    setShowReceiptDetails(false);
    setVoucherId(null);

    // Reset file inputs
    const cameraInput = document.getElementById(
      "receipt-camera"
    ) as HTMLInputElement;
    const uploadInput = document.getElementById(
      "receipt-upload"
    ) as HTMLInputElement;
    if (cameraInput) cameraInput.value = "";
    if (uploadInput) uploadInput.value = "";
  };

  const resetForm = () => {
    setExpenseData({
      amount: "",
      category: "",
      merchant: "",
      date: new Date().toISOString().split("T")[0],
      note: "",
    });
    clearReceipt();
  };

  // Fetch transactions on component mount
  useEffect(() => {
    if (token) {
      fetchTransactions();
    }
  }, [token]);

  const fetchTransactions = async () => {
    if (!token) {
      console.log("🔍 No token available for fetching transactions");
      return;
    }

    console.log("🔍 Fetching transactions for user:", user?.email);
    setIsLoadingTransactions(true);
    try {
      const data = await TransactionService.getUserTransactions(token, {
        limit: 10, // Show last 10 transactions
      });
      console.log(
        "✅ Successfully fetched transactions:",
        data.transactions.length,
        "items"
      );
      setTransactions(data.transactions);
      setHasLoadedTransactions(true);
    } catch (error) {
      console.error("❌ Error fetching transactions:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("❌ Error details:", errorMessage);

      toast({
        title: "Error",
        description: `Failed to load your transactions: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransactionId(transaction.id);
    setEditTransactionForm({
      amount: transaction.amount.toString(),
      category: transaction.category,
      merchant: transaction.merchant,
      date: new Date(transaction.date).toISOString().split("T")[0],
    });
  };

  const handleSaveTransaction = async (id: number) => {
    if (!token) return;

    try {
      const updateData = {
        amount: parseFloat(editTransactionForm.amount),
        category: editTransactionForm.category,
        merchant: editTransactionForm.merchant,
        date: editTransactionForm.date,
      };

      const result = await TransactionService.updateTransaction(
        id,
        updateData,
        token
      );

      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === id ? result.transaction : transaction
        )
      );

      setEditingTransactionId(null);
      toast({
        title: "Transaction Updated",
        description: "Transaction has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast({
        title: "Update Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update transaction",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!token) return;

    try {
      await TransactionService.deleteTransaction(id, token);
      setTransactions((prev) =>
        prev.filter((transaction) => transaction.id !== id)
      );

      toast({
        title: "Transaction Deleted",
        description: "Transaction has been removed successfully",
      });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast({
        title: "Delete Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete transaction",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingTransactionId(null);
    setEditTransactionForm({
      amount: "",
      category: "",
      merchant: "",
      date: "",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleReceiptUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    ``;

    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload receipts",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setReceiptFile(file);
    setIsProcessing(true);
    setProcessingStatus("uploading");

    try {
      console.log("📤 Starting receipt upload for file:", file.name);

      // Upload and process receipt with AI (without creating transaction)
      const result = await TransactionService.uploadReceipt(file, token, {
        createTransaction: false,
      });

      console.log("✅ Receipt processed successfully:", result);

      // Store parsed data and voucher ID for reference
      setParsedReceiptData(result.parsedData);
      setVoucherId(result.voucher.id);

      // Auto-populate form with extracted data
      setExpenseData({
        amount: result.parsedData.total_amount?.toString() || "",
        category: result.parsedData.transaction_category || "",
        merchant: result.parsedData.merchant || "",
        date: result.parsedData.date || new Date().toISOString().split("T")[0],
        note: `Receipt processed - ${
          result.parsedData.items?.length || 0
        } items`,
      });

      setProcessingStatus("completed");
      setIsProcessing(false);
      setShowReceiptDetails(true);

      toast({
        title: "Receipt Processed Successfully!",
        description: `Extracted ${result.parsedData.merchant} - $${result.parsedData.total_amount}. Review and confirm below.`,
      });
    } catch (error) {
      console.error("❌ Receipt processing failed:", error);

      setProcessingStatus("error");
      setIsProcessing(false);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      toast({
        title: "Receipt Processing Failed",
        description: errorMessage,
        variant: "destructive",
      });

      // Reset file on error
      setReceiptFile(null);
      setParsedReceiptData(null);

      // Reset file input
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const handleSubmit = async () => {
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add expenses",
        variant: "destructive",
      });
      return;
    }

    if (!expenseData.amount || !expenseData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in amount and category",
        variant: "destructive",
      });
      return;
    }

    // Validate amount
    const amount = parseFloat(expenseData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive amount",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("💰 Creating manual transaction:", expenseData);

      // Prepare transaction data
      const transactionData: CreateTransactionRequest = {
        date: expenseData.date,
        amount: amount,
        category: expenseData.category,
        merchant: expenseData.merchant || "Unknown Merchant",
        source: parsedReceiptData ? "voucher" : "manual",
        // Note: description field doesn't exist in database schema
        // receipt_img will be set if this was from a receipt
      };

      // Create transaction via API
      const result = await TransactionService.createTransaction(
        transactionData,
        token
      );

      console.log("✅ Transaction created successfully:", result.transaction);

      const isFromReceipt = parsedReceiptData !== null;

      toast({
        title: "Expense Added Successfully!",
        description: `$${amount.toFixed(2)} expense recorded for ${
          result.transaction.merchant
        }${isFromReceipt ? " from receipt" : ""}`,
      });

      // Refresh transactions list to show the new transaction
      await fetchTransactions();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create expense";

      toast({
        title: "Failed to Add Expense",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-background-add-expense">
      <TopNavigation />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/home")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Add Expense</h1>
          </div>
        </div>

        {/* Desktop Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Add Expense Forms */}
          <div className="space-y-6">
            {/* Receipt Upload Option */}
            <Card className="luxury-form">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera size={20} />
                  Upload Receipt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {receiptFile && (
                    <div className="bg-secondary p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        {processingStatus === "completed" && (
                          <CheckCircle size={16} className="text-green-500" />
                        )}
                        {processingStatus === "error" && (
                          <AlertCircle size={16} className="text-red-500" />
                        )}
                        <p className="text-sm font-medium">
                          📄 {receiptFile.name}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {processingStatus === "uploading" && "Uploading..."}
                        {processingStatus === "processing" &&
                          "Processing with AI..."}
                        {processingStatus === "completed" &&
                          "Processed successfully"}
                        {processingStatus === "error" && "Processing failed"}
                        {processingStatus === "idle" &&
                          isProcessing &&
                          "Processing..."}
                      </p>
                      {parsedReceiptData &&
                        processingStatus === "completed" && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            <p>
                              Extracted: {parsedReceiptData.merchant} - $
                              {parsedReceiptData.total_amount}
                            </p>
                            <p>
                              {parsedReceiptData.items?.length || 0} items found
                            </p>
                          </div>
                        )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-20 flex-col"
                      asChild
                      disabled={isProcessing || isSubmitting || !token}
                    >
                      <label htmlFor="receipt-camera">
                        <Camera size={24} className="mb-2" />
                        <span>📸 Take Receipt Photo</span>
                        <input
                          id="receipt-camera"
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={handleReceiptUpload}
                          disabled={isProcessing || isSubmitting || !token}
                        />
                      </label>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-20 flex-col"
                      asChild
                      disabled={isProcessing || isSubmitting || !token}
                    >
                      <label htmlFor="receipt-upload">
                        <Upload size={24} className="mb-2" />
                        <span>Upload from Gallery</span>
                        <input
                          id="receipt-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleReceiptUpload}
                          disabled={isProcessing || isSubmitting || !token}
                        />
                      </label>
                    </Button>
                  </div>

                  {!token && (
                    <p className="text-sm text-muted-foreground text-center">
                      Please log in to upload receipts
                    </p>
                  )}

                  {processingStatus === "completed" && parsedReceiptData && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-800 mb-2">
                            ✅ Receipt processed successfully! Review the
                            details:
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearReceipt}
                          className="text-green-600 hover:text-green-700"
                        >
                          Clear
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="text-xs text-green-700">
                          <p>
                            <strong>Merchant:</strong>{" "}
                            {parsedReceiptData.merchant}
                          </p>
                          <p>
                            <strong>Date:</strong> {parsedReceiptData.date}
                          </p>
                          <p>
                            <strong>Time:</strong>{" "}
                            {parsedReceiptData.time || "N/A"}
                          </p>
                        </div>
                        <div className="text-xs text-green-700">
                          <p>
                            <strong>Total:</strong> $
                            {parsedReceiptData.total_amount}
                          </p>
                          <p>
                            <strong>Tax:</strong> $
                            {parsedReceiptData.tax_amount || 0}
                          </p>
                          <p>
                            <strong>Payment:</strong>{" "}
                            {parsedReceiptData.payment_method || "N/A"}
                          </p>
                        </div>
                      </div>

                      {parsedReceiptData.items &&
                        parsedReceiptData.items.length > 0 && (
                          <div className="mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setShowReceiptDetails(!showReceiptDetails)
                              }
                              className="text-green-700 border-green-300 hover:bg-green-100"
                            >
                              {showReceiptDetails ? "Hide" : "Show"} Receipt
                              Items ({parsedReceiptData.items.length})
                            </Button>

                            {showReceiptDetails && (
                              <div className="mt-2 max-h-32 overflow-y-auto bg-white rounded border">
                                <table className="w-full text-xs">
                                  <thead className="bg-green-100">
                                    <tr>
                                      <th className="text-left p-2 font-medium">
                                        Item
                                      </th>
                                      <th className="text-center p-2 font-medium">
                                        Qty
                                      </th>
                                      <th className="text-right p-2 font-medium">
                                        Price
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {parsedReceiptData.items.map(
                                      (item, index) => (
                                        <tr
                                          key={index}
                                          className="border-t border-green-100"
                                        >
                                          <td className="p-2 text-green-800">
                                            {item.name}
                                          </td>
                                          <td className="p-2 text-center text-green-700">
                                            {item.quantity}
                                          </td>
                                          <td className="p-2 text-right text-green-700">
                                            ${item.price}
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  )}

                  {processingStatus === "error" && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-red-800 mb-1">
                            ❌ Receipt processing failed
                          </p>
                          <p className="text-xs text-red-700">
                            Please try again or enter the expense details
                            manually
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearReceipt}
                          className="text-red-600 hover:text-red-700"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Manual Entry Form */}
            <Card className="luxury-form">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText size={20} />
                    Expense Details
                    {parsedReceiptData && (
                      <span className="text-sm font-normal text-green-600">
                        (Auto-filled from receipt)
                      </span>
                    )}
                  </CardTitle>
                  {(receiptFile ||
                    expenseData.amount ||
                    expenseData.merchant) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetForm}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Reset Form
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="amount">Amount *</Label>
                    <div className="relative">
                      <DollarSign
                        size={18}
                        className="absolute left-3 top-3 text-muted-foreground"
                      />
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={expenseData.amount}
                        onChange={(e) =>
                          handleInputChange("amount", e.target.value)
                        }
                        className="luxury-input pl-10 text-lg font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={expenseData.category}
                      onValueChange={(value) =>
                        handleInputChange("category", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Schema.categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            <div className="flex items-center gap-2">
                              <Tag size={16} />
                              {category}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="merchant">Merchant</Label>
                    <Input
                      id="merchant"
                      placeholder="Where did you spend?"
                      value={expenseData.merchant}
                      onChange={(e) =>
                        handleInputChange("merchant", e.target.value)
                      }
                      className="luxury-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="date">Date</Label>
                    <div className="relative">
                      <Calendar
                        size={18}
                        className="absolute left-3 top-3 text-muted-foreground"
                      />
                      <Input
                        id="date"
                        type="date"
                        value={expenseData.date}
                        onChange={(e) =>
                          handleInputChange("date", e.target.value)
                        }
                        className="luxury-input pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="note">Note (optional)</Label>
                  <Textarea
                    id="note"
                    placeholder="Add a note about this expense"
                    value={expenseData.note}
                    onChange={(e) => handleInputChange("note", e.target.value)}
                    rows={3}
                    className="luxury-input"
                  />
                </div>

                <div className="border-t pt-6">
                  <Button
                    onClick={handleSubmit}
                    disabled={
                      !expenseData.amount ||
                      !expenseData.category ||
                      isProcessing ||
                      isSubmitting ||
                      !token
                    }
                    className="luxury-button-primary w-full mb-3"
                  >
                    {isSubmitting && "Creating Expense..."}
                    {isProcessing && "Processing Receipt..."}
                    {!isSubmitting &&
                      !isProcessing &&
                      parsedReceiptData &&
                      "Confirm & Save Expense"}
                    {!isSubmitting &&
                      !isProcessing &&
                      !parsedReceiptData &&
                      "Add Expense"}
                  </Button>

                  <Button
                    onClick={() => navigate("/home")}
                    disabled={isSubmitting || isProcessing}
                    className="luxury-button w-full"
                  >
                    Cancel
                  </Button>

                  {!token && (
                    <p className="text-sm text-muted-foreground text-center mt-2">
                      Please log in to add expenses
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Recent Transactions */}
          <div className="space-y-6">
            <Card className="luxury-form h-fit lg:sticky lg:top-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Receipt size={20} />
                    Recent Transactions
                  </CardTitle>
                  {hasLoadedTransactions && transactions.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {transactions.length} transactions
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Scrollable container for transactions */}
                <div className="max-h-[600px] overflow-y-auto p-6">
                  {/* Loading State */}
                  {isLoadingTransactions && (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <Clock
                          size={32}
                          className="mx-auto mb-3 animate-spin text-primary"
                        />
                        <p className="text-sm font-medium">
                          Loading your transactions...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* No Transactions */}
                  {hasLoadedTransactions &&
                    !isLoadingTransactions &&
                    transactions.length === 0 && (
                      <div className="py-8 text-center">
                        <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                          <Receipt size={32} className="text-primary" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">
                          No transactions yet
                        </h3>
                        <p className="text-muted-foreground">
                          Your transactions will appear here after you add your
                          first expense
                        </p>
                      </div>
                    )}

                  {/* Transactions List */}
                  {!isLoadingTransactions && transactions.length > 0 && (
                    <div className="space-y-4">
                      {transactions.map((transaction) => (
                        <TransactionCard
                          key={transaction.id}
                          transaction={transaction}
                          isEditing={editingTransactionId === transaction.id}
                          editForm={editTransactionForm}
                          onEdit={handleEditTransaction}
                          onSave={handleSaveTransaction}
                          onDelete={handleDeleteTransaction}
                          onCancel={handleCancelEdit}
                          onEditFormChange={setEditTransactionForm}
                          formatDate={formatDate}
                          categories={Schema.categories}
                        />
                      ))}

                      {/* Show more indicator if there are more transactions */}
                      {transactions.length >= 10 && (
                        <div className="text-center py-4 border-t">
                          <p className="text-sm text-muted-foreground">
                            Showing last 10 transactions
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate("/reports")}
                            className="mt-2"
                          >
                            View All Transactions
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TransactionCardProps {
  transaction: Transaction;
  isEditing: boolean;
  editForm: {
    amount: string;
    category: string;
    merchant: string;
    date: string;
  };
  onEdit: (transaction: Transaction) => void;
  onSave: (id: number) => void;
  onDelete: (id: number) => void;
  onCancel: () => void;
  onEditFormChange: (form: any) => void;
  formatDate: (date: string) => string;
  categories: string[];
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  isEditing,
  editForm,
  onEdit,
  onSave,
  onDelete,
  onCancel,
  onEditFormChange,
  formatDate,
  categories,
}) => {
  return (
    <Card className="border hover:shadow-sm transition-shadow duration-200 bg-background/50">
      <CardContent className="p-3">
        {isEditing ? (
          // Editing Mode - Compact Form
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Input
                value={editForm.merchant}
                onChange={(e) =>
                  onEditFormChange({
                    ...editForm,
                    merchant: e.target.value,
                  })
                }
                className="text-sm font-medium flex-1"
                placeholder="Merchant"
              />
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onSave(transaction.id)}
                  className="h-7 w-7 text-green-600 hover:text-green-600"
                >
                  <Save size={12} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onCancel}
                  className="h-7 w-7"
                >
                  <X size={12} />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <DollarSign
                  size={14}
                  className="absolute left-2 top-2.5 text-muted-foreground"
                />
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.amount}
                  onChange={(e) =>
                    onEditFormChange({
                      ...editForm,
                      amount: e.target.value,
                    })
                  }
                  className="pl-7 text-sm"
                  placeholder="0.00"
                />
              </div>
              <Input
                type="date"
                value={editForm.date}
                onChange={(e) =>
                  onEditFormChange({
                    ...editForm,
                    date: e.target.value,
                  })
                }
                className="text-sm"
              />
            </div>

            <Select
              value={editForm.category}
              onValueChange={(value) =>
                onEditFormChange({
                  ...editForm,
                  category: value,
                })
              }
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {Schema.categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    <div className="flex items-center gap-2">
                      <Tag size={12} />
                      {category}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          // Display Mode - Compact View
          <div className="space-y-2">
            {/* Header Row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-foreground truncate">
                  {transaction.merchant}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                    <Tag size={10} className="mr-1" />
                    {transaction.category}
                  </Badge>
                  <Badge
                    variant={
                      transaction.source === "voucher" ? "default" : "secondary"
                    }
                    className="text-xs px-1.5 py-0.5"
                  >
                    {transaction.source === "voucher" ? "📄" : "✍️"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <span className="font-bold text-lg text-foreground">
                  ${transaction.amount.toFixed(2)}
                </span>
                <div className="flex gap-0.5 ml-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(transaction)}
                    className="h-6 w-6 opacity-70 hover:opacity-100"
                  >
                    <Edit size={10} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(transaction.id)}
                    className="h-6 w-6 opacity-70 hover:opacity-100 text-destructive hover:text-destructive"
                  >
                    <Trash2 size={10} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer Row */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock size={10} />
                <span>{formatDate(transaction.date)}</span>
              </div>
              <span>#{transaction.id}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AddExpense;
