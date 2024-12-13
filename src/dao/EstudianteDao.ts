import { Response } from "express";
import { myDataSource } from "../configuraciones/Connection";
import { Estudiante } from "../entidades/Estudiante";
import { Programa } from "../entidades/Programa";
import { Asignatura } from "../entidades/Asignatura";
import { Matricula } from "../entidades/Matricula";
import { GrupoAMatricula } from "../entidades/GrupoAMatricula";
import { Periodo } from "../entidades/Periodo";
import {
  Day,
  Horario,
  IdsAsig,
  IdsGrupMatr,
  MapaCarrera,
  MapaHorario,
  Subject,
} from "../utilidades/Interfaces";
import { Grupo } from "../entidades/Grupo";
import { FindOperator, In, Not } from "typeorm";
import { AsignaturaADocenteAGrupo } from "../entidades/AsignaturaADocenteAGrupo";
import { Usuario } from "../entidades/Usuario";
import { ProgramaAAsignatura } from "../entidades/ProgramaAAsignatura";
import { EstudianteAPrograma } from "../entidades/EstudianteAPrograma";

const estuRepository = myDataSource.getRepository(Estudiante);
const progRepository = myDataSource.getRepository(Programa);
const asigRepository = myDataSource.getRepository(Asignatura);
const matrRepository = myDataSource.getRepository(Matricula);
const grupMatrRepository = myDataSource.getRepository(GrupoAMatricula);
const periRepository = myDataSource.getRepository(Periodo);
const grupRepository = myDataSource.getRepository(Grupo);
const asigDoceGrupRepository = myDataSource.getRepository(
  AsignaturaADocenteAGrupo
);
const usuRepository = myDataSource.getRepository(Usuario);
const progAsigRepository = myDataSource.getRepository(ProgramaAAsignatura);
const estuProgRepository = myDataSource.getRepository(EstudianteAPrograma);

