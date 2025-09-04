import { describe, it, expect, vi } from "vitest";
import Game from "./index.js";

const testGame = new Game();

describe('checkValidGuess function', () => {
    it('should return a parsed string when "reach" submitted', () => {
        expect(testGame.checkValidGuess('reach')).toBe('REACH');
    });

    it('should return a parsed string when "TOucH" submitted', () => {
        expect(testGame.checkValidGuess('TOucH')).toBe('TOUCH');
    });

    it('should throw an error when "12345" submitted', () => {
        expect(() => testGame.checkValidGuess('12345')).toThrow();
    })

    it('should throw an error when "aaaaa" submitted', () => {
        expect(() => testGame.checkValidGuess('aaaaa')).toThrow();
    })

    it('should throw an error when "nights" submitted', () => {
        expect(() => testGame.checkValidGuess('nights')).toThrow();
    })

    it('should throw an error when "ape" submitted', () => {
        expect(() => testGame.checkValidGuess('ape')).toThrow();
    })

    testGame.guesses.push([
        {character: 'S', colour: '\x1b[33m'}, 
        {character: 'M', colour: '\x1b[33m'}, 
        {character: 'A', colour: '\x1b[33m'},
        {character: 'R', colour: '\x1b[33m'},
        {character: 'T', colour: '\x1b[33m'}
    ]);
    it('should throw an error when "smart" submitted', () => {
        expect(() => testGame.checkValidGuess('smart')).toThrow();
    })
});

/**
describe('checkCorrectness function', () => {
    //it('should return ')
});

describe('checkGameOver function', () => {

});
*/

describe('getEndMessage function', () => {
    it('should return a win message when called with status code 1', () => {
        expect(testGame.getEndMessage(1, 3)).toBe(`The word was ${testGame.solution.join('')}! You got it in 3 guesses.`)
    })

    it('should return a lose message when called with status code 2', () => {
        expect(testGame.getEndMessage(2, 3)).toBe(`So close! The word was ${testGame.solution.join('')}.`)
    })

    it('should return invalid status code when called with 3', () => {
        expect(testGame.getEndMessage(3, 3)).toBe('Invalid status code.')
    })
});