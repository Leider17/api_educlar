import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';


interface CustomRequest extends Request {
    usuario?: any;
}

export const verifyToken = (req: CustomRequest, res: Response, next: NextFunction): void => {  
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Acceso denegado, no se proporcionó token' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        req.usuario = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token no válido' });
        return;
    }
};