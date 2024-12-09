import { Entity, PrimaryColumn, JoinColumn, ManyToOne } from "typeorm"
import { Asignatura } from "./Asignatura";
import { Docente } from "./Docente";
import { Grupo } from "./Grupo";

@Entity('asignaturas_docentes_grupos')
export class AsignaturaADocenteAGrupo {
   @PrimaryColumn()
   asig_doce_grup_idAsig: number

   @PrimaryColumn()
   asig_doce_grup_idDoce: number

   @PrimaryColumn()
   asig_doce_grup_idGrup: number

   @ManyToOne(() => Asignatura, (asignatura) => asignatura.asignaturaDocenteGrupo, {onDelete:"CASCADE"})
   @JoinColumn({ name:"asig_doce_grup_idAsig" })
   asignatura: Asignatura

   @ManyToOne(() => Docente, (docente) => docente.asignaturaDocenteGrupo, {onDelete:"CASCADE"})
   @JoinColumn({ name:"asig_doce_grup_idDoce" })
   docente: Docente

   @ManyToOne(() => Grupo, (grupo) => grupo.asignaturaDocenteGrupo, {onDelete:"CASCADE"})
   @JoinColumn({ name:"asig_doce_grup_idGrup" })
   grupo: Grupo
}