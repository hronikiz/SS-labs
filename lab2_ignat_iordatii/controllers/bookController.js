const bookModel = require('../models/bookModel');
const authorModel = require('../models/authorModel');

const REQUIRED_FIELDS = ['title', 'authorId', 'genre', 'year'];

const isMissing = (value) =>
    value === undefined || value === null || value === '';

// GET /api/books  (+ фильтры ?genre=...&year=...)
const getAllBooks = (req, res) => {
    const { genre, year } = req.query;
    let result = bookModel.getAll();

    if (genre) {
        result = result.filter(
            (book) => book.genre.toLowerCase() === String(genre).toLowerCase()
        );
    }
    if (year) {
        result = result.filter((book) => book.year === Number(year));
    }

    res.json(result);
};

// GET /api/books/search?title=node   (задание 8.1)
const searchBooks = (req, res) => {
    const title = String(req.query.title || '').trim().toLowerCase();

    if (!title) {
        return res.status(400).json({
            error: 'Query parameter "title" is required'
        });
    }

    const result = bookModel
        .getAll()
        .filter((book) => book.title.toLowerCase().includes(title));

    res.json(result);
};

// GET /api/statistics   (задание 8.2)
const getStatistics = (req, res) => {
    const books = bookModel.getAll();
    const authors = authorModel.getAll();

    const genres = new Set(books.map((book) => book.genre));

    let newestBook = null;
    let oldestBook = null;

    books.forEach((book) => {
        if (!newestBook || book.year > newestBook.year) newestBook = book;
        if (!oldestBook || book.year < oldestBook.year) oldestBook = book;
    });

    res.json({
        totalBooks: books.length,
        totalAuthors: authors.length,
        totalGenres: genres.size,
        newestBook,
        oldestBook
    });
};

// GET /api/books/:id
const getBookById = (req, res) => {
    const id = Number(req.params.id);
    const book = bookModel.getById(id);

    if (!book) {
        return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
};

// POST /api/books
const createBook = (req, res) => {
    const body = req.body || {};

    const missing = REQUIRED_FIELDS.filter((field) => isMissing(body[field]));
    if (missing.length > 0) {
        return res.status(400).json({
            error: `Missing required fields: ${missing.join(', ')}`
        });
    }

    if (!Number.isInteger(body.authorId) || !Number.isInteger(body.year)) {
        return res.status(400).json({
            error: 'authorId and year must be integers'
        });
    }

    // Задание 8.3: автор должен существовать
    if (!authorModel.getById(body.authorId)) {
        return res.status(400).json({ error: 'Author not found' });
    }

    const newBook = bookModel.create(body);
    res.status(201).json(newBook);
};

// PATCH /api/books/:id
const updateBook = (req, res) => {
    const id = Number(req.params.id);
    const body = req.body || {};

    if (!bookModel.getById(id)) {
        return res.status(404).json({ error: 'Book not found' });
    }

    if (Object.keys(body).length === 0) {
        return res.status(400).json({ error: 'Request body is empty' });
    }

    if (
        (body.authorId !== undefined && !Number.isInteger(body.authorId)) ||
        (body.year !== undefined && !Number.isInteger(body.year))
    ) {
        return res.status(400).json({
            error: 'authorId and year must be integers'
        });
    }

    // Если меняется автор, он тоже должен существовать
    if (body.authorId !== undefined && !authorModel.getById(body.authorId)) {
        return res.status(400).json({ error: 'Author not found' });
    }

    const updated = bookModel.update(id, body);
    res.json(updated);
};

// DELETE /api/books/:id
const deleteBook = (req, res) => {
    const id = Number(req.params.id);
    const removed = bookModel.remove(id);

    if (!removed) {
        return res.status(404).json({ error: 'Book not found' });
    }
    res.json({ message: 'Book deleted', book: removed });
};

module.exports = {
    getAllBooks,
    searchBooks,
    getStatistics,
    getBookById,
    createBook,
    updateBook,
    deleteBook
};