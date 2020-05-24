package model

import "strconv"

var colors = []string{
	"#4682B4",
	"#B0E0E6",
	"#20B2AA",
	"#87CEFA",
	"#1E90FF",
	"#7B68EE",
	"#00008B",
	"#4169E1",
	"#5F9EA0",
	"#00CED1",
}

type ShipSpec struct {
	ID    string `json:"id"`
	Size  int    `json:"size"`
	Color string `json:"color"`
}

type shipConfig struct {
	size  int
	ratio int
}

var shipCfg = []shipConfig{
	{4, 1},
	{3, 2},
	{2, 3},
	{1, 4},
}

func NewShipsSpec(numShips int) []ShipSpec {
	var shipsSpec []ShipSpec

	colorIdx := 0
	colorsLen := len(colors)
	nextColor := func() string {
		c := colors[colorIdx]
		colorIdx = (colorIdx + 1) % colorsLen
		return c
	}

	shipIdx := 0
	for _, ship := range shipCfg {
		count := numShips * ship.ratio / 10
		for i := 0; i < count; i++ {
			shipsSpec = append(shipsSpec, ShipSpec{
				ID:    "s" + strconv.Itoa(shipIdx+1),
				Size:  ship.size,
				Color: nextColor(),
			})
			shipIdx++
		}
	}

	pad := numShips - len(shipsSpec)
	for i := 0; i < pad; i++ {
		shipsSpec = append(shipsSpec, ShipSpec{
			ID:    "s" + strconv.Itoa(shipIdx+1),
			Size:  1,
			Color: nextColor(),
		})
		shipIdx++
	}

	return shipsSpec
}

func NewDefaultShips() []Ship {
	return []Ship{
		{
			ID:       "s1",
			Size:     4,
			Color:    "#4682B4",
			Position: newShipPoint(),
			Order:    1,
		},
		{
			ID:       "s2",
			Size:     3,
			Color:    "#B0E0E6",
			Position: newShipPoint(),
			Order:    2,
		},
		{
			ID:       "s3",
			Size:     3,
			Color:    "#20B2AA",
			Position: newShipPoint(),
			Order:    3,
		},
		{
			ID:       "s4",
			Size:     2,
			Color:    "#87CEFA",
			Position: newShipPoint(),
			Order:    4,
		},
		{
			ID:       "s5",
			Size:     2,
			Color:    "#1E90FF",
			Position: newShipPoint(),
			Order:    5,
		},
		{
			ID:       "s6",
			Size:     2,
			Color:    "#7B68EE",
			Position: newShipPoint(),
			Order:    6,
		},
		{
			ID:       "s7",
			Size:     1,
			Color:    "#00008B",
			Position: newShipPoint(),
			Order:    7,
		},
		{
			ID:       "s8",
			Size:     1,
			Color:    "#4169E1",
			Position: newShipPoint(),
			Order:    8,
		},
		{
			ID:       "s9",
			Size:     1,
			Color:    "#5F9EA0",
			Position: newShipPoint(),
			Order:    9,
		},
		{
			ID:       "s10",
			Size:     1,
			Color:    "#00CED1",
			Position: newShipPoint(),
			Order:    10,
		},
	}
}
