const input = document.querySelector("input");
const buttonReset = document.querySelector("#reset");
const buttonGrayscaleJs = document.querySelector("#grayscale-js");
const buttonGrayscaleWasm = document.querySelector("#grayscale-wasm");
const buttonSepiaJs = document.querySelector("#sepia-js");
const buttonSepiaWasm = document.querySelector("#sepia-wasm");
const wasm = {
  grayscale: null,
  sepial: null,
};
let originalImage = document.getElementById("image").src;

const memory = new WebAssembly.Memory({
  initial: 256,
  maximum: 512,
});

WebAssembly
  .instantiateStreaming(fetch('./resources/editor.wasm'), { js: { mem: memory } })
  .then(wasm => {
    const { instance } = wasm;
    const { grayscale, sepia, malloc } = instance.exports;

    // result.instance.exports.memory_to_js();
    // const memObj = new Uint8Array(result.instance.exports.memory.buffer, 0).slice(0, 1)
    // console.log(memObj[0]) // 13
    // const s = new Set([1, 2, 3, 4]);
    // let jsArr = Uint8Array.from(s);
    // const len = jsArr.length;
    // const memVis = new Uint8Array(obj.instance.exports.memory.buffer);

    buttonGrayscaleWasm.addEventListener('click', () => {
      filter(image, (canvas, context) => {
        const image = document.getElementById("image");
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const buffer = imageData.data.buffer;
        const u8Array = new Uint8Array(buffer);
        let wasmClampedPtr = malloc(u8Array.length);
        let wasmClampedArray = new Uint8ClampedArray(instance.exports.memory.buffer, wasmClampedPtr, u8Array.length);
        wasmClampedArray.set(u8Array);
        
        const startTime = performance.now();
        grayscale(wasmClampedPtr, u8Array.length);
        const endTime = performance.now();
        updateOperationTime(startTime, endTime);

        const width = image.naturalWidth || image.width;
        const height = image.naturalHeight || image.height;
        const newImageData = context.createImageData(width, height);
        newImageData.data.set(wasmClampedArray);
        context.putImageData(newImageData, 0, 0);
        image.src = canvas.toDataURL('image/jpeg');
      });
    });

    buttonSepiaWasm.addEventListener('click', () => {
      filter(image, (canvas, context) => {
        const image = document.getElementById("image");
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const buffer = imageData.data.buffer;
        const u8Array = new Uint8Array(buffer);
        let wasmClampedPtr = malloc(u8Array.length);
        let wasmClampedArray = new Uint8ClampedArray(instance.exports.memory.buffer, wasmClampedPtr, u8Array.length);
        wasmClampedArray.set(u8Array);
        const startTime = performance.now();
        sepia(wasmClampedPtr, u8Array.length);
        const endTime = performance.now();
        updateOperationTime(startTime, endTime);
        const width = image.naturalWidth || image.width;
        const height = image.naturalHeight || image.height;
        const newImageData = context.createImageData(width, height);
        newImageData.data.set(wasmClampedArray);
        context.putImageData(newImageData, 0, 0);
        image.src = canvas.toDataURL('image/jpeg');
      });
    });
});

function updateOperationTime(startTime, endTime) {
  const operationTime = document.querySelector('#operation-time');
  operationTime.textContent = `${endTime - startTime} ms`;
}

function processBlackAndWhite(canvas, context) {
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const pixels  = imageData.data;
  const startTime = performance.now();
  for (var i = 0, n = pixels.length; i < n; i += 4) {
    const grayscale = pixels[i] * .3 + pixels[i+1] * .59 + pixels[i+2] * .11;
    pixels[i] = grayscale;
    pixels[i+1] = grayscale;
    pixels[i+2] = grayscale;
  }
  const endTime = performance.now();
  updateOperationTime(startTime, endTime);
  context.putImageData(imageData, 0, 0);
}

function processSepia(canvas, context) {
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const pixels  = imageData.data;
  const startTime = performance.now();
  for (let i = 0; i < pixels.length; i += 4) {
    var r = pixels[i];
    var g = pixels[i + 1];
    var b = pixels[i + 2];

    pixels[i] = (r * 0.393) + (g * 0.769) + (b * 0.189);
    pixels[i + 1] = (r * 0.349) + (g * 0.686) + (b * 0.168);
    pixels[i + 2] = (r * 0.272) + (g * 0.534) + (b * 0.131);
  }
  const endTime = performance.now();
  updateOperationTime(startTime, endTime);
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
