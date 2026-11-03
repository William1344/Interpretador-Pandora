# Documentação da Sintaxe Pandora

Esta documentação apresenta a sintaxe da linguagem Pandora e o formato JSON
aceito pelo pacote `@pandora-lang/interpreter`.

Os programas são representados como grafos de nodos. Os exemplos podem ser
escritos ou gerados diretamente em JSON.

## 1. Como ler um grafo Pandora

Cada função possui uma lista de nodos. Um nodo tem, principalmente:

```json
{
  "idx": 0,
  "tipo": "const",
  "ligacoes": ["output"],
  "inputs": [10],
  "outputs": [""]
}
```

- `idx` identifica o nodo dentro da função;
- `tipo` informa a operação;
- `inputs` contém os valores recebidos pelo nodo;
- `ligacoes` indica os próximos nodos;
- `"output"` ou `"x"` indica que o resultado é a saída da função.

Uma ligação numérica aponta para o `idx` de outro nodo. Por exemplo:

```json
"ligacoes": [3]
```

significa que a saída do nodo atual será enviada ao nodo `3`.

As ligações são executadas na ordem em que os valores ficam disponíveis. Um
nodo só executa quando possui todas as entradas necessárias.

## 2. Elementos da linguagem Pandora

Estes nodos permitem transportar valores, produzir constantes, realizar
cálculos, comparar valores, chamar funções e selecionar caminhos condicionais.

| Nodo | Categoria | Função |
|---|---|---|
| `lig` | fluxo | Transporta um valor pelo grafo |
| `const` | valor | Produz uma constante |
| `soma` | aritmética | Soma dois valores |
| `subs` | aritmética | Subtrai o segundo valor do primeiro |
| `mult` | aritmética | Multiplica dois valores |
| `divs` | aritmética | Divide o primeiro valor pelo segundo |
| `igual` | comparação | Testa igualdade |
| `ngual` | comparação | Testa diferença |
| `meno` | comparação | Testa se o primeiro valor é menor |
| `maio` | comparação | Testa se o primeiro valor é maior |
| `encp` | composição | Chama uma função pelo nome |
| `disor` | controle | Escolhe o ramo verdadeiro ou falso |
| `visor` | controle | Reúne o resultado do ramo escolhido |

### 16.1 Como um valor percorre o grafo

Um grafo Pandora pode ser lido como uma expressão de fluxo:

```text
entrada -> operação -> próxima operação -> saída
```

Por exemplo:

```text
2 ----\
       soma ----> resultado
3 ----/
```

Em JSON:

```json
[
  {
    "idx": 0,
    "tipo": "const",
    "valor": 2,
    "ligacoes": [2],
    "inputs": [2],
    "outputs": [""]
  },
  {
    "idx": 1,
    "tipo": "const",
    "valor": 3,
    "ligacoes": [2],
    "inputs": [3],
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
```

Uma ligação numérica aponta para o `idx` de outro nodo. O nodo `2` recebe os
dois valores, executa quando ambos estão disponíveis e publica o resultado
porque possui a ligação especial `"output"`.

## 3. Nodo `lig`

`lig` significa ligação ou passagem de valor. Ele não transforma o valor:
apenas o encaminha para os destinos indicados em `ligacoes`.

```json
{
  "idx": 0,
  "tipo": "lig",
  "ligacoes": [2],
  "inputs": [""],
  "outputs": [""]
}
```

O fluxo é:

```text
valor -> lig(0) -> nodo(2)
```

### Parâmetros de uma função

Os `lig` iniciais de uma função normalmente representam seus parâmetros:

```text
soma(a, b)

a -> lig --\
            soma -> saída
b -> lig --/
```

```json
{
  "id": 0,
  "chamada": "soma",
  "entradas": ["", ""],
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
```

Se uma saída precisa alimentar mais de um nodo, ela pode ter vários destinos:

```json
"ligacoes": [3, 5]
```

Assim, o mesmo valor é propagado para os nodos `3` e `5`.

## 4. Nodo `const`

`const` produz um valor que não depende de entradas:

```text
const(10) -> 10
```

Formato explícito:

```json
{
  "idx": 0,
  "tipo": "const",
  "valor": 10,
  "ligacoes": ["output"],
  "inputs": [10],
  "outputs": [""]
}
```

Também é aceito o formato em que o valor aparece apenas em `inputs[0]`:

```json
{
  "idx": 0,
  "tipo": "const",
  "ligacoes": ["output"],
  "inputs": [10],
  "outputs": [""]
}
```

