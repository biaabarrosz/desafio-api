const express = require('express');
const router = express.Router();
const { createDocument, getDocuments, getDocumentById, updateDocument, deleteDocument } = require('../controllers/documentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas protegidas por autenticação
router.get('/', authMiddleware, getDocuments);
router.get('/:id', authMiddleware, getDocumentById);
router.put('/:id', authMiddleware, updateDocument);
router.delete('/:id', authMiddleware, deleteDocument);

// Rota para criar documentos
router.post('/', authMiddleware, createDocument);

module.exports = router;
