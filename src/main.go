package main

import (
	"net/http"

	"log"

	"github.com/nbaztec/battleships/src/server"
)

func main() {
	srv := &http.Server{Addr: ":8080", Handler: server.NewMux()}
	err := srv.ListenAndServe()
	if err != nil {
		log.Fatal(err)
	}
}
