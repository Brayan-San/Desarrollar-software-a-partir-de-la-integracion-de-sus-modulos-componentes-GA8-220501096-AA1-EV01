document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('userData'));

    if (!token || !userData) {
        window.location.href = '/login';
        return;
    }

    // Elementos del DOM
    const sidebarItems = document.querySelectorAll('.panel-navigation li');
    const sections = document.querySelectorAll('.panel-content section');
    const logoutBtn = document.getElementById('logout-btn');
    const avatarInput = document.getElementById('avatar-input');
    const previewAvatar = document.getElementById('preview-avatar');
    
    // Actualizar el DOM con los datos del usuario inmediatamente
    document.getElementById('user-name').textContent = userData.name;
    document.getElementById('welcome-name').textContent = userData.name;
    document.getElementById('user-email').textContent = userData.email;

    if (userData.avatarUrl) {
        previewAvatar.src = userData.avatarUrl;
        previewAvatar.style.display = 'block';
    }

    // Código agregado para el carrito
    const agregarCarrito = document.createElement('button');
    agregarCarrito.addEventListener('click', async () => {
        if (!tallaSelecionada) {
            alert('Por favor selecciona una talla');
            return;
        }
        const item = {
            id: index.toString(),
            title: camisa.titulo,
            price: camisa.precio.replace(/[$.]/g, ''),
            image: camisa.imagenes[0],
            talla: tallaSelecionada.textContent,
            quantity: 1
        };
        const added = await CartService.addItem(item);
        if (added) {
            alert('Producto agregado al carrito');
        }
    });

    // Manejo de subida de avatar
    avatarInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecciona una imagen válida');
            return;
        }

        // Mostrar preview
        const reader = new FileReader();
        reader.onload = (e) => {
            previewAvatar.src = e.target.result;
            previewAvatar.style.display = 'block';
        };
        reader.readAsDataURL(file);

        // Enviar al servidor
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await fetch('/api/user/update-avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Error al actualizar avatar');
            
            const result = await response.json();
            
            // Actualizar datos del usuario en localStorage
            const userData = JSON.parse(localStorage.getItem('userData'));
            userData.avatarUrl = result.avatarUrl;
            localStorage.setItem('userData', JSON.stringify(userData));

            console.log('Avatar actualizado:', result);
        } catch (error) {
            console.error('Error:', error);
            alert('No se pudo actualizar la imagen de perfil');
        }
    });

    // Navegación entre secciones
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            sidebarItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            sections.forEach(s => s.classList.remove('active-section'));
            document.getElementById(section)?.classList.add('active-section');
        });
    });

    // Función para cargar datos del usuario
    async function loadUserProfile() {
        try {
            const response = await fetch('/api/user/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al cargar perfil');

            const userData = await response.json();
            
            document.getElementById('user-name').textContent = userData.name;
            document.getElementById('welcome-name').textContent = userData.name;
            document.getElementById('user-email').textContent = userData.email;
            
            const personalInfoForm = document.getElementById('personal-info-form');
            personalInfoForm.fullName.value = userData.name;
            personalInfoForm.email.value = userData.email;
            personalInfoForm.phone.value = userData.phone || '';

            // Actualizar avatar si existe
            if (userData.avatarUrl) {
                previewAvatar.src = userData.avatarUrl;
                previewAvatar.style.display = 'block';
            } else {
                previewAvatar.style.display = 'none';
            }
        } catch (error) {
            console.error('Error:', error);
            alert('No se pudo cargar la información del perfil');
        }
    }

    // Cargar pedidos
    async function loadOrders() {
        try {
            const response = await fetch('/api/user/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const orders = await response.json();
            const ordersList = document.getElementById('orders-list');

            if (orders.length === 0) {
                ordersList.innerHTML = '<p>No hay pedidos realizados aún.</p>';
                return;
            }

            ordersList.innerHTML = orders.map(order => `
                <div class="order-card">
                    <h3>Pedido #${order.id}</h3>
                    <p>Fecha: ${new Date(order.date).toLocaleDateString()}</p>
                    <p>Total: $${order.total.toFixed(2)}</p>
                    <p>Estado: ${order.status}</p>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error al cargar pedidos:', error);
        }
    }

    // Cerrar sesión
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    });

    // Manejar formulario de información personal
    const personalInfoForm = document.getElementById('personal-info-form');
    personalInfoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/user/update-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: personalInfoForm.fullName.value,
                    phone: personalInfoForm.phone.value
                })
            });

            const result = await response.json();
            if (response.ok) {
                alert('Perfil actualizado exitosamente');
            } else {
                alert(result.message || 'Error al actualizar perfil');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('No se pudo actualizar el perfil');
        }
    });

    // Cargar datos iniciales
    loadUserProfile();
    loadOrders();

    // En la función loadUserProfile, modificar:
    if (userData.avatarUrl) {
        previewAvatar.src = userData.avatarUrl;
        previewAvatar.style.display = 'block';
    } else {
        previewAvatar.style.display = 'none';
    }
});