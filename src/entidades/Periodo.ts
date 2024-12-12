import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm"
import { Matricula } from "./Matricula"
import { GrupoAMatricula } from "./GrupoAMatricula"

@Entity('periodos')
export class Periodo {
   @PrimaryGeneratedColumn()
   peri_id: number

   @Column({length:20, unique:true})
   peri_nombre: string

   @Column()
   peri_precioSeguro: number

   @Column()
   peri_precioTimbre: number

   @Column()
   peri_precioSemilla: number

   @OneToMany(() => Matricula, (matriculas) => matriculas.periodo)
   matriculas: Matricula[]
}