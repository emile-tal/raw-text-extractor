import * as cheerio from 'cheerio';

import Tesseract from 'tesseract.js';
import axios from 'axios';
import express from 'express';
import fs from 'fs';
import { default as pdfParse } from 'pdf-parse/lib/pdf-parse.js';

// Initialize the Express app
const app = express();
app.use(express.json());

// Endpoint for PDF text extraction
app.post('/extract-pdf', async (req, res) => {
    try {
        const { filePath } = req.body;

        // Resolve the absolute file path based on the current directory
        const resolvedPath = path.resolve(__dirname, filePath);

        // Check if the file exists
        if (!fs.existsSync(resolvedPath)) {
            return res.status(400).json({ error: 'File not found' });
        }

        const data = await fs.promises.readFile(resolvedPath);
        const pdfData = await pdfParse(data);
        res.json({ rawText: pdfData.text });
    } catch (error) {
        res.status(500).json({ error: 'Failed to extract text from PDF' });
    }
});

// Endpoint for Image text extraction (OCR)
app.post('/extract-image', async (req, res) => {
    try {
        const { imagePath } = req.body; // Image file path
        const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', { logger: (m) => console.log(m) });
        res.json({ rawText: text });
    } catch (error) {
        res.status(500).json({ error: 'Failed to extract text from image' });
    }
});

// Endpoint for Website text extraction (Scraping)
app.post('/extract-website', async (req, res) => {
    try {
        const { url } = req.body; // Website URL
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Extracting a simple title and recipe description (adjust as needed)
        // const title = $('h1').text();
        // const description = $('p.description').text();
        // const rawText = `Title: ${title}\nDescription: ${description}`;

        const rawText = $('body').text();

        res.json({ rawText });
    } catch (error) {
        res.status(500).json({ error: 'Failed to extract text from website' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Microservice running on port ${PORT}`);
});