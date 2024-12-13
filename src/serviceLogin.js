import { bd } from "./postgres.js";

const retryConnect = async (maxAttempts = 5, delay = 2000) => {
	let attempt = 0;
	while (attempt < maxAttempts) {
		try {
			const client = await bd.connect();
			return client;
		} catch (err) {
			attempt++;
			console.log(
				`Attempt ${attempt} failed: ${err.message}`
			);
			if (attempt >= maxAttempts) {
				throw new Error(
					"Failed to connect after multiple attempts"
				);
			}
			await new Promise((resolve) =>
				setTimeout(resolve, delay)
			);
		}
	}
};

const gerarNumero = () => {
	const numero = Math.round(Math.random() * (100 - 1)) + 1;
	return numero;
};

const gerarToken = async (id) => {
	let token;
	let tokenExists = true;

	while (tokenExists) {
		token = gerarNumero();

		const result = await bd.query(
			"SELECT token FROM usarios WHERE token = $1",
			[token]
		);

		if (result.rows.length === 0) {
			tokenExists = false;
		}
	}

	await bd.query("UPDATE usarios SET token = $1 WHERE id = $2", [
		token,
		id,
	]);

	return token;
};

const verificarVotacao = async (client, id) => {
	const result = await client.query(
		"SELECT * FROM votos WHERE usuarioid = $1",
		[id]
	);
	return result.rows[0];
};

export const gerarAutenticacao = async (req, res) => {
	const { login, senha } = req.body;

	if (login && senha) {
		const client = await bd.connect();
		try {
			const result = await client.query(
				"SELECT * FROM usarios WHERE login = $1 AND senha = $2",
				[login, senha]
			);

			if (result.rows[0]) {
				if (result.rows[0].token) {
					const consultarVotos =
						await verificarVotacao(
							client,
							result.rows[0].id
						);

					return res.status(200).json({
						usuarioId: result.rows[0].id,
						token: result.rows[0].token,
						votos: consultarVotos ?? {
							filme: null,
							diretor: null,
							usuarioId: null,
						},
					});
				}
				const token = await gerarToken(
					result.rows[0].id
				);

				return res.status(200).json({
					token,
					votos: {
						filme: null,
						diretor: null,
						usuarioId: null,
					},
				});
			} else {
				res.status(401).json({
					error: "Credenciais inválidas",
				});
			}
		} catch (err) {
			console.error(err);
			if (err instanceof Error) {
				res.status(500).json({ error: err.message });
			} else {
				res.status(500).json({
					error: "Erro desconhecido ao processar sua solicitação",
				});
			}
		} finally {
			client.release();
		}
	} else {
		res.status(400).json({ error: "Usuário não cadastrado!" });
	}
};

export const criarVotacao = async (req, res) => {
	const { diretor, filme, usuarioId } = req.body;

	if (diretor && filme && usuarioId) {
		const client = await retryConnect();
		try {
			const jaVotou = await verificarVotacao(
				client,
				usuarioId
			);
			if (jaVotou) {
				return res.status(409).json({
					message: "Usuário já votou!",
				});
			}

			const token = null;
			await client.query(
				"INSERT INTO votos (diretor, filme, usuarioid) VALUES ($1, $2, $3)",
				[diretor, filme, usuarioId]
			);

			await client.query(
				"UPDATE usarios SET token = $1 WHERE id = $2",
				[token, usuarioId]
			);

			res.status(201).json({
				message: "Votação criada com sucesso!",
			});
		} catch (err) {
			if (err instanceof Error) {
				res.status(404).json({
					message: "Usuário não cadastrado!",
				});
			} else {
				res.status(500).json({
					error: "Erro desconhecido ao processar sua solicitação",
				});
			}
		}
	} else {
		res.status(400).json({
			error: "Dados incompletos para criar votação",
		});
	}
};
