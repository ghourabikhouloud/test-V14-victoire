import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";
import { readFileSync } from "fs";

const app = express();
const db = new sqlite3.Database("./quiz.db");
app.use(cors());
app.use(express.json());

// Init DB
const schema = readFileSync("./schema.sql", "utf-8");
db.exec(schema);

// Seed questions if empty
function seedQuestions() {
	db.get("SELECT COUNT(*) as count FROM questions", (err, row) => {
		if (row.count === 0) {
			const questions = [
				{
					text: "Quelle est la capitale de la France?",
					options: JSON.stringify(["Paris", "Lyon", "Marseille", "Toulouse"]),
					answer: 0
				},
				{
					text: "Combien font 2 + 2?",
					options: JSON.stringify(["3", "4", "5", "6"]),
					answer: 1
				}
			];
			questions.forEach(q => {
				db.run("INSERT INTO questions (text, options, answer) VALUES (?, ?, ?)", [q.text, q.options, q.answer]);
			});
		}
	});
}
seedQuestions();

// API routes
app.get("/api/questions", (req, res) => {
	db.all("SELECT id, text, options FROM questions", (err, rows) => {
		if (err) return res.status(500).json({ error: err.message });
		const questions = rows.map(q => ({
			id: q.id,
			text: q.text,
			options: JSON.parse(q.options)
		}));
		res.json(questions);
	});
});

app.post("/api/validate", (req, res) => {
	const { id, answer } = req.body;
	db.get("SELECT answer FROM questions WHERE id = ?", [id], (err, row) => {
		if (err || !row) return res.status(404).json({ correct: false });
		res.json({ correct: row.answer === answer });
	});
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`Backend running on port ${PORT}`);
});