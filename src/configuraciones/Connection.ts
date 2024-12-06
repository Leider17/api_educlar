import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

export const myDataSource = new DataSource({
    type: "postgres", 
    host: process.env.DB_HOST,
    port: Number(process.env.PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: ["src/entidades/*.ts"],
    logging: process.env.DB_LOGGING === "true",
    synchronize: process.env.DB_SYNCHRONIZE === "true",
});

export const connectToDatabase = async () => {
    try {
        await myDataSource.initialize();
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Error connecting to the database", error);
        process.exit(1); 
    }
};



