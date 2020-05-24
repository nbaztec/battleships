package model

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

var (
	errGameOver        = errors.New("game is over")
	errInvalidPlayerID = errors.New("invalid player id")
)

type GameState int

const (
	GameStateInitial GameState = iota
	GameStatePlanning
	GameStatePlaying
	GameStateFinished
)

type Game struct {
	ID             string     `json:"id"`
	GridSize       int        `json:"gridSize"`
	ShipsSpec      []ShipSpec `json:"shipsSpec"`
	State          GameState  `json:"state"`
	NextPlayerID   string     `json:"nextPlayerId"`
	Player1        *Player    `json:"player1"`
	Player2        *Player    `json:"player2"`
	WinnerPlayerID string     `json:"winnerPlayerId"`
	LastActivity   time.Time  `json:"lastActivity"`
	Revision       string     `json:"revision"`
	rematchRequest map[string]struct{}
}

func (g *Game) Hidden(playerID string) Game {
	game := Game{
		ID:             g.ID,
		GridSize:       g.GridSize,
		ShipsSpec:      g.ShipsSpec,
		State:          g.State,
		LastActivity:   g.LastActivity,
		NextPlayerID:   g.NextPlayerID,
		WinnerPlayerID: g.WinnerPlayerID,
		Revision:       g.Revision,
		rematchRequest: g.rematchRequest,
	}

	if g.Player1 == nil || g.Player2 == nil {
		game.Player1 = g.Player1
		game.Player2 = g.Player2
		return game
	}

	var hiddenPlayer Player
	if g.Player1.ID == playerID {
		hiddenPlayer = g.Player2.Clone()
		game.Player1 = g.Player1
		game.Player2 = &hiddenPlayer
	} else {
		hiddenPlayer = g.Player1.Clone()
		game.Player1 = &hiddenPlayer
		game.Player2 = g.Player2
	}

	if game.NextPlayerID == hiddenPlayer.ID {
		game.NextPlayerID = "-"
	}

	hiddenPlayer.ID = "-"
	for k := range hiddenPlayer.Ships {
		s := hiddenPlayer.Ships[k]
		if !s.HasSunk() {
			s.Position = nil
		}

		hiddenPlayer.Ships[k] = s
	}

	return game
}

func (g *Game) NextRevision() {
	g.Revision = uuid.New().String()
	g.LastActivity = time.Now()
}

func (g *Game) Over() bool {
	return g.WinnerPlayerID != ""
}

func (g *Game) AddPlayer() (*Player, error) {
	if g.Over() {
		return nil, errGameOver
	}

	p := NewPlayer(g.GridSize, g.ShipsSpec)
	if g.Player1 == nil {
		g.Player1 = &p
		g.NextPlayerID = p.ID
		g.NextRevision()
	} else if g.Player2 == nil {
		g.Player2 = &p
		g.State = GameStatePlanning
		g.NextRevision()

		// allow player2 to go first half of the time
		if random.Intn(2) == 1 {
			g.NextPlayerID = p.ID
		}
	} else {
		return nil, errors.New("lobby full")
	}

	return &p, nil
}

func (g *Game) Check(playerID string, location Point) error {
	if g.Over() {
		return errGameOver
	}

	if playerID != g.NextPlayerID {
		return errors.New("not your turn")
	}

	g.NextRevision()

	p := g.Player1
	opponent := g.Player2

	if p.ID != playerID {
		p = g.Player2
		opponent = g.Player1
	}

	found, err := p.Check(location, opponent)
	if err != nil {
		return err
	}

	if !found {
		g.NextTurn()
	}

	if !opponent.Defeated() {
		return nil
	}

	g.State = GameStateFinished
	g.WinnerPlayerID = p.ID
	return nil
}

func (g *Game) NextTurn() {
	if g.NextPlayerID == g.Player1.ID {
		g.NextPlayerID = g.Player2.ID
	} else {
		g.NextPlayerID = g.Player1.ID
	}
}

func (g *Game) Resign(playerID string) error {
	if g.Player1.ID == playerID {
		g.WinnerPlayerID = g.Player2.ID
	} else if g.Player2.ID == playerID {
		g.WinnerPlayerID = g.Player1.ID
	} else {
		return errInvalidPlayerID
	}

	g.State = GameStateFinished
	g.NextRevision()

	return nil
}

func (g *Game) Rematch(playerID string) error {
	if g.Player1.ID != playerID && g.Player2.ID != playerID {
		return errInvalidPlayerID
	}

	g.rematchRequest[playerID] = struct{}{}
	if len(g.rematchRequest) == 2 {
		g.Reset()
	}

	return nil
}

func (g *Game) SetPlayer(playerID string, ships []Ship) error {
	if g.Over() {
		return errGameOver
	}

	defer func() {
		if g.Player1.AllShipsPlaced() && g.Player2.AllShipsPlaced() {
			g.State = GameStatePlaying
		}
	}()

	g.NextRevision()
	switch playerID {
	case g.Player1.ID:
		return g.Player1.PlaceShips(ships)
	case g.Player2.ID:
		return g.Player2.PlaceShips(ships)
	default:
		return errors.New("invalid playerId")
	}
}

func (g *Game) Reset() {
	nextPlayerID := g.Player1.ID
	if g.WinnerPlayerID == g.Player1.ID {
		nextPlayerID = g.Player2.ID
	}

	g.WinnerPlayerID = ""
	g.NextPlayerID = nextPlayerID
	g.rematchRequest = map[string]struct{}{}
	g.State = GameStatePlanning
	g.Player1.Reset(g.ShipsSpec)
	g.Player2.Reset(g.ShipsSpec)
	g.NextRevision()
}

func NewGame(id string, gridSize, shipCount int) *Game {
	return &Game{
		ID:             id,
		GridSize:       gridSize,
		ShipsSpec:      NewShipsSpec(shipCount),
		State:          GameStateInitial,
		LastActivity:   time.Now().UTC(),
		Revision:       uuid.New().String(),
		rematchRequest: map[string]struct{}{},
	}
}

type NewGameRequest struct {
	PlayerID string
	Ships    []Ship
}

type HitRequest struct {
	PlayerID string
	Location Point
}
