
if ('serviceWorker' in navigator) {
    if (location.protocol === 'https:') {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('service-worker.js')
                .then(function (reg) {
                    console.log('[SW] Registrado con éxito:', reg.scope);
                })
                .catch(function (err) {
                    console.warn('[SW] Error al registrar:', err);
                });
        });
    } else {
        navigator.serviceWorker.getRegistrations().then(function (regs) {
            regs.forEach(function (r) { r.unregister(); });
            console.log('[SW] Modo local: service worker desactivado y caché limpia.');
        });
        if (window.caches) {
            caches.keys().then(function (keys) {
                keys.forEach(function (k) { caches.delete(k); });
            });
        }
    }
}






const sobre = document.querySelector(".intro__sobre");
const musica = document.getElementById("musica");
const intro = document.querySelector(".intro");

/* ===== Service Worker (caché offline, versiones en cache.js) ===== */
if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("./cache.js")
        .then(() => console.log("Service Worker registrado exitosamente"))
        .catch((err) => console.log("Error al registrar el Service Worker:", err));
}

sobre.addEventListener("click", () => {
    musica.play();
    intro.classList.add("intro--oculta");
    document.body.classList.add("entrado");
    iniciarAnimaciones();
});

/* ===== Dividir texto en letras ===== */
document.querySelectorAll("[data-letras]").forEach((el) => {
    const ls = getComputedStyle(el).letterSpacing;
    const palabras = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    let n = 0;
    palabras.forEach((palabra, wi) => {
        if (wi > 0) el.appendChild(document.createTextNode(" "));
        const w = document.createElement("span");
        w.className = "palabra";
        [...palabra].forEach((c) => {
            const span = document.createElement("span");
            span.className = "letra";
            span.textContent = c;
            span.style.setProperty("--d", `${n * 0.08}s`);
            span.style.setProperty("letter-spacing", ls);
            n++;
            w.appendChild(span);
        });
        el.appendChild(w);
    });
});

/* ===== Observar elementos al hacer scroll ===== */
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.2 }
);

function iniciarAnimaciones() {
    document.querySelectorAll("[data-anim]").forEach((el) => observer.observe(el));
}

/* La intro se anima desde el inicio; el resto al entrar */
document.querySelectorAll(".intro [data-anim]").forEach((el) => observer.observe(el));

if (getComputedStyle(intro).display === "none") {
    document.body.classList.add("entrado");
    iniciarAnimaciones();
}

/* ===== Reproductor de música ===== */
const btnPlay = document.querySelector(".musica__play");
const btnPrev = document.querySelector(".musica__prev");
const btnNext = document.querySelector(".musica__next");
const barra = document.querySelector(".musica__barra");
const progreso = document.querySelector(".musica__progreso");

btnPlay.addEventListener("click", () => {
    if (musica.paused) {
        musica.play();
    } else {
        musica.pause();
    }
});

musica.addEventListener("play", () => btnPlay.classList.add("sonando"));
musica.addEventListener("pause", () => btnPlay.classList.remove("sonando"));

musica.addEventListener("timeupdate", () => {
    if (musica.duration) {
        progreso.style.width = `${(musica.currentTime / musica.duration) * 100}%`;
    }
});

barra.addEventListener("click", (e) => {
    const r = barra.getBoundingClientRect();
    if (musica.duration) {
        musica.currentTime = ((e.clientX - r.left) / r.width) * musica.duration;
    }
});

/* Con una sola pista, anterior / siguiente reinician la canción */
btnPrev.addEventListener("click", () => {
    musica.currentTime = 0;
    musica.play();
});

btnNext.addEventListener("click", () => {
    musica.currentTime = 0;
    musica.play();
});

/* ===== Mensaje especial por WhatsApp ===== */
const MENSAJE_AGUS = "543813151407";
const MENSAJE_SIL = "543816027310";
const mensajeForm = document.querySelector(".mensaje__form");

function validarMensaje() {
    const nombre = mensajeForm.nombre.value.trim();
    const deseo = mensajeForm.deseo.value.trim();
    const errorNombre = document.querySelector(".mensaje__error-nombre");
    const errorDeseo = document.querySelector(".mensaje__error-deseo");
    let valido = true;
    if (!nombre) {
        errorNombre.textContent = "Falta escribir tu nombre.";
        valido = false;
    } else {
        errorNombre.textContent = "";
    }
    if (!deseo) {
        errorDeseo.textContent = "Falta escribir tu deseo.";
        valido = false;
    } else {
        errorDeseo.textContent = "";
    }
    if (!valido) return null;
    return { nombre, deseo };
}

function limpiarMensaje() {
    mensajeForm.reset();
}

