import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm"
import { Grupo } from "./Grupo"
import { AsignaturaADocenteAGrupo } from "./AsignaturaADocenteAGrupo"

@Entity('asignaturas')
export class Asignatura {
   @PrimaryColumn()
   asig_id: number

   @Column({length:100, unique:true})
   asig_nombre: string

   @Column()
   asig_creditos: number

   @Column()
   asig_semestre: number

   // Prerequisito para matricularla
   @Column({type:"int", nullable:true, array:true})
   asig_prerequisito: number[]

   @Column({nullable:true})
   asig_prerequisitoEspecial: number

   @OneToMany(() => Grupo, (grupos) => grupos.asignatura)
   grupos: Grupo[]

   @OneToMany(() => AsignaturaADocenteAGrupo, (asignaturaDocenteGrupo) => asignaturaDocenteGrupo.asignatura)
   asignaturaDocenteGrupo: AsignaturaADocenteAGrupo[]
}