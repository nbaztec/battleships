package server

import (
	"encoding/json"
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

func CreateGameHandler(w http.ResponseWriter, r *http.Request) {
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
		for i := 0; i < maxGenerateGameIDTries; i++ {
			id := model.NewGameID()
			if !gameMaster.GameExists(id) {
				gameID = id
				break
			}
		}

		if gameID == "" {
			writeErr(w, errFailGenerateGameID)
			return
		}
	}

	game, err := gameMaster.CreateGame(gameID, gridSize)
	if err != nil {
		writeErr(w, err)
		return
	}

	p, err := game.AddPlayer()
	if err != nil {
		writeErr(w, err)
		return
	}

	http.Redirect(w, r, "/api/game?gid="+gameID+"&pid="+p.ID, http.StatusSeeOther)
}

func JoinGameHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Content-type", "application/json")

	gameID := r.URL.Query().Get("gid")
	game, err := gameMaster.GetGame(gameID)
	if err != nil {
		writeErr(w, err)
		return
	}

	p, err := game.AddPlayer()
	if err != nil {
		writeErr(w, err)
		return
	}

	http.Redirect(w, r, "/api/game?gid="+gameID+"&pid="+p.ID, http.StatusSeeOther)
}

func GetGameHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Content-type", "application/json")

	gameID := r.URL.Query().Get("gid")
	playerID := r.URL.Query().Get("pid")

	game, err := gameMaster.GetGameWithPlayer(gameID, playerID)
	if err != nil {
		writeErr(w, err)
		return
	}

	b, err := json.Marshal(game.Hidden(playerID))
	if err != nil {
		writeErr(w, err)
		return
	}

	if _, err = w.Write(b); err != nil {
		log.Print(err)
	}
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

	if _, err = w.Write(b); err != nil {
		log.Print(err)
	}
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

	if _, err = w.Write(b); err != nil {
		log.Print(err)
	}
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

	if _, err = w.Write(b); err != nil {
		log.Print(err)
	}
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

	if _, err = w.Write(b); err != nil {
		log.Print(err)
	}
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
	if _, err = w.Write(b); err != nil {
		log.Print(err)
	}
}
