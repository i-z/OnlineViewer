
import { _decorator, Component, Node, Toggle, log } from 'cc';
const { ccclass, property } = _decorator;
 
@ccclass('ToggleNoCheckmark')
export class ToggleNoCheckmark extends Component {

    @property(Node)
    noCheckmark: Node = null;

    start () {
        const toggle = this.node.getComponent(Toggle);
        if (toggle) {
            this.node.on(Toggle.EventType.TOGGLE, (tgl) => {
                const t = tgl as Toggle;
                if (t && this.noCheckmark) {
                    this.noCheckmark.active = !t.isChecked;
                }
            });
        }
    }
}