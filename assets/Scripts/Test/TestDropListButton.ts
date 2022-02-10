
import { _decorator, Component, Node } from 'cc';
import { DropListButton } from '../Components/DropListButton';
const { ccclass, property } = _decorator;
 
@ccclass('TestDropButton')
export class TestDropButton extends Component {

    start () {
        const btn = this.getComponentInChildren(DropListButton);
        btn.setData([
            {id: 0, name: "New1"},
            {id: 0, name: "Big"},
            {id: 0, name: "Large", markered: true},
            {id: 0, name: "New"},
            {id: 0, name: "List"},
            {id: 0, name: "Down"}
        ]);
    }
}
