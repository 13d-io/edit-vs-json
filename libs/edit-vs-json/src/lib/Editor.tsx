import React, {
  ChangeEventHandler,
  FC,
  KeyboardEventHandler,
  useState,
  useRef,
  useEffect,
  CSSProperties,
} from 'react';
import {
  tryFormatJson,
  analyzeJsonLine,
  calculateBestPotentialValue,
  debouncedJsonValidatorFactory,
  scrubPotentialValues,
  setCursorPosition,
  splitInputAtCursor,
  setKey,
  complementEnclosure,
  debouncedKeyEntryFactory,
  POTENTIAL_ITEM,
  POTENTIAL_PAIR, POTENTIAL_PAIR_PHRASE, POTENTIAL_ITEM_PHRASE,
} from './helper';
import {IProps} from './type';
import './style.css';

const createValidator = debouncedJsonValidatorFactory();
const createKeyEntryHandler = debouncedKeyEntryFactory();

/**
 * Editor is the edit-vs-json React component that renders a JSON editor
 * @param {string} [width="100%"] the width of the JSON editor control
 * @param {string} [height="100%"] the height of the JSON editor control
 * @param {string} [initValue=""] the initial JSON string value to populate the editor
 * @param {function(value:string, isValid:boolean)} [onChange] the JSON editor change event handler
 * @param {number} [changeDebounceInterval] the debounce interval in ms for the onChange event
 * @param {function(key:string, callback:function)} [onKeyEntry] the object key entry event handler
 * @param {number} [keyEntryDebounceInterval] the debounce interval in ms for the onKeyEntry event
 * @param {boolean} [locked=false] locks the editor when set to true
 * @constructor
 */

export const Editor: FC<IProps> = ({
  width,
  height,
  initValue = '',
  onChange,
  changeDebounceInterval,
  onKeyEntry,
  keyEntryDebounceInterval,
  locked,
}) => {
  const [value, setValue] = useState(initValue);
  const editorEl = useRef<HTMLTextAreaElement | null>();
  const viewerEl = useRef<HTMLPreElement | null>();
  const changeBlocked = useRef(false);
  const debouncedValidator = createValidator(changeDebounceInterval);
  const debouncedKeyEntry = createKeyEntryHandler(keyEntryDebounceInterval);

  useEffect(() => {
    const scrollSync = () => {
      if (editorEl.current && viewerEl.current) {
        viewerEl.current.scrollTop = editorEl.current.scrollTop;
      }
    };
    if (editorEl.current) {
      editorEl.current.addEventListener('scroll', scrollSync);
    }
    return () => {
      if (editorEl.current) {
        editorEl.current.removeEventListener('scroll', scrollSync);
      }
    };
  }, []);

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    if (changeBlocked.current) {
      return;
    }
    const inputEl = event.target as HTMLTextAreaElement;
    const split = splitInputAtCursor(inputEl, event.target.value);
    const newValue = complementEnclosure(split);
    if (newValue) {
      setCursorPosition(inputEl, newValue, [
        split.front.length,
        inputEl.selectionStart
      ]);
    }
    setValue(newValue || event.target.value);
    if (onKeyEntry) {
      debouncedKeyEntry(split)
        .then(keyCheck => {
          if (keyCheck) {
            onKeyEntry(keyCheck, (newKey: string | null | undefined) => {
              if (newKey) {
                const updatedValue = setKey(split, newKey);
                setValue(updatedValue);
                setCursorPosition(inputEl, updatedValue, [
                  split.front.length + (newKey.length - keyCheck.length),
                  inputEl.selectionStart
                ]);
              }
            })
          }
        })
    }
    if (onChange) {
      debouncedValidator(event.target.value)
        .then(result => {
          onChange?.(event.target.value, result);
        });
    }
  };

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    const inputEl = event.target as HTMLTextAreaElement;
    if (event.key !== 'Enter' || changeBlocked.current) {
      return;
    }
    changeBlocked.current = true;
    setValue(previousValue => {
      const split = splitInputAtCursor(inputEl, previousValue);
      const newResult = calculateBestPotentialValue(split);
      if (!newResult || !newResult.value) {
        const newValue = `${split.front}\n${split.back}`;
        setCursorPosition(inputEl, newValue, [
          split.front.length + 1,
          inputEl.selectionStart
        ]);
        changeBlocked.current = false;
        return newValue;
      } else {
        const updatedValue = scrubPotentialValues(newResult.value) || previousValue;
        setCursorPosition(inputEl, updatedValue, [
          newResult.value.indexOf(POTENTIAL_PAIR_PHRASE),
          newResult.value.indexOf(POTENTIAL_ITEM_PHRASE),
          newResult.value.indexOf(POTENTIAL_PAIR) + newResult.offset,
          newResult.value.indexOf(POTENTIAL_ITEM) + newResult.offset,
          inputEl.selectionStart + newResult.offset
        ]);
        changeBlocked.current = false;
        return updatedValue;
      }
    });
  };

  const handleLockedKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    event.stopPropagation();
    event.preventDefault();
  };

  const handleLockedChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    event.stopPropagation();
    event.preventDefault();
  };

  const handleBlur = () => {
    const newValue = tryFormatJson(value, 2, true);
    if (newValue) {
      setValue(newValue);
      onChange?.(newValue, true);
    }
  };

  const style: CSSProperties = {
    width: width || '100%',
    height: height || '100%',
    opacity: locked ? 0.98 : 1
  };

  const lines = value.split('\n');

  return (
    <div className="edit-vs-json">
      <div className="container">
      <pre
        tabIndex={0}
        autoFocus
        className="evj-editor evj-view"
        style={style} onClick={e => e.preventDefault()}
        ref={el => viewerEl.current = el}
      >
        {lines.map((line, index) => {
          const details = analyzeJsonLine(line);
          return details ? (
            <span key={index} className="line" style={{marginLeft: `${details.indentSize * 9.1}px`}}>
              <span className="openSymbol">{details.openSymbol}</span>
              <span className="pairKey">{details.key}</span>
              <span className="pairDelim">{details.pairDelim}</span>
              <span className="valueOpenSymbol">{details.valueOpenSymbol}</span>
              <span className="pairValue">{details.value}</span>
              <span className="closeSymbol">{details.closeSymbol}</span>
              <span className="delim">{details.delim}</span>
              <span className="misc">{details.invalid}</span>
            </span>
          ) : null;
        })}
      </pre>
        <textarea
          className="evj-editor evj-edit"
          onChange={locked ? handleLockedChange : handleChange}
          onKeyDown={locked ? handleLockedKeyDown : handleKeyDown}
          onBlur={handleBlur}
          style={style}
          value={value}
          ref={el => editorEl.current = el}
          autoComplete="off"
        />
      </div>
    </div>
  );
};
