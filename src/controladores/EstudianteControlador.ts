import { Request, Response } from "express";
import EstudianteDao from "../dao/EstudianteDao";

export class EstudianteControlador extends EstudianteDao {
   public getPerfil(req:Request, res:Response) {
      EstudianteControlador.infoPerfil(req.params.idEstu, res);
   }

   public getSemaforo(req:Request, res:Response) {
      EstudianteControlador.semaforo(req.params.idEstu, res);
   }
   public getMatricula(req:Request, res:Response) {
      EstudianteControlador.matriculaEstudiante(req.params.idEstu, res);
   }

   public getHorario(req:Request, res:Response) {
      EstudianteControlador.horario(req.params.idEstu, res);
   }
}

const estudianteControlador = new EstudianteControlador();
export default estudianteControlador;