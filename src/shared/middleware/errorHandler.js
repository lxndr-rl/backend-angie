// Middleware de manejo de errores global

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('Error:', err);

  // Error de validación de Sequelize
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(error => ({
      field: error.path,
      message: error.message
    }));
    
    return res.status(400).json({
      success: false,
      error: 'Error de validación',
      details: message
    });
  }

  // Error de restricción única de Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'campo';
    
    return res.status(409).json({
      success: false,
      error: `Ya existe un registro con ese ${field}`,
      field: field
    });
  }

  // Error de clave foránea de Sequelize
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      error: 'Error de referencia: el registro referenciado no existe'
    });
  }

  // Error de conexión a la base de datos
  if (err.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      success: false,
      error: 'Error de conexión a la base de datos'
    });
  }

  // Error de timeout de base de datos
  if (err.name === 'SequelizeTimeoutError') {
    return res.status(503).json({
      success: false,
      error: 'Timeout de base de datos - operación tardó demasiado'
    });
  }

  // Error de JWT Token
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Token inválido'
    });
  }

  // Token expirado
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expirado'
    });
  }

  // Error de sintaxis JSON
  if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
    return res.status(400).json({
      success: false,
      error: 'JSON malformado'
    });
  }

  // Error de archivo muy grande
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: 'Archivo demasiado grande'
    });
  }

  // Error de permisos
  if (err.status === 403) {
    return res.status(403).json({
      success: false,
      error: 'No tienes permisos para realizar esta acción'
    });
  }

  // Error no encontrado
  if (err.status === 404) {
    return res.status(404).json({
      success: false,
      error: 'Recurso no encontrado'
    });
  }

  // Error genérico del servidor
  const statusCode = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Error interno del servidor' 
    : err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Middleware para manejar rutas no encontradas
const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

module.exports = {
  errorHandler,
  notFound
};