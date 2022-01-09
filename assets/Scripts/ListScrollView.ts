
import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
import { ListItem, ListItemEvent } from './ListItem';
const { ccclass, property } = _decorator;

export enum ListScrollViewEvent {
    SELECT_ITEM = 'select item'
}
 
@ccclass('ListScrollView')
export class ListScrollView extends Component {

    @property(Node)
    contentNode: Node;

    @property(Prefab)
    itemPrefab: Prefab;

    start () {
    }

    setData(data: string[], offset?: number) {
        this.contentNode.removeAllChildren();
        for (var i = 0; i < data.length; i++) {
            const str = data[i];
            const item = instantiate(this.itemPrefab);
            item.parent = this.contentNode;
            const lit = item.getComponent(ListItem);
            if (lit) {
                lit.init();
                if (offset) {
                    lit.setString(i + offset, str);
                }
                else {
                    lit.setString(i, str);
                }
                
                lit.node.on(ListItemEvent.SELECT, (idx:number) => {
                    this.node.emit(ListScrollViewEvent.SELECT_ITEM, idx);
                });
            }
        }
    }
}
