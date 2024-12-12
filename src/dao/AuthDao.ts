import { Response } from "express";
import { Usuario } from "../entidades/Usuario";
import * as jwt from "jsonwebtoken";
import { validatePassword } from "../utilidades/ValidarContrasenia";
import { myDataSource } from '../configuraciones/Connection';


const userRepository = myDataSource.getRepository(Usuario);
interface JwtPayload {
  cod?: any;
}
export class AuthDao {

  static async autenticarUsuario(credentials: { email: string, password: string }, res: Response): Promise<any> {
    try {
      const usuario = await userRepository.findOne({
        where: { usu_correo: credentials.email }
      });

      if (!usuario) {
        return res.status(401).json({
          response: "Usuario inválido"
        });
      }

      let contraseniaValida = false;

      if (credentials.password == usuario.usu_contrasenia) {
        contraseniaValida = true;
      }
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
          User: {
            id: usuario.usu_cod,
            name: usuario.usu_nombre,
            email: usuario.usu_correo,
            role: usuario.usu_rol
          }
        }
      });
    } catch (error) {
      return res.status(500).json({
        response: "Error durante la autenticación"
      });
    }
  }

  static async verificarToken(headers: any, res: Response): Promise<any> {
    try {
      const authHeader = headers.authorization || headers.Authorization;
      const token = authHeader?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      const usuario = await userRepository.findOne({
        where: { usu_cod: decoded.cod }
      });

      if (!usuario) {
        return res.status(401).json({ message: 'Usuario no encontrado' });
      }

      return res.status(200).json({
        message: "Token verificado",
        User: {
          id: usuario.usu_cod,
          name: usuario.usu_nombre,
          email: usuario.usu_correo,
          role: usuario.usu_rol
        }
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error durante la verificación del token"
      });
    }
  }
}

export default AuthDao;