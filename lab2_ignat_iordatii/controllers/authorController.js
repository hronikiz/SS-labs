const authorModel = require('../models/authorModel');
const bookModel = require('../models/bookModel');

// GET /api/authors
const getAllAuthors = (req, res) => {
    res.json(authorModel.getAll());
};

// GET /api/authors/:id
const getAuthorById = (req, res) => {
    const id = Number(req.params.id);
    const author = authorModel.getById(id);

    if (!author) {
        return res.status(404).json({ error: 'Author not found' });
    }
    res.json(author);
};

// GET /api/authors/:id/books
const getBooksByAuthor = (req, res) => {
    const id = Number(req.params.id);
    const author = authorModel.getById(id);

    if (!author) {
        return res.status(404).json({ error: 'Author not found' });
    }

    res.json(bookModel.getByAuthorId(id));
};

module.exports = { getAllAuthors, getAuthorById, getBooksByAuthor };