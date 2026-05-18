function comenzarExamen(){

  document.getElementById("inicio")
    .style.display = "none";

  document.getElementById("contenedor")
    .style.display = "block";

  }
let preguntas = [];
let indice = 0;
let puntaje = 0;

fetch("direcciones.json")
.then(r=>r.json())
.then(data=>{
  preguntas = data.sort(()=>Math.random()-0.5).slice(0,25);
  mostrarPregunta();
});
respondida = false;
function mostrarPregunta(){

  const p = preguntas[indice];

  document.getElementById("contador").innerText =
    `${indice+1}/25`;

  document.getElementById("pregunta").innerText =
    `¿Dónde se encuentra ${p.nombre}?`;

  let opciones = generarOpciones(p.direccion);

  let cont = document.getElementById("opciones");
  cont.innerHTML = "";

  opciones.forEach(op=>{

    let btn = document.createElement("button");

    btn.className = "opcion";
    btn.innerText = op;

    btn.onclick = ()=>responder(op,p.direccion);

    cont.appendChild(btn);
  });
}

let respondida = false;

function responder(btn, seleccion, correcta) {

  if (respondida) return;

  respondida = true;

  const botones =
    document.querySelectorAll(".opcion");

  botones.forEach(b => {
    b.disabled = true;
  });

  if (seleccion === correcta) {
    btn.classList.add("correcta");
    puntaje++;
  }
  else {

    btn.classList.add("incorrecta");

    botones.forEach(b => {
      if (b.innerText === correcta) {
        b.classList.add("correcta");
      }
    });

    errores.push({
      pregunta: preguntas[indice].nombre,
      correcta: correcta
    });
  }
}

function siguiente(){

  indice++;

  if(indice<preguntas.length){
    mostrarPregunta();
  }
  else{
    document.getElementById("contenedor").innerHTML =
      `<h2>Resultado: ${puntaje}/25</h2>`;
  }
}

function generarOpciones(correcta){

  const calles = [
    "Av. Cazón",
    "Mitre",
    "Lavalle",
    "Ruta 27",
    "Belgrano",
    "Sarmiento"
  ];

  let falsas = [];

  while(falsas.length<2){

    let calle =
      calles[Math.floor(Math.random()*calles.length)];

    let numero =
      Math.floor(Math.random()*5000)+1;

    falsas.push(`${calle} ${numero}`);
  }

  let opciones = [...falsas,correcta];

  return opciones.sort(()=>Math.random()-0.5);
}
