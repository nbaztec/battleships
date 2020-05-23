class GridPlan extends GridBase {
  reset() {
    this._placeExit = true;
    this.disableMove();
    this.disableClick();
    this.disableEscape();

    this.shipsSorted.forEach((ship) => {
      ship.position.row = -1;
      ship.position.col = -1;
    })

    this.drawPlanField();
  }

  set(ships, turns) {
    this._ships = ships;
    this._turns = turns;
  }

  place(done) {
    this._placeExit = false;
    this._d = Array(this._size).fill().map(x => Array(this._size).fill(''));

    const ships = this.shipsSorted;
    let idx = 0;
    const iter = (d) => {
      const ship = ships[idx];
      if (this._placeExit) {
        d(false);
        return;
      }
      this.put(ship, (success) => {
        if (!success) {
          d(false);
          return;
        }

        idx++;
        if (idx !== ships.length) {
          iter(d);
        } else {
          d(true);
        }
      });
    }
    
    iter(done);
  }

  put(ship, fn) {
    this.enableEscape(() => {
      this.reset();
      fn(false);
    })

    this.enableMove((row, col) => {
      // console.log(row, col);
      const otherDim = VerticalMode ? row : col;

      if (!this._testBound(otherDim, this._size, ship.size)) {
        return;
      }

      this.drawPlanField(ship);
      
      if (!this._testValid(this._d, col, row, ship.size, VerticalMode)) {
        return
      }

      const ctx = this._g.getContext('2d');
      for(let a = 0; a < ship.size; a++) {
        ctx.fillStyle = ship.color;
        if (VerticalMode) {
          ctx.fillRect(2 + (col*this._N), 2 + ((row+a)*this._N), this._N, this._N);
          
        } else {
          ctx.fillRect(2 + ((col+a)*this._N), 2 + (row*this._N), this._N, this._N);
        }
      }

      ctx.lineWidth = 2;
      ctx.strokeStyle = 'black';
      if (VerticalMode) {
        ctx.strokeRect(1 + (col*this._N), 1 + row*this._N, this._N, this._N*ship.size);
      } else {
        ctx.strokeRect(1 + (col*this._N), 1 + (row*this._N), this._N*ship.size, this._N);
      }
    });

    this.enableClick((row, col) => {
      // console.log(x, y);
      const otherDim = VerticalMode ?  row: col;

      if (!this._testBound(otherDim, this._size, ship.size)) {
        return;
      }

      if (!this._testValid(this._d, col, row, ship.size, VerticalMode)) {
        return
      }

      for(let a = 0; a < ship.size; a++) {
        if (VerticalMode) {
          this._d[row+a][col] = ship.id;
        } else {
          this._d[row][col+a] = ship.id;
        }
      }

      ship.position.row = row;
      ship.position.col = col;
      ship.position.vertical = VerticalMode;

      this.drawPlanField();

      this.disableMove();
      this.disableClick();
      this.disableEscape();

      fn(true);
    });
  }

  drawPlanField(highlightShip) {
    const N = this._N;
    const NFill = this._N - 1;
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

    // draw ships
    const offset = (20+this._size*this._N);
    ctx.clearRect(offset-5, 0, this._size*this._N, this._size*this._N);
    this.shipsSorted.forEach((ship, y) => {
      // draw overview      
      ctx.fillStyle = ship.color
      for(let i=0; i<ship.size; i++) {
        ctx.fillRect(offset + i*30, 10 + y*35, 30, 30)
      }

      if (highlightShip && highlightShip.id === ship.id) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        ctx.strokeRect(offset, 10 + y*35, 30*ship.size, 30)
      }
      
      const sunk = (ship.hits === ship.size);
      if (sunk) {
        this._crossRaw(ctx, offset, 10+y*35, 30*ship.size, 30);
      }

      ctx.lineWidth = sunk ? 2 : 1;
      ctx.strokeStyle = sunk ? this._color.hitStroke : 'black';
      ctx.strokeRect(offset, 10 + y*35, 30*ship.size, 30)

      // draw on grid
      const {row, col} = ship.position;
      if (row === -1 && col === -1) {
        return;
      }
      
      const posX = ship.position.col;
      const posY = ship.position.row;

      ctx.fillStyle = ship.color;
      if (ship.position.vertical) {
        ctx.fillRect(2 + (posX*N), 2 + (posY*N), N, N*ship.size);
      } else {
        ctx.fillRect(2 + (posX*N), 2 + (posY*N), N*ship.size, N);
      }
      
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'black';
      if (ship.position.vertical) {
        ctx.strokeRect(1 + (posX*this._N), 1 + posY*this._N, this._N, this._N*ship.size);
      } else {
        ctx.strokeRect(1 + (posX*this._N), 1 + (posY*this._N), this._N*ship.size, this._N);
      }
    });

    // draw hits
    Object.entries(this._turns).filter(([_, found]) => found).forEach(([point, found]) => {
      const [row, col] = point.split(',');
      ctx.lineWidth = 2;
      ctx.strokeStyle = this._color.hitStroke;
      ctx.strokeRect(1 + (col*N), 1 + (row*N), N, N);
      this._halfCross(ctx, {row: parseInt(row, 10), col: parseInt(col, 10), vertical: false}, 1, N);
    });

    // draw sunken ships
    this.shipsSorted.filter(s => s.size === s.hits).forEach((ship, y) => {
      ctx.lineWidth = 2;
        ctx.strokeStyle = this._color.hitStroke;
        ctx.fillStyle = ship.color;
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
    });
  }
};
