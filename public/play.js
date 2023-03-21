const btnDescriptions = [
    { file: 'sound1.mp3', hue: 120 },
    { file: 'sound2.mp3', hue: 0 },
    { file: 'sound3.mp3', hue: 60 },
    { file: 'sound4.mp3', hue: 240 },
];

class Button {
    constructor(description, el) {
        this.hue = description.hue;
        this.el = el;
        this.sound = loadSound(description.file);
        this.paint(25)
    }

    paint(level) {
        this.el.style.backgroundColor = `hsl(${this.hue}, 100%, ${level}%)`;
    }

    async press(volume) {
        this.paint(50);
        await this.play(volume);
        this.paint(25);
    }

    async play(volume = 1.0) {
        this.sound.volume = volume;
        await new Promise((resolve) => {
            this.sound.onended = resolve;
            this.sound.play();
        })
    }
}

class Game {
    buttons
    allowPlayer
    sequence
    playerPlaybackPos
    mistakeSound

    constructor() {
        this.buttons = new Map();
        this.allowPlayer = false;
        this.sequence = [];
        this.playerPlaybackPos = 0;
        this.mistakeSound = loadSound('error.mp3');

        document.querySelectorAll('.game-button').forEach((el, i) => {
            if (i < btnDescriptions.length) {
                this.buttons.set(el.id, new Button(btnDescriptions[i], el));
            }
        });

        const playerNameEl = document.querySelector('.player-name');
        playerNameEl.innerText = localStorage.getItem('userName');
    }

    async pressButton(button) {
        if (this.allowPlayer) {
            this.allowPlayer = false;
            await this.buttons.get(button.id).press(1.0);

            if (this.sequence[this.playerPlaybackPos].el.id === button.id) {
                this.playerPlaybackPos++;
                if (this.playerPlaybackPos === this.sequence.length) {
                    this.playerPlaybackPos = 0;
                    this.addButton();
                    this.updateScore(this.sequence.length - 1);
                    await this.playSequence();
                }
                this.allowPlayer = true;
            }
            else {
                this.saveScore(this.sequence.length - 1);
                this.mistakeSound.play();
                await this.buttonDance(2);
            }
        }
    }

    async reset() {
        this.allowPlayer = false;
        this.playerPlaybackPos = 0;
        this.sequence = [];
        this.updateScore('--');
        await this.buttonDance(1);
        this.addButton();
        await this.playSequence();
        this.allowPlayer = true;
    }

    getPlayerName() {
        return localStorage.getItem('userName') ?? 'Mystery Player';
    }

    async playSequence() {
        await delay(500);
        for (const button of this.sequence) {
            await button.press(1.0);
            await delay(100);
        }
    }

    addButton() {
        const button = this.getRandomButton();
        this.sequence.push(button);
    }

    updateScore(score) {
        const scoreEl = document.querySelector('.score');
        scoreEl.innerText = score;
    }

    async buttonDance(laps = 1) {
        for (let step = 0; step < laps; step++) {
            for (const button of this.buttons.values()) {
                await button.press(0.0);
            }
        }
    }

    getRandomButton() {
        const buttons = Array.from(this.buttons.values());
        return buttons[Math.floor(Math.random() * buttons.length)];
    }

    async saveScore(score) {
        const userName = this.getPlayerName();
        const date = new Date().toLocaleDateString();
        const newScore = { name: userName, score: score, date: date };
    
        try {
          const response = await fetch('/api/score', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(newScore),
          });
    
          // Store what the service gave us as the high scores
          const scores = await response.json();
          localStorage.setItem('scores', JSON.stringify(scores));
        } catch {
          // If there was an error then just track scores locally
          this.updateScoresLocal(newScore);
        }
      }
    
      updateScoresLocal(newScore) {
        let scores = [];
        const scoresText = localStorage.getItem('scores');
        if (scoresText) {
          scores = JSON.parse(scoresText);
        }
    
        let found = false;
        for (const [i, prevScore] of scores.entries()) {
          if (newScore > prevScore.score) {
            scores.splice(i, 0, newScore);
            found = true;
            break;
          }
        }
    
        if (!found) {
          scores.push(newScore);
        }
    
        if (scores.length > 10) {
          scores.length = 10;
        }
    
        localStorage.setItem('scores', JSON.stringify(scores));
    }
}

const game = new Game();

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function loadSound(filename) {
    return new Audio(`assets/${filename}`)
}