class EstudianteDao {
  // obtener la informacion personal del estudiante
  static async infoPerfil(idEstu: any, res: Response) {
    try {
      const estudiante = await estuRepository.findOne({
        where: { estu_id: idEstu },
        relations: ["usuario", "estudiantePrograma"],
      });

      if (!estudiante) {
        return res.status(404).json({ response: "El estudiante no existe" });
      }

      const progAux = estudiante.estudiantePrograma[0];
      const programaEstu = await progRepository.findOne({
        where: { prog_id: progAux.estu_prog_idProg },
        relations: ["programaAsignatura"],
      });

      if (!programaEstu) {
        return res
          .status(404)
          .json({ response: "El estudiante no pertenece a un programa" });
      }

      // Guardar las ids de las asignaturas de la carrera
      const idsAsig = programaEstu.programaAsignatura.map(
        (item) => item.prog_asig_idAsig
      );
      if (!idsAsig) {
        return res
          .status(404)
          .json({ response: "El programa no tiene asignaturas" });
      }
      const creditosTotal = await obtenerCreditosAsignaturas(idsAsig);
      const creditosAprobados = estudiante.estu_creditosAprobados;

      const matriculasEstu = await matrRepository.find({
        where: { matr_estudiante: idEstu },
        relations: ["grupoMatricula"],
      });
      // Guarda los grupos de una matricula, almacenados en la intermedia
      const matrAux = matriculasEstu.map((item) => ({
        idMatr: item.matr_id,
        grupoMatricula: item.grupoMatricula,
      }));
      // Guardar las ids de los grupos que vio en el semestre
      const idsGrupMatr = matrAux.flat().map((item) => ({
        idMatr: item.idMatr,
        grupos: item.grupoMatricula.map((subitem) => subitem.grup_matr_idGrup),
      }));

      const promedio = await obtenerPromedioAcumulado(idsGrupMatr);
      const progreso = ((creditosAprobados / creditosTotal) * 100).toFixed(2);

      const dataPerfil = {
        image: estudiante.usuario.usu_imagenPerfil,
        user: {
          id: estudiante.usuario.usu_cod,
          name: estudiante.usuario.usu_nombre,
          carrer: programaEstu?.prog_nombre,
          email: estudiante.usuario.usu_correo,
          location: estudiante.usuario.usu_direccion,
        },
        stats: {
          period: progAux.estu_prog_semestre - 1, // Un semestre antes del actual
          semester: progAux.estu_prog_semestre,
          average: Number(promedio),
          totalCredits: creditosTotal,
          approvedCredits: creditosAprobados,
          progress: progreso,
        },
      };

      return res.status(200).json(dataPerfil);
    } catch (error) {
      return res.status(500).json({
        response: "No se pudo recuperar informacion sobre el estudiante",
      });
    }
  }
  // obtener el semaforo estudiantil
  static async semaforo(idEstu: any, res: Response) {
    try {
      const estudiante = await estuRepository.findOne({
        where: { estu_id: idEstu },
        relations: ["estudiantePrograma"],
      });

      if (!estudiante) {
        return res.status(404).json({ response: "El estudiante no existe" });
      }

      const progAux = estudiante.estudiantePrograma[0];
      const programaEstu = await progRepository.findOne({
        where: { prog_id: progAux.estu_prog_idProg },
        relations: ["programaAsignatura"],
      });

      if (!programaEstu) {
        return res
          .status(404)
          .json({ response: "El estudiante no pertenece a un programa" });
      }

      // Guardar las ids de las asignaturas de la carrera
      const idsAsig = programaEstu.programaAsignatura.map((item) => ({
        idAsig: item.prog_asig_idAsig,
        seme: item.prog_asig_semestre,
      }));
      if (!idsAsig) {
        return res
          .status(404)
          .json({ response: "El programa no tiene asignaturas" });
      }

      const matriculasEstu = await matrRepository.find({
        where: { matr_estudiante: idEstu },
        relations: ["grupoMatricula"],
      });
      // Guarda los grupos de una matricula, almacenados en la intermedia
      const matrAux = matriculasEstu.map((item) => ({
        idMatr: item.matr_id,
        grupoMatricula: item.grupoMatricula,
      }));
      // Guardar las ids de los grupos que vio en el semestre
      const idsGrupMatr = matrAux.flat().map((item) => ({
        idMatr: item.idMatr,
        grupos: item.grupoMatricula.map((subitem) => subitem.grup_matr_idGrup),
      }));

      const semaforo = await generarSemaforo(idsAsig, idsGrupMatr);

      return res.status(200).json(semaforo);
    } catch (error) {
      return res
        .status(500)
        .json({ response: "No se pudo obtener el semaforo estudiantil" });
    }
  }
  //obtener matricula del estudiante
  static async matriculaEstudiante(idEstu: any, res: Response) {
    try {
      const estudiante = await estuRepository.findOne({
        where: { estu_id: idEstu },
        relations: ["matriculas", "matriculas.periodo"],
      });

      if (!estudiante) {
        return res.status(404).json({ response: "El estudiante no existe" });
      }
      const matriculaFiltrada = estudiante.matriculas.filter(
        (matricula) => matricula.periodo.peri_nombre === "2024-2"
      );

      const costosMatricula = [
        {
          label: "Derechos de matricula",
          value: matriculaFiltrada[0].matr_costoTotal["Derechos de matricula"],
        },
        {
          label: "Beneficiario de politica de gratuidad",
          value: matriculaFiltrada[0].matr_costoTotal["Descuento de"],
        },
        {
          label: "Derechos complementarios",
          value:
            matriculaFiltrada[0].matr_costoTotal["Derechos complementarios"],
        },
        {
          label: "Seguro estudiantil",
          value: matriculaFiltrada[0].matr_costoTotal["Seguro estudiantil"],
        },
        {
          label: "Fondo capital semilla",
          value: matriculaFiltrada[0].matr_costoTotal["Fondo capital semilla"],
        },
        {
          label: "Timbre pro cultura",
          value: matriculaFiltrada[0].matr_costoTotal["Timbre pro cultura"],
        },
        {
          label: "Subtotal",
          value: matriculaFiltrada[0].matr_costoTotal["Subtotal"],
        },
        {
          label: "Total",
          value: matriculaFiltrada[0].matr_costoTotal["Total"],
        },
      ];

      return res.status(200).json(costosMatricula);
    } catch (error) {
      return res
        .status(500)
        .json({ response: "No se pudo recuperar la matricula del estudiante" });
    }
  }

