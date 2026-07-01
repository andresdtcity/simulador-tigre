/* ===================================================================
   Generador de SVG para señales de tránsito
   crearSVGSenal(senal) -> string SVG completo (viewBox 0 0 160 160)
   =================================================================== */

function _flechaPath(cx, cy, len, grosor, curva, espejo) {
    // flecha sólida rellena, apuntando hacia arriba (se rota por transform)
    let s = espejo ? -1 : 1;
    let w = grosor * 0.9; // ancho del asta
    let hw = grosor * 1.9; // ancho de la punta

    if (!curva) {
        let top = cy - len / 2;
        let bottom = cy + len / 2;
        let headBase = top + len * 0.42;
        return `
            <polygon points="
                ${cx - w/2},${bottom} ${cx + w/2},${bottom}
                ${cx + w/2},${headBase} ${cx + hw},${headBase}
                ${cx},${top} ${cx - hw},${headBase}
                ${cx - w/2},${headBase}
            " stroke-linejoin="round"/>
        `;
    }

    // flecha curva (giro): trazo grueso con punta sólida al final
    let r = len * 0.5;
    let x0 = cx + r * s, y0 = cy + len * 0.42;
    let x1 = cx - r * 0.15 * s, y1 = cy - len * 0.5;
    return `
        <path d="M ${x0} ${y0} Q ${cx + r*s} ${cy - r*0.15} ${x1} ${y1}"
              fill="none" stroke-width="${grosor}" stroke-linecap="round"/>
        <polygon points="
            ${x1 - 13*s},${y1 + 3} ${x1 + 15*s},${y1 - 2} ${x1 - 2*s},${y1 - 17}
        "/>
    `;
}

function _personaPath(color, pose) {
    // figura humana simplificada (cabeza + cuerpo + piernas)
    let extra = "";
    if (pose === "jugando") {
        extra = `<circle cx="98" cy="100" r="9" fill="${color}"/><line x1="98" y1="109" x2="98" y2="128" stroke="${color}" stroke-width="6" stroke-linecap="round"/>`;
    }
    if (pose === "escolar") {
        extra = `<circle cx="100" cy="98" r="9" fill="${color}"/><line x1="100" y1="107" x2="100" y2="128" stroke="${color}" stroke-width="6" stroke-linecap="round"/><line x1="100" y1="118" x2="112" y2="128" stroke="${color}" stroke-width="6" stroke-linecap="round"/>`;
    }
    if (pose === "trabajando") {
        extra = `<line x1="84" y1="95" x2="100" y2="80" stroke="${color}" stroke-width="6" stroke-linecap="round"/>`;
    }
    if (pose === "banderillero") {
        extra = `<line x1="84" y1="90" x2="104" y2="78" stroke="${color}" stroke-width="5" stroke-linecap="round"/><path d="M104,78 L120,72 L104,68 Z" fill="${color}"/>`;
    }
    return `
        <circle cx="80" cy="58" r="11" fill="${color}"/>
        <line x1="80" y1="69" x2="80" y2="100" stroke="${color}" stroke-width="7" stroke-linecap="round"/>
        <line x1="80" y1="78" x2="64" y2="92" stroke="${color}" stroke-width="6" stroke-linecap="round"/>
        <line x1="80" y1="78" x2="96" y2="90" stroke="${color}" stroke-width="6" stroke-linecap="round"/>
        <line x1="80" y1="100" x2="68" y2="128" stroke="${color}" stroke-width="7" stroke-linecap="round"/>
        <line x1="80" y1="100" x2="92" y2="128" stroke="${color}" stroke-width="7" stroke-linecap="round"/>
        ${extra}
    `;
}

function _vehiculoPath(color, variante) {
    if (variante === "bicicleta") {
        return `
            <circle cx="62" cy="100" r="16" fill="none" stroke="${color}" stroke-width="5"/>
            <circle cx="106" cy="100" r="16" fill="none" stroke="${color}" stroke-width="5"/>
            <polyline points="62,100 84,68 106,100 84,100 62,100" fill="none" stroke="${color}" stroke-width="5" stroke-linejoin="round"/>
            <line x1="84" y1="68" x2="96" y2="68" stroke="${color}" stroke-width="5" stroke-linecap="round"/>
        `;
    }
    if (variante === "camion") {
        return `
            <rect x="40" y="72" width="40" height="28" rx="2" fill="none" stroke="${color}" stroke-width="5"/>
            <path d="M80,80 h22 l12,14 v6 h-34 z" fill="none" stroke="${color}" stroke-width="5" stroke-linejoin="round"/>
            <circle cx="58" cy="104" r="8" fill="${color}"/>
            <circle cx="100" cy="104" r="8" fill="${color}"/>
        `;
    }
    if (variante === "bus") {
        return `
            <rect x="42" y="68" width="76" height="32" rx="6" fill="none" stroke="${color}" stroke-width="5"/>
            <line x1="58" y1="68" x2="58" y2="100" stroke="${color}" stroke-width="3"/>
            <line x1="80" y1="68" x2="80" y2="100" stroke="${color}" stroke-width="3"/>
            <line x1="102" y1="68" x2="102" y2="100" stroke="${color}" stroke-width="3"/>
            <circle cx="58" cy="104" r="7" fill="${color}"/>
            <circle cx="102" cy="104" r="7" fill="${color}"/>
        `;
    }
    // auto (default)
    return `
        <path d="M40,98 q4,-22 30,-22 h20 q22,0 30,22 z" fill="none" stroke="${color}" stroke-width="5" stroke-linejoin="round"/>
        <circle cx="58" cy="102" r="8" fill="${color}"/>
        <circle cx="102" cy="102" r="8" fill="${color}"/>
    `;
}

