import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import express from "express";
import { connectToDatabase } from "./Connection";

class Server {
    public app: express.Application;

    constructor() {
        dotenv.config({ path: ".env" });
        this.app = express();
        this.startConf();
        this.startRoutes();
    }

    public startConf() {
        this.app.set("PORT", process.env.PORT);
        this.app.use(cors());
        this.app.use(morgan("dev"));
        this.app.use(express.json({ limit: "50MB" }));
        this.app.use(express.urlencoded({ extended: true }));
    }

    public startRoutes() {
        // Define tus rutas aquí
    }

    public async startServer() {
        try {
            await connectToDatabase(); 
            this.app.listen(this.app.get("PORT"), () => {
                console.log("Backend ready on port:", this.app.get("PORT"));
            });
        } catch (error) {
            console.error("Failed to start the server:", error);
        }
    }
}

export default Server;
