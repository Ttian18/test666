import { useState, useEffect, useRef } from "react";
import {
  Upload,
  Image as ImageIcon,
  Loader2,
  Search,
  MapPin,
  Instagram,
  Edit,
  Trash2,
  Save,
  X,
  Camera,
  Sparkles,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/contexts/AuthContext";
import TopNavigation from "@/components/TopNavigation";
import RestaurantService, { ZhongcaoResult } from "@/services/restaurantService";
import { toast } from "@/components/ui/use-toast";

const Zhongcao = () => {
  const { token, user } = useAuthContext();
  const [results, setResults] = useState<ZhongcaoResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    restaurantName: "",
    dishName: "",
    address: "",
    description: "",
    socialMediaHandle: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (token) {
      fetchResults();
    }
  }, [token]);

  const fetchResults = async () => {
    if (!token) {
      console.log('🔍 No token available for fetching zhongcao results');
      return;
    }

    console.log('🔍 Fetching zhongcao results for user:', user?.email);
    setIsLoading(true);
    try {
      const data = await RestaurantService.getAllZhongcaoResults(token);
      console.log('✅ Successfully fetched zhongcao results:', data.length, 'items');
      setResults(data);
      setHasLoaded(true);
    } catch (error) {
      console.error("❌ Error fetching zhongcao results:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("❌ Error details:", errorMessage);
      
      toast({
        title: "Error",
        description: `Failed to load your saved restaurant discoveries: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    if (!token) {
      console.log('🔍 No token available for upload');
      toast({
        title: "Authentication Required",
        description: "Please log in to upload and analyze restaurant images",
        variant: "destructive",
      });
      return;
    }

    console.log('🔍 Starting upload for file:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      console.log('❌ Invalid file type:', file.type);
      toast({
        title: "Invalid File Type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.log('❌ File too large:', file.size, 'bytes');
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      console.log('🚀 Uploading image to zhongcao service...');
      const response = await RestaurantService.uploadZhongcaoImage(file, token);
      console.log('✅ Upload successful:', response);
      
      // Add the new result to the top of the list
      setResults((prev) => [response.result, ...prev]);
      
      toast({
        title: "Image Analyzed Successfully",
        description: `Extracted information for ${response.restaurant_name}`,
      });
    } catch (error) {
      console.error("❌ Error uploading image:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to analyze image";
      console.error("❌ Upload error details:", errorMessage);
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (result: ZhongcaoResult) => {
    setEditingId(result.id);
    setEditForm({
      restaurantName: result.restaurantName,
      dishName: result.dishName || "",
      address: result.address || "",
      description: result.description,
      socialMediaHandle: result.socialMediaHandle || "",
    });
  };

  const handleSave = async (id: number) => {
    if (!token) return;

    try {
      const updated = await RestaurantService.updateZhongcaoResult(
        id,
        {
          restaurantName: editForm.restaurantName,
          dishName: editForm.dishName || null,
          address: editForm.address || null,
          description: editForm.description,
          socialMediaHandle: editForm.socialMediaHandle || null,
        },
        token
      );

      setResults((prev) =>
        prev.map((result) => (result.id === id ? updated : result))
      );
      
      setEditingId(null);
      toast({
        title: "Updated Successfully",
        description: "Restaurant information has been updated",
      });
    } catch (error) {
      console.error("Error updating result:", error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;

    try {
      await RestaurantService.deleteZhongcaoResult(id, token);
      setResults((prev) => prev.filter((result) => result.id !== id));
      
      toast({
        title: "Deleted Successfully",
        description: "Restaurant discovery has been removed",
      });
    } catch (error) {
      console.error("Error deleting result:", error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({
      restaurantName: "",
      dishName: "",
      address: "",
      description: "",
      socialMediaHandle: "",
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

  return (
    <div className="page-background-zhongcao">
      <TopNavigation />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-primary rounded-xl p-2">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Wishlists
            </h1>
          </div>
          <p className="text-muted-foreground">
            Upload social media screenshots to discover and save restaurant information using AI
          </p>
        </div>

        {/* Upload Section */}
        <Card className="themed-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload size={20} />
              Upload Restaurant Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-8 text-center cursor-pointer transition-colors duration-200"
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 size={48} className="animate-spin text-primary" />
                    <div>
                      <p className="font-medium">Analyzing Image...</p>
                      <p className="text-sm text-muted-foreground">
                        This may take a few moments
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-primary/10 rounded-full p-4">
                      <ImageIcon size={32} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        Click to upload restaurant image
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Upload screenshots from social media, photos of menus, or restaurant images
                      </p>
                    </div>
                    <Button variant="outline" className="mt-2">
                      Choose File
                    </Button>
                  </div>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
              
              <p className="text-xs text-muted-foreground text-center">
                Supported formats: JPG, PNG, WebP • Max size: 10MB
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 size={48} className="mx-auto mb-4 animate-spin text-primary" />
              <p className="text-lg font-medium">Loading your discoveries...</p>
            </div>
          </div>
        )}

        {/* No Results */}
        {hasLoaded && !isLoading && results.length === 0 && (
          <Card className="themed-card">
            <CardContent className="py-12 text-center">
              <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <Search size={32} className="text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No discoveries yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first restaurant image to get started with AI-powered restaurant discovery
              </p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload size={16} className="mr-2" />
                Upload Image
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {!isLoading && results.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                Your Restaurant Wishlists
              </h2>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Sparkles size={14} />
                {results.length} discoveries
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((result) => (
                <RestaurantCard
                  key={result.id}
                  result={result}
                  isEditing={editingId === result.id}
                  editForm={editForm}
                  onEdit={handleEdit}
                  onSave={handleSave}
                  onDelete={handleDelete}
                  onCancel={handleCancel}
                  onEditFormChange={setEditForm}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface RestaurantCardProps {
  result: ZhongcaoResult;
  isEditing: boolean;
  editForm: {
    restaurantName: string;
    dishName: string;
    address: string;
    description: string;
    socialMediaHandle: string;
  };
  onEdit: (result: ZhongcaoResult) => void;
  onSave: (id: number) => void;
  onDelete: (id: number) => void;
  onCancel: () => void;
  onEditFormChange: (form: any) => void;
  formatDate: (date: string) => string;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  result,
  isEditing,
  editForm,
  onEdit,
  onSave,
  onDelete,
  onCancel,
  onEditFormChange,
  formatDate,
}) => {
  return (
    <Card className="themed-card hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          {isEditing ? (
            <Input
              value={editForm.restaurantName}
              onChange={(e) =>
                onEditFormChange({
                  ...editForm,
                  restaurantName: e.target.value,
                })
              }
              className="font-semibold text-lg"
              placeholder="Restaurant name"
            />
          ) : (
            <CardTitle className="text-lg line-clamp-2">
              {result.restaurantName}
            </CardTitle>
          )}
          
          <div className="flex gap-1 flex-shrink-0">
            {!isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(result)}
                  className="h-8 w-8"
                >
                  <Edit size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(result.id)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 size={14} />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onSave(result.id)}
                  className="h-8 w-8 text-green-600 hover:text-green-600"
                >
                  <Save size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onCancel}
                  className="h-8 w-8"
                >
                  <X size={14} />
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock size={12} />
          <span>{formatDate(result.processedAt)}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Dish Name */}
        {(result.dishName || isEditing) && (
          <div>
            <Label className="text-xs text-muted-foreground">Dish</Label>
            {isEditing ? (
              <Input
                value={editForm.dishName}
                onChange={(e) =>
                  onEditFormChange({
                    ...editForm,
                    dishName: e.target.value,
                  })
                }
                placeholder="Dish name (optional)"
                className="mt-1"
              />
            ) : (
              <p className="text-sm font-medium">{result.dishName}</p>
            )}
          </div>
        )}

        {/* Address */}
        {(result.address || isEditing) && (
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin size={12} />
              Address
            </Label>
            {isEditing ? (
              <Input
                value={editForm.address}
                onChange={(e) =>
                  onEditFormChange({
                    ...editForm,
                    address: e.target.value,
                  })
                }
                placeholder="Restaurant address (optional)"
                className="mt-1"
              />
            ) : (
              <p className="text-sm">{result.address}</p>
            )}
          </div>
        )}

        {/* Social Media Handle */}
        {(result.socialMediaHandle || isEditing) && (
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Instagram size={12} />
              Social Media
            </Label>
            {isEditing ? (
              <Input
                value={editForm.socialMediaHandle}
                onChange={(e) =>
                  onEditFormChange({
                    ...editForm,
                    socialMediaHandle: e.target.value,
                  })
                }
                placeholder="@username (optional)"
                className="mt-1"
              />
            ) : (
              <p className="text-sm font-mono">{result.socialMediaHandle}</p>
            )}
          </div>
        )}

        {/* Description */}
        <div>
          <Label className="text-xs text-muted-foreground">Description</Label>
          {isEditing ? (
            <Textarea
              value={editForm.description}
              onChange={(e) =>
                onEditFormChange({
                  ...editForm,
                  description: e.target.value,
                })
              }
              placeholder="Description"
              className="mt-1 min-h-[80px] resize-none"
            />
          ) : (
            <p className="text-sm text-muted-foreground mt-1">
              {result.description}
            </p>
          )}
        </div>

        {/* Original Filename */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            From: {result.originalFilename}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Zhongcao;
