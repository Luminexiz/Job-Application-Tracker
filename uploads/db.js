const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '0702@Sidd',
    database: 'job_tracker'
});

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '0702@Sidd',
    database: 'job_tracker'
}).promise();

connection.connect((err) => {
    if (err) throw err;
    console.log('✅ Connected to MySQL');
});

module.exports = { connection, pool };
