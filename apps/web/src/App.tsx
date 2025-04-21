// apps/web/src/App.tsx
import { useEffect, useState } from "react";
import viteLogo from "/vite.svg";
import reactLogo from "./assets/react.svg";
import "./App.css";

function App() {
	const [count, setCount] = useState(0);
	const [apiMessage, setApiMessage] = useState("Cargando...");

	useEffect(() => {
		// Asegúrate de que la API esté corriendo en http://localhost:3001
		// En un despliegue real, esta URL debería ser una variable de entorno
		fetch("http://localhost:3001/")
			.then((res) => {
				if (!res.ok) {
					throw new Error(`HTTP error! status: ${res.status}`);
				}
				return res.json();
			})
			.then((data) => setApiMessage(data.message))
			.catch((err) => {
				console.error("Error fetching API:", err);
				setApiMessage(`Error al conectar con la API: ${err.message}`);
			});
	}, []);

	return (
		<>
			<div>
				<a href="https://vitejs.dev" target="_blank" rel="noreferrer">
					<img src={viteLogo} className="logo" alt="Vite logo" />
				</a>
				<a href="https://react.dev" target="_blank" rel="noreferrer">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</div>
			<h1>Vite + React</h1>
			<div className="card">
				<button onClick={() => setCount((count) => count + 1)}>
					count is {count}
				</button>
				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</div>
			<p className="read-the-docs">
				Click on the Vite and React logos to learn more
			</p>
			<h2>Mensaje de la App API:</h2>
			<h2 className="border">{apiMessage}</h2>{" "}
			{/* Muestra el mensaje de la API */}
		</>
	);
}

export default App;
