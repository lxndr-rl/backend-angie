const express = require('express');
const router = express.Router();

// Ruta básica de prueba
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Ruta de usuarios funcionando'
  });
});

module.exports = router;