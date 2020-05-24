package server

import "net/http"

func NewMux() *http.ServeMux {
	mux := http.NewServeMux()

	mux.Handle("/api/game/create", http.HandlerFunc(CreateGameHandler))
	mux.Handle("/api/game/join", http.HandlerFunc(JoinGameHandler))
	mux.Handle("/api/game", http.HandlerFunc(GetGameHandler))
	mux.Handle("/api/set", http.HandlerFunc(SetPlayerHandler))
	mux.Handle("/api/check", http.HandlerFunc(CheckHandler))
	mux.Handle("/api/resign", http.HandlerFunc(ResignHandler))
	mux.Handle("/api/rematch", http.HandlerFunc(RematchHandler))

	mux.Handle("/api/status", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	}))

	fsrv := http.FileServer(http.Dir("./html"))
	mux.Handle("/", http.StripPrefix("/", fsrv))

	return mux
}
