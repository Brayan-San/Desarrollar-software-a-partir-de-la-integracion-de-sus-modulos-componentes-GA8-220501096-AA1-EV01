// Mejorar la funcionalidad de búsqueda
document.addEventListener('DOMContentLoaded', function() {
    const searchWrapper = document.querySelector('.search-wrapper');
    const search = document.querySelector('.search');
    const searchInput = document.getElementById('searchInput');
    let searchResults = null;
    
    // Crear el contenedor de resultados de búsqueda
    function createSearchResultsContainer() {
        if (!searchResults) {
            searchResults = document.createElement('div');
            searchResults.className = 'search-results';
            searchResults.style.display = 'none';
            
            // Posicionar correctamente debajo de la barra de búsqueda
            const searchRect = search.getBoundingClientRect();
            const navbarRect = document.querySelector('.navbar').getBoundingClientRect();
            
            // Calcular posición centrada
            const centerPos = navbarRect.left + (navbarRect.width / 2);
            searchResults.style.left = centerPos + 'px';
            searchResults.style.transform = 'translateX(-50%)';
            searchResults.style.top = (searchRect.bottom + window.scrollY + 5) + 'px';
            
            document.body.appendChild(searchResults);
        }
    }
    
    // Función para buscar productos
    async function searchProducts(term) {
        try {
            // Aquí deberías hacer una petición a tu API para buscar productos
            // Por ahora, simularemos una respuesta
            const response = await fetch('/api/products/search?term=' + encodeURIComponent(term));
            
            if (!response.ok) {
                throw new Error('Error en la búsqueda');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error al buscar productos:', error);
            // Simulación de resultados para demostración
            return simulateSearchResults(term);
        }
    }
    
    // Función para simular resultados (eliminar en producción)
    function simulateSearchResults(term) {
        // Actualizar rutas de imágenes para que sean correctas
        const demoProducts = [
            { id: '6759c99da1c68ec321893bf9', title: 'Camisa FANGZ', price: '$90.000', image: '/assets/images/FANGZ-02.jpg' },
            { id: '677c352e17775357cfe16773', title: 'Camisa SNAKEZ', price: '$90.000', image: '/assets/images/SNAKEZ-02.jpg' },
            { id: '677c352e17775357cfe16774', title: 'Camisa DOGZ', price: '$90.000', image: '/assets/images/DOGZ-03.jpg' },
            { id: '677c352e17775357cfe16775', title: 'Camisa SNAKEZ BLACK', price: '$90.000', image: '/assets/images/FANGZ-02.jpg' }
        ];
        
        // Filtrar productos que coincidan con el término de búsqueda
        const results = demoProducts.filter(product => 
            product.title.toLowerCase().includes(term.toLowerCase())
        );
        
        return { products: results };
    }
    
    // Mostrar resultados de búsqueda
    function displaySearchResults(results) {
        createSearchResultsContainer();
        searchResults.innerHTML = '';
        
        if (results.products.length === 0) {
            searchResults.innerHTML = '<div class="no-results">Producto no encontrado</div>';
        } else {
            results.products.forEach(product => {
                const productElement = document.createElement('div');
                productElement.className = 'search-product-item';
                
                productElement.innerHTML = `
                    <img src="${product.image}" alt="${product.title}" onerror="this.src='/assets/images/placeholder.jpg'; this.onerror=null;">
                    <div class="search-product-info">
                        <h4>${product.title}</h4>
                        <p>${product.price}</p>
                    </div>
                `;
                
                productElement.addEventListener('click', () => {
                    window.location.href = `/info-producto?id=${product.id}`;
                });
                
                searchResults.appendChild(productElement);
            });
        }
        
        // Actualizar posición cada vez que se muestran resultados
        const searchRect = search.getBoundingClientRect();
        const navbarRect = document.querySelector('.navbar').getBoundingClientRect();
        
        // Calcular posición centrada
        const centerPos = navbarRect.left + (navbarRect.width / 2);
        searchResults.style.left = centerPos + 'px';
        searchResults.style.transform = 'translateX(-50%)';
        searchResults.style.top = (searchRect.bottom + window.scrollY + 5) + 'px';
        
        searchResults.style.display = 'block';
    }
    
    // Evento para buscar mientras se escribe
    searchInput.addEventListener('input', async function() {
        const searchTerm = searchInput.value.trim();
        
        if (searchTerm.length >= 2) {
            const results = await searchProducts(searchTerm);
            displaySearchResults(results);
        } else {
            if (searchResults) {
                searchResults.style.display = 'none';
            }
        }
    });
    
    // Evento para enviar la búsqueda
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                window.location.href = `/catalogo?search=${encodeURIComponent(searchTerm)}`;
            }
        }
    });

    search.addEventListener('click', function(e) {
        if (!e.target.closest('input')) {
            this.classList.toggle('active');
            if (this.classList.contains('active')) {
                searchInput.focus();
            } else {
                if (searchResults) {
                    searchResults.style.display = 'none';
                }
            }
        }
    });

    searchInput.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    document.addEventListener('click', function(e) {
        if (!search.contains(e.target) && !searchResults?.contains(e.target)) {
            search.classList.remove('active');
            searchInput.value = '';
            if (searchResults) {
                searchResults.style.display = 'none';
            }
        }
    });
    
    // Actualizar posición en caso de redimensionar la ventana o scroll
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    
    function updatePosition() {
        if (searchResults && searchResults.style.display !== 'none') {
            const searchRect = search.getBoundingClientRect();
            const navbarRect = document.querySelector('.navbar').getBoundingClientRect();
            
            // Calcular posición centrada
            const centerPos = navbarRect.left + (navbarRect.width / 2);
            searchResults.style.left = centerPos + 'px';
            searchResults.style.transform = 'translateX(-50%)';
            searchResults.style.top = (searchRect.bottom + window.scrollY + 5) + 'px';
        }
    }
});