  // obtener el horario matriculado del estudiante
  static async horario(idEstu: any, res: Response) {
    try {
      const resultado = await Promise.race([
        (async () => {
          // Lógica original del endpoint
          // const estudiante = await estuRepository.findOne({
          //   where: { estu_id: idEstu },
          //   relations: ["estudiantePrograma"],
          // });
          const periAux = await periRepository.findOne({
            where: { peri_nombre: "2024-2" },
          });
          // if (!estudiante || !periAux) {
          if (!periAux) {
            return res.status(404).json({ response: "Datos no encontrados" });
          }

          const matriculaEstu = await matrRepository.findOne({
            where: { matr_estudiante: idEstu, matr_periodo: periAux.peri_id },
            relations: ["grupoMatricula"],
          });


          const idsGrupos = matriculaEstu?.grupoMatricula?.map(
            (item) => item.grup_matr_idGrup
          ) || [];

          console.log({ idsGrupos });

          const horario = await generarHorarioAcademico(idsGrupos);
          return res.status(200).json(horario);
        })(),
        timeout(10000),
      ]);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ response: "No se pudo obtener el horario del estudiante" });
    }
  }

  static async asignaturasValidas(idEstu: any, res: Response) {
    try {
      const periodoActual = await matrRepository
        .createQueryBuilder("matricula")
        .select("MAX(matricula.matr_periodo)", "peri_id")
        .where("matricula.matr_estudiante = :idEstu", { idEstu })
        .getRawOne();
      const idPeriodoActual = periodoActual.peri_id;

      const periodoAnterior = await periRepository
        .createQueryBuilder("periodo")
        .where("periodo.peri_id < :idPeriodoActual", { idPeriodoActual })
        .orderBy("periodo.peri_id", "DESC")
        .getOne();
      const idPeriodoAnterior = periodoAnterior!.peri_id;

      const asignaturasDelPeriodo = await grupMatrRepository
        .createQueryBuilder("grupoMatricula")
        .innerJoinAndSelect("grupoMatricula.matricula", "matricula")
        .where("matricula.matr_estudiante = :idEstu", { idEstu })
        .andWhere("matricula.matr_periodo = :idPeriodo", {
          idPeriodo: idPeriodoAnterior,
        })
        .getMany();

      const gruposAuxi = asignaturasDelPeriodo
        .filter((gm) => gm.grup_matr_estado == false)
        .map((gm) => gm.grup_matr_idGrup);

      const gruposPerdidas = await grupRepository.find({
        where: { grup_id: In(gruposAuxi) },
      });

      const asignaturasPerdidas = await asigRepository.find({
        where: {
          asig_id: In(gruposPerdidas.map((grup) => grup.grup_asignatura)),
        },
      });

      const matricula = await matrRepository.find({
        where: {
          matr_estudiante: idEstu,
        },
      });

      const matriculaActual = await matrRepository.findOne({
        where: {
          matr_estudiante: idEstu,
          matr_periodo: idPeriodoActual.peri_id,
          matr_estadoPago: false,
        },
      });

      if (matriculaActual) {
        return res
          .status(404)
          .json({ response: "El estudiante no tiene una matricula pagada" });
      }

      const gruposAux = await grupMatrRepository.find({
        where: {
          grup_matr_estado: true,
          grup_matr_idMatr: In(matricula.map((matr) => matr.matr_id)),
        },
      });

      const gruposPasados = await grupRepository.find({
        where: {
          grup_id: In(gruposAux.map((gm) => gm.grup_matr_idGrup)),
        },
      });

      const asignaturasPasadas = await asigRepository.find({
        where: {
          asig_id: In(gruposPasados.map((grup) => grup.grup_asignatura)),
        },
      });

      const idsAsignaturasPasadas = asignaturasPasadas.map(
        (asig) => asig.asig_id
      );

      const programa = await estuProgRepository.findOne({
        where: {
          estu_prog_idEstu: idEstu,
        },
      });

      if (!programa) {
        return res
          .status(404)
          .json({ response: "El estudiante no tiene un programa asignado" });
      }
      const asignaturasComplemento = await progAsigRepository.find({
        where: {
          prog_asig_idAsig: Not(
            In(asignaturasPasadas.map((asig) => asig.asig_id))
          ),
          prog_asig_idProg: programa.estu_prog_idProg,
        },
      });

      const materiasPrerequisitoAux = await obtenerMateriasPrerequisito(
        asignaturasComplemento,
        idsAsignaturasPasadas
      );

      const materiasPrerequisito = await asigRepository.find({
        where: {
          asig_id: In(
            materiasPrerequisitoAux.map((asig) => asig.prog_asig_idAsig)
          ),
        },
      });

      const estudiante = await estuRepository.findOne({
        where: {
          estu_id: idEstu,
        },
      });
      if (!estudiante) {
        return res.status(404).json({ response: "El estudiante no existe" });
      }
      const creditos = estudiante.estu_creditosAprobados;

      const asignaturasEspecialesAux = await progAsigRepository
        .createQueryBuilder("programaAsignatura")
        .where(
          "programaAsignatura.prog_asig_prerequisitoEspecial <= :creditos",
          { creditos }
        )

        .getMany();

      const asignaturasEsp = asignaturasEspecialesAux
        .map((asig) => asig.prog_asig_idAsig)
        .filter((asign) =>
          asignaturasComplemento.some(
            (complemento) => complemento.prog_asig_idAsig === asign
          )
        );

      const asignaturasEspeciales = await asigRepository.find({
        where: {
          asig_id: In(asignaturasEsp),
        },
      });

      const asignaturasFinal = [
        ...materiasPrerequisito,
        ...asignaturasEspeciales,
      ];

      const data = await obtenerAsignaturas(
        asignaturasFinal,
        asignaturasPerdidas,
        idPeriodoActual,
        idEstu,
        programa.estu_prog_idProg
      );

      return res.status(200).json(data);
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        error: "Ocurrió un error en el servidor",
        detalle: (error as Error).message,
      });
    }
  }

  static async pagarmatricula(idEstu: any, res: Response) {
    try {
      const periodoActual = await matrRepository
        .createQueryBuilder("matricula")
        .select("MAX(matricula.matr_periodo)", "peri_id")
        .where("matricula.matr_estudiante = :idEstu", { idEstu })
        .getRawOne();
      const idPeriodoActual = periodoActual.peri_id;
      const matricula = await matrRepository.findOne({
        where: {
          matr_estudiante: idEstu,
          matr_periodo: idPeriodoActual,
          matr_estadoPago: false,
        },
      });
      if (!matricula) {
        return res
          .status(404)
          .json({ response: "El estudiante ya tiene paga la matricula" });
      }

      matricula.matr_estadoPago = true;

      await matrRepository.save(matricula);

      return res.status(200).json({ response: "Matricula pagada" });
    } catch (error) {
      return res
        .status(500)
        .json({ response: "No se pudo pagar la matricula" });
    }
  }

  static async matricularMateria(idEstu: any, idAsignatura: any, idGrup: any, res: Response) {
    try {
      const programaEstudiante = await estuProgRepository.findOne({
        where: { estu_prog_idEstu: idEstu },
      });

      const periodoActual = await matrRepository
        .createQueryBuilder("matricula")
        .select("MAX(matricula.matr_periodo)", "peri_id")
        .where("matricula.matr_estudiante = :idEstu", { idEstu })
        .getRawOne();

      const idPeriodoActual = periodoActual.peri_id;

      const matricula = await matrRepository.findOne({
        where: {
          matr_estudiante: idEstu,
          matr_periodo: idPeriodoActual,
        },
      });

      const gruposmatriculados = await grupMatrRepository.find({
        where: {
          grup_matr_idMatr: matricula?.matr_id,
        },
      });

      const Grupos = await grupRepository.
        find({
          where: {
            grup_id: In(
              gruposmatriculados.map((grupMatr) => grupMatr.grup_matr_idGrup)
            ),
          },
        });

      const horariosGrupos = Grupos.map((item) => item.grup_horarioSalon);

      const Grupo = await grupRepository.
        findOne({
          where: {
            grup_id: idGrup
          }
        })
      const horarioGrupo = Grupo?.grup_horarioSalon

      if (verificarCruceHorarios(horariosGrupos, horarioGrupo!)) {
        return res.status(404).json({ response: "Existe un cruce de horarios con otra materia" });
      }





      const asignaturasMatriculadas = await grupRepository.find({
        where: {
          grup_id: In(gruposmatriculados.map((grupMatr) => grupMatr.grup_matr_idGrup)),
        },
      });

      const idsAsignaturasMatriculadas = asignaturasMatriculadas.map(
        (asig) => asig.grup_asignatura
      );

      const creditosMatriculados = await obtenerCreditosAsignaturas(idsAsignaturasMatriculadas);

      const asignaturaAux = await progAsigRepository.findOne({
        where: {
          prog_asig_idAsig: idAsignatura,
          prog_asig_idProg: programaEstudiante?.estu_prog_idProg,
        },
      });

      const creditosAsignatura = await asigRepository.findOne({
        where: {
          asig_id: asignaturaAux?.prog_asig_idAsig,
        },
      });

      if (creditosAsignatura && matricula) {
        if (creditosMatriculados + creditosAsignatura?.asig_creditos > 18) {
          return res.status(403).json({
            response: "La asignatura no se puede matricular porque sobrepasa los créditos permitidos",
          });
        }

        const matricular = new GrupoAMatricula();
        matricular.grup_matr_idGrup = idGrup;
        matricular.grup_matr_idMatr = matricula.matr_id;
        matricular.grup_matr_estado = false;
        matricular.grup_matr_nota = 0.0;

        await grupMatrRepository.save(matricular);

        return res.status(200).json({ response: "Materia matriculada" });
      }

      return res.status(500).json({ response: "No se pudo matricular la materia" });
    } catch (error) {
      return res.status(500).json({ response: "No se pudo matricular la materia" });
    }
  }

  static async cambiarGrupo(idEstu: any, idGrup: any, idGrupAntiguo: any, res: Response) {
    try {
      const periodoActual = await matrRepository
        .createQueryBuilder("matricula")
        .select("MAX(matricula.matr_periodo)", "peri_id")
        .where("matricula.matr_estudiante = :idEstu", { idEstu })
        .getRawOne();

      const idPeriodoActual = periodoActual.peri_id;

      const matricula = await matrRepository.findOne({
        where: {
          matr_estudiante: idEstu,
          matr_periodo: idPeriodoActual,
        },
      });

      if (!matricula) {
        return res.status(404).json({ response: "No se encontró la matrícula para el estudiante en el periodo actual" });
      }

      await grupMatrRepository.delete({
        grup_matr_idMatr: matricula?.matr_id,
        grup_matr_idGrup: idGrupAntiguo
      });

      const nuevoRegistro = grupMatrRepository.create({
        grup_matr_idMatr: matricula?.matr_id,
        grup_matr_idGrup: idGrup
      });

      await grupMatrRepository.save(nuevoRegistro);

      return res.status(200).json({ response: "Grupo cambiado con éxito" });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ response: "No se pudo cambiar el grupo" });
    }
  }



  static async eliminarGrupo(idEstu: any, idGrup: any, res: Response) {
    try {
      const periodoActual = await matrRepository
        .createQueryBuilder("matricula")
        .select("MAX(matricula.matr_periodo)", "peri_id")
        .where("matricula.matr_estudiante = :idEstu", { idEstu })
        .getRawOne();
      const idPeriodoActual = periodoActual.peri_id;

      const matricula = await matrRepository.findOne({
        where: {
          matr_estudiante: idEstu,
          matr_periodo: idPeriodoActual,
        },
      });
      const matriculaaEliminar = await grupMatrRepository.findOne({
        where: {
          grup_matr_idMatr: matricula?.matr_id,
          grup_matr_idGrup: idGrup,
        },
      });

      if (matriculaaEliminar) {
        await grupMatrRepository.remove(matriculaaEliminar);
        return res.status(200).json({ response: "Grupo eliminado" });
      } else {
        return res.status(404).json({ response: "No existe el grupo" });
      }
    } catch (error) {
      return res.status(500).json({ response: "No se pudo eliminar el grupo" });
    }
  }
}

