const authors = [
    { id: 1, name: 'J. R. R. Tolkien', country: 'United Kingdom' },
    { id: 2, name: 'George Orwell', country: 'United Kingdom' },
    { id: 3, name: 'Robert C. Martin', country: 'United States' },
    { id: 4, name: 'Mario Casciaro', country: 'Italy' }
];

const getAll = () => authors;

const getById = (id) => authors.find((author) => author.id === id);

module.exports = { getAll, getById };