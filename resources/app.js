const input = document.querySelector('input');
const buttonGrayscaleWasm = document.querySelector('#grayscale-wasm');
const buttonGrayscaleWasmThreads = document.querySelector('#grayscale-wasm-threads');
buttonGrayscaleWasmThreads.textContent += ` with hardware concurrency: ${window.navigator.hardwareConcurrency}`;

const buttonSepiaWasm = document.querySelector('#sepia-wasm');

const concurrency = window.navigator.hardwareConcurrency;
let concurrencyTimeStart,
  concurrencyTimeEnd,
  concurrencyFlag = 0;
let workerList = [];

const imports = { env: { memory } };
WebAssembly
  .instantiateStreaming(fetch('resources/editor.wasm'), imports)
  .then(wasm => {
    const { instance } = wasm;
    const { grayscale, sepia, malloc } = instance.exports;

    for (let i = 0; i < concurrency; i++) {
      let worker = new Worker('/resources/worker.js');

      worker.addEventListener('message', e => {
        if (e.data.isDone) {
          concurrencyTimeEnd = performance.now();
          concurrencyFlag += 1;
          if (concurrencyFlag == concurrency) {
            concurrencyFlag = 0;
            updateOperationTime(concurrencyTimeStart, concurrencyTimeEnd, 'WebAssembly Thread');
          

            filter(image, (canvas, context) => {
              const imageElement = document.getElementById('image');
              const width = imageElement.naturalWidth || imageElement.width;
              const height = imageElement.naturalHeight || imageElement.height;
              const newImageData = context.createImageData(width, height);
              newImageData.data.set(e.data.wasmClampedArray);
              context.putImageData(newImageData, 0, 0);
              imageElement.src = canvas.toDataURL('image/jpeg');
            });
          }
        } else {
          console.log('created')
        }
      }, false);

      worker.postMessage({ action: 'CREATE', imports });
      workerList.push(worker);
    };

    buttonGrayscaleWasmThreads.addEventListener('click', () => {
      filter(image, (canvas, context) => {
        
        const imageElement = document.getElementById('image');
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        const buffer = imageData.data.buffer;
        const u8Array = new Uint8Array(buffer);
        let wasmClampedPtr = malloc(u8Array.length);
        let wasmClampedArray = new Uint8ClampedArray(memory.buffer, wasmClampedPtr, u8Array.length);
        wasmClampedArray.set(u8Array);


        // 8298400 / 8 = 1037300
        const chunk = u8Array.length / 8;
        // grayscale(wasmClampedPtr + (1037300 * 0), chunk);
        // grayscale(wasmClampedPtr + (1037300 * 1), chunk);
        // grayscale(wasmClampedPtr + (1037300 * 2), chunk);
        // grayscale(wasmClampedPtr + (1037300 * 3), chunk);
        // grayscale(wasmClampedPtr + (1037300 * 4), chunk);
        // grayscale(wasmClampedPtr + (1037300 * 5), chunk);
        // grayscale(wasmClampedPtr + (1037300 * 6), chunk);
        // grayscale(wasmClampedPtr + (1037300 * 7), chunk);

        concurrencyTimeStart = performance.now();
        for (let i = 0; i < concurrency; i++) {
          workerList[i].postMessage({
            id: i,
            isDone: false, 
            action: 'RUN',
            imports,
            ptr: wasmClampedPtr + (chunk * i),
            length: chunk,
            wasmClampedArray
          });
        }
      });
    });

    buttonGrayscaleWasm.addEventListener('click', () => {
      filter(image, (canvas, context) => {
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

        const imageElement = document.getElementById('image');
        const width = imageElement.naturalWidth || imageElement.width;
        const height = imageElement.naturalHeight || imageElement.height;
        const newImageData = context.createImageData(width, height);
        newImageData.data.set(wasmClampedArray);
        context.putImageData(newImageData, 0, 0);
        imageElement.src = canvas.toDataURL('image/jpeg');
      });
    });

    buttonSepiaWasm.addEventListener('click', () => {
      filter(image, (canvas, context) => {
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

        const imageElement = document.getElementById('image');
        const width = imageElement.naturalWidth || imageElement.width;
        const height = imageElement.naturalHeight || imageElement.height;
        const newImageData = context.createImageData(width, height);
        newImageData.data.set(wasmClampedArray);
        context.putImageData(newImageData, 0, 0);
        imageElement.src = canvas.toDataURL('image/jpeg');
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
