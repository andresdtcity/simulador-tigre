let preguntas = [];
let indice = 0;

fetch("direcciones.json")
.then(r => r.json())
.then(data => {
    preguntas = data;
});

function comenzarExamen() {

    document.getElementById("inicio").style.display = "none";

    document.getElementById("contenedor").style.display = "block";

    mostrarPregunta();
}

function mostrarPregunta() {

    let p = preguntas[indice];

    document.getElementById("pregunta").innerText =
        "¿Dónde se encuentra " + p.nombre + "?";

    let cont = document.getElementById("opciones");

    cont.innerHTML = "";

    let opciones = [p.direccion];

    opciones.forEach(op => {

        let btn = document.createElement("button");

        btn.innerText = op;

        btn.onclick = function() {
            alert("Respuesta seleccionada");
        };

        cont.appendChild(btn);
    });
}