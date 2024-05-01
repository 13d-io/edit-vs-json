import { useState } from 'react';
// eslint-disable-next-line
import styles from './app.module.css';

import { Editor } from 'edit-vs-json';
import { Toggle } from './Toggle';

export function App() {
  const [valid, setValid] = useState(true);
  const [currentKey, setCurrentKey] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [validationActive, setValidationActive] = useState(true);
  const [keyEditActive, setKeyEditActive] = useState(true);
  const handleValidate = (value: string, isValid: boolean) => {
    setValid(isValid);
  };

  const handleKeyEntry = (value: string, callback: (val?: string) => void) => {
    setCurrentKey(value);
    setTimeout(() => {
      callback();
    }, 100);
  };

  const handleValidationToggle = () => {
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
      <div className="bar">
        <div className="stripe" style={{ visibility: validationActive ? 'visible' :  'hidden', color: 'white', backgroundColor: valid ? 'green' : 'red' }}>
          Validation Status
        </div>
      </div>
      <div className="bar">
        <div className="stripe" style={{ visibility: keyEditActive ? 'visible' :  'hidden' }}>
          Last key entry: {`${currentKey} `}
        </div>
      </div>
    </div>
  );
}

export default App;
