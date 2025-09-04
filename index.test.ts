import { describe, it, expect } from "vitest";
import Game from "./index.js";

const testGame = new Game();
describe('check validity function', () => {
    it('should return a parsed string when "reach" submitted', () => {
        expect(testGame.checkValidGuess('reach')).toBe('REACH');
    });
});