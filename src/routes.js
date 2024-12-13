import {gerarToken} from "./serviceLogin.js"

export const fazerLogin = (app)=>{
    app.post('/login', async (req, res) => {await gerarToken(req, res)})
}