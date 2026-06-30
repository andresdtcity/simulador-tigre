let preguntas = [];
let indice = 0;
let respondida = false;
let puntaje = 0;
let errores = [];
let calles = [];
const TOTAL_PREGUNTAS = 30;
const sonidoError = new Audio("./sonidoError.mp3");
const sonidoAcierto = new Audio("./sonidoAcierto.mp3");

let segundosTranscurridos = 0;
let timerInterval = null;

Promise.all([
    fetch("direcciones.json").then(r => r.json()),
    fetch("calles.json").then(r => r.json())
])
.then(([datosPreguntas, datosCalles]) => {

    preguntas = datosPreguntas
        .sort(() => Math.random() - 0.5)
        .slice(0, TOTAL_PREGUNTAS);

    calles = datosCalles;

    console.log("Preguntas:", preguntas.length);
    console.log("Calles:", calles.length);

    let btnInicio = document.getElementById("btnInicio");

    if (btnInicio) {
        btnInicio.disabled = false;
    }

})
.catch(error => {
    console.error(error);
    alert("Error cargando los archivos.");
});

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("./service-worker.js")
            .catch(error => {
                console.error("Error registrando el service worker:", error);
            });
    });
}

function generarDireccionFalsa() {

    let c = calles[Math.floor(Math.random() * calles.length)];

    let usarPar = Math.random() < 0.5;

    let numero;

    if (usarPar) {

        numero =
            c.parInicio +
            Math.floor(
                Math.random() *
                ((c.parFin - c.parInicio) / 2 + 1)
            ) * 2;

    } else {

        numero =
            c.imparInicio +
            Math.floor(
                Math.random() *
                ((c.imparFin - c.imparInicio) / 2 + 1)
            ) * 2;

    }

    return (c.calle + " " + numero).toLowerCase();

}

function comenzarExamen() {

    if (preguntas.length === 0) {
        alert("Las preguntas todavía no terminaron de cargarse.");
        return;
    }

    if (calles.length === 0) {
        alert("Las calles todavía no terminaron de cargarse.");
        return;
    }

    document.getElementById("inicio").style.display = "none";
    document.getElementById("contenedor").style.display = "block";

    iniciarTimer();
    mostrarPregunta();
}

function iniciarTimer() {

    segundosTranscurridos = 0;
    actualizarTimer();

    if (timerInterval) {
        clearInterval(timerInterval);
    }

    timerInterval = setInterval(() => {
        segundosTranscurridos++;
        actualizarTimer();
    }, 1000);
}

function detenerTimer() {

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function actualizarTimer() {

    let timerEl = document.getElementById("timer");

    if (!timerEl) return;

    let min = Math.floor(segundosTranscurridos / 60)
        .toString()
        .padStart(2, "0");

    let seg = (segundosTranscurridos % 60)
        .toString()
        .padStart(2, "0");

    timerEl.innerText = "⏱ " + min + ":" + seg;
}

function actualizarContador() {

    let contadorEl = document.getElementById("contador");

    if (!contadorEl) return;

    contadorEl.innerText =
        "Pregunta " + (indice + 1) + " de " + preguntas.length;
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

        detenerTimer();

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

     if (preguntas.length === 0) {
        alert("Las preguntas todavía no se cargaron.");
        return;
    }

    if (calles.length === 0) {
        alert("Las calles todavía no se cargaron.");
        return;
    }

    let mapa = document.getElementById("mapa");

    if (mapa) {
        mapa.innerHTML = "";
    }

    respondida = false;

    let p = preguntas[indice];

    document.getElementById("numeroPregunta").innerText =
        "Pregunta " + (indice + 1) + " de " + preguntas.length;

    actualizarContador();

    document.getElementById("pregunta").innerText =
        "¿Dónde se encuentra " + p.nombre + "?";

    let cont = document.getElementById("opciones");

    cont.innerHTML = "";

    // respuestas falsas
    let falsas = [];

    while (falsas.length < 2) {

        let direccion = generarDireccionFalsa();

        if (
            direccion !== p.direccion &&
            !falsas.includes(direccion)
        ) {
            falsas.push(direccion);
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
                sonidoAcierto.currentTime = 0;
                sonidoAcierto.play();

            } else {

                btn.style.background = "red";
                sonidoError.currentTime = 0;
                sonidoError.play();

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

                // El mapa solo se muestra cuando la respuesta es incorrecta
                document.getElementById("mapa").innerHTML = `
<h4>Ubicación en Google Maps</h4>
<iframe
    width="100%"
    height="300"
    style="border:0;border-radius:10px;"
    loading="lazy"
    allowfullscreen
    src="https://www.google.com/maps?q=${encodeURIComponent(p.maps + ', Tigre, Buenos Aires')}&output=embed">
</iframe>`;
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
