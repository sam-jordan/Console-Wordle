import * as readline from 'readline';
import * as fs from 'fs';
import process from 'node:process';

// Reads in an array of valid 5-letter words from file (originally sourced from https://www-cs-faculty.stanford.edu/~knuth/sgb-words.txt)
const validWords: string[] = fs.readFileSync('sgb-words.txt', 'utf-8').split("\r\n").map(word => word.toUpperCase());

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Letter will hold the character and its display colour (based on level of correctness)
interface Letter {
    character: string,
    colour: string
};

class Game {
    #solution: string[];
    guesses: Letter[][] = [];
    wrongLetters: Set<string> = new Set();
    unusedLetters: Set<string>;
    gameOver: boolean = false;

    /**
     * Class representing a single game of console-based Wordle.
     * 
     * @param #solution - A 5-letter word randomly chosen from the valid list 
     * @param guesses - An array of arrays of Letter objects
     * @param wrongLetters - A set of incorrectly guessed characters
     * @param unusedLetters - A set of characters that have yet to be guessed
     * @param gameOver - A boolean representing whether the game has ended or not
     */
    constructor() {
        this.#solution = validWords[Math.floor(Math.random() * validWords.length)].toUpperCase().split('');
        this.unusedLetters = new Set([...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']);
    }

    /**
     * Runs the main game loop: prompts the user for a guess, processes it, displays the result and calls itself again if the
     * game is not over.
     * 
     * @param guessNumber - The number of the current guess (Only called with 1 outside itself)
     */
    gameLoop(guessNumber: number): void {
        rl.question(`Guess ${guessNumber}: `, (answer) => {
            if (this.checkValidGuess(answer.toUpperCase())) {
                this.checkCorrectness(answer.toUpperCase());
                this.display();
                this.checkGameOver(guessNumber);
                if (!this.gameOver) {
                    this.gameLoop(guessNumber + 1);
                } else {
                    rl.close();
                }
            } else {
                console.log('Invalid guess!');
                this.gameLoop(guessNumber);
            }
        });
    }

    /**
     * Checks that a word is in the list of valid 5-letter words and has not already been guessed.
     * 
     * @param guess - The guesssed word that needs to be validated
     * @returns A boolean indicating the validity of the guess
     */
    checkValidGuess(guess: string): boolean {
        // Constructs an array of all previous guesses as strings for comparison
        const stringGuesses = this.guesses.map(guess => guess.map(guessLetter => guessLetter.character).join(''));
        if (validWords.indexOf(guess) !== -1 && stringGuesses.indexOf(guess) === -1) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Compares the guess with the solution to determine whether each letter is correct, present in the solution but positioned 
     * wrongly, or incorrect.
     * 
     * @param guess - The guessed word to be checked 
     */
    checkCorrectness(guess: string): void {
        // Creates a copy of the solution for comparison
        const comparison: string[] = [...this.#solution];
        const checkedGuess: Letter[] = new Array(5);
        // Checking for correct answers - needs to be done first
        for (let i = 0; i < guess.length; i++) {
            if (comparison[i] === guess[i]) {
                // Adds the correct character to the checkedGuess array with a green colour code
                checkedGuess.splice(i, 1, {character: guess[i], colour: '\x1b[32m'});
                // Marks its position in the copy of the solution with a 0
                comparison[i] = '0';
            }
        }  

        // Checking for present but mispositioned letters and incorrect letters
        for (let i = 0; i < guess.length; i++) {
            if (comparison[i] !== '0') {
                // If the letter isn't correct, but in the answer, add with a yellow colour code
                if (comparison.indexOf(guess[i]) !== -1) {
                    checkedGuess.splice(i, 1, {character: guess[i], colour: '\x1b[33m'});
                } else {
                    // If the letter is wrong, add with a default colour code and update the set of wrong letters
                    checkedGuess.splice(i, 1, {character: guess[i], colour: '\x1b[0m'});
                    this.wrongLetters.add(guess[i]);
                    comparison[comparison.indexOf(guess[i])] = '0';
                }
            }
            // Remove the letter from the set of unused letters irregardless of outcome
            this.unusedLetters.delete(guess[i]);
        }
        this.guesses.push(checkedGuess);
    }

    /**
     * Determines if the game has ended (answer correctly guessed or 6 incorrect guesses reached) and displays a message.
     * 
     * @param guessNumber - The number of the current guess 
     */
    checkGameOver(guessNumber: number): void {
        const latestGuess = this.guesses.at(-1);
        // Gets the colour of each character of the latest guess
        const latestGuessColours = latestGuess !== undefined ? latestGuess.map(guessLetter => guessLetter.colour) : [];
        // If every character is green (correct), user wins
        if (guessNumber > 1 && latestGuessColours.every(val => val === '\x1b[32m')) {
            this.gameOver = true;
            console.log(this.getEndMessage(0, guessNumber));
        }
        // If the user has had 6 guesses (and didn't guess a correct answer on the 6th), they lose
        if (guessNumber >= 6 && !latestGuessColours.every(val => val === '\x1b[32m')) {
            this.gameOver = true;
            console.log(this.getEndMessage(1, guessNumber));
        }
    }

    /**
     * Displays the current game state: words guessed so far, incorrect letters and letters yet to be tried.
     */
    display(): void {
        console.log('----------------------------');
        for (const i of this.guesses) {
            // Creates a string of the colour code for each letter
            const colourString: string = i.map(guess => guess.colour + '%s').join('') + '\x1b[0m';
            const letters: string[] = i.map(guess => guess.character);
            // Displays the colour string and the array
            console.log(colourString, ...letters);
        }
        console.log('----------------------------');
        console.log('Wrong: ' + Array.from(this.wrongLetters).join(', '));
        console.log('Unused: ' + Array.from(this.unusedLetters).join(', '));
        console.log('----------------------------');
    }

    /**
     * @param status - Status code determining which message to return
     * @param guessNumber - The number of the current guess
     * @returns - A message revealing the solution and the outcome of the game
     */
    getEndMessage(status: 0 | 1, guessNumber: number): string {
        switch(status) {
            case 0:
                return `The word was ${this.#solution.join('')}! You got it in ${guessNumber} guesses.`;
            case 1: 
                return `So close! The word was ${this.#solution.join('')}.`;
        }
    }
}

const newGame: Game = new Game();
newGame.gameLoop(1);