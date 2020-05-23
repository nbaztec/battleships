package model

import "github.com/google/uuid"

type Action struct {
	ID        string `json:"id"`
	Position  Point  `json:"position"`
	HitShipID string `json:"hitShipId"`
	Sunk      bool   `json:"sunk"`
}

func newAction(location Point) *Action {
	return &Action{
		ID:       uuid.New().String(),
		Position: location,
	}
}
