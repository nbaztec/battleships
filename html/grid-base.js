class GridBase {
  constructor(id, ships, size, blockSize) {
    this._ships = ships;
    this._turns = {};
    this._size = size || 10;
    this._N = blockSize || 40;
    this._g = document.getElementById(id)
    this._d = Array(this._size).fill().map(x => Array(this._size).fill(''));
    this._color = {
      hit: '#FA8072',
      miss: '#DCDCDC',
      hitStroke: '#DC143C',
      hitOverlay: '#DC143C',
      partialHitOverlay: '#CD5C5C',
    };
  }

  get shipsSorted() {
    return Object.values(this._ships).sort((a, b) => {
      if (a.order == b.order) {
        return 0
      } 
      
      if (a.order > b.order) {
        return 1;
      }
      
      return -1
    })
  }

  _testBound(i, size, extra) {
    const n = extra || 0;
    return i >=0 && (i + n  <= size);
  }
  
  _testValid(data, x, y, size, shift) {
    for(let a = 0; a < size; a++) {
      if (shift) {
        if (data[y+a][x] !== '') {
          return false;
        }
      } else {
        if (data[y][x+a] !== '') {
          return false;
        }
      }
    }
  
    return true;
  }

  _testPoint(row, col) {
    return this._turns[`${row},${col}`] === undefined;
  }

  parseRowCol(e) {
    const rect = this._g.getBoundingClientRect();
    const i = event.clientY - rect.top
    const row = Math.floor((i-1)/this._N);
    const j = event.clientX - rect.left
    const col = Math.floor((j-1)/this._N);
    
    return [row, col];
  }

  enableClick(fn) {
    this.__clickListener = (e) => {
      const [row, col] = this.parseRowCol(e);
      if ((row < 0 || row >= this._size) || (col < 0 || col >= this._size)) {
        return;
      }

      fn(row, col);
    };

    this._g.addEventListener('click', this.__clickListener);
  }

  disableClick() {
    this._g.removeEventListener('click', this.__clickListener);
  }

  enableMove(fn) {
    this.__mousemoveListener = (e) => {
      const [row, col] = this.parseRowCol(e);
      if ((row < 0 || row >= this._size) || (col < 0 || col >= this._size)) {
        return;
      }

      fn(row, col);
    };

    this._g.addEventListener('mousemove', this.__mousemoveListener);
  }

  disableMove() {
    this._g.removeEventListener('mousemove', this.__mousemoveListener);
  }


  enableEscape(fn) {
    this.__escapeEventListener = (e) => {
      if (e.keyCode === 27) { // ESC key
          fn(false);
      }
    };
    document.addEventListener('keydown', this.__escapeEventListener);
  }

  disableEscape() {
    document.removeEventListener('keydown', this.__escapeEventListener);
  }

  _crossRaw(ctx, x, y, size, N) {
    ctx.beginPath();

    ctx.moveTo(1 + x, 1 + y);
    ctx.lineTo(x + size, y + N);

    ctx.moveTo(x+size, 1+y);
    ctx.lineTo(x, y+N);

    ctx.strokeStyle = this._color.hitOverlay;
    ctx.stroke();
  }

  _halfCross(ctx, position, size, N) {
    let {row, col, vertical} = position;
    ctx.beginPath();

    const sizeY = vertical ? size : 1;
    const sizeX = vertical ? 1 : size;

    let topLeft = {x: col*N, y: row*N};
    let bottomRight = {x: (col+sizeX)*N, y: (row+sizeY)*N};

    ctx.moveTo(1 + topLeft.x, 1 + topLeft.y);
    ctx.lineTo(bottomRight.x, bottomRight.y);

    ctx.strokeStyle = this._color.partialHitOverlay;
    ctx.stroke();
  }

  _cross(ctx, position, size, N) {
    let {row, col, vertical} = position;
    ctx.beginPath();

    const sizeY = vertical ? size : 1;
    const sizeX = vertical ? 1 : size;

    let topLeft = {x: col*N, y: row*N};
    let bottomRight = {x: (col+sizeX)*N, y: (row+sizeY)*N};

    let topRight = {x: (col+sizeX)*N, y: row*N};
    let bottomLeft = {x: col*N, y: (row+sizeY)*N};

    ctx.moveTo(1 + topLeft.x, 1 + topLeft.y);
    ctx.lineTo(bottomRight.x, bottomRight.y);

    ctx.moveTo(topRight.x, 1+topRight.y);
    ctx.lineTo(1 + bottomLeft.x, 1 + bottomLeft.y);

    ctx.strokeStyle = this._color.hitOverlay;
    ctx.stroke();
  }
}
