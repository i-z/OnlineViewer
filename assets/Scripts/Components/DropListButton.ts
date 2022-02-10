
import { _decorator, Component, Node, Button, log } from 'cc';
import { DropList } from './DropList';
import { DropListItem } from './DropListItemButton';
const { ccclass, property, requireComponent } = _decorator;

 
@ccclass('DropListButton')
@requireComponent(Button)
export class DropListButton extends Component {

    private _list: DropList = null;
    private _data: DropListItem[] = null;

    onLoad () {
        this._list = this.getComponentInChildren(DropList);
        this._list.onLoad();

        this.node.on(Node.EventType.TOUCH_START, this.onTouchBegan, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnded, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCanceled, this);
    }

    onTouchBegan() {
        this._list.show();
    }

    onTouchEnded() {
        this.hideListAndCheckSelection();
    }

    onTouchCanceled() {
        this.hideListAndCheckSelection();
    }

    hideListAndCheckSelection() {
        this._list.node.active = false;
        log(this._list.getSelected());
    }

    setData(data: DropListItem[]) {
        this._data = data;
        this._list.setData(this._data);
    }
}
