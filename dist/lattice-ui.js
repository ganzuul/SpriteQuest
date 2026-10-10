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
var h = 1024, g = 2048, _ = 4096, v = 8192, y = 16384, b = 32768, x = 1 << 25, S = 65536, C = 1 << 19, w = 1 << 20, T = 1 << 25, E = 65536, D = 1 << 21, O = 1 << 22, k = 1 << 23, A = Symbol("$state"), j = Symbol("legacy props"), M = Symbol(""), ee = Symbol("attributes"), te = Symbol("class"), ne = Symbol("style"), re = Symbol("text"), ie = Symbol("form reset"), ae = new class extends Error {
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
var ye = {}, be = Symbol("uninitialized"), xe = "http://www.w3.org/1999/xhtml", Se = "http://www.w3.org/2000/svg", Ce = "http://www.w3.org/1998/Math/MathML";
function we() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function Te(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
function Ee() {
	console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function De() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/hydration.js
var N = !1;
function Oe(e) {
	N = e;
}
var P;
function ke(e) {
	if (e === null) throw Te(), ye;
	return P = e;
}
function Ae() {
	return ke(/* @__PURE__ */ fn(P));
}
function F(e) {
	if (N) {
		if (/* @__PURE__ */ fn(P) !== null) throw Te(), ye;
		P = e;
	}
}
function je(e = 1) {
	if (N) {
		for (var t = e, n = P; t--;) n = /* @__PURE__ */ fn(n);
		P = n;
	}
}
function Me(e = !0) {
	for (var t = 0, n = P;;) {
		if (n.nodeType === 8) {
			var r = n.data;
			if (r === "]") {
				if (t === 0) return n;
				--t;
			} else (r === "[" || r === "[!" || r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
		}
		var i = /* @__PURE__ */ fn(n);
		e && n.remove(), n = i;
	}
}
function Ne(e) {
	if (!e || e.nodeType !== 8) throw Te(), ye;
	return e.data;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/equality.js
function Pe(e) {
	return e === this.v;
}
function Fe(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function Ie(e) {
	return !Fe(e, this.v);
}
//#endregion
//#region node_modules/svelte/src/internal/shared/clone.js
var Le = [];
function Re(e, t = !1, n = !1) {
	return ze(e, /* @__PURE__ */ new Map(), "", Le, null, n);
}
function ze(t, n, r, i, a = null, o = !1) {
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
				d in t && (u[d] = ze(f, n, r, i, null, o));
			}
			return u;
		}
		if (l(t) === s) {
			u = {}, n.set(t, u), a !== null && n.set(a, u);
			for (var p of Object.keys(t)) u[p] = ze(t[p], n, r, i, null, o);
			return u;
		}
		if (t instanceof Date) return structuredClone(t);
		if (typeof t.toJSON == "function" && !o) return ze(t.toJSON(), n, r, i, t);
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
var Be = null;
function Ve(e) {
	Be = e;
}
function He(e, t = !1, n) {
	Be = {
		p: Be,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: Jn,
		l: null
	};
}
function Ue(e) {
	var t = Be, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) Cn(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, Be = t.p, e ?? {};
}
function We() {
	return !0;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/task.js
var Ge = [];
function Ke() {
	var e = Ge;
	Ge = [], f(e);
}
function qe(e) {
	if (Ge.length === 0 && !jt) {
		var t = Ge;
		queueMicrotask(() => {
			t === Ge && Ke();
		});
	}
	Ge.push(e);
}
function Je() {
	for (; Ge.length > 0;) Ke();
}
function Ye(e) {
	var t = Jn;
	if (t === null) return Gn.f |= k, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	Xe(e, t);
}
function Xe(e, t) {
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
var Ze = ~(g | _ | h);
function Qe(e, t) {
	e.f = e.f & Ze | t;
}
function $e(e) {
	e.f & 512 || e.deps === null ? Qe(e, h) : Qe(e, _);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
function et(e) {
	if (e !== null) for (let t of e) t.f & 2 && t.f & 65536 && (t.f ^= E, et(t.deps));
}
function tt(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), et(e.deps), Qe(e, h);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/store.js
var nt = !1;
function rt(e) {
	var t = nt;
	try {
		return nt = !1, [e(), nt];
	} finally {
		nt = t;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/misc.js
function it(e) {
	N && /* @__PURE__ */ dn(e) !== null && pn(e);
}
var at = !1;
function ot() {
	at || (at = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[ie]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function st(e) {
	var t = Gn, n = Jn;
	qn(null), Yn(null);
	try {
		return e();
	} finally {
		qn(t), Yn(n);
	}
}
function ct(e, t, n, r = n) {
	e.addEventListener(t, () => st(n));
	let i = e[ie];
	e[ie] = i ? () => {
		i(), r(!0);
	} : () => r(!0), ot();
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function lt(e) {
	let t = 0, n = Jt(0), r;
	return () => {
		bn() && (U(n), Dn(() => (t === 0 && (r = gr(() => e(() => Qt(n)))), t += 1, () => {
			qe(() => {
				--t, t === 0 && (r?.(), r = void 0, Qt(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var ut = S | C;
function dt(e, t, n, r) {
	new ft(e, t, n, r);
}
var ft = class {
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
	#h = lt(() => (this.#m = Jt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = Jn;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = Jn.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = On(() => {
			if (N) {
				let e = this.#t;
				Ae();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, ut), N && (this.#e = P);
	}
	#g() {
		try {
			this.#a = kn(() => this.#r(this.#e));
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		let t = this.#n.failed, { reset: n, invoke_onerror: r } = this.#v(e);
		qe(r), t && (this.#s = kn(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			t ? De() : (t = !0, n && ve(), this.#s !== null && In(this.#s, () => {
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
					Xe(e, this.#i && this.#i.parent);
				}
			}
		};
	}
	#y() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = kn(() => e(this.#e)), qe(() => {
			var e = this.#c = document.createDocumentFragment(), t = un();
			e.append(t), this.#a = this.#S(() => kn(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, In(this.#o, () => {
				this.#o = null;
			}), this.#x(Dt));
		}));
	}
	#b() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#l = 0, this.#a = kn(() => {
				this.#r(this.#e);
			}), this.#u > 0) {
				var e = this.#c = document.createDocumentFragment();
				Bn(this.#a, e);
				let t = this.#n.pending;
				this.#o = kn(() => t(this.#e));
			} else this.#x(Dt);
		} catch (e) {
			this.error(e);
		}
	}
	#x(e) {
		this.is_pending = !1, e.transfer_effects(this.#f, this.#p);
	}
	defer_effect(e) {
		tt(e, this.#f, this.#p);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#n.pending;
	}
	#S(e) {
		var t = Jn, n = Gn, r = Be;
		Yn(this.#i), qn(this.#i), Ve(this.#i.ctx);
		try {
			return Lt.ensure(), e();
		} catch (e) {
			return Ye(e), null;
		} finally {
			Yn(t), qn(n), Ve(r);
		}
	}
	#C(e, t) {
		this.has_pending_snippet() ? (this.#u += e, this.#u === 0 && (this.#x(t), this.#o && In(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null))) : this.parent && this.parent.#C(e, t);
	}
	update_pending_count(e, t) {
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, qe(() => {
			this.#d = !1, this.#m && Xt(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), U(this.#m);
	}
	error(e) {
		if (!this.#n.onerror && !this.#n.failed) throw e;
		Dt?.is_fork ? (this.#a && Dt.skip_effect(this.#a), this.#o && Dt.skip_effect(this.#o), this.#s && Dt.skip_effect(this.#s), Dt.oncommit(() => {
			this.#w(e);
		})) : this.#w(e);
	}
	#w(e) {
		this.#a &&= (Nn(this.#a), null), this.#o &&= (Nn(this.#o), null), this.#s &&= (Nn(this.#s), null), N && (ke(this.#t), je(), ke(Me()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return kn(() => {
						var r = Jn;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return Xe(e, this.#i.parent), null;
				}
			}));
		};
		qe(() => {
			var t;
			try {
				t = this.transform_error(e);
			} catch (e) {
				Xe(e, this.#i && this.#i.parent);
				return;
			}
			typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => Xe(e, this.#i && this.#i.parent)) : n(t);
		});
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/async.js
function pt(e, t, n, r) {
	let i = We() ? _t : bt;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = Jn, c = mt(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				Xe(e, s);
			}
			ht();
		}
	}
	var d = gt();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ yt(e))).then(u).catch((e) => Xe(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), ht();
	}) : f();
}
function mt() {
	var e = Jn, t = Gn, n = Be, r = Dt;
	return function(i = !0) {
		Yn(e), qn(t), Ve(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function ht(e = !0) {
	Yn(null), qn(null), Ve(null), e && Dt?.deactivate();
}
function gt() {
	var e = Jn, t = e.b, n = Dt, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function _t(e) {
	var t = 2 | g;
	return Jn !== null && (Jn.f |= C), {
		ctx: Be,
		deps: null,
		effects: null,
		equals: Pe,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v: be,
		wv: 0,
		parent: Jn,
		ac: null
	};
}
var vt = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function yt(e, t, n) {
	let r = Jn;
	r === null && ce();
	var i = void 0, a = Jt(be), o = !Gn, s = /* @__PURE__ */ new Set();
	return En(() => {
		var t = Jn, n = p();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== ae && n.reject(e);
			}).finally(ht);
		} catch (e) {
			n.reject(e), ht();
		}
		var c = Dt;
		if (o) {
			if (t.f & 32768) var l = gt();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(vt);
			else for (let e of s.values()) e.reject(vt);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== vt && (c.activate(), t ? (a.f |= k, Xt(a, t)) : (a.f & 8388608 && (a.f ^= k), Xt(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), xn(() => {
		for (let e of s) e.reject(vt);
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
	let t = /* @__PURE__ */ _t(e);
	return Zn(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function bt(e) {
	let t = /* @__PURE__ */ _t(e);
	return t.equals = Ie, t;
}
function xt(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) Nn(t[n]);
	}
}
function St(e) {
	var t, n = Jn, r = e.parent;
	if (!Un && r !== null && e.v !== be && r.f & 24576) return we(), e.v;
	Yn(r);
	try {
		e.f &= ~E, xt(e), t = lr(e);
	} finally {
		Yn(n);
	}
	return t;
}
function Ct(e) {
	var t = St(e);
	!e.equals(t) && (e.wv = or(), (!Dt?.is_fork || e.deps === null) && (Dt === null ? e.v = t : (Dt.capture(e, t, !0), Ot?.capture(e, t, !0)), e.deps === null)) ? Qe(e, h) : Un || (kt === null ? $e(e) : (bn() || Dt?.is_fork) && kt.set(e, t));
}
function wt(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && st(() => {
		t.ac.abort(ae), t.ac = null;
	}), t.fn !== null && (t.teardown = d), dr(t, 0), jn(t));
}
function Tt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && fr(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
var Et = null, Dt = null, Ot = null, kt = null, At = null, jt = !1, Mt = !1, Nt = null, Pt = null, Ft = 0, It = 1, Lt = class e {
	id = It++;
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
		Et === null ? Et = this : (Et.#n = this, this.#t = Et), Et = this;
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
			for (var r of n.d) Qe(r, g), t(r);
			for (r of n.m) Qe(r, _), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, Ft++ > 1e3 && (this.#x(), zt());
		for (let e of this.#u) this.#d.delete(e), Qe(e, g), this.schedule(e);
		for (let e of this.#d) Qe(e, _), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = Nt = [], r = [], i = Pt = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw Wt(e), this.#h() || this.discard(), t;
		}
		if (Dt = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (Nt = null, Pt = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) Ut(e, t);
			i.length > 0 && Dt.#g();
			return;
		}
		let o = this.#v();
		if (o) this.#b(r), this.#b(n), o.#y(this);
		else {
			this.#u.clear(), this.#d.clear();
			for (let e of this.#r) e(this);
			this.#r.clear(), Ot = this, Vt(r), Vt(n), Ot = null, this.#s?.resolve();
			var s = Dt;
			if (this.#a === 0 && (this.#c.length === 0 || s !== null) && this.#x(), this.#c.length > 0) {
				if (s !== null) {
					let e = s;
					e.#c.push(...this.#c.filter((t) => !e.#c.includes(t)));
				} else s = this;
			}
			s !== null && (Kt.clear(), s.#g());
		}
	}
	#_(e, t, n) {
		e.f ^= h;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= h : i & 4 ? t.push(r) : sr(r) && (i & 16 && this.#d.add(r), fr(r));
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), Qe(i, g), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), Dt = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) tt(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== be && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), kt?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		Dt = this;
	}
	deactivate() {
		Dt = null, kt = null;
	}
	flush() {
		try {
			Mt = !0, Dt = this, this.#g();
		} finally {
			Ft = 0, At = null, Nt = null, Pt = null, Mt = !1, Dt = null, kt = null, Kt.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(vt);
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
		this.#m || (this.#m = !0, qe(() => {
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
		if (Dt === null) {
			let t = Dt = new e();
			!Mt && !jt && qe(() => {
				t.#e || t.flush();
			});
		}
		return Dt;
	}
	apply() {
		kt = null;
	}
	schedule(e) {
		if (At = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) e.b.defer_effect(e);
		else {
			for (var t = e; t.parent !== null;) {
				t = t.parent;
				var n = t.f;
				if (Nt !== null && t === Jn && (Gn === null || !(Gn.f & 2))) return;
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
			e === null || (e.#n = t), t === null ? Et = e : t.#t = e, this.linked = !1;
		}
	}
};
function Rt(e) {
	var t = jt;
	jt = !0;
	try {
		var n;
		for (e && (Dt !== null && !Dt.is_fork && Dt.flush(), n = e());;) {
			if (Je(), Dt === null) return n;
			Dt.flush();
		}
	} finally {
		jt = t;
	}
}
function zt() {
	try {
		pe();
	} catch (e) {
		Xe(e, At);
	}
}
var Bt = null;
function Vt(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && sr(r) && (Bt = /* @__PURE__ */ new Set(), fr(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Fn(r), Bt?.size > 0)) {
				Kt.clear();
				for (let e of Bt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) Bt.has(n) && (Bt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || fr(n);
					}
				}
				Bt.clear();
			}
		}
		Bt = null;
	}
}
function Ht(e) {
	Dt.schedule(e);
}
function Ut(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), Qe(e, h);
		for (var n = e.first; n !== null;) Ut(n, t), n = n.next;
	}
}
function Wt(e) {
	Qe(e, h);
	for (var t = e.first; t !== null;) Wt(t), t = t.next;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/sources.js
var Gt = /* @__PURE__ */ new Set(), Kt = /* @__PURE__ */ new Map(), qt = !1;
function Jt(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: Pe,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function L(e, t) {
	let n = Jt(e, t);
	return Zn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function Yt(e, t = !1, n = !0) {
	let r = Jt(e);
	return t || (r.equals = Ie), r;
}
function R(e, t, n = !1) {
	return Gn !== null && (!Kn || Gn.f & 131072) && We() && Gn.f & 4325394 && (Xn === null || !Xn.has(e)) && _e(), Xt(e, n ? en(t) : t, Pt);
}
function Xt(e, t, n = null) {
	if (!e.equals(t)) {
		Un ? Kt.set(e, t) : Kt.has(e) || Kt.set(e, e.v);
		var r = Lt.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && St(t), kt === null && $e(t);
		}
		e.wv = or(), $t(e, g, n), We() && Jn !== null && Jn.f & 1024 && !(Jn.f & 96) && (er === null ? tr([e]) : er.push(e)), !r.is_fork && Gt.size > 0 && !qt && Zt();
	}
	return t;
}
function Zt() {
	qt = !1;
	for (let e of Gt) {
		e.f & 1024 && Qe(e, _);
		let t;
		try {
			t = sr(e);
		} catch {
			t = !0;
		}
		t && fr(e);
	}
	Gt.clear();
}
function Qt(e) {
	R(e, e.v + 1);
}
function $t(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = We(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (i || s !== Jn) {
			var l = (c & g) === 0;
			if (l && Qe(s, t), c & 131072) Gt.add(s);
			else if (c & 2) {
				var u = s;
				kt?.delete(u), c & 65536 || (c & 512 && (Jn === null || !(Jn.f & 2097152)) && (s.f |= E), $t(u, _, n));
			} else if (l) {
				var d = s;
				c & 16 && Bt !== null && Bt.add(d), n === null ? Ht(d) : n.push(d);
			}
		}
	}
}
function en(t) {
	if (typeof t != "object" || !t || A in t) return t;
	let n = l(t);
	if (n !== s && n !== c) return t;
	var r = /* @__PURE__ */ new Map(), i = e(t), o = /* @__PURE__ */ L(0), u = null, d = ir, f = (e) => {
		if (ir === d) return e();
		var t = Gn, n = ir;
		qn(null), ar(d);
		var r = e();
		return qn(t), ar(n), r;
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
					r.set(t, e), Qt(o);
				}
			} else R(n, be), Qt(o);
			return !0;
		},
		get(e, n, i) {
			if (n === A) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ L(en(s ? e[n] : be), u)), r.set(n, o)), o !== void 0) {
				var c = U(o);
				return c === be ? void 0 : c;
			}
			return Reflect.get(e, n, i);
		},
		getOwnPropertyDescriptor(e, t) {
			var n = Reflect.getOwnPropertyDescriptor(e, t);
			if (n && "value" in n) {
				var i = r.get(t);
				i && (n.value = U(i));
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
			return (n !== void 0 || Jn !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ L(i ? en(e[t]) : be, u)), r.set(t, n)), U(n) === be) ? !1 : i;
		},
		set(e, t, n, s) {
			var c = r.get(t), l = t in e;
			if (i && t === "length") for (var d = n; d < c.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ L(be, u)), r.set(d + "", p)) : R(p, be);
			}
			if (c === void 0) (!l || a(e, t)?.writable) && (c = f(() => /* @__PURE__ */ L(void 0, u)), R(c, en(n)), r.set(t, c));
			else {
				l = c.v !== be;
				var m = f(() => en(n));
				R(c, m);
			}
			var h = Reflect.getOwnPropertyDescriptor(e, t);
			if (h?.set && h.set.call(s, n), !l) {
				if (i && typeof t == "string") {
					var g = r.get("length"), _ = Number(t);
					Number.isInteger(_) && _ >= g.v && R(g, _ + 1);
				}
				Qt(o);
			}
			return !0;
		},
		ownKeys(e) {
			U(o);
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
function tn(e) {
	try {
		if (typeof e == "object" && e && A in e) return e[A];
	} catch {}
	return e;
}
function nn(e, t) {
	return Object.is(tn(e), tn(t));
}
var rn, an, on, sn, cn;
function ln() {
	if (rn === void 0) {
		rn = window, an = document, on = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		sn = a(t, "firstChild").get, cn = a(t, "nextSibling").get, u(e) && (e[te] = void 0, e[ee] = null, e[ne] = void 0, e.__e = void 0), u(n) && (n[re] = void 0);
	}
}
function un(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function dn(e) {
	return sn.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function fn(e) {
	return cn.call(e);
}
function z(e, t) {
	if (!N) return /* @__PURE__ */ dn(e);
	var n = /* @__PURE__ */ dn(P);
	if (n === null) n = P.appendChild(un());
	else if (t && n.nodeType !== 3) {
		var r = un();
		return n?.before(r), ke(r), r;
	}
	return t && gn(n), ke(n), n;
}
function B(e, t = !1) {
	if (!N) {
		var n = /* @__PURE__ */ dn(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ fn(n) : n;
	}
	if (t) {
		if (P?.nodeType !== 3) {
			var r = un();
			return P?.before(r), ke(r), r;
		}
		gn(P);
	}
	return P;
}
function V(e, t = 1, n = !1) {
	let r = N ? P : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ fn(r);
	if (!N) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = un();
			return r === null ? i?.after(a) : r.before(a), ke(a), a;
		}
		gn(r);
	}
	return ke(r), r;
}
function pn(e) {
	e.textContent = "";
}
function mn() {
	return !1;
}
function hn(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function gn(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/effects.js
function _n(e) {
	Jn === null && (Gn === null && fe(e), de()), Un && ue(e);
}
function vn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function yn(e, t) {
	var n = Jn;
	n !== null && n.f & 8192 && (e |= v);
	var r = {
		ctx: Be,
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
	Dt?.register_created_effect(r);
	var i = r;
	if (e & 4) Nt === null ? Lt.ensure().schedule(r) : Nt.push(r);
	else if (t !== null) {
		try {
			fr(r);
		} catch (e) {
			throw Nn(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= S));
	}
	if (i !== null && (i.parent = n, n !== null && vn(i, n), Gn !== null && Gn.f & 2 && !(e & 64))) {
		var a = Gn;
		(a.effects ??= []).push(i);
	}
	return r;
}
function bn() {
	return Gn !== null && !Kn;
}
function xn(e) {
	let t = yn(8, null);
	return Qe(t, h), t.teardown = e, t;
}
function Sn(e) {
	_n("$effect");
	var t = Jn.f;
	if (!Gn && t & 32 && Be !== null && !Be.i) {
		var n = Be;
		(n.e ??= []).push(e);
	} else return Cn(e);
}
function Cn(e) {
	return yn(4 | w, e);
}
function wn(e) {
	Lt.ensure();
	let t = yn(64 | C, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? In(t, () => {
			Nn(t), n(void 0);
		}) : (Nn(t), n(void 0));
	});
}
function Tn(e) {
	return yn(4, e);
}
function En(e) {
	return yn(O | C, e);
}
function Dn(e, t = 0) {
	return yn(8 | t, e);
}
function H(e, t = [], n = [], r = []) {
	pt(r, t, n, (t) => {
		yn(8, () => {
			e(...t.map(U));
		});
	});
}
function On(e, t = 0) {
	return yn(16 | t, e);
}
function kn(e) {
	return yn(32 | C, e);
}
function An(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = Un, n = Gn;
		Wn(!0), qn(null);
		try {
			t.call(null);
		} finally {
			Wn(e), qn(n);
		}
	}
}
function jn(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && st(() => {
			e.abort(ae);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : Nn(n, t), n = r;
	}
}
function Mn(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || Nn(t), t = n;
	}
}
function Nn(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (Pn(e.nodes.start, e.nodes.end), n = !0), e.f |= x, jn(e, t && !n), dr(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	An(e), e.f ^= x, e.f |= y;
	var i = e.parent;
	i !== null && i.first !== null && Fn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Pn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ fn(e);
		e.remove(), e = n;
	}
}
function Fn(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function In(e, t, n = !0) {
	var r = [];
	Ln(e, r, !0);
	var i = () => {
		n && Nn(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function Ln(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= v;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				Ln(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function Rn(e) {
	zn(e, !0);
}
function zn(e, t) {
	if (e.f & 8192) {
		e.f ^= v, e.f & 1024 || (Qe(e, g), Lt.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = !!(n.f & 65536) || !!(n.f & 32);
			zn(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function Bn(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ fn(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/legacy.js
var Vn = null, Hn = !1, Un = !1;
function Wn(e) {
	Un = e;
}
var Gn = null, Kn = !1;
function qn(e) {
	Gn = e;
}
var Jn = null;
function Yn(e) {
	Jn = e;
}
var Xn = null;
function Zn(e) {
	Gn !== null && (Xn ??= /* @__PURE__ */ new Set()).add(e);
}
var Qn = null, $n = 0, er = null;
function tr(e) {
	er = e;
}
var nr = 1, rr = 0, ir = rr;
function ar(e) {
	ir = e;
}
function or() {
	return ++nr;
}
function sr(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~E), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (sr(a) && Ct(a), a.wv > e.wv) return !0;
		}
		t & 512 && kt === null && Qe(e, h);
	}
	return !1;
}
function cr(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Xn !== null && Xn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? cr(a, t, !1) : t === a && (n ? Qe(a, g) : a.f & 1024 && Qe(a, _), Ht(a));
	}
}
function lr(e) {
	var t = Qn, n = $n, r = er, i = Gn, a = Xn, o = Be, s = Kn, c = ir, l = e.f;
	Qn = null, $n = 0, er = null, Gn = l & 96 ? null : e, Xn = null, Ve(e.ctx), Kn = !1, ir = ++rr, e.ac !== null && (st(() => {
		e.ac.abort(ae);
	}), e.ac = null);
	try {
		e.f |= D;
		var u = e.fn, d = u();
		e.f |= b;
		var f = e.deps, p = Dt?.is_fork;
		if (Qn !== null) {
			var m;
			if (p || dr(e, $n), f !== null && $n > 0) for (f.length = $n + Qn.length, m = 0; m < Qn.length; m++) f[$n + m] = Qn[m];
			else e.deps = f = Qn;
			if (bn() && e.f & 512) for (m = $n; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && $n < f.length && (dr(e, $n), f.length = $n);
		if (We() && er !== null && !Kn && f !== null && !(e.f & 6146)) for (m = 0; m < er.length; m++) cr(er[m], e);
		if (i !== null && i !== e) {
			if (rr++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = rr;
			if (t !== null) for (let e of t) e.rv = rr;
			er !== null && (r === null ? r = er : r.push(...er));
		}
		return e.f & 8388608 && (e.f ^= k), d;
	} catch (e) {
		return Ye(e);
	} finally {
		e.f ^= D, Qn = t, $n = n, er = r, Gn = i, Xn = a, Ve(o), Kn = s, ir = c;
	}
}
function ur(e, r) {
	let i = r.reactions;
	if (i !== null) {
		var a = t.call(i, e);
		if (a !== -1) {
			var o = i.length - 1;
			o === 0 ? i = r.reactions = null : (i[a] = i[o], i.pop());
		}
	}
	if (i === null && r.f & 2 && (Qn === null || !n.call(Qn, r))) {
		var s = r;
		s.f & 512 && (s.f ^= 512, s.f &= ~E), s.v !== be && $e(s), s.ac !== null && st(() => {
			s.ac.abort(ae), s.ac = null, Qe(s, g);
		}), wt(s), dr(s, 0);
	}
}
function dr(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) ur(e, n[r]);
}
function fr(e) {
	var t = e.f;
	if (!(t & 16384)) {
		Qe(e, h);
		var n = Jn, r = Hn;
		Jn = e, Hn = !(t & 96);
		try {
			t & 16777232 ? Mn(e) : jn(e), An(e);
			var i = lr(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = nr;
		} finally {
			Hn = r, Jn = n;
		}
	}
}
async function pr() {
	await Promise.resolve(), Rt();
}
function U(e) {
	var t = !!(e.f & 2);
	if (Vn?.add(e), Gn !== null && !Kn && !(Jn !== null && Jn.f & 16384) && (Xn === null || !Xn.has(e))) {
		var r = Gn.deps;
		if (Gn.f & 2097152) e.rv < rr && (e.rv = rr, Qn === null && r !== null && r[$n] === e ? $n++ : Qn === null ? Qn = [e] : Qn.push(e));
		else {
			Gn.deps ??= [], n.call(Gn.deps, e) || Gn.deps.push(e);
			var i = e.reactions;
			i === null ? e.reactions = [Gn] : n.call(i, Gn) || i.push(Gn);
		}
	}
	if (Un && Kt.has(e)) return Kt.get(e);
	if (t) {
		var a = e;
		if (Un) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || hr(a)) && (o = St(a)), Kt.set(a, o), o;
		}
		var s = !(a.f & 512) && !Kn && Gn !== null && (Hn || !!(Gn.f & 512)), c = (a.f & b) === 0;
		sr(a) && (s && (a.f |= 512), Ct(a)), s && !c && (Tt(a), mr(a));
	}
	if (kt?.has(e)) return kt.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function mr(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (Tt(t), mr(t));
}
function hr(e) {
	if (e.v === be) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Kt.has(t) || t.f & 2 && hr(t)) return !0;
	return !1;
}
function gr(e) {
	var t = Kn;
	try {
		return Kn = !0, e();
	} finally {
		Kn = t;
	}
}
function _r(e) {
	if (!(typeof e != "object" || !e || e instanceof EventTarget)) {
		if (A in e) vr(e);
		else if (!Array.isArray(e)) for (let t in e) {
			let n = e[t];
			typeof n == "object" && n && A in n && vr(n);
		}
	}
}
function vr(e, t = /* @__PURE__ */ new Set()) {
	if (typeof e == "object" && e && !(e instanceof EventTarget) && !t.has(e)) {
		t.add(e), e instanceof Date && e.getTime();
		for (let n in e) try {
			vr(e[n], t);
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
var yr = ["touchstart", "touchmove"];
function br(e) {
	return yr.includes(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
var xr = Symbol("events"), Sr = /* @__PURE__ */ new Set(), Cr = /* @__PURE__ */ new Set();
function wr(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || Or.call(t, e), !e.cancelBubble) return st(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? qe(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function W(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = wr(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && xn(() => {
		t.removeEventListener(e, o, a);
	});
}
function G(e, t, n) {
	(t[xr] ??= {})[e] = n;
}
function Tr(e) {
	for (var t = 0; t < e.length; t++) Sr.add(e[t]);
	for (var n of Cr) n(e);
}
var Er = null, Dr = !1;
function Or(e) {
	var t = this, n = t.ownerDocument, r = e.type, a = e.composedPath?.() || [], o = a[0] || e.target;
	Er = e, Dr || (Dr = !0, setTimeout(() => {
		Dr = !1, Er = null;
	}));
	var s = 0, c = Er === e && e[xr];
	if (c) {
		var l = a.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[xr] = t;
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
		var d = Gn, f = Jn;
		qn(null), Yn(null);
		try {
			for (var p, m = []; o !== null && o !== t;) {
				try {
					var h = o[xr]?.[r];
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
			e[xr] = t, delete e.currentTarget, qn(d), Yn(f);
		}
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/reconciler.js
var kr = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function Ar(e) {
	return kr?.createHTML(e) ?? e;
}
function jr(e) {
	var t = hn("template");
	return t.innerHTML = Ar(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function Mr(e, t) {
	var n = Jn;
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
		if (N) return Mr(P, null), P;
		i === void 0 && (i = jr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ dn(i)));
		var t = r || on ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ dn(t), s = t.lastChild;
			Mr(o, s);
		} else Mr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Nr(e, t, n = "svg") {
	var r = !e.startsWith("<!>"), i = !!(t & 1), a = `<${n}>${r ? e : "<!>" + e}</${n}>`, o;
	return () => {
		if (N) return Mr(P, null), P;
		if (!o) {
			var e = /* @__PURE__ */ dn(jr(a));
			if (i) for (o = document.createDocumentFragment(); /* @__PURE__ */ dn(e);) o.appendChild(/* @__PURE__ */ dn(e));
			else o = /* @__PURE__ */ dn(e);
		}
		var t = o.cloneNode(!0);
		if (i) {
			var n = /* @__PURE__ */ dn(t), r = t.lastChild;
			Mr(n, r);
		} else Mr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Pr(e, t) {
	return /* @__PURE__ */ Nr(e, t, "svg");
}
function Fr(e = "") {
	if (!N) {
		var t = un(e + "");
		return Mr(t, t), t;
	}
	var n = P;
	return n.nodeType === 3 ? gn(n) : (n.before(n = un()), ke(n)), Mr(n, n), n;
}
function Ir() {
	if (N) return Mr(P, null), P;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = un();
	return e.append(t, n), Mr(t, n), e;
}
function q(e, t) {
	if (N) {
		var n = Jn;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = P), Ae();
	} else e !== null && e.before(t);
}
function Lr() {
	if (N && P && P.nodeType === 8 && P.textContent?.startsWith("$")) {
		let e = P.textContent.substring(1);
		return Ae(), e;
	}
	return (window.__svelte ??= {}).uid ??= 1, `c${window.__svelte.uid++}`;
}
function J(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[re] ??= e.nodeValue) && (e[re] = n, e.nodeValue = `${n}`);
}
function Rr(e, t) {
	return Br(e, t);
}
var zr = /* @__PURE__ */ new Map();
function Br(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	ln();
	var l = void 0, u = wn(() => {
		var s = n ?? t.appendChild(un());
		dt(s, { pending: () => {} }, (t) => {
			He({});
			var n = Be;
			if (o && (n.c = o), a && (i.$$events = a), N && Mr(t, null), l = e(t, i) || {}, N && (Jn.nodes.end = P, P === null || P.nodeType !== 8 || P.data !== "]")) throw Te(), ye;
			Ue();
		}, c);
		var u = /* @__PURE__ */ new Set(), d = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!u.has(r)) {
					u.add(r);
					var i = br(r);
					for (let e of [t, document]) {
						var a = zr.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), zr.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, Or, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return d(r(Sr)), Cr.add(d), () => {
			for (var e of u) for (let n of [t, document]) {
				var r = zr.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, Or), r.delete(e), r.size === 0 && zr.delete(n)) : r.set(e, i);
			}
			Cr.delete(d), s !== n && s.parentNode?.removeChild(s);
		};
	});
	return Vr.set(l, u), l;
}
var Vr = /* @__PURE__ */ new WeakMap();
function Hr(e, t) {
	let n = Vr.get(e);
	return n ? (Vr.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/branches.js
var Ur = class {
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
			if (n) Rn(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (Rn(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
			}
			for (let [t, n] of this.#e) {
				if (this.#e.delete(t), t === e) break;
				let r = this.#n.get(n);
				r && (Nn(r.effect), this.#n.delete(n));
			}
			for (let [e, r] of this.#t) {
				if (e === t || this.#r.has(e)) continue;
				let i = () => {
					if (Array.from(this.#e.values()).includes(e)) {
						var t = document.createDocumentFragment();
						Bn(r, t), t.append(un()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else Nn(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), In(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (Nn(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = Dt, r = mn();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = un();
				i.append(a), this.#n.set(e, {
					effect: kn(() => t(a)),
					fragment: i
				});
			} else this.#t.set(e, kn(() => t(this.anchor)));
		}
		if (this.#e.set(n, e), r) {
			for (let [t, r] of this.#t) t === e ? n.unskip_effect(r) : n.skip_effect(r);
			for (let [t, r] of this.#n) t === e ? n.unskip_effect(r.effect) : n.skip_effect(r.effect);
			n.oncommit(this.#a), n.ondiscard(this.#o);
		} else N && (this.anchor = P), this.#a(n);
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
function Y(e, t, n = !1) {
	var r;
	N && (r = P, Ae());
	var i = new Ur(e), a = n ? S : 0;
	function o(e, t) {
		if (N) {
			var n = Ne(r);
			if (e !== parseInt(n.substring(1))) {
				var a = Me();
				ke(a), i.anchor = a, Oe(!1), i.ensure(e, t), Oe(!0);
				return;
			}
		}
		i.ensure(e, t);
	}
	On(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/key.js
var Wr = Symbol("NaN");
function Gr(e, t, n) {
	N && Ae();
	var r = new Ur(e), i = !We();
	On(() => {
		var e = t();
		e !== e && (e = Wr), i && typeof e == "object" && e && (e = {}), r.ensure(e, n);
	});
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
function Kr(e, t) {
	return t;
}
function qr(e, t, n) {
	for (var i = [], a = t.length, o, s = t.length, c = 0; c < a; c++) {
		let n = t[c];
		In(n, () => {
			if (o) {
				if (o.pending.delete(n), o.done.add(n), o.pending.size === 0) {
					var t = e.outrogroups;
					Jr(e, r(o.done)), t.delete(o), t.size === 0 && (e.outrogroups = null);
				}
			} else --s;
		}, !1);
	}
	if (s === 0) {
		var l = i.length === 0 && n !== null && e.pending.size === 0;
		if (l) {
			var u = n, d = u.parentNode;
			pn(d), d.append(u), e.items.clear();
		}
		Jr(e, t, !l);
	} else o = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(o);
}
function Jr(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= T, Bn(a, document.createDocumentFragment())) : Nn(t[i], n);
	}
}
var Yr;
function X(t, n, i, a, o, s = null) {
	var c = t, l = /* @__PURE__ */ new Map();
	if (n & 4) {
		var u = t;
		c = N ? ke(/* @__PURE__ */ dn(u)) : u.appendChild(un());
	}
	N && Ae();
	var d = null, f = /* @__PURE__ */ bt(() => {
		var t = i();
		return e(t) ? t : t == null ? [] : r(t);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, Zr(v, p, c, n, a), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= T, $r(d, null, c)) : Rn(d) : In(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: On(() => {
			p = U(f);
			var e = p.length;
			let t = !1;
			N && Ne(c) === "[!" != (e === 0) && (c = Me(), ke(c), Oe(!1), t = !0);
			for (var r = /* @__PURE__ */ new Set(), u = Dt, v = mn(), y = 0; y < e; y += 1) {
				N && P.nodeType === 8 && P.data === "]" && (c = P, t = !0, Oe(!1));
				var b = p[y], x = a(b, y), S = h ? null : l.get(x);
				S ? (S.v && Xt(S.v, b), S.i && Xt(S.i, y), v && u.unskip_effect(S.e)) : (S = Qr(l, h ? c : Yr ??= un(), b, x, y, o, n, i), h || (S.e.f |= T), l.set(x, S)), r.add(x);
			}
			if (e === 0 && s && !d && (h ? d = kn(() => s(c)) : (d = kn(() => s(Yr ??= un())), d.f |= T)), e > r.size && le("", "", ""), N && e > 0 && ke(Me()), !h) {
				if (m.set(u, r), v) {
					for (let [e, t] of l) r.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			t && Oe(!0), U(f);
		}),
		flags: n,
		items: l,
		pending: m,
		outrogroups: null,
		fallback: d
	};
	h = !1, N && (c = P);
}
function Xr(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function Zr(e, t, n, i, a) {
	var o = !!(i & 8), s = t.length, c = e.items, l = Xr(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (o) for (v = 0; v < s; v += 1) h = t[v], g = a(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = a(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (Rn(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= T, _ === l) $r(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), ei(e, d, _), ei(e, _, y), $r(_, y, n), d = _, p = [], m = [], l = Xr(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], C = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) $r(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					ei(e, S.prev, C.next), ei(e, d, S), ei(e, C, b), l = b, d = C, --v, p = [], m = [];
				} else u.delete(_), $r(_, l, n), ei(e, _.prev, _.next), ei(e, _, d === null ? e.effect.first : d.next), ei(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = Xr(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = Xr(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (Jr(e, r(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var w = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || w.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && w.push(l), l = Xr(l.next);
		var E = w.length;
		if (E > 0) {
			var D = i & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < E; v += 1) w[v].nodes?.a?.measure();
				for (v = 0; v < E; v += 1) w[v].nodes?.a?.fix();
			}
			qr(e, w, D);
		}
	}
	o && qe(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Qr(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? Jt(n) : /* @__PURE__ */ Yt(n, !1, !1) : null, l = o & 2 ? Jt(i) : null;
	return {
		v: c,
		i: l,
		e: kn(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function $r(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ fn(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function ei(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function ti(e, t, n = !1, r = !1, i = !1, a = !1) {
	var o = e, s = "";
	if (n) {
		var c = e;
		N && (o = ke(/* @__PURE__ */ dn(c)));
	}
	H(() => {
		var e = Jn;
		if (s === (s = t() ?? "")) N && Ae();
		else if (n && !N) e.nodes = null, c.innerHTML = s, s !== "" && Mr(/* @__PURE__ */ dn(c), c.lastChild);
		else if (e.nodes !== null && (Pn(e.nodes.start, e.nodes.end), e.nodes = null), s !== "") {
			if (N) {
				for (var a = P.data, l = Ae(), u = l; l !== null && (l.nodeType !== 8 || l.data !== "");) u = l, l = /* @__PURE__ */ fn(l);
				if (l === null) throw Te(), ye;
				Mr(P, u), o = ke(l);
			} else {
				var d = hn(r ? "svg" : i ? "math" : "template", r ? Se : i ? Ce : void 0);
				d.innerHTML = s;
				var f = r || i ? d : d.content;
				if (Mr(/* @__PURE__ */ dn(f), f.lastChild), r || i) for (; /* @__PURE__ */ dn(f);) o.before(/* @__PURE__ */ dn(f));
				else o.before(f);
			}
		}
	});
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/actions.js
function ni(e, t, n) {
	Tn(() => {
		var r = gr(() => t(e, n?.()) || {});
		if (n && r?.update) {
			var i = !1, a = {};
			Dn(() => {
				var e = n();
				_r(e), i && Fe(a, e) && (a = e, r.update(e));
			}), i = !0;
		}
		if (r?.destroy) return () => r.destroy();
	});
}
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function ri(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") {
		if (Array.isArray(e)) {
			var i = e.length;
			for (t = 0; t < i; t++) e[t] && (n = ri(e[t])) && (r && (r += " "), r += n);
		} else for (n in e) e[n] && (r && (r += " "), r += n);
	}
	return r;
}
function ii() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = ri(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/shared/attributes.js
function ai(e) {
	return typeof e == "object" ? ii(e) : e ?? "";
}
var oi = [..." 	\n\r\f\xA0\v﻿"];
function si(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || oi.includes(r[o - 1])) && (s === r.length || oi.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function ci(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function li(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function ui(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\/\*.*?\*\//g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(li)), i && c.push(...Object.keys(i).map(li));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = li(e.substring(l, u).trim());
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
		return r && (n += ci(r)), i && (n += ci(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/class.js
function di(e, t, n, r, i, a) {
	var o = e[te];
	if (N || o !== n || o === void 0) {
		var s = si(n, r, a);
		(!N || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[te] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/style.js
function fi(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function pi(e, t, n, r) {
	var i = e[ne];
	if (N || i !== t) {
		var a = ui(t, r);
		(!N || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[ne] = t;
	} else r && (Array.isArray(r) ? (fi(e, n?.[0], r[0]), fi(e, n?.[1], r[1], "important")) : fi(e, n, r));
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function mi(t, n, r = !1) {
	if (t.multiple) {
		if (n == null) return;
		if (!e(n)) return Ee();
		for (var i of t.options) i.selected = n.includes(_i(i));
	} else {
		for (i of t.options) if (nn(_i(i), n)) {
			i.selected = !0;
			return;
		}
		(!r || n !== void 0) && (t.selectedIndex = -1);
	}
}
function hi(e) {
	var t = new MutationObserver(() => {
		"__value" in e && mi(e, e.__value);
	});
	t.observe(e, {
		childList: !0,
		subtree: !0,
		attributes: !0,
		attributeFilter: ["value"]
	}), xn(() => {
		t.disconnect();
	});
}
function gi(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet(), i = !0;
	ct(e, "change", (t) => {
		var i = t ? "[selected]" : ":checked", a;
		if (e.multiple) a = [].map.call(e.querySelectorAll(i), _i);
		else {
			var o = e.querySelector(i) ?? e.querySelector("option:not([disabled])");
			a = o && _i(o);
		}
		n(a), e.__value = a, Dt !== null && r.add(Dt);
	}), Tn(() => {
		var a = t();
		if (e === document.activeElement) {
			var o = Dt;
			if (r.has(o)) return;
		}
		if (mi(e, a, i), i && a === void 0) {
			var s = e.querySelector(":checked");
			s !== null && (a = _i(s), n(a));
		}
		e.__value = a, i = !1;
	}), hi(e);
}
function _i(e) {
	return "__value" in e ? e.__value : e.value;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var vi = Symbol("is custom element"), yi = Symbol("is html"), bi = oe ? "link" : "LINK", xi = oe ? "progress" : "PROGRESS";
function Z(e) {
	if (N) {
		var t = !1, n = () => {
			if (!t) {
				if (t = !0, e.hasAttribute("value")) {
					var n = e.value;
					Q(e, "value", null), e.value = n;
				}
				if (e.hasAttribute("checked")) {
					var r = e.checked;
					Q(e, "checked", null), e.checked = r;
				}
			}
		};
		e[ie] = n, qe(n), ot();
	}
}
function Si(e, t) {
	var n = wi(e);
	n.value !== (n.value = t ?? void 0) && (e.value !== t || t === 0 && e.nodeName === xi) && (e.value = t ?? "");
}
function Ci(e, t) {
	var n = wi(e);
	n.checked !== (n.checked = t ?? void 0) && (e.checked = t);
}
function Q(e, t, n, r) {
	var i = wi(e);
	N && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === bi) || i[t] !== (i[t] = n) && (t === "loading" && (e[M] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Ei(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function wi(e) {
	return e[ee] ??= {
		[vi]: e.nodeName.includes("-"),
		[yi]: e.namespaceURI === xe
	};
}
var Ti = /* @__PURE__ */ new Map();
function Ei(e) {
	var t = e.getAttribute("is") || e.nodeName, n = Ti.get(t);
	if (n) return n;
	Ti.set(t, n = []);
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var s in r = o(i), r) r[s].set && s !== "innerHTML" && s !== "textContent" && s !== "innerText" && n.push(s);
		i = l(i);
	}
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function Di(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet();
	ct(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = Oi(e) ? ki(a) : a, n(a), Dt !== null && r.add(Dt), await pr(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (N && e.defaultValue !== e.value || gr(t) == null && e.value) && (n(Oi(e) ? ki(e.value) : e.value), Dt !== null && r.add(Dt)), Dn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = Dt;
			if (r.has(i)) return;
		}
		Oi(e) && n === ki(e.value) || (e.type !== "date" || n || e.value) && n !== e.value && (e.value = n ?? "");
	});
}
function Oi(e) {
	var t = e.type;
	return t === "number" || t === "range";
}
function ki(e) {
	return e === "" ? null : +e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function Ai(e, t) {
	return e === t || e?.[A] === t;
}
function ji(e = {}, t, n, r) {
	var i = Be.r, a = Jn;
	return Tn(() => {
		var o, s;
		return Dn(() => {
			o = s, s = r?.() || [], gr(() => {
				Ai(n(...s), e) || (t(e, ...s), o && Ai(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && Ai(n(...s), e) && t(null, ...s);
			}, c = r.teardown;
			r.teardown = () => {
				o(), c?.();
			};
		};
	}), e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/props.js
function Mi(e, t, n, r) {
	var i = !0, o = !!(n & 8), s = !!(n & 16), c = r, l = !0, u = void 0, d = () => s && i ? (u ??= /* @__PURE__ */ _t(r), U(u)) : (l && (l = !1, c = s ? gr(r) : r), c);
	let f;
	if (o) {
		var p = A in e || j in e;
		f = a(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	o ? [m, h] = rt(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && me(t), f(m)));
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
	var v = !1, y = (n & 1 ? _t : bt)(() => (v = !1, g()));
	o && U(y);
	var b = Jn;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? U(y) : i && o ? en(e) : e;
			return R(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return Un && v || b.f & 16384 ? y.v : U(y);
	});
}
function Ni(e) {
	Be === null && se("onMount"), Sn(() => {
		let t = gr(e);
		if (typeof t == "function") return t;
	});
}
function Pi(e) {
	Be === null && se("onDestroy"), Ni(() => () => gr(e));
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region src/ui/artifact-glyph.js
var Fi = Object.freeze([
	"context",
	"guidance",
	"draft",
	"patches",
	"candidate",
	"text",
	"data"
]), Ii = .5625;
Object.freeze({
	context: "#f0e442",
	guidance: "#cc79a7",
	draft: "#7fd8c5",
	patches: "#ed8956",
	candidate: "#b49af2",
	text: "#e69f00",
	data: "#56b4e9"
}), Object.freeze({
	context: "filled circle",
	guidance: "diamond",
	draft: "pentagon",
	patches: "triangle",
	candidate: "ring with center dot",
	text: "capsule",
	data: "square"
});
var Li = Math.sqrt(3) * 5.5 / 2, Ri = Object.freeze({
	context: "<circle cx=\"0\" cy=\"0\" r=\"5.5\" />",
	guidance: "<polygon points=\"0,-6.5 6.5,0 0,6.5 -6.5,0\" />",
	draft: "<polygon points=\"0,-5.5 5.5,-1.32 3.41,5.5 -3.41,5.5 -5.5,-1.32\" />",
	patches: `<polygon points="0,${-Li} 5.5,${Li} -5.5,${Li}" />`,
	candidate: "<circle cx=\"0\" cy=\"0\" r=\"6.5\" fill=\"none\" /><circle cx=\"0\" cy=\"0\" r=\"2.475\" />",
	text: "<rect x=\"-7.5\" y=\"-3.465\" width=\"15\" height=\"6.93\" rx=\"3.465\" />",
	data: "<rect x=\"-5.5\" y=\"-5.5\" width=\"11\" height=\"11\" />"
});
function zi(e) {
	let t = Fi.includes(e) ? e : "context";
	return `<g data-glyph="${t}" transform="scale(${Ii})" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round">${Ri[t]}</g>`;
}
//#endregion
//#region ui/ArtifactPin.svelte
var Bi = /* @__PURE__ */ Pr("<svg width=\"18\" height=\"18\" viewBox=\"-9 -9 18 18\" aria-hidden=\"true\" focusable=\"false\"></svg>");
function Vi(e, t) {
	He(t, !0);
	let n = Mi(t, "className", 3, "pc-pin-glyph");
	var r = Bi();
	ti(r, () => zi(t.kind), !0), F(r), H(() => {
		di(r, 0, ai(n())), Q(r, "data-kind", t.kind), Q(r, "x", t.x), Q(r, "y", t.y);
	}), q(e, r), Ue();
}
//#endregion
//#region ui/NodeCard.svelte
var Hi = /* @__PURE__ */ K("<span class=\"pc-modifier-badge svelte-1jilz27\"> </span>"), Ui = /* @__PURE__ */ K("<div><span class=\"pc-native-pin-label\"> </span> <div role=\"img\"><!></div></div>"), Wi = /* @__PURE__ */ K("<div class=\"pc-node-body\"> </div>"), Gi = /* @__PURE__ */ K("<span class=\"pc-native-alias\"> </span>"), Ki = /* @__PURE__ */ K("<div class=\"pc-recall-status-space\" aria-hidden=\"true\"></div>"), qi = /* @__PURE__ */ Pr("<path class=\"pc-recall-marker\" d=\"M17 18h5M19.5 15.5v5\"></path>"), Ji = /* @__PURE__ */ Pr("<path class=\"pc-recall-marker\" d=\"m16 18 3 3 4-6\"></path>"), Yi = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-node-recall-status\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M7 5a8 8 0 1 1-3 6M3 4v6h6M12 7v5l3 2\"></path><!></svg></button>"), Xi = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-node-action pc-host-result\" aria-label=\"Preview host result\"><i class=\"fa-solid fa-eye\" aria-hidden=\"true\"></i> Host result</button>"), Zi = /* @__PURE__ */ K("<div role=\"group\" tabindex=\"0\"><div class=\"pc-native-heading\"><svg class=\"pc-native-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path></path></svg><span class=\"pc-node-title\"> </span><!></div> <div class=\"pc-native-pins\"></div> <!> <!> <!> <!> <!></div>");
function Qi(e, t) {
	He(t, !0);
	let n = (e) => e.stopPropagation();
	var r = Zi();
	let i, a;
	var o = z(r), s = z(o), c = z(s);
	F(s);
	var l = V(s), u = z(l, !0);
	F(l);
	var d = V(l), f = (e) => {
		var n = Hi(), r = z(n);
		F(n), H(() => {
			Q(n, "title", t.card.modifierSummary.text), Q(n, "aria-label", t.card.modifierSummary.text), J(r, `+${t.card.modifierSummary.count ?? ""}`);
		}), q(e, n);
	};
	Y(d, (e) => {
		t.card.modifierSummary && e(f);
	}), F(o);
	var p = V(o, 2);
	X(p, 21, () => t.card.ports, (e) => e.id, (e, n) => {
		var r = Ui();
		let i;
		var a = z(r), o = z(a, !0);
		F(a);
		var s = V(a, 2);
		Vi(z(s), { get kind() {
			return U(n).kind;
		} }), F(s), F(r), H(() => {
			di(r, 1, `pc-native-row pc-native-row-${U(n).dir}`, "svelte-1jilz27"), i = pi(r, "", i, { "grid-row": U(n).row }), J(o, U(n).label), di(s, 1, ai(U(n).className), "svelte-1jilz27"), Q(s, "data-node", t.card.id), Q(s, "data-dir", U(n).dir), Q(s, "data-port", U(n).port), Q(s, "data-side", U(n).side), Q(s, "data-kind", U(n).kind), Q(s, "title", U(n).title), Q(s, "aria-label", U(n).title);
		}), W("mouseenter", s, () => t.actions.hoverPin({
			nodeId: t.card.id,
			dir: U(n).dir,
			port: U(n).port
		})), W("mouseleave", s, () => t.actions.hoverPin(null)), q(e, r);
	}), F(p);
	var m = V(p, 2), h = (e) => {
		var n = Wi(), r = z(n, !0);
		F(n), H(() => J(r, t.card.body)), q(e, n);
	};
	Y(m, (e) => {
		t.card.type === "note" && e(h);
	});
	var g = V(m, 2), _ = (e) => {
		var n = Gi(), r = z(n, !0);
		F(n), H(() => {
			Q(n, "title", t.card.titleHint), J(r, t.card.title);
		}), q(e, n);
	};
	Y(g, (e) => {
		t.card.compact && e(_);
	});
	var v = V(g, 2), y = (e) => {
		q(e, Ki());
	};
	Y(v, (e) => {
		(t.card.label === "Recall" || t.card.label === "Recall Shortcut") && e(y);
	});
	var b = V(v, 2), x = (e) => {
		var r = Yi(), i = z(r), a = V(z(i)), o = (e) => {
			q(e, qi());
		}, s = (e) => {
			q(e, Ji());
		};
		Y(a, (e) => {
			t.card.recall.state === "generation" ? e(o) : t.card.recall.state === "acceptance" && e(s, 1);
		}), F(i), F(r), H(() => {
			Q(r, "data-recall-state", t.card.recall.state), Q(r, "title", t.card.recall.tooltip), Q(r, "aria-label", t.card.recall.ariaLabel);
		}), G("pointerdown", r, n), G("mousedown", r, n), G("contextmenu", r, n), G("keydown", r, n), G("click", r, (e) => {
			n(e), t.actions.openRecallDetails?.(t.card.id);
		}), q(e, r);
	};
	Y(b, (e) => {
		t.card.recall && e(x);
	});
	var S = V(b, 2), C = (e) => {
		var r = Xi();
		G("mousedown", r, n), G("click", r, (e) => {
			n(e), t.actions.hostResult(t.card.id);
		}), q(e, r);
	};
	Y(S, (e) => {
		t.card.hostResult && e(C);
	}), F(r), H(() => {
		i = di(r, 1, ai(t.card.className), "svelte-1jilz27", i, { "pc-recall-capable": t.card.label === "Recall" || t.card.label === "Recall Shortcut" }), Q(r, "data-id", t.card.id), Q(r, "title", t.card.offHint), Q(r, "aria-label", `${t.card.label}: ${t.card.title}`), a = pi(r, "", a, {
			left: `${t.card.x}px`,
			top: `${t.card.y}px`
		}), Q(c, "d", t.card.iconPath), Q(l, "title", t.card.titleHint), J(u, t.card.title);
	}), q(e, r), Ue();
}
Tr([
	"pointerdown",
	"mousedown",
	"contextmenu",
	"keydown",
	"click"
]);
//#endregion
//#region ui/GroupCard.svelte
var $i = /* @__PURE__ */ K("<div class=\"pc-node-body\"> </div>"), ea = /* @__PURE__ */ K("<div role=\"group\"><div><i class=\"fa-solid fa-object-group\" aria-hidden=\"true\"></i> <span> </span> <span class=\"pc-group-frame-count\"> </span> <button type=\"button\"></button></div> <!></div>");
function ta(e, t) {
	He(t, !0);
	function n(e, n) {
		e.stopPropagation(), e.preventDefault(), t.actions.group(t.group.id, n);
	}
	function r(e, n) {
		e.stopPropagation(), e.detail === 0 && t.actions.group(t.group.id, n);
	}
	var i = ea();
	let a;
	var o = z(i), s = V(z(o), 2), c = z(s, !0);
	F(s);
	var l = V(s, 2), u = z(l, !0);
	F(l);
	var d = V(l, 2);
	F(o);
	var f = V(o, 2), p = (e) => {
		var n = $i(), r = z(n, !0);
		F(n), H(() => J(r, t.group.body)), q(e, n);
	};
	Y(f, (e) => {
		t.group.collapsed && e(p);
	}), F(i), H(() => {
		di(i, 1, ai(t.group.className)), Q(i, "data-group", t.group.id), Q(i, "aria-label", `Group: ${t.group.title}`), a = pi(i, "", a, {
			left: `${t.group.x}px`,
			top: `${t.group.y}px`,
			width: `${t.group.w}px`,
			height: t.group.collapsed ? void 0 : `${t.group.h}px`
		}), di(o, 1, ai(t.group.collapsed ? "pc-node-head" : "pc-group-frame-head")), di(s, 1, ai(t.group.collapsed ? "pc-node-title" : "pc-group-frame-title")), J(c, t.group.title), J(u, t.group.count), di(d, 1, `pc-node-action fa-solid pc-group-btn ${t.group.collapsed ? "fa-up-right-and-down-left-from-center" : "fa-down-left-and-up-right-to-center"}`), Q(d, "data-action", t.group.collapsed ? "open" : "collapse"), Q(d, "title", t.group.collapsed ? "Open group" : "Fold group"), Q(d, "aria-label", t.group.collapsed ? "Open group" : "Fold group");
	}), G("mousedown", d, (e) => n(e, t.group.collapsed ? "open" : "collapse")), G("click", d, (e) => r(e, t.group.collapsed ? "open" : "collapse")), q(e, i), Ue();
}
Tr(["mousedown", "click"]);
//#endregion
//#region ui/WireLayer.svelte
var na = /* @__PURE__ */ Pr("<path class=\"pc-wire-hit\"></path><path><title> </title></path><text text-anchor=\"middle\"> </text>", 1), ra = /* @__PURE__ */ Pr("<path></path>"), ia = /* @__PURE__ */ Pr("<!><!>", 1);
function aa(e, t) {
	He(t, !0);
	var n = ia(), r = B(n);
	X(r, 17, () => t.wires, (e) => e.id, (e, t) => {
		var n = na(), r = B(n), i = V(r), a = z(i), o = z(a);
		F(a), F(i);
		var s = V(i), c = z(s, !0);
		F(s), H(() => {
			Q(r, "d", U(t).d), Q(r, "data-id", U(t).id), Q(i, "d", U(t).d), di(i, 0, ai(U(t).className)), Q(i, "data-id", U(t).id), Q(i, "data-kind", U(t).kind), J(o, `${U(t).kind ?? ""} artifact`), Q(s, "x", U(t).label.x), Q(s, "y", U(t).label.y), di(s, 0, ai(U(t).label.className)), Q(s, "data-id", U(t).id), J(c, U(t).label.text);
		}), q(e, n);
	});
	var i = V(r), a = (e) => {
		var n = ra();
		H(() => {
			Q(n, "d", t.ghost.d), di(n, 0, ai(t.ghost.className)), Q(n, "data-kind", t.ghost.kind);
		}), q(e, n);
	};
	Y(i, (e) => {
		t.ghost && e(a);
	}), q(e, n), Ue();
}
//#endregion
//#region ui/CommentFrame.svelte
var oa = /* @__PURE__ */ K("<span class=\"pc-comment-title svelte-118xm2r\"> </span>"), sa = /* @__PURE__ */ K("<input class=\"pc-comment-title-input svelte-118xm2r\" aria-label=\"Comment title\"/>"), ca = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-comment-resize svelte-118xm2r\" title=\"Drag to resize comment\"></button>"), la = /* @__PURE__ */ K("<div role=\"group\"><header class=\"pc-comment-header svelte-118xm2r\"><button type=\"button\" class=\"pc-comment-select svelte-118xm2r\" title=\"Drag header to move comment\">⋮⋮</button> <!></header> <div class=\"pc-comment-notes svelte-118xm2r\"> </div> <!></div>");
function ua(e, t) {
	He(t, !0);
	let n = (e) => e.stopPropagation();
	var r = la();
	let i, a;
	var o = z(r), s = z(o), c = V(s, 2), l = (e) => {
		var n = oa(), r = z(n, !0);
		F(n), H(() => J(r, t.comment.title)), q(e, n);
	}, u = (e) => {
		var r = sa();
		Z(r), H(() => Si(r, t.comment.title)), W("focus", r, () => t.actions.select(t.comment.id)), W("pointerdown", r, n, !0), W("mousedown", r, n, !0), W("click", r, n, !0), W("keydown", r, n, !0), G("change", r, (e) => {
			t.comment.readOnly || t.actions.update(t.comment.id, { title: e.currentTarget.value });
		}), q(e, r);
	};
	Y(c, (e) => {
		t.comment.readOnly ? e(l) : e(u, -1);
	}), F(o);
	var d = V(o, 2), f = z(d, !0);
	F(d);
	var p = V(d, 2), m = (e) => {
		var n = ca();
		H(() => Q(n, "aria-label", `Resize comment: ${t.comment.title}`)), G("click", n, (e) => {
			e.detail === 0 && t.actions.select(t.comment.id);
		}), q(e, n);
	};
	Y(p, (e) => {
		t.comment.readOnly || e(m);
	}), F(r), H(() => {
		i = di(r, 1, "pc-comment-frame svelte-118xm2r", null, i, {
			"pc-comment-selected": t.comment.selected,
			"pc-comment-readonly": t.comment.readOnly
		}), Q(r, "data-id", t.comment.id), Q(r, "aria-label", `Comment: ${t.comment.title}`), a = pi(r, "", a, {
			left: `${t.comment.x}px`,
			top: `${t.comment.y}px`,
			width: `${t.comment.w}px`,
			height: `${t.comment.h}px`,
			"--frame-color": t.comment.color
		}), Q(s, "aria-label", `Select comment: ${t.comment.title}`), J(f, t.comment.content);
	}), G("click", s, (e) => {
		e.detail === 0 && t.actions.select(t.comment.id);
	}), q(e, r), Ue();
}
Tr(["click", "change"]);
//#endregion
//#region ui/NodeProfilePicker.svelte
var da = /* @__PURE__ */ K("<div class=\"node-model-meta svelte-jdmiua\"> </div>"), fa = /* @__PURE__ */ Pr("<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-jdmiua\"><path d=\"m5 12 4 4L19 6\" class=\"svelte-jdmiua\"></path></svg>"), pa = /* @__PURE__ */ K("<button type=\"button\" role=\"option\"><span class=\"profile-option-copy svelte-jdmiua\"><span class=\"profile-name svelte-jdmiua\"> </span><span class=\"profile-meta svelte-jdmiua\"> </span></span><span class=\"profile-check svelte-jdmiua\"><!></span></button>"), ma = /* @__PURE__ */ K("<div class=\"profile-error svelte-jdmiua\" role=\"alert\"> </div>"), ha = /* @__PURE__ */ K("<div class=\"profile-menu svelte-jdmiua\"><div class=\"profile-search svelte-jdmiua\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-jdmiua\"><circle cx=\"10\" cy=\"10\" r=\"6\" class=\"svelte-jdmiua\"></circle><path d=\"m15 15 5 5\" class=\"svelte-jdmiua\"></path></svg><input role=\"combobox\" aria-label=\"Search connection profiles\" aria-autocomplete=\"list\" aria-expanded=\"true\" placeholder=\"Search connection profiles…\" autocomplete=\"off\" spellcheck=\"false\" maxlength=\"200\" class=\"svelte-jdmiua\"/></div> <div class=\"profile-options svelte-jdmiua\" role=\"listbox\" aria-label=\"Connection profiles\"></div> <!></div>"), ga = /* @__PURE__ */ K("<div class=\"pc-node-profile svelte-jdmiua\" role=\"group\" aria-label=\"Node connection profile\"><!> <div class=\"profile-picker svelte-jdmiua\"><button type=\"button\" class=\"profile-bar svelte-jdmiua\" aria-haspopup=\"listbox\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-jdmiua\"><path d=\"M12 22v-5M15 8V2M17 8a1 1 0 0 1 1 1v4a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1zM9 8V2\" class=\"svelte-jdmiua\"></path></svg><span class=\"profile-value svelte-jdmiua\"> </span><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-jdmiua\"><path d=\"m6 9 6 6 6-6\" class=\"svelte-jdmiua\"></path></svg></button> <!></div></div>");
function _a(e, t) {
	He(t, !0);
	let n = /* @__PURE__ */ L(!1), r = /* @__PURE__ */ L(""), i = /* @__PURE__ */ L(0), a = /* @__PURE__ */ L(""), o = /* @__PURE__ */ L(!1), s = -1, c = 0, l = !1, u = /* @__PURE__ */ L(35), d, f, p = /* @__PURE__ */ L(void 0), m = /* @__PURE__ */ L(void 0), h = (e) => e.stopPropagation();
	function g(e) {
		let t = (e) => {
			te(e);
		}, n = (t) => {
			t.detail !== e && A();
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
	let _ = /* @__PURE__ */ I(() => U(r).toLocaleLowerCase().trim().split(/\s+/).filter(Boolean)), v = /* @__PURE__ */ I(() => [...t.row.options.filter((e) => e.active), ...t.row.options.filter((e) => !e.active && U(_).every((t) => `${e.label} ${e.apiLabel} ${e.model}`.toLocaleLowerCase().includes(t)))]), y = /* @__PURE__ */ I(() => Math.max(1, Math.min(330, t.row.visibleBounds.w - 16))), b = /* @__PURE__ */ I(() => Math.max(t.row.visibleBounds.x + 8, Math.min(t.row.x, t.row.visibleBounds.x + t.row.visibleBounds.w - U(y) - 8)) - t.row.x), x = /* @__PURE__ */ I(() => t.row.h + t.row.clearance + 7), S = /* @__PURE__ */ I(() => t.row.visibleBounds.y + t.row.visibleBounds.h - (t.row.y + U(x) + U(u) + 6) - 8), C = /* @__PURE__ */ I(() => t.row.y + U(x) - t.row.visibleBounds.y - 14), w = /* @__PURE__ */ I(() => U(S) < 130 && U(C) > U(S)), T = /* @__PURE__ */ I(() => Math.max(U(C), U(S)) < 78), E = /* @__PURE__ */ I(() => Math.max(0, U(T) ? t.row.visibleBounds.h - 16 : U(w) ? U(C) : U(S))), D = /* @__PURE__ */ I(() => Math.max(0, Math.min(244, U(E) - 54))), O = /* @__PURE__ */ I(() => t.row.visibleBounds.y + 8 - t.row.y - U(x)), k = (e) => `${t.row.id}-profile-option-${e}`;
	function A(e = !1, t = !1) {
		t || (c++, l = !1), R(n, !1), R(r, ""), R(a, ""), R(o, !1), e && f?.focus({ preventScroll: !0 });
	}
	async function j() {
		if (!t.row.editable) return;
		let e = t.row.selection.selectionKey;
		if (await t.refreshProfiles?.(t.row.selection), !t.row.editable || !d?.isConnected || t.row.selection.selectionKey !== e) return;
		let c = f.getBoundingClientRect(), l = c.width > 0 && t.row.w > 0 ? c.width / t.row.w : 1;
		R(u, c.height > 0 ? c.height / l : 35, !0), window.dispatchEvent(new CustomEvent("pc-node-profile-open", { detail: d })), s = t.row.authorityVersion, R(r, ""), R(a, ""), R(o, !1), R(i, Math.max(0, U(v).findIndex((e) => e.value === t.row.value)), !0), R(n, !0), await pr(), U(n) && (U(p)?.focus({ preventScroll: !0 }), U(m) && (U(m).scrollTop = 0));
	}
	function M() {
		let e = U(v).find((e) => e.active);
		R(i, !U(_).length || e && U(_).every((t) => e.label.toLocaleLowerCase().includes(t)) ? 0 : U(v).length > 1 ? 1 : -1, !0), U(m) && (U(m).scrollTop = 0);
	}
	async function ee(e) {
		if (!U(n) || !t.row.editable || U(o) || t.row.authorityVersion !== s || !t.editProfile) return;
		let r = s, i = t.row.selection, u = c;
		R(o, !0), R(a, ""), l = !0;
		try {
			let o = await t.editProfile(i, e.value);
			if (o.ok) {
				c === u && d?.isConnected && t.row.selection.selectionKey === i.selectionKey && JSON.stringify(t.row.selection.address) === JSON.stringify(i.address) && (!U(n) || s === r) && A(!0);
				return;
			}
			if (!U(n) || t.row.authorityVersion !== r) return;
			R(a, o.error.message, !0);
		} catch (e) {
			U(n) && t.row.authorityVersion === r && R(a, e instanceof Error ? e.message : "Could not change connection profile", !0);
		} finally {
			t.row.authorityVersion === r && R(o, !1), c === u && (l = !1);
		}
	}
	async function te(e) {
		h(e), U(n) ? e.key === "Escape" ? (e.preventDefault(), A(!0)) : e.key === "ArrowDown" || e.key === "ArrowUp" ? (e.preventDefault(), R(i, Math.max(0, Math.min(U(v).length - 1, U(i) + (e.key === "ArrowDown" ? 1 : -1))), !0), await pr(), U(m)?.querySelector(".is-active")?.scrollIntoView?.({ block: "nearest" }), U(p)?.focus({ preventScroll: !0 })) : e.key === "Enter" && e.target === U(p) && (e.preventDefault(), U(v)[U(i)] && await ee(U(v)[U(i)])) : [
			"ArrowDown",
			"ArrowUp",
			"Enter",
			" "
		].includes(e.key) && (e.preventDefault(), await j());
	}
	function ne(e) {
		e.preventDefault(), h(e), U(m) && (U(m).scrollTop += e.deltaY * (e.deltaMode === 1 ? 18 : e.deltaMode === 2 ? U(m).clientHeight : 1));
	}
	Sn(() => {
		U(n) && (t.row.authorityVersion !== s || !t.row.editable) && A(!1, !0);
	});
	var re = ga();
	W("pointerdown", an, (e) => {
		(U(n) || l) && !d.contains(e.target) && A();
	});
	let ie;
	var ae = z(re), oe = (e) => {
		var n = da(), r = z(n, !0);
		F(n), H(() => {
			Q(n, "title", t.row.model), J(r, t.row.model);
		}), q(e, n);
	};
	Y(ae, (e) => {
		t.row.model && e(oe);
	});
	var se = V(ae, 2);
	let ce;
	var le = z(se), ue = V(z(le)), de = z(ue, !0);
	F(ue), je(), F(le), ji(le, (e) => f = e, () => f);
	var fe = V(le, 2), pe = (e) => {
		var n = ha();
		let s;
		var c = z(n), l = V(z(c));
		Z(l), ji(l, (e) => R(p, e), () => U(p)), F(c);
		var d = V(c, 2);
		let f;
		X(d, 23, () => U(v), (e) => e.value, (e, n, r) => {
			var a = pa();
			let s;
			var c = z(a), l = z(c), u = z(l, !0);
			F(l);
			var d = V(l), f = z(d, !0);
			F(d), F(c);
			var p = V(c), m = z(p), h = (e) => {
				q(e, fa());
			};
			Y(m, (e) => {
				U(n).value === t.row.value && e(h);
			}), F(p), F(a), H((e, c) => {
				Q(a, "id", e), s = di(a, 1, "profile-option svelte-jdmiua", null, s, { "is-active": U(r) === U(i) }), Q(a, "aria-selected", U(n).value === t.row.value), a.disabled = U(o), Q(l, "title", U(n).label), J(u, U(n).label), J(f, c);
			}, [() => k(U(r)), () => U(n).active ? "Follows SillyTavern’s current model" : [U(n).apiLabel, U(n).model].filter(Boolean).join(" · ")]), G("click", a, () => ee(U(n))), q(e, a);
		}), F(d), ji(d, (e) => R(m, e), () => U(m));
		var h = V(d, 2), g = (e) => {
			var t = ma(), n = z(t, !0);
			F(t), H(() => J(n, U(a))), q(e, t);
		};
		Y(h, (e) => {
			U(a) && e(g);
		}), F(n), H((e) => {
			s = pi(n, "", s, {
				width: `${U(y)}px`,
				"max-height": `${U(E)}px`,
				left: `${U(b)}px`,
				top: U(T) ? `${U(O)}px` : U(w) ? "auto" : `${U(u) + 6}px`,
				bottom: !U(T) && U(w) ? `${U(u) + 6}px` : "auto"
			}), Q(l, "aria-controls", `${t.row.id}-profile-list`), Q(l, "aria-activedescendant", e), Q(d, "id", `${t.row.id}-profile-list`), f = pi(d, "", f, { "max-height": `${U(D)}px` });
		}, [() => U(i) >= 0 && U(v).length ? k(U(i)) : void 0]), G("input", l, M), Di(l, () => U(r), (e) => R(r, e)), W("wheel", d, ne), q(e, n);
	};
	Y(fe, (e) => {
		U(n) && e(pe);
	}), F(se), F(re), ji(re, (e) => d = e, () => d), ni(re, (e) => g?.(e)), H(() => {
		Q(re, "data-id", t.row.id), ie = pi(re, "", ie, {
			left: `${t.row.x}px`,
			top: `${t.row.y}px`,
			width: `${t.row.w}px`,
			"z-index": U(n) ? 20 : 2
		}), ce = pi(se, "", ce, { top: `${U(x)}px` }), Q(le, "title", t.row.label), Q(le, "aria-label", `Connection profile: ${t.row.label}`), Q(le, "aria-expanded", U(n)), le.disabled = !t.row.editable, J(de, t.row.label);
	}), W("wheel", re, h), G("click", le, () => U(n) ? A() : j()), q(e, re), Ue();
}
Tr(["click", "input"]);
//#endregion
//#region ui/CanvasLayer.svelte
var va = /* @__PURE__ */ K("<div class=\"pc-viewport\" data-pc-renderer=\"svelte\"><div class=\"pc-comment-layer svelte-o7b704\"></div> <svg class=\"pc-wires\" aria-label=\"Canvas connections\"><!></svg> <div class=\"pc-nodes\"><!> <!> <!></div> <div class=\"pc-node-profile-layer svelte-o7b704\"></div></div>");
function ya(e, t) {
	He(t, !0);
	let n = /* @__PURE__ */ L([]), r = /* @__PURE__ */ L([]), i = /* @__PURE__ */ L([]), a = /* @__PURE__ */ L({}), o = /* @__PURE__ */ L([]), s = /* @__PURE__ */ L([]), c = /* @__PURE__ */ L({
		select() {},
		update() {},
		command() {}
	}), l = /* @__PURE__ */ L(null), u = /* @__PURE__ */ L({
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
		R(o, e), R(c, t);
	}
	function _(e) {
		R(a, e);
	}
	function v(e) {
		R(n, e);
	}
	function y(e) {
		R(s, e);
	}
	function b(e) {
		R(r, e);
	}
	function x(e, t, n) {
		R(i, e), R(u, t), R(l, n);
	}
	function S(e, t) {
		let i = new Map(e.map((e) => [e.id, e])), a = new Map(t.map((e) => [e.id, e]));
		R(n, U(n).map((e) => i.has(e.id) ? {
			...e,
			...i.get(e.id)
		} : e)), R(o, U(o).map((e) => i.has(e.id) ? {
			...e,
			...i.get(e.id)
		} : e)), R(r, U(r).map((e) => a.has(e.id) ? {
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
	}, w = va(), T = z(w);
	X(T, 21, () => U(o), (e) => e.id, (e, t) => {
		ua(e, {
			get comment() {
				return U(t);
			},
			get actions() {
				return U(c);
			}
		});
	}), F(T), ji(T, (e) => m = e, () => m);
	var E = V(T, 2);
	aa(z(E), {
		get wires() {
			return U(i);
		},
		get ghost() {
			return U(l);
		}
	}), F(E), ji(E, (e) => f = e, () => f);
	var D = V(E, 2), O = z(D);
	X(O, 17, () => U(r).filter((e) => !e.collapsed), (e) => e.id, (e, n) => {
		ta(e, {
			get group() {
				return U(n);
			},
			get actions() {
				return t.actions;
			}
		});
	});
	var k = V(O, 2);
	X(k, 17, () => U(n), (e) => e.id, (e, n) => {
		{
			let r = /* @__PURE__ */ I(() => ({
				...U(n),
				recall: U(a)[U(n).id]
			}));
			Qi(e, {
				get card() {
					return U(r);
				},
				get actions() {
					return t.actions;
				}
			});
		}
	}), X(V(k, 2), 17, () => U(r).filter((e) => e.collapsed), (e) => e.id, (e, n) => {
		ta(e, {
			get group() {
				return U(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), F(D), ji(D, (e) => p = e, () => p);
	var A = V(D, 2);
	return X(A, 21, () => U(s), (e) => e.id, (e, n) => {
		_a(e, {
			get row() {
				return U(n);
			},
			get editProfile() {
				return t.actions.editProfile;
			},
			get refreshProfiles() {
				return t.actions.refreshProfiles;
			}
		});
	}), F(A), F(w), ji(w, (e) => d = e, () => d), H(() => {
		Q(E, "width", U(u).w), Q(E, "height", U(u).h), Q(E, "viewBox", `0 0 ${U(u).w} ${U(u).h}`);
	}), q(e, w), Ue(C);
}
//#endregion
//#region ui/workspace-menu-model.ts
var $ = (e, t, n = "", r = !1, i = "") => ({
	label: e,
	command: t,
	icon: n,
	disabled: r,
	shortcut: i
}), ba = (e, t, n, r = !1, i = "check") => ({
	label: e,
	command: t,
	checked: n,
	disabled: r,
	kind: i
});
function xa(e, t = {
	previewOpen: !0,
	shelfOpen: !0
}) {
	let n = e.menuCapabilities ?? {}, r = e.rootWorkflow ?? e.workflow, i = e.outputPreview, a = !!e.readOnly, o = !!r?.ownedBusy, s = e.document, c = e.recall?.commands.selected, l = e.recall?.commands.all;
	return [
		{
			name: "File",
			groups: [
				[
					$("New workflow", "new", "add", !!s?.busy, "Ctrl N"),
					$("Open workflow…", "open-workflow", "open", !!s?.busy, "Ctrl O"),
					{
						...$("Open Recent", "recent-menu", "open", !s?.native || !s.recents.length || s.busy),
						children: [...(s?.recents ?? []).map((e) => $(e.name, "open-recent:" + e.id, "open")), {
							...$("Clear Recent", "clear-recent", "clear"),
							title: "Files stay on disk; only this recent list is cleared."
						}]
					},
					$("Open examples…", "examples", "library", !!s?.busy)
				],
				[{
					...$("Recover previous workflows", "recovery-menu", "library", !s?.recovery.length || s.busy),
					children: (s?.recovery ?? []).map((e) => ({
						...$(e.name, "recover-workflow:" + e.id, "open"),
						title: e.issue
					}))
				}],
				[...s?.native ? [$("Save workflow", "save", "save", s.busy, "Ctrl S"), $("Save As…", "save-as", "save", s.busy, "Ctrl Shift S")] : [$("Download JSON…", "download-document", "save", !!s?.busy, "Ctrl S")], $("Rename workflow…", "rename", "rename", !r)],
				[
					$("Import into graph…", "import-into-graph", "open", a),
					$("Export workflow JSON…", "export", "export", !r),
					...e.hasArchivedWorkflows ? [$("Export archived workflows", "export-archived-workflows", "export")] : []
				],
				[$("Close workspace", "close", "close")]
			]
		},
		{
			name: "Edit",
			groups: [
				[$("Undo", "undo", "undo", !e.history.undo, "Ctrl Z"), $("Redo", "redo", "redo", !e.history.redo, "Ctrl Shift Z")],
				[
					$("Cut", "cut", "cut", !e.selectionActions?.cut, "Ctrl X"),
					$("Copy", "copy", "copy", !e.selectionActions?.copy, "Ctrl C"),
					$("Paste", "paste", "paste", a, "Ctrl V"),
					$("Duplicate selection", "duplicate-selection", "duplicate", !n.duplicate, "Ctrl D"),
					{
						...$("Delete selection", "delete-selection", "delete", !e.selectionActions?.delete, "Del"),
						tone: "danger"
					}
				],
				[$("Select all", "select-all", "select", !1, "Ctrl A"), $("Clear selection", "clear-selection", "clear", !n.hasSelection)]
			]
		},
		{
			name: "View",
			groups: [
				[
					ba("Show Details", "inspector", !!e.inspectorOpen),
					ba("Show preview", "toggle-preview", t.previewOpen),
					ba("Show node shelf", "toggle-shelf", t.shelfOpen)
				],
				[ba("Follow selection", "follow-preview", i?.followSelection ?? !0, !i, "radio"), ba("Pin current output", "pin-preview", !!i?.pinned, !i?.selectedKey || i?.status === "removed", "radio")],
				[
					$("Fit graph", "fit", "fit"),
					$("Fit selection", "fit-selection", "fit", !n.fitSelection, "."),
					$("Center selection", "center-selection", "fit", !n.hasSelection, "F"),
					$("Zoom in", "zoom-in", "add"),
					$("Zoom out", "zoom-out", "minus")
				],
				[$("Reset panel layout", "reset-layout", "reset"), $("Theme and colours…", "theme", "theme")]
			]
		},
		{
			name: "Graph",
			groups: [
				[
					$("Add node…", "add-node", "add", a),
					$("Details for selection", "details-selection", "details", !n.inspect),
					$("Rename selection…", "rename-selection", "rename", !n.rename, "F2")
				],
				[
					$("Group selection", "group-selection", "group", !n.group, "Ctrl G"),
					$("Ungroup selection", "ungroup-selection", "ungroup", !n.ungroup, "Ctrl Shift G"),
					$("Create subgraph", "create-subgraph", "subgraph", !n.createSubgraph),
					$("Save subgraph…", "save-subgraph", "save", !n.saveSubgraph)
				],
				[
					$("Comment selection", "comment-selection", "comment", !n.comment, "C"),
					$("Add comment", "add-comment", "comment", a),
					$("Manage portals…", "manage-portals", "portals")
				],
				[
					ba("Select tool", "select-tool", e.camera?.mode !== "pan", !1, "radio"),
					ba("Pan tool", "pan-tool", e.camera?.mode === "pan", !1, "radio"),
					ba("Compact cards", "compact-selection", !!n.compactChecked, !n.compact)
				]
			]
		},
		{
			name: "Workflow",
			groups: [
				[ba("Enable Lattice", "enable-workflow", !!e.enabled, !r)],
				[
					$("Validate workflow", "validate-workflow", "check", !r),
					$("Review host result", "review-host-result", "details", !r?.nodes?.some((e) => e.terminal)),
					$("Stop workflow", "stop-workflow", "stop", !n.stop)
				],
				[$("Run to current output", "run-preview", "run", !i?.runHere?.enabled || !!i?.busy || o), $("Run details…", "run-details", "details", !e.runDetails)],
				[{
					label: "Configure",
					command: "configure",
					icon: "details",
					children: [$("Workflow Data…", "story-documents", "library")]
				}],
				[{
					label: "Memory recall",
					command: "memory-recall-menu",
					icon: "arm",
					children: [
						$("Queue recall for selected nodes", "recall-queue-selected", "add", !c?.queueNodeIds.length),
						$("Cancel recall for selected nodes", "recall-cancel-selected", "clear", !c?.cancelNodeIds.length),
						$("Queue recall for all eligible nodes", "recall-queue-all", "add", !l?.queueNodeIds.length),
						$("Cancel all queued recall", "recall-cancel-all", "clear", !l?.cancelNodeIds.length),
						$("Memory recall overview…", "memory-recall", "details")
					]
				}]
			]
		},
		{
			name: "Help",
			groups: [[
				$("Workspace guide", "help", "help"),
				$("Node reference", "node-reference", "library"),
				$("Keyboard shortcuts", "shortcuts", "keyboard")
			], [$("About Lattice", "about", "info")]]
		}
	];
}
var Sa = /* @__PURE__ */ new Set([
	"toggle-preview",
	"toggle-shelf",
	"reset-layout",
	"follow-preview",
	"pin-preview",
	"run-preview",
	"run-details",
	"validate-workflow",
	"help",
	"node-reference",
	"shortcuts",
	"about",
	"examples",
	"add-node",
	"story-documents",
	"memory-recall"
]), Ca = {
	details: "M10 5H3 M12 19H3 M14 3v4 M16 17v4 M21 12h-9 M21 19h-5 M21 5h-7 M8 10v4 M8 12H3",
	rename: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z M15 5l4 4",
	duplicate: "M13 13.74a2 2 0 0 1-2 0L2.5 8.87a1 1 0 0 1 0-1.74L11 2.26a2 2 0 0 1 2 0l8.5 4.87a1 1 0 0 1 0 1.74z M20 14.285l1.5.845a1 1 0 0 1 0 1.74L13 21.74a2 2 0 0 1-2 0l-8.5-4.87a1 1 0 0 1 0-1.74l1.5-.845",
	copy: "M10 8h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",
	cut: "M9 6a3 3 0 1 1-6 0a3 3 0 1 1 6 0z M8.12 8.12 12 12 M20 4 8.12 15.88 M9 18a3 3 0 1 1-6 0a3 3 0 1 1 6 0z M14.8 14.8 20 20",
	paste: "M9 4H5v17h14V4h-4 M9 2h6v5H9z M8 12h8 M8 16h5",
	comment: "M22 6H2 M22 18H2 M6 2v20 M18 2v20",
	subgraph: "M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z M7 16.5l-4.74-2.85 M7 16.5l5-3 M7 16.5v5.17 M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z M17 16.5l-5-3 M17 16.5l4.74-2.85 M17 16.5v5.17 M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z M12 8 7.26 5.15 M12 8l4.74-2.85 M12 13.5V8",
	open: "M3 7h7l2 3h9l-3 10H3V7z M3 7V4h7l2 3h7v3",
	save: "M4 3h13l3 3v15H4V3z M8 3v6h8V3 M8 21v-8h8v8",
	edit: "M4 17v3h3L20 7l-3-3L4 17z M14 7l3 3",
	library: "M3 4h4v16H3z M10 4h4v16h-4z M16 5l4-1 3 15-4 1-3-15z",
	export: "M12 15V3 M8 7l4-4 4 4 M4 12v8h16v-8",
	unpack: "M12 3l9 5-9 5-9-5 9-5z M3 8v9l9 5 9-5V8 M12 13v9 M8 3L4 1 M16 3l4-2",
	group: "M3 3h18v18H3z M7 7h4v4H7z M13 13h4v4h-4z",
	ungroup: "M3 8V3h5 M16 3h5v5 M21 16v5h-5 M8 21H3v-5 M7 7h4v4H7z M13 13h4v4h-4z",
	disconnect: "M9 15l6-6 M7 7L3 3 M17 17l4 4 M8 4h6a5 5 0 0 1 5 5v3 M16 20h-6a5 5 0 0 1-5-5v-3",
	portals: "M8 3a5 9 0 1 0 0 18 5 9 0 0 0 0-18z M16 3a5 9 0 1 0 0 18 5 9 0 0 0 0-18z M8 12h8 M13 9l3 3-3 3",
	add: "M12 4v16 M4 12h16",
	fit: "M15 12a3 3 0 1 1-6 0a3 3 0 1 1 6 0z M3 7V5a2 2 0 0 1 2-2h2 M17 3h2a2 2 0 0 1 2 2v2 M21 17v2a2 2 0 0 1-2 2h-2 M7 21H5a2 2 0 0 1-2-2v-2",
	compact: "M14 10l7-7 M20 10h-6V4 M3 21l7-7 M4 14h6v6",
	run: "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",
	pin: "M12 17v5 M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z",
	delete: "M10 11v6 M14 11v6 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M3 6h18 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
	undo: "M3 10h6 M3 10V4 M3 10a8 8 0 1 1 0 6",
	redo: "M21 10h-6 M21 10V4 M21 10a8 8 0 1 0 0 6",
	close: "M6 6l12 12 M6 18 18 6",
	minus: "M4 12h16",
	select: "M5 3l15 10-8 1-4 7-3-18z",
	clear: "M5 5l14 14 M5 19 19 5",
	reset: "M3 10h6 M3 10V4 M3 10a9 9 0 1 1 0 6",
	theme: "M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h5a3 3 0 0 0 3-3 9 9 0 0 0-9-7z",
	assign: "M3 12h14 M12 7l5 5-5 5 M21 4v16",
	check: "M4 12l5 5L20 6",
	stop: "M5 5h14v14H5z",
	connect: "M7 8h10 M7 16h10 M3 4h4v8H3z M17 12h4v8h-4z",
	arm: "M12 3v9 M6 5a9 9 0 1 0 12 0",
	help: "M9 8a3 3 0 1 1 5 2c-2 1-2 2-2 3 M12 17v1 M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z",
	keyboard: "M2 5h20v14H2z M6 9h1 M11 9h1 M16 9h1 M6 13h1 M11 13h1 M16 13h1 M7 16h10",
	info: "M12 11v6 M12 7v1 M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"
}, wa = /* @__PURE__ */ Pr("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" focusable=\"false\"><path></path></svg>"), Ta = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-workspace-menu-item\" tabindex=\"-1\"><span class=\"pc-workspace-menu-icon\" aria-hidden=\"true\"><!></span> <span class=\"pc-workspace-menu-state\" aria-hidden=\"true\"> </span> <span class=\"pc-workspace-menu-label\"> </span> <kbd aria-hidden=\"true\"> </kbd> <span class=\"pc-workspace-menu-caret\" aria-hidden=\"true\"> </span></button>"), Ea = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\" class=\"pc-flat-menu\" aria-haspopup=\"menu\"> </button>"), Da = /* @__PURE__ */ K("<div class=\"pc-workspace-menu-separator\" role=\"separator\"></div>"), Oa = /* @__PURE__ */ K("<!> <!>", 1), ka = /* @__PURE__ */ K("<div id=\"pc-workspace-submenu\" class=\"pc-workspace-menu-panel pc-workspace-submenu\" role=\"menu\" tabindex=\"-1\"><!></div>"), Aa = /* @__PURE__ */ K("<div id=\"pc-workspace-menu\" class=\"pc-workspace-menu-panel\" role=\"menu\" tabindex=\"-1\"></div> <!>", 1), ja = /* @__PURE__ */ K("<div class=\"pc-workspace-menus\" role=\"menubar\" tabindex=\"-1\" aria-label=\"Workspace menus\"><!> <!></div>");
function Ma(e, t) {
	He(t, !0);
	let n = (e, t = d, n = d) => {
		var r = Ir();
		X(B(r), 17, t, Kr, (e, t) => {
			var r = Ta(), i = z(r), a = z(i), o = (e) => {
				var n = wa(), r = z(n);
				F(n), H(() => Q(r, "d", Ca[U(t).icon])), q(e, n);
			};
			Y(a, (e) => {
				U(t).icon && Ca[U(t).icon] && e(o);
			}), F(i);
			var s = V(i, 2), c = z(s, !0);
			F(s);
			var l = V(s, 2), u = z(l, !0);
			F(l);
			var d = V(l, 2), p = z(d, !0);
			F(d);
			var m = V(d, 2), h = z(m, !0);
			F(m), F(r), H(() => {
				Q(r, "role", U(t).kind === "radio" ? "menuitemradio" : U(t).kind === "check" ? "menuitemcheckbox" : "menuitem"), Q(r, "title", U(t).title), Q(r, "aria-label", U(t).label), Q(r, "aria-disabled", !!U(t).disabled), Q(r, "aria-checked", U(t).kind ? !!U(t).checked : void 0), Q(r, "aria-haspopup", U(t).children ? "menu" : void 0), Q(r, "aria-expanded", U(t).children ? U(f) === U(t) : void 0), Q(r, "aria-controls", U(t).children && U(f) === U(t) ? "pc-workspace-submenu" : void 0), Q(r, "data-command", U(t).command), Q(r, "data-tone", U(t).tone), r.disabled = U(t).disabled, J(c, U(t).checked ? U(t).kind === "radio" ? "●" : "✓" : ""), J(u, U(t).label), J(p, U(t).shortcut ?? ""), J(h, U(t).children ? "›" : "");
			}), G("click", r, (e) => O(U(t), e.currentTarget)), W("pointerenter", r, (e) => {
				n() || (U(t).children ? D(U(t), e.currentTarget) : R(f, null));
			}), q(e, r);
		}), q(e, r);
	}, r = /* @__PURE__ */ I(() => xa(t.state, t.panels)), i = /* @__PURE__ */ L(""), a = /* @__PURE__ */ L(0), o, s = /* @__PURE__ */ L(null), c = /* @__PURE__ */ L(null), l = null, u = null, f = /* @__PURE__ */ L(null), p = /* @__PURE__ */ L(0), m = /* @__PURE__ */ L(0), h = /* @__PURE__ */ L(0), g = /* @__PURE__ */ L(0), _ = 0, v = "", y = "", b = 0, x = {}, S = /* @__PURE__ */ I(() => `${t.state.menuContextKey ?? ""}:${t.state.graphId}:${t.state.graphViews?.active.key ?? ""}:${t.state.graphViews?.viewEpoch ?? ""}`);
	Sn(() => {
		U(i) && v !== U(S) && w();
	});
	let C = (e) => e ? [...e.querySelectorAll("button:not(:disabled)")] : [];
	function w(e = !1) {
		_++, R(i, ""), R(f, null), y = "", e && l?.isConnected && l.focus({ preventScroll: !0 });
	}
	function T(e, t, n = !1) {
		let r = e.getBoundingClientRect(), i = window.innerWidth, a = window.innerHeight, o = n ? t.right - 1 : t.left, s = n ? t.top : t.bottom + 2;
		return n && o + r.width > i - 4 && (o = t.left - r.width + 1, o < 4 && (o = t.left, s = t.bottom + r.height <= a - 4 ? t.bottom : t.top - r.height)), {
			x: Math.max(4, Math.min(o, i - r.width - 4)),
			y: Math.max(4, Math.min(s, a - r.height - 4))
		};
	}
	async function E(e, n, o = "first", c = !1) {
		if (U(i) === e && c) {
			w(!0);
			return;
		}
		t.actions.resizeStart?.(), R(i, e, !0), R(f, null), l = n, R(a, U(r).findIndex((t) => t.name === e), !0), v = U(S), y = "";
		let u = ++_;
		if (await pr(), u !== _ || !U(s)) return;
		let d = T(U(s), n.getBoundingClientRect());
		R(p, d.x, !0), R(m, d.y, !0), o && (o === "last" ? C(U(s)).at(-1) : C(U(s))[0])?.focus();
	}
	async function D(e, n, r = !1) {
		if (e.disabled || !e.children || !U(i)) return;
		e.command === "memory-recall-menu" && t.actions.recall?.refresh(), R(f, e), u = n, y = "";
		let a = _;
		if (await pr(), a !== _ || !U(c) || U(f) !== e) return;
		if (e.command === "memory-recall-menu") {
			let e = t.actions.recall?.capture(t.state.recall?.commands.selected.relevantNodeIds ?? []), n = t.actions.recall?.capture(t.state.recall?.commands.all.relevantNodeIds ?? [], "all"), r = () => ({
				ok: !1,
				error: {
					code: "RECALL_UNAVAILABLE",
					message: "Memory recall is unavailable."
				}
			});
			x = {
				"recall-queue-selected": () => e?.queue() ?? r(),
				"recall-cancel-selected": () => e?.cancel() ?? r(),
				"recall-queue-all": () => n?.queue() ?? r(),
				"recall-cancel-all": () => n?.cancel() ?? r()
			};
		}
		let o = T(U(c), n.getBoundingClientRect(), !0);
		R(h, o.x, !0), R(g, o.y, !0), r && C(U(c))[0]?.focus();
	}
	function O(e, n) {
		if (e.disabled || v !== U(S)) return;
		if (e.children) {
			D(e, n, !0);
			return;
		}
		let r = e.command;
		w(!0);
		let i = x[r];
		i ? Promise.resolve(i()).then((e) => {
			e.ok || (t.actions.recall?.reportIssue(e.error.message), t.actions.recall?.refresh());
		}) : Sa.has(r) ? t.local(r) : r === "enable-workflow" ? t.actions.setEnabled(!t.state.enabled) : r === "select-tool" || r === "pan-tool" ? t.actions.mode(r === "select-tool" ? "select" : "pan") : r === "zoom-in" || r === "zoom-out" ? t.actions.zoom(r === "zoom-in" ? 1.15 : 1 / 1.15) : r === "fit-selection" ? t.actions.fitSelection() : t.actions.command(r);
	}
	function k(e) {
		return o.querySelector(`[data-menu="${U(r)[e].name}"]`);
	}
	function A(e) {
		if (!U(i) && (e.ctrlKey || e.metaKey)) return;
		e.stopPropagation();
		let t = e.target, n = t.hasAttribute("data-menu");
		if (e.key === "Tab") {
			U(i) && w(!0);
			return;
		}
		if (e.key === "Escape") {
			U(i) && (e.preventDefault(), U(f) && t.closest("[role=\"menu\"]") === U(c) ? (R(f, null), u?.focus({ preventScroll: !0 })) : w(!0));
			return;
		}
		let o = t.closest("[role=\"menu\"]") ?? U(s), l = o === U(c) && !!U(f), d = C(o), p = d.indexOf(t);
		if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
			if (e.preventDefault(), l) {
				e.key === "ArrowLeft" && (R(f, null), u?.focus());
				return;
			}
			if (!n && e.key === "ArrowRight") {
				let e = U(r).find((e) => e.name === U(i))?.groups.flat().find((e) => e.command === t.dataset.command);
				if (e?.children) {
					D(e, t, !0);
					return;
				}
			}
			let o = (U(a) + (e.key === "ArrowRight" ? 1 : U(r).length - 1)) % U(r).length;
			R(a, o), U(i) ? E(U(r)[o].name, k(o)) : k(o).focus();
		} else if ([
			"ArrowDown",
			"ArrowUp",
			"Home",
			"End"
		].includes(e.key)) e.preventDefault(), n ? e.key === "Home" || e.key === "End" ? (R(a, e.key === "Home" ? 0 : U(r).length - 1, !0), k(U(a)).focus()) : E(t.dataset.menu, t, e.key === "ArrowUp" ? "last" : "first") : (l || R(f, null), d[e.key === "Home" ? 0 : e.key === "End" ? d.length - 1 : (p + (e.key === "ArrowUp" ? d.length - 1 : 1)) % d.length]?.focus());
		else if (e.key === "Enter" || e.key === " ") e.preventDefault(), t.click();
		else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
			e.preventDefault();
			let t = Date.now();
			y = (t - b > 700 ? "" : y) + e.key.toLowerCase(), b = t;
			let o = y.split("").every((e) => e === y[0]) ? y[0] : y;
			if (n && !U(i)) {
				let e = U(r).findIndex((e, t) => U(r)[(U(a) + t + 1) % U(r).length].name.toLowerCase().startsWith(o));
				e >= 0 && (R(a, (U(a) + e + 1) % U(r).length), k(U(a)).focus());
			} else [...d.slice(p + 1), ...d.slice(0, p + 1)].find((e) => e.getAttribute("aria-label")?.toLowerCase().startsWith(o))?.focus();
		}
	}
	function j(e) {
		U(i) && o?.contains(e.target) && e.stopPropagation();
	}
	var M = ja();
	W("pointerdown", rn, (e) => {
		U(i) && !o.contains(e.target) && w();
	}), W("resize", rn, () => w()), W("keyup", rn, j, !0);
	var ee = z(M);
	X(ee, 17, () => U(r), Kr, (e, t, n) => {
		var r = Ea(), o = z(r, !0);
		F(r), H(() => {
			Q(r, "data-menu", U(t).name), Q(r, "tabindex", U(a) === n ? 0 : -1), Q(r, "aria-expanded", U(i) === U(t).name), Q(r, "aria-controls", U(i) === U(t).name ? "pc-workspace-menu" : void 0), J(o, U(t).name);
		}), W("focus", r, () => R(a, n, !0)), G("click", r, (e) => E(U(t).name, e.currentTarget, "first", !0)), W("pointerenter", r, (e) => {
			U(i) && U(i) !== U(t).name && E(U(t).name, e.currentTarget);
		}), q(e, r);
	});
	var te = V(ee, 2), ne = (e) => {
		var t = Aa(), a = B(t);
		let o;
		X(a, 21, () => U(r).find((e) => e.name === U(i))?.groups ?? [], Kr, (e, t, r) => {
			var i = Oa(), a = B(i), o = (e) => {
				q(e, Da());
			};
			Y(a, (e) => {
				r && e(o);
			});
			var s = V(a, 2);
			n(s, () => U(t), () => !1), q(e, i);
		}), F(a), ji(a, (e) => R(s, e), () => U(s));
		var l = V(a, 2), u = (e) => {
			var t = ka();
			let r;
			var i = z(t);
			n(i, () => U(f).children, () => !0), F(t), ji(t, (e) => R(c, e), () => U(c)), H(() => {
				Q(t, "aria-label", `${U(f).label} options`), r = pi(t, "", r, {
					left: `${U(h)}px`,
					top: `${U(g)}px`
				});
			}), q(e, t);
		};
		Y(l, (e) => {
			U(f)?.children && e(u);
		}), H(() => {
			Q(a, "aria-label", U(i)), o = pi(a, "", o, {
				left: `${U(p)}px`,
				top: `${U(m)}px`
			});
		}), q(e, t);
	};
	Y(te, (e) => {
		U(i) && e(ne);
	}), F(M), ji(M, (e) => o = e, () => o), G("keydown", M, A), G("keyup", M, j), W("paste", M, j), G("pointerdown", M, j), q(e, M), Ue();
}
Tr([
	"click",
	"keydown",
	"keyup",
	"pointerdown"
]);
//#endregion
//#region ui/Toolbar.svelte
var Na = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-btn menu_button pc-root-stop\" title=\"Stop the workflow\">■ Stop</button>"), Pa = /* @__PURE__ */ K("<header class=\"pc-header\" data-pc-ui=\"svelte\"><div class=\"pc-menubar\"><div class=\"pc-brand\"><img width=\"30\" height=\"30\" alt=\"\"/><span>LATTICE</span></div> <!> <button type=\"button\" class=\"pc-btn menu_button pc-close\" title=\"Close\" aria-label=\"Close canvas\">×</button></div> <div class=\"pc-workflow-bar\"><div class=\"pc-document-heading\"><strong class=\"pc-document-name\"> </strong><span class=\"pc-document-status\" role=\"status\" aria-label=\"Document status\"> <!><!></span></div> <div class=\"pc-header-actions pc-history\"><button type=\"button\" aria-label=\"Undo\">↶</button> <button type=\"button\" aria-label=\"Redo\">↷</button> <span> </span></div> <!> <span class=\"pc-root-workflow-status\" role=\"status\" aria-label=\"Workflow status\"> </span> <div class=\"pc-header-actions pc-surface-actions\"><button type=\"button\" title=\"Show or hide the inspector\" aria-label=\"Toggle inspector\">Details</button></div> <label class=\"pc-enable\"><input class=\"pc-enable-input\" type=\"checkbox\"/><span>Enable Lattice</span></label></div></header>");
function Fa(e, t) {
	He(t, !0);
	let n = /* @__PURE__ */ I(() => t.state.rootWorkflow ?? t.state.workflow), r = /* @__PURE__ */ I(() => t.state.document?.dirty ? "Modified" : t.state.document?.busy || t.state.document?.status ? "" : t.state.document ? "Saved" : "Unsaved"), i, a, o;
	function s() {
		return {
			header: i,
			enabledControl: a,
			inspBtn: o
		};
	}
	var c = { getParts: s }, l = Pa(), u = z(l), d = z(u), f = z(d);
	je(), F(d);
	var p = V(d, 2);
	Ma(p, {
		get state() {
			return t.state;
		},
		get actions() {
			return t.actions;
		},
		get local() {
			return t.local;
		},
		get panels() {
			return t.panels;
		}
	});
	var m = V(p, 2);
	F(u);
	var h = V(u, 2), g = z(h), _ = z(g), v = z(_, !0);
	F(_);
	var y = V(_), b = z(y, !0), x = V(b), S = (e) => {
		var t = Fr();
		H(() => J(t, `${U(r) ? " · " : ""}Working…`)), q(e, t);
	};
	Y(x, (e) => {
		t.state.document?.busy && e(S);
	});
	var C = V(x), w = (e) => {
		var n = Fr();
		H(() => J(n, `${U(r) || t.state.document.busy ? " · " : ""}${t.state.document.status ?? ""}`)), q(e, n);
	};
	Y(C, (e) => {
		t.state.document?.status && t.state.document.status !== U(r) && e(w);
	}), F(y), F(g);
	var T = V(g, 2), E = z(T), D = V(E, 2), O = V(D, 2), k = z(O, !0);
	F(O), F(T);
	var A = V(T, 2), j = (e) => {
		var n = Na();
		G("click", n, () => t.actions.command("stop-workflow")), q(e, n);
	};
	Y(A, (e) => {
		(U(n)?.ownedBusy || U(n)?.busy) && e(j);
	});
	var M = V(A, 2), ee = z(M, !0);
	F(M);
	var te = V(M, 2), ne = z(te);
	ji(ne, (e) => o = e, () => o), F(te);
	var re = V(te, 2), ie = z(re);
	return Z(ie), ji(ie, (e) => a = e, () => a), je(), F(re), F(h), F(l), ji(l, (e) => i = e, () => i), H(() => {
		Q(f, "src", t.actions.logoUrl), Q(_, "title", t.state.document?.name ?? "Untitled"), J(v, t.state.document?.name ?? "Untitled"), J(b, U(r)), di(E, 1, `pc-btn menu_button pc-undo${t.state.history.undo ? "" : " pc-disabled"}`), E.disabled = !t.state.history.undo, Q(E, "title", t.state.history.undoTitle), di(D, 1, `pc-btn menu_button pc-redo${t.state.history.redo ? "" : " pc-disabled"}`), D.disabled = !t.state.history.redo, Q(D, "title", t.state.history.redoTitle), di(O, 1, `pc-history-note${t.state.history.showNote ? " pc-show" : ""}`), J(k, t.state.history.note), J(ee, U(n) ? `${U(n).phase} · ≤ ${U(n).callBound} requests${U(n).status ? " · " + U(n).status : ""}` : "Workflow unavailable"), di(ne, 1, `pc-btn menu_button pc-pane-toggle${t.state.inspectorOpen ? " pc-on" : ""}`), Q(ne, "aria-pressed", t.state.inspectorOpen), Ci(ie, t.state.enabled);
	}), G("click", m, () => t.actions.command("close")), G("click", E, () => t.actions.command("undo")), G("click", D, () => t.actions.command("redo")), G("click", ne, () => t.actions.command("inspector")), G("change", ie, (e) => t.actions.setEnabled(e.currentTarget.checked)), q(e, l), Ue(c);
}
Tr(["click", "change"]);
//#endregion
//#region ui/PaneDivider.svelte
var Ia = /* @__PURE__ */ K("<div class=\"pc-pane-divider\" role=\"separator\" aria-label=\"Resize preview\" aria-orientation=\"horizontal\" tabindex=\"0\"></div>");
function La(e, t) {
	He(t, !0);
	let n = Mi(t, "min", 3, 90), r = Mi(t, "max", 3, 500), i, a = null, o = (e) => Math.max(n(), Math.min(r(), e));
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
	Pi(u);
	var f = Ia();
	W("blur", rn, u), ji(f, (e) => i = e, () => i), H((e, t) => {
		Q(f, "aria-valuemin", n()), Q(f, "aria-valuemax", e), Q(f, "aria-valuenow", t);
	}, [() => Math.round(r()), () => Math.round(t.height)]), G("pointerdown", f, s), G("pointermove", f, c), G("pointerup", f, (e) => l(!1, e.pointerId)), W("pointercancel", f, (e) => l(!0, e.pointerId)), W("lostpointercapture", f, (e) => l(!0, e.pointerId)), G("keydown", f, d), q(e, f), Ue();
}
Tr([
	"pointerdown",
	"pointermove",
	"pointerup",
	"keydown"
]);
//#endregion
//#region ui/DetailsDivider.svelte
var Ra = /* @__PURE__ */ K("<div class=\"pc-details-divider svelte-1iyzcro\" role=\"separator\" aria-label=\"Resize Details\" aria-orientation=\"vertical\" tabindex=\"0\"></div>");
function za(e, t) {
	He(t, !0);
	let n = Mi(t, "min", 3, 220), r = Mi(t, "max", 3, 520), i, a = null, o = (e) => Math.max(n(), Math.min(r(), e));
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
	Pi(c);
	var f = Ra();
	W("blur", rn, c), ji(f, (e) => i = e, () => i), H((e, t) => {
		Q(f, "aria-valuemin", n()), Q(f, "aria-valuemax", e), Q(f, "aria-valuenow", t);
	}, [() => Math.round(r()), () => Math.round(t.width)]), G("pointerdown", f, l), G("pointermove", f, u), G("pointerup", f, (e) => s(!1, e.pointerId)), W("pointercancel", f, (e) => s(!0, e.pointerId)), W("lostpointercapture", f, (e) => s(!0, e.pointerId)), G("keydown", f, d), q(e, f), Ue();
}
Tr([
	"pointerdown",
	"pointermove",
	"pointerup",
	"keydown"
]);
//#endregion
//#region ui/GraphTabs.svelte
var Ba = /* @__PURE__ */ K("<span class=\"pc-graph-tab-lock svelte-7ptwed\" aria-label=\"Read only\">◇</span>"), Va = /* @__PURE__ */ K("<input type=\"text\" title=\"Enter to save, Escape to cancel\"/>"), Ha = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-graph-tab-close svelte-7ptwed\">×</button>"), Ua = /* @__PURE__ */ K("<div><button type=\"button\" role=\"tab\" aria-haspopup=\"menu\"><span class=\"svelte-7ptwed\"> </span><!></button> <!> <!></div>"), Wa = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button>"), Ga = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close tab</button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close other tabs</button> <!>", 1), Ka = /* @__PURE__ */ K("<!> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close active view</button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close other views</button> <!>", 1), qa = /* @__PURE__ */ K("<div role=\"menu\" tabindex=\"-1\"><!></div>"), Ja = /* @__PURE__ */ K("<nav aria-label=\"Open graph views\"><div class=\"pc-graph-tab-list svelte-7ptwed\" role=\"tablist\" aria-label=\"Graph views\"></div> <button type=\"button\" class=\"pc-graph-view-overflow svelte-7ptwed\" aria-label=\"Graph view actions\" title=\"Focus, close or reopen graph views\" aria-haspopup=\"menu\">⋯</button> <!></nav>");
function Ya(e, t) {
	He(t, !0);
	let n = Mi(t, "actions", 19, () => ({})), r = Mi(t, "idPrefix", 3, "pc-graph-view"), i = /* @__PURE__ */ L(null), a = /* @__PURE__ */ L(null), o = /* @__PURE__ */ L(null), s = /* @__PURE__ */ L(!1), c = /* @__PURE__ */ L(""), l = /* @__PURE__ */ L(""), u = /* @__PURE__ */ L(0), d = /* @__PURE__ */ L(0), f = "", p = /* @__PURE__ */ L(""), m = /* @__PURE__ */ L(""), h = /* @__PURE__ */ L(null), g = "", _ = null, v = 0, y = /* @__PURE__ */ I(() => t.views?.tabs.find((e) => e.key === U(l))), b = {};
	Sn(() => {
		let e = t.views?.active.key ?? "";
		f === e ? t.views && !t.views.tabs.some((e) => e.key === U(c)) && R(c, e, !0) : (R(c, e, !0), O(), R(p, "")), U(l) && !U(y) && O(), U(p) && (t.views?.workflowId !== g || !t.views.tabs.some((e) => e.key === U(p))) && R(p, ""), f = e;
	});
	async function x(e) {
		let r = t.views?.tabs.find((t) => t.key === e);
		if (!r || r.identity.kind === "library" || !n().renameView || n().canRenameView?.(e) === !1) return;
		let i = ++v;
		_ = null, O(), g = t.views.workflowId, R(m, r.label, !0), R(p, e, !0), await pr(), U(p) === e && v === i && (_ = U(h), U(h)?.focus({ preventScroll: !0 }), U(h)?.select());
	}
	async function S(e, r, i = !0) {
		let a = U(p), o = t.views?.tabs.find((e) => e.key === a), s = U(m).trim();
		a && e === _ && (R(p, ""), _ = null, r && o && s && s !== o.label && t.views?.workflowId === g && o.identity.kind !== "library" && n().canRenameView?.(a) !== !1 && n().renameView?.(a, s), i && (await pr(), b[a]?.focus({ preventScroll: !0 })));
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
		n().closeView?.(e.key), await pr();
		let r = t.views?.active.key;
		r && t.views?.tabs.some((e) => e.key === r) && (R(c, r, !0), b[r]?.focus({ preventScroll: !0 }));
	}
	function O(e = !1) {
		let t = U(l) ? b[U(l)] : U(o);
		R(s, !1), R(l, ""), e && t?.focus({ preventScroll: !0 });
	}
	function k(e, t) {
		e.preventDefault(), e.stopPropagation(), A(t, e.clientX, e.clientY);
	}
	async function A(e, t, n) {
		if (R(l, e.key, !0), R(u, t, !0), R(d, n, !0), R(s, !0), await pr(), !U(s) || U(l) !== e.key) return;
		let r = U(a)?.getBoundingClientRect();
		R(u, Math.min(Math.max(8, t), Math.max(8, window.innerWidth - (r?.width ?? 0) - 8)), !0), R(d, Math.min(Math.max(8, n), Math.max(8, window.innerHeight - (r?.height ?? 0) - 8)), !0), U(a)?.querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
	}
	async function j() {
		let e = !!U(l);
		R(l, ""), R(s, e || !U(s), !0), U(s) && (await pr(), U(s) && U(a)?.querySelector("button:not(:disabled)")?.focus());
	}
	function M(e) {
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
		let t = [...U(a).querySelectorAll("button:not(:disabled)")], n = t.indexOf(e.target);
		t[e.key === "Home" ? 0 : e.key === "End" ? t.length - 1 : (n + (e.key === "ArrowUp" ? t.length - 1 : 1)) % t.length]?.focus();
	}
	function ee(e) {
		O(!0), e();
	}
	function te(e) {
		let t = U(y);
		t && (O(!0), e(t));
	}
	var ne = { startRename: x }, re = Ir();
	W("pointerdown", rn, (e) => {
		U(s) && !U(a)?.contains(e.target) && e.target !== U(o) && O();
	}), W("resize", rn, () => O());
	var ie = B(re), ae = (e) => {
		var f = Ja();
		let g;
		var _ = z(f);
		X(_, 23, () => t.views.tabs, (e) => e.key, (e, n, i) => {
			var a = Ua();
			let o;
			var u = z(a);
			let d;
			var f = z(u), g = z(f, !0);
			F(f);
			var _ = V(f), v = (e) => {
				q(e, Ba());
			};
			Y(_, (e) => {
				U(n).readOnly && e(v);
			}), F(u), ji(u, (e, t) => b[t.key] = e, (e) => b?.[e.key], () => [U(n)]);
			var y = V(u, 2), x = (e) => {
				var t = Va();
				Z(t);
				let r;
				ji(t, (e) => R(h, e), () => U(h)), H(() => {
					r = di(t, 1, "pc-graph-tab-rename svelte-7ptwed", null, r, { "pc-graph-tab-closeable": U(n).identity.kind !== "root" }), Q(t, "aria-label", U(n).identity.kind === "root" ? "Graph name" : "Subgraph name"), Q(t, "maxlength", U(n).identity.kind === "instance" ? 80 : void 0);
				}), G("keydown", t, C), W("blur", t, (e) => S(e.currentTarget, !0, !1)), Di(t, () => U(m), (e) => R(m, e)), q(e, t);
			};
			Y(y, (e) => {
				U(p) === U(n).key && e(x);
			});
			var O = V(y, 2), A = (e) => {
				var r = Ha();
				H((e, i) => {
					Q(r, "aria-label", e), Q(r, "title", i), Q(r, "tabindex", U(n).key === (U(c) || t.views.active.key) ? 0 : -1);
				}, [() => `Close ${U(n).label} · ${w(U(n))}`, () => `Close ${w(U(n))}`]), G("click", r, () => D(U(n))), G("contextmenu", r, (e) => k(e, U(n))), G("keydown", r, (e) => E(e, U(i))), q(e, r);
			};
			Y(O, (e) => {
				U(n).identity.kind !== "root" && e(A);
			}), F(a), H((e) => {
				o = di(a, 1, "pc-graph-tab-item svelte-7ptwed", null, o, {
					"pc-graph-tab-active": U(n).key === t.views.active.key,
					"pc-graph-tab-editing": U(p) === U(n).key
				}), d = di(u, 1, "pc-graph-tab svelte-7ptwed", null, d, { "pc-graph-tab-closeable": U(n).identity.kind !== "root" }), Q(u, "id", `${r()}-${U(i)}`), Q(u, "aria-controls", t.panelId), Q(u, "aria-selected", U(n).key === t.views.active.key), Q(u, "aria-expanded", U(s) && U(l) === U(n).key), Q(u, "tabindex", U(p) !== U(n).key && U(n).key === (U(c) || t.views.active.key) ? 0 : -1), Q(u, "title", e), J(g, U(n).label);
			}, [() => w(U(n))]), G("click", u, () => T(U(n).key)), G("pointerdown", u, (e) => {
				e.button === 2 && e.preventDefault();
			}), G("contextmenu", u, (e) => k(e, U(n))), G("keydown", u, (e) => E(e, U(i))), q(e, a);
		}), F(_);
		var v = V(_, 2);
		ji(v, (e) => R(o, e), () => U(o));
		var O = V(v, 2), A = (e) => {
			var r = qa();
			let i;
			var o = z(r), s = (e) => {
				let r = /* @__PURE__ */ I(() => U(y)), i = /* @__PURE__ */ I(() => n().canRenameView?.(U(r).key) === !1);
				var a = Ga(), o = B(a), s = z(o, !0);
				F(o);
				var c = V(o, 2), l = z(c, !0);
				F(c);
				var u = V(c, 2), d = V(u, 2);
				X(V(d, 2), 17, () => t.views.closedViews, (e) => e.key, (e, t) => {
					var r = Wa(), i = z(r);
					F(r), H((e, a) => {
						r.disabled = !n().reopenView, Q(r, "title", e), J(i, `Reopen ${U(t).label ?? ""} · ${a ?? ""}`);
					}, [() => w(U(t)), () => w(U(t))]), G("click", r, () => ee(() => n().reopenView?.(U(t).key))), q(e, r);
				}), H((e) => {
					o.disabled = !n().exportView, J(s, U(r).identity.kind === "root" ? "Export workflow JSON" : "Export subgraph JSON"), c.disabled = U(r).identity.kind === "library" || U(i) || !n().renameView, Q(c, "title", U(r).identity.kind === "library" ? "Library inspection is read only." : U(i) ? "Make a local copy of the containing graph to rename this subgraph." : void 0), J(l, U(r).identity.kind === "root" ? "Rename graph" : "Rename subgraph"), u.disabled = U(r).identity.kind === "root" || !n().closeView, d.disabled = e;
				}, [() => t.views.tabs.every((e) => e.identity.kind === "root" || e.key === U(r).key) || !n().closeOtherViews]), G("click", o, () => te((e) => n().exportView?.(e.key))), G("click", c, () => te((e) => x(e.key))), G("click", u, () => te((e) => D(e))), G("click", d, () => te((e) => n().closeOtherViews?.(e.key))), q(e, a);
			}, c = (e) => {
				var r = Ka(), i = B(r);
				X(i, 17, () => t.views.tabs, (e) => e.key, (e, t) => {
					var n = Wa(), r = z(n);
					F(n), H((e, t) => {
						Q(n, "title", e), J(r, `Focus ${t ?? ""}`);
					}, [() => w(U(t)), () => w(U(t))]), G("click", n, () => ee(() => T(U(t).key))), q(e, n);
				});
				var a = V(i, 2), o = V(a, 2);
				X(V(o, 2), 17, () => t.views.closedViews, (e) => e.key, (e, t) => {
					var r = Wa(), i = z(r);
					F(r), H((e, n) => {
						Q(r, "title", e), J(i, `Reopen ${U(t).label ?? ""} · ${n ?? ""}`);
					}, [() => w(U(t)), () => w(U(t))]), G("click", r, () => ee(() => n().reopenView?.(U(t).key))), q(e, r);
				}), H((e) => {
					a.disabled = t.views.active.identity.kind === "root" || !n().closeView, o.disabled = e;
				}, [() => t.views.tabs.every((e) => e.identity.kind === "root" || e.key === t.views.active.key) || !n().closeOtherViews]), G("click", a, () => ee(() => D(t.views.active))), G("click", o, () => ee(() => n().closeOtherViews?.(t.views.active.key))), q(e, r);
			};
			Y(o, (e) => {
				U(y) ? e(s) : e(c, -1);
			}), F(r), ji(r, (e) => R(a, e), () => U(a)), H(() => {
				i = di(r, 1, "pc-graph-view-menu svelte-7ptwed", null, i, { "pc-graph-tab-menu": !!U(l) }), pi(r, U(l) ? `left: ${U(u)}px; top: ${U(d)}px;` : void 0), Q(r, "aria-label", U(y) ? `Actions for ${U(y).label}` : "Graph view actions");
			}), G("keydown", r, M), q(e, r);
		};
		Y(O, (e) => {
			U(s) && e(A);
		}), F(f), ji(f, (e) => R(i, e), () => U(i)), H(() => {
			g = di(f, 1, "pc-graph-tabs pc-graph-tabs-multi svelte-7ptwed", null, g, { "pc-graph-tabs-menu-open": U(s) }), Q(v, "aria-expanded", U(s) && !U(l));
		}), G("click", v, j), q(e, f);
	};
	return Y(ie, (e) => {
		t.views && e(ae);
	}), q(e, re), Ue(ne);
}
Tr([
	"click",
	"pointerdown",
	"contextmenu",
	"keydown"
]);
//#endregion
//#region ui/GraphBreadcrumbs.svelte
var Xa = /* @__PURE__ */ K("<span aria-current=\"page\" class=\"svelte-18ovafz\"> </span>"), Za = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-18ovafz\"> </button>"), Qa = /* @__PURE__ */ K("<li class=\"svelte-18ovafz\"><!></li>"), $a = /* @__PURE__ */ K("<div class=\"pc-graph-location svelte-18ovafz\"><nav aria-label=\"Graph location\" class=\"svelte-18ovafz\"><ol class=\"svelte-18ovafz\"></ol></nav> <span class=\"pc-graph-scope svelte-18ovafz\"> <!><!></span></div>");
function eo(e, t) {
	He(t, !0);
	let n = Mi(t, "actions", 19, () => ({})), r = /* @__PURE__ */ I(() => t.view?.identity.kind === "library" ? t.view.identity.definitionRef : t.definitionRef ?? t.view?.definitionRef);
	function i(e) {
		return e.identity.kind === "instance" ? !!n().openInstance : !!n().focusView;
	}
	function a(e) {
		e.identity.kind === "instance" ? n().openInstance?.(e.identity.instancePath) : n().focusView?.(e.key);
	}
	var o = Ir(), s = B(o), c = (e) => {
		var n = $a(), o = z(n), s = z(o);
		X(s, 23, () => t.view.breadcrumbs, (e) => e.key, (e, n, r) => {
			var o = Qa(), s = z(o), c = (e) => {
				var t = Xa(), r = z(t, !0);
				F(t), H(() => J(r, U(n).label)), q(e, t);
			}, l = (e) => {
				var t = Za(), r = z(t, !0);
				F(t), H((e) => {
					t.disabled = e, J(r, U(n).label);
				}, [() => !i(U(n))]), G("click", t, () => a(U(n))), q(e, t);
			};
			Y(s, (e) => {
				U(r) === t.view.breadcrumbs.length - 1 ? e(c) : e(l, -1);
			}), F(o), q(e, o);
		}), F(s), F(o);
		var c = V(o, 2), l = z(c, !0), u = V(l), d = (e) => {
			var t = Fr();
			H(() => J(t, `· v${U(r).version ?? ""}`)), q(e, t);
		};
		Y(u, (e) => {
			U(r) && e(d);
		});
		var f = V(u), p = (e) => {
			q(e, Fr("· Read only"));
		};
		Y(f, (e) => {
			(t.view.readOnly || t.view.identity.kind === "library") && e(p);
		}), F(c), F(n), H(() => {
			Q(c, "title", U(r) ? `${U(r).id} · v${U(r).version} · ${U(r).semanticHash}` : void 0), J(l, t.view.identity.kind === "library" ? "Library inspection" : "Instance graph");
		}), q(e, n);
	};
	Y(s, (e) => {
		t.view && t.view.identity.kind !== "root" && e(c);
	}), q(e, o), Ue();
}
Tr(["click"]);
//#endregion
//#region ui/StructuredControl.svelte
var to = /* @__PURE__ */ K("<small class=\"svelte-taw2zx\">Rows are available when this JSON has a supported shape.</small>"), no = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\"> </label><textarea class=\"pc-structured-raw svelte-taw2zx\" spellcheck=\"false\"></textarea> <!>", 1), ro = /* @__PURE__ */ K("<option class=\"svelte-taw2zx\"> </option>"), io = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">Phase</label><select class=\"svelte-taw2zx\"></select> <label class=\"svelte-taw2zx\">Steps</label><input type=\"number\" min=\"1\" max=\"64\" step=\"1\" class=\"svelte-taw2zx\"/>", 1), ao = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">Name</label><input maxlength=\"128\" class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Value</label><input type=\"number\" step=\"any\" class=\"svelte-taw2zx\"/>", 1), oo = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">Default (JSON)</label><textarea class=\"svelte-taw2zx\"></textarea>", 1), so = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">Name</label><input class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Path (JSON array)</label><input class=\"svelte-taw2zx\"/> <label class=\"pc-structured-check svelte-taw2zx\"><input type=\"checkbox\" class=\"svelte-taw2zx\"/> Required</label> <label class=\"pc-structured-check svelte-taw2zx\"><input type=\"checkbox\" class=\"svelte-taw2zx\"/> Use default when missing</label><small class=\"svelte-taw2zx\">Defaults apply when Required is off.</small> <!>", 1), co = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">ID</label><input maxlength=\"128\" class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Label</label><input maxlength=\"80\" class=\"svelte-taw2zx\"/>", 1), lo = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">Name</label><input class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Text</label><textarea class=\"svelte-taw2zx\"></textarea>", 1), uo = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">Kind</label><select class=\"svelte-taw2zx\"><option class=\"svelte-taw2zx\">Literal</option><option class=\"svelte-taw2zx\">Regular expression</option></select> <label class=\"svelte-taw2zx\">Pattern</label><input class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Replacement</label><textarea class=\"svelte-taw2zx\"></textarea> <label class=\"svelte-taw2zx\">Flags</label><input class=\"svelte-taw2zx\"/>", 1), fo = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-taw2zx\">Move up</button><button type=\"button\" class=\"svelte-taw2zx\">Move down</button>", 1), po = /* @__PURE__ */ K("<fieldset class=\"pc-structured-row svelte-taw2zx\"><legend class=\"svelte-taw2zx\"> </legend> <!> <div class=\"pc-structured-actions svelte-taw2zx\"><!><button type=\"button\" class=\"svelte-taw2zx\">Remove</button></div></fieldset>"), mo = /* @__PURE__ */ K("<div class=\"pc-structured-rows svelte-taw2zx\"></div> <button type=\"button\" class=\"svelte-taw2zx\"> </button>", 1), ho = /* @__PURE__ */ K("<div class=\"pc-structured-control svelte-taw2zx\"><div class=\"pc-structured-mode svelte-taw2zx\"><button type=\"button\" class=\"svelte-taw2zx\"> </button></div> <!></div>");
function go(e, t) {
	He(t, !0);
	let n = Mi(t, "disabled", 3, !1), r = Mi(t, "error", 3, ""), i = [
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
			})) : null : !Array.isArray(e) || e.length > U(l) ? null : t.control.structured === "fields" ? e.every((e) => s(e) && Object.keys(e).every((e) => [
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
	let f = /* @__PURE__ */ I(d), p = /* @__PURE__ */ L(!1), m = /* @__PURE__ */ I(() => U(p) || !U(f));
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
		!n() && U(f) && _(U(f).map((n, i) => i === e ? {
			...n,
			[t]: r
		} : n));
	}
	function y() {
		if (n() || !U(f) || U(f).length >= U(l)) return;
		let e = 1;
		for (; U(f).some((t) => t.name === U(c) + e || t.id === "context-" + e);) e++;
		_([...U(f), t.control.structured === "fields" ? {
			name: U(c) + e,
			path: []
		} : t.control.structured === "sections" ? {
			name: U(c) + e,
			text: ""
		} : t.control.structured === "slots" ? {
			id: "context-" + e,
			label: "Context " + e
		} : t.control.structured === "numeric-map" ? {
			name: U(c) + e,
			number: 0
		} : t.control.structured === "durations" ? {
			name: i.find((e) => !U(f).some((t) => t.name === e)),
			number: 1
		} : {
			kind: "literal",
			pattern: "text",
			replacement: ""
		}]);
	}
	function b(e, r) {
		let i = r.valueAsNumber;
		!n() && U(f) && (!Number.isFinite(i) || t.control.structured === "durations" && (!Number.isSafeInteger(i) || i < 1 || i > 64) ? r.value = String(U(f)[e].number) : v(e, "number", i));
	}
	function x(e, t) {
		!n() && U(f) && (!t.value.trim() || t.value.length > 128 || U(f).some((n, r) => r !== e && n.name === t.value) ? t.value = String(U(f)[e].name) : v(e, "name", t.value));
	}
	function S(e, r, i) {
		if (!n() && U(f)) try {
			let t = JSON.parse(i);
			if (!o(t)) throw Error("Nonfinite JSON");
			v(e, r, t);
		} catch {
			let n = 0, a = "__structured_json_0__";
			for (; t.text.includes(a);) a = "__structured_json_" + ++n + "__";
			let o = U(f).map((t, n) => n === e ? {
				...t,
				[r]: a
			} : t);
			R(p, !0), t.ontext(JSON.stringify(o, null, 2).replace(JSON.stringify(a), () => i));
		}
	}
	function C(e, t) {
		!n() && U(f) && _(U(f).map((n, r) => {
			if (r !== e) return n;
			let i = { ...n };
			return t ? i.default = null : delete i.default, i;
		}));
	}
	function w(e) {
		!n() && U(f) && U(f).length > U(u) && _(U(f).filter((t, n) => n !== e));
	}
	function T(e, t) {
		if (n() || !U(f) || e + t < 0 || e + t >= U(f).length) return;
		let r = [...U(f)];
		[r[e], r[e + t]] = [r[e + t], r[e]], _(r);
	}
	var E = ho(), D = z(E), O = z(D), k = z(O, !0);
	F(O), F(D);
	var A = V(D, 2), j = (e) => {
		var i = no(), a = B(i), o = z(a);
		F(a);
		var s = V(a);
		it(s);
		var c = V(s, 2), l = (e) => {
			q(e, to());
		};
		Y(c, (e) => {
			U(f) || e(l);
		}), H(() => {
			Q(a, "for", t.idPrefix + "-raw"), J(o, `${t.control.label ?? ""} (JSON)`), Q(s, "id", t.idPrefix + "-raw"), Q(s, "aria-label", t.control.label), Q(s, "aria-invalid", !!r()), Q(s, "aria-describedby", r() ? t.idPrefix + "-error" : void 0), Si(s, t.text), s.disabled = n();
		}), G("input", s, (e) => h(e.currentTarget.value)), q(e, i);
	}, M = (e) => {
		var r = mo(), a = B(r);
		X(a, 21, () => U(f), Kr, (e, r, a) => {
			var o = po(), s = z(o), l = z(s);
			F(s);
			var d = V(s, 2), p = (e) => {
				var o = io(), s = B(o), c = V(s);
				Q(c, "aria-label", "Duration " + (a + 1) + " phase"), X(c, 21, () => i, Kr, (e, t) => {
					var n = ro(), r = z(n, !0);
					F(n);
					var i = {};
					H((e, a) => {
						n.disabled = e, J(r, a), i !== (i = U(t)) && (n.value = (n.__value = U(t)) ?? "");
					}, [() => U(f).some((e, n) => n !== a && e.name === U(t)), () => U(t)[0].toUpperCase() + U(t).slice(1)]), q(e, n);
				}), F(c);
				var l;
				hi(c);
				var u = V(c, 2), d = V(u);
				Z(d), Q(d, "aria-label", "Duration " + (a + 1) + " steps"), H((e, r) => {
					Q(s, "for", t.idPrefix + "-phase-" + a), Q(c, "id", t.idPrefix + "-phase-" + a), c.disabled = n(), l !== (l = e) && (c.value = (c.__value = e) ?? "", mi(c, e)), Q(u, "for", t.idPrefix + "-steps-" + a), Q(d, "id", t.idPrefix + "-steps-" + a), Si(d, r), d.disabled = n();
				}, [() => String(U(r).name), () => Number(U(r).number)]), G("change", c, (e) => x(a, e.currentTarget)), G("change", d, (e) => b(a, e.currentTarget)), q(e, o);
			}, m = (e) => {
				var i = ao(), o = B(i), s = V(o);
				Z(s), Q(s, "aria-label", "Value " + (a + 1) + " name");
				var c = V(s, 2), l = V(c);
				Z(l), Q(l, "aria-label", "Value " + (a + 1) + " number"), H((e, r) => {
					Q(o, "for", t.idPrefix + "-name-" + a), Q(s, "id", t.idPrefix + "-name-" + a), Si(s, e), s.disabled = n(), Q(c, "for", t.idPrefix + "-number-" + a), Q(l, "id", t.idPrefix + "-number-" + a), Si(l, r), Q(l, "min", t.control.min), Q(l, "max", t.control.max), l.disabled = n();
				}, [() => String(U(r).name), () => Number(U(r).number)]), G("change", s, (e) => x(a, e.currentTarget)), G("change", l, (e) => b(a, e.currentTarget)), q(e, i);
			}, h = (e) => {
				var i = so(), o = B(i), s = V(o);
				Z(s), Q(s, "aria-label", "Field " + (a + 1) + " name");
				var c = V(s, 2), l = V(c);
				Z(l), Q(l, "aria-label", "Field " + (a + 1) + " path (JSON array)");
				var u = V(l, 2), d = z(u);
				Z(d), Q(d, "aria-label", "Field " + (a + 1) + " required"), je(), F(u);
				var f = V(u, 2), p = z(f);
				Z(p), Q(p, "aria-label", "Field " + (a + 1) + " use default"), je(), F(f);
				var m = V(f, 3), h = (e) => {
					var i = oo(), o = B(i), s = V(o);
					it(s), Q(s, "aria-label", "Field " + (a + 1) + " default (JSON)"), H((e) => {
						Q(o, "for", t.idPrefix + "-default-" + a), Q(s, "id", t.idPrefix + "-default-" + a), Si(s, e), s.disabled = n();
					}, [() => JSON.stringify(U(r).default, null, 2)]), G("change", s, (e) => S(a, "default", e.currentTarget.value)), q(e, i);
				}, g = /* @__PURE__ */ I(() => Object.hasOwn(U(r), "default"));
				Y(m, (e) => {
					U(g) && e(h);
				}), H((e, i, u) => {
					Q(o, "for", t.idPrefix + "-name-" + a), Q(s, "id", t.idPrefix + "-name-" + a), Si(s, e), s.disabled = n(), Q(c, "for", t.idPrefix + "-path-" + a), Q(l, "id", t.idPrefix + "-path-" + a), Si(l, i), l.disabled = n(), Ci(d, U(r).required !== !1), d.disabled = n(), Ci(p, u), p.disabled = n();
				}, [
					() => String(U(r).name),
					() => JSON.stringify(U(r).path),
					() => Object.hasOwn(U(r), "default")
				]), G("input", s, (e) => v(a, "name", e.currentTarget.value)), G("change", l, (e) => S(a, "path", e.currentTarget.value)), G("change", d, (e) => v(a, "required", e.currentTarget.checked)), G("change", p, (e) => C(a, e.currentTarget.checked)), q(e, i);
			}, g = (e) => {
				var i = co(), o = B(i), s = V(o);
				Z(s), Q(s, "aria-label", "Slot " + (a + 1) + " ID");
				var c = V(s, 2), l = V(c);
				Z(l), Q(l, "aria-label", "Slot " + (a + 1) + " label"), H((e, r) => {
					Q(o, "for", t.idPrefix + "-slot-id-" + a), Q(s, "id", t.idPrefix + "-slot-id-" + a), Si(s, e), s.disabled = n(), Q(c, "for", t.idPrefix + "-slot-label-" + a), Q(l, "id", t.idPrefix + "-slot-label-" + a), Si(l, r), l.disabled = n();
				}, [() => String(U(r).id), () => String(U(r).label)]), G("input", s, (e) => v(a, "id", e.currentTarget.value)), G("input", l, (e) => v(a, "label", e.currentTarget.value)), q(e, i);
			}, _ = (e) => {
				var i = lo(), o = B(i), s = V(o);
				Z(s), Q(s, "aria-label", "Section " + (a + 1) + " name");
				var c = V(s, 2), l = V(c);
				it(l), Q(l, "aria-label", "Section " + (a + 1) + " text"), H((e, r) => {
					Q(o, "for", t.idPrefix + "-name-" + a), Q(s, "id", t.idPrefix + "-name-" + a), Si(s, e), s.disabled = n(), Q(c, "for", t.idPrefix + "-text-" + a), Q(l, "id", t.idPrefix + "-text-" + a), Si(l, r), l.disabled = n();
				}, [() => String(U(r).name), () => String(U(r).text)]), G("input", s, (e) => v(a, "name", e.currentTarget.value)), G("input", l, (e) => v(a, "text", e.currentTarget.value)), q(e, i);
			}, y = (e) => {
				var i = uo(), o = B(i), s = V(o);
				Q(s, "aria-label", "Rule " + (a + 1) + " kind");
				var c = z(s);
				c.value = c.__value = "literal";
				var l = V(c);
				l.value = l.__value = "regex", F(s);
				var u;
				hi(s);
				var d = V(s, 2), f = V(d);
				Z(f), Q(f, "aria-label", "Rule " + (a + 1) + " pattern");
				var p = V(f, 2), m = V(p);
				it(m), Q(m, "aria-label", "Rule " + (a + 1) + " replacement");
				var h = V(m, 2), g = V(h);
				Z(g), Q(g, "aria-label", "Rule " + (a + 1) + " flags"), H((e, r, i, c) => {
					Q(o, "for", t.idPrefix + "-kind-" + a), Q(s, "id", t.idPrefix + "-kind-" + a), s.disabled = n(), u !== (u = e) && (s.value = (s.__value = e) ?? "", mi(s, e)), Q(d, "for", t.idPrefix + "-pattern-" + a), Q(f, "id", t.idPrefix + "-pattern-" + a), Si(f, r), f.disabled = n(), Q(p, "for", t.idPrefix + "-replacement-" + a), Q(m, "id", t.idPrefix + "-replacement-" + a), Si(m, i), m.disabled = n(), Q(h, "for", t.idPrefix + "-flags-" + a), Q(g, "id", t.idPrefix + "-flags-" + a), Si(g, c), g.disabled = n();
				}, [
					() => String(U(r).kind),
					() => String(U(r).pattern),
					() => String(U(r).replacement ?? ""),
					() => String(U(r).flags ?? "")
				]), G("change", s, (e) => v(a, "kind", e.currentTarget.value)), G("input", f, (e) => v(a, "pattern", e.currentTarget.value)), G("input", m, (e) => v(a, "replacement", e.currentTarget.value)), G("input", g, (e) => v(a, "flags", e.currentTarget.value)), q(e, i);
			};
			Y(d, (e) => {
				t.control.structured === "durations" ? e(p) : t.control.structured === "numeric-map" ? e(m, 1) : t.control.structured === "fields" ? e(h, 2) : t.control.structured === "slots" ? e(g, 3) : t.control.structured === "sections" ? e(_, 4) : e(y, -1);
			});
			var E = V(d, 2), D = z(E), O = (e) => {
				var t = fo(), r = B(t), i = V(r);
				H(() => {
					Q(r, "aria-label", "Move " + U(c) + " " + (a + 1) + " up"), r.disabled = n() || a === 0, Q(i, "aria-label", "Move " + U(c) + " " + (a + 1) + " down"), i.disabled = n() || a === U(f).length - 1;
				}), G("click", r, () => T(a, -1)), G("click", i, () => T(a, 1)), q(e, t);
			}, k = /* @__PURE__ */ I(() => !["numeric-map", "durations"].includes(t.control.structured ?? ""));
			Y(D, (e) => {
				U(k) && e(O);
			});
			var A = V(D);
			F(E), F(o), H((e) => {
				J(l, `${e ?? ""} ${a + 1}`), Q(A, "aria-label", "Remove " + U(c) + " " + (a + 1)), A.disabled = n() || U(f).length <= U(u);
			}, [() => U(c)[0].toUpperCase() + U(c).slice(1)]), G("click", A, () => w(a)), q(e, o);
		}), F(a);
		var o = V(a, 2), s = z(o);
		F(o), H(() => {
			Q(o, "aria-label", "Add " + U(c)), o.disabled = n() || U(f).length >= U(l), J(s, `Add ${U(c) ?? ""}`);
		}), G("click", o, y), q(e, r);
	};
	Y(A, (e) => {
		U(m) ? e(j) : U(f) && e(M, 1);
	}), F(E), H(() => {
		Q(E, "data-structured-control", t.control.structured), Q(O, "aria-label", "Edit " + t.control.label + (U(m) ? " as rows" : " as JSON")), O.disabled = n() || U(m) && !U(f), J(k, U(m) ? "Use rows" : "Edit JSON");
	}), G("click", O, () => {
		!n() && U(f) && R(p, !U(m));
	}), q(e, E), Ue();
}
Tr([
	"click",
	"input",
	"change"
]);
//#endregion
//#region ui/DetailControl.svelte
var _o = /* @__PURE__ */ K("<span class=\"pc-control-label svelte-16a137\"> </span> <!>", 1), vo = /* @__PURE__ */ K("<label class=\"pc-detail-check svelte-16a137\"><input type=\"checkbox\" class=\"svelte-16a137\"/> </label>"), yo = /* @__PURE__ */ K("<label class=\"svelte-16a137\"><input type=\"radio\" class=\"svelte-16a137\"/><span class=\"svelte-16a137\"> </span></label>"), bo = /* @__PURE__ */ K("<span class=\"pc-control-label svelte-16a137\"> </span> <div class=\"pc-control-segments svelte-16a137\" role=\"radiogroup\"></div>", 1), xo = /* @__PURE__ */ K("<option class=\"svelte-16a137\"> </option>"), So = /* @__PURE__ */ K("<select class=\"svelte-16a137\"></select>"), Co = /* @__PURE__ */ K("<input type=\"number\" class=\"svelte-16a137\"/>"), wo = /* @__PURE__ */ K("<textarea class=\"svelte-16a137\"></textarea>"), To = /* @__PURE__ */ K("<input type=\"text\" class=\"svelte-16a137\"/>"), Eo = /* @__PURE__ */ K("<label class=\"svelte-16a137\"> </label> <!>", 1), Do = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-16a137\"> </button>"), Oo = /* @__PURE__ */ K("<small class=\"svelte-16a137\"> </small>"), ko = /* @__PURE__ */ K("<p class=\"pc-detail-error svelte-16a137\" role=\"alert\"> </p>"), Ao = /* @__PURE__ */ K("<div><!> <!> <!> <!> <!></div>");
function jo(e, t) {
	He(t, !0);
	let n = Mi(t, "error", 3, ""), r = Mi(t, "disabled", 3, !1), i = Mi(t, "pending", 3, !1), a = () => t.control.editor === "enum" && (t.control.options?.length ?? 0) > 1 && (t.control.options?.length ?? 0) <= 3 && t.control.options.every((e) => e.label.length <= 10), o = () => t.control.effective !== void 0 && t.control.effective !== t.text && t.control.source !== "Saved setting" ? t.control.source : "";
	var s = Ao();
	let c;
	var l = z(s), u = (e) => {
		var i = _o(), a = B(i), o = z(a, !0);
		F(a), go(V(a, 2), {
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
		}), H(() => J(o, t.control.label)), q(e, i);
	}, d = (e) => {
		var n = vo(), i = z(n);
		Z(i);
		var a = V(i, 1, !0);
		F(n), H((e) => {
			Q(i, "aria-label", t.control.label), Ci(i, e), i.disabled = r(), J(a, t.control.label);
		}, [() => !!t.control.value]), G("change", i, (e) => {
			r() || t.onvalue(e.currentTarget.checked);
		}), q(e, n);
	}, f = (e) => {
		var n = bo(), i = B(n), a = z(i, !0);
		F(i);
		var o = V(i, 2);
		X(o, 21, () => t.control.options ?? [], (e) => e.value, (e, n) => {
			var i = yo(), a = z(i);
			Z(a);
			var o = V(a), s = z(o, !0);
			F(o), F(i), H((e) => {
				Q(a, "name", t.idPrefix + "-choice"), Q(a, "aria-label", U(n).label), Si(a, U(n).value), Ci(a, e), a.disabled = r(), J(s, U(n).label);
			}, [() => String(t.control.value) === U(n).value]), G("change", a, (e) => {
				!r() && e.currentTarget.checked && t.onvalue(U(n).value);
			}), q(e, i);
		}), F(o), H(() => {
			J(a, t.control.label), Q(o, "aria-label", t.control.label);
		}), q(e, n);
	}, p = /* @__PURE__ */ I(() => a()), m = (e) => {
		var i = Eo(), a = B(i), o = z(a, !0);
		F(a);
		var s = V(a, 2), c = (e) => {
			var n = So();
			X(n, 21, () => t.control.options ?? [], (e) => e.value, (e, t) => {
				var n = xo(), r = z(n, !0);
				F(n);
				var i = {};
				H(() => {
					J(r, U(t).label), i !== (i = U(t).value) && (n.value = (n.__value = U(t).value) ?? "");
				}), q(e, n);
			}), F(n);
			var i;
			hi(n), H((e) => {
				Q(n, "id", t.idPrefix + "-editor"), Q(n, "aria-label", t.control.label), n.disabled = r(), i !== (i = e) && (n.value = (n.__value = e) ?? "", mi(n, e));
			}, [() => String(t.control.value)]), G("change", n, (e) => {
				r() || t.onvalue(e.currentTarget.value);
			}), q(e, n);
		}, l = (e) => {
			var i = Co();
			Z(i), H((e) => {
				Q(i, "id", t.idPrefix + "-editor"), Q(i, "aria-label", t.control.label), Q(i, "min", t.control.min), Q(i, "max", t.control.max), Q(i, "step", t.control.step ?? 1), Q(i, "aria-invalid", !!n()), Q(i, "aria-describedby", n() ? t.idPrefix + "-error" : void 0), Si(i, e), i.disabled = r();
			}, [() => Number(t.control.value)]), G("change", i, (e) => {
				r() || t.onnumber(e.currentTarget);
			}), q(e, i);
		}, u = (e) => {
			var i = wo();
			it(i), H(() => {
				Q(i, "id", t.idPrefix + "-editor"), Q(i, "aria-label", t.control.label), Q(i, "aria-invalid", !!n()), Q(i, "aria-describedby", n() ? t.idPrefix + "-error" : void 0), Si(i, t.text), i.disabled = r();
			}), G("input", i, (e) => {
				r() || t.ontext(e.currentTarget.value);
			}), q(e, i);
		}, d = (e) => {
			var n = To();
			Z(n), H(() => {
				Q(n, "id", t.idPrefix + "-editor"), Q(n, "aria-label", t.control.label), Si(n, t.text), n.disabled = r();
			}), G("change", n, (e) => {
				r() || t.onvalue(e.currentTarget.value);
			}), q(e, n);
		}, f = /* @__PURE__ */ I(() => t.control.singleLine && t.control.editor === "text" && !t.text.includes("\n") && !t.text.includes("\r")), p = (e) => {
			var n = wo();
			it(n), H(() => {
				Q(n, "id", t.idPrefix + "-editor"), Q(n, "aria-label", t.control.label), Si(n, t.text), n.disabled = r();
			}), G("change", n, (e) => {
				r() || t.onvalue(e.currentTarget.value);
			}), q(e, n);
		};
		Y(s, (e) => {
			t.control.editor === "enum" ? e(c) : t.control.editor === "number" ? e(l, 1) : t.control.editor === "json" || t.control.editor === "lines" ? e(u, 2) : U(f) ? e(d, 3) : e(p, -1);
		}), H(() => {
			Q(a, "for", t.idPrefix + "-editor"), J(o, t.control.label);
		}), q(e, i);
	};
	Y(l, (e) => {
		t.control.structured && t.control.editor === "json" ? e(u) : t.control.editor === "boolean" ? e(d, 1) : U(p) ? e(f, 2) : e(m, -1);
	});
	var h = V(l, 2), g = (e) => {
		var n = Do(), a = z(n, !0);
		F(n), H(() => {
			Q(n, "data-save-control", t.control.key), n.disabled = r() || i(), J(a, i() ? "Validating…" : "Save " + t.control.label);
		}), G("click", n, () => {
			!r() && !i() && t.onsave();
		}), q(e, n);
	};
	Y(h, (e) => {
		(t.control.editor === "json" || t.control.editor === "lines") && e(g);
	});
	var _ = V(h, 2), v = (e) => {
		var n = Oo(), r = z(n, !0);
		F(n), H(() => J(r, t.control.help)), q(e, n);
	};
	Y(_, (e) => {
		t.control.help && e(v);
	});
	var y = V(_, 2), b = (e) => {
		var n = Oo(), r = z(n, !0);
		F(n), H(() => J(r, t.control.exposureNote)), q(e, n);
	}, x = (e) => {
		var n = Oo(), r = z(n);
		F(n), H((e) => J(r, `${e ?? ""} · Effective: ${t.control.effective ?? ""}`), [() => o()]), q(e, n);
	}, S = /* @__PURE__ */ I(() => o());
	Y(y, (e) => {
		t.control.exposureNote ? e(b) : U(S) && e(x, 1);
	});
	var C = V(y, 2), w = (e) => {
		var r = ko(), i = z(r, !0);
		F(r), H(() => {
			Q(r, "id", t.idPrefix + "-error"), J(i, n());
		}), q(e, r);
	};
	Y(C, (e) => {
		n() && e(w);
	}), F(s), H(() => c = di(s, 1, "pc-detail-control svelte-16a137", null, c, { "pc-control-number": t.control.editor === "number" })), q(e, s), Ue();
}
Tr([
	"change",
	"input",
	"click"
]);
//#endregion
//#region ui/RecallDetails.svelte
var Mo = /* @__PURE__ */ K("<p class=\"svelte-1kifnmo\"> </p>"), No = /* @__PURE__ */ K("<p role=\"alert\" class=\"svelte-1kifnmo\"> </p>"), Po = /* @__PURE__ */ K("<p class=\"svelte-1kifnmo\">Add a matching Recall node and connect it to the workflow. Queueing this Shortcut has an effect when that Recall executes.</p>"), Fo = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-recall-link svelte-1kifnmo\"> </button>"), Io = /* @__PURE__ */ K("<section class=\"pc-recall-details svelte-1kifnmo\" aria-label=\"Memory recall\"><h3 class=\"svelte-1kifnmo\">Memory recall</h3><p role=\"status\" class=\"svelte-1kifnmo\"> </p> <dl class=\"svelte-1kifnmo\"><dt class=\"svelte-1kifnmo\">Memory set</dt><dd class=\"svelte-1kifnmo\"> </dd><dt class=\"svelte-1kifnmo\">Target</dt><dd class=\"svelte-1kifnmo\"> </dd><dt class=\"svelte-1kifnmo\">Repetition</dt><dd class=\"svelte-1kifnmo\"> </dd><dt class=\"svelte-1kifnmo\">Consume on</dt><dd class=\"svelte-1kifnmo\"> </dd></dl> <!> <!> <div class=\"pc-detail-actions svelte-1kifnmo\"><button type=\"button\">Queue recall</button><button type=\"button\">Cancel recall</button></div> <!><!> <!> <!> <small class=\"svelte-1kifnmo\">Matching nodes share one request. The first successful matching Recall supplies the selection for a generation. Use different memory-set IDs for independent selections. Automatic triggers keep their own conditions.</small></section>");
function Lo(e, t) {
	He(t, !0);
	let n = /* @__PURE__ */ L(!1), r = /* @__PURE__ */ L(""), i = "", a = 0;
	Sn(() => {
		i !== t.view.nodeId && (i = t.view.nodeId, a++, R(n, !1), R(r, ""));
	});
	async function o(e) {
		if (U(n)) return;
		let i = t.view.nodeId, o = ++a;
		R(n, !0), R(r, "");
		try {
			let n = await t.actions[e]?.();
			o === a && i === t.view.nodeId && n?.ok !== !0 && R(r, n?.error.message ?? "Memory recall is unavailable.", !0);
		} catch {
			o === a && i === t.view.nodeId && R(r, "Memory recall could not be updated.");
		} finally {
			o === a && i === t.view.nodeId && R(n, !1);
		}
	}
	var s = Io(), c = V(z(s)), l = z(c, !0);
	F(c);
	var u = V(c, 2), d = V(z(u)), f = z(d, !0);
	F(d);
	var p = V(d, 2), m = z(p, !0);
	F(p);
	var h = V(p, 2), g = z(h, !0);
	F(h);
	var _ = V(h, 2), v = z(_, !0);
	F(_), F(u);
	var y = V(u, 2), b = (e) => {
		var n = Mo(), r = z(n);
		F(n), H(() => J(r, `Remaining: ${t.view.remainingText ?? ""}`)), q(e, n);
	};
	Y(y, (e) => {
		t.view.queued && e(b);
	});
	var x = V(y, 2), S = (e) => {
		var n = Mo(), r = z(n);
		F(n), H(() => J(r, `Pending generations: ${t.view.pendingCount ?? ""}`)), q(e, n);
	};
	Y(x, (e) => {
		t.view.pendingCount && e(S);
	});
	var C = V(x, 2), w = z(C), T = V(w);
	F(C);
	var E = V(C, 2), D = (e) => {
		var n = Mo(), r = z(n, !0);
		F(n), H(() => J(r, t.view.reason)), q(e, n);
	};
	Y(E, (e) => {
		t.view.reason && e(D);
	});
	var O = V(E), k = (e) => {
		var t = No(), n = z(t, !0);
		F(t), H(() => J(n, U(r))), q(e, t);
	};
	Y(O, (e) => {
		U(r) && e(k);
	});
	var A = V(O, 2), j = (e) => {
		q(e, Po());
	}, M = /* @__PURE__ */ I(() => t.view.shortcutNodeIds.includes(t.view.nodeId) && t.view.consumerCount === 0);
	Y(A, (e) => {
		U(M) && e(j);
	}), X(V(A, 2), 17, () => t.view.hotkeys, (e) => e.nodeId, (e, n) => {
		var r = Fo(), i = z(r);
		F(r), H(() => {
			r.disabled = !t.actions.revealShortcut, J(i, `Recall Shortcut · ${U(n).label ?? ""}`);
		}), G("click", r, () => t.actions.revealShortcut?.(U(n).nodeId)), q(e, r);
	}), je(2), F(s), H(() => {
		J(l, t.view.statusText), J(f, t.view.memorySetId || "Choose a memory set"), J(m, t.view.targetLabel), J(g, t.view.useLabel), J(v, t.view.consumeLabel), w.disabled = U(n) || !t.view.queueAllowed || !t.actions.queue, Q(w, "title", t.view.queueAllowed ? void 0 : t.view.reason || "Recall is already queued."), T.disabled = U(n) || !t.view.cancelAllowed || !t.actions.cancel;
	}), G("click", w, () => o("queue")), G("click", T, () => o("cancel")), q(e, s), Ue();
}
Tr(["click"]);
//#endregion
//#region ui/ModifierStack.svelte
var Ro = /* @__PURE__ */ K("<label class=\"svelte-1ibq9q\"><input type=\"checkbox\" class=\"svelte-1ibq9q\"/> </label>"), zo = /* @__PURE__ */ K("<option class=\"svelte-1ibq9q\"> </option>"), Bo = /* @__PURE__ */ K("<label class=\"pc-modifier-check svelte-1ibq9q\"><input type=\"checkbox\" class=\"svelte-1ibq9q\"/> </label>"), Vo = /* @__PURE__ */ K("<select class=\"svelte-1ibq9q\"></select>"), Ho = /* @__PURE__ */ K("<input type=\"number\" class=\"svelte-1ibq9q\"/>"), Uo = /* @__PURE__ */ K("<textarea class=\"svelte-1ibq9q\"></textarea>"), Wo = /* @__PURE__ */ K("<label class=\"svelte-1ibq9q\"> </label> <!>", 1), Go = /* @__PURE__ */ K("<small class=\"svelte-1ibq9q\"> </small>"), Ko = /* @__PURE__ */ K("<!> <!>", 1), qo = /* @__PURE__ */ K("<details class=\"svelte-1ibq9q\"><summary class=\"svelte-1ibq9q\"> <!></summary> <!> <button type=\"button\" class=\"svelte-1ibq9q\"> </button></details>"), Jo = /* @__PURE__ */ K("<p class=\"pc-modifier-error svelte-1ibq9q\" role=\"alert\"> </p>"), Yo = /* @__PURE__ */ K("<div class=\"pc-modifier-entry svelte-1ibq9q\"><div class=\"pc-modifier-heading svelte-1ibq9q\"><label class=\"svelte-1ibq9q\"><input type=\"checkbox\" class=\"svelte-1ibq9q\"/><span class=\"svelte-1ibq9q\"> <small class=\"svelte-1ibq9q\"> </small></span></label> <div class=\"pc-modifier-order svelte-1ibq9q\"><button type=\"button\" title=\"Move up\" class=\"svelte-1ibq9q\">↑</button> <button type=\"button\" title=\"Move down\" class=\"svelte-1ibq9q\">↓</button> <button type=\"button\" title=\"Remove\" class=\"svelte-1ibq9q\">×</button></div></div> <!> <!></div>"), Xo = /* @__PURE__ */ K("<div class=\"pc-modifier-stack svelte-1ibq9q\"><small class=\"svelte-1ibq9q\"> </small> <!></div>"), Zo = /* @__PURE__ */ K("<small role=\"status\" class=\"svelte-1ibq9q\">Validating modifiers…</small>"), Qo = /* @__PURE__ */ K("<section class=\"pc-modifiers svelte-1ibq9q\" data-modifier-controls=\"\" aria-label=\"Text modifiers\"><div class=\"pc-modifier-quick svelte-1ibq9q\"><!> <select aria-label=\"Add text modifier\" class=\"svelte-1ibq9q\"><option class=\"svelte-1ibq9q\">Add modifier…</option><!></select></div> <!> <!> <!></section>");
function $o(e, t) {
	He(t, !0);
	let n = (e) => t.options.find((t) => t.type === e.type), r = (e) => n(e)?.label ?? e.type, i = (e) => t.drafts[e.id]?.settings ?? e.settings, a = (e) => t.disabled || t.busy || !t.options.some((t) => t.type === e) || t.items.length >= 16 && !t.items.some((t) => t.type === e);
	var o = Qo(), s = z(o), c = z(s);
	X(c, 16, () => ["trim", "wrap"], Kr, (e, n) => {
		var r = Ro(), i = z(r);
		Z(i);
		var o = V(i, 1, !0);
		F(r), H((e, t) => {
			Q(i, "aria-label", (n === "trim" ? "Trim" : "Wrap") + " output"), Ci(i, e), i.disabled = t, J(o, n === "trim" ? "Trim" : "Wrap");
		}, [() => t.items.some((e) => e.type === n && e.enabled), () => a(n)]), G("change", i, (e) => {
			a(n) || t.onquick(n, e.currentTarget.checked);
		}), q(e, r);
	});
	var l = V(c, 2), u = z(l);
	u.value = u.__value = "", X(V(u), 17, () => t.options.filter((e) => !["trim", "wrap"].includes(e.type)), (e) => e.type, (e, t) => {
		var n = zo(), r = z(n, !0);
		F(n);
		var i = {};
		H(() => {
			J(r, U(t).label), i !== (i = U(t).type) && (n.value = (n.__value = U(t).type) ?? "");
		}), q(e, n);
	}), F(l), l.value = l.__value = "", F(s);
	var d = V(s, 2), f = (e) => {
		var a = Xo(), o = z(a), s = z(o);
		F(o), X(V(o, 2), 19, () => t.items, (e) => e.id, (e, a, o) => {
			let s = /* @__PURE__ */ I(() => n(U(a))), c = /* @__PURE__ */ I(() => r(U(a))), l = /* @__PURE__ */ I(() => t.drafts[U(a).id]);
			var u = Yo(), d = z(u), f = z(d), p = z(f);
			Z(p);
			var m = V(p), h = z(m), g = V(h), _ = z(g, !0);
			F(g), F(m), F(f);
			var v = V(f, 2), y = z(v), b = V(y, 2), x = V(b, 2);
			F(v), F(d);
			var S = V(d, 2), C = (e) => {
				var n = qo(), r = z(n), o = z(r), u = V(o), d = (e) => {
					q(e, Fr("· Unsaved"));
				};
				Y(u, (e) => {
					U(l)?.dirty && e(d);
				}), F(r);
				var f = V(r, 2);
				X(f, 17, () => U(s).fields, (e) => e.key, (e, n) => {
					let r = /* @__PURE__ */ I(() => t.idPrefix + "-modifier-" + U(a).id + "-" + U(n).key);
					var o = Ko(), s = B(o), l = (e) => {
						var o = Bo(), s = z(o);
						Z(s);
						var l = V(s, 1, !0);
						F(o), H((e) => {
							Q(s, "id", U(r)), Q(s, "aria-label", U(c) + " " + U(n).label), Ci(s, e), s.disabled = t.disabled, J(l, U(n).label);
						}, [() => !!i(U(a))[U(n).key]]), G("change", s, (e) => {
							t.disabled || t.ondraft(U(a).id, U(n).key, e.currentTarget.checked);
						}), q(e, o);
					}, u = (e) => {
						var o = Wo(), s = B(o), l = z(s, !0);
						F(s);
						var u = V(s, 2), d = (e) => {
							var o = Vo();
							X(o, 21, () => U(n).options ?? [], (e) => e.value, (e, t) => {
								var n = zo(), r = z(n, !0);
								F(n);
								var i = {};
								H(() => {
									J(r, U(t).label), i !== (i = U(t).value) && (n.value = (n.__value = U(t).value) ?? "");
								}), q(e, n);
							}), F(o);
							var s;
							hi(o), H((e) => {
								Q(o, "id", U(r)), Q(o, "aria-label", U(c) + " " + U(n).label), o.disabled = t.disabled, s !== (s = e) && (o.value = (o.__value = e) ?? "", mi(o, e));
							}, [() => String(i(U(a))[U(n).key] ?? "")]), G("change", o, (e) => {
								t.disabled || t.ondraft(U(a).id, U(n).key, e.currentTarget.value);
							}), q(e, o);
						}, f = (e) => {
							var o = Ho();
							Z(o), H((e) => {
								Q(o, "id", U(r)), Q(o, "aria-label", U(c) + " " + U(n).label), Q(o, "min", U(n).min), Q(o, "max", U(n).max), Q(o, "step", U(n).step ?? 1), Si(o, e), o.disabled = t.disabled;
							}, [() => String(i(U(a))[U(n).key] ?? "")]), G("input", o, (e) => {
								t.disabled || t.ondraft(U(a).id, U(n).key, e.currentTarget.value ? Number(e.currentTarget.value) : null);
							}), q(e, o);
						}, p = (e) => {
							var o = Uo();
							it(o), H((e) => {
								Q(o, "id", U(r)), Q(o, "aria-label", U(c) + " " + U(n).label), Si(o, e), o.disabled = t.disabled;
							}, [() => String(i(U(a))[U(n).key] ?? "")]), G("input", o, (e) => {
								t.disabled || t.ondraft(U(a).id, U(n).key, e.currentTarget.value);
							}), q(e, o);
						};
						Y(u, (e) => {
							U(n).editor === "enum" ? e(d) : U(n).editor === "number" ? e(f, 1) : e(p, -1);
						}), H(() => {
							Q(s, "for", U(r)), J(l, U(n).label);
						}), q(e, o);
					};
					Y(s, (e) => {
						U(n).editor === "boolean" ? e(l) : e(u, -1);
					});
					var d = V(s, 2), f = (e) => {
						var t = Go(), r = z(t, !0);
						F(t), H(() => J(r, U(n).help)), q(e, t);
					};
					Y(d, (e) => {
						U(n).help && e(f);
					}), q(e, o);
				});
				var p = V(f, 2), m = z(p, !0);
				F(p), F(n), H(() => {
					n.open = !!U(l)?.dirty || !!U(l)?.error, J(o, `${U(c) ?? ""} settings`), Q(p, "aria-label", "Save " + U(c) + " settings"), p.disabled = t.disabled || !!U(l)?.pending || !U(l)?.dirty, J(m, U(l)?.pending ? "Validating…" : "Save settings");
				}), G("click", p, () => {
					!t.disabled && !U(l)?.pending && U(l)?.dirty && t.onsave(U(a).id);
				}), q(e, n);
			};
			Y(S, (e) => {
				U(s)?.fields.length && e(C);
			});
			var w = V(S, 2), T = (e) => {
				var t = Jo(), n = z(t, !0);
				F(t), H(() => J(n, U(l).error)), q(e, t);
			};
			Y(w, (e) => {
				U(l)?.error && e(T);
			}), F(u), H(() => {
				Q(u, "data-modifier-id", U(a).id), Q(u, "data-modifier-state", U(a).enabled ? "active" : "disabled"), Q(p, "aria-label", "Enable " + U(c) + " modifier"), Ci(p, U(a).enabled), p.disabled = t.disabled || t.busy, J(h, `${U(o) + 1}. ${U(c) ?? ""}`), J(_, U(a).enabled ? "Active" : "Disabled"), Q(y, "aria-label", "Move " + U(c) + " up"), y.disabled = t.disabled || t.busy || U(o) === 0, Q(b, "aria-label", "Move " + U(c) + " down"), b.disabled = t.disabled || t.busy || U(o) === t.items.length - 1, Q(x, "aria-label", "Remove " + U(c) + " modifier"), x.disabled = t.disabled || t.busy;
			}), G("change", p, (e) => {
				!t.disabled && !t.busy && t.onenable(U(a).id, e.currentTarget.checked);
			}), G("click", y, () => {
				!t.disabled && !t.busy && U(o) > 0 && t.onmove(U(a).id, -1);
			}), G("click", b, () => {
				!t.disabled && !t.busy && U(o) < t.items.length - 1 && t.onmove(U(a).id, 1);
			}), G("click", x, () => {
				!t.disabled && !t.busy && t.onremove(U(a).id);
			}), q(e, u);
		}), F(a), H((e) => J(s, `${e ?? ""} active · ${t.items.length ?? ""} total · Applied in order`), [() => t.items.filter((e) => e.enabled).length]), q(e, a);
	};
	Y(d, (e) => {
		t.items.length && e(f);
	});
	var p = V(d, 2), m = (e) => {
		q(e, Zo());
	};
	Y(p, (e) => {
		t.busy && e(m);
	});
	var h = V(p, 2), g = (e) => {
		var n = Jo(), r = z(n, !0);
		F(n), H(() => J(r, t.error)), q(e, n);
	};
	Y(h, (e) => {
		t.error && e(g);
	}), F(o), H(() => l.disabled = t.disabled || t.busy || t.items.length >= 16), G("change", l, (e) => {
		let n = e.currentTarget.value;
		e.currentTarget.value = "", !t.disabled && !t.busy && t.items.length < 16 && n && t.onadd(n);
	}), q(e, o), Ue();
}
Tr([
	"change",
	"click",
	"input"
]);
//#endregion
//#region ui/WorkflowData.svelte
var es = /* @__PURE__ */ K("<button type=\"button\" data-load-workflow-data=\"\" class=\"svelte-8bs3bu\"> </button>"), ts = /* @__PURE__ */ K("<label class=\"pc-wd-number svelte-8bs3bu\"><span class=\"svelte-8bs3bu\">Starting day</span><input aria-label=\"Starting day\" type=\"number\" min=\"1\" step=\"1\" class=\"svelte-8bs3bu\"/></label> <label class=\"pc-wd-number svelte-8bs3bu\"><span class=\"svelte-8bs3bu\">Starting time</span><input aria-label=\"Starting time\" type=\"text\" inputmode=\"numeric\" placeholder=\"00:00\" class=\"svelte-8bs3bu\"/></label> <label class=\"pc-wd-number svelte-8bs3bu\"><span class=\"svelte-8bs3bu\">Hours per day</span><input aria-label=\"Hours per day\" type=\"number\" step=\"any\" class=\"svelte-8bs3bu\"/></label> <p class=\"pc-wd-help svelte-8bs3bu\">Initial values only. Saved time stays unchanged.</p>", 1), ns = /* @__PURE__ */ K("<label class=\"pc-wd-block svelte-8bs3bu\"> <textarea rows=\"4\" maxlength=\"100000\" class=\"svelte-8bs3bu\"></textarea></label> <p class=\"pc-wd-help svelte-8bs3bu\"> </p>", 1), rs = /* @__PURE__ */ K("<output class=\"pc-wd-source-value svelte-8bs3bu\"> </output>"), is = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-8bs3bu\"> </button>"), as = /* @__PURE__ */ K("<div class=\"pc-wd-choices svelte-8bs3bu\" role=\"group\"></div>"), os = /* @__PURE__ */ K("<option class=\"svelte-8bs3bu\"> </option>"), ss = /* @__PURE__ */ K("<select class=\"svelte-8bs3bu\"><!><!></select>"), cs = /* @__PURE__ */ K("<div class=\"pc-wd-create svelte-8bs3bu\"><label class=\"pc-wd-field svelte-8bs3bu\">Name<input maxlength=\"256\" class=\"svelte-8bs3bu\"/></label> <div class=\"pc-wd-actions svelte-8bs3bu\"><button type=\"button\" data-create-workflow-data=\"\" class=\"svelte-8bs3bu\"> </button><button type=\"button\" class=\"svelte-8bs3bu\">Cancel</button></div></div>"), ls = /* @__PURE__ */ K("<label class=\"pc-wd-field svelte-8bs3bu\">Format<select aria-label=\"Document format\" class=\"svelte-8bs3bu\"></select></label><p class=\"pc-wd-help svelte-8bs3bu\">A saved document keeps its format.</p>", 1), us = /* @__PURE__ */ K("<div class=\"pc-wd-field svelte-8bs3bu\"><span class=\"svelte-8bs3bu\">Format</span><output class=\"svelte-8bs3bu\">JSON</output></div><p class=\"pc-wd-help svelte-8bs3bu\"> </p>", 1), ds = /* @__PURE__ */ K("<label class=\"pc-wd-field svelte-8bs3bu\">Actor ID<input aria-label=\"Private actor ID\" maxlength=\"128\" class=\"svelte-8bs3bu\"/></label>"), fs = /* @__PURE__ */ K("<label class=\"pc-wd-field svelte-8bs3bu\">Columns<input aria-label=\"CSV columns\" placeholder=\"id, text\" class=\"svelte-8bs3bu\"/></label>"), ps = /* @__PURE__ */ K("<label class=\"pc-wd-field svelte-8bs3bu\">Calendar<input aria-label=\"Initial calendar name\" class=\"svelte-8bs3bu\"/></label><label class=\"pc-wd-field svelte-8bs3bu\">Expected calendar<input aria-label=\"Expected calendar\" placeholder=\"Any calendar\" class=\"svelte-8bs3bu\"/></label><p class=\"pc-wd-help svelte-8bs3bu\">Expected calendar validates saved data.</p>", 1), ms = /* @__PURE__ */ K("<p class=\"pc-wd-help svelte-8bs3bu\">Open an active chat to save initial settings.</p>"), hs = /* @__PURE__ */ K("<p class=\"pc-wd-help svelte-8bs3bu\"> </p>"), gs = /* @__PURE__ */ K("<p class=\"pc-wd-error svelte-8bs3bu\" role=\"alert\"> </p>"), _s = /* @__PURE__ */ K("<p class=\"pc-wd-help svelte-8bs3bu\" role=\"status\"> </p>"), vs = /* @__PURE__ */ K("<div class=\"pc-workflow-data svelte-8bs3bu\"><p class=\"pc-wd-binding svelte-8bs3bu\"> </p> <details class=\"pc-wd-group svelte-8bs3bu\" data-workflow-initial=\"\"><summary class=\"svelte-8bs3bu\"> <span class=\"svelte-8bs3bu\"> </span></summary> <div class=\"pc-wd-body svelte-8bs3bu\"><!> <!></div></details> <details class=\"pc-wd-group svelte-8bs3bu\" data-workflow-advanced=\"\"><summary class=\"svelte-8bs3bu\">Advanced <span class=\"svelte-8bs3bu\"> </span></summary> <div class=\"pc-wd-body svelte-8bs3bu\"><div class=\"pc-wd-source-row svelte-8bs3bu\"><span class=\"pc-wd-row-label svelte-8bs3bu\"> </span> <!> <button type=\"button\" class=\"pc-wd-add svelte-8bs3bu\">+</button></div> <!> <p class=\"pc-wd-help svelte-8bs3bu\"> </p> <hr class=\"svelte-8bs3bu\"/> <!> <span class=\"pc-wd-label svelte-8bs3bu\">Visibility</span> <div class=\"pc-wd-choices svelte-8bs3bu\" role=\"group\"></div> <!> <!> <label class=\"pc-wd-field svelte-8bs3bu\">Document ID<input readonly=\"\" class=\"svelte-8bs3bu\"/></label> <!></div></details> <div class=\"pc-wd-actions pc-wd-save svelte-8bs3bu\"><button type=\"button\" data-save-workflow-data=\"\" class=\"svelte-8bs3bu\"> </button></div> <!> <!> <!> <!></div>");
function ys(e, t) {
	He(t, !0);
	let n = Mi(t, "actions", 19, () => ({})), r = Mi(t, "disabled", 3, !1), i = Mi(t, "idPrefix", 3, "pc-workflow-data"), a = /* @__PURE__ */ L(null), o = /* @__PURE__ */ L("1"), s = /* @__PURE__ */ L("00:00"), c = /* @__PURE__ */ L("24"), l = /* @__PURE__ */ L("story-calendar"), u = /* @__PURE__ */ L(""), d = /* @__PURE__ */ L("text"), f = /* @__PURE__ */ L("public"), p = /* @__PURE__ */ L(""), m = /* @__PURE__ */ L(""), h = /* @__PURE__ */ L(!1), g = /* @__PURE__ */ L(""), _ = /* @__PURE__ */ L(""), v = /* @__PURE__ */ L(""), y = /* @__PURE__ */ L(""), b = /* @__PURE__ */ L(!1), x = "", S = 0, C = !0, w = /* @__PURE__ */ I(() => t.model.kind === "clock" ? "Clock" : t.model.kind === "outcomes" ? "Outcomes" : "Document"), T = /* @__PURE__ */ I(() => t.model.kind === "clock" ? "clock" : t.model.kind === "outcomes" ? "outcomes" : "document"), E = /* @__PURE__ */ I(() => !r() && t.model.editable && !!U(a) && !U(_)), D = /* @__PURE__ */ I(() => !r() && t.model.editable && t.model.available && !U(_)), O = [
		{
			value: "public",
			label: "Public"
		},
		{
			value: "hidden",
			label: "Hidden"
		},
		{
			value: "actor-private",
			label: "Actor private"
		}
	], k = [
		{
			value: "text",
			label: "Plain text"
		},
		{
			value: "json",
			label: "JSON"
		},
		{
			value: "jsonl",
			label: "JSON Lines"
		},
		{
			value: "csv",
			label: "CSV"
		},
		{
			value: "markdown",
			label: "Markdown"
		}
	], A = (e) => k.find((t) => t.value === e)?.label ?? e, j = (e) => O.find((t) => t.value === e)?.label ?? e, M = () => JSON.stringify([
		t.selection.selectionKey,
		t.selection.address,
		t.model.targetId,
		t.model.key
	]);
	function ee(e) {
		R(a, e ? structuredClone(e) : null, !0), R(u, e?.content ?? "", !0), R(d, e?.format ?? t.model.format, !0), R(f, e?.visibility.kind ?? t.model.visibility.kind, !0);
		let n = e?.visibility ?? t.model.visibility;
		if (R(p, n.kind === "actor-private" ? n.actorId : "", !0), R(m, e?.columns?.join(", ") ?? "", !0), R(o, "1"), R(s, "00:00"), R(c, "24"), R(l, "story-calendar"), t.model.kind === "clock" && e) try {
			let t = JSON.parse(e.content), n = t.dayLengthMinutes;
			R(o, String(Math.floor(t.absoluteMinute / n) + 1), !0);
			let r = t.absoluteMinute % n;
			R(s, String(Math.floor(r / 60)).padStart(2, "0") + ":" + String(r % 60).padStart(2, "0")), R(c, String(n / 60), !0), R(l, t.calendarId, !0);
		} catch {
			R(a, null), R(v, "Load a valid clock template before changing its starting values.");
		}
		R(b, !1);
	}
	Sn(() => {
		let e = M();
		e !== x && (x = e, S++, R(_, ""), R(v, ""), R(y, ""), R(h, !1), R(g, ""), gr(() => ee(t.model.definition)));
	}), Pi(() => {
		C = !1, S++;
	});
	function te(e, t) {
		(e === "actor" ? !U(D) : !U(E)) || (R(e === "day" ? o : e === "time" ? s : e === "hours" ? c : e === "calendar" ? l : e === "content" ? u : e === "actor" ? p : m, t, !0), S++, R(b, !0), R(v, ""), R(y, ""));
	}
	function ne(e) {
		U(E) && t.model.kind === "notes" && (R(d, e, !0), U(u).trim() || R(u, e === "json" ? "[]" : "", !0), S++, R(b, !0), R(v, ""), R(y, ""));
	}
	function re(e) {
		U(D) && (R(f, e, !0), S++, R(b, !0), R(v, ""), R(y, ""));
	}
	function ie() {
		return U(f) === "actor-private" ? {
			kind: U(f),
			actorId: U(p).trim()
		} : { kind: U(f) };
	}
	function ae() {
		let e = Number(U(o)), t = Number(U(c)) * 60, n = /^(\d+):([0-5]\d)$/.exec(U(s)), r = n ? Number(n[1]) * 60 + Number(n[2]) : NaN, i = (e - 1) * t + r;
		if (!Number.isSafeInteger(e) || e < 1 || !Number.isSafeInteger(t) || t < 1 || !Number.isSafeInteger(r) || r < 0 || r >= t || !Number.isSafeInteger(i) || !U(l).trim()) throw Error("Use a positive starting day, a time within the day, and a day length in whole minutes.");
		return {
			calendarId: U(l).trim(),
			absoluteMinute: i,
			dayLengthMinutes: t
		};
	}
	function oe() {
		if (!U(a)) throw Error("Load the initial template before saving.");
		let e = {
			targetId: t.model.targetId,
			name: U(a).name,
			format: U(d),
			content: U(u),
			visibility: ie()
		};
		if (U(f) === "actor-private" && !U(p).trim()) throw Error("Choose an actor for private data.");
		return t.model.kind === "clock" && (e.content = JSON.stringify({
			...JSON.parse(U(a).content),
			...ae()
		}, null, 2)), U(d) === "csv" && (e.columns = U(m).split(",").map((e) => e.trim()).filter(Boolean)), e;
	}
	let se = /* @__PURE__ */ I(() => U(D) && (U(a) ? !!n().saveWorkflowData : !!n().saveWorkflowDataVisibility) && U(b) && (U(f) !== "actor-private" || !!U(p).trim()));
	async function ce(e, n) {
		if (r() || !t.model.editable || U(_)) return;
		let i = structuredClone(t.selection), a = t.model.key, o = M(), s = ++S, c = e === "load" && U(b) ? {
			visibility: U(f),
			actorId: U(p)
		} : null;
		R(_, e, !0), R(v, ""), R(y, "");
		try {
			let r = await n(i, a);
			if (!C || s !== S || o !== M() || t.selection.revision !== i.revision) return;
			if (!r.ok) {
				R(v, r.error.message, !0);
				return;
			}
			if (e === "load") {
				if (!r.data?.definition) {
					R(v, "The initial template could not be loaded.");
					return;
				}
				ee(r.data.definition), c && (R(f, c.visibility, !0), R(p, c.actorId, !0), R(b, !0));
			} else R(b, !1), R(h, !1), R(y, r.data?.message ?? (e === "save" ? "Initial settings saved." : "Workflow data updated."), !0);
		} catch (e) {
			C && s === S && o === M() && t.selection.revision === i.revision && R(v, e instanceof Error ? e.message : "Workflow data could not be updated.", !0);
		} finally {
			C && s === S && o === M() && R(_, "");
		}
	}
	function le() {
		if (!U(se)) return;
		if (!U(a) && n().saveWorkflowDataVisibility) {
			ce("save", (e, t) => n().saveWorkflowDataVisibility(e, t, ie()));
			return;
		}
		if (!n().saveWorkflowData) return;
		let e;
		try {
			e = oe();
		} catch (e) {
			R(v, e instanceof Error ? e.message : "Check the initial settings.", !0);
			return;
		}
		ce("save", (t, r) => n().saveWorkflowData(t, r, e));
	}
	function ue(e) {
		!r() && t.model.editable && !U(_) && n().bindWorkflowData && e !== t.model.targetId && t.model.sources.some((t) => t.value === e) && ce("bind", (t, r) => n().bindWorkflowData(t, r, e));
	}
	function de() {
		if (r() || !t.model.editable || !t.model.available || U(_) || !n().createWorkflowData || !U(g).trim()) return;
		let e = {
			name: U(g).trim(),
			kind: t.model.kind,
			format: t.model.kind === "notes" ? U(d) : "json",
			visibility: ie()
		};
		try {
			if (U(f) === "actor-private" && !U(p).trim()) throw Error("Choose an actor for private data.");
			t.model.kind === "clock" && (e = {
				...e,
				...ae()
			});
		} catch (e) {
			R(v, e instanceof Error ? e.message : "Check the new data settings.", !0);
			return;
		}
		ce("create", (t, r) => n().createWorkflowData(t, r, e));
	}
	function fe(e) {
		!r() && t.model.editable && !U(_) && n().editControl && ce("calendar", (t) => n().editControl(t, "calendarId", e));
	}
	var pe = vs(), me = z(pe), he = z(me);
	F(me);
	var ge = V(me, 2), _e = z(ge), ve = z(_e), ye = V(ve), be = z(ye, !0);
	F(ye), F(_e);
	var xe = V(_e, 2), Se = z(xe), Ce = (e) => {
		var i = es(), a = z(i, !0);
		F(i), H(() => {
			i.disabled = r() || !t.model.editable || !t.model.available || !n().loadWorkflowData || !!U(_), J(a, U(_) === "load" ? "Loading…" : "Load initial values");
		}), G("click", i, () => {
			t.model.available && n().loadWorkflowData && ce("load", (e, t) => n().loadWorkflowData(e, t));
		}), q(e, i);
	};
	Y(Se, (e) => {
		U(a) || e(Ce);
	});
	var we = V(Se, 2), Te = (e) => {
		var t = ts(), n = B(t), r = V(z(n));
		Z(r), F(n);
		var i = V(n, 2), a = V(z(i));
		Z(a), F(i);
		var l = V(i, 2), u = V(z(l));
		Z(u), Q(u, "min", 1 / 60), F(l), je(2), H(() => {
			Si(r, U(o)), r.disabled = !U(E), Si(a, U(s)), a.disabled = !U(E), Si(u, U(c)), u.disabled = !U(E);
		}), G("input", r, (e) => te("day", e.currentTarget.value)), G("input", a, (e) => te("time", e.currentTarget.value)), G("input", u, (e) => te("hours", e.currentTarget.value)), q(e, t);
	}, Ee = (e) => {
		var n = ns(), r = B(n), i = z(r, !0), a = V(i);
		it(a), F(r);
		var o = V(r, 2), s = z(o);
		F(o), H(() => {
			J(i, t.model.kind === "outcomes" ? "Starting records" : "Content"), Q(a, "aria-label", t.model.kind === "outcomes" ? "Initial outcomes" : "Initial document content"), Si(a, U(u)), a.disabled = !U(E), Q(a, "placeholder", t.model.kind === "outcomes" ? "[]" : "Empty by default"), J(s, `Initial content only. Saved ${t.model.kind === "outcomes" ? "outcomes" : "notes"} stay unchanged.`);
		}), G("input", a, (e) => te("content", e.currentTarget.value)), q(e, n);
	};
	Y(we, (e) => {
		t.model.kind === "clock" ? e(Te) : e(Ee, -1);
	}), F(xe), F(ge);
	var De = V(ge, 2), N = z(De), Oe = V(z(N)), P = z(Oe);
	F(Oe), F(N);
	var ke = V(N, 2), Ae = z(ke), Me = z(Ae), Ne = z(Me, !0);
	F(Me);
	var Pe = V(Me, 2), Fe = (e) => {
		var n = rs(), r = z(n, !0);
		F(n), H((e) => {
			Q(n, "aria-label", U(w) + " source"), J(r, e);
		}, [() => t.model.sources.find((e) => e.value === t.model.targetId)?.label ?? t.model.name ?? t.model.targetId]), q(e, n);
	}, Ie = (e) => {
		var i = as();
		X(i, 21, () => t.model.sources, (e) => e.value, (e, i) => {
			var a = is(), o = z(a, !0);
			F(a), H(() => {
				Q(a, "data-workflow-source", U(i).value), Q(a, "aria-pressed", U(i).value === t.model.targetId), a.disabled = r() || !t.model.editable || !n().bindWorkflowData || !!U(_), J(o, U(i).label);
			}), G("click", a, () => ue(U(i).value)), q(e, a);
		}), F(i), H(() => Q(i, "aria-label", U(w) + " source")), q(e, i);
	}, Le = (e) => {
		var i = ss(), a = z(i), o = (e) => {
			var n = os(), r = z(n, !0);
			F(n);
			var i = {};
			H(() => {
				J(r, t.model.name || t.model.targetId), i !== (i = t.model.targetId) && (n.value = (n.__value = t.model.targetId) ?? "");
			}), q(e, n);
		}, s = /* @__PURE__ */ I(() => !t.model.sources.some((e) => e.value === t.model.targetId));
		Y(a, (e) => {
			U(s) && e(o);
		}), X(V(a), 17, () => t.model.sources, (e) => e.value, (e, t) => {
			var n = os(), r = z(n, !0);
			F(n);
			var i = {};
			H(() => {
				J(r, U(t).label), i !== (i = U(t).value) && (n.value = (n.__value = U(t).value) ?? "");
			}), q(e, n);
		}), F(i);
		var c;
		hi(i), H(() => {
			Q(i, "aria-label", U(w) + " source"), i.disabled = r() || !t.model.editable || !n().bindWorkflowData || !!U(_), c !== (c = t.model.targetId) && (i.value = (i.__value = t.model.targetId) ?? "", mi(i, t.model.targetId));
		}), G("change", i, (e) => ue(e.currentTarget.value)), q(e, i);
	};
	Y(Pe, (e) => {
		t.model.sources.length <= 1 ? e(Fe) : t.model.sources.length <= 3 ? e(Ie, 1) : e(Le, -1);
	});
	var Re = V(Pe, 2);
	F(Ae);
	var ze = V(Ae, 2), Be = (e) => {
		var t = cs(), n = z(t), r = V(z(n));
		Z(r), F(n);
		var i = V(n, 2), a = z(i), o = z(a, !0);
		F(a);
		var s = V(a);
		F(i), F(t), H((e) => {
			Q(r, "aria-label", "New " + U(T) + " name"), Si(r, U(g)), r.disabled = !!U(_), a.disabled = e, J(o, U(_) === "create" ? "Creating…" : "Create " + U(T)), s.disabled = !!U(_);
		}, [() => !U(g).trim() || !!U(_) || U(f) === "actor-private" && !U(p).trim()]), G("input", r, (e) => {
			R(g, e.currentTarget.value, !0);
		}), G("click", a, de), G("click", s, () => {
			R(h, !1), R(v, "");
		}), q(e, t);
	};
	Y(ze, (e) => {
		U(h) && e(Be);
	});
	var Ve = V(ze, 2), We = z(Ve, !0);
	F(Ve);
	var Ge = V(Ve, 4), Ke = (e) => {
		var t = ls(), n = B(t), r = V(z(n));
		X(r, 21, () => k, Kr, (e, t) => {
			var n = os(), r = z(n, !0);
			F(n);
			var i = {};
			H(() => {
				J(r, U(t).label), i !== (i = U(t).value) && (n.value = (n.__value = U(t).value) ?? "");
			}), q(e, n);
		}), F(r);
		var i;
		hi(r), F(n), je(), H(() => {
			r.disabled = !U(E), i !== (i = U(d)) && (r.value = (r.__value = U(d)) ?? "", mi(r, U(d)));
		}), G("change", r, (e) => ne(e.currentTarget.value)), q(e, t);
	}, qe = (e) => {
		var n = us(), r = B(n), i = V(z(r));
		F(r);
		var a = V(r), o = z(a, !0);
		F(a), H(() => {
			Q(i, "aria-label", U(w) + " format"), J(o, t.model.kind === "clock" ? "Required for clock data." : "Outcomes use a JSON list.");
		}), q(e, n);
	};
	Y(Ge, (e) => {
		t.model.kind === "notes" ? e(Ke) : e(qe, -1);
	});
	var Je = V(Ge, 2), Ye = V(Je, 2);
	X(Ye, 21, () => O, Kr, (e, t) => {
		var n = is(), r = z(n, !0);
		F(n), H(() => {
			Q(n, "data-workflow-visibility", U(t).value), Q(n, "aria-pressed", U(f) === U(t).value), n.disabled = !U(D), J(r, U(t).label);
		}), G("click", n, () => re(U(t).value)), q(e, n);
	}), F(Ye);
	var Xe = V(Ye, 2), Ze = (e) => {
		var t = ds(), n = V(z(t));
		Z(n), F(t), H(() => {
			Si(n, U(p)), n.disabled = !U(D);
		}), G("input", n, (e) => te("actor", e.currentTarget.value)), q(e, t);
	};
	Y(Xe, (e) => {
		U(f) === "actor-private" && e(Ze);
	});
	var Qe = V(Xe, 2), $e = (e) => {
		var t = fs(), n = V(z(t));
		Z(n), F(t), H(() => {
			Si(n, U(m)), n.disabled = !U(E);
		}), G("input", n, (e) => te("columns", e.currentTarget.value)), q(e, t);
	};
	Y(Qe, (e) => {
		U(d) === "csv" && e($e);
	});
	var et = V(Qe, 2), tt = V(z(et));
	Z(tt), F(et);
	var nt = V(et, 2), rt = (e) => {
		var i = ps(), a = B(i), o = V(z(a));
		Z(o), F(a);
		var s = V(a), c = V(z(s));
		Z(c), F(s), je(), H(() => {
			Si(o, U(l)), o.disabled = !U(E), Si(c, t.model.expectedCalendar ?? ""), c.disabled = r() || !t.model.editable || !n().editControl || !!U(_);
		}), G("input", o, (e) => te("calendar", e.currentTarget.value)), G("change", c, (e) => fe(e.currentTarget.value)), q(e, i);
	};
	Y(nt, (e) => {
		t.model.kind === "clock" && e(rt);
	}), F(ke), F(De);
	var at = V(De, 2), ot = z(at), st = z(ot, !0);
	F(ot), F(at);
	var ct = V(at, 2), lt = (e) => {
		q(e, ms());
	};
	Y(ct, (e) => {
		t.model.available || e(lt);
	});
	var ut = V(ct, 2), dt = (e) => {
		var n = hs(), r = z(n, !0);
		F(n), H(() => J(r, t.model.issue)), q(e, n);
	};
	Y(ut, (e) => {
		t.model.issue && e(dt);
	});
	var ft = V(ut, 2), pt = (e) => {
		var t = gs(), n = z(t, !0);
		F(t), H(() => J(n, U(v))), q(e, t);
	};
	Y(ft, (e) => {
		U(v) && e(pt);
	});
	var mt = V(ft, 2), ht = (e) => {
		var n = _s(), r = z(n, !0);
		F(n), H(() => J(r, U(y) || t.model.notice)), q(e, n);
	};
	Y(mt, (e) => {
		(U(y) || !U(b) && t.model.notice) && e(ht);
	}), F(pe), H((e, a, o) => {
		Q(pe, "data-workflow-data", t.model.kind), J(he, `Uses ${(t.model.name || t.model.targetId) ?? ""}`), ge.open = t.model.kind === "clock", J(ve, `${t.model.kind === "clock" ? "Starting values" : t.model.kind === "outcomes" ? "Initial outcomes" : "Initial content"} `), J(be, e), J(P, `${a ?? ""} · ${o ?? ""}`), J(Ne, U(w)), Q(Re, "aria-label", "Create separate " + U(T)), Q(Re, "title", "Create separate " + U(T)), Re.disabled = r() || !t.model.editable || !t.model.available || !n().createWorkflowData || !!U(_), J(We, t.model.kind === "clock" ? "Same clock: shared time. Different clocks: independent time." : t.model.kind === "outcomes" ? "Shared by nodes using these outcomes." : "Shared by nodes using this document."), Q(Je, "id", i() + "-visibility"), Q(Ye, "aria-labelledby", i() + "-visibility"), Q(tt, "aria-label", U(w) + " document ID"), Si(tt, t.model.targetId), ot.disabled = !U(se), J(st, U(_) === "save" ? "Saving…" : "Save settings");
	}, [
		() => t.model.kind === "clock" && U(a) ? "Day " + U(o) + " · " + U(s) : U(a) && !U(u).trim() ? "Empty by default" : U(a) ? t.model.kind === "outcomes" && U(u).trim() === "[]" ? "None" : "Initial template" : "Load initial values to edit",
		() => A(U(d)),
		() => j(U(f))
	]), G("click", Re, () => {
		!r() && t.model.editable && t.model.available && !U(_) && (R(h, !U(h)), R(g, ""), R(v, ""));
	}), G("click", ot, le), q(e, pe), Ue();
}
Tr([
	"click",
	"input",
	"change"
]);
//#endregion
//#region ui/NodeDetails.svelte
var bs = /* @__PURE__ */ K("<small data-canonical-title=\"\" class=\"svelte-59ntjv\"> </small>"), xs = /* @__PURE__ */ K("<p role=\"alert\" class=\"pc-detail-error svelte-59ntjv\"> </p>"), Ss = /* @__PURE__ */ K("<label class=\"svelte-59ntjv\">Workflow stage<select aria-label=\"Workflow stage\" class=\"svelte-59ntjv\"><option class=\"svelte-59ntjv\">Preparation · before Generate Reply</option><option class=\"svelte-59ntjv\">Response · after Generate Reply</option></select></label><!>", 1), Cs = /* @__PURE__ */ K("<span class=\"svelte-59ntjv\">Read-only body</span>"), ws = /* @__PURE__ */ K("<span class=\"pc-detail-blocked svelte-59ntjv\">Blocks run · Disabled</span>"), Ts = /* @__PURE__ */ K("<p class=\"pc-detail-state svelte-59ntjv\"><!><!></p>"), Es = /* @__PURE__ */ K("<p class=\"pc-detail-error svelte-59ntjv\" role=\"alert\"> </p>"), Ds = /* @__PURE__ */ K("<option class=\"svelte-59ntjv\"> </option>"), Os = /* @__PURE__ */ K("<fieldset class=\"pc-detail-group svelte-59ntjv\" data-boundary-controls=\"\"><legend class=\"svelte-59ntjv\"> </legend> <label class=\"svelte-59ntjv\">Type<select aria-label=\"Subgraph port type\" class=\"svelte-59ntjv\"></select></label> <label class=\"pc-detail-check svelte-59ntjv\"><input aria-label=\"Required subgraph port\" type=\"checkbox\" class=\"svelte-59ntjv\"/> Required</label> <div class=\"pc-detail-actions svelte-59ntjv\"><button type=\"button\" data-save-boundary=\"\" class=\"svelte-59ntjv\"> </button></div> <small class=\"svelte-59ntjv\">Labels appear on the subgraph block. Disconnect incompatible connections before changing the type. Deleting this node removes its port and attached connections.</small> <!></fieldset>"), ks = /* @__PURE__ */ K("<p role=\"status\" class=\"svelte-59ntjv\">Loading file…</p>"), As = /* @__PURE__ */ K("<div data-file-input-controls=\"\" class=\"svelte-59ntjv\"><label class=\"svelte-59ntjv\"> <input type=\"file\" accept=\".txt,.md,.json,text/plain,text/markdown,application/json\" class=\"svelte-59ntjv\"/></label> <p class=\"svelte-59ntjv\"> </p> <small class=\"svelte-59ntjv\">The file's UTF-8 text is embedded in this workflow. Runs use the saved snapshot; replace the file to refresh it.</small> <small class=\"svelte-59ntjv\">Choose a .txt, .md or .json file up to 400,000 bytes and 100,000 UTF-16 code units.</small> <!> <!></div>"), js = /* @__PURE__ */ K("<details class=\"pc-detail-group svelte-59ntjv\"><summary class=\"svelte-59ntjv\"> </summary> <!></details>"), Ms = /* @__PURE__ */ K("<!> <fieldset class=\"pc-detail-group pc-detail-main svelte-59ntjv\" data-operation-controls=\"\"><!> <!></fieldset> <!>", 1), Ns = /* @__PURE__ */ K("<label class=\"svelte-59ntjv\">Model identifier<input class=\"svelte-59ntjv\"/></label>"), Ps = /* @__PURE__ */ K("<small class=\"svelte-59ntjv\"> </small>"), Fs = /* @__PURE__ */ K("<fieldset class=\"svelte-59ntjv\"><legend class=\"svelte-59ntjv\"> </legend> <label class=\"svelte-59ntjv\">Connection profile<select class=\"svelte-59ntjv\"><option class=\"svelte-59ntjv\">Use helper connection</option><!><!></select></label> <label class=\"svelte-59ntjv\">Model mode<select class=\"svelte-59ntjv\"></select></label> <!> <small class=\"svelte-59ntjv\"> </small><small class=\"svelte-59ntjv\"> </small><!> <!></fieldset>"), Is = /* @__PURE__ */ K("<small class=\"svelte-59ntjv\">This helper has no text model calls to configure.</small>"), Ls = /* @__PURE__ */ K("<details class=\"pc-detail-group svelte-59ntjv\" data-helper-model-controls=\"\" open=\"\"><summary class=\"svelte-59ntjv\">Helper model bindings</summary> <small class=\"svelte-59ntjv\">Choose connections for inherited text model roles in the pinned helper. Explicit helper-node bindings take precedence. These selections belong to this For Each node.</small> <!> <!></details>"), Rs = /* @__PURE__ */ K("<label class=\"svelte-59ntjv\">Model identifier<input aria-label=\"Model identifier\" class=\"svelte-59ntjv\"/></label>"), zs = /* @__PURE__ */ K("<!> <details class=\"pc-detail-group svelte-59ntjv\" data-model-controls=\"\"><summary class=\"svelte-59ntjv\">Advanced model settings</summary> <button type=\"button\" data-reset-profile=\"\" class=\"svelte-59ntjv\"> </button> <small class=\"svelte-59ntjv\">Choose a connection with the bar under this node. Reset removes this node's connection override.</small> <label class=\"svelte-59ntjv\">Model mode<select aria-label=\"Model mode\" class=\"svelte-59ntjv\"></select></label> <!> <label class=\"svelte-59ntjv\">Model role<input aria-label=\"Model role\" class=\"svelte-59ntjv\"/></label> <!><!> <!></details>", 1), Bs = /* @__PURE__ */ K("<p class=\"pc-detail-port svelte-59ntjv\"> <small class=\"svelte-59ntjv\"> </small></p>"), Vs = /* @__PURE__ */ K("<details class=\"pc-detail-group svelte-59ntjv\"><summary class=\"svelte-59ntjv\">Inputs and outputs</summary><!></details>"), Hs = /* @__PURE__ */ K("<p role=\"status\" class=\"svelte-59ntjv\"> </p>"), Us = /* @__PURE__ */ K("<header class=\"svelte-59ntjv\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-59ntjv\"><path class=\"svelte-59ntjv\"></path></svg> <div class=\"pc-detail-identity svelte-59ntjv\"><input class=\"pc-detail-name svelte-59ntjv\" aria-label=\"Node name\"/> <!> <small class=\"svelte-59ntjv\"> </small></div></header> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>", 1), Ws = /* @__PURE__ */ K("<p class=\"pc-detail-empty svelte-59ntjv\">Select a node to inspect its settings.</p>"), Gs = /* @__PURE__ */ K("<section class=\"pc-node-details svelte-59ntjv\" aria-label=\"Node details\"><!></section>");
function Ks(e, t) {
	He(t, !0);
	let n = (e, n = d) => {
		{
			let s = /* @__PURE__ */ I(() => U(a)[n().key]?.text ?? k(n())), c = /* @__PURE__ */ I(() => U(a)[n().key]?.error || U(o)[n().key] || ""), l = /* @__PURE__ */ I(() => !!t.view?.readOnly || !r().editControl), u = /* @__PURE__ */ I(() => !!U(a)[n().key]?.pending), d = /* @__PURE__ */ I(() => i() + "-" + n().key);
			jo(e, {
				get control() {
					return n();
				},
				get text() {
					return U(s);
				},
				get error() {
					return U(c);
				},
				get disabled() {
					return U(l);
				},
				get pending() {
					return U(u);
				},
				get idPrefix() {
					return U(d);
				},
				ontext: (e) => te(n(), e),
				onvalue: (e) => re(n(), e),
				onnumber: (e) => ie(n(), e),
				onsave: () => ne(n())
			});
		}
	}, r = Mi(t, "actions", 19, () => ({})), i = Mi(t, "idPrefix", 3, "pc-node-details"), a = /* @__PURE__ */ L(en({})), o = /* @__PURE__ */ L(en({})), s = "", c = "", l = "", u = 0, f = 0, p = 0, h = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ L(!1), _ = 0, v = 0, y = 0, b = /* @__PURE__ */ new Map(), x = /* @__PURE__ */ new Map(), S = /* @__PURE__ */ new Map(), C = (e) => Object.fromEntries(Object.entries(e).map(([e, t]) => [e, {
		...t,
		pending: !1
	}]));
	function w(e, t) {
		return t ? Object.fromEntries(Object.entries(C(e)).flatMap(([e, n]) => {
			if (e.startsWith("[\"helper-binding\",")) {
				let r = JSON.parse(e);
				return t.helperBindings?.roles.find((e) => e.role === r[1]) && r[2] === "model" && t.helperBindings?.editable && n.helperKey === t.helperBindings.helperKey ? [[e, n]] : [];
			}
			if (e === "model") return (t.model?.model)?.allowedModes.some((e) => e.value === "override") ? [[e, n]] : [];
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
	Pi(() => {
		E = !1, h.clear(), S.clear(), x.clear(), b.clear();
	}), Sn(() => {
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
		(i || n !== c || r !== l) && ((i || r !== l) && (f++, y++), i && (p++, s && S.set(s, gr(() => C(U(a))))), s = e, c = n, l = r, h.clear(), u++, R(o, {}, !0), R(g, !1), v++, R(a, w(i ? S.get(e) ?? {} : gr(() => U(a)), t.view), !0));
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
		if (t === "model") return (e.model?.model)?.allowedModes.some((e) => e.value === "override") ? JSON.stringify([
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
	function j(e) {
		let t = (x.get(e) ?? 0) + 1;
		return x.set(e, t), t;
	}
	async function M(e, n, r) {
		let i = t.view;
		if (!i || (n ? !i.canPresent : e === "profileId" || e === "model" ? !ge(i) : i.readOnly)) return;
		let s = D(i), c = ++u, l = p, d = A(i, e), f = U(a)[e] && d ? j(e) : null;
		h.set(e, c), R(o, {
			...U(o),
			[e]: ""
		}, !0), U(a)[e] && R(a, {
			...U(a),
			[e]: {
				...U(a)[e],
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
		if (g && f !== null && U(a)[e] && E && t.view && p === l && T(t.view) === T(s) && x.get(e) === f && A(t.view, e) === d) {
			let t = { ...U(a) };
			delete t[e], R(a, t, !0);
		}
		if (O(s) && h.get(e) === c && (h.delete(e), R(o, {
			...U(o),
			[e]: m
		}, !0), U(a)[e])) {
			if (m) R(a, {
				...U(a),
				[e]: {
					...U(a)[e],
					error: m,
					pending: !1
				}
			}, !0);
			else {
				let t = { ...U(a) };
				delete t[e], R(a, t, !0);
			}
		}
	}
	function ee(e) {
		let n = e.files?.[0];
		e.value = "", n && t.view?.fileInput && !t.view.readOnly && r().loadFile && !U(a).fileInput?.pending && (R(a, {
			...U(a),
			fileInput: {
				text: "",
				error: "",
				pending: !1
			}
		}, !0), M("fileInput", !1, (e) => r().loadFile(e, n)));
	}
	function te(e, n) {
		t.view && !t.view.readOnly && (j(e.key), h.delete(e.key), R(a, {
			...U(a),
			[e.key]: {
				text: n,
				error: "",
				pending: !1,
				editor: e.editor,
				representation: e.representation
			}
		}, !0), R(o, {
			...U(o),
			[e.key]: ""
		}, !0));
	}
	function ne(e) {
		if (!t.view || t.view.readOnly || !r().editControl) return;
		let n = U(a)[e.key]?.text ?? k(e), i = n;
		if (e.editor === "json") try {
			if (!(e.representation === "json-text" && e.allowEmpty && n.trim() === "")) {
				let t = JSON.parse(n);
				e.representation !== "json-text" && (i = t);
			}
		} catch {
			R(a, {
				...U(a),
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
		M(e.key, !1, (t) => r().editControl(t, e.key, i));
	}
	function re(e, t) {
		r().editControl && M(e.key, !1, (n) => r().editControl(n, e.key, t));
	}
	function ie(e, n) {
		if (!t.view || t.view.readOnly || !r().editControl) return;
		let i = Number(n.value);
		!n.value.trim() || !Number.isFinite(i) ? R(o, {
			...U(o),
			[e.key]: "Enter a finite number before saving."
		}, !0) : n.validity.valid ? re(e, i) : R(o, {
			...U(o),
			[e.key]: "Enter a number within the allowed range and step."
		}, !0);
	}
	let ae = (e, t) => JSON.stringify([
		"helper-binding",
		e,
		t
	]), oe = (e) => t.view?.helperBindings?.roles.find((t) => t.role === e), se = () => !!t.view?.helperBindings?.editable && !t.view.readOnly && !!r().editHelperBinding, ce = (e, t) => se() && oe(e)?.[t === "profileId" ? "profile" : "model"].editable !== !1, le = (e) => U(a)[ae(e, "model")] ? "override" : oe(e)?.model.mode;
	function ue(e, t, n, i) {
		ce(e, t) && oe(e) && M(ae(e, t), !1, (a) => r().editHelperBinding(a, e, t, n, i));
	}
	function de(e, n) {
		if (!ce(e, "model") || !oe(e)) return;
		let r = ae(e, "model");
		j(r), h.delete(r), R(a, {
			...U(a),
			[r]: {
				text: n,
				error: "",
				pending: !1,
				helperKey: t.view?.helperBindings?.helperKey
			}
		}, !0), R(o, {
			...U(o),
			[r]: ""
		}, !0);
	}
	function fe(e, t) {
		let n = oe(e);
		if (!ce(e, "model") || !n?.model.allowedModes.some((e) => e.value === t)) return;
		let r = ae(e, "model");
		if (t === "override") {
			de(e, U(a)[r]?.text ?? n.model.value ?? "");
			return;
		}
		h.delete(r);
		let i = { ...U(a) };
		delete i[r], R(a, i, !0), R(o, {
			...U(o),
			[r]: ""
		}, !0), t !== n.model.mode && ue(e, "model", t, null);
	}
	function pe(e, t) {
		if (!ce(e, "model") || le(e) !== "override") return;
		de(e, t);
		let n = ae(e, "model");
		!t.trim() || t.length > 256 ? R(o, {
			...U(o),
			[n]: "Enter a model identifier of 1–256 characters."
		}, !0) : ue(e, "model", "override", t);
	}
	function me(e, t, n) {
		he(e)?.allowedModes.some((e) => e.value === t) && r().editBinding && M(e, !1, (i) => r().editBinding(i, e, t, n));
	}
	let he = (e) => e === "profileId" ? t.view?.model?.profile : t.view?.model?.model, ge = (e = t.view) => !!e?.model && (e.model.editable ?? !e.readOnly) && !!r().editBinding, _e = (e) => U(a)[e] ? "override" : he(e)?.mode, ve = (e) => U(a)[e]?.text ?? he(e)?.value ?? "", ye = () => t.view?.model?.profile.mode === "override" || !!t.view?.model?.profileDefaultModel;
	function be(e, t) {
		ge() && he(e)?.allowedModes.some((e) => e.value === "override") && (j(e), h.delete(e), R(a, {
			...U(a),
			[e]: {
				text: t,
				error: "",
				pending: !1
			}
		}, !0), R(o, {
			...U(o),
			[e]: ""
		}, !0));
	}
	function xe(e, t) {
		let n = he(e);
		if (!ge() || !n?.allowedModes.some((e) => e.value === t)) return;
		if (t === "override") {
			be(e, ve(e));
			return;
		}
		h.delete(e);
		let r = { ...U(a) };
		delete r[e], R(a, r, !0), R(o, {
			...U(o),
			[e]: ""
		}, !0), t !== n.mode && me(e, t, null);
	}
	function Se(e, n) {
		if (ge() && (e !== "model" || _e(e) === "override") && he(e)?.allowedModes.some((e) => e.value === "override")) {
			if (be(e, n), !n.trim()) {
				let r = t.view?.readOnly ? "block" : "inherit";
				if (e === "model" && ye() && he(e)?.allowedModes.some((e) => e.value === r)) {
					xe(e, r);
					return;
				}
				R(a, {
					...U(a),
					[e]: {
						text: n,
						error: "Enter a model identifier before saving an override.",
						pending: !1
					}
				}, !0);
			} else me(e, "override", n);
		}
	}
	let Ce = () => !!t.view?.modifiers?.editable && !t.view.readOnly && !!r().editModifiers, we = () => JSON.parse(JSON.stringify(t.view?.modifiers?.items ?? []));
	function Te(e) {
		let t = U(a)["modifier:" + e.id];
		if (t) try {
			return JSON.parse(t.text);
		} catch {}
		return e.settings;
	}
	let Ee = () => Object.fromEntries((t.view?.modifiers?.items ?? []).map((e) => {
		let t = U(a)["modifier:" + e.id];
		return [e.id, {
			settings: Te(e),
			error: t?.error || U(o)["modifier:" + e.id] || "",
			pending: !!t?.pending,
			dirty: !!t
		}];
	}));
	function De(e) {
		if (!Ce() || U(g) || e.length > 16 || !r().editModifiers) return;
		let t = ++v;
		R(g, !0), M("modifiers", !1, (t) => r().editModifiers(t, e)).finally(() => {
			t === v && R(g, !1);
		});
	}
	function N(e) {
		if (!Ce() || !t.view?.modifiers || t.view.modifiers.items.length >= 16) return;
		let n = t.view.modifiers.options.find((t) => t.type === e);
		if (!n) return;
		let r = we(), i;
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
		if (!Ce() || !t.view?.modifiers || !t.view.modifiers.options.some((t) => t.type === e)) return;
		let r = we();
		r.some((t) => t.type === e) ? De(r.map((t) => t.type === e ? {
			...t,
			enabled: n
		} : t)) : n && N(e);
	}
	function P(e, n) {
		Ce() && t.view?.modifiers?.items.some((t) => t.id === e) && De(we().map((t) => t.id === e ? {
			...t,
			enabled: n
		} : t));
	}
	function ke(e) {
		Ce() && t.view?.modifiers?.items.some((t) => t.id === e) && De(we().filter((t) => t.id !== e));
	}
	function Ae(e, t) {
		if (!Ce()) return;
		let n = we(), r = n.findIndex((t) => t.id === e), i = r + t;
		r < 0 || i < 0 || i >= n.length || ([n[r], n[i]] = [n[i], n[r]], De(n));
	}
	function Me(e, n, r) {
		if (!Ce()) return;
		let i = t.view?.modifiers?.items.find((t) => t.id === e), s = t.view?.modifiers?.options.find((e) => e.type === i?.type);
		if (!i || !s?.fields.some((e) => e.key === n)) return;
		let c = "modifier:" + e;
		b.set(c, (b.get(c) ?? 0) + 1), h.delete(c), R(o, {
			...U(o),
			[c]: ""
		}, !0), R(a, {
			...U(a),
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
		if (!n || !U(a)[i] || U(a)[i].pending) return;
		let o = (b.get(i) ?? 0) + 1, s = y, c = n.type;
		b.set(i, o);
		let l = Te(n), u = we().map((t) => t.id === e ? {
			...t,
			settings: l
		} : t);
		M(i, !1, async (n) => {
			let l = await r().editModifiers(n, u);
			if (l.ok && E && t.view && T(t.view) === T(n) && y === s && b.get(i) === o && t.view.modifiers?.items.some((t) => t.id === e && t.type === c)) {
				let e = { ...U(a) };
				delete e[i], R(a, e, !0);
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
	}, Fe = (e) => e.some((e) => !!(U(a)[e.key]?.error || U(o)[e.key]));
	function Ie(e) {
		t.view && !t.view.boundary && r().present && M("alias", !0, (n) => r().present(n, "alias", e === t.view?.canonicalTitle ? "" : e));
	}
	function Le() {
		return {
			label: U(a).boundary?.text ?? t.view?.boundary?.label ?? "",
			artifactKind: U(a).boundary?.artifactKind ?? t.view?.boundary?.kind ?? "",
			required: U(a).boundary?.required ?? t.view?.boundary?.required ?? !1
		};
	}
	function Re(e, n) {
		if (!t.view?.boundary || t.view.readOnly || !r().editInterface || e === "artifactKind" && !t.view.boundary.kinds.includes(String(n))) return;
		let i = {
			...Le(),
			[e]: n
		};
		f++, h.delete("boundary"), R(o, {
			...U(o),
			boundary: ""
		}, !0), R(a, {
			...U(a),
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
	function ze() {
		if (!t.view?.boundary || t.view.readOnly || !r().editInterface || U(a).boundary?.pending) return;
		let e = t.view.boundary.id, n = Le();
		if (!n.label.trim() || !t.view.boundary.kinds.includes(n.artifactKind)) return;
		let i = ++f;
		R(a, {
			...U(a),
			boundary: {
				text: n.label,
				artifactKind: n.artifactKind,
				required: n.required,
				error: "",
				pending: !1,
				boundaryId: e,
				boundaryDirection: t.view.boundary.direction
			}
		}, !0), M("boundary", !1, async (o) => {
			let s = await r().editInterface(o, {
				kind: "update",
				id: e,
				...n
			});
			if (s.ok && E && t.view?.boundary?.id === e && T(t.view) === T(o) && f === i) {
				let e = { ...U(a) };
				delete e.boundary, R(a, e, !0);
			}
			return s;
		});
	}
	var Be = Gs(), Ve = z(Be), We = (e) => {
		var s = Us(), c = B(s);
		let l;
		var u = z(c), d = z(u);
		F(u);
		var f = V(u, 2), p = z(f);
		Z(p);
		var h = V(p, 2), _ = (e) => {
			var n = bs(), r = z(n);
			F(n), H(() => J(r, `Canonical type: ${t.view.canonicalTitle ?? ""}`)), q(e, n);
		};
		Y(h, (e) => {
			!t.view.boundary && (t.view.alias || t.view.title || t.view.canonicalTitle) !== t.view.canonicalTitle && e(_);
		});
		var v = V(h, 2), y = z(v, !0);
		F(v), F(f), F(c);
		var b = V(c, 2), x = (e) => {
			var n = Ss(), i = B(n), a = V(z(i)), s = z(a);
			s.value = s.__value = "pre";
			var c = V(s);
			c.value = c.__value = "post", F(a);
			var l;
			hi(a), F(i);
			var u = V(i), d = (e) => {
				var t = xs(), n = z(t, !0);
				F(t), H(() => J(n, U(o).phase)), q(e, t);
			};
			Y(u, (e) => {
				U(o).phase && e(d);
			}), H(() => {
				a.disabled = t.view.readOnly || !r().editPhase, l !== (l = t.view.phase) && (a.value = (a.__value = t.view.phase) ?? "", mi(a, t.view.phase));
			}), G("change", a, (e) => {
				let t = e.currentTarget.value;
				M("phase", !1, (e) => r().editPhase(e, t));
			}), q(e, n);
		};
		Y(b, (e) => {
			t.view.phaseEditable && e(x);
		});
		var S = V(b, 2), C = (e) => {
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
				Lo(e, {
					get view() {
						return t.view.recall;
					},
					get actions() {
						return U(n);
					}
				});
			}
		};
		Y(S, (e) => {
			t.view.recall && e(C);
		});
		var w = V(S, 2), T = (e) => {
			var n = Ts(), r = z(n), i = (e) => {
				q(e, Cs());
			};
			Y(r, (e) => {
				t.view.readOnly && e(i);
			});
			var a = V(r), o = (e) => {
				q(e, ws());
			};
			Y(a, (e) => {
				t.view.enabled || e(o);
			}), F(n), q(e, n);
		};
		Y(w, (e) => {
			(t.view.readOnly || !t.view.enabled) && e(T);
		});
		var E = V(w, 2), O = (e) => {
			var t = Es(), n = z(t, !0);
			F(t), H(() => J(n, U(o).alias)), q(e, t);
		};
		Y(E, (e) => {
			U(o).alias && e(O);
		});
		var k = V(E, 2), A = (e) => {
			var n = Os(), i = z(n), s = z(i);
			F(i);
			var c = V(i, 2), l = V(z(c));
			X(l, 21, () => t.view.boundary.kinds, Kr, (e, t) => {
				var n = Ds(), r = z(n, !0);
				F(n);
				var i = {};
				H(() => {
					J(r, U(t)), i !== (i = U(t)) && (n.value = (n.__value = U(t)) ?? "");
				}), q(e, n);
			}), F(l);
			var u;
			hi(l), F(c);
			var d = V(c, 2), f = z(d);
			Z(f), je(), F(d);
			var p = V(d, 2), m = z(p), h = z(m, !0);
			F(m), F(p);
			var g = V(p, 4), _ = (e) => {
				var t = Es(), n = z(t, !0);
				F(t), H(() => J(n, U(a).boundary?.error || U(o).boundary)), q(e, t);
			};
			Y(g, (e) => {
				(U(a).boundary?.error || U(o).boundary) && e(_);
			}), F(n), H((e, n, i) => {
				J(s, `Subgraph ${t.view.boundary.direction ?? ""}`), l.disabled = t.view.readOnly || !r().editInterface, u !== (u = e) && (l.value = (l.__value = e) ?? "", mi(l, e)), Ci(f, n), f.disabled = t.view.readOnly || !r().editInterface, m.disabled = i, J(h, U(a).boundary?.pending ? "Validating…" : "Save port");
			}, [
				() => Le().artifactKind,
				() => Le().required,
				() => t.view.readOnly || !r().editInterface || !Le().label.trim() || !!U(a).boundary?.pending
			]), G("change", l, (e) => Re("artifactKind", e.currentTarget.value)), G("change", f, (e) => Re("required", e.currentTarget.checked)), G("click", m, () => ze()), q(e, n);
		};
		Y(k, (e) => {
			t.view.boundary && e(A);
		});
		var j = V(k, 2), te = (e) => {
			var s = Ms(), c = B(s), l = (e) => {
				{
					let n = /* @__PURE__ */ I(() => D(t.view)), a = /* @__PURE__ */ I(() => i() + "-workflow-data");
					ys(e, {
						get model() {
							return t.view.workflowData;
						},
						get selection() {
							return U(n);
						},
						get actions() {
							return r();
						},
						get disabled() {
							return t.view.readOnly;
						},
						get idPrefix() {
							return U(a);
						}
					});
				}
			};
			Y(c, (e) => {
				t.view.workflowData && e(l);
			});
			var u = V(c, 2), d = z(u), f = (e) => {
				var n = As(), s = z(n), c = z(s, !0), l = V(c);
				F(s);
				var u = V(s, 2), d = z(u, !0);
				F(u);
				var f = V(u, 6), p = (e) => {
					q(e, ks());
				};
				Y(f, (e) => {
					U(a).fileInput?.pending && e(p);
				});
				var m = V(f, 2), h = (e) => {
					var t = Es(), n = z(t, !0);
					F(t), H(() => {
						Q(t, "id", i() + "-error-fileInput"), J(n, U(o).fileInput);
					}), q(e, t);
				};
				Y(m, (e) => {
					U(o).fileInput && e(h);
				}), F(n), H(() => {
					J(c, t.view.fileInput.loaded ? "Replace file" : "Choose file"), Q(l, "aria-label", t.view.fileInput.loaded ? "Replace file" : "Choose file"), l.disabled = t.view.readOnly || !r().loadFile || !!U(a).fileInput?.pending, Q(l, "aria-invalid", !!U(o).fileInput), Q(l, "aria-describedby", U(o).fileInput ? i() + "-error-fileInput" : void 0), J(d, t.view.fileInput.loaded ? "Loaded file: " + t.view.fileInput.fileName : "No file loaded.");
				}), G("change", l, (e) => ee(e.currentTarget)), q(e, n);
			};
			Y(d, (e) => {
				t.view.fileInput && e(f);
			}), X(V(d, 2), 17, () => Pe().filter(([e]) => e === "Main"), ([e, t]) => e, (e, t) => {
				var r = /* @__PURE__ */ I(() => m(U(t), 2));
				let i = () => U(r)[1];
				var a = Ir();
				X(B(a), 17, i, (e) => e.key, (e, t) => {
					n(e, () => U(t));
				}), q(e, a);
			}), F(u), X(V(u, 2), 17, () => Pe().filter(([e]) => e !== "Main"), ([e, t]) => e, (e, t) => {
				var r = /* @__PURE__ */ I(() => m(U(t), 2));
				let i = () => U(r)[0], a = () => U(r)[1];
				var o = js(), s = z(o), c = z(s, !0);
				F(s), X(V(s, 2), 17, a, (e) => e.key, (e, t) => {
					n(e, () => U(t));
				}), F(o), H((e) => {
					Q(o, "data-control-group", i()), o.open = e, J(c, i());
				}, [() => Fe(a())]), q(e, o);
			}), q(e, s);
		};
		Y(j, (e) => {
			t.view.boundary || e(te);
		});
		var ne = V(j, 2), re = (e) => {
			var n = Ls(), r = V(z(n), 4);
			X(r, 17, () => t.view.helperBindings.roles, (e) => e.role, (e, t) => {
				var n = Fs(), r = z(n), i = z(r, !0);
				F(r);
				var s = V(r, 2), c = V(z(s)), l = z(c);
				l.value = l.__value = "";
				var u = V(l), d = (e) => {
					var n = Ds(), r = z(n);
					F(n);
					var i = {};
					H(() => {
						J(r, `Unavailable connection · ${U(t).profile.value ?? ""}`), i !== (i = U(t).profile.value) && (n.value = (n.__value = U(t).profile.value) ?? "");
					}), q(e, n);
				}, f = /* @__PURE__ */ I(() => U(t).profile.value && !(U(t).profile.options ?? []).some((e) => e.value === U(t).profile.value));
				Y(u, (e) => {
					U(f) && e(d);
				}), X(V(u), 17, () => U(t).profile.options ?? [], (e) => e.value, (e, t) => {
					var n = Ds(), r = z(n, !0);
					F(n);
					var i = {};
					H(() => {
						J(r, U(t).label), i !== (i = U(t).value) && (n.value = (n.__value = U(t).value) ?? "");
					}), q(e, n);
				}), F(c);
				var p;
				hi(c), F(s);
				var m = V(s, 2), h = V(z(m));
				X(h, 21, () => U(t).model.allowedModes, (e) => e.value, (e, t) => {
					var n = Ds(), r = z(n, !0);
					F(n);
					var i = {};
					H(() => {
						J(r, U(t).label), i !== (i = U(t).value) && (n.value = (n.__value = U(t).value) ?? "");
					}), q(e, n);
				}), F(h);
				var g;
				hi(h), F(m);
				var _ = V(m, 2), v = (e) => {
					var n = Ns(), r = V(z(n));
					Z(r), F(n), H((e, n) => {
						Q(r, "aria-label", U(t).role + " model identifier"), Si(r, e), r.disabled = n;
					}, [() => U(a)[ae(U(t).role, "model")]?.text ?? U(t).model.value ?? "", () => !ce(U(t).role, "model")]), G("input", r, (e) => de(U(t).role, e.currentTarget.value)), G("change", r, (e) => pe(U(t).role, e.currentTarget.value)), q(e, n);
				}, y = /* @__PURE__ */ I(() => le(U(t).role) === "override");
				Y(_, (e) => {
					U(y) && e(v);
				});
				var b = V(_, 2), x = z(b);
				F(b);
				var S = V(b), C = z(S, !0);
				F(S);
				var w = V(S), T = (e) => {
					var n = Ps(), r = z(n, !0);
					F(n), H(() => J(r, U(t).caveat)), q(e, n);
				};
				Y(w, (e) => {
					U(t).caveat && e(T);
				});
				var E = V(w, 2), D = (e) => {
					var n = Es(), r = z(n, !0);
					F(n), H((e) => J(r, e), [() => U(o)[ae(U(t).role, "profileId")] || U(o)[ae(U(t).role, "model")]]), q(e, n);
				}, O = /* @__PURE__ */ I(() => U(o)[ae(U(t).role, "profileId")] || U(o)[ae(U(t).role, "model")]);
				Y(E, (e) => {
					U(O) && e(D);
				}), F(n), H((e, n, r) => {
					J(i, U(t).label), Q(c, "aria-label", U(t).role + " connection profile"), c.disabled = e, p !== (p = U(t).profile.value ?? "") && (c.value = (c.__value = U(t).profile.value ?? "") ?? "", mi(c, U(t).profile.value ?? "")), Q(h, "aria-label", U(t).role + " model mode"), h.disabled = n, g !== (g = r) && (h.value = (h.__value = r) ?? "", mi(h, r)), J(x, `Effective connection: ${U(t).effective ?? ""}`), J(C, U(t).source);
				}, [
					() => !ce(U(t).role, "profileId"),
					() => !ce(U(t).role, "model"),
					() => le(U(t).role)
				]), G("change", c, (e) => ue(U(t).role, "profileId", e.currentTarget.value ? "override" : "inherit", e.currentTarget.value || null)), G("change", h, (e) => fe(U(t).role, e.currentTarget.value)), q(e, n);
			});
			var i = V(r, 2), s = (e) => {
				var n = Es(), r = z(n, !0);
				F(n), H(() => J(r, t.view.helperBindings.issue)), q(e, n);
			}, c = (e) => {
				q(e, Is());
			};
			Y(i, (e) => {
				t.view.helperBindings.issue ? e(s) : t.view.helperBindings.roles.length || e(c, 1);
			}), F(n), q(e, n);
		};
		Y(ne, (e) => {
			t.view.helperBindings && e(re);
		});
		var ie = V(ne, 2), oe = (e) => {
			var n = zs(), i = B(n), s = (e) => {
				var n = Es(), r = z(n, !0);
				F(n), H(() => J(r, t.view.model.issue)), q(e, n);
			};
			Y(i, (e) => {
				t.view.model.issue && e(s);
			});
			var c = V(i, 2), l = V(z(c), 2), u = z(l, !0);
			F(l);
			var d = V(l, 4), f = V(z(d));
			X(f, 21, () => t.view.model.model.allowedModes, (e) => e.value, (e, n) => {
				var r = Ds(), i = z(r, !0);
				F(r);
				var a = {};
				H((e) => {
					J(i, e), a !== (a = U(n).value) && (r.value = (r.__value = U(n).value) ?? "");
				}, [() => U(n).value === "inherit" && !t.view.readOnly ? ye() || !t.view.model.model.effectiveValue ? "Use profile model" : "Existing role model" : U(n).label]), q(e, r);
			}), F(f);
			var p;
			hi(f), F(d);
			var m = V(d, 2), h = (e) => {
				var t = Rs(), n = V(z(t));
				Z(n), F(t), H((e, t) => {
					Si(n, e), n.disabled = t;
				}, [() => ve("model"), () => !ge()]), G("input", n, (e) => be("model", e.currentTarget.value)), G("change", n, (e) => Se("model", e.currentTarget.value)), q(e, t);
			}, g = /* @__PURE__ */ I(() => _e("model") === "override");
			Y(m, (e) => {
				U(g) && e(h);
			});
			var _ = V(m, 2), v = V(z(_));
			Z(v), F(_);
			var y = V(_, 2), b = (e) => {
				var n = Ps(), r = z(n);
				F(n), H(() => J(r, `Effective connection: ${t.view.model.effective ?? ""}`)), q(e, n);
			}, x = /* @__PURE__ */ I(() => !t.view.model.issue || t.view.model.effective.trim() !== t.view.model.issue.trim());
			Y(y, (e) => {
				U(x) && e(b);
			});
			var S = V(y), C = (e) => {
				var n = Ps(), r = z(n, !0);
				F(n), H(() => J(r, t.view.model.source)), q(e, n);
			};
			Y(S, (e) => {
				t.view.model.source && e(C);
			});
			var w = V(S, 2), T = (e) => {
				var t = Es(), n = z(t, !0);
				F(t), H(() => J(n, U(o).modelRole || U(o).profileId || U(a).model?.error || U(o).model)), q(e, t);
			};
			Y(w, (e) => {
				(U(o).modelRole || U(o).profileId || U(a).model?.error || U(o).model) && e(T);
			}), F(c), H((e, n, i) => {
				l.disabled = e, J(u, t.view.readOnly ? "Use definition connection" : "Use inherited connection"), f.disabled = n, p !== (p = i) && (f.value = (f.__value = i) ?? "", mi(f, i)), Si(v, t.view.model.role), v.disabled = t.view.readOnly || !t.view.model.roleEditable || !r().editField;
			}, [
				() => !ge() || t.view.model.profile.mode === "inherit" || !t.view.model.profile.allowedModes.some((e) => e.value === "inherit"),
				() => !ge(),
				() => _e("model")
			]), G("click", l, () => me("profileId", "inherit", null)), G("change", f, (e) => xe("model", e.currentTarget.value)), G("change", v, (e) => {
				let n = e.currentTarget.value;
				t.view?.model?.roleEditable && r().editField && M("modelRole", !1, (e) => r().editField(e, "modelRole", n));
			}), q(e, n);
		};
		Y(ie, (e) => {
			t.view.model && e(oe);
		});
		var se = V(ie, 2), he = (e) => {
			var n = Vs();
			X(V(z(n)), 17, () => t.view.ports, (e) => e.direction + ":" + e.id, (e, t) => {
				var n = Bs(), r = z(n), i = V(r), a = z(i, !0);
				F(i), F(n), H(() => {
					J(r, `${U(t).direction === "input" ? "In" : "Out"} · ${U(t).label ?? ""}`), J(a, U(t).kind);
				}), q(e, n);
			}), F(n), q(e, n);
		};
		Y(se, (e) => {
			t.view.ports.length && e(he);
		});
		var we = V(se, 2), Te = (e) => {
			var n = Hs(), r = z(n, !0);
			F(n), H(() => J(r, t.view.status)), q(e, n);
		};
		Y(we, (e) => {
			t.view.status && e(Te);
		});
		var De = V(we, 2);
		X(De, 17, () => t.view.issues ?? [], Kr, (e, t) => {
			var n = Es(), r = z(n, !0);
			F(n), H(() => J(r, U(t))), q(e, n);
		});
		var Be = V(De, 2), Ve = (e) => {
			{
				let n = /* @__PURE__ */ I(() => !Ce()), r = /* @__PURE__ */ I(Ee), a = /* @__PURE__ */ I(() => U(o).modifiers || "");
				$o(e, {
					get items() {
						return t.view.modifiers.items;
					},
					get options() {
						return t.view.modifiers.options;
					},
					get disabled() {
						return U(n);
					},
					get busy() {
						return U(g);
					},
					get drafts() {
						return U(r);
					},
					get error() {
						return U(a);
					},
					get idPrefix() {
						return i();
					},
					onquick: Oe,
					onadd: N,
					onenable: P,
					onremove: ke,
					onmove: Ae,
					ondraft: Me,
					onsave: Ne
				});
			}
		};
		Y(Be, (e) => {
			t.view.modifiers && e(Ve);
		}), H((e) => {
			l = pi(c, "", l, { "--pc-detail-family": t.view.familyColor ?? "var(--pc-accent)" }), Q(d, "d", t.view.iconPath), Q(p, "id", i() + "-name"), Q(p, "maxlength", t.view.boundary ? void 0 : 80), Si(p, e), p.disabled = t.view.boundary ? t.view.readOnly || !r().editInterface : !t.view.canPresent || !r().present, J(y, t.view.boundary ? "Subgraph " + t.view.boundary.direction : t.view.family + " · " + t.view.phase + " phase");
		}, [() => t.view.boundary ? Le().label : t.view.alias || t.view.title || t.view.canonicalTitle]), G("input", p, (e) => {
			t.view?.boundary && Re("label", e.currentTarget.value);
		}), G("change", p, (e) => {
			t.view?.boundary || Ie(e.currentTarget.value);
		}), q(e, s);
	}, Ge = (e) => {
		q(e, Ws());
	};
	Y(Ve, (e) => {
		t.view ? e(We) : e(Ge, -1);
	}), F(Be), q(e, Be), Ue();
}
Tr([
	"input",
	"change",
	"click"
]);
//#endregion
//#region ui/CommentDetails.svelte
var qs = /* @__PURE__ */ K("<p class=\"pc-detail-meta svelte-17djc3u\">Read-only comment</p>"), Js = /* @__PURE__ */ K("<section class=\"pc-comment-details svelte-17djc3u\" aria-label=\"Comment details\"><h3 class=\"svelte-17djc3u\">Comment</h3> <!> <fieldset class=\"pc-detail-group svelte-17djc3u\"><legend class=\"svelte-17djc3u\">Comment</legend> <label class=\"svelte-17djc3u\">Title<input aria-label=\"Comment title\" class=\"svelte-17djc3u\"/></label> <label class=\"svelte-17djc3u\">Notes<textarea aria-label=\"Comment notes\" rows=\"5\" class=\"svelte-17djc3u\"></textarea></label> <label class=\"pc-comment-color-label svelte-17djc3u\">Color<input aria-label=\"Comment color\" type=\"color\" class=\"svelte-17djc3u\"/></label> <label class=\"pc-detail-check svelte-17djc3u\"><input aria-label=\"Move contents\" type=\"checkbox\" class=\"svelte-17djc3u\"/> Move contents</label> <small class=\"svelte-17djc3u\">Moves fully contained nodes when you drag the comment header.</small></fieldset> <div class=\"pc-comment-commands svelte-17djc3u\"><button type=\"button\" class=\"pc-btn svelte-17djc3u\">Fit to contents</button> <button type=\"button\" class=\"pc-btn pc-danger svelte-17djc3u\">Delete comment</button></div> <small class=\"svelte-17djc3u\">Deleting this comment keeps its contents.</small></section>");
function Ys(e, t) {
	He(t, !0);
	let n = Mi(t, "readOnly", 3, !1), r = /* @__PURE__ */ I(() => n() || t.comment.readOnly), i = (e) => e.stopPropagation();
	function a(e) {
		U(r) || t.onPatch(e);
	}
	function o(e) {
		U(r) || t.onCommand(e);
	}
	var s = Js(), c = V(z(s), 2), l = (e) => {
		q(e, qs());
	};
	Y(c, (e) => {
		U(r) && e(l);
	});
	var u = V(c, 2), d = V(z(u), 2), f = V(z(d));
	Z(f), F(d);
	var p = V(d, 2), m = V(z(p));
	it(m), F(p);
	var h = V(p, 2), g = V(z(h));
	Z(g), F(h);
	var _ = V(h, 2), v = z(_);
	Z(v), je(), F(_), je(2), F(u);
	var y = V(u, 2), b = z(y), x = V(b, 2);
	F(y), je(2), F(s), H(() => {
		u.disabled = U(r), Si(f, t.comment.title), f.disabled = U(r), Si(m, t.comment.content), m.disabled = U(r), Si(g, t.comment.color), g.disabled = U(r), Ci(v, t.comment.moveContents), v.disabled = U(r), b.disabled = U(r), x.disabled = U(r);
	}), W("keydown", f, i, !0), G("change", f, (e) => a({ title: e.currentTarget.value })), W("keydown", m, i, !0), G("change", m, (e) => a({ content: e.currentTarget.value })), G("change", g, (e) => a({ color: e.currentTarget.value })), G("change", v, (e) => a({ moveContents: e.currentTarget.checked })), G("click", b, () => o("fit")), G("click", x, () => o("delete")), q(e, s), Ue();
}
Tr(["change", "click"]);
//#endregion
//#region ui/OutputPreview.svelte
var Xs = /* @__PURE__ */ K("<option class=\"svelte-ee2ehy\"> </option>"), Zs = /* @__PURE__ */ K("<label class=\"pc-preview-choice svelte-ee2ehy\"><span class=\"pc-preview-sr-only svelte-ee2ehy\">Preview output</span><select aria-label=\"Preview output\" class=\"svelte-ee2ehy\"><option disabled=\"\" class=\"svelte-ee2ehy\">Choose an output</option><!></select></label>"), Qs = /* @__PURE__ */ K("<button type=\"button\" aria-label=\"Collapse preview\" title=\"Collapse preview\" class=\"svelte-ee2ehy\">▴</button>"), $s = /* @__PURE__ */ K("<button type=\"button\" role=\"tab\" class=\"svelte-ee2ehy\"> </button>"), ec = /* @__PURE__ */ K("<div class=\"pc-preview-tabs svelte-ee2ehy\" role=\"tablist\" aria-label=\"Recorded artifacts\"></div>"), tc = /* @__PURE__ */ K("<p class=\"pc-preview-note svelte-ee2ehy\"> </p>"), nc = /* @__PURE__ */ K("<pre class=\"svelte-ee2ehy\"> </pre>"), rc = /* @__PURE__ */ K("<small class=\"pc-preview-note svelte-ee2ehy\"> </small>"), ic = /* @__PURE__ */ K("<div role=\"tabpanel\" tabindex=\"0\" class=\"svelte-ee2ehy\"><article class=\"svelte-ee2ehy\"><div class=\"pc-preview-section-heading svelte-ee2ehy\"><span class=\"svelte-ee2ehy\"> </span><small class=\"svelte-ee2ehy\"> </small></div> <!> <!></article></div>"), ac = /* @__PURE__ */ K("<p class=\"pc-preview-empty svelte-ee2ehy\"> </p>"), oc = /* @__PURE__ */ K("<section aria-label=\"Accepted consequences\" class=\"pc-preview-settlement svelte-ee2ehy\"><strong class=\"svelte-ee2ehy\"> </strong> <!></section>"), sc = /* @__PURE__ */ K("<p class=\"pc-preview-error svelte-ee2ehy\"> </p>"), cc = /* @__PURE__ */ K("<button type=\"button\" data-run-here=\"\" title=\"Runs the selected output's dependencies. Results are diagnostic previews.\" class=\"svelte-ee2ehy\"> </button>"), lc = /* @__PURE__ */ K("<button type=\"button\" data-preview-apply=\"\" class=\"svelte-ee2ehy\"> </button><button type=\"button\" class=\"svelte-ee2ehy\"> </button>", 1), uc = /* @__PURE__ */ K("<header class=\"svelte-ee2ehy\"><h3 class=\"svelte-ee2ehy\"> </h3> <!> <div class=\"pc-preview-tools svelte-ee2ehy\"><button type=\"button\" aria-label=\"Pin preview\" class=\"svelte-ee2ehy\"> </button><!></div></header> <!> <div class=\"pc-preview-sections svelte-ee2ehy\"><!> <!> <!> <!> <!> <!> <!> <!></div> <footer class=\"svelte-ee2ehy\"><span class=\"pc-preview-status svelte-ee2ehy\"> </span> <span class=\"svelte-ee2ehy\"> </span> <!> <!></footer>", 1), dc = /* @__PURE__ */ K("<p class=\"pc-preview-empty svelte-ee2ehy\">Select a node output to inspect its recorded result.</p>"), fc = /* @__PURE__ */ K("<section class=\"pc-output-preview svelte-ee2ehy\" aria-label=\"Output preview\"><!></section>");
function pc(e, t) {
	let n = Lr();
	He(t, !0);
	let r = Mi(t, "actions", 19, () => ({})), i = /* @__PURE__ */ I(() => JSON.stringify([t.view?.sourceKey, t.view?.selectedKey])), a = /* @__PURE__ */ L(en({
		scope: "",
		id: null
	})), o = /* @__PURE__ */ I(() => (U(a).scope === U(i) ? t.view?.sections.find((e) => e.id === U(a).id) : null) ?? t.view?.sections[0] ?? null);
	Sn(() => {
		let e = U(a).scope === U(i) && t.view?.sections.some((e) => e.id === U(a).id) ? U(a).id : t.view?.sections[0]?.id ?? null;
		(U(a).scope !== U(i) || U(a).id !== e) && R(a, {
			scope: U(i),
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
			scope: U(i),
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
	}, p = /* @__PURE__ */ I(() => !!(t.view && U(l) && t.view.status !== "removed" && !t.view.busy && t.view.runHere?.enabled && r().runHere)), m = /* @__PURE__ */ I(() => !!(t.view && U(l) && t.view.review?.mode === "root" && t.view.review.selectedRootTerminal && "kind" in U(l).target && U(l).target.address.instancePath.length === 0 && d(U(l).target) === d(t.view.review.selector.terminal))), h = /* @__PURE__ */ I(() => !!(t.view && t.view.status === "current" && !t.view.busy && U(m) && t.view.review?.fresh && t.view.review.canApply && r().apply)), g = /* @__PURE__ */ I(() => !!(t.view && !t.view.busy && U(m) && r().reject));
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
	var y = fc(), b = z(y), x = (e) => {
		var d = uc(), m = B(d), y = z(m), b = z(y, !0);
		F(y);
		var x = V(y, 2), S = (e) => {
			var n = Zs(), i = V(z(n)), a = z(i);
			a.value = a.__value = "", X(V(a), 17, () => t.view.choices, (e) => e.key, (e, t) => {
				var n = Xs(), r = z(n);
				F(n);
				var i = {};
				H(() => {
					J(r, `${U(t).label ?? ""} · ${U(t).kind ?? ""}`), i !== (i = U(t).key) && (n.value = (n.__value = U(t).key) ?? "");
				}), q(e, n);
			}), F(i);
			var o;
			hi(i), F(n), H(() => {
				i.disabled = !r().select, o !== (o = t.view.selectedKey ?? "") && (i.value = (i.__value = t.view.selectedKey ?? "") ?? "", mi(i, t.view.selectedKey ?? ""));
			}), G("change", i, (e) => _(e.currentTarget.value)), q(e, n);
		};
		Y(x, (e) => {
			t.view.choices.length && e(S);
		});
		var C = V(x, 2), w = z(C), T = z(w, !0);
		F(w);
		var E = V(w), D = (e) => {
			var n = Qs();
			G("click", n, function(...e) {
				t.collapse?.apply(this, e);
			}), q(e, n);
		};
		Y(E, (e) => {
			t.collapse && e(D);
		}), F(C), F(m);
		var O = V(m, 2), k = (e) => {
			var r = ec();
			X(r, 23, () => t.view.sections, (e) => e.id, (e, t, r) => {
				var l = $s(), u = z(l, !0);
				F(l), H((e) => {
					Q(l, "id", e), Q(l, "aria-selected", U(o)?.id === U(t).id), Q(l, "aria-controls", n + "-panel"), Q(l, "tabindex", U(o)?.id === U(t).id ? 0 : -1), J(u, U(t).label);
				}, [() => s(U(t).id)]), G("click", l, () => {
					R(a, {
						scope: U(i),
						id: U(t).id
					}, !0);
				}), W("keydown", l, (e) => c(e, U(r)), !0), q(e, l);
			}), F(r), q(e, r);
		};
		Y(O, (e) => {
			t.view.sections.length && e(k);
		});
		var A = V(O, 2), j = z(A), M = (e) => {
			let t = /* @__PURE__ */ I(() => U(o));
			var r = ic(), i = z(r), a = z(i), c = z(a), l = z(c, !0);
			F(c);
			var u = V(c), d = z(u, !0);
			F(u), F(a);
			var f = V(a, 2), p = (e) => {
				var n = tc(), r = z(n, !0);
				F(n), H(() => J(r, U(t).text)), q(e, n);
			}, m = (e) => {
				var n = nc(), r = z(n, !0);
				F(n), H(() => J(r, U(t).text)), q(e, n);
			};
			Y(f, (e) => {
				U(t).format === "omitted" ? e(p) : e(m, -1);
			});
			var h = V(f, 2), g = (e) => {
				var n = rc(), r = z(n);
				F(n), H(() => J(r, `Truncated diagnostic${U(t).format === "json-prefix-text" ? " · JSON prefix shown as text" : ""}`)), q(e, n);
			};
			Y(h, (e) => {
				U(t).truncated && e(g);
			}), F(i), F(r), H((e) => {
				Q(r, "id", n + "-panel"), Q(r, "aria-labelledby", e), Q(i, "data-artifact-kind", U(t).kind), J(l, U(t).label), J(d, U(t).kind);
			}, [() => s(U(t).id)]), W("keydown", r, (e) => e.stopPropagation(), !0), W("paste", r, (e) => e.stopPropagation(), !0), q(e, r);
		}, ee = (e) => {
			var n = ac(), r = z(n, !0);
			F(n), H(() => J(r, t.view.status === "not-run" ? "Enable Lattice and Send with the open workflow, or use Run to here to inspect an output." : "No recorded artifact is available for this output.")), q(e, n);
		};
		Y(j, (e) => {
			U(o) ? e(M) : e(ee, -1);
		});
		var te = V(j, 2), ne = (e) => {
			var n = oc(), r = z(n), i = z(r);
			F(r), X(V(r, 2), 17, () => t.view.settlement.receipts, (e) => e.intentId + ":" + e.targetId, (e, t) => {
				var n = tc(), r = z(n);
				F(n), H(() => J(r, `${U(t).targetId ?? ""} · ${U(t).status ?? ""}${U(t).error ? " · " + U(t).error.message : ""}`)), q(e, n);
			}), F(n), H(() => J(i, `Accepted consequences · ${t.view.settlement.status === "settled" ? "Saved" : t.view.settlement.status === "partial" ? "Some targets failed" : "Save confirmation needed"}`)), q(e, n);
		};
		Y(te, (e) => {
			t.view.settlement && e(ne);
		});
		var re = V(te, 2), ie = (e) => {
			var n = tc(), r = z(n, !0);
			F(n), H(() => J(r, t.view.statusDetail)), q(e, n);
		};
		Y(re, (e) => {
			t.view.statusDetail && e(ie);
		});
		var ae = V(re, 2);
		X(ae, 17, () => t.view.sections.filter((e) => e.id !== U(o)?.id && (e.format === "omitted" || e.truncated)), (e) => e.id, (e, t) => {
			var n = tc(), r = z(n);
			F(n), H(() => J(r, `${U(t).label ?? ""}: ${(U(t).format === "omitted" ? U(t).text : "Truncated diagnostic" + (U(t).format === "json-prefix-text" ? " · JSON prefix shown as text" : "")) ?? ""}`)), q(e, n);
		});
		var oe = V(ae, 2), se = (e) => {
			var n = tc(), r = z(n, !0);
			F(n), H(() => J(r, t.view.runHere.issue)), q(e, n);
		};
		Y(oe, (e) => {
			t.view.runHere?.issue && e(se);
		});
		var ce = V(oe, 2);
		X(ce, 17, () => t.view.issues, Kr, (e, t) => {
			var n = sc(), r = z(n, !0);
			F(n), H(() => J(r, U(t))), q(e, n);
		});
		var le = V(ce, 2), ue = (e) => {
			var n = sc(), r = z(n, !0);
			F(n), H(() => J(r, t.view.review.issue)), q(e, n);
		};
		Y(le, (e) => {
			t.view.review?.issue && e(ue);
		});
		var de = V(le, 2), fe = (e) => {
			var n = rc(), r = z(n, !0);
			F(n), H(() => J(r, t.view.review.persistOnly ? "Retry keeps the accepted reply and retries failed targets. No model request is made." : "Apply rechecks the source, connection and final evidence. Recorded preview text may be truncated.")), q(e, n);
		};
		Y(de, (e) => {
			t.view.review && e(fe);
		}), F(A);
		var pe = V(A, 2), me = z(pe), he = z(me, !0);
		F(me);
		var ge = V(me, 2), _e = z(ge, !0);
		F(ge);
		var ve = V(ge, 2), ye = (e) => {
			var n = cc(), i = z(n);
			F(n), H(() => {
				n.disabled = !U(p), J(i, `Run to here · maximum ${t.view.runHere.callBound ?? ""} ${t.view.runHere.callBound === 1 ? "request" : "requests"}`);
			}), G("click", n, () => {
				t.view && U(l) && U(p) && r().runHere?.(t.view.sourceKey, f(U(l).target));
			}), q(e, n);
		};
		Y(ve, (e) => {
			t.view.runHere && e(ye);
		});
		var be = V(ve, 2), xe = (e) => {
			var n = lc(), i = B(n), a = z(i, !0);
			F(i);
			var o = V(i), s = z(o, !0);
			F(o), H(() => {
				i.disabled = !U(h), J(a, t.view.review.persistOnly ? "Retry failed persistence" : "Apply reviewed candidate"), o.disabled = !U(g), J(s, t.view.review.persistOnly ? "Close persistence review" : "Reject candidate");
			}), G("click", i, () => {
				t.view?.review && U(h) && r().apply?.(v(t.view.review.selector));
			}), G("click", o, () => {
				t.view?.review && U(g) && r().reject?.(v(t.view.review.selector));
			}), q(e, n);
		};
		Y(be, (e) => {
			t.view.review && e(xe);
		}), F(pe), H((e) => {
			J(b, U(l)?.label ?? t.view.title), Q(w, "title", t.view.pinned ? "Unpin and follow selection" : "Keep this output visible"), Q(w, "aria-pressed", t.view.pinned), w.disabled = t.view.pinned ? !r().follow : !U(l) || !r().pin, J(T, t.view.pinned ? "Pinned output" : "Pin output"), Q(me, "data-status", t.view.status), J(he, e), J(_e, t.view.pinned ? "Pinned preview" : t.view.followSelection ? "Following selection" : "Selection not followed");
		}, [() => u(t.view.status)]), G("click", w, () => {
			t.view?.pinned ? r().follow?.() : t.view && U(l) && r().pin?.(t.view.sourceKey, f(U(l).target));
		}), q(e, d);
	}, S = (e) => {
		q(e, dc());
	};
	Y(b, (e) => {
		t.view ? e(x) : e(S, -1);
	}), F(y), q(e, y), Ue();
}
Tr(["change", "click"]);
//#endregion
//#region ui/RunDetails.svelte
var mc = /* @__PURE__ */ K("<p class=\"pc-run-error svelte-f9s2fm\"> </p>"), hc = /* @__PURE__ */ K("<p class=\"pc-run-empty svelte-f9s2fm\">No execution plan has been recorded.</p>"), gc = /* @__PURE__ */ K("<span aria-hidden=\"true\" class=\"svelte-f9s2fm\">▱</span>"), _c = /* @__PURE__ */ K("<small class=\"svelte-f9s2fm\"> </small>"), vc = /* @__PURE__ */ K("<details class=\"svelte-f9s2fm\"><summary class=\"svelte-f9s2fm\">Reported usage</summary><div class=\"pc-run-usage svelte-f9s2fm\"><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small></div></details>"), yc = /* @__PURE__ */ K("<li class=\"svelte-f9s2fm\"><div class=\"pc-run-row-heading svelte-f9s2fm\"><button type=\"button\" class=\"svelte-f9s2fm\"><!> </button><span class=\"pc-run-status svelte-f9s2fm\"> </span></div> <!> <div class=\"pc-run-row-meta svelte-f9s2fm\"><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small></div> <!> <!></li>"), bc = /* @__PURE__ */ K("<header class=\"svelte-f9s2fm\"><h3 class=\"svelte-f9s2fm\">Run details</h3><span class=\"pc-run-status svelte-f9s2fm\"> </span></header> <div class=\"pc-run-summary svelte-f9s2fm\"><p class=\"svelte-f9s2fm\"> </p><p class=\"svelte-f9s2fm\"> </p><p class=\"svelte-f9s2fm\"> </p></div> <!> <!> <ol class=\"pc-run-rows svelte-f9s2fm\"></ol>", 1), xc = /* @__PURE__ */ K("<p class=\"pc-run-empty svelte-f9s2fm\">Enable Lattice and Send with the open workflow, or use Run to here to inspect its processing stages.</p>"), Sc = /* @__PURE__ */ K("<section class=\"pc-run-details svelte-f9s2fm\" aria-label=\"Run details\"><!></section>");
function Cc(e, t) {
	He(t, !0);
	let n = Mi(t, "actions", 19, () => ({})), r = (e) => e === "not-run" ? "Not run" : e === "empty" ? "Ready" : e.charAt(0).toUpperCase() + e.slice(1), i = (e) => e !== null && Number.isFinite(e) && e >= 0 ? (e / 1e3).toFixed(2) + "s" : "Unknown", a = (e) => e != null && Number.isFinite(e) && e >= 0 ? String(e) : "Unknown";
	var o = Sc(), s = z(o), c = (e) => {
		var o = bc(), s = B(o), c = V(z(s)), l = z(c, !0);
		F(c), F(s);
		var u = V(s, 2), d = z(u), f = z(d);
		F(d);
		var p = V(d), m = z(p);
		F(p);
		var h = V(p), g = z(h);
		F(h), F(u);
		var _ = V(u, 2), v = (e) => {
			var n = mc(), r = z(n, !0);
			F(n), H(() => J(r, t.view.issue)), q(e, n);
		};
		Y(_, (e) => {
			t.view.issue && e(v);
		});
		var y = V(_, 2), b = (e) => {
			q(e, hc());
		};
		Y(y, (e) => {
			t.view.rows.length || e(b);
		});
		var x = V(y, 2);
		X(x, 21, () => t.view.rows, (e) => e.key, (e, o) => {
			var s = yc();
			let c;
			var l = z(s), u = z(l), d = z(u), f = (e) => {
				q(e, gc());
			};
			Y(d, (e) => {
				U(o).kind === "instance" && e(f);
			});
			var p = V(d, 1, !0);
			F(u);
			var m = V(u), h = z(m, !0);
			F(m), F(l);
			var g = V(l, 2), _ = (e) => {
				var t = _c(), n = z(t, !0);
				F(t), H((e) => J(n, e), [() => r(U(o).subphase)]), q(e, t);
			};
			Y(g, (e) => {
				U(o).subphase && e(_);
			});
			var v = V(g, 2), y = z(v), b = z(y);
			F(y);
			var x = V(y), S = z(x);
			F(x), F(v);
			var C = V(v, 2), w = (e) => {
				var t = mc(), n = z(t, !0);
				F(t), H(() => J(n, U(o).issue)), q(e, t);
			};
			Y(C, (e) => {
				U(o).issue && e(w);
			});
			var T = V(C, 2), E = (e) => {
				var t = vc(), n = V(z(t)), r = z(n), i = z(r);
				F(r);
				var s = V(r), c = z(s);
				F(s);
				var l = V(s), u = z(l);
				F(l);
				var d = V(l), f = z(d);
				F(d), F(n), F(t), H((e, t, n) => {
					J(i, `Input tokens: ${e ?? ""}`), J(c, `Output tokens: ${t ?? ""}`), J(u, `Total tokens: ${n ?? ""}`), J(f, `Cost: ${U(o).usage?.cost ?? "Unknown" ?? ""}`);
				}, [
					() => a(U(o).usage?.inputTokens),
					() => a(U(o).usage?.outputTokens),
					() => a(U(o).usage?.totalTokens)
				]), q(e, t);
			};
			Y(T, (e) => {
				U(o).kind === "primitive" && e(E);
			}), F(s), H((e, t, r) => {
				Q(s, "data-run-row", U(o).key), Q(s, "data-depth", U(o).depth), Q(s, "data-status", U(o).status), c = pi(s, "", c, e), Q(u, "aria-label", "Open " + U(o).title + " in graph"), u.disabled = !n().jump, J(p, U(o).title), Q(m, "data-status", U(o).status), J(h, t), J(b, `Duration: ${r ?? ""}`), J(S, `${U(o).attempts ?? ""} of ${U(o).callBound ?? ""} requests`);
			}, [
				() => ({ "margin-left": `${Math.max(0, Math.min(8, U(o).depth)) * 12}px` }),
				() => r(U(o).status),
				() => i(U(o).durationMs)
			]), G("click", u, () => {
				t.view && n().jump?.(t.view.runId, {
					...U(o).address,
					instancePath: [...U(o).address.instancePath]
				});
			}), q(e, s);
		}), F(x), H((e, n) => {
			Q(c, "data-status", t.view.status), J(l, e), J(f, `${t.view.completedCount ?? ""} of ${t.view.executableCount ?? ""} stages complete`), J(m, `${t.view.actualCalls ?? ""} of ${t.view.callBound ?? ""} requests`), J(g, `Elapsed: ${n ?? ""}`);
		}, [() => r(t.view.status), () => i(t.view.elapsedMs)]), q(e, o);
	}, l = (e) => {
		q(e, xc());
	};
	Y(s, (e) => {
		t.view ? e(c) : e(l, -1);
	}), F(o), q(e, o), Ue();
}
Tr(["click"]);
//#endregion
//#region ui/RunMeter.svelte
var wc = /* @__PURE__ */ K("<span class=\"pc-run-meter-elapsed svelte-1tkcp3\" data-run-elapsed=\"\"> </span>"), Tc = /* @__PURE__ */ K("<span class=\"pc-run-pixel svelte-1tkcp3\" data-run-pixel=\"\"></span>"), Ec = /* @__PURE__ */ K("<button class=\"pc-run-meter svelte-1tkcp3\"><span class=\"pc-run-meter-label svelte-1tkcp3\"> </span> <!> <span class=\"pc-run-meter-pixels svelte-1tkcp3\" aria-hidden=\"true\"></span></button>");
function Dc(e, t) {
	He(t, !0);
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
	var o = Ir(), s = B(o), c = (e) => {
		var r = Ec(), o = z(r), s = z(o, !0);
		F(o);
		var c = V(o, 2), l = (e) => {
			var n = wc(), r = z(n);
			F(n), H((e) => J(r, `${e ?? ""}s`), [() => (t.view.elapsedMs / 1e3).toFixed(1)]), q(e, n);
		}, u = /* @__PURE__ */ I(() => t.view.elapsedMs !== null && Number.isFinite(t.view.elapsedMs) && t.view.elapsedMs >= 0);
		Y(c, (e) => {
			U(u) && e(l);
		});
		var d = V(c, 2);
		X(d, 21, () => U(i), (e) => e.key, (e, t) => {
			var n = Tc();
			H(() => {
				Q(n, "data-status", U(t).status), Q(n, "title", U(t).title);
			}), q(e, n);
		}), F(d), F(r), H((e) => {
			Q(r, "aria-label", U(a)), Q(r, "title", U(a)), r.disabled = !t.open, J(s, e);
		}, [() => n(t.view.status)]), G("click", r, () => t.open?.()), q(e, r);
	};
	Y(s, (e) => {
		t.view && e(c);
	}), q(e, o), Ue();
}
Tr(["click"]);
//#endregion
//#region ui/PortalManager.svelte
var Oc = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-mnv790\">Close</button>"), kc = /* @__PURE__ */ K("<option class=\"svelte-mnv790\"> </option>"), Ac = /* @__PURE__ */ K("<label class=\"svelte-mnv790\">Portal name<input aria-label=\"Portal name\" class=\"svelte-mnv790\"/></label> <p class=\"pc-note svelte-mnv790\"> </p> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-rename=\"\" class=\"svelte-mnv790\">Rename</button></div>", 1), jc = /* @__PURE__ */ K("<p class=\"pc-note svelte-mnv790\">Select a portal or create one from an output.</p>"), Mc = /* @__PURE__ */ K("<button type=\"button\" data-portal-jump-source=\"\" class=\"svelte-mnv790\">Jump to source</button>"), Nc = /* @__PURE__ */ K("<label class=\"pc-check svelte-mnv790\"><input type=\"checkbox\" aria-label=\"Replace existing connection\" class=\"svelte-mnv790\"/>Replace existing connection</label>"), Pc = /* @__PURE__ */ K("<button type=\"button\" data-portal-jump-consumer=\"\" class=\"svelte-mnv790\">Jump</button>"), Fc = /* @__PURE__ */ K("<div class=\"pc-consumer svelte-mnv790\"><span class=\"svelte-mnv790\"> </span><div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-restore=\"\" class=\"svelte-mnv790\">Restore wire</button> <!></div></div>"), Ic = /* @__PURE__ */ K("<p class=\"pc-note svelte-mnv790\">No consumers.</p>"), Lc = /* @__PURE__ */ K("<label class=\"svelte-mnv790\">Existing consumers<select aria-label=\"Existing consumers\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Choose before deleting…</option><option class=\"svelte-mnv790\">Restore visible wires</option><option class=\"svelte-mnv790\">Disconnect consumers</option></select></label>"), Rc = /* @__PURE__ */ K("<details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Consumers</summary> <label class=\"svelte-mnv790\">Compatible receiver<select aria-label=\"Compatible receiver\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select input…</option><!></select></label> <!> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-connect=\"\" class=\"svelte-mnv790\">Connect receiver</button></div> <!> <!> <!> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-delete=\"\" class=\"svelte-mnv790\">Delete portal</button></div></details>"), zc = /* @__PURE__ */ K("<details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Convert to portal</summary><p class=\"pc-note svelte-mnv790\"> </p><div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-convert=\"\" class=\"svelte-mnv790\"> </button></div></details>"), Bc = /* @__PURE__ */ K("<p class=\"pc-error svelte-mnv790\"> </p>"), Vc = /* @__PURE__ */ K("<p class=\"pc-error svelte-mnv790\" role=\"alert\"> </p>"), Hc = /* @__PURE__ */ K("<p class=\"pc-note svelte-mnv790\" role=\"status\">Preparing change…</p>"), Uc = /* @__PURE__ */ K("<p class=\"pc-note svelte-mnv790\"> </p> <label class=\"svelte-mnv790\">Portal<select aria-label=\"Selected portal\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select portal…</option><!></select></label> <!> <details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Source</summary> <label class=\"svelte-mnv790\">Output<select aria-label=\"Portal source\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select output…</option><!></select></label> <label class=\"svelte-mnv790\">New portal name<input aria-label=\"New portal name\" class=\"svelte-mnv790\"/></label> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-create=\"\" class=\"svelte-mnv790\">Create portal</button> <button type=\"button\" data-portal-retarget=\"\" class=\"svelte-mnv790\">Retarget</button> <!></div></details> <!> <!> <!> <!> <!>", 1), Wc = /* @__PURE__ */ K("<p class=\"pc-note svelte-mnv790\">Open a graph to manage its portals.</p>"), Gc = /* @__PURE__ */ K("<section class=\"pc-manager svelte-mnv790\" aria-label=\"Manage portals\"><header class=\"svelte-mnv790\"><h2 class=\"svelte-mnv790\">Manage portals</h2><!></header> <!></section>");
function Kc(e, t) {
	He(t, !0);
	let n = Mi(t, "actions", 19, () => ({})), r = /* @__PURE__ */ L(""), i = /* @__PURE__ */ L(""), a = /* @__PURE__ */ L(""), o = /* @__PURE__ */ L(""), s = /* @__PURE__ */ L(""), c = /* @__PURE__ */ L(!1), l = /* @__PURE__ */ L(""), u = /* @__PURE__ */ L(""), d = "", f = 0, p = !0, m = (e) => JSON.stringify(e.kind === "graph" ? [
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
	]), h = /* @__PURE__ */ I(() => t.view?.publishers.find((e) => e.id === t.view.selectedPortalId)), g = /* @__PURE__ */ I(() => !!t.view && !!U(h) && t.view.capabilities.rename && (t.view.renameMode === "presentation" ? t.view.canPresent : t.view.scope.kind === "graph" && !t.view.readOnly) && !!n().rename), _ = /* @__PURE__ */ I(() => t.view?.sources.find((e) => e.key === U(a) && e.direction === "output")), v = /* @__PURE__ */ I(() => t.view?.receivers.find((e) => e.key === U(o) && e.direction === "input" && e.kind === U(h)?.kind)), y = /* @__PURE__ */ I(() => !!U(h) && !!U(v) && (!U(v).occupied || U(c)) && C("connect") && !!n().connect), b = /* @__PURE__ */ I(() => !!U(h) && C("remove") && !!n().deletePublisher && (!t.view?.consumers.length || U(s) === "restore" || U(s) === "disconnect"));
	Sn(() => {
		let e = t.view ? JSON.stringify([
			t.view.managerKey,
			t.view.revision,
			m(t.view.scope),
			t.view.selectedPortalId,
			t.view.renameMode
		]) : "";
		d !== e && (d = e, R(r, U(h)?.label ?? "", !0), R(i, ""), R(a, t.view?.sources.find((e) => e.nodeId === U(h)?.source.nodeId && e.portId === U(h)?.source.portId)?.key ?? "", !0), R(o, ""), R(s, ""), R(c, !1), R(l, ""), R(u, ""), f++);
	}), Pi(() => {
		p = !1, f++;
	});
	let x = (e) => ({
		managerKey: e.managerKey,
		revision: e.revision,
		scope: Re(e.scope)
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
		if (!t.view || !n || U(u)) return;
		let i = x(t.view), a = ++f, o = t.view.selectedPortalId;
		R(u, e, !0), R(l, "");
		try {
			let e = await r(i);
			p && a === f && t.view?.managerKey === i.managerKey && t.view.revision === i.revision && m(t.view.scope) === m(i.scope) && t.view.selectedPortalId === o && (R(u, ""), R(l, e.ok ? "" : e.error.code + ": " + e.error.message, !0));
		} catch (e) {
			p && a === f && t.view?.managerKey === i.managerKey && t.view.revision === i.revision && m(t.view.scope) === m(i.scope) && t.view.selectedPortalId === o && (R(u, ""), R(l, e instanceof Error ? e.message : "The portal change could not be accepted.", !0));
		}
	}
	var E = Gc(), D = z(E), O = V(z(D)), k = (e) => {
		var t = Oc();
		G("click", t, () => n().close?.()), q(e, t);
	};
	Y(O, (e) => {
		n().close && e(k);
	}), F(D);
	var A = V(D, 2), j = (e) => {
		var d = Uc(), f = B(d), p = z(f);
		F(f);
		var m = V(f, 2), E = V(z(m)), D = z(E);
		D.value = D.__value = "", X(V(D), 17, () => t.view.publishers, (e) => e.id, (e, t) => {
			var n = kc(), r = z(n);
			F(n);
			var i = {};
			H(() => {
				J(r, `${U(t).label ?? ""} · ${U(t).kind ?? ""}`), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
			}), q(e, n);
		}), F(E);
		var O;
		hi(E), F(m);
		var k = V(m, 2), A = (e) => {
			var i = Ac(), a = B(i), o = V(z(a));
			Z(o), F(a);
			var s = V(a, 2), c = z(s);
			F(s);
			var l = V(s, 2), d = z(l);
			F(l), H(() => {
				Si(o, U(r)), o.disabled = !U(g), J(c, `${t.view.renameMode === "presentation" ? "Local workspace label · not exported" : "Authored portal label"} · ${U(h).kind ?? ""}`), d.disabled = !U(g) || !!U(u);
			}), G("input", o, (e) => {
				R(r, e.currentTarget.value, !0), w();
			}), G("click", d, () => {
				let e = U(h)?.id, i = t.view?.renameMode, a = U(r);
				e && i && n().rename && T("rename", U(g), (t) => n().rename(t, e, a, i));
			}), q(e, i);
		}, j = (e) => {
			q(e, jc());
		};
		Y(k, (e) => {
			U(h) ? e(A) : e(j, -1);
		});
		var M = V(k, 2), ee = V(z(M), 2), te = V(z(ee)), ne = z(te);
		ne.value = ne.__value = "", X(V(ne), 17, () => t.view.sources, (e) => e.key, (e, t) => {
			var n = kc(), r = z(n);
			F(n);
			var i = {};
			H(() => {
				J(r, `${U(t).label ?? ""} · ${U(t).kind ?? ""}`), i !== (i = U(t).key) && (n.value = (n.__value = U(t).key) ?? "");
			}), q(e, n);
		}), F(te);
		var re;
		hi(te), F(ee);
		var ie = V(ee, 2), ae = V(z(ie));
		Z(ae), F(ie);
		var oe = V(ie, 2), se = z(oe), ce = V(se, 2), le = V(ce, 2), ue = (e) => {
			var r = Mc();
			G("click", r, () => {
				t.view && U(h) && n().jumpSource?.(x(t.view), S(U(h).source));
			}), q(e, r);
		};
		Y(le, (e) => {
			U(h) && n().jumpSource && e(ue);
		}), F(oe), F(M);
		var de = V(M, 2), fe = (e) => {
			var r = Rc(), i = V(z(r), 2), a = V(z(i)), l = z(a);
			l.value = l.__value = "", X(V(l), 17, () => t.view.receivers, (e) => e.key, (e, t) => {
				var n = kc(), r = z(n);
				F(n);
				var i = {};
				H(() => {
					J(r, `${U(t).label ?? ""}${U(t).occupied ? " · Connected" : ""}`), i !== (i = U(t).key) && (n.value = (n.__value = U(t).key) ?? "");
				}), q(e, n);
			}), F(a);
			var d;
			hi(a), F(i);
			var f = V(i, 2), p = (e) => {
				var t = Nc(), n = z(t);
				Z(n), je(), F(t), H((e) => {
					Ci(n, U(c)), n.disabled = e;
				}, [() => !C("connect")]), G("change", n, (e) => {
					R(c, e.currentTarget.checked, !0), w();
				}), q(e, t);
			};
			Y(f, (e) => {
				U(v)?.occupied && e(p);
			});
			var m = V(f, 2), g = z(m);
			F(m);
			var _ = V(m, 2);
			X(_, 17, () => t.view.consumers, (e) => e.edgeId, (e, r) => {
				var i = Fc(), a = z(i), o = z(a, !0);
				F(a);
				var s = V(a), c = z(s), l = V(c, 2), d = (e) => {
					var i = Pc();
					G("click", i, () => {
						let e = t.view?.consumers.find((e) => e.edgeId === U(r).edgeId);
						t.view && e && n().jumpConsumer?.(x(t.view), e.edgeId, S(e.to));
					}), q(e, i);
				};
				Y(l, (e) => {
					n().jumpConsumer && e(d);
				}), F(s), F(i), H((e) => {
					J(o, U(r).label), c.disabled = e;
				}, [() => !C("restore") || !n().restoreWire || !!U(u)]), G("click", c, () => {
					let e = t.view?.consumers.find((e) => e.edgeId === U(r).edgeId);
					e && n().restoreWire && T("restore", C("restore"), (t) => n().restoreWire(t, e.edgeId));
				}), q(e, i);
			});
			var E = V(_, 2), D = (e) => {
				q(e, Ic());
			};
			Y(E, (e) => {
				t.view.consumers.length || e(D);
			});
			var O = V(E, 2), k = (e) => {
				var t = Lc(), n = V(z(t)), r = z(n);
				r.value = r.__value = "";
				var i = V(r);
				i.value = i.__value = "restore";
				var a = V(i);
				a.value = a.__value = "disconnect", F(n);
				var o;
				hi(n), F(t), H((e) => {
					n.disabled = e, o !== (o = U(s)) && (n.value = (n.__value = U(s)) ?? "", mi(n, U(s)));
				}, [() => !C("remove")]), G("change", n, (e) => {
					R(s, e.currentTarget.value, !0), w();
				}), q(e, t);
			};
			Y(O, (e) => {
				t.view.consumers.length && e(k);
			});
			var A = V(O, 2), j = z(A);
			F(A), F(r), H((e) => {
				a.disabled = e, d !== (d = U(o)) && (a.value = (a.__value = U(o)) ?? "", mi(a, U(o))), g.disabled = !U(y) || !!U(u), j.disabled = !U(b) || !!U(u);
			}, [() => !C("connect") || !n().connect]), G("change", a, (e) => {
				R(o, e.currentTarget.value, !0), R(c, !1), w();
			}), G("click", g, () => {
				let e = U(v), t = U(h)?.id, r = U(c);
				e && t && n().connect && T("connect", U(y), (i) => n().connect(i, t, S(e), r));
			}), G("click", j, () => {
				let e = U(h)?.id, r = t.view?.consumers.length ? U(s) : "restore";
				e && (r === "restore" || r === "disconnect") && n().deletePublisher && T("remove", U(b), (t) => n().deletePublisher(t, e, r));
			}), q(e, r);
		};
		Y(de, (e) => {
			U(h) && e(fe);
		});
		var pe = V(de, 2), me = (e) => {
			var r = zc(), i = V(z(r)), a = z(i, !0);
			F(i);
			var o = V(i), s = z(o), c = z(s);
			F(s), F(o), F(r), H((e) => {
				J(a, t.view.conversion.label), s.disabled = e, J(c, `Convert ${t.view.conversion.kind === "wire" ? "wire" : "output"}`);
			}, [() => !C("convert") || !!U(u) || (t.view.conversion.kind === "wire" ? !n().convertWire : !n().convertOutput)]), G("click", s, () => {
				let e = t.view?.conversion;
				e?.kind === "wire" && n().convertWire ? T("convert", C("convert"), (t) => n().convertWire(t, e.edgeId)) : e?.kind === "output" && n().convertOutput && T("convert", C("convert"), (t) => n().convertOutput(t, S(e.endpoint)));
			}), q(e, r);
		};
		Y(pe, (e) => {
			t.view.conversion && e(me);
		});
		var he = V(pe, 2), ge = (e) => {
			var n = Bc(), r = z(n, !0);
			F(n), H(() => J(r, t.view.issue)), q(e, n);
		};
		Y(he, (e) => {
			t.view.issue && e(ge);
		});
		var _e = V(he, 2), ve = (e) => {
			var t = Vc(), n = z(t, !0);
			F(t), H(() => J(n, U(l))), q(e, t);
		};
		Y(_e, (e) => {
			U(l) && e(ve);
		});
		var ye = V(_e, 2), be = (e) => {
			q(e, Hc());
		};
		Y(ye, (e) => {
			U(u) && e(be);
		}), H((e, r, o, s) => {
			J(p, `${t.view.scopeLabel ?? ""}${t.view.readOnly ? " · Read-only graph" : ""}`), E.disabled = !n().selectPortal, O !== (O = t.view.selectedPortalId ?? "") && (E.value = (E.__value = t.view.selectedPortalId ?? "") ?? "", mi(E, t.view.selectedPortalId ?? "")), te.disabled = e, re !== (re = U(a)) && (te.value = (te.__value = U(a)) ?? "", mi(te, U(a))), Si(ae, U(i)), ae.disabled = r, se.disabled = o, ce.disabled = s;
		}, [
			() => !C("create") && !C("retarget"),
			() => !C("create") || !n().create,
			() => !C("create") || !n().create || !U(_) || !U(i).trim() || !!U(u),
			() => !C("retarget") || !n().retarget || !U(_) || !U(h) || !!U(u)
		]), G("change", E, (e) => {
			let r = e.currentTarget.value;
			e.currentTarget.selectedIndex >= 0 && t.view && n().selectPortal && (!r || t.view.publishers.some((e) => e.id === r)) && n().selectPortal(x(t.view), r || null);
		}), G("change", te, (e) => {
			R(a, e.currentTarget.value, !0), w();
		}), G("input", ae, (e) => {
			R(i, e.currentTarget.value, !0), w();
		}), G("click", se, () => {
			let e = U(_), t = U(i);
			e && t.trim() && n().create && T("create", C("create"), (r) => n().create(r, t, S(e)));
		}), G("click", ce, () => {
			let e = U(_), t = U(h)?.id;
			e && t && n().retarget && T("retarget", C("retarget"), (r) => n().retarget(r, t, S(e)));
		}), q(e, d);
	}, M = (e) => {
		q(e, Wc());
	};
	Y(A, (e) => {
		t.view ? e(j) : e(M, -1);
	}), F(E), q(e, E), Ue();
}
Tr([
	"click",
	"change",
	"input"
]);
//#endregion
//#region ui/SubgraphSave.svelte
var qc = /* @__PURE__ */ K("<option class=\"svelte-1n658sg\"> </option>"), Jc = /* @__PURE__ */ K("<p class=\"pc-save-error svelte-1n658sg\" role=\"alert\"> </p>"), Yc = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay svelte-1n658sg\"><div class=\"pc-workspace-dialog pc-subgraph-save svelte-1n658sg\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Save subgraph\" tabindex=\"-1\"><header class=\"svelte-1n658sg\"><h2 class=\"svelte-1n658sg\">Save subgraph</h2><button type=\"button\" aria-label=\"Close save subgraph\" class=\"svelte-1n658sg\">×</button></header> <form class=\"svelte-1n658sg\"><label class=\"svelte-1n658sg\">Name<input aria-label=\"Subgraph name\" maxlength=\"80\" class=\"svelte-1n658sg\"/></label> <label class=\"svelte-1n658sg\">Save as<select aria-label=\"Save as\" class=\"svelte-1n658sg\"><option class=\"svelte-1n658sg\">Save new subgraph</option><!></select></label> <p class=\"svelte-1n658sg\">Edits stay local until you save. Existing placed copies stay unchanged.</p> <!> <footer class=\"svelte-1n658sg\"><button type=\"button\" class=\"svelte-1n658sg\">Cancel</button><button type=\"submit\" data-save-subgraph=\"\" class=\"svelte-1n658sg\"> </button></footer></form></div></div>");
function Xc(e, t) {
	He(t, !0);
	let n, r = /* @__PURE__ */ L(""), i = /* @__PURE__ */ L(""), a = /* @__PURE__ */ L(!1), o = /* @__PURE__ */ L(""), s = "", c = 0;
	Sn(() => {
		if (t.view.key === s) return;
		s = t.view.key, c++, R(r, t.view.name, !0), R(i, t.view.targetId ?? "", !0), R(a, !1), R(o, "");
		let e = s;
		pr().then(() => {
			if (t.view.key === e) {
				let e = n?.querySelector("input");
				e?.focus({ preventScroll: !0 }), e?.select();
			}
		});
	}), Ni(() => {
		let e = document.activeElement;
		return () => e?.focus({ preventScroll: !0 });
	});
	async function l(e) {
		if (e.preventDefault(), !t.actions || !U(r).trim() || U(a) || U(i) && !t.view.entries.some((e) => e.id === U(i))) return;
		let n = t.view.key, s = ++c;
		R(a, !0), R(o, "");
		try {
			await t.actions.save(n, U(r), U(i) || null);
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
	var d = Yc(), f = z(d), p = z(f), m = V(z(p));
	F(p);
	var h = V(p, 2), g = z(h), _ = V(z(g));
	Z(_), F(g);
	var v = V(g, 2), y = V(z(v)), b = z(y);
	b.value = b.__value = "", X(V(b), 17, () => t.view.entries, (e) => e.id, (e, t) => {
		var n = qc(), r = z(n);
		F(n);
		var i = {};
		H(() => {
			J(r, `Update ${U(t).name ?? ""}`), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
		}), q(e, n);
	}), F(y), F(v);
	var x = V(v, 4), S = (e) => {
		var n = Jc(), r = z(n, !0);
		F(n), H(() => J(r, t.view.error || U(o))), q(e, n);
	};
	Y(x, (e) => {
		(t.view.error || U(o)) && e(S);
	});
	var C = V(x, 2), w = z(C), T = V(w), E = z(T, !0);
	F(T), F(C), F(h), F(f), ji(f, (e) => n = e, () => n), F(d), H((e) => {
		T.disabled = e, J(E, U(a) ? "Saving…" : "Save");
	}, [() => !t.actions || !U(r).trim() || U(a)]), W("keydown", f, u, !0), W("paste", f, (e) => e.stopPropagation()), G("click", m, () => t.actions?.close()), W("submit", h, l), Di(_, () => U(r), (e) => R(r, e)), gi(y, () => U(i), (e) => R(i, e)), G("click", w, () => t.actions?.close()), q(e, d), Ue();
}
Tr(["click"]);
//#endregion
//#region src/workflow/operations/json-data.js?v=0.27.0
function Zc(e) {
	if (typeof e != "object" || !e) return JSON.stringify(e);
	if (Array.isArray(e)) {
		let t = "[";
		for (let n = 0; n < e.length; n++) t += `${n ? "," : ""}${Zc(e[n])}`;
		return `${t}]`;
	}
	let t = "{", n = Object.keys(e);
	for (let r = 0; r < n.length; r++) {
		let i = n[r];
		t += `${r ? "," : ""}${JSON.stringify(i)}:${Zc(e[i])}`;
	}
	return `${t}}`;
}
function Qc(e) {
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
		if (new TextEncoder().encode(Zc(t)).byteLength > 262144) throw Error("JSON byte limit exceeded.");
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
//#region src/workflow/story-time.js?v=0.27.0
var $c = (e, t) => ({
	ok: !1,
	error: {
		code: e,
		message: t
	}
}), el = (e) => Number.isSafeInteger(e) && e >= 0, tl = (e, t) => Object.hasOwn(e, t) ? e[t] : void 0, nl = (e) => typeof e == "object" && !!e && !Array.isArray(e), rl = (e) => typeof e == "string" && e.trim().length > 0 && e.length <= 256, il = (e) => Array.isArray(e) && e.every((e) => typeof e == "string" && e.length > 0 && e.length <= 4096);
function al(e, t) {
	let n = ol(e);
	if (!n.ok) return n;
	let r = n.data, i = Qc(t);
	if (!i.ok || !i.data.value || Array.isArray(i.data.value) || typeof i.data.value != "object") return $c("INVALID_PROPOSAL", "Use a plain duration or destination proposal.");
	let a = i.data.value, o = tl(a, "kind");
	if (o !== "duration" && o !== "destination") return $c("UNRESOLVED_TIME", "An explicit duration or destination is required.");
	if (o === "duration" ? !el(tl(a, "minutes")) || Object.hasOwn(a, "absoluteMinute") : !el(tl(a, "absoluteMinute")) || Object.hasOwn(a, "minutes")) return $c("INVALID_PROPOSAL", "Use one nonnegative safe-integer minute value.");
	let s = [
		"kind",
		"evidence",
		o === "duration" ? "minutes" : "absoluteMinute"
	];
	if (Object.keys(a).some((e) => !s.includes(e))) return $c("INVALID_PROPOSAL", "Proposal contains ambiguous or unsupported timing fields.");
	let c = o === "destination" ? a.absoluteMinute : r.absoluteMinute + a.minutes;
	if (!el(c) || c < r.absoluteMinute) return $c("INVALID_DESTINATION", "Destination must be a forward safe-integer minute.");
	let l = cl(Object.hasOwn(a, "evidence") ? a.evidence : { kind: "explicit" });
	if (!l.ok) return l;
	let u = l.data, d = u.kind, f = structuredClone(r), p = structuredClone(u);
	return o === "duration" && r.timeEvidence?.kind === "estimate" && (p = d === "estimate" ? {
		...p,
		lineage: [.../* @__PURE__ */ new Set([...r.timeEvidence.lineage ?? [r.timeEvidence.origin], ...u.lineage ?? [u.origin]])]
	} : structuredClone(r.timeEvidence), p.lineage?.length > 64) ? $c("EVIDENCE_LIMIT", "Estimate provenance exceeds 64 sources; hold the entire time projection.") : sl({
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
function ol(e) {
	let t = Qc(e);
	if (!t.ok || !t.data.value || typeof t.data.value != "object" || Array.isArray(t.data.value)) return $c("INVALID_CLOCK", "Clock must contain bounded own plain data.");
	let n = t.data.value;
	if (!rl(tl(n, "clockId")) || !rl(tl(n, "calendarId")) || !el(tl(n, "absoluteMinute")) || !el(tl(n, "dayLengthMinutes")) || n.dayLengthMinutes === 0) return $c("INVALID_CLOCK", "Clock requires identities and safe-integer minute/calendar values.");
	if (Object.hasOwn(n, "schemaVersion") && n.schemaVersion !== 1) return $c("INVALID_CLOCK", "Clock schema version must be 1.");
	if (Object.hasOwn(n, "revision") && (!el(n.revision) || n.revision < 1)) return $c("INVALID_CLOCK", "Clock revision must be a positive safe integer.");
	if (Object.hasOwn(n, "timeEvidence") && !cl(n.timeEvidence).ok) return $c("INVALID_CLOCK", "Clock time evidence must retain accepted provenance.");
	if (Object.hasOwn(n, "settledTimeEventIds") && !il(n.settledTimeEventIds)) return $c("INVALID_CLOCK", "Settled occurrence IDs must be a bounded string array.");
	for (let [e, t] of [
		["unit", "minute"],
		["originMinute", 0],
		["originDay", 1]
	]) if (Object.hasOwn(n, e) && n[e] !== t) return $c("INVALID_CALENDAR", "This calendar uses minute units with minute zero at Day 1.");
	return {
		ok: !0,
		data: n
	};
}
function sl(e) {
	let t = Qc(e);
	return t.ok ? {
		ok: !0,
		data: t.data.value
	} : $c("OUTPUT_LIMIT", "Projection exceeds the bounded plain-data DTO budget.");
}
function cl(e) {
	if (!nl(e)) return $c("INVALID_EVIDENCE", "Evidence must be a plain record.");
	let t = tl(e, "kind");
	if (![
		"explicit",
		"authored-rule",
		"validated-extraction",
		"estimate",
		"vague"
	].includes(t)) return $c("INVALID_EVIDENCE", "Use a supported time evidence kind.");
	let n = t === "estimate" ? [
		"kind",
		"origin",
		"acceptancePolicy",
		"lineage"
	] : ["kind", "origin"];
	if (Object.keys(e).some((e) => !n.includes(e))) return $c("INVALID_EVIDENCE", "Evidence contains unsupported or contradictory fields.");
	let r = typeof tl(e, "origin") == "string" && e.origin.trim().length > 0;
	if (Object.hasOwn(e, "origin") && !r) return $c("INVALID_EVIDENCE", "Evidence origin must be nonempty text.");
	if (t === "estimate" && Object.hasOwn(e, "acceptancePolicy") && !["accept", "unresolved"].includes(e.acceptancePolicy)) return $c("INVALID_EVIDENCE", "Estimate acceptance policy must be accept or unresolved.");
	if (Object.hasOwn(e, "lineage")) {
		let t = e.lineage;
		if (!Array.isArray(t) || t.length === 0 || !t.every((e) => typeof e == "string" && e.trim().length > 0) || new Set(t).size !== t.length || !t.includes(e.origin)) return $c("INVALID_EVIDENCE", "Estimate lineage must contain distinct nonempty text origins including the current origin.");
		if (t.length > 64) return $c("EVIDENCE_LIMIT", "Estimate provenance exceeds 64 sources; hold the entire time projection.");
	}
	return t === "vague" || t === "estimate" && (!r || tl(e, "acceptancePolicy") !== "accept") ? $c("UNRESOLVED_TIME", "Estimated or vague time needs an explicit accepted authored rule.") : ["authored-rule", "validated-extraction"].includes(t) && !r ? $c("INVALID_EVIDENCE", "Rule and extraction evidence must identify their origin.") : {
		ok: !0,
		data: e
	};
}
new TextEncoder();
//#endregion
//#region src/ui/story-document-setup.js
var ll = (e, t) => ({
	ok: !1,
	error: {
		code: e,
		message: t
	}
});
function ul(e, t, n = 0) {
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
	return al(r, {
		kind: "duration",
		minutes: 0
	}).ok ? {
		ok: !0,
		data: { text: JSON.stringify(r, null, 2) }
	} : ll("INVALID_CLOCK_TEMPLATE", "Choose explicit clock/calendar IDs and a nonnegative whole story minute.");
}
//#endregion
//#region ui/StoryDocuments.svelte
var dl = /* @__PURE__ */ K("<p role=\"alert\" class=\"svelte-1t33cem\"> </p>"), fl = /* @__PURE__ */ K("<option class=\"svelte-1t33cem\"> </option>"), pl = /* @__PURE__ */ K("<label class=\"svelte-1t33cem\">Actor ID<input aria-label=\"Actor ID\" maxlength=\"128\" class=\"svelte-1t33cem\"/></label>"), ml = /* @__PURE__ */ K("<label class=\"svelte-1t33cem\">CSV columns, comma separated<input aria-label=\"CSV columns\" class=\"svelte-1t33cem\"/></label>"), hl = /* @__PURE__ */ K("<details class=\"svelte-1t33cem\"><summary class=\"svelte-1t33cem\">Story clock template</summary><label class=\"svelte-1t33cem\">Calendar ID<input aria-label=\"Calendar ID\" class=\"svelte-1t33cem\"/></label><label class=\"svelte-1t33cem\">Starting story minute<input aria-label=\"Starting story minute\" type=\"number\" min=\"0\" step=\"1\" class=\"svelte-1t33cem\"/></label><button type=\"button\" class=\"svelte-1t33cem\">Use story clock template</button><p class=\"svelte-1t33cem\">Midnight on the first day is minute 0. The clock advances through graph events, using explicit story time.</p></details>"), gl = /* @__PURE__ */ K("<p role=\"status\" class=\"svelte-1t33cem\"> </p>"), _l = /* @__PURE__ */ K("<div class=\"pc-story-documents svelte-1t33cem\"><p class=\"svelte-1t33cem\"> </p> <p class=\"svelte-1t33cem\">Manage the documents used by your workflows here. Updating an authorization or its initial template leaves existing canonical document content intact. Read File and Write File use these target IDs.</p> <!> <label class=\"svelte-1t33cem\">Workflow data document<select aria-label=\"Workflow data document\" class=\"svelte-1t33cem\"><option class=\"svelte-1t33cem\">New document authorization</option><!></select></label> <div class=\"pc-document-actions svelte-1t33cem\"><button type=\"button\" class=\"svelte-1t33cem\">Load initial template</button><button type=\"button\" class=\"svelte-1t33cem\">Remove authorization</button><button type=\"button\" class=\"svelte-1t33cem\">Refresh scope</button></div> <form class=\"svelte-1t33cem\"><label class=\"svelte-1t33cem\">Logical target ID<input aria-label=\"Logical target ID\" maxlength=\"128\" placeholder=\"souls.json\" class=\"svelte-1t33cem\"/></label> <label class=\"svelte-1t33cem\">Document name<input aria-label=\"Document name\" maxlength=\"256\" class=\"svelte-1t33cem\"/></label> <label class=\"svelte-1t33cem\">Format<select aria-label=\"Document format\" class=\"svelte-1t33cem\"><option class=\"svelte-1t33cem\">JSON</option><option class=\"svelte-1t33cem\">JSON Lines</option><option class=\"svelte-1t33cem\">CSV</option><option class=\"svelte-1t33cem\">Plain text</option><option class=\"svelte-1t33cem\">Markdown</option></select></label> <label class=\"svelte-1t33cem\">Visibility<select aria-label=\"Document visibility\" class=\"svelte-1t33cem\"><option class=\"svelte-1t33cem\">Public</option><option class=\"svelte-1t33cem\">Hidden</option><option class=\"svelte-1t33cem\">Actor private</option></select></label> <!> <!> <!> <label class=\"svelte-1t33cem\">Initial template<textarea aria-label=\"Initial template\" rows=\"7\" maxlength=\"100000\" class=\"svelte-1t33cem\"></textarea></label> <p class=\"svelte-1t33cem\">JSON templates preserve your chosen object or list structure. CSV uses the named columns. Existing authorizations require explicit template loading before editing.</p> <!><!> <footer class=\"svelte-1t33cem\"><button type=\"button\" class=\"svelte-1t33cem\">Close</button><button type=\"submit\" class=\"svelte-1t33cem\"> </button></footer></form></div>");
function vl(e, t) {
	He(t, !0);
	let n = /* @__PURE__ */ L(""), r = /* @__PURE__ */ L(""), i = /* @__PURE__ */ L(""), a = /* @__PURE__ */ L("json"), o = /* @__PURE__ */ L(""), s = /* @__PURE__ */ L("public"), c = /* @__PURE__ */ L(""), l = /* @__PURE__ */ L(""), u = /* @__PURE__ */ L(!1), d = /* @__PURE__ */ L(""), f = /* @__PURE__ */ L(""), p = /* @__PURE__ */ L(!1), m = /* @__PURE__ */ L("story-calendar"), h = /* @__PURE__ */ L(0), g = "", _ = 0;
	function v() {
		R(r, ""), R(i, ""), R(a, "json"), R(o, ""), R(s, "public"), R(c, ""), R(l, ""), R(p, !1), R(d, ""), R(f, "");
	}
	Sn(() => {
		t.view.key !== g && (g = t.view.key, _++, R(u, !1), R(n, ""), v());
	});
	function y() {
		_++, R(u, !1), v();
		let e = t.view.documents.find((e) => e.targetId === U(n));
		e && (R(r, e.targetId, !0), R(i, e.name, !0), R(a, e.format, !0), R(s, e.visibility.kind, !0), R(c, e.visibility.kind === "actor-private" ? e.visibility.actorId : "", !0), R(l, e.columns?.join(", ") ?? "", !0));
	}
	function b() {
		let e = ul(U(r), U(m), U(h));
		e.ok ? (R(o, e.data.text, !0), R(d, "")) : R(d, e.error.message, !0);
	}
	async function x(e) {
		if (!t.actions || U(u) || !t.view.key) return;
		let m = t.view.key, h = ++_;
		R(u, !0), R(d, ""), R(f, "");
		try {
			let u;
			if (e === "load") u = await t.actions.load(m, U(n));
			else if (e === "remove") u = await t.actions.remove(m, U(n));
			else {
				let e = {
					targetId: U(r),
					name: U(i),
					format: U(a),
					content: U(o),
					visibility: U(s) === "actor-private" ? {
						kind: U(s),
						actorId: U(c)
					} : { kind: U(s) }
				};
				U(a) === "csv" && (e.columns = U(l).split(",").map((e) => e.trim()).filter(Boolean)), u = await t.actions.save(m, e);
			}
			if (m !== t.view.key || h !== _) return;
			if (!u?.ok) {
				R(d, u?.error?.message ?? "Workflow Data setup could not be applied.", !0);
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
			m === t.view.key && h === _ && R(d, "Workflow Data setup could not be applied.");
		} finally {
			m === t.view.key && h === _ && R(u, !1);
		}
	}
	var S = _l(), C = z(S), w = z(C);
	F(C);
	var T = V(C, 4), E = (e) => {
		var n = dl(), r = z(n, !0);
		F(n), H(() => J(r, t.view.issue)), q(e, n);
	};
	Y(T, (e) => {
		t.view.issue && e(E);
	});
	var D = V(T, 2), O = V(z(D)), k = z(O);
	k.value = k.__value = "", X(V(k), 17, () => t.view.documents, (e) => e.targetId, (e, t) => {
		var n = fl(), r = z(n);
		F(n);
		var i = {};
		H(() => {
			J(r, `${U(t).name ?? ""} (${U(t).targetId ?? ""}, ${U(t).format ?? ""}, ${U(t).visibility.kind ?? ""})`), i !== (i = U(t).targetId) && (n.value = (n.__value = U(t).targetId) ?? "");
		}), q(e, n);
	}), F(O), F(D);
	var A = V(D, 2), j = z(A), M = V(j), ee = V(M);
	F(A);
	var te = V(A, 2), ne = z(te), re = V(z(ne));
	Z(re), F(ne);
	var ie = V(ne, 2), ae = V(z(ie));
	Z(ae), F(ie);
	var oe = V(ie, 2), se = V(z(oe)), ce = z(se);
	ce.value = ce.__value = "json";
	var le = V(ce);
	le.value = le.__value = "jsonl";
	var ue = V(le);
	ue.value = ue.__value = "csv";
	var de = V(ue);
	de.value = de.__value = "text";
	var fe = V(de);
	fe.value = fe.__value = "markdown", F(se), F(oe);
	var pe = V(oe, 2), me = V(z(pe)), he = z(me);
	he.value = he.__value = "public";
	var ge = V(he);
	ge.value = ge.__value = "hidden";
	var _e = V(ge);
	_e.value = _e.__value = "actor-private", F(me), F(pe);
	var ve = V(pe, 2), ye = (e) => {
		var t = pl(), n = V(z(t));
		Z(n), F(t), H(() => n.disabled = U(u)), Di(n, () => U(c), (e) => R(c, e)), q(e, t);
	};
	Y(ve, (e) => {
		U(s) === "actor-private" && e(ye);
	});
	var be = V(ve, 2), xe = (e) => {
		var t = ml(), n = V(z(t));
		Z(n), F(t), H(() => n.disabled = U(u)), Di(n, () => U(l), (e) => R(l, e)), q(e, t);
	};
	Y(be, (e) => {
		U(a) === "csv" && e(xe);
	});
	var Se = V(be, 2), Ce = (e) => {
		var t = hl(), i = V(z(t)), a = V(z(i));
		Z(a), F(i);
		var o = V(i), s = V(z(o));
		Z(s), F(o);
		var c = V(o);
		je(), F(t), H((e) => {
			a.disabled = U(u), s.disabled = U(u), c.disabled = e;
		}, [() => !U(r).trim() || U(u) || !!U(n) && !U(p)]), Di(a, () => U(m), (e) => R(m, e)), Di(s, () => U(h), (e) => R(h, e)), G("click", c, b), q(e, t);
	};
	Y(Se, (e) => {
		U(a) === "json" && e(Ce);
	});
	var we = V(Se, 2), Te = V(z(we));
	it(Te), F(we);
	var Ee = V(we, 4), De = (e) => {
		var t = dl(), n = z(t, !0);
		F(t), H(() => J(n, U(d))), q(e, t);
	};
	Y(Ee, (e) => {
		U(d) && e(De);
	});
	var N = V(Ee), Oe = (e) => {
		var n = gl(), r = z(n, !0);
		F(n), H(() => J(r, U(f) || t.view.notice)), q(e, n);
	};
	Y(N, (e) => {
		(U(f) || t.view.notice) && e(Oe);
	});
	var P = V(N, 2), ke = z(P), Ae = V(ke), Me = z(Ae, !0);
	F(Ae), F(P), F(te), F(S), H((e) => {
		J(w, `Active user: ${(t.view.scope.userId || "Unavailable") ?? ""} · Chat: ${(t.view.scope.chatId || "Unavailable") ?? ""}`), O.disabled = U(u), j.disabled = !U(n) || U(u), M.disabled = !U(n) || U(u), ee.disabled = U(u), re.disabled = !!U(n) || U(u), ae.disabled = U(u), se.disabled = !!U(n) || U(u), me.disabled = U(u), Te.disabled = U(u) || !!U(n) && !U(p), Q(Te, "placeholder", U(a) === "json" ? "[]" : ""), Ae.disabled = e, J(Me, U(u) ? "Saving…" : "Save authorization");
	}, [() => !t.actions || !t.view.key || !U(r).trim() || !U(i).trim() || U(u) || !!U(n) && !U(p) || U(s) === "actor-private" && !U(c).trim()]), G("change", O, y), gi(O, () => U(n), (e) => R(n, e)), G("click", j, () => x("load")), G("click", M, () => x("remove")), G("click", ee, () => t.actions?.refresh()), W("submit", te, (e) => {
		e.preventDefault(), x("save");
	}), Di(re, () => U(r), (e) => R(r, e)), Di(ae, () => U(i), (e) => R(i, e)), gi(se, () => U(a), (e) => R(a, e)), gi(me, () => U(s), (e) => R(s, e)), Di(Te, () => U(o), (e) => R(o, e)), G("click", ke, function(...e) {
		t.close?.apply(this, e);
	}), q(e, S), Ue();
}
Tr(["change", "click"]);
//#endregion
//#region ui/RecallOverview.svelte
var yl = /* @__PURE__ */ K("<p aria-label=\"Recall scope\" class=\"svelte-ejm25z\"> </p>"), bl = /* @__PURE__ */ K("<p role=\"alert\" class=\"svelte-ejm25z\"> </p>"), xl = /* @__PURE__ */ K("<p class=\"svelte-ejm25z\">Add a Recall Shortcut to the open unified workflow for the active character. Configure its actor, memory set and policy in Details, then enable Lattice.</p>"), Sl = /* @__PURE__ */ K("<p class=\"svelte-ejm25z\"> </p>"), Cl = /* @__PURE__ */ K("<li><button type=\"button\"> </button></li>"), wl = /* @__PURE__ */ K("<fieldset class=\"svelte-ejm25z\"><legend class=\"svelte-ejm25z\"> </legend><p role=\"status\" class=\"svelte-ejm25z\"> </p> <p class=\"svelte-ejm25z\"> </p> <!> <!> <!> <div class=\"pc-recall-overview-actions svelte-ejm25z\"><button type=\"button\" data-recall-queue=\"\">Queue recall</button><button type=\"button\">Cancel recall</button></div> <ul aria-label=\"Matching nodes\"></ul> <small class=\"svelte-ejm25z\"> </small></fieldset>"), Tl = /* @__PURE__ */ K("<p class=\"svelte-ejm25z\">Queue a memory set for the next reply, generated swipe, or both. Matching nodes share one request.</p> <!> <!> <!> <!> <p class=\"svelte-ejm25z\"><button type=\"button\">Refresh recall state</button></p> <small class=\"svelte-ejm25z\">Shortcuts use physical keys and pause while typing. Automatic Recall uses its own conditions. Queue and Cancel do not generate a reply.</small>", 1);
function El(e, t) {
	He(t, !0);
	let n = /* @__PURE__ */ L(""), r = /* @__PURE__ */ L("");
	async function i(e, i, a) {
		if (!U(n)) {
			R(n, e, !0), R(r, "");
			try {
				let e = await t.actions?.change(i, a, "all");
				e?.ok !== !0 && R(r, e?.error.message ?? "Memory recall is unavailable.", !0);
			} catch {
				R(r, "Memory recall could not be updated.");
			} finally {
				R(n, "");
			}
		}
	}
	var a = Tl(), o = V(B(a), 2), s = (e) => {
		var n = yl(), r = z(n);
		F(n), H(() => J(r, `User ${t.view.scope.userId ?? ""} · Chat ${t.view.scope.chatId ?? ""} · Actor ${t.view.scope.actorId ?? ""}`)), q(e, n);
	};
	Y(o, (e) => {
		t.view?.scope && e(s);
	});
	var c = V(o, 2), l = (e) => {
		var n = bl(), i = z(n, !0);
		F(n), H(() => J(i, U(r) || t.view?.issue)), q(e, n);
	};
	Y(c, (e) => {
		(t.view?.issue || U(r)) && e(l);
	});
	var u = V(c, 2), d = (e) => {
		q(e, xl());
	};
	Y(u, (e) => {
		t.view?.sets.length || e(d);
	});
	var f = V(u, 2);
	X(f, 17, () => t.view?.sets ?? [], (e) => e.memorySetId, (e, r) => {
		var a = wl(), o = z(a), s = z(o, !0);
		F(o);
		var c = V(o), l = z(c, !0);
		F(c);
		var u = V(c, 2), d = z(u);
		F(u);
		var f = V(u, 2), p = (e) => {
			var t = Sl(), n = z(t);
			F(t), H(() => J(n, `Remaining: ${U(r).remainingText ?? ""}`)), q(e, t);
		};
		Y(f, (e) => {
			U(r).queued && e(p);
		});
		var m = V(f, 2), h = (e) => {
			var t = Sl(), n = z(t);
			F(t), H(() => J(n, `Pending generations: ${U(r).pendingCount ?? ""}`)), q(e, t);
		};
		Y(m, (e) => {
			U(r).pendingCount && e(h);
		});
		var g = V(m, 2), _ = (e) => {
			var t = Sl(), n = z(t, !0);
			F(t), H(() => J(n, U(r).reason)), q(e, t);
		};
		Y(g, (e) => {
			U(r).reason && e(_);
		});
		var v = V(g, 2), y = z(v), b = V(y);
		F(v);
		var x = V(v, 2);
		X(x, 21, () => U(r).linkedNodes, (e) => e.nodeId, (e, n) => {
			var r = Cl(), i = z(r), a = z(i);
			F(i), F(r), H(() => {
				i.disabled = !t.actions, J(a, `${U(n).title ?? ""} · ${U(n).nodeId ?? ""}`);
			}), G("click", i, () => t.actions?.reveal(U(n).nodeId)), q(e, r);
		}), F(x);
		var S = V(x, 2), C = z(S);
		F(S), F(a), H((e) => {
			Q(a, "data-recall-set", U(r).memorySetId), J(s, U(r).memorySetId), J(l, U(r).statusText), J(d, `${U(r).targetLabel ?? ""} · ${U(r).useLabel ?? ""} · ${U(r).consumeLabel ?? ""}`), y.disabled = !!U(n) || !t.actions || !U(r).queueAllowed, Q(y, "aria-label", "Queue recall " + U(r).memorySetId), b.disabled = !!U(n) || !t.actions || !U(r).cancelAllowed, Q(b, "aria-label", "Cancel recall " + U(r).memorySetId), J(C, `${U(r).nodeIds.length ?? ""} linked ${U(r).nodeIds.length === 1 ? "node" : "nodes"}${e ?? ""}`);
		}, [() => U(r).hotkeys.length ? " · " + U(r).hotkeys.map((e) => e.label).join(", ") : ""]), G("click", y, () => i(U(r).memorySetId, U(r).nodeIds, "queue")), G("click", b, () => i(U(r).memorySetId, U(r).nodeIds, "cancel")), q(e, a);
	});
	var p = V(f, 2), m = z(p);
	F(p), je(2), H(() => m.disabled = !!U(n) || !t.actions), G("click", m, () => t.actions?.refresh()), q(e, a), Ue();
}
Tr(["click"]);
//#endregion
//#region ui/ConfigureNode.svelte
var Dl = /* @__PURE__ */ K("<option class=\"svelte-1srbsqt\"> </option>"), Ol = /* @__PURE__ */ K("<p class=\"svelte-1srbsqt\">Authorize a document in Workflow › Configure › Workflow Data, then reopen node creation.</p>"), kl = /* @__PURE__ */ K("<label class=\"svelte-1srbsqt\">Workflow data document<select aria-label=\"Workflow data document\" class=\"svelte-1srbsqt\"><option class=\"svelte-1srbsqt\">Choose an authorized target</option><!></select></label><!>", 1), Al = /* @__PURE__ */ K("<label class=\"svelte-1srbsqt\">Pinned Data helper<select aria-label=\"Pinned Data helper\" class=\"svelte-1srbsqt\"><option class=\"svelte-1srbsqt\">Choose an existing item/result helper</option><!></select></label><p class=\"svelte-1srbsqt\">Helpers use exact pinned versions with Data item and result ports. Set iteration mode and requestBoundPerIteration in the controls below.</p>", 1), jl = /* @__PURE__ */ K("<p role=\"alert\" class=\"svelte-1srbsqt\"> </p>"), Ml = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay svelte-1srbsqt\"><div class=\"pc-workspace-dialog pc-configure-node svelte-1srbsqt\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Configure node\" tabindex=\"-1\"><header class=\"svelte-1srbsqt\"><h2 class=\"svelte-1srbsqt\"> </h2><button type=\"button\" aria-label=\"Close node configuration\" class=\"svelte-1srbsqt\">×</button></header> <p class=\"svelte-1srbsqt\">Complete the required settings before creating the node. Cancel leaves the graph unchanged.</p> <form class=\"svelte-1srbsqt\"><label class=\"svelte-1srbsqt\">Stage<select aria-label=\"Node stage\" class=\"svelte-1srbsqt\"><option class=\"svelte-1srbsqt\">Preparation</option><option class=\"svelte-1srbsqt\">Response</option></select></label> <!> <!> <label class=\"svelte-1srbsqt\">Declared node controls<textarea aria-label=\"Node controls JSON\" rows=\"14\" maxlength=\"200000\" class=\"svelte-1srbsqt\"></textarea></label> <!> <footer class=\"svelte-1srbsqt\"><button type=\"button\" class=\"svelte-1srbsqt\">Cancel</button><button type=\"submit\" class=\"svelte-1srbsqt\"> </button></footer></form></div></div>");
function Nl(e, t) {
	He(t, !0);
	let n, r = /* @__PURE__ */ L(""), i = /* @__PURE__ */ L("pre"), a = /* @__PURE__ */ L(""), o = /* @__PURE__ */ L(""), s = /* @__PURE__ */ L(!1), c = /* @__PURE__ */ L(""), l = "", u = 0, d = /* @__PURE__ */ I(() => t.view.operation === "read-file" || t.view.operation === "story-clock" || t.view.operation === "commit-outcomes");
	Sn(() => {
		if (t.view.key === l) return;
		l = t.view.key, u++, R(r, t.view.controls, !0), R(i, t.view.phase, !0), R(s, !1), R(c, "");
		try {
			let e = JSON.parse(U(r));
			R(a, e.targetId ?? e.clockId ?? "", !0), R(o, t.view.helpers.find((t) => JSON.stringify(t.ref) === JSON.stringify(e.helper))?.key ?? "", !0);
		} catch {
			R(a, ""), R(o, "");
		}
		let e = l;
		pr().then(() => {
			t.view.key === e && n?.querySelector("select,textarea,input")?.focus({ preventScroll: !0 });
		});
	}), Ni(() => {
		let e = document.activeElement;
		return () => e?.focus({ preventScroll: !0 });
	});
	function f(e, t) {
		try {
			let n = JSON.parse(U(r));
			if (!n || Array.isArray(n) || typeof n != "object") throw Error();
			n[e] = t, R(r, JSON.stringify(n, null, 2), !0), R(c, "");
		} catch {
			R(c, "Use a JSON object before selecting a configured value.");
		}
	}
	async function p(e) {
		if (e.preventDefault(), !t.actions || U(s)) return;
		let n = t.view.key, a = ++u;
		R(s, !0), R(c, "");
		try {
			let e = await t.actions.apply(n, U(r), U(i));
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
	var h = Ml(), g = z(h), _ = z(g), v = z(_), y = z(v);
	F(v);
	var b = V(v);
	F(_);
	var x = V(_, 4), S = z(x), C = V(z(S)), w = z(C);
	w.value = w.__value = "pre";
	var T = V(w);
	T.value = T.__value = "post", F(C), F(S);
	var E = V(S, 2), D = (e) => {
		var n = kl(), r = B(n), i = V(z(r)), o = z(i);
		o.value = o.__value = "", X(V(o), 17, () => t.view.targets.filter((e) => !["story-clock", "commit-outcomes"].includes(t.view.operation) || e.format === "json"), (e) => e.targetId, (e, t) => {
			var n = Dl(), r = z(n);
			F(n);
			var i = {};
			H(() => {
				J(r, `${U(t).name ?? ""} (${U(t).targetId ?? ""})`), i !== (i = U(t).targetId) && (n.value = (n.__value = U(t).targetId) ?? "");
			}), q(e, n);
		}), F(i), F(r);
		var c = V(r), l = (e) => {
			q(e, Ol());
		};
		Y(c, (e) => {
			t.view.targets.length || e(l);
		}), H(() => i.disabled = U(s)), G("change", i, () => f(t.view.operation === "story-clock" ? "clockId" : "targetId", U(a))), gi(i, () => U(a), (e) => R(a, e)), q(e, n);
	};
	Y(E, (e) => {
		U(d) && e(D);
	});
	var O = V(E, 2), k = (e) => {
		var n = Al(), r = B(n), i = V(z(r)), a = z(i);
		a.value = a.__value = "", X(V(a), 17, () => t.view.helpers, (e) => e.key, (e, t) => {
			var n = Dl(), r = z(n);
			F(n);
			var i = {};
			H(() => {
				J(r, `${U(t).label ?? ""}${U(t).stateful ? " (projected state)" : ""}`), i !== (i = U(t).key) && (n.value = (n.__value = U(t).key) ?? "");
			}), q(e, n);
		}), F(i), F(r), je(), H(() => i.disabled = U(s)), G("change", i, () => {
			let e = t.view.helpers.find((e) => e.key === U(o));
			e && f("helper", e.ref);
		}), gi(i, () => U(o), (e) => R(o, e)), q(e, n);
	};
	Y(O, (e) => {
		t.view.operation === "for-each" && e(k);
	});
	var A = V(O, 2), j = V(z(A));
	it(j), F(A);
	var M = V(A, 2), ee = (e) => {
		var t = jl(), n = z(t, !0);
		F(t), H(() => J(n, U(c))), q(e, t);
	};
	Y(M, (e) => {
		U(c) && e(ee);
	});
	var te = V(M, 2), ne = z(te), re = V(ne), ie = z(re, !0);
	F(re), F(te), F(x), F(g), ji(g, (e) => n = e, () => n), F(h), H(() => {
		J(y, `Configure ${t.view.title ?? ""}`), C.disabled = t.view.phaseLocked || U(s), j.disabled = U(s), re.disabled = !t.actions || U(s), J(ie, U(s) ? "Preparing…" : "Create node");
	}), W("keydown", g, m, !0), W("paste", g, (e) => e.stopPropagation()), G("click", b, () => t.actions?.cancel(t.view.key)), W("submit", x, p), gi(C, () => U(i), (e) => R(i, e)), Di(j, () => U(r), (e) => R(r, e)), G("click", ne, () => t.actions?.cancel(t.view.key)), q(e, h), Ue();
}
Tr(["click", "change"]);
//#endregion
//#region ui/DocumentPrompt.svelte
var Pl = /* @__PURE__ */ K("<p class=\"svelte-ppe66w\">Save your changes before continuing, or continue without saving.</p>"), Fl = /* @__PURE__ */ K("<p class=\"svelte-ppe66w\">Download a JSON copy and save it using your browser. To switch documents after downloading, repeat the action and choose Don't Save.</p>"), Il = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay\"><div class=\"pc-workspace-dialog pc-document-prompt svelte-ppe66w\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Save workflow changes?\" tabindex=\"-1\"><h2 class=\"svelte-ppe66w\">Save workflow changes?</h2> <p class=\"svelte-ppe66w\"><strong class=\"svelte-ppe66w\"> </strong> has unsaved changes.</p> <!> <footer class=\"svelte-ppe66w\"><button type=\"button\" class=\"svelte-ppe66w\"> </button><button type=\"button\" class=\"svelte-ppe66w\">Don't Save</button><button type=\"button\" class=\"svelte-ppe66w\">Cancel</button></footer></div></div>");
function Ll(e, t) {
	He(t, !0);
	let n = Mi(t, "native", 3, !0), r, i;
	Ni(() => {
		let e = document.activeElement;
		return i.focus({ preventScroll: !0 }), () => e?.focus({ preventScroll: !0 });
	});
	function a(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), t.actions?.choose("cancel")), e.key === "Tab") {
			let t = [...r.querySelectorAll("button:not(:disabled)")], n = t.indexOf(document.activeElement);
			e.shiftKey && n <= 0 && (e.preventDefault(), t.at(-1)?.focus()), !e.shiftKey && (n < 0 || n === t.length - 1) && (e.preventDefault(), t[0]?.focus());
		}
	}
	var o = Il(), s = z(o), c = V(z(s), 2), l = z(c), u = z(l, !0);
	F(l), je(), F(c);
	var d = V(c, 2), f = (e) => {
		q(e, Pl());
	}, p = (e) => {
		q(e, Fl());
	};
	Y(d, (e) => {
		n() ? e(f) : e(p, -1);
	});
	var m = V(d, 2), h = z(m), g = z(h, !0);
	F(h);
	var _ = V(h), v = V(_);
	ji(v, (e) => i = e, () => i), F(m), F(s), ji(s, (e) => r = e, () => r), F(o), H(() => {
		J(u, t.view.name), J(g, n() ? "Save" : "Download JSON");
	}), W("keydown", s, a, !0), W("paste", s, (e) => e.stopPropagation(), !0), G("click", h, () => t.actions?.choose("save")), G("click", _, () => t.actions?.choose("discard")), G("click", v, () => t.actions?.choose("cancel")), q(e, o), Ue();
}
Tr(["click"]);
//#endregion
//#region ui/NodeSearch.svelte
var Rl = /* @__PURE__ */ K("<label class=\"pc-context-check svelte-golf61\"><input type=\"checkbox\" class=\"svelte-golf61\"/>Context sensitive</label>"), zl = /* @__PURE__ */ K("<span class=\"pc-search-context svelte-golf61\"> </span>"), Bl = /* @__PURE__ */ K("<label class=\"pc-search-field svelte-golf61\"><input type=\"search\" aria-label=\"Search nodes and subgraphs\" placeholder=\"Search…\" autocomplete=\"off\" role=\"combobox\" aria-expanded=\"true\" class=\"svelte-golf61\"/></label> <!> <!>", 1), Vl = /* @__PURE__ */ K("<p class=\"pc-search-context svelte-golf61\">Choose the named port to connect.</p>"), Hl = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-search-result svelte-golf61\" role=\"option\"><span class=\"svelte-golf61\"> </span> <span class=\"pc-family svelte-golf61\"> </span></button>"), Ul = /* @__PURE__ */ K("<p class=\"pc-empty svelte-golf61\">No nodes match.</p>"), Wl = /* @__PURE__ */ K("<p class=\"pc-feedback svelte-golf61\" role=\"status\"> </p>"), Gl = /* @__PURE__ */ K("<div class=\"pc-node-search svelte-golf61\" role=\"dialog\" aria-modal=\"false\" tabindex=\"-1\"><!> <div class=\"pc-search-results svelte-golf61\" role=\"listbox\"></div> <!></div>");
function Kl(e, t) {
	let n = Lr();
	He(t, !0);
	let r = Mi(t, "view", 3, null), i = Mi(t, "actions", 19, () => ({})), a = /* @__PURE__ */ L(void 0), o = /* @__PURE__ */ L(void 0), s = /* @__PURE__ */ L(""), c = /* @__PURE__ */ L(0), l = /* @__PURE__ */ L(8), u = /* @__PURE__ */ L(8), d, f, p = (e) => [
		e.label,
		e.family,
		e.purpose ?? "",
		e.shortcode ?? "",
		...e.searchAliases ?? []
	].join(" ").toLocaleLowerCase(), m = /* @__PURE__ */ I(() => (r()?.choices ?? []).filter((e) => p(e).includes(U(s).toLocaleLowerCase().trim()))), h = /* @__PURE__ */ I(() => r()?.mode === "ports" ? r().ports : U(m)), g = (e) => "id" in e ? e.id : e.portId, _ = (e) => !!r()?.readOnly || "disabledReason" in e && !!e.disabledReason, v = /* @__PURE__ */ I(() => U(h).filter((e) => !_(e))), y = /* @__PURE__ */ I(() => U(v)[Math.min(U(c), Math.max(0, U(v).length - 1))]), b = (e) => ({
		Input: "#96ad52",
		Shaping: "#589aab",
		Surface: "#92c9ad",
		Transpose: "#9080b6",
		Derive: "#b65b9e",
		Output: "#c96d82",
		Subgraphs: "#a3aa99"
	})[e] ?? "#a1a59b";
	function x() {
		if (!r() || !U(a)) return;
		let e = U(a).getBoundingClientRect(), t = document.documentElement.clientWidth || window.innerWidth, n = document.documentElement.clientHeight || window.innerHeight;
		R(l, Math.max(8, Math.min(r().screenAnchor.x, t - e.width - 8)), !0), R(u, Math.max(8, Math.min(r().screenAnchor.y, n - e.height - 8)), !0);
	}
	Sn(() => {
		let e = r()?.key, t = r()?.mode, n = r()?.screenAnchor;
		if (e === void 0 || !n) return;
		let i = d !== e || f !== t;
		d !== e && R(s, ""), i && R(c, 0), d = e, f = t, pr().then(() => {
			r()?.key === e && r().mode === t && (x(), i && (t === "nodes" ? U(o)?.focus() : (U(a)?.querySelector("[data-port]:not(:disabled)") ?? U(a))?.focus()));
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
		].includes(e.key) ? (e.preventDefault(), R(c, e.key === "Home" ? 0 : e.key === "End" ? Math.max(0, U(v).length - 1) : U(v).length ? (U(c) + (e.key === "ArrowDown" ? 1 : -1) + U(v).length) % U(v).length : 0, !0)) : e.key === "Enter" && (e.preventDefault(), S(U(y)));
	}
	Sn(() => {
		if (!r()) return;
		let e = (e) => {
			U(a) && !U(a).contains(e.target) && i().dismiss?.();
		};
		return window.addEventListener("pointerdown", e, !0), () => window.removeEventListener("pointerdown", e, !0);
	});
	var T = Ir();
	W("resize", rn, x);
	var E = B(T), D = (e) => {
		var t = Gl();
		let i;
		var d = z(t), f = (e) => {
			var t = Bl(), i = B(t), a = z(i);
			Z(a), ji(a, (e) => R(o, e), () => U(o)), F(i);
			var l = V(i, 2), u = (e) => {
				var t = Rl(), n = z(t);
				Z(n), je(), F(t), H(() => {
					Ci(n, r().contextSensitive), n.disabled = r().readOnly;
				}), G("change", n, C), q(e, t);
			};
			Y(l, (e) => {
				r().origin && e(u);
			});
			var d = V(l, 2), f = (e) => {
				var t = zl(), n = z(t, !0);
				F(t), H(() => J(n, (r().origin.dir === "out" ? "Accepts " : "Produces ") + r().origin.kind)), q(e, t);
			};
			Y(d, (e) => {
				r().origin && e(f);
			}), H((e) => {
				Q(a, "aria-controls", n + "-results"), Q(a, "aria-activedescendant", e);
			}, [() => U(y) ? n + "-item-" + U(h).indexOf(U(y)) : void 0]), G("input", a, () => R(c, 0)), Di(a, () => U(s), (e) => R(s, e)), q(e, t);
		}, p = (e) => {
			q(e, Vl());
		};
		Y(d, (e) => {
			r().mode === "nodes" ? e(f) : e(p, -1);
		});
		var m = V(d, 2);
		X(m, 21, () => U(h), (e) => g(e), (e, t) => {
			var r = Hl(), i = z(r), a = z(i, !0);
			F(i);
			var o = V(i, 1, !0);
			o.nodeValue = " ";
			var s = V(o);
			let l;
			var u = z(s, !0);
			F(s), F(r), H((e, n, i, o) => {
				Q(r, "aria-selected", U(y) === U(t)), Q(r, "id", e), Q(r, "data-choice", "id" in U(t) ? U(t).id : void 0), Q(r, "data-port", "portId" in U(t) ? U(t).portId : void 0), r.disabled = n, Q(r, "title", "disabledReason" in U(t) ? U(t).disabledReason : void 0), J(a, i), l = pi(s, "", l, o), J(u, "family" in U(t) ? U(t).family : U(t).kind);
			}, [
				() => n + "-item-" + U(h).indexOf(U(t)),
				() => _(U(t)),
				() => U(t).label || g(U(t)),
				() => ({ color: "family" in U(t) ? b(U(t).family) : void 0 })
			]), G("click", r, () => S(U(t))), W("focus", r, () => {
				let e = U(v).indexOf(U(t));
				e >= 0 && R(c, e, !0);
			}), q(e, r);
		}, (e) => {
			q(e, Ul());
		}), F(m);
		var x = V(m, 2), T = (e) => {
			var t = Wl(), n = z(t, !0);
			F(t), H(() => J(n, r().feedback)), q(e, t);
		};
		Y(x, (e) => {
			r().feedback && e(T);
		}), F(t), ji(t, (e) => R(a, e), () => U(a)), H(() => {
			Q(t, "aria-label", r().mode === "ports" ? "Choose connection port" : "Add node"), i = pi(t, "", i, {
				left: `${U(l) ?? ""}px`,
				top: `${U(u) ?? ""}px`
			}), Q(m, "id", n + "-results"), Q(m, "aria-label", r().mode === "ports" ? "Compatible ports" : "Nodes and subgraphs");
		}), G("keydown", t, w), q(e, t);
	};
	Y(E, (e) => {
		r() && e(D);
	}), q(e, T), Ue();
}
Tr([
	"keydown",
	"input",
	"change",
	"click"
]);
//#endregion
//#region ui/PinMenu.svelte
var ql = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-pin-action svelte-i73q0t\"> </button>"), Jl = /* @__PURE__ */ K("<p class=\"pc-empty svelte-i73q0t\">No attached links.</p>"), Yl = /* @__PURE__ */ K("<div class=\"pc-pin-menu svelte-i73q0t\" role=\"dialog\" aria-label=\"Pin actions\" aria-modal=\"false\" tabindex=\"-1\"><div class=\"pc-menu-head svelte-i73q0t\"><h2 class=\"svelte-i73q0t\"> </h2><button type=\"button\" aria-label=\"Close pin actions\" class=\"svelte-i73q0t\">Close</button></div> <p class=\"pc-kind svelte-i73q0t\"> </p> <!></div>");
function Xl(e, t) {
	He(t, !0);
	let n = Mi(t, "view", 3, null), r = Mi(t, "actions", 19, () => ({})), i = /* @__PURE__ */ L(void 0), a = /* @__PURE__ */ L(8), o = /* @__PURE__ */ L(8), s, c = (e) => !!e.disabled || !!n()?.readOnly && e.capability !== "navigation";
	function l() {
		if (!n() || !U(i)) return;
		let e = U(i).getBoundingClientRect(), t = document.documentElement.clientWidth || window.innerWidth, r = document.documentElement.clientHeight || window.innerHeight;
		R(a, Math.max(8, Math.min(n().screenAnchor.x, t - e.width - 8)), !0), R(o, Math.max(8, Math.min(n().screenAnchor.y, r - e.height - 8)), !0);
	}
	Sn(() => {
		let e = n()?.key, t = n()?.screenAnchor;
		if (e === void 0 || !t) return;
		let r = s !== e;
		s = e, pr().then(() => {
			n()?.key === e && (l(), r && (U(i)?.querySelector("[data-entry]:not(:disabled)") ?? U(i))?.focus());
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
		let t = [...U(i)?.querySelectorAll("[data-entry]:not(:disabled)") ?? []], a = t.indexOf(document.activeElement);
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
	var f = Ir();
	W("resize", rn, l);
	var p = B(f), m = (e) => {
		var t = Yl();
		let s;
		var l = z(t), f = z(l), p = z(f, !0);
		F(f);
		var m = V(f);
		F(l);
		var h = V(l, 2), g = z(h);
		F(h), X(V(h, 2), 17, () => n().entries, (e) => e.id, (e, t) => {
			var n = ql(), r = z(n, !0);
			F(n), H((e) => {
				Q(n, "data-entry", U(t).id), n.disabled = e, Q(n, "title", U(t).reason), J(r, U(t).label);
			}, [() => c(U(t))]), G("click", n, () => u(U(t))), q(e, n);
		}, (e) => {
			q(e, Jl());
		}), F(t), ji(t, (e) => R(i, e), () => U(i)), H(() => {
			s = pi(t, "", s, {
				left: `${U(a) ?? ""}px`,
				top: `${U(o) ?? ""}px`
			}), J(p, n().title), J(g, `${n().kind ?? ""}${n().readOnly ? " · Read only" : ""}`);
		}), G("keydown", t, d), G("click", m, () => r().dismiss?.()), q(e, t);
	};
	Y(p, (e) => {
		n() && e(m);
	}), q(e, f), Ue();
}
Tr(["keydown", "click"]);
//#endregion
//#region src/ui/node-palette.js
var Zl = "M3 7 12 2l9 5v10l-9 5-9-5ZM3 7l9 5 9-5M12 12v10", Ql = "M3 6l4-2 4 2v5l-4 2-4-2ZM3 6l4 2 4-2M7 8v5M13 6l4-2 4 2v5l-4 2-4-2ZM13 6l4 2 4-2M17 8v5M8 15l4-2 4 2v5l-4 2-4-2ZM8 15l4 2 4-2M12 17v5", $l = Object.freeze([
	{
		name: "Input",
		color: "#96ad52",
		icon: Zl
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
		icon: Zl
	},
	{
		name: "Subgraphs",
		color: "#a3aa99",
		icon: Ql
	}
].map((e) => Object.freeze(e))), eu = {
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
	Library: Ql,
	Routing: "M3 12h18m-7-7 7 7-7 7",
	Blocks: Zl,
	Reflect: "M21 12s-4-7-9-7-9 7-9 7 4 7 9 7 9-7 9-7ZM15 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0",
	Internalize: "M4 4h16v16H4M8 8l4 4 4-4M12 12v5",
	Express: "M4 4h16v12H9l-5 4ZM8 8h8M8 12h5",
	Memory: "M5 3h14v18H5ZM8 7h8M8 11h8M8 15h5",
	State: "M3 12h4l3-7 4 14 3-7h4"
}, tu = Object.freeze(Object.fromEntries(Object.entries(eu).map(([e, t]) => [e, Object.freeze({
	name: e,
	icon: t
})]))), nu = {
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
		"M8 3h13v13h-8l-5 5v-7M2 8h12m-3-3 3 3-3 3"
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
		eu.Planning
	],
	compose: [
		"Assembly",
		"co",
		eu.Assembly
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
		eu.Validation
	],
	"json-decode": [
		"Parsing",
		"jd",
		eu.Parsing
	],
	"select-fields": [
		"Extraction",
		"sf",
		eu.Extraction
	],
	guidance: [
		"Guidance",
		"gd",
		"M21 12a9 9 0 1 0-18 0 9 9 0 0 0 18 0ZM15 9l-2 4-4 2 2-4Z"
	],
	"review-gate": [
		"Review",
		"rg",
		"M2 10s4-6 9-6 9 6 9 6-4 6-9 6-9-6-9-6ZM13 10a2 2 0 1 0-4 0 2 2 0 0 0 4 0m1 9 3 3 5-6"
	],
	"apply-reply": [
		"Delivery",
		"ar",
		eu.Delivery
	],
	reroute: [
		"Routing",
		"rt",
		eu.Routing
	],
	reflect: [
		"Reflect",
		"rf",
		eu.Reflect
	],
	internalize: [
		"Internalize",
		"in",
		eu.Internalize
	],
	express: [
		"Express",
		"ex",
		eu.Express
	],
	context: [
		"Context",
		"cx",
		eu.Context
	],
	memory: [
		"Memory",
		"mm",
		eu.Memory
	],
	state: [
		"State",
		"sv",
		eu.State
	],
	condition: [
		"Validation",
		"cn",
		"M12 2 22 12 12 22 2 12Zm-4 10 3 3 5-6"
	],
	branch: [
		"Routing",
		"br",
		"M3 12h6m0 0 6-7h6m-4-3 4 3-4 3M9 12l6 7h6m-4-3 4 3-4 3"
	],
	join: [
		"Assembly",
		"jn",
		"M3 5h5l6 7-6 7H3M14 12h7m-4-4 4 4-4 4"
	],
	collect: [
		"Assembly",
		"cl",
		"M3 14v7h18v-7M7 3v12m-3-3 3 3 3-3M17 3v12m-3-3 3 3 3-3"
	],
	"confidence-gate": [
		"Validation",
		"cg",
		"M4 18a9 9 0 1 1 16 0M12 12l5-5M5 19h14M8 19v3m8-3v3"
	],
	"for-each": [
		"Routing",
		"fe",
		"M20 7a8 8 0 0 0-14-2L3 8m0-5v5h5M4 17a8 8 0 0 0 14 2l3-3m0 5v-5h-5M8 12h1m3 0h1m3 0h1"
	],
	decision: [
		"Analysis",
		"dc",
		"M4 3h16v18H4ZM7 8l2 2 3-4M14 8h3M7 15h3m4 0h3"
	],
	combine: [
		"Assembly",
		"cb",
		"M3 3h6v7H3ZM3 14h6v7H3ZM9 6h3l4 6-4 6H9M16 12h5m-3-3 3 3-3 3"
	],
	append: [
		"Assembly",
		"ap",
		"M14 2H4v20h14V6Zm0 0v4h4M7 10h5m-5 4h5M18 12v8m-4-4h8"
	],
	"render-notes": [
		"Delivery",
		"rn",
		"M4 3h16v12l-6 6H4Zm10 18v-6h6M8 7h8M8 11h8M8 15h3"
	],
	enrich: [
		"Assembly",
		"en",
		"M3 5h7M3 12h10M3 19h16M17 2l1.5 4.5L23 8l-4.5 1.5L17 14l-1.5-4.5L11 8l4.5-1.5Z"
	],
	"draft-text": [
		"Extraction",
		"dt",
		"M14 2H4v20h16V8Zm0 0v6h6M7 11h10M12 11v7M9 18h6"
	],
	extract: [
		"Extraction",
		"ec",
		"M3 3h18l-7 8v4h-4v-4ZM8 19h8v3H8Z"
	],
	"model-call": [
		"Analysis",
		"mc",
		"M8 3H4v14h5l-5 4M4 17h16V9M16 2l1.5 4.5L22 8l-4.5 1.5L16 14l-1.5-4.5L10 8l4.5-1.5Z"
	],
	"revise-draft": [
		"Revision",
		"rv",
		"M13 2H4v20h6M13 2v5h5V5ZM7 11h5m-5 4h3M12 18l7-7 3 3-7 7h-3Zm5-5 3 3"
	],
	"player-event-source": [
		"Sources",
		"pe",
		"M11 6a3 3 0 1 0-6 0 3 3 0 0 0 6 0M2 21v-4a6 6 0 0 1 12 0v4M19 8l-4 6h4l-1 7 5-8h-4Z"
	],
	"on-send": [
		"Sources",
		"os",
		"M3 5h18v14H3ZM3 5l9 7 9-7M12 14v8m-3-3 3 3 3-3"
	],
	"generate-reply": [
		"Sources",
		"gr",
		"M20 9V3H4v14h5l-5 4M14 12a5 5 0 1 0 7 7m0-5v5h-5"
	],
	"review-publish": [
		"Delivery",
		"pb",
		"M8 3H4v18h11M8 2h7v4H8ZM7 11l2 2 4-5M15 15h7m-3-3 3 3-3 3"
	],
	format: [
		"Parsing",
		"fm",
		"M5 3H2v18h3M19 3h3v18h-3M8 6h8M8 10h5M8 14h8M8 18h5"
	],
	"read-file": [
		"Sources",
		"rd",
		"M14 2H4v20h16v-5M14 2v5h6V7ZM8 12h14m-4-4 4 4-4 4"
	],
	"write-file": [
		"Delivery",
		"wf",
		"M14 2H6v7M6 17v5h14V8L14 2M14 2v6h6M2 13h12m-4-4 4 4-4 4"
	],
	"project-document": [
		"Assembly",
		"pd",
		"M13 2H3v12h14V6Zm0 0v4h4M6 9h7M8 18h13v4H8ZM11 14v4m-3-3 3 3 3-3"
	],
	"commit-clock": [
		"Delivery",
		"cc",
		"M20 10a8 8 0 1 0-8 10M12 5v7l-4 2M14 19l3 3 5-6"
	],
	"story-clock": [
		"Sources",
		"ck",
		"M21 12a9 9 0 1 0-18 0 9 9 0 0 0 18 0ZM12 6v6l4 3"
	],
	"time-trigger": [
		"Routing",
		"tt",
		"M19 13a7 7 0 1 0-14 0 7 7 0 0 0 14 0ZM12 9v4l3 2M2 5l4-3m12 0 4 3M7 19l-2 3m12-3 2 3"
	],
	"advance-time": [
		"Routing",
		"at",
		"M15 5a8 8 0 1 0 0 14M10 6v6l-3 2M14 12h8m-4-4 4 4-4 4"
	],
	"actor-context": [
		"Context",
		"ac",
		"M5 3H2v18h3M19 3h3v18h-3M15 8a3 3 0 1 0-6 0 3 3 0 0 0 6 0M7 19v-2a5 5 0 0 1 10 0v2"
	],
	"draft-event-source": [
		"Sources",
		"de",
		"M14 2H4v20h16V8Zm0 0v6h6M12 10l-4 5h4l-1 5 6-7h-5Z"
	],
	"event-normalize": [
		"Parsing",
		"ev",
		"M2 4h6M4 12h4M3 20h5M10 12h4m-2-2 2 2-2 2M17 4h5M17 12h5M17 20h5"
	],
	"prompted-memory": [
		"Memory",
		"pm",
		"M3 3h18v13h-8l-6 5v-5H3ZM7 7h4v6H7Zm6 0h4v6h-4M11 7l1 1 1-1"
	],
	"item-mention-trigger": [
		"Routing",
		"mt",
		"M3 3h9l9 9-9 9-9-9ZM7 7h.01M12 8v4h-2m7 1v4h-2"
	],
	"item-use-trigger": [
		"Routing",
		"ut",
		"M3 8v13h13l5-5M3 8l5-5h5M17 2l-5 8h5l-1 7 6-10h-5Z"
	],
	"confirm-events": [
		"Validation",
		"ce",
		"M3 2h18v20H3ZM6 7l2 2 3-4M14 7h4M6 16l2 2 3-4M14 16h4"
	],
	"current-holder": [
		"Context",
		"ch",
		"M7 3h8v7H7ZM2 14h4l3-3h4l2 3h5a2 2 0 0 1 1 4l-8 4-7-3H2ZM9 14h6"
	],
	"scene-presence": [
		"Context",
		"sp",
		"M19 9c0 5-7 13-7 13S5 14 5 9a7 7 0 1 1 14 0ZM15 9a3 3 0 1 0-6 0 3 3 0 0 0 6 0"
	],
	"character-direction": [
		"Guidance",
		"cd",
		"M12 6a3 3 0 1 0-6 0 3 3 0 0 0 6 0M3 20v-3a6 6 0 0 1 12 0v3M15 10h7m-4-4 4 4-4 4"
	],
	"parse-effect-library": [
		"Library",
		"el",
		"M3 4h4v17H3ZM9 4h4v17H9ZM17 12l4 9M17 2v6m-3-3h6"
	],
	"random-pick": [
		"Routing",
		"pk",
		"M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM7 7h.01M12 12h.01M17 17h.01"
	],
	"commit-outcomes": [
		"Delivery",
		"oc",
		"M3 3h16v10M3 3v16h9M7 7h.01M12 12h.01M14 19l3 3 5-6"
	],
	"saved-outcome": [
		"Memory",
		"ou",
		"M5 2h14v20l-7-5-7 5ZM9 7h6v6H9ZM12 10h.01"
	],
	"effect-author": [
		"Revision",
		"ea",
		"M3 21l2-7L16 3l5 5-11 11Zm2-7 5 5m-7 2 4-4M4 2v6M1 5h6M21 15v6m-3-3h6"
	],
	"stage-outcome": [
		"Assembly",
		"su",
		"M3 17v5h18v-5M7 4h10v9H7ZM12 13v5m-3-3 3 3 3-3M10 8h.01m4 1h.01"
	],
	collection: [
		"Extraction",
		"ct",
		"M21 5c0 2-4 3-9 3S3 7 3 5s4-3 9-3 9 1 9 3Zm-18 0v7c0 2 4 3 9 3s9-1 9-3V5M3 12v7c0 2 4 3 9 3s9-1 9-3v-7"
	],
	recall: [
		"Memory",
		"rc",
		"M4 8v13h15V10M7 14h8M7 18h5M7 8a7 7 0 0 1 13-2M7 3v5h5"
	],
	"hotkey-arm": [
		"Routing",
		"hk",
		"M2 7h20v14H2ZM6 11h.01m4 0h.01m4 0h.01m4 0h.01M6 17h12M17 2v3m-2-1h4"
	]
}, ru = Object.freeze(Object.fromEntries(Object.entries(nu).map(([e, [t, n, r]]) => [e, Object.freeze({
	group: t,
	shortcode: n,
	icon: r
})]))), iu = Object.freeze({
	group: "Blocks",
	shortcode: "",
	icon: Zl
}), au = (e) => Object.hasOwn(ru, e) ? ru[e] : iu, ou = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-family-row\" aria-haspopup=\"menu\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path></path></svg><span> </span></button>"), su = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\">‹ Families</button>"), cu = /* @__PURE__ */ K("<input class=\"text_pole\" aria-label=\"Search nodes\" placeholder=\"Search nodes…\"/>"), lu = /* @__PURE__ */ K("<div class=\"pc-shelf-group svelte-hk6fzp\" role=\"presentation\"> </div>"), uu = /* @__PURE__ */ K("<!> <button type=\"button\" role=\"menuitem\" class=\"svelte-hk6fzp\"><svg class=\"pc-leaf-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path></path></svg><span class=\"pc-catalog-name\"> </span><small> </small></button>", 1), du = /* @__PURE__ */ K("<div role=\"menu\" tabindex=\"-1\"><!> <!> <!></div>"), fu = /* @__PURE__ */ K("<div class=\"pc-shelf-menu pc-shelf-subgraph-menu svelte-hk6fzp\" role=\"menu\" tabindex=\"-1\"><button type=\"button\" role=\"menuitem\" data-shelf-subgraph-action=\"open\">Open saved definition</button> <button type=\"button\" role=\"menuitem\" data-shelf-subgraph-action=\"delete\">Delete</button></div>"), pu = /* @__PURE__ */ K("<div class=\"pc-shelf-drag-preview svelte-hk6fzp\" aria-hidden=\"true\"> </div>"), mu = /* @__PURE__ */ K("<nav aria-label=\"Node families\"></nav> <!> <!> <!>", 1);
function hu(e, t) {
	He(t, !0);
	let n = Mi(t, "choices", 19, () => []), r = Mi(t, "readOnly", 3, !1), i, a = /* @__PURE__ */ L(null), o = /* @__PURE__ */ L(""), s = /* @__PURE__ */ L(!1), c = /* @__PURE__ */ L(""), l = /* @__PURE__ */ L(!1), u = /* @__PURE__ */ L(0), d = /* @__PURE__ */ L(0), f = null, p = 0, m = /* @__PURE__ */ L(null), h = /* @__PURE__ */ L(null), g = null, _ = $l.map((e) => e.name), v = (e) => $l.find((t) => t.name === e)?.color, y = null, b = null, x = null, S = /* @__PURE__ */ L(null);
	function C() {
		b !== null && clearTimeout(b), b = null;
		let e = y;
		y = null, R(S, null), document.body.classList.remove("pc-shelf-dragging"), e?.button.hasPointerCapture?.(e.pointerId) && e.button.releasePointerCapture(e.pointerId);
	}
	function w() {
		y && (b !== null && clearTimeout(b), b = null, x = y.button, document.body.classList.add("pc-shelf-dragging"), R(S, {
			title: y.entry.title,
			family: y.entry.family,
			...y.point
		}, !0));
	}
	function T(e, t) {
		if (e.button !== 0 || e.isPrimary === !1 || y || r() || !k(t.family).find((e) => e.id === t.id)?.compatible) return;
		let n = e.currentTarget;
		x = null, y = {
			entry: t,
			pointerId: e.pointerId,
			button: n,
			start: {
				x: e.clientX,
				y: e.clientY
			},
			point: {
				x: e.clientX,
				y: e.clientY
			}
		}, n.setPointerCapture?.(e.pointerId), b = setTimeout(w, 180);
	}
	function E(e) {
		y && e.pointerId === y.pointerId && (y.point = {
			x: e.clientX,
			y: e.clientY
		}, !U(S) && Math.hypot(e.clientX - y.start.x, e.clientY - y.start.y) >= 5 && w(), U(S) && (e.preventDefault(), R(S, {
			...U(S),
			...y.point
		}, !0)));
	}
	function D(e) {
		if (!y || e.pointerId !== y.pointerId) return;
		let t = y.entry, n = !!U(S), r = n ? document.elementFromPoint(e.clientX, e.clientY) : null, a = i.closest(".pc-canvas-area")?.querySelector(".pc-canvas-host");
		C(), n && (e.preventDefault(), e.stopPropagation(), r && a?.contains(r) && ae(t, {
			x: e.clientX,
			y: e.clientY
		}));
	}
	function O(e, t) {
		e.currentTarget === x && e.detail !== 0 ? x = null : ae(t);
	}
	function k(e = U(o)) {
		let r = /* @__PURE__ */ new Map();
		for (let t of n().filter((t) => t.family === e)) {
			let e = t.id.startsWith("operation:") ? t.id.split(":")[1] : "", n = e ? "operation:" + e : t.id, i = r.get(n), a = [
				t.label,
				t.id,
				t.purpose ?? "",
				t.shortcode ?? "",
				...t.searchAliases ?? []
			];
			i ? (i.aliases.push(...a), t.id === n && (i.choice = t)) : r.set(n, {
				choice: t,
				aliases: a
			});
		}
		return [...r.values()].map(({ choice: n, aliases: r }) => {
			let i = n.id.startsWith("operation:") ? n.id.split(":")[1] : "", a = au(i), o = i ? n.label.split(" · ")[0] : n.label, s = n.id.startsWith("boundary:");
			return {
				...n,
				title: o,
				compatible: !n.disabledReason && !!t.choose,
				shortcode: i ? a.shortcode || n.shortcode || "" : n.shortcode ?? a.shortcode,
				group: e === "Subgraphs" ? s ? "Interface" : "Library" : void 0,
				icon: e === "Subgraphs" ? s ? au("subgraph-" + n.id.split(":")[1]).icon : tu.Library.icon : a.icon,
				searchAliases: r
			};
		});
	}
	function A(e = !1) {
		R(m, null), e && g?.focus({ preventScroll: !0 });
	}
	function j(e = !1) {
		C(), p++, R(o, ""), R(s, !1), A(), e && f?.focus({ preventScroll: !0 });
	}
	let M;
	Sn(() => {
		let e = JSON.stringify([t.insertionContextKey, t.view?.graphId]), n = r(), i = JSON.stringify(_.flatMap((e) => k(e).map((e) => [
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
			e.definitionRef?.id,
			e.definitionRef?.version,
			e.definitionRef?.semanticHash
		])));
		M && (e !== M.scope || i !== M.catalog || n !== M.locked) && j(), M = {
			scope: e,
			catalog: i,
			locked: n
		};
	}), Pi(() => j());
	function ee() {
		let e = i.closest(".pc-canvas-area"), t = e.getBoundingClientRect();
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
	async function re(e, t, n = !0) {
		if (y) return;
		if (A(), U(o) === e) {
			n && U(a)?.querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
			return;
		}
		let r = ++p;
		if (R(o, e, !0), R(s, !1), f = t, await pr(), r !== p || U(o) !== e || !U(a)?.isConnected) return;
		let i = t.getBoundingClientRect(), c = U(a).getBoundingClientRect(), m = te({
			top: ne(i, U(a), c),
			left: i.left,
			right: i.right
		}, c.width, c.height, i.width);
		R(u, m.x, !0), R(d, m.y, !0), R(l, m.compact, !0), n && U(a).querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
	}
	async function ie() {
		let e = ++p;
		if (R(o, ""), R(s, !0), R(c, ""), await pr(), e !== p || !U(s) || !U(a)?.isConnected) return;
		let t = ee(), n = i.getBoundingClientRect(), r = U(a).getBoundingClientRect();
		R(u, Math.max(4, Math.min(n.right - t.left + 3, t.width - r.width - 4)), !0), R(d, n.top - t.top), U(a).querySelector("input")?.focus();
	}
	function ae(e, n) {
		let i = k(e.family).find((t) => t.id === e.id);
		i?.compatible && !r() && (j(!0), n ? t.choose?.(i.id, n) : t.choose?.(i.id));
	}
	async function oe(e, n) {
		let r = k("Subgraphs").find((t) => t.id === e.dataset.shelfChoice);
		if (!r?.definitionRef || !t.shelfSubgraph) return;
		let i = ee(), a = e.getBoundingClientRect();
		if (g = e, R(m, {
			id: r.id,
			title: r.title,
			x: (n?.x ?? a.right) - i.left,
			y: (n?.y ?? a.top) - i.top
		}, !0), await pr(), !U(m) || U(m).id !== r.id || !U(h)?.isConnected) return;
		let o = U(h).getBoundingClientRect();
		R(m, {
			...U(m),
			x: Math.max(4, Math.min(U(m).x, i.width - o.width - 4)),
			y: Math.max(4, Math.min(U(m).y, i.height - o.height - 4))
		}, !0), U(h).querySelector("button")?.focus({ preventScroll: !0 });
	}
	function se(e) {
		let n = e.target.closest("[data-shelf-choice]");
		n && k("Subgraphs").some((e) => e.id === n.dataset.shelfChoice && e.definitionRef) && t.shelfSubgraph && (e.preventDefault(), e.stopPropagation(), oe(n, {
			x: e.clientX,
			y: e.clientY
		}));
	}
	function ce(e) {
		let n = k("Subgraphs").find((e) => e.id === U(m)?.id);
		j(!0), n?.definitionRef && t.shelfSubgraph?.(n.id, e);
	}
	function le(e) {
		if ((e.key === "ContextMenu" || e.key === "F10" && e.shiftKey) && e.target.dataset.shelfChoice) {
			e.preventDefault(), e.stopPropagation(), oe(e.target);
			return;
		}
		if (U(m) && e.key === "Escape") {
			e.preventDefault(), e.stopPropagation(), A(!0);
			return;
		}
		if (e.key === "Escape") {
			e.preventDefault(), e.stopPropagation(), j(!0);
			return;
		}
		let t = e.target;
		if (e.key === "ArrowRight" && t.dataset.family && !t.disabled) {
			e.preventDefault(), e.stopPropagation(), re(t.dataset.family, t);
			return;
		}
		if (e.key === "ArrowLeft" && U(o)) {
			e.preventDefault(), e.stopPropagation(), j(!0);
			return;
		}
		if (e.key === "Tab") {
			j();
			return;
		}
		if (![
			"ArrowDown",
			"ArrowUp",
			"Home",
			"End"
		].includes(e.key) || e.target.tagName === "INPUT") return;
		e.preventDefault();
		let n = [...(e.target.closest("[role=\"menu\"]") || i).querySelectorAll("button:not(:disabled)")], r = n.indexOf(e.target);
		n[e.key === "Home" ? 0 : e.key === "End" ? n.length - 1 : (r + (e.key === "ArrowUp" ? n.length - 1 : 1)) % n.length]?.focus();
	}
	var ue = { openSearch: ie }, de = mu();
	W("pointerdown", rn, (e) => {
		e.target.closest(".pc-node-shelf, .pc-shelf-menu") || j();
	}), W("pointermove", rn, E), W("pointerup", rn, D), W("pointercancel", rn, () => C()), W("blur", rn, () => j()), W("resize", rn, () => j()), W("keydown", rn, (e) => {
		y && e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), j(!0));
	});
	var fe = B(de);
	X(fe, 21, () => $l, Kr, (e, t) => {
		var n = ou();
		let r;
		var i = z(n), a = z(i);
		F(i);
		var s = V(i), c = z(s, !0);
		F(s), F(n), H((e) => {
			Q(n, "data-family", U(t).name), n.disabled = e, Q(n, "title", "Browse " + U(t).name + " nodes"), Q(n, "aria-expanded", U(o) === U(t).name), r = pi(n, "", r, { "--pc-family": U(t).color }), Q(a, "d", U(t).icon), J(c, U(t).name);
		}, [() => !k(U(t).name).length]), G("click", n, (e) => re(U(t).name, e.currentTarget)), W("pointerenter", n, (e) => {
			e.pointerType !== "touch" && !e.currentTarget.disabled && re(U(t).name, e.currentTarget, !1);
		}), G("keydown", n, le), q(e, n);
	}), F(fe), ji(fe, (e) => i = e, () => i);
	var pe = V(fe, 2), me = (e) => {
		let n = /* @__PURE__ */ I(() => U(s) ? _.flatMap((e) => k(e)).filter((e) => [
			e.title,
			e.id,
			e.family,
			e.purpose,
			e.shortcode,
			...e.searchAliases ?? []
		].join(" ").toLowerCase().includes(U(c).toLowerCase())) : k());
		var i = du();
		let f;
		var p = z(i), m = (e) => {
			var t = su();
			G("click", t, () => j(!0)), q(e, t);
		};
		Y(p, (e) => {
			U(l) && U(o) && e(m);
		});
		var h = V(p, 2), g = (e) => {
			var t = cu();
			Z(t), Di(t, () => U(c), (e) => R(c, e)), q(e, t);
		};
		Y(h, (e) => {
			U(s) && e(g);
		}), X(V(h, 2), 19, () => U(n), (e) => e.family + e.id, (e, i, a) => {
			let o = /* @__PURE__ */ I(() => !U(i).compatible || r()), c = /* @__PURE__ */ I(() => !!U(i).definitionRef && !!t.shelfSubgraph);
			var l = uu(), u = B(l), d = (e) => {
				var t = lu(), n = z(t, !0);
				F(t), H(() => {
					Q(t, "data-shelf-group", U(i).group), J(n, U(i).group);
				}), q(e, t);
			};
			Y(u, (e) => {
				!U(s) && U(i).group && U(n)[U(a) - 1]?.group !== U(i).group && e(d);
			});
			var f = V(u, 2);
			let p;
			var m = z(f), h = z(m);
			F(m);
			var g = V(m), _ = z(g, !0);
			F(g);
			var y = V(g), b = z(y, !0);
			F(y), F(f), H((e) => {
				Q(f, "data-shelf-choice", U(i).id), Q(f, "data-insertion-disabled", U(o)), f.disabled = U(o) && !U(c), Q(f, "aria-disabled", U(o) && !U(c)), Q(f, "aria-haspopup", U(c) ? "menu" : void 0), Q(f, "title", r() ? U(c) ? "This graph is read-only. Right-click for subgraph actions." : "This graph is read-only." : U(i).disabledReason || (U(i).compatible ? U(i).purpose || "Add " + U(i).title : "Requires the " + U(i).phase + " phase")), p = pi(f, "", p, e), Q(h, "d", U(i).icon), J(_, U(i).title), J(b, U(i).shortcode);
			}, [() => ({ "--pc-family": v(U(i).family) })]), G("pointerdown", f, (e) => T(e, U(i))), W("lostpointercapture", f, () => C()), G("click", f, (e) => O(e, U(i))), q(e, l);
		}), F(i), ji(i, (e) => R(a, e), () => U(a)), H((e) => {
			di(i, 1, `pc-shelf-menu ${U(s) ? "pc-leaf-menu" : "pc-family-menu"}`, "svelte-hk6fzp"), Q(i, "aria-label", U(s) ? "Search nodes" : U(o) + " nodes"), f = pi(i, "", f, e);
		}, [() => ({
			left: `${U(u)}px`,
			top: `${U(d)}px`,
			"--pc-family": v(U(o))
		})]), G("keydown", i, le), G("contextmenu", i, se), q(e, i);
	};
	Y(pe, (e) => {
		(U(o) || U(s)) && e(me);
	});
	var he = V(pe, 2), ge = (e) => {
		var t = fu();
		let n;
		var r = z(t), i = V(r, 2);
		F(t), ji(t, (e) => R(h, e), () => U(h)), H(() => {
			Q(t, "aria-label", U(m).title + " actions"), n = pi(t, "", n, {
				left: `${U(m).x}px`,
				top: `${U(m).y}px`
			});
		}), G("keydown", t, le), G("click", r, () => ce("open")), G("click", i, () => ce("delete")), q(e, t);
	};
	Y(he, (e) => {
		U(m) && e(ge);
	});
	var _e = V(he, 2), ve = (e) => {
		var t = pu();
		let n;
		var r = z(t, !0);
		F(t), H((e) => {
			n = pi(t, "", n, e), J(r, U(S).title);
		}, [() => ({
			"--pc-family": v(U(S).family),
			left: `${U(S).x + 12}px`,
			top: `${U(S).y + 12}px`
		})]), q(e, t);
	};
	return Y(_e, (e) => {
		U(S) && e(ve);
	}), H(() => di(fe, 1, `pc-node-shelf${U(l) && U(o) ? " pc-shelf-replaced" : ""}`, "svelte-hk6fzp")), q(e, de), Ue(ue);
}
Tr([
	"click",
	"keydown",
	"contextmenu",
	"pointerdown"
]);
//#endregion
//#region ui/ExamplesBrowser.svelte
var gu = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-btn menu_button svelte-18p7ib8\">Retry</button>"), _u = /* @__PURE__ */ K("<div class=\"pc-examples-issue svelte-18p7ib8\" role=\"alert\"><span class=\"svelte-18p7ib8\"> </span><!></div>"), vu = /* @__PURE__ */ K("<option> </option>"), yu = /* @__PURE__ */ K("<li class=\"svelte-18p7ib8\"> </li>"), bu = /* @__PURE__ */ K("<li data-checkpoint=\"\" class=\"svelte-18p7ib8\"><strong> </strong><span class=\"svelte-18p7ib8\"> </span></li>"), xu = /* @__PURE__ */ K("<li class=\"svelte-18p7ib8\"><strong> </strong><span class=\"svelte-18p7ib8\"> </span></li>"), Su = /* @__PURE__ */ K("<p class=\"pc-example-focus svelte-18p7ib8\"><strong> </strong> </p> <h4 class=\"svelte-18p7ib8\">Learn</h4><ul class=\"svelte-18p7ib8\"></ul> <h4 class=\"svelte-18p7ib8\">Setup</h4><ul class=\"svelte-18p7ib8\"></ul> <h4 class=\"svelte-18p7ib8\">Try the lesson</h4><ol class=\"svelte-18p7ib8\"></ol> <h4 class=\"svelte-18p7ib8\">Checkpoints</h4><ul class=\"svelte-18p7ib8\"></ul> <h4 class=\"svelte-18p7ib8\">Experiments</h4><ul class=\"svelte-18p7ib8\"></ul> <h4 class=\"svelte-18p7ib8\">Expected cases</h4><ul class=\"svelte-18p7ib8\"></ul> <p class=\"svelte-18p7ib8\"><strong>Auxiliary call budget:</strong> </p>", 1), Cu = /* @__PURE__ */ K("<p class=\"pc-example-detail-issue svelte-18p7ib8\" role=\"alert\"> </p>"), wu = /* @__PURE__ */ K("<section class=\"pc-example-details svelte-18p7ib8\"><header class=\"svelte-18p7ib8\"><h3 tabindex=\"-1\" class=\"svelte-18p7ib8\"> </h3><button type=\"button\" class=\"pc-btn menu_button\" aria-label=\"Close lesson details\">Close</button></header> <p class=\"svelte-18p7ib8\"> </p> <!> <!> <button type=\"button\" class=\"pc-btn menu_button\">Open independent copy</button></section>"), Tu = /* @__PURE__ */ K("<p class=\"pc-examples-empty svelte-18p7ib8\">No lessons match your search and difficulty.</p>"), Eu = /* @__PURE__ */ Pr("<g class=\"pc-example-group svelte-18p7ib8\"><rect rx=\"6\" class=\"svelte-18p7ib8\"></rect><text class=\"svelte-18p7ib8\"> </text></g>"), Du = /* @__PURE__ */ Pr("<g class=\"pc-example-comment svelte-18p7ib8\"><rect rx=\"4\" class=\"svelte-18p7ib8\"></rect><text class=\"svelte-18p7ib8\"> </text></g>"), Ou = /* @__PURE__ */ Pr("<path class=\"pc-wire pc-wire-native\"></path>"), ku = /* @__PURE__ */ Pr("<!><text class=\"pc-example-pin-label svelte-18p7ib8\"> </text>", 1), Au = /* @__PURE__ */ Pr("<g><rect class=\"pc-example-card svelte-18p7ib8\" rx=\"4\"></rect><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\"><path class=\"pc-example-icon svelte-18p7ib8\"></path></svg><text class=\"pc-example-node-title svelte-18p7ib8\" lengthAdjust=\"spacingAndGlyphs\"> </text><!></g>"), ju = /* @__PURE__ */ Pr("<svg class=\"pc-example-preview svelte-18p7ib8\" preserveAspectRatio=\"xMidYMid meet\" aria-hidden=\"true\" focusable=\"false\"><!><!><!><!></svg>"), Mu = /* @__PURE__ */ K("<span class=\"pc-example-unavailable-preview svelte-18p7ib8\"><strong class=\"svelte-18p7ib8\">Unavailable</strong><span class=\"svelte-18p7ib8\"> </span></span>"), Nu = /* @__PURE__ */ K("<span class=\"pc-example-band svelte-18p7ib8\"> </span>"), Pu = /* @__PURE__ */ K("<article class=\"pc-example-entry svelte-18p7ib8\"><button type=\"button\"><!> <span class=\"pc-example-title svelte-18p7ib8\"> </span> <!> <span class=\"pc-example-goal svelte-18p7ib8\"> </span></button> <button type=\"button\" class=\"pc-example-details-button svelte-18p7ib8\">Lesson details</button></article>"), Fu = /* @__PURE__ */ K("<!> <div class=\"pc-examples-filters svelte-18p7ib8\"><label class=\"svelte-18p7ib8\">Search lessons<input aria-label=\"Search lessons\" type=\"search\" placeholder=\"Goal, node or technique\" class=\"svelte-18p7ib8\"/></label> <label class=\"svelte-18p7ib8\">Difficulty<select aria-label=\"Difficulty\" class=\"svelte-18p7ib8\"><option>All difficulties</option><!></select></label> <span class=\"pc-examples-count svelte-18p7ib8\" role=\"status\"> </span></div> <div class=\"pc-examples-grid svelte-18p7ib8\"><!> <!> <!></div>", 1);
function Iu(e, t) {
	He(t, !0);
	let n = Mi(t, "examples", 19, () => []), r = Mi(t, "issue", 3, ""), i = Mi(t, "scrollTop", 3, 0), a, o = /* @__PURE__ */ L(void 0), s = /* @__PURE__ */ L(void 0), c = /* @__PURE__ */ L(""), l = /* @__PURE__ */ L(""), u = /* @__PURE__ */ L(""), d = /* @__PURE__ */ L(""), f = [
		"Foundations",
		"Composition",
		"Advanced",
		"Capstone"
	], p = /* @__PURE__ */ I(() => n().filter((e) => {
		if (U(u) && e.lesson?.difficulty !== U(u)) return !1;
		let t = U(l).toLocaleLowerCase().trim().split(/\s+/).filter(Boolean), n = [
			e.number,
			e.title,
			e.goal,
			JSON.stringify(e.lesson ?? {}),
			...e.thumbnail?.nodes.map((e) => e.title) ?? []
		].join(" ").toLocaleLowerCase();
		return t.every((e) => n.includes(e));
	})), m = /* @__PURE__ */ I(() => n().find((e) => e.id === U(d)));
	Ni(() => {
		a.scrollTop = i();
	});
	async function h(e) {
		R(d, U(d) === e ? "" : e, !0), U(d) && (await pr(), a.scrollTop = 0, U(o)?.focus());
	}
	async function g(e) {
		R(d, ""), await pr(), (Array.from(a.querySelectorAll(".pc-example-details-button")).find((t) => t.dataset.exampleId === e) ?? U(s))?.focus();
	}
	async function _(e) {
		if (!U(c)) {
			R(c, e, !0);
			try {
				await t.open(e);
			} finally {
				R(c, "");
			}
		}
	}
	var v = Fu(), y = B(v), b = (e) => {
		var n = _u(), i = z(n), a = z(i, !0);
		F(i);
		var o = V(i), s = (e) => {
			var n = gu();
			G("click", n, () => t.retry?.()), q(e, n);
		};
		Y(o, (e) => {
			t.retry && e(s);
		}), F(n), H(() => J(a, r())), q(e, n);
	};
	Y(y, (e) => {
		r() && e(b);
	});
	var x = V(y, 2), S = z(x), C = V(z(S));
	Z(C), ji(C, (e) => R(s, e), () => U(s)), F(S);
	var w = V(S, 2), T = V(z(w)), E = z(T);
	E.value = E.__value = "", X(V(E), 17, () => f, Kr, (e, t) => {
		var n = vu(), r = z(n, !0);
		F(n);
		var i = {};
		H(() => {
			J(r, U(t)), i !== (i = U(t)) && (n.value = (n.__value = U(t)) ?? "");
		}), q(e, n);
	}), F(T), F(w);
	var D = V(w, 2), O = z(D);
	F(D), F(x);
	var k = V(x, 2), A = z(k), j = (e) => {
		var t = wu(), n = z(t), r = z(n), i = z(r);
		F(r), ji(r, (e) => R(o, e), () => U(o));
		var a = V(r);
		F(n);
		var s = V(n, 2), l = z(s, !0);
		F(s);
		var u = V(s, 2), d = (e) => {
			var t = Su(), n = B(t), r = z(n), i = z(r, !0);
			F(r);
			var a = V(r);
			F(n);
			var o = V(n, 3);
			X(o, 21, () => U(m).lesson.learn, Kr, (e, t) => {
				var n = yu(), r = z(n, !0);
				F(n), H(() => J(r, U(t))), q(e, n);
			}), F(o);
			var s = V(o, 3);
			X(s, 21, () => U(m).lesson.requirements, Kr, (e, t) => {
				var n = yu(), r = z(n, !0);
				F(n), H(() => J(r, U(t))), q(e, n);
			}), F(s);
			var c = V(s, 3);
			X(c, 21, () => U(m).lesson.steps, Kr, (e, t) => {
				var n = yu(), r = z(n, !0);
				F(n), H(() => J(r, U(t))), q(e, n);
			}), F(c);
			var l = V(c, 3);
			X(l, 21, () => U(m).lesson.checkpoints, Kr, (e, t) => {
				var n = bu(), r = z(n), i = z(r);
				F(r);
				var a = V(r), o = z(a, !0);
				F(a), F(n), H(() => {
					J(i, `${U(t).node ?? ""} → ${U(t).port ?? ""}`), J(o, U(t).expect);
				}), q(e, n);
			}), F(l);
			var u = V(l, 3);
			X(u, 21, () => U(m).lesson.experiments, Kr, (e, t) => {
				var n = xu(), r = z(n), i = z(r, !0);
				F(r);
				var a = V(r), o = z(a, !0);
				F(a), F(n), H(() => {
					J(i, U(t).change), J(o, U(t).expect);
				}), q(e, n);
			}), F(u);
			var d = V(u, 3);
			X(d, 21, () => U(m).lesson.cases, Kr, (e, t) => {
				var n = xu(), r = z(n), i = z(r, !0);
				F(r);
				var a = V(r), o = z(a, !0);
				F(a), F(n), H(() => {
					J(i, U(t).when), J(o, U(t).expect);
				}), q(e, n);
			}), F(d);
			var f = V(d, 2), p = V(z(f));
			F(f), H(() => {
				J(i, U(m).lesson.difficulty), J(a, ` · ${U(m).lesson.focus ?? ""}`), J(p, ` ${U(m).lesson.callBudget ?? ""}`);
			}), q(e, t);
		};
		Y(u, (e) => {
			U(m).lesson && e(d);
		});
		var f = V(u, 2), p = (e) => {
			var t = Cu(), n = z(t, !0);
			F(t), H(() => J(n, U(m).issue)), q(e, t);
		};
		Y(f, (e) => {
			U(m).issue && e(p);
		});
		var h = V(f, 2);
		F(t), H(() => {
			Q(t, "aria-label", `Lesson ${U(m).number} details`), J(i, `${U(m).number ?? ""}. ${U(m).title ?? ""}`), J(l, U(m).goal), h.disabled = !!U(c) || !U(m).thumbnail;
		}), G("click", a, () => g(U(m).id)), G("click", h, () => _(U(m).id)), q(e, t);
	};
	Y(A, (e) => {
		U(m) && e(j);
	});
	var M = V(A, 2), ee = (e) => {
		q(e, Tu());
	};
	Y(M, (e) => {
		U(p).length || e(ee);
	}), X(V(M, 2), 17, () => U(p), (e) => e.id, (e, t) => {
		let n = /* @__PURE__ */ I(() => U(t).thumbnail);
		var r = Pu(), i = z(r);
		let a;
		var o = z(i), s = (e) => {
			var t = ju(), r = z(t);
			X(r, 17, () => U(n).groups, (e) => e.id, (e, t) => {
				var n = Eu(), r = z(n), i = V(r), a = z(i, !0);
				F(i), F(n), H(() => {
					Q(n, "data-id", U(t).id), Q(r, "x", U(t).x), Q(r, "y", U(t).y), Q(r, "width", U(t).w), Q(r, "height", U(t).h), Q(i, "x", U(t).x + 12), Q(i, "y", U(t).y + 24), J(a, U(t).title);
				}), q(e, n);
			});
			var i = V(r);
			X(i, 17, () => U(n).comments, (e) => e.id, (e, t) => {
				var n = Du(), r = z(n);
				let i;
				var a = V(r), o = z(a, !0);
				F(a), F(n), H(() => {
					Q(n, "data-id", U(t).id), Q(r, "x", U(t).x), Q(r, "y", U(t).y), Q(r, "width", U(t).w), Q(r, "height", U(t).h), i = pi(r, "", i, { stroke: U(t).color }), Q(a, "x", U(t).x + 12), Q(a, "y", U(t).y + 24), J(o, U(t).title);
				}), q(e, n);
			});
			var a = V(i);
			X(a, 17, () => U(n).wires, (e) => e.id, (e, t) => {
				var n = Ou();
				H(() => {
					Q(n, "data-kind", U(t).kind), Q(n, "data-id", U(t).id), Q(n, "d", U(t).d);
				}), q(e, n);
			}), X(V(a), 17, () => U(n).nodes, (e) => e.id, (e, t) => {
				var n = Au(), r = z(n), i = V(r), a = z(i);
				F(i);
				var o = V(i), s = z(o, !0);
				F(o), X(V(o), 17, () => U(t).ports, (e) => e.id, (e, t) => {
					var n = ku(), r = B(n);
					{
						let e = /* @__PURE__ */ I(() => U(t).x - 9), n = /* @__PURE__ */ I(() => U(t).y - 9);
						Vi(r, {
							get kind() {
								return U(t).kind;
							},
							className: "pc-example-pin-cue",
							get x() {
								return U(e);
							},
							get y() {
								return U(n);
							}
						});
					}
					var i = V(r), a = z(i, !0);
					F(i), H(() => {
						Q(i, "x", U(t).x + (U(t).dir === "in" ? 9 : -9)), Q(i, "y", U(t).y + 4), Q(i, "text-anchor", U(t).dir === "in" ? "start" : "end"), J(a, U(t).label);
					}), q(e, n);
				}), F(n), H(() => {
					di(n, 0, ai(U(t).className), "svelte-18p7ib8"), Q(n, "data-id", U(t).id), Q(r, "x", U(t).x), Q(r, "y", U(t).y), Q(r, "width", U(t).w), Q(r, "height", U(t).h), Q(i, "x", U(t).x + 8), Q(i, "y", U(t).y + 7), Q(a, "d", U(t).iconPath), Q(o, "x", U(t).x + 28), Q(o, "y", U(t).y + 20), Q(o, "textLength", U(t).title.length * 6 > U(t).w - 36 ? U(t).w - 36 : void 0), J(s, U(t).title);
				}), q(e, n);
			}), F(t), H(() => Q(t, "viewBox", `${U(n).bounds.x} ${U(n).bounds.y} ${U(n).bounds.w} ${U(n).bounds.h}`)), q(e, t);
		}, l = (e) => {
			var n = Mu(), r = V(z(n)), i = z(r, !0);
			F(r), F(n), H(() => {
				Q(r, "id", `pc-example-issue-${U(t).number}`), J(i, U(t).issue);
			}), q(e, n);
		};
		Y(o, (e) => {
			U(n) ? e(s) : e(l, -1);
		});
		var u = V(o, 2), f = z(u);
		F(u);
		var p = V(u, 2), m = (e) => {
			var n = Nu(), r = z(n);
			F(n), H(() => J(r, `${U(t).lesson.difficulty ?? ""} · ${U(t).lesson.focus ?? ""}`)), q(e, n);
		};
		Y(p, (e) => {
			U(t).lesson && e(m);
		});
		var g = V(p, 2), v = z(g, !0);
		F(g), F(i);
		var y = V(i, 2);
		F(r), H(() => {
			a = di(i, 1, "pc-example-tile svelte-18p7ib8", null, a, { "pc-example-unavailable": !U(n) }), Q(i, "aria-label", U(t).title), Q(i, "aria-describedby", U(t).issue ? `pc-example-issue-${U(t).number}` : void 0), Q(i, "title", U(t).issue || U(t).goal), i.disabled = !!U(c) || !U(n), J(f, `${U(t).number ?? ""}. ${U(t).title ?? ""}`), J(v, U(t).goal), Q(y, "data-example-id", U(t).id), Q(y, "aria-label", `Details for ${U(t).title}`), Q(y, "aria-expanded", U(d) === U(t).id);
		}), G("click", i, () => _(U(t).id)), G("click", y, () => h(U(t).id)), q(e, r);
	}), F(k), ji(k, (e) => a = e, () => a), H(() => {
		J(O, `${U(p).length ?? ""} of ${n().length ?? ""} lessons`), Q(k, "aria-busy", !!U(c));
	}), Di(C, () => U(l), (e) => R(l, e)), gi(T, () => U(u), (e) => R(u, e)), W("scroll", k, (e) => t.scroll(e.currentTarget.scrollTop)), q(e, v), Ue();
}
Tr(["click"]);
//#endregion
//#region ui/ImportReview.svelte
var Lu = /* @__PURE__ */ K("<p> </p>"), Ru = /* @__PURE__ */ K("<li> </li>"), zu = /* @__PURE__ */ K("<h3>Saved bindings to review</h3><ul></ul>", 1), Bu = /* @__PURE__ */ K("<p>Saved model metadata is present. Review local connections before running.</p>"), Vu = /* @__PURE__ */ K("<h3>Imported terminal effects</h3><ul></ul>", 1), Hu = /* @__PURE__ */ K("<p>No imported terminal effects.</p>"), Uu = /* @__PURE__ */ K("<p role=\"alert\"> </p>"), Wu = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-btn menu_button\">Prepare again</button>"), Gu = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay pc-import-overlay\"><div class=\"pc-workspace-dialog pc-import-review\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Import into graph\" tabindex=\"-1\"><header><h2>Import into graph</h2><button type=\"button\" class=\"pc-btn menu_button\" aria-label=\"Cancel import\">×</button></header> <p><strong> </strong> <small> </small></p> <dl><dt>Phase</dt><dd> </dd><dt>Additions</dt><dd> </dd><dt>Conservative request bound</dt><dd> </dd></dl> <p class=\"pc-import-explanation\">This authoring bound includes unfinished branches. Bindings and reachable execution are checked when you explicitly run the workflow.</p> <!> <!> <!> <p>Insertion keeps internal wiring and relative layout. Review the inserted nodes before running the workflow.</p> <!> <footer><button type=\"button\" class=\"pc-btn menu_button\">Cancel</button><!><button type=\"button\" class=\"pc-btn menu_button pc-import-accept\">Insert into graph</button></footer></div></div>");
function Ku(e, t) {
	He(t, !0);
	let n;
	Ni(() => {
		let e = document.activeElement;
		return n.querySelector("button")?.focus(), () => e?.focus({ preventScroll: !0 });
	});
	function r(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), t.actions.cancelImport?.()), e.key === "Tab") {
			let t = [...n.querySelectorAll("button:not(:disabled)")], r = t[0], i = t.at(-1);
			e.shiftKey && document.activeElement === r && (e.preventDefault(), i?.focus()), !e.shiftKey && document.activeElement === i && (e.preventDefault(), r?.focus());
		}
	}
	var i = Gu(), a = z(i), o = z(a), s = V(z(o));
	F(o);
	var c = V(o, 2), l = z(c), u = z(l, !0);
	F(l);
	var d = V(l, 2), f = z(d, !0);
	F(d), F(c);
	var p = V(c, 2), m = V(z(p)), h = z(m, !0);
	F(m);
	var g = V(m, 2), _ = z(g);
	F(g);
	var v = V(g, 2), y = z(v);
	F(v), F(p);
	var b = V(p, 4), x = (e) => {
		var n = Lu(), r = z(n);
		F(n), H((e) => J(r, `Imported model roles: ${e ?? ""}.`), [() => t.view.requiredRoles.join(", ")]), q(e, n);
	};
	Y(b, (e) => {
		t.view.requiredRoles.length && e(x);
	});
	var S = V(b, 2), C = (e) => {
		var n = zu(), r = V(B(n));
		X(r, 21, () => t.view.unresolvedBindings, Kr, (e, t) => {
			var n = Ru(), r = z(n);
			F(n), H((e) => J(r, `${U(t).title ?? ""} · ${U(t).role ?? ""}: missing ${e ?? ""}`), [() => U(t).missing.join(" and ")]), q(e, n);
		}), F(r), q(e, n);
	}, w = (e) => {
		q(e, Bu());
	};
	Y(S, (e) => {
		t.view.unresolvedBindings.length ? e(C) : t.view.bindingReviewRequired && e(w, 1);
	});
	var T = V(S, 2), E = (e) => {
		var n = Vu(), r = V(B(n));
		X(r, 21, () => t.view.terminals, Kr, (e, t) => {
			var n = Ru(), r = z(n);
			F(n), H(() => J(r, `${U(t).title ?? ""} · ${U(t).operation ?? ""}`)), q(e, n);
		}), F(r), q(e, n);
	}, D = (e) => {
		q(e, Hu());
	};
	Y(T, (e) => {
		t.view.terminals.length ? e(E) : e(D, -1);
	});
	var O = V(T, 4), k = (e) => {
		var n = Uu(), r = z(n, !0);
		F(n), H(() => J(r, t.view.error)), q(e, n);
	};
	Y(O, (e) => {
		t.view.error && e(k);
	});
	var A = V(O, 2), j = z(A), M = V(j), ee = (e) => {
		var n = Wu();
		G("click", n, () => t.actions.prepareImportAgain?.()), q(e, n);
	};
	Y(M, (e) => {
		t.view.error && e(ee);
	});
	var te = V(M);
	F(A), F(a), ji(a, (e) => n = e, () => n), F(i), H(() => {
		J(u, t.view.name), J(f, t.view.fileName), J(h, t.view.phase), J(_, `${t.view.nodeCount ?? ""} blocks · ${t.view.wireCount ?? ""} wires · ${t.view.groupCount ?? ""} groups`), J(y, `${t.view.callBound ?? ""} total · ${t.view.importedCallBound ?? ""} imported`), te.disabled = !!t.view.error;
	}), G("keydown", a, r), W("paste", a, (e) => e.stopPropagation()), G("click", s, () => t.actions.cancelImport?.()), G("click", j, () => t.actions.cancelImport?.()), G("click", te, () => t.actions.acceptImport?.()), q(e, i), Ue();
}
Tr(["keydown", "click"]);
//#endregion
//#region ui/WorkspaceReport.svelte
var qu = /* @__PURE__ */ K("<li class=\"svelte-1xdk4mm\"> </li>"), Ju = /* @__PURE__ */ K("<ul></ul>"), Yu = /* @__PURE__ */ K("<p role=\"status\" class=\"svelte-1xdk4mm\">No validation issues found.</p>"), Xu = /* @__PURE__ */ K("<p class=\"svelte-1xdk4mm\">Root workflow: <strong> </strong> </p> <!> <p class=\"svelte-1xdk4mm\">Validation checks the current workflow without running it. Diagnostic previews and Apply recheck their inputs when used.</p>", 1), Zu = /* @__PURE__ */ K("<p class=\"svelte-1xdk4mm\">Workflow validation is unavailable.</p>"), Qu = /* @__PURE__ */ K("<p class=\"svelte-1xdk4mm\"><strong> </strong></p> <p class=\"svelte-1xdk4mm\">Named-pin workflows, optional scene guidance and reviewed reply repairs for SillyTavern.</p> <p class=\"svelte-1xdk4mm\"><a target=\"_blank\" rel=\"noreferrer\" class=\"svelte-1xdk4mm\">Project guide</a></p>", 1), $u = /* @__PURE__ */ K("<p class=\"svelte-1xdk4mm\">Browse the node shelf by family. Select a node to read its controls, connections and help in Details.</p> <p class=\"svelte-1xdk4mm\"><a target=\"_blank\" rel=\"noreferrer\" class=\"svelte-1xdk4mm\">Open the complete node reference</a></p>", 1), ed = /* @__PURE__ */ K("<table class=\"svelte-1xdk4mm\"><thead><tr><th class=\"svelte-1xdk4mm\">Action</th><th class=\"svelte-1xdk4mm\">Shortcut</th></tr></thead><tbody><tr><td class=\"svelte-1xdk4mm\">Undo / Redo</td><td class=\"svelte-1xdk4mm\">Ctrl Z / Ctrl Shift Z</td></tr><tr><td class=\"svelte-1xdk4mm\">Cut / Copy / Paste</td><td class=\"svelte-1xdk4mm\">Ctrl X / Ctrl C / Ctrl V</td></tr><tr><td class=\"svelte-1xdk4mm\">Duplicate / Delete selection</td><td class=\"svelte-1xdk4mm\">Ctrl D / Delete</td></tr><tr><td class=\"svelte-1xdk4mm\">Select all</td><td class=\"svelte-1xdk4mm\">Ctrl A</td></tr><tr><td class=\"svelte-1xdk4mm\">Group / Ungroup</td><td class=\"svelte-1xdk4mm\">Ctrl G / Ctrl Shift G</td></tr><tr><td class=\"svelte-1xdk4mm\">Comment selection / Add comment</td><td class=\"svelte-1xdk4mm\">C</td></tr><tr><td class=\"svelte-1xdk4mm\">Center / Fit selection</td><td class=\"svelte-1xdk4mm\">F / .</td></tr><tr><td class=\"svelte-1xdk4mm\">Rename selection</td><td class=\"svelte-1xdk4mm\">F2</td></tr><tr><td class=\"svelte-1xdk4mm\">Pan / Zoom</td><td class=\"svelte-1xdk4mm\">Middle mouse / Wheel</td></tr><tr><td class=\"svelte-1xdk4mm\">Dismiss a menu or panel</td><td class=\"svelte-1xdk4mm\">Escape</td></tr></tbody></table> <p class=\"svelte-1xdk4mm\">In menus, use arrows to move, Home/End to jump, type a label to find it, and Enter/Space to choose it. Tab dismisses the menu.</p>", 1), td = /* @__PURE__ */ K("<p class=\"svelte-1xdk4mm\">Browse node families on the floating shelf. Middle mouse pans the graph; the wheel zooms around the pointer. Use the dividers or their arrow keys to resize Preview and Details. View controls panel visibility and restores the default layout.</p> <p class=\"svelte-1xdk4mm\">File opens workflow documents, saves the current file, imports a fragment into the current graph, and exports a portable copy without local connections. Graph tabs open child views of the current document.</p> <p class=\"svelte-1xdk4mm\">Enable Lattice while the unified document is open, then Send in SillyTavern. Choose model connections on the node bar and advanced overrides in Details. Workflow › Configure opens Workflow Data, and Memory recall offers queue actions and an overview.</p> <p class=\"svelte-1xdk4mm\">Graph groups nodes, creates and saves subgraphs, adds comments and manages portals. Right-click actions remain available beside the relevant node or pin.</p> <p class=\"svelte-1xdk4mm\">Preview follows selection until you pin an output. Workflow › Run to current output tests its dependencies within the displayed request bound. Apply and Reject stay beside the exact result they review.</p> <p class=\"svelte-1xdk4mm\"><a target=\"_blank\" rel=\"noreferrer\" class=\"svelte-1xdk4mm\">Open the project guide</a> · <a target=\"_blank\" rel=\"noreferrer\" class=\"svelte-1xdk4mm\">Node reference</a></p>", 1);
function nd(e, t) {
	He(t, !0);
	var n = Ir(), r = B(n), i = (e) => {
		var n = Ir(), r = B(n), i = (e) => {
			var n = Xu(), r = B(n), i = V(z(r)), a = z(i, !0);
			F(i);
			var o = V(i);
			F(r);
			var s = V(r, 2), c = (e) => {
				var n = Ju();
				X(n, 21, () => t.workflow.issues, Kr, (e, t) => {
					var n = qu(), r = z(n, !0);
					F(n), H(() => J(r, U(t))), q(e, n);
				}), F(n), q(e, n);
			}, l = (e) => {
				q(e, Yu());
			};
			Y(s, (e) => {
				t.workflow.issues.length ? e(c) : e(l, -1);
			}), je(2), H(() => {
				J(a, t.workflow.name), J(o, ` · ${t.workflow.phase ?? ""} · maximum ${t.workflow.callBound ?? ""} model requests.`);
			}), q(e, n);
		}, a = (e) => {
			q(e, Zu());
		};
		Y(r, (e) => {
			t.workflow ? e(i) : e(a, -1);
		}), q(e, n);
	}, a = (e) => {
		var n = Qu(), r = B(n), i = z(r), a = z(i);
		F(i), F(r);
		var o = V(r, 4), s = z(o);
		F(o), H(() => {
			J(a, `Lattice ${t.version ?? ""}`), Q(s, "href", t.guideUrl);
		}), q(e, n);
	}, o = (e) => {
		var n = $u(), r = V(B(n), 2), i = z(r);
		F(r), H(() => Q(i, "href", t.referenceUrl)), q(e, n);
	}, s = (e) => {
		var t = ed();
		je(2), q(e, t);
	}, c = (e) => {
		var n = td(), r = V(B(n), 10), i = z(r), a = V(i, 2);
		F(r), H(() => {
			Q(i, "href", t.guideUrl), Q(a, "href", t.referenceUrl);
		}), q(e, n);
	};
	Y(r, (e) => {
		t.panel === "validate-workflow" ? e(i) : t.panel === "about" ? e(a, 1) : t.panel === "node-reference" ? e(o, 2) : t.panel === "shortcuts" ? e(s, 3) : e(c, -1);
	}), q(e, n), Ue();
}
var rd = {
	display_name: "Lattice",
	loading_order: 120,
	generate_interceptor: "latticeGenerationInterceptor",
	requires: [],
	optional: [],
	js: "index.js?v=0.27.0",
	css: "style.css",
	author: "Dulgadurbit",
	version: "0.27.0",
	homePage: "https://github.com/MentallyQuill/Lattice",
	auto_update: !1,
	description: "Build named-pin workflows for optional scene guidance and reviewed reply repairs in SillyTavern, with per-node model connections."
}, id = /* @__PURE__ */ K("<p class=\"pc-native-diagnostic svelte-1dr9aew\" role=\"alert\"> </p>"), ad = /* @__PURE__ */ K("<p>Browse node families on the floating shelf. Middle mouse pans the graph; the wheel zooms around the pointer. Use the divider or its arrow keys to resize Preview.</p><p>Open examples from File to start a workflow document. A unified workflow's preparation stage feeds Generate Reply, and its response stage reshapes the captured Draft before Review and Publish. Choose each model node's connection with the bar under it. Details contains advanced model overrides and inheritance settings. Enable Lattice runs the open document for Send in SillyTavern. Run to here tests supported nodes; Workflow › Stop workflow cancels the current run. Retired pre and post workflows remain available only for archived export.</p><p>File › New workflow, Open workflow, Open Recent and Open examples replace the open document after offering Save, Don't Save or Cancel for unsaved changes. Save writes the current file; Save As chooses a destination. Browsers without native saving offer Download JSON. Export workflow JSON makes a portable sharing copy without local connections. Import into graph reviews a compatible fragment before one undoable insertion. Recover previous workflows opens unified documents preserved from earlier settings. File › Export archived workflows preserves retired originals for reference. Recovery drafts remain available in SillyTavern, while the filename and document status describe the current file.</p><p>Select nodes and right-click Create Subgraph to open their connected body in a new tab. Double-click a subgraph to open it. Add Input and Output nodes from the Subgraphs shelf inside an editable subgraph, then name and configure their ports in Details.</p><p>Right-click a subgraph block and choose Add to Subgraphs to save it for reuse. Right-click a saved shelf entry to delete it. Saving updates the shelf only when you choose to save; existing placed copies stay unchanged. Portals connect pins through named references. Preview artifact tabs show results for the selected node; Run to here checks the request bound before running. Apply reviews the fresh result against the full root workflow.</p>", 1), od = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay\"><div role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\"><header class=\"svelte-1dr9aew\"><h2 class=\"svelte-1dr9aew\"> </h2><button type=\"button\" class=\"pc-btn menu_button\"> </button></header> <!></div></div>"), sd = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay\"><div class=\"pc-manager-dialog svelte-1dr9aew\" role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\" aria-label=\"Manage portals\"><!></div></div>"), cd = /* @__PURE__ */ K("<div role=\"dialog\" aria-modal=\"true\" aria-label=\"Lattice\" data-pc-workbench=\"svelte\"><!> <div class=\"pc-body\" role=\"region\" aria-label=\"Workspace panels\" tabindex=\"0\"><div class=\"pc-stage\"><section aria-label=\"Output preview\"><header class=\"pc-preview-pane-head\"><strong>Preview</strong><button type=\"button\" class=\"pc-btn menu_button\"> </button></header> <div class=\"pc-preview-content\"><!></div></section> <!> <!> <!> <div class=\"pc-canvas-area\" id=\"pc-workspace-graph\" role=\"tabpanel\"><div class=\"pc-workspace-run svelte-1dr9aew\"><!></div> <div class=\"pc-canvas-host\" aria-label=\"Node canvas\"></div> <!> <div><!></div></div></div> <!> <div class=\"pc-inspector pc-workspace-details svelte-1dr9aew\"><header class=\"pc-details-heading svelte-1dr9aew\"><strong class=\"svelte-1dr9aew\">Details</strong><button type=\"button\" aria-label=\"Close Details\" title=\"Close Details\">×</button></header> <!> <div class=\"pc-node-details-holder svelte-1dr9aew\"><!></div></div></div> <!> <!> <!> <!> <!> <!> <!> <!></div>");
function ld(e, t) {
	He(t, !0);
	let n = Mi(t, "actions", 7), r = /* @__PURE__ */ L({
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
		R(r, {
			...U(r),
			...e
		});
	}
	function m(e) {
		return u?.startRename(e);
	}
	async function h(e, t) {
		if (await pr(), !t()) return;
		let n = [...o.querySelectorAll(".pc-comment-frame[data-id]")].find((t) => t.dataset.id === e)?.querySelector(".pc-comment-title-input");
		n && !n.disabled && (n.focus({ preventScroll: !0 }), n.select());
	}
	let g = "lattice.workspace.preview";
	function _() {
		try {
			let e = JSON.parse(localStorage.getItem(g) || "null");
			return {
				height: Number.isFinite(e?.height) ? Math.max(90, Math.min(600, e.height)) : 240,
				collapsed: e?.collapsed === !0,
				shelfOpen: e?.shelfOpen !== !1
			};
		} catch {
			return {
				height: 240,
				collapsed: !1,
				shelfOpen: !0
			};
		}
	}
	let v = _(), y = /* @__PURE__ */ L(en(v.height)), b = /* @__PURE__ */ L(en(v.collapsed)), x = /* @__PURE__ */ L(500), S = /* @__PURE__ */ L(en(v.shelfOpen)), C = /* @__PURE__ */ L(null), w = /* @__PURE__ */ L(520), T = /* @__PURE__ */ I(() => Math.max(220, Math.min(U(w), U(C) ?? U(r).detailsWidth ?? 258)));
	function E(e) {
		R(C, null), R(r, {
			...U(r),
			detailsWidth: e
		}), n().resizeDetails?.(e);
	}
	let D = /* @__PURE__ */ L(""), O = /* @__PURE__ */ I(() => ({
		examples: "Examples",
		"run-details": "Run details",
		"story-documents": "Workflow Data",
		"memory-recall": "Memory recall",
		"validate-workflow": "Workflow validation",
		"node-reference": "Node reference",
		shortcuts: "Keyboard shortcuts",
		about: "About Lattice"
	})[U(D)] ?? "Workspace guide"), k = /* @__PURE__ */ I(() => U(r).rootWorkflow ?? U(r).workflow), A = /* @__PURE__ */ I(() => `${U(r).menuContextKey ?? ""}:${U(r).graphId}:${U(r).graphViews?.active.key ?? ""}:${U(r).graphViews?.viewEpoch ?? ""}`), j = /* @__PURE__ */ I(() => n().logoUrl ? new URL("../docs/node-reference.md", n().logoUrl).href : ""), M = /* @__PURE__ */ I(() => n().logoUrl ? new URL("../README.md", n().logoUrl).href : ""), ee = /* @__PURE__ */ L(null), te = null, ne = 0, re = /* @__PURE__ */ L(0), ie;
	function ae() {
		try {
			localStorage.setItem(g, JSON.stringify({
				height: U(y),
				collapsed: U(b),
				shelfOpen: U(S)
			}));
		} catch {}
	}
	function oe() {
		n().resizeStart?.();
	}
	function se(e) {
		oe(), R(b, e, !0), ae();
	}
	function ce() {
		se(!1);
	}
	function le(e) {
		let t = U(r).outputPreview;
		if (!t) return;
		if (e === "follow-preview" || e === "pin-preview" && t.pinned) {
			n().outputPreview?.follow?.();
			return;
		}
		let i = t.choices.find((e) => e.key === t.selectedKey);
		if (!i || t.status === "removed") return;
		let a = structuredClone(i.target);
		e === "pin-preview" ? n().outputPreview?.pin?.(t.sourceKey, a) : e === "run-preview" && t.runHere?.enabled && !t.busy && !U(k)?.ownedBusy && (se(!1), n().outputPreview?.runHere?.(t.sourceKey, a));
	}
	async function ue(e) {
		if (e === "show-preview") se(!1);
		else if (e === "collapse-preview") se(!0);
		else if (e === "toggle-preview") se(!U(b));
		else if (e === "toggle-shelf") oe(), R(S, !U(S)), ae();
		else if (e === "reset-layout") oe(), R(y, 240), R(b, !1), R(S, !0), E(258), U(r).inspectorOpen || n().command("inspector"), ae();
		else if (e === "add-node") R(S, !0), ae(), await pr(), ie.openSearch();
		else if ([
			"follow-preview",
			"pin-preview",
			"run-preview"
		].includes(e)) le(e);
		else {
			te = document.activeElement, e === "examples" && n().refreshExamples?.(), e === "story-documents" && n().storyDocuments?.refresh?.(), e === "memory-recall" && n().recall?.refresh?.();
			let t = ++ne;
			R(D, e, !0), await pr(), t === ne && U(D) === e && U(ee)?.querySelector("button")?.focus();
		}
	}
	function de() {
		ne++, R(D, ""), te?.focus({ preventScroll: !0 });
	}
	async function fe(e) {
		let t = ne;
		try {
			let r = await n().openExample?.(e);
			return r === !0 && t === ne && U(D) === "examples" && de(), r === !0;
		} catch {
			return !1;
		}
	}
	function pe(e) {
		if (e.stopPropagation(), e.key === "Escape") e.preventDefault(), n().portalManager?.close?.();
		else if (e.key === "Tab") {
			let t = [...e.currentTarget.querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex=\"0\"]")], n = t[0], r = t.at(-1);
			e.shiftKey && document.activeElement === n && (e.preventDefault(), r?.focus()), !e.shiftKey && document.activeElement === r && (e.preventDefault(), n?.focus());
		}
	}
	function me(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), de()), e.key === "Tab") {
			let t = [...U(ee).querySelectorAll("a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex=\"0\"]")], n = t[0], r = t.at(-1);
			e.shiftKey && document.activeElement === n && (e.preventDefault(), r?.focus()), !e.shiftKey && document.activeElement === r && (e.preventDefault(), n?.focus());
		}
	}
	Ni(() => {
		let e = () => {
			R(x, Math.max(90, s.clientHeight - 190), !0), R(w, Math.max(220, Math.min(520, (a.clientWidth || i.clientWidth || window.innerWidth) - 368)), !0);
		}, t = globalThis.ResizeObserver;
		if (!t) return e(), window.addEventListener("resize", e), () => window.removeEventListener("resize", e);
		let n = new t(e);
		return n.observe(s), n.observe(a), e(), () => n.disconnect();
	});
	var he = {
		getParts: d,
		updateActions: f,
		update: p,
		renameGraphView: m,
		focusCommentTitle: h,
		revealPreview: ce
	}, ge = cd();
	let _e, ve;
	var ye = z(ge);
	{
		let e = /* @__PURE__ */ I(() => ({
			previewOpen: !U(b),
			shelfOpen: U(S)
		}));
		ji(Fa(ye, {
			get state() {
				return U(r);
			},
			get actions() {
				return n();
			},
			local: ue,
			get panels() {
				return U(e);
			}
		}), (e) => l = e, () => l);
	}
	var be = V(ye, 2), xe = z(be), Se = z(xe);
	let Ce, we;
	var Te = z(Se), Ee = V(z(Te)), De = z(Ee, !0);
	F(Ee), F(Te);
	var N = V(Te, 2), Oe = z(N);
	{
		let e = /* @__PURE__ */ I(() => U(r).outputPreview ?? null);
		pc(Oe, {
			get view() {
				return U(e);
			},
			get actions() {
				return n().outputPreview;
			},
			collapse: () => se(!0)
		});
	}
	F(N), F(Se);
	var P = V(Se, 2), ke = (e) => {
		{
			let t = /* @__PURE__ */ I(() => Math.min(U(y), U(x)));
			La(e, {
				get height() {
					return U(t);
				},
				get max() {
					return U(x);
				},
				start: oe,
				change: (e) => {
					R(y, e, !0), ae();
				}
			});
		}
	};
	Y(P, (e) => {
		U(b) || e(ke);
	});
	var Ae = V(P, 2);
	ji(Ya(Ae, {
		get views() {
			return U(r).graphViews;
		},
		get actions() {
			return n().graphViewActions;
		},
		panelId: "pc-workspace-graph"
	}), (e) => u = e, () => u);
	var Me = V(Ae, 2);
	{
		let e = /* @__PURE__ */ I(() => U(r).graphViews?.active);
		eo(Me, {
			get view() {
				return U(e);
			},
			get actions() {
				return n().graphViewActions;
			}
		});
	}
	var Ne = V(Me, 2), Pe = z(Ne), Fe = z(Pe);
	{
		let e = /* @__PURE__ */ I(() => U(r).runMeter ?? null);
		Dc(Fe, {
			get view() {
				return U(e);
			},
			open: () => {
				R(D, "run-details");
			}
		});
	}
	F(Pe);
	var Ie = V(Pe, 2);
	ji(Ie, (e) => o = e, () => o);
	var Le = V(Ie, 2), Re = (e) => {
		var t = id(), n = z(t, !0);
		F(t), H(() => J(n, U(r).nativeDiagnostic)), q(e, t);
	};
	Y(Le, (e) => {
		U(r).nativeDiagnostic && e(Re);
	});
	var ze = V(Le, 2);
	ji(hu(z(ze), {
		get view() {
			return U(r).workflow;
		},
		get insertionContextKey() {
			return U(A);
		},
		get choices() {
			return U(r).nativeChoices;
		},
		get choose() {
			return n().chooseNative;
		},
		get shelfSubgraph() {
			return n().shelfSubgraph;
		},
		get readOnly() {
			return U(r).readOnly;
		}
	}), (e) => ie = e, () => ie), F(ze), F(Ne), F(xe), ji(xe, (e) => s = e, () => s);
	var Be = V(xe, 2), Ve = (e) => {
		var t = Ir();
		Gr(B(t), () => U(r).graphViews?.active.key ?? U(r).graphId, (e) => {
			za(e, {
				get width() {
					return U(T);
				},
				get max() {
					return U(w);
				},
				start: oe,
				preview: (e) => R(C, e, !0),
				change: E
			});
		}), q(e, t);
	};
	Y(Be, (e) => {
		U(r).inspectorOpen && e(Ve);
	});
	var We = V(Be, 2), Ge = z(We), Ke = V(z(Ge));
	F(Ge);
	var qe = V(Ge, 2), Je = (e) => {
		let t = /* @__PURE__ */ I(() => U(r).commentDetails);
		Ys(e, {
			get comment() {
				return U(t).comment;
			},
			onPatch: (e) => n().commentDetails?.patch(U(t).selection, e),
			onCommand: (e) => n().commentDetails?.command(U(t).selection, e)
		});
	};
	Y(qe, (e) => {
		U(r).commentDetails && e(Je);
	});
	var Ye = V(qe, 2), Xe = z(Ye);
	{
		let e = /* @__PURE__ */ I(() => U(r).commentDetails ? null : U(r).nodeDetails ?? null);
		Ks(Xe, {
			get view() {
				return U(e);
			},
			get actions() {
				return n().nodeDetails;
			}
		});
	}
	F(Ye), F(We), ji(We, (e) => c = e, () => c), F(be), ji(be, (e) => a = e, () => a);
	var Ze = V(be, 2), Qe = (e) => {
		var t = od(), i = z(t);
		let a;
		var o = z(i), s = z(o), c = z(s, !0);
		F(s);
		var l = V(s), u = z(l, !0);
		F(l), F(o);
		var d = V(o, 2), f = (e) => {
			Iu(e, {
				get examples() {
					return U(r).examples;
				},
				get issue() {
					return U(r).examplesIssue;
				},
				get retry() {
					return n().refreshExamples;
				},
				get scrollTop() {
					return U(re);
				},
				scroll: (e) => R(re, e, !0),
				open: fe
			});
		}, p = (e) => {
			{
				let t = /* @__PURE__ */ I(() => U(r).recall ?? null), i = /* @__PURE__ */ I(() => ({
					...n().recall,
					reveal: (e) => {
						de(), n().recall?.reveal(e);
					}
				}));
				El(e, {
					get view() {
						return U(t);
					},
					get actions() {
						return U(i);
					}
				});
			}
		}, m = (e) => {
			{
				let t = /* @__PURE__ */ I(() => U(r).storyDocuments ?? {
					key: "",
					revision: "",
					scope: {
						userId: "",
						chatId: ""
					},
					documents: [],
					issue: "Workflow Data setup is unavailable."
				});
				vl(e, {
					get view() {
						return U(t);
					},
					get actions() {
						return n().storyDocuments;
					},
					close: de
				});
			}
		}, h = (e) => {
			{
				let t = /* @__PURE__ */ I(() => U(r).runDetails ?? null);
				Cc(e, {
					get view() {
						return U(t);
					},
					get actions() {
						return n().runDetails;
					}
				});
			}
		}, g = (e) => {
			nd(e, {
				get panel() {
					return U(D);
				},
				get workflow() {
					return U(k);
				},
				get version() {
					return rd.version;
				},
				get referenceUrl() {
					return U(j);
				},
				get guideUrl() {
					return U(M);
				}
			});
		}, _ = (e) => {
			var t = ad();
			je(4), q(e, t);
		};
		Y(d, (e) => {
			U(D) === "examples" ? e(f) : U(D) === "memory-recall" ? e(p, 1) : U(D) === "story-documents" ? e(m, 2) : U(D) === "run-details" ? e(h, 3) : U(D) === "help" ? e(_, -1) : e(g, 4);
		}), F(i), ji(i, (e) => R(ee, e), () => U(ee)), F(t), H(() => {
			a = di(i, 1, "pc-workspace-dialog svelte-1dr9aew", null, a, { "pc-examples-dialog": U(D) === "examples" }), Q(i, "aria-label", U(O)), J(c, U(O)), Q(l, "aria-label", U(D) === "memory-recall" ? "Close" : "Close panel"), J(u, U(D) === "memory-recall" ? "Close" : "×");
		}), G("keydown", i, me), W("paste", i, (e) => e.stopPropagation()), G("click", l, de), q(e, t);
	};
	Y(Ze, (e) => {
		U(D) && e(Qe);
	});
	var $e = V(Ze, 2);
	Kl($e, {
		get view() {
			return U(r).nativeSearch;
		},
		get actions() {
			return n().nativeSearch;
		}
	});
	var et = V($e, 2);
	Xl(et, {
		get view() {
			return U(r).nativePinMenu;
		},
		get actions() {
			return n().nativePinMenu;
		}
	});
	var tt = V(et, 2), nt = (e) => {
		var t = sd(), i = z(t);
		Kc(z(i), {
			get view() {
				return U(r).portalManager;
			},
			get actions() {
				return n().portalManager;
			}
		}), F(i), F(t), G("keydown", i, pe), W("paste", i, (e) => e.stopPropagation()), q(e, t);
	};
	Y(tt, (e) => {
		U(r).portalManager && e(nt);
	});
	var rt = V(tt, 2), it = (e) => {
		Nl(e, {
			get view() {
				return U(r).configureNode;
			},
			get actions() {
				return n().configureNode;
			}
		});
	};
	Y(rt, (e) => {
		U(r).configureNode && e(it);
	});
	var at = V(rt, 2), ot = (e) => {
		Xc(e, {
			get view() {
				return U(r).subgraphSave;
			},
			get actions() {
				return n().subgraphSave;
			}
		});
	};
	Y(at, (e) => {
		U(r).subgraphSave && e(ot);
	});
	var st = V(at, 2), ct = (e) => {
		Ku(e, {
			get view() {
				return U(r).importReview;
			},
			get actions() {
				return n();
			}
		});
	};
	Y(st, (e) => {
		U(r).importReview && e(ct);
	});
	var lt = V(st, 2), ut = (e) => {
		{
			let t = /* @__PURE__ */ I(() => U(r).document?.native ?? !1);
			Ll(e, {
				get view() {
					return U(r).documentPrompt;
				},
				get actions() {
					return n().documentPrompt;
				},
				get native() {
					return U(t);
				}
			});
		}
	};
	return Y(lt, (e) => {
		U(r).documentPrompt && e(ut);
	}), F(ge), ji(ge, (e) => i = e, () => i), H((e) => {
		_e = di(ge, 1, "pc-root pc-native-workspace svelte-1dr9aew", null, _e, { "pc-native-flat": U(r).nativeFlatCanvas }), ve = pi(ge, "", ve, { "--pc-details-width": `${U(T)}px` }), Ce = di(Se, 1, "pc-preview-pane", null, Ce, { "pc-preview-collapsed": U(b) }), we = pi(Se, "", we, e), Q(Ee, "aria-label", U(b) ? "Expand preview" : "Collapse preview"), Q(Ee, "title", U(b) ? "Expand preview" : "Collapse preview"), Q(Ee, "aria-expanded", !U(b)), J(De, U(b) ? "▾" : "▴"), Q(N, "hidden", U(b)), Q(ze, "hidden", !U(S)), Q(We, "hidden", !U(r).inspectorOpen), Q(Ye, "hidden", !!U(r).commentDetails);
	}, [() => ({ "--pc-preview-height": `${Math.min(U(y), U(x))}px` })]), G("click", Ee, () => se(!U(b))), G("click", Ke, () => n().command("inspector")), q(e, ge), Ue(he);
}
Tr(["click", "keydown"]);
//#endregion
//#region ui/entry.js
function ud(e, t) {
	let n = document.createElement("div");
	n.style.cssText = "position:absolute;left:0;top:0;visibility:hidden;pointer-events:none", n.setAttribute("aria-hidden", "true"), n.inert = !0, e.append(n);
	let r;
	try {
		r = Rr(Qi, {
			target: n,
			props: {
				card: t,
				actions: {
					hoverPin() {},
					hostResult() {}
				}
			}
		}), Rt();
		let { width: e, height: i } = n.querySelector(".pc-node").getBoundingClientRect();
		return {
			width: e,
			height: i
		};
	} finally {
		r && Hr(r), n.remove();
	}
}
function dd(e, t) {
	let n = Rr(ya, {
		target: e,
		props: { actions: t }
	});
	return Rt(), {
		...n.getLayers(),
		setComments: (e, t) => Rt(() => n.setComments(e, t)),
		setRecallStatus: (e) => Rt(() => n.setRecallStatus(e)),
		setNodes: (e) => Rt(() => n.setNodes(e)),
		setNodeProfiles: (e) => Rt(() => n.setNodeProfiles(e)),
		setGroups: (e) => Rt(() => n.setGroups(e)),
		setWires: (e, t, r) => Rt(() => n.setWires(e, t, r)),
		setPositions: (e, t) => Rt(() => n.setPositions(e, t)),
		destroy: () => Hr(n)
	};
}
function fd(e, t) {
	let n = Rr(ld, {
		target: e,
		props: { actions: t }
	});
	return Rt(), {
		...n.getParts(),
		update: (e) => Rt(() => n.update(e)),
		updateActions: (e) => Rt(() => n.updateActions(e)),
		revealPreview: () => Rt(() => n.revealPreview()),
		renameGraphView: (e) => n.renameGraphView(e),
		focusCommentTitle: (e, t) => n.focusCommentTitle(e, t),
		destroy: () => Hr(n)
	};
}
//#endregion
export { ud as measureNodeCard, dd as mountCanvas, fd as mountWorkbench };
