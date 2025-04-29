import Tesseract from 'tesseract.js';
import cors from 'cors';
import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(cors());

// API Endpoint for PDF Upload
app.post('/upload-pdf', upload.single('file'), async (req, res) => {
    try {
        const dataBuffer = req.file.buffer;
        const pdfData = await pdfParse(dataBuffer);
        res.json({ rawText: pdfData.text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to extract text from uploaded PDF' });
    }
});

// API Endpoint for Image Upload
app.post('/upload-image', upload.single('file'), async (req, res) => {
    try {
        const { data: { text } } = await Tesseract.recognize(req.file.buffer, 'eng');
        res.json({ rawText: text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to extract text from uploaded image' });
    }
});

// API Endpoint to confirm server is running
app.get('/', (_req, res) => {
    res.send('Raw Text Extractor is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Microservice running on port ${PORT}`);
});
