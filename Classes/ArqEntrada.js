/* Arquivo de entrada representa um programa que carrega uma lista de funções a serem executadas. 
  1) Nome do arquivo e chave única.
  2) Entradas do arquivo.
  3) Estados do programa: 
    0 = Não iniciado.
    1 = executando.
    2 = erro de sintaxe.
    3 = erro de execução.
    4 = finalizado com sucesso
  4) Lista de nodos que definem a função, output recebe o valor do ultimo nodo.
  5) Valor de output da função, saídas.

  -- A função só é executada quando todos os valores estão definidos, saídas ou entradas.
*/
export default class ArqEntrada{
  constructor(nome){
    this.nome     = nome;                 // 1)
    this.entradas = new Array();          // 2)
    this.estado   = 0;                    // 3)
    this.lista    = new Array();          // 4) 
    this.saidas   = "";                   // 5)
  }
}