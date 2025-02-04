import { ControlElement, ControlData } from './types';
export declare const sharedOnInvalidHandler: (_ev: Event) => void;
export declare const sharedOnValueChangeHandler: (ev: KeyboardEvent) => void;
export declare const sharedOnFocus: (ev: FocusEvent) => void;
export declare const getValueFromControlElement: (ctrlData: ControlData, ctrlElm: ControlElement) => string | number | boolean;
