import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm"
import { Grupo } from "./Grupo"
import { AsignaturaADocenteAGrupo } from "./AsignaturaADocenteAGrupo"
import { ProgramaAAsignatura } from "./ProgramaAAsignatura"

@Entity('asignaturas')
export class Asignatura {
   @PrimaryColumn()
   asig_id: number

   @Column({length:100, unique:true})
   asig_nombre: string

   @Column()
   asig_creditos: number

   @OneToMany(() => Grupo, (grupos) => grupos.asignatura)
   grupos: Grupo[]

   @OneToMany(() => AsignaturaADocenteAGrupo, (asignaturaDocenteGrupo) => asignaturaDocenteGrupo.asignatura)
   asignaturaDocenteGrupo: AsignaturaADocenteAGrupo[]

   @OneToMany(() => ProgramaAAsignatura, (programaAsignatura) => programaAsignatura.asignatura)
   programaAsignatura: ProgramaAAsignatura[]
}