

# 🍋 Sunsettia
[![npm version](https://img.shields.io/npm/v/sunsettia?style=flat&colorA=18181B&colorB=d8c449)](https://www.npmjs.com/package/sunsettia)

A simple language for the frontend, Sunsettia is a frontend compiler that focuses on simplicity and readability. 

Inspired by the Svelte and React lifecycle, Sunsettia aims to provide a more readable syntax and ease of managing reactivity.




## Installation

To install Sunsettia:

```bash
  npm install sunsettia
```

Sunsettia supports only Node version > 15.
    
## Usage/Examples

Sunsettia has a similar syntax to Svelte and Vue, but it has some major differences:

Components are declared with the `<component>` tag. The `name` property, which specifies the component name, must be specified in the tag. For instance:
```html
<component name="App">
    <h1>The number is {num}.</h1>
    <button @click={onClick}>Increment</button>
</component>
```
This specifies that this is a component named `App`. There are no exports required.

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
    
    return {
        create() {
            
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
