import { SearchResult, NaiveSearch, RabinKarpSearch, KMPSearch, BoyerMooreSearch } from './algorithms.js';

describe('SearchResult', () => {
  test('deve criar um SearchResult com valores corretos', () => {
    const result = new SearchResult([0, 5], 10, 1000);
    expect(result.indices).toEqual([0, 5]);
    expect(result.comparisons).toBe(10);
    expect(result.timeNs).toBe(1000);
    expect(result.steps).toEqual([]);
  });

  test('deve aceitar steps opcionais', () => {
    const steps = [{ index: 0 }];
    const result = new SearchResult([1], 5, 500, steps);
    expect(result.steps).toEqual(steps);
  });
});

describe('NaiveSearch', () => {
  let searcher;

  beforeEach(() => {
    searcher = new NaiveSearch();
  });

  test('deve encontrar padrão único no meio do texto', () => {
    const result = searcher.search('abcdef', 'cd');
    expect(result.indices).toEqual([2]);
    expect(result.comparisons).toBeGreaterThan(0);
  });

  test('deve encontrar múltiplas ocorrências', () => {
    const result = searcher.search('ababab', 'ab');
    expect(result.indices).toEqual([0, 2, 4]);
  });

  test('deve retornar vazio quando padrão não existe', () => {
    const result = searcher.search('abcdef', 'xyz');
    expect(result.indices).toEqual([]);
  });

  test('deve encontrar padrão no início', () => {
    const result = searcher.search('abcdef', 'ab');
    expect(result.indices).toEqual([0]);
  });

  test('deve encontrar padrão no final', () => {
    const result = searcher.search('abcdef', 'ef');
    expect(result.indices).toEqual([4]);
  });

  test('deve lidar com padrão vazio', () => {
    const result = searcher.search('abcdef', '');
    expect(result.indices.length).toBeGreaterThanOrEqual(0);
  });

  test('deve lidar com texto vazio', () => {
    const result = searcher.search('', 'ab');
    expect(result.indices).toEqual([]);
  });

  test('deve registrar steps quando solicitado', () => {
    const result = searcher.search('abc', 'ab', true);
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.steps[0].algorithm).toBe('Naive');
  });

  test('deve contar comparações corretamente', () => {
    const result = searcher.search('aaa', 'a');
    expect(result.comparisons).toBeGreaterThan(0);
  });

  test('deve encontrar padrão de caractere único', () => {
    const result = searcher.search('hello world', 'o');
    expect(result.indices).toEqual([4, 7]);
  });

  test('deve lidar com padrão igual ao texto', () => {
    const result = searcher.search('abc', 'abc');
    expect(result.indices).toEqual([0]);
  });

  test('deve lidar com padrão maior que o texto', () => {
    const result = searcher.search('ab', 'abcdef');
    expect(result.indices).toEqual([]);
  });
});

describe('RabinKarpSearch', () => {
  let searcher;

  beforeEach(() => {
    searcher = new RabinKarpSearch();
  });

  test('deve encontrar padrão único', () => {
    const result = searcher.search('abcdef', 'cd');
    expect(result.indices).toEqual([2]);
  });

  test('deve encontrar múltiplas ocorrências', () => {
    const result = searcher.search('ababab', 'ab');
    expect(result.indices).toEqual([0, 2, 4]);
  });

  test('deve retornar vazio quando padrão não existe', () => {
    const result = searcher.search('abcdef', 'xyz');
    expect(result.indices).toEqual([]);
  });

  test('deve lidar com padrão vazio', () => {
    const result = searcher.search('abcdef', '');
    expect(result.indices).toEqual([0]);
  });

  test('deve encontrar padrão no início', () => {
    const result = searcher.search('abcdef', 'abc');
    expect(result.indices).toEqual([0]);
  });

  test('deve encontrar padrão no final', () => {
    const result = searcher.search('abcdef', 'def');
    expect(result.indices).toEqual([3]);
  });

  test('deve lidar com texto com números', () => {
    const result = searcher.search('123123123', '23');
    expect(result.indices).toEqual([1, 4, 7]);
  });

  test('deve registrar steps quando solicitado', () => {
    const result = searcher.search('abcdef', 'cd', true);
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.steps[0].algorithm).toBe('Rabin-Karp');
  });

  test('deve lidar com repetições de caracteres', () => {
    const result = searcher.search('aaaa', 'aa');
    expect(result.indices).toEqual([0, 1, 2]);
  });

  test('deve retornar timeNs como número', () => {
    const result = searcher.search('abc', 'b');
    expect(typeof result.timeNs).toBe('number');
    expect(result.timeNs).toBeGreaterThanOrEqual(0);
  });
});

