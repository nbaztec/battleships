Audio.prototype.stopAndPlay = function() {
    console.log(this.src, 'begin')
    this.pause()
    this.currentTime = 0;
    return this.play().then(() => console.log(this.src, 'end'));
};

const audioStart = new Audio('./sound/start.wav');
const audioMiss = new Audio('./sound/miss.wav');
const audioHit = new Audio('./sound/hit.wav');
const audioSink = new Audio('./sound/sink.mp3');
const audioWin = new Audio('./sound/win.mp3');
const audioLoss = new Audio('./sound/loss.mp3');