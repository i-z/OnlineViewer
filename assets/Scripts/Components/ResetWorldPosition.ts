
import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;
 
@ccclass('ResetWorldPosition')
export class ResetWorldPosition extends Component {


    start () {
        this.node.worldPosition = new Vec3(0, 0, this.node.worldPosition.z);
    }
}
