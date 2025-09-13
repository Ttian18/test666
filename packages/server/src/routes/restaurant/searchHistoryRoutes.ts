import express from "express";
import { z } from "zod";
import RestaurantSearchHistory from "../../models/entities/RestaurantSearchHistory.ts";
import { getUserForPersonalization } from "../../services/auth/authUtils.ts";

const router = express.Router();

// Validation schemas
const GetSearchHistoryQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 20)),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 0)),
  days: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 30)),
});

const DeleteSearchHistoryParamsSchema = z.object({
  id: z.string().transform((val) => parseInt(val)),
});

const UpdateSearchHistorySchema = z.object({
  search_query: z.string().optional(),
  location: z.string().optional(),
  search_results: z.any().optional(),
  result_count: z.number().optional(),
  user_preferences: z.any().optional(),
});

const BulkDeleteSchema = z.object({
  ids: z.array(z.number()),
});

const SearchInHistorySchema = z.object({
  searchTerm: z.string().min(1),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 20)),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 0)),
});

const DateRangeSchema = z.object({
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 20)),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 0)),
});

// GET /search-history - Get user's restaurant search history
router.get("/", async (req, res) => {
  try {
    // Check authentication
    const token = req.header("x-auth-token");
    if (!token) {
      return res.status(401).json({
        error: "Authentication required",
        code: "AUTHENTICATION_REQUIRED",
      });
    }

    const userData = await getUserForPersonalization(token);
    if (!userData) {
      return res.status(401).json({
        error: "Invalid authentication token",
        code: "INVALID_TOKEN",
      });
    }

    // Validate query parameters
    const { limit, offset, days } = GetSearchHistoryQuerySchema.parse(
      req.query
    );

    // Get search history
    const searchHistory = await RestaurantSearchHistory.findRecentByUserId(
      userData.id,
      days,
      {
        take: Math.min(limit, 100), // Cap at 100
        skip: offset,
        orderBy: "created_at",
        orderDirection: "desc",
      }
    );

    // Get search statistics
    const stats = await RestaurantSearchHistory.getSearchStats(userData.id);

    res.json({
      success: true,
      data: {
        searchHistory: searchHistory.map((sh) => ({
          id: sh.id,
          search_query: sh.search_query,
          location: sh.location,
          result_count: sh.result_count,
          created_at: sh.created_at,
          updated_at: sh.updated_at,
          // Don't include full search_results in list view for performance
        })),
        stats,
        pagination: {
          limit,
          offset,
          total: stats.totalSearches,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching search history:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid query parameters",
        code: "INVALID_PARAMETERS",
        details: error.errors,
      });
    }

    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
});

// GET /search-history/:id - Get specific search history with full results
router.get("/:id", async (req, res) => {
  try {
    // Check authentication
    const token = req.header("x-auth-token");
    if (!token) {
      return res.status(401).json({
        error: "Authentication required",
        code: "AUTHENTICATION_REQUIRED",
      });
    }

    const userData = await getUserForPersonalization(token);
    if (!userData) {
      return res.status(401).json({
        error: "Invalid authentication token",
        code: "INVALID_TOKEN",
      });
    }

    // Validate parameters
    const { id } = DeleteSearchHistoryParamsSchema.parse(req.params);

    // Get search history
    const searchHistory = await RestaurantSearchHistory.findById(id);

    if (!searchHistory) {
      return res.status(404).json({
        error: "Search history not found",
        code: "NOT_FOUND",
      });
    }

    // Check if user owns this search history
    if (searchHistory.user_id !== userData.id) {
      return res.status(403).json({
        error: "Access denied",
        code: "ACCESS_DENIED",
      });
    }

    res.json({
      success: true,
      data: {
        id: searchHistory.id,
        search_query: searchHistory.search_query,
        location: searchHistory.location,
        search_results: searchHistory.search_results,
        result_count: searchHistory.result_count,
        user_preferences: searchHistory.user_preferences,
        created_at: searchHistory.created_at,
        updated_at: searchHistory.updated_at,
      },
    });
  } catch (error) {
    console.error("Error fetching search history details:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid parameters",
        code: "INVALID_PARAMETERS",
        details: error.errors,
      });
    }

    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
});

// DELETE /search-history/:id - Delete specific search history
router.delete("/:id", async (req, res) => {
  try {
    // Check authentication
    const token = req.header("x-auth-token");
    if (!token) {
      return res.status(401).json({
        error: "Authentication required",
        code: "AUTHENTICATION_REQUIRED",
      });
    }

    const userData = await getUserForPersonalization(token);
    if (!userData) {
      return res.status(401).json({
        error: "Invalid authentication token",
        code: "INVALID_TOKEN",
      });
    }

    // Validate parameters
    const { id } = DeleteSearchHistoryParamsSchema.parse(req.params);

    // Check if search history exists and belongs to user
    const searchHistory = await RestaurantSearchHistory.findById(id);

    if (!searchHistory) {
      return res.status(404).json({
        error: "Search history not found",
        code: "NOT_FOUND",
      });
    }

    if (searchHistory.user_id !== userData.id) {
      return res.status(403).json({
        error: "Access denied",
        code: "ACCESS_DENIED",
      });
    }

    // Delete search history
    await RestaurantSearchHistory.deleteById(id);

    res.json({
      success: true,
      message: "Search history deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting search history:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid parameters",
        code: "INVALID_PARAMETERS",
        details: error.errors,
      });
    }

    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
});

// PUT /search-history/:id - Update specific search history
router.put("/:id", async (req, res) => {
  try {
    // Check authentication
    const token = req.header("x-auth-token");
    if (!token) {
      return res.status(401).json({
        error: "Authentication required",
        code: "AUTHENTICATION_REQUIRED",
      });
    }

    const userData = await getUserForPersonalization(token);
    if (!userData) {
      return res.status(401).json({
        error: "Invalid authentication token",
        code: "INVALID_TOKEN",
      });
    }

    // Validate parameters
    const { id } = DeleteSearchHistoryParamsSchema.parse(req.params);
    const updateData = UpdateSearchHistorySchema.parse(req.body);

    // Update search history (with user ownership check)
    const updatedHistory = await RestaurantSearchHistory.updateByIdAndUserId(
      id,
      userData.id,
      updateData
    );

    if (!updatedHistory) {
      return res.status(404).json({
        error: "Search history not found or access denied",
        code: "NOT_FOUND",
      });
    }

    res.json({
      success: true,
      message: "Search history updated successfully",
      data: {
        id: updatedHistory.id,
        search_query: updatedHistory.search_query,
        location: updatedHistory.location,
        result_count: updatedHistory.result_count,
        created_at: updatedHistory.created_at,
        updated_at: updatedHistory.updated_at,
      },
    });
  } catch (error) {
    console.error("Error updating search history:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid parameters",
        code: "INVALID_PARAMETERS",
        details: error.errors,
      });
    }

    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
});

