import {
  calculateBestPotentialValue,
  debouncedKeyEntryFactory,
  scrubPotentialValues,
  setCursorPosition,
  setKey,
  complementEnclosure,
  setCanvasFont,
  _debug_getCachedFont
} from './helper';
import {TSplitInput} from './type';

const createSplit = (fronts: string[], backs: string[]): TSplitInput => {
  const front = fronts.join('\n');
  const back = backs.join('\n');
  return { front, back };
};
describe('json calculation', () => {
  it('should pair the opening braces', () => {
    const split: TSplitInput = {
      front: '{',
      back: ''
    };
    const result = calculateBestPotentialValue(split);
    const clean = scrubPotentialValues(result?.value || '');
    const expected = ['{', '  ', '}'].join('\n');
    expect(clean).toBe(expected)
  });

  it('should create an object for a naked key', () => {
    const split = createSplit(
      ['{', '  keytest'],
      ['', '}']
    );
    const result = calculateBestPotentialValue(split);
    const clean = scrubPotentialValues(result?.value || '');
    const expected = ['{', '  "keytest": {', '    ', '  }', '}'].join('\n');
    expect(clean).toBe(expected);
  });

  it('should create an array for a naked key', () => {
    const split = createSplit(
      ['{', '  keytest['],
      [']', '}']
    );
    const result = calculateBestPotentialValue(split);
    const clean = scrubPotentialValues(result?.value || '');
    const expected = ['{', '  "keytest": [', '    ', '  ]', '}'].join('\n');
    expect(clean).toBe(expected);
  });

  it('should close a brace for a naked key', () => {
    const split = createSplit(
      ['{', '  keytest: {'],
      ['', '}']
    );
    const result = calculateBestPotentialValue(split);
    const clean = scrubPotentialValues(result?.value || '');
    const expected = ['{', '  "keytest": {', '    ', '  }', '}'].join('\n');
    expect(clean).toBe(expected);
  });

  it('should close a brace without a colon', () => {
    const split = createSplit(
      ['{', '  keytest {'],
      ['', '}']
    );
    const result = calculateBestPotentialValue(split);
    const clean = scrubPotentialValues(result?.value || '');
    const expected = ['{', '  "keytest": {', '    ', '  }', '}'].join('\n');
    expect(clean).toBe(expected);
  });

  it('should close a bracket without a colon', () => {
    const split = createSplit(
      ['{', '  keytest ['],
      ['', '}']
    );
    const result = calculateBestPotentialValue(split);
    const clean = scrubPotentialValues(result?.value || '');
    const expected = ['{', '  "keytest": [', '    ', '  ]', '}'].join('\n');
    expect(clean).toBe(expected);
  });

  it('should close a bracket without a colon', () => {
    const split = createSplit(
      ['{', '  keytest ['],
      ['', '}']
    );
    const result = calculateBestPotentialValue(split);
    const clean = scrubPotentialValues(result?.value || '');
    const expected = ['{', '  "keytest": [', '    ', '  ]', '}'].join('\n');
    expect(clean).toBe(expected);
  });

  it('should close a brace on a naked key', () => {
    const split = createSplit(
      ['{', '  keytest{'],
      ['', '}']
    );
    const result = calculateBestPotentialValue(split);
    const clean = scrubPotentialValues(result?.value || '');
    const expected = ['{', '  "keytest": {', '    ', '  }', '}'].join('\n');
    expect(clean).toBe(expected);
  });

  it('should add a naked string to an array', () => {
    const split = createSplit(
      ['{', '  "keytest": [', '    itemtest'],
      ['', ']', '}']
    );
    const result = calculateBestPotentialValue(split);
    const clean = scrubPotentialValues(result?.value || '');
    const expected = ['{', '  "keytest": [', '    "itemtest",', '    ', '  ]', '}'].join('\n');
    expect(clean).toBe(expected);
  });

});

describe('setCursorPosition', () => {
  it('should leave the postion unchanged', () => {
    const el = window.document.createElement('textarea')
    el.selectionStart = 0;
    el.selectionEnd = 0;
    el.setSelectionRange(0, 0);
    const value = ['{', '  ', '}'].join('\n');
    setCursorPosition(el, value, []);
    setTimeout(() => {
      expect(el.selectionStart).toBe(0);
    }, 10);

  });

  it('should update the position', () => {
    const el = window.document.createElement('textarea')
    el.selectionStart = 0;
    el.selectionEnd = 0;
    el.setSelectionRange(0, 0);
    const value = ['{', '  ', '}'].join('\n');
    setCursorPosition(el, value, [4]);
    setTimeout(() => {
      expect(el.selectionStart).toBe(4);
    }, 10);
  });
});

describe('key entry checker', () => {
  it('should detect the key', async () => {
    const createKeyEntryHandler = debouncedKeyEntryFactory();
    const debouncedKeyEntry = createKeyEntryHandler(0);
    const split = createSplit(
      ['{', '  keytest'],
      ['', '}']
    );
    const result = await debouncedKeyEntry(split);
    expect(result?.key).toBe('keytest');
  });

  it('should detect the key position', async () => {
    const createKeyEntryHandler = debouncedKeyEntryFactory();
    const debouncedKeyEntry = createKeyEntryHandler(0);
    const split = createSplit(
      ['{', '  keytest'],
      ['', '}']
    );
    const result = await debouncedKeyEntry(split);
    expect(result?.position.x).toBe(0);
    expect(result?.position.y).toBe(0);
  });

  it('should change the key', async () => {
    const createKeyEntryHandler = debouncedKeyEntryFactory();
    const debouncedKeyEntry = createKeyEntryHandler(0);
    const split = createSplit(
      ['{', '  keytest'],
      ['', '}']
    );
    const result = await debouncedKeyEntry(split);
    expect(result?.key).toBe('keytest');
    const keyResult = setKey(split, 'newkey');
    const expected = ['{', '  newkey', '}'].join('\n');
    expect(keyResult).toBe(expected);
  });
});

describe('complementEnclosure', () => {
  it('should complement a brace', () => {
    const split = createSplit(
      ['{', '  keytest: {'],
      ['', '}']
    );
    const result = complementEnclosure(split);
    const expected = ['{', '  keytest: {}', '}'].join('\n');
    expect(result).toBe(expected);
  });

  it('should complement a bracket', () => {
    const split = createSplit(
      ['{', '  keytest: ['],
      ['', '}']
    );
    const result = complementEnclosure(split);
    const expected = ['{', '  keytest: []', '}'].join('\n');
    expect(result).toBe(expected);
  });

  it('should recognize a complement quote', () => {
    const split = createSplit(
      ['{', '  "keytest": [', '    ""'],
      ['"', '  ]', '}']
    );
    const result = complementEnclosure(split);
    const expected = ['{', '  "keytest": [', '    ""', '  ]', '}'].join('\n');
    expect(result).toBe(expected);
  });
});

describe('setCanvasFont', () => {
  it('should detect default style', () => {
    const el = window.document.createElement('textarea');
    setTimeout(() => {
      setCanvasFont(el);
      const result = _debug_getCachedFont();
      expect(result).toBe('400 14px monospace');
    }, 0);
  });

  it('should detect specified style', () => {
    const el = window.document.createElement('textarea');
    el.style.cssText = 'font-family:Arial;font-size:13px;font-weight:700;';
    setTimeout(() => {
      setCanvasFont(el);
      const result = _debug_getCachedFont();
      expect(result).toBe('700 13px Arial');
    }, 0);
  });
});
