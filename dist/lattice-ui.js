/*! Svelte runtime: Copyright (c) 2016-2025 Svelte Contributors. MIT license; see THIRD_PARTY_NOTICES.md. */
//#region node_modules/svelte/src/internal/shared/utils.js
var e = Array.isArray, t = Array.prototype.indexOf, n = Array.prototype.includes, r = Array.from, i = Object.defineProperty, a = Object.getOwnPropertyDescriptor, o = Object.getOwnPropertyDescriptors, s = Object.prototype, c = Array.prototype, l = Object.getPrototypeOf, u = Object.isExtensible, d = () => {};
function f(e) {
	for (var t = 0; t < e.length; t++) e[t]();
}
function p() {
	var e, t;
	return {
		promise: new Promise((n, r) => {
			e = n, t = r;
		}),
		resolve: e,
		reject: t
	};
}
function m(e, t) {
	if (Array.isArray(e)) return e;
	if (t === void 0 || !(Symbol.iterator in e)) return Array.from(e);
	let n = [];
	for (let r of e) if (n.push(r), n.length === t) break;
	return n;
}
var h = 1024, g = 2048, _ = 4096, v = 8192, y = 16384, b = 32768, x = 1 << 25, S = 65536, C = 1 << 19, w = 1 << 20, T = 1 << 25, E = 65536, D = 1 << 21, O = 1 << 22, k = 1 << 23, A = Symbol("$state"), ee = Symbol("legacy props"), te = Symbol(""), ne = Symbol("attributes"), j = Symbol("class"), re = Symbol("style"), ie = Symbol("text"), ae = Symbol("form reset"), oe = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), se = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml");
function ce(e) {
	throw Error("https://svelte.dev/e/lifecycle_outside_component");
}
//#endregion
//#region node_modules/svelte/src/internal/client/errors.js
function le() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function ue(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function de(e) {
	throw Error("https://svelte.dev/e/effect_in_teardown");
}
function fe() {
	throw Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function pe(e) {
	throw Error("https://svelte.dev/e/effect_orphan");
}
function me() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function he(e) {
	throw Error("https://svelte.dev/e/props_invalid_value");
}
function ge() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function _e() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function ve() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function ye() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
//#endregion
//#region node_modules/svelte/src/constants.js
var be = {}, xe = Symbol("uninitialized"), Se = "http://www.w3.org/1999/xhtml";
function Ce() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function we(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
function Te() {
	console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Ee() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/hydration.js
var M = !1;
function De(e) {
	M = e;
}
var N;
function Oe(e) {
	if (e === null) throw we(), be;
	return N = e;
}
function ke() {
	return Oe(/* @__PURE__ */ ln(N));
}
function P(e) {
	if (M) {
		if (/* @__PURE__ */ ln(N) !== null) throw we(), be;
		N = e;
	}
}
function Ae(e = 1) {
	if (M) {
		for (var t = e, n = N; t--;) n = /* @__PURE__ */ ln(n);
		N = n;
	}
}
function je(e = !0) {
	for (var t = 0, n = N;;) {
		if (n.nodeType === 8) {
			var r = n.data;
			if (r === "]") {
				if (t === 0) return n;
				--t;
			} else (r === "[" || r === "[!" || r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
		}
		var i = /* @__PURE__ */ ln(n);
		e && n.remove(), n = i;
	}
}
function Me(e) {
	if (!e || e.nodeType !== 8) throw we(), be;
	return e.data;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/equality.js
function Ne(e) {
	return e === this.v;
}
function Pe(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function Fe(e) {
	return !Pe(e, this.v);
}
//#endregion
//#region node_modules/svelte/src/internal/shared/clone.js
var Ie = [];
function Le(e, t = !1, n = !1) {
	return Re(e, /* @__PURE__ */ new Map(), "", Ie, null, n);
}
function Re(t, n, r, i, a = null, o = !1) {
	if (typeof t == "object" && t) {
		var c = n.get(t);
		if (c !== void 0) return c;
		if (t instanceof Map) return new Map(t);
		if (t instanceof Set) return new Set(t);
		if (e(t)) {
			var u = Array(t.length);
			n.set(t, u), a !== null && n.set(a, u);
			for (var d = 0; d < t.length; d += 1) {
				var f = t[d];
				d in t && (u[d] = Re(f, n, r, i, null, o));
			}
			return u;
		}
		if (l(t) === s) {
			u = {}, n.set(t, u), a !== null && n.set(a, u);
			for (var p of Object.keys(t)) u[p] = Re(t[p], n, r, i, null, o);
			return u;
		}
		if (t instanceof Date) return structuredClone(t);
		if (typeof t.toJSON == "function" && !o) return Re(t.toJSON(), n, r, i, t);
	}
	if (t instanceof EventTarget) return t;
	try {
		return structuredClone(t);
	} catch {
		return t;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/context.js
var ze = null;
function Be(e) {
	ze = e;
}
function Ve(e, t = !1, n) {
	ze = {
		p: ze,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: U,
		l: null
	};
}
function He(e) {
	var t = ze, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) bn(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, ze = t.p, e ?? {};
}
function Ue() {
	return !0;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/task.js
var We = [];
function Ge() {
	var e = We;
	We = [], f(e);
}
function Ke(e) {
	if (We.length === 0 && !kt) {
		var t = We;
		queueMicrotask(() => {
			t === We && Ge();
		});
	}
	We.push(e);
}
function qe() {
	for (; We.length > 0;) Ge();
}
function Je(e) {
	var t = U;
	if (t === null) return Hn.f |= k, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	Ye(e, t);
}
function Ye(e, t) {
	if (!(t !== null && t.f & 16384)) {
		for (; t !== null;) {
			if (t.f & 128) {
				if (!(t.f & 32768)) throw e;
				try {
					t.b.error(e);
					return;
				} catch (t) {
					e = t;
				}
			}
			t = t.parent;
		}
		throw e;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/status.js
var Xe = ~(g | _ | h);
function Ze(e, t) {
	e.f = e.f & Xe | t;
}
function Qe(e) {
	e.f & 512 || e.deps === null ? Ze(e, h) : Ze(e, _);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
function $e(e) {
	if (e !== null) for (let t of e) t.f & 2 && t.f & 65536 && (t.f ^= E, $e(t.deps));
}
function et(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), $e(e.deps), Ze(e, h);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/store.js
var tt = !1;
function nt(e) {
	var t = tt;
	try {
		return tt = !1, [e(), tt];
	} finally {
		tt = t;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/misc.js
function rt(e) {
	M && /* @__PURE__ */ cn(e) !== null && un(e);
}
var it = !1;
function at() {
	it || (it = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[ae]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function ot(e) {
	var t = Hn, n = U;
	Wn(null), Gn(null);
	try {
		return e();
	} finally {
		Wn(t), Gn(n);
	}
}
function st(e, t, n, r = n) {
	e.addEventListener(t, () => ot(n));
	let i = e[ae];
	e[ae] = i ? () => {
		i(), r(!0);
	} : () => r(!0), at();
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function ct(e) {
	let t = 0, n = Kt(0), r;
	return () => {
		_n() && (W(n), wn(() => (t === 0 && (r = fr(() => e(() => Xt(n)))), t += 1, () => {
			Ke(() => {
				--t, t === 0 && (r?.(), r = void 0, Xt(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var lt = S | C;
function ut(e, t, n, r) {
	new dt(e, t, n, r);
}
var dt = class {
	parent;
	is_pending = !1;
	transform_error;
	#e;
	#t = M ? N : null;
	#n;
	#r;
	#i;
	#a = null;
	#o = null;
	#s = null;
	#c = null;
	#l = 0;
	#u = 0;
	#d = !1;
	#f = /* @__PURE__ */ new Set();
	#p = /* @__PURE__ */ new Set();
	#m = null;
	#h = ct(() => (this.#m = Kt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = U;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = U.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = Tn(() => {
			if (M) {
				let e = this.#t;
				ke();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, lt), M && (this.#e = N);
	}
	#g() {
		try {
			this.#a = En(() => this.#r(this.#e));
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		let t = this.#n.failed, { reset: n, invoke_onerror: r } = this.#v(e);
		Ke(r), t && (this.#s = En(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			t ? Ee() : (t = !0, n && ye(), this.#s !== null && Nn(this.#s, () => {
				this.#s = null;
			}), this.#S(() => {
				this.#b();
			}));
		};
		return {
			reset: r,
			invoke_onerror: () => {
				try {
					n = !0, this.#n.onerror?.(e, r), n = !1;
				} catch (e) {
					Ye(e, this.#i && this.#i.parent);
				}
			}
		};
	}
	#y() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = En(() => e(this.#e)), Ke(() => {
			var e = this.#c = document.createDocumentFragment(), t = sn();
			e.append(t), this.#a = this.#S(() => En(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, Nn(this.#o, () => {
				this.#o = null;
			}), this.#x(I));
		}));
	}
	#b() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#l = 0, this.#a = En(() => {
				this.#r(this.#e);
			}), this.#u > 0) {
				var e = this.#c = document.createDocumentFragment();
				Ln(this.#a, e);
				let t = this.#n.pending;
				this.#o = En(() => t(this.#e));
			} else this.#x(I);
		} catch (e) {
			this.error(e);
		}
	}
	#x(e) {
		this.is_pending = !1, e.transfer_effects(this.#f, this.#p);
	}
	defer_effect(e) {
		et(e, this.#f, this.#p);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#n.pending;
	}
	#S(e) {
		var t = U, n = Hn, r = ze;
		Gn(this.#i), Wn(this.#i), Be(this.#i.ctx);
		try {
			return Ft.ensure(), e();
		} catch (e) {
			return Je(e), null;
		} finally {
			Gn(t), Wn(n), Be(r);
		}
	}
	#C(e, t) {
		this.has_pending_snippet() ? (this.#u += e, this.#u === 0 && (this.#x(t), this.#o && Nn(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null))) : this.parent && this.parent.#C(e, t);
	}
	update_pending_count(e, t) {
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, Ke(() => {
			this.#d = !1, this.#m && Jt(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), W(this.#m);
	}
	error(e) {
		if (!this.#n.onerror && !this.#n.failed) throw e;
		I?.is_fork ? (this.#a && I.skip_effect(this.#a), this.#o && I.skip_effect(this.#o), this.#s && I.skip_effect(this.#s), I.oncommit(() => {
			this.#w(e);
		})) : this.#w(e);
	}
	#w(e) {
		this.#a &&= (An(this.#a), null), this.#o &&= (An(this.#o), null), this.#s &&= (An(this.#s), null), M && (Oe(this.#t), Ae(), Oe(je()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return En(() => {
						var r = U;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return Ye(e, this.#i.parent), null;
				}
			}));
		};
		Ke(() => {
			var t;
			try {
				t = this.transform_error(e);
			} catch (e) {
				Ye(e, this.#i && this.#i.parent);
				return;
			}
			typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => Ye(e, this.#i && this.#i.parent)) : n(t);
		});
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/async.js
function ft(e, t, n, r) {
	let i = Ue() ? gt : yt;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = U, c = pt(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				Ye(e, s);
			}
			mt();
		}
	}
	var d = ht();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ vt(e))).then(u).catch((e) => Ye(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), mt();
	}) : f();
}
function pt() {
	var e = U, t = Hn, n = ze, r = I;
	return function(i = !0) {
		Gn(e), Wn(t), Be(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function mt(e = !0) {
	Gn(null), Wn(null), Be(null), e && I?.deactivate();
}
function ht() {
	var e = U, t = e.b, n = I, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function gt(e) {
	var t = 2 | g;
	return U !== null && (U.f |= C), {
		ctx: ze,
		deps: null,
		effects: null,
		equals: Ne,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v: xe,
		wv: 0,
		parent: U,
		ac: null
	};
}
var _t = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function vt(e, t, n) {
	let r = U;
	r === null && le();
	var i = void 0, a = Kt(xe), o = !Hn, s = /* @__PURE__ */ new Set();
	return Cn(() => {
		var t = U, n = p();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== oe && n.reject(e);
			}).finally(mt);
		} catch (e) {
			n.reject(e), mt();
		}
		var c = I;
		if (o) {
			if (t.f & 32768) var l = ht();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(_t);
			else for (let e of s.values()) e.reject(_t);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== _t && (c.activate(), t ? (a.f |= k, Jt(a, t)) : (a.f & 8388608 && (a.f ^= k), Jt(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), vn(() => {
		for (let e of s) e.reject(_t);
	}), new Promise((e) => {
		function t(n) {
			function r() {
				n === i ? e(a) : t(i);
			}
			n.then(r, r);
		}
		t(i);
	});
}
/*#__NO_SIDE_EFFECTS__*/
function F(e) {
	let t = /* @__PURE__ */ gt(e);
	return qn(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function yt(e) {
	let t = /* @__PURE__ */ gt(e);
	return t.equals = Fe, t;
}
function bt(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) An(t[n]);
	}
}
function xt(e) {
	var t, n = U, r = e.parent;
	if (!Bn && r !== null && e.v !== xe && r.f & 24576) return Ce(), e.v;
	Gn(r);
	try {
		e.f &= ~E, bt(e), t = ar(e);
	} finally {
		Gn(n);
	}
	return t;
}
function St(e) {
	var t = xt(e);
	!e.equals(t) && (e.wv = nr(), (!I?.is_fork || e.deps === null) && (I === null ? e.v = t : (I.capture(e, t, !0), Et?.capture(e, t, !0)), e.deps === null)) ? Ze(e, h) : Bn || (Dt === null ? Qe(e) : (_n() || I?.is_fork) && Dt.set(e, t));
}
function Ct(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && ot(() => {
		t.ac.abort(oe), t.ac = null;
	}), t.fn !== null && (t.teardown = d), sr(t, 0), On(t));
}
function wt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && cr(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
var Tt = null, I = null, Et = null, Dt = null, Ot = null, kt = !1, At = !1, jt = null, Mt = null, Nt = 0, Pt = 1, Ft = class e {
	id = Pt++;
	#e = !1;
	linked = !0;
	#t = null;
	#n = null;
	async_deriveds = /* @__PURE__ */ new Map();
	current = /* @__PURE__ */ new Map();
	previous = /* @__PURE__ */ new Map();
	#r = /* @__PURE__ */ new Set();
	#i = /* @__PURE__ */ new Set();
	#a = 0;
	#o = /* @__PURE__ */ new Map();
	#s = null;
	#c = [];
	#l = [];
	#u = /* @__PURE__ */ new Set();
	#d = /* @__PURE__ */ new Set();
	#f = /* @__PURE__ */ new Map();
	#p = /* @__PURE__ */ new Set();
	is_fork = !1;
	#m = !1;
	constructor() {
		Tt === null ? Tt = this : (Tt.#n = this, this.#t = Tt), Tt = this;
	}
	#h() {
		if (this.is_fork) return !0;
		for (let n of this.#o.keys()) {
			for (var e = n, t = !1; e.parent !== null;) {
				if (this.#f.has(e)) {
					t = !0;
					break;
				}
				e = e.parent;
			}
			if (!t) return !0;
		}
		return !1;
	}
	skip_effect(e) {
		this.#f.has(e) || this.#f.set(e, {
			d: [],
			m: []
		}), this.#p.delete(e);
	}
	unskip_effect(e, t = (e) => this.schedule(e)) {
		var n = this.#f.get(e);
		if (n) {
			this.#f.delete(e);
			for (var r of n.d) Ze(r, g), t(r);
			for (r of n.m) Ze(r, _), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, Nt++ > 1e3 && (this.#x(), Lt());
		for (let e of this.#u) this.#d.delete(e), Ze(e, g), this.schedule(e);
		for (let e of this.#d) Ze(e, _), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = jt = [], r = [], i = Mt = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw Ht(e), this.#h() || this.discard(), t;
		}
		if (I = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (jt = null, Mt = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) Vt(e, t);
			i.length > 0 && I.#g();
			return;
		}
		let o = this.#v();
		if (o) this.#b(r), this.#b(n), o.#y(this);
		else {
			this.#u.clear(), this.#d.clear();
			for (let e of this.#r) e(this);
			this.#r.clear(), Et = this, zt(r), zt(n), Et = null, this.#s?.resolve();
			var s = I;
			if (this.#a === 0 && (this.#c.length === 0 || s !== null) && this.#x(), this.#c.length > 0) {
				if (s !== null) {
					let e = s;
					e.#c.push(...this.#c.filter((t) => !e.#c.includes(t)));
				} else s = this;
			}
			s !== null && (Wt.clear(), s.#g());
		}
	}
	#_(e, t, n) {
		e.f ^= h;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= h : i & 4 ? t.push(r) : rr(r) && (i & 16 && this.#d.add(r), cr(r));
				var o = r.first;
				if (o !== null) {
					r = o;
					continue;
				}
			}
			for (; r !== null;) {
				var s = r.next;
				if (s !== null) {
					r = s;
					break;
				}
				r = r.parent;
			}
		}
	}
	#v() {
		for (var e = this.#t; e !== null;) {
			if (!e.is_fork) {
				for (let [t, [, n]] of this.current) if (e.current.has(t) && !n) return e;
			}
			e = e.#t;
		}
		return null;
	}
	#y(e) {
		for (let [t, n] of e.current) !this.previous.has(t) && e.previous.has(t) && this.previous.set(t, e.previous.get(t)), this.current.set(t, n);
		for (let [t, n] of e.async_deriveds) {
			let e = this.async_deriveds.get(t);
			e && n.promise.then(e.resolve).catch(e.reject);
		}
		e.async_deriveds.clear(), this.transfer_effects(e.#u, e.#d);
		let t = (e) => {
			var n = e.reactions;
			if (n !== null && !(e.f & 2 && !(e.f & 6144))) for (let e of n) {
				var r = e.f;
				if (r & 2) t(e);
				else {
					var i = e;
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), Ze(i, g), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), I = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) et(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== xe && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), Dt?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		I = this;
	}
	deactivate() {
		I = null, Dt = null;
	}
	flush() {
		try {
			At = !0, I = this, this.#g();
		} finally {
			Nt = 0, Ot = null, jt = null, Mt = null, At = !1, I = null, Dt = null, Wt.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(_t);
		this.#x(), this.#s?.resolve();
	}
	register_created_effect(e) {
		this.#l.push(e);
	}
	increment(e, t) {
		if (this.#a += 1, e) {
			let e = this.#o.get(t) ?? 0;
			this.#o.set(t, e + 1);
		}
	}
	decrement(e, t) {
		if (--this.#a, e) {
			let e = this.#o.get(t) ?? 0;
			e === 1 ? this.#o.delete(t) : this.#o.set(t, e - 1);
		}
		this.#m || (this.#m = !0, Ke(() => {
			this.#m = !1, this.linked && this.flush();
		}));
	}
	transfer_effects(e, t) {
		for (let t of e) this.#u.add(t);
		for (let e of t) this.#d.add(e);
		e.clear(), t.clear();
	}
	oncommit(e) {
		this.#r.add(e);
	}
	ondiscard(e) {
		this.#i.add(e);
	}
	settled() {
		return (this.#s ??= p()).promise;
	}
	static ensure() {
		if (I === null) {
			let t = I = new e();
			!At && !kt && Ke(() => {
				t.#e || t.flush();
			});
		}
		return I;
	}
	apply() {
		Dt = null;
	}
	schedule(e) {
		if (Ot = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) e.b.defer_effect(e);
		else {
			for (var t = e; t.parent !== null;) {
				t = t.parent;
				var n = t.f;
				if (jt !== null && t === U && (Hn === null || !(Hn.f & 2))) return;
				if (n & 96) {
					if (!(n & 1024)) return;
					t.f ^= h;
				}
			}
			this.#c.push(t);
		}
	}
	#x() {
		if (this.linked) {
			var e = this.#t, t = this.#n;
			e === null || (e.#n = t), t === null ? Tt = e : t.#t = e, this.linked = !1;
		}
	}
};
function It(e) {
	var t = kt;
	kt = !0;
	try {
		var n;
		for (e && (I !== null && !I.is_fork && I.flush(), n = e());;) {
			if (qe(), I === null) return n;
			I.flush();
		}
	} finally {
		kt = t;
	}
}
function Lt() {
	try {
		me();
	} catch (e) {
		Ye(e, Ot);
	}
}
var Rt = null;
function zt(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && rr(r) && (Rt = /* @__PURE__ */ new Set(), cr(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Mn(r), Rt?.size > 0)) {
				Wt.clear();
				for (let e of Rt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) Rt.has(n) && (Rt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || cr(n);
					}
				}
				Rt.clear();
			}
		}
		Rt = null;
	}
}
function Bt(e) {
	I.schedule(e);
}
function Vt(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), Ze(e, h);
		for (var n = e.first; n !== null;) Vt(n, t), n = n.next;
	}
}
function Ht(e) {
	Ze(e, h);
	for (var t = e.first; t !== null;) Ht(t), t = t.next;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/sources.js
var Ut = /* @__PURE__ */ new Set(), Wt = /* @__PURE__ */ new Map(), Gt = !1;
function Kt(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: Ne,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function L(e, t) {
	let n = Kt(e, t);
	return qn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function qt(e, t = !1, n = !0) {
	let r = Kt(e);
	return t || (r.equals = Fe), r;
}
function R(e, t, n = !1) {
	return Hn !== null && (!Un || Hn.f & 131072) && Ue() && Hn.f & 4325394 && (Kn === null || !Kn.has(e)) && ve(), Jt(e, n ? Qt(t) : t, Mt);
}
function Jt(e, t, n = null) {
	if (!e.equals(t)) {
		Bn ? Wt.set(e, t) : Wt.has(e) || Wt.set(e, e.v);
		var r = Ft.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && xt(t), Dt === null && Qe(t);
		}
		e.wv = nr(), Zt(e, g, n), Ue() && U !== null && U.f & 1024 && !(U.f & 96) && (Xn === null ? Zn([e]) : Xn.push(e)), !r.is_fork && Ut.size > 0 && !Gt && Yt();
	}
	return t;
}
function Yt() {
	Gt = !1;
	for (let e of Ut) {
		e.f & 1024 && Ze(e, _);
		let t;
		try {
			t = rr(e);
		} catch {
			t = !0;
		}
		t && cr(e);
	}
	Ut.clear();
}
function Xt(e) {
	R(e, e.v + 1);
}
function Zt(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = Ue(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (i || s !== U) {
			var l = (c & g) === 0;
			if (l && Ze(s, t), c & 131072) Ut.add(s);
			else if (c & 2) {
				var u = s;
				Dt?.delete(u), c & 65536 || (c & 512 && (U === null || !(U.f & 2097152)) && (s.f |= E), Zt(u, _, n));
			} else if (l) {
				var d = s;
				c & 16 && Rt !== null && Rt.add(d), n === null ? Bt(d) : n.push(d);
			}
		}
	}
}
function Qt(t) {
	if (typeof t != "object" || !t || A in t) return t;
	let n = l(t);
	if (n !== s && n !== c) return t;
	var r = /* @__PURE__ */ new Map(), i = e(t), o = /* @__PURE__ */ L(0), u = null, d = er, f = (e) => {
		if (er === d) return e();
		var t = Hn, n = er;
		Wn(null), tr(d);
		var r = e();
		return Wn(t), tr(n), r;
	};
	return i && r.set("length", /* @__PURE__ */ L(t.length, u)), new Proxy(t, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && ge();
			var i = r.get(t);
			return i === void 0 ? f(() => {
				var e = /* @__PURE__ */ L(n.value, u);
				return r.set(t, e), e;
			}) : R(i, n.value, !0), !0;
		},
		deleteProperty(e, t) {
			var n = r.get(t);
			if (n === void 0) {
				if (t in e) {
					let e = f(() => /* @__PURE__ */ L(xe, u));
					r.set(t, e), Xt(o);
				}
			} else R(n, xe), Xt(o);
			return !0;
		},
		get(e, n, i) {
			if (n === A) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ L(Qt(s ? e[n] : xe), u)), r.set(n, o)), o !== void 0) {
				var c = W(o);
				return c === xe ? void 0 : c;
			}
			return Reflect.get(e, n, i);
		},
		getOwnPropertyDescriptor(e, t) {
			var n = Reflect.getOwnPropertyDescriptor(e, t);
			if (n && "value" in n) {
				var i = r.get(t);
				i && (n.value = W(i));
			} else if (n === void 0) {
				var a = r.get(t), o = a?.v;
				if (a !== void 0 && o !== xe) return {
					enumerable: !0,
					configurable: !0,
					value: o,
					writable: !0
				};
			}
			return n;
		},
		has(e, t) {
			if (t === A) return !0;
			var n = r.get(t), i = n !== void 0 && n.v !== xe || Reflect.has(e, t);
			return (n !== void 0 || U !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ L(i ? Qt(e[t]) : xe, u)), r.set(t, n)), W(n) === xe) ? !1 : i;
		},
		set(e, t, n, s) {
			var c = r.get(t), l = t in e;
			if (i && t === "length") for (var d = n; d < c.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ L(xe, u)), r.set(d + "", p)) : R(p, xe);
			}
			if (c === void 0) (!l || a(e, t)?.writable) && (c = f(() => /* @__PURE__ */ L(void 0, u)), R(c, Qt(n)), r.set(t, c));
			else {
				l = c.v !== xe;
				var m = f(() => Qt(n));
				R(c, m);
			}
			var h = Reflect.getOwnPropertyDescriptor(e, t);
			if (h?.set && h.set.call(s, n), !l) {
				if (i && typeof t == "string") {
					var g = r.get("length"), _ = Number(t);
					Number.isInteger(_) && _ >= g.v && R(g, _ + 1);
				}
				Xt(o);
			}
			return !0;
		},
		ownKeys(e) {
			W(o);
			var t = Reflect.ownKeys(e).filter((e) => {
				var t = r.get(e);
				return t === void 0 || t.v !== xe;
			});
			for (var [n, i] of r) i.v !== xe && !(n in e) && t.push(n);
			return t;
		},
		setPrototypeOf() {
			_e();
		}
	});
}
function $t(e) {
	try {
		if (typeof e == "object" && e && A in e) return e[A];
	} catch {}
	return e;
}
function en(e, t) {
	return Object.is($t(e), $t(t));
}
var tn, nn, rn, an;
function on() {
	if (tn === void 0) {
		tn = window, nn = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		rn = a(t, "firstChild").get, an = a(t, "nextSibling").get, u(e) && (e[j] = void 0, e[ne] = null, e[re] = void 0, e.__e = void 0), u(n) && (n[ie] = void 0);
	}
}
function sn(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function cn(e) {
	return rn.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function ln(e) {
	return an.call(e);
}
function z(e, t) {
	if (!M) return /* @__PURE__ */ cn(e);
	var n = /* @__PURE__ */ cn(N);
	if (n === null) n = N.appendChild(sn());
	else if (t && n.nodeType !== 3) {
		var r = sn();
		return n?.before(r), Oe(r), r;
	}
	return t && pn(n), Oe(n), n;
}
function B(e, t = !1) {
	if (!M) {
		var n = /* @__PURE__ */ cn(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ ln(n) : n;
	}
	if (t) {
		if (N?.nodeType !== 3) {
			var r = sn();
			return N?.before(r), Oe(r), r;
		}
		pn(N);
	}
	return N;
}
function V(e, t = 1, n = !1) {
	let r = M ? N : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ ln(r);
	if (!M) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = sn();
			return r === null ? i?.after(a) : r.before(a), Oe(a), a;
		}
		pn(r);
	}
	return Oe(r), r;
}
function un(e) {
	e.textContent = "";
}
function dn() {
	return !1;
}
function fn(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function pn(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/effects.js
function mn(e) {
	U === null && (Hn === null && pe(e), fe()), Bn && de(e);
}
function hn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function gn(e, t) {
	var n = U;
	n !== null && n.f & 8192 && (e |= v);
	var r = {
		ctx: ze,
		deps: null,
		nodes: null,
		f: e | g | 512,
		first: null,
		fn: t,
		last: null,
		next: null,
		parent: n,
		b: n && n.b,
		prev: null,
		teardown: null,
		wv: 0,
		ac: null
	};
	I?.register_created_effect(r);
	var i = r;
	if (e & 4) jt === null ? Ft.ensure().schedule(r) : jt.push(r);
	else if (t !== null) {
		try {
			cr(r);
		} catch (e) {
			throw An(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= S));
	}
	if (i !== null && (i.parent = n, n !== null && hn(i, n), Hn !== null && Hn.f & 2 && !(e & 64))) {
		var a = Hn;
		(a.effects ??= []).push(i);
	}
	return r;
}
function _n() {
	return Hn !== null && !Un;
}
function vn(e) {
	let t = gn(8, null);
	return Ze(t, h), t.teardown = e, t;
}
function yn(e) {
	mn("$effect");
	var t = U.f;
	if (!Hn && t & 32 && ze !== null && !ze.i) {
		var n = ze;
		(n.e ??= []).push(e);
	} else return bn(e);
}
function bn(e) {
	return gn(4 | w, e);
}
function xn(e) {
	Ft.ensure();
	let t = gn(64 | C, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? Nn(t, () => {
			An(t), n(void 0);
		}) : (An(t), n(void 0));
	});
}
function Sn(e) {
	return gn(4, e);
}
function Cn(e) {
	return gn(O | C, e);
}
function wn(e, t = 0) {
	return gn(8 | t, e);
}
function H(e, t = [], n = [], r = []) {
	ft(r, t, n, (t) => {
		gn(8, () => {
			e(...t.map(W));
		});
	});
}
function Tn(e, t = 0) {
	return gn(16 | t, e);
}
function En(e) {
	return gn(32 | C, e);
}
function Dn(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = Bn, n = Hn;
		Vn(!0), Wn(null);
		try {
			t.call(null);
		} finally {
			Vn(e), Wn(n);
		}
	}
}
function On(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && ot(() => {
			e.abort(oe);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : An(n, t), n = r;
	}
}
function kn(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || An(t), t = n;
	}
}
function An(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (jn(e.nodes.start, e.nodes.end), n = !0), e.f |= x, On(e, t && !n), sr(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	Dn(e), e.f ^= x, e.f |= y;
	var i = e.parent;
	i !== null && i.first !== null && Mn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function jn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ ln(e);
		e.remove(), e = n;
	}
}
function Mn(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Nn(e, t, n = !0) {
	var r = [];
	Pn(e, r, !0);
	var i = () => {
		n && An(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function Pn(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= v;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				Pn(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function Fn(e) {
	In(e, !0);
}
function In(e, t) {
	if (e.f & 8192) {
		e.f ^= v, e.f & 1024 || (Ze(e, g), Ft.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = !!(n.f & 65536) || !!(n.f & 32);
			In(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function Ln(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ ln(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/legacy.js
var Rn = null, zn = !1, Bn = !1;
function Vn(e) {
	Bn = e;
}
var Hn = null, Un = !1;
function Wn(e) {
	Hn = e;
}
var U = null;
function Gn(e) {
	U = e;
}
var Kn = null;
function qn(e) {
	Hn !== null && (Kn ??= /* @__PURE__ */ new Set()).add(e);
}
var Jn = null, Yn = 0, Xn = null;
function Zn(e) {
	Xn = e;
}
var Qn = 1, $n = 0, er = $n;
function tr(e) {
	er = e;
}
function nr() {
	return ++Qn;
}
function rr(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~E), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (rr(a) && St(a), a.wv > e.wv) return !0;
		}
		t & 512 && Dt === null && Ze(e, h);
	}
	return !1;
}
function ir(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Kn !== null && Kn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? ir(a, t, !1) : t === a && (n ? Ze(a, g) : a.f & 1024 && Ze(a, _), Bt(a));
	}
}
function ar(e) {
	var t = Jn, n = Yn, r = Xn, i = Hn, a = Kn, o = ze, s = Un, c = er, l = e.f;
	Jn = null, Yn = 0, Xn = null, Hn = l & 96 ? null : e, Kn = null, Be(e.ctx), Un = !1, er = ++$n, e.ac !== null && (ot(() => {
		e.ac.abort(oe);
	}), e.ac = null);
	try {
		e.f |= D;
		var u = e.fn, d = u();
		e.f |= b;
		var f = e.deps, p = I?.is_fork;
		if (Jn !== null) {
			var m;
			if (p || sr(e, Yn), f !== null && Yn > 0) for (f.length = Yn + Jn.length, m = 0; m < Jn.length; m++) f[Yn + m] = Jn[m];
			else e.deps = f = Jn;
			if (_n() && e.f & 512) for (m = Yn; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && Yn < f.length && (sr(e, Yn), f.length = Yn);
		if (Ue() && Xn !== null && !Un && f !== null && !(e.f & 6146)) for (m = 0; m < Xn.length; m++) ir(Xn[m], e);
		if (i !== null && i !== e) {
			if ($n++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = $n;
			if (t !== null) for (let e of t) e.rv = $n;
			Xn !== null && (r === null ? r = Xn : r.push(...Xn));
		}
		return e.f & 8388608 && (e.f ^= k), d;
	} catch (e) {
		return Je(e);
	} finally {
		e.f ^= D, Jn = t, Yn = n, Xn = r, Hn = i, Kn = a, Be(o), Un = s, er = c;
	}
}
function or(e, r) {
	let i = r.reactions;
	if (i !== null) {
		var a = t.call(i, e);
		if (a !== -1) {
			var o = i.length - 1;
			o === 0 ? i = r.reactions = null : (i[a] = i[o], i.pop());
		}
	}
	if (i === null && r.f & 2 && (Jn === null || !n.call(Jn, r))) {
		var s = r;
		s.f & 512 && (s.f ^= 512, s.f &= ~E), s.v !== xe && Qe(s), s.ac !== null && ot(() => {
			s.ac.abort(oe), s.ac = null, Ze(s, g);
		}), Ct(s), sr(s, 0);
	}
}
function sr(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) or(e, n[r]);
}
function cr(e) {
	var t = e.f;
	if (!(t & 16384)) {
		Ze(e, h);
		var n = U, r = zn;
		U = e, zn = !(t & 96);
		try {
			t & 16777232 ? kn(e) : On(e), Dn(e);
			var i = ar(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = Qn;
		} finally {
			zn = r, U = n;
		}
	}
}
async function lr() {
	await Promise.resolve(), It();
}
function W(e) {
	var t = !!(e.f & 2);
	if (Rn?.add(e), Hn !== null && !Un && !(U !== null && U.f & 16384) && (Kn === null || !Kn.has(e))) {
		var r = Hn.deps;
		if (Hn.f & 2097152) e.rv < $n && (e.rv = $n, Jn === null && r !== null && r[Yn] === e ? Yn++ : Jn === null ? Jn = [e] : Jn.push(e));
		else {
			Hn.deps ??= [], n.call(Hn.deps, e) || Hn.deps.push(e);
			var i = e.reactions;
			i === null ? e.reactions = [Hn] : n.call(i, Hn) || i.push(Hn);
		}
	}
	if (Bn && Wt.has(e)) return Wt.get(e);
	if (t) {
		var a = e;
		if (Bn) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || dr(a)) && (o = xt(a)), Wt.set(a, o), o;
		}
		var s = !(a.f & 512) && !Un && Hn !== null && (zn || !!(Hn.f & 512)), c = (a.f & b) === 0;
		rr(a) && (s && (a.f |= 512), St(a)), s && !c && (wt(a), ur(a));
	}
	if (Dt?.has(e)) return Dt.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function ur(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (wt(t), ur(t));
}
function dr(e) {
	if (e.v === xe) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Wt.has(t) || t.f & 2 && dr(t)) return !0;
	return !1;
}
function fr(e) {
	var t = Un;
	try {
		return Un = !0, e();
	} finally {
		Un = t;
	}
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var pr = ["touchstart", "touchmove"];
function mr(e) {
	return pr.includes(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
var hr = Symbol("events"), gr = /* @__PURE__ */ new Set(), _r = /* @__PURE__ */ new Set();
function vr(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || Sr.call(t, e), !e.cancelBubble) return ot(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Ke(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function G(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = vr(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && vn(() => {
		t.removeEventListener(e, o, a);
	});
}
function K(e, t, n) {
	(t[hr] ??= {})[e] = n;
}
function yr(e) {
	for (var t = 0; t < e.length; t++) gr.add(e[t]);
	for (var n of _r) n(e);
}
var br = null, xr = !1;
function Sr(e) {
	var t = this, n = t.ownerDocument, r = e.type, a = e.composedPath?.() || [], o = a[0] || e.target;
	br = e, xr || (xr = !0, setTimeout(() => {
		xr = !1, br = null;
	}));
	var s = 0, c = br === e && e[hr];
	if (c) {
		var l = a.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[hr] = t;
			return;
		}
		var u = a.indexOf(t);
		if (u === -1) return;
		l <= u && (s = l);
	}
	if (o = a[s] || e.target, o !== t) {
		i(e, "currentTarget", {
			configurable: !0,
			get() {
				return o || n;
			}
		});
		var d = Hn, f = U;
		Wn(null), Gn(null);
		try {
			for (var p, m = []; o !== null && o !== t;) {
				try {
					var h = o[hr]?.[r];
					h != null && (!o.disabled || e.target === o) && h.call(o, e);
				} catch (e) {
					p ? m.push(e) : p = e;
				}
				if (e.cancelBubble) break;
				s++, o = s < a.length ? a[s] : null;
			}
			if (p) {
				for (let e of m) queueMicrotask(() => {
					throw e;
				});
				throw p;
			}
		} finally {
			e[hr] = t, delete e.currentTarget, Wn(d), Gn(f);
		}
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/reconciler.js
var Cr = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function wr(e) {
	return Cr?.createHTML(e) ?? e;
}
function Tr(e) {
	var t = fn("template");
	return t.innerHTML = wr(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function Er(e, t) {
	var n = U;
	n.nodes === null && (n.nodes = {
		start: e,
		end: t,
		a: null,
		t: null
	});
}
/*#__NO_SIDE_EFFECTS__*/
function q(e, t) {
	var n = !!(t & 1), r = !!(t & 2), i, a = !e.startsWith("<!>");
	return () => {
		if (M) return Er(N, null), N;
		i === void 0 && (i = Tr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ cn(i)));
		var t = r || nn ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ cn(t), s = t.lastChild;
			Er(o, s);
		} else Er(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Dr(e, t, n = "svg") {
	var r = !e.startsWith("<!>"), i = !!(t & 1), a = `<${n}>${r ? e : "<!>" + e}</${n}>`, o;
	return () => {
		if (M) return Er(N, null), N;
		if (!o) {
			var e = /* @__PURE__ */ cn(Tr(a));
			if (i) for (o = document.createDocumentFragment(); /* @__PURE__ */ cn(e);) o.appendChild(/* @__PURE__ */ cn(e));
			else o = /* @__PURE__ */ cn(e);
		}
		var t = o.cloneNode(!0);
		if (i) {
			var n = /* @__PURE__ */ cn(t), r = t.lastChild;
			Er(n, r);
		} else Er(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Or(e, t) {
	return /* @__PURE__ */ Dr(e, t, "svg");
}
function kr(e = "") {
	if (!M) {
		var t = sn(e + "");
		return Er(t, t), t;
	}
	var n = N;
	return n.nodeType === 3 ? pn(n) : (n.before(n = sn()), Oe(n)), Er(n, n), n;
}
function Ar() {
	if (M) return Er(N, null), N;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = sn();
	return e.append(t, n), Er(t, n), e;
}
function J(e, t) {
	if (M) {
		var n = U;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = N), ke();
	} else e !== null && e.before(t);
}
function jr() {
	if (M && N && N.nodeType === 8 && N.textContent?.startsWith("$")) {
		let e = N.textContent.substring(1);
		return ke(), e;
	}
	return (window.__svelte ??= {}).uid ??= 1, `c${window.__svelte.uid++}`;
}
function Y(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[ie] ??= e.nodeValue) && (e[ie] = n, e.nodeValue = `${n}`);
}
function Mr(e, t) {
	return Pr(e, t);
}
var Nr = /* @__PURE__ */ new Map();
function Pr(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	on();
	var l = void 0, u = xn(() => {
		var s = n ?? t.appendChild(sn());
		ut(s, { pending: () => {} }, (t) => {
			Ve({});
			var n = ze;
			if (o && (n.c = o), a && (i.$$events = a), M && Er(t, null), l = e(t, i) || {}, M && (U.nodes.end = N, N === null || N.nodeType !== 8 || N.data !== "]")) throw we(), be;
			He();
		}, c);
		var u = /* @__PURE__ */ new Set(), d = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!u.has(r)) {
					u.add(r);
					var i = mr(r);
					for (let e of [t, document]) {
						var a = Nr.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), Nr.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, Sr, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return d(r(gr)), _r.add(d), () => {
			for (var e of u) for (let n of [t, document]) {
				var r = Nr.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, Sr), r.delete(e), r.size === 0 && Nr.delete(n)) : r.set(e, i);
			}
			_r.delete(d), s !== n && s.parentNode?.removeChild(s);
		};
	});
	return Fr.set(l, u), l;
}
var Fr = /* @__PURE__ */ new WeakMap();
function Ir(e, t) {
	let n = Fr.get(e);
	return n ? (Fr.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/branches.js
var Lr = class {
	anchor;
	#e = /* @__PURE__ */ new Map();
	#t = /* @__PURE__ */ new Map();
	#n = /* @__PURE__ */ new Map();
	#r = /* @__PURE__ */ new Set();
	#i = !0;
	constructor(e, t = !0) {
		this.anchor = e, this.#i = t;
	}
	#a = (e) => {
		if (this.#e.has(e)) {
			var t = this.#e.get(e), n = this.#t.get(t);
			if (n) Fn(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (Fn(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
			}
			for (let [t, n] of this.#e) {
				if (this.#e.delete(t), t === e) break;
				let r = this.#n.get(n);
				r && (An(r.effect), this.#n.delete(n));
			}
			for (let [e, r] of this.#t) {
				if (e === t || this.#r.has(e)) continue;
				let i = () => {
					if (Array.from(this.#e.values()).includes(e)) {
						var t = document.createDocumentFragment();
						Ln(r, t), t.append(sn()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else An(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), Nn(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (An(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = I, r = dn();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = sn();
				i.append(a), this.#n.set(e, {
					effect: En(() => t(a)),
					fragment: i
				});
			} else this.#t.set(e, En(() => t(this.anchor)));
		}
		if (this.#e.set(n, e), r) {
			for (let [t, r] of this.#t) t === e ? n.unskip_effect(r) : n.skip_effect(r);
			for (let [t, r] of this.#n) t === e ? n.unskip_effect(r.effect) : n.skip_effect(r.effect);
			n.oncommit(this.#a), n.ondiscard(this.#o);
		} else M && (this.anchor = N), this.#a(n);
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
function X(e, t, n = !1) {
	var r;
	M && (r = N, ke());
	var i = new Lr(e), a = n ? S : 0;
	function o(e, t) {
		if (M) {
			var n = Me(r);
			if (e !== parseInt(n.substring(1))) {
				var a = je();
				Oe(a), i.anchor = a, De(!1), i.ensure(e, t), De(!0);
				return;
			}
		}
		i.ensure(e, t);
	}
	Tn(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/key.js
var Rr = Symbol("NaN");
function zr(e, t, n) {
	M && ke();
	var r = new Lr(e), i = !Ue();
	Tn(() => {
		var e = t();
		e !== e && (e = Rr), i && typeof e == "object" && e && (e = {}), r.ensure(e, n);
	});
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
function Br(e, t) {
	return t;
}
function Vr(e, t, n) {
	for (var i = [], a = t.length, o, s = t.length, c = 0; c < a; c++) {
		let n = t[c];
		Nn(n, () => {
			if (o) {
				if (o.pending.delete(n), o.done.add(n), o.pending.size === 0) {
					var t = e.outrogroups;
					Hr(e, r(o.done)), t.delete(o), t.size === 0 && (e.outrogroups = null);
				}
			} else --s;
		}, !1);
	}
	if (s === 0) {
		var l = i.length === 0 && n !== null && e.pending.size === 0;
		if (l) {
			var u = n, d = u.parentNode;
			un(d), d.append(u), e.items.clear();
		}
		Hr(e, t, !l);
	} else o = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(o);
}
function Hr(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= T, Ln(a, document.createDocumentFragment())) : An(t[i], n);
	}
}
var Ur;
function Z(t, n, i, a, o, s = null) {
	var c = t, l = /* @__PURE__ */ new Map();
	if (n & 4) {
		var u = t;
		c = M ? Oe(/* @__PURE__ */ cn(u)) : u.appendChild(sn());
	}
	M && ke();
	var d = null, f = /* @__PURE__ */ yt(() => {
		var t = i();
		return e(t) ? t : t == null ? [] : r(t);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, Gr(v, p, c, n, a), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= T, qr(d, null, c)) : Fn(d) : Nn(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: Tn(() => {
			p = W(f);
			var e = p.length;
			let t = !1;
			M && Me(c) === "[!" != (e === 0) && (c = je(), Oe(c), De(!1), t = !0);
			for (var r = /* @__PURE__ */ new Set(), u = I, v = dn(), y = 0; y < e; y += 1) {
				M && N.nodeType === 8 && N.data === "]" && (c = N, t = !0, De(!1));
				var b = p[y], x = a(b, y), S = h ? null : l.get(x);
				S ? (S.v && Jt(S.v, b), S.i && Jt(S.i, y), v && u.unskip_effect(S.e)) : (S = Kr(l, h ? c : Ur ??= sn(), b, x, y, o, n, i), h || (S.e.f |= T), l.set(x, S)), r.add(x);
			}
			if (e === 0 && s && !d && (h ? d = En(() => s(c)) : (d = En(() => s(Ur ??= sn())), d.f |= T)), e > r.size && ue("", "", ""), M && e > 0 && Oe(je()), !h) {
				if (m.set(u, r), v) {
					for (let [e, t] of l) r.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			t && De(!0), W(f);
		}),
		flags: n,
		items: l,
		pending: m,
		outrogroups: null,
		fallback: d
	};
	h = !1, M && (c = N);
}
function Wr(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function Gr(e, t, n, i, a) {
	var o = !!(i & 8), s = t.length, c = e.items, l = Wr(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (o) for (v = 0; v < s; v += 1) h = t[v], g = a(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = a(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (Fn(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= T, _ === l) qr(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), Jr(e, d, _), Jr(e, _, y), qr(_, y, n), d = _, p = [], m = [], l = Wr(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], C = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) qr(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					Jr(e, S.prev, C.next), Jr(e, d, S), Jr(e, C, b), l = b, d = C, --v, p = [], m = [];
				} else u.delete(_), qr(_, l, n), Jr(e, _.prev, _.next), Jr(e, _, d === null ? e.effect.first : d.next), Jr(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = Wr(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = Wr(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (Hr(e, r(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var w = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || w.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && w.push(l), l = Wr(l.next);
		var E = w.length;
		if (E > 0) {
			var D = i & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < E; v += 1) w[v].nodes?.a?.measure();
				for (v = 0; v < E; v += 1) w[v].nodes?.a?.fix();
			}
			Vr(e, w, D);
		}
	}
	o && Ke(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Kr(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? Kt(n) : /* @__PURE__ */ qt(n, !1, !1) : null, l = o & 2 ? Kt(i) : null;
	return {
		v: c,
		i: l,
		e: En(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function qr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ ln(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function Jr(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function Yr(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") {
		if (Array.isArray(e)) {
			var i = e.length;
			for (t = 0; t < i; t++) e[t] && (n = Yr(e[t])) && (r && (r += " "), r += n);
		} else for (n in e) e[n] && (r && (r += " "), r += n);
	}
	return r;
}
function Xr() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = Yr(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/shared/attributes.js
function Zr(e) {
	return typeof e == "object" ? Xr(e) : e ?? "";
}
var Qr = [..." 	\n\r\f\xA0\v﻿"];
function $r(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || Qr.includes(r[o - 1])) && (s === r.length || Qr.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function ei(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function ti(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function ni(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\/\*.*?\*\//g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(ti)), i && c.push(...Object.keys(i).map(ti));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = ti(e.substring(l, u).trim());
							if (!c.includes(p)) {
								f !== ";" && d++;
								var m = e.substring(l, d).trim();
								n += " " + m + ";";
							}
						}
						l = d + 1, u = -1;
					}
				}
			}
		}
		return r && (n += ei(r)), i && (n += ei(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/class.js
function ri(e, t, n, r, i, a) {
	var o = e[j];
	if (M || o !== n || o === void 0) {
		var s = $r(n, r, a);
		(!M || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[j] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/style.js
function ii(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function ai(e, t, n, r) {
	var i = e[re];
	if (M || i !== t) {
		var a = ni(t, r);
		(!M || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[re] = t;
	} else r && (Array.isArray(r) ? (ii(e, n?.[0], r[0]), ii(e, n?.[1], r[1], "important")) : ii(e, n, r));
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function oi(t, n, r = !1) {
	if (t.multiple) {
		if (n == null) return;
		if (!e(n)) return Te();
		for (var i of t.options) i.selected = n.includes(li(i));
	} else {
		for (i of t.options) if (en(li(i), n)) {
			i.selected = !0;
			return;
		}
		(!r || n !== void 0) && (t.selectedIndex = -1);
	}
}
function si(e) {
	var t = new MutationObserver(() => {
		"__value" in e && oi(e, e.__value);
	});
	t.observe(e, {
		childList: !0,
		subtree: !0,
		attributes: !0,
		attributeFilter: ["value"]
	}), vn(() => {
		t.disconnect();
	});
}
function ci(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet(), i = !0;
	st(e, "change", (t) => {
		var i = t ? "[selected]" : ":checked", a;
		if (e.multiple) a = [].map.call(e.querySelectorAll(i), li);
		else {
			var o = e.querySelector(i) ?? e.querySelector("option:not([disabled])");
			a = o && li(o);
		}
		n(a), e.__value = a, I !== null && r.add(I);
	}), Sn(() => {
		var a = t();
		if (e === document.activeElement) {
			var o = I;
			if (r.has(o)) return;
		}
		if (oi(e, a, i), i && a === void 0) {
			var s = e.querySelector(":checked");
			s !== null && (a = li(s), n(a));
		}
		e.__value = a, i = !1;
	}), si(e);
}
function li(e) {
	return "__value" in e ? e.__value : e.value;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var ui = Symbol("is custom element"), di = Symbol("is html"), fi = se ? "link" : "LINK", pi = se ? "progress" : "PROGRESS";
function Q(e) {
	if (M) {
		var t = !1, n = () => {
			if (!t) {
				if (t = !0, e.hasAttribute("value")) {
					var n = e.value;
					$(e, "value", null), e.value = n;
				}
				if (e.hasAttribute("checked")) {
					var r = e.checked;
					$(e, "checked", null), e.checked = r;
				}
			}
		};
		e[ae] = n, Ke(n), at();
	}
}
function mi(e, t) {
	var n = gi(e);
	n.value !== (n.value = t ?? void 0) && (e.value !== t || t === 0 && e.nodeName === pi) && (e.value = t ?? "");
}
function hi(e, t) {
	var n = gi(e);
	n.checked !== (n.checked = t ?? void 0) && (e.checked = t);
}
function $(e, t, n, r) {
	var i = gi(e);
	M && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === fi) || i[t] !== (i[t] = n) && (t === "loading" && (e[te] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && vi(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function gi(e) {
	return e[ne] ??= {
		[ui]: e.nodeName.includes("-"),
		[di]: e.namespaceURI === Se
	};
}
var _i = /* @__PURE__ */ new Map();
function vi(e) {
	var t = e.getAttribute("is") || e.nodeName, n = _i.get(t);
	if (n) return n;
	_i.set(t, n = []);
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var s in r = o(i), r) r[s].set && s !== "innerHTML" && s !== "textContent" && s !== "innerText" && n.push(s);
		i = l(i);
	}
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function yi(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet();
	st(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = bi(e) ? xi(a) : a, n(a), I !== null && r.add(I), await lr(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (M && e.defaultValue !== e.value || fr(t) == null && e.value) && (n(bi(e) ? xi(e.value) : e.value), I !== null && r.add(I)), wn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = I;
			if (r.has(i)) return;
		}
		bi(e) && n === xi(e.value) || (e.type !== "date" || n || e.value) && n !== e.value && (e.value = n ?? "");
	});
}
function bi(e) {
	var t = e.type;
	return t === "number" || t === "range";
}
function xi(e) {
	return e === "" ? null : +e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function Si(e, t) {
	return e === t || e?.[A] === t;
}
function Ci(e = {}, t, n, r) {
	var i = ze.r, a = U;
	return Sn(() => {
		var o, s;
		return wn(() => {
			o = s, s = r?.() || [], fr(() => {
				Si(n(...s), e) || (t(e, ...s), o && Si(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && Si(n(...s), e) && t(null, ...s);
			}, c = r.teardown;
			r.teardown = () => {
				o(), c?.();
			};
		};
	}), e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/props.js
function wi(e, t, n, r) {
	var i = !0, o = !!(n & 8), s = !!(n & 16), c = r, l = !0, u = void 0, d = () => s && i ? (u ??= /* @__PURE__ */ gt(r), W(u)) : (l && (l = !1, c = s ? fr(r) : r), c);
	let f;
	if (o) {
		var p = A in e || ee in e;
		f = a(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	o ? [m, h] = nt(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && he(t), f(m)));
	var g = i ? () => {
		var n = e[t];
		return n === void 0 ? d() : (l = !0, n);
	} : () => {
		var n = e[t];
		return n !== void 0 && (c = void 0), n === void 0 ? c : n;
	};
	if (i && !(n & 4)) return g;
	if (f) {
		var _ = e.$$legacy;
		return (function(e, t) {
			return arguments.length > 0 ? ((!i || !t || _ || h) && f(t ? g() : e), e) : g();
		});
	}
	var v = !1, y = (n & 1 ? gt : yt)(() => (v = !1, g()));
	o && W(y);
	var b = U;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? W(y) : i && o ? Qt(e) : e;
			return R(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return Bn && v || b.f & 16384 ? y.v : W(y);
	});
}
function Ti(e) {
	ze === null && ce("onMount"), yn(() => {
		let t = fr(e);
		if (typeof t == "function") return t;
	});
}
function Ei(e) {
	ze === null && ce("onDestroy"), Ti(() => () => fr(e));
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region ui/NodeCard.svelte
var Di = /* @__PURE__ */ q("<span class=\"pc-modifier-badge svelte-1jilz27\"> </span>"), Oi = /* @__PURE__ */ q("<div><span class=\"pc-native-pin-label\"> </span> <div role=\"img\"></div></div>"), ki = /* @__PURE__ */ q("<div class=\"pc-node-body\"> </div>"), Ai = /* @__PURE__ */ q("<span class=\"pc-native-alias\"> </span>"), ji = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-node-action pc-host-result\" aria-label=\"Preview host result\"><i class=\"fa-solid fa-eye\" aria-hidden=\"true\"></i> Host result</button>"), Mi = /* @__PURE__ */ q("<div role=\"group\" tabindex=\"0\"><div class=\"pc-native-heading\"><svg class=\"pc-native-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path></path></svg><span class=\"pc-node-title\"> </span><!></div> <div class=\"pc-native-pins\"></div> <!> <!> <!></div>");
function Ni(e, t) {
	Ve(t, !0);
	let n = (e) => e.stopPropagation();
	var r = Mi();
	let i;
	var a = z(r), o = z(a), s = z(o);
	P(o);
	var c = V(o), l = z(c, !0);
	P(c);
	var u = V(c), d = (e) => {
		var n = Di(), r = z(n);
		P(n), H(() => {
			$(n, "title", t.card.modifierSummary.text), $(n, "aria-label", t.card.modifierSummary.text), Y(r, `+${t.card.modifierSummary.count ?? ""}`);
		}), J(e, n);
	};
	X(u, (e) => {
		t.card.modifierSummary && e(d);
	}), P(a);
	var f = V(a, 2);
	Z(f, 21, () => t.card.ports, (e) => e.id, (e, n) => {
		var r = Oi();
		let i;
		var a = z(r), o = z(a, !0);
		P(a);
		var s = V(a, 2);
		P(r), H(() => {
			ri(r, 1, `pc-native-row pc-native-row-${W(n).dir}`, "svelte-1jilz27"), i = ai(r, "", i, { "grid-row": W(n).row }), Y(o, W(n).label), ri(s, 1, Zr(W(n).className), "svelte-1jilz27"), $(s, "data-node", t.card.id), $(s, "data-dir", W(n).dir), $(s, "data-port", W(n).port), $(s, "data-side", W(n).side), $(s, "data-kind", W(n).kind), $(s, "title", W(n).title), $(s, "aria-label", W(n).title);
		}), G("mouseenter", s, () => t.actions.hoverPin({
			nodeId: t.card.id,
			dir: W(n).dir,
			port: W(n).port
		})), G("mouseleave", s, () => t.actions.hoverPin(null)), J(e, r);
	}), P(f);
	var p = V(f, 2), m = (e) => {
		var n = ki(), r = z(n, !0);
		P(n), H(() => Y(r, t.card.body)), J(e, n);
	};
	X(p, (e) => {
		t.card.type === "note" && e(m);
	});
	var h = V(p, 2), g = (e) => {
		var n = Ai(), r = z(n, !0);
		P(n), H(() => {
			$(n, "title", t.card.titleHint), Y(r, t.card.title);
		}), J(e, n);
	};
	X(h, (e) => {
		t.card.compact && e(g);
	});
	var _ = V(h, 2), v = (e) => {
		var r = ji();
		K("mousedown", r, n), K("click", r, (e) => {
			n(e), t.actions.hostResult(t.card.id);
		}), J(e, r);
	};
	X(_, (e) => {
		t.card.hostResult && e(v);
	}), P(r), H(() => {
		ri(r, 1, Zr(t.card.className), "svelte-1jilz27"), $(r, "data-id", t.card.id), $(r, "title", t.card.offHint), $(r, "aria-label", `${t.card.label}: ${t.card.title}`), i = ai(r, "", i, {
			left: `${t.card.x}px`,
			top: `${t.card.y}px`
		}), $(s, "d", t.card.iconPath), $(c, "title", t.card.titleHint), Y(l, t.card.title);
	}), J(e, r), He();
}
yr(["mousedown", "click"]);
//#endregion
//#region ui/GroupCard.svelte
var Pi = /* @__PURE__ */ q("<div class=\"pc-node-body\"> </div>"), Fi = /* @__PURE__ */ q("<div role=\"group\"><div><i class=\"fa-solid fa-object-group\" aria-hidden=\"true\"></i> <span> </span> <span class=\"pc-group-frame-count\"> </span> <button type=\"button\"></button></div> <!></div>");
function Ii(e, t) {
	Ve(t, !0);
	function n(e, n) {
		e.stopPropagation(), e.preventDefault(), t.actions.group(t.group.id, n);
	}
	function r(e, n) {
		e.stopPropagation(), e.detail === 0 && t.actions.group(t.group.id, n);
	}
	var i = Fi();
	let a;
	var o = z(i), s = V(z(o), 2), c = z(s, !0);
	P(s);
	var l = V(s, 2), u = z(l, !0);
	P(l);
	var d = V(l, 2);
	P(o);
	var f = V(o, 2), p = (e) => {
		var n = Pi(), r = z(n, !0);
		P(n), H(() => Y(r, t.group.body)), J(e, n);
	};
	X(f, (e) => {
		t.group.collapsed && e(p);
	}), P(i), H(() => {
		ri(i, 1, Zr(t.group.className)), $(i, "data-group", t.group.id), $(i, "aria-label", `Group: ${t.group.title}`), a = ai(i, "", a, {
			left: `${t.group.x}px`,
			top: `${t.group.y}px`,
			width: `${t.group.w}px`,
			height: t.group.collapsed ? void 0 : `${t.group.h}px`
		}), ri(o, 1, Zr(t.group.collapsed ? "pc-node-head" : "pc-group-frame-head")), ri(s, 1, Zr(t.group.collapsed ? "pc-node-title" : "pc-group-frame-title")), Y(c, t.group.title), Y(u, t.group.count), ri(d, 1, `pc-node-action fa-solid pc-group-btn ${t.group.collapsed ? "fa-up-right-and-down-left-from-center" : "fa-down-left-and-up-right-to-center"}`), $(d, "data-action", t.group.collapsed ? "open" : "collapse"), $(d, "title", t.group.collapsed ? "Open group" : "Fold group"), $(d, "aria-label", t.group.collapsed ? "Open group" : "Fold group");
	}), K("mousedown", d, (e) => n(e, t.group.collapsed ? "open" : "collapse")), K("click", d, (e) => r(e, t.group.collapsed ? "open" : "collapse")), J(e, i), He();
}
yr(["mousedown", "click"]);
//#endregion
//#region ui/WireLayer.svelte
var Li = /* @__PURE__ */ Or("<path class=\"pc-wire-hit\"></path><path><title> </title></path><text text-anchor=\"middle\"> </text>", 1), Ri = /* @__PURE__ */ Or("<path></path>"), zi = /* @__PURE__ */ Or("<!><!>", 1);
function Bi(e, t) {
	Ve(t, !0);
	var n = zi(), r = B(n);
	Z(r, 17, () => t.wires, (e) => e.id, (e, t) => {
		var n = Li(), r = B(n), i = V(r), a = z(i), o = z(a);
		P(a), P(i);
		var s = V(i), c = z(s, !0);
		P(s), H(() => {
			$(r, "d", W(t).d), $(r, "data-id", W(t).id), $(i, "d", W(t).d), ri(i, 0, Zr(W(t).className)), $(i, "data-id", W(t).id), $(i, "data-kind", W(t).kind), Y(o, `${W(t).kind ?? ""} artifact`), $(s, "x", W(t).label.x), $(s, "y", W(t).label.y), ri(s, 0, Zr(W(t).label.className)), Y(c, W(t).label.text);
		}), J(e, n);
	});
	var i = V(r), a = (e) => {
		var n = Ri();
		H(() => {
			$(n, "d", t.ghost.d), ri(n, 0, Zr(t.ghost.className));
		}), J(e, n);
	};
	X(i, (e) => {
		t.ghost && e(a);
	}), J(e, n), He();
}
//#endregion
//#region ui/CommentFrame.svelte
var Vi = /* @__PURE__ */ q("<span class=\"pc-comment-title svelte-118xm2r\"> </span>"), Hi = /* @__PURE__ */ q("<input class=\"pc-comment-title-input svelte-118xm2r\" aria-label=\"Comment title\"/>"), Ui = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-comment-resize svelte-118xm2r\" title=\"Drag to resize comment\"></button>"), Wi = /* @__PURE__ */ q("<div role=\"group\"><header class=\"pc-comment-header svelte-118xm2r\"><button type=\"button\" class=\"pc-comment-select svelte-118xm2r\" title=\"Drag header to move comment\">⋮⋮</button> <!></header> <div class=\"pc-comment-notes svelte-118xm2r\"> </div> <!></div>");
function Gi(e, t) {
	Ve(t, !0);
	let n = (e) => e.stopPropagation();
	var r = Wi();
	let i, a;
	var o = z(r), s = z(o), c = V(s, 2), l = (e) => {
		var n = Vi(), r = z(n, !0);
		P(n), H(() => Y(r, t.comment.title)), J(e, n);
	}, u = (e) => {
		var r = Hi();
		Q(r), H(() => mi(r, t.comment.title)), G("focus", r, () => t.actions.select(t.comment.id)), G("pointerdown", r, n, !0), G("mousedown", r, n, !0), G("click", r, n, !0), G("keydown", r, n, !0), K("change", r, (e) => {
			t.comment.readOnly || t.actions.update(t.comment.id, { title: e.currentTarget.value });
		}), J(e, r);
	};
	X(c, (e) => {
		t.comment.readOnly ? e(l) : e(u, -1);
	}), P(o);
	var d = V(o, 2), f = z(d, !0);
	P(d);
	var p = V(d, 2), m = (e) => {
		var n = Ui();
		H(() => $(n, "aria-label", `Resize comment: ${t.comment.title}`)), K("click", n, (e) => {
			e.detail === 0 && t.actions.select(t.comment.id);
		}), J(e, n);
	};
	X(p, (e) => {
		t.comment.readOnly || e(m);
	}), P(r), H(() => {
		i = ri(r, 1, "pc-comment-frame svelte-118xm2r", null, i, {
			"pc-comment-selected": t.comment.selected,
			"pc-comment-readonly": t.comment.readOnly
		}), $(r, "data-id", t.comment.id), $(r, "aria-label", `Comment: ${t.comment.title}`), a = ai(r, "", a, {
			left: `${t.comment.x}px`,
			top: `${t.comment.y}px`,
			width: `${t.comment.w}px`,
			height: `${t.comment.h}px`,
			"--frame-color": t.comment.color
		}), $(s, "aria-label", `Select comment: ${t.comment.title}`), Y(f, t.comment.content);
	}), K("click", s, (e) => {
		e.detail === 0 && t.actions.select(t.comment.id);
	}), J(e, r), He();
}
yr(["click", "change"]);
//#endregion
//#region ui/CanvasLayer.svelte
var Ki = /* @__PURE__ */ q("<div class=\"pc-viewport\" data-pc-renderer=\"svelte\"><div class=\"pc-comment-layer svelte-o7b704\"></div> <svg class=\"pc-wires\" aria-label=\"Canvas connections\"><!></svg> <div class=\"pc-nodes\"><!> <!> <!></div></div>");
function qi(e, t) {
	Ve(t, !0);
	let n = /* @__PURE__ */ L([]), r = /* @__PURE__ */ L([]), i = /* @__PURE__ */ L([]), a = /* @__PURE__ */ L([]), o = /* @__PURE__ */ L({
		select() {},
		update() {},
		command() {}
	}), s = /* @__PURE__ */ L(null), c = /* @__PURE__ */ L({
		w: 4e3,
		h: 4e3
	}), l, u, d, f;
	function p() {
		return {
			viewport: l,
			svg: u,
			nodeLayer: d,
			commentLayer: f
		};
	}
	function m(e, t) {
		R(a, e), R(o, t);
	}
	function h(e) {
		R(n, e);
	}
	function g(e) {
		R(r, e);
	}
	function _(e, t, n) {
		R(i, e), R(c, t), R(s, n);
	}
	function v(e, t) {
		let i = new Map(e.map((e) => [e.id, e])), o = new Map(t.map((e) => [e.id, e]));
		R(n, W(n).map((e) => i.has(e.id) ? {
			...e,
			...i.get(e.id)
		} : e)), R(a, W(a).map((e) => i.has(e.id) ? {
			...e,
			...i.get(e.id)
		} : e)), R(r, W(r).map((e) => o.has(e.id) ? {
			...e,
			...o.get(e.id)
		} : e));
	}
	var y = {
		getLayers: p,
		setComments: m,
		setNodes: h,
		setGroups: g,
		setWires: _,
		setPositions: v
	}, b = Ki(), x = z(b);
	Z(x, 21, () => W(a), (e) => e.id, (e, t) => {
		Gi(e, {
			get comment() {
				return W(t);
			},
			get actions() {
				return W(o);
			}
		});
	}), P(x), Ci(x, (e) => f = e, () => f);
	var S = V(x, 2);
	Bi(z(S), {
		get wires() {
			return W(i);
		},
		get ghost() {
			return W(s);
		}
	}), P(S), Ci(S, (e) => u = e, () => u);
	var C = V(S, 2), w = z(C);
	Z(w, 17, () => W(r).filter((e) => !e.collapsed), (e) => e.id, (e, n) => {
		Ii(e, {
			get group() {
				return W(n);
			},
			get actions() {
				return t.actions;
			}
		});
	});
	var T = V(w, 2);
	return Z(T, 17, () => W(n), (e) => e.id, (e, n) => {
		Ni(e, {
			get card() {
				return W(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), Z(V(T, 2), 17, () => W(r).filter((e) => e.collapsed), (e) => e.id, (e, n) => {
		Ii(e, {
			get group() {
				return W(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), P(C), Ci(C, (e) => d = e, () => d), P(b), Ci(b, (e) => l = e, () => l), H(() => {
		$(S, "width", W(c).w), $(S, "height", W(c).h), $(S, "viewBox", `0 0 ${W(c).w} ${W(c).h}`);
	}), J(e, b), He(y);
}
//#endregion
//#region ui/WorkspaceMenus.svelte
var Ji = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-flat-menu\" aria-haspopup=\"menu\"> </button>"), Yi = /* @__PURE__ */ q("<button type=\"button\" role=\"menuitem\"><span> </span><small> </small></button>"), Xi = /* @__PURE__ */ q("<div class=\"pc-workspace-menu-panel\" role=\"menu\" tabindex=\"-1\"></div>"), Zi = /* @__PURE__ */ q("<nav class=\"pc-workspace-menus\" aria-label=\"Workspace menus\"><!> <!></nav>");
function Qi(e, t) {
	Ve(t, !0);
	let n = /* @__PURE__ */ F(() => t.state.rootWorkflow ?? t.state.workflow), r = /* @__PURE__ */ L(""), i, a = /* @__PURE__ */ L(null), o = null, s = /* @__PURE__ */ L(0), c = /* @__PURE__ */ L(0), l = [
		"File",
		"Edit",
		"Graph",
		"Node",
		"Preview",
		"Workflows",
		"Tools",
		"Help"
	], u = (e, t, n = "", r = !1) => ({
		label: e,
		command: t,
		shortcut: n,
		disabled: r
	});
	function d(e) {
		switch (e) {
			case "File": return [
				u("New workflow", "new"),
				u("Open workflow…", "open-workflow"),
				u("Open examples…", "examples"),
				u("Save workflow", "save"),
				u("Import into graph…", "import-into-graph"),
				u("Export workflow JSON…", "export"),
				u("Close workspace", "close")
			];
			case "Edit": return [
				u("Undo", "undo", "Ctrl Z", !t.state.history.undo),
				u("Redo", "redo", "Ctrl Shift Z", !t.state.history.redo),
				u("Copy", "copy", "Ctrl C", !t.state.selectionActions?.copy),
				u("Cut", "cut", "Ctrl X", !t.state.selectionActions?.cut),
				u("Paste", "paste", "Ctrl V"),
				u("Delete selection", "delete-selection", "Del", !t.state.selectionActions?.delete)
			];
			case "Graph": return [
				u("Select tool", "select-tool"),
				u("Pan tool", "pan-tool"),
				u("Zoom in", "zoom-in"),
				u("Zoom out", "zoom-out"),
				u("Fit to view", "fit"),
				u("Fit selection", "fit-selection", "", !t.state.selectionCount),
				u("Duplicate workflow", "duplicate"),
				u("Rename workflow", "rename"),
				u("Delete workflow", "delete")
			];
			case "Node": return [u("Add node…", "add-node"), u("Inspect selection", "reveal-inspector")];
			case "Preview": return [u("Show preview", "show-preview"), u("Collapse preview", "collapse-preview")];
			case "Workflows": return [
				u("Workflow examples…", "examples"),
				u("New legacy pre workflow", "new-pre"),
				u("New legacy post workflow", "new-post"),
				...W(n) && [
					"unified",
					"pre",
					"post"
				].includes(W(n).phase) ? [u(W(n).phase === "unified" ? W(n).assigned ? "Unified workflow assigned" : "Assign unified workflow" : W(n).assigned ? "Assigned to legacy " + W(n).phase + " phase" : "Assign legacy " + W(n).phase + " phase", "assign-workflow-phase", "", W(n).assigned || W(n).busy)] : [],
				u("Run workflow", "run-workflow", "", !W(n) || !!W(n)?.busy || !!W(n)?.issues.length),
				u("Stop workflow", "stop-workflow", "", !W(n)?.busy)
			];
			case "Tools": return [
				u("Recall arms…", "recall-arms"),
				u("Story documents…", "story-documents"),
				u("Fast connections…", "fast-connections"),
				u("Theme and colours", "theme"),
				u("Toggle inspector", "inspector")
			];
			default: return [u("Workspace guide", "help")];
		}
	}
	function f(e = !1) {
		R(r, ""), e && o?.focus({ preventScroll: !0 });
	}
	async function p(e, t, n = !1) {
		if (W(r) === e && !n) {
			f();
			return;
		}
		R(r, e, !0), o = t, await lr();
		let i = t.getBoundingClientRect(), l = W(a).getBoundingClientRect();
		R(s, Math.max(4, Math.min(i.left, window.innerWidth - l.width - 4)), !0), R(c, i.bottom + 2), n && W(a).querySelector("button:not(:disabled)")?.focus();
	}
	function m(e) {
		f(!0), [
			"examples",
			"show-preview",
			"collapse-preview",
			"add-node",
			"help",
			"fast-connections",
			"story-documents",
			"recall-arms"
		].includes(e) ? t.local(e) : e === "select-tool" || e === "pan-tool" ? t.actions.mode(e === "select-tool" ? "select" : "pan") : e === "zoom-in" || e === "zoom-out" ? t.actions.zoom(e === "zoom-in" ? 1.15 : 1 / 1.15) : t.actions.command(e);
	}
	function h(e) {
		let t = e.target;
		if (e.key === "Escape" && W(r)) e.preventDefault(), e.stopPropagation(), f(!0);
		else if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
			e.preventDefault();
			let n = W(r) || t.textContent || l[0], a = l[(l.indexOf(n) + (e.key === "ArrowRight" ? 1 : l.length - 1)) % l.length], o = i.querySelector(`[data-menu="${a}"]`);
			W(r) ? p(a, o, !0) : o.focus();
		} else if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Home" || e.key === "End") {
			if (e.preventDefault(), !W(r)) {
				p(t.dataset.menu || l[0], t, !0);
				return;
			}
			let n = [...W(a).querySelectorAll("button:not(:disabled)")], i = n.indexOf(t);
			n[e.key === "Home" ? 0 : e.key === "End" ? n.length - 1 : (i + (e.key === "ArrowUp" ? n.length - 1 : 1)) % n.length]?.focus();
		} else e.key === "Tab" && f();
	}
	var g = Zi();
	G("pointerdown", tn, (e) => {
		W(r) && !i.contains(e.target) && !W(a)?.contains(e.target) && f();
	}), G("resize", tn, () => f());
	var _ = z(g);
	Z(_, 17, () => l, Br, (e, t) => {
		var n = Ji(), i = z(n, !0);
		P(n), H(() => {
			$(n, "data-menu", W(t)), $(n, "aria-expanded", W(r) === W(t)), Y(i, W(t));
		}), K("click", n, (e) => p(W(t), e.currentTarget)), K("keydown", n, h), J(e, n);
	});
	var v = V(_, 2), y = (e) => {
		var t = Xi();
		let n;
		Z(t, 21, () => d(W(r)), Br, (e, t) => {
			var n = Yi(), r = z(n), i = z(r, !0);
			P(r);
			var a = V(r), o = z(a, !0);
			P(a), P(n), H(() => {
				n.disabled = W(t).disabled, Y(i, W(t).label), Y(o, W(t).shortcut);
			}), K("click", n, () => m(W(t).command)), J(e, n);
		}), P(t), Ci(t, (e) => R(a, e), () => W(a)), H(() => {
			$(t, "aria-label", W(r)), n = ai(t, "", n, {
				left: `${W(s)}px`,
				top: `${W(c)}px`
			});
		}), K("keydown", t, h), J(e, t);
	};
	X(v, (e) => {
		W(r) && e(y);
	}), P(g), Ci(g, (e) => i = e, () => i), J(e, g), He();
}
yr(["click", "keydown"]);
//#endregion
//#region ui/Toolbar.svelte
var $i = /* @__PURE__ */ q("<option> </option>"), ea = /* @__PURE__ */ q("<header class=\"pc-header\" data-pc-ui=\"svelte\"><div class=\"pc-menubar\"><div class=\"pc-brand\"><img width=\"30\" height=\"30\" alt=\"\"/><span>LATTICE</span></div> <!> <button type=\"button\" class=\"pc-btn menu_button pc-close\" title=\"Close\" aria-label=\"Close canvas\">×</button></div> <div class=\"pc-workflow-bar\"><select class=\"pc-select pc-graph-select text_pole\" aria-label=\"Workflow\"></select> <div class=\"pc-header-actions pc-history\"><button type=\"button\" aria-label=\"Undo\">↶</button> <button type=\"button\" aria-label=\"Redo\">↷</button> <span> </span></div> <button type=\"button\" class=\"pc-btn menu_button pc-root-run\"> </button> <span class=\"pc-root-workflow-status\" role=\"status\"> </span> <div class=\"pc-header-actions pc-surface-actions\"><button type=\"button\" title=\"Show or hide the inspector\" aria-label=\"Toggle inspector\">Details</button></div> <label class=\"pc-arm\"><input class=\"pc-arm-input\" type=\"checkbox\"/><span>Arm</span></label></div></header>");
function ta(e, t) {
	Ve(t, !0);
	let n = /* @__PURE__ */ F(() => t.state.rootWorkflow ?? t.state.workflow), r, i, a, o;
	function s() {
		return {
			header: r,
			graphSelect: i,
			arm: a,
			inspBtn: o
		};
	}
	function c() {
		i.focus();
	}
	var l = {
		getParts: s,
		focusGraphSelect: c
	}, u = ea(), d = z(u), f = z(d), p = z(f);
	Ae(), P(f);
	var m = V(f, 2);
	Qi(m, {
		get state() {
			return t.state;
		},
		get actions() {
			return t.actions;
		},
		get local() {
			return t.local;
		}
	});
	var h = V(m, 2);
	P(d);
	var g = V(d, 2), _ = z(g);
	Z(_, 21, () => t.state.graphs, (e) => e.id, (e, t) => {
		var n = $i(), r = z(n, !0);
		P(n);
		var i = {};
		H(() => {
			Y(r, W(t).name), i !== (i = W(t).id) && (n.value = (n.__value = W(t).id) ?? "");
		}), J(e, n);
	}), P(_), Ci(_, (e) => i = e, () => i);
	var v;
	si(_);
	var y = V(_, 2), b = z(y), x = V(b, 2), S = V(x, 2), C = z(S, !0);
	P(S), P(y);
	var w = V(y, 2), T = z(w, !0);
	P(w);
	var E = V(w, 2), D = z(E);
	P(E);
	var O = V(E, 2), k = z(O);
	Ci(k, (e) => o = e, () => o), P(O);
	var A = V(O, 2), ee = z(A);
	return Q(ee), Ci(ee, (e) => a = e, () => a), Ae(), P(A), P(g), P(u), Ci(u, (e) => r = e, () => r), H((e) => {
		$(p, "src", t.actions.logoUrl), v !== (v = t.state.graphId) && (_.value = (_.__value = t.state.graphId) ?? "", oi(_, t.state.graphId)), ri(b, 1, `pc-btn menu_button pc-undo${t.state.history.undo ? "" : " pc-disabled"}`), b.disabled = !t.state.history.undo, $(b, "title", t.state.history.undoTitle), ri(x, 1, `pc-btn menu_button pc-redo${t.state.history.redo ? "" : " pc-disabled"}`), x.disabled = !t.state.history.redo, $(x, "title", t.state.history.redoTitle), ri(S, 1, `pc-history-note${t.state.history.showNote ? " pc-show" : ""}`), Y(C, t.state.history.note), w.disabled = !W(n) || !W(n).busy && !!W(n).issues.length, $(w, "title", e), Y(T, W(n)?.busy ? "■ Stop" : "▶ Run"), Y(D, `${W(n) ? `${W(n).phase} · ${W(n).assigned ? "Assigned" : "Unassigned"} · ≤ ${W(n).callBound} requests` : "Workflow unavailable"} · Autosave in SillyTavern`), ri(k, 1, `pc-btn menu_button pc-pane-toggle${t.state.inspectorOpen ? " pc-on" : ""}`), $(k, "aria-pressed", t.state.inspectorOpen), hi(ee, t.state.armed);
	}, [() => W(n)?.issues.join("\n") || "Run the root workflow"]), K("click", h, () => t.actions.command("close")), K("change", _, (e) => t.actions.pickGraph(e.currentTarget.value)), K("click", b, () => t.actions.command("undo")), K("click", x, () => t.actions.command("redo")), K("click", w, () => t.actions.command(W(n)?.busy ? "stop-workflow" : "run-workflow")), K("click", k, () => t.actions.command("inspector")), K("change", ee, (e) => t.actions.arm(e.currentTarget.checked)), J(e, u), He(l);
}
yr(["click", "change"]);
//#endregion
//#region ui/PaneDivider.svelte
var na = /* @__PURE__ */ q("<div class=\"pc-pane-divider\" role=\"separator\" aria-label=\"Resize preview\" aria-orientation=\"horizontal\" tabindex=\"0\"></div>");
function ra(e, t) {
	Ve(t, !0);
	let n = wi(t, "min", 3, 90), r = wi(t, "max", 3, 500), i, a = null, o = (e) => Math.max(n(), Math.min(r(), e));
	function s(e) {
		e.button === 0 && (u(), e.preventDefault(), t.start(), a = {
			id: e.pointerId,
			y: e.clientY,
			height: t.height
		}, i.setPointerCapture(e.pointerId), i.focus({ preventScroll: !0 }));
	}
	function c(e) {
		a?.id === e.pointerId && t.change(o(a.height + e.clientY - a.y));
	}
	function l(e = !1, n = a?.id) {
		if (!a || a.id !== n) return;
		let r = a;
		a = null, e && t.change(r.height), i.hasPointerCapture(r.id) && i.releasePointerCapture(r.id);
	}
	function u() {
		l(!0);
	}
	function d(e) {
		let i = e.shiftKey ? 40 : 12, s = e.key === "ArrowUp" ? t.height - i : e.key === "ArrowDown" ? t.height + i : e.key === "Home" ? n() : e.key === "End" ? r() : null;
		s !== null && (e.preventDefault(), e.stopPropagation(), t.start(), t.change(o(s))), e.key === "Escape" && a && (e.preventDefault(), e.stopPropagation(), u());
	}
	Ei(u);
	var f = na();
	G("blur", tn, u), Ci(f, (e) => i = e, () => i), H((e, t) => {
		$(f, "aria-valuemin", n()), $(f, "aria-valuemax", e), $(f, "aria-valuenow", t);
	}, [() => Math.round(r()), () => Math.round(t.height)]), K("pointerdown", f, s), K("pointermove", f, c), K("pointerup", f, (e) => l(!1, e.pointerId)), G("pointercancel", f, (e) => l(!0, e.pointerId)), G("lostpointercapture", f, (e) => l(!0, e.pointerId)), K("keydown", f, d), J(e, f), He();
}
yr([
	"pointerdown",
	"pointermove",
	"pointerup",
	"keydown"
]);
//#endregion
//#region ui/DetailsDivider.svelte
var ia = /* @__PURE__ */ q("<div class=\"pc-details-divider svelte-1iyzcro\" role=\"separator\" aria-label=\"Resize Details\" aria-orientation=\"vertical\" tabindex=\"0\"></div>");
function aa(e, t) {
	Ve(t, !0);
	let n = wi(t, "min", 3, 220), r = wi(t, "max", 3, 520), i, a = null, o = (e) => Math.max(n(), Math.min(r(), e));
	function s(e = !1, n = a?.id) {
		if (!a || a.id !== n) return;
		let r = a;
		a = null, t.preview(null), i.hasPointerCapture(r.id) && i.releasePointerCapture(r.id), e || t.change(o(r.current));
	}
	function c() {
		s(!0);
	}
	function l(e) {
		e.button === 0 && e.isPrimary !== !1 && (c(), e.preventDefault(), e.stopPropagation(), t.start(), a = {
			id: e.pointerId,
			x: e.clientX,
			width: t.width,
			current: t.width
		}, i.setPointerCapture(e.pointerId), i.focus({ preventScroll: !0 }));
	}
	function u(e) {
		a?.id === e.pointerId && (a.current = o(a.width + a.x - e.clientX), t.preview(a.current));
	}
	function d(e) {
		if (e.key === "Escape" && a) {
			e.preventDefault(), e.stopPropagation(), c();
			return;
		}
		let i = e.shiftKey ? 40 : 12, s = e.key === "ArrowLeft" ? t.width + i : e.key === "ArrowRight" ? t.width - i : e.key === "Home" ? n() : e.key === "End" ? r() : null;
		s !== null && (e.preventDefault(), e.stopPropagation(), c(), t.start(), t.change(o(s)));
	}
	Ei(c);
	var f = ia();
	G("blur", tn, c), Ci(f, (e) => i = e, () => i), H((e, t) => {
		$(f, "aria-valuemin", n()), $(f, "aria-valuemax", e), $(f, "aria-valuenow", t);
	}, [() => Math.round(r()), () => Math.round(t.width)]), K("pointerdown", f, l), K("pointermove", f, u), K("pointerup", f, (e) => s(!1, e.pointerId)), G("pointercancel", f, (e) => s(!0, e.pointerId)), G("lostpointercapture", f, (e) => s(!0, e.pointerId)), K("keydown", f, d), J(e, f), He();
}
yr([
	"pointerdown",
	"pointermove",
	"pointerup",
	"keydown"
]);
//#endregion
//#region ui/GraphTabs.svelte
var oa = /* @__PURE__ */ q("<span class=\"pc-graph-tab-lock svelte-7ptwed\" aria-label=\"Read only\">◇</span>"), sa = /* @__PURE__ */ q("<input type=\"text\" title=\"Enter to save, Escape to cancel\"/>"), ca = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-graph-tab-close svelte-7ptwed\">×</button>"), la = /* @__PURE__ */ q("<div><button type=\"button\" role=\"tab\" aria-haspopup=\"menu\"><span class=\"svelte-7ptwed\"> </span><!></button> <!> <!></div>"), ua = /* @__PURE__ */ q("<button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button>"), da = /* @__PURE__ */ q("<button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Save workflow</button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close tab</button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close other tabs</button> <!>", 1), fa = /* @__PURE__ */ q("<!> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close active view</button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close other views</button> <!>", 1), pa = /* @__PURE__ */ q("<div role=\"menu\" tabindex=\"-1\"><!></div>"), ma = /* @__PURE__ */ q("<nav aria-label=\"Open graph views\"><div class=\"pc-graph-tab-list svelte-7ptwed\" role=\"tablist\" aria-label=\"Graph views\"></div> <button type=\"button\" class=\"pc-graph-view-overflow svelte-7ptwed\" aria-label=\"Graph view actions\" title=\"Focus, close or reopen graph views\" aria-haspopup=\"menu\">⋯</button> <!></nav>");
function ha(e, t) {
	Ve(t, !0);
	let n = wi(t, "actions", 19, () => ({})), r = wi(t, "idPrefix", 3, "pc-graph-view"), i = /* @__PURE__ */ L(null), a = /* @__PURE__ */ L(null), o = /* @__PURE__ */ L(null), s = /* @__PURE__ */ L(!1), c = /* @__PURE__ */ L(""), l = /* @__PURE__ */ L(""), u = /* @__PURE__ */ L(0), d = /* @__PURE__ */ L(0), f = "", p = /* @__PURE__ */ L(""), m = /* @__PURE__ */ L(""), h = /* @__PURE__ */ L(null), g = "", _ = null, v = 0, y = /* @__PURE__ */ F(() => t.views?.tabs.find((e) => e.key === W(l))), b = {};
	yn(() => {
		let e = t.views?.active.key ?? "";
		f === e ? t.views && !t.views.tabs.some((e) => e.key === W(c)) && R(c, e, !0) : (R(c, e, !0), O(), R(p, "")), W(l) && !W(y) && O(), W(p) && (t.views?.workflowId !== g || !t.views.tabs.some((e) => e.key === W(p))) && R(p, ""), f = e;
	});
	async function x(e) {
		let r = t.views?.tabs.find((t) => t.key === e);
		if (!r || r.identity.kind === "library" || !n().renameView || n().canRenameView?.(e) === !1) return;
		let i = ++v;
		_ = null, O(), g = t.views.workflowId, R(m, r.label, !0), R(p, e, !0), await lr(), W(p) === e && v === i && (_ = W(h), W(h)?.focus({ preventScroll: !0 }), W(h)?.select());
	}
	async function S(e, r, i = !0) {
		let a = W(p), o = t.views?.tabs.find((e) => e.key === a), s = W(m).trim();
		a && e === _ && (R(p, ""), _ = null, r && o && s && s !== o.label && t.views?.workflowId === g && o.identity.kind !== "library" && n().canRenameView?.(a) !== !1 && n().renameView?.(a, s), i && (await lr(), b[a]?.focus({ preventScroll: !0 })));
	}
	function C(e) {
		e.stopPropagation(), !e.isComposing && (e.key === "Enter" || e.key === "Escape") && (e.preventDefault(), S(e.currentTarget, e.key === "Enter"));
	}
	function w(e) {
		let t = e.breadcrumbs.map((e) => e.label).join(" / ") || e.label, n = e.identity;
		return n.kind === "instance" ? `${t} (${n.instancePath.map((e) => JSON.stringify(e)).join(" → ")})` : n.kind === "library" ? `${t} · Library v${n.definitionRef.version} (${n.definitionRef.id})` : t;
	}
	function T(e) {
		R(c, e, !0), n().focusView?.(e), b[e]?.focus({ preventScroll: !0 });
	}
	function E(e, n) {
		if (t.views && (e.key === "ContextMenu" || e.key === "F10" && e.shiftKey)) {
			e.preventDefault(), e.stopPropagation();
			let r = t.views.tabs[n], i = b[r.key]?.getBoundingClientRect();
			A(r, i?.left ?? 8, i?.bottom ?? 8);
			return;
		}
		if (!t.views || ![
			"ArrowLeft",
			"ArrowRight",
			"Home",
			"End",
			"Delete"
		].includes(e.key)) return;
		if (e.preventDefault(), e.stopPropagation(), e.key === "Delete") {
			t.views.tabs[n].identity.kind !== "root" && D(t.views.tabs[n]);
			return;
		}
		let r = e.key === "Home" ? 0 : e.key === "End" ? t.views.tabs.length - 1 : (n + (e.key === "ArrowLeft" ? t.views.tabs.length - 1 : 1)) % t.views.tabs.length;
		T(t.views.tabs[r].key);
	}
	async function D(e) {
		if (e.identity.kind === "root") return;
		n().closeView?.(e.key), await lr();
		let r = t.views?.active.key;
		r && t.views?.tabs.some((e) => e.key === r) && (R(c, r, !0), b[r]?.focus({ preventScroll: !0 }));
	}
	function O(e = !1) {
		let t = W(l) ? b[W(l)] : W(o);
		R(s, !1), R(l, ""), e && t?.focus({ preventScroll: !0 });
	}
	function k(e, t) {
		e.preventDefault(), e.stopPropagation(), A(t, e.clientX, e.clientY);
	}
	async function A(e, t, n) {
		if (R(l, e.key, !0), R(u, t, !0), R(d, n, !0), R(s, !0), await lr(), !W(s) || W(l) !== e.key) return;
		let r = W(a)?.getBoundingClientRect();
		R(u, Math.min(Math.max(8, t), Math.max(8, window.innerWidth - (r?.width ?? 0) - 8)), !0), R(d, Math.min(Math.max(8, n), Math.max(8, window.innerHeight - (r?.height ?? 0) - 8)), !0), W(a)?.querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
	}
	async function ee() {
		let e = !!W(l);
		R(l, ""), R(s, e || !W(s), !0), W(s) && (await lr(), W(s) && W(a)?.querySelector("button:not(:disabled)")?.focus());
	}
	function te(e) {
		if (e.stopPropagation(), e.key === "Escape") {
			e.preventDefault(), O(!0);
			return;
		}
		if (e.key === "Tab") {
			O();
			return;
		}
		if (![
			"ArrowDown",
			"ArrowUp",
			"Home",
			"End"
		].includes(e.key)) return;
		e.preventDefault();
		let t = [...W(a).querySelectorAll("button:not(:disabled)")], n = t.indexOf(e.target);
		t[e.key === "Home" ? 0 : e.key === "End" ? t.length - 1 : (n + (e.key === "ArrowUp" ? t.length - 1 : 1)) % t.length]?.focus();
	}
	function ne(e) {
		O(!0), e();
	}
	function j(e) {
		let t = W(y);
		t && (O(!0), e(t));
	}
	var re = { startRename: x }, ie = Ar();
	G("pointerdown", tn, (e) => {
		W(s) && !W(a)?.contains(e.target) && e.target !== W(o) && O();
	}), G("resize", tn, () => O());
	var ae = B(ie), oe = (e) => {
		var f = ma();
		let g;
		var _ = z(f);
		Z(_, 23, () => t.views.tabs, (e) => e.key, (e, n, i) => {
			var a = la();
			let o;
			var u = z(a);
			let d;
			var f = z(u), g = z(f, !0);
			P(f);
			var _ = V(f), v = (e) => {
				J(e, oa());
			};
			X(_, (e) => {
				W(n).readOnly && e(v);
			}), P(u), Ci(u, (e, t) => b[t.key] = e, (e) => b?.[e.key], () => [W(n)]);
			var y = V(u, 2), x = (e) => {
				var t = sa();
				Q(t);
				let r;
				Ci(t, (e) => R(h, e), () => W(h)), H(() => {
					r = ri(t, 1, "pc-graph-tab-rename svelte-7ptwed", null, r, { "pc-graph-tab-closeable": W(n).identity.kind !== "root" }), $(t, "aria-label", W(n).identity.kind === "root" ? "Graph name" : "Subgraph name"), $(t, "maxlength", W(n).identity.kind === "instance" ? 80 : void 0);
				}), K("keydown", t, C), G("blur", t, (e) => S(e.currentTarget, !0, !1)), yi(t, () => W(m), (e) => R(m, e)), J(e, t);
			};
			X(y, (e) => {
				W(p) === W(n).key && e(x);
			});
			var O = V(y, 2), A = (e) => {
				var r = ca();
				H((e, i) => {
					$(r, "aria-label", e), $(r, "title", i), $(r, "tabindex", W(n).key === (W(c) || t.views.active.key) ? 0 : -1);
				}, [() => `Close ${W(n).label} · ${w(W(n))}`, () => `Close ${w(W(n))}`]), K("click", r, () => D(W(n))), K("contextmenu", r, (e) => k(e, W(n))), K("keydown", r, (e) => E(e, W(i))), J(e, r);
			};
			X(O, (e) => {
				W(n).identity.kind !== "root" && e(A);
			}), P(a), H((e) => {
				o = ri(a, 1, "pc-graph-tab-item svelte-7ptwed", null, o, {
					"pc-graph-tab-active": W(n).key === t.views.active.key,
					"pc-graph-tab-editing": W(p) === W(n).key
				}), d = ri(u, 1, "pc-graph-tab svelte-7ptwed", null, d, { "pc-graph-tab-closeable": W(n).identity.kind !== "root" }), $(u, "id", `${r()}-${W(i)}`), $(u, "aria-controls", t.panelId), $(u, "aria-selected", W(n).key === t.views.active.key), $(u, "aria-expanded", W(s) && W(l) === W(n).key), $(u, "tabindex", W(p) !== W(n).key && W(n).key === (W(c) || t.views.active.key) ? 0 : -1), $(u, "title", e), Y(g, W(n).label);
			}, [() => w(W(n))]), K("click", u, () => T(W(n).key)), K("pointerdown", u, (e) => {
				e.button === 2 && e.preventDefault();
			}), K("contextmenu", u, (e) => k(e, W(n))), K("keydown", u, (e) => E(e, W(i))), J(e, a);
		}), P(_);
		var v = V(_, 2);
		Ci(v, (e) => R(o, e), () => W(o));
		var O = V(v, 2), A = (e) => {
			var r = pa();
			let i;
			var o = z(r), s = (e) => {
				let r = /* @__PURE__ */ F(() => W(y)), i = /* @__PURE__ */ F(() => n().canRenameView?.(W(r).key) === !1);
				var a = da(), o = B(a), s = V(o, 2), c = z(s, !0);
				P(s);
				var l = V(s, 2), u = z(l, !0);
				P(l);
				var d = V(l, 2), f = V(d, 2);
				Z(V(f, 2), 17, () => t.views.closedViews, (e) => e.key, (e, t) => {
					var r = ua(), i = z(r);
					P(r), H((e, a) => {
						r.disabled = !n().reopenView, $(r, "title", e), Y(i, `Reopen ${W(t).label ?? ""} · ${a ?? ""}`);
					}, [() => w(W(t)), () => w(W(t))]), K("click", r, () => ne(() => n().reopenView?.(W(t).key))), J(e, r);
				}), H((e) => {
					o.disabled = !n().saveView, s.disabled = !n().exportView, Y(c, W(r).identity.kind === "root" ? "Export workflow JSON" : "Export subgraph JSON"), l.disabled = W(r).identity.kind === "library" || W(i) || !n().renameView, $(l, "title", W(r).identity.kind === "library" ? "Library inspection is read only." : W(i) ? "Make a local copy of the containing graph to rename this subgraph." : void 0), Y(u, W(r).identity.kind === "root" ? "Rename graph" : "Rename subgraph"), d.disabled = W(r).identity.kind === "root" || !n().closeView, f.disabled = e;
				}, [() => t.views.tabs.every((e) => e.identity.kind === "root" || e.key === W(r).key) || !n().closeOtherViews]), K("click", o, () => j((e) => n().saveView?.(e.key))), K("click", s, () => j((e) => n().exportView?.(e.key))), K("click", l, () => j((e) => x(e.key))), K("click", d, () => j((e) => D(e))), K("click", f, () => j((e) => n().closeOtherViews?.(e.key))), J(e, a);
			}, c = (e) => {
				var r = fa(), i = B(r);
				Z(i, 17, () => t.views.tabs, (e) => e.key, (e, t) => {
					var n = ua(), r = z(n);
					P(n), H((e, t) => {
						$(n, "title", e), Y(r, `Focus ${t ?? ""}`);
					}, [() => w(W(t)), () => w(W(t))]), K("click", n, () => ne(() => T(W(t).key))), J(e, n);
				});
				var a = V(i, 2), o = V(a, 2);
				Z(V(o, 2), 17, () => t.views.closedViews, (e) => e.key, (e, t) => {
					var r = ua(), i = z(r);
					P(r), H((e, n) => {
						$(r, "title", e), Y(i, `Reopen ${W(t).label ?? ""} · ${n ?? ""}`);
					}, [() => w(W(t)), () => w(W(t))]), K("click", r, () => ne(() => n().reopenView?.(W(t).key))), J(e, r);
				}), H((e) => {
					a.disabled = t.views.active.identity.kind === "root" || !n().closeView, o.disabled = e;
				}, [() => t.views.tabs.every((e) => e.identity.kind === "root" || e.key === t.views.active.key) || !n().closeOtherViews]), K("click", a, () => ne(() => D(t.views.active))), K("click", o, () => ne(() => n().closeOtherViews?.(t.views.active.key))), J(e, r);
			};
			X(o, (e) => {
				W(y) ? e(s) : e(c, -1);
			}), P(r), Ci(r, (e) => R(a, e), () => W(a)), H(() => {
				i = ri(r, 1, "pc-graph-view-menu svelte-7ptwed", null, i, { "pc-graph-tab-menu": !!W(l) }), ai(r, W(l) ? `left: ${W(u)}px; top: ${W(d)}px;` : void 0), $(r, "aria-label", W(y) ? `Actions for ${W(y).label}` : "Graph view actions");
			}), K("keydown", r, te), J(e, r);
		};
		X(O, (e) => {
			W(s) && e(A);
		}), P(f), Ci(f, (e) => R(i, e), () => W(i)), H(() => {
			g = ri(f, 1, "pc-graph-tabs pc-graph-tabs-multi svelte-7ptwed", null, g, { "pc-graph-tabs-menu-open": W(s) }), $(v, "aria-expanded", W(s) && !W(l));
		}), K("click", v, ee), J(e, f);
	};
	return X(ae, (e) => {
		t.views && e(oe);
	}), J(e, ie), He(re);
}
yr([
	"click",
	"pointerdown",
	"contextmenu",
	"keydown"
]);
//#endregion
//#region ui/GraphBreadcrumbs.svelte
var ga = /* @__PURE__ */ q("<span aria-current=\"page\" class=\"svelte-18ovafz\"> </span>"), _a = /* @__PURE__ */ q("<button type=\"button\" class=\"svelte-18ovafz\"> </button>"), va = /* @__PURE__ */ q("<li class=\"svelte-18ovafz\"><!></li>"), ya = /* @__PURE__ */ q("<div class=\"pc-graph-location svelte-18ovafz\"><nav aria-label=\"Graph location\" class=\"svelte-18ovafz\"><ol class=\"svelte-18ovafz\"></ol></nav> <span class=\"pc-graph-scope svelte-18ovafz\"> <!><!></span></div>");
function ba(e, t) {
	Ve(t, !0);
	let n = wi(t, "actions", 19, () => ({})), r = /* @__PURE__ */ F(() => t.view?.identity.kind === "library" ? t.view.identity.definitionRef : t.definitionRef ?? t.view?.definitionRef);
	function i(e) {
		return e.identity.kind === "instance" ? !!n().openInstance : !!n().focusView;
	}
	function a(e) {
		e.identity.kind === "instance" ? n().openInstance?.(e.identity.instancePath) : n().focusView?.(e.key);
	}
	var o = Ar(), s = B(o), c = (e) => {
		var n = ya(), o = z(n), s = z(o);
		Z(s, 23, () => t.view.breadcrumbs, (e) => e.key, (e, n, r) => {
			var o = va(), s = z(o), c = (e) => {
				var t = ga(), r = z(t, !0);
				P(t), H(() => Y(r, W(n).label)), J(e, t);
			}, l = (e) => {
				var t = _a(), r = z(t, !0);
				P(t), H((e) => {
					t.disabled = e, Y(r, W(n).label);
				}, [() => !i(W(n))]), K("click", t, () => a(W(n))), J(e, t);
			};
			X(s, (e) => {
				W(r) === t.view.breadcrumbs.length - 1 ? e(c) : e(l, -1);
			}), P(o), J(e, o);
		}), P(s), P(o);
		var c = V(o, 2), l = z(c, !0), u = V(l), d = (e) => {
			var t = kr();
			H(() => Y(t, `· v${W(r).version ?? ""}`)), J(e, t);
		};
		X(u, (e) => {
			W(r) && e(d);
		});
		var f = V(u), p = (e) => {
			J(e, kr("· Read only"));
		};
		X(f, (e) => {
			(t.view.readOnly || t.view.identity.kind === "library") && e(p);
		}), P(c), P(n), H(() => {
			$(c, "title", W(r) ? `${W(r).id} · v${W(r).version} · ${W(r).semanticHash}` : void 0), Y(l, t.view.identity.kind === "library" ? "Library inspection" : "Instance graph");
		}), J(e, n);
	};
	X(s, (e) => {
		t.view && t.view.identity.kind !== "root" && e(c);
	}), J(e, o), He();
}
yr(["click"]);
//#endregion
//#region ui/StructuredControl.svelte
var xa = /* @__PURE__ */ q("<small class=\"svelte-taw2zx\">Rows are available when this JSON has a supported shape.</small>"), Sa = /* @__PURE__ */ q("<label class=\"svelte-taw2zx\"> </label><textarea class=\"pc-structured-raw svelte-taw2zx\" spellcheck=\"false\"></textarea> <!>", 1), Ca = /* @__PURE__ */ q("<option class=\"svelte-taw2zx\"> </option>"), wa = /* @__PURE__ */ q("<label class=\"svelte-taw2zx\">Phase</label><select class=\"svelte-taw2zx\"></select> <label class=\"svelte-taw2zx\">Steps</label><input type=\"number\" min=\"1\" max=\"64\" step=\"1\" class=\"svelte-taw2zx\"/>", 1), Ta = /* @__PURE__ */ q("<label class=\"svelte-taw2zx\">Name</label><input maxlength=\"128\" class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Value</label><input type=\"number\" step=\"any\" class=\"svelte-taw2zx\"/>", 1), Ea = /* @__PURE__ */ q("<label class=\"svelte-taw2zx\">Default (JSON)</label><textarea class=\"svelte-taw2zx\"></textarea>", 1), Da = /* @__PURE__ */ q("<label class=\"svelte-taw2zx\">Name</label><input class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Path (JSON array)</label><input class=\"svelte-taw2zx\"/> <label class=\"pc-structured-check svelte-taw2zx\"><input type=\"checkbox\" class=\"svelte-taw2zx\"/> Required</label> <label class=\"pc-structured-check svelte-taw2zx\"><input type=\"checkbox\" class=\"svelte-taw2zx\"/> Use default when missing</label><small class=\"svelte-taw2zx\">Defaults apply when Required is off.</small> <!>", 1), Oa = /* @__PURE__ */ q("<label class=\"svelte-taw2zx\">ID</label><input maxlength=\"128\" class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Label</label><input maxlength=\"80\" class=\"svelte-taw2zx\"/>", 1), ka = /* @__PURE__ */ q("<label class=\"svelte-taw2zx\">Name</label><input class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Text</label><textarea class=\"svelte-taw2zx\"></textarea>", 1), Aa = /* @__PURE__ */ q("<label class=\"svelte-taw2zx\">Kind</label><select class=\"svelte-taw2zx\"><option class=\"svelte-taw2zx\">Literal</option><option class=\"svelte-taw2zx\">Regular expression</option></select> <label class=\"svelte-taw2zx\">Pattern</label><input class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Replacement</label><textarea class=\"svelte-taw2zx\"></textarea> <label class=\"svelte-taw2zx\">Flags</label><input class=\"svelte-taw2zx\"/>", 1), ja = /* @__PURE__ */ q("<button type=\"button\" class=\"svelte-taw2zx\">Move up</button><button type=\"button\" class=\"svelte-taw2zx\">Move down</button>", 1), Ma = /* @__PURE__ */ q("<fieldset class=\"pc-structured-row svelte-taw2zx\"><legend class=\"svelte-taw2zx\"> </legend> <!> <div class=\"pc-structured-actions svelte-taw2zx\"><!><button type=\"button\" class=\"svelte-taw2zx\">Remove</button></div></fieldset>"), Na = /* @__PURE__ */ q("<div class=\"pc-structured-rows svelte-taw2zx\"></div> <button type=\"button\" class=\"svelte-taw2zx\"> </button>", 1), Pa = /* @__PURE__ */ q("<div class=\"pc-structured-control svelte-taw2zx\"><div class=\"pc-structured-mode svelte-taw2zx\"><button type=\"button\" class=\"svelte-taw2zx\"> </button></div> <!></div>");
function Fa(e, t) {
	Ve(t, !0);
	let n = wi(t, "disabled", 3, !1), r = wi(t, "error", 3, ""), i = [
		"onset",
		"peak",
		"plateau",
		"decline",
		"aftermath"
	];
	function a(e) {
		return !Object.hasOwn(e, "flags") || typeof e.flags == "string" && [...e.flags].every((t) => (e.kind === "regex" ? "imsu" : "iu").includes(t)) && new Set(e.flags).size === e.flags.length;
	}
	function o(e) {
		return typeof e == "number" ? Number.isFinite(e) : Array.isArray(e) ? e.every(o) : typeof e != "object" || !e || Object.values(e).every(o);
	}
	function s(e) {
		return typeof e == "object" && !!e && !Array.isArray(e);
	}
	let c = /* @__PURE__ */ F(() => t.control.structured === "fields" ? "field" : t.control.structured === "sections" ? "section" : t.control.structured === "slots" ? "slot" : t.control.structured === "numeric-map" ? "value" : t.control.structured === "durations" ? "duration" : "rule"), l = /* @__PURE__ */ F(() => t.control.structured === "fields" ? 128 : t.control.structured === "slots" ? 16 : t.control.structured === "numeric-map" ? 32 : t.control.structured === "durations" ? 5 : 64), u = /* @__PURE__ */ F(() => t.control.structured === "slots" ? 2 : 0);
	function d() {
		try {
			let e = JSON.parse(t.text);
			return o(e) ? t.control.structured === "durations" ? s(e) && Object.entries(e).every(([e, t]) => i.includes(e) && Number.isSafeInteger(t) && Number(t) >= 1 && Number(t) <= 64) ? Object.entries(e).map(([e, t]) => ({
				name: e,
				number: t
			})) : null : t.control.structured === "numeric-map" ? s(e) && Object.keys(e).length <= 32 && Object.values(e).every((e) => typeof e == "number" && Number.isFinite(e)) ? Object.entries(e).map(([e, t]) => ({
				name: e,
				number: t
			})) : null : !Array.isArray(e) || e.length > W(l) ? null : t.control.structured === "fields" ? e.every((e) => s(e) && Object.keys(e).every((e) => [
				"name",
				"path",
				"required",
				"default"
			].includes(e)) && typeof e.name == "string" && Array.isArray(e.path) && e.path.every((e) => typeof e == "string" || Number.isSafeInteger(e) && e >= 0) && (!Object.hasOwn(e, "required") || typeof e.required == "boolean")) ? e : null : t.control.structured === "sections" ? e.every((e) => s(e) && Object.keys(e).every((e) => ["name", "text"].includes(e)) && typeof e.name == "string" && typeof e.text == "string") ? e : null : t.control.structured === "slots" ? e.length >= 2 && e.every((e) => s(e) && Object.keys(e).every((e) => ["id", "label"].includes(e)) && typeof e.id == "string" && typeof e.label == "string") ? e : null : t.control.structured === "rules" && e.every((e) => s(e) && Object.keys(e).every((e) => [
				"kind",
				"pattern",
				"replacement",
				"flags"
			].includes(e)) && ["literal", "regex"].includes(String(e.kind)) && typeof e.pattern == "string" && (!Object.hasOwn(e, "replacement") || typeof e.replacement == "string") && a(e)) ? e : null : null;
		} catch {
			return null;
		}
	}
	let f = /* @__PURE__ */ F(d), p = /* @__PURE__ */ L(!1), m = /* @__PURE__ */ F(() => W(p) || !W(f));
	function h(e) {
		n() || (R(p, !0), t.ontext(e));
	}
	function g(e) {
		n() || t.ontext(JSON.stringify(e, null, 2));
	}
	function _(e) {
		g(["numeric-map", "durations"].includes(t.control.structured ?? "") ? Object.fromEntries(e.map((e) => [String(e.name), e.number])) : e);
	}
	function v(e, t, r) {
		!n() && W(f) && _(W(f).map((n, i) => i === e ? {
			...n,
			[t]: r
		} : n));
	}
	function y() {
		if (n() || !W(f) || W(f).length >= W(l)) return;
		let e = 1;
		for (; W(f).some((t) => t.name === W(c) + e || t.id === "context-" + e);) e++;
		_([...W(f), t.control.structured === "fields" ? {
			name: W(c) + e,
			path: []
		} : t.control.structured === "sections" ? {
			name: W(c) + e,
			text: ""
		} : t.control.structured === "slots" ? {
			id: "context-" + e,
			label: "Context " + e
		} : t.control.structured === "numeric-map" ? {
			name: W(c) + e,
			number: 0
		} : t.control.structured === "durations" ? {
			name: i.find((e) => !W(f).some((t) => t.name === e)),
			number: 1
		} : {
			kind: "literal",
			pattern: "text",
			replacement: ""
		}]);
	}
	function b(e, r) {
		let i = r.valueAsNumber;
		!n() && W(f) && (!Number.isFinite(i) || t.control.structured === "durations" && (!Number.isSafeInteger(i) || i < 1 || i > 64) ? r.value = String(W(f)[e].number) : v(e, "number", i));
	}
	function x(e, t) {
		!n() && W(f) && (!t.value.trim() || t.value.length > 128 || W(f).some((n, r) => r !== e && n.name === t.value) ? t.value = String(W(f)[e].name) : v(e, "name", t.value));
	}
	function S(e, r, i) {
		if (!n() && W(f)) try {
			let t = JSON.parse(i);
			if (!o(t)) throw Error("Nonfinite JSON");
			v(e, r, t);
		} catch {
			let n = 0, a = "__structured_json_0__";
			for (; t.text.includes(a);) a = "__structured_json_" + ++n + "__";
			let o = W(f).map((t, n) => n === e ? {
				...t,
				[r]: a
			} : t);
			R(p, !0), t.ontext(JSON.stringify(o, null, 2).replace(JSON.stringify(a), () => i));
		}
	}
	function C(e, t) {
		!n() && W(f) && _(W(f).map((n, r) => {
			if (r !== e) return n;
			let i = { ...n };
			return t ? i.default = null : delete i.default, i;
		}));
	}
	function w(e) {
		!n() && W(f) && W(f).length > W(u) && _(W(f).filter((t, n) => n !== e));
	}
	function T(e, t) {
		if (n() || !W(f) || e + t < 0 || e + t >= W(f).length) return;
		let r = [...W(f)];
		[r[e], r[e + t]] = [r[e + t], r[e]], _(r);
	}
	var E = Pa(), D = z(E), O = z(D), k = z(O, !0);
	P(O), P(D);
	var A = V(D, 2), ee = (e) => {
		var i = Sa(), a = B(i), o = z(a);
		P(a);
		var s = V(a);
		rt(s);
		var c = V(s, 2), l = (e) => {
			J(e, xa());
		};
		X(c, (e) => {
			W(f) || e(l);
		}), H(() => {
			$(a, "for", t.idPrefix + "-raw"), Y(o, `${t.control.label ?? ""} (JSON)`), $(s, "id", t.idPrefix + "-raw"), $(s, "aria-label", t.control.label), $(s, "aria-invalid", !!r()), $(s, "aria-describedby", r() ? t.idPrefix + "-error" : void 0), mi(s, t.text), s.disabled = n();
		}), K("input", s, (e) => h(e.currentTarget.value)), J(e, i);
	}, te = (e) => {
		var r = Na(), a = B(r);
		Z(a, 21, () => W(f), Br, (e, r, a) => {
			var o = Ma(), s = z(o), l = z(s);
			P(s);
			var d = V(s, 2), p = (e) => {
				var o = wa(), s = B(o), c = V(s);
				$(c, "aria-label", "Duration " + (a + 1) + " phase"), Z(c, 21, () => i, Br, (e, t) => {
					var n = Ca(), r = z(n, !0);
					P(n);
					var i = {};
					H((e, a) => {
						n.disabled = e, Y(r, a), i !== (i = W(t)) && (n.value = (n.__value = W(t)) ?? "");
					}, [() => W(f).some((e, n) => n !== a && e.name === W(t)), () => W(t)[0].toUpperCase() + W(t).slice(1)]), J(e, n);
				}), P(c);
				var l;
				si(c);
				var u = V(c, 2), d = V(u);
				Q(d), $(d, "aria-label", "Duration " + (a + 1) + " steps"), H((e, r) => {
					$(s, "for", t.idPrefix + "-phase-" + a), $(c, "id", t.idPrefix + "-phase-" + a), c.disabled = n(), l !== (l = e) && (c.value = (c.__value = e) ?? "", oi(c, e)), $(u, "for", t.idPrefix + "-steps-" + a), $(d, "id", t.idPrefix + "-steps-" + a), mi(d, r), d.disabled = n();
				}, [() => String(W(r).name), () => Number(W(r).number)]), K("change", c, (e) => x(a, e.currentTarget)), K("change", d, (e) => b(a, e.currentTarget)), J(e, o);
			}, m = (e) => {
				var i = Ta(), o = B(i), s = V(o);
				Q(s), $(s, "aria-label", "Value " + (a + 1) + " name");
				var c = V(s, 2), l = V(c);
				Q(l), $(l, "aria-label", "Value " + (a + 1) + " number"), H((e, r) => {
					$(o, "for", t.idPrefix + "-name-" + a), $(s, "id", t.idPrefix + "-name-" + a), mi(s, e), s.disabled = n(), $(c, "for", t.idPrefix + "-number-" + a), $(l, "id", t.idPrefix + "-number-" + a), mi(l, r), $(l, "min", t.control.min), $(l, "max", t.control.max), l.disabled = n();
				}, [() => String(W(r).name), () => Number(W(r).number)]), K("change", s, (e) => x(a, e.currentTarget)), K("change", l, (e) => b(a, e.currentTarget)), J(e, i);
			}, h = (e) => {
				var i = Da(), o = B(i), s = V(o);
				Q(s), $(s, "aria-label", "Field " + (a + 1) + " name");
				var c = V(s, 2), l = V(c);
				Q(l), $(l, "aria-label", "Field " + (a + 1) + " path (JSON array)");
				var u = V(l, 2), d = z(u);
				Q(d), $(d, "aria-label", "Field " + (a + 1) + " required"), Ae(), P(u);
				var f = V(u, 2), p = z(f);
				Q(p), $(p, "aria-label", "Field " + (a + 1) + " use default"), Ae(), P(f);
				var m = V(f, 3), h = (e) => {
					var i = Ea(), o = B(i), s = V(o);
					rt(s), $(s, "aria-label", "Field " + (a + 1) + " default (JSON)"), H((e) => {
						$(o, "for", t.idPrefix + "-default-" + a), $(s, "id", t.idPrefix + "-default-" + a), mi(s, e), s.disabled = n();
					}, [() => JSON.stringify(W(r).default, null, 2)]), K("change", s, (e) => S(a, "default", e.currentTarget.value)), J(e, i);
				}, g = /* @__PURE__ */ F(() => Object.hasOwn(W(r), "default"));
				X(m, (e) => {
					W(g) && e(h);
				}), H((e, i, u) => {
					$(o, "for", t.idPrefix + "-name-" + a), $(s, "id", t.idPrefix + "-name-" + a), mi(s, e), s.disabled = n(), $(c, "for", t.idPrefix + "-path-" + a), $(l, "id", t.idPrefix + "-path-" + a), mi(l, i), l.disabled = n(), hi(d, W(r).required !== !1), d.disabled = n(), hi(p, u), p.disabled = n();
				}, [
					() => String(W(r).name),
					() => JSON.stringify(W(r).path),
					() => Object.hasOwn(W(r), "default")
				]), K("input", s, (e) => v(a, "name", e.currentTarget.value)), K("change", l, (e) => S(a, "path", e.currentTarget.value)), K("change", d, (e) => v(a, "required", e.currentTarget.checked)), K("change", p, (e) => C(a, e.currentTarget.checked)), J(e, i);
			}, g = (e) => {
				var i = Oa(), o = B(i), s = V(o);
				Q(s), $(s, "aria-label", "Slot " + (a + 1) + " ID");
				var c = V(s, 2), l = V(c);
				Q(l), $(l, "aria-label", "Slot " + (a + 1) + " label"), H((e, r) => {
					$(o, "for", t.idPrefix + "-slot-id-" + a), $(s, "id", t.idPrefix + "-slot-id-" + a), mi(s, e), s.disabled = n(), $(c, "for", t.idPrefix + "-slot-label-" + a), $(l, "id", t.idPrefix + "-slot-label-" + a), mi(l, r), l.disabled = n();
				}, [() => String(W(r).id), () => String(W(r).label)]), K("input", s, (e) => v(a, "id", e.currentTarget.value)), K("input", l, (e) => v(a, "label", e.currentTarget.value)), J(e, i);
			}, _ = (e) => {
				var i = ka(), o = B(i), s = V(o);
				Q(s), $(s, "aria-label", "Section " + (a + 1) + " name");
				var c = V(s, 2), l = V(c);
				rt(l), $(l, "aria-label", "Section " + (a + 1) + " text"), H((e, r) => {
					$(o, "for", t.idPrefix + "-name-" + a), $(s, "id", t.idPrefix + "-name-" + a), mi(s, e), s.disabled = n(), $(c, "for", t.idPrefix + "-text-" + a), $(l, "id", t.idPrefix + "-text-" + a), mi(l, r), l.disabled = n();
				}, [() => String(W(r).name), () => String(W(r).text)]), K("input", s, (e) => v(a, "name", e.currentTarget.value)), K("input", l, (e) => v(a, "text", e.currentTarget.value)), J(e, i);
			}, y = (e) => {
				var i = Aa(), o = B(i), s = V(o);
				$(s, "aria-label", "Rule " + (a + 1) + " kind");
				var c = z(s);
				c.value = c.__value = "literal";
				var l = V(c);
				l.value = l.__value = "regex", P(s);
				var u;
				si(s);
				var d = V(s, 2), f = V(d);
				Q(f), $(f, "aria-label", "Rule " + (a + 1) + " pattern");
				var p = V(f, 2), m = V(p);
				rt(m), $(m, "aria-label", "Rule " + (a + 1) + " replacement");
				var h = V(m, 2), g = V(h);
				Q(g), $(g, "aria-label", "Rule " + (a + 1) + " flags"), H((e, r, i, c) => {
					$(o, "for", t.idPrefix + "-kind-" + a), $(s, "id", t.idPrefix + "-kind-" + a), s.disabled = n(), u !== (u = e) && (s.value = (s.__value = e) ?? "", oi(s, e)), $(d, "for", t.idPrefix + "-pattern-" + a), $(f, "id", t.idPrefix + "-pattern-" + a), mi(f, r), f.disabled = n(), $(p, "for", t.idPrefix + "-replacement-" + a), $(m, "id", t.idPrefix + "-replacement-" + a), mi(m, i), m.disabled = n(), $(h, "for", t.idPrefix + "-flags-" + a), $(g, "id", t.idPrefix + "-flags-" + a), mi(g, c), g.disabled = n();
				}, [
					() => String(W(r).kind),
					() => String(W(r).pattern),
					() => String(W(r).replacement ?? ""),
					() => String(W(r).flags ?? "")
				]), K("change", s, (e) => v(a, "kind", e.currentTarget.value)), K("input", f, (e) => v(a, "pattern", e.currentTarget.value)), K("input", m, (e) => v(a, "replacement", e.currentTarget.value)), K("input", g, (e) => v(a, "flags", e.currentTarget.value)), J(e, i);
			};
			X(d, (e) => {
				t.control.structured === "durations" ? e(p) : t.control.structured === "numeric-map" ? e(m, 1) : t.control.structured === "fields" ? e(h, 2) : t.control.structured === "slots" ? e(g, 3) : t.control.structured === "sections" ? e(_, 4) : e(y, -1);
			});
			var E = V(d, 2), D = z(E), O = (e) => {
				var t = ja(), r = B(t), i = V(r);
				H(() => {
					$(r, "aria-label", "Move " + W(c) + " " + (a + 1) + " up"), r.disabled = n() || a === 0, $(i, "aria-label", "Move " + W(c) + " " + (a + 1) + " down"), i.disabled = n() || a === W(f).length - 1;
				}), K("click", r, () => T(a, -1)), K("click", i, () => T(a, 1)), J(e, t);
			}, k = /* @__PURE__ */ F(() => !["numeric-map", "durations"].includes(t.control.structured ?? ""));
			X(D, (e) => {
				W(k) && e(O);
			});
			var A = V(D);
			P(E), P(o), H((e) => {
				Y(l, `${e ?? ""} ${a + 1}`), $(A, "aria-label", "Remove " + W(c) + " " + (a + 1)), A.disabled = n() || W(f).length <= W(u);
			}, [() => W(c)[0].toUpperCase() + W(c).slice(1)]), K("click", A, () => w(a)), J(e, o);
		}), P(a);
		var o = V(a, 2), s = z(o);
		P(o), H(() => {
			$(o, "aria-label", "Add " + W(c)), o.disabled = n() || W(f).length >= W(l), Y(s, `Add ${W(c) ?? ""}`);
		}), K("click", o, y), J(e, r);
	};
	X(A, (e) => {
		W(m) ? e(ee) : W(f) && e(te, 1);
	}), P(E), H(() => {
		$(E, "data-structured-control", t.control.structured), $(O, "aria-label", "Edit " + t.control.label + (W(m) ? " as rows" : " as JSON")), O.disabled = n() || W(m) && !W(f), Y(k, W(m) ? "Use rows" : "Edit JSON");
	}), K("click", O, () => {
		!n() && W(f) && R(p, !W(m));
	}), J(e, E), He();
}
yr([
	"click",
	"input",
	"change"
]);
//#endregion
//#region ui/DetailControl.svelte
var Ia = /* @__PURE__ */ q("<span class=\"pc-control-label svelte-16a137\"> </span> <!>", 1), La = /* @__PURE__ */ q("<label class=\"pc-detail-check svelte-16a137\"><input type=\"checkbox\" class=\"svelte-16a137\"/> </label>"), Ra = /* @__PURE__ */ q("<label class=\"svelte-16a137\"><input type=\"radio\" class=\"svelte-16a137\"/><span class=\"svelte-16a137\"> </span></label>"), za = /* @__PURE__ */ q("<span class=\"pc-control-label svelte-16a137\"> </span> <div class=\"pc-control-segments svelte-16a137\" role=\"radiogroup\"></div>", 1), Ba = /* @__PURE__ */ q("<option class=\"svelte-16a137\"> </option>"), Va = /* @__PURE__ */ q("<select class=\"svelte-16a137\"></select>"), Ha = /* @__PURE__ */ q("<input type=\"number\" class=\"svelte-16a137\"/>"), Ua = /* @__PURE__ */ q("<textarea class=\"svelte-16a137\"></textarea>"), Wa = /* @__PURE__ */ q("<input type=\"text\" class=\"svelte-16a137\"/>"), Ga = /* @__PURE__ */ q("<label class=\"svelte-16a137\"> </label> <!>", 1), Ka = /* @__PURE__ */ q("<button type=\"button\" class=\"svelte-16a137\"> </button>"), qa = /* @__PURE__ */ q("<small class=\"svelte-16a137\"> </small>"), Ja = /* @__PURE__ */ q("<p class=\"pc-detail-error svelte-16a137\" role=\"alert\"> </p>"), Ya = /* @__PURE__ */ q("<div><!> <!> <!> <!> <!></div>");
function Xa(e, t) {
	Ve(t, !0);
	let n = wi(t, "error", 3, ""), r = wi(t, "disabled", 3, !1), i = wi(t, "pending", 3, !1), a = () => t.control.editor === "enum" && (t.control.options?.length ?? 0) > 1 && (t.control.options?.length ?? 0) <= 3 && t.control.options.every((e) => e.label.length <= 10), o = () => t.control.effective !== void 0 && t.control.effective !== t.text && t.control.source !== "Saved setting" ? t.control.source : "";
	var s = Ya();
	let c;
	var l = z(s), u = (e) => {
		var i = Ia(), a = B(i), o = z(a, !0);
		P(a), Fa(V(a, 2), {
			get control() {
				return t.control;
			},
			get text() {
				return t.text;
			},
			get disabled() {
				return r();
			},
			get ontext() {
				return t.ontext;
			},
			get idPrefix() {
				return t.idPrefix;
			},
			get error() {
				return n();
			}
		}), H(() => Y(o, t.control.label)), J(e, i);
	}, d = (e) => {
		var n = La(), i = z(n);
		Q(i);
		var a = V(i, 1, !0);
		P(n), H((e) => {
			$(i, "aria-label", t.control.label), hi(i, e), i.disabled = r(), Y(a, t.control.label);
		}, [() => !!t.control.value]), K("change", i, (e) => {
			r() || t.onvalue(e.currentTarget.checked);
		}), J(e, n);
	}, f = (e) => {
		var n = za(), i = B(n), a = z(i, !0);
		P(i);
		var o = V(i, 2);
		Z(o, 21, () => t.control.options ?? [], (e) => e.value, (e, n) => {
			var i = Ra(), a = z(i);
			Q(a);
			var o = V(a), s = z(o, !0);
			P(o), P(i), H((e) => {
				$(a, "name", t.idPrefix + "-choice"), $(a, "aria-label", W(n).label), mi(a, W(n).value), hi(a, e), a.disabled = r(), Y(s, W(n).label);
			}, [() => String(t.control.value) === W(n).value]), K("change", a, (e) => {
				!r() && e.currentTarget.checked && t.onvalue(W(n).value);
			}), J(e, i);
		}), P(o), H(() => {
			Y(a, t.control.label), $(o, "aria-label", t.control.label);
		}), J(e, n);
	}, p = /* @__PURE__ */ F(() => a()), m = (e) => {
		var i = Ga(), a = B(i), o = z(a, !0);
		P(a);
		var s = V(a, 2), c = (e) => {
			var n = Va();
			Z(n, 21, () => t.control.options ?? [], (e) => e.value, (e, t) => {
				var n = Ba(), r = z(n, !0);
				P(n);
				var i = {};
				H(() => {
					Y(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
				}), J(e, n);
			}), P(n);
			var i;
			si(n), H((e) => {
				$(n, "id", t.idPrefix + "-editor"), $(n, "aria-label", t.control.label), n.disabled = r(), i !== (i = e) && (n.value = (n.__value = e) ?? "", oi(n, e));
			}, [() => String(t.control.value)]), K("change", n, (e) => {
				r() || t.onvalue(e.currentTarget.value);
			}), J(e, n);
		}, l = (e) => {
			var i = Ha();
			Q(i), H((e) => {
				$(i, "id", t.idPrefix + "-editor"), $(i, "aria-label", t.control.label), $(i, "min", t.control.min), $(i, "max", t.control.max), $(i, "step", t.control.step ?? 1), $(i, "aria-invalid", !!n()), $(i, "aria-describedby", n() ? t.idPrefix + "-error" : void 0), mi(i, e), i.disabled = r();
			}, [() => Number(t.control.value)]), K("change", i, (e) => {
				r() || t.onnumber(e.currentTarget);
			}), J(e, i);
		}, u = (e) => {
			var i = Ua();
			rt(i), H(() => {
				$(i, "id", t.idPrefix + "-editor"), $(i, "aria-label", t.control.label), $(i, "aria-invalid", !!n()), $(i, "aria-describedby", n() ? t.idPrefix + "-error" : void 0), mi(i, t.text), i.disabled = r();
			}), K("input", i, (e) => {
				r() || t.ontext(e.currentTarget.value);
			}), J(e, i);
		}, d = (e) => {
			var n = Wa();
			Q(n), H(() => {
				$(n, "id", t.idPrefix + "-editor"), $(n, "aria-label", t.control.label), mi(n, t.text), n.disabled = r();
			}), K("change", n, (e) => {
				r() || t.onvalue(e.currentTarget.value);
			}), J(e, n);
		}, f = /* @__PURE__ */ F(() => t.control.singleLine && t.control.editor === "text" && !t.text.includes("\n") && !t.text.includes("\r")), p = (e) => {
			var n = Ua();
			rt(n), H(() => {
				$(n, "id", t.idPrefix + "-editor"), $(n, "aria-label", t.control.label), mi(n, t.text), n.disabled = r();
			}), K("change", n, (e) => {
				r() || t.onvalue(e.currentTarget.value);
			}), J(e, n);
		};
		X(s, (e) => {
			t.control.editor === "enum" ? e(c) : t.control.editor === "number" ? e(l, 1) : t.control.editor === "json" || t.control.editor === "lines" ? e(u, 2) : W(f) ? e(d, 3) : e(p, -1);
		}), H(() => {
			$(a, "for", t.idPrefix + "-editor"), Y(o, t.control.label);
		}), J(e, i);
	};
	X(l, (e) => {
		t.control.structured && t.control.editor === "json" ? e(u) : t.control.editor === "boolean" ? e(d, 1) : W(p) ? e(f, 2) : e(m, -1);
	});
	var h = V(l, 2), g = (e) => {
		var n = Ka(), a = z(n, !0);
		P(n), H(() => {
			$(n, "data-save-control", t.control.key), n.disabled = r() || i(), Y(a, i() ? "Validating…" : "Save " + t.control.label);
		}), K("click", n, () => {
			!r() && !i() && t.onsave();
		}), J(e, n);
	};
	X(h, (e) => {
		(t.control.editor === "json" || t.control.editor === "lines") && e(g);
	});
	var _ = V(h, 2), v = (e) => {
		var n = qa(), r = z(n, !0);
		P(n), H(() => Y(r, t.control.help)), J(e, n);
	};
	X(_, (e) => {
		t.control.help && e(v);
	});
	var y = V(_, 2), b = (e) => {
		var n = qa(), r = z(n, !0);
		P(n), H(() => Y(r, t.control.exposureNote)), J(e, n);
	}, x = (e) => {
		var n = qa(), r = z(n);
		P(n), H((e) => Y(r, `${e ?? ""} · Effective: ${t.control.effective ?? ""}`), [() => o()]), J(e, n);
	}, S = /* @__PURE__ */ F(() => o());
	X(y, (e) => {
		t.control.exposureNote ? e(b) : W(S) && e(x, 1);
	});
	var C = V(y, 2), w = (e) => {
		var r = Ja(), i = z(r, !0);
		P(r), H(() => {
			$(r, "id", t.idPrefix + "-error"), Y(i, n());
		}), J(e, r);
	};
	X(C, (e) => {
		n() && e(w);
	}), P(s), H(() => c = ri(s, 1, "pc-detail-control svelte-16a137", null, c, { "pc-control-number": t.control.editor === "number" })), J(e, s), He();
}
yr([
	"change",
	"input",
	"click"
]);
//#endregion
//#region ui/ModifierStack.svelte
var Za = /* @__PURE__ */ q("<label class=\"svelte-1ibq9q\"><input type=\"checkbox\" class=\"svelte-1ibq9q\"/> </label>"), Qa = /* @__PURE__ */ q("<option class=\"svelte-1ibq9q\"> </option>"), $a = /* @__PURE__ */ q("<label class=\"pc-modifier-check svelte-1ibq9q\"><input type=\"checkbox\" class=\"svelte-1ibq9q\"/> </label>"), eo = /* @__PURE__ */ q("<select class=\"svelte-1ibq9q\"></select>"), to = /* @__PURE__ */ q("<input type=\"number\" class=\"svelte-1ibq9q\"/>"), no = /* @__PURE__ */ q("<textarea class=\"svelte-1ibq9q\"></textarea>"), ro = /* @__PURE__ */ q("<label class=\"svelte-1ibq9q\"> </label> <!>", 1), io = /* @__PURE__ */ q("<small class=\"svelte-1ibq9q\"> </small>"), ao = /* @__PURE__ */ q("<!> <!>", 1), oo = /* @__PURE__ */ q("<details class=\"svelte-1ibq9q\"><summary class=\"svelte-1ibq9q\"> <!></summary> <!> <button type=\"button\" class=\"svelte-1ibq9q\"> </button></details>"), so = /* @__PURE__ */ q("<p class=\"pc-modifier-error svelte-1ibq9q\" role=\"alert\"> </p>"), co = /* @__PURE__ */ q("<div class=\"pc-modifier-entry svelte-1ibq9q\"><div class=\"pc-modifier-heading svelte-1ibq9q\"><label class=\"svelte-1ibq9q\"><input type=\"checkbox\" class=\"svelte-1ibq9q\"/><span class=\"svelte-1ibq9q\"> <small class=\"svelte-1ibq9q\"> </small></span></label> <div class=\"pc-modifier-order svelte-1ibq9q\"><button type=\"button\" title=\"Move up\" class=\"svelte-1ibq9q\">↑</button> <button type=\"button\" title=\"Move down\" class=\"svelte-1ibq9q\">↓</button> <button type=\"button\" title=\"Remove\" class=\"svelte-1ibq9q\">×</button></div></div> <!> <!></div>"), lo = /* @__PURE__ */ q("<div class=\"pc-modifier-stack svelte-1ibq9q\"><small class=\"svelte-1ibq9q\"> </small> <!></div>"), uo = /* @__PURE__ */ q("<small role=\"status\" class=\"svelte-1ibq9q\">Validating modifiers…</small>"), fo = /* @__PURE__ */ q("<section class=\"pc-modifiers svelte-1ibq9q\" data-modifier-controls=\"\" aria-label=\"Text modifiers\"><div class=\"pc-modifier-quick svelte-1ibq9q\"><!> <select aria-label=\"Add text modifier\" class=\"svelte-1ibq9q\"><option class=\"svelte-1ibq9q\">Add modifier…</option><!></select></div> <!> <!> <!></section>");
function po(e, t) {
	Ve(t, !0);
	let n = (e) => t.options.find((t) => t.type === e.type), r = (e) => n(e)?.label ?? e.type, i = (e) => t.drafts[e.id]?.settings ?? e.settings, a = (e) => t.disabled || t.busy || !t.options.some((t) => t.type === e) || t.items.length >= 16 && !t.items.some((t) => t.type === e);
	var o = fo(), s = z(o), c = z(s);
	Z(c, 16, () => ["trim", "wrap"], Br, (e, n) => {
		var r = Za(), i = z(r);
		Q(i);
		var o = V(i, 1, !0);
		P(r), H((e, t) => {
			$(i, "aria-label", (n === "trim" ? "Trim" : "Wrap") + " output"), hi(i, e), i.disabled = t, Y(o, n === "trim" ? "Trim" : "Wrap");
		}, [() => t.items.some((e) => e.type === n && e.enabled), () => a(n)]), K("change", i, (e) => {
			a(n) || t.onquick(n, e.currentTarget.checked);
		}), J(e, r);
	});
	var l = V(c, 2), u = z(l);
	u.value = u.__value = "", Z(V(u), 17, () => t.options.filter((e) => !["trim", "wrap"].includes(e.type)), (e) => e.type, (e, t) => {
		var n = Qa(), r = z(n, !0);
		P(n);
		var i = {};
		H(() => {
			Y(r, W(t).label), i !== (i = W(t).type) && (n.value = (n.__value = W(t).type) ?? "");
		}), J(e, n);
	}), P(l), l.value = l.__value = "", P(s);
	var d = V(s, 2), f = (e) => {
		var a = lo(), o = z(a), s = z(o);
		P(o), Z(V(o, 2), 19, () => t.items, (e) => e.id, (e, a, o) => {
			let s = /* @__PURE__ */ F(() => n(W(a))), c = /* @__PURE__ */ F(() => r(W(a))), l = /* @__PURE__ */ F(() => t.drafts[W(a).id]);
			var u = co(), d = z(u), f = z(d), p = z(f);
			Q(p);
			var m = V(p), h = z(m), g = V(h), _ = z(g, !0);
			P(g), P(m), P(f);
			var v = V(f, 2), y = z(v), b = V(y, 2), x = V(b, 2);
			P(v), P(d);
			var S = V(d, 2), C = (e) => {
				var n = oo(), r = z(n), o = z(r), u = V(o), d = (e) => {
					J(e, kr("· Unsaved"));
				};
				X(u, (e) => {
					W(l)?.dirty && e(d);
				}), P(r);
				var f = V(r, 2);
				Z(f, 17, () => W(s).fields, (e) => e.key, (e, n) => {
					let r = /* @__PURE__ */ F(() => t.idPrefix + "-modifier-" + W(a).id + "-" + W(n).key);
					var o = ao(), s = B(o), l = (e) => {
						var o = $a(), s = z(o);
						Q(s);
						var l = V(s, 1, !0);
						P(o), H((e) => {
							$(s, "id", W(r)), $(s, "aria-label", W(c) + " " + W(n).label), hi(s, e), s.disabled = t.disabled, Y(l, W(n).label);
						}, [() => !!i(W(a))[W(n).key]]), K("change", s, (e) => {
							t.disabled || t.ondraft(W(a).id, W(n).key, e.currentTarget.checked);
						}), J(e, o);
					}, u = (e) => {
						var o = ro(), s = B(o), l = z(s, !0);
						P(s);
						var u = V(s, 2), d = (e) => {
							var o = eo();
							Z(o, 21, () => W(n).options ?? [], (e) => e.value, (e, t) => {
								var n = Qa(), r = z(n, !0);
								P(n);
								var i = {};
								H(() => {
									Y(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
								}), J(e, n);
							}), P(o);
							var s;
							si(o), H((e) => {
								$(o, "id", W(r)), $(o, "aria-label", W(c) + " " + W(n).label), o.disabled = t.disabled, s !== (s = e) && (o.value = (o.__value = e) ?? "", oi(o, e));
							}, [() => String(i(W(a))[W(n).key] ?? "")]), K("change", o, (e) => {
								t.disabled || t.ondraft(W(a).id, W(n).key, e.currentTarget.value);
							}), J(e, o);
						}, f = (e) => {
							var o = to();
							Q(o), H((e) => {
								$(o, "id", W(r)), $(o, "aria-label", W(c) + " " + W(n).label), $(o, "min", W(n).min), $(o, "max", W(n).max), $(o, "step", W(n).step ?? 1), mi(o, e), o.disabled = t.disabled;
							}, [() => String(i(W(a))[W(n).key] ?? "")]), K("input", o, (e) => {
								t.disabled || t.ondraft(W(a).id, W(n).key, e.currentTarget.value ? Number(e.currentTarget.value) : null);
							}), J(e, o);
						}, p = (e) => {
							var o = no();
							rt(o), H((e) => {
								$(o, "id", W(r)), $(o, "aria-label", W(c) + " " + W(n).label), mi(o, e), o.disabled = t.disabled;
							}, [() => String(i(W(a))[W(n).key] ?? "")]), K("input", o, (e) => {
								t.disabled || t.ondraft(W(a).id, W(n).key, e.currentTarget.value);
							}), J(e, o);
						};
						X(u, (e) => {
							W(n).editor === "enum" ? e(d) : W(n).editor === "number" ? e(f, 1) : e(p, -1);
						}), H(() => {
							$(s, "for", W(r)), Y(l, W(n).label);
						}), J(e, o);
					};
					X(s, (e) => {
						W(n).editor === "boolean" ? e(l) : e(u, -1);
					});
					var d = V(s, 2), f = (e) => {
						var t = io(), r = z(t, !0);
						P(t), H(() => Y(r, W(n).help)), J(e, t);
					};
					X(d, (e) => {
						W(n).help && e(f);
					}), J(e, o);
				});
				var p = V(f, 2), m = z(p, !0);
				P(p), P(n), H(() => {
					n.open = !!W(l)?.dirty || !!W(l)?.error, Y(o, `${W(c) ?? ""} settings`), $(p, "aria-label", "Save " + W(c) + " settings"), p.disabled = t.disabled || !!W(l)?.pending || !W(l)?.dirty, Y(m, W(l)?.pending ? "Validating…" : "Save settings");
				}), K("click", p, () => {
					!t.disabled && !W(l)?.pending && W(l)?.dirty && t.onsave(W(a).id);
				}), J(e, n);
			};
			X(S, (e) => {
				W(s)?.fields.length && e(C);
			});
			var w = V(S, 2), T = (e) => {
				var t = so(), n = z(t, !0);
				P(t), H(() => Y(n, W(l).error)), J(e, t);
			};
			X(w, (e) => {
				W(l)?.error && e(T);
			}), P(u), H(() => {
				$(u, "data-modifier-id", W(a).id), $(u, "data-modifier-state", W(a).enabled ? "active" : "disabled"), $(p, "aria-label", "Enable " + W(c) + " modifier"), hi(p, W(a).enabled), p.disabled = t.disabled || t.busy, Y(h, `${W(o) + 1}. ${W(c) ?? ""}`), Y(_, W(a).enabled ? "Active" : "Disabled"), $(y, "aria-label", "Move " + W(c) + " up"), y.disabled = t.disabled || t.busy || W(o) === 0, $(b, "aria-label", "Move " + W(c) + " down"), b.disabled = t.disabled || t.busy || W(o) === t.items.length - 1, $(x, "aria-label", "Remove " + W(c) + " modifier"), x.disabled = t.disabled || t.busy;
			}), K("change", p, (e) => {
				!t.disabled && !t.busy && t.onenable(W(a).id, e.currentTarget.checked);
			}), K("click", y, () => {
				!t.disabled && !t.busy && W(o) > 0 && t.onmove(W(a).id, -1);
			}), K("click", b, () => {
				!t.disabled && !t.busy && W(o) < t.items.length - 1 && t.onmove(W(a).id, 1);
			}), K("click", x, () => {
				!t.disabled && !t.busy && t.onremove(W(a).id);
			}), J(e, u);
		}), P(a), H((e) => Y(s, `${e ?? ""} active · ${t.items.length ?? ""} total · Applied in order`), [() => t.items.filter((e) => e.enabled).length]), J(e, a);
	};
	X(d, (e) => {
		t.items.length && e(f);
	});
	var p = V(d, 2), m = (e) => {
		J(e, uo());
	};
	X(p, (e) => {
		t.busy && e(m);
	});
	var h = V(p, 2), g = (e) => {
		var n = so(), r = z(n, !0);
		P(n), H(() => Y(r, t.error)), J(e, n);
	};
	X(h, (e) => {
		t.error && e(g);
	}), P(o), H(() => l.disabled = t.disabled || t.busy || t.items.length >= 16), K("change", l, (e) => {
		let n = e.currentTarget.value;
		e.currentTarget.value = "", !t.disabled && !t.busy && t.items.length < 16 && n && t.onadd(n);
	}), J(e, o), He();
}
yr([
	"change",
	"click",
	"input"
]);
//#endregion
//#region ui/NodeDetails.svelte
var mo = /* @__PURE__ */ q("<small data-canonical-title=\"\" class=\"svelte-59ntjv\"> </small>"), ho = /* @__PURE__ */ q("<button type=\"button\" class=\"svelte-59ntjv\">Duplicate</button>"), go = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-detail-danger svelte-59ntjv\">Delete</button>"), _o = /* @__PURE__ */ q("<details class=\"pc-detail-commands svelte-59ntjv\"><summary aria-label=\"Node commands\" title=\"Node commands\" class=\"svelte-59ntjv\">⋯</summary><div class=\"pc-detail-command-list svelte-59ntjv\"><!> <!></div></details>"), vo = /* @__PURE__ */ q("<p role=\"alert\" class=\"pc-detail-error svelte-59ntjv\"> </p>"), yo = /* @__PURE__ */ q("<label class=\"svelte-59ntjv\">Workflow stage<select aria-label=\"Workflow stage\" class=\"svelte-59ntjv\"><option class=\"svelte-59ntjv\">Preparation · before Generate Reply</option><option class=\"svelte-59ntjv\">Response · after Generate Reply</option></select></label><!>", 1), bo = /* @__PURE__ */ q("<p class=\"svelte-59ntjv\"><button type=\"button\" class=\"svelte-59ntjv\">Configure Fast connections…</button></p>"), xo = /* @__PURE__ */ q("<span class=\"svelte-59ntjv\">Read-only body</span>"), So = /* @__PURE__ */ q("<span class=\"pc-detail-blocked svelte-59ntjv\">Blocks run · Disabled</span>"), Co = /* @__PURE__ */ q("<p class=\"pc-detail-state svelte-59ntjv\"><!><!></p>"), wo = /* @__PURE__ */ q("<p class=\"pc-detail-error svelte-59ntjv\" role=\"alert\"> </p>"), To = /* @__PURE__ */ q("<option class=\"svelte-59ntjv\"> </option>"), Eo = /* @__PURE__ */ q("<fieldset class=\"pc-detail-group svelte-59ntjv\" data-boundary-controls=\"\"><legend class=\"svelte-59ntjv\"> </legend> <label class=\"svelte-59ntjv\">Type<select aria-label=\"Subgraph port type\" class=\"svelte-59ntjv\"></select></label> <label class=\"pc-detail-check svelte-59ntjv\"><input aria-label=\"Required subgraph port\" type=\"checkbox\" class=\"svelte-59ntjv\"/> Required</label> <div class=\"pc-detail-actions svelte-59ntjv\"><button type=\"button\" data-save-boundary=\"\" class=\"svelte-59ntjv\"> </button></div> <small class=\"svelte-59ntjv\">Labels appear on the subgraph block. Disconnect incompatible connections before changing the type. Deleting this node removes its port and attached connections.</small> <!></fieldset>"), Do = /* @__PURE__ */ q("<p role=\"status\" class=\"svelte-59ntjv\">Loading file…</p>"), Oo = /* @__PURE__ */ q("<div data-file-input-controls=\"\" class=\"svelte-59ntjv\"><label class=\"svelte-59ntjv\"> <input type=\"file\" accept=\".txt,.md,.json,text/plain,text/markdown,application/json\" class=\"svelte-59ntjv\"/></label> <p class=\"svelte-59ntjv\"> </p> <small class=\"svelte-59ntjv\">The file's UTF-8 text is embedded in this workflow. Runs use the saved snapshot; replace the file to refresh it.</small> <small class=\"svelte-59ntjv\">Choose a .txt, .md or .json file up to 400,000 bytes and 100,000 UTF-16 code units.</small> <!> <!></div>"), ko = /* @__PURE__ */ q("<details class=\"pc-detail-group svelte-59ntjv\"><summary class=\"svelte-59ntjv\"> </summary> <!></details>"), Ao = /* @__PURE__ */ q("<fieldset class=\"pc-detail-group pc-detail-main svelte-59ntjv\" data-operation-controls=\"\"><!> <!></fieldset> <!>", 1), jo = /* @__PURE__ */ q("<label class=\"svelte-59ntjv\">Model identifier<input class=\"svelte-59ntjv\"/></label>"), Mo = /* @__PURE__ */ q("<small class=\"svelte-59ntjv\"> </small>"), No = /* @__PURE__ */ q("<fieldset class=\"svelte-59ntjv\"><legend class=\"svelte-59ntjv\"> </legend> <label class=\"svelte-59ntjv\">Connection profile<select class=\"svelte-59ntjv\"><option class=\"svelte-59ntjv\">Use helper connection</option><!><!></select></label> <label class=\"svelte-59ntjv\">Model mode<select class=\"svelte-59ntjv\"></select></label> <!> <small class=\"svelte-59ntjv\"> </small><small class=\"svelte-59ntjv\"> </small><!> <!></fieldset>"), Po = /* @__PURE__ */ q("<small class=\"svelte-59ntjv\">This helper has no text model calls to configure.</small>"), Fo = /* @__PURE__ */ q("<details class=\"pc-detail-group svelte-59ntjv\" data-helper-model-controls=\"\" open=\"\"><summary class=\"svelte-59ntjv\">Helper model bindings</summary> <small class=\"svelte-59ntjv\">Choose a connection for each text model role in the pinned helper. These selections belong to this For Each node.</small> <!> <!></details>"), Io = /* @__PURE__ */ q("<label class=\"svelte-59ntjv\">Model identifier<input aria-label=\"Model identifier\" class=\"svelte-59ntjv\"/></label>"), Lo = /* @__PURE__ */ q("<details class=\"pc-detail-group svelte-59ntjv\" data-model-controls=\"\" open=\"\"><summary class=\"svelte-59ntjv\"> </summary> <label class=\"svelte-59ntjv\">Connection profile<select aria-label=\"Connection profile\" class=\"svelte-59ntjv\"><option class=\"svelte-59ntjv\">Choose a connection</option><!><!></select></label> <label class=\"svelte-59ntjv\">Model mode<select aria-label=\"Model mode\" class=\"svelte-59ntjv\"></select></label> <!> <details data-binding-advanced=\"\" class=\"svelte-59ntjv\"><summary class=\"svelte-59ntjv\">Advanced connection settings</summary> <label class=\"svelte-59ntjv\">Connection mode<select aria-label=\"Connection mode\" class=\"svelte-59ntjv\"></select></label> <label class=\"svelte-59ntjv\">Model role<input aria-label=\"Model role\" class=\"svelte-59ntjv\"/></label></details> <!><!> <!> <!></details>"), Ro = /* @__PURE__ */ q("<p class=\"pc-detail-port svelte-59ntjv\"> <small class=\"svelte-59ntjv\"> </small></p>"), zo = /* @__PURE__ */ q("<details class=\"pc-detail-group svelte-59ntjv\"><summary class=\"svelte-59ntjv\">Inputs and outputs</summary><!></details>"), Bo = /* @__PURE__ */ q("<p role=\"status\" class=\"svelte-59ntjv\"> </p>"), Vo = /* @__PURE__ */ q("<header class=\"svelte-59ntjv\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-59ntjv\"><path class=\"svelte-59ntjv\"></path></svg> <div class=\"pc-detail-identity svelte-59ntjv\"><input class=\"pc-detail-name svelte-59ntjv\" aria-label=\"Node name\"/> <!> <small class=\"svelte-59ntjv\"> </small></div> <!></header> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>", 1), Ho = /* @__PURE__ */ q("<p class=\"pc-detail-empty svelte-59ntjv\">Select a node to inspect its settings.</p>"), Uo = /* @__PURE__ */ q("<section class=\"pc-node-details svelte-59ntjv\" aria-label=\"Node details\"><!></section>");
function Wo(e, t) {
	Ve(t, !0);
	let n = (e, n = d) => {
		{
			let s = /* @__PURE__ */ F(() => W(a)[n().key]?.text ?? k(n())), c = /* @__PURE__ */ F(() => W(a)[n().key]?.error || W(o)[n().key] || ""), l = /* @__PURE__ */ F(() => !!t.view?.readOnly || !r().editControl), u = /* @__PURE__ */ F(() => !!W(a)[n().key]?.pending), d = /* @__PURE__ */ F(() => i() + "-" + n().key);
			Xa(e, {
				get control() {
					return n();
				},
				get text() {
					return W(s);
				},
				get error() {
					return W(c);
				},
				get disabled() {
					return W(l);
				},
				get pending() {
					return W(u);
				},
				get idPrefix() {
					return W(d);
				},
				ontext: (e) => j(n(), e),
				onvalue: (e) => ie(n(), e),
				onnumber: (e) => ae(n(), e),
				onsave: () => re(n())
			});
		}
	}, r = wi(t, "actions", 19, () => ({})), i = wi(t, "idPrefix", 3, "pc-node-details"), a = /* @__PURE__ */ L(Qt({})), o = /* @__PURE__ */ L(Qt({})), s = "", c = "", l = "", u = 0, f = 0, p = 0, h = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ L(!1), _ = 0, v = 0, y = 0, b = /* @__PURE__ */ new Map(), x = /* @__PURE__ */ new Map(), S = /* @__PURE__ */ new Map(), C = (e) => Object.fromEntries(Object.entries(e).map(([e, t]) => [e, {
		...t,
		pending: !1
	}]));
	function w(e, t) {
		return t ? Object.fromEntries(Object.entries(C(e)).flatMap(([e, n]) => {
			if (e.startsWith("[\"helper-binding\",")) {
				let r = JSON.parse(e);
				return t.helperBindings?.roles.find((e) => e.role === r[1]) && r[2] === "model" && t.helperBindings?.editable && n.helperKey === t.helperBindings.helperKey ? [[e, n]] : [];
			}
			if (e === "model" || e === "profileId") return (e === "model" ? t.model?.model : t.model?.profile)?.allowedModes.some((e) => e.value === "override") ? [[e, n]] : [];
			if (e === "boundary") return t.boundary && n.boundaryId === t.boundary.id && n.boundaryDirection === t.boundary.direction ? [[e, {
				...n,
				artifactKind: t.boundary.kinds.includes(n.artifactKind ?? "") ? n.artifactKind : t.boundary.kind
			}]] : [];
			if (e === "fileInput") return t.fileInput ? [[e, n]] : [];
			if (e.startsWith("modifier:")) {
				let r = t.modifiers?.items.find((t) => "modifier:" + t.id === e);
				return r && r.type === n.modifierType && t.modifiers?.options.some((e) => e.type === r.type) ? [[e, n]] : [];
			}
			return t.controls.some((t) => t.key === e && t.editor === n.editor && t.representation === n.representation && (t.editor === "json" || t.editor === "lines")) ? [[e, n]] : [];
		})) : {};
	}
	let T = (e) => JSON.stringify([e.selectionKey, "kind" in e.address ? [
		e.address.kind,
		e.address.definitionRef.id,
		e.address.definitionRef.version,
		e.address.definitionRef.semanticHash,
		e.address.nodeId
	] : [
		e.address.workflowId,
		e.address.instancePath,
		e.address.nodeId
	]]), E = !0;
	Ei(() => {
		E = !1, h.clear(), S.clear(), x.clear(), b.clear();
	}), yn(() => {
		let e = t.view ? T(t.view) : "", n = t.view?.revision ?? "", r = JSON.stringify([
			t.view?.controls.map((e) => [
				e.key,
				e.editor,
				e.representation
			]),
			t.view?.model?.profile.allowedModes,
			t.view?.model?.model.allowedModes,
			t.view?.model?.editable,
			t.view?.helperBindings && [
				t.view.helperBindings.helperKey,
				t.view.helperBindings.editable,
				t.view.helperBindings.roles.map((e) => [e.role, e.model.allowedModes])
			],
			t.view?.boundary && [
				t.view.boundary.id,
				t.view.boundary.direction,
				t.view.boundary.kinds
			],
			!!t.view?.fileInput,
			t.view?.modifiers && [
				t.view.modifiers.items.map((e) => [e.id, e.type]).sort(([e], [t]) => e.localeCompare(t)),
				t.view.modifiers.options.map((e) => [e.type, e.fields.map((e) => [e.key, e.editor])]),
				t.view.modifiers.editable,
				t.view.readOnly
			]
		]), i = e !== s;
		(i || n !== c || r !== l) && ((i || r !== l) && (f++, y++), i && (p++, s && S.set(s, fr(() => C(W(a))))), s = e, c = n, l = r, h.clear(), u++, R(o, {}, !0), R(g, !1), v++, R(a, w(i ? S.get(e) ?? {} : fr(() => W(a)), t.view), !0));
	});
	let D = (e) => ({
		selectionKey: e.selectionKey,
		revision: e.revision,
		address: "kind" in e.address ? {
			...e.address,
			definitionRef: { ...e.address.definitionRef }
		} : {
			...e.address,
			instancePath: [...e.address.instancePath]
		}
	}), O = (e) => E && !!t.view && t.view.selectionKey === e.selectionKey && t.view.revision === e.revision && T(t.view) === T(e);
	function k(e) {
		return e.editor === "json" ? e.representation === "json-text" ? String(e.value ?? "") : JSON.stringify(e.value, null, 2) : e.editor === "lines" && Array.isArray(e.value) ? e.value.join("\n") : String(e.value ?? "");
	}
	function A(e, t) {
		if (t.startsWith("[\"helper-binding\",")) {
			let n = JSON.parse(t);
			return e.helperBindings?.editable && e.helperBindings.roles.some((e) => e.role === n[1]) ? JSON.stringify([
				"helper-binding",
				e.helperBindings.helperKey,
				n[1],
				n[2]
			]) : null;
		}
		if (t === "model" || t === "profileId") return (t === "model" ? e.model?.model : e.model?.profile)?.allowedModes.some((e) => e.value === "override") ? JSON.stringify([
			"binding",
			t,
			e.model?.editable ?? !e.readOnly
		]) : null;
		let n = e.controls.find((e) => e.key === t);
		return n && (n.editor === "json" || n.editor === "lines") ? JSON.stringify([
			n.editor,
			n.representation,
			n.allowEmpty,
			n.structured
		]) : null;
	}
	function ee(e) {
		let t = (x.get(e) ?? 0) + 1;
		return x.set(e, t), t;
	}
	async function te(e, n, r) {
		let i = t.view;
		if (!i || (n ? !i.canPresent : e === "profileId" || e === "model" ? !ge(i) : i.readOnly)) return;
		let s = D(i), c = ++u, l = p, d = A(i, e), f = W(a)[e] && d ? ee(e) : null;
		h.set(e, c), R(o, {
			...W(o),
			[e]: ""
		}, !0), W(a)[e] && R(a, {
			...W(a),
			[e]: {
				...W(a)[e],
				pending: !0,
				error: ""
			}
		}, !0);
		let m = "", g = !1;
		try {
			let e = await r(s);
			g = e.ok, e.ok || (m = e.error.code + ": " + e.error.message);
		} catch {
			m = "The edit could not be accepted. Please try again.";
		}
		if (g && f !== null && W(a)[e] && E && t.view && p === l && T(t.view) === T(s) && x.get(e) === f && A(t.view, e) === d) {
			let t = { ...W(a) };
			delete t[e], R(a, t, !0);
		}
		if (O(s) && h.get(e) === c && (h.delete(e), R(o, {
			...W(o),
			[e]: m
		}, !0), W(a)[e])) {
			if (m) R(a, {
				...W(a),
				[e]: {
					...W(a)[e],
					error: m,
					pending: !1
				}
			}, !0);
			else {
				let t = { ...W(a) };
				delete t[e], R(a, t, !0);
			}
		}
	}
	function ne(e) {
		let n = e.files?.[0];
		e.value = "", n && t.view?.fileInput && !t.view.readOnly && r().loadFile && !W(a).fileInput?.pending && (R(a, {
			...W(a),
			fileInput: {
				text: "",
				error: "",
				pending: !1
			}
		}, !0), te("fileInput", !1, (e) => r().loadFile(e, n)));
	}
	function j(e, n) {
		t.view && !t.view.readOnly && (ee(e.key), h.delete(e.key), R(a, {
			...W(a),
			[e.key]: {
				text: n,
				error: "",
				pending: !1,
				editor: e.editor,
				representation: e.representation
			}
		}, !0), R(o, {
			...W(o),
			[e.key]: ""
		}, !0));
	}
	function re(e) {
		if (!t.view || t.view.readOnly || !r().editControl) return;
		let n = W(a)[e.key]?.text ?? k(e), i = n;
		if (e.editor === "json") try {
			if (!(e.representation === "json-text" && e.allowEmpty && n.trim() === "")) {
				let t = JSON.parse(n);
				e.representation !== "json-text" && (i = t);
			}
		} catch {
			R(a, {
				...W(a),
				[e.key]: {
					text: n,
					error: "Enter valid JSON before saving.",
					pending: !1,
					editor: e.editor,
					representation: e.representation
				}
			}, !0);
			return;
		}
		else e.editor === "lines" && (i = n.split("\n").filter((e) => e.trim()));
		te(e.key, !1, (t) => r().editControl(t, e.key, i));
	}
	function ie(e, t) {
		r().editControl && te(e.key, !1, (n) => r().editControl(n, e.key, t));
	}
	function ae(e, n) {
		if (!t.view || t.view.readOnly || !r().editControl) return;
		let i = Number(n.value);
		!n.value.trim() || !Number.isFinite(i) ? R(o, {
			...W(o),
			[e.key]: "Enter a finite number before saving."
		}, !0) : n.validity.valid ? ie(e, i) : R(o, {
			...W(o),
			[e.key]: "Enter a number within the allowed range and step."
		}, !0);
	}
	let oe = (e, t) => JSON.stringify([
		"helper-binding",
		e,
		t
	]), se = (e) => t.view?.helperBindings?.roles.find((t) => t.role === e), ce = () => !!t.view?.helperBindings?.editable && !t.view.readOnly && !!r().editHelperBinding, le = (e) => W(a)[oe(e, "model")] ? "override" : se(e)?.model.mode;
	function ue(e, t, n, i) {
		ce() && se(e) && te(oe(e, t), !1, (a) => r().editHelperBinding(a, e, t, n, i));
	}
	function de(e, n) {
		if (!ce() || !se(e)) return;
		let r = oe(e, "model");
		ee(r), h.delete(r), R(a, {
			...W(a),
			[r]: {
				text: n,
				error: "",
				pending: !1,
				helperKey: t.view?.helperBindings?.helperKey
			}
		}, !0), R(o, {
			...W(o),
			[r]: ""
		}, !0);
	}
	function fe(e, t) {
		let n = se(e);
		if (!ce() || !n?.model.allowedModes.some((e) => e.value === t)) return;
		let r = oe(e, "model");
		if (t === "override") {
			de(e, W(a)[r]?.text ?? n.model.value ?? "");
			return;
		}
		h.delete(r);
		let i = { ...W(a) };
		delete i[r], R(a, i, !0), R(o, {
			...W(o),
			[r]: ""
		}, !0), t !== n.model.mode && ue(e, "model", t, null);
	}
	function pe(e, t) {
		if (!ce() || le(e) !== "override") return;
		de(e, t);
		let n = oe(e, "model");
		!t.trim() || t.length > 256 ? R(o, {
			...W(o),
			[n]: "Enter a model identifier of 1–256 characters."
		}, !0) : ue(e, "model", "override", t);
	}
	function me(e, t, n) {
		he(e)?.allowedModes.some((e) => e.value === t) && r().editBinding && te(e, !1, (i) => r().editBinding(i, e, t, n));
	}
	let he = (e) => e === "profileId" ? t.view?.model?.profile : t.view?.model?.model, ge = (e = t.view) => !!e?.model && (e.model.editable ?? !e.readOnly) && !!r().editBinding, _e = (e) => W(a)[e] ? "override" : he(e)?.mode, ve = (e) => W(a)[e]?.text ?? he(e)?.value ?? "", ye = () => {
		let e = t.view?.model?.profile;
		return W(a).profileId?.text ?? (e && Object.hasOwn(e, "effectiveValue") ? e.effectiveValue ?? "" : e?.value ?? "");
	}, be = () => t.view?.model?.profile.mode === "override" || !!t.view?.model?.profileDefaultModel;
	function xe(e, t) {
		ge() && he(e)?.allowedModes.some((e) => e.value === "override") && (ee(e), h.delete(e), R(a, {
			...W(a),
			[e]: {
				text: t,
				error: "",
				pending: !1
			}
		}, !0), R(o, {
			...W(o),
			[e]: ""
		}, !0));
	}
	function Se(e, t) {
		let n = he(e);
		if (!ge() || !n?.allowedModes.some((e) => e.value === t)) return;
		if (t === "override") {
			xe(e, ve(e));
			return;
		}
		h.delete(e);
		let r = { ...W(a) };
		delete r[e], R(a, r, !0), R(o, {
			...W(o),
			[e]: ""
		}, !0), t !== n.mode && me(e, t, null);
	}
	function Ce(e, n) {
		if (ge() && (e !== "model" || _e(e) === "override") && he(e)?.allowedModes.some((e) => e.value === "override")) {
			if (xe(e, n), !n.trim()) {
				let r = t.view?.readOnly ? "block" : "inherit";
				if (e === "model" && be() && he(e)?.allowedModes.some((e) => e.value === r)) {
					Se(e, r);
					return;
				}
				R(a, {
					...W(a),
					[e]: {
						text: n,
						error: e === "profileId" ? "Choose a connection before saving an override." : "Enter a model identifier before saving an override.",
						pending: !1
					}
				}, !0);
			} else me(e, "override", n);
		}
	}
	let we = () => !!t.view?.modifiers?.editable && !t.view.readOnly && !!r().editModifiers, Te = () => JSON.parse(JSON.stringify(t.view?.modifiers?.items ?? []));
	function Ee(e) {
		let t = W(a)["modifier:" + e.id];
		if (t) try {
			return JSON.parse(t.text);
		} catch {}
		return e.settings;
	}
	let M = () => Object.fromEntries((t.view?.modifiers?.items ?? []).map((e) => {
		let t = W(a)["modifier:" + e.id];
		return [e.id, {
			settings: Ee(e),
			error: t?.error || W(o)["modifier:" + e.id] || "",
			pending: !!t?.pending,
			dirty: !!t
		}];
	}));
	function De(e) {
		if (!we() || W(g) || e.length > 16 || !r().editModifiers) return;
		let t = ++v;
		R(g, !0), te("modifiers", !1, (t) => r().editModifiers(t, e)).finally(() => {
			t === v && R(g, !1);
		});
	}
	function N(e) {
		if (!we() || !t.view?.modifiers || t.view.modifiers.items.length >= 16) return;
		let n = t.view.modifiers.options.find((t) => t.type === e);
		if (!n) return;
		let r = Te(), i;
		do
			i = `mod-${e.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 28)}-${Date.now().toString(36)}-${(++_).toString(36)}`;
		while (r.some((e) => e.id === i));
		De([...r, {
			id: i,
			type: e,
			version: 1,
			enabled: !0,
			settings: JSON.parse(JSON.stringify(n.defaultSettings))
		}]);
	}
	function Oe(e, n) {
		if (!we() || !t.view?.modifiers || !t.view.modifiers.options.some((t) => t.type === e)) return;
		let r = Te();
		r.some((t) => t.type === e) ? De(r.map((t) => t.type === e ? {
			...t,
			enabled: n
		} : t)) : n && N(e);
	}
	function ke(e, n) {
		we() && t.view?.modifiers?.items.some((t) => t.id === e) && De(Te().map((t) => t.id === e ? {
			...t,
			enabled: n
		} : t));
	}
	function je(e) {
		we() && t.view?.modifiers?.items.some((t) => t.id === e) && De(Te().filter((t) => t.id !== e));
	}
	function Me(e, t) {
		if (!we()) return;
		let n = Te(), r = n.findIndex((t) => t.id === e), i = r + t;
		r < 0 || i < 0 || i >= n.length || ([n[r], n[i]] = [n[i], n[r]], De(n));
	}
	function Ne(e, n, r) {
		if (!we()) return;
		let i = t.view?.modifiers?.items.find((t) => t.id === e), s = t.view?.modifiers?.options.find((e) => e.type === i?.type);
		if (!i || !s?.fields.some((e) => e.key === n)) return;
		let c = "modifier:" + e;
		b.set(c, (b.get(c) ?? 0) + 1), h.delete(c), R(o, {
			...W(o),
			[c]: ""
		}, !0), R(a, {
			...W(a),
			[c]: {
				text: JSON.stringify({
					...Ee(i),
					[n]: r
				}),
				error: "",
				pending: !1,
				modifierType: i.type
			}
		}, !0);
	}
	function Pe(e) {
		if (!we() || !r().editModifiers) return;
		let n = t.view?.modifiers?.items.find((t) => t.id === e), i = "modifier:" + e;
		if (!n || !W(a)[i] || W(a)[i].pending) return;
		let o = (b.get(i) ?? 0) + 1, s = y, c = n.type;
		b.set(i, o);
		let l = Ee(n), u = Te().map((t) => t.id === e ? {
			...t,
			settings: l
		} : t);
		te(i, !1, async (n) => {
			let l = await r().editModifiers(n, u);
			if (l.ok && E && t.view && T(t.view) === T(n) && y === s && b.get(i) === o && t.view.modifiers?.items.some((t) => t.id === e && t.type === c)) {
				let e = { ...W(a) };
				delete e[i], R(a, e, !0);
			}
			return l;
		});
	}
	let Fe = () => {
		let e = /* @__PURE__ */ new Map();
		for (let n of t.view?.controls ?? []) {
			let t = n.group && n.group !== "Main" ? n.group : n.advanced ? "Advanced" : "Main";
			e.set(t, [...e.get(t) ?? [], n]);
		}
		return [...e].sort(([e], [t]) => e === "Main" ? -1 : +(t === "Main"));
	}, Ie = (e) => e.some((e) => !!(W(a)[e.key]?.error || W(o)[e.key])), Le = () => t.view?.model ? `Model connection · ${t.view.model.issue ? "Binding needs attention" : t.view.model.effective || "Choose a connection"}` : "";
	function Re(e) {
		t.view && !t.view.boundary && r().present && te("alias", !0, (n) => r().present(n, "alias", e === t.view?.canonicalTitle ? "" : e));
	}
	function ze() {
		return {
			label: W(a).boundary?.text ?? t.view?.boundary?.label ?? "",
			artifactKind: W(a).boundary?.artifactKind ?? t.view?.boundary?.kind ?? "",
			required: W(a).boundary?.required ?? t.view?.boundary?.required ?? !1
		};
	}
	function Be(e, n) {
		if (!t.view?.boundary || t.view.readOnly || !r().editInterface || e === "artifactKind" && !t.view.boundary.kinds.includes(String(n))) return;
		let i = {
			...ze(),
			[e]: n
		};
		f++, h.delete("boundary"), R(o, {
			...W(o),
			boundary: ""
		}, !0), R(a, {
			...W(a),
			boundary: {
				text: String(i.label),
				artifactKind: String(i.artifactKind),
				required: i.required === !0,
				error: "",
				pending: !1,
				boundaryId: t.view.boundary.id,
				boundaryDirection: t.view.boundary.direction
			}
		}, !0);
	}
	function Ue() {
		if (!t.view?.boundary || t.view.readOnly || !r().editInterface || W(a).boundary?.pending) return;
		let e = t.view.boundary.id, n = ze();
		if (!n.label.trim() || !t.view.boundary.kinds.includes(n.artifactKind)) return;
		let i = ++f;
		R(a, {
			...W(a),
			boundary: {
				text: n.label,
				artifactKind: n.artifactKind,
				required: n.required,
				error: "",
				pending: !1,
				boundaryId: e,
				boundaryDirection: t.view.boundary.direction
			}
		}, !0), te("boundary", !1, async (o) => {
			let s = await r().editInterface(o, {
				kind: "update",
				id: e,
				...n
			});
			if (s.ok && E && t.view?.boundary?.id === e && T(t.view) === T(o) && f === i) {
				let e = { ...W(a) };
				delete e.boundary, R(a, e, !0);
			}
			return s;
		});
	}
	var We = Uo(), Ge = z(We), Ke = (e) => {
		var s = Vo(), c = B(s);
		let l;
		var u = z(c), d = z(u);
		P(u);
		var f = V(u, 2), p = z(f);
		Q(p);
		var h = V(p, 2), _ = (e) => {
			var n = mo(), r = z(n);
			P(n), H(() => Y(r, `Canonical type: ${t.view.canonicalTitle ?? ""}`)), J(e, n);
		};
		X(h, (e) => {
			!t.view.boundary && (t.view.alias || t.view.title || t.view.canonicalTitle) !== t.view.canonicalTitle && e(_);
		});
		var v = V(h, 2), y = z(v, !0);
		P(v), P(f);
		var b = V(f, 2), x = (e) => {
			var n = _o(), i = V(z(n)), a = z(i), o = (e) => {
				var n = ho();
				H(() => n.disabled = t.view.readOnly), K("click", n, () => {
					t.view && !t.view.readOnly && r().duplicate?.(D(t.view));
				}), J(e, n);
			};
			X(a, (e) => {
				!t.view.boundary && r().duplicate && e(o);
			});
			var s = V(a, 2), c = (e) => {
				var n = go();
				H(() => n.disabled = t.view.readOnly), K("click", n, () => {
					t.view && !t.view.readOnly && r().remove?.(D(t.view));
				}), J(e, n);
			};
			X(s, (e) => {
				r().remove && e(c);
			}), P(i), P(n), J(e, n);
		};
		X(b, (e) => {
			(r().duplicate || r().remove) && e(x);
		}), P(c);
		var S = V(c, 2), C = (e) => {
			var n = yo(), i = B(n), a = V(z(i)), s = z(a);
			s.value = s.__value = "pre";
			var c = V(s);
			c.value = c.__value = "post", P(a);
			var l;
			si(a), P(i);
			var u = V(i), d = (e) => {
				var t = vo(), n = z(t, !0);
				P(t), H(() => Y(n, W(o).phase)), J(e, t);
			};
			X(u, (e) => {
				W(o).phase && e(d);
			}), H(() => {
				a.disabled = t.view.readOnly || !r().editPhase, l !== (l = t.view.phase) && (a.value = (a.__value = t.view.phase) ?? "", oi(a, t.view.phase));
			}), K("change", a, (e) => {
				let t = e.currentTarget.value;
				te("phase", !1, (e) => r().editPhase(e, t));
			}), J(e, n);
		};
		X(S, (e) => {
			t.view.phaseEditable && e(C);
		});
		var w = V(S, 2), T = (e) => {
			var t = bo(), n = z(t);
			P(t), H(() => n.disabled = !r().openFastConnections), K("click", n, () => r().openFastConnections?.()), J(e, t);
		};
		X(w, (e) => {
			t.view.operation === "fast-decision" && e(T);
		});
		var E = V(w, 2), O = (e) => {
			var n = Co(), r = z(n), i = (e) => {
				J(e, xo());
			};
			X(r, (e) => {
				t.view.readOnly && e(i);
			});
			var a = V(r), o = (e) => {
				J(e, So());
			};
			X(a, (e) => {
				t.view.enabled || e(o);
			}), P(n), J(e, n);
		};
		X(E, (e) => {
			(t.view.readOnly || !t.view.enabled) && e(O);
		});
		var k = V(E, 2), A = (e) => {
			var t = wo(), n = z(t, !0);
			P(t), H(() => Y(n, W(o).alias)), J(e, t);
		};
		X(k, (e) => {
			W(o).alias && e(A);
		});
		var ee = V(k, 2), j = (e) => {
			var n = Eo(), i = z(n), s = z(i);
			P(i);
			var c = V(i, 2), l = V(z(c));
			Z(l, 21, () => t.view.boundary.kinds, Br, (e, t) => {
				var n = To(), r = z(n, !0);
				P(n);
				var i = {};
				H(() => {
					Y(r, W(t)), i !== (i = W(t)) && (n.value = (n.__value = W(t)) ?? "");
				}), J(e, n);
			}), P(l);
			var u;
			si(l), P(c);
			var d = V(c, 2), f = z(d);
			Q(f), Ae(), P(d);
			var p = V(d, 2), m = z(p), h = z(m, !0);
			P(m), P(p);
			var g = V(p, 4), _ = (e) => {
				var t = wo(), n = z(t, !0);
				P(t), H(() => Y(n, W(a).boundary?.error || W(o).boundary)), J(e, t);
			};
			X(g, (e) => {
				(W(a).boundary?.error || W(o).boundary) && e(_);
			}), P(n), H((e, n, i) => {
				Y(s, `Subgraph ${t.view.boundary.direction ?? ""}`), l.disabled = t.view.readOnly || !r().editInterface, u !== (u = e) && (l.value = (l.__value = e) ?? "", oi(l, e)), hi(f, n), f.disabled = t.view.readOnly || !r().editInterface, m.disabled = i, Y(h, W(a).boundary?.pending ? "Validating…" : "Save port");
			}, [
				() => ze().artifactKind,
				() => ze().required,
				() => t.view.readOnly || !r().editInterface || !ze().label.trim() || !!W(a).boundary?.pending
			]), K("change", l, (e) => Be("artifactKind", e.currentTarget.value)), K("change", f, (e) => Be("required", e.currentTarget.checked)), K("click", m, () => Ue()), J(e, n);
		};
		X(ee, (e) => {
			t.view.boundary && e(j);
		});
		var re = V(ee, 2), ie = (e) => {
			var s = Ao(), c = B(s), l = z(c), u = (e) => {
				var n = Oo(), s = z(n), c = z(s, !0), l = V(c);
				P(s);
				var u = V(s, 2), d = z(u, !0);
				P(u);
				var f = V(u, 6), p = (e) => {
					J(e, Do());
				};
				X(f, (e) => {
					W(a).fileInput?.pending && e(p);
				});
				var m = V(f, 2), h = (e) => {
					var t = wo(), n = z(t, !0);
					P(t), H(() => {
						$(t, "id", i() + "-error-fileInput"), Y(n, W(o).fileInput);
					}), J(e, t);
				};
				X(m, (e) => {
					W(o).fileInput && e(h);
				}), P(n), H(() => {
					Y(c, t.view.fileInput.loaded ? "Replace file" : "Choose file"), $(l, "aria-label", t.view.fileInput.loaded ? "Replace file" : "Choose file"), l.disabled = t.view.readOnly || !r().loadFile || !!W(a).fileInput?.pending, $(l, "aria-invalid", !!W(o).fileInput), $(l, "aria-describedby", W(o).fileInput ? i() + "-error-fileInput" : void 0), Y(d, t.view.fileInput.loaded ? "Loaded file: " + t.view.fileInput.fileName : "No file loaded.");
				}), K("change", l, (e) => ne(e.currentTarget)), J(e, n);
			};
			X(l, (e) => {
				t.view.fileInput && e(u);
			}), Z(V(l, 2), 17, () => Fe().filter(([e]) => e === "Main"), ([e, t]) => e, (e, t) => {
				var r = /* @__PURE__ */ F(() => m(W(t), 2));
				let i = () => W(r)[1];
				var a = Ar();
				Z(B(a), 17, i, (e) => e.key, (e, t) => {
					n(e, () => W(t));
				}), J(e, a);
			}), P(c), Z(V(c, 2), 17, () => Fe().filter(([e]) => e !== "Main"), ([e, t]) => e, (e, t) => {
				var r = /* @__PURE__ */ F(() => m(W(t), 2));
				let i = () => W(r)[0], a = () => W(r)[1];
				var o = ko(), s = z(o), c = z(s, !0);
				P(s), Z(V(s, 2), 17, a, (e) => e.key, (e, t) => {
					n(e, () => W(t));
				}), P(o), H((e) => {
					$(o, "data-control-group", i()), o.open = e, Y(c, i());
				}, [() => Ie(a())]), J(e, o);
			}), J(e, s);
		};
		X(re, (e) => {
			t.view.boundary || e(ie);
		});
		var ae = V(re, 2), se = (e) => {
			var n = Fo(), r = V(z(n), 4);
			Z(r, 17, () => t.view.helperBindings.roles, (e) => e.role, (e, t) => {
				var n = No(), r = z(n), i = z(r, !0);
				P(r);
				var s = V(r, 2), c = V(z(s)), l = z(c);
				l.value = l.__value = "";
				var u = V(l), d = (e) => {
					var n = To(), r = z(n);
					P(n);
					var i = {};
					H(() => {
						Y(r, `Unavailable connection · ${W(t).profile.value ?? ""}`), i !== (i = W(t).profile.value) && (n.value = (n.__value = W(t).profile.value) ?? "");
					}), J(e, n);
				}, f = /* @__PURE__ */ F(() => W(t).profile.value && !(W(t).profile.options ?? []).some((e) => e.value === W(t).profile.value));
				X(u, (e) => {
					W(f) && e(d);
				}), Z(V(u), 17, () => W(t).profile.options ?? [], (e) => e.value, (e, t) => {
					var n = To(), r = z(n, !0);
					P(n);
					var i = {};
					H(() => {
						Y(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
					}), J(e, n);
				}), P(c);
				var p;
				si(c), P(s);
				var m = V(s, 2), h = V(z(m));
				Z(h, 21, () => W(t).model.allowedModes, (e) => e.value, (e, t) => {
					var n = To(), r = z(n, !0);
					P(n);
					var i = {};
					H(() => {
						Y(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
					}), J(e, n);
				}), P(h);
				var g;
				si(h), P(m);
				var _ = V(m, 2), v = (e) => {
					var n = jo(), r = V(z(n));
					Q(r), P(n), H((e, n) => {
						$(r, "aria-label", W(t).role + " model identifier"), mi(r, e), r.disabled = n;
					}, [() => W(a)[oe(W(t).role, "model")]?.text ?? W(t).model.value ?? "", () => !ce()]), K("input", r, (e) => de(W(t).role, e.currentTarget.value)), K("change", r, (e) => pe(W(t).role, e.currentTarget.value)), J(e, n);
				}, y = /* @__PURE__ */ F(() => le(W(t).role) === "override");
				X(_, (e) => {
					W(y) && e(v);
				});
				var b = V(_, 2), x = z(b);
				P(b);
				var S = V(b), C = z(S, !0);
				P(S);
				var w = V(S), T = (e) => {
					var n = Mo(), r = z(n, !0);
					P(n), H(() => Y(r, W(t).caveat)), J(e, n);
				};
				X(w, (e) => {
					W(t).caveat && e(T);
				});
				var E = V(w, 2), D = (e) => {
					var n = wo(), r = z(n, !0);
					P(n), H((e) => Y(r, e), [() => W(o)[oe(W(t).role, "profileId")] || W(o)[oe(W(t).role, "model")]]), J(e, n);
				}, O = /* @__PURE__ */ F(() => W(o)[oe(W(t).role, "profileId")] || W(o)[oe(W(t).role, "model")]);
				X(E, (e) => {
					W(O) && e(D);
				}), P(n), H((e, n, r) => {
					Y(i, W(t).label), $(c, "aria-label", W(t).role + " connection profile"), c.disabled = e, p !== (p = W(t).profile.value ?? "") && (c.value = (c.__value = W(t).profile.value ?? "") ?? "", oi(c, W(t).profile.value ?? "")), $(h, "aria-label", W(t).role + " model mode"), h.disabled = n, g !== (g = r) && (h.value = (h.__value = r) ?? "", oi(h, r)), Y(x, `Effective connection: ${W(t).effective ?? ""}`), Y(C, W(t).source);
				}, [
					() => !ce(),
					() => !ce(),
					() => le(W(t).role)
				]), K("change", c, (e) => ue(W(t).role, "profileId", e.currentTarget.value ? "override" : "inherit", e.currentTarget.value || null)), K("change", h, (e) => fe(W(t).role, e.currentTarget.value)), J(e, n);
			});
			var i = V(r, 2), s = (e) => {
				var n = wo(), r = z(n, !0);
				P(n), H(() => Y(r, t.view.helperBindings.issue)), J(e, n);
			}, c = (e) => {
				J(e, Po());
			};
			X(i, (e) => {
				t.view.helperBindings.issue ? e(s) : t.view.helperBindings.roles.length || e(c, 1);
			}), P(n), J(e, n);
		};
		X(ae, (e) => {
			t.view.helperBindings && e(se);
		});
		var me = V(ae, 2), he = (e) => {
			var n = Lo(), i = z(n), s = z(i, !0);
			P(i);
			var c = V(i, 2), l = V(z(c)), u = z(l);
			u.value = u.__value = "";
			var d = V(u), f = (e) => {
				var t = To(), n = z(t);
				P(t);
				var r = {};
				H((e, i) => {
					Y(n, `Unavailable connection · ${e ?? ""}`), r !== (r = i) && (t.value = (t.__value = i) ?? "");
				}, [() => ye(), () => ye()]), J(e, t);
			}, p = /* @__PURE__ */ F(() => ye() && !(t.view.model.profile.options ?? []).some((e) => e.value === ye()));
			X(d, (e) => {
				W(p) && e(f);
			}), Z(V(d), 17, () => t.view.model.profile.options ?? [], (e) => e.value, (e, t) => {
				var n = To(), r = z(n, !0);
				P(n);
				var i = {};
				H(() => {
					Y(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
				}), J(e, n);
			}), P(l);
			var m;
			si(l), P(c);
			var h = V(c, 2), g = V(z(h));
			Z(g, 21, () => t.view.model.model.allowedModes, (e) => e.value, (e, n) => {
				var r = To(), i = z(r, !0);
				P(r);
				var a = {};
				H((e) => {
					Y(i, e), a !== (a = W(n).value) && (r.value = (r.__value = W(n).value) ?? "");
				}, [() => W(n).value === "inherit" && !t.view.readOnly ? be() || !t.view.model.model.effectiveValue ? "Use profile model" : "Existing role model" : W(n).label]), J(e, r);
			}), P(g);
			var _;
			si(g), P(h);
			var v = V(h, 2), y = (e) => {
				var t = Io(), n = V(z(t));
				Q(n), P(t), H((e, t) => {
					mi(n, e), n.disabled = t;
				}, [() => ve("model"), () => !ge()]), K("input", n, (e) => xe("model", e.currentTarget.value)), K("change", n, (e) => Ce("model", e.currentTarget.value)), J(e, t);
			}, b = /* @__PURE__ */ F(() => _e("model") === "override");
			X(v, (e) => {
				W(b) && e(y);
			});
			var x = V(v, 2), S = V(z(x), 2), C = V(z(S));
			Z(C, 21, () => t.view.model.profile.allowedModes, (e) => e.value, (e, t) => {
				var n = To(), r = z(n, !0);
				P(n);
				var i = {};
				H(() => {
					Y(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
				}), J(e, n);
			}), P(C);
			var w;
			si(C), P(S);
			var T = V(S, 2), E = V(z(T));
			Q(E), P(T), P(x);
			var D = V(x, 2), O = (e) => {
				var n = Mo(), r = z(n);
				P(n), H(() => Y(r, `Effective connection: ${t.view.model.effective ?? ""}`)), J(e, n);
			}, k = /* @__PURE__ */ F(() => !t.view.model.issue || t.view.model.effective.trim() !== t.view.model.issue.trim());
			X(D, (e) => {
				W(k) && e(O);
			});
			var A = V(D), ee = (e) => {
				var n = Mo(), r = z(n, !0);
				P(n), H(() => Y(r, t.view.model.source)), J(e, n);
			};
			X(A, (e) => {
				t.view.model.source && e(ee);
			});
			var ne = V(A, 2), j = (e) => {
				var n = wo(), r = z(n, !0);
				P(n), H(() => Y(r, t.view.model.issue)), J(e, n);
			};
			X(ne, (e) => {
				t.view.model.issue && e(j);
			});
			var re = V(ne, 2), ie = (e) => {
				var t = wo(), n = z(t, !0);
				P(t), H(() => Y(n, W(o).modelRole || W(a).profileId?.error || W(o).profileId || W(a).model?.error || W(o).model)), J(e, t);
			};
			X(re, (e) => {
				(W(o).modelRole || W(a).profileId?.error || W(o).profileId || W(a).model?.error || W(o).model) && e(ie);
			}), P(n), H((e, n, i, a, o, c, u) => {
				Y(s, e), l.disabled = n, m !== (m = i) && (l.value = (l.__value = i) ?? "", oi(l, i)), g.disabled = a, _ !== (_ = o) && (g.value = (g.__value = o) ?? "", oi(g, o)), C.disabled = c, w !== (w = u) && (C.value = (C.__value = u) ?? "", oi(C, u)), mi(E, t.view.model.role), E.disabled = t.view.readOnly || !t.view.model.roleEditable || !r().editField;
			}, [
				() => Le(),
				() => !ge() || !t.view.model.profile.allowedModes.some((e) => e.value === "override"),
				() => ye(),
				() => !ge(),
				() => _e("model"),
				() => !ge(),
				() => _e("profileId")
			]), K("change", l, (e) => Ce("profileId", e.currentTarget.value)), K("change", g, (e) => Se("model", e.currentTarget.value)), K("change", C, (e) => Se("profileId", e.currentTarget.value)), K("change", E, (e) => {
				let n = e.currentTarget.value;
				t.view?.model?.roleEditable && r().editField && te("modelRole", !1, (e) => r().editField(e, "modelRole", n));
			}), J(e, n);
		};
		X(me, (e) => {
			t.view.model && e(he);
		});
		var Te = V(me, 2), Ee = (e) => {
			var n = zo();
			Z(V(z(n)), 17, () => t.view.ports, (e) => e.direction + ":" + e.id, (e, t) => {
				var n = Ro(), r = z(n), i = V(r), a = z(i, !0);
				P(i), P(n), H(() => {
					Y(r, `${W(t).direction === "input" ? "In" : "Out"} · ${W(t).label ?? ""}`), Y(a, W(t).kind);
				}), J(e, n);
			}), P(n), J(e, n);
		};
		X(Te, (e) => {
			t.view.ports.length && e(Ee);
		});
		var De = V(Te, 2), Ve = (e) => {
			var n = Bo(), r = z(n, !0);
			P(n), H(() => Y(r, t.view.status)), J(e, n);
		};
		X(De, (e) => {
			t.view.status && e(Ve);
		});
		var He = V(De, 2);
		Z(He, 17, () => t.view.issues ?? [], Br, (e, t) => {
			var n = wo(), r = z(n, !0);
			P(n), H(() => Y(r, W(t))), J(e, n);
		});
		var We = V(He, 2), Ge = (e) => {
			{
				let n = /* @__PURE__ */ F(() => !we()), r = /* @__PURE__ */ F(M), a = /* @__PURE__ */ F(() => W(o).modifiers || "");
				po(e, {
					get items() {
						return t.view.modifiers.items;
					},
					get options() {
						return t.view.modifiers.options;
					},
					get disabled() {
						return W(n);
					},
					get busy() {
						return W(g);
					},
					get drafts() {
						return W(r);
					},
					get error() {
						return W(a);
					},
					get idPrefix() {
						return i();
					},
					onquick: Oe,
					onadd: N,
					onenable: ke,
					onremove: je,
					onmove: Me,
					ondraft: Ne,
					onsave: Pe
				});
			}
		};
		X(We, (e) => {
			t.view.modifiers && e(Ge);
		}), H((e) => {
			l = ai(c, "", l, { "--pc-detail-family": t.view.familyColor ?? "var(--pc-accent)" }), $(d, "d", t.view.iconPath), $(p, "id", i() + "-name"), $(p, "maxlength", t.view.boundary ? void 0 : 80), mi(p, e), p.disabled = t.view.boundary ? t.view.readOnly || !r().editInterface : !t.view.canPresent || !r().present, Y(y, t.view.boundary ? "Subgraph " + t.view.boundary.direction : t.view.family + " · " + t.view.phase + " phase");
		}, [() => t.view.boundary ? ze().label : t.view.alias || t.view.title || t.view.canonicalTitle]), K("input", p, (e) => {
			t.view?.boundary && Be("label", e.currentTarget.value);
		}), K("change", p, (e) => {
			t.view?.boundary || Re(e.currentTarget.value);
		}), J(e, s);
	}, qe = (e) => {
		J(e, Ho());
	};
	X(Ge, (e) => {
		t.view ? e(Ke) : e(qe, -1);
	}), P(We), J(e, We), He();
}
yr([
	"input",
	"change",
	"click"
]);
//#endregion
//#region ui/CommentDetails.svelte
var Go = /* @__PURE__ */ q("<p class=\"pc-detail-meta svelte-17djc3u\">Read-only comment</p>"), Ko = /* @__PURE__ */ q("<section class=\"pc-comment-details svelte-17djc3u\" aria-label=\"Comment details\"><h3 class=\"svelte-17djc3u\">Comment</h3> <!> <fieldset class=\"pc-detail-group svelte-17djc3u\"><legend class=\"svelte-17djc3u\">Comment</legend> <label class=\"svelte-17djc3u\">Title<input aria-label=\"Comment title\" class=\"svelte-17djc3u\"/></label> <label class=\"svelte-17djc3u\">Notes<textarea aria-label=\"Comment notes\" rows=\"5\" class=\"svelte-17djc3u\"></textarea></label> <label class=\"pc-comment-color-label svelte-17djc3u\">Color<input aria-label=\"Comment color\" type=\"color\" class=\"svelte-17djc3u\"/></label> <label class=\"pc-detail-check svelte-17djc3u\"><input aria-label=\"Move contents\" type=\"checkbox\" class=\"svelte-17djc3u\"/> Move contents</label> <small class=\"svelte-17djc3u\">Moves fully contained nodes when you drag the comment header.</small></fieldset> <div class=\"pc-comment-commands svelte-17djc3u\"><button type=\"button\" class=\"pc-btn svelte-17djc3u\">Fit to contents</button> <button type=\"button\" class=\"pc-btn pc-danger svelte-17djc3u\">Delete comment</button></div> <small class=\"svelte-17djc3u\">Deleting this comment keeps its contents.</small></section>");
function qo(e, t) {
	Ve(t, !0);
	let n = wi(t, "readOnly", 3, !1), r = /* @__PURE__ */ F(() => n() || t.comment.readOnly), i = (e) => e.stopPropagation();
	function a(e) {
		W(r) || t.onPatch(e);
	}
	function o(e) {
		W(r) || t.onCommand(e);
	}
	var s = Ko(), c = V(z(s), 2), l = (e) => {
		J(e, Go());
	};
	X(c, (e) => {
		W(r) && e(l);
	});
	var u = V(c, 2), d = V(z(u), 2), f = V(z(d));
	Q(f), P(d);
	var p = V(d, 2), m = V(z(p));
	rt(m), P(p);
	var h = V(p, 2), g = V(z(h));
	Q(g), P(h);
	var _ = V(h, 2), v = z(_);
	Q(v), Ae(), P(_), Ae(2), P(u);
	var y = V(u, 2), b = z(y), x = V(b, 2);
	P(y), Ae(2), P(s), H(() => {
		u.disabled = W(r), mi(f, t.comment.title), f.disabled = W(r), mi(m, t.comment.content), m.disabled = W(r), mi(g, t.comment.color), g.disabled = W(r), hi(v, t.comment.moveContents), v.disabled = W(r), b.disabled = W(r), x.disabled = W(r);
	}), G("keydown", f, i, !0), K("change", f, (e) => a({ title: e.currentTarget.value })), G("keydown", m, i, !0), K("change", m, (e) => a({ content: e.currentTarget.value })), K("change", g, (e) => a({ color: e.currentTarget.value })), K("change", v, (e) => a({ moveContents: e.currentTarget.checked })), K("click", b, () => o("fit")), K("click", x, () => o("delete")), J(e, s), He();
}
yr(["change", "click"]);
//#endregion
//#region ui/OutputPreview.svelte
var Jo = /* @__PURE__ */ q("<option class=\"svelte-ee2ehy\"> </option>"), Yo = /* @__PURE__ */ q("<label class=\"pc-preview-choice svelte-ee2ehy\"><span class=\"pc-preview-sr-only svelte-ee2ehy\">Preview output</span><select aria-label=\"Preview output\" class=\"svelte-ee2ehy\"><option disabled=\"\" class=\"svelte-ee2ehy\">Choose an output</option><!></select></label>"), Xo = /* @__PURE__ */ q("<button type=\"button\" class=\"svelte-ee2ehy\">Collapse preview</button>"), Zo = /* @__PURE__ */ q("<button type=\"button\" role=\"tab\" class=\"svelte-ee2ehy\"> </button>"), Qo = /* @__PURE__ */ q("<div class=\"pc-preview-tabs svelte-ee2ehy\" role=\"tablist\" aria-label=\"Recorded artifacts\"></div>"), $o = /* @__PURE__ */ q("<p class=\"pc-preview-note svelte-ee2ehy\"> </p>"), es = /* @__PURE__ */ q("<pre class=\"svelte-ee2ehy\"> </pre>"), ts = /* @__PURE__ */ q("<small class=\"pc-preview-note svelte-ee2ehy\"> </small>"), ns = /* @__PURE__ */ q("<div role=\"tabpanel\" tabindex=\"0\" class=\"svelte-ee2ehy\"><article class=\"svelte-ee2ehy\"><div class=\"pc-preview-section-heading svelte-ee2ehy\"><span class=\"svelte-ee2ehy\"> </span><small class=\"svelte-ee2ehy\"> </small></div> <!> <!></article></div>"), rs = /* @__PURE__ */ q("<p class=\"pc-preview-empty svelte-ee2ehy\"> </p>"), is = /* @__PURE__ */ q("<section aria-label=\"Accepted consequences\" class=\"pc-preview-settlement svelte-ee2ehy\"><strong class=\"svelte-ee2ehy\"> </strong> <!></section>"), as = /* @__PURE__ */ q("<p class=\"pc-preview-error svelte-ee2ehy\"> </p>"), os = /* @__PURE__ */ q("<button type=\"button\" data-run-here=\"\" title=\"Runs the selected output's dependencies. Results are diagnostic previews.\" class=\"svelte-ee2ehy\"> </button>"), ss = /* @__PURE__ */ q("<button type=\"button\" data-preview-apply=\"\" class=\"svelte-ee2ehy\"> </button><button type=\"button\" class=\"svelte-ee2ehy\"> </button>", 1), cs = /* @__PURE__ */ q("<header class=\"svelte-ee2ehy\"><h3 class=\"svelte-ee2ehy\"> </h3> <!> <div class=\"pc-preview-tools svelte-ee2ehy\"><button type=\"button\" class=\"svelte-ee2ehy\">Follow selection</button><button type=\"button\" class=\"svelte-ee2ehy\"> </button><!></div></header> <!> <div class=\"pc-preview-sections svelte-ee2ehy\"><!> <!> <!> <!> <!> <!> <!> <!></div> <footer class=\"svelte-ee2ehy\"><span class=\"pc-preview-status svelte-ee2ehy\"> </span> <span class=\"svelte-ee2ehy\"> </span> <!> <!></footer>", 1), ls = /* @__PURE__ */ q("<p class=\"pc-preview-empty svelte-ee2ehy\">Select a node output to inspect its recorded result.</p>"), us = /* @__PURE__ */ q("<section class=\"pc-output-preview svelte-ee2ehy\" aria-label=\"Output preview\"><!></section>");
function ds(e, t) {
	let n = jr();
	Ve(t, !0);
	let r = wi(t, "actions", 19, () => ({})), i = /* @__PURE__ */ F(() => JSON.stringify([t.view?.sourceKey, t.view?.selectedKey])), a = /* @__PURE__ */ L(Qt({
		scope: "",
		id: null
	})), o = /* @__PURE__ */ F(() => (W(a).scope === W(i) ? t.view?.sections.find((e) => e.id === W(a).id) : null) ?? t.view?.sections[0] ?? null);
	yn(() => {
		let e = W(a).scope === W(i) && t.view?.sections.some((e) => e.id === W(a).id) ? W(a).id : t.view?.sections[0]?.id ?? null;
		(W(a).scope !== W(i) || W(a).id !== e) && R(a, {
			scope: W(i),
			id: e
		}, !0);
	});
	let s = (e) => n + "-tab-" + encodeURIComponent(e);
	function c(e, n) {
		e.stopPropagation();
		let r = t.view?.sections ?? [];
		if (!r.length || ![
			"ArrowLeft",
			"ArrowRight",
			"Home",
			"End"
		].includes(e.key)) return;
		e.preventDefault();
		let o = e.key === "Home" ? 0 : e.key === "End" ? r.length - 1 : (n + (e.key === "ArrowRight" ? 1 : -1) + r.length) % r.length;
		R(a, {
			scope: W(i),
			id: r[o].id
		}, !0), e.currentTarget.parentElement?.querySelectorAll("[role=\"tab\"]")[o]?.focus();
	}
	let l = /* @__PURE__ */ F(() => t.view?.choices.find((e) => e.key === t.view?.selectedKey) ?? null), u = (e) => ({
		"not-run": "Not run",
		current: "Current",
		stale: "Stale",
		removed: "Source removed"
	})[e] ?? e, d = (e) => "kind" in e ? JSON.stringify([
		"terminal",
		e.address.workflowId,
		e.address.instancePath,
		e.address.nodeId
	]) : JSON.stringify([
		"output",
		e.workflowId,
		e.instancePath,
		e.nodeId,
		e.portId
	]), f = (e) => "kind" in e ? {
		kind: "terminal",
		address: {
			...e.address,
			instancePath: [...e.address.instancePath]
		}
	} : {
		...e,
		instancePath: [...e.instancePath]
	}, p = /* @__PURE__ */ F(() => !!(t.view && W(l) && t.view.status !== "removed" && !t.view.busy && t.view.runHere?.enabled && r().runHere)), m = /* @__PURE__ */ F(() => !!(t.view && W(l) && t.view.review?.mode === "root" && t.view.review.selectedRootTerminal && "kind" in W(l).target && W(l).target.address.instancePath.length === 0 && d(W(l).target) === d(t.view.review.selector.terminal))), h = /* @__PURE__ */ F(() => !!(t.view && t.view.status === "current" && !t.view.busy && W(m) && t.view.review?.fresh && t.view.review.canApply && r().apply)), g = /* @__PURE__ */ F(() => !!(t.view && !t.view.busy && W(m) && r().reject));
	function _(e) {
		let n = t.view?.choices.find((t) => t.key === e);
		t.view && n && r().select?.(t.view.sourceKey, n.key, f(n.target));
	}
	function v(e) {
		let t = {
			kind: "terminal",
			address: {
				...e.terminal.address,
				instancePath: [...e.terminal.address.instancePath]
			}
		};
		return {
			handleId: e.handleId,
			runId: e.runId,
			terminal: t
		};
	}
	var y = us(), b = z(y), x = (e) => {
		var d = cs(), m = B(d), y = z(m), b = z(y, !0);
		P(y);
		var x = V(y, 2), S = (e) => {
			var n = Yo(), i = V(z(n)), a = z(i);
			a.value = a.__value = "", Z(V(a), 17, () => t.view.choices, (e) => e.key, (e, t) => {
				var n = Jo(), r = z(n);
				P(n);
				var i = {};
				H(() => {
					Y(r, `${W(t).label ?? ""} · ${W(t).kind ?? ""}`), i !== (i = W(t).key) && (n.value = (n.__value = W(t).key) ?? "");
				}), J(e, n);
			}), P(i);
			var o;
			si(i), P(n), H(() => {
				i.disabled = !r().select, o !== (o = t.view.selectedKey ?? "") && (i.value = (i.__value = t.view.selectedKey ?? "") ?? "", oi(i, t.view.selectedKey ?? ""));
			}), K("change", i, (e) => _(e.currentTarget.value)), J(e, n);
		};
		X(x, (e) => {
			t.view.choices.length && e(S);
		});
		var C = V(x, 2), w = z(C), T = V(w), E = z(T, !0);
		P(T);
		var D = V(T), O = (e) => {
			var n = Xo();
			K("click", n, function(...e) {
				t.collapse?.apply(this, e);
			}), J(e, n);
		};
		X(D, (e) => {
			t.collapse && e(O);
		}), P(C), P(m);
		var k = V(m, 2), A = (e) => {
			var r = Qo();
			Z(r, 23, () => t.view.sections, (e) => e.id, (e, t, r) => {
				var l = Zo(), u = z(l, !0);
				P(l), H((e) => {
					$(l, "id", e), $(l, "aria-selected", W(o)?.id === W(t).id), $(l, "aria-controls", n + "-panel"), $(l, "tabindex", W(o)?.id === W(t).id ? 0 : -1), Y(u, W(t).label);
				}, [() => s(W(t).id)]), K("click", l, () => {
					R(a, {
						scope: W(i),
						id: W(t).id
					}, !0);
				}), G("keydown", l, (e) => c(e, W(r)), !0), J(e, l);
			}), P(r), J(e, r);
		};
		X(k, (e) => {
			t.view.sections.length && e(A);
		});
		var ee = V(k, 2), te = z(ee), ne = (e) => {
			let t = /* @__PURE__ */ F(() => W(o));
			var r = ns(), i = z(r), a = z(i), c = z(a), l = z(c, !0);
			P(c);
			var u = V(c), d = z(u, !0);
			P(u), P(a);
			var f = V(a, 2), p = (e) => {
				var n = $o(), r = z(n, !0);
				P(n), H(() => Y(r, W(t).text)), J(e, n);
			}, m = (e) => {
				var n = es(), r = z(n, !0);
				P(n), H(() => Y(r, W(t).text)), J(e, n);
			};
			X(f, (e) => {
				W(t).format === "omitted" ? e(p) : e(m, -1);
			});
			var h = V(f, 2), g = (e) => {
				var n = ts(), r = z(n);
				P(n), H(() => Y(r, `Truncated diagnostic${W(t).format === "json-prefix-text" ? " · JSON prefix shown as text" : ""}`)), J(e, n);
			};
			X(h, (e) => {
				W(t).truncated && e(g);
			}), P(i), P(r), H((e) => {
				$(r, "id", n + "-panel"), $(r, "aria-labelledby", e), $(i, "data-artifact-kind", W(t).kind), Y(l, W(t).label), Y(d, W(t).kind);
			}, [() => s(W(t).id)]), G("keydown", r, (e) => e.stopPropagation(), !0), G("paste", r, (e) => e.stopPropagation(), !0), J(e, r);
		}, j = (e) => {
			var n = rs(), r = z(n, !0);
			P(n), H(() => Y(r, t.view.status === "not-run" ? "Run this workflow or use Run to here to inspect an output." : "No recorded artifact is available for this output.")), J(e, n);
		};
		X(te, (e) => {
			W(o) ? e(ne) : e(j, -1);
		});
		var re = V(te, 2), ie = (e) => {
			var n = is(), r = z(n), i = z(r);
			P(r), Z(V(r, 2), 17, () => t.view.settlement.receipts, (e) => e.intentId + ":" + e.targetId, (e, t) => {
				var n = $o(), r = z(n);
				P(n), H(() => Y(r, `${W(t).targetId ?? ""} · ${W(t).status ?? ""}${W(t).error ? " · " + W(t).error.message : ""}`)), J(e, n);
			}), P(n), H(() => Y(i, `Accepted consequences · ${t.view.settlement.status === "settled" ? "Saved" : t.view.settlement.status === "partial" ? "Some targets failed" : "Save confirmation needed"}`)), J(e, n);
		};
		X(re, (e) => {
			t.view.settlement && e(ie);
		});
		var ae = V(re, 2), oe = (e) => {
			var n = $o(), r = z(n, !0);
			P(n), H(() => Y(r, t.view.statusDetail)), J(e, n);
		};
		X(ae, (e) => {
			t.view.statusDetail && e(oe);
		});
		var se = V(ae, 2);
		Z(se, 17, () => t.view.sections.filter((e) => e.id !== W(o)?.id && (e.format === "omitted" || e.truncated)), (e) => e.id, (e, t) => {
			var n = $o(), r = z(n);
			P(n), H(() => Y(r, `${W(t).label ?? ""}: ${(W(t).format === "omitted" ? W(t).text : "Truncated diagnostic" + (W(t).format === "json-prefix-text" ? " · JSON prefix shown as text" : "")) ?? ""}`)), J(e, n);
		});
		var ce = V(se, 2), le = (e) => {
			var n = $o(), r = z(n, !0);
			P(n), H(() => Y(r, t.view.runHere.issue)), J(e, n);
		};
		X(ce, (e) => {
			t.view.runHere?.issue && e(le);
		});
		var ue = V(ce, 2);
		Z(ue, 17, () => t.view.issues, Br, (e, t) => {
			var n = as(), r = z(n, !0);
			P(n), H(() => Y(r, W(t))), J(e, n);
		});
		var de = V(ue, 2), fe = (e) => {
			var n = as(), r = z(n, !0);
			P(n), H(() => Y(r, t.view.review.issue)), J(e, n);
		};
		X(de, (e) => {
			t.view.review?.issue && e(fe);
		});
		var pe = V(de, 2), me = (e) => {
			var n = ts(), r = z(n, !0);
			P(n), H(() => Y(r, t.view.review.persistOnly ? "Retry keeps the accepted reply and retries failed targets. No model request is made." : "Apply rechecks the source, connection and final evidence. Recorded preview text may be truncated.")), J(e, n);
		};
		X(pe, (e) => {
			t.view.review && e(me);
		}), P(ee);
		var he = V(ee, 2), ge = z(he), _e = z(ge, !0);
		P(ge);
		var ve = V(ge, 2), ye = z(ve, !0);
		P(ve);
		var be = V(ve, 2), xe = (e) => {
			var n = os(), i = z(n);
			P(n), H(() => {
				n.disabled = !W(p), Y(i, `Run to here · maximum ${t.view.runHere.callBound ?? ""} ${t.view.runHere.callBound === 1 ? "request" : "requests"}`);
			}), K("click", n, () => {
				t.view && W(l) && W(p) && r().runHere?.(t.view.sourceKey, f(W(l).target));
			}), J(e, n);
		};
		X(be, (e) => {
			t.view.runHere && e(xe);
		});
		var Se = V(be, 2), Ce = (e) => {
			var n = ss(), i = B(n), a = z(i, !0);
			P(i);
			var o = V(i), s = z(o, !0);
			P(o), H(() => {
				i.disabled = !W(h), Y(a, t.view.review.persistOnly ? "Retry failed persistence" : "Apply reviewed candidate"), o.disabled = !W(g), Y(s, t.view.review.persistOnly ? "Close persistence review" : "Reject candidate");
			}), K("click", i, () => {
				t.view?.review && W(h) && r().apply?.(v(t.view.review.selector));
			}), K("click", o, () => {
				t.view?.review && W(g) && r().reject?.(v(t.view.review.selector));
			}), J(e, n);
		};
		X(Se, (e) => {
			t.view.review && e(Ce);
		}), P(he), H((e) => {
			Y(b, W(l)?.label ?? t.view.title), $(w, "aria-pressed", t.view.followSelection), w.disabled = !r().follow, $(T, "aria-pressed", t.view.pinned), T.disabled = t.view.pinned ? !r().follow : !W(l) || !r().pin, Y(E, t.view.pinned ? "Unpin preview" : "Pin preview"), $(ge, "data-status", t.view.status), Y(_e, e), Y(ye, t.view.pinned ? "Pinned preview" : t.view.followSelection ? "Following selection" : "Selection not followed");
		}, [() => u(t.view.status)]), K("click", w, () => r().follow?.()), K("click", T, () => {
			t.view?.pinned ? r().follow?.() : t.view && W(l) && r().pin?.(t.view.sourceKey, f(W(l).target));
		}), J(e, d);
	}, S = (e) => {
		J(e, ls());
	};
	X(b, (e) => {
		t.view ? e(x) : e(S, -1);
	}), P(y), J(e, y), He();
}
yr(["change", "click"]);
//#endregion
//#region ui/RunDetails.svelte
var fs = /* @__PURE__ */ q("<p class=\"pc-run-memory svelte-f9s2fm\" role=\"status\"> </p>"), ps = /* @__PURE__ */ q("<p class=\"pc-run-error svelte-f9s2fm\"> </p>"), ms = /* @__PURE__ */ q("<p class=\"pc-run-empty svelte-f9s2fm\">No execution plan has been recorded.</p>"), hs = /* @__PURE__ */ q("<span aria-hidden=\"true\" class=\"svelte-f9s2fm\">▱</span>"), gs = /* @__PURE__ */ q("<small class=\"svelte-f9s2fm\"> </small>"), _s = /* @__PURE__ */ q("<details class=\"svelte-f9s2fm\"><summary class=\"svelte-f9s2fm\">Reported usage</summary><div class=\"pc-run-usage svelte-f9s2fm\"><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small></div></details>"), vs = /* @__PURE__ */ q("<li class=\"svelte-f9s2fm\"><div class=\"pc-run-row-heading svelte-f9s2fm\"><button type=\"button\" class=\"svelte-f9s2fm\"><!> </button><span class=\"pc-run-status svelte-f9s2fm\"> </span></div> <!> <div class=\"pc-run-row-meta svelte-f9s2fm\"><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small></div> <!> <!></li>"), ys = /* @__PURE__ */ q("<header class=\"svelte-f9s2fm\"><h3 class=\"svelte-f9s2fm\">Run details</h3><span class=\"pc-run-status svelte-f9s2fm\"> </span></header> <div class=\"pc-run-summary svelte-f9s2fm\"><p class=\"svelte-f9s2fm\"> </p><p class=\"svelte-f9s2fm\"> </p><p class=\"svelte-f9s2fm\"> </p></div> <!> <!> <!> <ol class=\"pc-run-rows svelte-f9s2fm\"></ol>", 1), bs = /* @__PURE__ */ q("<p class=\"pc-run-empty svelte-f9s2fm\">Run a workflow to inspect its processing stages.</p>"), xs = /* @__PURE__ */ q("<section class=\"pc-run-details svelte-f9s2fm\" aria-label=\"Run details\"><!></section>");
function Ss(e, t) {
	Ve(t, !0);
	let n = wi(t, "actions", 19, () => ({})), r = (e) => e === "not-run" ? "Not run" : e === "empty" ? "Ready" : e.charAt(0).toUpperCase() + e.slice(1), i = (e) => e !== null && Number.isFinite(e) && e >= 0 ? (e / 1e3).toFixed(2) + "s" : "Unknown", a = (e) => e != null && Number.isFinite(e) && e >= 0 ? String(e) : "Unknown";
	var o = xs(), s = z(o), c = (e) => {
		var o = ys(), s = B(o), c = V(z(s)), l = z(c, !0);
		P(c), P(s);
		var u = V(s, 2), d = z(u), f = z(d);
		P(d);
		var p = V(d), m = z(p);
		P(p);
		var h = V(p), g = z(h);
		P(h), P(u);
		var _ = V(u, 2), v = (e) => {
			var n = fs(), r = z(n, !0);
			P(n), H(() => Y(r, t.view.memoryStatus)), J(e, n);
		};
		X(_, (e) => {
			t.view.memoryStatus && e(v);
		});
		var y = V(_, 2), b = (e) => {
			var n = ps(), r = z(n, !0);
			P(n), H(() => Y(r, t.view.issue)), J(e, n);
		};
		X(y, (e) => {
			t.view.issue && e(b);
		});
		var x = V(y, 2), S = (e) => {
			J(e, ms());
		};
		X(x, (e) => {
			t.view.rows.length || e(S);
		});
		var C = V(x, 2);
		Z(C, 21, () => t.view.rows, (e) => e.key, (e, o) => {
			var s = vs();
			let c;
			var l = z(s), u = z(l), d = z(u), f = (e) => {
				J(e, hs());
			};
			X(d, (e) => {
				W(o).kind === "instance" && e(f);
			});
			var p = V(d, 1, !0);
			P(u);
			var m = V(u), h = z(m, !0);
			P(m), P(l);
			var g = V(l, 2), _ = (e) => {
				var t = gs(), n = z(t, !0);
				P(t), H((e) => Y(n, e), [() => r(W(o).subphase)]), J(e, t);
			};
			X(g, (e) => {
				W(o).subphase && e(_);
			});
			var v = V(g, 2), y = z(v), b = z(y);
			P(y);
			var x = V(y), S = z(x);
			P(x), P(v);
			var C = V(v, 2), w = (e) => {
				var t = ps(), n = z(t, !0);
				P(t), H(() => Y(n, W(o).issue)), J(e, t);
			};
			X(C, (e) => {
				W(o).issue && e(w);
			});
			var T = V(C, 2), E = (e) => {
				var t = _s(), n = V(z(t)), r = z(n), i = z(r);
				P(r);
				var s = V(r), c = z(s);
				P(s);
				var l = V(s), u = z(l);
				P(l);
				var d = V(l), f = z(d);
				P(d), P(n), P(t), H((e, t, n) => {
					Y(i, `Input tokens: ${e ?? ""}`), Y(c, `Output tokens: ${t ?? ""}`), Y(u, `Total tokens: ${n ?? ""}`), Y(f, `Cost: ${W(o).usage?.cost ?? "Unknown" ?? ""}`);
				}, [
					() => a(W(o).usage?.inputTokens),
					() => a(W(o).usage?.outputTokens),
					() => a(W(o).usage?.totalTokens)
				]), J(e, t);
			};
			X(T, (e) => {
				W(o).kind === "primitive" && e(E);
			}), P(s), H((e, t, r) => {
				$(s, "data-run-row", W(o).key), $(s, "data-depth", W(o).depth), $(s, "data-status", W(o).status), c = ai(s, "", c, e), $(u, "aria-label", "Open " + W(o).title + " in graph"), u.disabled = !n().jump, Y(p, W(o).title), $(m, "data-status", W(o).status), Y(h, t), Y(b, `Duration: ${r ?? ""}`), Y(S, `${W(o).attempts ?? ""} of ${W(o).callBound ?? ""} requests`);
			}, [
				() => ({ "margin-left": `${Math.max(0, Math.min(8, W(o).depth)) * 12}px` }),
				() => r(W(o).status),
				() => i(W(o).durationMs)
			]), K("click", u, () => {
				t.view && n().jump?.(t.view.runId, {
					...W(o).address,
					instancePath: [...W(o).address.instancePath]
				});
			}), J(e, s);
		}), P(C), H((e, n) => {
			$(c, "data-status", t.view.status), Y(l, e), Y(f, `${t.view.completedCount ?? ""} of ${t.view.executableCount ?? ""} stages complete`), Y(m, `${t.view.actualCalls ?? ""} of ${t.view.callBound ?? ""} requests`), Y(g, `Elapsed: ${n ?? ""}`);
		}, [() => r(t.view.status), () => i(t.view.elapsedMs)]), J(e, o);
	}, l = (e) => {
		J(e, bs());
	};
	X(s, (e) => {
		t.view ? e(c) : e(l, -1);
	}), P(o), J(e, o), He();
}
yr(["click"]);
//#endregion
//#region ui/RunMeter.svelte
var Cs = /* @__PURE__ */ q("<span class=\"pc-run-meter-elapsed svelte-1tkcp3\" data-run-elapsed=\"\"> </span>"), ws = /* @__PURE__ */ q("<span class=\"pc-run-pixel svelte-1tkcp3\" data-run-pixel=\"\"></span>"), Ts = /* @__PURE__ */ q("<button class=\"pc-run-meter svelte-1tkcp3\"><span class=\"pc-run-meter-label svelte-1tkcp3\"> </span> <!> <span class=\"pc-run-meter-pixels svelte-1tkcp3\" aria-hidden=\"true\"></span></button>");
function Es(e, t) {
	Ve(t, !0);
	let n = (e) => e === "empty" ? "Ready" : e === "not-run" ? "Not run" : e.charAt(0).toUpperCase() + e.slice(1), r = [
		"cancelling",
		"running",
		"failed",
		"blocked",
		"cancelled",
		"invalid",
		"stale",
		"queued",
		"waiting",
		"not-run"
	], i = /* @__PURE__ */ F(() => {
		if (!t.view) return [];
		let e = t.view.rows.slice(0, t.view.rows.length > 36 ? 35 : 36).map((e) => ({
			key: "row:" + e.id,
			status: e.status,
			title: e.title + " · " + n(e.status)
		}));
		if (t.view.rows.length > 36) {
			let i = t.view.rows.slice(35), a = r.find((e) => i.some((t) => t.status === e)) ?? (i.every((e) => e.status === "completed") ? "completed" : "not-run");
			e.push({
				key: "aggregate",
				status: a,
				title: i.length + " remaining rows · " + n(a) + ". Open run details to inspect every stage."
			});
		}
		return e;
	}), a = /* @__PURE__ */ F(() => t.view ? "Open run details. " + n(t.view.status) + ". " + t.view.completedCount + " of " + t.view.executableCount + " stages complete. " + t.view.actualCalls + " of " + t.view.callBound + " requests." : "Open run details");
	var o = Ar(), s = B(o), c = (e) => {
		var r = Ts(), o = z(r), s = z(o, !0);
		P(o);
		var c = V(o, 2), l = (e) => {
			var n = Cs(), r = z(n);
			P(n), H((e) => Y(r, `${e ?? ""}s`), [() => (t.view.elapsedMs / 1e3).toFixed(1)]), J(e, n);
		}, u = /* @__PURE__ */ F(() => t.view.elapsedMs !== null && Number.isFinite(t.view.elapsedMs) && t.view.elapsedMs >= 0);
		X(c, (e) => {
			W(u) && e(l);
		});
		var d = V(c, 2);
		Z(d, 21, () => W(i), (e) => e.key, (e, t) => {
			var n = ws();
			H(() => {
				$(n, "data-status", W(t).status), $(n, "title", W(t).title);
			}), J(e, n);
		}), P(d), P(r), H((e) => {
			$(r, "aria-label", W(a)), $(r, "title", W(a)), r.disabled = !t.open, Y(s, e);
		}, [() => n(t.view.status)]), K("click", r, () => t.open?.()), J(e, r);
	};
	X(s, (e) => {
		t.view && e(c);
	}), J(e, o), He();
}
yr(["click"]);
//#endregion
//#region ui/PortalManager.svelte
var Ds = /* @__PURE__ */ q("<button type=\"button\" class=\"svelte-mnv790\">Close</button>"), Os = /* @__PURE__ */ q("<option class=\"svelte-mnv790\"> </option>"), ks = /* @__PURE__ */ q("<label class=\"svelte-mnv790\">Portal name<input aria-label=\"Portal name\" class=\"svelte-mnv790\"/></label> <p class=\"pc-note svelte-mnv790\"> </p> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-rename=\"\" class=\"svelte-mnv790\">Rename</button></div>", 1), As = /* @__PURE__ */ q("<p class=\"pc-note svelte-mnv790\">Select a portal or create one from an output.</p>"), js = /* @__PURE__ */ q("<button type=\"button\" data-portal-jump-source=\"\" class=\"svelte-mnv790\">Jump to source</button>"), Ms = /* @__PURE__ */ q("<label class=\"pc-check svelte-mnv790\"><input type=\"checkbox\" aria-label=\"Replace existing connection\" class=\"svelte-mnv790\"/>Replace existing connection</label>"), Ns = /* @__PURE__ */ q("<button type=\"button\" data-portal-jump-consumer=\"\" class=\"svelte-mnv790\">Jump</button>"), Ps = /* @__PURE__ */ q("<div class=\"pc-consumer svelte-mnv790\"><span class=\"svelte-mnv790\"> </span><div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-restore=\"\" class=\"svelte-mnv790\">Restore wire</button> <!></div></div>"), Fs = /* @__PURE__ */ q("<p class=\"pc-note svelte-mnv790\">No consumers.</p>"), Is = /* @__PURE__ */ q("<label class=\"svelte-mnv790\">Existing consumers<select aria-label=\"Existing consumers\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Choose before deleting…</option><option class=\"svelte-mnv790\">Restore visible wires</option><option class=\"svelte-mnv790\">Disconnect consumers</option></select></label>"), Ls = /* @__PURE__ */ q("<details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Consumers</summary> <label class=\"svelte-mnv790\">Compatible receiver<select aria-label=\"Compatible receiver\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select input…</option><!></select></label> <!> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-connect=\"\" class=\"svelte-mnv790\">Connect receiver</button></div> <!> <!> <!> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-delete=\"\" class=\"svelte-mnv790\">Delete portal</button></div></details>"), Rs = /* @__PURE__ */ q("<details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Convert to portal</summary><p class=\"pc-note svelte-mnv790\"> </p><div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-convert=\"\" class=\"svelte-mnv790\"> </button></div></details>"), zs = /* @__PURE__ */ q("<p class=\"pc-error svelte-mnv790\"> </p>"), Bs = /* @__PURE__ */ q("<p class=\"pc-error svelte-mnv790\" role=\"alert\"> </p>"), Vs = /* @__PURE__ */ q("<p class=\"pc-note svelte-mnv790\" role=\"status\">Preparing change…</p>"), Hs = /* @__PURE__ */ q("<p class=\"pc-note svelte-mnv790\"> </p> <label class=\"svelte-mnv790\">Portal<select aria-label=\"Selected portal\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select portal…</option><!></select></label> <!> <details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Source</summary> <label class=\"svelte-mnv790\">Output<select aria-label=\"Portal source\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select output…</option><!></select></label> <label class=\"svelte-mnv790\">New portal name<input aria-label=\"New portal name\" class=\"svelte-mnv790\"/></label> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-create=\"\" class=\"svelte-mnv790\">Create portal</button> <button type=\"button\" data-portal-retarget=\"\" class=\"svelte-mnv790\">Retarget</button> <!></div></details> <!> <!> <!> <!> <!>", 1), Us = /* @__PURE__ */ q("<p class=\"pc-note svelte-mnv790\">Open a graph to manage its portals.</p>"), Ws = /* @__PURE__ */ q("<section class=\"pc-manager svelte-mnv790\" aria-label=\"Manage portals\"><header class=\"svelte-mnv790\"><h2 class=\"svelte-mnv790\">Manage portals</h2><!></header> <!></section>");
function Gs(e, t) {
	Ve(t, !0);
	let n = wi(t, "actions", 19, () => ({})), r = /* @__PURE__ */ L(""), i = /* @__PURE__ */ L(""), a = /* @__PURE__ */ L(""), o = /* @__PURE__ */ L(""), s = /* @__PURE__ */ L(""), c = /* @__PURE__ */ L(!1), l = /* @__PURE__ */ L(""), u = /* @__PURE__ */ L(""), d = "", f = 0, p = !0, m = (e) => JSON.stringify(e.kind === "graph" ? [
		"graph",
		e.workflowId,
		e.instancePath,
		e.definitionRef ? [
			e.definitionRef.id,
			e.definitionRef.version,
			e.definitionRef.semanticHash
		] : null
	] : [
		"library",
		e.definitionRef.id,
		e.definitionRef.version,
		e.definitionRef.semanticHash
	]), h = /* @__PURE__ */ F(() => t.view?.publishers.find((e) => e.id === t.view.selectedPortalId)), g = /* @__PURE__ */ F(() => !!t.view && !!W(h) && t.view.capabilities.rename && (t.view.renameMode === "presentation" ? t.view.canPresent : t.view.scope.kind === "graph" && !t.view.readOnly) && !!n().rename), _ = /* @__PURE__ */ F(() => t.view?.sources.find((e) => e.key === W(a) && e.direction === "output")), v = /* @__PURE__ */ F(() => t.view?.receivers.find((e) => e.key === W(o) && e.direction === "input" && e.kind === W(h)?.kind)), y = /* @__PURE__ */ F(() => !!W(h) && !!W(v) && (!W(v).occupied || W(c)) && C("connect") && !!n().connect), b = /* @__PURE__ */ F(() => !!W(h) && C("remove") && !!n().deletePublisher && (!t.view?.consumers.length || W(s) === "restore" || W(s) === "disconnect"));
	yn(() => {
		let e = t.view ? JSON.stringify([
			t.view.managerKey,
			t.view.revision,
			m(t.view.scope),
			t.view.selectedPortalId,
			t.view.renameMode
		]) : "";
		d !== e && (d = e, R(r, W(h)?.label ?? "", !0), R(i, ""), R(a, t.view?.sources.find((e) => e.nodeId === W(h)?.source.nodeId && e.portId === W(h)?.source.portId)?.key ?? "", !0), R(o, ""), R(s, ""), R(c, !1), R(l, ""), R(u, ""), f++);
	}), Ei(() => {
		p = !1, f++;
	});
	let x = (e) => ({
		managerKey: e.managerKey,
		revision: e.revision,
		scope: Le(e.scope)
	}), S = (e) => ({
		nodeId: e.nodeId,
		portId: e.portId
	});
	function C(e) {
		return !!t.view && !t.view.readOnly && t.view.scope.kind === "graph" && t.view.capabilities[e];
	}
	function w() {
		R(l, ""), R(u, ""), f++;
	}
	async function T(e, n, r) {
		if (!t.view || !n || W(u)) return;
		let i = x(t.view), a = ++f, o = t.view.selectedPortalId;
		R(u, e, !0), R(l, "");
		try {
			let e = await r(i);
			p && a === f && t.view?.managerKey === i.managerKey && t.view.revision === i.revision && m(t.view.scope) === m(i.scope) && t.view.selectedPortalId === o && (R(u, ""), R(l, e.ok ? "" : e.error.code + ": " + e.error.message, !0));
		} catch (e) {
			p && a === f && t.view?.managerKey === i.managerKey && t.view.revision === i.revision && m(t.view.scope) === m(i.scope) && t.view.selectedPortalId === o && (R(u, ""), R(l, e instanceof Error ? e.message : "The portal change could not be accepted.", !0));
		}
	}
	var E = Ws(), D = z(E), O = V(z(D)), k = (e) => {
		var t = Ds();
		K("click", t, () => n().close?.()), J(e, t);
	};
	X(O, (e) => {
		n().close && e(k);
	}), P(D);
	var A = V(D, 2), ee = (e) => {
		var d = Hs(), f = B(d), p = z(f);
		P(f);
		var m = V(f, 2), E = V(z(m)), D = z(E);
		D.value = D.__value = "", Z(V(D), 17, () => t.view.publishers, (e) => e.id, (e, t) => {
			var n = Os(), r = z(n);
			P(n);
			var i = {};
			H(() => {
				Y(r, `${W(t).label ?? ""} · ${W(t).kind ?? ""}`), i !== (i = W(t).id) && (n.value = (n.__value = W(t).id) ?? "");
			}), J(e, n);
		}), P(E);
		var O;
		si(E), P(m);
		var k = V(m, 2), A = (e) => {
			var i = ks(), a = B(i), o = V(z(a));
			Q(o), P(a);
			var s = V(a, 2), c = z(s);
			P(s);
			var l = V(s, 2), d = z(l);
			P(l), H(() => {
				mi(o, W(r)), o.disabled = !W(g), Y(c, `${t.view.renameMode === "presentation" ? "Local workspace label · not exported" : "Authored portal label"} · ${W(h).kind ?? ""}`), d.disabled = !W(g) || !!W(u);
			}), K("input", o, (e) => {
				R(r, e.currentTarget.value, !0), w();
			}), K("click", d, () => {
				let e = W(h)?.id, i = t.view?.renameMode, a = W(r);
				e && i && n().rename && T("rename", W(g), (t) => n().rename(t, e, a, i));
			}), J(e, i);
		}, ee = (e) => {
			J(e, As());
		};
		X(k, (e) => {
			W(h) ? e(A) : e(ee, -1);
		});
		var te = V(k, 2), ne = V(z(te), 2), j = V(z(ne)), re = z(j);
		re.value = re.__value = "", Z(V(re), 17, () => t.view.sources, (e) => e.key, (e, t) => {
			var n = Os(), r = z(n);
			P(n);
			var i = {};
			H(() => {
				Y(r, `${W(t).label ?? ""} · ${W(t).kind ?? ""}`), i !== (i = W(t).key) && (n.value = (n.__value = W(t).key) ?? "");
			}), J(e, n);
		}), P(j);
		var ie;
		si(j), P(ne);
		var ae = V(ne, 2), oe = V(z(ae));
		Q(oe), P(ae);
		var se = V(ae, 2), ce = z(se), le = V(ce, 2), ue = V(le, 2), de = (e) => {
			var r = js();
			K("click", r, () => {
				t.view && W(h) && n().jumpSource?.(x(t.view), S(W(h).source));
			}), J(e, r);
		};
		X(ue, (e) => {
			W(h) && n().jumpSource && e(de);
		}), P(se), P(te);
		var fe = V(te, 2), pe = (e) => {
			var r = Ls(), i = V(z(r), 2), a = V(z(i)), l = z(a);
			l.value = l.__value = "", Z(V(l), 17, () => t.view.receivers, (e) => e.key, (e, t) => {
				var n = Os(), r = z(n);
				P(n);
				var i = {};
				H(() => {
					Y(r, `${W(t).label ?? ""}${W(t).occupied ? " · Connected" : ""}`), i !== (i = W(t).key) && (n.value = (n.__value = W(t).key) ?? "");
				}), J(e, n);
			}), P(a);
			var d;
			si(a), P(i);
			var f = V(i, 2), p = (e) => {
				var t = Ms(), n = z(t);
				Q(n), Ae(), P(t), H((e) => {
					hi(n, W(c)), n.disabled = e;
				}, [() => !C("connect")]), K("change", n, (e) => {
					R(c, e.currentTarget.checked, !0), w();
				}), J(e, t);
			};
			X(f, (e) => {
				W(v)?.occupied && e(p);
			});
			var m = V(f, 2), g = z(m);
			P(m);
			var _ = V(m, 2);
			Z(_, 17, () => t.view.consumers, (e) => e.edgeId, (e, r) => {
				var i = Ps(), a = z(i), o = z(a, !0);
				P(a);
				var s = V(a), c = z(s), l = V(c, 2), d = (e) => {
					var i = Ns();
					K("click", i, () => {
						let e = t.view?.consumers.find((e) => e.edgeId === W(r).edgeId);
						t.view && e && n().jumpConsumer?.(x(t.view), e.edgeId, S(e.to));
					}), J(e, i);
				};
				X(l, (e) => {
					n().jumpConsumer && e(d);
				}), P(s), P(i), H((e) => {
					Y(o, W(r).label), c.disabled = e;
				}, [() => !C("restore") || !n().restoreWire || !!W(u)]), K("click", c, () => {
					let e = t.view?.consumers.find((e) => e.edgeId === W(r).edgeId);
					e && n().restoreWire && T("restore", C("restore"), (t) => n().restoreWire(t, e.edgeId));
				}), J(e, i);
			});
			var E = V(_, 2), D = (e) => {
				J(e, Fs());
			};
			X(E, (e) => {
				t.view.consumers.length || e(D);
			});
			var O = V(E, 2), k = (e) => {
				var t = Is(), n = V(z(t)), r = z(n);
				r.value = r.__value = "";
				var i = V(r);
				i.value = i.__value = "restore";
				var a = V(i);
				a.value = a.__value = "disconnect", P(n);
				var o;
				si(n), P(t), H((e) => {
					n.disabled = e, o !== (o = W(s)) && (n.value = (n.__value = W(s)) ?? "", oi(n, W(s)));
				}, [() => !C("remove")]), K("change", n, (e) => {
					R(s, e.currentTarget.value, !0), w();
				}), J(e, t);
			};
			X(O, (e) => {
				t.view.consumers.length && e(k);
			});
			var A = V(O, 2), ee = z(A);
			P(A), P(r), H((e) => {
				a.disabled = e, d !== (d = W(o)) && (a.value = (a.__value = W(o)) ?? "", oi(a, W(o))), g.disabled = !W(y) || !!W(u), ee.disabled = !W(b) || !!W(u);
			}, [() => !C("connect") || !n().connect]), K("change", a, (e) => {
				R(o, e.currentTarget.value, !0), R(c, !1), w();
			}), K("click", g, () => {
				let e = W(v), t = W(h)?.id, r = W(c);
				e && t && n().connect && T("connect", W(y), (i) => n().connect(i, t, S(e), r));
			}), K("click", ee, () => {
				let e = W(h)?.id, r = t.view?.consumers.length ? W(s) : "restore";
				e && (r === "restore" || r === "disconnect") && n().deletePublisher && T("remove", W(b), (t) => n().deletePublisher(t, e, r));
			}), J(e, r);
		};
		X(fe, (e) => {
			W(h) && e(pe);
		});
		var me = V(fe, 2), he = (e) => {
			var r = Rs(), i = V(z(r)), a = z(i, !0);
			P(i);
			var o = V(i), s = z(o), c = z(s);
			P(s), P(o), P(r), H((e) => {
				Y(a, t.view.conversion.label), s.disabled = e, Y(c, `Convert ${t.view.conversion.kind === "wire" ? "wire" : "output"}`);
			}, [() => !C("convert") || !!W(u) || (t.view.conversion.kind === "wire" ? !n().convertWire : !n().convertOutput)]), K("click", s, () => {
				let e = t.view?.conversion;
				e?.kind === "wire" && n().convertWire ? T("convert", C("convert"), (t) => n().convertWire(t, e.edgeId)) : e?.kind === "output" && n().convertOutput && T("convert", C("convert"), (t) => n().convertOutput(t, S(e.endpoint)));
			}), J(e, r);
		};
		X(me, (e) => {
			t.view.conversion && e(he);
		});
		var ge = V(me, 2), _e = (e) => {
			var n = zs(), r = z(n, !0);
			P(n), H(() => Y(r, t.view.issue)), J(e, n);
		};
		X(ge, (e) => {
			t.view.issue && e(_e);
		});
		var ve = V(ge, 2), ye = (e) => {
			var t = Bs(), n = z(t, !0);
			P(t), H(() => Y(n, W(l))), J(e, t);
		};
		X(ve, (e) => {
			W(l) && e(ye);
		});
		var be = V(ve, 2), xe = (e) => {
			J(e, Vs());
		};
		X(be, (e) => {
			W(u) && e(xe);
		}), H((e, r, o, s) => {
			Y(p, `${t.view.scopeLabel ?? ""}${t.view.readOnly ? " · Read-only graph" : ""}`), E.disabled = !n().selectPortal, O !== (O = t.view.selectedPortalId ?? "") && (E.value = (E.__value = t.view.selectedPortalId ?? "") ?? "", oi(E, t.view.selectedPortalId ?? "")), j.disabled = e, ie !== (ie = W(a)) && (j.value = (j.__value = W(a)) ?? "", oi(j, W(a))), mi(oe, W(i)), oe.disabled = r, ce.disabled = o, le.disabled = s;
		}, [
			() => !C("create") && !C("retarget"),
			() => !C("create") || !n().create,
			() => !C("create") || !n().create || !W(_) || !W(i).trim() || !!W(u),
			() => !C("retarget") || !n().retarget || !W(_) || !W(h) || !!W(u)
		]), K("change", E, (e) => {
			let r = e.currentTarget.value;
			e.currentTarget.selectedIndex >= 0 && t.view && n().selectPortal && (!r || t.view.publishers.some((e) => e.id === r)) && n().selectPortal(x(t.view), r || null);
		}), K("change", j, (e) => {
			R(a, e.currentTarget.value, !0), w();
		}), K("input", oe, (e) => {
			R(i, e.currentTarget.value, !0), w();
		}), K("click", ce, () => {
			let e = W(_), t = W(i);
			e && t.trim() && n().create && T("create", C("create"), (r) => n().create(r, t, S(e)));
		}), K("click", le, () => {
			let e = W(_), t = W(h)?.id;
			e && t && n().retarget && T("retarget", C("retarget"), (r) => n().retarget(r, t, S(e)));
		}), J(e, d);
	}, te = (e) => {
		J(e, Us());
	};
	X(A, (e) => {
		t.view ? e(ee) : e(te, -1);
	}), P(E), J(e, E), He();
}
yr([
	"click",
	"change",
	"input"
]);
//#endregion
//#region ui/SubgraphSave.svelte
var Ks = /* @__PURE__ */ q("<option class=\"svelte-1n658sg\"> </option>"), qs = /* @__PURE__ */ q("<p class=\"pc-save-error svelte-1n658sg\" role=\"alert\"> </p>"), Js = /* @__PURE__ */ q("<div class=\"pc-workspace-overlay svelte-1n658sg\"><div class=\"pc-workspace-dialog pc-subgraph-save svelte-1n658sg\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Save subgraph\" tabindex=\"-1\"><header class=\"svelte-1n658sg\"><h2 class=\"svelte-1n658sg\">Save subgraph</h2><button type=\"button\" aria-label=\"Close save subgraph\" class=\"svelte-1n658sg\">×</button></header> <form class=\"svelte-1n658sg\"><label class=\"svelte-1n658sg\">Name<input aria-label=\"Subgraph name\" maxlength=\"80\" class=\"svelte-1n658sg\"/></label> <label class=\"svelte-1n658sg\">Save as<select aria-label=\"Save as\" class=\"svelte-1n658sg\"><option class=\"svelte-1n658sg\">Save new subgraph</option><!></select></label> <p class=\"svelte-1n658sg\">Edits stay local until you save. Existing placed copies stay unchanged.</p> <!> <footer class=\"svelte-1n658sg\"><button type=\"button\" class=\"svelte-1n658sg\">Cancel</button><button type=\"submit\" data-save-subgraph=\"\" class=\"svelte-1n658sg\"> </button></footer></form></div></div>");
function Ys(e, t) {
	Ve(t, !0);
	let n, r = /* @__PURE__ */ L(""), i = /* @__PURE__ */ L(""), a = /* @__PURE__ */ L(!1), o = /* @__PURE__ */ L(""), s = "", c = 0;
	yn(() => {
		if (t.view.key === s) return;
		s = t.view.key, c++, R(r, t.view.name, !0), R(i, t.view.targetId ?? "", !0), R(a, !1), R(o, "");
		let e = s;
		lr().then(() => {
			if (t.view.key === e) {
				let e = n?.querySelector("input");
				e?.focus({ preventScroll: !0 }), e?.select();
			}
		});
	}), Ti(() => {
		let e = document.activeElement;
		return () => e?.focus({ preventScroll: !0 });
	});
	async function l(e) {
		if (e.preventDefault(), !t.actions || !W(r).trim() || W(a) || W(i) && !t.view.entries.some((e) => e.id === W(i))) return;
		let n = t.view.key, s = ++c;
		R(a, !0), R(o, "");
		try {
			await t.actions.save(n, W(r), W(i) || null);
		} catch {
			t.view.key === n && s === c && R(o, "The subgraph could not be saved. Please try again.");
		} finally {
			t.view.key === n && s === c && R(a, !1);
		}
	}
	function u(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), t.actions?.close()), e.key === "Tab") {
			let t = [...n.querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled)")], r = t[0], i = t.at(-1);
			e.shiftKey && document.activeElement === r && (e.preventDefault(), i?.focus()), !e.shiftKey && document.activeElement === i && (e.preventDefault(), r?.focus());
		}
	}
	var d = Js(), f = z(d), p = z(f), m = V(z(p));
	P(p);
	var h = V(p, 2), g = z(h), _ = V(z(g));
	Q(_), P(g);
	var v = V(g, 2), y = V(z(v)), b = z(y);
	b.value = b.__value = "", Z(V(b), 17, () => t.view.entries, (e) => e.id, (e, t) => {
		var n = Ks(), r = z(n);
		P(n);
		var i = {};
		H(() => {
			Y(r, `Update ${W(t).name ?? ""}`), i !== (i = W(t).id) && (n.value = (n.__value = W(t).id) ?? "");
		}), J(e, n);
	}), P(y), P(v);
	var x = V(v, 4), S = (e) => {
		var n = qs(), r = z(n, !0);
		P(n), H(() => Y(r, t.view.error || W(o))), J(e, n);
	};
	X(x, (e) => {
		(t.view.error || W(o)) && e(S);
	});
	var C = V(x, 2), w = z(C), T = V(w), E = z(T, !0);
	P(T), P(C), P(h), P(f), Ci(f, (e) => n = e, () => n), P(d), H((e) => {
		T.disabled = e, Y(E, W(a) ? "Saving…" : "Save");
	}, [() => !t.actions || !W(r).trim() || W(a)]), G("keydown", f, u, !0), G("paste", f, (e) => e.stopPropagation()), K("click", m, () => t.actions?.close()), G("submit", h, l), yi(_, () => W(r), (e) => R(r, e)), ci(y, () => W(i), (e) => R(i, e)), K("click", w, () => t.actions?.close()), J(e, d), He();
}
yr(["click"]);
//#endregion
//#region ui/FastConnections.svelte
var Xs = /* @__PURE__ */ q("<option class=\"svelte-1n96rai\"> </option>"), Zs = /* @__PURE__ */ q("<p class=\"pc-fast-key-status svelte-1n96rai\"> </p>"), Qs = /* @__PURE__ */ q("<p role=\"alert\" class=\"svelte-1n96rai\"> </p>"), $s = /* @__PURE__ */ q("<p role=\"status\" class=\"svelte-1n96rai\"> </p>"), ec = /* @__PURE__ */ q("<section class=\"pc-fast-connections svelte-1n96rai\" aria-label=\"Fast connection setup\"><p class=\"svelte-1n96rai\">Configure a typed Jev, Laya or compatible model for Fast Decision. Node settings keep only the connection ID.</p> <label class=\"svelte-1n96rai\">Configured Fast connection<select aria-label=\"Configured Fast connection\" class=\"svelte-1n96rai\"><option class=\"svelte-1n96rai\">New connection</option><!></select></label> <div class=\"pc-fast-fields svelte-1n96rai\"><label class=\"svelte-1n96rai\">Connection ID<input aria-label=\"Connection ID\" maxlength=\"128\" class=\"svelte-1n96rai\"/></label> <label class=\"svelte-1n96rai\">Connection name<input aria-label=\"Connection name\" maxlength=\"256\" class=\"svelte-1n96rai\"/></label> <label class=\"svelte-1n96rai\">Provider<select aria-label=\"Provider\" class=\"svelte-1n96rai\"><option class=\"svelte-1n96rai\">Jev API</option><option class=\"svelte-1n96rai\">Laya</option><option class=\"svelte-1n96rai\">Compatible typed API</option></select></label> <label class=\"svelte-1n96rai\">Typed model<input aria-label=\"Typed model\" maxlength=\"256\" class=\"svelte-1n96rai\"/></label></div> <label class=\"svelte-1n96rai\">Typed endpoint<input aria-label=\"Typed endpoint\" type=\"url\" maxlength=\"2048\" class=\"svelte-1n96rai\"/></label> <small class=\"svelte-1n96rai\"> </small> <label class=\"svelte-1n96rai\">Session API key<input aria-label=\"Session API key\" type=\"password\" autocomplete=\"new-password\" spellcheck=\"false\" maxlength=\"8192\" class=\"svelte-1n96rai\"/></label> <small class=\"svelte-1n96rai\">Keys are session-only. Re-enter them after restarting SillyTavern. Leave this field empty to keep an existing session key.</small> <!> <!> <!> <footer class=\"svelte-1n96rai\"><button type=\"button\" class=\"svelte-1n96rai\"> </button><button type=\"button\" class=\"svelte-1n96rai\">Clear session key</button><button type=\"button\" class=\"svelte-1n96rai\">Remove connection</button><button type=\"button\" class=\"svelte-1n96rai\">Close</button></footer></section>");
function tc(e, t) {
	Ve(t, !0);
	let n = wi(t, "actions", 19, () => ({})), r = /* @__PURE__ */ L(""), i = /* @__PURE__ */ L(""), a = /* @__PURE__ */ L(""), o = /* @__PURE__ */ L("jev"), s = /* @__PURE__ */ L(""), c = /* @__PURE__ */ L(""), l = /* @__PURE__ */ L(""), u = /* @__PURE__ */ L(!1), d = /* @__PURE__ */ L(""), f = /* @__PURE__ */ L(""), p = /* @__PURE__ */ L(Qt(fr(() => t.view.userId))), m = 0, h = /* @__PURE__ */ F(() => t.view.connections.find((e) => e.id === W(r)));
	function g() {
		m++, R(p, t.view.userId, !0), v(""), R(f, "The active user changed. Choose a connection for this user.");
	}
	yn(() => {
		W(p) !== t.view.userId && g();
	});
	function _() {
		if (W(p) !== t.view.userId) return g(), null;
		let e = m, n = W(p);
		return {
			userId: n,
			current: () => m === e && W(p) === n && t.view.userId === n
		};
	}
	function v(e) {
		R(r, e, !0), R(l, ""), R(d, ""), R(f, "");
		let n = t.view.connections.find((t) => t.id === e);
		R(i, n?.id ?? "", !0), R(a, n?.label ?? "", !0), R(o, n?.provider ?? "jev", !0), R(s, n?.model ?? "", !0), R(c, n?.endpoint ?? "", !0);
	}
	function y(e) {
		e?.ok ? R(d, e.data?.message ?? "Connection settings updated.", !0) : R(f, e?.error.message ?? "Fast connection settings are unavailable.", !0);
	}
	async function b() {
		if (W(u) || !n().save) return;
		let e = _();
		if (!e) return;
		let t = W(l);
		R(l, ""), R(u, !0), R(d, ""), R(f, "");
		let p = {
			id: W(i),
			label: W(a) || W(i),
			provider: W(o),
			model: W(s),
			...W(o) === "jev" ? {} : { endpoint: W(c) }
		};
		try {
			let i = await n().save(p, t, e.userId);
			e.current() && (y(i), i.ok && R(r, p.id, !0));
		} catch {
			e.current() && R(f, "Fast connection settings could not be updated.");
		} finally {
			R(u, !1);
		}
	}
	async function x() {
		if (!W(r) || W(u) || !n().remove) return;
		let e = _();
		if (e) {
			R(l, ""), R(u, !0), R(f, ""), R(d, "");
			try {
				let t = await n().remove(W(r), e.userId);
				e.current() && (t.ok && v(""), y(t));
			} catch {
				e.current() && R(f, "The connection could not be removed.");
			} finally {
				R(u, !1);
			}
		}
	}
	async function S() {
		if (!W(r) || W(u) || !n().clearCredential) return;
		let e = _();
		if (e) {
			R(l, ""), R(u, !0), R(f, ""), R(d, "");
			try {
				let t = await n().clearCredential(W(r), e.userId);
				e.current() && y(t);
			} catch {
				e.current() && R(f, "The session key could not be cleared.");
			} finally {
				R(u, !1);
			}
		}
	}
	var C = ec(), w = V(z(C), 2), T = V(z(w)), E = z(T);
	E.value = E.__value = "", Z(V(E), 17, () => t.view.connections, (e) => e.id, (e, t) => {
		var n = Xs(), r = z(n);
		P(n);
		var i = {};
		H(() => {
			Y(r, `${W(t).label ?? ""} · ${W(t).provider ?? ""} · ${W(t).model ?? ""}`), i !== (i = W(t).id) && (n.value = (n.__value = W(t).id) ?? "");
		}), J(e, n);
	}), P(T);
	var D;
	si(T), P(w);
	var O = V(w, 2), k = z(O), A = V(z(k));
	Q(A), P(k);
	var ee = V(k, 2), te = V(z(ee));
	Q(te), P(ee);
	var ne = V(ee, 2), j = V(z(ne)), re = z(j);
	re.value = re.__value = "jev";
	var ie = V(re);
	ie.value = ie.__value = "laya";
	var ae = V(ie);
	ae.value = ae.__value = "compatible", P(j);
	var oe;
	si(j), P(ne);
	var se = V(ne, 2), ce = V(z(se));
	Q(ce), P(se), P(O);
	var le = V(O, 2), ue = V(z(le));
	Q(ue), P(le);
	var de = V(le, 2), fe = z(de, !0);
	P(de);
	var pe = V(de, 2), me = V(z(pe));
	Q(me), P(pe);
	var he = V(pe, 4), ge = (e) => {
		var t = Zs(), n = z(t);
		P(t), H(() => Y(n, `Session key: ${W(h).credentialReady ? "ready" : "not entered"}`)), J(e, t);
	};
	X(he, (e) => {
		W(h) && e(ge);
	});
	var _e = V(he, 2), ve = (e) => {
		var n = Qs(), r = z(n, !0);
		P(n), H(() => Y(r, W(f) || t.view.issue)), J(e, n);
	};
	X(_e, (e) => {
		(t.view.issue || W(f)) && e(ve);
	});
	var ye = V(_e, 2), be = (e) => {
		var t = $s(), n = z(t, !0);
		P(t), H(() => Y(n, W(d))), J(e, t);
	};
	X(ye, (e) => {
		W(d) && e(be);
	});
	var xe = V(ye, 2), Se = z(xe), Ce = z(Se, !0);
	P(Se);
	var we = V(Se), Te = V(we), Ee = V(Te);
	P(xe), P(C), H(() => {
		T.disabled = W(u), D !== (D = W(r)) && (T.value = (T.__value = W(r)) ?? "", oi(T, W(r))), mi(A, W(i)), A.disabled = W(u) || !!W(r), mi(te, W(a)), te.disabled = W(u), j.disabled = W(u), oe !== (oe = W(o)) && (j.value = (j.__value = W(o)) ?? "", oi(j, W(o))), mi(ce, W(s)), ce.disabled = W(u), mi(ue, W(o) === "jev" ? "https://api.typesafe.ai/v1/systemone" : W(c)), ue.readOnly = W(o) === "jev", ue.disabled = W(u), Y(fe, W(o) === "jev" ? "Jev uses its fixed SystemOne endpoint and requires a session API key." : "Enter the complete /v1/systemone route using HTTPS or HTTP on localhost. A session key is optional for an unauthenticated local service."), mi(me, W(l)), me.disabled = W(u), Se.disabled = W(u) || !n().save || !!t.view.issue, Y(Ce, W(u) ? "Applying…" : "Save connection"), we.disabled = W(u) || !W(h)?.credentialReady || !n().clearCredential, Te.disabled = W(u) || !W(r) || !n().remove;
	}), K("change", T, (e) => v(e.currentTarget.value)), K("input", A, (e) => R(i, e.currentTarget.value, !0)), K("input", te, (e) => R(a, e.currentTarget.value, !0)), K("change", j, (e) => {
		R(o, e.currentTarget.value, !0);
	}), K("input", ce, (e) => R(s, e.currentTarget.value, !0)), K("input", ue, (e) => R(c, e.currentTarget.value, !0)), K("input", me, (e) => R(l, e.currentTarget.value, !0)), K("click", Se, b), K("click", we, S), K("click", Te, x), K("click", Ee, () => {
		R(l, ""), t.close();
	}), J(e, C), He();
}
yr([
	"change",
	"input",
	"click"
]);
//#endregion
//#region src/workflow/operations/json-data.js?v=0.26.0
function nc(e) {
	if (typeof e != "object" || !e) return JSON.stringify(e);
	if (Array.isArray(e)) {
		let t = "[";
		for (let n = 0; n < e.length; n++) t += `${n ? "," : ""}${nc(e[n])}`;
		return `${t}]`;
	}
	let t = "{", n = Object.keys(e);
	for (let r = 0; r < n.length; r++) {
		let i = n[r];
		t += `${r ? "," : ""}${JSON.stringify(i)}:${nc(e[i])}`;
	}
	return `${t}}`;
}
function rc(e) {
	let t = /* @__PURE__ */ new Set(), n = 0, r = (e, i = 0) => {
		if (i > 32 || ++n > 1e4) throw Error("JSON structure exceeds limits.");
		if (e === null || typeof e == "string" || typeof e == "boolean" || typeof e == "number" && Number.isFinite(e)) return e;
		if (typeof e != "object" || !e) throw Error("Unsupported JSON value.");
		let a = Array.isArray(e), o = Object.getPrototypeOf(e);
		if (a ? o !== Array.prototype : o !== Object.prototype && o !== null) throw Error("JSON objects must be plain.");
		if (t.has(e)) throw Error("JSON values cannot contain cycles.");
		t.add(e);
		let s = a ? [] : {}, c = Reflect.ownKeys(e);
		if (a && c.length !== e.length + 1) throw Error("JSON arrays must be dense.");
		for (let t of c) {
			if (a && t === "length") continue;
			let n = Object.getOwnPropertyDescriptor(e, t);
			if (typeof t != "string" || !n || !Object.hasOwn(n, "value") || !n.enumerable) throw Error("JSON requires enumerable own data properties.");
			if (a && (!/^(0|[1-9]\d*)$/.test(t) || Number(t) >= e.length)) throw Error("JSON arrays cannot contain named properties.");
			Object.defineProperty(s, t, {
				value: r(n.value, i + 1),
				enumerable: !0,
				configurable: !0,
				writable: !0
			});
		}
		return t.delete(e), s;
	};
	try {
		let t = r(e);
		if (new TextEncoder().encode(nc(t)).byteLength > 262144) throw Error("JSON byte limit exceeded.");
		return {
			ok: !0,
			data: { value: t }
		};
	} catch {
		return {
			ok: !1,
			error: {
				code: "INVALID_JSON_VALUE",
				message: "Input must contain only plain JSON data."
			}
		};
	}
}
//#endregion
//#region src/workflow/story-time.js?v=0.26.0
var ic = (e, t) => ({
	ok: !1,
	error: {
		code: e,
		message: t
	}
}), ac = (e) => Number.isSafeInteger(e) && e >= 0, oc = (e, t) => Object.hasOwn(e, t) ? e[t] : void 0, sc = (e) => typeof e == "object" && !!e && !Array.isArray(e), cc = (e) => typeof e == "string" && e.trim().length > 0 && e.length <= 256, lc = (e) => Array.isArray(e) && e.every((e) => typeof e == "string" && e.length > 0 && e.length <= 4096);
function uc(e, t) {
	let n = dc(e);
	if (!n.ok) return n;
	let r = n.data, i = rc(t);
	if (!i.ok || !i.data.value || Array.isArray(i.data.value) || typeof i.data.value != "object") return ic("INVALID_PROPOSAL", "Use a plain duration or destination proposal.");
	let a = i.data.value, o = oc(a, "kind");
	if (o !== "duration" && o !== "destination") return ic("UNRESOLVED_TIME", "An explicit duration or destination is required.");
	if (o === "duration" ? !ac(oc(a, "minutes")) || Object.hasOwn(a, "absoluteMinute") : !ac(oc(a, "absoluteMinute")) || Object.hasOwn(a, "minutes")) return ic("INVALID_PROPOSAL", "Use one nonnegative safe-integer minute value.");
	let s = [
		"kind",
		"evidence",
		o === "duration" ? "minutes" : "absoluteMinute"
	];
	if (Object.keys(a).some((e) => !s.includes(e))) return ic("INVALID_PROPOSAL", "Proposal contains ambiguous or unsupported timing fields.");
	let c = o === "destination" ? a.absoluteMinute : r.absoluteMinute + a.minutes;
	if (!ac(c) || c < r.absoluteMinute) return ic("INVALID_DESTINATION", "Destination must be a forward safe-integer minute.");
	let l = pc(Object.hasOwn(a, "evidence") ? a.evidence : { kind: "explicit" });
	if (!l.ok) return l;
	let u = l.data, d = u.kind, f = structuredClone(r), p = structuredClone(u);
	return o === "duration" && r.timeEvidence?.kind === "estimate" && (p = d === "estimate" ? {
		...p,
		lineage: [.../* @__PURE__ */ new Set([...r.timeEvidence.lineage ?? [r.timeEvidence.origin], ...u.lineage ?? [u.origin]])]
	} : structuredClone(r.timeEvidence), p.lineage?.length > 64) ? ic("EVIDENCE_LIMIT", "Estimate provenance exceeds 64 sources; hold the entire time projection.") : fc({
		previousClock: f,
		clock: {
			...structuredClone(r),
			absoluteMinute: c,
			timeEvidence: p
		},
		requestedAbsoluteMinute: c,
		elapsedMinutes: c - r.absoluteMinute,
		evidence: u,
		actualCalls: 0
	});
}
function dc(e) {
	let t = rc(e);
	if (!t.ok || !t.data.value || typeof t.data.value != "object" || Array.isArray(t.data.value)) return ic("INVALID_CLOCK", "Clock must contain bounded own plain data.");
	let n = t.data.value;
	if (!cc(oc(n, "clockId")) || !cc(oc(n, "calendarId")) || !ac(oc(n, "absoluteMinute")) || !ac(oc(n, "dayLengthMinutes")) || n.dayLengthMinutes === 0) return ic("INVALID_CLOCK", "Clock requires identities and safe-integer minute/calendar values.");
	if (Object.hasOwn(n, "schemaVersion") && n.schemaVersion !== 1) return ic("INVALID_CLOCK", "Clock schema version must be 1.");
	if (Object.hasOwn(n, "revision") && (!ac(n.revision) || n.revision < 1)) return ic("INVALID_CLOCK", "Clock revision must be a positive safe integer.");
	if (Object.hasOwn(n, "timeEvidence") && !pc(n.timeEvidence).ok) return ic("INVALID_CLOCK", "Clock time evidence must retain accepted provenance.");
	if (Object.hasOwn(n, "settledTimeEventIds") && !lc(n.settledTimeEventIds)) return ic("INVALID_CLOCK", "Settled occurrence IDs must be a bounded string array.");
	for (let [e, t] of [
		["unit", "minute"],
		["originMinute", 0],
		["originDay", 1]
	]) if (Object.hasOwn(n, e) && n[e] !== t) return ic("INVALID_CALENDAR", "This calendar uses minute units with minute zero at Day 1.");
	return {
		ok: !0,
		data: n
	};
}
function fc(e) {
	let t = rc(e);
	return t.ok ? {
		ok: !0,
		data: t.data.value
	} : ic("OUTPUT_LIMIT", "Projection exceeds the bounded plain-data DTO budget.");
}
function pc(e) {
	if (!sc(e)) return ic("INVALID_EVIDENCE", "Evidence must be a plain record.");
	let t = oc(e, "kind");
	if (![
		"explicit",
		"authored-rule",
		"validated-extraction",
		"estimate",
		"vague"
	].includes(t)) return ic("INVALID_EVIDENCE", "Use a supported time evidence kind.");
	let n = t === "estimate" ? [
		"kind",
		"origin",
		"acceptancePolicy",
		"lineage"
	] : ["kind", "origin"];
	if (Object.keys(e).some((e) => !n.includes(e))) return ic("INVALID_EVIDENCE", "Evidence contains unsupported or contradictory fields.");
	let r = typeof oc(e, "origin") == "string" && e.origin.trim().length > 0;
	if (Object.hasOwn(e, "origin") && !r) return ic("INVALID_EVIDENCE", "Evidence origin must be nonempty text.");
	if (t === "estimate" && Object.hasOwn(e, "acceptancePolicy") && !["accept", "unresolved"].includes(e.acceptancePolicy)) return ic("INVALID_EVIDENCE", "Estimate acceptance policy must be accept or unresolved.");
	if (Object.hasOwn(e, "lineage")) {
		let t = e.lineage;
		if (!Array.isArray(t) || t.length === 0 || !t.every((e) => typeof e == "string" && e.trim().length > 0) || new Set(t).size !== t.length || !t.includes(e.origin)) return ic("INVALID_EVIDENCE", "Estimate lineage must contain distinct nonempty text origins including the current origin.");
		if (t.length > 64) return ic("EVIDENCE_LIMIT", "Estimate provenance exceeds 64 sources; hold the entire time projection.");
	}
	return t === "vague" || t === "estimate" && (!r || oc(e, "acceptancePolicy") !== "accept") ? ic("UNRESOLVED_TIME", "Estimated or vague time needs an explicit accepted authored rule.") : ["authored-rule", "validated-extraction"].includes(t) && !r ? ic("INVALID_EVIDENCE", "Rule and extraction evidence must identify their origin.") : {
		ok: !0,
		data: e
	};
}
new TextEncoder();
//#endregion
//#region src/ui/story-document-setup.js
var mc = (e, t) => ({
	ok: !1,
	error: {
		code: e,
		message: t
	}
});
function hc(e, t, n = 0) {
	let r = {
		schemaVersion: 1,
		clockId: e,
		calendarId: t,
		dayLengthMinutes: 1440,
		absoluteMinute: n,
		revision: 1,
		unit: "minute",
		originMinute: 0,
		originDay: 1,
		timeEvidence: { kind: "explicit" }
	};
	return uc(r, {
		kind: "duration",
		minutes: 0
	}).ok ? {
		ok: !0,
		data: { text: JSON.stringify(r, null, 2) }
	} : mc("INVALID_CLOCK_TEMPLATE", "Choose explicit clock/calendar IDs and a nonnegative whole story minute.");
}
//#endregion
//#region ui/StoryDocuments.svelte
var gc = /* @__PURE__ */ q("<p role=\"alert\" class=\"svelte-1t33cem\"> </p>"), _c = /* @__PURE__ */ q("<option class=\"svelte-1t33cem\"> </option>"), vc = /* @__PURE__ */ q("<label class=\"svelte-1t33cem\">Actor ID<input aria-label=\"Actor ID\" maxlength=\"128\" class=\"svelte-1t33cem\"/></label>"), yc = /* @__PURE__ */ q("<label class=\"svelte-1t33cem\">CSV columns, comma separated<input aria-label=\"CSV columns\" class=\"svelte-1t33cem\"/></label>"), bc = /* @__PURE__ */ q("<details class=\"svelte-1t33cem\"><summary class=\"svelte-1t33cem\">Story clock template</summary><label class=\"svelte-1t33cem\">Calendar ID<input aria-label=\"Calendar ID\" class=\"svelte-1t33cem\"/></label><label class=\"svelte-1t33cem\">Starting story minute<input aria-label=\"Starting story minute\" type=\"number\" min=\"0\" step=\"1\" class=\"svelte-1t33cem\"/></label><button type=\"button\" class=\"svelte-1t33cem\">Use story clock template</button><p class=\"svelte-1t33cem\">Midnight on the first day is minute 0. The clock advances through graph events, using explicit story time.</p></details>"), xc = /* @__PURE__ */ q("<p role=\"status\" class=\"svelte-1t33cem\"> </p>"), Sc = /* @__PURE__ */ q("<div class=\"pc-story-documents svelte-1t33cem\"><p class=\"svelte-1t33cem\"> </p> <p class=\"svelte-1t33cem\">Authorize logical story documents here. Updating an authorization or its initial template leaves existing canonical document content intact. Read File and Write File use these target IDs.</p> <!> <label class=\"svelte-1t33cem\">Story document<select aria-label=\"Story document\" class=\"svelte-1t33cem\"><option class=\"svelte-1t33cem\">New document authorization</option><!></select></label> <div class=\"pc-document-actions svelte-1t33cem\"><button type=\"button\" class=\"svelte-1t33cem\">Load initial template</button><button type=\"button\" class=\"svelte-1t33cem\">Remove authorization</button><button type=\"button\" class=\"svelte-1t33cem\">Refresh scope</button></div> <form class=\"svelte-1t33cem\"><label class=\"svelte-1t33cem\">Logical target ID<input aria-label=\"Logical target ID\" maxlength=\"128\" placeholder=\"souls.json\" class=\"svelte-1t33cem\"/></label> <label class=\"svelte-1t33cem\">Document name<input aria-label=\"Document name\" maxlength=\"256\" class=\"svelte-1t33cem\"/></label> <label class=\"svelte-1t33cem\">Format<select aria-label=\"Document format\" class=\"svelte-1t33cem\"><option class=\"svelte-1t33cem\">JSON</option><option class=\"svelte-1t33cem\">JSON Lines</option><option class=\"svelte-1t33cem\">CSV</option><option class=\"svelte-1t33cem\">Plain text</option><option class=\"svelte-1t33cem\">Markdown</option></select></label> <label class=\"svelte-1t33cem\">Visibility<select aria-label=\"Document visibility\" class=\"svelte-1t33cem\"><option class=\"svelte-1t33cem\">Public</option><option class=\"svelte-1t33cem\">Hidden</option><option class=\"svelte-1t33cem\">Actor private</option></select></label> <!> <!> <!> <label class=\"svelte-1t33cem\">Initial template<textarea aria-label=\"Initial template\" rows=\"7\" maxlength=\"100000\" class=\"svelte-1t33cem\"></textarea></label> <p class=\"svelte-1t33cem\">JSON templates preserve your chosen object or list structure. CSV uses the named columns. Existing authorizations require explicit template loading before editing.</p> <!><!> <footer class=\"svelte-1t33cem\"><button type=\"button\" class=\"svelte-1t33cem\">Close</button><button type=\"submit\" class=\"svelte-1t33cem\"> </button></footer></form></div>");
function Cc(e, t) {
	Ve(t, !0);
	let n = /* @__PURE__ */ L(""), r = /* @__PURE__ */ L(""), i = /* @__PURE__ */ L(""), a = /* @__PURE__ */ L("json"), o = /* @__PURE__ */ L(""), s = /* @__PURE__ */ L("public"), c = /* @__PURE__ */ L(""), l = /* @__PURE__ */ L(""), u = /* @__PURE__ */ L(!1), d = /* @__PURE__ */ L(""), f = /* @__PURE__ */ L(""), p = /* @__PURE__ */ L(!1), m = /* @__PURE__ */ L("story-calendar"), h = /* @__PURE__ */ L(0), g = "", _ = 0;
	function v() {
		R(r, ""), R(i, ""), R(a, "json"), R(o, ""), R(s, "public"), R(c, ""), R(l, ""), R(p, !1), R(d, ""), R(f, "");
	}
	yn(() => {
		t.view.key !== g && (g = t.view.key, _++, R(u, !1), R(n, ""), v());
	});
	function y() {
		_++, R(u, !1), v();
		let e = t.view.documents.find((e) => e.targetId === W(n));
		e && (R(r, e.targetId, !0), R(i, e.name, !0), R(a, e.format, !0), R(s, e.visibility.kind, !0), R(c, e.visibility.kind === "actor-private" ? e.visibility.actorId : "", !0), R(l, e.columns?.join(", ") ?? "", !0));
	}
	function b() {
		let e = hc(W(r), W(m), W(h));
		e.ok ? (R(o, e.data.text, !0), R(d, "")) : R(d, e.error.message, !0);
	}
	async function x(e) {
		if (!t.actions || W(u) || !t.view.key) return;
		let m = t.view.key, h = ++_;
		R(u, !0), R(d, ""), R(f, "");
		try {
			let u;
			if (e === "load") u = await t.actions.load(m, W(n));
			else if (e === "remove") u = await t.actions.remove(m, W(n));
			else {
				let e = {
					targetId: W(r),
					name: W(i),
					format: W(a),
					content: W(o),
					visibility: W(s) === "actor-private" ? {
						kind: W(s),
						actorId: W(c)
					} : { kind: W(s) }
				};
				W(a) === "csv" && (e.columns = W(l).split(",").map((e) => e.trim()).filter(Boolean)), u = await t.actions.save(m, e);
			}
			if (m !== t.view.key || h !== _) return;
			if (!u?.ok) {
				R(d, u?.error?.message ?? "Story document setup could not be applied.", !0);
				return;
			}
			if (e === "load") {
				let e = u.data?.definition;
				if (!e) {
					R(d, "The initial template could not be loaded.");
					return;
				}
				R(r, e.targetId, !0), R(i, e.name, !0), R(a, e.format, !0), R(o, e.content, !0), R(s, e.visibility.kind, !0), R(c, e.visibility.actorId ?? "", !0), R(l, e.columns?.join(", ") ?? "", !0), R(p, !0);
			} else R(f, u.data?.message ?? "Authorization updated locally.", !0), R(p, !1);
		} catch {
			m === t.view.key && h === _ && R(d, "Story document setup could not be applied.");
		} finally {
			m === t.view.key && h === _ && R(u, !1);
		}
	}
	var S = Sc(), C = z(S), w = z(C);
	P(C);
	var T = V(C, 4), E = (e) => {
		var n = gc(), r = z(n, !0);
		P(n), H(() => Y(r, t.view.issue)), J(e, n);
	};
	X(T, (e) => {
		t.view.issue && e(E);
	});
	var D = V(T, 2), O = V(z(D)), k = z(O);
	k.value = k.__value = "", Z(V(k), 17, () => t.view.documents, (e) => e.targetId, (e, t) => {
		var n = _c(), r = z(n);
		P(n);
		var i = {};
		H(() => {
			Y(r, `${W(t).name ?? ""} (${W(t).targetId ?? ""}, ${W(t).format ?? ""}, ${W(t).visibility.kind ?? ""})`), i !== (i = W(t).targetId) && (n.value = (n.__value = W(t).targetId) ?? "");
		}), J(e, n);
	}), P(O), P(D);
	var A = V(D, 2), ee = z(A), te = V(ee), ne = V(te);
	P(A);
	var j = V(A, 2), re = z(j), ie = V(z(re));
	Q(ie), P(re);
	var ae = V(re, 2), oe = V(z(ae));
	Q(oe), P(ae);
	var se = V(ae, 2), ce = V(z(se)), le = z(ce);
	le.value = le.__value = "json";
	var ue = V(le);
	ue.value = ue.__value = "jsonl";
	var de = V(ue);
	de.value = de.__value = "csv";
	var fe = V(de);
	fe.value = fe.__value = "text";
	var pe = V(fe);
	pe.value = pe.__value = "markdown", P(ce), P(se);
	var me = V(se, 2), he = V(z(me)), ge = z(he);
	ge.value = ge.__value = "public";
	var _e = V(ge);
	_e.value = _e.__value = "hidden";
	var ve = V(_e);
	ve.value = ve.__value = "actor-private", P(he), P(me);
	var ye = V(me, 2), be = (e) => {
		var t = vc(), n = V(z(t));
		Q(n), P(t), H(() => n.disabled = W(u)), yi(n, () => W(c), (e) => R(c, e)), J(e, t);
	};
	X(ye, (e) => {
		W(s) === "actor-private" && e(be);
	});
	var xe = V(ye, 2), Se = (e) => {
		var t = yc(), n = V(z(t));
		Q(n), P(t), H(() => n.disabled = W(u)), yi(n, () => W(l), (e) => R(l, e)), J(e, t);
	};
	X(xe, (e) => {
		W(a) === "csv" && e(Se);
	});
	var Ce = V(xe, 2), we = (e) => {
		var t = bc(), i = V(z(t)), a = V(z(i));
		Q(a), P(i);
		var o = V(i), s = V(z(o));
		Q(s), P(o);
		var c = V(o);
		Ae(), P(t), H((e) => {
			a.disabled = W(u), s.disabled = W(u), c.disabled = e;
		}, [() => !W(r).trim() || W(u) || !!W(n) && !W(p)]), yi(a, () => W(m), (e) => R(m, e)), yi(s, () => W(h), (e) => R(h, e)), K("click", c, b), J(e, t);
	};
	X(Ce, (e) => {
		W(a) === "json" && e(we);
	});
	var Te = V(Ce, 2), Ee = V(z(Te));
	rt(Ee), P(Te);
	var M = V(Te, 4), De = (e) => {
		var t = gc(), n = z(t, !0);
		P(t), H(() => Y(n, W(d))), J(e, t);
	};
	X(M, (e) => {
		W(d) && e(De);
	});
	var N = V(M), Oe = (e) => {
		var n = xc(), r = z(n, !0);
		P(n), H(() => Y(r, W(f) || t.view.notice)), J(e, n);
	};
	X(N, (e) => {
		(W(f) || t.view.notice) && e(Oe);
	});
	var ke = V(N, 2), je = z(ke), Me = V(je), Ne = z(Me, !0);
	P(Me), P(ke), P(j), P(S), H((e) => {
		Y(w, `Active user: ${(t.view.scope.userId || "Unavailable") ?? ""} · Chat: ${(t.view.scope.chatId || "Unavailable") ?? ""}`), O.disabled = W(u), ee.disabled = !W(n) || W(u), te.disabled = !W(n) || W(u), ne.disabled = W(u), ie.disabled = !!W(n) || W(u), oe.disabled = W(u), ce.disabled = !!W(n) || W(u), he.disabled = W(u), Ee.disabled = W(u) || !!W(n) && !W(p), $(Ee, "placeholder", W(a) === "json" ? "[]" : ""), Me.disabled = e, Y(Ne, W(u) ? "Saving…" : "Save authorization");
	}, [() => !t.actions || !t.view.key || !W(r).trim() || !W(i).trim() || W(u) || !!W(n) && !W(p) || W(s) === "actor-private" && !W(c).trim()]), K("change", O, y), ci(O, () => W(n), (e) => R(n, e)), K("click", ee, () => x("load")), K("click", te, () => x("remove")), K("click", ne, () => t.actions?.refresh()), G("submit", j, (e) => {
		e.preventDefault(), x("save");
	}), yi(ie, () => W(r), (e) => R(r, e)), yi(oe, () => W(i), (e) => R(i, e)), ci(ce, () => W(a), (e) => R(a, e)), ci(he, () => W(s), (e) => R(s, e)), yi(Ee, () => W(o), (e) => R(o, e)), K("click", je, function(...e) {
		t.close?.apply(this, e);
	}), J(e, S), He();
}
yr(["change", "click"]);
//#endregion
//#region ui/RecallArms.svelte
var wc = /* @__PURE__ */ q("<p class=\"svelte-34wc6n\"> </p>"), Tc = /* @__PURE__ */ q("<p role=\"alert\" class=\"svelte-34wc6n\"> </p>"), Ec = /* @__PURE__ */ q("<p class=\"svelte-34wc6n\">Add a Hotkey Arm node to the assigned unified workflow for the active character, then enable Lattice. Configure the actor, memory set, target and use policy in Details.</p>"), Dc = /* @__PURE__ */ q("<fieldset class=\"svelte-34wc6n\"><legend> </legend> <p class=\"svelte-34wc6n\"> </p> <p class=\"svelte-34wc6n\"> </p> <button type=\"button\"> </button></fieldset>"), Oc = /* @__PURE__ */ q("<header class=\"svelte-34wc6n\"><h2>Recall arms</h2><button type=\"button\">Close</button></header> <p class=\"svelte-34wc6n\">Arm a memory set for the next reply, generated swipe, or both. Automatic Recall triggers use the workflow’s own conditions.</p> <!> <!> <!> <!> <p class=\"svelte-34wc6n\"><button type=\"button\">Refresh recall state</button></p> <small class=\"svelte-34wc6n\">Shortcuts use physical keys and do not fire while typing in inputs. Duplicate active shortcuts require a different key. Editing the graph or switching scope revokes old shortcuts.</small>", 1);
function kc(e, t) {
	Ve(t, !0);
	let n = /* @__PURE__ */ L(""), r = /* @__PURE__ */ L(""), i = (e) => [
		e.ctrl ? "Ctrl" : "",
		e.alt ? "Alt" : "",
		e.shift ? "Shift" : "",
		e.meta ? "Meta" : "",
		e.code.replace(/^Key|^Digit/u, "")
	].filter(Boolean).join("+");
	async function a(e, i) {
		if (!W(n)) {
			R(n, e, !0), R(r, "");
			try {
				let n = await (i ? t.actions?.disarm(e) : t.actions?.arm(e));
				n?.ok !== !0 && R(r, n?.error.message ?? "Recall controls are unavailable.", !0);
			} catch {
				R(r, "Recall controls are unavailable.");
			} finally {
				R(n, "");
			}
		}
	}
	var o = Oc(), s = B(o), c = V(z(s));
	P(s);
	var l = V(s, 4), u = (e) => {
		var n = wc(), r = z(n);
		P(n), H(() => Y(r, `User ${t.view.scope.userId ?? ""} · Chat ${t.view.scope.chatId ?? ""} · Actor ${t.view.scope.actorId ?? ""}`)), J(e, n);
	};
	X(l, (e) => {
		t.view.scope && e(u);
	});
	var d = V(l, 2), f = (e) => {
		var n = Tc(), i = z(n, !0);
		P(n), H(() => Y(i, W(r) || t.view.issue)), J(e, n);
	};
	X(d, (e) => {
		(t.view.issue || W(r)) && e(f);
	});
	var p = V(d, 2), m = (e) => {
		J(e, Ec());
	};
	X(p, (e) => {
		t.view.nodes.length || e(m);
	});
	var h = V(p, 2);
	Z(h, 17, () => t.view.nodes, (e) => e.nodeId, (e, r) => {
		var o = Dc(), s = z(o), c = z(s);
		P(s);
		var l = V(s, 2), u = z(l);
		P(l);
		var d = V(l, 2), f = z(d);
		P(d);
		var p = V(d, 2), m = z(p, !0);
		P(p), P(o), H((e) => {
			Y(c, `${W(r).memorySetId ?? ""} · ${W(r).armed ? "Armed" : "Disarmed"}`), Y(u, `${e ?? ""} · ${W(r).target ?? ""} · ${W(r).uses ?? ""} · consume on ${W(r).consumeOn ?? ""}`), Y(f, `Remaining: ${W(r).remaining.reply ? "reply " : ""}${W(r).remaining.swipe ? "swipe" : ""}${!W(r).remaining.reply && !W(r).remaining.swipe ? "none" : ""}. Pending generations: ${W(r).pendingCount ?? ""}.`), $(p, "aria-label", (W(r).armed ? "Disarm " : "Arm ") + W(r).memorySetId), p.disabled = !!W(n) || !t.actions, Y(m, W(n) === W(r).nodeId ? "Updating…" : W(r).armed ? "Disarm" : "Arm");
		}, [() => i(W(r).hotkey)]), K("click", p, () => a(W(r).nodeId, W(r).armed)), J(e, o);
	});
	var g = V(h, 2), _ = z(g);
	P(g), Ae(2), H(() => _.disabled = !!W(n) || !t.actions), K("click", c, function(...e) {
		t.close?.apply(this, e);
	}), K("click", _, () => t.actions?.refresh()), J(e, o), He();
}
yr(["click"]);
//#endregion
//#region ui/ConfigureNode.svelte
var Ac = /* @__PURE__ */ q("<option class=\"svelte-1srbsqt\"> </option>"), jc = /* @__PURE__ */ q("<p class=\"svelte-1srbsqt\">Authorize a document in Tools › Story documents, then reopen node creation.</p>"), Mc = /* @__PURE__ */ q("<label class=\"svelte-1srbsqt\">Authorized story document<select aria-label=\"Authorized story document\" class=\"svelte-1srbsqt\"><option class=\"svelte-1srbsqt\">Choose an authorized target</option><!></select></label><!>", 1), Nc = /* @__PURE__ */ q("<label class=\"svelte-1srbsqt\">Pinned Data helper<select aria-label=\"Pinned Data helper\" class=\"svelte-1srbsqt\"><option class=\"svelte-1srbsqt\">Choose an existing item/result helper</option><!></select></label><p class=\"svelte-1srbsqt\">Helpers use exact pinned versions with Data item and result ports. Set iteration mode and requestBoundPerIteration in the controls below.</p>", 1), Pc = /* @__PURE__ */ q("<p role=\"alert\" class=\"svelte-1srbsqt\"> </p>"), Fc = /* @__PURE__ */ q("<div class=\"pc-workspace-overlay svelte-1srbsqt\"><div class=\"pc-workspace-dialog pc-configure-node svelte-1srbsqt\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Configure node\" tabindex=\"-1\"><header class=\"svelte-1srbsqt\"><h2 class=\"svelte-1srbsqt\"> </h2><button type=\"button\" aria-label=\"Close node configuration\" class=\"svelte-1srbsqt\">×</button></header> <p class=\"svelte-1srbsqt\">Complete the required settings before creating the node. Cancel leaves the graph unchanged.</p> <form class=\"svelte-1srbsqt\"><label class=\"svelte-1srbsqt\">Stage<select aria-label=\"Node stage\" class=\"svelte-1srbsqt\"><option class=\"svelte-1srbsqt\">Preparation</option><option class=\"svelte-1srbsqt\">Response</option></select></label> <!> <!> <label class=\"svelte-1srbsqt\">Declared node controls<textarea aria-label=\"Node controls JSON\" rows=\"14\" maxlength=\"200000\" class=\"svelte-1srbsqt\"></textarea></label> <!> <footer class=\"svelte-1srbsqt\"><button type=\"button\" class=\"svelte-1srbsqt\">Cancel</button><button type=\"submit\" class=\"svelte-1srbsqt\"> </button></footer></form></div></div>");
function Ic(e, t) {
	Ve(t, !0);
	let n, r = /* @__PURE__ */ L(""), i = /* @__PURE__ */ L("pre"), a = /* @__PURE__ */ L(""), o = /* @__PURE__ */ L(""), s = /* @__PURE__ */ L(!1), c = /* @__PURE__ */ L(""), l = "", u = 0, d = /* @__PURE__ */ F(() => t.view.operation === "read-file" || t.view.operation === "story-clock" || t.view.operation === "commit-outcomes");
	yn(() => {
		if (t.view.key === l) return;
		l = t.view.key, u++, R(r, t.view.controls, !0), R(i, t.view.phase, !0), R(s, !1), R(c, "");
		try {
			let e = JSON.parse(W(r));
			R(a, e.targetId ?? e.clockId ?? "", !0), R(o, t.view.helpers.find((t) => JSON.stringify(t.ref) === JSON.stringify(e.helper))?.key ?? "", !0);
		} catch {
			R(a, ""), R(o, "");
		}
		let e = l;
		lr().then(() => {
			t.view.key === e && n?.querySelector("select,textarea,input")?.focus({ preventScroll: !0 });
		});
	}), Ti(() => {
		let e = document.activeElement;
		return () => e?.focus({ preventScroll: !0 });
	});
	function f(e, t) {
		try {
			let n = JSON.parse(W(r));
			if (!n || Array.isArray(n) || typeof n != "object") throw Error();
			n[e] = t, R(r, JSON.stringify(n, null, 2), !0), R(c, "");
		} catch {
			R(c, "Use a JSON object before selecting a configured value.");
		}
	}
	async function p(e) {
		if (e.preventDefault(), !t.actions || W(s)) return;
		let n = t.view.key, a = ++u;
		R(s, !0), R(c, "");
		try {
			let e = await t.actions.apply(n, W(r), W(i));
			n === t.view.key && a === u && !e?.ok && R(c, e?.error?.message ?? "The node could not be prepared.", !0);
		} catch {
			n === t.view.key && a === u && R(c, "The node could not be prepared.");
		} finally {
			n === t.view.key && a === u && R(s, !1);
		}
	}
	function m(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), t.actions?.cancel(t.view.key)), e.key === "Tab") {
			let t = [...n.querySelectorAll("button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled)")], r = t[0], i = t.at(-1);
			e.shiftKey && document.activeElement === r && (e.preventDefault(), i?.focus()), !e.shiftKey && document.activeElement === i && (e.preventDefault(), r?.focus());
		}
	}
	var h = Fc(), g = z(h), _ = z(g), v = z(_), y = z(v);
	P(v);
	var b = V(v);
	P(_);
	var x = V(_, 4), S = z(x), C = V(z(S)), w = z(C);
	w.value = w.__value = "pre";
	var T = V(w);
	T.value = T.__value = "post", P(C), P(S);
	var E = V(S, 2), D = (e) => {
		var n = Mc(), r = B(n), i = V(z(r)), o = z(i);
		o.value = o.__value = "", Z(V(o), 17, () => t.view.targets.filter((e) => !["story-clock", "commit-outcomes"].includes(t.view.operation) || e.format === "json"), (e) => e.targetId, (e, t) => {
			var n = Ac(), r = z(n);
			P(n);
			var i = {};
			H(() => {
				Y(r, `${W(t).name ?? ""} (${W(t).targetId ?? ""})`), i !== (i = W(t).targetId) && (n.value = (n.__value = W(t).targetId) ?? "");
			}), J(e, n);
		}), P(i), P(r);
		var c = V(r), l = (e) => {
			J(e, jc());
		};
		X(c, (e) => {
			t.view.targets.length || e(l);
		}), H(() => i.disabled = W(s)), K("change", i, () => f(t.view.operation === "story-clock" ? "clockId" : "targetId", W(a))), ci(i, () => W(a), (e) => R(a, e)), J(e, n);
	};
	X(E, (e) => {
		W(d) && e(D);
	});
	var O = V(E, 2), k = (e) => {
		var n = Nc(), r = B(n), i = V(z(r)), a = z(i);
		a.value = a.__value = "", Z(V(a), 17, () => t.view.helpers, (e) => e.key, (e, t) => {
			var n = Ac(), r = z(n);
			P(n);
			var i = {};
			H(() => {
				Y(r, `${W(t).label ?? ""}${W(t).stateful ? " (projected state)" : ""}`), i !== (i = W(t).key) && (n.value = (n.__value = W(t).key) ?? "");
			}), J(e, n);
		}), P(i), P(r), Ae(), H(() => i.disabled = W(s)), K("change", i, () => {
			let e = t.view.helpers.find((e) => e.key === W(o));
			e && f("helper", e.ref);
		}), ci(i, () => W(o), (e) => R(o, e)), J(e, n);
	};
	X(O, (e) => {
		t.view.operation === "for-each" && e(k);
	});
	var A = V(O, 2), ee = V(z(A));
	rt(ee), P(A);
	var te = V(A, 2), ne = (e) => {
		var t = Pc(), n = z(t, !0);
		P(t), H(() => Y(n, W(c))), J(e, t);
	};
	X(te, (e) => {
		W(c) && e(ne);
	});
	var j = V(te, 2), re = z(j), ie = V(re), ae = z(ie, !0);
	P(ie), P(j), P(x), P(g), Ci(g, (e) => n = e, () => n), P(h), H(() => {
		Y(y, `Configure ${t.view.title ?? ""}`), C.disabled = t.view.phaseLocked || W(s), ee.disabled = W(s), ie.disabled = !t.actions || W(s), Y(ae, W(s) ? "Preparing…" : "Create node");
	}), G("keydown", g, m, !0), G("paste", g, (e) => e.stopPropagation()), K("click", b, () => t.actions?.cancel(t.view.key)), G("submit", x, p), ci(C, () => W(i), (e) => R(i, e)), yi(ee, () => W(r), (e) => R(r, e)), K("click", re, () => t.actions?.cancel(t.view.key)), J(e, h), He();
}
yr(["click", "change"]);
//#endregion
//#region ui/NewWorkflowPrompt.svelte
var Lc = /* @__PURE__ */ q("<div class=\"pc-workspace-overlay\"><div class=\"pc-workspace-dialog pc-new-workflow-prompt svelte-121ekho\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Save workflow changes?\" tabindex=\"-1\"><h2 class=\"svelte-121ekho\">Save workflow changes?</h2> <p class=\"svelte-121ekho\"><strong class=\"svelte-121ekho\"> </strong> has unsaved changes.</p> <p class=\"svelte-121ekho\">Save downloads workflow JSON before opening a new workflow. Your existing workflow stays in the workspace.</p> <label class=\"svelte-121ekho\">New workflow type<select aria-label=\"New workflow type\" class=\"svelte-121ekho\"><option>Unified workflow</option><option>Legacy pre workflow</option><option>Legacy post workflow</option></select></label> <footer class=\"svelte-121ekho\"><button type=\"button\" class=\"svelte-121ekho\">Save</button><button type=\"button\" class=\"svelte-121ekho\">Discard</button><button type=\"button\" class=\"svelte-121ekho\">Cancel</button></footer></div></div>");
function Rc(e, t) {
	Ve(t, !0);
	let n = /* @__PURE__ */ L(Qt(fr(() => t.view.phase ?? "unified"))), r, i;
	Ti(() => {
		let e = document.activeElement;
		return i.focus({ preventScroll: !0 }), () => e?.focus({ preventScroll: !0 });
	});
	function a(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), t.actions?.choose("cancel", W(n))), e.key === "Tab") {
			let t = [...r.querySelectorAll("button:not(:disabled), select:not(:disabled)")], n = t.indexOf(document.activeElement);
			e.shiftKey && n <= 0 && (e.preventDefault(), t.at(-1)?.focus()), !e.shiftKey && (n < 0 || n === t.length - 1) && (e.preventDefault(), t[0]?.focus());
		}
	}
	var o = Lc(), s = z(o), c = V(z(s), 2), l = z(c), u = z(l, !0);
	P(l), Ae(), P(c);
	var d = V(c, 4), f = V(z(d)), p = z(f);
	p.value = p.__value = "unified";
	var m = V(p);
	m.value = m.__value = "pre";
	var h = V(m);
	h.value = h.__value = "post", P(f);
	var g;
	si(f), P(d);
	var _ = V(d, 2), v = z(_), y = V(v), b = V(y);
	Ci(b, (e) => i = e, () => i), P(_), P(s), Ci(s, (e) => r = e, () => r), P(o), H(() => {
		Y(u, t.view.name), g !== (g = W(n)) && (f.value = (f.__value = W(n)) ?? "", oi(f, W(n)));
	}), G("keydown", s, a, !0), G("paste", s, (e) => e.stopPropagation(), !0), K("change", f, (e) => R(n, e.currentTarget.value, !0)), K("click", v, () => t.actions?.choose("save", W(n))), K("click", y, () => t.actions?.choose("discard", W(n))), K("click", b, () => t.actions?.choose("cancel", W(n))), J(e, o), He();
}
yr(["change", "click"]);
//#endregion
//#region ui/NodeSearch.svelte
var zc = /* @__PURE__ */ q("<label class=\"pc-context-check svelte-golf61\"><input type=\"checkbox\" class=\"svelte-golf61\"/>Context sensitive</label>"), Bc = /* @__PURE__ */ q("<span class=\"pc-search-context svelte-golf61\"> </span>"), Vc = /* @__PURE__ */ q("<label class=\"pc-search-field svelte-golf61\"><input type=\"search\" aria-label=\"Search nodes and subgraphs\" placeholder=\"Search…\" autocomplete=\"off\" role=\"combobox\" aria-expanded=\"true\" class=\"svelte-golf61\"/></label> <!> <!>", 1), Hc = /* @__PURE__ */ q("<p class=\"pc-search-context svelte-golf61\">Choose the named port to connect.</p>"), Uc = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-search-result svelte-golf61\" role=\"option\"><span class=\"svelte-golf61\"> </span> <span class=\"pc-family svelte-golf61\"> </span></button>"), Wc = /* @__PURE__ */ q("<p class=\"pc-empty svelte-golf61\">No nodes match.</p>"), Gc = /* @__PURE__ */ q("<p class=\"pc-feedback svelte-golf61\" role=\"status\"> </p>"), Kc = /* @__PURE__ */ q("<div class=\"pc-node-search svelte-golf61\" role=\"dialog\" aria-modal=\"false\" tabindex=\"-1\"><!> <div class=\"pc-search-results svelte-golf61\" role=\"listbox\"></div> <!></div>");
function qc(e, t) {
	let n = jr();
	Ve(t, !0);
	let r = wi(t, "view", 3, null), i = wi(t, "actions", 19, () => ({})), a = /* @__PURE__ */ L(void 0), o = /* @__PURE__ */ L(void 0), s = /* @__PURE__ */ L(""), c = /* @__PURE__ */ L(0), l = /* @__PURE__ */ L(8), u = /* @__PURE__ */ L(8), d, f, p = (e) => [
		e.label,
		e.family,
		e.purpose ?? "",
		e.shortcode ?? "",
		...e.searchAliases ?? []
	].join(" ").toLocaleLowerCase(), m = /* @__PURE__ */ F(() => (r()?.choices ?? []).filter((e) => p(e).includes(W(s).toLocaleLowerCase().trim()))), h = /* @__PURE__ */ F(() => r()?.mode === "ports" ? r().ports : W(m)), g = (e) => "id" in e ? e.id : e.portId, _ = (e) => !!r()?.readOnly || "disabledReason" in e && !!e.disabledReason, v = /* @__PURE__ */ F(() => W(h).filter((e) => !_(e))), y = /* @__PURE__ */ F(() => W(v)[Math.min(W(c), Math.max(0, W(v).length - 1))]), b = (e) => ({
		Input: "#96ad52",
		Shaping: "#589aab",
		Surface: "#92c9ad",
		Transpose: "#9080b6",
		Derive: "#b65b9e",
		Output: "#c96d82",
		Subgraphs: "#a3aa99"
	})[e] ?? "#a1a59b";
	function x() {
		if (!r() || !W(a)) return;
		let e = W(a).getBoundingClientRect(), t = document.documentElement.clientWidth || window.innerWidth, n = document.documentElement.clientHeight || window.innerHeight;
		R(l, Math.max(8, Math.min(r().screenAnchor.x, t - e.width - 8)), !0), R(u, Math.max(8, Math.min(r().screenAnchor.y, n - e.height - 8)), !0);
	}
	yn(() => {
		let e = r()?.key, t = r()?.mode, n = r()?.screenAnchor;
		if (e === void 0 || !n) return;
		let i = d !== e || f !== t;
		d !== e && R(s, ""), i && R(c, 0), d = e, f = t, lr().then(() => {
			r()?.key === e && r().mode === t && (x(), i && (t === "nodes" ? W(o)?.focus() : (W(a)?.querySelector("[data-port]:not(:disabled)") ?? W(a))?.focus()));
		});
	});
	function S(e) {
		e && r() && !_(e) && (r().mode === "ports" && "portId" in e ? i().choosePort?.(e.portId) : r().mode === "nodes" && "id" in e && i().choose?.(e.id));
	}
	function C(e) {
		let t = e.currentTarget;
		!r() || r().readOnly || !r().origin ? t.checked = !!r()?.contextSensitive : i().setContextSensitive?.(t.checked);
	}
	function w(e) {
		e.stopPropagation(), e.key === "Escape" ? (e.preventDefault(), i().dismiss?.()) : [
			"ArrowDown",
			"ArrowUp",
			"Home",
			"End"
		].includes(e.key) ? (e.preventDefault(), R(c, e.key === "Home" ? 0 : e.key === "End" ? Math.max(0, W(v).length - 1) : W(v).length ? (W(c) + (e.key === "ArrowDown" ? 1 : -1) + W(v).length) % W(v).length : 0, !0)) : e.key === "Enter" && (e.preventDefault(), S(W(y)));
	}
	yn(() => {
		if (!r()) return;
		let e = (e) => {
			W(a) && !W(a).contains(e.target) && i().dismiss?.();
		};
		return window.addEventListener("pointerdown", e, !0), () => window.removeEventListener("pointerdown", e, !0);
	});
	var T = Ar();
	G("resize", tn, x);
	var E = B(T), D = (e) => {
		var t = Kc();
		let i;
		var d = z(t), f = (e) => {
			var t = Vc(), i = B(t), a = z(i);
			Q(a), Ci(a, (e) => R(o, e), () => W(o)), P(i);
			var l = V(i, 2), u = (e) => {
				var t = zc(), n = z(t);
				Q(n), Ae(), P(t), H(() => {
					hi(n, r().contextSensitive), n.disabled = r().readOnly;
				}), K("change", n, C), J(e, t);
			};
			X(l, (e) => {
				r().origin && e(u);
			});
			var d = V(l, 2), f = (e) => {
				var t = Bc(), n = z(t, !0);
				P(t), H(() => Y(n, (r().origin.dir === "out" ? "Accepts " : "Produces ") + r().origin.kind)), J(e, t);
			};
			X(d, (e) => {
				r().origin && e(f);
			}), H((e) => {
				$(a, "aria-controls", n + "-results"), $(a, "aria-activedescendant", e);
			}, [() => W(y) ? n + "-item-" + W(h).indexOf(W(y)) : void 0]), K("input", a, () => R(c, 0)), yi(a, () => W(s), (e) => R(s, e)), J(e, t);
		}, p = (e) => {
			J(e, Hc());
		};
		X(d, (e) => {
			r().mode === "nodes" ? e(f) : e(p, -1);
		});
		var m = V(d, 2);
		Z(m, 21, () => W(h), (e) => g(e), (e, t) => {
			var r = Uc(), i = z(r), a = z(i, !0);
			P(i);
			var o = V(i, 1, !0);
			o.nodeValue = " ";
			var s = V(o);
			let l;
			var u = z(s, !0);
			P(s), P(r), H((e, n, i, o) => {
				$(r, "aria-selected", W(y) === W(t)), $(r, "id", e), $(r, "data-choice", "id" in W(t) ? W(t).id : void 0), $(r, "data-port", "portId" in W(t) ? W(t).portId : void 0), r.disabled = n, $(r, "title", "disabledReason" in W(t) ? W(t).disabledReason : void 0), Y(a, i), l = ai(s, "", l, o), Y(u, "family" in W(t) ? W(t).family : W(t).kind);
			}, [
				() => n + "-item-" + W(h).indexOf(W(t)),
				() => _(W(t)),
				() => W(t).label || g(W(t)),
				() => ({ color: "family" in W(t) ? b(W(t).family) : void 0 })
			]), K("click", r, () => S(W(t))), G("focus", r, () => {
				let e = W(v).indexOf(W(t));
				e >= 0 && R(c, e, !0);
			}), J(e, r);
		}, (e) => {
			J(e, Wc());
		}), P(m);
		var x = V(m, 2), T = (e) => {
			var t = Gc(), n = z(t, !0);
			P(t), H(() => Y(n, r().feedback)), J(e, t);
		};
		X(x, (e) => {
			r().feedback && e(T);
		}), P(t), Ci(t, (e) => R(a, e), () => W(a)), H(() => {
			$(t, "aria-label", r().mode === "ports" ? "Choose connection port" : "Add node"), i = ai(t, "", i, {
				left: `${W(l) ?? ""}px`,
				top: `${W(u) ?? ""}px`
			}), $(m, "id", n + "-results"), $(m, "aria-label", r().mode === "ports" ? "Compatible ports" : "Nodes and subgraphs");
		}), K("keydown", t, w), J(e, t);
	};
	X(E, (e) => {
		r() && e(D);
	}), J(e, T), He();
}
yr([
	"keydown",
	"input",
	"change",
	"click"
]);
//#endregion
//#region ui/PinMenu.svelte
var Jc = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-pin-action svelte-i73q0t\"> </button>"), Yc = /* @__PURE__ */ q("<p class=\"pc-empty svelte-i73q0t\">No attached links.</p>"), Xc = /* @__PURE__ */ q("<div class=\"pc-pin-menu svelte-i73q0t\" role=\"dialog\" aria-label=\"Pin actions\" aria-modal=\"false\" tabindex=\"-1\"><div class=\"pc-menu-head svelte-i73q0t\"><h2 class=\"svelte-i73q0t\"> </h2><button type=\"button\" aria-label=\"Close pin actions\" class=\"svelte-i73q0t\">Close</button></div> <p class=\"pc-kind svelte-i73q0t\"> </p> <!></div>");
function Zc(e, t) {
	Ve(t, !0);
	let n = wi(t, "view", 3, null), r = wi(t, "actions", 19, () => ({})), i = /* @__PURE__ */ L(void 0), a = /* @__PURE__ */ L(8), o = /* @__PURE__ */ L(8), s, c = (e) => !!e.disabled || !!n()?.readOnly && e.capability !== "navigation";
	function l() {
		if (!n() || !W(i)) return;
		let e = W(i).getBoundingClientRect(), t = document.documentElement.clientWidth || window.innerWidth, r = document.documentElement.clientHeight || window.innerHeight;
		R(a, Math.max(8, Math.min(n().screenAnchor.x, t - e.width - 8)), !0), R(o, Math.max(8, Math.min(n().screenAnchor.y, r - e.height - 8)), !0);
	}
	yn(() => {
		let e = n()?.key, t = n()?.screenAnchor;
		if (e === void 0 || !t) return;
		let r = s !== e;
		s = e, lr().then(() => {
			n()?.key === e && (l(), r && (W(i)?.querySelector("[data-entry]:not(:disabled)") ?? W(i))?.focus());
		});
	});
	function u(e) {
		n() && !c(e) && r().pick?.(e.id);
	}
	function d(e) {
		if (e.stopPropagation(), e.key === "Escape") {
			e.preventDefault(), r().dismiss?.();
			return;
		}
		let t = [...W(i)?.querySelectorAll("[data-entry]:not(:disabled)") ?? []], a = t.indexOf(document.activeElement);
		if ([
			"ArrowDown",
			"ArrowUp",
			"Home",
			"End"
		].includes(e.key)) e.preventDefault(), t[e.key === "Home" ? 0 : e.key === "End" ? t.length - 1 : (a + (e.key === "ArrowDown" ? 1 : -1) + t.length) % t.length]?.focus();
		else if (e.key === "Enter") {
			let t = n()?.entries.find((e) => e.id === document.activeElement?.dataset.entry);
			t && (e.preventDefault(), u(t));
		}
	}
	var f = Ar();
	G("resize", tn, l);
	var p = B(f), m = (e) => {
		var t = Xc();
		let s;
		var l = z(t), f = z(l), p = z(f, !0);
		P(f);
		var m = V(f);
		P(l);
		var h = V(l, 2), g = z(h);
		P(h), Z(V(h, 2), 17, () => n().entries, (e) => e.id, (e, t) => {
			var n = Jc(), r = z(n, !0);
			P(n), H((e) => {
				$(n, "data-entry", W(t).id), n.disabled = e, $(n, "title", W(t).reason), Y(r, W(t).label);
			}, [() => c(W(t))]), K("click", n, () => u(W(t))), J(e, n);
		}, (e) => {
			J(e, Yc());
		}), P(t), Ci(t, (e) => R(i, e), () => W(i)), H(() => {
			s = ai(t, "", s, {
				left: `${W(a) ?? ""}px`,
				top: `${W(o) ?? ""}px`
			}), Y(p, n().title), Y(g, `${n().kind ?? ""}${n().readOnly ? " · Read only" : ""}`);
		}), K("keydown", t, d), K("click", m, () => r().dismiss?.()), J(e, t);
	};
	X(p, (e) => {
		n() && e(m);
	}), J(e, f), He();
}
yr(["keydown", "click"]);
//#endregion
//#region src/ui/node-palette.js
var Qc = "M3 7 12 2l9 5v10l-9 5-9-5ZM3 7l9 5 9-5M12 12v10", $c = "M3 6l4-2 4 2v5l-4 2-4-2ZM3 6l4 2 4-2M7 8v5M13 6l4-2 4 2v5l-4 2-4-2ZM13 6l4 2 4-2M17 8v5M8 15l4-2 4 2v5l-4 2-4-2ZM8 15l4 2 4-2M12 17v5", el = Object.freeze([
	{
		name: "Input",
		color: "#96ad52",
		icon: Qc
	},
	{
		name: "Shaping",
		color: "#589aab",
		icon: "M20 8a8 8 0 1 0 0 8M20 3v5h-5"
	},
	{
		name: "Surface",
		color: "#92c9ad",
		icon: "M3 14L14 6l7 4-11 8Z"
	},
	{
		name: "Transpose",
		color: "#9080b6",
		icon: "M3 7h18m-4-4 4 4-4 4M21 17H3m4-4-4 4 4 4"
	},
	{
		name: "Derive",
		color: "#b65b9e",
		icon: "M5 20v-6M12 20V8M19 20V3"
	},
	{
		name: "Introspection",
		color: "#b39d71",
		icon: "M21 12s-4-7-9-7-9 7-9 7 4 7 9 7 9-7 9-7ZM15 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0"
	},
	{
		name: "Output",
		color: "#c96d82",
		icon: Qc
	},
	{
		name: "Subgraphs",
		color: "#a3aa99",
		icon: $c
	}
].map((e) => Object.freeze(e))), tl = {
	Sources: "M14 2H5v20h14V7Zm0 0v5h5M2 13h10m-3-3 3 3-3 3",
	Context: "M3 5h18M6 12h12M9 19h6",
	Planning: "M4 5h8a4 4 0 0 1 0 8H8a4 4 0 0 0 0 8h12m-3-3 3 3-3 3",
	Assembly: "M3 5h6v6H3ZM15 5h6v6h-6ZM9 17h6v5H9M6 11v3h12v-3m-6 3v3",
	Revision: "m4 17 12-12 3 3L7 20H4Zm10-10 3 3M11 21h10",
	Analysis: "M3 8V3h5m8 0h5v5M3 16v5h5m8 0h5v-5M3 12h18",
	Validation: "m3 5 2 2 3-3M11 5h10m-18 7 2 2 3-3M11 12h10M3 19h5m3 0h10",
	Parsing: "m7 3-4 9 4 9m10-18 4 9-4 9M10 12h4",
	Extraction: "M3 5h18M3 12h8M3 19h8m4-4 6 4-6 4m6-4h-7",
	Guidance: "M5 2h10l4 4v16H5ZM15 2v4h4M8 11h8m-8 5h6",
	Review: "m2 12 4 4 8-9m-3 8 3 3 8-10",
	Delivery: "m2 11 20-9-8 20-4-8Zm8 3L22 2",
	Library: $c,
	Routing: "M3 12h18m-7-7 7 7-7 7",
	Blocks: Qc,
	Reflect: "M21 12s-4-7-9-7-9 7-9 7 4 7 9 7 9-7 9-7ZM15 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0",
	Internalize: "M4 4h16v16H4M8 8l4 4 4-4M12 12v5",
	Express: "M4 4h16v12H9l-5 4ZM8 8h8M8 12h5",
	Memory: "M5 3h14v18H5ZM8 7h8M8 11h8M8 15h5",
	State: "M3 12h4l3-7 4 14 3-7h4"
}, nl = Object.freeze(Object.fromEntries(Object.entries(tl).map(([e, t]) => [e, Object.freeze({
	name: e,
	icon: t
})]))), rl = {
	"subgraph-input": [
		"Input",
		"si",
		"M3 12h18m-7-7 7 7-7 7"
	],
	"subgraph-output": [
		"Output",
		"so",
		"M21 12H3m7-7-7 7 7 7"
	],
	text: [
		"Sources",
		"tx",
		"M3 4h18M12 4v16M7 20h10"
	],
	"file-input": [
		"Sources",
		"fi",
		"M14 2H5v20h14V7Zm0 0v5h5M8 12h8M8 16h8"
	],
	"prompt-source": [
		"Sources",
		"pr",
		"M4 4h16v12H9l-5 4ZM8 8h8M8 12h5"
	],
	"scene-context": [
		"Sources",
		"sc",
		"M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15"
	],
	"reply-snapshot": [
		"Sources",
		"rs",
		"M3 6h4l2-3h6l2 3h4v15H3ZM16 13a4 4 0 1 0-8 0 4 4 0 0 0 8 0"
	],
	"smart-compactor": [
		"Context",
		"cp",
		"M3 3l6 6M3 9h6V3M21 21l-6-6m0 6v-6h6M3 21l6-6M3 15h6v6M21 3l-6 6m0-6v6h6"
	],
	"context-join": [
		"Context",
		"cj",
		"M3 5h5v5h8V5h5M3 19h5v-5h8v5h5M8 12h8"
	],
	"response-plan": [
		"Planning",
		"rp",
		tl.Planning
	],
	compose: [
		"Assembly",
		"co",
		tl.Assembly
	],
	repair: [
		"Revision",
		"rr",
		"m4 19 11-11 3 3L7 22ZM3 4h6M6 1v6m11-5v4m-2-2h4"
	],
	"style-transfer": [
		"Reference voice",
		"st",
		"M3 7h18m-4-4 4 4-4 4M5 17h14M8 14l-3 3 3 3"
	],
	"format-transfer": [
		"Reference format",
		"ft",
		"M4 3h7v7H4zM13 14h7v7h-7zM14 6h6m-3-3 3 3-3 3M4 17h6"
	],
	"terminology-map": [
		"Canonical terms",
		"tm",
		"M3 5h7v14H3zM14 5h7v14h-7zM10 12h4m-2-2 2 2-2 2"
	],
	"text-rules": [
		"Revision",
		"tr",
		"M3 5h18M8 5v16m-4 0h8M16 12h5m-2-2 2 2-2 2M16 18h5"
	],
	"pattern-scan": [
		"Analysis",
		"ps",
		"M16 10a6 6 0 1 0-12 0 6 6 0 0 0 12 0Zm-1 5 6 6"
	],
	"validate-patches": [
		"Validation",
		"vp",
		tl.Validation
	],
	"json-decode": [
		"Parsing",
		"jd",
		tl.Parsing
	],
	"select-fields": [
		"Extraction",
		"sf",
		tl.Extraction
	],
	guidance: [
		"Guidance",
		"gd",
		"M21 12a9 9 0 1 0-18 0 9 9 0 0 0 18 0ZM15 9l-2 4-4 2 2-4Z"
	],
	"review-gate": [
		"Review",
		"rg",
		"M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm13 0a3 3 0 1 0-6 0 3 3 0 0 0 6 0"
	],
	"apply-reply": [
		"Delivery",
		"ar",
		tl.Delivery
	],
	reroute: [
		"Routing",
		"rt",
		tl.Routing
	],
	reflect: [
		"Reflect",
		"rf",
		tl.Reflect
	],
	internalize: [
		"Internalize",
		"in",
		tl.Internalize
	],
	express: [
		"Express",
		"ex",
		tl.Express
	],
	context: [
		"Context",
		"cx",
		tl.Context
	],
	memory: [
		"Memory",
		"mm",
		tl.Memory
	],
	state: [
		"State",
		"sv",
		tl.State
	]
}, il = Object.freeze(Object.fromEntries(Object.entries(rl).map(([e, [t, n, r]]) => [e, Object.freeze({
	group: t,
	shortcode: n,
	icon: r
})]))), al = Object.freeze({
	group: "Blocks",
	shortcode: "",
	icon: Qc
}), ol = (e) => Object.hasOwn(il, e) ? il[e] : al, sl = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-family-row\" aria-haspopup=\"menu\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path></path></svg><span> </span></button>"), cl = /* @__PURE__ */ q("<button type=\"button\" role=\"menuitem\">‹ Families</button>"), ll = /* @__PURE__ */ q("<input class=\"text_pole\" aria-label=\"Search nodes\" placeholder=\"Search nodes…\"/>"), ul = /* @__PURE__ */ q("<div class=\"pc-shelf-group svelte-hk6fzp\" role=\"presentation\"> </div>"), dl = /* @__PURE__ */ q("<!> <button type=\"button\" role=\"menuitem\" class=\"svelte-hk6fzp\"><svg class=\"pc-leaf-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path></path></svg><span class=\"pc-catalog-name\"> </span><small> </small></button>", 1), fl = /* @__PURE__ */ q("<div role=\"menu\" tabindex=\"-1\"><!> <!> <!></div>"), pl = /* @__PURE__ */ q("<div class=\"pc-shelf-menu pc-shelf-subgraph-menu svelte-hk6fzp\" role=\"menu\" tabindex=\"-1\"><button type=\"button\" role=\"menuitem\" data-shelf-subgraph-action=\"open\">Open saved definition</button> <button type=\"button\" role=\"menuitem\" data-shelf-subgraph-action=\"delete\">Delete</button></div>"), ml = /* @__PURE__ */ q("<div class=\"pc-shelf-drag-preview svelte-hk6fzp\" aria-hidden=\"true\"> </div>"), hl = /* @__PURE__ */ q("<nav aria-label=\"Node families\"></nav> <!> <!> <!>", 1);
function gl(e, t) {
	Ve(t, !0);
	let n = wi(t, "readOnly", 3, !1), r, i = /* @__PURE__ */ L(null), a = /* @__PURE__ */ L(""), o = /* @__PURE__ */ L(!1), s = /* @__PURE__ */ L(""), c = /* @__PURE__ */ L(!1), l = /* @__PURE__ */ L(0), u = /* @__PURE__ */ L(0), d = null, f = 0, p = /* @__PURE__ */ L(null), m = /* @__PURE__ */ L(null), h = null, g = el.map((e) => e.name), _ = (e) => el.find((t) => t.name === e)?.color, v = null, y = null, b = null, x = /* @__PURE__ */ L(null);
	function S() {
		y !== null && clearTimeout(y), y = null;
		let e = v;
		v = null, R(x, null), document.body.classList.remove("pc-shelf-dragging"), e?.button.hasPointerCapture?.(e.pointerId) && e.button.releasePointerCapture(e.pointerId);
	}
	function C() {
		v && (y !== null && clearTimeout(y), y = null, b = v.button, document.body.classList.add("pc-shelf-dragging"), R(x, {
			title: v.entry.title,
			family: v.entry.family,
			...v.point
		}, !0));
	}
	function w(e, t) {
		if (e.button !== 0 || e.isPrimary === !1 || v || n() || !O(t.family).find((e) => e.id === t.id)?.compatible) return;
		let r = e.currentTarget;
		b = null, v = {
			entry: t,
			pointerId: e.pointerId,
			button: r,
			start: {
				x: e.clientX,
				y: e.clientY
			},
			point: {
				x: e.clientX,
				y: e.clientY
			}
		}, r.setPointerCapture?.(e.pointerId), y = setTimeout(C, 180);
	}
	function T(e) {
		v && e.pointerId === v.pointerId && (v.point = {
			x: e.clientX,
			y: e.clientY
		}, !W(x) && Math.hypot(e.clientX - v.start.x, e.clientY - v.start.y) >= 5 && C(), W(x) && (e.preventDefault(), R(x, {
			...W(x),
			...v.point
		}, !0)));
	}
	function E(e) {
		if (!v || e.pointerId !== v.pointerId) return;
		let t = v.entry, n = !!W(x), i = n ? document.elementFromPoint(e.clientX, e.clientY) : null, a = r.closest(".pc-canvas-area")?.querySelector(".pc-canvas-host");
		S(), n && (e.preventDefault(), e.stopPropagation(), i && a?.contains(i) && ie(t, {
			x: e.clientX,
			y: e.clientY
		}));
	}
	function D(e, t) {
		e.currentTarget === b && e.detail !== 0 ? b = null : ie(t);
	}
	function O(e = W(a)) {
		if (t.choices !== void 0) {
			let n = /* @__PURE__ */ new Map();
			for (let r of t.choices.filter((t) => t.family === e)) {
				let e = r.id.startsWith("operation:") ? r.id.split(":")[1] : "", t = e ? "operation:" + e : r.id, i = n.get(t), a = [
					r.label,
					r.id,
					r.purpose ?? "",
					r.shortcode ?? "",
					...r.searchAliases ?? []
				];
				i ? (i.aliases.push(...a), r.id === t && (i.choice = r)) : n.set(t, {
					choice: r,
					aliases: a
				});
			}
			return [...n.values()].map(({ choice: n, aliases: r }) => {
				let i = n.id.startsWith("operation:") ? n.id.split(":")[1] : "", a = ol(i), o = i ? n.label.split(" · ")[0] : n.label, s = n.id.startsWith("boundary:");
				return {
					...n,
					title: o,
					compatible: !n.disabledReason && !!t.choose,
					catalog: !0,
					shortcode: i ? a.shortcode || n.shortcode || "" : n.shortcode ?? a.shortcode,
					group: e === "Subgraphs" ? s ? "Interface" : "Library" : void 0,
					icon: e === "Subgraphs" ? s ? nl.Routing.icon : nl.Library.icon : a.icon,
					searchAliases: r
				};
			});
		}
		let n = t.view?.families.find((t) => t.name === e);
		return n ? n.operations.filter((t) => e !== "Surface" || !["pattern-scan", "validate-patches"].includes(t.id)).map((t) => ({
			...t,
			...ol(t.id),
			family: e
		})) : [];
	}
	function k(e = !1) {
		R(p, null), e && h?.focus({ preventScroll: !0 });
	}
	function A(e = !1) {
		S(), f++, R(a, ""), R(o, !1), k(), e && d?.focus({ preventScroll: !0 });
	}
	yn(() => (t.view?.graphId, t.choices, n(), () => A()));
	function ee() {
		let e = r.closest(".pc-canvas-area"), t = e.getBoundingClientRect();
		return {
			left: t.left + e.clientLeft,
			top: t.top + e.clientTop,
			right: t.right - e.clientLeft,
			width: e.clientWidth,
			height: e.clientHeight
		};
	}
	function te(e, t, n, r) {
		let i = ee(), a = i.right - e.right - 6, o = e.left - i.left - 6, s = a >= t || o >= t, c = a >= t ? e.right - i.left + 3 : o >= t ? e.left - i.left - t - 3 : 13;
		return {
			x: Math.max(4, Math.min(c, i.width - t - 4)),
			y: Math.max(4, Math.min(e.top - i.top, i.height - n - 4)),
			compact: !s || i.width < t + r + 26
		};
	}
	function ne(e, t, n) {
		let r = t.querySelector("button")?.getBoundingClientRect();
		return r ? e.top + (e.height - r.height) / 2 - (r.top - n.top) : e.top;
	}
	async function j(e, t, n = !0) {
		if (v) return;
		if (k(), W(a) === e) {
			n && W(i)?.querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
			return;
		}
		let r = ++f;
		if (R(a, e, !0), R(o, !1), d = t, await lr(), r !== f || W(a) !== e || !W(i)?.isConnected) return;
		let s = t.getBoundingClientRect(), p = W(i).getBoundingClientRect(), m = te({
			top: ne(s, W(i), p),
			left: s.left,
			right: s.right
		}, p.width, p.height, 128);
		R(l, m.x, !0), R(u, m.y, !0), R(c, m.compact, !0), n && W(i).querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
	}
	async function re() {
		let e = ++f;
		if (R(a, ""), R(o, !0), R(s, ""), await lr(), e !== f || !W(o) || !W(i)?.isConnected) return;
		let t = ee();
		R(l, Math.min(136, Math.max(4, t.width - 254)), !0), R(u, 13), W(i).querySelector("input")?.focus();
	}
	function ie(e, r) {
		let i = O(e.family).find((t) => t.id === e.id);
		i?.compatible && !n() && (A(!0), r ? i.catalog ? t.choose?.(i.id, r) : t.add(i.id, r) : i.catalog ? t.choose?.(i.id) : t.add(i.id));
	}
	async function ae(e, n) {
		let r = O("Subgraphs").find((t) => t.id === e.dataset.shelfChoice);
		if (!r?.definitionRef || !t.shelfSubgraph) return;
		let i = ee(), a = e.getBoundingClientRect();
		if (h = e, R(p, {
			id: r.id,
			title: r.title,
			x: (n?.x ?? a.right) - i.left,
			y: (n?.y ?? a.top) - i.top
		}, !0), await lr(), !W(p) || W(p).id !== r.id || !W(m)?.isConnected) return;
		let o = W(m).getBoundingClientRect();
		R(p, {
			...W(p),
			x: Math.max(4, Math.min(W(p).x, i.width - o.width - 4)),
			y: Math.max(4, Math.min(W(p).y, i.height - o.height - 4))
		}, !0), W(m).querySelector("button")?.focus({ preventScroll: !0 });
	}
	function oe(e) {
		let n = e.target.closest("[data-shelf-choice]");
		n && O("Subgraphs").some((e) => e.id === n.dataset.shelfChoice && e.definitionRef) && t.shelfSubgraph && (e.preventDefault(), e.stopPropagation(), ae(n, {
			x: e.clientX,
			y: e.clientY
		}));
	}
	function se(e) {
		let n = O("Subgraphs").find((e) => e.id === W(p)?.id);
		A(!0), n?.definitionRef && t.shelfSubgraph?.(n.id, e);
	}
	function ce(e) {
		if ((e.key === "ContextMenu" || e.key === "F10" && e.shiftKey) && e.target.dataset.shelfChoice) {
			e.preventDefault(), e.stopPropagation(), ae(e.target);
			return;
		}
		if (W(p) && e.key === "Escape") {
			e.preventDefault(), e.stopPropagation(), k(!0);
			return;
		}
		if (e.key === "Escape") {
			e.preventDefault(), e.stopPropagation(), A(!0);
			return;
		}
		let t = e.target;
		if (e.key === "ArrowRight" && t.dataset.family && !t.disabled) {
			e.preventDefault(), e.stopPropagation(), j(t.dataset.family, t);
			return;
		}
		if (e.key === "ArrowLeft" && W(a)) {
			e.preventDefault(), e.stopPropagation(), A(!0);
			return;
		}
		if (e.key === "Tab") {
			A();
			return;
		}
		if (![
			"ArrowDown",
			"ArrowUp",
			"Home",
			"End"
		].includes(e.key) || e.target.tagName === "INPUT") return;
		e.preventDefault();
		let n = [...(e.target.closest("[role=\"menu\"]") || r).querySelectorAll("button:not(:disabled)")], i = n.indexOf(e.target);
		n[e.key === "Home" ? 0 : e.key === "End" ? n.length - 1 : (i + (e.key === "ArrowUp" ? n.length - 1 : 1)) % n.length]?.focus();
	}
	var le = { openSearch: re }, ue = hl();
	G("pointerdown", tn, (e) => {
		e.target.closest(".pc-node-shelf, .pc-shelf-menu") || A();
	}), G("pointermove", tn, T), G("pointerup", tn, E), G("pointercancel", tn, () => S()), G("blur", tn, () => A()), G("resize", tn, () => A()), G("keydown", tn, (e) => {
		v && e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), A(!0));
	});
	var de = B(ue);
	Z(de, 21, () => el, Br, (e, t) => {
		var n = sl();
		let r;
		var i = z(n), o = z(i);
		P(i);
		var s = V(i), c = z(s, !0);
		P(s), P(n), H((e) => {
			$(n, "data-family", W(t).name), n.disabled = e, $(n, "title", "Browse " + W(t).name + " nodes"), $(n, "aria-expanded", W(a) === W(t).name), r = ai(n, "", r, { "--pc-family": W(t).color }), $(o, "d", W(t).icon), Y(c, W(t).name);
		}, [() => !O(W(t).name).length]), K("click", n, (e) => j(W(t).name, e.currentTarget)), G("pointerenter", n, (e) => {
			e.pointerType !== "touch" && !e.currentTarget.disabled && j(W(t).name, e.currentTarget, !1);
		}), K("keydown", n, ce), J(e, n);
	}), P(de), Ci(de, (e) => r = e, () => r);
	var fe = V(de, 2), pe = (e) => {
		let r = /* @__PURE__ */ F(() => W(o) ? g.flatMap((e) => O(e)).filter((e) => [
			e.title,
			e.id,
			e.family,
			e.purpose,
			e.shortcode,
			...e.searchAliases ?? []
		].join(" ").toLowerCase().includes(W(s).toLowerCase())) : O());
		var d = fl();
		let f;
		var p = z(d), m = (e) => {
			var t = cl();
			K("click", t, () => A(!0)), J(e, t);
		};
		X(p, (e) => {
			W(c) && W(a) && e(m);
		});
		var h = V(p, 2), v = (e) => {
			var t = ll();
			Q(t), yi(t, () => W(s), (e) => R(s, e)), J(e, t);
		};
		X(h, (e) => {
			W(o) && e(v);
		}), Z(V(h, 2), 19, () => W(r), (e) => e.family + e.id, (e, i, a) => {
			let s = /* @__PURE__ */ F(() => !W(i).compatible || n()), c = /* @__PURE__ */ F(() => !!W(i).definitionRef && !!t.shelfSubgraph);
			var l = dl(), u = B(l), d = (e) => {
				var t = ul(), n = z(t, !0);
				P(t), H(() => {
					$(t, "data-shelf-group", W(i).group), Y(n, W(i).group);
				}), J(e, t);
			};
			X(u, (e) => {
				!W(o) && W(i).group && W(r)[W(a) - 1]?.group !== W(i).group && e(d);
			});
			var f = V(u, 2);
			let p;
			var m = z(f), h = z(m);
			P(m);
			var g = V(m), v = z(g, !0);
			P(g);
			var y = V(g), b = z(y, !0);
			P(y), P(f), H((e) => {
				$(f, "data-shelf-choice", W(i).id), $(f, "data-insertion-disabled", W(s)), f.disabled = W(s) && !W(c), $(f, "aria-disabled", W(s) && !W(c)), $(f, "aria-haspopup", W(c) ? "menu" : void 0), $(f, "title", n() ? W(c) ? "This graph is read-only. Right-click for subgraph actions." : "This graph is read-only." : W(i).disabledReason || (W(i).compatible ? W(i).purpose || "Add " + W(i).title : "Requires the " + W(i).phase + " phase")), p = ai(f, "", p, e), $(h, "d", W(i).icon), Y(v, W(i).title), Y(b, W(i).shortcode);
			}, [() => ({ "--pc-family": _(W(i).family) })]), K("pointerdown", f, (e) => w(e, W(i))), G("lostpointercapture", f, () => S()), K("click", f, (e) => D(e, W(i))), J(e, l);
		}), P(d), Ci(d, (e) => R(i, e), () => W(i)), H((e) => {
			ri(d, 1, `pc-shelf-menu ${W(o) ? "pc-leaf-menu" : "pc-family-menu"}`, "svelte-hk6fzp"), $(d, "aria-label", W(o) ? "Search nodes" : W(a) + " nodes"), f = ai(d, "", f, e);
		}, [() => ({
			left: `${W(l)}px`,
			top: `${W(u)}px`,
			"--pc-family": _(W(a))
		})]), K("keydown", d, ce), K("contextmenu", d, oe), J(e, d);
	};
	X(fe, (e) => {
		(W(a) || W(o)) && e(pe);
	});
	var me = V(fe, 2), he = (e) => {
		var t = pl();
		let n;
		var r = z(t), i = V(r, 2);
		P(t), Ci(t, (e) => R(m, e), () => W(m)), H(() => {
			$(t, "aria-label", W(p).title + " actions"), n = ai(t, "", n, {
				left: `${W(p).x}px`,
				top: `${W(p).y}px`
			});
		}), K("keydown", t, ce), K("click", r, () => se("open")), K("click", i, () => se("delete")), J(e, t);
	};
	X(me, (e) => {
		W(p) && e(he);
	});
	var ge = V(me, 2), _e = (e) => {
		var t = ml();
		let n;
		var r = z(t, !0);
		P(t), H((e) => {
			n = ai(t, "", n, e), Y(r, W(x).title);
		}, [() => ({
			"--pc-family": _(W(x).family),
			left: `${W(x).x + 12}px`,
			top: `${W(x).y + 12}px`
		})]), J(e, t);
	};
	return X(ge, (e) => {
		W(x) && e(_e);
	}), H(() => ri(de, 1, `pc-node-shelf${W(c) && W(a) ? " pc-shelf-replaced" : ""}`, "svelte-hk6fzp")), J(e, ue), He(le);
}
yr([
	"click",
	"keydown",
	"contextmenu",
	"pointerdown"
]);
//#endregion
//#region ui/ExamplesBrowser.svelte
var _l = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-btn menu_button svelte-18p7ib8\">Retry</button>"), vl = /* @__PURE__ */ q("<div class=\"pc-examples-issue svelte-18p7ib8\" role=\"alert\"><span class=\"svelte-18p7ib8\"> </span><!></div>"), yl = /* @__PURE__ */ Or("<g class=\"pc-example-comment svelte-18p7ib8\"><rect rx=\"4\" class=\"svelte-18p7ib8\"></rect><text class=\"svelte-18p7ib8\"> </text></g>"), bl = /* @__PURE__ */ Or("<path class=\"pc-wire pc-wire-native svelte-18p7ib8\"></path>"), xl = /* @__PURE__ */ Or("<circle class=\"pc-example-pin-dot svelte-18p7ib8\" r=\"4\"></circle><path class=\"pc-example-pin-cue svelte-18p7ib8\"></path><text class=\"pc-example-pin-label svelte-18p7ib8\"> </text>", 1), Sl = /* @__PURE__ */ Or("<g><rect class=\"pc-example-card svelte-18p7ib8\" rx=\"4\"></rect><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\"><path class=\"pc-example-icon svelte-18p7ib8\"></path></svg><text class=\"pc-example-node-title svelte-18p7ib8\" lengthAdjust=\"spacingAndGlyphs\"> </text><!></g>"), Cl = /* @__PURE__ */ Or("<svg class=\"pc-example-preview svelte-18p7ib8\" preserveAspectRatio=\"xMidYMid meet\" aria-hidden=\"true\" focusable=\"false\"><!><!><!></svg>"), wl = /* @__PURE__ */ q("<span class=\"pc-example-unavailable-preview svelte-18p7ib8\"><strong class=\"svelte-18p7ib8\">Unavailable</strong><span class=\"svelte-18p7ib8\"> </span></span>"), Tl = /* @__PURE__ */ q("<button type=\"button\"><!> <span class=\"pc-example-title svelte-18p7ib8\"> </span></button>"), El = /* @__PURE__ */ q("<!> <div class=\"pc-examples-grid svelte-18p7ib8\"></div>", 1);
function Dl(e, t) {
	Ve(t, !0);
	let n = {
		context: "M -4,0 a 4,4 0 1,0 8,0 a 4,4 0 1,0 -8,0",
		text: "M -3.4,0 a 3.4,3.4 0 1,0 6.8,0 a 3.4,3.4 0 1,0 -6.8,0",
		data: "M -4,-4 H 4 V 4 H -4 Z",
		guidance: "M 0,-5 L 5,0 L 0,5 L -5,0 Z",
		draft: "M 0,-5 L 4.76,-1.55 L 2.94,4.05 L -2.94,4.05 L -4.76,-1.55 Z",
		findings: "M 0,-5 L 4.33,3 L -4.33,3 Z",
		patches: "M -2.5,-4.33 L 2.5,-4.33 L 5,0 L 2.5,4.33 L -2.5,4.33 L -5,0 Z",
		candidate: "M -1.5,-5 H 1.5 V -1.5 H 5 V 1.5 H 1.5 V 5 H -1.5 V 1.5 H -5 V -1.5 H -1.5 Z"
	}, r = wi(t, "examples", 19, () => []), i = wi(t, "issue", 3, ""), a = wi(t, "scrollTop", 3, 0), o, s = /* @__PURE__ */ L("");
	Ti(() => {
		o.scrollTop = a();
	});
	async function c(e) {
		if (!W(s)) {
			R(s, e, !0);
			try {
				await t.open(e);
			} finally {
				R(s, "");
			}
		}
	}
	var l = El(), u = B(l), d = (e) => {
		var n = vl(), r = z(n), a = z(r, !0);
		P(r);
		var o = V(r), s = (e) => {
			var n = _l();
			K("click", n, () => t.retry?.()), J(e, n);
		};
		X(o, (e) => {
			t.retry && e(s);
		}), P(n), H(() => Y(a, i())), J(e, n);
	};
	X(u, (e) => {
		i() && e(d);
	});
	var f = V(u, 2);
	Z(f, 21, r, (e) => e.id, (e, t) => {
		let r = /* @__PURE__ */ F(() => W(t).thumbnail);
		var i = Tl();
		let a;
		var o = z(i), l = (e) => {
			var t = Cl(), i = z(t);
			Z(i, 17, () => W(r).comments, (e) => e.id, (e, t) => {
				var n = yl(), r = z(n);
				let i;
				var a = V(r), o = z(a, !0);
				P(a), P(n), H(() => {
					$(n, "data-id", W(t).id), $(r, "x", W(t).x), $(r, "y", W(t).y), $(r, "width", W(t).w), $(r, "height", W(t).h), i = ai(r, "", i, { stroke: W(t).color }), $(a, "x", W(t).x + 12), $(a, "y", W(t).y + 24), Y(o, W(t).title);
				}), J(e, n);
			});
			var a = V(i);
			Z(a, 17, () => W(r).wires, (e) => e.id, (e, t) => {
				var n = bl();
				H(() => {
					$(n, "data-kind", W(t).kind), $(n, "data-id", W(t).id), $(n, "d", W(t).d);
				}), J(e, n);
			}), Z(V(a), 17, () => W(r).nodes, (e) => e.id, (e, t) => {
				var r = Sl(), i = z(r), a = V(i), o = z(a);
				P(a);
				var s = V(a), c = z(s, !0);
				P(s), Z(V(s), 17, () => W(t).ports, (e) => e.id, (e, t) => {
					var r = xl(), i = B(r), a = V(i), o = V(a), s = z(o, !0);
					P(o), H(() => {
						$(i, "data-kind", W(t).kind), $(i, "cx", W(t).x), $(i, "cy", W(t).y), $(a, "data-kind", W(t).kind), $(a, "transform", `translate(${W(t).x} ${W(t).y})`), $(a, "d", n[W(t).kind] ?? n.context), $(o, "x", W(t).x + (W(t).dir === "in" ? 9 : -9)), $(o, "y", W(t).y + 4), $(o, "text-anchor", W(t).dir === "in" ? "start" : "end"), Y(s, W(t).label);
					}), J(e, r);
				}), P(r), H(() => {
					ri(r, 0, Zr(W(t).className), "svelte-18p7ib8"), $(r, "data-id", W(t).id), $(i, "x", W(t).x), $(i, "y", W(t).y), $(i, "width", W(t).w), $(i, "height", W(t).h), $(a, "x", W(t).x + 8), $(a, "y", W(t).y + 7), $(o, "d", W(t).iconPath), $(s, "x", W(t).x + 28), $(s, "y", W(t).y + 20), $(s, "textLength", W(t).title.length * 6 > W(t).w - 36 ? W(t).w - 36 : void 0), Y(c, W(t).title);
				}), J(e, r);
			}), P(t), H(() => $(t, "viewBox", `${W(r).bounds.x} ${W(r).bounds.y} ${W(r).bounds.w} ${W(r).bounds.h}`)), J(e, t);
		}, u = (e) => {
			var n = wl(), r = V(z(n)), i = z(r, !0);
			P(r), P(n), H(() => {
				$(r, "id", `pc-example-issue-${W(t).number}`), Y(i, W(t).issue);
			}), J(e, n);
		};
		X(o, (e) => {
			W(r) ? e(l) : e(u, -1);
		});
		var d = V(o, 2), f = z(d, !0);
		P(d), P(i), H(() => {
			a = ri(i, 1, "pc-example-tile svelte-18p7ib8", null, a, { "pc-example-unavailable": !W(r) }), $(i, "aria-label", W(t).title), $(i, "aria-describedby", W(t).issue ? `pc-example-issue-${W(t).number}` : void 0), $(i, "title", W(t).issue || W(t).goal), i.disabled = !!W(s) || !W(r), Y(f, W(t).title);
		}), K("click", i, () => c(W(t).id)), J(e, i);
	}), P(f), Ci(f, (e) => o = e, () => o), H(() => $(f, "aria-busy", !!W(s))), G("scroll", f, () => t.scroll(o.scrollTop)), J(e, l), He();
}
yr(["click"]);
//#endregion
//#region ui/ImportReview.svelte
var Ol = /* @__PURE__ */ q("<p> </p>"), kl = /* @__PURE__ */ q("<li> </li>"), Al = /* @__PURE__ */ q("<h3>Saved bindings to review</h3><ul></ul>", 1), jl = /* @__PURE__ */ q("<p>Saved model metadata is present. Review local connections before running.</p>"), Ml = /* @__PURE__ */ q("<h3>Imported terminal effects</h3><ul></ul>", 1), Nl = /* @__PURE__ */ q("<p>No imported terminal effects.</p>"), Pl = /* @__PURE__ */ q("<p role=\"alert\"> </p>"), Fl = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-btn menu_button\">Prepare again</button>"), Il = /* @__PURE__ */ q("<div class=\"pc-workspace-overlay pc-import-overlay\"><div class=\"pc-workspace-dialog pc-import-review\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Import into graph\" tabindex=\"-1\"><header><h2>Import into graph</h2><button type=\"button\" class=\"pc-btn menu_button\" aria-label=\"Cancel import\">×</button></header> <p><strong> </strong> <small> </small></p> <dl><dt>Phase</dt><dd> </dd><dt>Additions</dt><dd> </dd><dt>Conservative request bound</dt><dd> </dd></dl> <p class=\"pc-import-explanation\">This authoring bound includes unfinished branches. Bindings and reachable execution are checked when you explicitly run the workflow.</p> <!> <!> <!> <p>Insertion keeps internal wiring and relative layout. It does not connect matching names, arm or assign the graph, run requests, publish Guidance, or Apply a reply.</p> <!> <footer><button type=\"button\" class=\"pc-btn menu_button\">Cancel</button><!><button type=\"button\" class=\"pc-btn menu_button pc-import-accept\">Insert into graph</button></footer></div></div>");
function Ll(e, t) {
	Ve(t, !0);
	let n;
	Ti(() => {
		let e = document.activeElement;
		return n.querySelector("button")?.focus(), () => e?.focus({ preventScroll: !0 });
	});
	function r(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), t.actions.cancelImport?.()), e.key === "Tab") {
			let t = [...n.querySelectorAll("button:not(:disabled)")], r = t[0], i = t.at(-1);
			e.shiftKey && document.activeElement === r && (e.preventDefault(), i?.focus()), !e.shiftKey && document.activeElement === i && (e.preventDefault(), r?.focus());
		}
	}
	var i = Il(), a = z(i), o = z(a), s = V(z(o));
	P(o);
	var c = V(o, 2), l = z(c), u = z(l, !0);
	P(l);
	var d = V(l, 2), f = z(d, !0);
	P(d), P(c);
	var p = V(c, 2), m = V(z(p)), h = z(m, !0);
	P(m);
	var g = V(m, 2), _ = z(g);
	P(g);
	var v = V(g, 2), y = z(v);
	P(v), P(p);
	var b = V(p, 4), x = (e) => {
		var n = Ol(), r = z(n);
		P(n), H((e) => Y(r, `Imported model roles: ${e ?? ""}.`), [() => t.view.requiredRoles.join(", ")]), J(e, n);
	};
	X(b, (e) => {
		t.view.requiredRoles.length && e(x);
	});
	var S = V(b, 2), C = (e) => {
		var n = Al(), r = V(B(n));
		Z(r, 21, () => t.view.unresolvedBindings, Br, (e, t) => {
			var n = kl(), r = z(n);
			P(n), H((e) => Y(r, `${W(t).title ?? ""} · ${W(t).role ?? ""}: missing ${e ?? ""}`), [() => W(t).missing.join(" and ")]), J(e, n);
		}), P(r), J(e, n);
	}, w = (e) => {
		J(e, jl());
	};
	X(S, (e) => {
		t.view.unresolvedBindings.length ? e(C) : t.view.bindingReviewRequired && e(w, 1);
	});
	var T = V(S, 2), E = (e) => {
		var n = Ml(), r = V(B(n));
		Z(r, 21, () => t.view.terminals, Br, (e, t) => {
			var n = kl(), r = z(n);
			P(n), H(() => Y(r, `${W(t).title ?? ""} · ${W(t).operation ?? ""}`)), J(e, n);
		}), P(r), J(e, n);
	}, D = (e) => {
		J(e, Nl());
	};
	X(T, (e) => {
		t.view.terminals.length ? e(E) : e(D, -1);
	});
	var O = V(T, 4), k = (e) => {
		var n = Pl(), r = z(n, !0);
		P(n), H(() => Y(r, t.view.error)), J(e, n);
	};
	X(O, (e) => {
		t.view.error && e(k);
	});
	var A = V(O, 2), ee = z(A), te = V(ee), ne = (e) => {
		var n = Fl();
		K("click", n, () => t.actions.prepareImportAgain?.()), J(e, n);
	};
	X(te, (e) => {
		t.view.error && e(ne);
	});
	var j = V(te);
	P(A), P(a), Ci(a, (e) => n = e, () => n), P(i), H(() => {
		Y(u, t.view.name), Y(f, t.view.fileName), Y(h, t.view.phase), Y(_, `${t.view.nodeCount ?? ""} blocks · ${t.view.wireCount ?? ""} wires · ${t.view.groupCount ?? ""} groups`), Y(y, `${t.view.callBound ?? ""} total · ${t.view.importedCallBound ?? ""} imported`), j.disabled = !!t.view.error;
	}), K("keydown", a, r), G("paste", a, (e) => e.stopPropagation()), K("click", s, () => t.actions.cancelImport?.()), K("click", ee, () => t.actions.cancelImport?.()), K("click", j, () => t.actions.acceptImport?.()), J(e, i), He();
}
yr(["keydown", "click"]);
//#endregion
//#region ui/Workbench.svelte
var Rl = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-recall-badge\"> </button>"), zl = /* @__PURE__ */ q("<p class=\"pc-native-diagnostic svelte-1dr9aew\" role=\"alert\"> </p>"), Bl = /* @__PURE__ */ q("<p>Browse node families on the floating shelf. Middle mouse pans the graph; the wheel zooms around the pointer. Use the divider or its arrow keys to resize Preview.</p><p>Open examples and assign a unified workflow from Workflows. Its preparation stage feeds Generate Reply, and its response stage reshapes the captured Draft before Review and Publish. Legacy pre and post workflows remain selectable. Select model nodes to choose a text connection profile in Details. Fast Decision uses a configured typed connection from Tools › Fast connections and an optional separately selected Decision fallback. Arm enables the assigned host workflow. Unified generation starts with Send in SillyTavern; Run to here tests supported nodes. Run tests legacy workflows explicitly.</p><p>File › Open workflow chooses a JSON file and opens a separate workflow. Save workflow keeps committed edits and connections in SillyTavern. Export workflow JSON downloads a portable sharing copy without local connections. Import into graph reviews a same-phase fragment before one undoable insertion.</p><p>Select nodes and right-click Create Subgraph to open their connected body in a new tab. Double-click a subgraph to open it. Add Input and Output nodes from the Subgraphs shelf inside an editable subgraph, then name and configure their ports in Details.</p><p>Right-click a subgraph block and choose Add to Subgraphs to save it for reuse. Right-click a saved shelf entry to delete it. Saving updates the shelf only when you choose to save; existing placed copies stay unchanged. Portals connect pins through named references. Preview artifact tabs show results for the selected node; Run to here checks the request bound before running. Apply reviews the fresh result against the full root workflow.</p>", 1), Vl = /* @__PURE__ */ q("<div class=\"pc-workspace-overlay\"><div role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\"><header class=\"svelte-1dr9aew\"><h2 class=\"svelte-1dr9aew\"> </h2><button type=\"button\" class=\"pc-btn menu_button\" aria-label=\"Close panel\">×</button></header> <!></div></div>"), Hl = /* @__PURE__ */ q("<div class=\"pc-workspace-overlay\"><div class=\"pc-manager-dialog svelte-1dr9aew\" role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\" aria-label=\"Manage portals\"><!></div></div>"), Ul = /* @__PURE__ */ q("<div role=\"dialog\" aria-modal=\"true\" aria-label=\"Lattice\" data-pc-workbench=\"svelte\"><!> <!> <div class=\"pc-body\" role=\"region\" aria-label=\"Workspace panels\" tabindex=\"0\"><div class=\"pc-stage\"><section aria-label=\"Output preview\"><header class=\"pc-preview-pane-head\"><strong>Preview</strong><button type=\"button\" class=\"pc-btn menu_button\"> </button></header> <div class=\"pc-preview-content\"><!></div></section> <!> <!> <!> <div class=\"pc-canvas-area\" id=\"pc-workspace-graph\" role=\"tabpanel\"><div class=\"pc-workspace-run svelte-1dr9aew\"><!></div> <div class=\"pc-canvas-host\" aria-label=\"Node canvas\"></div> <!> <!></div></div> <!> <div class=\"pc-inspector pc-workspace-details svelte-1dr9aew\"><header class=\"pc-details-heading svelte-1dr9aew\"><strong class=\"svelte-1dr9aew\">Details</strong><button type=\"button\" class=\"svelte-1dr9aew\">Portals</button></header> <!> <div class=\"pc-node-details-holder svelte-1dr9aew\"><!></div></div></div> <!> <!> <!> <!> <!> <!> <!> <!></div>");
function Wl(e, t) {
	Ve(t, !0);
	let n = wi(t, "actions", 7), r = /* @__PURE__ */ L({
		graphs: [],
		graphId: "",
		armed: !1,
		inspectorOpen: !0,
		history: {
			undo: !1,
			redo: !1,
			undoTitle: "Nothing to undo",
			redoTitle: "Nothing to redo",
			note: "",
			showNote: !1
		},
		camera: {
			x: 0,
			y: 0,
			zoom: 1,
			mode: "select"
		},
		selectionCount: 0
	}), i, a, o, s, c, l, u;
	function d() {
		return {
			root: i,
			parts: {
				...l.getParts(),
				inspector: c,
				canvasHost: o
			}
		};
	}
	function f(e) {
		n({
			...n(),
			...e
		});
	}
	function p(e) {
		R(r, {
			...W(r),
			...e
		}), e.fastConnectionsActive === !0 ? ie("fast-connections") : e.fastConnectionsActive === !1 && W(E) === "fast-connections" && ae();
	}
	function m(e) {
		return u?.startRename(e);
	}
	async function h(e, t) {
		if (await lr(), !t()) return;
		let n = [...o.querySelectorAll(".pc-comment-frame[data-id]")].find((t) => t.dataset.id === e)?.querySelector(".pc-comment-title-input");
		n && !n.disabled && (n.focus({ preventScroll: !0 }), n.select());
	}
	let g = "lattice.workspace.preview";
	function _() {
		try {
			let e = JSON.parse(localStorage.getItem(g) || "null");
			return {
				height: Number.isFinite(e?.height) ? Math.max(90, Math.min(600, e.height)) : 240,
				collapsed: e?.collapsed === !0
			};
		} catch {
			return {
				height: 240,
				collapsed: !1
			};
		}
	}
	let v = _(), y = /* @__PURE__ */ L(Qt(v.height)), b = /* @__PURE__ */ L(Qt(v.collapsed)), x = /* @__PURE__ */ L(500), S = /* @__PURE__ */ L(null), C = /* @__PURE__ */ L(520), w = /* @__PURE__ */ F(() => Math.max(220, Math.min(W(C), W(S) ?? W(r).detailsWidth ?? 258)));
	function T(e) {
		R(S, null), R(r, {
			...W(r),
			detailsWidth: e
		}), n().resizeDetails?.(e);
	}
	let E = /* @__PURE__ */ L(""), D = /* @__PURE__ */ L(null), O = null, k = 0, A = /* @__PURE__ */ L(0), ee;
	function te() {
		try {
			localStorage.setItem(g, JSON.stringify({
				height: W(y),
				collapsed: W(b)
			}));
		} catch {}
	}
	function ne() {
		n().resizeStart?.();
	}
	function j(e) {
		ne(), R(b, e, !0), te();
	}
	function re() {
		j(!1);
	}
	async function ie(e) {
		if (e === "show-preview") j(!1);
		else if (e === "collapse-preview") j(!0);
		else if (e === "add-node") ee.openSearch();
		else {
			O = document.activeElement, e === "examples" && n().refreshExamples?.(), e === "fast-connections" && n().fastConnections?.refresh?.(), e === "story-documents" && n().storyDocuments?.refresh?.(), e === "recall-arms" && n().recallArms?.refresh?.();
			let t = ++k;
			R(E, e, !0), await lr(), t === k && W(E) === e && W(D)?.querySelector("button")?.focus();
		}
	}
	function ae() {
		k++, R(E, ""), O?.focus({ preventScroll: !0 });
	}
	async function oe(e) {
		let t = k;
		try {
			let r = await n().openExample?.(e);
			return r === !0 && t === k && W(E) === "examples" && ae(), r === !0;
		} catch {
			return !1;
		}
	}
	function se(e) {
		if (e.stopPropagation(), e.key === "Escape") e.preventDefault(), n().portalManager?.close?.();
		else if (e.key === "Tab") {
			let t = [...e.currentTarget.querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex=\"0\"]")], n = t[0], r = t.at(-1);
			e.shiftKey && document.activeElement === n && (e.preventDefault(), r?.focus()), !e.shiftKey && document.activeElement === r && (e.preventDefault(), n?.focus());
		}
	}
	function ce(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), ae()), e.key === "Tab") {
			let t = [...W(D).querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex=\"0\"]")], n = t[0], r = t.at(-1);
			e.shiftKey && document.activeElement === n && (e.preventDefault(), r?.focus()), !e.shiftKey && document.activeElement === r && (e.preventDefault(), n?.focus());
		}
	}
	Ti(() => {
		let e = () => {
			R(x, Math.max(90, s.clientHeight - 190), !0), R(C, Math.max(220, Math.min(520, (a.clientWidth || i.clientWidth || window.innerWidth) - 368)), !0);
		}, t = globalThis.ResizeObserver;
		if (!t) return e(), window.addEventListener("resize", e), () => window.removeEventListener("resize", e);
		let n = new t(e);
		return n.observe(s), n.observe(a), e(), () => n.disconnect();
	});
	var le = {
		getParts: d,
		updateActions: f,
		update: p,
		renameGraphView: m,
		focusCommentTitle: h,
		revealPreview: re
	}, ue = Ul();
	let de, fe;
	var pe = z(ue);
	Ci(ta(pe, {
		get state() {
			return W(r);
		},
		get actions() {
			return n();
		},
		local: ie
	}), (e) => l = e, () => l);
	var me = V(pe, 2), he = (e) => {
		var t = Rl(), n = z(t);
		P(t), H((e) => Y(n, `Recall armed · ${e ?? ""}`), [() => W(r).recallArms.nodes.filter((e) => e.armed).length]), K("click", t, () => ie("recall-arms")), J(e, t);
	}, ge = /* @__PURE__ */ F(() => W(r).recallArms?.nodes.some((e) => e.armed));
	X(me, (e) => {
		W(ge) && e(he);
	});
	var _e = V(me, 2), ve = z(_e), ye = z(ve);
	let be, xe;
	var Se = z(ye), Ce = V(z(Se)), we = z(Ce, !0);
	P(Ce), P(Se);
	var Te = V(Se, 2), Ee = z(Te);
	{
		let e = /* @__PURE__ */ F(() => W(r).outputPreview ?? null);
		ds(Ee, {
			get view() {
				return W(e);
			},
			get actions() {
				return n().outputPreview;
			},
			collapse: () => j(!0)
		});
	}
	P(Te), P(ye);
	var M = V(ye, 2), De = (e) => {
		{
			let t = /* @__PURE__ */ F(() => Math.min(W(y), W(x)));
			ra(e, {
				get height() {
					return W(t);
				},
				get max() {
					return W(x);
				},
				start: ne,
				change: (e) => {
					R(y, e, !0), te();
				}
			});
		}
	};
	X(M, (e) => {
		W(b) || e(De);
	});
	var N = V(M, 2);
	Ci(ha(N, {
		get views() {
			return W(r).graphViews;
		},
		get actions() {
			return n().graphViewActions;
		},
		panelId: "pc-workspace-graph"
	}), (e) => u = e, () => u);
	var Oe = V(N, 2);
	{
		let e = /* @__PURE__ */ F(() => W(r).graphViews?.active);
		ba(Oe, {
			get view() {
				return W(e);
			},
			get actions() {
				return n().graphViewActions;
			}
		});
	}
	var ke = V(Oe, 2), je = z(ke), Me = z(je);
	{
		let e = /* @__PURE__ */ F(() => W(r).runMeter ?? null);
		Es(Me, {
			get view() {
				return W(e);
			},
			open: () => {
				R(E, "run-details");
			}
		});
	}
	P(je);
	var Ne = V(je, 2);
	Ci(Ne, (e) => o = e, () => o);
	var Pe = V(Ne, 2), Fe = (e) => {
		var t = zl(), n = z(t, !0);
		P(t), H(() => Y(n, W(r).nativeDiagnostic)), J(e, t);
	};
	X(Pe, (e) => {
		W(r).nativeDiagnostic && e(Fe);
	}), Ci(gl(V(Pe, 2), {
		get view() {
			return W(r).workflow;
		},
		get choices() {
			return W(r).nativeChoices;
		},
		get choose() {
			return n().chooseNative;
		},
		get shelfSubgraph() {
			return n().shelfSubgraph;
		},
		get readOnly() {
			return W(r).readOnly;
		},
		add: (e, t) => n().addNode?.(e, t)
	}), (e) => ee = e, () => ee), P(ke), P(ve), Ci(ve, (e) => s = e, () => s);
	var Ie = V(ve, 2), Le = (e) => {
		var t = Ar();
		zr(B(t), () => W(r).graphViews?.active.key ?? W(r).graphId, (e) => {
			aa(e, {
				get width() {
					return W(w);
				},
				get max() {
					return W(C);
				},
				start: ne,
				preview: (e) => R(S, e, !0),
				change: T
			});
		}), J(e, t);
	};
	X(Ie, (e) => {
		W(r).inspectorOpen && e(Le);
	});
	var Re = V(Ie, 2), ze = z(Re), Be = V(z(ze));
	P(ze);
	var Ue = V(ze, 2), We = (e) => {
		let t = /* @__PURE__ */ F(() => W(r).commentDetails);
		qo(e, {
			get comment() {
				return W(t).comment;
			},
			onPatch: (e) => n().commentDetails?.patch(W(t).selection, e),
			onCommand: (e) => n().commentDetails?.command(W(t).selection, e)
		});
	};
	X(Ue, (e) => {
		W(r).commentDetails && e(We);
	});
	var Ge = V(Ue, 2), Ke = z(Ge);
	{
		let e = /* @__PURE__ */ F(() => W(r).commentDetails ? null : W(r).nodeDetails ?? null);
		Wo(Ke, {
			get view() {
				return W(e);
			},
			get actions() {
				return n().nodeDetails;
			}
		});
	}
	P(Ge), P(Re), Ci(Re, (e) => c = e, () => c), P(_e), Ci(_e, (e) => a = e, () => a);
	var qe = V(_e, 2), Je = (e) => {
		var t = Vl(), i = z(t);
		let a;
		var o = z(i), s = z(o), c = z(s, !0);
		P(s);
		var l = V(s);
		P(o);
		var u = V(o, 2), d = (e) => {
			Dl(e, {
				get examples() {
					return W(r).examples;
				},
				get issue() {
					return W(r).examplesIssue;
				},
				get retry() {
					return n().refreshExamples;
				},
				get scrollTop() {
					return W(A);
				},
				scroll: (e) => R(A, e, !0),
				open: oe
			});
		}, f = (e) => {
			{
				let t = /* @__PURE__ */ F(() => W(r).fastConnections ?? {
					userId: "",
					connections: [],
					issue: "Fast connection settings are unavailable."
				});
				tc(e, {
					get view() {
						return W(t);
					},
					get actions() {
						return n().fastConnections;
					},
					close: ae
				});
			}
		}, p = (e) => {
			{
				let t = /* @__PURE__ */ F(() => W(r).recallArms ?? {
					scope: null,
					nodes: [],
					issue: "Recall state is unavailable."
				});
				kc(e, {
					get view() {
						return W(t);
					},
					get actions() {
						return n().recallArms;
					},
					close: ae
				});
			}
		}, m = (e) => {
			{
				let t = /* @__PURE__ */ F(() => W(r).storyDocuments ?? {
					key: "",
					revision: "",
					scope: {
						userId: "",
						chatId: ""
					},
					documents: [],
					issue: "Story document setup is unavailable."
				});
				Cc(e, {
					get view() {
						return W(t);
					},
					get actions() {
						return n().storyDocuments;
					},
					close: ae
				});
			}
		}, h = (e) => {
			{
				let t = /* @__PURE__ */ F(() => W(r).runDetails ?? null);
				Ss(e, {
					get view() {
						return W(t);
					},
					get actions() {
						return n().runDetails;
					}
				});
			}
		}, g = (e) => {
			var t = Bl();
			Ae(4), J(e, t);
		};
		X(u, (e) => {
			W(E) === "examples" ? e(d) : W(E) === "fast-connections" ? e(f, 1) : W(E) === "recall-arms" ? e(p, 2) : W(E) === "story-documents" ? e(m, 3) : W(E) === "run-details" ? e(h, 4) : e(g, -1);
		}), P(i), Ci(i, (e) => R(D, e), () => W(D)), P(t), H(() => {
			a = ri(i, 1, "pc-workspace-dialog svelte-1dr9aew", null, a, { "pc-examples-dialog": W(E) === "examples" }), $(i, "aria-label", W(E) === "examples" ? "Examples" : W(E) === "run-details" ? "Run details" : W(E) === "fast-connections" ? "Fast connections" : W(E) === "story-documents" ? "Story documents" : W(E) === "recall-arms" ? "Recall arms" : "Workspace guide"), Y(c, W(E) === "examples" ? "Examples" : W(E) === "run-details" ? "Run details" : W(E) === "fast-connections" ? "Fast connections" : W(E) === "story-documents" ? "Story documents" : W(E) === "recall-arms" ? "Recall arms" : "Workspace guide");
		}), K("keydown", i, ce), G("paste", i, (e) => e.stopPropagation()), K("click", l, ae), J(e, t);
	};
	X(qe, (e) => {
		W(E) && e(Je);
	});
	var Ye = V(qe, 2);
	qc(Ye, {
		get view() {
			return W(r).nativeSearch;
		},
		get actions() {
			return n().nativeSearch;
		}
	});
	var Xe = V(Ye, 2);
	Zc(Xe, {
		get view() {
			return W(r).nativePinMenu;
		},
		get actions() {
			return n().nativePinMenu;
		}
	});
	var Ze = V(Xe, 2), Qe = (e) => {
		var t = Hl(), i = z(t);
		Gs(z(i), {
			get view() {
				return W(r).portalManager;
			},
			get actions() {
				return n().portalManager;
			}
		}), P(i), P(t), K("keydown", i, se), G("paste", i, (e) => e.stopPropagation()), J(e, t);
	};
	X(Ze, (e) => {
		W(r).portalManager && e(Qe);
	});
	var $e = V(Ze, 2), et = (e) => {
		Ic(e, {
			get view() {
				return W(r).configureNode;
			},
			get actions() {
				return n().configureNode;
			}
		});
	};
	X($e, (e) => {
		W(r).configureNode && e(et);
	});
	var tt = V($e, 2), nt = (e) => {
		Ys(e, {
			get view() {
				return W(r).subgraphSave;
			},
			get actions() {
				return n().subgraphSave;
			}
		});
	};
	X(tt, (e) => {
		W(r).subgraphSave && e(nt);
	});
	var rt = V(tt, 2), it = (e) => {
		Ll(e, {
			get view() {
				return W(r).importReview;
			},
			get actions() {
				return n();
			}
		});
	};
	X(rt, (e) => {
		W(r).importReview && e(it);
	});
	var at = V(rt, 2), ot = (e) => {
		Rc(e, {
			get view() {
				return W(r).newWorkflowPrompt;
			},
			get actions() {
				return n().newWorkflowPrompt;
			}
		});
	};
	return X(at, (e) => {
		W(r).newWorkflowPrompt && e(ot);
	}), P(ue), Ci(ue, (e) => i = e, () => i), H((e) => {
		de = ri(ue, 1, "pc-root pc-native-workspace svelte-1dr9aew", null, de, { "pc-native-flat": W(r).nativeFlatCanvas }), fe = ai(ue, "", fe, { "--pc-details-width": `${W(w)}px` }), be = ri(ye, 1, "pc-preview-pane", null, be, { "pc-preview-collapsed": W(b) }), xe = ai(ye, "", xe, e), $(Ce, "aria-expanded", !W(b)), Y(we, W(b) ? "Expand preview" : "Collapse preview"), $(Te, "hidden", W(b)), $(Re, "hidden", !W(r).inspectorOpen), $(Ge, "hidden", !!W(r).commentDetails);
	}, [() => ({ "--pc-preview-height": `${Math.min(W(y), W(x))}px` })]), K("click", Ce, () => j(!W(b))), K("click", Be, () => n().managePortals?.()), J(e, ue), He(le);
}
yr(["click", "keydown"]);
//#endregion
//#region ui/entry.js
function Gl(e, t) {
	let n = document.createElement("div");
	n.style.cssText = "position:absolute;left:0;top:0;visibility:hidden;pointer-events:none", n.setAttribute("aria-hidden", "true"), n.inert = !0, e.append(n);
	let r;
	try {
		r = Mr(Ni, {
			target: n,
			props: {
				card: t,
				actions: {
					hoverPin() {},
					hostResult() {}
				}
			}
		}), It();
		let { width: e, height: i } = n.querySelector(".pc-node").getBoundingClientRect();
		return {
			width: e,
			height: i
		};
	} finally {
		r && Ir(r), n.remove();
	}
}
function Kl(e, t) {
	let n = Mr(qi, {
		target: e,
		props: { actions: t }
	});
	return It(), {
		...n.getLayers(),
		setComments: (e, t) => It(() => n.setComments(e, t)),
		setNodes: (e) => It(() => n.setNodes(e)),
		setGroups: (e) => It(() => n.setGroups(e)),
		setWires: (e, t, r) => It(() => n.setWires(e, t, r)),
		setPositions: (e, t) => It(() => n.setPositions(e, t)),
		destroy: () => Ir(n)
	};
}
function ql(e, t) {
	let n = Mr(Wl, {
		target: e,
		props: { actions: t }
	});
	return It(), {
		...n.getParts(),
		update: (e) => It(() => n.update(e)),
		updateActions: (e) => It(() => n.updateActions(e)),
		revealPreview: () => It(() => n.revealPreview()),
		renameGraphView: (e) => n.renameGraphView(e),
		focusCommentTitle: (e, t) => n.focusCommentTitle(e, t),
		destroy: () => Ir(n)
	};
}
//#endregion
export { Gl as measureNodeCard, Kl as mountCanvas, ql as mountWorkbench };
