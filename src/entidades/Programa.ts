import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable } from "typeorm"
import { Docente } from "./Docente"
import { EstudianteAPrograma } from "./EstudianteAPrograma"
import { ProgramaAAsignatura } from "./ProgramaAAsignatura"

@Entity('programas')
export class Programa {
   @PrimaryGeneratedColumn()
   prog_id: number

   @Column({length:50, unique:true})
   prog_nombre: string

   @Column({type:"int", array:true})
   prog_precioMatricula: number[]

   @Column({type:"int", array:true})
   prog_precioDerechos: number[]

   @OneToMany(() => Docente, (docentes) => docentes.programa)
   docentes: Docente[]

   @OneToMany(() => EstudianteAPrograma, (estudiantePrograma) => estudiantePrograma.programa)
   estudiantePrograma: EstudianteAPrograma[]

   @OneToMany(() => ProgramaAAsignatura, (programaAsignatura) => programaAsignatura.programa)
   programaAsignatura: ProgramaAAsignatura[]
}