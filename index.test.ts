import { describe, it, expect } from "vitest";
import Game from "./index.js";

const testGame = new Game();
describe('check validity function', () => {
    it('should return a parsed string when "reach" submitted', () => {
        expect(testGame.checkValidGuess('reach')).toBe('REACH');
    });

    it('should return a parsed string when "TOucH" submitted', () => {
        expect(testGame.checkValidGuess('TOucH')).toBe('TOUCH');
    });

    it.skip('should throw an error when "12345" submitted', () => {
        expect(testGame.checkValidGuess('12345')).toBe(Error);
    })
});