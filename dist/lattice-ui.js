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
var m = 1024, h = 2048, g = 4096, _ = 8192, v = 16384, y = 32768, b = 1 << 25, x = 65536, S = 1 << 19, C = 1 << 20, w = 1 << 25, T = 65536, E = 1 << 21, ee = 1 << 22, D = 1 << 23, O = Symbol("$state"), te = Symbol("legacy props"), ne = Symbol(""), k = Symbol("attributes"), A = Symbol("class"), j = Symbol("style"), re = Symbol("text"), ie = Symbol("form reset"), ae = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), oe = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml");
function se(e) {
	throw Error("https://svelte.dev/e/lifecycle_outside_component");
}
//#endregion
//#region node_modules/svelte/src/internal/client/errors.js
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
//#region node_modules/svelte/src/constants.js
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
//#region node_modules/svelte/src/internal/client/dom/hydration.js
var M = !1;
function Ee(e) {
	M = e;
}
var N;
function De(e) {
	if (e === null) throw Ce(), ye;
	return N = e;
}
function Oe() {
	return De(/* @__PURE__ */ cn(N));
}
function P(e) {
	if (M) {
		if (/* @__PURE__ */ cn(N) !== null) throw Ce(), ye;
		N = e;
	}
}
function ke(e = 1) {
	if (M) {
		for (var t = e, n = N; t--;) n = /* @__PURE__ */ cn(n);
		N = n;
	}
}
function Ae(e = !0) {
	for (var t = 0, n = N;;) {
		if (n.nodeType === 8) {
			var r = n.data;
			if (r === "]") {
				if (t === 0) return n;
				--t;
			} else (r === "[" || r === "[!" || r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
		}
		var i = /* @__PURE__ */ cn(n);
		e && n.remove(), n = i;
	}
}
function je(e) {
	if (!e || e.nodeType !== 8) throw Ce(), ye;
	return e.data;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/equality.js
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
//#region node_modules/svelte/src/internal/shared/clone.js
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
//#region node_modules/svelte/src/internal/client/context.js
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
		r: U,
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
//#region node_modules/svelte/src/internal/client/dom/task.js
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
	var t = U;
	if (t === null) return H.f |= D, e;
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
//#region node_modules/svelte/src/internal/client/reactivity/status.js
var Ye = ~(h | g | m);
function Xe(e, t) {
	e.f = e.f & Ye | t;
}
function Ze(e) {
	e.f & 512 || e.deps === null ? Xe(e, m) : Xe(e, g);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
function Qe(e) {
	if (e !== null) for (let t of e) t.f & 2 && t.f & 65536 && (t.f ^= T, Qe(t.deps));
}
function $e(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), Qe(e.deps), Xe(e, m);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/store.js
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
//#region node_modules/svelte/src/internal/client/dom/elements/misc.js
function nt(e) {
	M && /* @__PURE__ */ sn(e) !== null && un(e);
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
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function at(e) {
	var t = H, n = U;
	Un(null), Wn(null);
	try {
		return e();
	} finally {
		Un(t), Wn(n);
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
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function st(e) {
	let t = 0, n = Gt(0), r;
	return () => {
		_n() && (W(n), wn(() => (t === 0 && (r = dr(() => e(() => Yt(n)))), t += 1, () => {
			Ge(() => {
				--t, t === 0 && (r?.(), r = void 0, Yt(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var ct = x | S;
function lt(e, t, n, r) {
	new ut(e, t, n, r);
}
var ut = class {
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
	#h = st(() => (this.#m = Gt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = U;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = U.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = Tn(() => {
			if (M) {
				let e = this.#t;
				Oe();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, ct), M && (this.#e = N);
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
			var e = this.#c = document.createDocumentFragment(), t = on();
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
		$e(e, this.#f, this.#p);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#n.pending;
	}
	#S(e) {
		var t = U, n = H, r = Re;
		Wn(this.#i), Un(this.#i), ze(this.#i.ctx);
		try {
			return Pt.ensure(), e();
		} catch (e) {
			return qe(e), null;
		} finally {
			Wn(t), Un(n), ze(r);
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
		I?.is_fork ? (this.#a && I.skip_effect(this.#a), this.#o && I.skip_effect(this.#o), this.#s && I.skip_effect(this.#s), I.oncommit(() => {
			this.#w(e);
		})) : this.#w(e);
	}
	#w(e) {
		this.#a &&= (An(this.#a), null), this.#o &&= (An(this.#o), null), this.#s &&= (An(this.#s), null), M && (De(this.#t), ke(), De(Ae()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return En(() => {
						var r = U;
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
//#region node_modules/svelte/src/internal/client/reactivity/async.js
function dt(e, t, n, r) {
	let i = He() ? ht : vt;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = U, c = ft(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
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
	var e = U, t = H, n = Re, r = I;
	return function(i = !0) {
		Wn(e), Un(t), ze(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function pt(e = !0) {
	Wn(null), Un(null), ze(null), e && I?.deactivate();
}
function mt() {
	var e = U, t = e.b, n = I, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function ht(e) {
	var t = 2 | h;
	return U !== null && (U.f |= S), {
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
		parent: U,
		ac: null
	};
}
var gt = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function _t(e, t, n) {
	let r = U;
	r === null && ce();
	var i = void 0, a = Gt(be), o = !H, s = /* @__PURE__ */ new Set();
	return Cn(() => {
		var t = U, n = p();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== ae && n.reject(e);
			}).finally(pt);
		} catch (e) {
			n.reject(e), pt();
		}
		var c = I;
		if (o) {
			if (t.f & 32768) var l = mt();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(gt);
			else for (let e of s.values()) e.reject(gt);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== gt && (c.activate(), t ? (a.f |= D, qt(a, t)) : (a.f & 8388608 && (a.f ^= D), qt(a, e)), c.deactivate());
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
function F(e) {
	let t = /* @__PURE__ */ ht(e);
	return Kn(t), t;
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
	var t, n = U, r = e.parent;
	if (!Bn && r !== null && e.v !== be && r.f & 24576) return Se(), e.v;
	Wn(r);
	try {
		e.f &= ~T, yt(e), t = ir(e);
	} finally {
		Wn(n);
	}
	return t;
}
function xt(e) {
	var t = bt(e);
	!e.equals(t) && (e.wv = tr(), (!I?.is_fork || e.deps === null) && (I === null ? e.v = t : (I.capture(e, t, !0), Tt?.capture(e, t, !0)), e.deps === null)) ? Xe(e, m) : Bn || (Et === null ? Ze(e) : (_n() || I?.is_fork) && Et.set(e, t));
}
function St(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && at(() => {
		t.ac.abort(ae), t.ac = null;
	}), t.fn !== null && (t.teardown = d), or(t, 0), On(t));
}
function Ct(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && sr(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
var wt = null, I = null, Tt = null, Et = null, Dt = null, Ot = !1, kt = !1, At = null, jt = null, Mt = 0, Nt = 1, Pt = class e {
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
			for (var r of n.d) Xe(r, h), t(r);
			for (r of n.m) Xe(r, g), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, Mt++ > 1e3 && (this.#x(), It());
		for (let e of this.#u) this.#d.delete(e), Xe(e, h), this.schedule(e);
		for (let e of this.#d) Xe(e, g), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = At = [], r = [], i = jt = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw Vt(e), this.#h() || this.discard(), t;
		}
		if (I = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (At = null, jt = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) Bt(e, t);
			i.length > 0 && I.#g();
			return;
		}
		let o = this.#v();
		if (o) this.#b(r), this.#b(n), o.#y(this);
		else {
			this.#u.clear(), this.#d.clear();
			for (let e of this.#r) e(this);
			this.#r.clear(), Tt = this, Rt(r), Rt(n), Tt = null, this.#s?.resolve();
			var s = I;
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
		e.f ^= m;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= m : i & 4 ? t.push(r) : nr(r) && (i & 16 && this.#d.add(r), sr(r));
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), Xe(i, h), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), I = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) $e(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== be && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), Et?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		I = this;
	}
	deactivate() {
		I = null, Et = null;
	}
	flush() {
		try {
			kt = !0, I = this, this.#g();
		} finally {
			Mt = 0, Dt = null, At = null, jt = null, kt = !1, I = null, Et = null, Ut.clear();
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
		if (I === null) {
			let t = I = new e();
			!kt && !Ot && Ge(() => {
				t.#e || t.flush();
			});
		}
		return I;
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
				if (At !== null && t === U && (H === null || !(H.f & 2))) return;
				if (n & 96) {
					if (!(n & 1024)) return;
					t.f ^= m;
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
		for (e && (I !== null && !I.is_fork && I.flush(), n = e());;) {
			if (Ke(), I === null) return n;
			I.flush();
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
			if (!(r.f & 24576) && nr(r) && (Lt = /* @__PURE__ */ new Set(), sr(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Mn(r), Lt?.size > 0)) {
				Ut.clear();
				for (let e of Lt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) Lt.has(n) && (Lt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || sr(n);
					}
				}
				Lt.clear();
			}
		}
		Lt = null;
	}
}
function zt(e) {
	I.schedule(e);
}
function Bt(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), Xe(e, m);
		for (var n = e.first; n !== null;) Bt(n, t), n = n.next;
	}
}
function Vt(e) {
	Xe(e, m);
	for (var t = e.first; t !== null;) Vt(t), t = t.next;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/sources.js
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
function L(e, t) {
	let n = Gt(e, t);
	return Kn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function Kt(e, t = !1, n = !0) {
	let r = Gt(e);
	return t || (r.equals = Pe), r;
}
function R(e, t, n = !1) {
	return H !== null && (!Hn || H.f & 131072) && He() && H.f & 4325394 && (Gn === null || !Gn.has(e)) && _e(), qt(e, n ? Zt(t) : t, jt);
}
function qt(e, t, n = null) {
	if (!e.equals(t)) {
		Bn ? Ut.set(e, t) : Ut.has(e) || Ut.set(e, e.v);
		var r = Pt.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && bt(t), Et === null && Ze(t);
		}
		e.wv = tr(), Xt(e, h, n), He() && U !== null && U.f & 1024 && !(U.f & 96) && (Yn === null ? Xn([e]) : Yn.push(e)), !r.is_fork && Ht.size > 0 && !Wt && Jt();
	}
	return t;
}
function Jt() {
	Wt = !1;
	for (let e of Ht) {
		e.f & 1024 && Xe(e, g);
		let t;
		try {
			t = nr(e);
		} catch {
			t = !0;
		}
		t && sr(e);
	}
	Ht.clear();
}
function Yt(e) {
	R(e, e.v + 1);
}
function Xt(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = He(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (i || s !== U) {
			var l = (c & h) === 0;
			if (l && Xe(s, t), c & 131072) Ht.add(s);
			else if (c & 2) {
				var u = s;
				Et?.delete(u), c & 65536 || (c & 512 && (U === null || !(U.f & 2097152)) && (s.f |= T), Xt(u, g, n));
			} else if (l) {
				var d = s;
				c & 16 && Lt !== null && Lt.add(d), n === null ? zt(d) : n.push(d);
			}
		}
	}
}
function Zt(t) {
	if (typeof t != "object" || !t || O in t) return t;
	let n = l(t);
	if (n !== s && n !== c) return t;
	var r = /* @__PURE__ */ new Map(), i = e(t), o = /* @__PURE__ */ L(0), u = null, d = $n, f = (e) => {
		if ($n === d) return e();
		var t = H, n = $n;
		Un(null), er(d);
		var r = e();
		return Un(t), er(n), r;
	};
	return i && r.set("length", /* @__PURE__ */ L(t.length, u)), new Proxy(t, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && he();
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
					let e = f(() => /* @__PURE__ */ L(be, u));
					r.set(t, e), Yt(o);
				}
			} else R(n, be), Yt(o);
			return !0;
		},
		get(e, n, i) {
			if (n === O) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ L(Zt(s ? e[n] : be), u)), r.set(n, o)), o !== void 0) {
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
			if (t === O) return !0;
			var n = r.get(t), i = n !== void 0 && n.v !== be || Reflect.has(e, t);
			return (n !== void 0 || U !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ L(i ? Zt(e[t]) : be, u)), r.set(t, n)), W(n) === be) ? !1 : i;
		},
		set(e, t, n, s) {
			var c = r.get(t), l = t in e;
			if (i && t === "length") for (var d = n; d < c.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ L(be, u)), r.set(d + "", p)) : R(p, be);
			}
			if (c === void 0) (!l || a(e, t)?.writable) && (c = f(() => /* @__PURE__ */ L(void 0, u)), R(c, Zt(n)), r.set(t, c));
			else {
				l = c.v !== be;
				var m = f(() => Zt(n));
				R(c, m);
			}
			var h = Reflect.getOwnPropertyDescriptor(e, t);
			if (h?.set && h.set.call(s, n), !l) {
				if (i && typeof t == "string") {
					var g = r.get("length"), _ = Number(t);
					Number.isInteger(_) && _ >= g.v && R(g, _ + 1);
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
		if (typeof e == "object" && e && O in e) return e[O];
	} catch {}
	return e;
}
function $t(e, t) {
	return Object.is(Qt(e), Qt(t));
}
var en, tn, nn, rn;
function an() {
	if (en === void 0) {
		en = window, tn = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		nn = a(t, "firstChild").get, rn = a(t, "nextSibling").get, u(e) && (e[A] = void 0, e[k] = null, e[j] = void 0, e.__e = void 0), u(n) && (n[re] = void 0);
	}
}
function on(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function sn(e) {
	return nn.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function cn(e) {
	return rn.call(e);
}
function z(e, t) {
	if (!M) return /* @__PURE__ */ sn(e);
	var n = /* @__PURE__ */ sn(N);
	if (n === null) n = N.appendChild(on());
	else if (t && n.nodeType !== 3) {
		var r = on();
		return n?.before(r), De(r), r;
	}
	return t && pn(n), De(n), n;
}
function ln(e, t = !1) {
	if (!M) {
		var n = /* @__PURE__ */ sn(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ cn(n) : n;
	}
	if (t) {
		if (N?.nodeType !== 3) {
			var r = on();
			return N?.before(r), De(r), r;
		}
		pn(N);
	}
	return N;
}
function B(e, t = 1, n = !1) {
	let r = M ? N : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ cn(r);
	if (!M) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = on();
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
//#region node_modules/svelte/src/internal/client/reactivity/effects.js
function mn(e) {
	U === null && (H === null && fe(e), de()), Bn && ue(e);
}
function hn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function gn(e, t) {
	var n = U;
	n !== null && n.f & 8192 && (e |= _);
	var r = {
		ctx: Re,
		deps: null,
		nodes: null,
		f: e | h | 512,
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
	if (e & 4) At === null ? Pt.ensure().schedule(r) : At.push(r);
	else if (t !== null) {
		try {
			sr(r);
		} catch (e) {
			throw An(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= x));
	}
	if (i !== null && (i.parent = n, n !== null && hn(i, n), H !== null && H.f & 2 && !(e & 64))) {
		var a = H;
		(a.effects ??= []).push(i);
	}
	return r;
}
function _n() {
	return H !== null && !Hn;
}
function vn(e) {
	let t = gn(8, null);
	return Xe(t, m), t.teardown = e, t;
}
function yn(e) {
	mn("$effect");
	var t = U.f;
	if (!H && t & 32 && Re !== null && !Re.i) {
		var n = Re;
		(n.e ??= []).push(e);
	} else return bn(e);
}
function bn(e) {
	return gn(4 | C, e);
}
function xn(e) {
	Pt.ensure();
	let t = gn(64 | S, e);
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
	return gn(ee | S, e);
}
function wn(e, t = 0) {
	return gn(8 | t, e);
}
function V(e, t = [], n = [], r = []) {
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
	return gn(32 | S, e);
}
function Dn(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = Bn, n = H;
		Vn(!0), Un(null);
		try {
			t.call(null);
		} finally {
			Vn(e), Un(n);
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
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (jn(e.nodes.start, e.nodes.end), n = !0), e.f |= b, On(e, t && !n), or(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	Dn(e), e.f ^= b, e.f |= v;
	var i = e.parent;
	i !== null && i.first !== null && Mn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function jn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ cn(e);
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
		e.f ^= _;
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
		e.f ^= _, e.f & 1024 || (Xe(e, h), Pt.ensure().schedule(e));
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
		var i = n === r ? null : /* @__PURE__ */ cn(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/legacy.js
var Rn = null, zn = !1, Bn = !1;
function Vn(e) {
	Bn = e;
}
var H = null, Hn = !1;
function Un(e) {
	H = e;
}
var U = null;
function Wn(e) {
	U = e;
}
var Gn = null;
function Kn(e) {
	H !== null && (Gn ??= /* @__PURE__ */ new Set()).add(e);
}
var qn = null, Jn = 0, Yn = null;
function Xn(e) {
	Yn = e;
}
var Zn = 1, Qn = 0, $n = Qn;
function er(e) {
	$n = e;
}
function tr() {
	return ++Zn;
}
function nr(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~T), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (nr(a) && xt(a), a.wv > e.wv) return !0;
		}
		t & 512 && Et === null && Xe(e, m);
	}
	return !1;
}
function rr(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Gn !== null && Gn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? rr(a, t, !1) : t === a && (n ? Xe(a, h) : a.f & 1024 && Xe(a, g), zt(a));
	}
}
function ir(e) {
	var t = qn, n = Jn, r = Yn, i = H, a = Gn, o = Re, s = Hn, c = $n, l = e.f;
	qn = null, Jn = 0, Yn = null, H = l & 96 ? null : e, Gn = null, ze(e.ctx), Hn = !1, $n = ++Qn, e.ac !== null && (at(() => {
		e.ac.abort(ae);
	}), e.ac = null);
	try {
		e.f |= E;
		var u = e.fn, d = u();
		e.f |= y;
		var f = e.deps, p = I?.is_fork;
		if (qn !== null) {
			var m;
			if (p || or(e, Jn), f !== null && Jn > 0) for (f.length = Jn + qn.length, m = 0; m < qn.length; m++) f[Jn + m] = qn[m];
			else e.deps = f = qn;
			if (_n() && e.f & 512) for (m = Jn; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && Jn < f.length && (or(e, Jn), f.length = Jn);
		if (He() && Yn !== null && !Hn && f !== null && !(e.f & 6146)) for (m = 0; m < Yn.length; m++) rr(Yn[m], e);
		if (i !== null && i !== e) {
			if (Qn++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = Qn;
			if (t !== null) for (let e of t) e.rv = Qn;
			Yn !== null && (r === null ? r = Yn : r.push(...Yn));
		}
		return e.f & 8388608 && (e.f ^= D), d;
	} catch (e) {
		return qe(e);
	} finally {
		e.f ^= E, qn = t, Jn = n, Yn = r, H = i, Gn = a, ze(o), Hn = s, $n = c;
	}
}
function ar(e, r) {
	let i = r.reactions;
	if (i !== null) {
		var a = t.call(i, e);
		if (a !== -1) {
			var o = i.length - 1;
			o === 0 ? i = r.reactions = null : (i[a] = i[o], i.pop());
		}
	}
	if (i === null && r.f & 2 && (qn === null || !n.call(qn, r))) {
		var s = r;
		s.f & 512 && (s.f ^= 512, s.f &= ~T), s.v !== be && Ze(s), s.ac !== null && at(() => {
			s.ac.abort(ae), s.ac = null, Xe(s, h);
		}), St(s), or(s, 0);
	}
}
function or(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) ar(e, n[r]);
}
function sr(e) {
	var t = e.f;
	if (!(t & 16384)) {
		Xe(e, m);
		var n = U, r = zn;
		U = e, zn = !(t & 96);
		try {
			t & 16777232 ? kn(e) : On(e), Dn(e);
			var i = ir(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = Zn;
		} finally {
			zn = r, U = n;
		}
	}
}
async function cr() {
	await Promise.resolve(), Ft();
}
function W(e) {
	var t = !!(e.f & 2);
	if (Rn?.add(e), H !== null && !Hn && !(U !== null && U.f & 16384) && (Gn === null || !Gn.has(e))) {
		var r = H.deps;
		if (H.f & 2097152) e.rv < Qn && (e.rv = Qn, qn === null && r !== null && r[Jn] === e ? Jn++ : qn === null ? qn = [e] : qn.push(e));
		else {
			H.deps ??= [], n.call(H.deps, e) || H.deps.push(e);
			var i = e.reactions;
			i === null ? e.reactions = [H] : n.call(i, H) || i.push(H);
		}
	}
	if (Bn && Ut.has(e)) return Ut.get(e);
	if (t) {
		var a = e;
		if (Bn) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || ur(a)) && (o = bt(a)), Ut.set(a, o), o;
		}
		var s = !(a.f & 512) && !Hn && H !== null && (zn || !!(H.f & 512)), c = (a.f & y) === 0;
		nr(a) && (s && (a.f |= 512), xt(a)), s && !c && (Ct(a), lr(a));
	}
	if (Et?.has(e)) return Et.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function lr(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (Ct(t), lr(t));
}
function ur(e) {
	if (e.v === be) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Ut.has(t) || t.f & 2 && ur(t)) return !0;
	return !1;
}
function dr(e) {
	var t = Hn;
	try {
		return Hn = !0, e();
	} finally {
		Hn = t;
	}
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var fr = ["touchstart", "touchmove"];
function pr(e) {
	return fr.includes(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
var mr = Symbol("events"), hr = /* @__PURE__ */ new Set(), gr = /* @__PURE__ */ new Set();
function _r(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || xr.call(t, e), !e.cancelBubble) return at(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Ge(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function G(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = _r(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && vn(() => {
		t.removeEventListener(e, o, a);
	});
}
function K(e, t, n) {
	(t[mr] ??= {})[e] = n;
}
function vr(e) {
	for (var t = 0; t < e.length; t++) hr.add(e[t]);
	for (var n of gr) n(e);
}
var yr = null, br = !1;
function xr(e) {
	var t = this, n = t.ownerDocument, r = e.type, a = e.composedPath?.() || [], o = a[0] || e.target;
	yr = e, br || (br = !0, setTimeout(() => {
		br = !1, yr = null;
	}));
	var s = 0, c = yr === e && e[mr];
	if (c) {
		var l = a.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[mr] = t;
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
		var d = H, f = U;
		Un(null), Wn(null);
		try {
			for (var p, m = []; o !== null && o !== t;) {
				try {
					var h = o[mr]?.[r];
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
			e[mr] = t, delete e.currentTarget, Un(d), Wn(f);
		}
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/reconciler.js
var Sr = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function Cr(e) {
	return Sr?.createHTML(e) ?? e;
}
function wr(e) {
	var t = fn("template");
	return t.innerHTML = Cr(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function Tr(e, t) {
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
		if (M) return Tr(N, null), N;
		i === void 0 && (i = wr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ sn(i)));
		var t = r || tn ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ sn(t), s = t.lastChild;
			Tr(o, s);
		} else Tr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Er(e, t, n = "svg") {
	var r = !e.startsWith("<!>"), i = !!(t & 1), a = `<${n}>${r ? e : "<!>" + e}</${n}>`, o;
	return () => {
		if (M) return Tr(N, null), N;
		if (!o) {
			var e = /* @__PURE__ */ sn(wr(a));
			if (i) for (o = document.createDocumentFragment(); /* @__PURE__ */ sn(e);) o.appendChild(/* @__PURE__ */ sn(e));
			else o = /* @__PURE__ */ sn(e);
		}
		var t = o.cloneNode(!0);
		if (i) {
			var n = /* @__PURE__ */ sn(t), r = t.lastChild;
			Tr(n, r);
		} else Tr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Dr(e, t) {
	return /* @__PURE__ */ Er(e, t, "svg");
}
function Or(e = "") {
	if (!M) {
		var t = on(e + "");
		return Tr(t, t), t;
	}
	var n = N;
	return n.nodeType === 3 ? pn(n) : (n.before(n = on()), De(n)), Tr(n, n), n;
}
function kr() {
	if (M) return Tr(N, null), N;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = on();
	return e.append(t, n), Tr(t, n), e;
}
function J(e, t) {
	if (M) {
		var n = U;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = N), Oe();
	} else e !== null && e.before(t);
}
function Ar() {
	if (M && N && N.nodeType === 8 && N.textContent?.startsWith("$")) {
		let e = N.textContent.substring(1);
		return Oe(), e;
	}
	return (window.__svelte ??= {}).uid ??= 1, `c${window.__svelte.uid++}`;
}
function Y(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[re] ??= e.nodeValue) && (e[re] = n, e.nodeValue = `${n}`);
}
function jr(e, t) {
	return Nr(e, t);
}
var Mr = /* @__PURE__ */ new Map();
function Nr(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	an();
	var l = void 0, u = xn(() => {
		var s = n ?? t.appendChild(on());
		lt(s, { pending: () => {} }, (t) => {
			Be({});
			var n = Re;
			if (o && (n.c = o), a && (i.$$events = a), M && Tr(t, null), l = e(t, i) || {}, M && (U.nodes.end = N, N === null || N.nodeType !== 8 || N.data !== "]")) throw Ce(), ye;
			Ve();
		}, c);
		var u = /* @__PURE__ */ new Set(), d = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!u.has(r)) {
					u.add(r);
					var i = pr(r);
					for (let e of [t, document]) {
						var a = Mr.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), Mr.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, xr, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return d(r(hr)), gr.add(d), () => {
			for (var e of u) for (let n of [t, document]) {
				var r = Mr.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, xr), r.delete(e), r.size === 0 && Mr.delete(n)) : r.set(e, i);
			}
			gr.delete(d), s !== n && s.parentNode?.removeChild(s);
		};
	});
	return Pr.set(l, u), l;
}
var Pr = /* @__PURE__ */ new WeakMap();
function Fr(e, t) {
	let n = Pr.get(e);
	return n ? (Pr.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/branches.js
var Ir = class {
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
						Ln(r, t), t.append(on()), this.#n.set(e, {
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
				var i = document.createDocumentFragment(), a = on();
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
	M && (r = N, Oe());
	var i = new Ir(e), a = n ? x : 0;
	function o(e, t) {
		if (M) {
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
//#region node_modules/svelte/src/internal/client/dom/blocks/key.js
var Lr = Symbol("NaN");
function Rr(e, t, n) {
	M && Oe();
	var r = new Ir(e), i = !He();
	Tn(() => {
		var e = t();
		e !== e && (e = Lr), i && typeof e == "object" && e && (e = {}), r.ensure(e, n);
	});
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
function zr(e, t) {
	return t;
}
function Br(e, t, n) {
	for (var i = [], a = t.length, o, s = t.length, c = 0; c < a; c++) {
		let n = t[c];
		Nn(n, () => {
			if (o) {
				if (o.pending.delete(n), o.done.add(n), o.pending.size === 0) {
					var t = e.outrogroups;
					Vr(e, r(o.done)), t.delete(o), t.size === 0 && (e.outrogroups = null);
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
		Vr(e, t, !l);
	} else o = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(o);
}
function Vr(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= w, Ln(a, document.createDocumentFragment())) : An(t[i], n);
	}
}
var Hr;
function Z(t, n, i, a, o, s = null) {
	var c = t, l = /* @__PURE__ */ new Map();
	if (n & 4) {
		var u = t;
		c = M ? De(/* @__PURE__ */ sn(u)) : u.appendChild(on());
	}
	M && Oe();
	var d = null, f = /* @__PURE__ */ vt(() => {
		var t = i();
		return e(t) ? t : t == null ? [] : r(t);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, Wr(v, p, c, n, a), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= w, Kr(d, null, c)) : Fn(d) : Nn(d, () => {
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
			M && je(c) === "[!" != (e === 0) && (c = Ae(), De(c), Ee(!1), t = !0);
			for (var r = /* @__PURE__ */ new Set(), u = I, v = dn(), y = 0; y < e; y += 1) {
				M && N.nodeType === 8 && N.data === "]" && (c = N, t = !0, Ee(!1));
				var b = p[y], x = a(b, y), S = h ? null : l.get(x);
				S ? (S.v && qt(S.v, b), S.i && qt(S.i, y), v && u.unskip_effect(S.e)) : (S = Gr(l, h ? c : Hr ??= on(), b, x, y, o, n, i), h || (S.e.f |= w), l.set(x, S)), r.add(x);
			}
			if (e === 0 && s && !d && (h ? d = En(() => s(c)) : (d = En(() => s(Hr ??= on())), d.f |= w)), e > r.size && le("", "", ""), M && e > 0 && De(Ae()), !h) {
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
	h = !1, M && (c = N);
}
function Ur(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function Wr(e, t, n, i, a) {
	var o = !!(i & 8), s = t.length, c = e.items, l = Ur(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (o) for (v = 0; v < s; v += 1) h = t[v], g = a(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = a(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (Fn(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= w, _ === l) Kr(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), qr(e, d, _), qr(e, _, y), Kr(_, y, n), d = _, p = [], m = [], l = Ur(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], C = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) Kr(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					qr(e, S.prev, C.next), qr(e, d, S), qr(e, C, b), l = b, d = C, --v, p = [], m = [];
				} else u.delete(_), Kr(_, l, n), qr(e, _.prev, _.next), qr(e, _, d === null ? e.effect.first : d.next), qr(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = Ur(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = Ur(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (Vr(e, r(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var T = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || T.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && T.push(l), l = Ur(l.next);
		var E = T.length;
		if (E > 0) {
			var ee = i & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < E; v += 1) T[v].nodes?.a?.measure();
				for (v = 0; v < E; v += 1) T[v].nodes?.a?.fix();
			}
			Br(e, T, ee);
		}
	}
	o && Ge(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Gr(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? Gt(n) : /* @__PURE__ */ Kt(n, !1, !1) : null, l = o & 2 ? Gt(i) : null;
	return {
		v: c,
		i: l,
		e: En(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function Kr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ cn(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function qr(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function Jr(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") {
		if (Array.isArray(e)) {
			var i = e.length;
			for (t = 0; t < i; t++) e[t] && (n = Jr(e[t])) && (r && (r += " "), r += n);
		} else for (n in e) e[n] && (r && (r += " "), r += n);
	}
	return r;
}
function Yr() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = Jr(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/shared/attributes.js
function Xr(e) {
	return typeof e == "object" ? Yr(e) : e ?? "";
}
var Zr = [..." 	\n\r\f\xA0\v﻿"];
function Qr(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || Zr.includes(r[o - 1])) && (s === r.length || Zr.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function $r(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function ei(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function ti(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\/\*.*?\*\//g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(ei)), i && c.push(...Object.keys(i).map(ei));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = ei(e.substring(l, u).trim());
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
		return r && (n += $r(r)), i && (n += $r(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/class.js
function ni(e, t, n, r, i, a) {
	var o = e[A];
	if (M || o !== n || o === void 0) {
		var s = Qr(n, r, a);
		(!M || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[A] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/style.js
function ri(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function ii(e, t, n, r) {
	var i = e[j];
	if (M || i !== t) {
		var a = ti(t, r);
		(!M || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[j] = t;
	} else r && (Array.isArray(r) ? (ri(e, n?.[0], r[0]), ri(e, n?.[1], r[1], "important")) : ri(e, n, r));
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function ai(t, n, r = !1) {
	if (t.multiple) {
		if (n == null) return;
		if (!e(n)) return we();
		for (var i of t.options) i.selected = n.includes(si(i));
	} else {
		for (i of t.options) if ($t(si(i), n)) {
			i.selected = !0;
			return;
		}
		(!r || n !== void 0) && (t.selectedIndex = -1);
	}
}
function oi(e) {
	var t = new MutationObserver(() => {
		"__value" in e && ai(e, e.__value);
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
function si(e) {
	return "__value" in e ? e.__value : e.value;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var ci = Symbol("is custom element"), li = Symbol("is html"), ui = oe ? "link" : "LINK", di = oe ? "progress" : "PROGRESS";
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
		e[ie] = n, Ge(n), it();
	}
}
function fi(e, t) {
	var n = mi(e);
	n.value !== (n.value = t ?? void 0) && (e.value !== t || t === 0 && e.nodeName === di) && (e.value = t ?? "");
}
function pi(e, t) {
	var n = mi(e);
	n.checked !== (n.checked = t ?? void 0) && (e.checked = t);
}
function $(e, t, n, r) {
	var i = mi(e);
	M && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === ui) || i[t] !== (i[t] = n) && (t === "loading" && (e[ne] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && gi(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function mi(e) {
	return e[k] ??= {
		[ci]: e.nodeName.includes("-"),
		[li]: e.namespaceURI === xe
	};
}
var hi = /* @__PURE__ */ new Map();
function gi(e) {
	var t = e.getAttribute("is") || e.nodeName, n = hi.get(t);
	if (n) return n;
	hi.set(t, n = []);
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var s in r = o(i), r) r[s].set && s !== "innerHTML" && s !== "textContent" && s !== "innerText" && n.push(s);
		i = l(i);
	}
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function _i(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet();
	ot(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = vi(e) ? yi(a) : a, n(a), I !== null && r.add(I), await cr(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (M && e.defaultValue !== e.value || dr(t) == null && e.value) && (n(vi(e) ? yi(e.value) : e.value), I !== null && r.add(I)), wn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = I;
			if (r.has(i)) return;
		}
		vi(e) && n === yi(e.value) || (e.type !== "date" || n || e.value) && n !== e.value && (e.value = n ?? "");
	});
}
function vi(e) {
	var t = e.type;
	return t === "number" || t === "range";
}
function yi(e) {
	return e === "" ? null : +e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function bi(e, t) {
	return e === t || e?.[O] === t;
}
function xi(e = {}, t, n, r) {
	var i = Re.r, a = U;
	return Sn(() => {
		var o, s;
		return wn(() => {
			o = s, s = r?.() || [], dr(() => {
				bi(n(...s), e) || (t(e, ...s), o && bi(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && bi(n(...s), e) && t(null, ...s);
			}, c = r.teardown;
			r.teardown = () => {
				o(), c?.();
			};
		};
	}), e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/props.js
function Si(e, t, n, r) {
	var i = !0, o = !!(n & 8), s = !!(n & 16), c = r, l = !0, u = void 0, d = () => s && i ? (u ??= /* @__PURE__ */ ht(r), W(u)) : (l && (l = !1, c = s ? dr(r) : r), c);
	let f;
	if (o) {
		var p = O in e || te in e;
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
	var b = U;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? W(y) : i && o ? Zt(e) : e;
			return R(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return Bn && v || b.f & 16384 ? y.v : W(y);
	});
}
function Ci(e) {
	Re === null && se("onMount"), yn(() => {
		let t = dr(e);
		if (typeof t == "function") return t;
	});
}
function wi(e) {
	Re === null && se("onDestroy"), Ci(() => () => dr(e));
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region ui/NodeCard.svelte
var Ti = /* @__PURE__ */ q("<div><span class=\"pc-native-pin-label svelte-1jilz27\"> </span> <div role=\"img\"></div></div>"), Ei = /* @__PURE__ */ q("<div class=\"pc-node-body svelte-1jilz27\"> </div>"), Di = /* @__PURE__ */ q("<span class=\"pc-native-alias svelte-1jilz27\"> </span>"), Oi = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-node-action pc-host-result svelte-1jilz27\" aria-label=\"Preview host result\"><i class=\"fa-solid fa-eye svelte-1jilz27\" aria-hidden=\"true\"></i> Host result</button>"), ki = /* @__PURE__ */ q("<div class=\"pc-boundary-actions svelte-1jilz27\" data-boundary-actions=\"\"><button type=\"button\" class=\"pc-node-action svelte-1jilz27\"> </button> <button type=\"button\" class=\"pc-node-action svelte-1jilz27\"> </button></div>"), Ai = /* @__PURE__ */ q("<div role=\"group\" tabindex=\"0\"><div class=\"pc-native-heading svelte-1jilz27\"><svg class=\"pc-native-icon svelte-1jilz27\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path class=\"svelte-1jilz27\"></path></svg><span class=\"pc-node-title svelte-1jilz27\"> </span></div> <div class=\"pc-native-pins svelte-1jilz27\"></div> <!> <!> <!> <!></div>");
function ji(e, t) {
	Be(t, !0);
	let n = (e) => e.stopPropagation();
	var r = Ai();
	let i;
	var a = z(r), o = z(a), s = z(o);
	P(o);
	var c = B(o), l = z(c, !0);
	P(c), P(a);
	var u = B(a, 2);
	Z(u, 21, () => t.card.ports, (e) => e.id, (e, n) => {
		var r = Ti();
		let i;
		var a = z(r), o = z(a, !0);
		P(a);
		var s = B(a, 2);
		P(r), V(() => {
			ni(r, 1, `pc-native-row pc-native-row-${W(n).dir}`, "svelte-1jilz27"), i = ii(r, "", i, { "grid-row": W(n).row }), Y(o, W(n).label), ni(s, 1, Xr(W(n).className), "svelte-1jilz27"), $(s, "data-node", t.card.id), $(s, "data-dir", W(n).dir), $(s, "data-port", W(n).port), $(s, "data-side", W(n).side), $(s, "data-kind", W(n).kind), $(s, "title", W(n).title), $(s, "aria-label", W(n).title);
		}), G("mouseenter", s, () => t.actions.hoverPin({
			nodeId: t.card.id,
			dir: W(n).dir,
			port: W(n).port
		})), G("mouseleave", s, () => t.actions.hoverPin(null)), J(e, r);
	}), P(u);
	var d = B(u, 2), f = (e) => {
		var n = Ei(), r = z(n, !0);
		P(n), V(() => Y(r, t.card.body)), J(e, n);
	};
	X(d, (e) => {
		t.card.type === "note" && e(f);
	});
	var p = B(d, 2), m = (e) => {
		var n = Di(), r = z(n, !0);
		P(n), V(() => {
			$(n, "title", t.card.titleHint), Y(r, t.card.title);
		}), J(e, n);
	};
	X(p, (e) => {
		t.card.compact && e(m);
	});
	var h = B(p, 2), g = (e) => {
		var r = Oi();
		K("mousedown", r, n), K("click", r, (e) => {
			n(e), t.actions.hostResult(t.card.id);
		}), J(e, r);
	};
	X(h, (e) => {
		t.card.hostResult && e(g);
	});
	var _ = B(h, 2), v = (e) => {
		var r = ki(), i = z(r), a = z(i);
		P(i);
		var o = B(i, 2), s = z(o);
		P(o), P(r), V(() => {
			$(i, "aria-label", "Edit " + t.card.boundary.direction), i.disabled = !t.card.boundary.editable || !t.actions.boundary, Y(a, `Edit ${t.card.boundary.direction ?? ""}`), $(o, "aria-label", "Add " + t.card.boundary.direction), o.disabled = !t.card.boundary.editable || !t.actions.boundary, Y(s, `Add ${t.card.boundary.direction ?? ""}`);
		}), G("pointerdown", i, n, !0), G("mousedown", i, n, !0), G("click", i, (e) => {
			n(e), t.card.boundary?.editable && t.actions.boundary?.(t.card.id, "edit");
		}, !0), G("pointerdown", o, n, !0), G("mousedown", o, n, !0), G("click", o, (e) => {
			n(e), t.card.boundary?.editable && t.actions.boundary?.(t.card.id, "add");
		}, !0), J(e, r);
	};
	X(_, (e) => {
		t.card.boundary && e(v);
	}), P(r), V(() => {
		ni(r, 1, Xr(t.card.className), "svelte-1jilz27"), $(r, "data-id", t.card.id), $(r, "title", t.card.offHint), $(r, "aria-label", `${t.card.label}: ${t.card.title}`), i = ii(r, "", i, {
			left: `${t.card.x}px`,
			top: `${t.card.y}px`
		}), $(s, "d", t.card.iconPath), $(c, "title", t.card.titleHint), Y(l, t.card.title);
	}), J(e, r), Ve();
}
vr(["mousedown", "click"]);
//#endregion
//#region ui/GroupCard.svelte
var Mi = /* @__PURE__ */ q("<div class=\"pc-node-body\"> </div>"), Ni = /* @__PURE__ */ q("<div role=\"group\"><div><i class=\"fa-solid fa-object-group\" aria-hidden=\"true\"></i> <span> </span> <span class=\"pc-group-frame-count\"> </span> <button type=\"button\"></button></div> <!></div>");
function Pi(e, t) {
	Be(t, !0);
	function n(e, n) {
		e.stopPropagation(), e.preventDefault(), t.actions.group(t.group.id, n);
	}
	function r(e, n) {
		e.stopPropagation(), e.detail === 0 && t.actions.group(t.group.id, n);
	}
	var i = Ni();
	let a;
	var o = z(i), s = B(z(o), 2), c = z(s, !0);
	P(s);
	var l = B(s, 2), u = z(l, !0);
	P(l);
	var d = B(l, 2);
	P(o);
	var f = B(o, 2), p = (e) => {
		var n = Mi(), r = z(n, !0);
		P(n), V(() => Y(r, t.group.body)), J(e, n);
	};
	X(f, (e) => {
		t.group.collapsed && e(p);
	}), P(i), V(() => {
		ni(i, 1, Xr(t.group.className)), $(i, "data-group", t.group.id), $(i, "aria-label", `Group: ${t.group.title}`), a = ii(i, "", a, {
			left: `${t.group.x}px`,
			top: `${t.group.y}px`,
			width: `${t.group.w}px`,
			height: t.group.collapsed ? void 0 : `${t.group.h}px`
		}), ni(o, 1, Xr(t.group.collapsed ? "pc-node-head" : "pc-group-frame-head")), ni(s, 1, Xr(t.group.collapsed ? "pc-node-title" : "pc-group-frame-title")), Y(c, t.group.title), Y(u, t.group.count), ni(d, 1, `pc-node-action fa-solid pc-group-btn ${t.group.collapsed ? "fa-up-right-and-down-left-from-center" : "fa-down-left-and-up-right-to-center"}`), $(d, "data-action", t.group.collapsed ? "open" : "collapse"), $(d, "title", t.group.collapsed ? "Open group" : "Fold group"), $(d, "aria-label", t.group.collapsed ? "Open group" : "Fold group");
	}), K("mousedown", d, (e) => n(e, t.group.collapsed ? "open" : "collapse")), K("click", d, (e) => r(e, t.group.collapsed ? "open" : "collapse")), J(e, i), Ve();
}
vr(["mousedown", "click"]);
//#endregion
//#region ui/WireLayer.svelte
var Fi = /* @__PURE__ */ Dr("<path class=\"pc-wire-hit\"></path><path><title> </title></path><text text-anchor=\"middle\"> </text>", 1), Ii = /* @__PURE__ */ Dr("<path></path>"), Li = /* @__PURE__ */ Dr("<!><!>", 1);
function Ri(e, t) {
	Be(t, !0);
	var n = Li(), r = ln(n);
	Z(r, 17, () => t.wires, (e) => e.id, (e, t) => {
		var n = Fi(), r = ln(n), i = B(r), a = z(i), o = z(a);
		P(a), P(i);
		var s = B(i), c = z(s, !0);
		P(s), V(() => {
			$(r, "d", W(t).d), $(r, "data-id", W(t).id), $(i, "d", W(t).d), ni(i, 0, Xr(W(t).className)), $(i, "data-id", W(t).id), $(i, "data-kind", W(t).kind), Y(o, `${W(t).kind ?? ""} artifact`), $(s, "x", W(t).label.x), $(s, "y", W(t).label.y), ni(s, 0, Xr(W(t).label.className)), Y(c, W(t).label.text);
		}), J(e, n);
	});
	var i = B(r), a = (e) => {
		var n = Ii();
		V(() => {
			$(n, "d", t.ghost.d), ni(n, 0, Xr(t.ghost.className));
		}), J(e, n);
	};
	X(i, (e) => {
		t.ghost && e(a);
	}), J(e, n), Ve();
}
//#endregion
//#region ui/CommentFrame.svelte
var zi = /* @__PURE__ */ q("<span class=\"pc-comment-title svelte-118xm2r\"> </span>"), Bi = /* @__PURE__ */ q("<input class=\"pc-comment-title-input svelte-118xm2r\" aria-label=\"Comment title\"/>"), Vi = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-comment-resize svelte-118xm2r\" title=\"Drag to resize comment\"></button>"), Hi = /* @__PURE__ */ q("<div role=\"group\"><header class=\"pc-comment-header svelte-118xm2r\"><button type=\"button\" class=\"pc-comment-select svelte-118xm2r\" title=\"Drag header to move comment\">⋮⋮</button> <!></header> <div class=\"pc-comment-notes svelte-118xm2r\"> </div> <!></div>");
function Ui(e, t) {
	Be(t, !0);
	let n = (e) => e.stopPropagation();
	var r = Hi();
	let i, a;
	var o = z(r), s = z(o), c = B(s, 2), l = (e) => {
		var n = zi(), r = z(n, !0);
		P(n), V(() => Y(r, t.comment.title)), J(e, n);
	}, u = (e) => {
		var r = Bi();
		Q(r), V(() => fi(r, t.comment.title)), G("focus", r, () => t.actions.select(t.comment.id)), G("pointerdown", r, n, !0), G("mousedown", r, n, !0), G("click", r, n, !0), G("keydown", r, n, !0), K("change", r, (e) => {
			t.comment.readOnly || t.actions.update(t.comment.id, { title: e.currentTarget.value });
		}), J(e, r);
	};
	X(c, (e) => {
		t.comment.readOnly ? e(l) : e(u, -1);
	}), P(o);
	var d = B(o, 2), f = z(d, !0);
	P(d);
	var p = B(d, 2), m = (e) => {
		var n = Vi();
		V(() => $(n, "aria-label", `Resize comment: ${t.comment.title}`)), K("click", n, (e) => {
			e.detail === 0 && t.actions.select(t.comment.id);
		}), J(e, n);
	};
	X(p, (e) => {
		t.comment.readOnly || e(m);
	}), P(r), V(() => {
		i = ni(r, 1, "pc-comment-frame svelte-118xm2r", null, i, {
			"pc-comment-selected": t.comment.selected,
			"pc-comment-readonly": t.comment.readOnly
		}), $(r, "data-id", t.comment.id), $(r, "aria-label", `Comment: ${t.comment.title}`), a = ii(r, "", a, {
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
vr(["click", "change"]);
//#endregion
//#region ui/CanvasLayer.svelte
var Wi = /* @__PURE__ */ q("<div class=\"pc-viewport\" data-pc-renderer=\"svelte\"><div class=\"pc-comment-layer svelte-o7b704\"></div> <svg class=\"pc-wires\" aria-label=\"Canvas connections\"><!></svg> <div class=\"pc-nodes\"><!> <!> <!></div></div>");
function Gi(e, t) {
	Be(t, !0);
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
	}, b = Wi(), x = z(b);
	Z(x, 21, () => W(a), (e) => e.id, (e, t) => {
		Ui(e, {
			get comment() {
				return W(t);
			},
			get actions() {
				return W(o);
			}
		});
	}), P(x), xi(x, (e) => f = e, () => f);
	var S = B(x, 2);
	Ri(z(S), {
		get wires() {
			return W(i);
		},
		get ghost() {
			return W(s);
		}
	}), P(S), xi(S, (e) => u = e, () => u);
	var C = B(S, 2), w = z(C);
	Z(w, 17, () => W(r).filter((e) => !e.collapsed), (e) => e.id, (e, n) => {
		Pi(e, {
			get group() {
				return W(n);
			},
			get actions() {
				return t.actions;
			}
		});
	});
	var T = B(w, 2);
	return Z(T, 17, () => W(n), (e) => e.id, (e, n) => {
		ji(e, {
			get card() {
				return W(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), Z(B(T, 2), 17, () => W(r).filter((e) => e.collapsed), (e) => e.id, (e, n) => {
		Pi(e, {
			get group() {
				return W(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), P(C), xi(C, (e) => d = e, () => d), P(b), xi(b, (e) => l = e, () => l), V(() => {
		$(S, "width", W(c).w), $(S, "height", W(c).h), $(S, "viewBox", `0 0 ${W(c).w} ${W(c).h}`);
	}), J(e, b), Ve(y);
}
//#endregion
//#region ui/WorkspaceMenus.svelte
var Ki = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-flat-menu\" aria-haspopup=\"menu\"> </button>"), qi = /* @__PURE__ */ q("<button type=\"button\" role=\"menuitem\"><span> </span><small> </small></button>"), Ji = /* @__PURE__ */ q("<div class=\"pc-workspace-menu-panel\" role=\"menu\" tabindex=\"-1\"></div>"), Yi = /* @__PURE__ */ q("<nav class=\"pc-workspace-menus\" aria-label=\"Workspace menus\"><!> <!></nav>");
function Xi(e, t) {
	Be(t, !0);
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
				u("Import workflow", "import"),
				u("Import into graph…", "import-into-graph"),
				u("Export workflow", "export"),
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
			case "Node": return [
				u("Add node…", "add-node"),
				u("Inspect selection", "reveal-inspector"),
				u("Subgraphs", "subgraphs")
			];
			case "Preview": return [u("Show preview", "show-preview"), u("Collapse preview", "collapse-preview")];
			case "Workflows": return [
				u("Workflow setup…", "workflow-setup"),
				u("Workflow examples…", "workflow-setup"),
				u("Run workflow", "run-workflow", "", !W(n) || !!W(n)?.busy || !!W(n)?.issues.length),
				u("Stop workflow", "stop-workflow", "", !W(n)?.busy),
				u("Subgraphs", "subgraphs")
			];
			case "Tools": return [
				u("Theme and colours", "theme"),
				u("Toggle inspector", "inspector"),
				u("Manage subgraphs", "subgraphs")
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
		R(r, e, !0), o = t, await cr();
		let i = t.getBoundingClientRect(), l = W(a).getBoundingClientRect();
		R(s, Math.max(4, Math.min(i.left, window.innerWidth - l.width - 4)), !0), R(c, i.bottom + 2), n && W(a).querySelector("button:not(:disabled)")?.focus();
	}
	function m(e) {
		f(!0), [
			"open-workflow",
			"workflow-setup",
			"show-preview",
			"collapse-preview",
			"add-node",
			"help"
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
	var g = Yi();
	G("pointerdown", en, (e) => {
		W(r) && !i.contains(e.target) && !W(a)?.contains(e.target) && f();
	}), G("resize", en, () => f());
	var _ = z(g);
	Z(_, 17, () => l, zr, (e, t) => {
		var n = Ki(), i = z(n, !0);
		P(n), V(() => {
			$(n, "data-menu", W(t)), $(n, "aria-expanded", W(r) === W(t)), Y(i, W(t));
		}), K("click", n, (e) => p(W(t), e.currentTarget)), K("keydown", n, h), J(e, n);
	});
	var v = B(_, 2), y = (e) => {
		var t = Ji();
		let n;
		Z(t, 21, () => d(W(r)), zr, (e, t) => {
			var n = qi(), r = z(n), i = z(r, !0);
			P(r);
			var a = B(r), o = z(a, !0);
			P(a), P(n), V(() => {
				n.disabled = W(t).disabled, Y(i, W(t).label), Y(o, W(t).shortcut);
			}), K("click", n, () => m(W(t).command)), J(e, n);
		}), P(t), xi(t, (e) => R(a, e), () => W(a)), V(() => {
			$(t, "aria-label", W(r)), n = ii(t, "", n, {
				left: `${W(s)}px`,
				top: `${W(c)}px`
			});
		}), K("keydown", t, h), J(e, t);
	};
	X(v, (e) => {
		W(r) && e(y);
	}), P(g), xi(g, (e) => i = e, () => i), J(e, g), Ve();
}
vr(["click", "keydown"]);
//#endregion
//#region ui/Toolbar.svelte
var Zi = /* @__PURE__ */ q("<option> </option>"), Qi = /* @__PURE__ */ q("<header class=\"pc-header\" data-pc-ui=\"svelte\"><div class=\"pc-menubar\"><div class=\"pc-brand\"><img width=\"30\" height=\"30\" alt=\"\"/><span>LATTICE</span></div> <!> <button type=\"button\" class=\"pc-btn menu_button pc-close\" title=\"Close\" aria-label=\"Close canvas\">×</button></div> <div class=\"pc-workflow-bar\"><select class=\"pc-select pc-graph-select text_pole\" aria-label=\"Workflow\"></select> <div class=\"pc-header-actions pc-history\"><button type=\"button\" aria-label=\"Undo\">↶</button> <button type=\"button\" aria-label=\"Redo\">↷</button> <span> </span></div> <button type=\"button\" class=\"pc-btn menu_button pc-root-run\"> </button> <span class=\"pc-root-workflow-status\" role=\"status\"> </span> <button type=\"button\" class=\"pc-btn menu_button\" title=\"Workflow setup\">Setup</button> <div class=\"pc-header-actions pc-surface-actions\"><button type=\"button\" title=\"Show or hide the inspector\" aria-label=\"Toggle inspector\">Details</button></div> <label class=\"pc-arm\"><input class=\"pc-arm-input\" type=\"checkbox\"/><span>Arm</span></label></div></header>");
function $i(e, t) {
	Be(t, !0);
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
	}, u = Qi(), d = z(u), f = z(d), p = z(f);
	ke(), P(f);
	var m = B(f, 2);
	Xi(m, {
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
	var h = B(m, 2);
	P(d);
	var g = B(d, 2), _ = z(g);
	Z(_, 21, () => t.state.graphs, (e) => e.id, (e, t) => {
		var n = Zi(), r = z(n, !0);
		P(n);
		var i = {};
		V(() => {
			Y(r, W(t).name), i !== (i = W(t).id) && (n.value = (n.__value = W(t).id) ?? "");
		}), J(e, n);
	}), P(_), xi(_, (e) => i = e, () => i);
	var v;
	oi(_);
	var y = B(_, 2), b = z(y), x = B(b, 2), S = B(x, 2), C = z(S, !0);
	P(S), P(y);
	var w = B(y, 2), T = z(w, !0);
	P(w);
	var E = B(w, 2), ee = z(E);
	P(E);
	var D = B(E, 2), O = B(D, 2), te = z(O);
	xi(te, (e) => o = e, () => o), P(O);
	var ne = B(O, 2), k = z(ne);
	return Q(k), xi(k, (e) => a = e, () => a), ke(), P(ne), P(g), P(u), xi(u, (e) => r = e, () => r), V((e) => {
		$(p, "src", t.actions.logoUrl), v !== (v = t.state.graphId) && (_.value = (_.__value = t.state.graphId) ?? "", ai(_, t.state.graphId)), ni(b, 1, `pc-btn menu_button pc-undo${t.state.history.undo ? "" : " pc-disabled"}`), b.disabled = !t.state.history.undo, $(b, "title", t.state.history.undoTitle), ni(x, 1, `pc-btn menu_button pc-redo${t.state.history.redo ? "" : " pc-disabled"}`), x.disabled = !t.state.history.redo, $(x, "title", t.state.history.redoTitle), ni(S, 1, `pc-history-note${t.state.history.showNote ? " pc-show" : ""}`), Y(C, t.state.history.note), w.disabled = !W(n) || !W(n).busy && !!W(n).issues.length, $(w, "title", e), Y(T, W(n)?.busy ? "■ Stop" : "▶ Run"), Y(ee, `${W(n) ? `${W(n).phase} · ${W(n).assigned ? "Assigned" : "Unassigned"} · ≤ ${W(n).callBound} requests` : "Workflow unavailable"} · Autosave`), ni(te, 1, `pc-btn menu_button pc-pane-toggle${t.state.inspectorOpen ? " pc-on" : ""}`), $(te, "aria-pressed", t.state.inspectorOpen), pi(k, t.state.armed);
	}, [() => W(n)?.issues.join("\n") || "Run the root workflow"]), K("click", h, () => t.actions.command("close")), K("change", _, (e) => t.actions.pickGraph(e.currentTarget.value)), K("click", b, () => t.actions.command("undo")), K("click", x, () => t.actions.command("redo")), K("click", w, () => t.actions.command(W(n)?.busy ? "stop-workflow" : "run-workflow")), K("click", D, () => t.local("workflow-setup")), K("click", te, () => t.actions.command("inspector")), K("change", k, (e) => t.actions.arm(e.currentTarget.checked)), J(e, u), Ve(l);
}
vr(["click", "change"]);
//#endregion
//#region ui/PaneDivider.svelte
var ea = /* @__PURE__ */ q("<div class=\"pc-pane-divider\" role=\"separator\" aria-label=\"Resize preview\" aria-orientation=\"horizontal\" tabindex=\"0\"></div>");
function ta(e, t) {
	Be(t, !0);
	let n = Si(t, "min", 3, 90), r = Si(t, "max", 3, 500), i, a = null, o = (e) => Math.max(n(), Math.min(r(), e));
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
	wi(u);
	var f = ea();
	G("blur", en, u), xi(f, (e) => i = e, () => i), V((e, t) => {
		$(f, "aria-valuemin", n()), $(f, "aria-valuemax", e), $(f, "aria-valuenow", t);
	}, [() => Math.round(r()), () => Math.round(t.height)]), K("pointerdown", f, s), K("pointermove", f, c), K("pointerup", f, (e) => l(!1, e.pointerId)), G("pointercancel", f, (e) => l(!0, e.pointerId)), G("lostpointercapture", f, (e) => l(!0, e.pointerId)), K("keydown", f, d), J(e, f), Ve();
}
vr([
	"pointerdown",
	"pointermove",
	"pointerup",
	"keydown"
]);
//#endregion
//#region ui/DetailsDivider.svelte
var na = /* @__PURE__ */ q("<div class=\"pc-details-divider svelte-1iyzcro\" role=\"separator\" aria-label=\"Resize Details\" aria-orientation=\"vertical\" tabindex=\"0\"></div>");
function ra(e, t) {
	Be(t, !0);
	let n = Si(t, "min", 3, 220), r = Si(t, "max", 3, 520), i, a = null, o = (e) => Math.max(n(), Math.min(r(), e));
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
	wi(c);
	var f = na();
	G("blur", en, c), xi(f, (e) => i = e, () => i), V((e, t) => {
		$(f, "aria-valuemin", n()), $(f, "aria-valuemax", e), $(f, "aria-valuenow", t);
	}, [() => Math.round(r()), () => Math.round(t.width)]), K("pointerdown", f, l), K("pointermove", f, u), K("pointerup", f, (e) => s(!1, e.pointerId)), G("pointercancel", f, (e) => s(!0, e.pointerId)), G("lostpointercapture", f, (e) => s(!0, e.pointerId)), K("keydown", f, d), J(e, f), Ve();
}
vr([
	"pointerdown",
	"pointermove",
	"pointerup",
	"keydown"
]);
//#endregion
//#region ui/GraphTabs.svelte
var ia = /* @__PURE__ */ q("<span class=\"pc-graph-tab-lock svelte-7ptwed\" aria-label=\"Read only\">◇</span>"), aa = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-graph-tab-close svelte-7ptwed\">×</button>"), oa = /* @__PURE__ */ q("<div><button type=\"button\" role=\"tab\"><span class=\"svelte-7ptwed\"> </span><!></button> <!></div>"), sa = /* @__PURE__ */ q("<button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button>"), ca = /* @__PURE__ */ q("<div class=\"pc-graph-view-menu svelte-7ptwed\" role=\"menu\" aria-label=\"Graph view actions\" tabindex=\"-1\"><!> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close active view</button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close other views</button> <!></div>"), la = /* @__PURE__ */ q("<nav class=\"pc-graph-tabs pc-graph-tabs-multi svelte-7ptwed\" aria-label=\"Open graph views\"><div class=\"pc-graph-tab-list svelte-7ptwed\" role=\"tablist\" aria-label=\"Graph views\"></div> <button type=\"button\" class=\"pc-graph-view-overflow svelte-7ptwed\" aria-label=\"Graph view actions\" title=\"Focus, close or reopen graph views\" aria-haspopup=\"menu\">⋯</button> <!></nav>");
function ua(e, t) {
	Be(t, !0);
	let n = Si(t, "actions", 19, () => ({})), r = Si(t, "idPrefix", 3, "pc-graph-view"), i = /* @__PURE__ */ L(null), a = /* @__PURE__ */ L(null), o = /* @__PURE__ */ L(null), s = /* @__PURE__ */ L(!1), c = /* @__PURE__ */ L(""), l = "", u = {};
	yn(() => {
		let e = t.views?.active.key ?? "";
		l === e ? t.views && !t.views.tabs.some((e) => e.key === W(c)) && R(c, e, !0) : (R(c, e, !0), R(s, !1)), l = e;
	});
	function d(e) {
		let t = e.breadcrumbs.map((e) => e.label).join(" / ") || e.label, n = e.identity;
		return n.kind === "instance" ? `${t} (${n.instancePath.map((e) => JSON.stringify(e)).join(" → ")})` : n.kind === "library" ? `${t} · Library v${n.definitionRef.version} (${n.definitionRef.id})` : t;
	}
	function f(e) {
		R(c, e, !0), n().focusView?.(e), u[e]?.focus({ preventScroll: !0 });
	}
	function p(e, n) {
		if (!t.views || ![
			"ArrowLeft",
			"ArrowRight",
			"Home",
			"End",
			"Delete"
		].includes(e.key)) return;
		if (e.preventDefault(), e.stopPropagation(), e.key === "Delete") {
			t.views.tabs[n].identity.kind !== "root" && m(t.views.tabs[n]);
			return;
		}
		let r = e.key === "Home" ? 0 : e.key === "End" ? t.views.tabs.length - 1 : (n + (e.key === "ArrowLeft" ? t.views.tabs.length - 1 : 1)) % t.views.tabs.length;
		f(t.views.tabs[r].key);
	}
	async function m(e) {
		if (e.identity.kind === "root") return;
		n().closeView?.(e.key), await cr();
		let r = t.views?.active.key;
		r && t.views?.tabs.some((e) => e.key === r) && (R(c, r, !0), u[r]?.focus({ preventScroll: !0 }));
	}
	function h(e = !1) {
		R(s, !1), e && W(o)?.focus({ preventScroll: !0 });
	}
	async function g() {
		R(s, !W(s)), W(s) && (await cr(), W(s) && W(a)?.querySelector("button:not(:disabled)")?.focus());
	}
	function _(e) {
		if (e.stopPropagation(), e.key === "Escape") {
			e.preventDefault(), h(!0);
			return;
		}
		if (e.key === "Tab") {
			h();
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
	function v(e) {
		h(!0), e();
	}
	var y = kr();
	G("pointerdown", en, (e) => {
		W(s) && !W(i)?.contains(e.target) && h();
	});
	var b = ln(y), x = (e) => {
		var l = la(), h = z(l);
		Z(h, 23, () => t.views.tabs, (e) => e.key, (e, n, i) => {
			var a = oa();
			let o;
			var s = z(a);
			let l;
			var h = z(s), g = z(h, !0);
			P(h);
			var _ = B(h), v = (e) => {
				J(e, ia());
			};
			X(_, (e) => {
				W(n).readOnly && e(v);
			}), P(s), xi(s, (e, t) => u[t.key] = e, (e) => u?.[e.key], () => [W(n)]);
			var y = B(s, 2), b = (e) => {
				var r = aa();
				V((e, i) => {
					$(r, "aria-label", e), $(r, "title", i), $(r, "tabindex", W(n).key === (W(c) || t.views.active.key) ? 0 : -1);
				}, [() => `Close ${W(n).label} · ${d(W(n))}`, () => `Close ${d(W(n))}`]), K("click", r, () => m(W(n))), J(e, r);
			};
			X(y, (e) => {
				W(n).identity.kind !== "root" && e(b);
			}), P(a), V((e) => {
				o = ni(a, 1, "pc-graph-tab-item svelte-7ptwed", null, o, { "pc-graph-tab-active": W(n).key === t.views.active.key }), l = ni(s, 1, "pc-graph-tab svelte-7ptwed", null, l, { "pc-graph-tab-closeable": W(n).identity.kind !== "root" }), $(s, "id", `${r()}-${W(i)}`), $(s, "aria-controls", t.panelId), $(s, "aria-selected", W(n).key === t.views.active.key), $(s, "tabindex", W(n).key === (W(c) || t.views.active.key) ? 0 : -1), $(s, "title", e), Y(g, W(n).label);
			}, [() => d(W(n))]), K("click", s, () => f(W(n).key)), K("keydown", s, (e) => p(e, W(i))), J(e, a);
		}), P(h);
		var y = B(h, 2);
		xi(y, (e) => R(o, e), () => W(o));
		var b = B(y, 2), x = (e) => {
			var r = ca(), i = z(r);
			Z(i, 17, () => t.views.tabs, (e) => e.key, (e, t) => {
				var n = sa(), r = z(n);
				P(n), V((e, t) => {
					$(n, "title", e), Y(r, `Focus ${t ?? ""}`);
				}, [() => d(W(t)), () => d(W(t))]), K("click", n, () => v(() => f(W(t).key))), J(e, n);
			});
			var o = B(i, 2), s = B(o, 2);
			Z(B(s, 2), 17, () => t.views.closedViews, (e) => e.key, (e, t) => {
				var r = sa(), i = z(r);
				P(r), V((e, n) => {
					$(r, "title", e), Y(i, `Reopen ${W(t).label ?? ""} · ${n ?? ""}`);
				}, [() => d(W(t)), () => d(W(t))]), K("click", r, () => v(() => n().reopenView?.(W(t).key))), J(e, r);
			}), P(r), xi(r, (e) => R(a, e), () => W(a)), V((e) => {
				o.disabled = t.views.active.identity.kind === "root" || !n().closeView, s.disabled = e;
			}, [() => t.views.tabs.every((e) => e.identity.kind === "root" || e.key === t.views.active.key) || !n().closeOtherViews]), K("keydown", r, _), K("click", o, () => v(() => m(t.views.active))), K("click", s, () => v(() => n().closeOtherViews?.(t.views.active.key))), J(e, r);
		};
		X(b, (e) => {
			W(s) && e(x);
		}), P(l), xi(l, (e) => R(i, e), () => W(i)), V(() => $(y, "aria-expanded", W(s))), K("click", y, g), J(e, l);
	};
	X(b, (e) => {
		t.views && e(x);
	}), J(e, y), Ve();
}
vr(["click", "keydown"]);
//#endregion
//#region ui/GraphBreadcrumbs.svelte
var da = /* @__PURE__ */ q("<span aria-current=\"page\" class=\"svelte-18ovafz\"> </span>"), fa = /* @__PURE__ */ q("<button type=\"button\" class=\"svelte-18ovafz\"> </button>"), pa = /* @__PURE__ */ q("<li class=\"svelte-18ovafz\"><!></li>"), ma = /* @__PURE__ */ q("<div class=\"pc-graph-location svelte-18ovafz\"><nav aria-label=\"Graph location\" class=\"svelte-18ovafz\"><ol class=\"svelte-18ovafz\"></ol></nav> <span class=\"pc-graph-scope svelte-18ovafz\"> <!><!></span></div>");
function ha(e, t) {
	Be(t, !0);
	let n = Si(t, "actions", 19, () => ({})), r = /* @__PURE__ */ F(() => t.view?.identity.kind === "library" ? t.view.identity.definitionRef : t.definitionRef ?? t.view?.definitionRef);
	function i(e) {
		return e.identity.kind === "instance" ? !!n().openInstance : !!n().focusView;
	}
	function a(e) {
		e.identity.kind === "instance" ? n().openInstance?.(e.identity.instancePath) : n().focusView?.(e.key);
	}
	var o = kr(), s = ln(o), c = (e) => {
		var n = ma(), o = z(n), s = z(o);
		Z(s, 23, () => t.view.breadcrumbs, (e) => e.key, (e, n, r) => {
			var o = pa(), s = z(o), c = (e) => {
				var t = da(), r = z(t, !0);
				P(t), V(() => Y(r, W(n).label)), J(e, t);
			}, l = (e) => {
				var t = fa(), r = z(t, !0);
				P(t), V((e) => {
					t.disabled = e, Y(r, W(n).label);
				}, [() => !i(W(n))]), K("click", t, () => a(W(n))), J(e, t);
			};
			X(s, (e) => {
				W(r) === t.view.breadcrumbs.length - 1 ? e(c) : e(l, -1);
			}), P(o), J(e, o);
		}), P(s), P(o);
		var c = B(o, 2), l = z(c, !0), u = B(l), d = (e) => {
			var t = Or();
			V(() => Y(t, `· v${W(r).version ?? ""}`)), J(e, t);
		};
		X(u, (e) => {
			W(r) && e(d);
		});
		var f = B(u), p = (e) => {
			J(e, Or("· Read only"));
		};
		X(f, (e) => {
			(t.view.readOnly || t.view.identity.kind === "library") && e(p);
		}), P(c), P(n), V(() => {
			$(c, "title", W(r) ? `${W(r).id} · v${W(r).version} · ${W(r).semanticHash}` : void 0), Y(l, t.view.identity.kind === "library" ? "Library inspection" : "Instance graph");
		}), J(e, n);
	};
	X(s, (e) => {
		t.view && t.view.identity.kind !== "root" && e(c);
	}), J(e, o), Ve();
}
vr(["click"]);
//#endregion
//#region ui/NodeDetails.svelte
var ga = /* @__PURE__ */ q("<option class=\"svelte-59ntjv\"> </option>"), _a = /* @__PURE__ */ q("<p class=\"pc-detail-error svelte-59ntjv\" role=\"alert\"> </p>"), va = /* @__PURE__ */ q("<fieldset class=\"pc-detail-group svelte-59ntjv\" data-boundary-controls=\"\"><legend class=\"svelte-59ntjv\"> </legend> <label class=\"svelte-59ntjv\">Port label<input aria-label=\"Subgraph port label\" class=\"svelte-59ntjv\"/></label> <label class=\"svelte-59ntjv\">Type<select aria-label=\"Subgraph port type\" class=\"svelte-59ntjv\"></select></label> <label class=\"pc-detail-check svelte-59ntjv\"><input aria-label=\"Required subgraph port\" type=\"checkbox\" class=\"svelte-59ntjv\"/> Required</label> <div class=\"pc-detail-actions svelte-59ntjv\"><button type=\"button\" data-save-boundary=\"\" class=\"svelte-59ntjv\"> </button><button type=\"button\" data-remove-boundary=\"\" class=\"pc-detail-danger svelte-59ntjv\"> </button></div> <small class=\"svelte-59ntjv\">Labels appear on the subgraph block. Disconnect incompatible connections before changing the type or removing this port.</small> <div class=\"pc-detail-actions svelte-59ntjv\"><button type=\"button\" data-add-boundary=\"input\" class=\"svelte-59ntjv\">Add input</button><button type=\"button\" data-add-boundary=\"output\" class=\"svelte-59ntjv\">Add output</button></div> <!></fieldset>"), ya = /* @__PURE__ */ q("<label class=\"svelte-59ntjv\">Alias<input aria-label=\"Alias\" maxlength=\"80\" class=\"svelte-59ntjv\"/></label> <button type=\"button\" class=\"svelte-59ntjv\">Reset alias</button>", 1), ba = /* @__PURE__ */ q("<select class=\"svelte-59ntjv\"></select>"), xa = /* @__PURE__ */ q("<input type=\"checkbox\" class=\"svelte-59ntjv\"/>"), Sa = /* @__PURE__ */ q("<input type=\"number\" class=\"svelte-59ntjv\"/>"), Ca = /* @__PURE__ */ q("<textarea class=\"svelte-59ntjv\"></textarea>"), wa = /* @__PURE__ */ q("<button type=\"button\" class=\"svelte-59ntjv\"> </button>"), Ta = /* @__PURE__ */ q("<small class=\"svelte-59ntjv\"> </small>"), Ea = /* @__PURE__ */ q("<small class=\"svelte-59ntjv\"> <!></small>"), Da = /* @__PURE__ */ q("<label class=\"svelte-59ntjv\"> <!></label> <!> <!> <!> <!> <!>", 1), Oa = /* @__PURE__ */ q("<fieldset class=\"pc-detail-group svelte-59ntjv\"><legend class=\"svelte-59ntjv\">Operation</legend> <label class=\"pc-detail-check svelte-59ntjv\"><input aria-label=\"Enabled\" type=\"checkbox\" class=\"svelte-59ntjv\"/> Enabled</label> <small class=\"svelte-59ntjv\">Disabled operations block execution.</small> <!> <!></fieldset>"), ka = /* @__PURE__ */ q("<label class=\"svelte-59ntjv\">Connection profile<select aria-label=\"Connection profile\" class=\"svelte-59ntjv\"><option class=\"svelte-59ntjv\">Choose a connection</option><!></select></label>"), Aa = /* @__PURE__ */ q("<label class=\"svelte-59ntjv\">Model identifier<input aria-label=\"Model identifier\" class=\"svelte-59ntjv\"/></label>"), ja = /* @__PURE__ */ q("<p class=\"pc-detail-error svelte-59ntjv\"> </p>"), Ma = /* @__PURE__ */ q("<fieldset class=\"pc-detail-group svelte-59ntjv\" data-model-controls=\"\"><legend class=\"svelte-59ntjv\">Model</legend> <label class=\"svelte-59ntjv\">Model role<input aria-label=\"Model role\" class=\"svelte-59ntjv\"/></label> <label class=\"svelte-59ntjv\">Connection mode<select aria-label=\"Connection mode\" class=\"svelte-59ntjv\"></select></label> <!> <label class=\"svelte-59ntjv\">Model mode<select aria-label=\"Model mode\" class=\"svelte-59ntjv\"></select></label> <!> <small class=\"svelte-59ntjv\"> </small><small class=\"svelte-59ntjv\"> </small> <!> <!></fieldset>"), Na = /* @__PURE__ */ q("<p class=\"pc-detail-port svelte-59ntjv\"> <small class=\"svelte-59ntjv\"> </small></p>"), Pa = /* @__PURE__ */ q("<details class=\"svelte-59ntjv\"><summary class=\"svelte-59ntjv\">Inputs and outputs</summary><!></details>"), Fa = /* @__PURE__ */ q("<p role=\"status\" class=\"svelte-59ntjv\"> </p>"), Ia = /* @__PURE__ */ q("<footer class=\"svelte-59ntjv\"><button type=\"button\" class=\"svelte-59ntjv\">Duplicate</button><button type=\"button\" class=\"pc-detail-danger svelte-59ntjv\">Delete</button></footer>"), La = /* @__PURE__ */ q("<header class=\"svelte-59ntjv\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-59ntjv\"><path class=\"svelte-59ntjv\"></path></svg><div class=\"svelte-59ntjv\"><h3 class=\"svelte-59ntjv\"> </h3><small class=\"svelte-59ntjv\"><!></small></div></header> <p class=\"pc-detail-meta svelte-59ntjv\"> <!></p> <!> <fieldset class=\"pc-detail-group svelte-59ntjv\"><legend class=\"svelte-59ntjv\">Presentation</legend> <!> <label class=\"pc-detail-check svelte-59ntjv\"><input aria-label=\"Compact card\" type=\"checkbox\" class=\"svelte-59ntjv\"/> Compact card</label> <!></fieldset> <!> <!> <!> <!> <!> <!>", 1), Ra = /* @__PURE__ */ q("<p class=\"pc-detail-empty svelte-59ntjv\">Select a node to inspect its settings.</p>"), za = /* @__PURE__ */ q("<section class=\"pc-node-details svelte-59ntjv\" aria-label=\"Node details\"><!></section>");
function Ba(e, t) {
	Be(t, !0);
	let n = Si(t, "actions", 19, () => ({})), r = Si(t, "idPrefix", 3, "pc-node-details"), i = /* @__PURE__ */ L(Zt({})), a = /* @__PURE__ */ L(Zt({})), o = "", s = "", c = 0, l = 0, u = /* @__PURE__ */ new Map(), d = (e) => JSON.stringify([e.selectionKey, "kind" in e.address ? [
		e.address.kind,
		e.address.definitionRef.id,
		e.address.definitionRef.version,
		e.address.definitionRef.semanticHash,
		e.address.nodeId
	] : [
		e.address.workflowId,
		e.address.instancePath,
		e.address.nodeId
	]]), f = !0;
	wi(() => {
		f = !1, u.clear();
	}), yn(() => {
		let e = t.view ? d(t.view) : "", n = t.view?.revision ?? "", r = e !== o;
		(r || n !== s) && (r && l++, o = e, s = n, u.clear(), c++, R(a, {}, !0), R(i, r ? {} : dr(() => Object.fromEntries(Object.entries(W(i)).map(([e, t]) => [e, {
			...t,
			pending: !1
		}]))), !0));
	});
	let p = (e) => ({
		selectionKey: e.selectionKey,
		revision: e.revision,
		address: "kind" in e.address ? {
			...e.address,
			definitionRef: { ...e.address.definitionRef }
		} : {
			...e.address,
			instancePath: [...e.address.instancePath]
		}
	}), m = (e) => f && !!t.view && t.view.selectionKey === e.selectionKey && t.view.revision === e.revision && d(t.view) === d(e);
	function h(e) {
		return e.editor === "json" ? e.representation === "json-text" ? String(e.value ?? "") : JSON.stringify(e.value, null, 2) : e.editor === "lines" && Array.isArray(e.value) ? e.value.join("\n") : String(e.value ?? "");
	}
	async function g(e, n, r) {
		let o = t.view;
		if (!o || (n ? !o.canPresent : o.readOnly)) return;
		let s = p(o), l = ++c;
		u.set(e, l), R(a, {
			...W(a),
			[e]: ""
		}, !0), W(i)[e] && R(i, {
			...W(i),
			[e]: {
				...W(i)[e],
				pending: !0,
				error: ""
			}
		}, !0);
		let d = "";
		try {
			let e = await r(s);
			e.ok || (d = e.error.code + ": " + e.error.message);
		} catch {
			d = "The edit could not be accepted. Please try again.";
		}
		if (m(s) && u.get(e) === l && (u.delete(e), R(a, {
			...W(a),
			[e]: d
		}, !0), W(i)[e])) {
			if (d) R(i, {
				...W(i),
				[e]: {
					...W(i)[e],
					error: d,
					pending: !1
				}
			}, !0);
			else {
				let t = { ...W(i) };
				delete t[e], R(i, t, !0);
			}
		}
	}
	function _(e, n) {
		t.view && !t.view.readOnly && (u.delete(e.key), R(i, {
			...W(i),
			[e.key]: {
				text: n,
				error: "",
				pending: !1
			}
		}, !0), R(a, {
			...W(a),
			[e.key]: ""
		}, !0));
	}
	function v(e) {
		if (!t.view || t.view.readOnly || !n().editControl) return;
		let r = W(i)[e.key]?.text ?? h(e), a = r;
		if (e.editor === "json") try {
			if (!(e.representation === "json-text" && e.allowEmpty && r.trim() === "")) {
				let t = JSON.parse(r);
				e.representation !== "json-text" && (a = t);
			}
		} catch {
			R(i, {
				...W(i),
				[e.key]: {
					text: r,
					error: "Enter valid JSON before saving.",
					pending: !1
				}
			}, !0);
			return;
		}
		else e.editor === "lines" && (a = r.split("\n").filter((e) => e.trim()));
		g(e.key, !1, (t) => n().editControl(t, e.key, a));
	}
	function y(e, t) {
		n().editControl && g(e.key, !1, (r) => n().editControl(r, e.key, t));
	}
	function b(e, r) {
		if (!t.view || t.view.readOnly || !n().editControl) return;
		let i = Number(r.value);
		!r.value.trim() || !Number.isFinite(i) ? R(a, {
			...W(a),
			[e.key]: "Enter a finite number before saving."
		}, !0) : r.validity.valid ? y(e, i) : R(a, {
			...W(a),
			[e.key]: "Enter a number within the allowed range and step."
		}, !0);
	}
	function x(e, t, r) {
		S(e)?.allowedModes.some((e) => e.value === t) && n().editBinding && g(e, !1, (i) => n().editBinding(i, e, t, r));
	}
	let S = (e) => e === "profileId" ? t.view?.model?.profile : t.view?.model?.model, C = (e) => W(i)[e] ? "override" : S(e)?.mode, w = (e) => W(i)[e]?.text ?? S(e)?.value ?? "";
	function T(e, r) {
		t.view && !t.view.readOnly && n().editBinding && S(e)?.allowedModes.some((e) => e.value === "override") && (u.delete(e), R(i, {
			...W(i),
			[e]: {
				text: r,
				error: "",
				pending: !1
			}
		}, !0), R(a, {
			...W(a),
			[e]: ""
		}, !0));
	}
	function E(e, r) {
		let o = S(e);
		if (!t.view || t.view.readOnly || !n().editBinding || !o?.allowedModes.some((e) => e.value === r)) return;
		if (r === "override") {
			T(e, w(e));
			return;
		}
		u.delete(e);
		let s = { ...W(i) };
		delete s[e], R(i, s, !0), R(a, {
			...W(a),
			[e]: ""
		}, !0), r !== o.mode && x(e, r, null);
	}
	function ee(e, r) {
		t.view && !t.view.readOnly && C(e) === "override" && n().editBinding && S(e)?.allowedModes.some((e) => e.value === "override") && (T(e, r), r.trim() ? x(e, "override", r) : R(i, {
			...W(i),
			[e]: {
				text: r,
				error: e === "profileId" ? "Choose a connection before saving an override." : "Enter a model identifier before saving an override.",
				pending: !1
			}
		}, !0));
	}
	function D() {
		return {
			label: W(i).boundary?.text ?? t.view?.boundary?.label ?? "",
			artifactKind: W(i).boundary?.artifactKind ?? t.view?.boundary?.kind ?? "",
			required: W(i).boundary?.required ?? t.view?.boundary?.required ?? !1
		};
	}
	function O(e, r) {
		if (!t.view?.boundary || t.view.readOnly || !n().editInterface || e === "artifactKind" && !t.view.boundary.kinds.includes(String(r))) return;
		let o = {
			...D(),
			[e]: r
		};
		l++, u.delete("boundary"), R(a, {
			...W(a),
			boundary: ""
		}, !0), R(i, {
			...W(i),
			boundary: {
				text: String(o.label),
				artifactKind: String(o.artifactKind),
				required: o.required === !0,
				error: "",
				pending: !1
			}
		}, !0);
	}
	function te(e = !1) {
		if (!t.view?.boundary || t.view.readOnly || !n().editInterface || W(i).boundary?.pending) return;
		let r = t.view.boundary.id, a = D();
		if (!e && (!a.label.trim() || !t.view.boundary.kinds.includes(a.artifactKind))) return;
		let o = ++l;
		R(i, {
			...W(i),
			boundary: {
				text: a.label,
				artifactKind: a.artifactKind,
				required: a.required,
				error: "",
				pending: !1
			}
		}, !0), g("boundary", !1, async (s) => {
			let c = await n().editInterface(s, e ? {
				kind: "remove",
				id: r
			} : {
				kind: "update",
				id: r,
				...a
			});
			if (c.ok && f && t.view?.boundary?.id === r && d(t.view) === d(s) && l === o) {
				let e = { ...W(i) };
				delete e.boundary, R(i, e, !0);
			}
			return c;
		});
	}
	function ne(e) {
		t.view?.boundary && !t.view.readOnly && n().addBoundary && !W(i)["boundary-add"]?.pending && (R(i, {
			...W(i),
			"boundary-add": {
				text: "",
				error: "",
				pending: !1
			}
		}, !0), g("boundary-add", !1, (t) => n().addBoundary(t, e)));
	}
	var k = za(), A = z(k), j = (e) => {
		var o = La(), s = ln(o), c = z(s), l = z(c);
		P(c);
		var u = B(c), d = z(u), f = z(d, !0);
		P(d);
		var m = B(d), x = z(m), S = (e) => {
			var n = Or();
			V(() => Y(n, `Subgraph ${t.view.boundary.direction ?? ""}`)), J(e, n);
		}, k = (e) => {
			var n = Or();
			V(() => Y(n, `Canonical type: ${t.view.canonicalTitle ?? ""}`)), J(e, n);
		};
		X(x, (e) => {
			t.view.boundary ? e(S) : e(k, -1);
		}), P(m), P(u), P(s);
		var A = B(s, 2), j = z(A), re = B(j), ie = (e) => {
			J(e, Or("· Read-only body"));
		};
		X(re, (e) => {
			t.view.readOnly && e(ie);
		}), P(A);
		var ae = B(A, 2), oe = (e) => {
			var o = va(), s = z(o), c = z(s);
			P(s);
			var l = B(s, 2), u = B(z(l));
			Q(u), P(l);
			var d = B(l, 2), f = B(z(d));
			Z(f, 21, () => t.view.boundary.kinds, zr, (e, t) => {
				var n = ga(), r = z(n, !0);
				P(n);
				var i = {};
				V(() => {
					Y(r, W(t)), i !== (i = W(t)) && (n.value = (n.__value = W(t)) ?? "");
				}), J(e, n);
			}), P(f);
			var p;
			oi(f), P(d);
			var m = B(d, 2), h = z(m);
			Q(h), ke(), P(m);
			var g = B(m, 2), _ = z(g), v = z(_, !0);
			P(_);
			var y = B(_), b = z(y);
			P(y), P(g);
			var x = B(g, 4), S = z(x), C = B(S);
			P(x);
			var w = B(x, 2), T = (e) => {
				var t = _a(), n = z(t, !0);
				P(t), V(() => Y(n, W(i).boundary?.error || W(a).boundary || W(i)["boundary-add"]?.error || W(a)["boundary-add"])), J(e, t);
			};
			X(w, (e) => {
				(W(i).boundary?.error || W(a).boundary || W(i)["boundary-add"]?.error || W(a)["boundary-add"]) && e(T);
			}), P(o), V((e, a, o, s) => {
				Y(c, `Subgraph ${t.view.boundary.direction ?? ""}`), $(u, "id", r() + "-boundary-label"), fi(u, e), u.disabled = t.view.readOnly || !n().editInterface, f.disabled = t.view.readOnly || !n().editInterface, p !== (p = a) && (f.value = (f.__value = a) ?? "", ai(f, a)), pi(h, o), h.disabled = t.view.readOnly || !n().editInterface, _.disabled = s, Y(v, W(i).boundary?.pending ? "Validating…" : "Save port"), y.disabled = t.view.readOnly || !n().editInterface || !!W(i).boundary?.pending, Y(b, `Remove ${t.view.boundary.direction ?? ""}`), S.disabled = t.view.readOnly || !n().addBoundary || !!W(i)["boundary-add"]?.pending, C.disabled = t.view.readOnly || !n().addBoundary || !!W(i)["boundary-add"]?.pending;
			}, [
				() => D().label,
				() => D().artifactKind,
				() => D().required,
				() => t.view.readOnly || !n().editInterface || !D().label.trim() || !!W(i).boundary?.pending
			]), K("input", u, (e) => O("label", e.currentTarget.value)), K("change", f, (e) => O("artifactKind", e.currentTarget.value)), K("change", h, (e) => O("required", e.currentTarget.checked)), K("click", _, () => te()), K("click", y, () => te(!0)), K("click", S, () => ne("input")), K("click", C, () => ne("output")), J(e, o);
		};
		X(ae, (e) => {
			t.view.boundary && e(oe);
		});
		var se = B(ae, 2), ce = B(z(se), 2), le = (e) => {
			var r = ya(), i = ln(r), a = B(z(i));
			Q(a), P(i);
			var o = B(i, 2);
			V(() => {
				fi(a, t.view.alias), a.disabled = !t.view.canPresent || !n().present, o.disabled = !t.view.canPresent || !n().present;
			}), K("change", a, (e) => {
				let t = e.currentTarget.value;
				n().present && g("alias", !0, (e) => n().present(e, "alias", t));
			}), K("click", o, () => {
				n().present && g("alias", !0, (e) => n().present(e, "alias", ""));
			}), J(e, r);
		};
		X(ce, (e) => {
			t.view.boundary || e(le);
		});
		var ue = B(ce, 2), de = z(ue);
		Q(de), ke(), P(ue);
		var fe = B(ue, 2), pe = (e) => {
			var t = _a(), n = z(t, !0);
			P(t), V(() => Y(n, W(a).alias || W(a).compact)), J(e, t);
		};
		X(fe, (e) => {
			(W(a).alias || W(a).compact) && e(pe);
		}), P(se);
		var me = B(se, 2), he = (e) => {
			var o = Oa(), s = B(z(o), 2), c = z(s);
			Q(c), ke(), P(s);
			var l = B(s, 4), u = (e) => {
				var t = _a(), n = z(t, !0);
				P(t), V(() => Y(n, W(a).enabled)), J(e, t);
			};
			X(l, (e) => {
				W(a).enabled && e(u);
			}), Z(B(l, 2), 17, () => t.view.controls, (e) => e.key, (e, o) => {
				var s = Da(), c = ln(s), l = z(c), u = B(l), d = (e) => {
					var r = ba();
					Z(r, 21, () => W(o).options ?? [], (e) => e.value, (e, t) => {
						var n = ga(), r = z(n, !0);
						P(n);
						var i = {};
						V(() => {
							Y(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
						}), J(e, n);
					}), P(r);
					var i;
					oi(r), V((e) => {
						$(r, "aria-label", W(o).label), r.disabled = t.view.readOnly || !n().editControl, i !== (i = e) && (r.value = (r.__value = e) ?? "", ai(r, e));
					}, [() => String(W(o).value)]), K("change", r, (e) => y(W(o), e.currentTarget.value)), J(e, r);
				}, f = (e) => {
					var r = xa();
					Q(r), V((e) => {
						$(r, "aria-label", W(o).label), pi(r, e), r.disabled = t.view.readOnly || !n().editControl;
					}, [() => !!W(o).value]), K("change", r, (e) => y(W(o), e.currentTarget.checked)), J(e, r);
				}, p = (e) => {
					var i = Sa();
					Q(i), V((e) => {
						$(i, "aria-label", W(o).label), $(i, "min", W(o).min), $(i, "max", W(o).max), $(i, "step", W(o).step ?? 1), $(i, "aria-invalid", !!W(a)[W(o).key]), $(i, "aria-describedby", W(a)[W(o).key] ? r() + "-error-" + W(o).key : void 0), fi(i, e), i.disabled = t.view.readOnly || !n().editControl;
					}, [() => Number(W(o).value)]), K("change", i, (e) => b(W(o), e.currentTarget)), J(e, i);
				}, m = (e) => {
					var s = Ca();
					nt(s), V((e) => {
						$(s, "aria-label", W(o).label), $(s, "aria-invalid", !!(W(i)[W(o).key]?.error || W(a)[W(o).key])), $(s, "aria-describedby", W(i)[W(o).key]?.error || W(a)[W(o).key] ? r() + "-error-" + W(o).key : void 0), fi(s, e), s.disabled = t.view.readOnly || !n().editControl;
					}, [() => W(i)[W(o).key]?.text ?? h(W(o))]), K("input", s, (e) => _(W(o), e.currentTarget.value)), J(e, s);
				}, g = (e) => {
					var r = Ca();
					nt(r), V((e) => {
						$(r, "aria-label", W(o).label), fi(r, e), r.disabled = t.view.readOnly || !n().editControl;
					}, [() => h(W(o))]), K("change", r, (e) => y(W(o), e.currentTarget.value)), J(e, r);
				};
				X(u, (e) => {
					W(o).editor === "enum" ? e(d) : W(o).editor === "boolean" ? e(f, 1) : W(o).editor === "number" ? e(p, 2) : W(o).editor === "json" || W(o).editor === "lines" ? e(m, 3) : e(g, -1);
				}), P(c);
				var x = B(c, 2), S = (e) => {
					var r = wa(), a = z(r, !0);
					P(r), V(() => {
						$(r, "data-save-control", W(o).key), r.disabled = t.view.readOnly || !n().editControl || !!W(i)[W(o).key]?.pending, Y(a, W(i)[W(o).key]?.pending ? "Validating…" : "Save " + W(o).label);
					}), K("click", r, () => v(W(o))), J(e, r);
				};
				X(x, (e) => {
					(W(o).editor === "json" || W(o).editor === "lines") && e(S);
				});
				var C = B(x, 2), w = (e) => {
					var t = Ta(), n = z(t, !0);
					P(t), V(() => Y(n, W(o).help)), J(e, t);
				};
				X(C, (e) => {
					W(o).help && e(w);
				});
				var T = B(C, 2), E = (e) => {
					var t = Ta(), n = z(t, !0);
					P(t), V(() => Y(n, W(o).exposureNote)), J(e, t);
				};
				X(T, (e) => {
					W(o).exposureNote && e(E);
				});
				var ee = B(T, 2), D = (e) => {
					var t = Ea(), n = z(t), r = B(n), i = (e) => {
						var t = Or();
						V(() => Y(t, `· ${W(o).source ?? ""}`)), J(e, t);
					};
					X(r, (e) => {
						W(o).source && e(i);
					}), P(t), V(() => Y(n, `Effective: ${W(o).effective ?? ""}`)), J(e, t);
				};
				X(ee, (e) => {
					W(o).effective !== void 0 && e(D);
				});
				var O = B(ee, 2), te = (e) => {
					var t = _a(), n = z(t, !0);
					P(t), V(() => {
						$(t, "id", r() + "-error-" + W(o).key), Y(n, W(i)[W(o).key]?.error || W(a)[W(o).key]);
					}), J(e, t);
				};
				X(O, (e) => {
					(W(i)[W(o).key]?.error || W(a)[W(o).key]) && e(te);
				}), V(() => Y(l, `${W(o).label ?? ""} `)), J(e, s);
			}), P(o), V(() => {
				pi(c, t.view.enabled), c.disabled = t.view.readOnly || !n().editField;
			}), K("change", c, (e) => {
				let t = e.currentTarget.checked;
				n().editField && g("enabled", !1, (e) => n().editField(e, "enabled", t));
			}), J(e, o);
		};
		X(me, (e) => {
			t.view.boundary || e(he);
		});
		var ge = B(me, 2), _e = (e) => {
			var r = Ma(), o = B(z(r), 2), s = B(z(o));
			Q(s), P(o);
			var c = B(o, 2), l = B(z(c));
			Z(l, 21, () => t.view.model.profile.allowedModes, (e) => e.value, (e, t) => {
				var n = ga(), r = z(n, !0);
				P(n);
				var i = {};
				V(() => {
					Y(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
				}), J(e, n);
			}), P(l);
			var u;
			oi(l), P(c);
			var d = B(c, 2), f = (e) => {
				var r = ka(), i = B(z(r)), a = z(i);
				a.value = a.__value = "", Z(B(a), 17, () => t.view.model.profile.options ?? [], (e) => e.value, (e, t) => {
					var n = ga(), r = z(n, !0);
					P(n);
					var i = {};
					V(() => {
						Y(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
					}), J(e, n);
				}), P(i);
				var o;
				oi(i), P(r), V((e) => {
					i.disabled = t.view.readOnly || !n().editBinding, o !== (o = e) && (i.value = (i.__value = e) ?? "", ai(i, e));
				}, [() => w("profileId")]), K("change", i, (e) => ee("profileId", e.currentTarget.value)), J(e, r);
			}, p = /* @__PURE__ */ F(() => C("profileId") === "override");
			X(d, (e) => {
				W(p) && e(f);
			});
			var m = B(d, 2), h = B(z(m));
			Z(h, 21, () => t.view.model.model.allowedModes, (e) => e.value, (e, t) => {
				var n = ga(), r = z(n, !0);
				P(n);
				var i = {};
				V(() => {
					Y(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
				}), J(e, n);
			}), P(h);
			var _;
			oi(h), P(m);
			var v = B(m, 2), y = (e) => {
				var r = Aa(), i = B(z(r));
				Q(i), P(r), V((e) => {
					fi(i, e), i.disabled = t.view.readOnly || !n().editBinding;
				}, [() => w("model")]), K("input", i, (e) => T("model", e.currentTarget.value)), K("change", i, (e) => ee("model", e.currentTarget.value)), J(e, r);
			}, b = /* @__PURE__ */ F(() => C("model") === "override");
			X(v, (e) => {
				W(b) && e(y);
			});
			var x = B(v, 2), S = z(x);
			P(x);
			var D = B(x), O = z(D, !0);
			P(D);
			var te = B(D, 2), ne = (e) => {
				var n = ja(), r = z(n, !0);
				P(n), V(() => Y(r, t.view.model.issue)), J(e, n);
			};
			X(te, (e) => {
				t.view.model.issue && e(ne);
			});
			var k = B(te, 2), A = (e) => {
				var t = _a(), n = z(t, !0);
				P(t), V(() => Y(n, W(a).modelRole || W(i).profileId?.error || W(a).profileId || W(i).model?.error || W(a).model)), J(e, t);
			};
			X(k, (e) => {
				(W(a).modelRole || W(i).profileId?.error || W(a).profileId || W(i).model?.error || W(a).model) && e(A);
			}), P(r), V((e, r) => {
				fi(s, t.view.model.role), s.disabled = t.view.readOnly || !t.view.model.roleEditable || !n().editField, l.disabled = t.view.readOnly || !n().editBinding, u !== (u = e) && (l.value = (l.__value = e) ?? "", ai(l, e)), h.disabled = t.view.readOnly || !n().editBinding, _ !== (_ = r) && (h.value = (h.__value = r) ?? "", ai(h, r)), Y(S, `Effective connection: ${t.view.model.effective ?? ""}`), Y(O, t.view.model.source);
			}, [() => C("profileId"), () => C("model")]), K("change", s, (e) => {
				let r = e.currentTarget.value;
				t.view?.model?.roleEditable && n().editField && g("modelRole", !1, (e) => n().editField(e, "modelRole", r));
			}), K("change", l, (e) => E("profileId", e.currentTarget.value)), K("change", h, (e) => E("model", e.currentTarget.value)), J(e, r);
		};
		X(ge, (e) => {
			t.view.model && e(_e);
		});
		var ve = B(ge, 2), ye = (e) => {
			var n = Pa();
			Z(B(z(n)), 17, () => t.view.ports, (e) => e.direction + ":" + e.id, (e, t) => {
				var n = Na(), r = z(n), i = B(r), a = z(i, !0);
				P(i), P(n), V(() => {
					Y(r, `${W(t).direction === "input" ? "In" : "Out"} · ${W(t).label ?? ""}`), Y(a, W(t).kind);
				}), J(e, n);
			}), P(n), J(e, n);
		};
		X(ve, (e) => {
			t.view.ports.length && e(ye);
		});
		var be = B(ve, 2), xe = (e) => {
			var n = Fa(), r = z(n, !0);
			P(n), V(() => Y(r, t.view.status)), J(e, n);
		};
		X(be, (e) => {
			t.view.status && e(xe);
		});
		var Se = B(be, 2);
		Z(Se, 17, () => t.view.issues ?? [], zr, (e, t) => {
			var n = ja(), r = z(n, !0);
			P(n), V(() => Y(r, W(t))), J(e, n);
		});
		var Ce = B(Se, 2), we = (e) => {
			var r = Ia(), i = z(r), a = B(i);
			P(r), V(() => {
				i.disabled = t.view.readOnly || !n().duplicate, a.disabled = t.view.readOnly || !n().remove;
			}), K("click", i, () => {
				t.view && !t.view.readOnly && n().duplicate?.(p(t.view));
			}), K("click", a, () => {
				t.view && !t.view.readOnly && n().remove?.(p(t.view));
			}), J(e, r);
		};
		X(Ce, (e) => {
			t.view.boundary || e(we);
		}), V(() => {
			$(l, "d", t.view.iconPath), Y(f, t.view.title), Y(j, `${t.view.family ?? ""} · ${t.view.phase ?? ""} phase`), pi(de, t.view.compact), de.disabled = !t.view.canPresent || !n().present;
		}), K("change", de, (e) => {
			let t = e.currentTarget.checked;
			n().present && g("compact", !0, (e) => n().present(e, "compact", t));
		}), J(e, o);
	}, re = (e) => {
		J(e, Ra());
	};
	X(A, (e) => {
		t.view ? e(j) : e(re, -1);
	}), P(k), J(e, k), Ve();
}
vr([
	"input",
	"change",
	"click"
]);
//#endregion
//#region ui/CommentDetails.svelte
var Va = /* @__PURE__ */ q("<p class=\"pc-detail-meta svelte-17djc3u\">Read-only comment</p>"), Ha = /* @__PURE__ */ q("<section class=\"pc-comment-details svelte-17djc3u\" aria-label=\"Comment details\"><h3 class=\"svelte-17djc3u\">Comment</h3> <!> <fieldset class=\"pc-detail-group svelte-17djc3u\"><legend class=\"svelte-17djc3u\">Comment</legend> <label class=\"svelte-17djc3u\">Title<input aria-label=\"Comment title\" class=\"svelte-17djc3u\"/></label> <label class=\"svelte-17djc3u\">Notes<textarea aria-label=\"Comment notes\" rows=\"5\" class=\"svelte-17djc3u\"></textarea></label> <label class=\"pc-comment-color-label svelte-17djc3u\">Color<input aria-label=\"Comment color\" type=\"color\" class=\"svelte-17djc3u\"/></label> <label class=\"pc-detail-check svelte-17djc3u\"><input aria-label=\"Move contents\" type=\"checkbox\" class=\"svelte-17djc3u\"/> Move contents</label> <small class=\"svelte-17djc3u\">Moves fully contained nodes when you drag the comment header.</small></fieldset> <div class=\"pc-comment-commands svelte-17djc3u\"><button type=\"button\" class=\"pc-btn svelte-17djc3u\">Fit to contents</button> <button type=\"button\" class=\"pc-btn pc-danger svelte-17djc3u\">Delete comment</button></div> <small class=\"svelte-17djc3u\">Deleting this comment keeps its contents.</small></section>");
function Ua(e, t) {
	Be(t, !0);
	let n = Si(t, "readOnly", 3, !1), r = /* @__PURE__ */ F(() => n() || t.comment.readOnly), i = (e) => e.stopPropagation();
	function a(e) {
		W(r) || t.onPatch(e);
	}
	function o(e) {
		W(r) || t.onCommand(e);
	}
	var s = Ha(), c = B(z(s), 2), l = (e) => {
		J(e, Va());
	};
	X(c, (e) => {
		W(r) && e(l);
	});
	var u = B(c, 2), d = B(z(u), 2), f = B(z(d));
	Q(f), P(d);
	var p = B(d, 2), m = B(z(p));
	nt(m), P(p);
	var h = B(p, 2), g = B(z(h));
	Q(g), P(h);
	var _ = B(h, 2), v = z(_);
	Q(v), ke(), P(_), ke(2), P(u);
	var y = B(u, 2), b = z(y), x = B(b, 2);
	P(y), ke(2), P(s), V(() => {
		u.disabled = W(r), fi(f, t.comment.title), f.disabled = W(r), fi(m, t.comment.content), m.disabled = W(r), fi(g, t.comment.color), g.disabled = W(r), pi(v, t.comment.moveContents), v.disabled = W(r), b.disabled = W(r), x.disabled = W(r);
	}), G("keydown", f, i, !0), K("change", f, (e) => a({ title: e.currentTarget.value })), G("keydown", m, i, !0), K("change", m, (e) => a({ content: e.currentTarget.value })), K("change", g, (e) => a({ color: e.currentTarget.value })), K("change", v, (e) => a({ moveContents: e.currentTarget.checked })), K("click", b, () => o("fit")), K("click", x, () => o("delete")), J(e, s), Ve();
}
vr(["change", "click"]);
//#endregion
//#region ui/OutputPreview.svelte
var Wa = /* @__PURE__ */ q("<option class=\"svelte-ee2ehy\"> </option>"), Ga = /* @__PURE__ */ q("<label class=\"pc-preview-choice svelte-ee2ehy\"><span class=\"pc-preview-sr-only svelte-ee2ehy\">Preview output</span><select aria-label=\"Preview output\" class=\"svelte-ee2ehy\"><option disabled=\"\" class=\"svelte-ee2ehy\">Choose an output</option><!></select></label>"), Ka = /* @__PURE__ */ q("<button type=\"button\" class=\"svelte-ee2ehy\">Collapse preview</button>"), qa = /* @__PURE__ */ q("<button type=\"button\" role=\"tab\" class=\"svelte-ee2ehy\"> </button>"), Ja = /* @__PURE__ */ q("<div class=\"pc-preview-tabs svelte-ee2ehy\" role=\"tablist\" aria-label=\"Recorded artifacts\"></div>"), Ya = /* @__PURE__ */ q("<p class=\"pc-preview-note svelte-ee2ehy\"> </p>"), Xa = /* @__PURE__ */ q("<pre class=\"svelte-ee2ehy\"> </pre>"), Za = /* @__PURE__ */ q("<small class=\"pc-preview-note svelte-ee2ehy\"> </small>"), Qa = /* @__PURE__ */ q("<div role=\"tabpanel\" tabindex=\"0\" class=\"svelte-ee2ehy\"><article class=\"svelte-ee2ehy\"><div class=\"pc-preview-section-heading svelte-ee2ehy\"><span class=\"svelte-ee2ehy\"> </span><small class=\"svelte-ee2ehy\"> </small></div> <!> <!></article></div>"), $a = /* @__PURE__ */ q("<p class=\"pc-preview-empty svelte-ee2ehy\"> </p>"), eo = /* @__PURE__ */ q("<p class=\"pc-preview-error svelte-ee2ehy\"> </p>"), to = /* @__PURE__ */ q("<small class=\"pc-preview-note svelte-ee2ehy\">Apply rechecks the source and connection. Recorded preview text may be truncated.</small>"), no = /* @__PURE__ */ q("<button type=\"button\" data-run-here=\"\" title=\"Runs the selected output's dependencies. Results are diagnostic previews.\" class=\"svelte-ee2ehy\"> </button>"), ro = /* @__PURE__ */ q("<button type=\"button\" data-preview-apply=\"\" class=\"svelte-ee2ehy\">Apply reviewed candidate</button><button type=\"button\" class=\"svelte-ee2ehy\">Reject candidate</button>", 1), io = /* @__PURE__ */ q("<header class=\"svelte-ee2ehy\"><h3 class=\"svelte-ee2ehy\"> </h3> <!> <div class=\"pc-preview-tools svelte-ee2ehy\"><button type=\"button\" class=\"svelte-ee2ehy\">Follow selection</button><button type=\"button\" class=\"svelte-ee2ehy\"> </button><!></div></header> <!> <div class=\"pc-preview-sections svelte-ee2ehy\"><!> <!> <!> <!> <!> <!> <!></div> <footer class=\"svelte-ee2ehy\"><span class=\"pc-preview-status svelte-ee2ehy\"> </span> <span class=\"svelte-ee2ehy\"> </span> <!> <!></footer>", 1), ao = /* @__PURE__ */ q("<p class=\"pc-preview-empty svelte-ee2ehy\">Select a node output to inspect its recorded result.</p>"), oo = /* @__PURE__ */ q("<section class=\"pc-output-preview svelte-ee2ehy\" aria-label=\"Output preview\"><!></section>");
function so(e, t) {
	let n = Ar();
	Be(t, !0);
	let r = Si(t, "actions", 19, () => ({})), i = /* @__PURE__ */ F(() => JSON.stringify([t.view?.sourceKey, t.view?.selectedKey])), a = /* @__PURE__ */ L(Zt({
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
	var y = oo(), b = z(y), x = (e) => {
		var d = io(), m = ln(d), y = z(m), b = z(y, !0);
		P(y);
		var x = B(y, 2), S = (e) => {
			var n = Ga(), i = B(z(n)), a = z(i);
			a.value = a.__value = "", Z(B(a), 17, () => t.view.choices, (e) => e.key, (e, t) => {
				var n = Wa(), r = z(n);
				P(n);
				var i = {};
				V(() => {
					Y(r, `${W(t).label ?? ""} · ${W(t).kind ?? ""}`), i !== (i = W(t).key) && (n.value = (n.__value = W(t).key) ?? "");
				}), J(e, n);
			}), P(i);
			var o;
			oi(i), P(n), V(() => {
				i.disabled = !r().select, o !== (o = t.view.selectedKey ?? "") && (i.value = (i.__value = t.view.selectedKey ?? "") ?? "", ai(i, t.view.selectedKey ?? ""));
			}), K("change", i, (e) => _(e.currentTarget.value)), J(e, n);
		};
		X(x, (e) => {
			t.view.choices.length && e(S);
		});
		var C = B(x, 2), w = z(C), T = B(w), E = z(T, !0);
		P(T);
		var ee = B(T), D = (e) => {
			var n = Ka();
			K("click", n, function(...e) {
				t.collapse?.apply(this, e);
			}), J(e, n);
		};
		X(ee, (e) => {
			t.collapse && e(D);
		}), P(C), P(m);
		var O = B(m, 2), te = (e) => {
			var r = Ja();
			Z(r, 23, () => t.view.sections, (e) => e.id, (e, t, r) => {
				var l = qa(), u = z(l, !0);
				P(l), V((e) => {
					$(l, "id", e), $(l, "aria-selected", W(o)?.id === W(t).id), $(l, "aria-controls", n + "-panel"), $(l, "tabindex", W(o)?.id === W(t).id ? 0 : -1), Y(u, W(t).label);
				}, [() => s(W(t).id)]), K("click", l, () => {
					R(a, {
						scope: W(i),
						id: W(t).id
					}, !0);
				}), G("keydown", l, (e) => c(e, W(r)), !0), J(e, l);
			}), P(r), J(e, r);
		};
		X(O, (e) => {
			t.view.sections.length && e(te);
		});
		var ne = B(O, 2), k = z(ne), A = (e) => {
			let t = /* @__PURE__ */ F(() => W(o));
			var r = Qa(), i = z(r), a = z(i), c = z(a), l = z(c, !0);
			P(c);
			var u = B(c), d = z(u, !0);
			P(u), P(a);
			var f = B(a, 2), p = (e) => {
				var n = Ya(), r = z(n, !0);
				P(n), V(() => Y(r, W(t).text)), J(e, n);
			}, m = (e) => {
				var n = Xa(), r = z(n, !0);
				P(n), V(() => Y(r, W(t).text)), J(e, n);
			};
			X(f, (e) => {
				W(t).format === "omitted" ? e(p) : e(m, -1);
			});
			var h = B(f, 2), g = (e) => {
				var n = Za(), r = z(n);
				P(n), V(() => Y(r, `Truncated diagnostic${W(t).format === "json-prefix-text" ? " · JSON prefix shown as text" : ""}`)), J(e, n);
			};
			X(h, (e) => {
				W(t).truncated && e(g);
			}), P(i), P(r), V((e) => {
				$(r, "id", n + "-panel"), $(r, "aria-labelledby", e), $(i, "data-artifact-kind", W(t).kind), Y(l, W(t).label), Y(d, W(t).kind);
			}, [() => s(W(t).id)]), G("keydown", r, (e) => e.stopPropagation(), !0), G("paste", r, (e) => e.stopPropagation(), !0), J(e, r);
		}, j = (e) => {
			var n = $a(), r = z(n, !0);
			P(n), V(() => Y(r, t.view.status === "not-run" ? "Run this workflow or use Run to here to inspect an output." : "No recorded artifact is available for this output.")), J(e, n);
		};
		X(k, (e) => {
			W(o) ? e(A) : e(j, -1);
		});
		var re = B(k, 2), ie = (e) => {
			var n = Ya(), r = z(n, !0);
			P(n), V(() => Y(r, t.view.statusDetail)), J(e, n);
		};
		X(re, (e) => {
			t.view.statusDetail && e(ie);
		});
		var ae = B(re, 2);
		Z(ae, 17, () => t.view.sections.filter((e) => e.id !== W(o)?.id && (e.format === "omitted" || e.truncated)), (e) => e.id, (e, t) => {
			var n = Ya(), r = z(n);
			P(n), V(() => Y(r, `${W(t).label ?? ""}: ${(W(t).format === "omitted" ? W(t).text : "Truncated diagnostic" + (W(t).format === "json-prefix-text" ? " · JSON prefix shown as text" : "")) ?? ""}`)), J(e, n);
		});
		var oe = B(ae, 2), se = (e) => {
			var n = Ya(), r = z(n, !0);
			P(n), V(() => Y(r, t.view.runHere.issue)), J(e, n);
		};
		X(oe, (e) => {
			t.view.runHere?.issue && e(se);
		});
		var ce = B(oe, 2);
		Z(ce, 17, () => t.view.issues, zr, (e, t) => {
			var n = eo(), r = z(n, !0);
			P(n), V(() => Y(r, W(t))), J(e, n);
		});
		var le = B(ce, 2), ue = (e) => {
			var n = eo(), r = z(n, !0);
			P(n), V(() => Y(r, t.view.review.issue)), J(e, n);
		};
		X(le, (e) => {
			t.view.review?.issue && e(ue);
		});
		var de = B(le, 2), fe = (e) => {
			J(e, to());
		};
		X(de, (e) => {
			t.view.review && e(fe);
		}), P(ne);
		var pe = B(ne, 2), me = z(pe), he = z(me, !0);
		P(me);
		var ge = B(me, 2), _e = z(ge, !0);
		P(ge);
		var ve = B(ge, 2), ye = (e) => {
			var n = no(), i = z(n);
			P(n), V(() => {
				n.disabled = !W(p), Y(i, `Run to here · maximum ${t.view.runHere.callBound ?? ""} ${t.view.runHere.callBound === 1 ? "request" : "requests"}`);
			}), K("click", n, () => {
				t.view && W(l) && W(p) && r().runHere?.(t.view.sourceKey, f(W(l).target));
			}), J(e, n);
		};
		X(ve, (e) => {
			t.view.runHere && e(ye);
		});
		var be = B(ve, 2), xe = (e) => {
			var n = ro(), i = ln(n), a = B(i);
			V(() => {
				i.disabled = !W(h), a.disabled = !W(g);
			}), K("click", i, () => {
				t.view?.review && W(h) && r().apply?.(v(t.view.review.selector));
			}), K("click", a, () => {
				t.view?.review && W(g) && r().reject?.(v(t.view.review.selector));
			}), J(e, n);
		};
		X(be, (e) => {
			t.view.review && e(xe);
		}), P(pe), V((e) => {
			Y(b, W(l)?.label ?? t.view.title), $(w, "aria-pressed", t.view.followSelection), w.disabled = !r().follow, $(T, "aria-pressed", t.view.pinned), T.disabled = t.view.pinned ? !r().follow : !W(l) || !r().pin, Y(E, t.view.pinned ? "Unpin preview" : "Pin preview"), $(me, "data-status", t.view.status), Y(he, e), Y(_e, t.view.pinned ? "Pinned preview" : t.view.followSelection ? "Following selection" : "Selection not followed");
		}, [() => u(t.view.status)]), K("click", w, () => r().follow?.()), K("click", T, () => {
			t.view?.pinned ? r().follow?.() : t.view && W(l) && r().pin?.(t.view.sourceKey, f(W(l).target));
		}), J(e, d);
	}, S = (e) => {
		J(e, ao());
	};
	X(b, (e) => {
		t.view ? e(x) : e(S, -1);
	}), P(y), J(e, y), Ve();
}
vr(["change", "click"]);
//#endregion
//#region ui/RunDetails.svelte
var co = /* @__PURE__ */ q("<p class=\"pc-run-memory svelte-f9s2fm\" role=\"status\"> </p>"), lo = /* @__PURE__ */ q("<p class=\"pc-run-error svelte-f9s2fm\"> </p>"), uo = /* @__PURE__ */ q("<p class=\"pc-run-empty svelte-f9s2fm\">No execution plan has been recorded.</p>"), fo = /* @__PURE__ */ q("<span aria-hidden=\"true\" class=\"svelte-f9s2fm\">▱</span>"), po = /* @__PURE__ */ q("<small class=\"svelte-f9s2fm\"> </small>"), mo = /* @__PURE__ */ q("<details class=\"svelte-f9s2fm\"><summary class=\"svelte-f9s2fm\">Reported usage</summary><div class=\"pc-run-usage svelte-f9s2fm\"><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small></div></details>"), ho = /* @__PURE__ */ q("<li class=\"svelte-f9s2fm\"><div class=\"pc-run-row-heading svelte-f9s2fm\"><button type=\"button\" class=\"svelte-f9s2fm\"><!> </button><span class=\"pc-run-status svelte-f9s2fm\"> </span></div> <!> <div class=\"pc-run-row-meta svelte-f9s2fm\"><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small></div> <!> <!></li>"), go = /* @__PURE__ */ q("<header class=\"svelte-f9s2fm\"><h3 class=\"svelte-f9s2fm\">Run details</h3><span class=\"pc-run-status svelte-f9s2fm\"> </span></header> <div class=\"pc-run-summary svelte-f9s2fm\"><p class=\"svelte-f9s2fm\"> </p><p class=\"svelte-f9s2fm\"> </p><p class=\"svelte-f9s2fm\"> </p></div> <!> <!> <!> <ol class=\"pc-run-rows svelte-f9s2fm\"></ol>", 1), _o = /* @__PURE__ */ q("<p class=\"pc-run-empty svelte-f9s2fm\">Run a workflow to inspect its processing stages.</p>"), vo = /* @__PURE__ */ q("<section class=\"pc-run-details svelte-f9s2fm\" aria-label=\"Run details\"><!></section>");
function yo(e, t) {
	Be(t, !0);
	let n = Si(t, "actions", 19, () => ({})), r = (e) => e === "not-run" ? "Not run" : e === "empty" ? "Ready" : e.charAt(0).toUpperCase() + e.slice(1), i = (e) => e !== null && Number.isFinite(e) && e >= 0 ? (e / 1e3).toFixed(2) + "s" : "Unknown", a = (e) => e != null && Number.isFinite(e) && e >= 0 ? String(e) : "Unknown";
	var o = vo(), s = z(o), c = (e) => {
		var o = go(), s = ln(o), c = B(z(s)), l = z(c, !0);
		P(c), P(s);
		var u = B(s, 2), d = z(u), f = z(d);
		P(d);
		var p = B(d), m = z(p);
		P(p);
		var h = B(p), g = z(h);
		P(h), P(u);
		var _ = B(u, 2), v = (e) => {
			var n = co(), r = z(n, !0);
			P(n), V(() => Y(r, t.view.memoryStatus)), J(e, n);
		};
		X(_, (e) => {
			t.view.memoryStatus && e(v);
		});
		var y = B(_, 2), b = (e) => {
			var n = lo(), r = z(n, !0);
			P(n), V(() => Y(r, t.view.issue)), J(e, n);
		};
		X(y, (e) => {
			t.view.issue && e(b);
		});
		var x = B(y, 2), S = (e) => {
			J(e, uo());
		};
		X(x, (e) => {
			t.view.rows.length || e(S);
		});
		var C = B(x, 2);
		Z(C, 21, () => t.view.rows, (e) => e.key, (e, o) => {
			var s = ho();
			let c;
			var l = z(s), u = z(l), d = z(u), f = (e) => {
				J(e, fo());
			};
			X(d, (e) => {
				W(o).kind === "instance" && e(f);
			});
			var p = B(d, 1, !0);
			P(u);
			var m = B(u), h = z(m, !0);
			P(m), P(l);
			var g = B(l, 2), _ = (e) => {
				var t = po(), n = z(t, !0);
				P(t), V((e) => Y(n, e), [() => r(W(o).subphase)]), J(e, t);
			};
			X(g, (e) => {
				W(o).subphase && e(_);
			});
			var v = B(g, 2), y = z(v), b = z(y);
			P(y);
			var x = B(y), S = z(x);
			P(x), P(v);
			var C = B(v, 2), w = (e) => {
				var t = lo(), n = z(t, !0);
				P(t), V(() => Y(n, W(o).issue)), J(e, t);
			};
			X(C, (e) => {
				W(o).issue && e(w);
			});
			var T = B(C, 2), E = (e) => {
				var t = mo(), n = B(z(t)), r = z(n), i = z(r);
				P(r);
				var s = B(r), c = z(s);
				P(s);
				var l = B(s), u = z(l);
				P(l);
				var d = B(l), f = z(d);
				P(d), P(n), P(t), V((e, t, n) => {
					Y(i, `Input tokens: ${e ?? ""}`), Y(c, `Output tokens: ${t ?? ""}`), Y(u, `Total tokens: ${n ?? ""}`), Y(f, `Cost: ${W(o).usage?.cost ?? "Unknown" ?? ""}`);
				}, [
					() => a(W(o).usage?.inputTokens),
					() => a(W(o).usage?.outputTokens),
					() => a(W(o).usage?.totalTokens)
				]), J(e, t);
			};
			X(T, (e) => {
				W(o).kind === "primitive" && e(E);
			}), P(s), V((e, t, r) => {
				$(s, "data-run-row", W(o).key), $(s, "data-depth", W(o).depth), $(s, "data-status", W(o).status), c = ii(s, "", c, e), $(u, "aria-label", "Open " + W(o).title + " in graph"), u.disabled = !n().jump, Y(p, W(o).title), $(m, "data-status", W(o).status), Y(h, t), Y(b, `Duration: ${r ?? ""}`), Y(S, `${W(o).attempts ?? ""} of ${W(o).callBound ?? ""} requests`);
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
		}), P(C), V((e, n) => {
			$(c, "data-status", t.view.status), Y(l, e), Y(f, `${t.view.completedCount ?? ""} of ${t.view.executableCount ?? ""} stages complete`), Y(m, `${t.view.actualCalls ?? ""} of ${t.view.callBound ?? ""} requests`), Y(g, `Elapsed: ${n ?? ""}`);
		}, [() => r(t.view.status), () => i(t.view.elapsedMs)]), J(e, o);
	}, l = (e) => {
		J(e, _o());
	};
	X(s, (e) => {
		t.view ? e(c) : e(l, -1);
	}), P(o), J(e, o), Ve();
}
vr(["click"]);
//#endregion
//#region ui/RunMeter.svelte
var bo = /* @__PURE__ */ q("<span class=\"pc-run-meter-elapsed svelte-1tkcp3\" data-run-elapsed=\"\"> </span>"), xo = /* @__PURE__ */ q("<span class=\"pc-run-pixel svelte-1tkcp3\" data-run-pixel=\"\"></span>"), So = /* @__PURE__ */ q("<button class=\"pc-run-meter svelte-1tkcp3\"><span class=\"pc-run-meter-label svelte-1tkcp3\"> </span> <!> <span class=\"pc-run-meter-pixels svelte-1tkcp3\" aria-hidden=\"true\"></span></button>");
function Co(e, t) {
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
	var o = kr(), s = ln(o), c = (e) => {
		var r = So(), o = z(r), s = z(o, !0);
		P(o);
		var c = B(o, 2), l = (e) => {
			var n = bo(), r = z(n);
			P(n), V((e) => Y(r, `${e ?? ""}s`), [() => (t.view.elapsedMs / 1e3).toFixed(1)]), J(e, n);
		}, u = /* @__PURE__ */ F(() => t.view.elapsedMs !== null && Number.isFinite(t.view.elapsedMs) && t.view.elapsedMs >= 0);
		X(c, (e) => {
			W(u) && e(l);
		});
		var d = B(c, 2);
		Z(d, 21, () => W(i), (e) => e.key, (e, t) => {
			var n = xo();
			V(() => {
				$(n, "data-status", W(t).status), $(n, "title", W(t).title);
			}), J(e, n);
		}), P(d), P(r), V((e) => {
			$(r, "aria-label", W(a)), $(r, "title", W(a)), r.disabled = !t.open, Y(s, e);
		}, [() => n(t.view.status)]), K("click", r, () => t.open?.()), J(e, r);
	};
	X(s, (e) => {
		t.view && e(c);
	}), J(e, o), Ve();
}
vr(["click"]);
//#endregion
//#region ui/PortalManager.svelte
var wo = /* @__PURE__ */ q("<button type=\"button\" class=\"svelte-mnv790\">Close</button>"), To = /* @__PURE__ */ q("<option class=\"svelte-mnv790\"> </option>"), Eo = /* @__PURE__ */ q("<label class=\"svelte-mnv790\">Portal name<input aria-label=\"Portal name\" class=\"svelte-mnv790\"/></label> <p class=\"pc-note svelte-mnv790\"> </p> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-rename=\"\" class=\"svelte-mnv790\">Rename</button></div>", 1), Do = /* @__PURE__ */ q("<p class=\"pc-note svelte-mnv790\">Select a portal or create one from an output.</p>"), Oo = /* @__PURE__ */ q("<button type=\"button\" data-portal-jump-source=\"\" class=\"svelte-mnv790\">Jump to source</button>"), ko = /* @__PURE__ */ q("<label class=\"pc-check svelte-mnv790\"><input type=\"checkbox\" aria-label=\"Replace existing connection\" class=\"svelte-mnv790\"/>Replace existing connection</label>"), Ao = /* @__PURE__ */ q("<button type=\"button\" data-portal-jump-consumer=\"\" class=\"svelte-mnv790\">Jump</button>"), jo = /* @__PURE__ */ q("<div class=\"pc-consumer svelte-mnv790\"><span class=\"svelte-mnv790\"> </span><div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-restore=\"\" class=\"svelte-mnv790\">Restore wire</button> <!></div></div>"), Mo = /* @__PURE__ */ q("<p class=\"pc-note svelte-mnv790\">No consumers.</p>"), No = /* @__PURE__ */ q("<label class=\"svelte-mnv790\">Existing consumers<select aria-label=\"Existing consumers\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Choose before deleting…</option><option class=\"svelte-mnv790\">Restore visible wires</option><option class=\"svelte-mnv790\">Disconnect consumers</option></select></label>"), Po = /* @__PURE__ */ q("<details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Consumers</summary> <label class=\"svelte-mnv790\">Compatible receiver<select aria-label=\"Compatible receiver\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select input…</option><!></select></label> <!> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-connect=\"\" class=\"svelte-mnv790\">Connect receiver</button></div> <!> <!> <!> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-delete=\"\" class=\"svelte-mnv790\">Delete portal</button></div></details>"), Fo = /* @__PURE__ */ q("<details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Convert to portal</summary><p class=\"pc-note svelte-mnv790\"> </p><div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-convert=\"\" class=\"svelte-mnv790\"> </button></div></details>"), Io = /* @__PURE__ */ q("<p class=\"pc-error svelte-mnv790\"> </p>"), Lo = /* @__PURE__ */ q("<p class=\"pc-error svelte-mnv790\" role=\"alert\"> </p>"), Ro = /* @__PURE__ */ q("<p class=\"pc-note svelte-mnv790\" role=\"status\">Preparing change…</p>"), zo = /* @__PURE__ */ q("<p class=\"pc-note svelte-mnv790\"> </p> <label class=\"svelte-mnv790\">Portal<select aria-label=\"Selected portal\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select portal…</option><!></select></label> <!> <details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Source</summary> <label class=\"svelte-mnv790\">Output<select aria-label=\"Portal source\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select output…</option><!></select></label> <label class=\"svelte-mnv790\">New portal name<input aria-label=\"New portal name\" class=\"svelte-mnv790\"/></label> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-create=\"\" class=\"svelte-mnv790\">Create portal</button> <button type=\"button\" data-portal-retarget=\"\" class=\"svelte-mnv790\">Retarget</button> <!></div></details> <!> <!> <!> <!> <!>", 1), Bo = /* @__PURE__ */ q("<p class=\"pc-note svelte-mnv790\">Open a graph to manage its portals.</p>"), Vo = /* @__PURE__ */ q("<section class=\"pc-manager svelte-mnv790\" aria-label=\"Manage portals\"><header class=\"svelte-mnv790\"><h2 class=\"svelte-mnv790\">Manage portals</h2><!></header> <!></section>");
function Ho(e, t) {
	Be(t, !0);
	let n = Si(t, "actions", 19, () => ({})), r = /* @__PURE__ */ L(""), i = /* @__PURE__ */ L(""), a = /* @__PURE__ */ L(""), o = /* @__PURE__ */ L(""), s = /* @__PURE__ */ L(""), c = /* @__PURE__ */ L(!1), l = /* @__PURE__ */ L(""), u = /* @__PURE__ */ L(""), d = "", f = 0, p = !0, m = (e) => JSON.stringify(e.kind === "graph" ? [
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
	}), wi(() => {
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
	var E = Vo(), ee = z(E), D = B(z(ee)), O = (e) => {
		var t = wo();
		K("click", t, () => n().close?.()), J(e, t);
	};
	X(D, (e) => {
		n().close && e(O);
	}), P(ee);
	var te = B(ee, 2), ne = (e) => {
		var d = zo(), f = ln(d), p = z(f);
		P(f);
		var m = B(f, 2), E = B(z(m)), ee = z(E);
		ee.value = ee.__value = "", Z(B(ee), 17, () => t.view.publishers, (e) => e.id, (e, t) => {
			var n = To(), r = z(n);
			P(n);
			var i = {};
			V(() => {
				Y(r, `${W(t).label ?? ""} · ${W(t).kind ?? ""}`), i !== (i = W(t).id) && (n.value = (n.__value = W(t).id) ?? "");
			}), J(e, n);
		}), P(E);
		var D;
		oi(E), P(m);
		var O = B(m, 2), te = (e) => {
			var i = Eo(), a = ln(i), o = B(z(a));
			Q(o), P(a);
			var s = B(a, 2), c = z(s);
			P(s);
			var l = B(s, 2), d = z(l);
			P(l), V(() => {
				fi(o, W(r)), o.disabled = !W(g), Y(c, `${t.view.renameMode === "presentation" ? "Local workspace label · not exported" : "Authored portal label"} · ${W(h).kind ?? ""}`), d.disabled = !W(g) || !!W(u);
			}), K("input", o, (e) => {
				R(r, e.currentTarget.value, !0), w();
			}), K("click", d, () => {
				let e = W(h)?.id, i = t.view?.renameMode, a = W(r);
				e && i && n().rename && T("rename", W(g), (t) => n().rename(t, e, a, i));
			}), J(e, i);
		}, ne = (e) => {
			J(e, Do());
		};
		X(O, (e) => {
			W(h) ? e(te) : e(ne, -1);
		});
		var k = B(O, 2), A = B(z(k), 2), j = B(z(A)), re = z(j);
		re.value = re.__value = "", Z(B(re), 17, () => t.view.sources, (e) => e.key, (e, t) => {
			var n = To(), r = z(n);
			P(n);
			var i = {};
			V(() => {
				Y(r, `${W(t).label ?? ""} · ${W(t).kind ?? ""}`), i !== (i = W(t).key) && (n.value = (n.__value = W(t).key) ?? "");
			}), J(e, n);
		}), P(j);
		var ie;
		oi(j), P(A);
		var ae = B(A, 2), oe = B(z(ae));
		Q(oe), P(ae);
		var se = B(ae, 2), ce = z(se), le = B(ce, 2), ue = B(le, 2), de = (e) => {
			var r = Oo();
			K("click", r, () => {
				t.view && W(h) && n().jumpSource?.(x(t.view), S(W(h).source));
			}), J(e, r);
		};
		X(ue, (e) => {
			W(h) && n().jumpSource && e(de);
		}), P(se), P(k);
		var fe = B(k, 2), pe = (e) => {
			var r = Po(), i = B(z(r), 2), a = B(z(i)), l = z(a);
			l.value = l.__value = "", Z(B(l), 17, () => t.view.receivers, (e) => e.key, (e, t) => {
				var n = To(), r = z(n);
				P(n);
				var i = {};
				V(() => {
					Y(r, `${W(t).label ?? ""}${W(t).occupied ? " · Connected" : ""}`), i !== (i = W(t).key) && (n.value = (n.__value = W(t).key) ?? "");
				}), J(e, n);
			}), P(a);
			var d;
			oi(a), P(i);
			var f = B(i, 2), p = (e) => {
				var t = ko(), n = z(t);
				Q(n), ke(), P(t), V((e) => {
					pi(n, W(c)), n.disabled = e;
				}, [() => !C("connect")]), K("change", n, (e) => {
					R(c, e.currentTarget.checked, !0), w();
				}), J(e, t);
			};
			X(f, (e) => {
				W(v)?.occupied && e(p);
			});
			var m = B(f, 2), g = z(m);
			P(m);
			var _ = B(m, 2);
			Z(_, 17, () => t.view.consumers, (e) => e.edgeId, (e, r) => {
				var i = jo(), a = z(i), o = z(a, !0);
				P(a);
				var s = B(a), c = z(s), l = B(c, 2), d = (e) => {
					var i = Ao();
					K("click", i, () => {
						let e = t.view?.consumers.find((e) => e.edgeId === W(r).edgeId);
						t.view && e && n().jumpConsumer?.(x(t.view), e.edgeId, S(e.to));
					}), J(e, i);
				};
				X(l, (e) => {
					n().jumpConsumer && e(d);
				}), P(s), P(i), V((e) => {
					Y(o, W(r).label), c.disabled = e;
				}, [() => !C("restore") || !n().restoreWire || !!W(u)]), K("click", c, () => {
					let e = t.view?.consumers.find((e) => e.edgeId === W(r).edgeId);
					e && n().restoreWire && T("restore", C("restore"), (t) => n().restoreWire(t, e.edgeId));
				}), J(e, i);
			});
			var E = B(_, 2), ee = (e) => {
				J(e, Mo());
			};
			X(E, (e) => {
				t.view.consumers.length || e(ee);
			});
			var D = B(E, 2), O = (e) => {
				var t = No(), n = B(z(t)), r = z(n);
				r.value = r.__value = "";
				var i = B(r);
				i.value = i.__value = "restore";
				var a = B(i);
				a.value = a.__value = "disconnect", P(n);
				var o;
				oi(n), P(t), V((e) => {
					n.disabled = e, o !== (o = W(s)) && (n.value = (n.__value = W(s)) ?? "", ai(n, W(s)));
				}, [() => !C("remove")]), K("change", n, (e) => {
					R(s, e.currentTarget.value, !0), w();
				}), J(e, t);
			};
			X(D, (e) => {
				t.view.consumers.length && e(O);
			});
			var te = B(D, 2), ne = z(te);
			P(te), P(r), V((e) => {
				a.disabled = e, d !== (d = W(o)) && (a.value = (a.__value = W(o)) ?? "", ai(a, W(o))), g.disabled = !W(y) || !!W(u), ne.disabled = !W(b) || !!W(u);
			}, [() => !C("connect") || !n().connect]), K("change", a, (e) => {
				R(o, e.currentTarget.value, !0), R(c, !1), w();
			}), K("click", g, () => {
				let e = W(v), t = W(h)?.id, r = W(c);
				e && t && n().connect && T("connect", W(y), (i) => n().connect(i, t, S(e), r));
			}), K("click", ne, () => {
				let e = W(h)?.id, r = t.view?.consumers.length ? W(s) : "restore";
				e && (r === "restore" || r === "disconnect") && n().deletePublisher && T("remove", W(b), (t) => n().deletePublisher(t, e, r));
			}), J(e, r);
		};
		X(fe, (e) => {
			W(h) && e(pe);
		});
		var me = B(fe, 2), he = (e) => {
			var r = Fo(), i = B(z(r)), a = z(i, !0);
			P(i);
			var o = B(i), s = z(o), c = z(s);
			P(s), P(o), P(r), V((e) => {
				Y(a, t.view.conversion.label), s.disabled = e, Y(c, `Convert ${t.view.conversion.kind === "wire" ? "wire" : "output"}`);
			}, [() => !C("convert") || !!W(u) || (t.view.conversion.kind === "wire" ? !n().convertWire : !n().convertOutput)]), K("click", s, () => {
				let e = t.view?.conversion;
				e?.kind === "wire" && n().convertWire ? T("convert", C("convert"), (t) => n().convertWire(t, e.edgeId)) : e?.kind === "output" && n().convertOutput && T("convert", C("convert"), (t) => n().convertOutput(t, S(e.endpoint)));
			}), J(e, r);
		};
		X(me, (e) => {
			t.view.conversion && e(he);
		});
		var ge = B(me, 2), _e = (e) => {
			var n = Io(), r = z(n, !0);
			P(n), V(() => Y(r, t.view.issue)), J(e, n);
		};
		X(ge, (e) => {
			t.view.issue && e(_e);
		});
		var ve = B(ge, 2), ye = (e) => {
			var t = Lo(), n = z(t, !0);
			P(t), V(() => Y(n, W(l))), J(e, t);
		};
		X(ve, (e) => {
			W(l) && e(ye);
		});
		var be = B(ve, 2), xe = (e) => {
			J(e, Ro());
		};
		X(be, (e) => {
			W(u) && e(xe);
		}), V((e, r, o, s) => {
			Y(p, `${t.view.scopeLabel ?? ""}${t.view.readOnly ? " · Read-only graph" : ""}`), E.disabled = !n().selectPortal, D !== (D = t.view.selectedPortalId ?? "") && (E.value = (E.__value = t.view.selectedPortalId ?? "") ?? "", ai(E, t.view.selectedPortalId ?? "")), j.disabled = e, ie !== (ie = W(a)) && (j.value = (j.__value = W(a)) ?? "", ai(j, W(a))), fi(oe, W(i)), oe.disabled = r, ce.disabled = o, le.disabled = s;
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
	}, k = (e) => {
		J(e, Bo());
	};
	X(te, (e) => {
		t.view ? e(ne) : e(k, -1);
	}), P(E), J(e, E), Ve();
}
vr([
	"click",
	"change",
	"input"
]);
//#endregion
//#region ui/SubgraphManager.svelte
var Uo = /* @__PURE__ */ q("<button type=\"button\" class=\"svelte-xi74w\">Close</button>"), Wo = /* @__PURE__ */ q("<p class=\"pc-note svelte-xi74w\">Your library is empty. Save subgraphs here to reuse them in other graphs.</p><p class=\"pc-note svelte-xi74w\">To create a subgraph, select nodes on the canvas, right-click the selection, and choose Create Subgraph. Open its graph to edit the input and output blocks.</p>", 1), Go = /* @__PURE__ */ q("<option class=\"svelte-xi74w\"> </option>"), Ko = /* @__PURE__ */ q("<p class=\"pc-note svelte-xi74w\"> </p> <label class=\"svelte-xi74w\">Definition name<input aria-label=\"Definition name\" class=\"svelte-xi74w\"/></label> <div class=\"pc-actions svelte-xi74w\"><button type=\"button\" data-subgraph-open-library=\"\" class=\"svelte-xi74w\">Open definition</button> <button type=\"button\" data-subgraph-rename=\"\" class=\"svelte-xi74w\">Save name as revision</button> <button type=\"button\" data-subgraph-duplicate=\"\" class=\"svelte-xi74w\">Duplicate</button> <button type=\"button\" data-subgraph-export=\"\" class=\"svelte-xi74w\">Export .json</button> <button type=\"button\" data-subgraph-remove=\"\" class=\"svelte-xi74w\">Remove revision</button></div> <label class=\"svelte-xi74w\">Insert into<select aria-label=\"Insert destination\" class=\"svelte-xi74w\"><option class=\"svelte-xi74w\">Choose editable graph…</option><!></select></label> <div class=\"pc-actions svelte-xi74w\"><button type=\"button\" data-subgraph-insert=\"\" class=\"svelte-xi74w\"> </button></div>", 1), qo = /* @__PURE__ */ q("<p class=\"pc-note svelte-xi74w\"> </p>"), Jo = /* @__PURE__ */ q("<div class=\"pc-row svelte-xi74w\"><p class=\"pc-note svelte-xi74w\"> </p><div class=\"pc-port-fields svelte-xi74w\"><label class=\"svelte-xi74w\">Label<input class=\"svelte-xi74w\"/></label> <label class=\"svelte-xi74w\">Kind<select class=\"svelte-xi74w\"></select></label></div><label class=\"pc-check svelte-xi74w\"><input type=\"checkbox\" class=\"svelte-xi74w\"/>Required</label> <div class=\"pc-actions svelte-xi74w\"><button type=\"button\" data-save-interface=\"\" class=\"svelte-xi74w\">Save port</button><button type=\"button\" data-remove-interface=\"\" class=\"svelte-xi74w\">Remove port</button></div></div>"), Yo = /* @__PURE__ */ q("<div class=\"pc-port-fields svelte-xi74w\"><label class=\"svelte-xi74w\">New port<input aria-label=\"New interface label\" class=\"svelte-xi74w\"/></label><label class=\"svelte-xi74w\">Direction<select aria-label=\"New interface direction\" class=\"svelte-xi74w\"><option class=\"svelte-xi74w\">Input</option><option class=\"svelte-xi74w\">Output</option></select></label></div> <label class=\"svelte-xi74w\">Kind<select aria-label=\"New interface kind\" class=\"svelte-xi74w\"></select></label> <label class=\"pc-check svelte-xi74w\"><input type=\"checkbox\" aria-label=\"New interface required\" class=\"svelte-xi74w\"/>Required</label> <div class=\"pc-actions svelte-xi74w\"><button type=\"button\" data-add-interface=\"\" class=\"svelte-xi74w\">Add boundary</button></div>", 1), Xo = /* @__PURE__ */ q("<div class=\"pc-row svelte-xi74w\"><label class=\"svelte-xi74w\">Label<input class=\"svelte-xi74w\"/></label><p class=\"pc-note svelte-xi74w\"> </p> <div class=\"pc-actions svelte-xi74w\"><button type=\"button\" data-save-parameter=\"\" class=\"svelte-xi74w\">Save parameter</button><button type=\"button\" data-remove-parameter=\"\" class=\"svelte-xi74w\">Remove parameter</button></div></div>"), Zo = /* @__PURE__ */ q("<label class=\"svelte-xi74w\">New parameter<input aria-label=\"New parameter label\" class=\"svelte-xi74w\"/></label> <label class=\"svelte-xi74w\">Target<select aria-label=\"Exposed parameter target\" class=\"svelte-xi74w\"><option class=\"svelte-xi74w\">Select eligible control…</option><!></select></label> <div class=\"pc-actions svelte-xi74w\"><button type=\"button\" data-add-parameter=\"\" class=\"svelte-xi74w\">Expose parameter</button></div>", 1), Qo = /* @__PURE__ */ q("<details open=\"\" class=\"svelte-xi74w\"><summary class=\"svelte-xi74w\">Interface</summary> <p class=\"pc-note svelte-xi74w\"> </p> <!> <!> <!> <p class=\"pc-note svelte-xi74w\">Ports keep stable IDs. Connected incompatible edits must be resolved before saving.</p></details> <details open=\"\" class=\"svelte-xi74w\"><summary class=\"svelte-xi74w\">Exposed parameters</summary> <!> <!> <!></details>", 1), $o = /* @__PURE__ */ q("<label class=\"svelte-xi74w\">Revision target<select aria-label=\"Shelf revision target\" class=\"svelte-xi74w\"><option class=\"svelte-xi74w\">Select exact shelf revision…</option><!></select></label>"), es = /* @__PURE__ */ q("<input type=\"checkbox\" class=\"svelte-xi74w\"/>"), ts = /* @__PURE__ */ q("<textarea class=\"svelte-xi74w\"></textarea>"), ns = /* @__PURE__ */ q("<select class=\"svelte-xi74w\"></select>"), rs = /* @__PURE__ */ q("<input class=\"svelte-xi74w\"/>"), is = /* @__PURE__ */ q("<div class=\"pc-row svelte-xi74w\"><label class=\"svelte-xi74w\"> <!></label><p class=\"pc-note svelte-xi74w\"> </p> <div class=\"pc-actions svelte-xi74w\"><button type=\"button\" class=\"svelte-xi74w\">Save override</button><button type=\"button\" class=\"svelte-xi74w\">Use definition value</button></div></div>"), as = /* @__PURE__ */ q("<details open=\"\" class=\"svelte-xi74w\"><summary class=\"svelte-xi74w\">Parameter overrides</summary> <!></details>"), os = /* @__PURE__ */ q("<select class=\"svelte-xi74w\"><option class=\"svelte-xi74w\">Select connection…</option><!></select>"), ss = /* @__PURE__ */ q("<label class=\"svelte-xi74w\">Saved connection<!></label>"), cs = /* @__PURE__ */ q("<label class=\"svelte-xi74w\">Saved model<input class=\"svelte-xi74w\"/></label>"), ls = /* @__PURE__ */ q("<p class=\"pc-error svelte-xi74w\"> </p>"), us = /* @__PURE__ */ q("<div class=\"pc-row svelte-xi74w\"><p class=\"svelte-xi74w\"> </p> <label class=\"svelte-xi74w\">Connection mode<select class=\"svelte-xi74w\"></select></label> <!> <label class=\"svelte-xi74w\">Model mode<select class=\"svelte-xi74w\"></select></label> <!> <p class=\"pc-note svelte-xi74w\"> </p><!></div>"), ds = /* @__PURE__ */ q("<details open=\"\" data-instance-model=\"\" class=\"svelte-xi74w\"><summary class=\"svelte-xi74w\">Model bindings</summary> <!></details>"), fs = /* @__PURE__ */ q("<option class=\"svelte-xi74w\">Drop override</option>"), ps = /* @__PURE__ */ q("<label class=\"svelte-xi74w\"> <select class=\"svelte-xi74w\"><!><!></select></label>"), ms = /* @__PURE__ */ q("<p class=\"pc-note svelte-xi74w\">No mappings.</p>"), hs = /* @__PURE__ */ q("<details open=\"\" class=\"svelte-xi74w\"><summary class=\"svelte-xi74w\"> </summary><!><!></details>"), gs = /* @__PURE__ */ q("<p class=\"pc-note svelte-xi74w\">Mappings changed. Prepare the update before accepting.</p>"), _s = /* @__PURE__ */ q("<details open=\"\" class=\"svelte-xi74w\"><summary class=\"svelte-xi74w\">Update instance</summary> <label class=\"svelte-xi74w\">Target revision<select aria-label=\"Instance update revision\" class=\"svelte-xi74w\"><option class=\"svelte-xi74w\">Choose exact revision…</option><!></select></label> <!> <!> <!> <div class=\"pc-actions svelte-xi74w\"><button type=\"button\" data-prepare-instance-update=\"\" class=\"svelte-xi74w\">Prepare update</button><button type=\"button\" data-accept-instance-update=\"\" class=\"svelte-xi74w\">Accept prepared update</button></div></details>"), vs = /* @__PURE__ */ q("<details open=\"\" class=\"svelte-xi74w\"><summary class=\"svelte-xi74w\">Instance</summary><p class=\"pc-note svelte-xi74w\"> </p><div class=\"pc-actions svelte-xi74w\"><button type=\"button\" class=\"svelte-xi74w\">Open graph</button> <button type=\"button\" data-subgraph-local-copy=\"\" class=\"svelte-xi74w\">Make local copy</button> <button type=\"button\" data-subgraph-unpack=\"\" class=\"svelte-xi74w\">Unpack</button></div> <label class=\"svelte-xi74w\">Saved definition name<input aria-label=\"Saved definition name\" class=\"svelte-xi74w\"/></label> <label class=\"svelte-xi74w\">Save to shelf<select aria-label=\"Shelf save mode\" class=\"svelte-xi74w\"><option class=\"svelte-xi74w\">New entry with private identity</option><option class=\"svelte-xi74w\">Revision of selected entry</option></select></label> <!> <div class=\"pc-actions svelte-xi74w\"><button type=\"button\" data-subgraph-save-shelf=\"\" class=\"svelte-xi74w\">Save definition to shelf</button></div> <p class=\"pc-note svelte-xi74w\">Instance overrides remain on the wrapper. Saving does not bake them into the definition.</p></details> <!> <!> <!>", 1), ys = /* @__PURE__ */ q("<details open=\"\" class=\"svelte-xi74w\"><summary class=\"svelte-xi74w\">Create subgraph</summary><p class=\"pc-note svelte-xi74w\"> </p><label class=\"svelte-xi74w\">Name<input aria-label=\"Selection subgraph name\" class=\"svelte-xi74w\"/></label><div class=\"pc-actions svelte-xi74w\"><button type=\"button\" data-subgraph-convert-selection=\"\" class=\"svelte-xi74w\">Convert selection</button></div></details>"), bs = /* @__PURE__ */ q("<p class=\"pc-error svelte-xi74w\" role=\"alert\"> </p>"), xs = /* @__PURE__ */ q("<p class=\"pc-note svelte-xi74w\" role=\"status\">Preparing change…</p>"), Ss = /* @__PURE__ */ q("<p class=\"pc-note svelte-xi74w\"> </p> <details open=\"\" class=\"svelte-xi74w\"><summary class=\"svelte-xi74w\">Library</summary> <!> <label class=\"svelte-xi74w\">Revision<select aria-label=\"Library revision\" class=\"svelte-xi74w\"><option class=\"svelte-xi74w\">Select revision…</option><!></select></label> <!> <div class=\"pc-actions svelte-xi74w\"><button type=\"button\" data-subgraph-import=\"\" class=\"svelte-xi74w\">Import .json</button></div> <p class=\"pc-note svelte-xi74w\">Shelf revisions are immutable. Removing one keeps placed instances intact.</p></details> <!> <!> <!> <!> <!> <!>", 1), Cs = /* @__PURE__ */ q("<p class=\"pc-note svelte-xi74w\">Open a graph to manage subgraphs.</p>"), ws = /* @__PURE__ */ q("<section class=\"pc-manager svelte-xi74w\" aria-label=\"Manage subgraphs\"><header class=\"svelte-xi74w\"><h2 class=\"svelte-xi74w\">Manage subgraphs</h2><!></header> <!></section>");
function Ts(e, t) {
	Be(t, !0);
	let n = Si(t, "actions", 19, () => ({})), r = /* @__PURE__ */ L(""), i = /* @__PURE__ */ L(""), a = /* @__PURE__ */ L(""), o = /* @__PURE__ */ L(Zt({})), s = /* @__PURE__ */ L(Zt({})), c = /* @__PURE__ */ L(Zt({})), l = [
		"portMap",
		"parameterMap",
		"roleMap",
		"nodeBindingMap"
	], u = {
		portMap: "Ports",
		parameterMap: "Parameters",
		roleMap: "Model roles",
		nodeBindingMap: "Node bindings"
	}, d = /* @__PURE__ */ L({
		portMap: {},
		parameterMap: {},
		roleMap: {},
		nodeBindingMap: {}
	}), f = /* @__PURE__ */ L(""), p = /* @__PURE__ */ L(""), m = /* @__PURE__ */ L("input"), h = /* @__PURE__ */ L(!0), g = /* @__PURE__ */ L(""), _ = /* @__PURE__ */ L(""), v = /* @__PURE__ */ L("new"), y = /* @__PURE__ */ L(""), b = /* @__PURE__ */ L(""), x = "", S = 0, C = !0, w = (e) => e ? JSON.stringify([
		e.id,
		e.version,
		e.semanticHash
	]) : "", T = (e) => JSON.stringify(e.kind === "graph" ? [
		"graph",
		e.workflowId,
		e.instancePath,
		w(e.definitionRef)
	] : ["library", w(e.definitionRef)]), E = /* @__PURE__ */ F(() => t.view?.entries.find((e) => w(e.ref) === w(t.view.selectedRef))), ee = /* @__PURE__ */ F(() => t.view?.destinations.find((e) => e.key === t.view.selectedDestinationKey)), D = /* @__PURE__ */ F(() => !!t.view && t.view.permissions.bodyEdit && t.view.scope.kind === "graph" && (!t.view.instance || t.view.instance.owned)), O = /* @__PURE__ */ F(() => t.view?.update?.choices.find((e) => e.key === t.view.update?.selectedKey)), te = /* @__PURE__ */ F(() => JSON.stringify(W(d)) !== JSON.stringify(re(t.view?.update ?? null)));
	yn(() => {
		let e = t.view ? JSON.stringify([
			t.view.managerKey,
			t.view.revision,
			t.view.libraryRevision,
			T(t.view.scope),
			w(t.view.selectedRef),
			w(t.view.definition?.ref),
			t.view.instance?.address,
			w(t.view.instance?.ref),
			t.view.update?.selectedKey
		]) : "";
		e !== x && (x = e, R(r, W(E)?.name ?? t.view?.definition?.name ?? "", !0), R(i, ""), R(a, ""), S++, R(o, Object.fromEntries((t.view?.definition?.interface ?? []).map((e) => [e.id, {
			label: e.label,
			artifactKind: e.kind,
			required: e.required
		}])), !0), R(s, Object.fromEntries((t.view?.definition?.parameters ?? []).map((e) => [e.id, e.label])), !0), R(c, Object.fromEntries((t.view?.instance?.parameters ?? []).map((e) => [e.id, oe(e.control)])), !0), R(d, re(t.view?.update ?? null)), R(f, ""), R(p, t.view?.definition?.kinds[0] ?? "", !0), R(m, "input"), R(h, !0), R(g, ""), R(_, ""), R(v, "new"), R(y, ""), R(b, ""));
	}), wi(() => {
		C = !1, S++;
	});
	let ne = (e) => ({
		managerKey: e.managerKey,
		revision: e.revision,
		libraryRevision: e.libraryRevision,
		scope: Ie(e.scope)
	}), k = (e) => ({
		id: e.id,
		version: e.version,
		semanticHash: e.semanticHash
	});
	function A(e, n) {
		return !!t.view && t.view.capabilities[e] && (!n || t.view.permissions[n]) && (!["bodyEdit", "instanceEdit"].includes(n ?? "") || t.view.scope.kind === "graph") && (!["editInterface", "editParameter"].includes(e) || W(D));
	}
	function j() {
		R(i, ""), R(a, ""), S++;
	}
	function re(e) {
		return {
			portMap: Object.fromEntries((e?.portMap ?? []).map((e) => [e.from, e.to])),
			parameterMap: Object.fromEntries((e?.parameterMap ?? []).map((e) => [e.from, e.to])),
			roleMap: Object.fromEntries((e?.roleMap ?? []).map((e) => [e.from, e.to])),
			nodeBindingMap: Object.fromEntries((e?.nodeBindingMap ?? []).map((e) => [e.from, e.to]))
		};
	}
	function ie(e, n, r) {
		let i = t.view?.update?.[e].find((e) => e.from === n);
		if (!i || !A("prepareUpdate", "instanceEdit")) return;
		let a;
		try {
			a = JSON.parse(r);
		} catch {
			return;
		}
		(a === null ? !i.canDrop : typeof a != "string" || !i.options.some((e) => e.id === a)) || (R(d, {
			...W(d),
			[e]: {
				...W(d)[e],
				[n]: a
			}
		}), j());
	}
	function ae(e) {
		let r = t.view?.instance, i = t.view?.update, a = W(O);
		if (r && i && a) {
			if (e) {
				if (!i.preparedKey || W(te) || !A("acceptUpdate", "instanceEdit") || !n().acceptUpdate) return;
				let e = i.preparedKey;
				he("acceptUpdate", !0, (t) => n().acceptUpdate(t, e, k(r.ref), k(a.ref)));
			} else if (A("prepareUpdate", "instanceEdit") && n().prepareUpdate) {
				let e = structuredClone(W(d));
				he("prepareUpdate", !0, (t) => n().prepareUpdate(t, k(r.ref), k(a.ref), e));
			}
		}
	}
	function oe(e) {
		return e.editor === "boolean" ? e.value === !0 : e.editor === "json" && e.representation === "json-value" ? JSON.stringify(e.value, null, 2) ?? "" : e.editor === "lines" && Array.isArray(e.value) ? e.value.join("\n") : String(e.value ?? "");
	}
	function se(e, t) {
		return W(c)[e] ?? oe(t);
	}
	function ce(e, t) {
		R(c, {
			...W(c),
			[e]: t
		}, !0), j();
	}
	function le(e, r = !1) {
		let a = t.view?.instance?.parameters.find((t) => t.id === e);
		if (!a || !A("editParameterOverride", "instanceEdit") || !n().editParameterOverride) return;
		if (r) {
			he("editParameterOverride", !0, (t) => n().editParameterOverride(t, e, "reset"));
			return;
		}
		let o = a.control, s = se(e, o), c = s;
		if (o.editor === "json") {
			let e = String(s);
			try {
				if (o.representation === "json-text" && o.allowEmpty && !e.trim()) c = e;
				else {
					let t = JSON.parse(e);
					c = o.representation === "json-text" ? e : t;
				}
			} catch {
				R(i, "Enter valid JSON before saving.");
				return;
			}
		} else if (o.editor === "number") {
			if (c = Number(s), !String(s).trim() || !Number.isFinite(c)) {
				R(i, "Enter a finite number before saving.");
				return;
			}
		} else if (o.editor === "lines") c = String(s).split(/\r?\n/);
		else if (o.editor === "enum" && !o.options?.some((e) => e.value === c)) {
			R(i, "Choose an available value before saving.");
			return;
		}
		he("editParameterOverride", !0, (t) => n().editParameterOverride(t, e, "set", c));
	}
	function ue(e, r, i, a, o = !1) {
		let s = t.view?.instance?.bindings.find((t) => t.key === e), c = r === "profileId" ? s?.profile : s?.model;
		if (!s?.editable || !c || !A("editBindingOverride", "instanceEdit") || !n().editBindingOverride || !c.allowedModes.some((e) => e.value === i) || o && c.mode !== "override") return;
		let l = Ie(s.target);
		he("editBindingOverride", !0, (e) => n().editBindingOverride(e, l, r, i, a));
	}
	function de(e) {
		return W(o)[e.id] ?? {
			label: e.label,
			artifactKind: e.kind,
			required: e.required
		};
	}
	function fe(e, t, n) {
		R(o, {
			...W(o),
			[e.id]: {
				...de(e),
				[t]: n
			}
		}, !0), j();
	}
	function pe(e) {
		t.view?.definition && A("editInterface", "bodyEdit") && n().editInterface && (e.kind === "add" || t.view.definition.interface.some((t) => t.id === e.id)) && (e.kind === "remove" || t.view.definition.kinds.includes(e.artifactKind)) && he("editInterface", !0, (t) => n().editInterface(t, Ie(e)));
	}
	function me(e) {
		t.view?.definition && A("editParameter", "bodyEdit") && n().editParameter && (e.kind === "add" || t.view.definition.parameters.some((t) => t.id === e.id)) && (e.kind !== "add" || t.view.definition.eligibleTargets.some((t) => JSON.stringify(t.target) === JSON.stringify(e.target))) && he("editParameter", !0, (t) => n().editParameter(t, Ie(e)));
	}
	async function he(e, n, r) {
		if (!t.view || !n || W(a)) return;
		let o = ne(t.view), s = ++S, c = w(t.view.selectedRef);
		R(a, e, !0), R(i, "");
		let l = () => C && s === S && t.view?.managerKey === o.managerKey && t.view.revision === o.revision && t.view.libraryRevision === o.libraryRevision && T(t.view.scope) === T(o.scope) && w(t.view.selectedRef) === c;
		try {
			let e = await r(o);
			l() && (R(a, ""), R(i, e.ok ? "" : e.error.code + ": " + e.error.message, !0));
		} catch (e) {
			l() && (R(a, ""), R(i, e instanceof Error ? e.message : "The subgraph change could not be accepted.", !0));
		}
	}
	var ge = ws(), _e = z(ge), ve = B(z(_e)), ye = (e) => {
		var t = Uo();
		K("click", t, () => n().close?.()), J(e, t);
	};
	X(ve, (e) => {
		n().close && e(ye);
	}), P(_e);
	var be = B(_e, 2), xe = (e) => {
		var o = Ss(), c = ln(o), x = z(c, !0);
		P(c);
		var S = B(c, 2), C = B(z(S), 2), w = (e) => {
			var t = Wo();
			ke(), J(e, t);
		};
		X(C, (e) => {
			t.view.entries.length || e(w);
		});
		var T = B(C, 2), re = B(z(T)), oe = z(re);
		oe.value = oe.__value = "", Z(B(oe), 17, () => t.view.entries, (e) => e.key, (e, t) => {
			var n = Go(), r = z(n);
			P(n);
			var i = {};
			V(() => {
				Y(r, `${W(t).name ?? ""} · v${W(t).ref.version ?? ""} · ${W(t).phase ?? ""}`), i !== (i = W(t).key) && (n.value = (n.__value = W(t).key) ?? "");
			}), J(e, n);
		}), P(re);
		var ge;
		oi(re), P(T);
		var _e = B(T, 2), ve = (e) => {
			var i = Ko(), o = ln(i), s = z(o);
			P(o);
			var c = B(o, 2), l = B(z(c));
			Q(l), P(c);
			var u = B(c, 2), d = z(u), f = B(d, 2), p = B(f, 2), m = B(p, 2), h = B(m, 2);
			P(u);
			var g = B(u, 2), _ = B(z(g)), v = z(_);
			v.value = v.__value = "", Z(B(v), 17, () => t.view.destinations, (e) => e.key, (e, t) => {
				var n = Go(), r = z(n, !0);
				P(n);
				var i = {};
				V(() => {
					Y(r, W(t).label), i !== (i = W(t).key) && (n.value = (n.__value = W(t).key) ?? "");
				}), J(e, n);
			}), P(_);
			var y;
			oi(_), P(g);
			var b = B(g, 2), x = z(b), S = z(x);
			P(x), P(b), V((e, i, a, o, c) => {
				Y(s, `Version ${W(E).ref.version ?? ""} · ${W(E).nodeCount ?? ""} nodes · ${W(E).wireCount ?? ""} wires`), fi(l, W(r)), l.disabled = !t.view.permissions.libraryWrite, d.disabled = !n().openLibrary, f.disabled = e, p.disabled = i, m.disabled = a, h.disabled = o, _.disabled = !n().selectDestination, y !== (y = W(ee)?.key ?? "") && (_.value = (_.__value = W(ee)?.key ?? "") ?? "", ai(_, W(ee)?.key ?? "")), x.disabled = c, Y(S, `Insert into ${W(ee)?.label ?? "graph" ?? ""}`);
			}, [
				() => !A("renameRevision", "libraryWrite") || !n().renameRevision || !W(r).trim() || !!W(a),
				() => !A("duplicate", "libraryWrite") || !n().duplicate || !W(r).trim() || !!W(a),
				() => !A("exportJSON") || !n().exportJSON || !!W(a),
				() => !A("removeRevision", "libraryWrite") || !n().removeRevision || !!W(a),
				() => !A("insert", "insert") || !n().insert || !W(ee) || !!W(a)
			]), K("input", l, (e) => {
				R(r, e.currentTarget.value, !0), j();
			}), K("click", d, () => {
				t.view && W(E) && n().openLibrary?.(ne(t.view), k(W(E).ref));
			}), K("click", f, () => {
				let e = W(E), t = W(r);
				e && t.trim() && n().renameRevision && he("renameRevision", A("renameRevision", "libraryWrite"), (r) => n().renameRevision(r, k(e.ref), t));
			}), K("click", p, () => {
				let e = W(E), t = W(r);
				e && t.trim() && n().duplicate && he("duplicate", A("duplicate", "libraryWrite"), (r) => n().duplicate(r, k(e.ref), t));
			}), K("click", m, () => {
				let e = W(E);
				e && n().exportJSON && he("exportJSON", A("exportJSON"), (t) => n().exportJSON(t, k(e.ref)));
			}), K("click", h, () => {
				let e = W(E);
				e && n().removeRevision && he("removeRevision", A("removeRevision", "libraryWrite"), (t) => n().removeRevision(t, k(e.ref)));
			}), K("change", _, (e) => {
				let r = e.currentTarget.value;
				e.currentTarget.selectedIndex >= 0 && t.view && n().selectDestination && (!r || t.view.destinations.some((e) => e.key === r)) && n().selectDestination(ne(t.view), r || null);
			}), K("click", x, () => {
				let e = W(E), t = W(ee);
				e && t && n().insert && he("insert", A("insert", "insert"), (r) => n().insert(r, k(e.ref), t.key));
			}), J(e, i);
		};
		X(_e, (e) => {
			W(E) && e(ve);
		});
		var ye = B(_e, 2), be = z(ye);
		P(ye), ke(2), P(S);
		var xe = B(S, 2), Se = (e) => {
			var r = Qo(), i = ln(r), o = B(z(i), 2), c = z(o);
			P(o);
			var l = B(o, 2), u = (e) => {
				var n = qo(), r = z(n, !0);
				P(n), V(() => Y(r, t.view.definition.description)), J(e, n);
			};
			X(l, (e) => {
				t.view.definition.description && e(u);
			});
			var d = B(l, 2);
			Z(d, 17, () => t.view.definition.interface, (e) => e.id, (e, r) => {
				var i = Jo(), o = z(i), s = z(o);
				P(o);
				var c = B(o), l = z(c), u = B(z(l));
				Q(u), P(l);
				var d = B(l, 2), f = B(z(d));
				Z(f, 21, () => t.view.definition.kinds, zr, (e, t) => {
					var n = Go(), r = z(n, !0);
					P(n);
					var i = {};
					V(() => {
						Y(r, W(t)), i !== (i = W(t)) && (n.value = (n.__value = W(t)) ?? "");
					}), J(e, n);
				}), P(f);
				var p;
				oi(f), P(d), P(c);
				var m = B(c), h = z(m);
				Q(h), ke(), P(m);
				var g = B(m, 2), _ = z(g), v = B(_);
				P(g), P(i), V((e, t, n, i, a, o, c, l) => {
					Y(s, `${W(r).direction ?? ""} · ${W(r).id ?? ""} · Boundary ${W(r).boundaryNodeId ?? ""}`), $(u, "aria-label", "Interface label " + W(r).id), fi(u, e), u.disabled = t, $(f, "aria-label", "Interface kind " + W(r).id), f.disabled = n, p !== (p = i) && (f.value = (f.__value = i) ?? "", ai(f, i)), $(h, "aria-label", "Required interface " + W(r).id), pi(h, a), h.disabled = o, _.disabled = c, v.disabled = l;
				}, [
					() => de(W(r)).label,
					() => !A("editInterface", "bodyEdit") || !n().editInterface,
					() => !A("editInterface", "bodyEdit") || !n().editInterface,
					() => de(W(r)).artifactKind,
					() => de(W(r)).required,
					() => !A("editInterface", "bodyEdit") || !n().editInterface,
					() => !A("editInterface", "bodyEdit") || !n().editInterface || !!W(a),
					() => !A("editInterface", "bodyEdit") || !n().editInterface || !!W(a)
				]), K("input", u, (e) => fe(W(r), "label", e.currentTarget.value)), K("change", f, (e) => fe(W(r), "artifactKind", e.currentTarget.value)), K("change", h, (e) => fe(W(r), "required", e.currentTarget.checked)), K("click", _, () => pe({
					kind: "update",
					id: W(r).id,
					...de(W(r))
				})), K("click", v, () => pe({
					kind: "remove",
					id: W(r).id
				})), J(e, i);
			});
			var v = B(d, 2), y = (e) => {
				var r = Yo(), i = ln(r), o = z(i), s = B(z(o));
				Q(s), P(o);
				var c = B(o), l = B(z(c)), u = z(l);
				u.value = u.__value = "input";
				var d = B(u);
				d.value = d.__value = "output", P(l);
				var g;
				oi(l), P(c), P(i);
				var _ = B(i, 2), v = B(z(_));
				Z(v, 21, () => t.view.definition.kinds, zr, (e, t) => {
					var n = Go(), r = z(n, !0);
					P(n);
					var i = {};
					V(() => {
						Y(r, W(t)), i !== (i = W(t)) && (n.value = (n.__value = W(t)) ?? "");
					}), J(e, n);
				}), P(v);
				var y;
				oi(v), P(_);
				var b = B(_, 2), x = z(b);
				Q(x), ke(), P(b);
				var S = B(b, 2), C = z(S);
				P(S), V((e) => {
					fi(s, W(f)), g !== (g = W(m)) && (l.value = (l.__value = W(m)) ?? "", ai(l, W(m))), y !== (y = W(p)) && (v.value = (v.__value = W(p)) ?? "", ai(v, W(p))), pi(x, W(h)), C.disabled = e;
				}, [() => !W(f).trim() || !n().editInterface || !!W(a)]), K("input", s, (e) => {
					R(f, e.currentTarget.value, !0), j();
				}), K("change", l, (e) => {
					let t = e.currentTarget.value;
					(t === "input" || t === "output") && R(m, t, !0), j();
				}), K("change", v, (e) => {
					R(p, e.currentTarget.value, !0), j();
				}), K("change", x, (e) => {
					R(h, e.currentTarget.checked, !0), j();
				}), K("click", C, () => {
					W(f).trim() && pe({
						kind: "add",
						label: W(f),
						direction: W(m),
						artifactKind: W(p),
						required: W(h)
					});
				}), J(e, r);
			}, b = /* @__PURE__ */ F(() => A("editInterface", "bodyEdit"));
			X(v, (e) => {
				W(b) && e(y);
			}), ke(2), P(i);
			var x = B(i, 2), S = B(z(x), 2);
			Z(S, 17, () => t.view.definition.parameters, (e) => e.id, (e, t) => {
				var r = Xo(), i = z(r), o = B(z(i));
				Q(o), P(i);
				var c = B(i), l = z(c);
				P(c);
				var u = B(c, 2), d = z(u), f = B(d);
				P(u), P(r), V((e, n, r, i) => {
					$(o, "aria-label", "Parameter label " + W(t).id), fi(o, W(s)[W(t).id] ?? W(t).label), o.disabled = e, Y(l, `${n ?? ""}${W(t).target.instancePath.length ? " / " : ""}${W(t).target.nodeId ?? ""} · ${W(t).target.controlId ?? ""}`), d.disabled = r, f.disabled = i;
				}, [
					() => !A("editParameter", "bodyEdit") || !n().editParameter,
					() => W(t).target.instancePath.join(" / "),
					() => !A("editParameter", "bodyEdit") || !n().editParameter || !!W(a),
					() => !A("editParameter", "bodyEdit") || !n().editParameter || !!W(a)
				]), K("input", o, (e) => {
					R(s, {
						...W(s),
						[W(t).id]: e.currentTarget.value
					}, !0), j();
				}), K("click", d, () => me({
					kind: "update",
					id: W(t).id,
					label: W(s)[W(t).id] ?? W(t).label
				})), K("click", f, () => me({
					kind: "remove",
					id: W(t).id
				})), J(e, r);
			});
			var C = B(S, 2), w = (e) => {
				var r = Zo(), i = ln(r), o = B(z(i));
				Q(o), P(i);
				var s = B(i, 2), c = B(z(s)), l = z(c);
				l.value = l.__value = "", Z(B(l), 17, () => t.view.definition.eligibleTargets, (e) => e.key, (e, t) => {
					var n = Go(), r = z(n, !0);
					P(n);
					var i = {};
					V(() => {
						Y(r, W(t).label), i !== (i = W(t).key) && (n.value = (n.__value = W(t).key) ?? "");
					}), J(e, n);
				}), P(c);
				var u;
				oi(c), P(s);
				var d = B(s, 2), f = z(d);
				P(d), V((e) => {
					fi(o, W(g)), u !== (u = W(_)) && (c.value = (c.__value = W(_)) ?? "", ai(c, W(_))), f.disabled = e;
				}, [() => !W(g).trim() || !t.view.definition.eligibleTargets.some((e) => e.key === W(_)) || !n().editParameter || !!W(a)]), K("input", o, (e) => {
					R(g, e.currentTarget.value, !0), j();
				}), K("change", c, (e) => {
					R(_, e.currentTarget.value, !0), j();
				}), K("click", f, () => {
					let e = t.view?.definition?.eligibleTargets.find((e) => e.key === W(_));
					e && W(g).trim() && me({
						kind: "add",
						label: W(g),
						target: Ie(e.target)
					});
				}), J(e, r);
			}, T = /* @__PURE__ */ F(() => A("editParameter", "bodyEdit"));
			X(C, (e) => {
				W(T) && e(w);
			});
			var E = B(C, 2), ee = (e) => {
				var n = qo(), r = z(n, !0);
				P(n), V(() => Y(r, t.view.definition.exposureNote)), J(e, n);
			};
			X(E, (e) => {
				t.view.definition.exposureNote && e(ee);
			}), P(x), V(() => Y(c, `${t.view.definition.name ?? ""} · ${W(D) ? "Owned local definition" : "Read-only definition"}`)), J(e, r);
		};
		X(xe, (e) => {
			t.view.definition && e(Se);
		});
		var Ce = B(xe, 2), we = (e) => {
			var i = vs(), o = ln(i), s = B(z(o)), c = z(s);
			P(s);
			var f = B(s), p = z(f), m = B(p, 2), h = B(m, 2);
			P(f);
			var g = B(f, 2), _ = B(z(g));
			Q(_), P(g);
			var b = B(g, 2), x = B(z(b)), S = z(x);
			S.value = S.__value = "new";
			var C = B(S);
			C.value = C.__value = "revision", P(x);
			var w;
			oi(x), P(b);
			var T = B(b, 2), E = (e) => {
				var n = $o(), r = B(z(n)), i = z(r);
				i.value = i.__value = "", Z(B(i), 17, () => t.view.entries, (e) => e.key, (e, t) => {
					var n = Go(), r = z(n);
					P(n);
					var i = {};
					V(() => {
						Y(r, `${W(t).name ?? ""} · v${W(t).ref.version ?? ""}`), i !== (i = W(t).key) && (n.value = (n.__value = W(t).key) ?? "");
					}), J(e, n);
				}), P(r);
				var a;
				oi(r), P(n), V((e) => {
					r.disabled = e, a !== (a = W(y)) && (r.value = (r.__value = W(y)) ?? "", ai(r, W(y)));
				}, [() => !A("saveToShelf", "bodyEdit") || !t.view.permissions.libraryWrite]), K("change", r, (e) => {
					R(y, e.currentTarget.value, !0), j();
				}), J(e, n);
			};
			X(T, (e) => {
				W(v) === "revision" && e(E);
			});
			var ee = B(T, 2), D = z(ee);
			P(ee), ke(2), P(o);
			var re = B(o, 2), oe = (e) => {
				var r = as();
				Z(B(z(r), 2), 17, () => t.view.instance.parameters, (e) => e.id, (e, r) => {
					let i = /* @__PURE__ */ F(() => W(r).control);
					var o = is(), s = z(o), c = z(s), l = B(c), u = (e) => {
						var t = es();
						Q(t), V((e, n) => {
							$(t, "aria-label", "Override " + W(r).label), pi(t, e), t.disabled = n;
						}, [() => se(W(r).id, W(i)) === !0, () => !A("editParameterOverride", "instanceEdit") || !n().editParameterOverride]), K("change", t, (e) => ce(W(r).id, e.currentTarget.checked)), J(e, t);
					}, d = (e) => {
						var t = ts();
						nt(t), V((e, n) => {
							$(t, "aria-label", "Override " + W(r).label), fi(t, e), t.disabled = n;
						}, [() => String(se(W(r).id, W(i))), () => !A("editParameterOverride", "instanceEdit") || !n().editParameterOverride]), K("input", t, (e) => ce(W(r).id, e.currentTarget.value)), J(e, t);
					}, f = (e) => {
						var t = ns();
						Z(t, 21, () => W(i).options ?? [], zr, (e, t) => {
							var n = Go(), r = z(n, !0);
							P(n);
							var i = {};
							V(() => {
								Y(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
							}), J(e, n);
						}), P(t);
						var a;
						oi(t), V((e, n) => {
							$(t, "aria-label", "Override " + W(r).label), t.disabled = e, a !== (a = n) && (t.value = (t.__value = n) ?? "", ai(t, n));
						}, [() => !A("editParameterOverride", "instanceEdit") || !n().editParameterOverride, () => String(se(W(r).id, W(i)))]), K("change", t, (e) => ce(W(r).id, e.currentTarget.value)), J(e, t);
					}, p = (e) => {
						var t = rs();
						Q(t), V((e, n) => {
							$(t, "type", W(i).editor === "number" ? "number" : "text"), $(t, "aria-label", "Override " + W(r).label), fi(t, e), $(t, "min", W(i).min), $(t, "max", W(i).max), t.disabled = n;
						}, [() => String(se(W(r).id, W(i))), () => !A("editParameterOverride", "instanceEdit") || !n().editParameterOverride]), K("input", t, (e) => ce(W(r).id, e.currentTarget.value)), J(e, t);
					};
					X(l, (e) => {
						W(i).editor === "boolean" ? e(u) : W(i).editor === "json" || W(i).editor === "lines" ? e(d, 1) : W(i).editor === "enum" ? e(f, 2) : e(p, -1);
					}), P(s);
					var m = B(s), h = z(m);
					P(m);
					var g = B(m, 2), _ = z(g), v = B(_);
					P(g), P(o), V((e, t) => {
						Y(c, `${W(r).label ?? ""} `), Y(h, `${W(r).overridden ? "Saved instance override" : "Inherited definition value"}${W(i).effective ? " · Effective: " + W(i).effective : ""}${W(i).source ? " · " + W(i).source : ""}`), $(_, "data-save-override", W(r).id), _.disabled = e, $(v, "data-reset-override", W(r).id), v.disabled = t;
					}, [() => !A("editParameterOverride", "instanceEdit") || !n().editParameterOverride || !!W(a), () => !A("editParameterOverride", "instanceEdit") || !n().editParameterOverride || !W(r).overridden || !!W(a)]), K("click", _, () => le(W(r).id)), K("click", v, () => {
						t.view?.instance?.parameters.find((e) => e.id === W(r).id)?.overridden && le(W(r).id, !0);
					}), J(e, o);
				}), P(r), J(e, r);
			};
			X(re, (e) => {
				t.view.instance.parameters.length && e(oe);
			});
			var de = B(re, 2), fe = (e) => {
				var r = ds();
				Z(B(z(r), 2), 17, () => t.view.instance.bindings, (e) => e.key, (e, t) => {
					var r = us(), i = z(r), o = z(i, !0);
					P(i);
					var s = B(i, 2), c = B(z(s));
					Z(c, 21, () => W(t).profile.allowedModes, zr, (e, t) => {
						var n = Go(), r = z(n, !0);
						P(n);
						var i = {};
						V(() => {
							Y(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
						}), J(e, n);
					}), P(c);
					var l;
					oi(c), P(s);
					var u = B(s, 2), d = (e) => {
						var r = ss(), i = B(z(r)), o = (e) => {
							var r = os(), i = z(r);
							i.value = i.__value = "", Z(B(i), 17, () => W(t).profile.options, zr, (e, t) => {
								var n = Go(), r = z(n, !0);
								P(n);
								var i = {};
								V(() => {
									Y(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
								}), J(e, n);
							}), P(r);
							var o;
							oi(r), V((e) => {
								$(r, "aria-label", "Connection override " + W(t).key), r.disabled = e, o !== (o = W(t).profile.value ?? "") && (r.value = (r.__value = W(t).profile.value ?? "") ?? "", ai(r, W(t).profile.value ?? ""));
							}, [() => !W(t).editable || !A("editBindingOverride", "instanceEdit") || !n().editBindingOverride || !!W(a)]), K("change", r, (e) => ue(W(t).key, "profileId", "override", e.currentTarget.value, !0)), J(e, r);
						}, s = (e) => {
							var r = rs();
							Q(r), V((e) => {
								$(r, "aria-label", "Connection override " + W(t).key), fi(r, W(t).profile.value ?? ""), r.disabled = e;
							}, [() => !W(t).editable || !A("editBindingOverride", "instanceEdit") || !n().editBindingOverride || !!W(a)]), K("change", r, (e) => ue(W(t).key, "profileId", "override", e.currentTarget.value, !0)), J(e, r);
						};
						X(i, (e) => {
							W(t).profile.options?.length ? e(o) : e(s, -1);
						}), P(r), J(e, r);
					};
					X(u, (e) => {
						W(t).profile.mode === "override" && e(d);
					});
					var f = B(u, 2), p = B(z(f));
					Z(p, 21, () => W(t).model.allowedModes, zr, (e, t) => {
						var n = Go(), r = z(n, !0);
						P(n);
						var i = {};
						V(() => {
							Y(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
						}), J(e, n);
					}), P(p);
					var m;
					oi(p), P(f);
					var h = B(f, 2), g = (e) => {
						var r = cs(), i = B(z(r));
						Q(i), P(r), V((e) => {
							$(i, "aria-label", "Model override " + W(t).key), fi(i, W(t).model.value ?? ""), i.disabled = e;
						}, [() => !W(t).editable || !A("editBindingOverride", "instanceEdit") || !n().editBindingOverride || !!W(a)]), K("change", i, (e) => ue(W(t).key, "model", "override", e.currentTarget.value, !0)), J(e, r);
					};
					X(h, (e) => {
						W(t).model.mode === "override" && e(g);
					});
					var _ = B(h, 2), v = z(_);
					P(_);
					var y = B(_), b = (e) => {
						var n = ls(), r = z(n, !0);
						P(n), V(() => Y(r, W(t).issue)), J(e, n);
					};
					X(y, (e) => {
						W(t).issue && e(b);
					}), P(r), V((e, n) => {
						Y(o, W(t).label), $(c, "aria-label", "Connection mode " + W(t).key), c.disabled = e, l !== (l = W(t).profile.mode) && (c.value = (c.__value = W(t).profile.mode) ?? "", ai(c, W(t).profile.mode)), $(p, "aria-label", "Model mode " + W(t).key), p.disabled = n, m !== (m = W(t).model.mode) && (p.value = (p.__value = W(t).model.mode) ?? "", ai(p, W(t).model.mode)), Y(v, `Effective: ${W(t).effective ?? ""} · ${W(t).source ?? ""}`);
					}, [() => !W(t).editable || !A("editBindingOverride", "instanceEdit") || !n().editBindingOverride || !!W(a), () => !W(t).editable || !A("editBindingOverride", "instanceEdit") || !n().editBindingOverride || !!W(a)]), K("change", c, (e) => ue(W(t).key, "profileId", e.currentTarget.value, W(t).profile.value)), K("change", p, (e) => ue(W(t).key, "model", e.currentTarget.value, W(t).model.value)), J(e, r);
				}), P(r), J(e, r);
			};
			X(de, (e) => {
				t.view.instance.bindings.length && e(fe);
			});
			var pe = B(de, 2), me = (e) => {
				var r = _s(), i = B(z(r), 2), o = B(z(i)), s = z(o);
				s.value = s.__value = "", Z(B(s), 17, () => t.view.update.choices, (e) => e.key, (e, t) => {
					var n = Go(), r = z(n, !0);
					P(n);
					var i = {};
					V(() => {
						Y(r, W(t).label), i !== (i = W(t).key) && (n.value = (n.__value = W(t).key) ?? "");
					}), J(e, n);
				}), P(o);
				var c;
				oi(o), P(i);
				var f = B(i, 2);
				Z(f, 17, () => l, zr, (e, r) => {
					var i = hs(), a = z(i), o = z(a, !0);
					P(a);
					var s = B(a);
					Z(s, 17, () => t.view.update[W(r)], (e) => e.from, (e, t) => {
						var i = ps(), a = z(i, !0), o = B(a), s = z(o);
						Z(s, 17, () => W(t).options, zr, (e, t) => {
							var n = Go(), r = z(n, !0);
							P(n);
							var i = {};
							V((e) => {
								Y(r, W(t).label), i !== (i = e) && (n.value = (n.__value = e) ?? "");
							}, [() => JSON.stringify(W(t).id)]), J(e, n);
						});
						var c = B(s), l = (e) => {
							var t = fs();
							t.value = t.__value = "null", J(e, t);
						};
						X(c, (e) => {
							W(t).canDrop && e(l);
						}), P(o);
						var u;
						oi(o), P(i), V((e, n) => {
							Y(a, W(t).label), $(o, "aria-label", "Mapping " + W(r) + " " + W(t).from), $(o, "data-map-kind", W(r)), o.disabled = e, u !== (u = n) && (o.value = (o.__value = n) ?? "", ai(o, n));
						}, [() => !A("prepareUpdate", "instanceEdit") || !n().prepareUpdate, () => JSON.stringify(Object.hasOwn(W(d)[W(r)], W(t).from) ? W(d)[W(r)][W(t).from] : W(t).to)]), K("change", o, (e) => ie(W(r), W(t).from, e.currentTarget.value)), J(e, i);
					});
					var c = B(s), l = (e) => {
						J(e, ms());
					};
					X(c, (e) => {
						t.view.update[W(r)].length || e(l);
					}), P(i), V(() => Y(o, u[W(r)])), J(e, i);
				});
				var p = B(f, 2);
				Z(p, 17, () => t.view.update.summary, zr, (e, t) => {
					var n = qo(), r = z(n, !0);
					P(n), V(() => Y(r, W(t))), J(e, n);
				});
				var m = B(p, 2), h = (e) => {
					J(e, gs());
				};
				X(m, (e) => {
					W(te) && e(h);
				});
				var g = B(m, 2), _ = z(g), v = B(_);
				P(g), P(r), V((e, r) => {
					o.disabled = !t.view.permissions.instanceEdit || !n().selectUpdateRef, c !== (c = W(O)?.key ?? "") && (o.value = (o.__value = W(O)?.key ?? "") ?? "", ai(o, W(O)?.key ?? "")), _.disabled = e, v.disabled = r;
				}, [() => !A("prepareUpdate", "instanceEdit") || !n().prepareUpdate || !W(O) || !!W(a), () => !A("acceptUpdate", "instanceEdit") || !n().acceptUpdate || !t.view.update.preparedKey || !W(O) || W(te) || !!W(a)]), K("change", o, (e) => {
					let r = e.currentTarget.value, i = t.view?.update?.choices.find((e) => e.key === r);
					e.currentTarget.selectedIndex >= 0 && t.view && t.view.permissions.instanceEdit && t.view.scope.kind === "graph" && n().selectUpdateRef && (!r || i) && n().selectUpdateRef(ne(t.view), i ? k(i.ref) : null);
				}), K("click", _, () => ae(!1)), K("click", v, () => ae(!0)), J(e, r);
			};
			X(pe, (e) => {
				t.view.update && e(me);
			}), V((e, i, a, o, s) => {
				Y(c, `Pinned v${t.view.instance.ref.version ?? ""} · ${t.view.instance.owned ? "Owned local copy" : "Read-only pinned body"}`), p.disabled = !n().openInstance, m.disabled = e, h.disabled = i, fi(_, W(r)), _.disabled = a, x.disabled = o, w !== (w = W(v)) && (x.value = (x.__value = W(v)) ?? "", ai(x, W(v))), D.disabled = s;
			}, [
				() => !A("makeLocalCopy", "instanceEdit") || !n().makeLocalCopy || !!W(a),
				() => !A("unpack", "instanceEdit") || !n().unpack || !!W(a),
				() => !A("saveToShelf", "bodyEdit") || !t.view.permissions.libraryWrite,
				() => !A("saveToShelf", "bodyEdit") || !t.view.permissions.libraryWrite,
				() => !A("saveToShelf", "bodyEdit") || !t.view.permissions.libraryWrite || !t.view.instance.owned || !n().saveToShelf || !W(r).trim() || W(v) === "revision" && !t.view.entries.some((e) => e.key === W(y)) || !!W(a)
			]), K("click", p, () => {
				t.view?.instance && n().openInstance?.(ne(t.view), Ie(t.view.instance.address));
			}), K("click", m, () => {
				let e = t.view?.instance;
				e && n().makeLocalCopy && he("makeLocalCopy", A("makeLocalCopy", "instanceEdit"), (t) => n().makeLocalCopy(t, Ie(e.address), k(e.ref)));
			}), K("click", h, () => {
				let e = t.view?.instance;
				e && n().unpack && he("unpack", A("unpack", "instanceEdit"), (t) => n().unpack(t, Ie(e.address), k(e.ref)));
			}), K("input", _, (e) => {
				R(r, e.currentTarget.value, !0), j();
			}), K("change", x, (e) => {
				let t = e.currentTarget.value;
				(t === "new" || t === "revision") && R(v, t, !0), j();
			}), K("click", D, () => {
				let e = t.view?.entries.find((e) => e.key === W(y)), i = W(v), a = W(r);
				t.view?.instance?.owned && t.view.permissions.libraryWrite && a.trim() && (i === "new" || e) && n().saveToShelf && he("saveToShelf", A("saveToShelf", "bodyEdit"), (t) => n().saveToShelf(t, i, i === "revision" && e ? k(e.ref) : null, a));
			}), J(e, i);
		};
		X(Ce, (e) => {
			t.view.instance && e(we);
		});
		var Te = B(Ce, 2), M = (e) => {
			var r = ys(), i = B(z(r)), o = z(i, !0);
			P(i);
			var s = B(i), c = B(z(s));
			Q(c), P(s);
			var l = B(s), u = z(l);
			P(l), P(r), V((e, n) => {
				Y(o, t.view.selection.label), fi(c, W(b)), c.disabled = e, u.disabled = n;
			}, [() => !A("convertSelection", "bodyEdit"), () => !A("convertSelection", "bodyEdit") || !n().convertSelection || !W(b).trim() || !t.view.selection.nodeIds.length || !!W(a)]), K("input", c, (e) => {
				R(b, e.currentTarget.value, !0), j();
			}), K("click", u, () => {
				let e = t.view?.selection?.nodeIds, r = W(b);
				e?.length && r.trim() && n().convertSelection && he("convertSelection", A("convertSelection", "bodyEdit"), (t) => n().convertSelection(t, [...e], r));
			}), J(e, r);
		};
		X(Te, (e) => {
			t.view.selection && e(M);
		});
		var Ee = B(Te, 2), N = (e) => {
			var n = ls(), r = z(n, !0);
			P(n), V(() => Y(r, t.view.issue)), J(e, n);
		};
		X(Ee, (e) => {
			t.view.issue && e(N);
		});
		var De = B(Ee, 2), Oe = (e) => {
			var t = bs(), n = z(t, !0);
			P(t), V(() => Y(n, W(i))), J(e, t);
		};
		X(De, (e) => {
			W(i) && e(Oe);
		});
		var Ae = B(De, 2), je = (e) => {
			J(e, xs());
		};
		X(Ae, (e) => {
			W(a) && e(je);
		}), V((e) => {
			Y(x, t.view.scopeLabel), re.disabled = !n().selectRef, ge !== (ge = W(E)?.key ?? "") && (re.value = (re.__value = W(E)?.key ?? "") ?? "", ai(re, W(E)?.key ?? "")), be.disabled = e;
		}, [() => !A("importJSON", "libraryWrite") || !n().importJSON || !!W(a)]), K("change", re, (e) => {
			let r = e.currentTarget.value, i = t.view?.entries.find((e) => e.key === r);
			e.currentTarget.selectedIndex >= 0 && t.view && n().selectRef && (!r || i) && n().selectRef(ne(t.view), i ? k(i.ref) : null);
		}), K("click", be, () => {
			n().importJSON && he("importJSON", A("importJSON", "libraryWrite"), (e) => n().importJSON(e));
		}), J(e, o);
	}, Se = (e) => {
		J(e, Cs());
	};
	X(be, (e) => {
		t.view ? e(xe) : e(Se, -1);
	}), P(ge), J(e, ge), Ve();
}
vr([
	"click",
	"change",
	"input"
]);
//#endregion
//#region ui/NodeSearch.svelte
var Es = /* @__PURE__ */ q("<label class=\"pc-context-check svelte-golf61\"><input type=\"checkbox\" class=\"svelte-golf61\"/>Context sensitive</label>"), Ds = /* @__PURE__ */ q("<span class=\"pc-search-context svelte-golf61\"> </span>"), Os = /* @__PURE__ */ q("<label class=\"pc-search-field svelte-golf61\"><input type=\"search\" aria-label=\"Search nodes and subgraphs\" placeholder=\"Search…\" autocomplete=\"off\" role=\"combobox\" aria-expanded=\"true\" class=\"svelte-golf61\"/></label> <!> <!>", 1), ks = /* @__PURE__ */ q("<p class=\"pc-search-context svelte-golf61\">Choose the named port to connect.</p>"), As = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-search-result svelte-golf61\" role=\"option\"><span class=\"svelte-golf61\"> </span> <span class=\"pc-family svelte-golf61\"> </span></button>"), js = /* @__PURE__ */ q("<p class=\"pc-empty svelte-golf61\">No nodes match.</p>"), Ms = /* @__PURE__ */ q("<p class=\"pc-feedback svelte-golf61\" role=\"status\"> </p>"), Ns = /* @__PURE__ */ q("<div class=\"pc-node-search svelte-golf61\" role=\"dialog\" aria-modal=\"false\" tabindex=\"-1\"><!> <div class=\"pc-search-results svelte-golf61\" role=\"listbox\"></div> <!></div>");
function Ps(e, t) {
	let n = Ar();
	Be(t, !0);
	let r = Si(t, "view", 3, null), i = Si(t, "actions", 19, () => ({})), a = /* @__PURE__ */ L(void 0), o = /* @__PURE__ */ L(void 0), s = /* @__PURE__ */ L(""), c = /* @__PURE__ */ L(0), l = /* @__PURE__ */ L(8), u = /* @__PURE__ */ L(8), d, f, p = (e) => [
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
		d !== e && R(s, ""), i && R(c, 0), d = e, f = t, cr().then(() => {
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
	var T = kr();
	G("resize", en, x);
	var E = ln(T), ee = (e) => {
		var t = Ns();
		let i;
		var d = z(t), f = (e) => {
			var t = Os(), i = ln(t), a = z(i);
			Q(a), xi(a, (e) => R(o, e), () => W(o)), P(i);
			var l = B(i, 2), u = (e) => {
				var t = Es(), n = z(t);
				Q(n), ke(), P(t), V(() => {
					pi(n, r().contextSensitive), n.disabled = r().readOnly;
				}), K("change", n, C), J(e, t);
			};
			X(l, (e) => {
				r().origin && e(u);
			});
			var d = B(l, 2), f = (e) => {
				var t = Ds(), n = z(t, !0);
				P(t), V(() => Y(n, (r().origin.dir === "out" ? "Accepts " : "Produces ") + r().origin.kind)), J(e, t);
			};
			X(d, (e) => {
				r().origin && e(f);
			}), V((e) => {
				$(a, "aria-controls", n + "-results"), $(a, "aria-activedescendant", e);
			}, [() => W(y) ? n + "-item-" + W(h).indexOf(W(y)) : void 0]), K("input", a, () => R(c, 0)), _i(a, () => W(s), (e) => R(s, e)), J(e, t);
		}, p = (e) => {
			J(e, ks());
		};
		X(d, (e) => {
			r().mode === "nodes" ? e(f) : e(p, -1);
		});
		var m = B(d, 2);
		Z(m, 21, () => W(h), (e) => g(e), (e, t) => {
			var r = As(), i = z(r), a = z(i, !0);
			P(i);
			var o = B(i, 1, !0);
			o.nodeValue = " ";
			var s = B(o);
			let l;
			var u = z(s, !0);
			P(s), P(r), V((e, n, i, o) => {
				$(r, "aria-selected", W(y) === W(t)), $(r, "id", e), $(r, "data-choice", "id" in W(t) ? W(t).id : void 0), $(r, "data-port", "portId" in W(t) ? W(t).portId : void 0), r.disabled = n, $(r, "title", "disabledReason" in W(t) ? W(t).disabledReason : void 0), Y(a, i), l = ii(s, "", l, o), Y(u, "family" in W(t) ? W(t).family : W(t).kind);
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
			J(e, js());
		}), P(m);
		var x = B(m, 2), T = (e) => {
			var t = Ms(), n = z(t, !0);
			P(t), V(() => Y(n, r().feedback)), J(e, t);
		};
		X(x, (e) => {
			r().feedback && e(T);
		}), P(t), xi(t, (e) => R(a, e), () => W(a)), V(() => {
			$(t, "aria-label", r().mode === "ports" ? "Choose connection port" : "Add node"), i = ii(t, "", i, {
				left: `${W(l) ?? ""}px`,
				top: `${W(u) ?? ""}px`
			}), $(m, "id", n + "-results"), $(m, "aria-label", r().mode === "ports" ? "Compatible ports" : "Nodes and subgraphs");
		}), K("keydown", t, w), J(e, t);
	};
	X(E, (e) => {
		r() && e(ee);
	}), J(e, T), Ve();
}
vr([
	"keydown",
	"input",
	"change",
	"click"
]);
//#endregion
//#region ui/PinMenu.svelte
var Fs = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-pin-action svelte-i73q0t\"> </button>"), Is = /* @__PURE__ */ q("<p class=\"pc-empty svelte-i73q0t\">No attached links.</p>"), Ls = /* @__PURE__ */ q("<div class=\"pc-pin-menu svelte-i73q0t\" role=\"dialog\" aria-label=\"Pin actions\" aria-modal=\"false\" tabindex=\"-1\"><div class=\"pc-menu-head svelte-i73q0t\"><h2 class=\"svelte-i73q0t\"> </h2><button type=\"button\" aria-label=\"Close pin actions\" class=\"svelte-i73q0t\">Close</button></div> <p class=\"pc-kind svelte-i73q0t\"> </p> <!></div>");
function Rs(e, t) {
	Be(t, !0);
	let n = Si(t, "view", 3, null), r = Si(t, "actions", 19, () => ({})), i = /* @__PURE__ */ L(void 0), a = /* @__PURE__ */ L(8), o = /* @__PURE__ */ L(8), s, c = (e) => !!e.disabled || !!n()?.readOnly && e.capability !== "navigation";
	function l() {
		if (!n() || !W(i)) return;
		let e = W(i).getBoundingClientRect(), t = document.documentElement.clientWidth || window.innerWidth, r = document.documentElement.clientHeight || window.innerHeight;
		R(a, Math.max(8, Math.min(n().screenAnchor.x, t - e.width - 8)), !0), R(o, Math.max(8, Math.min(n().screenAnchor.y, r - e.height - 8)), !0);
	}
	yn(() => {
		let e = n()?.key, t = n()?.screenAnchor;
		if (e === void 0 || !t) return;
		let r = s !== e;
		s = e, cr().then(() => {
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
	var f = kr();
	G("resize", en, l);
	var p = ln(f), m = (e) => {
		var t = Ls();
		let s;
		var l = z(t), f = z(l), p = z(f, !0);
		P(f);
		var m = B(f);
		P(l);
		var h = B(l, 2), g = z(h);
		P(h), Z(B(h, 2), 17, () => n().entries, (e) => e.id, (e, t) => {
			var n = Fs(), r = z(n, !0);
			P(n), V((e) => {
				$(n, "data-entry", W(t).id), n.disabled = e, $(n, "title", W(t).reason), Y(r, W(t).label);
			}, [() => c(W(t))]), K("click", n, () => u(W(t))), J(e, n);
		}, (e) => {
			J(e, Is());
		}), P(t), xi(t, (e) => R(i, e), () => W(i)), V(() => {
			s = ii(t, "", s, {
				left: `${W(a) ?? ""}px`,
				top: `${W(o) ?? ""}px`
			}), Y(p, n().title), Y(g, `${n().kind ?? ""}${n().readOnly ? " · Read only" : ""}`);
		}), K("keydown", t, d), K("click", m, () => r().dismiss?.()), J(e, t);
	};
	X(p, (e) => {
		n() && e(m);
	}), J(e, f), Ve();
}
vr(["keydown", "click"]);
//#endregion
//#region src/ui/node-palette.js
var zs = "M3 7 12 2l9 5v10l-9 5-9-5ZM3 7l9 5 9-5M12 12v10", Bs = "M3 6l4-2 4 2v5l-4 2-4-2ZM3 6l4 2 4-2M7 8v5M13 6l4-2 4 2v5l-4 2-4-2ZM13 6l4 2 4-2M17 8v5M8 15l4-2 4 2v5l-4 2-4-2ZM8 15l4 2 4-2M12 17v5", Vs = Object.freeze([
	{
		name: "Input",
		color: "#96ad52",
		icon: zs
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
		icon: zs
	},
	{
		name: "Subgraphs",
		color: "#a3aa99",
		icon: Bs
	}
].map((e) => Object.freeze(e))), Hs = {
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
	Library: Bs,
	Routing: "M3 12h18m-7-7 7 7-7 7",
	Blocks: zs,
	Reflect: "M21 12s-4-7-9-7-9 7-9 7 4 7 9 7 9-7 9-7ZM15 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0",
	Internalize: "M4 4h16v16H4M8 8l4 4 4-4M12 12v5",
	Express: "M4 4h16v12H9l-5 4ZM8 8h8M8 12h5",
	Memory: "M5 3h14v18H5ZM8 7h8M8 11h8M8 15h5",
	State: "M3 12h4l3-7 4 14 3-7h4"
}, Us = Object.freeze(Object.fromEntries(Object.entries(Hs).map(([e, t]) => [e, Object.freeze({
	name: e,
	icon: t
})]))), Ws = {
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
		Hs.Planning
	],
	compose: [
		"Assembly",
		"co",
		Hs.Assembly
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
		Hs.Validation
	],
	"json-decode": [
		"Parsing",
		"jd",
		Hs.Parsing
	],
	"select-fields": [
		"Extraction",
		"sf",
		Hs.Extraction
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
		Hs.Delivery
	],
	reroute: [
		"Routing",
		"rt",
		Hs.Routing
	],
	reflect: [
		"Reflect",
		"rf",
		Hs.Reflect
	],
	internalize: [
		"Internalize",
		"in",
		Hs.Internalize
	],
	express: [
		"Express",
		"ex",
		Hs.Express
	],
	context: [
		"Context",
		"cx",
		Hs.Context
	],
	memory: [
		"Memory",
		"mm",
		Hs.Memory
	],
	state: [
		"State",
		"sv",
		Hs.State
	]
}, Gs = Object.freeze(Object.fromEntries(Object.entries(Ws).map(([e, [t, n, r]]) => [e, Object.freeze({
	group: t,
	shortcode: n,
	icon: r
})]))), Ks = Object.freeze({
	group: "Blocks",
	shortcode: "",
	icon: zs
}), qs = (e) => Object.hasOwn(Gs, e) ? Gs[e] : Ks, Js = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-family-row\" aria-haspopup=\"menu\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path></path></svg><span> </span></button>"), Ys = /* @__PURE__ */ q("<button type=\"button\" role=\"menuitem\">‹ Families</button>"), Xs = /* @__PURE__ */ q("<input class=\"text_pole\" aria-label=\"Search nodes\" placeholder=\"Search nodes…\"/>"), Zs = /* @__PURE__ */ q("<button type=\"button\" role=\"menuitem\"><svg class=\"pc-leaf-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path></path></svg><span class=\"pc-catalog-name\"> </span><small> </small></button>"), Qs = /* @__PURE__ */ q("<button type=\"button\" role=\"menuitem\" data-shelf-manage=\"\"><svg class=\"pc-leaf-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M3 6h18M3 18h18M8 3v6m8 6v6M3 12h18m-5-3v6\"></path></svg><span class=\"pc-catalog-name\">Manage subgraphs…</span></button>"), $s = /* @__PURE__ */ q("<div role=\"menu\" tabindex=\"-1\"><!> <!> <!> <!></div>"), ec = /* @__PURE__ */ q("<nav aria-label=\"Node families\"></nav> <!>", 1);
function tc(e, t) {
	Be(t, !0);
	let n = Si(t, "readOnly", 3, !1), r, i = /* @__PURE__ */ L(null), a = /* @__PURE__ */ L(""), o = /* @__PURE__ */ L(!1), s = /* @__PURE__ */ L(""), c = /* @__PURE__ */ L(!1), l = /* @__PURE__ */ L(0), u = /* @__PURE__ */ L(0), d = null, f = 0, p = Vs.map((e) => e.name), m = (e) => Vs.find((t) => t.name === e)?.color;
	function h(e = W(a)) {
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
				let i = n.id.startsWith("operation:") ? n.id.split(":")[1] : "", a = qs(i), o = i ? n.label.split(" · ")[0] : n.label;
				return {
					...n,
					title: o,
					compatible: !n.disabledReason && !!t.choose,
					catalog: !0,
					shortcode: i ? a.shortcode || n.shortcode || "" : n.shortcode ?? a.shortcode,
					icon: e === "Subgraphs" ? Us.Library.icon : a.icon,
					searchAliases: r
				};
			});
		}
		let n = t.view?.families.find((t) => t.name === e);
		return n ? n.operations.filter((t) => e !== "Surface" || !["pattern-scan", "validate-patches"].includes(t.id)).map((t) => ({
			...t,
			...qs(t.id),
			family: e
		})) : [];
	}
	function g(e = !1) {
		f++, R(a, ""), R(o, !1), e && d?.focus({ preventScroll: !0 });
	}
	yn(() => (t.view?.graphId, t.choices, () => g()));
	function _() {
		let e = r.closest(".pc-canvas-area"), t = e.getBoundingClientRect();
		return {
			left: t.left + e.clientLeft,
			top: t.top + e.clientTop,
			right: t.right - e.clientLeft,
			width: e.clientWidth,
			height: e.clientHeight
		};
	}
	function v(e, t, n, r) {
		let i = _(), a = i.right - e.right - 6, o = e.left - i.left - 6, s = a >= t || o >= t, c = a >= t ? e.right - i.left + 3 : o >= t ? e.left - i.left - t - 3 : 13;
		return {
			x: Math.max(4, Math.min(c, i.width - t - 4)),
			y: Math.max(4, Math.min(e.top - i.top, i.height - n - 4)),
			compact: !s || i.width < t + r + 26
		};
	}
	function y(e, t, n) {
		let r = t.querySelector("button")?.getBoundingClientRect();
		return r ? e.top + (e.height - r.height) / 2 - (r.top - n.top) : e.top;
	}
	async function b(e, t, n = !0) {
		if (W(a) === e) {
			n && W(i)?.querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
			return;
		}
		let r = ++f;
		if (R(a, e, !0), R(o, !1), d = t, await cr(), r !== f || W(a) !== e || !W(i)?.isConnected) return;
		let s = t.getBoundingClientRect(), p = W(i).getBoundingClientRect(), m = v({
			top: y(s, W(i), p),
			left: s.left,
			right: s.right
		}, p.width, p.height, 128);
		R(l, m.x, !0), R(u, m.y, !0), R(c, m.compact, !0), n && W(i).querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
	}
	async function x() {
		let e = ++f;
		if (R(a, ""), R(o, !0), R(s, ""), await cr(), e !== f || !W(o) || !W(i)?.isConnected) return;
		let t = _();
		R(l, Math.min(136, Math.max(4, t.width - 254)), !0), R(u, 13), W(i).querySelector("input")?.focus();
	}
	function S(e) {
		let r = h(e.family).find((t) => t.id === e.id);
		r?.compatible && !n() && (g(!0), r.catalog ? t.choose?.(r.id) : t.add(r.id));
	}
	function C(e) {
		if (e.key === "Escape") {
			e.preventDefault(), e.stopPropagation(), g(!0);
			return;
		}
		let t = e.target;
		if (e.key === "ArrowRight" && t.dataset.family && !t.disabled) {
			e.preventDefault(), e.stopPropagation(), b(t.dataset.family, t);
			return;
		}
		if (e.key === "ArrowLeft" && W(a)) {
			e.preventDefault(), e.stopPropagation(), g(!0);
			return;
		}
		if (e.key === "Tab") {
			g();
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
	var w = { openSearch: x }, T = ec();
	G("pointerdown", en, (e) => {
		e.target.closest(".pc-node-shelf, .pc-shelf-menu") || g();
	}), G("resize", en, () => g());
	var E = ln(T);
	Z(E, 21, () => Vs, zr, (e, n) => {
		var r = Js();
		let i;
		var o = z(r), s = z(o);
		P(o);
		var c = B(o), l = z(c, !0);
		P(c), P(r), V((e) => {
			$(r, "data-family", W(n).name), r.disabled = e, $(r, "title", "Browse " + W(n).name + " nodes"), $(r, "aria-expanded", W(a) === W(n).name), i = ii(r, "", i, { "--pc-family": W(n).color }), $(s, "d", W(n).icon), Y(l, W(n).name);
		}, [() => !h(W(n).name).length && !(W(n).name === "Subgraphs" && t.manageSubgraphs)]), K("click", r, (e) => b(W(n).name, e.currentTarget)), G("pointerenter", r, (e) => {
			e.pointerType !== "touch" && !e.currentTarget.disabled && b(W(n).name, e.currentTarget, !1);
		}), K("keydown", r, C), J(e, r);
	}), P(E), xi(E, (e) => r = e, () => r);
	var ee = B(E, 2), D = (e) => {
		var r = $s();
		let d;
		var f = z(r), _ = (e) => {
			var t = Ys();
			K("click", t, () => g(!0)), J(e, t);
		};
		X(f, (e) => {
			W(c) && W(a) && e(_);
		});
		var v = B(f, 2), y = (e) => {
			var t = Xs();
			Q(t), _i(t, () => W(s), (e) => R(s, e)), J(e, t);
		};
		X(v, (e) => {
			W(o) && e(y);
		});
		var b = B(v, 2);
		Z(b, 17, () => W(o) ? p.flatMap((e) => h(e)).filter((e) => [
			e.title,
			e.id,
			e.family,
			e.purpose,
			e.shortcode,
			...e.searchAliases ?? []
		].join(" ").toLowerCase().includes(W(s).toLowerCase())) : h(), (e) => e.family + e.id, (e, t) => {
			var r = Zs();
			let i;
			var a = z(r), o = z(a);
			P(a);
			var s = B(a), c = z(s, !0);
			P(s);
			var l = B(s), u = z(l, !0);
			P(l), P(r), V((e) => {
				$(r, "data-shelf-choice", W(t).id), r.disabled = !W(t).compatible || n(), $(r, "title", n() ? "This graph is read-only." : W(t).disabledReason || (W(t).compatible ? W(t).purpose || "Add " + W(t).title : "Requires the " + W(t).phase + " phase")), i = ii(r, "", i, e), $(o, "d", W(t).icon), Y(c, W(t).title), Y(u, W(t).shortcode);
			}, [() => ({ "--pc-family": m(W(t).family) })]), K("click", r, () => S(W(t))), J(e, r);
		});
		var x = B(b, 2), w = (e) => {
			var n = Qs();
			K("click", n, () => {
				g(!0), t.manageSubgraphs?.();
			}), J(e, n);
		};
		X(x, (e) => {
			!W(o) && W(a) === "Subgraphs" && t.manageSubgraphs && e(w);
		}), P(r), xi(r, (e) => R(i, e), () => W(i)), V((e) => {
			ni(r, 1, `pc-shelf-menu ${W(o) ? "pc-leaf-menu" : "pc-family-menu"}`), $(r, "aria-label", W(o) ? "Search nodes" : W(a) + " nodes"), d = ii(r, "", d, e);
		}, [() => ({
			left: `${W(l)}px`,
			top: `${W(u)}px`,
			"--pc-family": m(W(a))
		})]), K("keydown", r, C), J(e, r);
	};
	return X(ee, (e) => {
		(W(a) || W(o)) && e(D);
	}), V(() => ni(E, 1, `pc-node-shelf${W(c) && W(a) ? " pc-shelf-replaced" : ""}`)), J(e, T), Ve(w);
}
vr(["click", "keydown"]);
//#endregion
//#region ui/WorkflowSetup.svelte
var nc = /* @__PURE__ */ q("<option> </option>"), rc = /* @__PURE__ */ q("<label> <select class=\"text_pole\"><option>Choose a connection</option><!></select></label> <label> <input class=\"text_pole\" placeholder=\"Use profile model\"/></label>", 1), ic = /* @__PURE__ */ q("<p class=\"pc-error\"> </p>"), ac = /* @__PURE__ */ q("<article class=\"pc-workflow-starter\"><strong> </strong><p> </p><small> </small><button type=\"button\" class=\"pc-btn menu_button\"> </button></article>"), oc = /* @__PURE__ */ q("<h3> </h3> <p> </p> <p> </p> <!> <button type=\"button\" class=\"pc-btn menu_button\"> </button> <p> </p> <!> <h3>Workflow examples</h3> <!>", 1);
function sc(e, t) {
	Be(t, !0);
	var n = kr(), r = ln(n), i = (e) => {
		var n = oc(), r = ln(n), i = z(r, !0);
		P(r);
		var a = B(r, 2), o = z(a, !0);
		P(a);
		var s = B(a, 2), c = z(s);
		P(s);
		var l = B(s, 2);
		Z(l, 17, () => t.view.roles, (e) => e.name, (e, n) => {
			var r = rc(), i = ln(r), a = z(i), o = B(a), s = z(o);
			s.value = s.__value = "", Z(B(s), 17, () => t.view.profiles, (e) => e.id, (e, t) => {
				var n = nc(), r = z(n, !0);
				P(n);
				var i = {};
				V(() => {
					Y(r, W(t).name), i !== (i = W(t).id) && (n.value = (n.__value = W(t).id) ?? "");
				}), J(e, n);
			}), P(o);
			var c;
			oi(o), P(i);
			var l = B(i, 2), u = z(l), d = B(u);
			Q(d), P(l), V(() => {
				Y(a, `${W(n).name ?? ""} connection`), $(o, "aria-label", W(n).name + " connection"), c !== (c = W(n).profileId) && (o.value = (o.__value = W(n).profileId) ?? "", ai(o, W(n).profileId)), Y(u, `${W(n).name ?? ""} model override`), fi(d, W(n).model);
			}), K("change", o, (e) => t.actions.workflowSetup?.bindRole(W(n).name, e.currentTarget.value, W(n).model)), K("input", d, (e) => t.actions.workflowSetup?.bindRole(W(n).name, W(n).profileId, e.currentTarget.value)), J(e, r);
		});
		var u = B(l, 2), d = z(u);
		P(u);
		var f = B(u, 2), p = z(f);
		P(f);
		var m = B(f, 2);
		Z(m, 17, () => t.view.issues, zr, (e, t) => {
			var n = ic(), r = z(n, !0);
			P(n), V(() => Y(r, W(t))), J(e, n);
		}), Z(B(m, 4), 17, () => t.view.starters, (e) => e.id, (e, n) => {
			var r = ac(), i = z(r), a = z(i, !0);
			P(i);
			var o = B(i), s = z(o, !0);
			P(o);
			var c = B(o), l = z(c);
			P(c);
			var u = B(c), d = z(u);
			P(u), P(r), V(() => {
				Y(a, W(n).title), Y(s, W(n).purpose), Y(l, `${W(n).phase === "pre" ? "Before reply" : "After reply"} · Maximum ${W(n).callBound ?? ""} auxiliary requests`), Y(d, `Install ${W(n).title ?? ""}`);
			}), K("click", u, () => t.actions.workflowSetup?.install(W(n).id)), J(e, r);
		}), V(() => {
			Y(i, t.view.name), Y(o, t.view.phase === "pre" ? "Guidance helps SillyTavern plan its normal reply." : "Review a revision of the latest completed assistant reply."), Y(c, `Maximum auxiliary requests: ${t.view.callBound ?? ""}`), Y(d, `Assign ${t.view.phase ?? ""} phase`), Y(p, `${t.view.assigned ? "Assigned to this phase." : "Phase is not assigned."} Arming is a separate action.`);
		}), K("click", u, () => t.actions.workflowSetup?.assign(t.view?.phase || "")), J(e, n);
	};
	X(r, (e) => {
		t.view && e(i);
	}), J(e, n), Ve();
}
vr([
	"change",
	"input",
	"click"
]);
//#endregion
//#region ui/ImportReview.svelte
var cc = /* @__PURE__ */ q("<p> </p>"), lc = /* @__PURE__ */ q("<li> </li>"), uc = /* @__PURE__ */ q("<h3>Saved bindings to review</h3><ul></ul>", 1), dc = /* @__PURE__ */ q("<p>Saved model metadata is present. Review local connections before running.</p>"), fc = /* @__PURE__ */ q("<h3>Imported terminal effects</h3><ul></ul>", 1), pc = /* @__PURE__ */ q("<p>No imported terminal effects.</p>"), mc = /* @__PURE__ */ q("<p role=\"alert\"> </p>"), hc = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-btn menu_button\">Prepare again</button>"), gc = /* @__PURE__ */ q("<div class=\"pc-workspace-overlay pc-import-overlay\"><div class=\"pc-workspace-dialog pc-import-review\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Import into graph\" tabindex=\"-1\"><header><h2>Import into graph</h2><button type=\"button\" class=\"pc-btn menu_button\" aria-label=\"Cancel import\">×</button></header> <p><strong> </strong> <small> </small></p> <dl><dt>Phase</dt><dd> </dd><dt>Additions</dt><dd> </dd><dt>Conservative request bound</dt><dd> </dd></dl> <p class=\"pc-import-explanation\">This authoring bound includes unfinished branches. Bindings and reachable execution are checked when you explicitly run the workflow.</p> <!> <!> <!> <p>Insertion keeps internal wiring and relative layout. It does not connect matching names, arm or assign the graph, run requests, publish Guidance, or Apply a reply.</p> <!> <footer><button type=\"button\" class=\"pc-btn menu_button\">Cancel</button><!><button type=\"button\" class=\"pc-btn menu_button pc-import-accept\">Insert into graph</button></footer></div></div>");
function _c(e, t) {
	Be(t, !0);
	let n;
	Ci(() => {
		let e = document.activeElement;
		return n.querySelector("button")?.focus(), () => e?.focus({ preventScroll: !0 });
	});
	function r(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), t.actions.cancelImport?.()), e.key === "Tab") {
			let t = [...n.querySelectorAll("button:not(:disabled)")], r = t[0], i = t.at(-1);
			e.shiftKey && document.activeElement === r && (e.preventDefault(), i?.focus()), !e.shiftKey && document.activeElement === i && (e.preventDefault(), r?.focus());
		}
	}
	var i = gc(), a = z(i), o = z(a), s = B(z(o));
	P(o);
	var c = B(o, 2), l = z(c), u = z(l, !0);
	P(l);
	var d = B(l, 2), f = z(d, !0);
	P(d), P(c);
	var p = B(c, 2), m = B(z(p)), h = z(m, !0);
	P(m);
	var g = B(m, 2), _ = z(g);
	P(g);
	var v = B(g, 2), y = z(v);
	P(v), P(p);
	var b = B(p, 4), x = (e) => {
		var n = cc(), r = z(n);
		P(n), V((e) => Y(r, `Imported model roles: ${e ?? ""}.`), [() => t.view.requiredRoles.join(", ")]), J(e, n);
	};
	X(b, (e) => {
		t.view.requiredRoles.length && e(x);
	});
	var S = B(b, 2), C = (e) => {
		var n = uc(), r = B(ln(n));
		Z(r, 21, () => t.view.unresolvedBindings, zr, (e, t) => {
			var n = lc(), r = z(n);
			P(n), V((e) => Y(r, `${W(t).title ?? ""} · ${W(t).role ?? ""}: missing ${e ?? ""}`), [() => W(t).missing.join(" and ")]), J(e, n);
		}), P(r), J(e, n);
	}, w = (e) => {
		J(e, dc());
	};
	X(S, (e) => {
		t.view.unresolvedBindings.length ? e(C) : t.view.bindingReviewRequired && e(w, 1);
	});
	var T = B(S, 2), E = (e) => {
		var n = fc(), r = B(ln(n));
		Z(r, 21, () => t.view.terminals, zr, (e, t) => {
			var n = lc(), r = z(n);
			P(n), V(() => Y(r, `${W(t).title ?? ""} · ${W(t).operation ?? ""}`)), J(e, n);
		}), P(r), J(e, n);
	}, ee = (e) => {
		J(e, pc());
	};
	X(T, (e) => {
		t.view.terminals.length ? e(E) : e(ee, -1);
	});
	var D = B(T, 4), O = (e) => {
		var n = mc(), r = z(n, !0);
		P(n), V(() => Y(r, t.view.error)), J(e, n);
	};
	X(D, (e) => {
		t.view.error && e(O);
	});
	var te = B(D, 2), ne = z(te), k = B(ne), A = (e) => {
		var n = hc();
		K("click", n, () => t.actions.prepareImportAgain?.()), J(e, n);
	};
	X(k, (e) => {
		t.view.error && e(A);
	});
	var j = B(k);
	P(te), P(a), xi(a, (e) => n = e, () => n), P(i), V(() => {
		Y(u, t.view.name), Y(f, t.view.fileName), Y(h, t.view.phase), Y(_, `${t.view.nodeCount ?? ""} blocks · ${t.view.wireCount ?? ""} wires · ${t.view.groupCount ?? ""} groups`), Y(y, `${t.view.callBound ?? ""} total · ${t.view.importedCallBound ?? ""} imported`), j.disabled = !!t.view.error;
	}), K("keydown", a, r), G("paste", a, (e) => e.stopPropagation()), K("click", s, () => t.actions.cancelImport?.()), K("click", ne, () => t.actions.cancelImport?.()), K("click", j, () => t.actions.acceptImport?.()), J(e, i), Ve();
}
vr(["keydown", "click"]);
//#endregion
//#region ui/Workbench.svelte
var vc = /* @__PURE__ */ q("<p class=\"pc-native-diagnostic svelte-1dr9aew\" role=\"alert\"> </p>"), yc = /* @__PURE__ */ q("<p>Browse node families on the floating shelf. Middle mouse pans the graph; the wheel zooms around the pointer. Use the divider or its arrow keys to resize Preview.</p><p>Setup contains workflow examples, phase assignment and role defaults. Subgraphs manages reusable definitions. Arm enables the selected host workflow; Run tests it explicitly.</p><p>File › Import into graph reviews a same-phase fragment before one undoable insertion. Import workflow opens a separate graph.</p><p>Right-click empty graph space or drag from a pin to search for compatible nodes. Double-click a subgraph to open its saved body in a graph tab. Pinned bodies are read-only; Make local copy enables edits through the real parent instance.</p><p>The Subgraphs shelf manages individual subgraph JSON files. Portals connect pins through named references. Preview artifact tabs show results for the selected node; Run to here checks the request bound before running. Apply reviews the fresh result against the full root workflow.</p>", 1), bc = /* @__PURE__ */ q("<div class=\"pc-workspace-overlay\"><div class=\"pc-workspace-dialog\" role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\"><header><h2> </h2><button type=\"button\" class=\"pc-btn menu_button\" aria-label=\"Close panel\">×</button></header> <!></div></div>"), xc = /* @__PURE__ */ q("<div class=\"pc-workspace-overlay\"><div class=\"pc-manager-dialog svelte-1dr9aew\" role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\" aria-label=\"Manage portals\"><!></div></div>"), Sc = /* @__PURE__ */ q("<div class=\"pc-workspace-overlay\"><div class=\"pc-manager-dialog svelte-1dr9aew\" role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\" aria-label=\"Manage subgraphs\"><!></div></div>"), Cc = /* @__PURE__ */ q("<div role=\"dialog\" aria-modal=\"true\" aria-label=\"Lattice\" data-pc-workbench=\"svelte\"><!> <div class=\"pc-body\" role=\"region\" aria-label=\"Workspace panels\" tabindex=\"0\"><div class=\"pc-stage\"><section aria-label=\"Output preview\"><header class=\"pc-preview-pane-head\"><strong>Preview</strong><button type=\"button\" class=\"pc-btn menu_button\"> </button></header> <div class=\"pc-preview-content\"><!></div></section> <!> <!> <div class=\"pc-canvas-area\" id=\"pc-workspace-graph\" role=\"tabpanel\"><div class=\"pc-workspace-run svelte-1dr9aew\"><!></div> <!> <div class=\"pc-canvas-host\" aria-label=\"Node canvas\"></div> <!> <!></div></div> <!> <div class=\"pc-inspector pc-workspace-details svelte-1dr9aew\"><header class=\"pc-details-heading svelte-1dr9aew\"><strong class=\"svelte-1dr9aew\">Details</strong><button type=\"button\" class=\"svelte-1dr9aew\">Portals</button><button type=\"button\" class=\"svelte-1dr9aew\">Subgraphs</button></header> <!></div></div> <!> <!> <!> <!> <!> <!></div>");
function wc(e, t) {
	Be(t, !0);
	let n = Si(t, "actions", 7), r = /* @__PURE__ */ L({
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
	}), i, a, o, s, c, l;
	function u() {
		return {
			root: i,
			parts: {
				...l.getParts(),
				inspector: c,
				canvasHost: o
			}
		};
	}
	function d(e) {
		n({
			...n(),
			...e
		});
	}
	function f(e) {
		R(r, {
			...W(r),
			...e
		});
	}
	async function p(e, t) {
		if (await cr(), !t()) return;
		let n = [...o.querySelectorAll(".pc-comment-frame[data-id]")].find((t) => t.dataset.id === e)?.querySelector(".pc-comment-title-input");
		n && !n.disabled && (n.focus({ preventScroll: !0 }), n.select());
	}
	let m = "lattice.workspace.preview";
	function h() {
		try {
			let e = JSON.parse(localStorage.getItem(m) || "null");
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
	let g = h(), _ = /* @__PURE__ */ L(Zt(g.height)), v = /* @__PURE__ */ L(Zt(g.collapsed)), y = /* @__PURE__ */ L(500), b = /* @__PURE__ */ L(null), x = /* @__PURE__ */ L(520), S = /* @__PURE__ */ F(() => Math.max(220, Math.min(W(x), W(b) ?? W(r).detailsWidth ?? 258)));
	function C(e) {
		R(b, null), R(r, {
			...W(r),
			detailsWidth: e
		}), n().resizeDetails?.(e);
	}
	let w = /* @__PURE__ */ L(""), T = /* @__PURE__ */ L(null), E = null, ee;
	function D() {
		try {
			localStorage.setItem(m, JSON.stringify({
				height: W(_),
				collapsed: W(v)
			}));
		} catch {}
	}
	function O() {
		n().resizeStart?.();
	}
	function te(e) {
		O(), R(v, e, !0), D();
	}
	function ne() {
		te(!1);
	}
	function k() {
		return A("workflow-setup");
	}
	async function A(e) {
		e === "open-workflow" ? l.focusGraphSelect() : e === "show-preview" ? te(!1) : e === "collapse-preview" ? te(!0) : e === "add-node" ? ee.openSearch() : (E = document.activeElement, R(w, e, !0), await cr(), W(T).querySelector("button")?.focus());
	}
	function j() {
		R(w, ""), E?.focus({ preventScroll: !0 });
	}
	function re(e, t) {
		if (e.stopPropagation(), e.key === "Escape") e.preventDefault(), n()[t]?.close?.();
		else if (e.key === "Tab") {
			let t = [...e.currentTarget.querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex=\"0\"]")], n = t[0], r = t.at(-1);
			e.shiftKey && document.activeElement === n && (e.preventDefault(), r?.focus()), !e.shiftKey && document.activeElement === r && (e.preventDefault(), n?.focus());
		}
	}
	function ie(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), j()), e.key === "Tab") {
			let t = [...W(T).querySelectorAll("button:not(:disabled), input, select, textarea, [tabindex=\"0\"]")], n = t[0], r = t.at(-1);
			e.shiftKey && document.activeElement === n && (e.preventDefault(), r?.focus()), !e.shiftKey && document.activeElement === r && (e.preventDefault(), n?.focus());
		}
	}
	Ci(() => {
		let e = () => {
			R(y, Math.max(90, s.clientHeight - 190), !0), R(x, Math.max(220, Math.min(520, (a.clientWidth || i.clientWidth || window.innerWidth) - 368)), !0);
		}, t = globalThis.ResizeObserver;
		if (!t) return e(), window.addEventListener("resize", e), () => window.removeEventListener("resize", e);
		let n = new t(e);
		return n.observe(s), n.observe(a), e(), () => n.disconnect();
	});
	var ae = {
		getParts: u,
		updateActions: d,
		update: f,
		focusCommentTitle: p,
		revealPreview: ne,
		revealWorkflowSetup: k
	}, oe = Cc();
	let se, ce;
	var le = z(oe);
	xi($i(le, {
		get state() {
			return W(r);
		},
		get actions() {
			return n();
		},
		local: A
	}), (e) => l = e, () => l);
	var ue = B(le, 2), de = z(ue), fe = z(de);
	let pe, me;
	var he = z(fe), ge = B(z(he)), _e = z(ge, !0);
	P(ge), P(he);
	var ve = B(he, 2), ye = z(ve);
	{
		let e = /* @__PURE__ */ F(() => W(r).outputPreview ?? null);
		so(ye, {
			get view() {
				return W(e);
			},
			get actions() {
				return n().outputPreview;
			},
			collapse: () => te(!0)
		});
	}
	P(ve), P(fe);
	var be = B(fe, 2), xe = (e) => {
		{
			let t = /* @__PURE__ */ F(() => Math.min(W(_), W(y)));
			ta(e, {
				get height() {
					return W(t);
				},
				get max() {
					return W(y);
				},
				start: O,
				change: (e) => {
					R(_, e, !0), D();
				}
			});
		}
	};
	X(be, (e) => {
		W(v) || e(xe);
	});
	var Se = B(be, 2);
	ua(Se, {
		get views() {
			return W(r).graphViews;
		},
		get actions() {
			return n().graphViewActions;
		},
		panelId: "pc-workspace-graph"
	});
	var Ce = B(Se, 2), we = z(Ce), Te = z(we);
	{
		let e = /* @__PURE__ */ F(() => W(r).runMeter ?? null);
		Co(Te, {
			get view() {
				return W(e);
			},
			open: () => {
				R(w, "run-details");
			}
		});
	}
	P(we);
	var M = B(we, 2);
	{
		let e = /* @__PURE__ */ F(() => W(r).graphViews?.active);
		ha(M, {
			get view() {
				return W(e);
			},
			get actions() {
				return n().graphViewActions;
			}
		});
	}
	var Ee = B(M, 2);
	xi(Ee, (e) => o = e, () => o);
	var N = B(Ee, 2), De = (e) => {
		var t = vc(), n = z(t, !0);
		P(t), V(() => Y(n, W(r).nativeDiagnostic)), J(e, t);
	};
	X(N, (e) => {
		W(r).nativeDiagnostic && e(De);
	}), xi(tc(B(N, 2), {
		get view() {
			return W(r).workflow;
		},
		get choices() {
			return W(r).nativeChoices;
		},
		get choose() {
			return n().chooseNative;
		},
		get manageSubgraphs() {
			return n().manageSubgraphs;
		},
		get readOnly() {
			return W(r).readOnly;
		},
		add: (e) => n().addNode?.(e)
	}), (e) => ee = e, () => ee), P(Ce), P(de), xi(de, (e) => s = e, () => s);
	var Oe = B(de, 2), Ae = (e) => {
		var t = kr();
		Rr(ln(t), () => W(r).graphViews?.active.key ?? W(r).graphId, (e) => {
			ra(e, {
				get width() {
					return W(S);
				},
				get max() {
					return W(x);
				},
				start: O,
				preview: (e) => R(b, e, !0),
				change: C
			});
		}), J(e, t);
	};
	X(Oe, (e) => {
		W(r).inspectorOpen && e(Ae);
	});
	var je = B(Oe, 2), Me = z(je), Ne = B(z(Me)), Pe = B(Ne);
	P(Me);
	var Fe = B(Me, 2), Ie = (e) => {
		let t = /* @__PURE__ */ F(() => W(r).commentDetails);
		Ua(e, {
			get comment() {
				return W(t).comment;
			},
			onPatch: (e) => n().commentDetails?.patch(W(t).selection, e),
			onCommand: (e) => n().commentDetails?.command(W(t).selection, e)
		});
	}, Le = (e) => {
		{
			let t = /* @__PURE__ */ F(() => W(r).nodeDetails ?? null);
			Ba(e, {
				get view() {
					return W(t);
				},
				get actions() {
					return n().nodeDetails;
				}
			});
		}
	};
	X(Fe, (e) => {
		W(r).commentDetails ? e(Ie) : e(Le, -1);
	}), P(je), xi(je, (e) => c = e, () => c), P(ue), xi(ue, (e) => a = e, () => a);
	var Re = B(ue, 2), ze = (e) => {
		var t = bc(), i = z(t), a = z(i), o = z(a), s = z(o, !0);
		P(o);
		var c = B(o);
		P(a);
		var l = B(a, 2), u = (e) => {
			{
				let t = /* @__PURE__ */ F(() => W(r).runDetails ?? null);
				yo(e, {
					get view() {
						return W(t);
					},
					get actions() {
						return n().runDetails;
					}
				});
			}
		}, d = (e) => {
			{
				let t = /* @__PURE__ */ F(() => W(r).rootWorkflow ?? W(r).workflow);
				sc(e, {
					get view() {
						return W(t);
					},
					get actions() {
						return n();
					}
				});
			}
		}, f = (e) => {
			var t = yc();
			ke(4), J(e, t);
		};
		X(l, (e) => {
			W(w) === "run-details" ? e(u) : W(w) === "workflow-setup" ? e(d, 1) : e(f, -1);
		}), P(i), xi(i, (e) => R(T, e), () => W(T)), P(t), V(() => {
			$(i, "aria-label", W(w) === "workflow-setup" ? "Workflow setup" : W(w) === "run-details" ? "Run details" : "Workspace guide"), Y(s, W(w) === "workflow-setup" ? "Workflow setup" : W(w) === "run-details" ? "Run details" : "Workspace guide");
		}), K("keydown", i, ie), G("paste", i, (e) => e.stopPropagation()), K("click", c, j), J(e, t);
	};
	X(Re, (e) => {
		W(w) && e(ze);
	});
	var He = B(Re, 2);
	Ps(He, {
		get view() {
			return W(r).nativeSearch;
		},
		get actions() {
			return n().nativeSearch;
		}
	});
	var Ue = B(He, 2);
	Rs(Ue, {
		get view() {
			return W(r).nativePinMenu;
		},
		get actions() {
			return n().nativePinMenu;
		}
	});
	var We = B(Ue, 2), Ge = (e) => {
		var t = xc(), i = z(t);
		Ho(z(i), {
			get view() {
				return W(r).portalManager;
			},
			get actions() {
				return n().portalManager;
			}
		}), P(i), P(t), K("keydown", i, (e) => re(e, "portalManager")), G("paste", i, (e) => e.stopPropagation()), J(e, t);
	};
	X(We, (e) => {
		W(r).portalManager && e(Ge);
	});
	var Ke = B(We, 2), qe = (e) => {
		var t = Sc(), i = z(t);
		Ts(z(i), {
			get view() {
				return W(r).subgraphManager;
			},
			get actions() {
				return n().subgraphManager;
			}
		}), P(i), P(t), K("keydown", i, (e) => re(e, "subgraphManager")), G("paste", i, (e) => e.stopPropagation()), J(e, t);
	};
	X(Ke, (e) => {
		W(r).subgraphManager && e(qe);
	});
	var Je = B(Ke, 2), Ye = (e) => {
		_c(e, {
			get view() {
				return W(r).importReview;
			},
			get actions() {
				return n();
			}
		});
	};
	return X(Je, (e) => {
		W(r).importReview && e(Ye);
	}), P(oe), xi(oe, (e) => i = e, () => i), V((e) => {
		se = ni(oe, 1, "pc-root pc-native-workspace svelte-1dr9aew", null, se, { "pc-native-flat": W(r).nativeFlatCanvas }), ce = ii(oe, "", ce, { "--pc-details-width": `${W(S)}px` }), pe = ni(fe, 1, "pc-preview-pane", null, pe, { "pc-preview-collapsed": W(v) }), me = ii(fe, "", me, e), $(ge, "aria-expanded", !W(v)), Y(_e, W(v) ? "Expand preview" : "Collapse preview"), $(ve, "hidden", W(v)), $(je, "hidden", !W(r).inspectorOpen);
	}, [() => ({ "--pc-preview-height": `${Math.min(W(_), W(y))}px` })]), K("click", ge, () => te(!W(v))), K("click", Ne, () => n().managePortals?.()), K("click", Pe, () => n().manageSubgraphs?.()), J(e, oe), Ve(ae);
}
vr(["click", "keydown"]);
//#endregion
//#region ui/entry.js
function Tc(e, t) {
	let n = jr(Gi, {
		target: e,
		props: { actions: t }
	});
	return Ft(), {
		...n.getLayers(),
		setComments: (e, t) => Ft(() => n.setComments(e, t)),
		setNodes: (e) => Ft(() => n.setNodes(e)),
		setGroups: (e) => Ft(() => n.setGroups(e)),
		setWires: (e, t, r) => Ft(() => n.setWires(e, t, r)),
		setPositions: (e, t) => Ft(() => n.setPositions(e, t)),
		destroy: () => Fr(n)
	};
}
function Ec(e, t) {
	let n = jr(wc, {
		target: e,
		props: { actions: t }
	});
	return Ft(), {
		...n.getParts(),
		update: (e) => Ft(() => n.update(e)),
		updateActions: (e) => Ft(() => n.updateActions(e)),
		revealPreview: () => Ft(() => n.revealPreview()),
		revealWorkflowSetup: () => Ft(() => n.revealWorkflowSetup()),
		focusCommentTitle: (e, t) => n.focusCommentTitle(e, t),
		destroy: () => Fr(n)
	};
}
//#endregion
export { Tc as mountCanvas, Ec as mountWorkbench };
