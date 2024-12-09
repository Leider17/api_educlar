import { Descuento } from "../entidades/Descuento";
import { myDataSource } from "../configuraciones/Connection";
import { Response } from "express";

const descRepository = myDataSource.getRepository(Descuento)

class DescuentoDao {
   // obtener todos los descuentos
   static async mostrarDescuento(res:Response) {
      try{
         const descuentosGuardados = await descRepository.find();
         if(descuentosGuardados.length == 0){
            return res.status(404).json({ response:'No existen descuentos' });
         }
         
         return res.status(200).json(descuentosGuardados);
      }catch(error){
         return res.status(500).json({ response:'No se pueden recuperar los descuentos' });
      }
   }

   // crear un descuento
   static async agregarDescuento(body:any, res:Response) {
      try{
         const exist = await descRepository.findOneBy({
            desc_nombre: body.desc_nombre
         });
         if(exist){
            return res.status(400).json({ response:'El descuento ya existe' });
         }
         
         const descuento = new Descuento();
         descuento.desc_nombre = body.desc_nombre;
         descuento.desc_valor = body.desc_valo;
   
         await descRepository.save(descuento);
         return res.status(200).json({ response:"Descuento guardado", data:descuento });
      }catch(error){
         return res.status(500).json({ response:"Error creando descuento"});
      }
   }

   // eliminar un descuento
   static async eliminarDescuento(id:any, res:Response) {
      try{
         const descuento = await descRepository.findOneBy({
            desc_id: id
         });

         if(!descuento){
            return res.status(400).json({ response:'El descuento no existe' });
         }

         await descRepository.remove(descuento);
         return res.status(200).json({ response:'Descuento eliminado', data:descuento });
      }catch(error){
         return res.status(500).json({ response:'El descuento no puede ser eliminado' });
      }
  }

  // actualizar un descuento
   static async actualizarDescuento(id:any, body:any, res:Response):Promise<any> {
      try{
         const descuento = await descRepository.findOneBy({
            desc_id: id
         });
         if(!descuento){
            return res.status(400).json({ response:'El descuento no existe' });
         }

         descuento.desc_nombre = body.desc_nombre;
         descuento.desc_valor = body.desc_valor;

         descRepository.save(descuento);
         return res.status(200).json({ response:'Descuento actualizado', updated:descuento });
      }catch(error){
         return res.status(500).json({ response:'El descuento no se pudo actualizar' });
      }
   }
}

export default DescuentoDao;