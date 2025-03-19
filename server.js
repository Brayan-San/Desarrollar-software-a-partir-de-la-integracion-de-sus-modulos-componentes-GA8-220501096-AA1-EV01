const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectToServer, getDb } = require('./app/core/database');
const authRoutes = require('./app/routes/auth');
const { verifyToken } = require('./app/controllers/AuthController');
const multer = require('multer');
const { ObjectId } = require('mongodb');
const nodemailer = require('nodemailer');
const logger = require('./app/utils/logger');
// const paymentRoutes = require('./app/routes/payment');

// Configuración
dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('public/uploads'));

// Configuración de Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/avatars');
    },
    filename: function (req, file, cb) {
        cb(null, 'avatar-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use('/api/auth', authRoutes);

// Añadir rutas de la pasarela de pago
// app.use('/api/payment', paymentRoutes);

// Configuración de vistas
app.set('view engine', 'ejs');
app.set('views', [
    path.join(__dirname, 'public'),
    path.join(__dirname, 'app', 'views')
]);

// Nueva ruta para verificar stock
app.get('/api/products/:id/stock', async (req, res) => {
    try {
        const db = getDb();
        const productId = req.params.id;
        const size = req.query.size;

        const product = await db.collection('products').findOne(
            { _id: new ObjectId(productId) }
        );
        
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        
        // Acceder al stock específico de la talla
        const stockForSize = product.stock[size];
        
        res.json({
            stock: stockForSize,
            available: stockForSize > 0
        });

    } catch (error) {
        console.error('Error checking stock:', error);
        res.status(500).json({ message: 'Error al verificar stock' });
    }
});

// Rutas de la API existentes
app.get('/api/user/profile', verifyToken, async (req, res) => {
    try {
        const db = getDb();
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(req.user.userId) }
        );

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatarUrl: user.avatarUrl || null
        });
    } catch (error) {
        console.error('Error en /api/user/profile:', error);
        res.status(500).json({ message: 'Error al obtener perfil' });
    }
});

app.get('/api/user/orders', verifyToken, async (req, res) => {
    try {
        const db = getDb();
        const orders = await db.collection('orders')
            .find({ userId: req.user.userId })
            .toArray();

        res.json(orders);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error al obtener órdenes' });
    }
});

app.post('/api/user/update-avatar', verifyToken, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se subió ningún archivo' });
        }

        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        const db = getDb();
        
        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(req.user.userId) },
            { $set: { avatarUrl: avatarUrl } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ 
            success: true,
            avatarUrl: avatarUrl 
        });
    } catch (error) {
        console.error('Error al actualizar avatar:', error);
        res.status(500).json({ message: 'Error al actualizar el avatar' });
    }
});

app.get('/customer-panel', verifyToken, (req, res) => {
    logger.debug('Rendering customer panel', { 
        userId: req.user.userId,
        email: req.user.email 
    });
    res.render('customer-panel', { title: 'Panel de Cliente' });
});

// Rutas de páginas
app.get('/', (req, res) => {
    res.render('index', { title: 'ZABAL' });
});

app.get('/styles', (req, res) => {
    res.render('styles', { title: 'Styles Zabal' });
});

app.get('/catalogo', (req, res) => {
    res.render('catalogo', { title: 'Catálogo Zabal' });
});

app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

app.get('/register', (req, res) => {
    res.render('register', { title: 'Registro' });
});

app.get('/info-producto', (req, res) => {
    res.render('info-producto', { title: 'Información del Producto' });
});

app.get('/servicio-al-cliente', (req, res) => {
    res.render('servicio-al-cliente', { title: 'Servicio al Cliente' });
});

// Ruta para mostrar el formulario de reset password
app.get('/reset-password', (req, res) => {
    const token = req.query.token;
    if (!token) {
        return res.redirect('/login');
    }
    res.render('reset-password', { 
        title: 'Restablecer Contraseña',
        token: token 
    });
});

// Ruta para mostrar formulario de resetear contraseña
app.get('/forgot-password', (req, res) => {
    res.render('forgot-password', { title: 'Recuperar Contraseña' });
});

