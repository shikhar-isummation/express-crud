const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = 4000;

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'classicmodels'
};
    
// Create a MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Middleware to parse JSON request body
app.use(express.json());

// GET all offices
app.get('/offices', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM offices');
        connection.release();
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send(`An error occurred \n Error is Below: \n ${error}`);
    }
});

// GET office by officeCode
app.get('/offices/:officeCode', async (req, res) => {
    const officeCode = req.params.officeCode;
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query(`
        SELECT
         *
        FROM
          offices AS o
        RIGHT JOIN
          employees AS e ON o.officeCode = e.officeCode
        WHERE
          o.officeCode = ?;
      `, [officeCode]);
        connection.release();

        if (rows.length === 0) {
            res.status(404).json({ message: 'Office not found' });
        } else {
            res.json(rows);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send(`An error occurred \n Error is Below: \n ${error}`);
    }
});


// POST register office
app.post('/offices', async (req, res) => {
    const { officeCode, addressLine1, addressLine2, city, country, phone, postalCode, state, territory } = req.body;
    try {
        const connection = await pool.getConnection();
        await connection.query(
            'INSERT INTO offices (officeCode, addressLine1, addressLine2, city, country, phone, postalCode, state, territory) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [officeCode, addressLine1, addressLine2, city, country, phone, postalCode, state, territory]
        );
        connection.release();
        res.json({ message: `Office added successfully & OfficeCode is ${officeCode}` });
    } catch (error) {
        console.error(error);
        res.status(500).send(`An error occurred \n Error is Below: \n ${error}`);
    }
});

// DELETE office
app.delete('/offices/:officeCode', async (req, res) => {
    const officeCode = req.params.officeCode;
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.query('DELETE FROM offices WHERE officeCode = ?', [officeCode]);
        connection.release();
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Office not found' });
        } else {
            res.json({ message: 'Office deleted successfully' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send(`An error occurred \n Error is Below: \n ${error}`);
    }
});

// PATCH update office by officeCode
app.patch('/offices/:officeCode', async (req, res) => {
    const officeId = req.params.officeCode;
    const { officeCode, addressLine1, addressLine2, city, country, phone, postalCode, state, territory } = req.body;

    try {
        const connection = await pool.getConnection();
        const [result] = await connection.query(
            'UPDATE offices SET officeCode = ?, addressLine1 = ?, addressLine2 = ?,city = ?, country = ?, phone = ?, postalCode = ?, state = ?, territory = ? WHERE officeCode = ?',
            [officeCode, addressLine1, addressLine2, city, country, phone, postalCode, state, territory, officeId]
        );
        connection.release();

        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Office not found' });
        } else {
            res.json({ message: 'Office updated successfully' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send(`An error occurred \n Error is Below: \n ${error}`);
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Express server running on http://localhost:${port}`);
});
