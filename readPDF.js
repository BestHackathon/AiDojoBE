const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const PDFParser = require('pdf-parse');

const app = express();
app.use(bodyParser.json());

function extractTextFromPDF(pdfPath) {
  const dataBuffer = fs.readFileSync(pdfPath);
  return PDFParser(dataBuffer).then(pdfData => pdfData.text);
}

app.post('/extract-text', (req, res) => {
  const { chapterid } = req.query;
  const pdfPath = `./data/pdfs/chapter${chapterid}.pdf`;
  
  extractTextFromPDF(pdfPath)
    .then(extractedText => {
      res.send(extractedText);
    })
    .catch(error => {
      console.error('Error:', error);
      res.status(500).send('Error extracting text from PDF.');
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
