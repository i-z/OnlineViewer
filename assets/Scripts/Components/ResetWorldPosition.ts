
import { _decorator, Component, Node, Vec3, view } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ResetWorldPosition')
export class ResetWorldPosition extends Component {

    reset() {
        this.node.worldPosition = new Vec3(0, 0, this.node.worldPosition.z);
    }

    start() {
        view.on('canvas-resize', () => {
            this.reset();
        });
        this.reset();
    }
}
