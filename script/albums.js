// Datos de los álbumes de Spotify - Ejemplo con IDs de álbumes
        const spotifyAlbums = [
            {
                id: 1,
                albumId: "3wYxBH1q2Y2QBp1ac6oqcK" // Tu ejemplo
                // Ni que fueran tantos dias
            },
            {
                id: 2,
                albumId: "6gkusvvlZZgNdbu6Gh7Mft" // Otro álbum de ejemplo
                // Ciegos que no quieren ver
            },
            {
                id: 3,
                albumId: "7c0L9blKlCP24obr8DCGEI" // Otro álbum de ejemplo
                // Dejenlas bailar
            },
            {
                id: 4, 
                albumId: "63nInYKsZoOHKZTi8nmm1L" // Otro álbum de ejemplo
                // Dejate de joder
            }
        ];
        
        // Variables del carrusel
        let currentIndex = 0;
        const albumsPerView = window.innerWidth < 768 ? 1 : (window.innerWidth < 1024 ? 2 : 3);
        let autoSlideInterval;
        const autoSlideDelay = 7000; // 5 segundos para dar tiempo a cargar los embeds
        const pauseDelay = 1000; // 2 segundos para reanudar después de quitar el mouse
        let isManuallyControlled = false;
        let isTransitioning = false;
        
        // Elementos DOM
        const carousel = document.getElementById('spotifyCarousel');
        const dotsContainer = document.getElementById('navigationDots');
        const prevBtn = document.querySelector('.carousel-control.prev');
        const nextBtn = document.querySelector('.carousel-control.next');
        const carouselContainer = document.querySelector('.carousel-container');
        
        // Función para crear las tarjetas con embeds de Spotify dinámicamente
        function createSpotifyCards() {
            // Crear álbumes iniciales
            spotifyAlbums.forEach(album => {
                addSpotifyCard(album);
            });
            
            // Agregar clones para el efecto infinito
            // Clones al final (primeros álbumes)
            for (let i = 0; i < albumsPerView * 2; i++) {
                const index = i % spotifyAlbums.length;
                addSpotifyCard(spotifyAlbums[index], true);
            }
            
            // Clones al principio (últimos álbumes)
            const startingClones = [];
            for (let i = spotifyAlbums.length - 1; i >= 0 && startingClones.length < albumsPerView * 2; i--) {
                startingClones.push(spotifyAlbums[i]);
            }
            
            // Si no hay suficientes álbumes, repetir desde el final
            while (startingClones.length < albumsPerView * 2) {
                const missingCount = albumsPerView * 2 - startingClones.length;
                for (let i = spotifyAlbums.length - 1; i >= 0 && startingClones.length < albumsPerView * 2; i--) {
                    startingClones.push(spotifyAlbums[i]);
                }
            }
            
            // Agregar los clones en orden inverso
            startingClones.forEach(album => {
                addSpotifyCard(album, true, true);
            });
            
            // Actualizar la posición para mostrar los álbumes reales iniciales
            updateCarouselPosition(albumsPerView * 2, false);
            currentIndex = albumsPerView * 2;
        }
        
        // Función para agregar una tarjeta con embed de Spotify
        function addSpotifyCard(album, isClone = false, prependClone = false) {
            const card = document.createElement('div');
            card.className = 'spotify-card';
            if (isClone) card.setAttribute('data-clone', 'true');
            
            // Crear el iframe de Spotify con el ID del álbum
            card.innerHTML = `
                <iframe style="border-radius:12px;" 
                       src="https://open.spotify.com/embed/album/${album.albumId}?utm_source=generator&theme=0" 
                       width="100%" 
                       height="352"
                       frameBorder="0" 
                       allowfullscreen="" 
                       allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                       loading="lazy">
                </iframe>
            `;
            
            if (prependClone) {
                carousel.prepend(card);
            } else {
                carousel.appendChild(card);
            }
        }
        
        // Función para crear los puntos de navegación
        function createNavigationDots() {
            for (let i = 0; i < spotifyAlbums.length; i++) {
                const dot = document.createElement('div');
                dot.className = 'dot';
                if (i === 0) dot.classList.add('active');
                dot.setAttribute('data-index', i);
                dot.addEventListener('click', () => {
                    goToSlide(i);
                });
                dotsContainer.appendChild(dot);
            }
        }
        
        // Función para actualizar la posición del carrusel
        function updateCarouselPosition(index, animate = true) {
            const cardWidth = document.querySelector('.spotify-card').offsetWidth + 20; // Incluye el margen
            
            if (!animate) {
                carousel.style.transition = 'none';
            } else {
                carousel.style.transition = 'transform 0.5s ease';
                isTransitioning = true;
            }
            
            // carousel.style.transform = translateX(-${cardWidth * index}px);
            carousel.style.transform = `translateX(-${cardWidth * index}px)`;
            
            // Actualizar los dots activos
            updateActiveDot(index);
            
            // Resetear la transición
            if (!animate) {
                setTimeout(() => {
                    carousel.style.transition = 'transform 0.5s ease';
                    isTransitioning = false;
                }, 50);
            }
        }
        
        // Función para actualizar el dot activo
        function updateActiveDot(index) {
            // Normalizar el índice para los dots
            const normalizedIndex = ((index - albumsPerView * 2) % spotifyAlbums.length + spotifyAlbums.length) % spotifyAlbums.length;
            
            document.querySelectorAll('.dot').forEach(dot => {
                dot.classList.remove('active');
            });
            
            // const activeDot = document.querySelector(.dot[data-index="${normalizedIndex}"]);
            const activeDot = document.querySelector(`.dot[data-index="${normalizedIndex}"]`);
            if (activeDot) activeDot.classList.add('active');
        }
        
        // Función para verificar y ajustar la posición si es necesario (loop infinito)
        function checkInfiniteLoop() {
            // No verificar si ya está en transición
            if (isTransitioning) return;
            
            const totalRealAlbums = spotifyAlbums.length;
            const totalSlides = totalRealAlbums + albumsPerView * 4;
            
            // Si hemos llegado a los clones finales, saltar al principio real sin animación
            if (currentIndex >= totalRealAlbums + albumsPerView * 2) {
                const offset = currentIndex - (totalRealAlbums + albumsPerView * 2);
                currentIndex = albumsPerView * 2 + offset;
                updateCarouselPosition(currentIndex, false);
            }
            
            // Si hemos llegado a los clones iniciales, saltar al final real sin animación
            if (currentIndex < albumsPerView * 2) {
                const offset = albumsPerView * 2 - currentIndex;
                currentIndex = totalRealAlbums + albumsPerView * 2 - offset;
                updateCarouselPosition(currentIndex, false);
            }
        }
        
        // Función para ir al siguiente slide
        function nextSlide() {
            if (isTransitioning) return;
            
            currentIndex++;
            updateCarouselPosition(currentIndex);
        }
        
        // Función para ir al slide anterior
        function prevSlide() {
            if (isTransitioning) return;
            
            currentIndex--;
            updateCarouselPosition(currentIndex);
        }
        
        // Función para ir a un slide específico
        function goToSlide(index) {
            if (isTransitioning) return;
            
            currentIndex = index + albumsPerView * 2;
            updateCarouselPosition(currentIndex);
            
            stopAutoSlide();
            isManuallyControlled = true;
            
            setTimeout(() => {
                isManuallyControlled = false;
                startAutoSlide();
            }, pauseDelay);
        }
        
        // Función para iniciar el auto slide
        function startAutoSlide() {
            // No iniciar si ya está en control manual
            if (isManuallyControlled) return;
            
            // Limpiar cualquier intervalo existente primero
            stopAutoSlide();
            
            // Establecer nuevo intervalo
            autoSlideInterval = setInterval(nextSlide, autoSlideDelay);
        }
        
        // Función para detener el auto slide
        function stopAutoSlide() {
            clearInterval(autoSlideInterval);
        }
        
        // Eventos
        nextBtn.addEventListener('click', () => {
            if (isTransitioning) return;
            
            stopAutoSlide();
            isManuallyControlled = true;
            nextSlide();
            
            setTimeout(() => {
                isManuallyControlled = false;
                startAutoSlide();
            }, pauseDelay);
        });
        
        prevBtn.addEventListener('click', () => {
            if (isTransitioning) return;
            
            stopAutoSlide();
            isManuallyControlled = true;
            prevSlide();
            
            setTimeout(() => {
                isManuallyControlled = false;
                startAutoSlide();
            }, pauseDelay);
        });
        
        carouselContainer.addEventListener('mouseenter', () => {
            stopAutoSlide();
            isManuallyControlled = true;
        });
        
        carouselContainer.addEventListener('mouseleave', () => {
            setTimeout(() => {
                isManuallyControlled = false;
                startAutoSlide();
            }, pauseDelay);
        });
        
        // Evento para manejar transiciones
        carousel.addEventListener('transitionend', () => {
            isTransitioning = false;
            checkInfiniteLoop();
        });
        
        // Inicialización
        createSpotifyCards();
        createNavigationDots();
        startAutoSlide();
        
        // Responsive
        window.addEventListener('resize', () => {
            const newAlbumsPerView = window.innerWidth < 768 ? 1 : (window.innerWidth < 1024 ? 2 : 3);
            if (newAlbumsPerView !== albumsPerView) {
                location.reload(); // Recargar para ajustar la vista
            }
        });