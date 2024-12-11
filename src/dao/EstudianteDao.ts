import { Response } from "express";
import { myDataSource } from "../configuraciones/Connection";
import { Estudiante } from "../entidades/Estudiante";
import { Programa } from "../entidades/Programa";
import { Asignatura } from "../entidades/Asignatura";
import { Matricula } from "../entidades/Matricula";
import { GrupoAMatricula } from "../entidades/GrupoAMatricula";
import { Periodo } from "../entidades/Periodo";
import { In } from "typeorm";

const estuRepository = myDataSource.getRepository(Estudiante);
const progRepository = myDataSource.getRepository(Programa);
const asigRepository = myDataSource.getRepository(Asignatura);
const matrRepository = myDataSource.getRepository(Matricula);
const grupMatrRepository = myDataSource.getRepository(GrupoAMatricula);
const periRepository = myDataSource.getRepository(Periodo);

interface IdsGrupMatr {
   idMatr: number;
   grupos: number[];
}
interface IdsAsig {
   idAsig: number;
   seme: number;
}
interface Contenido {
   id: number
   name: string
   status: string
}
interface MapaCarrera {
   [key: number]: Contenido[]
}

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

         const progAux = estudiante.estudiantePrograma[0];
         const programaEstu = await progRepository.findOne({
            where: {prog_id:progAux.estu_prog_idProg},
            relations: ['programaAsignatura']
         });

         if(!programaEstu){
            return res.status(404).json({ response:'El estudiante no pertenece a un programa' });
         }

         // Guardar las ids de las asignaturas de la carrera
         const idsAsig = programaEstu.programaAsignatura.map(item => item.prog_asig_idAsig);
         if(!idsAsig){
            return res.status(404).json({ response:'El programa no tiene asignaturas' });
         }
         const creditosTotal = await obtenerCreditosAsignaturas(idsAsig);
         const creditosAprobados = estudiante.estu_creditosAprobados;
         

         const matriculasEstu = await matrRepository.find({
            where: {matr_estudiante:idEstu},
            relations: ['grupoMatricula']
         });
         // Guarda los grupos de una matricula, almacenados en la intermedia
         const matrAux = matriculasEstu.map(item => ({
            idMatr: item.matr_id,
            grupoMatricula: item.grupoMatricula
         }));
         // Guardar las ids de los grupos que vio en el semestre
         const idsGrupMatr = matrAux.flat().map(item => ({
            idMatr: item.idMatr,
            grupos: item.grupoMatricula.map(subitem => subitem.grup_matr_idGrup)
         }));


         const promedio = await obtenerPromedioAcumulado(idsGrupMatr);
         const progreso = ((creditosAprobados/creditosTotal)*100).toFixed(2);
         

         const dataPerfil = {
            "image": estudiante.usuario.usu_imagenPerfil,
            user: {
               "id": estudiante.usuario.usu_cod,
               "name": estudiante.usuario.usu_nombre,
               "carrer": programaEstu?.prog_nombre,
               "email": estudiante.usuario.usu_correo,
               "location": estudiante.usuario.usu_direccion
            },
            stats: {
               "period": progAux.estu_prog_semestre-1,      // Un semestre antes del actual
               "semester": progAux.estu_prog_semestre,
               "average": Number(promedio),
               "totalCredits": creditosTotal,
               "approvedCredits": creditosAprobados,
               "progress": progreso
            }
         }
         
         return res.status(200).json(dataPerfil);
      }catch(error){
         return res.status(500).json({ response:'No se pudo recuperar informacion sobre el estudiante' });
      }
   }

   static async semaforo(idEstu:any, res:Response) {
      try{
         const estudiante = await estuRepository.findOne({
            where: {estu_id:idEstu},
            relations: ['usuario', 'estudiantePrograma']
         });

         if(!estudiante){
            return res.status(404).json({ response:'El estudiante no existe' });
         }


         const progAux = estudiante.estudiantePrograma[0];
         const programaEstu = await progRepository.findOne({
            where: {prog_id:progAux.estu_prog_idProg},
            relations: ['programaAsignatura']
         });

         if(!programaEstu){
            return res.status(404).json({ response:'El estudiante no pertenece a un programa' });
         }


         // Guardar las ids de las asignaturas de la carrera
         const idsAsig = programaEstu.programaAsignatura.map(item => ({
            idAsig: item.prog_asig_idAsig,
            seme: item.prog_asig_semestre
         }));
         if(!idsAsig){
            return res.status(404).json({ response:'El programa no tiene asignaturas' });
         }


         const matriculasEstu = await matrRepository.find({
            where: {matr_estudiante:idEstu},
            relations: ['grupoMatricula']
         });
         // Guarda los grupos de una matricula, almacenados en la intermedia
         const matrAux = matriculasEstu.map(item => ({
            idMatr: item.matr_id,
            grupoMatricula: item.grupoMatricula
         }));
         // Guardar las ids de los grupos que vio en el semestre
         const idsGrupMatr = matrAux.flat().map(item => ({
            idMatr: item.idMatr,
            grupos: item.grupoMatricula.map(subitem => subitem.grup_matr_idGrup)
         }));


         const semaforo = await generarSemaforo(idsAsig,idsGrupMatr);

         return res.status(200).json(semaforo);
      }catch(error){
         return res.status(500).json({ response:'No se pudo obtener el semaforo estudiantil' });
      }
   }
}

