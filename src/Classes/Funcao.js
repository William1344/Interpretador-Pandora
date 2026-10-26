import Nodo from './Nodo.js';

/* Definições da função: 
  1) ID da função = [index].
  2) Nome da função e chamada.
  3) Estado da função:
    0 = Não iniciado.
    1 = executando, 
    2 = erro de sintaxe,
    3 = erro de execução,
    4 = finalizado com sucesso
*/
export default class Funcao{
  constructor(dados = {}, index = 0){
    this.id       = dados.id ?? index;    // 1)
    this.chamada  = dados.chamada ?? '';  // 2)
    this.estado   = dados.estado ?? 0;    // 3)
    this.entradas = dados.entradas ?? []; // 4)
    this.grafo    = (dados.grafo ?? []).map((nodo) => new Nodo(nodo)); // 5)
    this.saidas   = dados.saidas ?? [];   // 6)
  }

  // Métodos
}