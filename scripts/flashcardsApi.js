const express = require('express');
const bodyParser = require('body-parser');
const db = require('../config/db.js');
const fs = require('fs');
const PDFParser = require('pdf-parse');
const router = express.Router();
require('dotenv').config(); 
const OpenAI = require("openai");
const openai = new OpenAI({
    apiKey: process.env.apiKey
});

router.get('/:student_id', (req, res) => {
    const studentId = +req.params.student_id;

    db.students.findByPk(studentId, { include: 'studentFlashcards' }).then((student) => {
        if (student) {
            const studentFlashcards = student.studentFlashcards.map(async (studentFlashcard) => {
                if (!studentFlashcard.studentKnewAnswer) {
                    const flashcard = await db.flashcards.findByPk(studentFlashcard.FlashCardId);
                    if (flashcard) {
                        return {
                            id: flashcard.id,
                            question: flashcard.question,
                            answer: flashcard.answer,
                            chapterId: flashcard.chapterId
                        };
                    }
                }
            });
            Promise.all(studentFlashcards).then((unlearnedFlashcards) => {
                const filteredUnlearnedFlashcards = unlearnedFlashcards.filter(flashcard => flashcard);
                res.status(200).json({
                    unlearnedFlashcards: filteredUnlearnedFlashcards
                });
            });
        } else {
            res.status(400).json({ greska: `Student with id ${studentId} does not exist` });
        }
    }).catch((error) => {
        console.error('Error:', error);
        res.status(500).json({ greska: 'Internal Server Error' });
    });
});

router.put('/:id', (req, res) => {
    const id = +req.params.id;

    const { studentKnewAnswer } = req.body;
    var flashcard;
    db.studentsflashcards.findOne({
        where: { flashcardId: id }
    }).then((existingFlashcard) => {
        if (!existingFlashcard) {
            res.status(401).json({ error: 'No flashcard' });
            return Promise.reject('No flashcard');
        }
        flashcard = existingFlashcard;
        flashcard.studentKnewAnswer = studentKnewAnswer;

        return Promise.resolve();
    }).then(() => {
        return flashcard.save();
    }).then(() => {
        res.status(200).json({ mess: 'Success' });
    }).catch((error) => {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    });
});


router.put('/reset/:student_id', (req, res) => {
    const studentId = +req.params.student_id;

    db.students.findByPk(studentId, { include: 'studentFlashcards' })
        .then((student) => {
            if (student) {
                const promises = [];
                student.studentFlashcards.forEach((studentFlashcard) => {
                    if (studentFlashcard.studentKnewAnswer) studentFlashcard.studentKnewAnswer = false;
                    promises.push(studentFlashcard.save());
                });

                return Promise.all(promises);
            } else {
                res.status(400).json({ error: `Student with id ${studentId} does not exist` });
                return Promise.reject(`Student with id ${studentId} does not exist`);
            }
        })
        .then(() => {
            res.status(200).json({ message: 'Success' });
        })
        .catch((error) => {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});
  
function extractTextFromPDF(pdfPath) {
const dataBuffer = fs.readFileSync(pdfPath);
return PDFParser(dataBuffer).then(pdfData => pdfData.text);
}
  
// Endpoint to create flashcards based on chapter id 
router.get('/create/:chapter_id', async (req, res) => {
const { chapter_id } = req.params;
const pdfPath = `./data/pdfs/chapter${chapter_id}.pdf`;

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
    questionsAndAnswers.push({ question, answer, chapterId: chapter_id });
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

module.exports = router;