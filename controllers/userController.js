const User = require('../models/User');
const Document = require('../models/Document');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Função para validar campos obrigatórios
const validateUserFields = (fields) => {
    const requiredFields = ['nome', 'dataNascimento', 'email', 'senha'];
    const missingFields = requiredFields.filter(field => !fields[field]);
    return missingFields;
};

// Criar usuário
exports.createUser = async (req, res) => {
    const { nome, dataNascimento, email, senha, confirmarSenha } = req.body;
    const missingFields = validateUserFields(req.body);
    
    if (missingFields.length > 0) {
        return res.status(400).json({ message: `Os seguintes campos são obrigatórios: ${missingFields.join(', ')}` });
    }

    if (senha !== confirmarSenha) {
        return res.status(400).json({ message: 'As senhas não coincidem' });
    }

    try {
        const userExists = await User.findOne({ email });
        const nameExists = await User.findOne({ nome });
        if (userExists || nameExists) {
            return res.status(400).json({ message: 'Nome ou E-mail já cadastrado' });
        }

        const newUser = new User({ nome, dataNascimento, email, senha });
        await newUser.save();

        res.status(201).json({ message: 'Usuário cadastrado com sucesso', user: {
            nome: newUser.nome,
            dataNascimento: newUser.dataNascimento,
            email: newUser.email
        }});
    } catch (error) {
        res.status(500).json({ message: 'Erro ao cadastrar usuário', error });
    }
};

// Listar todos os usuários
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-senha').populate('documentos');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar usuários', error });
    }
};

// Buscar usuário por ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-senha').populate('documentos');
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar usuário', error });
    }
};

// Atualizar usuário
exports.updateUser = async (req, res) => {
    const { nome, dataNascimento, email, senha, confirmarSenha } = req.body;
    const updatedFields = { nome, dataNascimento, email };

    if (senha && senha !== confirmarSenha) {
        return res.status(400).json({ message: 'As senhas não coincidem' });
    }

    try {
        const user = await User.findById(req.params.id).select('-senha');
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

        // Atualizar os campos
        Object.keys(updatedFields).forEach(key => {
            if (updatedFields[key]) user[key] = updatedFields[key];
        });

        // Se a senha foi alterada, criptografar e atualizar
        if (senha) {
            user.senha = await bcrypt.hash(senha, 10);
        }

        user.updatedAt = Date.now();
        await user.save();

        res.json({ message: 'Usuário atualizado com sucesso', user: user });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar usuário', error });
    }
};

// Deletar usuário (sem remover documentos associados e invalidando o token)
exports.deleteUser = async (req, res) => {
    try {
        // Encontrar o usuário pelo ID
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Remover o usuário
        await User.findByIdAndDelete(req.params.id);

        // O token será efetivamente "invalidado" pois o usuário foi deletado
        res.json({ message: 'Usuário deletado com sucesso e token JWT invalidado' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar usuário', error });
    }
};

// Associar documento ao usuário
exports.addDocumentToUser = async (req, res) => {
    const { userId, documentId } = req.body;

    try {
        // Verificar se o usuário existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Verificar se o documento existe
        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: 'Documento não encontrado' });
        }

        // Verificar se o documento já está associado ao usuário
        if (user.documentos.includes(documentId)) {
            return res.status(400).json({ message: 'Documento já está associado ao usuário' });
        }

        // Associar o documento ao usuário
        user.documentos.push(document._id);
        await user.save();

        // Retornar o usuário com os documentos atualizados
        res.json({ message: 'Documento associado ao usuário com sucesso', user });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao associar documento ao usuário', error });
    }
};