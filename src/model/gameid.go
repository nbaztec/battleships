package model

var charset = "abcdefghijklmnopqrstuvwxyz"

func stringWithCharset(length int) string {
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[random.Intn(len(charset))]
	}
	return string(b)
}

func NewGameID() string {
	return stringWithCharset(5)
}
