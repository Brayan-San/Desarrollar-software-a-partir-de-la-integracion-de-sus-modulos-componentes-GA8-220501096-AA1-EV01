const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDb } = require('../core/database');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const logger = require('../utils/logger');

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const db = getDb();

        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await db.collection('users').insertOne({
            name,
            email,
            password: hashedPassword,
            createdAt: new Date()
        });

        const token = jwt.sign(
            { userId: newUser.insertedId, email, name },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            status: 'success',
            message: '¡Usuario registrado exitosamente!',
            token,
            user: {
                id: newUser.insertedId,
                name,
                email
            }
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error al registrar usuario.'
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = getDb();

        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Credenciales incorrectas.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Credenciales incorrectas.' });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: 'Inicio de sesión exitoso.',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl || null,
                phone: user.phone || ''
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error al iniciar sesión.' });
    }
};

const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || 
                     req.cookies.token || 
                     (req.headers.cookie && req.headers.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]);

        if (!token) {
            logger.debug('No se encontró token');
            return res.redirect('/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        logger.debug('Token verificado:', decoded);

        req.user = decoded;
        next();
    } catch (error) {
        logger.error('Error verificando token:', error);
        res.redirect('/login');
    }
};

const logout = (req, res) => {
    try {
        res.clearCookie('token');
        res.status(200).json({
            status: 'success',
            message: '¡Sesión cerrada exitosamente!'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error al cerrar sesión.'
        });
    }
};

// Agregar configuración del transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // o el servicio que uses
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verificar configuración
transporter.verify(function(error, success) {
    if (error) {
        console.log('Error en configuración de email:', error);
    } else {
        console.log('Servidor listo para enviar emails');
    }
});

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const db = getDb();

        // Add debug log
        console.log('Processing password reset for:', email);

        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hora

        const result = await db.collection('users').updateOne(
            { email },
            { 
                $set: { 
                    resetToken, 
                    resetTokenExpiry 
                } 
            }
        );

        // Add debug log
        console.log('Update result:', result);

        await transporter.sendMail({
            from: `"ZABAL Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Recupera el acceso a tu cuenta ZABAL',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { 
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #f9f9f9;
                        }
                        .header {
                            background-color: #000;
                            color: #fff;
                            padding: 20px;
                            text-align: center;
                        }
                        .content {
                            background-color: #fff;
                            padding: 30px;
                            border-radius: 5px;
                            margin-top: 20px;
                        }
                        .button {
                            display: inline-block;
                            padding: 12px 24px;
                            background-color: #000;
                            color: #fff;
                            text-decoration: none;
                            border-radius: 5px;
                            margin: 20px 0;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            font-size: 12px;
                            color: #666;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>ZABAL</h1>
                        </div>
                        <div class="content">
                            <h2>¡Hola!</h2>
                            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta ZABAL.</p>
                            <p>No te preocupes, estamos aquí para ayudarte a recuperar el acceso.</p>
                            
                            <p style="text-align: center;">
                                <a href="${process.env.BASE_URL}/reset-password?token=${resetToken}" class="button">
                                    Restablecer mi contraseña
                                </a>
                            </p>
                            
                            <p>Por razones de seguridad, este enlace expirará en 1 hora.</p>
                            <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este correo.</p>
                        </div>
                        <div class="footer">
                            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                            <p>ZABAL &copy; ${new Date().getFullYear()} Todos los derechos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });

        res.status(200).json({ message: 'Correo de recuperación enviado.' });
    } catch (error) {
        console.error('Error en recuperación:', error);
        res.status(500).json({ message: 'Error al procesar la solicitud.' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const db = getDb();

        // Add debug logs
        console.log('Received token:', token);
        
        const user = await db.collection('users').findOne({
            resetToken: token
        });
        
        console.log('Found user:', user ? 'Yes' : 'No');
        console.log('Token expiry:', user?.resetTokenExpiry);
        console.log('Current time:', Date.now());

        if (!user) {
            return res.status(400).json({ message: 'Token inválido' });
        }

        if (user.resetTokenExpiry < Date.now()) {
            return res.status(400).json({ message: 'Token expirado' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.collection('users').updateOne(
            { _id: user._id },
            {
                $set: { password: hashedPassword },
                $unset: { resetToken: "", resetTokenExpiry: "" }
            }
        );

        res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        console.error('Error al restablecer contraseña:', error);
        res.status(500).json({ message: 'Error al restablecer contraseña' });
    }
};

module.exports = {
    register,
    login,
    verifyToken,
    logout,
    forgotPassword,
    resetPassword,
};