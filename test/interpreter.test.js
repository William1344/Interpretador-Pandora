import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { Interpretador, listValue, normalizarArquivo } from '../index.js';

test('normaliza e executa um programa Pandora', async () => {
  const json = await readFile(new URL('../exemplos/pandora-programa.json', import.meta.url), 'utf8');
  const arquivo = normalizarArquivo(JSON.parse(json));
  const programa = Interpretador(arquivo);

  assert.equal(programa.estado, 4);
  assert.equal(programa.resultado, 7);
  assert.deepEqual(arquivo.saidas, [7]);
});

test('rejeita um arquivo sem funções', () => {
  assert.throws(
    () => Interpretador(normalizarArquivo({ nome: 'invalido', lista: [] })),
    /sem funções para executar/
  );
});

function node(idx, tipo, ligacoes, inputs = [], extras = {}) {
  return { idx, tipo, ligacoes, inputs, outputs: [''], ...extras };
}

function programa(funcoes, entradas = []) {
  return normalizarArquivo({
    nome: 'teste-funcional',
    entradas,
    lista: funcoes
  });
}

test('passa função nomeada como valor para apply', () => {
  const soma = {
    id: 0,
    chamada: 'soma',
    entradas: ['', ''],
    grafo: [
      node(0, 'lig', [2], ['']),
      node(1, 'lig', [2], ['']),
      node(2, 'soma', ['output'], ['', ''])
    ]
  };
  const main = {
    id: 1,
    chamada: 'main',
    entradas: [],
    grafo: [
      node(0, 'func', [3], [], { funcao: 'soma' }),
      node(1, 'const', [3], [2]),
      node(2, 'const', [3], [3]),
      node(3, 'apply', ['output'], ['', '', ''])
    ]
  };

  assert.equal(Interpretador(programa([soma, main])).resultado, 5);
});

test('executa operações imutáveis de lista', () => {
  const main = {
    id: 0,
    chamada: 'main',
    entradas: [],
    grafo: [
      node(0, 'const', [2], [1]),
      node(1, 'list', [2], [], { valor: [2, 3] }),
      node(2, 'cons', [3], ['', '']),
      node(3, 'head', ['output'], [''])
    ]
  };

  assert.equal(Interpretador(programa([main])).resultado, 1);

  const tail = {
    ...main,
    grafo: [
      node(0, 'const', [2], [1]),
      node(1, 'list', [2], [], { valor: [2, 3] }),
      node(2, 'cons', [3], ['', '']),
      node(3, 'tail', ['output'], [''])
    ]
  };
  assert.deepEqual(Interpretador(programa([tail])).resultado, listValue([2, 3]));
});

test('processa listas por recursão com is-empty, head e tail', () => {
  const tamanho = {
    id: 0,
    chamada: 'tamanho',
    entradas: [''],
    grafo: [
      node(0, 'lig', [1], ['']),
      node(1, 'match', [2, 3], [''], {
        padroes: [
          { kind: 'empty-list' },
          {
            kind: 'list-cons',
            head: { kind: 'wildcard' },
            tail: { kind: 'variable', name: 'cauda' }
          }
        ]
      }),
      node(2, 'const', ['output'], [0]),
      node(3, 'func', [5], [], { funcao: 'tamanho' }),
      node(4, 'binding', [5], [], { nome: 'cauda' }),
      node(5, 'apply', [7], ['', '']),
      node(6, 'const', [7], [1]),
      node(7, 'soma', ['output'], ['', ''])
    ]
  };
  const arquivo = programa([tamanho], [{ kind: 'list', elements: [1, 2, 3] }]);
  assert.equal(Interpretador(arquivo).resultado, 3);
});

test('seleciona padrão de lista e expõe bindings no ramo', () => {
  const main = {
    id: 0,
    chamada: 'main',
    entradas: [],
    grafo: [
      node(0, 'list', [1], [], { valor: [7, 8] }),
      node(1, 'match', [2, 3], [''], {
        padroes: [
          { kind: 'empty-list' },
          {
            kind: 'list-cons',
            head: { kind: 'variable', name: 'cabeca' },
            tail: { kind: 'variable', name: 'cauda' }
          }
        ]
      }),
      node(2, 'const', ['output'], [0]),
      node(3, 'binding', ['output'], [], { nome: 'cabeca' })
    ]
  };

  assert.equal(Interpretador(programa([main])).resultado, 7);
});

test('aplica lambda sem captura', () => {
  const lambda = {
    id: 0,
    chamada: 'lambda-1',
    entradas: [''],
    grafo: [
      node(0, 'lig', [2], ['']),
      node(1, 'const', [2], [2]),
      node(2, 'mult', ['output'], ['', ''])
    ]
  };
  const main = {
    id: 1,
    chamada: 'main',
    entradas: [],
    grafo: [
      node(0, 'lambda', [2], [], { funcao: 'lambda-1' }),
      node(1, 'const', [2], [5]),
      node(2, 'apply', ['output'], ['', ''])
    ]
  };

  assert.equal(Interpretador(programa([lambda, main])).resultado, 10);
});

test('rejeita aplicação de valor que não é função e operações em lista vazia', () => {
  const invalidApply = {
    id: 0,
    chamada: 'main',
    entradas: [],
    grafo: [
      node(0, 'const', [1], [1]),
      node(1, 'apply', ['output'], [''])
    ]
  };
  assert.throws(
    () => Interpretador(programa([invalidApply])),
    /Aplicação exige um valor de função/
  );

  const emptyHead = {
    id: 0,
    chamada: 'main',
    entradas: [],
    grafo: [
      node(0, 'list', [1], [], { valor: [] }),
      node(1, 'head', ['output'], [''])
    ]
  };
  assert.throws(
    () => Interpretador(programa([emptyHead])),
    /head exige uma lista não vazia/
  );
});