function _caminoPath(color, variante, espejo) {
    let s = espejo ? -1 : 1;
    const W = 5;
    switch (variante) {
        case "curva":
            return `<path d="M50,120 Q50,50 120,50" fill="none" stroke="${color}" stroke-width="${W}"/>`;
        case "curva_suave":
            return `<path d="M45,120 Q75,55 120,55" fill="none" stroke="${color}" stroke-width="${W}"/>`;
        case "curva_cerrada":
            return `<path d="M40,115 Q40,45 115,45 Q120,45 118,55" fill="none" stroke="${color}" stroke-width="${W}"/>`;
        case "doble_curva":
            return `<path d="M40,120 Q40,80 80,80 Q120,80 120,40" fill="none" stroke="${color}" stroke-width="${W}"/>`;
        case "doble_curva_menor":
            return `<path d="M45,120 Q45,85 80,85 Q115,85 115,50" fill="none" stroke="${color}" stroke-width="${W}" stroke-dasharray="0"/>`;
        case "sinuoso":
            return `<path d="M40,120 Q60,90 80,100 Q100,110 120,40" fill="none" stroke="${color}" stroke-width="${W}"/>`;
        case "angosto":
            return `<path d="M45,40 L70,75 L70,105 L45,140 M115,40 L90,75 L90,105 L115,140" fill="none" stroke="${color}" stroke-width="${W}" stroke-linecap="round"/>`;
        case "cruz":
            return `<line x1="80" y1="40" x2="80" y2="140" stroke="${color}" stroke-width="${W}"/><line x1="30" y1="90" x2="130" y2="90" stroke="${color}" stroke-width="${W}"/>`;
        case "t":
            return `<line x1="80" y1="40" x2="80" y2="95" stroke="${color}" stroke-width="${W}"/><line x1="30" y1="95" x2="130" y2="95" stroke="${color}" stroke-width="${W}"/>`;
        case "y":
            return `<line x1="80" y1="130" x2="80" y2="90" stroke="${color}" stroke-width="${W}"/><line x1="80" y1="90" x2="40" y2="40" stroke="${color}" stroke-width="${W}"/><line x1="80" y1="90" x2="120" y2="40" stroke="${color}" stroke-width="${W}"/>`;
        case "lateral":
            return `<line x1="80" y1="140" x2="80" y2="40" stroke="${color}" stroke-width="${W}"/><line x1="80" y1="75" x2="${80+40*s}" y2="40" stroke="${color}" stroke-width="${W}"/>`;
        case "empalmes":
            return `<line x1="40" y1="140" x2="100" y2="80" stroke="${color}" stroke-width="${W}"/><line x1="100" y1="80" x2="60" y2="40" stroke="${color}" stroke-width="${W}"/><line x1="100" y1="80" x2="130" y2="80" stroke="${color}" stroke-width="${W}"/>`;
        case "fin_dividido":
            return `<line x1="65" y1="140" x2="65" y2="40" stroke="${color}" stroke-width="${W}"/><line x1="95" y1="140" x2="95" y2="90" stroke="${color}" stroke-width="${W}"/><line x1="65" y1="90" x2="95" y2="90" stroke="${color}" stroke-width="${W}"/>`;
        case "incorporacion":
            return `<line x1="95" y1="140" x2="95" y2="40" stroke="${color}" stroke-width="${W}"/><line x1="40" y1="120" x2="95" y2="80" stroke="${color}" stroke-width="${W}"/>`;
        case "rotonda":
            return `<circle cx="80" cy="90" r="26" fill="none" stroke="${color}" stroke-width="${W}"/><line x1="80" y1="140" x2="80" y2="116" stroke="${color}" stroke-width="${W}"/><line x1="35" y1="60" x2="58" y2="75" stroke="${color}" stroke-width="${W}"/><line x1="125" y1="60" x2="102" y2="75" stroke="${color}" stroke-width="${W}"/>`;
        case "irregular":
            return `<path d="M40,110 L60,90 L75,105 L95,75 L120,95" fill="none" stroke="${color}" stroke-width="${W}" stroke-linejoin="round"/>`;
        case "sin_salida":
            return `<line x1="80" y1="40" x2="80" y2="100" stroke="${color}" stroke-width="${W}"/><line x1="50" y1="100" x2="110" y2="100" stroke="${color}" stroke-width="${W}"/>`;
        default:
            return `<line x1="80" y1="40" x2="80" y2="140" stroke="${color}" stroke-width="${W}"/>`;
    }
}

function _perfilPath(color, variante) {
    if (variante === "lomo") return `<path d="M35,110 Q80,60 125,110" fill="none" stroke="${color}" stroke-width="5"/><line x1="25" y1="110" x2="135" y2="110" stroke="${color}" stroke-width="5"/>`;
    if (variante === "baden") return `<path d="M35,90 Q80,130 125,90" fill="none" stroke="${color}" stroke-width="5"/><line x1="25" y1="90" x2="135" y2="90" stroke="${color}" stroke-width="5"/>`;
    if (variante === "subida") return `<line x1="30" y1="120" x2="130" y2="60" stroke="${color}" stroke-width="5" stroke-linecap="round"/><polyline points="110,60 130,60 130,80" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (variante === "bajada") return `<line x1="30" y1="60" x2="130" y2="120" stroke="${color}" stroke-width="5" stroke-linecap="round"/><polyline points="110,120 130,120 130,100" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
    return "";
}

