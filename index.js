const fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const argv = require("yargs").argv;

let template = fs.readFileSync("./template/index.html").toString();
let namedTemplate = template.replace(/%%NAME%%/gi, argv.name);

const dom = new JSDOM(namedTemplate)
const { document } = dom.window;
let content = document.getElementById("content");

// create layout
// format: (row first)
/*
  [
    {s: 3, c: [{s: 6}, {s: 4}]},
    {s: 4, c: [{s: 2}, {s: 3}]}
  ]

  (means): 
  row: height 3/7
    col: width 6/10
    col: width 4/10
  row: height 4/7
    col: width 2/5
    col: width 3/5
*/

let layout = [
  { s: 1, c: [{ s: 1 }, { s: 1 }] },
  { s: 1, c: [{ s: 1 }, { s: 1 }] }
]; // 2 x 2

if (argv.layout && argv.layout.indexOf(".json")) {
  layout = JSON.parse(fs.readFileSync(argv.layout).toString());
} else if (argv.layout) {
  layout = JSON.parse(argv.layout);
}

createChildLayout(content, layout, 0);

fs.writeFileSync(`./out/${argv.name}.html`, dom.serialize());

function createChildLayout(el, children, layer) {
  let totalWidth = children.reduce((total, child) => total + child.s, 0);

  let fillDirection = layer % 2 ? "height" : "width";
  let ratioDirection = layer % 2 ? "width" : "height";
  let elClass = layer % 2 ? "row" : "col";

  for (let child of children) {
    let childEl = document.createElement("div");
    childEl.style[fillDirection] = "100%";
    childEl.style[ratioDirection] = Math.floor(100 * child.s / totalWidth) + "%";
    childEl.className = elClass;

    if (child.c) {
      createChildLayout(childEl, child.c, layer + 1);
    } else {
      let newSVG = document.createElement("svg");
      
      if (child.id) newSVG.id = child.id;

      newSVG.className = "stretch";
      newSVG.style.background = randomRGB();

      childEl.appendChild(newSVG);
    }

    el.appendChild(childEl);
  }
}

function randomRGB() {
  let r = Math.floor(Math.random() * 256),
    g = Math.floor(Math.random() * 256),
    b = Math.floor(Math.random() * 256);

  return `rgb(${r}, ${g}, ${b})`;
}