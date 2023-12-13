export default function() {
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
let name = 'Hello';
let title = name === 'Hello' ? 'Hi' : 'Hello there';
let hasClickedReset = false;
function onClick() {
    _invalidate('num', num += 1);
}
function onClickReset() {
    _invalidate('num', num = 0);
    _invalidate('hasClickedReset', hasClickedReset = true);
}
function onChange(e) {
    console.log('typingss...', e);
}
const component = document.createElement('div')
document.body.appendChild(component)
const div_0 = document.createElement('div')
component.appendChild(div_0)
const div_1 = document.createElement('div')
div_0.appendChild(div_1)
const text_2 = document.createTextNode('Is number zero? ')
div_1.appendChild(text_2)
const expr_2 = document.createTextNode(num === 0 ? 'Yea' : 'Nope')
div_1.appendChild(expr_2)
_listen('num', () => expr_2.data = num === 0 ? 'Yea' : 'Nope')
const div_2 = document.createElement('div')
div_0.appendChild(div_2)
const expr_3 = document.createTextNode(num)
div_2.appendChild(expr_3)
_listen('num', () => expr_3.data = num)
const h1_3 = document.createElement('h1')
component.appendChild(h1_3)
const text_4 = document.createTextNode('B')
h1_3.appendChild(text_4)
const h4_4 = document.createElement('h4')
component.appendChild(h4_4)
const text_5 = document.createTextNode('C')
h4_4.appendChild(text_5)
const button_5 = document.createElement('button')
button_5.addEventListener('click', onClick);
component.appendChild(button_5)
const text_6 = document.createTextNode('Lmao')
button_5.appendChild(text_6)
}