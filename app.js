export default function () {
    let variableToNodesMapper = new Map();
    function _invalidate(variable, expr) {
        const nodes = variableToNodesMapper.get(variable);
        if (nodes) {
            for (let i = 0; i < nodes.length; i++) {
                nodes[i]();
            }
        }
    }
    function _listen(variable, fn) {
        if (!variableToNodesMapper.has(variable))
            variableToNodesMapper.set(variable, []);
        variableToNodesMapper.set(variable, [
            ...variableToNodesMapper.get(variable),
            fn,
        ]);
    }
    let num = 0;
    let name = "Hello";
    let title = name === "Hello" ? "Hi" : "Hello there";
    let hasClickedReset = false;
    function onClick() {
        _invalidate("num", (num += 1));
    }
    function onClickReset() {
        _invalidate("num", (num = 0));
        _invalidate("hasClickedReset", (hasClickedReset = true));
    }
    const component = document.createElement("div");
    document.body.appendChild(component);
    const h1_0 = document.createElement("h1");
    component.appendChild(h1_0);
    const text_1 = document.createTextNode("The current number is ");
    h1_0.appendChild(text_1);
    const expr_1 = document.createTextNode(num);
    h1_0.appendChild(expr_1);
    _listen("num", () => (expr_1.data = num));
    const h2_1 = document.createElement("h2");
    component.appendChild(h2_1);
    const expr_2 = document.createTextNode(
        num === 0 ? "Got nothing" : "We have something",
    );
    h2_1.appendChild(expr_2);
    _listen(
        "num",
        () => (expr_2.data = num === 0 ? "Got nothing" : "We have something"),
    );
    const text_2 = document.createTextNode("");
    h2_1.appendChild(text_2);
    const h3_2 = document.createElement("h3");
    component.appendChild(h3_2);
    const text_3 = document.createTextNode("Has resetted? ");
    h3_2.appendChild(text_3);
    const expr_3 = document.createTextNode(hasClickedReset ? "Yes" : "Not yet");
    h3_2.appendChild(expr_3);
    _listen(
        "hasClickedReset",
        () => (expr_3.data = hasClickedReset ? "Yes" : "Not yet"),
    );
    const button_3 = document.createElement("button");
    button_3.addEventListener("click", onClick);
    component.appendChild(button_3);
    const text_4 = document.createTextNode("Submit");
    button_3.appendChild(text_4);
    const button_4 = document.createElement("button");
    button_4.addEventListener("click", onClickReset);
    component.appendChild(button_4);
    const text_5 = document.createTextNode("Reset");
    button_4.appendChild(text_5);
}