function _pictogramaPath(color, nombre) {
    const lib = {
        cruz: `<rect x="68" y="48" width="24" height="64" fill="${color}"/><rect x="48" y="68" width="64" height="24" fill="${color}"/>`,
        avion: `<path d="M40,90 L125,80 L125,90 L90,98 L86,118 L78,118 L78,98 L55,98 Z" fill="${color}"/>`,
        llave: `<path d="M50,110 L90,70 a14,14 0 1 1 10,10 L60,120 a8,8 0 0 1 -10,-10 Z" fill="none" stroke="${color}" stroke-width="6" stroke-linejoin="round"/>`,
        telefono: `<path d="M50,55 q-5,15 10,30 q15,15 30,10 l8,15 q-25,15 -48,-8 q-23,-23 -8,-48 Z" fill="${color}"/>`,
        cama: `<rect x="42" y="85" width="76" height="22" rx="3" fill="none" stroke="${color}" stroke-width="5"/><rect x="42" y="70" width="22" height="18" rx="3" fill="${color}"/><line x1="42" y1="107" x2="42" y2="118" stroke="${color}" stroke-width="5"/><line x1="118" y1="107" x2="118" y2="118" stroke="${color}" stroke-width="5"/>`,
        cubiertos: `<line x1="58" y1="50" x2="58" y2="115" stroke="${color}" stroke-width="5"/><line x1="50" y1="50" x2="50" y2="75" stroke="${color}" stroke-width="4"/><line x1="66" y1="50" x2="66" y2="75" stroke="${color}" stroke-width="4"/><path d="M100,50 q-12,0 -12,20 q0,15 12,18 l0,27" fill="none" stroke="${color}" stroke-width="5"/>`,
        surtidor: `<rect x="48" y="55" width="38" height="60" rx="3" fill="none" stroke="${color}" stroke-width="5"/><path d="M86,75 h14 q8,0 8,8 v32" fill="none" stroke="${color}" stroke-width="5"/><line x1="58" y1="70" x2="76" y2="70" stroke="${color}" stroke-width="4"/>`,
        casilla: `<path d="M40,110 L40,85 L65,70 L100,70 L120,90 L120,110 Z" fill="none" stroke="${color}" stroke-width="5" stroke-linejoin="round"/><circle cx="55" cy="112" r="7" fill="${color}"/><circle cx="105" cy="112" r="7" fill="${color}"/>`,
        sombrilla: `<path d="M40,90 Q80,45 120,90 Z" fill="${color}"/><line x1="80" y1="90" x2="80" y2="125" stroke="${color}" stroke-width="5"/>`,
        ondas: `<path d="M35,80 q12,-12 24,0 t24,0 t24,0 t24,0" fill="none" stroke="${color}" stroke-width="5"/><path d="M35,100 q12,-12 24,0 t24,0 t24,0 t24,0" fill="none" stroke="${color}" stroke-width="5"/>`,
        carpa: `<path d="M80,55 L120,115 L40,115 Z" fill="none" stroke="${color}" stroke-width="5" stroke-linejoin="round"/><line x1="80" y1="55" x2="80" y2="115" stroke="${color}" stroke-width="4"/>`,
        sanitarios: `<circle cx="65" cy="60" r="9" fill="${color}"/><line x1="65" y1="69" x2="65" y2="100" stroke="${color}" stroke-width="6" stroke-linecap="round"/><line x1="65" y1="80" x2="52" y2="92" stroke="${color}" stroke-width="5" stroke-linecap="round"/><line x1="65" y1="80" x2="78" y2="92" stroke="${color}" stroke-width="5" stroke-linecap="round"/><line x1="65" y1="100" x2="58" y2="120" stroke="${color}" stroke-width="6" stroke-linecap="round"/><line x1="65" y1="100" x2="72" y2="120" stroke="${color}" stroke-width="6" stroke-linecap="round"/><circle cx="100" cy="60" r="9" fill="${color}"/><path d="M88,100 q0,-25 12,-25 t12,25 z" fill="${color}"/>`,
        silla_ruedas: `<circle cx="92" cy="100" r="18" fill="none" stroke="${color}" stroke-width="5"/><circle cx="62" cy="65" r="8" fill="${color}"/><path d="M62,75 v20 h22 l14,22" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><line x1="62" y1="95" x2="80" y2="95" stroke="${color}" stroke-width="5"/>`,
        sobre: `<rect x="42" y="65" width="76" height="50" rx="3" fill="none" stroke="${color}" stroke-width="5"/><polyline points="42,68 80,98 118,68" fill="none" stroke="${color}" stroke-width="5" stroke-linejoin="round"/>`,
        rueda: `<circle cx="80" cy="85" r="28" fill="none" stroke="${color}" stroke-width="8"/><circle cx="80" cy="85" r="10" fill="${color}"/>`,
        taza: `<path d="M50,65 h40 v35 a20,20 0 0 1 -40,0 Z" fill="none" stroke="${color}" stroke-width="5"/><path d="M90,75 h12 a12,12 0 0 1 0,24 h-8" fill="none" stroke="${color}" stroke-width="5"/>`,
        montana: `<path d="M35,110 L65,65 L85,90 L100,70 L130,110 Z" fill="${color}"/><circle cx="105" cy="58" r="8" fill="${color}"/>`,
        telesferico: `<line x1="35" y1="55" x2="130" y2="80" stroke="${color}" stroke-width="4"/><rect x="65" y="80" width="26" height="20" rx="3" fill="none" stroke="${color}" stroke-width="5"/><line x1="73" y1="73" x2="73" y2="80" stroke="${color}" stroke-width="4"/>`,
        mesa: `<line x1="45" y1="80" x2="115" y2="80" stroke="${color}" stroke-width="6" stroke-linecap="round"/><line x1="55" y1="80" x2="55" y2="115" stroke="${color}" stroke-width="5"/><line x1="105" y1="80" x2="105" y2="115" stroke="${color}" stroke-width="5"/>`,
        tren: `<rect x="50" y="60" width="60" height="38" rx="10" fill="none" stroke="${color}" stroke-width="5"/><circle cx="62" cy="108" r="7" fill="${color}"/><circle cx="98" cy="108" r="7" fill="${color}"/><line x1="50" y1="80" x2="110" y2="80" stroke="${color}" stroke-width="4"/>`,
        tren_triangulo: `<rect x="55" y="65" width="50" height="32" rx="8" fill="none" stroke="${color}" stroke-width="5"/><circle cx="65" cy="105" r="6" fill="${color}"/><circle cx="95" cy="105" r="6" fill="${color}"/>`,
        museo: `<polygon points="80,50 125,80 35,80" fill="none" stroke="${color}" stroke-width="5"/><line x1="40" y1="80" x2="40" y2="115" stroke="${color}" stroke-width="5"/><line x1="62" y1="80" x2="62" y2="115" stroke="${color}" stroke-width="5"/><line x1="98" y1="80" x2="98" y2="115" stroke="${color}" stroke-width="5"/><line x1="120" y1="80" x2="120" y2="115" stroke="${color}" stroke-width="5"/><line x1="35" y1="115" x2="125" y2="115" stroke="${color}" stroke-width="5"/>`,
        autopista: `<line x1="50" y1="130" x2="50" y2="40" stroke="${color}" stroke-width="5"/><line x1="110" y1="130" x2="110" y2="40" stroke="${color}" stroke-width="5"/><line x1="50" y1="60" x2="65" y2="60" stroke="${color}" stroke-width="5"/><line x1="50" y1="95" x2="65" y2="95" stroke="${color}" stroke-width="5"/><line x1="95" y1="60" x2="110" y2="60" stroke="${color}" stroke-width="5"/><line x1="95" y1="95" x2="110" y2="95" stroke="${color}" stroke-width="5"/>`,
        recorrido: `<rect x="40" y="60" width="80" height="50" rx="4" fill="none" stroke="${color}" stroke-width="5"/><path d="M50,90 h25 v-15 h25 v15 h20" fill="none" stroke="${color}" stroke-width="4"/>`,
        desvio: `<path d="M45,110 L45,75 Q45,60 65,60 L105,60" fill="none" stroke="${color}" stroke-width="5"/><polyline points="92,48 105,60 92,72" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
        estrella: `<polygon points="80,45 90,72 119,72 96,90 105,118 80,101 55,118 64,90 41,72 70,72" fill="${color}"/>`,
        explosivo: `<circle cx="75" cy="95" r="22" fill="none" stroke="${color}" stroke-width="5"/><line x1="92" y1="78" x2="110" y2="55" stroke="${color}" stroke-width="5" stroke-linecap="round"/><circle cx="112" cy="50" r="5" fill="${color}"/>`,
        excavadora: `<rect x="45" y="90" width="45" height="20" rx="3" fill="none" stroke="${color}" stroke-width="5"/><circle cx="55" cy="115" r="8" fill="${color}"/><circle cx="80" cy="115" r="8" fill="${color}"/><line x1="90" y1="95" x2="120" y2="70" stroke="${color}" stroke-width="6" stroke-linecap="round"/><line x1="120" y1="70" x2="115" y2="85" stroke="${color}" stroke-width="6" stroke-linecap="round"/>`,
        valla1: `<rect x="42" y="78" width="76" height="14" rx="2" fill="${color}"/><line x1="50" y1="92" x2="50" y2="112" stroke="${color}" stroke-width="5"/><line x1="110" y1="92" x2="110" y2="112" stroke="${color}" stroke-width="5"/>`,
        valla2: `<rect x="42" y="70" width="76" height="12" rx="2" fill="${color}"/><rect x="42" y="88" width="76" height="12" rx="2" fill="${color}"/><line x1="50" y1="100" x2="50" y2="115" stroke="${color}" stroke-width="5"/><line x1="110" y1="100" x2="110" y2="115" stroke="${color}" stroke-width="5"/>`,
        valla3: `<rect x="42" y="62" width="76" height="10" rx="2" fill="${color}"/><rect x="42" y="78" width="76" height="10" rx="2" fill="${color}"/><rect x="42" y="94" width="76" height="10" rx="2" fill="${color}"/><line x1="50" y1="104" x2="50" y2="118" stroke="${color}" stroke-width="5"/><line x1="110" y1="104" x2="110" y2="118" stroke="${color}" stroke-width="5"/>`,
        delineador: `<rect x="73" y="50" width="14" height="68" rx="3" fill="none" stroke="${color}" stroke-width="5"/><line x1="73" y1="65" x2="87" y2="65" stroke="${color}" stroke-width="6"/><line x1="73" y1="85" x2="87" y2="85" stroke="${color}" stroke-width="6"/>`,
        tambor: `<path d="M55,55 h50 l-6,65 h-38 Z" fill="none" stroke="${color}" stroke-width="5" stroke-linejoin="round"/><line x1="52" y1="75" x2="108" y2="75" stroke="${color}" stroke-width="5"/><line x1="50" y1="95" x2="110" y2="95" stroke="${color}" stroke-width="5"/>`,
        cono: `<polygon points="80,48 100,118 60,118" fill="none" stroke="${color}" stroke-width="5" stroke-linejoin="round"/><line x1="64" y1="100" x2="96" y2="100" stroke="${color}" stroke-width="6"/>`,
        bocina: `<path d="M45,85 h18 l25,-20 v50 l-25,-20 h-18 Z" fill="${color}"/><path d="M95,75 q10,12 0,24" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/><path d="M105,68 q18,18 0,38" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/>`,
        carro_caballo: `<path d="M40,100 q15,-15 30,0 v15 h-30 Z" fill="none" stroke="${color}" stroke-width="5"/><circle cx="48" cy="118" r="7" fill="${color}"/><circle cx="68" cy="118" r="7" fill="${color}"/><line x1="70" y1="95" x2="110" y2="70" stroke="${color}" stroke-width="5" stroke-linecap="round"/>`,
        adelantar: `<path d="M45,115 q0,-50 35,-50" fill="none" stroke="${color}" stroke-width="5"/><polyline points="68,73 80,65 68,57" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M75,115 q0,-50 35,-50" fill="none" stroke="${color}" stroke-width="5"/>`,
        giro_u: `<path d="M55,115 v-30 a20,20 0 0 1 40,0 v30" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round"/><polyline points="85,100 95,115 105,100" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
        cadenas: `<circle cx="62" cy="75" r="10" fill="none" stroke="${color}" stroke-width="5"/><circle cx="80" cy="90" r="10" fill="none" stroke="${color}" stroke-width="5"/><circle cx="98" cy="105" r="10" fill="none" stroke="${color}" stroke-width="5"/>`,
        jinete: `<path d="M50,115 q0,-30 25,-30 t25,30" fill="none" stroke="${color}" stroke-width="5"/><circle cx="85" cy="65" r="9" fill="${color}"/><line x1="85" y1="74" x2="85" y2="95" stroke="${color}" stroke-width="6" stroke-linecap="round"/>`,
        preferencia: `<polygon points="80,50 110,80 80,110 50,80" fill="none" stroke="${color}" stroke-width="5"/><polygon points="80,65 95,80 80,95 65,80" fill="none" stroke="${color}" stroke-width="4"/>`,
        puente: `<path d="M35,100 q45,-40 90,0" fill="none" stroke="${color}" stroke-width="5"/><line x1="35" y1="100" x2="35" y2="115" stroke="${color}" stroke-width="5"/><line x1="125" y1="100" x2="125" y2="115" stroke="${color}" stroke-width="5"/><line x1="35" y1="115" x2="125" y2="115" stroke="${color}" stroke-width="5"/>`,
        viento: `<path d="M35,75 h55 a10,10 0 1 0 -8,-15" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/><path d="M35,100 h70 a10,10 0 1 1 -8,15" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/>`,
        tunel: `<path d="M40,118 v-25 a40,40 0 0 1 80,0 v25" fill="none" stroke="${color}" stroke-width="5"/><line x1="40" y1="118" x2="40" y2="125" stroke="${color}" stroke-width="5"/><line x1="120" y1="118" x2="120" y2="125" stroke="${color}" stroke-width="5"/>`,
        resbaladiza: `<path d="M40,110 q20,-25 40,0 t40,0" fill="none" stroke="${color}" stroke-width="5"/><polyline points="105,98 120,110 105,118" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
        derrumbe: `<polygon points="50,115 65,80 80,115" fill="none" stroke="${color}" stroke-width="5" stroke-linejoin="round"/><circle cx="100" cy="65" r="6" fill="${color}"/><circle cx="112" cy="85" r="5" fill="${color}"/><circle cx="95" cy="95" r="4" fill="${color}"/>`,
        obras: `<line x1="60" y1="115" x2="95" y2="80" stroke="${color}" stroke-width="6" stroke-linecap="round"/><line x1="80" y1="115" x2="105" y2="90" stroke="${color}" stroke-width="6" stroke-linecap="round"/><rect x="93" y="60" width="22" height="12" rx="2" fill="${color}" transform="rotate(45 104 66)"/>`,
        animal: `<ellipse cx="85" cy="95" rx="28" ry="16" fill="none" stroke="${color}" stroke-width="5"/><circle cx="55" cy="80" r="10" fill="none" stroke="${color}" stroke-width="5"/><line x1="65" y1="108" x2="65" y2="122" stroke="${color}" stroke-width="5"/><line x1="105" y1="108" x2="105" y2="122" stroke="${color}" stroke-width="5"/>`,
        arbol: `<circle cx="80" cy="75" r="22" fill="${color}"/><rect x="75" y="95" width="10" height="25" fill="${color}"/>`,
        prohibido_mini: `<circle cx="80" cy="85" r="22" fill="none" stroke="${color}" stroke-width="5"/><line x1="64" y1="69" x2="96" y2="101" stroke="${color}" stroke-width="5"/>`,
        pare_mini: `<polygon points="68,55 92,55 108,71 108,95 92,111 68,111 52,95 52,71" fill="none" stroke="${color}" stroke-width="5" stroke-linejoin="round"/>`,
        semaforo_mini: `<rect x="68" y="50" width="24" height="56" rx="6" fill="none" stroke="${color}" stroke-width="5"/><circle cx="80" cy="64" r="6" fill="${color}"/><circle cx="80" cy="78" r="6" fill="none" stroke="${color}" stroke-width="3"/><circle cx="80" cy="92" r="6" fill="none" stroke="${color}" stroke-width="3"/>`,
        piedras: `<circle cx="65" cy="95" r="14" fill="${color}"/><circle cx="98" cy="100" r="10" fill="${color}"/><circle cx="85" cy="75" r="8" fill="${color}"/>`,
        barrera: `<line x1="40" y1="70" x2="115" y2="95" stroke="${color}" stroke-width="6" stroke-linecap="round"/><rect x="35" y="63" width="10" height="14" fill="${color}"/>`,
        fin_prevencion: `<line x1="50" y1="115" x2="110" y2="55" stroke="${color}" stroke-width="6" stroke-linecap="round"/><circle cx="80" cy="85" r="25" fill="none" stroke="${color}" stroke-width="4"/>`,
        cambiar_carril: `<line x1="55" y1="115" x2="55" y2="55" stroke="${color}" stroke-width="4" stroke-dasharray="8 6"/><line x1="105" y1="115" x2="105" y2="55" stroke="${color}" stroke-width="4" stroke-dasharray="8 6"/><line x1="55" y1="85" x2="105" y2="65" stroke="${color}" stroke-width="5"/>`,
    };
    return lib[nombre] || `<circle cx="80" cy="85" r="6" fill="${color}"/>`;
}

