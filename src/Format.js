function normalizarNodo(dados, indice) {
  return {
    idx: dados.idx ?? indice,
    type: dados.type ?? dados.tipo ?? '',
    ligacoes: dados.ligacoes ?? [],
    entradas: dados.entradas ?? dados.inputs ?? [],
    saidas: dados.saidas ?? dados.outputs ?? []
  };
}

function normalizarFuncao(dados, indice) {
  return {
    id: dados.id ?? indice,
    chamada: dados.chamada ?? dados.nome ?? '',
    estado: dados.estado ?? 0,
    entradas: dados.entradas ?? dados.inputs ?? [],
    grafo: (dados.grafo ?? []).map(normalizarNodo),
    saidas: dados.saidas ?? dados.outputs ?? []
  };
}

export function normalizarArquivo(dados) {
  return {
    nome: dados.nome ?? '',
    entradas: dados.entradas ?? [],
    estado: dados.estado ?? 0,
    lista: (dados.lista ?? []).map(normalizarFuncao),
    saidas: dados.saidas ?? ''
  };
}
