import { Router } from "express";
import descuentoControlador from "../controladores/DescuentoControlador";

class DescuentoRuta {
   public ApiRoute: Router;

   constructor() {
      this.ApiRoute = Router();
      this.routesConfig();
   };

   public routesConfig() {
      this.ApiRoute.get("/", descuentoControlador.get);
      this.ApiRoute.post("/create", descuentoControlador.create);
      this.ApiRoute.delete("/delete/:id", descuentoControlador.delete);
      this.ApiRoute.put("/update/:id", descuentoControlador.update);
   }
}

const descuentoRuta = new DescuentoRuta();
export default descuentoRuta.ApiRoute;