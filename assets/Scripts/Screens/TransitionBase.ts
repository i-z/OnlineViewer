
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
 
@ccclass('TransitionBase')
export class TransitionBase extends Component {
   async begin() {}
   async end() {}
}