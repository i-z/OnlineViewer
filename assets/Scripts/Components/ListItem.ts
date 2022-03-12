
import { _decorator, Component, Node, Label, Toggle, log, UITransform } from 'cc';
const { ccclass, property } = _decorator;

export enum ListItemEvent {
    SELECT = 'select'
}

export interface ListItemData {
    index: number;
    id?: number;
    flags?: number[];
    text?: string;
    number?: number;
    deleted: boolean;
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

    start() {
    }

    init() {
        const tr = this.node.getComponent(UITransform);
        tr.anchorX = 0;
    }

    setString(idx: number, str: string, data?: ListItemData) {
        this._idx = idx;
        let id = idx;
        if (this.addIdxToString) {
            if (data?.id) {
                id = data.id;
            }
            if (this.startIdxFromZero) {
                this.text.string = ` ${id} ${str}`;
            } else {
                this.text.string = ` ${id + 1} ${str}`;
            }
        }
        else {
            this.text.string = str;
        }
    }

    select(sender: Toggle) {
        this.node.emit(ListItemEvent.SELECT, this._idx, sender.isChecked);
    }

    get index() {
        return this._idx;
    }
}
