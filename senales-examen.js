/* ===================================================================
   Módulo de examen de señales de tránsito
   =================================================================== */

let preguntasSenales = [];
let indiceSenal = 0;
let respondidaSenal = false;
let puntajeSenal = 0;
let erroresSenal = [];
const TOTAL_PREGUNTAS_SENALES = 20;

function iniciarExamenSenales() {

    if (typeof SENALES === "undefined" || SENALES.length === 0) {
        alert("Las señales todavía no se cargaron.");
        return;
    }

    preguntasSenales = [...SENALES]
        .sort(() => Math.random() - 0.5)
        .slice(0, TOTAL_PREGUNTAS_SENALES);

    indiceSenal = 0;
    puntajeSenal = 0;
    erroresSenal = [];

    document.getElementById("inicio").style.display = "none";
    document.getElementById("contenedorSenales").style.display = "block";

    iniciarTimer();
    mostrarPreguntaSenal();
}

function mostrarPreguntaSenal() {

    respondidaSenal = false;

    let s = preguntasSenales[indiceSenal];

    document.getElementById("numeroPreguntaSenal").innerText =
        "Pregunta " + (indiceSenal + 1) + " de " + preguntasSenales.length;

    actualizarContadorSenal();

    document.getElementById("imagenSenal").innerHTML = crearSVGSenal(s);

    document.getElementById("preguntaSenal").innerText =
        "¿Qué significa esta señal?";

    let cont = document.getElementById("opcionesSenal");
    cont.innerHTML = "";

    // generar 2 opciones falsas de la misma categoría cuando sea posible
    let candidatas = SENALES.filter(x =>
        x.id !== s.id && x.categoria === s.categoria
    );

    if (candidatas.length < 2) {
        candidatas = SENALES.filter(x => x.id !== s.id);
    }

    candidatas = candidatas.sort(() => Math.random() - 0.5);

    let falsas = [];
    let nombresUsados = new Set([s.nombre]);

    for (let c of candidatas) {
        if (falsas.length >= 2) break;
        if (!nombresUsados.has(c.nombre)) {
            falsas.push(c);
            nombresUsados.add(c.nombre);
        }
    }

    let opciones = [s, ...falsas].sort(() => Math.random() - 0.5);

    opciones.forEach(op => {

        let btn = document.createElement("button");
        btn.className = "opcion";
        btn.innerText = op.nombre;

        btn.onclick = function () {

            if (respondidaSenal) return;
            respondidaSenal = true;

            let botones = document.querySelectorAll("#opcionesSenal .opcion");
            botones.forEach(b => b.disabled = true);

            if (op.id === s.id) {

                btn.style.background = "green";
                puntajeSenal++;
                sonidoAcierto.currentTime = 0;
                sonidoAcierto.play();

                setTimeout(() => {
                    siguienteSenal();
                }, 900);

            } else {

                btn.style.background = "red";
                sonidoError.currentTime = 0;
                sonidoError.play();

                erroresSenal.push(s);

                botones.forEach(b => {
                    if (b.innerText === s.nombre) {
                        b.style.background = "green";
                    }
                });

                let correcto = document.createElement("p");
                correcto.innerHTML = "<b>Respuesta correcta:</b> " + s.nombre;
                correcto.style.marginTop = "10px";
                cont.appendChild(correcto);
            }
        };

        cont.appendChild(btn);
    });
}

function actualizarContadorSenal() {
    let el = document.getElementById("contador");
    if (!el) return;
    el.innerText = "Pregunta " + (indiceSenal + 1) + " de " + preguntasSenales.length;
}

function siguienteSenal() {

    if (!respondidaSenal) {
        alert("Seleccioná una respuesta");
        return;
    }

    indiceSenal++;

    if (indiceSenal < preguntasSenales.length) {

        mostrarPreguntaSenal();

    } else {

        detenerTimer();

        document.getElementById("contenedorSenales").innerHTML = `
<h2>Examen finalizado</h2>

<h3>
Resultado: ${puntajeSenal}/${preguntasSenales.length}
</h3>

<p>
Errores: ${erroresSenal.length}
</p>

<button onclick="location.reload()">
Volver al inicio
</button>
`;
    }
}