// POST /search-history/search - Search within search history
router.post("/search", async (req, res) => {
  try {
    // Check authentication
    const token = req.header("x-auth-token");
    if (!token) {
      return res.status(401).json({
        error: "Authentication required",
        code: "AUTHENTICATION_REQUIRED",
      });
    }

    const userData = await getUserForPersonalization(token);
    if (!userData) {
      return res.status(401).json({
        error: "Invalid authentication token",
        code: "INVALID_TOKEN",
      });
    }

    // Validate request body
    const { searchTerm, limit, offset } = SearchInHistorySchema.parse(req.body);

    // Search in history
    const searchResults = await RestaurantSearchHistory.searchInHistory(
      userData.id,
      searchTerm,
      {
        take: Math.min(limit, 100),
        skip: offset,
        orderBy: "created_at",
        orderDirection: "desc",
      }
    );

    res.json({
      success: true,
      data: {
        searchResults: searchResults.map((sh) => ({
          id: sh.id,
          search_query: sh.search_query,
          location: sh.location,
          result_count: sh.result_count,
          created_at: sh.created_at,
          updated_at: sh.updated_at,
        })),
        pagination: {
          limit,
          offset,
          total: searchResults.length,
        },
      },
    });
  } catch (error) {
    console.error("Error searching in history:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid parameters",
        code: "INVALID_PARAMETERS",
        details: error.errors,
      });
    }

    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
});

