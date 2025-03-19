const CartService = {
    /**
     * Obtiene el carrito del localStorage
     * @returns {Array} Array de productos en el carrito
     */
    getCart() {
        return JSON.parse(localStorage.getItem('cart') || '[]');
    },

    /**
     * Guarda el carrito en localStorage
     * @param {Array} cart - Array de productos a guardar
     */
    saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    },

    /**
     * Verifica el stock disponible de un producto
     * @param {string} productId - ID del producto
     * @param {string} talla - Talla del producto
     * @param {number} quantity - Cantidad solicitada 
     * @returns {Promise<{available: boolean, remainingStock: number}>}
     */
    async checkStock(productId, talla, quantity) {
        // Simulación de verificación de stock
        const stock = {
            "6759c99da1c68ec321893bf9": { "S": 10, "M": 5, "L": 2, "XL": 0 },
            "677c352e17775357cfe16773": { "S": 8, "M": 3, "L": 0, "XL": 1 },
            "677c352e17775357cfe16774": { "S": 6, "M": 4, "L": 3, "XL": 2 },
            "677c352e17775357cfe16775": { "S": 7, "M": 2, "L": 1, "XL": 0 }
        };

        const productStock = stock[productId] || {};
        const remainingStock = productStock[talla] || 0;

        return {
            available: remainingStock >= quantity,
            remainingStock
        };
    },

    /**
     * Muestra una notificación estilizada
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de notificación ('success', 'error')
     */
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Remover notificaciones anteriores
        document.querySelectorAll('.notification').forEach(n => n.remove());

        document.body.appendChild(notification);

        // Asegúrate que los estilos CSS están correctamente aplicados
        notification.style.animation = 'fadeIn 0.5s forwards, fadeOut 0.5s 3.5s forwards';
        notification.style.opacity = '0'; // Asegúrate que la opacidad inicial es 0

        setTimeout(() => {
            notification.remove();
        }, 4000);
    },

    /**
     * Agrega un producto al carrito
     * @param {Object} product - Producto a agregar
     * @returns {Promise<boolean>}
     */
    async addItem(product) {
        try {
            // Validaciones básicas
            if (!product.id || !product.talla || !product.quantity) {
                throw new Error('Datos del producto incompletos');
            }

            // Normalizar el precio
            product.price = parseFloat(product.price.toString().replace(/[$.]/g, ''));

            // Verificar stock
            const stockCheck = await this.checkStock(product.id, product.talla, product.quantity);

            if (!stockCheck.available) {
                this.showNotification(`Lo sentimos, solo quedan ${stockCheck.remainingStock} unidades disponibles`, 'error');
                return false;
            }

            const cart = this.getCart();
            const existingItem = cart.find(item =>
                item.id === product.id &&
                item.talla === product.talla
            );

            if (existingItem) {
                const totalQuantity = existingItem.quantity + product.quantity;
                if (totalQuantity > stockCheck.remainingStock) {
                    this.showNotification('No hay suficiente stock disponible', 'error');
                    return false;
                }
                existingItem.quantity = totalQuantity;
            } else {
                cart.push(product);
            }

            this.saveCart(cart);
            this.updateCartUI();
            return true;
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Error al agregar al carrito', 'error');
            return false;
        }
    },

    /**
     * Elimina un producto del carrito
     * @param {string} id - ID del producto
     * @param {string} talla - Talla del producto
     * @returns {boolean}
     */
    removeItem(id, talla) {
        try {
            const cart = this.getCart();
            const updatedCart = cart.filter(item =>
                !(item.id === id && item.talla === talla)
            );
            this.saveCart(updatedCart);
            this.updateCartUI();
            return true;
        } catch (error) {
            console.error('Error al eliminar item:', error);
            return false;
        }
    },

    /**
     * Actualiza la cantidad de un producto
     * @param {string} id - ID del producto
     * @param {string} talla - Talla del producto
     * @param {number} quantity - Nueva cantidad
     * @returns {Promise<boolean>}
     */
    async updateQuantity(id, talla, quantity) {
        try {
            if (quantity < 1) return false;

            const stockCheck = await this.checkStock(id, talla, quantity);
            if (!stockCheck.available) {
                this.showNotification('No hay suficiente stock disponible', 'error');
                return false;
            }

            const cart = this.getCart();
            const item = cart.find(item =>
                item.id === id &&
                item.talla === talla
            );

            if (item) {
                item.quantity = quantity;
                this.saveCart(cart);
                this.updateCartUI();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error al actualizar cantidad:', error);
            return false;
        }
    },

    /**
     * Limpia el carrito completamente
     */
    clearCart() {
        localStorage.removeItem('cart');
        this.updateCartUI();
    },

    /**
     * Actualiza la interfaz del carrito
     */
    updateCartUI() {
        const cart = this.getCart();
        const cartContent = document.querySelector('.cart-content');
        const cartTotal = document.querySelector('.total span:last-child');

        if (!cartContent) return;

        if (cart.length === 0) {
            cartContent.innerHTML = `
                <div class="empty-cart">
                    <i class='bx bx-cart'></i>
                    <p>Tu carrito está vacío</p>
                </div>
            `;
            cartTotal.textContent = '$0';
            return;
        }

        let total = 0;
        cartContent.innerHTML = cart.map(item => {
            total += item.price * item.quantity;
            return `
                <div class="cart-item" data-id="${item.id}" data-talla="${item.talla}">
                    <img src="${item.image}" alt="${item.title}">
                    <div class="item-details">
                        <h3>${item.title}</h3>
                        <p class="price">$${item.price.toLocaleString('es-CO')}</p>
                        <p class="size">Talla: ${item.talla}</p>
                        <div class="quantity">
                            <button class="qty-btn decrease">-</button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn increase">+</button>
                        </div>
                    </div>
                    <button class="remove-item">×</button>
                </div>
            `;
        }).join('');

        cartTotal.textContent = `$${total.toLocaleString('es-CO')}`;
        this.setupCartItemListeners();
    },

    /**
     * Configura los event listeners para los items del carrito
     */
    setupCartItemListeners() {
        document.querySelectorAll('.cart-item').forEach(item => {
            const id = item.dataset.id;
            const talla = item.dataset.talla;

            item.querySelector('.remove-item').addEventListener('click', () =>
                this.removeItem(id, talla)
            );

            item.querySelector('.decrease').addEventListener('click', async () => {
                const currentQty = parseInt(item.querySelector('.quantity span').textContent);
                if (currentQty > 1) {
                    await this.updateQuantity(id, talla, currentQty - 1);
                }
            });

            item.querySelector('.increase').addEventListener('click', async () => {
                const currentQty = parseInt(item.querySelector('.quantity span').textContent);
                await this.updateQuantity(id, talla, currentQty + 1);
            });
        });
    }
};

export default CartService;