import { useState } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'stretch', alignItems: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch' }}>
        <div style={{ height: '64px', width: '1400px', padding: '2px' }}>
          <Toggle active={validationActive} onClick={handleValidationToggle}>Toggle Validation</Toggle>
          <Toggle active={keyEditActive} onClick={handleKeyEditToggle}>Toggle Key Editing</Toggle>
          <Toggle active={isLocked} onClick={handleLockToggle}>Toggle Editor Lock</Toggle>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch' }}>
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch' }}>
        <div style={{ height: '24px', width: '1400px', visibility: validationActive ? 'visible' :  'hidden', padding: '2px', color: 'white', backgroundColor: valid ? 'green' : 'red' }}>
          {' '}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch' }}>
        <div style={{ height: '24px', width: '1400px', visibility: keyEditActive ? 'visible' :  'hidden', padding: '2px' }}>
          Last key entry: {`${currentKey} `}
        </div>
      </div>
    </div>
  );
}

export default App;
