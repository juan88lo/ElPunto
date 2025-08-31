const bcrypt = require('bcrypt');
const { sequelize, Usuario } = require('../models');

async function actualizarPassword() {
    try {
        const password = 'admin123';
        const hash = await bcrypt.hash(password, 10);
        
        // Actualizar el usuario administrador
        const usuario = await Usuario.findOne({ where: { correo: 'admin@elpunto.com' } });
        if (usuario) {
            await usuario.update({ password: hash });
            console.log('Contraseña actualizada correctamente');
            console.log('Nuevo hash:', hash);
        } else {
            // Si no existe el usuario, lo creamos
            await Usuario.create({
                nombre: 'Administrador',
                correo: 'admin@elpunto.com',
                password: hash,
                tipoUsuarioId: 1,
                estado: 1
            });
            console.log('Usuario administrador creado correctamente');
            console.log('Hash:', hash);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

actualizarPassword();
