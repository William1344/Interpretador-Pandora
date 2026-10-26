import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { Interpretador, normalizarArquivo } from '../index.js';

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
