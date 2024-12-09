import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable } from "typeorm"
import { Docente } from "./Docente"
import { Asignatura } from "./Asignatura"
import { EstudianteAPrograma } from "./EstudianteAPrograma"

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

   // Al llamar programas, muestra sus asignaturas, no al reves
   @ManyToMany(() => Asignatura, {onDelete:"CASCADE"})
   @JoinTable({
      name:"programas_asignaturas",
      joinColumn: {name:"prog_asig_idProg", referencedColumnName:"prog_id"},
      inverseJoinColumn: {name:"prog_asig_idAsig", referencedColumnName:"asig_id"}
   })
   asignaturas: Asignatura[]

   @OneToMany(() => EstudianteAPrograma, (estudiantePrograma) => estudiantePrograma.programa)
   estudiantePrograma: EstudianteAPrograma[]
}