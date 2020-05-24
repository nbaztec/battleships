package model

import (
	"errors"
	"time"
)

const (
	DefaultGCDuration = 30 * time.Minute
)

var (
	errGameNotFound      = errors.New("game not found")
	errGameAlreadyExists = errors.New("game already exists")
)

type GameMaster struct {
	ActiveGames map[string]*Game
}

func (g *GameMaster) GC() {
	var marked []string
	for _, v := range g.ActiveGames {
		if time.Now().Sub(v.LastActivity) > DefaultGCDuration {
			marked = append(marked, v.ID)
		}
	}

	for _, id := range marked {
		delete(g.ActiveGames, id)
	}
}

func (g *GameMaster) CreateGame(id string, gridSize, shipCount int) (*Game, error) {
	g.GC()

	if _, ok := g.ActiveGames[id]; ok {
		return nil, errGameAlreadyExists
	}

	game := NewGame(id, gridSize, shipCount)
	g.ActiveGames[id] = game

	return game, nil
}

func (g *GameMaster) GetGame(id string) (*Game, error) {
	game, ok := g.ActiveGames[id]
	if !ok {
		return nil, errors.New("game not found")
	}

	return game, nil
}

func (g *GameMaster) GetGameWithPlayer(id, playerID string) (*Game, error) {
	game, ok := g.ActiveGames[id]
	if !ok {
		return nil, errGameNotFound
	}

	if game.Player1 != nil && game.Player1.ID == playerID {
		return game, nil
	}

	if game.Player2 != nil && game.Player2.ID == playerID {
		return game, nil
	}

	return nil, errGameNotFound
}

func (g *GameMaster) GameExists(id string) bool {
	_, ok := g.ActiveGames[id]
	return ok
}

func NewGameMaster() *GameMaster {
	return &GameMaster{
		ActiveGames: map[string]*Game{},
	}
}
