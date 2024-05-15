export interface IMatchGroups {
  indentSize: number;
  openSymbol?: string;
  key?: string;
  pairDelim?: string;
  valueOpenSymbol?: string;
  value?: string;
  closeSymbol?: string;
  delim?: string;
  invalid?: string;
}

export type TKeyCallback = (key: string | null | undefined) => void;

export interface IProps {
  width?: string;
  height?: string;
  initValue?: string;
  onChange?: (value: string, isValid: boolean) => void;
  changeDebounceInterval?: number;
  onKeyEntry?: (key: string, position: IPosition, callback: TKeyCallback) => void;
  keyEntryDebounceInterval?: number;
  locked?: boolean;
}

export type TGroupName = 'gopen' | 'gkey' | 'gpair' | 'gvalopen' | 'gval' | 'gclose' | 'gdelim' | 'gmisc';

export interface ICalcResults {
  value: string;
  offset: number;
}

export type TSplitInput = {
  front: string,
  back: string
};

export type TValidatorFunc = (value: string) => boolean;

export type TKeyEntryFunc = (split: TSplitInput) => IKeyEntryResponse | null;

export interface IPosition {
  x: number;
  y: number;
}

export interface IKeyEntryResponse {
  key: string;
  position: IPosition;
}
