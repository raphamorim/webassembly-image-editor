const input = document.querySelector("input");
const buttonReset = document.querySelector("#reset");
const buttonGrayscaleJs = document.querySelector("#grayscale-js");
const buttonSepiaJs = document.querySelector("#sepia-js");
let originalImage = document.getElementById("image").src;

WebAssembly
.instantiateStreaming(fetch('./editor.wasm'))
.then((results) => {
  console.log(results.instance.exports.grayscale(1));
});

function processBlackAndWhite(canvas, context) {
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const pixels  = imageData.data;
  for (var i = 0, n = pixels.length; i < n; i += 4) {
    const grayscale = pixels[i] * .3 + pixels[i+1] * .59 + pixels[i+2] * .11;
    pixels[i] = grayscale;
    pixels[i+1] = grayscale;
    pixels[i+2] = grayscale;
  }
  context.putImageData(imageData, 0, 0);
}

function processSepia(canvas, context) {
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const pixels  = imageData.data;

  for (let i = 0; i < pixels.length; i += 4) {
    var r = pixels[i];
    var g = pixels[i + 1];
    var b = pixels[i + 2];

    pixels[i] = (r * 0.393) + (g * 0.769) + (b * 0.189);
    pixels[i + 1] = (r * 0.349) + (g * 0.686) + (b * 0.168);
    pixels[i + 2] = (r * 0.272) + (g * 0.534) + (b * 0.131);
  }

  context.putImageData(imageData, 0, 0);
};

input.addEventListener('change', (event) => {
  const selectedFile = event.target.files[0];
  const reader = new FileReader();

  const image = document.getElementById("image");
  image.title = selectedFile.name;

  reader.onload = (event) => {
    image.src = event.target.result;
    originalImage = event.target.result;
  };

  reader.readAsDataURL(selectedFile);
});

buttonGrayscaleJs.addEventListener('click', (event) => {
  const image = document.getElementById("image");
  const base64 = filter(image, processBlackAndWhite);
  image.src = base64;
});

buttonSepiaJs.addEventListener('click', (event) => {
  const image = document.getElementById("image");
  const base64 = filter(image, processSepia);
  image.src = base64;
});

buttonReset.addEventListener('click', (event) => {
  const image = document.getElementById("image");
  image.src = originalImage;
});

function convertImageToCanvas(image) {
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  canvas.getContext('2d').drawImage(image, 0, 0);

  return canvas;
}

function filter(image, processImageFn) {
  const canvas = convertImageToCanvas(image);
  if (!processImageFn) {
    return canvas.toDataURL();
  }

  if (typeof processImageFn === 'function') {
    processImageFn(canvas, canvas.getContext('2d'));
    return canvas.toDataURL('image/jpeg');
  }
}
