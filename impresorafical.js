const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const SECRET_KEY = 'tu_clave_secreta'; // Debería ser una clave compleja y almacenada de forma segura
let users = {}; // Almacenamiento de usuarios en memoria
let dishes = ["Plato 1", "Plato 2", /*...*/, "Plato 20"]; // Lista de platos

// Registrar un nuevo usuario con hash de contraseña
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (users[username]) {
            return res.status(400).send('El usuario ya existe');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        users[username] = hashedPassword;
        res.status(201).send('Usuario registrado con éxito');
    } catch (error) {
        res.status(500).send('Error en el servidor');
    }
});

// Inicio de sesión con verificación de contraseña y generación de token
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = users[username];
        if (!user || !(await bcrypt.compare(password, user))) {
            return res.status(400).send('Usuario o contraseña incorrectos');
        }
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '2h' });
        res.status(200).json({ message: 'Inicio de sesión exitoso', token });
    } catch (error) {
        res.status(500).send('Error en el servidor');
    }
});

// Obtener lista de platos con autenticación de token
app.get('/dishes', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).send('Token no válido o expirado');
        res.status(200).json(dishes);
    });
});

// Iniciar el servidor
app.listen(3000, () => console.log('Servidor corriendo en http://localhost:3000'));
