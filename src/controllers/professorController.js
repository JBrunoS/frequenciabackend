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

    // 1. Verifica se o email existe
    const professor = await connection("professor")
      .select("*")
      .where({ email })
      .first();

    if (!professor) {
      return res.status(401).json({ error: "EMAIL_INVALIDO" });
    }

    // 2. Verifica a senha
    if (professor.senha !== senha) {
      return res.status(401).json({ error: "SENHA_INVALIDA" });
    }
    console.log(professor.senha === senha);
    // 3. Login OK
    return res.json(professor);
  },
};
