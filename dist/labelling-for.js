import { ctrlChildren, ctrlElms, ctrlDatas, labellingElms } from './utils/state';
import { isString, setAttribute } from './utils/helpers';
const labellingFor = (ctrl, groupItemValue, labellingType, setAttrs) => {
    if (isString(groupItemValue)) {
        // labelling element for a group item input
        return {
            ref: (groupItemLabellingElm) => {
                if (groupItemLabellingElm) {
                    const child = getGroupChild(ctrl, groupItemValue);
                    const ctrlElm = ctrlElms.get(child.ctrl);
                    if (ctrlElm) {
                        // we already have the control element, so that means we'll
                        // have the "id" and "name" data to when setting the attrs
                        setAttrs(child.data.id, ctrlElm, groupItemLabellingElm);
                    }
                    else {
                        // we haven't gotten a reference to the control element yet
                        // so let's remember this labelling element for now and will
                        // add the attribute later once we get a ref to the control element
                        labellingElms[labellingType].set(child.ctrl, groupItemLabellingElm);
                    }
                }
            },
        };
    }
    // labelling element for a normal control
    // or labelling element for the wrapping group
    return {
        ref: (labellingElm) => {
            if (labellingElm) {
                // we now have the labelling element, which could happen before or
                // after having the control input element
                const ctrlElm = ctrlElms.get(ctrl);
                if (ctrlElm) {
                    // we already have the control element, so that means we'll
                    // have the "id" and "name" data to when setting the attrs
                    setAttrs(ctrlDatas.get(ctrl).id, ctrlElm, labellingElm);
                }
                else {
                    // we haven't gotten a reference to the control element yet
                    // so let's remember this labelling element for now and will
                    // add the attribute later once we get a ref to the control element
                    labellingElms[labellingType].set(ctrl, labellingElm);
                }
            }
        },
    };
};
export const setDescribedbyAttributes = (ctrlId, ctrlElm, labellingElm) => setAriaLinkedIdAttributes(ctrlId, ctrlElm, labellingElm, 'describedby', 'desc');
export const setErrormessageAttributes = (ctrlId, ctrlElm, labellingElm) => setAriaLinkedIdAttributes(ctrlId, ctrlElm, labellingElm, 'errormessage', 'err');
export const setLabelledbyAttributes = (ctrlId, ctrlElm, labellingElm) => {
    if (labellingElm) {
        if (labellingElm.nodeName === 'LABEL') {
            // labelling element is an actual <label> so we can use the "for" attribute
            setAttribute(labellingElm, 'for', ctrlId);
        }
        else {
            // labelling element is not a <label> so let's use "aria-labelledby" instead
            setAriaLinkedIdAttributes(ctrlId, ctrlElm, labellingElm, 'labelledby', 'lbl');
        }
    }
};
const setAriaLinkedIdAttributes = (ctrlId, ctrlElm, labellingElm, ariaAttr, labellingIdSuffix) => setAttribute(ctrlElm, 'aria-' + ariaAttr, setAttribute(labellingElm, 'id', ctrlId + '-' + labellingIdSuffix));
export const descriptionFor = (ctrl, groupItemValue) => labellingFor(ctrl, groupItemValue, 2 /* describedby */, setDescribedbyAttributes);
export const validationFor = (ctrl, groupItemValue) => labellingFor(ctrl, groupItemValue, 1 /* errormessage */, setErrormessageAttributes);
export const labelFor = (ctrl, groupItemValue) => labellingFor(ctrl, groupItemValue, 0 /* labelledby */, setLabelledbyAttributes);
export const getGroupChild = (parentCtrl, groupItemValue) => {
    const ctrlChildMap = ctrlChildren.get(parentCtrl);
    let child = ctrlChildMap.get(groupItemValue);
    if (!child) {
        const parentCtrlData = ctrlDatas.get(parentCtrl);
        if (!parentCtrlData.groupName) {
            parentCtrlData.groupName = parentCtrlData.name;
        }
        ctrlChildMap.set(groupItemValue, (child = {
            ctrl: {},
            data: {
                valuePropName: 'value',
                valuePropType: 'string',
                id: parentCtrlData.groupName + '-' + groupItemValue,
                name: parentCtrlData.groupName,
                onValueChange: parentCtrlData.onValueChange,
            },
        }));
        ctrlDatas.set(child.ctrl, child.data);
    }
    return child;
};
