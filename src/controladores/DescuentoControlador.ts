import { Request, Response } from "express";
import DescuentoDao from "../dao/DescuentoDao";

export class DescuentoControlador extends DescuentoDao {
   public get(req:Request, res:Response) {
      DescuentoControlador.mostrarDescuento(res);
   }

   public create(req:Request, res:Response) {
      DescuentoControlador.agregarDescuento(req.body, res);
   }

   public delete(req:Request, res:Response) {
      DescuentoControlador.eliminarDescuento(req.params.id, res);
   }

   public update(req:Request, res:Response) {
      DescuentoControlador.actualizarDescuento(req.params.id, req.body, res);
   }
}

const descuentoControlador = new DescuentoControlador();
export default descuentoControlador;