async function obtenerAsignaturas(
  asignaturasFinal: Asignatura[],
  asignaturasPerdidas: Asignatura[],
  PeriodoId: any,
  idEstudiante: any,
  programaId: any
) {
  const resultado: Subject[] = [];

  for (const asig of asignaturasFinal) {
    let obligatorio = false;
    let matriculada = false;
    if (
      asignaturasPerdidas.some((perdida) => perdida.asig_id === asig.asig_id)
    ) {
      obligatorio = true;
    }
    const matricula = await matrRepository.findOne({
      where: {
        matr_estudiante: idEstudiante,
        matr_periodo: PeriodoId,
      },
    });

    const gruposMatricula = await grupMatrRepository.find({
      where: { grup_matr_idMatr: matricula?.matr_id },
    });

    const idsAsignaturas = await grupRepository.find({
      where: { grup_id: In(gruposMatricula.map((gm) => gm.grup_matr_idGrup)) },
      select: { grup_asignatura: true },
    });
    if (idsAsignaturas.some((a) => a.grup_asignatura === asig.asig_id)) {
      matriculada = true;
    }

    const semestre = await progAsigRepository.findOne({
      where: {
        prog_asig_idAsig: asig.asig_id,
        prog_asig_idProg: programaId,
      },
      select: { prog_asig_semestre: true },
    });

    const grupos = await grupRepository.find({
      where: { grup_asignatura: asig.asig_id },
    });
    let resultadoGrupo = [];
    for (const grupo of grupos) {
      let grupoMatriculado = false;
      let dias = grupo.grup_horarioSalon;

      if (gruposMatricula.some((gm) => gm.grup_matr_idGrup === grupo.grup_id)) {
        grupoMatriculado = true;
      }
      let resultadoDia = [];
      for (const key in dias) {
        let dia = key;
        let inicio = convertirAFecha(dias[key].horaInicio);
        let fin = convertirAFecha(dias[key].horaFin);

        resultadoDia.push({
          date: dia,
          hourStart: inicio,
          hourEnd: fin,
        });
      }
      resultadoGrupo.push({
        id: String(grupo.grup_id),
        name: grupo.grup_nombre,
        days: resultadoDia,
        isSelected: grupoMatriculado,
      });
    }
    if (semestre) {
      resultado.push({
        id: String(asig.asig_id),
        name: asig.asig_nombre,
        semester: semestre.prog_asig_semestre,
        credits: asig.asig_creditos,
        isObligatory: obligatorio,
        isEnrolled: matriculada,
        groups: resultadoGrupo,
      });
    }
  }

  return resultado;
}

