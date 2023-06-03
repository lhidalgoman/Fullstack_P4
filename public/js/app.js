/**
 * JS funciones generales de control del FrontEnd
 */

// Inicializamos el constructor para poder enviar señales
// del cliente al servidor y viceversa.
const socket = io();


const SERVER_LOCATION = "localhost:3000"
const SERVER_URL = `http://${SERVER_LOCATION}/`;
const GRAPHQL_URL = SERVER_URL + "graphql";

const GRAPHQL_ENDPOINT = `ws://${SERVER_LOCATION}/graphql`;


//i-PROD-4 conexión a websockets
//Creamos el cliente graphql-ws
const client = graphqlWs.createClient({
  url: GRAPHQL_ENDPOINT,
  lazy: false,
});

//realizamos la subscripción nada más iniciar 
client.subscribe({
  query: `subscription Day {
    day {
        taskId
        dia
    }
}`
},{
  next: (res) => {
    //console.log(res.data);
    //Si alguien actualiza una tarea saldrá un AVISO para que actualice la página o se vaya a desayunar sin son entre las 9 o las 10 de la mañana.
    alert('Se ha actualizado la tarea ' + res.data.day.taskId + " al dia " + res.data.day.dia ); 
  },
  error: (error) => console.error(error),
}); 
//F-PROD-4 

// Paleta de colores
const DEFAULT_COLOR = "#edede9"; 
const DEFAULT_TASK_COLOR = "#eab676"
const WHT_COLOR = "#FAFAFA";
 

  /**
   * pone el título en el navbar
   */

  function loadNavBar(t){
    let titulo = document.getElementById("titulo");
    titulo.innerHTML = t;
  }

  /**
   *  Container donde se irán almacenando las tarjetas que se generen mediante el formulario
   */

  function loadDivCardWeeks(){
    let container = document.getElementById("container");
    container.innerHTML=`<button class="btn btn-primary mt-4 ml-5 mb-5 d-flex justify-content-center align-items-center" onclick="addWeekModal()">+ Añadir Semana</button>
    <div class="row" id="weekContainer">
    </div>`;
  }

  function upload(taskId, files) {
   // console.log(files[0].name);
    socket.emit("upload",  {"bytes":files[0], "filename":files[0].name, "folder":taskId}, (status) => {
      console.log("status: " + status.message);
      if (status.message==="success"){
        console.log(status.message + ": " + status.filename)
        let fileDate = new Date(files[0].lastModified).toLocaleString();;
        //envia la actualización al graphql
        updateFileTask(taskId,  status.filepath, status.filename, fileDate);
        
      }
      else {
        alert("ERROR EN CARGA DE ARCHIVO: " + status.message);        
      }

    });
  }

 




  function loadMain(){
      loadNavBar("TARJETAS SEMANALES");
      loadDivCardWeeks();
      modalDialogCard();
      modalAddTask();
      modalDeleteTask();
      modalUploadFile();
      fetchWeeks();
  }


//carga las semanas.
document.onload = loadMain();