O campo `valor` torna a intenção mais clara e também é utilizado por valores
estruturados. Uma constante pode ser enviada para vários destinos:

```json
"ligacoes": [2, 4]
```

## 5. Operadores aritméticos

Os operadores aritméticos têm duas entradas, na ordem do vetor `inputs`.

| Nodo | Expressão | Exemplo |
|---|---|---|
| `soma` | primeiro + segundo | `soma(2, 3) = 5` |
| `subs` | primeiro - segundo | `subs(10, 4) = 6` |
| `mult` | primeiro * segundo | `mult(3, 4) = 12` |
| `divs` | primeiro / segundo | `divs(12, 3) = 4` |

Exemplo de nodo:

```json
{
  "idx": 2,
  "tipo": "soma",
  "ligacoes": ["output"],
  "inputs": ["", ""],
  "outputs": [""]
}
```

O grafo abaixo calcula `(10 - 4) * 2`:

```json
[
  {
    "idx": 0,
    "tipo": "const",
    "valor": 10,
    "ligacoes": [2],
    "inputs": [10],
    "outputs": [""]
  },
  {
    "idx": 1,
    "tipo": "const",
    "valor": 4,
    "ligacoes": [2],
    "inputs": [4],
    "outputs": [""]
  },
  {
    "idx": 2,
    "tipo": "subs",
    "ligacoes": [4],
    "inputs": ["", ""],
    "outputs": [""]
  },
  {
    "idx": 3,
    "tipo": "const",
    "valor": 2,
    "ligacoes": [4],
    "inputs": [2],
    "outputs": [""]
  },
  {
    "idx": 4,
    "tipo": "mult",
    "ligacoes": ["output"],
    "inputs": ["", ""],
    "outputs": [""]
  }
]
```

O resultado é `12`. Divisão por zero é um erro explícito:

```text
divs(12, 0) -> erro
```

## 6. Operadores de comparação

Os comparadores recebem dois valores e produzem um booleano:

| Nodo | Significado | Exemplo |
|---|---|---|
| `igual` | primeiro é igual ao segundo | `igual(3, 3) = true` |
| `ngual` | primeiro é diferente do segundo | `ngual(3, 4) = true` |
| `meno` | primeiro é menor que o segundo | `meno(2, 5) = true` |
| `maio` | primeiro é maior que o segundo | `maio(5, 2) = true` |

Exemplo:

```json
{
  "idx": 2,
  "tipo": "igual",
  "ligacoes": [3],
  "inputs": ["", ""],
  "outputs": [""]
}
```

Uma composição comum é:

```text
número -> igual(número, 0) -> disor
```

O resultado booleano pode controlar uma condicional. O interpretador não
converte automaticamente `0`, `1` ou texto em booleano.

## 7. Nodo `encp`

`encp` executa uma função definida no programa. O nome da função é uma
ligação textual; as ligações numéricas indicam os destinos do resultado.

```json
{
  "idx": 3,
  "tipo": "encp",
  "ligacoes": ["soma", 5],
  "inputs": ["", ""],
  "outputs": [""]
}
```

Esse nodo significa:

```text
execute soma com as entradas do nodo
envie o resultado para o nodo 5
```

Se:

```text
soma(a, b) = a + b
```

e um `encp` receber `2` e `3`, ele produzirá `5`.

### Composição

Considere:

```text
dobro(x) = x * 2
quatro() = dobro(2)
```

O corpo de `quatro` pode ser:

```json
[
  {
    "idx": 0,
    "tipo": "const",
    "valor": 2,
    "ligacoes": [1],
    "inputs": [2],
    "outputs": [""]
  },
  {
    "idx": 1,
    "tipo": "encp",
    "ligacoes": ["dobro", "output"],
    "inputs": [""],
    "outputs": [""]
  }
]
```

O `encp` chama `dobro` e publica `4`. Para executar uma função recebida como
valor, use o nodo `apply`.

## 8. Condicionais: `disor` e `visor`

Pandora separa a seleção do caminho da reunião do resultado:

```text
condição -> disor -> ramo verdadeiro
                  -> ramo falso

ramo verdadeiro --\
                    visor -> resultado
ramo falso -------/
```

### `disor`

`disor` recebe um booleano. A primeira ligação numérica é o ramo verdadeiro e
a segunda é o ramo falso:

```json
{
  "idx": 2,
  "tipo": "disor",
  "ligacoes": [3, 4],
  "inputs": [""],
  "outputs": ["", ""]
}
```

