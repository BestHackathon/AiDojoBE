const express = require('express');
const bodyParser = require('body-parser');
const db = require('./config/db.js')

const app = express();

app.use(bodyParser.json());

app.get('/flashcards/:id', (req, res) => {
    const studentId = +req.params.id;

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

app.put('/flashcard/:id', (req, res) => {
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
        flashcard.studentKnewAnswer = studentKnewAnswer

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


app.put('/flashcards/reset/:id', (req, res) => {
    const studentId = +req.params.id;

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

app.listen(3000, () => {
    console.log(`Server is running`);
});