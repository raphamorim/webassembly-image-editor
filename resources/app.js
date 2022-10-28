const input = document.querySelector('input');
const buttonReset = document.querySelector('#reset');
const buttonGrayscaleJs = document.querySelector('#grayscale-js');
const buttonGrayscaleWasm = document.querySelector('#grayscale-wasm');
const buttonSepiaJs = document.querySelector('#sepia-js');
const buttonSepiaWasm = document.querySelector('#sepia-wasm');
const wasm = {
  grayscale: null,
  sepial: null,
};
let originalImage = document.getElementById('image').src;

// 20971520 bytes -> 20 MiB (320 pages)
// 41943040 bytes -> 40 MiB (640 pages)
// 209715200 bytes -> 200 MiB (3200 pages)
const memory = new WebAssembly.Memory({
  initial: 100, // 6.4MiB
  maximum: 3200, // 200MiB
  shared: true
});

console.log('>', memory.buffer);

let workerList = [];
for (let i = 0; i < window.navigator.hardwareConcurrency; i++) {
  let newWorker = {
    worker: new Worker('/resources/worker.js'),
    inUse: false
  };
  workerList.push(newWorker);
}

WebAssembly
  .instantiateStreaming(fetch('./resources/editor.wasm'), { env: { memory } })
  .then(wasm => {
    const { instance } = wasm;
    const { grayscale, sepia, malloc } = instance.exports;

    buttonGrayscaleWasm.addEventListener('click', () => {
      filter(image, (canvas, context) => {
        const image = document.getElementById('image');
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        const buffer = imageData.data.buffer;
        const u8Array = new Uint8Array(buffer);
        let wasmClampedPtr = malloc(u8Array.length);
        let wasmClampedArray = new Uint8ClampedArray(memory.buffer, wasmClampedPtr, u8Array.length);
        wasmClampedArray.set(u8Array);
        
        const startTime = performance.now();
        grayscale(wasmClampedPtr, u8Array.length);
        const endTime = performance.now();
        updateOperationTime(startTime, endTime, 'WebAssembly Grayscale');

        const width = image.naturalWidth || image.width;
        const height = image.naturalHeight || image.height;
        const newImageData = context.createImageData(width, height);
        newImageData.data.set(wasmClampedArray);
        context.putImageData(newImageData, 0, 0);
        image.src = canvas.toDataURL('image/jpeg');
        console.log(memory.buffer);
      });
    });

    buttonSepiaWasm.addEventListener('click', () => {
      filter(image, (canvas, context) => {
        const image = document.getElementById('image');
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const buffer = imageData.data.buffer;
        const u8Array = new Uint8Array(buffer);
        let wasmClampedPtr = malloc(u8Array.length);
        let wasmClampedArray = new Uint8ClampedArray(memory.buffer, wasmClampedPtr, u8Array.length);
        wasmClampedArray.set(u8Array);
        const startTime = performance.now();
        sepia(wasmClampedPtr, u8Array.length);
        const endTime = performance.now();
        updateOperationTime(startTime, endTime, 'WebAssembly Sepia');
        const width = image.naturalWidth || image.width;
        const height = image.naturalHeight || image.height;
        const newImageData = context.createImageData(width, height);
        newImageData.data.set(wasmClampedArray);
        context.putImageData(newImageData, 0, 0);
        image.src = canvas.toDataURL('image/jpeg');
      });
    });
});

input.addEventListener('change', (event) => {
  const selectedFile = event.target.files[0];
  const reader = new FileReader();

  const image = document.getElementById('image');
  image.title = selectedFile.name;

  reader.onload = (event) => {
    image.src = event.target.result;
    originalImage = event.target.result;
  };

  reader.readAsDataURL(selectedFile);
});

buttonGrayscaleJs.addEventListener('click', (event) => {
  const image = document.getElementById('image');
  const base64 = filter(image, processBlackAndWhite);
  image.src = base64;
});

buttonSepiaJs.addEventListener('click', (event) => {
  const image = document.getElementById('image');
  const base64 = filter(image, processSepia);
  image.src = base64;
});

buttonReset.addEventListener('click', (event) => {
  const image = document.getElementById('image');
  image.src = originalImage;
});