async function obtenerMateriasPrerequisito(
  asignaturas: ProgramaAAsignatura[],
  idsAsignaturasPasadas: number[]
): Promise<ProgramaAAsignatura[]> {
  try {
    const idsSet = new Set(idsAsignaturasPasadas);
    const asignaturasPrerequisito = asignaturas.filter((asig) => {
      if (
        !Array.isArray(asig.prog_asig_prerequisito) ||
        asig.prog_asig_prerequisito === null
      ) {
        return asig.prog_asig_prerequisitoEspecial === null;
      }

      return asig.prog_asig_prerequisito.every((id) => idsSet.has(Number(id)));
    });

    return asignaturasPrerequisito;
  } catch (error) {
    console.error("Error en obtenerMateriasPrerequisito:", error);
    throw error;
  }
}

async function obtenerCreditosAsignaturas(ids: number[]) {
  const asignaturas = await asigRepository.findBy({ asig_id: In(ids) });
  const creditos = asignaturas.reduce(
    (total, asignatura) => total + asignatura.asig_creditos,
    0
  );
  return creditos;
}

async function obtenerPromedioAcumulado(ids: IdsGrupMatr[]) {
  const idsGrupos = ids.flatMap((item) => item.grupos);
  const result = await grupMatrRepository
    .createQueryBuilder("gm")
    .innerJoin("gm.grupo", "grupo")
    .innerJoin("grupo.asignatura", "asig")
    .select("SUM(gm.grup_matr_nota * asig.asig_creditos)", "suma")
    .addSelect("SUM(asig.asig_creditos)", "creditos")
    .where("gm.grup_matr_estado = :estado", { estado: true })
    .andWhere("gm.grup_matr_idGrup IN (:...idsGrupos)", { idsGrupos })
    .andWhere("gm.grup_matr_idMatr IN (:...idsMatriculas)", {
      idsMatriculas: ids.map((item) => item.idMatr),
    })
    .getRawOne();

  return (result.suma / result.creditos).toFixed(2);
}

