
import { _decorator, Component, Node, log, Camera, EventTouch, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

 
@ccclass('PlayerCameraController')
export class PlayerCameraController extends Component {

    @property(Node)
    touchInputPanel: Node = null;

    @property(Camera)
    camera: Camera = null;

    start () {
        if (this.touchInputPanel) {
            this.touchInputPanel.on(Node.EventType.TOUCH_START, this.onTouchBegan, this, true);
            this.touchInputPanel.on(Node.EventType.TOUCH_END, this.onTouchEnded, this, true);
            this.touchInputPanel.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this, true);
        }
    }

    onTouchBegan(ev: TouchEvent) {
        log("Touch began");
    }

    onTouchEnded(e) {
        log("Touch ended");
    }

    onTouchMove(event: EventTouch) {
        log("Touch move");
        let cp = this.camera.node.position;
        const delta = event.touch.getDelta();
        cp.add(new Vec3(-delta.x, -delta.y, 0));
        this.camera.node.position = cp;
    }

    onTouchCancelled(e) {
        log("Touch move");
    }
}

