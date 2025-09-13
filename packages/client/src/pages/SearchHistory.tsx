import React, { useState, useEffect } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import { RestaurantService } from "../services/restaurantService";
import { useToast } from "../hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  History,
  Search,
  MapPin,
  Calendar,
  Trash2,
  Eye,
  Filter,
  RefreshCw,
  Edit,
  Download,
  CheckSquare,
  Square,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SearchHistoryItem {
  id: number;
  search_query: string;
  location: string | null;
  result_count: number;
  created_at: string;
  updated_at: string;
}

interface SearchHistoryDetails {
  id: number;
  search_query: string;
  location: string | null;
  search_results: any[];
  result_count: number;
  user_preferences: any;
  created_at: string;
  updated_at: string;
}

interface SearchStats {
  totalSearches: number;
  uniqueQueries: number;
  mostSearchedLocation: string | null;
  lastSearchDate: string | null;
}

const SearchHistory = () => {
  const { token, user } = useAuthContext();
  const { toast } = useToast();

  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [stats, setStats] = useState<SearchStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<SearchHistoryDetails | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<SearchHistoryItem | null>(
    null
  );
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);

  // Filters
  const [daysFilter, setDaysFilter] = useState("30");
  const [limitFilter, setLimitFilter] = useState("20");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (token) {
      fetchSearchHistory();
    }
  }, [token, daysFilter, limitFilter]);

  const fetchSearchHistory = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await RestaurantService.getSearchHistory(token, {
        days: parseInt(daysFilter),
        limit: parseInt(limitFilter),
      });

      setSearchHistory(response.searchHistory);
      setStats(response.stats);
    } catch (error) {
      console.error("Error fetching search history:", error);
      toast({
        title: "Error",
        description: "Failed to load search history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSearchDetails = async (id: number) => {
    if (!token) return;

    try {
      setIsDetailsLoading(true);
      const details = await RestaurantService.getSearchHistoryDetails(
        id,
        token
      );
      setSelectedItem(details);
      setIsDetailsOpen(true);
    } catch (error) {
      console.error("Error fetching search details:", error);
      toast({
        title: "Error",
        description: "Failed to load search details",
        variant: "destructive",
      });
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const deleteSearchHistory = async (id: number) => {
    if (!token) return;

    try {
      await RestaurantService.deleteSearchHistory(id, token);
      toast({
        title: "Success",
        description: "Search history deleted successfully",
      });
      fetchSearchHistory(); // Refresh the list
    } catch (error) {
      console.error("Error deleting search history:", error);
      toast({
        title: "Error",
        description: "Failed to delete search history",
        variant: "destructive",
      });
    }
  };

  const deleteAllSearchHistory = async () => {
    if (!token) return;

    try {
      const result = await RestaurantService.deleteAllSearchHistory(token);
      toast({
        title: "Success",
        description: `Deleted ${result.deletedCount} search history records`,
      });
      fetchSearchHistory(); // Refresh the list
    } catch (error) {
      console.error("Error deleting all search history:", error);
      toast({
        title: "Error",
        description: "Failed to delete all search history",
        variant: "destructive",
      });
    }
  };

  const updateSearchHistory = async (id: number, updateData: any) => {
    if (!token) return;

    try {
      await RestaurantService.updateSearchHistory(id, updateData, token);
      toast({
        title: "Success",
        description: "Search history updated successfully",
      });
      fetchSearchHistory(); // Refresh the list
      setIsEditing(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Error updating search history:", error);
      toast({
        title: "Error",
        description: "Failed to update search history",
        variant: "destructive",
      });
    }
  };

  const searchInHistory = async (searchTerm: string) => {
    if (!token || !searchTerm.trim()) return;

    try {
      setIsLoading(true);
      const response = await RestaurantService.searchInHistory(
        searchTerm,
        token,
        {
          limit: parseInt(limitFilter),
        }
      );

      setSearchHistory(response.searchResults);
    } catch (error) {
      console.error("Error searching in history:", error);
      toast({
        title: "Error",
        description: "Failed to search in history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSearchHistoryByDateRange = async () => {
    if (!token || !dateRangeFilter.startDate || !dateRangeFilter.endDate)
      return;

    try {
      setIsLoading(true);
      const response = await RestaurantService.getSearchHistoryByDateRange(
        dateRangeFilter.startDate,
        dateRangeFilter.endDate,
        token,
        {
          limit: parseInt(limitFilter),
        }
      );

      setSearchHistory(response.searchHistory);
    } catch (error) {
      console.error("Error fetching search history by date range:", error);
      toast({
        title: "Error",
        description: "Failed to fetch search history by date range",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const bulkDeleteSearchHistory = async () => {
    if (!token || selectedItems.length === 0) return;

    try {
      const result = await RestaurantService.bulkDeleteSearchHistory(
        selectedItems,
        token
      );
      toast({
        title: "Success",
        description: `Deleted ${result.deletedCount} search history records`,
      });
      setSelectedItems([]);
      setIsBulkMode(false);
      fetchSearchHistory(); // Refresh the list
    } catch (error) {
      console.error("Error bulk deleting search history:", error);
      toast({
        title: "Error",
        description: "Failed to bulk delete search history",
        variant: "destructive",
      });
    }
  };

  const toggleItemSelection = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllItems = () => {
    setSelectedItems(filteredHistory.map((item) => item.id));
  };

  const deselectAllItems = () => {
    setSelectedItems([]);
  };

  const exportSearchHistory = () => {
    const dataToExport = filteredHistory.map((item) => ({
      "Search Query": item.search_query,
      Location: item.location || "N/A",
      "Result Count": item.result_count,
      "Created At": new Date(item.created_at).toLocaleString(),
    }));

    const csvContent = [
      Object.keys(dataToExport[0]).join(","),
      ...dataToExport.map((item) => Object.values(item).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `search-history-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Search history exported successfully",
    });
  };

  const filteredHistory = searchHistory.filter(
    (item) =>
      item.search_query.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location &&
        item.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                Authentication Required
              </h3>
              <p className="text-muted-foreground">
                Please log in to view your search history.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Search History</h1>
        <p className="text-muted-foreground">
          View and manage your restaurant search history
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Searches
                  </p>
                  <p className="text-2xl font-bold">{stats.totalSearches}</p>
                </div>
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Unique Queries
                  </p>
                  <p className="text-2xl font-bold">{stats.uniqueQueries}</p>
                </div>
                <History className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Most Searched
                  </p>
                  <p className="text-lg font-bold truncate">
                    {stats.mostSearchedLocation || "N/A"}
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Last Search
                  </p>
                  <p className="text-sm font-bold">
                    {stats.lastSearchDate
                      ? formatDistanceToNow(new Date(stats.lastSearchDate), {
                          addSuffix: true,
                        })
                      : "Never"}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search queries or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="days">Time Period</Label>
              <Select value={daysFilter} onValueChange={setDaysFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="limit">Results per page</Label>
              <Select value={limitFilter} onValueChange={setLimitFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 results</SelectItem>
                  <SelectItem value="20">20 results</SelectItem>
                  <SelectItem value="50">50 results</SelectItem>
                  <SelectItem value="100">100 results</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button
                onClick={fetchSearchHistory}
                disabled={isLoading}
                className="flex-1"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                onClick={() => setIsBulkMode(!isBulkMode)}
                variant={isBulkMode ? "default" : "outline"}
                className="flex-1"
              >
                {isBulkMode ? "Exit Bulk" : "Bulk Mode"}
              </Button>
              <Button
                onClick={exportSearchHistory}
                variant="outline"
                disabled={filteredHistory.length === 0}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search History List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading search history...</span>
          </div>
        ) : filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  No search history found
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No searches match your filter criteria."
                    : "Start searching for restaurants to see your history here."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Bulk Actions Bar */}
            {isBulkMode && selectedItems.length > 0 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">
                        {selectedItems.length} item(s) selected
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectAllItems}
                      >
                        <CheckSquare className="h-4 w-4 mr-1" />
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={deselectAllItems}
                      >
                        <Square className="h-4 w-4 mr-1" />
                        Deselect All
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete Selected
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Selected Items
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete{" "}
                              {selectedItems.length} selected search history
                              records? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={bulkDeleteSearchHistory}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Selected
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search History Items */}
            {filteredHistory.map((item) => (
              <Card
                key={item.id}
                className={isBulkMode ? "cursor-pointer hover:bg-muted/50" : ""}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    {isBulkMode && (
                      <div className="mr-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleItemSelection(item.id)}
                          className="p-1"
                        >
                          {selectedItems.includes(item.id) ? (
                            <CheckSquare className="h-4 w-4" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {item.search_query}
                        </h3>
                        <Badge variant="secondary">
                          {item.result_count} results
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        {item.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{item.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDistanceToNow(new Date(item.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchSearchDetails(item.id)}
                        disabled={isDetailsLoading}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingItem(item);
                          setIsEditing(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Search History
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this search
                              history? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteSearchHistory(item.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete All Button */}
      {filteredHistory.length > 0 && (
        <div className="mt-8 flex justify-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All Search History
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete All Search History</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete all your search history? This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={deleteAllSearchHistory}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Search Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Search Details</DialogTitle>
            <DialogDescription>
              Full details of your restaurant search
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Search Query</h3>
                <p className="text-muted-foreground">
                  {selectedItem.search_query}
                </p>
              </div>

              {selectedItem.location && (
                <div>
                  <h3 className="font-semibold mb-2">Location</h3>
                  <p className="text-muted-foreground">
                    {selectedItem.location}
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">
                  Search Results ({selectedItem.result_count})
                </h3>
                <div className="space-y-3">
                  {selectedItem.search_results.map((restaurant, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{restaurant.name}</h4>
                            {restaurant.address && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {restaurant.address}
                              </p>
                            )}
                            {restaurant.cuisine && (
                              <Badge variant="outline" className="mt-2">
                                {restaurant.cuisine}
                              </Badge>
                            )}
                          </div>
                          {restaurant.rating && (
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                ⭐ {restaurant.rating}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Search History Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Search History</DialogTitle>
            <DialogDescription>
              Update your search history record
            </DialogDescription>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-query">Search Query</Label>
                <Input
                  id="edit-query"
                  value={editingItem.search_query}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      search_query: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={editingItem.location || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, location: e.target.value })
                  }
                  placeholder="Enter location (optional)"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingItem(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    updateSearchHistory(editingItem.id, {
                      search_query: editingItem.search_query,
                      location: editingItem.location,
                    })
                  }
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SearchHistory;
