
import { _decorator, Component, Node, log, Camera, EventTouch, Vec3, EventMouse, math, MathBase, misc, Vec2, Rect, UITransform, game, director, Canvas, Size, Touch } from 'cc';
import { Bounds } from '../Components/Bounds';
import { ScrollInput, ScrollInputEventType } from '../Components/ScrollInput';
const { ccclass, property } = _decorator;


@ccclass('PlayerCameraController')
export class PlayerCameraController extends Component {
    @property
    zoomMin: number = 10;
    @property
    zoomStep: number = 2;
    @property
    zoomDuration: number = 0.2;
    @property
    panSpeed: number = 0.2;
    @property
    deceleration: number = 4;
    @property
    panMoveDelta: number = 0.01;
    @property
    smoothPan: boolean = true;
    @property
    panEndAcceleration: number = 2;

    @property(Node)
    touchInputPanel: Node = null;
    @property(Camera)
    camera: Camera = null;
    @property(Node)
    limits: Node = null;
    @property(Node)
    canvas: Node = null;
    @property(ScrollInput)
    scrollInput: ScrollInput = null;

    private _zoomMax: number = 800;
    private _startPosition: Vec2;
    private _currentPanSpeed: Vec2 = new Vec2();
    private _panEnd: boolean = false;
    private _scrollOrtographicSize: number = 0;
    private _epsilon: number = 0.01;
    private _zooming: boolean = false;
    private _panning: boolean = false;
    private _zoomDetecting: boolean = false;
    private _zoomPanDirection: Vec3 = new Vec3();
    private _cameraLimits: Bounds;
    private _aspectRatio: number;
    private _mousePosition: Vec2 = new Vec2();
    private _previousDistance: number = 0;
    private _touches: Touch[] = [];
    private _fistTouchId: number = -1;

    public get worldMousePosition(): Vec2 {
        const p = this.camera.screenToWorld(new Vec3(this._mousePosition.x, this._mousePosition.y, 0));
        return new Vec2(p.x, p.y);
    }

    start() {
        if (this.touchInputPanel) {
            this.touchInputPanel.on(Node.EventType.TOUCH_START, this.onTouchBegan, this, true);
            this.touchInputPanel.on(Node.EventType.TOUCH_END, this.onTouchEnded, this, true);
            this.touchInputPanel.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this, true);
            this.touchInputPanel.on(Node.EventType.MOUSE_WHEEL, this.onMouseWheel, this, true);
            this.touchInputPanel.on(Node.EventType.MOUSE_MOVE, this.onMouseMove, this, true);
        }
        this._scrollOrtographicSize = this.camera.orthoHeight;

        const ctr = this.canvas.getComponent(UITransform);
        this._aspectRatio = (ctr.width / 2) / this.camera.orthoHeight;

        const tr = this.limits.getComponent(UITransform);
        this._cameraLimits = new Bounds(this.limits.position.x - tr.width * tr.anchorX, this.limits.position.y - tr.height * tr.anchorY, tr.width, tr.height);
        this._zoomMax = this._cameraLimits.height / 2;

