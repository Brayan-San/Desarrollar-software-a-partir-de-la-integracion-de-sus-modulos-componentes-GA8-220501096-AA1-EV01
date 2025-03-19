const NequiPayment = require('../paymentMethods/Nequi');
const DaviplataPayment = require('../paymentMethods/Daviplata');
const ePaycoPayment = require('../paymentMethods/ePayco');

const PaymentController = {
    async processPayment(req, res) {
        const { method, amount, description, userData, orderData } = req.body;

        try {
            let paymentResponse;

            switch (method) {
                case 'epayco':
                    paymentResponse = {
                        success: true,
                        message: 'Redirección a ePayco iniciada',
                        orderData: orderData
                    };
                    break;

                case 'nequi':
                    paymentResponse = await NequiPayment.initiatePayment({
                        amount,
                        description,
                        phoneNumber: userData.phoneNumber,
                    });
                    break;

                case 'daviplata':
                    paymentResponse = await DaviplataPayment.initiatePayment({
                        amount,
                        description,
                        phoneNumber: userData.phoneNumber,
                    });
                    break;

                default:
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Método de pago no soportado' 
                    });
            }

            return res.status(200).json({
                success: true,
                paymentResponse
            });

        } catch (error) {
            console.error('Error en processPayment:', error);
            return res.status(500).json({
                success: false,
                error: error.message || 'Error al procesar el pago'
            });
        }
    },

    async handlePaymentWebhook(req, res) {
        try {
            const paymentData = req.body;
            
            // Validar la fuente del webhook
            if (!paymentData || !paymentData.x_ref_payco) {
                return res.status(400).json({
                    success: false,
                    error: 'Datos de pago inválidos'
                });
            }

            // Procesar según el estado del pago
            switch (paymentData.x_transaction_state) {
                case 'Aceptada':
                    // Actualizar el estado del pedido en la base de datos
                    // Enviar confirmación por email
                    return res.status(200).json({
                        success: true,
                        message: 'Pago procesado exitosamente'
                    });

                case 'Rechazada':
                    return res.status(200).json({
                        success: false,
                        message: 'Pago rechazado'
                    });

                case 'Pendiente':
                    return res.status(200).json({
                        success: true,
                        message: 'Pago en proceso'
                    });

                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Estado de transacción desconocido'
                    });
            }
        } catch (error) {
            console.error('Error en handlePaymentWebhook:', error);
            return res.status(500).json({
                success: false,
                error: 'Error al procesar webhook de pago'
            });
        }
    }
};

module.exports = PaymentController;