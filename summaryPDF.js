const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const PDFParser = require('pdf-parse');

require('dotenv').config(); 
const OpenAI = require("openai");

const app = express();
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.apiKey
});


function extractTextFromPDF(pdfPath) {
  const dataBuffer = fs.readFileSync(pdfPath);
  return PDFParser(dataBuffer).then(pdfData => pdfData.text);
}

// Endpoint to extract text based on ID and send it to ChatGPT
app.get('/summary/:id', async (req, res) => {
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

    res.send(completion.choices[0].message.content.trim());
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error processing the request.');
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
