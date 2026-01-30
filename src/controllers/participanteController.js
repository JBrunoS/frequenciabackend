const connection = require('../database/connection')
 
module.exports = {
    async index(req, res) {
        const { id_projeto } = req.params
 
        const participantes = await connection('participantes')
            .select('*')
            .where({
                'id_projeto': id_projeto,
                'status': 1
            })
            .orderBy([{column: 'faixa', order: 'asc'}, {column: 'nome', order: 'asc'}])
 
        return res.json(participantes)
    },

    async editaSaldoParticipante(req, res) {
        const {
            frequencia,
            participantes,
            valor
        } = req.body

        for (let i = 0; i < frequencia.length; i++) {
            await connection('participantes')
                .where({
                    'id': frequencia[i]
                })
                .increment({
                    'saldo': valor
                })
        }

        return res.json('Dados cadastrados com sucesso!')
    },

    async descontaPapagaio(req, res){
       const { id, valor} = req.body
       console.log(req.body)

       await connection('participantes')
           .whrere({
                'id': id
           })
           .decrement({
               'saldo': valor
           })

       return res.json('Valor descontado do saldo do participante')
    },
   
   
    async getApp(req, res) {
        const { id_projeto } = req.params
 
        const participantes = await connection('participantes')
            .select('*')
            .where({
                'id_projeto': id_projeto,
                'status': 1
            })
            .orderBy([{column: 'nome', order: 'asc'}])
 
        return res.json(participantes)
    },
 
    async getTotal(req, res){
        const { id_projeto } = req.params
 
        const participantes = await connection('participantes')
            .count('id as count')
            .where({
                'id_projeto': id_projeto,
                'status': 1
            })
 
        return res.json(participantes)
    },
 
    async getById(req, res){
        const { id_user } =req.params;
 
        const user = await connection('participantes')
        .select('*')
        .where({
            'id': id_user
        })
        .first();
 
        return res.json(user)
    },
   
    async create(req, res) {
 
        const {
            br,
            nome,
            dia_nascimento,
            mes_nascimento,
            ano_nascimento,
            faixa,
            tipo_programa,
            id_projeto } = req.body
 
 
        const participante = await connection('participantes')
            .select('*')
            .where({
                'br': br,
                'id_projeto': id_projeto
            })
            .first();
 
        if (participante) {
            return res.json("Participante jÃ¡ cadastrado no sistema")
        } else {
            const novo = await connection('participantes')
                .insert({
                    br,
                    nome,
                    dia_nascimento,
                    mes_nascimento,
                    ano_nascimento,
                    status: true,
                    faixa,
                    tipo_programa,
                    id_projeto
                })
                .returning('br')
 
                return res.json(novo)
        }
    },
 
    async getByFaixa(req, res){
        const { faixa, id_projeto } = req.params;
 
 
        const participantes = await connection('participantes')
        .select('*')
        .where({
            'faixa': faixa,
            'id_projeto': id_projeto,
            'status': true
        })
        .orderBy('nome', 'asc')
 
        return res.json(participantes)
    },
 
    async getByAtendimentoProjeto(req, res){
        const { faixa, id_projeto, tipo_programa } = req.params;
 
 
        const participantes = await connection('participantes')
        .select('*')
        .where({
            'faixa': faixa,
            'id_projeto': id_projeto,
            'tipo_programa': tipo_programa
        })
        .orderBy('nome', 'asc')
 
        return res.json(participantes)
    },
   
    async getByAtendimentoLar(req, res){
        const {id_projeto, tipo_programa } = req.params;
 
 
        const participantes = await connection('participantes')
        .select('*')
        .where({
            'id_projeto': id_projeto,
            'tipo_programa': tipo_programa
        })
        .orderBy('nome', 'asc')
 
        return res.json(participantes)
    },
 
    async editParticipante(req, res){
        const { id } = req.params;
        const {
            br,
            nome,
            dia_nascimento,
            mes_nascimento,
            ano_nascimento,
            status,
            faixa,
            tipo_programa,
            id_projeto } = req.body
 
        await connection('participantes')
        .where({'id': id})
        .update({
            'br': br,
            'nome': nome,
            'dia_nascimento': dia_nascimento,
            'mes_nascimento': mes_nascimento,
            'ano_nascimento': ano_nascimento,
            'status': status,
            'faixa': faixa,
            'tipo_programa': tipo_programa,
            'id_projeto': id_projeto
        })
 
        return res.json('Dados alterados com sucesso!')
    },

    async updateFaixa(req, res){
        const {id_user, id_projeto, faixa} = req.params

        await connection('participantes')
        .where({'id': id_user, 'id_projeto': id_projeto})
        .update({
            'faixa': faixa
        })

        return res.json('Grupo etário alterado!')
    }
}