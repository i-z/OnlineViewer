
import { _decorator, Component, Node, Graphics, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StrokeBorder')
export class StrokeBorder extends Component {

    start () {
        const g = this.getComponent(Graphics);
        const tr = this.getComponent(UITransform);
        g.rect(this.node.position.x, this.node.position.y, tr.width, tr.height);
        g.stroke();
    }
}
