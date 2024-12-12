import { Response } from "express";
import { myDataSource } from "../configuraciones/Connection";
import { Estudiante } from "../entidades/Estudiante";
import { Programa } from "../entidades/Programa";
import { Asignatura } from "../entidades/Asignatura";
import { Matricula } from "../entidades/Matricula";
import { GrupoAMatricula } from "../entidades/GrupoAMatricula";
import { Periodo } from "../entidades/Periodo";
import { Horario, IdsAsig, IdsGrupMatr, MapaCarrera, MapaHorario } from "../utilidades/Interfaces";
import { Grupo } from "../entidades/Grupo";
import { In } from "typeorm";
import { AsignaturaADocenteAGrupo } from "../entidades/AsignaturaADocenteAGrupo";
import { Usuario } from "../entidades/Usuario";

const estuRepository = myDataSource.getRepository(Estudiante);
const progRepository = myDataSource.getRepository(Programa);
const asigRepository = myDataSource.getRepository(Asignatura);
const matrRepository = myDataSource.getRepository(Matricula);
const grupMatrRepository = myDataSource.getRepository(GrupoAMatricula);
const periRepository = myDataSource.getRepository(Periodo);
const grupRepository = myDataSource.getRepository(Grupo);
const asigDoceGrupRepository = myDataSource.getRepository(AsignaturaADocenteAGrupo);
const usuRepository = myDataSource.getRepository(Usuario);

