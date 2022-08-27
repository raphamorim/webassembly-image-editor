
use core::slice::from_raw_parts_mut;
use std::alloc::{alloc, dealloc,  Layout};
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
    let align = std::mem::align_of::<usize>();
    if let Ok(layout) = Layout::from_size_align(size, align) {
        unsafe {
            if layout.size() > 0 {
                let ptr = alloc(layout);
                if !ptr.is_null() {
                    return ptr
                }
            } else {
                return align as *mut u8
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
fn grayscale(data_ptr: *mut u8, count: usize) -> u8 {

    // return data_ptr;

    // This is safe only if `data_ptr` is not null.
    let data = unsafe { 
        from_raw_parts_mut(data_ptr, count) 
    };

    return data[0];

    // if data.len() > 0 {
    //     return data[1] as i32;
    // }

    // data.len() as i32
}
