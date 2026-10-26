## Pacote Node.js

Protótipo de interpretador para a linguagem Pandora, uma linguagem visual e funcional baseada em grafos. O projeto executa programas representados como arquivos JSON, nos quais funções, operações e fluxos de dados são descritos por nodos e ligações.

## Sobre a linguagem Pandora

Pandora foi projetada para o ensino de programação com foco em:

- resolução de problemas;
- composição de funções;
- reutilização de especificações;
- modularidade;
- fluxo de dados explícito;
- ausência de atribuições e variáveis mutáveis.

Um programa Pandora é uma coleção de funções. Cada função recebe zero ou mais entradas e produz um único resultado. Constantes são representadas como funções de aridade zero.

A sintaxe é baseada em uma gramática de grafos equipada com uma álgebra. No protótipo, cada função é um grafo direcionado: os nodos representam valores e operações, enquanto as ligações representam o fluxo dos dados.

## Arquitetura do protótipo

```text
JSON
 |
 v
Read.js
 |
 v
Programa
 |
 +--> Funcao
        |
        +--> Nodo
 |
 v
Interpretador.js
 |
 v
resultado, estado e saída
```

### `Read.js`

Responsável por:

- ler um arquivo JSON estrito;
- normalizar os nomes dos atributos;
- transformar `tipo` em `type`;
- transformar `inputs` em `entradas`;
- transformar `outputs` em `saidas`;
- preparar a estrutura usada pelas classes do interpretador.

A função principal é:

```js
lerArquivo(caminho)
```

### `Programa.js`

Representa o programa em execução e coordena:

- a função inicial;
- as chamadas de funções;
- a preparação dos argumentos;
- a execução dos grafos;
- a recursão;
- os estados de execução;
- o modo detalhado (`verbose`).

A última função da propriedade `lista` é considerada a função inicial do programa.

### `Funcao.js`

Representa uma função Pandora com:

- identificador;
- nome de chamada (`chamada`);
- entradas;
- grafo de nodos;
- saídas;
- estado de execução.

Cada chamada de função recebe um quadro de execução próprio. Isso permite executar funções recursivas sem sobrescrever os dados de outra chamada.

### `Nodo.js`

Representa uma operação ou valor do grafo. Cada nodo possui:

- `idx`: identificador local;
- `type`: tipo do nodo;
- `ligacoes`: índices dos nodos seguintes ou nomes de funções;
- `entradas`: valores recebidos;
- `saidas`: valores produzidos.

Um nodo só é executado quando possui as entradas necessárias. Depois de executar, propaga sua saída pelas ligações numéricas.

### `Interpretador.js`

É o ponto de entrada da execução. Ele:

1. cria o objeto `Programa`;
2. valida e inicializa o arquivo;
3. injeta as entradas na função inicial;
4. executa o grafo;
5. atualiza a saída e o estado do arquivo;
6. registra erros de execução.

A API principal é:

```js
Interpretador(arquivo, { verbose: false })
```

O interpretador retorna o objeto `Programa`, que contém o resultado em `programa.resultado`.

## Nodos disponíveis

| Tipo | Função |
|---|---|
| `lig` | Transporta um valor pelo grafo |
| `const` | Produz uma constante |
| `soma` | Adição |
| `subs` | Subtração |
| `mult` | Multiplicação |
| `divs` | Divisão |
| `igual` | Teste de igualdade |
| `ngual` | Teste de diferença |
| `meno` | Teste de menor que |
| `maio` | Teste de maior que |
| `encp` | Chamada de função definida pelo usuário |
| `disor` | Seleção condicional de um ramo |
| `visor` | Junção de resultados de ramos alternativos |

### Chamadas `encp`

Um nodo `encp` identifica a função chamada por uma ligação textual e usa as entradas do nodo como argumentos:

```json
{
  "idx": 6,
  "tipo": "encp",
  "ligacoes": ["add3", 8],
  "inputs": ["", "", ""],
  "outputs": [""]
}
```

Nesse exemplo, `add3` é chamada com três argumentos e o resultado segue para o nodo `8`.

### Condicionais `disor` e `visor`

O `disor` recebe uma condição booleana. A primeira ligação numérica representa o ramo verdadeiro e a segunda representa o ramo falso:

```text
                +--> ramo verdadeiro
condição -> disor
                +--> ramo falso
```

Somente o ramo selecionado continua a execução. O `visor` reúne os resultados dos ramos em uma única saída.

## Estados de execução

| Estado | Significado |
|---:|---|
| `0` | Não iniciado |
| `1` | Em execução |
| `2` | Erro de sintaxe reservado para validação estrutural |
| `3` | Erro de execução |
| `4` | Finalizado com sucesso |

Em caso de erro, o arquivo recebe a mensagem em `arquivo.erro`. Em caso de sucesso, o resultado fica em `arquivo.saidas`.

## Formato do arquivo JSON

O arquivo deve ser JSON estrito, sem comentários:

```json
{
  "nome": "soma",
  "entradas": [6, 8],
  "estado": 0,
  "lista": [
    {
      "id": 0,
      "chamada": "soma",
      "estado": 0,
      "entradas": ["", ""],
      "saidas": [""],
      "grafo": [
        {
          "idx": 0,
          "tipo": "lig",
          "ligacoes": [2],
          "inputs": [""],
          "outputs": [""]
        },
        {
          "idx": 1,
          "tipo": "lig",
          "ligacoes": [2],
          "inputs": [""],
          "outputs": [""]
        },
        {
          "idx": 2,
          "tipo": "soma",
          "ligacoes": ["output"],
          "inputs": ["", ""],
          "outputs": [""]
        }
      ]
    }
  ]
}
```

A ligação especial `"output"` ou `"x"` indica que o resultado do nodo é a saída da função.

## Executando um programa

A partir da raiz do projeto:

```powershell
node --experimental-default-type=module .\Interpretador-Pandora\teste.js .\Interpretador-Pandora\Testes\rec_fatorial.json
```

O script `teste.js` carrega o JSON, executa o interpretador em modo detalhado e exibe o resultado:

```text
Programa: calculo_fatorial
Resultado: 24
Estado: 4
```

O modo `verbose` mostra, para cada nodo executado:

- função atual;
- `idx`;
- `type`;
- ligações;
- entradas;
- saídas.

## Exemplos incluídos

### Fatorial recursivo

Arquivo: `Testes/rec_fatorial.json`

```text
fatorial(n) =
    1                       se n = 0
    n * fatorial(n - 1)     caso contrário
```

Esse exemplo utiliza constantes, comparação, condicional, chamada recursiva, multiplicação e junção de fluxos.

### Média de três valores

Arquivo: `Testes/media_3v.json`

Esse exemplo demonstra composição de funções: uma função de média chama uma função de soma e usa o resultado em uma divisão.

## Estrutura de diretórios

```text
Interpretador-Pandora/
├── Classes/
│   ├── ArqEntrada.js
│   ├── Funcao.js
│   ├── index.js
│   ├── Nodo.js
│   └── Programa.js
├── Testes/
│   ├── media_3v.json
│   └── rec_fatorial.json
├── Interpretador.js
├── Read.js
├── teste.js
└── README.md
```

## Limitações atuais

Este é um protótipo em desenvolvimento. Ainda são necessários:

- validação estrutural completa dos grafos antes da execução;
- diferenciação completa entre erro de sintaxe e erro de execução;
- sistema formal de tipos numéricos e lógicos;
- suporte a mais tipos de dados;
- tratamento mais rigoroso de aridade e ligações duplicadas;
- testes automatizados permanentes;
- integração com uma IDE visual.

## Artigos relacionados

A linguagem Pandora foi motivada por dois trabalhos:

1. **SILVA, Marina; FERREIRA, Ana Paula Lüdtke.** *Sintaxe baseada em gramáticas de grafos para uma linguagem funcional visual voltada ao aprendizado de programação.* Workshop-Escola de Informática Teórica, 2021. O artigo apresenta a sintaxe formal, o grafo-tipo, as regras da gramática de grafos e exemplos de composição, condicionais e recursão em Pandora.

2. **SILVA, Marina Silva da; FERREIRA, Ana Paula Lüdtke.** *Linguagens visuais para o ensino de programação: uma revisão da literatura com foco em paradigmas de programação.* EduComp'22, 2022. O artigo revisa linguagens visuais voltadas ao ensino, discute os paradigmas de programação subjacentes e fundamenta a busca por uma linguagem visual funcional, composicional e orientada à resolução de problemas.

## Licença e uso

Este repositório contém um protótipo educacional e experimental. Consulte os autores e os termos associados aos artigos de referência antes de redistribuir os materiais originais.

## Pacote Node.js

Pacote Node.js do interpretador da linguagem visual Pandora. O núcleo é
JavaScript ESM e pode ser empacotado para uso tanto na IDE web quanto em
aplicações Node.js.

### Desenvolvimento

```powershell
npm install
npm test
npm run build
```

O build gera `dist/index.js` (API compatível com navegador) e `dist/node.js`
(API que também expõe `lerArquivo`, para ler JSON a partir do sistema de
arquivos).

### Uso

O uso do pacote requer que o desenvolvedor importe o objeto do programa e executar o núcleo, sem depender de acesso a arquivos:

```js
import { Interpretador, normalizarArquivo } from '@pandora-lang/interpreter';

const arquivo = normalizarArquivo(jsonDoEditor);
const programa = Interpretador(arquivo);
console.log(programa.resultado);
```

Durante o desenvolvimento local, o pacote pode ser usado como dependência local, adicionando a seguinte entrada no `package.json` da aplicação Node:

```json
{
  "dependencies": {
    "@pandora-lang/interpreter": "file:../Interpretador-Pandora"
  }
}
```

Para aplicações Node que precisam ler um arquivo JSON:

```js
import { lerArquivo, Interpretador } from '@pandora-lang/interpreter/node';

const programa = Interpretador(lerArquivo('./programa.json'));
```

### Formato

`normalizarArquivo` aceita os nomes canônicos do formato Pandora e também os
aliases legados `tipo`, `inputs` e `outputs`. O último item de `lista` é a
função de entrada, conforme o formato atual dos arquivos em `Testes/`.