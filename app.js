export default function() {
const component = document.createElement('div')
document.body.appendChild(component)
const div_0 = document.createElement('div')
component.appendChild(div_0)
const text_1 = document.createTextNode('The current number is ')
div_0.appendChild(text_1)
const h2_1 = document.createElement('h2')
component.appendChild(h2_1)
const text_2 = document.createTextNode('')
h2_1.appendChild(text_2)
const button_2 = document.createElement('button')
button_2.addEventListener('click', onClick);
component.appendChild(button_2)
const text_3 = document.createTextNode('Submit')
button_2.appendChild(text_3)
}