package server

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/google/uuid"
	"github.com/nbaztec/battleships/src/models"
	"github.com/pkg/errors"
)

var (
	errMissingGameID   = errors.New("missing gameId")
	errMissingPlayerID = errors.New("missing playerId")
)

var gameMaster = models.NewGameMaster()

func StartGameHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Content-type", "application/json")

	gameID := r.URL.Query().Get("gid")
	if gameID == "" {
		http.Redirect(w, r, "/api/game?gid="+uuid.New().String(), http.StatusSeeOther)
		return
	}

	playerID := r.URL.Query().Get("pid")

	game, err := gameMaster.GetGame(gameID)
	if playerID == "" {
		if err != nil {
			game = gameMaster.CreateGame(gameID)
		}

		p, err := game.AddPlayer()
		if err != nil {
			writeErr(w, err)
			return
		}

		http.Redirect(w, r, "/api/game?gid="+gameID+"&pid="+p.ID, http.StatusSeeOther)
		return
	} else {
		if err != nil {
			writeErr(w, err)
			return
		}
	}

	b, err := json.Marshal(game.Hidden(playerID))
	if err != nil {
		writeErr(w, err)
		return
	}

	w.Write(b)
}

func SetPlayerHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Content-type", "application/json")

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	gameID := r.URL.Query().Get("gid")
	if gameID == "" {
		writeErr(w, errMissingGameID)
		return
	}

	playerID := r.URL.Query().Get("pid")
	if playerID == "" {
		writeErr(w, errMissingPlayerID)
		return
	}

	game, err := gameMaster.GetGame(gameID)
	if err != nil {
		writeErr(w, err)
		return
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		writeErr(w, err)
		return
	}

	var ships []models.Ship
	if err := json.Unmarshal(body, &ships); err != nil {
		writeErr(w, err)
		return
	}

	if err := game.SetPlayer(playerID, ships); err != nil {
		writeErr(w, err)
		return
	}

	b, err := json.Marshal(game.Hidden(playerID))
	if err != nil {
		writeErr(w, err)
		return
	}

	w.Write(b)
}

func CheckHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Content-type", "application/json")

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	gameID := r.URL.Query().Get("gid")
	if gameID == "" {
		writeErr(w, errMissingGameID)
		return
	}

	playerID := r.URL.Query().Get("pid")
	if playerID == "" {
		writeErr(w, errMissingPlayerID)
		return
	}

	game, err := gameMaster.GetGame(gameID)
	if err != nil {
		writeErr(w, err)
		return
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		writeErr(w, err)
		return
	}

	var location models.Point
	if err := json.Unmarshal(body, &location); err != nil {
		writeErr(w, err)
		return
	}

	if err := game.Check(playerID, location); err != nil {
		writeErr(w, err)
		return
	}

	b, err := json.Marshal(game.Hidden(playerID))
	if err != nil {
		writeErr(w, err)
		return
	}

	w.Write(b)
}

func writeErr(w http.ResponseWriter, err error) {
	b, err := json.Marshal(struct {
		Message string `json:"message"`
	}{
		Message: err.Error(),
	})

	if err != nil {
		log.Println(err)
	}

	w.WriteHeader(http.StatusBadRequest)
	w.Write(b)
}
