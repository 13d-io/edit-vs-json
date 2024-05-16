# edit-vs-json

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ **This workspace has been generated by [Nx, Smart Monorepos · Fast CI.](https://nx.dev)** ✨

A JSON editor component for React applications.
- provides on-the-fly JSON syntax highlighting
- provides JSON formatting when you press the enter key
  - automatically wraps strings in quotes when missing
  - automatically adds an object value when a key is entered with no value complement
  - automatically provides closing punctuation to complete open braces, brackets, or quotes
  - adds trailing commas after the previous item as needed
- removes trailing commas and revalidates when focus leaves the Editor
- triggers an optional change event with the current JSON string value and a boolean indicating the validity of the JSON
- triggers an optional key entry event when the Editor detects the user is editing an object key
  - can be used by the parent application to provide autocomplete-like functionality for object keys
  - can be used to restrict the object keys permitted in the Editor

[![NPM](https://img.shields.io/npm/v/edit-vs-json.svg)](https://www.npmjs.com/package/edit-vs-json) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save edit-vs-json

or

yarn install edit-vs-json
```

## Usage

```tsx
import React, { FunctionComponent } from 'react'

import { Editor } from 'edit-vs-json';

const Example: FunctionComponent = () => {
    const [jsonIsValid, setJsonIsValid] = React.useState(true);
    
    const handleChange = (currentJsonValue: string, isValid: boolean) => {
      setJsonIsValid(isValid);
    };
    
    return (
        <Editor
          width="1400px"
          height="400px"
          onChange={handleChange}
          changeDebounceInterval={300}
        />
    );
}
```

## Props

### width: string = "100%"

the width of the JSON editor control

### height: string = "100%"

the height of the JSON editor control

### initValue: string = ""

the initial JSON string value for the Editor

### onChange: optional function
```typescript
onChange: (value: string, isValid: boolean) => void
```

the JSON editor change event handler, which receives 2 arguments: 
- the current JSON string value 
- a boolean indicating if the JSON is valid

### changeDebounceInterval: number = 500

the debounce interval in ms for the change event
- smaller values result in the change event being triggered more frequently
- larger values cause the change event to be triggered only when editing pauses

### onKeyEntry: optional function
```typescript
onKeyEntry: (
  currentKey: string, 
  position: { x: number, y: number }, 
  callback: (newKey?: string | null)
) => void
```


the key entry event handler 

- the key entry event is triggered when the Editor detects the user is editing an object key
- can be used to provide autocomplete-like functionality for keys to the Editor
- can be used to restrict the keys permitted in the Editor
- receives 3 arguments:
  - the key being edited
  - the position of the cursor relative to the Editor
  - a callback function that updates the key to the specified string

### keyEntryDebounceInterval: number = 200

the debounce interval in ms for the key entry event
- smaller values result in the key entry event being triggered more frequently
- larger values cause the key entry event to be triggered only when editing the key pauses

### locked: boolean = false

locks the editor when set to true

## License

MIT © [RichieMillennium](https://github.com/RichieMillennium)
