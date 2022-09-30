let data = {
    // все значения в км
    Sun: {
        name: "Солнце",
        parent: "Sun",
        mu: 132712440018,
        radius: 695510,
        color: "yellow"
    },
    Mercury: {
        name: "Меркурий",
        parent: "Sun",
        alt: 57909227,
        mu: 22032,
        radius: 2439.7,
        inclination: 7,
        soi: 112000,
        color: "grey"
    },
    Venus: {
        name: "Венера",
        parent: "Sun",
        alt: 108208930,
        mu: 324859,
        radius: 6051.8,
        inclination: 3.39,
        soi: 616000,
        color: "Moccasin"
    },
    Earth: {
        name: "Земля",
        parent: "Sun",
        alt: 149598261, // Высота от Солнца
        mu: 398600.4415, // Гравитационный параметр (км^3/с^2)
        radius: 6371, // Радиус
        inclination: 0, // Наклон орбиты относительно Солнца
        soi: 929000, // Радиус действия гравитации
        color: "skyblue"
    },
    // Moon: {
    //     name: "Луна",
    //     parent: "Earth",
    //     alt: 384399,
    //     mu: 4902.8000,
    //     radius: 1737.1,
    //     inclination: 0,
    //     soi: 66000,
    //     color: "gray"
    // },
    Mars: {
        name: "Марс",
        parent: "Sun",
        alt: 227943820,
        mu: 42828,
        radius: 3389.5,
        inclination: 1.85,
        soi: 578000,
        color: "orange"
    },
    Jupiter: {
        name: "Юпитер",
        parent: "Sun",
        alt: 778547200,
        mu: 126686534,
        radius: 69911,
        inclination: 1.31,
        soi: 48200000,
        color: "Coral"
    },
    Saturn: {
        name: "Сатурн",
        parent: "Sun",
        alt: 1429394069,
        mu: 37931187,
        radius: 58232,
        inclination: 2.49,
        soi: 54500000,
        color: "Tan"
    },
    Uran: {
        name: "Уран",
        parent: "Sun",
        alt: 2876679082,
        mu: 5793939,
        radius: 25362,
        inclination: 0.77,
        soi: 51900000,
        color: "SkyBlue"
    },
    Neptune: {
        name: "Нептун",
        parent: "Sun",
        alt: 4503443661,
        mu: 6836529,
        radius: 24622,
        inclination: 1.77,
        soi: 86800000,
        color: "RoyalBlue"
    }
};
let canvas_eject;
let ctx_eject;
let canvas_phase;
let ctx_phase;
let size;

function init() {
    canvas_eject = document.getElementById('canvas-eject');
    ctx_eject = canvas_eject.getContext('2d');
    canvas_phase = document.getElementById('canvas-phase');
    ctx_phase = canvas_phase.getContext('2d');
    let origins = document.getElementById('origin');
    let destinations = document.getElementById('destination');
    for (let p in data) {
        if (p === "Sun") continue;
        let o = document.createElement('option');
        let d = document.createElement('option');
        if (data[p].parent !== "Sun") {
            let g1 = document.createElement('optgroup');
            g1.label = "Спутники планеты " + data[data[p].parent].name;
            let g2 = document.createElement('optgroup');
            g2.label = "Спутники планеты " + data[data[p].parent].name;
            g1.appendChild(o);
            g2.appendChild(d);
            origins.appendChild(g1);
            destinations.appendChild(g2);
        } else {
            origins.appendChild(o);
            destinations.appendChild(d);
        }
        if (p === "Earth")
            o.selected = "selected";
        else if (p === "Mars")
            d.selected = "selected";
        o.value = p;
        o.innerHTML = data[p].name;
        d.value = p;
        d.innerHTML = data[p].name;
    }
    resize();
}

function resize() {
    canvas_phase.width = canvas_phase.getBoundingClientRect().width * window.devicePixelRatio;
    canvas_phase.height = canvas_phase.width * 1;
    canvas_eject.width = canvas_eject.getBoundingClientRect().width * window.devicePixelRatio;
    canvas_eject.height = canvas_eject.width * 1;
    size = canvas_eject.width / 360;
    doTheMaths();
}

