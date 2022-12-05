/* Definição das propriedades da classe Nodo
  1) O identificador do nodo é um index da lista onde está ou uma string que referencia outra função.
  2) O type refere-se ao tipo de elemento visual presente na linguagem pandora.
  3) Lista de nodos que recebem o output deste nodo, também são a referencia de ligação entre os nodos.
  4) Entradas do nodo, são os valores de entradas do nodo.
  5) Saída do nodo, é o valor de saída do nodo.
*/
export default class Nodo{
  constructor(length, type){
    this.idx        =   length;       // 1) 
    this.type       =   type;         // 2)
    this.ligacoes   =   new Array();  // 3) Lista de nodos que recebem o output deste nodo (Grafo - Lista de adjacência)
    this.entradas   =   new Array();  // 4) Entradas do nodo
    this.saidas     =   "";           // 5) Saída do nodo
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
