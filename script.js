let preguntas = [];
let indice = 0;
let respondida = false;
let puntaje = 0;
let errores = [];
const TOTAL_PREGUNTAS = 30;

fetch("direcciones.json")
.then(r => r.json())
.then(data => {
    preguntas = data
    .sort(() => Math.random() - 0.5)
    .slice(0, TOTAL_PREGUNTAS);
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
`
<h2>Examen finalizado</h2>

<h3>
Resultado: ${puntaje}/${preguntas.length}
</h3>

<p>
Errores: ${errores.length}
</p>

<button onclick="reiniciarExamen()">
Reiniciar examen
</button>

<button onclick="practicarErrores()">
Practicar errores
</button>
`;
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

    errores.push({
        nombre: p.nombre,
        direccion: p.direccion
    });

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

    document
        .getElementById("opciones")
        .appendChild(btn);
    });
}

function practicarErrores() {

    if (errores.length === 0) {
        alert("No hay errores para practicar");
        return;
    }

    let nombres = [...errores];
    let direcciones = [...errores];

    direcciones.sort(() => Math.random() - 0.5);

    let html = `
        <h2>Unir pares</h2>
        <p>Seleccioná una dependencia y luego una dirección</p>

        <div id="juego" style="display:flex;gap:20px;">
            <div id="columnaNombres"></div>
            <div id="columnaDirecciones"></div>
        </div>

        <h3 id="estado"></h3>
    `;

    document.getElementById("contenedor").innerHTML = html;

    let seleccionado = null;
    let aciertos = 0;

    nombres.forEach(item => {

        let btn = document.createElement("button");

        btn.innerText = item.nombre;
        btn.className = "nombre";

        btn.onclick = () => {
            seleccionado = item;
            document.getElementById("estado").innerText =
                "Seleccionaste: " + item.nombre;
        };

        document
            .getElementById("columnaNombres")
            .appendChild(btn);
    });

    direcciones.forEach(item => {

        let btn = document.createElement("button");

        btn.innerText = item.direccion;
        btn.className = "direccion";

        btn.onclick = () => {

            if (!seleccionado) {
                alert("Primero elegí una dependencia");
                return;
            }

            if (seleccionado.direccion === item.direccion) {

                btn.style.background = "green";

                btn.disabled = true;

                aciertos++;

                document.getElementById("estado").innerText =
                    "✅ Correcto";

            } else {

                btn.style.background = "red";

                document.getElementById("estado").innerText =
                    "❌ Incorrecto";
            }

            seleccionado = null;

            if (aciertos === errores.length) {

                setTimeout(() => {

                    document.getElementById("contenedor").innerHTML = `
                        <h2>🎉 Ejercicio completado</h2>

                        <button onclick="location.reload()">
                            Nuevo examen
                        </button>
                    `;

                }, 1000);
            }
        };

        document
            .getElementById("columnaDirecciones")
            .appendChild(btn);
    });
}
function reiniciarExamen() {

    preguntas = preguntas
        .sort(() => Math.random() - 0.5);

    location.reload();
}