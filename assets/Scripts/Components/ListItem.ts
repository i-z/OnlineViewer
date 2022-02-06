
import { _decorator, Component, Node, Label, Toggle, log, UITransform } from 'cc';
const { ccclass, property } = _decorator;

export enum ListItemEvent {
    SELECT = 'select'
}

@ccclass('ListItem')
export class ListItem extends Component {

    private _idx: number;

    @property(Label)
    text: Label;

    @property
    addIdxToString: boolean = false;

    @property
    startIdxFromZero: boolean = true;

    start () {
    }

    init() {
        const tr = this.node.getComponent(UITransform);
        tr.anchorX = 0;
    }

    setString(idx:number, str: string) {
        this._idx = idx;
        if (this.addIdxToString) {
            if (this.startIdxFromZero) {
                this.text.string = ` ${idx} ${str}`;
            } else {
                this.text.string = ` ${idx + 1} ${str}`;
            }
        }
        else {
            this.text.string = str;
        }
    }

    select(sender:Toggle) {
        if (sender.isChecked) {
            this.node.emit(ListItemEvent.SELECT, this._idx);
        }
    }

    get index() {
        return this._idx;
    }
}
