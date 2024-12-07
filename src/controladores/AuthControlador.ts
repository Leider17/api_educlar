import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Usuario } from "../entidades/Usuario";
import * as jwt from "jsonwebtoken";
import { validatePassword } from "../utilidades/ValidarContrasenia";
import { myDataSource } from '../configuraciones/Connection';



export class AuthController {
    

    static async login(req: Request, res: Response) {
        const userRepository = myDataSource.getRepository(Usuario);
        const { usu_correo, usu_contrasenia } = req.body;

        try {
            const usuario = await userRepository.findOne({ where: { usu_correo } });
            
            if (!usuario) {
                return res.status(401).json({ message: "Usuario invalido" });
            }

            const contrasenia = await validatePassword(usu_contrasenia, usuario.usu_contrasenia);
            
            if (!contrasenia) {
                return res.status(401).json({ message: "Contraseña invalida" });
            }

            const token = jwt.sign(
                { cod: usuario.usu_cod, correo: usuario.usu_cod },
                process.env.JWT_SECRET!
              )

            res.json({ token });
        } catch (error) {
            res.status(400).json({ message: "Ocurrio un error durante el login" });
        }
    }
    
}