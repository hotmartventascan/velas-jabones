/**
 * Manitas Creativas - Main JavaScript
 * Funciones principales para carruseles, countdown y smooth scroll
 */

/**
 * Función para navegar por los carruseles
 * @param {string} id - ID del elemento carrusel
 * @param {number} direction - Dirección del scroll (1 = adelante, -1 = atrás)
 */
function scrollCarousel(id, direction) {
    const carousel = document.getElementById(id);
    if (!carousel) return;
    
    const scrollAmount = carousel.offsetWidth;
    const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
    const tolerance = 5; // Tolerancia para cálculos de punto flotante

    if (direction === 1) { // Adelante
        if (carousel.scrollLeft >= maxScrollLeft - tolerance) {
            // Volver al inicio
            carousel.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    } else { // Atrás
        if (carousel.scrollLeft <= tolerance) {
            // Ir al final
            carousel.scrollTo({ left: maxScrollLeft, behavior: 'smooth' });
        } else {
            carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
    }
}

/**
 * Inicia el countdown de 10 minutos
 */
function startCountdown() {
    let duration = 10 * 60; // 10 minutos en segundos
    const displayMins = document.getElementById('timer-mins');
    const displaySecs = document.getElementById('timer-secs');

    if (!displayMins || !displaySecs) return;

    const timer = setInterval(() => {
        let minutes = Math.floor(duration / 60);
        let seconds = duration % 60;

        displayMins.textContent = minutes < 10 ? '0' + minutes : minutes;
        displaySecs.textContent = seconds < 10 ? '0' + seconds : seconds;

        if (--duration < 0) {
            duration = 10 * 60; // Reset a 10 minutos
        }
    }, 1000);
}

/**
 * Configura smooth scroll para enlaces internos
 */
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Si es el botón de reproducir video, reproducir automáticamente
                if (this.id === 'play-video-btn') {
                    setTimeout(() => {
                        const video = document.getElementById('main-video');
                        if (video) {
                            video.play();
                        }
                    }, 800); // Espera a que termine el scroll
                }
            }
        });
    });
}

/**
 * Abre el lightbox con la imagen seleccionada
 * @param {string} imageSrc - URL de la imagen a mostrar
 */
function openLightbox(imageSrc) {
    const lightbox = document.getElementById('image-lightbox');
    const lightboxImg = document.getElementById('lightbox-image');
    
    if (lightbox && lightboxImg) {
        // Asegurarse de que el lightbox esté visible
        lightbox.style.display = 'flex';
        lightboxImg.src = imageSrc;
        
        // Pequeño delay para que la animación funcione correctamente
        setTimeout(() => {
            lightbox.classList.add('active');
        }, 10);
        
        // Prevenir scroll del body cuando el lightbox está abierto
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Cierra el lightbox
 */
function closeLightbox() {
    const lightbox = document.getElementById('image-lightbox');
    
    if (lightbox) {
        // Agregar clase de cierre para animación
        lightbox.classList.add('closing');
        lightbox.classList.remove('active');
        
        // Restaurar scroll del body
        document.body.style.overflow = '';
        
        // Ocultar después de la animación
        setTimeout(() => {
            lightbox.classList.remove('closing');
            lightbox.style.display = 'none';
        }, 300);
    }
}

/**
 * Configura los event listeners para las imágenes de testimonios
 */
function setupTestimonialImages() {
    // Seleccionar todas las imágenes de testimonios
    const testimonialImages = document.querySelectorAll('.testimonial-image');
    
    testimonialImages.forEach(img => {
        img.addEventListener('click', function() {
            openLightbox(this.src);
        });
    });
}

/**
 * Configura el observer para pausar el video cuando no esté visible
 */
function setupVideoObserver() {
    const video = document.getElementById('main-video');
    const videoContainer = video?.closest('.aspect-video');
    
    if (!video || !videoContainer) return;
    
    // Crear elemento para la segunda barra del icono de pausa
    const pauseBar = document.createElement('div');
    pauseBar.className = 'pause-bar-right';
    videoContainer.appendChild(pauseBar);
    
    // Función para actualizar la visibilidad del icono de play/pause
    function updatePlayIcon() {
        if (!videoContainer) return;
        
        if (video.paused) {
            videoContainer.classList.add('video-paused');
            videoContainer.classList.remove('video-playing');
        } else {
            videoContainer.classList.add('video-playing');
            videoContainer.classList.remove('video-paused');
        }
    }
    
    // Agregar funcionalidad de click para play/pause directamente en el video
    video.addEventListener('click', function(e) {
        // Prevenir el comportamiento por defecto solo si no es en los controles
        const rect = this.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const videoHeight = rect.height;
        
        // Si el clic NO fue en la barra de controles (últimos 60px)
        if (clickY < videoHeight - 60) {
            e.preventDefault();
            e.stopPropagation();
            
            if (this.paused) {
                this.play();
            } else {
                this.pause();
            }
        }
    });
    
    // Actualizar icono cuando cambie el estado del video
    video.addEventListener('play', updatePlayIcon);
    video.addEventListener('pause', updatePlayIcon);
    video.addEventListener('ended', updatePlayIcon);
    
    // Inicializar estado
    updatePlayIcon();
    
    // Crear un Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Si el video no está visible (menos del 50%)
            if (entry.intersectionRatio < 0.5) {
                // Pausar el video si está reproduciéndose
                if (!video.paused) {
                    video.pause();
                }
            }
        });
    }, {
        threshold: 0.5 // Se activa cuando el 50% del video sale/entra del viewport
    });
    
    // Observar el video
    observer.observe(video);
}

/**
 * Inicialización cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', function() {
    startCountdown();
    setupSmoothScroll();
    setupTestimonialImages();
    setupVideoObserver(); // Agregar observer para pausar video
    
    // Cerrar lightbox al hacer clic fuera de la imagen o en el botón cerrar
    const lightbox = document.getElementById('image-lightbox');
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === this || e.target.id === 'lightbox-image') {
                closeLightbox();
            }
        });
    }
    
    // Cerrar lightbox con la tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeLightbox();
        }
    });
});
