package models

import (
	"fmt"

	"github.com/pkg/errors"
)

var (
	errCellNotEmpty = errors.New("cell not empty")
)

const (
	GridCellEmpty   = ""
	DefaultGridSize = 10
)

type Grid struct {
	Field [][]string `json:"field"`
	Size  int        `json:"size"`
}

func (g *Grid) Value(p Point) string {
	return g.Field[p.Row][p.Col]
}

func (g *Grid) Load(ships []Ship) error {
	g.Field = make([][]string, g.Size)
	for i := 0; i < g.Size; i++ {
		g.Field[i] = make([]string, g.Size)
		for j := 0; j < g.Size; j++ {
			g.Field[i][j] = GridCellEmpty
		}
	}

	for _, ship := range ships {
		if ship.Position.Vertical {
			for i := ship.Position.Row; i < ship.Position.Row+ship.Size; i++ {
				if g.Field[i][ship.Position.Col] != GridCellEmpty {
					return fmt.Errorf("%w: [%d,%d], ship#%s", errCellNotEmpty, i, ship.Position.Col, ship.ID)
				}
				g.Field[i][ship.Position.Col] = ship.ID
			}
		} else {
			for i := ship.Position.Col; i < ship.Position.Col+ship.Size; i++ {
				if g.Field[ship.Position.Row][i] != GridCellEmpty {
					return fmt.Errorf("%w: [%d,%d], ship#%s", errCellNotEmpty, ship.Position.Row, i, ship.ID)
				}
				g.Field[ship.Position.Row][i] = ship.ID
			}
		}
	}

	return nil
}

func (g *Grid) Print() error {
	for i := 0; i < g.Size; i++ {
		for j := 0; j < g.Size; j++ {
			fmt.Printf("%2s,", g.Field[i][j])
		}
		fmt.Println()
	}

	return nil
}

func NewGrid() Grid {
	return Grid{
		Size: DefaultGridSize,
	}
}

func NewGridOfSize(size int) Grid {
	return Grid{
		Size: size,
	}
}
