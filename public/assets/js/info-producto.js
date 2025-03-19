import { camisas } from './data/camisas.js';
import CartService from './cartService.js';

// Sistema de alertas mejorado
const showAlert = (message, type = 'error') => {
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) existingAlert.remove();

    const alert = document.createElement('div');
    alert.className = `custom-alert ${type}`;
    alert.innerHTML = `
        <i class='bx ${type === 'success' ? 'bx-check' : type === 'warning' ? 'bx-error' : 'bx-x'}'></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(alert);
    setTimeout(() => alert.classList.add('show'), 10);
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 300);
    }, 3000);
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Loaded'); // Debug

    // Verificar página y obtener producto
    const isProductPage = window.location.pathname.includes('info-producto');
    if (!isProductPage) {
        console.log('Not product page'); // Debug
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    console.log('Product ID:', productId); // Debug

    // Referencias DOM
    const carouselContainer = document.querySelector('.carousel-container');
    const thumbnailsContainer = document.querySelector('.carousel-thumbnails');
    const prevButton = document.querySelector('.carousel-prev');
    const nextButton = document.querySelector('.carousel-next');

    // Encontrar el producto
    const producto = camisas.find(p => p._id === productId);
    console.log('Producto encontrado:', producto); // Debug

    if (!producto) {
        showAlert('Producto no encontrado', 'error');
        return;
    }

    // Funciones de actualización
    const updateProductInfo = () => {
        console.log('Actualizando info del producto'); // Debug

        // Título y precio
        const titleElement = document.querySelector('.container-title');
        const priceElement = document.querySelector('.container-price span');
        const descriptionElement = document.querySelector('.text-description p');

        if (titleElement) titleElement.textContent = producto.titulo;
        if (priceElement) priceElement.textContent = producto.precio;
        if (descriptionElement) descriptionElement.textContent = producto.descripcion;
        
        // Tallas
        const sizeSelect = document.querySelector('#size');
        if (sizeSelect && producto.tallas) {
            sizeSelect.innerHTML = `
                <option disabled selected value="">Escoge una opción</option>
                ${producto.tallas.map(talla => `
                    <option value="${talla}">${talla}</option>
                `).join('')}
            `;
        }

        // Actualizar carrusel
        if (carouselContainer && producto.imagenes) {
            const carouselHTML = producto.imagenes.map((imagen, index) => `
                <img src="${imagen}" 
                     alt="${producto.titulo} - ${index + 1}" 
                     class="carousel-image ${index === 0 ? 'active' : ''}"
                />
            `).join('');
            carouselContainer.innerHTML = carouselHTML;
            console.log('Carrusel HTML:', carouselHTML); // Debug
        }

        // Actualizar miniaturas
        if (thumbnailsContainer && producto.imagenes) {
            const thumbnailsHTML = producto.imagenes.map((imagen, index) => `
                <div class="thumbnail ${index === 0 ? 'active' : ''}" 
                     data-index="${index}"
                     style="background-image: url('${imagen}')">
                </div>
            `).join('');
            thumbnailsContainer.innerHTML = thumbnailsHTML;
            console.log('Thumbnails HTML:', thumbnailsHTML); // Debug
        }
    };

    // Inicializar carrusel
    const initCarousel = () => {
        let currentIndex = 0;
        const images = document.querySelectorAll('.carousel-image');
        const thumbnails = document.querySelectorAll('.thumbnail');

        const showImage = (index) => {
            images.forEach(img => img.classList.remove('active'));
            thumbnails.forEach(thumb => thumb.classList.remove('active'));
            images[index].classList.add('active');
            thumbnails[index].classList.add('active');
            currentIndex = index;
        };

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % images.length;
                showImage(currentIndex);
            });
        }

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + images.length) % images.length;
                showImage(currentIndex);
            });
        }

        thumbnails.forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', () => showImage(index));
        });
    };

    // Configurar eventos para agregar al carrito
    const setupAddToCart = () => {
        const addToCartBtn = document.querySelector('.btn-add-to-cart');
        const quantityInput = document.querySelector('.input-quantity');
        const decreaseBtn = document.querySelector('.quantity-btn.decrease');
        const increaseBtn = document.querySelector('.quantity-btn.increase');

        if (increaseBtn) {
            increaseBtn.addEventListener('click', () => {
                quantityInput.value = parseInt(quantityInput.value) + 1;
            });
        }

        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', () => {
                if (parseInt(quantityInput.value) > 1) {
                    quantityInput.value = parseInt(quantityInput.value) - 1;
                }
            });
        }

        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', async () => {
                const talla = document.querySelector('#size').value;
                const cantidad = parseInt(quantityInput.value);

                if (!talla) {
                    showAlert('Por favor selecciona una talla', 'warning');
                    return;
                }

                try {
                    // Verificar stock
                    const stockResponse = await fetch(`/api/products/${producto._id}/stock?size=${talla}`);
                    const stockData = await stockResponse.json();

                    if (!stockResponse.ok) {
                        throw new Error('Error al verificar stock');
                    }

                    if (stockData.stock < cantidad) {
                        showAlert(`Lo sentimos, solo quedan ${stockData.stock} unidades disponibles`, 'warning');
                        return;
                    }

                    const item = {
                        id: producto._id,
                        title: producto.titulo,
                        price: parseInt(producto.precio.replace(/[$.]/g, '')),
                        image: producto.imagenes[0],
                        talla,
                        quantity: cantidad
                    };

                    const added = await CartService.addItem(item);
                    
                    if (added) {
                        showAlert('Producto agregado al carrito', 'success');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showAlert('Error al agregar al carrito', 'error');
                }
            });
        }
    };

    // Inicializar todo
    updateProductInfo();
    initCarousel();
    setupAddToCart();
});