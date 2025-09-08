import { describe, it, expect, vi } from "vitest";
import Game from "./index.js";

describe('checkValidWord function', () => {
    const testGame = new Game();
    testGame.guesses.push([
        {character: 'S', accuracy: 'correct'}, 
        {character: 'M', accuracy: 'correct'}, 
        {character: 'A', accuracy: 'correct'},
        {character: 'R', accuracy: 'correct'},
        {character: 'T', accuracy: 'correct'}
    ]);

    // Checks that valid words are accepted
    it('should return a parsed string when "reach" submitted', () => {
        expect(testGame.checkValidWord('reach')).toBe('REACH');
    });

    // Checks that letter cases are ignored
    it('should return a parsed string when "TOucH" submitted', () => {
        expect(testGame.checkValidWord('TOucH')).toBe('TOUCH');
    });

    // Checks that guesses containing non-letters are rejected
    it('should throw an error when "12345" submitted', () => {
        expect(() => testGame.checkValidWord('12345')).toThrow();
    });

    // Checks that guesses that are not real words are rejected
    it('should throw an error when "aaaaa" submitted', () => {
        expect(() => testGame.checkValidWord('aaaaa')).toThrow();
    });

    // Checks that guesses longer than 5 letters are rejected
    it('should throw an error when "nights" submitted', () => {
        expect(() => testGame.checkValidWord('nights')).toThrow();
    });

    // Checks that guesses shorter than 5 letters are rejected
    it('should throw an error when "ape" submitted', () => {
        expect(() => testGame.checkValidWord('ape')).toThrow();
    });

    // Checks that repeat guesses are rejected
    it('should throw an error when "smart" submitted', () => {
        expect(() => testGame.checkValidWord('smart')).toThrow();
    });
});

describe('checkCorrectness function', () => {
    const testGame = new Game('reach');

    // Assumes a guess has already been validated
    it('should return a checkedGuess with all correct letters when "REACH" checked', () => {
        expect(testGame.checkCorrectness('REACH').map(letter => letter.accuracy).every(val => val === 'correct')).toBe(true);
    });

    // Just for test purposes since it is only ever called with valid words
    it('should return a checkedGuess with all wrongPosition letters when "ARCHE" checked', () => {
        expect(testGame.checkCorrectness('ARCHE').map(letter => letter.accuracy).every(val => val === 'wrongPosition')).toBe(true);
    });

    it('should return a checkedGuess with all incorrect letters when "SNOUT" checked', () => {
        expect(testGame.checkCorrectness('SNOUT').map(letter => letter.accuracy).every(val => val === 'incorrect')).toBe(true);
    });
});


describe('checkGameOver function', () => {
    const testGame = new Game();

    it('should return 0 when guess number is 1', () => {
        expect(testGame.checkGameOver(1)).toBe(0);
    });

    describe('checkGameOver game lost', () => {
        const lostGame = new Game();
        lostGame.guesses.push([
            {character: 'S', accuracy: 'incorrect'}, 
            {character: 'M', accuracy: 'incorrect'}, 
            {character: 'A', accuracy: 'incorrect'},
            {character: 'R', accuracy: 'incorrect'},
            {character: 'T', accuracy: 'incorrect'}
        ]);

        it('should return 2 when guess number is 6 and the latest guess is incorrect', () => {
            expect(lostGame.checkGameOver(6)).toBe(2);
        });
    });

    describe('checkGameOver game won', () => {
        const wonGame = new Game();
        wonGame.guesses.push([
            {character: 'S', accuracy: 'correct'}, 
            {character: 'M', accuracy: 'correct'}, 
            {character: 'A', accuracy: 'correct'},
            {character: 'R', accuracy: 'correct'},
            {character: 'T', accuracy: 'correct'}
        ]);

        it('should return 1 when guess number is 2 and the latest guess is correct', () => {
            expect(wonGame.checkGameOver(2)).toBe(1);
        });

        it('should return 1 when guess number is 6 and the latest guess is correct', () => {
            expect(wonGame.checkGameOver(6)).toBe(1);
        });
    });
});

describe('getEndMessage function', () => {
    const testGame = new Game('reach');
    
    it('should return a win message when called with status code 1', () => {
        expect(testGame.getEndMessage(1, 3)).toBe(`The word was REACH! You got it in 3 guesses.`);
    });

    it('should return a lose message when called with status code 2', () => {
        expect(testGame.getEndMessage(2, 3)).toBe(`So close! The word was REACH.`);
    });
});