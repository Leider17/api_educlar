import { Router } from "express";
import descuentoControlador from "../controladores/DescuentoControlador";
import { verifyToken } from '../middleware/Auth';
class DescuentoRuta {
   public ApiRoute: Router;

   constructor() {
      this.ApiRoute = Router();
      this.routesConfig();
   };

   public routesConfig() {
      this.ApiRoute.get("/", verifyToken, descuentoControlador.get);
      this.ApiRoute.post("/create", verifyToken, descuentoControlador.create);
      this.ApiRoute.delete("/delete/:id", verifyToken, descuentoControlador.delete);
      this.ApiRoute.put("/update/:id", verifyToken, descuentoControlador.update);
   }
}

const descuentoRuta = new DescuentoRuta();
export default descuentoRuta.ApiRoute;