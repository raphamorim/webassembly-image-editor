// 20971520 bytes -> 20 MiB (320 pages)
// 41943040 bytes -> 40 MiB (640 pages)
// 209715200 bytes -> 200 MiB (3200 pages)
const memory = new WebAssembly.Memory({
  // initial: 320, // 20MiB
  initial: 640, // 40MiB
  maximum: 3200, // 200MiB
  shared: true
});