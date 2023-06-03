
//Para las subscripciones seguimos instrucciones de  
//seguimos instruccions de https://www.apollographql.com/docs/apollo-server/data/subscriptions/
// Las modificaciones comienzan en I-PROD-4

//Importamos mongoose
const mongoose = require('mongoose');
//Importamos express
const express = require('express');

// Importamos apollo server (Importamos los typeDefs y los resolvers)
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./src/graphql/typeDefs');
const resolvers = require('./src/graphql/resolvers');

// Importamos http y Socket IO
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');

//I-PROD-4
//Importamos pubsub (producto 4)
const pubsub = require('./pubsub');

//Importamos todo lo necesario para hacer la subscripcion por websockets

const { makeExecutableSchema } = require('@graphql-tools/schema');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
//F-PROD-4

// Cadena de conexión
const uri = 'mongodb+srv://admin:U0c2023@cluster0.amvowh2.mongodb.net/weektasks';

// Opciones de configuración de la conexión
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

// Conexión a la base de datos
mongoose.connect(uri, options);

// Obtener la instancia de la conexión
const db = mongoose.connection;

// Manejar eventos de la conexión
db.on('error', console.error.bind(console, 'Error de conexión:'));
db.once('open', function() {
  console.log("Conexión exitosa a la base de datos");
  // hacer algo con la base de datos
});

// Funcion para iniciar el servidor Apollo-Express
async function startServer() {
  
  // Constructor express
  const app = express();

  // Configuracion Socket IO
  const httpServer = http.createServer(app);


  //configuramos el io para un max upload de 100MB de Buffer.
  const io = new Server(httpServer, {maxHttpBufferSize: 1e8 }); //100MB

  // Cors
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://xkh61w-3000.csb.app:5500');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

  // Pasamos la ejecucion del servidor por la carpeta 'public' para mostrar el html
  app.use(express.static('public'));

  // middleware para almacen de ficheros
  app.use(express.static('storage'));


  // Aviso usuario conectado
  io.on('connection', (socket) => {
    console.log(`Nuevo usuario conectado con el ID: ${socket.id}`);

    // --- Señales Cards ---

    // Crear
    socket.on('client:newCard', () => {
      console.log(`Se ha creado una nueva tarjeta correctamente!`)
      socket.emit('server:newCard');
    });

    // Leer
    socket.on('client:showCards', () => {
      console.log('Mostrando tarjetas...')
      socket.emit('server:showCards');
    })

    // Eliminar
    socket.on('client:deleteCard', () => {
      console.log('Tarjeta eliminada correctamente!')
      socket.emit('server:deleteCard');
    })

    // --- Señales Tasks ---

    // Crear
    socket.on('client:newTask', () => {
      console.log(`Se ha creado una nueva tarea correctamente!`)
      socket.emit('server:newTask');
    });

    // Leer
    socket.on('client:showTasks', () => {
      console.log('Mostrando Tareas...')
      socket.emit('server:showTasks');
    })

    // Editar
    socket.on('client:editTask', () => {
      console.log('Tarea editada correctamente!')
      socket.emit('server:editTask');
    })

    // Eliminar
    socket.on('client:deleteTask', () => {
      console.log('Tarea eliminada correctamente!')
      socket.emit('server:deleteTask');
    })

    
    // Aviso usuario desconectado
    socket.on('disconnect', () => {
      console.log(`Usuario con el ID ${socket.id} se ha desconectado`);
    });

    
    //Aviso que se viene un archivo!!    

    socket.on("upload", (file, callback) => {
      //  console.log(file.bytes); // <Buffer 25 50 44 ...>
        let fileFullPath = "";

        let dir = './storage/' + file.folder + "/";
        if (!fs.existsSync(dir)){
           fs.mkdirSync(dir);
        }
        fileFullPath = dir+ file.filename;
      //  console.log(file.filename);
        fs.writeFile(fileFullPath, file.bytes, (err) => {
          //en el callback devolvemos un json de como ha ido la cosa y la ruta donde se ha grabado
          console.log("callback: " + (err ? err : "success"));
          callback({ message: err ? err : "success" , "filepath" : file.folder + "/", "filename" : file.filename});
        });
      });
  });



//I-PROD-4
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const server = new ApolloServer({
    schema,
   plugins: [
      // Configuración para cerrar los websockets bien y que no quede nada colgado
      ApolloServerPluginDrainHttpServer({ httpServer }),
  
      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
    context: ({ req }) => {
      // Incluimos la instancia de PubSub en el contexto
      const context = { req, pubsub }; //añadimos pubsub producto 4 (punto 6)
      context.io = io;
      return context;
    }
  });
  
  //  Creating the WebSocket server
  const wsServer = new WebSocketServer({
    // This is the `httpServer` we created in a previous step.
    server: httpServer,
    // Pass a different path here if app.use
    // serves expressMiddleware at a different path
    path: '/graphql',
  });
  
  // Hand in the schema we just created and have the
  // WebSocketServer start listening.
  const serverCleanup = useServer({ schema }, wsServer);
  
//F-PROD-4

  // Se debe declarar esta funcion asíncrona para evitar que el middelware
  // que une apollo con express se aplique antes de que se inicie el servicio y cause errores
  await server.start();

  // Unimos apollo server a la aplicacion de express
  server.applyMiddleware({app});


  
  // Definimos el pueto predeterminado y lo que se ejecutara cuando se inicie el servidor.
  httpServer.listen(3000, function() {
    console.log('🚀 Frontend client corriendo en http://localhost:3000 🚀 ')
    console.log(`🚀 Servidor de apollo en http://localhost:3000${server.graphqlPath} 🚀`)
  });
}

// Iniciamos el servidor
startServer();
