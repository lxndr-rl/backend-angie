const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true,
        maxLength: [50, 'El nombre no puede exceder 50 caracteres']
    },
    lastName: {
        type: String,
        required: [true, 'El apellido es requerido'],
        trim: true,
        maxLength: [50, 'El apellido no puede exceder 50 caracteres']
    },
    cedula: {
        type: String,
        required: [true, 'La cédula es requerida'],
        unique: true,
        trim: true,
        maxLength: [15, 'La cédula no puede exceder 15 caracteres']
    },
    address: {
        type: String,
        required: [true, 'La dirección es requerida'],
        trim: true,
        maxLength: [200, 'La dirección no puede exceder 200 caracteres']
    },
    phone: {
        type: String,
        required: [true, 'El teléfono es requerido'],
        trim: true,
        maxLength: [15, 'El teléfono no puede exceder 15 caracteres']
    },
    username: {
        type: String,
        required: [true, 'El usuario es requerido'],
        unique: true,
        trim: true,
        minLength: [3, 'El usuario debe tener al menos 3 caracteres'],
        maxLength: [30, 'El usuario no puede exceder 30 caracteres']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es requerida'],
        minLength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Middleware para encriptar la contraseña antes de guardar
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Método para obtener datos públicos del usuario (sin contraseña)
userSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

module.exports = mongoose.model('User', userSchema);