export { default as Interpretador, IniciaPrograma, ExecutaPrograma, InterrompePrograma, FinalizaPrograma } from './src/Interpretador.js';
export { normalizarArquivo } from './src/Format.js';
export {
  functionValue,
  listValue,
  isFunctionValue,
  isListValue,
  matchPattern
} from './src/Runtime.js';
export { ArqEntrada, Funcao, Nodo, Programa } from './src/Classes/index.js';
