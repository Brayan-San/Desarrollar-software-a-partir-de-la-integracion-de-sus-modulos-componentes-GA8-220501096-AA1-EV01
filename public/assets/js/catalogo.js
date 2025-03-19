import CartService from './cartService.js';

const camisas = [
    {
        _id: "6759c99da1c68ec321893bf9",
        imagenes: [
            "/assets/images/FANGZ-01.jpg",
            "/assets/images/FANGZ-02.jpg",
            "/assets/images/FANGZ-03.jpg"
        ],
        titulo: "FANGZ",
        precio: "$90.000",
        descripcion: "Tshirt Black 260g Oversize FANGZ.",
        tallas: ["S", "M", "L", "XL"]
    },
    {
        _id: "677c352e17775357cfe16773",
        imagenes: [
            "/assets/images/SNAKEZ-01.jpg",
            "/assets/images/SNAKEZ-02.jpg",
            "/assets/images/SNAKEZ-03.jpg"
        ],
        titulo: "SNAKEZ",
        precio: "$90.000",
        descripcion: "Tshirt White 260g Oversize SNAKEZ.",
        tallas: ["S", "M", "L", "XL"]
    },
    {
        _id: "677c352e17775357cfe16774",
        imagenes: [
            "/assets/images/DOGZ-01.jpg", 
            "/assets/images/DOGZ-02.jpg",
            "/assets/images/DOGZ-03.jpg"
        ],
        titulo: "DOGZ",
        precio: "$90.000",
        descripcion: "Tshirt White 260g Oversize DOGZ.",
        tallas: ["S", "M", "L", "XL"]
    },
    {
        _id: "677c352e17775357cfe16775",
        imagenes: [
            "/assets/images/SNAKEZ-01.jpg",
            "/assets/images/SNAKEZ-02.jpg",
            "/assets/images/SNAKEZ-03.jpg"
        ],
        titulo: "SNAKEZ BLACK",
        precio: "$90.000",
        descripcion: "Tshirt White 260g Oversize SNAKEZ.",
        tallas: ["S", "M", "L", "XL"]
    }
];

class CatalogoUI {
    constructor() {
        this.camisasGrid = document.getElementById('camisasGrid');
        this.init();
    }

    init() {
        if (!this.camisasGrid) {
            console.error('No se encontró el elemento camisasGrid');
            return;
        }
        this.renderProductos();
    }

    crearCarrusel(imagenes) {
        const contenedor = document.createElement('div');
        contenedor.className = 'carrusel-contenedor';

        const carruselImagenes = document.createElement('div');
        carruselImagenes.className = 'carrusel-imagenes';

        imagenes.forEach(imagen => {
            const img = document.createElement('img');
            img.src = imagen;
            img.className = 'carrusel-imagen';
            img.loading = 'lazy';
            
            img.onerror = function() {
                this.alt = 'Imagen no disponible';
                this.style.backgroundColor = '#ffcccc';
            };

            carruselImagenes.appendChild(img);
        });

        const btnIzq = document.createElement('button');
        // btnIzq.innerHTML = '<i class="bx bx-chevron-left"></i>';
        btnIzq.className = 'carrusel-btn carrusel-btn-izq';

        const btnDer = document.createElement('button');
        // btnDer.innerHTML = '<i class="bx bx-chevron-right"></i>';
        btnDer.className = 'carrusel-btn carrusel-btn-der';

        let indiceActual = 0;

        btnIzq.addEventListener('click', () => {
            indiceActual = (indiceActual - 1 + imagenes.length) % imagenes.length;
            carruselImagenes.style.transform = `translateX(-${indiceActual * 100}%)`;
        });

        btnDer.addEventListener('click', () => {
            indiceActual = (indiceActual + 1) % imagenes.length;
            carruselImagenes.style.transform = `translateX(-${indiceActual * 100}%)`;
        });

        contenedor.appendChild(carruselImagenes);
        contenedor.appendChild(btnIzq);
        contenedor.appendChild(btnDer);

        return contenedor;
    }

