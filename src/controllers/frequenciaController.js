const connection = require("../database/connection");

module.exports = {
  async index(req, res) {
    const { id_projeto, nome_turma, turno_turma } = req.params;

    const frequencia = await connection("frequencia")
      .distinct("mes", "ano")
      .where({
        id_projeto: id_projeto,
        nome_turma: nome_turma,
        turno_turma: turno_turma,
      });

    return res.json(frequencia);
  },

  async frequenciaTurmas(req, res) {
    try {
      const { id_projeto, mes, ano } = req.params;

      if (!id_projeto || !mes || !ano) {
        return res.status(400).json({
          error: "ParÃ¢metros invÃ¡lidos",
        });
      }

      // ðŸ”¹ Buscar turmas do projeto
      const turmas = await connection("turmas")
        .where({
          id_projeto,
          ano_turma: ano,
        })
        .select("nome")
        .groupBy("nome");

      const resultado = [];

      for (const turma of turmas) {
        // ðŸ”¹ Buscar participantes da turma
        const participantes = await connection("turmas")
          .leftJoin(
            "participantes",
            "turmas.id_participante",
            "participantes.id",
          )
          .select("participantes.*")
          .where({
            "turmas.id_projeto": id_projeto,
            "turmas.nome": turma.nome,
          });

        // ðŸ”¹ Buscar frequÃªncia da turma
        const frequencias = await connection("frequencia").where({
          id_projeto,
          nome_turma: turma.nome,
          mes,
          ano,
        });

        let presentes = 0;
        let totalPossivel = 0;

        participantes.forEach((participante) => {
          frequencias.forEach((freq) => {
            if (freq.id_participante === participante.id) {
              totalPossivel++;

              if (freq.status === 1) {
                presentes++;
              }
            }
          });
        });

        const percentual =
          totalPossivel > 0
            ? Number(((presentes / totalPossivel) * 100).toFixed(1))
            : 0;

        resultado.push({
          nome: turma.nome,
          percentual,
        });
      }

      return res.json(resultado);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error: "Erro ao calcular frequÃªncia das turmas",
      });
    }
  },

  async geral(req, res) {
    const { id_projeto, mes_turma, ano_turma } = req.params;

    const frequencia = await connection("frequencia").select("*").where({
      id_projeto: id_projeto,
      mes: mes_turma,
      ano: ano_turma,
    });

    return res.json(frequencia);
  },

  async getFrequenciaPorMesEAno(req, res) {
    const { id_projeto, nome_turma, turno_turma, mes_turma, ano_turma } =
      req.params;

    const frequencia = await connection("frequencia")
      .select("dia", "mes", "ano")
      .where({
        id_projeto: id_projeto,
        nome_turma: nome_turma,
        turno_turma: turno_turma,
        mes: mes_turma,
        ano: ano_turma,
      })
      .orderBy("dia", "asc")
      .groupBy("dia", "mes", "ano");

    return res.json(frequencia);
  },

  async getFrequenciaGeralDias(req, res) {
    const { id_projeto, nome_turma, mes_turma, ano_turma } = req.params;

    const frequencia = await connection("frequencia")
      .select("dia", "mes", "ano")
      .where({
        id_projeto: id_projeto,
        nome_turma: nome_turma,
        mes: mes_turma,
        ano: ano_turma,
      })
      .orderBy("dia", "asc")
      .groupBy("dia", "mes", "ano");

    return res.json(frequencia);
  },

  async getFrequenciaGeralDiasTurno(req, res) {
    const { id_projeto, nome_turma, mes_turma, ano_turma, turno_turma } =
      req.params;

    const frequencia = await connection("frequencia")
      .select("dia", "mes", "ano")
      .where({
        id_projeto: id_projeto,
        nome_turma: nome_turma,
        turno_turma: turno_turma,
        mes: mes_turma,
        ano: ano_turma,
      })
      .orderBy("dia", "asc")
      .groupBy("dia", "mes", "ano");

    return res.json(frequencia);
  },

  async getFrequenciaGeral(req, res) {
    const { id_projeto, nome_turma, mes_turma, ano_turma } = req.params;

    var array = [];

    const participantes = await connection("turmas")
      .leftJoin("participantes", "turmas.id_participante", "participantes.id")
      .select("participantes.*", "turmas.turno")
      .where({
        "turmas.id_projeto": id_projeto,
        "turmas.nome": nome_turma,
      })

      // .orderBy('participantes.nome', 'asc')

      .orderBy("participantes.nome", "asc");

    const frequencia = await connection("frequencia")
      .select("frequencia.*")
      .where({
        id_projeto: id_projeto,
        nome_turma: nome_turma,
        mes: mes_turma,
        ano: ano_turma,
      })
      .orderBy([
        { column: "dia", order: "asc" },
        { column: "frequencia.turno_turma", order: "asc" },
      ]);

    for (let i = 0; i < participantes.length; i++) {
      for (let j = 0; j < frequencia.length; j++) {
        if (participantes[i].id === frequencia[j].id_participante) {
          array.push(frequencia[j]);

          const novoObj = array.filter(
            (element) => element.id_participante === participantes[i].id,
          );
          Object.assign(participantes[i], novoObj);
        }
      }
    }

    return res.json(participantes);
  },

  async getFrequenciaGeralTurnos(req, res) {
    const { id_projeto, nome_turma, mes_turma, ano_turma, turno_turma } =
      req.params;

    var array = [];

    const participantes = await connection("turmas")
      .leftJoin("participantes", "turmas.id_participante", "participantes.id")
      .select("participantes.*", "turmas.turno")
      .where({
        "turmas.id_projeto": id_projeto,
        "turmas.nome": nome_turma,
        "turmas.turno": turno_turma,
      })

      // .orderBy('participantes.nome', 'asc')
      .orderBy("turmas.turno", "asc")
      .orderBy("participantes.nome", "asc");

    const frequencia = await connection("frequencia")
      .select("frequencia.*")
      .where({
        id_projeto: id_projeto,
        nome_turma: nome_turma,
        turno_turma: turno_turma,
        mes: mes_turma,
        ano: ano_turma,
      })
      .orderBy([
        { column: "dia", order: "asc" },
        { column: "frequencia.turno_turma", order: "asc" },
      ]);

    for (let i = 0; i < participantes.length; i++) {
      for (let j = 0; j < frequencia.length; j++) {
        if (participantes[i].id === frequencia[j].id_participante) {
          array.push(frequencia[j]);

          const novoObj = array.filter(
            (element) => element.id_participante === participantes[i].id,
          );
          Object.assign(participantes[i], novoObj);
        }
      }
    }

    return res.json(participantes);
  },

  async getFrequenciaPorDia(req, res) {
    const {
      id_projeto,
      nome_turma,
      turno_turma,
      mes_turma,
      ano_turma,
      dia_turma,
    } = req.params;

    const frequencia = await connection("frequencia")
      .leftJoin(
        "participantes",
        "frequencia.id_participante",
        "participantes.id",
      )
      .select("frequencia.*", "participantes.nome", "participantes.br")
      .where({
        "frequencia.id_projeto": id_projeto,
        "frequencia.nome_turma": nome_turma,
        "frequencia.turno_turma": turno_turma,
        "frequencia.mes": mes_turma,
        "frequencia.ano": ano_turma,
        "frequencia.dia": dia_turma,
      })
      .orderBy("participantes.nome", "asc");

    return res.json(frequencia);
  },

  async getFrequenciaPorAluno(req, res) {
    const { id_participante, mes_turma, ano_turma } = req.params;
    var array = [];

    const turmas = await connection("turmas")
      .innerJoin("participantes", "turmas.id_participante", "participantes.id")
      // .leftJoin('turmas', 'participantes.id', 'turmas.id_participante')
      .select("participantes.*", "turmas.nome as nome_turma", "turmas.*")
      .where({
        "turmas.id_participante": id_participante,
        "turmas.ano_turma": ano_turma,
      });

    const frequencia = await connection("frequencia")
      .select("frequencia.*")

      .where({
        id_participante: id_participante,
        mes: mes_turma,
        ano: ano_turma,
      })
      .orderBy([{ column: "dia", order: "asc" }]);

    for (let i = 0; i < turmas.length; i++) {
      for (let j = 0; j < frequencia.length; j++) {
        if (turmas[i].nome_turma === frequencia[j].nome_turma) {
          array.push(frequencia[j]);

          const novoObj = array.filter(
            (element) => element.nome_turma === turmas[i].nome_turma,
          );
          Object.assign(turmas[i], [novoObj]);
        }
      }
    }

    return res.json(turmas);
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
      year,
    } = req.body;

    const contadorMes = await connection("frequencia")
      .leftJoin(
        "participantes",
        "frequencia.id_participante",
        "participantes.id",
      )
      .count("participantes.id as count")
      .where({
        "frequencia.id_projeto": id_projeto,
        "frequencia.nome_turma": nome_turma,
        "frequencia.turno_turma": turno_turma,
        "frequencia.mes": month,
        "frequencia.ano": year,
        "frequencia.id_participante": id_participante,
      });

    const contadorDia = await connection("frequencia")
      .leftJoin(
        "participantes",
        "frequencia.id_participante",
        "participantes.id",
      )
      .count("participantes.id as count")
      .where({
        "frequencia.id_projeto": id_projeto,
        "frequencia.nome_turma": nome_turma,
        "frequencia.turno_turma": turno_turma,
        "frequencia.dia": day,
        "frequencia.mes": month,
        "frequencia.ano": year,
        "frequencia.id_participante": id_participante,
      });

    if (parseInt(contadorMes[0].count) < 2) {
      if (contadorDia[0].count < 1) {
        await connection("frequencia").insert({
          id_participante: parseInt(id_participante),
          id_projeto: parseInt(id_projeto),
          id_professor: parseInt(id_professor),
          nome_turma: nome_turma,
          turno_turma: turno_turma,
          objetivo: objetivo,
          descricao: descricao,
          dia: day,
          mes: month,
          ano: year,
          status: true,
        });

        return res.json(
          "Resta " + (1 - parseInt(contadorMes[0].count)) + " Atendimento",
        );
      } else {
        return res.json("Participante jÃ¡ foi visitado. Aguardar novo dia!");
      }
    } else {
      return res.json("As 2 visitas mensais jÃ¡ foram cadastradas.");
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
      year,
    } = req.body;

    const incident = await connection("frequencia")
      .select("*")
      .where({
        id_projeto: parseInt(id_projeto),
        nome_turma: nome_turma,
        turno_turma: turno_turma,
        mes: month,
        ano: year,
        dia: day,
      })
      .first();
    if (incident) {
      return res.status(204).json();
    } else {
      for (let i = 0; i < participantes.length; i++) {
        if (frequencia.indexOf(participantes[i]) > -1) {
          await connection("frequencia")
            .insert({
              id_participante: participantes[i],
              id_projeto: parseInt(id_projeto),
              id_professor: parseInt(id_professor),
              nome_turma: nome_turma,
              turno_turma: turno_turma,
              objetivo: objetivo,
              descricao: descricao,
              dia: day,
              mes: month,
              ano: year,
              status: true,
            })
            .returning("id");
        } else {
          await connection("frequencia")
            .insert({
              id_participante: participantes[i],
              id_projeto: parseInt(id_projeto),
              id_professor: parseInt(id_professor),
              nome_turma: nome_turma,
              turno_turma: turno_turma,
              objetivo: objetivo,
              descricao: descricao,
              dia: day,
              mes: month,
              ano: year,
              status: false,
            })
            .returning("id");
        }
      }
      return res.json("Dados cadastrados com sucesso!");
    }
  },

  async editFrequencia(req, res) {
    const { id_projeto, id_participante, id_frequencia, status, faixa, dia } =
      req.body;

    if (faixa === "00 - 02 anos") {
      await connection("frequencia")
        .where({
          id: id_frequencia,
          id_projeto: id_projeto,
          id_participante: id_participante,
        })
        .update({
          dia: dia,
        });
    } else {
      await connection("frequencia")
        .where({
          id: id_frequencia,
          id_projeto: id_projeto,
          id_participante: id_participante,
        })
        .update({
          status: status,
        });
    }

    return res.json("FrequÃªncia alterada com sucesso");
  },
  async participantesSemPresenca(req, res) {
    try {
      const { id_projeto, mes, ano } = req.params;

      const participantes = await connection("turmas as t")
        .leftJoin("participantes as p", "t.id_participante", "p.id")
        .select("p.id", "p.nome", "p.faixa", "t.nome as nome_turma")
        .where("t.id_projeto", id_projeto)
        .where("t.ano_turma", ano)
        .whereNotExists(function () {
          this.select("*")
            .from("frequencia as f")
            .whereRaw("f.id_participante = t.id_participante")
            .whereRaw("f.nome_turma = t.nome")
            .where("f.id_projeto", id_projeto)
            .where("f.mes", mes)
            .where("f.ano", ano)
            .where("f.status", 1); // presença real
        })
        .orderBy("t.nome", "asc")
        .orderBy("p.nome", "asc");

      return res.json(participantes);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        error: "Erro ao buscar participantes sem presença",
      });
    }
  },
};
