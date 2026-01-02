import { describe, expect, it } from 'vitest';
import {
  Anexo,
  nullToUndefined,
  parseAnexos,
  parseJson,
  safeJoin,
  safeStringValue,
  serializeAnexos,
  serializeMensagemComAnexos,
  undefinedToNull,
} from '../type-helpers';

describe('type-helpers', () => {
  describe('parseAnexos', () => {
    it('deve converter Json para array de Anexo[]', () => {
      const json = [
        {
          url: 'https://example.com/file.pdf',
          tipo: 'pdf',
          nome: 'documento.pdf',
          tamanho: 1024,
        },
      ];
      const result = parseAnexos(json as any);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        url: 'https://example.com/file.pdf',
        tipo: 'pdf',
        nome: 'documento.pdf',
        tamanho: 1024,
      });
    });

    it('deve retornar array vazio para null', () => {
      expect(parseAnexos(null)).toEqual([]);
    });

    it('deve retornar array vazio para undefined', () => {
      expect(parseAnexos(undefined)).toEqual([]);
    });

    it('deve retornar array vazio para não-array', () => {
      expect(parseAnexos('invalid' as any)).toEqual([]);
      expect(parseAnexos(123 as any)).toEqual([]);
      expect(parseAnexos({} as any)).toEqual([]);
    });
  });

  describe('serializeAnexos', () => {
    it('deve converter array de Anexo[] para Json', () => {
      const anexos: Anexo[] = [
        {
          url: 'https://example.com/file.pdf',
          tipo: 'pdf',
          nome: 'documento.pdf',
          tamanho: 1024,
        },
      ];
      const result = serializeAnexos(anexos);
      expect(result).toEqual(anexos);
    });

    it('deve retornar array vazio para undefined', () => {
      expect(serializeAnexos(undefined)).toEqual([]);
    });

    it('deve retornar array vazio para array vazio', () => {
      expect(serializeAnexos([])).toEqual([]);
    });
  });

  describe('serializeMensagemComAnexos', () => {
    it('deve serializar mensagem com anexos', () => {
      const mensagem = {
        id: '123',
        texto: 'Teste',
        anexos: [
          {
            url: 'https://example.com/file.pdf',
            tipo: 'pdf',
            nome: 'documento.pdf',
            tamanho: 1024,
          },
        ],
      };
      const result = serializeMensagemComAnexos(mensagem);
      expect(result).toMatchObject({
        id: '123',
        texto: 'Teste',
        anexos: mensagem.anexos,
      });
    });

    it('deve lidar com mensagem sem anexos', () => {
      const mensagem: { id: string; texto: string; anexos?: Anexo[] } = {
        id: '123',
        texto: 'Teste',
      };
      const result = serializeMensagemComAnexos(mensagem);
      expect(result).toMatchObject({
        id: '123',
        texto: 'Teste',
        anexos: [],
      });
    });
  });

  describe('parseJson', () => {
    it('deve converter Json para tipo genérico', () => {
      interface TestType {
        name: string;
        value: number;
      }
      const json = { name: 'test', value: 42 };
      const defaultValue: TestType = { name: '', value: 0 };
      const result = parseJson<TestType>(json as any, defaultValue);
      expect(result).toEqual({ name: 'test', value: 42 });
    });

    it('deve retornar valor padrão para null', () => {
      const defaultValue = { name: 'default', value: 0 };
      const result = parseJson(null, defaultValue);
      expect(result).toEqual(defaultValue);
    });

    it('deve retornar valor padrão para undefined', () => {
      const defaultValue = { name: 'default', value: 0 };
      const result = parseJson(undefined, defaultValue);
      expect(result).toEqual(defaultValue);
    });
  });

  describe('safeJoin', () => {
    it('deve converter null para undefined', () => {
      expect(safeJoin(null)).toBeUndefined();
    });

    it('deve manter undefined', () => {
      expect(safeJoin(undefined)).toBeUndefined();
    });

    it('deve manter valor válido', () => {
      const value = { name: 'test' };
      expect(safeJoin(value)).toBe(value);
    });

    it('deve funcionar com tipos primitivos', () => {
      expect(safeJoin('string')).toBe('string');
      expect(safeJoin(42)).toBe(42);
      expect(safeJoin(true)).toBe(true);
    });
  });

  describe('nullToUndefined', () => {
    it('deve converter null para undefined', () => {
      expect(nullToUndefined(null)).toBeUndefined();
    });

    it('deve manter string válida', () => {
      expect(nullToUndefined('test')).toBe('test');
    });

    it('deve manter número', () => {
      expect(nullToUndefined(42)).toBe(42);
    });

    it('deve manter objeto', () => {
      const obj = { name: 'test' };
      expect(nullToUndefined(obj)).toBe(obj);
    });

    it('deve manter array', () => {
      const arr = [1, 2, 3];
      expect(nullToUndefined(arr)).toBe(arr);
    });
  });

  describe('undefinedToNull', () => {
    it('deve converter undefined para null', () => {
      expect(undefinedToNull(undefined)).toBeNull();
    });

    it('deve manter string válida', () => {
      expect(undefinedToNull('test')).toBe('test');
    });

    it('deve manter número', () => {
      expect(undefinedToNull(42)).toBe(42);
    });

    it('deve manter objeto', () => {
      const obj = { name: 'test' };
      expect(undefinedToNull(obj)).toBe(obj);
    });

    it('deve manter null', () => {
      expect(undefinedToNull(null)).toBeNull();
    });
  });

  describe('safeStringValue', () => {
    it('deve retornar string vazia para null', () => {
      expect(safeStringValue(null)).toBe('');
    });

    it('deve retornar string vazia para undefined', () => {
      expect(safeStringValue(undefined)).toBe('');
    });

    it('deve manter string válida', () => {
      expect(safeStringValue('test')).toBe('test');
    });

    it('deve manter string vazia', () => {
      expect(safeStringValue('')).toBe('');
    });

    it('deve funcionar em inputs de formulário', () => {
      // Simular valor de input
      const formValue: string | null = null;
      const inputValue = safeStringValue(formValue);
      expect(inputValue).toBe('');
      expect(typeof inputValue).toBe('string');
    });
  });

  describe('integração', () => {
    it('deve serializar e parsear anexos corretamente', () => {
      const anexos: Anexo[] = [
        {
          url: 'https://example.com/file1.pdf',
          tipo: 'pdf',
          nome: 'documento1.pdf',
          tamanho: 1024,
        },
        {
          url: 'https://example.com/file2.jpg',
          tipo: 'image',
          nome: 'imagem.jpg',
          tamanho: 2048,
        },
      ];

      const serialized = serializeAnexos(anexos);
      const parsed = parseAnexos(serialized);

      expect(parsed).toHaveLength(2);
      expect(parsed).toEqual(anexos);
    });

    it('deve lidar com ciclo completo de conversão null/undefined', () => {
      const nullValue: string | null = null;
      const undefinedValue = nullToUndefined(nullValue);
      expect(undefinedValue).toBeUndefined();

      const backToNull = undefinedToNull(undefinedValue);
      expect(backToNull).toBeNull();
    });
  });
});
