import { Entity, Column, ManyToOne, JoinColumn, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm"
import { Asignatura } from "./Asignatura"
import { AsignaturaADocenteAGrupo } from "./AsignaturaADocenteAGrupo"
import { GrupoAMatricula } from "./GrupoAMatricula"

@Entity('grupos')
@Unique(["grup_asignatura","grup_nombre"])
export class Grupo {
   @PrimaryGeneratedColumn()
   grup_id: number

   @Column()
   grup_asignatura: number

   @Column({length:20})
   grup_nombre: string

   @Column({type:"json"})
   grup_horarioSalon: {[dia: string]: {"salon":string, "horaInicio":string, "horaFin":string}}

   @ManyToOne(() => Asignatura, (asignatura) => asignatura.grupos, {onDelete:"CASCADE", onUpdate:"CASCADE"})
   @JoinColumn({ name: "grup_asignatura" })
   asignatura: Asignatura

   @OneToMany(() => AsignaturaADocenteAGrupo, (asignaturaDocenteGrupo) => asignaturaDocenteGrupo.grupo)
   asignaturaDocenteGrupo: AsignaturaADocenteAGrupo[]

   @OneToMany(() => GrupoAMatricula, (grupoMatricula) => grupoMatricula.grupo)
   grupoMatricula: GrupoAMatricula[]
}