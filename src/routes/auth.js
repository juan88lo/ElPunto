const express = require('express');
const router = express.Router();
const { Usuario } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints para registrar y autenticar usuarios
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - correo
 *               - password
 *               - rol
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan Pérez
 *               correo:
 *                 type: string
 *                 example: juanperez@example.com
 *               password:
 *                 type: string
 *                 example: 12345
 *               rol:
 *                 type: string
 *                 example: cajero
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *       400:
 *         description: Ya existe un usuario con ese correo
 *       500:
 *         description: Error al registrar usuario
 */
router.post('/register', async (req, res) => {
  try {
    const { nombre, correo, password, rol } = req.body;

    const existe = await Usuario.findOne({ where: { correo } });
    if (existe) return res.status(400).json({ mensaje: 'Ya existe un usuario con ese correo.' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = await Usuario.create({
      nombre,
      correo,
      password: hashedPassword,
      rol
    });

    res.status(201).json({ mensaje: 'Usuario creado correctamente', usuario: nuevoUsuario });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar usuario', error });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inicia sesión y devuelve un token JWT
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *               - password
 *             properties:
 *               correo:
 *                 type: string
 *                 example: juanperez@example.com
 *               password:
 *                 type: string
 *                 example: 12345
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Login exitoso
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Contraseña incorrecta
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error en login
 */
router.post('/login', async (req, res) => {
  try {
    const { correo, password } = req.body;

    const usuario = await Usuario.findOne({ where: { correo } });
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const esValido = await bcrypt.compare(password, usuario.password);
    if (!esValido) return res.status(401).json({ mensaje: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      'secreto123', // Usar variable de entorno en producción
      { expiresIn: '1h' }
    );

    res.json({ mensaje: 'Login exitoso', token });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en login', error });
  }
});

module.exports = router;
