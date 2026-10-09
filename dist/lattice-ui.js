/*! Svelte runtime: Copyright (c) 2016-2025 Svelte Contributors. MIT license; see THIRD_PARTY_NOTICES.md. */
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region node_modules/svelte/src/constants.js
var e = {}, t = Symbol("uninitialized"), n = "http://www.w3.org/1999/xhtml", r = Array.isArray, i = Array.prototype.indexOf, a = Array.prototype.includes, o = Array.from, s = Object.defineProperty, c = Object.getOwnPropertyDescriptor, l = Object.getOwnPropertyDescriptors, u = Object.prototype, d = Array.prototype, f = Object.getPrototypeOf, p = Object.isExtensible, m = () => {};
function h(e) {
	for (var t = 0; t < e.length; t++) e[t]();
}
function g() {
	var e, t;
	return {
		promise: new Promise((n, r) => {
			e = n, t = r;
		}),
		resolve: e,
		reject: t
	};
}
var _ = 1024, v = 2048, y = 4096, b = 8192, x = 16384, S = 32768, C = 1 << 25, w = 65536, T = 1 << 19, E = 1 << 20, D = 1 << 25, ee = 65536, te = 1 << 21, ne = 1 << 22, O = 1 << 23, k = Symbol("$state"), A = Symbol("legacy props"), j = Symbol(""), re = Symbol("attributes"), ie = Symbol("class"), ae = Symbol("style"), oe = Symbol("text"), se = Symbol("form reset"), ce = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), le = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml");
function ue(e) {
	throw Error("https://svelte.dev/e/lifecycle_outside_component");
}
//#endregion
//#region node_modules/svelte/src/internal/client/errors.js
function de() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function fe(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function pe(e) {
	throw Error("https://svelte.dev/e/effect_in_teardown");
}
function me() {
	throw Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function he(e) {
	throw Error("https://svelte.dev/e/effect_orphan");
}
function ge() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function _e(e) {
	throw Error("https://svelte.dev/e/props_invalid_value");
}
function ve() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function ye() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function be() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function xe() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
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
function De(t) {
	if (t === null) throw Ce(), e;
	return N = t;
}
function Oe() {
	return De(/* @__PURE__ */ cn(N));
}
function P(t) {
	if (M) {
		if (/* @__PURE__ */ cn(N) !== null) throw Ce(), e;
		N = t;
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
function je(t) {
	if (!t || t.nodeType !== 8) throw Ce(), e;
	return t.data;
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
function Le(e, t, n, i, a = null, o = !1) {
	if (typeof e == "object" && e) {
		var s = t.get(e);
		if (s !== void 0) return s;
		if (e instanceof Map) return new Map(e);
		if (e instanceof Set) return new Set(e);
		if (r(e)) {
			var c = Array(e.length);
			t.set(e, c), a !== null && t.set(a, c);
			for (var l = 0; l < e.length; l += 1) {
				var d = e[l];
				l in e && (c[l] = Le(d, t, n, i, null, o));
			}
			return c;
		}
		if (f(e) === u) {
			c = {}, t.set(e, c), a !== null && t.set(a, c);
			for (var p of Object.keys(e)) c[p] = Le(e[p], t, n, i, null, o);
			return c;
		}
		if (e instanceof Date) return structuredClone(e);
		if (typeof e.toJSON == "function" && !o) return Le(e.toJSON(), t, n, i, e);
	}
	if (e instanceof EventTarget) return e;
	try {
		return structuredClone(e);
	} catch {
		return e;
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
		for (var r of n) yn(r);
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
	Ue = [], h(e);
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
	if (t === null) return Vn.f |= O, e;
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
var Ye = ~(v | y | _);
function Xe(e, t) {
	e.f = e.f & Ye | t;
}
function Ze(e) {
	e.f & 512 || e.deps === null ? Xe(e, _) : Xe(e, y);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
function Qe(e) {
	if (e !== null) for (let t of e) t.f & 2 && t.f & 65536 && (t.f ^= ee, Qe(t.deps));
}
function $e(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), Qe(e.deps), Xe(e, _);
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
	M && /* @__PURE__ */ sn(e) !== null && ln(e);
}
var rt = !1;
function it() {
	rt || (rt = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[se]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function at(e) {
	var t = Vn, n = U;
	Un(null), Wn(null);
	try {
		return e();
	} finally {
		Un(t), Wn(n);
	}
}
function ot(e, t, n, r = n) {
	e.addEventListener(t, () => at(n));
	let i = e[se];
	e[se] = i ? () => {
		i(), r(!0);
	} : () => r(!0), it();
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function st(e) {
	let t = 0, n = Gt(0), r;
	return () => {
		gn() && (W(n), Cn(() => (t === 0 && (r = dr(() => e(() => Yt(n)))), t += 1, () => {
			Ge(() => {
				--t, t === 0 && (r?.(), r = void 0, Yt(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var ct = w | T;
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
		}, this.parent = U.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = wn(() => {
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
			this.#a = Tn(() => this.#r(this.#e));
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		let t = this.#n.failed, { reset: n, invoke_onerror: r } = this.#v(e);
		Ge(r), t && (this.#s = Tn(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			t ? Te() : (t = !0, n && xe(), this.#s !== null && Mn(this.#s, () => {
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
		e && (this.is_pending = !0, this.#o = Tn(() => e(this.#e)), Ge(() => {
			var e = this.#c = document.createDocumentFragment(), t = on();
			e.append(t), this.#a = this.#S(() => Tn(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, Mn(this.#o, () => {
				this.#o = null;
			}), this.#x(I));
		}));
	}
	#b() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#l = 0, this.#a = Tn(() => {
				this.#r(this.#e);
			}), this.#u > 0) {
				var e = this.#c = document.createDocumentFragment();
				In(this.#a, e);
				let t = this.#n.pending;
				this.#o = Tn(() => t(this.#e));
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
		var t = U, n = Vn, r = Re;
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
		this.has_pending_snippet() ? (this.#u += e, this.#u === 0 && (this.#x(t), this.#o && Mn(this.#o, () => {
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
		this.#a &&= (kn(this.#a), null), this.#o &&= (kn(this.#o), null), this.#s &&= (kn(this.#s), null), M && (De(this.#t), ke(), De(Ae()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return Tn(() => {
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
	var e = U, t = Vn, n = Re, r = I;
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
	var n = 2 | v;
	return U !== null && (U.f |= T), {
		ctx: Re,
		deps: null,
		effects: null,
		equals: Me,
		f: n,
		fn: e,
		reactions: null,
		rv: 0,
		v: t,
		wv: 0,
		parent: U,
		ac: null
	};
}
var gt = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function _t(e, n, r) {
	let i = U;
	i === null && de();
	var a = void 0, o = Gt(t), s = !Vn, c = /* @__PURE__ */ new Set();
	return Sn(() => {
		var t = U, n = g();
		a = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== ce && n.reject(e);
			}).finally(pt);
		} catch (e) {
			n.reject(e), pt();
		}
		var r = I;
		if (s) {
			if (t.f & 32768) var l = mt();
			if (i.b?.is_rendered()) r.async_deriveds.get(t)?.reject(gt);
			else for (let e of c.values()) e.reject(gt);
			c.add(n), r.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), c.delete(n), t !== gt && (r.activate(), t ? (o.f |= O, qt(o, t)) : (o.f & 8388608 && (o.f ^= O), qt(o, e)), r.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), _n(() => {
		for (let e of c) e.reject(gt);
	}), new Promise((e) => {
		function t(n) {
			function r() {
				n === a ? e(o) : t(a);
			}
			n.then(r, r);
		}
		t(a);
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
		for (var n = 0; n < t.length; n += 1) kn(t[n]);
	}
}
function bt(e) {
	var n, r = U, i = e.parent;
	if (!zn && i !== null && e.v !== t && i.f & 24576) return Se(), e.v;
	Wn(i);
	try {
		e.f &= ~ee, yt(e), n = ir(e);
	} finally {
		Wn(r);
	}
	return n;
}
function xt(e) {
	var t = bt(e);
	!e.equals(t) && (e.wv = tr(), (!I?.is_fork || e.deps === null) && (I === null ? e.v = t : (I.capture(e, t, !0), Tt?.capture(e, t, !0)), e.deps === null)) ? Xe(e, _) : zn || (Et === null ? Ze(e) : (gn() || I?.is_fork) && Et.set(e, t));
}
function St(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && at(() => {
		t.ac.abort(ce), t.ac = null;
	}), t.fn !== null && (t.teardown = m), or(t, 0), Dn(t));
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
			for (var r of n.d) Xe(r, v), t(r);
			for (r of n.m) Xe(r, y), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, Mt++ > 1e3 && (this.#x(), It());
		for (let e of this.#u) this.#d.delete(e), Xe(e, v), this.schedule(e);
		for (let e of this.#d) Xe(e, y), this.schedule(e);
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
		e.f ^= _;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= _ : i & 4 ? t.push(r) : nr(r) && (i & 16 && this.#d.add(r), sr(r));
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), Xe(i, v), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), I = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) $e(e[t], this.#u, this.#d);
	}
	capture(e, n, r = !1) {
		e.v !== t && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [n, r]), Et?.set(e, n)), this.is_fork || (e.v = n);
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
		return (this.#s ??= g()).promise;
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
				if (At !== null && t === U && (Vn === null || !(Vn.f & 2))) return;
				if (n & 96) {
					if (!(n & 1024)) return;
					t.f ^= _;
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
		ge();
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
			if (!(r.f & 24576) && nr(r) && (Lt = /* @__PURE__ */ new Set(), sr(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && jn(r), Lt?.size > 0)) {
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
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), Xe(e, _);
		for (var n = e.first; n !== null;) Bt(n, t), n = n.next;
	}
}
function Vt(e) {
	Xe(e, _);
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
	return Vn !== null && (!Hn || Vn.f & 131072) && He() && Vn.f & 4325394 && (Gn === null || !Gn.has(e)) && be(), qt(e, n ? Zt(t) : t, jt);
}
function qt(e, t, n = null) {
	if (!e.equals(t)) {
		zn ? Ut.set(e, t) : Ut.has(e) || Ut.set(e, e.v);
		var r = Pt.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && bt(t), Et === null && Ze(t);
		}
		e.wv = tr(), Xt(e, v, n), He() && U !== null && U.f & 1024 && !(U.f & 96) && (Yn === null ? Xn([e]) : Yn.push(e)), !r.is_fork && Ht.size > 0 && !Wt && Jt();
	}
	return t;
}
function Jt() {
	Wt = !1;
	for (let e of Ht) {
		e.f & 1024 && Xe(e, y);
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
			var l = (c & v) === 0;
			if (l && Xe(s, t), c & 131072) Ht.add(s);
			else if (c & 2) {
				var u = s;
				Et?.delete(u), c & 65536 || (c & 512 && (U === null || !(U.f & 2097152)) && (s.f |= ee), Xt(u, y, n));
			} else if (l) {
				var d = s;
				c & 16 && Lt !== null && Lt.add(d), n === null ? zt(d) : n.push(d);
			}
		}
	}
}
function Zt(e) {
	if (typeof e != "object" || !e || k in e) return e;
	let n = f(e);
	if (n !== u && n !== d) return e;
	var i = /* @__PURE__ */ new Map(), a = r(e), o = /* @__PURE__ */ L(0), s = null, l = $n, p = (e) => {
		if ($n === l) return e();
		var t = Vn, n = $n;
		Un(null), er(l);
		var r = e();
		return Un(t), er(n), r;
	};
	return a && i.set("length", /* @__PURE__ */ L(e.length, s)), new Proxy(e, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && ve();
			var r = i.get(t);
			return r === void 0 ? p(() => {
				var e = /* @__PURE__ */ L(n.value, s);
				return i.set(t, e), e;
			}) : R(r, n.value, !0), !0;
		},
		deleteProperty(e, n) {
			var r = i.get(n);
			if (r === void 0) {
				if (n in e) {
					let e = p(() => /* @__PURE__ */ L(t, s));
					i.set(n, e), Yt(o);
				}
			} else R(r, t), Yt(o);
			return !0;
		},
		get(n, r, a) {
			if (r === k) return e;
			var o = i.get(r), l = r in n;
			if (o === void 0 && (!l || c(n, r)?.writable) && (o = p(() => /* @__PURE__ */ L(Zt(l ? n[r] : t), s)), i.set(r, o)), o !== void 0) {
				var u = W(o);
				return u === t ? void 0 : u;
			}
			return Reflect.get(n, r, a);
		},
		getOwnPropertyDescriptor(e, n) {
			var r = Reflect.getOwnPropertyDescriptor(e, n);
			if (r && "value" in r) {
				var a = i.get(n);
				a && (r.value = W(a));
			} else if (r === void 0) {
				var o = i.get(n), s = o?.v;
				if (o !== void 0 && s !== t) return {
					enumerable: !0,
					configurable: !0,
					value: s,
					writable: !0
				};
			}
			return r;
		},
		has(e, n) {
			if (n === k) return !0;
			var r = i.get(n), a = r !== void 0 && r.v !== t || Reflect.has(e, n);
			return (r !== void 0 || U !== null && (!a || c(e, n)?.writable)) && (r === void 0 && (r = p(() => /* @__PURE__ */ L(a ? Zt(e[n]) : t, s)), i.set(n, r)), W(r) === t) ? !1 : a;
		},
		set(e, n, r, l) {
			var u = i.get(n), d = n in e;
			if (a && n === "length") for (var f = r; f < u.v; f += 1) {
				var m = i.get(f + "");
				m === void 0 ? f in e && (m = p(() => /* @__PURE__ */ L(t, s)), i.set(f + "", m)) : R(m, t);
			}
			if (u === void 0) (!d || c(e, n)?.writable) && (u = p(() => /* @__PURE__ */ L(void 0, s)), R(u, Zt(r)), i.set(n, u));
			else {
				d = u.v !== t;
				var h = p(() => Zt(r));
				R(u, h);
			}
			var g = Reflect.getOwnPropertyDescriptor(e, n);
			if (g?.set && g.set.call(l, r), !d) {
				if (a && typeof n == "string") {
					var _ = i.get("length"), v = Number(n);
					Number.isInteger(v) && v >= _.v && R(_, v + 1);
				}
				Yt(o);
			}
			return !0;
		},
		ownKeys(e) {
			W(o);
			var n = Reflect.ownKeys(e).filter((e) => {
				var n = i.get(e);
				return n === void 0 || n.v !== t;
			});
			for (var [r, a] of i) a.v !== t && !(r in e) && n.push(r);
			return n;
		},
		setPrototypeOf() {
			ye();
		}
	});
}
function Qt(e) {
	try {
		if (typeof e == "object" && e && k in e) return e[k];
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
		nn = c(t, "firstChild").get, rn = c(t, "nextSibling").get, p(e) && (e[ie] = void 0, e[re] = null, e[ae] = void 0, e.__e = void 0), p(n) && (n[oe] = void 0);
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
	return t && fn(n), De(n), n;
}
function B(e, t = !1) {
	if (!M) {
		var n = /* @__PURE__ */ sn(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ cn(n) : n;
	}
	if (t) {
		if (N?.nodeType !== 3) {
			var r = on();
			return N?.before(r), De(r), r;
		}
		fn(N);
	}
	return N;
}
function V(e, t = 1, n = !1) {
	let r = M ? N : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ cn(r);
	if (!M) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = on();
			return r === null ? i?.after(a) : r.before(a), De(a), a;
		}
		fn(r);
	}
	return De(r), r;
}
function ln(e) {
	e.textContent = "";
}
function un() {
	return !1;
}
function dn(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function fn(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/effects.js
function pn(e) {
	U === null && (Vn === null && he(e), me()), zn && pe(e);
}
function mn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function hn(e, t) {
	var n = U;
	n !== null && n.f & 8192 && (e |= b);
	var r = {
		ctx: Re,
		deps: null,
		nodes: null,
		f: e | v | 512,
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
			throw kn(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= w));
	}
	if (i !== null && (i.parent = n, n !== null && mn(i, n), Vn !== null && Vn.f & 2 && !(e & 64))) {
		var a = Vn;
		(a.effects ??= []).push(i);
	}
	return r;
}
function gn() {
	return Vn !== null && !Hn;
}
function _n(e) {
	let t = hn(8, null);
	return Xe(t, _), t.teardown = e, t;
}
function vn(e) {
	pn("$effect");
	var t = U.f;
	if (!Vn && t & 32 && Re !== null && !Re.i) {
		var n = Re;
		(n.e ??= []).push(e);
	} else return yn(e);
}
function yn(e) {
	return hn(4 | E, e);
}
function bn(e) {
	Pt.ensure();
	let t = hn(64 | T, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? Mn(t, () => {
			kn(t), n(void 0);
		}) : (kn(t), n(void 0));
	});
}
function xn(e) {
	return hn(4, e);
}
function Sn(e) {
	return hn(ne | T, e);
}
function Cn(e, t = 0) {
	return hn(8 | t, e);
}
function H(e, t = [], n = [], r = []) {
	dt(r, t, n, (t) => {
		hn(8, () => {
			e(...t.map(W));
		});
	});
}
function wn(e, t = 0) {
	return hn(16 | t, e);
}
function Tn(e) {
	return hn(32 | T, e);
}
function En(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = zn, n = Vn;
		Bn(!0), Un(null);
		try {
			t.call(null);
		} finally {
			Bn(e), Un(n);
		}
	}
}
function Dn(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && at(() => {
			e.abort(ce);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : kn(n, t), n = r;
	}
}
function On(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || kn(t), t = n;
	}
}
function kn(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (An(e.nodes.start, e.nodes.end), n = !0), e.f |= C, Dn(e, t && !n), or(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	En(e), e.f ^= C, e.f |= x;
	var i = e.parent;
	i !== null && i.first !== null && jn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function An(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ cn(e);
		e.remove(), e = n;
	}
}
function jn(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Mn(e, t, n = !0) {
	var r = [];
	Nn(e, r, !0);
	var i = () => {
		n && kn(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function Nn(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= b;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				Nn(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function Pn(e) {
	Fn(e, !0);
}
function Fn(e, t) {
	if (e.f & 8192) {
		e.f ^= b, e.f & 1024 || (Xe(e, v), Pt.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = !!(n.f & 65536) || !!(n.f & 32);
			Fn(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function In(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ cn(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/legacy.js
var Ln = null, Rn = !1, zn = !1;
function Bn(e) {
	zn = e;
}
var Vn = null, Hn = !1;
function Un(e) {
	Vn = e;
}
var U = null;
function Wn(e) {
	U = e;
}
var Gn = null;
function Kn(e) {
	Vn !== null && (Gn ??= /* @__PURE__ */ new Set()).add(e);
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
	if (t & 2 && (e.f &= ~ee), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (nr(a) && xt(a), a.wv > e.wv) return !0;
		}
		t & 512 && Et === null && Xe(e, _);
	}
	return !1;
}
function rr(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Gn !== null && Gn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? rr(a, t, !1) : t === a && (n ? Xe(a, v) : a.f & 1024 && Xe(a, y), zt(a));
	}
}
function ir(e) {
	var t = qn, n = Jn, r = Yn, i = Vn, a = Gn, o = Re, s = Hn, c = $n, l = e.f;
	qn = null, Jn = 0, Yn = null, Vn = l & 96 ? null : e, Gn = null, ze(e.ctx), Hn = !1, $n = ++Qn, e.ac !== null && (at(() => {
		e.ac.abort(ce);
	}), e.ac = null);
	try {
		e.f |= te;
		var u = e.fn, d = u();
		e.f |= S;
		var f = e.deps, p = I?.is_fork;
		if (qn !== null) {
			var m;
			if (p || or(e, Jn), f !== null && Jn > 0) for (f.length = Jn + qn.length, m = 0; m < qn.length; m++) f[Jn + m] = qn[m];
			else e.deps = f = qn;
			if (gn() && e.f & 512) for (m = Jn; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && Jn < f.length && (or(e, Jn), f.length = Jn);
		if (He() && Yn !== null && !Hn && f !== null && !(e.f & 6146)) for (m = 0; m < Yn.length; m++) rr(Yn[m], e);
		if (i !== null && i !== e) {
			if (Qn++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = Qn;
			if (t !== null) for (let e of t) e.rv = Qn;
			Yn !== null && (r === null ? r = Yn : r.push(...Yn));
		}
		return e.f & 8388608 && (e.f ^= O), d;
	} catch (e) {
		return qe(e);
	} finally {
		e.f ^= te, qn = t, Jn = n, Yn = r, Vn = i, Gn = a, ze(o), Hn = s, $n = c;
	}
}
function ar(e, n) {
	let r = n.reactions;
	if (r !== null) {
		var o = i.call(r, e);
		if (o !== -1) {
			var s = r.length - 1;
			s === 0 ? r = n.reactions = null : (r[o] = r[s], r.pop());
		}
	}
	if (r === null && n.f & 2 && (qn === null || !a.call(qn, n))) {
		var c = n;
		c.f & 512 && (c.f ^= 512, c.f &= ~ee), c.v !== t && Ze(c), c.ac !== null && at(() => {
			c.ac.abort(ce), c.ac = null, Xe(c, v);
		}), St(c), or(c, 0);
	}
}
function or(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) ar(e, n[r]);
}
function sr(e) {
	var t = e.f;
	if (!(t & 16384)) {
		Xe(e, _);
		var n = U, r = Rn;
		U = e, Rn = !(t & 96);
		try {
			t & 16777232 ? On(e) : Dn(e), En(e);
			var i = ir(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = Zn;
		} finally {
			Rn = r, U = n;
		}
	}
}
async function cr() {
	await Promise.resolve(), Ft();
}
function W(e) {
	var t = !!(e.f & 2);
	if (Ln?.add(e), Vn !== null && !Hn && !(U !== null && U.f & 16384) && (Gn === null || !Gn.has(e))) {
		var n = Vn.deps;
		if (Vn.f & 2097152) e.rv < Qn && (e.rv = Qn, qn === null && n !== null && n[Jn] === e ? Jn++ : qn === null ? qn = [e] : qn.push(e));
		else {
			Vn.deps ??= [], a.call(Vn.deps, e) || Vn.deps.push(e);
			var r = e.reactions;
			r === null ? e.reactions = [Vn] : a.call(r, Vn) || r.push(Vn);
		}
	}
	if (zn && Ut.has(e)) return Ut.get(e);
	if (t) {
		var i = e;
		if (zn) {
			var o = i.v;
			return (!(i.f & 1024) && i.reactions !== null || ur(i)) && (o = bt(i)), Ut.set(i, o), o;
		}
		var s = !(i.f & 512) && !Hn && Vn !== null && (Rn || !!(Vn.f & 512)), c = (i.f & S) === 0;
		nr(i) && (s && (i.f |= 512), xt(i)), s && !c && (Ct(i), lr(i));
	}
	if (Et?.has(e)) return Et.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function lr(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (Ct(t), lr(t));
}
function ur(e) {
	if (e.v === t) return !0;
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
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
var fr = Symbol("events"), pr = /* @__PURE__ */ new Set(), mr = /* @__PURE__ */ new Set();
function hr(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || br.call(t, e), !e.cancelBubble) return at(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Ge(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function gr(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = hr(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && _n(() => {
		t.removeEventListener(e, o, a);
	});
}
function G(e, t, n) {
	(t[fr] ??= {})[e] = n;
}
function _r(e) {
	for (var t = 0; t < e.length; t++) pr.add(e[t]);
	for (var n of mr) n(e);
}
var vr = null, yr = !1;
function br(e) {
	var t = this, n = t.ownerDocument, r = e.type, i = e.composedPath?.() || [], a = i[0] || e.target;
	vr = e, yr || (yr = !0, setTimeout(() => {
		yr = !1, vr = null;
	}));
	var o = 0, c = vr === e && e[fr];
	if (c) {
		var l = i.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[fr] = t;
			return;
		}
		var u = i.indexOf(t);
		if (u === -1) return;
		l <= u && (o = l);
	}
	if (a = i[o] || e.target, a !== t) {
		s(e, "currentTarget", {
			configurable: !0,
			get() {
				return a || n;
			}
		});
		var d = Vn, f = U;
		Un(null), Wn(null);
		try {
			for (var p, m = []; a !== null && a !== t;) {
				try {
					var h = a[fr]?.[r];
					h != null && (!a.disabled || e.target === a) && h.call(a, e);
				} catch (e) {
					p ? m.push(e) : p = e;
				}
				if (e.cancelBubble) break;
				o++, a = o < i.length ? i[o] : null;
			}
			if (p) {
				for (let e of m) queueMicrotask(() => {
					throw e;
				});
				throw p;
			}
		} finally {
			e[fr] = t, delete e.currentTarget, Un(d), Wn(f);
		}
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/reconciler.js
var xr = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function Sr(e) {
	return xr?.createHTML(e) ?? e;
}
function Cr(e) {
	var t = dn("template");
	return t.innerHTML = Sr(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function wr(e, t) {
	var n = U;
	n.nodes === null && (n.nodes = {
		start: e,
		end: t,
		a: null,
		t: null
	});
}
/*#__NO_SIDE_EFFECTS__*/
function K(e, t) {
	var n = !!(t & 1), r = !!(t & 2), i, a = !e.startsWith("<!>");
	return () => {
		if (M) return wr(N, null), N;
		i === void 0 && (i = Cr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ sn(i)));
		var t = r || tn ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ sn(t), s = t.lastChild;
			wr(o, s);
		} else wr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Tr(e, t, n = "svg") {
	var r = !e.startsWith("<!>"), i = !!(t & 1), a = `<${n}>${r ? e : "<!>" + e}</${n}>`, o;
	return () => {
		if (M) return wr(N, null), N;
		if (!o) {
			var e = /* @__PURE__ */ sn(Cr(a));
			if (i) for (o = document.createDocumentFragment(); /* @__PURE__ */ sn(e);) o.appendChild(/* @__PURE__ */ sn(e));
			else o = /* @__PURE__ */ sn(e);
		}
		var t = o.cloneNode(!0);
		if (i) {
			var n = /* @__PURE__ */ sn(t), r = t.lastChild;
			wr(n, r);
		} else wr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Er(e, t) {
	return /* @__PURE__ */ Tr(e, t, "svg");
}
function Dr(e = "") {
	if (!M) {
		var t = on(e + "");
		return wr(t, t), t;
	}
	var n = N;
	return n.nodeType === 3 ? fn(n) : (n.before(n = on()), De(n)), wr(n, n), n;
}
function Or() {
	if (M) return wr(N, null), N;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = on();
	return e.append(t, n), wr(t, n), e;
}
function q(e, t) {
	if (M) {
		var n = U;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = N), Oe();
	} else e !== null && e.before(t);
}
function kr() {
	if (M && N && N.nodeType === 8 && N.textContent?.startsWith("$")) {
		let e = N.textContent.substring(1);
		return Oe(), e;
	}
	return (window.__svelte ??= {}).uid ??= 1, `c${window.__svelte.uid++}`;
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var Ar = ["touchstart", "touchmove"];
function jr(e) {
	return Ar.includes(e);
}
function J(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[oe] ??= e.nodeValue) && (e[oe] = n, e.nodeValue = `${n}`);
}
function Mr(e, t) {
	return Pr(e, t);
}
var Nr = /* @__PURE__ */ new Map();
function Pr(t, { target: n, anchor: r, props: i = {}, events: a, context: s, intro: c = !0, transformError: l }) {
	an();
	var u = void 0, d = bn(() => {
		var c = r ?? n.appendChild(on());
		lt(c, { pending: () => {} }, (n) => {
			Be({});
			var r = Re;
			if (s && (r.c = s), a && (i.$$events = a), M && wr(n, null), u = t(n, i) || {}, M && (U.nodes.end = N, N === null || N.nodeType !== 8 || N.data !== "]")) throw Ce(), e;
			Ve();
		}, l);
		var d = /* @__PURE__ */ new Set(), f = (e) => {
			for (var t = 0; t < e.length; t++) {
				var r = e[t];
				if (!d.has(r)) {
					d.add(r);
					var i = jr(r);
					for (let e of [n, document]) {
						var a = Nr.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), Nr.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, br, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return f(o(pr)), mr.add(f), () => {
			for (var e of d) for (let r of [n, document]) {
				var t = Nr.get(r), i = t.get(e);
				--i == 0 ? (r.removeEventListener(e, br), t.delete(e), t.size === 0 && Nr.delete(r)) : t.set(e, i);
			}
			mr.delete(f), c !== r && c.parentNode?.removeChild(c);
		};
	});
	return Fr.set(u, d), u;
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
			if (n) Pn(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (Pn(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
			}
			for (let [t, n] of this.#e) {
				if (this.#e.delete(t), t === e) break;
				let r = this.#n.get(n);
				r && (kn(r.effect), this.#n.delete(n));
			}
			for (let [e, r] of this.#t) {
				if (e === t || this.#r.has(e)) continue;
				let i = () => {
					if (Array.from(this.#e.values()).includes(e)) {
						var t = document.createDocumentFragment();
						In(r, t), t.append(on()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else kn(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), Mn(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (kn(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = I, r = un();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = on();
				i.append(a), this.#n.set(e, {
					effect: Tn(() => t(a)),
					fragment: i
				});
			} else this.#t.set(e, Tn(() => t(this.anchor)));
		}
		if (this.#e.set(n, e), r) {
			for (let [t, r] of this.#t) t === e ? n.unskip_effect(r) : n.skip_effect(r);
			for (let [t, r] of this.#n) t === e ? n.unskip_effect(r.effect) : n.skip_effect(r.effect);
			n.oncommit(this.#a), n.ondiscard(this.#o);
		} else M && (this.anchor = N), this.#a(n);
	}
};
function Rr(e) {
	Re === null && ue("onMount"), vn(() => {
		let t = dr(e);
		if (typeof t == "function") return t;
	});
}
function zr(e) {
	Re === null && ue("onDestroy"), Rr(() => () => dr(e));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
function Y(e, t, n = !1) {
	var r;
	M && (r = N, Oe());
	var i = new Lr(e), a = n ? w : 0;
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
	wn(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
function Br(e, t) {
	return t;
}
function Vr(e, t, n) {
	for (var r = [], i = t.length, a, s = t.length, c = 0; c < i; c++) {
		let n = t[c];
		Mn(n, () => {
			if (a) {
				if (a.pending.delete(n), a.done.add(n), a.pending.size === 0) {
					var t = e.outrogroups;
					Hr(e, o(a.done)), t.delete(a), t.size === 0 && (e.outrogroups = null);
				}
			} else --s;
		}, !1);
	}
	if (s === 0) {
		var l = r.length === 0 && n !== null && e.pending.size === 0;
		if (l) {
			var u = n, d = u.parentNode;
			ln(d), d.append(u), e.items.clear();
		}
		Hr(e, t, !l);
	} else a = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(a);
}
function Hr(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= D, In(a, document.createDocumentFragment())) : kn(t[i], n);
	}
}
var Ur;
function X(e, t, n, i, a, s = null) {
	var c = e, l = /* @__PURE__ */ new Map();
	if (t & 4) {
		var u = e;
		c = M ? De(/* @__PURE__ */ sn(u)) : u.appendChild(on());
	}
	M && Oe();
	var d = null, f = /* @__PURE__ */ vt(() => {
		var e = n();
		return r(e) ? e : e == null ? [] : o(e);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, Gr(v, p, c, t, i), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= D, qr(d, null, c)) : Pn(d) : Mn(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: wn(() => {
			p = W(f);
			var e = p.length;
			let r = !1;
			M && je(c) === "[!" != (e === 0) && (c = Ae(), De(c), Ee(!1), r = !0);
			for (var o = /* @__PURE__ */ new Set(), u = I, v = un(), y = 0; y < e; y += 1) {
				M && N.nodeType === 8 && N.data === "]" && (c = N, r = !0, Ee(!1));
				var b = p[y], x = i(b, y), S = h ? null : l.get(x);
				S ? (S.v && qt(S.v, b), S.i && qt(S.i, y), v && u.unskip_effect(S.e)) : (S = Kr(l, h ? c : Ur ??= on(), b, x, y, a, t, n), h || (S.e.f |= D), l.set(x, S)), o.add(x);
			}
			if (e === 0 && s && !d && (h ? d = Tn(() => s(c)) : (d = Tn(() => s(Ur ??= on())), d.f |= D)), e > o.size && fe("", "", ""), M && e > 0 && De(Ae()), !h) {
				if (m.set(u, o), v) {
					for (let [e, t] of l) o.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			r && Ee(!0), W(f);
		}),
		flags: t,
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
function Gr(e, t, n, r, i) {
	var a = !!(r & 8), s = t.length, c = e.items, l = Wr(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (a) for (v = 0; v < s; v += 1) h = t[v], g = i(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = i(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (Pn(_), a && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= D, _ === l) qr(_, null, n);
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
		for (let t of e.outrogroups) t.pending.size === 0 && (Hr(e, o(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var w = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || w.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && w.push(l), l = Wr(l.next);
		var T = w.length;
		if (T > 0) {
			var E = r & 4 && s === 0 ? n : null;
			if (a) {
				for (v = 0; v < T; v += 1) w[v].nodes?.a?.measure();
				for (v = 0; v < T; v += 1) w[v].nodes?.a?.fix();
			}
			Vr(e, w, E);
		}
	}
	a && Ge(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Kr(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? Gt(n) : /* @__PURE__ */ Kt(n, !1, !1) : null, l = o & 2 ? Gt(i) : null;
	return {
		v: c,
		i: l,
		e: Tn(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function qr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ cn(r);
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
function Z(e, t, n, r, i, a) {
	var o = e[ie];
	if (M || o !== n || o === void 0) {
		var s = $r(n, r, a);
		(!M || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[ie] = n;
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
	var i = e[ae];
	if (M || i !== t) {
		var a = ni(t, r);
		(!M || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[ae] = t;
	} else r && (Array.isArray(r) ? (ri(e, n?.[0], r[0]), ri(e, n?.[1], r[1], "important")) : ri(e, n, r));
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function ai(e, t, n = !1) {
	if (e.multiple) {
		if (t == null) return;
		if (!r(t)) return we();
		for (var i of e.options) i.selected = t.includes(si(i));
	} else {
		for (i of e.options) if ($t(si(i), t)) {
			i.selected = !0;
			return;
		}
		(!n || t !== void 0) && (e.selectedIndex = -1);
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
	}), _n(() => {
		t.disconnect();
	});
}
function si(e) {
	return "__value" in e ? e.__value : e.value;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var ci = Symbol("is custom element"), li = Symbol("is html"), ui = le ? "link" : "LINK", di = le ? "progress" : "PROGRESS";
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
		e[se] = n, Ge(n), it();
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
	M && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === ui) || i[t] !== (i[t] = n) && (t === "loading" && (e[j] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && gi(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function mi(e) {
	return e[re] ??= {
		[ci]: e.nodeName.includes("-"),
		[li]: e.namespaceURI === n
	};
}
var hi = /* @__PURE__ */ new Map();
function gi(e) {
	var t = e.getAttribute("is") || e.nodeName, n = hi.get(t);
	if (n) return n;
	hi.set(t, n = []);
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var o in r = l(i), r) r[o].set && o !== "innerHTML" && o !== "textContent" && o !== "innerText" && n.push(o);
		i = f(i);
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
	}), (M && e.defaultValue !== e.value || dr(t) == null && e.value) && (n(vi(e) ? yi(e.value) : e.value), I !== null && r.add(I)), Cn(() => {
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
	return e === t || e?.[k] === t;
}
function xi(e = {}, t, n, r) {
	var i = Re.r, a = U;
	return xn(() => {
		var o, s;
		return Cn(() => {
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
	var i = !0, a = !!(n & 8), o = !!(n & 16), s = r, l = !0, u = void 0, d = () => o && i ? (u ??= /* @__PURE__ */ ht(r), W(u)) : (l && (l = !1, s = o ? dr(r) : r), s);
	let f;
	if (a) {
		var p = k in e || A in e;
		f = c(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	a ? [m, h] = tt(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && _e(t), f(m)));
	var g = i ? () => {
		var n = e[t];
		return n === void 0 ? d() : (l = !0, n);
	} : () => {
		var n = e[t];
		return n !== void 0 && (s = void 0), n === void 0 ? s : n;
	};
	if (i && !(n & 4)) return g;
	if (f) {
		var _ = e.$$legacy;
		return (function(e, t) {
			return arguments.length > 0 ? ((!i || !t || _ || h) && f(t ? g() : e), e) : g();
		});
	}
	var v = !1, y = (n & 1 ? ht : vt)(() => (v = !1, g()));
	a && W(y);
	var b = U;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? W(y) : i && a ? Zt(e) : e;
			return R(y, n), v = !0, s !== void 0 && (s = n), e;
		}
		return zn && v || b.f & 16384 ? y.v : W(y);
	});
}
var Ci = /* @__PURE__ */ K("<article class=\"pc-workflow-starter\"><strong> </strong><p> </p> <small> </small> <button class=\"menu_button\"> </button></article>"), wi = /* @__PURE__ */ K("<small>No supported operations yet. Reference-based voice matching is a future candidate.</small>"), Ti = /* @__PURE__ */ K("<button class=\"menu_button\"> <small> </small></button>"), Ei = /* @__PURE__ */ K("<button class=\"menu_button\" draggable=\"true\"> <small>· legacy</small></button>"), Di = /* @__PURE__ */ K("<details class=\"pc-workflow-family\"><summary> </summary><p> </p> <!> <!> <!></details>"), Oi = /* @__PURE__ */ K("<label>Workflow mode <select aria-label=\"Workflow mode\" class=\"text_pole\"><option>Legacy · Replace prompt</option><option>Native · Guidance and reviewed reply</option></select></label> <h3>Workflow examples</h3> <!> <h3>Node families</h3> <!>", 1), ki = /* @__PURE__ */ K("<option> </option>"), Ai = /* @__PURE__ */ K("<label> <select class=\"text_pole\"><option>Choose a connection</option><!></select></label> <label> <input class=\"text_pole\" placeholder=\"Use profile model\"/></label>", 1), ji = /* @__PURE__ */ K("<p class=\"pc-error\"> </p>"), Mi = /* @__PURE__ */ K("<small> </small>"), Ni = /* @__PURE__ */ K("<button class=\"menu_button\"> </button>"), Pi = /* @__PURE__ */ K("<label>Model role<input class=\"text_pole\"/></label> <label>Node connection override<select class=\"text_pole\"><option>Use role binding</option><!></select></label> <label>Node model override<input class=\"text_pole\" placeholder=\"Use bound model\"/></label> <small> </small>", 1), Fi = /* @__PURE__ */ K("<select class=\"text_pole\"></select>"), Ii = /* @__PURE__ */ K("<input type=\"checkbox\"/>"), Li = /* @__PURE__ */ K("<input class=\"text_pole\" type=\"number\"/>"), Ri = /* @__PURE__ */ K("<textarea class=\"text_pole\" readonly=\"\"></textarea>"), zi = /* @__PURE__ */ K("<textarea class=\"text_pole\"></textarea>"), Bi = /* @__PURE__ */ K("<p class=\"pc-error\" role=\"alert\"> </p>"), Vi = /* @__PURE__ */ K("<small>One literal phrase per line. Imported objects use one JSON object per line with a \"phrase\" field; keep their other fields to preserve metadata. Quote a literal phrase that starts with &#123;, [ or &quot; as a JSON string.</small> <!>", 1), Hi = /* @__PURE__ */ K("<label> <!></label> <!>", 1), Ui = /* @__PURE__ */ K("<small>Protected literal pins reserve every source message containing an exact match verbatim. A missing pin reports PIN_MISSING. Source IDs are for inspection.</small>"), Wi = /* @__PURE__ */ K("<div class=\"pc-workflow-editor\"><p> </p> <p> </p> <label>Alias<input class=\"text_pole\" data-alias=\"\" maxlength=\"80\"/></label> <button class=\"menu_button\">Reset alias</button> <label><input type=\"checkbox\"/> Compact card</label> <label><input type=\"checkbox\"/> Enabled</label> <small>Disabled operations block preflight; they do not bypass.</small> <!> <!> <button class=\"menu_button\">Duplicate operation</button> <button class=\"menu_button pc-danger\">Delete operation</button> <!> <!></div>"), Gi = /* @__PURE__ */ K("<button class=\"menu_button\"> </button> <!>", 1), Ki = /* @__PURE__ */ K("<p role=\"status\"> </p>"), qi = /* @__PURE__ */ K("<small>Diagnostic preview truncated.</small>"), Ji = /* @__PURE__ */ K("<h4> </h4><pre> </pre> <!>", 1), Yi = /* @__PURE__ */ K("<!> <button class=\"menu_button\">Apply selected reviewed terminal</button> <button class=\"menu_button\">Reject candidate</button> <small>Apply rechecks the current source. This diagnostic preview is for inspection.</small>", 1), Xi = /* @__PURE__ */ K("<!> <!> <!>", 1), Zi = /* @__PURE__ */ K("<h4>Computed guidance</h4><pre> </pre>", 1), Qi = /* @__PURE__ */ K("<div class=\"pc-workflow-comparison\"><div>Original<pre> </pre></div><div>Candidate<pre> </pre></div></div> <!> <button class=\"menu_button\">Apply reviewed candidate</button> <button class=\"menu_button\">Reject candidate</button> <small>Apply rechecks source freshness. Other memory extensions may already have consumed the original; saving does not confirm durability.</small>", 1), $i = /* @__PURE__ */ K("<!> <!> <details><summary>Findings and changes</summary><pre> </pre></details> <details><summary>Reports and request trace</summary><pre> </pre></details>", 1), ea = /* @__PURE__ */ K("<h4 class=\"pc-workflow-result\">Workflow result</h4> <!> <p> </p> <p> </p> <!>", 1), ta = /* @__PURE__ */ K("<h3> </h3> <p> </p> <strong> </strong> <!> <button class=\"menu_button\"> </button> <small> </small> <!> <button class=\"menu_button\"> </button> <!> <!> <h4>Inspect operations</h4> <!> <!> <!> <!> <!>", 1), na = /* @__PURE__ */ K("<section class=\"pc-workflows\"><!></section>");
function ra(e, t) {
	Be(t, !0);
	let n = Si(t, "mode", 3, "setup"), r = /* @__PURE__ */ L(null), i = /* @__PURE__ */ L(null);
	function a(e) {
		(e.graphId !== W(r)?.graphId || e.selectedId !== W(r)?.selectedId) && R(i, null), R(r, e);
	}
	let o = (e) => e.split("\n").filter((e) => e.trim());
	function s(e, n) {
		let r = t.actions.editRules(e, n);
		R(i, r ? {
			text: n,
			error: r
		} : null, !0);
	}
	var c = { update: a }, l = Or(), u = B(l), d = (e) => {
		var a = na(), c = z(a), l = (e) => {
			var n = Oi(), i = B(n), a = V(z(i)), o = z(a);
			o.value = o.__value = "legacy";
			var s = V(o);
			s.value = s.__value = "native", P(a);
			var c;
			oi(a), P(i);
			var l = V(i, 4);
			X(l, 17, () => W(r).starters, (e) => e.id, (e, n) => {
				var r = Ci(), i = z(r), a = z(i, !0);
				P(i);
				var o = V(i), s = z(o, !0);
				P(o);
				var c = V(o, 2), l = z(c);
				P(c);
				var u = V(c, 2), d = z(u);
				P(u), P(r), H((e) => {
					J(a, W(n).title), J(s, W(n).purpose), J(l, `${W(n).phase === "pre" ? "Before reply · Guidance" : "After reply · Reviewed reply"} · Roles: ${e ?? ""} · Maximum ${W(n).callBound ?? ""} auxiliary requests`), J(d, `Install ${W(n).title ?? ""}`);
				}, [() => W(n).roles.join(", ") || "None"]), G("click", u, () => t.actions.install(W(n).id)), q(e, r);
			}), X(V(l, 4), 17, () => W(r).families, (e) => e.name, (e, n) => {
				var i = Di(), a = z(i), o = z(a, !0);
				P(a);
				var s = V(a), c = z(s, !0);
				P(s);
				var l = V(s, 2), u = (e) => {
					q(e, wi());
				};
				Y(l, (e) => {
					W(n).name === "Transpose" && e(u);
				});
				var d = V(l, 2);
				X(d, 17, () => W(n).operations, (e) => e.id, (e, n) => {
					var i = Ti(), a = z(i), o = V(a), s = z(o);
					P(o), P(i), H(() => {
						i.disabled = !W(r).native || !W(n).compatible, $(i, "title", W(r).native ? W(n).compatible ? "Add operation" : "This operation requires the " + W(n).phase + " phase." : "Install a native example first; legacy controls remain below."), J(a, `${W(n).title ?? ""} `), J(s, `· ${W(n).phase ?? ""}`);
					}), G("click", i, () => t.actions.addNode(W(n).id)), q(e, i);
				});
				var f = V(d, 2), p = (e) => {
					var r = Or();
					X(B(r), 17, () => W(n).legacy, (e) => e.id, (e, n) => {
						var r = Ei(), i = z(r);
						ke(), P(r), H(() => {
							$(r, "aria-label", "Add legacy " + W(n).title), J(i, `${W(n).title ?? ""} `);
						}), gr("dragstart", r, (e) => e.dataTransfer?.setData("application/x-prompt-canvas", JSON.stringify({
							kind: "block",
							type: W(n).id
						}))), G("click", r, () => t.actions.addLegacyNode(W(n).id)), q(e, r);
					}), q(e, r);
				};
				Y(f, (e) => {
					W(r).native || e(p);
				}), P(i), H(() => {
					i.open = W(r).native, J(o, W(n).name), J(c, W(n).description);
				}), q(e, i);
			}), H(() => {
				c !== (c = W(r).workflowMode) && (a.value = (a.__value = W(r).workflowMode) ?? "", ai(a, W(r).workflowMode));
			}), G("change", a, (e) => t.actions.setMode(e.currentTarget.value)), q(e, n);
		}, u = (e) => {
			var n = ta(), a = B(n), c = z(a, !0);
			P(a);
			var l = V(a, 2), u = z(l, !0);
			P(l);
			var d = V(l, 2), f = z(d);
			P(d);
			var p = V(d, 2);
			X(p, 17, () => W(r).roles, (e) => e.name, (e, n) => {
				var i = Ai(), a = B(i), o = z(a), s = V(o), c = z(s);
				c.value = c.__value = "", X(V(c), 17, () => W(r).profiles, (e) => e.id, (e, t) => {
					var n = ki(), r = z(n, !0);
					P(n);
					var i = {};
					H(() => {
						J(r, W(t).name), i !== (i = W(t).id) && (n.value = (n.__value = W(t).id) ?? "");
					}), q(e, n);
				}), P(s);
				var l;
				oi(s), P(a);
				var u = V(a, 2), d = z(u), f = V(d);
				Q(f), P(u), H(() => {
					J(o, `${W(n).name ?? ""} connection `), $(s, "aria-label", W(n).name + " connection"), l !== (l = W(n).profileId) && (s.value = (s.__value = W(n).profileId) ?? "", ai(s, W(n).profileId)), J(d, `${W(n).name ?? ""} model override`), fi(f, W(n).model);
				}), G("change", s, (e) => t.actions.bindRole(W(n).name, e.currentTarget.value, W(n).model)), G("input", f, (e) => t.actions.bindRole(W(n).name, W(n).profileId, e.currentTarget.value)), q(e, i);
			});
			var m = V(p, 2), h = z(m);
			P(m);
			var g = V(m, 2), _ = z(g);
			P(g);
			var v = V(g, 2);
			X(v, 17, () => W(r).issues, Br, (e, t) => {
				var n = ji(), r = z(n, !0);
				P(n), H(() => J(r, W(t))), q(e, n);
			});
			var y = V(v, 2), b = z(y, !0);
			P(y);
			var x = V(y, 2), S = (e) => {
				var t = Mi(), n = z(t);
				P(t), H(() => J(n, `Test workflow does not publish guidance. A later Send reruns the workflow and may incur up to ${W(r).callBound ?? ""} auxiliary requests again.`)), q(e, t);
			};
			Y(x, (e) => {
				W(r).phase === "pre" && e(S);
			});
			var C = V(x, 2);
			X(C, 17, () => W(r).groups, (e) => e.id, (e, n) => {
				var r = Ni(), i = z(r);
				P(r), H(() => J(i, `${W(n).collapsed ? "Open" : "Fold"} ${W(n).title ?? ""} formation · Surface · maximum ${W(n).callBound ?? ""} ${W(n).callBound === 1 ? "request" : "requests"}`)), G("click", r, () => t.actions.expand(W(n).id)), q(e, r);
			});
			var w = V(C, 4);
			X(w, 17, () => W(r).nodes, (e) => e.id, (e, n) => {
				var a = Gi(), c = B(a), l = z(c);
				P(c);
				var u = V(c, 2), d = (e) => {
					var a = Wi(), c = z(a), l = z(c);
					P(c);
					var u = V(c, 2), d = z(u);
					P(u);
					var f = V(u, 2), p = V(z(f));
					Q(p), P(f);
					var m = V(f, 2), h = V(m, 2), g = z(h);
					Q(g), ke(), P(h);
					var _ = V(h, 2), v = z(_);
					Q(v), ke(), P(_);
					var y = V(_, 4), b = (e) => {
						var i = Pi(), a = B(i), o = V(z(a));
						Q(o), P(a);
						var s = V(a, 2), c = V(z(s)), l = z(c);
						l.value = l.__value = "", X(V(l), 17, () => W(r).profiles, (e) => e.id, (e, t) => {
							var n = ki(), r = z(n, !0);
							P(n);
							var i = {};
							H(() => {
								J(r, W(t).name), i !== (i = W(t).id) && (n.value = (n.__value = W(t).id) ?? "");
							}), q(e, n);
						}), P(c);
						var u;
						oi(c), P(s);
						var d = V(s, 2), f = V(z(d));
						Q(f), P(d);
						var p = V(d, 2), m = z(p);
						P(p), H(() => {
							fi(o, W(n).modelRole), u !== (u = W(n).profileId) && (c.value = (c.__value = W(n).profileId) ?? "", ai(c, W(n).profileId)), fi(f, W(n).model), J(m, `Effective connection: ${W(n).effective ?? ""}`);
						}), G("input", o, (e) => t.actions.updateNode(W(n).id, "modelRole", e.currentTarget.value)), G("change", c, (e) => t.actions.updateNode(W(n).id, "profileId", e.currentTarget.value || null)), G("input", f, (e) => t.actions.updateNode(W(n).id, "model", e.currentTarget.value || null)), q(e, i);
					};
					Y(y, (e) => {
						W(n).modelRole && e(b);
					});
					var x = V(y, 2);
					X(x, 17, () => W(n).controls, (e) => e.key, (e, r) => {
						var a = Hi(), c = B(a), l = z(c), u = V(l), d = (e) => {
							var i = Fi();
							X(i, 21, () => W(r).options, Br, (e, t) => {
								var n = ki(), r = z(n, !0);
								P(n);
								var i = {};
								H(() => {
									J(r, W(t)), i !== (i = W(t)) && (n.value = (n.__value = W(t)) ?? "");
								}), q(e, n);
							}), P(i);
							var a;
							oi(i), H((e) => {
								a !== (a = e) && (i.value = (i.__value = e) ?? "", ai(i, e));
							}, [() => String(W(r).value)]), G("change", i, (e) => t.actions.updateNode(W(n).id, W(r).key, e.currentTarget.value)), q(e, i);
						}, f = (e) => {
							var i = Ii();
							Q(i), H((e) => pi(i, e), [() => !!W(r).value]), G("change", i, (e) => t.actions.updateNode(W(n).id, W(r).key, e.currentTarget.checked)), q(e, i);
						}, p = (e) => {
							var i = Li();
							Q(i), H((e) => {
								$(i, "aria-label", W(r).label), $(i, "min", W(r).key === "keepRecent" ? 0 : 1), fi(i, e);
							}, [() => Number(W(r).value)]), G("input", i, (e) => t.actions.updateNode(W(n).id, W(r).key, Number(e.currentTarget.value))), q(e, i);
						}, m = (e) => {
							var t = Ri();
							nt(t), H((e) => {
								fi(t, e), $(t, "aria-label", W(r).label);
							}, [() => String(W(r).value)]), q(e, t);
						}, h = (e) => {
							var t = zi();
							nt(t), H((e) => {
								$(t, "aria-label", W(r).label), $(t, "aria-invalid", !!W(i)), $(t, "aria-describedby", "rule-help-" + W(n).id + (W(i) ? " rule-error-" + W(n).id : "")), fi(t, e);
							}, [() => W(i)?.text ?? String(W(r).value)]), G("input", t, (e) => s(W(n).id, e.currentTarget.value)), q(e, t);
						}, g = (e) => {
							var i = zi();
							nt(i), H((e) => fi(i, e), [() => String(W(r).value)]), G("input", i, (e) => t.actions.updateNode(W(n).id, W(r).key, W(r).kind === "lines" ? o(e.currentTarget.value) : e.currentTarget.value)), q(e, i);
						};
						Y(u, (e) => {
							W(r).options ? e(d) : W(r).kind === "boolean" ? e(f, 1) : W(r).kind === "number" ? e(p, 2) : W(r).kind === "readonly-json" ? e(m, 3) : W(r).kind === "rules" ? e(h, 4) : e(g, -1);
						}), P(c);
						var _ = V(c, 2), v = (e) => {
							var t = Vi(), r = B(t), a = V(r, 2), o = (e) => {
								var t = Bi(), r = z(t, !0);
								P(t), H(() => {
									$(t, "id", "rule-error-" + W(n).id), J(r, W(i).error);
								}), q(e, t);
							};
							Y(a, (e) => {
								W(i) && e(o);
							}), H(() => $(r, "id", "rule-help-" + W(n).id)), q(e, t);
						};
						Y(_, (e) => {
							W(r).kind === "rules" && e(v);
						}), H(() => J(l, `${W(r).label ?? ""} `)), q(e, a);
					});
					var S = V(x, 2), C = V(S, 2), w = V(C, 2), T = (e) => {
						q(e, Ui());
					};
					Y(w, (e) => {
						W(n).operation === "smart-compactor" && e(T);
					});
					var E = V(w, 2), D = (e) => {
						var t = Mi(), n = z(t, !0);
						P(t), H(() => J(n, W(r).quoteHelp)), q(e, t);
					};
					Y(E, (e) => {
						W(n).operation === "pattern-scan" && e(D);
					}), P(a), H(() => {
						J(l, `${W(n).family ?? ""} · ${W(n).phase ?? ""} phase · ${W(n).input ?? ""} → ${W(n).output ?? ""}`), J(d, `Canonical type: ${W(n).canonicalTitle ?? ""}`), fi(p, W(n).alias), pi(g, W(n).compact), pi(v, W(n).enabled);
					}), G("input", p, (e) => t.actions.presentNode(W(n).id, "alias", e.currentTarget.value)), G("click", m, () => t.actions.presentNode(W(n).id, "alias", "")), G("change", g, (e) => t.actions.presentNode(W(n).id, "compact", e.currentTarget.checked)), G("change", v, (e) => t.actions.updateNode(W(n).id, "enabled", e.currentTarget.checked)), G("click", S, () => t.actions.duplicate(W(n).id)), G("click", C, () => t.actions.remove(W(n).id)), q(e, a);
				};
				Y(u, (e) => {
					W(n).id === W(r).selectedId && e(d);
				}), H(() => {
					$(c, "aria-pressed", W(r).selectedId === W(n).id), J(l, `Inspect ${W(n).title ?? ""}`);
				}), G("click", c, () => t.actions.inspect(W(n).id)), q(e, a);
			});
			var T = V(w, 2), E = (e) => {
				var t = ji(), n = z(t, !0);
				P(t), H(() => J(n, W(r).preparationError.message)), q(e, t);
			};
			Y(T, (e) => {
				W(r).preparationError && e(E);
			});
			var D = V(T, 2), ee = (e) => {
				var t = Ki(), n = z(t);
				P(t), H(() => J(n, `Retained diagnostic: ${W(r).availability ?? ""}. Run again for a current review.`)), q(e, t);
			};
			Y(D, (e) => {
				W(r).availability && W(r).availability !== "current" && e(ee);
			});
			var te = V(D, 2), ne = (e) => {
				var t = Ki(), n = z(t, !0);
				P(t), H(() => J(n, W(r).status)), q(e, t);
			};
			Y(te, (e) => {
				W(r).status && e(ne);
			});
			var O = V(te, 2), k = (e) => {
				var n = ea(), a = V(B(n), 2), o = (e) => {
					var t = ji(), n = z(t, !0);
					P(t), H(() => J(n, W(r).result.error)), q(e, t);
				};
				Y(a, (e) => {
					W(r).result.error && e(o);
				});
				var s = V(a, 2), c = z(s);
				P(s);
				var l = V(s, 2), u = z(l);
				P(l);
				var d = V(l, 2), f = (e) => {
					var n = Xi(), a = B(n), o = (e) => {
						var t = Mi(), n = z(t);
						P(t), H(() => J(n, `Run: ${W(r).result.runId ?? ""}`)), q(e, t);
					};
					Y(a, (e) => {
						W(r).result.runId && e(o);
					});
					var s = V(a, 2);
					X(s, 17, () => W(r).result.sections, Br, (e, t) => {
						var n = Ji(), r = B(n), i = z(r);
						P(r);
						var a = V(r), o = z(a, !0);
						P(a);
						var s = V(a, 2), c = (e) => {
							q(e, qi());
						};
						Y(s, (e) => {
							W(t).truncated && e(c);
						}), H(() => {
							J(i, `${W(t).kind ?? ""} diagnostic`), J(o, W(t).text);
						}), q(e, n);
					});
					var c = V(s, 2), l = (e) => {
						var n = Yi(), a = B(n), o = (e) => {
							var t = ji(), n = z(t, !0);
							P(t), H(() => J(n, W(r).result.applyIssue)), q(e, t);
						};
						Y(a, (e) => {
							W(r).result.applyIssue && e(o);
						});
						var s = V(a, 2), c = V(s, 2);
						ke(2), H(() => {
							s.disabled = W(r).busy || !!W(r).result.applyIssue || !!W(i), c.disabled = W(r).busy;
						}), G("click", s, () => t.actions.apply(W(r)?.result?.kind === "bounded" && W(r).result.selectedReviewHandle || void 0)), G("click", c, () => t.actions.reject()), q(e, n);
					};
					Y(c, (e) => {
						W(r).result.applyAvailable && W(r).result.selectedReviewHandle && e(l);
					}), q(e, n);
				}, p = (e) => {
					var n = $i(), a = B(n), o = (e) => {
						var t = Zi(), n = V(B(t)), i = z(n, !0);
						P(n), H(() => J(i, W(r).result.guidance)), q(e, t);
					};
					Y(a, (e) => {
						W(r).result.guidance && e(o);
					});
					var s = V(a, 2), c = (e) => {
						var n = Qi(), a = B(n), o = z(a), s = V(z(o)), c = z(s, !0);
						P(s), P(o);
						var l = V(o), u = V(z(l)), d = z(u, !0);
						P(u), P(l), P(a);
						var f = V(a, 2), p = (e) => {
							var t = ji(), n = z(t, !0);
							P(t), H(() => J(n, W(r).result.applyIssue)), q(e, t);
						};
						Y(f, (e) => {
							W(r).result.applyIssue && e(p);
						});
						var m = V(f, 2), h = V(m, 2);
						ke(2), H(() => {
							J(c, W(r).result.original), J(d, W(r).result.candidate), m.disabled = W(r).busy || !!W(r).result.applyIssue || !!W(i), h.disabled = W(r).busy;
						}), G("click", m, () => t.actions.apply()), G("click", h, () => t.actions.reject()), q(e, n);
					};
					Y(s, (e) => {
						W(r).result.applyAvailable && e(c);
					});
					var l = V(s, 2), u = V(z(l)), d = z(u, !0);
					P(u), P(l);
					var f = V(l, 2), p = V(z(f)), m = z(p, !0);
					P(p), P(f), H((e, t) => {
						J(d, e), J(m, t);
					}, [() => JSON.stringify({
						findings: W(r).result.findings,
						changes: W(r).result.changes
					}, null, 2), () => JSON.stringify({
						reports: W(r).result.reports,
						calls: W(r).result.calls
					}, null, 2)]), q(e, n);
				};
				Y(d, (e) => {
					W(r).result.kind === "bounded" ? e(f) : e(p, -1);
				}), H((e) => {
					J(c, `Actual auxiliary requests: ${W(r).result.actualCalls ?? ""} / ${W(r).result.callBound ?? ""}`), J(u, `Token count method: ${e ?? ""}`);
				}, [() => W(r).result.tokenMethods.join(", ") || "Not reported"]), q(e, n);
			};
			Y(O, (e) => {
				W(r).result && e(k);
			}), H(() => {
				J(c, W(r).name), J(u, W(r).phase === "pre" ? "Guidance helps SillyTavern plan its normal reply." : "Review a revision of the latest completed assistant reply."), J(f, `Maximum auxiliary requests: ${W(r).callBound ?? ""}`), J(h, `Assign ${W(r).phase ?? ""} phase and enable native mode`), J(_, `${W(r).assigned ? "Assigned to this phase." : "Phase is not assigned."} Mode: ${W(r).workflowMode ?? ""}. Arming is a separate action.`), y.disabled = W(r).busy || !!W(r).issues.length || !!W(i), J(b, W(r).busy ? "Running…" : W(r).phase === "pre" ? "Test workflow" : "Run reviewed repair");
			}), G("click", m, () => t.actions.assign(W(r)?.phase || "")), G("click", y, () => t.actions.run()), q(e, n);
		};
		Y(c, (e) => {
			n() === "library" ? e(l) : e(u, -1);
		}), P(a), H(() => {
			$(a, "data-pc-workflows", n()), $(a, "aria-label", n() === "library" ? "Workflow library" : "Workflow setup and review");
		}), q(e, a);
	};
	return Y(u, (e) => {
		W(r) && e(d);
	}), q(e, l), Ve(c);
}
_r([
	"change",
	"click",
	"input"
]);
//#endregion
//#region ui/NodeCard.svelte
var ia = /* @__PURE__ */ K("<div><span class=\"pc-native-pin-label\"> </span> <div role=\"img\"></div></div>"), aa = /* @__PURE__ */ K("<span class=\"pc-native-alias\"> </span>"), oa = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-node-action pc-host-result\" aria-label=\"Preview host result\"><i class=\"fa-solid fa-eye\" aria-hidden=\"true\"></i> Host result</button>"), sa = /* @__PURE__ */ K("<div class=\"pc-native-heading\"><svg class=\"pc-native-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path></path></svg><span class=\"pc-node-title\"> </span></div> <div class=\"pc-native-pins\"></div> <!> <!>", 1), ca = /* @__PURE__ */ K("<span> </span>"), la = /* @__PURE__ */ K("<span class=\"pc-off-pill\">OFF</span>"), ua = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-node-action pc-help-btn fa-solid fa-circle-question\" title=\"How Deciders work\" aria-label=\"How Deciders work\"></button>"), da = /* @__PURE__ */ K("<button type=\"button\"></button>"), fa = /* @__PURE__ */ K("<div class=\"pc-node-body\"> </div>"), pa = /* @__PURE__ */ K("<div> </div>"), ma = /* @__PURE__ */ K("<div><b> </b><span> </span></div>"), ha = /* @__PURE__ */ K("<div><!> <!></div>"), ga = /* @__PURE__ */ K("· <b> </b>", 1), _a = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-node-action pc-node-model pc-node-model-pick\"><i class=\"fa-solid fa-microchip\"></i> <!> <i class=\"fa-solid fa-caret-down pc-model-caret\"></i></button>"), va = /* @__PURE__ */ K("<div class=\"pc-node-model\"><i class=\"fa-solid fa-microchip\"></i> <!></div>"), ya = /* @__PURE__ */ K("<div><i></i> </div>"), ba = /* @__PURE__ */ K("<span class=\"pc-port-keyname\"> </span>"), xa = /* @__PURE__ */ K("<i></i>"), Sa = /* @__PURE__ */ K("<div><!><!></div>"), Ca = /* @__PURE__ */ K("<div class=\"pc-node-head\"><span class=\"pc-badge\"><i></i> </span> <span class=\"pc-node-title\"> </span> <!> <!> <!> <!></div> <!> <!> <!> <!> <!>", 1), wa = /* @__PURE__ */ K("<div role=\"group\"><!></div>");
function Ta(e, t) {
	Be(t, !0);
	let n = (e) => e.stopPropagation();
	var r = wa();
	let i;
	var a = z(r), o = (e) => {
		var r = sa(), i = B(r), a = z(i), o = z(a);
		P(a);
		var s = V(a), c = z(s, !0);
		P(s), P(i);
		var l = V(i, 2);
		X(l, 21, () => t.card.ports, (e) => e.id, (e, n) => {
			var r = ia();
			let i;
			var a = z(r), o = z(a, !0);
			P(a);
			var s = V(a, 2);
			P(r), H(() => {
				Z(r, 1, `pc-native-row pc-native-row-${W(n).dir}`), i = ii(r, "", i, { "grid-row": W(n).row }), J(o, W(n).label), Z(s, 1, Zr(W(n).className)), $(s, "data-node", t.card.id), $(s, "data-dir", W(n).dir), $(s, "data-port", W(n).port), $(s, "data-side", W(n).side), $(s, "data-kind", W(n).kind), $(s, "title", W(n).title), $(s, "aria-label", W(n).title);
			}), gr("mouseenter", s, () => t.actions.hoverPin({
				nodeId: t.card.id,
				dir: W(n).dir,
				port: W(n).port
			})), gr("mouseleave", s, () => t.actions.hoverPin(null)), q(e, r);
		}), P(l);
		var u = V(l, 2), d = (e) => {
			var n = aa(), r = z(n, !0);
			P(n), H(() => {
				$(n, "title", t.card.titleHint), J(r, t.card.title);
			}), q(e, n);
		};
		Y(u, (e) => {
			t.card.compact && e(d);
		});
		var f = V(u, 2), p = (e) => {
			var r = oa();
			G("mousedown", r, n), G("click", r, (e) => {
				n(e), t.actions.hostResult(t.card.id);
			}), q(e, r);
		};
		Y(f, (e) => {
			t.card.hostResult && e(p);
		}), H(() => {
			$(o, "d", t.card.iconPath), $(s, "title", t.card.titleHint), J(c, t.card.title);
		}), q(e, r);
	}, s = (e) => {
		var r = Ca(), i = B(r), a = z(i), o = z(a), s = V(o);
		P(a);
		var c = V(a, 2), l = z(c, !0);
		P(c);
		var u = V(c, 2), d = (e) => {
			var n = ca(), r = z(n, !0);
			P(n), H(() => {
				Z(n, 1, Zr(t.card.token.className)), $(n, "title", t.card.token.title), J(r, t.card.token.text);
			}), q(e, n);
		};
		Y(u, (e) => {
			t.card.token && e(d);
		});
		var f = V(u, 2), p = (e) => {
			var n = la();
			H(() => $(n, "title", t.card.offHint)), q(e, n);
		};
		Y(f, (e) => {
			t.card.offHint && e(p);
		});
		var m = V(f, 2), h = (e) => {
			var r = ua();
			G("mousedown", r, n), G("click", r, (e) => {
				n(e), t.actions.help(t.card.id);
			}), q(e, r);
		};
		Y(m, (e) => {
			t.card.help && e(h);
		});
		var g = V(m, 2), _ = (e) => {
			var r = da();
			H(() => {
				Z(r, 1, `pc-node-action pc-toggle fa-solid ${t.card.enabled ? "fa-toggle-on pc-toggle-on" : "fa-toggle-off pc-toggle-off"}`), $(r, "title", t.card.enabled ? "Switched on — click to switch off" : "Switched off — click to switch on"), $(r, "aria-label", `Switch ${t.card.title} ${t.card.enabled ? "off" : "on"}`), $(r, "aria-pressed", t.card.enabled);
			}), G("mousedown", r, n), G("click", r, (e) => {
				n(e), t.actions.toggle(t.card.id);
			}), q(e, r);
		};
		Y(g, (e) => {
			t.card.toggle && e(_);
		}), P(i);
		var v = V(i, 2), y = (e) => {
			var n = fa(), r = z(n, !0);
			P(n), H(() => J(r, t.card.body)), q(e, n);
		};
		Y(v, (e) => {
			t.card.body !== null && e(y);
		});
		var b = V(v, 2), x = (e) => {
			var n = ha(), r = z(n), i = (e) => {
				var n = pa(), r = z(n, !0);
				P(n), H(() => {
					Z(n, 1, Zr(t.card.mode.className)), J(r, t.card.mode.text);
				}), q(e, n);
			};
			Y(r, (e) => {
				t.card.mode && e(i);
			}), X(V(r, 2), 17, () => t.card.rows, (e) => e.id, (e, t) => {
				var n = ma(), r = z(n), i = z(r, !0);
				P(r);
				var a = V(r), o = z(a, !0);
				P(a), P(n), H(() => {
					Z(n, 1, `pc-dec-key${W(t).chosen ? " pc-dec-chosen" : ""}${W(t).fallback ? " pc-dec-fallback" : ""}`), J(i, W(t).name), J(o, W(t).text);
				}), q(e, n);
			}), P(n), H(() => Z(n, 1, Zr(t.card.rowClass))), q(e, n);
		};
		Y(b, (e) => {
			t.card.body === null && e(x);
		});
		var S = V(b, 2), C = (e) => {
			var r = Or(), i = B(r), a = (e) => {
				var r = _a(), i = V(z(r)), a = V(i), o = (e) => {
					var n = ga(), r = V(B(n)), i = z(r, !0);
					P(r), H(() => J(i, t.card.model.actual)), q(e, n);
				};
				Y(a, (e) => {
					t.card.model.actual && e(o);
				}), ke(2), P(r), H(() => {
					$(r, "title", t.card.model.title), J(i, ` ${t.card.model.where ?? ""}`);
				}), G("mousedown", r, n), G("dblclick", r, n), G("click", r, (e) => {
					n(e), t.actions.model(t.card.id, e.currentTarget);
				}), q(e, r);
			}, o = (e) => {
				var n = va(), r = V(z(n)), i = V(r), a = (e) => {
					var n = ga(), r = V(B(n)), i = z(r, !0);
					P(r), H(() => J(i, t.card.model.actual)), q(e, n);
				};
				Y(i, (e) => {
					t.card.model.actual && e(a);
				}), P(n), H(() => {
					$(n, "title", t.card.model.title), J(r, ` ${t.card.model.where ?? ""}`);
				}), q(e, n);
			};
			Y(i, (e) => {
				t.card.model.pick ? e(a) : e(o, -1);
			}), q(e, r);
		};
		Y(S, (e) => {
			t.card.model && e(C);
		});
		var w = V(S, 2);
		X(w, 19, () => t.card.notices, (e, t) => `${e.className}:${t}`, (e, t) => {
			var n = ya(), r = z(n), i = V(r);
			P(n), H(() => {
				Z(n, 1, Zr(W(t).className)), $(n, "title", W(t).title), Z(r, 1, `fa-solid ${W(t).icon}`), J(i, ` ${W(t).text ?? ""}`);
			}), q(e, n);
		}), X(V(w, 2), 17, () => t.card.ports, (e) => e.id, (e, n) => {
			var r = Sa();
			let i;
			var a = z(r), o = (e) => {
				var t = ba(), r = z(t, !0);
				P(t), H(() => J(r, W(n).label)), q(e, t);
			};
			Y(a, (e) => {
				W(n).label && e(o);
			});
			var s = V(a), c = (e) => {
				var t = xa();
				H(() => Z(t, 1, `fa-solid ${W(n).icon}`)), q(e, t);
			};
			Y(s, (e) => {
				W(n).icon && e(c);
			}), P(r), H(() => {
				Z(r, 1, Zr(W(n).className)), $(r, "data-node", t.card.id), $(r, "data-dir", W(n).dir), $(r, "data-port", W(n).port), $(r, "data-side", W(n).side), $(r, "title", W(n).title), i = ii(r, "", i, { left: W(n).left === void 0 ? void 0 : `${W(n).left}%` });
			}), q(e, r);
		}), H(() => {
			Z(o, 1, `fa-solid ${t.card.icon} pc-badge-icon`), J(s, ` ${t.card.label ?? ""}`), $(c, "title", t.card.titleHint), J(l, t.card.title);
		}), q(e, r);
	};
	Y(a, (e) => {
		t.card.native ? e(o) : e(s, -1);
	}), P(r), H(() => {
		Z(r, 1, Zr(t.card.className)), $(r, "data-id", t.card.id), $(r, "title", t.card.hint), $(r, "aria-label", `${t.card.label}: ${t.card.title}`), i = ii(r, "", i, {
			left: `${t.card.x}px`,
			top: `${t.card.y}px`,
			width: t.card.native ? void 0 : `${t.card.w}px`
		});
	}), gr("mouseenter", r, () => {
		t.card.native || t.actions.hover(t.card.id);
	}), gr("mouseleave", r, () => t.actions.hover(null)), q(e, r), Ve();
}
_r([
	"mousedown",
	"click",
	"dblclick"
]);
//#endregion
//#region ui/GroupCard.svelte
var Ea = /* @__PURE__ */ K("<span class=\"pc-badge\"><i class=\"fa-solid fa-object-group pc-badge-icon\"></i> Group</span>"), Da = /* @__PURE__ */ K("<i class=\"fa-solid fa-object-group\"></i>"), Oa = /* @__PURE__ */ K("<span class=\"pc-group-frame-count\"> </span>"), ka = /* @__PURE__ */ K("<span> </span>"), Aa = /* @__PURE__ */ K("<span class=\"pc-off-pill\" title=\"This whole group is switched off. Nothing in it is sent, and nothing passes through it.\">OFF</span>"), ja = /* @__PURE__ */ K("<div class=\"pc-node-body\"> </div><div class=\"pc-node-model pc-group-io\"> </div> <div class=\"pc-node-cond\"> </div> <div class=\"pc-gport pc-gport-in\" data-gport=\"in\" title=\"Drag up to a block to wire it into this group\"></div> <div class=\"pc-gport pc-gport-out\" data-gport=\"out\" title=\"Drag to wire a block in this group into another block\"></div>", 1), Ma = /* @__PURE__ */ K("<div class=\"pc-group-resize\" data-action=\"resize\" title=\"Drag to resize the blanket\"></div>"), Na = /* @__PURE__ */ K("<div role=\"group\"><div><!> <span> </span> <!> <!> <!> <button type=\"button\"></button> <button type=\"button\" data-action=\"toggle\" aria-label=\"Toggle group\"></button></div> <!></div>");
function Pa(e, t) {
	Be(t, !0);
	function n(e, n) {
		e.stopPropagation(), e.preventDefault(), t.actions.group(t.group.id, n);
	}
	function r(e, n) {
		e.stopPropagation(), e.detail === 0 && t.actions.group(t.group.id, n);
	}
	var i = Na();
	let a;
	var o = z(i), s = z(o), c = (e) => {
		q(e, Ea());
	}, l = (e) => {
		q(e, Da());
	};
	Y(s, (e) => {
		t.group.collapsed ? e(c) : e(l, -1);
	});
	var u = V(s, 2), d = z(u, !0);
	P(u);
	var f = V(u, 2), p = (e) => {
		var n = Oa(), r = z(n, !0);
		P(n), H(() => J(r, t.group.count)), q(e, n);
	};
	Y(f, (e) => {
		t.group.collapsed || e(p);
	});
	var m = V(f, 2), h = (e) => {
		var n = ka(), r = z(n, !0);
		P(n), H(() => {
			Z(n, 1, Zr(t.group.token.className)), $(n, "title", t.group.token.title), J(r, t.group.token.text);
		}), q(e, n);
	};
	Y(m, (e) => {
		t.group.token && e(h);
	});
	var g = V(m, 2), _ = (e) => {
		q(e, Aa());
	};
	Y(g, (e) => {
		t.group.enabled || e(_);
	});
	var v = V(g, 2), y = V(v, 2);
	P(o);
	var b = V(o, 2), x = (e) => {
		var n = ja(), r = B(n), i = z(r, !0);
		P(r);
		var a = V(r), o = z(a, !0);
		P(a);
		var s = V(a, 2), c = z(s, !0);
		P(s);
		var l = V(s, 2), u = V(l, 2);
		H(() => {
			J(i, t.group.body), J(o, t.group.io), J(c, t.group.enabled ? "double-click to open" : "switched off — nothing goes through"), $(l, "data-group", t.group.id), $(u, "data-group", t.group.id);
		}), q(e, n);
	}, S = (e) => {
		q(e, Ma());
	};
	Y(b, (e) => {
		t.group.collapsed ? e(x) : e(S, -1);
	}), P(i), H(() => {
		Z(i, 1, Zr(t.group.className)), $(i, "data-group", t.group.id), $(i, "aria-label", `Group: ${t.group.title}`), a = ii(i, "", a, {
			left: `${t.group.x}px`,
			top: `${t.group.y}px`,
			width: `${t.group.w}px`,
			height: t.group.collapsed ? void 0 : `${t.group.h}px`
		}), Z(o, 1, Zr(t.group.collapsed ? "pc-node-head" : "pc-group-frame-head")), Z(u, 1, Zr(t.group.collapsed ? "pc-node-title" : "pc-group-frame-title")), J(d, t.group.title), Z(v, 1, `pc-node-action fa-solid pc-group-btn ${t.group.collapsed ? "fa-up-right-and-down-left-from-center" : "fa-down-left-and-up-right-to-center"}`), $(v, "data-action", t.group.collapsed ? "open" : "collapse"), $(v, "title", t.group.collapsed ? "Open the group as a blanket" : "Fold the group"), $(v, "aria-label", t.group.collapsed ? "Open group" : "Fold group"), Z(y, 1, `pc-node-action pc-toggle fa-solid ${t.group.enabled ? "fa-toggle-on pc-toggle-on" : "fa-toggle-off pc-toggle-off"}`), $(y, "title", t.group.enabled ? "Switch the whole group off" : "Switch the whole group on"), $(y, "aria-pressed", t.group.enabled);
	}), G("mousedown", v, (e) => n(e, t.group.collapsed ? "open" : "collapse")), G("click", v, (e) => r(e, t.group.collapsed ? "open" : "collapse")), G("mousedown", y, (e) => n(e, "toggle")), G("click", y, (e) => r(e, "toggle")), q(e, i), Ve();
}
_r(["mousedown", "click"]);
//#endregion
//#region ui/WireLayer.svelte
var Fa = /* @__PURE__ */ Er("<title> </title>"), Ia = /* @__PURE__ */ Er("<path class=\"pc-wire-hit\"></path><path><title> </title></path><text> <!></text>", 1), La = /* @__PURE__ */ Er("<path></path>"), Ra = /* @__PURE__ */ Er("<defs><marker viewBox=\"0 0 10 10\" refX=\"8\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto-start-reverse\"><path d=\"M 0 0 L 10 5 L 0 10 z\" class=\"pc-loop-arrow\"></path></marker></defs><!><!>", 1);
function za(e, t) {
	Be(t, !0);
	var n = Ra(), r = B(n), i = z(r);
	P(r);
	var a = V(r);
	X(a, 17, () => t.wires, (e) => e.id, (e, n) => {
		var r = Ia(), i = B(r), a = V(i), o = z(a), s = z(o, !0);
		P(o), P(a);
		var c = V(a), l = z(c, !0), u = V(l), d = (e) => {
			var t = Fa(), r = z(t, !0);
			P(t), H(() => J(r, W(n).label.title)), q(e, t);
		};
		Y(u, (e) => {
			W(n).label.title && e(d);
		}), P(c), H(() => {
			$(i, "d", W(n).d), $(i, "data-id", W(n).id), $(a, "d", W(n).d), Z(a, 0, Zr(W(n).className)), $(a, "data-id", W(n).id), $(a, "data-kind", W(n).kind), $(a, "marker-end", W(n).arrow ? `url(#${t.markerId})` : void 0), J(s, W(n).kind ? `${W(n).kind} artifact` : W(n).label.text), $(c, "x", W(n).label.x), $(c, "y", W(n).label.y), Z(c, 0, Zr(W(n).label.className)), $(c, "data-id", W(n).label.id), $(c, "text-anchor", W(n).label.anchor), J(l, W(n).label.text);
		}), q(e, r);
	});
	var o = V(a), s = (e) => {
		var n = La();
		H(() => {
			$(n, "d", t.ghost.d), Z(n, 0, Zr(t.ghost.className));
		}), q(e, n);
	};
	Y(o, (e) => {
		t.ghost && e(s);
	}), H(() => $(i, "id", t.markerId)), q(e, n), Ve();
}
//#endregion
//#region ui/CanvasLayer.svelte
var Ba = /* @__PURE__ */ K("<div class=\"pc-viewport\" data-pc-renderer=\"svelte\"><svg class=\"pc-wires\" aria-label=\"Canvas connections\"><!></svg> <div class=\"pc-nodes\"><!> <!> <!></div></div>");
function Va(e, t) {
	Be(t, !0);
	let n = /* @__PURE__ */ L([]), r = /* @__PURE__ */ L([]), i = /* @__PURE__ */ L([]), a = /* @__PURE__ */ L(null), o = /* @__PURE__ */ L({
		w: 4e3,
		h: 4e3
	}), s, c, l;
	function u() {
		return {
			viewport: s,
			svg: c,
			nodeLayer: l
		};
	}
	function d(e) {
		R(n, e);
	}
	function f(e) {
		R(r, e);
	}
	function p(e, t, n) {
		R(i, e), R(o, t), R(a, n);
	}
	function m(e, t) {
		let i = new Map(e.map((e) => [e.id, e])), a = new Map(t.map((e) => [e.id, e]));
		R(n, W(n).map((e) => i.has(e.id) ? {
			...e,
			...i.get(e.id)
		} : e)), R(r, W(r).map((e) => a.has(e.id) ? {
			...e,
			...a.get(e.id)
		} : e));
	}
	var h = {
		getLayers: u,
		setNodes: d,
		setGroups: f,
		setWires: p,
		setPositions: m
	}, g = Ba(), _ = z(g);
	za(z(_), {
		get wires() {
			return W(i);
		},
		get markerId() {
			return t.markerId;
		},
		get ghost() {
			return W(a);
		}
	}), P(_), xi(_, (e) => c = e, () => c);
	var v = V(_, 2), y = z(v);
	X(y, 17, () => W(r).filter((e) => !e.collapsed), (e) => e.id, (e, n) => {
		Pa(e, {
			get group() {
				return W(n);
			},
			get actions() {
				return t.actions;
			}
		});
	});
	var b = V(y, 2);
	return X(b, 17, () => W(n), (e) => e.id, (e, n) => {
		Ta(e, {
			get card() {
				return W(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), X(V(b, 2), 17, () => W(r).filter((e) => e.collapsed), (e) => e.id, (e, n) => {
		Pa(e, {
			get group() {
				return W(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), P(v), xi(v, (e) => l = e, () => l), P(g), xi(g, (e) => s = e, () => s), H(() => {
		$(_, "width", W(o).w), $(_, "height", W(o).h), $(_, "viewBox", `0 0 ${W(o).w} ${W(o).h}`);
	}), q(e, g), Ve(h);
}
//#endregion
//#region ui/WorkspaceMenus.svelte
var Ha = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-flat-menu\" aria-haspopup=\"menu\"> </button>"), Ua = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\"><span> </span><small> </small></button>"), Wa = /* @__PURE__ */ K("<div class=\"pc-workspace-menu-panel\" role=\"menu\" tabindex=\"-1\"></div>"), Ga = /* @__PURE__ */ K("<nav class=\"pc-workspace-menus\" aria-label=\"Workspace menus\"><!> <!></nav>");
function Ka(e, t) {
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
				u("New canvas", "new"),
				u("Open workflow…", "open-workflow"),
				u("Import canvas", "import"),
				u("Import into graph…", "import-into-graph"),
				u("Export canvas", "export"),
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
				...t.state.workflow?.native ? [
					u("Select tool", "select-tool"),
					u("Pan tool", "pan-tool"),
					u("Zoom in", "zoom-in"),
					u("Zoom out", "zoom-out")
				] : [],
				u("Fit to view", "fit"),
				u("Fit selection", "fit-selection", "", !t.state.selectionCount),
				u("Duplicate canvas", "duplicate"),
				u("Rename canvas", "rename"),
				u("Seed from SillyTavern’s current prompt order", "seed", "", !!t.state.nativeGraph),
				u("Delete canvas", "delete")
			];
			case "Node": return [
				u("Add node…", "add-node"),
				u("Inspect selection", "reveal-inspector"),
				u("Library", "sidebar")
			];
			case "Preview": return [
				u("Compile prompt", "preview"),
				u("Show preview", "show-preview"),
				u("Collapse preview", "collapse-preview")
			];
			case "Workflows": return [
				u("Workflow setup…", "workflow-setup"),
				u("Workflow examples…", "workflow-setup"),
				u("Run workflow", "run-workflow", "", !W(n)?.native || !!W(n)?.busy || !!W(n)?.issues.length),
				u("Stop workflow", "stop-workflow", "", !W(n)?.busy),
				u("Library", "sidebar")
			];
			case "Tools": return [
				u("Theme and colours", "theme"),
				u("Toggle inspector", "inspector"),
				u("Toggle Library", "sidebar")
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
		].includes(e) ? t.local(e) : e === "select-tool" || e === "pan-tool" ? t.actions.mode(e === "select-tool" ? "select" : "pan") : e === "zoom-in" || e === "zoom-out" ? t.actions.zoom(e === "zoom-in" ? 1.15 : 1 / 1.15) : e === "preview" ? (t.local("show-preview"), t.actions.preview()) : t.actions.command(e);
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
	var g = Ga();
	gr("pointerdown", en, (e) => {
		W(r) && !i.contains(e.target) && !W(a)?.contains(e.target) && f();
	}), gr("resize", en, () => f());
	var _ = z(g);
	X(_, 17, () => l, Br, (e, t) => {
		var n = Ha(), i = z(n, !0);
		P(n), H(() => {
			$(n, "data-menu", W(t)), $(n, "aria-expanded", W(r) === W(t)), J(i, W(t));
		}), G("click", n, (e) => p(W(t), e.currentTarget)), G("keydown", n, h), q(e, n);
	});
	var v = V(_, 2), y = (e) => {
		var t = Wa();
		let n;
		X(t, 21, () => d(W(r)), Br, (e, t) => {
			var n = Ua(), r = z(n), i = z(r, !0);
			P(r);
			var a = V(r), o = z(a, !0);
			P(a), P(n), H(() => {
				n.disabled = W(t).disabled, J(i, W(t).label), J(o, W(t).shortcut);
			}), G("click", n, () => m(W(t).command)), q(e, n);
		}), P(t), xi(t, (e) => R(a, e), () => W(a)), H(() => {
			$(t, "aria-label", W(r)), n = ii(t, "", n, {
				left: `${W(s)}px`,
				top: `${W(c)}px`
			});
		}), G("keydown", t, h), q(e, t);
	};
	Y(v, (e) => {
		W(r) && e(y);
	}), P(g), xi(g, (e) => i = e, () => i), q(e, g), Ve();
}
_r(["click", "keydown"]);
//#endregion
//#region ui/Toolbar.svelte
var qa = /* @__PURE__ */ K("<option> </option>"), Ja = /* @__PURE__ */ K("<header class=\"pc-header\" data-pc-ui=\"svelte\"><div class=\"pc-menubar\"><div class=\"pc-brand\"><img width=\"30\" height=\"30\" alt=\"\"/><span>LATTICE</span></div> <!> <button type=\"button\" class=\"pc-btn menu_button pc-close\" title=\"Close\" aria-label=\"Close canvas\">×</button></div> <div class=\"pc-workflow-bar\"><select class=\"pc-select pc-graph-select text_pole\" aria-label=\"Canvas\"></select> <div class=\"pc-header-actions pc-history\"><button type=\"button\" aria-label=\"Undo\">↶</button> <button type=\"button\" aria-label=\"Redo\">↷</button> <span> </span></div> <button type=\"button\" class=\"pc-btn menu_button pc-root-run\"> </button> <span class=\"pc-root-workflow-status\" role=\"status\"> </span> <button type=\"button\" class=\"pc-btn menu_button\" title=\"Workflow setup\">Setup</button> <div class=\"pc-header-actions pc-surface-actions\"><button type=\"button\" title=\"Show or hide the Library\" aria-label=\"Toggle library\">Library</button> <button type=\"button\" title=\"Show or hide the inspector\" aria-label=\"Toggle inspector\">Details</button></div> <label class=\"pc-arm\"><input class=\"pc-arm-input\" type=\"checkbox\"/><span>Arm</span></label></div></header>");
function Ya(e, t) {
	Be(t, !0);
	let n = /* @__PURE__ */ F(() => t.state.rootWorkflow ?? t.state.workflow), r, i, a, o, s;
	function c() {
		return {
			header: r,
			graphSelect: i,
			arm: a,
			sideBtn: o,
			inspBtn: s
		};
	}
	function l() {
		i.focus();
	}
	var u = {
		getParts: c,
		focusGraphSelect: l
	}, d = Ja(), f = z(d), p = z(f), m = z(p);
	ke(), P(p);
	var h = V(p, 2);
	Ka(h, {
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
	var g = V(h, 2);
	P(f);
	var _ = V(f, 2), v = z(_);
	X(v, 21, () => t.state.graphs, (e) => e.id, (e, t) => {
		var n = qa(), r = z(n, !0);
		P(n);
		var i = {};
		H(() => {
			J(r, W(t).name), i !== (i = W(t).id) && (n.value = (n.__value = W(t).id) ?? "");
		}), q(e, n);
	}), P(v), xi(v, (e) => i = e, () => i);
	var y;
	oi(v);
	var b = V(v, 2), x = z(b), S = V(x, 2), C = V(S, 2), w = z(C, !0);
	P(C), P(b);
	var T = V(b, 2), E = z(T, !0);
	P(T);
	var D = V(T, 2), ee = z(D);
	P(D);
	var te = V(D, 2), ne = V(te, 2), O = z(ne);
	xi(O, (e) => o = e, () => o);
	var k = V(O, 2);
	xi(k, (e) => s = e, () => s), P(ne);
	var A = V(ne, 2), j = z(A);
	return Q(j), xi(j, (e) => a = e, () => a), ke(), P(A), P(_), P(d), xi(d, (e) => r = e, () => r), H((e) => {
		$(m, "src", t.actions.logoUrl), y !== (y = t.state.graphId) && (v.value = (v.__value = t.state.graphId) ?? "", ai(v, t.state.graphId)), Z(x, 1, `pc-btn menu_button pc-undo${t.state.history.undo ? "" : " pc-disabled"}`), x.disabled = !t.state.history.undo, $(x, "title", t.state.history.undoTitle), Z(S, 1, `pc-btn menu_button pc-redo${t.state.history.redo ? "" : " pc-disabled"}`), S.disabled = !t.state.history.redo, $(S, "title", t.state.history.redoTitle), Z(C, 1, `pc-history-note${t.state.history.showNote ? " pc-show" : ""}`), J(w, t.state.history.note), T.disabled = !W(n)?.native || !W(n)?.busy && !!W(n)?.issues.length, $(T, "title", e), J(E, W(n)?.busy ? "■ Stop" : "▶ Run"), J(ee, `${W(n)?.native ? `${W(n).phase} · ${W(n).assigned ? "Assigned" : "Unassigned"} · ≤ ${W(n).callBound} requests` : "Legacy prompt"} · Autosave`), Z(O, 1, `pc-btn menu_button pc-pane-toggle${t.state.sideOpen ? " pc-on" : ""}`), $(O, "aria-pressed", t.state.sideOpen), Z(k, 1, `pc-btn menu_button pc-pane-toggle${t.state.inspectorOpen ? " pc-on" : ""}`), $(k, "aria-pressed", t.state.inspectorOpen), pi(j, t.state.armed);
	}, [() => W(n)?.native ? W(n).issues.join("\n") || "Run the root workflow" : "Install a native workflow example to run"]), G("click", g, () => t.actions.command("close")), G("change", v, (e) => t.actions.pickGraph(e.currentTarget.value)), G("click", x, () => t.actions.command("undo")), G("click", S, () => t.actions.command("redo")), G("click", T, () => t.actions.command(W(n)?.busy ? "stop-workflow" : "run-workflow")), G("click", te, () => t.local("workflow-setup")), G("click", O, () => t.actions.command("sidebar")), G("click", k, () => t.actions.command("inspector")), G("change", j, (e) => t.actions.arm(e.currentTarget.checked)), q(e, d), Ve(u);
}
_r(["click", "change"]);
//#endregion
//#region ui/StatusBar.svelte
var Xa = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-btn menu_button pc-primary\">Run this one instead</button>"), Za = /* @__PURE__ */ K("<div class=\"pc-status\"><span> </span> <span aria-live=\"polite\"> </span> <!> <span class=\"pc-spacer\"></span> <button type=\"button\" class=\"pc-btn menu_button\"><i class=\"fa-solid fa-thumbtack\"></i> </button> <button type=\"button\" class=\"pc-btn menu_button\"><i class=\"fa-solid fa-user-pen\"></i> </button> <button type=\"button\" class=\"pc-btn menu_button\"><i class=\"fa-solid fa-star\"></i> </button> <button type=\"button\" class=\"pc-btn menu_button pc-primary\"><i class=\"fa-solid fa-eye\"></i> Preview prompt</button></div>");
function Qa(e, t) {
	Be(t, !0);
	let n;
	function r() {
		return n;
	}
	var i = { getElement: r }, a = Za(), o = z(a), s = z(o, !0);
	P(o);
	var c = V(o, 2), l = z(c, !0);
	P(c);
	var u = V(c, 2), d = (e) => {
		var n = Xa();
		H(() => $(n, "title", t.status.overrideTitle)), G("click", n, function(...e) {
			t.actions.unpin?.apply(this, e);
		}), q(e, n);
	};
	Y(u, (e) => {
		t.status.warning && e(d);
	});
	var f = V(u, 4), p = V(z(f));
	P(f);
	var m = V(f, 2), h = V(z(m));
	P(m);
	var g = V(m, 2), _ = V(z(g));
	P(g);
	var v = V(g, 2);
	return P(a), xi(a, (e) => n = e, () => n), H(() => {
		Z(o, 1, `pc-pill ${t.status.armed ? "pc-pill-on" : "pc-pill-off"}`), J(s, t.status.armed ? "Armed" : "Off"), Z(c, 1, `pc-status-text${t.status.warning ? " pc-status-warn" : ""}`), J(l, t.status.text), J(p, ` ${t.status.chatPinned ? "Unpin from chat" : "Pin to this chat"}`), $(m, "title", t.status.charTitle), J(h, ` ${t.status.charPinned ? "Unpin from character" : "Pin to character"}`), J(_, ` ${t.status.isDefault ? "Default canvas" : "Make default"}`);
	}), G("click", f, function(...e) {
		t.actions.pinChat?.apply(this, e);
	}), G("click", m, function(...e) {
		t.actions.pinCharacter?.apply(this, e);
	}), G("click", g, function(...e) {
		t.actions.makeDefault?.apply(this, e);
	}), G("click", v, function(...e) {
		t.actions.preview?.apply(this, e);
	}), q(e, a), Ve(i);
}
_r(["click"]);
//#endregion
//#region ui/CanvasControls.svelte
var $a = /* @__PURE__ */ K("<span class=\"pc-selection-count\"> </span>"), eo = /* @__PURE__ */ K("<div class=\"pc-canvas-controls\" role=\"toolbar\" aria-label=\"Canvas tools\"><button type=\"button\" aria-label=\"Select tool\" title=\"Drag empty canvas to select blocks\">Select</button> <button type=\"button\" aria-label=\"Pan tool\" title=\"Drag anywhere to pan; hold Space for temporary pan\">Pan</button> <span class=\"pc-control-separator\"></span> <button type=\"button\" class=\"pc-btn\" aria-label=\"Zoom out\" title=\"Zoom out\">−</button> <output class=\"pc-zoom-readout\" aria-label=\"Canvas zoom\"> </output> <button type=\"button\" class=\"pc-btn\" aria-label=\"Zoom in\" title=\"Zoom in\">+</button> <button type=\"button\" class=\"pc-btn\" title=\"Fit selection (.)\" aria-label=\"Fit selection\">Fit</button> <!></div> <div class=\"pc-gesture-hint\">Drag to select · Shift adds · Alt removes · Space pans</div>", 1);
function to(e, t) {
	Be(t, !0);
	var n = eo(), r = B(n), i = z(r), a = V(i, 2), o = V(a, 4), s = V(o, 2), c = z(s);
	P(s);
	var l = V(s, 2), u = V(l, 2), d = V(u, 2), f = (e) => {
		var n = $a(), r = z(n);
		P(n), H(() => J(r, `${t.count ?? ""} selected`)), q(e, n);
	};
	Y(d, (e) => {
		t.count && e(f);
	}), P(r), ke(2), H((e) => {
		Z(i, 1, `pc-btn${t.camera.mode === "select" ? " pc-on" : ""}`), $(i, "aria-pressed", t.camera.mode === "select"), Z(a, 1, `pc-btn${t.camera.mode === "pan" ? " pc-on" : ""}`), $(a, "aria-pressed", t.camera.mode === "pan"), J(c, `${e ?? ""}%`);
	}, [() => Math.round(t.camera.zoom * 100)]), G("click", i, () => t.actions.mode("select")), G("click", a, () => t.actions.mode("pan")), G("click", o, () => t.actions.zoom(1 / 1.15)), G("click", l, () => t.actions.zoom(1.15)), G("click", u, function(...e) {
		t.actions.fitSelection?.apply(this, e);
	}), q(e, n), Ve();
}
_r(["click"]);
//#endregion
//#region ui/DomainSurface.svelte
var no = /* @__PURE__ */ K("<div></div>");
function ro(e, t) {
	Be(t, !0);
	let n;
	function r() {
		return n;
	}
	var i = { getElement: r }, a = no();
	return xi(a, (e) => n = e, () => n), H(() => {
		Z(a, 1, Zr(t.className)), $(a, "aria-label", t.label);
	}), q(e, a), Ve(i);
}
//#endregion
//#region ui/PaneDivider.svelte
var io = /* @__PURE__ */ K("<div class=\"pc-pane-divider\" role=\"separator\" aria-label=\"Resize preview\" aria-orientation=\"horizontal\" tabindex=\"0\"></div>");
function ao(e, t) {
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
	zr(u);
	var f = io();
	gr("blur", en, u), xi(f, (e) => i = e, () => i), H((e, t) => {
		$(f, "aria-valuemin", n()), $(f, "aria-valuemax", e), $(f, "aria-valuenow", t);
	}, [() => Math.round(r()), () => Math.round(t.height)]), G("pointerdown", f, s), G("pointermove", f, c), G("pointerup", f, (e) => l(!1, e.pointerId)), gr("pointercancel", f, (e) => l(!0, e.pointerId)), gr("lostpointercapture", f, (e) => l(!0, e.pointerId)), G("keydown", f, d), q(e, f), Ve();
}
_r([
	"pointerdown",
	"pointermove",
	"pointerup",
	"keydown"
]);
//#endregion
//#region ui/GraphTabs.svelte
var oo = /* @__PURE__ */ K("<span class=\"pc-graph-tab-lock svelte-7ptwed\" aria-label=\"Read only\">◇</span>"), so = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-graph-tab-close svelte-7ptwed\">×</button>"), co = /* @__PURE__ */ K("<div><button type=\"button\" role=\"tab\"><span class=\"svelte-7ptwed\"> </span><!></button> <!></div>"), lo = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button>"), uo = /* @__PURE__ */ K("<div class=\"pc-graph-view-menu svelte-7ptwed\" role=\"menu\" aria-label=\"Graph view actions\" tabindex=\"-1\"><!> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close active view</button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close other views</button> <!></div>"), fo = /* @__PURE__ */ K("<nav class=\"pc-graph-tabs pc-graph-tabs-multi svelte-7ptwed\" aria-label=\"Open graph views\"><div class=\"pc-graph-tab-list svelte-7ptwed\" role=\"tablist\" aria-label=\"Graph views\"></div> <button type=\"button\" class=\"pc-graph-view-overflow svelte-7ptwed\" aria-label=\"Graph view actions\" title=\"Focus, close or reopen graph views\" aria-haspopup=\"menu\">⋯</button> <!></nav>"), po = /* @__PURE__ */ K("<nav class=\"pc-graph-tabs\" aria-label=\"Open graph views\"><button type=\"button\" class=\"pc-graph-tab\" aria-current=\"page\" title=\"Main graph\">Graph 1</button></nav>");
function mo(e, t) {
	Be(t, !0);
	let n = Si(t, "actions", 19, () => ({})), r = Si(t, "idPrefix", 3, "pc-graph-view"), i = /* @__PURE__ */ L(null), a = /* @__PURE__ */ L(null), o = /* @__PURE__ */ L(null), s = /* @__PURE__ */ L(!1), c = /* @__PURE__ */ L(""), l = "", u = {};
	vn(() => {
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
	var y = Or();
	gr("pointerdown", en, (e) => {
		W(s) && !W(i)?.contains(e.target) && h();
	});
	var b = B(y), x = (e) => {
		var l = fo(), h = z(l);
		X(h, 23, () => t.views.tabs, (e) => e.key, (e, n, i) => {
			var a = co();
			let o;
			var s = z(a);
			let l;
			var h = z(s), g = z(h, !0);
			P(h);
			var _ = V(h), v = (e) => {
				q(e, oo());
			};
			Y(_, (e) => {
				W(n).readOnly && e(v);
			}), P(s), xi(s, (e, t) => u[t.key] = e, (e) => u?.[e.key], () => [W(n)]);
			var y = V(s, 2), b = (e) => {
				var r = so();
				H((e, i) => {
					$(r, "aria-label", e), $(r, "title", i), $(r, "tabindex", W(n).key === (W(c) || t.views.active.key) ? 0 : -1);
				}, [() => `Close ${W(n).label} · ${d(W(n))}`, () => `Close ${d(W(n))}`]), G("click", r, () => m(W(n))), q(e, r);
			};
			Y(y, (e) => {
				W(n).identity.kind !== "root" && e(b);
			}), P(a), H((e) => {
				o = Z(a, 1, "pc-graph-tab-item svelte-7ptwed", null, o, { "pc-graph-tab-active": W(n).key === t.views.active.key }), l = Z(s, 1, "pc-graph-tab svelte-7ptwed", null, l, { "pc-graph-tab-closeable": W(n).identity.kind !== "root" }), $(s, "id", `${r()}-${W(i)}`), $(s, "aria-controls", t.panelId), $(s, "aria-selected", W(n).key === t.views.active.key), $(s, "tabindex", W(n).key === (W(c) || t.views.active.key) ? 0 : -1), $(s, "title", e), J(g, W(n).label);
			}, [() => d(W(n))]), G("click", s, () => f(W(n).key)), G("keydown", s, (e) => p(e, W(i))), q(e, a);
		}), P(h);
		var y = V(h, 2);
		xi(y, (e) => R(o, e), () => W(o));
		var b = V(y, 2), x = (e) => {
			var r = uo(), i = z(r);
			X(i, 17, () => t.views.tabs, (e) => e.key, (e, t) => {
				var n = lo(), r = z(n);
				P(n), H((e, t) => {
					$(n, "title", e), J(r, `Focus ${t ?? ""}`);
				}, [() => d(W(t)), () => d(W(t))]), G("click", n, () => v(() => f(W(t).key))), q(e, n);
			});
			var o = V(i, 2), s = V(o, 2);
			X(V(s, 2), 17, () => t.views.closedViews, (e) => e.key, (e, t) => {
				var r = lo(), i = z(r);
				P(r), H((e, n) => {
					$(r, "title", e), J(i, `Reopen ${W(t).label ?? ""} · ${n ?? ""}`);
				}, [() => d(W(t)), () => d(W(t))]), G("click", r, () => v(() => n().reopenView?.(W(t).key))), q(e, r);
			}), P(r), xi(r, (e) => R(a, e), () => W(a)), H((e) => {
				o.disabled = t.views.active.identity.kind === "root" || !n().closeView, s.disabled = e;
			}, [() => t.views.tabs.every((e) => e.identity.kind === "root" || e.key === t.views.active.key) || !n().closeOtherViews]), G("keydown", r, _), G("click", o, () => v(() => m(t.views.active))), G("click", s, () => v(() => n().closeOtherViews?.(t.views.active.key))), q(e, r);
		};
		Y(b, (e) => {
			W(s) && e(x);
		}), P(l), xi(l, (e) => R(i, e), () => W(i)), H(() => $(y, "aria-expanded", W(s))), G("click", y, g), q(e, l);
	}, S = (e) => {
		q(e, po());
	};
	Y(b, (e) => {
		t.views ? e(x) : e(S, -1);
	}), q(e, y), Ve();
}
_r(["click", "keydown"]);
//#endregion
//#region ui/GraphBreadcrumbs.svelte
var ho = /* @__PURE__ */ K("<span aria-current=\"page\" class=\"svelte-18ovafz\"> </span>"), go = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-18ovafz\"> </button>"), _o = /* @__PURE__ */ K("<li class=\"svelte-18ovafz\"><!></li>"), vo = /* @__PURE__ */ K("<div class=\"pc-graph-location svelte-18ovafz\"><nav aria-label=\"Graph location\" class=\"svelte-18ovafz\"><ol class=\"svelte-18ovafz\"></ol></nav> <span class=\"pc-graph-scope svelte-18ovafz\"> <!><!></span></div>");
function yo(e, t) {
	Be(t, !0);
	let n = Si(t, "actions", 19, () => ({})), r = /* @__PURE__ */ F(() => t.view?.identity.kind === "library" ? t.view.identity.definitionRef : t.definitionRef ?? t.view?.definitionRef);
	function i(e) {
		return e.identity.kind === "instance" ? !!n().openInstance : !!n().focusView;
	}
	function a(e) {
		e.identity.kind === "instance" ? n().openInstance?.(e.identity.instancePath) : n().focusView?.(e.key);
	}
	var o = Or(), s = B(o), c = (e) => {
		var n = vo(), o = z(n), s = z(o);
		X(s, 23, () => t.view.breadcrumbs, (e) => e.key, (e, n, r) => {
			var o = _o(), s = z(o), c = (e) => {
				var t = ho(), r = z(t, !0);
				P(t), H(() => J(r, W(n).label)), q(e, t);
			}, l = (e) => {
				var t = go(), r = z(t, !0);
				P(t), H((e) => {
					t.disabled = e, J(r, W(n).label);
				}, [() => !i(W(n))]), G("click", t, () => a(W(n))), q(e, t);
			};
			Y(s, (e) => {
				W(r) === t.view.breadcrumbs.length - 1 ? e(c) : e(l, -1);
			}), P(o), q(e, o);
		}), P(s), P(o);
		var c = V(o, 2), l = z(c, !0), u = V(l), d = (e) => {
			var t = Dr();
			H(() => J(t, `· v${W(r).version ?? ""}`)), q(e, t);
		};
		Y(u, (e) => {
			W(r) && e(d);
		});
		var f = V(u), p = (e) => {
			q(e, Dr("· Read only"));
		};
		Y(f, (e) => {
			(t.view.readOnly || t.view.identity.kind === "library") && e(p);
		}), P(c), P(n), H(() => {
			$(c, "title", W(r) ? `${W(r).id} · v${W(r).version} · ${W(r).semanticHash}` : void 0), J(l, t.view.identity.kind === "library" ? "Library inspection" : "Instance graph");
		}), q(e, n);
	};
	Y(s, (e) => {
		t.view && t.view.identity.kind !== "root" && e(c);
	}), q(e, o), Ve();
}
_r(["click"]);
//#endregion
//#region ui/NodeDetails.svelte
var bo = /* @__PURE__ */ K("<p class=\"pc-detail-error svelte-59ntjv\" role=\"alert\"> </p>"), xo = /* @__PURE__ */ K("<option class=\"svelte-59ntjv\"> </option>"), So = /* @__PURE__ */ K("<select class=\"svelte-59ntjv\"></select>"), Co = /* @__PURE__ */ K("<input type=\"checkbox\" class=\"svelte-59ntjv\"/>"), wo = /* @__PURE__ */ K("<input type=\"number\" class=\"svelte-59ntjv\"/>"), To = /* @__PURE__ */ K("<textarea class=\"svelte-59ntjv\"></textarea>"), Eo = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-59ntjv\"> </button>"), Do = /* @__PURE__ */ K("<small class=\"svelte-59ntjv\"> </small>"), Oo = /* @__PURE__ */ K("<small class=\"svelte-59ntjv\"> <!></small>"), ko = /* @__PURE__ */ K("<label class=\"svelte-59ntjv\"> <!></label> <!> <!> <!> <!> <!>", 1), Ao = /* @__PURE__ */ K("<label class=\"svelte-59ntjv\">Connection profile<select aria-label=\"Connection profile\" class=\"svelte-59ntjv\"><option class=\"svelte-59ntjv\">Choose a connection</option><!></select></label>"), jo = /* @__PURE__ */ K("<label class=\"svelte-59ntjv\">Model identifier<input aria-label=\"Model identifier\" class=\"svelte-59ntjv\"/></label>"), Mo = /* @__PURE__ */ K("<p class=\"pc-detail-error svelte-59ntjv\"> </p>"), No = /* @__PURE__ */ K("<fieldset class=\"pc-detail-group svelte-59ntjv\" data-model-controls=\"\"><legend class=\"svelte-59ntjv\">Model</legend> <label class=\"svelte-59ntjv\">Model role<input aria-label=\"Model role\" class=\"svelte-59ntjv\"/></label> <label class=\"svelte-59ntjv\">Connection mode<select aria-label=\"Connection mode\" class=\"svelte-59ntjv\"></select></label> <!> <label class=\"svelte-59ntjv\">Model mode<select aria-label=\"Model mode\" class=\"svelte-59ntjv\"></select></label> <!> <small class=\"svelte-59ntjv\"> </small><small class=\"svelte-59ntjv\"> </small> <!> <!></fieldset>"), Po = /* @__PURE__ */ K("<p class=\"pc-detail-port svelte-59ntjv\"> <small class=\"svelte-59ntjv\"> </small></p>"), Fo = /* @__PURE__ */ K("<details class=\"svelte-59ntjv\"><summary class=\"svelte-59ntjv\">Inputs and outputs</summary><!></details>"), Io = /* @__PURE__ */ K("<p role=\"status\" class=\"svelte-59ntjv\"> </p>"), Lo = /* @__PURE__ */ K("<header class=\"svelte-59ntjv\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-59ntjv\"><path class=\"svelte-59ntjv\"></path></svg><div class=\"svelte-59ntjv\"><h3 class=\"svelte-59ntjv\"> </h3><small class=\"svelte-59ntjv\"> </small></div></header> <p class=\"pc-detail-meta svelte-59ntjv\"> <!></p> <fieldset class=\"pc-detail-group svelte-59ntjv\"><legend class=\"svelte-59ntjv\">Presentation</legend> <label class=\"svelte-59ntjv\">Alias<input aria-label=\"Alias\" maxlength=\"80\" class=\"svelte-59ntjv\"/></label> <button type=\"button\" class=\"svelte-59ntjv\">Reset alias</button> <label class=\"pc-detail-check svelte-59ntjv\"><input aria-label=\"Compact card\" type=\"checkbox\" class=\"svelte-59ntjv\"/> Compact card</label> <!></fieldset> <fieldset class=\"pc-detail-group svelte-59ntjv\"><legend class=\"svelte-59ntjv\">Operation</legend> <label class=\"pc-detail-check svelte-59ntjv\"><input aria-label=\"Enabled\" type=\"checkbox\" class=\"svelte-59ntjv\"/> Enabled</label> <small class=\"svelte-59ntjv\">Disabled operations block execution.</small> <!> <!></fieldset> <!> <!> <!> <!> <footer class=\"svelte-59ntjv\"><button type=\"button\" class=\"svelte-59ntjv\">Duplicate</button><button type=\"button\" class=\"pc-detail-danger svelte-59ntjv\">Delete</button></footer>", 1), Ro = /* @__PURE__ */ K("<p class=\"pc-detail-empty svelte-59ntjv\">Select a node to inspect its settings.</p>"), zo = /* @__PURE__ */ K("<section class=\"pc-node-details svelte-59ntjv\" aria-label=\"Node details\"><!></section>");
function Bo(e, t) {
	Be(t, !0);
	let n = Si(t, "actions", 19, () => ({})), r = Si(t, "idPrefix", 3, "pc-node-details"), i = /* @__PURE__ */ L(Zt({})), a = /* @__PURE__ */ L(Zt({})), o = "", s = "", c = 0, l = /* @__PURE__ */ new Map(), u = (e) => JSON.stringify([e.selectionKey, "kind" in e.address ? [
		e.address.kind,
		e.address.definitionRef.id,
		e.address.definitionRef.version,
		e.address.definitionRef.semanticHash,
		e.address.nodeId
	] : [
		e.address.workflowId,
		e.address.instancePath,
		e.address.nodeId
	]]), d = !0;
	zr(() => {
		d = !1, l.clear();
	}), vn(() => {
		let e = t.view ? u(t.view) : "", n = t.view?.revision ?? "", r = e !== o;
		(r || n !== s) && (o = e, s = n, l.clear(), c++, R(a, {}, !0), R(i, r ? {} : dr(() => Object.fromEntries(Object.entries(W(i)).map(([e, t]) => [e, {
			...t,
			pending: !1
		}]))), !0));
	});
	let f = (e) => ({
		selectionKey: e.selectionKey,
		revision: e.revision,
		address: "kind" in e.address ? {
			...e.address,
			definitionRef: { ...e.address.definitionRef }
		} : {
			...e.address,
			instancePath: [...e.address.instancePath]
		}
	}), p = (e) => d && !!t.view && t.view.selectionKey === e.selectionKey && t.view.revision === e.revision && u(t.view) === u(e);
	function m(e) {
		return e.editor === "json" ? e.representation === "json-text" ? String(e.value ?? "") : JSON.stringify(e.value, null, 2) : e.editor === "lines" && Array.isArray(e.value) ? e.value.join("\n") : String(e.value ?? "");
	}
	async function h(e, n, r) {
		let o = t.view;
		if (!o || (n ? !o.canPresent : o.readOnly)) return;
		let s = f(o), u = ++c;
		l.set(e, u), R(a, {
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
		if (p(s) && l.get(e) === u && (l.delete(e), R(a, {
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
	function g(e, n) {
		t.view && !t.view.readOnly && (l.delete(e.key), R(i, {
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
	function _(e) {
		if (!t.view || t.view.readOnly || !n().editControl) return;
		let r = W(i)[e.key]?.text ?? m(e), a = r;
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
		h(e.key, !1, (t) => n().editControl(t, e.key, a));
	}
	function v(e, t) {
		n().editControl && h(e.key, !1, (r) => n().editControl(r, e.key, t));
	}
	function y(e, t, r) {
		b(e)?.allowedModes.some((e) => e.value === t) && n().editBinding && h(e, !1, (i) => n().editBinding(i, e, t, r));
	}
	let b = (e) => e === "profileId" ? t.view?.model?.profile : t.view?.model?.model, x = (e) => W(i)[e] ? "override" : b(e)?.mode, S = (e) => W(i)[e]?.text ?? b(e)?.value ?? "";
	function C(e, r) {
		t.view && !t.view.readOnly && n().editBinding && b(e)?.allowedModes.some((e) => e.value === "override") && (l.delete(e), R(i, {
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
	function w(e, r) {
		let o = b(e);
		if (!t.view || t.view.readOnly || !n().editBinding || !o?.allowedModes.some((e) => e.value === r)) return;
		if (r === "override") {
			C(e, S(e));
			return;
		}
		l.delete(e);
		let s = { ...W(i) };
		delete s[e], R(i, s, !0), R(a, {
			...W(a),
			[e]: ""
		}, !0), r !== o.mode && y(e, r, null);
	}
	function T(e, r) {
		t.view && !t.view.readOnly && x(e) === "override" && n().editBinding && b(e)?.allowedModes.some((e) => e.value === "override") && (C(e, r), r.trim() ? y(e, "override", r) : R(i, {
			...W(i),
			[e]: {
				text: r,
				error: e === "profileId" ? "Choose a connection before saving an override." : "Enter a model identifier before saving an override.",
				pending: !1
			}
		}, !0));
	}
	var E = zo(), D = z(E), ee = (e) => {
		var o = Lo(), s = B(o), c = z(s), l = z(c);
		P(c);
		var u = V(c), d = z(u), p = z(d, !0);
		P(d);
		var y = V(d), b = z(y);
		P(y), P(u), P(s);
		var E = V(s, 2), D = z(E), ee = V(D), te = (e) => {
			q(e, Dr("· Read-only body"));
		};
		Y(ee, (e) => {
			t.view.readOnly && e(te);
		}), P(E);
		var ne = V(E, 2), O = V(z(ne), 2), k = V(z(O));
		Q(k), P(O);
		var A = V(O, 2), j = V(A, 2), re = z(j);
		Q(re), ke(), P(j);
		var ie = V(j, 2), ae = (e) => {
			var t = bo(), n = z(t, !0);
			P(t), H(() => J(n, W(a).alias || W(a).compact)), q(e, t);
		};
		Y(ie, (e) => {
			(W(a).alias || W(a).compact) && e(ae);
		}), P(ne);
		var oe = V(ne, 2), se = V(z(oe), 2), ce = z(se);
		Q(ce), ke(), P(se);
		var le = V(se, 4), ue = (e) => {
			var t = bo(), n = z(t, !0);
			P(t), H(() => J(n, W(a).enabled)), q(e, t);
		};
		Y(le, (e) => {
			W(a).enabled && e(ue);
		}), X(V(le, 2), 17, () => t.view.controls, (e) => e.key, (e, o) => {
			var s = ko(), c = B(s), l = z(c), u = V(l), d = (e) => {
				var r = So();
				X(r, 21, () => W(o).options ?? [], (e) => e.value, (e, t) => {
					var n = xo(), r = z(n, !0);
					P(n);
					var i = {};
					H(() => {
						J(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
					}), q(e, n);
				}), P(r);
				var i;
				oi(r), H((e) => {
					$(r, "aria-label", W(o).label), r.disabled = t.view.readOnly || !n().editControl, i !== (i = e) && (r.value = (r.__value = e) ?? "", ai(r, e));
				}, [() => String(W(o).value)]), G("change", r, (e) => v(W(o), e.currentTarget.value)), q(e, r);
			}, f = (e) => {
				var r = Co();
				Q(r), H((e) => {
					$(r, "aria-label", W(o).label), pi(r, e), r.disabled = t.view.readOnly || !n().editControl;
				}, [() => !!W(o).value]), G("change", r, (e) => v(W(o), e.currentTarget.checked)), q(e, r);
			}, p = (e) => {
				var r = wo();
				Q(r), H((e) => {
					$(r, "aria-label", W(o).label), $(r, "min", W(o).min), $(r, "max", W(o).max), fi(r, e), r.disabled = t.view.readOnly || !n().editControl;
				}, [() => Number(W(o).value)]), G("change", r, (e) => v(W(o), Number(e.currentTarget.value))), q(e, r);
			}, h = (e) => {
				var s = To();
				nt(s), H((e) => {
					$(s, "aria-label", W(o).label), $(s, "aria-invalid", !!(W(i)[W(o).key]?.error || W(a)[W(o).key])), $(s, "aria-describedby", W(i)[W(o).key]?.error || W(a)[W(o).key] ? r() + "-error-" + W(o).key : void 0), fi(s, e), s.disabled = t.view.readOnly || !n().editControl;
				}, [() => W(i)[W(o).key]?.text ?? m(W(o))]), G("input", s, (e) => g(W(o), e.currentTarget.value)), q(e, s);
			}, y = (e) => {
				var r = To();
				nt(r), H((e) => {
					$(r, "aria-label", W(o).label), fi(r, e), r.disabled = t.view.readOnly || !n().editControl;
				}, [() => m(W(o))]), G("change", r, (e) => v(W(o), e.currentTarget.value)), q(e, r);
			};
			Y(u, (e) => {
				W(o).editor === "enum" ? e(d) : W(o).editor === "boolean" ? e(f, 1) : W(o).editor === "number" ? e(p, 2) : W(o).editor === "json" || W(o).editor === "lines" ? e(h, 3) : e(y, -1);
			}), P(c);
			var b = V(c, 2), x = (e) => {
				var r = Eo(), a = z(r, !0);
				P(r), H(() => {
					$(r, "data-save-control", W(o).key), r.disabled = t.view.readOnly || !n().editControl || !!W(i)[W(o).key]?.pending, J(a, W(i)[W(o).key]?.pending ? "Validating…" : "Save " + W(o).label);
				}), G("click", r, () => _(W(o))), q(e, r);
			};
			Y(b, (e) => {
				(W(o).editor === "json" || W(o).editor === "lines") && e(x);
			});
			var S = V(b, 2), C = (e) => {
				var t = Do(), n = z(t, !0);
				P(t), H(() => J(n, W(o).help)), q(e, t);
			};
			Y(S, (e) => {
				W(o).help && e(C);
			});
			var w = V(S, 2), T = (e) => {
				var t = Do(), n = z(t, !0);
				P(t), H(() => J(n, W(o).exposureNote)), q(e, t);
			};
			Y(w, (e) => {
				W(o).exposureNote && e(T);
			});
			var E = V(w, 2), D = (e) => {
				var t = Oo(), n = z(t), r = V(n), i = (e) => {
					var t = Dr();
					H(() => J(t, `· ${W(o).source ?? ""}`)), q(e, t);
				};
				Y(r, (e) => {
					W(o).source && e(i);
				}), P(t), H(() => J(n, `Effective: ${W(o).effective ?? ""}`)), q(e, t);
			};
			Y(E, (e) => {
				W(o).effective !== void 0 && e(D);
			});
			var ee = V(E, 2), te = (e) => {
				var t = bo(), n = z(t, !0);
				P(t), H(() => {
					$(t, "id", r() + "-error-" + W(o).key), J(n, W(i)[W(o).key]?.error || W(a)[W(o).key]);
				}), q(e, t);
			};
			Y(ee, (e) => {
				(W(i)[W(o).key]?.error || W(a)[W(o).key]) && e(te);
			}), H(() => J(l, `${W(o).label ?? ""} `)), q(e, s);
		}), P(oe);
		var de = V(oe, 2), fe = (e) => {
			var r = No(), o = V(z(r), 2), s = V(z(o));
			Q(s), P(o);
			var c = V(o, 2), l = V(z(c));
			X(l, 21, () => t.view.model.profile.allowedModes, (e) => e.value, (e, t) => {
				var n = xo(), r = z(n, !0);
				P(n);
				var i = {};
				H(() => {
					J(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
				}), q(e, n);
			}), P(l);
			var u;
			oi(l), P(c);
			var d = V(c, 2), f = (e) => {
				var r = Ao(), i = V(z(r)), a = z(i);
				a.value = a.__value = "", X(V(a), 17, () => t.view.model.profile.options ?? [], (e) => e.value, (e, t) => {
					var n = xo(), r = z(n, !0);
					P(n);
					var i = {};
					H(() => {
						J(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
					}), q(e, n);
				}), P(i);
				var o;
				oi(i), P(r), H((e) => {
					i.disabled = t.view.readOnly || !n().editBinding, o !== (o = e) && (i.value = (i.__value = e) ?? "", ai(i, e));
				}, [() => S("profileId")]), G("change", i, (e) => T("profileId", e.currentTarget.value)), q(e, r);
			}, p = /* @__PURE__ */ F(() => x("profileId") === "override");
			Y(d, (e) => {
				W(p) && e(f);
			});
			var m = V(d, 2), g = V(z(m));
			X(g, 21, () => t.view.model.model.allowedModes, (e) => e.value, (e, t) => {
				var n = xo(), r = z(n, !0);
				P(n);
				var i = {};
				H(() => {
					J(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
				}), q(e, n);
			}), P(g);
			var _;
			oi(g), P(m);
			var v = V(m, 2), y = (e) => {
				var r = jo(), i = V(z(r));
				Q(i), P(r), H((e) => {
					fi(i, e), i.disabled = t.view.readOnly || !n().editBinding;
				}, [() => S("model")]), G("input", i, (e) => C("model", e.currentTarget.value)), G("change", i, (e) => T("model", e.currentTarget.value)), q(e, r);
			}, b = /* @__PURE__ */ F(() => x("model") === "override");
			Y(v, (e) => {
				W(b) && e(y);
			});
			var E = V(v, 2), D = z(E);
			P(E);
			var ee = V(E), te = z(ee, !0);
			P(ee);
			var ne = V(ee, 2), O = (e) => {
				var n = Mo(), r = z(n, !0);
				P(n), H(() => J(r, t.view.model.issue)), q(e, n);
			};
			Y(ne, (e) => {
				t.view.model.issue && e(O);
			});
			var k = V(ne, 2), A = (e) => {
				var t = bo(), n = z(t, !0);
				P(t), H(() => J(n, W(a).modelRole || W(i).profileId?.error || W(a).profileId || W(i).model?.error || W(a).model)), q(e, t);
			};
			Y(k, (e) => {
				(W(a).modelRole || W(i).profileId?.error || W(a).profileId || W(i).model?.error || W(a).model) && e(A);
			}), P(r), H((e, r) => {
				fi(s, t.view.model.role), s.disabled = t.view.readOnly || !t.view.model.roleEditable || !n().editField, l.disabled = t.view.readOnly || !n().editBinding, u !== (u = e) && (l.value = (l.__value = e) ?? "", ai(l, e)), g.disabled = t.view.readOnly || !n().editBinding, _ !== (_ = r) && (g.value = (g.__value = r) ?? "", ai(g, r)), J(D, `Effective connection: ${t.view.model.effective ?? ""}`), J(te, t.view.model.source);
			}, [() => x("profileId"), () => x("model")]), G("change", s, (e) => {
				let r = e.currentTarget.value;
				t.view?.model?.roleEditable && n().editField && h("modelRole", !1, (e) => n().editField(e, "modelRole", r));
			}), G("change", l, (e) => w("profileId", e.currentTarget.value)), G("change", g, (e) => w("model", e.currentTarget.value)), q(e, r);
		};
		Y(de, (e) => {
			t.view.model && e(fe);
		});
		var pe = V(de, 2), me = (e) => {
			var n = Fo();
			X(V(z(n)), 17, () => t.view.ports, (e) => e.direction + ":" + e.id, (e, t) => {
				var n = Po(), r = z(n), i = V(r), a = z(i, !0);
				P(i), P(n), H(() => {
					J(r, `${W(t).direction === "input" ? "In" : "Out"} · ${W(t).label ?? ""}`), J(a, W(t).kind);
				}), q(e, n);
			}), P(n), q(e, n);
		};
		Y(pe, (e) => {
			t.view.ports.length && e(me);
		});
		var he = V(pe, 2), ge = (e) => {
			var n = Io(), r = z(n, !0);
			P(n), H(() => J(r, t.view.status)), q(e, n);
		};
		Y(he, (e) => {
			t.view.status && e(ge);
		});
		var _e = V(he, 2);
		X(_e, 17, () => t.view.issues ?? [], Br, (e, t) => {
			var n = Mo(), r = z(n, !0);
			P(n), H(() => J(r, W(t))), q(e, n);
		});
		var ve = V(_e, 2), ye = z(ve), be = V(ye);
		P(ve), H(() => {
			$(l, "d", t.view.iconPath), J(p, t.view.title), J(b, `Canonical type: ${t.view.canonicalTitle ?? ""}`), J(D, `${t.view.family ?? ""} · ${t.view.phase ?? ""} phase`), fi(k, t.view.alias), k.disabled = !t.view.canPresent || !n().present, A.disabled = !t.view.canPresent || !n().present, pi(re, t.view.compact), re.disabled = !t.view.canPresent || !n().present, pi(ce, t.view.enabled), ce.disabled = t.view.readOnly || !n().editField, ye.disabled = t.view.readOnly || !n().duplicate, be.disabled = t.view.readOnly || !n().remove;
		}), G("change", k, (e) => {
			let t = e.currentTarget.value;
			n().present && h("alias", !0, (e) => n().present(e, "alias", t));
		}), G("click", A, () => {
			n().present && h("alias", !0, (e) => n().present(e, "alias", ""));
		}), G("change", re, (e) => {
			let t = e.currentTarget.checked;
			n().present && h("compact", !0, (e) => n().present(e, "compact", t));
		}), G("change", ce, (e) => {
			let t = e.currentTarget.checked;
			n().editField && h("enabled", !1, (e) => n().editField(e, "enabled", t));
		}), G("click", ye, () => {
			t.view && !t.view.readOnly && n().duplicate?.(f(t.view));
		}), G("click", be, () => {
			t.view && !t.view.readOnly && n().remove?.(f(t.view));
		}), q(e, o);
	}, te = (e) => {
		q(e, Ro());
	};
	Y(D, (e) => {
		t.view ? e(ee) : e(te, -1);
	}), P(E), q(e, E), Ve();
}
_r([
	"change",
	"click",
	"input"
]);
//#endregion
//#region ui/OutputPreview.svelte
var Vo = /* @__PURE__ */ K("<option class=\"svelte-ee2ehy\"> </option>"), Ho = /* @__PURE__ */ K("<label class=\"pc-preview-choice svelte-ee2ehy\"><span class=\"pc-preview-sr-only svelte-ee2ehy\">Preview output</span><select aria-label=\"Preview output\" class=\"svelte-ee2ehy\"><option disabled=\"\" class=\"svelte-ee2ehy\">Choose an output</option><!></select></label>"), Uo = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-ee2ehy\">Collapse preview</button>"), Wo = /* @__PURE__ */ K("<button type=\"button\" role=\"tab\" class=\"svelte-ee2ehy\"> </button>"), Go = /* @__PURE__ */ K("<div class=\"pc-preview-tabs svelte-ee2ehy\" role=\"tablist\" aria-label=\"Recorded artifacts\"></div>"), Ko = /* @__PURE__ */ K("<p class=\"pc-preview-note svelte-ee2ehy\"> </p>"), qo = /* @__PURE__ */ K("<pre class=\"svelte-ee2ehy\"> </pre>"), Jo = /* @__PURE__ */ K("<small class=\"pc-preview-note svelte-ee2ehy\"> </small>"), Yo = /* @__PURE__ */ K("<div role=\"tabpanel\" tabindex=\"0\" class=\"svelte-ee2ehy\"><article class=\"svelte-ee2ehy\"><div class=\"pc-preview-section-heading svelte-ee2ehy\"><span class=\"svelte-ee2ehy\"> </span><small class=\"svelte-ee2ehy\"> </small></div> <!> <!></article></div>"), Xo = /* @__PURE__ */ K("<p class=\"pc-preview-empty svelte-ee2ehy\"> </p>"), Zo = /* @__PURE__ */ K("<p class=\"pc-preview-error svelte-ee2ehy\"> </p>"), Qo = /* @__PURE__ */ K("<small class=\"pc-preview-note svelte-ee2ehy\">Apply rechecks the source and connection. Recorded preview text may be truncated.</small>"), $o = /* @__PURE__ */ K("<button type=\"button\" data-run-here=\"\" title=\"Runs the selected output's dependencies. Results are diagnostic previews.\" class=\"svelte-ee2ehy\"> </button>"), es = /* @__PURE__ */ K("<button type=\"button\" data-preview-apply=\"\" class=\"svelte-ee2ehy\">Apply reviewed candidate</button><button type=\"button\" class=\"svelte-ee2ehy\">Reject candidate</button>", 1), ts = /* @__PURE__ */ K("<header class=\"svelte-ee2ehy\"><h3 class=\"svelte-ee2ehy\"> </h3> <!> <div class=\"pc-preview-tools svelte-ee2ehy\"><button type=\"button\" class=\"svelte-ee2ehy\">Follow selection</button><button type=\"button\" class=\"svelte-ee2ehy\"> </button><!></div></header> <!> <div class=\"pc-preview-sections svelte-ee2ehy\"><!> <!> <!> <!> <!> <!> <!></div> <footer class=\"svelte-ee2ehy\"><span class=\"pc-preview-status svelte-ee2ehy\"> </span> <span class=\"svelte-ee2ehy\"> </span> <!> <!></footer>", 1), ns = /* @__PURE__ */ K("<p class=\"pc-preview-empty svelte-ee2ehy\">Select a node output to inspect its recorded result.</p>"), rs = /* @__PURE__ */ K("<section class=\"pc-output-preview svelte-ee2ehy\" aria-label=\"Output preview\"><!></section>");
function is(e, t) {
	let n = kr();
	Be(t, !0);
	let r = Si(t, "actions", 19, () => ({})), i = /* @__PURE__ */ F(() => JSON.stringify([t.view?.sourceKey, t.view?.selectedKey])), a = /* @__PURE__ */ L(Zt({
		scope: "",
		id: null
	})), o = /* @__PURE__ */ F(() => (W(a).scope === W(i) ? t.view?.sections.find((e) => e.id === W(a).id) : null) ?? t.view?.sections[0] ?? null);
	vn(() => {
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
		return "kind" in e ? {
			kind: "schema2-candidate",
			reviewId: e.reviewId,
			terminal: t
		} : {
			handleId: e.handleId,
			runId: e.runId,
			terminal: t
		};
	}
	var y = rs(), b = z(y), x = (e) => {
		var d = ts(), m = B(d), y = z(m), b = z(y, !0);
		P(y);
		var x = V(y, 2), S = (e) => {
			var n = Ho(), i = V(z(n)), a = z(i);
			a.value = a.__value = "", X(V(a), 17, () => t.view.choices, (e) => e.key, (e, t) => {
				var n = Vo(), r = z(n);
				P(n);
				var i = {};
				H(() => {
					J(r, `${W(t).label ?? ""} · ${W(t).kind ?? ""}`), i !== (i = W(t).key) && (n.value = (n.__value = W(t).key) ?? "");
				}), q(e, n);
			}), P(i);
			var o;
			oi(i), P(n), H(() => {
				i.disabled = !r().select, o !== (o = t.view.selectedKey ?? "") && (i.value = (i.__value = t.view.selectedKey ?? "") ?? "", ai(i, t.view.selectedKey ?? ""));
			}), G("change", i, (e) => _(e.currentTarget.value)), q(e, n);
		};
		Y(x, (e) => {
			t.view.choices.length && e(S);
		});
		var C = V(x, 2), w = z(C), T = V(w), E = z(T, !0);
		P(T);
		var D = V(T), ee = (e) => {
			var n = Uo();
			G("click", n, function(...e) {
				t.collapse?.apply(this, e);
			}), q(e, n);
		};
		Y(D, (e) => {
			t.collapse && e(ee);
		}), P(C), P(m);
		var te = V(m, 2), ne = (e) => {
			var r = Go();
			X(r, 23, () => t.view.sections, (e) => e.id, (e, t, r) => {
				var l = Wo(), u = z(l, !0);
				P(l), H((e) => {
					$(l, "id", e), $(l, "aria-selected", W(o)?.id === W(t).id), $(l, "aria-controls", n + "-panel"), $(l, "tabindex", W(o)?.id === W(t).id ? 0 : -1), J(u, W(t).label);
				}, [() => s(W(t).id)]), G("click", l, () => {
					R(a, {
						scope: W(i),
						id: W(t).id
					}, !0);
				}), gr("keydown", l, (e) => c(e, W(r)), !0), q(e, l);
			}), P(r), q(e, r);
		};
		Y(te, (e) => {
			t.view.sections.length && e(ne);
		});
		var O = V(te, 2), k = z(O), A = (e) => {
			let t = /* @__PURE__ */ F(() => W(o));
			var r = Yo(), i = z(r), a = z(i), c = z(a), l = z(c, !0);
			P(c);
			var u = V(c), d = z(u, !0);
			P(u), P(a);
			var f = V(a, 2), p = (e) => {
				var n = Ko(), r = z(n, !0);
				P(n), H(() => J(r, W(t).text)), q(e, n);
			}, m = (e) => {
				var n = qo(), r = z(n, !0);
				P(n), H(() => J(r, W(t).text)), q(e, n);
			};
			Y(f, (e) => {
				W(t).format === "omitted" ? e(p) : e(m, -1);
			});
			var h = V(f, 2), g = (e) => {
				var n = Jo(), r = z(n);
				P(n), H(() => J(r, `Truncated diagnostic${W(t).format === "json-prefix-text" ? " · JSON prefix shown as text" : ""}`)), q(e, n);
			};
			Y(h, (e) => {
				W(t).truncated && e(g);
			}), P(i), P(r), H((e) => {
				$(r, "id", n + "-panel"), $(r, "aria-labelledby", e), $(i, "data-artifact-kind", W(t).kind), J(l, W(t).label), J(d, W(t).kind);
			}, [() => s(W(t).id)]), gr("keydown", r, (e) => e.stopPropagation(), !0), gr("paste", r, (e) => e.stopPropagation(), !0), q(e, r);
		}, j = (e) => {
			var n = Xo(), r = z(n, !0);
			P(n), H(() => J(r, t.view.status === "not-run" ? "Run this workflow or use Run to here to inspect an output." : "No recorded artifact is available for this output.")), q(e, n);
		};
		Y(k, (e) => {
			W(o) ? e(A) : e(j, -1);
		});
		var re = V(k, 2), ie = (e) => {
			var n = Ko(), r = z(n, !0);
			P(n), H(() => J(r, t.view.statusDetail)), q(e, n);
		};
		Y(re, (e) => {
			t.view.statusDetail && e(ie);
		});
		var ae = V(re, 2);
		X(ae, 17, () => t.view.sections.filter((e) => e.id !== W(o)?.id && (e.format === "omitted" || e.truncated)), (e) => e.id, (e, t) => {
			var n = Ko(), r = z(n);
			P(n), H(() => J(r, `${W(t).label ?? ""}: ${(W(t).format === "omitted" ? W(t).text : "Truncated diagnostic" + (W(t).format === "json-prefix-text" ? " · JSON prefix shown as text" : "")) ?? ""}`)), q(e, n);
		});
		var oe = V(ae, 2), se = (e) => {
			var n = Ko(), r = z(n, !0);
			P(n), H(() => J(r, t.view.runHere.issue)), q(e, n);
		};
		Y(oe, (e) => {
			t.view.runHere?.issue && e(se);
		});
		var ce = V(oe, 2);
		X(ce, 17, () => t.view.issues, Br, (e, t) => {
			var n = Zo(), r = z(n, !0);
			P(n), H(() => J(r, W(t))), q(e, n);
		});
		var le = V(ce, 2), ue = (e) => {
			var n = Zo(), r = z(n, !0);
			P(n), H(() => J(r, t.view.review.issue)), q(e, n);
		};
		Y(le, (e) => {
			t.view.review?.issue && e(ue);
		});
		var de = V(le, 2), fe = (e) => {
			q(e, Qo());
		};
		Y(de, (e) => {
			t.view.review && e(fe);
		}), P(O);
		var pe = V(O, 2), me = z(pe), he = z(me, !0);
		P(me);
		var ge = V(me, 2), _e = z(ge, !0);
		P(ge);
		var ve = V(ge, 2), ye = (e) => {
			var n = $o(), i = z(n);
			P(n), H(() => {
				n.disabled = !W(p), J(i, `Run to here · maximum ${t.view.runHere.callBound ?? ""} ${t.view.runHere.callBound === 1 ? "request" : "requests"}`);
			}), G("click", n, () => {
				t.view && W(l) && W(p) && r().runHere?.(t.view.sourceKey, f(W(l).target));
			}), q(e, n);
		};
		Y(ve, (e) => {
			t.view.runHere && e(ye);
		});
		var be = V(ve, 2), xe = (e) => {
			var n = es(), i = B(n), a = V(i);
			H(() => {
				i.disabled = !W(h), a.disabled = !W(g);
			}), G("click", i, () => {
				t.view?.review && W(h) && r().apply?.(v(t.view.review.selector));
			}), G("click", a, () => {
				t.view?.review && W(g) && r().reject?.(v(t.view.review.selector));
			}), q(e, n);
		};
		Y(be, (e) => {
			t.view.review && e(xe);
		}), P(pe), H((e) => {
			J(b, W(l)?.label ?? t.view.title), $(w, "aria-pressed", t.view.followSelection), w.disabled = !r().follow, $(T, "aria-pressed", t.view.pinned), T.disabled = t.view.pinned ? !r().follow : !W(l) || !r().pin, J(E, t.view.pinned ? "Unpin preview" : "Pin preview"), $(me, "data-status", t.view.status), J(he, e), J(_e, t.view.pinned ? "Pinned preview" : t.view.followSelection ? "Following selection" : "Selection not followed");
		}, [() => u(t.view.status)]), G("click", w, () => r().follow?.()), G("click", T, () => {
			t.view?.pinned ? r().follow?.() : t.view && W(l) && r().pin?.(t.view.sourceKey, f(W(l).target));
		}), q(e, d);
	}, S = (e) => {
		q(e, ns());
	};
	Y(b, (e) => {
		t.view ? e(x) : e(S, -1);
	}), P(y), q(e, y), Ve();
}
_r(["change", "click"]);
//#endregion
//#region ui/RunDetails.svelte
var as = /* @__PURE__ */ K("<p class=\"pc-run-error svelte-f9s2fm\"> </p>"), os = /* @__PURE__ */ K("<p class=\"pc-run-empty svelte-f9s2fm\">No execution plan has been recorded.</p>"), ss = /* @__PURE__ */ K("<span aria-hidden=\"true\" class=\"svelte-f9s2fm\">▱</span>"), cs = /* @__PURE__ */ K("<small class=\"svelte-f9s2fm\"> </small>"), ls = /* @__PURE__ */ K("<details class=\"svelte-f9s2fm\"><summary class=\"svelte-f9s2fm\">Reported usage</summary><div class=\"pc-run-usage svelte-f9s2fm\"><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small></div></details>"), us = /* @__PURE__ */ K("<li class=\"svelte-f9s2fm\"><div class=\"pc-run-row-heading svelte-f9s2fm\"><button type=\"button\" class=\"svelte-f9s2fm\"><!> </button><span class=\"pc-run-status svelte-f9s2fm\"> </span></div> <!> <div class=\"pc-run-row-meta svelte-f9s2fm\"><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small></div> <!> <!></li>"), ds = /* @__PURE__ */ K("<header class=\"svelte-f9s2fm\"><h3 class=\"svelte-f9s2fm\">Run details</h3><span class=\"pc-run-status svelte-f9s2fm\"> </span></header> <div class=\"pc-run-summary svelte-f9s2fm\"><p class=\"svelte-f9s2fm\"> </p><p class=\"svelte-f9s2fm\"> </p><p class=\"svelte-f9s2fm\"> </p></div> <!> <!> <ol class=\"pc-run-rows svelte-f9s2fm\"></ol>", 1), fs = /* @__PURE__ */ K("<p class=\"pc-run-empty svelte-f9s2fm\">Run a workflow to inspect its processing stages.</p>"), ps = /* @__PURE__ */ K("<section class=\"pc-run-details svelte-f9s2fm\" aria-label=\"Run details\"><!></section>");
function ms(e, t) {
	Be(t, !0);
	let n = Si(t, "actions", 19, () => ({})), r = (e) => e === "not-run" ? "Not run" : e === "empty" ? "Ready" : e.charAt(0).toUpperCase() + e.slice(1), i = (e) => e !== null && Number.isFinite(e) && e >= 0 ? (e / 1e3).toFixed(2) + "s" : "Unknown", a = (e) => e != null && Number.isFinite(e) && e >= 0 ? String(e) : "Unknown";
	var o = ps(), s = z(o), c = (e) => {
		var o = ds(), s = B(o), c = V(z(s)), l = z(c, !0);
		P(c), P(s);
		var u = V(s, 2), d = z(u), f = z(d);
		P(d);
		var p = V(d), m = z(p);
		P(p);
		var h = V(p), g = z(h);
		P(h), P(u);
		var _ = V(u, 2), v = (e) => {
			var n = as(), r = z(n, !0);
			P(n), H(() => J(r, t.view.issue)), q(e, n);
		};
		Y(_, (e) => {
			t.view.issue && e(v);
		});
		var y = V(_, 2), b = (e) => {
			q(e, os());
		};
		Y(y, (e) => {
			t.view.rows.length || e(b);
		});
		var x = V(y, 2);
		X(x, 21, () => t.view.rows, (e) => e.key, (e, o) => {
			var s = us();
			let c;
			var l = z(s), u = z(l), d = z(u), f = (e) => {
				q(e, ss());
			};
			Y(d, (e) => {
				W(o).kind === "instance" && e(f);
			});
			var p = V(d, 1, !0);
			P(u);
			var m = V(u), h = z(m, !0);
			P(m), P(l);
			var g = V(l, 2), _ = (e) => {
				var t = cs(), n = z(t, !0);
				P(t), H((e) => J(n, e), [() => r(W(o).subphase)]), q(e, t);
			};
			Y(g, (e) => {
				W(o).subphase && e(_);
			});
			var v = V(g, 2), y = z(v), b = z(y);
			P(y);
			var x = V(y), S = z(x);
			P(x), P(v);
			var C = V(v, 2), w = (e) => {
				var t = as(), n = z(t, !0);
				P(t), H(() => J(n, W(o).issue)), q(e, t);
			};
			Y(C, (e) => {
				W(o).issue && e(w);
			});
			var T = V(C, 2), E = (e) => {
				var t = ls(), n = V(z(t)), r = z(n), i = z(r);
				P(r);
				var s = V(r), c = z(s);
				P(s);
				var l = V(s), u = z(l);
				P(l);
				var d = V(l), f = z(d);
				P(d), P(n), P(t), H((e, t, n) => {
					J(i, `Input tokens: ${e ?? ""}`), J(c, `Output tokens: ${t ?? ""}`), J(u, `Total tokens: ${n ?? ""}`), J(f, `Cost: ${W(o).usage?.cost ?? "Unknown" ?? ""}`);
				}, [
					() => a(W(o).usage?.inputTokens),
					() => a(W(o).usage?.outputTokens),
					() => a(W(o).usage?.totalTokens)
				]), q(e, t);
			};
			Y(T, (e) => {
				W(o).kind === "primitive" && e(E);
			}), P(s), H((e, t, r) => {
				$(s, "data-run-row", W(o).key), $(s, "data-depth", W(o).depth), $(s, "data-status", W(o).status), c = ii(s, "", c, e), $(u, "aria-label", "Open " + W(o).title + " in graph"), u.disabled = !n().jump, J(p, W(o).title), $(m, "data-status", W(o).status), J(h, t), J(b, `Duration: ${r ?? ""}`), J(S, `${W(o).attempts ?? ""} of ${W(o).callBound ?? ""} requests`);
			}, [
				() => ({ "margin-left": `${Math.max(0, Math.min(8, W(o).depth)) * 12}px` }),
				() => r(W(o).status),
				() => i(W(o).durationMs)
			]), G("click", u, () => {
				t.view && n().jump?.(t.view.runId, {
					...W(o).address,
					instancePath: [...W(o).address.instancePath]
				});
			}), q(e, s);
		}), P(x), H((e, n) => {
			$(c, "data-status", t.view.status), J(l, e), J(f, `${t.view.completedCount ?? ""} of ${t.view.executableCount ?? ""} stages complete`), J(m, `${t.view.actualCalls ?? ""} of ${t.view.callBound ?? ""} requests`), J(g, `Elapsed: ${n ?? ""}`);
		}, [() => r(t.view.status), () => i(t.view.elapsedMs)]), q(e, o);
	}, l = (e) => {
		q(e, fs());
	};
	Y(s, (e) => {
		t.view ? e(c) : e(l, -1);
	}), P(o), q(e, o), Ve();
}
_r(["click"]);
//#endregion
//#region ui/RunMeter.svelte
var hs = /* @__PURE__ */ K("<span class=\"pc-run-meter-elapsed svelte-1tkcp3\" data-run-elapsed=\"\"> </span>"), gs = /* @__PURE__ */ K("<span class=\"pc-run-pixel svelte-1tkcp3\" data-run-pixel=\"\"></span>"), _s = /* @__PURE__ */ K("<button class=\"pc-run-meter svelte-1tkcp3\"><span class=\"pc-run-meter-label svelte-1tkcp3\"> </span> <!> <span class=\"pc-run-meter-pixels svelte-1tkcp3\" aria-hidden=\"true\"></span></button>");
function vs(e, t) {
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
	var o = Or(), s = B(o), c = (e) => {
		var r = _s(), o = z(r), s = z(o, !0);
		P(o);
		var c = V(o, 2), l = (e) => {
			var n = hs(), r = z(n);
			P(n), H((e) => J(r, `${e ?? ""}s`), [() => (t.view.elapsedMs / 1e3).toFixed(1)]), q(e, n);
		}, u = /* @__PURE__ */ F(() => t.view.elapsedMs !== null && Number.isFinite(t.view.elapsedMs) && t.view.elapsedMs >= 0);
		Y(c, (e) => {
			W(u) && e(l);
		});
		var d = V(c, 2);
		X(d, 21, () => W(i), (e) => e.key, (e, t) => {
			var n = gs();
			H(() => {
				$(n, "data-status", W(t).status), $(n, "title", W(t).title);
			}), q(e, n);
		}), P(d), P(r), H((e) => {
			$(r, "aria-label", W(a)), $(r, "title", W(a)), r.disabled = !t.open, J(s, e);
		}, [() => n(t.view.status)]), G("click", r, () => t.open?.()), q(e, r);
	};
	Y(s, (e) => {
		t.view && e(c);
	}), q(e, o), Ve();
}
_r(["click"]);
//#endregion
//#region ui/PortalManager.svelte
var ys = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-mnv790\">Close</button>"), bs = /* @__PURE__ */ K("<option class=\"svelte-mnv790\"> </option>"), xs = /* @__PURE__ */ K("<label class=\"svelte-mnv790\">Portal name<input aria-label=\"Portal name\" class=\"svelte-mnv790\"/></label> <p class=\"pc-note svelte-mnv790\"> </p> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-rename=\"\" class=\"svelte-mnv790\">Rename</button></div>", 1), Ss = /* @__PURE__ */ K("<p class=\"pc-note svelte-mnv790\">Select a portal or create one from an output.</p>"), Cs = /* @__PURE__ */ K("<button type=\"button\" data-portal-jump-source=\"\" class=\"svelte-mnv790\">Jump to source</button>"), ws = /* @__PURE__ */ K("<label class=\"pc-check svelte-mnv790\"><input type=\"checkbox\" aria-label=\"Replace existing connection\" class=\"svelte-mnv790\"/>Replace existing connection</label>"), Ts = /* @__PURE__ */ K("<button type=\"button\" data-portal-jump-consumer=\"\" class=\"svelte-mnv790\">Jump</button>"), Es = /* @__PURE__ */ K("<div class=\"pc-consumer svelte-mnv790\"><span class=\"svelte-mnv790\"> </span><div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-restore=\"\" class=\"svelte-mnv790\">Restore wire</button> <!></div></div>"), Ds = /* @__PURE__ */ K("<p class=\"pc-note svelte-mnv790\">No consumers.</p>"), Os = /* @__PURE__ */ K("<label class=\"svelte-mnv790\">Existing consumers<select aria-label=\"Existing consumers\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Choose before deleting…</option><option class=\"svelte-mnv790\">Restore visible wires</option><option class=\"svelte-mnv790\">Disconnect consumers</option></select></label>"), ks = /* @__PURE__ */ K("<details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Consumers</summary> <label class=\"svelte-mnv790\">Compatible receiver<select aria-label=\"Compatible receiver\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select input…</option><!></select></label> <!> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-connect=\"\" class=\"svelte-mnv790\">Connect receiver</button></div> <!> <!> <!> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-delete=\"\" class=\"svelte-mnv790\">Delete portal</button></div></details>"), As = /* @__PURE__ */ K("<details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Convert to portal</summary><p class=\"pc-note svelte-mnv790\"> </p><div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-convert=\"\" class=\"svelte-mnv790\"> </button></div></details>"), js = /* @__PURE__ */ K("<p class=\"pc-error svelte-mnv790\"> </p>"), Ms = /* @__PURE__ */ K("<p class=\"pc-error svelte-mnv790\" role=\"alert\"> </p>"), Ns = /* @__PURE__ */ K("<p class=\"pc-note svelte-mnv790\" role=\"status\">Preparing change…</p>"), Ps = /* @__PURE__ */ K("<p class=\"pc-note svelte-mnv790\"> </p> <label class=\"svelte-mnv790\">Portal<select aria-label=\"Selected portal\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select portal…</option><!></select></label> <!> <details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Source</summary> <label class=\"svelte-mnv790\">Output<select aria-label=\"Portal source\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select output…</option><!></select></label> <label class=\"svelte-mnv790\">New portal name<input aria-label=\"New portal name\" class=\"svelte-mnv790\"/></label> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-create=\"\" class=\"svelte-mnv790\">Create portal</button> <button type=\"button\" data-portal-retarget=\"\" class=\"svelte-mnv790\">Retarget</button> <!></div></details> <!> <!> <!> <!> <!>", 1), Fs = /* @__PURE__ */ K("<p class=\"pc-note svelte-mnv790\">Open a graph to manage its portals.</p>"), Is = /* @__PURE__ */ K("<section class=\"pc-manager svelte-mnv790\" aria-label=\"Manage portals\"><header class=\"svelte-mnv790\"><h2 class=\"svelte-mnv790\">Manage portals</h2><!></header> <!></section>");
function Ls(e, t) {
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
	vn(() => {
		let e = t.view ? JSON.stringify([
			t.view.managerKey,
			t.view.revision,
			m(t.view.scope),
			t.view.selectedPortalId,
			t.view.renameMode
		]) : "";
		d !== e && (d = e, R(r, W(h)?.label ?? "", !0), R(i, ""), R(a, t.view?.sources.find((e) => e.nodeId === W(h)?.source.nodeId && e.portId === W(h)?.source.portId)?.key ?? "", !0), R(o, ""), R(s, ""), R(c, !1), R(l, ""), R(u, ""), f++);
	}), zr(() => {
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
	var E = Is(), D = z(E), ee = V(z(D)), te = (e) => {
		var t = ys();
		G("click", t, () => n().close?.()), q(e, t);
	};
	Y(ee, (e) => {
		n().close && e(te);
	}), P(D);
	var ne = V(D, 2), O = (e) => {
		var d = Ps(), f = B(d), p = z(f);
		P(f);
		var m = V(f, 2), E = V(z(m)), D = z(E);
		D.value = D.__value = "", X(V(D), 17, () => t.view.publishers, (e) => e.id, (e, t) => {
			var n = bs(), r = z(n);
			P(n);
			var i = {};
			H(() => {
				J(r, `${W(t).label ?? ""} · ${W(t).kind ?? ""}`), i !== (i = W(t).id) && (n.value = (n.__value = W(t).id) ?? "");
			}), q(e, n);
		}), P(E);
		var ee;
		oi(E), P(m);
		var te = V(m, 2), ne = (e) => {
			var i = xs(), a = B(i), o = V(z(a));
			Q(o), P(a);
			var s = V(a, 2), c = z(s);
			P(s);
			var l = V(s, 2), d = z(l);
			P(l), H(() => {
				fi(o, W(r)), o.disabled = !W(g), J(c, `${t.view.renameMode === "presentation" ? "Local workspace label · not exported" : "Authored portal label"} · ${W(h).kind ?? ""}`), d.disabled = !W(g) || !!W(u);
			}), G("input", o, (e) => {
				R(r, e.currentTarget.value, !0), w();
			}), G("click", d, () => {
				let e = W(h)?.id, i = t.view?.renameMode, a = W(r);
				e && i && n().rename && T("rename", W(g), (t) => n().rename(t, e, a, i));
			}), q(e, i);
		}, O = (e) => {
			q(e, Ss());
		};
		Y(te, (e) => {
			W(h) ? e(ne) : e(O, -1);
		});
		var k = V(te, 2), A = V(z(k), 2), j = V(z(A)), re = z(j);
		re.value = re.__value = "", X(V(re), 17, () => t.view.sources, (e) => e.key, (e, t) => {
			var n = bs(), r = z(n);
			P(n);
			var i = {};
			H(() => {
				J(r, `${W(t).label ?? ""} · ${W(t).kind ?? ""}`), i !== (i = W(t).key) && (n.value = (n.__value = W(t).key) ?? "");
			}), q(e, n);
		}), P(j);
		var ie;
		oi(j), P(A);
		var ae = V(A, 2), oe = V(z(ae));
		Q(oe), P(ae);
		var se = V(ae, 2), ce = z(se), le = V(ce, 2), ue = V(le, 2), de = (e) => {
			var r = Cs();
			G("click", r, () => {
				t.view && W(h) && n().jumpSource?.(x(t.view), S(W(h).source));
			}), q(e, r);
		};
		Y(ue, (e) => {
			W(h) && n().jumpSource && e(de);
		}), P(se), P(k);
		var fe = V(k, 2), pe = (e) => {
			var r = ks(), i = V(z(r), 2), a = V(z(i)), l = z(a);
			l.value = l.__value = "", X(V(l), 17, () => t.view.receivers, (e) => e.key, (e, t) => {
				var n = bs(), r = z(n);
				P(n);
				var i = {};
				H(() => {
					J(r, `${W(t).label ?? ""}${W(t).occupied ? " · Connected" : ""}`), i !== (i = W(t).key) && (n.value = (n.__value = W(t).key) ?? "");
				}), q(e, n);
			}), P(a);
			var d;
			oi(a), P(i);
			var f = V(i, 2), p = (e) => {
				var t = ws(), n = z(t);
				Q(n), ke(), P(t), H((e) => {
					pi(n, W(c)), n.disabled = e;
				}, [() => !C("connect")]), G("change", n, (e) => {
					R(c, e.currentTarget.checked, !0), w();
				}), q(e, t);
			};
			Y(f, (e) => {
				W(v)?.occupied && e(p);
			});
			var m = V(f, 2), g = z(m);
			P(m);
			var _ = V(m, 2);
			X(_, 17, () => t.view.consumers, (e) => e.edgeId, (e, r) => {
				var i = Es(), a = z(i), o = z(a, !0);
				P(a);
				var s = V(a), c = z(s), l = V(c, 2), d = (e) => {
					var i = Ts();
					G("click", i, () => {
						let e = t.view?.consumers.find((e) => e.edgeId === W(r).edgeId);
						t.view && e && n().jumpConsumer?.(x(t.view), e.edgeId, S(e.to));
					}), q(e, i);
				};
				Y(l, (e) => {
					n().jumpConsumer && e(d);
				}), P(s), P(i), H((e) => {
					J(o, W(r).label), c.disabled = e;
				}, [() => !C("restore") || !n().restoreWire || !!W(u)]), G("click", c, () => {
					let e = t.view?.consumers.find((e) => e.edgeId === W(r).edgeId);
					e && n().restoreWire && T("restore", C("restore"), (t) => n().restoreWire(t, e.edgeId));
				}), q(e, i);
			});
			var E = V(_, 2), D = (e) => {
				q(e, Ds());
			};
			Y(E, (e) => {
				t.view.consumers.length || e(D);
			});
			var ee = V(E, 2), te = (e) => {
				var t = Os(), n = V(z(t)), r = z(n);
				r.value = r.__value = "";
				var i = V(r);
				i.value = i.__value = "restore";
				var a = V(i);
				a.value = a.__value = "disconnect", P(n);
				var o;
				oi(n), P(t), H((e) => {
					n.disabled = e, o !== (o = W(s)) && (n.value = (n.__value = W(s)) ?? "", ai(n, W(s)));
				}, [() => !C("remove")]), G("change", n, (e) => {
					R(s, e.currentTarget.value, !0), w();
				}), q(e, t);
			};
			Y(ee, (e) => {
				t.view.consumers.length && e(te);
			});
			var ne = V(ee, 2), O = z(ne);
			P(ne), P(r), H((e) => {
				a.disabled = e, d !== (d = W(o)) && (a.value = (a.__value = W(o)) ?? "", ai(a, W(o))), g.disabled = !W(y) || !!W(u), O.disabled = !W(b) || !!W(u);
			}, [() => !C("connect") || !n().connect]), G("change", a, (e) => {
				R(o, e.currentTarget.value, !0), R(c, !1), w();
			}), G("click", g, () => {
				let e = W(v), t = W(h)?.id, r = W(c);
				e && t && n().connect && T("connect", W(y), (i) => n().connect(i, t, S(e), r));
			}), G("click", O, () => {
				let e = W(h)?.id, r = t.view?.consumers.length ? W(s) : "restore";
				e && (r === "restore" || r === "disconnect") && n().deletePublisher && T("remove", W(b), (t) => n().deletePublisher(t, e, r));
			}), q(e, r);
		};
		Y(fe, (e) => {
			W(h) && e(pe);
		});
		var me = V(fe, 2), he = (e) => {
			var r = As(), i = V(z(r)), a = z(i, !0);
			P(i);
			var o = V(i), s = z(o), c = z(s);
			P(s), P(o), P(r), H((e) => {
				J(a, t.view.conversion.label), s.disabled = e, J(c, `Convert ${t.view.conversion.kind === "wire" ? "wire" : "output"}`);
			}, [() => !C("convert") || !!W(u) || (t.view.conversion.kind === "wire" ? !n().convertWire : !n().convertOutput)]), G("click", s, () => {
				let e = t.view?.conversion;
				e?.kind === "wire" && n().convertWire ? T("convert", C("convert"), (t) => n().convertWire(t, e.edgeId)) : e?.kind === "output" && n().convertOutput && T("convert", C("convert"), (t) => n().convertOutput(t, S(e.endpoint)));
			}), q(e, r);
		};
		Y(me, (e) => {
			t.view.conversion && e(he);
		});
		var ge = V(me, 2), _e = (e) => {
			var n = js(), r = z(n, !0);
			P(n), H(() => J(r, t.view.issue)), q(e, n);
		};
		Y(ge, (e) => {
			t.view.issue && e(_e);
		});
		var ve = V(ge, 2), ye = (e) => {
			var t = Ms(), n = z(t, !0);
			P(t), H(() => J(n, W(l))), q(e, t);
		};
		Y(ve, (e) => {
			W(l) && e(ye);
		});
		var be = V(ve, 2), xe = (e) => {
			q(e, Ns());
		};
		Y(be, (e) => {
			W(u) && e(xe);
		}), H((e, r, o, s) => {
			J(p, `${t.view.scopeLabel ?? ""}${t.view.readOnly ? " · Read-only graph" : ""}`), E.disabled = !n().selectPortal, ee !== (ee = t.view.selectedPortalId ?? "") && (E.value = (E.__value = t.view.selectedPortalId ?? "") ?? "", ai(E, t.view.selectedPortalId ?? "")), j.disabled = e, ie !== (ie = W(a)) && (j.value = (j.__value = W(a)) ?? "", ai(j, W(a))), fi(oe, W(i)), oe.disabled = r, ce.disabled = o, le.disabled = s;
		}, [
			() => !C("create") && !C("retarget"),
			() => !C("create") || !n().create,
			() => !C("create") || !n().create || !W(_) || !W(i).trim() || !!W(u),
			() => !C("retarget") || !n().retarget || !W(_) || !W(h) || !!W(u)
		]), G("change", E, (e) => {
			let r = e.currentTarget.value;
			e.currentTarget.selectedIndex >= 0 && t.view && n().selectPortal && (!r || t.view.publishers.some((e) => e.id === r)) && n().selectPortal(x(t.view), r || null);
		}), G("change", j, (e) => {
			R(a, e.currentTarget.value, !0), w();
		}), G("input", oe, (e) => {
			R(i, e.currentTarget.value, !0), w();
		}), G("click", ce, () => {
			let e = W(_), t = W(i);
			e && t.trim() && n().create && T("create", C("create"), (r) => n().create(r, t, S(e)));
		}), G("click", le, () => {
			let e = W(_), t = W(h)?.id;
			e && t && n().retarget && T("retarget", C("retarget"), (r) => n().retarget(r, t, S(e)));
		}), q(e, d);
	}, k = (e) => {
		q(e, Fs());
	};
	Y(ne, (e) => {
		t.view ? e(O) : e(k, -1);
	}), P(E), q(e, E), Ve();
}
_r([
	"click",
	"change",
	"input"
]);
//#endregion
//#region ui/SubgraphManager.svelte
var Rs = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-xi74w\">Close</button>"), zs = /* @__PURE__ */ K("<option class=\"svelte-xi74w\"> </option>"), Bs = /* @__PURE__ */ K("<p class=\"pc-note svelte-xi74w\"> </p> <label class=\"svelte-xi74w\">Definition name<input aria-label=\"Definition name\" class=\"svelte-xi74w\"/></label> <div class=\"pc-actions svelte-xi74w\"><button type=\"button\" data-subgraph-open-library=\"\" class=\"svelte-xi74w\">Open definition</button> <button type=\"button\" data-subgraph-rename=\"\" class=\"svelte-xi74w\">Save name as revision</button> <button type=\"button\" data-subgraph-duplicate=\"\" class=\"svelte-xi74w\">Duplicate</button> <button type=\"button\" data-subgraph-export=\"\" class=\"svelte-xi74w\">Export .json</button> <button type=\"button\" data-subgraph-remove=\"\" class=\"svelte-xi74w\">Remove revision</button></div> <label class=\"svelte-xi74w\">Insert into<select aria-label=\"Insert destination\" class=\"svelte-xi74w\"><option class=\"svelte-xi74w\">Choose editable graph…</option><!></select></label> <div class=\"pc-actions svelte-xi74w\"><button type=\"button\" data-subgraph-insert=\"\" class=\"svelte-xi74w\"> </button></div>", 1), Vs = /* @__PURE__ */ K("<p class=\"pc-note svelte-xi74w\"> </p>"), Hs = /* @__PURE__ */ K("<div class=\"pc-row svelte-xi74w\"><p class=\"pc-note svelte-xi74w\"> </p><div class=\"pc-port-fields svelte-xi74w\"><label class=\"svelte-xi74w\">Label<input class=\"svelte-xi74w\"/></label> <label class=\"svelte-xi74w\">Kind<select class=\"svelte-xi74w\"></select></label></div><label class=\"pc-check svelte-xi74w\"><input type=\"checkbox\" class=\"svelte-xi74w\"/>Required</label> <div class=\"pc-actions svelte-xi74w\"><button type=\"button\" data-save-interface=\"\" class=\"svelte-xi74w\">Save port</button><button type=\"button\" data-remove-interface=\"\" class=\"svelte-xi74w\">Remove port</button></div></div>"), Us = /* @__PURE__ */ K("<div class=\"pc-port-fields svelte-xi74w\"><label class=\"svelte-xi74w\">New port<input aria-label=\"New interface label\" class=\"svelte-xi74w\"/></label><label class=\"svelte-xi74w\">Direction<select aria-label=\"New interface direction\" class=\"svelte-xi74w\"><option class=\"svelte-xi74w\">Input</option><option class=\"svelte-xi74w\">Output</option></select></label></div> <label class=\"svelte-xi74w\">Kind<select aria-label=\"New interface kind\" class=\"svelte-xi74w\"></select></label> <label class=\"pc-check svelte-xi74w\"><input type=\"checkbox\" aria-label=\"New interface required\" class=\"svelte-xi74w\"/>Required</label> <div class=\"pc-actions svelte-xi74w\"><button type=\"button\" data-add-interface=\"\" class=\"svelte-xi74w\">Add boundary</button></div>", 1), Ws = /* @__PURE__ */ K("<div class=\"pc-row svelte-xi74w\"><label class=\"svelte-xi74w\">Label<input class=\"svelte-xi74w\"/></label><p class=\"pc-note svelte-xi74w\"> </p> <div class=\"pc-actions svelte-xi74w\"><button type=\"button\" data-save-parameter=\"\" class=\"svelte-xi74w\">Save parameter</button><button type=\"button\" data-remove-parameter=\"\" class=\"svelte-xi74w\">Remove parameter</button></div></div>"), Gs = /* @__PURE__ */ K("<label class=\"svelte-xi74w\">New parameter<input aria-label=\"New parameter label\" class=\"svelte-xi74w\"/></label> <label class=\"svelte-xi74w\">Target<select aria-label=\"Exposed parameter target\" class=\"svelte-xi74w\"><option class=\"svelte-xi74w\">Select eligible control…</option><!></select></label> <div class=\"pc-actions svelte-xi74w\"><button type=\"button\" data-add-parameter=\"\" class=\"svelte-xi74w\">Expose parameter</button></div>", 1), Ks = /* @__PURE__ */ K("<details open=\"\" class=\"svelte-xi74w\"><summary class=\"svelte-xi74w\">Interface</summary> <p class=\"pc-note svelte-xi74w\"> </p> <!> <!> <!> <p class=\"pc-note svelte-xi74w\">Ports keep stable IDs. Connected incompatible edits must be resolved before saving.</p></details> <details open=\"\" class=\"svelte-xi74w\"><summary class=\"svelte-xi74w\">Exposed parameters</summary> <!> <!> <!></details>", 1), qs = /* @__PURE__ */ K("<label class=\"svelte-xi74w\">Revision target<select aria-label=\"Shelf revision target\" class=\"svelte-xi74w\"><option class=\"svelte-xi74w\">Select exact shelf revision…</option><!></select></label>"), Js = /* @__PURE__ */ K("<input type=\"checkbox\" class=\"svelte-xi74w\"/>"), Ys = /* @__PURE__ */ K("<textarea class=\"svelte-xi74w\"></textarea>"), Xs = /* @__PURE__ */ K("<select class=\"svelte-xi74w\"></select>"), Zs = /* @__PURE__ */ K("<input class=\"svelte-xi74w\"/>"), Qs = /* @__PURE__ */ K("<div class=\"pc-row svelte-xi74w\"><label class=\"svelte-xi74w\"> <!></label><p class=\"pc-note svelte-xi74w\"> </p> <div class=\"pc-actions svelte-xi74w\"><button type=\"button\" class=\"svelte-xi74w\">Save override</button><button type=\"button\" class=\"svelte-xi74w\">Use definition value</button></div></div>"), $s = /* @__PURE__ */ K("<details open=\"\" class=\"svelte-xi74w\"><summary class=\"svelte-xi74w\">Parameter overrides</summary> <!></details>"), ec = /* @__PURE__ */ K("<select class=\"svelte-xi74w\"><option class=\"svelte-xi74w\">Select connection…</option><!></select>"), tc = /* @__PURE__ */ K("<label class=\"svelte-xi74w\">Saved connection<!></label>"), nc = /* @__PURE__ */ K("<label class=\"svelte-xi74w\">Saved model<input class=\"svelte-xi74w\"/></label>"), rc = /* @__PURE__ */ K("<p class=\"pc-error svelte-xi74w\"> </p>"), ic = /* @__PURE__ */ K("<div class=\"pc-row svelte-xi74w\"><p class=\"svelte-xi74w\"> </p> <label class=\"svelte-xi74w\">Connection mode<select class=\"svelte-xi74w\"></select></label> <!> <label class=\"svelte-xi74w\">Model mode<select class=\"svelte-xi74w\"></select></label> <!> <p class=\"pc-note svelte-xi74w\"> </p><!></div>"), ac = /* @__PURE__ */ K("<details open=\"\" data-instance-model=\"\" class=\"svelte-xi74w\"><summary class=\"svelte-xi74w\">Model bindings</summary> <!></details>"), oc = /* @__PURE__ */ K("<option class=\"svelte-xi74w\">Drop override</option>"), sc = /* @__PURE__ */ K("<label class=\"svelte-xi74w\"> <select class=\"svelte-xi74w\"><!><!></select></label>"), cc = /* @__PURE__ */ K("<p class=\"pc-note svelte-xi74w\">No mappings.</p>"), lc = /* @__PURE__ */ K("<details open=\"\" class=\"svelte-xi74w\"><summary class=\"svelte-xi74w\"> </summary><!><!></details>"), uc = /* @__PURE__ */ K("<p class=\"pc-note svelte-xi74w\">Mappings changed. Prepare the update before accepting.</p>"), dc = /* @__PURE__ */ K("<details open=\"\" class=\"svelte-xi74w\"><summary class=\"svelte-xi74w\">Update instance</summary> <label class=\"svelte-xi74w\">Target revision<select aria-label=\"Instance update revision\" class=\"svelte-xi74w\"><option class=\"svelte-xi74w\">Choose exact revision…</option><!></select></label> <!> <!> <!> <div class=\"pc-actions svelte-xi74w\"><button type=\"button\" data-prepare-instance-update=\"\" class=\"svelte-xi74w\">Prepare update</button><button type=\"button\" data-accept-instance-update=\"\" class=\"svelte-xi74w\">Accept prepared update</button></div></details>"), fc = /* @__PURE__ */ K("<details open=\"\" class=\"svelte-xi74w\"><summary class=\"svelte-xi74w\">Instance</summary><p class=\"pc-note svelte-xi74w\"> </p><div class=\"pc-actions svelte-xi74w\"><button type=\"button\" class=\"svelte-xi74w\">Open graph</button> <button type=\"button\" data-subgraph-local-copy=\"\" class=\"svelte-xi74w\">Make local copy</button> <button type=\"button\" data-subgraph-unpack=\"\" class=\"svelte-xi74w\">Unpack</button></div> <label class=\"svelte-xi74w\">Saved definition name<input aria-label=\"Saved definition name\" class=\"svelte-xi74w\"/></label> <label class=\"svelte-xi74w\">Save to shelf<select aria-label=\"Shelf save mode\" class=\"svelte-xi74w\"><option class=\"svelte-xi74w\">New entry with private identity</option><option class=\"svelte-xi74w\">Revision of selected entry</option></select></label> <!> <div class=\"pc-actions svelte-xi74w\"><button type=\"button\" data-subgraph-save-shelf=\"\" class=\"svelte-xi74w\">Save definition to shelf</button></div> <p class=\"pc-note svelte-xi74w\">Instance overrides remain on the wrapper. Saving does not bake them into the definition.</p></details> <!> <!> <!>", 1), pc = /* @__PURE__ */ K("<details open=\"\" class=\"svelte-xi74w\"><summary class=\"svelte-xi74w\">Create subgraph</summary><p class=\"pc-note svelte-xi74w\"> </p><label class=\"svelte-xi74w\">Name<input aria-label=\"Selection subgraph name\" class=\"svelte-xi74w\"/></label><div class=\"pc-actions svelte-xi74w\"><button type=\"button\" data-subgraph-convert-selection=\"\" class=\"svelte-xi74w\">Convert selection</button></div></details>"), mc = /* @__PURE__ */ K("<p class=\"pc-error svelte-xi74w\" role=\"alert\"> </p>"), hc = /* @__PURE__ */ K("<p class=\"pc-note svelte-xi74w\" role=\"status\">Preparing change…</p>"), gc = /* @__PURE__ */ K("<p class=\"pc-note svelte-xi74w\"> </p> <details open=\"\" class=\"svelte-xi74w\"><summary class=\"svelte-xi74w\">Library</summary> <label class=\"svelte-xi74w\">Revision<select aria-label=\"Library revision\" class=\"svelte-xi74w\"><option class=\"svelte-xi74w\">Select revision…</option><!></select></label> <!> <div class=\"pc-actions svelte-xi74w\"><button type=\"button\" data-subgraph-import=\"\" class=\"svelte-xi74w\">Import .json</button></div> <p class=\"pc-note svelte-xi74w\">Shelf revisions are immutable. Removing one keeps placed instances intact.</p></details> <!> <!> <!> <!> <!> <!>", 1), _c = /* @__PURE__ */ K("<p class=\"pc-note svelte-xi74w\">Open a graph to manage subgraphs.</p>"), vc = /* @__PURE__ */ K("<section class=\"pc-manager svelte-xi74w\" aria-label=\"Manage subgraphs\"><header class=\"svelte-xi74w\"><h2 class=\"svelte-xi74w\">Manage subgraphs</h2><!></header> <!></section>");
function yc(e, t) {
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
	] : ["library", w(e.definitionRef)]), E = /* @__PURE__ */ F(() => t.view?.entries.find((e) => w(e.ref) === w(t.view.selectedRef))), D = /* @__PURE__ */ F(() => t.view?.destinations.find((e) => e.key === t.view.selectedDestinationKey)), ee = /* @__PURE__ */ F(() => !!t.view && t.view.permissions.bodyEdit && t.view.scope.kind === "graph" && (!t.view.instance || t.view.instance.owned)), te = /* @__PURE__ */ F(() => t.view?.update?.choices.find((e) => e.key === t.view.update?.selectedKey)), ne = /* @__PURE__ */ F(() => JSON.stringify(W(d)) !== JSON.stringify(re(t.view?.update ?? null)));
	vn(() => {
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
	}), zr(() => {
		C = !1, S++;
	});
	let O = (e) => ({
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
		return !!t.view && t.view.capabilities[e] && (!n || t.view.permissions[n]) && (!["bodyEdit", "instanceEdit"].includes(n ?? "") || t.view.scope.kind === "graph") && (!["editInterface", "editParameter"].includes(e) || W(ee));
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
		let r = t.view?.instance, i = t.view?.update, a = W(te);
		if (r && i && a) {
			if (e) {
				if (!i.preparedKey || W(ne) || !A("acceptUpdate", "instanceEdit") || !n().acceptUpdate) return;
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
		let o = O(t.view), s = ++S, c = w(t.view.selectedRef);
		R(a, e, !0), R(i, "");
		let l = () => C && s === S && t.view?.managerKey === o.managerKey && t.view.revision === o.revision && t.view.libraryRevision === o.libraryRevision && T(t.view.scope) === T(o.scope) && w(t.view.selectedRef) === c;
		try {
			let e = await r(o);
			l() && (R(a, ""), R(i, e.ok ? "" : e.error.code + ": " + e.error.message, !0));
		} catch (e) {
			l() && (R(a, ""), R(i, e instanceof Error ? e.message : "The subgraph change could not be accepted.", !0));
		}
	}
	var ge = vc(), _e = z(ge), ve = V(z(_e)), ye = (e) => {
		var t = Rs();
		G("click", t, () => n().close?.()), q(e, t);
	};
	Y(ve, (e) => {
		n().close && e(ye);
	}), P(_e);
	var be = V(_e, 2), xe = (e) => {
		var o = gc(), c = B(o), x = z(c, !0);
		P(c);
		var S = V(c, 2), C = V(z(S), 2), w = V(z(C)), T = z(w);
		T.value = T.__value = "", X(V(T), 17, () => t.view.entries, (e) => e.key, (e, t) => {
			var n = zs(), r = z(n);
			P(n);
			var i = {};
			H(() => {
				J(r, `${W(t).name ?? ""} · v${W(t).ref.version ?? ""} · ${W(t).phase ?? ""}`), i !== (i = W(t).key) && (n.value = (n.__value = W(t).key) ?? "");
			}), q(e, n);
		}), P(w);
		var re;
		oi(w), P(C);
		var oe = V(C, 2), ge = (e) => {
			var i = Bs(), o = B(i), s = z(o);
			P(o);
			var c = V(o, 2), l = V(z(c));
			Q(l), P(c);
			var u = V(c, 2), d = z(u), f = V(d, 2), p = V(f, 2), m = V(p, 2), h = V(m, 2);
			P(u);
			var g = V(u, 2), _ = V(z(g)), v = z(_);
			v.value = v.__value = "", X(V(v), 17, () => t.view.destinations, (e) => e.key, (e, t) => {
				var n = zs(), r = z(n, !0);
				P(n);
				var i = {};
				H(() => {
					J(r, W(t).label), i !== (i = W(t).key) && (n.value = (n.__value = W(t).key) ?? "");
				}), q(e, n);
			}), P(_);
			var y;
			oi(_), P(g);
			var b = V(g, 2), x = z(b), S = z(x);
			P(x), P(b), H((e, i, a, o, c) => {
				J(s, `Version ${W(E).ref.version ?? ""} · ${W(E).nodeCount ?? ""} nodes · ${W(E).wireCount ?? ""} wires`), fi(l, W(r)), l.disabled = !t.view.permissions.libraryWrite, d.disabled = !n().openLibrary, f.disabled = e, p.disabled = i, m.disabled = a, h.disabled = o, _.disabled = !n().selectDestination, y !== (y = W(D)?.key ?? "") && (_.value = (_.__value = W(D)?.key ?? "") ?? "", ai(_, W(D)?.key ?? "")), x.disabled = c, J(S, `Insert into ${W(D)?.label ?? "graph" ?? ""}`);
			}, [
				() => !A("renameRevision", "libraryWrite") || !n().renameRevision || !W(r).trim() || !!W(a),
				() => !A("duplicate", "libraryWrite") || !n().duplicate || !W(r).trim() || !!W(a),
				() => !A("exportJSON") || !n().exportJSON || !!W(a),
				() => !A("removeRevision", "libraryWrite") || !n().removeRevision || !!W(a),
				() => !A("insert", "insert") || !n().insert || !W(D) || !!W(a)
			]), G("input", l, (e) => {
				R(r, e.currentTarget.value, !0), j();
			}), G("click", d, () => {
				t.view && W(E) && n().openLibrary?.(O(t.view), k(W(E).ref));
			}), G("click", f, () => {
				let e = W(E), t = W(r);
				e && t.trim() && n().renameRevision && he("renameRevision", A("renameRevision", "libraryWrite"), (r) => n().renameRevision(r, k(e.ref), t));
			}), G("click", p, () => {
				let e = W(E), t = W(r);
				e && t.trim() && n().duplicate && he("duplicate", A("duplicate", "libraryWrite"), (r) => n().duplicate(r, k(e.ref), t));
			}), G("click", m, () => {
				let e = W(E);
				e && n().exportJSON && he("exportJSON", A("exportJSON"), (t) => n().exportJSON(t, k(e.ref)));
			}), G("click", h, () => {
				let e = W(E);
				e && n().removeRevision && he("removeRevision", A("removeRevision", "libraryWrite"), (t) => n().removeRevision(t, k(e.ref)));
			}), G("change", _, (e) => {
				let r = e.currentTarget.value;
				e.currentTarget.selectedIndex >= 0 && t.view && n().selectDestination && (!r || t.view.destinations.some((e) => e.key === r)) && n().selectDestination(O(t.view), r || null);
			}), G("click", x, () => {
				let e = W(E), t = W(D);
				e && t && n().insert && he("insert", A("insert", "insert"), (r) => n().insert(r, k(e.ref), t.key));
			}), q(e, i);
		};
		Y(oe, (e) => {
			W(E) && e(ge);
		});
		var _e = V(oe, 2), ve = z(_e);
		P(_e), ke(2), P(S);
		var ye = V(S, 2), be = (e) => {
			var r = Ks(), i = B(r), o = V(z(i), 2), c = z(o);
			P(o);
			var l = V(o, 2), u = (e) => {
				var n = Vs(), r = z(n, !0);
				P(n), H(() => J(r, t.view.definition.description)), q(e, n);
			};
			Y(l, (e) => {
				t.view.definition.description && e(u);
			});
			var d = V(l, 2);
			X(d, 17, () => t.view.definition.interface, (e) => e.id, (e, r) => {
				var i = Hs(), o = z(i), s = z(o);
				P(o);
				var c = V(o), l = z(c), u = V(z(l));
				Q(u), P(l);
				var d = V(l, 2), f = V(z(d));
				X(f, 21, () => t.view.definition.kinds, Br, (e, t) => {
					var n = zs(), r = z(n, !0);
					P(n);
					var i = {};
					H(() => {
						J(r, W(t)), i !== (i = W(t)) && (n.value = (n.__value = W(t)) ?? "");
					}), q(e, n);
				}), P(f);
				var p;
				oi(f), P(d), P(c);
				var m = V(c), h = z(m);
				Q(h), ke(), P(m);
				var g = V(m, 2), _ = z(g), v = V(_);
				P(g), P(i), H((e, t, n, i, a, o, c, l) => {
					J(s, `${W(r).direction ?? ""} · ${W(r).id ?? ""} · Boundary ${W(r).boundaryNodeId ?? ""}`), $(u, "aria-label", "Interface label " + W(r).id), fi(u, e), u.disabled = t, $(f, "aria-label", "Interface kind " + W(r).id), f.disabled = n, p !== (p = i) && (f.value = (f.__value = i) ?? "", ai(f, i)), $(h, "aria-label", "Required interface " + W(r).id), pi(h, a), h.disabled = o, _.disabled = c, v.disabled = l;
				}, [
					() => de(W(r)).label,
					() => !A("editInterface", "bodyEdit") || !n().editInterface,
					() => !A("editInterface", "bodyEdit") || !n().editInterface,
					() => de(W(r)).artifactKind,
					() => de(W(r)).required,
					() => !A("editInterface", "bodyEdit") || !n().editInterface,
					() => !A("editInterface", "bodyEdit") || !n().editInterface || !!W(a),
					() => !A("editInterface", "bodyEdit") || !n().editInterface || !!W(a)
				]), G("input", u, (e) => fe(W(r), "label", e.currentTarget.value)), G("change", f, (e) => fe(W(r), "artifactKind", e.currentTarget.value)), G("change", h, (e) => fe(W(r), "required", e.currentTarget.checked)), G("click", _, () => pe({
					kind: "update",
					id: W(r).id,
					...de(W(r))
				})), G("click", v, () => pe({
					kind: "remove",
					id: W(r).id
				})), q(e, i);
			});
			var v = V(d, 2), y = (e) => {
				var r = Us(), i = B(r), o = z(i), s = V(z(o));
				Q(s), P(o);
				var c = V(o), l = V(z(c)), u = z(l);
				u.value = u.__value = "input";
				var d = V(u);
				d.value = d.__value = "output", P(l);
				var g;
				oi(l), P(c), P(i);
				var _ = V(i, 2), v = V(z(_));
				X(v, 21, () => t.view.definition.kinds, Br, (e, t) => {
					var n = zs(), r = z(n, !0);
					P(n);
					var i = {};
					H(() => {
						J(r, W(t)), i !== (i = W(t)) && (n.value = (n.__value = W(t)) ?? "");
					}), q(e, n);
				}), P(v);
				var y;
				oi(v), P(_);
				var b = V(_, 2), x = z(b);
				Q(x), ke(), P(b);
				var S = V(b, 2), C = z(S);
				P(S), H((e) => {
					fi(s, W(f)), g !== (g = W(m)) && (l.value = (l.__value = W(m)) ?? "", ai(l, W(m))), y !== (y = W(p)) && (v.value = (v.__value = W(p)) ?? "", ai(v, W(p))), pi(x, W(h)), C.disabled = e;
				}, [() => !W(f).trim() || !n().editInterface || !!W(a)]), G("input", s, (e) => {
					R(f, e.currentTarget.value, !0), j();
				}), G("change", l, (e) => {
					let t = e.currentTarget.value;
					(t === "input" || t === "output") && R(m, t, !0), j();
				}), G("change", v, (e) => {
					R(p, e.currentTarget.value, !0), j();
				}), G("change", x, (e) => {
					R(h, e.currentTarget.checked, !0), j();
				}), G("click", C, () => {
					W(f).trim() && pe({
						kind: "add",
						label: W(f),
						direction: W(m),
						artifactKind: W(p),
						required: W(h)
					});
				}), q(e, r);
			}, b = /* @__PURE__ */ F(() => A("editInterface", "bodyEdit"));
			Y(v, (e) => {
				W(b) && e(y);
			}), ke(2), P(i);
			var x = V(i, 2), S = V(z(x), 2);
			X(S, 17, () => t.view.definition.parameters, (e) => e.id, (e, t) => {
				var r = Ws(), i = z(r), o = V(z(i));
				Q(o), P(i);
				var c = V(i), l = z(c);
				P(c);
				var u = V(c, 2), d = z(u), f = V(d);
				P(u), P(r), H((e, n, r, i) => {
					$(o, "aria-label", "Parameter label " + W(t).id), fi(o, W(s)[W(t).id] ?? W(t).label), o.disabled = e, J(l, `${n ?? ""}${W(t).target.instancePath.length ? " / " : ""}${W(t).target.nodeId ?? ""} · ${W(t).target.controlId ?? ""}`), d.disabled = r, f.disabled = i;
				}, [
					() => !A("editParameter", "bodyEdit") || !n().editParameter,
					() => W(t).target.instancePath.join(" / "),
					() => !A("editParameter", "bodyEdit") || !n().editParameter || !!W(a),
					() => !A("editParameter", "bodyEdit") || !n().editParameter || !!W(a)
				]), G("input", o, (e) => {
					R(s, {
						...W(s),
						[W(t).id]: e.currentTarget.value
					}, !0), j();
				}), G("click", d, () => me({
					kind: "update",
					id: W(t).id,
					label: W(s)[W(t).id] ?? W(t).label
				})), G("click", f, () => me({
					kind: "remove",
					id: W(t).id
				})), q(e, r);
			});
			var C = V(S, 2), w = (e) => {
				var r = Gs(), i = B(r), o = V(z(i));
				Q(o), P(i);
				var s = V(i, 2), c = V(z(s)), l = z(c);
				l.value = l.__value = "", X(V(l), 17, () => t.view.definition.eligibleTargets, (e) => e.key, (e, t) => {
					var n = zs(), r = z(n, !0);
					P(n);
					var i = {};
					H(() => {
						J(r, W(t).label), i !== (i = W(t).key) && (n.value = (n.__value = W(t).key) ?? "");
					}), q(e, n);
				}), P(c);
				var u;
				oi(c), P(s);
				var d = V(s, 2), f = z(d);
				P(d), H((e) => {
					fi(o, W(g)), u !== (u = W(_)) && (c.value = (c.__value = W(_)) ?? "", ai(c, W(_))), f.disabled = e;
				}, [() => !W(g).trim() || !t.view.definition.eligibleTargets.some((e) => e.key === W(_)) || !n().editParameter || !!W(a)]), G("input", o, (e) => {
					R(g, e.currentTarget.value, !0), j();
				}), G("change", c, (e) => {
					R(_, e.currentTarget.value, !0), j();
				}), G("click", f, () => {
					let e = t.view?.definition?.eligibleTargets.find((e) => e.key === W(_));
					e && W(g).trim() && me({
						kind: "add",
						label: W(g),
						target: Ie(e.target)
					});
				}), q(e, r);
			}, T = /* @__PURE__ */ F(() => A("editParameter", "bodyEdit"));
			Y(C, (e) => {
				W(T) && e(w);
			});
			var E = V(C, 2), D = (e) => {
				var n = Vs(), r = z(n, !0);
				P(n), H(() => J(r, t.view.definition.exposureNote)), q(e, n);
			};
			Y(E, (e) => {
				t.view.definition.exposureNote && e(D);
			}), P(x), H(() => J(c, `${t.view.definition.name ?? ""} · ${W(ee) ? "Owned local definition" : "Read-only definition"}`)), q(e, r);
		};
		Y(ye, (e) => {
			t.view.definition && e(be);
		});
		var xe = V(ye, 2), Se = (e) => {
			var i = fc(), o = B(i), s = V(z(o)), c = z(s);
			P(s);
			var f = V(s), p = z(f), m = V(p, 2), h = V(m, 2);
			P(f);
			var g = V(f, 2), _ = V(z(g));
			Q(_), P(g);
			var b = V(g, 2), x = V(z(b)), S = z(x);
			S.value = S.__value = "new";
			var C = V(S);
			C.value = C.__value = "revision", P(x);
			var w;
			oi(x), P(b);
			var T = V(b, 2), E = (e) => {
				var n = qs(), r = V(z(n)), i = z(r);
				i.value = i.__value = "", X(V(i), 17, () => t.view.entries, (e) => e.key, (e, t) => {
					var n = zs(), r = z(n);
					P(n);
					var i = {};
					H(() => {
						J(r, `${W(t).name ?? ""} · v${W(t).ref.version ?? ""}`), i !== (i = W(t).key) && (n.value = (n.__value = W(t).key) ?? "");
					}), q(e, n);
				}), P(r);
				var a;
				oi(r), P(n), H((e) => {
					r.disabled = e, a !== (a = W(y)) && (r.value = (r.__value = W(y)) ?? "", ai(r, W(y)));
				}, [() => !A("saveToShelf", "bodyEdit") || !t.view.permissions.libraryWrite]), G("change", r, (e) => {
					R(y, e.currentTarget.value, !0), j();
				}), q(e, n);
			};
			Y(T, (e) => {
				W(v) === "revision" && e(E);
			});
			var D = V(T, 2), ee = z(D);
			P(D), ke(2), P(o);
			var re = V(o, 2), oe = (e) => {
				var r = $s();
				X(V(z(r), 2), 17, () => t.view.instance.parameters, (e) => e.id, (e, r) => {
					let i = /* @__PURE__ */ F(() => W(r).control);
					var o = Qs(), s = z(o), c = z(s), l = V(c), u = (e) => {
						var t = Js();
						Q(t), H((e, n) => {
							$(t, "aria-label", "Override " + W(r).label), pi(t, e), t.disabled = n;
						}, [() => se(W(r).id, W(i)) === !0, () => !A("editParameterOverride", "instanceEdit") || !n().editParameterOverride]), G("change", t, (e) => ce(W(r).id, e.currentTarget.checked)), q(e, t);
					}, d = (e) => {
						var t = Ys();
						nt(t), H((e, n) => {
							$(t, "aria-label", "Override " + W(r).label), fi(t, e), t.disabled = n;
						}, [() => String(se(W(r).id, W(i))), () => !A("editParameterOverride", "instanceEdit") || !n().editParameterOverride]), G("input", t, (e) => ce(W(r).id, e.currentTarget.value)), q(e, t);
					}, f = (e) => {
						var t = Xs();
						X(t, 21, () => W(i).options ?? [], Br, (e, t) => {
							var n = zs(), r = z(n, !0);
							P(n);
							var i = {};
							H(() => {
								J(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
							}), q(e, n);
						}), P(t);
						var a;
						oi(t), H((e, n) => {
							$(t, "aria-label", "Override " + W(r).label), t.disabled = e, a !== (a = n) && (t.value = (t.__value = n) ?? "", ai(t, n));
						}, [() => !A("editParameterOverride", "instanceEdit") || !n().editParameterOverride, () => String(se(W(r).id, W(i)))]), G("change", t, (e) => ce(W(r).id, e.currentTarget.value)), q(e, t);
					}, p = (e) => {
						var t = Zs();
						Q(t), H((e, n) => {
							$(t, "type", W(i).editor === "number" ? "number" : "text"), $(t, "aria-label", "Override " + W(r).label), fi(t, e), $(t, "min", W(i).min), $(t, "max", W(i).max), t.disabled = n;
						}, [() => String(se(W(r).id, W(i))), () => !A("editParameterOverride", "instanceEdit") || !n().editParameterOverride]), G("input", t, (e) => ce(W(r).id, e.currentTarget.value)), q(e, t);
					};
					Y(l, (e) => {
						W(i).editor === "boolean" ? e(u) : W(i).editor === "json" || W(i).editor === "lines" ? e(d, 1) : W(i).editor === "enum" ? e(f, 2) : e(p, -1);
					}), P(s);
					var m = V(s), h = z(m);
					P(m);
					var g = V(m, 2), _ = z(g), v = V(_);
					P(g), P(o), H((e, t) => {
						J(c, `${W(r).label ?? ""} `), J(h, `${W(r).overridden ? "Saved instance override" : "Inherited definition value"}${W(i).effective ? " · Effective: " + W(i).effective : ""}${W(i).source ? " · " + W(i).source : ""}`), $(_, "data-save-override", W(r).id), _.disabled = e, $(v, "data-reset-override", W(r).id), v.disabled = t;
					}, [() => !A("editParameterOverride", "instanceEdit") || !n().editParameterOverride || !!W(a), () => !A("editParameterOverride", "instanceEdit") || !n().editParameterOverride || !W(r).overridden || !!W(a)]), G("click", _, () => le(W(r).id)), G("click", v, () => {
						t.view?.instance?.parameters.find((e) => e.id === W(r).id)?.overridden && le(W(r).id, !0);
					}), q(e, o);
				}), P(r), q(e, r);
			};
			Y(re, (e) => {
				t.view.instance.parameters.length && e(oe);
			});
			var de = V(re, 2), fe = (e) => {
				var r = ac();
				X(V(z(r), 2), 17, () => t.view.instance.bindings, (e) => e.key, (e, t) => {
					var r = ic(), i = z(r), o = z(i, !0);
					P(i);
					var s = V(i, 2), c = V(z(s));
					X(c, 21, () => W(t).profile.allowedModes, Br, (e, t) => {
						var n = zs(), r = z(n, !0);
						P(n);
						var i = {};
						H(() => {
							J(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
						}), q(e, n);
					}), P(c);
					var l;
					oi(c), P(s);
					var u = V(s, 2), d = (e) => {
						var r = tc(), i = V(z(r)), o = (e) => {
							var r = ec(), i = z(r);
							i.value = i.__value = "", X(V(i), 17, () => W(t).profile.options, Br, (e, t) => {
								var n = zs(), r = z(n, !0);
								P(n);
								var i = {};
								H(() => {
									J(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
								}), q(e, n);
							}), P(r);
							var o;
							oi(r), H((e) => {
								$(r, "aria-label", "Connection override " + W(t).key), r.disabled = e, o !== (o = W(t).profile.value ?? "") && (r.value = (r.__value = W(t).profile.value ?? "") ?? "", ai(r, W(t).profile.value ?? ""));
							}, [() => !W(t).editable || !A("editBindingOverride", "instanceEdit") || !n().editBindingOverride || !!W(a)]), G("change", r, (e) => ue(W(t).key, "profileId", "override", e.currentTarget.value, !0)), q(e, r);
						}, s = (e) => {
							var r = Zs();
							Q(r), H((e) => {
								$(r, "aria-label", "Connection override " + W(t).key), fi(r, W(t).profile.value ?? ""), r.disabled = e;
							}, [() => !W(t).editable || !A("editBindingOverride", "instanceEdit") || !n().editBindingOverride || !!W(a)]), G("change", r, (e) => ue(W(t).key, "profileId", "override", e.currentTarget.value, !0)), q(e, r);
						};
						Y(i, (e) => {
							W(t).profile.options?.length ? e(o) : e(s, -1);
						}), P(r), q(e, r);
					};
					Y(u, (e) => {
						W(t).profile.mode === "override" && e(d);
					});
					var f = V(u, 2), p = V(z(f));
					X(p, 21, () => W(t).model.allowedModes, Br, (e, t) => {
						var n = zs(), r = z(n, !0);
						P(n);
						var i = {};
						H(() => {
							J(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
						}), q(e, n);
					}), P(p);
					var m;
					oi(p), P(f);
					var h = V(f, 2), g = (e) => {
						var r = nc(), i = V(z(r));
						Q(i), P(r), H((e) => {
							$(i, "aria-label", "Model override " + W(t).key), fi(i, W(t).model.value ?? ""), i.disabled = e;
						}, [() => !W(t).editable || !A("editBindingOverride", "instanceEdit") || !n().editBindingOverride || !!W(a)]), G("change", i, (e) => ue(W(t).key, "model", "override", e.currentTarget.value, !0)), q(e, r);
					};
					Y(h, (e) => {
						W(t).model.mode === "override" && e(g);
					});
					var _ = V(h, 2), v = z(_);
					P(_);
					var y = V(_), b = (e) => {
						var n = rc(), r = z(n, !0);
						P(n), H(() => J(r, W(t).issue)), q(e, n);
					};
					Y(y, (e) => {
						W(t).issue && e(b);
					}), P(r), H((e, n) => {
						J(o, W(t).label), $(c, "aria-label", "Connection mode " + W(t).key), c.disabled = e, l !== (l = W(t).profile.mode) && (c.value = (c.__value = W(t).profile.mode) ?? "", ai(c, W(t).profile.mode)), $(p, "aria-label", "Model mode " + W(t).key), p.disabled = n, m !== (m = W(t).model.mode) && (p.value = (p.__value = W(t).model.mode) ?? "", ai(p, W(t).model.mode)), J(v, `Effective: ${W(t).effective ?? ""} · ${W(t).source ?? ""}`);
					}, [() => !W(t).editable || !A("editBindingOverride", "instanceEdit") || !n().editBindingOverride || !!W(a), () => !W(t).editable || !A("editBindingOverride", "instanceEdit") || !n().editBindingOverride || !!W(a)]), G("change", c, (e) => ue(W(t).key, "profileId", e.currentTarget.value, W(t).profile.value)), G("change", p, (e) => ue(W(t).key, "model", e.currentTarget.value, W(t).model.value)), q(e, r);
				}), P(r), q(e, r);
			};
			Y(de, (e) => {
				t.view.instance.bindings.length && e(fe);
			});
			var pe = V(de, 2), me = (e) => {
				var r = dc(), i = V(z(r), 2), o = V(z(i)), s = z(o);
				s.value = s.__value = "", X(V(s), 17, () => t.view.update.choices, (e) => e.key, (e, t) => {
					var n = zs(), r = z(n, !0);
					P(n);
					var i = {};
					H(() => {
						J(r, W(t).label), i !== (i = W(t).key) && (n.value = (n.__value = W(t).key) ?? "");
					}), q(e, n);
				}), P(o);
				var c;
				oi(o), P(i);
				var f = V(i, 2);
				X(f, 17, () => l, Br, (e, r) => {
					var i = lc(), a = z(i), o = z(a, !0);
					P(a);
					var s = V(a);
					X(s, 17, () => t.view.update[W(r)], (e) => e.from, (e, t) => {
						var i = sc(), a = z(i, !0), o = V(a), s = z(o);
						X(s, 17, () => W(t).options, Br, (e, t) => {
							var n = zs(), r = z(n, !0);
							P(n);
							var i = {};
							H((e) => {
								J(r, W(t).label), i !== (i = e) && (n.value = (n.__value = e) ?? "");
							}, [() => JSON.stringify(W(t).id)]), q(e, n);
						});
						var c = V(s), l = (e) => {
							var t = oc();
							t.value = t.__value = "null", q(e, t);
						};
						Y(c, (e) => {
							W(t).canDrop && e(l);
						}), P(o);
						var u;
						oi(o), P(i), H((e, n) => {
							J(a, W(t).label), $(o, "aria-label", "Mapping " + W(r) + " " + W(t).from), $(o, "data-map-kind", W(r)), o.disabled = e, u !== (u = n) && (o.value = (o.__value = n) ?? "", ai(o, n));
						}, [() => !A("prepareUpdate", "instanceEdit") || !n().prepareUpdate, () => JSON.stringify(Object.hasOwn(W(d)[W(r)], W(t).from) ? W(d)[W(r)][W(t).from] : W(t).to)]), G("change", o, (e) => ie(W(r), W(t).from, e.currentTarget.value)), q(e, i);
					});
					var c = V(s), l = (e) => {
						q(e, cc());
					};
					Y(c, (e) => {
						t.view.update[W(r)].length || e(l);
					}), P(i), H(() => J(o, u[W(r)])), q(e, i);
				});
				var p = V(f, 2);
				X(p, 17, () => t.view.update.summary, Br, (e, t) => {
					var n = Vs(), r = z(n, !0);
					P(n), H(() => J(r, W(t))), q(e, n);
				});
				var m = V(p, 2), h = (e) => {
					q(e, uc());
				};
				Y(m, (e) => {
					W(ne) && e(h);
				});
				var g = V(m, 2), _ = z(g), v = V(_);
				P(g), P(r), H((e, r) => {
					o.disabled = !t.view.permissions.instanceEdit || !n().selectUpdateRef, c !== (c = W(te)?.key ?? "") && (o.value = (o.__value = W(te)?.key ?? "") ?? "", ai(o, W(te)?.key ?? "")), _.disabled = e, v.disabled = r;
				}, [() => !A("prepareUpdate", "instanceEdit") || !n().prepareUpdate || !W(te) || !!W(a), () => !A("acceptUpdate", "instanceEdit") || !n().acceptUpdate || !t.view.update.preparedKey || !W(te) || W(ne) || !!W(a)]), G("change", o, (e) => {
					let r = e.currentTarget.value, i = t.view?.update?.choices.find((e) => e.key === r);
					e.currentTarget.selectedIndex >= 0 && t.view && t.view.permissions.instanceEdit && t.view.scope.kind === "graph" && n().selectUpdateRef && (!r || i) && n().selectUpdateRef(O(t.view), i ? k(i.ref) : null);
				}), G("click", _, () => ae(!1)), G("click", v, () => ae(!0)), q(e, r);
			};
			Y(pe, (e) => {
				t.view.update && e(me);
			}), H((e, i, a, o, s) => {
				J(c, `Pinned v${t.view.instance.ref.version ?? ""} · ${t.view.instance.owned ? "Owned local copy" : "Read-only pinned body"}`), p.disabled = !n().openInstance, m.disabled = e, h.disabled = i, fi(_, W(r)), _.disabled = a, x.disabled = o, w !== (w = W(v)) && (x.value = (x.__value = W(v)) ?? "", ai(x, W(v))), ee.disabled = s;
			}, [
				() => !A("makeLocalCopy", "instanceEdit") || !n().makeLocalCopy || !!W(a),
				() => !A("unpack", "instanceEdit") || !n().unpack || !!W(a),
				() => !A("saveToShelf", "bodyEdit") || !t.view.permissions.libraryWrite,
				() => !A("saveToShelf", "bodyEdit") || !t.view.permissions.libraryWrite,
				() => !A("saveToShelf", "bodyEdit") || !t.view.permissions.libraryWrite || !t.view.instance.owned || !n().saveToShelf || !W(r).trim() || W(v) === "revision" && !t.view.entries.some((e) => e.key === W(y)) || !!W(a)
			]), G("click", p, () => {
				t.view?.instance && n().openInstance?.(O(t.view), Ie(t.view.instance.address));
			}), G("click", m, () => {
				let e = t.view?.instance;
				e && n().makeLocalCopy && he("makeLocalCopy", A("makeLocalCopy", "instanceEdit"), (t) => n().makeLocalCopy(t, Ie(e.address), k(e.ref)));
			}), G("click", h, () => {
				let e = t.view?.instance;
				e && n().unpack && he("unpack", A("unpack", "instanceEdit"), (t) => n().unpack(t, Ie(e.address), k(e.ref)));
			}), G("input", _, (e) => {
				R(r, e.currentTarget.value, !0), j();
			}), G("change", x, (e) => {
				let t = e.currentTarget.value;
				(t === "new" || t === "revision") && R(v, t, !0), j();
			}), G("click", ee, () => {
				let e = t.view?.entries.find((e) => e.key === W(y)), i = W(v), a = W(r);
				t.view?.instance?.owned && t.view.permissions.libraryWrite && a.trim() && (i === "new" || e) && n().saveToShelf && he("saveToShelf", A("saveToShelf", "bodyEdit"), (t) => n().saveToShelf(t, i, i === "revision" && e ? k(e.ref) : null, a));
			}), q(e, i);
		};
		Y(xe, (e) => {
			t.view.instance && e(Se);
		});
		var Ce = V(xe, 2), we = (e) => {
			var r = pc(), i = V(z(r)), o = z(i, !0);
			P(i);
			var s = V(i), c = V(z(s));
			Q(c), P(s);
			var l = V(s), u = z(l);
			P(l), P(r), H((e, n) => {
				J(o, t.view.selection.label), fi(c, W(b)), c.disabled = e, u.disabled = n;
			}, [() => !A("convertSelection", "bodyEdit"), () => !A("convertSelection", "bodyEdit") || !n().convertSelection || !W(b).trim() || !t.view.selection.nodeIds.length || !!W(a)]), G("input", c, (e) => {
				R(b, e.currentTarget.value, !0), j();
			}), G("click", u, () => {
				let e = t.view?.selection?.nodeIds, r = W(b);
				e?.length && r.trim() && n().convertSelection && he("convertSelection", A("convertSelection", "bodyEdit"), (t) => n().convertSelection(t, [...e], r));
			}), q(e, r);
		};
		Y(Ce, (e) => {
			t.view.selection && e(we);
		});
		var Te = V(Ce, 2), M = (e) => {
			var n = rc(), r = z(n, !0);
			P(n), H(() => J(r, t.view.issue)), q(e, n);
		};
		Y(Te, (e) => {
			t.view.issue && e(M);
		});
		var Ee = V(Te, 2), N = (e) => {
			var t = mc(), n = z(t, !0);
			P(t), H(() => J(n, W(i))), q(e, t);
		};
		Y(Ee, (e) => {
			W(i) && e(N);
		});
		var De = V(Ee, 2), Oe = (e) => {
			q(e, hc());
		};
		Y(De, (e) => {
			W(a) && e(Oe);
		}), H((e) => {
			J(x, t.view.scopeLabel), w.disabled = !n().selectRef, re !== (re = W(E)?.key ?? "") && (w.value = (w.__value = W(E)?.key ?? "") ?? "", ai(w, W(E)?.key ?? "")), ve.disabled = e;
		}, [() => !A("importJSON", "libraryWrite") || !n().importJSON || !!W(a)]), G("change", w, (e) => {
			let r = e.currentTarget.value, i = t.view?.entries.find((e) => e.key === r);
			e.currentTarget.selectedIndex >= 0 && t.view && n().selectRef && (!r || i) && n().selectRef(O(t.view), i ? k(i.ref) : null);
		}), G("click", ve, () => {
			n().importJSON && he("importJSON", A("importJSON", "libraryWrite"), (e) => n().importJSON(e));
		}), q(e, o);
	}, Se = (e) => {
		q(e, _c());
	};
	Y(be, (e) => {
		t.view ? e(xe) : e(Se, -1);
	}), P(ge), q(e, ge), Ve();
}
_r([
	"click",
	"change",
	"input"
]);
//#endregion
//#region ui/NodeSearch.svelte
var bc = /* @__PURE__ */ K("<label class=\"pc-context-check svelte-golf61\"><input type=\"checkbox\" class=\"svelte-golf61\"/>Context sensitive</label>"), xc = /* @__PURE__ */ K("<label class=\"pc-search-field svelte-golf61\"><span class=\"svelte-golf61\">Search nodes and subgraphs</span><input type=\"search\" placeholder=\"Search…\" autocomplete=\"off\" role=\"combobox\" aria-expanded=\"true\" class=\"svelte-golf61\"/></label> <!> <span class=\"pc-search-context svelte-golf61\"> </span>", 1), Sc = /* @__PURE__ */ K("<p class=\"pc-search-context svelte-golf61\">Choose the named port to connect.</p>"), Cc = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-search-result svelte-golf61\" role=\"option\"><span class=\"svelte-golf61\"> </span> <span class=\"pc-family svelte-golf61\"> </span></button>"), wc = /* @__PURE__ */ K("<p class=\"pc-empty svelte-golf61\">No nodes match.</p>"), Tc = /* @__PURE__ */ K("<p class=\"pc-feedback svelte-golf61\" role=\"status\"> </p>"), Ec = /* @__PURE__ */ K("<div class=\"pc-node-search svelte-golf61\" role=\"dialog\" aria-modal=\"false\" tabindex=\"-1\"><div class=\"pc-popup-head svelte-golf61\"><h2 class=\"svelte-golf61\"> </h2><button type=\"button\" data-search-close=\"\" class=\"svelte-golf61\">Close</button></div> <!> <div class=\"pc-search-results svelte-golf61\" role=\"listbox\"></div> <!></div>");
function Dc(e, t) {
	let n = kr();
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
	vn(() => {
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
		e.stopPropagation(), e.key === "Escape" || e.key === "Enter" && e.target?.closest("[data-search-close]") ? (e.preventDefault(), i().dismiss?.()) : [
			"ArrowDown",
			"ArrowUp",
			"Home",
			"End"
		].includes(e.key) ? (e.preventDefault(), R(c, e.key === "Home" ? 0 : e.key === "End" ? Math.max(0, W(v).length - 1) : W(v).length ? (W(c) + (e.key === "ArrowDown" ? 1 : -1) + W(v).length) % W(v).length : 0, !0)) : e.key === "Enter" && (e.preventDefault(), S(W(y)));
	}
	var T = Or();
	gr("resize", en, x);
	var E = B(T), D = (e) => {
		var t = Ec();
		let d;
		var f = z(t), p = z(f), m = z(p, !0);
		P(p);
		var x = V(p);
		P(f);
		var T = V(f, 2), E = (e) => {
			var t = xc(), i = B(t), a = V(z(i));
			Q(a), xi(a, (e) => R(o, e), () => W(o)), P(i);
			var l = V(i, 2), u = (e) => {
				var t = bc(), n = z(t);
				Q(n), ke(), P(t), H(() => {
					pi(n, r().contextSensitive), n.disabled = r().readOnly;
				}), G("change", n, C), q(e, t);
			};
			Y(l, (e) => {
				r().origin && e(u);
			});
			var d = V(l, 2), f = z(d, !0);
			P(d), H((e) => {
				$(a, "aria-controls", n + "-results"), $(a, "aria-activedescendant", e), J(f, r().origin ? (r().origin.dir === "out" ? "Accepts " : "Produces ") + r().origin.kind : "All nodes and subgraphs");
			}, [() => W(y) ? n + "-item-" + W(h).indexOf(W(y)) : void 0]), G("input", a, () => R(c, 0)), _i(a, () => W(s), (e) => R(s, e)), q(e, t);
		}, D = (e) => {
			q(e, Sc());
		};
		Y(T, (e) => {
			r().mode === "nodes" ? e(E) : e(D, -1);
		});
		var ee = V(T, 2);
		X(ee, 21, () => W(h), (e) => g(e), (e, t) => {
			var r = Cc(), i = z(r), a = z(i, !0);
			P(i);
			var o = V(i, 1, !0);
			o.nodeValue = " ";
			var s = V(o);
			let l;
			var u = z(s, !0);
			P(s), P(r), H((e, n, i, o) => {
				$(r, "aria-selected", W(y) === W(t)), $(r, "id", e), $(r, "data-choice", "id" in W(t) ? W(t).id : void 0), $(r, "data-port", "portId" in W(t) ? W(t).portId : void 0), r.disabled = n, $(r, "title", "disabledReason" in W(t) ? W(t).disabledReason : void 0), J(a, i), l = ii(s, "", l, o), J(u, "family" in W(t) ? W(t).family : W(t).kind);
			}, [
				() => n + "-item-" + W(h).indexOf(W(t)),
				() => _(W(t)),
				() => W(t).label || g(W(t)),
				() => ({ color: "family" in W(t) ? b(W(t).family) : void 0 })
			]), G("click", r, () => S(W(t))), gr("focus", r, () => {
				let e = W(v).indexOf(W(t));
				e >= 0 && R(c, e, !0);
			}), q(e, r);
		}, (e) => {
			q(e, wc());
		}), P(ee);
		var te = V(ee, 2), ne = (e) => {
			var t = Tc(), n = z(t, !0);
			P(t), H(() => J(n, r().feedback)), q(e, t);
		};
		Y(te, (e) => {
			r().feedback && e(ne);
		}), P(t), xi(t, (e) => R(a, e), () => W(a)), H(() => {
			$(t, "aria-label", r().mode === "ports" ? "Choose connection port" : "Add node"), d = ii(t, "", d, {
				left: `${W(l) ?? ""}px`,
				top: `${W(u) ?? ""}px`
			}), J(m, r().mode === "ports" ? "Choose a port" : "Add node"), $(ee, "id", n + "-results"), $(ee, "aria-label", r().mode === "ports" ? "Compatible ports" : "Nodes and subgraphs");
		}), G("keydown", t, w), G("click", x, () => i().dismiss?.()), q(e, t);
	};
	Y(E, (e) => {
		r() && e(D);
	}), q(e, T), Ve();
}
_r([
	"keydown",
	"click",
	"input",
	"change"
]);
//#endregion
//#region ui/PinMenu.svelte
var Oc = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-pin-action svelte-i73q0t\"> </button>"), kc = /* @__PURE__ */ K("<p class=\"pc-empty svelte-i73q0t\">No attached links.</p>"), Ac = /* @__PURE__ */ K("<div class=\"pc-pin-menu svelte-i73q0t\" role=\"dialog\" aria-label=\"Pin actions\" aria-modal=\"false\" tabindex=\"-1\"><div class=\"pc-menu-head svelte-i73q0t\"><h2 class=\"svelte-i73q0t\"> </h2><button type=\"button\" aria-label=\"Close pin actions\" class=\"svelte-i73q0t\">Close</button></div> <p class=\"pc-kind svelte-i73q0t\"> </p> <!></div>");
function jc(e, t) {
	Be(t, !0);
	let n = Si(t, "view", 3, null), r = Si(t, "actions", 19, () => ({})), i = /* @__PURE__ */ L(void 0), a = /* @__PURE__ */ L(8), o = /* @__PURE__ */ L(8), s, c = (e) => !!e.disabled || !!n()?.readOnly && e.capability !== "navigation";
	function l() {
		if (!n() || !W(i)) return;
		let e = W(i).getBoundingClientRect(), t = document.documentElement.clientWidth || window.innerWidth, r = document.documentElement.clientHeight || window.innerHeight;
		R(a, Math.max(8, Math.min(n().screenAnchor.x, t - e.width - 8)), !0), R(o, Math.max(8, Math.min(n().screenAnchor.y, r - e.height - 8)), !0);
	}
	vn(() => {
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
	var f = Or();
	gr("resize", en, l);
	var p = B(f), m = (e) => {
		var t = Ac();
		let s;
		var l = z(t), f = z(l), p = z(f, !0);
		P(f);
		var m = V(f);
		P(l);
		var h = V(l, 2), g = z(h);
		P(h), X(V(h, 2), 17, () => n().entries, (e) => e.id, (e, t) => {
			var n = Oc(), r = z(n, !0);
			P(n), H((e) => {
				$(n, "data-entry", W(t).id), n.disabled = e, $(n, "title", W(t).reason), J(r, W(t).label);
			}, [() => c(W(t))]), G("click", n, () => u(W(t))), q(e, n);
		}, (e) => {
			q(e, kc());
		}), P(t), xi(t, (e) => R(i, e), () => W(i)), H(() => {
			s = ii(t, "", s, {
				left: `${W(a) ?? ""}px`,
				top: `${W(o) ?? ""}px`
			}), J(p, n().title), J(g, `${n().kind ?? ""}${n().readOnly ? " · Read only" : ""}`);
		}), G("keydown", t, d), G("click", m, () => r().dismiss?.()), q(e, t);
	};
	Y(p, (e) => {
		n() && e(m);
	}), q(e, f), Ve();
}
_r(["keydown", "click"]);
//#endregion
//#region src/ui/node-palette.js
var Mc = "M3 7 12 2l9 5v10l-9 5-9-5ZM3 7l9 5 9-5M12 12v10", Nc = "m2 7 5-3 5 3v6l-5 3-5-3Zm10 0 5-3 5 3v6l-5 3-5-3ZM7 16v4l5 3 5-3v-4", Pc = Object.freeze([
	{
		name: "Input",
		color: "#96ad52",
		icon: Mc
	},
	{
		name: "Shaping",
		color: "#589aab",
		icon: "M20 8a8 8 0 1 0 0 8M20 3v5h-5"
	},
	{
		name: "Surface",
		color: "#92c9ad",
		icon: "M20 12a8 8 0 1 0-16 0 8 8 0 0 0 16 0ZM6 18 18 6"
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
		name: "Output",
		color: "#c96d82",
		icon: Mc
	},
	{
		name: "Subgraphs",
		color: "#a3aa99",
		icon: Nc
	}
].map((e) => Object.freeze(e))), Fc = {
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
	Library: Nc,
	Routing: "M3 12h18m-7-7 7 7-7 7",
	Blocks: Mc
}, Ic = Object.freeze(Object.fromEntries(Object.entries(Fc).map(([e, t]) => [e, Object.freeze({
	name: e,
	icon: t
})]))), Lc = {
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
		Fc.Planning
	],
	compose: [
		"Assembly",
		"co",
		Fc.Assembly
	],
	repair: [
		"Revision",
		"rr",
		"m4 19 11-11 3 3L7 22ZM3 4h6M6 1v6m11-5v4m-2-2h4"
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
		Fc.Validation
	],
	"json-decode": [
		"Parsing",
		"jd",
		Fc.Parsing
	],
	"select-fields": [
		"Extraction",
		"sf",
		Fc.Extraction
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
		Fc.Delivery
	],
	reroute: [
		"Routing",
		"rt",
		Fc.Routing
	]
}, Rc = Object.freeze(Object.fromEntries(Object.entries(Lc).map(([e, [t, n, r]]) => [e, Object.freeze({
	group: t,
	shortcode: n,
	icon: r
})]))), zc = Object.freeze({
	group: "Blocks",
	shortcode: "",
	icon: Mc
}), Bc = (e) => Object.hasOwn(Rc, e) ? Rc[e] : zc, Vc = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-family-row\" aria-haspopup=\"menu\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path></path></svg><span> </span></button>"), Hc = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\">‹ Families</button>"), Uc = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\" aria-haspopup=\"menu\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path></path></svg><span class=\"pc-subfamily-name\"> </span><svg class=\"pc-sub-chevron\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"m9 5 7 7-7 7\"></path></svg></button>"), Wc = /* @__PURE__ */ K("<div role=\"menu\" tabindex=\"-1\"><!> <!></div>"), Gc = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\"> </button>"), Kc = /* @__PURE__ */ K("<input class=\"text_pole\" aria-label=\"Search nodes\" placeholder=\"Search nodes…\"/>"), qc = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\"><svg class=\"pc-leaf-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path></path></svg><span class=\"pc-catalog-name\"> </span><small> </small></button>"), Jc = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\" data-shelf-manage=\"\"><svg class=\"pc-leaf-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M3 6h18M3 18h18M8 3v6m8 6v6M3 12h18m-5-3v6\"></path></svg><span class=\"pc-catalog-name\">Manage subgraphs…</span></button>"), Yc = /* @__PURE__ */ K("<div class=\"pc-shelf-menu pc-leaf-menu\" role=\"menu\" tabindex=\"-1\"><!> <!> <!> <!></div>"), Xc = /* @__PURE__ */ K("<nav aria-label=\"Node families\"></nav> <!> <!>", 1);
function Zc(e, t) {
	Be(t, !0);
	let n = Si(t, "readOnly", 3, !1), r, i = /* @__PURE__ */ L(null), a = /* @__PURE__ */ L(null), o = /* @__PURE__ */ L(""), s = /* @__PURE__ */ L(""), c = /* @__PURE__ */ L(!1), l = /* @__PURE__ */ L(""), u = /* @__PURE__ */ L(!1), d = /* @__PURE__ */ L(0), f = /* @__PURE__ */ L(0), p = /* @__PURE__ */ L(0), m = /* @__PURE__ */ L(0), h = null, g = 0, _ = Pc.map((e) => e.name);
	function v(e = W(o)) {
		if (t.choices !== void 0 && t.view?.native) return t.choices.filter((t) => t.family === e).map((n) => {
			let r = Bc(n.id.startsWith("operation:") ? n.id.split(":")[1] : "");
			return {
				...n,
				title: n.label,
				legacy: !1,
				compatible: !n.disabledReason && !!t.choose,
				catalog: !0,
				group: e === "Subgraphs" ? "Library" : r.group,
				shortcode: n.shortcode ?? r.shortcode,
				icon: e === "Subgraphs" ? Ic.Library.icon : r.icon
			};
		});
		let n = t.view?.families.find((t) => t.name === e);
		return n ? t.view?.native ? n.operations.filter((t) => e !== "Surface" || !["pattern-scan", "validate-patches"].includes(t.id)).map((t) => ({
			...t,
			...Bc(t.id),
			legacy: !1,
			family: e
		})) : n.legacy.map((t) => ({
			...t,
			...Bc(t.id),
			legacy: !0,
			compatible: !0,
			phase: "legacy",
			family: e
		})) : [];
	}
	let y = () => [.../* @__PURE__ */ new Set([...v().map((e) => e.group), ...W(o) === "Subgraphs" && t.manageSubgraphs ? ["Library"] : []])];
	function b(e = !1) {
		g++, R(o, ""), R(s, ""), R(c, !1), e && h?.focus({ preventScroll: !0 });
	}
	vn(() => (t.view?.graphId, t.view?.native, t.choices, () => b()));
	function x() {
		let e = r.closest(".pc-canvas-area"), t = e.getBoundingClientRect();
		return {
			left: t.left + e.clientLeft,
			top: t.top + e.clientTop,
			right: t.right - e.clientLeft,
			width: e.clientWidth,
			height: e.clientHeight
		};
	}
	function S(e, t, n, r) {
		let i = x(), a = i.right - e.right - 6, o = e.left - i.left - 6, s = a >= t || o >= t, c = a >= t ? e.right - i.left + 3 : o >= t ? e.left - i.left - t - 3 : 13;
		return {
			x: Math.max(4, Math.min(c, i.width - t - 4)),
			y: Math.max(4, Math.min(e.top - i.top, i.height - n - 4)),
			compact: !s || i.width < t + r + 26
		};
	}
	async function C(e, t, n = !0) {
		if (W(o) === e) {
			n && W(i)?.querySelector("button")?.focus({ preventScroll: !0 });
			return;
		}
		let r = ++g;
		if (R(o, e, !0), R(s, ""), R(c, !1), h = t, await cr(), r !== g || W(o) !== e || !W(i)?.isConnected) return;
		let a = t.getBoundingClientRect(), l = W(i).getBoundingClientRect(), p = S(a, l.width, l.height, 110);
		R(d, p.x, !0), R(f, p.y, !0), R(u, p.compact, !0), n && W(i).querySelector("button")?.focus({ preventScroll: !0 });
	}
	async function w(e, t, n = !0) {
		if (W(s) === e) {
			n && W(a)?.querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
			return;
		}
		let r = ++g, c = W(o);
		if (R(s, e, !0), await cr(), r !== g || W(s) !== e || W(o) !== c || !W(a)?.isConnected) return;
		let l = t.getBoundingClientRect(), d = W(i).getBoundingClientRect(), f = W(a).getBoundingClientRect(), h = S({
			top: l.top,
			left: d.left,
			right: d.right
		}, f.width, f.height, 155);
		R(p, h.x, !0), R(m, h.y, !0), R(u, W(u) || h.compact, !0), n && W(a).querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
	}
	async function T() {
		let e = ++g;
		if (R(o, ""), R(s, ""), R(c, !0), R(l, ""), await cr(), e !== g || !W(c) || !W(a)?.isConnected) return;
		let t = x();
		R(p, Math.min(136, Math.max(4, t.width - 266)), !0), R(m, 13), W(a).querySelector("input")?.focus();
	}
	function E(e) {
		let r = v(e.family).find((t) => t.id === e.id);
		r?.compatible && !n() && (b(!0), r.catalog ? t.choose?.(r.id) : t.add(r.id, r.legacy));
	}
	async function D() {
		let e = W(s), t = W(o), n = ++g;
		R(s, ""), await cr(), n === g && W(o) === t && !W(s) && W(i)?.isConnected && [...W(i).querySelectorAll("[data-subfamily]")].find((t) => t.dataset.subfamily === e)?.focus({ preventScroll: !0 });
	}
	function ee(e) {
		if (e.key === "Escape") {
			e.preventDefault(), e.stopPropagation(), b(!0);
			return;
		}
		let t = e.target;
		if (e.key === "ArrowRight" && t.dataset.family && !t.disabled) {
			e.preventDefault(), e.stopPropagation(), C(t.dataset.family, t);
			return;
		}
		if (e.key === "ArrowRight" && t.dataset.subfamily) {
			e.preventDefault(), e.stopPropagation(), w(t.dataset.subfamily, t);
			return;
		}
		if (e.key === "ArrowLeft" && W(s)) {
			e.preventDefault(), e.stopPropagation(), D();
			return;
		}
		if (e.key === "ArrowLeft" && W(o)) {
			e.preventDefault(), e.stopPropagation(), b(!0);
			return;
		}
		if (e.key === "Tab") {
			b();
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
	var te = { openSearch: T }, ne = Xc();
	gr("pointerdown", en, (e) => {
		e.target.closest(".pc-node-shelf, .pc-shelf-menu") || b();
	}), gr("resize", en, () => b());
	var O = B(ne);
	X(O, 21, () => Pc, Br, (e, n) => {
		var r = Vc();
		let i;
		var a = z(r), s = z(a);
		P(a);
		var c = V(a), l = z(c, !0);
		P(c), P(r), H((e) => {
			$(r, "data-family", W(n).name), r.disabled = e, $(r, "title", W(n).name === "Transpose" ? "No supported Transpose operations yet." : "Browse " + W(n).name + " nodes"), $(r, "aria-expanded", W(o) === W(n).name), i = ii(r, "", i, { "--pc-family": W(n).color }), $(s, "d", W(n).icon), J(l, W(n).name);
		}, [() => !v(W(n).name).length && !(W(n).name === "Subgraphs" && t.manageSubgraphs) || W(n).name === "Transpose"]), G("click", r, (e) => C(W(n).name, e.currentTarget)), gr("pointerenter", r, (e) => {
			e.pointerType !== "touch" && !e.currentTarget.disabled && C(W(n).name, e.currentTarget, !1);
		}), G("keydown", r, ee), q(e, r);
	}), P(O), xi(O, (e) => r = e, () => r);
	var k = V(O, 2), A = (e) => {
		var t = Wc();
		let n;
		var r = z(t), a = (e) => {
			var t = Hc();
			G("click", t, () => b(!0)), q(e, t);
		};
		Y(r, (e) => {
			W(u) && e(a);
		}), X(V(r, 2), 17, y, Br, (e, t) => {
			var n = Uc(), r = z(n), i = z(r);
			P(r);
			var a = V(r), o = z(a, !0);
			P(a), ke(), P(n), H((e) => {
				$(n, "data-subfamily", W(t)), $(n, "aria-expanded", W(s) === W(t)), $(i, "d", Ic[W(t)]?.icon), J(o, e);
			}, [() => W(t).toUpperCase()]), G("click", n, (e) => w(W(t), e.currentTarget)), gr("pointerenter", n, (e) => {
				e.pointerType !== "touch" && w(W(t), e.currentTarget, !1);
			}), q(e, n);
		}), P(t), xi(t, (e) => R(i, e), () => W(i)), H((e) => {
			Z(t, 1, `pc-shelf-menu pc-family-menu${W(u) && W(s) ? " pc-shelf-replaced" : ""}`), $(t, "aria-label", W(o) + " categories"), n = ii(t, "", n, e);
		}, [() => ({
			left: `${W(d)}px`,
			top: `${W(f)}px`,
			"--pc-family": Pc.find((e) => e.name === W(o))?.color
		})]), G("keydown", t, ee), q(e, t);
	};
	Y(k, (e) => {
		W(o) && e(A);
	});
	var j = V(k, 2), re = (e) => {
		var r = Yc();
		let i;
		var d = z(r), f = (e) => {
			var t = Gc(), n = z(t);
			P(t), H(() => J(n, `‹ ${W(o) ?? ""}`)), G("click", t, D), q(e, t);
		};
		Y(d, (e) => {
			W(u) && W(s) && e(f);
		});
		var h = V(d, 2), g = (e) => {
			var t = Kc();
			Q(t), _i(t, () => W(l), (e) => R(l, e)), q(e, t);
		};
		Y(h, (e) => {
			W(c) && e(g);
		});
		var y = V(h, 2);
		X(y, 17, () => W(c) ? _.flatMap((e) => v(e)).filter((e) => [
			e.title,
			e.id,
			e.family,
			e.purpose,
			e.shortcode,
			...e.searchAliases ?? []
		].join(" ").toLowerCase().includes(W(l).toLowerCase())) : v().filter((e) => e.group === W(s)), (e) => e.family + e.id, (e, t) => {
			var r = qc(), i = z(r), a = z(i);
			P(i);
			var o = V(i), s = z(o, !0);
			P(o);
			var c = V(o), l = z(c, !0);
			P(c), P(r), H(() => {
				$(r, "data-shelf-choice", W(t).id), r.disabled = !W(t).compatible || n(), $(r, "title", n() ? "This graph is read-only." : W(t).disabledReason || (W(t).compatible ? W(t).purpose || "Add " + W(t).title : "Requires the " + W(t).phase + " phase")), $(a, "d", W(t).icon), J(s, W(t).title), J(l, W(t).shortcode);
			}), G("click", r, () => E(W(t))), q(e, r);
		});
		var x = V(y, 2), S = (e) => {
			var n = Jc();
			G("click", n, () => {
				b(!0), t.manageSubgraphs?.();
			}), q(e, n);
		};
		Y(x, (e) => {
			!W(c) && W(o) === "Subgraphs" && t.manageSubgraphs && e(S);
		}), P(r), xi(r, (e) => R(a, e), () => W(a)), H(() => {
			$(r, "aria-label", W(c) ? "Search nodes" : W(o) + " nodes"), i = ii(r, "", i, {
				left: `${W(p)}px`,
				top: `${W(m)}px`
			});
		}), G("keydown", r, ee), q(e, r);
	};
	return Y(j, (e) => {
		(W(s) || W(c)) && e(re);
	}), H(() => Z(O, 1, `pc-node-shelf${W(u) && W(o) ? " pc-shelf-replaced" : ""}`)), q(e, ne), Ve(te);
}
_r(["click", "keydown"]);
//#endregion
//#region ui/WorkflowSetup.svelte
var Qc = /* @__PURE__ */ K("<option> </option>"), $c = /* @__PURE__ */ K("<label> <select class=\"text_pole\"><option>Choose a connection</option><!></select></label> <label> <input class=\"text_pole\" placeholder=\"Use profile model\"/></label>", 1), el = /* @__PURE__ */ K("<p class=\"pc-error\"> </p>"), tl = /* @__PURE__ */ K("<h3> </h3> <p> </p> <p> </p> <!> <button type=\"button\" class=\"pc-btn menu_button\"> </button> <p> </p> <!>", 1), nl = /* @__PURE__ */ K("<article class=\"pc-workflow-starter\"><strong> </strong><p> </p><small> </small><button type=\"button\" class=\"pc-btn menu_button\"> </button></article>"), rl = /* @__PURE__ */ K("<label>Workflow mode<select class=\"text_pole\" aria-label=\"Workflow mode\"><option>Legacy · Replace prompt</option><option>Native · Guidance and reviewed reply</option></select></label> <!> <h3>Workflow examples</h3> <!>", 1);
function il(e, t) {
	Be(t, !0);
	var n = Or(), r = B(n), i = (e) => {
		var n = rl(), r = B(n), i = V(z(r)), a = z(i);
		a.value = a.__value = "legacy";
		var o = V(a);
		o.value = o.__value = "native", P(i);
		var s;
		oi(i), P(r);
		var c = V(r, 2), l = (e) => {
			var n = tl(), r = B(n), i = z(r, !0);
			P(r);
			var a = V(r, 2), o = z(a, !0);
			P(a);
			var s = V(a, 2), c = z(s);
			P(s);
			var l = V(s, 2);
			X(l, 17, () => t.view.roles, (e) => e.name, (e, n) => {
				var r = $c(), i = B(r), a = z(i), o = V(a), s = z(o);
				s.value = s.__value = "", X(V(s), 17, () => t.view.profiles, (e) => e.id, (e, t) => {
					var n = Qc(), r = z(n, !0);
					P(n);
					var i = {};
					H(() => {
						J(r, W(t).name), i !== (i = W(t).id) && (n.value = (n.__value = W(t).id) ?? "");
					}), q(e, n);
				}), P(o);
				var c;
				oi(o), P(i);
				var l = V(i, 2), u = z(l), d = V(u);
				Q(d), P(l), H(() => {
					J(a, `${W(n).name ?? ""} connection`), $(o, "aria-label", W(n).name + " connection"), c !== (c = W(n).profileId) && (o.value = (o.__value = W(n).profileId) ?? "", ai(o, W(n).profileId)), J(u, `${W(n).name ?? ""} model override`), fi(d, W(n).model);
				}), G("change", o, (e) => t.actions.workflowSetup?.bindRole(W(n).name, e.currentTarget.value, W(n).model)), G("input", d, (e) => t.actions.workflowSetup?.bindRole(W(n).name, W(n).profileId, e.currentTarget.value)), q(e, r);
			});
			var u = V(l, 2), d = z(u);
			P(u);
			var f = V(u, 2), p = z(f);
			P(f), X(V(f, 2), 17, () => t.view.issues, Br, (e, t) => {
				var n = el(), r = z(n, !0);
				P(n), H(() => J(r, W(t))), q(e, n);
			}), H(() => {
				J(i, t.view.name), J(o, t.view.phase === "pre" ? "Guidance helps SillyTavern plan its normal reply." : "Review a revision of the latest completed assistant reply."), J(c, `Maximum auxiliary requests: ${t.view.callBound ?? ""}`), J(d, `Assign ${t.view.phase ?? ""} phase and enable native mode`), J(p, `${t.view.assigned ? "Assigned to this phase." : "Phase is not assigned."} Arming is a separate action.`);
			}), G("click", u, () => t.actions.workflowSetup?.assign(t.view?.phase || "")), q(e, n);
		};
		Y(c, (e) => {
			t.view.native && e(l);
		}), X(V(c, 4), 17, () => t.view.starters, (e) => e.id, (e, n) => {
			var r = nl(), i = z(r), a = z(i, !0);
			P(i);
			var o = V(i), s = z(o, !0);
			P(o);
			var c = V(o), l = z(c);
			P(c);
			var u = V(c), d = z(u);
			P(u), P(r), H(() => {
				J(a, W(n).title), J(s, W(n).purpose), J(l, `${W(n).phase === "pre" ? "Before reply" : "After reply"} · Maximum ${W(n).callBound ?? ""} auxiliary requests`), J(d, `Install ${W(n).title ?? ""}`);
			}), G("click", u, () => t.actions.workflowSetup?.install(W(n).id)), q(e, r);
		}), H(() => {
			s !== (s = t.view.workflowMode) && (i.value = (i.__value = t.view.workflowMode) ?? "", ai(i, t.view.workflowMode));
		}), G("change", i, (e) => t.actions.workflowSetup?.setMode(e.currentTarget.value)), q(e, n);
	};
	Y(r, (e) => {
		t.view && e(i);
	}), q(e, n), Ve();
}
_r([
	"change",
	"input",
	"click"
]);
//#endregion
//#region ui/ImportReview.svelte
var al = /* @__PURE__ */ K("<p>A legacy graph has one Output. Import a fragment without another Output, or use Import canvas to open the full workflow separately.</p>"), ol = /* @__PURE__ */ K("<p> </p>"), sl = /* @__PURE__ */ K("<li> </li>"), cl = /* @__PURE__ */ K("<h3>Saved bindings to review</h3><ul></ul>", 1), ll = /* @__PURE__ */ K("<h3>Imported terminal effects</h3><ul></ul>", 1), ul = /* @__PURE__ */ K("<p>No imported terminal effects.</p>"), dl = /* @__PURE__ */ K("<p role=\"alert\"> </p>"), fl = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-btn menu_button\">Prepare again</button>"), pl = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay pc-import-overlay\"><div class=\"pc-workspace-dialog pc-import-review\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Import into graph\" tabindex=\"-1\"><header><h2>Import into graph</h2><button type=\"button\" class=\"pc-btn menu_button\" aria-label=\"Cancel import\">×</button></header> <p><strong> </strong> <small> </small></p> <dl><dt>Phase</dt><dd> </dd><dt>Additions</dt><dd> </dd><dt>Conservative request bound</dt><dd> </dd></dl> <p class=\"pc-import-explanation\"> </p> <!> <!> <!> <!> <p>Insertion keeps internal wiring and relative layout. It does not connect matching names, arm or assign the graph, run requests, publish Guidance, or Apply a reply.</p> <!> <footer><button type=\"button\" class=\"pc-btn menu_button\">Cancel</button><!><button type=\"button\" class=\"pc-btn menu_button pc-import-accept\">Insert into graph</button></footer></div></div>");
function ml(e, t) {
	Be(t, !0);
	let n;
	Rr(() => {
		let e = document.activeElement;
		return n.querySelector("button")?.focus(), () => e?.focus({ preventScroll: !0 });
	});
	function r(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), t.actions.cancelImport?.()), e.key === "Tab") {
			let t = [...n.querySelectorAll("button:not(:disabled)")], r = t[0], i = t.at(-1);
			e.shiftKey && document.activeElement === r && (e.preventDefault(), i?.focus()), !e.shiftKey && document.activeElement === i && (e.preventDefault(), r?.focus());
		}
	}
	var i = pl(), a = z(i), o = z(a), s = V(z(o));
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
	var b = V(p, 2), x = z(b);
	P(b);
	var S = V(b, 2), C = (e) => {
		q(e, al());
	};
	Y(S, (e) => {
		t.view.phase === "legacy" && e(C);
	});
	var w = V(S, 2), T = (e) => {
		var n = ol(), r = z(n);
		P(n), H((e) => J(r, `Imported model roles: ${e ?? ""}.`), [() => t.view.requiredRoles.join(", ")]), q(e, n);
	};
	Y(w, (e) => {
		t.view.requiredRoles.length && e(T);
	});
	var E = V(w, 2), D = (e) => {
		var n = cl(), r = V(B(n));
		X(r, 21, () => t.view.unresolvedBindings, Br, (e, t) => {
			var n = sl(), r = z(n);
			P(n), H((e) => J(r, `${W(t).title ?? ""} · ${W(t).role ?? ""}: missing ${e ?? ""}`), [() => W(t).missing.join(" and ")]), q(e, n);
		}), P(r), q(e, n);
	}, ee = (e) => {
		var n = ol(), r = z(n);
		P(n), H(() => J(r, `${t.view.phase === "legacy" ? `${t.view.inheritedBindingCount} imported model blocks inherit host defaults.` : "Saved model metadata is present."} Review local connections before running.`)), q(e, n);
	};
	Y(E, (e) => {
		t.view.unresolvedBindings.length ? e(D) : t.view.bindingReviewRequired && e(ee, 1);
	});
	var te = V(E, 2), ne = (e) => {
		var n = ll(), r = V(B(n));
		X(r, 21, () => t.view.terminals, Br, (e, t) => {
			var n = sl(), r = z(n);
			P(n), H(() => J(r, `${W(t).title ?? ""} · ${W(t).operation ?? ""}`)), q(e, n);
		}), P(r), q(e, n);
	}, O = (e) => {
		q(e, ul());
	};
	Y(te, (e) => {
		t.view.terminals.length ? e(ne) : e(O, -1);
	});
	var k = V(te, 4), A = (e) => {
		var n = dl(), r = z(n, !0);
		P(n), H(() => J(r, t.view.error)), q(e, n);
	};
	Y(k, (e) => {
		t.view.error && e(A);
	});
	var j = V(k, 2), re = z(j), ie = V(re), ae = (e) => {
		var n = fl();
		G("click", n, () => t.actions.prepareImportAgain?.()), q(e, n);
	};
	Y(ie, (e) => {
		t.view.error && e(ae);
	});
	var oe = V(ie);
	P(j), P(a), xi(a, (e) => n = e, () => n), P(i), H(() => {
		J(u, t.view.name), J(f, t.view.fileName), J(h, t.view.phase), J(_, `${t.view.nodeCount ?? ""} blocks · ${t.view.wireCount ?? ""} wires · ${t.view.groupCount ?? ""} groups`), J(y, `${t.view.callBound ?? ""} total · ${t.view.importedCallBound ?? ""} imported`), J(x, `This authoring bound includes unfinished branches. ${t.view.phase === "legacy" ? "Legacy repeats and loops are conservatively overcounted; actual reachable calls may be lower." : "Bindings and reachable execution are checked when you explicitly run the workflow."}`), oe.disabled = !!t.view.error;
	}), G("keydown", a, r), gr("paste", a, (e) => e.stopPropagation()), G("click", s, () => t.actions.cancelImport?.()), G("click", re, () => t.actions.cancelImport?.()), G("click", oe, () => t.actions.acceptImport?.()), q(e, i), Ve();
}
_r(["keydown", "click"]);
//#endregion
//#region ui/Workbench.svelte
var hl = /* @__PURE__ */ K("<p class=\"pc-preview-placeholder\"> </p>"), gl = /* @__PURE__ */ K("<div class=\"pc-workspace-run svelte-1dr9aew\"><!></div>"), _l = /* @__PURE__ */ K("<p class=\"pc-native-diagnostic svelte-1dr9aew\" role=\"alert\"> </p>"), vl = /* @__PURE__ */ K("<header class=\"pc-details-heading svelte-1dr9aew\"><strong class=\"svelte-1dr9aew\">Details</strong><button type=\"button\" class=\"svelte-1dr9aew\">Portals</button><button type=\"button\" class=\"svelte-1dr9aew\">Subgraphs</button></header><!>", 1), yl = /* @__PURE__ */ K("<p>Browse node families on the floating shelf. Middle mouse pans the graph; the wheel zooms around the pointer. Use the divider or its arrow keys to resize Preview.</p><p>Library holds personal blocks and saved material. Setup contains workflow examples, phase assignment and role defaults. Arm enables the selected host workflow; Run tests it explicitly.</p><p>File › Import into graph reviews a same-mode fragment before one undoable insertion. Import canvas opens a separate graph. Legacy canvases have one Output: use a fragment without another Output, or open the full workflow separately. Legacy request bounds conservatively include possible repeats and loops; actual reachable calls may be lower.</p><p>Right-click empty graph space or drag from a pin to search for compatible nodes. Double-click a subgraph to open its saved body in a graph tab. Pinned bodies are read-only; Make local copy enables edits through the real parent instance.</p><p>The Subgraphs shelf manages individual subgraph JSON files. Portals connect pins through named references. Preview artifact tabs show results for the selected node; Run to here checks the request bound before running. Apply reviews the fresh result against the full root workflow.</p>", 1), bl = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay\"><div class=\"pc-workspace-dialog\" role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\"><header><h2> </h2><button type=\"button\" class=\"pc-btn menu_button\" aria-label=\"Close panel\">×</button></header> <!></div></div>"), xl = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay\"><div class=\"pc-manager-dialog svelte-1dr9aew\" role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\" aria-label=\"Manage portals\"><!></div></div>"), Sl = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay\"><div class=\"pc-manager-dialog svelte-1dr9aew\" role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\" aria-label=\"Manage subgraphs\"><!></div></div>"), Cl = /* @__PURE__ */ K("<div role=\"dialog\" aria-modal=\"true\" aria-label=\"Lattice\" data-pc-workbench=\"svelte\"><!> <!> <div class=\"pc-body\"><!> <div class=\"pc-stage\"><section aria-label=\"Output preview\"><header class=\"pc-preview-pane-head\"><strong>Preview</strong><button type=\"button\" class=\"pc-btn menu_button\"> </button></header> <div class=\"pc-preview-content\"><!> <!></div></section> <!> <!> <div class=\"pc-canvas-area\" id=\"pc-workspace-graph\"><!> <!> <div class=\"pc-canvas-host\" aria-label=\"Node canvas\"></div> <!> <!> <!></div></div> <div class=\"pc-inspector pc-workspace-details svelte-1dr9aew\"><!> <!></div></div> <!> <!> <!> <!> <!> <!></div>");
function wl(e, t) {
	Be(t, !0);
	let n = Si(t, "actions", 7), r = /* @__PURE__ */ L({
		graphs: [],
		graphId: "",
		armed: !1,
		sideOpen: !0,
		inspectorOpen: !0,
		history: {
			undo: !1,
			redo: !1,
			undoTitle: "Nothing to undo",
			redoTitle: "Nothing to redo",
			note: "",
			showNote: !1
		},
		status: {
			armed: !1,
			warning: !1,
			text: "",
			overrideTitle: "",
			chatPinned: !1,
			charPinned: !1,
			charTitle: "No character selected",
			isDefault: !1
		},
		camera: {
			x: 0,
			y: 0,
			zoom: 1,
			mode: "select"
		},
		selectionCount: 0
	}), i, a, o, s, c, l, u, d;
	function f() {
		return {
			root: i,
			parts: {
				...s.getParts(),
				status: c.getElement(),
				sidebar: l.getElement(),
				inspector: u.getElement(),
				preview: d.getElement(),
				canvasHost: a
			}
		};
	}
	function p(e) {
		n({
			...n(),
			...e
		});
	}
	function m(e) {
		R(r, {
			...W(r),
			...e
		});
	}
	let h = "lattice.workspace.preview";
	function g() {
		try {
			let e = JSON.parse(localStorage.getItem(h) || "null");
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
	let _ = g(), v = /* @__PURE__ */ L(Zt(_.height)), y = /* @__PURE__ */ L(Zt(_.collapsed)), b = /* @__PURE__ */ L(500), x = /* @__PURE__ */ L(""), S = /* @__PURE__ */ L(null), C = null, w;
	function T() {
		try {
			localStorage.setItem(h, JSON.stringify({
				height: W(v),
				collapsed: W(y)
			}));
		} catch {}
	}
	function E() {
		n().resizeStart?.();
	}
	function D(e) {
		E(), R(y, e, !0), T();
	}
	function ee() {
		D(!1);
	}
	function te() {
		return ne("workflow-setup");
	}
	async function ne(e) {
		e === "open-workflow" ? s.focusGraphSelect() : e === "show-preview" ? D(!1) : e === "collapse-preview" ? D(!0) : e === "add-node" ? w.openSearch() : (C = document.activeElement, R(x, e, !0), await cr(), W(S).querySelector("button")?.focus());
	}
	function O() {
		R(x, ""), C?.focus({ preventScroll: !0 });
	}
	function k(e, t) {
		if (e.stopPropagation(), e.key === "Escape") e.preventDefault(), n()[t]?.close?.();
		else if (e.key === "Tab") {
			let t = [...e.currentTarget.querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex=\"0\"]")], n = t[0], r = t.at(-1);
			e.shiftKey && document.activeElement === n && (e.preventDefault(), r?.focus()), !e.shiftKey && document.activeElement === r && (e.preventDefault(), n?.focus());
		}
	}
	function A(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), O()), e.key === "Tab") {
			let t = [...W(S).querySelectorAll("button:not(:disabled), input, select, textarea, [tabindex=\"0\"]")], n = t[0], r = t.at(-1);
			e.shiftKey && document.activeElement === n && (e.preventDefault(), r?.focus()), !e.shiftKey && document.activeElement === r && (e.preventDefault(), n?.focus());
		}
	}
	Rr(() => {
		let e = () => {
			R(b, Math.max(90, o.clientHeight - 190), !0);
		}, t = globalThis.ResizeObserver;
		if (!t) return e(), window.addEventListener("resize", e), () => window.removeEventListener("resize", e);
		let n = new t(e);
		return n.observe(o), () => n.disconnect();
	});
	var j = {
		getParts: f,
		updateActions: p,
		update: m,
		revealPreview: ee,
		revealWorkflowSetup: te
	}, re = Cl();
	let ie;
	var ae = z(re);
	xi(Ya(ae, {
		get state() {
			return W(r);
		},
		get actions() {
			return n();
		},
		local: ne
	}), (e) => s = e, () => s);
	var oe = V(ae, 2);
	xi(Qa(oe, {
		get status() {
			return W(r).status;
		},
		get actions() {
			return n();
		}
	}), (e) => c = e, () => c);
	var se = V(oe, 2), ce = z(se);
	xi(ro(ce, {
		className: "pc-sidebar",
		label: "Block library"
	}), (e) => l = e, () => l);
	var le = V(ce, 2), ue = z(le);
	let de, fe;
	var pe = z(ue), me = V(z(pe)), he = z(me, !0);
	P(me), P(pe);
	var ge = V(pe, 2), _e = z(ge);
	xi(ro(_e, {
		className: "pc-preview",
		label: "Prompt preview"
	}), (e) => d = e, () => d);
	var ve = V(_e, 2), ye = (e) => {
		{
			let t = /* @__PURE__ */ F(() => W(r).outputPreview ?? null);
			is(e, {
				get view() {
					return W(t);
				},
				get actions() {
					return n().outputPreview;
				},
				collapse: () => D(!0)
			});
		}
	}, be = (e) => {
		var t = hl(), n = z(t, !0);
		P(t), H(() => J(n, W(r).workflow?.native ? "Run the workflow to review its result in Details." : "Choose Preview › Compile prompt to inspect the current prompt.")), q(e, t);
	};
	Y(ve, (e) => {
		W(r).workflow?.native ? e(ye) : e(be, -1);
	}), P(ge), P(ue);
	var xe = V(ue, 2), Se = (e) => {
		{
			let t = /* @__PURE__ */ F(() => Math.min(W(v), W(b)));
			ao(e, {
				get height() {
					return W(t);
				},
				get max() {
					return W(b);
				},
				start: E,
				change: (e) => {
					R(v, e, !0), T();
				}
			});
		}
	};
	Y(xe, (e) => {
		W(y) || e(Se);
	});
	var Ce = V(xe, 2);
	mo(Ce, {
		get views() {
			return W(r).graphViews;
		},
		get actions() {
			return n().graphViewActions;
		},
		panelId: "pc-workspace-graph"
	});
	var we = V(Ce, 2), Te = z(we), M = (e) => {
		var t = gl(), n = z(t);
		{
			let e = /* @__PURE__ */ F(() => W(r).runMeter ?? null);
			vs(n, {
				get view() {
					return W(e);
				},
				open: () => {
					R(x, "run-details");
				}
			});
		}
		P(t), q(e, t);
	};
	Y(Te, (e) => {
		W(r).workflow?.native && e(M);
	});
	var Ee = V(Te, 2);
	{
		let e = /* @__PURE__ */ F(() => W(r).graphViews?.active);
		yo(Ee, {
			get view() {
				return W(e);
			},
			get actions() {
				return n().graphViewActions;
			}
		});
	}
	var N = V(Ee, 2);
	xi(N, (e) => a = e, () => a);
	var De = V(N, 2), Oe = (e) => {
		var t = _l(), n = z(t, !0);
		P(t), H(() => J(n, W(r).nativeDiagnostic)), q(e, t);
	};
	Y(De, (e) => {
		W(r).nativeDiagnostic && e(Oe);
	});
	var Ae = V(De, 2);
	xi(Zc(Ae, {
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
		add: (e, t) => n().addNode?.(e, t)
	}), (e) => w = e, () => w);
	var je = V(Ae, 2), Me = (e) => {
		to(e, {
			get camera() {
				return W(r).camera;
			},
			get count() {
				return W(r).selectionCount;
			},
			get actions() {
				return n();
			}
		});
	};
	Y(je, (e) => {
		W(r).workflow?.native || e(Me);
	}), P(we), P(le), xi(le, (e) => o = e, () => o);
	var Ne = V(le, 2), Pe = z(Ne), Fe = (e) => {
		var t = vl(), i = B(t), a = V(z(i)), o = V(a);
		P(i);
		var s = V(i);
		{
			let e = /* @__PURE__ */ F(() => W(r).nodeDetails ?? null);
			Bo(s, {
				get view() {
					return W(e);
				},
				get actions() {
					return n().nodeDetails;
				}
			});
		}
		G("click", a, () => n().managePortals?.()), G("click", o, () => n().manageSubgraphs?.()), q(e, t);
	};
	Y(Pe, (e) => {
		W(r).workflow?.native && e(Fe);
	}), xi(ro(V(Pe, 2), {
		className: "pc-legacy-inspector",
		label: "Selection inspector"
	}), (e) => u = e, () => u), P(Ne), P(se);
	var Ie = V(se, 2), Le = (e) => {
		var t = bl(), i = z(t), a = z(i), o = z(a), s = z(o, !0);
		P(o);
		var c = V(o);
		P(a);
		var l = V(a, 2), u = (e) => {
			{
				let t = /* @__PURE__ */ F(() => W(r).runDetails ?? null);
				ms(e, {
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
				il(e, {
					get view() {
						return W(t);
					},
					get actions() {
						return n();
					}
				});
			}
		}, f = (e) => {
			var t = yl();
			ke(4), q(e, t);
		};
		Y(l, (e) => {
			W(x) === "run-details" ? e(u) : W(x) === "workflow-setup" ? e(d, 1) : e(f, -1);
		}), P(i), xi(i, (e) => R(S, e), () => W(S)), P(t), H(() => {
			$(i, "aria-label", W(x) === "workflow-setup" ? "Workflow setup" : W(x) === "run-details" ? "Run details" : "Workspace guide"), J(s, W(x) === "workflow-setup" ? "Workflow setup" : W(x) === "run-details" ? "Run details" : "Workspace guide");
		}), G("keydown", i, A), gr("paste", i, (e) => e.stopPropagation()), G("click", c, O), q(e, t);
	};
	Y(Ie, (e) => {
		W(x) && e(Le);
	});
	var Re = V(Ie, 2);
	Dc(Re, {
		get view() {
			return W(r).nativeSearch;
		},
		get actions() {
			return n().nativeSearch;
		}
	});
	var ze = V(Re, 2);
	jc(ze, {
		get view() {
			return W(r).nativePinMenu;
		},
		get actions() {
			return n().nativePinMenu;
		}
	});
	var He = V(ze, 2), Ue = (e) => {
		var t = xl(), i = z(t);
		Ls(z(i), {
			get view() {
				return W(r).portalManager;
			},
			get actions() {
				return n().portalManager;
			}
		}), P(i), P(t), G("keydown", i, (e) => k(e, "portalManager")), gr("paste", i, (e) => e.stopPropagation()), q(e, t);
	};
	Y(He, (e) => {
		W(r).portalManager && e(Ue);
	});
	var We = V(He, 2), Ge = (e) => {
		var t = Sl(), i = z(t);
		yc(z(i), {
			get view() {
				return W(r).subgraphManager;
			},
			get actions() {
				return n().subgraphManager;
			}
		}), P(i), P(t), G("keydown", i, (e) => k(e, "subgraphManager")), gr("paste", i, (e) => e.stopPropagation()), q(e, t);
	};
	Y(We, (e) => {
		W(r).subgraphManager && e(Ge);
	});
	var Ke = V(We, 2), qe = (e) => {
		ml(e, {
			get view() {
				return W(r).importReview;
			},
			get actions() {
				return n();
			}
		});
	};
	return Y(Ke, (e) => {
		W(r).importReview && e(qe);
	}), P(re), xi(re, (e) => i = e, () => i), H((e) => {
		ie = Z(re, 1, "pc-root svelte-1dr9aew", null, ie, {
			"pc-native-workspace": W(r).workflow?.native,
			"pc-native-default": W(r).nativeDefaultTheme,
			"pc-native-flat": W(r).nativeFlatCanvas
		}), de = Z(ue, 1, "pc-preview-pane", null, de, { "pc-preview-collapsed": W(y) }), fe = ii(ue, "", fe, e), $(me, "aria-expanded", !W(y)), J(he, W(y) ? "Expand preview" : "Collapse preview"), $(ge, "hidden", W(y)), $(we, "role", W(r).graphViews ? "tabpanel" : void 0), $(Ne, "hidden", !W(r).inspectorOpen);
	}, [() => ({ "--pc-preview-height": `${Math.min(W(v), W(b))}px` })]), G("click", me, () => D(!W(y))), q(e, re), Ve(j);
}
_r(["click", "keydown"]);
//#endregion
//#region ui/entry.js
var Tl = 0;
function El(e, t) {
	let n = Mr(Va, {
		target: e,
		props: {
			actions: t,
			markerId: `pc-loop-arrow-${++Tl}`
		}
	});
	return Ft(), {
		...n.getLayers(),
		setNodes: (e) => Ft(() => n.setNodes(e)),
		setGroups: (e) => Ft(() => n.setGroups(e)),
		setWires: (e, t, r) => Ft(() => n.setWires(e, t, r)),
		setPositions: (e, t) => Ft(() => n.setPositions(e, t)),
		destroy: () => Ir(n)
	};
}
function Dl(e, t) {
	let n = Mr(wl, {
		target: e,
		props: { actions: t }
	});
	return Ft(), {
		...n.getParts(),
		update: (e) => Ft(() => n.update(e)),
		updateActions: (e) => Ft(() => n.updateActions(e)),
		revealPreview: () => Ft(() => n.revealPreview()),
		revealWorkflowSetup: () => Ft(() => n.revealWorkflowSetup()),
		destroy: () => Ir(n)
	};
}
function Ol(e, t, n = "setup") {
	let r = Mr(ra, {
		target: e,
		props: {
			actions: t,
			mode: n
		}
	});
	return Ft(), {
		update: (e) => Ft(() => r.update(e)),
		destroy: () => Ir(r)
	};
}
//#endregion
export { El as mountCanvas, Dl as mountWorkbench, Ol as mountWorkflowSurface };
