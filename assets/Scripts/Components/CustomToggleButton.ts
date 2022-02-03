
import { _decorator, Component, Node, Label, assert, log, Button, director, Toggle } from 'cc';
const { ccclass, property, requireComponent } = _decorator;

export enum CustomToggleButtonEventType {
    SELECTED = 'touch'
}

export enum CustomToggleButtonState {
    NORMAL = 'normal',
    SELECTED = 'selected',
    INACTIVE = 'inactive'
}

@ccclass('CustomToggleButton')
@requireComponent(Button)
export class CustomToggleButton extends Component {

    private _initialized: boolean = false;
    private _button: Button = null;
    private _buttonState: CustomToggleButtonState = CustomToggleButtonState.NORMAL;
    @property(Node)
    selected: Node = null;
    @property(Node)
    normal: Node = null;

    get buttonState(): CustomToggleButtonState {
        return this._buttonState;
    }

    init() {
        assert(this.selected, "Can't find state of quiz button");
        assert(this.normal, "Can't find state of quiz button");
        this._button = this.getComponent(Button);
        assert(this._button, "Button has to be");
        this.node.on(Button.EventType.CLICK, (event) => {
            if (this.buttonState == CustomToggleButtonState.NORMAL) {
                this.setState(CustomToggleButtonState.SELECTED);
            } else if (this.buttonState == CustomToggleButtonState.SELECTED) {
                this.setState(CustomToggleButtonState.NORMAL);
            }
        });
        this._initialized = true;
    }

    onLoad() {
        if (!this._initialized) {
            this.init();
        }
    }

    get isChecked() {
        return this._buttonState == CustomToggleButtonState.SELECTED;
    }

    setState(s: CustomToggleButtonState) {
        if (!this._initialized) {
            this.init();
        }
        this._buttonState = s;
        switch (s) {
            case CustomToggleButtonState.NORMAL:
                this.selected.active = false;
                this.normal.active = true;
                //this._button.enabled = true;
                this.node.emit(Toggle.EventType.TOGGLE, this);
                break;
            case CustomToggleButtonState.SELECTED:
                this.selected.active = true;
                this.normal.active = false;
                this.node.emit(Toggle.EventType.TOGGLE, this);
                //this._button.enabled = false;
                break;
            case CustomToggleButtonState.INACTIVE:
                this.selected.active = false;
                this.normal.active = false;
                //this._button.enabled = false;
                break;
            default:
                break;
        }
    }

}
