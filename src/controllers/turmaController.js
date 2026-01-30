const connection = require('../database/connection')

module.exports = {
    async index(req, res) {
        const { id_projeto, ano_turma } = req.params;

        const turmas = await connection('turmas')
            .innerJoin('participantes', 'turmas.id_participante', 'participantes.id')
            .select('turmas.nome')
            .where({
                'turmas.id_projeto': id_projeto,
                'ano_turma': ano_turma
            })
            .orderBy([
                { column: 'participantes.faixa', order: 'asc' },
                { column: 'turmas.nome', order: 'asc' }
            ])
            .groupBy('turmas.nome')

        return res.json(turmas)

    },

    async getTotalTurmas(req, res) {
        const { id_projeto } = req.params;
        

        const turmas = await connection('turmas')
            .innerJoin('participantes', 'turmas.id_participante', 'participantes.id')
            .select('turmas.nome')
            .where({
                'turmas.id_projeto': id_projeto,
                'ano_turma': '2025'
            })

            .groupBy('turmas.nome')


        return res.json(turmas)

    },

    async alterTurno(req, res) {
        const { nome_turma, id_projeto, id_participante, turno } = req.body

        await connection('turmas')
            .where({
                'nome': nome_turma,
                'id_projeto': id_projeto,
                'id_participante': id_participante
            })
            .update({
                'turno': turno
            })

        return res.json('Dados alterados com sucesso')
    },

    async getParticipanteSemTurmaProjeto(req, res) {
        const { id_projeto, nome_turma, faixa, tipo_programa } = req.params;

        const turmas = await connection('participantes')
            .select('*')
            .where('participantes.faixa', '=', faixa)
            .where('participantes.tipo_programa', '=', tipo_programa)
            .where('participantes.id_projeto', '=', id_projeto)
            .whereNotExists(function () {
                this.select('*')
                    .from('turmas')
                    .whereRaw('turmas.id_participante = participantes.id')
                    .andWhere('turmas.nome', '=', nome_turma)
                    .andWhere('turmas.id_projeto', '=', id_projeto)
            })


        return res.json(turmas)

    },

    async getParticipanteSemTurmaLar(req, res) {
        const { id_projeto, nome_turma, tipo_programa } = req.params;

        console.log(tipo_programa)

        const turmas = await connection('participantes')
            .select('*')
            .where('participantes.tipo_programa', '=', tipo_programa)
            .where('participantes.id_projeto', '=', id_projeto)
            .whereNotExists(function () {
                this.select('*')
                    .from('turmas')
                    .whereRaw('turmas.id_participante = participantes.id')
                    .andWhere('turmas.nome', '=', nome_turma)
                    .andWhere('turmas.id_projeto', '=', id_projeto)
            })


        return res.json(turmas)

    },

    async getTurmaByNameTurno(req, res) {
        const { id_projeto, nome_turma, turno_turma } = req.params;

        const turmas = await connection('turmas')
            .innerJoin('participantes', 'turmas.id_participante', 'participantes.id')
            .innerJoin('professor', 'turmas.id_professor', 'professor.id')
            .select(
                'turmas.nome as nome_turma',
                'turmas.descricao',
                'turmas.id as id_turma',
                'turmas.id_coordenador',
                'turmas.id_professor',
                'turmas.turno',
                'turmas.dias',
                'turmas.hora',
                'participantes.nome',
                'participantes.br',
                'participantes.faixa',
                'participantes.tipo_programa',
                'participantes.mes_nascimento',
                'participantes.ano_nascimento',
                'participantes.id as id_participante',
                'professor.nome as nome_professor')
            .where({
                'turmas.id_projeto': id_projeto,
                'turmas.nome': nome_turma,
                'turmas.turno': turno_turma
            })

            .orderBy('participantes.nome', 'asc')


        return res.json(turmas)

    },

    async getTurmaByNameSementinha(req, res) {
        const { id_projeto, nome_turma, turno_turma } = req.params;

        const data = new Date()

        const ano = data.getFullYear()
        const mes = data.getMonth() + 1;

        const turmas = await connection('participantes')
            .innerJoin('turmas', 'participantes.id', 'turmas.id_participante')
            .select('participantes.id as id_participante', 'participantes.nome', 'participantes.br')
            .count('participantes.id as count')
            .where({
                'turmas.id_projeto': id_projeto,
                'turmas.nome': nome_turma,
                'turmas.turno': turno_turma

            })
            .whereNotExists(function () {
                this.select('*')
                    .from('frequencia')
                    .whereRaw('frequencia.id_participante = participantes.id')
                    .andWhere('frequencia.nome_turma', '=', nome_turma)
                    .andWhere('frequencia.mes', '=', mes)
                    .andWhere('frequencia.ano', '=', ano)
                    .groupBy('frequencia.id', 'participantes.id')

            })
            .orderBy('participantes.nome', 'asc')
            .groupBy('participantes.id', 'turmas.id')



        const contagem = await connection('frequencia')
            .leftJoin('participantes', 'frequencia.id_participante', 'participantes.id')
            .select('frequencia.id_participante', 'participantes.nome', 'participantes.br')
            .count('id_participante as count')
            .where({
                'frequencia.id_projeto': id_projeto,
                'frequencia.mes': mes,
                'frequencia.ano': ano,
                'nome_turma': nome_turma,
                'turno_turma': turno_turma

            })
            .orderBy('participantes.nome', 'asc')
            .groupBy('id_participante', 'participantes.id')

        return res.json([contagem, turmas])

    },

    async getTurmaByNameAll(req, res) {
        const { id_projeto, nome_turma } = req.params;

        const turmas = await connection('turmas')
            .innerJoin('participantes', 'turmas.id_participante', 'participantes.id')
            .innerJoin('professor', 'turmas.id_professor', 'professor.id')
            .select(
                'turmas.nome as nome_turma',
                'turmas.descricao',
                'turmas.id as id_turma',
                'turmas.id_coordenador',
                'turmas.id_professor',
                'turmas.turno',
                'turmas.dias',
                'turmas.hora',
                'turmas.ano_turma',
                'participantes.nome',
                'participantes.br',
                'participantes.faixa',
                'participantes.tipo_programa',
                'participantes.mes_nascimento',
                'participantes.ano_nascimento',
                'participantes.id as id_participante',
                'professor.nome as nome_professor')
            .where({
                'turmas.id_projeto': id_projeto,
                'turmas.nome': nome_turma,
            })

            .orderBy('id_participante', 'asc')


        return res.json(turmas)

    },

    async getTurmaByProfessor(req, res) {
        const { id_professor, id_projeto } = req.params
        var arrayTurma = []

        const turmas = await connection('turmas')
            .distinct('nome', 'descricao')
            .where({
                'id_professor': parseInt(id_professor),
                'id_projeto': parseInt(id_projeto)
            })
            .orderBy('nome', 'asc')



        for (let i = 0; i < turmas.length; i++) {


            const contador = await connection('turmas')
                .count('id_professor as count')
                .where({
                    'id_professor': parseInt(id_professor),
                    'id_projeto': parseInt(id_projeto),
                    'nome': turmas[i].nome
                })
                .first()

            arrayTurma.push([turmas[i], contador])


        }
        // const obj = Object.fromEntries(arrayTurma)

        return res.json(arrayTurma)
    },

    async getCountManha(req, res) {
        const { nome_turma, id_projeto } = req.params

        const manha = await connection('turmas')
            .count('nome as count')
            .where({
                'turno': 'manha',
                'nome': nome_turma,
                'id_projeto': id_projeto
            })
            .first()

        return res.json(manha)
    },

    async getCountTarde(req, res) {
        const { nome_turma, id_projeto } = req.params

        const tarde = await connection('turmas')
            .count('nome as count')
            .where({
                'turno': 'tarde',
                'nome': nome_turma,
                'id_projeto': id_projeto
            })
            .first()

        return res.json(tarde)
    },

    async adicionaParticipanteSemTurma(req, res) {
        const {
            id_projeto,
            coordenador,
            nome,
            descricao,
            professor,
            manha,
            dias,
            hora,
            ano_turma
        } = req.body;

        for (let i = 0; i < manha.length; i++) {

            await connection('turmas')
                .insert({
                    'nome': nome,
                    'descricao': descricao,
                    'id_professor': parseInt(professor),
                    'id_coordenador': parseInt(coordenador),
                    'id_participante': parseInt(manha[i]),
                    'id_projeto': parseInt(id_projeto),
                    'turno': 'manha',
                    'dias': dias,
                    'hora': hora,
                    'ano_turma': ano_turma
                })
                .returning('id')

        }

        return res.json('Cadastro de turma realizado com sucesso')
    },

    async createTurma(req, res) {
        const {
            id_projeto,
            coordenador,
            nome,
            descricao,
            professor,
            manha,
            tarde,
            dias,
            hora,
            ano_turma
        } = req.body;

        console.log(ano_turma)

        const turma = await connection('turmas')
            .select('*')
            .where({
                'nome': nome,
                'ano_turma': ano_turma
            })
            .first()

        if (turma) {
            return res.json('JÃ¡ existe uma turma com esse nome');
        } else {

            for (let i = 0; i < manha.length; i++) {

                await connection('turmas')
                    .insert({
                        'nome': nome,
                        'descricao': descricao,
                        'dias': dias,
                        'hora': hora,
                        'id_professor': parseInt(professor),
                        'id_coordenador': parseInt(coordenador),
                        'id_participante': parseInt(manha[i]),
                        'id_projeto': parseInt(id_projeto),
                        'turno': 'manha',
                        'ano_turma': ano_turma
                    })
                    .returning('id')

            }

            for (let i = 0; i < tarde.length; i++) {

                await connection('turmas')
                    .insert({
                        'nome': nome,
                        'descricao': descricao,
                        'dias': dias,
                        'hora': hora,
                        'id_professor': parseInt(professor),
                        'id_coordenador': parseInt(coordenador),
                        'id_participante': parseInt(tarde[i]),
                        'id_projeto': parseInt(id_projeto),
                        'turno': 'tarde',
                        'ano_turma': ano_turma
                    })
                    .returning('id')


            }

            return res.json('Cadastro de turma realizado com sucesso')

        }
    },

    async deleteParticipantesdaTurma(req, res) {
        const { id_participante, id_projeto, nome_turma } = req.params;

        await connection('turmas')
            .where({
                'nome': nome_turma,
                'id_projeto': parseInt(id_projeto),
                'id_participante': parseInt(id_participante),

            })
            .delete()

        return res.json('ExcluÃ­do com sucesso!')
    },

    async alterTurma(req, res) {
        const {
            nome_antigo,
            nome_novo,
            descricao,
            dias,
            hora,
            id_professor,
            id_projeto,
            ano_turma
        } = req.body

        await connection('turmas')
            .where({
                'nome': nome_antigo,
                'id_projeto': id_projeto,
                'ano_turma': ano_turma
            })
            .update({
                'nome': nome_novo,
                'descricao': descricao,
                'dias': dias,
                'hora': hora,
                'id_professor': parseInt(id_professor),
            })

        await connection('frequencia')
            .where({
                'nome_turma': nome_antigo,
                'id_projeto': id_projeto,
                'ano': ano_turma
            })
            .update({
                'nome_turma': nome_novo
            })

        return res.json('Dados alterados com sucesso')
    }
}