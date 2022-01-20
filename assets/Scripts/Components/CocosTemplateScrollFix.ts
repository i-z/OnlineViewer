
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
 
@ccclass('CocosTemplateScrollFix')
export class CocosTemplateScrollFix extends Component {

    onLoad () {
        document.getElementById("GameDiv").style.border = "0px";
    }
}
