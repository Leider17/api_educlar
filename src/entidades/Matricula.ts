import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, JoinColumn, OneToMany } from "typeorm"
import { Periodo } from "./Periodo"
import { Estudiante } from "./Estudiante"
import { GrupoAMatricula } from "./GrupoAMatricula"

@Entity('matriculas')
export class Matricula {
   @PrimaryGeneratedColumn()
   matr_id: number

   @Column()
   matr_periodo: number

   @Column()
   matr_estudiante: number

   @Column()
   matr_costoFinal: number

   @Column({default:false})
   matr_estadoPago: boolean

   @Column({type:"json"})
   matr_costoTotal: {"Derechos de matricula": string, "Descuento de":string, "Derechos complementarios":string, "Seguro estudiantil":string, "Fondo capital semilla":string, "Timbre pro cultura":string, "Subtotal":string, "Total":string}

   @ManyToOne(() => Periodo, (periodo) => periodo.matriculas, {onDelete:"CASCADE"})
   @JoinColumn({ name: "matr_periodo" })
   periodo: Periodo

   @ManyToOne(() => Estudiante, (estudiante) => estudiante.matriculas, {onDelete:"CASCADE"})
   @JoinColumn({ name: "matr_estudiante" })
   estudiante: Estudiante

   @OneToMany(() => GrupoAMatricula, (grupoMatricula) => grupoMatricula.matricula)
   grupoMatricula: GrupoAMatricula[]
}