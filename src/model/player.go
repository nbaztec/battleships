package model

import (
	"errors"
	"fmt"

	"github.com/google/uuid"
)

var (
	errShipNotFound = errors.New("ship not found")
)

type Player struct {
	ID             string          `json:"id"`
	Ships          map[string]Ship `json:"ships"`
	Grid           Grid            `json:"-"`
	Turns          map[string]bool `json:"turns"`
	LastAction     *Action         `json:"lastAction"`
	ShipsRemaining int             `json:"shipsRemaining"`
}

func (p *Player) Clone() Player {
	player := Player{
		ID:             p.ID,
		Grid:           p.Grid,
		ShipsRemaining: p.ShipsRemaining,
		LastAction:     p.LastAction,
	}

	if p.Ships != nil {
		player.Ships = make(map[string]Ship)
		for k, v := range p.Ships {
			player.Ships[k] = v
		}
	}

	if p.Turns != nil {
		player.Turns = make(map[string]bool)
		for k, v := range p.Turns {
			player.Turns[k] = v
		}
	}

	return player
}

func (p *Player) Defeated() bool {
	return p.ShipsRemaining == 0
}

func (p *Player) AllShipsPlaced() bool {
	for _, v := range p.Ships {
		if !v.Position.Valid() {
			return false
		}
	}

	return true
}

func (p *Player) PlaceShips(ships []Ship) error {
	for _, ship := range ships {
		s, ok := p.Ships[ship.ID]
		if !ok {
			return fmt.Errorf("%w: id '%s'", errShipNotFound, ship.ID)
		}

		s.Position = ship.Position
		p.Ships[ship.ID] = s
	}

	return p.Grid.Load(ships)
}

func (p *Player) Check(location Point, opponent *Player) (bool, error) {
	if _, ok := p.Turns[location.ID()]; ok {
		return false, errors.New("point already marked")
	}

	p.LastAction = newAction(location)

	v := opponent.Grid.Value(location)
	if v != GridCellEmpty {
		s := opponent.Ships[v]
		p.LastAction.HitShipID = s.ID

		s.Hits++
		if s.HasSunk() {
			p.LastAction.Sunk = true
			opponent.ShipsRemaining--
		}

		opponent.Ships[v] = s
	}

	found := v != GridCellEmpty
	p.Turns[location.ID()] = found

	return found, nil
}

func (p *Player) Reset() {
	p.LastAction = nil
	p.Turns = map[string]bool{}
	p.Grid.Reset()
	p.Ships = make(map[string]Ship)
	p.ShipsRemaining = 0

	for _, ship := range NewDefaultShips() {
		p.Ships[ship.ID] = ship
		p.ShipsRemaining++
	}
}

func NewPlayer(gridSize int) Player {
	p := Player{
		ID:    uuid.New().String(),
		Grid:  NewGrid(gridSize),
		Turns: map[string]bool{},
	}

	p.Ships = make(map[string]Ship)

	for _, ship := range NewDefaultShips() {
		p.Ships[ship.ID] = ship
		p.ShipsRemaining++
	}

	return p
}
