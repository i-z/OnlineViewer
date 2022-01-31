
import { _decorator, Component, Node, Toggle, log } from 'cc';
import { DockPanel } from './DockPanel';
const { ccclass, property } = _decorator;

@ccclass('ToggleDockPanel')
export class ToggleDockPanel {
    @property(Toggle)
    toggle: Toggle = null;
    @property(DockPanel)
    panel: DockPanel = null;
}

@ccclass('PanelManager')
export class PanelManager extends Component {

    @property([ToggleDockPanel])
    toggleDockPanels: ToggleDockPanel[] = [];


    start () {
        for (const tp of this.toggleDockPanels) {
            const panel = tp.panel;
            tp.toggle.node.on(Toggle.EventType.TOGGLE, (t) => {
                const toggle: Toggle = t;
                if (toggle.isChecked) {
                    panel.show();
                } else {
                    panel.hide();
                }
            });
        }
    }
}
