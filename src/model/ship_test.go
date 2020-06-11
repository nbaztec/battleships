package model

import (
	"reflect"
	"testing"
)

func TestShip_HasSunk(t *testing.T) {
	testCases := []struct {
		name  string
		input Ship
		want  bool
	}{
		{
			name:  "sunk ship",
			input: Ship{Hits: 2, Size: 2},
			want:  true,
		},
		{
			name:  "unsunk ship",
			input: Ship{Hits: 1, Size: 2},
			want:  false,
		},
	}

	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.input.HasSunk()
			if got != tt.want {
				t.Errorf("got %v, want %v", got, tt.want)
			}
		})
	}
}

func TestNewShip(t *testing.T) {
	input := ShipSpec{
		ID:    "id",
		Color: "000",
		Size:  1,
	}

	want := Ship{
		ID:    "id",
		Color: "000",
		Size:  1,
		Position: &ShipPoint{
			Point:    Point{Col: -1, Row: -1},
			Vertical: false,
		},
	}

	if got := NewShip(input); !reflect.DeepEqual(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}

func Test_newShipPoint(t *testing.T) {
	want := &ShipPoint{
		Point:    Point{Col: -1, Row: -1},
		Vertical: false,
	}

	if got := newShipPoint(); !reflect.DeepEqual(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}