```text
disor(true)  -> nodo 3
disor(false) -> nodo 4
```

O ramo não escolhido é bloqueado durante a execução. O nodo exige um booleano;
`0` e `1` não são convertidos automaticamente.

### `visor`

`visor` reúne os dois resultados possíveis:

```json
{
  "idx": 5,
  "tipo": "visor",
  "ligacoes": ["output"],
  "inputs": ["", ""],
  "outputs": [""]
}
```

As entradas correspondem aos ramos verdadeiro e falso. Como apenas um ramo
continua, uma única entrada receberá valor.

### Exemplo: valor absoluto

```text
absoluto(n) =
    n       se n > 0
    0 - n   caso contrário
```

Fluxo:

```text
n -> maio(n, 0) -> disor
                    |       \
                    n       subs(0, n)
                     \       /
                       visor
                         |
                       saída
```

Um esqueleto JSON para esse fluxo é:

```json
[
  {
    "idx": 0,
    "tipo": "lig",
    "ligacoes": [1, 2, 6],
    "inputs": [""],
    "outputs": [""]
  },
  {
    "idx": 1,
    "tipo": "const",
    "valor": 0,
    "ligacoes": [2, 5],
    "inputs": [0],
    "outputs": [""]
  },
  {
    "idx": 2,
    "tipo": "maio",
    "ligacoes": [3],
    "inputs": ["", ""],
    "outputs": [""]
  },
  {
    "idx": 3,
    "tipo": "disor",
    "ligacoes": [4, 5],
    "inputs": [""],
    "outputs": ["", ""]
  },
  {
    "idx": 4,
    "tipo": "lig",
    "ligacoes": [6],
    "inputs": [""],
    "outputs": [""]
  },
  {
    "idx": 5,
    "tipo": "subs",
    "ligacoes": [6],
    "inputs": ["", ""],
    "outputs": [""]
  },
  {
    "idx": 6,
    "tipo": "visor",
    "ligacoes": ["output"],
    "inputs": ["", ""],
    "outputs": [""]
  }
]
```

## 9. Valores de função

Uma função pode ser chamada diretamente por meio de um nodo `encp`, que
conhece o nome da função:

```json
{
  "tipo": "encp",
  "ligacoes": ["soma", 4],
  "inputs": ["", ""]
}
```

Isso representa uma chamada direta. Uma função também pode ser produzida como
um valor e transportada pelo grafo.

Um valor de função tem esta forma interna:

```json
{
  "kind": "function",
  "functionId": "soma"
}
```

O programa não precisa escrever esse objeto diretamente como entrada. Ele é
produzido por um nodo `func` ou `lambda`.

## 10. Nodo `func`

O nodo `func` cria um valor que referencia uma função nomeada. Ele não executa
a função imediatamente.

```json
{
  "idx": 0,
  "tipo": "func",
  "funcao": "soma",
  "ligacoes": [3],
  "inputs": [],
  "outputs": [""]
}
```

A diferença entre `func` e `encp` é:

```text
func("soma")        -> produz a função soma
encp("soma", 2, 3)  -> executa soma com os argumentos
```

O identificador informado em `funcao` precisa corresponder ao campo
`chamada` de alguma função do programa.

### Exemplo: produzir uma função

O programa abaixo retorna a função `soma` como resultado:

```json
{
  "nome": "retorna-funcao",
  "entradas": [],
  "lista": [
    {
      "id": 0,
      "chamada": "soma",
      "entradas": ["", ""],
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
    },
    {
      "id": 1,
      "chamada": "main",
      "entradas": [],
      "grafo": [
        {
          "idx": 0,
          "tipo": "func",
          "funcao": "soma",
          "ligacoes": ["output"],
          "inputs": [],
          "outputs": [""]
        }
      ]
    }
  ]
}
```

Como a última função da lista é a função de entrada, `main` é executada. O
resultado é um valor de função, não o número `0` nem a execução de `soma`.

## 11. Nodo `apply`

O nodo `apply` executa uma função recebida como valor.

As entradas possuem esta ordem:

```text
entrada 0: função
entrada 1: primeiro argumento
entrada 2: segundo argumento
...
```

Assim:

```text
apply(soma, 2, 3) = 5
```

### Exemplo completo: `apply(soma, 2, 3)`