function _marcaPath(color, variante) {
    switch (variante) {
        case "doble_solida":
            return `<line x1="68" y1="40" x2="68" y2="130" stroke="${color}" stroke-width="6"/><line x1="92" y1="40" x2="92" y2="130" stroke="${color}" stroke-width="6"/>`;
        case "solida_simple":
            return `<line x1="80" y1="40" x2="80" y2="130" stroke="${color}" stroke-width="6"/>`;
        case "discontinua":
            return `<line x1="80" y1="35" x2="80" y2="135" stroke="${color}" stroke-width="6" stroke-dasharray="16 12"/>`;
        case "mixta":
            return `<line x1="68" y1="40" x2="68" y2="130" stroke="${color}" stroke-width="6"/><line x1="92" y1="35" x2="92" y2="135" stroke="${color}" stroke-width="6" stroke-dasharray="16 12"/>`;
        case "cebra":
            return [0,1,2,3,4].map(i => `<rect x="${48+i*15}" y="55" width="8" height="60" fill="${color}"/>`).join("");
        case "linea_detencion":
            return `<rect x="45" y="95" width="70" height="10" fill="${color}"/>`;
        case "flecha_pavimento":
            return `<line x1="80" y1="120" x2="80" y2="55" stroke="${color}" stroke-width="7" stroke-linecap="round"/><polyline points="62,75 80,55 98,75" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
        case "curva_pavimento":
            return `<path d="M50,120 Q50,55 115,55" fill="none" stroke="${color}" stroke-width="6" stroke-dasharray="14 10"/>`;
        case "chevron_pavimento":
            return `<polyline points="55,110 80,80 105,110" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><polyline points="55,80 80,50 105,80" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
        case "bahia":
            return `<line x1="50" y1="50" x2="50" y2="130" stroke="${color}" stroke-width="5"/><line x1="80" y1="50" x2="80" y2="130" stroke="${color}" stroke-width="5"/><line x1="110" y1="50" x2="110" y2="130" stroke="${color}" stroke-width="5"/>`;
        case "obstaculo":
            return [0,1,2,3].map(i => `<line x1="${55+i*15}" y1="55" x2="${65+i*15}" y2="115" stroke="${color}" stroke-width="5"/>`).join("");
        case "proximidad":
            return `<line x1="80" y1="130" x2="80" y2="100" stroke="${color}" stroke-width="6"/><line x1="80" y1="85" x2="80" y2="65" stroke="${color}" stroke-width="6"/><line x1="80" y1="55" x2="80" y2="45" stroke="${color}" stroke-width="6"/>`;
        case "interseccion":
            return `<line x1="68" y1="40" x2="68" y2="130" stroke="${color}" stroke-width="5"/><line x1="92" y1="40" x2="92" y2="130" stroke="${color}" stroke-width="5"/><line x1="40" y1="80" x2="130" y2="80" stroke="${color}" stroke-width="5" stroke-dasharray="10 8"/>`;
        default:
            return `<line x1="80" y1="40" x2="80" y2="130" stroke="${color}" stroke-width="6"/>`;
    }
}

