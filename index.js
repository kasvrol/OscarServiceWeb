import express from "express"
import { fazerLogin } from './src/routes.js'

const app = express()

app.use(express.json());

fazerLogin(app)

app.listen(3000, () => {
    console.log('Server started on port 3000');
});