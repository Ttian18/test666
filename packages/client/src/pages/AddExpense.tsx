import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Camera,
  Calendar,
  Tag,
  DollarSign,
  FileText,
  X,
  Edit3,
  ImagePlus,
  FolderOpen,
  Loader2,
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
import { useAuthContext } from "@/contexts/AuthContext";
import axios from "axios";
import heic2any from "heic2any";

interface ExpenseData {
  id: string;
  date: Date;
  amount: number;
  category: string;
  merchant: string;
  notes: string;
  receipt_img?: string;
  merchant_category?: string;
  food_subcategory?: any;
  file?: File;
  isProcessing: boolean;
  isEditing: boolean;
  error?: string;
  isDuplicate?: boolean;
}

interface UploadResponse {
  message: string;
  transaction: {
    id: number;
    date: string;
    amount: number;
    category: string;
    merchant: string;
    receipt_img: string;
    merchant_category: string;
    food_subcategory: any;
  };
  voucher: {
    id: number;
    user_id: number;
    image_path: string;
    parsed_data: {
      merchant?: string;
      notes?: string;
      [key: string]: any;
    };
    timestamp: string;
  };
  isDuplicate?: boolean;
}

const AddExpense = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthContext();

  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [manualExpenseData, setManualExpenseData] = useState({
    amount: "",
    category: "",
    merchant: "",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch categories from backend on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5001/api/transactions/categories"
        );
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Fallback categories
        setCategories([
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

    fetchCategories();
  }, []);

  // Function to convert HEIC files to JPEG on the frontend
  const convertIfHeic = async (file: File): Promise<File> => {
    if (
      file.type === "image/heic" ||
      file.name.toLowerCase().endsWith(".heic")
    ) {
      try {
        console.log(`Converting HEIC file: ${file.name}`);
        const blob = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.9,
        });
        const convertedFile = new File(
          [blob as Blob],
          file.name.replace(/\.heic$/i, ".jpg"),
          { type: "image/jpeg" }
        );
        console.log(
          `Successfully converted ${file.name} to ${convertedFile.name}`
        );
        return convertedFile;
      } catch (error) {
        console.error("HEIC conversion error:", error);
        throw new Error(
          `Failed to convert HEIC file: ${file.name}. Please try converting it manually or use a different format.`
        );
      }
    }
    return file;
  };

  const handleManualInputChange = (field: string, value: string) => {
    setManualExpenseData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleExpenseInputChange = (
    expenseId: string,
    field: string,
    value: string | number
  ) => {
    setExpenses((prev) =>
      prev.map((expense) =>
        expense.id === expenseId
          ? {
              ...expense,
              [field]: field === "date" ? new Date(value as string) : value,
            }
          : expense
      )
    );
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    console.log("🔄 handleFileUpload called with files:", files.length);
    if (!files || files.length === 0) return;

    // Prevent multiple simultaneous uploads
    if (isUploading) {
      console.log("⚠️ Upload already in progress, skipping...");
      return;
    }

    setIsUploading(true);

    const supportedFormats = [".heic", ".jpg", ".jpeg", ".png"];
    const fileArray = Array.from(files);

    // Validate file formats
    const unsupportedFiles = fileArray.filter((file) => {
      const extension = file.name
        .toLowerCase()
        .slice(file.name.lastIndexOf("."));
      return !supportedFormats.includes(extension);
    });

    if (unsupportedFiles.length > 0) {
      toast({
        title: "Unsupported File Format",
        description: `Please use HEIC, JPG, JPEG, or PNG files. Unsupported: ${unsupportedFiles
          .map((f) => f.name)
          .join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    // Create expense entries for each file
    const newExpenses: ExpenseData[] = fileArray.map((file, index) => ({
      id: `upload-${Date.now()}-${index}`,
      date: new Date(),
      amount: 0,
      category: "Other",
      merchant: "Unknown",
      notes: "",
      file,
      isProcessing: true,
      isEditing: false,
    }));

    console.log("🔄 Creating new expenses:", newExpenses.length);
    setExpenses((prev) => [...prev, ...newExpenses]);

    // Process each file
    try {
      for (const expense of newExpenses) {
        try {
          console.log("🔄 Processing expense:", expense.id, expense.file?.name);
          await processReceiptUpload(expense);
        } catch (error) {
          console.error(`Error processing ${expense.file?.name}:`, error);
          setExpenses((prev) =>
            prev.map((exp) =>
              exp.id === expense.id
                ? {
                    ...exp,
                    isProcessing: false,
                    error: "Upload or processing failed",
                  }
                : exp
            )
          );
        }
      }
    } finally {
      setIsUploading(false);
    }
  };

  const processReceiptUpload = async (expense: ExpenseData) => {
    if (!expense.file) return;

    console.log(
      "🔄 processReceiptUpload called for:",
      expense.id,
      expense.file.name
    );

    try {
      // Show processing state
      setExpenses((prev) =>
        prev.map((exp) =>
          exp.id === expense.id
            ? { ...exp, isProcessing: true, error: undefined }
            : exp
        )
      );

      // Convert HEIC file to JPEG if needed
      const safeFile = await convertIfHeic(expense.file);

      const formData = new FormData();
      formData.append("receipt", safeFile);
      formData.append("user_id", "1"); // Add user_id as required by backend

      console.log("🔄 Sending API request for:", expense.file.name);
      const response = await axios.post<UploadResponse>(
        "http://localhost:5001/api/transactions/vouchers/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { transaction, voucher, isDuplicate, message } = response.data;

      // For duplicates, voucher might be null, so we need to handle this case
      if (isDuplicate && !voucher) {
        console.log("⚠️ Duplicate receipt detected - no voucher created");
        toast({
          title: "Receipt Already Processed",
          description:
            "This receipt has been uploaded before. No duplicate transaction was created.",
          variant: "default",
        });

        // Remove this expense from the list since it's a duplicate
        setExpenses((prev) => prev.filter((exp) => exp.id !== expense.id));
        return;
      }

      const parsedData = voucher?.parsed_data;

      console.log("🔄 API Response:", {
        isDuplicate,
        message,
        transaction: transaction?.id,
      });

      // Check if this is a duplicate receipt
      if (isDuplicate) {
        console.log("⚠️ Duplicate receipt detected!");
        toast({
          title: "Receipt Already Processed",
          description:
            "This receipt has been uploaded before. No duplicate transaction was created.",
          variant: "default",
        });
      } else {
        console.log("✅ New receipt processed successfully");
      }

      // Build expense object from backend response
      console.log("🔍 Transaction data received:", transaction);
      console.log("🔍 Transaction category:", transaction.category);
      console.log("🔍 Parsed data:", parsedData);

      const processedExpense: Partial<ExpenseData> = {
        date: new Date(transaction.date),
        amount: transaction.amount,
        category: transaction.category || "Other",
        merchant: transaction.merchant || parsedData?.merchant || "Unknown",
        notes: parsedData?.notes || "",
        receipt_img: transaction.receipt_img,
        merchant_category: transaction.merchant_category,
        food_subcategory: transaction.food_subcategory,
        isProcessing: false,
        error: undefined,
        isDuplicate: isDuplicate || false,
      };

      setExpenses((prev) => {
        const updated = prev.map((exp) => {
          if (exp.id === expense.id) {
            const updatedExpense = { ...exp, ...processedExpense };
            console.log("🔍 Updated expense:", updatedExpense);
            console.log("🔍 Updated category:", updatedExpense.category);
            return updatedExpense;
          }
          return exp;
        });
        return updated;
      });

      if (isDuplicate) {
        toast({
          title: "Receipt Already Processed",
          description: `"${expense.file?.name}" was uploaded before. No duplicate transaction created.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Receipt Processed",
          description: `Successfully extracted data from ${expense.file?.name}`,
        });
      }
    } catch (error: any) {
      console.error("Receipt processing error:", error);
      console.log("Error response data:", error.response?.data);
      console.log("Error status:", error.response?.status);

      let errorMessage = "Upload or processing failed";
      let toastDescription = `Failed to process ${expense.file?.name}. Please try again or enter manually.`;

      // Handle specific error responses
      if (error.response?.status === 400) {
        const serverError =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "File validation failed";
        console.log("Server 400 error:", serverError);
        errorMessage = serverError;
        toastDescription = serverError;
      } else if (error.response?.status === 422) {
        const serverError =
          error.response?.data?.error || "Receipt processing failed";
        console.log("Server 422 error:", serverError);
        errorMessage = serverError;
        toastDescription = serverError;
      } else if (error.response?.status === 404) {
        errorMessage = "API endpoint not found";
        toastDescription =
          "The upload endpoint is not available. Please check server configuration.";
      } else if (error.response?.status === 413) {
        errorMessage = "File too large";
        toastDescription =
          "The file size exceeds the 10MB limit. Please use a smaller file.";
      } else if (error.response?.status === 415) {
        errorMessage = "Unsupported file type";
        toastDescription =
          "Please use JPG, PNG, HEIC, or other supported image formats.";
      }

      setExpenses((prev) =>
        prev.map((exp) =>
          exp.id === expense.id
            ? {
                ...exp,
                isProcessing: false,
                error: errorMessage,
              }
            : exp
        )
      );

      toast({
        title: "Processing Failed",
        description: toastDescription,
        variant: "destructive",
      });
    } finally {
      // Reset processing state
      setExpenses((prev) =>
        prev.map((exp) =>
          exp.id === expense.id ? { ...exp, isProcessing: false } : exp
        )
      );
    }
  };

  const handleReceiptUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log(
      "🔄 handleReceiptUpload called with files:",
      event.target.files?.length
    );

    // Prevent upload if already uploading
    if (isUploading) {
      console.log("⚠️ Upload already in progress, ignoring file selection");
      event.target.value = ""; // Reset input
      return;
    }

    const files = event.target.files;
    if (files) {
      await handleFileUpload(files);
    }
    event.target.value = ""; // Reset input
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    // Prevent upload if already uploading
    if (isUploading) {
      console.log("⚠️ Upload already in progress, ignoring drop");
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    console.log("🔄 handleDrop called with files:", files.length);
    if (files.length > 0) {
      await handleFileUpload(files);
    }
  };

  const toggleExpenseEditing = (expenseId: string) => {
    setExpenses((prev) =>
      prev.map((expense) =>
        expense.id === expenseId
          ? { ...expense, isEditing: !expense.isEditing }
          : expense
      )
    );
  };

  const removeExpense = (expenseId: string) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== expenseId));
  };

  const handleSubmit = async () => {
    const allExpenses = [...expenses];

    // Add manual expense if data exists
    if (manualExpenseData.amount && manualExpenseData.category) {
      const manualExpense = {
        id: "manual",
        date: new Date(manualExpenseData.date),
        amount: parseFloat(manualExpenseData.amount),
        category: manualExpenseData.category,
        merchant: manualExpenseData.merchant || "Unknown",
        notes: manualExpenseData.note,
        isProcessing: false,
        isEditing: false,
      };
      console.log("🔍 Adding manual expense:", manualExpense);
      allExpenses.push(manualExpense);
    }

    if (allExpenses.length === 0) {
      toast({
        title: "No Expenses to Add",
        description: "Please upload receipts or enter expense details manually",
        variant: "destructive",
      });
      return;
    }

    // Check if any expense is missing required data
    const incompleteExpenses = allExpenses.filter(
      (expense) => !expense.amount || !expense.category || expense.isProcessing
    );

    if (incompleteExpenses.length > 0) {
      toast({
        title: "Missing Information",
        description:
          "Please ensure all receipts are processed and fill in amount and category for all expenses",
        variant: "destructive",
      });
      return;
    }

    try {
      // Only create transactions for manual entries, failed receipts, or non-duplicate receipts
      // Receipts that were successfully processed already have transactions created
      const manualTransactions = allExpenses
        .filter(
          (expense) => !expense.file || expense.error || expense.isDuplicate
        ) // Skip duplicate receipts
        .map((expense) => ({
          amount: expense.amount,
          category: expense.category,
          merchant: expense.merchant,
          date: expense.date.toISOString().split("T")[0],
          source: expense.file ? "receipt" : "manual",
          note: expense.notes,
        }));

      const duplicateCount = allExpenses.filter(
        (exp) => exp.isDuplicate
      ).length;
      const processedCount = allExpenses.filter(
        (exp) => exp.file && !exp.error && !exp.isDuplicate
      ).length;

      console.log(
        "📝 Creating transactions for:",
        manualTransactions.length,
        "items"
      );
      console.log("📊 Summary:", {
        processedCount,
        duplicateCount,
        manualCount: manualTransactions.length,
      });

      if (manualTransactions.length > 0) {
        const response = await axios.post(
          "http://localhost:5001/api/transactions/bulk",
          {
            transactions: manualTransactions,
            user_id: 1, // Default user ID for testing
          }
        );
        console.log("✅ Bulk transactions created:", response.data);
      } else {
        console.log(
          "ℹ️ No manual transactions to create - all receipts were processed successfully"
        );
      }

      const totalAmount = allExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

      const processedReceipts = allExpenses.filter(
        (expense) => expense.file && !expense.error && !expense.isDuplicate
      ).length;
      const duplicateReceipts = allExpenses.filter(
        (expense) => expense.file && expense.isDuplicate
      ).length;
      const manualEntries = allExpenses.filter(
        (expense) => !expense.file
      ).length;
      const failedReceipts = allExpenses.filter(
        (expense) => expense.file && expense.error
      ).length;

      let description = "";
      if (processedReceipts > 0) {
        description += `${processedReceipts} receipt(s) processed successfully. `;
      }
      if (duplicateReceipts > 0) {
        description += `${duplicateReceipts} duplicate receipt(s) skipped. `;
      }
      if (manualEntries > 0) {
        description += `${manualEntries} manual entry(ies) added. `;
      }
      if (failedReceipts > 0) {
        description += `${failedReceipts} receipt(s) failed to process.`;
      }

      toast({
        title: "Expenses Processed!",
        description:
          (description.trim() || "All expenses processed successfully") +
          " Redirecting to insights...",
      });

      // Clear form data
      setExpenses([]);
      setManualExpenseData({
        amount: "",
        category: "",
        merchant: "",
        date: new Date().toISOString().split("T")[0],
        note: "",
      });

      // Navigate to insights page after a short delay to show the user their updated spending data
      setTimeout(() => {
        navigate("/reports");
      }, 1500); // 1.5 second delay to let users see the success message
    } catch (error) {
      console.error("Error saving expenses:", error);
      toast({
        title: "Error",
        description: "Failed to save expenses. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="page-background-add-expense">
      <TopNavigation />

      <div className="max-w-2xl mx-auto px-6 py-8">
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

        {/* Receipt Upload Option */}
        <Card className="luxury-form mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera size={20} />
              Upload Receipts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                {/* Drag and Drop Zone */}
                <Button
                  variant="outline"
                  className={`
                    h-20 flex-col px-8 py-4 justify-center cursor-pointer transition-all duration-200
                    ${
                      isDragOver
                        ? "border-primary bg-primary/10"
                        : "hover:border-primary/50 hover:bg-accent/50"
                    }
                  `}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  asChild
                  disabled={isUploading}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <ImagePlus size={28} className="mb-1" />
                    <span className="text-base text-center">
                      {isUploading
                        ? "Uploading..."
                        : isDragOver
                        ? "Drop files here"
                        : "Drag your receipts"}
                    </span>
                  </div>
                </Button>

                <span className="text-base text-muted-foreground font-medium px-3">
                  or
                </span>

                {/* File Selection Button */}
                <Button
                  variant="outline"
                  className="h-20 flex-col px-8 py-4 justify-center"
                  asChild
                  disabled={isUploading}
                >
                  <label
                    htmlFor="receipt-upload"
                    className="flex flex-col items-center justify-center h-full cursor-pointer"
                  >
                    <FolderOpen size={28} className="mb-1" />
                    <span className="text-base">
                      {isUploading ? "Uploading..." : "Choose from local"}
                    </span>
                    <input
                      id="receipt-upload"
                      type="file"
                      accept="image/heic,image/jpeg,image/jpg,image/png,.heic,.jpg,.jpeg,.png"
                      multiple
                      className="hidden"
                      onChange={handleReceiptUpload}
                    />
                  </label>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Supported formats: HEIC, JPG, JPEG, PNG. Multiple files
                supported. Each receipt will be processed using AI to extract
                expense details.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Receipts Display */}
        {expenses.length > 0 && (
          <Card className="luxury-form mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} />
                Uploaded Receipts ({expenses.length})
              </CardTitle>
              {expenses.some((exp) => exp.isDuplicate) && (
                <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded-md">
                  ⚠️ Some receipts were already processed before. Duplicates
                  will not be created.
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenses.map((expense, index) => (
                  <div
                    key={expense.id}
                    className={`border rounded-lg p-4 ${
                      expense.isDuplicate
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-secondary/20"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">
                              📄 {expense.file?.name || "Manual Entry"}
                            </p>
                            {expense.isDuplicate && (
                              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                                ⚠️ Duplicate
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {expense.isProcessing ? (
                              <span className="flex items-center gap-1">
                                <Loader2 size={12} className="animate-spin" />
                                Processing receipt...
                              </span>
                            ) : expense.error ? (
                              <span className="text-destructive">
                                {expense.error}
                              </span>
                            ) : expense.isDuplicate ? (
                              <span className="text-yellow-600">
                                Already processed - no duplicate created
                              </span>
                            ) : (
                              "Processed successfully"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpenseEditing(expense.id)}
                          disabled={expense.isProcessing}
                        >
                          <Edit3 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExpense(expense.id)}
                          disabled={expense.isProcessing}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    </div>

                    {!expense.isProcessing && !expense.error && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`amount-${expense.id}`}>
                            Amount *
                          </Label>
                          <div className="relative">
                            <DollarSign
                              size={16}
                              className="absolute left-3 top-3 text-muted-foreground"
                            />
                            <Input
                              id={`amount-${expense.id}`}
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={expense.amount || ""}
                              onChange={(e) =>
                                handleExpenseInputChange(
                                  expense.id,
                                  "amount",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              disabled={!expense.isEditing}
                              className={`pl-10 ${
                                expense.isEditing
                                  ? "luxury-input"
                                  : "bg-secondary"
                              }`}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`category-${expense.id}`}>
                            Category *
                          </Label>
                          <Select
                            key={`${expense.id}-${expense.category}-${expense.isProcessing}`}
                            value={expense.category}
                            onValueChange={(value) =>
                              handleExpenseInputChange(
                                expense.id,
                                "category",
                                value
                              )
                            }
                            disabled={!expense.isEditing}
                          >
                            <SelectTrigger
                              className={`text-base ${
                                expense.isEditing ? "" : "bg-secondary"
                              }`}
                            >
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent
                              className="max-h-60 overflow-auto !animate-none !transition-none !transform-none"
                              position="popper"
                              style={{
                                animation: "none !important",
                                transition: "none !important",
                                transform: "none !important",
                              }}
                            >
                              {categories.map((category) => (
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

                        <div>
                          <Label htmlFor={`merchant-${expense.id}`}>
                            Merchant
                          </Label>
                          <Input
                            id={`merchant-${expense.id}`}
                            placeholder="Where did you spend?"
                            value={expense.merchant}
                            onChange={(e) =>
                              handleExpenseInputChange(
                                expense.id,
                                "merchant",
                                e.target.value
                              )
                            }
                            disabled={!expense.isEditing}
                            className={
                              expense.isEditing
                                ? "luxury-input"
                                : "bg-secondary"
                            }
                          />
                        </div>

                        <div>
                          <Label htmlFor={`date-${expense.id}`}>Date</Label>
                          <div className="relative">
                            <Calendar
                              size={16}
                              className="absolute left-3 top-3 text-muted-foreground"
                            />
                            <Input
                              id={`date-${expense.id}`}
                              type="date"
                              value={expense.date.toISOString().split("T")[0]}
                              onChange={(e) =>
                                handleExpenseInputChange(
                                  expense.id,
                                  "date",
                                  e.target.value
                                )
                              }
                              disabled={!expense.isEditing}
                              className={`pl-10 ${
                                expense.isEditing
                                  ? "luxury-input"
                                  : "bg-secondary"
                              }`}
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <Label htmlFor={`notes-${expense.id}`}>Notes</Label>
                          <Textarea
                            id={`notes-${expense.id}`}
                            placeholder="Add a note about this expense"
                            value={expense.notes}
                            onChange={(e) =>
                              handleExpenseInputChange(
                                expense.id,
                                "notes",
                                e.target.value
                              )
                            }
                            disabled={!expense.isEditing}
                            rows={2}
                            className={
                              expense.isEditing
                                ? "luxury-input"
                                : "bg-secondary"
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manual Entry Form */}
        <Card className="luxury-form">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              Manual Entry (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="manual-amount">Amount</Label>
                <div className="relative">
                  <DollarSign
                    size={18}
                    className="absolute left-3 top-3 text-muted-foreground"
                  />
                  <Input
                    id="manual-amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={manualExpenseData.amount}
                    onChange={(e) =>
                      handleManualInputChange("amount", e.target.value)
                    }
                    className="luxury-input pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="manual-category">Category</Label>
                <Select
                  value={manualExpenseData.category}
                  onValueChange={(value) =>
                    handleManualInputChange("category", value)
                  }
                >
                  <SelectTrigger className="text-base">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent
                    className="max-h-60 overflow-auto !animate-none !transition-none !transform-none"
                    position="popper"
                    style={{
                      animation: "none !important",
                      transition: "none !important",
                      transform: "none !important",
                    }}
                  >
                    {categories.map((category) => (
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
                <Label htmlFor="manual-merchant">Merchant</Label>
                <Input
                  id="manual-merchant"
                  placeholder="Where did you spend?"
                  value={manualExpenseData.merchant}
                  onChange={(e) =>
                    handleManualInputChange("merchant", e.target.value)
                  }
                  className="luxury-input"
                />
              </div>

              <div>
                <Label htmlFor="manual-date">Date</Label>
                <div className="relative">
                  <Calendar
                    size={18}
                    className="absolute left-3 top-3 text-muted-foreground"
                  />
                  <Input
                    id="manual-date"
                    type="date"
                    value={manualExpenseData.date}
                    onChange={(e) =>
                      handleManualInputChange("date", e.target.value)
                    }
                    className="luxury-input pl-10"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="manual-note">Note (optional)</Label>
              <Textarea
                id="manual-note"
                placeholder="Add a note about this expense"
                value={manualExpenseData.note}
                onChange={(e) =>
                  handleManualInputChange("note", e.target.value)
                }
                rows={3}
                className="luxury-input"
              />
            </div>

            <div className="border-t pt-6">
              {expenses.some((exp) => exp.isDuplicate) && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-700 flex items-center gap-2">
                    <span className="text-yellow-600">⚠️</span>
                    Duplicate receipts detected. These will be skipped during
                    submission to prevent duplicates.
                  </p>
                </div>
              )}
              <Button
                onClick={handleSubmit}
                disabled={expenses.some((exp) => exp.isProcessing)}
                className="luxury-button-primary w-full mb-3"
              >
                {expenses.some((exp) => exp.isProcessing)
                  ? "Processing Receipts..."
                  : expenses.length > 0
                  ? `Add ${
                      expenses.length +
                      (manualExpenseData.amount && manualExpenseData.category
                        ? 1
                        : 0)
                    } Expense(s)`
                  : "Add Expense"}
              </Button>

              <Button
                onClick={() => navigate("/home")}
                className="luxury-button w-full"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddExpense;