class EstudianteDao {
  // obtener la informacion personal del estudiante
  static async infoPerfil(idEstu: any, res: Response) {
    try {
      const estudiante = await estuRepository.findOne({
        where: { estu_id: idEstu },
        relations: ['usuario', 'estudiantePrograma']
      });

      if (!estudiante) {
        return res.status(404).json({ response: 'El estudiante no existe' });
      }

      const progAux = estudiante.estudiantePrograma[0];
      const programaEstu = await progRepository.findOne({
        where: { prog_id: progAux.estu_prog_idProg },
        relations: ['programaAsignatura']
      });

      if (!programaEstu) {
        return res.status(404).json({ response: 'El estudiante no pertenece a un programa' });
      }

      // Guardar las ids de las asignaturas de la carrera
      const idsAsig = programaEstu.programaAsignatura.map(item => item.prog_asig_idAsig);
      if (!idsAsig) {
        return res.status(404).json({ response: 'El programa no tiene asignaturas' });
      }
      const creditosTotal = await obtenerCreditosAsignaturas(idsAsig);
      const creditosAprobados = estudiante.estu_creditosAprobados;


      const matriculasEstu = await matrRepository.find({
        where: { matr_estudiante: idEstu },
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
      const progreso = parseFloat(((creditosAprobados / creditosTotal) * 100).toFixed(2));


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
          "period": progAux.estu_prog_semestre - 1,      // Un semestre antes del actual
          "semester": progAux.estu_prog_semestre,
          "average": Number(promedio),
          "totalCredits": creditosTotal,
          "approvedCredits": creditosAprobados,
          "progress": progreso
        }
      }

      return res.status(200).json(dataPerfil);
    } catch (error) {
      return res.status(500).json({ response: 'No se pudo recuperar informacion sobre el estudiante' });
    }
  }
  // obtener el semaforo estudiantil
  static async semaforo(idEstu: any, res: Response) {
    try {
      const estudiante = await estuRepository.findOne({
        where: { estu_id: idEstu },
        relations: ['estudiantePrograma']
      });

      if (!estudiante) {
        return res.status(404).json({ response: 'El estudiante no existe' });
      }


      const progAux = estudiante.estudiantePrograma[0];
      const programaEstu = await progRepository.findOne({
        where: { prog_id: progAux.estu_prog_idProg },
        relations: ['programaAsignatura']
      });

      if (!programaEstu) {
        return res.status(404).json({ response: 'El estudiante no pertenece a un programa' });
      }


      // Guardar las ids de las asignaturas de la carrera
      const idsAsig = programaEstu.programaAsignatura.map(item => ({
        idAsig: item.prog_asig_idAsig,
        seme: item.prog_asig_semestre
      }));
      if (!idsAsig) {
        return res.status(404).json({ response: 'El programa no tiene asignaturas' });
      }


      const matriculasEstu = await matrRepository.find({
        where: { matr_estudiante: idEstu },
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


      const semaforo = await generarSemaforo(idsAsig, idsGrupMatr);

      return res.status(200).json(semaforo);
    } catch (error) {
      return res.status(500).json({ response: 'No se pudo obtener el semaforo estudiantil' });
    }
  }
  //obtener matricula del estudiante
  static async matriculaEstudiante(idEstu: any, res: Response) {
    try {
      const estudiante = await estuRepository.findOne({
        where: { estu_id: idEstu },
        relations: ['matriculas', 'matriculas.periodo']
      });

      if (!estudiante) {
        return res.status(404).json({ response: 'El estudiante no existe' });
      }
      const matriculaFiltrada = estudiante.matriculas.filter(matricula =>
        matricula.periodo.peri_nombre === '2024-2'
      );

      const costosMatricula = [
        {
          "label": "Derechos de matricula",
          "value": matriculaFiltrada[0].matr_costoTotal["Derechos de matricula"]
        },
        {
          "label": "Beneficiario de politica de gratuidad",
          "value": matriculaFiltrada[0].matr_costoTotal["Descuento de"]
        },
        {
          "label": "Derechos complementarios",
          "value": matriculaFiltrada[0].matr_costoTotal["Derechos complementarios"]
        },
        {
          "label": "Seguro estudiantil",
          "value": matriculaFiltrada[0].matr_costoTotal["Seguro estudiantil"]
        },
        {
          "label": "Fondo capital semilla",
          "value": matriculaFiltrada[0].matr_costoTotal["Fondo capital semilla"]
        },
        {
          "label": "Timbre pro cultura",
          "value": matriculaFiltrada[0].matr_costoTotal["Timbre pro cultura"]
        },
        {
          "label": "Subtotal",
          "value": matriculaFiltrada[0].matr_costoTotal["Subtotal"]
        },
        {
          "label": "Total",
          "value": matriculaFiltrada[0].matr_costoTotal["Total"]
        }
      ];


      return res.status(200).json(costosMatricula);
    } catch (error) {
      return res.status(500).json({ response: 'No se pudo recuperar la matricula del estudiante' });
    }
  }

  // obtener el horario matriculado del estudiante
  static async horario(idEstu: any, res: Response) {
    try {
      const estudiante = await estuRepository.findOne({
        where: { estu_id: idEstu },
        relations: ['estudiantePrograma']
      });
      const periAux = await periRepository.findOne({
        where: { peri_nombre: '2024-2' }
      });

      if (!estudiante) {
        return res.status(404).json({ response: 'El estudiante no existe' });
      }
      if (!periAux) {
        return res.status(404).json({ response: 'El periodo no existe' });
      }


      const matriculaEstu = await matrRepository.findOne({
        where: { matr_estudiante: idEstu, matr_periodo: periAux.peri_id },
        relations: ['grupoMatricula']
      });

      if (!matriculaEstu) {
        return res.status(404).json({ response: 'El estudiante no tiene una matricula activa' });
      }

      // Grupos actuales que esta viendo el estudiante
      const idsGrupos = matriculaEstu.grupoMatricula.map(item => item.grup_matr_idGrup);

      const horario = await generarHorarioAcademico(idsGrupos);


      return res.status(200).json(horario);
    } catch (error) {
      return res.status(500).json({ response: 'No se pudo obtener el horario del estudiante' });
    }
  }
}

async function obtenerCreditosAsignaturas(ids: number[]) {
  const asignaturas = await asigRepository.findBy({ asig_id: In(ids) });
  const creditos = asignaturas.reduce((total, asignatura) => total + asignatura.asig_creditos, 0);
  return creditos;
}

async function obtenerPromedioAcumulado(ids: IdsGrupMatr[]) {
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

async function generarSemaforo(idsAsig: IdsAsig[], idsGrMa: IdsGrupMatr[]) {
  const data: MapaCarrera = {};

  for (let i = 1; i <= 10; i++) {
    data[i] = [];
  }

  for (const Malla of idsAsig) {
    const asignatura = await asigRepository.findOneBy({ asig_id: Malla.idAsig });
    if (asignatura) {
      let estado = "pendiente";
      let agregado = false;

      for (const idMat of idsGrMa) {
        if (agregado) break;
        for (const idGru of idMat.grupos) {
          if (agregado) break;
          const grupoAux = await grupMatrRepository.findOne({
            where: [
              {
                grup_matr_idGrup: idGru,
                grup_matr_idMatr: idMat.idMatr
              }
            ],
            relations: ['grupo']
          });
          // Busca el periodo actual
          const periodoAux = await periRepository.findOne({
            where: { peri_nombre: '2024-2' }
          });
          // Revisa si la materia esta en el periodo actual
          const matriculaAux = await matrRepository.findOneBy({ matr_periodo: periodoAux?.peri_id });


          // Si esta en la intermedia
          if ((grupoAux?.grupo.grup_asignatura == asignatura.asig_id)) {
            // Si es true, quiere decir que la matriculo y paso
            if (grupoAux.grup_matr_estado == true) {
              estado = "aprobada";
            } else if ((grupoAux.grup_matr_idMatr == matriculaAux?.matr_id)) {
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

async function generarHorarioAcademico(ids: number[]) {
  let indice = 0;
  const rta: MapaHorario = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: []
  };
  const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const grupos = await grupRepository.findBy({ grup_id: In(ids) });


  for (const day of days) {
    let menor = "00:00"
    while (menor != "25:00") {
      let data: Horario | null = null;
      menor = "25:00"
      let i = 0

      for (const grupo of grupos) {
        let horaAux = grupo.grup_horarioSalon[day]
        // Si hay grupos para ese dia, guarda la hora inicio.
        // Si no, significa que arroja 'undefined' y se asigna una hora grande
        // para que se mantenga con el menor actual al momento de comprobar
        let actual = horaAux ? horaAux.horaInicio : "30:00";

        let fechaMenor = convertirAFecha(menor);
        let fechaActual = convertirAFecha(actual);

        // Comprueba cual es la menor para almacenar primero
        if (fechaActual < fechaMenor) {
          menor = actual
          const asignatura = await asigRepository.findOneBy({ asig_id: grupo.grup_asignatura })
          const doceAux = await asigDoceGrupRepository.findOne({
            where: {
              asig_doce_grup_idAsig: asignatura?.asig_id,
              asig_doce_grup_idGrup: grupo.grup_id
            }
          })

          const usuAux = await usuRepository.findOneBy({ usu_cod: doceAux?.asig_doce_grup_idDoce })

          // Agregar info provisional
          if (asignatura && doceAux && usuAux) {
            data = {
              name: asignatura.asig_nombre,
              hourStart: fechaActual,
              hourEnd: convertirAFecha(horaAux.horaFin),
              teacher: usuAux.usu_nombre,
              group: {
                id: grupo.grup_id,
                name: grupo.grup_nombre
              },
              room: horaAux.salon
            }
            indice = i;
          }
        }
        i++;
      }
      // Eliminar grupo para no repetir en las proximas iteraciones
      delete grupos[indice].grup_horarioSalon[day]

      // agregar el menor al arreglo
      if (day == "lunes" && data) {
        rta.monday.push(data);
      } else if (day == "martes" && data) {
        rta.tuesday.push(data);
      } else if (day == "miercoles" && data) {
        rta.wednesday.push(data);
      } else if (day == "jueves" && data) {
        rta.thursday.push(data);
      } else if (day == "viernes" && data) {
        rta.friday.push(data);
      } else if (day == "sabado" && data) {
        rta.saturday.push(data);
      }
    }
  }

  return rta;
}

function convertirAFecha(hora: string) {
  const [hh, mm] = hora.split(":").map(Number);
  const fecha = new Date();
  fecha.setHours(hh, mm, 0, 0);
  return fecha;
}

export default EstudianteDao;