```json
{
  "nome": "aplicacao",
  "entradas": [],
  "lista": [
    {
      "id": 0,
      "chamada": "soma",
      "entradas": ["", ""],
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
    },
    {
      "id": 1,
      "chamada": "main",
      "entradas": [],
      "grafo": [
        {
          "idx": 0,
          "tipo": "func",
          "funcao": "soma",
          "ligacoes": [3],
          "inputs": [],
          "outputs": [""]
        },
        {
          "idx": 1,
          "tipo": "const",
          "valor": 2,
          "ligacoes": [3],
          "inputs": [2],
          "outputs": [""]
        },
        {
          "idx": 2,
          "tipo": "const",
          "valor": 3,
          "ligacoes": [3],
          "inputs": [3],
          "outputs": [""]
        },
        {
          "idx": 3,
          "tipo": "apply",
          "ligacoes": ["output"],
          "inputs": ["", "", ""],
          "outputs": [""]
        }
      ]
    }
  ]
}
```

O campo `valor` representa o valor de constantes estruturadas. No caso de
`const`, o interpretador também aceita o valor em `inputs[0]`.

### Aridade

A quantidade de argumentos precisa coincidir com a quantidade de entradas da
função:

```text
soma possui aridade 2
apply(soma, 2)       -> erro
apply(soma, 2, 3, 4) -> erro
```

O erro é produzido durante a execução e informa a aridade esperada e a
quantidade recebida.

## 12. Nodo `list`

O nodo `list` produz uma lista imutável.

```json
{
  "idx": 0,
  "tipo": "list",
  "valor": [1, 2, 3],
  "ligacoes": ["output"],
  "inputs": [],
  "outputs": [""]
}
```

O valor produzido é conceitualmente:

```js
{
  kind: "list",
  elements: [1, 2, 3]
}
```

O campo `valor` deve conter um array JSON. Listas podem ser aninhadas:

```json
{
  "tipo": "list",
  "valor": [[1, 2], [3, 4]]
}
```

Por enquanto, a implementação aceita elementos de tipos diferentes, mas não
faz verificação estática de homogeneidade.

## 13. Nodo `cons`

`cons` adiciona um elemento no início de uma lista:

```text
cons(1, [2, 3]) = [1, 2, 3]
```

A primeira entrada é o elemento e a segunda entrada é a lista:

```json
{
  "idx": 2,
  "tipo": "cons",
  "ligacoes": ["output"],
  "inputs": ["", ""],
  "outputs": [""]
}
```

O resultado é uma nova lista. A lista recebida não é alterada.

```text
lista original: [2, 3]
cons(1, lista):  [1, 2, 3]
lista original: [2, 3]
```

O segundo argumento precisa ser um valor de lista. Caso contrário, o
interpretador produz um erro.

## 14. Nodos `head` e `tail`

### `head`

Retorna o primeiro elemento:

```text
head([10, 20, 30]) = 10
```

### `tail`

Retorna uma nova lista sem o primeiro elemento:

```text
tail([10, 20, 30]) = [20, 30]
```

Ambos recebem uma lista na primeira entrada:

```json
{
  "idx": 1,
  "tipo": "head",
  "ligacoes": ["output"],
  "inputs": [""],
  "outputs": [""]
}
```

```json
{
  "idx": 1,
  "tipo": "tail",
  "ligacoes": ["output"],
  "inputs": [""],
  "outputs": [""]
}
```

`head([])` e `tail([])` geram erro explícito, porque a lista vazia não possui
primeiro elemento nem cauda não vazia.

## 15. Nodo `is-empty`

`is-empty` verifica se o valor é uma lista vazia:

```text
is-empty([])       = true
is-empty([1, 2])   = false
```

Exemplo:

```json
{
  "idx": 1,
  "tipo": "is-empty",
  "ligacoes": ["output"],
  "inputs": [""],
  "outputs": [""]
}
```

O nodo exige um valor de lista. Um número, booleano ou função não é
automaticamente convertido em lista.

## 16. Recursão sobre listas

A recursão já existia em Pandora. As operações de lista permitem usá-la para
percorrer uma coleção.

O padrão conceitual é:

```text
tamanho([]) = 0
tamanho(lista) = 1 + tamanho(tail(lista))
```

No grafo, isso normalmente envolve:

1. receber a lista como entrada;
2. testar se ela está vazia;
3. produzir `0` no caso-base;
4. obter a cauda;
5. chamar recursivamente a própria função;
6. somar `1` ao resultado.

Uma alternativa mais declarativa usa `match`, apresentada na próxima seção.

