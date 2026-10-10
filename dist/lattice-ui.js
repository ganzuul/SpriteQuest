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
var h = 1024, g = 2048, _ = 4096, v = 8192, y = 16384, b = 32768, x = 1 << 25, S = 65536, C = 1 << 19, w = 1 << 20, T = 1 << 25, E = 65536, D = 1 << 21, O = 1 << 22, k = 1 << 23, A = Symbol("$state"), j = Symbol("legacy props"), ee = Symbol(""), te = Symbol("attributes"), ne = Symbol("class"), re = Symbol("style"), ie = Symbol("text"), ae = Symbol("form reset"), oe = new class extends Error {
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
var be = {}, xe = Symbol("uninitialized"), Se = "http://www.w3.org/1999/xhtml", Ce = "http://www.w3.org/2000/svg", we = "http://www.w3.org/1998/Math/MathML";
function Te() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function Ee(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
function De() {
	console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Oe() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/hydration.js
var M = !1;
function ke(e) {
	M = e;
}
var N;
function Ae(e) {
	if (e === null) throw Ee(), be;
	return N = e;
}
function je() {
	return Ae(/* @__PURE__ */ fn(N));
}
function P(e) {
	if (M) {
		if (/* @__PURE__ */ fn(N) !== null) throw Ee(), be;
		N = e;
	}
}
function Me(e = 1) {
	if (M) {
		for (var t = e, n = N; t--;) n = /* @__PURE__ */ fn(n);
		N = n;
	}
}
function Ne(e = !0) {
	for (var t = 0, n = N;;) {
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
function Pe(e) {
	if (!e || e.nodeType !== 8) throw Ee(), be;
	return e.data;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/equality.js
function Fe(e) {
	return e === this.v;
}
function Ie(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function Le(e) {
	return !Ie(e, this.v);
}
//#endregion
//#region node_modules/svelte/src/internal/shared/clone.js
var Re = [];
function ze(e, t = !1, n = !1) {
	return Be(e, /* @__PURE__ */ new Map(), "", Re, null, n);
}
function Be(t, n, r, i, a = null, o = !1) {
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
				d in t && (u[d] = Be(f, n, r, i, null, o));
			}
			return u;
		}
		if (l(t) === s) {
			u = {}, n.set(t, u), a !== null && n.set(a, u);
			for (var p of Object.keys(t)) u[p] = Be(t[p], n, r, i, null, o);
			return u;
		}
		if (t instanceof Date) return structuredClone(t);
		if (typeof t.toJSON == "function" && !o) return Be(t.toJSON(), n, r, i, t);
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
var Ve = null;
function He(e) {
	Ve = e;
}
function Ue(e, t = !1, n) {
	Ve = {
		p: Ve,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: Jn,
		l: null
	};
}
function We(e) {
	var t = Ve, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) Cn(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, Ve = t.p, e ?? {};
}
function Ge() {
	return !0;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/task.js
var Ke = [];
function qe() {
	var e = Ke;
	Ke = [], f(e);
}
function Je(e) {
	if (Ke.length === 0 && !jt) {
		var t = Ke;
		queueMicrotask(() => {
			t === Ke && qe();
		});
	}
	Ke.push(e);
}
function Ye() {
	for (; Ke.length > 0;) qe();
}
function Xe(e) {
	var t = Jn;
	if (t === null) return Gn.f |= k, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	Ze(e, t);
}
function Ze(e, t) {
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
var Qe = ~(g | _ | h);
function $e(e, t) {
	e.f = e.f & Qe | t;
}
function et(e) {
	e.f & 512 || e.deps === null ? $e(e, h) : $e(e, _);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
function tt(e) {
	if (e !== null) for (let t of e) t.f & 2 && t.f & 65536 && (t.f ^= E, tt(t.deps));
}
function nt(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), tt(e.deps), $e(e, h);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/store.js
var rt = !1;
function it(e) {
	var t = rt;
	try {
		return rt = !1, [e(), rt];
	} finally {
		rt = t;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/misc.js
function at(e) {
	M && /* @__PURE__ */ dn(e) !== null && pn(e);
}
var ot = !1;
function st() {
	ot || (ot = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[ae]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function ct(e) {
	var t = Gn, n = Jn;
	qn(null), Yn(null);
	try {
		return e();
	} finally {
		qn(t), Yn(n);
	}
}
function lt(e, t, n, r = n) {
	e.addEventListener(t, () => ct(n));
	let i = e[ae];
	e[ae] = i ? () => {
		i(), r(!0);
	} : () => r(!0), st();
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function ut(e) {
	let t = 0, n = Jt(0), r;
	return () => {
		bn() && (U(n), Dn(() => (t === 0 && (r = gr(() => e(() => Qt(n)))), t += 1, () => {
			Je(() => {
				--t, t === 0 && (r?.(), r = void 0, Qt(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var dt = S | C;
function ft(e, t, n, r) {
	new pt(e, t, n, r);
}
var pt = class {
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
	#h = ut(() => (this.#m = Jt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = Jn;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = Jn.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = On(() => {
			if (M) {
				let e = this.#t;
				je();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, dt), M && (this.#e = N);
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
		Je(r), t && (this.#s = kn(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			t ? Oe() : (t = !0, n && ye(), this.#s !== null && In(this.#s, () => {
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
					Ze(e, this.#i && this.#i.parent);
				}
			}
		};
	}
	#y() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = kn(() => e(this.#e)), Je(() => {
			var e = this.#c = document.createDocumentFragment(), t = un();
			e.append(t), this.#a = this.#S(() => kn(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, In(this.#o, () => {
				this.#o = null;
			}), this.#x(I));
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
			} else this.#x(I);
		} catch (e) {
			this.error(e);
		}
	}
	#x(e) {
		this.is_pending = !1, e.transfer_effects(this.#f, this.#p);
	}
	defer_effect(e) {
		nt(e, this.#f, this.#p);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#n.pending;
	}
	#S(e) {
		var t = Jn, n = Gn, r = Ve;
		Yn(this.#i), qn(this.#i), He(this.#i.ctx);
		try {
			return Lt.ensure(), e();
		} catch (e) {
			return Xe(e), null;
		} finally {
			Yn(t), qn(n), He(r);
		}
	}
	#C(e, t) {
		this.has_pending_snippet() ? (this.#u += e, this.#u === 0 && (this.#x(t), this.#o && In(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null))) : this.parent && this.parent.#C(e, t);
	}
	update_pending_count(e, t) {
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, Je(() => {
			this.#d = !1, this.#m && Xt(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), U(this.#m);
	}
	error(e) {
		if (!this.#n.onerror && !this.#n.failed) throw e;
		I?.is_fork ? (this.#a && I.skip_effect(this.#a), this.#o && I.skip_effect(this.#o), this.#s && I.skip_effect(this.#s), I.oncommit(() => {
			this.#w(e);
		})) : this.#w(e);
	}
	#w(e) {
		this.#a &&= (Nn(this.#a), null), this.#o &&= (Nn(this.#o), null), this.#s &&= (Nn(this.#s), null), M && (Ae(this.#t), Me(), Ae(Ne()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return kn(() => {
						var r = Jn;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return Ze(e, this.#i.parent), null;
				}
			}));
		};
		Je(() => {
			var t;
			try {
				t = this.transform_error(e);
			} catch (e) {
				Ze(e, this.#i && this.#i.parent);
				return;
			}
			typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => Ze(e, this.#i && this.#i.parent)) : n(t);
		});
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/async.js
function mt(e, t, n, r) {
	let i = Ge() ? vt : xt;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = Jn, c = ht(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				Ze(e, s);
			}
			gt();
		}
	}
	var d = _t();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ bt(e))).then(u).catch((e) => Ze(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), gt();
	}) : f();
}
function ht() {
	var e = Jn, t = Gn, n = Ve, r = I;
	return function(i = !0) {
		Yn(e), qn(t), He(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function gt(e = !0) {
	Yn(null), qn(null), He(null), e && I?.deactivate();
}
function _t() {
	var e = Jn, t = e.b, n = I, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function vt(e) {
	var t = 2 | g;
	return Jn !== null && (Jn.f |= C), {
		ctx: Ve,
		deps: null,
		effects: null,
		equals: Fe,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v: xe,
		wv: 0,
		parent: Jn,
		ac: null
	};
}
var yt = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function bt(e, t, n) {
	let r = Jn;
	r === null && le();
	var i = void 0, a = Jt(xe), o = !Gn, s = /* @__PURE__ */ new Set();
	return En(() => {
		var t = Jn, n = p();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== oe && n.reject(e);
			}).finally(gt);
		} catch (e) {
			n.reject(e), gt();
		}
		var c = I;
		if (o) {
			if (t.f & 32768) var l = _t();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(yt);
			else for (let e of s.values()) e.reject(yt);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== yt && (c.activate(), t ? (a.f |= k, Xt(a, t)) : (a.f & 8388608 && (a.f ^= k), Xt(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), xn(() => {
		for (let e of s) e.reject(yt);
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
	let t = /* @__PURE__ */ vt(e);
	return Zn(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function xt(e) {
	let t = /* @__PURE__ */ vt(e);
	return t.equals = Le, t;
}
function St(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) Nn(t[n]);
	}
}
function Ct(e) {
	var t, n = Jn, r = e.parent;
	if (!Un && r !== null && e.v !== xe && r.f & 24576) return Te(), e.v;
	Yn(r);
	try {
		e.f &= ~E, St(e), t = lr(e);
	} finally {
		Yn(n);
	}
	return t;
}
function wt(e) {
	var t = Ct(e);
	!e.equals(t) && (e.wv = or(), (!I?.is_fork || e.deps === null) && (I === null ? e.v = t : (I.capture(e, t, !0), Ot?.capture(e, t, !0)), e.deps === null)) ? $e(e, h) : Un || (kt === null ? et(e) : (bn() || I?.is_fork) && kt.set(e, t));
}
function Tt(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && ct(() => {
		t.ac.abort(oe), t.ac = null;
	}), t.fn !== null && (t.teardown = d), dr(t, 0), jn(t));
}
function Et(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && fr(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
var Dt = null, I = null, Ot = null, kt = null, At = null, jt = !1, Mt = !1, Nt = null, Pt = null, Ft = 0, It = 1, Lt = class e {
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
		Dt === null ? Dt = this : (Dt.#n = this, this.#t = Dt), Dt = this;
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
			for (var r of n.d) $e(r, g), t(r);
			for (r of n.m) $e(r, _), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, Ft++ > 1e3 && (this.#x(), zt());
		for (let e of this.#u) this.#d.delete(e), $e(e, g), this.schedule(e);
		for (let e of this.#d) $e(e, _), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = Nt = [], r = [], i = Pt = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw Wt(e), this.#h() || this.discard(), t;
		}
		if (I = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (Nt = null, Pt = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) Ut(e, t);
			i.length > 0 && I.#g();
			return;
		}
		let o = this.#v();
		if (o) this.#b(r), this.#b(n), o.#y(this);
		else {
			this.#u.clear(), this.#d.clear();
			for (let e of this.#r) e(this);
			this.#r.clear(), Ot = this, Vt(r), Vt(n), Ot = null, this.#s?.resolve();
			var s = I;
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), $e(i, g), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), I = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) nt(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== xe && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), kt?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		I = this;
	}
	deactivate() {
		I = null, kt = null;
	}
	flush() {
		try {
			Mt = !0, I = this, this.#g();
		} finally {
			Ft = 0, At = null, Nt = null, Pt = null, Mt = !1, I = null, kt = null, Kt.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(yt);
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
		this.#m || (this.#m = !0, Je(() => {
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
			!Mt && !jt && Je(() => {
				t.#e || t.flush();
			});
		}
		return I;
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
			e === null || (e.#n = t), t === null ? Dt = e : t.#t = e, this.linked = !1;
		}
	}
};
function Rt(e) {
	var t = jt;
	jt = !0;
	try {
		var n;
		for (e && (I !== null && !I.is_fork && I.flush(), n = e());;) {
			if (Ye(), I === null) return n;
			I.flush();
		}
	} finally {
		jt = t;
	}
}
function zt() {
	try {
		me();
	} catch (e) {
		Ze(e, At);
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
	I.schedule(e);
}
function Ut(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), $e(e, h);
		for (var n = e.first; n !== null;) Ut(n, t), n = n.next;
	}
}
function Wt(e) {
	$e(e, h);
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
		equals: Fe,
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
	return t || (r.equals = Le), r;
}
function R(e, t, n = !1) {
	return Gn !== null && (!Kn || Gn.f & 131072) && Ge() && Gn.f & 4325394 && (Xn === null || !Xn.has(e)) && ve(), Xt(e, n ? en(t) : t, Pt);
}
function Xt(e, t, n = null) {
	if (!e.equals(t)) {
		Un ? Kt.set(e, t) : Kt.has(e) || Kt.set(e, e.v);
		var r = Lt.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && Ct(t), kt === null && et(t);
		}
		e.wv = or(), $t(e, g, n), Ge() && Jn !== null && Jn.f & 1024 && !(Jn.f & 96) && (er === null ? tr([e]) : er.push(e)), !r.is_fork && Gt.size > 0 && !qt && Zt();
	}
	return t;
}
function Zt() {
	qt = !1;
	for (let e of Gt) {
		e.f & 1024 && $e(e, _);
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
	if (r !== null) for (var i = Ge(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (i || s !== Jn) {
			var l = (c & g) === 0;
			if (l && $e(s, t), c & 131072) Gt.add(s);
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
					r.set(t, e), Qt(o);
				}
			} else R(n, xe), Qt(o);
			return !0;
		},
		get(e, n, i) {
			if (n === A) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ L(en(s ? e[n] : xe), u)), r.set(n, o)), o !== void 0) {
				var c = U(o);
				return c === xe ? void 0 : c;
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
			return (n !== void 0 || Jn !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ L(i ? en(e[t]) : xe, u)), r.set(t, n)), U(n) === xe) ? !1 : i;
		},
		set(e, t, n, s) {
			var c = r.get(t), l = t in e;
			if (i && t === "length") for (var d = n; d < c.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ L(xe, u)), r.set(d + "", p)) : R(p, xe);
			}
			if (c === void 0) (!l || a(e, t)?.writable) && (c = f(() => /* @__PURE__ */ L(void 0, u)), R(c, en(n)), r.set(t, c));
			else {
				l = c.v !== xe;
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
		sn = a(t, "firstChild").get, cn = a(t, "nextSibling").get, u(e) && (e[ne] = void 0, e[te] = null, e[re] = void 0, e.__e = void 0), u(n) && (n[ie] = void 0);
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
	if (!M) return /* @__PURE__ */ dn(e);
	var n = /* @__PURE__ */ dn(N);
	if (n === null) n = N.appendChild(un());
	else if (t && n.nodeType !== 3) {
		var r = un();
		return n?.before(r), Ae(r), r;
	}
	return t && gn(n), Ae(n), n;
}
function B(e, t = !1) {
	if (!M) {
		var n = /* @__PURE__ */ dn(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ fn(n) : n;
	}
	if (t) {
		if (N?.nodeType !== 3) {
			var r = un();
			return N?.before(r), Ae(r), r;
		}
		gn(N);
	}
	return N;
}
function V(e, t = 1, n = !1) {
	let r = M ? N : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ fn(r);
	if (!M) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = un();
			return r === null ? i?.after(a) : r.before(a), Ae(a), a;
		}
		gn(r);
	}
	return Ae(r), r;
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
	Jn === null && (Gn === null && pe(e), fe()), Un && de(e);
}
function vn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function yn(e, t) {
	var n = Jn;
	n !== null && n.f & 8192 && (e |= v);
	var r = {
		ctx: Ve,
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
	return $e(t, h), t.teardown = e, t;
}
function Sn(e) {
	_n("$effect");
	var t = Jn.f;
	if (!Gn && t & 32 && Ve !== null && !Ve.i) {
		var n = Ve;
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
	mt(r, t, n, (t) => {
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
		e !== null && ct(() => {
			e.abort(oe);
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
		e.f ^= v, e.f & 1024 || ($e(e, g), Lt.ensure().schedule(e));
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
			if (sr(a) && wt(a), a.wv > e.wv) return !0;
		}
		t & 512 && kt === null && $e(e, h);
	}
	return !1;
}
function cr(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Xn !== null && Xn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? cr(a, t, !1) : t === a && (n ? $e(a, g) : a.f & 1024 && $e(a, _), Ht(a));
	}
}
function lr(e) {
	var t = Qn, n = $n, r = er, i = Gn, a = Xn, o = Ve, s = Kn, c = ir, l = e.f;
	Qn = null, $n = 0, er = null, Gn = l & 96 ? null : e, Xn = null, He(e.ctx), Kn = !1, ir = ++rr, e.ac !== null && (ct(() => {
		e.ac.abort(oe);
	}), e.ac = null);
	try {
		e.f |= D;
		var u = e.fn, d = u();
		e.f |= b;
		var f = e.deps, p = I?.is_fork;
		if (Qn !== null) {
			var m;
			if (p || dr(e, $n), f !== null && $n > 0) for (f.length = $n + Qn.length, m = 0; m < Qn.length; m++) f[$n + m] = Qn[m];
			else e.deps = f = Qn;
			if (bn() && e.f & 512) for (m = $n; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && $n < f.length && (dr(e, $n), f.length = $n);
		if (Ge() && er !== null && !Kn && f !== null && !(e.f & 6146)) for (m = 0; m < er.length; m++) cr(er[m], e);
		if (i !== null && i !== e) {
			if (rr++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = rr;
			if (t !== null) for (let e of t) e.rv = rr;
			er !== null && (r === null ? r = er : r.push(...er));
		}
		return e.f & 8388608 && (e.f ^= k), d;
	} catch (e) {
		return Xe(e);
	} finally {
		e.f ^= D, Qn = t, $n = n, er = r, Gn = i, Xn = a, He(o), Kn = s, ir = c;
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
		s.f & 512 && (s.f ^= 512, s.f &= ~E), s.v !== xe && et(s), s.ac !== null && ct(() => {
			s.ac.abort(oe), s.ac = null, $e(s, g);
		}), Tt(s), dr(s, 0);
	}
}
function dr(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) ur(e, n[r]);
}
function fr(e) {
	var t = e.f;
	if (!(t & 16384)) {
		$e(e, h);
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
			return (!(a.f & 1024) && a.reactions !== null || hr(a)) && (o = Ct(a)), Kt.set(a, o), o;
		}
		var s = !(a.f & 512) && !Kn && Gn !== null && (Hn || !!(Gn.f & 512)), c = (a.f & b) === 0;
		sr(a) && (s && (a.f |= 512), wt(a)), s && !c && (Et(a), mr(a));
	}
	if (kt?.has(e)) return kt.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function mr(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (Et(t), mr(t));
}
function hr(e) {
	if (e.v === xe) return !0;
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
		if (r.capture || Or.call(t, e), !e.cancelBubble) return ct(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Je(() => {
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
		if (M) return Mr(N, null), N;
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
		if (M) return Mr(N, null), N;
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
	if (!M) {
		var t = un(e + "");
		return Mr(t, t), t;
	}
	var n = N;
	return n.nodeType === 3 ? gn(n) : (n.before(n = un()), Ae(n)), Mr(n, n), n;
}
function Ir() {
	if (M) return Mr(N, null), N;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = un();
	return e.append(t, n), Mr(t, n), e;
}
function q(e, t) {
	if (M) {
		var n = Jn;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = N), je();
	} else e !== null && e.before(t);
}
function Lr() {
	if (M && N && N.nodeType === 8 && N.textContent?.startsWith("$")) {
		let e = N.textContent.substring(1);
		return je(), e;
	}
	return (window.__svelte ??= {}).uid ??= 1, `c${window.__svelte.uid++}`;
}
function J(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[ie] ??= e.nodeValue) && (e[ie] = n, e.nodeValue = `${n}`);
}
function Rr(e, t) {
	return Br(e, t);
}
var zr = /* @__PURE__ */ new Map();
function Br(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	ln();
	var l = void 0, u = wn(() => {
		var s = n ?? t.appendChild(un());
		ft(s, { pending: () => {} }, (t) => {
			Ue({});
			var n = Ve;
			if (o && (n.c = o), a && (i.$$events = a), M && Mr(t, null), l = e(t, i) || {}, M && (Jn.nodes.end = N, N === null || N.nodeType !== 8 || N.data !== "]")) throw Ee(), be;
			We();
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
		var n = I, r = mn();
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
		} else M && (this.anchor = N), this.#a(n);
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
function Y(e, t, n = !1) {
	var r;
	M && (r = N, je());
	var i = new Ur(e), a = n ? S : 0;
	function o(e, t) {
		if (M) {
			var n = Pe(r);
			if (e !== parseInt(n.substring(1))) {
				var a = Ne();
				Ae(a), i.anchor = a, ke(!1), i.ensure(e, t), ke(!0);
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
	M && je();
	var r = new Ur(e), i = !Ge();
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
		c = M ? Ae(/* @__PURE__ */ dn(u)) : u.appendChild(un());
	}
	M && je();
	var d = null, f = /* @__PURE__ */ xt(() => {
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
			M && Pe(c) === "[!" != (e === 0) && (c = Ne(), Ae(c), ke(!1), t = !0);
			for (var r = /* @__PURE__ */ new Set(), u = I, v = mn(), y = 0; y < e; y += 1) {
				M && N.nodeType === 8 && N.data === "]" && (c = N, t = !0, ke(!1));
				var b = p[y], x = a(b, y), S = h ? null : l.get(x);
				S ? (S.v && Xt(S.v, b), S.i && Xt(S.i, y), v && u.unskip_effect(S.e)) : (S = Qr(l, h ? c : Yr ??= un(), b, x, y, o, n, i), h || (S.e.f |= T), l.set(x, S)), r.add(x);
			}
			if (e === 0 && s && !d && (h ? d = kn(() => s(c)) : (d = kn(() => s(Yr ??= un())), d.f |= T)), e > r.size && ue("", "", ""), M && e > 0 && Ae(Ne()), !h) {
				if (m.set(u, r), v) {
					for (let [e, t] of l) r.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			t && ke(!0), U(f);
		}),
		flags: n,
		items: l,
		pending: m,
		outrogroups: null,
		fallback: d
	};
	h = !1, M && (c = N);
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
	o && Je(() => {
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
		M && (o = Ae(/* @__PURE__ */ dn(c)));
	}
	H(() => {
		var e = Jn;
		if (s === (s = t() ?? "")) M && je();
		else if (n && !M) e.nodes = null, c.innerHTML = s, s !== "" && Mr(/* @__PURE__ */ dn(c), c.lastChild);
		else if (e.nodes !== null && (Pn(e.nodes.start, e.nodes.end), e.nodes = null), s !== "") {
			if (M) {
				for (var a = N.data, l = je(), u = l; l !== null && (l.nodeType !== 8 || l.data !== "");) u = l, l = /* @__PURE__ */ fn(l);
				if (l === null) throw Ee(), be;
				Mr(N, u), o = Ae(l);
			} else {
				var d = hn(r ? "svg" : i ? "math" : "template", r ? Ce : i ? we : void 0);
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
				_r(e), i && Ie(a, e) && (a = e, r.update(e));
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
	var o = e[ne];
	if (M || o !== n || o === void 0) {
		var s = si(n, r, a);
		(!M || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[ne] = n;
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
	var i = e[re];
	if (M || i !== t) {
		var a = ui(t, r);
		(!M || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[re] = t;
	} else r && (Array.isArray(r) ? (fi(e, n?.[0], r[0]), fi(e, n?.[1], r[1], "important")) : fi(e, n, r));
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function mi(t, n, r = !1) {
	if (t.multiple) {
		if (n == null) return;
		if (!e(n)) return De();
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
	lt(e, "change", (t) => {
		var i = t ? "[selected]" : ":checked", a;
		if (e.multiple) a = [].map.call(e.querySelectorAll(i), _i);
		else {
			var o = e.querySelector(i) ?? e.querySelector("option:not([disabled])");
			a = o && _i(o);
		}
		n(a), e.__value = a, I !== null && r.add(I);
	}), Tn(() => {
		var a = t();
		if (e === document.activeElement) {
			var o = I;
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
var vi = Symbol("is custom element"), yi = Symbol("is html"), bi = se ? "link" : "LINK", xi = se ? "progress" : "PROGRESS";
function Z(e) {
	if (M) {
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
		e[ae] = n, Je(n), st();
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
	M && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === bi) || i[t] !== (i[t] = n) && (t === "loading" && (e[ee] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Ei(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function wi(e) {
	return e[te] ??= {
		[vi]: e.nodeName.includes("-"),
		[yi]: e.namespaceURI === Se
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
	lt(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = Oi(e) ? ki(a) : a, n(a), I !== null && r.add(I), await pr(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (M && e.defaultValue !== e.value || gr(t) == null && e.value) && (n(Oi(e) ? ki(e.value) : e.value), I !== null && r.add(I)), Dn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = I;
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
function $(e = {}, t, n, r) {
	var i = Ve.r, a = Jn;
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
function ji(e, t, n, r) {
	var i = !0, o = !!(n & 8), s = !!(n & 16), c = r, l = !0, u = void 0, d = () => s && i ? (u ??= /* @__PURE__ */ vt(r), U(u)) : (l && (l = !1, c = s ? gr(r) : r), c);
	let f;
	if (o) {
		var p = A in e || j in e;
		f = a(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	o ? [m, h] = it(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && he(t), f(m)));
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
	var v = !1, y = (n & 1 ? vt : xt)(() => (v = !1, g()));
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
function Mi(e) {
	Ve === null && ce("onMount"), Sn(() => {
		let t = gr(e);
		if (typeof t == "function") return t;
	});
}
function Ni(e) {
	Ve === null && ce("onDestroy"), Mi(() => () => gr(e));
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region src/ui/artifact-glyph.js
var Pi = Object.freeze([
	"context",
	"guidance",
	"draft",
	"patches",
	"candidate",
	"text",
	"data"
]), Fi = .5625;
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
var Ii = Math.sqrt(3) * 5.5 / 2, Li = Object.freeze({
	context: "<circle cx=\"0\" cy=\"0\" r=\"5.5\" />",
	guidance: "<polygon points=\"0,-6.5 6.5,0 0,6.5 -6.5,0\" />",
	draft: "<polygon points=\"0,-5.5 5.5,-1.32 3.41,5.5 -3.41,5.5 -5.5,-1.32\" />",
	patches: `<polygon points="0,${-Ii} 5.5,${Ii} -5.5,${Ii}" />`,
	candidate: "<circle cx=\"0\" cy=\"0\" r=\"6.5\" fill=\"none\" /><circle cx=\"0\" cy=\"0\" r=\"2.475\" />",
	text: "<rect x=\"-7.5\" y=\"-3.465\" width=\"15\" height=\"6.93\" rx=\"3.465\" />",
	data: "<rect x=\"-5.5\" y=\"-5.5\" width=\"11\" height=\"11\" />"
});
function Ri(e) {
	let t = Pi.includes(e) ? e : "context";
	return `<g data-glyph="${t}" transform="scale(${Fi})" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round">${Li[t]}</g>`;
}
//#endregion
//#region ui/ArtifactPin.svelte
var zi = /* @__PURE__ */ Pr("<svg width=\"18\" height=\"18\" viewBox=\"-9 -9 18 18\" aria-hidden=\"true\" focusable=\"false\"></svg>");
function Bi(e, t) {
	Ue(t, !0);
	let n = ji(t, "className", 3, "pc-pin-glyph");
	var r = zi();
	ti(r, () => Ri(t.kind), !0), P(r), H(() => {
		di(r, 0, ai(n())), Q(r, "data-kind", t.kind), Q(r, "x", t.x), Q(r, "y", t.y);
	}), q(e, r), We();
}
//#endregion
//#region ui/NodeCard.svelte
var Vi = /* @__PURE__ */ K("<span class=\"pc-modifier-badge svelte-1jilz27\"> </span>"), Hi = /* @__PURE__ */ K("<div><span class=\"pc-native-pin-label\"> </span> <div role=\"img\"><!></div></div>"), Ui = /* @__PURE__ */ K("<div class=\"pc-node-body\"> </div>"), Wi = /* @__PURE__ */ K("<span class=\"pc-native-alias\"> </span>"), Gi = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-node-action pc-host-result\" aria-label=\"Preview host result\"><i class=\"fa-solid fa-eye\" aria-hidden=\"true\"></i> Host result</button>"), Ki = /* @__PURE__ */ K("<div role=\"group\" tabindex=\"0\"><div class=\"pc-native-heading\"><svg class=\"pc-native-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path></path></svg><span class=\"pc-node-title\"> </span><!></div> <div class=\"pc-native-pins\"></div> <!> <!> <!></div>");
function qi(e, t) {
	Ue(t, !0);
	let n = (e) => e.stopPropagation();
	var r = Ki();
	let i;
	var a = z(r), o = z(a), s = z(o);
	P(o);
	var c = V(o), l = z(c, !0);
	P(c);
	var u = V(c), d = (e) => {
		var n = Vi(), r = z(n);
		P(n), H(() => {
			Q(n, "title", t.card.modifierSummary.text), Q(n, "aria-label", t.card.modifierSummary.text), J(r, `+${t.card.modifierSummary.count ?? ""}`);
		}), q(e, n);
	};
	Y(u, (e) => {
		t.card.modifierSummary && e(d);
	}), P(a);
	var f = V(a, 2);
	X(f, 21, () => t.card.ports, (e) => e.id, (e, n) => {
		var r = Hi();
		let i;
		var a = z(r), o = z(a, !0);
		P(a);
		var s = V(a, 2);
		Bi(z(s), { get kind() {
			return U(n).kind;
		} }), P(s), P(r), H(() => {
			di(r, 1, `pc-native-row pc-native-row-${U(n).dir}`, "svelte-1jilz27"), i = pi(r, "", i, { "grid-row": U(n).row }), J(o, U(n).label), di(s, 1, ai(U(n).className), "svelte-1jilz27"), Q(s, "data-node", t.card.id), Q(s, "data-dir", U(n).dir), Q(s, "data-port", U(n).port), Q(s, "data-side", U(n).side), Q(s, "data-kind", U(n).kind), Q(s, "title", U(n).title), Q(s, "aria-label", U(n).title);
		}), W("mouseenter", s, () => t.actions.hoverPin({
			nodeId: t.card.id,
			dir: U(n).dir,
			port: U(n).port
		})), W("mouseleave", s, () => t.actions.hoverPin(null)), q(e, r);
	}), P(f);
	var p = V(f, 2), m = (e) => {
		var n = Ui(), r = z(n, !0);
		P(n), H(() => J(r, t.card.body)), q(e, n);
	};
	Y(p, (e) => {
		t.card.type === "note" && e(m);
	});
	var h = V(p, 2), g = (e) => {
		var n = Wi(), r = z(n, !0);
		P(n), H(() => {
			Q(n, "title", t.card.titleHint), J(r, t.card.title);
		}), q(e, n);
	};
	Y(h, (e) => {
		t.card.compact && e(g);
	});
	var _ = V(h, 2), v = (e) => {
		var r = Gi();
		G("mousedown", r, n), G("click", r, (e) => {
			n(e), t.actions.hostResult(t.card.id);
		}), q(e, r);
	};
	Y(_, (e) => {
		t.card.hostResult && e(v);
	}), P(r), H(() => {
		di(r, 1, ai(t.card.className), "svelte-1jilz27"), Q(r, "data-id", t.card.id), Q(r, "title", t.card.offHint), Q(r, "aria-label", `${t.card.label}: ${t.card.title}`), i = pi(r, "", i, {
			left: `${t.card.x}px`,
			top: `${t.card.y}px`
		}), Q(s, "d", t.card.iconPath), Q(c, "title", t.card.titleHint), J(l, t.card.title);
	}), q(e, r), We();
}
Tr(["mousedown", "click"]);
//#endregion
//#region ui/GroupCard.svelte
var Ji = /* @__PURE__ */ K("<div class=\"pc-node-body\"> </div>"), Yi = /* @__PURE__ */ K("<div role=\"group\"><div><i class=\"fa-solid fa-object-group\" aria-hidden=\"true\"></i> <span> </span> <span class=\"pc-group-frame-count\"> </span> <button type=\"button\"></button></div> <!></div>");
function Xi(e, t) {
	Ue(t, !0);
	function n(e, n) {
		e.stopPropagation(), e.preventDefault(), t.actions.group(t.group.id, n);
	}
	function r(e, n) {
		e.stopPropagation(), e.detail === 0 && t.actions.group(t.group.id, n);
	}
	var i = Yi();
	let a;
	var o = z(i), s = V(z(o), 2), c = z(s, !0);
	P(s);
	var l = V(s, 2), u = z(l, !0);
	P(l);
	var d = V(l, 2);
	P(o);
	var f = V(o, 2), p = (e) => {
		var n = Ji(), r = z(n, !0);
		P(n), H(() => J(r, t.group.body)), q(e, n);
	};
	Y(f, (e) => {
		t.group.collapsed && e(p);
	}), P(i), H(() => {
		di(i, 1, ai(t.group.className)), Q(i, "data-group", t.group.id), Q(i, "aria-label", `Group: ${t.group.title}`), a = pi(i, "", a, {
			left: `${t.group.x}px`,
			top: `${t.group.y}px`,
			width: `${t.group.w}px`,
			height: t.group.collapsed ? void 0 : `${t.group.h}px`
		}), di(o, 1, ai(t.group.collapsed ? "pc-node-head" : "pc-group-frame-head")), di(s, 1, ai(t.group.collapsed ? "pc-node-title" : "pc-group-frame-title")), J(c, t.group.title), J(u, t.group.count), di(d, 1, `pc-node-action fa-solid pc-group-btn ${t.group.collapsed ? "fa-up-right-and-down-left-from-center" : "fa-down-left-and-up-right-to-center"}`), Q(d, "data-action", t.group.collapsed ? "open" : "collapse"), Q(d, "title", t.group.collapsed ? "Open group" : "Fold group"), Q(d, "aria-label", t.group.collapsed ? "Open group" : "Fold group");
	}), G("mousedown", d, (e) => n(e, t.group.collapsed ? "open" : "collapse")), G("click", d, (e) => r(e, t.group.collapsed ? "open" : "collapse")), q(e, i), We();
}
Tr(["mousedown", "click"]);
//#endregion
//#region ui/WireLayer.svelte
var Zi = /* @__PURE__ */ Pr("<path class=\"pc-wire-hit\"></path><path><title> </title></path><text text-anchor=\"middle\"> </text>", 1), Qi = /* @__PURE__ */ Pr("<path></path>"), $i = /* @__PURE__ */ Pr("<!><!>", 1);
function ea(e, t) {
	Ue(t, !0);
	var n = $i(), r = B(n);
	X(r, 17, () => t.wires, (e) => e.id, (e, t) => {
		var n = Zi(), r = B(n), i = V(r), a = z(i), o = z(a);
		P(a), P(i);
		var s = V(i), c = z(s, !0);
		P(s), H(() => {
			Q(r, "d", U(t).d), Q(r, "data-id", U(t).id), Q(i, "d", U(t).d), di(i, 0, ai(U(t).className)), Q(i, "data-id", U(t).id), Q(i, "data-kind", U(t).kind), J(o, `${U(t).kind ?? ""} artifact`), Q(s, "x", U(t).label.x), Q(s, "y", U(t).label.y), di(s, 0, ai(U(t).label.className)), Q(s, "data-id", U(t).id), J(c, U(t).label.text);
		}), q(e, n);
	});
	var i = V(r), a = (e) => {
		var n = Qi();
		H(() => {
			Q(n, "d", t.ghost.d), di(n, 0, ai(t.ghost.className)), Q(n, "data-kind", t.ghost.kind);
		}), q(e, n);
	};
	Y(i, (e) => {
		t.ghost && e(a);
	}), q(e, n), We();
}
//#endregion
//#region ui/CommentFrame.svelte
var ta = /* @__PURE__ */ K("<span class=\"pc-comment-title svelte-118xm2r\"> </span>"), na = /* @__PURE__ */ K("<input class=\"pc-comment-title-input svelte-118xm2r\" aria-label=\"Comment title\"/>"), ra = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-comment-resize svelte-118xm2r\" title=\"Drag to resize comment\"></button>"), ia = /* @__PURE__ */ K("<div role=\"group\"><header class=\"pc-comment-header svelte-118xm2r\"><button type=\"button\" class=\"pc-comment-select svelte-118xm2r\" title=\"Drag header to move comment\">⋮⋮</button> <!></header> <div class=\"pc-comment-notes svelte-118xm2r\"> </div> <!></div>");
function aa(e, t) {
	Ue(t, !0);
	let n = (e) => e.stopPropagation();
	var r = ia();
	let i, a;
	var o = z(r), s = z(o), c = V(s, 2), l = (e) => {
		var n = ta(), r = z(n, !0);
		P(n), H(() => J(r, t.comment.title)), q(e, n);
	}, u = (e) => {
		var r = na();
		Z(r), H(() => Si(r, t.comment.title)), W("focus", r, () => t.actions.select(t.comment.id)), W("pointerdown", r, n, !0), W("mousedown", r, n, !0), W("click", r, n, !0), W("keydown", r, n, !0), G("change", r, (e) => {
			t.comment.readOnly || t.actions.update(t.comment.id, { title: e.currentTarget.value });
		}), q(e, r);
	};
	Y(c, (e) => {
		t.comment.readOnly ? e(l) : e(u, -1);
	}), P(o);
	var d = V(o, 2), f = z(d, !0);
	P(d);
	var p = V(d, 2), m = (e) => {
		var n = ra();
		H(() => Q(n, "aria-label", `Resize comment: ${t.comment.title}`)), G("click", n, (e) => {
			e.detail === 0 && t.actions.select(t.comment.id);
		}), q(e, n);
	};
	Y(p, (e) => {
		t.comment.readOnly || e(m);
	}), P(r), H(() => {
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
	}), q(e, r), We();
}
Tr(["click", "change"]);
//#endregion
//#region ui/NodeProfilePicker.svelte
var oa = /* @__PURE__ */ K("<div class=\"node-model-meta svelte-jdmiua\"> </div>"), sa = /* @__PURE__ */ Pr("<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-jdmiua\"><path d=\"m5 12 4 4L19 6\" class=\"svelte-jdmiua\"></path></svg>"), ca = /* @__PURE__ */ K("<button type=\"button\" role=\"option\"><span class=\"profile-option-copy svelte-jdmiua\"><span class=\"profile-name svelte-jdmiua\"> </span><span class=\"profile-meta svelte-jdmiua\"> </span></span><span class=\"profile-check svelte-jdmiua\"><!></span></button>"), la = /* @__PURE__ */ K("<div class=\"profile-error svelte-jdmiua\" role=\"alert\"> </div>"), ua = /* @__PURE__ */ K("<div class=\"profile-menu svelte-jdmiua\"><div class=\"profile-search svelte-jdmiua\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-jdmiua\"><circle cx=\"10\" cy=\"10\" r=\"6\" class=\"svelte-jdmiua\"></circle><path d=\"m15 15 5 5\" class=\"svelte-jdmiua\"></path></svg><input role=\"combobox\" aria-label=\"Search connection profiles\" aria-autocomplete=\"list\" aria-expanded=\"true\" placeholder=\"Search connection profiles…\" autocomplete=\"off\" spellcheck=\"false\" maxlength=\"200\" class=\"svelte-jdmiua\"/></div> <div class=\"profile-options svelte-jdmiua\" role=\"listbox\" aria-label=\"Connection profiles\"></div> <!></div>"), da = /* @__PURE__ */ K("<div class=\"pc-node-profile svelte-jdmiua\" role=\"group\" aria-label=\"Node connection profile\"><!> <div class=\"profile-picker svelte-jdmiua\"><button type=\"button\" class=\"profile-bar svelte-jdmiua\" aria-haspopup=\"listbox\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-jdmiua\"><path d=\"M12 22v-5M15 8V2M17 8a1 1 0 0 1 1 1v4a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1zM9 8V2\" class=\"svelte-jdmiua\"></path></svg><span class=\"profile-value svelte-jdmiua\"> </span><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-jdmiua\"><path d=\"m6 9 6 6 6-6\" class=\"svelte-jdmiua\"></path></svg></button> <!></div></div>");
function fa(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ L(!1), r = /* @__PURE__ */ L(""), i = /* @__PURE__ */ L(0), a = /* @__PURE__ */ L(""), o = /* @__PURE__ */ L(!1), s = -1, c = 0, l = !1, u = /* @__PURE__ */ L(35), d, f, p = /* @__PURE__ */ L(void 0), m = /* @__PURE__ */ L(void 0), h = (e) => e.stopPropagation();
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
	let _ = /* @__PURE__ */ F(() => U(r).toLocaleLowerCase().trim().split(/\s+/).filter(Boolean)), v = /* @__PURE__ */ F(() => [...t.row.options.filter((e) => e.active), ...t.row.options.filter((e) => !e.active && U(_).every((t) => `${e.label} ${e.apiLabel} ${e.model}`.toLocaleLowerCase().includes(t)))]), y = /* @__PURE__ */ F(() => Math.max(1, Math.min(330, t.row.visibleBounds.w - 16))), b = /* @__PURE__ */ F(() => Math.max(t.row.visibleBounds.x + 8, Math.min(t.row.x, t.row.visibleBounds.x + t.row.visibleBounds.w - U(y) - 8)) - t.row.x), x = /* @__PURE__ */ F(() => t.row.h + t.row.clearance + 7), S = /* @__PURE__ */ F(() => t.row.visibleBounds.y + t.row.visibleBounds.h - (t.row.y + U(x) + U(u) + 6) - 8), C = /* @__PURE__ */ F(() => t.row.y + U(x) - t.row.visibleBounds.y - 14), w = /* @__PURE__ */ F(() => U(S) < 130 && U(C) > U(S)), T = /* @__PURE__ */ F(() => Math.max(U(C), U(S)) < 78), E = /* @__PURE__ */ F(() => Math.max(0, Math.min(244, (U(T) ? t.row.visibleBounds.h - 16 : U(w) ? U(C) : U(S)) - 54))), D = /* @__PURE__ */ F(() => t.row.visibleBounds.y + 8 - t.row.y - U(x)), O = (e) => `${t.row.id}-profile-option-${e}`;
	function k(e = !1, t = !1) {
		t || (c++, l = !1), R(n, !1), R(r, ""), R(a, ""), R(o, !1), e && f?.focus({ preventScroll: !0 });
	}
	async function A() {
		if (!t.row.editable) return;
		let e = t.row.selection.selectionKey;
		if (await t.refreshProfiles?.(t.row.selection), !t.row.editable || !d?.isConnected || t.row.selection.selectionKey !== e) return;
		let c = f.getBoundingClientRect(), l = c.width > 0 && t.row.w > 0 ? c.width / t.row.w : 1;
		R(u, c.height > 0 ? c.height / l : 35, !0), window.dispatchEvent(new CustomEvent("pc-node-profile-open", { detail: d })), s = t.row.authorityVersion, R(r, ""), R(a, ""), R(o, !1), R(i, Math.max(0, U(v).findIndex((e) => e.value === t.row.value)), !0), R(n, !0), await pr(), U(n) && (U(p)?.focus({ preventScroll: !0 }), U(m) && (U(m).scrollTop = 0));
	}
	function j() {
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
				c === u && d?.isConnected && t.row.selection.selectionKey === i.selectionKey && JSON.stringify(t.row.selection.address) === JSON.stringify(i.address) && (!U(n) || s === r) && k(!0);
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
		h(e), U(n) ? e.key === "Escape" ? (e.preventDefault(), k(!0)) : e.key === "ArrowDown" || e.key === "ArrowUp" ? (e.preventDefault(), R(i, Math.max(0, Math.min(U(v).length - 1, U(i) + (e.key === "ArrowDown" ? 1 : -1))), !0), await pr(), U(m)?.querySelector(".is-active")?.scrollIntoView?.({ block: "nearest" }), U(p)?.focus({ preventScroll: !0 })) : e.key === "Enter" && e.target === U(p) && (e.preventDefault(), U(v)[U(i)] && await ee(U(v)[U(i)])) : [
			"ArrowDown",
			"ArrowUp",
			"Enter",
			" "
		].includes(e.key) && (e.preventDefault(), await A());
	}
	function ne(e) {
		e.preventDefault(), h(e), U(m) && (U(m).scrollTop += e.deltaY * (e.deltaMode === 1 ? 18 : e.deltaMode === 2 ? U(m).clientHeight : 1));
	}
	Sn(() => {
		U(n) && (t.row.authorityVersion !== s || !t.row.editable) && k(!1, !0);
	});
	var re = da();
	W("pointerdown", an, (e) => {
		(U(n) || l) && !d.contains(e.target) && k();
	});
	let ie;
	var ae = z(re), oe = (e) => {
		var n = oa(), r = z(n, !0);
		P(n), H(() => {
			Q(n, "title", t.row.model), J(r, t.row.model);
		}), q(e, n);
	};
	Y(ae, (e) => {
		t.row.model && e(oe);
	});
	var se = V(ae, 2);
	let ce;
	var le = z(se), ue = V(z(le)), de = z(ue, !0);
	P(ue), Me(), P(le), $(le, (e) => f = e, () => f);
	var fe = V(le, 2), pe = (e) => {
		var n = ua();
		let s;
		var c = z(n), l = V(z(c));
		Z(l), $(l, (e) => R(p, e), () => U(p)), P(c);
		var d = V(c, 2);
		let f;
		X(d, 23, () => U(v), (e) => e.value, (e, n, r) => {
			var a = ca();
			let s;
			var c = z(a), l = z(c), u = z(l, !0);
			P(l);
			var d = V(l), f = z(d, !0);
			P(d), P(c);
			var p = V(c), m = z(p), h = (e) => {
				q(e, sa());
			};
			Y(m, (e) => {
				U(n).value === t.row.value && e(h);
			}), P(p), P(a), H((e, c) => {
				Q(a, "id", e), s = di(a, 1, "profile-option svelte-jdmiua", null, s, { "is-active": U(r) === U(i) }), Q(a, "aria-selected", U(n).value === t.row.value), a.disabled = U(o), Q(l, "title", U(n).label), J(u, U(n).label), J(f, c);
			}, [() => O(U(r)), () => U(n).active ? "Follows SillyTavern’s current model" : [U(n).apiLabel, U(n).model].filter(Boolean).join(" · ")]), G("click", a, () => ee(U(n))), q(e, a);
		}), P(d), $(d, (e) => R(m, e), () => U(m));
		var h = V(d, 2), g = (e) => {
			var t = la(), n = z(t, !0);
			P(t), H(() => J(n, U(a))), q(e, t);
		};
		Y(h, (e) => {
			U(a) && e(g);
		}), P(n), H((e) => {
			s = pi(n, "", s, {
				width: `${U(y)}px`,
				left: `${U(b)}px`,
				top: U(T) ? `${U(D)}px` : U(w) ? "auto" : `${U(u) + 6}px`,
				bottom: !U(T) && U(w) ? `${U(u) + 6}px` : "auto"
			}), Q(l, "aria-controls", `${t.row.id}-profile-list`), Q(l, "aria-activedescendant", e), Q(d, "id", `${t.row.id}-profile-list`), f = pi(d, "", f, { "max-height": `${U(E)}px` });
		}, [() => U(i) >= 0 && U(v).length ? O(U(i)) : void 0]), G("input", l, j), Di(l, () => U(r), (e) => R(r, e)), W("wheel", d, ne), q(e, n);
	};
	Y(fe, (e) => {
		U(n) && e(pe);
	}), P(se), P(re), $(re, (e) => d = e, () => d), ni(re, (e) => g?.(e)), H(() => {
		Q(re, "data-id", t.row.id), ie = pi(re, "", ie, {
			left: `${t.row.x}px`,
			top: `${t.row.y}px`,
			width: `${t.row.w}px`,
			"z-index": U(n) ? 20 : 2
		}), ce = pi(se, "", ce, { top: `${U(x)}px` }), Q(le, "title", t.row.label), Q(le, "aria-label", `Connection profile: ${t.row.label}`), Q(le, "aria-expanded", U(n)), le.disabled = !t.row.editable, J(de, t.row.label);
	}), W("wheel", re, h), G("click", le, () => U(n) ? k() : A()), q(e, re), We();
}
Tr(["click", "input"]);
//#endregion
//#region ui/CanvasLayer.svelte
var pa = /* @__PURE__ */ K("<div class=\"pc-viewport\" data-pc-renderer=\"svelte\"><div class=\"pc-comment-layer svelte-o7b704\"></div> <svg class=\"pc-wires\" aria-label=\"Canvas connections\"><!></svg> <div class=\"pc-nodes\"><!> <!> <!></div> <div class=\"pc-node-profile-layer svelte-o7b704\"></div></div>");
function ma(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ L([]), r = /* @__PURE__ */ L([]), i = /* @__PURE__ */ L([]), a = /* @__PURE__ */ L([]), o = /* @__PURE__ */ L([]), s = /* @__PURE__ */ L({
		select() {},
		update() {},
		command() {}
	}), c = /* @__PURE__ */ L(null), l = /* @__PURE__ */ L({
		w: 4e3,
		h: 4e3
	}), u, d, f, p;
	function m() {
		return {
			viewport: u,
			svg: d,
			nodeLayer: f,
			commentLayer: p
		};
	}
	function h(e, t) {
		R(a, e), R(s, t);
	}
	function g(e) {
		R(n, e);
	}
	function _(e) {
		R(o, e);
	}
	function v(e) {
		R(r, e);
	}
	function y(e, t, n) {
		R(i, e), R(l, t), R(c, n);
	}
	function b(e, t) {
		let i = new Map(e.map((e) => [e.id, e])), o = new Map(t.map((e) => [e.id, e]));
		R(n, U(n).map((e) => i.has(e.id) ? {
			...e,
			...i.get(e.id)
		} : e)), R(a, U(a).map((e) => i.has(e.id) ? {
			...e,
			...i.get(e.id)
		} : e)), R(r, U(r).map((e) => o.has(e.id) ? {
			...e,
			...o.get(e.id)
		} : e));
	}
	var x = {
		getLayers: m,
		setComments: h,
		setNodes: g,
		setNodeProfiles: _,
		setGroups: v,
		setWires: y,
		setPositions: b
	}, S = pa(), C = z(S);
	X(C, 21, () => U(a), (e) => e.id, (e, t) => {
		aa(e, {
			get comment() {
				return U(t);
			},
			get actions() {
				return U(s);
			}
		});
	}), P(C), $(C, (e) => p = e, () => p);
	var w = V(C, 2);
	ea(z(w), {
		get wires() {
			return U(i);
		},
		get ghost() {
			return U(c);
		}
	}), P(w), $(w, (e) => d = e, () => d);
	var T = V(w, 2), E = z(T);
	X(E, 17, () => U(r).filter((e) => !e.collapsed), (e) => e.id, (e, n) => {
		Xi(e, {
			get group() {
				return U(n);
			},
			get actions() {
				return t.actions;
			}
		});
	});
	var D = V(E, 2);
	X(D, 17, () => U(n), (e) => e.id, (e, n) => {
		qi(e, {
			get card() {
				return U(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), X(V(D, 2), 17, () => U(r).filter((e) => e.collapsed), (e) => e.id, (e, n) => {
		Xi(e, {
			get group() {
				return U(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), P(T), $(T, (e) => f = e, () => f);
	var O = V(T, 2);
	return X(O, 21, () => U(o), (e) => e.id, (e, n) => {
		fa(e, {
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
	}), P(O), P(S), $(S, (e) => u = e, () => u), H(() => {
		Q(w, "width", U(l).w), Q(w, "height", U(l).h), Q(w, "viewBox", `0 0 ${U(l).w} ${U(l).h}`);
	}), q(e, S), We(x);
}
//#endregion
//#region ui/WorkspaceMenus.svelte
var ha = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-flat-menu\" aria-haspopup=\"menu\"> </button>"), ga = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\"><span> </span><small> </small></button>"), _a = /* @__PURE__ */ K("<div class=\"pc-workspace-menu-panel\" role=\"menu\" tabindex=\"-1\"></div>"), va = /* @__PURE__ */ K("<nav class=\"pc-workspace-menus\" aria-label=\"Workspace menus\"><!> <!></nav>");
function ya(e, t) {
	Ue(t, !0);
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
				...t.state.hasArchivedWorkflows ? [u("Export archived workflows", "export-archived-workflows")] : [],
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
				...U(n)?.phase === "unified" ? [u(U(n).assigned ? "Unified workflow assigned" : "Assign unified workflow", "assign-workflow", "", U(n).assigned || U(n).busy)] : [],
				u("Stop workflow", "stop-workflow", "", !U(n)?.busy)
			];
			case "Tools": return [
				u("Recall arms…", "recall-arms"),
				u("Workflow Data…", "story-documents"),
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
		if (U(r) === e && !n) {
			f();
			return;
		}
		R(r, e, !0), o = t, await pr();
		let i = t.getBoundingClientRect(), l = U(a).getBoundingClientRect();
		R(s, Math.max(4, Math.min(i.left, window.innerWidth - l.width - 4)), !0), R(c, i.bottom + 2), n && U(a).querySelector("button:not(:disabled)")?.focus();
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
		if (e.key === "Escape" && U(r)) e.preventDefault(), e.stopPropagation(), f(!0);
		else if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
			e.preventDefault();
			let n = U(r) || t.textContent || l[0], a = l[(l.indexOf(n) + (e.key === "ArrowRight" ? 1 : l.length - 1)) % l.length], o = i.querySelector(`[data-menu="${a}"]`);
			U(r) ? p(a, o, !0) : o.focus();
		} else if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Home" || e.key === "End") {
			if (e.preventDefault(), !U(r)) {
				p(t.dataset.menu || l[0], t, !0);
				return;
			}
			let n = [...U(a).querySelectorAll("button:not(:disabled)")], i = n.indexOf(t);
			n[e.key === "Home" ? 0 : e.key === "End" ? n.length - 1 : (i + (e.key === "ArrowUp" ? n.length - 1 : 1)) % n.length]?.focus();
		} else e.key === "Tab" && f();
	}
	var g = va();
	W("pointerdown", rn, (e) => {
		U(r) && !i.contains(e.target) && !U(a)?.contains(e.target) && f();
	}), W("resize", rn, () => f());
	var _ = z(g);
	X(_, 17, () => l, Kr, (e, t) => {
		var n = ha(), i = z(n, !0);
		P(n), H(() => {
			Q(n, "data-menu", U(t)), Q(n, "aria-expanded", U(r) === U(t)), J(i, U(t));
		}), G("click", n, (e) => p(U(t), e.currentTarget)), G("keydown", n, h), q(e, n);
	});
	var v = V(_, 2), y = (e) => {
		var t = _a();
		let n;
		X(t, 21, () => d(U(r)), Kr, (e, t) => {
			var n = ga(), r = z(n), i = z(r, !0);
			P(r);
			var a = V(r), o = z(a, !0);
			P(a), P(n), H(() => {
				n.disabled = U(t).disabled, J(i, U(t).label), J(o, U(t).shortcut);
			}), G("click", n, () => m(U(t).command)), q(e, n);
		}), P(t), $(t, (e) => R(a, e), () => U(a)), H(() => {
			Q(t, "aria-label", U(r)), n = pi(t, "", n, {
				left: `${U(s)}px`,
				top: `${U(c)}px`
			});
		}), G("keydown", t, h), q(e, t);
	};
	Y(v, (e) => {
		U(r) && e(y);
	}), P(g), $(g, (e) => i = e, () => i), q(e, g), We();
}
Tr(["click", "keydown"]);
//#endregion
//#region ui/Toolbar.svelte
var ba = /* @__PURE__ */ K("<option> </option>"), xa = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-btn menu_button pc-root-stop\" title=\"Stop the workflow\">■ Stop</button>"), Sa = /* @__PURE__ */ K("<header class=\"pc-header\" data-pc-ui=\"svelte\"><div class=\"pc-menubar\"><div class=\"pc-brand\"><img width=\"30\" height=\"30\" alt=\"\"/><span>LATTICE</span></div> <!> <button type=\"button\" class=\"pc-btn menu_button pc-close\" title=\"Close\" aria-label=\"Close canvas\">×</button></div> <div class=\"pc-workflow-bar\"><select class=\"pc-select pc-graph-select text_pole\" aria-label=\"Workflow\"></select> <div class=\"pc-header-actions pc-history\"><button type=\"button\" aria-label=\"Undo\">↶</button> <button type=\"button\" aria-label=\"Redo\">↷</button> <span> </span></div> <!> <span class=\"pc-root-workflow-status\" role=\"status\"> </span> <div class=\"pc-header-actions pc-surface-actions\"><button type=\"button\" title=\"Show or hide the inspector\" aria-label=\"Toggle inspector\">Details</button></div> <label class=\"pc-arm\"><input class=\"pc-arm-input\" type=\"checkbox\"/><span>Arm</span></label></div></header>");
function Ca(e, t) {
	Ue(t, !0);
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
	}, u = Sa(), d = z(u), f = z(d), p = z(f);
	Me(), P(f);
	var m = V(f, 2);
	ya(m, {
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
	X(_, 21, () => t.state.graphs, (e) => e.id, (e, t) => {
		var n = ba(), r = z(n, !0);
		P(n);
		var i = {};
		H(() => {
			J(r, U(t).name), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
		}), q(e, n);
	}), P(_), $(_, (e) => i = e, () => i);
	var v;
	hi(_);
	var y = V(_, 2), b = z(y), x = V(b, 2), S = V(x, 2), C = z(S, !0);
	P(S), P(y);
	var w = V(y, 2), T = (e) => {
		var n = xa();
		G("click", n, () => t.actions.command("stop-workflow")), q(e, n);
	};
	Y(w, (e) => {
		U(n)?.busy && e(T);
	});
	var E = V(w, 2), D = z(E);
	P(E);
	var O = V(E, 2), k = z(O);
	$(k, (e) => o = e, () => o), P(O);
	var A = V(O, 2), j = z(A);
	return Z(j), $(j, (e) => a = e, () => a), Me(), P(A), P(g), P(u), $(u, (e) => r = e, () => r), H(() => {
		Q(p, "src", t.actions.logoUrl), v !== (v = t.state.graphId) && (_.value = (_.__value = t.state.graphId) ?? "", mi(_, t.state.graphId)), di(b, 1, `pc-btn menu_button pc-undo${t.state.history.undo ? "" : " pc-disabled"}`), b.disabled = !t.state.history.undo, Q(b, "title", t.state.history.undoTitle), di(x, 1, `pc-btn menu_button pc-redo${t.state.history.redo ? "" : " pc-disabled"}`), x.disabled = !t.state.history.redo, Q(x, "title", t.state.history.redoTitle), di(S, 1, `pc-history-note${t.state.history.showNote ? " pc-show" : ""}`), J(C, t.state.history.note), J(D, `${U(n) ? `${U(n).phase} · ${U(n).assigned ? "Assigned" : "Unassigned"} · ≤ ${U(n).callBound} requests` : "Workflow unavailable"} · Autosave in SillyTavern`), di(k, 1, `pc-btn menu_button pc-pane-toggle${t.state.inspectorOpen ? " pc-on" : ""}`), Q(k, "aria-pressed", t.state.inspectorOpen), Ci(j, t.state.armed);
	}), G("click", h, () => t.actions.command("close")), G("change", _, (e) => t.actions.pickGraph(e.currentTarget.value)), G("click", b, () => t.actions.command("undo")), G("click", x, () => t.actions.command("redo")), G("click", k, () => t.actions.command("inspector")), G("change", j, (e) => t.actions.arm(e.currentTarget.checked)), q(e, u), We(l);
}
Tr(["click", "change"]);
//#endregion
//#region ui/PaneDivider.svelte
var wa = /* @__PURE__ */ K("<div class=\"pc-pane-divider\" role=\"separator\" aria-label=\"Resize preview\" aria-orientation=\"horizontal\" tabindex=\"0\"></div>");
function Ta(e, t) {
	Ue(t, !0);
	let n = ji(t, "min", 3, 90), r = ji(t, "max", 3, 500), i, a = null, o = (e) => Math.max(n(), Math.min(r(), e));
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
	Ni(u);
	var f = wa();
	W("blur", rn, u), $(f, (e) => i = e, () => i), H((e, t) => {
		Q(f, "aria-valuemin", n()), Q(f, "aria-valuemax", e), Q(f, "aria-valuenow", t);
	}, [() => Math.round(r()), () => Math.round(t.height)]), G("pointerdown", f, s), G("pointermove", f, c), G("pointerup", f, (e) => l(!1, e.pointerId)), W("pointercancel", f, (e) => l(!0, e.pointerId)), W("lostpointercapture", f, (e) => l(!0, e.pointerId)), G("keydown", f, d), q(e, f), We();
}
Tr([
	"pointerdown",
	"pointermove",
	"pointerup",
	"keydown"
]);
//#endregion
//#region ui/DetailsDivider.svelte
var Ea = /* @__PURE__ */ K("<div class=\"pc-details-divider svelte-1iyzcro\" role=\"separator\" aria-label=\"Resize Details\" aria-orientation=\"vertical\" tabindex=\"0\"></div>");
function Da(e, t) {
	Ue(t, !0);
	let n = ji(t, "min", 3, 220), r = ji(t, "max", 3, 520), i, a = null, o = (e) => Math.max(n(), Math.min(r(), e));
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
	Ni(c);
	var f = Ea();
	W("blur", rn, c), $(f, (e) => i = e, () => i), H((e, t) => {
		Q(f, "aria-valuemin", n()), Q(f, "aria-valuemax", e), Q(f, "aria-valuenow", t);
	}, [() => Math.round(r()), () => Math.round(t.width)]), G("pointerdown", f, l), G("pointermove", f, u), G("pointerup", f, (e) => s(!1, e.pointerId)), W("pointercancel", f, (e) => s(!0, e.pointerId)), W("lostpointercapture", f, (e) => s(!0, e.pointerId)), G("keydown", f, d), q(e, f), We();
}
Tr([
	"pointerdown",
	"pointermove",
	"pointerup",
	"keydown"
]);
//#endregion
//#region ui/GraphTabs.svelte
var Oa = /* @__PURE__ */ K("<span class=\"pc-graph-tab-lock svelte-7ptwed\" aria-label=\"Read only\">◇</span>"), ka = /* @__PURE__ */ K("<input type=\"text\" title=\"Enter to save, Escape to cancel\"/>"), Aa = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-graph-tab-close svelte-7ptwed\">×</button>"), ja = /* @__PURE__ */ K("<div><button type=\"button\" role=\"tab\" aria-haspopup=\"menu\"><span class=\"svelte-7ptwed\"> </span><!></button> <!> <!></div>"), Ma = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button>"), Na = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Save workflow</button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close tab</button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close other tabs</button> <!>", 1), Pa = /* @__PURE__ */ K("<!> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close active view</button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close other views</button> <!>", 1), Fa = /* @__PURE__ */ K("<div role=\"menu\" tabindex=\"-1\"><!></div>"), Ia = /* @__PURE__ */ K("<nav aria-label=\"Open graph views\"><div class=\"pc-graph-tab-list svelte-7ptwed\" role=\"tablist\" aria-label=\"Graph views\"></div> <button type=\"button\" class=\"pc-graph-view-overflow svelte-7ptwed\" aria-label=\"Graph view actions\" title=\"Focus, close or reopen graph views\" aria-haspopup=\"menu\">⋯</button> <!></nav>");
function La(e, t) {
	Ue(t, !0);
	let n = ji(t, "actions", 19, () => ({})), r = ji(t, "idPrefix", 3, "pc-graph-view"), i = /* @__PURE__ */ L(null), a = /* @__PURE__ */ L(null), o = /* @__PURE__ */ L(null), s = /* @__PURE__ */ L(!1), c = /* @__PURE__ */ L(""), l = /* @__PURE__ */ L(""), u = /* @__PURE__ */ L(0), d = /* @__PURE__ */ L(0), f = "", p = /* @__PURE__ */ L(""), m = /* @__PURE__ */ L(""), h = /* @__PURE__ */ L(null), g = "", _ = null, v = 0, y = /* @__PURE__ */ F(() => t.views?.tabs.find((e) => e.key === U(l))), b = {};
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
	function ee(e) {
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
	function te(e) {
		O(!0), e();
	}
	function ne(e) {
		let t = U(y);
		t && (O(!0), e(t));
	}
	var re = { startRename: x }, ie = Ir();
	W("pointerdown", rn, (e) => {
		U(s) && !U(a)?.contains(e.target) && e.target !== U(o) && O();
	}), W("resize", rn, () => O());
	var ae = B(ie), oe = (e) => {
		var f = Ia();
		let g;
		var _ = z(f);
		X(_, 23, () => t.views.tabs, (e) => e.key, (e, n, i) => {
			var a = ja();
			let o;
			var u = z(a);
			let d;
			var f = z(u), g = z(f, !0);
			P(f);
			var _ = V(f), v = (e) => {
				q(e, Oa());
			};
			Y(_, (e) => {
				U(n).readOnly && e(v);
			}), P(u), $(u, (e, t) => b[t.key] = e, (e) => b?.[e.key], () => [U(n)]);
			var y = V(u, 2), x = (e) => {
				var t = ka();
				Z(t);
				let r;
				$(t, (e) => R(h, e), () => U(h)), H(() => {
					r = di(t, 1, "pc-graph-tab-rename svelte-7ptwed", null, r, { "pc-graph-tab-closeable": U(n).identity.kind !== "root" }), Q(t, "aria-label", U(n).identity.kind === "root" ? "Graph name" : "Subgraph name"), Q(t, "maxlength", U(n).identity.kind === "instance" ? 80 : void 0);
				}), G("keydown", t, C), W("blur", t, (e) => S(e.currentTarget, !0, !1)), Di(t, () => U(m), (e) => R(m, e)), q(e, t);
			};
			Y(y, (e) => {
				U(p) === U(n).key && e(x);
			});
			var O = V(y, 2), A = (e) => {
				var r = Aa();
				H((e, i) => {
					Q(r, "aria-label", e), Q(r, "title", i), Q(r, "tabindex", U(n).key === (U(c) || t.views.active.key) ? 0 : -1);
				}, [() => `Close ${U(n).label} · ${w(U(n))}`, () => `Close ${w(U(n))}`]), G("click", r, () => D(U(n))), G("contextmenu", r, (e) => k(e, U(n))), G("keydown", r, (e) => E(e, U(i))), q(e, r);
			};
			Y(O, (e) => {
				U(n).identity.kind !== "root" && e(A);
			}), P(a), H((e) => {
				o = di(a, 1, "pc-graph-tab-item svelte-7ptwed", null, o, {
					"pc-graph-tab-active": U(n).key === t.views.active.key,
					"pc-graph-tab-editing": U(p) === U(n).key
				}), d = di(u, 1, "pc-graph-tab svelte-7ptwed", null, d, { "pc-graph-tab-closeable": U(n).identity.kind !== "root" }), Q(u, "id", `${r()}-${U(i)}`), Q(u, "aria-controls", t.panelId), Q(u, "aria-selected", U(n).key === t.views.active.key), Q(u, "aria-expanded", U(s) && U(l) === U(n).key), Q(u, "tabindex", U(p) !== U(n).key && U(n).key === (U(c) || t.views.active.key) ? 0 : -1), Q(u, "title", e), J(g, U(n).label);
			}, [() => w(U(n))]), G("click", u, () => T(U(n).key)), G("pointerdown", u, (e) => {
				e.button === 2 && e.preventDefault();
			}), G("contextmenu", u, (e) => k(e, U(n))), G("keydown", u, (e) => E(e, U(i))), q(e, a);
		}), P(_);
		var v = V(_, 2);
		$(v, (e) => R(o, e), () => U(o));
		var O = V(v, 2), A = (e) => {
			var r = Fa();
			let i;
			var o = z(r), s = (e) => {
				let r = /* @__PURE__ */ F(() => U(y)), i = /* @__PURE__ */ F(() => n().canRenameView?.(U(r).key) === !1);
				var a = Na(), o = B(a), s = V(o, 2), c = z(s, !0);
				P(s);
				var l = V(s, 2), u = z(l, !0);
				P(l);
				var d = V(l, 2), f = V(d, 2);
				X(V(f, 2), 17, () => t.views.closedViews, (e) => e.key, (e, t) => {
					var r = Ma(), i = z(r);
					P(r), H((e, a) => {
						r.disabled = !n().reopenView, Q(r, "title", e), J(i, `Reopen ${U(t).label ?? ""} · ${a ?? ""}`);
					}, [() => w(U(t)), () => w(U(t))]), G("click", r, () => te(() => n().reopenView?.(U(t).key))), q(e, r);
				}), H((e) => {
					o.disabled = !n().saveView, s.disabled = !n().exportView, J(c, U(r).identity.kind === "root" ? "Export workflow JSON" : "Export subgraph JSON"), l.disabled = U(r).identity.kind === "library" || U(i) || !n().renameView, Q(l, "title", U(r).identity.kind === "library" ? "Library inspection is read only." : U(i) ? "Make a local copy of the containing graph to rename this subgraph." : void 0), J(u, U(r).identity.kind === "root" ? "Rename graph" : "Rename subgraph"), d.disabled = U(r).identity.kind === "root" || !n().closeView, f.disabled = e;
				}, [() => t.views.tabs.every((e) => e.identity.kind === "root" || e.key === U(r).key) || !n().closeOtherViews]), G("click", o, () => ne((e) => n().saveView?.(e.key))), G("click", s, () => ne((e) => n().exportView?.(e.key))), G("click", l, () => ne((e) => x(e.key))), G("click", d, () => ne((e) => D(e))), G("click", f, () => ne((e) => n().closeOtherViews?.(e.key))), q(e, a);
			}, c = (e) => {
				var r = Pa(), i = B(r);
				X(i, 17, () => t.views.tabs, (e) => e.key, (e, t) => {
					var n = Ma(), r = z(n);
					P(n), H((e, t) => {
						Q(n, "title", e), J(r, `Focus ${t ?? ""}`);
					}, [() => w(U(t)), () => w(U(t))]), G("click", n, () => te(() => T(U(t).key))), q(e, n);
				});
				var a = V(i, 2), o = V(a, 2);
				X(V(o, 2), 17, () => t.views.closedViews, (e) => e.key, (e, t) => {
					var r = Ma(), i = z(r);
					P(r), H((e, n) => {
						Q(r, "title", e), J(i, `Reopen ${U(t).label ?? ""} · ${n ?? ""}`);
					}, [() => w(U(t)), () => w(U(t))]), G("click", r, () => te(() => n().reopenView?.(U(t).key))), q(e, r);
				}), H((e) => {
					a.disabled = t.views.active.identity.kind === "root" || !n().closeView, o.disabled = e;
				}, [() => t.views.tabs.every((e) => e.identity.kind === "root" || e.key === t.views.active.key) || !n().closeOtherViews]), G("click", a, () => te(() => D(t.views.active))), G("click", o, () => te(() => n().closeOtherViews?.(t.views.active.key))), q(e, r);
			};
			Y(o, (e) => {
				U(y) ? e(s) : e(c, -1);
			}), P(r), $(r, (e) => R(a, e), () => U(a)), H(() => {
				i = di(r, 1, "pc-graph-view-menu svelte-7ptwed", null, i, { "pc-graph-tab-menu": !!U(l) }), pi(r, U(l) ? `left: ${U(u)}px; top: ${U(d)}px;` : void 0), Q(r, "aria-label", U(y) ? `Actions for ${U(y).label}` : "Graph view actions");
			}), G("keydown", r, ee), q(e, r);
		};
		Y(O, (e) => {
			U(s) && e(A);
		}), P(f), $(f, (e) => R(i, e), () => U(i)), H(() => {
			g = di(f, 1, "pc-graph-tabs pc-graph-tabs-multi svelte-7ptwed", null, g, { "pc-graph-tabs-menu-open": U(s) }), Q(v, "aria-expanded", U(s) && !U(l));
		}), G("click", v, j), q(e, f);
	};
	return Y(ae, (e) => {
		t.views && e(oe);
	}), q(e, ie), We(re);
}
Tr([
	"click",
	"pointerdown",
	"contextmenu",
	"keydown"
]);
//#endregion
//#region ui/GraphBreadcrumbs.svelte
var Ra = /* @__PURE__ */ K("<span aria-current=\"page\" class=\"svelte-18ovafz\"> </span>"), za = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-18ovafz\"> </button>"), Ba = /* @__PURE__ */ K("<li class=\"svelte-18ovafz\"><!></li>"), Va = /* @__PURE__ */ K("<div class=\"pc-graph-location svelte-18ovafz\"><nav aria-label=\"Graph location\" class=\"svelte-18ovafz\"><ol class=\"svelte-18ovafz\"></ol></nav> <span class=\"pc-graph-scope svelte-18ovafz\"> <!><!></span></div>");
function Ha(e, t) {
	Ue(t, !0);
	let n = ji(t, "actions", 19, () => ({})), r = /* @__PURE__ */ F(() => t.view?.identity.kind === "library" ? t.view.identity.definitionRef : t.definitionRef ?? t.view?.definitionRef);
	function i(e) {
		return e.identity.kind === "instance" ? !!n().openInstance : !!n().focusView;
	}
	function a(e) {
		e.identity.kind === "instance" ? n().openInstance?.(e.identity.instancePath) : n().focusView?.(e.key);
	}
	var o = Ir(), s = B(o), c = (e) => {
		var n = Va(), o = z(n), s = z(o);
		X(s, 23, () => t.view.breadcrumbs, (e) => e.key, (e, n, r) => {
			var o = Ba(), s = z(o), c = (e) => {
				var t = Ra(), r = z(t, !0);
				P(t), H(() => J(r, U(n).label)), q(e, t);
			}, l = (e) => {
				var t = za(), r = z(t, !0);
				P(t), H((e) => {
					t.disabled = e, J(r, U(n).label);
				}, [() => !i(U(n))]), G("click", t, () => a(U(n))), q(e, t);
			};
			Y(s, (e) => {
				U(r) === t.view.breadcrumbs.length - 1 ? e(c) : e(l, -1);
			}), P(o), q(e, o);
		}), P(s), P(o);
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
		}), P(c), P(n), H(() => {
			Q(c, "title", U(r) ? `${U(r).id} · v${U(r).version} · ${U(r).semanticHash}` : void 0), J(l, t.view.identity.kind === "library" ? "Library inspection" : "Instance graph");
		}), q(e, n);
	};
	Y(s, (e) => {
		t.view && t.view.identity.kind !== "root" && e(c);
	}), q(e, o), We();
}
Tr(["click"]);
//#endregion
//#region ui/StructuredControl.svelte
var Ua = /* @__PURE__ */ K("<small class=\"svelte-taw2zx\">Rows are available when this JSON has a supported shape.</small>"), Wa = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\"> </label><textarea class=\"pc-structured-raw svelte-taw2zx\" spellcheck=\"false\"></textarea> <!>", 1), Ga = /* @__PURE__ */ K("<option class=\"svelte-taw2zx\"> </option>"), Ka = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">Phase</label><select class=\"svelte-taw2zx\"></select> <label class=\"svelte-taw2zx\">Steps</label><input type=\"number\" min=\"1\" max=\"64\" step=\"1\" class=\"svelte-taw2zx\"/>", 1), qa = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">Name</label><input maxlength=\"128\" class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Value</label><input type=\"number\" step=\"any\" class=\"svelte-taw2zx\"/>", 1), Ja = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">Default (JSON)</label><textarea class=\"svelte-taw2zx\"></textarea>", 1), Ya = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">Name</label><input class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Path (JSON array)</label><input class=\"svelte-taw2zx\"/> <label class=\"pc-structured-check svelte-taw2zx\"><input type=\"checkbox\" class=\"svelte-taw2zx\"/> Required</label> <label class=\"pc-structured-check svelte-taw2zx\"><input type=\"checkbox\" class=\"svelte-taw2zx\"/> Use default when missing</label><small class=\"svelte-taw2zx\">Defaults apply when Required is off.</small> <!>", 1), Xa = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">ID</label><input maxlength=\"128\" class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Label</label><input maxlength=\"80\" class=\"svelte-taw2zx\"/>", 1), Za = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">Name</label><input class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Text</label><textarea class=\"svelte-taw2zx\"></textarea>", 1), Qa = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">Kind</label><select class=\"svelte-taw2zx\"><option class=\"svelte-taw2zx\">Literal</option><option class=\"svelte-taw2zx\">Regular expression</option></select> <label class=\"svelte-taw2zx\">Pattern</label><input class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Replacement</label><textarea class=\"svelte-taw2zx\"></textarea> <label class=\"svelte-taw2zx\">Flags</label><input class=\"svelte-taw2zx\"/>", 1), $a = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-taw2zx\">Move up</button><button type=\"button\" class=\"svelte-taw2zx\">Move down</button>", 1), eo = /* @__PURE__ */ K("<fieldset class=\"pc-structured-row svelte-taw2zx\"><legend class=\"svelte-taw2zx\"> </legend> <!> <div class=\"pc-structured-actions svelte-taw2zx\"><!><button type=\"button\" class=\"svelte-taw2zx\">Remove</button></div></fieldset>"), to = /* @__PURE__ */ K("<div class=\"pc-structured-rows svelte-taw2zx\"></div> <button type=\"button\" class=\"svelte-taw2zx\"> </button>", 1), no = /* @__PURE__ */ K("<div class=\"pc-structured-control svelte-taw2zx\"><div class=\"pc-structured-mode svelte-taw2zx\"><button type=\"button\" class=\"svelte-taw2zx\"> </button></div> <!></div>");
function ro(e, t) {
	Ue(t, !0);
	let n = ji(t, "disabled", 3, !1), r = ji(t, "error", 3, ""), i = [
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
	let f = /* @__PURE__ */ F(d), p = /* @__PURE__ */ L(!1), m = /* @__PURE__ */ F(() => U(p) || !U(f));
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
	var E = no(), D = z(E), O = z(D), k = z(O, !0);
	P(O), P(D);
	var A = V(D, 2), j = (e) => {
		var i = Wa(), a = B(i), o = z(a);
		P(a);
		var s = V(a);
		at(s);
		var c = V(s, 2), l = (e) => {
			q(e, Ua());
		};
		Y(c, (e) => {
			U(f) || e(l);
		}), H(() => {
			Q(a, "for", t.idPrefix + "-raw"), J(o, `${t.control.label ?? ""} (JSON)`), Q(s, "id", t.idPrefix + "-raw"), Q(s, "aria-label", t.control.label), Q(s, "aria-invalid", !!r()), Q(s, "aria-describedby", r() ? t.idPrefix + "-error" : void 0), Si(s, t.text), s.disabled = n();
		}), G("input", s, (e) => h(e.currentTarget.value)), q(e, i);
	}, ee = (e) => {
		var r = to(), a = B(r);
		X(a, 21, () => U(f), Kr, (e, r, a) => {
			var o = eo(), s = z(o), l = z(s);
			P(s);
			var d = V(s, 2), p = (e) => {
				var o = Ka(), s = B(o), c = V(s);
				Q(c, "aria-label", "Duration " + (a + 1) + " phase"), X(c, 21, () => i, Kr, (e, t) => {
					var n = Ga(), r = z(n, !0);
					P(n);
					var i = {};
					H((e, a) => {
						n.disabled = e, J(r, a), i !== (i = U(t)) && (n.value = (n.__value = U(t)) ?? "");
					}, [() => U(f).some((e, n) => n !== a && e.name === U(t)), () => U(t)[0].toUpperCase() + U(t).slice(1)]), q(e, n);
				}), P(c);
				var l;
				hi(c);
				var u = V(c, 2), d = V(u);
				Z(d), Q(d, "aria-label", "Duration " + (a + 1) + " steps"), H((e, r) => {
					Q(s, "for", t.idPrefix + "-phase-" + a), Q(c, "id", t.idPrefix + "-phase-" + a), c.disabled = n(), l !== (l = e) && (c.value = (c.__value = e) ?? "", mi(c, e)), Q(u, "for", t.idPrefix + "-steps-" + a), Q(d, "id", t.idPrefix + "-steps-" + a), Si(d, r), d.disabled = n();
				}, [() => String(U(r).name), () => Number(U(r).number)]), G("change", c, (e) => x(a, e.currentTarget)), G("change", d, (e) => b(a, e.currentTarget)), q(e, o);
			}, m = (e) => {
				var i = qa(), o = B(i), s = V(o);
				Z(s), Q(s, "aria-label", "Value " + (a + 1) + " name");
				var c = V(s, 2), l = V(c);
				Z(l), Q(l, "aria-label", "Value " + (a + 1) + " number"), H((e, r) => {
					Q(o, "for", t.idPrefix + "-name-" + a), Q(s, "id", t.idPrefix + "-name-" + a), Si(s, e), s.disabled = n(), Q(c, "for", t.idPrefix + "-number-" + a), Q(l, "id", t.idPrefix + "-number-" + a), Si(l, r), Q(l, "min", t.control.min), Q(l, "max", t.control.max), l.disabled = n();
				}, [() => String(U(r).name), () => Number(U(r).number)]), G("change", s, (e) => x(a, e.currentTarget)), G("change", l, (e) => b(a, e.currentTarget)), q(e, i);
			}, h = (e) => {
				var i = Ya(), o = B(i), s = V(o);
				Z(s), Q(s, "aria-label", "Field " + (a + 1) + " name");
				var c = V(s, 2), l = V(c);
				Z(l), Q(l, "aria-label", "Field " + (a + 1) + " path (JSON array)");
				var u = V(l, 2), d = z(u);
				Z(d), Q(d, "aria-label", "Field " + (a + 1) + " required"), Me(), P(u);
				var f = V(u, 2), p = z(f);
				Z(p), Q(p, "aria-label", "Field " + (a + 1) + " use default"), Me(), P(f);
				var m = V(f, 3), h = (e) => {
					var i = Ja(), o = B(i), s = V(o);
					at(s), Q(s, "aria-label", "Field " + (a + 1) + " default (JSON)"), H((e) => {
						Q(o, "for", t.idPrefix + "-default-" + a), Q(s, "id", t.idPrefix + "-default-" + a), Si(s, e), s.disabled = n();
					}, [() => JSON.stringify(U(r).default, null, 2)]), G("change", s, (e) => S(a, "default", e.currentTarget.value)), q(e, i);
				}, g = /* @__PURE__ */ F(() => Object.hasOwn(U(r), "default"));
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
				var i = Xa(), o = B(i), s = V(o);
				Z(s), Q(s, "aria-label", "Slot " + (a + 1) + " ID");
				var c = V(s, 2), l = V(c);
				Z(l), Q(l, "aria-label", "Slot " + (a + 1) + " label"), H((e, r) => {
					Q(o, "for", t.idPrefix + "-slot-id-" + a), Q(s, "id", t.idPrefix + "-slot-id-" + a), Si(s, e), s.disabled = n(), Q(c, "for", t.idPrefix + "-slot-label-" + a), Q(l, "id", t.idPrefix + "-slot-label-" + a), Si(l, r), l.disabled = n();
				}, [() => String(U(r).id), () => String(U(r).label)]), G("input", s, (e) => v(a, "id", e.currentTarget.value)), G("input", l, (e) => v(a, "label", e.currentTarget.value)), q(e, i);
			}, _ = (e) => {
				var i = Za(), o = B(i), s = V(o);
				Z(s), Q(s, "aria-label", "Section " + (a + 1) + " name");
				var c = V(s, 2), l = V(c);
				at(l), Q(l, "aria-label", "Section " + (a + 1) + " text"), H((e, r) => {
					Q(o, "for", t.idPrefix + "-name-" + a), Q(s, "id", t.idPrefix + "-name-" + a), Si(s, e), s.disabled = n(), Q(c, "for", t.idPrefix + "-text-" + a), Q(l, "id", t.idPrefix + "-text-" + a), Si(l, r), l.disabled = n();
				}, [() => String(U(r).name), () => String(U(r).text)]), G("input", s, (e) => v(a, "name", e.currentTarget.value)), G("input", l, (e) => v(a, "text", e.currentTarget.value)), q(e, i);
			}, y = (e) => {
				var i = Qa(), o = B(i), s = V(o);
				Q(s, "aria-label", "Rule " + (a + 1) + " kind");
				var c = z(s);
				c.value = c.__value = "literal";
				var l = V(c);
				l.value = l.__value = "regex", P(s);
				var u;
				hi(s);
				var d = V(s, 2), f = V(d);
				Z(f), Q(f, "aria-label", "Rule " + (a + 1) + " pattern");
				var p = V(f, 2), m = V(p);
				at(m), Q(m, "aria-label", "Rule " + (a + 1) + " replacement");
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
				var t = $a(), r = B(t), i = V(r);
				H(() => {
					Q(r, "aria-label", "Move " + U(c) + " " + (a + 1) + " up"), r.disabled = n() || a === 0, Q(i, "aria-label", "Move " + U(c) + " " + (a + 1) + " down"), i.disabled = n() || a === U(f).length - 1;
				}), G("click", r, () => T(a, -1)), G("click", i, () => T(a, 1)), q(e, t);
			}, k = /* @__PURE__ */ F(() => !["numeric-map", "durations"].includes(t.control.structured ?? ""));
			Y(D, (e) => {
				U(k) && e(O);
			});
			var A = V(D);
			P(E), P(o), H((e) => {
				J(l, `${e ?? ""} ${a + 1}`), Q(A, "aria-label", "Remove " + U(c) + " " + (a + 1)), A.disabled = n() || U(f).length <= U(u);
			}, [() => U(c)[0].toUpperCase() + U(c).slice(1)]), G("click", A, () => w(a)), q(e, o);
		}), P(a);
		var o = V(a, 2), s = z(o);
		P(o), H(() => {
			Q(o, "aria-label", "Add " + U(c)), o.disabled = n() || U(f).length >= U(l), J(s, `Add ${U(c) ?? ""}`);
		}), G("click", o, y), q(e, r);
	};
	Y(A, (e) => {
		U(m) ? e(j) : U(f) && e(ee, 1);
	}), P(E), H(() => {
		Q(E, "data-structured-control", t.control.structured), Q(O, "aria-label", "Edit " + t.control.label + (U(m) ? " as rows" : " as JSON")), O.disabled = n() || U(m) && !U(f), J(k, U(m) ? "Use rows" : "Edit JSON");
	}), G("click", O, () => {
		!n() && U(f) && R(p, !U(m));
	}), q(e, E), We();
}
Tr([
	"click",
	"input",
	"change"
]);
//#endregion
//#region ui/DetailControl.svelte
var io = /* @__PURE__ */ K("<span class=\"pc-control-label svelte-16a137\"> </span> <!>", 1), ao = /* @__PURE__ */ K("<label class=\"pc-detail-check svelte-16a137\"><input type=\"checkbox\" class=\"svelte-16a137\"/> </label>"), oo = /* @__PURE__ */ K("<label class=\"svelte-16a137\"><input type=\"radio\" class=\"svelte-16a137\"/><span class=\"svelte-16a137\"> </span></label>"), so = /* @__PURE__ */ K("<span class=\"pc-control-label svelte-16a137\"> </span> <div class=\"pc-control-segments svelte-16a137\" role=\"radiogroup\"></div>", 1), co = /* @__PURE__ */ K("<option class=\"svelte-16a137\"> </option>"), lo = /* @__PURE__ */ K("<select class=\"svelte-16a137\"></select>"), uo = /* @__PURE__ */ K("<input type=\"number\" class=\"svelte-16a137\"/>"), fo = /* @__PURE__ */ K("<textarea class=\"svelte-16a137\"></textarea>"), po = /* @__PURE__ */ K("<input type=\"text\" class=\"svelte-16a137\"/>"), mo = /* @__PURE__ */ K("<label class=\"svelte-16a137\"> </label> <!>", 1), ho = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-16a137\"> </button>"), go = /* @__PURE__ */ K("<small class=\"svelte-16a137\"> </small>"), _o = /* @__PURE__ */ K("<p class=\"pc-detail-error svelte-16a137\" role=\"alert\"> </p>"), vo = /* @__PURE__ */ K("<div><!> <!> <!> <!> <!></div>");
function yo(e, t) {
	Ue(t, !0);
	let n = ji(t, "error", 3, ""), r = ji(t, "disabled", 3, !1), i = ji(t, "pending", 3, !1), a = () => t.control.editor === "enum" && (t.control.options?.length ?? 0) > 1 && (t.control.options?.length ?? 0) <= 3 && t.control.options.every((e) => e.label.length <= 10), o = () => t.control.effective !== void 0 && t.control.effective !== t.text && t.control.source !== "Saved setting" ? t.control.source : "";
	var s = vo();
	let c;
	var l = z(s), u = (e) => {
		var i = io(), a = B(i), o = z(a, !0);
		P(a), ro(V(a, 2), {
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
		var n = ao(), i = z(n);
		Z(i);
		var a = V(i, 1, !0);
		P(n), H((e) => {
			Q(i, "aria-label", t.control.label), Ci(i, e), i.disabled = r(), J(a, t.control.label);
		}, [() => !!t.control.value]), G("change", i, (e) => {
			r() || t.onvalue(e.currentTarget.checked);
		}), q(e, n);
	}, f = (e) => {
		var n = so(), i = B(n), a = z(i, !0);
		P(i);
		var o = V(i, 2);
		X(o, 21, () => t.control.options ?? [], (e) => e.value, (e, n) => {
			var i = oo(), a = z(i);
			Z(a);
			var o = V(a), s = z(o, !0);
			P(o), P(i), H((e) => {
				Q(a, "name", t.idPrefix + "-choice"), Q(a, "aria-label", U(n).label), Si(a, U(n).value), Ci(a, e), a.disabled = r(), J(s, U(n).label);
			}, [() => String(t.control.value) === U(n).value]), G("change", a, (e) => {
				!r() && e.currentTarget.checked && t.onvalue(U(n).value);
			}), q(e, i);
		}), P(o), H(() => {
			J(a, t.control.label), Q(o, "aria-label", t.control.label);
		}), q(e, n);
	}, p = /* @__PURE__ */ F(() => a()), m = (e) => {
		var i = mo(), a = B(i), o = z(a, !0);
		P(a);
		var s = V(a, 2), c = (e) => {
			var n = lo();
			X(n, 21, () => t.control.options ?? [], (e) => e.value, (e, t) => {
				var n = co(), r = z(n, !0);
				P(n);
				var i = {};
				H(() => {
					J(r, U(t).label), i !== (i = U(t).value) && (n.value = (n.__value = U(t).value) ?? "");
				}), q(e, n);
			}), P(n);
			var i;
			hi(n), H((e) => {
				Q(n, "id", t.idPrefix + "-editor"), Q(n, "aria-label", t.control.label), n.disabled = r(), i !== (i = e) && (n.value = (n.__value = e) ?? "", mi(n, e));
			}, [() => String(t.control.value)]), G("change", n, (e) => {
				r() || t.onvalue(e.currentTarget.value);
			}), q(e, n);
		}, l = (e) => {
			var i = uo();
			Z(i), H((e) => {
				Q(i, "id", t.idPrefix + "-editor"), Q(i, "aria-label", t.control.label), Q(i, "min", t.control.min), Q(i, "max", t.control.max), Q(i, "step", t.control.step ?? 1), Q(i, "aria-invalid", !!n()), Q(i, "aria-describedby", n() ? t.idPrefix + "-error" : void 0), Si(i, e), i.disabled = r();
			}, [() => Number(t.control.value)]), G("change", i, (e) => {
				r() || t.onnumber(e.currentTarget);
			}), q(e, i);
		}, u = (e) => {
			var i = fo();
			at(i), H(() => {
				Q(i, "id", t.idPrefix + "-editor"), Q(i, "aria-label", t.control.label), Q(i, "aria-invalid", !!n()), Q(i, "aria-describedby", n() ? t.idPrefix + "-error" : void 0), Si(i, t.text), i.disabled = r();
			}), G("input", i, (e) => {
				r() || t.ontext(e.currentTarget.value);
			}), q(e, i);
		}, d = (e) => {
			var n = po();
			Z(n), H(() => {
				Q(n, "id", t.idPrefix + "-editor"), Q(n, "aria-label", t.control.label), Si(n, t.text), n.disabled = r();
			}), G("change", n, (e) => {
				r() || t.onvalue(e.currentTarget.value);
			}), q(e, n);
		}, f = /* @__PURE__ */ F(() => t.control.singleLine && t.control.editor === "text" && !t.text.includes("\n") && !t.text.includes("\r")), p = (e) => {
			var n = fo();
			at(n), H(() => {
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
		var n = ho(), a = z(n, !0);
		P(n), H(() => {
			Q(n, "data-save-control", t.control.key), n.disabled = r() || i(), J(a, i() ? "Validating…" : "Save " + t.control.label);
		}), G("click", n, () => {
			!r() && !i() && t.onsave();
		}), q(e, n);
	};
	Y(h, (e) => {
		(t.control.editor === "json" || t.control.editor === "lines") && e(g);
	});
	var _ = V(h, 2), v = (e) => {
		var n = go(), r = z(n, !0);
		P(n), H(() => J(r, t.control.help)), q(e, n);
	};
	Y(_, (e) => {
		t.control.help && e(v);
	});
	var y = V(_, 2), b = (e) => {
		var n = go(), r = z(n, !0);
		P(n), H(() => J(r, t.control.exposureNote)), q(e, n);
	}, x = (e) => {
		var n = go(), r = z(n);
		P(n), H((e) => J(r, `${e ?? ""} · Effective: ${t.control.effective ?? ""}`), [() => o()]), q(e, n);
	}, S = /* @__PURE__ */ F(() => o());
	Y(y, (e) => {
		t.control.exposureNote ? e(b) : U(S) && e(x, 1);
	});
	var C = V(y, 2), w = (e) => {
		var r = _o(), i = z(r, !0);
		P(r), H(() => {
			Q(r, "id", t.idPrefix + "-error"), J(i, n());
		}), q(e, r);
	};
	Y(C, (e) => {
		n() && e(w);
	}), P(s), H(() => c = di(s, 1, "pc-detail-control svelte-16a137", null, c, { "pc-control-number": t.control.editor === "number" })), q(e, s), We();
}
Tr([
	"change",
	"input",
	"click"
]);
//#endregion
//#region ui/ModifierStack.svelte
var bo = /* @__PURE__ */ K("<label class=\"svelte-1ibq9q\"><input type=\"checkbox\" class=\"svelte-1ibq9q\"/> </label>"), xo = /* @__PURE__ */ K("<option class=\"svelte-1ibq9q\"> </option>"), So = /* @__PURE__ */ K("<label class=\"pc-modifier-check svelte-1ibq9q\"><input type=\"checkbox\" class=\"svelte-1ibq9q\"/> </label>"), Co = /* @__PURE__ */ K("<select class=\"svelte-1ibq9q\"></select>"), wo = /* @__PURE__ */ K("<input type=\"number\" class=\"svelte-1ibq9q\"/>"), To = /* @__PURE__ */ K("<textarea class=\"svelte-1ibq9q\"></textarea>"), Eo = /* @__PURE__ */ K("<label class=\"svelte-1ibq9q\"> </label> <!>", 1), Do = /* @__PURE__ */ K("<small class=\"svelte-1ibq9q\"> </small>"), Oo = /* @__PURE__ */ K("<!> <!>", 1), ko = /* @__PURE__ */ K("<details class=\"svelte-1ibq9q\"><summary class=\"svelte-1ibq9q\"> <!></summary> <!> <button type=\"button\" class=\"svelte-1ibq9q\"> </button></details>"), Ao = /* @__PURE__ */ K("<p class=\"pc-modifier-error svelte-1ibq9q\" role=\"alert\"> </p>"), jo = /* @__PURE__ */ K("<div class=\"pc-modifier-entry svelte-1ibq9q\"><div class=\"pc-modifier-heading svelte-1ibq9q\"><label class=\"svelte-1ibq9q\"><input type=\"checkbox\" class=\"svelte-1ibq9q\"/><span class=\"svelte-1ibq9q\"> <small class=\"svelte-1ibq9q\"> </small></span></label> <div class=\"pc-modifier-order svelte-1ibq9q\"><button type=\"button\" title=\"Move up\" class=\"svelte-1ibq9q\">↑</button> <button type=\"button\" title=\"Move down\" class=\"svelte-1ibq9q\">↓</button> <button type=\"button\" title=\"Remove\" class=\"svelte-1ibq9q\">×</button></div></div> <!> <!></div>"), Mo = /* @__PURE__ */ K("<div class=\"pc-modifier-stack svelte-1ibq9q\"><small class=\"svelte-1ibq9q\"> </small> <!></div>"), No = /* @__PURE__ */ K("<small role=\"status\" class=\"svelte-1ibq9q\">Validating modifiers…</small>"), Po = /* @__PURE__ */ K("<section class=\"pc-modifiers svelte-1ibq9q\" data-modifier-controls=\"\" aria-label=\"Text modifiers\"><div class=\"pc-modifier-quick svelte-1ibq9q\"><!> <select aria-label=\"Add text modifier\" class=\"svelte-1ibq9q\"><option class=\"svelte-1ibq9q\">Add modifier…</option><!></select></div> <!> <!> <!></section>");
function Fo(e, t) {
	Ue(t, !0);
	let n = (e) => t.options.find((t) => t.type === e.type), r = (e) => n(e)?.label ?? e.type, i = (e) => t.drafts[e.id]?.settings ?? e.settings, a = (e) => t.disabled || t.busy || !t.options.some((t) => t.type === e) || t.items.length >= 16 && !t.items.some((t) => t.type === e);
	var o = Po(), s = z(o), c = z(s);
	X(c, 16, () => ["trim", "wrap"], Kr, (e, n) => {
		var r = bo(), i = z(r);
		Z(i);
		var o = V(i, 1, !0);
		P(r), H((e, t) => {
			Q(i, "aria-label", (n === "trim" ? "Trim" : "Wrap") + " output"), Ci(i, e), i.disabled = t, J(o, n === "trim" ? "Trim" : "Wrap");
		}, [() => t.items.some((e) => e.type === n && e.enabled), () => a(n)]), G("change", i, (e) => {
			a(n) || t.onquick(n, e.currentTarget.checked);
		}), q(e, r);
	});
	var l = V(c, 2), u = z(l);
	u.value = u.__value = "", X(V(u), 17, () => t.options.filter((e) => !["trim", "wrap"].includes(e.type)), (e) => e.type, (e, t) => {
		var n = xo(), r = z(n, !0);
		P(n);
		var i = {};
		H(() => {
			J(r, U(t).label), i !== (i = U(t).type) && (n.value = (n.__value = U(t).type) ?? "");
		}), q(e, n);
	}), P(l), l.value = l.__value = "", P(s);
	var d = V(s, 2), f = (e) => {
		var a = Mo(), o = z(a), s = z(o);
		P(o), X(V(o, 2), 19, () => t.items, (e) => e.id, (e, a, o) => {
			let s = /* @__PURE__ */ F(() => n(U(a))), c = /* @__PURE__ */ F(() => r(U(a))), l = /* @__PURE__ */ F(() => t.drafts[U(a).id]);
			var u = jo(), d = z(u), f = z(d), p = z(f);
			Z(p);
			var m = V(p), h = z(m), g = V(h), _ = z(g, !0);
			P(g), P(m), P(f);
			var v = V(f, 2), y = z(v), b = V(y, 2), x = V(b, 2);
			P(v), P(d);
			var S = V(d, 2), C = (e) => {
				var n = ko(), r = z(n), o = z(r), u = V(o), d = (e) => {
					q(e, Fr("· Unsaved"));
				};
				Y(u, (e) => {
					U(l)?.dirty && e(d);
				}), P(r);
				var f = V(r, 2);
				X(f, 17, () => U(s).fields, (e) => e.key, (e, n) => {
					let r = /* @__PURE__ */ F(() => t.idPrefix + "-modifier-" + U(a).id + "-" + U(n).key);
					var o = Oo(), s = B(o), l = (e) => {
						var o = So(), s = z(o);
						Z(s);
						var l = V(s, 1, !0);
						P(o), H((e) => {
							Q(s, "id", U(r)), Q(s, "aria-label", U(c) + " " + U(n).label), Ci(s, e), s.disabled = t.disabled, J(l, U(n).label);
						}, [() => !!i(U(a))[U(n).key]]), G("change", s, (e) => {
							t.disabled || t.ondraft(U(a).id, U(n).key, e.currentTarget.checked);
						}), q(e, o);
					}, u = (e) => {
						var o = Eo(), s = B(o), l = z(s, !0);
						P(s);
						var u = V(s, 2), d = (e) => {
							var o = Co();
							X(o, 21, () => U(n).options ?? [], (e) => e.value, (e, t) => {
								var n = xo(), r = z(n, !0);
								P(n);
								var i = {};
								H(() => {
									J(r, U(t).label), i !== (i = U(t).value) && (n.value = (n.__value = U(t).value) ?? "");
								}), q(e, n);
							}), P(o);
							var s;
							hi(o), H((e) => {
								Q(o, "id", U(r)), Q(o, "aria-label", U(c) + " " + U(n).label), o.disabled = t.disabled, s !== (s = e) && (o.value = (o.__value = e) ?? "", mi(o, e));
							}, [() => String(i(U(a))[U(n).key] ?? "")]), G("change", o, (e) => {
								t.disabled || t.ondraft(U(a).id, U(n).key, e.currentTarget.value);
							}), q(e, o);
						}, f = (e) => {
							var o = wo();
							Z(o), H((e) => {
								Q(o, "id", U(r)), Q(o, "aria-label", U(c) + " " + U(n).label), Q(o, "min", U(n).min), Q(o, "max", U(n).max), Q(o, "step", U(n).step ?? 1), Si(o, e), o.disabled = t.disabled;
							}, [() => String(i(U(a))[U(n).key] ?? "")]), G("input", o, (e) => {
								t.disabled || t.ondraft(U(a).id, U(n).key, e.currentTarget.value ? Number(e.currentTarget.value) : null);
							}), q(e, o);
						}, p = (e) => {
							var o = To();
							at(o), H((e) => {
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
						var t = Do(), r = z(t, !0);
						P(t), H(() => J(r, U(n).help)), q(e, t);
					};
					Y(d, (e) => {
						U(n).help && e(f);
					}), q(e, o);
				});
				var p = V(f, 2), m = z(p, !0);
				P(p), P(n), H(() => {
					n.open = !!U(l)?.dirty || !!U(l)?.error, J(o, `${U(c) ?? ""} settings`), Q(p, "aria-label", "Save " + U(c) + " settings"), p.disabled = t.disabled || !!U(l)?.pending || !U(l)?.dirty, J(m, U(l)?.pending ? "Validating…" : "Save settings");
				}), G("click", p, () => {
					!t.disabled && !U(l)?.pending && U(l)?.dirty && t.onsave(U(a).id);
				}), q(e, n);
			};
			Y(S, (e) => {
				U(s)?.fields.length && e(C);
			});
			var w = V(S, 2), T = (e) => {
				var t = Ao(), n = z(t, !0);
				P(t), H(() => J(n, U(l).error)), q(e, t);
			};
			Y(w, (e) => {
				U(l)?.error && e(T);
			}), P(u), H(() => {
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
		}), P(a), H((e) => J(s, `${e ?? ""} active · ${t.items.length ?? ""} total · Applied in order`), [() => t.items.filter((e) => e.enabled).length]), q(e, a);
	};
	Y(d, (e) => {
		t.items.length && e(f);
	});
	var p = V(d, 2), m = (e) => {
		q(e, No());
	};
	Y(p, (e) => {
		t.busy && e(m);
	});
	var h = V(p, 2), g = (e) => {
		var n = Ao(), r = z(n, !0);
		P(n), H(() => J(r, t.error)), q(e, n);
	};
	Y(h, (e) => {
		t.error && e(g);
	}), P(o), H(() => l.disabled = t.disabled || t.busy || t.items.length >= 16), G("change", l, (e) => {
		let n = e.currentTarget.value;
		e.currentTarget.value = "", !t.disabled && !t.busy && t.items.length < 16 && n && t.onadd(n);
	}), q(e, o), We();
}
Tr([
	"change",
	"click",
	"input"
]);
//#endregion
//#region ui/NodeDetails.svelte
var Io = /* @__PURE__ */ K("<small data-canonical-title=\"\" class=\"svelte-59ntjv\"> </small>"), Lo = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-59ntjv\">Duplicate</button>"), Ro = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-detail-danger svelte-59ntjv\">Delete</button>"), zo = /* @__PURE__ */ K("<details class=\"pc-detail-commands svelte-59ntjv\"><summary aria-label=\"Node commands\" title=\"Node commands\" class=\"svelte-59ntjv\">⋯</summary><div class=\"pc-detail-command-list svelte-59ntjv\"><!> <!></div></details>"), Bo = /* @__PURE__ */ K("<p role=\"alert\" class=\"pc-detail-error svelte-59ntjv\"> </p>"), Vo = /* @__PURE__ */ K("<label class=\"svelte-59ntjv\">Workflow stage<select aria-label=\"Workflow stage\" class=\"svelte-59ntjv\"><option class=\"svelte-59ntjv\">Preparation · before Generate Reply</option><option class=\"svelte-59ntjv\">Response · after Generate Reply</option></select></label><!>", 1), Ho = /* @__PURE__ */ K("<p class=\"svelte-59ntjv\"><button type=\"button\" class=\"svelte-59ntjv\">Configure Fast connections…</button></p>"), Uo = /* @__PURE__ */ K("<span class=\"svelte-59ntjv\">Read-only body</span>"), Wo = /* @__PURE__ */ K("<span class=\"pc-detail-blocked svelte-59ntjv\">Blocks run · Disabled</span>"), Go = /* @__PURE__ */ K("<p class=\"pc-detail-state svelte-59ntjv\"><!><!></p>"), Ko = /* @__PURE__ */ K("<p class=\"pc-detail-error svelte-59ntjv\" role=\"alert\"> </p>"), qo = /* @__PURE__ */ K("<option class=\"svelte-59ntjv\"> </option>"), Jo = /* @__PURE__ */ K("<fieldset class=\"pc-detail-group svelte-59ntjv\" data-boundary-controls=\"\"><legend class=\"svelte-59ntjv\"> </legend> <label class=\"svelte-59ntjv\">Type<select aria-label=\"Subgraph port type\" class=\"svelte-59ntjv\"></select></label> <label class=\"pc-detail-check svelte-59ntjv\"><input aria-label=\"Required subgraph port\" type=\"checkbox\" class=\"svelte-59ntjv\"/> Required</label> <div class=\"pc-detail-actions svelte-59ntjv\"><button type=\"button\" data-save-boundary=\"\" class=\"svelte-59ntjv\"> </button></div> <small class=\"svelte-59ntjv\">Labels appear on the subgraph block. Disconnect incompatible connections before changing the type. Deleting this node removes its port and attached connections.</small> <!></fieldset>"), Yo = /* @__PURE__ */ K("<p role=\"status\" class=\"svelte-59ntjv\">Loading file…</p>"), Xo = /* @__PURE__ */ K("<div data-file-input-controls=\"\" class=\"svelte-59ntjv\"><label class=\"svelte-59ntjv\"> <input type=\"file\" accept=\".txt,.md,.json,text/plain,text/markdown,application/json\" class=\"svelte-59ntjv\"/></label> <p class=\"svelte-59ntjv\"> </p> <small class=\"svelte-59ntjv\">The file's UTF-8 text is embedded in this workflow. Runs use the saved snapshot; replace the file to refresh it.</small> <small class=\"svelte-59ntjv\">Choose a .txt, .md or .json file up to 400,000 bytes and 100,000 UTF-16 code units.</small> <!> <!></div>"), Zo = /* @__PURE__ */ K("<details class=\"pc-detail-group svelte-59ntjv\"><summary class=\"svelte-59ntjv\"> </summary> <!></details>"), Qo = /* @__PURE__ */ K("<fieldset class=\"pc-detail-group pc-detail-main svelte-59ntjv\" data-operation-controls=\"\"><!> <!></fieldset> <!>", 1), $o = /* @__PURE__ */ K("<label class=\"svelte-59ntjv\">Model identifier<input class=\"svelte-59ntjv\"/></label>"), es = /* @__PURE__ */ K("<small class=\"svelte-59ntjv\"> </small>"), ts = /* @__PURE__ */ K("<fieldset class=\"svelte-59ntjv\"><legend class=\"svelte-59ntjv\"> </legend> <label class=\"svelte-59ntjv\">Connection profile<select class=\"svelte-59ntjv\"><option class=\"svelte-59ntjv\">Use helper connection</option><!><!></select></label> <label class=\"svelte-59ntjv\">Model mode<select class=\"svelte-59ntjv\"></select></label> <!> <small class=\"svelte-59ntjv\"> </small><small class=\"svelte-59ntjv\"> </small><!> <!></fieldset>"), ns = /* @__PURE__ */ K("<small class=\"svelte-59ntjv\">This helper has no text model calls to configure.</small>"), rs = /* @__PURE__ */ K("<details class=\"pc-detail-group svelte-59ntjv\" data-helper-model-controls=\"\" open=\"\"><summary class=\"svelte-59ntjv\">Helper model bindings</summary> <small class=\"svelte-59ntjv\">Choose a connection for each text model role in the pinned helper. These selections belong to this For Each node.</small> <!> <!></details>"), is = /* @__PURE__ */ K("<label class=\"svelte-59ntjv\">Model identifier<input aria-label=\"Model identifier\" class=\"svelte-59ntjv\"/></label>"), as = /* @__PURE__ */ K("<details class=\"pc-detail-group svelte-59ntjv\" data-model-controls=\"\" open=\"\"><summary class=\"svelte-59ntjv\"> </summary> <label class=\"svelte-59ntjv\">Connection profile<select aria-label=\"Connection profile\" class=\"svelte-59ntjv\"><option class=\"svelte-59ntjv\">Choose a connection</option><!><!></select></label> <label class=\"svelte-59ntjv\">Model mode<select aria-label=\"Model mode\" class=\"svelte-59ntjv\"></select></label> <!> <details data-binding-advanced=\"\" class=\"svelte-59ntjv\"><summary class=\"svelte-59ntjv\">Advanced connection settings</summary> <label class=\"svelte-59ntjv\">Connection mode<select aria-label=\"Connection mode\" class=\"svelte-59ntjv\"></select></label> <label class=\"svelte-59ntjv\">Model role<input aria-label=\"Model role\" class=\"svelte-59ntjv\"/></label></details> <!><!> <!> <!></details>"), os = /* @__PURE__ */ K("<p class=\"pc-detail-port svelte-59ntjv\"> <small class=\"svelte-59ntjv\"> </small></p>"), ss = /* @__PURE__ */ K("<details class=\"pc-detail-group svelte-59ntjv\"><summary class=\"svelte-59ntjv\">Inputs and outputs</summary><!></details>"), cs = /* @__PURE__ */ K("<p role=\"status\" class=\"svelte-59ntjv\"> </p>"), ls = /* @__PURE__ */ K("<header class=\"svelte-59ntjv\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-59ntjv\"><path class=\"svelte-59ntjv\"></path></svg> <div class=\"pc-detail-identity svelte-59ntjv\"><input class=\"pc-detail-name svelte-59ntjv\" aria-label=\"Node name\"/> <!> <small class=\"svelte-59ntjv\"> </small></div> <!></header> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>", 1), us = /* @__PURE__ */ K("<p class=\"pc-detail-empty svelte-59ntjv\">Select a node to inspect its settings.</p>"), ds = /* @__PURE__ */ K("<section class=\"pc-node-details svelte-59ntjv\" aria-label=\"Node details\"><!></section>");
function fs(e, t) {
	Ue(t, !0);
	let n = (e, n = d) => {
		{
			let s = /* @__PURE__ */ F(() => U(a)[n().key]?.text ?? k(n())), c = /* @__PURE__ */ F(() => U(a)[n().key]?.error || U(o)[n().key] || ""), l = /* @__PURE__ */ F(() => !!t.view?.readOnly || !r().editControl), u = /* @__PURE__ */ F(() => !!U(a)[n().key]?.pending), d = /* @__PURE__ */ F(() => i() + "-" + n().key);
			yo(e, {
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
				ontext: (e) => ne(n(), e),
				onvalue: (e) => ie(n(), e),
				onnumber: (e) => ae(n(), e),
				onsave: () => re(n())
			});
		}
	}, r = ji(t, "actions", 19, () => ({})), i = ji(t, "idPrefix", 3, "pc-node-details"), a = /* @__PURE__ */ L(en({})), o = /* @__PURE__ */ L(en({})), s = "", c = "", l = "", u = 0, f = 0, p = 0, h = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ L(!1), _ = 0, v = 0, y = 0, b = /* @__PURE__ */ new Map(), x = /* @__PURE__ */ new Map(), S = /* @__PURE__ */ new Map(), C = (e) => Object.fromEntries(Object.entries(e).map(([e, t]) => [e, {
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
	Ni(() => {
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
	function j(e) {
		let t = (x.get(e) ?? 0) + 1;
		return x.set(e, t), t;
	}
	async function ee(e, n, r) {
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
	function te(e) {
		let n = e.files?.[0];
		e.value = "", n && t.view?.fileInput && !t.view.readOnly && r().loadFile && !U(a).fileInput?.pending && (R(a, {
			...U(a),
			fileInput: {
				text: "",
				error: "",
				pending: !1
			}
		}, !0), ee("fileInput", !1, (e) => r().loadFile(e, n)));
	}
	function ne(e, n) {
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
	function re(e) {
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
		ee(e.key, !1, (t) => r().editControl(t, e.key, i));
	}
	function ie(e, t) {
		r().editControl && ee(e.key, !1, (n) => r().editControl(n, e.key, t));
	}
	function ae(e, n) {
		if (!t.view || t.view.readOnly || !r().editControl) return;
		let i = Number(n.value);
		!n.value.trim() || !Number.isFinite(i) ? R(o, {
			...U(o),
			[e.key]: "Enter a finite number before saving."
		}, !0) : n.validity.valid ? ie(e, i) : R(o, {
			...U(o),
			[e.key]: "Enter a number within the allowed range and step."
		}, !0);
	}
	let oe = (e, t) => JSON.stringify([
		"helper-binding",
		e,
		t
	]), se = (e) => t.view?.helperBindings?.roles.find((t) => t.role === e), ce = () => !!t.view?.helperBindings?.editable && !t.view.readOnly && !!r().editHelperBinding, le = (e) => U(a)[oe(e, "model")] ? "override" : se(e)?.model.mode;
	function ue(e, t, n, i) {
		ce() && se(e) && ee(oe(e, t), !1, (a) => r().editHelperBinding(a, e, t, n, i));
	}
	function de(e, n) {
		if (!ce() || !se(e)) return;
		let r = oe(e, "model");
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
		let n = se(e);
		if (!ce() || !n?.model.allowedModes.some((e) => e.value === t)) return;
		let r = oe(e, "model");
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
		if (!ce() || le(e) !== "override") return;
		de(e, t);
		let n = oe(e, "model");
		!t.trim() || t.length > 256 ? R(o, {
			...U(o),
			[n]: "Enter a model identifier of 1–256 characters."
		}, !0) : ue(e, "model", "override", t);
	}
	function me(e, t, n) {
		he(e)?.allowedModes.some((e) => e.value === t) && r().editBinding && ee(e, !1, (i) => r().editBinding(i, e, t, n));
	}
	let he = (e) => e === "profileId" ? t.view?.model?.profile : t.view?.model?.model, ge = (e = t.view) => !!e?.model && (e.model.editable ?? !e.readOnly) && !!r().editBinding, _e = (e) => U(a)[e] ? "override" : he(e)?.mode, ve = (e) => U(a)[e]?.text ?? he(e)?.value ?? "", ye = () => {
		let e = t.view?.model?.profile;
		return U(a).profileId?.text ?? (e && Object.hasOwn(e, "effectiveValue") ? e.effectiveValue ?? "" : e?.value ?? "");
	}, be = () => t.view?.model?.profile.mode === "override" || !!t.view?.model?.profileDefaultModel;
	function xe(e, t) {
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
	function Se(e, t) {
		let n = he(e);
		if (!ge() || !n?.allowedModes.some((e) => e.value === t)) return;
		if (t === "override") {
			xe(e, ve(e));
			return;
		}
		h.delete(e);
		let r = { ...U(a) };
		delete r[e], R(a, r, !0), R(o, {
			...U(o),
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
					...U(a),
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
		let t = U(a)["modifier:" + e.id];
		if (t) try {
			return JSON.parse(t.text);
		} catch {}
		return e.settings;
	}
	let De = () => Object.fromEntries((t.view?.modifiers?.items ?? []).map((e) => {
		let t = U(a)["modifier:" + e.id];
		return [e.id, {
			settings: Ee(e),
			error: t?.error || U(o)["modifier:" + e.id] || "",
			pending: !!t?.pending,
			dirty: !!t
		}];
	}));
	function Oe(e) {
		if (!we() || U(g) || e.length > 16 || !r().editModifiers) return;
		let t = ++v;
		R(g, !0), ee("modifiers", !1, (t) => r().editModifiers(t, e)).finally(() => {
			t === v && R(g, !1);
		});
	}
	function M(e) {
		if (!we() || !t.view?.modifiers || t.view.modifiers.items.length >= 16) return;
		let n = t.view.modifiers.options.find((t) => t.type === e);
		if (!n) return;
		let r = Te(), i;
		do
			i = `mod-${e.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 28)}-${Date.now().toString(36)}-${(++_).toString(36)}`;
		while (r.some((e) => e.id === i));
		Oe([...r, {
			id: i,
			type: e,
			version: 1,
			enabled: !0,
			settings: JSON.parse(JSON.stringify(n.defaultSettings))
		}]);
	}
	function ke(e, n) {
		if (!we() || !t.view?.modifiers || !t.view.modifiers.options.some((t) => t.type === e)) return;
		let r = Te();
		r.some((t) => t.type === e) ? Oe(r.map((t) => t.type === e ? {
			...t,
			enabled: n
		} : t)) : n && M(e);
	}
	function N(e, n) {
		we() && t.view?.modifiers?.items.some((t) => t.id === e) && Oe(Te().map((t) => t.id === e ? {
			...t,
			enabled: n
		} : t));
	}
	function Ae(e) {
		we() && t.view?.modifiers?.items.some((t) => t.id === e) && Oe(Te().filter((t) => t.id !== e));
	}
	function je(e, t) {
		if (!we()) return;
		let n = Te(), r = n.findIndex((t) => t.id === e), i = r + t;
		r < 0 || i < 0 || i >= n.length || ([n[r], n[i]] = [n[i], n[r]], Oe(n));
	}
	function Ne(e, n, r) {
		if (!we()) return;
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
		if (!n || !U(a)[i] || U(a)[i].pending) return;
		let o = (b.get(i) ?? 0) + 1, s = y, c = n.type;
		b.set(i, o);
		let l = Ee(n), u = Te().map((t) => t.id === e ? {
			...t,
			settings: l
		} : t);
		ee(i, !1, async (n) => {
			let l = await r().editModifiers(n, u);
			if (l.ok && E && t.view && T(t.view) === T(n) && y === s && b.get(i) === o && t.view.modifiers?.items.some((t) => t.id === e && t.type === c)) {
				let e = { ...U(a) };
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
	}, Ie = (e) => e.some((e) => !!(U(a)[e.key]?.error || U(o)[e.key])), Le = () => t.view?.model ? `Model connection · ${t.view.model.issue ? "Binding needs attention" : t.view.model.effective || "Choose a connection"}` : "";
	function Re(e) {
		t.view && !t.view.boundary && r().present && ee("alias", !0, (n) => r().present(n, "alias", e === t.view?.canonicalTitle ? "" : e));
	}
	function ze() {
		return {
			label: U(a).boundary?.text ?? t.view?.boundary?.label ?? "",
			artifactKind: U(a).boundary?.artifactKind ?? t.view?.boundary?.kind ?? "",
			required: U(a).boundary?.required ?? t.view?.boundary?.required ?? !1
		};
	}
	function Be(e, n) {
		if (!t.view?.boundary || t.view.readOnly || !r().editInterface || e === "artifactKind" && !t.view.boundary.kinds.includes(String(n))) return;
		let i = {
			...ze(),
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
	function Ve() {
		if (!t.view?.boundary || t.view.readOnly || !r().editInterface || U(a).boundary?.pending) return;
		let e = t.view.boundary.id, n = ze();
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
		}, !0), ee("boundary", !1, async (o) => {
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
	var He = ds(), Ge = z(He), Ke = (e) => {
		var s = ls(), c = B(s);
		let l;
		var u = z(c), d = z(u);
		P(u);
		var f = V(u, 2), p = z(f);
		Z(p);
		var h = V(p, 2), _ = (e) => {
			var n = Io(), r = z(n);
			P(n), H(() => J(r, `Canonical type: ${t.view.canonicalTitle ?? ""}`)), q(e, n);
		};
		Y(h, (e) => {
			!t.view.boundary && (t.view.alias || t.view.title || t.view.canonicalTitle) !== t.view.canonicalTitle && e(_);
		});
		var v = V(h, 2), y = z(v, !0);
		P(v), P(f);
		var b = V(f, 2), x = (e) => {
			var n = zo(), i = V(z(n)), a = z(i), o = (e) => {
				var n = Lo();
				H(() => n.disabled = t.view.readOnly), G("click", n, () => {
					t.view && !t.view.readOnly && r().duplicate?.(D(t.view));
				}), q(e, n);
			};
			Y(a, (e) => {
				!t.view.boundary && r().duplicate && e(o);
			});
			var s = V(a, 2), c = (e) => {
				var n = Ro();
				H(() => n.disabled = t.view.readOnly), G("click", n, () => {
					t.view && !t.view.readOnly && r().remove?.(D(t.view));
				}), q(e, n);
			};
			Y(s, (e) => {
				r().remove && e(c);
			}), P(i), P(n), q(e, n);
		};
		Y(b, (e) => {
			(r().duplicate || r().remove) && e(x);
		}), P(c);
		var S = V(c, 2), C = (e) => {
			var n = Vo(), i = B(n), a = V(z(i)), s = z(a);
			s.value = s.__value = "pre";
			var c = V(s);
			c.value = c.__value = "post", P(a);
			var l;
			hi(a), P(i);
			var u = V(i), d = (e) => {
				var t = Bo(), n = z(t, !0);
				P(t), H(() => J(n, U(o).phase)), q(e, t);
			};
			Y(u, (e) => {
				U(o).phase && e(d);
			}), H(() => {
				a.disabled = t.view.readOnly || !r().editPhase, l !== (l = t.view.phase) && (a.value = (a.__value = t.view.phase) ?? "", mi(a, t.view.phase));
			}), G("change", a, (e) => {
				let t = e.currentTarget.value;
				ee("phase", !1, (e) => r().editPhase(e, t));
			}), q(e, n);
		};
		Y(S, (e) => {
			t.view.phaseEditable && e(C);
		});
		var w = V(S, 2), T = (e) => {
			var t = Ho(), n = z(t);
			P(t), H(() => n.disabled = !r().openFastConnections), G("click", n, () => r().openFastConnections?.()), q(e, t);
		};
		Y(w, (e) => {
			t.view.operation === "fast-decision" && e(T);
		});
		var E = V(w, 2), O = (e) => {
			var n = Go(), r = z(n), i = (e) => {
				q(e, Uo());
			};
			Y(r, (e) => {
				t.view.readOnly && e(i);
			});
			var a = V(r), o = (e) => {
				q(e, Wo());
			};
			Y(a, (e) => {
				t.view.enabled || e(o);
			}), P(n), q(e, n);
		};
		Y(E, (e) => {
			(t.view.readOnly || !t.view.enabled) && e(O);
		});
		var k = V(E, 2), A = (e) => {
			var t = Ko(), n = z(t, !0);
			P(t), H(() => J(n, U(o).alias)), q(e, t);
		};
		Y(k, (e) => {
			U(o).alias && e(A);
		});
		var j = V(k, 2), ne = (e) => {
			var n = Jo(), i = z(n), s = z(i);
			P(i);
			var c = V(i, 2), l = V(z(c));
			X(l, 21, () => t.view.boundary.kinds, Kr, (e, t) => {
				var n = qo(), r = z(n, !0);
				P(n);
				var i = {};
				H(() => {
					J(r, U(t)), i !== (i = U(t)) && (n.value = (n.__value = U(t)) ?? "");
				}), q(e, n);
			}), P(l);
			var u;
			hi(l), P(c);
			var d = V(c, 2), f = z(d);
			Z(f), Me(), P(d);
			var p = V(d, 2), m = z(p), h = z(m, !0);
			P(m), P(p);
			var g = V(p, 4), _ = (e) => {
				var t = Ko(), n = z(t, !0);
				P(t), H(() => J(n, U(a).boundary?.error || U(o).boundary)), q(e, t);
			};
			Y(g, (e) => {
				(U(a).boundary?.error || U(o).boundary) && e(_);
			}), P(n), H((e, n, i) => {
				J(s, `Subgraph ${t.view.boundary.direction ?? ""}`), l.disabled = t.view.readOnly || !r().editInterface, u !== (u = e) && (l.value = (l.__value = e) ?? "", mi(l, e)), Ci(f, n), f.disabled = t.view.readOnly || !r().editInterface, m.disabled = i, J(h, U(a).boundary?.pending ? "Validating…" : "Save port");
			}, [
				() => ze().artifactKind,
				() => ze().required,
				() => t.view.readOnly || !r().editInterface || !ze().label.trim() || !!U(a).boundary?.pending
			]), G("change", l, (e) => Be("artifactKind", e.currentTarget.value)), G("change", f, (e) => Be("required", e.currentTarget.checked)), G("click", m, () => Ve()), q(e, n);
		};
		Y(j, (e) => {
			t.view.boundary && e(ne);
		});
		var re = V(j, 2), ie = (e) => {
			var s = Qo(), c = B(s), l = z(c), u = (e) => {
				var n = Xo(), s = z(n), c = z(s, !0), l = V(c);
				P(s);
				var u = V(s, 2), d = z(u, !0);
				P(u);
				var f = V(u, 6), p = (e) => {
					q(e, Yo());
				};
				Y(f, (e) => {
					U(a).fileInput?.pending && e(p);
				});
				var m = V(f, 2), h = (e) => {
					var t = Ko(), n = z(t, !0);
					P(t), H(() => {
						Q(t, "id", i() + "-error-fileInput"), J(n, U(o).fileInput);
					}), q(e, t);
				};
				Y(m, (e) => {
					U(o).fileInput && e(h);
				}), P(n), H(() => {
					J(c, t.view.fileInput.loaded ? "Replace file" : "Choose file"), Q(l, "aria-label", t.view.fileInput.loaded ? "Replace file" : "Choose file"), l.disabled = t.view.readOnly || !r().loadFile || !!U(a).fileInput?.pending, Q(l, "aria-invalid", !!U(o).fileInput), Q(l, "aria-describedby", U(o).fileInput ? i() + "-error-fileInput" : void 0), J(d, t.view.fileInput.loaded ? "Loaded file: " + t.view.fileInput.fileName : "No file loaded.");
				}), G("change", l, (e) => te(e.currentTarget)), q(e, n);
			};
			Y(l, (e) => {
				t.view.fileInput && e(u);
			}), X(V(l, 2), 17, () => Fe().filter(([e]) => e === "Main"), ([e, t]) => e, (e, t) => {
				var r = /* @__PURE__ */ F(() => m(U(t), 2));
				let i = () => U(r)[1];
				var a = Ir();
				X(B(a), 17, i, (e) => e.key, (e, t) => {
					n(e, () => U(t));
				}), q(e, a);
			}), P(c), X(V(c, 2), 17, () => Fe().filter(([e]) => e !== "Main"), ([e, t]) => e, (e, t) => {
				var r = /* @__PURE__ */ F(() => m(U(t), 2));
				let i = () => U(r)[0], a = () => U(r)[1];
				var o = Zo(), s = z(o), c = z(s, !0);
				P(s), X(V(s, 2), 17, a, (e) => e.key, (e, t) => {
					n(e, () => U(t));
				}), P(o), H((e) => {
					Q(o, "data-control-group", i()), o.open = e, J(c, i());
				}, [() => Ie(a())]), q(e, o);
			}), q(e, s);
		};
		Y(re, (e) => {
			t.view.boundary || e(ie);
		});
		var ae = V(re, 2), se = (e) => {
			var n = rs(), r = V(z(n), 4);
			X(r, 17, () => t.view.helperBindings.roles, (e) => e.role, (e, t) => {
				var n = ts(), r = z(n), i = z(r, !0);
				P(r);
				var s = V(r, 2), c = V(z(s)), l = z(c);
				l.value = l.__value = "";
				var u = V(l), d = (e) => {
					var n = qo(), r = z(n);
					P(n);
					var i = {};
					H(() => {
						J(r, `Unavailable connection · ${U(t).profile.value ?? ""}`), i !== (i = U(t).profile.value) && (n.value = (n.__value = U(t).profile.value) ?? "");
					}), q(e, n);
				}, f = /* @__PURE__ */ F(() => U(t).profile.value && !(U(t).profile.options ?? []).some((e) => e.value === U(t).profile.value));
				Y(u, (e) => {
					U(f) && e(d);
				}), X(V(u), 17, () => U(t).profile.options ?? [], (e) => e.value, (e, t) => {
					var n = qo(), r = z(n, !0);
					P(n);
					var i = {};
					H(() => {
						J(r, U(t).label), i !== (i = U(t).value) && (n.value = (n.__value = U(t).value) ?? "");
					}), q(e, n);
				}), P(c);
				var p;
				hi(c), P(s);
				var m = V(s, 2), h = V(z(m));
				X(h, 21, () => U(t).model.allowedModes, (e) => e.value, (e, t) => {
					var n = qo(), r = z(n, !0);
					P(n);
					var i = {};
					H(() => {
						J(r, U(t).label), i !== (i = U(t).value) && (n.value = (n.__value = U(t).value) ?? "");
					}), q(e, n);
				}), P(h);
				var g;
				hi(h), P(m);
				var _ = V(m, 2), v = (e) => {
					var n = $o(), r = V(z(n));
					Z(r), P(n), H((e, n) => {
						Q(r, "aria-label", U(t).role + " model identifier"), Si(r, e), r.disabled = n;
					}, [() => U(a)[oe(U(t).role, "model")]?.text ?? U(t).model.value ?? "", () => !ce()]), G("input", r, (e) => de(U(t).role, e.currentTarget.value)), G("change", r, (e) => pe(U(t).role, e.currentTarget.value)), q(e, n);
				}, y = /* @__PURE__ */ F(() => le(U(t).role) === "override");
				Y(_, (e) => {
					U(y) && e(v);
				});
				var b = V(_, 2), x = z(b);
				P(b);
				var S = V(b), C = z(S, !0);
				P(S);
				var w = V(S), T = (e) => {
					var n = es(), r = z(n, !0);
					P(n), H(() => J(r, U(t).caveat)), q(e, n);
				};
				Y(w, (e) => {
					U(t).caveat && e(T);
				});
				var E = V(w, 2), D = (e) => {
					var n = Ko(), r = z(n, !0);
					P(n), H((e) => J(r, e), [() => U(o)[oe(U(t).role, "profileId")] || U(o)[oe(U(t).role, "model")]]), q(e, n);
				}, O = /* @__PURE__ */ F(() => U(o)[oe(U(t).role, "profileId")] || U(o)[oe(U(t).role, "model")]);
				Y(E, (e) => {
					U(O) && e(D);
				}), P(n), H((e, n, r) => {
					J(i, U(t).label), Q(c, "aria-label", U(t).role + " connection profile"), c.disabled = e, p !== (p = U(t).profile.value ?? "") && (c.value = (c.__value = U(t).profile.value ?? "") ?? "", mi(c, U(t).profile.value ?? "")), Q(h, "aria-label", U(t).role + " model mode"), h.disabled = n, g !== (g = r) && (h.value = (h.__value = r) ?? "", mi(h, r)), J(x, `Effective connection: ${U(t).effective ?? ""}`), J(C, U(t).source);
				}, [
					() => !ce(),
					() => !ce(),
					() => le(U(t).role)
				]), G("change", c, (e) => ue(U(t).role, "profileId", e.currentTarget.value ? "override" : "inherit", e.currentTarget.value || null)), G("change", h, (e) => fe(U(t).role, e.currentTarget.value)), q(e, n);
			});
			var i = V(r, 2), s = (e) => {
				var n = Ko(), r = z(n, !0);
				P(n), H(() => J(r, t.view.helperBindings.issue)), q(e, n);
			}, c = (e) => {
				q(e, ns());
			};
			Y(i, (e) => {
				t.view.helperBindings.issue ? e(s) : t.view.helperBindings.roles.length || e(c, 1);
			}), P(n), q(e, n);
		};
		Y(ae, (e) => {
			t.view.helperBindings && e(se);
		});
		var me = V(ae, 2), he = (e) => {
			var n = as(), i = z(n), s = z(i, !0);
			P(i);
			var c = V(i, 2), l = V(z(c)), u = z(l);
			u.value = u.__value = "";
			var d = V(u), f = (e) => {
				var t = qo(), n = z(t);
				P(t);
				var r = {};
				H((e, i) => {
					J(n, `Unavailable connection · ${e ?? ""}`), r !== (r = i) && (t.value = (t.__value = i) ?? "");
				}, [() => ye(), () => ye()]), q(e, t);
			}, p = /* @__PURE__ */ F(() => ye() && !(t.view.model.profile.options ?? []).some((e) => e.value === ye()));
			Y(d, (e) => {
				U(p) && e(f);
			}), X(V(d), 17, () => t.view.model.profile.options ?? [], (e) => e.value, (e, t) => {
				var n = qo(), r = z(n, !0);
				P(n);
				var i = {};
				H(() => {
					J(r, U(t).label), i !== (i = U(t).value) && (n.value = (n.__value = U(t).value) ?? "");
				}), q(e, n);
			}), P(l);
			var m;
			hi(l), P(c);
			var h = V(c, 2), g = V(z(h));
			X(g, 21, () => t.view.model.model.allowedModes, (e) => e.value, (e, n) => {
				var r = qo(), i = z(r, !0);
				P(r);
				var a = {};
				H((e) => {
					J(i, e), a !== (a = U(n).value) && (r.value = (r.__value = U(n).value) ?? "");
				}, [() => U(n).value === "inherit" && !t.view.readOnly ? be() || !t.view.model.model.effectiveValue ? "Use profile model" : "Existing role model" : U(n).label]), q(e, r);
			}), P(g);
			var _;
			hi(g), P(h);
			var v = V(h, 2), y = (e) => {
				var t = is(), n = V(z(t));
				Z(n), P(t), H((e, t) => {
					Si(n, e), n.disabled = t;
				}, [() => ve("model"), () => !ge()]), G("input", n, (e) => xe("model", e.currentTarget.value)), G("change", n, (e) => Ce("model", e.currentTarget.value)), q(e, t);
			}, b = /* @__PURE__ */ F(() => _e("model") === "override");
			Y(v, (e) => {
				U(b) && e(y);
			});
			var x = V(v, 2), S = V(z(x), 2), C = V(z(S));
			X(C, 21, () => t.view.model.profile.allowedModes, (e) => e.value, (e, t) => {
				var n = qo(), r = z(n, !0);
				P(n);
				var i = {};
				H(() => {
					J(r, U(t).label), i !== (i = U(t).value) && (n.value = (n.__value = U(t).value) ?? "");
				}), q(e, n);
			}), P(C);
			var w;
			hi(C), P(S);
			var T = V(S, 2), E = V(z(T));
			Z(E), P(T), P(x);
			var D = V(x, 2), O = (e) => {
				var n = es(), r = z(n);
				P(n), H(() => J(r, `Effective connection: ${t.view.model.effective ?? ""}`)), q(e, n);
			}, k = /* @__PURE__ */ F(() => !t.view.model.issue || t.view.model.effective.trim() !== t.view.model.issue.trim());
			Y(D, (e) => {
				U(k) && e(O);
			});
			var A = V(D), j = (e) => {
				var n = es(), r = z(n, !0);
				P(n), H(() => J(r, t.view.model.source)), q(e, n);
			};
			Y(A, (e) => {
				t.view.model.source && e(j);
			});
			var te = V(A, 2), ne = (e) => {
				var n = Ko(), r = z(n, !0);
				P(n), H(() => J(r, t.view.model.issue)), q(e, n);
			};
			Y(te, (e) => {
				t.view.model.issue && e(ne);
			});
			var re = V(te, 2), ie = (e) => {
				var t = Ko(), n = z(t, !0);
				P(t), H(() => J(n, U(o).modelRole || U(a).profileId?.error || U(o).profileId || U(a).model?.error || U(o).model)), q(e, t);
			};
			Y(re, (e) => {
				(U(o).modelRole || U(a).profileId?.error || U(o).profileId || U(a).model?.error || U(o).model) && e(ie);
			}), P(n), H((e, n, i, a, o, c, u) => {
				J(s, e), l.disabled = n, m !== (m = i) && (l.value = (l.__value = i) ?? "", mi(l, i)), g.disabled = a, _ !== (_ = o) && (g.value = (g.__value = o) ?? "", mi(g, o)), C.disabled = c, w !== (w = u) && (C.value = (C.__value = u) ?? "", mi(C, u)), Si(E, t.view.model.role), E.disabled = t.view.readOnly || !t.view.model.roleEditable || !r().editField;
			}, [
				() => Le(),
				() => !ge() || !t.view.model.profile.allowedModes.some((e) => e.value === "override"),
				() => ye(),
				() => !ge(),
				() => _e("model"),
				() => !ge(),
				() => _e("profileId")
			]), G("change", l, (e) => Ce("profileId", e.currentTarget.value)), G("change", g, (e) => Se("model", e.currentTarget.value)), G("change", C, (e) => Se("profileId", e.currentTarget.value)), G("change", E, (e) => {
				let n = e.currentTarget.value;
				t.view?.model?.roleEditable && r().editField && ee("modelRole", !1, (e) => r().editField(e, "modelRole", n));
			}), q(e, n);
		};
		Y(me, (e) => {
			t.view.model && e(he);
		});
		var Te = V(me, 2), Ee = (e) => {
			var n = ss();
			X(V(z(n)), 17, () => t.view.ports, (e) => e.direction + ":" + e.id, (e, t) => {
				var n = os(), r = z(n), i = V(r), a = z(i, !0);
				P(i), P(n), H(() => {
					J(r, `${U(t).direction === "input" ? "In" : "Out"} · ${U(t).label ?? ""}`), J(a, U(t).kind);
				}), q(e, n);
			}), P(n), q(e, n);
		};
		Y(Te, (e) => {
			t.view.ports.length && e(Ee);
		});
		var Oe = V(Te, 2), He = (e) => {
			var n = cs(), r = z(n, !0);
			P(n), H(() => J(r, t.view.status)), q(e, n);
		};
		Y(Oe, (e) => {
			t.view.status && e(He);
		});
		var Ue = V(Oe, 2);
		X(Ue, 17, () => t.view.issues ?? [], Kr, (e, t) => {
			var n = Ko(), r = z(n, !0);
			P(n), H(() => J(r, U(t))), q(e, n);
		});
		var We = V(Ue, 2), Ge = (e) => {
			{
				let n = /* @__PURE__ */ F(() => !we()), r = /* @__PURE__ */ F(De), a = /* @__PURE__ */ F(() => U(o).modifiers || "");
				Fo(e, {
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
					onquick: ke,
					onadd: M,
					onenable: N,
					onremove: Ae,
					onmove: je,
					ondraft: Ne,
					onsave: Pe
				});
			}
		};
		Y(We, (e) => {
			t.view.modifiers && e(Ge);
		}), H((e) => {
			l = pi(c, "", l, { "--pc-detail-family": t.view.familyColor ?? "var(--pc-accent)" }), Q(d, "d", t.view.iconPath), Q(p, "id", i() + "-name"), Q(p, "maxlength", t.view.boundary ? void 0 : 80), Si(p, e), p.disabled = t.view.boundary ? t.view.readOnly || !r().editInterface : !t.view.canPresent || !r().present, J(y, t.view.boundary ? "Subgraph " + t.view.boundary.direction : t.view.family + " · " + t.view.phase + " phase");
		}, [() => t.view.boundary ? ze().label : t.view.alias || t.view.title || t.view.canonicalTitle]), G("input", p, (e) => {
			t.view?.boundary && Be("label", e.currentTarget.value);
		}), G("change", p, (e) => {
			t.view?.boundary || Re(e.currentTarget.value);
		}), q(e, s);
	}, qe = (e) => {
		q(e, us());
	};
	Y(Ge, (e) => {
		t.view ? e(Ke) : e(qe, -1);
	}), P(He), q(e, He), We();
}
Tr([
	"input",
	"change",
	"click"
]);
//#endregion
//#region ui/CommentDetails.svelte
var ps = /* @__PURE__ */ K("<p class=\"pc-detail-meta svelte-17djc3u\">Read-only comment</p>"), ms = /* @__PURE__ */ K("<section class=\"pc-comment-details svelte-17djc3u\" aria-label=\"Comment details\"><h3 class=\"svelte-17djc3u\">Comment</h3> <!> <fieldset class=\"pc-detail-group svelte-17djc3u\"><legend class=\"svelte-17djc3u\">Comment</legend> <label class=\"svelte-17djc3u\">Title<input aria-label=\"Comment title\" class=\"svelte-17djc3u\"/></label> <label class=\"svelte-17djc3u\">Notes<textarea aria-label=\"Comment notes\" rows=\"5\" class=\"svelte-17djc3u\"></textarea></label> <label class=\"pc-comment-color-label svelte-17djc3u\">Color<input aria-label=\"Comment color\" type=\"color\" class=\"svelte-17djc3u\"/></label> <label class=\"pc-detail-check svelte-17djc3u\"><input aria-label=\"Move contents\" type=\"checkbox\" class=\"svelte-17djc3u\"/> Move contents</label> <small class=\"svelte-17djc3u\">Moves fully contained nodes when you drag the comment header.</small></fieldset> <div class=\"pc-comment-commands svelte-17djc3u\"><button type=\"button\" class=\"pc-btn svelte-17djc3u\">Fit to contents</button> <button type=\"button\" class=\"pc-btn pc-danger svelte-17djc3u\">Delete comment</button></div> <small class=\"svelte-17djc3u\">Deleting this comment keeps its contents.</small></section>");
function hs(e, t) {
	Ue(t, !0);
	let n = ji(t, "readOnly", 3, !1), r = /* @__PURE__ */ F(() => n() || t.comment.readOnly), i = (e) => e.stopPropagation();
	function a(e) {
		U(r) || t.onPatch(e);
	}
	function o(e) {
		U(r) || t.onCommand(e);
	}
	var s = ms(), c = V(z(s), 2), l = (e) => {
		q(e, ps());
	};
	Y(c, (e) => {
		U(r) && e(l);
	});
	var u = V(c, 2), d = V(z(u), 2), f = V(z(d));
	Z(f), P(d);
	var p = V(d, 2), m = V(z(p));
	at(m), P(p);
	var h = V(p, 2), g = V(z(h));
	Z(g), P(h);
	var _ = V(h, 2), v = z(_);
	Z(v), Me(), P(_), Me(2), P(u);
	var y = V(u, 2), b = z(y), x = V(b, 2);
	P(y), Me(2), P(s), H(() => {
		u.disabled = U(r), Si(f, t.comment.title), f.disabled = U(r), Si(m, t.comment.content), m.disabled = U(r), Si(g, t.comment.color), g.disabled = U(r), Ci(v, t.comment.moveContents), v.disabled = U(r), b.disabled = U(r), x.disabled = U(r);
	}), W("keydown", f, i, !0), G("change", f, (e) => a({ title: e.currentTarget.value })), W("keydown", m, i, !0), G("change", m, (e) => a({ content: e.currentTarget.value })), G("change", g, (e) => a({ color: e.currentTarget.value })), G("change", v, (e) => a({ moveContents: e.currentTarget.checked })), G("click", b, () => o("fit")), G("click", x, () => o("delete")), q(e, s), We();
}
Tr(["change", "click"]);
//#endregion
//#region ui/OutputPreview.svelte
var gs = /* @__PURE__ */ K("<option class=\"svelte-ee2ehy\"> </option>"), _s = /* @__PURE__ */ K("<label class=\"pc-preview-choice svelte-ee2ehy\"><span class=\"pc-preview-sr-only svelte-ee2ehy\">Preview output</span><select aria-label=\"Preview output\" class=\"svelte-ee2ehy\"><option disabled=\"\" class=\"svelte-ee2ehy\">Choose an output</option><!></select></label>"), vs = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-ee2ehy\">Collapse preview</button>"), ys = /* @__PURE__ */ K("<button type=\"button\" role=\"tab\" class=\"svelte-ee2ehy\"> </button>"), bs = /* @__PURE__ */ K("<div class=\"pc-preview-tabs svelte-ee2ehy\" role=\"tablist\" aria-label=\"Recorded artifacts\"></div>"), xs = /* @__PURE__ */ K("<p class=\"pc-preview-note svelte-ee2ehy\"> </p>"), Ss = /* @__PURE__ */ K("<pre class=\"svelte-ee2ehy\"> </pre>"), Cs = /* @__PURE__ */ K("<small class=\"pc-preview-note svelte-ee2ehy\"> </small>"), ws = /* @__PURE__ */ K("<div role=\"tabpanel\" tabindex=\"0\" class=\"svelte-ee2ehy\"><article class=\"svelte-ee2ehy\"><div class=\"pc-preview-section-heading svelte-ee2ehy\"><span class=\"svelte-ee2ehy\"> </span><small class=\"svelte-ee2ehy\"> </small></div> <!> <!></article></div>"), Ts = /* @__PURE__ */ K("<p class=\"pc-preview-empty svelte-ee2ehy\"> </p>"), Es = /* @__PURE__ */ K("<section aria-label=\"Accepted consequences\" class=\"pc-preview-settlement svelte-ee2ehy\"><strong class=\"svelte-ee2ehy\"> </strong> <!></section>"), Ds = /* @__PURE__ */ K("<p class=\"pc-preview-error svelte-ee2ehy\"> </p>"), Os = /* @__PURE__ */ K("<button type=\"button\" data-run-here=\"\" title=\"Runs the selected output's dependencies. Results are diagnostic previews.\" class=\"svelte-ee2ehy\"> </button>"), ks = /* @__PURE__ */ K("<button type=\"button\" data-preview-apply=\"\" class=\"svelte-ee2ehy\"> </button><button type=\"button\" class=\"svelte-ee2ehy\"> </button>", 1), As = /* @__PURE__ */ K("<header class=\"svelte-ee2ehy\"><h3 class=\"svelte-ee2ehy\"> </h3> <!> <div class=\"pc-preview-tools svelte-ee2ehy\"><button type=\"button\" class=\"svelte-ee2ehy\">Follow selection</button><button type=\"button\" class=\"svelte-ee2ehy\"> </button><!></div></header> <!> <div class=\"pc-preview-sections svelte-ee2ehy\"><!> <!> <!> <!> <!> <!> <!> <!></div> <footer class=\"svelte-ee2ehy\"><span class=\"pc-preview-status svelte-ee2ehy\"> </span> <span class=\"svelte-ee2ehy\"> </span> <!> <!></footer>", 1), js = /* @__PURE__ */ K("<p class=\"pc-preview-empty svelte-ee2ehy\">Select a node output to inspect its recorded result.</p>"), Ms = /* @__PURE__ */ K("<section class=\"pc-output-preview svelte-ee2ehy\" aria-label=\"Output preview\"><!></section>");
function Ns(e, t) {
	let n = Lr();
	Ue(t, !0);
	let r = ji(t, "actions", 19, () => ({})), i = /* @__PURE__ */ F(() => JSON.stringify([t.view?.sourceKey, t.view?.selectedKey])), a = /* @__PURE__ */ L(en({
		scope: "",
		id: null
	})), o = /* @__PURE__ */ F(() => (U(a).scope === U(i) ? t.view?.sections.find((e) => e.id === U(a).id) : null) ?? t.view?.sections[0] ?? null);
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
	}, p = /* @__PURE__ */ F(() => !!(t.view && U(l) && t.view.status !== "removed" && !t.view.busy && t.view.runHere?.enabled && r().runHere)), m = /* @__PURE__ */ F(() => !!(t.view && U(l) && t.view.review?.mode === "root" && t.view.review.selectedRootTerminal && "kind" in U(l).target && U(l).target.address.instancePath.length === 0 && d(U(l).target) === d(t.view.review.selector.terminal))), h = /* @__PURE__ */ F(() => !!(t.view && t.view.status === "current" && !t.view.busy && U(m) && t.view.review?.fresh && t.view.review.canApply && r().apply)), g = /* @__PURE__ */ F(() => !!(t.view && !t.view.busy && U(m) && r().reject));
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
	var y = Ms(), b = z(y), x = (e) => {
		var d = As(), m = B(d), y = z(m), b = z(y, !0);
		P(y);
		var x = V(y, 2), S = (e) => {
			var n = _s(), i = V(z(n)), a = z(i);
			a.value = a.__value = "", X(V(a), 17, () => t.view.choices, (e) => e.key, (e, t) => {
				var n = gs(), r = z(n);
				P(n);
				var i = {};
				H(() => {
					J(r, `${U(t).label ?? ""} · ${U(t).kind ?? ""}`), i !== (i = U(t).key) && (n.value = (n.__value = U(t).key) ?? "");
				}), q(e, n);
			}), P(i);
			var o;
			hi(i), P(n), H(() => {
				i.disabled = !r().select, o !== (o = t.view.selectedKey ?? "") && (i.value = (i.__value = t.view.selectedKey ?? "") ?? "", mi(i, t.view.selectedKey ?? ""));
			}), G("change", i, (e) => _(e.currentTarget.value)), q(e, n);
		};
		Y(x, (e) => {
			t.view.choices.length && e(S);
		});
		var C = V(x, 2), w = z(C), T = V(w), E = z(T, !0);
		P(T);
		var D = V(T), O = (e) => {
			var n = vs();
			G("click", n, function(...e) {
				t.collapse?.apply(this, e);
			}), q(e, n);
		};
		Y(D, (e) => {
			t.collapse && e(O);
		}), P(C), P(m);
		var k = V(m, 2), A = (e) => {
			var r = bs();
			X(r, 23, () => t.view.sections, (e) => e.id, (e, t, r) => {
				var l = ys(), u = z(l, !0);
				P(l), H((e) => {
					Q(l, "id", e), Q(l, "aria-selected", U(o)?.id === U(t).id), Q(l, "aria-controls", n + "-panel"), Q(l, "tabindex", U(o)?.id === U(t).id ? 0 : -1), J(u, U(t).label);
				}, [() => s(U(t).id)]), G("click", l, () => {
					R(a, {
						scope: U(i),
						id: U(t).id
					}, !0);
				}), W("keydown", l, (e) => c(e, U(r)), !0), q(e, l);
			}), P(r), q(e, r);
		};
		Y(k, (e) => {
			t.view.sections.length && e(A);
		});
		var j = V(k, 2), ee = z(j), te = (e) => {
			let t = /* @__PURE__ */ F(() => U(o));
			var r = ws(), i = z(r), a = z(i), c = z(a), l = z(c, !0);
			P(c);
			var u = V(c), d = z(u, !0);
			P(u), P(a);
			var f = V(a, 2), p = (e) => {
				var n = xs(), r = z(n, !0);
				P(n), H(() => J(r, U(t).text)), q(e, n);
			}, m = (e) => {
				var n = Ss(), r = z(n, !0);
				P(n), H(() => J(r, U(t).text)), q(e, n);
			};
			Y(f, (e) => {
				U(t).format === "omitted" ? e(p) : e(m, -1);
			});
			var h = V(f, 2), g = (e) => {
				var n = Cs(), r = z(n);
				P(n), H(() => J(r, `Truncated diagnostic${U(t).format === "json-prefix-text" ? " · JSON prefix shown as text" : ""}`)), q(e, n);
			};
			Y(h, (e) => {
				U(t).truncated && e(g);
			}), P(i), P(r), H((e) => {
				Q(r, "id", n + "-panel"), Q(r, "aria-labelledby", e), Q(i, "data-artifact-kind", U(t).kind), J(l, U(t).label), J(d, U(t).kind);
			}, [() => s(U(t).id)]), W("keydown", r, (e) => e.stopPropagation(), !0), W("paste", r, (e) => e.stopPropagation(), !0), q(e, r);
		}, ne = (e) => {
			var n = Ts(), r = z(n, !0);
			P(n), H(() => J(r, t.view.status === "not-run" ? "Send an assigned workflow or use Run to here to inspect an output." : "No recorded artifact is available for this output.")), q(e, n);
		};
		Y(ee, (e) => {
			U(o) ? e(te) : e(ne, -1);
		});
		var re = V(ee, 2), ie = (e) => {
			var n = Es(), r = z(n), i = z(r);
			P(r), X(V(r, 2), 17, () => t.view.settlement.receipts, (e) => e.intentId + ":" + e.targetId, (e, t) => {
				var n = xs(), r = z(n);
				P(n), H(() => J(r, `${U(t).targetId ?? ""} · ${U(t).status ?? ""}${U(t).error ? " · " + U(t).error.message : ""}`)), q(e, n);
			}), P(n), H(() => J(i, `Accepted consequences · ${t.view.settlement.status === "settled" ? "Saved" : t.view.settlement.status === "partial" ? "Some targets failed" : "Save confirmation needed"}`)), q(e, n);
		};
		Y(re, (e) => {
			t.view.settlement && e(ie);
		});
		var ae = V(re, 2), oe = (e) => {
			var n = xs(), r = z(n, !0);
			P(n), H(() => J(r, t.view.statusDetail)), q(e, n);
		};
		Y(ae, (e) => {
			t.view.statusDetail && e(oe);
		});
		var se = V(ae, 2);
		X(se, 17, () => t.view.sections.filter((e) => e.id !== U(o)?.id && (e.format === "omitted" || e.truncated)), (e) => e.id, (e, t) => {
			var n = xs(), r = z(n);
			P(n), H(() => J(r, `${U(t).label ?? ""}: ${(U(t).format === "omitted" ? U(t).text : "Truncated diagnostic" + (U(t).format === "json-prefix-text" ? " · JSON prefix shown as text" : "")) ?? ""}`)), q(e, n);
		});
		var ce = V(se, 2), le = (e) => {
			var n = xs(), r = z(n, !0);
			P(n), H(() => J(r, t.view.runHere.issue)), q(e, n);
		};
		Y(ce, (e) => {
			t.view.runHere?.issue && e(le);
		});
		var ue = V(ce, 2);
		X(ue, 17, () => t.view.issues, Kr, (e, t) => {
			var n = Ds(), r = z(n, !0);
			P(n), H(() => J(r, U(t))), q(e, n);
		});
		var de = V(ue, 2), fe = (e) => {
			var n = Ds(), r = z(n, !0);
			P(n), H(() => J(r, t.view.review.issue)), q(e, n);
		};
		Y(de, (e) => {
			t.view.review?.issue && e(fe);
		});
		var pe = V(de, 2), me = (e) => {
			var n = Cs(), r = z(n, !0);
			P(n), H(() => J(r, t.view.review.persistOnly ? "Retry keeps the accepted reply and retries failed targets. No model request is made." : "Apply rechecks the source, connection and final evidence. Recorded preview text may be truncated.")), q(e, n);
		};
		Y(pe, (e) => {
			t.view.review && e(me);
		}), P(j);
		var he = V(j, 2), ge = z(he), _e = z(ge, !0);
		P(ge);
		var ve = V(ge, 2), ye = z(ve, !0);
		P(ve);
		var be = V(ve, 2), xe = (e) => {
			var n = Os(), i = z(n);
			P(n), H(() => {
				n.disabled = !U(p), J(i, `Run to here · maximum ${t.view.runHere.callBound ?? ""} ${t.view.runHere.callBound === 1 ? "request" : "requests"}`);
			}), G("click", n, () => {
				t.view && U(l) && U(p) && r().runHere?.(t.view.sourceKey, f(U(l).target));
			}), q(e, n);
		};
		Y(be, (e) => {
			t.view.runHere && e(xe);
		});
		var Se = V(be, 2), Ce = (e) => {
			var n = ks(), i = B(n), a = z(i, !0);
			P(i);
			var o = V(i), s = z(o, !0);
			P(o), H(() => {
				i.disabled = !U(h), J(a, t.view.review.persistOnly ? "Retry failed persistence" : "Apply reviewed candidate"), o.disabled = !U(g), J(s, t.view.review.persistOnly ? "Close persistence review" : "Reject candidate");
			}), G("click", i, () => {
				t.view?.review && U(h) && r().apply?.(v(t.view.review.selector));
			}), G("click", o, () => {
				t.view?.review && U(g) && r().reject?.(v(t.view.review.selector));
			}), q(e, n);
		};
		Y(Se, (e) => {
			t.view.review && e(Ce);
		}), P(he), H((e) => {
			J(b, U(l)?.label ?? t.view.title), Q(w, "aria-pressed", t.view.followSelection), w.disabled = !r().follow, Q(T, "aria-pressed", t.view.pinned), T.disabled = t.view.pinned ? !r().follow : !U(l) || !r().pin, J(E, t.view.pinned ? "Unpin preview" : "Pin preview"), Q(ge, "data-status", t.view.status), J(_e, e), J(ye, t.view.pinned ? "Pinned preview" : t.view.followSelection ? "Following selection" : "Selection not followed");
		}, [() => u(t.view.status)]), G("click", w, () => r().follow?.()), G("click", T, () => {
			t.view?.pinned ? r().follow?.() : t.view && U(l) && r().pin?.(t.view.sourceKey, f(U(l).target));
		}), q(e, d);
	}, S = (e) => {
		q(e, js());
	};
	Y(b, (e) => {
		t.view ? e(x) : e(S, -1);
	}), P(y), q(e, y), We();
}
Tr(["change", "click"]);
//#endregion
//#region ui/RunDetails.svelte
var Ps = /* @__PURE__ */ K("<p class=\"pc-run-error svelte-f9s2fm\"> </p>"), Fs = /* @__PURE__ */ K("<p class=\"pc-run-empty svelte-f9s2fm\">No execution plan has been recorded.</p>"), Is = /* @__PURE__ */ K("<span aria-hidden=\"true\" class=\"svelte-f9s2fm\">▱</span>"), Ls = /* @__PURE__ */ K("<small class=\"svelte-f9s2fm\"> </small>"), Rs = /* @__PURE__ */ K("<details class=\"svelte-f9s2fm\"><summary class=\"svelte-f9s2fm\">Reported usage</summary><div class=\"pc-run-usage svelte-f9s2fm\"><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small></div></details>"), zs = /* @__PURE__ */ K("<li class=\"svelte-f9s2fm\"><div class=\"pc-run-row-heading svelte-f9s2fm\"><button type=\"button\" class=\"svelte-f9s2fm\"><!> </button><span class=\"pc-run-status svelte-f9s2fm\"> </span></div> <!> <div class=\"pc-run-row-meta svelte-f9s2fm\"><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small></div> <!> <!></li>"), Bs = /* @__PURE__ */ K("<header class=\"svelte-f9s2fm\"><h3 class=\"svelte-f9s2fm\">Run details</h3><span class=\"pc-run-status svelte-f9s2fm\"> </span></header> <div class=\"pc-run-summary svelte-f9s2fm\"><p class=\"svelte-f9s2fm\"> </p><p class=\"svelte-f9s2fm\"> </p><p class=\"svelte-f9s2fm\"> </p></div> <!> <!> <ol class=\"pc-run-rows svelte-f9s2fm\"></ol>", 1), Vs = /* @__PURE__ */ K("<p class=\"pc-run-empty svelte-f9s2fm\">Send with an assigned workflow or use Run to here to inspect its processing stages.</p>"), Hs = /* @__PURE__ */ K("<section class=\"pc-run-details svelte-f9s2fm\" aria-label=\"Run details\"><!></section>");
function Us(e, t) {
	Ue(t, !0);
	let n = ji(t, "actions", 19, () => ({})), r = (e) => e === "not-run" ? "Not run" : e === "empty" ? "Ready" : e.charAt(0).toUpperCase() + e.slice(1), i = (e) => e !== null && Number.isFinite(e) && e >= 0 ? (e / 1e3).toFixed(2) + "s" : "Unknown", a = (e) => e != null && Number.isFinite(e) && e >= 0 ? String(e) : "Unknown";
	var o = Hs(), s = z(o), c = (e) => {
		var o = Bs(), s = B(o), c = V(z(s)), l = z(c, !0);
		P(c), P(s);
		var u = V(s, 2), d = z(u), f = z(d);
		P(d);
		var p = V(d), m = z(p);
		P(p);
		var h = V(p), g = z(h);
		P(h), P(u);
		var _ = V(u, 2), v = (e) => {
			var n = Ps(), r = z(n, !0);
			P(n), H(() => J(r, t.view.issue)), q(e, n);
		};
		Y(_, (e) => {
			t.view.issue && e(v);
		});
		var y = V(_, 2), b = (e) => {
			q(e, Fs());
		};
		Y(y, (e) => {
			t.view.rows.length || e(b);
		});
		var x = V(y, 2);
		X(x, 21, () => t.view.rows, (e) => e.key, (e, o) => {
			var s = zs();
			let c;
			var l = z(s), u = z(l), d = z(u), f = (e) => {
				q(e, Is());
			};
			Y(d, (e) => {
				U(o).kind === "instance" && e(f);
			});
			var p = V(d, 1, !0);
			P(u);
			var m = V(u), h = z(m, !0);
			P(m), P(l);
			var g = V(l, 2), _ = (e) => {
				var t = Ls(), n = z(t, !0);
				P(t), H((e) => J(n, e), [() => r(U(o).subphase)]), q(e, t);
			};
			Y(g, (e) => {
				U(o).subphase && e(_);
			});
			var v = V(g, 2), y = z(v), b = z(y);
			P(y);
			var x = V(y), S = z(x);
			P(x), P(v);
			var C = V(v, 2), w = (e) => {
				var t = Ps(), n = z(t, !0);
				P(t), H(() => J(n, U(o).issue)), q(e, t);
			};
			Y(C, (e) => {
				U(o).issue && e(w);
			});
			var T = V(C, 2), E = (e) => {
				var t = Rs(), n = V(z(t)), r = z(n), i = z(r);
				P(r);
				var s = V(r), c = z(s);
				P(s);
				var l = V(s), u = z(l);
				P(l);
				var d = V(l), f = z(d);
				P(d), P(n), P(t), H((e, t, n) => {
					J(i, `Input tokens: ${e ?? ""}`), J(c, `Output tokens: ${t ?? ""}`), J(u, `Total tokens: ${n ?? ""}`), J(f, `Cost: ${U(o).usage?.cost ?? "Unknown" ?? ""}`);
				}, [
					() => a(U(o).usage?.inputTokens),
					() => a(U(o).usage?.outputTokens),
					() => a(U(o).usage?.totalTokens)
				]), q(e, t);
			};
			Y(T, (e) => {
				U(o).kind === "primitive" && e(E);
			}), P(s), H((e, t, r) => {
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
		}), P(x), H((e, n) => {
			Q(c, "data-status", t.view.status), J(l, e), J(f, `${t.view.completedCount ?? ""} of ${t.view.executableCount ?? ""} stages complete`), J(m, `${t.view.actualCalls ?? ""} of ${t.view.callBound ?? ""} requests`), J(g, `Elapsed: ${n ?? ""}`);
		}, [() => r(t.view.status), () => i(t.view.elapsedMs)]), q(e, o);
	}, l = (e) => {
		q(e, Vs());
	};
	Y(s, (e) => {
		t.view ? e(c) : e(l, -1);
	}), P(o), q(e, o), We();
}
Tr(["click"]);
//#endregion
//#region ui/RunMeter.svelte
var Ws = /* @__PURE__ */ K("<span class=\"pc-run-meter-elapsed svelte-1tkcp3\" data-run-elapsed=\"\"> </span>"), Gs = /* @__PURE__ */ K("<span class=\"pc-run-pixel svelte-1tkcp3\" data-run-pixel=\"\"></span>"), Ks = /* @__PURE__ */ K("<button class=\"pc-run-meter svelte-1tkcp3\"><span class=\"pc-run-meter-label svelte-1tkcp3\"> </span> <!> <span class=\"pc-run-meter-pixels svelte-1tkcp3\" aria-hidden=\"true\"></span></button>");
function qs(e, t) {
	Ue(t, !0);
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
	var o = Ir(), s = B(o), c = (e) => {
		var r = Ks(), o = z(r), s = z(o, !0);
		P(o);
		var c = V(o, 2), l = (e) => {
			var n = Ws(), r = z(n);
			P(n), H((e) => J(r, `${e ?? ""}s`), [() => (t.view.elapsedMs / 1e3).toFixed(1)]), q(e, n);
		}, u = /* @__PURE__ */ F(() => t.view.elapsedMs !== null && Number.isFinite(t.view.elapsedMs) && t.view.elapsedMs >= 0);
		Y(c, (e) => {
			U(u) && e(l);
		});
		var d = V(c, 2);
		X(d, 21, () => U(i), (e) => e.key, (e, t) => {
			var n = Gs();
			H(() => {
				Q(n, "data-status", U(t).status), Q(n, "title", U(t).title);
			}), q(e, n);
		}), P(d), P(r), H((e) => {
			Q(r, "aria-label", U(a)), Q(r, "title", U(a)), r.disabled = !t.open, J(s, e);
		}, [() => n(t.view.status)]), G("click", r, () => t.open?.()), q(e, r);
	};
	Y(s, (e) => {
		t.view && e(c);
	}), q(e, o), We();
}
Tr(["click"]);
//#endregion
//#region ui/PortalManager.svelte
var Js = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-mnv790\">Close</button>"), Ys = /* @__PURE__ */ K("<option class=\"svelte-mnv790\"> </option>"), Xs = /* @__PURE__ */ K("<label class=\"svelte-mnv790\">Portal name<input aria-label=\"Portal name\" class=\"svelte-mnv790\"/></label> <p class=\"pc-note svelte-mnv790\"> </p> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-rename=\"\" class=\"svelte-mnv790\">Rename</button></div>", 1), Zs = /* @__PURE__ */ K("<p class=\"pc-note svelte-mnv790\">Select a portal or create one from an output.</p>"), Qs = /* @__PURE__ */ K("<button type=\"button\" data-portal-jump-source=\"\" class=\"svelte-mnv790\">Jump to source</button>"), $s = /* @__PURE__ */ K("<label class=\"pc-check svelte-mnv790\"><input type=\"checkbox\" aria-label=\"Replace existing connection\" class=\"svelte-mnv790\"/>Replace existing connection</label>"), ec = /* @__PURE__ */ K("<button type=\"button\" data-portal-jump-consumer=\"\" class=\"svelte-mnv790\">Jump</button>"), tc = /* @__PURE__ */ K("<div class=\"pc-consumer svelte-mnv790\"><span class=\"svelte-mnv790\"> </span><div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-restore=\"\" class=\"svelte-mnv790\">Restore wire</button> <!></div></div>"), nc = /* @__PURE__ */ K("<p class=\"pc-note svelte-mnv790\">No consumers.</p>"), rc = /* @__PURE__ */ K("<label class=\"svelte-mnv790\">Existing consumers<select aria-label=\"Existing consumers\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Choose before deleting…</option><option class=\"svelte-mnv790\">Restore visible wires</option><option class=\"svelte-mnv790\">Disconnect consumers</option></select></label>"), ic = /* @__PURE__ */ K("<details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Consumers</summary> <label class=\"svelte-mnv790\">Compatible receiver<select aria-label=\"Compatible receiver\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select input…</option><!></select></label> <!> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-connect=\"\" class=\"svelte-mnv790\">Connect receiver</button></div> <!> <!> <!> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-delete=\"\" class=\"svelte-mnv790\">Delete portal</button></div></details>"), ac = /* @__PURE__ */ K("<details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Convert to portal</summary><p class=\"pc-note svelte-mnv790\"> </p><div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-convert=\"\" class=\"svelte-mnv790\"> </button></div></details>"), oc = /* @__PURE__ */ K("<p class=\"pc-error svelte-mnv790\"> </p>"), sc = /* @__PURE__ */ K("<p class=\"pc-error svelte-mnv790\" role=\"alert\"> </p>"), cc = /* @__PURE__ */ K("<p class=\"pc-note svelte-mnv790\" role=\"status\">Preparing change…</p>"), lc = /* @__PURE__ */ K("<p class=\"pc-note svelte-mnv790\"> </p> <label class=\"svelte-mnv790\">Portal<select aria-label=\"Selected portal\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select portal…</option><!></select></label> <!> <details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Source</summary> <label class=\"svelte-mnv790\">Output<select aria-label=\"Portal source\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select output…</option><!></select></label> <label class=\"svelte-mnv790\">New portal name<input aria-label=\"New portal name\" class=\"svelte-mnv790\"/></label> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-create=\"\" class=\"svelte-mnv790\">Create portal</button> <button type=\"button\" data-portal-retarget=\"\" class=\"svelte-mnv790\">Retarget</button> <!></div></details> <!> <!> <!> <!> <!>", 1), uc = /* @__PURE__ */ K("<p class=\"pc-note svelte-mnv790\">Open a graph to manage its portals.</p>"), dc = /* @__PURE__ */ K("<section class=\"pc-manager svelte-mnv790\" aria-label=\"Manage portals\"><header class=\"svelte-mnv790\"><h2 class=\"svelte-mnv790\">Manage portals</h2><!></header> <!></section>");
function fc(e, t) {
	Ue(t, !0);
	let n = ji(t, "actions", 19, () => ({})), r = /* @__PURE__ */ L(""), i = /* @__PURE__ */ L(""), a = /* @__PURE__ */ L(""), o = /* @__PURE__ */ L(""), s = /* @__PURE__ */ L(""), c = /* @__PURE__ */ L(!1), l = /* @__PURE__ */ L(""), u = /* @__PURE__ */ L(""), d = "", f = 0, p = !0, m = (e) => JSON.stringify(e.kind === "graph" ? [
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
	]), h = /* @__PURE__ */ F(() => t.view?.publishers.find((e) => e.id === t.view.selectedPortalId)), g = /* @__PURE__ */ F(() => !!t.view && !!U(h) && t.view.capabilities.rename && (t.view.renameMode === "presentation" ? t.view.canPresent : t.view.scope.kind === "graph" && !t.view.readOnly) && !!n().rename), _ = /* @__PURE__ */ F(() => t.view?.sources.find((e) => e.key === U(a) && e.direction === "output")), v = /* @__PURE__ */ F(() => t.view?.receivers.find((e) => e.key === U(o) && e.direction === "input" && e.kind === U(h)?.kind)), y = /* @__PURE__ */ F(() => !!U(h) && !!U(v) && (!U(v).occupied || U(c)) && C("connect") && !!n().connect), b = /* @__PURE__ */ F(() => !!U(h) && C("remove") && !!n().deletePublisher && (!t.view?.consumers.length || U(s) === "restore" || U(s) === "disconnect"));
	Sn(() => {
		let e = t.view ? JSON.stringify([
			t.view.managerKey,
			t.view.revision,
			m(t.view.scope),
			t.view.selectedPortalId,
			t.view.renameMode
		]) : "";
		d !== e && (d = e, R(r, U(h)?.label ?? "", !0), R(i, ""), R(a, t.view?.sources.find((e) => e.nodeId === U(h)?.source.nodeId && e.portId === U(h)?.source.portId)?.key ?? "", !0), R(o, ""), R(s, ""), R(c, !1), R(l, ""), R(u, ""), f++);
	}), Ni(() => {
		p = !1, f++;
	});
	let x = (e) => ({
		managerKey: e.managerKey,
		revision: e.revision,
		scope: ze(e.scope)
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
	var E = dc(), D = z(E), O = V(z(D)), k = (e) => {
		var t = Js();
		G("click", t, () => n().close?.()), q(e, t);
	};
	Y(O, (e) => {
		n().close && e(k);
	}), P(D);
	var A = V(D, 2), j = (e) => {
		var d = lc(), f = B(d), p = z(f);
		P(f);
		var m = V(f, 2), E = V(z(m)), D = z(E);
		D.value = D.__value = "", X(V(D), 17, () => t.view.publishers, (e) => e.id, (e, t) => {
			var n = Ys(), r = z(n);
			P(n);
			var i = {};
			H(() => {
				J(r, `${U(t).label ?? ""} · ${U(t).kind ?? ""}`), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
			}), q(e, n);
		}), P(E);
		var O;
		hi(E), P(m);
		var k = V(m, 2), A = (e) => {
			var i = Xs(), a = B(i), o = V(z(a));
			Z(o), P(a);
			var s = V(a, 2), c = z(s);
			P(s);
			var l = V(s, 2), d = z(l);
			P(l), H(() => {
				Si(o, U(r)), o.disabled = !U(g), J(c, `${t.view.renameMode === "presentation" ? "Local workspace label · not exported" : "Authored portal label"} · ${U(h).kind ?? ""}`), d.disabled = !U(g) || !!U(u);
			}), G("input", o, (e) => {
				R(r, e.currentTarget.value, !0), w();
			}), G("click", d, () => {
				let e = U(h)?.id, i = t.view?.renameMode, a = U(r);
				e && i && n().rename && T("rename", U(g), (t) => n().rename(t, e, a, i));
			}), q(e, i);
		}, j = (e) => {
			q(e, Zs());
		};
		Y(k, (e) => {
			U(h) ? e(A) : e(j, -1);
		});
		var ee = V(k, 2), te = V(z(ee), 2), ne = V(z(te)), re = z(ne);
		re.value = re.__value = "", X(V(re), 17, () => t.view.sources, (e) => e.key, (e, t) => {
			var n = Ys(), r = z(n);
			P(n);
			var i = {};
			H(() => {
				J(r, `${U(t).label ?? ""} · ${U(t).kind ?? ""}`), i !== (i = U(t).key) && (n.value = (n.__value = U(t).key) ?? "");
			}), q(e, n);
		}), P(ne);
		var ie;
		hi(ne), P(te);
		var ae = V(te, 2), oe = V(z(ae));
		Z(oe), P(ae);
		var se = V(ae, 2), ce = z(se), le = V(ce, 2), ue = V(le, 2), de = (e) => {
			var r = Qs();
			G("click", r, () => {
				t.view && U(h) && n().jumpSource?.(x(t.view), S(U(h).source));
			}), q(e, r);
		};
		Y(ue, (e) => {
			U(h) && n().jumpSource && e(de);
		}), P(se), P(ee);
		var fe = V(ee, 2), pe = (e) => {
			var r = ic(), i = V(z(r), 2), a = V(z(i)), l = z(a);
			l.value = l.__value = "", X(V(l), 17, () => t.view.receivers, (e) => e.key, (e, t) => {
				var n = Ys(), r = z(n);
				P(n);
				var i = {};
				H(() => {
					J(r, `${U(t).label ?? ""}${U(t).occupied ? " · Connected" : ""}`), i !== (i = U(t).key) && (n.value = (n.__value = U(t).key) ?? "");
				}), q(e, n);
			}), P(a);
			var d;
			hi(a), P(i);
			var f = V(i, 2), p = (e) => {
				var t = $s(), n = z(t);
				Z(n), Me(), P(t), H((e) => {
					Ci(n, U(c)), n.disabled = e;
				}, [() => !C("connect")]), G("change", n, (e) => {
					R(c, e.currentTarget.checked, !0), w();
				}), q(e, t);
			};
			Y(f, (e) => {
				U(v)?.occupied && e(p);
			});
			var m = V(f, 2), g = z(m);
			P(m);
			var _ = V(m, 2);
			X(_, 17, () => t.view.consumers, (e) => e.edgeId, (e, r) => {
				var i = tc(), a = z(i), o = z(a, !0);
				P(a);
				var s = V(a), c = z(s), l = V(c, 2), d = (e) => {
					var i = ec();
					G("click", i, () => {
						let e = t.view?.consumers.find((e) => e.edgeId === U(r).edgeId);
						t.view && e && n().jumpConsumer?.(x(t.view), e.edgeId, S(e.to));
					}), q(e, i);
				};
				Y(l, (e) => {
					n().jumpConsumer && e(d);
				}), P(s), P(i), H((e) => {
					J(o, U(r).label), c.disabled = e;
				}, [() => !C("restore") || !n().restoreWire || !!U(u)]), G("click", c, () => {
					let e = t.view?.consumers.find((e) => e.edgeId === U(r).edgeId);
					e && n().restoreWire && T("restore", C("restore"), (t) => n().restoreWire(t, e.edgeId));
				}), q(e, i);
			});
			var E = V(_, 2), D = (e) => {
				q(e, nc());
			};
			Y(E, (e) => {
				t.view.consumers.length || e(D);
			});
			var O = V(E, 2), k = (e) => {
				var t = rc(), n = V(z(t)), r = z(n);
				r.value = r.__value = "";
				var i = V(r);
				i.value = i.__value = "restore";
				var a = V(i);
				a.value = a.__value = "disconnect", P(n);
				var o;
				hi(n), P(t), H((e) => {
					n.disabled = e, o !== (o = U(s)) && (n.value = (n.__value = U(s)) ?? "", mi(n, U(s)));
				}, [() => !C("remove")]), G("change", n, (e) => {
					R(s, e.currentTarget.value, !0), w();
				}), q(e, t);
			};
			Y(O, (e) => {
				t.view.consumers.length && e(k);
			});
			var A = V(O, 2), j = z(A);
			P(A), P(r), H((e) => {
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
		Y(fe, (e) => {
			U(h) && e(pe);
		});
		var me = V(fe, 2), he = (e) => {
			var r = ac(), i = V(z(r)), a = z(i, !0);
			P(i);
			var o = V(i), s = z(o), c = z(s);
			P(s), P(o), P(r), H((e) => {
				J(a, t.view.conversion.label), s.disabled = e, J(c, `Convert ${t.view.conversion.kind === "wire" ? "wire" : "output"}`);
			}, [() => !C("convert") || !!U(u) || (t.view.conversion.kind === "wire" ? !n().convertWire : !n().convertOutput)]), G("click", s, () => {
				let e = t.view?.conversion;
				e?.kind === "wire" && n().convertWire ? T("convert", C("convert"), (t) => n().convertWire(t, e.edgeId)) : e?.kind === "output" && n().convertOutput && T("convert", C("convert"), (t) => n().convertOutput(t, S(e.endpoint)));
			}), q(e, r);
		};
		Y(me, (e) => {
			t.view.conversion && e(he);
		});
		var ge = V(me, 2), _e = (e) => {
			var n = oc(), r = z(n, !0);
			P(n), H(() => J(r, t.view.issue)), q(e, n);
		};
		Y(ge, (e) => {
			t.view.issue && e(_e);
		});
		var ve = V(ge, 2), ye = (e) => {
			var t = sc(), n = z(t, !0);
			P(t), H(() => J(n, U(l))), q(e, t);
		};
		Y(ve, (e) => {
			U(l) && e(ye);
		});
		var be = V(ve, 2), xe = (e) => {
			q(e, cc());
		};
		Y(be, (e) => {
			U(u) && e(xe);
		}), H((e, r, o, s) => {
			J(p, `${t.view.scopeLabel ?? ""}${t.view.readOnly ? " · Read-only graph" : ""}`), E.disabled = !n().selectPortal, O !== (O = t.view.selectedPortalId ?? "") && (E.value = (E.__value = t.view.selectedPortalId ?? "") ?? "", mi(E, t.view.selectedPortalId ?? "")), ne.disabled = e, ie !== (ie = U(a)) && (ne.value = (ne.__value = U(a)) ?? "", mi(ne, U(a))), Si(oe, U(i)), oe.disabled = r, ce.disabled = o, le.disabled = s;
		}, [
			() => !C("create") && !C("retarget"),
			() => !C("create") || !n().create,
			() => !C("create") || !n().create || !U(_) || !U(i).trim() || !!U(u),
			() => !C("retarget") || !n().retarget || !U(_) || !U(h) || !!U(u)
		]), G("change", E, (e) => {
			let r = e.currentTarget.value;
			e.currentTarget.selectedIndex >= 0 && t.view && n().selectPortal && (!r || t.view.publishers.some((e) => e.id === r)) && n().selectPortal(x(t.view), r || null);
		}), G("change", ne, (e) => {
			R(a, e.currentTarget.value, !0), w();
		}), G("input", oe, (e) => {
			R(i, e.currentTarget.value, !0), w();
		}), G("click", ce, () => {
			let e = U(_), t = U(i);
			e && t.trim() && n().create && T("create", C("create"), (r) => n().create(r, t, S(e)));
		}), G("click", le, () => {
			let e = U(_), t = U(h)?.id;
			e && t && n().retarget && T("retarget", C("retarget"), (r) => n().retarget(r, t, S(e)));
		}), q(e, d);
	}, ee = (e) => {
		q(e, uc());
	};
	Y(A, (e) => {
		t.view ? e(j) : e(ee, -1);
	}), P(E), q(e, E), We();
}
Tr([
	"click",
	"change",
	"input"
]);
//#endregion
//#region ui/SubgraphSave.svelte
var pc = /* @__PURE__ */ K("<option class=\"svelte-1n658sg\"> </option>"), mc = /* @__PURE__ */ K("<p class=\"pc-save-error svelte-1n658sg\" role=\"alert\"> </p>"), hc = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay svelte-1n658sg\"><div class=\"pc-workspace-dialog pc-subgraph-save svelte-1n658sg\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Save subgraph\" tabindex=\"-1\"><header class=\"svelte-1n658sg\"><h2 class=\"svelte-1n658sg\">Save subgraph</h2><button type=\"button\" aria-label=\"Close save subgraph\" class=\"svelte-1n658sg\">×</button></header> <form class=\"svelte-1n658sg\"><label class=\"svelte-1n658sg\">Name<input aria-label=\"Subgraph name\" maxlength=\"80\" class=\"svelte-1n658sg\"/></label> <label class=\"svelte-1n658sg\">Save as<select aria-label=\"Save as\" class=\"svelte-1n658sg\"><option class=\"svelte-1n658sg\">Save new subgraph</option><!></select></label> <p class=\"svelte-1n658sg\">Edits stay local until you save. Existing placed copies stay unchanged.</p> <!> <footer class=\"svelte-1n658sg\"><button type=\"button\" class=\"svelte-1n658sg\">Cancel</button><button type=\"submit\" data-save-subgraph=\"\" class=\"svelte-1n658sg\"> </button></footer></form></div></div>");
function gc(e, t) {
	Ue(t, !0);
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
	}), Mi(() => {
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
	var d = hc(), f = z(d), p = z(f), m = V(z(p));
	P(p);
	var h = V(p, 2), g = z(h), _ = V(z(g));
	Z(_), P(g);
	var v = V(g, 2), y = V(z(v)), b = z(y);
	b.value = b.__value = "", X(V(b), 17, () => t.view.entries, (e) => e.id, (e, t) => {
		var n = pc(), r = z(n);
		P(n);
		var i = {};
		H(() => {
			J(r, `Update ${U(t).name ?? ""}`), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
		}), q(e, n);
	}), P(y), P(v);
	var x = V(v, 4), S = (e) => {
		var n = mc(), r = z(n, !0);
		P(n), H(() => J(r, t.view.error || U(o))), q(e, n);
	};
	Y(x, (e) => {
		(t.view.error || U(o)) && e(S);
	});
	var C = V(x, 2), w = z(C), T = V(w), E = z(T, !0);
	P(T), P(C), P(h), P(f), $(f, (e) => n = e, () => n), P(d), H((e) => {
		T.disabled = e, J(E, U(a) ? "Saving…" : "Save");
	}, [() => !t.actions || !U(r).trim() || U(a)]), W("keydown", f, u, !0), W("paste", f, (e) => e.stopPropagation()), G("click", m, () => t.actions?.close()), W("submit", h, l), Di(_, () => U(r), (e) => R(r, e)), gi(y, () => U(i), (e) => R(i, e)), G("click", w, () => t.actions?.close()), q(e, d), We();
}
Tr(["click"]);
//#endregion
//#region ui/FastConnections.svelte
var _c = /* @__PURE__ */ K("<option class=\"svelte-1n96rai\"> </option>"), vc = /* @__PURE__ */ K("<p class=\"pc-fast-key-status svelte-1n96rai\"> </p>"), yc = /* @__PURE__ */ K("<p role=\"alert\" class=\"svelte-1n96rai\"> </p>"), bc = /* @__PURE__ */ K("<p role=\"status\" class=\"svelte-1n96rai\"> </p>"), xc = /* @__PURE__ */ K("<section class=\"pc-fast-connections svelte-1n96rai\" aria-label=\"Fast connection setup\"><p class=\"svelte-1n96rai\">Configure a typed Jev, Laya or compatible model for Fast Decision. Node settings keep only the connection ID.</p> <label class=\"svelte-1n96rai\">Configured Fast connection<select aria-label=\"Configured Fast connection\" class=\"svelte-1n96rai\"><option class=\"svelte-1n96rai\">New connection</option><!></select></label> <div class=\"pc-fast-fields svelte-1n96rai\"><label class=\"svelte-1n96rai\">Connection ID<input aria-label=\"Connection ID\" maxlength=\"128\" class=\"svelte-1n96rai\"/></label> <label class=\"svelte-1n96rai\">Connection name<input aria-label=\"Connection name\" maxlength=\"256\" class=\"svelte-1n96rai\"/></label> <label class=\"svelte-1n96rai\">Provider<select aria-label=\"Provider\" class=\"svelte-1n96rai\"><option class=\"svelte-1n96rai\">Jev API</option><option class=\"svelte-1n96rai\">Laya</option><option class=\"svelte-1n96rai\">Compatible typed API</option></select></label> <label class=\"svelte-1n96rai\">Typed model<input aria-label=\"Typed model\" maxlength=\"256\" class=\"svelte-1n96rai\"/></label></div> <label class=\"svelte-1n96rai\">Typed endpoint<input aria-label=\"Typed endpoint\" type=\"url\" maxlength=\"2048\" class=\"svelte-1n96rai\"/></label> <small class=\"svelte-1n96rai\"> </small> <label class=\"svelte-1n96rai\">Session API key<input aria-label=\"Session API key\" type=\"password\" autocomplete=\"new-password\" spellcheck=\"false\" maxlength=\"8192\" class=\"svelte-1n96rai\"/></label> <small class=\"svelte-1n96rai\">Keys are session-only. Re-enter them after restarting SillyTavern. Leave this field empty to keep an existing session key.</small> <!> <!> <!> <footer class=\"svelte-1n96rai\"><button type=\"button\" class=\"svelte-1n96rai\"> </button><button type=\"button\" class=\"svelte-1n96rai\">Clear session key</button><button type=\"button\" class=\"svelte-1n96rai\">Remove connection</button><button type=\"button\" class=\"svelte-1n96rai\">Close</button></footer></section>");
function Sc(e, t) {
	Ue(t, !0);
	let n = ji(t, "actions", 19, () => ({})), r = /* @__PURE__ */ L(""), i = /* @__PURE__ */ L(""), a = /* @__PURE__ */ L(""), o = /* @__PURE__ */ L("jev"), s = /* @__PURE__ */ L(""), c = /* @__PURE__ */ L(""), l = /* @__PURE__ */ L(""), u = /* @__PURE__ */ L(!1), d = /* @__PURE__ */ L(""), f = /* @__PURE__ */ L(""), p = /* @__PURE__ */ L(en(gr(() => t.view.userId))), m = 0, h = /* @__PURE__ */ F(() => t.view.connections.find((e) => e.id === U(r)));
	function g() {
		m++, R(p, t.view.userId, !0), v(""), R(f, "The active user changed. Choose a connection for this user.");
	}
	Sn(() => {
		U(p) !== t.view.userId && g();
	});
	function _() {
		if (U(p) !== t.view.userId) return g(), null;
		let e = m, n = U(p);
		return {
			userId: n,
			current: () => m === e && U(p) === n && t.view.userId === n
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
		if (U(u) || !n().save) return;
		let e = _();
		if (!e) return;
		let t = U(l);
		R(l, ""), R(u, !0), R(d, ""), R(f, "");
		let p = {
			id: U(i),
			label: U(a) || U(i),
			provider: U(o),
			model: U(s),
			...U(o) === "jev" ? {} : { endpoint: U(c) }
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
		if (!U(r) || U(u) || !n().remove) return;
		let e = _();
		if (e) {
			R(l, ""), R(u, !0), R(f, ""), R(d, "");
			try {
				let t = await n().remove(U(r), e.userId);
				e.current() && (t.ok && v(""), y(t));
			} catch {
				e.current() && R(f, "The connection could not be removed.");
			} finally {
				R(u, !1);
			}
		}
	}
	async function S() {
		if (!U(r) || U(u) || !n().clearCredential) return;
		let e = _();
		if (e) {
			R(l, ""), R(u, !0), R(f, ""), R(d, "");
			try {
				let t = await n().clearCredential(U(r), e.userId);
				e.current() && y(t);
			} catch {
				e.current() && R(f, "The session key could not be cleared.");
			} finally {
				R(u, !1);
			}
		}
	}
	var C = xc(), w = V(z(C), 2), T = V(z(w)), E = z(T);
	E.value = E.__value = "", X(V(E), 17, () => t.view.connections, (e) => e.id, (e, t) => {
		var n = _c(), r = z(n);
		P(n);
		var i = {};
		H(() => {
			J(r, `${U(t).label ?? ""} · ${U(t).provider ?? ""} · ${U(t).model ?? ""}`), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
		}), q(e, n);
	}), P(T);
	var D;
	hi(T), P(w);
	var O = V(w, 2), k = z(O), A = V(z(k));
	Z(A), P(k);
	var j = V(k, 2), ee = V(z(j));
	Z(ee), P(j);
	var te = V(j, 2), ne = V(z(te)), re = z(ne);
	re.value = re.__value = "jev";
	var ie = V(re);
	ie.value = ie.__value = "laya";
	var ae = V(ie);
	ae.value = ae.__value = "compatible", P(ne);
	var oe;
	hi(ne), P(te);
	var se = V(te, 2), ce = V(z(se));
	Z(ce), P(se), P(O);
	var le = V(O, 2), ue = V(z(le));
	Z(ue), P(le);
	var de = V(le, 2), fe = z(de, !0);
	P(de);
	var pe = V(de, 2), me = V(z(pe));
	Z(me), P(pe);
	var he = V(pe, 4), ge = (e) => {
		var t = vc(), n = z(t);
		P(t), H(() => J(n, `Session key: ${U(h).credentialReady ? "ready" : "not entered"}`)), q(e, t);
	};
	Y(he, (e) => {
		U(h) && e(ge);
	});
	var _e = V(he, 2), ve = (e) => {
		var n = yc(), r = z(n, !0);
		P(n), H(() => J(r, U(f) || t.view.issue)), q(e, n);
	};
	Y(_e, (e) => {
		(t.view.issue || U(f)) && e(ve);
	});
	var ye = V(_e, 2), be = (e) => {
		var t = bc(), n = z(t, !0);
		P(t), H(() => J(n, U(d))), q(e, t);
	};
	Y(ye, (e) => {
		U(d) && e(be);
	});
	var xe = V(ye, 2), Se = z(xe), Ce = z(Se, !0);
	P(Se);
	var we = V(Se), Te = V(we), Ee = V(Te);
	P(xe), P(C), H(() => {
		T.disabled = U(u), D !== (D = U(r)) && (T.value = (T.__value = U(r)) ?? "", mi(T, U(r))), Si(A, U(i)), A.disabled = U(u) || !!U(r), Si(ee, U(a)), ee.disabled = U(u), ne.disabled = U(u), oe !== (oe = U(o)) && (ne.value = (ne.__value = U(o)) ?? "", mi(ne, U(o))), Si(ce, U(s)), ce.disabled = U(u), Si(ue, U(o) === "jev" ? "https://api.typesafe.ai/v1/systemone" : U(c)), ue.readOnly = U(o) === "jev", ue.disabled = U(u), J(fe, U(o) === "jev" ? "Jev uses its fixed SystemOne endpoint and requires a session API key." : "Enter the complete /v1/systemone route using HTTPS or HTTP on localhost. A session key is optional for an unauthenticated local service."), Si(me, U(l)), me.disabled = U(u), Se.disabled = U(u) || !n().save || !!t.view.issue, J(Ce, U(u) ? "Applying…" : "Save connection"), we.disabled = U(u) || !U(h)?.credentialReady || !n().clearCredential, Te.disabled = U(u) || !U(r) || !n().remove;
	}), G("change", T, (e) => v(e.currentTarget.value)), G("input", A, (e) => R(i, e.currentTarget.value, !0)), G("input", ee, (e) => R(a, e.currentTarget.value, !0)), G("change", ne, (e) => {
		R(o, e.currentTarget.value, !0);
	}), G("input", ce, (e) => R(s, e.currentTarget.value, !0)), G("input", ue, (e) => R(c, e.currentTarget.value, !0)), G("input", me, (e) => R(l, e.currentTarget.value, !0)), G("click", Se, b), G("click", we, S), G("click", Te, x), G("click", Ee, () => {
		R(l, ""), t.close();
	}), q(e, C), We();
}
Tr([
	"change",
	"input",
	"click"
]);
//#endregion
//#region src/workflow/operations/json-data.js?v=0.27.0
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
//#region src/workflow/story-time.js?v=0.27.0
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
var Lc = /* @__PURE__ */ K("<p role=\"alert\" class=\"svelte-1t33cem\"> </p>"), Rc = /* @__PURE__ */ K("<option class=\"svelte-1t33cem\"> </option>"), zc = /* @__PURE__ */ K("<label class=\"svelte-1t33cem\">Actor ID<input aria-label=\"Actor ID\" maxlength=\"128\" class=\"svelte-1t33cem\"/></label>"), Bc = /* @__PURE__ */ K("<label class=\"svelte-1t33cem\">CSV columns, comma separated<input aria-label=\"CSV columns\" class=\"svelte-1t33cem\"/></label>"), Vc = /* @__PURE__ */ K("<details class=\"svelte-1t33cem\"><summary class=\"svelte-1t33cem\">Story clock template</summary><label class=\"svelte-1t33cem\">Calendar ID<input aria-label=\"Calendar ID\" class=\"svelte-1t33cem\"/></label><label class=\"svelte-1t33cem\">Starting story minute<input aria-label=\"Starting story minute\" type=\"number\" min=\"0\" step=\"1\" class=\"svelte-1t33cem\"/></label><button type=\"button\" class=\"svelte-1t33cem\">Use story clock template</button><p class=\"svelte-1t33cem\">Midnight on the first day is minute 0. The clock advances through graph events, using explicit story time.</p></details>"), Hc = /* @__PURE__ */ K("<p role=\"status\" class=\"svelte-1t33cem\"> </p>"), Uc = /* @__PURE__ */ K("<div class=\"pc-story-documents svelte-1t33cem\"><p class=\"svelte-1t33cem\"> </p> <p class=\"svelte-1t33cem\">Manage the documents used by your workflows here. Updating an authorization or its initial template leaves existing canonical document content intact. Read File and Write File use these target IDs.</p> <!> <label class=\"svelte-1t33cem\">Workflow data document<select aria-label=\"Workflow data document\" class=\"svelte-1t33cem\"><option class=\"svelte-1t33cem\">New document authorization</option><!></select></label> <div class=\"pc-document-actions svelte-1t33cem\"><button type=\"button\" class=\"svelte-1t33cem\">Load initial template</button><button type=\"button\" class=\"svelte-1t33cem\">Remove authorization</button><button type=\"button\" class=\"svelte-1t33cem\">Refresh scope</button></div> <form class=\"svelte-1t33cem\"><label class=\"svelte-1t33cem\">Logical target ID<input aria-label=\"Logical target ID\" maxlength=\"128\" placeholder=\"souls.json\" class=\"svelte-1t33cem\"/></label> <label class=\"svelte-1t33cem\">Document name<input aria-label=\"Document name\" maxlength=\"256\" class=\"svelte-1t33cem\"/></label> <label class=\"svelte-1t33cem\">Format<select aria-label=\"Document format\" class=\"svelte-1t33cem\"><option class=\"svelte-1t33cem\">JSON</option><option class=\"svelte-1t33cem\">JSON Lines</option><option class=\"svelte-1t33cem\">CSV</option><option class=\"svelte-1t33cem\">Plain text</option><option class=\"svelte-1t33cem\">Markdown</option></select></label> <label class=\"svelte-1t33cem\">Visibility<select aria-label=\"Document visibility\" class=\"svelte-1t33cem\"><option class=\"svelte-1t33cem\">Public</option><option class=\"svelte-1t33cem\">Hidden</option><option class=\"svelte-1t33cem\">Actor private</option></select></label> <!> <!> <!> <label class=\"svelte-1t33cem\">Initial template<textarea aria-label=\"Initial template\" rows=\"7\" maxlength=\"100000\" class=\"svelte-1t33cem\"></textarea></label> <p class=\"svelte-1t33cem\">JSON templates preserve your chosen object or list structure. CSV uses the named columns. Existing authorizations require explicit template loading before editing.</p> <!><!> <footer class=\"svelte-1t33cem\"><button type=\"button\" class=\"svelte-1t33cem\">Close</button><button type=\"submit\" class=\"svelte-1t33cem\"> </button></footer></form></div>");
function Wc(e, t) {
	Ue(t, !0);
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
		let e = Ic(U(r), U(m), U(h));
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
	var S = Uc(), C = z(S), w = z(C);
	P(C);
	var T = V(C, 4), E = (e) => {
		var n = Lc(), r = z(n, !0);
		P(n), H(() => J(r, t.view.issue)), q(e, n);
	};
	Y(T, (e) => {
		t.view.issue && e(E);
	});
	var D = V(T, 2), O = V(z(D)), k = z(O);
	k.value = k.__value = "", X(V(k), 17, () => t.view.documents, (e) => e.targetId, (e, t) => {
		var n = Rc(), r = z(n);
		P(n);
		var i = {};
		H(() => {
			J(r, `${U(t).name ?? ""} (${U(t).targetId ?? ""}, ${U(t).format ?? ""}, ${U(t).visibility.kind ?? ""})`), i !== (i = U(t).targetId) && (n.value = (n.__value = U(t).targetId) ?? "");
		}), q(e, n);
	}), P(O), P(D);
	var A = V(D, 2), j = z(A), ee = V(j), te = V(ee);
	P(A);
	var ne = V(A, 2), re = z(ne), ie = V(z(re));
	Z(ie), P(re);
	var ae = V(re, 2), oe = V(z(ae));
	Z(oe), P(ae);
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
		var t = zc(), n = V(z(t));
		Z(n), P(t), H(() => n.disabled = U(u)), Di(n, () => U(c), (e) => R(c, e)), q(e, t);
	};
	Y(ye, (e) => {
		U(s) === "actor-private" && e(be);
	});
	var xe = V(ye, 2), Se = (e) => {
		var t = Bc(), n = V(z(t));
		Z(n), P(t), H(() => n.disabled = U(u)), Di(n, () => U(l), (e) => R(l, e)), q(e, t);
	};
	Y(xe, (e) => {
		U(a) === "csv" && e(Se);
	});
	var Ce = V(xe, 2), we = (e) => {
		var t = Vc(), i = V(z(t)), a = V(z(i));
		Z(a), P(i);
		var o = V(i), s = V(z(o));
		Z(s), P(o);
		var c = V(o);
		Me(), P(t), H((e) => {
			a.disabled = U(u), s.disabled = U(u), c.disabled = e;
		}, [() => !U(r).trim() || U(u) || !!U(n) && !U(p)]), Di(a, () => U(m), (e) => R(m, e)), Di(s, () => U(h), (e) => R(h, e)), G("click", c, b), q(e, t);
	};
	Y(Ce, (e) => {
		U(a) === "json" && e(we);
	});
	var Te = V(Ce, 2), Ee = V(z(Te));
	at(Ee), P(Te);
	var De = V(Te, 4), Oe = (e) => {
		var t = Lc(), n = z(t, !0);
		P(t), H(() => J(n, U(d))), q(e, t);
	};
	Y(De, (e) => {
		U(d) && e(Oe);
	});
	var M = V(De), ke = (e) => {
		var n = Hc(), r = z(n, !0);
		P(n), H(() => J(r, U(f) || t.view.notice)), q(e, n);
	};
	Y(M, (e) => {
		(U(f) || t.view.notice) && e(ke);
	});
	var N = V(M, 2), Ae = z(N), je = V(Ae), Ne = z(je, !0);
	P(je), P(N), P(ne), P(S), H((e) => {
		J(w, `Active user: ${(t.view.scope.userId || "Unavailable") ?? ""} · Chat: ${(t.view.scope.chatId || "Unavailable") ?? ""}`), O.disabled = U(u), j.disabled = !U(n) || U(u), ee.disabled = !U(n) || U(u), te.disabled = U(u), ie.disabled = !!U(n) || U(u), oe.disabled = U(u), ce.disabled = !!U(n) || U(u), he.disabled = U(u), Ee.disabled = U(u) || !!U(n) && !U(p), Q(Ee, "placeholder", U(a) === "json" ? "[]" : ""), je.disabled = e, J(Ne, U(u) ? "Saving…" : "Save authorization");
	}, [() => !t.actions || !t.view.key || !U(r).trim() || !U(i).trim() || U(u) || !!U(n) && !U(p) || U(s) === "actor-private" && !U(c).trim()]), G("change", O, y), gi(O, () => U(n), (e) => R(n, e)), G("click", j, () => x("load")), G("click", ee, () => x("remove")), G("click", te, () => t.actions?.refresh()), W("submit", ne, (e) => {
		e.preventDefault(), x("save");
	}), Di(ie, () => U(r), (e) => R(r, e)), Di(oe, () => U(i), (e) => R(i, e)), gi(ce, () => U(a), (e) => R(a, e)), gi(he, () => U(s), (e) => R(s, e)), Di(Ee, () => U(o), (e) => R(o, e)), G("click", Ae, function(...e) {
		t.close?.apply(this, e);
	}), q(e, S), We();
}
Tr(["change", "click"]);
//#endregion
//#region ui/RecallArms.svelte
var Gc = /* @__PURE__ */ K("<p class=\"svelte-34wc6n\"> </p>"), Kc = /* @__PURE__ */ K("<p role=\"alert\" class=\"svelte-34wc6n\"> </p>"), qc = /* @__PURE__ */ K("<p class=\"svelte-34wc6n\">Add a Hotkey Arm node to the assigned unified workflow for the active character, then enable Lattice. Configure the actor, memory set, target and use policy in Details.</p>"), Jc = /* @__PURE__ */ K("<fieldset class=\"svelte-34wc6n\"><legend> </legend> <p class=\"svelte-34wc6n\"> </p> <p class=\"svelte-34wc6n\"> </p> <button type=\"button\"> </button></fieldset>"), Yc = /* @__PURE__ */ K("<header class=\"svelte-34wc6n\"><h2>Recall arms</h2><button type=\"button\">Close</button></header> <p class=\"svelte-34wc6n\">Arm a memory set for the next reply, generated swipe, or both. Automatic Recall triggers use the workflow’s own conditions.</p> <!> <!> <!> <!> <p class=\"svelte-34wc6n\"><button type=\"button\">Refresh recall state</button></p> <small class=\"svelte-34wc6n\">Shortcuts use physical keys and do not fire while typing in inputs. Duplicate active shortcuts require a different key. Editing the graph or switching scope revokes old shortcuts.</small>", 1);
function Xc(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ L(""), r = /* @__PURE__ */ L(""), i = (e) => [
		e.ctrl ? "Ctrl" : "",
		e.alt ? "Alt" : "",
		e.shift ? "Shift" : "",
		e.meta ? "Meta" : "",
		e.code.replace(/^Key|^Digit/u, "")
	].filter(Boolean).join("+");
	async function a(e, i) {
		if (!U(n)) {
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
	var o = Yc(), s = B(o), c = V(z(s));
	P(s);
	var l = V(s, 4), u = (e) => {
		var n = Gc(), r = z(n);
		P(n), H(() => J(r, `User ${t.view.scope.userId ?? ""} · Chat ${t.view.scope.chatId ?? ""} · Actor ${t.view.scope.actorId ?? ""}`)), q(e, n);
	};
	Y(l, (e) => {
		t.view.scope && e(u);
	});
	var d = V(l, 2), f = (e) => {
		var n = Kc(), i = z(n, !0);
		P(n), H(() => J(i, U(r) || t.view.issue)), q(e, n);
	};
	Y(d, (e) => {
		(t.view.issue || U(r)) && e(f);
	});
	var p = V(d, 2), m = (e) => {
		q(e, qc());
	};
	Y(p, (e) => {
		t.view.nodes.length || e(m);
	});
	var h = V(p, 2);
	X(h, 17, () => t.view.nodes, (e) => e.nodeId, (e, r) => {
		var o = Jc(), s = z(o), c = z(s);
		P(s);
		var l = V(s, 2), u = z(l);
		P(l);
		var d = V(l, 2), f = z(d);
		P(d);
		var p = V(d, 2), m = z(p, !0);
		P(p), P(o), H((e) => {
			J(c, `${U(r).memorySetId ?? ""} · ${U(r).armed ? "Armed" : "Disarmed"}`), J(u, `${e ?? ""} · ${U(r).target ?? ""} · ${U(r).uses ?? ""} · consume on ${U(r).consumeOn ?? ""}`), J(f, `Remaining: ${U(r).remaining.reply ? "reply " : ""}${U(r).remaining.swipe ? "swipe" : ""}${!U(r).remaining.reply && !U(r).remaining.swipe ? "none" : ""}. Pending generations: ${U(r).pendingCount ?? ""}.`), Q(p, "aria-label", (U(r).armed ? "Disarm " : "Arm ") + U(r).memorySetId), p.disabled = !!U(n) || !t.actions, J(m, U(n) === U(r).nodeId ? "Updating…" : U(r).armed ? "Disarm" : "Arm");
		}, [() => i(U(r).hotkey)]), G("click", p, () => a(U(r).nodeId, U(r).armed)), q(e, o);
	});
	var g = V(h, 2), _ = z(g);
	P(g), Me(2), H(() => _.disabled = !!U(n) || !t.actions), G("click", c, function(...e) {
		t.close?.apply(this, e);
	}), G("click", _, () => t.actions?.refresh()), q(e, o), We();
}
Tr(["click"]);
//#endregion
//#region ui/ConfigureNode.svelte
var Zc = /* @__PURE__ */ K("<option class=\"svelte-1srbsqt\"> </option>"), Qc = /* @__PURE__ */ K("<p class=\"svelte-1srbsqt\">Authorize a document in Tools › Workflow Data, then reopen node creation.</p>"), $c = /* @__PURE__ */ K("<label class=\"svelte-1srbsqt\">Workflow data document<select aria-label=\"Workflow data document\" class=\"svelte-1srbsqt\"><option class=\"svelte-1srbsqt\">Choose an authorized target</option><!></select></label><!>", 1), el = /* @__PURE__ */ K("<label class=\"svelte-1srbsqt\">Pinned Data helper<select aria-label=\"Pinned Data helper\" class=\"svelte-1srbsqt\"><option class=\"svelte-1srbsqt\">Choose an existing item/result helper</option><!></select></label><p class=\"svelte-1srbsqt\">Helpers use exact pinned versions with Data item and result ports. Set iteration mode and requestBoundPerIteration in the controls below.</p>", 1), tl = /* @__PURE__ */ K("<p role=\"alert\" class=\"svelte-1srbsqt\"> </p>"), nl = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay svelte-1srbsqt\"><div class=\"pc-workspace-dialog pc-configure-node svelte-1srbsqt\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Configure node\" tabindex=\"-1\"><header class=\"svelte-1srbsqt\"><h2 class=\"svelte-1srbsqt\"> </h2><button type=\"button\" aria-label=\"Close node configuration\" class=\"svelte-1srbsqt\">×</button></header> <p class=\"svelte-1srbsqt\">Complete the required settings before creating the node. Cancel leaves the graph unchanged.</p> <form class=\"svelte-1srbsqt\"><label class=\"svelte-1srbsqt\">Stage<select aria-label=\"Node stage\" class=\"svelte-1srbsqt\"><option class=\"svelte-1srbsqt\">Preparation</option><option class=\"svelte-1srbsqt\">Response</option></select></label> <!> <!> <label class=\"svelte-1srbsqt\">Declared node controls<textarea aria-label=\"Node controls JSON\" rows=\"14\" maxlength=\"200000\" class=\"svelte-1srbsqt\"></textarea></label> <!> <footer class=\"svelte-1srbsqt\"><button type=\"button\" class=\"svelte-1srbsqt\">Cancel</button><button type=\"submit\" class=\"svelte-1srbsqt\"> </button></footer></form></div></div>");
function rl(e, t) {
	Ue(t, !0);
	let n, r = /* @__PURE__ */ L(""), i = /* @__PURE__ */ L("pre"), a = /* @__PURE__ */ L(""), o = /* @__PURE__ */ L(""), s = /* @__PURE__ */ L(!1), c = /* @__PURE__ */ L(""), l = "", u = 0, d = /* @__PURE__ */ F(() => t.view.operation === "read-file" || t.view.operation === "story-clock" || t.view.operation === "commit-outcomes");
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
	}), Mi(() => {
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
	var h = nl(), g = z(h), _ = z(g), v = z(_), y = z(v);
	P(v);
	var b = V(v);
	P(_);
	var x = V(_, 4), S = z(x), C = V(z(S)), w = z(C);
	w.value = w.__value = "pre";
	var T = V(w);
	T.value = T.__value = "post", P(C), P(S);
	var E = V(S, 2), D = (e) => {
		var n = $c(), r = B(n), i = V(z(r)), o = z(i);
		o.value = o.__value = "", X(V(o), 17, () => t.view.targets.filter((e) => !["story-clock", "commit-outcomes"].includes(t.view.operation) || e.format === "json"), (e) => e.targetId, (e, t) => {
			var n = Zc(), r = z(n);
			P(n);
			var i = {};
			H(() => {
				J(r, `${U(t).name ?? ""} (${U(t).targetId ?? ""})`), i !== (i = U(t).targetId) && (n.value = (n.__value = U(t).targetId) ?? "");
			}), q(e, n);
		}), P(i), P(r);
		var c = V(r), l = (e) => {
			q(e, Qc());
		};
		Y(c, (e) => {
			t.view.targets.length || e(l);
		}), H(() => i.disabled = U(s)), G("change", i, () => f(t.view.operation === "story-clock" ? "clockId" : "targetId", U(a))), gi(i, () => U(a), (e) => R(a, e)), q(e, n);
	};
	Y(E, (e) => {
		U(d) && e(D);
	});
	var O = V(E, 2), k = (e) => {
		var n = el(), r = B(n), i = V(z(r)), a = z(i);
		a.value = a.__value = "", X(V(a), 17, () => t.view.helpers, (e) => e.key, (e, t) => {
			var n = Zc(), r = z(n);
			P(n);
			var i = {};
			H(() => {
				J(r, `${U(t).label ?? ""}${U(t).stateful ? " (projected state)" : ""}`), i !== (i = U(t).key) && (n.value = (n.__value = U(t).key) ?? "");
			}), q(e, n);
		}), P(i), P(r), Me(), H(() => i.disabled = U(s)), G("change", i, () => {
			let e = t.view.helpers.find((e) => e.key === U(o));
			e && f("helper", e.ref);
		}), gi(i, () => U(o), (e) => R(o, e)), q(e, n);
	};
	Y(O, (e) => {
		t.view.operation === "for-each" && e(k);
	});
	var A = V(O, 2), j = V(z(A));
	at(j), P(A);
	var ee = V(A, 2), te = (e) => {
		var t = tl(), n = z(t, !0);
		P(t), H(() => J(n, U(c))), q(e, t);
	};
	Y(ee, (e) => {
		U(c) && e(te);
	});
	var ne = V(ee, 2), re = z(ne), ie = V(re), ae = z(ie, !0);
	P(ie), P(ne), P(x), P(g), $(g, (e) => n = e, () => n), P(h), H(() => {
		J(y, `Configure ${t.view.title ?? ""}`), C.disabled = t.view.phaseLocked || U(s), j.disabled = U(s), ie.disabled = !t.actions || U(s), J(ae, U(s) ? "Preparing…" : "Create node");
	}), W("keydown", g, m, !0), W("paste", g, (e) => e.stopPropagation()), G("click", b, () => t.actions?.cancel(t.view.key)), W("submit", x, p), gi(C, () => U(i), (e) => R(i, e)), Di(j, () => U(r), (e) => R(r, e)), G("click", re, () => t.actions?.cancel(t.view.key)), q(e, h), We();
}
Tr(["click", "change"]);
//#endregion
//#region ui/NewWorkflowPrompt.svelte
var il = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay\"><div class=\"pc-workspace-dialog pc-new-workflow-prompt svelte-121ekho\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Save workflow changes?\" tabindex=\"-1\"><h2 class=\"svelte-121ekho\">Save workflow changes?</h2> <p class=\"svelte-121ekho\"><strong class=\"svelte-121ekho\"> </strong> has unsaved changes.</p> <p class=\"svelte-121ekho\">Save downloads workflow JSON before opening a new workflow. Your existing workflow stays in the workspace.</p> <footer class=\"svelte-121ekho\"><button type=\"button\" class=\"svelte-121ekho\">Save</button><button type=\"button\" class=\"svelte-121ekho\">Discard</button><button type=\"button\" class=\"svelte-121ekho\">Cancel</button></footer></div></div>");
function al(e, t) {
	Ue(t, !0);
	let n, r;
	Mi(() => {
		let e = document.activeElement;
		return r.focus({ preventScroll: !0 }), () => e?.focus({ preventScroll: !0 });
	});
	function i(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), t.actions?.choose("cancel")), e.key === "Tab") {
			let t = [...n.querySelectorAll("button:not(:disabled)")], r = t.indexOf(document.activeElement);
			e.shiftKey && r <= 0 && (e.preventDefault(), t.at(-1)?.focus()), !e.shiftKey && (r < 0 || r === t.length - 1) && (e.preventDefault(), t[0]?.focus());
		}
	}
	var a = il(), o = z(a), s = V(z(o), 2), c = z(s), l = z(c, !0);
	P(c), Me(), P(s);
	var u = V(s, 4), d = z(u), f = V(d), p = V(f);
	$(p, (e) => r = e, () => r), P(u), P(o), $(o, (e) => n = e, () => n), P(a), H(() => J(l, t.view.name)), W("keydown", o, i, !0), W("paste", o, (e) => e.stopPropagation(), !0), G("click", d, () => t.actions?.choose("save")), G("click", f, () => t.actions?.choose("discard")), G("click", p, () => t.actions?.choose("cancel")), q(e, a), We();
}
Tr(["click"]);
//#endregion
//#region ui/NodeSearch.svelte
var ol = /* @__PURE__ */ K("<label class=\"pc-context-check svelte-golf61\"><input type=\"checkbox\" class=\"svelte-golf61\"/>Context sensitive</label>"), sl = /* @__PURE__ */ K("<span class=\"pc-search-context svelte-golf61\"> </span>"), cl = /* @__PURE__ */ K("<label class=\"pc-search-field svelte-golf61\"><input type=\"search\" aria-label=\"Search nodes and subgraphs\" placeholder=\"Search…\" autocomplete=\"off\" role=\"combobox\" aria-expanded=\"true\" class=\"svelte-golf61\"/></label> <!> <!>", 1), ll = /* @__PURE__ */ K("<p class=\"pc-search-context svelte-golf61\">Choose the named port to connect.</p>"), ul = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-search-result svelte-golf61\" role=\"option\"><span class=\"svelte-golf61\"> </span> <span class=\"pc-family svelte-golf61\"> </span></button>"), dl = /* @__PURE__ */ K("<p class=\"pc-empty svelte-golf61\">No nodes match.</p>"), fl = /* @__PURE__ */ K("<p class=\"pc-feedback svelte-golf61\" role=\"status\"> </p>"), pl = /* @__PURE__ */ K("<div class=\"pc-node-search svelte-golf61\" role=\"dialog\" aria-modal=\"false\" tabindex=\"-1\"><!> <div class=\"pc-search-results svelte-golf61\" role=\"listbox\"></div> <!></div>");
function ml(e, t) {
	let n = Lr();
	Ue(t, !0);
	let r = ji(t, "view", 3, null), i = ji(t, "actions", 19, () => ({})), a = /* @__PURE__ */ L(void 0), o = /* @__PURE__ */ L(void 0), s = /* @__PURE__ */ L(""), c = /* @__PURE__ */ L(0), l = /* @__PURE__ */ L(8), u = /* @__PURE__ */ L(8), d, f, p = (e) => [
		e.label,
		e.family,
		e.purpose ?? "",
		e.shortcode ?? "",
		...e.searchAliases ?? []
	].join(" ").toLocaleLowerCase(), m = /* @__PURE__ */ F(() => (r()?.choices ?? []).filter((e) => p(e).includes(U(s).toLocaleLowerCase().trim()))), h = /* @__PURE__ */ F(() => r()?.mode === "ports" ? r().ports : U(m)), g = (e) => "id" in e ? e.id : e.portId, _ = (e) => !!r()?.readOnly || "disabledReason" in e && !!e.disabledReason, v = /* @__PURE__ */ F(() => U(h).filter((e) => !_(e))), y = /* @__PURE__ */ F(() => U(v)[Math.min(U(c), Math.max(0, U(v).length - 1))]), b = (e) => ({
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
		var t = pl();
		let i;
		var d = z(t), f = (e) => {
			var t = cl(), i = B(t), a = z(i);
			Z(a), $(a, (e) => R(o, e), () => U(o)), P(i);
			var l = V(i, 2), u = (e) => {
				var t = ol(), n = z(t);
				Z(n), Me(), P(t), H(() => {
					Ci(n, r().contextSensitive), n.disabled = r().readOnly;
				}), G("change", n, C), q(e, t);
			};
			Y(l, (e) => {
				r().origin && e(u);
			});
			var d = V(l, 2), f = (e) => {
				var t = sl(), n = z(t, !0);
				P(t), H(() => J(n, (r().origin.dir === "out" ? "Accepts " : "Produces ") + r().origin.kind)), q(e, t);
			};
			Y(d, (e) => {
				r().origin && e(f);
			}), H((e) => {
				Q(a, "aria-controls", n + "-results"), Q(a, "aria-activedescendant", e);
			}, [() => U(y) ? n + "-item-" + U(h).indexOf(U(y)) : void 0]), G("input", a, () => R(c, 0)), Di(a, () => U(s), (e) => R(s, e)), q(e, t);
		}, p = (e) => {
			q(e, ll());
		};
		Y(d, (e) => {
			r().mode === "nodes" ? e(f) : e(p, -1);
		});
		var m = V(d, 2);
		X(m, 21, () => U(h), (e) => g(e), (e, t) => {
			var r = ul(), i = z(r), a = z(i, !0);
			P(i);
			var o = V(i, 1, !0);
			o.nodeValue = " ";
			var s = V(o);
			let l;
			var u = z(s, !0);
			P(s), P(r), H((e, n, i, o) => {
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
			q(e, dl());
		}), P(m);
		var x = V(m, 2), T = (e) => {
			var t = fl(), n = z(t, !0);
			P(t), H(() => J(n, r().feedback)), q(e, t);
		};
		Y(x, (e) => {
			r().feedback && e(T);
		}), P(t), $(t, (e) => R(a, e), () => U(a)), H(() => {
			Q(t, "aria-label", r().mode === "ports" ? "Choose connection port" : "Add node"), i = pi(t, "", i, {
				left: `${U(l) ?? ""}px`,
				top: `${U(u) ?? ""}px`
			}), Q(m, "id", n + "-results"), Q(m, "aria-label", r().mode === "ports" ? "Compatible ports" : "Nodes and subgraphs");
		}), G("keydown", t, w), q(e, t);
	};
	Y(E, (e) => {
		r() && e(D);
	}), q(e, T), We();
}
Tr([
	"keydown",
	"input",
	"change",
	"click"
]);
//#endregion
//#region ui/PinMenu.svelte
var hl = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-pin-action svelte-i73q0t\"> </button>"), gl = /* @__PURE__ */ K("<p class=\"pc-empty svelte-i73q0t\">No attached links.</p>"), _l = /* @__PURE__ */ K("<div class=\"pc-pin-menu svelte-i73q0t\" role=\"dialog\" aria-label=\"Pin actions\" aria-modal=\"false\" tabindex=\"-1\"><div class=\"pc-menu-head svelte-i73q0t\"><h2 class=\"svelte-i73q0t\"> </h2><button type=\"button\" aria-label=\"Close pin actions\" class=\"svelte-i73q0t\">Close</button></div> <p class=\"pc-kind svelte-i73q0t\"> </p> <!></div>");
function vl(e, t) {
	Ue(t, !0);
	let n = ji(t, "view", 3, null), r = ji(t, "actions", 19, () => ({})), i = /* @__PURE__ */ L(void 0), a = /* @__PURE__ */ L(8), o = /* @__PURE__ */ L(8), s, c = (e) => !!e.disabled || !!n()?.readOnly && e.capability !== "navigation";
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
		var t = _l();
		let s;
		var l = z(t), f = z(l), p = z(f, !0);
		P(f);
		var m = V(f);
		P(l);
		var h = V(l, 2), g = z(h);
		P(h), X(V(h, 2), 17, () => n().entries, (e) => e.id, (e, t) => {
			var n = hl(), r = z(n, !0);
			P(n), H((e) => {
				Q(n, "data-entry", U(t).id), n.disabled = e, Q(n, "title", U(t).reason), J(r, U(t).label);
			}, [() => c(U(t))]), G("click", n, () => u(U(t))), q(e, n);
		}, (e) => {
			q(e, gl());
		}), P(t), $(t, (e) => R(i, e), () => U(i)), H(() => {
			s = pi(t, "", s, {
				left: `${U(a) ?? ""}px`,
				top: `${U(o) ?? ""}px`
			}), J(p, n().title), J(g, `${n().kind ?? ""}${n().readOnly ? " · Read only" : ""}`);
		}), G("keydown", t, d), G("click", m, () => r().dismiss?.()), q(e, t);
	};
	Y(p, (e) => {
		n() && e(m);
	}), q(e, f), We();
}
Tr(["keydown", "click"]);
//#endregion
//#region src/ui/node-palette.js
var yl = "M3 7 12 2l9 5v10l-9 5-9-5ZM3 7l9 5 9-5M12 12v10", bl = "M3 6l4-2 4 2v5l-4 2-4-2ZM3 6l4 2 4-2M7 8v5M13 6l4-2 4 2v5l-4 2-4-2ZM13 6l4 2 4-2M17 8v5M8 15l4-2 4 2v5l-4 2-4-2ZM8 15l4 2 4-2M12 17v5", xl = Object.freeze([
	{
		name: "Input",
		color: "#96ad52",
		icon: yl
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
		icon: yl
	},
	{
		name: "Subgraphs",
		color: "#a3aa99",
		icon: bl
	}
].map((e) => Object.freeze(e))), Sl = {
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
	Library: bl,
	Routing: "M3 12h18m-7-7 7 7-7 7",
	Blocks: yl,
	Reflect: "M21 12s-4-7-9-7-9 7-9 7 4 7 9 7 9-7 9-7ZM15 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0",
	Internalize: "M4 4h16v16H4M8 8l4 4 4-4M12 12v5",
	Express: "M4 4h16v12H9l-5 4ZM8 8h8M8 12h5",
	Memory: "M5 3h14v18H5ZM8 7h8M8 11h8M8 15h5",
	State: "M3 12h4l3-7 4 14 3-7h4"
}, Cl = Object.freeze(Object.fromEntries(Object.entries(Sl).map(([e, t]) => [e, Object.freeze({
	name: e,
	icon: t
})]))), wl = {
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
		Sl.Planning
	],
	compose: [
		"Assembly",
		"co",
		Sl.Assembly
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
		Sl.Validation
	],
	"json-decode": [
		"Parsing",
		"jd",
		Sl.Parsing
	],
	"select-fields": [
		"Extraction",
		"sf",
		Sl.Extraction
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
		Sl.Delivery
	],
	reroute: [
		"Routing",
		"rt",
		Sl.Routing
	],
	reflect: [
		"Reflect",
		"rf",
		Sl.Reflect
	],
	internalize: [
		"Internalize",
		"in",
		Sl.Internalize
	],
	express: [
		"Express",
		"ex",
		Sl.Express
	],
	context: [
		"Context",
		"cx",
		Sl.Context
	],
	memory: [
		"Memory",
		"mm",
		Sl.Memory
	],
	state: [
		"State",
		"sv",
		Sl.State
	]
}, Tl = Object.freeze(Object.fromEntries(Object.entries(wl).map(([e, [t, n, r]]) => [e, Object.freeze({
	group: t,
	shortcode: n,
	icon: r
})]))), El = Object.freeze({
	group: "Blocks",
	shortcode: "",
	icon: yl
}), Dl = (e) => Object.hasOwn(Tl, e) ? Tl[e] : El, Ol = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-family-row\" aria-haspopup=\"menu\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path></path></svg><span> </span></button>"), kl = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\">‹ Families</button>"), Al = /* @__PURE__ */ K("<input class=\"text_pole\" aria-label=\"Search nodes\" placeholder=\"Search nodes…\"/>"), jl = /* @__PURE__ */ K("<div class=\"pc-shelf-group svelte-hk6fzp\" role=\"presentation\"> </div>"), Ml = /* @__PURE__ */ K("<!> <button type=\"button\" role=\"menuitem\" class=\"svelte-hk6fzp\"><svg class=\"pc-leaf-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path></path></svg><span class=\"pc-catalog-name\"> </span><small> </small></button>", 1), Nl = /* @__PURE__ */ K("<div role=\"menu\" tabindex=\"-1\"><!> <!> <!></div>"), Pl = /* @__PURE__ */ K("<div class=\"pc-shelf-menu pc-shelf-subgraph-menu svelte-hk6fzp\" role=\"menu\" tabindex=\"-1\"><button type=\"button\" role=\"menuitem\" data-shelf-subgraph-action=\"open\">Open saved definition</button> <button type=\"button\" role=\"menuitem\" data-shelf-subgraph-action=\"delete\">Delete</button></div>"), Fl = /* @__PURE__ */ K("<div class=\"pc-shelf-drag-preview svelte-hk6fzp\" aria-hidden=\"true\"> </div>"), Il = /* @__PURE__ */ K("<nav aria-label=\"Node families\"></nav> <!> <!> <!>", 1);
function Ll(e, t) {
	Ue(t, !0);
	let n = ji(t, "choices", 19, () => []), r = ji(t, "readOnly", 3, !1), i, a = /* @__PURE__ */ L(null), o = /* @__PURE__ */ L(""), s = /* @__PURE__ */ L(!1), c = /* @__PURE__ */ L(""), l = /* @__PURE__ */ L(!1), u = /* @__PURE__ */ L(0), d = /* @__PURE__ */ L(0), f = null, p = 0, m = /* @__PURE__ */ L(null), h = /* @__PURE__ */ L(null), g = null, _ = xl.map((e) => e.name), v = (e) => xl.find((t) => t.name === e)?.color, y = null, b = null, x = null, S = /* @__PURE__ */ L(null);
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
			let i = n.id.startsWith("operation:") ? n.id.split(":")[1] : "", a = Dl(i), o = i ? n.label.split(" · ")[0] : n.label, s = n.id.startsWith("boundary:");
			return {
				...n,
				title: o,
				compatible: !n.disabledReason && !!t.choose,
				shortcode: i ? a.shortcode || n.shortcode || "" : n.shortcode ?? a.shortcode,
				group: e === "Subgraphs" ? s ? "Interface" : "Library" : void 0,
				icon: e === "Subgraphs" ? s ? Cl.Routing.icon : Cl.Library.icon : a.icon,
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
	Sn(() => (t.view?.graphId, n(), r(), () => j()));
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
		}, c.width, c.height, 128);
		R(u, m.x, !0), R(d, m.y, !0), R(l, m.compact, !0), n && U(a).querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
	}
	async function ie() {
		let e = ++p;
		if (R(o, ""), R(s, !0), R(c, ""), await pr(), e !== p || !U(s) || !U(a)?.isConnected) return;
		let t = ee();
		R(u, Math.min(136, Math.max(4, t.width - 254)), !0), R(d, 13), U(a).querySelector("input")?.focus();
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
	var ue = { openSearch: ie }, de = Il();
	W("pointerdown", rn, (e) => {
		e.target.closest(".pc-node-shelf, .pc-shelf-menu") || j();
	}), W("pointermove", rn, E), W("pointerup", rn, D), W("pointercancel", rn, () => C()), W("blur", rn, () => j()), W("resize", rn, () => j()), W("keydown", rn, (e) => {
		y && e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), j(!0));
	});
	var fe = B(de);
	X(fe, 21, () => xl, Kr, (e, t) => {
		var n = Ol();
		let r;
		var i = z(n), a = z(i);
		P(i);
		var s = V(i), c = z(s, !0);
		P(s), P(n), H((e) => {
			Q(n, "data-family", U(t).name), n.disabled = e, Q(n, "title", "Browse " + U(t).name + " nodes"), Q(n, "aria-expanded", U(o) === U(t).name), r = pi(n, "", r, { "--pc-family": U(t).color }), Q(a, "d", U(t).icon), J(c, U(t).name);
		}, [() => !k(U(t).name).length]), G("click", n, (e) => re(U(t).name, e.currentTarget)), W("pointerenter", n, (e) => {
			e.pointerType !== "touch" && !e.currentTarget.disabled && re(U(t).name, e.currentTarget, !1);
		}), G("keydown", n, le), q(e, n);
	}), P(fe), $(fe, (e) => i = e, () => i);
	var pe = V(fe, 2), me = (e) => {
		let n = /* @__PURE__ */ F(() => U(s) ? _.flatMap((e) => k(e)).filter((e) => [
			e.title,
			e.id,
			e.family,
			e.purpose,
			e.shortcode,
			...e.searchAliases ?? []
		].join(" ").toLowerCase().includes(U(c).toLowerCase())) : k());
		var i = Nl();
		let f;
		var p = z(i), m = (e) => {
			var t = kl();
			G("click", t, () => j(!0)), q(e, t);
		};
		Y(p, (e) => {
			U(l) && U(o) && e(m);
		});
		var h = V(p, 2), g = (e) => {
			var t = Al();
			Z(t), Di(t, () => U(c), (e) => R(c, e)), q(e, t);
		};
		Y(h, (e) => {
			U(s) && e(g);
		}), X(V(h, 2), 19, () => U(n), (e) => e.family + e.id, (e, i, a) => {
			let o = /* @__PURE__ */ F(() => !U(i).compatible || r()), c = /* @__PURE__ */ F(() => !!U(i).definitionRef && !!t.shelfSubgraph);
			var l = Ml(), u = B(l), d = (e) => {
				var t = jl(), n = z(t, !0);
				P(t), H(() => {
					Q(t, "data-shelf-group", U(i).group), J(n, U(i).group);
				}), q(e, t);
			};
			Y(u, (e) => {
				!U(s) && U(i).group && U(n)[U(a) - 1]?.group !== U(i).group && e(d);
			});
			var f = V(u, 2);
			let p;
			var m = z(f), h = z(m);
			P(m);
			var g = V(m), _ = z(g, !0);
			P(g);
			var y = V(g), b = z(y, !0);
			P(y), P(f), H((e) => {
				Q(f, "data-shelf-choice", U(i).id), Q(f, "data-insertion-disabled", U(o)), f.disabled = U(o) && !U(c), Q(f, "aria-disabled", U(o) && !U(c)), Q(f, "aria-haspopup", U(c) ? "menu" : void 0), Q(f, "title", r() ? U(c) ? "This graph is read-only. Right-click for subgraph actions." : "This graph is read-only." : U(i).disabledReason || (U(i).compatible ? U(i).purpose || "Add " + U(i).title : "Requires the " + U(i).phase + " phase")), p = pi(f, "", p, e), Q(h, "d", U(i).icon), J(_, U(i).title), J(b, U(i).shortcode);
			}, [() => ({ "--pc-family": v(U(i).family) })]), G("pointerdown", f, (e) => T(e, U(i))), W("lostpointercapture", f, () => C()), G("click", f, (e) => O(e, U(i))), q(e, l);
		}), P(i), $(i, (e) => R(a, e), () => U(a)), H((e) => {
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
		var t = Pl();
		let n;
		var r = z(t), i = V(r, 2);
		P(t), $(t, (e) => R(h, e), () => U(h)), H(() => {
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
		var t = Fl();
		let n;
		var r = z(t, !0);
		P(t), H((e) => {
			n = pi(t, "", n, e), J(r, U(S).title);
		}, [() => ({
			"--pc-family": v(U(S).family),
			left: `${U(S).x + 12}px`,
			top: `${U(S).y + 12}px`
		})]), q(e, t);
	};
	return Y(_e, (e) => {
		U(S) && e(ve);
	}), H(() => di(fe, 1, `pc-node-shelf${U(l) && U(o) ? " pc-shelf-replaced" : ""}`, "svelte-hk6fzp")), q(e, de), We(ue);
}
Tr([
	"click",
	"keydown",
	"contextmenu",
	"pointerdown"
]);
//#endregion
//#region ui/ExamplesBrowser.svelte
var Rl = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-btn menu_button svelte-18p7ib8\">Retry</button>"), zl = /* @__PURE__ */ K("<div class=\"pc-examples-issue svelte-18p7ib8\" role=\"alert\"><span class=\"svelte-18p7ib8\"> </span><!></div>"), Bl = /* @__PURE__ */ K("<option> </option>"), Vl = /* @__PURE__ */ K("<li class=\"svelte-18p7ib8\"> </li>"), Hl = /* @__PURE__ */ K("<li data-checkpoint=\"\" class=\"svelte-18p7ib8\"><strong> </strong><span class=\"svelte-18p7ib8\"> </span></li>"), Ul = /* @__PURE__ */ K("<li class=\"svelte-18p7ib8\"><strong> </strong><span class=\"svelte-18p7ib8\"> </span></li>"), Wl = /* @__PURE__ */ K("<p class=\"pc-example-focus svelte-18p7ib8\"><strong> </strong> </p> <h4 class=\"svelte-18p7ib8\">Learn</h4><ul class=\"svelte-18p7ib8\"></ul> <h4 class=\"svelte-18p7ib8\">Setup</h4><ul class=\"svelte-18p7ib8\"></ul> <h4 class=\"svelte-18p7ib8\">Try the lesson</h4><ol class=\"svelte-18p7ib8\"></ol> <h4 class=\"svelte-18p7ib8\">Checkpoints</h4><ul class=\"svelte-18p7ib8\"></ul> <h4 class=\"svelte-18p7ib8\">Experiments</h4><ul class=\"svelte-18p7ib8\"></ul> <h4 class=\"svelte-18p7ib8\">Expected cases</h4><ul class=\"svelte-18p7ib8\"></ul> <p class=\"svelte-18p7ib8\"><strong>Auxiliary call budget:</strong> </p>", 1), Gl = /* @__PURE__ */ K("<p class=\"pc-example-detail-issue svelte-18p7ib8\" role=\"alert\"> </p>"), Kl = /* @__PURE__ */ K("<section class=\"pc-example-details svelte-18p7ib8\"><header class=\"svelte-18p7ib8\"><h3 tabindex=\"-1\" class=\"svelte-18p7ib8\"> </h3><button type=\"button\" class=\"pc-btn menu_button\" aria-label=\"Close lesson details\">Close</button></header> <p class=\"svelte-18p7ib8\"> </p> <!> <!> <button type=\"button\" class=\"pc-btn menu_button\">Open independent copy</button></section>"), ql = /* @__PURE__ */ K("<p class=\"pc-examples-empty svelte-18p7ib8\">No lessons match your search and difficulty.</p>"), Jl = /* @__PURE__ */ Pr("<g class=\"pc-example-group svelte-18p7ib8\"><rect rx=\"6\" class=\"svelte-18p7ib8\"></rect><text class=\"svelte-18p7ib8\"> </text></g>"), Yl = /* @__PURE__ */ Pr("<g class=\"pc-example-comment svelte-18p7ib8\"><rect rx=\"4\" class=\"svelte-18p7ib8\"></rect><text class=\"svelte-18p7ib8\"> </text></g>"), Xl = /* @__PURE__ */ Pr("<path class=\"pc-wire pc-wire-native\"></path>"), Zl = /* @__PURE__ */ Pr("<!><text class=\"pc-example-pin-label svelte-18p7ib8\"> </text>", 1), Ql = /* @__PURE__ */ Pr("<g><rect class=\"pc-example-card svelte-18p7ib8\" rx=\"4\"></rect><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\"><path class=\"pc-example-icon svelte-18p7ib8\"></path></svg><text class=\"pc-example-node-title svelte-18p7ib8\" lengthAdjust=\"spacingAndGlyphs\"> </text><!></g>"), $l = /* @__PURE__ */ Pr("<svg class=\"pc-example-preview svelte-18p7ib8\" preserveAspectRatio=\"xMidYMid meet\" aria-hidden=\"true\" focusable=\"false\"><!><!><!><!></svg>"), eu = /* @__PURE__ */ K("<span class=\"pc-example-unavailable-preview svelte-18p7ib8\"><strong class=\"svelte-18p7ib8\">Unavailable</strong><span class=\"svelte-18p7ib8\"> </span></span>"), tu = /* @__PURE__ */ K("<span class=\"pc-example-band svelte-18p7ib8\"> </span>"), nu = /* @__PURE__ */ K("<article class=\"pc-example-entry svelte-18p7ib8\"><button type=\"button\"><!> <span class=\"pc-example-title svelte-18p7ib8\"> </span> <!> <span class=\"pc-example-goal svelte-18p7ib8\"> </span></button> <button type=\"button\" class=\"pc-example-details-button svelte-18p7ib8\">Lesson details</button></article>"), ru = /* @__PURE__ */ K("<!> <div class=\"pc-examples-filters svelte-18p7ib8\"><label class=\"svelte-18p7ib8\">Search lessons<input aria-label=\"Search lessons\" type=\"search\" placeholder=\"Goal, node or technique\" class=\"svelte-18p7ib8\"/></label> <label class=\"svelte-18p7ib8\">Difficulty<select aria-label=\"Difficulty\" class=\"svelte-18p7ib8\"><option>All difficulties</option><!></select></label> <span class=\"pc-examples-count svelte-18p7ib8\" role=\"status\"> </span></div> <div class=\"pc-examples-grid svelte-18p7ib8\"><!> <!> <!></div>", 1);
function iu(e, t) {
	Ue(t, !0);
	let n = ji(t, "examples", 19, () => []), r = ji(t, "issue", 3, ""), i = ji(t, "scrollTop", 3, 0), a, o = /* @__PURE__ */ L(void 0), s = /* @__PURE__ */ L(void 0), c = /* @__PURE__ */ L(""), l = /* @__PURE__ */ L(""), u = /* @__PURE__ */ L(""), d = /* @__PURE__ */ L(""), f = [
		"Foundations",
		"Composition",
		"Advanced",
		"Capstone"
	], p = /* @__PURE__ */ F(() => n().filter((e) => {
		if (U(u) && e.lesson?.difficulty !== U(u)) return !1;
		let t = U(l).toLocaleLowerCase().trim().split(/\s+/).filter(Boolean), n = [
			e.number,
			e.title,
			e.goal,
			JSON.stringify(e.lesson ?? {}),
			...e.thumbnail?.nodes.map((e) => e.title) ?? []
		].join(" ").toLocaleLowerCase();
		return t.every((e) => n.includes(e));
	})), m = /* @__PURE__ */ F(() => n().find((e) => e.id === U(d)));
	Mi(() => {
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
	var v = ru(), y = B(v), b = (e) => {
		var n = zl(), i = z(n), a = z(i, !0);
		P(i);
		var o = V(i), s = (e) => {
			var n = Rl();
			G("click", n, () => t.retry?.()), q(e, n);
		};
		Y(o, (e) => {
			t.retry && e(s);
		}), P(n), H(() => J(a, r())), q(e, n);
	};
	Y(y, (e) => {
		r() && e(b);
	});
	var x = V(y, 2), S = z(x), C = V(z(S));
	Z(C), $(C, (e) => R(s, e), () => U(s)), P(S);
	var w = V(S, 2), T = V(z(w)), E = z(T);
	E.value = E.__value = "", X(V(E), 17, () => f, Kr, (e, t) => {
		var n = Bl(), r = z(n, !0);
		P(n);
		var i = {};
		H(() => {
			J(r, U(t)), i !== (i = U(t)) && (n.value = (n.__value = U(t)) ?? "");
		}), q(e, n);
	}), P(T), P(w);
	var D = V(w, 2), O = z(D);
	P(D), P(x);
	var k = V(x, 2), A = z(k), j = (e) => {
		var t = Kl(), n = z(t), r = z(n), i = z(r);
		P(r), $(r, (e) => R(o, e), () => U(o));
		var a = V(r);
		P(n);
		var s = V(n, 2), l = z(s, !0);
		P(s);
		var u = V(s, 2), d = (e) => {
			var t = Wl(), n = B(t), r = z(n), i = z(r, !0);
			P(r);
			var a = V(r);
			P(n);
			var o = V(n, 3);
			X(o, 21, () => U(m).lesson.learn, Kr, (e, t) => {
				var n = Vl(), r = z(n, !0);
				P(n), H(() => J(r, U(t))), q(e, n);
			}), P(o);
			var s = V(o, 3);
			X(s, 21, () => U(m).lesson.requirements, Kr, (e, t) => {
				var n = Vl(), r = z(n, !0);
				P(n), H(() => J(r, U(t))), q(e, n);
			}), P(s);
			var c = V(s, 3);
			X(c, 21, () => U(m).lesson.steps, Kr, (e, t) => {
				var n = Vl(), r = z(n, !0);
				P(n), H(() => J(r, U(t))), q(e, n);
			}), P(c);
			var l = V(c, 3);
			X(l, 21, () => U(m).lesson.checkpoints, Kr, (e, t) => {
				var n = Hl(), r = z(n), i = z(r);
				P(r);
				var a = V(r), o = z(a, !0);
				P(a), P(n), H(() => {
					J(i, `${U(t).node ?? ""} → ${U(t).port ?? ""}`), J(o, U(t).expect);
				}), q(e, n);
			}), P(l);
			var u = V(l, 3);
			X(u, 21, () => U(m).lesson.experiments, Kr, (e, t) => {
				var n = Ul(), r = z(n), i = z(r, !0);
				P(r);
				var a = V(r), o = z(a, !0);
				P(a), P(n), H(() => {
					J(i, U(t).change), J(o, U(t).expect);
				}), q(e, n);
			}), P(u);
			var d = V(u, 3);
			X(d, 21, () => U(m).lesson.cases, Kr, (e, t) => {
				var n = Ul(), r = z(n), i = z(r, !0);
				P(r);
				var a = V(r), o = z(a, !0);
				P(a), P(n), H(() => {
					J(i, U(t).when), J(o, U(t).expect);
				}), q(e, n);
			}), P(d);
			var f = V(d, 2), p = V(z(f));
			P(f), H(() => {
				J(i, U(m).lesson.difficulty), J(a, ` · ${U(m).lesson.focus ?? ""}`), J(p, ` ${U(m).lesson.callBudget ?? ""}`);
			}), q(e, t);
		};
		Y(u, (e) => {
			U(m).lesson && e(d);
		});
		var f = V(u, 2), p = (e) => {
			var t = Gl(), n = z(t, !0);
			P(t), H(() => J(n, U(m).issue)), q(e, t);
		};
		Y(f, (e) => {
			U(m).issue && e(p);
		});
		var h = V(f, 2);
		P(t), H(() => {
			Q(t, "aria-label", `Lesson ${U(m).number} details`), J(i, `${U(m).number ?? ""}. ${U(m).title ?? ""}`), J(l, U(m).goal), h.disabled = !!U(c) || !U(m).thumbnail;
		}), G("click", a, () => g(U(m).id)), G("click", h, () => _(U(m).id)), q(e, t);
	};
	Y(A, (e) => {
		U(m) && e(j);
	});
	var ee = V(A, 2), te = (e) => {
		q(e, ql());
	};
	Y(ee, (e) => {
		U(p).length || e(te);
	}), X(V(ee, 2), 17, () => U(p), (e) => e.id, (e, t) => {
		let n = /* @__PURE__ */ F(() => U(t).thumbnail);
		var r = nu(), i = z(r);
		let a;
		var o = z(i), s = (e) => {
			var t = $l(), r = z(t);
			X(r, 17, () => U(n).groups, (e) => e.id, (e, t) => {
				var n = Jl(), r = z(n), i = V(r), a = z(i, !0);
				P(i), P(n), H(() => {
					Q(n, "data-id", U(t).id), Q(r, "x", U(t).x), Q(r, "y", U(t).y), Q(r, "width", U(t).w), Q(r, "height", U(t).h), Q(i, "x", U(t).x + 12), Q(i, "y", U(t).y + 24), J(a, U(t).title);
				}), q(e, n);
			});
			var i = V(r);
			X(i, 17, () => U(n).comments, (e) => e.id, (e, t) => {
				var n = Yl(), r = z(n);
				let i;
				var a = V(r), o = z(a, !0);
				P(a), P(n), H(() => {
					Q(n, "data-id", U(t).id), Q(r, "x", U(t).x), Q(r, "y", U(t).y), Q(r, "width", U(t).w), Q(r, "height", U(t).h), i = pi(r, "", i, { stroke: U(t).color }), Q(a, "x", U(t).x + 12), Q(a, "y", U(t).y + 24), J(o, U(t).title);
				}), q(e, n);
			});
			var a = V(i);
			X(a, 17, () => U(n).wires, (e) => e.id, (e, t) => {
				var n = Xl();
				H(() => {
					Q(n, "data-kind", U(t).kind), Q(n, "data-id", U(t).id), Q(n, "d", U(t).d);
				}), q(e, n);
			}), X(V(a), 17, () => U(n).nodes, (e) => e.id, (e, t) => {
				var n = Ql(), r = z(n), i = V(r), a = z(i);
				P(i);
				var o = V(i), s = z(o, !0);
				P(o), X(V(o), 17, () => U(t).ports, (e) => e.id, (e, t) => {
					var n = Zl(), r = B(n);
					{
						let e = /* @__PURE__ */ F(() => U(t).x - 9), n = /* @__PURE__ */ F(() => U(t).y - 9);
						Bi(r, {
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
					P(i), H(() => {
						Q(i, "x", U(t).x + (U(t).dir === "in" ? 9 : -9)), Q(i, "y", U(t).y + 4), Q(i, "text-anchor", U(t).dir === "in" ? "start" : "end"), J(a, U(t).label);
					}), q(e, n);
				}), P(n), H(() => {
					di(n, 0, ai(U(t).className), "svelte-18p7ib8"), Q(n, "data-id", U(t).id), Q(r, "x", U(t).x), Q(r, "y", U(t).y), Q(r, "width", U(t).w), Q(r, "height", U(t).h), Q(i, "x", U(t).x + 8), Q(i, "y", U(t).y + 7), Q(a, "d", U(t).iconPath), Q(o, "x", U(t).x + 28), Q(o, "y", U(t).y + 20), Q(o, "textLength", U(t).title.length * 6 > U(t).w - 36 ? U(t).w - 36 : void 0), J(s, U(t).title);
				}), q(e, n);
			}), P(t), H(() => Q(t, "viewBox", `${U(n).bounds.x} ${U(n).bounds.y} ${U(n).bounds.w} ${U(n).bounds.h}`)), q(e, t);
		}, l = (e) => {
			var n = eu(), r = V(z(n)), i = z(r, !0);
			P(r), P(n), H(() => {
				Q(r, "id", `pc-example-issue-${U(t).number}`), J(i, U(t).issue);
			}), q(e, n);
		};
		Y(o, (e) => {
			U(n) ? e(s) : e(l, -1);
		});
		var u = V(o, 2), f = z(u);
		P(u);
		var p = V(u, 2), m = (e) => {
			var n = tu(), r = z(n);
			P(n), H(() => J(r, `${U(t).lesson.difficulty ?? ""} · ${U(t).lesson.focus ?? ""}`)), q(e, n);
		};
		Y(p, (e) => {
			U(t).lesson && e(m);
		});
		var g = V(p, 2), v = z(g, !0);
		P(g), P(i);
		var y = V(i, 2);
		P(r), H(() => {
			a = di(i, 1, "pc-example-tile svelte-18p7ib8", null, a, { "pc-example-unavailable": !U(n) }), Q(i, "aria-label", U(t).title), Q(i, "aria-describedby", U(t).issue ? `pc-example-issue-${U(t).number}` : void 0), Q(i, "title", U(t).issue || U(t).goal), i.disabled = !!U(c) || !U(n), J(f, `${U(t).number ?? ""}. ${U(t).title ?? ""}`), J(v, U(t).goal), Q(y, "data-example-id", U(t).id), Q(y, "aria-label", `Details for ${U(t).title}`), Q(y, "aria-expanded", U(d) === U(t).id);
		}), G("click", i, () => _(U(t).id)), G("click", y, () => h(U(t).id)), q(e, r);
	}), P(k), $(k, (e) => a = e, () => a), H(() => {
		J(O, `${U(p).length ?? ""} of ${n().length ?? ""} lessons`), Q(k, "aria-busy", !!U(c));
	}), Di(C, () => U(l), (e) => R(l, e)), gi(T, () => U(u), (e) => R(u, e)), W("scroll", k, (e) => t.scroll(e.currentTarget.scrollTop)), q(e, v), We();
}
Tr(["click"]);
//#endregion
//#region ui/ImportReview.svelte
var au = /* @__PURE__ */ K("<p> </p>"), ou = /* @__PURE__ */ K("<li> </li>"), su = /* @__PURE__ */ K("<h3>Saved bindings to review</h3><ul></ul>", 1), cu = /* @__PURE__ */ K("<p>Saved model metadata is present. Review local connections before running.</p>"), lu = /* @__PURE__ */ K("<h3>Imported terminal effects</h3><ul></ul>", 1), uu = /* @__PURE__ */ K("<p>No imported terminal effects.</p>"), du = /* @__PURE__ */ K("<p role=\"alert\"> </p>"), fu = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-btn menu_button\">Prepare again</button>"), pu = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay pc-import-overlay\"><div class=\"pc-workspace-dialog pc-import-review\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Import into graph\" tabindex=\"-1\"><header><h2>Import into graph</h2><button type=\"button\" class=\"pc-btn menu_button\" aria-label=\"Cancel import\">×</button></header> <p><strong> </strong> <small> </small></p> <dl><dt>Phase</dt><dd> </dd><dt>Additions</dt><dd> </dd><dt>Conservative request bound</dt><dd> </dd></dl> <p class=\"pc-import-explanation\">This authoring bound includes unfinished branches. Bindings and reachable execution are checked when you explicitly run the workflow.</p> <!> <!> <!> <p>Insertion keeps internal wiring and relative layout. It does not connect matching names, arm or assign the graph, run requests, publish Guidance, or Apply a reply.</p> <!> <footer><button type=\"button\" class=\"pc-btn menu_button\">Cancel</button><!><button type=\"button\" class=\"pc-btn menu_button pc-import-accept\">Insert into graph</button></footer></div></div>");
function mu(e, t) {
	Ue(t, !0);
	let n;
	Mi(() => {
		let e = document.activeElement;
		return n.querySelector("button")?.focus(), () => e?.focus({ preventScroll: !0 });
	});
	function r(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), t.actions.cancelImport?.()), e.key === "Tab") {
			let t = [...n.querySelectorAll("button:not(:disabled)")], r = t[0], i = t.at(-1);
			e.shiftKey && document.activeElement === r && (e.preventDefault(), i?.focus()), !e.shiftKey && document.activeElement === i && (e.preventDefault(), r?.focus());
		}
	}
	var i = pu(), a = z(i), o = z(a), s = V(z(o));
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
		var n = au(), r = z(n);
		P(n), H((e) => J(r, `Imported model roles: ${e ?? ""}.`), [() => t.view.requiredRoles.join(", ")]), q(e, n);
	};
	Y(b, (e) => {
		t.view.requiredRoles.length && e(x);
	});
	var S = V(b, 2), C = (e) => {
		var n = su(), r = V(B(n));
		X(r, 21, () => t.view.unresolvedBindings, Kr, (e, t) => {
			var n = ou(), r = z(n);
			P(n), H((e) => J(r, `${U(t).title ?? ""} · ${U(t).role ?? ""}: missing ${e ?? ""}`), [() => U(t).missing.join(" and ")]), q(e, n);
		}), P(r), q(e, n);
	}, w = (e) => {
		q(e, cu());
	};
	Y(S, (e) => {
		t.view.unresolvedBindings.length ? e(C) : t.view.bindingReviewRequired && e(w, 1);
	});
	var T = V(S, 2), E = (e) => {
		var n = lu(), r = V(B(n));
		X(r, 21, () => t.view.terminals, Kr, (e, t) => {
			var n = ou(), r = z(n);
			P(n), H(() => J(r, `${U(t).title ?? ""} · ${U(t).operation ?? ""}`)), q(e, n);
		}), P(r), q(e, n);
	}, D = (e) => {
		q(e, uu());
	};
	Y(T, (e) => {
		t.view.terminals.length ? e(E) : e(D, -1);
	});
	var O = V(T, 4), k = (e) => {
		var n = du(), r = z(n, !0);
		P(n), H(() => J(r, t.view.error)), q(e, n);
	};
	Y(O, (e) => {
		t.view.error && e(k);
	});
	var A = V(O, 2), j = z(A), ee = V(j), te = (e) => {
		var n = fu();
		G("click", n, () => t.actions.prepareImportAgain?.()), q(e, n);
	};
	Y(ee, (e) => {
		t.view.error && e(te);
	});
	var ne = V(ee);
	P(A), P(a), $(a, (e) => n = e, () => n), P(i), H(() => {
		J(u, t.view.name), J(f, t.view.fileName), J(h, t.view.phase), J(_, `${t.view.nodeCount ?? ""} blocks · ${t.view.wireCount ?? ""} wires · ${t.view.groupCount ?? ""} groups`), J(y, `${t.view.callBound ?? ""} total · ${t.view.importedCallBound ?? ""} imported`), ne.disabled = !!t.view.error;
	}), G("keydown", a, r), W("paste", a, (e) => e.stopPropagation()), G("click", s, () => t.actions.cancelImport?.()), G("click", j, () => t.actions.cancelImport?.()), G("click", ne, () => t.actions.acceptImport?.()), q(e, i), We();
}
Tr(["keydown", "click"]);
//#endregion
//#region ui/Workbench.svelte
var hu = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-recall-badge\"> </button>"), gu = /* @__PURE__ */ K("<p class=\"pc-native-diagnostic svelte-1dr9aew\" role=\"alert\"> </p>"), _u = /* @__PURE__ */ K("<p>Browse node families on the floating shelf. Middle mouse pans the graph; the wheel zooms around the pointer. Use the divider or its arrow keys to resize Preview.</p><p>Open examples and assign a unified workflow from Workflows. Its preparation stage feeds Generate Reply, and its response stage reshapes the captured Draft before Review / Publish. Select model nodes to choose a text connection profile in Details. Fast Decision uses a configured typed connection from Tools › Fast connections and an optional separately selected Decision fallback. Arm enables the assigned host workflow. Unified generation starts with Send in SillyTavern; Run to here tests supported nodes.</p><p>File › Open workflow chooses a JSON file and opens a separate workflow. Save workflow keeps committed edits and connections in SillyTavern. Export workflow JSON downloads a portable sharing copy without local connections. Import into graph reviews a compatible fragment before one undoable insertion.</p><p>Select nodes and right-click Create Subgraph to open their connected body in a new tab. Double-click a subgraph to open it. Add Input and Output nodes from the Subgraphs shelf inside an editable subgraph, then name and configure their ports in Details.</p><p>Right-click a subgraph block and choose Add to Subgraphs to save it for reuse. Right-click a saved shelf entry to delete it. Saving updates the shelf only when you choose to save; existing placed copies stay unchanged. Portals connect pins through named references. Preview artifact tabs show results for the selected node; Run to here checks the request bound before running. Apply reviews the fresh result against the full root workflow.</p>", 1), vu = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay\"><div role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\"><header class=\"svelte-1dr9aew\"><h2 class=\"svelte-1dr9aew\"> </h2><button type=\"button\" class=\"pc-btn menu_button\" aria-label=\"Close panel\">×</button></header> <!></div></div>"), yu = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay\"><div class=\"pc-manager-dialog svelte-1dr9aew\" role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\" aria-label=\"Manage portals\"><!></div></div>"), bu = /* @__PURE__ */ K("<div role=\"dialog\" aria-modal=\"true\" aria-label=\"Lattice\" data-pc-workbench=\"svelte\"><!> <!> <div class=\"pc-body\" role=\"region\" aria-label=\"Workspace panels\" tabindex=\"0\"><div class=\"pc-stage\"><section aria-label=\"Output preview\"><header class=\"pc-preview-pane-head\"><strong>Preview</strong><button type=\"button\" class=\"pc-btn menu_button\"> </button></header> <div class=\"pc-preview-content\"><!></div></section> <!> <!> <!> <div class=\"pc-canvas-area\" id=\"pc-workspace-graph\" role=\"tabpanel\"><div class=\"pc-workspace-run svelte-1dr9aew\"><!></div> <div class=\"pc-canvas-host\" aria-label=\"Node canvas\"></div> <!> <!></div></div> <!> <div class=\"pc-inspector pc-workspace-details svelte-1dr9aew\"><header class=\"pc-details-heading svelte-1dr9aew\"><strong class=\"svelte-1dr9aew\">Details</strong><button type=\"button\" class=\"svelte-1dr9aew\">Portals</button></header> <!> <div class=\"pc-node-details-holder svelte-1dr9aew\"><!></div></div></div> <!> <!> <!> <!> <!> <!> <!> <!></div>");
function xu(e, t) {
	Ue(t, !0);
	let n = ji(t, "actions", 7), r = /* @__PURE__ */ L({
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
			...U(r),
			...e
		}), e.fastConnectionsActive === !0 ? ie("fast-connections") : e.fastConnectionsActive === !1 && U(E) === "fast-connections" && ae();
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
				collapsed: e?.collapsed === !0
			};
		} catch {
			return {
				height: 240,
				collapsed: !1
			};
		}
	}
	let v = _(), y = /* @__PURE__ */ L(en(v.height)), b = /* @__PURE__ */ L(en(v.collapsed)), x = /* @__PURE__ */ L(500), S = /* @__PURE__ */ L(null), C = /* @__PURE__ */ L(520), w = /* @__PURE__ */ F(() => Math.max(220, Math.min(U(C), U(S) ?? U(r).detailsWidth ?? 258)));
	function T(e) {
		R(S, null), R(r, {
			...U(r),
			detailsWidth: e
		}), n().resizeDetails?.(e);
	}
	let E = /* @__PURE__ */ L(""), D = /* @__PURE__ */ L(null), O = null, k = 0, A = /* @__PURE__ */ L(0), j;
	function ee() {
		try {
			localStorage.setItem(g, JSON.stringify({
				height: U(y),
				collapsed: U(b)
			}));
		} catch {}
	}
	function te() {
		n().resizeStart?.();
	}
	function ne(e) {
		te(), R(b, e, !0), ee();
	}
	function re() {
		ne(!1);
	}
	async function ie(e) {
		if (e === "show-preview") ne(!1);
		else if (e === "collapse-preview") ne(!0);
		else if (e === "add-node") j.openSearch();
		else {
			O = document.activeElement, e === "examples" && n().refreshExamples?.(), e === "fast-connections" && n().fastConnections?.refresh?.(), e === "story-documents" && n().storyDocuments?.refresh?.(), e === "recall-arms" && n().recallArms?.refresh?.();
			let t = ++k;
			R(E, e, !0), await pr(), t === k && U(E) === e && U(D)?.querySelector("button")?.focus();
		}
	}
	function ae() {
		k++, R(E, ""), O?.focus({ preventScroll: !0 });
	}
	async function oe(e) {
		let t = k;
		try {
			let r = await n().openExample?.(e);
			return r === !0 && t === k && U(E) === "examples" && ae(), r === !0;
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
			let t = [...U(D).querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex=\"0\"]")], n = t[0], r = t.at(-1);
			e.shiftKey && document.activeElement === n && (e.preventDefault(), r?.focus()), !e.shiftKey && document.activeElement === r && (e.preventDefault(), n?.focus());
		}
	}
	Mi(() => {
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
	}, ue = bu();
	let de, fe;
	var pe = z(ue);
	$(Ca(pe, {
		get state() {
			return U(r);
		},
		get actions() {
			return n();
		},
		local: ie
	}), (e) => l = e, () => l);
	var me = V(pe, 2), he = (e) => {
		var t = hu(), n = z(t);
		P(t), H((e) => J(n, `Recall armed · ${e ?? ""}`), [() => U(r).recallArms.nodes.filter((e) => e.armed).length]), G("click", t, () => ie("recall-arms")), q(e, t);
	}, ge = /* @__PURE__ */ F(() => U(r).recallArms?.nodes.some((e) => e.armed));
	Y(me, (e) => {
		U(ge) && e(he);
	});
	var _e = V(me, 2), ve = z(_e), ye = z(ve);
	let be, xe;
	var Se = z(ye), Ce = V(z(Se)), we = z(Ce, !0);
	P(Ce), P(Se);
	var Te = V(Se, 2), Ee = z(Te);
	{
		let e = /* @__PURE__ */ F(() => U(r).outputPreview ?? null);
		Ns(Ee, {
			get view() {
				return U(e);
			},
			get actions() {
				return n().outputPreview;
			},
			collapse: () => ne(!0)
		});
	}
	P(Te), P(ye);
	var De = V(ye, 2), Oe = (e) => {
		{
			let t = /* @__PURE__ */ F(() => Math.min(U(y), U(x)));
			Ta(e, {
				get height() {
					return U(t);
				},
				get max() {
					return U(x);
				},
				start: te,
				change: (e) => {
					R(y, e, !0), ee();
				}
			});
		}
	};
	Y(De, (e) => {
		U(b) || e(Oe);
	});
	var M = V(De, 2);
	$(La(M, {
		get views() {
			return U(r).graphViews;
		},
		get actions() {
			return n().graphViewActions;
		},
		panelId: "pc-workspace-graph"
	}), (e) => u = e, () => u);
	var ke = V(M, 2);
	{
		let e = /* @__PURE__ */ F(() => U(r).graphViews?.active);
		Ha(ke, {
			get view() {
				return U(e);
			},
			get actions() {
				return n().graphViewActions;
			}
		});
	}
	var N = V(ke, 2), Ae = z(N), je = z(Ae);
	{
		let e = /* @__PURE__ */ F(() => U(r).runMeter ?? null);
		qs(je, {
			get view() {
				return U(e);
			},
			open: () => {
				R(E, "run-details");
			}
		});
	}
	P(Ae);
	var Ne = V(Ae, 2);
	$(Ne, (e) => o = e, () => o);
	var Pe = V(Ne, 2), Fe = (e) => {
		var t = gu(), n = z(t, !0);
		P(t), H(() => J(n, U(r).nativeDiagnostic)), q(e, t);
	};
	Y(Pe, (e) => {
		U(r).nativeDiagnostic && e(Fe);
	}), $(Ll(V(Pe, 2), {
		get view() {
			return U(r).workflow;
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
	}), (e) => j = e, () => j), P(N), P(ve), $(ve, (e) => s = e, () => s);
	var Ie = V(ve, 2), Le = (e) => {
		var t = Ir();
		Gr(B(t), () => U(r).graphViews?.active.key ?? U(r).graphId, (e) => {
			Da(e, {
				get width() {
					return U(w);
				},
				get max() {
					return U(C);
				},
				start: te,
				preview: (e) => R(S, e, !0),
				change: T
			});
		}), q(e, t);
	};
	Y(Ie, (e) => {
		U(r).inspectorOpen && e(Le);
	});
	var Re = V(Ie, 2), ze = z(Re), Be = V(z(ze));
	P(ze);
	var Ve = V(ze, 2), He = (e) => {
		let t = /* @__PURE__ */ F(() => U(r).commentDetails);
		hs(e, {
			get comment() {
				return U(t).comment;
			},
			onPatch: (e) => n().commentDetails?.patch(U(t).selection, e),
			onCommand: (e) => n().commentDetails?.command(U(t).selection, e)
		});
	};
	Y(Ve, (e) => {
		U(r).commentDetails && e(He);
	});
	var Ge = V(Ve, 2), Ke = z(Ge);
	{
		let e = /* @__PURE__ */ F(() => U(r).commentDetails ? null : U(r).nodeDetails ?? null);
		fs(Ke, {
			get view() {
				return U(e);
			},
			get actions() {
				return n().nodeDetails;
			}
		});
	}
	P(Ge), P(Re), $(Re, (e) => c = e, () => c), P(_e), $(_e, (e) => a = e, () => a);
	var qe = V(_e, 2), Je = (e) => {
		var t = vu(), i = z(t);
		let a;
		var o = z(i), s = z(o), c = z(s, !0);
		P(s);
		var l = V(s);
		P(o);
		var u = V(o, 2), d = (e) => {
			iu(e, {
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
					return U(A);
				},
				scroll: (e) => R(A, e, !0),
				open: oe
			});
		}, f = (e) => {
			{
				let t = /* @__PURE__ */ F(() => U(r).fastConnections ?? {
					userId: "",
					connections: [],
					issue: "Fast connection settings are unavailable."
				});
				Sc(e, {
					get view() {
						return U(t);
					},
					get actions() {
						return n().fastConnections;
					},
					close: ae
				});
			}
		}, p = (e) => {
			{
				let t = /* @__PURE__ */ F(() => U(r).recallArms ?? {
					scope: null,
					nodes: [],
					issue: "Recall state is unavailable."
				});
				Xc(e, {
					get view() {
						return U(t);
					},
					get actions() {
						return n().recallArms;
					},
					close: ae
				});
			}
		}, m = (e) => {
			{
				let t = /* @__PURE__ */ F(() => U(r).storyDocuments ?? {
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
						return U(t);
					},
					get actions() {
						return n().storyDocuments;
					},
					close: ae
				});
			}
		}, h = (e) => {
			{
				let t = /* @__PURE__ */ F(() => U(r).runDetails ?? null);
				Us(e, {
					get view() {
						return U(t);
					},
					get actions() {
						return n().runDetails;
					}
				});
			}
		}, g = (e) => {
			var t = _u();
			Me(4), q(e, t);
		};
		Y(u, (e) => {
			U(E) === "examples" ? e(d) : U(E) === "fast-connections" ? e(f, 1) : U(E) === "recall-arms" ? e(p, 2) : U(E) === "story-documents" ? e(m, 3) : U(E) === "run-details" ? e(h, 4) : e(g, -1);
		}), P(i), $(i, (e) => R(D, e), () => U(D)), P(t), H(() => {
			a = di(i, 1, "pc-workspace-dialog svelte-1dr9aew", null, a, { "pc-examples-dialog": U(E) === "examples" }), Q(i, "aria-label", U(E) === "examples" ? "Examples" : U(E) === "run-details" ? "Run details" : U(E) === "fast-connections" ? "Fast connections" : U(E) === "story-documents" ? "Workflow Data" : U(E) === "recall-arms" ? "Recall arms" : "Workspace guide"), J(c, U(E) === "examples" ? "Examples" : U(E) === "run-details" ? "Run details" : U(E) === "fast-connections" ? "Fast connections" : U(E) === "story-documents" ? "Workflow Data" : U(E) === "recall-arms" ? "Recall arms" : "Workspace guide");
		}), G("keydown", i, ce), W("paste", i, (e) => e.stopPropagation()), G("click", l, ae), q(e, t);
	};
	Y(qe, (e) => {
		U(E) && e(Je);
	});
	var Ye = V(qe, 2);
	ml(Ye, {
		get view() {
			return U(r).nativeSearch;
		},
		get actions() {
			return n().nativeSearch;
		}
	});
	var Xe = V(Ye, 2);
	vl(Xe, {
		get view() {
			return U(r).nativePinMenu;
		},
		get actions() {
			return n().nativePinMenu;
		}
	});
	var Ze = V(Xe, 2), Qe = (e) => {
		var t = yu(), i = z(t);
		fc(z(i), {
			get view() {
				return U(r).portalManager;
			},
			get actions() {
				return n().portalManager;
			}
		}), P(i), P(t), G("keydown", i, se), W("paste", i, (e) => e.stopPropagation()), q(e, t);
	};
	Y(Ze, (e) => {
		U(r).portalManager && e(Qe);
	});
	var $e = V(Ze, 2), et = (e) => {
		rl(e, {
			get view() {
				return U(r).configureNode;
			},
			get actions() {
				return n().configureNode;
			}
		});
	};
	Y($e, (e) => {
		U(r).configureNode && e(et);
	});
	var tt = V($e, 2), nt = (e) => {
		gc(e, {
			get view() {
				return U(r).subgraphSave;
			},
			get actions() {
				return n().subgraphSave;
			}
		});
	};
	Y(tt, (e) => {
		U(r).subgraphSave && e(nt);
	});
	var rt = V(tt, 2), it = (e) => {
		mu(e, {
			get view() {
				return U(r).importReview;
			},
			get actions() {
				return n();
			}
		});
	};
	Y(rt, (e) => {
		U(r).importReview && e(it);
	});
	var at = V(rt, 2), ot = (e) => {
		al(e, {
			get view() {
				return U(r).newWorkflowPrompt;
			},
			get actions() {
				return n().newWorkflowPrompt;
			}
		});
	};
	return Y(at, (e) => {
		U(r).newWorkflowPrompt && e(ot);
	}), P(ue), $(ue, (e) => i = e, () => i), H((e) => {
		de = di(ue, 1, "pc-root pc-native-workspace svelte-1dr9aew", null, de, { "pc-native-flat": U(r).nativeFlatCanvas }), fe = pi(ue, "", fe, { "--pc-details-width": `${U(w)}px` }), be = di(ye, 1, "pc-preview-pane", null, be, { "pc-preview-collapsed": U(b) }), xe = pi(ye, "", xe, e), Q(Ce, "aria-expanded", !U(b)), J(we, U(b) ? "Expand preview" : "Collapse preview"), Q(Te, "hidden", U(b)), Q(Re, "hidden", !U(r).inspectorOpen), Q(Ge, "hidden", !!U(r).commentDetails);
	}, [() => ({ "--pc-preview-height": `${Math.min(U(y), U(x))}px` })]), G("click", Ce, () => ne(!U(b))), G("click", Be, () => n().managePortals?.()), q(e, ue), We(le);
}
Tr(["click", "keydown"]);
//#endregion
//#region ui/entry.js
function Su(e, t) {
	let n = document.createElement("div");
	n.style.cssText = "position:absolute;left:0;top:0;visibility:hidden;pointer-events:none", n.setAttribute("aria-hidden", "true"), n.inert = !0, e.append(n);
	let r;
	try {
		r = Rr(qi, {
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
function Cu(e, t) {
	let n = Rr(ma, {
		target: e,
		props: { actions: t }
	});
	return Rt(), {
		...n.getLayers(),
		setComments: (e, t) => Rt(() => n.setComments(e, t)),
		setNodes: (e) => Rt(() => n.setNodes(e)),
		setNodeProfiles: (e) => Rt(() => n.setNodeProfiles(e)),
		setGroups: (e) => Rt(() => n.setGroups(e)),
		setWires: (e, t, r) => Rt(() => n.setWires(e, t, r)),
		setPositions: (e, t) => Rt(() => n.setPositions(e, t)),
		destroy: () => Hr(n)
	};
}
function wu(e, t) {
	let n = Rr(xu, {
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
export { Su as measureNodeCard, Cu as mountCanvas, wu as mountWorkbench };
