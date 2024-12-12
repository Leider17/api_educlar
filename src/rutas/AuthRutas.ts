import { Router } from "express";
import authControlador from "../controladores/AuthControlador";

class AuthRuta {
   public ApiRoute: Router;

   constructor() {
      this.ApiRoute = Router();
      this.routesConfig();
   };

   public routesConfig() {
      this.ApiRoute.post("/ingresar", authControlador.login);
      this.ApiRoute.get("/verificarToken", authControlador.verifyToken);
   }
}

const authRuta = new AuthRuta();
export default authRuta.ApiRoute;