async function obtenerCreditosAsignaturas(ids:number[]) {
   const asignaturas = await asigRepository.findBy({ asig_id: In(ids) });
   const creditos =  asignaturas.reduce((total, asignatura) => total + asignatura.asig_creditos, 0);
   return creditos;
}

async function obtenerPromedioAcumulado(ids:IdsGrupMatr[]) {
   const idsGrupos = ids.flatMap(item => item.grupos);
   const result = await grupMatrRepository
      .createQueryBuilder('gm')
      .innerJoin('gm.grupo', 'grupo')
      .innerJoin('grupo.asignatura', 'asig')
      .select('SUM(gm.grup_matr_nota * asig.asig_creditos)', 'suma')
      .addSelect('SUM(asig.asig_creditos)', 'creditos')
      .where('gm.grup_matr_estado = :estado', { estado: true })
      .andWhere('gm.grup_matr_idGrup IN (:...idsGrupos)', { idsGrupos })
      .andWhere('gm.grup_matr_idMatr IN (:...idsMatriculas)', { idsMatriculas: ids.map(item => item.idMatr) })
      .getRawOne();

   return (result.suma / result.creditos).toFixed(2);
}

async function generarSemaforo(idsAsig:IdsAsig[],idsGrMa:IdsGrupMatr[]) {
   const data : MapaCarrera = {};

   for(let i=1; i<=10; i++){
      data[i] = [];
   }

   for(const Malla of idsAsig){
      const asignatura = await asigRepository.findOneBy({ asig_id: Malla.idAsig});
      if(asignatura){
         let estado = "pendiente";
         let agregado = false;
         
         for(const idMat of idsGrMa){
            if (agregado) break;
            for(const idGru of idMat.grupos){
               if (agregado) break;
               const grupoAux = await grupMatrRepository.findOne({ 
                  where: [
                     {grup_matr_idGrup:idGru,
                     grup_matr_idMatr:idMat.idMatr}
                  ],
                  relations: ['grupo']
               });
               // Busca el periodo actual
               const periodoAux = await periRepository.findOne({
                  where: { peri_nombre:'2024-2' }
               })
               // Revisa si la materia esta en el periodo actual
               const matriculaAux = await matrRepository.findOneBy({ matr_periodo:periodoAux?.peri_id })


               // Si esta en la intermedia
               if((grupoAux?.grupo.grup_asignatura == asignatura.asig_id)){
                  // Si es true, quiere decir que la matriculo y paso
                  if(grupoAux.grup_matr_estado == true){
                     estado = "aprobada";
                  }else if((grupoAux.grup_matr_idMatr == matriculaAux?.matr_id)){
                     // Si es false y la matriculo en el periodo actual, quiere decir que esta en curso
                     estado = "cursando";
                  } else {
                     // Si es false, quiere decir que la matriculo en otro periodo y la perdio
                     estado = "pendiente";
                  }
                  idMat.grupos = idMat.grupos.filter(item => item != idGru);
                  agregado = true;
                  break;
               }
            }
         }
         // Si no entra en las condiciones, se toma la asignatura como si no la hubiera visto
         data[Malla.seme].push({
            id: asignatura.asig_id,
            name: asignatura.asig_nombre,
            status: estado
         });
      }
   }

   return data;
}

export default EstudianteDao;