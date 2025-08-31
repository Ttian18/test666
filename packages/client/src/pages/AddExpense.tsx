import { useState } from "react";
import {
  ArrowLeft,
  Camera,
  Calendar,
  Tag,
  DollarSign,
  FileText,
  Upload,
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
import { categories } from "schema";

const AddExpense = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [expenseData, setExpenseData] = useState({
    amount: "",
    category: "",
    merchant: "",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setExpenseData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReceiptUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setReceiptFile(file);
    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      // Mock extracted data
      setExpenseData({
        amount: "23.45",
        category: "Food & Dining",
        merchant: "Corner Cafe",
        date: new Date().toISOString().split("T")[0],
        note: "Receipt uploaded and processed",
      });
      setIsProcessing(false);

      toast({
        title: "Receipt Processed!",
        description: "Expense details extracted automatically",
      });
    }, 2000);
  };

  const handleSubmit = () => {
    if (!expenseData.amount || !expenseData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in amount and category",
        variant: "destructive",
      });
      return;
    }

    // Save expense logic here
    toast({
      title: "Expense Added!",
      description: `$${expenseData.amount} expense recorded successfully`,
    });

    navigate("/home");
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
              Upload Receipt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {receiptFile && (
                <div className="bg-secondary p-3 rounded-lg">
                  <p className="text-sm font-medium">📄 {receiptFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {isProcessing ? "Processing..." : "Processed successfully"}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button variant="outline" className="h-20 flex-col" asChild>
                  <label htmlFor="receipt-camera">
                    <Camera size={24} className="mb-2" />
                    <span>📸 Upload Receipt Photo</span>
                    <input
                      id="receipt-camera"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleReceiptUpload}
                    />
                  </label>
                </Button>

                <Button variant="outline" className="h-20 flex-col" asChild>
                  <label htmlFor="receipt-upload">
                    <Upload size={24} className="mb-2" />
                    <span>Upload from Gallery</span>
                    <input
                      id="receipt-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleReceiptUpload}
                    />
                  </label>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manual Entry Form */}
        <Card className="luxury-form">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              Expense Details
            </CardTitle>
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
                    onChange={(e) => handleInputChange("date", e.target.value)}
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
                  !expenseData.amount || !expenseData.category || isProcessing
                }
                className="luxury-button-primary w-full mb-3"
              >
                {isProcessing ? "Processing..." : "Add Expense"}
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
