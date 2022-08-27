const memory = new WebAssembly.Memory({
  initial: 256,
  maximum: 500,
  // initial: 10, // 640KiB
  // maximum: 100, // 6.4MiB
  // shared: true
});

WebAssembly
  .instantiateStreaming(fetch('./resources/editor.wasm'), { js: { mem: memory } })
  .then(wasm => {
    const { instance } = wasm;
    const { grayscale } = instance.exports;

    // result.instance.exports.memory_to_js();
    // const memObj = new Uint8Array(result.instance.exports.memory.buffer, 0).slice(0, 1)
    // console.log(memObj[0]) // 13

    const s = new Set([1, 2, 3]);
    let jsArr = Uint8Array.from(s);
    const len = jsArr.length;
    let wasmArrPtr = instance.exports.malloc(len);
    let wasmArr = new Uint8Array(instance.exports.memory.buffer, wasmArrPtr, len);
    wasmArr.set(jsArr);
    const sum = instance.exports.accumulate(wasmArrPtr, len) // -> 7
    console.log(sum)








    // const memVis = new Uint8Array(obj.instance.exports.memory.buffer);


    // filter(image, (canvas, context) => {

    //   const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    //   // const pixels = imageData.data;
    //   const buffer = imageData.data.buffer;

    //   const u8Array = new Uint8Array(buffer);

    //   console.log(u8Array, u8Array.length);
    //   console.log(grayscale(u8Array[0], u8Array.length));
    // });

    // wasm.grayscale();
    // let ptr = instance.getPtr();
    // let size = instance.getLength();
    // let uint8Buffer = new Uint8Array(module.buffer, ptr, size);
    // console.log(uint8Buffer);
    // // wasm.grayscale = processWasm.bind(this, grayscale);
    // wasm.grayscale = grayscale;
    
});

// function passArray8ToWasm0(arg, malloc) {
//     const ptr = malloc(arg.length * 1);
//     getUint8Memory0().set(arg, ptr / 1);
//     WASM_VECTOR_LEN = arg.length;
//     return ptr;
// }
// *
// * @param {Uint8Array} rom
// * @returns {Promise<void>}

// export function render(rom) {
//     const ptr0 = passArray8ToWasm0(rom, wasm.__wbindgen_malloc);
//     const len0 = WASM_VECTOR_LEN;
//     const ret = wasm.render(ptr0, len0);
//     return takeObject(ret);
// }

const input = document.querySelector("input");
const buttonReset = document.querySelector("#reset");
const buttonGrayscaleJs = document.querySelector("#grayscale-js");
const buttonSepiaJs = document.querySelector("#sepia-js");
const wasm = {
  grayscale: null,
  sepial: null,
};
let originalImage = document.getElementById("image").src;

function processWasm(wasmFn) {
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  const processedPixels = wasmFn(1);
  console.log(processedPixels);
  // context.putImageData(processedPixels, 0, 0);
}

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
