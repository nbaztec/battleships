package models

import (
	"errors"
	"time"
)

type GameMaster struct {
	ActiveGames map[string]*Game
}

func (g *GameMaster) CreateGame(id string) *Game {
	game := NewGame(id)
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

func NewGameMaster() *GameMaster {
	return &GameMaster{
		ActiveGames: map[string]*Game{
			"test": newTestGame(),
		},
	}
}

func newTestGame() *Game {
	p1 := NewPlayer()
	p1.ID = "p1"
	p1.PlaceShips(testShips())

	p2 := NewPlayer()
	p2.ID = "p2"
	p2.PlaceShips(testShips())

	return &Game{
		ID:           "test",
		LastActivity: time.Now(),
		Player1:      &p1,
		Player2:      &p2,
		NextPlayerID: p1.ID,
	}
}

func testShips() []Ship {
	return []Ship{
		NewShipAt("s1", 4, 0, 0, true),
		NewShipAt("s2", 3, 4, 0, false),
		NewShipAt("s3", 2, 0, 8, true),
		NewShipAt("s4", 2, 0, 4, true),
		NewShipAt("s5", 1, 6, 6, true),
	}
}