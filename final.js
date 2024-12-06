const express = require('express');
const { nanoid } = require('nanoid');
const redis = require('redis');

const redisClient = redis.createClient({
    url: 'redis://localhost:6379'
});
redisClient.connect();

const app = express();
const port = 3000;

app.use(express.json());

app.get('/create', async (req, res) => {
    const originalUrl = req.query.url;

    if (!originalUrl) {
        return res.status(400).json({ error: 'URL is required' });
    }

    const shortUrl = nanoid(6);

    await redisClient.set(shortUrl, originalUrl);

    res.json({ short_url: `${req.protocol}://${req.get('host')}/${shortUrl}` });
});

app.get('/:shortUrl', async (req, res) => {
    const shortUrl = req.params.shortUrl;

    const originalUrl = await redisClient.get(shortUrl);

    if (originalUrl) {
        res.redirect(originalUrl);
    } else {
        res.status(404).json({ error: 'URL not found' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
