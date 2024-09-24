const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    nome: { type: String, required: true, maxlength: 50, unique: true },
    url: { type: String, required: true, maxlength: 200, unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', documentSchema);