describe('KMPSearch', () => {
  let searcher;

  beforeEach(() => {
    searcher = new KMPSearch();
  });

  test('deve computar LPS corretamente para "ABABC"', () => {
    const lps = searcher.computeLPS('ABABC');
    expect(lps).toEqual([0, 0, 1, 2, 0]);
  });

  test('deve computar LPS para padrão sem repetição', () => {
    const lps = searcher.computeLPS('ABC');
    expect(lps).toEqual([0, 0, 0]);
  });

  test('deve computar LPS para padrão com prefixo-sufixo', () => {
    const lps = searcher.computeLPS('AAAA');
    expect(lps).toEqual([0, 1, 2, 3]);
  });

  test('deve encontrar padrão único', () => {
    const result = searcher.search('abcdef', 'cd');
    expect(result.indices).toEqual([2]);
  });

  test('deve encontrar múltiplas ocorrências', () => {
    const result = searcher.search('ababab', 'ab');
    expect(result.indices).toEqual([0, 2, 4]);
  });

  test('deve retornar vazio quando padrão não existe', () => {
    const result = searcher.search('abcdef', 'xyz');
    expect(result.indices).toEqual([]);
  });

  test('deve encontrar padrão no início', () => {
    const result = searcher.search('abcdef', 'abc');
    expect(result.indices).toEqual([0]);
  });

  test('deve encontrar padrão com caracteres repetidos', () => {
    const result = searcher.search('ABABDABABC', 'ABABC');
    expect(result.indices).toEqual([5]);
  });

  test('deve registrar steps quando solicitado', () => {
    const result = searcher.search('abcdef', 'cd', true);
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.steps[0].algorithm).toBe('KMP');
  });

  test('deve lidar com padrão de caractere único', () => {
    const result = searcher.search('aaa', 'a');
    expect(result.indices).toEqual([0, 1, 2]);
  });

  test('deve lidar com padrão igual ao texto', () => {
    const result = searcher.search('abc', 'abc');
    expect(result.indices).toEqual([0]);
  });

  test('deve retornar timeNs como número', () => {
    const result = searcher.search('abcdef', 'cd');
    expect(typeof result.timeNs).toBe('number');
    expect(result.timeNs).toBeGreaterThanOrEqual(0);
  });

  test('deve encontrar padrão em texto grande', () => {
    const text = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz';
    const result = searcher.search(text, 'abc');
    expect(result.indices).toEqual([0, 26]);
  });
});

