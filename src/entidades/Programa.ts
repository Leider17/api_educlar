import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm"
import { Docente } from "./Docente"

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

   @OneToMany(() => Docente, (docentes) => docentes.programa, {onDelete:"CASCADE", onUpdate:"CASCADE"})
   docentes: Docente[]
}