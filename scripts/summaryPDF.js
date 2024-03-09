const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const PDFParser = require('pdf-parse');
const router = express.Router();

require('dotenv').config(); 
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.apiKey
});

// Store summaries in an object
const summaries = {};

function extractTextFromPDF(pdfPath) {
  const dataBuffer = fs.readFileSync(pdfPath);
  return PDFParser(dataBuffer).then(pdfData => pdfData.text);
}

// Endpoint to extract text based on ID and send it to ChatGPT
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const pdfPath = `./data/pdfs/chapter${id}.pdf`;

  try {
    // Extract text from the PDF
    const extractedText = await extractTextFromPDF(pdfPath);

    // Send the extracted text as a prompt to ChatGPT
    const prompt = `Zadatak je da pojednostaviš tekst dat u nastavku.\n\nPojednostavi dokument kako bi bio razumljiv osobama s ograničenim znanjem o temi.\n\nOvo je tekst: ${extractedText}`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: prompt }]
    });
    const summary = completion.choices[0].message.content.trim();

    summaries[0] = summary;
    res.send(summary);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error processing the request.');
  }
});

// Endpoint to fetch and translate the summary
router.get('/translate', async (req, res) => {
  const { language } = req.query;

  // Fetch the summary from the variable
  const summary = summaries[0];

  if (!summary) {
    return res.status(404).send('Summary not found');
  }

  // Send the extracted text as a prompt to ChatGPT
  const prompt = `Zadatak je da prevedeš naredni tekst na ${language} jeziku. Ovo je tekst: ${summary}`;
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'system', content: prompt }]
  });
  const translatedSummary = completion.choices[0].message.content.trim();

  res.send(translatedSummary);
});

module.exports = router;