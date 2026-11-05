import Funcao from './Funcao.js';
import { cloneRuntimeValue, isFunctionValue, matchPattern } from '../Runtime.js';

/*
  Estrutura de decisão, representa os estados do programa, variáveis de decisão e ações que o programa
  deve realizar em sequencia.
  É inicializada com o Arquivo de entrada e a lista de funções, e trabalha em cima destes dados.
    0) Index do programa na pilha de execução. 
    1) Nome do programa.
    2) Entradas do programa.
    3) Estados do programa:
      0 = Não iniciado.
      1 = executando.
      2 = erro de sintaxe.
      3 = erro de execução.
      4 = finalizado com sucesso
    4) Lista de chamadas do programa. referencia da função que está sendo executada.
    5) Data de criação do programa.
    6) Data da última modificação do programa.
*/
export default class Programa{
  constructor(Arq, index){
    this.id       = index;              // 0) 
    this.nome     = Arq.nome;           // 1)
    this.entradas = Arq.entradas;       // 2)
    this.estado   = 0;                  // 3)
    this.lista    = new Array();        // 4) pilha de execução
    this.funcoes  = Arq.lista.map((funcao, indice) => new Funcao(funcao, indice));
    this.createAt = new Date();         // 5)
    this.updateAt = new Date();         // 6)
  };

  // Funções do programa
  init = function(Arq){
    // Adiciona a função inicial na pilha do programa.
    const funcao = this.funcoes[this.funcoes.length - 1];
    this.lista.push(funcao.chamada);
    // Joga os dados iniciais nos nodos iniciais da função.
    for(let i = 0 ; i < Arq.entradas.length ; i++) 
      funcao.entradas[i] = Arq.entradas[i];
    for(let i = 0 ; i < funcao.entradas.length ; i++) 
      funcao.grafo[i].entradas[0] = funcao.entradas[i];
    this.estado = 1;
    return true;
  }

  executar = function(verbose = false){
    try {
      const resultado = this.executarFuncao(this.funcoes[this.funcoes.length - 1], this.entradas, verbose);
      this.estado = 4;
      this.updateAt = new Date();
      return resultado;
    } catch (erro) {
      this.estado = 3;
      this.updateAt = new Date();
      throw erro;
    }
  }

  executarFuncao = function(funcaoOuNome, entradas, verbose = false){
    const definicao = this.resolverDefinicao(funcaoOuNome);

    if (!definicao) throw new Error(`Função não encontrada: ${this.descreverFuncao(funcaoOuNome)}`);
    const parametros = definicao.entradas ?? [];
    const argumentos = entradas ?? [];
    if (parametros.length !== argumentos.length) {
      throw new Error(`A função ${definicao.chamada} exige ${parametros.length} argumento(s), mas recebeu ${argumentos.length}`);
    }
    const funcao = new Funcao({
      id: definicao.id,
      chamada: definicao.chamada,
      entradas: [...(definicao.entradas ?? [])],
      grafo: definicao.grafo.map((nodo) => ({
        idx: nodo.idx,
        type: nodo.type,
        ligacoes: [...nodo.ligacoes],
        ligacaoPortas: [...(nodo.ligacaoPortas ?? [])],
        entradas: [...nodo.entradas],
        saidas: [...nodo.saidas],
        valor: cloneRuntimeValue(nodo.valor),
        funcao: nodo.funcao,
        padroes: nodo.padroes,
        nome: nodo.nome
      }))
    }, definicao.id);
    this.prepararFuncao(funcao, argumentos);
    const resultado = this.executarGrafo(funcao, verbose);
    definicao.saidas = [...funcao.saidas];
    definicao.estado = funcao.estado;
    return resultado;
  }

  prepararFuncao = function(funcao, entradas){
    funcao.entradas = [...entradas];
    funcao.saidas = [];

    for (const nodo of funcao.grafo) {
      if (!['const', 'list', 'func', 'function', 'ref', 'lambda'].includes(nodo.type)) {
        nodo.entradas = nodo.entradas.map(() => '');
      }
      nodo.saidas = [];
    }

    for (let indice = 0; indice < entradas.length; indice++) {
      const entrada = funcao.grafo.find((nodo) => nodo.idx === indice);
      if (!entrada) throw new Error(`Entrada ${indice} ausente na função ${funcao.chamada}`);
      entrada.receberEntrada(entradas[indice]);
    }
  }

