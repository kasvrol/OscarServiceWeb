import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
export const bd = new Pool({
	host: PGHOST,
	database: PGDATABASE,
	user: PGUSER,
	password: PGPASSWORD,
	port: 5432,
});