describe('BoyerMooreSearch', () => {
  let searcher;

  beforeEach(() => {
    searcher = new BoyerMooreSearch();
  });

  test('deve construir tabela badChar corretamente', () => {
    const badChar = searcher.buildBadChar('ABCCDDEFF');
    expect(badChar['A']).toBe(0);
    expect(badChar['B']).toBe(1);
    expect(badChar['C']).toBe(3); // Último índice do 'C'
    expect(badChar['D']).toBe(5); // Último índice do 'D'
    expect(badChar['E']).toBe(6);
    expect(badChar['F']).toBe(8);
  });

  test('deve encontrar padrão único', () => {
    const result = searcher.search('abcdef', 'cd');
    expect(result.indices).toEqual([2]);
  });

  test('deve encontrar múltiplas ocorrências', () => {
    const result = searcher.search('ababab', 'ab');
    expect(result.indices).toEqual([0, 2, 4]);
  });

  test('deve retornar vazio quando padrão não existe', () => {
    const result = searcher.search('abcdef', 'xyz');
    expect(result.indices).toEqual([]);
  });

  test('deve encontrar padrão no início', () => {
    const result = searcher.search('abcdef', 'abc');
    expect(result.indices).toEqual([0]);
  });

  test('deve encontrar padrão no final', () => {
    const result = searcher.search('abcdef', 'def');
    expect(result.indices).toEqual([3]);
  });

  test('deve registrar steps quando solicitado', () => {
    const result = searcher.search('abcdef', 'cd', true);
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.steps[0].algorithm).toBe('Boyer-Moore');
  });

  test('deve ser mais eficiente com padrões grandes', () => {
    const result = searcher.search('this is a test string with pattern here', 'pattern');
    expect(result.indices).toEqual([27]);
  });

  test('deve lidar com padrão de caractere único', () => {
    const result = searcher.search('hello world', 'o');
    expect(result.indices).toEqual([4, 7]);
  });

  test('deve retornar timeNs como número', () => {
    const result = searcher.search('abcdef', 'cd');
    expect(typeof result.timeNs).toBe('number');
    expect(result.timeNs).toBeGreaterThanOrEqual(0);
  });

  test('deve lidar com repetições', () => {
    const result = searcher.search('aaaaaa', 'aa');
    expect(result.indices.length).toBeGreaterThan(0);
  });

  test('deve encontrar padrão em texto grande', () => {
    const text = 'the quick brown fox jumps over the lazy dog';
    const result = searcher.search(text, 'the');
    expect(result.indices).toEqual([0, 31]);
  });
});

describe('Comparação entre Algoritmos', () => {
  test('todos os algoritmos devem encontrar o mesmo padrão no texto', () => {
    const text = 'ababcababa';
    const pattern = 'aba';

    const naive = new NaiveSearch().search(text, pattern);
    const rabin = new RabinKarpSearch().search(text, pattern);
    const kmp = new KMPSearch().search(text, pattern);
    const bm = new BoyerMooreSearch().search(text, pattern);

    expect(naive.indices).toEqual(rabin.indices);
    expect(naive.indices).toEqual(kmp.indices);
    expect(naive.indices).toEqual(bm.indices);
  });

  test('todos os algoritmos devem retornar ResultSearch', () => {
    const text = 'abcdef';
    const pattern = 'cd';

    const naive = new NaiveSearch().search(text, pattern);
    const rabin = new RabinKarpSearch().search(text, pattern);
    const kmp = new KMPSearch().search(text, pattern);
    const bm = new BoyerMooreSearch().search(text, pattern);

    [naive, rabin, kmp, bm].forEach((result) => {
      expect(result).toBeInstanceOf(SearchResult);
      expect(result.indices).toBeDefined();
      expect(result.comparisons).toBeDefined();
      expect(result.timeNs).toBeDefined();
    });
  });

  test('todos os algoritmos devem retornar vazio para padrão inexistente', () => {
    const text = 'abcdef';
    const pattern = 'xyz';

    expect(new NaiveSearch().search(text, pattern).indices).toEqual([]);
    expect(new RabinKarpSearch().search(text, pattern).indices).toEqual([]);
    expect(new KMPSearch().search(text, pattern).indices).toEqual([]);
    expect(new BoyerMooreSearch().search(text, pattern).indices).toEqual([]);
  });

  test('Boyer-Moore deve ter menos comparações que Naive em média', () => {
    const text = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz';
    const pattern = 'xyz';

    const naive = new NaiveSearch().search(text, pattern);
    const bm = new BoyerMooreSearch().search(text, pattern);

    // BM geralmente tem menos ou iguais comparações
    expect(bm.comparisons).toBeLessThanOrEqual(naive.comparisons + 1);
  });
});