function _agentePath(color, pose) {
    let brazos = `<line x1="62" y1="78" x2="48" y2="88" stroke="${color}" stroke-width="6" stroke-linecap="round"/><line x1="98" y1="78" x2="112" y2="88" stroke="${color}" stroke-width="6" stroke-linecap="round"/>`;
    if (pose === "brazo_arriba" || pose === "frente_brazo_arriba") {
        brazos = `<line x1="62" y1="78" x2="48" y2="88" stroke="${color}" stroke-width="6" stroke-linecap="round"/><line x1="98" y1="78" x2="108" y2="50" stroke="${color}" stroke-width="6" stroke-linecap="round"/>`;
    }
    if (pose === "brazo_lateral") {
        brazos = `<line x1="62" y1="78" x2="30" y2="78" stroke="${color}" stroke-width="6" stroke-linecap="round"/><line x1="98" y1="78" x2="130" y2="78" stroke="${color}" stroke-width="6" stroke-linecap="round"/>`;
    }
    if (pose === "brazo_frente_palma") {
        brazos = `<line x1="62" y1="78" x2="62" y2="55" stroke="${color}" stroke-width="6" stroke-linecap="round"/><rect x="55" y="40" width="14" height="16" rx="2" fill="${color}"/><line x1="98" y1="78" x2="112" y2="88" stroke="${color}" stroke-width="6" stroke-linecap="round"/>`;
    }
    if (pose === "brazo_giratorio") {
        brazos = `<line x1="62" y1="78" x2="40" y2="60" stroke="${color}" stroke-width="6" stroke-linecap="round"/><line x1="98" y1="78" x2="112" y2="88" stroke="${color}" stroke-width="6" stroke-linecap="round"/><path d="M40,60 a18,18 0 1 1 5,12" fill="none" stroke="${color}" stroke-width="3" stroke-dasharray="3 4"/>`;
    }
    if (pose === "perfil_brazo_atras") {
        brazos = `<line x1="70" y1="78" x2="45" y2="68" stroke="${color}" stroke-width="6" stroke-linecap="round"/>`;
    }
    if (pose === "perfil_brazo_adelante") {
        brazos = `<line x1="90" y1="78" x2="115" y2="65" stroke="${color}" stroke-width="6" stroke-linecap="round"/>`;
    }
    return `
        <circle cx="80" cy="55" r="11" fill="${color}"/>
        <rect x="68" y="66" width="24" height="40" rx="6" fill="${color}"/>
        ${brazos}
        <line x1="74" y1="106" x2="68" y2="135" stroke="${color}" stroke-width="7" stroke-linecap="round"/>
        <line x1="86" y1="106" x2="92" y2="135" stroke="${color}" stroke-width="7" stroke-linecap="round"/>
    `;
}

