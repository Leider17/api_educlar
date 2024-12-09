import { Entity, Column, PrimaryColumn, JoinColumn, ManyToOne } from "typeorm"
import { Estudiante } from "./Estudiante";
import { Programa } from "./Programa";

@Entity('estudiantes_programas')
export class EstudianteAPrograma {
   @PrimaryColumn()
   estu_prog_idEstu: number

   @PrimaryColumn()
   estu_prog_idProg: number

   @Column()
   estu_prog_semestre: number

   @ManyToOne(() => Estudiante, (estudiante) => estudiante.estudiantePrograma, {onDelete:"CASCADE"})
   @JoinColumn({ name:"estu_prog_idEstu" })
   estudiante: Estudiante

   @ManyToOne(() => Programa, (programa) => programa.estudiantePrograma, {onDelete:"CASCADE"})
   @JoinColumn({ name:"estu_prog_idProg" })
   programa: Programa
}