O interpretador cria um quadro de execução separado para cada chamada
recursiva. Assim, a lista e os resultados de uma chamada não sobrescrevem os
valores de outra chamada.

É importante sempre criar um caso-base. Sem ele, a execução continuará
chamando a função até falhar por não conseguir progredir ou por exceder os
recursos disponíveis.

## 17. Padrões e o nodo `match`

O nodo `match` recebe um valor e testa seus padrões na ordem em que aparecem.
O primeiro padrão compatível seleciona o ramo correspondente.

```text
match valor
  padrão 0 -> primeira ligação
  padrão 1 -> segunda ligação
  ...
```

Os padrões ficam no campo `padroes`:

```json
{
  "idx": 1,
  "tipo": "match",
  "padroes": [
    { "kind": "empty-list" },
    { "kind": "wildcard" }
  ],
  "ligacoes": [2, 3],
  "inputs": [""],
  "outputs": [""]
}
```

### Padrão literal

Casa somente com o valor indicado:

```json
{ "kind": "literal", "value": 0 }
```

Exemplos:

```text
0 casa com 0
0 não casa com 1
```

### Padrão curinga

Casa com qualquer valor e não cria um binding:

```json
{ "kind": "wildcard" }
```

É equivalente ao `_` em linguagens funcionais.

### Padrão de lista vazia

Casa somente com `[]`:

```json
{ "kind": "empty-list" }
```

### Padrão de variável

Casa com qualquer valor e salva esse valor com um nome:

```json
{
  "kind": "variable",
  "name": "valor"
}
```

O binding fica disponível apenas no ramo selecionado.

### Padrão de lista não vazia

O padrão `list-cons` separa a cabeça e a cauda:

```json
{
  "kind": "list-cons",
  "head": {
    "kind": "variable",
    "name": "cabeca"
  },
  "tail": {
    "kind": "variable",
    "name": "cauda"
  }
}
```

Para a lista `[10, 20, 30]`, o resultado é:

```text
cabeca = 10
cauda  = [20, 30]
```

## 18. Nodo `binding`

O nodo `binding` lê um valor capturado pelo `match`:

```json
{
  "idx": 3,
  "tipo": "binding",
  "nome": "cabeca",
  "ligacoes": ["output"],
  "inputs": [],
  "outputs": [""]
}
```

Se o padrão selecionado tiver criado `cabeca`, esse nodo produzirá o valor
capturado. Se o binding não existir no ramo, ocorrerá um erro.

### Exemplo: obter a cabeça de uma lista

O trecho conceitual é:

```text
match [7, 8]
  []       -> 0
  [h | t]  -> h
```

Em JSON:

```json
[
  {
    "idx": 0,
    "tipo": "list",
    "valor": [7, 8],
    "ligacoes": [1],
    "inputs": [],
    "outputs": [""]
  },
  {
    "idx": 1,
    "tipo": "match",
    "padroes": [
      { "kind": "empty-list" },
      {
        "kind": "list-cons",
        "head": { "kind": "variable", "name": "h" },
        "tail": { "kind": "variable", "name": "t" }
      }
    ],
    "ligacoes": [2, 3],
    "inputs": [""],
    "outputs": [""]
  },
  {
    "idx": 2,
    "tipo": "const",
    "valor": 0,
    "ligacoes": ["output"],
    "inputs": [0],
    "outputs": [""]
  },
  {
    "idx": 3,
    "tipo": "binding",
    "nome": "h",
    "ligacoes": ["output"],
    "inputs": [],
    "outputs": [""]
  }
]
```

O resultado será `7`.

## 19. Nodo `lambda`

Em Pandora, `lambda` representa uma função anônima sem captura. O nodo produz
um valor de função, mas não executa seu corpo.

```json
{
  "idx": 0,
  "tipo": "lambda",
  "funcao": "lambda-1",
  "ligacoes": [2],
  "inputs": [],
  "outputs": [""]
}
```

A definição do corpo fica na lista de funções:

```json
{
  "id": 0,
  "chamada": "lambda-1",
  "entradas": [""],
  "grafo": [
    {
      "idx": 0,
      "tipo": "lig",
      "ligacoes": [1],
      "inputs": [""],
      "outputs": [""]
    },
    {
      "idx": 1,
      "tipo": "const",
      "valor": 2,
      "ligacoes": [2],
      "inputs": [2],
      "outputs": [""]
    },
    {
      "idx": 2,
      "tipo": "mult",
      "ligacoes": ["output"],
      "inputs": ["", ""],
      "outputs": [""]
    }
  ]
}
```

