/* Definição das propriedades da classe Nodo
  1) O identificador do nodo é um index da lista onde está ou uma string que referencia outra função.
  2) O type refere-se ao tipo de elemento visual presente na linguagem pandora.
  3) Lista de nodos que recebem o output deste nodo, também são a referencia de ligação entre os nodos.
  4) Entradas do nodo, são os valores de entradas do nodo.
  5) Saída do nodo, é o valor de saída do nodo.
*/
export default class Nodo{
  constructor(dados = {}){
    this.idx        = dados.idx ?? 0;                       // 1)
    this.type       = dados.type ?? dados.tipo ?? '';       // 2)
    this.ligacoes   = dados.ligacoes ?? [];                 // 3) Lista de nodos seguintes
    this.ligacaoPortas = dados.ligacaoPortas ?? [];         // Porta de entrada correspondente a cada ligação
    this.entradas   = dados.entradas ?? dados.inputs ?? []; // 4) Entradas do nodo
    this.saidas     = dados.saidas ?? dados.outputs ?? [];  // 5) Saída do nodo
    this.valor      = dados.valor ?? dados.value;            // Valor estruturado ou constante
    this.funcao     = dados.funcao ?? dados.functionId;     // Função referenciada
    this.padroes    = dados.padroes ?? dados.patterns ?? []; // Padrões do nodo match
    this.nome       = dados.nome ?? dados.name;              // Nome de binding
  }

  /* Um nodo só pode executar quando todas as suas entradas receberam valores.
     Constantes são a exceção: seu valor já está armazenado na primeira entrada. */
  pronto() {
    if (this.type === 'visor') {
      return this.entradas.some((entrada) => entrada !== '');
    }
    return ['const', 'list', 'func', 'function', 'ref', 'lambda'].includes(this.type)
      || this.type === 'binding' && this.nome !== undefined
      || this.entradas.length > 0 && this.entradas.every((entrada) => entrada !== '');
  }

  receberEntrada(valor, indice) {
    const indiceVazio = Number.isInteger(indice)
      ? indice
      : this.entradas.findIndex((entrada) => entrada === '');
    if (indiceVazio < 0 || indiceVazio >= this.entradas.length || this.entradas[indiceVazio] !== '') {
      throw new Error(`Nodo ${this.idx} não possui entrada disponível`);
    }
    this.entradas[indiceVazio] = valor;
  }

