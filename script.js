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

    let mapa = document.getElementById("mapa");

if (mapa) {
    mapa.innerHTML = "";
}
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

        document.getElementById("mapa").innerHTML = `
    <h4>Ubicación en Google Maps</h4>

    <iframe
        width="100%"
        height="300"
        style="border:0;border-radius:10px;"
        loading="lazy"
        allowfullscreen
        src="https://www.google.com/maps?q=${encodeURIComponent(p.maps + ', Tigre, Buenos Aires')}&output=embed">
    </iframe>
`;

    correcto.style.marginTop = "10px";

    cont.appendChild(correcto);
    document.getElementById("mapa").innerHTML = `
    <h4>📍 Ubicación</h4>

    <iframe
        width="100%"
        height="300"
        style="border:0;border-radius:10px;"
        loading="lazy"
        src="https://maps.google.com/maps?q=${encodeURIComponent(
            p.direccion + ", Tigre, Buenos Aires"
        )}&output=embed">
    </iframe>
`;
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

    document.getElementById("contenedor").innerHTML = `
        <h2>Unir pares</h2>
        <p>Seleccioná una dependencia y luego una dirección</p>

        <div id="juego">
            <div id="columnaNombres"></div>
            <div id="columnaDirecciones"></div>
        </div>

        <h3 id="estado"></h3>
    `;

    let seleccionado = null;
    let paresResueltos = 0;

    // COLUMNA IZQUIERDA
    nombres.forEach(item => {

        let btn = document.createElement("button");

        btn.innerText = item.nombre;
        btn.className = "nombre";

        btn.onclick = () => {

            if (btn.disabled) return;

            document
                .querySelectorAll(".nombre")
                .forEach(b => {

                    if (!b.disabled) {
                        b.style.background = "";
                    }

                });

            btn.style.background = "#2196F3";

            seleccionado = {
                item: item,
                boton: btn
            };

            document.getElementById("estado").innerText =
                "Seleccionaste: " + item.nombre;
        };

        document
            .getElementById("columnaNombres")
            .appendChild(btn);
    });

    // COLUMNA DERECHA
    direcciones.forEach(item => {

        let btn = document.createElement("button");

        btn.innerText = item.direccion;
        btn.className = "direccion";

        btn.onclick = () => {

            if (!seleccionado) {
                alert("Primero elegí una dependencia");
                return;
            }

            if (btn.disabled) return;

            let botonIzq = seleccionado.boton;

            // CORRECTO
            if (
                seleccionado.item.direccion ===
                item.direccion
            ) {

                botonIzq.style.background = "green";
                btn.style.background = "green";

                botonIzq.disabled = true;
                btn.disabled = true;

                paresResueltos++;

                document.getElementById("estado").innerText =
                    "✅ Correcto";

                seleccionado = null;

            }
            // INCORRECTO
            else {

                botonIzq.style.background = "red";
                btn.style.background = "red";

                document.getElementById("estado").innerText =
                    "❌ Incorrecto";

                seleccionado = null;

                setTimeout(() => {

                    botonIzq.style.background = "";
                    btn.style.background = "";

                }, 1000);
            }

            // TERMINÓ EL JUEGO
            if (paresResueltos === errores.length) {

                setTimeout(() => {

                    document.getElementById("contenedor").innerHTML = `
                        <h2>🎉 Ejercicio completado</h2>

                        <p>
                            Aprendiste todas las direcciones que habías fallado.
                        </p>

                        <button onclick="location.reload()">
                            Nuevo examen
                        </button>
                        `;

                }, 800);
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