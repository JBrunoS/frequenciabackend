const express = require('express')
 
const projetoController = require('./controllers/projetoController')
const participanteController = require('./controllers/participanteController')
const professorController = require('./controllers/professorController')
const turmaController = require('./controllers/turmaController')
const frequenciaController = require('./controllers/frequenciaController')
const estoqueController = require('./controllers/estoqueController')
const sorteioController = require('./controllers/sorteioController')
const timeLineController = require('./controllers/timeLineController')
const aprovacaoController = require('./controllers/aprovacaoController')
const solicitacaoItensController = require('./controllers/solicitacaoItensController')
const solicitacaoController = require('./controllers/solicitacaoController')
 
const routes = express.Router()
 
routes.get('/projetos', projetoController.index)
routes.post('/login/projetos', projetoController.getLogin)
routes.post('/projetos', projetoController.create)
 
routes.get('/participantes/:id_projeto', participanteController.index)
routes.get('/participantes/app/:id_projeto', participanteController.getApp)
routes.get('/participante/:id_user', participanteController.getById)
routes.post('/participantes', participanteController.create)
routes.put('/edit/participante/:id', participanteController.editParticipante)
routes.get('/faixas/:id_projeto/:faixa', participanteController.getByFaixa)
routes.get('/projeto/:id_projeto/:faixa/:tipo_programa', participanteController.getByAtendimentoProjeto)
routes.get('/lar/:id_projeto/:tipo_programa', participanteController.getByAtendimentoLar)
routes.put('/edit_faixa/:id_user/:id_projeto/:faixa', participanteController.updateFaixa)
routes.put('/saldo/participantes', participanteController.editaSaldoParticipante)
routes.put('/desconta/papagaio', participanteController.descontaPapagaio)
 
routes.get('/professores/:id_projeto/:status', professorController.index)
routes.get('/professores_ativos/:id_projeto/', professorController.getProfessoresAtivos)
routes.get('/professor/:id_professor', professorController.getById)  
routes.post('/professores', professorController.create)  
routes.put('/edit/professor/:id_professor', professorController.editProfessor)
routes.get('/coordenador/:id_projeto', professorController.getCoordenador)
routes.post('/professor/login', professorController.getLogin)
 
