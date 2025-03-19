const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

// Construir la URL de conexión basada en tu configuración de .env
const url = `mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`;
const dbName = process.env.DB_NAME || 'db_zabal';

let _db;

async function connectToServer() {
    try {
        const client = await MongoClient.connect(url, {
            // Elimina las opciones useNewUrlParser y useUnifiedTopology
        });
        
        console.log('Conectado correctamente a MongoDB');
        _db = client.db(dbName);
        return _db;
    } catch (err) {
        console.error('Error al conectar a MongoDB:', err);
        console.error('Detalles del error:', err.message);
        console.error('URL de conexión utilizada:', url);
        process.exit(1);
    }
}

const getDb = () => {
    if (!_db) {
        throw new Error('Base de datos no inicializada. Llama a connectToServer primero.');
    }
    return _db;
};

module.exports = { connectToServer, getDb };