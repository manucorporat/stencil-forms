import { ctrls, ctrlDatas, state, ctrlElmIds, labellingElms, ctrlElms, ctrlChildren, } from './utils/state';
import { isString, isFunction, setAttribute } from './utils/helpers';
import { sharedOnInvalidHandler, sharedOnValueChangeHandler, sharedOnFocus } from './handlers';
import { setLabelledbyAttributes, setDescribedbyAttributes, setErrormessageAttributes, getGroupChild, } from './labelling-for';
export const inputControl = (value, ctrlData) => {
    // create the control arrow fn that'll be used as a weakmap key
    // and as a function to return the props for the control element
    const ctrl = () => {
        // create the object to be used as a property spread in the render()
        const props = {
            // set the value
            [ctrlData.valuePropName]: getPropValue(ctrlData.valuePropType, value),
            // get the reference to this form control element
            // and remember it so we can look up the form control by the element
            ref: (ctrlElm) => ctrlElm && ctrlElmRef(ctrl, ctrlData, ctrlElm, false),
            // add the shared event listeners
            onInvalid: sharedOnInvalidHandler,
            [ctrlData.changeEventName]: sharedOnValueChangeHandler,
        };
        if (isFunction(ctrlData.onFocus)) {
            props.onBlur = sharedOnFocus;
        }
        if (isFunction(ctrlData.onBlur)) {
            props.onFocus = sharedOnFocus;
        }
        return props;
    };
    // add to the weakmap the data for this control
    ctrlDatas.set(ctrl, ctrlData);
    // return the control to be used as a key and what's
    // called to get all of the props for the control element
    return ctrl;
};
const getPropValue = (valueTypeCast, value) => {
    // get the actual value we'll be assigning to the control element's
    // "value" or "checked" property. So it should actually only return a
    // string (for "value") or boolean (for "checked").
    if (valueTypeCast === 'boolean') {
        // may have been give a string "true" or "false", so lets just
        // just always compare as a string boolean and return a boolean
        return String(value) === 'true';
    }
    if (value == null || (valueTypeCast === 'number' && isNaN(value))) {
        // we don't want the word "null" "undefined" or "NaN" to be the value for
        // an <input> element, so check first and return it as an empty string
        return '';
    }
    // always assign the value as an actual string value, even for number
    return String(value);
};
export const inputControlGroup = (selectedValue, ctrlData) => {
    // create the form control that'll be used as a weakmap key
    const ctrl = (groupItemValue) => {
        if (isString(groupItemValue)) {
            // group item, like <input type="radio">
            return inputControlGroupItem(selectedValue, ctrl, ctrlData, groupItemValue);
        }
        // group container, like <div role="group">
        return {
            role: 'group',
            ref: (ctrlElm) => ctrlElm && ctrlElmRef(ctrl, ctrlData, ctrlElm, true),
        };
    };
    ctrlChildren.set(ctrl, new Map());
    // remember the control data
    ctrlDatas.set(ctrl, ctrlData);
    // return form control is used as a key
    // and what's called to get all of the props
    return ctrl;
};
const inputControlGroupItem = (selectedGroupValue, parentCtrl, parentCtrlData, value) => {
    getGroupChild(parentCtrl, value);
    // grouped control input item, like <input type="radio"> a group
    // only has one "value" and the individual group item that has
    // the same "value" as the group value is the "checked" item
    return {
        // group item "value"
        // individual radio should each have a unique "value" assigned
        value,
        // this radio is "checked" if its "value" is the same as the group's "value"
        // compare as strings so we can normalize any passed in boolean strings or actual booleans
        // however, it's always false if the group's "selectedValue" is null or undefined
        checked: selectedGroupValue != null ? String(selectedGroupValue) === value : false,
        [parentCtrlData.changeEventName]: sharedOnValueChangeHandler,
        // ref for <input type="radio">
        ref: (childCtrlElm) => childCtrlElm && ctrlGroupItemElmRef(parentCtrl, childCtrlElm, value),
    };
};
const ctrlElmRef = (ctrl, ctrlData, ctrlElm, isParentGroup) => {
    // we just got a reference to the control input element
    let ctrlId = ctrlElm.getAttribute('id');
    let ctrlName = ctrlElm.getAttribute('name');
    let labellingElm = labellingElms[0 /* labelledby */].get(ctrl);
    if (!ctrlId) {
        ctrlId = ctrlData.id;
        if (!ctrlId) {
            ctrlId = ctrlElmIds.get(ctrlElm);
            if (!ctrlId) {
                ctrlElmIds.set(ctrlElm, (ctrlId = 'ctrl-' + state.i++));
            }
        }
    }
    // since the labelling elements could have already rendered before the control element
    // we can now set the attribute information now that we have the "id" for the control element
    if (labellingElm) {
        // labelledby
        setLabelledbyAttributes(ctrlId, ctrlElm, labellingElm);
    }
    labellingElm = labellingElms[2 /* describedby */].get(ctrl);
    if (labellingElm) {
        // describedby
        setDescribedbyAttributes(ctrlId, ctrlElm, labellingElm);
    }
    labellingElm = labellingElms[1 /* errormessage */].get(ctrl);
    if (labellingElm) {
        // errormessage
        setErrormessageAttributes(ctrlId, ctrlElm, labellingElm);
        setAttribute(ctrlElm, 'formnovalidate');
    }
    ctrlData.id = setAttribute(ctrlElm, 'id', ctrlId);
    if (!isParentGroup) {
        if (!ctrlName) {
            ctrlName = ctrlData.name;
            if (!ctrlName) {
                ctrlName = ctrlId;
            }
        }
        ctrlData.name = setAttribute(ctrlElm, 'name', ctrlName);
    }
    ctrls.set(ctrlElm, ctrl);
    ctrlElms.set(ctrl, ctrlElm);
};
const ctrlGroupItemElmRef = (parentCtrl, childCtrlElm, childValue) => {
    const child = getGroupChild(parentCtrl, childValue);
    return ctrlElmRef(child.ctrl, child.data, childCtrlElm, false);
};
