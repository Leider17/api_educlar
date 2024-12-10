import { Request, Response } from "express";
import { AuthDao } from "../dao/AuthDao";



export class AuthControlador extends AuthDao {
    
    public login(req: Request, res: Response) {
        return AuthControlador.autenticarUsuario(req.body, res);
    }
    
}
const authControlador = new AuthControlador();
export default authControlador;