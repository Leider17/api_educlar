# Usa una imagen base con Node.js
FROM node:16

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia los archivos package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia todo el código de la aplicación
COPY . .

# Compila el código TypeScript
RUN npx tsc

# Exponer el puerto en el que la aplicación correrá
EXPOSE 3001

# Comando para ejecutar el servidor
CMD ["node", "build/index.js"]
