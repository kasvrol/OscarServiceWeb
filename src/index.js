import express from "express";
import { fazerLogin, votar, ligandoService } from "./routes.js";

const app = express();

app.use(express.json());

ligandoService(app);
fazerLogin(app);
votar(app);

app.listen(3000, () => {
	console.log("Server started on port 3000");
});
