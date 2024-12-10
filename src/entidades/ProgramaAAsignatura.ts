import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm"
import { Programa } from "./Programa"
import { Asignatura } from "./Asignatura"

@Entity('programas_asignaturas')
export class ProgramaAAsignatura {
   @PrimaryColumn()
   prog_asig_idProg: number

   @PrimaryColumn()
   prog_asig_idAsig: number

   @Column()
   prog_asig_semestre: number

   // Prerequisito para matricularla
   @Column({type:"int", nullable:true, array:true})
   prog_asig_prerequisito: number[]

   @Column({nullable:true})
   prog_asig_prerequisitoEspecial: number

   @ManyToOne(() => Programa, (programa) => programa.programaAsignatura, {onDelete:"CASCADE"})
   @JoinColumn({ name:"prog_asig_idProg" })
   programa: Programa

   @ManyToOne(() => Asignatura, (asignatura) => asignatura.programaAsignatura, {onDelete:"CASCADE"})
   @JoinColumn({ name:"prog_asig_idAsig" })
   asignatura: Asignatura
}