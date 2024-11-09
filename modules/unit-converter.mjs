/*
** EPITECH PROJECT, 2024
** unit-converter.mjs
** File description:
** Module for converting between raw and mega units
*/
import { Big } from 'big.js';

// Configure Big to never show exponential notation.
Big.NE = -31;
Big.PE = 39;

const UNIT_TICKER = {
	"XNO": {
		raw_in_mega: "1000000000000000000000000000000",
		mega_in_raw: ".000000000000000000000000000001"
	},
	"XRO": {
		raw_in_mega: "1000000000000000000000000000000",
		mega_in_raw: ".000000000000000000000000000001"
	},
	"ANA": {
		raw_in_mega: "10000000000000000000000000000",
		mega_in_raw: "0.0000000000000000000000000001"
	},
	"PAW": {
		raw_in_mega: "1000000000000000000000000000",
		mega_in_raw: ".000000000000000000000000001"	
	},
	"BAN": {
		raw_in_mega: "100000000000000000000000000000",
		mega_in_raw: "0.00000000000000000000000000001"	
	},
	"XDG": {
		raw_in_mega: "100000000000000000000000000",
		mega_in_raw: ".00000000000000000000000001"	
	},
	"UNDEFINED": {
		raw_in_mega: undefined,
		mega_in_raw: undefined
	}
}

export function Converter(chain) {
	this.chain = chain;

	if (!UNIT_TICKER.hasOwnProperty(this.chain)) {
		throw Error(this.chain + ' rawToMega unit convert is not implemented');
	}

	if (UNIT_TICKER[this.chain].mega_in_raw === undefined) {
		throw Error(this.chain + ' rawToMega unit convert is not implemented');
	}

	/** The amount of mega in one raw. */
	this.MEGA_IN_RAW = new Big(UNIT_TICKER[chain].mega_in_raw);

	/**
	 * Converts raw amount to mega amount.
	 *
	 * @param {number | string} raw The raw amount.
	 *
	 * @throws {Error} The raw amount must be defined.
	 * @throws {TypeError} The raw amount must be a string or a number.
	 * @throws {Error} The raw amount is invalid.
	 * @throws {Error} The raw amount must not be negative.
	 * @throws {Error} The raw amount is too small.
	 * @throws {Error} The raw amount is too large.
	 *
	 * @returns {string} The mega amount.
	 */
	this.rawToMega = function rawToMega(raw) {
		if (Number(raw) == 0) {
			return 0;
		}

		if (raw === undefined) {
			throw Error('The raw amount must be defined.');
		}

		if (typeof raw !== 'string' && typeof raw !== 'number') {
			throw TypeError('The raw amount must be a string or a number.');
		}

		let rawBig;

		try {
			rawBig = new Big(raw);
		} catch (error) {
			throw Error('The raw amount is invalid.');
		}

		if (rawBig.lt(0)) {
			throw Error('The raw amount must not be negative.');
		}

		if (rawBig.lt(RAW_MIN_AMOUNT)) {
			throw Error('The raw amount is too small.');
		}

		if (rawBig.gt(RAW_MAX_AMOUNT)) {
			throw Error('The raw amount is too large.');
		}

		return rawBig.times(this.MEGA_IN_RAW).toString();
	}

	/**
	 * Converts mega amount to raw amount.
	 *
	 * @param {number | string} mega The mega amount.
	 *
	 * @throws {Error} The mega amount must be defined.
	 * @throws {TypeError} The mega amount must be a string or a number.
	 * @throws {Error} The mega amount is invalid.
	 * @throws {Error} The mega amount must not be negative.
	 * @throws {Error} The mega amount is too small.
	 * @throws {Error} The mega amount is too large.
	 *
	 * @returns {string} The raw amount.
	 */
	this.megaToRaw = function megaToRaw(mega) {
		if (!UNIT_TICKER.hasOwnProperty(this.chain)) {
			throw Error(this.chain + ' megaToRaw unit convert is not implemented');
		}
		if (UNIT_TICKER[this.chain].raw_in_mega === undefined) {
			throw Error(this.chain + ' megaToRaw unit convert is not implemented');
		}

		/** The minimum mega amount. */
		const MEGA_MIN_AMOUNT = this.MEGA_IN_RAW;

		/** The maximum mega amount. */
		const MEGA_MAX_AMOUNT = new Big(RAW_MAX_AMOUNT).times(this.MEGA_IN_RAW);

		let RAW_IN_MEGA = new Big(UNIT_TICKER[this.chain].raw_in_mega);

		if (mega === undefined) {
			throw Error('The mega amount must be defined.');
		}

		if (typeof mega !== 'string' && typeof mega !== 'number') {
			throw TypeError('The mega amount must be a string or a number.');
		}

		let megaBig;

		try {
			megaBig = new Big(mega);
		} catch (error) {
			throw Error('The mega amount is invalid.');
		}

		if (megaBig.lt(0)) {
			throw Error('The mega amount must not be negative.');
		}

		if (megaBig.lt(MEGA_MIN_AMOUNT)) {
			throw Error('The mega amount is too small.');
		}

		if (megaBig.gt(MEGA_MAX_AMOUNT)) {
			throw Error('The mega amount is too large.');
		}

		return megaBig.times(RAW_IN_MEGA).toString();
	}
}

/** The minimum raw amount. */
const RAW_MIN_AMOUNT = new Big('1');

/** The maximum raw amount. */
const RAW_MAX_AMOUNT = new Big('340282366920938463463374607431768211455');
