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

// --- TRENDS API ---
import { trendManager } from './services/trends/TrendManager';

// GET /api/trends/daily?geo=BR
app.get('/api/trends/daily', async (req, res) => {
    const geo = (req.query.geo as string) || 'BR';
    try {
        const trends = await trendManager.getDailyTrends(geo);
        res.json(trends);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch daily trends' });
    }
});

// POST /api/trends/interest
app.post('/api/trends/interest', async (req, res) => {
    const { keyword, geo, timeframe } = req.body;
    if (!keyword) return res.status(400).json({ error: 'Keyword required' });

    try {
        const result = await trendManager.getInterestOverTime(keyword, geo, timeframe);
        res.json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch interest data' });
    }
});

// --- AGENT API (Replaces N8N) ---
import { agentRouter } from './services/agent_service';
app.use('/api/agent', agentRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Learning API listening on port ${PORT}`));
