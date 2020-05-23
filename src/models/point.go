package models

import "fmt"

type Point struct {
	Row int `json:"row"`
	Col int `json:"col"`
}

func (p Point) Valid() bool {
	return p.Row != -1 && p.Col != -1
}

func (p Point) ID() string {
	return fmt.Sprintf("%d,%d", p.Row, p.Col)
}
