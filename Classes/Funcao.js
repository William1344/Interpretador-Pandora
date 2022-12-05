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
  constructor(index, nome){
    this.id       = index;                // 1)
    this.chamada  = nome;                 // 2)
    this.estado   = 0;                    // 3)
    this.entradas = new Array();          // 4)
    this.grafo    = new Array();          // 5)
    this.saidas   = new Array();          // 6)
  }

  // Métodos
}