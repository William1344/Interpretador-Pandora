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
    this.entradas   = dados.entradas ?? dados.inputs ?? []; // 4) Entradas do nodo
    this.saidas     = dados.saidas ?? dados.outputs ?? [];  // 5) Saída do nodo
  }

  /* Um nodo só pode executar quando todas as suas entradas receberam valores.
     Constantes são a exceção: seu valor já está armazenado na primeira entrada. */
  pronto() {
    if (this.type === 'visor') {
      return this.entradas.some((entrada) => entrada !== '');
    }
    return this.type === 'const' || this.entradas.length > 0 && this.entradas.every((entrada) => entrada !== '');
  }

  receberEntrada(valor) {
    const indiceVazio = this.entradas.findIndex((entrada) => entrada === '');
    if (indiceVazio === -1) throw new Error(`Nodo ${this.idx} não possui entrada disponível`);
    this.entradas[indiceVazio] = valor;
  }

    /* Calcula o resultado do nodo de acordo com seu tipo de operação.
      Quando ainda faltam entradas, retorna false sem alterar o nodo.
      Chamadas encp usam o resolvedor de funções do Programa. */
    executar(resolverFuncao) {
    if (!this.pronto()) return false;

    const [primeira, segunda] = this.entradas;
    let resultado;

    // Os operadores Pandora recebem suas entradas pela ordem do vetor.
    switch (this.type) {
      case 'lig':
        resultado = primeira;
        break;
      case 'const':
        resultado = this.entradas[0];
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
      default:
        throw new Error(`Tipo de nodo não suportado: ${this.type}`);
    }

    // O resultado fica disponível para a próxima etapa de propagação.
    this.saidas = [resultado];
    return resultado;
  }

  propagar(nodos) {
    if (this.saidas.length === 0) return;

    for (const ligacao of this.ligacoes) {
      if (typeof ligacao !== 'number') continue;
      const destino = nodos.find((nodo) => nodo.idx === ligacao);
      if (!destino) throw new Error(`Nodo de destino não encontrado: ${ligacao}`);
      destino.receberEntrada(this.saidas[0]);
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