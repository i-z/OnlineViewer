
import { _decorator, Component, Node, Toggle, log } from 'cc';
const { ccclass, property } = _decorator;
 
@ccclass('Cover')
export class Cover extends Component {

    @property(Toggle)
    toggle: Toggle = null;

    @property(Node)
    cover: Node = null;

    onLoad () {
        this.toggle.node.on(Toggle.EventType.TOGGLE, (t) => {
            this.cover.active = this.toggle.isChecked;
        });
    }
}