function dibujarIcono(icono, color, colorFondo) {
    if (!icono) return "";
    switch (icono.tipo) {
        case "flecha": {
            let g = _flechaPath(80, 85, 55, 9, !!icono.curva, !!icono.espejo);
            let g2 = icono.doble ? _flechaPath(80, 85, 55, 9, !!icono.curva, !icono.espejo) : "";
            let relleno = icono.curva ? "none" : color;
            let group = `<g fill="${relleno}" stroke="${color}">${g}${g2}</g>`;
            let tach = icono.tachada ? `<line x1="46" y1="128" x2="114" y2="42" stroke="#e0453a" stroke-width="9" stroke-linecap="round"/>` : "";
            return `<g transform="rotate(${icono.rotacion||0} 80 85)">${group}</g>${tach}`;
        }
        case "persona": {
            let tach = icono.tachada ? `<line x1="45" y1="130" x2="115" y2="45" stroke="${color}" stroke-width="6" stroke-linecap="round"/>` : "";
            let mirror = icono.espejo ? `<g transform="scale(-1,1) translate(-160,0)">${_personaPath(color, icono.pose)}</g>` : _personaPath(color, icono.pose);
            return mirror + tach;
        }
        case "vehiculo": {
            let tach = icono.tachada ? `<line x1="38" y1="115" x2="120" y2="60" stroke="${color}" stroke-width="6" stroke-linecap="round"/>` : "";
            return _vehiculoPath(color, icono.variante) + tach;
        }
        case "camino":
            return `<g>${_caminoPath(color, icono.variante, icono.espejo)}</g>`;
        case "perfil":
            return _perfilPath(color, icono.variante);
        case "pictograma": {
            let tach = icono.tachada ? `<line x1="40" y1="125" x2="120" y2="45" stroke="${color}" stroke-width="6" stroke-linecap="round"/>` : "";
            return _pictogramaPath(color, icono.nombre) + tach;
        }
        case "numero": {
            let txt = `<text x="80" y="${icono.flechas ? 80 : 98}" font-family="Poppins,Arial,sans-serif" font-weight="800" font-size="${icono.valor.length>3?34:44}" fill="${color}" text-anchor="middle">${icono.valor}</text>`;
            let extra = "";
            if (icono.flechas) {
                extra = `<line x1="40" y1="115" x2="120" y2="115" stroke="${color}" stroke-width="4"/><polyline points="48,109 40,115 48,121" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><polyline points="112,109 120,115 112,121" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
            }
            if (icono.arriba) {
                extra = `<line x1="80" y1="120" x2="80" y2="55" stroke="${color}" stroke-width="4"/><polyline points="72,63 80,55 88,63" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
            }
            let tach = icono.tachada ? `<line x1="42" y1="125" x2="118" y2="48" stroke="${color}" stroke-width="6" stroke-linecap="round"/>` : "";
            return txt + extra + tach;
        }
        case "letra": {
            let tach = icono.tachada ? `<line x1="42" y1="${icono.doble?130:125}" x2="118" y2="${icono.doble?40:48}" stroke="${color}" stroke-width="6" stroke-linecap="round"/>${icono.doble?`<line x1="42" y1="40" x2="118" y2="130" stroke="${color}" stroke-width="6" stroke-linecap="round"/>`:""}` : "";
            return `<text x="80" y="100" font-family="Poppins,Arial,sans-serif" font-weight="800" font-size="54" fill="${color}" text-anchor="middle">${icono.valor}</text>${tach}`;
        }
        case "texto":
            return `<text x="80" y="92" font-family="Poppins,Arial,sans-serif" font-weight="800" font-size="${icono.valor.length>5?20:30}" fill="${color}" text-anchor="middle">${icono.valor}</text>`;
        case "barra":
            return icono.diagonal
                ? `<line x1="45" y1="120" x2="115" y2="50" stroke="${color}" stroke-width="8" stroke-linecap="round"/>`
                : `<rect x="45" y="78" width="70" height="14" rx="4" fill="${color}"/>`;
        case "marca":
            return _marcaPath(color, icono.variante);
        case "patron": // hipoacusia: tablero rojo/amarillo
            return [0,1,2,3].map(r => [0,1,2,3].map(c => `<rect x="${48+c*16}" y="${48+r*16}" width="16" height="16" fill="${(r+c)%2===0?'#ffc233':'#e0453a'}"/>`).join("")).join("");
        case "panel":
            return Array.from({length: icono.lineas}).map((_,i) =>
                `<line x1="${50}" y1="${55+i*15}" x2="${110}" y2="${55+i*15}" stroke="${color}" stroke-width="6" stroke-linecap="round"/>`
            ).join("");
        case "chevron":
            return `<polyline points="50,110 80,65 110,110" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`;
        case "cruzAndres": {
            let base = `<line x1="50" y1="50" x2="110" y2="120" stroke="${color}" stroke-width="8" stroke-linecap="round"/><line x1="110" y1="50" x2="50" y2="120" stroke="${color}" stroke-width="8" stroke-linecap="round"/>`;
            return base + `<text x="80" y="140" font-family="Inter,Arial" font-weight="700" font-size="14" fill="${color}" text-anchor="middle">FF.CC.</text>`;
        }
        case "luz": {
            const colores = { verde:"#1f9d55", amarilla:"#ffc233", roja:"#e0453a" };
            return `
                <rect x="58" y="35" width="44" height="100" rx="10" fill="#16233a"/>
                <circle cx="80" cy="55" r="13" fill="${icono.color==='roja'?colores.roja:'#2a3b58'}"/>
                <circle cx="80" cy="85" r="13" fill="${icono.color==='amarilla'?colores.amarilla:'#2a3b58'}"/>
                <circle cx="80" cy="115" r="13" fill="${icono.color==='verde'?colores.verde:'#2a3b58'}"/>
            `;
        }
        case "luz_peaton":
            return `
                <rect x="50" y="35" width="60" height="100" rx="10" fill="#16233a"/>
                <circle cx="80" cy="65" r="16" fill="#e0453a"/>
                ${_personaPath("#16233a", "")}
                <circle cx="80" cy="105" r="16" fill="#1f9d55" opacity="0.35"/>
            `;
        case "luz_flecha":
            return `
                <rect x="50" y="35" width="60" height="100" rx="10" fill="#16233a"/>
                <circle cx="80" cy="65" r="16" fill="#e0453a"/>
                <polyline points="68,65 92,65 82,55 92,65 82,75" fill="none" stroke="#16233a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="80" cy="105" r="16" fill="#1f9d55" opacity="0.35"/>
            `;
        case "agente":
            return _agentePath(color, icono.pose);
        default:
            return "";
    }
}

