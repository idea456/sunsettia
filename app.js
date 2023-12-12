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
const h1_1 = document.createElement('h1')
div_0.appendChild(h1_1)
const text_2 = document.createTextNode('The current number is ')
h1_1.appendChild(text_2)
const expr_2 = document.createTextNode(num)
h1_1.appendChild(expr_2)
_listen('num', () => expr_2 .data = num)
const h2_2 = document.createElement('h2')
div_0.appendChild(h2_2)
const expr_3 = document.createTextNode(num === 0 ? 'Got nothing' : 'We have something')
h2_2.appendChild(expr_3)
_listen('num', () => expr_3 .data = num === 0 ? 'Got nothing' : 'We have something')
const text_3 = document.createTextNode('')
h2_2.appendChild(text_3)
const h3_3 = document.createElement('h3')
div_0.appendChild(h3_3)
const text_4 = document.createTextNode('Has resetted? ')
h3_3.appendChild(text_4)
const expr_4 = document.createTextNode(hasClickedReset ? 'Yes' : 'Not yet')
h3_3.appendChild(expr_4)
_listen('hasClickedReset', () => expr_4 .data = hasClickedReset ? 'Yes' : 'Not yet')
const button_4 = document.createElement('button')
button_4.addEventListener('click', onClick);
component.appendChild(button_4)
const text_5 = document.createTextNode('Submit')
button_4.appendChild(text_5)
const button_5 = document.createElement('button')
button_5.addEventListener('click', onClickReset);
component.appendChild(button_5)
const text_6 = document.createTextNode('Reset')
button_5.appendChild(text_6)
const input_6 = document.createElement('input')
input_6.addEventListener('change', onChange);
component.appendChild(input_6)
}