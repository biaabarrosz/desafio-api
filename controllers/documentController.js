const Document = require('../models/Document');
const User = require('../models/User');

// Função para validar campos obrigatórios
const validateDocumentFields = (fields) => {
    const requiredFields = ['nome', 'url'];
    const missingFields = requiredFields.filter(field => !fields[field]);
    return missingFields;
};

// Criar documento
exports.createDocument = async (req, res) => {
    const { nome, url } = req.body;
    const missingFields = validateDocumentFields(req.body);
    
    if (missingFields.length > 0) {
        return res.status(400).json({ message: `Os seguintes campos são obrigatórios: ${missingFields.join(', ')}` });
    }

    try {
        const documentExists = await Document.findOne({ nome, url });
        if (documentExists) {
            return res.status(400).json({ message: 'Nome ou URL já cadastrado' });
        }

        const newDocument = new Document({ nome, url });
        await newDocument.save();

        res.status(201).json({ message: 'Documento cadastrado com sucesso', document: newDocument });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao cadastrar documento', error });
    }
};

// Listar todos os documentos
exports.getDocuments = async (req, res) => {
    try {
        const documents = await Document.find();
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar documentos', error });
    }
};

// Buscar documento por ID
exports.getDocumentById = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) return res.status(404).json({ message: 'Documento não encontrado' });

        res.json(document);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar documento', error });
    }
};

// Atualizar documento
exports.updateDocument = async (req, res) => {
    const { nome, url } = req.body;

    try {
        const document = await Document.findById(req.params.id);
        if (!document) return res.status(404).json({ message: 'Documento não encontrado' });

        // Verifica duplicidade de nome e URL
        const documentExists = await Document.findOne({ nome, url });
        if (documentExists) {
            return res.status(400).json({ message: 'Nome ou URL já cadastrado' });
        }

        document.nome = nome || document.nome;
        document.url = url || document.url;
        document.updatedAt = Date.now();
        await document.save();

        res.json({ message: 'Documento atualizado com sucesso', document });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar documento', error });
    }
};

// Deletar documento
exports.deleteDocument = async (req, res) => {
    try {
        // Encontrar e deletar o documento pelo ID
        const document = await Document.findByIdAndDelete(req.params.id);
        if (!document) {
            return res.status(404).json({ message: 'Documento não encontrado' });
        }

        res.json({ message: 'Documento deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar documento', error });
    }
};