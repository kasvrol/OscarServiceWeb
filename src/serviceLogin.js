import { bd } from './postgres.js'

const gerarNumero = () => {
    const numero = Math.round(Math.random() * (100 - 1)) + 1;
    return numero;
}

export const gerarAutenticacao = async (req, res) => {
    const { email, senha } = req.body;

    if (email && senha) {
        const client = await bd.connect();
        try {
            // Verificar se o usuário existe
            const result = await client.query('SELECT * FROM usuarios WHERE email = $1 AND senha = $2', [email, senha]);

            if (result.rows[0]) {
                if (result.rows[0].token) {
                    return res.status(200).json({ token: result.rows[0].token });
                }

                const token = await gerarToken(result.rows[0].id);

                return res.status(200).json({ token });
            } else {
                res.status(401).json({ error: 'Credenciais inválidas' });
            }
        } catch (err) {
            console.error(err);
            if (err instanceof Error) {
                res.status(500).json({ error: err.message }); 
            } else {
                res.status(500).json({ error: 'Erro desconhecido ao processar sua solicitação' });
            }
        } finally {
            client.release(); // Liberar o client após o uso
        }
    } else {
        res.status(400).json({ error: 'Usuário não cadastrado!' });
    }
};

export const gerarToken = async (id) => {
    let token;
    let tokenExists = true;
    
    while (tokenExists) {
        token = gerarNumero();
        
        const result = await bd.query('SELECT token FROM usarios WHERE token = $1', [token]);
        
        if (result.rows.length === 0) {
            tokenExists = false;
        }
    }

    await bd.query('UPDATE usarios SET token = $1 WHERE id = $2', [token, id]);

    return token;
}

// export const gerarAutenticacao = async (req, res) => {
//     const { email, senha } = req.body;

//     if (email && senha) {
//         try {
//             // Verificar se o usuário existe
//             const result = await bd.query('SELECT * FROM usarios WHERE email = $1 AND senha = $2', [email, senha]);

//             if (result.rows[0]) {
//                 // Verificar se o usuário já tem um token
//                 if (result.rows[0].token) {
//                     return res.status(200).json({ token: result.rows[0].token });
//                 }

//                 // Caso o usuário não tenha token, gerar um novo
//                 const token = await gerarToken(result.rows[0].id);

//                 return res.status(200).json({ token });
//             } else {
//                 res.status(401).json({ error: 'Credenciais inválidas' });
//             }
//         } catch (err) {
//             console.error(err);
//             res.status(500).json({ error: 'Erro ao processar sua solicitação' });
//         } finally {
//             bd.release();
//         }
//     } else {
//         res.status(400).json({ error: 'Usuário não cadastrado!' });
//     }
// }

export const criarVotacao = async (req, res) => {
    const { diretor, filme, token } = req.body;

    if (diretor && filme && token) {
        try {
            // Inserir a votação no banco de dados
            await bd.query('INSERT INTO votos (diretor, filme, token) VALUES ($1, $2, $3)', [diretor, filme, token]);
            
            res.status(201).json({ message: 'Votação criada com sucesso!' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro ao criar votação' });
        }
    } else {
        res.status(400).json({ error: 'Dados incompletos para criar votação' });
    }
}
