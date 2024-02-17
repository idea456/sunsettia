

# 🍋 Sunsettia
[![npm version](https://img.shields.io/npm/v/sunsettia?style=flat&colorA=18181B&colorB=d8c449)](https://www.npmjs.com/package/sunsettia)

A simple language for the frontend, Sunsettia is a frontend compiler that focuses on simplicity and readability. 

Inspired by the Svelte and React lifecycle, Sunsettia aims to provide a more readable syntax and ease of managing reactivity.

## Installation

To install Sunsettia:

```bash
  npm install sunsettia
```

Sunsettia currently only supports Node version > 15.

⚠️ The development server is currently being developed and is still in alpha version, thus at the time being, to receive the parsed code, simply call `compileRaw` like:
```jsx
import Sunsettia from 'sunsettia'

const FILE = `
  <script>
    ...
  </script>

  <component name="App">...</component>   
`

Sunsettia.compileRaw(FILE)
```
    
## Usage/Examples

Sunsettia has a similar syntax to Svelte and Vue, but it has some major differences:

Components are declared with the `<component>` tag. The `name` property, which specifies the component name, must be specified in the tag. For instance:
```html
<component name="App">
    <h1>The number is {num}.</h1>
    <button @click={onClick}>Increment</button>
</component>
```
This specifies that this component is declared as `<App />` based on the name property provided. There are no exports required.

Variable mutations are reactive by default. Sunsettia automatically detects mutations in variables and ensures that it is reactive and binded to the DOM. For instance:
```html
<script>
    let n = 0;

    function onClick() {
        n += 1; // this is reactive by default
    }
</script>

<component name="App">
    <h1>The number is {num}.</h1>
    <button @click={onClick}>Increment</button>
</component>
```
Sunsettia will wrap `n += 1` in an invalidate function, which notifies all the respective DOM nodes to re-render when this statement is executed automatically.

Event handlers must be declared and prefixed using `@` syntax. For instance, to add an on click listener to a button, it must be prefixed with `@` like `@click={...}`.


## How it works

Sunsettia is a compile-time framework, which means that it generates all of the steps required to build the DOM tree and renders them accordingly from top to bottom according to your code. 

The following code for instance:

```html
<script>
    let n = 0;

    function onClick() {
        n += 1;
    }
</script>

<component name="App">
    <h1>The number is {num}.</h1>
    <button @click={onClick}>Increment</button>
</component>
```
will generate the following steps:
```javascript
export default function() {
    let n = 0;

    function onClick() {
        _invalidate('n', n += 1);
    }
    let App_0;
    let h1_0;
    let text_0;
    let expr_0;
    let button_0;
    let text_1;
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
    _listen('n', () => expr_0.data = n);
    return {
        create() {
            App_0 = document.createElement('div');
            document.body.appendChild(App_0)
            App_0.setAttribute('data-component', 'App')
            h1_0 = document.createElement('h1');
            App_0.appendChild(h1_0)
            text_0 = document.createTextNode('The number is ;')
            h1_0.appendChild(text_0);
            expr_0 = document.createTextNode(n)
            h1_0.appendChild(expr_0)
            button_0 = document.createElement('button');
            App_0.appendChild(button_0)
            text_1 = document.createTextNode('Increment;')
            button_0.appendChild(text_1);
            button_0.addEventListener('click', onClick);
        },
        destroy() {
            const component = document.querySelector('[data-component="App_0"]');
            document.body.removeChild(component);
        }
    }
}
```

## Roadmap

- Add conditional rendering with control flow syntax
```html
<if condition={num === 0}>
   <h1>No number</h1>
</if>
<elif condition={num === 1>
   <h1>Number is once.</h1>
</elif>
<else>
   <h1> Number is {num}.</h1>
</else>
```

- Add suppport for runtime rendering
```js
const root = document.getElementById('root')
Sunsettia.render(root)
```

- Integrate lazy loading
```html
<div lazy>
    <h1>I'm not loaded yet</h1>
</div>
```
