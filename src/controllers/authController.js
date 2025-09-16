const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generar JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Registro de usuario
const register = async (req, res) => {
    try {
        const { firstName, lastName, cedula, address, phone, username, password } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ 
            $or: [{ username }, { cedula }] 
        });

        if (existingUser) {
            return res.status(400).json({
                error: existingUser.username === username 
                    ? 'El nombre de usuario ya está en uso' 
                    : 'La cédula ya está registrada'
            });
        }

        // Crear nuevo usuario
        const user = new User({
            firstName,
            lastName,
            cedula,
            address,
            phone,
            username,
            password
        });

        await user.save();

        // Generar token
        const token = generateToken(user._id);

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            error: 'Error interno del servidor durante el registro'
        });
    }
};

// Login de usuario
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Buscar usuario
        const user = await User.findOne({ username });
        
        if (!user) {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }

        // Verificar si la cuenta está activa
        if (!user.isActive) {
            return res.status(401).json({
                error: 'Cuenta desactivada. Contacta al administrador.'
            });
        }

        // Verificar contraseña
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }

        // Generar token
        const token = generateToken(user._id);

        res.json({
            message: 'Inicio de sesión exitoso',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            error: 'Error interno del servidor durante el login'
        });
    }
};

// Obtener perfil del usuario autenticado
const getProfile = async (req, res) => {
    try {
        res.json({
            user: req.user
        });
    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
};

// Actualizar perfil del usuario
const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, address, phone } = req.body;
        const userId = req.user._id;

        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (address) updateData.address = address;
        if (phone) updateData.phone = phone;

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            message: 'Perfil actualizado exitosamente',
            user
        });

    } catch (error) {
        console.error('Error actualizando perfil:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
};

// Cambiar contraseña
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        // Verificar contraseña actual
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                error: 'La contraseña actual es incorrecta'
            });
        }

        // Actualizar contraseña
        user.password = newPassword;
        await user.save();

        res.json({
            message: 'Contraseña actualizada exitosamente'
        });

    } catch (error) {
        console.error('Error cambiando contraseña:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword
};