import { useState, useRef } from 'react';
// eslint-disable-next-line
import styles from './app.module.css';

import { Editor } from 'edit-vs-json';
import { Toggle } from './Toggle';
import useFadeOut from './useFadeOut';

type TPos = { x: number, y: number };

export function App() {
  const [valid, setValid] = useState(true);
  const [currentKey, setCurrentKey] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [validationActive, setValidationActive] = useState(true);
  const [keyEditActive, setKeyEditActive] = useState(true);
  const [cursorPos, setPosition] = useState({ x: 0, y: 0 });
  const overlayEl = useRef<HTMLElement | null>(null);

  const setFadeOutDelay = useFadeOut(overlayEl.current);

  const handleValidate = (value: string, isValid: boolean) => {
    setValid(isValid);
  };

  const handleKeyEntry = (value: string, position: TPos, callback: (val?: string) => void) => {
    setCurrentKey(value);
    setPosition(position);
    setFadeOutDelay(3000);
    setTimeout(() => {
      callback();
    }, 100);
  };

  const handleValidationToggle = () => {
    setPosition({ x: 0, y: 0 });
    setValidationActive(previous => !previous);
  };

  const handleKeyEditToggle = () => {
    setKeyEditActive(previous => !previous);
  };

  const handleLockToggle = () => {
    setIsLocked(previous => !previous);
  };

  const handleDocs = () => {
    window.open('https://13d.io/edit-vs-json/index.html')
  };

  const handleGithub = () => {
    window.open('https://github.com/13d-io/edit-vs-json');
  };

  return (
    <div className="page">
      <div className="header">
        <button className="docs" onClick={handleDocs}>Docs</button>
        <h1>edit-vs-json</h1>
        <button className="github" onClick={handleGithub}>GitHub</button>
      </div>
      <div className="bar">
        <div style={{ height: '64px', width: '1400px', padding: '2px' }}>
          <Toggle active={validationActive} onClick={handleValidationToggle}>Toggle Validation</Toggle>
          <Toggle active={keyEditActive} onClick={handleKeyEditToggle}>Toggle Key Editing</Toggle>
          <Toggle active={isLocked} onClick={handleLockToggle}>Toggle Editor Lock</Toggle>
        </div>
      </div>
      <div className="bar">
        <div ref={el => overlayEl.current = el} style={{
          position: 'absolute',
          display: cursorPos.x ? 'inline' : 'none',
          left: `${cursorPos.x+124}px`,
          top: `${cursorPos.y > 300 ? cursorPos.y+120 : cursorPos.y+186}px`,
          opacity: 0.5,
          color: 'red',
          backgroundColor: 'lightgray',
          border: '1px solid gray',
          fontWeight: 'bold',
          padding: '4px',
          zIndex: 9999,
          height: '24px',
        }}>{currentKey}</div>
        <div>
          <Editor
            width="1400px"
            height="400px"
            onChange={validationActive ? handleValidate : undefined}
            changeDebounceInterval={300}
            onKeyEntry={keyEditActive ? handleKeyEntry :  undefined}
            keyEntryDebounceInterval={100}
            locked={isLocked}
          />
        </div>
      </div>
      <div className="bar">
        <div className="stripe" style={{ visibility: validationActive ? 'visible' :  'hidden', color: 'white', backgroundColor: valid ? 'green' : 'red' }}>
          Validation Status
        </div>
      </div>
    </div>
  );
}

export default App;