function validateInputs() {
    document.getElementById('same-warning').style = "display: none";
    document.getElementById('parent-warning').style = "display: none";
    document.getElementById('phase').value = "";
    document.getElementById('ejection').value = "";
    document.getElementById('velocity').value = "";
    document.getElementById('deltav').value = "";
    const o = document.getElementById('origin').value;
    const d = document.getElementById('destination').value;
    let errorFree = true;
    if (o === d) {
        errorFree = false;
        document.getElementById('same-warning').style = "";
    }
    if (data[o].parent !== data[d].parent) {
        errorFree = false;
        document.getElementById('parent-warning').style = "";
    }

    return errorFree;
}

function doTheMaths() {
    const o = data[document.getElementById('origin').value];
    const d = data[document.getElementById('destination').value];
    const p = data[o.parent];

    // phase angle:
    const t_h = Math.PI * Math.sqrt(Math.pow(o.alt + d.alt, 3) / (8 * p.mu));
    document.getElementById('time').value = Math.round(t_h / 31536) / 1000 + " лет";

    const phase = (180 - Math.sqrt(p.mu / d.alt) * (t_h / d.alt) * (180 / Math.PI)) % 360;
    document.getElementById('phase').value = Math.round(phase * 100) / 100 + "°";

    // velocity:
    const exitAlt = o.alt + o.soi; // approximation for exiting on the "outside"
    const v2 = Math.sqrt(p.mu / exitAlt) * (Math.sqrt((2 * d.alt) / (exitAlt + d.alt)) - 1);
    const r = o.radius + parseInt(document.getElementById('orbit').value);
    const v = Math.sqrt((r * (o.soi * v2 * v2 - 2 * o.mu) + 2 * o.soi * o.mu) / (r * o.soi));
    document.getElementById('velocity').value = Math.round(v * 100000) / 100 + " м/с";

    // delta-v:
    const v_o = Math.sqrt(o.mu / r);
    const delta_v = v - v_o;
    document.getElementById('deltav').value = Math.round(delta_v * 100000) / 100 + " м/c";

    // ejection angle:
    const eta = v * v / 2 - o.mu / r;
    const h = r * v;
    const e = Math.sqrt(1 + ((2 * eta * h * h) / (o.mu * o.mu)));
    let eject = (180 - (Math.acos(1 / e) * (180 / Math.PI))) % 360;

    if (e < 1) {
        // maltesh's solution for elliptical transfers
        const a = -o.mu / (2 * eta);
        const l = a * (1 - e * e);
        const nu = Math.acos((l - o.soi) / (e * o.soi));
        const phi = Math.atan2((e * Math.sin(nu)), (1 + e * Math.cos(nu)));
        //eject = (270 - (phi*180/Math.PI)) % 360;

        // Kosmo-nots fix to maltesh's solution
        eject = (90 - (phi * 180 / Math.PI) + (nu * 180 / Math.PI)) % 360;
    }

    document.getElementById('ejection').value = "" + Math.round(eject * 100) / 100 + "°";

    draw(o, d, p, Math.round(phase * 100) / 100, Math.round(eject * 100) / 100);
}

