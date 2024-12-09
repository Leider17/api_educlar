import { Entity, Column, PrimaryColumn, OneToOne } from "typeorm"
import { Estudiante } from "./Estudiante"
import { Docente } from "./Docente"

export enum RolStatus {
   ADMIN = "administrador",
   DOCEN = "docente",
   ESTUD = "estudiante"
}

// Por defecto son notNull
@Entity('usuarios')
export class Usuario {
   @PrimaryColumn()
   usu_cod: number

   @Column({type:"enum", enum:RolStatus, enumName:"rol_status"})
   usu_rol: RolStatus

   @Column({length:80})
   usu_nombre: string

   @Column({length:50, unique:true})
   usu_correo: string

   @Column({length:80})
   usu_contrasenia: string

   @Column({length:80})
   usu_direccion: string

   @Column({length:50})
   usu_imagenPerfil: string

   @OneToOne(() => Estudiante, (estudiante) => estudiante.usuario)
   estudiante: Estudiante

   @OneToOne(() => Docente, (docente) => docente.usuario)
   docente: Docente
}