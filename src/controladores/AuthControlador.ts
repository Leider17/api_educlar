import { Request, Response } from "express";
import { AuthDao } from "../dao/AuthDao";



export class AuthControlador extends AuthDao {
    
    public login(req: Request, res: Response) {
        return AuthControlador.autenticarUsuario(req.body, res);
    }
    public verifyToken(req: Request, res: Response) {
        return AuthControlador.verificarToken(req.headers, res);
    }
    
}
const authControlador = new AuthControlador();
export default authControlador;