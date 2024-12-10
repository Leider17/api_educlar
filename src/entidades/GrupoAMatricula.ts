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

   @Column({default:false})
   grup_matr_estado: boolean

   @Column({type:"decimal", precision:3, scale:2, default:0.00})
   grup_matr_nota: number

   @ManyToOne(() => Grupo, (grupo) => grupo.grupoMatricula, {onDelete:"CASCADE"})
   @JoinColumn({ name:"grup_matr_idGrup"})
   grupo: Grupo

   @ManyToOne(() => Matricula, (matricula) => matricula.grupoMatricula, {onDelete:"CASCADE"})
   @JoinColumn({ name:"grup_matr_idMatr" })
   matricula: Matricula
}