async function generarSemaforo(idsAsig: IdsAsig[], idsGrMa: IdsGrupMatr[]) {
  const data: MapaCarrera = {};

  for (let i = 1; i <= 10; i++) {
    data[i] = [];
  }

  for (const Malla of idsAsig) {
    const asignatura = await asigRepository.findOneBy({
      asig_id: Malla.idAsig,
    });
    if (asignatura) {
      let estado = "pendiente";
      let agregado = false;

      for (const idMat of idsGrMa) {
        if (agregado) break;
        for (const idGru of idMat.grupos) {
          if (agregado) break;
          const grupoAux = await grupMatrRepository.findOne({
            where: [
              { grup_matr_idGrup: idGru, grup_matr_idMatr: idMat.idMatr },
            ],
            relations: ["grupo"],
          });
          // Busca el periodo actual
          const periodoAux = await periRepository.findOne({
            where: { peri_nombre: "2024-2" },
          });
          // Revisa si la materia esta en el periodo actual
          const matriculaAux = await matrRepository.findOneBy({
            matr_periodo: periodoAux?.peri_id,
          });

          // Si esta en la intermedia
          if (grupoAux?.grupo.grup_asignatura == asignatura.asig_id) {
            // Si es true, quiere decir que la matriculo y paso
            if (grupoAux.grup_matr_estado == true) {
              estado = "aprobada";
            } else if (grupoAux.grup_matr_idMatr == matriculaAux?.matr_id) {
              // Si es false y la matriculo en el periodo actual, quiere decir que esta en curso
              estado = "cursando";
            } else {
              // Si es false, quiere decir que la matriculo en otro periodo y la perdio
              estado = "pendiente";
            }
            idMat.grupos = idMat.grupos.filter((item) => item != idGru);
            agregado = true;
            break;
          }
        }
      }
      // Si no entra en las condiciones, se toma la asignatura como si no la hubiera visto
      data[Malla.seme].push({
        id: asignatura.asig_id,
        name: asignatura.asig_nombre,
        status: estado,
      });
    }
  }

  return data;
}

