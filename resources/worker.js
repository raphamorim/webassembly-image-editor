let grayscale;

addEventListener('message', async (e) => {
  let isDone = false;

  if (e.data.action === 'CREATE') {
    result = await WebAssembly.instantiateStreaming(
      fetch('editor.wasm'),
      e.data.imports
    );
    grayscale = result.instance.exports.grayscale;
  }

  if (e.data.action === 'RUN') {
    grayscale(e.data.ptr, e.data.length);
    isDone = true;
  }

  postMessage({
    ...e.data,
    isDone
  });
}, false);
  
