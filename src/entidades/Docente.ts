import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn, ManyToMany, ManyToOne } from "typeorm"
import { Usuario } from "./Usuario";
import { Programa } from "./Programa";

@Entity('docentes')
export class Docente {
   @PrimaryColumn()
   doce_id: number

   @Column()
   doce_programaAcademico: number

   @OneToOne(() => Usuario, (usuario) => usuario.estudiante)
   @JoinColumn({ name: "doce_id" })
   usuario: Usuario

   @ManyToOne(() => Programa, (programa) => programa.docentes)
   @JoinColumn({ name: "doce_programaAcademico" })
   programa: Programa
}