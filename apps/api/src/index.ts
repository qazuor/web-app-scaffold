import { serve } from "@hono/node-server";
// apps/api/src/index.ts
import { Hono } from "hono";

const app = new Hono();

// Middleware de logging simple
app.use("*", async (c, next) => {
	console.log(`${c.req.method} ${c.req.url}`);
	await next();
});

// Ruta básica de bienvenida
app.get("/", (c) => {
	return c.json({ message: "Hello from Hono API!" });
});

// Ruta de ejemplo con parámetro
app.get("/hello/:name", (c) => {
	const name = c.req.param("name");
	return c.json({ message: `Hello, ${name}!` });
});

// Ruta de ejemplo POST
app.post("/echo", async (c) => {
	const body = await c.req.json();
	return c.json(body);
});

// Exportar la instancia de Hono (útil para testing)
export default app;

// Para ejecutar directamente en desarrollo
if (process.env.NODE_ENV === "development") {
	const port = 3001; // O la que prefieras
	console.log(`Server is running on http://localhost:${port}`);
	serve({
		fetch: app.fetch,
		port,
	});
}
