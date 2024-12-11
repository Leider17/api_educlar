import { Router } from "express";
import estudianteControlador from "../controladores/EstudianteControlador";

class EstudianteRuta {
   public ApiRoute: Router;

   constructor() {
      this.ApiRoute = Router();
      this.routesConfig();
   };

   public routesConfig() {
      this.ApiRoute.get("/infoPerfil/:idEstu", estudianteControlador.getPerfil);
      this.ApiRoute.get("/semaforo/:idEstu", estudianteControlador.getSemaforo);
   }
}

const estudianteRuta = new EstudianteRuta();
export default estudianteRuta.ApiRoute;