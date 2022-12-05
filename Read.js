/*  Definições:
  - O interpretador só será inicializado após o start do usuário.
  - E deve receber um Arquivo com blocos de funções representados pela classe ArqEntrada.
  - O indice final da lista é a função inicial e recebe os dados de entradas definidos pelo usuário, 
    ela deve ser responsável pela chamada das outras funções.
  - Deve receber um parâmetro de velocidade de execução, ou seja o tempo de transição dos valores entre 
    os nodos.
  - O interpretador executa o programa de forma sequencial, movendo os valores pelos nodos e executando
    as funções presentes nos operadores lógicos ou condicionais.
  - O interpretador deve ser capaz de executar programas com múltiplas funções.
*/

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
class ArqEntrada{
  constructor(nome, entradas, grafo){
    this.nome     = nome;                 // 1)
    this.entradas = new Array();          // 2)
    this.estado   = 0;                    // 3)
    this.lista    = new Array();          // 4) 
    this.saidas   = "";                   // 5)
  }
}
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
class Funcao{
  constructor(){
    this.id       = 0;                    // 1)
    this.chamada  = "";                   // 2)
    this.estado   = 0;                    // 3)
    this.entradas = new Array();          // 4)
    this.grafo    = new Array();          // 5)
    this.saidas   = new Array();          // 6)
  }
}

/* Definição das propriedades da classe Nodo
  1) O identificador do nodo é um index da lista onde está ou uma string que referencia outra função.
  2) O type refere-se ao tipo de elemento visual presente na linguagem pandora.
  3) Lista de nodos que recebem o output deste nodo, também são a referencia de ligação entre os nodos.
  4) Entradas do nodo, são os valores de entradas do nodo.
  5) Saída do nodo, é o valor de saída do nodo.
*/
class Nodo{
  constructor(length, type){
    this.idx        = length;       // 1) 
    this.type       = type;         // 2)
    this.ligacoes   = new Array();  // 3) Lista de nodos que recebem o output deste nodo (Grafo - Lista de adjacência)
    this.inputs     = new Array();  // 4) Entradas do nodo
    this.output     = "";           // 5) Saída do nodo
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
