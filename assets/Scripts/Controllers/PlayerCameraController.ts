
import { _decorator, Component, Node, log, Camera, EventTouch, Vec3, EventMouse, math, MathBase, misc } from 'cc';
const { ccclass, property } = _decorator;

 
@ccclass('PlayerCameraController')
export class PlayerCameraController extends Component {

    @property(Node)
    touchInputPanel: Node = null;

    @property(Camera)
    camera: Camera = null;

    @property
    zoomDuration: number = 0.2;
    @property
    zoomMin: number = 10;
    @property
    zoomMax: number = 800;

    private _scrollOrtographicSize: number = 0;
    private _zoomStep: number = 2;
    private _zooming: boolean = false;
    private _zoomPanDirection: Vec3 = Vec3.ZERO;
    private _epsilon: number = 0.01;

    start () {
        if (this.touchInputPanel) {
            this.touchInputPanel.on(Node.EventType.TOUCH_START, this.onTouchBegan, this, true);
            this.touchInputPanel.on(Node.EventType.TOUCH_END, this.onTouchEnded, this, true);
            this.touchInputPanel.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this, true);
            this.touchInputPanel.on(Node.EventType.MOUSE_WHEEL, this.onMouseWheel, this, true);
        }
        this._scrollOrtographicSize = this.camera.orthoHeight;
    }

    scrollBy(d:number, zoomToMouse: boolean) {
        if (!this._zooming) {
            let newSize = this._scrollOrtographicSize * (d > 0 ? d : 1 / Math.abs(d));
            if (newSize > this.zoomMax || newSize < this.zoomMin) {
                return;
            }
            this._scrollOrtographicSize = newSize;

            if (zoomToMouse) {
                //var point = (_mainCamera.ScreenToViewportPoint(_controls.Touches.Touch0Position.ReadValue<Vector2>()) - new Vector3(0.5f, 0.5f, 0)) * 2;
                //_zoomPanDirection = -Mathf.Sign(d) * new Vector3(point.x * _mainCamera.aspect, point.y, 0);
            }
            this._zooming = true;
        }
    }

    update (deltaTime: number) {
        if (this._zooming) {
            let delta: number = this._scrollOrtographicSize - this.camera.orthoHeight;
            let dir: number = Math.sign(delta);
            let inc: number = deltaTime * 1 / this.zoomDuration * this._scrollOrtographicSize / (dir / 2 + 1.5);
            this.camera.orthoHeight += dir * inc;
            delta = this._scrollOrtographicSize - this.camera.orthoHeight;
            if (this._zoomPanDirection.x != 0 || this._zoomPanDirection.y != 0) {
                let p: Vec3 = this.camera.node.position;
                let i = this._zoomPanDirection.multiplyScalar(inc)
                this.camera.node.position = p.add(i);
            }
            if (delta > - this._epsilon && delta < this._epsilon || dir != Math.sign(delta)) {
                this.camera.orthoHeight = this._scrollOrtographicSize;
                this._zoomPanDirection = Vec3.ZERO;
                this._zooming = false;
            }
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

    onMouseWheel(event: EventMouse) {
        log(event);
        this.scrollBy(misc.clampf(event.getScrollY(), -1, 1) * this._zoomStep, false);
        log("Mouse wheel");
    }

    onTouchCancelled(e) {
        log("Touch move");
    }
}

