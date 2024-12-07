import { Entity, Column, Generated, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm"
import { Asignatura } from "./Asignatura"

@Entity('grupos')
export class Grupo {
   @Column({unique:true})
   @Generated("increment")
   grup_id: number

   @PrimaryColumn()
   grup_asignatura: number

   @PrimaryColumn({length:20})
   grup_nombre: string

   @Column({type:"json"})
   grup_horarioSalon: {[dia: string]: {"salon":string, "horaInicio":string, "horaFin":string}}

   @ManyToOne(() => Asignatura, (asignatura) => asignatura.grupos)
   @JoinColumn({ name: "grup_asignatura" })
   asignatura: Asignatura
}