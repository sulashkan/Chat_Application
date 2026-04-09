import mongoose from "mongoose";

const RETRY_DELAY_MS = 5000;

const getMongoUri = (): string => {
  const mongoUri = process.env.MONGODB_URL || process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      "Missing MongoDB connection string. Set MONGODB_URL or MONGODB_URI in the backend environment."
    );
  }

  return mongoUri;
};

const formatMongoError = (error: unknown, mongoUri: string): string => {
  const message =
    error instanceof Error ? error.message : "Unknown MongoDB connection error";

  if (
    message.includes("whitelist") ||
    message.includes("IP") ||
    message.includes("ECONNREFUSED") ||
    message.includes("querySrv")
  ) {
    return [
      message,
      "",
      mongoUri.includes("mongodb+srv://")
        ? "MongoDB Atlas is rejecting or unreachable from this host. In production, allow the Railway backend in Atlas Network Access and verify the SRV connection string."
        : "Check that the MongoDB server is running and reachable from this host.",
    ].join("\n");
  }

  return message;
};

const connectDB = async (): Promise<void> => {
  const mongoUri = getMongoUri();
  let attempt = 1;

  while (true) {
    try {
      await mongoose.connect(mongoUri);
      console.log("MongoDB Connected Successfully");
      return;
    } catch (error) {
      console.error(
        `MongoDB connection attempt ${attempt} failed:`,
        formatMongoError(error, mongoUri)
      );
      attempt += 1;
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
};

export { formatMongoError };
export default connectDB;
