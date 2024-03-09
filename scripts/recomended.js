const express = require('express');
const PDFParser = require('pdf-parse');
const fs = require('fs');
const router = express.Router();

require('dotenv').config(); 
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.apiKey
});

function extractTextFromPDF(pdfPath) {
    const dataBuffer = fs.readFileSync(pdfPath);
    return PDFParser(dataBuffer).then(pdfData => pdfData.text);
}

router.get('/:chapter_id', async (req,res) => {
    const {chapter_id} = req.params;
    const pdfPath = `./data/pdfs/chapter${chapter_id}.pdf`;

    try{

    const pdfText = await extractTextFromPDF(pdfPath);

    const prompt = `Zadatak je da mi navedeš naslove i autore od tri literature koje su kontekstom bliske, sa sljedećim tekstom: ${pdfText}.\n Za svaku litareturu navedi ih json formatu. Litareture moraju biti napisane na istom jeziku kao tekst koji sam ti poslao. Primjer kako bi trebao izgledat json file je: [
        {
            "naziv_literature": "neki naziv litareture",
            "autor": " autori..."
        },
        {
            "naziv_literature": "neki naziv litareture",
            "autor": " autori..."
        },
        {
            "naziv_literature": "neki naziv litareture",
            "autor": " autori..."
        }
    ]`;
    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: prompt }]
    });
    const litaretures = completion.choices[0].message.content.trim();
    res.status(200).json(JSON.parse(litaretures));
    }
    catch(error){
        res.status(500).json({ error: error});
    }
});

module.exports = router;