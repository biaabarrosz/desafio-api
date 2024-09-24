const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Acesso negado' });

    try {
        // Verificar e decodificar o token JWT
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET); // Verifica o token

        // Verificar se o usuário ainda existe
        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ message: 'Usuário não encontrado ou deletado' });

        // Continuar com o request
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Token inválido' });
    }
};

module.exports = authMiddleware;

