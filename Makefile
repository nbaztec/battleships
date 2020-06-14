.PHONY: run test
run:
	go run src/main.go
test:
	go test ./src/...
