let img,
  strip,
  selectedY = 0,
  previousY = 0,
  r = [],
  g = [],
  b = [],
  a = []

const showR = true
const showG = true
const showB = true
const showP5Chart = true

const stripGap = 20
const stripHeight = 50
const chartGap = 20
const chartHeight = 256

const desmosDiv = document.getElementById('desmos')
const desmos = Desmos.GraphingCalculator(desmosDiv, {
  expressions: false,
  settingsMenu: false,
  showGrid: false,
})

function setup() {
  const canvas = createCanvas(100, 100)
  canvas.parent('imgCanvas')
  changeImage('https://upload.wikimedia.org/wikipedia/commons/d/d3/Color_complex_plot.jpg')
}

function draw() {
  background(255)
  if (!img) {
    return
  }

  if (mouseIsPressed && 0 <= mouseY && mouseY < img.height && 0 <= mouseX && mouseX < img.width) {
    updateSelectedY()
  }

  image(img, 0, 0)

  strokeWeight(0.5)
  if (selectedY < img.height) {
    line(0, selectedY, width, selectedY)
  }

  translate(0, img.height + stripGap)
  drawStrip()

  translate(0, stripHeight + chartGap)
  drawChart()
}

function updateSelectedY(newY) {
  previousY = selectedY
  selectedY = newY ?? constrain(Math.round(mouseY), 0, img.height - 1)
  if (selectedY != previousY || newY) {
    updateStrip(selectedY)
    updateDesmos()
  }
}

function updateDesmos() {
  if (showR)
    desmos.setExpression({
      id: 'r',
      type: 'table',
      columns: [
        { latex: 'x_1', values: r.map((_, i) => i), color: '#ff0000' },
        { latex: 'y_1', values: r, color: '#ff0000', lines: true, pointSize: 1 },
      ],
    })
  if (showG)
    desmos.setExpression({
      id: 'g',
      type: 'table',
      columns: [
        { latex: 'x_2', values: g.map((_, i) => i), color: '#00ff00' },
        { latex: 'y_2', values: g, color: '#00ff00', lines: true, pointSize: 1 },
      ],
    })
  if (showB)
    desmos.setExpression({
      id: 'b',
      type: 'table',
      columns: [
        { latex: 'x_3', values: b.map((_, i) => i), color: '#0000ff' },
        { latex: 'y_3', values: b, color: '#0000ff', lines: true, pointSize: 1 },
      ],
    })
}

function updateStrip(y) {
  if (!img?.pixels?.length) return

  strip = createImage(img.width, 1)
  strip.loadPixels()

  const offset = img.width * y * 4
  for (let i = 0; i < img.width; i++) {
    r[i] = strip.pixels[i * 4] = img.pixels[offset + i * 4]
    g[i] = strip.pixels[i * 4 + 1] = img.pixels[offset + i * 4 + 1]
    b[i] = strip.pixels[i * 4 + 2] = img.pixels[offset + i * 4 + 2]
    a[i] = strip.pixels[i * 4 + 3] = img.pixels[offset + i * 4 + 3]
  }

  r.length = g.length = b.length = a.length = img.width

  strip.updatePixels()
  strip.resize(img.width, stripHeight)
}

function drawChart() {
  push()
  noFill()
  rect(0, 0, img.width, chartHeight)
  showR && drawChartPoints('#FF0000', r)
  showG && drawChartPoints('#00FF00', g)
  showB && drawChartPoints('#0000FF', b)
  pop()
}

function drawChartPoints(color, values) {
  stroke(color)
  for (let i = 1; i < img.width; i++) {
    line(i - 1, chartHeight - values[i - 1], i, chartHeight - values[i])
  }
}

function drawStrip() {
  if (!strip) return
  image(strip, 0, 0)
}

function changeImage(url) {
  loadImage(
    url,
    (loadedImg) => {
      img = loadedImg
      if (img.height > 500) {
        img.resize(0, 500)
      }
      resizeCanvas(img.width, img.height + stripGap + stripHeight + (showP5Chart ? chartGap + chartHeight : 0))
      img.loadPixels()

      updateSelectedY(Math.round(img.height / 2))

      desmosDiv.style.width = `${img.width}px`
      desmos.setMathBounds({
        left: 0,
        right: img.width,
        bottom: 0,
        top: chartHeight,
      })
      desmos.setDefaultState(desmos.getState())

      updateDesmos()
    },
    () => {
      alert('Image failed to load.')
    }
  )
}

document.querySelector('#imageInput').addEventListener('change', (e) => {
  const file = e.target.files[0]
  if (file) {
    const url = URL.createObjectURL(file)
    changeImage(url)
    document.querySelector('label[for="imageInput"]').textContent = file.name
  }
})
