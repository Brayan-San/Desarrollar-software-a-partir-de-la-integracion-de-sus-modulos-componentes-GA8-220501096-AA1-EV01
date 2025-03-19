import CartService from './cartService.js';

(function () {
    const cartIcon = document.getElementById('cartIcon');
    const cart = document.getElementById('cart');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartClose = document.getElementById('cartClose');
    const checkoutBtn = document.querySelector('.checkout-btn');

    if (!cart || !cartOverlay) {
        console.warn('Elementos del carrito no encontrados.');
        return;
    }

    // Add notification styles
    const notificationStyles = document.createElement('style');
    notificationStyles.textContent = `
        .notification-buttons {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }
        .notification-buttons button {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        .btn-login {
            background: #4CAF50;
            color: white;
        }
        .btn-login:hover {
            background: #45a049;
        }
        .btn-cancel {
            background: #f44336;
            color: white;
        }
        .btn-cancel:hover {
            background: #da190b;
        }
    `;
    document.head.appendChild(notificationStyles);

    function showNotificationWithButtons(message) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification warning';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <div class="notification-buttons">
                    <button class="btn-login">Iniciar Sesión</button>
                    <button class="btn-cancel">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(notification);
    
        // Add button event listeners
        notification.querySelector('.btn-login').addEventListener('click', () => {
            window.location.href = '/login';
        });
    
        notification.querySelector('.btn-cancel').addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        });
    
        return notification;
    }
    
    function handleCheckout(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        const token = localStorage.getItem('token');
        if (!token) {
            const notification = showNotificationWithButtons('Para continuar con la compra, necesitas iniciar sesión');
            return false; // Important: stop execution here
        }
        window.location.href = '/payment-flow';
    }
    
    // Modify checkout button event listener
    if (checkoutBtn) {
        checkoutBtn.removeEventListener('click', handleCheckout);
        checkoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            handleCheckout(e);
        }, true); // Use capture phase
    }

    function openCart() {
        cart.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        cart.style.visibility = 'visible';
        CartService.updateCartUI();
    }

    function closeCart() {
        cart.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        setTimeout(() => {
            if (!cart.classList.contains('active')) {
                cart.style.visibility = 'hidden';
            }
        }, 300);
    }

    function handleCheckout(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        const token = localStorage.getItem('token');
        if (!token) {
            showNotificationWithButtons('Para continuar con la compra, necesitas iniciar sesión');
            return false;
        }
        window.location.href = '/payment-flow';
    }

    function setupEventListeners() {
        if (cartIcon) {
            cartIcon.addEventListener('click', (e) => {
                e.preventDefault();
                if (cart) {
                    cart.style.visibility = 'visible';
                    requestAnimationFrame(() => {
                        openCart();
                    });
                }
            });
        }
    
        if (cartClose) cartClose.addEventListener('click', closeCart);
        if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
        
        if (checkoutBtn) {
            // Remove old event listener if exists
            checkoutBtn.removeEventListener('click', handleCheckout);
            // Add new event listener with event parameter
            checkoutBtn.addEventListener('click', (e) => handleCheckout(e));
        }
    
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeCart();
        });
    
        window.addEventListener('storage', (e) => {
            if (e.key === 'cart') CartService.updateCartUI();
        });
    }

    function initializeCartState() {
        cart.classList.remove('active');
        cart.style.visibility = 'hidden';
        cartOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
        CartService.updateCartUI();
    }

    try {
        initializeCartState();
        setupEventListeners();
    } catch (error) {
        console.warn('Error al inicializar el carrito:', error);
    }
})();