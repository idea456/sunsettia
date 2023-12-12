import { Node, NodeType, TextNode } from "types";

class Sunsettia {
    constructor() {}

    static render(target: Node, parent: HTMLElement) {
        let element;
        if (target.type === NodeType.Tag) {
            element = document.createElement(target.name);
            for (let i = 0; i < target.children.length; i++) {
                this.render(target.children[i], element);
            }
        } else if (target.type === NodeType.Text) {
            // TODO: Check if its an expression
            element = document.createTextNode((target as TextNode).value);
        }

        if (element) parent.appendChild(element);
    }
}

export default Sunsettia;
