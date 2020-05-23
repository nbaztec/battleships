# Battleships
Go implementation for the classic [battleship](https://en.wikipedia.org/wiki/Battleship_(game))  game. 

The frontend uses [jQuery](https://jquery.com/) and [Bootstrap](https://getbootstrap.com/).

## Run 
```sh
$ make run
```

## Gameplay
Game can be played between 2 players. Visit the root url `http://localhost:8080` to start a game.
The  optional `gid` query parameter may be provided to specify the game room. If the `gid` parameter is omitted, a random `gid` will be generated.

The second player should visit the same game URL as specified in the UI (with the same `gid`). Once both players are on the same URL, the game begins.
Players then set their respective battleships and press `Ready`. The ship orientation can be controlled via the provided button or the `Shift` Key. 
The ship placement may be reset via the `Reset` button or by pressing the `Esc` key.

Once both players are ready, they take turns guessing the opponent's ship locations.

The game is over when either of the condition holds:
   * Player sinks all of their opponent's ships
   * Player chooses to `Resign`
   
Once the game is finished, the players have an option to request `Rematch`


## Resources
All packaged resources (sounds and icons) are available under their respective [CC License](https://creativecommons.org/licenses/by/3.0/).