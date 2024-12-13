import { gerarAutenticacao, criarVotacao } from "./serviceLogin.js";

export const fazerLogin = (app) => {
	app.post("/login", async (req, res) => {
		await gerarAutenticacao(req, res);
	});
};

export const votar = (app) => {
	app.post("/votar", async (req, res) => {
		await criarVotacao(req, res);
	});
};

export const ligandoService = (app) => {
	app.get("/", async (req, res) => {
		res.send("API rodando na porta 3000");
	});
};
