/*Importamos pubsub para realizar este punto de la tarea 4: 
* Crear una nueva instancia de la clase PubSub que está relacionado con ApolloServer 
* para tener incluido dentro de este la posibilidad de publicar/subscribir. 
* Se aconseja realizar esta acción a través de un nuevo módulo pubsub.js*/
const { PubSub } = require('apollo-server-express');
const pubsub = new PubSub();
module.exports = pubsub;