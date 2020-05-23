let VerticalMode = false;
      
// const ships = [40, 30, 31, 20, 21, 22, 10, 11, 12, 13];
// const ships = [
//   {
//     n: 40,
//     c: '#4682B4',
//   },
//   {
//     n: 30,
//     c: '#B0C4DE',
//   },
//   {
//     n: 31,
//     c: '#B0E0E6',
//   },
//   {
//     n: 20,
//     c: '#87CEFA',
//   },
//   {
//     n: 21,
//     c: '#1E90FF',
//   },
//   {
//     n: 22,
//     c: '#7B68EE',
//   },
//   {
//     n: 10,
//     c: '#00008B',
//   },
//   {
//     n: 11,
//     c: '#4169E1',
//   },
//   {
//     n: 12,
//     c: '#5F9EA0',
//   },
//   {
//     n: 13,
//     c: '#00CED1',
//   },
// ];

class Ship {
  constructor(id, size, color, hits, position) {
    this.id = id;
    this.position = position;
    this.size = size;
    this.hits = hits || 0;
    this.color = color;
  }

  placed() {
    return this.x !== -1 && this.y !== -1;
  }
}

const AllShips = [
  new Ship('s1', 4, '#4682B4', 4, {row: 1, col: 0}),
  new Ship('s2', 3, '#B0C4DE', 3, {row: 2, col: 3}),
  new Ship('s3', 3, '#B0E0E6', 3, {row: 4, col: 0}),
  new Ship('s4', 2, '#87CEFA', 2, {row: 5, col: 0}),
  new Ship('s5', 2, '#1E90FF', 2, {row: 6, col: 0}),
  new Ship('s6', 2, '#7B68EE', 2, {row: 7, col: 0}),
  new Ship('s7', 1, '#00008B', 1, {row: 8, col: 0}),
  new Ship('s8', 1, '#4169E1', 1, {row: 9, col: 0}),
  new Ship('s9', 1, '#5F9EA0', 1, {row: 0, col: 9, vertical: true}),
  new Ship('s10', 1, '#00CED1', 1, {row: 0, col: 7, vertical: true}),
];

// const shipColors = ships.reduce((acc, x) => {
//   acc[x.n] = x.c; 
//   return acc;
// }, {});