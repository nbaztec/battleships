package model

import (
	"reflect"
	"testing"
)

func TestNewDefaultShips(t *testing.T) {
	want := []Ship{
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

	if got := NewDefaultShips(); !reflect.DeepEqual(got, want) {
		t.Errorf("NewDefaultShips() = %v, want %v", got, want)
	}
}
