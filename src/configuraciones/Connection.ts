import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Asignatura } from "../entidades/Asignatura";
import { Descuento } from "../entidades/Descuento";
import { Docente } from "../entidades/Docente";
import { Estudiante } from "../entidades/Estudiante";
import { Grupo } from "../entidades/Grupo";
import { Matricula } from "../entidades/Matricula";
import { Periodo } from "../entidades/Periodo";
import { Programa } from "../entidades/Programa";
import { Usuario } from "../entidades/Usuario";
import { AsignaturaADocenteAGrupo } from "../entidades/AsignaturaADocenteAGrupo";
import { EstudianteAPrograma } from "../entidades/EstudianteAPrograma";
import { GrupoAMatricula } from "../entidades/GrupoAMatricula";

dotenv.config({ path: ".env" });

export const myDataSource = new DataSource({
    type: "postgres", 
    host: process.env.DB_HOST,
    port: Number(process.env.PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [Asignatura, Descuento, Docente, Estudiante,
        Grupo, Matricula, Periodo, Programa, Usuario, AsignaturaADocenteAGrupo,
        EstudianteAPrograma, GrupoAMatricula],
    logging: process.env.DB_LOGGING === "true",
    synchronize: process.env.DB_SYNCHRONIZE === "true",
});

export const connectToDatabase = async () => {
    try {
        await myDataSource.initialize();
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Error connecting to the database", error);
        process.exit(1); 
    }
};
