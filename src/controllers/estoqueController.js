const connection = require('../database/connection')

module.exports = {
    async index(req, res) {
        const { id_projeto, area } = req.params

        const estoque = await connection('estoque')
            .select('*')
            .where({
                'id_projeto': id_projeto,
                'area': area
            })
            .orderBy([{ column: 'descricao', order: 'asc' }]) 
            
        return res.json(estoque)
    },

    async createEstoque(req, res) {
        const { id_projeto } = req.params

        const { descricao, qtd, qtd_ideal, area } = req.body

        const novo = await connection('estoque')
            .insert({
                descricao,
                qtd,
                qtd_ideal,
                area,
                id_projeto
            })
            .returning('id')

        return res.json(novo)
    },

    async getAreas(req, res) {
        const { id_projeto } = req.params

        const areas = await connection('estoque')
            .select('area')
            .groupBy('area')
            .orderBy('area', 'asc')

        return res.json(areas)
    },

    async atualizaIndividual(req, res) {
        const { id_projeto } = req.params
        const { area, descricao, valorIndividual, quantidadeIndividual, id } = req.body
        const data = new Date()
        const mes = data.getMonth() + 1


        const result = await connection('estoque_gastos')
            .select('*')
            .where({
                'mes': mes,
                'id_projeto': id_projeto,
                'area': area
            })
            .first()

        if (result) {
            await connection('estoque_gastos')
                .where({
                    'id_projeto': id_projeto,
                    'area': area
                })
                .increment({
                    'valor': valorIndividual
                })

            await connection('estoque')
                .where({ id: id, descricao: descricao, area: area })
                .increment({
                    qtd: quantidadeIndividual
                })
            return res.json('Lançado com sucesso!') 
        } else {
            return res.json(`Desculpe, não foi possível alterar. É necessário que se faça uma reposição geral antes.`)
        }

    },

    async registraGastos(req, res) {
        const { id_projeto } = req.params
        const { area, dia_compra, mes_compra, ano_compra, valor } = req.body

        const data = new Date()
        const mes = data.getMonth() + 1
        const ano = data.getFullYear()

        if (mes_compra != mes || ano_compra != ano) {
            return res.json('Só é possível lançar valores no mês e ano atual.')
        }

        const result = await connection('estoque_gastos')
            .select('*')
            .where({
                'mes': mes_compra,
                'id_projeto': id_projeto,
                'area': area
            })
            .first()

        if (result) {
            return res.json(`Já foi lançado uma alteração de valor do ${area} nesse mês. Favor, alterar de forma individual.`)
        } else {
            const novo = await connection('estoque_gastos')
                .insert({
                    area,
                    valor,
                    dia: dia_compra,
                    mes: mes_compra,
                    ano: ano_compra,
                    id_projeto
                })
                .returning('id')

            return res.json(`Valor lançado com sucesso para ${area} - Código: ${novo}`)
        }
    },

    async atualizaQuantidade(req, res) {
        const { id_projeto } = req.params
        const { area, estoque } = req.body
        const data = new Date()
        const mes = data.getMonth() + 1

        const resultGastos = await connection('estoque_gastos')
            .select('*')
            .where({
                'mes': mes,
                'id_projeto': id_projeto,
                'area': area
            })
            .first()

        const resultEstoque = await connection('estoque')
            .select('*')
            .where({
                'id_projeto': id_projeto,
                'reposicao': mes,
                'area': area
            })
            .first()

        if (resultGastos && !resultEstoque) {

            if (estoque.length == 0) {
                console.log('Nenhum selecionado')
                // const incidentsAll = await connection('estoque')
                //     .select('*')
                //     .where({ id_projeto: id_projeto, area: area })

                // console.log(incidentsAll)
                return
            }

            else {
                console.log('Algum selecionado')

                for (let i = 0; i < estoque.length; i++) {
                    const novo = await connection('estoque')
                        .select('*')
                        .where({ area: area, id: estoque[i] })
                        .first()

                    await connection('estoque')
                        .where({ area: area, id: novo.id })
                        .update({
                            'qtd': novo.qtd_ideal,
                            'reposicao': mes
                        })
                }
            }

            return res.json('Reposição de estoque feito com sucesso!')
        }

        return res.json(`Não foi possível cadastrar, reposição já feita no mês ${mes}. Caso seja necessário, fazer a alteração de forma individual.`)
    },

    async baixaEstoque(req, res) {
        const { id_projeto } = req.params
        const { id, quantidade } = req.body

        await connection('estoque')
            .where({ id_projeto: id_projeto, id: id })
            .decrement({
                qtd: quantidade
            })

        return res.json('Atualizado com sucesso!')
    },

    async createRelatorio(req, res) {
        const { id_projeto } = req.params
        const { quantidade, descricao, area, date, nome_professor, justificativa } = req.body

        await connection('saida_estoque')
            .insert({
                area,
                descricao,
                qtd: quantidade,
                user: nome_professor,
                dia: date.slice(8),
                mes: date.slice(5, 7),
                ano: date.slice(0, 4),
                justificativa,
                id_projeto
            })
            .returning('id')

        return res.json('Inserido com sucesso!')
    },

    async getGastos(req, res) {
        const { id_projeto, ano, area } = req.params

        const result = await connection('estoque_gastos')
            .select('mes as name', 'valor')
            .where({
                'id_projeto': id_projeto,
                'ano': ano,
                'area': area
            })
            .orderBy('mes', 'asc') 

        return res.json(result)
    }
}