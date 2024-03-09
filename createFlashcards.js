const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const PDFParser = require('pdf-parse');
const db = require('./config/db.js')

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

// Endpoint to create flashcards based on chapter id 
app.get('/createFlashCards/:id', async (req, res) => {
  const { id } = req.params;
  const pdfPath = `./data/pdfs/chapter${id}.pdf`;

  try {
    // Extract text from the PDF
    const extractedText = await extractTextFromPDF(pdfPath);

    // Send the extracted text as a prompt to ChatGPT
    const prompt = `Task: Iz teksta koji slijedi sastavi bar 10 pitanja i odgovora na njih za flashcards, obuhvati sve bitne teme. Fokusiraj se na pojmove koji se najviše ponavljaju, na podjele i definicije. Napiši u formatu - "Pitanje: Odgovor:". Tekst: ${extractedText}`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: prompt }]
    });

    const answer = completion.choices[0].message.content.trim();

    // Extract questions and answers from the generated answer
    const questionsAndAnswers = [];
    const regex = /Pitanje: (.*?)\s*Odgovor: (.*?)(?=Pitanje: |$)/gs;
    let match;
    while ((match = regex.exec(answer)) !== null) {
      const question = match[1].trim();
      const answer = match[2].trim();
      questionsAndAnswers.push({ question, answer, chapterId: id });
    }

    // Save flashcards to the database
    await db.flashcards.bulkCreate(questionsAndAnswers);

    console.log('Flashcards saved to database successfully.');
    res.status(204).send(); 
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error processing the request.');
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