    async crearTarjetaProducto(camisa) {
        const camisaItem = document.createElement('div');
        camisaItem.className = 'camisa-item';
        camisaItem.setAttribute('data-product-id', camisa._id);
        
        const carrusel = this.crearCarrusel(camisa.imagenes);
        camisaItem.appendChild(carrusel);

        const infoDiv = document.createElement('div');
        infoDiv.className = 'camisa-info';
        
        infoDiv.innerHTML = `
            <h3 class="camisa-titulo">${camisa.titulo}</h3>
            <p class="camisa-precio">${camisa.precio}</p>
            <p class="camisa-descripcion">${camisa.descripcion}</p>
            <div class="tallas-container">
                ${camisa.tallas.map(talla => `
                    <button class="talla-btn" data-talla="${talla}">${talla}</button>
                `).join('')}
            </div>
            <div class="botones-container">
                <button class="agregar-carrito">Agregar al carrito</button>
                <a href="/info-producto?id=${camisa._id}" class="ver-mas">Ver más</a>
            </div>
        `;

        camisaItem.appendChild(infoDiv);
        await this.configurarEventosTarjeta(camisaItem, camisa);
        return camisaItem;
    }

    async configurarEventosTarjeta(camisaItem, camisa) {
        const tallaBtns = camisaItem.querySelectorAll('.talla-btn');
        const agregarBtn = camisaItem.querySelector('.agregar-carrito');
        let tallaSelecionada = null;
    
        // Quitar disabled inicial del botón
        agregarBtn.disabled = false;
    
        tallaBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                tallaBtns.forEach(b => b.classList.remove('selected'));
                
                try {
                    const stockCheck = await CartService.checkStock(camisa._id, btn.dataset.talla, 1);
                    if (!stockCheck.available) {
                        btn.classList.add('agotado');
                        this.mostrarNotificacion('Talla agotada', 'error');
                        return;
                    }
                    
                    btn.classList.add('selected');
                    tallaSelecionada = btn;
                    
                } catch (error) {
                    console.error('Error al verificar stock:', error);
                }
            });
        });
    
        agregarBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('Click en agregar, talla seleccionada:', tallaSelecionada);
            
            if (!tallaSelecionada) {
                this.mostrarNotificacion('Por favor selecciona una talla', 'error');
                return;
            }
            
            
            const item = {
                id: camisa._id,
                title: camisa.titulo,
                price: parseFloat(camisa.precio.replace(/[$.]/g, '')),
                image: camisa.imagenes[0],
                talla: tallaSelecionada.dataset.talla,
                quantity: 1
            };
    
            try {
                const added = await CartService.addItem(item);
                if (added) {
                    this.mostrarNotificacion('¡Producto agregado al carrito!', 'success');
                    tallaBtns.forEach(btn => btn.classList.remove('selected'));
                    tallaSelecionada = null;
                }
            } catch (error) {
                console.error('Error:', error);
                this.mostrarNotificacion('Error al agregar al carrito', 'error');
            }
        });
    }

    async renderProductos() {
        this.camisasGrid.innerHTML = '';
        for (const camisa of camisas) {
            const card = await this.crearTarjetaProducto(camisa);
            this.camisasGrid.appendChild(card);
        }
    }

    mostrarNotificacion(mensaje, tipo = 'success') {
        console.log('Mostrando notificación:', mensaje, tipo); // Agregar este log
        const notificacion = document.createElement('div');
        notificacion.className = `notificacion ${tipo}`;
        notificacion.textContent = mensaje;
        
        // Remover notificaciones anteriores
        document.querySelectorAll('.notificacion').forEach(n => n.remove());
        
        document.body.appendChild(notificacion);
        
        // Asegúrate que los estilos CSS están correctamente aplicados
        notificacion.style.animation = 'fadeIn 0.5s forwards, fadeOut 0.5s 3.5s forwards';
        notificacion.style.opacity = '0'; // Asegúrate que la opacidad inicial es 0
        
        setTimeout(() => {
            notificacion.remove();
        }, 4000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CatalogoUI();
});

export default CatalogoUI;