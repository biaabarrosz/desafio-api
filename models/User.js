const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    nome: { type: String, required: true, maxlength: 50 },
    dataNascimento: { type: String, required: true },
    email: { type: String, required: true, maxlength: 50, unique: true },
    senha: { type: String, required: true, minlength: 6, maxlength: 100 }, // Alterado para 100 caracteres
    documentos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Criptografar senha antes de salvar
userSchema.pre('save', async function (next) {
    if (!this.isModified('senha')) return next();
    this.senha = await bcrypt.hash(this.senha, 10);
    next();
});

module.exports = mongoose.model('User', userSchema);
