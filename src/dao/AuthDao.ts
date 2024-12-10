import { Response } from "express";
import { Usuario } from "../entidades/Usuario";
import * as jwt from "jsonwebtoken";
import { validatePassword } from "../utilidades/ValidarContrasenia";
import { myDataSource } from '../configuraciones/Connection';


const userRepository = myDataSource.getRepository(Usuario);

export class AuthDao {
    
    static async autenticarUsuario(credentials: {usu_correo: string, usu_contrasenia: string}, res: Response): Promise<any> {
        try {
            
            const usuario = await userRepository.findOne({ 
                where: { usu_correo: credentials.usu_correo } 
            });
            
            
            if (!usuario) {
                return res.status(401).json({ 
                    response: "Usuario inválido" 
                });
            }

            const contraseniaValida = await validatePassword(
                credentials.usu_contrasenia,
                usuario.usu_contrasenia
            );
            
    
            if (!contraseniaValida) {
                return res.status(401).json({ 
                    response: "Contraseña inválida" 
                });
            }

            const token = jwt.sign(
                { 
                    cod: usuario.usu_cod, 
                    correo: usuario.usu_correo 
                },
                process.env.JWT_SECRET!,
                
            );

            return res.status(200).json({ 
                response: "Login exitoso",
                data: {
                    token,
                    usuario: {
                        cod: usuario.usu_cod,
                        correo: usuario.usu_correo
                    }
                }
            });

        } catch (error) {
            return res.status(500).json({ 
                response: "Error durante la autenticación"
            });
        }
    }

    
}
export default AuthDao;