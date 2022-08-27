use core::slice::from_raw_parts_mut;
use std::alloc::{alloc, Layout};
use std::mem;

#[no_mangle]
fn memory_to_js() {
    let obj: &mut [u8];

    unsafe {
        obj = from_raw_parts_mut::<u8>(0 as *mut u8, 1);
    }

    // obj[0] = 13;
}

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
fn accumulate(data: *mut u8, len: usize) -> i32 {
    let y = unsafe { from_raw_parts_mut(data as *mut u8, len) };
    let mut sum = 0;
    for i in 0..len {
        sum = sum + y[i];
    }
    sum as i32
}

#[no_mangle]
fn grayscale(data: *mut u8, len: usize) {
    let pixels = unsafe { from_raw_parts_mut(data as *mut u8, len) };
    let mut i = 0;
    loop {
        if i >= len - 1 {
            break;
        }

        // The Weighted Method:
        // Grayscale = 0.299R + 0.587G + 0.114B
        // let grayscale = ((pixels[i] as f32 * 0.3) + (pixels[i+1] as f32 * 0.59) + (pixels[i+2] as f32 * 0.11)) as u8;

        // Average Method
        // Grayscale = (R + G + B ) / 3
        // Theoretically, the formula is 100% correct.
        // But when writing code, you may encounter uint8 overflow error
        // The sum of R, G, and B is greater than 255.
        // To avoid the exception, R, G, and B should be calculated, respectively.
        // Grayscale = R / 3 + G / 3 + B / 3
        let grayscale = (pixels[i] / 3) + (pixels[i + 1] / 3) + (pixels[i + 2] / 3);
        pixels[i] = grayscale;
        pixels[i + 1] = grayscale;
        pixels[i + 2] = grayscale;
        i += 4;
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
