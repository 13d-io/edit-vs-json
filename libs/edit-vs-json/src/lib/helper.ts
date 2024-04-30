import {
  ICalcResults,
  IMatchGroups,
  TGroupName,
  TSplitInput,
  TValidatorFunc,
  TKeyEntryFunc,
} from './type';

const DEFAULT_VALIDATOR_INTERVAL = 500;
const DEFAULT_KEY_ENTRY_INTERVAL = 200;


export const POTENTIAL_PAIR = '"_POTENTIAL_EDITOR_KEY_": "_POTENTIAL_EDITOR_VALUE_"';
export const POTENTIAL_PAIR_PHRASE = '"_POTENTIAL_PHRASE_KEY_": "_POTENTIAL_PHRASE_VALUE_",';
export const POTENTIAL_ITEM = '"_POTENTIAL_EDITOR_ITEM_"';
export const POTENTIAL_ITEM_PHRASE = '"_POTENTIAL_PHRASE_ITEM_",';

const debounce = <R extends unknown[], S>(fn: (...args: R) => S, time: number) => {
  let timeoutId: ReturnType<typeof setTimeout> | null;
  return wrapper
  function wrapper (...args: R) {
    let deferredResolve: (value: S) => void;
    const promise: Promise<S> = new Promise((resolve) => {
      deferredResolve = resolve;
    });
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    timeoutId = setTimeout(() => {
      timeoutId = null;
      deferredResolve(fn(...args));
    }, time)
    return promise;
  }
}

export const debounceKeyEntry = (onKeyEntry: TKeyEntryFunc, time: number) => {
  return debounce<[TSplitInput], string | null>(onKeyEntry, time);
};

const keyChecker = (split: TSplitInput) =>
  checkKeyEntry(split);

export const debouncedKeyEntryFactory = () => {
  let handler: (arg: TSplitInput) => Promise<string | null>;
  const creator = (debounceInterval: number) => {
    if (!handler) {
      handler = debounceKeyEntry(keyChecker, debounceInterval);
    }
    return handler;
  };
  return (debounceInterval = DEFAULT_KEY_ENTRY_INTERVAL) => creator(debounceInterval);
};

const debounceValidator = (validator: TValidatorFunc, time: number) => {
  return debounce<[string], boolean>(validator, time);
}

const jsonIsValid = (json: string): boolean => {
  try {
    return !!JSON.parse(json);
  } catch (e) {
    return false;
  }
};

export const debouncedJsonValidatorFactory = () => {
  let validator: (arg: string) => Promise<boolean>;
  const creator = (debounceInterval: number) => {
    if (!validator) {
      validator = debounceValidator(jsonIsValid, debounceInterval);
    }
    return validator;
  };
  return (debounceInterval = DEFAULT_VALIDATOR_INTERVAL) => creator(debounceInterval);
};

export const tryFormatJson = (json: string, indent: number, stripTrailingCommas: boolean): string | null => {
  const value = stripTrailingCommas
    ? json.replace(/,\s*([\]}])/g, '$1')
    : json;
  try {
    return JSON.stringify(JSON.parse(value), null, indent);
  } catch (e) {
    return null;
  }
};

const updateScrollTop = (inputEl: HTMLTextAreaElement, value: string) => {
  const split = splitInputAtCursor(inputEl, value);
  const frontLines = split.front.split('\n');
  const selectionRow = frontLines.length > 2 ? frontLines.length - 3 : 0;
  let lineHeightValue: number;
  try {
    const computed = inputEl.computedStyleMap();
    // @ts-expect-error this is a CSSUnitValue not a CSSStyleValue
    const lineHeight: CSSUnitValue = computed.get('line-height');
    lineHeightValue = lineHeight.value;
  } catch (e) {
    lineHeightValue = 19.6;
  }
  inputEl.scrollTop = lineHeightValue * selectionRow;
};

