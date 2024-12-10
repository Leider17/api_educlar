import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn, OneToMany, ManyToMany, JoinTable } from "typeorm"
import { Usuario } from "./Usuario";
import { Matricula } from "./Matricula";
import { Descuento } from "./Descuento";
import { EstudianteAPrograma } from "./EstudianteAPrograma";
import { GrupoAMatricula } from "./GrupoAMatricula";

@Entity('estudiantes')
export class Estudiante {
   @PrimaryColumn()
   estu_id: number

   @Column()
   estu_creditosAprobados: number

   @Column()
   estu_estrato: number

   @OneToOne(() => Usuario, (usuario) => usuario.estudiante, {onDelete:"CASCADE"})
   @JoinColumn({ name: "estu_id" })
   usuario: Usuario

   @OneToMany(() => Matricula, (matriculas) => matriculas.estudiante)
   matriculas: Matricula[]

   // Al llamar estudiantes, muestra sus descuentos, no al reves
   @ManyToMany(() => Descuento, {onDelete:"CASCADE"})
   @JoinTable({
      name:"estudiantes_descuentos",
      joinColumn: {name:"estu_desc_idEstu", referencedColumnName:"estu_id"},
      inverseJoinColumn: {name:"estu_desc_idDesc", referencedColumnName:"desc_id"}
   })
   descuentos: Descuento[]

   @OneToMany(() => EstudianteAPrograma, (estudiantePrograma) => estudiantePrograma.estudiante)
   estudiantePrograma: EstudianteAPrograma[]
}