async function generarHorarioAcademico(ids: number[]) {
  const rta: MapaHorario = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
  };
  const days = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
  const grupos = await grupRepository.findBy({ grup_id: In(ids) });


  if (!grupos || grupos.length === 0) {
    return rta;
  }

  for (const day of days) {
    let menor = "00:00";
    const gruposDia = grupos.filter(grupo => grupo.grup_horarioSalon[day]); // Solo grupos con horario para el día actual

    while (menor !== "25:00") {
      let data: Horario | null = null;
      let siguienteMenor = "25:00"; // Inicia con el valor máximo posible
      let grupoSeleccionadoIndex = -1;


      for (let i = 0; i < gruposDia.length; i++) {
        const horaAux = gruposDia[i].grup_horarioSalon[day];

        if (!horaAux) continue; // Si no hay horario, saltar este grupo

        const actual = horaAux.horaInicio || "30:00";
        const fechaActual = convertirAFecha(actual);
        const fechaMenor = convertirAFecha(siguienteMenor);

        // Actualizar el siguiente menor si se encuentra un horario válido y menor
        if (fechaActual >= convertirAFecha(menor) && fechaActual < fechaMenor) {
          siguienteMenor = actual;
          grupoSeleccionadoIndex = i;

          // Construir el objeto `data` para el horario
          const asignatura = await asigRepository.findOneBy({
            asig_id: gruposDia[i].grup_asignatura,
          });
          const doceAux = await asigDoceGrupRepository.findOne({
            where: {
              asig_doce_grup_idAsig: asignatura?.asig_id,
              asig_doce_grup_idGrup: gruposDia[i].grup_id,
            },
          });

          let usuAux = null;

          if (doceAux) {
            usuAux = await usuRepository.findOneBy({
              usu_cod: doceAux.asig_doce_grup_idDoce,
            });
          }

          if (asignatura) {
            data = {
              name: asignatura.asig_nombre,
              hourStart: fechaActual,
              hourEnd: convertirAFecha(horaAux.horaFin),
              teacher: usuAux?.usu_nombre || undefined,
              group: {
                id: gruposDia[i].grup_id,
                name: gruposDia[i].grup_nombre,
              },
              room: horaAux.salon,
            };
          }
        }
      }

      // Si no se encontró un siguiente menor válido, romper el bucle
      if (siguienteMenor === "25:00" || grupoSeleccionadoIndex === -1) {
        break;
      }

      // Agregar el horario al día correspondiente
      if (data) {
        const dayKey = getDayKey(day);
        rta[dayKey].push(data);
      }

      // Eliminar el horario procesado del grupo seleccionado
      delete gruposDia[grupoSeleccionadoIndex].grup_horarioSalon[day];

      // Actualizar `menor` para la siguiente iteración
      menor = siguienteMenor;
    }
  }

  return rta;
}