  executarGrafo = function(funcao, verbose = false){
    const executados = new Set();
    const bloqueados = new Set();
    const aguardandoDisor = new Set(
      funcao.grafo
        .filter((nodo) => nodo.type === 'disor')
        .flatMap((nodo) => nodo.ligacoes.filter((ligacao) => typeof ligacao === 'number'))
    );
    let resultado;
    const contexto = { bindings: {} };

    funcao.estado = 1;

    while (resultado === undefined) {
      let houveProgresso = false;

      for (const nodo of funcao.grafo) {
        if (executados.has(nodo.idx) || bloqueados.has(nodo.idx) || aguardandoDisor.has(nodo.idx) || !nodo.pronto()) continue;
        if (nodo.type === 'binding' && !(nodo.nome in contexto.bindings)) continue;

        nodo.executar((funcaoOuNome, entradas) =>
          isFunctionValue(funcaoOuNome)
            ? this.aplicarFuncao(funcaoOuNome, entradas, verbose)
            : typeof funcaoOuNome === 'string'
              ? this.executarFuncao(funcaoOuNome, entradas, verbose)
              : this.aplicarFuncao(funcaoOuNome, entradas, verbose), contexto);

        if (verbose) {
          console.log(`[${funcao.chamada}] Nodo executado`, {
            idx: nodo.idx,
            type: nodo.type,
            ligacoes: nodo.ligacoes,
            entradas: nodo.entradas,
            saidas: nodo.saidas
          });
        }

        executados.add(nodo.idx);
        houveProgresso = true;

        if (nodo.type === 'disor' || nodo.type === 'match') {
          const ramoEscolhido = nodo.saidas[0] ? 0 : 1;
          if (nodo.type === 'match') {
            const escolha = this.escolherRamo(nodo);
            if (escolha === undefined) {
              throw new Error(`Nenhum padrão correspondeu no nodo ${nodo.idx}`);
            }
            contexto.bindings = escolha.bindings;
            nodo.saidas = [true];
            this.bloquearRamos(nodo, escolha.index, bloqueados, aguardandoDisor);
            continue;
          }
          const ramoIgnorado = nodo.ligacoes[1 - ramoEscolhido];
          if (typeof ramoIgnorado === 'number') bloqueados.add(ramoIgnorado);
          const proximoRamo = nodo.ligacoes[ramoEscolhido];
          if (typeof proximoRamo === 'number') aguardandoDisor.delete(proximoRamo);
          continue;
        }

        for (const ligacao of nodo.ligacoes) {
          if (ligacao === 'output' || ligacao === 'x') {
            resultado = nodo.saidas[0];
            funcao.saidas = [resultado];
          }
        }

        nodo.propagar(funcao.grafo);
      }

      if (resultado !== undefined) {
        funcao.estado = 4;
        return resultado;
      }

      if (!houveProgresso) {
        throw new Error(`Grafo da função ${funcao.chamada} não pode progredir`);
      }
    }
  }

  resolverDefinicao = function(funcaoOuNome) {
    if (isFunctionValue(funcaoOuNome)) {
      return this.funcoes.find((item) =>
        item.id === funcaoOuNome.functionId || item.chamada === funcaoOuNome.functionId);
    }
    if (typeof funcaoOuNome === 'string') {
      return this.funcoes.find((item) =>
        item.chamada === funcaoOuNome || String(item.id) === funcaoOuNome);
    }
    return funcaoOuNome;
  }

  descreverFuncao = function(funcaoOuNome) {
    return isFunctionValue(funcaoOuNome) ? funcaoOuNome.functionId : funcaoOuNome;
  }

  aplicarFuncao = function(valorFuncao, entradas, verbose = false) {
    if (!isFunctionValue(valorFuncao)) {
      throw new Error('Aplicação exige um valor de função como primeiro argumento');
    }
    return this.executarFuncao(valorFuncao, entradas, verbose);
  }

  escolherRamo = function(nodo) {
    for (let index = 0; index < nodo.padroes.length; index++) {
      const resultado = matchPattern(nodo.padroes[index], nodo.entradas[0]);
      if (resultado.matched) return { index, bindings: resultado.bindings };
    }
    return undefined;
  }

  bloquearRamos = function(nodo, escolhido, bloqueados, aguardandoDisor) {
    nodo.ligacoes.forEach((ligacao, index) => {
      if (typeof ligacao !== 'number') return;
      if (index === escolhido) aguardandoDisor.delete(ligacao);
      else bloqueados.add(ligacao);
    });
  }
}