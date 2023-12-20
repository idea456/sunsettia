export default function() {
let num = 0;
let name = 'Hello';
let title = name === 'Hello' ? 'Hi' : 'Hello there';
let hasClickedReset = false;
let value = '';
function onClick() {
    _invalidate('num', num += 1);
}
function onClickReset() {
    _invalidate('num', num = 0);
    _invalidate('hasClickedReset', hasClickedReset = true);
}
function onChange(e) {
    let num = 0;
    _invalidate('value', value = e.target.value);
    console.log('typed value', value);
    const someFn = () => {
        _invalidate('num', num += 1);
        console.log('current num is', num);
    };
    someFn();
}
let Counter_0;
let div_0;
let h1_0;
let text_0;
let h3_0;
let text_1;
let div_1;
let h1_1;
let text_2;
let h1_2;
let text_3;
let h1_3;
let text_4;
let div_4;
let div_5;
let div_6;
let text_6;
let expr_6;
let h2_6;
let expr_7;
let div_7;
let input_7;
let button_7;
let text_7;
let button_8;
let text_8;
let div_8;
let h1_8;
let text_9;
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
_listen('num', () => expr_6.data = num === 0 ? 'Yes' : 'Nope')
_listen('num', () => expr_7.data = num)
return {
                create() {
                    Counter_0 = document.createElement('div');
document.body.appendChild(Counter_0)
Counter_0.setAttribute('data-component', 'Counter')
div_0 = document.createElement('div');
Counter_0.appendChild(div_0)
h1_0 = document.createElement('h1');
div_0.appendChild(h1_0)
text_0 = document.createTextNode('Header ')
h1_0.appendChild(text_0)
h3_0 = document.createElement('h3');
h1_0.appendChild(h3_0)
text_1 = document.createTextNode('Text')
h3_0.appendChild(text_1)
div_1 = document.createElement('div');
div_0.appendChild(div_1)
h1_1 = document.createElement('h1');
div_1.appendChild(h1_1)
text_2 = document.createTextNode('Home')
h1_1.appendChild(text_2)
h1_2 = document.createElement('h1');
div_1.appendChild(h1_2)
text_3 = document.createTextNode('About')
h1_2.appendChild(text_3)
h1_3 = document.createElement('h1');
div_1.appendChild(h1_3)
text_4 = document.createTextNode('Contact')
h1_3.appendChild(text_4)
div_4 = document.createElement('div');
Counter_0.appendChild(div_4)
div_5 = document.createElement('div');
div_4.appendChild(div_5)
div_6 = document.createElement('div');
div_5.appendChild(div_6)
text_6 = document.createTextNode('Is number zerxxo? ')
div_6.appendChild(text_6)
expr_6 = document.createTextNode(num === 0 ? 'Yes' : 'Nope')
div_6.appendChild(expr_6)
h2_6 = document.createElement('h2');
div_5.appendChild(h2_6)
expr_7 = document.createTextNode(num)
h2_6.appendChild(expr_7)
div_7 = document.createElement('div');
div_4.appendChild(div_7)
input_7 = document.createElement('input');
div_7.appendChild(input_7)
button_7 = document.createElement('button');
div_7.appendChild(button_7)
text_7 = document.createTextNode('Increment')
button_7.appendChild(text_7)
button_8 = document.createElement('button');
div_7.appendChild(button_8)
text_8 = document.createTextNode('Reset')
button_8.appendChild(text_8)
div_8 = document.createElement('div');
Counter_0.appendChild(div_8)
h1_8 = document.createElement('h1');
div_8.appendChild(h1_8)
text_9 = document.createTextNode('Footer')
h1_8.appendChild(text_9)
div_0.style['display'] = ' flex'
div_0.style['justify-content'] = ' space-between'
div_1.style['display'] = ' flex'
div_1.style['gap'] = ' 16px'
div_4.style['display'] = ' flex'
div_4.style['flex-direction'] = ' column'
div_4.style['justify-content'] = ' center'
div_4.style['align-items'] = ' center'
div_5.style['font-size'] = ' 62px'
div_5.style['font-weight'] = ' 600'
div_5.style['text-align'] = ' center'
div_7.style['display'] = ' flex'
div_7.style['flex-direction'] = ' column'
div_7.style['width'] = ' 40%'
div_8.style['width'] = ' 100vw'
div_8.style['text-align'] = ' center'
input_7.addEventListener('click', onChange);
button_7.addEventListener('click', onClick);
button_8.addEventListener('click', onClickReset);
                },
                destroy() {
                    const component = document.querySelector('[data-component="Counter_0"]')
                    document.body.removeChild(component);
                }
            }
}