function getDayKey(day: string): keyof MapaHorario {
  const mapping: Record<string, keyof MapaHorario> = {
    lunes: "monday",
    martes: "tuesday",
    miercoles: "wednesday",
    jueves: "thursday",
    viernes: "friday",
    sabado: "saturday",
  };
  return mapping[day];
}

function timeout(ms: number) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms));
}

function convertirAFecha(hora: string) {
  const [hh, mm] = hora.split(":").map(Number);
  const fecha = new Date();
  fecha.setHours(hh, mm, 0, 0);
  return fecha;
}

type HorarioGrupo = {
  [dia: string]: {
    salon: string;
    horaInicio: string;
    horaFin: string;
  };
};
function verificarCruceHorarios(
  horariosMatriculados: HorarioGrupo[],
  horarioNuevo: HorarioGrupo
): boolean {
  for (const horarioMatriculado of horariosMatriculados) {
    for (const dia in horarioMatriculado) {
      if (horarioNuevo[dia]) {
        const horaInicioMatriculado = horarioMatriculado[dia].horaInicio;
        const horaFinMatriculado = horarioMatriculado[dia].horaFin;
        const horaInicioNuevo = horarioNuevo[dia].horaInicio;
        const horaFinNuevo = horarioNuevo[dia].horaFin;

        if (hayCruceHorarios(horaInicioMatriculado, horaFinMatriculado, horaInicioNuevo, horaFinNuevo)) {
          return true; // Hay cruce de horarios
        }
      }
    }
  }
  return false; // No hay cruce de horarios
}

function hayCruceHorarios(horaInicioA: string, horaFinA: string, horaInicioB: string, horaFinB: string): boolean {
  const inicioA = convertirHoraEnMinutos(horaInicioA);
  const finA = convertirHoraEnMinutos(horaFinA);
  const inicioB = convertirHoraEnMinutos(horaInicioB);
  const finB = convertirHoraEnMinutos(horaFinB);

  // Validar si hay cruce de horarios
  return inicioB < finA && finB > inicioA;
}

function convertirHoraEnMinutos(hora: string): number {
  const [horas, minutos] = hora.split(':').map(Number);
  return horas * 60 + minutos;
}

export default EstudianteDao;
