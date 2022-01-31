
import { _decorator, Component, Node, Vec3, view, log, director, tween, Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ResetWorldPosition')
export class ResetWorldPosition extends Component {

    private _resetTween: Tween<ResetWorldPosition> = null;

    reset() {
        this.node.worldPosition = new Vec3(0, 0, this.node.worldPosition.z);
    }

    start() {
        view.on('canvas-resize', () => {
            if (this._resetTween) {
                this._resetTween.stop();
            }
            this._resetTween = tween(this)
            .delay(0.01)
            .call(()=>this.reset())
            .start();
        });     
        this.reset();
    }
}
