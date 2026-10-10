/*! Svelte runtime: Copyright (c) 2016-2025 Svelte Contributors. MIT license; see THIRD_PARTY_NOTICES.md. */
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/shared/utils.js
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
var h = 1024, g = 2048, _ = 4096, v = 8192, y = 16384, b = 32768, x = 1 << 25, S = 65536, C = 1 << 19, w = 1 << 20, T = 1 << 25, E = 65536, D = 1 << 21, O = 1 << 22, k = 1 << 23, A = Symbol("$state"), ee = Symbol("legacy props"), j = Symbol(""), te = Symbol("attributes"), M = Symbol("class"), ne = Symbol("style"), re = Symbol("text"), ie = Symbol("form reset"), ae = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), oe = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml");
function se(e) {
	throw Error("https://svelte.dev/e/lifecycle_outside_component");
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/errors.js
function ce() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function le(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function ue(e) {
	throw Error("https://svelte.dev/e/effect_in_teardown");
}
function de() {
	throw Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function fe(e) {
	throw Error("https://svelte.dev/e/effect_orphan");
}
function pe() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function me(e) {
	throw Error("https://svelte.dev/e/props_invalid_value");
}
function he() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function ge() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function _e() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function ve() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/constants.js
var ye = {}, be = Symbol("uninitialized"), xe = "http://www.w3.org/1999/xhtml";
function Se() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function Ce(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
function we() {
	console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Te() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/hydration.js
var N = !1;
function Ee(e) {
	N = e;
}
var P;
function De(e) {
	if (e === null) throw Ce(), ye;
	return P = e;
}
function Oe() {
	return De(/* @__PURE__ */ ln(P));
}
function F(e) {
	if (N) {
		if (/* @__PURE__ */ ln(P) !== null) throw Ce(), ye;
		P = e;
	}
}
function ke(e = 1) {
	if (N) {
		for (var t = e, n = P; t--;) n = /* @__PURE__ */ ln(n);
		P = n;
	}
}
function Ae(e = !0) {
	for (var t = 0, n = P;;) {
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
function je(e) {
	if (!e || e.nodeType !== 8) throw Ce(), ye;
	return e.data;
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/reactivity/equality.js
function Me(e) {
	return e === this.v;
}
function Ne(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function Pe(e) {
	return !Ne(e, this.v);
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/shared/clone.js
var Fe = [];
function Ie(e, t = !1, n = !1) {
	return Le(e, /* @__PURE__ */ new Map(), "", Fe, null, n);
}
function Le(t, n, r, i, a = null, o = !1) {
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
				d in t && (u[d] = Le(f, n, r, i, null, o));
			}
			return u;
		}
		if (l(t) === s) {
			u = {}, n.set(t, u), a !== null && n.set(a, u);
			for (var p of Object.keys(t)) u[p] = Le(t[p], n, r, i, null, o);
			return u;
		}
		if (t instanceof Date) return structuredClone(t);
		if (typeof t.toJSON == "function" && !o) return Le(t.toJSON(), n, r, i, t);
	}
	if (t instanceof EventTarget) return t;
	try {
		return structuredClone(t);
	} catch {
		return t;
	}
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/context.js
var Re = null;
function ze(e) {
	Re = e;
}
function Be(e, t = !1, n) {
	Re = {
		p: Re,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: Gn,
		l: null
	};
}
function Ve(e) {
	var t = Re, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) bn(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, Re = t.p, e ?? {};
}
function He() {
	return !0;
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/task.js
var Ue = [];
function We() {
	var e = Ue;
	Ue = [], f(e);
}
function Ge(e) {
	if (Ue.length === 0 && !Ot) {
		var t = Ue;
		queueMicrotask(() => {
			t === Ue && We();
		});
	}
	Ue.push(e);
}
function Ke() {
	for (; Ue.length > 0;) We();
}
function qe(e) {
	var t = Gn;
	if (t === null) return Hn.f |= k, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	Je(e, t);
}
function Je(e, t) {
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
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/reactivity/status.js
var Ye = ~(g | _ | h);
function Xe(e, t) {
	e.f = e.f & Ye | t;
}
function Ze(e) {
	e.f & 512 || e.deps === null ? Xe(e, h) : Xe(e, _);
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/reactivity/utils.js
function Qe(e) {
	if (e !== null) for (let t of e) t.f & 2 && t.f & 65536 && (t.f ^= E, Qe(t.deps));
}
function $e(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), Qe(e.deps), Xe(e, h);
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/reactivity/store.js
var et = !1;
function tt(e) {
	var t = et;
	try {
		return et = !1, [e(), et];
	} finally {
		et = t;
	}
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/elements/misc.js
function nt(e) {
	N && /* @__PURE__ */ cn(e) !== null && un(e);
}
var rt = !1;
function it() {
	rt || (rt = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[ie]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function at(e) {
	var t = Hn, n = Gn;
	Wn(null), Kn(null);
	try {
		return e();
	} finally {
		Wn(t), Kn(n);
	}
}
function ot(e, t, n, r = n) {
	e.addEventListener(t, () => at(n));
	let i = e[ie];
	e[ie] = i ? () => {
		i(), r(!0);
	} : () => r(!0), it();
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/reactivity/create-subscriber.js
function st(e) {
	let t = 0, n = Gt(0), r;
	return () => {
		_n() && (W(n), wn(() => (t === 0 && (r = pr(() => e(() => Yt(n)))), t += 1, () => {
			Ge(() => {
				--t, t === 0 && (r?.(), r = void 0, Yt(n));
			});
		})));
	};
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var ct = S | C;
function lt(e, t, n, r) {
	new ut(e, t, n, r);
}
var ut = class {
	parent;
	is_pending = !1;
	transform_error;
	#e;
	#t = N ? P : null;
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
	#h = st(() => (this.#m = Gt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = Gn;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = Gn.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = Tn(() => {
			if (N) {
				let e = this.#t;
				Oe();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, ct), N && (this.#e = P);
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
		Ge(r), t && (this.#s = En(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			t ? Te() : (t = !0, n && ve(), this.#s !== null && Nn(this.#s, () => {
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
					Je(e, this.#i && this.#i.parent);
				}
			}
		};
	}
	#y() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = En(() => e(this.#e)), Ge(() => {
			var e = this.#c = document.createDocumentFragment(), t = sn();
			e.append(t), this.#a = this.#S(() => En(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, Nn(this.#o, () => {
				this.#o = null;
			}), this.#x(L));
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
			} else this.#x(L);
		} catch (e) {
			this.error(e);
		}
	}
	#x(e) {
		this.is_pending = !1, e.transfer_effects(this.#f, this.#p);
	}
	defer_effect(e) {
		$e(e, this.#f, this.#p);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#n.pending;
	}
	#S(e) {
		var t = Gn, n = Hn, r = Re;
		Kn(this.#i), Wn(this.#i), ze(this.#i.ctx);
		try {
			return Pt.ensure(), e();
		} catch (e) {
			return qe(e), null;
		} finally {
			Kn(t), Wn(n), ze(r);
		}
	}
	#C(e, t) {
		this.has_pending_snippet() ? (this.#u += e, this.#u === 0 && (this.#x(t), this.#o && Nn(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null))) : this.parent && this.parent.#C(e, t);
	}
	update_pending_count(e, t) {
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, Ge(() => {
			this.#d = !1, this.#m && qt(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), W(this.#m);
	}
	error(e) {
		if (!this.#n.onerror && !this.#n.failed) throw e;
		L?.is_fork ? (this.#a && L.skip_effect(this.#a), this.#o && L.skip_effect(this.#o), this.#s && L.skip_effect(this.#s), L.oncommit(() => {
			this.#w(e);
		})) : this.#w(e);
	}
	#w(e) {
		this.#a &&= (An(this.#a), null), this.#o &&= (An(this.#o), null), this.#s &&= (An(this.#s), null), N && (De(this.#t), ke(), De(Ae()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return En(() => {
						var r = Gn;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return Je(e, this.#i.parent), null;
				}
			}));
		};
		Ge(() => {
			var t;
			try {
				t = this.transform_error(e);
			} catch (e) {
				Je(e, this.#i && this.#i.parent);
				return;
			}
			typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => Je(e, this.#i && this.#i.parent)) : n(t);
		});
	}
};
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/reactivity/async.js
function dt(e, t, n, r) {
	let i = He() ? ht : vt;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = Gn, c = ft(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				Je(e, s);
			}
			pt();
		}
	}
	var d = mt();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ _t(e))).then(u).catch((e) => Je(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), pt();
	}) : f();
}
function ft() {
	var e = Gn, t = Hn, n = Re, r = L;
	return function(i = !0) {
		Kn(e), Wn(t), ze(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function pt(e = !0) {
	Kn(null), Wn(null), ze(null), e && L?.deactivate();
}
function mt() {
	var e = Gn, t = e.b, n = L, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function ht(e) {
	var t = 2 | g;
	return Gn !== null && (Gn.f |= C), {
		ctx: Re,
		deps: null,
		effects: null,
		equals: Me,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v: be,
		wv: 0,
		parent: Gn,
		ac: null
	};
}
var gt = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function _t(e, t, n) {
	let r = Gn;
	r === null && ce();
	var i = void 0, a = Gt(be), o = !Hn, s = /* @__PURE__ */ new Set();
	return Cn(() => {
		var t = Gn, n = p();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== ae && n.reject(e);
			}).finally(pt);
		} catch (e) {
			n.reject(e), pt();
		}
		var c = L;
		if (o) {
			if (t.f & 32768) var l = mt();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(gt);
			else for (let e of s.values()) e.reject(gt);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== gt && (c.activate(), t ? (a.f |= k, qt(a, t)) : (a.f & 8388608 && (a.f ^= k), qt(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), vn(() => {
		for (let e of s) e.reject(gt);
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
function I(e) {
	let t = /* @__PURE__ */ ht(e);
	return Jn(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function vt(e) {
	let t = /* @__PURE__ */ ht(e);
	return t.equals = Pe, t;
}
function yt(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) An(t[n]);
	}
}
function bt(e) {
	var t, n = Gn, r = e.parent;
	if (!Bn && r !== null && e.v !== be && r.f & 24576) return Se(), e.v;
	Kn(r);
	try {
		e.f &= ~E, yt(e), t = or(e);
	} finally {
		Kn(n);
	}
	return t;
}
function xt(e) {
	var t = bt(e);
	!e.equals(t) && (e.wv = rr(), (!L?.is_fork || e.deps === null) && (L === null ? e.v = t : (L.capture(e, t, !0), Tt?.capture(e, t, !0)), e.deps === null)) ? Xe(e, h) : Bn || (Et === null ? Ze(e) : (_n() || L?.is_fork) && Et.set(e, t));
}
function St(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && at(() => {
		t.ac.abort(ae), t.ac = null;
	}), t.fn !== null && (t.teardown = d), cr(t, 0), On(t));
}
function Ct(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && lr(t);
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/reactivity/batch.js
var wt = null, L = null, Tt = null, Et = null, Dt = null, Ot = !1, kt = !1, At = null, jt = null, Mt = 0, Nt = 1, Pt = class e {
	id = Nt++;
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
		wt === null ? wt = this : (wt.#n = this, this.#t = wt), wt = this;
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
			for (var r of n.d) Xe(r, g), t(r);
			for (r of n.m) Xe(r, _), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, Mt++ > 1e3 && (this.#x(), It());
		for (let e of this.#u) this.#d.delete(e), Xe(e, g), this.schedule(e);
		for (let e of this.#d) Xe(e, _), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = At = [], r = [], i = jt = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw Vt(e), this.#h() || this.discard(), t;
		}
		if (L = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (At = null, jt = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) Bt(e, t);
			i.length > 0 && L.#g();
			return;
		}
		let o = this.#v();
		if (o) this.#b(r), this.#b(n), o.#y(this);
		else {
			this.#u.clear(), this.#d.clear();
			for (let e of this.#r) e(this);
			this.#r.clear(), Tt = this, Rt(r), Rt(n), Tt = null, this.#s?.resolve();
			var s = L;
			if (this.#a === 0 && (this.#c.length === 0 || s !== null) && this.#x(), this.#c.length > 0) {
				if (s !== null) {
					let e = s;
					e.#c.push(...this.#c.filter((t) => !e.#c.includes(t)));
				} else s = this;
			}
			s !== null && (Ut.clear(), s.#g());
		}
	}
	#_(e, t, n) {
		e.f ^= h;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= h : i & 4 ? t.push(r) : ir(r) && (i & 16 && this.#d.add(r), lr(r));
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), Xe(i, g), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), L = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) $e(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== be && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), Et?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		L = this;
	}
	deactivate() {
		L = null, Et = null;
	}
	flush() {
		try {
			kt = !0, L = this, this.#g();
		} finally {
			Mt = 0, Dt = null, At = null, jt = null, kt = !1, L = null, Et = null, Ut.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(gt);
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
		this.#m || (this.#m = !0, Ge(() => {
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
		if (L === null) {
			let t = L = new e();
			!kt && !Ot && Ge(() => {
				t.#e || t.flush();
			});
		}
		return L;
	}
	apply() {
		Et = null;
	}
	schedule(e) {
		if (Dt = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) e.b.defer_effect(e);
		else {
			for (var t = e; t.parent !== null;) {
				t = t.parent;
				var n = t.f;
				if (At !== null && t === Gn && (Hn === null || !(Hn.f & 2))) return;
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
			e === null || (e.#n = t), t === null ? wt = e : t.#t = e, this.linked = !1;
		}
	}
};
function Ft(e) {
	var t = Ot;
	Ot = !0;
	try {
		var n;
		for (e && (L !== null && !L.is_fork && L.flush(), n = e());;) {
			if (Ke(), L === null) return n;
			L.flush();
		}
	} finally {
		Ot = t;
	}
}
function It() {
	try {
		pe();
	} catch (e) {
		Je(e, Dt);
	}
}
var Lt = null;
function Rt(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && ir(r) && (Lt = /* @__PURE__ */ new Set(), lr(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Mn(r), Lt?.size > 0)) {
				Ut.clear();
				for (let e of Lt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) Lt.has(n) && (Lt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || lr(n);
					}
				}
				Lt.clear();
			}
		}
		Lt = null;
	}
}
function zt(e) {
	L.schedule(e);
}
function Bt(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), Xe(e, h);
		for (var n = e.first; n !== null;) Bt(n, t), n = n.next;
	}
}
function Vt(e) {
	Xe(e, h);
	for (var t = e.first; t !== null;) Vt(t), t = t.next;
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/reactivity/sources.js
var Ht = /* @__PURE__ */ new Set(), Ut = /* @__PURE__ */ new Map(), Wt = !1;
function Gt(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: Me,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function R(e, t) {
	let n = Gt(e, t);
	return Jn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function Kt(e, t = !1, n = !0) {
	let r = Gt(e);
	return t || (r.equals = Pe), r;
}
function z(e, t, n = !1) {
	return Hn !== null && (!Un || Hn.f & 131072) && He() && Hn.f & 4325394 && (qn === null || !qn.has(e)) && _e(), qt(e, n ? Zt(t) : t, jt);
}
function qt(e, t, n = null) {
	if (!e.equals(t)) {
		Bn ? Ut.set(e, t) : Ut.has(e) || Ut.set(e, e.v);
		var r = Pt.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && bt(t), Et === null && Ze(t);
		}
		e.wv = rr(), Xt(e, g, n), He() && Gn !== null && Gn.f & 1024 && !(Gn.f & 96) && (Zn === null ? Qn([e]) : Zn.push(e)), !r.is_fork && Ht.size > 0 && !Wt && Jt();
	}
	return t;
}
function Jt() {
	Wt = !1;
	for (let e of Ht) {
		e.f & 1024 && Xe(e, _);
		let t;
		try {
			t = ir(e);
		} catch {
			t = !0;
		}
		t && lr(e);
	}
	Ht.clear();
}
function Yt(e) {
	z(e, e.v + 1);
}
function Xt(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = He(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (i || s !== Gn) {
			var l = (c & g) === 0;
			if (l && Xe(s, t), c & 131072) Ht.add(s);
			else if (c & 2) {
				var u = s;
				Et?.delete(u), c & 65536 || (c & 512 && (Gn === null || !(Gn.f & 2097152)) && (s.f |= E), Xt(u, _, n));
			} else if (l) {
				var d = s;
				c & 16 && Lt !== null && Lt.add(d), n === null ? zt(d) : n.push(d);
			}
		}
	}
}
function Zt(t) {
	if (typeof t != "object" || !t || A in t) return t;
	let n = l(t);
	if (n !== s && n !== c) return t;
	var r = /* @__PURE__ */ new Map(), i = e(t), o = /* @__PURE__ */ R(0), u = null, d = tr, f = (e) => {
		if (tr === d) return e();
		var t = Hn, n = tr;
		Wn(null), nr(d);
		var r = e();
		return Wn(t), nr(n), r;
	};
	return i && r.set("length", /* @__PURE__ */ R(t.length, u)), new Proxy(t, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && he();
			var i = r.get(t);
			return i === void 0 ? f(() => {
				var e = /* @__PURE__ */ R(n.value, u);
				return r.set(t, e), e;
			}) : z(i, n.value, !0), !0;
		},
		deleteProperty(e, t) {
			var n = r.get(t);
			if (n === void 0) {
				if (t in e) {
					let e = f(() => /* @__PURE__ */ R(be, u));
					r.set(t, e), Yt(o);
				}
			} else z(n, be), Yt(o);
			return !0;
		},
		get(e, n, i) {
			if (n === A) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ R(Zt(s ? e[n] : be), u)), r.set(n, o)), o !== void 0) {
				var c = W(o);
				return c === be ? void 0 : c;
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
				if (a !== void 0 && o !== be) return {
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
			var n = r.get(t), i = n !== void 0 && n.v !== be || Reflect.has(e, t);
			return (n !== void 0 || Gn !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ R(i ? Zt(e[t]) : be, u)), r.set(t, n)), W(n) === be) ? !1 : i;
		},
		set(e, t, n, s) {
			var c = r.get(t), l = t in e;
			if (i && t === "length") for (var d = n; d < c.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ R(be, u)), r.set(d + "", p)) : z(p, be);
			}
			if (c === void 0) (!l || a(e, t)?.writable) && (c = f(() => /* @__PURE__ */ R(void 0, u)), z(c, Zt(n)), r.set(t, c));
			else {
				l = c.v !== be;
				var m = f(() => Zt(n));
				z(c, m);
			}
			var h = Reflect.getOwnPropertyDescriptor(e, t);
			if (h?.set && h.set.call(s, n), !l) {
				if (i && typeof t == "string") {
					var g = r.get("length"), _ = Number(t);
					Number.isInteger(_) && _ >= g.v && z(g, _ + 1);
				}
				Yt(o);
			}
			return !0;
		},
		ownKeys(e) {
			W(o);
			var t = Reflect.ownKeys(e).filter((e) => {
				var t = r.get(e);
				return t === void 0 || t.v !== be;
			});
			for (var [n, i] of r) i.v !== be && !(n in e) && t.push(n);
			return t;
		},
		setPrototypeOf() {
			ge();
		}
	});
}
function Qt(e) {
	try {
		if (typeof e == "object" && e && A in e) return e[A];
	} catch {}
	return e;
}
function $t(e, t) {
	return Object.is(Qt(e), Qt(t));
}
var en, tn, nn, rn, an;
function on() {
	if (en === void 0) {
		en = window, tn = document, nn = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		rn = a(t, "firstChild").get, an = a(t, "nextSibling").get, u(e) && (e[M] = void 0, e[te] = null, e[ne] = void 0, e.__e = void 0), u(n) && (n[re] = void 0);
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
function B(e, t) {
	if (!N) return /* @__PURE__ */ cn(e);
	var n = /* @__PURE__ */ cn(P);
	if (n === null) n = P.appendChild(sn());
	else if (t && n.nodeType !== 3) {
		var r = sn();
		return n?.before(r), De(r), r;
	}
	return t && pn(n), De(n), n;
}
function V(e, t = !1) {
	if (!N) {
		var n = /* @__PURE__ */ cn(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ ln(n) : n;
	}
	if (t) {
		if (P?.nodeType !== 3) {
			var r = sn();
			return P?.before(r), De(r), r;
		}
		pn(P);
	}
	return P;
}
function H(e, t = 1, n = !1) {
	let r = N ? P : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ ln(r);
	if (!N) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = sn();
			return r === null ? i?.after(a) : r.before(a), De(a), a;
		}
		pn(r);
	}
	return De(r), r;
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
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/reactivity/effects.js
function mn(e) {
	Gn === null && (Hn === null && fe(e), de()), Bn && ue(e);
}
function hn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function gn(e, t) {
	var n = Gn;
	n !== null && n.f & 8192 && (e |= v);
	var r = {
		ctx: Re,
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
	L?.register_created_effect(r);
	var i = r;
	if (e & 4) At === null ? Pt.ensure().schedule(r) : At.push(r);
	else if (t !== null) {
		try {
			lr(r);
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
	return Xe(t, h), t.teardown = e, t;
}
function yn(e) {
	mn("$effect");
	var t = Gn.f;
	if (!Hn && t & 32 && Re !== null && !Re.i) {
		var n = Re;
		(n.e ??= []).push(e);
	} else return bn(e);
}
function bn(e) {
	return gn(4 | w, e);
}
function xn(e) {
	Pt.ensure();
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
function U(e, t = [], n = [], r = []) {
	dt(r, t, n, (t) => {
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
		e !== null && at(() => {
			e.abort(ae);
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
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (jn(e.nodes.start, e.nodes.end), n = !0), e.f |= x, On(e, t && !n), cr(e, 0);
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
		e.f ^= v, e.f & 1024 || (Xe(e, g), Pt.ensure().schedule(e));
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
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/legacy.js
var Rn = null, zn = !1, Bn = !1;
function Vn(e) {
	Bn = e;
}
var Hn = null, Un = !1;
function Wn(e) {
	Hn = e;
}
var Gn = null;
function Kn(e) {
	Gn = e;
}
var qn = null;
function Jn(e) {
	Hn !== null && (qn ??= /* @__PURE__ */ new Set()).add(e);
}
var Yn = null, Xn = 0, Zn = null;
function Qn(e) {
	Zn = e;
}
var $n = 1, er = 0, tr = er;
function nr(e) {
	tr = e;
}
function rr() {
	return ++$n;
}
function ir(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~E), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (ir(a) && xt(a), a.wv > e.wv) return !0;
		}
		t & 512 && Et === null && Xe(e, h);
	}
	return !1;
}
function ar(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(qn !== null && qn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? ar(a, t, !1) : t === a && (n ? Xe(a, g) : a.f & 1024 && Xe(a, _), zt(a));
	}
}
function or(e) {
	var t = Yn, n = Xn, r = Zn, i = Hn, a = qn, o = Re, s = Un, c = tr, l = e.f;
	Yn = null, Xn = 0, Zn = null, Hn = l & 96 ? null : e, qn = null, ze(e.ctx), Un = !1, tr = ++er, e.ac !== null && (at(() => {
		e.ac.abort(ae);
	}), e.ac = null);
	try {
		e.f |= D;
		var u = e.fn, d = u();
		e.f |= b;
		var f = e.deps, p = L?.is_fork;
		if (Yn !== null) {
			var m;
			if (p || cr(e, Xn), f !== null && Xn > 0) for (f.length = Xn + Yn.length, m = 0; m < Yn.length; m++) f[Xn + m] = Yn[m];
			else e.deps = f = Yn;
			if (_n() && e.f & 512) for (m = Xn; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && Xn < f.length && (cr(e, Xn), f.length = Xn);
		if (He() && Zn !== null && !Un && f !== null && !(e.f & 6146)) for (m = 0; m < Zn.length; m++) ar(Zn[m], e);
		if (i !== null && i !== e) {
			if (er++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = er;
			if (t !== null) for (let e of t) e.rv = er;
			Zn !== null && (r === null ? r = Zn : r.push(...Zn));
		}
		return e.f & 8388608 && (e.f ^= k), d;
	} catch (e) {
		return qe(e);
	} finally {
		e.f ^= D, Yn = t, Xn = n, Zn = r, Hn = i, qn = a, ze(o), Un = s, tr = c;
	}
}
function sr(e, r) {
	let i = r.reactions;
	if (i !== null) {
		var a = t.call(i, e);
		if (a !== -1) {
			var o = i.length - 1;
			o === 0 ? i = r.reactions = null : (i[a] = i[o], i.pop());
		}
	}
	if (i === null && r.f & 2 && (Yn === null || !n.call(Yn, r))) {
		var s = r;
		s.f & 512 && (s.f ^= 512, s.f &= ~E), s.v !== be && Ze(s), s.ac !== null && at(() => {
			s.ac.abort(ae), s.ac = null, Xe(s, g);
		}), St(s), cr(s, 0);
	}
}
function cr(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) sr(e, n[r]);
}
function lr(e) {
	var t = e.f;
	if (!(t & 16384)) {
		Xe(e, h);
		var n = Gn, r = zn;
		Gn = e, zn = !(t & 96);
		try {
			t & 16777232 ? kn(e) : On(e), Dn(e);
			var i = or(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = $n;
		} finally {
			zn = r, Gn = n;
		}
	}
}
async function ur() {
	await Promise.resolve(), Ft();
}
function W(e) {
	var t = !!(e.f & 2);
	if (Rn?.add(e), Hn !== null && !Un && !(Gn !== null && Gn.f & 16384) && (qn === null || !qn.has(e))) {
		var r = Hn.deps;
		if (Hn.f & 2097152) e.rv < er && (e.rv = er, Yn === null && r !== null && r[Xn] === e ? Xn++ : Yn === null ? Yn = [e] : Yn.push(e));
		else {
			Hn.deps ??= [], n.call(Hn.deps, e) || Hn.deps.push(e);
			var i = e.reactions;
			i === null ? e.reactions = [Hn] : n.call(i, Hn) || i.push(Hn);
		}
	}
	if (Bn && Ut.has(e)) return Ut.get(e);
	if (t) {
		var a = e;
		if (Bn) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || fr(a)) && (o = bt(a)), Ut.set(a, o), o;
		}
		var s = !(a.f & 512) && !Un && Hn !== null && (zn || !!(Hn.f & 512)), c = (a.f & b) === 0;
		ir(a) && (s && (a.f |= 512), xt(a)), s && !c && (Ct(a), dr(a));
	}
	if (Et?.has(e)) return Et.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function dr(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (Ct(t), dr(t));
}
function fr(e) {
	if (e.v === be) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Ut.has(t) || t.f & 2 && fr(t)) return !0;
	return !1;
}
function pr(e) {
	var t = Un;
	try {
		return Un = !0, e();
	} finally {
		Un = t;
	}
}
function mr(e) {
	if (!(typeof e != "object" || !e || e instanceof EventTarget)) {
		if (A in e) hr(e);
		else if (!Array.isArray(e)) for (let t in e) {
			let n = e[t];
			typeof n == "object" && n && A in n && hr(n);
		}
	}
}
function hr(e, t = /* @__PURE__ */ new Set()) {
	if (typeof e == "object" && e && !(e instanceof EventTarget) && !t.has(e)) {
		t.add(e), e instanceof Date && e.getTime();
		for (let n in e) try {
			hr(e[n], t);
		} catch {}
		let n = l(e);
		if (n !== Object.prototype && n !== Array.prototype && n !== Map.prototype && n !== Set.prototype && n !== Date.prototype) {
			let t = o(n);
			for (let n in t) {
				let r = t[n].get;
				if (r) try {
					r.call(e);
				} catch {}
			}
		}
	}
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var gr = ["touchstart", "touchmove"];
function _r(e) {
	return gr.includes(e);
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/elements/events.js
var vr = Symbol("events"), yr = /* @__PURE__ */ new Set(), br = /* @__PURE__ */ new Set();
function xr(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || Tr.call(t, e), !e.cancelBubble) return at(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Ge(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function G(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = xr(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && vn(() => {
		t.removeEventListener(e, o, a);
	});
}
function K(e, t, n) {
	(t[vr] ??= {})[e] = n;
}
function Sr(e) {
	for (var t = 0; t < e.length; t++) yr.add(e[t]);
	for (var n of br) n(e);
}
var Cr = null, wr = !1;
function Tr(e) {
	var t = this, n = t.ownerDocument, r = e.type, a = e.composedPath?.() || [], o = a[0] || e.target;
	Cr = e, wr || (wr = !0, setTimeout(() => {
		wr = !1, Cr = null;
	}));
	var s = 0, c = Cr === e && e[vr];
	if (c) {
		var l = a.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[vr] = t;
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
		var d = Hn, f = Gn;
		Wn(null), Kn(null);
		try {
			for (var p, m = []; o !== null && o !== t;) {
				try {
					var h = o[vr]?.[r];
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
			e[vr] = t, delete e.currentTarget, Wn(d), Kn(f);
		}
	}
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/reconciler.js
var Er = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function Dr(e) {
	return Er?.createHTML(e) ?? e;
}
function Or(e) {
	var t = fn("template");
	return t.innerHTML = Dr(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/template.js
function kr(e, t) {
	var n = Gn;
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
		if (N) return kr(P, null), P;
		i === void 0 && (i = Or(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ cn(i)));
		var t = r || nn ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ cn(t), s = t.lastChild;
			kr(o, s);
		} else kr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Ar(e, t, n = "svg") {
	var r = !e.startsWith("<!>"), i = !!(t & 1), a = `<${n}>${r ? e : "<!>" + e}</${n}>`, o;
	return () => {
		if (N) return kr(P, null), P;
		if (!o) {
			var e = /* @__PURE__ */ cn(Or(a));
			if (i) for (o = document.createDocumentFragment(); /* @__PURE__ */ cn(e);) o.appendChild(/* @__PURE__ */ cn(e));
			else o = /* @__PURE__ */ cn(e);
		}
		var t = o.cloneNode(!0);
		if (i) {
			var n = /* @__PURE__ */ cn(t), r = t.lastChild;
			kr(n, r);
		} else kr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function jr(e, t) {
	return /* @__PURE__ */ Ar(e, t, "svg");
}
function Mr(e = "") {
	if (!N) {
		var t = sn(e + "");
		return kr(t, t), t;
	}
	var n = P;
	return n.nodeType === 3 ? pn(n) : (n.before(n = sn()), De(n)), kr(n, n), n;
}
function Nr() {
	if (N) return kr(P, null), P;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = sn();
	return e.append(t, n), kr(t, n), e;
}
function J(e, t) {
	if (N) {
		var n = Gn;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = P), Oe();
	} else e !== null && e.before(t);
}
function Pr() {
	if (N && P && P.nodeType === 8 && P.textContent?.startsWith("$")) {
		let e = P.textContent.substring(1);
		return Oe(), e;
	}
	return (window.__svelte ??= {}).uid ??= 1, `c${window.__svelte.uid++}`;
}
function Y(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[re] ??= e.nodeValue) && (e[re] = n, e.nodeValue = `${n}`);
}
function Fr(e, t) {
	return Lr(e, t);
}
var Ir = /* @__PURE__ */ new Map();
function Lr(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	on();
	var l = void 0, u = xn(() => {
		var s = n ?? t.appendChild(sn());
		lt(s, { pending: () => {} }, (t) => {
			Be({});
			var n = Re;
			if (o && (n.c = o), a && (i.$$events = a), N && kr(t, null), l = e(t, i) || {}, N && (Gn.nodes.end = P, P === null || P.nodeType !== 8 || P.data !== "]")) throw Ce(), ye;
			Ve();
		}, c);
		var u = /* @__PURE__ */ new Set(), d = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!u.has(r)) {
					u.add(r);
					var i = _r(r);
					for (let e of [t, document]) {
						var a = Ir.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), Ir.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, Tr, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return d(r(yr)), br.add(d), () => {
			for (var e of u) for (let n of [t, document]) {
				var r = Ir.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, Tr), r.delete(e), r.size === 0 && Ir.delete(n)) : r.set(e, i);
			}
			br.delete(d), s !== n && s.parentNode?.removeChild(s);
		};
	});
	return Rr.set(l, u), l;
}
var Rr = /* @__PURE__ */ new WeakMap();
function zr(e, t) {
	let n = Rr.get(e);
	return n ? (Rr.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/blocks/branches.js
var Br = class {
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
		var n = L, r = dn();
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
		} else N && (this.anchor = P), this.#a(n);
	}
};
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/blocks/if.js
function X(e, t, n = !1) {
	var r;
	N && (r = P, Oe());
	var i = new Br(e), a = n ? S : 0;
	function o(e, t) {
		if (N) {
			var n = je(r);
			if (e !== parseInt(n.substring(1))) {
				var a = Ae();
				De(a), i.anchor = a, Ee(!1), i.ensure(e, t), Ee(!0);
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
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/blocks/key.js
var Vr = Symbol("NaN");
function Hr(e, t, n) {
	N && Oe();
	var r = new Br(e), i = !He();
	Tn(() => {
		var e = t();
		e !== e && (e = Vr), i && typeof e == "object" && e && (e = {}), r.ensure(e, n);
	});
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/blocks/each.js
function Ur(e, t) {
	return t;
}
function Wr(e, t, n) {
	for (var i = [], a = t.length, o, s = t.length, c = 0; c < a; c++) {
		let n = t[c];
		Nn(n, () => {
			if (o) {
				if (o.pending.delete(n), o.done.add(n), o.pending.size === 0) {
					var t = e.outrogroups;
					Gr(e, r(o.done)), t.delete(o), t.size === 0 && (e.outrogroups = null);
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
		Gr(e, t, !l);
	} else o = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(o);
}
function Gr(e, t, n = !0) {
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
var Kr;
function Z(t, n, i, a, o, s = null) {
	var c = t, l = /* @__PURE__ */ new Map();
	if (n & 4) {
		var u = t;
		c = N ? De(/* @__PURE__ */ cn(u)) : u.appendChild(sn());
	}
	N && Oe();
	var d = null, f = /* @__PURE__ */ vt(() => {
		var t = i();
		return e(t) ? t : t == null ? [] : r(t);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, Jr(v, p, c, n, a), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= T, Xr(d, null, c)) : Fn(d) : Nn(d, () => {
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
			N && je(c) === "[!" != (e === 0) && (c = Ae(), De(c), Ee(!1), t = !0);
			for (var r = /* @__PURE__ */ new Set(), u = L, v = dn(), y = 0; y < e; y += 1) {
				N && P.nodeType === 8 && P.data === "]" && (c = P, t = !0, Ee(!1));
				var b = p[y], x = a(b, y), S = h ? null : l.get(x);
				S ? (S.v && qt(S.v, b), S.i && qt(S.i, y), v && u.unskip_effect(S.e)) : (S = Yr(l, h ? c : Kr ??= sn(), b, x, y, o, n, i), h || (S.e.f |= T), l.set(x, S)), r.add(x);
			}
			if (e === 0 && s && !d && (h ? d = En(() => s(c)) : (d = En(() => s(Kr ??= sn())), d.f |= T)), e > r.size && le("", "", ""), N && e > 0 && De(Ae()), !h) {
				if (m.set(u, r), v) {
					for (let [e, t] of l) r.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			t && Ee(!0), W(f);
		}),
		flags: n,
		items: l,
		pending: m,
		outrogroups: null,
		fallback: d
	};
	h = !1, N && (c = P);
}
function qr(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function Jr(e, t, n, i, a) {
	var o = !!(i & 8), s = t.length, c = e.items, l = qr(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (o) for (v = 0; v < s; v += 1) h = t[v], g = a(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = a(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (Fn(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= T, _ === l) Xr(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), Zr(e, d, _), Zr(e, _, y), Xr(_, y, n), d = _, p = [], m = [], l = qr(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], C = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) Xr(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					Zr(e, S.prev, C.next), Zr(e, d, S), Zr(e, C, b), l = b, d = C, --v, p = [], m = [];
				} else u.delete(_), Xr(_, l, n), Zr(e, _.prev, _.next), Zr(e, _, d === null ? e.effect.first : d.next), Zr(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = qr(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = qr(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (Gr(e, r(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var w = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || w.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && w.push(l), l = qr(l.next);
		var E = w.length;
		if (E > 0) {
			var D = i & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < E; v += 1) w[v].nodes?.a?.measure();
				for (v = 0; v < E; v += 1) w[v].nodes?.a?.fix();
			}
			Wr(e, w, D);
		}
	}
	o && Ge(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Yr(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? Gt(n) : /* @__PURE__ */ Kt(n, !1, !1) : null, l = o & 2 ? Gt(i) : null;
	return {
		v: c,
		i: l,
		e: En(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function Xr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ ln(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function Zr(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/elements/actions.js
function Qr(e, t, n) {
	Sn(() => {
		var r = pr(() => t(e, n?.()) || {});
		if (n && r?.update) {
			var i = !1, a = {};
			wn(() => {
				var e = n();
				mr(e), i && Ne(a, e) && (a = e, r.update(e));
			}), i = !0;
		}
		if (r?.destroy) return () => r.destroy();
	});
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/clsx/dist/clsx.mjs
function $r(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") {
		if (Array.isArray(e)) {
			var i = e.length;
			for (t = 0; t < i; t++) e[t] && (n = $r(e[t])) && (r && (r += " "), r += n);
		} else for (n in e) e[n] && (r && (r += " "), r += n);
	}
	return r;
}
function ei() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = $r(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/shared/attributes.js
function ti(e) {
	return typeof e == "object" ? ei(e) : e ?? "";
}
var ni = [..." 	\n\r\f\xA0\v﻿"];
function ri(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || ni.includes(r[o - 1])) && (s === r.length || ni.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function ii(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function ai(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function oi(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\/\*.*?\*\//g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(ai)), i && c.push(...Object.keys(i).map(ai));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = ai(e.substring(l, u).trim());
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
		return r && (n += ii(r)), i && (n += ii(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/elements/class.js
function si(e, t, n, r, i, a) {
	var o = e[M];
	if (N || o !== n || o === void 0) {
		var s = ri(n, r, a);
		(!N || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[M] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/elements/style.js
function ci(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function li(e, t, n, r) {
	var i = e[ne];
	if (N || i !== t) {
		var a = oi(t, r);
		(!N || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[ne] = t;
	} else r && (Array.isArray(r) ? (ci(e, n?.[0], r[0]), ci(e, n?.[1], r[1], "important")) : ci(e, n, r));
	return r;
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function ui(t, n, r = !1) {
	if (t.multiple) {
		if (n == null) return;
		if (!e(n)) return we();
		for (var i of t.options) i.selected = n.includes(pi(i));
	} else {
		for (i of t.options) if ($t(pi(i), n)) {
			i.selected = !0;
			return;
		}
		(!r || n !== void 0) && (t.selectedIndex = -1);
	}
}
function di(e) {
	var t = new MutationObserver(() => {
		"__value" in e && ui(e, e.__value);
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
function fi(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet(), i = !0;
	ot(e, "change", (t) => {
		var i = t ? "[selected]" : ":checked", a;
		if (e.multiple) a = [].map.call(e.querySelectorAll(i), pi);
		else {
			var o = e.querySelector(i) ?? e.querySelector("option:not([disabled])");
			a = o && pi(o);
		}
		n(a), e.__value = a, L !== null && r.add(L);
	}), Sn(() => {
		var a = t();
		if (e === document.activeElement) {
			var o = L;
			if (r.has(o)) return;
		}
		if (ui(e, a, i), i && a === void 0) {
			var s = e.querySelector(":checked");
			s !== null && (a = pi(s), n(a));
		}
		e.__value = a, i = !1;
	}), di(e);
}
function pi(e) {
	return "__value" in e ? e.__value : e.value;
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/elements/attributes.js
var mi = Symbol("is custom element"), hi = Symbol("is html"), gi = oe ? "link" : "LINK", _i = oe ? "progress" : "PROGRESS";
function Q(e) {
	if (N) {
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
		e[ie] = n, Ge(n), it();
	}
}
function vi(e, t) {
	var n = bi(e);
	n.value !== (n.value = t ?? void 0) && (e.value !== t || t === 0 && e.nodeName === _i) && (e.value = t ?? "");
}
function yi(e, t) {
	var n = bi(e);
	n.checked !== (n.checked = t ?? void 0) && (e.checked = t);
}
function $(e, t, n, r) {
	var i = bi(e);
	N && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === gi) || i[t] !== (i[t] = n) && (t === "loading" && (e[j] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Si(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function bi(e) {
	return e[te] ??= {
		[mi]: e.nodeName.includes("-"),
		[hi]: e.namespaceURI === xe
	};
}
var xi = /* @__PURE__ */ new Map();
function Si(e) {
	var t = e.getAttribute("is") || e.nodeName, n = xi.get(t);
	if (n) return n;
	xi.set(t, n = []);
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var s in r = o(i), r) r[s].set && s !== "innerHTML" && s !== "textContent" && s !== "innerText" && n.push(s);
		i = l(i);
	}
	return n;
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function Ci(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet();
	ot(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = wi(e) ? Ti(a) : a, n(a), L !== null && r.add(L), await ur(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (N && e.defaultValue !== e.value || pr(t) == null && e.value) && (n(wi(e) ? Ti(e.value) : e.value), L !== null && r.add(L)), wn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = L;
			if (r.has(i)) return;
		}
		wi(e) && n === Ti(e.value) || (e.type !== "date" || n || e.value) && n !== e.value && (e.value = n ?? "");
	});
}
function wi(e) {
	var t = e.type;
	return t === "number" || t === "range";
}
function Ti(e) {
	return e === "" ? null : +e;
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function Ei(e, t) {
	return e === t || e?.[A] === t;
}
function Di(e = {}, t, n, r) {
	var i = Re.r, a = Gn;
	return Sn(() => {
		var o, s;
		return wn(() => {
			o = s, s = r?.() || [], pr(() => {
				Ei(n(...s), e) || (t(e, ...s), o && Ei(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && Ei(n(...s), e) && t(null, ...s);
			}, c = r.teardown;
			r.teardown = () => {
				o(), c?.();
			};
		};
	}), e;
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/reactivity/props.js
function Oi(e, t, n, r) {
	var i = !0, o = !!(n & 8), s = !!(n & 16), c = r, l = !0, u = void 0, d = () => s && i ? (u ??= /* @__PURE__ */ ht(r), W(u)) : (l && (l = !1, c = s ? pr(r) : r), c);
	let f;
	if (o) {
		var p = A in e || ee in e;
		f = a(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	o ? [m, h] = tt(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && me(t), f(m)));
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
	var v = !1, y = (n & 1 ? ht : vt)(() => (v = !1, g()));
	o && W(y);
	var b = Gn;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? W(y) : i && o ? Zt(e) : e;
			return z(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return Bn && v || b.f & 16384 ? y.v : W(y);
	});
}
function ki(e) {
	Re === null && se("onMount"), yn(() => {
		let t = pr(e);
		if (typeof t == "function") return t;
	});
}
function Ai(e) {
	Re === null && se("onDestroy"), ki(() => () => pr(e));
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region ui/NodeCard.svelte
var ji = /* @__PURE__ */ q("<span class=\"pc-modifier-badge svelte-1jilz27\"> </span>"), Mi = /* @__PURE__ */ q("<div><span class=\"pc-native-pin-label\"> </span> <div role=\"img\"></div></div>"), Ni = /* @__PURE__ */ q("<div class=\"pc-node-body\"> </div>"), Pi = /* @__PURE__ */ q("<span class=\"pc-native-alias\"> </span>"), Fi = /* @__PURE__ */ q("<div class=\"pc-recall-status-space\" aria-hidden=\"true\"></div>"), Ii = /* @__PURE__ */ jr("<path class=\"pc-recall-marker\" d=\"M17 18h5M19.5 15.5v5\"></path>"), Li = /* @__PURE__ */ jr("<path class=\"pc-recall-marker\" d=\"m16 18 3 3 4-6\"></path>"), Ri = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-node-recall-status\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M7 5a8 8 0 1 1-3 6M3 4v6h6M12 7v5l3 2\"></path><!></svg></button>"), zi = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-node-action pc-host-result\" aria-label=\"Preview host result\"><i class=\"fa-solid fa-eye\" aria-hidden=\"true\"></i> Host result</button>"), Bi = /* @__PURE__ */ q("<div role=\"group\" tabindex=\"0\"><div class=\"pc-native-heading\"><svg class=\"pc-native-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path></path></svg><span class=\"pc-node-title\"> </span><!></div> <div class=\"pc-native-pins\"></div> <!> <!> <!> <!> <!></div>");
function Vi(e, t) {
	Be(t, !0);
	let n = (e) => e.stopPropagation();
	var r = Bi();
	let i, a;
	var o = B(r), s = B(o), c = B(s);
	F(s);
	var l = H(s), u = B(l, !0);
	F(l);
	var d = H(l), f = (e) => {
		var n = ji(), r = B(n);
		F(n), U(() => {
			$(n, "title", t.card.modifierSummary.text), $(n, "aria-label", t.card.modifierSummary.text), Y(r, `+${t.card.modifierSummary.count ?? ""}`);
		}), J(e, n);
	};
	X(d, (e) => {
		t.card.modifierSummary && e(f);
	}), F(o);
	var p = H(o, 2);
	Z(p, 21, () => t.card.ports, (e) => e.id, (e, n) => {
		var r = Mi();
		let i;
		var a = B(r), o = B(a, !0);
		F(a);
		var s = H(a, 2);
		F(r), U(() => {
			si(r, 1, `pc-native-row pc-native-row-${W(n).dir}`, "svelte-1jilz27"), i = li(r, "", i, { "grid-row": W(n).row }), Y(o, W(n).label), si(s, 1, ti(W(n).className), "svelte-1jilz27"), $(s, "data-node", t.card.id), $(s, "data-dir", W(n).dir), $(s, "data-port", W(n).port), $(s, "data-side", W(n).side), $(s, "data-kind", W(n).kind), $(s, "title", W(n).title), $(s, "aria-label", W(n).title);
		}), G("mouseenter", s, () => t.actions.hoverPin({
			nodeId: t.card.id,
			dir: W(n).dir,
			port: W(n).port
		})), G("mouseleave", s, () => t.actions.hoverPin(null)), J(e, r);
	}), F(p);
	var m = H(p, 2), h = (e) => {
		var n = Ni(), r = B(n, !0);
		F(n), U(() => Y(r, t.card.body)), J(e, n);
	};
	X(m, (e) => {
		t.card.type === "note" && e(h);
	});
	var g = H(m, 2), _ = (e) => {
		var n = Pi(), r = B(n, !0);
		F(n), U(() => {
			$(n, "title", t.card.titleHint), Y(r, t.card.title);
		}), J(e, n);
	};
	X(g, (e) => {
		t.card.compact && e(_);
	});
	var v = H(g, 2), y = (e) => {
		J(e, Fi());
	};
	X(v, (e) => {
		(t.card.label === "Recall" || t.card.label === "Recall Shortcut") && e(y);
	});
	var b = H(v, 2), x = (e) => {
		var r = Ri(), i = B(r), a = H(B(i)), o = (e) => {
			J(e, Ii());
		}, s = (e) => {
			J(e, Li());
		};
		X(a, (e) => {
			t.card.recall.state === "generation" ? e(o) : t.card.recall.state === "acceptance" && e(s, 1);
		}), F(i), F(r), U(() => {
			$(r, "data-recall-state", t.card.recall.state), $(r, "title", t.card.recall.tooltip), $(r, "aria-label", t.card.recall.ariaLabel);
		}), K("pointerdown", r, n), K("mousedown", r, n), K("contextmenu", r, n), K("keydown", r, n), K("click", r, (e) => {
			n(e), t.actions.openRecallDetails?.(t.card.id);
		}), J(e, r);
	};
	X(b, (e) => {
		t.card.recall && e(x);
	});
	var S = H(b, 2), C = (e) => {
		var r = zi();
		K("mousedown", r, n), K("click", r, (e) => {
			n(e), t.actions.hostResult(t.card.id);
		}), J(e, r);
	};
	X(S, (e) => {
		t.card.hostResult && e(C);
	}), F(r), U(() => {
		i = si(r, 1, ti(t.card.className), "svelte-1jilz27", i, { "pc-recall-capable": t.card.label === "Recall" || t.card.label === "Recall Shortcut" }), $(r, "data-id", t.card.id), $(r, "title", t.card.offHint), $(r, "aria-label", `${t.card.label}: ${t.card.title}`), a = li(r, "", a, {
			left: `${t.card.x}px`,
			top: `${t.card.y}px`
		}), $(c, "d", t.card.iconPath), $(l, "title", t.card.titleHint), Y(u, t.card.title);
	}), J(e, r), Ve();
}
Sr([
	"pointerdown",
	"mousedown",
	"contextmenu",
	"keydown",
	"click"
]);
//#endregion
//#region ui/GroupCard.svelte
var Hi = /* @__PURE__ */ q("<div class=\"pc-node-body\"> </div>"), Ui = /* @__PURE__ */ q("<div role=\"group\"><div><i class=\"fa-solid fa-object-group\" aria-hidden=\"true\"></i> <span> </span> <span class=\"pc-group-frame-count\"> </span> <button type=\"button\"></button></div> <!></div>");
function Wi(e, t) {
	Be(t, !0);
	function n(e, n) {
		e.stopPropagation(), e.preventDefault(), t.actions.group(t.group.id, n);
	}
	function r(e, n) {
		e.stopPropagation(), e.detail === 0 && t.actions.group(t.group.id, n);
	}
	var i = Ui();
	let a;
	var o = B(i), s = H(B(o), 2), c = B(s, !0);
	F(s);
	var l = H(s, 2), u = B(l, !0);
	F(l);
	var d = H(l, 2);
	F(o);
	var f = H(o, 2), p = (e) => {
		var n = Hi(), r = B(n, !0);
		F(n), U(() => Y(r, t.group.body)), J(e, n);
	};
	X(f, (e) => {
		t.group.collapsed && e(p);
	}), F(i), U(() => {
		si(i, 1, ti(t.group.className)), $(i, "data-group", t.group.id), $(i, "aria-label", `Group: ${t.group.title}`), a = li(i, "", a, {
			left: `${t.group.x}px`,
			top: `${t.group.y}px`,
			width: `${t.group.w}px`,
			height: t.group.collapsed ? void 0 : `${t.group.h}px`
		}), si(o, 1, ti(t.group.collapsed ? "pc-node-head" : "pc-group-frame-head")), si(s, 1, ti(t.group.collapsed ? "pc-node-title" : "pc-group-frame-title")), Y(c, t.group.title), Y(u, t.group.count), si(d, 1, `pc-node-action fa-solid pc-group-btn ${t.group.collapsed ? "fa-up-right-and-down-left-from-center" : "fa-down-left-and-up-right-to-center"}`), $(d, "data-action", t.group.collapsed ? "open" : "collapse"), $(d, "title", t.group.collapsed ? "Open group" : "Fold group"), $(d, "aria-label", t.group.collapsed ? "Open group" : "Fold group");
	}), K("mousedown", d, (e) => n(e, t.group.collapsed ? "open" : "collapse")), K("click", d, (e) => r(e, t.group.collapsed ? "open" : "collapse")), J(e, i), Ve();
}
Sr(["mousedown", "click"]);
//#endregion
//#region ui/WireLayer.svelte
var Gi = /* @__PURE__ */ jr("<path class=\"pc-wire-hit\"></path><path><title> </title></path><text text-anchor=\"middle\"> </text>", 1), Ki = /* @__PURE__ */ jr("<path></path>"), qi = /* @__PURE__ */ jr("<!><!>", 1);
function Ji(e, t) {
	Be(t, !0);
	var n = qi(), r = V(n);
	Z(r, 17, () => t.wires, (e) => e.id, (e, t) => {
		var n = Gi(), r = V(n), i = H(r), a = B(i), o = B(a);
		F(a), F(i);
		var s = H(i), c = B(s, !0);
		F(s), U(() => {
			$(r, "d", W(t).d), $(r, "data-id", W(t).id), $(i, "d", W(t).d), si(i, 0, ti(W(t).className)), $(i, "data-id", W(t).id), $(i, "data-kind", W(t).kind), Y(o, `${W(t).kind ?? ""} artifact`), $(s, "x", W(t).label.x), $(s, "y", W(t).label.y), si(s, 0, ti(W(t).label.className)), Y(c, W(t).label.text);
		}), J(e, n);
	});
	var i = H(r), a = (e) => {
		var n = Ki();
		U(() => {
			$(n, "d", t.ghost.d), si(n, 0, ti(t.ghost.className));
		}), J(e, n);
	};
	X(i, (e) => {
		t.ghost && e(a);
	}), J(e, n), Ve();
}
//#endregion
//#region ui/CommentFrame.svelte
var Yi = /* @__PURE__ */ q("<span class=\"pc-comment-title svelte-118xm2r\"> </span>"), Xi = /* @__PURE__ */ q("<input class=\"pc-comment-title-input svelte-118xm2r\" aria-label=\"Comment title\"/>"), Zi = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-comment-resize svelte-118xm2r\" title=\"Drag to resize comment\"></button>"), Qi = /* @__PURE__ */ q("<div role=\"group\"><header class=\"pc-comment-header svelte-118xm2r\"><button type=\"button\" class=\"pc-comment-select svelte-118xm2r\" title=\"Drag header to move comment\">⋮⋮</button> <!></header> <div class=\"pc-comment-notes svelte-118xm2r\"> </div> <!></div>");
function $i(e, t) {
	Be(t, !0);
	let n = (e) => e.stopPropagation();
	var r = Qi();
	let i, a;
	var o = B(r), s = B(o), c = H(s, 2), l = (e) => {
		var n = Yi(), r = B(n, !0);
		F(n), U(() => Y(r, t.comment.title)), J(e, n);
	}, u = (e) => {
		var r = Xi();
		Q(r), U(() => vi(r, t.comment.title)), G("focus", r, () => t.actions.select(t.comment.id)), G("pointerdown", r, n, !0), G("mousedown", r, n, !0), G("click", r, n, !0), G("keydown", r, n, !0), K("change", r, (e) => {
			t.comment.readOnly || t.actions.update(t.comment.id, { title: e.currentTarget.value });
		}), J(e, r);
	};
	X(c, (e) => {
		t.comment.readOnly ? e(l) : e(u, -1);
	}), F(o);
	var d = H(o, 2), f = B(d, !0);
	F(d);
	var p = H(d, 2), m = (e) => {
		var n = Zi();
		U(() => $(n, "aria-label", `Resize comment: ${t.comment.title}`)), K("click", n, (e) => {
			e.detail === 0 && t.actions.select(t.comment.id);
		}), J(e, n);
	};
	X(p, (e) => {
		t.comment.readOnly || e(m);
	}), F(r), U(() => {
		i = si(r, 1, "pc-comment-frame svelte-118xm2r", null, i, {
			"pc-comment-selected": t.comment.selected,
			"pc-comment-readonly": t.comment.readOnly
		}), $(r, "data-id", t.comment.id), $(r, "aria-label", `Comment: ${t.comment.title}`), a = li(r, "", a, {
			left: `${t.comment.x}px`,
			top: `${t.comment.y}px`,
			width: `${t.comment.w}px`,
			height: `${t.comment.h}px`,
			"--frame-color": t.comment.color
		}), $(s, "aria-label", `Select comment: ${t.comment.title}`), Y(f, t.comment.content);
	}), K("click", s, (e) => {
		e.detail === 0 && t.actions.select(t.comment.id);
	}), J(e, r), Ve();
}
Sr(["click", "change"]);
//#endregion
//#region ui/NodeProfilePicker.svelte
var ea = /* @__PURE__ */ q("<div class=\"node-model-meta svelte-jdmiua\"> </div>"), ta = /* @__PURE__ */ jr("<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-jdmiua\"><path d=\"m5 12 4 4L19 6\" class=\"svelte-jdmiua\"></path></svg>"), na = /* @__PURE__ */ q("<button type=\"button\" role=\"option\"><span class=\"profile-option-copy svelte-jdmiua\"><span class=\"profile-name svelte-jdmiua\"> </span><span class=\"profile-meta svelte-jdmiua\"> </span></span><span class=\"profile-check svelte-jdmiua\"><!></span></button>"), ra = /* @__PURE__ */ q("<div class=\"profile-error svelte-jdmiua\" role=\"alert\"> </div>"), ia = /* @__PURE__ */ q("<div class=\"profile-menu svelte-jdmiua\"><div class=\"profile-search svelte-jdmiua\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-jdmiua\"><circle cx=\"10\" cy=\"10\" r=\"6\" class=\"svelte-jdmiua\"></circle><path d=\"m15 15 5 5\" class=\"svelte-jdmiua\"></path></svg><input role=\"combobox\" aria-label=\"Search connection profiles\" aria-autocomplete=\"list\" aria-expanded=\"true\" placeholder=\"Search connection profiles…\" autocomplete=\"off\" spellcheck=\"false\" maxlength=\"200\" class=\"svelte-jdmiua\"/></div> <div class=\"profile-options svelte-jdmiua\" role=\"listbox\" aria-label=\"Connection profiles\"></div> <!></div>"), aa = /* @__PURE__ */ q("<div class=\"pc-node-profile svelte-jdmiua\" role=\"group\" aria-label=\"Node connection profile\"><!> <div class=\"profile-picker svelte-jdmiua\"><button type=\"button\" class=\"profile-bar svelte-jdmiua\" aria-haspopup=\"listbox\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-jdmiua\"><path d=\"M12 22v-5M15 8V2M17 8a1 1 0 0 1 1 1v4a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1zM9 8V2\" class=\"svelte-jdmiua\"></path></svg><span class=\"profile-value svelte-jdmiua\"> </span><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-jdmiua\"><path d=\"m6 9 6 6 6-6\" class=\"svelte-jdmiua\"></path></svg></button> <!></div></div>");
function oa(e, t) {
	Be(t, !0);
	let n = /* @__PURE__ */ R(!1), r = /* @__PURE__ */ R(""), i = /* @__PURE__ */ R(0), a = /* @__PURE__ */ R(""), o = /* @__PURE__ */ R(!1), s = -1, c = 0, l = !1, u = /* @__PURE__ */ R(35), d, f, p = /* @__PURE__ */ R(void 0), m = /* @__PURE__ */ R(void 0), h = (e) => e.stopPropagation();
	function g(e) {
		let t = (e) => {
			te(e);
		}, n = (t) => {
			t.detail !== e && k();
		}, r = (t) => {
			l && !e.contains(t.target) && (c++, l = !1);
		}, i = [
			"keyup",
			"pointerdown",
			"mousedown",
			"mouseup",
			"mousemove",
			"dblclick",
			"contextmenu"
		];
		e.addEventListener("keydown", t), window.addEventListener("pc-node-profile-open", n), document.addEventListener("focusin", r);
		for (let t of i) e.addEventListener(t, h);
		return { destroy() {
			e.removeEventListener("keydown", t), window.removeEventListener("pc-node-profile-open", n), document.removeEventListener("focusin", r);
			for (let t of i) e.removeEventListener(t, h);
		} };
	}
	let _ = /* @__PURE__ */ I(() => W(r).toLocaleLowerCase().trim().split(/\s+/).filter(Boolean)), v = /* @__PURE__ */ I(() => [...t.row.options.filter((e) => e.active), ...t.row.options.filter((e) => !e.active && W(_).every((t) => `${e.label} ${e.apiLabel} ${e.model}`.toLocaleLowerCase().includes(t)))]), y = /* @__PURE__ */ I(() => Math.max(1, Math.min(330, t.row.visibleBounds.w - 16))), b = /* @__PURE__ */ I(() => Math.max(t.row.visibleBounds.x + 8, Math.min(t.row.x, t.row.visibleBounds.x + t.row.visibleBounds.w - W(y) - 8)) - t.row.x), x = /* @__PURE__ */ I(() => t.row.h + t.row.clearance + 7), S = /* @__PURE__ */ I(() => t.row.visibleBounds.y + t.row.visibleBounds.h - (t.row.y + W(x) + W(u) + 6) - 8), C = /* @__PURE__ */ I(() => t.row.y + W(x) - t.row.visibleBounds.y - 14), w = /* @__PURE__ */ I(() => W(S) < 130 && W(C) > W(S)), T = /* @__PURE__ */ I(() => Math.max(W(C), W(S)) < 78), E = /* @__PURE__ */ I(() => Math.max(0, Math.min(244, (W(T) ? t.row.visibleBounds.h - 16 : W(w) ? W(C) : W(S)) - 54))), D = /* @__PURE__ */ I(() => t.row.visibleBounds.y + 8 - t.row.y - W(x)), O = (e) => `${t.row.id}-profile-option-${e}`;
	function k(e = !1, t = !1) {
		t || (c++, l = !1), z(n, !1), z(r, ""), z(a, ""), z(o, !1), e && f?.focus({ preventScroll: !0 });
	}
	async function A() {
		if (!t.row.editable) return;
		let e = t.row.selection.selectionKey;
		if (await t.refreshProfiles?.(t.row.selection), !t.row.editable || !d?.isConnected || t.row.selection.selectionKey !== e) return;
		let c = f.getBoundingClientRect(), l = c.width > 0 && t.row.w > 0 ? c.width / t.row.w : 1;
		z(u, c.height > 0 ? c.height / l : 35, !0), window.dispatchEvent(new CustomEvent("pc-node-profile-open", { detail: d })), s = t.row.authorityVersion, z(r, ""), z(a, ""), z(o, !1), z(i, Math.max(0, W(v).findIndex((e) => e.value === t.row.value)), !0), z(n, !0), await ur(), W(n) && (W(p)?.focus({ preventScroll: !0 }), W(m) && (W(m).scrollTop = 0));
	}
	function ee() {
		let e = W(v).find((e) => e.active);
		z(i, !W(_).length || e && W(_).every((t) => e.label.toLocaleLowerCase().includes(t)) ? 0 : W(v).length > 1 ? 1 : -1, !0), W(m) && (W(m).scrollTop = 0);
	}
	async function j(e) {
		if (!W(n) || !t.row.editable || W(o) || t.row.authorityVersion !== s || !t.editProfile) return;
		let r = s, i = t.row.selection, u = c;
		z(o, !0), z(a, ""), l = !0;
		try {
			let o = await t.editProfile(i, e.value);
			if (o.ok) {
				c === u && d?.isConnected && t.row.selection.selectionKey === i.selectionKey && JSON.stringify(t.row.selection.address) === JSON.stringify(i.address) && (!W(n) || s === r) && k(!0);
				return;
			}
			if (!W(n) || t.row.authorityVersion !== r) return;
			z(a, o.error.message, !0);
		} catch (e) {
			W(n) && t.row.authorityVersion === r && z(a, e instanceof Error ? e.message : "Could not change connection profile", !0);
		} finally {
			t.row.authorityVersion === r && z(o, !1), c === u && (l = !1);
		}
	}
	async function te(e) {
		h(e), W(n) ? e.key === "Escape" ? (e.preventDefault(), k(!0)) : e.key === "ArrowDown" || e.key === "ArrowUp" ? (e.preventDefault(), z(i, Math.max(0, Math.min(W(v).length - 1, W(i) + (e.key === "ArrowDown" ? 1 : -1))), !0), await ur(), W(m)?.querySelector(".is-active")?.scrollIntoView?.({ block: "nearest" }), W(p)?.focus({ preventScroll: !0 })) : e.key === "Enter" && e.target === W(p) && (e.preventDefault(), W(v)[W(i)] && await j(W(v)[W(i)])) : [
			"ArrowDown",
			"ArrowUp",
			"Enter",
			" "
		].includes(e.key) && (e.preventDefault(), await A());
	}
	function M(e) {
		e.preventDefault(), h(e), W(m) && (W(m).scrollTop += e.deltaY * (e.deltaMode === 1 ? 18 : e.deltaMode === 2 ? W(m).clientHeight : 1));
	}
	yn(() => {
		W(n) && (t.row.authorityVersion !== s || !t.row.editable) && k(!1, !0);
	});
	var ne = aa();
	G("pointerdown", tn, (e) => {
		(W(n) || l) && !d.contains(e.target) && k();
	});
	let re;
	var ie = B(ne), ae = (e) => {
		var n = ea(), r = B(n, !0);
		F(n), U(() => {
			$(n, "title", t.row.model), Y(r, t.row.model);
		}), J(e, n);
	};
	X(ie, (e) => {
		t.row.model && e(ae);
	});
	var oe = H(ie, 2);
	let se;
	var ce = B(oe), le = H(B(ce)), ue = B(le, !0);
	F(le), ke(), F(ce), Di(ce, (e) => f = e, () => f);
	var de = H(ce, 2), fe = (e) => {
		var n = ia();
		let s;
		var c = B(n), l = H(B(c));
		Q(l), Di(l, (e) => z(p, e), () => W(p)), F(c);
		var d = H(c, 2);
		let f;
		Z(d, 23, () => W(v), (e) => e.value, (e, n, r) => {
			var a = na();
			let s;
			var c = B(a), l = B(c), u = B(l, !0);
			F(l);
			var d = H(l), f = B(d, !0);
			F(d), F(c);
			var p = H(c), m = B(p), h = (e) => {
				J(e, ta());
			};
			X(m, (e) => {
				W(n).value === t.row.value && e(h);
			}), F(p), F(a), U((e, c) => {
				$(a, "id", e), s = si(a, 1, "profile-option svelte-jdmiua", null, s, { "is-active": W(r) === W(i) }), $(a, "aria-selected", W(n).value === t.row.value), a.disabled = W(o), $(l, "title", W(n).label), Y(u, W(n).label), Y(f, c);
			}, [() => O(W(r)), () => W(n).active ? "Follows SillyTavern’s current model" : [W(n).apiLabel, W(n).model].filter(Boolean).join(" · ")]), K("click", a, () => j(W(n))), J(e, a);
		}), F(d), Di(d, (e) => z(m, e), () => W(m));
		var h = H(d, 2), g = (e) => {
			var t = ra(), n = B(t, !0);
			F(t), U(() => Y(n, W(a))), J(e, t);
		};
		X(h, (e) => {
			W(a) && e(g);
		}), F(n), U((e) => {
			s = li(n, "", s, {
				width: `${W(y)}px`,
				left: `${W(b)}px`,
				top: W(T) ? `${W(D)}px` : W(w) ? "auto" : `${W(u) + 6}px`,
				bottom: !W(T) && W(w) ? `${W(u) + 6}px` : "auto"
			}), $(l, "aria-controls", `${t.row.id}-profile-list`), $(l, "aria-activedescendant", e), $(d, "id", `${t.row.id}-profile-list`), f = li(d, "", f, { "max-height": `${W(E)}px` });
		}, [() => W(i) >= 0 && W(v).length ? O(W(i)) : void 0]), K("input", l, ee), Ci(l, () => W(r), (e) => z(r, e)), G("wheel", d, M), J(e, n);
	};
	X(de, (e) => {
		W(n) && e(fe);
	}), F(oe), F(ne), Di(ne, (e) => d = e, () => d), Qr(ne, (e) => g?.(e)), U(() => {
		$(ne, "data-id", t.row.id), re = li(ne, "", re, {
			left: `${t.row.x}px`,
			top: `${t.row.y}px`,
			width: `${t.row.w}px`,
			"z-index": W(n) ? 20 : 2
		}), se = li(oe, "", se, { top: `${W(x)}px` }), $(ce, "title", t.row.label), $(ce, "aria-label", `Connection profile: ${t.row.label}`), $(ce, "aria-expanded", W(n)), ce.disabled = !t.row.editable, Y(ue, t.row.label);
	}), G("wheel", ne, h), K("click", ce, () => W(n) ? k() : A()), J(e, ne), Ve();
}
Sr(["click", "input"]);
//#endregion
//#region ui/CanvasLayer.svelte
var sa = /* @__PURE__ */ q("<div class=\"pc-viewport\" data-pc-renderer=\"svelte\"><div class=\"pc-comment-layer svelte-o7b704\"></div> <svg class=\"pc-wires\" aria-label=\"Canvas connections\"><!></svg> <div class=\"pc-nodes\"><!> <!> <!></div> <div class=\"pc-node-profile-layer svelte-o7b704\"></div></div>");
function ca(e, t) {
	Be(t, !0);
	let n = /* @__PURE__ */ R([]), r = /* @__PURE__ */ R([]), i = /* @__PURE__ */ R([]), a = /* @__PURE__ */ R({}), o = /* @__PURE__ */ R([]), s = /* @__PURE__ */ R([]), c = /* @__PURE__ */ R({
		select() {},
		update() {},
		command() {}
	}), l = /* @__PURE__ */ R(null), u = /* @__PURE__ */ R({
		w: 4e3,
		h: 4e3
	}), d, f, p, m;
	function h() {
		return {
			viewport: d,
			svg: f,
			nodeLayer: p,
			commentLayer: m
		};
	}
	function g(e, t) {
		z(o, e), z(c, t);
	}
	function _(e) {
		z(a, e);
	}
	function v(e) {
		z(n, e);
	}
	function y(e) {
		z(s, e);
	}
	function b(e) {
		z(r, e);
	}
	function x(e, t, n) {
		z(i, e), z(u, t), z(l, n);
	}
	function S(e, t) {
		let i = new Map(e.map((e) => [e.id, e])), a = new Map(t.map((e) => [e.id, e]));
		z(n, W(n).map((e) => i.has(e.id) ? {
			...e,
			...i.get(e.id)
		} : e)), z(o, W(o).map((e) => i.has(e.id) ? {
			...e,
			...i.get(e.id)
		} : e)), z(r, W(r).map((e) => a.has(e.id) ? {
			...e,
			...a.get(e.id)
		} : e));
	}
	var C = {
		getLayers: h,
		setComments: g,
		setRecallStatus: _,
		setNodes: v,
		setNodeProfiles: y,
		setGroups: b,
		setWires: x,
		setPositions: S
	}, w = sa(), T = B(w);
	Z(T, 21, () => W(o), (e) => e.id, (e, t) => {
		$i(e, {
			get comment() {
				return W(t);
			},
			get actions() {
				return W(c);
			}
		});
	}), F(T), Di(T, (e) => m = e, () => m);
	var E = H(T, 2);
	Ji(B(E), {
		get wires() {
			return W(i);
		},
		get ghost() {
			return W(l);
		}
	}), F(E), Di(E, (e) => f = e, () => f);
	var D = H(E, 2), O = B(D);
	Z(O, 17, () => W(r).filter((e) => !e.collapsed), (e) => e.id, (e, n) => {
		Wi(e, {
			get group() {
				return W(n);
			},
			get actions() {
				return t.actions;
			}
		});
	});
	var k = H(O, 2);
	Z(k, 17, () => W(n), (e) => e.id, (e, n) => {
		{
			let r = /* @__PURE__ */ I(() => ({
				...W(n),
				recall: W(a)[W(n).id]
			}));
			Vi(e, {
				get card() {
					return W(r);
				},
				get actions() {
					return t.actions;
				}
			});
		}
	}), Z(H(k, 2), 17, () => W(r).filter((e) => e.collapsed), (e) => e.id, (e, n) => {
		Wi(e, {
			get group() {
				return W(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), F(D), Di(D, (e) => p = e, () => p);
	var A = H(D, 2);
	return Z(A, 21, () => W(s), (e) => e.id, (e, n) => {
		oa(e, {
			get row() {
				return W(n);
			},
			get editProfile() {
				return t.actions.editProfile;
			},
			get refreshProfiles() {
				return t.actions.refreshProfiles;
			}
		});
	}), F(A), F(w), Di(w, (e) => d = e, () => d), U(() => {
		$(E, "width", W(u).w), $(E, "height", W(u).h), $(E, "viewBox", `0 0 ${W(u).w} ${W(u).h}`);
	}), J(e, w), Ve(C);
}
//#endregion
//#region ui/WorkspaceMenus.svelte
var la = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-flat-menu\" aria-haspopup=\"menu\"> </button>"), ua = /* @__PURE__ */ q("<button type=\"button\" role=\"menuitem\"><span> </span><small> </small></button>"), da = /* @__PURE__ */ q("<div class=\"pc-workspace-menu-panel pc-workspace-submenu\" role=\"menu\" tabindex=\"-1\"></div>"), fa = /* @__PURE__ */ q("<div class=\"pc-workspace-menu-panel\" role=\"menu\" tabindex=\"-1\"><!> <!></div>"), pa = /* @__PURE__ */ q("<nav class=\"pc-workspace-menus\" aria-label=\"Workspace menus\"><!> <!></nav>");
function ma(e, t) {
	Be(t, !0);
	let n = /* @__PURE__ */ I(() => t.state.rootWorkflow ?? t.state.workflow), r = /* @__PURE__ */ R(""), i, a = /* @__PURE__ */ R(null), o = /* @__PURE__ */ R(""), s = /* @__PURE__ */ R(null), c = {}, l = null, u = /* @__PURE__ */ R(0), d = /* @__PURE__ */ R(0), f = null, p = /* @__PURE__ */ R(0), m = /* @__PURE__ */ R(0), h = [
		"File",
		"Edit",
		"Graph",
		"Node",
		"Preview",
		"Tools",
		"Help"
	], g = /Mac|iPhone|iPad|iPod/.test(window.navigator.platform) ? "Cmd" : "Ctrl", _ = (e) => `${g} ${e}`, v = (e, t, n = "", r = !1) => ({
		label: e,
		command: t,
		shortcut: n,
		disabled: r
	});
	function y(e) {
		switch (e) {
			case "File": return [
				v("New workflow", "new", _("N"), t.state.document?.busy),
				v("Open workflow…", "open-workflow", _("O"), t.state.document?.busy),
				{
					...v("Open Recent", "", "", !t.state.document?.native || !t.state.document.recents.length || t.state.document.busy),
					submenu: "Open Recent"
				},
				v("Open examples…", "examples", "", t.state.document?.busy),
				{
					...v("Recover previous workflows", "", "", !t.state.document?.recovery.length || t.state.document.busy),
					submenu: "Recover previous workflows"
				},
				...t.state.document?.native ? [v("Save workflow", "save", _("S"), t.state.document.busy), v("Save As…", "save-as", _("Shift S"), t.state.document.busy)] : [v("Download JSON…", "download-document", _("S"), t.state.document?.busy)],
				v("Import into graph…", "import-into-graph"),
				v("Export workflow JSON…", "export"),
				v("Close workspace", "close")
			];
			case "Edit": return [
				v("Undo", "undo", _("Z"), !t.state.history.undo),
				v("Redo", "redo", _("Shift Z"), !t.state.history.redo),
				v("Copy", "copy", _("C"), !t.state.selectionActions?.copy),
				v("Cut", "cut", _("X"), !t.state.selectionActions?.cut),
				v("Paste", "paste", _("V")),
				v("Delete selection", "delete-selection", "Del", !t.state.selectionActions?.delete)
			];
			case "Graph": return [
				v("Select tool", "select-tool"),
				v("Pan tool", "pan-tool"),
				v("Zoom in", "zoom-in"),
				v("Zoom out", "zoom-out"),
				v("Fit to view", "fit"),
				v("Fit selection", "fit-selection", "", !t.state.selectionCount),
				v("Rename graph", "rename"),
				v("Run workflow", "run-workflow", "", !W(n) || !!W(n)?.busy || !!W(n)?.issues.length),
				v("Stop workflow", "stop-workflow", "", !W(n)?.busy)
			];
			case "Node": return [
				v("Add node…", "add-node"),
				v("Inspect selection", "reveal-inspector"),
				{
					...v("Memory recall", ""),
					submenu: "Memory recall"
				}
			];
			case "Preview": return [v("Show preview", "show-preview"), v("Collapse preview", "collapse-preview")];
			case "Tools": return [
				v("Workflow Data…", "story-documents"),
				v("Fast connections…", "fast-connections"),
				v("Theme and colours", "theme"),
				v("Toggle inspector", "inspector")
			];
			default: return [v("Workspace guide", "help")];
		}
	}
	function b() {
		if (W(o) === "Memory recall") {
			let e = t.state.recall?.commands.selected, n = t.state.recall?.commands.all;
			return [
				{
					...v("Queue recall for selected nodes", "recall-queue-selected", "", !e?.queueNodeIds.length),
					title: e?.queueReason
				},
				{
					...v("Cancel recall for selected nodes", "recall-cancel-selected", "", !e?.cancelNodeIds.length),
					title: e?.cancelReason
				},
				{
					...v("Queue recall for all eligible nodes", "recall-queue-all", "", !n?.queueNodeIds.length),
					title: n?.queueReason
				},
				{
					...v("Cancel all queued recall", "recall-cancel-all", "", !n?.cancelNodeIds.length),
					title: n?.cancelReason
				},
				v("Memory recall overview…", "memory-recall")
			];
		}
		return W(o) === "Recover previous workflows" ? (t.state.document?.recovery ?? []).map((e) => ({
			...v(e.name, "recover-workflow:" + e.id),
			title: e.issue,
			shortcut: e.issue
		})) : [...(t.state.document?.recents ?? []).map((e) => v(e.name, "open-recent:" + e.id)), {
			...v("Clear Recent", "clear-recent"),
			title: "Clear the recent-file list. Files stay on disk."
		}];
	}
	function x(e = !1) {
		z(o, ""), e && l?.focus({ preventScroll: !0 });
	}
	function S(e = !1) {
		z(r, ""), x(), e && f?.focus({ preventScroll: !0 });
	}
	async function C(e, t, n = !1) {
		if (W(r) === e && !n) {
			S();
			return;
		}
		if (x(), z(r, e, !0), f = t, await ur(), W(r) !== e || f !== t) return;
		let i = t.getBoundingClientRect(), o = W(a).getBoundingClientRect();
		z(p, Math.max(4, Math.min(i.left, window.innerWidth - o.width - 4)), !0), z(m, i.bottom + 2), n && W(a).querySelector("button:not(:disabled)")?.focus();
	}
	async function w(e, n, r = !1) {
		if (e === "Memory recall" && t.actions.recall?.refresh(), z(o, e, !0), l = n, await ur(), e === "Memory recall") {
			let e = t.actions.recall?.capture(t.state.recall?.commands.selected.relevantNodeIds ?? []), n = t.actions.recall?.capture(t.state.recall?.commands.all.relevantNodeIds ?? [], "all");
			c = {
				"recall-queue-selected": () => e?.queue() ?? {
					ok: !1,
					error: {
						code: "RECALL_UNAVAILABLE",
						message: "Memory recall is unavailable."
					}
				},
				"recall-cancel-selected": () => e?.cancel() ?? {
					ok: !1,
					error: {
						code: "RECALL_UNAVAILABLE",
						message: "Memory recall is unavailable."
					}
				},
				"recall-queue-all": () => n?.queue() ?? {
					ok: !1,
					error: {
						code: "RECALL_UNAVAILABLE",
						message: "Memory recall is unavailable."
					}
				},
				"recall-cancel-all": () => n?.cancel() ?? {
					ok: !1,
					error: {
						code: "RECALL_UNAVAILABLE",
						message: "Memory recall is unavailable."
					}
				}
			};
		}
		if (W(o) !== e || l !== n) return;
		let i = n.getBoundingClientRect(), a = W(s).getBoundingClientRect(), f = i.right + a.width + 6 <= window.innerWidth ? i.right + 2 : i.left - a.width - 2;
		z(u, Math.max(4, Math.min(f, window.innerWidth - a.width - 4)), !0), z(d, Math.max(4, Math.min(i.top, window.innerHeight - a.height - 4)), !0), r && W(s).querySelector("button:not(:disabled)")?.focus();
	}
	function T(e, t) {
		e.submenu ? w(e.submenu, t, !0) : E(e.command);
	}
	function E(e) {
		let n = c[e];
		if (S(!0), n) {
			let e = n();
			Promise.resolve(e).then((e) => {
				e.ok || (t.actions.recall?.reportIssue(e.error.message), t.actions.recall?.refresh());
			});
		} else [
			"examples",
			"show-preview",
			"collapse-preview",
			"add-node",
			"help",
			"fast-connections",
			"story-documents",
			"memory-recall"
		].includes(e) ? t.local(e) : e === "select-tool" || e === "pan-tool" ? t.actions.mode(e === "select-tool" ? "select" : "pan") : e === "zoom-in" || e === "zoom-out" ? t.actions.zoom(e === "zoom-in" ? 1.15 : 1 / 1.15) : t.actions.command(e);
	}
	function D(e) {
		W(r) && e.stopPropagation();
		let t = e.target, n = !!W(o) && W(s)?.contains(t);
		if (e.key === "Escape" && W(r)) e.preventDefault(), e.stopPropagation(), W(o) ? x(!0) : S(!0);
		else if (e.key === "ArrowLeft" && n) e.preventDefault(), e.stopPropagation(), x(!0);
		else if (e.key === "ArrowRight" && t.dataset.submenu) e.preventDefault(), e.stopPropagation(), w(t.dataset.submenu, t, !0);
		else if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
			if (e.preventDefault(), e.stopPropagation(), n) return;
			let a = W(r) || t.dataset.menu || h[0], o = h[(h.indexOf(a) + (e.key === "ArrowRight" ? 1 : h.length - 1)) % h.length], s = i.querySelector(`[data-menu="${o}"]`);
			W(r) ? C(o, s, !0) : s.focus();
		} else if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Home" || e.key === "End") {
			if (e.preventDefault(), e.stopPropagation(), !W(r)) {
				C(t.dataset.menu || h[0], t, !0);
				return;
			}
			let i = [...W(n ? s : a).querySelectorAll(":scope > button:not(:disabled)")], o = i.indexOf(t);
			i[e.key === "Home" ? 0 : e.key === "End" ? i.length - 1 : (o + (e.key === "ArrowUp" ? i.length - 1 : 1)) % i.length]?.focus();
		} else e.key === "Tab" && S();
	}
	var O = pa();
	G("pointerdown", en, (e) => {
		W(r) && !i.contains(e.target) && !W(a)?.contains(e.target) && S();
	}), G("resize", en, () => S());
	var k = B(O);
	Z(k, 17, () => h, Ur, (e, t) => {
		var n = la(), i = B(n, !0);
		F(n), U(() => {
			$(n, "data-menu", W(t)), $(n, "aria-expanded", W(r) === W(t)), Y(i, W(t));
		}), K("click", n, (e) => C(W(t), e.currentTarget)), K("keydown", n, D), J(e, n);
	});
	var A = H(k, 2), ee = (e) => {
		var t = fa();
		let n;
		var i = B(t);
		Z(i, 17, () => y(W(r)), Ur, (e, t) => {
			var n = ua(), r = B(n), i = B(r, !0);
			F(r);
			var a = H(r), s = B(a, !0);
			F(a), F(n), U(() => {
				$(n, "aria-label", W(t).label), n.disabled = W(t).disabled, $(n, "data-submenu", W(t).submenu), $(n, "aria-haspopup", W(t).submenu ? "menu" : void 0), $(n, "aria-expanded", W(t).submenu ? W(o) === W(t).submenu : void 0), $(n, "title", W(t).title), Y(i, W(t).label), Y(s, W(t).submenu ? "›" : W(t).shortcut);
			}), K("click", n, (e) => T(W(t), e.currentTarget)), G("pointerenter", n, (e) => {
				e.pointerType === "mouse" && (W(t).submenu && !W(t).disabled ? w(W(t).submenu, e.currentTarget) : x());
			}), J(e, n);
		});
		var c = H(i, 2), l = (e) => {
			var t = da();
			let n;
			Z(t, 21, b, Ur, (e, t) => {
				var n = ua(), r = B(n), i = B(r, !0);
				F(r);
				var a = H(r), o = B(a, !0);
				F(a), F(n), U(() => {
					$(n, "aria-label", W(t).label), n.disabled = W(t).disabled, $(n, "title", W(t).title), Y(i, W(t).label), Y(o, W(t).shortcut);
				}), K("click", n, () => E(W(t).command)), J(e, n);
			}), F(t), Di(t, (e) => z(s, e), () => W(s)), U(() => {
				$(t, "aria-label", W(o)), n = li(t, "", n, {
					left: `${W(u)}px`,
					top: `${W(d)}px`
				});
			}), J(e, t);
		};
		X(c, (e) => {
			W(o) && e(l);
		}), F(t), Di(t, (e) => z(a, e), () => W(a)), U(() => {
			$(t, "aria-label", W(r)), n = li(t, "", n, {
				left: `${W(p)}px`,
				top: `${W(m)}px`
			});
		}), K("keydown", t, D), J(e, t);
	};
	X(A, (e) => {
		W(r) && e(ee);
	}), F(O), Di(O, (e) => i = e, () => i), K("focusout", O, (e) => {
		W(r) && e.relatedTarget && !i.contains(e.relatedTarget) && S();
	}), J(e, O), Ve();
}
Sr([
	"focusout",
	"click",
	"keydown"
]);
//#endregion
//#region ui/Toolbar.svelte
var ha = /* @__PURE__ */ q("<header class=\"pc-header\" data-pc-ui=\"svelte\"><div class=\"pc-menubar\"><div class=\"pc-brand\"><img width=\"30\" height=\"30\" alt=\"\"/><span>LATTICE</span></div> <!> <button type=\"button\" class=\"pc-btn menu_button pc-close\" title=\"Close\" aria-label=\"Close canvas\">×</button></div> <div class=\"pc-workflow-bar\"><div class=\"pc-document-heading\"><strong class=\"pc-document-name\"> </strong><span class=\"pc-document-status\" role=\"status\" aria-label=\"Document status\"> <!><!></span></div> <div class=\"pc-header-actions pc-history\"><button type=\"button\" aria-label=\"Undo\">↶</button> <button type=\"button\" aria-label=\"Redo\">↷</button> <span> </span></div> <span class=\"pc-root-workflow-status\" role=\"status\" aria-label=\"Workflow status\"> </span> <div class=\"pc-header-actions pc-surface-actions\"><button type=\"button\" title=\"Show or hide the inspector\" aria-label=\"Toggle inspector\">Details</button></div> <label class=\"pc-enable\"><input class=\"pc-enable-input\" type=\"checkbox\"/><span>Enable Lattice</span></label></div></header>");
function ga(e, t) {
	Be(t, !0);
	let n = /* @__PURE__ */ I(() => t.state.rootWorkflow ?? t.state.workflow), r = /* @__PURE__ */ I(() => t.state.document?.dirty ? "Modified" : t.state.document?.busy || t.state.document?.status ? "" : t.state.document ? "Saved" : "Unsaved"), i, a, o;
	function s() {
		return {
			header: i,
			enabledControl: a,
			inspBtn: o
		};
	}
	var c = { getParts: s }, l = ha(), u = B(l), d = B(u), f = B(d);
	ke(), F(d);
	var p = H(d, 2);
	ma(p, {
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
	var m = H(p, 2);
	F(u);
	var h = H(u, 2), g = B(h), _ = B(g), v = B(_, !0);
	F(_);
	var y = H(_), b = B(y, !0), x = H(b), S = (e) => {
		var t = Mr();
		U(() => Y(t, `${W(r) ? " · " : ""}Working…`)), J(e, t);
	};
	X(x, (e) => {
		t.state.document?.busy && e(S);
	});
	var C = H(x), w = (e) => {
		var n = Mr();
		U(() => Y(n, `${W(r) || t.state.document.busy ? " · " : ""}${t.state.document.status ?? ""}`)), J(e, n);
	};
	X(C, (e) => {
		t.state.document?.status && t.state.document.status !== W(r) && e(w);
	}), F(y), F(g);
	var T = H(g, 2), E = B(T), D = H(E, 2), O = H(D, 2), k = B(O, !0);
	F(O), F(T);
	var A = H(T, 2), ee = B(A, !0);
	F(A);
	var j = H(A, 2), te = B(j);
	Di(te, (e) => o = e, () => o), F(j);
	var M = H(j, 2), ne = B(M);
	return Q(ne), Di(ne, (e) => a = e, () => a), ke(), F(M), F(h), F(l), Di(l, (e) => i = e, () => i), U(() => {
		$(f, "src", t.actions.logoUrl), $(_, "title", t.state.document?.name ?? "Untitled"), Y(v, t.state.document?.name ?? "Untitled"), Y(b, W(r)), si(E, 1, `pc-btn menu_button pc-undo${t.state.history.undo ? "" : " pc-disabled"}`), E.disabled = !t.state.history.undo, $(E, "title", t.state.history.undoTitle), si(D, 1, `pc-btn menu_button pc-redo${t.state.history.redo ? "" : " pc-disabled"}`), D.disabled = !t.state.history.redo, $(D, "title", t.state.history.redoTitle), si(O, 1, `pc-history-note${t.state.history.showNote ? " pc-show" : ""}`), Y(k, t.state.history.note), Y(ee, W(n) ? `${W(n).phase} · ≤ ${W(n).callBound} requests${W(n).status ? " · " + W(n).status : ""}` : "Workflow unavailable"), si(te, 1, `pc-btn menu_button pc-pane-toggle${t.state.inspectorOpen ? " pc-on" : ""}`), $(te, "aria-pressed", t.state.inspectorOpen), yi(ne, t.state.enabled);
	}), K("click", m, () => t.actions.command("close")), K("click", E, () => t.actions.command("undo")), K("click", D, () => t.actions.command("redo")), K("click", te, () => t.actions.command("inspector")), K("change", ne, (e) => t.actions.setEnabled(e.currentTarget.checked)), J(e, l), Ve(c);
}
Sr(["click", "change"]);
//#endregion
//#region ui/PaneDivider.svelte
var _a = /* @__PURE__ */ q("<div class=\"pc-pane-divider\" role=\"separator\" aria-label=\"Resize preview\" aria-orientation=\"horizontal\" tabindex=\"0\"></div>");
function va(e, t) {
	Be(t, !0);
	let n = Oi(t, "min", 3, 90), r = Oi(t, "max", 3, 500), i, a = null, o = (e) => Math.max(n(), Math.min(r(), e));
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
	Ai(u);
	var f = _a();
	G("blur", en, u), Di(f, (e) => i = e, () => i), U((e, t) => {
		$(f, "aria-valuemin", n()), $(f, "aria-valuemax", e), $(f, "aria-valuenow", t);
	}, [() => Math.round(r()), () => Math.round(t.height)]), K("pointerdown", f, s), K("pointermove", f, c), K("pointerup", f, (e) => l(!1, e.pointerId)), G("pointercancel", f, (e) => l(!0, e.pointerId)), G("lostpointercapture", f, (e) => l(!0, e.pointerId)), K("keydown", f, d), J(e, f), Ve();
}
Sr([
	"pointerdown",
	"pointermove",
	"pointerup",
	"keydown"
]);
//#endregion
//#region ui/DetailsDivider.svelte
var ya = /* @__PURE__ */ q("<div class=\"pc-details-divider svelte-1iyzcro\" role=\"separator\" aria-label=\"Resize Details\" aria-orientation=\"vertical\" tabindex=\"0\"></div>");
function ba(e, t) {
	Be(t, !0);
	let n = Oi(t, "min", 3, 220), r = Oi(t, "max", 3, 520), i, a = null, o = (e) => Math.max(n(), Math.min(r(), e));
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
	Ai(c);
	var f = ya();
	G("blur", en, c), Di(f, (e) => i = e, () => i), U((e, t) => {
		$(f, "aria-valuemin", n()), $(f, "aria-valuemax", e), $(f, "aria-valuenow", t);
	}, [() => Math.round(r()), () => Math.round(t.width)]), K("pointerdown", f, l), K("pointermove", f, u), K("pointerup", f, (e) => s(!1, e.pointerId)), G("pointercancel", f, (e) => s(!0, e.pointerId)), G("lostpointercapture", f, (e) => s(!0, e.pointerId)), K("keydown", f, d), J(e, f), Ve();
}
Sr([
	"pointerdown",
	"pointermove",
	"pointerup",
	"keydown"
]);
//#endregion
//#region ui/GraphTabs.svelte
var xa = /* @__PURE__ */ q("<span class=\"pc-graph-tab-lock svelte-7ptwed\" aria-label=\"Read only\">◇</span>"), Sa = /* @__PURE__ */ q("<input type=\"text\" title=\"Enter to save, Escape to cancel\"/>"), Ca = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-graph-tab-close svelte-7ptwed\">×</button>"), wa = /* @__PURE__ */ q("<div><button type=\"button\" role=\"tab\" aria-haspopup=\"menu\"><span class=\"svelte-7ptwed\"> </span><!></button> <!> <!></div>"), Ta = /* @__PURE__ */ q("<button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button>"), Ea = /* @__PURE__ */ q("<button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close tab</button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close other tabs</button> <!>", 1), Da = /* @__PURE__ */ q("<!> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close active view</button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close other views</button> <!>", 1), Oa = /* @__PURE__ */ q("<div role=\"menu\" tabindex=\"-1\"><!></div>"), ka = /* @__PURE__ */ q("<nav aria-label=\"Open graph views\"><div class=\"pc-graph-tab-list svelte-7ptwed\" role=\"tablist\" aria-label=\"Graph views\"></div> <button type=\"button\" class=\"pc-graph-view-overflow svelte-7ptwed\" aria-label=\"Graph view actions\" title=\"Focus, close or reopen graph views\" aria-haspopup=\"menu\">⋯</button> <!></nav>");
function Aa(e, t) {
	Be(t, !0);
	let n = Oi(t, "actions", 19, () => ({})), r = Oi(t, "idPrefix", 3, "pc-graph-view"), i = /* @__PURE__ */ R(null), a = /* @__PURE__ */ R(null), o = /* @__PURE__ */ R(null), s = /* @__PURE__ */ R(!1), c = /* @__PURE__ */ R(""), l = /* @__PURE__ */ R(""), u = /* @__PURE__ */ R(0), d = /* @__PURE__ */ R(0), f = "", p = /* @__PURE__ */ R(""), m = /* @__PURE__ */ R(""), h = /* @__PURE__ */ R(null), g = "", _ = null, v = 0, y = /* @__PURE__ */ I(() => t.views?.tabs.find((e) => e.key === W(l))), b = {};
	yn(() => {
		let e = t.views?.active.key ?? "";
		f === e ? t.views && !t.views.tabs.some((e) => e.key === W(c)) && z(c, e, !0) : (z(c, e, !0), O(), z(p, "")), W(l) && !W(y) && O(), W(p) && (t.views?.workflowId !== g || !t.views.tabs.some((e) => e.key === W(p))) && z(p, ""), f = e;
	});
	async function x(e) {
		let r = t.views?.tabs.find((t) => t.key === e);
		if (!r || r.identity.kind === "library" || !n().renameView || n().canRenameView?.(e) === !1) return;
		let i = ++v;
		_ = null, O(), g = t.views.workflowId, z(m, r.label, !0), z(p, e, !0), await ur(), W(p) === e && v === i && (_ = W(h), W(h)?.focus({ preventScroll: !0 }), W(h)?.select());
	}
	async function S(e, r, i = !0) {
		let a = W(p), o = t.views?.tabs.find((e) => e.key === a), s = W(m).trim();
		a && e === _ && (z(p, ""), _ = null, r && o && s && s !== o.label && t.views?.workflowId === g && o.identity.kind !== "library" && n().canRenameView?.(a) !== !1 && n().renameView?.(a, s), i && (await ur(), b[a]?.focus({ preventScroll: !0 })));
	}
	function C(e) {
		e.stopPropagation(), !e.isComposing && (e.key === "Enter" || e.key === "Escape") && (e.preventDefault(), S(e.currentTarget, e.key === "Enter"));
	}
	function w(e) {
		let t = e.breadcrumbs.map((e) => e.label).join(" / ") || e.label, n = e.identity;
		return n.kind === "instance" ? `${t} (${n.instancePath.map((e) => JSON.stringify(e)).join(" → ")})` : n.kind === "library" ? `${t} · Library v${n.definitionRef.version} (${n.definitionRef.id})` : t;
	}
	function T(e) {
		z(c, e, !0), n().focusView?.(e), b[e]?.focus({ preventScroll: !0 });
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
		n().closeView?.(e.key), await ur();
		let r = t.views?.active.key;
		r && t.views?.tabs.some((e) => e.key === r) && (z(c, r, !0), b[r]?.focus({ preventScroll: !0 }));
	}
	function O(e = !1) {
		let t = W(l) ? b[W(l)] : W(o);
		z(s, !1), z(l, ""), e && t?.focus({ preventScroll: !0 });
	}
	function k(e, t) {
		e.preventDefault(), e.stopPropagation(), A(t, e.clientX, e.clientY);
	}
	async function A(e, t, n) {
		if (z(l, e.key, !0), z(u, t, !0), z(d, n, !0), z(s, !0), await ur(), !W(s) || W(l) !== e.key) return;
		let r = W(a)?.getBoundingClientRect();
		z(u, Math.min(Math.max(8, t), Math.max(8, window.innerWidth - (r?.width ?? 0) - 8)), !0), z(d, Math.min(Math.max(8, n), Math.max(8, window.innerHeight - (r?.height ?? 0) - 8)), !0), W(a)?.querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
	}
	async function ee() {
		let e = !!W(l);
		z(l, ""), z(s, e || !W(s), !0), W(s) && (await ur(), W(s) && W(a)?.querySelector("button:not(:disabled)")?.focus());
	}
	function j(e) {
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
	function te(e) {
		O(!0), e();
	}
	function M(e) {
		let t = W(y);
		t && (O(!0), e(t));
	}
	var ne = { startRename: x }, re = Nr();
	G("pointerdown", en, (e) => {
		W(s) && !W(a)?.contains(e.target) && e.target !== W(o) && O();
	}), G("resize", en, () => O());
	var ie = V(re), ae = (e) => {
		var f = ka();
		let g;
		var _ = B(f);
		Z(_, 23, () => t.views.tabs, (e) => e.key, (e, n, i) => {
			var a = wa();
			let o;
			var u = B(a);
			let d;
			var f = B(u), g = B(f, !0);
			F(f);
			var _ = H(f), v = (e) => {
				J(e, xa());
			};
			X(_, (e) => {
				W(n).readOnly && e(v);
			}), F(u), Di(u, (e, t) => b[t.key] = e, (e) => b?.[e.key], () => [W(n)]);
			var y = H(u, 2), x = (e) => {
				var t = Sa();
				Q(t);
				let r;
				Di(t, (e) => z(h, e), () => W(h)), U(() => {
					r = si(t, 1, "pc-graph-tab-rename svelte-7ptwed", null, r, { "pc-graph-tab-closeable": W(n).identity.kind !== "root" }), $(t, "aria-label", W(n).identity.kind === "root" ? "Graph name" : "Subgraph name"), $(t, "maxlength", W(n).identity.kind === "instance" ? 80 : void 0);
				}), K("keydown", t, C), G("blur", t, (e) => S(e.currentTarget, !0, !1)), Ci(t, () => W(m), (e) => z(m, e)), J(e, t);
			};
			X(y, (e) => {
				W(p) === W(n).key && e(x);
			});
			var O = H(y, 2), A = (e) => {
				var r = Ca();
				U((e, i) => {
					$(r, "aria-label", e), $(r, "title", i), $(r, "tabindex", W(n).key === (W(c) || t.views.active.key) ? 0 : -1);
				}, [() => `Close ${W(n).label} · ${w(W(n))}`, () => `Close ${w(W(n))}`]), K("click", r, () => D(W(n))), K("contextmenu", r, (e) => k(e, W(n))), K("keydown", r, (e) => E(e, W(i))), J(e, r);
			};
			X(O, (e) => {
				W(n).identity.kind !== "root" && e(A);
			}), F(a), U((e) => {
				o = si(a, 1, "pc-graph-tab-item svelte-7ptwed", null, o, {
					"pc-graph-tab-active": W(n).key === t.views.active.key,
					"pc-graph-tab-editing": W(p) === W(n).key
				}), d = si(u, 1, "pc-graph-tab svelte-7ptwed", null, d, { "pc-graph-tab-closeable": W(n).identity.kind !== "root" }), $(u, "id", `${r()}-${W(i)}`), $(u, "aria-controls", t.panelId), $(u, "aria-selected", W(n).key === t.views.active.key), $(u, "aria-expanded", W(s) && W(l) === W(n).key), $(u, "tabindex", W(p) !== W(n).key && W(n).key === (W(c) || t.views.active.key) ? 0 : -1), $(u, "title", e), Y(g, W(n).label);
			}, [() => w(W(n))]), K("click", u, () => T(W(n).key)), K("pointerdown", u, (e) => {
				e.button === 2 && e.preventDefault();
			}), K("contextmenu", u, (e) => k(e, W(n))), K("keydown", u, (e) => E(e, W(i))), J(e, a);
		}), F(_);
		var v = H(_, 2);
		Di(v, (e) => z(o, e), () => W(o));
		var O = H(v, 2), A = (e) => {
			var r = Oa();
			let i;
			var o = B(r), s = (e) => {
				let r = /* @__PURE__ */ I(() => W(y)), i = /* @__PURE__ */ I(() => n().canRenameView?.(W(r).key) === !1);
				var a = Ea(), o = V(a), s = B(o, !0);
				F(o);
				var c = H(o, 2), l = B(c, !0);
				F(c);
				var u = H(c, 2), d = H(u, 2);
				Z(H(d, 2), 17, () => t.views.closedViews, (e) => e.key, (e, t) => {
					var r = Ta(), i = B(r);
					F(r), U((e, a) => {
						r.disabled = !n().reopenView, $(r, "title", e), Y(i, `Reopen ${W(t).label ?? ""} · ${a ?? ""}`);
					}, [() => w(W(t)), () => w(W(t))]), K("click", r, () => te(() => n().reopenView?.(W(t).key))), J(e, r);
				}), U((e) => {
					o.disabled = !n().exportView, Y(s, W(r).identity.kind === "root" ? "Export workflow JSON" : "Export subgraph JSON"), c.disabled = W(r).identity.kind === "library" || W(i) || !n().renameView, $(c, "title", W(r).identity.kind === "library" ? "Library inspection is read only." : W(i) ? "Make a local copy of the containing graph to rename this subgraph." : void 0), Y(l, W(r).identity.kind === "root" ? "Rename graph" : "Rename subgraph"), u.disabled = W(r).identity.kind === "root" || !n().closeView, d.disabled = e;
				}, [() => t.views.tabs.every((e) => e.identity.kind === "root" || e.key === W(r).key) || !n().closeOtherViews]), K("click", o, () => M((e) => n().exportView?.(e.key))), K("click", c, () => M((e) => x(e.key))), K("click", u, () => M((e) => D(e))), K("click", d, () => M((e) => n().closeOtherViews?.(e.key))), J(e, a);
			}, c = (e) => {
				var r = Da(), i = V(r);
				Z(i, 17, () => t.views.tabs, (e) => e.key, (e, t) => {
					var n = Ta(), r = B(n);
					F(n), U((e, t) => {
						$(n, "title", e), Y(r, `Focus ${t ?? ""}`);
					}, [() => w(W(t)), () => w(W(t))]), K("click", n, () => te(() => T(W(t).key))), J(e, n);
				});
				var a = H(i, 2), o = H(a, 2);
				Z(H(o, 2), 17, () => t.views.closedViews, (e) => e.key, (e, t) => {
					var r = Ta(), i = B(r);
					F(r), U((e, n) => {
						$(r, "title", e), Y(i, `Reopen ${W(t).label ?? ""} · ${n ?? ""}`);
					}, [() => w(W(t)), () => w(W(t))]), K("click", r, () => te(() => n().reopenView?.(W(t).key))), J(e, r);
				}), U((e) => {
					a.disabled = t.views.active.identity.kind === "root" || !n().closeView, o.disabled = e;
				}, [() => t.views.tabs.every((e) => e.identity.kind === "root" || e.key === t.views.active.key) || !n().closeOtherViews]), K("click", a, () => te(() => D(t.views.active))), K("click", o, () => te(() => n().closeOtherViews?.(t.views.active.key))), J(e, r);
			};
			X(o, (e) => {
				W(y) ? e(s) : e(c, -1);
			}), F(r), Di(r, (e) => z(a, e), () => W(a)), U(() => {
				i = si(r, 1, "pc-graph-view-menu svelte-7ptwed", null, i, { "pc-graph-tab-menu": !!W(l) }), li(r, W(l) ? `left: ${W(u)}px; top: ${W(d)}px;` : void 0), $(r, "aria-label", W(y) ? `Actions for ${W(y).label}` : "Graph view actions");
			}), K("keydown", r, j), J(e, r);
		};
		X(O, (e) => {
			W(s) && e(A);
		}), F(f), Di(f, (e) => z(i, e), () => W(i)), U(() => {
			g = si(f, 1, "pc-graph-tabs pc-graph-tabs-multi svelte-7ptwed", null, g, { "pc-graph-tabs-menu-open": W(s) }), $(v, "aria-expanded", W(s) && !W(l));
		}), K("click", v, ee), J(e, f);
	};
	return X(ie, (e) => {
		t.views && e(ae);
	}), J(e, re), Ve(ne);
}
Sr([
	"click",
	"pointerdown",
	"contextmenu",
	"keydown"
]);
//#endregion
//#region ui/GraphBreadcrumbs.svelte
var ja = /* @__PURE__ */ q("<span aria-current=\"page\" class=\"svelte-18ovafz\"> </span>"), Ma = /* @__PURE__ */ q("<button type=\"button\" class=\"svelte-18ovafz\"> </button>"), Na = /* @__PURE__ */ q("<li class=\"svelte-18ovafz\"><!></li>"), Pa = /* @__PURE__ */ q("<div class=\"pc-graph-location svelte-18ovafz\"><nav aria-label=\"Graph location\" class=\"svelte-18ovafz\"><ol class=\"svelte-18ovafz\"></ol></nav> <span class=\"pc-graph-scope svelte-18ovafz\"> <!><!></span></div>");
function Fa(e, t) {
	Be(t, !0);
	let n = Oi(t, "actions", 19, () => ({})), r = /* @__PURE__ */ I(() => t.view?.identity.kind === "library" ? t.view.identity.definitionRef : t.definitionRef ?? t.view?.definitionRef);
	function i(e) {
		return e.identity.kind === "instance" ? !!n().openInstance : !!n().focusView;
	}
	function a(e) {
		e.identity.kind === "instance" ? n().openInstance?.(e.identity.instancePath) : n().focusView?.(e.key);
	}
	var o = Nr(), s = V(o), c = (e) => {
		var n = Pa(), o = B(n), s = B(o);
		Z(s, 23, () => t.view.breadcrumbs, (e) => e.key, (e, n, r) => {
			var o = Na(), s = B(o), c = (e) => {
				var t = ja(), r = B(t, !0);
				F(t), U(() => Y(r, W(n).label)), J(e, t);
			}, l = (e) => {
				var t = Ma(), r = B(t, !0);
				F(t), U((e) => {
					t.disabled = e, Y(r, W(n).label);
				}, [() => !i(W(n))]), K("click", t, () => a(W(n))), J(e, t);
			};
			X(s, (e) => {
				W(r) === t.view.breadcrumbs.length - 1 ? e(c) : e(l, -1);
			}), F(o), J(e, o);
		}), F(s), F(o);
		var c = H(o, 2), l = B(c, !0), u = H(l), d = (e) => {
			var t = Mr();
			U(() => Y(t, `· v${W(r).version ?? ""}`)), J(e, t);
		};
		X(u, (e) => {
			W(r) && e(d);
		});
		var f = H(u), p = (e) => {
			J(e, Mr("· Read only"));
		};
		X(f, (e) => {
			(t.view.readOnly || t.view.identity.kind === "library") && e(p);
		}), F(c), F(n), U(() => {
			$(c, "title", W(r) ? `${W(r).id} · v${W(r).version} · ${W(r).semanticHash}` : void 0), Y(l, t.view.identity.kind === "library" ? "Library inspection" : "Instance graph");
		}), J(e, n);
	};
	X(s, (e) => {
		t.view && t.view.identity.kind !== "root" && e(c);
	}), J(e, o), Ve();
}
Sr(["click"]);
//#endregion
//#region ui/StructuredControl.svelte
var Ia = /* @__PURE__ */ q("<small class=\"svelte-taw2zx\">Rows are available when this JSON has a supported shape.</small>"), La = /* @__PURE__ */ q("<label class=\"svelte-taw2zx\"> </label><textarea class=\"pc-structured-raw svelte-taw2zx\" spellcheck=\"false\"></textarea> <!>", 1), Ra = /* @__PURE__ */ q("<option class=\"svelte-taw2zx\"> </option>"), za = /* @__PURE__ */ q("<label class=\"svelte-taw2zx\">Phase</label><select class=\"svelte-taw2zx\"></select> <label class=\"svelte-taw2zx\">Steps</label><input type=\"number\" min=\"1\" max=\"64\" step=\"1\" class=\"svelte-taw2zx\"/>", 1), Ba = /* @__PURE__ */ q("<label class=\"svelte-taw2zx\">Name</label><input maxlength=\"128\" class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Value</label><input type=\"number\" step=\"any\" class=\"svelte-taw2zx\"/>", 1), Va = /* @__PURE__ */ q("<label class=\"svelte-taw2zx\">Default (JSON)</label><textarea class=\"svelte-taw2zx\"></textarea>", 1), Ha = /* @__PURE__ */ q("<label class=\"svelte-taw2zx\">Name</label><input class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Path (JSON array)</label><input class=\"svelte-taw2zx\"/> <label class=\"pc-structured-check svelte-taw2zx\"><input type=\"checkbox\" class=\"svelte-taw2zx\"/> Required</label> <label class=\"pc-structured-check svelte-taw2zx\"><input type=\"checkbox\" class=\"svelte-taw2zx\"/> Use default when missing</label><small class=\"svelte-taw2zx\">Defaults apply when Required is off.</small> <!>", 1), Ua = /* @__PURE__ */ q("<label class=\"svelte-taw2zx\">ID</label><input maxlength=\"128\" class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Label</label><input maxlength=\"80\" class=\"svelte-taw2zx\"/>", 1), Wa = /* @__PURE__ */ q("<label class=\"svelte-taw2zx\">Name</label><input class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Text</label><textarea class=\"svelte-taw2zx\"></textarea>", 1), Ga = /* @__PURE__ */ q("<label class=\"svelte-taw2zx\">Kind</label><select class=\"svelte-taw2zx\"><option class=\"svelte-taw2zx\">Literal</option><option class=\"svelte-taw2zx\">Regular expression</option></select> <label class=\"svelte-taw2zx\">Pattern</label><input class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Replacement</label><textarea class=\"svelte-taw2zx\"></textarea> <label class=\"svelte-taw2zx\">Flags</label><input class=\"svelte-taw2zx\"/>", 1), Ka = /* @__PURE__ */ q("<button type=\"button\" class=\"svelte-taw2zx\">Move up</button><button type=\"button\" class=\"svelte-taw2zx\">Move down</button>", 1), qa = /* @__PURE__ */ q("<fieldset class=\"pc-structured-row svelte-taw2zx\"><legend class=\"svelte-taw2zx\"> </legend> <!> <div class=\"pc-structured-actions svelte-taw2zx\"><!><button type=\"button\" class=\"svelte-taw2zx\">Remove</button></div></fieldset>"), Ja = /* @__PURE__ */ q("<div class=\"pc-structured-rows svelte-taw2zx\"></div> <button type=\"button\" class=\"svelte-taw2zx\"> </button>", 1), Ya = /* @__PURE__ */ q("<div class=\"pc-structured-control svelte-taw2zx\"><div class=\"pc-structured-mode svelte-taw2zx\"><button type=\"button\" class=\"svelte-taw2zx\"> </button></div> <!></div>");
function Xa(e, t) {
	Be(t, !0);
	let n = Oi(t, "disabled", 3, !1), r = Oi(t, "error", 3, ""), i = [
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
	let c = /* @__PURE__ */ I(() => t.control.structured === "fields" ? "field" : t.control.structured === "sections" ? "section" : t.control.structured === "slots" ? "slot" : t.control.structured === "numeric-map" ? "value" : t.control.structured === "durations" ? "duration" : "rule"), l = /* @__PURE__ */ I(() => t.control.structured === "fields" ? 128 : t.control.structured === "slots" ? 16 : t.control.structured === "numeric-map" ? 32 : t.control.structured === "durations" ? 5 : 64), u = /* @__PURE__ */ I(() => t.control.structured === "slots" ? 2 : 0);
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
	let f = /* @__PURE__ */ I(d), p = /* @__PURE__ */ R(!1), m = /* @__PURE__ */ I(() => W(p) || !W(f));
	function h(e) {
		n() || (z(p, !0), t.ontext(e));
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
			z(p, !0), t.ontext(JSON.stringify(o, null, 2).replace(JSON.stringify(a), () => i));
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
	var E = Ya(), D = B(E), O = B(D), k = B(O, !0);
	F(O), F(D);
	var A = H(D, 2), ee = (e) => {
		var i = La(), a = V(i), o = B(a);
		F(a);
		var s = H(a);
		nt(s);
		var c = H(s, 2), l = (e) => {
			J(e, Ia());
		};
		X(c, (e) => {
			W(f) || e(l);
		}), U(() => {
			$(a, "for", t.idPrefix + "-raw"), Y(o, `${t.control.label ?? ""} (JSON)`), $(s, "id", t.idPrefix + "-raw"), $(s, "aria-label", t.control.label), $(s, "aria-invalid", !!r()), $(s, "aria-describedby", r() ? t.idPrefix + "-error" : void 0), vi(s, t.text), s.disabled = n();
		}), K("input", s, (e) => h(e.currentTarget.value)), J(e, i);
	}, j = (e) => {
		var r = Ja(), a = V(r);
		Z(a, 21, () => W(f), Ur, (e, r, a) => {
			var o = qa(), s = B(o), l = B(s);
			F(s);
			var d = H(s, 2), p = (e) => {
				var o = za(), s = V(o), c = H(s);
				$(c, "aria-label", "Duration " + (a + 1) + " phase"), Z(c, 21, () => i, Ur, (e, t) => {
					var n = Ra(), r = B(n, !0);
					F(n);
					var i = {};
					U((e, a) => {
						n.disabled = e, Y(r, a), i !== (i = W(t)) && (n.value = (n.__value = W(t)) ?? "");
					}, [() => W(f).some((e, n) => n !== a && e.name === W(t)), () => W(t)[0].toUpperCase() + W(t).slice(1)]), J(e, n);
				}), F(c);
				var l;
				di(c);
				var u = H(c, 2), d = H(u);
				Q(d), $(d, "aria-label", "Duration " + (a + 1) + " steps"), U((e, r) => {
					$(s, "for", t.idPrefix + "-phase-" + a), $(c, "id", t.idPrefix + "-phase-" + a), c.disabled = n(), l !== (l = e) && (c.value = (c.__value = e) ?? "", ui(c, e)), $(u, "for", t.idPrefix + "-steps-" + a), $(d, "id", t.idPrefix + "-steps-" + a), vi(d, r), d.disabled = n();
				}, [() => String(W(r).name), () => Number(W(r).number)]), K("change", c, (e) => x(a, e.currentTarget)), K("change", d, (e) => b(a, e.currentTarget)), J(e, o);
			}, m = (e) => {
				var i = Ba(), o = V(i), s = H(o);
				Q(s), $(s, "aria-label", "Value " + (a + 1) + " name");
				var c = H(s, 2), l = H(c);
				Q(l), $(l, "aria-label", "Value " + (a + 1) + " number"), U((e, r) => {
					$(o, "for", t.idPrefix + "-name-" + a), $(s, "id", t.idPrefix + "-name-" + a), vi(s, e), s.disabled = n(), $(c, "for", t.idPrefix + "-number-" + a), $(l, "id", t.idPrefix + "-number-" + a), vi(l, r), $(l, "min", t.control.min), $(l, "max", t.control.max), l.disabled = n();
				}, [() => String(W(r).name), () => Number(W(r).number)]), K("change", s, (e) => x(a, e.currentTarget)), K("change", l, (e) => b(a, e.currentTarget)), J(e, i);
			}, h = (e) => {
				var i = Ha(), o = V(i), s = H(o);
				Q(s), $(s, "aria-label", "Field " + (a + 1) + " name");
				var c = H(s, 2), l = H(c);
				Q(l), $(l, "aria-label", "Field " + (a + 1) + " path (JSON array)");
				var u = H(l, 2), d = B(u);
				Q(d), $(d, "aria-label", "Field " + (a + 1) + " required"), ke(), F(u);
				var f = H(u, 2), p = B(f);
				Q(p), $(p, "aria-label", "Field " + (a + 1) + " use default"), ke(), F(f);
				var m = H(f, 3), h = (e) => {
					var i = Va(), o = V(i), s = H(o);
					nt(s), $(s, "aria-label", "Field " + (a + 1) + " default (JSON)"), U((e) => {
						$(o, "for", t.idPrefix + "-default-" + a), $(s, "id", t.idPrefix + "-default-" + a), vi(s, e), s.disabled = n();
					}, [() => JSON.stringify(W(r).default, null, 2)]), K("change", s, (e) => S(a, "default", e.currentTarget.value)), J(e, i);
				}, g = /* @__PURE__ */ I(() => Object.hasOwn(W(r), "default"));
				X(m, (e) => {
					W(g) && e(h);
				}), U((e, i, u) => {
					$(o, "for", t.idPrefix + "-name-" + a), $(s, "id", t.idPrefix + "-name-" + a), vi(s, e), s.disabled = n(), $(c, "for", t.idPrefix + "-path-" + a), $(l, "id", t.idPrefix + "-path-" + a), vi(l, i), l.disabled = n(), yi(d, W(r).required !== !1), d.disabled = n(), yi(p, u), p.disabled = n();
				}, [
					() => String(W(r).name),
					() => JSON.stringify(W(r).path),
					() => Object.hasOwn(W(r), "default")
				]), K("input", s, (e) => v(a, "name", e.currentTarget.value)), K("change", l, (e) => S(a, "path", e.currentTarget.value)), K("change", d, (e) => v(a, "required", e.currentTarget.checked)), K("change", p, (e) => C(a, e.currentTarget.checked)), J(e, i);
			}, g = (e) => {
				var i = Ua(), o = V(i), s = H(o);
				Q(s), $(s, "aria-label", "Slot " + (a + 1) + " ID");
				var c = H(s, 2), l = H(c);
				Q(l), $(l, "aria-label", "Slot " + (a + 1) + " label"), U((e, r) => {
					$(o, "for", t.idPrefix + "-slot-id-" + a), $(s, "id", t.idPrefix + "-slot-id-" + a), vi(s, e), s.disabled = n(), $(c, "for", t.idPrefix + "-slot-label-" + a), $(l, "id", t.idPrefix + "-slot-label-" + a), vi(l, r), l.disabled = n();
				}, [() => String(W(r).id), () => String(W(r).label)]), K("input", s, (e) => v(a, "id", e.currentTarget.value)), K("input", l, (e) => v(a, "label", e.currentTarget.value)), J(e, i);
			}, _ = (e) => {
				var i = Wa(), o = V(i), s = H(o);
				Q(s), $(s, "aria-label", "Section " + (a + 1) + " name");
				var c = H(s, 2), l = H(c);
				nt(l), $(l, "aria-label", "Section " + (a + 1) + " text"), U((e, r) => {
					$(o, "for", t.idPrefix + "-name-" + a), $(s, "id", t.idPrefix + "-name-" + a), vi(s, e), s.disabled = n(), $(c, "for", t.idPrefix + "-text-" + a), $(l, "id", t.idPrefix + "-text-" + a), vi(l, r), l.disabled = n();
				}, [() => String(W(r).name), () => String(W(r).text)]), K("input", s, (e) => v(a, "name", e.currentTarget.value)), K("input", l, (e) => v(a, "text", e.currentTarget.value)), J(e, i);
			}, y = (e) => {
				var i = Ga(), o = V(i), s = H(o);
				$(s, "aria-label", "Rule " + (a + 1) + " kind");
				var c = B(s);
				c.value = c.__value = "literal";
				var l = H(c);
				l.value = l.__value = "regex", F(s);
				var u;
				di(s);
				var d = H(s, 2), f = H(d);
				Q(f), $(f, "aria-label", "Rule " + (a + 1) + " pattern");
				var p = H(f, 2), m = H(p);
				nt(m), $(m, "aria-label", "Rule " + (a + 1) + " replacement");
				var h = H(m, 2), g = H(h);
				Q(g), $(g, "aria-label", "Rule " + (a + 1) + " flags"), U((e, r, i, c) => {
					$(o, "for", t.idPrefix + "-kind-" + a), $(s, "id", t.idPrefix + "-kind-" + a), s.disabled = n(), u !== (u = e) && (s.value = (s.__value = e) ?? "", ui(s, e)), $(d, "for", t.idPrefix + "-pattern-" + a), $(f, "id", t.idPrefix + "-pattern-" + a), vi(f, r), f.disabled = n(), $(p, "for", t.idPrefix + "-replacement-" + a), $(m, "id", t.idPrefix + "-replacement-" + a), vi(m, i), m.disabled = n(), $(h, "for", t.idPrefix + "-flags-" + a), $(g, "id", t.idPrefix + "-flags-" + a), vi(g, c), g.disabled = n();
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
			var E = H(d, 2), D = B(E), O = (e) => {
				var t = Ka(), r = V(t), i = H(r);
				U(() => {
					$(r, "aria-label", "Move " + W(c) + " " + (a + 1) + " up"), r.disabled = n() || a === 0, $(i, "aria-label", "Move " + W(c) + " " + (a + 1) + " down"), i.disabled = n() || a === W(f).length - 1;
				}), K("click", r, () => T(a, -1)), K("click", i, () => T(a, 1)), J(e, t);
			}, k = /* @__PURE__ */ I(() => !["numeric-map", "durations"].includes(t.control.structured ?? ""));
			X(D, (e) => {
				W(k) && e(O);
			});
			var A = H(D);
			F(E), F(o), U((e) => {
				Y(l, `${e ?? ""} ${a + 1}`), $(A, "aria-label", "Remove " + W(c) + " " + (a + 1)), A.disabled = n() || W(f).length <= W(u);
			}, [() => W(c)[0].toUpperCase() + W(c).slice(1)]), K("click", A, () => w(a)), J(e, o);
		}), F(a);
		var o = H(a, 2), s = B(o);
		F(o), U(() => {
			$(o, "aria-label", "Add " + W(c)), o.disabled = n() || W(f).length >= W(l), Y(s, `Add ${W(c) ?? ""}`);
		}), K("click", o, y), J(e, r);
	};
	X(A, (e) => {
		W(m) ? e(ee) : W(f) && e(j, 1);
	}), F(E), U(() => {
		$(E, "data-structured-control", t.control.structured), $(O, "aria-label", "Edit " + t.control.label + (W(m) ? " as rows" : " as JSON")), O.disabled = n() || W(m) && !W(f), Y(k, W(m) ? "Use rows" : "Edit JSON");
	}), K("click", O, () => {
		!n() && W(f) && z(p, !W(m));
	}), J(e, E), Ve();
}
Sr([
	"click",
	"input",
	"change"
]);
//#endregion
//#region ui/DetailControl.svelte
var Za = /* @__PURE__ */ q("<span class=\"pc-control-label svelte-16a137\"> </span> <!>", 1), Qa = /* @__PURE__ */ q("<label class=\"pc-detail-check svelte-16a137\"><input type=\"checkbox\" class=\"svelte-16a137\"/> </label>"), $a = /* @__PURE__ */ q("<label class=\"svelte-16a137\"><input type=\"radio\" class=\"svelte-16a137\"/><span class=\"svelte-16a137\"> </span></label>"), eo = /* @__PURE__ */ q("<span class=\"pc-control-label svelte-16a137\"> </span> <div class=\"pc-control-segments svelte-16a137\" role=\"radiogroup\"></div>", 1), to = /* @__PURE__ */ q("<option class=\"svelte-16a137\"> </option>"), no = /* @__PURE__ */ q("<select class=\"svelte-16a137\"></select>"), ro = /* @__PURE__ */ q("<input type=\"number\" class=\"svelte-16a137\"/>"), io = /* @__PURE__ */ q("<textarea class=\"svelte-16a137\"></textarea>"), ao = /* @__PURE__ */ q("<input type=\"text\" class=\"svelte-16a137\"/>"), oo = /* @__PURE__ */ q("<label class=\"svelte-16a137\"> </label> <!>", 1), so = /* @__PURE__ */ q("<button type=\"button\" class=\"svelte-16a137\"> </button>"), co = /* @__PURE__ */ q("<small class=\"svelte-16a137\"> </small>"), lo = /* @__PURE__ */ q("<p class=\"pc-detail-error svelte-16a137\" role=\"alert\"> </p>"), uo = /* @__PURE__ */ q("<div><!> <!> <!> <!> <!></div>");
function fo(e, t) {
	Be(t, !0);
	let n = Oi(t, "error", 3, ""), r = Oi(t, "disabled", 3, !1), i = Oi(t, "pending", 3, !1), a = () => t.control.editor === "enum" && (t.control.options?.length ?? 0) > 1 && (t.control.options?.length ?? 0) <= 3 && t.control.options.every((e) => e.label.length <= 10), o = () => t.control.effective !== void 0 && t.control.effective !== t.text && t.control.source !== "Saved setting" ? t.control.source : "";
	var s = uo();
	let c;
	var l = B(s), u = (e) => {
		var i = Za(), a = V(i), o = B(a, !0);
		F(a), Xa(H(a, 2), {
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
		}), U(() => Y(o, t.control.label)), J(e, i);
	}, d = (e) => {
		var n = Qa(), i = B(n);
		Q(i);
		var a = H(i, 1, !0);
		F(n), U((e) => {
			$(i, "aria-label", t.control.label), yi(i, e), i.disabled = r(), Y(a, t.control.label);
		}, [() => !!t.control.value]), K("change", i, (e) => {
			r() || t.onvalue(e.currentTarget.checked);
		}), J(e, n);
	}, f = (e) => {
		var n = eo(), i = V(n), a = B(i, !0);
		F(i);
		var o = H(i, 2);
		Z(o, 21, () => t.control.options ?? [], (e) => e.value, (e, n) => {
			var i = $a(), a = B(i);
			Q(a);
			var o = H(a), s = B(o, !0);
			F(o), F(i), U((e) => {
				$(a, "name", t.idPrefix + "-choice"), $(a, "aria-label", W(n).label), vi(a, W(n).value), yi(a, e), a.disabled = r(), Y(s, W(n).label);
			}, [() => String(t.control.value) === W(n).value]), K("change", a, (e) => {
				!r() && e.currentTarget.checked && t.onvalue(W(n).value);
			}), J(e, i);
		}), F(o), U(() => {
			Y(a, t.control.label), $(o, "aria-label", t.control.label);
		}), J(e, n);
	}, p = /* @__PURE__ */ I(() => a()), m = (e) => {
		var i = oo(), a = V(i), o = B(a, !0);
		F(a);
		var s = H(a, 2), c = (e) => {
			var n = no();
			Z(n, 21, () => t.control.options ?? [], (e) => e.value, (e, t) => {
				var n = to(), r = B(n, !0);
				F(n);
				var i = {};
				U(() => {
					Y(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
				}), J(e, n);
			}), F(n);
			var i;
			di(n), U((e) => {
				$(n, "id", t.idPrefix + "-editor"), $(n, "aria-label", t.control.label), n.disabled = r(), i !== (i = e) && (n.value = (n.__value = e) ?? "", ui(n, e));
			}, [() => String(t.control.value)]), K("change", n, (e) => {
				r() || t.onvalue(e.currentTarget.value);
			}), J(e, n);
		}, l = (e) => {
			var i = ro();
			Q(i), U((e) => {
				$(i, "id", t.idPrefix + "-editor"), $(i, "aria-label", t.control.label), $(i, "min", t.control.min), $(i, "max", t.control.max), $(i, "step", t.control.step ?? 1), $(i, "aria-invalid", !!n()), $(i, "aria-describedby", n() ? t.idPrefix + "-error" : void 0), vi(i, e), i.disabled = r();
			}, [() => Number(t.control.value)]), K("change", i, (e) => {
				r() || t.onnumber(e.currentTarget);
			}), J(e, i);
		}, u = (e) => {
			var i = io();
			nt(i), U(() => {
				$(i, "id", t.idPrefix + "-editor"), $(i, "aria-label", t.control.label), $(i, "aria-invalid", !!n()), $(i, "aria-describedby", n() ? t.idPrefix + "-error" : void 0), vi(i, t.text), i.disabled = r();
			}), K("input", i, (e) => {
				r() || t.ontext(e.currentTarget.value);
			}), J(e, i);
		}, d = (e) => {
			var n = ao();
			Q(n), U(() => {
				$(n, "id", t.idPrefix + "-editor"), $(n, "aria-label", t.control.label), vi(n, t.text), n.disabled = r();
			}), K("change", n, (e) => {
				r() || t.onvalue(e.currentTarget.value);
			}), J(e, n);
		}, f = /* @__PURE__ */ I(() => t.control.singleLine && t.control.editor === "text" && !t.text.includes("\n") && !t.text.includes("\r")), p = (e) => {
			var n = io();
			nt(n), U(() => {
				$(n, "id", t.idPrefix + "-editor"), $(n, "aria-label", t.control.label), vi(n, t.text), n.disabled = r();
			}), K("change", n, (e) => {
				r() || t.onvalue(e.currentTarget.value);
			}), J(e, n);
		};
		X(s, (e) => {
			t.control.editor === "enum" ? e(c) : t.control.editor === "number" ? e(l, 1) : t.control.editor === "json" || t.control.editor === "lines" ? e(u, 2) : W(f) ? e(d, 3) : e(p, -1);
		}), U(() => {
			$(a, "for", t.idPrefix + "-editor"), Y(o, t.control.label);
		}), J(e, i);
	};
	X(l, (e) => {
		t.control.structured && t.control.editor === "json" ? e(u) : t.control.editor === "boolean" ? e(d, 1) : W(p) ? e(f, 2) : e(m, -1);
	});
	var h = H(l, 2), g = (e) => {
		var n = so(), a = B(n, !0);
		F(n), U(() => {
			$(n, "data-save-control", t.control.key), n.disabled = r() || i(), Y(a, i() ? "Validating…" : "Save " + t.control.label);
		}), K("click", n, () => {
			!r() && !i() && t.onsave();
		}), J(e, n);
	};
	X(h, (e) => {
		(t.control.editor === "json" || t.control.editor === "lines") && e(g);
	});
	var _ = H(h, 2), v = (e) => {
		var n = co(), r = B(n, !0);
		F(n), U(() => Y(r, t.control.help)), J(e, n);
	};
	X(_, (e) => {
		t.control.help && e(v);
	});
	var y = H(_, 2), b = (e) => {
		var n = co(), r = B(n, !0);
		F(n), U(() => Y(r, t.control.exposureNote)), J(e, n);
	}, x = (e) => {
		var n = co(), r = B(n);
		F(n), U((e) => Y(r, `${e ?? ""} · Effective: ${t.control.effective ?? ""}`), [() => o()]), J(e, n);
	}, S = /* @__PURE__ */ I(() => o());
	X(y, (e) => {
		t.control.exposureNote ? e(b) : W(S) && e(x, 1);
	});
	var C = H(y, 2), w = (e) => {
		var r = lo(), i = B(r, !0);
		F(r), U(() => {
			$(r, "id", t.idPrefix + "-error"), Y(i, n());
		}), J(e, r);
	};
	X(C, (e) => {
		n() && e(w);
	}), F(s), U(() => c = si(s, 1, "pc-detail-control svelte-16a137", null, c, { "pc-control-number": t.control.editor === "number" })), J(e, s), Ve();
}
Sr([
	"change",
	"input",
	"click"
]);
//#endregion
//#region ui/RecallDetails.svelte
var po = /* @__PURE__ */ q("<p class=\"svelte-1kifnmo\"> </p>"), mo = /* @__PURE__ */ q("<p role=\"alert\" class=\"svelte-1kifnmo\"> </p>"), ho = /* @__PURE__ */ q("<p class=\"svelte-1kifnmo\">Add a matching Recall node and connect it to the workflow. Queueing this Shortcut has an effect when that Recall executes.</p>"), go = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-recall-link svelte-1kifnmo\"> </button>"), _o = /* @__PURE__ */ q("<section class=\"pc-recall-details svelte-1kifnmo\" aria-label=\"Memory recall\"><h3 class=\"svelte-1kifnmo\">Memory recall</h3><p role=\"status\" class=\"svelte-1kifnmo\"> </p> <dl class=\"svelte-1kifnmo\"><dt class=\"svelte-1kifnmo\">Memory set</dt><dd class=\"svelte-1kifnmo\"> </dd><dt class=\"svelte-1kifnmo\">Target</dt><dd class=\"svelte-1kifnmo\"> </dd><dt class=\"svelte-1kifnmo\">Repetition</dt><dd class=\"svelte-1kifnmo\"> </dd><dt class=\"svelte-1kifnmo\">Consume on</dt><dd class=\"svelte-1kifnmo\"> </dd></dl> <!> <!> <div class=\"pc-detail-actions svelte-1kifnmo\"><button type=\"button\">Queue recall</button><button type=\"button\">Cancel recall</button></div> <!><!> <!> <!> <small class=\"svelte-1kifnmo\">Matching nodes share one request. The first successful matching Recall supplies the selection for a generation. Use different memory-set IDs for independent selections. Automatic triggers keep their own conditions.</small></section>");
function vo(e, t) {
	Be(t, !0);
	let n = /* @__PURE__ */ R(!1), r = /* @__PURE__ */ R(""), i = "", a = 0;
	yn(() => {
		i !== t.view.nodeId && (i = t.view.nodeId, a++, z(n, !1), z(r, ""));
	});
	async function o(e) {
		if (W(n)) return;
		let i = t.view.nodeId, o = ++a;
		z(n, !0), z(r, "");
		try {
			let n = await t.actions[e]?.();
			o === a && i === t.view.nodeId && n?.ok !== !0 && z(r, n?.error.message ?? "Memory recall is unavailable.", !0);
		} catch {
			o === a && i === t.view.nodeId && z(r, "Memory recall could not be updated.");
		} finally {
			o === a && i === t.view.nodeId && z(n, !1);
		}
	}
	var s = _o(), c = H(B(s)), l = B(c, !0);
	F(c);
	var u = H(c, 2), d = H(B(u)), f = B(d, !0);
	F(d);
	var p = H(d, 2), m = B(p, !0);
	F(p);
	var h = H(p, 2), g = B(h, !0);
	F(h);
	var _ = H(h, 2), v = B(_, !0);
	F(_), F(u);
	var y = H(u, 2), b = (e) => {
		var n = po(), r = B(n);
		F(n), U(() => Y(r, `Remaining: ${t.view.remainingText ?? ""}`)), J(e, n);
	};
	X(y, (e) => {
		t.view.queued && e(b);
	});
	var x = H(y, 2), S = (e) => {
		var n = po(), r = B(n);
		F(n), U(() => Y(r, `Pending generations: ${t.view.pendingCount ?? ""}`)), J(e, n);
	};
	X(x, (e) => {
		t.view.pendingCount && e(S);
	});
	var C = H(x, 2), w = B(C), T = H(w);
	F(C);
	var E = H(C, 2), D = (e) => {
		var n = po(), r = B(n, !0);
		F(n), U(() => Y(r, t.view.reason)), J(e, n);
	};
	X(E, (e) => {
		t.view.reason && e(D);
	});
	var O = H(E), k = (e) => {
		var t = mo(), n = B(t, !0);
		F(t), U(() => Y(n, W(r))), J(e, t);
	};
	X(O, (e) => {
		W(r) && e(k);
	});
	var A = H(O, 2), ee = (e) => {
		J(e, ho());
	}, j = /* @__PURE__ */ I(() => t.view.shortcutNodeIds.includes(t.view.nodeId) && t.view.consumerCount === 0);
	X(A, (e) => {
		W(j) && e(ee);
	}), Z(H(A, 2), 17, () => t.view.hotkeys, (e) => e.nodeId, (e, n) => {
		var r = go(), i = B(r);
		F(r), U(() => {
			r.disabled = !t.actions.revealShortcut, Y(i, `Recall Shortcut · ${W(n).label ?? ""}`);
		}), K("click", r, () => t.actions.revealShortcut?.(W(n).nodeId)), J(e, r);
	}), ke(2), F(s), U(() => {
		Y(l, t.view.statusText), Y(f, t.view.memorySetId || "Choose a memory set"), Y(m, t.view.targetLabel), Y(g, t.view.useLabel), Y(v, t.view.consumeLabel), w.disabled = W(n) || !t.view.queueAllowed || !t.actions.queue, $(w, "title", t.view.queueAllowed ? void 0 : t.view.reason || "Recall is already queued."), T.disabled = W(n) || !t.view.cancelAllowed || !t.actions.cancel;
	}), K("click", w, () => o("queue")), K("click", T, () => o("cancel")), J(e, s), Ve();
}
Sr(["click"]);
//#endregion
//#region ui/ModifierStack.svelte
var yo = /* @__PURE__ */ q("<label class=\"svelte-1ibq9q\"><input type=\"checkbox\" class=\"svelte-1ibq9q\"/> </label>"), bo = /* @__PURE__ */ q("<option class=\"svelte-1ibq9q\"> </option>"), xo = /* @__PURE__ */ q("<label class=\"pc-modifier-check svelte-1ibq9q\"><input type=\"checkbox\" class=\"svelte-1ibq9q\"/> </label>"), So = /* @__PURE__ */ q("<select class=\"svelte-1ibq9q\"></select>"), Co = /* @__PURE__ */ q("<input type=\"number\" class=\"svelte-1ibq9q\"/>"), wo = /* @__PURE__ */ q("<textarea class=\"svelte-1ibq9q\"></textarea>"), To = /* @__PURE__ */ q("<label class=\"svelte-1ibq9q\"> </label> <!>", 1), Eo = /* @__PURE__ */ q("<small class=\"svelte-1ibq9q\"> </small>"), Do = /* @__PURE__ */ q("<!> <!>", 1), Oo = /* @__PURE__ */ q("<details class=\"svelte-1ibq9q\"><summary class=\"svelte-1ibq9q\"> <!></summary> <!> <button type=\"button\" class=\"svelte-1ibq9q\"> </button></details>"), ko = /* @__PURE__ */ q("<p class=\"pc-modifier-error svelte-1ibq9q\" role=\"alert\"> </p>"), Ao = /* @__PURE__ */ q("<div class=\"pc-modifier-entry svelte-1ibq9q\"><div class=\"pc-modifier-heading svelte-1ibq9q\"><label class=\"svelte-1ibq9q\"><input type=\"checkbox\" class=\"svelte-1ibq9q\"/><span class=\"svelte-1ibq9q\"> <small class=\"svelte-1ibq9q\"> </small></span></label> <div class=\"pc-modifier-order svelte-1ibq9q\"><button type=\"button\" title=\"Move up\" class=\"svelte-1ibq9q\">↑</button> <button type=\"button\" title=\"Move down\" class=\"svelte-1ibq9q\">↓</button> <button type=\"button\" title=\"Remove\" class=\"svelte-1ibq9q\">×</button></div></div> <!> <!></div>"), jo = /* @__PURE__ */ q("<div class=\"pc-modifier-stack svelte-1ibq9q\"><small class=\"svelte-1ibq9q\"> </small> <!></div>"), Mo = /* @__PURE__ */ q("<small role=\"status\" class=\"svelte-1ibq9q\">Validating modifiers…</small>"), No = /* @__PURE__ */ q("<section class=\"pc-modifiers svelte-1ibq9q\" data-modifier-controls=\"\" aria-label=\"Text modifiers\"><div class=\"pc-modifier-quick svelte-1ibq9q\"><!> <select aria-label=\"Add text modifier\" class=\"svelte-1ibq9q\"><option class=\"svelte-1ibq9q\">Add modifier…</option><!></select></div> <!> <!> <!></section>");
function Po(e, t) {
	Be(t, !0);
	let n = (e) => t.options.find((t) => t.type === e.type), r = (e) => n(e)?.label ?? e.type, i = (e) => t.drafts[e.id]?.settings ?? e.settings, a = (e) => t.disabled || t.busy || !t.options.some((t) => t.type === e) || t.items.length >= 16 && !t.items.some((t) => t.type === e);
	var o = No(), s = B(o), c = B(s);
	Z(c, 16, () => ["trim", "wrap"], Ur, (e, n) => {
		var r = yo(), i = B(r);
		Q(i);
		var o = H(i, 1, !0);
		F(r), U((e, t) => {
			$(i, "aria-label", (n === "trim" ? "Trim" : "Wrap") + " output"), yi(i, e), i.disabled = t, Y(o, n === "trim" ? "Trim" : "Wrap");
		}, [() => t.items.some((e) => e.type === n && e.enabled), () => a(n)]), K("change", i, (e) => {
			a(n) || t.onquick(n, e.currentTarget.checked);
		}), J(e, r);
	});
	var l = H(c, 2), u = B(l);
	u.value = u.__value = "", Z(H(u), 17, () => t.options.filter((e) => !["trim", "wrap"].includes(e.type)), (e) => e.type, (e, t) => {
		var n = bo(), r = B(n, !0);
		F(n);
		var i = {};
		U(() => {
			Y(r, W(t).label), i !== (i = W(t).type) && (n.value = (n.__value = W(t).type) ?? "");
		}), J(e, n);
	}), F(l), l.value = l.__value = "", F(s);
	var d = H(s, 2), f = (e) => {
		var a = jo(), o = B(a), s = B(o);
		F(o), Z(H(o, 2), 19, () => t.items, (e) => e.id, (e, a, o) => {
			let s = /* @__PURE__ */ I(() => n(W(a))), c = /* @__PURE__ */ I(() => r(W(a))), l = /* @__PURE__ */ I(() => t.drafts[W(a).id]);
			var u = Ao(), d = B(u), f = B(d), p = B(f);
			Q(p);
			var m = H(p), h = B(m), g = H(h), _ = B(g, !0);
			F(g), F(m), F(f);
			var v = H(f, 2), y = B(v), b = H(y, 2), x = H(b, 2);
			F(v), F(d);
			var S = H(d, 2), C = (e) => {
				var n = Oo(), r = B(n), o = B(r), u = H(o), d = (e) => {
					J(e, Mr("· Unsaved"));
				};
				X(u, (e) => {
					W(l)?.dirty && e(d);
				}), F(r);
				var f = H(r, 2);
				Z(f, 17, () => W(s).fields, (e) => e.key, (e, n) => {
					let r = /* @__PURE__ */ I(() => t.idPrefix + "-modifier-" + W(a).id + "-" + W(n).key);
					var o = Do(), s = V(o), l = (e) => {
						var o = xo(), s = B(o);
						Q(s);
						var l = H(s, 1, !0);
						F(o), U((e) => {
							$(s, "id", W(r)), $(s, "aria-label", W(c) + " " + W(n).label), yi(s, e), s.disabled = t.disabled, Y(l, W(n).label);
						}, [() => !!i(W(a))[W(n).key]]), K("change", s, (e) => {
							t.disabled || t.ondraft(W(a).id, W(n).key, e.currentTarget.checked);
						}), J(e, o);
					}, u = (e) => {
						var o = To(), s = V(o), l = B(s, !0);
						F(s);
						var u = H(s, 2), d = (e) => {
							var o = So();
							Z(o, 21, () => W(n).options ?? [], (e) => e.value, (e, t) => {
								var n = bo(), r = B(n, !0);
								F(n);
								var i = {};
								U(() => {
									Y(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
								}), J(e, n);
							}), F(o);
							var s;
							di(o), U((e) => {
								$(o, "id", W(r)), $(o, "aria-label", W(c) + " " + W(n).label), o.disabled = t.disabled, s !== (s = e) && (o.value = (o.__value = e) ?? "", ui(o, e));
							}, [() => String(i(W(a))[W(n).key] ?? "")]), K("change", o, (e) => {
								t.disabled || t.ondraft(W(a).id, W(n).key, e.currentTarget.value);
							}), J(e, o);
						}, f = (e) => {
							var o = Co();
							Q(o), U((e) => {
								$(o, "id", W(r)), $(o, "aria-label", W(c) + " " + W(n).label), $(o, "min", W(n).min), $(o, "max", W(n).max), $(o, "step", W(n).step ?? 1), vi(o, e), o.disabled = t.disabled;
							}, [() => String(i(W(a))[W(n).key] ?? "")]), K("input", o, (e) => {
								t.disabled || t.ondraft(W(a).id, W(n).key, e.currentTarget.value ? Number(e.currentTarget.value) : null);
							}), J(e, o);
						}, p = (e) => {
							var o = wo();
							nt(o), U((e) => {
								$(o, "id", W(r)), $(o, "aria-label", W(c) + " " + W(n).label), vi(o, e), o.disabled = t.disabled;
							}, [() => String(i(W(a))[W(n).key] ?? "")]), K("input", o, (e) => {
								t.disabled || t.ondraft(W(a).id, W(n).key, e.currentTarget.value);
							}), J(e, o);
						};
						X(u, (e) => {
							W(n).editor === "enum" ? e(d) : W(n).editor === "number" ? e(f, 1) : e(p, -1);
						}), U(() => {
							$(s, "for", W(r)), Y(l, W(n).label);
						}), J(e, o);
					};
					X(s, (e) => {
						W(n).editor === "boolean" ? e(l) : e(u, -1);
					});
					var d = H(s, 2), f = (e) => {
						var t = Eo(), r = B(t, !0);
						F(t), U(() => Y(r, W(n).help)), J(e, t);
					};
					X(d, (e) => {
						W(n).help && e(f);
					}), J(e, o);
				});
				var p = H(f, 2), m = B(p, !0);
				F(p), F(n), U(() => {
					n.open = !!W(l)?.dirty || !!W(l)?.error, Y(o, `${W(c) ?? ""} settings`), $(p, "aria-label", "Save " + W(c) + " settings"), p.disabled = t.disabled || !!W(l)?.pending || !W(l)?.dirty, Y(m, W(l)?.pending ? "Validating…" : "Save settings");
				}), K("click", p, () => {
					!t.disabled && !W(l)?.pending && W(l)?.dirty && t.onsave(W(a).id);
				}), J(e, n);
			};
			X(S, (e) => {
				W(s)?.fields.length && e(C);
			});
			var w = H(S, 2), T = (e) => {
				var t = ko(), n = B(t, !0);
				F(t), U(() => Y(n, W(l).error)), J(e, t);
			};
			X(w, (e) => {
				W(l)?.error && e(T);
			}), F(u), U(() => {
				$(u, "data-modifier-id", W(a).id), $(u, "data-modifier-state", W(a).enabled ? "active" : "disabled"), $(p, "aria-label", "Enable " + W(c) + " modifier"), yi(p, W(a).enabled), p.disabled = t.disabled || t.busy, Y(h, `${W(o) + 1}. ${W(c) ?? ""}`), Y(_, W(a).enabled ? "Active" : "Disabled"), $(y, "aria-label", "Move " + W(c) + " up"), y.disabled = t.disabled || t.busy || W(o) === 0, $(b, "aria-label", "Move " + W(c) + " down"), b.disabled = t.disabled || t.busy || W(o) === t.items.length - 1, $(x, "aria-label", "Remove " + W(c) + " modifier"), x.disabled = t.disabled || t.busy;
			}), K("change", p, (e) => {
				!t.disabled && !t.busy && t.onenable(W(a).id, e.currentTarget.checked);
			}), K("click", y, () => {
				!t.disabled && !t.busy && W(o) > 0 && t.onmove(W(a).id, -1);
			}), K("click", b, () => {
				!t.disabled && !t.busy && W(o) < t.items.length - 1 && t.onmove(W(a).id, 1);
			}), K("click", x, () => {
				!t.disabled && !t.busy && t.onremove(W(a).id);
			}), J(e, u);
		}), F(a), U((e) => Y(s, `${e ?? ""} active · ${t.items.length ?? ""} total · Applied in order`), [() => t.items.filter((e) => e.enabled).length]), J(e, a);
	};
	X(d, (e) => {
		t.items.length && e(f);
	});
	var p = H(d, 2), m = (e) => {
		J(e, Mo());
	};
	X(p, (e) => {
		t.busy && e(m);
	});
	var h = H(p, 2), g = (e) => {
		var n = ko(), r = B(n, !0);
		F(n), U(() => Y(r, t.error)), J(e, n);
	};
	X(h, (e) => {
		t.error && e(g);
	}), F(o), U(() => l.disabled = t.disabled || t.busy || t.items.length >= 16), K("change", l, (e) => {
		let n = e.currentTarget.value;
		e.currentTarget.value = "", !t.disabled && !t.busy && t.items.length < 16 && n && t.onadd(n);
	}), J(e, o), Ve();
}
Sr([
	"change",
	"click",
	"input"
]);
//#endregion
//#region ui/NodeDetails.svelte
var Fo = /* @__PURE__ */ q("<small data-canonical-title=\"\" class=\"svelte-59ntjv\"> </small>"), Io = /* @__PURE__ */ q("<button type=\"button\" class=\"svelte-59ntjv\">Duplicate</button>"), Lo = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-detail-danger svelte-59ntjv\">Delete</button>"), Ro = /* @__PURE__ */ q("<details class=\"pc-detail-commands svelte-59ntjv\"><summary aria-label=\"Node commands\" title=\"Node commands\" class=\"svelte-59ntjv\">⋯</summary><div class=\"pc-detail-command-list svelte-59ntjv\"><!> <!></div></details>"), zo = /* @__PURE__ */ q("<p role=\"alert\" class=\"pc-detail-error svelte-59ntjv\"> </p>"), Bo = /* @__PURE__ */ q("<label class=\"svelte-59ntjv\">Workflow stage<select aria-label=\"Workflow stage\" class=\"svelte-59ntjv\"><option class=\"svelte-59ntjv\">Preparation · before Generate Reply</option><option class=\"svelte-59ntjv\">Response · after Generate Reply</option></select></label><!>", 1), Vo = /* @__PURE__ */ q("<p class=\"svelte-59ntjv\"><button type=\"button\" class=\"svelte-59ntjv\">Configure Fast connections…</button></p>"), Ho = /* @__PURE__ */ q("<span class=\"svelte-59ntjv\">Read-only body</span>"), Uo = /* @__PURE__ */ q("<span class=\"pc-detail-blocked svelte-59ntjv\">Blocks run · Disabled</span>"), Wo = /* @__PURE__ */ q("<p class=\"pc-detail-state svelte-59ntjv\"><!><!></p>"), Go = /* @__PURE__ */ q("<p class=\"pc-detail-error svelte-59ntjv\" role=\"alert\"> </p>"), Ko = /* @__PURE__ */ q("<option class=\"svelte-59ntjv\"> </option>"), qo = /* @__PURE__ */ q("<fieldset class=\"pc-detail-group svelte-59ntjv\" data-boundary-controls=\"\"><legend class=\"svelte-59ntjv\"> </legend> <label class=\"svelte-59ntjv\">Type<select aria-label=\"Subgraph port type\" class=\"svelte-59ntjv\"></select></label> <label class=\"pc-detail-check svelte-59ntjv\"><input aria-label=\"Required subgraph port\" type=\"checkbox\" class=\"svelte-59ntjv\"/> Required</label> <div class=\"pc-detail-actions svelte-59ntjv\"><button type=\"button\" data-save-boundary=\"\" class=\"svelte-59ntjv\"> </button></div> <small class=\"svelte-59ntjv\">Labels appear on the subgraph block. Disconnect incompatible connections before changing the type. Deleting this node removes its port and attached connections.</small> <!></fieldset>"), Jo = /* @__PURE__ */ q("<p role=\"status\" class=\"svelte-59ntjv\">Loading file…</p>"), Yo = /* @__PURE__ */ q("<div data-file-input-controls=\"\" class=\"svelte-59ntjv\"><label class=\"svelte-59ntjv\"> <input type=\"file\" accept=\".txt,.md,.json,text/plain,text/markdown,application/json\" class=\"svelte-59ntjv\"/></label> <p class=\"svelte-59ntjv\"> </p> <small class=\"svelte-59ntjv\">The file's UTF-8 text is embedded in this workflow. Runs use the saved snapshot; replace the file to refresh it.</small> <small class=\"svelte-59ntjv\">Choose a .txt, .md or .json file up to 400,000 bytes and 100,000 UTF-16 code units.</small> <!> <!></div>"), Xo = /* @__PURE__ */ q("<details class=\"pc-detail-group svelte-59ntjv\"><summary class=\"svelte-59ntjv\"> </summary> <!></details>"), Zo = /* @__PURE__ */ q("<fieldset class=\"pc-detail-group pc-detail-main svelte-59ntjv\" data-operation-controls=\"\"><!> <!></fieldset> <!>", 1), Qo = /* @__PURE__ */ q("<label class=\"svelte-59ntjv\">Model identifier<input class=\"svelte-59ntjv\"/></label>"), $o = /* @__PURE__ */ q("<small class=\"svelte-59ntjv\"> </small>"), es = /* @__PURE__ */ q("<fieldset class=\"svelte-59ntjv\"><legend class=\"svelte-59ntjv\"> </legend> <label class=\"svelte-59ntjv\">Connection profile<select class=\"svelte-59ntjv\"><option class=\"svelte-59ntjv\">Use helper connection</option><!><!></select></label> <label class=\"svelte-59ntjv\">Model mode<select class=\"svelte-59ntjv\"></select></label> <!> <small class=\"svelte-59ntjv\"> </small><small class=\"svelte-59ntjv\"> </small><!> <!></fieldset>"), ts = /* @__PURE__ */ q("<small class=\"svelte-59ntjv\">This helper has no text model calls to configure.</small>"), ns = /* @__PURE__ */ q("<details class=\"pc-detail-group svelte-59ntjv\" data-helper-model-controls=\"\" open=\"\"><summary class=\"svelte-59ntjv\">Helper model bindings</summary> <small class=\"svelte-59ntjv\">Choose a connection for each text model role in the pinned helper. These selections belong to this For Each node.</small> <!> <!></details>"), rs = /* @__PURE__ */ q("<label class=\"svelte-59ntjv\">Model identifier<input aria-label=\"Model identifier\" class=\"svelte-59ntjv\"/></label>"), is = /* @__PURE__ */ q("<details class=\"pc-detail-group svelte-59ntjv\" data-model-controls=\"\" open=\"\"><summary class=\"svelte-59ntjv\"> </summary> <label class=\"svelte-59ntjv\">Connection profile<select aria-label=\"Connection profile\" class=\"svelte-59ntjv\"><option class=\"svelte-59ntjv\">Choose a connection</option><!><!></select></label> <label class=\"svelte-59ntjv\">Model mode<select aria-label=\"Model mode\" class=\"svelte-59ntjv\"></select></label> <!> <details data-binding-advanced=\"\" class=\"svelte-59ntjv\"><summary class=\"svelte-59ntjv\">Advanced connection settings</summary> <label class=\"svelte-59ntjv\">Connection mode<select aria-label=\"Connection mode\" class=\"svelte-59ntjv\"></select></label> <label class=\"svelte-59ntjv\">Model role<input aria-label=\"Model role\" class=\"svelte-59ntjv\"/></label></details> <!><!> <!> <!></details>"), as = /* @__PURE__ */ q("<p class=\"pc-detail-port svelte-59ntjv\"> <small class=\"svelte-59ntjv\"> </small></p>"), os = /* @__PURE__ */ q("<details class=\"pc-detail-group svelte-59ntjv\"><summary class=\"svelte-59ntjv\">Inputs and outputs</summary><!></details>"), ss = /* @__PURE__ */ q("<p role=\"status\" class=\"svelte-59ntjv\"> </p>"), cs = /* @__PURE__ */ q("<header class=\"svelte-59ntjv\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-59ntjv\"><path class=\"svelte-59ntjv\"></path></svg> <div class=\"pc-detail-identity svelte-59ntjv\"><input class=\"pc-detail-name svelte-59ntjv\" aria-label=\"Node name\"/> <!> <small class=\"svelte-59ntjv\"> </small></div> <!></header> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>", 1), ls = /* @__PURE__ */ q("<p class=\"pc-detail-empty svelte-59ntjv\">Select a node to inspect its settings.</p>"), us = /* @__PURE__ */ q("<section class=\"pc-node-details svelte-59ntjv\" aria-label=\"Node details\"><!></section>");
function ds(e, t) {
	Be(t, !0);
	let n = (e, n = d) => {
		{
			let s = /* @__PURE__ */ I(() => W(a)[n().key]?.text ?? k(n())), c = /* @__PURE__ */ I(() => W(a)[n().key]?.error || W(o)[n().key] || ""), l = /* @__PURE__ */ I(() => !!t.view?.readOnly || !r().editControl), u = /* @__PURE__ */ I(() => !!W(a)[n().key]?.pending), d = /* @__PURE__ */ I(() => i() + "-" + n().key);
			fo(e, {
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
				ontext: (e) => M(n(), e),
				onvalue: (e) => re(n(), e),
				onnumber: (e) => ie(n(), e),
				onsave: () => ne(n())
			});
		}
	}, r = Oi(t, "actions", 19, () => ({})), i = Oi(t, "idPrefix", 3, "pc-node-details"), a = /* @__PURE__ */ R(Zt({})), o = /* @__PURE__ */ R(Zt({})), s = "", c = "", l = "", u = 0, f = 0, p = 0, h = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ R(!1), _ = 0, v = 0, y = 0, b = /* @__PURE__ */ new Map(), x = /* @__PURE__ */ new Map(), S = /* @__PURE__ */ new Map(), C = (e) => Object.fromEntries(Object.entries(e).map(([e, t]) => [e, {
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
	Ai(() => {
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
		(i || n !== c || r !== l) && ((i || r !== l) && (f++, y++), i && (p++, s && S.set(s, pr(() => C(W(a))))), s = e, c = n, l = r, h.clear(), u++, z(o, {}, !0), z(g, !1), v++, z(a, w(i ? S.get(e) ?? {} : pr(() => W(a)), t.view), !0));
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
	async function j(e, n, r) {
		let i = t.view;
		if (!i || (n ? !i.canPresent : e === "profileId" || e === "model" ? !he(i) : i.readOnly)) return;
		let s = D(i), c = ++u, l = p, d = A(i, e), f = W(a)[e] && d ? ee(e) : null;
		h.set(e, c), z(o, {
			...W(o),
			[e]: ""
		}, !0), W(a)[e] && z(a, {
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
			delete t[e], z(a, t, !0);
		}
		if (O(s) && h.get(e) === c && (h.delete(e), z(o, {
			...W(o),
			[e]: m
		}, !0), W(a)[e])) {
			if (m) z(a, {
				...W(a),
				[e]: {
					...W(a)[e],
					error: m,
					pending: !1
				}
			}, !0);
			else {
				let t = { ...W(a) };
				delete t[e], z(a, t, !0);
			}
		}
	}
	function te(e) {
		let n = e.files?.[0];
		e.value = "", n && t.view?.fileInput && !t.view.readOnly && r().loadFile && !W(a).fileInput?.pending && (z(a, {
			...W(a),
			fileInput: {
				text: "",
				error: "",
				pending: !1
			}
		}, !0), j("fileInput", !1, (e) => r().loadFile(e, n)));
	}
	function M(e, n) {
		t.view && !t.view.readOnly && (ee(e.key), h.delete(e.key), z(a, {
			...W(a),
			[e.key]: {
				text: n,
				error: "",
				pending: !1,
				editor: e.editor,
				representation: e.representation
			}
		}, !0), z(o, {
			...W(o),
			[e.key]: ""
		}, !0));
	}
	function ne(e) {
		if (!t.view || t.view.readOnly || !r().editControl) return;
		let n = W(a)[e.key]?.text ?? k(e), i = n;
		if (e.editor === "json") try {
			if (!(e.representation === "json-text" && e.allowEmpty && n.trim() === "")) {
				let t = JSON.parse(n);
				e.representation !== "json-text" && (i = t);
			}
		} catch {
			z(a, {
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
		j(e.key, !1, (t) => r().editControl(t, e.key, i));
	}
	function re(e, t) {
		r().editControl && j(e.key, !1, (n) => r().editControl(n, e.key, t));
	}
	function ie(e, n) {
		if (!t.view || t.view.readOnly || !r().editControl) return;
		let i = Number(n.value);
		!n.value.trim() || !Number.isFinite(i) ? z(o, {
			...W(o),
			[e.key]: "Enter a finite number before saving."
		}, !0) : n.validity.valid ? re(e, i) : z(o, {
			...W(o),
			[e.key]: "Enter a number within the allowed range and step."
		}, !0);
	}
	let ae = (e, t) => JSON.stringify([
		"helper-binding",
		e,
		t
	]), oe = (e) => t.view?.helperBindings?.roles.find((t) => t.role === e), se = () => !!t.view?.helperBindings?.editable && !t.view.readOnly && !!r().editHelperBinding, ce = (e) => W(a)[ae(e, "model")] ? "override" : oe(e)?.model.mode;
	function le(e, t, n, i) {
		se() && oe(e) && j(ae(e, t), !1, (a) => r().editHelperBinding(a, e, t, n, i));
	}
	function ue(e, n) {
		if (!se() || !oe(e)) return;
		let r = ae(e, "model");
		ee(r), h.delete(r), z(a, {
			...W(a),
			[r]: {
				text: n,
				error: "",
				pending: !1,
				helperKey: t.view?.helperBindings?.helperKey
			}
		}, !0), z(o, {
			...W(o),
			[r]: ""
		}, !0);
	}
	function de(e, t) {
		let n = oe(e);
		if (!se() || !n?.model.allowedModes.some((e) => e.value === t)) return;
		let r = ae(e, "model");
		if (t === "override") {
			ue(e, W(a)[r]?.text ?? n.model.value ?? "");
			return;
		}
		h.delete(r);
		let i = { ...W(a) };
		delete i[r], z(a, i, !0), z(o, {
			...W(o),
			[r]: ""
		}, !0), t !== n.model.mode && le(e, "model", t, null);
	}
	function fe(e, t) {
		if (!se() || ce(e) !== "override") return;
		ue(e, t);
		let n = ae(e, "model");
		!t.trim() || t.length > 256 ? z(o, {
			...W(o),
			[n]: "Enter a model identifier of 1–256 characters."
		}, !0) : le(e, "model", "override", t);
	}
	function pe(e, t, n) {
		me(e)?.allowedModes.some((e) => e.value === t) && r().editBinding && j(e, !1, (i) => r().editBinding(i, e, t, n));
	}
	let me = (e) => e === "profileId" ? t.view?.model?.profile : t.view?.model?.model, he = (e = t.view) => !!e?.model && (e.model.editable ?? !e.readOnly) && !!r().editBinding, ge = (e) => W(a)[e] ? "override" : me(e)?.mode, _e = (e) => W(a)[e]?.text ?? me(e)?.value ?? "", ve = () => {
		let e = t.view?.model?.profile;
		return W(a).profileId?.text ?? (e && Object.hasOwn(e, "effectiveValue") ? e.effectiveValue ?? "" : e?.value ?? "");
	}, ye = () => t.view?.model?.profile.mode === "override" || !!t.view?.model?.profileDefaultModel;
	function be(e, t) {
		he() && me(e)?.allowedModes.some((e) => e.value === "override") && (ee(e), h.delete(e), z(a, {
			...W(a),
			[e]: {
				text: t,
				error: "",
				pending: !1
			}
		}, !0), z(o, {
			...W(o),
			[e]: ""
		}, !0));
	}
	function xe(e, t) {
		let n = me(e);
		if (!he() || !n?.allowedModes.some((e) => e.value === t)) return;
		if (t === "override") {
			be(e, _e(e));
			return;
		}
		h.delete(e);
		let r = { ...W(a) };
		delete r[e], z(a, r, !0), z(o, {
			...W(o),
			[e]: ""
		}, !0), t !== n.mode && pe(e, t, null);
	}
	function Se(e, n) {
		if (he() && (e !== "model" || ge(e) === "override") && me(e)?.allowedModes.some((e) => e.value === "override")) {
			if (be(e, n), !n.trim()) {
				let r = t.view?.readOnly ? "block" : "inherit";
				if (e === "model" && ye() && me(e)?.allowedModes.some((e) => e.value === r)) {
					xe(e, r);
					return;
				}
				z(a, {
					...W(a),
					[e]: {
						text: n,
						error: e === "profileId" ? "Choose a connection before saving an override." : "Enter a model identifier before saving an override.",
						pending: !1
					}
				}, !0);
			} else pe(e, "override", n);
		}
	}
	let Ce = () => !!t.view?.modifiers?.editable && !t.view.readOnly && !!r().editModifiers, we = () => JSON.parse(JSON.stringify(t.view?.modifiers?.items ?? []));
	function Te(e) {
		let t = W(a)["modifier:" + e.id];
		if (t) try {
			return JSON.parse(t.text);
		} catch {}
		return e.settings;
	}
	let N = () => Object.fromEntries((t.view?.modifiers?.items ?? []).map((e) => {
		let t = W(a)["modifier:" + e.id];
		return [e.id, {
			settings: Te(e),
			error: t?.error || W(o)["modifier:" + e.id] || "",
			pending: !!t?.pending,
			dirty: !!t
		}];
	}));
	function Ee(e) {
		if (!Ce() || W(g) || e.length > 16 || !r().editModifiers) return;
		let t = ++v;
		z(g, !0), j("modifiers", !1, (t) => r().editModifiers(t, e)).finally(() => {
			t === v && z(g, !1);
		});
	}
	function P(e) {
		if (!Ce() || !t.view?.modifiers || t.view.modifiers.items.length >= 16) return;
		let n = t.view.modifiers.options.find((t) => t.type === e);
		if (!n) return;
		let r = we(), i;
		do
			i = `mod-${e.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 28)}-${Date.now().toString(36)}-${(++_).toString(36)}`;
		while (r.some((e) => e.id === i));
		Ee([...r, {
			id: i,
			type: e,
			version: 1,
			enabled: !0,
			settings: JSON.parse(JSON.stringify(n.defaultSettings))
		}]);
	}
	function De(e, n) {
		if (!Ce() || !t.view?.modifiers || !t.view.modifiers.options.some((t) => t.type === e)) return;
		let r = we();
		r.some((t) => t.type === e) ? Ee(r.map((t) => t.type === e ? {
			...t,
			enabled: n
		} : t)) : n && P(e);
	}
	function Oe(e, n) {
		Ce() && t.view?.modifiers?.items.some((t) => t.id === e) && Ee(we().map((t) => t.id === e ? {
			...t,
			enabled: n
		} : t));
	}
	function Ae(e) {
		Ce() && t.view?.modifiers?.items.some((t) => t.id === e) && Ee(we().filter((t) => t.id !== e));
	}
	function je(e, t) {
		if (!Ce()) return;
		let n = we(), r = n.findIndex((t) => t.id === e), i = r + t;
		r < 0 || i < 0 || i >= n.length || ([n[r], n[i]] = [n[i], n[r]], Ee(n));
	}
	function Me(e, n, r) {
		if (!Ce()) return;
		let i = t.view?.modifiers?.items.find((t) => t.id === e), s = t.view?.modifiers?.options.find((e) => e.type === i?.type);
		if (!i || !s?.fields.some((e) => e.key === n)) return;
		let c = "modifier:" + e;
		b.set(c, (b.get(c) ?? 0) + 1), h.delete(c), z(o, {
			...W(o),
			[c]: ""
		}, !0), z(a, {
			...W(a),
			[c]: {
				text: JSON.stringify({
					...Te(i),
					[n]: r
				}),
				error: "",
				pending: !1,
				modifierType: i.type
			}
		}, !0);
	}
	function Ne(e) {
		if (!Ce() || !r().editModifiers) return;
		let n = t.view?.modifiers?.items.find((t) => t.id === e), i = "modifier:" + e;
		if (!n || !W(a)[i] || W(a)[i].pending) return;
		let o = (b.get(i) ?? 0) + 1, s = y, c = n.type;
		b.set(i, o);
		let l = Te(n), u = we().map((t) => t.id === e ? {
			...t,
			settings: l
		} : t);
		j(i, !1, async (n) => {
			let l = await r().editModifiers(n, u);
			if (l.ok && E && t.view && T(t.view) === T(n) && y === s && b.get(i) === o && t.view.modifiers?.items.some((t) => t.id === e && t.type === c)) {
				let e = { ...W(a) };
				delete e[i], z(a, e, !0);
			}
			return l;
		});
	}
	let Pe = () => {
		let e = /* @__PURE__ */ new Map();
		for (let n of t.view?.controls ?? []) {
			let t = n.group && n.group !== "Main" ? n.group : n.advanced ? "Advanced" : "Main";
			e.set(t, [...e.get(t) ?? [], n]);
		}
		return [...e].sort(([e], [t]) => e === "Main" ? -1 : +(t === "Main"));
	}, Fe = (e) => e.some((e) => !!(W(a)[e.key]?.error || W(o)[e.key])), Ie = () => t.view?.model ? `Model connection · ${t.view.model.issue ? "Binding needs attention" : t.view.model.effective || "Choose a connection"}` : "";
	function Le(e) {
		t.view && !t.view.boundary && r().present && j("alias", !0, (n) => r().present(n, "alias", e === t.view?.canonicalTitle ? "" : e));
	}
	function Re() {
		return {
			label: W(a).boundary?.text ?? t.view?.boundary?.label ?? "",
			artifactKind: W(a).boundary?.artifactKind ?? t.view?.boundary?.kind ?? "",
			required: W(a).boundary?.required ?? t.view?.boundary?.required ?? !1
		};
	}
	function ze(e, n) {
		if (!t.view?.boundary || t.view.readOnly || !r().editInterface || e === "artifactKind" && !t.view.boundary.kinds.includes(String(n))) return;
		let i = {
			...Re(),
			[e]: n
		};
		f++, h.delete("boundary"), z(o, {
			...W(o),
			boundary: ""
		}, !0), z(a, {
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
	function He() {
		if (!t.view?.boundary || t.view.readOnly || !r().editInterface || W(a).boundary?.pending) return;
		let e = t.view.boundary.id, n = Re();
		if (!n.label.trim() || !t.view.boundary.kinds.includes(n.artifactKind)) return;
		let i = ++f;
		z(a, {
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
		}, !0), j("boundary", !1, async (o) => {
			let s = await r().editInterface(o, {
				kind: "update",
				id: e,
				...n
			});
			if (s.ok && E && t.view?.boundary?.id === e && T(t.view) === T(o) && f === i) {
				let e = { ...W(a) };
				delete e.boundary, z(a, e, !0);
			}
			return s;
		});
	}
	var Ue = us(), We = B(Ue), Ge = (e) => {
		var s = cs(), c = V(s);
		let l;
		var u = B(c), d = B(u);
		F(u);
		var f = H(u, 2), p = B(f);
		Q(p);
		var h = H(p, 2), _ = (e) => {
			var n = Fo(), r = B(n);
			F(n), U(() => Y(r, `Canonical type: ${t.view.canonicalTitle ?? ""}`)), J(e, n);
		};
		X(h, (e) => {
			!t.view.boundary && (t.view.alias || t.view.title || t.view.canonicalTitle) !== t.view.canonicalTitle && e(_);
		});
		var v = H(h, 2), y = B(v, !0);
		F(v), F(f);
		var b = H(f, 2), x = (e) => {
			var n = Ro(), i = H(B(n)), a = B(i), o = (e) => {
				var n = Io();
				U(() => n.disabled = t.view.readOnly), K("click", n, () => {
					t.view && !t.view.readOnly && r().duplicate?.(D(t.view));
				}), J(e, n);
			};
			X(a, (e) => {
				!t.view.boundary && r().duplicate && e(o);
			});
			var s = H(a, 2), c = (e) => {
				var n = Lo();
				U(() => n.disabled = t.view.readOnly), K("click", n, () => {
					t.view && !t.view.readOnly && r().remove?.(D(t.view));
				}), J(e, n);
			};
			X(s, (e) => {
				r().remove && e(c);
			}), F(i), F(n), J(e, n);
		};
		X(b, (e) => {
			(r().duplicate || r().remove) && e(x);
		}), F(c);
		var S = H(c, 2), C = (e) => {
			var n = Bo(), i = V(n), a = H(B(i)), s = B(a);
			s.value = s.__value = "pre";
			var c = H(s);
			c.value = c.__value = "post", F(a);
			var l;
			di(a), F(i);
			var u = H(i), d = (e) => {
				var t = zo(), n = B(t, !0);
				F(t), U(() => Y(n, W(o).phase)), J(e, t);
			};
			X(u, (e) => {
				W(o).phase && e(d);
			}), U(() => {
				a.disabled = t.view.readOnly || !r().editPhase, l !== (l = t.view.phase) && (a.value = (a.__value = t.view.phase) ?? "", ui(a, t.view.phase));
			}), K("change", a, (e) => {
				let t = e.currentTarget.value;
				j("phase", !1, (e) => r().editPhase(e, t));
			}), J(e, n);
		};
		X(S, (e) => {
			t.view.phaseEditable && e(C);
		});
		var w = H(S, 2), T = (e) => {
			{
				let n = /* @__PURE__ */ I(() => ({
					queue: () => r().queueRecall?.(D(t.view)) ?? {
						ok: !1,
						error: {
							code: "RECALL_UNAVAILABLE",
							message: "Memory recall is unavailable."
						}
					},
					cancel: () => r().cancelRecall?.(D(t.view)) ?? {
						ok: !1,
						error: {
							code: "RECALL_UNAVAILABLE",
							message: "Memory recall is unavailable."
						}
					},
					revealShortcut: r().revealRecallShortcut
				}));
				vo(e, {
					get view() {
						return t.view.recall;
					},
					get actions() {
						return W(n);
					}
				});
			}
		};
		X(w, (e) => {
			t.view.recall && e(T);
		});
		var E = H(w, 2), O = (e) => {
			var t = Vo(), n = B(t);
			F(t), U(() => n.disabled = !r().openFastConnections), K("click", n, () => r().openFastConnections?.()), J(e, t);
		};
		X(E, (e) => {
			t.view.operation === "fast-decision" && e(O);
		});
		var k = H(E, 2), A = (e) => {
			var n = Wo(), r = B(n), i = (e) => {
				J(e, Ho());
			};
			X(r, (e) => {
				t.view.readOnly && e(i);
			});
			var a = H(r), o = (e) => {
				J(e, Uo());
			};
			X(a, (e) => {
				t.view.enabled || e(o);
			}), F(n), J(e, n);
		};
		X(k, (e) => {
			(t.view.readOnly || !t.view.enabled) && e(A);
		});
		var ee = H(k, 2), M = (e) => {
			var t = Go(), n = B(t, !0);
			F(t), U(() => Y(n, W(o).alias)), J(e, t);
		};
		X(ee, (e) => {
			W(o).alias && e(M);
		});
		var ne = H(ee, 2), re = (e) => {
			var n = qo(), i = B(n), s = B(i);
			F(i);
			var c = H(i, 2), l = H(B(c));
			Z(l, 21, () => t.view.boundary.kinds, Ur, (e, t) => {
				var n = Ko(), r = B(n, !0);
				F(n);
				var i = {};
				U(() => {
					Y(r, W(t)), i !== (i = W(t)) && (n.value = (n.__value = W(t)) ?? "");
				}), J(e, n);
			}), F(l);
			var u;
			di(l), F(c);
			var d = H(c, 2), f = B(d);
			Q(f), ke(), F(d);
			var p = H(d, 2), m = B(p), h = B(m, !0);
			F(m), F(p);
			var g = H(p, 4), _ = (e) => {
				var t = Go(), n = B(t, !0);
				F(t), U(() => Y(n, W(a).boundary?.error || W(o).boundary)), J(e, t);
			};
			X(g, (e) => {
				(W(a).boundary?.error || W(o).boundary) && e(_);
			}), F(n), U((e, n, i) => {
				Y(s, `Subgraph ${t.view.boundary.direction ?? ""}`), l.disabled = t.view.readOnly || !r().editInterface, u !== (u = e) && (l.value = (l.__value = e) ?? "", ui(l, e)), yi(f, n), f.disabled = t.view.readOnly || !r().editInterface, m.disabled = i, Y(h, W(a).boundary?.pending ? "Validating…" : "Save port");
			}, [
				() => Re().artifactKind,
				() => Re().required,
				() => t.view.readOnly || !r().editInterface || !Re().label.trim() || !!W(a).boundary?.pending
			]), K("change", l, (e) => ze("artifactKind", e.currentTarget.value)), K("change", f, (e) => ze("required", e.currentTarget.checked)), K("click", m, () => He()), J(e, n);
		};
		X(ne, (e) => {
			t.view.boundary && e(re);
		});
		var ie = H(ne, 2), oe = (e) => {
			var s = Zo(), c = V(s), l = B(c), u = (e) => {
				var n = Yo(), s = B(n), c = B(s, !0), l = H(c);
				F(s);
				var u = H(s, 2), d = B(u, !0);
				F(u);
				var f = H(u, 6), p = (e) => {
					J(e, Jo());
				};
				X(f, (e) => {
					W(a).fileInput?.pending && e(p);
				});
				var m = H(f, 2), h = (e) => {
					var t = Go(), n = B(t, !0);
					F(t), U(() => {
						$(t, "id", i() + "-error-fileInput"), Y(n, W(o).fileInput);
					}), J(e, t);
				};
				X(m, (e) => {
					W(o).fileInput && e(h);
				}), F(n), U(() => {
					Y(c, t.view.fileInput.loaded ? "Replace file" : "Choose file"), $(l, "aria-label", t.view.fileInput.loaded ? "Replace file" : "Choose file"), l.disabled = t.view.readOnly || !r().loadFile || !!W(a).fileInput?.pending, $(l, "aria-invalid", !!W(o).fileInput), $(l, "aria-describedby", W(o).fileInput ? i() + "-error-fileInput" : void 0), Y(d, t.view.fileInput.loaded ? "Loaded file: " + t.view.fileInput.fileName : "No file loaded.");
				}), K("change", l, (e) => te(e.currentTarget)), J(e, n);
			};
			X(l, (e) => {
				t.view.fileInput && e(u);
			}), Z(H(l, 2), 17, () => Pe().filter(([e]) => e === "Main"), ([e, t]) => e, (e, t) => {
				var r = /* @__PURE__ */ I(() => m(W(t), 2));
				let i = () => W(r)[1];
				var a = Nr();
				Z(V(a), 17, i, (e) => e.key, (e, t) => {
					n(e, () => W(t));
				}), J(e, a);
			}), F(c), Z(H(c, 2), 17, () => Pe().filter(([e]) => e !== "Main"), ([e, t]) => e, (e, t) => {
				var r = /* @__PURE__ */ I(() => m(W(t), 2));
				let i = () => W(r)[0], a = () => W(r)[1];
				var o = Xo(), s = B(o), c = B(s, !0);
				F(s), Z(H(s, 2), 17, a, (e) => e.key, (e, t) => {
					n(e, () => W(t));
				}), F(o), U((e) => {
					$(o, "data-control-group", i()), o.open = e, Y(c, i());
				}, [() => Fe(a())]), J(e, o);
			}), J(e, s);
		};
		X(ie, (e) => {
			t.view.boundary || e(oe);
		});
		var pe = H(ie, 2), me = (e) => {
			var n = ns(), r = H(B(n), 4);
			Z(r, 17, () => t.view.helperBindings.roles, (e) => e.role, (e, t) => {
				var n = es(), r = B(n), i = B(r, !0);
				F(r);
				var s = H(r, 2), c = H(B(s)), l = B(c);
				l.value = l.__value = "";
				var u = H(l), d = (e) => {
					var n = Ko(), r = B(n);
					F(n);
					var i = {};
					U(() => {
						Y(r, `Unavailable connection · ${W(t).profile.value ?? ""}`), i !== (i = W(t).profile.value) && (n.value = (n.__value = W(t).profile.value) ?? "");
					}), J(e, n);
				}, f = /* @__PURE__ */ I(() => W(t).profile.value && !(W(t).profile.options ?? []).some((e) => e.value === W(t).profile.value));
				X(u, (e) => {
					W(f) && e(d);
				}), Z(H(u), 17, () => W(t).profile.options ?? [], (e) => e.value, (e, t) => {
					var n = Ko(), r = B(n, !0);
					F(n);
					var i = {};
					U(() => {
						Y(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
					}), J(e, n);
				}), F(c);
				var p;
				di(c), F(s);
				var m = H(s, 2), h = H(B(m));
				Z(h, 21, () => W(t).model.allowedModes, (e) => e.value, (e, t) => {
					var n = Ko(), r = B(n, !0);
					F(n);
					var i = {};
					U(() => {
						Y(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
					}), J(e, n);
				}), F(h);
				var g;
				di(h), F(m);
				var _ = H(m, 2), v = (e) => {
					var n = Qo(), r = H(B(n));
					Q(r), F(n), U((e, n) => {
						$(r, "aria-label", W(t).role + " model identifier"), vi(r, e), r.disabled = n;
					}, [() => W(a)[ae(W(t).role, "model")]?.text ?? W(t).model.value ?? "", () => !se()]), K("input", r, (e) => ue(W(t).role, e.currentTarget.value)), K("change", r, (e) => fe(W(t).role, e.currentTarget.value)), J(e, n);
				}, y = /* @__PURE__ */ I(() => ce(W(t).role) === "override");
				X(_, (e) => {
					W(y) && e(v);
				});
				var b = H(_, 2), x = B(b);
				F(b);
				var S = H(b), C = B(S, !0);
				F(S);
				var w = H(S), T = (e) => {
					var n = $o(), r = B(n, !0);
					F(n), U(() => Y(r, W(t).caveat)), J(e, n);
				};
				X(w, (e) => {
					W(t).caveat && e(T);
				});
				var E = H(w, 2), D = (e) => {
					var n = Go(), r = B(n, !0);
					F(n), U((e) => Y(r, e), [() => W(o)[ae(W(t).role, "profileId")] || W(o)[ae(W(t).role, "model")]]), J(e, n);
				}, O = /* @__PURE__ */ I(() => W(o)[ae(W(t).role, "profileId")] || W(o)[ae(W(t).role, "model")]);
				X(E, (e) => {
					W(O) && e(D);
				}), F(n), U((e, n, r) => {
					Y(i, W(t).label), $(c, "aria-label", W(t).role + " connection profile"), c.disabled = e, p !== (p = W(t).profile.value ?? "") && (c.value = (c.__value = W(t).profile.value ?? "") ?? "", ui(c, W(t).profile.value ?? "")), $(h, "aria-label", W(t).role + " model mode"), h.disabled = n, g !== (g = r) && (h.value = (h.__value = r) ?? "", ui(h, r)), Y(x, `Effective connection: ${W(t).effective ?? ""}`), Y(C, W(t).source);
				}, [
					() => !se(),
					() => !se(),
					() => ce(W(t).role)
				]), K("change", c, (e) => le(W(t).role, "profileId", e.currentTarget.value ? "override" : "inherit", e.currentTarget.value || null)), K("change", h, (e) => de(W(t).role, e.currentTarget.value)), J(e, n);
			});
			var i = H(r, 2), s = (e) => {
				var n = Go(), r = B(n, !0);
				F(n), U(() => Y(r, t.view.helperBindings.issue)), J(e, n);
			}, c = (e) => {
				J(e, ts());
			};
			X(i, (e) => {
				t.view.helperBindings.issue ? e(s) : t.view.helperBindings.roles.length || e(c, 1);
			}), F(n), J(e, n);
		};
		X(pe, (e) => {
			t.view.helperBindings && e(me);
		});
		var we = H(pe, 2), Te = (e) => {
			var n = is(), i = B(n), s = B(i, !0);
			F(i);
			var c = H(i, 2), l = H(B(c)), u = B(l);
			u.value = u.__value = "";
			var d = H(u), f = (e) => {
				var t = Ko(), n = B(t);
				F(t);
				var r = {};
				U((e, i) => {
					Y(n, `Unavailable connection · ${e ?? ""}`), r !== (r = i) && (t.value = (t.__value = i) ?? "");
				}, [() => ve(), () => ve()]), J(e, t);
			}, p = /* @__PURE__ */ I(() => ve() && !(t.view.model.profile.options ?? []).some((e) => e.value === ve()));
			X(d, (e) => {
				W(p) && e(f);
			}), Z(H(d), 17, () => t.view.model.profile.options ?? [], (e) => e.value, (e, t) => {
				var n = Ko(), r = B(n, !0);
				F(n);
				var i = {};
				U(() => {
					Y(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
				}), J(e, n);
			}), F(l);
			var m;
			di(l), F(c);
			var h = H(c, 2), g = H(B(h));
			Z(g, 21, () => t.view.model.model.allowedModes, (e) => e.value, (e, n) => {
				var r = Ko(), i = B(r, !0);
				F(r);
				var a = {};
				U((e) => {
					Y(i, e), a !== (a = W(n).value) && (r.value = (r.__value = W(n).value) ?? "");
				}, [() => W(n).value === "inherit" && !t.view.readOnly ? ye() || !t.view.model.model.effectiveValue ? "Use profile model" : "Existing role model" : W(n).label]), J(e, r);
			}), F(g);
			var _;
			di(g), F(h);
			var v = H(h, 2), y = (e) => {
				var t = rs(), n = H(B(t));
				Q(n), F(t), U((e, t) => {
					vi(n, e), n.disabled = t;
				}, [() => _e("model"), () => !he()]), K("input", n, (e) => be("model", e.currentTarget.value)), K("change", n, (e) => Se("model", e.currentTarget.value)), J(e, t);
			}, b = /* @__PURE__ */ I(() => ge("model") === "override");
			X(v, (e) => {
				W(b) && e(y);
			});
			var x = H(v, 2), S = H(B(x), 2), C = H(B(S));
			Z(C, 21, () => t.view.model.profile.allowedModes, (e) => e.value, (e, t) => {
				var n = Ko(), r = B(n, !0);
				F(n);
				var i = {};
				U(() => {
					Y(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
				}), J(e, n);
			}), F(C);
			var w;
			di(C), F(S);
			var T = H(S, 2), E = H(B(T));
			Q(E), F(T), F(x);
			var D = H(x, 2), O = (e) => {
				var n = $o(), r = B(n);
				F(n), U(() => Y(r, `Effective connection: ${t.view.model.effective ?? ""}`)), J(e, n);
			}, k = /* @__PURE__ */ I(() => !t.view.model.issue || t.view.model.effective.trim() !== t.view.model.issue.trim());
			X(D, (e) => {
				W(k) && e(O);
			});
			var A = H(D), ee = (e) => {
				var n = $o(), r = B(n, !0);
				F(n), U(() => Y(r, t.view.model.source)), J(e, n);
			};
			X(A, (e) => {
				t.view.model.source && e(ee);
			});
			var te = H(A, 2), M = (e) => {
				var n = Go(), r = B(n, !0);
				F(n), U(() => Y(r, t.view.model.issue)), J(e, n);
			};
			X(te, (e) => {
				t.view.model.issue && e(M);
			});
			var ne = H(te, 2), re = (e) => {
				var t = Go(), n = B(t, !0);
				F(t), U(() => Y(n, W(o).modelRole || W(a).profileId?.error || W(o).profileId || W(a).model?.error || W(o).model)), J(e, t);
			};
			X(ne, (e) => {
				(W(o).modelRole || W(a).profileId?.error || W(o).profileId || W(a).model?.error || W(o).model) && e(re);
			}), F(n), U((e, n, i, a, o, c, u) => {
				Y(s, e), l.disabled = n, m !== (m = i) && (l.value = (l.__value = i) ?? "", ui(l, i)), g.disabled = a, _ !== (_ = o) && (g.value = (g.__value = o) ?? "", ui(g, o)), C.disabled = c, w !== (w = u) && (C.value = (C.__value = u) ?? "", ui(C, u)), vi(E, t.view.model.role), E.disabled = t.view.readOnly || !t.view.model.roleEditable || !r().editField;
			}, [
				() => Ie(),
				() => !he() || !t.view.model.profile.allowedModes.some((e) => e.value === "override"),
				() => ve(),
				() => !he(),
				() => ge("model"),
				() => !he(),
				() => ge("profileId")
			]), K("change", l, (e) => Se("profileId", e.currentTarget.value)), K("change", g, (e) => xe("model", e.currentTarget.value)), K("change", C, (e) => xe("profileId", e.currentTarget.value)), K("change", E, (e) => {
				let n = e.currentTarget.value;
				t.view?.model?.roleEditable && r().editField && j("modelRole", !1, (e) => r().editField(e, "modelRole", n));
			}), J(e, n);
		};
		X(we, (e) => {
			t.view.model && e(Te);
		});
		var Ee = H(we, 2), Be = (e) => {
			var n = os();
			Z(H(B(n)), 17, () => t.view.ports, (e) => e.direction + ":" + e.id, (e, t) => {
				var n = as(), r = B(n), i = H(r), a = B(i, !0);
				F(i), F(n), U(() => {
					Y(r, `${W(t).direction === "input" ? "In" : "Out"} · ${W(t).label ?? ""}`), Y(a, W(t).kind);
				}), J(e, n);
			}), F(n), J(e, n);
		};
		X(Ee, (e) => {
			t.view.ports.length && e(Be);
		});
		var Ve = H(Ee, 2), Ue = (e) => {
			var n = ss(), r = B(n, !0);
			F(n), U(() => Y(r, t.view.status)), J(e, n);
		};
		X(Ve, (e) => {
			t.view.status && e(Ue);
		});
		var We = H(Ve, 2);
		Z(We, 17, () => t.view.issues ?? [], Ur, (e, t) => {
			var n = Go(), r = B(n, !0);
			F(n), U(() => Y(r, W(t))), J(e, n);
		});
		var Ge = H(We, 2), Ke = (e) => {
			{
				let n = /* @__PURE__ */ I(() => !Ce()), r = /* @__PURE__ */ I(N), a = /* @__PURE__ */ I(() => W(o).modifiers || "");
				Po(e, {
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
					onquick: De,
					onadd: P,
					onenable: Oe,
					onremove: Ae,
					onmove: je,
					ondraft: Me,
					onsave: Ne
				});
			}
		};
		X(Ge, (e) => {
			t.view.modifiers && e(Ke);
		}), U((e) => {
			l = li(c, "", l, { "--pc-detail-family": t.view.familyColor ?? "var(--pc-accent)" }), $(d, "d", t.view.iconPath), $(p, "id", i() + "-name"), $(p, "maxlength", t.view.boundary ? void 0 : 80), vi(p, e), p.disabled = t.view.boundary ? t.view.readOnly || !r().editInterface : !t.view.canPresent || !r().present, Y(y, t.view.boundary ? "Subgraph " + t.view.boundary.direction : t.view.family + " · " + t.view.phase + " phase");
		}, [() => t.view.boundary ? Re().label : t.view.alias || t.view.title || t.view.canonicalTitle]), K("input", p, (e) => {
			t.view?.boundary && ze("label", e.currentTarget.value);
		}), K("change", p, (e) => {
			t.view?.boundary || Le(e.currentTarget.value);
		}), J(e, s);
	}, Ke = (e) => {
		J(e, ls());
	};
	X(We, (e) => {
		t.view ? e(Ge) : e(Ke, -1);
	}), F(Ue), J(e, Ue), Ve();
}
Sr([
	"input",
	"change",
	"click"
]);
//#endregion
//#region ui/CommentDetails.svelte
var fs = /* @__PURE__ */ q("<p class=\"pc-detail-meta svelte-17djc3u\">Read-only comment</p>"), ps = /* @__PURE__ */ q("<section class=\"pc-comment-details svelte-17djc3u\" aria-label=\"Comment details\"><h3 class=\"svelte-17djc3u\">Comment</h3> <!> <fieldset class=\"pc-detail-group svelte-17djc3u\"><legend class=\"svelte-17djc3u\">Comment</legend> <label class=\"svelte-17djc3u\">Title<input aria-label=\"Comment title\" class=\"svelte-17djc3u\"/></label> <label class=\"svelte-17djc3u\">Notes<textarea aria-label=\"Comment notes\" rows=\"5\" class=\"svelte-17djc3u\"></textarea></label> <label class=\"pc-comment-color-label svelte-17djc3u\">Color<input aria-label=\"Comment color\" type=\"color\" class=\"svelte-17djc3u\"/></label> <label class=\"pc-detail-check svelte-17djc3u\"><input aria-label=\"Move contents\" type=\"checkbox\" class=\"svelte-17djc3u\"/> Move contents</label> <small class=\"svelte-17djc3u\">Moves fully contained nodes when you drag the comment header.</small></fieldset> <div class=\"pc-comment-commands svelte-17djc3u\"><button type=\"button\" class=\"pc-btn svelte-17djc3u\">Fit to contents</button> <button type=\"button\" class=\"pc-btn pc-danger svelte-17djc3u\">Delete comment</button></div> <small class=\"svelte-17djc3u\">Deleting this comment keeps its contents.</small></section>");
function ms(e, t) {
	Be(t, !0);
	let n = Oi(t, "readOnly", 3, !1), r = /* @__PURE__ */ I(() => n() || t.comment.readOnly), i = (e) => e.stopPropagation();
	function a(e) {
		W(r) || t.onPatch(e);
	}
	function o(e) {
		W(r) || t.onCommand(e);
	}
	var s = ps(), c = H(B(s), 2), l = (e) => {
		J(e, fs());
	};
	X(c, (e) => {
		W(r) && e(l);
	});
	var u = H(c, 2), d = H(B(u), 2), f = H(B(d));
	Q(f), F(d);
	var p = H(d, 2), m = H(B(p));
	nt(m), F(p);
	var h = H(p, 2), g = H(B(h));
	Q(g), F(h);
	var _ = H(h, 2), v = B(_);
	Q(v), ke(), F(_), ke(2), F(u);
	var y = H(u, 2), b = B(y), x = H(b, 2);
	F(y), ke(2), F(s), U(() => {
		u.disabled = W(r), vi(f, t.comment.title), f.disabled = W(r), vi(m, t.comment.content), m.disabled = W(r), vi(g, t.comment.color), g.disabled = W(r), yi(v, t.comment.moveContents), v.disabled = W(r), b.disabled = W(r), x.disabled = W(r);
	}), G("keydown", f, i, !0), K("change", f, (e) => a({ title: e.currentTarget.value })), G("keydown", m, i, !0), K("change", m, (e) => a({ content: e.currentTarget.value })), K("change", g, (e) => a({ color: e.currentTarget.value })), K("change", v, (e) => a({ moveContents: e.currentTarget.checked })), K("click", b, () => o("fit")), K("click", x, () => o("delete")), J(e, s), Ve();
}
Sr(["change", "click"]);
//#endregion
//#region ui/OutputPreview.svelte
var hs = /* @__PURE__ */ q("<option class=\"svelte-ee2ehy\"> </option>"), gs = /* @__PURE__ */ q("<label class=\"pc-preview-choice svelte-ee2ehy\"><span class=\"pc-preview-sr-only svelte-ee2ehy\">Preview output</span><select aria-label=\"Preview output\" class=\"svelte-ee2ehy\"><option disabled=\"\" class=\"svelte-ee2ehy\">Choose an output</option><!></select></label>"), _s = /* @__PURE__ */ q("<button type=\"button\" class=\"svelte-ee2ehy\">Collapse preview</button>"), vs = /* @__PURE__ */ q("<button type=\"button\" role=\"tab\" class=\"svelte-ee2ehy\"> </button>"), ys = /* @__PURE__ */ q("<div class=\"pc-preview-tabs svelte-ee2ehy\" role=\"tablist\" aria-label=\"Recorded artifacts\"></div>"), bs = /* @__PURE__ */ q("<p class=\"pc-preview-note svelte-ee2ehy\"> </p>"), xs = /* @__PURE__ */ q("<pre class=\"svelte-ee2ehy\"> </pre>"), Ss = /* @__PURE__ */ q("<small class=\"pc-preview-note svelte-ee2ehy\"> </small>"), Cs = /* @__PURE__ */ q("<div role=\"tabpanel\" tabindex=\"0\" class=\"svelte-ee2ehy\"><article class=\"svelte-ee2ehy\"><div class=\"pc-preview-section-heading svelte-ee2ehy\"><span class=\"svelte-ee2ehy\"> </span><small class=\"svelte-ee2ehy\"> </small></div> <!> <!></article></div>"), ws = /* @__PURE__ */ q("<p class=\"pc-preview-empty svelte-ee2ehy\"> </p>"), Ts = /* @__PURE__ */ q("<section aria-label=\"Accepted consequences\" class=\"pc-preview-settlement svelte-ee2ehy\"><strong class=\"svelte-ee2ehy\"> </strong> <!></section>"), Es = /* @__PURE__ */ q("<p class=\"pc-preview-error svelte-ee2ehy\"> </p>"), Ds = /* @__PURE__ */ q("<button type=\"button\" data-run-here=\"\" title=\"Runs the selected output's dependencies. Results are diagnostic previews.\" class=\"svelte-ee2ehy\"> </button>"), Os = /* @__PURE__ */ q("<button type=\"button\" data-preview-apply=\"\" class=\"svelte-ee2ehy\"> </button><button type=\"button\" class=\"svelte-ee2ehy\"> </button>", 1), ks = /* @__PURE__ */ q("<header class=\"svelte-ee2ehy\"><h3 class=\"svelte-ee2ehy\"> </h3> <!> <div class=\"pc-preview-tools svelte-ee2ehy\"><button type=\"button\" class=\"svelte-ee2ehy\">Follow selection</button><button type=\"button\" class=\"svelte-ee2ehy\"> </button><!></div></header> <!> <div class=\"pc-preview-sections svelte-ee2ehy\"><!> <!> <!> <!> <!> <!> <!> <!></div> <footer class=\"svelte-ee2ehy\"><span class=\"pc-preview-status svelte-ee2ehy\"> </span> <span class=\"svelte-ee2ehy\"> </span> <!> <!></footer>", 1), As = /* @__PURE__ */ q("<p class=\"pc-preview-empty svelte-ee2ehy\">Select a node output to inspect its recorded result.</p>"), js = /* @__PURE__ */ q("<section class=\"pc-output-preview svelte-ee2ehy\" aria-label=\"Output preview\"><!></section>");
function Ms(e, t) {
	let n = Pr();
	Be(t, !0);
	let r = Oi(t, "actions", 19, () => ({})), i = /* @__PURE__ */ I(() => JSON.stringify([t.view?.sourceKey, t.view?.selectedKey])), a = /* @__PURE__ */ R(Zt({
		scope: "",
		id: null
	})), o = /* @__PURE__ */ I(() => (W(a).scope === W(i) ? t.view?.sections.find((e) => e.id === W(a).id) : null) ?? t.view?.sections[0] ?? null);
	yn(() => {
		let e = W(a).scope === W(i) && t.view?.sections.some((e) => e.id === W(a).id) ? W(a).id : t.view?.sections[0]?.id ?? null;
		(W(a).scope !== W(i) || W(a).id !== e) && z(a, {
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
		z(a, {
			scope: W(i),
			id: r[o].id
		}, !0), e.currentTarget.parentElement?.querySelectorAll("[role=\"tab\"]")[o]?.focus();
	}
	let l = /* @__PURE__ */ I(() => t.view?.choices.find((e) => e.key === t.view?.selectedKey) ?? null), u = (e) => ({
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
	}, p = /* @__PURE__ */ I(() => !!(t.view && W(l) && t.view.status !== "removed" && !t.view.busy && t.view.runHere?.enabled && r().runHere)), m = /* @__PURE__ */ I(() => !!(t.view && W(l) && t.view.review?.mode === "root" && t.view.review.selectedRootTerminal && "kind" in W(l).target && W(l).target.address.instancePath.length === 0 && d(W(l).target) === d(t.view.review.selector.terminal))), h = /* @__PURE__ */ I(() => !!(t.view && t.view.status === "current" && !t.view.busy && W(m) && t.view.review?.fresh && t.view.review.canApply && r().apply)), g = /* @__PURE__ */ I(() => !!(t.view && !t.view.busy && W(m) && r().reject));
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
	var y = js(), b = B(y), x = (e) => {
		var d = ks(), m = V(d), y = B(m), b = B(y, !0);
		F(y);
		var x = H(y, 2), S = (e) => {
			var n = gs(), i = H(B(n)), a = B(i);
			a.value = a.__value = "", Z(H(a), 17, () => t.view.choices, (e) => e.key, (e, t) => {
				var n = hs(), r = B(n);
				F(n);
				var i = {};
				U(() => {
					Y(r, `${W(t).label ?? ""} · ${W(t).kind ?? ""}`), i !== (i = W(t).key) && (n.value = (n.__value = W(t).key) ?? "");
				}), J(e, n);
			}), F(i);
			var o;
			di(i), F(n), U(() => {
				i.disabled = !r().select, o !== (o = t.view.selectedKey ?? "") && (i.value = (i.__value = t.view.selectedKey ?? "") ?? "", ui(i, t.view.selectedKey ?? ""));
			}), K("change", i, (e) => _(e.currentTarget.value)), J(e, n);
		};
		X(x, (e) => {
			t.view.choices.length && e(S);
		});
		var C = H(x, 2), w = B(C), T = H(w), E = B(T, !0);
		F(T);
		var D = H(T), O = (e) => {
			var n = _s();
			K("click", n, function(...e) {
				t.collapse?.apply(this, e);
			}), J(e, n);
		};
		X(D, (e) => {
			t.collapse && e(O);
		}), F(C), F(m);
		var k = H(m, 2), A = (e) => {
			var r = ys();
			Z(r, 23, () => t.view.sections, (e) => e.id, (e, t, r) => {
				var l = vs(), u = B(l, !0);
				F(l), U((e) => {
					$(l, "id", e), $(l, "aria-selected", W(o)?.id === W(t).id), $(l, "aria-controls", n + "-panel"), $(l, "tabindex", W(o)?.id === W(t).id ? 0 : -1), Y(u, W(t).label);
				}, [() => s(W(t).id)]), K("click", l, () => {
					z(a, {
						scope: W(i),
						id: W(t).id
					}, !0);
				}), G("keydown", l, (e) => c(e, W(r)), !0), J(e, l);
			}), F(r), J(e, r);
		};
		X(k, (e) => {
			t.view.sections.length && e(A);
		});
		var ee = H(k, 2), j = B(ee), te = (e) => {
			let t = /* @__PURE__ */ I(() => W(o));
			var r = Cs(), i = B(r), a = B(i), c = B(a), l = B(c, !0);
			F(c);
			var u = H(c), d = B(u, !0);
			F(u), F(a);
			var f = H(a, 2), p = (e) => {
				var n = bs(), r = B(n, !0);
				F(n), U(() => Y(r, W(t).text)), J(e, n);
			}, m = (e) => {
				var n = xs(), r = B(n, !0);
				F(n), U(() => Y(r, W(t).text)), J(e, n);
			};
			X(f, (e) => {
				W(t).format === "omitted" ? e(p) : e(m, -1);
			});
			var h = H(f, 2), g = (e) => {
				var n = Ss(), r = B(n);
				F(n), U(() => Y(r, `Truncated diagnostic${W(t).format === "json-prefix-text" ? " · JSON prefix shown as text" : ""}`)), J(e, n);
			};
			X(h, (e) => {
				W(t).truncated && e(g);
			}), F(i), F(r), U((e) => {
				$(r, "id", n + "-panel"), $(r, "aria-labelledby", e), $(i, "data-artifact-kind", W(t).kind), Y(l, W(t).label), Y(d, W(t).kind);
			}, [() => s(W(t).id)]), G("keydown", r, (e) => e.stopPropagation(), !0), G("paste", r, (e) => e.stopPropagation(), !0), J(e, r);
		}, M = (e) => {
			var n = ws(), r = B(n, !0);
			F(n), U(() => Y(r, t.view.status === "not-run" ? "Run this workflow or use Run to here to inspect an output." : "No recorded artifact is available for this output.")), J(e, n);
		};
		X(j, (e) => {
			W(o) ? e(te) : e(M, -1);
		});
		var ne = H(j, 2), re = (e) => {
			var n = Ts(), r = B(n), i = B(r);
			F(r), Z(H(r, 2), 17, () => t.view.settlement.receipts, (e) => e.intentId + ":" + e.targetId, (e, t) => {
				var n = bs(), r = B(n);
				F(n), U(() => Y(r, `${W(t).targetId ?? ""} · ${W(t).status ?? ""}${W(t).error ? " · " + W(t).error.message : ""}`)), J(e, n);
			}), F(n), U(() => Y(i, `Accepted consequences · ${t.view.settlement.status === "settled" ? "Saved" : t.view.settlement.status === "partial" ? "Some targets failed" : "Save confirmation needed"}`)), J(e, n);
		};
		X(ne, (e) => {
			t.view.settlement && e(re);
		});
		var ie = H(ne, 2), ae = (e) => {
			var n = bs(), r = B(n, !0);
			F(n), U(() => Y(r, t.view.statusDetail)), J(e, n);
		};
		X(ie, (e) => {
			t.view.statusDetail && e(ae);
		});
		var oe = H(ie, 2);
		Z(oe, 17, () => t.view.sections.filter((e) => e.id !== W(o)?.id && (e.format === "omitted" || e.truncated)), (e) => e.id, (e, t) => {
			var n = bs(), r = B(n);
			F(n), U(() => Y(r, `${W(t).label ?? ""}: ${(W(t).format === "omitted" ? W(t).text : "Truncated diagnostic" + (W(t).format === "json-prefix-text" ? " · JSON prefix shown as text" : "")) ?? ""}`)), J(e, n);
		});
		var se = H(oe, 2), ce = (e) => {
			var n = bs(), r = B(n, !0);
			F(n), U(() => Y(r, t.view.runHere.issue)), J(e, n);
		};
		X(se, (e) => {
			t.view.runHere?.issue && e(ce);
		});
		var le = H(se, 2);
		Z(le, 17, () => t.view.issues, Ur, (e, t) => {
			var n = Es(), r = B(n, !0);
			F(n), U(() => Y(r, W(t))), J(e, n);
		});
		var ue = H(le, 2), de = (e) => {
			var n = Es(), r = B(n, !0);
			F(n), U(() => Y(r, t.view.review.issue)), J(e, n);
		};
		X(ue, (e) => {
			t.view.review?.issue && e(de);
		});
		var fe = H(ue, 2), pe = (e) => {
			var n = Ss(), r = B(n, !0);
			F(n), U(() => Y(r, t.view.review.persistOnly ? "Retry keeps the accepted reply and retries failed targets. No model request is made." : "Apply rechecks the source, connection and final evidence. Recorded preview text may be truncated.")), J(e, n);
		};
		X(fe, (e) => {
			t.view.review && e(pe);
		}), F(ee);
		var me = H(ee, 2), he = B(me), ge = B(he, !0);
		F(he);
		var _e = H(he, 2), ve = B(_e, !0);
		F(_e);
		var ye = H(_e, 2), be = (e) => {
			var n = Ds(), i = B(n);
			F(n), U(() => {
				n.disabled = !W(p), Y(i, `Run to here · maximum ${t.view.runHere.callBound ?? ""} ${t.view.runHere.callBound === 1 ? "request" : "requests"}`);
			}), K("click", n, () => {
				t.view && W(l) && W(p) && r().runHere?.(t.view.sourceKey, f(W(l).target));
			}), J(e, n);
		};
		X(ye, (e) => {
			t.view.runHere && e(be);
		});
		var xe = H(ye, 2), Se = (e) => {
			var n = Os(), i = V(n), a = B(i, !0);
			F(i);
			var o = H(i), s = B(o, !0);
			F(o), U(() => {
				i.disabled = !W(h), Y(a, t.view.review.persistOnly ? "Retry failed persistence" : "Apply reviewed candidate"), o.disabled = !W(g), Y(s, t.view.review.persistOnly ? "Close persistence review" : "Reject candidate");
			}), K("click", i, () => {
				t.view?.review && W(h) && r().apply?.(v(t.view.review.selector));
			}), K("click", o, () => {
				t.view?.review && W(g) && r().reject?.(v(t.view.review.selector));
			}), J(e, n);
		};
		X(xe, (e) => {
			t.view.review && e(Se);
		}), F(me), U((e) => {
			Y(b, W(l)?.label ?? t.view.title), $(w, "aria-pressed", t.view.followSelection), w.disabled = !r().follow, $(T, "aria-pressed", t.view.pinned), T.disabled = t.view.pinned ? !r().follow : !W(l) || !r().pin, Y(E, t.view.pinned ? "Unpin preview" : "Pin preview"), $(he, "data-status", t.view.status), Y(ge, e), Y(ve, t.view.pinned ? "Pinned preview" : t.view.followSelection ? "Following selection" : "Selection not followed");
		}, [() => u(t.view.status)]), K("click", w, () => r().follow?.()), K("click", T, () => {
			t.view?.pinned ? r().follow?.() : t.view && W(l) && r().pin?.(t.view.sourceKey, f(W(l).target));
		}), J(e, d);
	}, S = (e) => {
		J(e, As());
	};
	X(b, (e) => {
		t.view ? e(x) : e(S, -1);
	}), F(y), J(e, y), Ve();
}
Sr(["change", "click"]);
//#endregion
//#region ui/RunDetails.svelte
var Ns = /* @__PURE__ */ q("<p class=\"pc-run-memory svelte-f9s2fm\" role=\"status\"> </p>"), Ps = /* @__PURE__ */ q("<p class=\"pc-run-error svelte-f9s2fm\"> </p>"), Fs = /* @__PURE__ */ q("<p class=\"pc-run-empty svelte-f9s2fm\">No execution plan has been recorded.</p>"), Is = /* @__PURE__ */ q("<span aria-hidden=\"true\" class=\"svelte-f9s2fm\">▱</span>"), Ls = /* @__PURE__ */ q("<small class=\"svelte-f9s2fm\"> </small>"), Rs = /* @__PURE__ */ q("<details class=\"svelte-f9s2fm\"><summary class=\"svelte-f9s2fm\">Reported usage</summary><div class=\"pc-run-usage svelte-f9s2fm\"><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small></div></details>"), zs = /* @__PURE__ */ q("<li class=\"svelte-f9s2fm\"><div class=\"pc-run-row-heading svelte-f9s2fm\"><button type=\"button\" class=\"svelte-f9s2fm\"><!> </button><span class=\"pc-run-status svelte-f9s2fm\"> </span></div> <!> <div class=\"pc-run-row-meta svelte-f9s2fm\"><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small></div> <!> <!></li>"), Bs = /* @__PURE__ */ q("<header class=\"svelte-f9s2fm\"><h3 class=\"svelte-f9s2fm\">Run details</h3><span class=\"pc-run-status svelte-f9s2fm\"> </span></header> <div class=\"pc-run-summary svelte-f9s2fm\"><p class=\"svelte-f9s2fm\"> </p><p class=\"svelte-f9s2fm\"> </p><p class=\"svelte-f9s2fm\"> </p></div> <!> <!> <!> <ol class=\"pc-run-rows svelte-f9s2fm\"></ol>", 1), Vs = /* @__PURE__ */ q("<p class=\"pc-run-empty svelte-f9s2fm\">Run a workflow to inspect its processing stages.</p>"), Hs = /* @__PURE__ */ q("<section class=\"pc-run-details svelte-f9s2fm\" aria-label=\"Run details\"><!></section>");
function Us(e, t) {
	Be(t, !0);
	let n = Oi(t, "actions", 19, () => ({})), r = (e) => e === "not-run" ? "Not run" : e === "empty" ? "Ready" : e.charAt(0).toUpperCase() + e.slice(1), i = (e) => e !== null && Number.isFinite(e) && e >= 0 ? (e / 1e3).toFixed(2) + "s" : "Unknown", a = (e) => e != null && Number.isFinite(e) && e >= 0 ? String(e) : "Unknown";
	var o = Hs(), s = B(o), c = (e) => {
		var o = Bs(), s = V(o), c = H(B(s)), l = B(c, !0);
		F(c), F(s);
		var u = H(s, 2), d = B(u), f = B(d);
		F(d);
		var p = H(d), m = B(p);
		F(p);
		var h = H(p), g = B(h);
		F(h), F(u);
		var _ = H(u, 2), v = (e) => {
			var n = Ns(), r = B(n, !0);
			F(n), U(() => Y(r, t.view.memoryStatus)), J(e, n);
		};
		X(_, (e) => {
			t.view.memoryStatus && e(v);
		});
		var y = H(_, 2), b = (e) => {
			var n = Ps(), r = B(n, !0);
			F(n), U(() => Y(r, t.view.issue)), J(e, n);
		};
		X(y, (e) => {
			t.view.issue && e(b);
		});
		var x = H(y, 2), S = (e) => {
			J(e, Fs());
		};
		X(x, (e) => {
			t.view.rows.length || e(S);
		});
		var C = H(x, 2);
		Z(C, 21, () => t.view.rows, (e) => e.key, (e, o) => {
			var s = zs();
			let c;
			var l = B(s), u = B(l), d = B(u), f = (e) => {
				J(e, Is());
			};
			X(d, (e) => {
				W(o).kind === "instance" && e(f);
			});
			var p = H(d, 1, !0);
			F(u);
			var m = H(u), h = B(m, !0);
			F(m), F(l);
			var g = H(l, 2), _ = (e) => {
				var t = Ls(), n = B(t, !0);
				F(t), U((e) => Y(n, e), [() => r(W(o).subphase)]), J(e, t);
			};
			X(g, (e) => {
				W(o).subphase && e(_);
			});
			var v = H(g, 2), y = B(v), b = B(y);
			F(y);
			var x = H(y), S = B(x);
			F(x), F(v);
			var C = H(v, 2), w = (e) => {
				var t = Ps(), n = B(t, !0);
				F(t), U(() => Y(n, W(o).issue)), J(e, t);
			};
			X(C, (e) => {
				W(o).issue && e(w);
			});
			var T = H(C, 2), E = (e) => {
				var t = Rs(), n = H(B(t)), r = B(n), i = B(r);
				F(r);
				var s = H(r), c = B(s);
				F(s);
				var l = H(s), u = B(l);
				F(l);
				var d = H(l), f = B(d);
				F(d), F(n), F(t), U((e, t, n) => {
					Y(i, `Input tokens: ${e ?? ""}`), Y(c, `Output tokens: ${t ?? ""}`), Y(u, `Total tokens: ${n ?? ""}`), Y(f, `Cost: ${W(o).usage?.cost ?? "Unknown" ?? ""}`);
				}, [
					() => a(W(o).usage?.inputTokens),
					() => a(W(o).usage?.outputTokens),
					() => a(W(o).usage?.totalTokens)
				]), J(e, t);
			};
			X(T, (e) => {
				W(o).kind === "primitive" && e(E);
			}), F(s), U((e, t, r) => {
				$(s, "data-run-row", W(o).key), $(s, "data-depth", W(o).depth), $(s, "data-status", W(o).status), c = li(s, "", c, e), $(u, "aria-label", "Open " + W(o).title + " in graph"), u.disabled = !n().jump, Y(p, W(o).title), $(m, "data-status", W(o).status), Y(h, t), Y(b, `Duration: ${r ?? ""}`), Y(S, `${W(o).attempts ?? ""} of ${W(o).callBound ?? ""} requests`);
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
		}), F(C), U((e, n) => {
			$(c, "data-status", t.view.status), Y(l, e), Y(f, `${t.view.completedCount ?? ""} of ${t.view.executableCount ?? ""} stages complete`), Y(m, `${t.view.actualCalls ?? ""} of ${t.view.callBound ?? ""} requests`), Y(g, `Elapsed: ${n ?? ""}`);
		}, [() => r(t.view.status), () => i(t.view.elapsedMs)]), J(e, o);
	}, l = (e) => {
		J(e, Vs());
	};
	X(s, (e) => {
		t.view ? e(c) : e(l, -1);
	}), F(o), J(e, o), Ve();
}
Sr(["click"]);
//#endregion
//#region ui/RunMeter.svelte
var Ws = /* @__PURE__ */ q("<span class=\"pc-run-meter-elapsed svelte-1tkcp3\" data-run-elapsed=\"\"> </span>"), Gs = /* @__PURE__ */ q("<span class=\"pc-run-pixel svelte-1tkcp3\" data-run-pixel=\"\"></span>"), Ks = /* @__PURE__ */ q("<button class=\"pc-run-meter svelte-1tkcp3\"><span class=\"pc-run-meter-label svelte-1tkcp3\"> </span> <!> <span class=\"pc-run-meter-pixels svelte-1tkcp3\" aria-hidden=\"true\"></span></button>");
function qs(e, t) {
	Be(t, !0);
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
	], i = /* @__PURE__ */ I(() => {
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
	}), a = /* @__PURE__ */ I(() => t.view ? "Open run details. " + n(t.view.status) + ". " + t.view.completedCount + " of " + t.view.executableCount + " stages complete. " + t.view.actualCalls + " of " + t.view.callBound + " requests." : "Open run details");
	var o = Nr(), s = V(o), c = (e) => {
		var r = Ks(), o = B(r), s = B(o, !0);
		F(o);
		var c = H(o, 2), l = (e) => {
			var n = Ws(), r = B(n);
			F(n), U((e) => Y(r, `${e ?? ""}s`), [() => (t.view.elapsedMs / 1e3).toFixed(1)]), J(e, n);
		}, u = /* @__PURE__ */ I(() => t.view.elapsedMs !== null && Number.isFinite(t.view.elapsedMs) && t.view.elapsedMs >= 0);
		X(c, (e) => {
			W(u) && e(l);
		});
		var d = H(c, 2);
		Z(d, 21, () => W(i), (e) => e.key, (e, t) => {
			var n = Gs();
			U(() => {
				$(n, "data-status", W(t).status), $(n, "title", W(t).title);
			}), J(e, n);
		}), F(d), F(r), U((e) => {
			$(r, "aria-label", W(a)), $(r, "title", W(a)), r.disabled = !t.open, Y(s, e);
		}, [() => n(t.view.status)]), K("click", r, () => t.open?.()), J(e, r);
	};
	X(s, (e) => {
		t.view && e(c);
	}), J(e, o), Ve();
}
Sr(["click"]);
//#endregion
//#region ui/PortalManager.svelte
var Js = /* @__PURE__ */ q("<button type=\"button\" class=\"svelte-mnv790\">Close</button>"), Ys = /* @__PURE__ */ q("<option class=\"svelte-mnv790\"> </option>"), Xs = /* @__PURE__ */ q("<label class=\"svelte-mnv790\">Portal name<input aria-label=\"Portal name\" class=\"svelte-mnv790\"/></label> <p class=\"pc-note svelte-mnv790\"> </p> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-rename=\"\" class=\"svelte-mnv790\">Rename</button></div>", 1), Zs = /* @__PURE__ */ q("<p class=\"pc-note svelte-mnv790\">Select a portal or create one from an output.</p>"), Qs = /* @__PURE__ */ q("<button type=\"button\" data-portal-jump-source=\"\" class=\"svelte-mnv790\">Jump to source</button>"), $s = /* @__PURE__ */ q("<label class=\"pc-check svelte-mnv790\"><input type=\"checkbox\" aria-label=\"Replace existing connection\" class=\"svelte-mnv790\"/>Replace existing connection</label>"), ec = /* @__PURE__ */ q("<button type=\"button\" data-portal-jump-consumer=\"\" class=\"svelte-mnv790\">Jump</button>"), tc = /* @__PURE__ */ q("<div class=\"pc-consumer svelte-mnv790\"><span class=\"svelte-mnv790\"> </span><div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-restore=\"\" class=\"svelte-mnv790\">Restore wire</button> <!></div></div>"), nc = /* @__PURE__ */ q("<p class=\"pc-note svelte-mnv790\">No consumers.</p>"), rc = /* @__PURE__ */ q("<label class=\"svelte-mnv790\">Existing consumers<select aria-label=\"Existing consumers\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Choose before deleting…</option><option class=\"svelte-mnv790\">Restore visible wires</option><option class=\"svelte-mnv790\">Disconnect consumers</option></select></label>"), ic = /* @__PURE__ */ q("<details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Consumers</summary> <label class=\"svelte-mnv790\">Compatible receiver<select aria-label=\"Compatible receiver\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select input…</option><!></select></label> <!> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-connect=\"\" class=\"svelte-mnv790\">Connect receiver</button></div> <!> <!> <!> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-delete=\"\" class=\"svelte-mnv790\">Delete portal</button></div></details>"), ac = /* @__PURE__ */ q("<details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Convert to portal</summary><p class=\"pc-note svelte-mnv790\"> </p><div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-convert=\"\" class=\"svelte-mnv790\"> </button></div></details>"), oc = /* @__PURE__ */ q("<p class=\"pc-error svelte-mnv790\"> </p>"), sc = /* @__PURE__ */ q("<p class=\"pc-error svelte-mnv790\" role=\"alert\"> </p>"), cc = /* @__PURE__ */ q("<p class=\"pc-note svelte-mnv790\" role=\"status\">Preparing change…</p>"), lc = /* @__PURE__ */ q("<p class=\"pc-note svelte-mnv790\"> </p> <label class=\"svelte-mnv790\">Portal<select aria-label=\"Selected portal\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select portal…</option><!></select></label> <!> <details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Source</summary> <label class=\"svelte-mnv790\">Output<select aria-label=\"Portal source\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select output…</option><!></select></label> <label class=\"svelte-mnv790\">New portal name<input aria-label=\"New portal name\" class=\"svelte-mnv790\"/></label> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-create=\"\" class=\"svelte-mnv790\">Create portal</button> <button type=\"button\" data-portal-retarget=\"\" class=\"svelte-mnv790\">Retarget</button> <!></div></details> <!> <!> <!> <!> <!>", 1), uc = /* @__PURE__ */ q("<p class=\"pc-note svelte-mnv790\">Open a graph to manage its portals.</p>"), dc = /* @__PURE__ */ q("<section class=\"pc-manager svelte-mnv790\" aria-label=\"Manage portals\"><header class=\"svelte-mnv790\"><h2 class=\"svelte-mnv790\">Manage portals</h2><!></header> <!></section>");
function fc(e, t) {
	Be(t, !0);
	let n = Oi(t, "actions", 19, () => ({})), r = /* @__PURE__ */ R(""), i = /* @__PURE__ */ R(""), a = /* @__PURE__ */ R(""), o = /* @__PURE__ */ R(""), s = /* @__PURE__ */ R(""), c = /* @__PURE__ */ R(!1), l = /* @__PURE__ */ R(""), u = /* @__PURE__ */ R(""), d = "", f = 0, p = !0, m = (e) => JSON.stringify(e.kind === "graph" ? [
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
	]), h = /* @__PURE__ */ I(() => t.view?.publishers.find((e) => e.id === t.view.selectedPortalId)), g = /* @__PURE__ */ I(() => !!t.view && !!W(h) && t.view.capabilities.rename && (t.view.renameMode === "presentation" ? t.view.canPresent : t.view.scope.kind === "graph" && !t.view.readOnly) && !!n().rename), _ = /* @__PURE__ */ I(() => t.view?.sources.find((e) => e.key === W(a) && e.direction === "output")), v = /* @__PURE__ */ I(() => t.view?.receivers.find((e) => e.key === W(o) && e.direction === "input" && e.kind === W(h)?.kind)), y = /* @__PURE__ */ I(() => !!W(h) && !!W(v) && (!W(v).occupied || W(c)) && C("connect") && !!n().connect), b = /* @__PURE__ */ I(() => !!W(h) && C("remove") && !!n().deletePublisher && (!t.view?.consumers.length || W(s) === "restore" || W(s) === "disconnect"));
	yn(() => {
		let e = t.view ? JSON.stringify([
			t.view.managerKey,
			t.view.revision,
			m(t.view.scope),
			t.view.selectedPortalId,
			t.view.renameMode
		]) : "";
		d !== e && (d = e, z(r, W(h)?.label ?? "", !0), z(i, ""), z(a, t.view?.sources.find((e) => e.nodeId === W(h)?.source.nodeId && e.portId === W(h)?.source.portId)?.key ?? "", !0), z(o, ""), z(s, ""), z(c, !1), z(l, ""), z(u, ""), f++);
	}), Ai(() => {
		p = !1, f++;
	});
	let x = (e) => ({
		managerKey: e.managerKey,
		revision: e.revision,
		scope: Ie(e.scope)
	}), S = (e) => ({
		nodeId: e.nodeId,
		portId: e.portId
	});
	function C(e) {
		return !!t.view && !t.view.readOnly && t.view.scope.kind === "graph" && t.view.capabilities[e];
	}
	function w() {
		z(l, ""), z(u, ""), f++;
	}
	async function T(e, n, r) {
		if (!t.view || !n || W(u)) return;
		let i = x(t.view), a = ++f, o = t.view.selectedPortalId;
		z(u, e, !0), z(l, "");
		try {
			let e = await r(i);
			p && a === f && t.view?.managerKey === i.managerKey && t.view.revision === i.revision && m(t.view.scope) === m(i.scope) && t.view.selectedPortalId === o && (z(u, ""), z(l, e.ok ? "" : e.error.code + ": " + e.error.message, !0));
		} catch (e) {
			p && a === f && t.view?.managerKey === i.managerKey && t.view.revision === i.revision && m(t.view.scope) === m(i.scope) && t.view.selectedPortalId === o && (z(u, ""), z(l, e instanceof Error ? e.message : "The portal change could not be accepted.", !0));
		}
	}
	var E = dc(), D = B(E), O = H(B(D)), k = (e) => {
		var t = Js();
		K("click", t, () => n().close?.()), J(e, t);
	};
	X(O, (e) => {
		n().close && e(k);
	}), F(D);
	var A = H(D, 2), ee = (e) => {
		var d = lc(), f = V(d), p = B(f);
		F(f);
		var m = H(f, 2), E = H(B(m)), D = B(E);
		D.value = D.__value = "", Z(H(D), 17, () => t.view.publishers, (e) => e.id, (e, t) => {
			var n = Ys(), r = B(n);
			F(n);
			var i = {};
			U(() => {
				Y(r, `${W(t).label ?? ""} · ${W(t).kind ?? ""}`), i !== (i = W(t).id) && (n.value = (n.__value = W(t).id) ?? "");
			}), J(e, n);
		}), F(E);
		var O;
		di(E), F(m);
		var k = H(m, 2), A = (e) => {
			var i = Xs(), a = V(i), o = H(B(a));
			Q(o), F(a);
			var s = H(a, 2), c = B(s);
			F(s);
			var l = H(s, 2), d = B(l);
			F(l), U(() => {
				vi(o, W(r)), o.disabled = !W(g), Y(c, `${t.view.renameMode === "presentation" ? "Local workspace label · not exported" : "Authored portal label"} · ${W(h).kind ?? ""}`), d.disabled = !W(g) || !!W(u);
			}), K("input", o, (e) => {
				z(r, e.currentTarget.value, !0), w();
			}), K("click", d, () => {
				let e = W(h)?.id, i = t.view?.renameMode, a = W(r);
				e && i && n().rename && T("rename", W(g), (t) => n().rename(t, e, a, i));
			}), J(e, i);
		}, ee = (e) => {
			J(e, Zs());
		};
		X(k, (e) => {
			W(h) ? e(A) : e(ee, -1);
		});
		var j = H(k, 2), te = H(B(j), 2), M = H(B(te)), ne = B(M);
		ne.value = ne.__value = "", Z(H(ne), 17, () => t.view.sources, (e) => e.key, (e, t) => {
			var n = Ys(), r = B(n);
			F(n);
			var i = {};
			U(() => {
				Y(r, `${W(t).label ?? ""} · ${W(t).kind ?? ""}`), i !== (i = W(t).key) && (n.value = (n.__value = W(t).key) ?? "");
			}), J(e, n);
		}), F(M);
		var re;
		di(M), F(te);
		var ie = H(te, 2), ae = H(B(ie));
		Q(ae), F(ie);
		var oe = H(ie, 2), se = B(oe), ce = H(se, 2), le = H(ce, 2), ue = (e) => {
			var r = Qs();
			K("click", r, () => {
				t.view && W(h) && n().jumpSource?.(x(t.view), S(W(h).source));
			}), J(e, r);
		};
		X(le, (e) => {
			W(h) && n().jumpSource && e(ue);
		}), F(oe), F(j);
		var de = H(j, 2), fe = (e) => {
			var r = ic(), i = H(B(r), 2), a = H(B(i)), l = B(a);
			l.value = l.__value = "", Z(H(l), 17, () => t.view.receivers, (e) => e.key, (e, t) => {
				var n = Ys(), r = B(n);
				F(n);
				var i = {};
				U(() => {
					Y(r, `${W(t).label ?? ""}${W(t).occupied ? " · Connected" : ""}`), i !== (i = W(t).key) && (n.value = (n.__value = W(t).key) ?? "");
				}), J(e, n);
			}), F(a);
			var d;
			di(a), F(i);
			var f = H(i, 2), p = (e) => {
				var t = $s(), n = B(t);
				Q(n), ke(), F(t), U((e) => {
					yi(n, W(c)), n.disabled = e;
				}, [() => !C("connect")]), K("change", n, (e) => {
					z(c, e.currentTarget.checked, !0), w();
				}), J(e, t);
			};
			X(f, (e) => {
				W(v)?.occupied && e(p);
			});
			var m = H(f, 2), g = B(m);
			F(m);
			var _ = H(m, 2);
			Z(_, 17, () => t.view.consumers, (e) => e.edgeId, (e, r) => {
				var i = tc(), a = B(i), o = B(a, !0);
				F(a);
				var s = H(a), c = B(s), l = H(c, 2), d = (e) => {
					var i = ec();
					K("click", i, () => {
						let e = t.view?.consumers.find((e) => e.edgeId === W(r).edgeId);
						t.view && e && n().jumpConsumer?.(x(t.view), e.edgeId, S(e.to));
					}), J(e, i);
				};
				X(l, (e) => {
					n().jumpConsumer && e(d);
				}), F(s), F(i), U((e) => {
					Y(o, W(r).label), c.disabled = e;
				}, [() => !C("restore") || !n().restoreWire || !!W(u)]), K("click", c, () => {
					let e = t.view?.consumers.find((e) => e.edgeId === W(r).edgeId);
					e && n().restoreWire && T("restore", C("restore"), (t) => n().restoreWire(t, e.edgeId));
				}), J(e, i);
			});
			var E = H(_, 2), D = (e) => {
				J(e, nc());
			};
			X(E, (e) => {
				t.view.consumers.length || e(D);
			});
			var O = H(E, 2), k = (e) => {
				var t = rc(), n = H(B(t)), r = B(n);
				r.value = r.__value = "";
				var i = H(r);
				i.value = i.__value = "restore";
				var a = H(i);
				a.value = a.__value = "disconnect", F(n);
				var o;
				di(n), F(t), U((e) => {
					n.disabled = e, o !== (o = W(s)) && (n.value = (n.__value = W(s)) ?? "", ui(n, W(s)));
				}, [() => !C("remove")]), K("change", n, (e) => {
					z(s, e.currentTarget.value, !0), w();
				}), J(e, t);
			};
			X(O, (e) => {
				t.view.consumers.length && e(k);
			});
			var A = H(O, 2), ee = B(A);
			F(A), F(r), U((e) => {
				a.disabled = e, d !== (d = W(o)) && (a.value = (a.__value = W(o)) ?? "", ui(a, W(o))), g.disabled = !W(y) || !!W(u), ee.disabled = !W(b) || !!W(u);
			}, [() => !C("connect") || !n().connect]), K("change", a, (e) => {
				z(o, e.currentTarget.value, !0), z(c, !1), w();
			}), K("click", g, () => {
				let e = W(v), t = W(h)?.id, r = W(c);
				e && t && n().connect && T("connect", W(y), (i) => n().connect(i, t, S(e), r));
			}), K("click", ee, () => {
				let e = W(h)?.id, r = t.view?.consumers.length ? W(s) : "restore";
				e && (r === "restore" || r === "disconnect") && n().deletePublisher && T("remove", W(b), (t) => n().deletePublisher(t, e, r));
			}), J(e, r);
		};
		X(de, (e) => {
			W(h) && e(fe);
		});
		var pe = H(de, 2), me = (e) => {
			var r = ac(), i = H(B(r)), a = B(i, !0);
			F(i);
			var o = H(i), s = B(o), c = B(s);
			F(s), F(o), F(r), U((e) => {
				Y(a, t.view.conversion.label), s.disabled = e, Y(c, `Convert ${t.view.conversion.kind === "wire" ? "wire" : "output"}`);
			}, [() => !C("convert") || !!W(u) || (t.view.conversion.kind === "wire" ? !n().convertWire : !n().convertOutput)]), K("click", s, () => {
				let e = t.view?.conversion;
				e?.kind === "wire" && n().convertWire ? T("convert", C("convert"), (t) => n().convertWire(t, e.edgeId)) : e?.kind === "output" && n().convertOutput && T("convert", C("convert"), (t) => n().convertOutput(t, S(e.endpoint)));
			}), J(e, r);
		};
		X(pe, (e) => {
			t.view.conversion && e(me);
		});
		var he = H(pe, 2), ge = (e) => {
			var n = oc(), r = B(n, !0);
			F(n), U(() => Y(r, t.view.issue)), J(e, n);
		};
		X(he, (e) => {
			t.view.issue && e(ge);
		});
		var _e = H(he, 2), ve = (e) => {
			var t = sc(), n = B(t, !0);
			F(t), U(() => Y(n, W(l))), J(e, t);
		};
		X(_e, (e) => {
			W(l) && e(ve);
		});
		var ye = H(_e, 2), be = (e) => {
			J(e, cc());
		};
		X(ye, (e) => {
			W(u) && e(be);
		}), U((e, r, o, s) => {
			Y(p, `${t.view.scopeLabel ?? ""}${t.view.readOnly ? " · Read-only graph" : ""}`), E.disabled = !n().selectPortal, O !== (O = t.view.selectedPortalId ?? "") && (E.value = (E.__value = t.view.selectedPortalId ?? "") ?? "", ui(E, t.view.selectedPortalId ?? "")), M.disabled = e, re !== (re = W(a)) && (M.value = (M.__value = W(a)) ?? "", ui(M, W(a))), vi(ae, W(i)), ae.disabled = r, se.disabled = o, ce.disabled = s;
		}, [
			() => !C("create") && !C("retarget"),
			() => !C("create") || !n().create,
			() => !C("create") || !n().create || !W(_) || !W(i).trim() || !!W(u),
			() => !C("retarget") || !n().retarget || !W(_) || !W(h) || !!W(u)
		]), K("change", E, (e) => {
			let r = e.currentTarget.value;
			e.currentTarget.selectedIndex >= 0 && t.view && n().selectPortal && (!r || t.view.publishers.some((e) => e.id === r)) && n().selectPortal(x(t.view), r || null);
		}), K("change", M, (e) => {
			z(a, e.currentTarget.value, !0), w();
		}), K("input", ae, (e) => {
			z(i, e.currentTarget.value, !0), w();
		}), K("click", se, () => {
			let e = W(_), t = W(i);
			e && t.trim() && n().create && T("create", C("create"), (r) => n().create(r, t, S(e)));
		}), K("click", ce, () => {
			let e = W(_), t = W(h)?.id;
			e && t && n().retarget && T("retarget", C("retarget"), (r) => n().retarget(r, t, S(e)));
		}), J(e, d);
	}, j = (e) => {
		J(e, uc());
	};
	X(A, (e) => {
		t.view ? e(ee) : e(j, -1);
	}), F(E), J(e, E), Ve();
}
Sr([
	"click",
	"change",
	"input"
]);
//#endregion
//#region ui/SubgraphSave.svelte
var pc = /* @__PURE__ */ q("<option class=\"svelte-1n658sg\"> </option>"), mc = /* @__PURE__ */ q("<p class=\"pc-save-error svelte-1n658sg\" role=\"alert\"> </p>"), hc = /* @__PURE__ */ q("<div class=\"pc-workspace-overlay svelte-1n658sg\"><div class=\"pc-workspace-dialog pc-subgraph-save svelte-1n658sg\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Save subgraph\" tabindex=\"-1\"><header class=\"svelte-1n658sg\"><h2 class=\"svelte-1n658sg\">Save subgraph</h2><button type=\"button\" aria-label=\"Close save subgraph\" class=\"svelte-1n658sg\">×</button></header> <form class=\"svelte-1n658sg\"><label class=\"svelte-1n658sg\">Name<input aria-label=\"Subgraph name\" maxlength=\"80\" class=\"svelte-1n658sg\"/></label> <label class=\"svelte-1n658sg\">Save as<select aria-label=\"Save as\" class=\"svelte-1n658sg\"><option class=\"svelte-1n658sg\">Save new subgraph</option><!></select></label> <p class=\"svelte-1n658sg\">Edits stay local until you save. Existing placed copies stay unchanged.</p> <!> <footer class=\"svelte-1n658sg\"><button type=\"button\" class=\"svelte-1n658sg\">Cancel</button><button type=\"submit\" data-save-subgraph=\"\" class=\"svelte-1n658sg\"> </button></footer></form></div></div>");
function gc(e, t) {
	Be(t, !0);
	let n, r = /* @__PURE__ */ R(""), i = /* @__PURE__ */ R(""), a = /* @__PURE__ */ R(!1), o = /* @__PURE__ */ R(""), s = "", c = 0;
	yn(() => {
		if (t.view.key === s) return;
		s = t.view.key, c++, z(r, t.view.name, !0), z(i, t.view.targetId ?? "", !0), z(a, !1), z(o, "");
		let e = s;
		ur().then(() => {
			if (t.view.key === e) {
				let e = n?.querySelector("input");
				e?.focus({ preventScroll: !0 }), e?.select();
			}
		});
	}), ki(() => {
		let e = document.activeElement;
		return () => e?.focus({ preventScroll: !0 });
	});
	async function l(e) {
		if (e.preventDefault(), !t.actions || !W(r).trim() || W(a) || W(i) && !t.view.entries.some((e) => e.id === W(i))) return;
		let n = t.view.key, s = ++c;
		z(a, !0), z(o, "");
		try {
			await t.actions.save(n, W(r), W(i) || null);
		} catch {
			t.view.key === n && s === c && z(o, "The subgraph could not be saved. Please try again.");
		} finally {
			t.view.key === n && s === c && z(a, !1);
		}
	}
	function u(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), t.actions?.close()), e.key === "Tab") {
			let t = [...n.querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled)")], r = t[0], i = t.at(-1);
			e.shiftKey && document.activeElement === r && (e.preventDefault(), i?.focus()), !e.shiftKey && document.activeElement === i && (e.preventDefault(), r?.focus());
		}
	}
	var d = hc(), f = B(d), p = B(f), m = H(B(p));
	F(p);
	var h = H(p, 2), g = B(h), _ = H(B(g));
	Q(_), F(g);
	var v = H(g, 2), y = H(B(v)), b = B(y);
	b.value = b.__value = "", Z(H(b), 17, () => t.view.entries, (e) => e.id, (e, t) => {
		var n = pc(), r = B(n);
		F(n);
		var i = {};
		U(() => {
			Y(r, `Update ${W(t).name ?? ""}`), i !== (i = W(t).id) && (n.value = (n.__value = W(t).id) ?? "");
		}), J(e, n);
	}), F(y), F(v);
	var x = H(v, 4), S = (e) => {
		var n = mc(), r = B(n, !0);
		F(n), U(() => Y(r, t.view.error || W(o))), J(e, n);
	};
	X(x, (e) => {
		(t.view.error || W(o)) && e(S);
	});
	var C = H(x, 2), w = B(C), T = H(w), E = B(T, !0);
	F(T), F(C), F(h), F(f), Di(f, (e) => n = e, () => n), F(d), U((e) => {
		T.disabled = e, Y(E, W(a) ? "Saving…" : "Save");
	}, [() => !t.actions || !W(r).trim() || W(a)]), G("keydown", f, u, !0), G("paste", f, (e) => e.stopPropagation()), K("click", m, () => t.actions?.close()), G("submit", h, l), Ci(_, () => W(r), (e) => z(r, e)), fi(y, () => W(i), (e) => z(i, e)), K("click", w, () => t.actions?.close()), J(e, d), Ve();
}
Sr(["click"]);
//#endregion
//#region ui/FastConnections.svelte
var _c = /* @__PURE__ */ q("<option class=\"svelte-1n96rai\"> </option>"), vc = /* @__PURE__ */ q("<p class=\"pc-fast-key-status svelte-1n96rai\"> </p>"), yc = /* @__PURE__ */ q("<p role=\"alert\" class=\"svelte-1n96rai\"> </p>"), bc = /* @__PURE__ */ q("<p role=\"status\" class=\"svelte-1n96rai\"> </p>"), xc = /* @__PURE__ */ q("<section class=\"pc-fast-connections svelte-1n96rai\" aria-label=\"Fast connection setup\"><p class=\"svelte-1n96rai\">Configure a typed Jev, Laya or compatible model for Fast Decision. Node settings keep only the connection ID.</p> <label class=\"svelte-1n96rai\">Configured Fast connection<select aria-label=\"Configured Fast connection\" class=\"svelte-1n96rai\"><option class=\"svelte-1n96rai\">New connection</option><!></select></label> <div class=\"pc-fast-fields svelte-1n96rai\"><label class=\"svelte-1n96rai\">Connection ID<input aria-label=\"Connection ID\" maxlength=\"128\" class=\"svelte-1n96rai\"/></label> <label class=\"svelte-1n96rai\">Connection name<input aria-label=\"Connection name\" maxlength=\"256\" class=\"svelte-1n96rai\"/></label> <label class=\"svelte-1n96rai\">Provider<select aria-label=\"Provider\" class=\"svelte-1n96rai\"><option class=\"svelte-1n96rai\">Jev API</option><option class=\"svelte-1n96rai\">Laya</option><option class=\"svelte-1n96rai\">Compatible typed API</option></select></label> <label class=\"svelte-1n96rai\">Typed model<input aria-label=\"Typed model\" maxlength=\"256\" class=\"svelte-1n96rai\"/></label></div> <label class=\"svelte-1n96rai\">Typed endpoint<input aria-label=\"Typed endpoint\" type=\"url\" maxlength=\"2048\" class=\"svelte-1n96rai\"/></label> <small class=\"svelte-1n96rai\"> </small> <label class=\"svelte-1n96rai\">Session API key<input aria-label=\"Session API key\" type=\"password\" autocomplete=\"new-password\" spellcheck=\"false\" maxlength=\"8192\" class=\"svelte-1n96rai\"/></label> <small class=\"svelte-1n96rai\">Keys are session-only. Re-enter them after restarting SillyTavern. Leave this field empty to keep an existing session key.</small> <!> <!> <!> <footer class=\"svelte-1n96rai\"><button type=\"button\" class=\"svelte-1n96rai\"> </button><button type=\"button\" class=\"svelte-1n96rai\">Clear session key</button><button type=\"button\" class=\"svelte-1n96rai\">Remove connection</button><button type=\"button\" class=\"svelte-1n96rai\">Close</button></footer></section>");
function Sc(e, t) {
	Be(t, !0);
	let n = Oi(t, "actions", 19, () => ({})), r = /* @__PURE__ */ R(""), i = /* @__PURE__ */ R(""), a = /* @__PURE__ */ R(""), o = /* @__PURE__ */ R("jev"), s = /* @__PURE__ */ R(""), c = /* @__PURE__ */ R(""), l = /* @__PURE__ */ R(""), u = /* @__PURE__ */ R(!1), d = /* @__PURE__ */ R(""), f = /* @__PURE__ */ R(""), p = /* @__PURE__ */ R(Zt(pr(() => t.view.userId))), m = 0, h = /* @__PURE__ */ I(() => t.view.connections.find((e) => e.id === W(r)));
	function g() {
		m++, z(p, t.view.userId, !0), v(""), z(f, "The active user changed. Choose a connection for this user.");
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
		z(r, e, !0), z(l, ""), z(d, ""), z(f, "");
		let n = t.view.connections.find((t) => t.id === e);
		z(i, n?.id ?? "", !0), z(a, n?.label ?? "", !0), z(o, n?.provider ?? "jev", !0), z(s, n?.model ?? "", !0), z(c, n?.endpoint ?? "", !0);
	}
	function y(e) {
		e?.ok ? z(d, e.data?.message ?? "Connection settings updated.", !0) : z(f, e?.error.message ?? "Fast connection settings are unavailable.", !0);
	}
	async function b() {
		if (W(u) || !n().save) return;
		let e = _();
		if (!e) return;
		let t = W(l);
		z(l, ""), z(u, !0), z(d, ""), z(f, "");
		let p = {
			id: W(i),
			label: W(a) || W(i),
			provider: W(o),
			model: W(s),
			...W(o) === "jev" ? {} : { endpoint: W(c) }
		};
		try {
			let i = await n().save(p, t, e.userId);
			e.current() && (y(i), i.ok && z(r, p.id, !0));
		} catch {
			e.current() && z(f, "Fast connection settings could not be updated.");
		} finally {
			z(u, !1);
		}
	}
	async function x() {
		if (!W(r) || W(u) || !n().remove) return;
		let e = _();
		if (e) {
			z(l, ""), z(u, !0), z(f, ""), z(d, "");
			try {
				let t = await n().remove(W(r), e.userId);
				e.current() && (t.ok && v(""), y(t));
			} catch {
				e.current() && z(f, "The connection could not be removed.");
			} finally {
				z(u, !1);
			}
		}
	}
	async function S() {
		if (!W(r) || W(u) || !n().clearCredential) return;
		let e = _();
		if (e) {
			z(l, ""), z(u, !0), z(f, ""), z(d, "");
			try {
				let t = await n().clearCredential(W(r), e.userId);
				e.current() && y(t);
			} catch {
				e.current() && z(f, "The session key could not be cleared.");
			} finally {
				z(u, !1);
			}
		}
	}
	var C = xc(), w = H(B(C), 2), T = H(B(w)), E = B(T);
	E.value = E.__value = "", Z(H(E), 17, () => t.view.connections, (e) => e.id, (e, t) => {
		var n = _c(), r = B(n);
		F(n);
		var i = {};
		U(() => {
			Y(r, `${W(t).label ?? ""} · ${W(t).provider ?? ""} · ${W(t).model ?? ""}`), i !== (i = W(t).id) && (n.value = (n.__value = W(t).id) ?? "");
		}), J(e, n);
	}), F(T);
	var D;
	di(T), F(w);
	var O = H(w, 2), k = B(O), A = H(B(k));
	Q(A), F(k);
	var ee = H(k, 2), j = H(B(ee));
	Q(j), F(ee);
	var te = H(ee, 2), M = H(B(te)), ne = B(M);
	ne.value = ne.__value = "jev";
	var re = H(ne);
	re.value = re.__value = "laya";
	var ie = H(re);
	ie.value = ie.__value = "compatible", F(M);
	var ae;
	di(M), F(te);
	var oe = H(te, 2), se = H(B(oe));
	Q(se), F(oe), F(O);
	var ce = H(O, 2), le = H(B(ce));
	Q(le), F(ce);
	var ue = H(ce, 2), de = B(ue, !0);
	F(ue);
	var fe = H(ue, 2), pe = H(B(fe));
	Q(pe), F(fe);
	var me = H(fe, 4), he = (e) => {
		var t = vc(), n = B(t);
		F(t), U(() => Y(n, `Session key: ${W(h).credentialReady ? "ready" : "not entered"}`)), J(e, t);
	};
	X(me, (e) => {
		W(h) && e(he);
	});
	var ge = H(me, 2), _e = (e) => {
		var n = yc(), r = B(n, !0);
		F(n), U(() => Y(r, W(f) || t.view.issue)), J(e, n);
	};
	X(ge, (e) => {
		(t.view.issue || W(f)) && e(_e);
	});
	var ve = H(ge, 2), ye = (e) => {
		var t = bc(), n = B(t, !0);
		F(t), U(() => Y(n, W(d))), J(e, t);
	};
	X(ve, (e) => {
		W(d) && e(ye);
	});
	var be = H(ve, 2), xe = B(be), Se = B(xe, !0);
	F(xe);
	var Ce = H(xe), we = H(Ce), Te = H(we);
	F(be), F(C), U(() => {
		T.disabled = W(u), D !== (D = W(r)) && (T.value = (T.__value = W(r)) ?? "", ui(T, W(r))), vi(A, W(i)), A.disabled = W(u) || !!W(r), vi(j, W(a)), j.disabled = W(u), M.disabled = W(u), ae !== (ae = W(o)) && (M.value = (M.__value = W(o)) ?? "", ui(M, W(o))), vi(se, W(s)), se.disabled = W(u), vi(le, W(o) === "jev" ? "https://api.typesafe.ai/v1/systemone" : W(c)), le.readOnly = W(o) === "jev", le.disabled = W(u), Y(de, W(o) === "jev" ? "Jev uses its fixed SystemOne endpoint and requires a session API key." : "Enter the complete /v1/systemone route using HTTPS or HTTP on localhost. A session key is optional for an unauthenticated local service."), vi(pe, W(l)), pe.disabled = W(u), xe.disabled = W(u) || !n().save || !!t.view.issue, Y(Se, W(u) ? "Applying…" : "Save connection"), Ce.disabled = W(u) || !W(h)?.credentialReady || !n().clearCredential, we.disabled = W(u) || !W(r) || !n().remove;
	}), K("change", T, (e) => v(e.currentTarget.value)), K("input", A, (e) => z(i, e.currentTarget.value, !0)), K("input", j, (e) => z(a, e.currentTarget.value, !0)), K("change", M, (e) => {
		z(o, e.currentTarget.value, !0);
	}), K("input", se, (e) => z(s, e.currentTarget.value, !0)), K("input", le, (e) => z(c, e.currentTarget.value, !0)), K("input", pe, (e) => z(l, e.currentTarget.value, !0)), K("click", xe, b), K("click", Ce, S), K("click", we, x), K("click", Te, () => {
		z(l, ""), t.close();
	}), J(e, C), Ve();
}
Sr([
	"change",
	"input",
	"click"
]);
//#endregion
//#region src/workflow/operations/json-data.js?v=0.26.0
function Cc(e) {
	if (typeof e != "object" || !e) return JSON.stringify(e);
	if (Array.isArray(e)) {
		let t = "[";
		for (let n = 0; n < e.length; n++) t += `${n ? "," : ""}${Cc(e[n])}`;
		return `${t}]`;
	}
	let t = "{", n = Object.keys(e);
	for (let r = 0; r < n.length; r++) {
		let i = n[r];
		t += `${r ? "," : ""}${JSON.stringify(i)}:${Cc(e[i])}`;
	}
	return `${t}}`;
}
function wc(e) {
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
		if (new TextEncoder().encode(Cc(t)).byteLength > 262144) throw Error("JSON byte limit exceeded.");
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
var Tc = (e, t) => ({
	ok: !1,
	error: {
		code: e,
		message: t
	}
}), Ec = (e) => Number.isSafeInteger(e) && e >= 0, Dc = (e, t) => Object.hasOwn(e, t) ? e[t] : void 0, Oc = (e) => typeof e == "object" && !!e && !Array.isArray(e), kc = (e) => typeof e == "string" && e.trim().length > 0 && e.length <= 256, Ac = (e) => Array.isArray(e) && e.every((e) => typeof e == "string" && e.length > 0 && e.length <= 4096);
function jc(e, t) {
	let n = Mc(e);
	if (!n.ok) return n;
	let r = n.data, i = wc(t);
	if (!i.ok || !i.data.value || Array.isArray(i.data.value) || typeof i.data.value != "object") return Tc("INVALID_PROPOSAL", "Use a plain duration or destination proposal.");
	let a = i.data.value, o = Dc(a, "kind");
	if (o !== "duration" && o !== "destination") return Tc("UNRESOLVED_TIME", "An explicit duration or destination is required.");
	if (o === "duration" ? !Ec(Dc(a, "minutes")) || Object.hasOwn(a, "absoluteMinute") : !Ec(Dc(a, "absoluteMinute")) || Object.hasOwn(a, "minutes")) return Tc("INVALID_PROPOSAL", "Use one nonnegative safe-integer minute value.");
	let s = [
		"kind",
		"evidence",
		o === "duration" ? "minutes" : "absoluteMinute"
	];
	if (Object.keys(a).some((e) => !s.includes(e))) return Tc("INVALID_PROPOSAL", "Proposal contains ambiguous or unsupported timing fields.");
	let c = o === "destination" ? a.absoluteMinute : r.absoluteMinute + a.minutes;
	if (!Ec(c) || c < r.absoluteMinute) return Tc("INVALID_DESTINATION", "Destination must be a forward safe-integer minute.");
	let l = Pc(Object.hasOwn(a, "evidence") ? a.evidence : { kind: "explicit" });
	if (!l.ok) return l;
	let u = l.data, d = u.kind, f = structuredClone(r), p = structuredClone(u);
	return o === "duration" && r.timeEvidence?.kind === "estimate" && (p = d === "estimate" ? {
		...p,
		lineage: [.../* @__PURE__ */ new Set([...r.timeEvidence.lineage ?? [r.timeEvidence.origin], ...u.lineage ?? [u.origin]])]
	} : structuredClone(r.timeEvidence), p.lineage?.length > 64) ? Tc("EVIDENCE_LIMIT", "Estimate provenance exceeds 64 sources; hold the entire time projection.") : Nc({
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
function Mc(e) {
	let t = wc(e);
	if (!t.ok || !t.data.value || typeof t.data.value != "object" || Array.isArray(t.data.value)) return Tc("INVALID_CLOCK", "Clock must contain bounded own plain data.");
	let n = t.data.value;
	if (!kc(Dc(n, "clockId")) || !kc(Dc(n, "calendarId")) || !Ec(Dc(n, "absoluteMinute")) || !Ec(Dc(n, "dayLengthMinutes")) || n.dayLengthMinutes === 0) return Tc("INVALID_CLOCK", "Clock requires identities and safe-integer minute/calendar values.");
	if (Object.hasOwn(n, "schemaVersion") && n.schemaVersion !== 1) return Tc("INVALID_CLOCK", "Clock schema version must be 1.");
	if (Object.hasOwn(n, "revision") && (!Ec(n.revision) || n.revision < 1)) return Tc("INVALID_CLOCK", "Clock revision must be a positive safe integer.");
	if (Object.hasOwn(n, "timeEvidence") && !Pc(n.timeEvidence).ok) return Tc("INVALID_CLOCK", "Clock time evidence must retain accepted provenance.");
	if (Object.hasOwn(n, "settledTimeEventIds") && !Ac(n.settledTimeEventIds)) return Tc("INVALID_CLOCK", "Settled occurrence IDs must be a bounded string array.");
	for (let [e, t] of [
		["unit", "minute"],
		["originMinute", 0],
		["originDay", 1]
	]) if (Object.hasOwn(n, e) && n[e] !== t) return Tc("INVALID_CALENDAR", "This calendar uses minute units with minute zero at Day 1.");
	return {
		ok: !0,
		data: n
	};
}
function Nc(e) {
	let t = wc(e);
	return t.ok ? {
		ok: !0,
		data: t.data.value
	} : Tc("OUTPUT_LIMIT", "Projection exceeds the bounded plain-data DTO budget.");
}
function Pc(e) {
	if (!Oc(e)) return Tc("INVALID_EVIDENCE", "Evidence must be a plain record.");
	let t = Dc(e, "kind");
	if (![
		"explicit",
		"authored-rule",
		"validated-extraction",
		"estimate",
		"vague"
	].includes(t)) return Tc("INVALID_EVIDENCE", "Use a supported time evidence kind.");
	let n = t === "estimate" ? [
		"kind",
		"origin",
		"acceptancePolicy",
		"lineage"
	] : ["kind", "origin"];
	if (Object.keys(e).some((e) => !n.includes(e))) return Tc("INVALID_EVIDENCE", "Evidence contains unsupported or contradictory fields.");
	let r = typeof Dc(e, "origin") == "string" && e.origin.trim().length > 0;
	if (Object.hasOwn(e, "origin") && !r) return Tc("INVALID_EVIDENCE", "Evidence origin must be nonempty text.");
	if (t === "estimate" && Object.hasOwn(e, "acceptancePolicy") && !["accept", "unresolved"].includes(e.acceptancePolicy)) return Tc("INVALID_EVIDENCE", "Estimate acceptance policy must be accept or unresolved.");
	if (Object.hasOwn(e, "lineage")) {
		let t = e.lineage;
		if (!Array.isArray(t) || t.length === 0 || !t.every((e) => typeof e == "string" && e.trim().length > 0) || new Set(t).size !== t.length || !t.includes(e.origin)) return Tc("INVALID_EVIDENCE", "Estimate lineage must contain distinct nonempty text origins including the current origin.");
		if (t.length > 64) return Tc("EVIDENCE_LIMIT", "Estimate provenance exceeds 64 sources; hold the entire time projection.");
	}
	return t === "vague" || t === "estimate" && (!r || Dc(e, "acceptancePolicy") !== "accept") ? Tc("UNRESOLVED_TIME", "Estimated or vague time needs an explicit accepted authored rule.") : ["authored-rule", "validated-extraction"].includes(t) && !r ? Tc("INVALID_EVIDENCE", "Rule and extraction evidence must identify their origin.") : {
		ok: !0,
		data: e
	};
}
new TextEncoder();
//#endregion
//#region src/ui/story-document-setup.js
var Fc = (e, t) => ({
	ok: !1,
	error: {
		code: e,
		message: t
	}
});
function Ic(e, t, n = 0) {
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
	return jc(r, {
		kind: "duration",
		minutes: 0
	}).ok ? {
		ok: !0,
		data: { text: JSON.stringify(r, null, 2) }
	} : Fc("INVALID_CLOCK_TEMPLATE", "Choose explicit clock/calendar IDs and a nonnegative whole story minute.");
}
//#endregion
//#region ui/StoryDocuments.svelte
var Lc = /* @__PURE__ */ q("<p role=\"alert\" class=\"svelte-1t33cem\"> </p>"), Rc = /* @__PURE__ */ q("<option class=\"svelte-1t33cem\"> </option>"), zc = /* @__PURE__ */ q("<label class=\"svelte-1t33cem\">Actor ID<input aria-label=\"Actor ID\" maxlength=\"128\" class=\"svelte-1t33cem\"/></label>"), Bc = /* @__PURE__ */ q("<label class=\"svelte-1t33cem\">CSV columns, comma separated<input aria-label=\"CSV columns\" class=\"svelte-1t33cem\"/></label>"), Vc = /* @__PURE__ */ q("<details class=\"svelte-1t33cem\"><summary class=\"svelte-1t33cem\">Story clock template</summary><label class=\"svelte-1t33cem\">Calendar ID<input aria-label=\"Calendar ID\" class=\"svelte-1t33cem\"/></label><label class=\"svelte-1t33cem\">Starting story minute<input aria-label=\"Starting story minute\" type=\"number\" min=\"0\" step=\"1\" class=\"svelte-1t33cem\"/></label><button type=\"button\" class=\"svelte-1t33cem\">Use story clock template</button><p class=\"svelte-1t33cem\">Midnight on the first day is minute 0. The clock advances through graph events, using explicit story time.</p></details>"), Hc = /* @__PURE__ */ q("<p role=\"status\" class=\"svelte-1t33cem\"> </p>"), Uc = /* @__PURE__ */ q("<div class=\"pc-story-documents svelte-1t33cem\"><p class=\"svelte-1t33cem\"> </p> <p class=\"svelte-1t33cem\">Manage the documents used by your workflows here. Updating an authorization or its initial template leaves existing canonical document content intact. Read File and Write File use these target IDs.</p> <!> <label class=\"svelte-1t33cem\">Workflow data document<select aria-label=\"Workflow data document\" class=\"svelte-1t33cem\"><option class=\"svelte-1t33cem\">New document authorization</option><!></select></label> <div class=\"pc-document-actions svelte-1t33cem\"><button type=\"button\" class=\"svelte-1t33cem\">Load initial template</button><button type=\"button\" class=\"svelte-1t33cem\">Remove authorization</button><button type=\"button\" class=\"svelte-1t33cem\">Refresh scope</button></div> <form class=\"svelte-1t33cem\"><label class=\"svelte-1t33cem\">Logical target ID<input aria-label=\"Logical target ID\" maxlength=\"128\" placeholder=\"souls.json\" class=\"svelte-1t33cem\"/></label> <label class=\"svelte-1t33cem\">Document name<input aria-label=\"Document name\" maxlength=\"256\" class=\"svelte-1t33cem\"/></label> <label class=\"svelte-1t33cem\">Format<select aria-label=\"Document format\" class=\"svelte-1t33cem\"><option class=\"svelte-1t33cem\">JSON</option><option class=\"svelte-1t33cem\">JSON Lines</option><option class=\"svelte-1t33cem\">CSV</option><option class=\"svelte-1t33cem\">Plain text</option><option class=\"svelte-1t33cem\">Markdown</option></select></label> <label class=\"svelte-1t33cem\">Visibility<select aria-label=\"Document visibility\" class=\"svelte-1t33cem\"><option class=\"svelte-1t33cem\">Public</option><option class=\"svelte-1t33cem\">Hidden</option><option class=\"svelte-1t33cem\">Actor private</option></select></label> <!> <!> <!> <label class=\"svelte-1t33cem\">Initial template<textarea aria-label=\"Initial template\" rows=\"7\" maxlength=\"100000\" class=\"svelte-1t33cem\"></textarea></label> <p class=\"svelte-1t33cem\">JSON templates preserve your chosen object or list structure. CSV uses the named columns. Existing authorizations require explicit template loading before editing.</p> <!><!> <footer class=\"svelte-1t33cem\"><button type=\"button\" class=\"svelte-1t33cem\">Close</button><button type=\"submit\" class=\"svelte-1t33cem\"> </button></footer></form></div>");
function Wc(e, t) {
	Be(t, !0);
	let n = /* @__PURE__ */ R(""), r = /* @__PURE__ */ R(""), i = /* @__PURE__ */ R(""), a = /* @__PURE__ */ R("json"), o = /* @__PURE__ */ R(""), s = /* @__PURE__ */ R("public"), c = /* @__PURE__ */ R(""), l = /* @__PURE__ */ R(""), u = /* @__PURE__ */ R(!1), d = /* @__PURE__ */ R(""), f = /* @__PURE__ */ R(""), p = /* @__PURE__ */ R(!1), m = /* @__PURE__ */ R("story-calendar"), h = /* @__PURE__ */ R(0), g = "", _ = 0;
	function v() {
		z(r, ""), z(i, ""), z(a, "json"), z(o, ""), z(s, "public"), z(c, ""), z(l, ""), z(p, !1), z(d, ""), z(f, "");
	}
	yn(() => {
		t.view.key !== g && (g = t.view.key, _++, z(u, !1), z(n, ""), v());
	});
	function y() {
		_++, z(u, !1), v();
		let e = t.view.documents.find((e) => e.targetId === W(n));
		e && (z(r, e.targetId, !0), z(i, e.name, !0), z(a, e.format, !0), z(s, e.visibility.kind, !0), z(c, e.visibility.kind === "actor-private" ? e.visibility.actorId : "", !0), z(l, e.columns?.join(", ") ?? "", !0));
	}
	function b() {
		let e = Ic(W(r), W(m), W(h));
		e.ok ? (z(o, e.data.text, !0), z(d, "")) : z(d, e.error.message, !0);
	}
	async function x(e) {
		if (!t.actions || W(u) || !t.view.key) return;
		let m = t.view.key, h = ++_;
		z(u, !0), z(d, ""), z(f, "");
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
				z(d, u?.error?.message ?? "Workflow Data setup could not be applied.", !0);
				return;
			}
			if (e === "load") {
				let e = u.data?.definition;
				if (!e) {
					z(d, "The initial template could not be loaded.");
					return;
				}
				z(r, e.targetId, !0), z(i, e.name, !0), z(a, e.format, !0), z(o, e.content, !0), z(s, e.visibility.kind, !0), z(c, e.visibility.actorId ?? "", !0), z(l, e.columns?.join(", ") ?? "", !0), z(p, !0);
			} else z(f, u.data?.message ?? "Authorization updated locally.", !0), z(p, !1);
		} catch {
			m === t.view.key && h === _ && z(d, "Workflow Data setup could not be applied.");
		} finally {
			m === t.view.key && h === _ && z(u, !1);
		}
	}
	var S = Uc(), C = B(S), w = B(C);
	F(C);
	var T = H(C, 4), E = (e) => {
		var n = Lc(), r = B(n, !0);
		F(n), U(() => Y(r, t.view.issue)), J(e, n);
	};
	X(T, (e) => {
		t.view.issue && e(E);
	});
	var D = H(T, 2), O = H(B(D)), k = B(O);
	k.value = k.__value = "", Z(H(k), 17, () => t.view.documents, (e) => e.targetId, (e, t) => {
		var n = Rc(), r = B(n);
		F(n);
		var i = {};
		U(() => {
			Y(r, `${W(t).name ?? ""} (${W(t).targetId ?? ""}, ${W(t).format ?? ""}, ${W(t).visibility.kind ?? ""})`), i !== (i = W(t).targetId) && (n.value = (n.__value = W(t).targetId) ?? "");
		}), J(e, n);
	}), F(O), F(D);
	var A = H(D, 2), ee = B(A), j = H(ee), te = H(j);
	F(A);
	var M = H(A, 2), ne = B(M), re = H(B(ne));
	Q(re), F(ne);
	var ie = H(ne, 2), ae = H(B(ie));
	Q(ae), F(ie);
	var oe = H(ie, 2), se = H(B(oe)), ce = B(se);
	ce.value = ce.__value = "json";
	var le = H(ce);
	le.value = le.__value = "jsonl";
	var ue = H(le);
	ue.value = ue.__value = "csv";
	var de = H(ue);
	de.value = de.__value = "text";
	var fe = H(de);
	fe.value = fe.__value = "markdown", F(se), F(oe);
	var pe = H(oe, 2), me = H(B(pe)), he = B(me);
	he.value = he.__value = "public";
	var ge = H(he);
	ge.value = ge.__value = "hidden";
	var _e = H(ge);
	_e.value = _e.__value = "actor-private", F(me), F(pe);
	var ve = H(pe, 2), ye = (e) => {
		var t = zc(), n = H(B(t));
		Q(n), F(t), U(() => n.disabled = W(u)), Ci(n, () => W(c), (e) => z(c, e)), J(e, t);
	};
	X(ve, (e) => {
		W(s) === "actor-private" && e(ye);
	});
	var be = H(ve, 2), xe = (e) => {
		var t = Bc(), n = H(B(t));
		Q(n), F(t), U(() => n.disabled = W(u)), Ci(n, () => W(l), (e) => z(l, e)), J(e, t);
	};
	X(be, (e) => {
		W(a) === "csv" && e(xe);
	});
	var Se = H(be, 2), Ce = (e) => {
		var t = Vc(), i = H(B(t)), a = H(B(i));
		Q(a), F(i);
		var o = H(i), s = H(B(o));
		Q(s), F(o);
		var c = H(o);
		ke(), F(t), U((e) => {
			a.disabled = W(u), s.disabled = W(u), c.disabled = e;
		}, [() => !W(r).trim() || W(u) || !!W(n) && !W(p)]), Ci(a, () => W(m), (e) => z(m, e)), Ci(s, () => W(h), (e) => z(h, e)), K("click", c, b), J(e, t);
	};
	X(Se, (e) => {
		W(a) === "json" && e(Ce);
	});
	var we = H(Se, 2), Te = H(B(we));
	nt(Te), F(we);
	var N = H(we, 4), Ee = (e) => {
		var t = Lc(), n = B(t, !0);
		F(t), U(() => Y(n, W(d))), J(e, t);
	};
	X(N, (e) => {
		W(d) && e(Ee);
	});
	var P = H(N), De = (e) => {
		var n = Hc(), r = B(n, !0);
		F(n), U(() => Y(r, W(f) || t.view.notice)), J(e, n);
	};
	X(P, (e) => {
		(W(f) || t.view.notice) && e(De);
	});
	var Oe = H(P, 2), Ae = B(Oe), je = H(Ae), Me = B(je, !0);
	F(je), F(Oe), F(M), F(S), U((e) => {
		Y(w, `Active user: ${(t.view.scope.userId || "Unavailable") ?? ""} · Chat: ${(t.view.scope.chatId || "Unavailable") ?? ""}`), O.disabled = W(u), ee.disabled = !W(n) || W(u), j.disabled = !W(n) || W(u), te.disabled = W(u), re.disabled = !!W(n) || W(u), ae.disabled = W(u), se.disabled = !!W(n) || W(u), me.disabled = W(u), Te.disabled = W(u) || !!W(n) && !W(p), $(Te, "placeholder", W(a) === "json" ? "[]" : ""), je.disabled = e, Y(Me, W(u) ? "Saving…" : "Save authorization");
	}, [() => !t.actions || !t.view.key || !W(r).trim() || !W(i).trim() || W(u) || !!W(n) && !W(p) || W(s) === "actor-private" && !W(c).trim()]), K("change", O, y), fi(O, () => W(n), (e) => z(n, e)), K("click", ee, () => x("load")), K("click", j, () => x("remove")), K("click", te, () => t.actions?.refresh()), G("submit", M, (e) => {
		e.preventDefault(), x("save");
	}), Ci(re, () => W(r), (e) => z(r, e)), Ci(ae, () => W(i), (e) => z(i, e)), fi(se, () => W(a), (e) => z(a, e)), fi(me, () => W(s), (e) => z(s, e)), Ci(Te, () => W(o), (e) => z(o, e)), K("click", Ae, function(...e) {
		t.close?.apply(this, e);
	}), J(e, S), Ve();
}
Sr(["change", "click"]);
//#endregion
//#region ui/RecallOverview.svelte
var Gc = /* @__PURE__ */ q("<p aria-label=\"Recall scope\" class=\"svelte-ejm25z\"> </p>"), Kc = /* @__PURE__ */ q("<p role=\"alert\" class=\"svelte-ejm25z\"> </p>"), qc = /* @__PURE__ */ q("<p class=\"svelte-ejm25z\">Add a Recall Shortcut to the open unified workflow for the active character. Configure its actor, memory set and policy in Details, then enable Lattice.</p>"), Jc = /* @__PURE__ */ q("<p class=\"svelte-ejm25z\"> </p>"), Yc = /* @__PURE__ */ q("<li><button type=\"button\"> </button></li>"), Xc = /* @__PURE__ */ q("<fieldset class=\"svelte-ejm25z\"><legend class=\"svelte-ejm25z\"> </legend><p role=\"status\" class=\"svelte-ejm25z\"> </p> <p class=\"svelte-ejm25z\"> </p> <!> <!> <!> <div class=\"pc-recall-overview-actions svelte-ejm25z\"><button type=\"button\" data-recall-queue=\"\">Queue recall</button><button type=\"button\">Cancel recall</button></div> <ul aria-label=\"Matching nodes\"></ul> <small class=\"svelte-ejm25z\"> </small></fieldset>"), Zc = /* @__PURE__ */ q("<p class=\"svelte-ejm25z\">Queue a memory set for the next reply, generated swipe, or both. Matching nodes share one request.</p> <!> <!> <!> <!> <p class=\"svelte-ejm25z\"><button type=\"button\">Refresh recall state</button></p> <small class=\"svelte-ejm25z\">Shortcuts use physical keys and pause while typing. Automatic Recall uses its own conditions. Queue and Cancel do not generate a reply.</small>", 1);
function Qc(e, t) {
	Be(t, !0);
	let n = /* @__PURE__ */ R(""), r = /* @__PURE__ */ R("");
	async function i(e, i, a) {
		if (!W(n)) {
			z(n, e, !0), z(r, "");
			try {
				let e = await t.actions?.change(i, a, "all");
				e?.ok !== !0 && z(r, e?.error.message ?? "Memory recall is unavailable.", !0);
			} catch {
				z(r, "Memory recall could not be updated.");
			} finally {
				z(n, "");
			}
		}
	}
	var a = Zc(), o = H(V(a), 2), s = (e) => {
		var n = Gc(), r = B(n);
		F(n), U(() => Y(r, `User ${t.view.scope.userId ?? ""} · Chat ${t.view.scope.chatId ?? ""} · Actor ${t.view.scope.actorId ?? ""}`)), J(e, n);
	};
	X(o, (e) => {
		t.view?.scope && e(s);
	});
	var c = H(o, 2), l = (e) => {
		var n = Kc(), i = B(n, !0);
		F(n), U(() => Y(i, W(r) || t.view?.issue)), J(e, n);
	};
	X(c, (e) => {
		(t.view?.issue || W(r)) && e(l);
	});
	var u = H(c, 2), d = (e) => {
		J(e, qc());
	};
	X(u, (e) => {
		t.view?.sets.length || e(d);
	});
	var f = H(u, 2);
	Z(f, 17, () => t.view?.sets ?? [], (e) => e.memorySetId, (e, r) => {
		var a = Xc(), o = B(a), s = B(o, !0);
		F(o);
		var c = H(o), l = B(c, !0);
		F(c);
		var u = H(c, 2), d = B(u);
		F(u);
		var f = H(u, 2), p = (e) => {
			var t = Jc(), n = B(t);
			F(t), U(() => Y(n, `Remaining: ${W(r).remainingText ?? ""}`)), J(e, t);
		};
		X(f, (e) => {
			W(r).queued && e(p);
		});
		var m = H(f, 2), h = (e) => {
			var t = Jc(), n = B(t);
			F(t), U(() => Y(n, `Pending generations: ${W(r).pendingCount ?? ""}`)), J(e, t);
		};
		X(m, (e) => {
			W(r).pendingCount && e(h);
		});
		var g = H(m, 2), _ = (e) => {
			var t = Jc(), n = B(t, !0);
			F(t), U(() => Y(n, W(r).reason)), J(e, t);
		};
		X(g, (e) => {
			W(r).reason && e(_);
		});
		var v = H(g, 2), y = B(v), b = H(y);
		F(v);
		var x = H(v, 2);
		Z(x, 21, () => W(r).linkedNodes, (e) => e.nodeId, (e, n) => {
			var r = Yc(), i = B(r), a = B(i);
			F(i), F(r), U(() => {
				i.disabled = !t.actions, Y(a, `${W(n).title ?? ""} · ${W(n).nodeId ?? ""}`);
			}), K("click", i, () => t.actions?.reveal(W(n).nodeId)), J(e, r);
		}), F(x);
		var S = H(x, 2), C = B(S);
		F(S), F(a), U((e) => {
			$(a, "data-recall-set", W(r).memorySetId), Y(s, W(r).memorySetId), Y(l, W(r).statusText), Y(d, `${W(r).targetLabel ?? ""} · ${W(r).useLabel ?? ""} · ${W(r).consumeLabel ?? ""}`), y.disabled = !!W(n) || !t.actions || !W(r).queueAllowed, $(y, "aria-label", "Queue recall " + W(r).memorySetId), b.disabled = !!W(n) || !t.actions || !W(r).cancelAllowed, $(b, "aria-label", "Cancel recall " + W(r).memorySetId), Y(C, `${W(r).nodeIds.length ?? ""} linked ${W(r).nodeIds.length === 1 ? "node" : "nodes"}${e ?? ""}`);
		}, [() => W(r).hotkeys.length ? " · " + W(r).hotkeys.map((e) => e.label).join(", ") : ""]), K("click", y, () => i(W(r).memorySetId, W(r).nodeIds, "queue")), K("click", b, () => i(W(r).memorySetId, W(r).nodeIds, "cancel")), J(e, a);
	});
	var p = H(f, 2), m = B(p);
	F(p), ke(2), U(() => m.disabled = !!W(n) || !t.actions), K("click", m, () => t.actions?.refresh()), J(e, a), Ve();
}
Sr(["click"]);
//#endregion
//#region ui/ConfigureNode.svelte
var $c = /* @__PURE__ */ q("<option class=\"svelte-1srbsqt\"> </option>"), el = /* @__PURE__ */ q("<p class=\"svelte-1srbsqt\">Authorize a document in Tools › Workflow Data, then reopen node creation.</p>"), tl = /* @__PURE__ */ q("<label class=\"svelte-1srbsqt\">Workflow data document<select aria-label=\"Workflow data document\" class=\"svelte-1srbsqt\"><option class=\"svelte-1srbsqt\">Choose an authorized target</option><!></select></label><!>", 1), nl = /* @__PURE__ */ q("<label class=\"svelte-1srbsqt\">Pinned Data helper<select aria-label=\"Pinned Data helper\" class=\"svelte-1srbsqt\"><option class=\"svelte-1srbsqt\">Choose an existing item/result helper</option><!></select></label><p class=\"svelte-1srbsqt\">Helpers use exact pinned versions with Data item and result ports. Set iteration mode and requestBoundPerIteration in the controls below.</p>", 1), rl = /* @__PURE__ */ q("<p role=\"alert\" class=\"svelte-1srbsqt\"> </p>"), il = /* @__PURE__ */ q("<div class=\"pc-workspace-overlay svelte-1srbsqt\"><div class=\"pc-workspace-dialog pc-configure-node svelte-1srbsqt\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Configure node\" tabindex=\"-1\"><header class=\"svelte-1srbsqt\"><h2 class=\"svelte-1srbsqt\"> </h2><button type=\"button\" aria-label=\"Close node configuration\" class=\"svelte-1srbsqt\">×</button></header> <p class=\"svelte-1srbsqt\">Complete the required settings before creating the node. Cancel leaves the graph unchanged.</p> <form class=\"svelte-1srbsqt\"><label class=\"svelte-1srbsqt\">Stage<select aria-label=\"Node stage\" class=\"svelte-1srbsqt\"><option class=\"svelte-1srbsqt\">Preparation</option><option class=\"svelte-1srbsqt\">Response</option></select></label> <!> <!> <label class=\"svelte-1srbsqt\">Declared node controls<textarea aria-label=\"Node controls JSON\" rows=\"14\" maxlength=\"200000\" class=\"svelte-1srbsqt\"></textarea></label> <!> <footer class=\"svelte-1srbsqt\"><button type=\"button\" class=\"svelte-1srbsqt\">Cancel</button><button type=\"submit\" class=\"svelte-1srbsqt\"> </button></footer></form></div></div>");
function al(e, t) {
	Be(t, !0);
	let n, r = /* @__PURE__ */ R(""), i = /* @__PURE__ */ R("pre"), a = /* @__PURE__ */ R(""), o = /* @__PURE__ */ R(""), s = /* @__PURE__ */ R(!1), c = /* @__PURE__ */ R(""), l = "", u = 0, d = /* @__PURE__ */ I(() => t.view.operation === "read-file" || t.view.operation === "story-clock" || t.view.operation === "commit-outcomes");
	yn(() => {
		if (t.view.key === l) return;
		l = t.view.key, u++, z(r, t.view.controls, !0), z(i, t.view.phase, !0), z(s, !1), z(c, "");
		try {
			let e = JSON.parse(W(r));
			z(a, e.targetId ?? e.clockId ?? "", !0), z(o, t.view.helpers.find((t) => JSON.stringify(t.ref) === JSON.stringify(e.helper))?.key ?? "", !0);
		} catch {
			z(a, ""), z(o, "");
		}
		let e = l;
		ur().then(() => {
			t.view.key === e && n?.querySelector("select,textarea,input")?.focus({ preventScroll: !0 });
		});
	}), ki(() => {
		let e = document.activeElement;
		return () => e?.focus({ preventScroll: !0 });
	});
	function f(e, t) {
		try {
			let n = JSON.parse(W(r));
			if (!n || Array.isArray(n) || typeof n != "object") throw Error();
			n[e] = t, z(r, JSON.stringify(n, null, 2), !0), z(c, "");
		} catch {
			z(c, "Use a JSON object before selecting a configured value.");
		}
	}
	async function p(e) {
		if (e.preventDefault(), !t.actions || W(s)) return;
		let n = t.view.key, a = ++u;
		z(s, !0), z(c, "");
		try {
			let e = await t.actions.apply(n, W(r), W(i));
			n === t.view.key && a === u && !e?.ok && z(c, e?.error?.message ?? "The node could not be prepared.", !0);
		} catch {
			n === t.view.key && a === u && z(c, "The node could not be prepared.");
		} finally {
			n === t.view.key && a === u && z(s, !1);
		}
	}
	function m(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), t.actions?.cancel(t.view.key)), e.key === "Tab") {
			let t = [...n.querySelectorAll("button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled)")], r = t[0], i = t.at(-1);
			e.shiftKey && document.activeElement === r && (e.preventDefault(), i?.focus()), !e.shiftKey && document.activeElement === i && (e.preventDefault(), r?.focus());
		}
	}
	var h = il(), g = B(h), _ = B(g), v = B(_), y = B(v);
	F(v);
	var b = H(v);
	F(_);
	var x = H(_, 4), S = B(x), C = H(B(S)), w = B(C);
	w.value = w.__value = "pre";
	var T = H(w);
	T.value = T.__value = "post", F(C), F(S);
	var E = H(S, 2), D = (e) => {
		var n = tl(), r = V(n), i = H(B(r)), o = B(i);
		o.value = o.__value = "", Z(H(o), 17, () => t.view.targets.filter((e) => !["story-clock", "commit-outcomes"].includes(t.view.operation) || e.format === "json"), (e) => e.targetId, (e, t) => {
			var n = $c(), r = B(n);
			F(n);
			var i = {};
			U(() => {
				Y(r, `${W(t).name ?? ""} (${W(t).targetId ?? ""})`), i !== (i = W(t).targetId) && (n.value = (n.__value = W(t).targetId) ?? "");
			}), J(e, n);
		}), F(i), F(r);
		var c = H(r), l = (e) => {
			J(e, el());
		};
		X(c, (e) => {
			t.view.targets.length || e(l);
		}), U(() => i.disabled = W(s)), K("change", i, () => f(t.view.operation === "story-clock" ? "clockId" : "targetId", W(a))), fi(i, () => W(a), (e) => z(a, e)), J(e, n);
	};
	X(E, (e) => {
		W(d) && e(D);
	});
	var O = H(E, 2), k = (e) => {
		var n = nl(), r = V(n), i = H(B(r)), a = B(i);
		a.value = a.__value = "", Z(H(a), 17, () => t.view.helpers, (e) => e.key, (e, t) => {
			var n = $c(), r = B(n);
			F(n);
			var i = {};
			U(() => {
				Y(r, `${W(t).label ?? ""}${W(t).stateful ? " (projected state)" : ""}`), i !== (i = W(t).key) && (n.value = (n.__value = W(t).key) ?? "");
			}), J(e, n);
		}), F(i), F(r), ke(), U(() => i.disabled = W(s)), K("change", i, () => {
			let e = t.view.helpers.find((e) => e.key === W(o));
			e && f("helper", e.ref);
		}), fi(i, () => W(o), (e) => z(o, e)), J(e, n);
	};
	X(O, (e) => {
		t.view.operation === "for-each" && e(k);
	});
	var A = H(O, 2), ee = H(B(A));
	nt(ee), F(A);
	var j = H(A, 2), te = (e) => {
		var t = rl(), n = B(t, !0);
		F(t), U(() => Y(n, W(c))), J(e, t);
	};
	X(j, (e) => {
		W(c) && e(te);
	});
	var M = H(j, 2), ne = B(M), re = H(ne), ie = B(re, !0);
	F(re), F(M), F(x), F(g), Di(g, (e) => n = e, () => n), F(h), U(() => {
		Y(y, `Configure ${t.view.title ?? ""}`), C.disabled = t.view.phaseLocked || W(s), ee.disabled = W(s), re.disabled = !t.actions || W(s), Y(ie, W(s) ? "Preparing…" : "Create node");
	}), G("keydown", g, m, !0), G("paste", g, (e) => e.stopPropagation()), K("click", b, () => t.actions?.cancel(t.view.key)), G("submit", x, p), fi(C, () => W(i), (e) => z(i, e)), Ci(ee, () => W(r), (e) => z(r, e)), K("click", ne, () => t.actions?.cancel(t.view.key)), J(e, h), Ve();
}
Sr(["click", "change"]);
//#endregion
//#region ui/DocumentPrompt.svelte
var ol = /* @__PURE__ */ q("<p class=\"svelte-ppe66w\">Save your changes before continuing, or continue without saving.</p>"), sl = /* @__PURE__ */ q("<p class=\"svelte-ppe66w\">Download a JSON copy and save it using your browser. To switch documents after downloading, repeat the action and choose Don't Save.</p>"), cl = /* @__PURE__ */ q("<div class=\"pc-workspace-overlay\"><div class=\"pc-workspace-dialog pc-document-prompt svelte-ppe66w\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Save workflow changes?\" tabindex=\"-1\"><h2 class=\"svelte-ppe66w\">Save workflow changes?</h2> <p class=\"svelte-ppe66w\"><strong class=\"svelte-ppe66w\"> </strong> has unsaved changes.</p> <!> <footer class=\"svelte-ppe66w\"><button type=\"button\" class=\"svelte-ppe66w\"> </button><button type=\"button\" class=\"svelte-ppe66w\">Don't Save</button><button type=\"button\" class=\"svelte-ppe66w\">Cancel</button></footer></div></div>");
function ll(e, t) {
	Be(t, !0);
	let n = Oi(t, "native", 3, !0), r, i;
	ki(() => {
		let e = document.activeElement;
		return i.focus({ preventScroll: !0 }), () => e?.focus({ preventScroll: !0 });
	});
	function a(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), t.actions?.choose("cancel")), e.key === "Tab") {
			let t = [...r.querySelectorAll("button:not(:disabled)")], n = t.indexOf(document.activeElement);
			e.shiftKey && n <= 0 && (e.preventDefault(), t.at(-1)?.focus()), !e.shiftKey && (n < 0 || n === t.length - 1) && (e.preventDefault(), t[0]?.focus());
		}
	}
	var o = cl(), s = B(o), c = H(B(s), 2), l = B(c), u = B(l, !0);
	F(l), ke(), F(c);
	var d = H(c, 2), f = (e) => {
		J(e, ol());
	}, p = (e) => {
		J(e, sl());
	};
	X(d, (e) => {
		n() ? e(f) : e(p, -1);
	});
	var m = H(d, 2), h = B(m), g = B(h, !0);
	F(h);
	var _ = H(h), v = H(_);
	Di(v, (e) => i = e, () => i), F(m), F(s), Di(s, (e) => r = e, () => r), F(o), U(() => {
		Y(u, t.view.name), Y(g, n() ? "Save" : "Download JSON");
	}), G("keydown", s, a, !0), G("paste", s, (e) => e.stopPropagation(), !0), K("click", h, () => t.actions?.choose("save")), K("click", _, () => t.actions?.choose("discard")), K("click", v, () => t.actions?.choose("cancel")), J(e, o), Ve();
}
Sr(["click"]);
//#endregion
//#region ui/NodeSearch.svelte
var ul = /* @__PURE__ */ q("<label class=\"pc-context-check svelte-golf61\"><input type=\"checkbox\" class=\"svelte-golf61\"/>Context sensitive</label>"), dl = /* @__PURE__ */ q("<span class=\"pc-search-context svelte-golf61\"> </span>"), fl = /* @__PURE__ */ q("<label class=\"pc-search-field svelte-golf61\"><input type=\"search\" aria-label=\"Search nodes and subgraphs\" placeholder=\"Search…\" autocomplete=\"off\" role=\"combobox\" aria-expanded=\"true\" class=\"svelte-golf61\"/></label> <!> <!>", 1), pl = /* @__PURE__ */ q("<p class=\"pc-search-context svelte-golf61\">Choose the named port to connect.</p>"), ml = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-search-result svelte-golf61\" role=\"option\"><span class=\"svelte-golf61\"> </span> <span class=\"pc-family svelte-golf61\"> </span></button>"), hl = /* @__PURE__ */ q("<p class=\"pc-empty svelte-golf61\">No nodes match.</p>"), gl = /* @__PURE__ */ q("<p class=\"pc-feedback svelte-golf61\" role=\"status\"> </p>"), _l = /* @__PURE__ */ q("<div class=\"pc-node-search svelte-golf61\" role=\"dialog\" aria-modal=\"false\" tabindex=\"-1\"><!> <div class=\"pc-search-results svelte-golf61\" role=\"listbox\"></div> <!></div>");
function vl(e, t) {
	let n = Pr();
	Be(t, !0);
	let r = Oi(t, "view", 3, null), i = Oi(t, "actions", 19, () => ({})), a = /* @__PURE__ */ R(void 0), o = /* @__PURE__ */ R(void 0), s = /* @__PURE__ */ R(""), c = /* @__PURE__ */ R(0), l = /* @__PURE__ */ R(8), u = /* @__PURE__ */ R(8), d, f, p = (e) => [
		e.label,
		e.family,
		e.purpose ?? "",
		e.shortcode ?? "",
		...e.searchAliases ?? []
	].join(" ").toLocaleLowerCase(), m = /* @__PURE__ */ I(() => (r()?.choices ?? []).filter((e) => p(e).includes(W(s).toLocaleLowerCase().trim()))), h = /* @__PURE__ */ I(() => r()?.mode === "ports" ? r().ports : W(m)), g = (e) => "id" in e ? e.id : e.portId, _ = (e) => !!r()?.readOnly || "disabledReason" in e && !!e.disabledReason, v = /* @__PURE__ */ I(() => W(h).filter((e) => !_(e))), y = /* @__PURE__ */ I(() => W(v)[Math.min(W(c), Math.max(0, W(v).length - 1))]), b = (e) => ({
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
		z(l, Math.max(8, Math.min(r().screenAnchor.x, t - e.width - 8)), !0), z(u, Math.max(8, Math.min(r().screenAnchor.y, n - e.height - 8)), !0);
	}
	yn(() => {
		let e = r()?.key, t = r()?.mode, n = r()?.screenAnchor;
		if (e === void 0 || !n) return;
		let i = d !== e || f !== t;
		d !== e && z(s, ""), i && z(c, 0), d = e, f = t, ur().then(() => {
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
		].includes(e.key) ? (e.preventDefault(), z(c, e.key === "Home" ? 0 : e.key === "End" ? Math.max(0, W(v).length - 1) : W(v).length ? (W(c) + (e.key === "ArrowDown" ? 1 : -1) + W(v).length) % W(v).length : 0, !0)) : e.key === "Enter" && (e.preventDefault(), S(W(y)));
	}
	yn(() => {
		if (!r()) return;
		let e = (e) => {
			W(a) && !W(a).contains(e.target) && i().dismiss?.();
		};
		return window.addEventListener("pointerdown", e, !0), () => window.removeEventListener("pointerdown", e, !0);
	});
	var T = Nr();
	G("resize", en, x);
	var E = V(T), D = (e) => {
		var t = _l();
		let i;
		var d = B(t), f = (e) => {
			var t = fl(), i = V(t), a = B(i);
			Q(a), Di(a, (e) => z(o, e), () => W(o)), F(i);
			var l = H(i, 2), u = (e) => {
				var t = ul(), n = B(t);
				Q(n), ke(), F(t), U(() => {
					yi(n, r().contextSensitive), n.disabled = r().readOnly;
				}), K("change", n, C), J(e, t);
			};
			X(l, (e) => {
				r().origin && e(u);
			});
			var d = H(l, 2), f = (e) => {
				var t = dl(), n = B(t, !0);
				F(t), U(() => Y(n, (r().origin.dir === "out" ? "Accepts " : "Produces ") + r().origin.kind)), J(e, t);
			};
			X(d, (e) => {
				r().origin && e(f);
			}), U((e) => {
				$(a, "aria-controls", n + "-results"), $(a, "aria-activedescendant", e);
			}, [() => W(y) ? n + "-item-" + W(h).indexOf(W(y)) : void 0]), K("input", a, () => z(c, 0)), Ci(a, () => W(s), (e) => z(s, e)), J(e, t);
		}, p = (e) => {
			J(e, pl());
		};
		X(d, (e) => {
			r().mode === "nodes" ? e(f) : e(p, -1);
		});
		var m = H(d, 2);
		Z(m, 21, () => W(h), (e) => g(e), (e, t) => {
			var r = ml(), i = B(r), a = B(i, !0);
			F(i);
			var o = H(i, 1, !0);
			o.nodeValue = " ";
			var s = H(o);
			let l;
			var u = B(s, !0);
			F(s), F(r), U((e, n, i, o) => {
				$(r, "aria-selected", W(y) === W(t)), $(r, "id", e), $(r, "data-choice", "id" in W(t) ? W(t).id : void 0), $(r, "data-port", "portId" in W(t) ? W(t).portId : void 0), r.disabled = n, $(r, "title", "disabledReason" in W(t) ? W(t).disabledReason : void 0), Y(a, i), l = li(s, "", l, o), Y(u, "family" in W(t) ? W(t).family : W(t).kind);
			}, [
				() => n + "-item-" + W(h).indexOf(W(t)),
				() => _(W(t)),
				() => W(t).label || g(W(t)),
				() => ({ color: "family" in W(t) ? b(W(t).family) : void 0 })
			]), K("click", r, () => S(W(t))), G("focus", r, () => {
				let e = W(v).indexOf(W(t));
				e >= 0 && z(c, e, !0);
			}), J(e, r);
		}, (e) => {
			J(e, hl());
		}), F(m);
		var x = H(m, 2), T = (e) => {
			var t = gl(), n = B(t, !0);
			F(t), U(() => Y(n, r().feedback)), J(e, t);
		};
		X(x, (e) => {
			r().feedback && e(T);
		}), F(t), Di(t, (e) => z(a, e), () => W(a)), U(() => {
			$(t, "aria-label", r().mode === "ports" ? "Choose connection port" : "Add node"), i = li(t, "", i, {
				left: `${W(l) ?? ""}px`,
				top: `${W(u) ?? ""}px`
			}), $(m, "id", n + "-results"), $(m, "aria-label", r().mode === "ports" ? "Compatible ports" : "Nodes and subgraphs");
		}), K("keydown", t, w), J(e, t);
	};
	X(E, (e) => {
		r() && e(D);
	}), J(e, T), Ve();
}
Sr([
	"keydown",
	"input",
	"change",
	"click"
]);
//#endregion
//#region ui/PinMenu.svelte
var yl = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-pin-action svelte-i73q0t\"> </button>"), bl = /* @__PURE__ */ q("<p class=\"pc-empty svelte-i73q0t\">No attached links.</p>"), xl = /* @__PURE__ */ q("<div class=\"pc-pin-menu svelte-i73q0t\" role=\"dialog\" aria-label=\"Pin actions\" aria-modal=\"false\" tabindex=\"-1\"><div class=\"pc-menu-head svelte-i73q0t\"><h2 class=\"svelte-i73q0t\"> </h2><button type=\"button\" aria-label=\"Close pin actions\" class=\"svelte-i73q0t\">Close</button></div> <p class=\"pc-kind svelte-i73q0t\"> </p> <!></div>");
function Sl(e, t) {
	Be(t, !0);
	let n = Oi(t, "view", 3, null), r = Oi(t, "actions", 19, () => ({})), i = /* @__PURE__ */ R(void 0), a = /* @__PURE__ */ R(8), o = /* @__PURE__ */ R(8), s, c = (e) => !!e.disabled || !!n()?.readOnly && e.capability !== "navigation";
	function l() {
		if (!n() || !W(i)) return;
		let e = W(i).getBoundingClientRect(), t = document.documentElement.clientWidth || window.innerWidth, r = document.documentElement.clientHeight || window.innerHeight;
		z(a, Math.max(8, Math.min(n().screenAnchor.x, t - e.width - 8)), !0), z(o, Math.max(8, Math.min(n().screenAnchor.y, r - e.height - 8)), !0);
	}
	yn(() => {
		let e = n()?.key, t = n()?.screenAnchor;
		if (e === void 0 || !t) return;
		let r = s !== e;
		s = e, ur().then(() => {
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
	var f = Nr();
	G("resize", en, l);
	var p = V(f), m = (e) => {
		var t = xl();
		let s;
		var l = B(t), f = B(l), p = B(f, !0);
		F(f);
		var m = H(f);
		F(l);
		var h = H(l, 2), g = B(h);
		F(h), Z(H(h, 2), 17, () => n().entries, (e) => e.id, (e, t) => {
			var n = yl(), r = B(n, !0);
			F(n), U((e) => {
				$(n, "data-entry", W(t).id), n.disabled = e, $(n, "title", W(t).reason), Y(r, W(t).label);
			}, [() => c(W(t))]), K("click", n, () => u(W(t))), J(e, n);
		}, (e) => {
			J(e, bl());
		}), F(t), Di(t, (e) => z(i, e), () => W(i)), U(() => {
			s = li(t, "", s, {
				left: `${W(a) ?? ""}px`,
				top: `${W(o) ?? ""}px`
			}), Y(p, n().title), Y(g, `${n().kind ?? ""}${n().readOnly ? " · Read only" : ""}`);
		}), K("keydown", t, d), K("click", m, () => r().dismiss?.()), J(e, t);
	};
	X(p, (e) => {
		n() && e(m);
	}), J(e, f), Ve();
}
Sr(["keydown", "click"]);
//#endregion
//#region src/ui/node-palette.js
var Cl = "M3 7 12 2l9 5v10l-9 5-9-5ZM3 7l9 5 9-5M12 12v10", wl = "M3 6l4-2 4 2v5l-4 2-4-2ZM3 6l4 2 4-2M7 8v5M13 6l4-2 4 2v5l-4 2-4-2ZM13 6l4 2 4-2M17 8v5M8 15l4-2 4 2v5l-4 2-4-2ZM8 15l4 2 4-2M12 17v5", Tl = Object.freeze([
	{
		name: "Input",
		color: "#96ad52",
		icon: Cl
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
		icon: Cl
	},
	{
		name: "Subgraphs",
		color: "#a3aa99",
		icon: wl
	}
].map((e) => Object.freeze(e))), El = {
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
	Library: wl,
	Routing: "M3 12h18m-7-7 7 7-7 7",
	Blocks: Cl,
	Reflect: "M21 12s-4-7-9-7-9 7-9 7 4 7 9 7 9-7 9-7ZM15 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0",
	Internalize: "M4 4h16v16H4M8 8l4 4 4-4M12 12v5",
	Express: "M4 4h16v12H9l-5 4ZM8 8h8M8 12h5",
	Memory: "M5 3h14v18H5ZM8 7h8M8 11h8M8 15h5",
	State: "M3 12h4l3-7 4 14 3-7h4"
}, Dl = Object.freeze(Object.fromEntries(Object.entries(El).map(([e, t]) => [e, Object.freeze({
	name: e,
	icon: t
})]))), Ol = {
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
		El.Planning
	],
	compose: [
		"Assembly",
		"co",
		El.Assembly
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
		El.Validation
	],
	"json-decode": [
		"Parsing",
		"jd",
		El.Parsing
	],
	"select-fields": [
		"Extraction",
		"sf",
		El.Extraction
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
		El.Delivery
	],
	reroute: [
		"Routing",
		"rt",
		El.Routing
	],
	reflect: [
		"Reflect",
		"rf",
		El.Reflect
	],
	internalize: [
		"Internalize",
		"in",
		El.Internalize
	],
	express: [
		"Express",
		"ex",
		El.Express
	],
	context: [
		"Context",
		"cx",
		El.Context
	],
	memory: [
		"Memory",
		"mm",
		El.Memory
	],
	state: [
		"State",
		"sv",
		El.State
	]
}, kl = Object.freeze(Object.fromEntries(Object.entries(Ol).map(([e, [t, n, r]]) => [e, Object.freeze({
	group: t,
	shortcode: n,
	icon: r
})]))), Al = Object.freeze({
	group: "Blocks",
	shortcode: "",
	icon: Cl
}), jl = (e) => Object.hasOwn(kl, e) ? kl[e] : Al, Ml = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-family-row\" aria-haspopup=\"menu\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path></path></svg><span> </span></button>"), Nl = /* @__PURE__ */ q("<button type=\"button\" role=\"menuitem\">‹ Families</button>"), Pl = /* @__PURE__ */ q("<input class=\"text_pole\" aria-label=\"Search nodes\" placeholder=\"Search nodes…\"/>"), Fl = /* @__PURE__ */ q("<div class=\"pc-shelf-group svelte-hk6fzp\" role=\"presentation\"> </div>"), Il = /* @__PURE__ */ q("<!> <button type=\"button\" role=\"menuitem\" class=\"svelte-hk6fzp\"><svg class=\"pc-leaf-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path></path></svg><span class=\"pc-catalog-name\"> </span><small> </small></button>", 1), Ll = /* @__PURE__ */ q("<div role=\"menu\" tabindex=\"-1\"><!> <!> <!></div>"), Rl = /* @__PURE__ */ q("<div class=\"pc-shelf-menu pc-shelf-subgraph-menu svelte-hk6fzp\" role=\"menu\" tabindex=\"-1\"><button type=\"button\" role=\"menuitem\" data-shelf-subgraph-action=\"open\">Open saved definition</button> <button type=\"button\" role=\"menuitem\" data-shelf-subgraph-action=\"delete\">Delete</button></div>"), zl = /* @__PURE__ */ q("<div class=\"pc-shelf-drag-preview svelte-hk6fzp\" aria-hidden=\"true\"> </div>"), Bl = /* @__PURE__ */ q("<nav aria-label=\"Node families\"></nav> <!> <!> <!>", 1);
function Vl(e, t) {
	Be(t, !0);
	let n = Oi(t, "readOnly", 3, !1), r, i = /* @__PURE__ */ R(null), a = /* @__PURE__ */ R(""), o = /* @__PURE__ */ R(!1), s = /* @__PURE__ */ R(""), c = /* @__PURE__ */ R(!1), l = /* @__PURE__ */ R(0), u = /* @__PURE__ */ R(0), d = null, f = 0, p = /* @__PURE__ */ R(null), m = /* @__PURE__ */ R(null), h = null, g = Tl.map((e) => e.name), _ = (e) => Tl.find((t) => t.name === e)?.color, v = null, y = null, b = null, x = /* @__PURE__ */ R(null);
	function S() {
		y !== null && clearTimeout(y), y = null;
		let e = v;
		v = null, z(x, null), document.body.classList.remove("pc-shelf-dragging"), e?.button.hasPointerCapture?.(e.pointerId) && e.button.releasePointerCapture(e.pointerId);
	}
	function C() {
		v && (y !== null && clearTimeout(y), y = null, b = v.button, document.body.classList.add("pc-shelf-dragging"), z(x, {
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
		}, !W(x) && Math.hypot(e.clientX - v.start.x, e.clientY - v.start.y) >= 5 && C(), W(x) && (e.preventDefault(), z(x, {
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
				let i = n.id.startsWith("operation:") ? n.id.split(":")[1] : "", a = jl(i), o = i ? n.label.split(" · ")[0] : n.label, s = n.id.startsWith("boundary:");
				return {
					...n,
					title: o,
					compatible: !n.disabledReason && !!t.choose,
					catalog: !0,
					shortcode: i ? a.shortcode || n.shortcode || "" : n.shortcode ?? a.shortcode,
					group: e === "Subgraphs" ? s ? "Interface" : "Library" : void 0,
					icon: e === "Subgraphs" ? s ? Dl.Routing.icon : Dl.Library.icon : a.icon,
					searchAliases: r
				};
			});
		}
		let n = t.view?.families.find((t) => t.name === e);
		return n ? n.operations.filter((t) => e !== "Surface" || !["pattern-scan", "validate-patches"].includes(t.id)).map((t) => ({
			...t,
			...jl(t.id),
			family: e
		})) : [];
	}
	function k(e = !1) {
		z(p, null), e && h?.focus({ preventScroll: !0 });
	}
	function A(e = !1) {
		S(), f++, z(a, ""), z(o, !1), k(), e && d?.focus({ preventScroll: !0 });
	}
	let ee;
	yn(() => {
		let e = t.view?.graphId, r = n(), i = JSON.stringify(g.flatMap((e) => O(e).map((e) => [
			e.id,
			e.title,
			e.compatible,
			e.phase,
			e.family,
			e.shortcode,
			e.icon,
			e.group,
			e.purpose,
			e.searchAliases,
			e.disabledReason,
			e.catalog,
			e.definitionRef?.id,
			e.definitionRef?.version,
			e.definitionRef?.semanticHash
		])));
		ee && (e !== ee.scope || i !== ee.catalog || r !== ee.locked) && A(), ee = {
			scope: e,
			catalog: i,
			locked: r
		};
	}), Ai(() => A());
	function j() {
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
		let i = j(), a = i.right - e.right - 6, o = e.left - i.left - 6, s = a >= t || o >= t, c = a >= t ? e.right - i.left + 3 : o >= t ? e.left - i.left - t - 3 : 13;
		return {
			x: Math.max(4, Math.min(c, i.width - t - 4)),
			y: Math.max(4, Math.min(e.top - i.top, i.height - n - 4)),
			compact: !s || i.width < t + r + 26
		};
	}
	function M(e, t, n) {
		let r = t.querySelector("button")?.getBoundingClientRect();
		return r ? e.top + (e.height - r.height) / 2 - (r.top - n.top) : e.top;
	}
	async function ne(e, t, n = !0) {
		if (v) return;
		if (k(), W(a) === e) {
			n && W(i)?.querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
			return;
		}
		let r = ++f;
		if (z(a, e, !0), z(o, !1), d = t, await ur(), r !== f || W(a) !== e || !W(i)?.isConnected) return;
		let s = t.getBoundingClientRect(), p = W(i).getBoundingClientRect(), m = te({
			top: M(s, W(i), p),
			left: s.left,
			right: s.right
		}, p.width, p.height, 128);
		z(l, m.x, !0), z(u, m.y, !0), z(c, m.compact, !0), n && W(i).querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
	}
	async function re() {
		let e = ++f;
		if (z(a, ""), z(o, !0), z(s, ""), await ur(), e !== f || !W(o) || !W(i)?.isConnected) return;
		let t = j();
		z(l, Math.min(136, Math.max(4, t.width - 254)), !0), z(u, 13), W(i).querySelector("input")?.focus();
	}
	function ie(e, r) {
		let i = O(e.family).find((t) => t.id === e.id);
		i?.compatible && !n() && (A(!0), r ? i.catalog ? t.choose?.(i.id, r) : t.add(i.id, r) : i.catalog ? t.choose?.(i.id) : t.add(i.id));
	}
	async function ae(e, n) {
		let r = O("Subgraphs").find((t) => t.id === e.dataset.shelfChoice);
		if (!r?.definitionRef || !t.shelfSubgraph) return;
		let i = j(), a = e.getBoundingClientRect();
		if (h = e, z(p, {
			id: r.id,
			title: r.title,
			x: (n?.x ?? a.right) - i.left,
			y: (n?.y ?? a.top) - i.top
		}, !0), await ur(), !W(p) || W(p).id !== r.id || !W(m)?.isConnected) return;
		let o = W(m).getBoundingClientRect();
		z(p, {
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
			e.preventDefault(), e.stopPropagation(), ne(t.dataset.family, t);
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
	var le = { openSearch: re }, ue = Bl();
	G("pointerdown", en, (e) => {
		e.target.closest(".pc-node-shelf, .pc-shelf-menu") || A();
	}), G("pointermove", en, T), G("pointerup", en, E), G("pointercancel", en, () => S()), G("blur", en, () => A()), G("resize", en, () => A()), G("keydown", en, (e) => {
		v && e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), A(!0));
	});
	var de = V(ue);
	Z(de, 21, () => Tl, Ur, (e, t) => {
		var n = Ml();
		let r;
		var i = B(n), o = B(i);
		F(i);
		var s = H(i), c = B(s, !0);
		F(s), F(n), U((e) => {
			$(n, "data-family", W(t).name), n.disabled = e, $(n, "title", "Browse " + W(t).name + " nodes"), $(n, "aria-expanded", W(a) === W(t).name), r = li(n, "", r, { "--pc-family": W(t).color }), $(o, "d", W(t).icon), Y(c, W(t).name);
		}, [() => !O(W(t).name).length]), K("click", n, (e) => ne(W(t).name, e.currentTarget)), G("pointerenter", n, (e) => {
			e.pointerType !== "touch" && !e.currentTarget.disabled && ne(W(t).name, e.currentTarget, !1);
		}), K("keydown", n, ce), J(e, n);
	}), F(de), Di(de, (e) => r = e, () => r);
	var fe = H(de, 2), pe = (e) => {
		let r = /* @__PURE__ */ I(() => W(o) ? g.flatMap((e) => O(e)).filter((e) => [
			e.title,
			e.id,
			e.family,
			e.purpose,
			e.shortcode,
			...e.searchAliases ?? []
		].join(" ").toLowerCase().includes(W(s).toLowerCase())) : O());
		var d = Ll();
		let f;
		var p = B(d), m = (e) => {
			var t = Nl();
			K("click", t, () => A(!0)), J(e, t);
		};
		X(p, (e) => {
			W(c) && W(a) && e(m);
		});
		var h = H(p, 2), v = (e) => {
			var t = Pl();
			Q(t), Ci(t, () => W(s), (e) => z(s, e)), J(e, t);
		};
		X(h, (e) => {
			W(o) && e(v);
		}), Z(H(h, 2), 19, () => W(r), (e) => e.family + e.id, (e, i, a) => {
			let s = /* @__PURE__ */ I(() => !W(i).compatible || n()), c = /* @__PURE__ */ I(() => !!W(i).definitionRef && !!t.shelfSubgraph);
			var l = Il(), u = V(l), d = (e) => {
				var t = Fl(), n = B(t, !0);
				F(t), U(() => {
					$(t, "data-shelf-group", W(i).group), Y(n, W(i).group);
				}), J(e, t);
			};
			X(u, (e) => {
				!W(o) && W(i).group && W(r)[W(a) - 1]?.group !== W(i).group && e(d);
			});
			var f = H(u, 2);
			let p;
			var m = B(f), h = B(m);
			F(m);
			var g = H(m), v = B(g, !0);
			F(g);
			var y = H(g), b = B(y, !0);
			F(y), F(f), U((e) => {
				$(f, "data-shelf-choice", W(i).id), $(f, "data-insertion-disabled", W(s)), f.disabled = W(s) && !W(c), $(f, "aria-disabled", W(s) && !W(c)), $(f, "aria-haspopup", W(c) ? "menu" : void 0), $(f, "title", n() ? W(c) ? "This graph is read-only. Right-click for subgraph actions." : "This graph is read-only." : W(i).disabledReason || (W(i).compatible ? W(i).purpose || "Add " + W(i).title : "Requires the " + W(i).phase + " phase")), p = li(f, "", p, e), $(h, "d", W(i).icon), Y(v, W(i).title), Y(b, W(i).shortcode);
			}, [() => ({ "--pc-family": _(W(i).family) })]), K("pointerdown", f, (e) => w(e, W(i))), G("lostpointercapture", f, () => S()), K("click", f, (e) => D(e, W(i))), J(e, l);
		}), F(d), Di(d, (e) => z(i, e), () => W(i)), U((e) => {
			si(d, 1, `pc-shelf-menu ${W(o) ? "pc-leaf-menu" : "pc-family-menu"}`, "svelte-hk6fzp"), $(d, "aria-label", W(o) ? "Search nodes" : W(a) + " nodes"), f = li(d, "", f, e);
		}, [() => ({
			left: `${W(l)}px`,
			top: `${W(u)}px`,
			"--pc-family": _(W(a))
		})]), K("keydown", d, ce), K("contextmenu", d, oe), J(e, d);
	};
	X(fe, (e) => {
		(W(a) || W(o)) && e(pe);
	});
	var me = H(fe, 2), he = (e) => {
		var t = Rl();
		let n;
		var r = B(t), i = H(r, 2);
		F(t), Di(t, (e) => z(m, e), () => W(m)), U(() => {
			$(t, "aria-label", W(p).title + " actions"), n = li(t, "", n, {
				left: `${W(p).x}px`,
				top: `${W(p).y}px`
			});
		}), K("keydown", t, ce), K("click", r, () => se("open")), K("click", i, () => se("delete")), J(e, t);
	};
	X(me, (e) => {
		W(p) && e(he);
	});
	var ge = H(me, 2), _e = (e) => {
		var t = zl();
		let n;
		var r = B(t, !0);
		F(t), U((e) => {
			n = li(t, "", n, e), Y(r, W(x).title);
		}, [() => ({
			"--pc-family": _(W(x).family),
			left: `${W(x).x + 12}px`,
			top: `${W(x).y + 12}px`
		})]), J(e, t);
	};
	return X(ge, (e) => {
		W(x) && e(_e);
	}), U(() => si(de, 1, `pc-node-shelf${W(c) && W(a) ? " pc-shelf-replaced" : ""}`, "svelte-hk6fzp")), J(e, ue), Ve(le);
}
Sr([
	"click",
	"keydown",
	"contextmenu",
	"pointerdown"
]);
//#endregion
//#region ui/ExamplesBrowser.svelte
var Hl = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-btn menu_button svelte-18p7ib8\">Retry</button>"), Ul = /* @__PURE__ */ q("<div class=\"pc-examples-issue svelte-18p7ib8\" role=\"alert\"><span class=\"svelte-18p7ib8\"> </span><!></div>"), Wl = /* @__PURE__ */ jr("<g class=\"pc-example-comment svelte-18p7ib8\"><rect rx=\"4\" class=\"svelte-18p7ib8\"></rect><text class=\"svelte-18p7ib8\"> </text></g>"), Gl = /* @__PURE__ */ jr("<path class=\"pc-wire pc-wire-native svelte-18p7ib8\"></path>"), Kl = /* @__PURE__ */ jr("<circle class=\"pc-example-pin-dot svelte-18p7ib8\" r=\"4\"></circle><path class=\"pc-example-pin-cue svelte-18p7ib8\"></path><text class=\"pc-example-pin-label svelte-18p7ib8\"> </text>", 1), ql = /* @__PURE__ */ jr("<g><rect class=\"pc-example-card svelte-18p7ib8\" rx=\"4\"></rect><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\"><path class=\"pc-example-icon svelte-18p7ib8\"></path></svg><text class=\"pc-example-node-title svelte-18p7ib8\" lengthAdjust=\"spacingAndGlyphs\"> </text><!></g>"), Jl = /* @__PURE__ */ jr("<svg class=\"pc-example-preview svelte-18p7ib8\" preserveAspectRatio=\"xMidYMid meet\" aria-hidden=\"true\" focusable=\"false\"><!><!><!></svg>"), Yl = /* @__PURE__ */ q("<span class=\"pc-example-unavailable-preview svelte-18p7ib8\"><strong class=\"svelte-18p7ib8\">Unavailable</strong><span class=\"svelte-18p7ib8\"> </span></span>"), Xl = /* @__PURE__ */ q("<button type=\"button\"><!> <span class=\"pc-example-title svelte-18p7ib8\"> </span></button>"), Zl = /* @__PURE__ */ q("<!> <div class=\"pc-examples-grid svelte-18p7ib8\"></div>", 1);
function Ql(e, t) {
	Be(t, !0);
	let n = {
		context: "M -4,0 a 4,4 0 1,0 8,0 a 4,4 0 1,0 -8,0",
		text: "M -3.4,0 a 3.4,3.4 0 1,0 6.8,0 a 3.4,3.4 0 1,0 -6.8,0",
		data: "M -4,-4 H 4 V 4 H -4 Z",
		guidance: "M 0,-5 L 5,0 L 0,5 L -5,0 Z",
		draft: "M 0,-5 L 4.76,-1.55 L 2.94,4.05 L -2.94,4.05 L -4.76,-1.55 Z",
		findings: "M 0,-5 L 4.33,3 L -4.33,3 Z",
		patches: "M -2.5,-4.33 L 2.5,-4.33 L 5,0 L 2.5,4.33 L -2.5,4.33 L -5,0 Z",
		candidate: "M -1.5,-5 H 1.5 V -1.5 H 5 V 1.5 H 1.5 V 5 H -1.5 V 1.5 H -5 V -1.5 H -1.5 Z"
	}, r = Oi(t, "examples", 19, () => []), i = Oi(t, "issue", 3, ""), a = Oi(t, "scrollTop", 3, 0), o, s = /* @__PURE__ */ R("");
	ki(() => {
		o.scrollTop = a();
	});
	async function c(e) {
		if (!W(s)) {
			z(s, e, !0);
			try {
				await t.open(e);
			} finally {
				z(s, "");
			}
		}
	}
	var l = Zl(), u = V(l), d = (e) => {
		var n = Ul(), r = B(n), a = B(r, !0);
		F(r);
		var o = H(r), s = (e) => {
			var n = Hl();
			K("click", n, () => t.retry?.()), J(e, n);
		};
		X(o, (e) => {
			t.retry && e(s);
		}), F(n), U(() => Y(a, i())), J(e, n);
	};
	X(u, (e) => {
		i() && e(d);
	});
	var f = H(u, 2);
	Z(f, 21, r, (e) => e.id, (e, t) => {
		let r = /* @__PURE__ */ I(() => W(t).thumbnail);
		var i = Xl();
		let a;
		var o = B(i), l = (e) => {
			var t = Jl(), i = B(t);
			Z(i, 17, () => W(r).comments, (e) => e.id, (e, t) => {
				var n = Wl(), r = B(n);
				let i;
				var a = H(r), o = B(a, !0);
				F(a), F(n), U(() => {
					$(n, "data-id", W(t).id), $(r, "x", W(t).x), $(r, "y", W(t).y), $(r, "width", W(t).w), $(r, "height", W(t).h), i = li(r, "", i, { stroke: W(t).color }), $(a, "x", W(t).x + 12), $(a, "y", W(t).y + 24), Y(o, W(t).title);
				}), J(e, n);
			});
			var a = H(i);
			Z(a, 17, () => W(r).wires, (e) => e.id, (e, t) => {
				var n = Gl();
				U(() => {
					$(n, "data-kind", W(t).kind), $(n, "data-id", W(t).id), $(n, "d", W(t).d);
				}), J(e, n);
			}), Z(H(a), 17, () => W(r).nodes, (e) => e.id, (e, t) => {
				var r = ql(), i = B(r), a = H(i), o = B(a);
				F(a);
				var s = H(a), c = B(s, !0);
				F(s), Z(H(s), 17, () => W(t).ports, (e) => e.id, (e, t) => {
					var r = Kl(), i = V(r), a = H(i), o = H(a), s = B(o, !0);
					F(o), U(() => {
						$(i, "data-kind", W(t).kind), $(i, "cx", W(t).x), $(i, "cy", W(t).y), $(a, "data-kind", W(t).kind), $(a, "transform", `translate(${W(t).x} ${W(t).y})`), $(a, "d", n[W(t).kind] ?? n.context), $(o, "x", W(t).x + (W(t).dir === "in" ? 9 : -9)), $(o, "y", W(t).y + 4), $(o, "text-anchor", W(t).dir === "in" ? "start" : "end"), Y(s, W(t).label);
					}), J(e, r);
				}), F(r), U(() => {
					si(r, 0, ti(W(t).className), "svelte-18p7ib8"), $(r, "data-id", W(t).id), $(i, "x", W(t).x), $(i, "y", W(t).y), $(i, "width", W(t).w), $(i, "height", W(t).h), $(a, "x", W(t).x + 8), $(a, "y", W(t).y + 7), $(o, "d", W(t).iconPath), $(s, "x", W(t).x + 28), $(s, "y", W(t).y + 20), $(s, "textLength", W(t).title.length * 6 > W(t).w - 36 ? W(t).w - 36 : void 0), Y(c, W(t).title);
				}), J(e, r);
			}), F(t), U(() => $(t, "viewBox", `${W(r).bounds.x} ${W(r).bounds.y} ${W(r).bounds.w} ${W(r).bounds.h}`)), J(e, t);
		}, u = (e) => {
			var n = Yl(), r = H(B(n)), i = B(r, !0);
			F(r), F(n), U(() => {
				$(r, "id", `pc-example-issue-${W(t).number}`), Y(i, W(t).issue);
			}), J(e, n);
		};
		X(o, (e) => {
			W(r) ? e(l) : e(u, -1);
		});
		var d = H(o, 2), f = B(d, !0);
		F(d), F(i), U(() => {
			a = si(i, 1, "pc-example-tile svelte-18p7ib8", null, a, { "pc-example-unavailable": !W(r) }), $(i, "aria-label", W(t).title), $(i, "aria-describedby", W(t).issue ? `pc-example-issue-${W(t).number}` : void 0), $(i, "title", W(t).issue || W(t).goal), i.disabled = !!W(s) || !W(r), Y(f, W(t).title);
		}), K("click", i, () => c(W(t).id)), J(e, i);
	}), F(f), Di(f, (e) => o = e, () => o), U(() => $(f, "aria-busy", !!W(s))), G("scroll", f, () => t.scroll(o.scrollTop)), J(e, l), Ve();
}
Sr(["click"]);
//#endregion
//#region ui/ImportReview.svelte
var $l = /* @__PURE__ */ q("<p> </p>"), eu = /* @__PURE__ */ q("<li> </li>"), tu = /* @__PURE__ */ q("<h3>Saved bindings to review</h3><ul></ul>", 1), nu = /* @__PURE__ */ q("<p>Saved model metadata is present. Review local connections before running.</p>"), ru = /* @__PURE__ */ q("<h3>Imported terminal effects</h3><ul></ul>", 1), iu = /* @__PURE__ */ q("<p>No imported terminal effects.</p>"), au = /* @__PURE__ */ q("<p role=\"alert\"> </p>"), ou = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-btn menu_button\">Prepare again</button>"), su = /* @__PURE__ */ q("<div class=\"pc-workspace-overlay pc-import-overlay\"><div class=\"pc-workspace-dialog pc-import-review\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Import into graph\" tabindex=\"-1\"><header><h2>Import into graph</h2><button type=\"button\" class=\"pc-btn menu_button\" aria-label=\"Cancel import\">×</button></header> <p><strong> </strong> <small> </small></p> <dl><dt>Phase</dt><dd> </dd><dt>Additions</dt><dd> </dd><dt>Conservative request bound</dt><dd> </dd></dl> <p class=\"pc-import-explanation\">This authoring bound includes unfinished branches. Bindings and reachable execution are checked when you explicitly run the workflow.</p> <!> <!> <!> <p>Insertion keeps internal wiring and relative layout. Review the inserted nodes before running the workflow.</p> <!> <footer><button type=\"button\" class=\"pc-btn menu_button\">Cancel</button><!><button type=\"button\" class=\"pc-btn menu_button pc-import-accept\">Insert into graph</button></footer></div></div>");
function cu(e, t) {
	Be(t, !0);
	let n;
	ki(() => {
		let e = document.activeElement;
		return n.querySelector("button")?.focus(), () => e?.focus({ preventScroll: !0 });
	});
	function r(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), t.actions.cancelImport?.()), e.key === "Tab") {
			let t = [...n.querySelectorAll("button:not(:disabled)")], r = t[0], i = t.at(-1);
			e.shiftKey && document.activeElement === r && (e.preventDefault(), i?.focus()), !e.shiftKey && document.activeElement === i && (e.preventDefault(), r?.focus());
		}
	}
	var i = su(), a = B(i), o = B(a), s = H(B(o));
	F(o);
	var c = H(o, 2), l = B(c), u = B(l, !0);
	F(l);
	var d = H(l, 2), f = B(d, !0);
	F(d), F(c);
	var p = H(c, 2), m = H(B(p)), h = B(m, !0);
	F(m);
	var g = H(m, 2), _ = B(g);
	F(g);
	var v = H(g, 2), y = B(v);
	F(v), F(p);
	var b = H(p, 4), x = (e) => {
		var n = $l(), r = B(n);
		F(n), U((e) => Y(r, `Imported model roles: ${e ?? ""}.`), [() => t.view.requiredRoles.join(", ")]), J(e, n);
	};
	X(b, (e) => {
		t.view.requiredRoles.length && e(x);
	});
	var S = H(b, 2), C = (e) => {
		var n = tu(), r = H(V(n));
		Z(r, 21, () => t.view.unresolvedBindings, Ur, (e, t) => {
			var n = eu(), r = B(n);
			F(n), U((e) => Y(r, `${W(t).title ?? ""} · ${W(t).role ?? ""}: missing ${e ?? ""}`), [() => W(t).missing.join(" and ")]), J(e, n);
		}), F(r), J(e, n);
	}, w = (e) => {
		J(e, nu());
	};
	X(S, (e) => {
		t.view.unresolvedBindings.length ? e(C) : t.view.bindingReviewRequired && e(w, 1);
	});
	var T = H(S, 2), E = (e) => {
		var n = ru(), r = H(V(n));
		Z(r, 21, () => t.view.terminals, Ur, (e, t) => {
			var n = eu(), r = B(n);
			F(n), U(() => Y(r, `${W(t).title ?? ""} · ${W(t).operation ?? ""}`)), J(e, n);
		}), F(r), J(e, n);
	}, D = (e) => {
		J(e, iu());
	};
	X(T, (e) => {
		t.view.terminals.length ? e(E) : e(D, -1);
	});
	var O = H(T, 4), k = (e) => {
		var n = au(), r = B(n, !0);
		F(n), U(() => Y(r, t.view.error)), J(e, n);
	};
	X(O, (e) => {
		t.view.error && e(k);
	});
	var A = H(O, 2), ee = B(A), j = H(ee), te = (e) => {
		var n = ou();
		K("click", n, () => t.actions.prepareImportAgain?.()), J(e, n);
	};
	X(j, (e) => {
		t.view.error && e(te);
	});
	var M = H(j);
	F(A), F(a), Di(a, (e) => n = e, () => n), F(i), U(() => {
		Y(u, t.view.name), Y(f, t.view.fileName), Y(h, t.view.phase), Y(_, `${t.view.nodeCount ?? ""} blocks · ${t.view.wireCount ?? ""} wires · ${t.view.groupCount ?? ""} groups`), Y(y, `${t.view.callBound ?? ""} total · ${t.view.importedCallBound ?? ""} imported`), M.disabled = !!t.view.error;
	}), K("keydown", a, r), G("paste", a, (e) => e.stopPropagation()), K("click", s, () => t.actions.cancelImport?.()), K("click", ee, () => t.actions.cancelImport?.()), K("click", M, () => t.actions.acceptImport?.()), J(e, i), Ve();
}
Sr(["keydown", "click"]);
//#endregion
//#region ui/Workbench.svelte
var lu = /* @__PURE__ */ q("<p class=\"pc-native-diagnostic svelte-1dr9aew\" role=\"alert\"> </p>"), uu = /* @__PURE__ */ q("<p>Browse node families on the floating shelf. Middle mouse pans the graph; the wheel zooms around the pointer. Use the divider or its arrow keys to resize Preview.</p><p>Open examples from File to start a workflow document. A unified workflow's preparation stage feeds Generate Reply, and its response stage reshapes the captured Draft before Review and Publish. Select model nodes to choose a text connection profile in Details. Fast Decision uses a configured typed connection from Tools › Fast connections and an optional separately selected Decision fallback. Enable Lattice runs the open document for Send in SillyTavern. Run to here tests supported nodes; Graph › Run workflow and Stop workflow control the root. Legacy pre and post documents remain openable and manually runnable.</p><p>File › New workflow, Open workflow, Open Recent and Open examples replace the open document after offering Save, Don't Save or Cancel for unsaved changes. Save writes the current file; Save As chooses a destination. Browsers without native saving offer Download JSON. Export workflow JSON makes a portable sharing copy without local connections. Import into graph reviews a same-phase fragment before one undoable insertion. Recover previous workflows opens documents preserved from earlier settings. Recovery drafts remain available in SillyTavern, while the filename and document status describe the current file.</p><p>Select nodes and right-click Create Subgraph to open their connected body in a new tab. Double-click a subgraph to open it. Add Input and Output nodes from the Subgraphs shelf inside an editable subgraph, then name and configure their ports in Details.</p><p>Right-click a subgraph block and choose Add to Subgraphs to save it for reuse. Right-click a saved shelf entry to delete it. Saving updates the shelf only when you choose to save; existing placed copies stay unchanged. Portals connect pins through named references. Preview artifact tabs show results for the selected node; Run to here checks the request bound before running. Apply reviews the fresh result against the full root workflow.</p>", 1), du = /* @__PURE__ */ q("<div class=\"pc-workspace-overlay\"><div role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\"><header class=\"svelte-1dr9aew\"><h2 class=\"svelte-1dr9aew\"> </h2><button type=\"button\" class=\"pc-btn menu_button\"> </button></header> <!></div></div>"), fu = /* @__PURE__ */ q("<div class=\"pc-workspace-overlay\"><div class=\"pc-manager-dialog svelte-1dr9aew\" role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\" aria-label=\"Manage portals\"><!></div></div>"), pu = /* @__PURE__ */ q("<div role=\"dialog\" aria-modal=\"true\" aria-label=\"Lattice\" data-pc-workbench=\"svelte\"><!> <div class=\"pc-body\" role=\"region\" aria-label=\"Workspace panels\" tabindex=\"0\"><div class=\"pc-stage\"><section aria-label=\"Output preview\"><header class=\"pc-preview-pane-head\"><strong>Preview</strong><button type=\"button\" class=\"pc-btn menu_button\"> </button></header> <div class=\"pc-preview-content\"><!></div></section> <!> <!> <!> <div class=\"pc-canvas-area\" id=\"pc-workspace-graph\" role=\"tabpanel\"><div class=\"pc-workspace-run svelte-1dr9aew\"><!></div> <div class=\"pc-canvas-host\" aria-label=\"Node canvas\"></div> <!> <!></div></div> <!> <div class=\"pc-inspector pc-workspace-details svelte-1dr9aew\"><header class=\"pc-details-heading svelte-1dr9aew\"><strong class=\"svelte-1dr9aew\">Details</strong><button type=\"button\" class=\"svelte-1dr9aew\">Portals</button></header> <!> <div class=\"pc-node-details-holder svelte-1dr9aew\"><!></div></div></div> <!> <!> <!> <!> <!> <!> <!> <!></div>");
function mu(e, t) {
	Be(t, !0);
	let n = Oi(t, "actions", 7), r = /* @__PURE__ */ R({
		graphId: "",
		enabled: !1,
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
		z(r, {
			...W(r),
			...e
		}), e.fastConnectionsActive === !0 ? re("fast-connections") : e.fastConnectionsActive === !1 && W(E) === "fast-connections" && ie();
	}
	function m(e) {
		return u?.startRename(e);
	}
	async function h(e, t) {
		if (await ur(), !t()) return;
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
	let v = _(), y = /* @__PURE__ */ R(Zt(v.height)), b = /* @__PURE__ */ R(Zt(v.collapsed)), x = /* @__PURE__ */ R(500), S = /* @__PURE__ */ R(null), C = /* @__PURE__ */ R(520), w = /* @__PURE__ */ I(() => Math.max(220, Math.min(W(C), W(S) ?? W(r).detailsWidth ?? 258)));
	function T(e) {
		z(S, null), z(r, {
			...W(r),
			detailsWidth: e
		}), n().resizeDetails?.(e);
	}
	let E = /* @__PURE__ */ R(""), D = /* @__PURE__ */ R(null), O = null, k = 0, A = /* @__PURE__ */ R(0), ee;
	function j() {
		try {
			localStorage.setItem(g, JSON.stringify({
				height: W(y),
				collapsed: W(b)
			}));
		} catch {}
	}
	function te() {
		n().resizeStart?.();
	}
	function M(e) {
		te(), z(b, e, !0), j();
	}
	function ne() {
		M(!1);
	}
	async function re(e) {
		if (e === "show-preview") M(!1);
		else if (e === "collapse-preview") M(!0);
		else if (e === "add-node") ee.openSearch();
		else {
			O = document.activeElement, e === "examples" && n().refreshExamples?.(), e === "fast-connections" && n().fastConnections?.refresh?.(), e === "story-documents" && n().storyDocuments?.refresh?.(), e === "memory-recall" && n().recall?.refresh?.();
			let t = ++k;
			z(E, e, !0), await ur(), t === k && W(E) === e && W(D)?.querySelector("button")?.focus();
		}
	}
	function ie() {
		k++, z(E, ""), O?.focus({ preventScroll: !0 });
	}
	async function ae(e) {
		let t = k;
		try {
			let r = await n().openExample?.(e);
			return r === !0 && t === k && W(E) === "examples" && ie(), r === !0;
		} catch {
			return !1;
		}
	}
	function oe(e) {
		if (e.stopPropagation(), e.key === "Escape") e.preventDefault(), n().portalManager?.close?.();
		else if (e.key === "Tab") {
			let t = [...e.currentTarget.querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex=\"0\"]")], n = t[0], r = t.at(-1);
			e.shiftKey && document.activeElement === n && (e.preventDefault(), r?.focus()), !e.shiftKey && document.activeElement === r && (e.preventDefault(), n?.focus());
		}
	}
	function se(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), ie()), e.key === "Tab") {
			let t = [...W(D).querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex=\"0\"]")], n = t[0], r = t.at(-1);
			e.shiftKey && document.activeElement === n && (e.preventDefault(), r?.focus()), !e.shiftKey && document.activeElement === r && (e.preventDefault(), n?.focus());
		}
	}
	ki(() => {
		let e = () => {
			z(x, Math.max(90, s.clientHeight - 190), !0), z(C, Math.max(220, Math.min(520, (a.clientWidth || i.clientWidth || window.innerWidth) - 368)), !0);
		}, t = globalThis.ResizeObserver;
		if (!t) return e(), window.addEventListener("resize", e), () => window.removeEventListener("resize", e);
		let n = new t(e);
		return n.observe(s), n.observe(a), e(), () => n.disconnect();
	});
	var ce = {
		getParts: d,
		updateActions: f,
		update: p,
		renameGraphView: m,
		focusCommentTitle: h,
		revealPreview: ne
	}, le = pu();
	let ue, de;
	var fe = B(le);
	Di(ga(fe, {
		get state() {
			return W(r);
		},
		get actions() {
			return n();
		},
		local: re
	}), (e) => l = e, () => l);
	var pe = H(fe, 2), me = B(pe), he = B(me);
	let ge, _e;
	var ve = B(he), ye = H(B(ve)), be = B(ye, !0);
	F(ye), F(ve);
	var xe = H(ve, 2), Se = B(xe);
	{
		let e = /* @__PURE__ */ I(() => W(r).outputPreview ?? null);
		Ms(Se, {
			get view() {
				return W(e);
			},
			get actions() {
				return n().outputPreview;
			},
			collapse: () => M(!0)
		});
	}
	F(xe), F(he);
	var Ce = H(he, 2), we = (e) => {
		{
			let t = /* @__PURE__ */ I(() => Math.min(W(y), W(x)));
			va(e, {
				get height() {
					return W(t);
				},
				get max() {
					return W(x);
				},
				start: te,
				change: (e) => {
					z(y, e, !0), j();
				}
			});
		}
	};
	X(Ce, (e) => {
		W(b) || e(we);
	});
	var Te = H(Ce, 2);
	Di(Aa(Te, {
		get views() {
			return W(r).graphViews;
		},
		get actions() {
			return n().graphViewActions;
		},
		panelId: "pc-workspace-graph"
	}), (e) => u = e, () => u);
	var N = H(Te, 2);
	{
		let e = /* @__PURE__ */ I(() => W(r).graphViews?.active);
		Fa(N, {
			get view() {
				return W(e);
			},
			get actions() {
				return n().graphViewActions;
			}
		});
	}
	var Ee = H(N, 2), P = B(Ee), De = B(P);
	{
		let e = /* @__PURE__ */ I(() => W(r).runMeter ?? null);
		qs(De, {
			get view() {
				return W(e);
			},
			open: () => {
				z(E, "run-details");
			}
		});
	}
	F(P);
	var Oe = H(P, 2);
	Di(Oe, (e) => o = e, () => o);
	var Ae = H(Oe, 2), je = (e) => {
		var t = lu(), n = B(t, !0);
		F(t), U(() => Y(n, W(r).nativeDiagnostic)), J(e, t);
	};
	X(Ae, (e) => {
		W(r).nativeDiagnostic && e(je);
	}), Di(Vl(H(Ae, 2), {
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
	}), (e) => ee = e, () => ee), F(Ee), F(me), Di(me, (e) => s = e, () => s);
	var Me = H(me, 2), Ne = (e) => {
		var t = Nr();
		Hr(V(t), () => W(r).graphViews?.active.key ?? W(r).graphId, (e) => {
			ba(e, {
				get width() {
					return W(w);
				},
				get max() {
					return W(C);
				},
				start: te,
				preview: (e) => z(S, e, !0),
				change: T
			});
		}), J(e, t);
	};
	X(Me, (e) => {
		W(r).inspectorOpen && e(Ne);
	});
	var Pe = H(Me, 2), Fe = B(Pe), Ie = H(B(Fe));
	F(Fe);
	var Le = H(Fe, 2), Re = (e) => {
		let t = /* @__PURE__ */ I(() => W(r).commentDetails);
		ms(e, {
			get comment() {
				return W(t).comment;
			},
			onPatch: (e) => n().commentDetails?.patch(W(t).selection, e),
			onCommand: (e) => n().commentDetails?.command(W(t).selection, e)
		});
	};
	X(Le, (e) => {
		W(r).commentDetails && e(Re);
	});
	var ze = H(Le, 2), He = B(ze);
	{
		let e = /* @__PURE__ */ I(() => W(r).commentDetails ? null : W(r).nodeDetails ?? null);
		ds(He, {
			get view() {
				return W(e);
			},
			get actions() {
				return n().nodeDetails;
			}
		});
	}
	F(ze), F(Pe), Di(Pe, (e) => c = e, () => c), F(pe), Di(pe, (e) => a = e, () => a);
	var Ue = H(pe, 2), We = (e) => {
		var t = du(), i = B(t);
		let a;
		var o = B(i), s = B(o), c = B(s, !0);
		F(s);
		var l = H(s), u = B(l, !0);
		F(l), F(o);
		var d = H(o, 2), f = (e) => {
			Ql(e, {
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
				scroll: (e) => z(A, e, !0),
				open: ae
			});
		}, p = (e) => {
			{
				let t = /* @__PURE__ */ I(() => W(r).fastConnections ?? {
					userId: "",
					connections: [],
					issue: "Fast connection settings are unavailable."
				});
				Sc(e, {
					get view() {
						return W(t);
					},
					get actions() {
						return n().fastConnections;
					},
					close: ie
				});
			}
		}, m = (e) => {
			{
				let t = /* @__PURE__ */ I(() => W(r).recall ?? null), i = /* @__PURE__ */ I(() => ({
					...n().recall,
					reveal: (e) => {
						ie(), n().recall?.reveal(e);
					}
				}));
				Qc(e, {
					get view() {
						return W(t);
					},
					get actions() {
						return W(i);
					}
				});
			}
		}, h = (e) => {
			{
				let t = /* @__PURE__ */ I(() => W(r).storyDocuments ?? {
					key: "",
					revision: "",
					scope: {
						userId: "",
						chatId: ""
					},
					documents: [],
					issue: "Workflow Data setup is unavailable."
				});
				Wc(e, {
					get view() {
						return W(t);
					},
					get actions() {
						return n().storyDocuments;
					},
					close: ie
				});
			}
		}, g = (e) => {
			{
				let t = /* @__PURE__ */ I(() => W(r).runDetails ?? null);
				Us(e, {
					get view() {
						return W(t);
					},
					get actions() {
						return n().runDetails;
					}
				});
			}
		}, _ = (e) => {
			var t = uu();
			ke(4), J(e, t);
		};
		X(d, (e) => {
			W(E) === "examples" ? e(f) : W(E) === "fast-connections" ? e(p, 1) : W(E) === "memory-recall" ? e(m, 2) : W(E) === "story-documents" ? e(h, 3) : W(E) === "run-details" ? e(g, 4) : e(_, -1);
		}), F(i), Di(i, (e) => z(D, e), () => W(D)), F(t), U(() => {
			a = si(i, 1, "pc-workspace-dialog svelte-1dr9aew", null, a, { "pc-examples-dialog": W(E) === "examples" }), $(i, "aria-label", W(E) === "examples" ? "Examples" : W(E) === "run-details" ? "Run details" : W(E) === "fast-connections" ? "Fast connections" : W(E) === "story-documents" ? "Workflow Data" : W(E) === "memory-recall" ? "Memory recall" : "Workspace guide"), Y(c, W(E) === "examples" ? "Examples" : W(E) === "run-details" ? "Run details" : W(E) === "fast-connections" ? "Fast connections" : W(E) === "story-documents" ? "Workflow Data" : W(E) === "memory-recall" ? "Memory recall" : "Workspace guide"), $(l, "aria-label", W(E) === "memory-recall" ? "Close" : "Close panel"), Y(u, W(E) === "memory-recall" ? "Close" : "×");
		}), K("keydown", i, se), G("paste", i, (e) => e.stopPropagation()), K("click", l, ie), J(e, t);
	};
	X(Ue, (e) => {
		W(E) && e(We);
	});
	var Ge = H(Ue, 2);
	vl(Ge, {
		get view() {
			return W(r).nativeSearch;
		},
		get actions() {
			return n().nativeSearch;
		}
	});
	var Ke = H(Ge, 2);
	Sl(Ke, {
		get view() {
			return W(r).nativePinMenu;
		},
		get actions() {
			return n().nativePinMenu;
		}
	});
	var qe = H(Ke, 2), Je = (e) => {
		var t = fu(), i = B(t);
		fc(B(i), {
			get view() {
				return W(r).portalManager;
			},
			get actions() {
				return n().portalManager;
			}
		}), F(i), F(t), K("keydown", i, oe), G("paste", i, (e) => e.stopPropagation()), J(e, t);
	};
	X(qe, (e) => {
		W(r).portalManager && e(Je);
	});
	var Ye = H(qe, 2), Xe = (e) => {
		al(e, {
			get view() {
				return W(r).configureNode;
			},
			get actions() {
				return n().configureNode;
			}
		});
	};
	X(Ye, (e) => {
		W(r).configureNode && e(Xe);
	});
	var Ze = H(Ye, 2), Qe = (e) => {
		gc(e, {
			get view() {
				return W(r).subgraphSave;
			},
			get actions() {
				return n().subgraphSave;
			}
		});
	};
	X(Ze, (e) => {
		W(r).subgraphSave && e(Qe);
	});
	var $e = H(Ze, 2), et = (e) => {
		cu(e, {
			get view() {
				return W(r).importReview;
			},
			get actions() {
				return n();
			}
		});
	};
	X($e, (e) => {
		W(r).importReview && e(et);
	});
	var tt = H($e, 2), nt = (e) => {
		{
			let t = /* @__PURE__ */ I(() => W(r).document?.native ?? !1);
			ll(e, {
				get view() {
					return W(r).documentPrompt;
				},
				get actions() {
					return n().documentPrompt;
				},
				get native() {
					return W(t);
				}
			});
		}
	};
	return X(tt, (e) => {
		W(r).documentPrompt && e(nt);
	}), F(le), Di(le, (e) => i = e, () => i), U((e) => {
		ue = si(le, 1, "pc-root pc-native-workspace svelte-1dr9aew", null, ue, { "pc-native-flat": W(r).nativeFlatCanvas }), de = li(le, "", de, { "--pc-details-width": `${W(w)}px` }), ge = si(he, 1, "pc-preview-pane", null, ge, { "pc-preview-collapsed": W(b) }), _e = li(he, "", _e, e), $(ye, "aria-expanded", !W(b)), Y(be, W(b) ? "Expand preview" : "Collapse preview"), $(xe, "hidden", W(b)), $(Pe, "hidden", !W(r).inspectorOpen), $(ze, "hidden", !!W(r).commentDetails);
	}, [() => ({ "--pc-preview-height": `${Math.min(W(y), W(x))}px` })]), K("click", ye, () => M(!W(b))), K("click", Ie, () => n().managePortals?.()), J(e, le), Ve(ce);
}
Sr(["click", "keydown"]);
//#endregion
//#region ui/entry.js
function hu(e, t) {
	let n = document.createElement("div");
	n.style.cssText = "position:absolute;left:0;top:0;visibility:hidden;pointer-events:none", n.setAttribute("aria-hidden", "true"), n.inert = !0, e.append(n);
	let r;
	try {
		r = Fr(Vi, {
			target: n,
			props: {
				card: t,
				actions: {
					hoverPin() {},
					hostResult() {}
				}
			}
		}), Ft();
		let { width: e, height: i } = n.querySelector(".pc-node").getBoundingClientRect();
		return {
			width: e,
			height: i
		};
	} finally {
		r && zr(r), n.remove();
	}
}
function gu(e, t) {
	let n = Fr(ca, {
		target: e,
		props: { actions: t }
	});
	return Ft(), {
		...n.getLayers(),
		setComments: (e, t) => Ft(() => n.setComments(e, t)),
		setRecallStatus: (e) => Ft(() => n.setRecallStatus(e)),
		setNodes: (e) => Ft(() => n.setNodes(e)),
		setNodeProfiles: (e) => Ft(() => n.setNodeProfiles(e)),
		setGroups: (e) => Ft(() => n.setGroups(e)),
		setWires: (e, t, r) => Ft(() => n.setWires(e, t, r)),
		setPositions: (e, t) => Ft(() => n.setPositions(e, t)),
		destroy: () => zr(n)
	};
}
function _u(e, t) {
	let n = Fr(mu, {
		target: e,
		props: { actions: t }
	});
	return Ft(), {
		...n.getParts(),
		update: (e) => Ft(() => n.update(e)),
		updateActions: (e) => Ft(() => n.updateActions(e)),
		revealPreview: () => Ft(() => n.revealPreview()),
		renameGraphView: (e) => n.renameGraphView(e),
		focusCommentTitle: (e, t) => n.focusCommentTitle(e, t),
		destroy: () => zr(n)
	};
}
//#endregion
export { hu as measureNodeCard, gu as mountCanvas, _u as mountWorkbench };
