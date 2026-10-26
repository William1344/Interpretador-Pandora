import Programa from './Classes/Programa.js';

/*
  Ponto de entrada do interpretador Pandora.

  Arq é o objeto produzido por Read.lerArquivo e contém as funções, os nodos
  e os valores de entrada do programa. Programa mantém a estrutura executável;
  este módulo coordena o ciclo de vida e mantém Arq sincronizado com ele.

  O interpretador executa de forma síncrona. O parâmetro verbose é repassado
  até Programa.executar para permitir o rastreamento dos nodos.
*/
export default function Interpretador(Arq, opcoes = {}) {
  const programa = new Programa(Arq, 0);
  const verbose = typeof opcoes === 'boolean' ? opcoes : opcoes.verbose ?? false;

  try {
    // A inicialização prepara a função final da lista como ponto de entrada.
    IniciaPrograma(programa, Arq);

    // Programa executa o grafo, incluindo chamadas encp, disor e visor.
    const resultado = ExecutaPrograma(programa, verbose);

    // A saída e o estado final também ficam disponíveis no arquivo de entrada.
    FinalizaPrograma(programa, Arq, resultado);
    programa.resultado = resultado;
    return programa;
  } catch (erro) {
    // Erros de estrutura ou execução interrompem o programa e são registrados.
    InterrompePrograma(programa, Arq, erro);
    throw erro;
  }
}

/* Estado 0 -> 1: valida o arquivo e injeta as entradas na função inicial. */
export function IniciaPrograma(Prog, Arq) {
  if (!Arq || !Array.isArray(Arq.lista) || Arq.lista.length === 0) {
    throw new Error('Arquivo Pandora sem funções para executar');
  }

  Prog.init(Arq);
  Arq.estado = Prog.estado;
}

/* Estado 1 -> 4 ou 3: delega a execução do grafo ao objeto Programa. */
export function ExecutaPrograma(Prog, verbose = false) {
  if (Prog.estado !== 1) {
    throw new Error(`Programa não está pronto para executar (estado ${Prog.estado})`);
  }

  return Prog.executar(verbose);
}

/* Estado de erro: preserva a mensagem para a interface ou para o chamador. */
export function InterrompePrograma(Prog, Arq, erro) {
  Prog.estado = 3;
  Arq.estado = 3;
  Arq.erro = erro.message;
  Prog.updateAt = new Date();
}

/* Estado de sucesso: publica o resultado no arquivo de entrada. */
export function FinalizaPrograma(Prog, Arq, resultado) {
  Prog.estado = 4;
  Arq.estado = 4;
  Arq.saidas = [resultado];
  Prog.updateAt = new Date();
}
