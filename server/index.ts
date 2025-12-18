import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.VITE_HOSTINGER_DB_HOST,
    user: process.env.VITE_HOSTINGER_DB_USER,
    password: process.env.VITE_HOSTINGER_DB_PASS,
    database: process.env.VITE_HOSTINGER_DB_NAME,
});

const app = express();
app.use(cors());
app.use(express.json());

// POST /api/learning
app.post('/api/learning', async (req, res) => {
    const { userId, input, output } = req.body;
    if (!userId || !input) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const [result] = await pool.execute(
            'INSERT INTO learning_data (user_id, input_text, output_text) VALUES (?,?,?)',
            [userId, input, output]
        );
        // @ts-ignore – result may have insertId depending on driver version
        res.json({ success: true, id: result.insertId });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET /api/learning/:userId
app.get('/api/learning/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM learning_data WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        // @ts-ignore – rows typing
        res.json(rows);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Database error' });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Learning API listening on port ${PORT}`));
