function convertImageToCanvas(image) {
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  canvas.getContext('2d').drawImage(image, 0, 0);
  return canvas;
};

function filter(image, processImageFn) {
  const canvas = convertImageToCanvas(image);
  if (!processImageFn) {
    return canvas.toDataURL();
  }

  if (typeof processImageFn === 'function') {
    processImageFn(canvas, canvas.getContext('2d'));
    return canvas.toDataURL('image/jpeg');
  }
};

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
  updateOperationTime(startTime, endTime, 'JavaScript Sepia');
  context.putImageData(imageData, 0, 0);
};

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
  updateOperationTime(startTime, endTime, 'JavaScript Grayscale');
  context.putImageData(imageData, 0, 0);
};

function updateOperationTime(startTime, endTime, text) {
  const operationTime = document.querySelector('#operation-time');
  operationTime.textContent = `${text}: ${endTime - startTime} ms.`;
};