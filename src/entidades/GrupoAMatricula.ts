import { Entity, Column, PrimaryColumn, JoinColumn, ManyToOne } from "typeorm"
import { Matricula } from "./Matricula";
import { Estudiante } from "./Estudiante";
import { Grupo } from "./Grupo";
import { Periodo } from "./Periodo";

@Entity('grupos_matriculas')
export class GrupoAMatricula {
   @PrimaryColumn()
   grup_matr_idGrup: number

   @PrimaryColumn()
   grup_matr_idMatr: number

   @PrimaryColumn()
   grup_matr_idPeri: number

   @PrimaryColumn()
   grup_matr_idEstu: number

   @Column({default:false})
   grup_matr_estado: boolean

   @Column({type:"decimal", precision:3, scale:2})
   grup_matr_nota: number

   @ManyToOne(() => Grupo, (grupo) => grupo.grupoMatricula, {onDelete:"CASCADE"})
   @JoinColumn({ name:"grup_matr_idGrup"})
   grupo: Grupo

   @ManyToOne(() => Matricula, (matricula) => matricula.grupoMatricula, {onDelete:"CASCADE"})
   @JoinColumn({ name:"grup_matr_idMatr" })
   matricula: Matricula

   @ManyToOne(() => Periodo, (periodo) => periodo.grupoMatricula, {onDelete:"CASCADE"})
   @JoinColumn({ name:"grup_matr_idPeri" })
   periodo: Periodo

   @ManyToOne(() => Estudiante, (estudiante) => estudiante.grupoMatricula, {onDelete:"CASCADE"})
   @JoinColumn({ name:"grup_matr_idEstu" })
   estudiante: Estudiante
}