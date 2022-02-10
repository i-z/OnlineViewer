
import { _decorator, Component, Node, Label, log, EventTouch } from 'cc';
import { CustomToggleButton, CustomToggleButtonState } from './CustomToggleButton';
const { ccclass, property } = _decorator;

export interface DropListItem {
    id: number;
    name: string;
    markered?: boolean;
}

@ccclass('DropListItemButton')
export class DropListItemButton extends Component {

    @property(Node)
    marker: Node = null;

    private _item: DropListItem = null;
    private _labels: Label[] = null;
    private _toggle: CustomToggleButton = null;

    onLoad() {
        this._labels = this.getComponentsInChildren(Label);
        this._toggle = this.getComponent(CustomToggleButton);
    }

    reset() {
        this._toggle.setState(CustomToggleButtonState.NORMAL);
    }

    private onMouseEnter(e) {
        this._toggle.setState(CustomToggleButtonState.SELECTED);
    }

    private onMouseLeave(e) {
        this._toggle.setState(CustomToggleButtonState.NORMAL);
    }

    onEnable() {
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnded, this);
        this.node.on(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
    }

    onDisable() {
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnded, this);
        this.node.off(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.off(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
    }

    private onTouchEnded(event?: EventTouch) {
        log(this._item.name);
    }

    setItem(item: DropListItem) {
        this._item = item;
        this._labels.forEach(l => l.string = item.name);
        if (this.marker)
            this.marker.active = !!item.markered;
    }

    getItem() {
        return this._item;
    }

    isSelected() {
        return this._toggle.isChecked;
    }

}
