const books = [
    { id: 1, title: 'The Hobbit', authorId: 1, genre: 'fantasy', year: 1937 },
    { id: 2, title: '1984', authorId: 2, genre: 'dystopia', year: 1949 },
    { id: 3, title: 'Animal Farm', authorId: 2, genre: 'satire', year: 1945 },
    { id: 4, title: 'The Lord of the Rings', authorId: 1, genre: 'fantasy', year: 1954 },
    { id: 5, title: 'Clean Architecture', authorId: 3, genre: 'programming', year: 2017 },
    { id: 6, title: 'Node.js Design Patterns', authorId: 4, genre: 'programming', year: 2016 }
];

let nextId = 7;

const getAll = () => books;

const getById = (id) => books.find((book) => book.id === id);

const getByAuthorId = (authorId) =>
    books.filter((book) => book.authorId === authorId);

const create = ({ title, authorId, genre, year }) => {
    const newBook = { id: nextId++, title, authorId, genre, year };
    books.push(newBook);
    return newBook;
};

const update = (id, data) => {
    const book = getById(id);
    if (!book) return null;

    const allowed = ['title', 'authorId', 'genre', 'year'];
    allowed.forEach((field) => {
        if (data[field] !== undefined) {
            book[field] = data[field];
        }
    });
    return book;
};

const remove = (id) => {
    const index = books.findIndex((book) => book.id === id);
    if (index === -1) return null;
    return books.splice(index, 1)[0];
};

module.exports = { getAll, getById, getByAuthorId, create, update, remove };