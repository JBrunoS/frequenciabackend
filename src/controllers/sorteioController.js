const connection = require('../database/connection')

module.exports = {
    async index(req, res) {
        const {
            id_professor
        } = req.params;

        const nomes = await connection('sorteios')
            .select('*')
            .where({
                'id_professor': id_professor
            })
            .groupBy('nome')
            .orderBy([
                { column: 'nome', order: 'asc' }
            ])


        return res.json(nomes)

    },

    async getPontosPessoa(req, res) {
        const {
            id_professor,
            nome
        } = req.params;

        const nomes = await connection('sorteios')
            .select('id')
            .where({
                'id_professor': id_professor,
                'nome': nome
            })
            .orderBy([
                { column: 'id', order: 'asc' }
            ])

        return res.json(nomes)
    },

    async editStatus(req, res) {
        const {
            id_professor,
            nome
        } = req.params;

        const { novoNome, telefone, endereco, status } = req.body

        await connection('sorteios')
            .where({ id_professor: id_professor, nome: nome })
            .update({
                'nome': novoNome,
                'telefone': telefone,
                'endereco': endereco,
                'status': status,
            })

        return res.json('Status atualizado com sucesso!')
    },

    async getPontos(req, res) {
        const {
            id_professor,
            nome
        } = req.params;

        const nomes = await connection('sorteios')
            .count('id as count')
            .where({
                'id_professor': id_professor,
                'nome': nome
            })
            .orderBy([
                { column: 'id', order: 'asc' }
            ])

        return res.json(nomes)
    },

    async getTotalPontos(req, res) {

        const pontos = await connection('sorteios')
            .count('id as count')
            .whereNot({
                'id_projeto': 3,
            })
            .first()


        return res.json(pontos)
    },

    async getTotalPontosColaborador(req, res) {
        const {
            id_professor
        } = req.params;


        const pontos = await connection('sorteios')
            .count('id as count')
            .where({
                'id_professor': id_professor,
            })
            .first()


        return res.json(pontos)
    },

    async getTotalPontosVendedores(req, res) {
        const { id_projeto, status } = req.params;

        console.log(req.params)

        const professores = await connection('professor')
            .leftJoin('sorteios', 'professor.nome', 'sorteios.nome_professor')
            .select('professor.nome', 'sorteios.*')
            .where({
                'professor.id_projeto': id_projeto,
                'professor.status': status
            })
            .groupBy('sorteios.id_professor')
            .orderBy('professor.nome', 'asc')

        return res.json(professores)
    },

    async createPonto(req, res) {
        const {
            id_projeto,
            id_professor,
            nome_professor,
            dataSorteio,
            meta,
            valorVenda,
            sorteio,
            nome,
            endereco,
            telefone,
            pontos,
            status
        } = req.body;

        const vendidos = []

        console.log(req.body)


        for (let i = 0; i < pontos; i++) {

            const novo = await connection('sorteios')
                .insert({
                    'id_projeto': id_projeto,
                    'id_professor': id_professor,
                    'nome_professor': nome_professor,
                    'data_sorteio': dataSorteio,
                    'meta': meta,
                    'valor_venda': valorVenda,
                    'sorteio': sorteio,
                    'nome': nome,
                    'endereco': endereco,
                    'telefone': telefone,
                    'status': status
                })
                .returning('id')
            vendidos.push(novo)
        }

        return res.json(vendidos)
    }
}