// POST /search-history/date-range - Get search history by date range
router.post("/date-range", async (req, res) => {
  try {
    // Check authentication
    const token = req.header("x-auth-token");
    if (!token) {
      return res.status(401).json({
        error: "Authentication required",
        code: "AUTHENTICATION_REQUIRED",
      });
    }

    const userData = await getUserForPersonalization(token);
    if (!userData) {
      return res.status(401).json({
        error: "Invalid authentication token",
        code: "INVALID_TOKEN",
      });
    }

    // Validate request body
    const { startDate, endDate, limit, offset } = DateRangeSchema.parse(
      req.body
    );

    // Get search history by date range
    const searchHistory = await RestaurantSearchHistory.findByDateRange(
      userData.id,
      startDate,
      endDate,
      {
        take: Math.min(limit, 100),
        skip: offset,
        orderBy: "created_at",
        orderDirection: "desc",
      }
    );

    res.json({
      success: true,
      data: {
        searchHistory: searchHistory.map((sh) => ({
          id: sh.id,
          search_query: sh.search_query,
          location: sh.location,
          result_count: sh.result_count,
          created_at: sh.created_at,
          updated_at: sh.updated_at,
        })),
        pagination: {
          limit,
          offset,
          total: searchHistory.length,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching search history by date range:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid parameters",
        code: "INVALID_PARAMETERS",
        details: error.errors,
      });
    }

    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
});

// POST /search-history/bulk-delete - Delete multiple search history records
router.post("/bulk-delete", async (req, res) => {
  try {
    // Check authentication
    const token = req.header("x-auth-token");
    if (!token) {
      return res.status(401).json({
        error: "Authentication required",
        code: "AUTHENTICATION_REQUIRED",
      });
    }

    const userData = await getUserForPersonalization(token);
    if (!userData) {
      return res.status(401).json({
        error: "Invalid authentication token",
        code: "INVALID_TOKEN",
      });
    }

    // Validate request body
    const { ids } = BulkDeleteSchema.parse(req.body);

    if (ids.length === 0) {
      return res.status(400).json({
        error: "No IDs provided",
        code: "INVALID_PARAMETERS",
      });
    }

    // Verify all records belong to the user before deleting
    const userRecords = await RestaurantSearchHistory.findByUserId(userData.id);
    const userRecordIds = userRecords.map((record) => record.id);
    const validIds = ids.filter((id) => userRecordIds.includes(id));

    if (validIds.length !== ids.length) {
      return res.status(403).json({
        error: "Some records do not belong to the user",
        code: "ACCESS_DENIED",
      });
    }

    // Delete the records
    const deletedCount = await RestaurantSearchHistory.deleteByIds(validIds);

    res.json({
      success: true,
      message: `Deleted ${deletedCount} search history records`,
      deletedCount,
    });
  } catch (error) {
    console.error("Error bulk deleting search history:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid parameters",
        code: "INVALID_PARAMETERS",
        details: error.errors,
      });
    }

    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
});

// DELETE /search-history - Delete all user's search history
router.delete("/", async (req, res) => {
  try {
    // Check authentication
    const token = req.header("x-auth-token");
    if (!token) {
      return res.status(401).json({
        error: "Authentication required",
        code: "AUTHENTICATION_REQUIRED",
      });
    }

    const userData = await getUserForPersonalization(token);
    if (!userData) {
      return res.status(401).json({
        error: "Invalid authentication token",
        code: "INVALID_TOKEN",
      });
    }

    // Delete all search history for user
    const deletedCount = await RestaurantSearchHistory.deleteByUserId(
      userData.id
    );

    res.json({
      success: true,
      message: `Deleted ${deletedCount} search history records`,
      deletedCount,
    });
  } catch (error) {
    console.error("Error deleting all search history:", error);
    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
});

export default router;