function crearSVGSenal(senal) {
    const icono = senal.icono || {};
    let bg, borde, colorIcono, shapeSvg;

    switch (senal.forma) {
        case "triangulo":
            bg = "#FFC233"; borde = "#16233a"; colorIcono = "#16233a";
            shapeSvg = `<polygon points="80,12 150,140 10,140" fill="${bg}" stroke="${borde}" stroke-width="8" stroke-linejoin="round"/>`;
            break;
        case "triangulo_invertido":
            bg = "#ffffff"; borde = "#e0453a"; colorIcono = "#e0453a";
            shapeSvg = `<polygon points="10,20 150,20 80,148" fill="${bg}" stroke="${borde}" stroke-width="8" stroke-linejoin="round"/>`;
            break;
        case "octogono":
            bg = "#e0453a"; borde = "#ffffff"; colorIcono = "#ffffff";
            shapeSvg = `<polygon points="55,12 105,12 148,55 148,105 105,148 55,148 12,105 12,55" fill="${bg}" stroke="${borde}" stroke-width="6" stroke-linejoin="round"/>`;
            break;
        case "circulo_prohibicion":
        case "circulo_niebla":
            bg = "#ffffff"; borde = "#e0453a"; colorIcono = "#16233a";
            shapeSvg = `<circle cx="80" cy="80" r="68" fill="${bg}" stroke="${borde}" stroke-width="10"/>`;
            break;
        case "circulo_obligacion":
            bg = "#1f5fc4"; borde = "#1f5fc4"; colorIcono = "#ffffff";
            shapeSvg = `<circle cx="80" cy="80" r="68" fill="${bg}" stroke="#16233a" stroke-width="3"/>`;
            break;
        case "rectangulo_obligacion":
            bg = "#1f5fc4"; borde = "#1f5fc4"; colorIcono = "#ffffff";
            shapeSvg = `<rect x="14" y="30" width="132" height="100" rx="8" fill="${bg}"/>`;
            break;
        case "circulo_fin":
            bg = "#e8eaee"; borde = "#6b7280"; colorIcono = "#16233a";
            shapeSvg = `<circle cx="80" cy="80" r="68" fill="${bg}" stroke="${borde}" stroke-width="6"/>`;
            break;
        case "diamante_doble":
            bg = "#ffffff"; borde = "#16233a"; colorIcono = "#16233a";
            shapeSvg = `<rect x="20" y="20" width="120" height="120" fill="${bg}" stroke="${borde}" stroke-width="6" transform="rotate(45 80 80)"/>`;
            break;
        case "rectangulo_info":
            bg = "#1f5fc4"; borde = "#ffffff"; colorIcono = "#ffffff";
            shapeSvg = `<rect x="14" y="30" width="132" height="100" rx="8" fill="${bg}" stroke="${borde}" stroke-width="4"/>`;
            break;
        case "rectangulo_verde":
            bg = "#1f9d55"; borde = "#ffffff"; colorIcono = "#ffffff";
            shapeSvg = `<rect x="14" y="30" width="132" height="100" rx="8" fill="${bg}" stroke="${borde}" stroke-width="4"/>`;
            break;
        case "rectangulo_blanco":
            bg = "#ffffff"; borde = "#16233a"; colorIcono = "#16233a";
            shapeSvg = `<rect x="14" y="40" width="132" height="80" rx="6" fill="${bg}" stroke="${borde}" stroke-width="4"/>`;
            break;
        case "rectangulo_rojo":
            bg = "#e0453a"; borde = "#ffffff"; colorIcono = "#ffffff";
            shapeSvg = `<rect x="14" y="40" width="132" height="80" rx="6" fill="${bg}" stroke="${borde}" stroke-width="4"/>`;
            break;
        case "escudo_nacional":
            bg = "#1f5fc4"; borde = "#ffffff"; colorIcono = "#ffffff";
            shapeSvg = `<path d="M80,15 L135,35 V90 Q135,130 80,150 Q25,130 25,90 V35 Z" fill="${bg}" stroke="${borde}" stroke-width="5"/>`;
            break;
        case "escudo_provincial":
            bg = "#1f9d55"; borde = "#ffffff"; colorIcono = "#ffffff";
            shapeSvg = `<path d="M80,15 L135,35 V90 Q135,130 80,150 Q25,130 25,90 V35 Z" fill="${bg}" stroke="${borde}" stroke-width="5"/>`;
            break;
        case "mojon":
            bg = "#ffffff"; borde = "#16233a"; colorIcono = "#16233a";
            shapeSvg = `<rect x="55" y="20" width="50" height="120" rx="6" fill="${bg}" stroke="${borde}" stroke-width="5"/>`;
            break;
        case "rectangulo_transitoria":
            bg = "#ff9f1c"; borde = "#16233a"; colorIcono = "#16233a";
            shapeSvg = `<rect x="14" y="40" width="132" height="80" rx="6" fill="${bg}" stroke="${borde}" stroke-width="6"/>`;
            break;
        case "rombo_transitoria":
            bg = "#ff9f1c"; borde = "#16233a"; colorIcono = "#16233a";
            shapeSvg = `<rect x="24" y="24" width="112" height="112" fill="${bg}" stroke="${borde}" stroke-width="6" transform="rotate(45 80 80)"/>`;
            break;
        case "objeto_transitoria":
            bg = "#f4f6f9"; borde = "#e2e6ed"; colorIcono = "#ff9f1c";
            shapeSvg = `<rect x="10" y="10" width="140" height="140" rx="16" fill="${bg}" stroke="${borde}" stroke-width="3"/>`;
            break;
        case "rectangulo_horizontal":
            bg = "#3a3f47"; borde = "#3a3f47"; colorIcono = "#ffd23f";
            shapeSvg = `<rect x="10" y="10" width="140" height="140" rx="10" fill="${bg}"/>`;
            break;
        case "circulo_semaforo":
            bg = "#eef1f6"; borde = "#eef1f6"; colorIcono = "#16233a";
            shapeSvg = `<rect x="10" y="10" width="140" height="140" rx="16" fill="${bg}"/>`;
            break;
        case "figura_agente":
            bg = "#eef1f6"; borde = "#eef1f6"; colorIcono = "#16233a";
            shapeSvg = `<rect x="10" y="10" width="140" height="140" rx="16" fill="${bg}"/>`;
            break;
        case "panel":
            bg = "#ffffff"; borde = "#e0453a"; colorIcono = "#e0453a";
            shapeSvg = `<rect x="14" y="30" width="132" height="100" rx="4" fill="${bg}" stroke="${borde}" stroke-width="6"/>`;
            break;
        case "chevron":
            bg = "#16233a"; borde = "#16233a"; colorIcono = "#ffc233";
            shapeSvg = `<rect x="14" y="30" width="132" height="100" rx="4" fill="${bg}"/>`;
            break;
        case "cruz_andres":
            bg = "#ffffff"; borde = "#e0453a"; colorIcono = "#e0453a";
            shapeSvg = `<rect x="10" y="10" width="140" height="140" rx="10" fill="${bg}" stroke="${borde}" stroke-width="5"/>`;
            break;
        default:
            bg = "#ffffff"; borde = "#16233a"; colorIcono = "#16233a";
            shapeSvg = `<rect x="10" y="10" width="140" height="140" rx="16" fill="${bg}" stroke="${borde}" stroke-width="4"/>`;
    }

    let contenidoIcono = dibujarIcono(icono, colorIcono, bg);

    return `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
        ${shapeSvg}
        ${contenidoIcono}
    </svg>`;
}

if (typeof module !== "undefined") { module.exports = { crearSVGSenal, dibujarIcono }; }
