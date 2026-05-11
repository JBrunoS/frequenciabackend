const { status } = require("express/lib/response");
const connection = require("../database/connection");

module.exports = {
  async index(request, response) {
    const { id_projeto, status } = request.params;

    const professores = await connection("professor")
      .select("*")
      .where({
        id_projeto: id_projeto,
        status: status,
      })
      .orderBy("nome", "asc");

    return response.json(professores);
  },

  async getProfessoresAtivos(request, response) {
    const { id_projeto } = request.params;

    const professores = await connection("professor")
      .select("*")
      .where({
        id_projeto: id_projeto,
        status: 1,
        funcao: "Professor(a)",
      })
      .orderBy("nome", "asc");

    return response.json(professores);
  },

  async getCoordenador(request, response) {
    const { id_projeto } = request.params;

    const user = await connection("professor").select("*").where({
      id_projeto: id_projeto,
      funcao: "Coordenador(a)",
      status: 1,
    });

    return response.json(user);
  },

  async getById(request, response) {
    const { id_professor } = request.params;

    const user = await connection("professor")
      .select("*")
      .where({
        id: id_professor,
      })
      .first();

    return response.json(user);
  },

  async create(request, response) {
    const { nome, email, senha, telefone, funcao, id_projeto, image_url } =
      request.body;

    const professor = await connection("professor")
      .select("*")
      .where({
        email: email,
      })
      .first();

    if (professor) {
      return response.json("Esse e-mail já está cadastrado");
    } else {
      const novo = await connection("professor")
        .insert({
          nome,
          email,
          senha,
          telefone,
          funcao,
          id_projeto,
          image_url: image_url || null,
          status: true,
        })
        .returning(["nome", "image_url"]);

      return response.json(novo);
    }
  },

  async editProfessor(req, res) {
    const { id_professor } = req.params;

    const { nome, email, telefone, senha, funcao, status, image_url } =
      req.body;

    await connection("professor")
      .where({ id: id_professor })
      .update({
        nome,
        email,
        telefone,
        senha,
        funcao,
        status,
        image_url: image_url || null,
      });

    return res.json("Dados alterados com sucesso!");
  },

  async getLogin(req, res) {
    const { email, senha } = req.body;

    // Busca professor
    const professor = await connection("professor").where({ email }).first();

    if (!professor) {
      return res.status(401).json({ error: "EMAIL_INVALIDO" });
    }

    if (professor.senha !== senha) {
      return res.status(401).json({ error: "SENHA_INVALIDA" });
    }

    // Busca todos os vínculos
    const vinculos = await connection("professor_projetos").where({
      id_professor: professor.id,
    });

    return res.json({
      ...professor,
      vinculos,
    });
  },

  async getProfessoresPorProjeto(req, res) {
    try {
      const { id_projeto } = req.params;
      const { id_projeto_atual } = req.query;

      // &#9989; primeiro verifica o que tem na professor_projetos
      const vinculados = await connection("professor_projetos").where(
        "id_projeto",
        id_projeto,
      );

      const jaNoAtual = await connection("professor_projetos")
        .where("id_projeto", id_projeto_atual)
        .select("id_professor");

      const professores = await connection("professor as p")
        .join("professor_projetos as pp", "pp.id_professor", "p.id")
        .where("pp.id_projeto", id_projeto)
        .whereNotIn("p.id", function () {
          this.select("id_professor")
            .from("professor_projetos")
            .where("id_projeto", id_projeto_atual);
        })
        .where("pp.status", 1)
        .select("p.id", "p.nome", "p.email", "p.funcao", "p.image_url")
        .orderBy("p.nome", "asc");

      return res.json(professores);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar colaboradores" });
    }
  },

  async vincularProfessor(req, res) {
    try {
      const { id_professor, id_projeto, funcao } = req.body;

      if (!id_professor || !id_projeto) {
        return res.status(400).json({ error: "Campos obrigatórios faltando" });
      }

      const jaVinculado = await connection("professor_projetos")
        .where({ id_professor, id_projeto })
        .first();

      if (jaVinculado) {
        return res
          .status(400)
          .json({ error: "Colaborador já vinculado a este projeto" });
      }

      await connection("professor_projetos").insert({
        id_professor: Number(id_professor),
        id_projeto: Number(id_projeto),
        funcao,
        status: 1,
      });

      return res
        .status(201)
        .json({ message: "Colaborador vinculado com sucesso!" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao vincular colaborador" });
    }
  },
  async getProjetosProfessor(req, res) {
    try {
      const { id_professor } = req.params;

      const projetos = await connection("professor_projetos as pp")
        .join("projetos as p", "p.id", "pp.id_projeto")
        .where({ "pp.id_professor": Number(id_professor), "pp.status": 1 })
        .select("p.id", "p.nome_projeto");

      return res.json(projetos);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar projetos" });
    }
  },
  async getTodos(req, res) {
    try {
      const { id_projeto, status } = req.params;

      // professores nativos do projeto
      const nativos = await connection("professor")
        .where({ id_projeto, status })
        .orderBy("nome", "asc")
        .select("*")
        .then((rows) => rows.map((r) => ({ ...r, vinculado: false })));

      // professores vinculados via professor_projetos
      const vinculados = await connection("professor as p")
        .join("professor_projetos as pp", "pp.id_professor", "p.id")
        .where({ "pp.id_projeto": id_projeto, "pp.status": status })
        .whereNot("p.id_projeto", id_projeto) // exclui os nativos
        .select("p.*")
        .orderBy("p.nome", "asc")
        .then((rows) => rows.map((r) => ({ ...r, vinculado: true })));

      return res.json([...nativos, ...vinculados]);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar colaboradores" });
    }
  },
  async desvincular(req, res) {
    try {
      const { id_professor, id_projeto } = req.params;

      await connection("professor_projetos")
        .where({
          id_professor: Number(id_professor),
          id_projeto: Number(id_projeto),
        })
        .delete();

      return res.json({ message: "Colaborador desvinculado com sucesso!" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao desvincular colaborador" });
    }
  },
};
