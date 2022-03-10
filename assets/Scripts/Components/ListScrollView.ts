
import { _decorator, Component, Node, Prefab, instantiate, ScrollView, Vec2, find, assert, Toggle } from 'cc';
import { ListItem, ListItemData, ListItemEvent } from './ListItem';
const { ccclass, property, requireComponent } = _decorator;

export enum ListScrollViewEvent {
    SELECT_ITEM = 'select_item',
    SELECT_SINGLE_ITEM = 'select_single_item'
}

@ccclass('ListScrollView')
@requireComponent(ScrollView)
export class ListScrollView extends Component {

    @property(Node)
    contentNode: Node;

    @property(Prefab)
    itemPrefab: Prefab;

    private _scrollView: ScrollView = null;
    private _idx: number = 0;

    onLoad() {
        this._scrollView = this.getComponent(ScrollView)
        if (!this.contentNode) {
            this.contentNode = find('view/content', this.node);
        }
        assert(this.contentNode, "Can't find content node");
    }

    setData(data: string[], offset?: number, data1?: ListItemData[]) {
        this.contentNode.removeAllChildren();
        let off = 0;
        if (offset) {
            off = offset;
        }
        for (var i = 0; i < data.length; i++) {
            const d = data1?.find(d => d.index === i);
            if (!d || !d.deleted) {
                const str = data[i];
                const item = instantiate(this.itemPrefab);
                item.parent = this.contentNode;
                const lit = item.getComponent(ListItem);
                if (lit) {
                    lit.init();
                    if (offset) {
                        lit.setString(i + offset, str, d);
                    }
                    else {
                        lit.setString(i, str, d);
                    }

                    lit.node.on(ListItemEvent.SELECT, (idx: number, isChecked: boolean) => {
                        this.node.emit(ListScrollViewEvent.SELECT_ITEM, idx);
                    });
                }
            }
        }
        this._scrollView?.scrollTo(new Vec2(0, 1));
    }

    selectItem(t: Toggle) {
        const item = t.getComponent(ListItem);
        if (item) {
            this._idx = item.index;
            this.node.emit(ListScrollViewEvent.SELECT_SINGLE_ITEM, this._idx);
        }
    }

    get selectedIndex() {
        return this._idx;
    }
}