export const setCursorPosition = (inputEl: HTMLTextAreaElement, value: string, positionChoices: number[]) => {
  const position = positionChoices.reduce((currentChoice: number, item: number) => {
    if (currentChoice === -1) {
      return item;
    }
    return currentChoice;
  }, -1);
  if (position === -1) {
    return;
  }
  setTimeout(() => {
    inputEl.focus();
    inputEl.selectionStart = position;
    inputEl.selectionEnd = position;
    inputEl.setSelectionRange(position, position);
    updateScrollTop(inputEl, value);
  }, 0);
};

export const splitInputAtCursor = (inputEl: HTMLTextAreaElement, value: string): TSplitInput => {
  const front = value.substring(0, inputEl.selectionStart);
  const back = value.substring(inputEl.selectionStart);
  return {front, back};
};

export const equivalent = (left: string, right: string) => {
  const leftStripped = left.replace(/\s/g, '');
  const rightStripped = right.replace(/\s/g, '');
  return leftStripped === rightStripped;
};

const tryJsonInsertAtCursor = (splitInput: TSplitInput, content: string, offset = 0): ICalcResults | null => {
  const value = `${splitInput.front}${content}${splitInput.back}`;
  const result = tryFormatJson(value, 2, false)
    || tryFormatJson(value, 2, true);
  return (result === null) ? null : {
    value: result,
    offset
  };
};

const tryJsonReplacementAtCursor = (
  splitInput: TSplitInput,
  reTest: RegExp,
  replacement: string,
  offset = 0
): ICalcResults | null => {
  const lines = splitInput.front.split('\n');
  if (!lines.length) {
    return null;
  }
  const lineFront = lines[lines.length - 1];
  const lineBack = splitInput.back.split('\n')[0];
  const lastLine = `${lineFront}${lineBack}`;
  if (!reTest.test(lastLine)) {
    return null;
  }
  return tryJsonInsertAtCursor(
    {
      front: splitInput.front.substring(0, splitInput.front.length - lineFront.length),
      back: splitInput.back.slice(0 - splitInput.back.length + lineBack.length)
    },
    lastLine.replace(reTest, replacement),
    offset
  );
};

// ^(?!.*(trunk|tags|branches)).*$

