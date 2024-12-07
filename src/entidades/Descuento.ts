import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity('descuentos')
export class Descuento {
   @PrimaryGeneratedColumn()
   desc_id: number

   @Column({length:50, unique:true})
   desc_nombre: string

   @Column()
   desc_valor: number
}