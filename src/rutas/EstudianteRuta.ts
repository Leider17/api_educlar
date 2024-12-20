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
      this.ApiRoute.get("/matriculaPagos/:idEstu", estudianteControlador.getMatricula);
      this.ApiRoute.get("/horario/:idEstu", estudianteControlador.getHorario);
      this.ApiRoute.get("/materiasValidas/:idEstu", estudianteControlador.getMateriasValidas);
      this.ApiRoute.put("/pagarMatricula/:idEstu", estudianteControlador.pagarMatricula);
      this.ApiRoute.post("/matricularMateria/:idEstu", estudianteControlador.matricularMateria);
      this.ApiRoute.put("/cambiarGrupo/:idEstu", estudianteControlador.cambiarGrupo);
      this.ApiRoute.delete("/eliminarGrupo/:idEstu", estudianteControlador.eliminarGrupo);
   }
}

const estudianteRuta = new EstudianteRuta();
export default estudianteRuta.ApiRoute;