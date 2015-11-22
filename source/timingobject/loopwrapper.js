/*
	Copyright 2015 Norut Northern Research Institute
	Author : Ingar Mæhlum Arntzen

  This file is part of the Timingsrc module.

  Timingsrc is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  Timingsrc is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public License
  along with Timingsrc.  If not, see <http://www.gnu.org/licenses/>.
*/

define(['./timingbase'], function (timingbase) {

	'use strict';

	var motionutils = timingbase.motionutils;
	var WrapperBase = timingbase.WrapperBase;	
	var inherit = timingbase.inherit;

	/* 
		Coordinate system based on counting segments
		skew + n*length + offset === x
		skew : coordinate system is shifted by skew, so that segment 0 starts at offset.
		n : segment counter
		length : segment length
		offset : offset of value x into the segment where it lies
		x: float point value
	*/
	var SegmentCoords = function (skew, length) {
		this.skew = skew;
		this.length = length;
	};

	/* 
		Static method
		ovverride modulo to behave better for negative numbers 
	*/
	SegmentCoords.mod = function (n, m) {
		return ((n % m) + m) % m;
	};
	
	// get point representation from float
	SegmentCoords.prototype.getPoint = function (x) {
		return {
			n : Math.floor((x-this.skew)/this.length),
			offset : SegmentCoords.mod(x-this.skew,this.length)
		};
	};
	
	// get float value from point representation
	SegmentCoords.prototype.getFloat = function (p) {
		return this.skew + (p.n * this.length) + p.offset;
	};

	// transform float x into segment defined by other float y 
	// if y isnt specified - transform into segment [skew, skew + length]
	SegmentCoords.prototype.transformFloat = function (x, y) {
		y = (y === undefined) ? this.skew : y;
		var xPoint = this.getPoint(x);
		var yPoint = this.getPoint(y);
		return this.getFloat({n:yPoint.n, offset:xPoint.offset});
	};


	/*
		LOOP WRAPPER
	*/

	var LoopWrapper = function (timingObject, range) {
		WrapperBase.call(this, timingObject, {timeout:true});
		this._range = range;
		this._coords = new SegmentCoords(range[0], range[1]-range[0]);
	};
	inherit(LoopWrapper, WrapperBase);

	// transform value from coordiantes X of timing source
	// to looper coordinates Y
	LoopWrapper.prototype._transform = function (x) {
		return this._coords.transformFloat(x);
	};

	// transform value from looper coordinates Y into 
	// coordinates X of timing object - maintain relative diff 
	LoopWrapper.prototype._inverse = function (y) {
		var current_y = this.query().position;
		var current_x = this.timingsrc.query().position;
		var diff = y - current_y;
		var x = diff + current_x;
		// verify that x is witin range
		return x;
	};

	// overrides
	LoopWrapper.prototype.query = function () {
		if (this.vector === null) return null;
		var vector = motionutils.calculateVector(this.vector, this.clock.now());
		// trigger state transition if range violation is detected
		if (vector.position > this._range[1]) {
			vector.position = this._range[0];
			this._main(vector)
		} else if (vector.position < this._range[0]) {
			vector.position = this._range[1];
			this._main(vector);
		} else {
			// no range violation
			return vector;
		}
		// re-evaluate query after state transition
		return motionutils.calculateVector(this.vector, this.clock.now());
	};

	// overrides
	LoopWrapper.prototype.update = function (vector) {
		if (vector.position !== undefined && vector.position !== null) {
			vector.position = this._inverse(vector.position);
		}
		return this.timingsrc.update(vector);
	};

	// overrides
	LoopWrapper.prototype._calculateTimeoutVector = function () {
		var freshVector = this.query();
		var res = motionutils.calculateDelta(freshVector, this.range);
		var deltaSec = res[0];
		if (deltaSec === null) return null;
		var position = res[1];
		var vector = motionutils.calculateVector(freshVector, freshVector.timestamp + deltaSec);
		vector.position = position; // avoid rounding errors
		return vector;
	};

	// overrides
	LoopWrapper.prototype._onTimeout = function (vector) {
		if (vector.position >= this._range[1]) {
			vector.position = this._range[0];
		} else if (vector.position <= this._range[0]) {
			vector.position = this._range[1];
		}
		return vector;
	};

	// overrides
	LoopWrapper.prototype._onChange = function (vector) {
		vector.position = this._transform(vector.position);
		return vector;
	};

	return LoopWrapper;
});