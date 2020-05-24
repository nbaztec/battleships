package model

type ShipPoint struct {
	Point
	Vertical bool `json:"vertical"`
}

func newShipPoint() *ShipPoint {
	return &ShipPoint{
		Point: Point{
			Row: -1,
			Col: -1,
		},
	}
}

type Ship struct {
	ID       string     `json:"id"`
	Size     int        `json:"size"`
	Position *ShipPoint `json:"position"`
	Hits     int        `json:"hits"`
	Color    string     `json:"color"`
	Order    int        `json:"order"`
}

func (s Ship) HasSunk() bool {
	return s.Hits == s.Size
}

func NewShip(spec ShipSpec) Ship {
	return Ship{
		ID:       spec.ID,
		Size:     spec.Size,
		Position: newShipPoint(),
		Color:    spec.Color,
	}
}