function draw(o, d, p, phase, eject) {
    // clear canvases
    ctx_phase.clearRect(0, 0, canvas_phase.width, canvas_phase.height);
    ctx_phase.resetTransform();
    ctx_phase.scale(size, size);
    ctx_eject.clearRect(0, 0, canvas_eject.width, canvas_eject.height);
    ctx_eject.resetTransform();
    ctx_eject.scale(size, size);

    ctx_phase.textAlign = "center";
    ctx_phase.textBaseline = 'middle';
    ctx_eject.textAlign = "center";
    ctx_eject.textBaseline = 'middle';

    /*
     * Planetary phase angle drawing
     */
    const high = o.alt > d.alt ? o : d;
    const low = o.alt < d.alt ? o : d;

    // higher orbit
    ctx_phase.beginPath();
    ctx_phase.strokeStyle = "#aaa";
    ctx_phase.arc(180, 180, 160, 0, Math.PI * 2);
    ctx_phase.stroke();

    // lower orbit
    let lowerOrbit = Math.round(160 * low.alt / high.alt);
    if (lowerOrbit < 30)
        lowerOrbit = 30;

    ctx_phase.beginPath();
    ctx_phase.arc(180, 180, lowerOrbit, 0, Math.PI * 2);
    ctx_phase.stroke();

    // origin body at 90° and its angle line
    let orbit_o = o === low ? lowerOrbit : 160;
    // destination body at 90° + phase angle and its line
    let orbit_d = d === low ? lowerOrbit : 160;

    ctx_phase.beginPath();
    ctx_phase.strokeStyle = "#f22";
    ctx_phase.moveTo(180, 180);
    ctx_phase.lineTo(360, 180);
    ctx_phase.stroke();

    ctx_phase.beginPath();
    ctx_phase.fillStyle = o.color;
    ctx_phase.arc(180 + orbit_o, 180, 5, 0, Math.PI * 2);
    ctx_phase.fill();

    ctx_phase.fillStyle = "#333";
    ctx_phase.font = "9pt Consolas, Courier New, monospace";
    ctx_phase.fillText(o.name, 180 + orbit_o, 192);

    let rad = (-phase) * Math.PI / 180; // phase > 0 = ccw, in radians
    const x = Math.round(180 + orbit_d * Math.cos(rad));
    const y = Math.round(180 + orbit_d * Math.sin(rad));
    let xl = Math.round(180 + 180 * Math.cos(rad));
    let yl = Math.round(180 + 180 * Math.sin(rad));

    ctx_phase.beginPath();
    ctx_phase.strokeStyle = "#f22";
    ctx_phase.moveTo(180, 180);
    ctx_phase.lineTo(xl, yl);
    ctx_phase.stroke();

    ctx_phase.beginPath();
    ctx_phase.fillStyle = d.color;
    ctx_phase.arc(x, y, 5, 0, Math.PI * 2);
    ctx_phase.fill();

    ctx_phase.fillStyle = "#333";
    ctx_phase.font = "9pt Consolas, Courier New, monospace";
    ctx_phase.fillText(d.name, x, y + 12);

    ctx_phase.beginPath();
    ctx_phase.strokeStyle = "#231";
    ctx_phase.setLineDash([5, 5]);
    let r_x = (orbit_o + orbit_d) / 2
    ctx_phase.ellipse(o === low ? r_x + 20 : 340 - r_x, 180, r_x,
        Math.sqrt(Math.pow(r_x, 2) - Math.pow(160 - r_x, 2)), 0, 0, Math.PI * 2);
    ctx_phase.stroke();
    ctx_phase.setLineDash([]);

    // phase angle arc
    let arcRadius = (lowerOrbit <= 60) ? Math.round((160 + lowerOrbit) / 2) : Math.round(lowerOrbit / 2);
    let arcStart = phase > 0 ? -phase : 0;
    let arcEnd = phase < 0 ? -phase : 0;

    ctx_phase.beginPath();
    ctx_phase.strokeStyle = "#f22";
    ctx_phase.arc(180, 180, arcRadius, arcStart / 180 * Math.PI, arcEnd / 180 * Math.PI);
    ctx_phase.stroke();

    let textX = Math.round(180 + (arcRadius + 25) * Math.cos(rad / 2));
    let textY = Math.round(180 + (arcRadius + 25) * Math.sin(rad / 2));

    ctx_phase.fillStyle = "#333";
    ctx_phase.font = "9pt Consolas, Courier New, monospace";
    ctx_phase.fillText(phase + "°", textX, textY);

    // parent
    ctx_phase.beginPath();
    ctx_phase.fillStyle = p.color;
    ctx_phase.arc(180, 180, 10, 0, Math.PI * 2);
    ctx_phase.fill();

    ctx_phase.fillStyle = "#333";
    ctx_phase.font = "9pt Consolas, Courier New, monospace";
    ctx_phase.fillText(p.name, 180, 197);

    /*
     * Ejection angle drawing
     */

    // parking orbit
    ctx_eject.beginPath();
    ctx_eject.strokeStyle = "#aaa";
    ctx_eject.arc(180, 180, 60, 0, Math.PI * 2);
    ctx_eject.stroke();

    // origin body's trajectory w/ prograde marker
    ctx_eject.beginPath();
    ctx_eject.strokeStyle = o.color;
    ctx_eject.arc(-1820, 180, 2000, 0, Math.PI * 2);
    ctx_eject.stroke();

    // spacecraft direction arrow
    const shipAngle = ((d.alt > o.alt) ? eject : eject - 180) % 360;

    ctx_eject.beginPath();
    ctx_eject.strokeStyle = "#aaa";
    ctx_eject.arc(180, 180, 80, (shipAngle - 105) * Math.PI / 180, (shipAngle - 75) * Math.PI / 180);
    ctx_eject.stroke();

    const arrowAngle = shipAngle - 15;
    const arrowRad = ((-90 + arrowAngle) % 360) * Math.PI / 180;
    const arrowX = 180 + 80 * Math.cos(arrowRad);
    const arrowY = 180 + 80 * Math.sin(arrowRad);

    ctx_eject.beginPath();
    ctx_eject.fillStyle = "#aaa";
    ctx_eject.moveTo(arrowX + 6 * Math.cos(arrowRad - Math.PI / 2), arrowY + 6 * Math.sin(arrowRad - Math.PI / 2));
    for (let i = 1; i <= 3; i += 1) {
        ctx_eject.lineTo(6 * Math.cos(i * 2 * Math.PI / 3 + arrowRad - Math.PI / 2) + arrowX,
            6 * Math.sin(i * 2 * Math.PI / 3 + arrowRad - Math.PI / 2) + arrowY);
    }
    ctx_eject.fill();

    // pro/retrograde angle line and text
    ctx_eject.beginPath();
    ctx_eject.strokeStyle = "#f22";
    ctx_eject.moveTo(180, 180);
    ctx_eject.lineTo(180, (d.alt > o.alt) ? 0 : 360);
    ctx_eject.stroke();

    ctx_eject.textAlign = "left";
    ctx_eject.fillStyle = "#333";
    ctx_eject.font = "9pt Consolas, Courier New, monospace";
    ctx_eject.fillText("Движение " + o.name, 185, (d.alt > o.alt) ? 10 : 338);
    ctx_eject.fillText(d.alt > o.alt ? "по часовой стрелке" : "против часовой стрелки",
        185, (d.alt > o.alt) ? 22 : 350);
    ctx_eject.textAlign = "center";

    // spacecraft and its angle line
    rad = (d.alt > o.alt) ?
        (-90 + eject % 360) * Math.PI / 180 : // ccw from prograde
        ((90 + eject) % 360) * Math.PI / 180; // cw from retrograde
    const x_s = Math.round(180 + 60 * Math.cos(rad));
    const y_s = Math.round(180 + 60 * Math.sin(rad));
    xl = Math.round(180 + 180 * Math.cos(rad));
    yl = Math.round(180 + 180 * Math.sin(rad));

    ctx_eject.beginPath();
    ctx_eject.moveTo(180, 180);
    ctx_eject.lineTo(xl, yl);
    ctx_eject.stroke();

    ctx_eject.beginPath();
    ctx_eject.fillStyle = "#888";
    ctx_eject.moveTo(x_s, y_s - 8);
    for (let i = 1; i <= 3; i += 1) {
        ctx_eject.lineTo(8 * Math.cos(i * 2 * Math.PI / 3 - Math.PI / 2) + x_s,
            8 * Math.sin(i * 2 * Math.PI / 3 - Math.PI / 2) + y_s);
    }
    ctx_eject.fill();

    ctx_eject.fillStyle = "#333";
    ctx_eject.font = "9pt Consolas, Courier New, monospace";
    ctx_eject.fillText("Ракета", x_s, y_s + 12);

    // ejection angle arc and text
    arcRadius = 120;
    arcStart = (d.alt > o.alt) ?
        -90 :// prograde: 0
        90; // retrograde: ship at 180 - eject
    arcEnd = (d.alt > o.alt) ? eject - 90 : eject - 270;

    ctx_eject.beginPath();
    ctx_eject.arc(180, 180, arcRadius, arcStart * Math.PI / 180, arcEnd * Math.PI / 180);
    ctx_eject.stroke();

    const textRad = ((((arcStart % 360) + (arcEnd % 360)) / 2)) * Math.PI / 180; // magic.
    textX = Math.round(180 + 145 * Math.cos(textRad) * ((d.alt > o.alt) ? 1 : -1));
    textY = Math.round(180 + 145 * Math.sin(textRad) * ((d.alt > o.alt) ? 1 : -1));

    ctx_eject.fillStyle = "#333";
    ctx_eject.font = "9pt Consolas, Courier New, monospace";
    ctx_eject.fillText(eject + "°", textX, textY);

    // origin body
    ctx_eject.beginPath();
    ctx_eject.fillStyle = o.color;
    ctx_eject.arc(180, 180, 40, 0, Math.PI * 2);
    ctx_eject.fill();

    ctx_eject.fillStyle = "#fff";
    ctx_eject.font = "9pt Consolas, Courier New, monospace";
    ctx_eject.fillText(o.name, 180, 180);
}

function calc() {
    if (validateInputs()) {
        doTheMaths();
    }
}