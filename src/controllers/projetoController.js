const connection = require('../database/connection')
 
module.exports = {
    async index(req, res) {
        const projetos = await connection('projetos')
            .select('*')
            .orderBy('codigo_projeto', 'desc')
 
        return res.json(projetos)
    },
 
    async getLogin(req, res) {
        const { email, senha } = req.body;
 
        const projeto = await connection('projetos')
            .select('*')
            .where({
                'email_projeto': email,
                'senha_projeto': senha
            })
 
            if (projeto) {
                return res.json(projeto)
            }else{
                return res.json("Nenhum projeto encontrado com esses dados!")
            }
    },
 
    async create(req, res) {
        const { codigo_projeto, nome_projeto, email_projeto, senha_projeto } = req.body;
 
        const projetos = await connection('projetos')
            .select('*')
            .where({
                'email_projeto': email_projeto
            })
            .first();
 
        if (projetos) {
            return res.json('Já existe um projeto usando esse email, insira um novo!')
        } else {
            const novo = await connection('projetos')
                .insert({
                    codigo_projeto,
                    nome_projeto,
                    email_projeto,
                    senha_projeto
                })
                .returning('id')
 
                return res.json(novo)
        }
    }
}