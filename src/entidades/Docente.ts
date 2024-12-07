import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn, ManyToOne, OneToMany } from "typeorm"
import { Usuario } from "./Usuario";
import { Programa } from "./Programa";
import { AsignaturaADocenteAGrupo } from "./AsignaturaADocenteAGrupo";

@Entity('docentes')
export class Docente {
   @PrimaryColumn()
   doce_id: number

   @Column()
   doce_programaAcademico: number

   @OneToOne(() => Usuario, (usuario) => usuario.estudiante)
   @JoinColumn({ name: "doce_id" })
   usuario: Usuario

   @ManyToOne(() => Programa, (programa) => programa.docentes, {onDelete:"CASCADE", onUpdate:"CASCADE"})
   @JoinColumn({ name: "doce_programaAcademico" })
   programa: Programa

   @OneToMany(() => AsignaturaADocenteAGrupo, (asignaturaDocenteGrupo) => asignaturaDocenteGrupo.docente)
   asignaturaDocenteGrupo: AsignaturaADocenteAGrupo[]
}