const testNakedKey = /^\s*([{]?)([a-z0-9_$-]+)(.*)$/;
const testNakedValue = /^([^:]*:)\s*(?!\s*((([0-9]+[.])?[0-9]+)|true|false|null|(.*".*)))(.*)\s*$/;
const testNakedPair = /^\s*([a-z0-9_$-]+)\s*:\s*([a-z0-9_$-]+[,]?)$/;
const testNakedItem = /^\s*([$a-z][a-z0-9_$-]*)([,]?)$/;
const testNonstringItem = /^\s*((([0-9]+[.])?[0-9]+)|true|false|null)([,]?)$/;
const testStringItem = /^\s*"([^"]*)"([,]?)$/;
const testObject = /^\s*(["]?)([a-z0-9_$-]+)(["]?)\s*(:\s*\{)\s*(})\s*$/;
const testArray = /^\s*(["]?)([a-z0-9_$-]+)(["]?)\s*(:\s*\[)\s*(])\s*$/;

export const calculateBestPotentialValue = (split: TSplitInput): ICalcResults | null => {
  return tryJsonInsertAtCursor(split, `${POTENTIAL_PAIR}}`) ||
    tryJsonInsertAtCursor(split, `${POTENTIAL_ITEM}]`) ||
    tryJsonInsertAtCursor(split, `${POTENTIAL_ITEM}`) ||
    tryJsonInsertAtCursor(split, `${POTENTIAL_PAIR}`) ||
    tryJsonInsertAtCursor(split, '}') ||
    tryJsonInsertAtCursor(split, ']') ||
    tryJsonInsertAtCursor(split, `,${POTENTIAL_PAIR}`) ||
    tryJsonInsertAtCursor(split, `,${POTENTIAL_ITEM}`) ||
    tryJsonInsertAtCursor(split, `${POTENTIAL_PAIR_PHRASE}`) ||
    tryJsonInsertAtCursor(split, `${POTENTIAL_ITEM_PHRASE}`) ||
    tryJsonInsertAtCursor(split, `,${POTENTIAL_PAIR_PHRASE}`) ||
    tryJsonInsertAtCursor(split, `,${POTENTIAL_ITEM_PHRASE}`) ||
    tryJsonReplacementAtCursor(split, testArray, `"$2"$4${POTENTIAL_ITEM}$5`) ||
    tryJsonReplacementAtCursor(split, testArray, `"$2"$4${POTENTIAL_ITEM}$5,`) ||
    tryJsonReplacementAtCursor(split, testObject, `"$2"$4${POTENTIAL_PAIR}$5`) ||
    tryJsonReplacementAtCursor(split, testObject, `"$2"$4${POTENTIAL_PAIR}$5,`) ||
    tryJsonReplacementAtCursor(split, testNonstringItem, `$1,${POTENTIAL_ITEM},`) ||
    tryJsonReplacementAtCursor(split, testStringItem, `"$1",${POTENTIAL_ITEM},`) ||
    tryJsonReplacementAtCursor(split, testNakedPair, `"$1": $2,${POTENTIAL_PAIR}`) ||
    tryJsonReplacementAtCursor(split, testNakedPair, `"$1": $2${POTENTIAL_PAIR}`) ||
    tryJsonReplacementAtCursor(split, testNakedPair, `"$1": "$2",${POTENTIAL_PAIR}`) ||
    tryJsonReplacementAtCursor(split, testNakedPair, `"$1": "$2"${POTENTIAL_PAIR}`) ||
    tryJsonReplacementAtCursor(split, testNakedPair, `"$1": "$2",${POTENTIAL_PAIR_PHRASE}`) ||
    tryJsonReplacementAtCursor(split, testNakedPair, `"$1": "$2"${POTENTIAL_PAIR_PHRASE}`) ||
    tryJsonReplacementAtCursor(split, testNakedKey, `$1"$2"$3,${POTENTIAL_PAIR}`) ||
    tryJsonReplacementAtCursor(split, testNakedKey, `$1"$2"$3${POTENTIAL_PAIR}`) ||
    tryJsonReplacementAtCursor(split, testNakedKey, `$1"$2"$3${POTENTIAL_PAIR}}`) ||
    tryJsonReplacementAtCursor(split, testNakedKey, `$1"$2"$3{${POTENTIAL_PAIR}}`) ||
    tryJsonReplacementAtCursor(split, testNakedKey, `$1"$2"$3: {${POTENTIAL_PAIR}}`) ||
    tryJsonReplacementAtCursor(split, testNakedKey, `$1"$2"$3: {${POTENTIAL_PAIR}},`) ||
    tryJsonReplacementAtCursor(split, testNakedKey, `$1"$2"${POTENTIAL_ITEM}]`) ||
    tryJsonReplacementAtCursor(split, testNakedItem, `"$1"$2,${POTENTIAL_ITEM}`) ||
    tryJsonReplacementAtCursor(split, testNakedItem, `"$1"$2${POTENTIAL_ITEM}`) ||
    tryJsonReplacementAtCursor(split, testNakedItem, '"$1"$2', 2) ||
    tryJsonReplacementAtCursor(split, testNakedKey, '$1"$2"$3', 2) ||
    tryJsonReplacementAtCursor(split, testNakedValue, `$1"$6",${POTENTIAL_PAIR}`) ||
    tryJsonInsertAtCursor(split, '');
};

export const scrubPotentialValues = (value: string) =>
  value
    .replace(POTENTIAL_ITEM, '')
    .replace(POTENTIAL_PAIR, '')
    .replace(POTENTIAL_ITEM_PHRASE, '')
    .replace(POTENTIAL_PAIR_PHRASE, '');

const getGroup = (matches: RegExpMatchArray, name: TGroupName): string | undefined =>
  matches.groups ? matches.groups[name] : undefined;

export const analyzeJsonLine = (line: string): IMatchGroups => {
  const matches = line.match(
    /^[\s]*((?<gopen>[{[])?((?<gkey>"([^"]+)")(?<gpair>: ))?(?<gvalopen>[{[])?(?<gval>("([^"]+)")?([a-z0-9.-]+)?)?(?<gclose>[}\]])?(?<gdelim>,)?)$/
  );
  if (!matches) {
    return {
      indentSize: line.length - line.trimStart().length,
      invalid: line.trim()
    };
  }
  return {
    indentSize: matches[0].length - matches[1].length,
    openSymbol: getGroup(matches, 'gopen'),
    key: getGroup(matches, 'gkey'),
    pairDelim: getGroup(matches, 'gpair'),
    valueOpenSymbol: getGroup(matches, 'gvalopen'),
    value: getGroup(matches, 'gval'),
    closeSymbol: getGroup(matches, 'gclose'),
    delim: getGroup(matches, 'gdelim')
  };
};

interface IBalance {
  brace: number;
  bracket: number;
  quote: number,
  inQuote: boolean;
  inBrace: boolean;
  inBracket: boolean;
}

const closureTest = (char: string, opener: string, closer: string): number =>
  (char === opener && 1) || (char === closer && -1) || 0;

const inTest = (char: string, negOpener: string, [opener, closer]: string[], enclosureBalance: number, inEnclosure: boolean): boolean => {
  if (char === negOpener || (char === closer && enclosureBalance === 1)) {
    return false;
  }
  return (char === opener && true) || inEnclosure;
}

const reduceBalance = (value: string, initInQuote: boolean, initInBrace: boolean, initInBracket: boolean): IBalance =>
  value.split('').reduce(({ brace, bracket, quote, inQuote, inBrace, inBracket}, char) => {
    if (inQuote) {
      return {
        brace,
        bracket,
        quote: quote + ((char === '"') ? -1 : 0),
        inQuote: (char === '"') ? !inQuote : inQuote,
        inBrace,
        inBracket,
      };
    }
    return {
      brace: brace + closureTest(char, '{', '}'),
      bracket: bracket + closureTest(char, '[', ']'),
      quote: quote + closureTest(char, '"', '"'),
      inQuote: (char === '"') ? !inQuote : inQuote,
      inBrace: inTest(char, '[', ['{', '}'], brace, inBrace),
      inBracket: inTest(char, '{', ['[', ']'], bracket, inBracket),
    };
  }, {
    brace: 0,
    bracket: 0,
    quote: 0,
    inQuote: initInQuote,
    inBrace: initInBrace,
    inBracket: initInBracket,
  } as IBalance);

const inObjectKey = (frontBalance: IBalance, backBalance: IBalance, lineFront: string) => {
  const openIndex = lineFront.lastIndexOf('{');
  const colonIndex = lineFront.substring(openIndex === -1 ? 0 : openIndex).indexOf(':');
  const inValue = colonIndex !== -1;
  if (frontBalance.inQuote || (frontBalance.quote % 2 && backBalance.quote % 2)) {
    return frontBalance.brace > 0 && !inValue;
  } else if (frontBalance.inBrace) {
    return !inValue;
  } else if (frontBalance.bracket > 0 && backBalance.bracket < 0) {
    return false;
  } else {
    return frontBalance.brace > 0 && !inValue; // && backBalance.brace < 0;
  }

};

const testKeyFront = /^([\s]*\s*"?)([a-z0-9_$-]+)$/;
const testKeyBack = /^([a-z0-9_$-]+)(\s*"?:?(.*))$/;

export const checkKeyEntry = (splitInput: TSplitInput) => {
  const frontBalance = reduceBalance(splitInput.front, false, false, false);
  const backBalance = reduceBalance(splitInput.back, frontBalance.inQuote, frontBalance.inBrace || !!(frontBalance.quote % 2), frontBalance.inBracket || !!(frontBalance.quote % 2));
  const lines = splitInput.front.split('\n');
  const lineFront = lines[lines.length - 1];
  if (inObjectKey(frontBalance, backBalance, lineFront)) {
    const keyFront = lineFront.replace(testKeyFront, '$2');
    const lineBack = splitInput.back.split('\n')[0];
    const keyBack = lineBack.replace(testKeyBack, '$1');
    if (testKeyFront.test(keyFront)) {
      if (testKeyBack.test(keyBack)) {
        return `${keyFront}${keyBack}`;
      } else {
        return keyFront;
      }
    }
  }
  return null;
};

export const setKey = (splitInput: TSplitInput, key: string) => {
  const frontLines = splitInput.front.split('\n');
  const preLines = frontLines.slice(0, frontLines.length - 1);
  const lineFront = frontLines[frontLines.length - 1];
  const preKey = lineFront.replace(testKeyFront, '$1');
  const backLines = splitInput.back.split('\n');
  const postLines = backLines.slice(1);
  const lineBack = backLines[0];
  const postKey = lineBack.replace(testKeyBack, '$2');
  return [
    ...preLines,
    `${preKey}${key}${postKey}`,
    ...postLines
  ].join('\n');
};

type TEnclosureSet = [
  string,
  string,
  (o1: number, c1: number, o2: number, c2: number, o3: number, c3: number) => number
];

const enclosures: TEnclosureSet[] = [
  ['{', '}', (frontBrace: number, backBrace: number) => frontBrace + backBrace],
  ['[', ']', (_f: number, _b: number, frontBracket: number, backBracket: number) => frontBracket + backBracket],
  ['"', '"', (_f1: number, _b1: number, _f2: number, _b2: number, frontQuote: number, backQuote: number) => frontQuote - backQuote]
];

export const complementEnclosure = (splitInput: TSplitInput) => {
  const lastChar = splitInput.front.slice(-1);
  const enclosureCloser = enclosures.find(([_o, c]) => c === lastChar);
  if (enclosureCloser && splitInput.back.slice(0, 1) === lastChar) {
    return complementCloser(enclosureCloser, splitInput);
  }
  const enclosureOpener = enclosures.find(([o]) => o === lastChar);
  if (enclosureOpener) {
    return complementOpener(enclosureOpener, splitInput);
  }
  return null;
};

const complementOpener = (enclosure: TEnclosureSet, splitInput: TSplitInput) => {
  const [_openChar, closeChar, isUnbalanced] = enclosure;
  const frontBalance = reduceBalance(splitInput.front, false, false, false);
  const backBalance = reduceBalance(splitInput.back, frontBalance.inQuote, frontBalance.inBrace || !!(frontBalance.quote % 2), frontBalance.inBracket || !!(frontBalance.quote % 2));
  const balance = isUnbalanced(frontBalance.brace, backBalance.brace, frontBalance.bracket, backBalance.bracket, frontBalance.quote, backBalance.quote);
  if (balance > 0) {
    return `${splitInput.front}${closeChar}${splitInput.back}`;
  }
  return null;
};

const complementCloser = (enclosure: TEnclosureSet, splitInput: TSplitInput) => {
  const [_openChar, _closeChar, isUnbalanced] = enclosure;
  const frontBalance = reduceBalance(splitInput.front, false, false, false);
  const backBalance = reduceBalance(splitInput.back, frontBalance.inQuote, frontBalance.inBrace || !!(frontBalance.quote % 2), frontBalance.inBracket || !!(frontBalance.quote % 2));
  const balance = isUnbalanced(frontBalance.brace, backBalance.brace, frontBalance.bracket, backBalance.bracket, frontBalance.quote, backBalance.quote);
  if (balance < 0) {
    return `${splitInput.front.slice(0, -1)}${splitInput.back}`;
  }
  return null;
};
