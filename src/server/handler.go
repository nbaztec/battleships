package server

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"

	"github.com/nbaztec/battleships/src/model"
	"github.com/pkg/errors"
)

var (
	errFailGenerateGameID = errors.New("failed generating a game id")
	errMissingGameID      = errors.New("missing gameId")
	errMissingPlayerID    = errors.New("missing playerId")
)

const (
	maxGenerateGameIDTries = 15
	defaultGridSize        = 10
)

var gameMaster = model.NewGameMaster()

func StartGameHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Content-type", "application/json")

	gridSize := defaultGridSize
	gameID := r.URL.Query().Get("gid")
	size := r.URL.Query().Get("size")
	if size != "" {
		if sz, err := strconv.Atoi(size); err == nil {
			gridSize = sz
		}
	}

	if gameID == "" {
		newGameID := ""
		for i := 0; i < maxGenerateGameIDTries; i++ {
			id := model.NewGameID()
			if !gameMaster.GameExists(id) {
				newGameID = id
				break
			}
		}

		if newGameID == "" {
			writeErr(w, errFailGenerateGameID)
			return
		}

		http.Redirect(w, r, fmt.Sprintf("/api/game?gid=%s&size=%d", newGameID, gridSize), http.StatusSeeOther)
		return
	}

	playerID := r.URL.Query().Get("pid")

	game, err := gameMaster.GetGame(gameID)
	if playerID == "" {
		if err != nil {
			game = gameMaster.CreateGame(gameID, gridSize)
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

	var ships []model.Ship
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

	var location model.Point
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

func ResignHandler(w http.ResponseWriter, r *http.Request) {
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

	if err := game.Resign(playerID); err != nil {
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

func RematchHandler(w http.ResponseWriter, r *http.Request) {
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

	if err := game.Rematch(playerID); err != nil {
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
