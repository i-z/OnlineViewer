
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
 
@ccclass('WindowTransitionBase')
export class WindowTransitionBase extends Component {
   async open(w: Node) {}
   async close(w: Node) {}
}