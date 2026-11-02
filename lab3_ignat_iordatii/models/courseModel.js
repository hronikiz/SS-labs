const courses = [
    {
        id: 1,
        title: 'Server-side Programming',
        teacher: 'Ivan Ivanov',
        credits: 5,
        semester: 1,
        description: 'Development of server-side applications using Node.js'
    },
    {
        id: 2,
        title: 'Databases',
        teacher: 'Maria Popescu',
        credits: 6,
        semester: 2,
        description: 'Relational databases, SQL and database design'
    },
    {
        id: 3,
        title: 'Web Design',
        teacher: 'Elena Rusu',
        credits: 4,
        semester: 2,
        description: 'HTML, CSS and principles of responsive web design'
    },
    {
        id: 4,
        title: 'Algorithms and Data Structures',
        teacher: 'Ivan Petrov',
        credits: 6,
        semester: 1,
        description: 'Basic data structures and algorithm complexity analysis'
    },
    {
        id: 5,
        title: 'Cloud Computing',
        teacher: 'Victor Munteanu',
        credits: 5,
        semester: 3,
        description: 'Virtualization and cloud services overview'
    },
    {
        id: 6,
        title: 'Node.js Web Development',
        teacher: 'Dmitri Rusu',
        credits: 5,
        semester: 3,
        description: 'Building web applications with Express.js and EJS'
    }
];

let nextId = 7;

const findAll = ({ search, semester } = {}) => {
    let result = courses;

    if (search) {
        const query = String(search).trim().toLowerCase();
        result = result.filter(
            (course) =>
                course.title.toLowerCase().includes(query) ||
                course.teacher.toLowerCase().includes(query)
        );
    }

    if (semester) {
        result = result.filter((course) => course.semester === Number(semester));
    }

    return result;
};

const getById = (id) => courses.find((course) => course.id === id);

const create = ({ title, teacher, credits, semester, description }) => {
    const newCourse = {
        id: nextId++,
        title,
        teacher,
        credits,
        semester,
        description
    };
    courses.push(newCourse);
    return newCourse;
};

const update = (id, { title, teacher, credits, semester, description }) => {
    const course = getById(id);
    if (!course) return null;

    course.title = title;
    course.teacher = teacher;
    course.credits = credits;
    course.semester = semester;
    course.description = description;
    return course;
};

const remove = (id) => {
    const index = courses.findIndex((course) => course.id === id);
    if (index === -1) return null;
    return courses.splice(index, 1)[0];
};

module.exports = { findAll, getById, create, update, remove };