let preguntas = [];
let indice = 0;
let respondida = false;
let puntaje = 0;

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

function siguiente() {

    if (!respondida) {
        alert("Seleccioná una respuesta");
        return;
    }

    indice++;

    if (indice < preguntas.length) {

        mostrarPregunta();

    } else {

        document.getElementById("contenedor").innerHTML =
            "<h2>Examen terminado</h2>" +
            "<h3>Puntaje: " + puntaje + "/" + preguntas.length + "</h3>";
    }
}

function mostrarPregunta() {

    respondida = false;

    let p = preguntas[indice];

    document.getElementById("numeroPregunta").innerText =
    "Pregunta " + (indice + 1) + " de " + preguntas.length;

    document.getElementById("pregunta").innerText =
        "¿Dónde se encuentra " + p.nombre + "?";

    let cont = document.getElementById("opciones");

    cont.innerHTML = "";

    // respuestas falsas
    let falsas = [];

    while (falsas.length < 2) {

        let random =
            preguntas[Math.floor(Math.random() * preguntas.length)].direccion;

        if (
            random !== p.direccion &&
            !falsas.includes(random)
        ) {
            falsas.push(random);
        }
    }

    // mezclar opciones
    let opciones = [
        p.direccion,
        ...falsas
    ];

    opciones.sort(() => Math.random() - 0.5);

    opciones.forEach(op => {

        let btn = document.createElement("button");

        btn.className = "opcion";

        btn.innerText = op;

        btn.onclick = function () {

    if (respondida) return;

    respondida = true;

    let botones =
        document.querySelectorAll(".opcion");

    botones.forEach(b => {
        b.disabled = true;
    });

    if (op === p.direccion) {

        btn.style.background = "green";
        puntaje++;

    } else {

        btn.style.background = "red";

        botones.forEach(b => {

            if (b.innerText === p.direccion) {

                b.style.background = "green";
            }
        });

        let correcto =
            document.createElement("p");

        correcto.innerHTML =
            "<b>Respuesta correcta:</b> " +
            p.direccion;

        correcto.style.marginTop = "10px";

        cont.appendChild(correcto);
    }
};

        cont.appendChild(btn);
    });
}