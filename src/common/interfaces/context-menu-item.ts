import { MenuItem, BrowserWindow } from 'electron';
import { VNode } from 'vue';

export interface ContextMenuItem {
    label: string;
    actions?: string[];
    enabled?: boolean;
    visible?: boolean;
}

export type ContextMenuItemActionFunction = (
    vNode?: VNode,
    menuItem?: MenuItem,
    browserWindow?: BrowserWindow,
    event?: Event
) => void;
