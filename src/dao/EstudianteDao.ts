import { Response } from "express";
import { myDataSource } from "../configuraciones/Connection";
import { Estudiante } from "../entidades/Estudiante";
import { Programa } from "../entidades/Programa";

const estuRepository = myDataSource.getRepository(Estudiante);
const progRepository = myDataSource.getRepository(Programa);

class EstudianteDao {
   // obtener la informacion personal del estudiante
   static async infoPerfil(idEstu:any, res:Response) {
      try{
         const estudiante = await estuRepository.findOne({
            where: {estu_id:idEstu},
            relations: ['usuario', 'estudiantePrograma']
         });

         if(!estudiante){
            return res.status(404).json({ response:'El estudiante no existe' });
         }

         const programaEstu = await progRepository.findOneBy({
            prog_id: estudiante.estudiantePrograma[0].estu_prog_idProg
         });

         const dataPerfil = {
            "rutaImage": estudiante.usuario.usu_imagenPerfil,
            "documento": estudiante.usuario.usu_cod,
            "nombre": estudiante.usuario.usu_nombre,
            "programa": programaEstu?.prog_nombre,
            "correo": estudiante.usuario.usu_correo,
            "direccion": estudiante.usuario.usu_direccion
         }
         
         return res.status(200).json(dataPerfil);
      }catch(error){
         return res.status(500).json({ response:'No se pudo recuperar el estudiante' });
      }
   }
}

export default EstudianteDao;