CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    login VARCHAR(15) UNIQUE,
    senha VARCHAR(255),
    token INTEGER
);

CREATE TABLE votos (
    filme INTEGER,
    diretor INTEGER,
    usuarioId INTEGER,
    CONSTRAINT fk_usuario FOREIGN KEY (usuarioId) REFERENCES usuarios(id)
);
