package model

import (
	"testing"
)

func Test_newAction(t *testing.T) {
	input := Point{Col: 1, Row: 1}
	action := newAction(input)

	if action.Position != input {
		t.Errorf("got %v, want %v", action.Position, input)
	}

	if action.ID == "" {
		t.Error("got empty id, want uuid")
	}
}
