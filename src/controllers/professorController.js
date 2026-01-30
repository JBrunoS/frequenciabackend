const { status } = require('express/lib/response');
const connection = require('../database/connection')
 
module.exports = {
    async index(request, response) {
        const { id_projeto, status } = request.params;

        console.log(request.params)
 
        const professores = await connection('professor')
            .select('*')
            .where({
                'id_projeto': id_projeto,
                'status': status
            })
            .orderBy('nome', 'asc')
 
        return response.json(professores)
    },

    async getProfessoresAtivos(request, response) {
        const { id_projeto } = request.params;
 
        const professores = await connection('professor')
            .select('*')
            .where({
                'id_projeto': id_projeto,
                'status': 1,
                'funcao': 'Professor(a)'
            })
            .orderBy('nome', 'asc')
 
        return response.json(professores)
    },
 
    async getCoordenador(request, response) {
        const { id_projeto } = request.params;
 
        const user = await connection('professor')
            .select('*')
            .where({
                'id_projeto': id_projeto,
                'funcao': 'Coordenador(a)',
                'status': 1
            })
 
 
        return response.json(user)
    },
 
    async getById(request, response) {
        const { id_professor } = request.params;
 
        const user = await connection('professor')
            .select('*')
            .where({
                'id': id_professor
            })
            .first();
 
        return response.json(user)
    },
 
    async create(request, response) {
        const {
            nome,
            email,
            senha,
            telefone,
            funcao,
            id_projeto
        } = request.body
 
        const professor = await connection('professor')
            .select('*')
            .where({
                'email': email
            })
            .first()
 
        if (professor) {
            return response.json('Esse e-mail já está cadastrado');
        } else {
            const novo = await connection('professor')
                .insert({
                    nome,
                    email,
                    senha,
                    telefone,
                    funcao,
                    id_projeto,
                    status: true
                })
                .returning('nome')
 
            return response.json(novo)
        }
    },
 
    async editProfessor(req, res) {
        const { id_professor } = req.params;
        const {
            nome,
            email,
            telefone,
            senha,
            funcao,
            status } = req.body
 
        await connection('professor')
            .where({ 'id': id_professor })
            .update({
 
                'nome': nome,
                'email': email,
                'telefone': telefone,
                'senha': senha,
                'funcao': funcao,
                'status': status
            })
 
        return res.json('Dados alterados com sucesso!')
    },
 
    async getLogin(req, res) {
        const { email, senha } = req.body
 
        const professor = await connection('professor')
            .select('*')
            .where({
                'email': email,
                'senha': senha
            })
 
        return res.json(professor)
 
    }
}