routes.get('/total/participantes/:id_projeto', participanteController.getTotal)
routes.get('/total/turmas/:id_projeto', turmaController.getTotalTurmas)
 
 
routes.get('/turmas/:id_projeto/:ano_turma', turmaController.index)
routes.post('/turmas', turmaController.createTurma)
routes.get('/tarde/:nome_turma/:id_projeto', turmaController.getCountTarde)
routes.get('/manha/:nome_turma/:id_projeto', turmaController.getCountManha)
routes.get('/professor/turmas/:id_professor/:id_projeto', turmaController.getTurmaByProfessor)
routes.get('/turma/:id_projeto/:nome_turma/:turno_turma', turmaController.getTurmaByNameTurno)
routes.get('/turma/sementinha/:id_projeto/:nome_turma/:turno_turma', turmaController.getTurmaByNameSementinha)
 
 
routes.get('/turma/:id_projeto/:nome_turma', turmaController.getTurmaByNameAll)
routes.get('/participantes/:id_projeto/:nome_turma/:faixa/:tipo_programa', turmaController.getParticipanteSemTurmaProjeto)
routes.get('/participantes/:id_projeto/:nome_turma/:tipo_programa', turmaController.getParticipanteSemTurmaLar)
routes.post('/add/turma', turmaController.adicionaParticipanteSemTurma)
routes.delete('/delete/:id_participante/:id_projeto/:nome_turma', turmaController.deleteParticipantesdaTurma)
routes.put('/edit/turno', turmaController.alterTurno)
routes.put('/edit/turma', turmaController.alterTurma)
 
 
routes.get('/geral/frequencia/dias/:id_projeto/:nome_turma/:mes_turma/:ano_turma', frequenciaController.getFrequenciaGeralDias)
routes.get('/geral/frequencia/dias/:id_projeto/:nome_turma/:mes_turma/:ano_turma/:turno_turma', frequenciaController.getFrequenciaGeralDiasTurno)
routes.get('/geral/frequencia/:id_projeto/:nome_turma/:mes_turma/:ano_turma', frequenciaController.getFrequenciaGeral)
routes.get('/geral/frequencia/:id_projeto/:nome_turma/:mes_turma/:ano_turma/:turno_turma', frequenciaController.getFrequenciaGeralTurnos)
// routes.get('/get/faltas/:id_projeto', frequenciaController.getFaltasDeAlunos)
routes.get('/get/frequencia/:id_projeto/:nome_turma/:turno_turma/:mes_turma/:ano_turma', frequenciaController.getFrequenciaPorMesEAno)
routes.get('/get/frequencia/:id_projeto/:nome_turma/:turno_turma/:mes_turma/:ano_turma/:dia_turma', frequenciaController.getFrequenciaPorDia)
routes.get('/get/frequencia-aluno/:id_participante/:mes_turma/:ano_turma', frequenciaController.getFrequenciaPorAluno)
// routes.get('/get/balanco_ausentes/:id_projeto/:nome_turma/:mes/:ano/:dia', frequenciaController.getAusentes)
routes.post('/create/frequencia/sementinha', frequenciaController.createFrequenciaSementinha)
routes.get('/get/frequencia/:id_projeto/:nome_turma/:turno_turma', frequenciaController.index)
routes.get('/get/geral/:id_projeto/:mes_turma/:ano_turma', frequenciaController.geral)
routes.post('/create/frequencia', frequenciaController.createFrequencia)
routes.put('/edit/frequencia', frequenciaController.editFrequencia)
 
routes.get('/estoque/:id_projeto/:area', estoqueController.index)
routes.get('/areas/:id_projeto', estoqueController.getAreas)
routes.get('/gastos/:id_projeto/:ano/:area', estoqueController.getGastos)
routes.post('/estoque/:id_projeto', estoqueController.createEstoque)
routes.post('/atualiza/:id_projeto', estoqueController.atualizaIndividual)
routes.post('/atualiza-valor/:id_projeto', estoqueController.registraGastos)
routes.post('/atualiza-estoque/:id_projeto', estoqueController.atualizaQuantidade)
routes.post('/baixa-estoque/:id_projeto', estoqueController.baixaEstoque)
routes.post('/create-report/:id_projeto', estoqueController.createRelatorio)

routes.post('/create/sorteio', sorteioController.createPonto)
routes.get('/total/sorteio', sorteioController.getTotalPontos)
routes.get('/vendedor/sorteio/:id_professor', sorteioController.getTotalPontosColaborador)
routes.get('/vendedor/nomes/:id_professor', sorteioController.index)
routes.get('/vendedores/:id_projeto/:status', sorteioController.getTotalPontosVendedores)
routes.get('/compras/:id_professor/:nome', sorteioController.getPontos)
routes.get('/pessoa/:id_professor/:nome', sorteioController.getPontosPessoa)
routes.put('/pessoa/edit/:id_professor/:nome', sorteioController.editStatus)

routes.post('/solicitacoes', solicitacaoController.create);
routes.get('/solicitacoes', solicitacaoController.index);
routes.get('/solicitacoes/:id', solicitacaoController.show);
routes.get('/solicitacoes/:id/completa', solicitacaoController.getAll);

routes.post('/solicitacao/:id/itens', solicitacaoItensController.create);
routes.get('/solicitacao-itens/:solicitacao_id', solicitacaoItensController.index);

routes.post('/aprovacoes', aprovacaoController.create);
routes.get('/aprovacoes/:solicitacao_id', aprovacaoController.index);

routes.get('/timeline/:solicitacao_id', timeLineController.index);
routes.post('/timeline', timeLineController.create);


 
module.exports = routes;