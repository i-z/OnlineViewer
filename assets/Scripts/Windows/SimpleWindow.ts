
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SimpleWindow')
export class SimpleWindow extends Component {

    start () {
    }

    open() {
        this.node.active = true;
    }

    close() {
        this.node.active = false;
    }
}
