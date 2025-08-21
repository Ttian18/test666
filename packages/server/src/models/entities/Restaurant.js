import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class Restaurant {
  constructor(data = {}) {
    this.id = data.id;
    this.name = data.name;
    this.address = data.address;
    this.phone = data.phone;
    this.website = data.website;
    this.cuisine = data.cuisine;
    this.price_range = data.price_range;
    this.rating = data.rating;
    this.hours = data.hours;
    this.special_features = data.special_features;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new restaurant
  static async create(restaurantData) {
    try {
      const restaurant = await prisma.restaurant.create({
        data: restaurantData,
      });
      return new Restaurant(restaurant);
    } catch (error) {
      throw new Error(`Failed to create restaurant: ${error.message}`);
    }
  }

  // Find restaurant by ID
  static async findById(id) {
    try {
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: parseInt(id) },
      });
      return restaurant ? new Restaurant(restaurant) : null;
    } catch (error) {
      throw new Error(`Failed to find restaurant: ${error.message}`);
    }
  }

  // Find restaurants by location
  static async findByLocation(location, options = {}) {
    try {
      const { take = 10, skip = 0 } = options;
      const restaurants = await prisma.restaurant.findMany({
        where: {
          address: {
            contains: location,
            mode: "insensitive",
          },
        },
        take,
        skip,
        orderBy: { rating: "desc" },
      });
      return restaurants.map((r) => new Restaurant(r));
    } catch (error) {
      throw new Error(`Failed to find restaurants: ${error.message}`);
    }
  }

  // Find restaurants by cuisine
  static async findByCuisine(cuisine, options = {}) {
    try {
      const { take = 10, skip = 0 } = options;
      const restaurants = await prisma.restaurant.findMany({
        where: {
          cuisine: {
            contains: cuisine,
            mode: "insensitive",
          },
        },
        take,
        skip,
        orderBy: { rating: "desc" },
      });
      return restaurants.map((r) => new Restaurant(r));
    } catch (error) {
      throw new Error(`Failed to find restaurants: ${error.message}`);
    }
  }

  // Update restaurant
  async update(updateData) {
    try {
      const updated = await prisma.restaurant.update({
        where: { id: this.id },
        data: updateData,
      });
      Object.assign(this, updated);
      return this;
    } catch (error) {
      throw new Error(`Failed to update restaurant: ${error.message}`);
    }
  }

  // Delete restaurant
  async delete() {
    try {
      await prisma.restaurant.delete({
        where: { id: this.id },
      });
      return true;
    } catch (error) {
      throw new Error(`Failed to delete restaurant: ${error.message}`);
    }
  }

  // Get restaurant statistics
  static async getStats() {
    try {
      const stats = await prisma.restaurant.groupBy({
        by: ["cuisine"],
        _count: {
          id: true,
        },
        _avg: {
          rating: true,
        },
      });
      return stats;
    } catch (error) {
      throw new Error(`Failed to get restaurant stats: ${error.message}`);
    }
  }

  // Convert to plain object
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      address: this.address,
      phone: this.phone,
      website: this.website,
      cuisine: this.cuisine,
      price_range: this.price_range,
      rating: this.rating,
      hours: this.hours,
      special_features: this.special_features,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

export default Restaurant;