// app.get('/checkout', verifyToken, (req, res) => {
//     res.render('checkout', { title: 'Checkout - ZABAL' });
// });

app.get('/payment-flow', verifyToken, (req, res) => {
    res.render('payment-flow', { title: 'payment-flow - ZABAL' });
});

// Add order creation endpoint
app.post('/api/orders/create', verifyToken, async (req, res) => {
    try {
        console.log('User from token:', req.user); // Debug log
        console.log('Request body:', req.body); // Debug log
        
        const db = getDb();
        const { items, shippingInfo } = req.body;
        
        if (!items || !Array.isArray(items) || items.length === 0) {
            console.log('Invalid items:', items); // Debug log
            return res.status(400).json({ message: 'Items inválidos o carrito vacío' });
        }

        // Validar shippingInfo
        if (!shippingInfo || !shippingInfo.fullName || !shippingInfo.email) {
            console.log('Invalid shipping info:', shippingInfo); // Debug log
            return res.status(400).json({ message: 'Información de envío incompleta' });
        }

        const orderData = {
            userId: new ObjectId(req.user.userId),
            orderNumber: `ORD-${Date.now()}`,
            status: "pending",
            items: items.map(item => ({
                productId: new ObjectId(item.productId),
                name: item.name,
                price: parseFloat(item.price),
                quantity: parseInt(item.quantity),
                size: item.size
            })),
            shippingInfo,
            totalAmount: items.reduce((acc, item) => acc + (parseFloat(item.price) * parseInt(item.quantity)), 0),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        console.log('Order to be created:', orderData); // Debug log

        const result = await db.collection('orders').insertOne(orderData);
        console.log('Insert result:', result); // Debug log

        res.json({ 
            success: true, 
            orderId: result.insertedId,
            message: 'Orden creada exitosamente'
        });
    } catch (error) {
        console.error('Detailed error:', error); // Debug log
        res.status(500).json({ 
            message: 'Error al crear la orden',
            error: error.message 
        });
    }
});

app.get('/payment-response', async (req, res) => {
    const { ref_payco, response } = req.query;
    // Verificar estado del pago
    res.render('payment-response', { 
        success: response === 'success',
        reference: ref_payco 
    });
});

app.post('/api/payment-confirmation', async (req, res) => {
    const { x_ref_payco, x_transaction_state } = req.body;
    const db = getDb();
    
    try {
        await db.collection('orders').updateOne(
            { orderNumber: x_ref_payco },
            { 
                $set: { 
                    paymentStatus: x_transaction_state,
                    updatedAt: new Date()
                } 
            }
        );
        res.sendStatus(200);
    } catch (error) {
        console.error('Error updating order:', error);
        res.sendStatus(500);
    }
});

app.use(cors({
    origin: ['http://localhost:4545', 'https://checkout.epayco.co'],
    credentials: true
}));

// Configurar nodemailer usando variables de entorno
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Ruta actualizada de contacto
app.post('/contact', express.json(), async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const db = getDb();

        const savedMessage = await db.collection('contact_messages').insertOne({
            name,
            email,
            subject,
            message,
            createdAt: new Date()
        });
        
        logger.debug(`Mensaje guardado: ${savedMessage.insertedId}`);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `Nuevo mensaje de contacto: ${subject}`,
            html: `
                <h3>Nuevo mensaje de contacto</h3>
                <p><strong>Nombre:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Asunto:</strong> ${subject}</p>
                <p><strong>Mensaje:</strong></p>
                <p>${message}</p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info('Email enviado exitosamente');

        res.status(200).json({ 
            message: 'Email enviado exitosamente',
            emailInfo: info.response
        });

    } catch (error) {
        logger.error('Error en proceso de contacto:', error);
        res.status(500).json({ 
            message: 'Hubo un problema al enviar el mensaje. Por favor, intente nuevamente.' // Fixed error message
        });
    }
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).send('Página no encontrada');
});

// Definir el puerto
const PORT = process.env.PORT || 4500;

// Función principal asíncrona para iniciar el servidor
async function startServer() {
    try {
        await connectToServer();
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

// Ejecutar la función de inicio
startServer();