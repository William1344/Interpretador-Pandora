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
import { Programa  } from './Classes';

export default function Interpretador(Arq, time){
  /* 
    Executa o programa
    - Joga os dados de entradas na função inicial.
    - Executa a função inicial.
    - Executa o grafo, transitando os dados pelos nodos com restrições de saída.
    - A cada estado os dados nos nodos são avaliados e executados, transitando de acordo com as restrições.
    - O programa encerra, quando o dado chega no nodo de saída. 
  */
  let prog = new Programa(Arq);
  while(Arq.estado!= 4){
    setInterval(clock(prog, Arq), (time*1000));
  }
}

function clock(Prog, Arq){
  /* 
    Executa o programa a cada intervalo de tempo 
    - De acordo com o estado do programa é executado uma ação.
    - Se o estado for 0, o programa é iniciado.
    - Se o estado for 1, o programa é executado.
    - Se o estado for 2, o programa é interrompido.
    - Se o estado for 3, o programa é interrompido.
    - Se o estado for 4, o programa é finalizado.
  */
  switch(Prog.estado){
    case 0: // Inicia o programa
      IniciaPrograma(Prog, Arq);
      break;
    case 1: // Executa o programa
      ExecutaPrograma(Prog, Arq);
      break;
    case 2: // Interrompe o programa por erro de sintaxe 
      InterrompePrograma(Prog, Arq);
      break;
    case 3: // Interrompe o programa por erro de execução
      InterrompePrograma(Prog, Arq);
      break;
    case 4: // Finaliza o programa
      FinalizaPrograma(Prog, Arq);
      break;
    default:
      console.log("Erro de algo ai!");
  }
}
/*
  Como meu programa deve estar!
  {
    "nome"      : "media_3_val",
    "entradas"  : [ 6, 8, 6 ],
    "estado"    : 0, // começa no estado 0

  }

*/
function IniciaPrograma(Prog, Arq){
  /* 
    Inicia o programa, jogando os dados de entradas na função inicial.
    - A função inicial é a última função da lista de funções.
    - Os dados de entradas são jogados no nodo de entrada da função inicial.
    - O estado do programa é alterado para 1.
  */
  Prog.init(Arq);
}

function ExecutaPrograma(Prog, Arq){
  /* 
    Executa o programa, transitando os dados pelos nodos com restrições de saída.
    - O programa é executado a cada intervalo de tempo.
    - O programa é executado até que o dado chegue no nodo de saída.
    - O programa é interrompido quando um erro de execução é encontrado.
  */
  
}

function InterrompePrograma(Prog, Arq){
  /* 
    Interrompe o programa, quando um erro de execução é encontrado.
    - O programa é interrompido quando um erro de execução é encontrado.
    - O estado do programa é alterado para 3.
  */
  
}

function FinalizaPrograma(Prog, Arq){
  /* 
    Finaliza o programa, quando o dado chega no nodo de saída.
    - O programa é finalizado quando o dado chega no nodo de saída.
    - O estado do programa é alterado para 4.
  */
  
}