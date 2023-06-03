Carpetas (P) Desarrollo FullStack con Javascript:

public/: Contiene los archivos que se servirán al usuario final, como HTML, CSS, JS, imágenes y otros recursos estáticos.

src/: Contiene todo el código fuente de tu proyecto. Aquí es donde escribirás la mayor parte de tu código, incluyendo componentes, páginas, servicios, estilos, etc.

## PRODUCTO 4

# Archivos modificados

Todos las modificaciones incluyen el comentario PROD-4 (I-PROD-4 ....  F-PROD-4)

Se han modificado en la parte del **servidor**

    - **server.js**  Se configura el servidor ApolloServer para aceptar el GraphQL sobre websocket (graphql-ws). Atención que esta es la nueva versión que incluye el paquete de ApolloServer y no es compatible con implementaciones anteriores
    - **typeDefs.js**  NUEVOS types;  Subscription  y dayTask
    - **resolvers.js** NUEVO Resolver  Subsctiption // modificación del resolver de actualizar dia de tarea para lanzar evento Pubsub

En la parte de **Cliente**
    - Nueva carpeta **graphql-ws** con el código que necesitamos para crear nuestro cliente
    - **app.js**  Añadido código para subscribirse nada más iniciar la aplicación y lanzar alerta si se modifica el dia de la tarea


