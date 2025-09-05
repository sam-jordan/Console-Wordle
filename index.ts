import * as readline from 'readline';
import * as fs from 'fs';
import process from 'node:process';
import * as z from 'zod';
import { EOL } from 'node:os';

// Reads in an array of valid 5-letter words from file (originally sourced from https://www-cs-faculty.stanford.edu/~knuth/sgb-words.txt)
const validWords: string[] = fs.readFileSync('./sgb-words.txt', 'utf-8').split(EOL).map(word => word.toUpperCase());

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Letter will hold the character and its display colour (based on level of correctness)
interface Letter {
    character: string,
    colour: string
};

// Defining the Zod schema for user input (5 character string transformed to upper case)
const ZodValidWord = z.string().length(5).toUpperCase();

export default class Game {
    #solution: string[];
    guesses: Letter[][] = [];
    wrongLetters: Set<string> = new Set();
    unusedLetters: Set<string>;
    gameStatus: number = 0;

    /**
     * Class representing a single game of console-based Wordle.
     * 
     * @param #solution - A 5-letter word randomly chosen from the valid list 
     * @param guesses - An array of arrays of Letter objects
     * @param wrongLetters - A set of incorrectly guessed characters
     * @param unusedLetters - A set of characters that have yet to be guessed
     * @param gameStatus - A number representing the game state: 0 for playing, 1 for won, 2 for lost
     */
    constructor(solution?: string) {
        if(solution) {
            try {
                this.#solution = this.checkValidWord(solution).split('');
            } catch (error) {
                console.error(error)
            }
        } else {
            this.#solution = validWords[Math.floor(Math.random() * validWords.length)].split('');
        }
        this.unusedLetters = new Set([...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']);
    }

    /**
     * Runs the main game loop: prompts the user for a guess, processes it, displays the result and calls itself again if the
     * game is not over.
     * 
     * @param guessNumber - The number of the current guess (Only called with 1 outside itself)
     */
    gameLoop(guessNumber: number): void {
        rl.question(`Guess ${guessNumber}: `, (guess) => {
            try {
                this.checkCorrectness(this.checkValidWord(guess));
                this.display();
                this.gameStatus = this.checkGameOver(guessNumber);
                // If the game is still running
                if (this.gameStatus === 0) {
                    this.gameLoop(guessNumber + 1);
                // If the game has ended
                } else {
                    console.log(this.getEndMessage(this.gameStatus, guessNumber))
                    rl.close();
                }
            } catch {
                console.error('\x1b[31m%s\x1b[0m', 'Invalid guess!');
                this.gameLoop(guessNumber);
            }
        });
    }

    /**
     * Checks that a word is a valid 5 letter word that has not already been guessed.
     * 
     * @param guess - The guesssed word that needs to be validated
     * @returns A validated deep copy of the original guess (transformed to upper case)
     */
    checkValidWord(guess: string): string {
        // Constructs an array of all previous guesses as strings for comparison
        const parsedGuess = ZodValidWord.safeParse(guess);
        const stringGuesses = this.guesses.map(guess => guess.map(guessLetter => guessLetter.character).join(''));
        if (parsedGuess.success && validWords.indexOf(parsedGuess.data) !== -1 && stringGuesses.indexOf(parsedGuess.data) === -1) {
            return parsedGuess.data;
        } else {
            // Won't actually be displayed, thrown to trigger the catch block
            throw new Error('Invalid guess!');
        }
    }

    /**
     * Compares the guess with the solution to determine whether each letter is correct, present in the solution but positioned 
     * wrongly, or incorrect.
     * 
     * @param guess - The guessed word to be checked 
     * @return An array of Letter objects representing the guessed word's characters and their correctness
     */
    checkCorrectness(guess: string): Letter[] {
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
        return checkedGuess;
    }

    /**
     * Determines if the game has ended (answer correctly guessed or 6 incorrect guesses reached) and displays a message.
     * 
     * @param guessNumber - The number of the current guess 
     * @return A status code representing the current game state
     */
    checkGameOver(guessNumber: number): number {
        const latestGuess = this.guesses.at(-1);
        // Gets the colour of each character of the latest guess
        const latestGuessColours = latestGuess !== undefined ? latestGuess.map(guessLetter => guessLetter.colour) : [];
        // If every character is green (correct), user wins
        if (guessNumber > 1 && latestGuessColours.every(val => val === '\x1b[32m')) {
            return 1
        }
        // If the user has had 6 guesses (and didn't guess a correct answer on the 6th), they lose
        if (guessNumber >= 6 && !latestGuessColours.every(val => val === '\x1b[32m')) {
            return 2
        }
        return 0;
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
     * @returns - A message revealing the solution and the outcome of the game, or an error message
     */
    getEndMessage(status: number, guessNumber: number): string {
        switch(status) {
            case 1:
                return `The word was ${this.#solution.join('')}! You got it in ${guessNumber} guesses.`;
            case 2: 
                return `So close! The word was ${this.#solution.join('')}.`;
            default:
                return 'Invalid status code.'
        }
    }
}

const newGame: Game = new Game();
newGame.gameLoop(1);