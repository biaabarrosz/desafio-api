const express = require('express');
const router = express.Router();
const { createUser, getUsers, getUserById, updateUser, addDocumentToUser, deleteUser } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas protegidas por autenticação
router.get('/', authMiddleware, getUsers);
router.get('/:id', authMiddleware, getUserById);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);

// Rota pública para criar usuário
router.post('/', createUser);

// Associar documento a um usuário
router.post('/add-document', authMiddleware, addDocumentToUser);

module.exports = router;
