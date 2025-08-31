import dotenv from "dotenv";

dotenv.config();

interface DatabaseConfig {
  url?: string;
  host: string;
  port: number;
  username?: string;
  password?: string;
  database?: string;
  dialect: string;
  logging: boolean;
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
}

const databaseConfig: DatabaseConfig = {
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dialect: process.env.DB_DIALECT || "postgresql",
  logging: process.env.NODE_ENV === "development",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

export default databaseConfig;
