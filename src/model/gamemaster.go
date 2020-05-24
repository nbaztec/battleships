package model

import (
	"errors"
	"time"
)

const (
	DefaultGCDuration = 30 * time.Minute
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

func (g *GameMaster) CreateGame(id string, gridSize int) *Game {
	g.GC()

	game := NewGame(id, gridSize)
	g.ActiveGames[id] = game

	return game
}

func (g *GameMaster) GetGame(id string) (*Game, error) {
	game, ok := g.ActiveGames[id]
	if !ok {
		return nil, errors.New("game not found")
	}

	return game, nil
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
