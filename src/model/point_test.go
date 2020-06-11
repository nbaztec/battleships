package model

import "testing"

func TestPoint_Valid(t *testing.T) {
	testCases := []struct {
		name  string
		input Point
		want  bool
	}{
		{
			name:  "positive point",
			input: Point{Col: 1, Row: 1},
			want:  true,
		},
		{
			name:  "zero point",
			input: Point{},
			want:  true,
		},
		{
			name:  "negative point - both",
			input: Point{Col: -1, Row: -1},
			want:  false,
		},
		{
			name:  "negative point - row",
			input: Point{Col: 1, Row: -1},
			want:  false,
		},
		{
			name:  "negative point - col",
			input: Point{Col: -1, Row: 1},
			want:  false,
		},
	}

	for _, tt := range testCases {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.input.Valid()
			if got != tt.want {
				t.Errorf("got %v, want %v", got, tt.want)
			}
		})
	}
}

func TestPoint_ID(t *testing.T) {
	got := Point{Col: 1, Row: 2}.ID()
	want := "2,1"
	if got != want {
		t.Errorf("got %v, want %v", got, want)
	}
}