function enviarMensaje(numero, nombre, deseo) {
    const texto = `Hola mi nombre es, _*${nombre}*_ y te mando este mensaje:\n_*${deseo}*_`;
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`, "_blank");
    limpiarMensaje();
}

document.querySelector(".boton__mensaje-agus").addEventListener("click", () => {
    const datos = validarMensaje();
    if (!datos) return;
    enviarMensaje(MENSAJE_AGUS, datos.nombre, datos.deseo);
});

document.querySelector(".boton__mensaje-sil").addEventListener("click", () => {
    const datos = validarMensaje();
    if (!datos) return;
    enviarMensaje(MENSAJE_SIL, datos.nombre, datos.deseo);
});

/* ===== Confirmación de asistencia por WhatsApp ===== */
const CONFIRMACION_AGUS = "543813151407";
const CONFIRMACION_SIL = "543815738322";
let asistencia = "";

document.querySelectorAll(".confirmacion__opcion").forEach((btn) => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".confirmacion__opcion").forEach((b) => b.classList.remove("seleccionada"));
        btn.classList.add("seleccionada");
        asistencia = btn.dataset.valor;
    });
});

function validarConfirmacion() {
    const nombre = document.querySelector(".confirmacion__nombre").value.trim();
    const errorOpcion = document.querySelector(".confirmacion__error-opcion");
    const errorNombre = document.querySelector(".confirmacion__error-nombre");
    let valido = true;
    if (!asistencia) {
        errorOpcion.textContent = "Falta elegir si asistes o no.";
        valido = false;
    } else {
        errorOpcion.textContent = "";
    }
    if (!nombre) {
        errorNombre.textContent = "Falta escribir tu nombre.";
        valido = false;
    } else {
        errorNombre.textContent = "";
    }
    return valido ? nombre : null;
}

function limpiarConfirmacion() {
    document.querySelector(".confirmacion__nombre").value = "";
    document.querySelectorAll(".confirmacion__opcion").forEach((b) => b.classList.remove("seleccionada"));
    asistencia = "";
}

function enviarConfirmacion(numero, nombre) {
    const texto = `Hola, _*soy ${nombre}*_ . y quiero confirmar que _*${asistencia}.*_`;
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`, "_blank");
    limpiarConfirmacion();
}

document.querySelector(".boton__confirmar-agus").addEventListener("click", () => {
    const nombre = validarConfirmacion();
    if (!nombre) return;
    enviarConfirmacion(CONFIRMACION_AGUS, nombre);
});

document.querySelector(".boton__confirmar-sil").addEventListener("click", () => {
    const nombre = validarConfirmacion();
    if (!nombre) return;
    enviarConfirmacion(CONFIRMACION_SIL, nombre);
});

/* ===== Temporizador cuenta regresiva ===== */
const targetDate = new Date("December 5, 2026 22:00:00").getTime(); // de la noche

const elDias = document.getElementById("temp-dias");
const elHoras = document.getElementById("temp-horas");
const elMinutos = document.getElementById("temp-minutos");
const elSegundos = document.getElementById("temp-segundos");

function actualizarTemporizador() {
    if (!elDias || !elHoras || !elMinutos || !elSegundos) return;
    const ahora = Date.now();
    let diff = targetDate - ahora;
    if (diff < 0) diff = 0;
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diff % (1000 * 60)) / 1000);
    elDias.textContent = String(dias);
    elHoras.textContent = String(horas).padStart(2, "0");
    elMinutos.textContent = String(minutos).padStart(2, "0");
    elSegundos.textContent = String(segundos).padStart(2, "0");
}

actualizarTemporizador();
setInterval(actualizarTemporizador, 1000);

/* ===== Copiar alias ===== */
const ALIAS = "johanaymartin";
const btnAlias = document.querySelector(".boton__alias");

btnAlias.addEventListener("click", async () => {
    try {
        await navigator.clipboard.writeText(ALIAS);
    } catch (e) {
        const temp = document.createElement("textarea");
        temp.value = ALIAS;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        temp.remove();
    }
    btnAlias.textContent = "Alias copiado!";
    setTimeout(() => {
        btnAlias.textContent = "⧉ Copiar alias";
    }, 2000);
});



// ------------------- fotos ----------------------

var swiper = new Swiper(".mySwiper", {
    effect: "coverflow",
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: "auto",
    coverflowEffect: {
        rotate: 0,
        stretch: 4,
        depth: 3,
        modifier: 50,
        slideShadows: true,
    },
    pagination: {
        el: ".swiper-pagination",
    },
    autoplay: {
        delay: 2000, // Time between slides in milliseconds (e.g., 3 seconds)
        disableOnInteraction: false, // Set to true to stop autoplay on user interaction (e.g., dragging)
    },
    loop: true, // Enable infinite loop
});