    /* Calcula o resultado do nodo de acordo com seu tipo de operação.
      Quando ainda faltam entradas, retorna false sem alterar o nodo.
      Chamadas encp usam o resolvedor de funções do Programa. */
    executar(resolverFuncao, contexto = {}) {
    if (!this.pronto()) return false;

    const [primeira, segunda] = this.entradas;
    let resultado;

    // Os operadores Pandora recebem suas entradas pela ordem do vetor.
    switch (this.type) {
      case 'lig':
        resultado = primeira;
        break;
      case 'const':
        resultado = this.valor ?? this.entradas[0];
        break;
      case 'func':
      case 'function':
      case 'ref':
      case 'lambda':
        if (typeof this.funcao !== 'string' || this.funcao === '') {
          throw new Error(`Referência de função ausente no nodo ${this.idx}`);
        }
        resultado = { kind: 'function', functionId: this.funcao };
        break;
      case 'list':
        resultado = {
          kind: 'list',
          elements: (this.valor ?? this.entradas[0] ?? []).slice()
        };
        break;
      case 'cons':
        if (!segunda || segunda.kind !== 'list') {
          throw new Error(`Nodo cons exige uma lista como segundo argumento no nodo ${this.idx}`);
        }
        resultado = {
          kind: 'list',
          elements: [primeira, ...segunda.elements]
        };
        break;
      case 'head':
        if (!primeira || primeira.kind !== 'list' || primeira.elements.length === 0) {
          throw new Error(`Nodo head exige uma lista não vazia no nodo ${this.idx}`);
        }
        resultado = primeira.elements[0];
        break;
      case 'tail':
        if (!primeira || primeira.kind !== 'list' || primeira.elements.length === 0) {
          throw new Error(`Nodo tail exige uma lista não vazia no nodo ${this.idx}`);
        }
        resultado = {
          kind: 'list',
          elements: primeira.elements.slice(1)
        };
        break;
      case 'isempty':
      case 'is-empty':
        if (!primeira || primeira.kind !== 'list') {
          throw new Error(`Nodo is-empty exige uma lista no nodo ${this.idx}`);
        }
        resultado = primeira.elements.length === 0;
        break;
      case 'binding':
        if (typeof this.nome !== 'string' || !(this.nome in (contexto.bindings ?? {}))) {
          throw new Error(`Binding ${this.nome ?? ''} não está disponível no nodo ${this.idx}`);
        }
        resultado = contexto.bindings[this.nome];
        break;
      case 'apply':
        if (typeof resolverFuncao !== 'function') {
          throw new Error(`Nenhum resolvedor disponível para aplicação no nodo ${this.idx}`);
        }
        resultado = resolverFuncao(this.entradas[0], this.entradas.slice(1));
        break;
      case 'soma':
        resultado = primeira + segunda;
        break;
      case 'subs':
        resultado = primeira - segunda;
        break;
      case 'mult':
        resultado = primeira * segunda;
        break;
      case 'divs':
        if (segunda === 0) throw new Error('Divisão por zero');
        resultado = primeira / segunda;
        break;
      case 'igual':
        resultado = primeira === segunda;
        break;
      case 'ngual':
        resultado = primeira !== segunda;
        break;
      case 'meno':
        resultado = primeira < segunda;
        break;
      case 'maio':
        resultado = primeira > segunda;
        break;
      case 'disor':
        if (typeof primeira !== 'boolean') {
          throw new Error(`Condicional disor exige um valor lógico no nodo ${this.idx}`);
        }
        resultado = primeira;
        break;
      case 'visor': {
        const entradaDisponivel = this.entradas.find((entrada) => entrada !== '');
        if (entradaDisponivel === undefined) {
          throw new Error(`Visor sem resultado disponível no nodo ${this.idx}`);
        }
        resultado = entradaDisponivel;
        break;
      }
      case 'encp': {
        const nomeFuncao = this.ligacoes.find((ligacao) => typeof ligacao === 'string');
        if (!nomeFuncao) throw new Error(`Chamada encp sem nome de função no nodo ${this.idx}`);
        if (typeof resolverFuncao !== 'function') {
          throw new Error(`Nenhum resolvedor disponível para a função ${nomeFuncao}`);
        }
        resultado = resolverFuncao(nomeFuncao, this.entradas);
        break;
      }
      case 'match':
        resultado = this.entradas[0];
        break;
      default:
        throw new Error(`Tipo de nodo não suportado: ${this.type}`);
    }

    // O resultado fica disponível para a próxima etapa de propagação.
    this.saidas = [resultado];
    return resultado;
  }

  propagar(nodos) {
    if (this.saidas.length === 0) return;

    for (const [index, ligacao] of this.ligacoes.entries()) {
      if (typeof ligacao !== 'number') continue;
      const destino = nodos.find((nodo) => nodo.idx === ligacao);
      if (!destino) throw new Error(`Nodo de destino não encontrado: ${ligacao}`);
      destino.receberEntrada(this.saidas[0], this.ligacaoPortas[index]);
    }
  }
}
/* Lista de tipos
    + -> "soma"   = -> "igual"
    - -> "subs"  != -> "ngual"
    * -> "mult"   < -> "meno"
    / -> "divs"   > -> "maio"
 rosa -> "rosa" 1/2 -> "disor"
  2/1 -> "visor"  c -> "const"
 func -> "encp"   amarelo -> "lig" 
*/