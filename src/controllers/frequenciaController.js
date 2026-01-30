const connection = require('../database/connection')

module.exports = {
    async index(req, res) {
        const { id_projeto, nome_turma, turno_turma } = req.params

        const frequencia = await connection('frequencia')
            .distinct('mes', 'ano')
            .where({
                'id_projeto': id_projeto,
                'nome_turma': nome_turma,
                'turno_turma': turno_turma,
            })


        return res.json(frequencia)
    },

    async geral(req, res) {
        const { id_projeto, mes_turma, ano_turma } = req.params

        const frequencia = await connection('frequencia')
            .select('*')
            .where({
                'id_projeto': id_projeto,
                'mes': mes_turma,
                'ano': ano_turma,
            })


        return res.json(frequencia)
    },

    async getFrequenciaPorMesEAno(req, res) {
        const { id_projeto, nome_turma, turno_turma, mes_turma, ano_turma } = req.params

        const frequencia = await connection('frequencia')
            .select('dia', 'mes', 'ano')
            .where({
                'id_projeto': id_projeto,
                'nome_turma': nome_turma,
                'turno_turma': turno_turma,
                'mes': mes_turma,
                'ano': ano_turma
            })
            .orderBy('dia', 'asc')
            .groupBy('dia', 'mes', 'ano')

        return res.json(frequencia)
    },

    async getFrequenciaGeralDias(req, res) {
        const { id_projeto, nome_turma, mes_turma, ano_turma } = req.params

        const frequencia = await connection('frequencia')
            .select('dia', 'mes', 'ano')
            .where({
                'id_projeto': id_projeto,
                'nome_turma': nome_turma,
                'mes': mes_turma,
                'ano': ano_turma
            })
            .orderBy('dia', 'asc')
            .groupBy('dia', 'mes', 'ano')

        return res.json(frequencia)
    },

    async getFrequenciaGeralDiasTurno(req, res) {
        const { id_projeto, nome_turma, mes_turma, ano_turma, turno_turma } = req.params

        const frequencia = await connection('frequencia')
            .select('dia', 'mes', 'ano')
            .where({
                'id_projeto': id_projeto,
                'nome_turma': nome_turma,
                'turno_turma': turno_turma,
                'mes': mes_turma,
                'ano': ano_turma
            })
            .orderBy('dia', 'asc')
            .groupBy('dia', 'mes', 'ano')

        return res.json(frequencia)
    },

    async getFrequenciaGeral(req, res) {
        const { id_projeto, nome_turma, mes_turma, ano_turma } = req.params

        var array = []

        const participantes = await connection('turmas')
            .leftJoin('participantes', 'turmas.id_participante', 'participantes.id')
            .select('participantes.*', 'turmas.turno')
            .where({
                'turmas.id_projeto': id_projeto,
                'turmas.nome': nome_turma,
            })

            // .orderBy('participantes.nome', 'asc')

            .orderBy('participantes.nome', 'asc')

        const frequencia = await connection('frequencia')
            .select(
                'frequencia.*'
            )
            .where({
                'id_projeto': id_projeto,
                'nome_turma': nome_turma,
                'mes': mes_turma,
                'ano': ano_turma,

            })
            .orderBy([
                { column: 'dia', order: 'asc' },
                { column: 'frequencia.turno_turma', order: 'asc' }
            ])

        for (let i = 0; i < participantes.length; i++) {

            for (let j = 0; j < frequencia.length; j++) {

                if (participantes[i].id === frequencia[j].id_participante) {

                    array.push(frequencia[j])

                    const novoObj = array.filter(element => element.id_participante === participantes[i].id)
                    Object.assign(participantes[i], novoObj)

                }

            }

        }

        return res.json(participantes)
    },

    async getFrequenciaGeralTurnos(req, res) {
        const { id_projeto, nome_turma, mes_turma, ano_turma, turno_turma } = req.params

        var array = []

        const participantes = await connection('turmas')
            .leftJoin('participantes', 'turmas.id_participante', 'participantes.id')
            .select('participantes.*', 'turmas.turno')
            .where({
                'turmas.id_projeto': id_projeto,
                'turmas.nome': nome_turma,
                'turmas.turno': turno_turma,
            })

            // .orderBy('participantes.nome', 'asc')
            .orderBy('turmas.turno', 'asc')
            .orderBy('participantes.nome', 'asc')

        const frequencia = await connection('frequencia')
            .select(
                'frequencia.*'
            )
            .where({
                'id_projeto': id_projeto,
                'nome_turma': nome_turma,
                'turno_turma': turno_turma,
                'mes': mes_turma,
                'ano': ano_turma,

            })
            .orderBy([
                { column: 'dia', order: 'asc' },
                { column: 'frequencia.turno_turma', order: 'asc' }
            ])

        for (let i = 0; i < participantes.length; i++) {

            for (let j = 0; j < frequencia.length; j++) {

                if (participantes[i].id === frequencia[j].id_participante) {

                    array.push(frequencia[j])

                    const novoObj = array.filter(element => element.id_participante === participantes[i].id)
                    Object.assign(participantes[i], novoObj)

                }

            }

        }

        return res.json(participantes)
    },

    async getFrequenciaPorDia(req, res) {
        const { id_projeto, nome_turma, turno_turma, mes_turma, ano_turma, dia_turma } = req.params

        const frequencia = await connection('frequencia')
            .leftJoin('participantes', 'frequencia.id_participante', 'participantes.id')
            .select('frequencia.*', 'participantes.nome', 'participantes.br')
            .where({
                'frequencia.id_projeto': id_projeto,
                'frequencia.nome_turma': nome_turma,
                'frequencia.turno_turma': turno_turma,
                'frequencia.mes': mes_turma,
                'frequencia.ano': ano_turma,
                'frequencia.dia': dia_turma
            })
            .orderBy('participantes.nome', 'asc')

        return res.json(frequencia)
    },

    // async getAusentes(req, res) {
    //     const { id_projeto, nome_turma, mes, ano, dia } = req.params;

    //     const ausentes = await connection('frequencia')
    //         .select('frequencia.*')
    //         .count('status as ausentes')
    //         .where({
    //             'frequencia.id_projeto': id_projeto,
    //             'frequencia.nome_turma': nome_turma,
    //             'frequencia.mes': mes,
    //             'frequencia.ano': ano,
    //             'frequencia.dia': dia,
    //             'frequencia.status': 1
    //         })

    //         return res.json(ausentes)

    // },

    async getFrequenciaPorAluno(req, res) {
        const { id_participante, mes_turma, ano_turma } = req.params
        var array = []

        const turmas = await connection('turmas')
            .innerJoin('participantes', 'turmas.id_participante', 'participantes.id')
            // .leftJoin('turmas', 'participantes.id', 'turmas.id_participante')
            .select('participantes.*', 'turmas.nome as nome_turma', 'turmas.*')
            .where({
                'turmas.id_participante': id_participante,
                'turmas.ano_turma': ano_turma
            })

        const frequencia = await connection('frequencia')
            .select(
                'frequencia.*'
            )

            .where({
                'id_participante': id_participante,
                'mes': mes_turma,
                'ano': ano_turma,

            })
            .orderBy([
                { column: 'dia', order: 'asc' },
            ])

        for (let i = 0; i < turmas.length; i++) {

            for (let j = 0; j < frequencia.length; j++) {

                if (turmas[i].nome_turma === frequencia[j].nome_turma) {

                    array.push(frequencia[j])

                    const novoObj = array.filter(element => element.nome_turma === turmas[i].nome_turma)
                    Object.assign(turmas[i], [novoObj])

                }

            }

        }

        return res.json(turmas)
    },

    async createFrequenciaSementinha(req, res) {
        const {
            id_participante,
            id_professor,
            id_projeto,
            nome_turma,
            turno_turma,
            objetivo,
            descricao,
            day,
            month,
            year
        } = req.body

        const contadorMes = await connection('frequencia')
            .leftJoin('participantes', 'frequencia.id_participante', 'participantes.id')
            .count('participantes.id as count')
            .where({
                'frequencia.id_projeto': id_projeto,
                'frequencia.nome_turma': nome_turma,
                'frequencia.turno_turma': turno_turma,
                'frequencia.mes': month,
                'frequencia.ano': year,
                'frequencia.id_participante': id_participante
            })

        const contadorDia = await connection('frequencia')
            .leftJoin('participantes', 'frequencia.id_participante', 'participantes.id')
            .count('participantes.id as count')
            .where({
                'frequencia.id_projeto': id_projeto,
                'frequencia.nome_turma': nome_turma,
                'frequencia.turno_turma': turno_turma,
                'frequencia.dia': day,
                'frequencia.mes': month,
                'frequencia.ano': year,
                'frequencia.id_participante': id_participante
            })


        if (parseInt(contadorMes[0].count) < 2) {
            if (contadorDia[0].count < 1) {
                await connection('frequencia')
                    .insert({
                        'id_participante': parseInt(id_participante),
                        'id_projeto': parseInt(id_projeto),
                        'id_professor': parseInt(id_professor),
                        'nome_turma': nome_turma,
                        'turno_turma': turno_turma,
                        'objetivo': objetivo,
                        'descricao': descricao,
                        'dia': day,
                        'mes': month,
                        'ano': year,
                        'status': true
                    })

                return res.json('Resta ' + (1 - parseInt(contadorMes[0].count)) + ' Atendimento')
            } else {
                return res.json('Participante já foi visitado. Aguardar novo dia!')

            }
        } else {
            return res.json('As 2 visitas mensais já foram cadastradas.')
        }

    },

    async createFrequencia(req, res) {
        const {
            frequencia,
            participantes,
            id_professor,
            id_projeto,
            nome_turma,
            turno_turma,
            objetivo,
            descricao,
            day,
            month,
            year
        } = req.body

        const incident = await connection('frequencia')
            .select('*')
            .where({
                'id_projeto': parseInt(id_projeto),
                'nome_turma': nome_turma,
                'turno_turma': turno_turma,
                'mes': month,
                'ano': year,
                'dia': day
            })
            .first()
        if (incident) {
            return res.status(204).json()
        } else {
            for (let i = 0; i < participantes.length; i++) {
                if (frequencia.indexOf(participantes[i]) > -1) {
                    await connection('frequencia')
                        .insert({
                            'id_participante': participantes[i],
                            'id_projeto': parseInt(id_projeto),
                            'id_professor': parseInt(id_professor),
                            'nome_turma': nome_turma,
                            'turno_turma': turno_turma,
                            'objetivo': objetivo,
                            'descricao': descricao,
                            'dia': day,
                            'mes': month,
                            'ano': year,
                            'status': true
                        })
                        .returning('id')
                } else {
                    await connection('frequencia')
                        .insert({
                            'id_participante': participantes[i],
                            'id_projeto': parseInt(id_projeto),
                            'id_professor': parseInt(id_professor),
                            'nome_turma': nome_turma,
                            'turno_turma': turno_turma,
                            'objetivo': objetivo,
                            'descricao': descricao,
                            'dia': day,
                            'mes': month,
                            'ano': year,
                            'status': false
                        })
                        .returning('id')
                }
            }
            return res.json('Dados cadastrados com sucesso!')
        }
    },

    // async getFaltasDeAlunos(req, res) {
    //     const { id_projeto } = req.params;
    //     const data = new Date()

    //     const month = data.getMonth() + 1
    //     var array = []

    //     const turmas = await connection('turmas')
    //         .innerJoin('participantes', 'turmas.id_participante', 'participantes.id')
    //         .select('turmas.nome', 'participantes.faixa')
    //         .where({
    //             'turmas.id_projeto': id_projeto
    //         })
    //         .orderBy([
    //             { column: 'participantes.faixa', order: 'asc' },
    //             { column: 'turmas.nome', order: 'asc' }
    //         ])
    //         .groupBy('turmas.nome', 'participantes.faixa')

    //     for (let i = 0; i < turmas.length; i++) {

    //         const faltas = await connection('frequencia')
    //             .innerJoin('participantes', 'frequencia.id_participante', 'participantes.id')
    //             .select('participantes.nome', 'participantes.br', 'participantes.id')
    //             .count('participantes.id')
    //             .where({
    //                 'frequencia.id_projeto': id_projeto,
    //                 'frequencia.nome_turma': turmas[i].nome,
    //                 'frequencia.status': false,
    //                 'frequencia.mes': month
    //             })
    //             .orderBy('participantes.count', 'desc')
    //             .groupBy('participantes.id', 'frequencia.id_participante')

    //         array.push(faltas)

    //         // const novoObj = array.filter(element => element.id_participante === turmas[i].id)
    //         Object.assign(turmas[i], array)

    //         array.length = 0

    //     }

    //     return res.json(turmas)
    // }

    async editFrequencia(req, res) {
        const {
            id_projeto,
            id_participante,
            id_frequencia,
            status,
            faixa,
            dia
        } = req.body;

        if (faixa === '00 - 02 anos') {
            await connection('frequencia')
                .where({
                    'id': id_frequencia,
                    'id_projeto': id_projeto,
                    'id_participante': id_participante,
                })
                .update({
                    'dia': dia
                })
        } else {
            await connection('frequencia')
                .where({
                    'id': id_frequencia,
                    'id_projeto': id_projeto,
                    'id_participante': id_participante,
                })
                .update({
                    'status': status
                })

        }

        return res.json('Frequência alterada com sucesso')


    },

}