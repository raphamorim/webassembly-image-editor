use core::slice::from_raw_parts_mut;
use std::alloc::{alloc, Layout};
use std::mem;

#[no_mangle]
fn malloc(size: usize) -> *mut u8 {
    let align = mem::align_of::<usize>();
    if let Ok(layout) = Layout::from_size_align(size, align) {
        unsafe {
            if layout.size() > 0 {
                let ptr = alloc(layout);
                if !ptr.is_null() {
                    return ptr;
                }
            } else {
                return align as *mut u8;
            }
        }
    }
    std::process::abort()
}

#[no_mangle]
fn grayscale(data: *mut u8, len: usize) {
    let pixels = unsafe { from_raw_parts_mut(data as *mut u8, len) };
    let mut i = 0;
    loop {
        if i >= len - 1 {
            break;
        }
        let grayscale = (pixels[i] / 3) + (pixels[i + 1] / 3) + (pixels[i + 2] / 3);
        pixels[i] = grayscale;
        pixels[i + 1] = grayscale;
        pixels[i + 2] = grayscale;
        i += 4;
    }
}

#[no_mangle]
fn red(data: *mut u8, len: usize) {
    let pixels = unsafe { from_raw_parts_mut(data as *mut u8, len) };
    let mut i = 0;
    loop {
        if i >= len - 1 {
            break;
        }

        // 0
        pixels[i + 1] = pixels[i + 1] / 2;
        pixels[i + 2] = pixels[i + 2] / 2;
        // 3
        // 4
        pixels[i + 5] = pixels[i + 5] / 2;
        pixels[i + 6] = pixels[i + 6] / 2;
        // 7
        i += 8;
    }
}

#[no_mangle]
fn strong_red(data: *mut u8, len: usize) {
    let pixels = unsafe { from_raw_parts_mut(data as *mut u8, len) };
    let mut i = 0;
    loop {
        if i >= len - 1 {
            break;
        }

        // 0
        pixels[i + 1] = 0;
        pixels[i + 2] = 0;
        // 3
        // 4
        pixels[i + 5] = 0;
        pixels[i + 6] = 0;
        // 7
        i += 8;
    }
}

#[no_mangle]
fn drop_opacity(data: *mut u8, len: usize) {
    let pixels = unsafe { from_raw_parts_mut(data as *mut u8, len) };
    let mut i = 0;
    loop {
        if i >= len - 1 {
            break;
        }

        // 0
        // pixels[i + 1] = 0;
        // pixels[i + 2] = 0;
        pixels[i + 3] = 127;
        // 4
        // pixels[i + 5] = 0;
        // pixels[i + 6] = 0;
        pixels[i + 7] = 127;
        i += 8;
    }
}

#[no_mangle]
fn blue(data: *mut u8, len: usize) {
    let pixels = unsafe { from_raw_parts_mut(data as *mut u8, len) };
    let mut i = 0;
    loop {
        if i >= len - 1 {
            break;
        }

        pixels[i] = pixels[i] / 2;
        pixels[i + 1] = pixels[i + 1] / 2;
        // 2
        // 3
        pixels[i + 4] = pixels[i + 4] / 2;
        pixels[i + 5] = pixels[i + 5] / 2;
        // 6
        // 7
        i += 8;
    }
}

#[no_mangle]
fn strong_blue(data: *mut u8, len: usize) {
    let pixels = unsafe { from_raw_parts_mut(data as *mut u8, len) };
    let mut i = 0;
    loop {
        if i >= len - 1 {
            break;
        }

        pixels[i] = 0;
        pixels[i + 1] = 0;
        // 2
        // 3
        pixels[i + 4] = 0;
        pixels[i + 5] = 0;
        // 6
        // 7
        i += 8;
    }
}

#[no_mangle]
fn green(data: *mut u8, len: usize) {
    let pixels = unsafe { from_raw_parts_mut(data as *mut u8, len) };
    let mut i = 0;
    loop {
        if i >= len - 1 {
            break;
        }

        pixels[i] = pixels[i] / 2;
        // 1
        pixels[i + 2] = pixels[i + 2] / 2;
        // 3
        pixels[i + 4] = pixels[i + 4] / 2;
        // 5
        pixels[i + 6] = pixels[i + 6] / 2;
        // 7
        i += 8;
    }
}

#[no_mangle]
fn strong_green(data: *mut u8, len: usize) {
    let pixels = unsafe { from_raw_parts_mut(data as *mut u8, len) };
    let mut i = 0;
    loop {
        if i >= len - 1 {
            break;
        }

        pixels[i] = 0;
        // 1
        pixels[i + 2] = 0;
        // 3
        pixels[i + 4] = 0;
        // 5
        pixels[i + 6] = 0;
        // 7
        i += 8;
    }
}

#[no_mangle]
fn sepia(data: *mut u8, len: usize) {
    let pixels = unsafe { from_raw_parts_mut(data as *mut u8, len) };
    let mut i = 0;
    loop {
        if i >= len - 1 {
            break;
        }

        let r = pixels[i] as f32;
        let g = pixels[i + 1] as f32;
        let b = pixels[i + 2] as f32;

        pixels[i] = ((r * 0.393) + (g * 0.769) + (b * 0.189)) as u8;
        pixels[i + 1] = ((r * 0.349) + (g * 0.686) + (b * 0.168)) as u8;
        pixels[i + 2] = ((r * 0.272) + (g * 0.534) + (b * 0.131)) as u8;

        i += 4;
    }
}