Esse corpo representa:

```text
x -> x * 2
```

Quando o valor produzido por `lambda` for enviado ao `apply` com `5`, o
resultado será `10`.

Nesta versão, a função anônima:

- não captura valores externos;
- possui um identificador interno;
- pode receber parâmetros;
- pode ser passada para `apply`;
- não deve depender de variáveis ou bindings de outra função.

## 20. Diferença entre os nodos principais

| Nodo | O que faz |
|---|---|
| `encp` | Executa diretamente uma função conhecida por nome |
| `func` | Produz uma função nomeada como valor |
| `lambda` | Produz uma função anônima sem captura |
| `apply` | Executa uma função recebida como valor |
| `list` | Cria uma lista |
| `cons` | Cria uma nova lista adicionando um elemento |
| `head` | Extrai o primeiro elemento |
| `tail` | Extrai o restante da lista |
| `is-empty` | Testa se a lista está vazia |
| `match` | Escolhe o primeiro padrão compatível |
| `binding` | Lê um valor capturado por um padrão |

## 21. Erros comuns

### Usar uma função como se fosse um número

`func` apenas produz uma referência. Para executar a função, use `apply` ou
`encp`.

### Aplicar um valor que não é função

O primeiro argumento de `apply` precisa ser produzido por `func` ou `lambda`.

### Passar aridade incorreta

Uma função com dois parâmetros precisa receber exatamente dois argumentos.

### Usar `head` ou `tail` em `[]`

Essas operações geram erro para a lista vazia.

### Passar um valor não-lista para `cons`, `head`, `tail` ou `is-empty`

Esses nodos exigem valores com `kind: "list"`.

### Usar um binding no ramo errado

Um nome capturado por um padrão só existe no ramo selecionado pelo `match`.

### Colocar um curinga antes de um padrão específico

Os padrões são testados de cima para baixo:

```text
match valor
  _  -> primeiro ramo
  [] -> nunca alcançado
```

Por isso, padrões específicos devem aparecer antes do curinga.

## 22. Como executar um exemplo

Os testes automatizados do pacote contêm exemplos executáveis desses nodos em
[`test/interpreter.test.js`](./test/interpreter.test.js).

Na pasta do interpretador:

```powershell
npm test
```

Para usar um arquivo JSON próprio:

```powershell
node .\test\teste.js .\meu-programa.json
```

Um programa pode combinar `lig`, `const`, operadores, `encp`, `disor`, `visor`,
`func`, `lambda`, `apply`, operações de lista, `match` e `binding`.


## 23. Programa completo: média de dois valores

Este programa calcula:

```text
média(a, b) = (a + b) / 2
```

```json
{
  "nome": "media",
  "entradas": [8, 6],
  "lista": [
    {
      "id": 0,
      "chamada": "media",
      "entradas": ["", ""],
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
          "ligacoes": [4],
          "inputs": ["", ""],
          "outputs": [""]
        },
        {
          "idx": 3,
          "tipo": "const",
          "valor": 2,
          "ligacoes": [4],
          "inputs": [2],
          "outputs": [""]
        },
        {
          "idx": 4,
          "tipo": "divs",
          "ligacoes": ["output"],
          "inputs": ["", ""],
          "outputs": [""]
        }
      ]
    }
  ]
}
```

O resultado é `7`. O fluxo pode ser visualizado como:

```text
8 ----\
       soma ----\
6 ----/         divs ----> 7
          2 ---/
```

## 24. Como estudar qualquer programa Pandora

Ao analisar um programa, siga esta ordem:

1. encontre a última função da lista: ela é a função de entrada;
2. identifique os `lig` que recebem os parâmetros;
3. localize as constantes;
4. siga as ligações numéricas;
5. confira a quantidade de entradas de cada operador;
6. observe onde aparece `"output"` ou `"x"`;
7. em condicionais, identifique os dois destinos do `disor`;
8. procure o `visor` que reúne os ramos;
9. em `encp`, procure a função pelo nome textual;
10. somente depois acompanhe a ordem de execução.

Uma boa prática é escrever primeiro a expressão equivalente:

```text
media(a, b) = divs(encp("soma", a, b), 2)
```

Depois, traduza essa expressão para nodos e ligações. O grafo é uma
representação visual da composição, não uma sequência de comandos
imperativos.

Os nodos podem ser combinados livremente. Uma função pode usar `encp` para
chamar outra função, `match` para decompor uma lista e `apply` para executar
uma função recebida como valor.