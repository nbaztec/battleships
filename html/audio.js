Audio.prototype.stopAndPlay = function() {
    this.pause();
    this.currentTime = 0;
    this.play();
};

const audioStart = new Audio('./sound/start.wav');
const audioMiss = new Audio('./sound/miss.wav');
const audioHit = new Audio('./sound/hit.wav');
const audioSink = new Audio('./sound/sink.mp3');