import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import express from "express";
import { connectToDatabase } from "./Connection";
import apiDescuentoRuta from "../rutas/DescuentoRuta";
import apiEstudianteRuta from "../rutas/EstudianteRuta";
import apiAuthRoute from "../rutas/AuthRutas";

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
    this.app.use(
      cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );
    this.app.use(morgan("dev"));
    this.app.use(express.json({ limit: "50MB" }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  public startRoutes() {
    this.app.use("/descuentos", apiDescuentoRuta);
    this.app.use("/estudiantes", apiEstudianteRuta);
    this.app.use("/auth", apiAuthRoute);
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
