class GridPlay extends GridBase {
  set(ships, turns) {
    this._ships = ships;
    this._turns = turns;
  }

  check(turns, fn) {
    this.enableMove((row, col) => {
      if (!this._testPoint(row, col)) {
        return;
      }

      this.drawPlayField();
      const ctx = this._g.getContext('2d');
      ctx.fillStyle = '#F0E68C';
      ctx.fillRect(2 + (col*this._N), 2 + (row*this._N), this._N, this._N);

      ctx.lineWidth = 2;
      ctx.strokeStyle = 'black';
      ctx.strokeRect(1 + (col*this._N), 1 + (row*this._N), this._N, this._N);
    });

    this.enableClick((row, col) => {
      if (turns[`${row},${col}`] !== undefined) {
        return;
      }

      this.disableMove();
      this.disableClick();

      fn(row, col);
    });
  }

  drawPlayField() {
    const N = this._N;
    const ctx = this._g.getContext('2d');
    ctx.clearRect(0, 0, this._size*this._N, this._size*this._N);

    for(let i=0;i<this._size;i++) {
      for(let j=0;j<this._size;j++) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'gray';
        ctx.strokeRect(1 + (j*N), 1 + (i*N), N, N);
      }
    }

    // draw misses
    Object.entries(this._turns).filter(([_, found]) => !found).forEach(([point, found]) => {
      const [row, col] = point.split(',');
      ctx.fillStyle = this._color.miss;
      ctx.fillRect(1 + (col*N), 1 + (row*N), N, N);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'gray';
      ctx.strokeRect(1 + (col*N), 1 + (row*N), N, N);
    });

    // draw hits
    Object.entries(this._turns).filter(([_, found]) => found).forEach(([point, found]) => {
      const [row, col] = point.split(',');
      ctx.fillStyle = this._color.hit;
      ctx.fillRect(2 + (col*N), 2 + (row*N), N, N);

      ctx.lineWidth = 2;
      ctx.strokeStyle = this._color.hitStroke;
      ctx.strokeRect(1 + (col*N), 1 + (row*N), N, N);
    });
      
    // draw ships
    const offset = (20+this._size*this._N);
    ctx.clearRect(offset-5, 0, this._size*this._N, this._size*this._N);

    this.shipsSorted.forEach((ship, y) => {
      const sunk = (ship.hits === ship.size);

      // draw overview      
      ctx.fillStyle = ship.color
      for(let i=0; i<ship.size; i++) {
        ctx.fillRect(offset + i*30, 10 + y*35, 30, 30)
      }
      
      if (sunk) {
        // ctx.fillStyle = this._color.hitOverlay;
        ctx.fillRect(offset, 10 + y*35, 30*ship.size, 30)
        this._crossRaw(ctx, offset, 10+y*35, 30*ship.size, 30);
      }
      
      ctx.lineWidth = sunk ? 2 : 1;
      ctx.strokeStyle = sunk ? this._color.hitStroke : 'black';
      ctx.strokeRect(offset, 10 + y*35, 30*ship.size, 30)

      // draw sunken ship
      if (sunk) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = this._color.hitStroke;
        ctx.fillStyle = ship.color;// + 'DD';
        if (ship.position.vertical) {
          ctx.fillRect(1 + (ship.position.col*this._N), 1 + ship.position.row*this._N, this._N, this._N*ship.size);
          this._cross(ctx, ship.position, ship.size, this._N);

          ctx.strokeStyle = this._color.hitStroke;
          ctx.strokeRect(1 + (ship.position.col*this._N), 1 + ship.position.row*this._N, this._N, this._N*ship.size);
        } else {
          ctx.fillRect(1 + (ship.position.col*this._N), 1 + (ship.position.row*this._N), this._N*ship.size, this._N);
          this._cross(ctx, ship.position, ship.size, this._N);
          
          ctx.strokeStyle = this._color.hitStroke;
          ctx.strokeRect(1 + (ship.position.col*this._N), 1 + (ship.position.row*this._N), this._N*ship.size, this._N);
        }
      }
    });
  }
};