        this.scrollInput.min = this.zoomMin;
        this.scrollInput.max = this._zoomMax;
        this.scrollInput.updateSize();
        this.scrollInput.node.on(ScrollInputEventType.UPDATE_Y, (val: number) => {
            this.camera.orthoHeight = val;
        });
        this.scrollInput.valueY = this.camera.orthoHeight;
    }

    scrollBy(d: number, zoomToMouse: boolean) {
        if (!this._zooming) {
            let newSize = this._scrollOrtographicSize * (d > 0 ? d : 1 / Math.abs(d));
            if (newSize > this._zoomMax || newSize < this.zoomMin) {
                return;
            }
            this._scrollOrtographicSize = newSize;

            if (zoomToMouse) {
                const uipoint = this.camera.convertToUINode(new Vec3(this.worldMousePosition.x, this.worldMousePosition.y, 0), this.touchInputPanel);
                const ctr = this.canvas.getComponent(UITransform);
                const pointX = uipoint.x * 2 / ctr.width;
                const pointY = uipoint.y * 2 / ctr.height;
                this._zoomPanDirection = (new Vec3(pointX * this._aspectRatio, pointY, 0)).multiplyScalar(- Math.sign(d));
            }

            let limitForce: Vec2 = new Vec2();
            if (d > 0) {
                const cameraWidth = 2 * this._scrollOrtographicSize * this._aspectRatio;
                const cameraHeight = 2 * this._scrollOrtographicSize;
                const cameraMinX = this.camera.node.position.x - 0.5 * cameraWidth;
                const cameraMinY = this.camera.node.position.y - 0.5 * cameraHeight;
                const cameraMaxX = this.camera.node.position.x + 0.5 * cameraWidth;
                const cameraMaxY = this.camera.node.position.y + 0.5 * cameraHeight;
                const limitMinX = this._cameraLimits.x;
                const limitMinY = this._cameraLimits.y;
                const limitMaxX = this._cameraLimits.x + this._cameraLimits.width;
                const limitMaxY = this._cameraLimits.y + this._cameraLimits.height;
                if (cameraMinX < limitMinX) {
                    limitForce.add(new Vec2(limitMinX - cameraMinX, 0));
                }
                if (cameraMinY < limitMinY) {
                    limitForce.add(new Vec2(0, limitMinY - cameraMinY));
                }
                if (cameraMaxX > limitMaxX) {
                    limitForce.add(new Vec2(limitMaxX - cameraMaxX, 0));
                }
                if (cameraMaxY > limitMaxY) {
                    limitForce.add(new Vec2(0, limitMaxY - cameraMaxY));
                }
                limitForce.multiplyScalar(d / this._scrollOrtographicSize);
                if (2 * this._scrollOrtographicSize * this._aspectRatio > this._cameraLimits.width) {
                    limitForce.x = ((limitMinX - limitMaxX) / 2 - this.camera.node.position.x) / this._scrollOrtographicSize * this._aspectRatio;
                }
                if (2 * this._scrollOrtographicSize > this._cameraLimits.height) {
                    limitForce.y = (this.camera.node.position.y - (limitMinY - limitMaxY) / 2) / this._scrollOrtographicSize;
                }
                if (limitForce.x != 0) {
                    this._zoomPanDirection.x = limitForce.x;
                }
                if (limitForce.y != 0) {
                    this._zoomPanDirection.y = limitForce.y;
                }
            }
            this._zooming = true;
        }
    }

    private onMouseWheel(event: EventMouse) {
        this.scrollBy(misc.clampf(event.getScrollY(), -1, 1) * this.zoomStep * -1, true);
    }

    private readTouches(event: EventTouch) {
        this._mousePosition = event.touch.getLocation();
        this._touches = event.getAllTouches();
        if (this._touches.length > 1) {
            if (!this._zoomDetecting) {
                this._fistTouchId = this._touches.filter(t => t.getID() != event.touch.getID())[0].getID();
                this._previousDistance = 0;
                log(`Start zoom detection ${this._fistTouchId}`);
            }
            this._zoomDetecting = true;
        } else {
            this._zoomDetecting = false;
        }
        if (this._fistTouchId != -1) {
            const t = this._touches.find(t => t.getID() == this._fistTouchId);
            if (t) {
                this._mousePosition = t.getLocation();
            } else {
                this._fistTouchId = -1;
            }
        }
        //log(`${this._mousePosition.x} ${this._mousePosition.y}`);
    }

    private onTouchBegan(event: EventTouch) {
        this.readTouches(event);
        this._startPosition = this.worldMousePosition;
        this._panEnd = false;
        this._panning = true;
    }

    onTouchEnded(event: EventTouch) {
        this._panEnd = true;
        const acceleration = this.smoothPan ? 1 : this.panEndAcceleration;
        this._currentPanSpeed = Vec2.subtract(new Vec2(), this._startPosition, this.worldMousePosition).multiplyScalar(acceleration);
    }

    zoom(deltaTime: number) {
        let delta: number = this._scrollOrtographicSize - this.camera.orthoHeight;
        let dir: number = Math.sign(delta);
        let inc: number = deltaTime * 1 / this.zoomDuration * this._scrollOrtographicSize / (dir / 2 + 1.5);
        this.camera.orthoHeight += dir * inc;
        delta = this._scrollOrtographicSize - this.camera.orthoHeight;
        if (this._zoomPanDirection.x != 0 || this._zoomPanDirection.y != 0) {
            const v = Vec3.multiplyScalar(new Vec3(), this._zoomPanDirection, inc);
            this.camera.node.position = this.camera.node.position.add(Vec3.multiplyScalar(new Vec3(), this._zoomPanDirection, inc));
        }
        if (delta > - this._epsilon && delta < this._epsilon || dir != Math.sign(delta)) {
            this.camera.orthoHeight = this._scrollOrtographicSize;
            this._zoomPanDirection = new Vec3();
            this._zooming = false;
        }
    }

    pan(deltaTime: number) {
        if (!this._panEnd) {
            this._currentPanSpeed = Vec2.subtract(new Vec2(), this._startPosition, this.worldMousePosition);
        } else {
            let sign = Math.sign(this._currentPanSpeed.x);
            const n = (new Vec2(this._currentPanSpeed)).normalize();
            this._currentPanSpeed.x -= this.deceleration * n.x * deltaTime;
            if (sign != Math.sign(this._currentPanSpeed.x)) {
                this._currentPanSpeed.x = 0;
            }
            sign = Math.sign(this._currentPanSpeed.y);
            this._currentPanSpeed.y -= this.deceleration * n.y * deltaTime;
            if (sign != Math.sign(this._currentPanSpeed.y)) {
                this._currentPanSpeed.y = 0;
            }
        }

        if (2 * this.camera.orthoHeight * this._aspectRatio >= this._cameraLimits.width) {
            this._currentPanSpeed.x = 0 - this.camera.node.position.x;
        }
        if (2 * this.camera.orthoHeight >= this._cameraLimits.height) {
            this._currentPanSpeed.y = 0 - this.camera.node.position.y;
        }

        const positionMultiplier = this.smoothPan || this._panEnd ? (deltaTime * this.panSpeed) : 1;
        this.camera.node.position.add(new Vec3(this._currentPanSpeed.x, this._currentPanSpeed.y, 0).multiplyScalar(positionMultiplier));

        const lim = new Bounds(this._cameraLimits);
        lim.contentSize = lim.contentSize.subtract(new Vec2(2 * this.camera.orthoHeight * this._aspectRatio, 2 * this.camera.orthoHeight));
        if (lim.size.x < 0) {
            const sz = lim.size;
            sz.x = 0;
            lim.size = sz;
        }
        if (lim.size.y < 0) {
            const sz = lim.size;
            sz.y = 0;
            lim.size = sz;
        }
        //log(`${this.camera.node.position.x} ${this.camera.node.position.y} ${lim.xMin} ${lim.xMax} ${lim.yMin} ${lim.yMax}`);
        this.camera.node.position = new Vec3(misc.clampf(this.camera.node.position.x, lim.xMin, lim.xMax), misc.clampf(this.camera.node.position.y, lim.yMin, lim.yMax), this.camera.node.position.z);
        if (this._panEnd && this._currentPanSpeed.lengthSqr() < this._epsilon * this._epsilon) {
            this._panning = false;
        }
    }

    private zoomDetection() {
        if (this._touches.length > 1) {
            const distance = Vec2.distance(this._touches[0].getLocation(), this._touches[1].getLocation());
            const delta = distance - this._previousDistance;
            if ((delta > this._epsilon || delta < - this._epsilon) && this._previousDistance != 0) {
                this.camera.orthoHeight *= this._previousDistance / distance;
                this.camera.orthoHeight = misc.clampf(this.camera.orthoHeight, this.zoomMin, this._zoomMax);
            }
            this._previousDistance = distance;
        }
    }


    update(deltaTime: number) {
        if (this._zooming) {
            this.zoom(deltaTime);
        }
        if (this._panning) {
            this.pan(deltaTime);
        }
        if (this._zoomDetecting) {
            this.zoomDetection();
        }
    }

    onTouchMove(event: EventTouch) {
        this.readTouches(event);
    }

    onTouchCancelled(event: EventTouch) {
        log("Touch canceled");
        this.readTouches(event);
    }

    onMouseMove(event: EventMouse) {
        this._mousePosition.x = event.getLocationX();
        this._mousePosition.y = event.getLocationY();
    }
}

