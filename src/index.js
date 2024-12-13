import express from "express"
import { fazerLogin } from './routes.js'

const app = express()

app.use(express.json());

app.get('/', async (req, res) => {res.send('hello word')})
fazerLogin(app)

app.listen(3000, () => {
    console.log('Server started on port 3000');
});