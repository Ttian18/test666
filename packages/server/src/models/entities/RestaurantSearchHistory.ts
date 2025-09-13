import prisma from "../database/client.ts";

interface RestaurantSearchHistoryData {
  id?: number;
  user_id: number;
  search_query: string;
  location?: string;
  search_results: any; // JSON data
  result_count?: number;
  user_preferences?: any; // JSON data
  created_at?: Date;
  updated_at?: Date;
}

interface FindOptions {
  take?: number;
  skip?: number;
  orderBy?: "created_at" | "updated_at";
  orderDirection?: "asc" | "desc";
}

class RestaurantSearchHistory {
  public id?: number;
  public user_id: number;
  public search_query: string;
  public location?: string;
  public search_results: any;
  public result_count: number;
  public user_preferences?: any;
  public created_at?: Date;
  public updated_at?: Date;

  constructor(data: RestaurantSearchHistoryData) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.search_query = data.search_query;
    this.location = data.location;
    this.search_results = data.search_results;
    this.result_count = data.result_count || 0;
    this.user_preferences = data.user_preferences;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new search history record
  static async create(
    data: RestaurantSearchHistoryData
  ): Promise<RestaurantSearchHistory> {
    try {
      const searchHistory = await prisma.restaurantSearchHistory.create({
        data: {
          user_id: data.user_id,
          search_query: data.search_query,
          location: data.location,
          search_results: data.search_results,
          result_count: data.result_count || 0,
          user_preferences: data.user_preferences,
        },
      });
      return new RestaurantSearchHistory(searchHistory);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to create search history: ${errorMessage}`);
    }
  }

  // Find search history by ID
  static async findById(
    id: string | number
  ): Promise<RestaurantSearchHistory | null> {
    try {
      const searchHistory = await prisma.restaurantSearchHistory.findUnique({
        where: { id: parseInt(String(id)) },
      });
      return searchHistory ? new RestaurantSearchHistory(searchHistory) : null;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to find search history: ${errorMessage}`);
    }
  }

  // Find search history by user ID
  static async findByUserId(
    userId: number,
    options: FindOptions = {}
  ): Promise<RestaurantSearchHistory[]> {
    try {
      const {
        take = 20,
        skip = 0,
        orderBy = "created_at",
        orderDirection = "desc",
      } = options;

      const searchHistory = await prisma.restaurantSearchHistory.findMany({
        where: { user_id: userId },
        take,
        skip,
        orderBy: { [orderBy]: orderDirection },
      });

      return searchHistory.map((sh) => new RestaurantSearchHistory(sh));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to find search history by user: ${errorMessage}`);
    }
  }

  // Find recent searches by user ID (last 7 days)
  static async findRecentByUserId(
    userId: number,
    days: number = 7,
    options: FindOptions = {}
  ): Promise<RestaurantSearchHistory[]> {
    try {
      const {
        take = 10,
        skip = 0,
        orderBy = "created_at",
        orderDirection = "desc",
      } = options;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const searchHistory = await prisma.restaurantSearchHistory.findMany({
        where: {
          user_id: userId,
          created_at: {
            gte: cutoffDate,
          },
        },
        take,
        skip,
        orderBy: { [orderBy]: orderDirection },
      });

      return searchHistory.map((sh) => new RestaurantSearchHistory(sh));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to find recent search history: ${errorMessage}`);
    }
  }

  // Find search history by query (for duplicate detection)
  static async findByQuery(
    userId: number,
    query: string,
    hours: number = 24
  ): Promise<RestaurantSearchHistory | null> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - hours);

      const searchHistory = await prisma.restaurantSearchHistory.findFirst({
        where: {
          user_id: userId,
          search_query: query,
          created_at: {
            gte: cutoffDate,
          },
        },
        orderBy: { created_at: "desc" },
      });

      return searchHistory ? new RestaurantSearchHistory(searchHistory) : null;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `Failed to find search history by query: ${errorMessage}`
      );
    }
  }

  // Update search history by ID
  static async updateById(
    id: string | number,
    updateData: Partial<RestaurantSearchHistoryData>
  ): Promise<RestaurantSearchHistory | null> {
    try {
      const searchHistory = await prisma.restaurantSearchHistory.update({
        where: { id: parseInt(String(id)) },
        data: {
          ...(updateData.search_query && {
            search_query: updateData.search_query,
          }),
          ...(updateData.location !== undefined && {
            location: updateData.location,
          }),
          ...(updateData.search_results && {
            search_results: updateData.search_results,
          }),
          ...(updateData.result_count !== undefined && {
            result_count: updateData.result_count,
          }),
          ...(updateData.user_preferences !== undefined && {
            user_preferences: updateData.user_preferences,
          }),
          updated_at: new Date(),
        },
      });
      return new RestaurantSearchHistory(searchHistory);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to update search history: ${errorMessage}`);
    }
  }

  // Update search history by ID and user ID (for security)
  static async updateByIdAndUserId(
    id: string | number,
    userId: number,
    updateData: Partial<RestaurantSearchHistoryData>
  ): Promise<RestaurantSearchHistory | null> {
    try {
      // First check if the record exists and belongs to the user
      const existingRecord = await prisma.restaurantSearchHistory.findFirst({
        where: {
          id: parseInt(String(id)),
          user_id: userId,
        },
      });

      if (!existingRecord) {
        return null;
      }

      const searchHistory = await prisma.restaurantSearchHistory.update({
        where: { id: parseInt(String(id)) },
        data: {
          ...(updateData.search_query && {
            search_query: updateData.search_query,
          }),
          ...(updateData.location !== undefined && {
            location: updateData.location,
          }),
          ...(updateData.search_results && {
            search_results: updateData.search_results,
          }),
          ...(updateData.result_count !== undefined && {
            result_count: updateData.result_count,
          }),
          ...(updateData.user_preferences !== undefined && {
            user_preferences: updateData.user_preferences,
          }),
          updated_at: new Date(),
        },
      });
      return new RestaurantSearchHistory(searchHistory);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to update search history: ${errorMessage}`);
    }
  }

  // Delete search history by ID
  static async deleteById(id: string | number): Promise<boolean> {
    try {
      await prisma.restaurantSearchHistory.delete({
        where: { id: parseInt(String(id)) },
      });
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to delete search history: ${errorMessage}`);
    }
  }

  // Delete all search history for a user
  static async deleteByUserId(userId: number): Promise<number> {
    try {
      const result = await prisma.restaurantSearchHistory.deleteMany({
        where: { user_id: userId },
      });
      return result.count;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to delete user search history: ${errorMessage}`);
    }
  }

  // Find search history by location
  static async findByLocation(
    userId: number,
    location: string,
    options: FindOptions = {}
  ): Promise<RestaurantSearchHistory[]> {
    try {
      const {
        take = 20,
        skip = 0,
        orderBy = "created_at",
        orderDirection = "desc",
      } = options;

      const searchHistory = await prisma.restaurantSearchHistory.findMany({
        where: {
          user_id: userId,
          location: {
            contains: location,
            mode: "insensitive",
          },
        },
        take,
        skip,
        orderBy: { [orderBy]: orderDirection },
      });

      return searchHistory.map((sh) => new RestaurantSearchHistory(sh));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `Failed to find search history by location: ${errorMessage}`
      );
    }
  }

  // Search within search history (search queries and locations)
  static async searchInHistory(
    userId: number,
    searchTerm: string,
    options: FindOptions = {}
  ): Promise<RestaurantSearchHistory[]> {
    try {
      const {
        take = 20,
        skip = 0,
        orderBy = "created_at",
        orderDirection = "desc",
      } = options;

      const searchHistory = await prisma.restaurantSearchHistory.findMany({
        where: {
          user_id: userId,
          OR: [
            {
              search_query: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              location: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          ],
        },
        take,
        skip,
        orderBy: { [orderBy]: orderDirection },
      });

      return searchHistory.map((sh) => new RestaurantSearchHistory(sh));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to search in history: ${errorMessage}`);
    }
  }

  // Get search history with date range
  static async findByDateRange(
    userId: number,
    startDate: Date,
    endDate: Date,
    options: FindOptions = {}
  ): Promise<RestaurantSearchHistory[]> {
    try {
      const {
        take = 20,
        skip = 0,
        orderBy = "created_at",
        orderDirection = "desc",
      } = options;

      const searchHistory = await prisma.restaurantSearchHistory.findMany({
        where: {
          user_id: userId,
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
        take,
        skip,
        orderBy: { [orderBy]: orderDirection },
      });

      return searchHistory.map((sh) => new RestaurantSearchHistory(sh));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `Failed to find search history by date range: ${errorMessage}`
      );
    }
  }

  // Delete multiple search history records by IDs
  static async deleteByIds(ids: (string | number)[]): Promise<number> {
    try {
      const result = await prisma.restaurantSearchHistory.deleteMany({
        where: {
          id: {
            in: ids.map((id) => parseInt(String(id))),
          },
        },
      });
      return result.count;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `Failed to delete search history by IDs: ${errorMessage}`
      );
    }
  }

  // Delete search history by user ID and date range
  static async deleteByUserIdAndDateRange(
    userId: number,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    try {
      const result = await prisma.restaurantSearchHistory.deleteMany({
        where: {
          user_id: userId,
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
      });
      return result.count;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(
        `Failed to delete search history by date range: ${errorMessage}`
      );
    }
  }

  // Get search statistics for a user
  static async getSearchStats(userId: number): Promise<{
    totalSearches: number;
    uniqueQueries: number;
    mostSearchedLocation: string | null;
    lastSearchDate: Date | null;
  }> {
    try {
      const [totalSearches, uniqueQueries, locationStats, lastSearch] =
        await Promise.all([
          prisma.restaurantSearchHistory.count({
            where: { user_id: userId },
          }),
          prisma.restaurantSearchHistory.groupBy({
            by: ["search_query"],
            where: { user_id: userId },
            _count: { search_query: true },
          }),
          prisma.restaurantSearchHistory.groupBy({
            by: ["location"],
            where: {
              user_id: userId,
              location: { not: null },
            },
            _count: { location: true },
            orderBy: { _count: { location: "desc" } },
            take: 1,
          }),
          prisma.restaurantSearchHistory.findFirst({
            where: { user_id: userId },
            orderBy: { created_at: "desc" },
            select: { created_at: true },
          }),
        ]);

      return {
        totalSearches,
        uniqueQueries: uniqueQueries.length,
        mostSearchedLocation: locationStats[0]?.location || null,
        lastSearchDate: lastSearch?.created_at || null,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to get search stats: ${errorMessage}`);
    }
  }
}

export default RestaurantSearchHistory;
