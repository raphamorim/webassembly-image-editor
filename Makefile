build:
	cargo build --release
	cp target/wasm32-unknown-unknown/release/editor.wasm ./resources/editor.wasm
	du -k ./resources/editor.wasm
	cargo server

watch:
	cargo watch -i *.wasm -- make build

watch-dev:
	cargo watch -i *.wasm -- make build-debug

build-debug:
	cargo build
	cp target/wasm32-unknown-unknown/debug/editor.wasm ./resources/editor.wasm

lint:
	cargo fmt --check

server:
	python -m http.server