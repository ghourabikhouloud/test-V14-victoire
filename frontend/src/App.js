import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
	const [questions, setQuestions] = useState([]);
	const [current, setCurrent] = useState(0);
	const [selected, setSelected] = useState(null);
	const [result, setResult] = useState(null);
	const [score, setScore] = useState(0);

	useEffect(() => {
		fetch("http://localhost:4000/api/questions")
			.then(res => res.json())
			.then(setQuestions);
	}, []);

	const handleOption = idx => {
		setSelected(idx);
	};

	const handleSubmit = () => {
		fetch("http://localhost:4000/api/validate", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id: questions[current].id, answer: selected })
		})
			.then(res => res.json())
			.then(data => {
				setResult(data.correct);
				if (data.correct) setScore(s => s + 1);
			});
	};

	const handleNext = () => {
		setCurrent(c => c + 1);
		setSelected(null);
		setResult(null);
	};

	if (questions.length === 0) return <div className="loader">Chargement...</div>;

	if (current >= questions.length)
		return (
			<div className="score">
				<h2>Quiz terminé !</h2>
				<p>Votre score : {score} / {questions.length}</p>
			</div>
		);

	const q = questions[current];

	return (
		<div className="container">
			<h1>Quiz Moderne</h1>
			<div className="question">
				<h2>{q.text}</h2>
				<ul>
					{q.options.map((opt, idx) => (
						<li key={idx} className={selected === idx ? "selected" : ""} onClick={() => handleOption(idx)}>
							{opt}
						</li>
					))}
				</ul>
				{result === null ? (
					<button disabled={selected === null} onClick={handleSubmit} className="btn">Valider</button>
				) : (
					<div className={result ? "correct" : "incorrect"}>
						{result ? "Bonne réponse !" : "Mauvaise réponse."}
						<button onClick={handleNext} className="btn">Suivant</button>
					</div>
				)}
			</div>
		</div>
	);
}

export default App;