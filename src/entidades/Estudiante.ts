import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn, OneToMany } from "typeorm"
import { Usuario } from "./Usuario";
import { Matricula } from "./Matricula";

@Entity('estudiantes')
export class Estudiante {
   @PrimaryColumn()
   estu_id: number

   @Column()
   estu_creditosAprobados: number

   @Column()
   estu_estrato: number

   @OneToOne(() => Usuario, (usuario) => usuario.estudiante)
   @JoinColumn({ name: "estu_id" })
   usuario: Usuario

   @OneToMany(() => Matricula, (matriculas) => matriculas.estudiante, {onDelete:"CASCADE", onUpdate:"CASCADE"})
   matriculas: Matricula[]
}