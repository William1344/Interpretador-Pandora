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
    this.lista    = new Array();        // 4)
    this.createAt = new Date();         // 5)
    this.updateAt = new Date();         // 6)
    /* -- Fazer --
      Implementar a função que transporta o JSON para as classes com os métodos. 
      Essa função deve preparar a estrutura de dados para a execução do programa.
      Todas as funções devem ser executadas pelas classes referentes a os nodos.
    */
  };

  // Funções do programa
  init = function(Arq){
    // Adiciona a função inicial na pilha do programa.
    this.lista.push(Arq.lista[Arq.lista.length-1].nome);
    // Joga os dados iniciais nos nodos iniciais da função.
    const funcao = Arq.lista[Arq.lista.length-1];
    for(let i = 0 ; i < Arq.entradas.length ; i++) 
      funcao.entradas[i] = Arq.entradas[i];
    for(let i = 0 ; i < funcao.entradas.length ; i++) 
      funcao.grafo[i].inputs[i] = funcao.entradas[i];
    return true;
  }
}