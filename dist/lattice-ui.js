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
	return Oe(/* @__PURE__ */ un(N));
}
function P(e) {
	if (M) {
		if (/* @__PURE__ */ un(N) !== null) throw we(), be;
		N = e;
	}
}
function Ae(e = 1) {
	if (M) {
		for (var t = e, n = N; t--;) n = /* @__PURE__ */ un(n);
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
		var i = /* @__PURE__ */ un(n);
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
		r: Kn,
		l: null
	};
}
function He(e) {
	var t = ze, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) xn(r);
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
	var t = Kn;
	if (t === null) return Un.f |= k, e;
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
	M && /* @__PURE__ */ ln(e) !== null && dn(e);
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
	var t = Un, n = Kn;
	Gn(null), qn(null);
	try {
		return e();
	} finally {
		Gn(t), qn(n);
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
		vn() && (U(n), Tn(() => (t === 0 && (r = mr(() => e(() => Xt(n)))), t += 1, () => {
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
			var t = Kn;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = Kn.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = En(() => {
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
			this.#a = Dn(() => this.#r(this.#e));
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		let t = this.#n.failed, { reset: n, invoke_onerror: r } = this.#v(e);
		Ke(r), t && (this.#s = Dn(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			t ? Ee() : (t = !0, n && ye(), this.#s !== null && Pn(this.#s, () => {
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
		e && (this.is_pending = !0, this.#o = Dn(() => e(this.#e)), Ke(() => {
			var e = this.#c = document.createDocumentFragment(), t = cn();
			e.append(t), this.#a = this.#S(() => Dn(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, Pn(this.#o, () => {
				this.#o = null;
			}), this.#x(I));
		}));
	}
	#b() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#l = 0, this.#a = Dn(() => {
				this.#r(this.#e);
			}), this.#u > 0) {
				var e = this.#c = document.createDocumentFragment();
				Rn(this.#a, e);
				let t = this.#n.pending;
				this.#o = Dn(() => t(this.#e));
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
		var t = Kn, n = Un, r = ze;
		qn(this.#i), Gn(this.#i), Be(this.#i.ctx);
		try {
			return Ft.ensure(), e();
		} catch (e) {
			return Je(e), null;
		} finally {
			qn(t), Gn(n), Be(r);
		}
	}
	#C(e, t) {
		this.has_pending_snippet() ? (this.#u += e, this.#u === 0 && (this.#x(t), this.#o && Pn(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null))) : this.parent && this.parent.#C(e, t);
	}
	update_pending_count(e, t) {
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, Ke(() => {
			this.#d = !1, this.#m && Jt(this.#m, this.#l);
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
		this.#a &&= (jn(this.#a), null), this.#o &&= (jn(this.#o), null), this.#s &&= (jn(this.#s), null), M && (Oe(this.#t), Ae(), Oe(je()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return Dn(() => {
						var r = Kn;
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
	var s = Kn, c = pt(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
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
	var e = Kn, t = Un, n = ze, r = I;
	return function(i = !0) {
		qn(e), Gn(t), Be(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function mt(e = !0) {
	qn(null), Gn(null), Be(null), e && I?.deactivate();
}
function ht() {
	var e = Kn, t = e.b, n = I, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function gt(e) {
	var t = 2 | g;
	return Kn !== null && (Kn.f |= C), {
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
		parent: Kn,
		ac: null
	};
}
var _t = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function vt(e, t, n) {
	let r = Kn;
	r === null && le();
	var i = void 0, a = Kt(xe), o = !Un, s = /* @__PURE__ */ new Set();
	return wn(() => {
		var t = Kn, n = p();
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
	}), yn(() => {
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
	return Yn(t), t;
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
		for (var n = 0; n < t.length; n += 1) jn(t[n]);
	}
}
function xt(e) {
	var t, n = Kn, r = e.parent;
	if (!Vn && r !== null && e.v !== xe && r.f & 24576) return Ce(), e.v;
	qn(r);
	try {
		e.f &= ~E, bt(e), t = sr(e);
	} finally {
		qn(n);
	}
	return t;
}
function St(e) {
	var t = xt(e);
	!e.equals(t) && (e.wv = ir(), (!I?.is_fork || e.deps === null) && (I === null ? e.v = t : (I.capture(e, t, !0), Et?.capture(e, t, !0)), e.deps === null)) ? Ze(e, h) : Vn || (Dt === null ? Qe(e) : (vn() || I?.is_fork) && Dt.set(e, t));
}
function Ct(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && ot(() => {
		t.ac.abort(oe), t.ac = null;
	}), t.fn !== null && (t.teardown = d), lr(t, 0), kn(t));
}
function wt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && ur(t);
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
				a ? r.f ^= h : i & 4 ? t.push(r) : ar(r) && (i & 16 && this.#d.add(r), ur(r));
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
				if (jt !== null && t === Kn && (Un === null || !(Un.f & 2))) return;
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
			if (!(r.f & 24576) && ar(r) && (Rt = /* @__PURE__ */ new Set(), ur(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Nn(r), Rt?.size > 0)) {
				Wt.clear();
				for (let e of Rt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) Rt.has(n) && (Rt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || ur(n);
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
	return Yn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function qt(e, t = !1, n = !0) {
	let r = Kt(e);
	return t || (r.equals = Fe), r;
}
function R(e, t, n = !1) {
	return Un !== null && (!Wn || Un.f & 131072) && Ue() && Un.f & 4325394 && (Jn === null || !Jn.has(e)) && ve(), Jt(e, n ? Qt(t) : t, Mt);
}
function Jt(e, t, n = null) {
	if (!e.equals(t)) {
		Vn ? Wt.set(e, t) : Wt.has(e) || Wt.set(e, e.v);
		var r = Ft.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && xt(t), Dt === null && Qe(t);
		}
		e.wv = ir(), Zt(e, g, n), Ue() && Kn !== null && Kn.f & 1024 && !(Kn.f & 96) && (Qn === null ? $n([e]) : Qn.push(e)), !r.is_fork && Ut.size > 0 && !Gt && Yt();
	}
	return t;
}
function Yt() {
	Gt = !1;
	for (let e of Ut) {
		e.f & 1024 && Ze(e, _);
		let t;
		try {
			t = ar(e);
		} catch {
			t = !0;
		}
		t && ur(e);
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
		if (i || s !== Kn) {
			var l = (c & g) === 0;
			if (l && Ze(s, t), c & 131072) Ut.add(s);
			else if (c & 2) {
				var u = s;
				Dt?.delete(u), c & 65536 || (c & 512 && (Kn === null || !(Kn.f & 2097152)) && (s.f |= E), Zt(u, _, n));
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
	var r = /* @__PURE__ */ new Map(), i = e(t), o = /* @__PURE__ */ L(0), u = null, d = nr, f = (e) => {
		if (nr === d) return e();
		var t = Un, n = nr;
		Gn(null), rr(d);
		var r = e();
		return Gn(t), rr(n), r;
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
			return (n !== void 0 || Kn !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ L(i ? Qt(e[t]) : xe, u)), r.set(t, n)), U(n) === xe) ? !1 : i;
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
function $t(e) {
	try {
		if (typeof e == "object" && e && A in e) return e[A];
	} catch {}
	return e;
}
function en(e, t) {
	return Object.is($t(e), $t(t));
}
var tn, nn, rn, an, on;
function sn() {
	if (tn === void 0) {
		tn = window, nn = document, rn = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		an = a(t, "firstChild").get, on = a(t, "nextSibling").get, u(e) && (e[j] = void 0, e[ne] = null, e[re] = void 0, e.__e = void 0), u(n) && (n[ie] = void 0);
	}
}
function cn(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function ln(e) {
	return an.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function un(e) {
	return on.call(e);
}
function z(e, t) {
	if (!M) return /* @__PURE__ */ ln(e);
	var n = /* @__PURE__ */ ln(N);
	if (n === null) n = N.appendChild(cn());
	else if (t && n.nodeType !== 3) {
		var r = cn();
		return n?.before(r), Oe(r), r;
	}
	return t && mn(n), Oe(n), n;
}
function B(e, t = !1) {
	if (!M) {
		var n = /* @__PURE__ */ ln(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ un(n) : n;
	}
	if (t) {
		if (N?.nodeType !== 3) {
			var r = cn();
			return N?.before(r), Oe(r), r;
		}
		mn(N);
	}
	return N;
}
function V(e, t = 1, n = !1) {
	let r = M ? N : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ un(r);
	if (!M) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = cn();
			return r === null ? i?.after(a) : r.before(a), Oe(a), a;
		}
		mn(r);
	}
	return Oe(r), r;
}
function dn(e) {
	e.textContent = "";
}
function fn() {
	return !1;
}
function pn(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function mn(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/effects.js
function hn(e) {
	Kn === null && (Un === null && pe(e), fe()), Vn && de(e);
}
function gn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function _n(e, t) {
	var n = Kn;
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
			ur(r);
		} catch (e) {
			throw jn(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= S));
	}
	if (i !== null && (i.parent = n, n !== null && gn(i, n), Un !== null && Un.f & 2 && !(e & 64))) {
		var a = Un;
		(a.effects ??= []).push(i);
	}
	return r;
}
function vn() {
	return Un !== null && !Wn;
}
function yn(e) {
	let t = _n(8, null);
	return Ze(t, h), t.teardown = e, t;
}
function bn(e) {
	hn("$effect");
	var t = Kn.f;
	if (!Un && t & 32 && ze !== null && !ze.i) {
		var n = ze;
		(n.e ??= []).push(e);
	} else return xn(e);
}
function xn(e) {
	return _n(4 | w, e);
}
function Sn(e) {
	Ft.ensure();
	let t = _n(64 | C, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? Pn(t, () => {
			jn(t), n(void 0);
		}) : (jn(t), n(void 0));
	});
}
function Cn(e) {
	return _n(4, e);
}
function wn(e) {
	return _n(O | C, e);
}
function Tn(e, t = 0) {
	return _n(8 | t, e);
}
function H(e, t = [], n = [], r = []) {
	ft(r, t, n, (t) => {
		_n(8, () => {
			e(...t.map(U));
		});
	});
}
function En(e, t = 0) {
	return _n(16 | t, e);
}
function Dn(e) {
	return _n(32 | C, e);
}
function On(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = Vn, n = Un;
		Hn(!0), Gn(null);
		try {
			t.call(null);
		} finally {
			Hn(e), Gn(n);
		}
	}
}
function kn(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && ot(() => {
			e.abort(oe);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : jn(n, t), n = r;
	}
}
function An(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || jn(t), t = n;
	}
}
function jn(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (Mn(e.nodes.start, e.nodes.end), n = !0), e.f |= x, kn(e, t && !n), lr(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	On(e), e.f ^= x, e.f |= y;
	var i = e.parent;
	i !== null && i.first !== null && Nn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Mn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ un(e);
		e.remove(), e = n;
	}
}
function Nn(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Pn(e, t, n = !0) {
	var r = [];
	Fn(e, r, !0);
	var i = () => {
		n && jn(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function Fn(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= v;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				Fn(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function In(e) {
	Ln(e, !0);
}
function Ln(e, t) {
	if (e.f & 8192) {
		e.f ^= v, e.f & 1024 || (Ze(e, g), Ft.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = !!(n.f & 65536) || !!(n.f & 32);
			Ln(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function Rn(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ un(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/legacy.js
var zn = null, Bn = !1, Vn = !1;
function Hn(e) {
	Vn = e;
}
var Un = null, Wn = !1;
function Gn(e) {
	Un = e;
}
var Kn = null;
function qn(e) {
	Kn = e;
}
var Jn = null;
function Yn(e) {
	Un !== null && (Jn ??= /* @__PURE__ */ new Set()).add(e);
}
var Xn = null, Zn = 0, Qn = null;
function $n(e) {
	Qn = e;
}
var er = 1, tr = 0, nr = tr;
function rr(e) {
	nr = e;
}
function ir() {
	return ++er;
}
function ar(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~E), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (ar(a) && St(a), a.wv > e.wv) return !0;
		}
		t & 512 && Dt === null && Ze(e, h);
	}
	return !1;
}
function or(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Jn !== null && Jn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? or(a, t, !1) : t === a && (n ? Ze(a, g) : a.f & 1024 && Ze(a, _), Bt(a));
	}
}
function sr(e) {
	var t = Xn, n = Zn, r = Qn, i = Un, a = Jn, o = ze, s = Wn, c = nr, l = e.f;
	Xn = null, Zn = 0, Qn = null, Un = l & 96 ? null : e, Jn = null, Be(e.ctx), Wn = !1, nr = ++tr, e.ac !== null && (ot(() => {
		e.ac.abort(oe);
	}), e.ac = null);
	try {
		e.f |= D;
		var u = e.fn, d = u();
		e.f |= b;
		var f = e.deps, p = I?.is_fork;
		if (Xn !== null) {
			var m;
			if (p || lr(e, Zn), f !== null && Zn > 0) for (f.length = Zn + Xn.length, m = 0; m < Xn.length; m++) f[Zn + m] = Xn[m];
			else e.deps = f = Xn;
			if (vn() && e.f & 512) for (m = Zn; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && Zn < f.length && (lr(e, Zn), f.length = Zn);
		if (Ue() && Qn !== null && !Wn && f !== null && !(e.f & 6146)) for (m = 0; m < Qn.length; m++) or(Qn[m], e);
		if (i !== null && i !== e) {
			if (tr++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = tr;
			if (t !== null) for (let e of t) e.rv = tr;
			Qn !== null && (r === null ? r = Qn : r.push(...Qn));
		}
		return e.f & 8388608 && (e.f ^= k), d;
	} catch (e) {
		return Je(e);
	} finally {
		e.f ^= D, Xn = t, Zn = n, Qn = r, Un = i, Jn = a, Be(o), Wn = s, nr = c;
	}
}
function cr(e, r) {
	let i = r.reactions;
	if (i !== null) {
		var a = t.call(i, e);
		if (a !== -1) {
			var o = i.length - 1;
			o === 0 ? i = r.reactions = null : (i[a] = i[o], i.pop());
		}
	}
	if (i === null && r.f & 2 && (Xn === null || !n.call(Xn, r))) {
		var s = r;
		s.f & 512 && (s.f ^= 512, s.f &= ~E), s.v !== xe && Qe(s), s.ac !== null && ot(() => {
			s.ac.abort(oe), s.ac = null, Ze(s, g);
		}), Ct(s), lr(s, 0);
	}
}
function lr(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) cr(e, n[r]);
}
function ur(e) {
	var t = e.f;
	if (!(t & 16384)) {
		Ze(e, h);
		var n = Kn, r = Bn;
		Kn = e, Bn = !(t & 96);
		try {
			t & 16777232 ? An(e) : kn(e), On(e);
			var i = sr(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = er;
		} finally {
			Bn = r, Kn = n;
		}
	}
}
async function dr() {
	await Promise.resolve(), It();
}
function U(e) {
	var t = !!(e.f & 2);
	if (zn?.add(e), Un !== null && !Wn && !(Kn !== null && Kn.f & 16384) && (Jn === null || !Jn.has(e))) {
		var r = Un.deps;
		if (Un.f & 2097152) e.rv < tr && (e.rv = tr, Xn === null && r !== null && r[Zn] === e ? Zn++ : Xn === null ? Xn = [e] : Xn.push(e));
		else {
			Un.deps ??= [], n.call(Un.deps, e) || Un.deps.push(e);
			var i = e.reactions;
			i === null ? e.reactions = [Un] : n.call(i, Un) || i.push(Un);
		}
	}
	if (Vn && Wt.has(e)) return Wt.get(e);
	if (t) {
		var a = e;
		if (Vn) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || pr(a)) && (o = xt(a)), Wt.set(a, o), o;
		}
		var s = !(a.f & 512) && !Wn && Un !== null && (Bn || !!(Un.f & 512)), c = (a.f & b) === 0;
		ar(a) && (s && (a.f |= 512), St(a)), s && !c && (wt(a), fr(a));
	}
	if (Dt?.has(e)) return Dt.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function fr(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (wt(t), fr(t));
}
function pr(e) {
	if (e.v === xe) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Wt.has(t) || t.f & 2 && pr(t)) return !0;
	return !1;
}
function mr(e) {
	var t = Wn;
	try {
		return Wn = !0, e();
	} finally {
		Wn = t;
	}
}
function hr(e) {
	if (!(typeof e != "object" || !e || e instanceof EventTarget)) {
		if (A in e) gr(e);
		else if (!Array.isArray(e)) for (let t in e) {
			let n = e[t];
			typeof n == "object" && n && A in n && gr(n);
		}
	}
}
function gr(e, t = /* @__PURE__ */ new Set()) {
	if (typeof e == "object" && e && !(e instanceof EventTarget) && !t.has(e)) {
		t.add(e), e instanceof Date && e.getTime();
		for (let n in e) try {
			gr(e[n], t);
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
var _r = ["touchstart", "touchmove"];
function vr(e) {
	return _r.includes(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
var yr = Symbol("events"), br = /* @__PURE__ */ new Set(), xr = /* @__PURE__ */ new Set();
function Sr(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || Er.call(t, e), !e.cancelBubble) return ot(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Ke(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function W(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = Sr(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && yn(() => {
		t.removeEventListener(e, o, a);
	});
}
function G(e, t, n) {
	(t[yr] ??= {})[e] = n;
}
function Cr(e) {
	for (var t = 0; t < e.length; t++) br.add(e[t]);
	for (var n of xr) n(e);
}
var wr = null, Tr = !1;
function Er(e) {
	var t = this, n = t.ownerDocument, r = e.type, a = e.composedPath?.() || [], o = a[0] || e.target;
	wr = e, Tr || (Tr = !0, setTimeout(() => {
		Tr = !1, wr = null;
	}));
	var s = 0, c = wr === e && e[yr];
	if (c) {
		var l = a.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[yr] = t;
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
		var d = Un, f = Kn;
		Gn(null), qn(null);
		try {
			for (var p, m = []; o !== null && o !== t;) {
				try {
					var h = o[yr]?.[r];
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
			e[yr] = t, delete e.currentTarget, Gn(d), qn(f);
		}
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/reconciler.js
var Dr = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function Or(e) {
	return Dr?.createHTML(e) ?? e;
}
function kr(e) {
	var t = pn("template");
	return t.innerHTML = Or(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function Ar(e, t) {
	var n = Kn;
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
		if (M) return Ar(N, null), N;
		i === void 0 && (i = kr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ ln(i)));
		var t = r || rn ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ ln(t), s = t.lastChild;
			Ar(o, s);
		} else Ar(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function jr(e, t, n = "svg") {
	var r = !e.startsWith("<!>"), i = !!(t & 1), a = `<${n}>${r ? e : "<!>" + e}</${n}>`, o;
	return () => {
		if (M) return Ar(N, null), N;
		if (!o) {
			var e = /* @__PURE__ */ ln(kr(a));
			if (i) for (o = document.createDocumentFragment(); /* @__PURE__ */ ln(e);) o.appendChild(/* @__PURE__ */ ln(e));
			else o = /* @__PURE__ */ ln(e);
		}
		var t = o.cloneNode(!0);
		if (i) {
			var n = /* @__PURE__ */ ln(t), r = t.lastChild;
			Ar(n, r);
		} else Ar(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Mr(e, t) {
	return /* @__PURE__ */ jr(e, t, "svg");
}
function Nr(e = "") {
	if (!M) {
		var t = cn(e + "");
		return Ar(t, t), t;
	}
	var n = N;
	return n.nodeType === 3 ? mn(n) : (n.before(n = cn()), Oe(n)), Ar(n, n), n;
}
function Pr() {
	if (M) return Ar(N, null), N;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = cn();
	return e.append(t, n), Ar(t, n), e;
}
function q(e, t) {
	if (M) {
		var n = Kn;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = N), ke();
	} else e !== null && e.before(t);
}
function Fr() {
	if (M && N && N.nodeType === 8 && N.textContent?.startsWith("$")) {
		let e = N.textContent.substring(1);
		return ke(), e;
	}
	return (window.__svelte ??= {}).uid ??= 1, `c${window.__svelte.uid++}`;
}
function J(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[ie] ??= e.nodeValue) && (e[ie] = n, e.nodeValue = `${n}`);
}
function Ir(e, t) {
	return Rr(e, t);
}
var Lr = /* @__PURE__ */ new Map();
function Rr(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	sn();
	var l = void 0, u = Sn(() => {
		var s = n ?? t.appendChild(cn());
		ut(s, { pending: () => {} }, (t) => {
			Ve({});
			var n = ze;
			if (o && (n.c = o), a && (i.$$events = a), M && Ar(t, null), l = e(t, i) || {}, M && (Kn.nodes.end = N, N === null || N.nodeType !== 8 || N.data !== "]")) throw we(), be;
			He();
		}, c);
		var u = /* @__PURE__ */ new Set(), d = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!u.has(r)) {
					u.add(r);
					var i = vr(r);
					for (let e of [t, document]) {
						var a = Lr.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), Lr.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, Er, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return d(r(br)), xr.add(d), () => {
			for (var e of u) for (let n of [t, document]) {
				var r = Lr.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, Er), r.delete(e), r.size === 0 && Lr.delete(n)) : r.set(e, i);
			}
			xr.delete(d), s !== n && s.parentNode?.removeChild(s);
		};
	});
	return zr.set(l, u), l;
}
var zr = /* @__PURE__ */ new WeakMap();
function Br(e, t) {
	let n = zr.get(e);
	return n ? (zr.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/branches.js
var Vr = class {
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
			if (n) In(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (In(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
			}
			for (let [t, n] of this.#e) {
				if (this.#e.delete(t), t === e) break;
				let r = this.#n.get(n);
				r && (jn(r.effect), this.#n.delete(n));
			}
			for (let [e, r] of this.#t) {
				if (e === t || this.#r.has(e)) continue;
				let i = () => {
					if (Array.from(this.#e.values()).includes(e)) {
						var t = document.createDocumentFragment();
						Rn(r, t), t.append(cn()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else jn(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), Pn(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (jn(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = I, r = fn();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = cn();
				i.append(a), this.#n.set(e, {
					effect: Dn(() => t(a)),
					fragment: i
				});
			} else this.#t.set(e, Dn(() => t(this.anchor)));
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
	M && (r = N, ke());
	var i = new Vr(e), a = n ? S : 0;
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
	En(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/key.js
var Hr = Symbol("NaN");
function Ur(e, t, n) {
	M && ke();
	var r = new Vr(e), i = !Ue();
	En(() => {
		var e = t();
		e !== e && (e = Hr), i && typeof e == "object" && e && (e = {}), r.ensure(e, n);
	});
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
function Wr(e, t) {
	return t;
}
function Gr(e, t, n) {
	for (var i = [], a = t.length, o, s = t.length, c = 0; c < a; c++) {
		let n = t[c];
		Pn(n, () => {
			if (o) {
				if (o.pending.delete(n), o.done.add(n), o.pending.size === 0) {
					var t = e.outrogroups;
					Kr(e, r(o.done)), t.delete(o), t.size === 0 && (e.outrogroups = null);
				}
			} else --s;
		}, !1);
	}
	if (s === 0) {
		var l = i.length === 0 && n !== null && e.pending.size === 0;
		if (l) {
			var u = n, d = u.parentNode;
			dn(d), d.append(u), e.items.clear();
		}
		Kr(e, t, !l);
	} else o = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(o);
}
function Kr(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= T, Rn(a, document.createDocumentFragment())) : jn(t[i], n);
	}
}
var qr;
function X(t, n, i, a, o, s = null) {
	var c = t, l = /* @__PURE__ */ new Map();
	if (n & 4) {
		var u = t;
		c = M ? Oe(/* @__PURE__ */ ln(u)) : u.appendChild(cn());
	}
	M && ke();
	var d = null, f = /* @__PURE__ */ yt(() => {
		var t = i();
		return e(t) ? t : t == null ? [] : r(t);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, Yr(v, p, c, n, a), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= T, Zr(d, null, c)) : In(d) : Pn(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: En(() => {
			p = U(f);
			var e = p.length;
			let t = !1;
			M && Me(c) === "[!" != (e === 0) && (c = je(), Oe(c), De(!1), t = !0);
			for (var r = /* @__PURE__ */ new Set(), u = I, v = fn(), y = 0; y < e; y += 1) {
				M && N.nodeType === 8 && N.data === "]" && (c = N, t = !0, De(!1));
				var b = p[y], x = a(b, y), S = h ? null : l.get(x);
				S ? (S.v && Jt(S.v, b), S.i && Jt(S.i, y), v && u.unskip_effect(S.e)) : (S = Xr(l, h ? c : qr ??= cn(), b, x, y, o, n, i), h || (S.e.f |= T), l.set(x, S)), r.add(x);
			}
			if (e === 0 && s && !d && (h ? d = Dn(() => s(c)) : (d = Dn(() => s(qr ??= cn())), d.f |= T)), e > r.size && ue("", "", ""), M && e > 0 && Oe(je()), !h) {
				if (m.set(u, r), v) {
					for (let [e, t] of l) r.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			t && De(!0), U(f);
		}),
		flags: n,
		items: l,
		pending: m,
		outrogroups: null,
		fallback: d
	};
	h = !1, M && (c = N);
}
function Jr(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function Yr(e, t, n, i, a) {
	var o = !!(i & 8), s = t.length, c = e.items, l = Jr(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (o) for (v = 0; v < s; v += 1) h = t[v], g = a(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = a(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (In(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= T, _ === l) Zr(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), Qr(e, d, _), Qr(e, _, y), Zr(_, y, n), d = _, p = [], m = [], l = Jr(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], C = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) Zr(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					Qr(e, S.prev, C.next), Qr(e, d, S), Qr(e, C, b), l = b, d = C, --v, p = [], m = [];
				} else u.delete(_), Zr(_, l, n), Qr(e, _.prev, _.next), Qr(e, _, d === null ? e.effect.first : d.next), Qr(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = Jr(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = Jr(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (Kr(e, r(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var w = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || w.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && w.push(l), l = Jr(l.next);
		var E = w.length;
		if (E > 0) {
			var D = i & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < E; v += 1) w[v].nodes?.a?.measure();
				for (v = 0; v < E; v += 1) w[v].nodes?.a?.fix();
			}
			Gr(e, w, D);
		}
	}
	o && Ke(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Xr(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? Kt(n) : /* @__PURE__ */ qt(n, !1, !1) : null, l = o & 2 ? Kt(i) : null;
	return {
		v: c,
		i: l,
		e: Dn(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function Zr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ un(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function Qr(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/actions.js
function $r(e, t, n) {
	Cn(() => {
		var r = mr(() => t(e, n?.()) || {});
		if (n && r?.update) {
			var i = !1, a = {};
			Tn(() => {
				var e = n();
				hr(e), i && Pe(a, e) && (a = e, r.update(e));
			}), i = !0;
		}
		if (r?.destroy) return () => r.destroy();
	});
}
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function ei(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") {
		if (Array.isArray(e)) {
			var i = e.length;
			for (t = 0; t < i; t++) e[t] && (n = ei(e[t])) && (r && (r += " "), r += n);
		} else for (n in e) e[n] && (r && (r += " "), r += n);
	}
	return r;
}
function ti() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = ei(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/shared/attributes.js
function ni(e) {
	return typeof e == "object" ? ti(e) : e ?? "";
}
var ri = [..." 	\n\r\f\xA0\v﻿"];
function ii(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || ri.includes(r[o - 1])) && (s === r.length || ri.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function ai(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function oi(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function si(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\/\*.*?\*\//g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(oi)), i && c.push(...Object.keys(i).map(oi));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = oi(e.substring(l, u).trim());
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
		return r && (n += ai(r)), i && (n += ai(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/class.js
function ci(e, t, n, r, i, a) {
	var o = e[j];
	if (M || o !== n || o === void 0) {
		var s = ii(n, r, a);
		(!M || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[j] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/style.js
function li(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function ui(e, t, n, r) {
	var i = e[re];
	if (M || i !== t) {
		var a = si(t, r);
		(!M || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[re] = t;
	} else r && (Array.isArray(r) ? (li(e, n?.[0], r[0]), li(e, n?.[1], r[1], "important")) : li(e, n, r));
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function di(t, n, r = !1) {
	if (t.multiple) {
		if (n == null) return;
		if (!e(n)) return Te();
		for (var i of t.options) i.selected = n.includes(mi(i));
	} else {
		for (i of t.options) if (en(mi(i), n)) {
			i.selected = !0;
			return;
		}
		(!r || n !== void 0) && (t.selectedIndex = -1);
	}
}
function fi(e) {
	var t = new MutationObserver(() => {
		"__value" in e && di(e, e.__value);
	});
	t.observe(e, {
		childList: !0,
		subtree: !0,
		attributes: !0,
		attributeFilter: ["value"]
	}), yn(() => {
		t.disconnect();
	});
}
function pi(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet(), i = !0;
	st(e, "change", (t) => {
		var i = t ? "[selected]" : ":checked", a;
		if (e.multiple) a = [].map.call(e.querySelectorAll(i), mi);
		else {
			var o = e.querySelector(i) ?? e.querySelector("option:not([disabled])");
			a = o && mi(o);
		}
		n(a), e.__value = a, I !== null && r.add(I);
	}), Cn(() => {
		var a = t();
		if (e === document.activeElement) {
			var o = I;
			if (r.has(o)) return;
		}
		if (di(e, a, i), i && a === void 0) {
			var s = e.querySelector(":checked");
			s !== null && (a = mi(s), n(a));
		}
		e.__value = a, i = !1;
	}), fi(e);
}
function mi(e) {
	return "__value" in e ? e.__value : e.value;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var hi = Symbol("is custom element"), gi = Symbol("is html"), _i = se ? "link" : "LINK", vi = se ? "progress" : "PROGRESS";
function Z(e) {
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
function Q(e, t) {
	var n = bi(e);
	n.value !== (n.value = t ?? void 0) && (e.value !== t || t === 0 && e.nodeName === vi) && (e.value = t ?? "");
}
function yi(e, t) {
	var n = bi(e);
	n.checked !== (n.checked = t ?? void 0) && (e.checked = t);
}
function $(e, t, n, r) {
	var i = bi(e);
	M && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === _i) || i[t] !== (i[t] = n) && (t === "loading" && (e[te] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Si(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function bi(e) {
	return e[ne] ??= {
		[hi]: e.nodeName.includes("-"),
		[gi]: e.namespaceURI === Se
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
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function Ci(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet();
	st(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = wi(e) ? Ti(a) : a, n(a), I !== null && r.add(I), await dr(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (M && e.defaultValue !== e.value || mr(t) == null && e.value) && (n(wi(e) ? Ti(e.value) : e.value), I !== null && r.add(I)), Tn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = I;
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
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function Ei(e, t) {
	return e === t || e?.[A] === t;
}
function Di(e = {}, t, n, r) {
	var i = ze.r, a = Kn;
	return Cn(() => {
		var o, s;
		return Tn(() => {
			o = s, s = r?.() || [], mr(() => {
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
//#region node_modules/svelte/src/internal/client/reactivity/props.js
function Oi(e, t, n, r) {
	var i = !0, o = !!(n & 8), s = !!(n & 16), c = r, l = !0, u = void 0, d = () => s && i ? (u ??= /* @__PURE__ */ gt(r), U(u)) : (l && (l = !1, c = s ? mr(r) : r), c);
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
	o && U(y);
	var b = Kn;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? U(y) : i && o ? Qt(e) : e;
			return R(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return Vn && v || b.f & 16384 ? y.v : U(y);
	});
}
function ki(e) {
	ze === null && ce("onMount"), bn(() => {
		let t = mr(e);
		if (typeof t == "function") return t;
	});
}
function Ai(e) {
	ze === null && ce("onDestroy"), ki(() => () => mr(e));
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region ui/NodeCard.svelte
var ji = /* @__PURE__ */ K("<span class=\"pc-modifier-badge svelte-1jilz27\"> </span>"), Mi = /* @__PURE__ */ K("<div><span class=\"pc-native-pin-label\"> </span> <div role=\"img\"></div></div>"), Ni = /* @__PURE__ */ K("<div class=\"pc-node-body\"> </div>"), Pi = /* @__PURE__ */ K("<span class=\"pc-native-alias\"> </span>"), Fi = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-node-action pc-host-result\" aria-label=\"Preview host result\"><i class=\"fa-solid fa-eye\" aria-hidden=\"true\"></i> Host result</button>"), Ii = /* @__PURE__ */ K("<div role=\"group\" tabindex=\"0\"><div class=\"pc-native-heading\"><svg class=\"pc-native-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path></path></svg><span class=\"pc-node-title\"> </span><!></div> <div class=\"pc-native-pins\"></div> <!> <!> <!></div>");
function Li(e, t) {
	Ve(t, !0);
	let n = (e) => e.stopPropagation();
	var r = Ii();
	let i;
	var a = z(r), o = z(a), s = z(o);
	P(o);
	var c = V(o), l = z(c, !0);
	P(c);
	var u = V(c), d = (e) => {
		var n = ji(), r = z(n);
		P(n), H(() => {
			$(n, "title", t.card.modifierSummary.text), $(n, "aria-label", t.card.modifierSummary.text), J(r, `+${t.card.modifierSummary.count ?? ""}`);
		}), q(e, n);
	};
	Y(u, (e) => {
		t.card.modifierSummary && e(d);
	}), P(a);
	var f = V(a, 2);
	X(f, 21, () => t.card.ports, (e) => e.id, (e, n) => {
		var r = Mi();
		let i;
		var a = z(r), o = z(a, !0);
		P(a);
		var s = V(a, 2);
		P(r), H(() => {
			ci(r, 1, `pc-native-row pc-native-row-${U(n).dir}`, "svelte-1jilz27"), i = ui(r, "", i, { "grid-row": U(n).row }), J(o, U(n).label), ci(s, 1, ni(U(n).className), "svelte-1jilz27"), $(s, "data-node", t.card.id), $(s, "data-dir", U(n).dir), $(s, "data-port", U(n).port), $(s, "data-side", U(n).side), $(s, "data-kind", U(n).kind), $(s, "title", U(n).title), $(s, "aria-label", U(n).title);
		}), W("mouseenter", s, () => t.actions.hoverPin({
			nodeId: t.card.id,
			dir: U(n).dir,
			port: U(n).port
		})), W("mouseleave", s, () => t.actions.hoverPin(null)), q(e, r);
	}), P(f);
	var p = V(f, 2), m = (e) => {
		var n = Ni(), r = z(n, !0);
		P(n), H(() => J(r, t.card.body)), q(e, n);
	};
	Y(p, (e) => {
		t.card.type === "note" && e(m);
	});
	var h = V(p, 2), g = (e) => {
		var n = Pi(), r = z(n, !0);
		P(n), H(() => {
			$(n, "title", t.card.titleHint), J(r, t.card.title);
		}), q(e, n);
	};
	Y(h, (e) => {
		t.card.compact && e(g);
	});
	var _ = V(h, 2), v = (e) => {
		var r = Fi();
		G("mousedown", r, n), G("click", r, (e) => {
			n(e), t.actions.hostResult(t.card.id);
		}), q(e, r);
	};
	Y(_, (e) => {
		t.card.hostResult && e(v);
	}), P(r), H(() => {
		ci(r, 1, ni(t.card.className), "svelte-1jilz27"), $(r, "data-id", t.card.id), $(r, "title", t.card.offHint), $(r, "aria-label", `${t.card.label}: ${t.card.title}`), i = ui(r, "", i, {
			left: `${t.card.x}px`,
			top: `${t.card.y}px`
		}), $(s, "d", t.card.iconPath), $(c, "title", t.card.titleHint), J(l, t.card.title);
	}), q(e, r), He();
}
Cr(["mousedown", "click"]);
//#endregion
//#region ui/GroupCard.svelte
var Ri = /* @__PURE__ */ K("<div class=\"pc-node-body\"> </div>"), zi = /* @__PURE__ */ K("<div role=\"group\"><div><i class=\"fa-solid fa-object-group\" aria-hidden=\"true\"></i> <span> </span> <span class=\"pc-group-frame-count\"> </span> <button type=\"button\"></button></div> <!></div>");
function Bi(e, t) {
	Ve(t, !0);
	function n(e, n) {
		e.stopPropagation(), e.preventDefault(), t.actions.group(t.group.id, n);
	}
	function r(e, n) {
		e.stopPropagation(), e.detail === 0 && t.actions.group(t.group.id, n);
	}
	var i = zi();
	let a;
	var o = z(i), s = V(z(o), 2), c = z(s, !0);
	P(s);
	var l = V(s, 2), u = z(l, !0);
	P(l);
	var d = V(l, 2);
	P(o);
	var f = V(o, 2), p = (e) => {
		var n = Ri(), r = z(n, !0);
		P(n), H(() => J(r, t.group.body)), q(e, n);
	};
	Y(f, (e) => {
		t.group.collapsed && e(p);
	}), P(i), H(() => {
		ci(i, 1, ni(t.group.className)), $(i, "data-group", t.group.id), $(i, "aria-label", `Group: ${t.group.title}`), a = ui(i, "", a, {
			left: `${t.group.x}px`,
			top: `${t.group.y}px`,
			width: `${t.group.w}px`,
			height: t.group.collapsed ? void 0 : `${t.group.h}px`
		}), ci(o, 1, ni(t.group.collapsed ? "pc-node-head" : "pc-group-frame-head")), ci(s, 1, ni(t.group.collapsed ? "pc-node-title" : "pc-group-frame-title")), J(c, t.group.title), J(u, t.group.count), ci(d, 1, `pc-node-action fa-solid pc-group-btn ${t.group.collapsed ? "fa-up-right-and-down-left-from-center" : "fa-down-left-and-up-right-to-center"}`), $(d, "data-action", t.group.collapsed ? "open" : "collapse"), $(d, "title", t.group.collapsed ? "Open group" : "Fold group"), $(d, "aria-label", t.group.collapsed ? "Open group" : "Fold group");
	}), G("mousedown", d, (e) => n(e, t.group.collapsed ? "open" : "collapse")), G("click", d, (e) => r(e, t.group.collapsed ? "open" : "collapse")), q(e, i), He();
}
Cr(["mousedown", "click"]);
//#endregion
//#region ui/WireLayer.svelte
var Vi = /* @__PURE__ */ Mr("<path class=\"pc-wire-hit\"></path><path><title> </title></path><text text-anchor=\"middle\"> </text>", 1), Hi = /* @__PURE__ */ Mr("<path></path>"), Ui = /* @__PURE__ */ Mr("<!><!>", 1);
function Wi(e, t) {
	Ve(t, !0);
	var n = Ui(), r = B(n);
	X(r, 17, () => t.wires, (e) => e.id, (e, t) => {
		var n = Vi(), r = B(n), i = V(r), a = z(i), o = z(a);
		P(a), P(i);
		var s = V(i), c = z(s, !0);
		P(s), H(() => {
			$(r, "d", U(t).d), $(r, "data-id", U(t).id), $(i, "d", U(t).d), ci(i, 0, ni(U(t).className)), $(i, "data-id", U(t).id), $(i, "data-kind", U(t).kind), J(o, `${U(t).kind ?? ""} artifact`), $(s, "x", U(t).label.x), $(s, "y", U(t).label.y), ci(s, 0, ni(U(t).label.className)), J(c, U(t).label.text);
		}), q(e, n);
	});
	var i = V(r), a = (e) => {
		var n = Hi();
		H(() => {
			$(n, "d", t.ghost.d), ci(n, 0, ni(t.ghost.className));
		}), q(e, n);
	};
	Y(i, (e) => {
		t.ghost && e(a);
	}), q(e, n), He();
}
//#endregion
//#region ui/CommentFrame.svelte
var Gi = /* @__PURE__ */ K("<span class=\"pc-comment-title svelte-118xm2r\"> </span>"), Ki = /* @__PURE__ */ K("<input class=\"pc-comment-title-input svelte-118xm2r\" aria-label=\"Comment title\"/>"), qi = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-comment-resize svelte-118xm2r\" title=\"Drag to resize comment\"></button>"), Ji = /* @__PURE__ */ K("<div role=\"group\"><header class=\"pc-comment-header svelte-118xm2r\"><button type=\"button\" class=\"pc-comment-select svelte-118xm2r\" title=\"Drag header to move comment\">⋮⋮</button> <!></header> <div class=\"pc-comment-notes svelte-118xm2r\"> </div> <!></div>");
function Yi(e, t) {
	Ve(t, !0);
	let n = (e) => e.stopPropagation();
	var r = Ji();
	let i, a;
	var o = z(r), s = z(o), c = V(s, 2), l = (e) => {
		var n = Gi(), r = z(n, !0);
		P(n), H(() => J(r, t.comment.title)), q(e, n);
	}, u = (e) => {
		var r = Ki();
		Z(r), H(() => Q(r, t.comment.title)), W("focus", r, () => t.actions.select(t.comment.id)), W("pointerdown", r, n, !0), W("mousedown", r, n, !0), W("click", r, n, !0), W("keydown", r, n, !0), G("change", r, (e) => {
			t.comment.readOnly || t.actions.update(t.comment.id, { title: e.currentTarget.value });
		}), q(e, r);
	};
	Y(c, (e) => {
		t.comment.readOnly ? e(l) : e(u, -1);
	}), P(o);
	var d = V(o, 2), f = z(d, !0);
	P(d);
	var p = V(d, 2), m = (e) => {
		var n = qi();
		H(() => $(n, "aria-label", `Resize comment: ${t.comment.title}`)), G("click", n, (e) => {
			e.detail === 0 && t.actions.select(t.comment.id);
		}), q(e, n);
	};
	Y(p, (e) => {
		t.comment.readOnly || e(m);
	}), P(r), H(() => {
		i = ci(r, 1, "pc-comment-frame svelte-118xm2r", null, i, {
			"pc-comment-selected": t.comment.selected,
			"pc-comment-readonly": t.comment.readOnly
		}), $(r, "data-id", t.comment.id), $(r, "aria-label", `Comment: ${t.comment.title}`), a = ui(r, "", a, {
			left: `${t.comment.x}px`,
			top: `${t.comment.y}px`,
			width: `${t.comment.w}px`,
			height: `${t.comment.h}px`,
			"--frame-color": t.comment.color
		}), $(s, "aria-label", `Select comment: ${t.comment.title}`), J(f, t.comment.content);
	}), G("click", s, (e) => {
		e.detail === 0 && t.actions.select(t.comment.id);
	}), q(e, r), He();
}
Cr(["click", "change"]);
//#endregion
//#region ui/NodeProfilePicker.svelte
var Xi = /* @__PURE__ */ K("<div class=\"node-model-meta svelte-jdmiua\"> </div>"), Zi = /* @__PURE__ */ Mr("<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-jdmiua\"><path d=\"m5 12 4 4L19 6\" class=\"svelte-jdmiua\"></path></svg>"), Qi = /* @__PURE__ */ K("<button type=\"button\" role=\"option\"><span class=\"profile-option-copy svelte-jdmiua\"><span class=\"profile-name svelte-jdmiua\"> </span><span class=\"profile-meta svelte-jdmiua\"> </span></span><span class=\"profile-check svelte-jdmiua\"><!></span></button>"), $i = /* @__PURE__ */ K("<div class=\"profile-error svelte-jdmiua\" role=\"alert\"> </div>"), ea = /* @__PURE__ */ K("<div class=\"profile-menu svelte-jdmiua\"><div class=\"profile-search svelte-jdmiua\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-jdmiua\"><circle cx=\"10\" cy=\"10\" r=\"6\" class=\"svelte-jdmiua\"></circle><path d=\"m15 15 5 5\" class=\"svelte-jdmiua\"></path></svg><input role=\"combobox\" aria-label=\"Search connection profiles\" aria-autocomplete=\"list\" aria-expanded=\"true\" placeholder=\"Search connection profiles…\" autocomplete=\"off\" spellcheck=\"false\" maxlength=\"200\" class=\"svelte-jdmiua\"/></div> <div class=\"profile-options svelte-jdmiua\" role=\"listbox\" aria-label=\"Connection profiles\"></div> <!></div>"), ta = /* @__PURE__ */ K("<div class=\"pc-node-profile svelte-jdmiua\" role=\"group\" aria-label=\"Node connection profile\"><!> <div class=\"profile-picker svelte-jdmiua\"><button type=\"button\" class=\"profile-bar svelte-jdmiua\" aria-haspopup=\"listbox\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-jdmiua\"><path d=\"M12 22v-5M15 8V2M17 8a1 1 0 0 1 1 1v4a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1zM9 8V2\" class=\"svelte-jdmiua\"></path></svg><span class=\"profile-value svelte-jdmiua\"> </span><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-jdmiua\"><path d=\"m6 9 6 6 6-6\" class=\"svelte-jdmiua\"></path></svg></button> <!></div></div>");
function na(e, t) {
	Ve(t, !0);
	let n = /* @__PURE__ */ L(!1), r = /* @__PURE__ */ L(""), i = /* @__PURE__ */ L(0), a = /* @__PURE__ */ L(""), o = /* @__PURE__ */ L(!1), s = -1, c = 0, l = !1, u = /* @__PURE__ */ L(35), d, f, p = /* @__PURE__ */ L(void 0), m = /* @__PURE__ */ L(void 0), h = (e) => e.stopPropagation();
	function g(e) {
		let t = (e) => {
			ne(e);
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
		R(u, c.height > 0 ? c.height / l : 35, !0), window.dispatchEvent(new CustomEvent("pc-node-profile-open", { detail: d })), s = t.row.authorityVersion, R(r, ""), R(a, ""), R(o, !1), R(i, Math.max(0, U(v).findIndex((e) => e.value === t.row.value)), !0), R(n, !0), await dr(), U(n) && (U(p)?.focus({ preventScroll: !0 }), U(m) && (U(m).scrollTop = 0));
	}
	function ee() {
		let e = U(v).find((e) => e.active);
		R(i, !U(_).length || e && U(_).every((t) => e.label.toLocaleLowerCase().includes(t)) ? 0 : U(v).length > 1 ? 1 : -1, !0), U(m) && (U(m).scrollTop = 0);
	}
	async function te(e) {
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
	async function ne(e) {
		h(e), U(n) ? e.key === "Escape" ? (e.preventDefault(), k(!0)) : e.key === "ArrowDown" || e.key === "ArrowUp" ? (e.preventDefault(), R(i, Math.max(0, Math.min(U(v).length - 1, U(i) + (e.key === "ArrowDown" ? 1 : -1))), !0), await dr(), U(m)?.querySelector(".is-active")?.scrollIntoView?.({ block: "nearest" }), U(p)?.focus({ preventScroll: !0 })) : e.key === "Enter" && e.target === U(p) && (e.preventDefault(), U(v)[U(i)] && await te(U(v)[U(i)])) : [
			"ArrowDown",
			"ArrowUp",
			"Enter",
			" "
		].includes(e.key) && (e.preventDefault(), await A());
	}
	function j(e) {
		e.preventDefault(), h(e), U(m) && (U(m).scrollTop += e.deltaY * (e.deltaMode === 1 ? 18 : e.deltaMode === 2 ? U(m).clientHeight : 1));
	}
	bn(() => {
		U(n) && (t.row.authorityVersion !== s || !t.row.editable) && k(!1, !0);
	});
	var re = ta();
	W("pointerdown", nn, (e) => {
		(U(n) || l) && !d.contains(e.target) && k();
	});
	let ie;
	var ae = z(re), oe = (e) => {
		var n = Xi(), r = z(n, !0);
		P(n), H(() => {
			$(n, "title", t.row.model), J(r, t.row.model);
		}), q(e, n);
	};
	Y(ae, (e) => {
		t.row.model && e(oe);
	});
	var se = V(ae, 2);
	let ce;
	var le = z(se), ue = V(z(le)), de = z(ue, !0);
	P(ue), Ae(), P(le), Di(le, (e) => f = e, () => f);
	var fe = V(le, 2), pe = (e) => {
		var n = ea();
		let s;
		var c = z(n), l = V(z(c));
		Z(l), Di(l, (e) => R(p, e), () => U(p)), P(c);
		var d = V(c, 2);
		let f;
		X(d, 23, () => U(v), (e) => e.value, (e, n, r) => {
			var a = Qi();
			let s;
			var c = z(a), l = z(c), u = z(l, !0);
			P(l);
			var d = V(l), f = z(d, !0);
			P(d), P(c);
			var p = V(c), m = z(p), h = (e) => {
				q(e, Zi());
			};
			Y(m, (e) => {
				U(n).value === t.row.value && e(h);
			}), P(p), P(a), H((e, c) => {
				$(a, "id", e), s = ci(a, 1, "profile-option svelte-jdmiua", null, s, { "is-active": U(r) === U(i) }), $(a, "aria-selected", U(n).value === t.row.value), a.disabled = U(o), $(l, "title", U(n).label), J(u, U(n).label), J(f, c);
			}, [() => O(U(r)), () => U(n).active ? "Follows SillyTavern’s current model" : [U(n).apiLabel, U(n).model].filter(Boolean).join(" · ")]), G("click", a, () => te(U(n))), q(e, a);
		}), P(d), Di(d, (e) => R(m, e), () => U(m));
		var h = V(d, 2), g = (e) => {
			var t = $i(), n = z(t, !0);
			P(t), H(() => J(n, U(a))), q(e, t);
		};
		Y(h, (e) => {
			U(a) && e(g);
		}), P(n), H((e) => {
			s = ui(n, "", s, {
				width: `${U(y)}px`,
				left: `${U(b)}px`,
				top: U(T) ? `${U(D)}px` : U(w) ? "auto" : `${U(u) + 6}px`,
				bottom: !U(T) && U(w) ? `${U(u) + 6}px` : "auto"
			}), $(l, "aria-controls", `${t.row.id}-profile-list`), $(l, "aria-activedescendant", e), $(d, "id", `${t.row.id}-profile-list`), f = ui(d, "", f, { "max-height": `${U(E)}px` });
		}, [() => U(i) >= 0 && U(v).length ? O(U(i)) : void 0]), G("input", l, ee), Ci(l, () => U(r), (e) => R(r, e)), W("wheel", d, j), q(e, n);
	};
	Y(fe, (e) => {
		U(n) && e(pe);
	}), P(se), P(re), Di(re, (e) => d = e, () => d), $r(re, (e) => g?.(e)), H(() => {
		$(re, "data-id", t.row.id), ie = ui(re, "", ie, {
			left: `${t.row.x}px`,
			top: `${t.row.y}px`,
			width: `${t.row.w}px`,
			"z-index": U(n) ? 20 : 2
		}), ce = ui(se, "", ce, { top: `${U(x)}px` }), $(le, "title", t.row.label), $(le, "aria-label", `Connection profile: ${t.row.label}`), $(le, "aria-expanded", U(n)), le.disabled = !t.row.editable, J(de, t.row.label);
	}), W("wheel", re, h), G("click", le, () => U(n) ? k() : A()), q(e, re), He();
}
Cr(["click", "input"]);
//#endregion
//#region ui/CanvasLayer.svelte
var ra = /* @__PURE__ */ K("<div class=\"pc-viewport\" data-pc-renderer=\"svelte\"><div class=\"pc-comment-layer svelte-o7b704\"></div> <svg class=\"pc-wires\" aria-label=\"Canvas connections\"><!></svg> <div class=\"pc-nodes\"><!> <!> <!></div> <div class=\"pc-node-profile-layer svelte-o7b704\"></div></div>");
function ia(e, t) {
	Ve(t, !0);
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
	}, S = ra(), C = z(S);
	X(C, 21, () => U(a), (e) => e.id, (e, t) => {
		Yi(e, {
			get comment() {
				return U(t);
			},
			get actions() {
				return U(s);
			}
		});
	}), P(C), Di(C, (e) => p = e, () => p);
	var w = V(C, 2);
	Wi(z(w), {
		get wires() {
			return U(i);
		},
		get ghost() {
			return U(c);
		}
	}), P(w), Di(w, (e) => d = e, () => d);
	var T = V(w, 2), E = z(T);
	X(E, 17, () => U(r).filter((e) => !e.collapsed), (e) => e.id, (e, n) => {
		Bi(e, {
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
		Li(e, {
			get card() {
				return U(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), X(V(D, 2), 17, () => U(r).filter((e) => e.collapsed), (e) => e.id, (e, n) => {
		Bi(e, {
			get group() {
				return U(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), P(T), Di(T, (e) => f = e, () => f);
	var O = V(T, 2);
	return X(O, 21, () => U(o), (e) => e.id, (e, n) => {
		na(e, {
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
	}), P(O), P(S), Di(S, (e) => u = e, () => u), H(() => {
		$(w, "width", U(l).w), $(w, "height", U(l).h), $(w, "viewBox", `0 0 ${U(l).w} ${U(l).h}`);
	}), q(e, S), He(x);
}
//#endregion
//#region ui/WorkspaceMenus.svelte
var aa = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-flat-menu\" aria-haspopup=\"menu\"> </button>"), oa = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\"><span> </span><small> </small></button>"), sa = /* @__PURE__ */ K("<div class=\"pc-workspace-menu-panel\" role=\"menu\" tabindex=\"-1\"></div>"), ca = /* @__PURE__ */ K("<nav class=\"pc-workspace-menus\" aria-label=\"Workspace menus\"><!> <!></nav>");
function la(e, t) {
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
				...U(n) && [
					"unified",
					"pre",
					"post"
				].includes(U(n).phase) ? [u(U(n).phase === "unified" ? U(n).assigned ? "Unified workflow assigned" : "Assign unified workflow" : U(n).assigned ? "Assigned to legacy " + U(n).phase + " phase" : "Assign legacy " + U(n).phase + " phase", "assign-workflow-phase", "", U(n).assigned || U(n).busy)] : [],
				u("Run workflow", "run-workflow", "", !U(n) || !!U(n)?.busy || !!U(n)?.issues.length),
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
		R(r, e, !0), o = t, await dr();
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
	var g = ca();
	W("pointerdown", tn, (e) => {
		U(r) && !i.contains(e.target) && !U(a)?.contains(e.target) && f();
	}), W("resize", tn, () => f());
	var _ = z(g);
	X(_, 17, () => l, Wr, (e, t) => {
		var n = aa(), i = z(n, !0);
		P(n), H(() => {
			$(n, "data-menu", U(t)), $(n, "aria-expanded", U(r) === U(t)), J(i, U(t));
		}), G("click", n, (e) => p(U(t), e.currentTarget)), G("keydown", n, h), q(e, n);
	});
	var v = V(_, 2), y = (e) => {
		var t = sa();
		let n;
		X(t, 21, () => d(U(r)), Wr, (e, t) => {
			var n = oa(), r = z(n), i = z(r, !0);
			P(r);
			var a = V(r), o = z(a, !0);
			P(a), P(n), H(() => {
				n.disabled = U(t).disabled, J(i, U(t).label), J(o, U(t).shortcut);
			}), G("click", n, () => m(U(t).command)), q(e, n);
		}), P(t), Di(t, (e) => R(a, e), () => U(a)), H(() => {
			$(t, "aria-label", U(r)), n = ui(t, "", n, {
				left: `${U(s)}px`,
				top: `${U(c)}px`
			});
		}), G("keydown", t, h), q(e, t);
	};
	Y(v, (e) => {
		U(r) && e(y);
	}), P(g), Di(g, (e) => i = e, () => i), q(e, g), He();
}
Cr(["click", "keydown"]);
//#endregion
//#region ui/Toolbar.svelte
var ua = /* @__PURE__ */ K("<option> </option>"), da = /* @__PURE__ */ K("<header class=\"pc-header\" data-pc-ui=\"svelte\"><div class=\"pc-menubar\"><div class=\"pc-brand\"><img width=\"30\" height=\"30\" alt=\"\"/><span>LATTICE</span></div> <!> <button type=\"button\" class=\"pc-btn menu_button pc-close\" title=\"Close\" aria-label=\"Close canvas\">×</button></div> <div class=\"pc-workflow-bar\"><select class=\"pc-select pc-graph-select text_pole\" aria-label=\"Workflow\"></select> <div class=\"pc-header-actions pc-history\"><button type=\"button\" aria-label=\"Undo\">↶</button> <button type=\"button\" aria-label=\"Redo\">↷</button> <span> </span></div> <button type=\"button\" class=\"pc-btn menu_button pc-root-run\"> </button> <span class=\"pc-root-workflow-status\" role=\"status\"> </span> <div class=\"pc-header-actions pc-surface-actions\"><button type=\"button\" title=\"Show or hide the inspector\" aria-label=\"Toggle inspector\">Details</button></div> <label class=\"pc-arm\"><input class=\"pc-arm-input\" type=\"checkbox\"/><span>Arm</span></label></div></header>");
function fa(e, t) {
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
	}, u = da(), d = z(u), f = z(d), p = z(f);
	Ae(), P(f);
	var m = V(f, 2);
	la(m, {
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
		var n = ua(), r = z(n, !0);
		P(n);
		var i = {};
		H(() => {
			J(r, U(t).name), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
		}), q(e, n);
	}), P(_), Di(_, (e) => i = e, () => i);
	var v;
	fi(_);
	var y = V(_, 2), b = z(y), x = V(b, 2), S = V(x, 2), C = z(S, !0);
	P(S), P(y);
	var w = V(y, 2), T = z(w, !0);
	P(w);
	var E = V(w, 2), D = z(E);
	P(E);
	var O = V(E, 2), k = z(O);
	Di(k, (e) => o = e, () => o), P(O);
	var A = V(O, 2), ee = z(A);
	return Z(ee), Di(ee, (e) => a = e, () => a), Ae(), P(A), P(g), P(u), Di(u, (e) => r = e, () => r), H((e) => {
		$(p, "src", t.actions.logoUrl), v !== (v = t.state.graphId) && (_.value = (_.__value = t.state.graphId) ?? "", di(_, t.state.graphId)), ci(b, 1, `pc-btn menu_button pc-undo${t.state.history.undo ? "" : " pc-disabled"}`), b.disabled = !t.state.history.undo, $(b, "title", t.state.history.undoTitle), ci(x, 1, `pc-btn menu_button pc-redo${t.state.history.redo ? "" : " pc-disabled"}`), x.disabled = !t.state.history.redo, $(x, "title", t.state.history.redoTitle), ci(S, 1, `pc-history-note${t.state.history.showNote ? " pc-show" : ""}`), J(C, t.state.history.note), w.disabled = !U(n) || !U(n).busy && !!U(n).issues.length, $(w, "title", e), J(T, U(n)?.busy ? "■ Stop" : "▶ Run"), J(D, `${U(n) ? `${U(n).phase} · ${U(n).assigned ? "Assigned" : "Unassigned"} · ≤ ${U(n).callBound} requests` : "Workflow unavailable"} · Autosave in SillyTavern`), ci(k, 1, `pc-btn menu_button pc-pane-toggle${t.state.inspectorOpen ? " pc-on" : ""}`), $(k, "aria-pressed", t.state.inspectorOpen), yi(ee, t.state.armed);
	}, [() => U(n)?.issues.join("\n") || "Run the root workflow"]), G("click", h, () => t.actions.command("close")), G("change", _, (e) => t.actions.pickGraph(e.currentTarget.value)), G("click", b, () => t.actions.command("undo")), G("click", x, () => t.actions.command("redo")), G("click", w, () => t.actions.command(U(n)?.busy ? "stop-workflow" : "run-workflow")), G("click", k, () => t.actions.command("inspector")), G("change", ee, (e) => t.actions.arm(e.currentTarget.checked)), q(e, u), He(l);
}
Cr(["click", "change"]);
//#endregion
//#region ui/PaneDivider.svelte
var pa = /* @__PURE__ */ K("<div class=\"pc-pane-divider\" role=\"separator\" aria-label=\"Resize preview\" aria-orientation=\"horizontal\" tabindex=\"0\"></div>");
function ma(e, t) {
	Ve(t, !0);
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
	var f = pa();
	W("blur", tn, u), Di(f, (e) => i = e, () => i), H((e, t) => {
		$(f, "aria-valuemin", n()), $(f, "aria-valuemax", e), $(f, "aria-valuenow", t);
	}, [() => Math.round(r()), () => Math.round(t.height)]), G("pointerdown", f, s), G("pointermove", f, c), G("pointerup", f, (e) => l(!1, e.pointerId)), W("pointercancel", f, (e) => l(!0, e.pointerId)), W("lostpointercapture", f, (e) => l(!0, e.pointerId)), G("keydown", f, d), q(e, f), He();
}
Cr([
	"pointerdown",
	"pointermove",
	"pointerup",
	"keydown"
]);
//#endregion
//#region ui/DetailsDivider.svelte
var ha = /* @__PURE__ */ K("<div class=\"pc-details-divider svelte-1iyzcro\" role=\"separator\" aria-label=\"Resize Details\" aria-orientation=\"vertical\" tabindex=\"0\"></div>");
function ga(e, t) {
	Ve(t, !0);
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
	var f = ha();
	W("blur", tn, c), Di(f, (e) => i = e, () => i), H((e, t) => {
		$(f, "aria-valuemin", n()), $(f, "aria-valuemax", e), $(f, "aria-valuenow", t);
	}, [() => Math.round(r()), () => Math.round(t.width)]), G("pointerdown", f, l), G("pointermove", f, u), G("pointerup", f, (e) => s(!1, e.pointerId)), W("pointercancel", f, (e) => s(!0, e.pointerId)), W("lostpointercapture", f, (e) => s(!0, e.pointerId)), G("keydown", f, d), q(e, f), He();
}
Cr([
	"pointerdown",
	"pointermove",
	"pointerup",
	"keydown"
]);
//#endregion
//#region ui/GraphTabs.svelte
var _a = /* @__PURE__ */ K("<span class=\"pc-graph-tab-lock svelte-7ptwed\" aria-label=\"Read only\">◇</span>"), va = /* @__PURE__ */ K("<input type=\"text\" title=\"Enter to save, Escape to cancel\"/>"), ya = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-graph-tab-close svelte-7ptwed\">×</button>"), ba = /* @__PURE__ */ K("<div><button type=\"button\" role=\"tab\" aria-haspopup=\"menu\"><span class=\"svelte-7ptwed\"> </span><!></button> <!> <!></div>"), xa = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button>"), Sa = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Save workflow</button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close tab</button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close other tabs</button> <!>", 1), Ca = /* @__PURE__ */ K("<!> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close active view</button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close other views</button> <!>", 1), wa = /* @__PURE__ */ K("<div role=\"menu\" tabindex=\"-1\"><!></div>"), Ta = /* @__PURE__ */ K("<nav aria-label=\"Open graph views\"><div class=\"pc-graph-tab-list svelte-7ptwed\" role=\"tablist\" aria-label=\"Graph views\"></div> <button type=\"button\" class=\"pc-graph-view-overflow svelte-7ptwed\" aria-label=\"Graph view actions\" title=\"Focus, close or reopen graph views\" aria-haspopup=\"menu\">⋯</button> <!></nav>");
function Ea(e, t) {
	Ve(t, !0);
	let n = Oi(t, "actions", 19, () => ({})), r = Oi(t, "idPrefix", 3, "pc-graph-view"), i = /* @__PURE__ */ L(null), a = /* @__PURE__ */ L(null), o = /* @__PURE__ */ L(null), s = /* @__PURE__ */ L(!1), c = /* @__PURE__ */ L(""), l = /* @__PURE__ */ L(""), u = /* @__PURE__ */ L(0), d = /* @__PURE__ */ L(0), f = "", p = /* @__PURE__ */ L(""), m = /* @__PURE__ */ L(""), h = /* @__PURE__ */ L(null), g = "", _ = null, v = 0, y = /* @__PURE__ */ F(() => t.views?.tabs.find((e) => e.key === U(l))), b = {};
	bn(() => {
		let e = t.views?.active.key ?? "";
		f === e ? t.views && !t.views.tabs.some((e) => e.key === U(c)) && R(c, e, !0) : (R(c, e, !0), O(), R(p, "")), U(l) && !U(y) && O(), U(p) && (t.views?.workflowId !== g || !t.views.tabs.some((e) => e.key === U(p))) && R(p, ""), f = e;
	});
	async function x(e) {
		let r = t.views?.tabs.find((t) => t.key === e);
		if (!r || r.identity.kind === "library" || !n().renameView || n().canRenameView?.(e) === !1) return;
		let i = ++v;
		_ = null, O(), g = t.views.workflowId, R(m, r.label, !0), R(p, e, !0), await dr(), U(p) === e && v === i && (_ = U(h), U(h)?.focus({ preventScroll: !0 }), U(h)?.select());
	}
	async function S(e, r, i = !0) {
		let a = U(p), o = t.views?.tabs.find((e) => e.key === a), s = U(m).trim();
		a && e === _ && (R(p, ""), _ = null, r && o && s && s !== o.label && t.views?.workflowId === g && o.identity.kind !== "library" && n().canRenameView?.(a) !== !1 && n().renameView?.(a, s), i && (await dr(), b[a]?.focus({ preventScroll: !0 })));
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
		n().closeView?.(e.key), await dr();
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
		if (R(l, e.key, !0), R(u, t, !0), R(d, n, !0), R(s, !0), await dr(), !U(s) || U(l) !== e.key) return;
		let r = U(a)?.getBoundingClientRect();
		R(u, Math.min(Math.max(8, t), Math.max(8, window.innerWidth - (r?.width ?? 0) - 8)), !0), R(d, Math.min(Math.max(8, n), Math.max(8, window.innerHeight - (r?.height ?? 0) - 8)), !0), U(a)?.querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
	}
	async function ee() {
		let e = !!U(l);
		R(l, ""), R(s, e || !U(s), !0), U(s) && (await dr(), U(s) && U(a)?.querySelector("button:not(:disabled)")?.focus());
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
		let t = [...U(a).querySelectorAll("button:not(:disabled)")], n = t.indexOf(e.target);
		t[e.key === "Home" ? 0 : e.key === "End" ? t.length - 1 : (n + (e.key === "ArrowUp" ? t.length - 1 : 1)) % t.length]?.focus();
	}
	function ne(e) {
		O(!0), e();
	}
	function j(e) {
		let t = U(y);
		t && (O(!0), e(t));
	}
	var re = { startRename: x }, ie = Pr();
	W("pointerdown", tn, (e) => {
		U(s) && !U(a)?.contains(e.target) && e.target !== U(o) && O();
	}), W("resize", tn, () => O());
	var ae = B(ie), oe = (e) => {
		var f = Ta();
		let g;
		var _ = z(f);
		X(_, 23, () => t.views.tabs, (e) => e.key, (e, n, i) => {
			var a = ba();
			let o;
			var u = z(a);
			let d;
			var f = z(u), g = z(f, !0);
			P(f);
			var _ = V(f), v = (e) => {
				q(e, _a());
			};
			Y(_, (e) => {
				U(n).readOnly && e(v);
			}), P(u), Di(u, (e, t) => b[t.key] = e, (e) => b?.[e.key], () => [U(n)]);
			var y = V(u, 2), x = (e) => {
				var t = va();
				Z(t);
				let r;
				Di(t, (e) => R(h, e), () => U(h)), H(() => {
					r = ci(t, 1, "pc-graph-tab-rename svelte-7ptwed", null, r, { "pc-graph-tab-closeable": U(n).identity.kind !== "root" }), $(t, "aria-label", U(n).identity.kind === "root" ? "Graph name" : "Subgraph name"), $(t, "maxlength", U(n).identity.kind === "instance" ? 80 : void 0);
				}), G("keydown", t, C), W("blur", t, (e) => S(e.currentTarget, !0, !1)), Ci(t, () => U(m), (e) => R(m, e)), q(e, t);
			};
			Y(y, (e) => {
				U(p) === U(n).key && e(x);
			});
			var O = V(y, 2), A = (e) => {
				var r = ya();
				H((e, i) => {
					$(r, "aria-label", e), $(r, "title", i), $(r, "tabindex", U(n).key === (U(c) || t.views.active.key) ? 0 : -1);
				}, [() => `Close ${U(n).label} · ${w(U(n))}`, () => `Close ${w(U(n))}`]), G("click", r, () => D(U(n))), G("contextmenu", r, (e) => k(e, U(n))), G("keydown", r, (e) => E(e, U(i))), q(e, r);
			};
			Y(O, (e) => {
				U(n).identity.kind !== "root" && e(A);
			}), P(a), H((e) => {
				o = ci(a, 1, "pc-graph-tab-item svelte-7ptwed", null, o, {
					"pc-graph-tab-active": U(n).key === t.views.active.key,
					"pc-graph-tab-editing": U(p) === U(n).key
				}), d = ci(u, 1, "pc-graph-tab svelte-7ptwed", null, d, { "pc-graph-tab-closeable": U(n).identity.kind !== "root" }), $(u, "id", `${r()}-${U(i)}`), $(u, "aria-controls", t.panelId), $(u, "aria-selected", U(n).key === t.views.active.key), $(u, "aria-expanded", U(s) && U(l) === U(n).key), $(u, "tabindex", U(p) !== U(n).key && U(n).key === (U(c) || t.views.active.key) ? 0 : -1), $(u, "title", e), J(g, U(n).label);
			}, [() => w(U(n))]), G("click", u, () => T(U(n).key)), G("pointerdown", u, (e) => {
				e.button === 2 && e.preventDefault();
			}), G("contextmenu", u, (e) => k(e, U(n))), G("keydown", u, (e) => E(e, U(i))), q(e, a);
		}), P(_);
		var v = V(_, 2);
		Di(v, (e) => R(o, e), () => U(o));
		var O = V(v, 2), A = (e) => {
			var r = wa();
			let i;
			var o = z(r), s = (e) => {
				let r = /* @__PURE__ */ F(() => U(y)), i = /* @__PURE__ */ F(() => n().canRenameView?.(U(r).key) === !1);
				var a = Sa(), o = B(a), s = V(o, 2), c = z(s, !0);
				P(s);
				var l = V(s, 2), u = z(l, !0);
				P(l);
				var d = V(l, 2), f = V(d, 2);
				X(V(f, 2), 17, () => t.views.closedViews, (e) => e.key, (e, t) => {
					var r = xa(), i = z(r);
					P(r), H((e, a) => {
						r.disabled = !n().reopenView, $(r, "title", e), J(i, `Reopen ${U(t).label ?? ""} · ${a ?? ""}`);
					}, [() => w(U(t)), () => w(U(t))]), G("click", r, () => ne(() => n().reopenView?.(U(t).key))), q(e, r);
				}), H((e) => {
					o.disabled = !n().saveView, s.disabled = !n().exportView, J(c, U(r).identity.kind === "root" ? "Export workflow JSON" : "Export subgraph JSON"), l.disabled = U(r).identity.kind === "library" || U(i) || !n().renameView, $(l, "title", U(r).identity.kind === "library" ? "Library inspection is read only." : U(i) ? "Make a local copy of the containing graph to rename this subgraph." : void 0), J(u, U(r).identity.kind === "root" ? "Rename graph" : "Rename subgraph"), d.disabled = U(r).identity.kind === "root" || !n().closeView, f.disabled = e;
				}, [() => t.views.tabs.every((e) => e.identity.kind === "root" || e.key === U(r).key) || !n().closeOtherViews]), G("click", o, () => j((e) => n().saveView?.(e.key))), G("click", s, () => j((e) => n().exportView?.(e.key))), G("click", l, () => j((e) => x(e.key))), G("click", d, () => j((e) => D(e))), G("click", f, () => j((e) => n().closeOtherViews?.(e.key))), q(e, a);
			}, c = (e) => {
				var r = Ca(), i = B(r);
				X(i, 17, () => t.views.tabs, (e) => e.key, (e, t) => {
					var n = xa(), r = z(n);
					P(n), H((e, t) => {
						$(n, "title", e), J(r, `Focus ${t ?? ""}`);
					}, [() => w(U(t)), () => w(U(t))]), G("click", n, () => ne(() => T(U(t).key))), q(e, n);
				});
				var a = V(i, 2), o = V(a, 2);
				X(V(o, 2), 17, () => t.views.closedViews, (e) => e.key, (e, t) => {
					var r = xa(), i = z(r);
					P(r), H((e, n) => {
						$(r, "title", e), J(i, `Reopen ${U(t).label ?? ""} · ${n ?? ""}`);
					}, [() => w(U(t)), () => w(U(t))]), G("click", r, () => ne(() => n().reopenView?.(U(t).key))), q(e, r);
				}), H((e) => {
					a.disabled = t.views.active.identity.kind === "root" || !n().closeView, o.disabled = e;
				}, [() => t.views.tabs.every((e) => e.identity.kind === "root" || e.key === t.views.active.key) || !n().closeOtherViews]), G("click", a, () => ne(() => D(t.views.active))), G("click", o, () => ne(() => n().closeOtherViews?.(t.views.active.key))), q(e, r);
			};
			Y(o, (e) => {
				U(y) ? e(s) : e(c, -1);
			}), P(r), Di(r, (e) => R(a, e), () => U(a)), H(() => {
				i = ci(r, 1, "pc-graph-view-menu svelte-7ptwed", null, i, { "pc-graph-tab-menu": !!U(l) }), ui(r, U(l) ? `left: ${U(u)}px; top: ${U(d)}px;` : void 0), $(r, "aria-label", U(y) ? `Actions for ${U(y).label}` : "Graph view actions");
			}), G("keydown", r, te), q(e, r);
		};
		Y(O, (e) => {
			U(s) && e(A);
		}), P(f), Di(f, (e) => R(i, e), () => U(i)), H(() => {
			g = ci(f, 1, "pc-graph-tabs pc-graph-tabs-multi svelte-7ptwed", null, g, { "pc-graph-tabs-menu-open": U(s) }), $(v, "aria-expanded", U(s) && !U(l));
		}), G("click", v, ee), q(e, f);
	};
	return Y(ae, (e) => {
		t.views && e(oe);
	}), q(e, ie), He(re);
}
Cr([
	"click",
	"pointerdown",
	"contextmenu",
	"keydown"
]);
//#endregion
//#region ui/GraphBreadcrumbs.svelte
var Da = /* @__PURE__ */ K("<span aria-current=\"page\" class=\"svelte-18ovafz\"> </span>"), Oa = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-18ovafz\"> </button>"), ka = /* @__PURE__ */ K("<li class=\"svelte-18ovafz\"><!></li>"), Aa = /* @__PURE__ */ K("<div class=\"pc-graph-location svelte-18ovafz\"><nav aria-label=\"Graph location\" class=\"svelte-18ovafz\"><ol class=\"svelte-18ovafz\"></ol></nav> <span class=\"pc-graph-scope svelte-18ovafz\"> <!><!></span></div>");
function ja(e, t) {
	Ve(t, !0);
	let n = Oi(t, "actions", 19, () => ({})), r = /* @__PURE__ */ F(() => t.view?.identity.kind === "library" ? t.view.identity.definitionRef : t.definitionRef ?? t.view?.definitionRef);
	function i(e) {
		return e.identity.kind === "instance" ? !!n().openInstance : !!n().focusView;
	}
	function a(e) {
		e.identity.kind === "instance" ? n().openInstance?.(e.identity.instancePath) : n().focusView?.(e.key);
	}
	var o = Pr(), s = B(o), c = (e) => {
		var n = Aa(), o = z(n), s = z(o);
		X(s, 23, () => t.view.breadcrumbs, (e) => e.key, (e, n, r) => {
			var o = ka(), s = z(o), c = (e) => {
				var t = Da(), r = z(t, !0);
				P(t), H(() => J(r, U(n).label)), q(e, t);
			}, l = (e) => {
				var t = Oa(), r = z(t, !0);
				P(t), H((e) => {
					t.disabled = e, J(r, U(n).label);
				}, [() => !i(U(n))]), G("click", t, () => a(U(n))), q(e, t);
			};
			Y(s, (e) => {
				U(r) === t.view.breadcrumbs.length - 1 ? e(c) : e(l, -1);
			}), P(o), q(e, o);
		}), P(s), P(o);
		var c = V(o, 2), l = z(c, !0), u = V(l), d = (e) => {
			var t = Nr();
			H(() => J(t, `· v${U(r).version ?? ""}`)), q(e, t);
		};
		Y(u, (e) => {
			U(r) && e(d);
		});
		var f = V(u), p = (e) => {
			q(e, Nr("· Read only"));
		};
		Y(f, (e) => {
			(t.view.readOnly || t.view.identity.kind === "library") && e(p);
		}), P(c), P(n), H(() => {
			$(c, "title", U(r) ? `${U(r).id} · v${U(r).version} · ${U(r).semanticHash}` : void 0), J(l, t.view.identity.kind === "library" ? "Library inspection" : "Instance graph");
		}), q(e, n);
	};
	Y(s, (e) => {
		t.view && t.view.identity.kind !== "root" && e(c);
	}), q(e, o), He();
}
Cr(["click"]);
//#endregion
//#region ui/StructuredControl.svelte
var Ma = /* @__PURE__ */ K("<small class=\"svelte-taw2zx\">Rows are available when this JSON has a supported shape.</small>"), Na = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\"> </label><textarea class=\"pc-structured-raw svelte-taw2zx\" spellcheck=\"false\"></textarea> <!>", 1), Pa = /* @__PURE__ */ K("<option class=\"svelte-taw2zx\"> </option>"), Fa = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">Phase</label><select class=\"svelte-taw2zx\"></select> <label class=\"svelte-taw2zx\">Steps</label><input type=\"number\" min=\"1\" max=\"64\" step=\"1\" class=\"svelte-taw2zx\"/>", 1), Ia = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">Name</label><input maxlength=\"128\" class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Value</label><input type=\"number\" step=\"any\" class=\"svelte-taw2zx\"/>", 1), La = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">Default (JSON)</label><textarea class=\"svelte-taw2zx\"></textarea>", 1), Ra = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">Name</label><input class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Path (JSON array)</label><input class=\"svelte-taw2zx\"/> <label class=\"pc-structured-check svelte-taw2zx\"><input type=\"checkbox\" class=\"svelte-taw2zx\"/> Required</label> <label class=\"pc-structured-check svelte-taw2zx\"><input type=\"checkbox\" class=\"svelte-taw2zx\"/> Use default when missing</label><small class=\"svelte-taw2zx\">Defaults apply when Required is off.</small> <!>", 1), za = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">ID</label><input maxlength=\"128\" class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Label</label><input maxlength=\"80\" class=\"svelte-taw2zx\"/>", 1), Ba = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">Name</label><input class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Text</label><textarea class=\"svelte-taw2zx\"></textarea>", 1), Va = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">Kind</label><select class=\"svelte-taw2zx\"><option class=\"svelte-taw2zx\">Literal</option><option class=\"svelte-taw2zx\">Regular expression</option></select> <label class=\"svelte-taw2zx\">Pattern</label><input class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Replacement</label><textarea class=\"svelte-taw2zx\"></textarea> <label class=\"svelte-taw2zx\">Flags</label><input class=\"svelte-taw2zx\"/>", 1), Ha = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-taw2zx\">Move up</button><button type=\"button\" class=\"svelte-taw2zx\">Move down</button>", 1), Ua = /* @__PURE__ */ K("<fieldset class=\"pc-structured-row svelte-taw2zx\"><legend class=\"svelte-taw2zx\"> </legend> <!> <div class=\"pc-structured-actions svelte-taw2zx\"><!><button type=\"button\" class=\"svelte-taw2zx\">Remove</button></div></fieldset>"), Wa = /* @__PURE__ */ K("<div class=\"pc-structured-rows svelte-taw2zx\"></div> <button type=\"button\" class=\"svelte-taw2zx\"> </button>", 1), Ga = /* @__PURE__ */ K("<div class=\"pc-structured-control svelte-taw2zx\"><div class=\"pc-structured-mode svelte-taw2zx\"><button type=\"button\" class=\"svelte-taw2zx\"> </button></div> <!></div>");
function Ka(e, t) {
	Ve(t, !0);
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
	var E = Ga(), D = z(E), O = z(D), k = z(O, !0);
	P(O), P(D);
	var A = V(D, 2), ee = (e) => {
		var i = Na(), a = B(i), o = z(a);
		P(a);
		var s = V(a);
		rt(s);
		var c = V(s, 2), l = (e) => {
			q(e, Ma());
		};
		Y(c, (e) => {
			U(f) || e(l);
		}), H(() => {
			$(a, "for", t.idPrefix + "-raw"), J(o, `${t.control.label ?? ""} (JSON)`), $(s, "id", t.idPrefix + "-raw"), $(s, "aria-label", t.control.label), $(s, "aria-invalid", !!r()), $(s, "aria-describedby", r() ? t.idPrefix + "-error" : void 0), Q(s, t.text), s.disabled = n();
		}), G("input", s, (e) => h(e.currentTarget.value)), q(e, i);
	}, te = (e) => {
		var r = Wa(), a = B(r);
		X(a, 21, () => U(f), Wr, (e, r, a) => {
			var o = Ua(), s = z(o), l = z(s);
			P(s);
			var d = V(s, 2), p = (e) => {
				var o = Fa(), s = B(o), c = V(s);
				$(c, "aria-label", "Duration " + (a + 1) + " phase"), X(c, 21, () => i, Wr, (e, t) => {
					var n = Pa(), r = z(n, !0);
					P(n);
					var i = {};
					H((e, a) => {
						n.disabled = e, J(r, a), i !== (i = U(t)) && (n.value = (n.__value = U(t)) ?? "");
					}, [() => U(f).some((e, n) => n !== a && e.name === U(t)), () => U(t)[0].toUpperCase() + U(t).slice(1)]), q(e, n);
				}), P(c);
				var l;
				fi(c);
				var u = V(c, 2), d = V(u);
				Z(d), $(d, "aria-label", "Duration " + (a + 1) + " steps"), H((e, r) => {
					$(s, "for", t.idPrefix + "-phase-" + a), $(c, "id", t.idPrefix + "-phase-" + a), c.disabled = n(), l !== (l = e) && (c.value = (c.__value = e) ?? "", di(c, e)), $(u, "for", t.idPrefix + "-steps-" + a), $(d, "id", t.idPrefix + "-steps-" + a), Q(d, r), d.disabled = n();
				}, [() => String(U(r).name), () => Number(U(r).number)]), G("change", c, (e) => x(a, e.currentTarget)), G("change", d, (e) => b(a, e.currentTarget)), q(e, o);
			}, m = (e) => {
				var i = Ia(), o = B(i), s = V(o);
				Z(s), $(s, "aria-label", "Value " + (a + 1) + " name");
				var c = V(s, 2), l = V(c);
				Z(l), $(l, "aria-label", "Value " + (a + 1) + " number"), H((e, r) => {
					$(o, "for", t.idPrefix + "-name-" + a), $(s, "id", t.idPrefix + "-name-" + a), Q(s, e), s.disabled = n(), $(c, "for", t.idPrefix + "-number-" + a), $(l, "id", t.idPrefix + "-number-" + a), Q(l, r), $(l, "min", t.control.min), $(l, "max", t.control.max), l.disabled = n();
				}, [() => String(U(r).name), () => Number(U(r).number)]), G("change", s, (e) => x(a, e.currentTarget)), G("change", l, (e) => b(a, e.currentTarget)), q(e, i);
			}, h = (e) => {
				var i = Ra(), o = B(i), s = V(o);
				Z(s), $(s, "aria-label", "Field " + (a + 1) + " name");
				var c = V(s, 2), l = V(c);
				Z(l), $(l, "aria-label", "Field " + (a + 1) + " path (JSON array)");
				var u = V(l, 2), d = z(u);
				Z(d), $(d, "aria-label", "Field " + (a + 1) + " required"), Ae(), P(u);
				var f = V(u, 2), p = z(f);
				Z(p), $(p, "aria-label", "Field " + (a + 1) + " use default"), Ae(), P(f);
				var m = V(f, 3), h = (e) => {
					var i = La(), o = B(i), s = V(o);
					rt(s), $(s, "aria-label", "Field " + (a + 1) + " default (JSON)"), H((e) => {
						$(o, "for", t.idPrefix + "-default-" + a), $(s, "id", t.idPrefix + "-default-" + a), Q(s, e), s.disabled = n();
					}, [() => JSON.stringify(U(r).default, null, 2)]), G("change", s, (e) => S(a, "default", e.currentTarget.value)), q(e, i);
				}, g = /* @__PURE__ */ F(() => Object.hasOwn(U(r), "default"));
				Y(m, (e) => {
					U(g) && e(h);
				}), H((e, i, u) => {
					$(o, "for", t.idPrefix + "-name-" + a), $(s, "id", t.idPrefix + "-name-" + a), Q(s, e), s.disabled = n(), $(c, "for", t.idPrefix + "-path-" + a), $(l, "id", t.idPrefix + "-path-" + a), Q(l, i), l.disabled = n(), yi(d, U(r).required !== !1), d.disabled = n(), yi(p, u), p.disabled = n();
				}, [
					() => String(U(r).name),
					() => JSON.stringify(U(r).path),
					() => Object.hasOwn(U(r), "default")
				]), G("input", s, (e) => v(a, "name", e.currentTarget.value)), G("change", l, (e) => S(a, "path", e.currentTarget.value)), G("change", d, (e) => v(a, "required", e.currentTarget.checked)), G("change", p, (e) => C(a, e.currentTarget.checked)), q(e, i);
			}, g = (e) => {
				var i = za(), o = B(i), s = V(o);
				Z(s), $(s, "aria-label", "Slot " + (a + 1) + " ID");
				var c = V(s, 2), l = V(c);
				Z(l), $(l, "aria-label", "Slot " + (a + 1) + " label"), H((e, r) => {
					$(o, "for", t.idPrefix + "-slot-id-" + a), $(s, "id", t.idPrefix + "-slot-id-" + a), Q(s, e), s.disabled = n(), $(c, "for", t.idPrefix + "-slot-label-" + a), $(l, "id", t.idPrefix + "-slot-label-" + a), Q(l, r), l.disabled = n();
				}, [() => String(U(r).id), () => String(U(r).label)]), G("input", s, (e) => v(a, "id", e.currentTarget.value)), G("input", l, (e) => v(a, "label", e.currentTarget.value)), q(e, i);
			}, _ = (e) => {
				var i = Ba(), o = B(i), s = V(o);
				Z(s), $(s, "aria-label", "Section " + (a + 1) + " name");
				var c = V(s, 2), l = V(c);
				rt(l), $(l, "aria-label", "Section " + (a + 1) + " text"), H((e, r) => {
					$(o, "for", t.idPrefix + "-name-" + a), $(s, "id", t.idPrefix + "-name-" + a), Q(s, e), s.disabled = n(), $(c, "for", t.idPrefix + "-text-" + a), $(l, "id", t.idPrefix + "-text-" + a), Q(l, r), l.disabled = n();
				}, [() => String(U(r).name), () => String(U(r).text)]), G("input", s, (e) => v(a, "name", e.currentTarget.value)), G("input", l, (e) => v(a, "text", e.currentTarget.value)), q(e, i);
			}, y = (e) => {
				var i = Va(), o = B(i), s = V(o);
				$(s, "aria-label", "Rule " + (a + 1) + " kind");
				var c = z(s);
				c.value = c.__value = "literal";
				var l = V(c);
				l.value = l.__value = "regex", P(s);
				var u;
				fi(s);
				var d = V(s, 2), f = V(d);
				Z(f), $(f, "aria-label", "Rule " + (a + 1) + " pattern");
				var p = V(f, 2), m = V(p);
				rt(m), $(m, "aria-label", "Rule " + (a + 1) + " replacement");
				var h = V(m, 2), g = V(h);
				Z(g), $(g, "aria-label", "Rule " + (a + 1) + " flags"), H((e, r, i, c) => {
					$(o, "for", t.idPrefix + "-kind-" + a), $(s, "id", t.idPrefix + "-kind-" + a), s.disabled = n(), u !== (u = e) && (s.value = (s.__value = e) ?? "", di(s, e)), $(d, "for", t.idPrefix + "-pattern-" + a), $(f, "id", t.idPrefix + "-pattern-" + a), Q(f, r), f.disabled = n(), $(p, "for", t.idPrefix + "-replacement-" + a), $(m, "id", t.idPrefix + "-replacement-" + a), Q(m, i), m.disabled = n(), $(h, "for", t.idPrefix + "-flags-" + a), $(g, "id", t.idPrefix + "-flags-" + a), Q(g, c), g.disabled = n();
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
				var t = Ha(), r = B(t), i = V(r);
				H(() => {
					$(r, "aria-label", "Move " + U(c) + " " + (a + 1) + " up"), r.disabled = n() || a === 0, $(i, "aria-label", "Move " + U(c) + " " + (a + 1) + " down"), i.disabled = n() || a === U(f).length - 1;
				}), G("click", r, () => T(a, -1)), G("click", i, () => T(a, 1)), q(e, t);
			}, k = /* @__PURE__ */ F(() => !["numeric-map", "durations"].includes(t.control.structured ?? ""));
			Y(D, (e) => {
				U(k) && e(O);
			});
			var A = V(D);
			P(E), P(o), H((e) => {
				J(l, `${e ?? ""} ${a + 1}`), $(A, "aria-label", "Remove " + U(c) + " " + (a + 1)), A.disabled = n() || U(f).length <= U(u);
			}, [() => U(c)[0].toUpperCase() + U(c).slice(1)]), G("click", A, () => w(a)), q(e, o);
		}), P(a);
		var o = V(a, 2), s = z(o);
		P(o), H(() => {
			$(o, "aria-label", "Add " + U(c)), o.disabled = n() || U(f).length >= U(l), J(s, `Add ${U(c) ?? ""}`);
		}), G("click", o, y), q(e, r);
	};
	Y(A, (e) => {
		U(m) ? e(ee) : U(f) && e(te, 1);
	}), P(E), H(() => {
		$(E, "data-structured-control", t.control.structured), $(O, "aria-label", "Edit " + t.control.label + (U(m) ? " as rows" : " as JSON")), O.disabled = n() || U(m) && !U(f), J(k, U(m) ? "Use rows" : "Edit JSON");
	}), G("click", O, () => {
		!n() && U(f) && R(p, !U(m));
	}), q(e, E), He();
}
Cr([
	"click",
	"input",
	"change"
]);
//#endregion
//#region ui/DetailControl.svelte
var qa = /* @__PURE__ */ K("<span class=\"pc-control-label svelte-16a137\"> </span> <!>", 1), Ja = /* @__PURE__ */ K("<label class=\"pc-detail-check svelte-16a137\"><input type=\"checkbox\" class=\"svelte-16a137\"/> </label>"), Ya = /* @__PURE__ */ K("<label class=\"svelte-16a137\"><input type=\"radio\" class=\"svelte-16a137\"/><span class=\"svelte-16a137\"> </span></label>"), Xa = /* @__PURE__ */ K("<span class=\"pc-control-label svelte-16a137\"> </span> <div class=\"pc-control-segments svelte-16a137\" role=\"radiogroup\"></div>", 1), Za = /* @__PURE__ */ K("<option class=\"svelte-16a137\"> </option>"), Qa = /* @__PURE__ */ K("<select class=\"svelte-16a137\"></select>"), $a = /* @__PURE__ */ K("<input type=\"number\" class=\"svelte-16a137\"/>"), eo = /* @__PURE__ */ K("<textarea class=\"svelte-16a137\"></textarea>"), to = /* @__PURE__ */ K("<input type=\"text\" class=\"svelte-16a137\"/>"), no = /* @__PURE__ */ K("<label class=\"svelte-16a137\"> </label> <!>", 1), ro = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-16a137\"> </button>"), io = /* @__PURE__ */ K("<small class=\"svelte-16a137\"> </small>"), ao = /* @__PURE__ */ K("<p class=\"pc-detail-error svelte-16a137\" role=\"alert\"> </p>"), oo = /* @__PURE__ */ K("<div><!> <!> <!> <!> <!></div>");
function so(e, t) {
	Ve(t, !0);
	let n = Oi(t, "error", 3, ""), r = Oi(t, "disabled", 3, !1), i = Oi(t, "pending", 3, !1), a = () => t.control.editor === "enum" && (t.control.options?.length ?? 0) > 1 && (t.control.options?.length ?? 0) <= 3 && t.control.options.every((e) => e.label.length <= 10), o = () => t.control.effective !== void 0 && t.control.effective !== t.text && t.control.source !== "Saved setting" ? t.control.source : "";
	var s = oo();
	let c;
	var l = z(s), u = (e) => {
		var i = qa(), a = B(i), o = z(a, !0);
		P(a), Ka(V(a, 2), {
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
		var n = Ja(), i = z(n);
		Z(i);
		var a = V(i, 1, !0);
		P(n), H((e) => {
			$(i, "aria-label", t.control.label), yi(i, e), i.disabled = r(), J(a, t.control.label);
		}, [() => !!t.control.value]), G("change", i, (e) => {
			r() || t.onvalue(e.currentTarget.checked);
		}), q(e, n);
	}, f = (e) => {
		var n = Xa(), i = B(n), a = z(i, !0);
		P(i);
		var o = V(i, 2);
		X(o, 21, () => t.control.options ?? [], (e) => e.value, (e, n) => {
			var i = Ya(), a = z(i);
			Z(a);
			var o = V(a), s = z(o, !0);
			P(o), P(i), H((e) => {
				$(a, "name", t.idPrefix + "-choice"), $(a, "aria-label", U(n).label), Q(a, U(n).value), yi(a, e), a.disabled = r(), J(s, U(n).label);
			}, [() => String(t.control.value) === U(n).value]), G("change", a, (e) => {
				!r() && e.currentTarget.checked && t.onvalue(U(n).value);
			}), q(e, i);
		}), P(o), H(() => {
			J(a, t.control.label), $(o, "aria-label", t.control.label);
		}), q(e, n);
	}, p = /* @__PURE__ */ F(() => a()), m = (e) => {
		var i = no(), a = B(i), o = z(a, !0);
		P(a);
		var s = V(a, 2), c = (e) => {
			var n = Qa();
			X(n, 21, () => t.control.options ?? [], (e) => e.value, (e, t) => {
				var n = Za(), r = z(n, !0);
				P(n);
				var i = {};
				H(() => {
					J(r, U(t).label), i !== (i = U(t).value) && (n.value = (n.__value = U(t).value) ?? "");
				}), q(e, n);
			}), P(n);
			var i;
			fi(n), H((e) => {
				$(n, "id", t.idPrefix + "-editor"), $(n, "aria-label", t.control.label), n.disabled = r(), i !== (i = e) && (n.value = (n.__value = e) ?? "", di(n, e));
			}, [() => String(t.control.value)]), G("change", n, (e) => {
				r() || t.onvalue(e.currentTarget.value);
			}), q(e, n);
		}, l = (e) => {
			var i = $a();
			Z(i), H((e) => {
				$(i, "id", t.idPrefix + "-editor"), $(i, "aria-label", t.control.label), $(i, "min", t.control.min), $(i, "max", t.control.max), $(i, "step", t.control.step ?? 1), $(i, "aria-invalid", !!n()), $(i, "aria-describedby", n() ? t.idPrefix + "-error" : void 0), Q(i, e), i.disabled = r();
			}, [() => Number(t.control.value)]), G("change", i, (e) => {
				r() || t.onnumber(e.currentTarget);
			}), q(e, i);
		}, u = (e) => {
			var i = eo();
			rt(i), H(() => {
				$(i, "id", t.idPrefix + "-editor"), $(i, "aria-label", t.control.label), $(i, "aria-invalid", !!n()), $(i, "aria-describedby", n() ? t.idPrefix + "-error" : void 0), Q(i, t.text), i.disabled = r();
			}), G("input", i, (e) => {
				r() || t.ontext(e.currentTarget.value);
			}), q(e, i);
		}, d = (e) => {
			var n = to();
			Z(n), H(() => {
				$(n, "id", t.idPrefix + "-editor"), $(n, "aria-label", t.control.label), Q(n, t.text), n.disabled = r();
			}), G("change", n, (e) => {
				r() || t.onvalue(e.currentTarget.value);
			}), q(e, n);
		}, f = /* @__PURE__ */ F(() => t.control.singleLine && t.control.editor === "text" && !t.text.includes("\n") && !t.text.includes("\r")), p = (e) => {
			var n = eo();
			rt(n), H(() => {
				$(n, "id", t.idPrefix + "-editor"), $(n, "aria-label", t.control.label), Q(n, t.text), n.disabled = r();
			}), G("change", n, (e) => {
				r() || t.onvalue(e.currentTarget.value);
			}), q(e, n);
		};
		Y(s, (e) => {
			t.control.editor === "enum" ? e(c) : t.control.editor === "number" ? e(l, 1) : t.control.editor === "json" || t.control.editor === "lines" ? e(u, 2) : U(f) ? e(d, 3) : e(p, -1);
		}), H(() => {
			$(a, "for", t.idPrefix + "-editor"), J(o, t.control.label);
		}), q(e, i);
	};
	Y(l, (e) => {
		t.control.structured && t.control.editor === "json" ? e(u) : t.control.editor === "boolean" ? e(d, 1) : U(p) ? e(f, 2) : e(m, -1);
	});
	var h = V(l, 2), g = (e) => {
		var n = ro(), a = z(n, !0);
		P(n), H(() => {
			$(n, "data-save-control", t.control.key), n.disabled = r() || i(), J(a, i() ? "Validating…" : "Save " + t.control.label);
		}), G("click", n, () => {
			!r() && !i() && t.onsave();
		}), q(e, n);
	};
	Y(h, (e) => {
		(t.control.editor === "json" || t.control.editor === "lines") && e(g);
	});
	var _ = V(h, 2), v = (e) => {
		var n = io(), r = z(n, !0);
		P(n), H(() => J(r, t.control.help)), q(e, n);
	};
	Y(_, (e) => {
		t.control.help && e(v);
	});
	var y = V(_, 2), b = (e) => {
		var n = io(), r = z(n, !0);
		P(n), H(() => J(r, t.control.exposureNote)), q(e, n);
	}, x = (e) => {
		var n = io(), r = z(n);
		P(n), H((e) => J(r, `${e ?? ""} · Effective: ${t.control.effective ?? ""}`), [() => o()]), q(e, n);
	}, S = /* @__PURE__ */ F(() => o());
	Y(y, (e) => {
		t.control.exposureNote ? e(b) : U(S) && e(x, 1);
	});
	var C = V(y, 2), w = (e) => {
		var r = ao(), i = z(r, !0);
		P(r), H(() => {
			$(r, "id", t.idPrefix + "-error"), J(i, n());
		}), q(e, r);
	};
	Y(C, (e) => {
		n() && e(w);
	}), P(s), H(() => c = ci(s, 1, "pc-detail-control svelte-16a137", null, c, { "pc-control-number": t.control.editor === "number" })), q(e, s), He();
}
Cr([
	"change",
	"input",
	"click"
]);
//#endregion
//#region ui/ModifierStack.svelte
var co = /* @__PURE__ */ K("<label class=\"svelte-1ibq9q\"><input type=\"checkbox\" class=\"svelte-1ibq9q\"/> </label>"), lo = /* @__PURE__ */ K("<option class=\"svelte-1ibq9q\"> </option>"), uo = /* @__PURE__ */ K("<label class=\"pc-modifier-check svelte-1ibq9q\"><input type=\"checkbox\" class=\"svelte-1ibq9q\"/> </label>"), fo = /* @__PURE__ */ K("<select class=\"svelte-1ibq9q\"></select>"), po = /* @__PURE__ */ K("<input type=\"number\" class=\"svelte-1ibq9q\"/>"), mo = /* @__PURE__ */ K("<textarea class=\"svelte-1ibq9q\"></textarea>"), ho = /* @__PURE__ */ K("<label class=\"svelte-1ibq9q\"> </label> <!>", 1), go = /* @__PURE__ */ K("<small class=\"svelte-1ibq9q\"> </small>"), _o = /* @__PURE__ */ K("<!> <!>", 1), vo = /* @__PURE__ */ K("<details class=\"svelte-1ibq9q\"><summary class=\"svelte-1ibq9q\"> <!></summary> <!> <button type=\"button\" class=\"svelte-1ibq9q\"> </button></details>"), yo = /* @__PURE__ */ K("<p class=\"pc-modifier-error svelte-1ibq9q\" role=\"alert\"> </p>"), bo = /* @__PURE__ */ K("<div class=\"pc-modifier-entry svelte-1ibq9q\"><div class=\"pc-modifier-heading svelte-1ibq9q\"><label class=\"svelte-1ibq9q\"><input type=\"checkbox\" class=\"svelte-1ibq9q\"/><span class=\"svelte-1ibq9q\"> <small class=\"svelte-1ibq9q\"> </small></span></label> <div class=\"pc-modifier-order svelte-1ibq9q\"><button type=\"button\" title=\"Move up\" class=\"svelte-1ibq9q\">↑</button> <button type=\"button\" title=\"Move down\" class=\"svelte-1ibq9q\">↓</button> <button type=\"button\" title=\"Remove\" class=\"svelte-1ibq9q\">×</button></div></div> <!> <!></div>"), xo = /* @__PURE__ */ K("<div class=\"pc-modifier-stack svelte-1ibq9q\"><small class=\"svelte-1ibq9q\"> </small> <!></div>"), So = /* @__PURE__ */ K("<small role=\"status\" class=\"svelte-1ibq9q\">Validating modifiers…</small>"), Co = /* @__PURE__ */ K("<section class=\"pc-modifiers svelte-1ibq9q\" data-modifier-controls=\"\" aria-label=\"Text modifiers\"><div class=\"pc-modifier-quick svelte-1ibq9q\"><!> <select aria-label=\"Add text modifier\" class=\"svelte-1ibq9q\"><option class=\"svelte-1ibq9q\">Add modifier…</option><!></select></div> <!> <!> <!></section>");
function wo(e, t) {
	Ve(t, !0);
	let n = (e) => t.options.find((t) => t.type === e.type), r = (e) => n(e)?.label ?? e.type, i = (e) => t.drafts[e.id]?.settings ?? e.settings, a = (e) => t.disabled || t.busy || !t.options.some((t) => t.type === e) || t.items.length >= 16 && !t.items.some((t) => t.type === e);
	var o = Co(), s = z(o), c = z(s);
	X(c, 16, () => ["trim", "wrap"], Wr, (e, n) => {
		var r = co(), i = z(r);
		Z(i);
		var o = V(i, 1, !0);
		P(r), H((e, t) => {
			$(i, "aria-label", (n === "trim" ? "Trim" : "Wrap") + " output"), yi(i, e), i.disabled = t, J(o, n === "trim" ? "Trim" : "Wrap");
		}, [() => t.items.some((e) => e.type === n && e.enabled), () => a(n)]), G("change", i, (e) => {
			a(n) || t.onquick(n, e.currentTarget.checked);
		}), q(e, r);
	});
	var l = V(c, 2), u = z(l);
	u.value = u.__value = "", X(V(u), 17, () => t.options.filter((e) => !["trim", "wrap"].includes(e.type)), (e) => e.type, (e, t) => {
		var n = lo(), r = z(n, !0);
		P(n);
		var i = {};
		H(() => {
			J(r, U(t).label), i !== (i = U(t).type) && (n.value = (n.__value = U(t).type) ?? "");
		}), q(e, n);
	}), P(l), l.value = l.__value = "", P(s);
	var d = V(s, 2), f = (e) => {
		var a = xo(), o = z(a), s = z(o);
		P(o), X(V(o, 2), 19, () => t.items, (e) => e.id, (e, a, o) => {
			let s = /* @__PURE__ */ F(() => n(U(a))), c = /* @__PURE__ */ F(() => r(U(a))), l = /* @__PURE__ */ F(() => t.drafts[U(a).id]);
			var u = bo(), d = z(u), f = z(d), p = z(f);
			Z(p);
			var m = V(p), h = z(m), g = V(h), _ = z(g, !0);
			P(g), P(m), P(f);
			var v = V(f, 2), y = z(v), b = V(y, 2), x = V(b, 2);
			P(v), P(d);
			var S = V(d, 2), C = (e) => {
				var n = vo(), r = z(n), o = z(r), u = V(o), d = (e) => {
					q(e, Nr("· Unsaved"));
				};
				Y(u, (e) => {
					U(l)?.dirty && e(d);
				}), P(r);
				var f = V(r, 2);
				X(f, 17, () => U(s).fields, (e) => e.key, (e, n) => {
					let r = /* @__PURE__ */ F(() => t.idPrefix + "-modifier-" + U(a).id + "-" + U(n).key);
					var o = _o(), s = B(o), l = (e) => {
						var o = uo(), s = z(o);
						Z(s);
						var l = V(s, 1, !0);
						P(o), H((e) => {
							$(s, "id", U(r)), $(s, "aria-label", U(c) + " " + U(n).label), yi(s, e), s.disabled = t.disabled, J(l, U(n).label);
						}, [() => !!i(U(a))[U(n).key]]), G("change", s, (e) => {
							t.disabled || t.ondraft(U(a).id, U(n).key, e.currentTarget.checked);
						}), q(e, o);
					}, u = (e) => {
						var o = ho(), s = B(o), l = z(s, !0);
						P(s);
						var u = V(s, 2), d = (e) => {
							var o = fo();
							X(o, 21, () => U(n).options ?? [], (e) => e.value, (e, t) => {
								var n = lo(), r = z(n, !0);
								P(n);
								var i = {};
								H(() => {
									J(r, U(t).label), i !== (i = U(t).value) && (n.value = (n.__value = U(t).value) ?? "");
								}), q(e, n);
							}), P(o);
							var s;
							fi(o), H((e) => {
								$(o, "id", U(r)), $(o, "aria-label", U(c) + " " + U(n).label), o.disabled = t.disabled, s !== (s = e) && (o.value = (o.__value = e) ?? "", di(o, e));
							}, [() => String(i(U(a))[U(n).key] ?? "")]), G("change", o, (e) => {
								t.disabled || t.ondraft(U(a).id, U(n).key, e.currentTarget.value);
							}), q(e, o);
						}, f = (e) => {
							var o = po();
							Z(o), H((e) => {
								$(o, "id", U(r)), $(o, "aria-label", U(c) + " " + U(n).label), $(o, "min", U(n).min), $(o, "max", U(n).max), $(o, "step", U(n).step ?? 1), Q(o, e), o.disabled = t.disabled;
							}, [() => String(i(U(a))[U(n).key] ?? "")]), G("input", o, (e) => {
								t.disabled || t.ondraft(U(a).id, U(n).key, e.currentTarget.value ? Number(e.currentTarget.value) : null);
							}), q(e, o);
						}, p = (e) => {
							var o = mo();
							rt(o), H((e) => {
								$(o, "id", U(r)), $(o, "aria-label", U(c) + " " + U(n).label), Q(o, e), o.disabled = t.disabled;
							}, [() => String(i(U(a))[U(n).key] ?? "")]), G("input", o, (e) => {
								t.disabled || t.ondraft(U(a).id, U(n).key, e.currentTarget.value);
							}), q(e, o);
						};
						Y(u, (e) => {
							U(n).editor === "enum" ? e(d) : U(n).editor === "number" ? e(f, 1) : e(p, -1);
						}), H(() => {
							$(s, "for", U(r)), J(l, U(n).label);
						}), q(e, o);
					};
					Y(s, (e) => {
						U(n).editor === "boolean" ? e(l) : e(u, -1);
					});
					var d = V(s, 2), f = (e) => {
						var t = go(), r = z(t, !0);
						P(t), H(() => J(r, U(n).help)), q(e, t);
					};
					Y(d, (e) => {
						U(n).help && e(f);
					}), q(e, o);
				});
				var p = V(f, 2), m = z(p, !0);
				P(p), P(n), H(() => {
					n.open = !!U(l)?.dirty || !!U(l)?.error, J(o, `${U(c) ?? ""} settings`), $(p, "aria-label", "Save " + U(c) + " settings"), p.disabled = t.disabled || !!U(l)?.pending || !U(l)?.dirty, J(m, U(l)?.pending ? "Validating…" : "Save settings");
				}), G("click", p, () => {
					!t.disabled && !U(l)?.pending && U(l)?.dirty && t.onsave(U(a).id);
				}), q(e, n);
			};
			Y(S, (e) => {
				U(s)?.fields.length && e(C);
			});
			var w = V(S, 2), T = (e) => {
				var t = yo(), n = z(t, !0);
				P(t), H(() => J(n, U(l).error)), q(e, t);
			};
			Y(w, (e) => {
				U(l)?.error && e(T);
			}), P(u), H(() => {
				$(u, "data-modifier-id", U(a).id), $(u, "data-modifier-state", U(a).enabled ? "active" : "disabled"), $(p, "aria-label", "Enable " + U(c) + " modifier"), yi(p, U(a).enabled), p.disabled = t.disabled || t.busy, J(h, `${U(o) + 1}. ${U(c) ?? ""}`), J(_, U(a).enabled ? "Active" : "Disabled"), $(y, "aria-label", "Move " + U(c) + " up"), y.disabled = t.disabled || t.busy || U(o) === 0, $(b, "aria-label", "Move " + U(c) + " down"), b.disabled = t.disabled || t.busy || U(o) === t.items.length - 1, $(x, "aria-label", "Remove " + U(c) + " modifier"), x.disabled = t.disabled || t.busy;
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
		q(e, So());
	};
	Y(p, (e) => {
		t.busy && e(m);
	});
	var h = V(p, 2), g = (e) => {
		var n = yo(), r = z(n, !0);
		P(n), H(() => J(r, t.error)), q(e, n);
	};
	Y(h, (e) => {
		t.error && e(g);
	}), P(o), H(() => l.disabled = t.disabled || t.busy || t.items.length >= 16), G("change", l, (e) => {
		let n = e.currentTarget.value;
		e.currentTarget.value = "", !t.disabled && !t.busy && t.items.length < 16 && n && t.onadd(n);
	}), q(e, o), He();
}
Cr([
	"change",
	"click",
	"input"
]);
//#endregion
//#region ui/WorkflowData.svelte
var To = /* @__PURE__ */ K("<button type=\"button\" data-load-workflow-data=\"\" class=\"svelte-8bs3bu\"> </button>"), Eo = /* @__PURE__ */ K("<label class=\"pc-wd-number svelte-8bs3bu\"><span class=\"svelte-8bs3bu\">Starting day</span><input aria-label=\"Starting day\" type=\"number\" min=\"1\" step=\"1\" class=\"svelte-8bs3bu\"/></label> <label class=\"pc-wd-number svelte-8bs3bu\"><span class=\"svelte-8bs3bu\">Starting time</span><input aria-label=\"Starting time\" type=\"text\" inputmode=\"numeric\" placeholder=\"00:00\" class=\"svelte-8bs3bu\"/></label> <label class=\"pc-wd-number svelte-8bs3bu\"><span class=\"svelte-8bs3bu\">Hours per day</span><input aria-label=\"Hours per day\" type=\"number\" step=\"any\" class=\"svelte-8bs3bu\"/></label> <p class=\"pc-wd-help svelte-8bs3bu\">Initial values only. Saved time stays unchanged.</p>", 1), Do = /* @__PURE__ */ K("<label class=\"pc-wd-block svelte-8bs3bu\"> <textarea rows=\"4\" maxlength=\"100000\" class=\"svelte-8bs3bu\"></textarea></label> <p class=\"pc-wd-help svelte-8bs3bu\"> </p>", 1), Oo = /* @__PURE__ */ K("<output class=\"pc-wd-source-value svelte-8bs3bu\"> </output>"), ko = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-8bs3bu\"> </button>"), Ao = /* @__PURE__ */ K("<div class=\"pc-wd-choices svelte-8bs3bu\" role=\"group\"></div>"), jo = /* @__PURE__ */ K("<option class=\"svelte-8bs3bu\"> </option>"), Mo = /* @__PURE__ */ K("<select class=\"svelte-8bs3bu\"><!><!></select>"), No = /* @__PURE__ */ K("<div class=\"pc-wd-create svelte-8bs3bu\"><label class=\"pc-wd-field svelte-8bs3bu\">Name<input maxlength=\"256\" class=\"svelte-8bs3bu\"/></label> <div class=\"pc-wd-actions svelte-8bs3bu\"><button type=\"button\" data-create-workflow-data=\"\" class=\"svelte-8bs3bu\"> </button><button type=\"button\" class=\"svelte-8bs3bu\">Cancel</button></div></div>"), Po = /* @__PURE__ */ K("<label class=\"pc-wd-field svelte-8bs3bu\">Format<select aria-label=\"Document format\" class=\"svelte-8bs3bu\"></select></label><p class=\"pc-wd-help svelte-8bs3bu\">A saved document keeps its format.</p>", 1), Fo = /* @__PURE__ */ K("<div class=\"pc-wd-field svelte-8bs3bu\"><span class=\"svelte-8bs3bu\">Format</span><output class=\"svelte-8bs3bu\">JSON</output></div><p class=\"pc-wd-help svelte-8bs3bu\"> </p>", 1), Io = /* @__PURE__ */ K("<label class=\"pc-wd-field svelte-8bs3bu\">Actor ID<input aria-label=\"Private actor ID\" maxlength=\"128\" class=\"svelte-8bs3bu\"/></label>"), Lo = /* @__PURE__ */ K("<label class=\"pc-wd-field svelte-8bs3bu\">Columns<input aria-label=\"CSV columns\" placeholder=\"id, text\" class=\"svelte-8bs3bu\"/></label>"), Ro = /* @__PURE__ */ K("<label class=\"pc-wd-field svelte-8bs3bu\">Calendar<input aria-label=\"Initial calendar name\" class=\"svelte-8bs3bu\"/></label><label class=\"pc-wd-field svelte-8bs3bu\">Expected calendar<input aria-label=\"Expected calendar\" placeholder=\"Any calendar\" class=\"svelte-8bs3bu\"/></label><p class=\"pc-wd-help svelte-8bs3bu\">Expected calendar validates saved data.</p>", 1), zo = /* @__PURE__ */ K("<p class=\"pc-wd-help svelte-8bs3bu\">Open an active chat to save initial settings.</p>"), Bo = /* @__PURE__ */ K("<p class=\"pc-wd-help svelte-8bs3bu\"> </p>"), Vo = /* @__PURE__ */ K("<p class=\"pc-wd-error svelte-8bs3bu\" role=\"alert\"> </p>"), Ho = /* @__PURE__ */ K("<p class=\"pc-wd-help svelte-8bs3bu\" role=\"status\"> </p>"), Uo = /* @__PURE__ */ K("<div class=\"pc-workflow-data svelte-8bs3bu\"><p class=\"pc-wd-binding svelte-8bs3bu\"> </p> <details class=\"pc-wd-group svelte-8bs3bu\" data-workflow-initial=\"\"><summary class=\"svelte-8bs3bu\"> <span class=\"svelte-8bs3bu\"> </span></summary> <div class=\"pc-wd-body svelte-8bs3bu\"><!> <!></div></details> <details class=\"pc-wd-group svelte-8bs3bu\" data-workflow-advanced=\"\"><summary class=\"svelte-8bs3bu\">Advanced <span class=\"svelte-8bs3bu\"> </span></summary> <div class=\"pc-wd-body svelte-8bs3bu\"><div class=\"pc-wd-source-row svelte-8bs3bu\"><span class=\"pc-wd-row-label svelte-8bs3bu\"> </span> <!> <button type=\"button\" class=\"pc-wd-add svelte-8bs3bu\">+</button></div> <!> <p class=\"pc-wd-help svelte-8bs3bu\"> </p> <hr class=\"svelte-8bs3bu\"/> <!> <span class=\"pc-wd-label svelte-8bs3bu\">Visibility</span> <div class=\"pc-wd-choices svelte-8bs3bu\" role=\"group\"></div> <!> <!> <label class=\"pc-wd-field svelte-8bs3bu\">Document ID<input readonly=\"\" class=\"svelte-8bs3bu\"/></label> <!></div></details> <div class=\"pc-wd-actions pc-wd-save svelte-8bs3bu\"><button type=\"button\" data-save-workflow-data=\"\" class=\"svelte-8bs3bu\"> </button></div> <!> <!> <!> <!></div>");
function Wo(e, t) {
	Ve(t, !0);
	let n = Oi(t, "actions", 19, () => ({})), r = Oi(t, "disabled", 3, !1), i = Oi(t, "idPrefix", 3, "pc-workflow-data"), a = /* @__PURE__ */ L(null), o = /* @__PURE__ */ L("1"), s = /* @__PURE__ */ L("00:00"), c = /* @__PURE__ */ L("24"), l = /* @__PURE__ */ L("story-calendar"), u = /* @__PURE__ */ L(""), d = /* @__PURE__ */ L("text"), f = /* @__PURE__ */ L("public"), p = /* @__PURE__ */ L(""), m = /* @__PURE__ */ L(""), h = /* @__PURE__ */ L(!1), g = /* @__PURE__ */ L(""), _ = /* @__PURE__ */ L(""), v = /* @__PURE__ */ L(""), y = /* @__PURE__ */ L(""), b = /* @__PURE__ */ L(!1), x = "", S = 0, C = !0, w = /* @__PURE__ */ F(() => t.model.kind === "clock" ? "Clock" : t.model.kind === "outcomes" ? "Outcomes" : "Document"), T = /* @__PURE__ */ F(() => t.model.kind === "clock" ? "clock" : t.model.kind === "outcomes" ? "outcomes" : "document"), E = /* @__PURE__ */ F(() => !r() && t.model.editable && !!U(a) && !U(_)), D = /* @__PURE__ */ F(() => !r() && t.model.editable && t.model.available && !U(_)), O = [
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
	], A = (e) => k.find((t) => t.value === e)?.label ?? e, ee = (e) => O.find((t) => t.value === e)?.label ?? e, te = () => JSON.stringify([
		t.selection.selectionKey,
		t.selection.address,
		t.model.targetId,
		t.model.key
	]);
	function ne(e) {
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
	bn(() => {
		let e = te();
		e !== x && (x = e, S++, R(_, ""), R(v, ""), R(y, ""), R(h, !1), R(g, ""), mr(() => ne(t.model.definition)));
	}), Ai(() => {
		C = !1, S++;
	});
	function j(e, t) {
		(e === "actor" ? !U(D) : !U(E)) || (R(e === "day" ? o : e === "time" ? s : e === "hours" ? c : e === "calendar" ? l : e === "content" ? u : e === "actor" ? p : m, t, !0), S++, R(b, !0), R(v, ""), R(y, ""));
	}
	function re(e) {
		U(E) && t.model.kind === "notes" && (R(d, e, !0), U(u).trim() || R(u, e === "json" ? "[]" : "", !0), S++, R(b, !0), R(v, ""), R(y, ""));
	}
	function ie(e) {
		U(D) && (R(f, e, !0), S++, R(b, !0), R(v, ""), R(y, ""));
	}
	function ae() {
		return U(f) === "actor-private" ? {
			kind: U(f),
			actorId: U(p).trim()
		} : { kind: U(f) };
	}
	function oe() {
		let e = Number(U(o)), t = Number(U(c)) * 60, n = /^(\d+):([0-5]\d)$/.exec(U(s)), r = n ? Number(n[1]) * 60 + Number(n[2]) : NaN, i = (e - 1) * t + r;
		if (!Number.isSafeInteger(e) || e < 1 || !Number.isSafeInteger(t) || t < 1 || !Number.isSafeInteger(r) || r < 0 || r >= t || !Number.isSafeInteger(i) || !U(l).trim()) throw Error("Use a positive starting day, a time within the day, and a day length in whole minutes.");
		return {
			calendarId: U(l).trim(),
			absoluteMinute: i,
			dayLengthMinutes: t
		};
	}
	function se() {
		if (!U(a)) throw Error("Load the initial template before saving.");
		let e = {
			targetId: t.model.targetId,
			name: U(a).name,
			format: U(d),
			content: U(u),
			visibility: ae()
		};
		if (U(f) === "actor-private" && !U(p).trim()) throw Error("Choose an actor for private data.");
		return t.model.kind === "clock" && (e.content = JSON.stringify({
			...JSON.parse(U(a).content),
			...oe()
		}, null, 2)), U(d) === "csv" && (e.columns = U(m).split(",").map((e) => e.trim()).filter(Boolean)), e;
	}
	let ce = /* @__PURE__ */ F(() => U(D) && (U(a) ? !!n().saveWorkflowData : !!n().saveWorkflowDataVisibility) && U(b) && (U(f) !== "actor-private" || !!U(p).trim()));
	async function le(e, n) {
		if (r() || !t.model.editable || U(_)) return;
		let i = structuredClone(t.selection), a = t.model.key, o = te(), s = ++S, c = e === "load" && U(b) ? {
			visibility: U(f),
			actorId: U(p)
		} : null;
		R(_, e, !0), R(v, ""), R(y, "");
		try {
			let r = await n(i, a);
			if (!C || s !== S || o !== te() || t.selection.revision !== i.revision) return;
			if (!r.ok) {
				R(v, r.error.message, !0);
				return;
			}
			if (e === "load") {
				if (!r.data?.definition) {
					R(v, "The initial template could not be loaded.");
					return;
				}
				ne(r.data.definition), c && (R(f, c.visibility, !0), R(p, c.actorId, !0), R(b, !0));
			} else R(b, !1), R(h, !1), R(y, r.data?.message ?? (e === "save" ? "Initial settings saved." : "Workflow data updated."), !0);
		} catch (e) {
			C && s === S && o === te() && t.selection.revision === i.revision && R(v, e instanceof Error ? e.message : "Workflow data could not be updated.", !0);
		} finally {
			C && s === S && o === te() && R(_, "");
		}
	}
	function ue() {
		if (!U(ce)) return;
		if (!U(a) && n().saveWorkflowDataVisibility) {
			le("save", (e, t) => n().saveWorkflowDataVisibility(e, t, ae()));
			return;
		}
		if (!n().saveWorkflowData) return;
		let e;
		try {
			e = se();
		} catch (e) {
			R(v, e instanceof Error ? e.message : "Check the initial settings.", !0);
			return;
		}
		le("save", (t, r) => n().saveWorkflowData(t, r, e));
	}
	function de(e) {
		!r() && t.model.editable && !U(_) && n().bindWorkflowData && e !== t.model.targetId && t.model.sources.some((t) => t.value === e) && le("bind", (t, r) => n().bindWorkflowData(t, r, e));
	}
	function fe() {
		if (r() || !t.model.editable || !t.model.available || U(_) || !n().createWorkflowData || !U(g).trim()) return;
		let e = {
			name: U(g).trim(),
			kind: t.model.kind,
			format: t.model.kind === "notes" ? U(d) : "json",
			visibility: ae()
		};
		try {
			if (U(f) === "actor-private" && !U(p).trim()) throw Error("Choose an actor for private data.");
			t.model.kind === "clock" && (e = {
				...e,
				...oe()
			});
		} catch (e) {
			R(v, e instanceof Error ? e.message : "Check the new data settings.", !0);
			return;
		}
		le("create", (t, r) => n().createWorkflowData(t, r, e));
	}
	function pe(e) {
		!r() && t.model.editable && !U(_) && n().editControl && le("calendar", (t) => n().editControl(t, "calendarId", e));
	}
	var me = Uo(), he = z(me), ge = z(he);
	P(he);
	var _e = V(he, 2), ve = z(_e), ye = z(ve), be = V(ye), xe = z(be, !0);
	P(be), P(ve);
	var Se = V(ve, 2), Ce = z(Se), we = (e) => {
		var i = To(), a = z(i, !0);
		P(i), H(() => {
			i.disabled = r() || !t.model.editable || !t.model.available || !n().loadWorkflowData || !!U(_), J(a, U(_) === "load" ? "Loading…" : "Load initial values");
		}), G("click", i, () => {
			t.model.available && n().loadWorkflowData && le("load", (e, t) => n().loadWorkflowData(e, t));
		}), q(e, i);
	};
	Y(Ce, (e) => {
		U(a) || e(we);
	});
	var Te = V(Ce, 2), Ee = (e) => {
		var t = Eo(), n = B(t), r = V(z(n));
		Z(r), P(n);
		var i = V(n, 2), a = V(z(i));
		Z(a), P(i);
		var l = V(i, 2), u = V(z(l));
		Z(u), $(u, "min", 1 / 60), P(l), Ae(2), H(() => {
			Q(r, U(o)), r.disabled = !U(E), Q(a, U(s)), a.disabled = !U(E), Q(u, U(c)), u.disabled = !U(E);
		}), G("input", r, (e) => j("day", e.currentTarget.value)), G("input", a, (e) => j("time", e.currentTarget.value)), G("input", u, (e) => j("hours", e.currentTarget.value)), q(e, t);
	}, M = (e) => {
		var n = Do(), r = B(n), i = z(r, !0), a = V(i);
		rt(a), P(r);
		var o = V(r, 2), s = z(o);
		P(o), H(() => {
			J(i, t.model.kind === "outcomes" ? "Starting records" : "Content"), $(a, "aria-label", t.model.kind === "outcomes" ? "Initial outcomes" : "Initial document content"), Q(a, U(u)), a.disabled = !U(E), $(a, "placeholder", t.model.kind === "outcomes" ? "[]" : "Empty by default"), J(s, `Initial content only. Saved ${t.model.kind === "outcomes" ? "outcomes" : "notes"} stay unchanged.`);
		}), G("input", a, (e) => j("content", e.currentTarget.value)), q(e, n);
	};
	Y(Te, (e) => {
		t.model.kind === "clock" ? e(Ee) : e(M, -1);
	}), P(Se), P(_e);
	var De = V(_e, 2), N = z(De), Oe = V(z(N)), ke = z(Oe);
	P(Oe), P(N);
	var je = V(N, 2), Me = z(je), Ne = z(Me), Pe = z(Ne, !0);
	P(Ne);
	var Fe = V(Ne, 2), Ie = (e) => {
		var n = Oo(), r = z(n, !0);
		P(n), H((e) => {
			$(n, "aria-label", U(w) + " source"), J(r, e);
		}, [() => t.model.sources.find((e) => e.value === t.model.targetId)?.label ?? t.model.name ?? t.model.targetId]), q(e, n);
	}, Le = (e) => {
		var i = Ao();
		X(i, 21, () => t.model.sources, (e) => e.value, (e, i) => {
			var a = ko(), o = z(a, !0);
			P(a), H(() => {
				$(a, "data-workflow-source", U(i).value), $(a, "aria-pressed", U(i).value === t.model.targetId), a.disabled = r() || !t.model.editable || !n().bindWorkflowData || !!U(_), J(o, U(i).label);
			}), G("click", a, () => de(U(i).value)), q(e, a);
		}), P(i), H(() => $(i, "aria-label", U(w) + " source")), q(e, i);
	}, Re = (e) => {
		var i = Mo(), a = z(i), o = (e) => {
			var n = jo(), r = z(n, !0);
			P(n);
			var i = {};
			H(() => {
				J(r, t.model.name || t.model.targetId), i !== (i = t.model.targetId) && (n.value = (n.__value = t.model.targetId) ?? "");
			}), q(e, n);
		}, s = /* @__PURE__ */ F(() => !t.model.sources.some((e) => e.value === t.model.targetId));
		Y(a, (e) => {
			U(s) && e(o);
		}), X(V(a), 17, () => t.model.sources, (e) => e.value, (e, t) => {
			var n = jo(), r = z(n, !0);
			P(n);
			var i = {};
			H(() => {
				J(r, U(t).label), i !== (i = U(t).value) && (n.value = (n.__value = U(t).value) ?? "");
			}), q(e, n);
		}), P(i);
		var c;
		fi(i), H(() => {
			$(i, "aria-label", U(w) + " source"), i.disabled = r() || !t.model.editable || !n().bindWorkflowData || !!U(_), c !== (c = t.model.targetId) && (i.value = (i.__value = t.model.targetId) ?? "", di(i, t.model.targetId));
		}), G("change", i, (e) => de(e.currentTarget.value)), q(e, i);
	};
	Y(Fe, (e) => {
		t.model.sources.length <= 1 ? e(Ie) : t.model.sources.length <= 3 ? e(Le, 1) : e(Re, -1);
	});
	var ze = V(Fe, 2);
	P(Me);
	var Be = V(Me, 2), Ue = (e) => {
		var t = No(), n = z(t), r = V(z(n));
		Z(r), P(n);
		var i = V(n, 2), a = z(i), o = z(a, !0);
		P(a);
		var s = V(a);
		P(i), P(t), H((e) => {
			$(r, "aria-label", "New " + U(T) + " name"), Q(r, U(g)), r.disabled = !!U(_), a.disabled = e, J(o, U(_) === "create" ? "Creating…" : "Create " + U(T)), s.disabled = !!U(_);
		}, [() => !U(g).trim() || !!U(_) || U(f) === "actor-private" && !U(p).trim()]), G("input", r, (e) => {
			R(g, e.currentTarget.value, !0);
		}), G("click", a, fe), G("click", s, () => {
			R(h, !1), R(v, "");
		}), q(e, t);
	};
	Y(Be, (e) => {
		U(h) && e(Ue);
	});
	var We = V(Be, 2), Ge = z(We, !0);
	P(We);
	var Ke = V(We, 4), qe = (e) => {
		var t = Po(), n = B(t), r = V(z(n));
		X(r, 21, () => k, Wr, (e, t) => {
			var n = jo(), r = z(n, !0);
			P(n);
			var i = {};
			H(() => {
				J(r, U(t).label), i !== (i = U(t).value) && (n.value = (n.__value = U(t).value) ?? "");
			}), q(e, n);
		}), P(r);
		var i;
		fi(r), P(n), Ae(), H(() => {
			r.disabled = !U(E), i !== (i = U(d)) && (r.value = (r.__value = U(d)) ?? "", di(r, U(d)));
		}), G("change", r, (e) => re(e.currentTarget.value)), q(e, t);
	}, Je = (e) => {
		var n = Fo(), r = B(n), i = V(z(r));
		P(r);
		var a = V(r), o = z(a, !0);
		P(a), H(() => {
			$(i, "aria-label", U(w) + " format"), J(o, t.model.kind === "clock" ? "Required for clock data." : "Outcomes use a JSON list.");
		}), q(e, n);
	};
	Y(Ke, (e) => {
		t.model.kind === "notes" ? e(qe) : e(Je, -1);
	});
	var Ye = V(Ke, 2), Xe = V(Ye, 2);
	X(Xe, 21, () => O, Wr, (e, t) => {
		var n = ko(), r = z(n, !0);
		P(n), H(() => {
			$(n, "data-workflow-visibility", U(t).value), $(n, "aria-pressed", U(f) === U(t).value), n.disabled = !U(D), J(r, U(t).label);
		}), G("click", n, () => ie(U(t).value)), q(e, n);
	}), P(Xe);
	var Ze = V(Xe, 2), Qe = (e) => {
		var t = Io(), n = V(z(t));
		Z(n), P(t), H(() => {
			Q(n, U(p)), n.disabled = !U(D);
		}), G("input", n, (e) => j("actor", e.currentTarget.value)), q(e, t);
	};
	Y(Ze, (e) => {
		U(f) === "actor-private" && e(Qe);
	});
	var $e = V(Ze, 2), et = (e) => {
		var t = Lo(), n = V(z(t));
		Z(n), P(t), H(() => {
			Q(n, U(m)), n.disabled = !U(E);
		}), G("input", n, (e) => j("columns", e.currentTarget.value)), q(e, t);
	};
	Y($e, (e) => {
		U(d) === "csv" && e(et);
	});
	var tt = V($e, 2), nt = V(z(tt));
	Z(nt), P(tt);
	var it = V(tt, 2), at = (e) => {
		var i = Ro(), a = B(i), o = V(z(a));
		Z(o), P(a);
		var s = V(a), c = V(z(s));
		Z(c), P(s), Ae(), H(() => {
			Q(o, U(l)), o.disabled = !U(E), Q(c, t.model.expectedCalendar ?? ""), c.disabled = r() || !t.model.editable || !n().editControl || !!U(_);
		}), G("input", o, (e) => j("calendar", e.currentTarget.value)), G("change", c, (e) => pe(e.currentTarget.value)), q(e, i);
	};
	Y(it, (e) => {
		t.model.kind === "clock" && e(at);
	}), P(je), P(De);
	var ot = V(De, 2), st = z(ot), ct = z(st, !0);
	P(st), P(ot);
	var lt = V(ot, 2), ut = (e) => {
		q(e, zo());
	};
	Y(lt, (e) => {
		t.model.available || e(ut);
	});
	var dt = V(lt, 2), ft = (e) => {
		var n = Bo(), r = z(n, !0);
		P(n), H(() => J(r, t.model.issue)), q(e, n);
	};
	Y(dt, (e) => {
		t.model.issue && e(ft);
	});
	var pt = V(dt, 2), mt = (e) => {
		var t = Vo(), n = z(t, !0);
		P(t), H(() => J(n, U(v))), q(e, t);
	};
	Y(pt, (e) => {
		U(v) && e(mt);
	});
	var ht = V(pt, 2), gt = (e) => {
		var n = Ho(), r = z(n, !0);
		P(n), H(() => J(r, U(y) || t.model.notice)), q(e, n);
	};
	Y(ht, (e) => {
		(U(y) || !U(b) && t.model.notice) && e(gt);
	}), P(me), H((e, a, o) => {
		$(me, "data-workflow-data", t.model.kind), J(ge, `Uses ${(t.model.name || t.model.targetId) ?? ""}`), _e.open = t.model.kind === "clock", J(ye, `${t.model.kind === "clock" ? "Starting values" : t.model.kind === "outcomes" ? "Initial outcomes" : "Initial content"} `), J(xe, e), J(ke, `${a ?? ""} · ${o ?? ""}`), J(Pe, U(w)), $(ze, "aria-label", "Create separate " + U(T)), $(ze, "title", "Create separate " + U(T)), ze.disabled = r() || !t.model.editable || !t.model.available || !n().createWorkflowData || !!U(_), J(Ge, t.model.kind === "clock" ? "Same clock: shared time. Different clocks: independent time." : t.model.kind === "outcomes" ? "Shared by nodes using these outcomes." : "Shared by nodes using this document."), $(Ye, "id", i() + "-visibility"), $(Xe, "aria-labelledby", i() + "-visibility"), $(nt, "aria-label", U(w) + " document ID"), Q(nt, t.model.targetId), st.disabled = !U(ce), J(ct, U(_) === "save" ? "Saving…" : "Save settings");
	}, [
		() => t.model.kind === "clock" && U(a) ? "Day " + U(o) + " · " + U(s) : U(a) && !U(u).trim() ? "Empty by default" : U(a) ? t.model.kind === "outcomes" && U(u).trim() === "[]" ? "None" : "Initial template" : "Load initial values to edit",
		() => A(U(d)),
		() => ee(U(f))
	]), G("click", ze, () => {
		!r() && t.model.editable && t.model.available && !U(_) && (R(h, !U(h)), R(g, ""), R(v, ""));
	}), G("click", st, ue), q(e, me), He();
}
Cr([
	"click",
	"input",
	"change"
]);
//#endregion
//#region ui/NodeDetails.svelte
var Go = /* @__PURE__ */ K("<small data-canonical-title=\"\" class=\"svelte-59ntjv\"> </small>"), Ko = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-59ntjv\">Duplicate</button>"), qo = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-detail-danger svelte-59ntjv\">Delete</button>"), Jo = /* @__PURE__ */ K("<details class=\"pc-detail-commands svelte-59ntjv\"><summary aria-label=\"Node commands\" title=\"Node commands\" class=\"svelte-59ntjv\">⋯</summary><div class=\"pc-detail-command-list svelte-59ntjv\"><!> <!></div></details>"), Yo = /* @__PURE__ */ K("<p role=\"alert\" class=\"pc-detail-error svelte-59ntjv\"> </p>"), Xo = /* @__PURE__ */ K("<label class=\"svelte-59ntjv\">Workflow stage<select aria-label=\"Workflow stage\" class=\"svelte-59ntjv\"><option class=\"svelte-59ntjv\">Preparation · before Generate Reply</option><option class=\"svelte-59ntjv\">Response · after Generate Reply</option></select></label><!>", 1), Zo = /* @__PURE__ */ K("<p class=\"svelte-59ntjv\"><button type=\"button\" class=\"svelte-59ntjv\">Configure Fast connections…</button></p>"), Qo = /* @__PURE__ */ K("<span class=\"svelte-59ntjv\">Read-only body</span>"), $o = /* @__PURE__ */ K("<span class=\"pc-detail-blocked svelte-59ntjv\">Blocks run · Disabled</span>"), es = /* @__PURE__ */ K("<p class=\"pc-detail-state svelte-59ntjv\"><!><!></p>"), ts = /* @__PURE__ */ K("<p class=\"pc-detail-error svelte-59ntjv\" role=\"alert\"> </p>"), ns = /* @__PURE__ */ K("<option class=\"svelte-59ntjv\"> </option>"), rs = /* @__PURE__ */ K("<fieldset class=\"pc-detail-group svelte-59ntjv\" data-boundary-controls=\"\"><legend class=\"svelte-59ntjv\"> </legend> <label class=\"svelte-59ntjv\">Type<select aria-label=\"Subgraph port type\" class=\"svelte-59ntjv\"></select></label> <label class=\"pc-detail-check svelte-59ntjv\"><input aria-label=\"Required subgraph port\" type=\"checkbox\" class=\"svelte-59ntjv\"/> Required</label> <div class=\"pc-detail-actions svelte-59ntjv\"><button type=\"button\" data-save-boundary=\"\" class=\"svelte-59ntjv\"> </button></div> <small class=\"svelte-59ntjv\">Labels appear on the subgraph block. Disconnect incompatible connections before changing the type. Deleting this node removes its port and attached connections.</small> <!></fieldset>"), is = /* @__PURE__ */ K("<p role=\"status\" class=\"svelte-59ntjv\">Loading file…</p>"), as = /* @__PURE__ */ K("<div data-file-input-controls=\"\" class=\"svelte-59ntjv\"><label class=\"svelte-59ntjv\"> <input type=\"file\" accept=\".txt,.md,.json,text/plain,text/markdown,application/json\" class=\"svelte-59ntjv\"/></label> <p class=\"svelte-59ntjv\"> </p> <small class=\"svelte-59ntjv\">The file's UTF-8 text is embedded in this workflow. Runs use the saved snapshot; replace the file to refresh it.</small> <small class=\"svelte-59ntjv\">Choose a .txt, .md or .json file up to 400,000 bytes and 100,000 UTF-16 code units.</small> <!> <!></div>"), os = /* @__PURE__ */ K("<details class=\"pc-detail-group svelte-59ntjv\"><summary class=\"svelte-59ntjv\"> </summary> <!></details>"), ss = /* @__PURE__ */ K("<!> <fieldset class=\"pc-detail-group pc-detail-main svelte-59ntjv\" data-operation-controls=\"\"><!> <!></fieldset> <!>", 1), cs = /* @__PURE__ */ K("<label class=\"svelte-59ntjv\">Model identifier<input class=\"svelte-59ntjv\"/></label>"), ls = /* @__PURE__ */ K("<small class=\"svelte-59ntjv\"> </small>"), us = /* @__PURE__ */ K("<fieldset class=\"svelte-59ntjv\"><legend class=\"svelte-59ntjv\"> </legend> <label class=\"svelte-59ntjv\">Connection profile<select class=\"svelte-59ntjv\"><option class=\"svelte-59ntjv\">Use helper connection</option><!><!></select></label> <label class=\"svelte-59ntjv\">Model mode<select class=\"svelte-59ntjv\"></select></label> <!> <small class=\"svelte-59ntjv\"> </small><small class=\"svelte-59ntjv\"> </small><!> <!></fieldset>"), ds = /* @__PURE__ */ K("<small class=\"svelte-59ntjv\">This helper has no text model calls to configure.</small>"), fs = /* @__PURE__ */ K("<details class=\"pc-detail-group svelte-59ntjv\" data-helper-model-controls=\"\" open=\"\"><summary class=\"svelte-59ntjv\">Helper model bindings</summary> <small class=\"svelte-59ntjv\">Choose a connection for each text model role in the pinned helper. These selections belong to this For Each node.</small> <!> <!></details>"), ps = /* @__PURE__ */ K("<label class=\"svelte-59ntjv\">Model identifier<input aria-label=\"Model identifier\" class=\"svelte-59ntjv\"/></label>"), ms = /* @__PURE__ */ K("<details class=\"pc-detail-group svelte-59ntjv\" data-model-controls=\"\" open=\"\"><summary class=\"svelte-59ntjv\"> </summary> <label class=\"svelte-59ntjv\">Connection profile<select aria-label=\"Connection profile\" class=\"svelte-59ntjv\"><option class=\"svelte-59ntjv\">Choose a connection</option><!><!></select></label> <label class=\"svelte-59ntjv\">Model mode<select aria-label=\"Model mode\" class=\"svelte-59ntjv\"></select></label> <!> <details data-binding-advanced=\"\" class=\"svelte-59ntjv\"><summary class=\"svelte-59ntjv\">Advanced connection settings</summary> <label class=\"svelte-59ntjv\">Connection mode<select aria-label=\"Connection mode\" class=\"svelte-59ntjv\"></select></label> <label class=\"svelte-59ntjv\">Model role<input aria-label=\"Model role\" class=\"svelte-59ntjv\"/></label></details> <!><!> <!> <!></details>"), hs = /* @__PURE__ */ K("<p class=\"pc-detail-port svelte-59ntjv\"> <small class=\"svelte-59ntjv\"> </small></p>"), gs = /* @__PURE__ */ K("<details class=\"pc-detail-group svelte-59ntjv\"><summary class=\"svelte-59ntjv\">Inputs and outputs</summary><!></details>"), _s = /* @__PURE__ */ K("<p role=\"status\" class=\"svelte-59ntjv\"> </p>"), vs = /* @__PURE__ */ K("<header class=\"svelte-59ntjv\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-59ntjv\"><path class=\"svelte-59ntjv\"></path></svg> <div class=\"pc-detail-identity svelte-59ntjv\"><input class=\"pc-detail-name svelte-59ntjv\" aria-label=\"Node name\"/> <!> <small class=\"svelte-59ntjv\"> </small></div> <!></header> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>", 1), ys = /* @__PURE__ */ K("<p class=\"pc-detail-empty svelte-59ntjv\">Select a node to inspect its settings.</p>"), bs = /* @__PURE__ */ K("<section class=\"pc-node-details svelte-59ntjv\" aria-label=\"Node details\"><!></section>");
function xs(e, t) {
	Ve(t, !0);
	let n = (e, n = d) => {
		{
			let s = /* @__PURE__ */ F(() => U(a)[n().key]?.text ?? k(n())), c = /* @__PURE__ */ F(() => U(a)[n().key]?.error || U(o)[n().key] || ""), l = /* @__PURE__ */ F(() => !!t.view?.readOnly || !r().editControl), u = /* @__PURE__ */ F(() => !!U(a)[n().key]?.pending), d = /* @__PURE__ */ F(() => i() + "-" + n().key);
			so(e, {
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
				ontext: (e) => j(n(), e),
				onvalue: (e) => ie(n(), e),
				onnumber: (e) => ae(n(), e),
				onsave: () => re(n())
			});
		}
	}, r = Oi(t, "actions", 19, () => ({})), i = Oi(t, "idPrefix", 3, "pc-node-details"), a = /* @__PURE__ */ L(Qt({})), o = /* @__PURE__ */ L(Qt({})), s = "", c = "", l = "", u = 0, f = 0, p = 0, h = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ L(!1), _ = 0, v = 0, y = 0, b = /* @__PURE__ */ new Map(), x = /* @__PURE__ */ new Map(), S = /* @__PURE__ */ new Map(), C = (e) => Object.fromEntries(Object.entries(e).map(([e, t]) => [e, {
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
	}), bn(() => {
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
		(i || n !== c || r !== l) && ((i || r !== l) && (f++, y++), i && (p++, s && S.set(s, mr(() => C(U(a))))), s = e, c = n, l = r, h.clear(), u++, R(o, {}, !0), R(g, !1), v++, R(a, w(i ? S.get(e) ?? {} : mr(() => U(a)), t.view), !0));
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
		let s = D(i), c = ++u, l = p, d = A(i, e), f = U(a)[e] && d ? ee(e) : null;
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
	function ne(e) {
		let n = e.files?.[0];
		e.value = "", n && t.view?.fileInput && !t.view.readOnly && r().loadFile && !U(a).fileInput?.pending && (R(a, {
			...U(a),
			fileInput: {
				text: "",
				error: "",
				pending: !1
			}
		}, !0), te("fileInput", !1, (e) => r().loadFile(e, n)));
	}
	function j(e, n) {
		t.view && !t.view.readOnly && (ee(e.key), h.delete(e.key), R(a, {
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
		te(e.key, !1, (t) => r().editControl(t, e.key, i));
	}
	function ie(e, t) {
		r().editControl && te(e.key, !1, (n) => r().editControl(n, e.key, t));
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
		ce() && se(e) && te(oe(e, t), !1, (a) => r().editHelperBinding(a, e, t, n, i));
	}
	function de(e, n) {
		if (!ce() || !se(e)) return;
		let r = oe(e, "model");
		ee(r), h.delete(r), R(a, {
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
		he(e)?.allowedModes.some((e) => e.value === t) && r().editBinding && te(e, !1, (i) => r().editBinding(i, e, t, n));
	}
	let he = (e) => e === "profileId" ? t.view?.model?.profile : t.view?.model?.model, ge = (e = t.view) => !!e?.model && (e.model.editable ?? !e.readOnly) && !!r().editBinding, _e = (e) => U(a)[e] ? "override" : he(e)?.mode, ve = (e) => U(a)[e]?.text ?? he(e)?.value ?? "", ye = () => {
		let e = t.view?.model?.profile;
		return U(a).profileId?.text ?? (e && Object.hasOwn(e, "effectiveValue") ? e.effectiveValue ?? "" : e?.value ?? "");
	}, be = () => t.view?.model?.profile.mode === "override" || !!t.view?.model?.profileDefaultModel;
	function xe(e, t) {
		ge() && he(e)?.allowedModes.some((e) => e.value === "override") && (ee(e), h.delete(e), R(a, {
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
	let M = () => Object.fromEntries((t.view?.modifiers?.items ?? []).map((e) => {
		let t = U(a)["modifier:" + e.id];
		return [e.id, {
			settings: Ee(e),
			error: t?.error || U(o)["modifier:" + e.id] || "",
			pending: !!t?.pending,
			dirty: !!t
		}];
	}));
	function De(e) {
		if (!we() || U(g) || e.length > 16 || !r().editModifiers) return;
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
		te(i, !1, async (n) => {
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
		t.view && !t.view.boundary && r().present && te("alias", !0, (n) => r().present(n, "alias", e === t.view?.canonicalTitle ? "" : e));
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
	function Ue() {
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
		}, !0), te("boundary", !1, async (o) => {
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
	var We = bs(), Ge = z(We), Ke = (e) => {
		var s = vs(), c = B(s);
		let l;
		var u = z(c), d = z(u);
		P(u);
		var f = V(u, 2), p = z(f);
		Z(p);
		var h = V(p, 2), _ = (e) => {
			var n = Go(), r = z(n);
			P(n), H(() => J(r, `Canonical type: ${t.view.canonicalTitle ?? ""}`)), q(e, n);
		};
		Y(h, (e) => {
			!t.view.boundary && (t.view.alias || t.view.title || t.view.canonicalTitle) !== t.view.canonicalTitle && e(_);
		});
		var v = V(h, 2), y = z(v, !0);
		P(v), P(f);
		var b = V(f, 2), x = (e) => {
			var n = Jo(), i = V(z(n)), a = z(i), o = (e) => {
				var n = Ko();
				H(() => n.disabled = t.view.readOnly), G("click", n, () => {
					t.view && !t.view.readOnly && r().duplicate?.(D(t.view));
				}), q(e, n);
			};
			Y(a, (e) => {
				!t.view.boundary && r().duplicate && e(o);
			});
			var s = V(a, 2), c = (e) => {
				var n = qo();
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
			var n = Xo(), i = B(n), a = V(z(i)), s = z(a);
			s.value = s.__value = "pre";
			var c = V(s);
			c.value = c.__value = "post", P(a);
			var l;
			fi(a), P(i);
			var u = V(i), d = (e) => {
				var t = Yo(), n = z(t, !0);
				P(t), H(() => J(n, U(o).phase)), q(e, t);
			};
			Y(u, (e) => {
				U(o).phase && e(d);
			}), H(() => {
				a.disabled = t.view.readOnly || !r().editPhase, l !== (l = t.view.phase) && (a.value = (a.__value = t.view.phase) ?? "", di(a, t.view.phase));
			}), G("change", a, (e) => {
				let t = e.currentTarget.value;
				te("phase", !1, (e) => r().editPhase(e, t));
			}), q(e, n);
		};
		Y(S, (e) => {
			t.view.phaseEditable && e(C);
		});
		var w = V(S, 2), T = (e) => {
			var t = Zo(), n = z(t);
			P(t), H(() => n.disabled = !r().openFastConnections), G("click", n, () => r().openFastConnections?.()), q(e, t);
		};
		Y(w, (e) => {
			t.view.operation === "fast-decision" && e(T);
		});
		var E = V(w, 2), O = (e) => {
			var n = es(), r = z(n), i = (e) => {
				q(e, Qo());
			};
			Y(r, (e) => {
				t.view.readOnly && e(i);
			});
			var a = V(r), o = (e) => {
				q(e, $o());
			};
			Y(a, (e) => {
				t.view.enabled || e(o);
			}), P(n), q(e, n);
		};
		Y(E, (e) => {
			(t.view.readOnly || !t.view.enabled) && e(O);
		});
		var k = V(E, 2), A = (e) => {
			var t = ts(), n = z(t, !0);
			P(t), H(() => J(n, U(o).alias)), q(e, t);
		};
		Y(k, (e) => {
			U(o).alias && e(A);
		});
		var ee = V(k, 2), j = (e) => {
			var n = rs(), i = z(n), s = z(i);
			P(i);
			var c = V(i, 2), l = V(z(c));
			X(l, 21, () => t.view.boundary.kinds, Wr, (e, t) => {
				var n = ns(), r = z(n, !0);
				P(n);
				var i = {};
				H(() => {
					J(r, U(t)), i !== (i = U(t)) && (n.value = (n.__value = U(t)) ?? "");
				}), q(e, n);
			}), P(l);
			var u;
			fi(l), P(c);
			var d = V(c, 2), f = z(d);
			Z(f), Ae(), P(d);
			var p = V(d, 2), m = z(p), h = z(m, !0);
			P(m), P(p);
			var g = V(p, 4), _ = (e) => {
				var t = ts(), n = z(t, !0);
				P(t), H(() => J(n, U(a).boundary?.error || U(o).boundary)), q(e, t);
			};
			Y(g, (e) => {
				(U(a).boundary?.error || U(o).boundary) && e(_);
			}), P(n), H((e, n, i) => {
				J(s, `Subgraph ${t.view.boundary.direction ?? ""}`), l.disabled = t.view.readOnly || !r().editInterface, u !== (u = e) && (l.value = (l.__value = e) ?? "", di(l, e)), yi(f, n), f.disabled = t.view.readOnly || !r().editInterface, m.disabled = i, J(h, U(a).boundary?.pending ? "Validating…" : "Save port");
			}, [
				() => ze().artifactKind,
				() => ze().required,
				() => t.view.readOnly || !r().editInterface || !ze().label.trim() || !!U(a).boundary?.pending
			]), G("change", l, (e) => Be("artifactKind", e.currentTarget.value)), G("change", f, (e) => Be("required", e.currentTarget.checked)), G("click", m, () => Ue()), q(e, n);
		};
		Y(ee, (e) => {
			t.view.boundary && e(j);
		});
		var re = V(ee, 2), ie = (e) => {
			var s = ss(), c = B(s), l = (e) => {
				{
					let n = /* @__PURE__ */ F(() => D(t.view)), a = /* @__PURE__ */ F(() => i() + "-workflow-data");
					Wo(e, {
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
				var n = as(), s = z(n), c = z(s, !0), l = V(c);
				P(s);
				var u = V(s, 2), d = z(u, !0);
				P(u);
				var f = V(u, 6), p = (e) => {
					q(e, is());
				};
				Y(f, (e) => {
					U(a).fileInput?.pending && e(p);
				});
				var m = V(f, 2), h = (e) => {
					var t = ts(), n = z(t, !0);
					P(t), H(() => {
						$(t, "id", i() + "-error-fileInput"), J(n, U(o).fileInput);
					}), q(e, t);
				};
				Y(m, (e) => {
					U(o).fileInput && e(h);
				}), P(n), H(() => {
					J(c, t.view.fileInput.loaded ? "Replace file" : "Choose file"), $(l, "aria-label", t.view.fileInput.loaded ? "Replace file" : "Choose file"), l.disabled = t.view.readOnly || !r().loadFile || !!U(a).fileInput?.pending, $(l, "aria-invalid", !!U(o).fileInput), $(l, "aria-describedby", U(o).fileInput ? i() + "-error-fileInput" : void 0), J(d, t.view.fileInput.loaded ? "Loaded file: " + t.view.fileInput.fileName : "No file loaded.");
				}), G("change", l, (e) => ne(e.currentTarget)), q(e, n);
			};
			Y(d, (e) => {
				t.view.fileInput && e(f);
			}), X(V(d, 2), 17, () => Fe().filter(([e]) => e === "Main"), ([e, t]) => e, (e, t) => {
				var r = /* @__PURE__ */ F(() => m(U(t), 2));
				let i = () => U(r)[1];
				var a = Pr();
				X(B(a), 17, i, (e) => e.key, (e, t) => {
					n(e, () => U(t));
				}), q(e, a);
			}), P(u), X(V(u, 2), 17, () => Fe().filter(([e]) => e !== "Main"), ([e, t]) => e, (e, t) => {
				var r = /* @__PURE__ */ F(() => m(U(t), 2));
				let i = () => U(r)[0], a = () => U(r)[1];
				var o = os(), s = z(o), c = z(s, !0);
				P(s), X(V(s, 2), 17, a, (e) => e.key, (e, t) => {
					n(e, () => U(t));
				}), P(o), H((e) => {
					$(o, "data-control-group", i()), o.open = e, J(c, i());
				}, [() => Ie(a())]), q(e, o);
			}), q(e, s);
		};
		Y(re, (e) => {
			t.view.boundary || e(ie);
		});
		var ae = V(re, 2), se = (e) => {
			var n = fs(), r = V(z(n), 4);
			X(r, 17, () => t.view.helperBindings.roles, (e) => e.role, (e, t) => {
				var n = us(), r = z(n), i = z(r, !0);
				P(r);
				var s = V(r, 2), c = V(z(s)), l = z(c);
				l.value = l.__value = "";
				var u = V(l), d = (e) => {
					var n = ns(), r = z(n);
					P(n);
					var i = {};
					H(() => {
						J(r, `Unavailable connection · ${U(t).profile.value ?? ""}`), i !== (i = U(t).profile.value) && (n.value = (n.__value = U(t).profile.value) ?? "");
					}), q(e, n);
				}, f = /* @__PURE__ */ F(() => U(t).profile.value && !(U(t).profile.options ?? []).some((e) => e.value === U(t).profile.value));
				Y(u, (e) => {
					U(f) && e(d);
				}), X(V(u), 17, () => U(t).profile.options ?? [], (e) => e.value, (e, t) => {
					var n = ns(), r = z(n, !0);
					P(n);
					var i = {};
					H(() => {
						J(r, U(t).label), i !== (i = U(t).value) && (n.value = (n.__value = U(t).value) ?? "");
					}), q(e, n);
				}), P(c);
				var p;
				fi(c), P(s);
				var m = V(s, 2), h = V(z(m));
				X(h, 21, () => U(t).model.allowedModes, (e) => e.value, (e, t) => {
					var n = ns(), r = z(n, !0);
					P(n);
					var i = {};
					H(() => {
						J(r, U(t).label), i !== (i = U(t).value) && (n.value = (n.__value = U(t).value) ?? "");
					}), q(e, n);
				}), P(h);
				var g;
				fi(h), P(m);
				var _ = V(m, 2), v = (e) => {
					var n = cs(), r = V(z(n));
					Z(r), P(n), H((e, n) => {
						$(r, "aria-label", U(t).role + " model identifier"), Q(r, e), r.disabled = n;
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
					var n = ls(), r = z(n, !0);
					P(n), H(() => J(r, U(t).caveat)), q(e, n);
				};
				Y(w, (e) => {
					U(t).caveat && e(T);
				});
				var E = V(w, 2), D = (e) => {
					var n = ts(), r = z(n, !0);
					P(n), H((e) => J(r, e), [() => U(o)[oe(U(t).role, "profileId")] || U(o)[oe(U(t).role, "model")]]), q(e, n);
				}, O = /* @__PURE__ */ F(() => U(o)[oe(U(t).role, "profileId")] || U(o)[oe(U(t).role, "model")]);
				Y(E, (e) => {
					U(O) && e(D);
				}), P(n), H((e, n, r) => {
					J(i, U(t).label), $(c, "aria-label", U(t).role + " connection profile"), c.disabled = e, p !== (p = U(t).profile.value ?? "") && (c.value = (c.__value = U(t).profile.value ?? "") ?? "", di(c, U(t).profile.value ?? "")), $(h, "aria-label", U(t).role + " model mode"), h.disabled = n, g !== (g = r) && (h.value = (h.__value = r) ?? "", di(h, r)), J(x, `Effective connection: ${U(t).effective ?? ""}`), J(C, U(t).source);
				}, [
					() => !ce(),
					() => !ce(),
					() => le(U(t).role)
				]), G("change", c, (e) => ue(U(t).role, "profileId", e.currentTarget.value ? "override" : "inherit", e.currentTarget.value || null)), G("change", h, (e) => fe(U(t).role, e.currentTarget.value)), q(e, n);
			});
			var i = V(r, 2), s = (e) => {
				var n = ts(), r = z(n, !0);
				P(n), H(() => J(r, t.view.helperBindings.issue)), q(e, n);
			}, c = (e) => {
				q(e, ds());
			};
			Y(i, (e) => {
				t.view.helperBindings.issue ? e(s) : t.view.helperBindings.roles.length || e(c, 1);
			}), P(n), q(e, n);
		};
		Y(ae, (e) => {
			t.view.helperBindings && e(se);
		});
		var me = V(ae, 2), he = (e) => {
			var n = ms(), i = z(n), s = z(i, !0);
			P(i);
			var c = V(i, 2), l = V(z(c)), u = z(l);
			u.value = u.__value = "";
			var d = V(u), f = (e) => {
				var t = ns(), n = z(t);
				P(t);
				var r = {};
				H((e, i) => {
					J(n, `Unavailable connection · ${e ?? ""}`), r !== (r = i) && (t.value = (t.__value = i) ?? "");
				}, [() => ye(), () => ye()]), q(e, t);
			}, p = /* @__PURE__ */ F(() => ye() && !(t.view.model.profile.options ?? []).some((e) => e.value === ye()));
			Y(d, (e) => {
				U(p) && e(f);
			}), X(V(d), 17, () => t.view.model.profile.options ?? [], (e) => e.value, (e, t) => {
				var n = ns(), r = z(n, !0);
				P(n);
				var i = {};
				H(() => {
					J(r, U(t).label), i !== (i = U(t).value) && (n.value = (n.__value = U(t).value) ?? "");
				}), q(e, n);
			}), P(l);
			var m;
			fi(l), P(c);
			var h = V(c, 2), g = V(z(h));
			X(g, 21, () => t.view.model.model.allowedModes, (e) => e.value, (e, n) => {
				var r = ns(), i = z(r, !0);
				P(r);
				var a = {};
				H((e) => {
					J(i, e), a !== (a = U(n).value) && (r.value = (r.__value = U(n).value) ?? "");
				}, [() => U(n).value === "inherit" && !t.view.readOnly ? be() || !t.view.model.model.effectiveValue ? "Use profile model" : "Existing role model" : U(n).label]), q(e, r);
			}), P(g);
			var _;
			fi(g), P(h);
			var v = V(h, 2), y = (e) => {
				var t = ps(), n = V(z(t));
				Z(n), P(t), H((e, t) => {
					Q(n, e), n.disabled = t;
				}, [() => ve("model"), () => !ge()]), G("input", n, (e) => xe("model", e.currentTarget.value)), G("change", n, (e) => Ce("model", e.currentTarget.value)), q(e, t);
			}, b = /* @__PURE__ */ F(() => _e("model") === "override");
			Y(v, (e) => {
				U(b) && e(y);
			});
			var x = V(v, 2), S = V(z(x), 2), C = V(z(S));
			X(C, 21, () => t.view.model.profile.allowedModes, (e) => e.value, (e, t) => {
				var n = ns(), r = z(n, !0);
				P(n);
				var i = {};
				H(() => {
					J(r, U(t).label), i !== (i = U(t).value) && (n.value = (n.__value = U(t).value) ?? "");
				}), q(e, n);
			}), P(C);
			var w;
			fi(C), P(S);
			var T = V(S, 2), E = V(z(T));
			Z(E), P(T), P(x);
			var D = V(x, 2), O = (e) => {
				var n = ls(), r = z(n);
				P(n), H(() => J(r, `Effective connection: ${t.view.model.effective ?? ""}`)), q(e, n);
			}, k = /* @__PURE__ */ F(() => !t.view.model.issue || t.view.model.effective.trim() !== t.view.model.issue.trim());
			Y(D, (e) => {
				U(k) && e(O);
			});
			var A = V(D), ee = (e) => {
				var n = ls(), r = z(n, !0);
				P(n), H(() => J(r, t.view.model.source)), q(e, n);
			};
			Y(A, (e) => {
				t.view.model.source && e(ee);
			});
			var ne = V(A, 2), j = (e) => {
				var n = ts(), r = z(n, !0);
				P(n), H(() => J(r, t.view.model.issue)), q(e, n);
			};
			Y(ne, (e) => {
				t.view.model.issue && e(j);
			});
			var re = V(ne, 2), ie = (e) => {
				var t = ts(), n = z(t, !0);
				P(t), H(() => J(n, U(o).modelRole || U(a).profileId?.error || U(o).profileId || U(a).model?.error || U(o).model)), q(e, t);
			};
			Y(re, (e) => {
				(U(o).modelRole || U(a).profileId?.error || U(o).profileId || U(a).model?.error || U(o).model) && e(ie);
			}), P(n), H((e, n, i, a, o, c, u) => {
				J(s, e), l.disabled = n, m !== (m = i) && (l.value = (l.__value = i) ?? "", di(l, i)), g.disabled = a, _ !== (_ = o) && (g.value = (g.__value = o) ?? "", di(g, o)), C.disabled = c, w !== (w = u) && (C.value = (C.__value = u) ?? "", di(C, u)), Q(E, t.view.model.role), E.disabled = t.view.readOnly || !t.view.model.roleEditable || !r().editField;
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
				t.view?.model?.roleEditable && r().editField && te("modelRole", !1, (e) => r().editField(e, "modelRole", n));
			}), q(e, n);
		};
		Y(me, (e) => {
			t.view.model && e(he);
		});
		var Te = V(me, 2), Ee = (e) => {
			var n = gs();
			X(V(z(n)), 17, () => t.view.ports, (e) => e.direction + ":" + e.id, (e, t) => {
				var n = hs(), r = z(n), i = V(r), a = z(i, !0);
				P(i), P(n), H(() => {
					J(r, `${U(t).direction === "input" ? "In" : "Out"} · ${U(t).label ?? ""}`), J(a, U(t).kind);
				}), q(e, n);
			}), P(n), q(e, n);
		};
		Y(Te, (e) => {
			t.view.ports.length && e(Ee);
		});
		var De = V(Te, 2), Ve = (e) => {
			var n = _s(), r = z(n, !0);
			P(n), H(() => J(r, t.view.status)), q(e, n);
		};
		Y(De, (e) => {
			t.view.status && e(Ve);
		});
		var He = V(De, 2);
		X(He, 17, () => t.view.issues ?? [], Wr, (e, t) => {
			var n = ts(), r = z(n, !0);
			P(n), H(() => J(r, U(t))), q(e, n);
		});
		var We = V(He, 2), Ge = (e) => {
			{
				let n = /* @__PURE__ */ F(() => !we()), r = /* @__PURE__ */ F(M), a = /* @__PURE__ */ F(() => U(o).modifiers || "");
				wo(e, {
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
					onenable: ke,
					onremove: je,
					onmove: Me,
					ondraft: Ne,
					onsave: Pe
				});
			}
		};
		Y(We, (e) => {
			t.view.modifiers && e(Ge);
		}), H((e) => {
			l = ui(c, "", l, { "--pc-detail-family": t.view.familyColor ?? "var(--pc-accent)" }), $(d, "d", t.view.iconPath), $(p, "id", i() + "-name"), $(p, "maxlength", t.view.boundary ? void 0 : 80), Q(p, e), p.disabled = t.view.boundary ? t.view.readOnly || !r().editInterface : !t.view.canPresent || !r().present, J(y, t.view.boundary ? "Subgraph " + t.view.boundary.direction : t.view.family + " · " + t.view.phase + " phase");
		}, [() => t.view.boundary ? ze().label : t.view.alias || t.view.title || t.view.canonicalTitle]), G("input", p, (e) => {
			t.view?.boundary && Be("label", e.currentTarget.value);
		}), G("change", p, (e) => {
			t.view?.boundary || Re(e.currentTarget.value);
		}), q(e, s);
	}, qe = (e) => {
		q(e, ys());
	};
	Y(Ge, (e) => {
		t.view ? e(Ke) : e(qe, -1);
	}), P(We), q(e, We), He();
}
Cr([
	"input",
	"change",
	"click"
]);
//#endregion
//#region ui/CommentDetails.svelte
var Ss = /* @__PURE__ */ K("<p class=\"pc-detail-meta svelte-17djc3u\">Read-only comment</p>"), Cs = /* @__PURE__ */ K("<section class=\"pc-comment-details svelte-17djc3u\" aria-label=\"Comment details\"><h3 class=\"svelte-17djc3u\">Comment</h3> <!> <fieldset class=\"pc-detail-group svelte-17djc3u\"><legend class=\"svelte-17djc3u\">Comment</legend> <label class=\"svelte-17djc3u\">Title<input aria-label=\"Comment title\" class=\"svelte-17djc3u\"/></label> <label class=\"svelte-17djc3u\">Notes<textarea aria-label=\"Comment notes\" rows=\"5\" class=\"svelte-17djc3u\"></textarea></label> <label class=\"pc-comment-color-label svelte-17djc3u\">Color<input aria-label=\"Comment color\" type=\"color\" class=\"svelte-17djc3u\"/></label> <label class=\"pc-detail-check svelte-17djc3u\"><input aria-label=\"Move contents\" type=\"checkbox\" class=\"svelte-17djc3u\"/> Move contents</label> <small class=\"svelte-17djc3u\">Moves fully contained nodes when you drag the comment header.</small></fieldset> <div class=\"pc-comment-commands svelte-17djc3u\"><button type=\"button\" class=\"pc-btn svelte-17djc3u\">Fit to contents</button> <button type=\"button\" class=\"pc-btn pc-danger svelte-17djc3u\">Delete comment</button></div> <small class=\"svelte-17djc3u\">Deleting this comment keeps its contents.</small></section>");
function ws(e, t) {
	Ve(t, !0);
	let n = Oi(t, "readOnly", 3, !1), r = /* @__PURE__ */ F(() => n() || t.comment.readOnly), i = (e) => e.stopPropagation();
	function a(e) {
		U(r) || t.onPatch(e);
	}
	function o(e) {
		U(r) || t.onCommand(e);
	}
	var s = Cs(), c = V(z(s), 2), l = (e) => {
		q(e, Ss());
	};
	Y(c, (e) => {
		U(r) && e(l);
	});
	var u = V(c, 2), d = V(z(u), 2), f = V(z(d));
	Z(f), P(d);
	var p = V(d, 2), m = V(z(p));
	rt(m), P(p);
	var h = V(p, 2), g = V(z(h));
	Z(g), P(h);
	var _ = V(h, 2), v = z(_);
	Z(v), Ae(), P(_), Ae(2), P(u);
	var y = V(u, 2), b = z(y), x = V(b, 2);
	P(y), Ae(2), P(s), H(() => {
		u.disabled = U(r), Q(f, t.comment.title), f.disabled = U(r), Q(m, t.comment.content), m.disabled = U(r), Q(g, t.comment.color), g.disabled = U(r), yi(v, t.comment.moveContents), v.disabled = U(r), b.disabled = U(r), x.disabled = U(r);
	}), W("keydown", f, i, !0), G("change", f, (e) => a({ title: e.currentTarget.value })), W("keydown", m, i, !0), G("change", m, (e) => a({ content: e.currentTarget.value })), G("change", g, (e) => a({ color: e.currentTarget.value })), G("change", v, (e) => a({ moveContents: e.currentTarget.checked })), G("click", b, () => o("fit")), G("click", x, () => o("delete")), q(e, s), He();
}
Cr(["change", "click"]);
//#endregion
//#region ui/OutputPreview.svelte
var Ts = /* @__PURE__ */ K("<option class=\"svelte-ee2ehy\"> </option>"), Es = /* @__PURE__ */ K("<label class=\"pc-preview-choice svelte-ee2ehy\"><span class=\"pc-preview-sr-only svelte-ee2ehy\">Preview output</span><select aria-label=\"Preview output\" class=\"svelte-ee2ehy\"><option disabled=\"\" class=\"svelte-ee2ehy\">Choose an output</option><!></select></label>"), Ds = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-ee2ehy\">Collapse preview</button>"), Os = /* @__PURE__ */ K("<button type=\"button\" role=\"tab\" class=\"svelte-ee2ehy\"> </button>"), ks = /* @__PURE__ */ K("<div class=\"pc-preview-tabs svelte-ee2ehy\" role=\"tablist\" aria-label=\"Recorded artifacts\"></div>"), As = /* @__PURE__ */ K("<p class=\"pc-preview-note svelte-ee2ehy\"> </p>"), js = /* @__PURE__ */ K("<pre class=\"svelte-ee2ehy\"> </pre>"), Ms = /* @__PURE__ */ K("<small class=\"pc-preview-note svelte-ee2ehy\"> </small>"), Ns = /* @__PURE__ */ K("<div role=\"tabpanel\" tabindex=\"0\" class=\"svelte-ee2ehy\"><article class=\"svelte-ee2ehy\"><div class=\"pc-preview-section-heading svelte-ee2ehy\"><span class=\"svelte-ee2ehy\"> </span><small class=\"svelte-ee2ehy\"> </small></div> <!> <!></article></div>"), Ps = /* @__PURE__ */ K("<p class=\"pc-preview-empty svelte-ee2ehy\"> </p>"), Fs = /* @__PURE__ */ K("<section aria-label=\"Accepted consequences\" class=\"pc-preview-settlement svelte-ee2ehy\"><strong class=\"svelte-ee2ehy\"> </strong> <!></section>"), Is = /* @__PURE__ */ K("<p class=\"pc-preview-error svelte-ee2ehy\"> </p>"), Ls = /* @__PURE__ */ K("<button type=\"button\" data-run-here=\"\" title=\"Runs the selected output's dependencies. Results are diagnostic previews.\" class=\"svelte-ee2ehy\"> </button>"), Rs = /* @__PURE__ */ K("<button type=\"button\" data-preview-apply=\"\" class=\"svelte-ee2ehy\"> </button><button type=\"button\" class=\"svelte-ee2ehy\"> </button>", 1), zs = /* @__PURE__ */ K("<header class=\"svelte-ee2ehy\"><h3 class=\"svelte-ee2ehy\"> </h3> <!> <div class=\"pc-preview-tools svelte-ee2ehy\"><button type=\"button\" class=\"svelte-ee2ehy\">Follow selection</button><button type=\"button\" class=\"svelte-ee2ehy\"> </button><!></div></header> <!> <div class=\"pc-preview-sections svelte-ee2ehy\"><!> <!> <!> <!> <!> <!> <!> <!></div> <footer class=\"svelte-ee2ehy\"><span class=\"pc-preview-status svelte-ee2ehy\"> </span> <span class=\"svelte-ee2ehy\"> </span> <!> <!></footer>", 1), Bs = /* @__PURE__ */ K("<p class=\"pc-preview-empty svelte-ee2ehy\">Select a node output to inspect its recorded result.</p>"), Vs = /* @__PURE__ */ K("<section class=\"pc-output-preview svelte-ee2ehy\" aria-label=\"Output preview\"><!></section>");
function Hs(e, t) {
	let n = Fr();
	Ve(t, !0);
	let r = Oi(t, "actions", 19, () => ({})), i = /* @__PURE__ */ F(() => JSON.stringify([t.view?.sourceKey, t.view?.selectedKey])), a = /* @__PURE__ */ L(Qt({
		scope: "",
		id: null
	})), o = /* @__PURE__ */ F(() => (U(a).scope === U(i) ? t.view?.sections.find((e) => e.id === U(a).id) : null) ?? t.view?.sections[0] ?? null);
	bn(() => {
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
	var y = Vs(), b = z(y), x = (e) => {
		var d = zs(), m = B(d), y = z(m), b = z(y, !0);
		P(y);
		var x = V(y, 2), S = (e) => {
			var n = Es(), i = V(z(n)), a = z(i);
			a.value = a.__value = "", X(V(a), 17, () => t.view.choices, (e) => e.key, (e, t) => {
				var n = Ts(), r = z(n);
				P(n);
				var i = {};
				H(() => {
					J(r, `${U(t).label ?? ""} · ${U(t).kind ?? ""}`), i !== (i = U(t).key) && (n.value = (n.__value = U(t).key) ?? "");
				}), q(e, n);
			}), P(i);
			var o;
			fi(i), P(n), H(() => {
				i.disabled = !r().select, o !== (o = t.view.selectedKey ?? "") && (i.value = (i.__value = t.view.selectedKey ?? "") ?? "", di(i, t.view.selectedKey ?? ""));
			}), G("change", i, (e) => _(e.currentTarget.value)), q(e, n);
		};
		Y(x, (e) => {
			t.view.choices.length && e(S);
		});
		var C = V(x, 2), w = z(C), T = V(w), E = z(T, !0);
		P(T);
		var D = V(T), O = (e) => {
			var n = Ds();
			G("click", n, function(...e) {
				t.collapse?.apply(this, e);
			}), q(e, n);
		};
		Y(D, (e) => {
			t.collapse && e(O);
		}), P(C), P(m);
		var k = V(m, 2), A = (e) => {
			var r = ks();
			X(r, 23, () => t.view.sections, (e) => e.id, (e, t, r) => {
				var l = Os(), u = z(l, !0);
				P(l), H((e) => {
					$(l, "id", e), $(l, "aria-selected", U(o)?.id === U(t).id), $(l, "aria-controls", n + "-panel"), $(l, "tabindex", U(o)?.id === U(t).id ? 0 : -1), J(u, U(t).label);
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
		var ee = V(k, 2), te = z(ee), ne = (e) => {
			let t = /* @__PURE__ */ F(() => U(o));
			var r = Ns(), i = z(r), a = z(i), c = z(a), l = z(c, !0);
			P(c);
			var u = V(c), d = z(u, !0);
			P(u), P(a);
			var f = V(a, 2), p = (e) => {
				var n = As(), r = z(n, !0);
				P(n), H(() => J(r, U(t).text)), q(e, n);
			}, m = (e) => {
				var n = js(), r = z(n, !0);
				P(n), H(() => J(r, U(t).text)), q(e, n);
			};
			Y(f, (e) => {
				U(t).format === "omitted" ? e(p) : e(m, -1);
			});
			var h = V(f, 2), g = (e) => {
				var n = Ms(), r = z(n);
				P(n), H(() => J(r, `Truncated diagnostic${U(t).format === "json-prefix-text" ? " · JSON prefix shown as text" : ""}`)), q(e, n);
			};
			Y(h, (e) => {
				U(t).truncated && e(g);
			}), P(i), P(r), H((e) => {
				$(r, "id", n + "-panel"), $(r, "aria-labelledby", e), $(i, "data-artifact-kind", U(t).kind), J(l, U(t).label), J(d, U(t).kind);
			}, [() => s(U(t).id)]), W("keydown", r, (e) => e.stopPropagation(), !0), W("paste", r, (e) => e.stopPropagation(), !0), q(e, r);
		}, j = (e) => {
			var n = Ps(), r = z(n, !0);
			P(n), H(() => J(r, t.view.status === "not-run" ? "Run this workflow or use Run to here to inspect an output." : "No recorded artifact is available for this output.")), q(e, n);
		};
		Y(te, (e) => {
			U(o) ? e(ne) : e(j, -1);
		});
		var re = V(te, 2), ie = (e) => {
			var n = Fs(), r = z(n), i = z(r);
			P(r), X(V(r, 2), 17, () => t.view.settlement.receipts, (e) => e.intentId + ":" + e.targetId, (e, t) => {
				var n = As(), r = z(n);
				P(n), H(() => J(r, `${U(t).targetId ?? ""} · ${U(t).status ?? ""}${U(t).error ? " · " + U(t).error.message : ""}`)), q(e, n);
			}), P(n), H(() => J(i, `Accepted consequences · ${t.view.settlement.status === "settled" ? "Saved" : t.view.settlement.status === "partial" ? "Some targets failed" : "Save confirmation needed"}`)), q(e, n);
		};
		Y(re, (e) => {
			t.view.settlement && e(ie);
		});
		var ae = V(re, 2), oe = (e) => {
			var n = As(), r = z(n, !0);
			P(n), H(() => J(r, t.view.statusDetail)), q(e, n);
		};
		Y(ae, (e) => {
			t.view.statusDetail && e(oe);
		});
		var se = V(ae, 2);
		X(se, 17, () => t.view.sections.filter((e) => e.id !== U(o)?.id && (e.format === "omitted" || e.truncated)), (e) => e.id, (e, t) => {
			var n = As(), r = z(n);
			P(n), H(() => J(r, `${U(t).label ?? ""}: ${(U(t).format === "omitted" ? U(t).text : "Truncated diagnostic" + (U(t).format === "json-prefix-text" ? " · JSON prefix shown as text" : "")) ?? ""}`)), q(e, n);
		});
		var ce = V(se, 2), le = (e) => {
			var n = As(), r = z(n, !0);
			P(n), H(() => J(r, t.view.runHere.issue)), q(e, n);
		};
		Y(ce, (e) => {
			t.view.runHere?.issue && e(le);
		});
		var ue = V(ce, 2);
		X(ue, 17, () => t.view.issues, Wr, (e, t) => {
			var n = Is(), r = z(n, !0);
			P(n), H(() => J(r, U(t))), q(e, n);
		});
		var de = V(ue, 2), fe = (e) => {
			var n = Is(), r = z(n, !0);
			P(n), H(() => J(r, t.view.review.issue)), q(e, n);
		};
		Y(de, (e) => {
			t.view.review?.issue && e(fe);
		});
		var pe = V(de, 2), me = (e) => {
			var n = Ms(), r = z(n, !0);
			P(n), H(() => J(r, t.view.review.persistOnly ? "Retry keeps the accepted reply and retries failed targets. No model request is made." : "Apply rechecks the source, connection and final evidence. Recorded preview text may be truncated.")), q(e, n);
		};
		Y(pe, (e) => {
			t.view.review && e(me);
		}), P(ee);
		var he = V(ee, 2), ge = z(he), _e = z(ge, !0);
		P(ge);
		var ve = V(ge, 2), ye = z(ve, !0);
		P(ve);
		var be = V(ve, 2), xe = (e) => {
			var n = Ls(), i = z(n);
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
			var n = Rs(), i = B(n), a = z(i, !0);
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
			J(b, U(l)?.label ?? t.view.title), $(w, "aria-pressed", t.view.followSelection), w.disabled = !r().follow, $(T, "aria-pressed", t.view.pinned), T.disabled = t.view.pinned ? !r().follow : !U(l) || !r().pin, J(E, t.view.pinned ? "Unpin preview" : "Pin preview"), $(ge, "data-status", t.view.status), J(_e, e), J(ye, t.view.pinned ? "Pinned preview" : t.view.followSelection ? "Following selection" : "Selection not followed");
		}, [() => u(t.view.status)]), G("click", w, () => r().follow?.()), G("click", T, () => {
			t.view?.pinned ? r().follow?.() : t.view && U(l) && r().pin?.(t.view.sourceKey, f(U(l).target));
		}), q(e, d);
	}, S = (e) => {
		q(e, Bs());
	};
	Y(b, (e) => {
		t.view ? e(x) : e(S, -1);
	}), P(y), q(e, y), He();
}
Cr(["change", "click"]);
//#endregion
//#region ui/RunDetails.svelte
var Us = /* @__PURE__ */ K("<p class=\"pc-run-memory svelte-f9s2fm\" role=\"status\"> </p>"), Ws = /* @__PURE__ */ K("<p class=\"pc-run-error svelte-f9s2fm\"> </p>"), Gs = /* @__PURE__ */ K("<p class=\"pc-run-empty svelte-f9s2fm\">No execution plan has been recorded.</p>"), Ks = /* @__PURE__ */ K("<span aria-hidden=\"true\" class=\"svelte-f9s2fm\">▱</span>"), qs = /* @__PURE__ */ K("<small class=\"svelte-f9s2fm\"> </small>"), Js = /* @__PURE__ */ K("<details class=\"svelte-f9s2fm\"><summary class=\"svelte-f9s2fm\">Reported usage</summary><div class=\"pc-run-usage svelte-f9s2fm\"><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small></div></details>"), Ys = /* @__PURE__ */ K("<li class=\"svelte-f9s2fm\"><div class=\"pc-run-row-heading svelte-f9s2fm\"><button type=\"button\" class=\"svelte-f9s2fm\"><!> </button><span class=\"pc-run-status svelte-f9s2fm\"> </span></div> <!> <div class=\"pc-run-row-meta svelte-f9s2fm\"><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small></div> <!> <!></li>"), Xs = /* @__PURE__ */ K("<header class=\"svelte-f9s2fm\"><h3 class=\"svelte-f9s2fm\">Run details</h3><span class=\"pc-run-status svelte-f9s2fm\"> </span></header> <div class=\"pc-run-summary svelte-f9s2fm\"><p class=\"svelte-f9s2fm\"> </p><p class=\"svelte-f9s2fm\"> </p><p class=\"svelte-f9s2fm\"> </p></div> <!> <!> <!> <ol class=\"pc-run-rows svelte-f9s2fm\"></ol>", 1), Zs = /* @__PURE__ */ K("<p class=\"pc-run-empty svelte-f9s2fm\">Run a workflow to inspect its processing stages.</p>"), Qs = /* @__PURE__ */ K("<section class=\"pc-run-details svelte-f9s2fm\" aria-label=\"Run details\"><!></section>");
function $s(e, t) {
	Ve(t, !0);
	let n = Oi(t, "actions", 19, () => ({})), r = (e) => e === "not-run" ? "Not run" : e === "empty" ? "Ready" : e.charAt(0).toUpperCase() + e.slice(1), i = (e) => e !== null && Number.isFinite(e) && e >= 0 ? (e / 1e3).toFixed(2) + "s" : "Unknown", a = (e) => e != null && Number.isFinite(e) && e >= 0 ? String(e) : "Unknown";
	var o = Qs(), s = z(o), c = (e) => {
		var o = Xs(), s = B(o), c = V(z(s)), l = z(c, !0);
		P(c), P(s);
		var u = V(s, 2), d = z(u), f = z(d);
		P(d);
		var p = V(d), m = z(p);
		P(p);
		var h = V(p), g = z(h);
		P(h), P(u);
		var _ = V(u, 2), v = (e) => {
			var n = Us(), r = z(n, !0);
			P(n), H(() => J(r, t.view.memoryStatus)), q(e, n);
		};
		Y(_, (e) => {
			t.view.memoryStatus && e(v);
		});
		var y = V(_, 2), b = (e) => {
			var n = Ws(), r = z(n, !0);
			P(n), H(() => J(r, t.view.issue)), q(e, n);
		};
		Y(y, (e) => {
			t.view.issue && e(b);
		});
		var x = V(y, 2), S = (e) => {
			q(e, Gs());
		};
		Y(x, (e) => {
			t.view.rows.length || e(S);
		});
		var C = V(x, 2);
		X(C, 21, () => t.view.rows, (e) => e.key, (e, o) => {
			var s = Ys();
			let c;
			var l = z(s), u = z(l), d = z(u), f = (e) => {
				q(e, Ks());
			};
			Y(d, (e) => {
				U(o).kind === "instance" && e(f);
			});
			var p = V(d, 1, !0);
			P(u);
			var m = V(u), h = z(m, !0);
			P(m), P(l);
			var g = V(l, 2), _ = (e) => {
				var t = qs(), n = z(t, !0);
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
				var t = Ws(), n = z(t, !0);
				P(t), H(() => J(n, U(o).issue)), q(e, t);
			};
			Y(C, (e) => {
				U(o).issue && e(w);
			});
			var T = V(C, 2), E = (e) => {
				var t = Js(), n = V(z(t)), r = z(n), i = z(r);
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
				$(s, "data-run-row", U(o).key), $(s, "data-depth", U(o).depth), $(s, "data-status", U(o).status), c = ui(s, "", c, e), $(u, "aria-label", "Open " + U(o).title + " in graph"), u.disabled = !n().jump, J(p, U(o).title), $(m, "data-status", U(o).status), J(h, t), J(b, `Duration: ${r ?? ""}`), J(S, `${U(o).attempts ?? ""} of ${U(o).callBound ?? ""} requests`);
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
		}), P(C), H((e, n) => {
			$(c, "data-status", t.view.status), J(l, e), J(f, `${t.view.completedCount ?? ""} of ${t.view.executableCount ?? ""} stages complete`), J(m, `${t.view.actualCalls ?? ""} of ${t.view.callBound ?? ""} requests`), J(g, `Elapsed: ${n ?? ""}`);
		}, [() => r(t.view.status), () => i(t.view.elapsedMs)]), q(e, o);
	}, l = (e) => {
		q(e, Zs());
	};
	Y(s, (e) => {
		t.view ? e(c) : e(l, -1);
	}), P(o), q(e, o), He();
}
Cr(["click"]);
//#endregion
//#region ui/RunMeter.svelte
var ec = /* @__PURE__ */ K("<span class=\"pc-run-meter-elapsed svelte-1tkcp3\" data-run-elapsed=\"\"> </span>"), tc = /* @__PURE__ */ K("<span class=\"pc-run-pixel svelte-1tkcp3\" data-run-pixel=\"\"></span>"), nc = /* @__PURE__ */ K("<button class=\"pc-run-meter svelte-1tkcp3\"><span class=\"pc-run-meter-label svelte-1tkcp3\"> </span> <!> <span class=\"pc-run-meter-pixels svelte-1tkcp3\" aria-hidden=\"true\"></span></button>");
function rc(e, t) {
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
	var o = Pr(), s = B(o), c = (e) => {
		var r = nc(), o = z(r), s = z(o, !0);
		P(o);
		var c = V(o, 2), l = (e) => {
			var n = ec(), r = z(n);
			P(n), H((e) => J(r, `${e ?? ""}s`), [() => (t.view.elapsedMs / 1e3).toFixed(1)]), q(e, n);
		}, u = /* @__PURE__ */ F(() => t.view.elapsedMs !== null && Number.isFinite(t.view.elapsedMs) && t.view.elapsedMs >= 0);
		Y(c, (e) => {
			U(u) && e(l);
		});
		var d = V(c, 2);
		X(d, 21, () => U(i), (e) => e.key, (e, t) => {
			var n = tc();
			H(() => {
				$(n, "data-status", U(t).status), $(n, "title", U(t).title);
			}), q(e, n);
		}), P(d), P(r), H((e) => {
			$(r, "aria-label", U(a)), $(r, "title", U(a)), r.disabled = !t.open, J(s, e);
		}, [() => n(t.view.status)]), G("click", r, () => t.open?.()), q(e, r);
	};
	Y(s, (e) => {
		t.view && e(c);
	}), q(e, o), He();
}
Cr(["click"]);
//#endregion
//#region ui/PortalManager.svelte
var ic = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-mnv790\">Close</button>"), ac = /* @__PURE__ */ K("<option class=\"svelte-mnv790\"> </option>"), oc = /* @__PURE__ */ K("<label class=\"svelte-mnv790\">Portal name<input aria-label=\"Portal name\" class=\"svelte-mnv790\"/></label> <p class=\"pc-note svelte-mnv790\"> </p> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-rename=\"\" class=\"svelte-mnv790\">Rename</button></div>", 1), sc = /* @__PURE__ */ K("<p class=\"pc-note svelte-mnv790\">Select a portal or create one from an output.</p>"), cc = /* @__PURE__ */ K("<button type=\"button\" data-portal-jump-source=\"\" class=\"svelte-mnv790\">Jump to source</button>"), lc = /* @__PURE__ */ K("<label class=\"pc-check svelte-mnv790\"><input type=\"checkbox\" aria-label=\"Replace existing connection\" class=\"svelte-mnv790\"/>Replace existing connection</label>"), uc = /* @__PURE__ */ K("<button type=\"button\" data-portal-jump-consumer=\"\" class=\"svelte-mnv790\">Jump</button>"), dc = /* @__PURE__ */ K("<div class=\"pc-consumer svelte-mnv790\"><span class=\"svelte-mnv790\"> </span><div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-restore=\"\" class=\"svelte-mnv790\">Restore wire</button> <!></div></div>"), fc = /* @__PURE__ */ K("<p class=\"pc-note svelte-mnv790\">No consumers.</p>"), pc = /* @__PURE__ */ K("<label class=\"svelte-mnv790\">Existing consumers<select aria-label=\"Existing consumers\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Choose before deleting…</option><option class=\"svelte-mnv790\">Restore visible wires</option><option class=\"svelte-mnv790\">Disconnect consumers</option></select></label>"), mc = /* @__PURE__ */ K("<details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Consumers</summary> <label class=\"svelte-mnv790\">Compatible receiver<select aria-label=\"Compatible receiver\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select input…</option><!></select></label> <!> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-connect=\"\" class=\"svelte-mnv790\">Connect receiver</button></div> <!> <!> <!> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-delete=\"\" class=\"svelte-mnv790\">Delete portal</button></div></details>"), hc = /* @__PURE__ */ K("<details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Convert to portal</summary><p class=\"pc-note svelte-mnv790\"> </p><div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-convert=\"\" class=\"svelte-mnv790\"> </button></div></details>"), gc = /* @__PURE__ */ K("<p class=\"pc-error svelte-mnv790\"> </p>"), _c = /* @__PURE__ */ K("<p class=\"pc-error svelte-mnv790\" role=\"alert\"> </p>"), vc = /* @__PURE__ */ K("<p class=\"pc-note svelte-mnv790\" role=\"status\">Preparing change…</p>"), yc = /* @__PURE__ */ K("<p class=\"pc-note svelte-mnv790\"> </p> <label class=\"svelte-mnv790\">Portal<select aria-label=\"Selected portal\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select portal…</option><!></select></label> <!> <details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Source</summary> <label class=\"svelte-mnv790\">Output<select aria-label=\"Portal source\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select output…</option><!></select></label> <label class=\"svelte-mnv790\">New portal name<input aria-label=\"New portal name\" class=\"svelte-mnv790\"/></label> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-create=\"\" class=\"svelte-mnv790\">Create portal</button> <button type=\"button\" data-portal-retarget=\"\" class=\"svelte-mnv790\">Retarget</button> <!></div></details> <!> <!> <!> <!> <!>", 1), bc = /* @__PURE__ */ K("<p class=\"pc-note svelte-mnv790\">Open a graph to manage its portals.</p>"), xc = /* @__PURE__ */ K("<section class=\"pc-manager svelte-mnv790\" aria-label=\"Manage portals\"><header class=\"svelte-mnv790\"><h2 class=\"svelte-mnv790\">Manage portals</h2><!></header> <!></section>");
function Sc(e, t) {
	Ve(t, !0);
	let n = Oi(t, "actions", 19, () => ({})), r = /* @__PURE__ */ L(""), i = /* @__PURE__ */ L(""), a = /* @__PURE__ */ L(""), o = /* @__PURE__ */ L(""), s = /* @__PURE__ */ L(""), c = /* @__PURE__ */ L(!1), l = /* @__PURE__ */ L(""), u = /* @__PURE__ */ L(""), d = "", f = 0, p = !0, m = (e) => JSON.stringify(e.kind === "graph" ? [
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
	bn(() => {
		let e = t.view ? JSON.stringify([
			t.view.managerKey,
			t.view.revision,
			m(t.view.scope),
			t.view.selectedPortalId,
			t.view.renameMode
		]) : "";
		d !== e && (d = e, R(r, U(h)?.label ?? "", !0), R(i, ""), R(a, t.view?.sources.find((e) => e.nodeId === U(h)?.source.nodeId && e.portId === U(h)?.source.portId)?.key ?? "", !0), R(o, ""), R(s, ""), R(c, !1), R(l, ""), R(u, ""), f++);
	}), Ai(() => {
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
	var E = xc(), D = z(E), O = V(z(D)), k = (e) => {
		var t = ic();
		G("click", t, () => n().close?.()), q(e, t);
	};
	Y(O, (e) => {
		n().close && e(k);
	}), P(D);
	var A = V(D, 2), ee = (e) => {
		var d = yc(), f = B(d), p = z(f);
		P(f);
		var m = V(f, 2), E = V(z(m)), D = z(E);
		D.value = D.__value = "", X(V(D), 17, () => t.view.publishers, (e) => e.id, (e, t) => {
			var n = ac(), r = z(n);
			P(n);
			var i = {};
			H(() => {
				J(r, `${U(t).label ?? ""} · ${U(t).kind ?? ""}`), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
			}), q(e, n);
		}), P(E);
		var O;
		fi(E), P(m);
		var k = V(m, 2), A = (e) => {
			var i = oc(), a = B(i), o = V(z(a));
			Z(o), P(a);
			var s = V(a, 2), c = z(s);
			P(s);
			var l = V(s, 2), d = z(l);
			P(l), H(() => {
				Q(o, U(r)), o.disabled = !U(g), J(c, `${t.view.renameMode === "presentation" ? "Local workspace label · not exported" : "Authored portal label"} · ${U(h).kind ?? ""}`), d.disabled = !U(g) || !!U(u);
			}), G("input", o, (e) => {
				R(r, e.currentTarget.value, !0), w();
			}), G("click", d, () => {
				let e = U(h)?.id, i = t.view?.renameMode, a = U(r);
				e && i && n().rename && T("rename", U(g), (t) => n().rename(t, e, a, i));
			}), q(e, i);
		}, ee = (e) => {
			q(e, sc());
		};
		Y(k, (e) => {
			U(h) ? e(A) : e(ee, -1);
		});
		var te = V(k, 2), ne = V(z(te), 2), j = V(z(ne)), re = z(j);
		re.value = re.__value = "", X(V(re), 17, () => t.view.sources, (e) => e.key, (e, t) => {
			var n = ac(), r = z(n);
			P(n);
			var i = {};
			H(() => {
				J(r, `${U(t).label ?? ""} · ${U(t).kind ?? ""}`), i !== (i = U(t).key) && (n.value = (n.__value = U(t).key) ?? "");
			}), q(e, n);
		}), P(j);
		var ie;
		fi(j), P(ne);
		var ae = V(ne, 2), oe = V(z(ae));
		Z(oe), P(ae);
		var se = V(ae, 2), ce = z(se), le = V(ce, 2), ue = V(le, 2), de = (e) => {
			var r = cc();
			G("click", r, () => {
				t.view && U(h) && n().jumpSource?.(x(t.view), S(U(h).source));
			}), q(e, r);
		};
		Y(ue, (e) => {
			U(h) && n().jumpSource && e(de);
		}), P(se), P(te);
		var fe = V(te, 2), pe = (e) => {
			var r = mc(), i = V(z(r), 2), a = V(z(i)), l = z(a);
			l.value = l.__value = "", X(V(l), 17, () => t.view.receivers, (e) => e.key, (e, t) => {
				var n = ac(), r = z(n);
				P(n);
				var i = {};
				H(() => {
					J(r, `${U(t).label ?? ""}${U(t).occupied ? " · Connected" : ""}`), i !== (i = U(t).key) && (n.value = (n.__value = U(t).key) ?? "");
				}), q(e, n);
			}), P(a);
			var d;
			fi(a), P(i);
			var f = V(i, 2), p = (e) => {
				var t = lc(), n = z(t);
				Z(n), Ae(), P(t), H((e) => {
					yi(n, U(c)), n.disabled = e;
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
				var i = dc(), a = z(i), o = z(a, !0);
				P(a);
				var s = V(a), c = z(s), l = V(c, 2), d = (e) => {
					var i = uc();
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
				q(e, fc());
			};
			Y(E, (e) => {
				t.view.consumers.length || e(D);
			});
			var O = V(E, 2), k = (e) => {
				var t = pc(), n = V(z(t)), r = z(n);
				r.value = r.__value = "";
				var i = V(r);
				i.value = i.__value = "restore";
				var a = V(i);
				a.value = a.__value = "disconnect", P(n);
				var o;
				fi(n), P(t), H((e) => {
					n.disabled = e, o !== (o = U(s)) && (n.value = (n.__value = U(s)) ?? "", di(n, U(s)));
				}, [() => !C("remove")]), G("change", n, (e) => {
					R(s, e.currentTarget.value, !0), w();
				}), q(e, t);
			};
			Y(O, (e) => {
				t.view.consumers.length && e(k);
			});
			var A = V(O, 2), ee = z(A);
			P(A), P(r), H((e) => {
				a.disabled = e, d !== (d = U(o)) && (a.value = (a.__value = U(o)) ?? "", di(a, U(o))), g.disabled = !U(y) || !!U(u), ee.disabled = !U(b) || !!U(u);
			}, [() => !C("connect") || !n().connect]), G("change", a, (e) => {
				R(o, e.currentTarget.value, !0), R(c, !1), w();
			}), G("click", g, () => {
				let e = U(v), t = U(h)?.id, r = U(c);
				e && t && n().connect && T("connect", U(y), (i) => n().connect(i, t, S(e), r));
			}), G("click", ee, () => {
				let e = U(h)?.id, r = t.view?.consumers.length ? U(s) : "restore";
				e && (r === "restore" || r === "disconnect") && n().deletePublisher && T("remove", U(b), (t) => n().deletePublisher(t, e, r));
			}), q(e, r);
		};
		Y(fe, (e) => {
			U(h) && e(pe);
		});
		var me = V(fe, 2), he = (e) => {
			var r = hc(), i = V(z(r)), a = z(i, !0);
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
			var n = gc(), r = z(n, !0);
			P(n), H(() => J(r, t.view.issue)), q(e, n);
		};
		Y(ge, (e) => {
			t.view.issue && e(_e);
		});
		var ve = V(ge, 2), ye = (e) => {
			var t = _c(), n = z(t, !0);
			P(t), H(() => J(n, U(l))), q(e, t);
		};
		Y(ve, (e) => {
			U(l) && e(ye);
		});
		var be = V(ve, 2), xe = (e) => {
			q(e, vc());
		};
		Y(be, (e) => {
			U(u) && e(xe);
		}), H((e, r, o, s) => {
			J(p, `${t.view.scopeLabel ?? ""}${t.view.readOnly ? " · Read-only graph" : ""}`), E.disabled = !n().selectPortal, O !== (O = t.view.selectedPortalId ?? "") && (E.value = (E.__value = t.view.selectedPortalId ?? "") ?? "", di(E, t.view.selectedPortalId ?? "")), j.disabled = e, ie !== (ie = U(a)) && (j.value = (j.__value = U(a)) ?? "", di(j, U(a))), Q(oe, U(i)), oe.disabled = r, ce.disabled = o, le.disabled = s;
		}, [
			() => !C("create") && !C("retarget"),
			() => !C("create") || !n().create,
			() => !C("create") || !n().create || !U(_) || !U(i).trim() || !!U(u),
			() => !C("retarget") || !n().retarget || !U(_) || !U(h) || !!U(u)
		]), G("change", E, (e) => {
			let r = e.currentTarget.value;
			e.currentTarget.selectedIndex >= 0 && t.view && n().selectPortal && (!r || t.view.publishers.some((e) => e.id === r)) && n().selectPortal(x(t.view), r || null);
		}), G("change", j, (e) => {
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
	}, te = (e) => {
		q(e, bc());
	};
	Y(A, (e) => {
		t.view ? e(ee) : e(te, -1);
	}), P(E), q(e, E), He();
}
Cr([
	"click",
	"change",
	"input"
]);
//#endregion
//#region ui/SubgraphSave.svelte
var Cc = /* @__PURE__ */ K("<option class=\"svelte-1n658sg\"> </option>"), wc = /* @__PURE__ */ K("<p class=\"pc-save-error svelte-1n658sg\" role=\"alert\"> </p>"), Tc = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay svelte-1n658sg\"><div class=\"pc-workspace-dialog pc-subgraph-save svelte-1n658sg\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Save subgraph\" tabindex=\"-1\"><header class=\"svelte-1n658sg\"><h2 class=\"svelte-1n658sg\">Save subgraph</h2><button type=\"button\" aria-label=\"Close save subgraph\" class=\"svelte-1n658sg\">×</button></header> <form class=\"svelte-1n658sg\"><label class=\"svelte-1n658sg\">Name<input aria-label=\"Subgraph name\" maxlength=\"80\" class=\"svelte-1n658sg\"/></label> <label class=\"svelte-1n658sg\">Save as<select aria-label=\"Save as\" class=\"svelte-1n658sg\"><option class=\"svelte-1n658sg\">Save new subgraph</option><!></select></label> <p class=\"svelte-1n658sg\">Edits stay local until you save. Existing placed copies stay unchanged.</p> <!> <footer class=\"svelte-1n658sg\"><button type=\"button\" class=\"svelte-1n658sg\">Cancel</button><button type=\"submit\" data-save-subgraph=\"\" class=\"svelte-1n658sg\"> </button></footer></form></div></div>");
function Ec(e, t) {
	Ve(t, !0);
	let n, r = /* @__PURE__ */ L(""), i = /* @__PURE__ */ L(""), a = /* @__PURE__ */ L(!1), o = /* @__PURE__ */ L(""), s = "", c = 0;
	bn(() => {
		if (t.view.key === s) return;
		s = t.view.key, c++, R(r, t.view.name, !0), R(i, t.view.targetId ?? "", !0), R(a, !1), R(o, "");
		let e = s;
		dr().then(() => {
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
	var d = Tc(), f = z(d), p = z(f), m = V(z(p));
	P(p);
	var h = V(p, 2), g = z(h), _ = V(z(g));
	Z(_), P(g);
	var v = V(g, 2), y = V(z(v)), b = z(y);
	b.value = b.__value = "", X(V(b), 17, () => t.view.entries, (e) => e.id, (e, t) => {
		var n = Cc(), r = z(n);
		P(n);
		var i = {};
		H(() => {
			J(r, `Update ${U(t).name ?? ""}`), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
		}), q(e, n);
	}), P(y), P(v);
	var x = V(v, 4), S = (e) => {
		var n = wc(), r = z(n, !0);
		P(n), H(() => J(r, t.view.error || U(o))), q(e, n);
	};
	Y(x, (e) => {
		(t.view.error || U(o)) && e(S);
	});
	var C = V(x, 2), w = z(C), T = V(w), E = z(T, !0);
	P(T), P(C), P(h), P(f), Di(f, (e) => n = e, () => n), P(d), H((e) => {
		T.disabled = e, J(E, U(a) ? "Saving…" : "Save");
	}, [() => !t.actions || !U(r).trim() || U(a)]), W("keydown", f, u, !0), W("paste", f, (e) => e.stopPropagation()), G("click", m, () => t.actions?.close()), W("submit", h, l), Ci(_, () => U(r), (e) => R(r, e)), pi(y, () => U(i), (e) => R(i, e)), G("click", w, () => t.actions?.close()), q(e, d), He();
}
Cr(["click"]);
//#endregion
//#region ui/FastConnections.svelte
var Dc = /* @__PURE__ */ K("<option class=\"svelte-1n96rai\"> </option>"), Oc = /* @__PURE__ */ K("<p class=\"pc-fast-key-status svelte-1n96rai\"> </p>"), kc = /* @__PURE__ */ K("<p role=\"alert\" class=\"svelte-1n96rai\"> </p>"), Ac = /* @__PURE__ */ K("<p role=\"status\" class=\"svelte-1n96rai\"> </p>"), jc = /* @__PURE__ */ K("<section class=\"pc-fast-connections svelte-1n96rai\" aria-label=\"Fast connection setup\"><p class=\"svelte-1n96rai\">Configure a typed Jev, Laya or compatible model for Fast Decision. Node settings keep only the connection ID.</p> <label class=\"svelte-1n96rai\">Configured Fast connection<select aria-label=\"Configured Fast connection\" class=\"svelte-1n96rai\"><option class=\"svelte-1n96rai\">New connection</option><!></select></label> <div class=\"pc-fast-fields svelte-1n96rai\"><label class=\"svelte-1n96rai\">Connection ID<input aria-label=\"Connection ID\" maxlength=\"128\" class=\"svelte-1n96rai\"/></label> <label class=\"svelte-1n96rai\">Connection name<input aria-label=\"Connection name\" maxlength=\"256\" class=\"svelte-1n96rai\"/></label> <label class=\"svelte-1n96rai\">Provider<select aria-label=\"Provider\" class=\"svelte-1n96rai\"><option class=\"svelte-1n96rai\">Jev API</option><option class=\"svelte-1n96rai\">Laya</option><option class=\"svelte-1n96rai\">Compatible typed API</option></select></label> <label class=\"svelte-1n96rai\">Typed model<input aria-label=\"Typed model\" maxlength=\"256\" class=\"svelte-1n96rai\"/></label></div> <label class=\"svelte-1n96rai\">Typed endpoint<input aria-label=\"Typed endpoint\" type=\"url\" maxlength=\"2048\" class=\"svelte-1n96rai\"/></label> <small class=\"svelte-1n96rai\"> </small> <label class=\"svelte-1n96rai\">Session API key<input aria-label=\"Session API key\" type=\"password\" autocomplete=\"new-password\" spellcheck=\"false\" maxlength=\"8192\" class=\"svelte-1n96rai\"/></label> <small class=\"svelte-1n96rai\">Keys are session-only. Re-enter them after restarting SillyTavern. Leave this field empty to keep an existing session key.</small> <!> <!> <!> <footer class=\"svelte-1n96rai\"><button type=\"button\" class=\"svelte-1n96rai\"> </button><button type=\"button\" class=\"svelte-1n96rai\">Clear session key</button><button type=\"button\" class=\"svelte-1n96rai\">Remove connection</button><button type=\"button\" class=\"svelte-1n96rai\">Close</button></footer></section>");
function Mc(e, t) {
	Ve(t, !0);
	let n = Oi(t, "actions", 19, () => ({})), r = /* @__PURE__ */ L(""), i = /* @__PURE__ */ L(""), a = /* @__PURE__ */ L(""), o = /* @__PURE__ */ L("jev"), s = /* @__PURE__ */ L(""), c = /* @__PURE__ */ L(""), l = /* @__PURE__ */ L(""), u = /* @__PURE__ */ L(!1), d = /* @__PURE__ */ L(""), f = /* @__PURE__ */ L(""), p = /* @__PURE__ */ L(Qt(mr(() => t.view.userId))), m = 0, h = /* @__PURE__ */ F(() => t.view.connections.find((e) => e.id === U(r)));
	function g() {
		m++, R(p, t.view.userId, !0), v(""), R(f, "The active user changed. Choose a connection for this user.");
	}
	bn(() => {
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
	var C = jc(), w = V(z(C), 2), T = V(z(w)), E = z(T);
	E.value = E.__value = "", X(V(E), 17, () => t.view.connections, (e) => e.id, (e, t) => {
		var n = Dc(), r = z(n);
		P(n);
		var i = {};
		H(() => {
			J(r, `${U(t).label ?? ""} · ${U(t).provider ?? ""} · ${U(t).model ?? ""}`), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
		}), q(e, n);
	}), P(T);
	var D;
	fi(T), P(w);
	var O = V(w, 2), k = z(O), A = V(z(k));
	Z(A), P(k);
	var ee = V(k, 2), te = V(z(ee));
	Z(te), P(ee);
	var ne = V(ee, 2), j = V(z(ne)), re = z(j);
	re.value = re.__value = "jev";
	var ie = V(re);
	ie.value = ie.__value = "laya";
	var ae = V(ie);
	ae.value = ae.__value = "compatible", P(j);
	var oe;
	fi(j), P(ne);
	var se = V(ne, 2), ce = V(z(se));
	Z(ce), P(se), P(O);
	var le = V(O, 2), ue = V(z(le));
	Z(ue), P(le);
	var de = V(le, 2), fe = z(de, !0);
	P(de);
	var pe = V(de, 2), me = V(z(pe));
	Z(me), P(pe);
	var he = V(pe, 4), ge = (e) => {
		var t = Oc(), n = z(t);
		P(t), H(() => J(n, `Session key: ${U(h).credentialReady ? "ready" : "not entered"}`)), q(e, t);
	};
	Y(he, (e) => {
		U(h) && e(ge);
	});
	var _e = V(he, 2), ve = (e) => {
		var n = kc(), r = z(n, !0);
		P(n), H(() => J(r, U(f) || t.view.issue)), q(e, n);
	};
	Y(_e, (e) => {
		(t.view.issue || U(f)) && e(ve);
	});
	var ye = V(_e, 2), be = (e) => {
		var t = Ac(), n = z(t, !0);
		P(t), H(() => J(n, U(d))), q(e, t);
	};
	Y(ye, (e) => {
		U(d) && e(be);
	});
	var xe = V(ye, 2), Se = z(xe), Ce = z(Se, !0);
	P(Se);
	var we = V(Se), Te = V(we), Ee = V(Te);
	P(xe), P(C), H(() => {
		T.disabled = U(u), D !== (D = U(r)) && (T.value = (T.__value = U(r)) ?? "", di(T, U(r))), Q(A, U(i)), A.disabled = U(u) || !!U(r), Q(te, U(a)), te.disabled = U(u), j.disabled = U(u), oe !== (oe = U(o)) && (j.value = (j.__value = U(o)) ?? "", di(j, U(o))), Q(ce, U(s)), ce.disabled = U(u), Q(ue, U(o) === "jev" ? "https://api.typesafe.ai/v1/systemone" : U(c)), ue.readOnly = U(o) === "jev", ue.disabled = U(u), J(fe, U(o) === "jev" ? "Jev uses its fixed SystemOne endpoint and requires a session API key." : "Enter the complete /v1/systemone route using HTTPS or HTTP on localhost. A session key is optional for an unauthenticated local service."), Q(me, U(l)), me.disabled = U(u), Se.disabled = U(u) || !n().save || !!t.view.issue, J(Ce, U(u) ? "Applying…" : "Save connection"), we.disabled = U(u) || !U(h)?.credentialReady || !n().clearCredential, Te.disabled = U(u) || !U(r) || !n().remove;
	}), G("change", T, (e) => v(e.currentTarget.value)), G("input", A, (e) => R(i, e.currentTarget.value, !0)), G("input", te, (e) => R(a, e.currentTarget.value, !0)), G("change", j, (e) => {
		R(o, e.currentTarget.value, !0);
	}), G("input", ce, (e) => R(s, e.currentTarget.value, !0)), G("input", ue, (e) => R(c, e.currentTarget.value, !0)), G("input", me, (e) => R(l, e.currentTarget.value, !0)), G("click", Se, b), G("click", we, S), G("click", Te, x), G("click", Ee, () => {
		R(l, ""), t.close();
	}), q(e, C), He();
}
Cr([
	"change",
	"input",
	"click"
]);
//#endregion
//#region src/workflow/operations/json-data.js?v=0.26.0
function Nc(e) {
	if (typeof e != "object" || !e) return JSON.stringify(e);
	if (Array.isArray(e)) {
		let t = "[";
		for (let n = 0; n < e.length; n++) t += `${n ? "," : ""}${Nc(e[n])}`;
		return `${t}]`;
	}
	let t = "{", n = Object.keys(e);
	for (let r = 0; r < n.length; r++) {
		let i = n[r];
		t += `${r ? "," : ""}${JSON.stringify(i)}:${Nc(e[i])}`;
	}
	return `${t}}`;
}
function Pc(e) {
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
		if (new TextEncoder().encode(Nc(t)).byteLength > 262144) throw Error("JSON byte limit exceeded.");
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
var Fc = (e, t) => ({
	ok: !1,
	error: {
		code: e,
		message: t
	}
}), Ic = (e) => Number.isSafeInteger(e) && e >= 0, Lc = (e, t) => Object.hasOwn(e, t) ? e[t] : void 0, Rc = (e) => typeof e == "object" && !!e && !Array.isArray(e), zc = (e) => typeof e == "string" && e.trim().length > 0 && e.length <= 256, Bc = (e) => Array.isArray(e) && e.every((e) => typeof e == "string" && e.length > 0 && e.length <= 4096);
function Vc(e, t) {
	let n = Hc(e);
	if (!n.ok) return n;
	let r = n.data, i = Pc(t);
	if (!i.ok || !i.data.value || Array.isArray(i.data.value) || typeof i.data.value != "object") return Fc("INVALID_PROPOSAL", "Use a plain duration or destination proposal.");
	let a = i.data.value, o = Lc(a, "kind");
	if (o !== "duration" && o !== "destination") return Fc("UNRESOLVED_TIME", "An explicit duration or destination is required.");
	if (o === "duration" ? !Ic(Lc(a, "minutes")) || Object.hasOwn(a, "absoluteMinute") : !Ic(Lc(a, "absoluteMinute")) || Object.hasOwn(a, "minutes")) return Fc("INVALID_PROPOSAL", "Use one nonnegative safe-integer minute value.");
	let s = [
		"kind",
		"evidence",
		o === "duration" ? "minutes" : "absoluteMinute"
	];
	if (Object.keys(a).some((e) => !s.includes(e))) return Fc("INVALID_PROPOSAL", "Proposal contains ambiguous or unsupported timing fields.");
	let c = o === "destination" ? a.absoluteMinute : r.absoluteMinute + a.minutes;
	if (!Ic(c) || c < r.absoluteMinute) return Fc("INVALID_DESTINATION", "Destination must be a forward safe-integer minute.");
	let l = Wc(Object.hasOwn(a, "evidence") ? a.evidence : { kind: "explicit" });
	if (!l.ok) return l;
	let u = l.data, d = u.kind, f = structuredClone(r), p = structuredClone(u);
	return o === "duration" && r.timeEvidence?.kind === "estimate" && (p = d === "estimate" ? {
		...p,
		lineage: [.../* @__PURE__ */ new Set([...r.timeEvidence.lineage ?? [r.timeEvidence.origin], ...u.lineage ?? [u.origin]])]
	} : structuredClone(r.timeEvidence), p.lineage?.length > 64) ? Fc("EVIDENCE_LIMIT", "Estimate provenance exceeds 64 sources; hold the entire time projection.") : Uc({
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
function Hc(e) {
	let t = Pc(e);
	if (!t.ok || !t.data.value || typeof t.data.value != "object" || Array.isArray(t.data.value)) return Fc("INVALID_CLOCK", "Clock must contain bounded own plain data.");
	let n = t.data.value;
	if (!zc(Lc(n, "clockId")) || !zc(Lc(n, "calendarId")) || !Ic(Lc(n, "absoluteMinute")) || !Ic(Lc(n, "dayLengthMinutes")) || n.dayLengthMinutes === 0) return Fc("INVALID_CLOCK", "Clock requires identities and safe-integer minute/calendar values.");
	if (Object.hasOwn(n, "schemaVersion") && n.schemaVersion !== 1) return Fc("INVALID_CLOCK", "Clock schema version must be 1.");
	if (Object.hasOwn(n, "revision") && (!Ic(n.revision) || n.revision < 1)) return Fc("INVALID_CLOCK", "Clock revision must be a positive safe integer.");
	if (Object.hasOwn(n, "timeEvidence") && !Wc(n.timeEvidence).ok) return Fc("INVALID_CLOCK", "Clock time evidence must retain accepted provenance.");
	if (Object.hasOwn(n, "settledTimeEventIds") && !Bc(n.settledTimeEventIds)) return Fc("INVALID_CLOCK", "Settled occurrence IDs must be a bounded string array.");
	for (let [e, t] of [
		["unit", "minute"],
		["originMinute", 0],
		["originDay", 1]
	]) if (Object.hasOwn(n, e) && n[e] !== t) return Fc("INVALID_CALENDAR", "This calendar uses minute units with minute zero at Day 1.");
	return {
		ok: !0,
		data: n
	};
}
function Uc(e) {
	let t = Pc(e);
	return t.ok ? {
		ok: !0,
		data: t.data.value
	} : Fc("OUTPUT_LIMIT", "Projection exceeds the bounded plain-data DTO budget.");
}
function Wc(e) {
	if (!Rc(e)) return Fc("INVALID_EVIDENCE", "Evidence must be a plain record.");
	let t = Lc(e, "kind");
	if (![
		"explicit",
		"authored-rule",
		"validated-extraction",
		"estimate",
		"vague"
	].includes(t)) return Fc("INVALID_EVIDENCE", "Use a supported time evidence kind.");
	let n = t === "estimate" ? [
		"kind",
		"origin",
		"acceptancePolicy",
		"lineage"
	] : ["kind", "origin"];
	if (Object.keys(e).some((e) => !n.includes(e))) return Fc("INVALID_EVIDENCE", "Evidence contains unsupported or contradictory fields.");
	let r = typeof Lc(e, "origin") == "string" && e.origin.trim().length > 0;
	if (Object.hasOwn(e, "origin") && !r) return Fc("INVALID_EVIDENCE", "Evidence origin must be nonempty text.");
	if (t === "estimate" && Object.hasOwn(e, "acceptancePolicy") && !["accept", "unresolved"].includes(e.acceptancePolicy)) return Fc("INVALID_EVIDENCE", "Estimate acceptance policy must be accept or unresolved.");
	if (Object.hasOwn(e, "lineage")) {
		let t = e.lineage;
		if (!Array.isArray(t) || t.length === 0 || !t.every((e) => typeof e == "string" && e.trim().length > 0) || new Set(t).size !== t.length || !t.includes(e.origin)) return Fc("INVALID_EVIDENCE", "Estimate lineage must contain distinct nonempty text origins including the current origin.");
		if (t.length > 64) return Fc("EVIDENCE_LIMIT", "Estimate provenance exceeds 64 sources; hold the entire time projection.");
	}
	return t === "vague" || t === "estimate" && (!r || Lc(e, "acceptancePolicy") !== "accept") ? Fc("UNRESOLVED_TIME", "Estimated or vague time needs an explicit accepted authored rule.") : ["authored-rule", "validated-extraction"].includes(t) && !r ? Fc("INVALID_EVIDENCE", "Rule and extraction evidence must identify their origin.") : {
		ok: !0,
		data: e
	};
}
new TextEncoder();
//#endregion
//#region src/ui/story-document-setup.js
var Gc = (e, t) => ({
	ok: !1,
	error: {
		code: e,
		message: t
	}
});
function Kc(e, t, n = 0) {
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
	return Vc(r, {
		kind: "duration",
		minutes: 0
	}).ok ? {
		ok: !0,
		data: { text: JSON.stringify(r, null, 2) }
	} : Gc("INVALID_CLOCK_TEMPLATE", "Choose explicit clock/calendar IDs and a nonnegative whole story minute.");
}
//#endregion
//#region ui/StoryDocuments.svelte
var qc = /* @__PURE__ */ K("<p role=\"alert\" class=\"svelte-1t33cem\"> </p>"), Jc = /* @__PURE__ */ K("<option class=\"svelte-1t33cem\"> </option>"), Yc = /* @__PURE__ */ K("<label class=\"svelte-1t33cem\">Actor ID<input aria-label=\"Actor ID\" maxlength=\"128\" class=\"svelte-1t33cem\"/></label>"), Xc = /* @__PURE__ */ K("<label class=\"svelte-1t33cem\">CSV columns, comma separated<input aria-label=\"CSV columns\" class=\"svelte-1t33cem\"/></label>"), Zc = /* @__PURE__ */ K("<details class=\"svelte-1t33cem\"><summary class=\"svelte-1t33cem\">Story clock template</summary><label class=\"svelte-1t33cem\">Calendar ID<input aria-label=\"Calendar ID\" class=\"svelte-1t33cem\"/></label><label class=\"svelte-1t33cem\">Starting story minute<input aria-label=\"Starting story minute\" type=\"number\" min=\"0\" step=\"1\" class=\"svelte-1t33cem\"/></label><button type=\"button\" class=\"svelte-1t33cem\">Use story clock template</button><p class=\"svelte-1t33cem\">Midnight on the first day is minute 0. The clock advances through graph events, using explicit story time.</p></details>"), Qc = /* @__PURE__ */ K("<p role=\"status\" class=\"svelte-1t33cem\"> </p>"), $c = /* @__PURE__ */ K("<div class=\"pc-story-documents svelte-1t33cem\"><p class=\"svelte-1t33cem\"> </p> <p class=\"svelte-1t33cem\">Manage the documents used by your workflows here. Updating an authorization or its initial template leaves existing canonical document content intact. Read File and Write File use these target IDs.</p> <!> <label class=\"svelte-1t33cem\">Workflow data document<select aria-label=\"Workflow data document\" class=\"svelte-1t33cem\"><option class=\"svelte-1t33cem\">New document authorization</option><!></select></label> <div class=\"pc-document-actions svelte-1t33cem\"><button type=\"button\" class=\"svelte-1t33cem\">Load initial template</button><button type=\"button\" class=\"svelte-1t33cem\">Remove authorization</button><button type=\"button\" class=\"svelte-1t33cem\">Refresh scope</button></div> <form class=\"svelte-1t33cem\"><label class=\"svelte-1t33cem\">Logical target ID<input aria-label=\"Logical target ID\" maxlength=\"128\" placeholder=\"souls.json\" class=\"svelte-1t33cem\"/></label> <label class=\"svelte-1t33cem\">Document name<input aria-label=\"Document name\" maxlength=\"256\" class=\"svelte-1t33cem\"/></label> <label class=\"svelte-1t33cem\">Format<select aria-label=\"Document format\" class=\"svelte-1t33cem\"><option class=\"svelte-1t33cem\">JSON</option><option class=\"svelte-1t33cem\">JSON Lines</option><option class=\"svelte-1t33cem\">CSV</option><option class=\"svelte-1t33cem\">Plain text</option><option class=\"svelte-1t33cem\">Markdown</option></select></label> <label class=\"svelte-1t33cem\">Visibility<select aria-label=\"Document visibility\" class=\"svelte-1t33cem\"><option class=\"svelte-1t33cem\">Public</option><option class=\"svelte-1t33cem\">Hidden</option><option class=\"svelte-1t33cem\">Actor private</option></select></label> <!> <!> <!> <label class=\"svelte-1t33cem\">Initial template<textarea aria-label=\"Initial template\" rows=\"7\" maxlength=\"100000\" class=\"svelte-1t33cem\"></textarea></label> <p class=\"svelte-1t33cem\">JSON templates preserve your chosen object or list structure. CSV uses the named columns. Existing authorizations require explicit template loading before editing.</p> <!><!> <footer class=\"svelte-1t33cem\"><button type=\"button\" class=\"svelte-1t33cem\">Close</button><button type=\"submit\" class=\"svelte-1t33cem\"> </button></footer></form></div>");
function el(e, t) {
	Ve(t, !0);
	let n = /* @__PURE__ */ L(""), r = /* @__PURE__ */ L(""), i = /* @__PURE__ */ L(""), a = /* @__PURE__ */ L("json"), o = /* @__PURE__ */ L(""), s = /* @__PURE__ */ L("public"), c = /* @__PURE__ */ L(""), l = /* @__PURE__ */ L(""), u = /* @__PURE__ */ L(!1), d = /* @__PURE__ */ L(""), f = /* @__PURE__ */ L(""), p = /* @__PURE__ */ L(!1), m = /* @__PURE__ */ L("story-calendar"), h = /* @__PURE__ */ L(0), g = "", _ = 0;
	function v() {
		R(r, ""), R(i, ""), R(a, "json"), R(o, ""), R(s, "public"), R(c, ""), R(l, ""), R(p, !1), R(d, ""), R(f, "");
	}
	bn(() => {
		t.view.key !== g && (g = t.view.key, _++, R(u, !1), R(n, ""), v());
	});
	function y() {
		_++, R(u, !1), v();
		let e = t.view.documents.find((e) => e.targetId === U(n));
		e && (R(r, e.targetId, !0), R(i, e.name, !0), R(a, e.format, !0), R(s, e.visibility.kind, !0), R(c, e.visibility.kind === "actor-private" ? e.visibility.actorId : "", !0), R(l, e.columns?.join(", ") ?? "", !0));
	}
	function b() {
		let e = Kc(U(r), U(m), U(h));
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
	var S = $c(), C = z(S), w = z(C);
	P(C);
	var T = V(C, 4), E = (e) => {
		var n = qc(), r = z(n, !0);
		P(n), H(() => J(r, t.view.issue)), q(e, n);
	};
	Y(T, (e) => {
		t.view.issue && e(E);
	});
	var D = V(T, 2), O = V(z(D)), k = z(O);
	k.value = k.__value = "", X(V(k), 17, () => t.view.documents, (e) => e.targetId, (e, t) => {
		var n = Jc(), r = z(n);
		P(n);
		var i = {};
		H(() => {
			J(r, `${U(t).name ?? ""} (${U(t).targetId ?? ""}, ${U(t).format ?? ""}, ${U(t).visibility.kind ?? ""})`), i !== (i = U(t).targetId) && (n.value = (n.__value = U(t).targetId) ?? "");
		}), q(e, n);
	}), P(O), P(D);
	var A = V(D, 2), ee = z(A), te = V(ee), ne = V(te);
	P(A);
	var j = V(A, 2), re = z(j), ie = V(z(re));
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
		var t = Yc(), n = V(z(t));
		Z(n), P(t), H(() => n.disabled = U(u)), Ci(n, () => U(c), (e) => R(c, e)), q(e, t);
	};
	Y(ye, (e) => {
		U(s) === "actor-private" && e(be);
	});
	var xe = V(ye, 2), Se = (e) => {
		var t = Xc(), n = V(z(t));
		Z(n), P(t), H(() => n.disabled = U(u)), Ci(n, () => U(l), (e) => R(l, e)), q(e, t);
	};
	Y(xe, (e) => {
		U(a) === "csv" && e(Se);
	});
	var Ce = V(xe, 2), we = (e) => {
		var t = Zc(), i = V(z(t)), a = V(z(i));
		Z(a), P(i);
		var o = V(i), s = V(z(o));
		Z(s), P(o);
		var c = V(o);
		Ae(), P(t), H((e) => {
			a.disabled = U(u), s.disabled = U(u), c.disabled = e;
		}, [() => !U(r).trim() || U(u) || !!U(n) && !U(p)]), Ci(a, () => U(m), (e) => R(m, e)), Ci(s, () => U(h), (e) => R(h, e)), G("click", c, b), q(e, t);
	};
	Y(Ce, (e) => {
		U(a) === "json" && e(we);
	});
	var Te = V(Ce, 2), Ee = V(z(Te));
	rt(Ee), P(Te);
	var M = V(Te, 4), De = (e) => {
		var t = qc(), n = z(t, !0);
		P(t), H(() => J(n, U(d))), q(e, t);
	};
	Y(M, (e) => {
		U(d) && e(De);
	});
	var N = V(M), Oe = (e) => {
		var n = Qc(), r = z(n, !0);
		P(n), H(() => J(r, U(f) || t.view.notice)), q(e, n);
	};
	Y(N, (e) => {
		(U(f) || t.view.notice) && e(Oe);
	});
	var ke = V(N, 2), je = z(ke), Me = V(je), Ne = z(Me, !0);
	P(Me), P(ke), P(j), P(S), H((e) => {
		J(w, `Active user: ${(t.view.scope.userId || "Unavailable") ?? ""} · Chat: ${(t.view.scope.chatId || "Unavailable") ?? ""}`), O.disabled = U(u), ee.disabled = !U(n) || U(u), te.disabled = !U(n) || U(u), ne.disabled = U(u), ie.disabled = !!U(n) || U(u), oe.disabled = U(u), ce.disabled = !!U(n) || U(u), he.disabled = U(u), Ee.disabled = U(u) || !!U(n) && !U(p), $(Ee, "placeholder", U(a) === "json" ? "[]" : ""), Me.disabled = e, J(Ne, U(u) ? "Saving…" : "Save authorization");
	}, [() => !t.actions || !t.view.key || !U(r).trim() || !U(i).trim() || U(u) || !!U(n) && !U(p) || U(s) === "actor-private" && !U(c).trim()]), G("change", O, y), pi(O, () => U(n), (e) => R(n, e)), G("click", ee, () => x("load")), G("click", te, () => x("remove")), G("click", ne, () => t.actions?.refresh()), W("submit", j, (e) => {
		e.preventDefault(), x("save");
	}), Ci(ie, () => U(r), (e) => R(r, e)), Ci(oe, () => U(i), (e) => R(i, e)), pi(ce, () => U(a), (e) => R(a, e)), pi(he, () => U(s), (e) => R(s, e)), Ci(Ee, () => U(o), (e) => R(o, e)), G("click", je, function(...e) {
		t.close?.apply(this, e);
	}), q(e, S), He();
}
Cr(["change", "click"]);
//#endregion
//#region ui/RecallArms.svelte
var tl = /* @__PURE__ */ K("<p class=\"svelte-34wc6n\"> </p>"), nl = /* @__PURE__ */ K("<p role=\"alert\" class=\"svelte-34wc6n\"> </p>"), rl = /* @__PURE__ */ K("<p class=\"svelte-34wc6n\">Add a Hotkey Arm node to the assigned unified workflow for the active character, then enable Lattice. Configure the actor, memory set, target and use policy in Details.</p>"), il = /* @__PURE__ */ K("<fieldset class=\"svelte-34wc6n\"><legend> </legend> <p class=\"svelte-34wc6n\"> </p> <p class=\"svelte-34wc6n\"> </p> <button type=\"button\"> </button></fieldset>"), al = /* @__PURE__ */ K("<header class=\"svelte-34wc6n\"><h2>Recall arms</h2><button type=\"button\">Close</button></header> <p class=\"svelte-34wc6n\">Arm a memory set for the next reply, generated swipe, or both. Automatic Recall triggers use the workflow’s own conditions.</p> <!> <!> <!> <!> <p class=\"svelte-34wc6n\"><button type=\"button\">Refresh recall state</button></p> <small class=\"svelte-34wc6n\">Shortcuts use physical keys and do not fire while typing in inputs. Duplicate active shortcuts require a different key. Editing the graph or switching scope revokes old shortcuts.</small>", 1);
function ol(e, t) {
	Ve(t, !0);
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
	var o = al(), s = B(o), c = V(z(s));
	P(s);
	var l = V(s, 4), u = (e) => {
		var n = tl(), r = z(n);
		P(n), H(() => J(r, `User ${t.view.scope.userId ?? ""} · Chat ${t.view.scope.chatId ?? ""} · Actor ${t.view.scope.actorId ?? ""}`)), q(e, n);
	};
	Y(l, (e) => {
		t.view.scope && e(u);
	});
	var d = V(l, 2), f = (e) => {
		var n = nl(), i = z(n, !0);
		P(n), H(() => J(i, U(r) || t.view.issue)), q(e, n);
	};
	Y(d, (e) => {
		(t.view.issue || U(r)) && e(f);
	});
	var p = V(d, 2), m = (e) => {
		q(e, rl());
	};
	Y(p, (e) => {
		t.view.nodes.length || e(m);
	});
	var h = V(p, 2);
	X(h, 17, () => t.view.nodes, (e) => e.nodeId, (e, r) => {
		var o = il(), s = z(o), c = z(s);
		P(s);
		var l = V(s, 2), u = z(l);
		P(l);
		var d = V(l, 2), f = z(d);
		P(d);
		var p = V(d, 2), m = z(p, !0);
		P(p), P(o), H((e) => {
			J(c, `${U(r).memorySetId ?? ""} · ${U(r).armed ? "Armed" : "Disarmed"}`), J(u, `${e ?? ""} · ${U(r).target ?? ""} · ${U(r).uses ?? ""} · consume on ${U(r).consumeOn ?? ""}`), J(f, `Remaining: ${U(r).remaining.reply ? "reply " : ""}${U(r).remaining.swipe ? "swipe" : ""}${!U(r).remaining.reply && !U(r).remaining.swipe ? "none" : ""}. Pending generations: ${U(r).pendingCount ?? ""}.`), $(p, "aria-label", (U(r).armed ? "Disarm " : "Arm ") + U(r).memorySetId), p.disabled = !!U(n) || !t.actions, J(m, U(n) === U(r).nodeId ? "Updating…" : U(r).armed ? "Disarm" : "Arm");
		}, [() => i(U(r).hotkey)]), G("click", p, () => a(U(r).nodeId, U(r).armed)), q(e, o);
	});
	var g = V(h, 2), _ = z(g);
	P(g), Ae(2), H(() => _.disabled = !!U(n) || !t.actions), G("click", c, function(...e) {
		t.close?.apply(this, e);
	}), G("click", _, () => t.actions?.refresh()), q(e, o), He();
}
Cr(["click"]);
//#endregion
//#region ui/ConfigureNode.svelte
var sl = /* @__PURE__ */ K("<option class=\"svelte-1srbsqt\"> </option>"), cl = /* @__PURE__ */ K("<p class=\"svelte-1srbsqt\">Authorize a document in Tools › Workflow Data, then reopen node creation.</p>"), ll = /* @__PURE__ */ K("<label class=\"svelte-1srbsqt\">Workflow data document<select aria-label=\"Workflow data document\" class=\"svelte-1srbsqt\"><option class=\"svelte-1srbsqt\">Choose an authorized target</option><!></select></label><!>", 1), ul = /* @__PURE__ */ K("<label class=\"svelte-1srbsqt\">Pinned Data helper<select aria-label=\"Pinned Data helper\" class=\"svelte-1srbsqt\"><option class=\"svelte-1srbsqt\">Choose an existing item/result helper</option><!></select></label><p class=\"svelte-1srbsqt\">Helpers use exact pinned versions with Data item and result ports. Set iteration mode and requestBoundPerIteration in the controls below.</p>", 1), dl = /* @__PURE__ */ K("<p role=\"alert\" class=\"svelte-1srbsqt\"> </p>"), fl = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay svelte-1srbsqt\"><div class=\"pc-workspace-dialog pc-configure-node svelte-1srbsqt\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Configure node\" tabindex=\"-1\"><header class=\"svelte-1srbsqt\"><h2 class=\"svelte-1srbsqt\"> </h2><button type=\"button\" aria-label=\"Close node configuration\" class=\"svelte-1srbsqt\">×</button></header> <p class=\"svelte-1srbsqt\">Complete the required settings before creating the node. Cancel leaves the graph unchanged.</p> <form class=\"svelte-1srbsqt\"><label class=\"svelte-1srbsqt\">Stage<select aria-label=\"Node stage\" class=\"svelte-1srbsqt\"><option class=\"svelte-1srbsqt\">Preparation</option><option class=\"svelte-1srbsqt\">Response</option></select></label> <!> <!> <label class=\"svelte-1srbsqt\">Declared node controls<textarea aria-label=\"Node controls JSON\" rows=\"14\" maxlength=\"200000\" class=\"svelte-1srbsqt\"></textarea></label> <!> <footer class=\"svelte-1srbsqt\"><button type=\"button\" class=\"svelte-1srbsqt\">Cancel</button><button type=\"submit\" class=\"svelte-1srbsqt\"> </button></footer></form></div></div>");
function pl(e, t) {
	Ve(t, !0);
	let n, r = /* @__PURE__ */ L(""), i = /* @__PURE__ */ L("pre"), a = /* @__PURE__ */ L(""), o = /* @__PURE__ */ L(""), s = /* @__PURE__ */ L(!1), c = /* @__PURE__ */ L(""), l = "", u = 0, d = /* @__PURE__ */ F(() => t.view.operation === "read-file" || t.view.operation === "story-clock" || t.view.operation === "commit-outcomes");
	bn(() => {
		if (t.view.key === l) return;
		l = t.view.key, u++, R(r, t.view.controls, !0), R(i, t.view.phase, !0), R(s, !1), R(c, "");
		try {
			let e = JSON.parse(U(r));
			R(a, e.targetId ?? e.clockId ?? "", !0), R(o, t.view.helpers.find((t) => JSON.stringify(t.ref) === JSON.stringify(e.helper))?.key ?? "", !0);
		} catch {
			R(a, ""), R(o, "");
		}
		let e = l;
		dr().then(() => {
			t.view.key === e && n?.querySelector("select,textarea,input")?.focus({ preventScroll: !0 });
		});
	}), ki(() => {
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
	var h = fl(), g = z(h), _ = z(g), v = z(_), y = z(v);
	P(v);
	var b = V(v);
	P(_);
	var x = V(_, 4), S = z(x), C = V(z(S)), w = z(C);
	w.value = w.__value = "pre";
	var T = V(w);
	T.value = T.__value = "post", P(C), P(S);
	var E = V(S, 2), D = (e) => {
		var n = ll(), r = B(n), i = V(z(r)), o = z(i);
		o.value = o.__value = "", X(V(o), 17, () => t.view.targets.filter((e) => !["story-clock", "commit-outcomes"].includes(t.view.operation) || e.format === "json"), (e) => e.targetId, (e, t) => {
			var n = sl(), r = z(n);
			P(n);
			var i = {};
			H(() => {
				J(r, `${U(t).name ?? ""} (${U(t).targetId ?? ""})`), i !== (i = U(t).targetId) && (n.value = (n.__value = U(t).targetId) ?? "");
			}), q(e, n);
		}), P(i), P(r);
		var c = V(r), l = (e) => {
			q(e, cl());
		};
		Y(c, (e) => {
			t.view.targets.length || e(l);
		}), H(() => i.disabled = U(s)), G("change", i, () => f(t.view.operation === "story-clock" ? "clockId" : "targetId", U(a))), pi(i, () => U(a), (e) => R(a, e)), q(e, n);
	};
	Y(E, (e) => {
		U(d) && e(D);
	});
	var O = V(E, 2), k = (e) => {
		var n = ul(), r = B(n), i = V(z(r)), a = z(i);
		a.value = a.__value = "", X(V(a), 17, () => t.view.helpers, (e) => e.key, (e, t) => {
			var n = sl(), r = z(n);
			P(n);
			var i = {};
			H(() => {
				J(r, `${U(t).label ?? ""}${U(t).stateful ? " (projected state)" : ""}`), i !== (i = U(t).key) && (n.value = (n.__value = U(t).key) ?? "");
			}), q(e, n);
		}), P(i), P(r), Ae(), H(() => i.disabled = U(s)), G("change", i, () => {
			let e = t.view.helpers.find((e) => e.key === U(o));
			e && f("helper", e.ref);
		}), pi(i, () => U(o), (e) => R(o, e)), q(e, n);
	};
	Y(O, (e) => {
		t.view.operation === "for-each" && e(k);
	});
	var A = V(O, 2), ee = V(z(A));
	rt(ee), P(A);
	var te = V(A, 2), ne = (e) => {
		var t = dl(), n = z(t, !0);
		P(t), H(() => J(n, U(c))), q(e, t);
	};
	Y(te, (e) => {
		U(c) && e(ne);
	});
	var j = V(te, 2), re = z(j), ie = V(re), ae = z(ie, !0);
	P(ie), P(j), P(x), P(g), Di(g, (e) => n = e, () => n), P(h), H(() => {
		J(y, `Configure ${t.view.title ?? ""}`), C.disabled = t.view.phaseLocked || U(s), ee.disabled = U(s), ie.disabled = !t.actions || U(s), J(ae, U(s) ? "Preparing…" : "Create node");
	}), W("keydown", g, m, !0), W("paste", g, (e) => e.stopPropagation()), G("click", b, () => t.actions?.cancel(t.view.key)), W("submit", x, p), pi(C, () => U(i), (e) => R(i, e)), Ci(ee, () => U(r), (e) => R(r, e)), G("click", re, () => t.actions?.cancel(t.view.key)), q(e, h), He();
}
Cr(["click", "change"]);
//#endregion
//#region ui/NewWorkflowPrompt.svelte
var ml = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay\"><div class=\"pc-workspace-dialog pc-new-workflow-prompt svelte-121ekho\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Save workflow changes?\" tabindex=\"-1\"><h2 class=\"svelte-121ekho\">Save workflow changes?</h2> <p class=\"svelte-121ekho\"><strong class=\"svelte-121ekho\"> </strong> has unsaved changes.</p> <p class=\"svelte-121ekho\">Save downloads workflow JSON before opening a new workflow. Your existing workflow stays in the workspace.</p> <label class=\"svelte-121ekho\">New workflow type<select aria-label=\"New workflow type\" class=\"svelte-121ekho\"><option>Unified workflow</option><option>Legacy pre workflow</option><option>Legacy post workflow</option></select></label> <footer class=\"svelte-121ekho\"><button type=\"button\" class=\"svelte-121ekho\">Save</button><button type=\"button\" class=\"svelte-121ekho\">Discard</button><button type=\"button\" class=\"svelte-121ekho\">Cancel</button></footer></div></div>");
function hl(e, t) {
	Ve(t, !0);
	let n = /* @__PURE__ */ L(Qt(mr(() => t.view.phase ?? "unified"))), r, i;
	ki(() => {
		let e = document.activeElement;
		return i.focus({ preventScroll: !0 }), () => e?.focus({ preventScroll: !0 });
	});
	function a(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), t.actions?.choose("cancel", U(n))), e.key === "Tab") {
			let t = [...r.querySelectorAll("button:not(:disabled), select:not(:disabled)")], n = t.indexOf(document.activeElement);
			e.shiftKey && n <= 0 && (e.preventDefault(), t.at(-1)?.focus()), !e.shiftKey && (n < 0 || n === t.length - 1) && (e.preventDefault(), t[0]?.focus());
		}
	}
	var o = ml(), s = z(o), c = V(z(s), 2), l = z(c), u = z(l, !0);
	P(l), Ae(), P(c);
	var d = V(c, 4), f = V(z(d)), p = z(f);
	p.value = p.__value = "unified";
	var m = V(p);
	m.value = m.__value = "pre";
	var h = V(m);
	h.value = h.__value = "post", P(f);
	var g;
	fi(f), P(d);
	var _ = V(d, 2), v = z(_), y = V(v), b = V(y);
	Di(b, (e) => i = e, () => i), P(_), P(s), Di(s, (e) => r = e, () => r), P(o), H(() => {
		J(u, t.view.name), g !== (g = U(n)) && (f.value = (f.__value = U(n)) ?? "", di(f, U(n)));
	}), W("keydown", s, a, !0), W("paste", s, (e) => e.stopPropagation(), !0), G("change", f, (e) => R(n, e.currentTarget.value, !0)), G("click", v, () => t.actions?.choose("save", U(n))), G("click", y, () => t.actions?.choose("discard", U(n))), G("click", b, () => t.actions?.choose("cancel", U(n))), q(e, o), He();
}
Cr(["change", "click"]);
//#endregion
//#region ui/NodeSearch.svelte
var gl = /* @__PURE__ */ K("<label class=\"pc-context-check svelte-golf61\"><input type=\"checkbox\" class=\"svelte-golf61\"/>Context sensitive</label>"), _l = /* @__PURE__ */ K("<span class=\"pc-search-context svelte-golf61\"> </span>"), vl = /* @__PURE__ */ K("<label class=\"pc-search-field svelte-golf61\"><input type=\"search\" aria-label=\"Search nodes and subgraphs\" placeholder=\"Search…\" autocomplete=\"off\" role=\"combobox\" aria-expanded=\"true\" class=\"svelte-golf61\"/></label> <!> <!>", 1), yl = /* @__PURE__ */ K("<p class=\"pc-search-context svelte-golf61\">Choose the named port to connect.</p>"), bl = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-search-result svelte-golf61\" role=\"option\"><span class=\"svelte-golf61\"> </span> <span class=\"pc-family svelte-golf61\"> </span></button>"), xl = /* @__PURE__ */ K("<p class=\"pc-empty svelte-golf61\">No nodes match.</p>"), Sl = /* @__PURE__ */ K("<p class=\"pc-feedback svelte-golf61\" role=\"status\"> </p>"), Cl = /* @__PURE__ */ K("<div class=\"pc-node-search svelte-golf61\" role=\"dialog\" aria-modal=\"false\" tabindex=\"-1\"><!> <div class=\"pc-search-results svelte-golf61\" role=\"listbox\"></div> <!></div>");
function wl(e, t) {
	let n = Fr();
	Ve(t, !0);
	let r = Oi(t, "view", 3, null), i = Oi(t, "actions", 19, () => ({})), a = /* @__PURE__ */ L(void 0), o = /* @__PURE__ */ L(void 0), s = /* @__PURE__ */ L(""), c = /* @__PURE__ */ L(0), l = /* @__PURE__ */ L(8), u = /* @__PURE__ */ L(8), d, f, p = (e) => [
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
	bn(() => {
		let e = r()?.key, t = r()?.mode, n = r()?.screenAnchor;
		if (e === void 0 || !n) return;
		let i = d !== e || f !== t;
		d !== e && R(s, ""), i && R(c, 0), d = e, f = t, dr().then(() => {
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
	bn(() => {
		if (!r()) return;
		let e = (e) => {
			U(a) && !U(a).contains(e.target) && i().dismiss?.();
		};
		return window.addEventListener("pointerdown", e, !0), () => window.removeEventListener("pointerdown", e, !0);
	});
	var T = Pr();
	W("resize", tn, x);
	var E = B(T), D = (e) => {
		var t = Cl();
		let i;
		var d = z(t), f = (e) => {
			var t = vl(), i = B(t), a = z(i);
			Z(a), Di(a, (e) => R(o, e), () => U(o)), P(i);
			var l = V(i, 2), u = (e) => {
				var t = gl(), n = z(t);
				Z(n), Ae(), P(t), H(() => {
					yi(n, r().contextSensitive), n.disabled = r().readOnly;
				}), G("change", n, C), q(e, t);
			};
			Y(l, (e) => {
				r().origin && e(u);
			});
			var d = V(l, 2), f = (e) => {
				var t = _l(), n = z(t, !0);
				P(t), H(() => J(n, (r().origin.dir === "out" ? "Accepts " : "Produces ") + r().origin.kind)), q(e, t);
			};
			Y(d, (e) => {
				r().origin && e(f);
			}), H((e) => {
				$(a, "aria-controls", n + "-results"), $(a, "aria-activedescendant", e);
			}, [() => U(y) ? n + "-item-" + U(h).indexOf(U(y)) : void 0]), G("input", a, () => R(c, 0)), Ci(a, () => U(s), (e) => R(s, e)), q(e, t);
		}, p = (e) => {
			q(e, yl());
		};
		Y(d, (e) => {
			r().mode === "nodes" ? e(f) : e(p, -1);
		});
		var m = V(d, 2);
		X(m, 21, () => U(h), (e) => g(e), (e, t) => {
			var r = bl(), i = z(r), a = z(i, !0);
			P(i);
			var o = V(i, 1, !0);
			o.nodeValue = " ";
			var s = V(o);
			let l;
			var u = z(s, !0);
			P(s), P(r), H((e, n, i, o) => {
				$(r, "aria-selected", U(y) === U(t)), $(r, "id", e), $(r, "data-choice", "id" in U(t) ? U(t).id : void 0), $(r, "data-port", "portId" in U(t) ? U(t).portId : void 0), r.disabled = n, $(r, "title", "disabledReason" in U(t) ? U(t).disabledReason : void 0), J(a, i), l = ui(s, "", l, o), J(u, "family" in U(t) ? U(t).family : U(t).kind);
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
			q(e, xl());
		}), P(m);
		var x = V(m, 2), T = (e) => {
			var t = Sl(), n = z(t, !0);
			P(t), H(() => J(n, r().feedback)), q(e, t);
		};
		Y(x, (e) => {
			r().feedback && e(T);
		}), P(t), Di(t, (e) => R(a, e), () => U(a)), H(() => {
			$(t, "aria-label", r().mode === "ports" ? "Choose connection port" : "Add node"), i = ui(t, "", i, {
				left: `${U(l) ?? ""}px`,
				top: `${U(u) ?? ""}px`
			}), $(m, "id", n + "-results"), $(m, "aria-label", r().mode === "ports" ? "Compatible ports" : "Nodes and subgraphs");
		}), G("keydown", t, w), q(e, t);
	};
	Y(E, (e) => {
		r() && e(D);
	}), q(e, T), He();
}
Cr([
	"keydown",
	"input",
	"change",
	"click"
]);
//#endregion
//#region ui/PinMenu.svelte
var Tl = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-pin-action svelte-i73q0t\"> </button>"), El = /* @__PURE__ */ K("<p class=\"pc-empty svelte-i73q0t\">No attached links.</p>"), Dl = /* @__PURE__ */ K("<div class=\"pc-pin-menu svelte-i73q0t\" role=\"dialog\" aria-label=\"Pin actions\" aria-modal=\"false\" tabindex=\"-1\"><div class=\"pc-menu-head svelte-i73q0t\"><h2 class=\"svelte-i73q0t\"> </h2><button type=\"button\" aria-label=\"Close pin actions\" class=\"svelte-i73q0t\">Close</button></div> <p class=\"pc-kind svelte-i73q0t\"> </p> <!></div>");
function Ol(e, t) {
	Ve(t, !0);
	let n = Oi(t, "view", 3, null), r = Oi(t, "actions", 19, () => ({})), i = /* @__PURE__ */ L(void 0), a = /* @__PURE__ */ L(8), o = /* @__PURE__ */ L(8), s, c = (e) => !!e.disabled || !!n()?.readOnly && e.capability !== "navigation";
	function l() {
		if (!n() || !U(i)) return;
		let e = U(i).getBoundingClientRect(), t = document.documentElement.clientWidth || window.innerWidth, r = document.documentElement.clientHeight || window.innerHeight;
		R(a, Math.max(8, Math.min(n().screenAnchor.x, t - e.width - 8)), !0), R(o, Math.max(8, Math.min(n().screenAnchor.y, r - e.height - 8)), !0);
	}
	bn(() => {
		let e = n()?.key, t = n()?.screenAnchor;
		if (e === void 0 || !t) return;
		let r = s !== e;
		s = e, dr().then(() => {
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
	var f = Pr();
	W("resize", tn, l);
	var p = B(f), m = (e) => {
		var t = Dl();
		let s;
		var l = z(t), f = z(l), p = z(f, !0);
		P(f);
		var m = V(f);
		P(l);
		var h = V(l, 2), g = z(h);
		P(h), X(V(h, 2), 17, () => n().entries, (e) => e.id, (e, t) => {
			var n = Tl(), r = z(n, !0);
			P(n), H((e) => {
				$(n, "data-entry", U(t).id), n.disabled = e, $(n, "title", U(t).reason), J(r, U(t).label);
			}, [() => c(U(t))]), G("click", n, () => u(U(t))), q(e, n);
		}, (e) => {
			q(e, El());
		}), P(t), Di(t, (e) => R(i, e), () => U(i)), H(() => {
			s = ui(t, "", s, {
				left: `${U(a) ?? ""}px`,
				top: `${U(o) ?? ""}px`
			}), J(p, n().title), J(g, `${n().kind ?? ""}${n().readOnly ? " · Read only" : ""}`);
		}), G("keydown", t, d), G("click", m, () => r().dismiss?.()), q(e, t);
	};
	Y(p, (e) => {
		n() && e(m);
	}), q(e, f), He();
}
Cr(["keydown", "click"]);
//#endregion
//#region src/ui/node-palette.js
var kl = "M3 7 12 2l9 5v10l-9 5-9-5ZM3 7l9 5 9-5M12 12v10", Al = "M3 6l4-2 4 2v5l-4 2-4-2ZM3 6l4 2 4-2M7 8v5M13 6l4-2 4 2v5l-4 2-4-2ZM13 6l4 2 4-2M17 8v5M8 15l4-2 4 2v5l-4 2-4-2ZM8 15l4 2 4-2M12 17v5", jl = Object.freeze([
	{
		name: "Input",
		color: "#96ad52",
		icon: kl
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
		icon: kl
	},
	{
		name: "Subgraphs",
		color: "#a3aa99",
		icon: Al
	}
].map((e) => Object.freeze(e))), Ml = {
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
	Library: Al,
	Routing: "M3 12h18m-7-7 7 7-7 7",
	Blocks: kl,
	Reflect: "M21 12s-4-7-9-7-9 7-9 7 4 7 9 7 9-7 9-7ZM15 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0",
	Internalize: "M4 4h16v16H4M8 8l4 4 4-4M12 12v5",
	Express: "M4 4h16v12H9l-5 4ZM8 8h8M8 12h5",
	Memory: "M5 3h14v18H5ZM8 7h8M8 11h8M8 15h5",
	State: "M3 12h4l3-7 4 14 3-7h4"
}, Nl = Object.freeze(Object.fromEntries(Object.entries(Ml).map(([e, t]) => [e, Object.freeze({
	name: e,
	icon: t
})]))), Pl = {
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
		Ml.Planning
	],
	compose: [
		"Assembly",
		"co",
		Ml.Assembly
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
		Ml.Validation
	],
	"json-decode": [
		"Parsing",
		"jd",
		Ml.Parsing
	],
	"select-fields": [
		"Extraction",
		"sf",
		Ml.Extraction
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
		Ml.Delivery
	],
	reroute: [
		"Routing",
		"rt",
		Ml.Routing
	],
	reflect: [
		"Reflect",
		"rf",
		Ml.Reflect
	],
	internalize: [
		"Internalize",
		"in",
		Ml.Internalize
	],
	express: [
		"Express",
		"ex",
		Ml.Express
	],
	context: [
		"Context",
		"cx",
		Ml.Context
	],
	memory: [
		"Memory",
		"mm",
		Ml.Memory
	],
	state: [
		"State",
		"sv",
		Ml.State
	]
}, Fl = Object.freeze(Object.fromEntries(Object.entries(Pl).map(([e, [t, n, r]]) => [e, Object.freeze({
	group: t,
	shortcode: n,
	icon: r
})]))), Il = Object.freeze({
	group: "Blocks",
	shortcode: "",
	icon: kl
}), Ll = (e) => Object.hasOwn(Fl, e) ? Fl[e] : Il, Rl = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-family-row\" aria-haspopup=\"menu\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path></path></svg><span> </span></button>"), zl = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\">‹ Families</button>"), Bl = /* @__PURE__ */ K("<input class=\"text_pole\" aria-label=\"Search nodes\" placeholder=\"Search nodes…\"/>"), Vl = /* @__PURE__ */ K("<div class=\"pc-shelf-group svelte-hk6fzp\" role=\"presentation\"> </div>"), Hl = /* @__PURE__ */ K("<!> <button type=\"button\" role=\"menuitem\" class=\"svelte-hk6fzp\"><svg class=\"pc-leaf-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path></path></svg><span class=\"pc-catalog-name\"> </span><small> </small></button>", 1), Ul = /* @__PURE__ */ K("<div role=\"menu\" tabindex=\"-1\"><!> <!> <!></div>"), Wl = /* @__PURE__ */ K("<div class=\"pc-shelf-menu pc-shelf-subgraph-menu svelte-hk6fzp\" role=\"menu\" tabindex=\"-1\"><button type=\"button\" role=\"menuitem\" data-shelf-subgraph-action=\"open\">Open saved definition</button> <button type=\"button\" role=\"menuitem\" data-shelf-subgraph-action=\"delete\">Delete</button></div>"), Gl = /* @__PURE__ */ K("<div class=\"pc-shelf-drag-preview svelte-hk6fzp\" aria-hidden=\"true\"> </div>"), Kl = /* @__PURE__ */ K("<nav aria-label=\"Node families\"></nav> <!> <!> <!>", 1);
function ql(e, t) {
	Ve(t, !0);
	let n = Oi(t, "readOnly", 3, !1), r, i = /* @__PURE__ */ L(null), a = /* @__PURE__ */ L(""), o = /* @__PURE__ */ L(!1), s = /* @__PURE__ */ L(""), c = /* @__PURE__ */ L(!1), l = /* @__PURE__ */ L(0), u = /* @__PURE__ */ L(0), d = null, f = 0, p = /* @__PURE__ */ L(null), m = /* @__PURE__ */ L(null), h = null, g = jl.map((e) => e.name), _ = (e) => jl.find((t) => t.name === e)?.color, v = null, y = null, b = null, x = /* @__PURE__ */ L(null);
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
		}, !U(x) && Math.hypot(e.clientX - v.start.x, e.clientY - v.start.y) >= 5 && C(), U(x) && (e.preventDefault(), R(x, {
			...U(x),
			...v.point
		}, !0)));
	}
	function E(e) {
		if (!v || e.pointerId !== v.pointerId) return;
		let t = v.entry, n = !!U(x), i = n ? document.elementFromPoint(e.clientX, e.clientY) : null, a = r.closest(".pc-canvas-area")?.querySelector(".pc-canvas-host");
		S(), n && (e.preventDefault(), e.stopPropagation(), i && a?.contains(i) && ie(t, {
			x: e.clientX,
			y: e.clientY
		}));
	}
	function D(e, t) {
		e.currentTarget === b && e.detail !== 0 ? b = null : ie(t);
	}
	function O(e = U(a)) {
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
				let i = n.id.startsWith("operation:") ? n.id.split(":")[1] : "", a = Ll(i), o = i ? n.label.split(" · ")[0] : n.label, s = n.id.startsWith("boundary:");
				return {
					...n,
					title: o,
					compatible: !n.disabledReason && !!t.choose,
					catalog: !0,
					shortcode: i ? a.shortcode || n.shortcode || "" : n.shortcode ?? a.shortcode,
					group: e === "Subgraphs" ? s ? "Interface" : "Library" : void 0,
					icon: e === "Subgraphs" ? s ? Nl.Routing.icon : Nl.Library.icon : a.icon,
					searchAliases: r
				};
			});
		}
		let n = t.view?.families.find((t) => t.name === e);
		return n ? n.operations.filter((t) => e !== "Surface" || !["pattern-scan", "validate-patches"].includes(t.id)).map((t) => ({
			...t,
			...Ll(t.id),
			family: e
		})) : [];
	}
	function k(e = !1) {
		R(p, null), e && h?.focus({ preventScroll: !0 });
	}
	function A(e = !1) {
		S(), f++, R(a, ""), R(o, !1), k(), e && d?.focus({ preventScroll: !0 });
	}
	bn(() => (t.view?.graphId, t.choices, n(), () => A()));
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
		if (k(), U(a) === e) {
			n && U(i)?.querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
			return;
		}
		let r = ++f;
		if (R(a, e, !0), R(o, !1), d = t, await dr(), r !== f || U(a) !== e || !U(i)?.isConnected) return;
		let s = t.getBoundingClientRect(), p = U(i).getBoundingClientRect(), m = te({
			top: ne(s, U(i), p),
			left: s.left,
			right: s.right
		}, p.width, p.height, 128);
		R(l, m.x, !0), R(u, m.y, !0), R(c, m.compact, !0), n && U(i).querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
	}
	async function re() {
		let e = ++f;
		if (R(a, ""), R(o, !0), R(s, ""), await dr(), e !== f || !U(o) || !U(i)?.isConnected) return;
		let t = ee();
		R(l, Math.min(136, Math.max(4, t.width - 254)), !0), R(u, 13), U(i).querySelector("input")?.focus();
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
		}, !0), await dr(), !U(p) || U(p).id !== r.id || !U(m)?.isConnected) return;
		let o = U(m).getBoundingClientRect();
		R(p, {
			...U(p),
			x: Math.max(4, Math.min(U(p).x, i.width - o.width - 4)),
			y: Math.max(4, Math.min(U(p).y, i.height - o.height - 4))
		}, !0), U(m).querySelector("button")?.focus({ preventScroll: !0 });
	}
	function oe(e) {
		let n = e.target.closest("[data-shelf-choice]");
		n && O("Subgraphs").some((e) => e.id === n.dataset.shelfChoice && e.definitionRef) && t.shelfSubgraph && (e.preventDefault(), e.stopPropagation(), ae(n, {
			x: e.clientX,
			y: e.clientY
		}));
	}
	function se(e) {
		let n = O("Subgraphs").find((e) => e.id === U(p)?.id);
		A(!0), n?.definitionRef && t.shelfSubgraph?.(n.id, e);
	}
	function ce(e) {
		if ((e.key === "ContextMenu" || e.key === "F10" && e.shiftKey) && e.target.dataset.shelfChoice) {
			e.preventDefault(), e.stopPropagation(), ae(e.target);
			return;
		}
		if (U(p) && e.key === "Escape") {
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
		if (e.key === "ArrowLeft" && U(a)) {
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
	var le = { openSearch: re }, ue = Kl();
	W("pointerdown", tn, (e) => {
		e.target.closest(".pc-node-shelf, .pc-shelf-menu") || A();
	}), W("pointermove", tn, T), W("pointerup", tn, E), W("pointercancel", tn, () => S()), W("blur", tn, () => A()), W("resize", tn, () => A()), W("keydown", tn, (e) => {
		v && e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), A(!0));
	});
	var de = B(ue);
	X(de, 21, () => jl, Wr, (e, t) => {
		var n = Rl();
		let r;
		var i = z(n), o = z(i);
		P(i);
		var s = V(i), c = z(s, !0);
		P(s), P(n), H((e) => {
			$(n, "data-family", U(t).name), n.disabled = e, $(n, "title", "Browse " + U(t).name + " nodes"), $(n, "aria-expanded", U(a) === U(t).name), r = ui(n, "", r, { "--pc-family": U(t).color }), $(o, "d", U(t).icon), J(c, U(t).name);
		}, [() => !O(U(t).name).length]), G("click", n, (e) => j(U(t).name, e.currentTarget)), W("pointerenter", n, (e) => {
			e.pointerType !== "touch" && !e.currentTarget.disabled && j(U(t).name, e.currentTarget, !1);
		}), G("keydown", n, ce), q(e, n);
	}), P(de), Di(de, (e) => r = e, () => r);
	var fe = V(de, 2), pe = (e) => {
		let r = /* @__PURE__ */ F(() => U(o) ? g.flatMap((e) => O(e)).filter((e) => [
			e.title,
			e.id,
			e.family,
			e.purpose,
			e.shortcode,
			...e.searchAliases ?? []
		].join(" ").toLowerCase().includes(U(s).toLowerCase())) : O());
		var d = Ul();
		let f;
		var p = z(d), m = (e) => {
			var t = zl();
			G("click", t, () => A(!0)), q(e, t);
		};
		Y(p, (e) => {
			U(c) && U(a) && e(m);
		});
		var h = V(p, 2), v = (e) => {
			var t = Bl();
			Z(t), Ci(t, () => U(s), (e) => R(s, e)), q(e, t);
		};
		Y(h, (e) => {
			U(o) && e(v);
		}), X(V(h, 2), 19, () => U(r), (e) => e.family + e.id, (e, i, a) => {
			let s = /* @__PURE__ */ F(() => !U(i).compatible || n()), c = /* @__PURE__ */ F(() => !!U(i).definitionRef && !!t.shelfSubgraph);
			var l = Hl(), u = B(l), d = (e) => {
				var t = Vl(), n = z(t, !0);
				P(t), H(() => {
					$(t, "data-shelf-group", U(i).group), J(n, U(i).group);
				}), q(e, t);
			};
			Y(u, (e) => {
				!U(o) && U(i).group && U(r)[U(a) - 1]?.group !== U(i).group && e(d);
			});
			var f = V(u, 2);
			let p;
			var m = z(f), h = z(m);
			P(m);
			var g = V(m), v = z(g, !0);
			P(g);
			var y = V(g), b = z(y, !0);
			P(y), P(f), H((e) => {
				$(f, "data-shelf-choice", U(i).id), $(f, "data-insertion-disabled", U(s)), f.disabled = U(s) && !U(c), $(f, "aria-disabled", U(s) && !U(c)), $(f, "aria-haspopup", U(c) ? "menu" : void 0), $(f, "title", n() ? U(c) ? "This graph is read-only. Right-click for subgraph actions." : "This graph is read-only." : U(i).disabledReason || (U(i).compatible ? U(i).purpose || "Add " + U(i).title : "Requires the " + U(i).phase + " phase")), p = ui(f, "", p, e), $(h, "d", U(i).icon), J(v, U(i).title), J(b, U(i).shortcode);
			}, [() => ({ "--pc-family": _(U(i).family) })]), G("pointerdown", f, (e) => w(e, U(i))), W("lostpointercapture", f, () => S()), G("click", f, (e) => D(e, U(i))), q(e, l);
		}), P(d), Di(d, (e) => R(i, e), () => U(i)), H((e) => {
			ci(d, 1, `pc-shelf-menu ${U(o) ? "pc-leaf-menu" : "pc-family-menu"}`, "svelte-hk6fzp"), $(d, "aria-label", U(o) ? "Search nodes" : U(a) + " nodes"), f = ui(d, "", f, e);
		}, [() => ({
			left: `${U(l)}px`,
			top: `${U(u)}px`,
			"--pc-family": _(U(a))
		})]), G("keydown", d, ce), G("contextmenu", d, oe), q(e, d);
	};
	Y(fe, (e) => {
		(U(a) || U(o)) && e(pe);
	});
	var me = V(fe, 2), he = (e) => {
		var t = Wl();
		let n;
		var r = z(t), i = V(r, 2);
		P(t), Di(t, (e) => R(m, e), () => U(m)), H(() => {
			$(t, "aria-label", U(p).title + " actions"), n = ui(t, "", n, {
				left: `${U(p).x}px`,
				top: `${U(p).y}px`
			});
		}), G("keydown", t, ce), G("click", r, () => se("open")), G("click", i, () => se("delete")), q(e, t);
	};
	Y(me, (e) => {
		U(p) && e(he);
	});
	var ge = V(me, 2), _e = (e) => {
		var t = Gl();
		let n;
		var r = z(t, !0);
		P(t), H((e) => {
			n = ui(t, "", n, e), J(r, U(x).title);
		}, [() => ({
			"--pc-family": _(U(x).family),
			left: `${U(x).x + 12}px`,
			top: `${U(x).y + 12}px`
		})]), q(e, t);
	};
	return Y(ge, (e) => {
		U(x) && e(_e);
	}), H(() => ci(de, 1, `pc-node-shelf${U(c) && U(a) ? " pc-shelf-replaced" : ""}`, "svelte-hk6fzp")), q(e, ue), He(le);
}
Cr([
	"click",
	"keydown",
	"contextmenu",
	"pointerdown"
]);
//#endregion
//#region ui/ExamplesBrowser.svelte
var Jl = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-btn menu_button svelte-18p7ib8\">Retry</button>"), Yl = /* @__PURE__ */ K("<div class=\"pc-examples-issue svelte-18p7ib8\" role=\"alert\"><span class=\"svelte-18p7ib8\"> </span><!></div>"), Xl = /* @__PURE__ */ Mr("<g class=\"pc-example-comment svelte-18p7ib8\"><rect rx=\"4\" class=\"svelte-18p7ib8\"></rect><text class=\"svelte-18p7ib8\"> </text></g>"), Zl = /* @__PURE__ */ Mr("<path class=\"pc-wire pc-wire-native svelte-18p7ib8\"></path>"), Ql = /* @__PURE__ */ Mr("<circle class=\"pc-example-pin-dot svelte-18p7ib8\" r=\"4\"></circle><path class=\"pc-example-pin-cue svelte-18p7ib8\"></path><text class=\"pc-example-pin-label svelte-18p7ib8\"> </text>", 1), $l = /* @__PURE__ */ Mr("<g><rect class=\"pc-example-card svelte-18p7ib8\" rx=\"4\"></rect><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\"><path class=\"pc-example-icon svelte-18p7ib8\"></path></svg><text class=\"pc-example-node-title svelte-18p7ib8\" lengthAdjust=\"spacingAndGlyphs\"> </text><!></g>"), eu = /* @__PURE__ */ Mr("<svg class=\"pc-example-preview svelte-18p7ib8\" preserveAspectRatio=\"xMidYMid meet\" aria-hidden=\"true\" focusable=\"false\"><!><!><!></svg>"), tu = /* @__PURE__ */ K("<span class=\"pc-example-unavailable-preview svelte-18p7ib8\"><strong class=\"svelte-18p7ib8\">Unavailable</strong><span class=\"svelte-18p7ib8\"> </span></span>"), nu = /* @__PURE__ */ K("<button type=\"button\"><!> <span class=\"pc-example-title svelte-18p7ib8\"> </span></button>"), ru = /* @__PURE__ */ K("<!> <div class=\"pc-examples-grid svelte-18p7ib8\"></div>", 1);
function iu(e, t) {
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
	}, r = Oi(t, "examples", 19, () => []), i = Oi(t, "issue", 3, ""), a = Oi(t, "scrollTop", 3, 0), o, s = /* @__PURE__ */ L("");
	ki(() => {
		o.scrollTop = a();
	});
	async function c(e) {
		if (!U(s)) {
			R(s, e, !0);
			try {
				await t.open(e);
			} finally {
				R(s, "");
			}
		}
	}
	var l = ru(), u = B(l), d = (e) => {
		var n = Yl(), r = z(n), a = z(r, !0);
		P(r);
		var o = V(r), s = (e) => {
			var n = Jl();
			G("click", n, () => t.retry?.()), q(e, n);
		};
		Y(o, (e) => {
			t.retry && e(s);
		}), P(n), H(() => J(a, i())), q(e, n);
	};
	Y(u, (e) => {
		i() && e(d);
	});
	var f = V(u, 2);
	X(f, 21, r, (e) => e.id, (e, t) => {
		let r = /* @__PURE__ */ F(() => U(t).thumbnail);
		var i = nu();
		let a;
		var o = z(i), l = (e) => {
			var t = eu(), i = z(t);
			X(i, 17, () => U(r).comments, (e) => e.id, (e, t) => {
				var n = Xl(), r = z(n);
				let i;
				var a = V(r), o = z(a, !0);
				P(a), P(n), H(() => {
					$(n, "data-id", U(t).id), $(r, "x", U(t).x), $(r, "y", U(t).y), $(r, "width", U(t).w), $(r, "height", U(t).h), i = ui(r, "", i, { stroke: U(t).color }), $(a, "x", U(t).x + 12), $(a, "y", U(t).y + 24), J(o, U(t).title);
				}), q(e, n);
			});
			var a = V(i);
			X(a, 17, () => U(r).wires, (e) => e.id, (e, t) => {
				var n = Zl();
				H(() => {
					$(n, "data-kind", U(t).kind), $(n, "data-id", U(t).id), $(n, "d", U(t).d);
				}), q(e, n);
			}), X(V(a), 17, () => U(r).nodes, (e) => e.id, (e, t) => {
				var r = $l(), i = z(r), a = V(i), o = z(a);
				P(a);
				var s = V(a), c = z(s, !0);
				P(s), X(V(s), 17, () => U(t).ports, (e) => e.id, (e, t) => {
					var r = Ql(), i = B(r), a = V(i), o = V(a), s = z(o, !0);
					P(o), H(() => {
						$(i, "data-kind", U(t).kind), $(i, "cx", U(t).x), $(i, "cy", U(t).y), $(a, "data-kind", U(t).kind), $(a, "transform", `translate(${U(t).x} ${U(t).y})`), $(a, "d", n[U(t).kind] ?? n.context), $(o, "x", U(t).x + (U(t).dir === "in" ? 9 : -9)), $(o, "y", U(t).y + 4), $(o, "text-anchor", U(t).dir === "in" ? "start" : "end"), J(s, U(t).label);
					}), q(e, r);
				}), P(r), H(() => {
					ci(r, 0, ni(U(t).className), "svelte-18p7ib8"), $(r, "data-id", U(t).id), $(i, "x", U(t).x), $(i, "y", U(t).y), $(i, "width", U(t).w), $(i, "height", U(t).h), $(a, "x", U(t).x + 8), $(a, "y", U(t).y + 7), $(o, "d", U(t).iconPath), $(s, "x", U(t).x + 28), $(s, "y", U(t).y + 20), $(s, "textLength", U(t).title.length * 6 > U(t).w - 36 ? U(t).w - 36 : void 0), J(c, U(t).title);
				}), q(e, r);
			}), P(t), H(() => $(t, "viewBox", `${U(r).bounds.x} ${U(r).bounds.y} ${U(r).bounds.w} ${U(r).bounds.h}`)), q(e, t);
		}, u = (e) => {
			var n = tu(), r = V(z(n)), i = z(r, !0);
			P(r), P(n), H(() => {
				$(r, "id", `pc-example-issue-${U(t).number}`), J(i, U(t).issue);
			}), q(e, n);
		};
		Y(o, (e) => {
			U(r) ? e(l) : e(u, -1);
		});
		var d = V(o, 2), f = z(d, !0);
		P(d), P(i), H(() => {
			a = ci(i, 1, "pc-example-tile svelte-18p7ib8", null, a, { "pc-example-unavailable": !U(r) }), $(i, "aria-label", U(t).title), $(i, "aria-describedby", U(t).issue ? `pc-example-issue-${U(t).number}` : void 0), $(i, "title", U(t).issue || U(t).goal), i.disabled = !!U(s) || !U(r), J(f, U(t).title);
		}), G("click", i, () => c(U(t).id)), q(e, i);
	}), P(f), Di(f, (e) => o = e, () => o), H(() => $(f, "aria-busy", !!U(s))), W("scroll", f, () => t.scroll(o.scrollTop)), q(e, l), He();
}
Cr(["click"]);
//#endregion
//#region ui/ImportReview.svelte
var au = /* @__PURE__ */ K("<p> </p>"), ou = /* @__PURE__ */ K("<li> </li>"), su = /* @__PURE__ */ K("<h3>Saved bindings to review</h3><ul></ul>", 1), cu = /* @__PURE__ */ K("<p>Saved model metadata is present. Review local connections before running.</p>"), lu = /* @__PURE__ */ K("<h3>Imported terminal effects</h3><ul></ul>", 1), uu = /* @__PURE__ */ K("<p>No imported terminal effects.</p>"), du = /* @__PURE__ */ K("<p role=\"alert\"> </p>"), fu = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-btn menu_button\">Prepare again</button>"), pu = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay pc-import-overlay\"><div class=\"pc-workspace-dialog pc-import-review\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Import into graph\" tabindex=\"-1\"><header><h2>Import into graph</h2><button type=\"button\" class=\"pc-btn menu_button\" aria-label=\"Cancel import\">×</button></header> <p><strong> </strong> <small> </small></p> <dl><dt>Phase</dt><dd> </dd><dt>Additions</dt><dd> </dd><dt>Conservative request bound</dt><dd> </dd></dl> <p class=\"pc-import-explanation\">This authoring bound includes unfinished branches. Bindings and reachable execution are checked when you explicitly run the workflow.</p> <!> <!> <!> <p>Insertion keeps internal wiring and relative layout. It does not connect matching names, arm or assign the graph, run requests, publish Guidance, or Apply a reply.</p> <!> <footer><button type=\"button\" class=\"pc-btn menu_button\">Cancel</button><!><button type=\"button\" class=\"pc-btn menu_button pc-import-accept\">Insert into graph</button></footer></div></div>");
function mu(e, t) {
	Ve(t, !0);
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
		X(r, 21, () => t.view.unresolvedBindings, Wr, (e, t) => {
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
		X(r, 21, () => t.view.terminals, Wr, (e, t) => {
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
	var A = V(O, 2), ee = z(A), te = V(ee), ne = (e) => {
		var n = fu();
		G("click", n, () => t.actions.prepareImportAgain?.()), q(e, n);
	};
	Y(te, (e) => {
		t.view.error && e(ne);
	});
	var j = V(te);
	P(A), P(a), Di(a, (e) => n = e, () => n), P(i), H(() => {
		J(u, t.view.name), J(f, t.view.fileName), J(h, t.view.phase), J(_, `${t.view.nodeCount ?? ""} blocks · ${t.view.wireCount ?? ""} wires · ${t.view.groupCount ?? ""} groups`), J(y, `${t.view.callBound ?? ""} total · ${t.view.importedCallBound ?? ""} imported`), j.disabled = !!t.view.error;
	}), G("keydown", a, r), W("paste", a, (e) => e.stopPropagation()), G("click", s, () => t.actions.cancelImport?.()), G("click", ee, () => t.actions.cancelImport?.()), G("click", j, () => t.actions.acceptImport?.()), q(e, i), He();
}
Cr(["keydown", "click"]);
//#endregion
//#region ui/Workbench.svelte
var hu = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-recall-badge\"> </button>"), gu = /* @__PURE__ */ K("<p class=\"pc-native-diagnostic svelte-1dr9aew\" role=\"alert\"> </p>"), _u = /* @__PURE__ */ K("<p>Browse node families on the floating shelf. Middle mouse pans the graph; the wheel zooms around the pointer. Use the divider or its arrow keys to resize Preview.</p><p>Open examples and assign a unified workflow from Workflows. Its preparation stage feeds Generate Reply, and its response stage reshapes the captured Draft before Review and Publish. Legacy pre and post workflows remain selectable. Select model nodes to choose a text connection profile in Details. Fast Decision uses a configured typed connection from Tools › Fast connections and an optional separately selected Decision fallback. Arm enables the assigned host workflow. Unified generation starts with Send in SillyTavern; Run to here tests supported nodes. Run tests legacy workflows explicitly.</p><p>File › Open workflow chooses a JSON file and opens a separate workflow. Save workflow keeps committed edits and connections in SillyTavern. Export workflow JSON downloads a portable sharing copy without local connections. Import into graph reviews a same-phase fragment before one undoable insertion.</p><p>Select nodes and right-click Create Subgraph to open their connected body in a new tab. Double-click a subgraph to open it. Add Input and Output nodes from the Subgraphs shelf inside an editable subgraph, then name and configure their ports in Details.</p><p>Right-click a subgraph block and choose Add to Subgraphs to save it for reuse. Right-click a saved shelf entry to delete it. Saving updates the shelf only when you choose to save; existing placed copies stay unchanged. Portals connect pins through named references. Preview artifact tabs show results for the selected node; Run to here checks the request bound before running. Apply reviews the fresh result against the full root workflow.</p>", 1), vu = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay\"><div role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\"><header class=\"svelte-1dr9aew\"><h2 class=\"svelte-1dr9aew\"> </h2><button type=\"button\" class=\"pc-btn menu_button\" aria-label=\"Close panel\">×</button></header> <!></div></div>"), yu = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay\"><div class=\"pc-manager-dialog svelte-1dr9aew\" role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\" aria-label=\"Manage portals\"><!></div></div>"), bu = /* @__PURE__ */ K("<div role=\"dialog\" aria-modal=\"true\" aria-label=\"Lattice\" data-pc-workbench=\"svelte\"><!> <!> <div class=\"pc-body\" role=\"region\" aria-label=\"Workspace panels\" tabindex=\"0\"><div class=\"pc-stage\"><section aria-label=\"Output preview\"><header class=\"pc-preview-pane-head\"><strong>Preview</strong><button type=\"button\" class=\"pc-btn menu_button\"> </button></header> <div class=\"pc-preview-content\"><!></div></section> <!> <!> <!> <div class=\"pc-canvas-area\" id=\"pc-workspace-graph\" role=\"tabpanel\"><div class=\"pc-workspace-run svelte-1dr9aew\"><!></div> <div class=\"pc-canvas-host\" aria-label=\"Node canvas\"></div> <!> <!></div></div> <!> <div class=\"pc-inspector pc-workspace-details svelte-1dr9aew\"><header class=\"pc-details-heading svelte-1dr9aew\"><strong class=\"svelte-1dr9aew\">Details</strong><button type=\"button\" class=\"svelte-1dr9aew\">Portals</button></header> <!> <div class=\"pc-node-details-holder svelte-1dr9aew\"><!></div></div></div> <!> <!> <!> <!> <!> <!> <!> <!></div>");
function xu(e, t) {
	Ve(t, !0);
	let n = Oi(t, "actions", 7), r = /* @__PURE__ */ L({
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
		if (await dr(), !t()) return;
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
	let v = _(), y = /* @__PURE__ */ L(Qt(v.height)), b = /* @__PURE__ */ L(Qt(v.collapsed)), x = /* @__PURE__ */ L(500), S = /* @__PURE__ */ L(null), C = /* @__PURE__ */ L(520), w = /* @__PURE__ */ F(() => Math.max(220, Math.min(U(C), U(S) ?? U(r).detailsWidth ?? 258)));
	function T(e) {
		R(S, null), R(r, {
			...U(r),
			detailsWidth: e
		}), n().resizeDetails?.(e);
	}
	let E = /* @__PURE__ */ L(""), D = /* @__PURE__ */ L(null), O = null, k = 0, A = /* @__PURE__ */ L(0), ee;
	function te() {
		try {
			localStorage.setItem(g, JSON.stringify({
				height: U(y),
				collapsed: U(b)
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
			R(E, e, !0), await dr(), t === k && U(E) === e && U(D)?.querySelector("button")?.focus();
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
	ki(() => {
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
	Di(fa(pe, {
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
		Hs(Ee, {
			get view() {
				return U(e);
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
			let t = /* @__PURE__ */ F(() => Math.min(U(y), U(x)));
			ma(e, {
				get height() {
					return U(t);
				},
				get max() {
					return U(x);
				},
				start: ne,
				change: (e) => {
					R(y, e, !0), te();
				}
			});
		}
	};
	Y(M, (e) => {
		U(b) || e(De);
	});
	var N = V(M, 2);
	Di(Ea(N, {
		get views() {
			return U(r).graphViews;
		},
		get actions() {
			return n().graphViewActions;
		},
		panelId: "pc-workspace-graph"
	}), (e) => u = e, () => u);
	var Oe = V(N, 2);
	{
		let e = /* @__PURE__ */ F(() => U(r).graphViews?.active);
		ja(Oe, {
			get view() {
				return U(e);
			},
			get actions() {
				return n().graphViewActions;
			}
		});
	}
	var ke = V(Oe, 2), je = z(ke), Me = z(je);
	{
		let e = /* @__PURE__ */ F(() => U(r).runMeter ?? null);
		rc(Me, {
			get view() {
				return U(e);
			},
			open: () => {
				R(E, "run-details");
			}
		});
	}
	P(je);
	var Ne = V(je, 2);
	Di(Ne, (e) => o = e, () => o);
	var Pe = V(Ne, 2), Fe = (e) => {
		var t = gu(), n = z(t, !0);
		P(t), H(() => J(n, U(r).nativeDiagnostic)), q(e, t);
	};
	Y(Pe, (e) => {
		U(r).nativeDiagnostic && e(Fe);
	}), Di(ql(V(Pe, 2), {
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
		},
		add: (e, t) => n().addNode?.(e, t)
	}), (e) => ee = e, () => ee), P(ke), P(ve), Di(ve, (e) => s = e, () => s);
	var Ie = V(ve, 2), Le = (e) => {
		var t = Pr();
		Ur(B(t), () => U(r).graphViews?.active.key ?? U(r).graphId, (e) => {
			ga(e, {
				get width() {
					return U(w);
				},
				get max() {
					return U(C);
				},
				start: ne,
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
	var Ue = V(ze, 2), We = (e) => {
		let t = /* @__PURE__ */ F(() => U(r).commentDetails);
		ws(e, {
			get comment() {
				return U(t).comment;
			},
			onPatch: (e) => n().commentDetails?.patch(U(t).selection, e),
			onCommand: (e) => n().commentDetails?.command(U(t).selection, e)
		});
	};
	Y(Ue, (e) => {
		U(r).commentDetails && e(We);
	});
	var Ge = V(Ue, 2), Ke = z(Ge);
	{
		let e = /* @__PURE__ */ F(() => U(r).commentDetails ? null : U(r).nodeDetails ?? null);
		xs(Ke, {
			get view() {
				return U(e);
			},
			get actions() {
				return n().nodeDetails;
			}
		});
	}
	P(Ge), P(Re), Di(Re, (e) => c = e, () => c), P(_e), Di(_e, (e) => a = e, () => a);
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
				Mc(e, {
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
				ol(e, {
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
				el(e, {
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
				$s(e, {
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
			Ae(4), q(e, t);
		};
		Y(u, (e) => {
			U(E) === "examples" ? e(d) : U(E) === "fast-connections" ? e(f, 1) : U(E) === "recall-arms" ? e(p, 2) : U(E) === "story-documents" ? e(m, 3) : U(E) === "run-details" ? e(h, 4) : e(g, -1);
		}), P(i), Di(i, (e) => R(D, e), () => U(D)), P(t), H(() => {
			a = ci(i, 1, "pc-workspace-dialog svelte-1dr9aew", null, a, { "pc-examples-dialog": U(E) === "examples" }), $(i, "aria-label", U(E) === "examples" ? "Examples" : U(E) === "run-details" ? "Run details" : U(E) === "fast-connections" ? "Fast connections" : U(E) === "story-documents" ? "Workflow Data" : U(E) === "recall-arms" ? "Recall arms" : "Workspace guide"), J(c, U(E) === "examples" ? "Examples" : U(E) === "run-details" ? "Run details" : U(E) === "fast-connections" ? "Fast connections" : U(E) === "story-documents" ? "Workflow Data" : U(E) === "recall-arms" ? "Recall arms" : "Workspace guide");
		}), G("keydown", i, ce), W("paste", i, (e) => e.stopPropagation()), G("click", l, ae), q(e, t);
	};
	Y(qe, (e) => {
		U(E) && e(Je);
	});
	var Ye = V(qe, 2);
	wl(Ye, {
		get view() {
			return U(r).nativeSearch;
		},
		get actions() {
			return n().nativeSearch;
		}
	});
	var Xe = V(Ye, 2);
	Ol(Xe, {
		get view() {
			return U(r).nativePinMenu;
		},
		get actions() {
			return n().nativePinMenu;
		}
	});
	var Ze = V(Xe, 2), Qe = (e) => {
		var t = yu(), i = z(t);
		Sc(z(i), {
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
		pl(e, {
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
		Ec(e, {
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
		hl(e, {
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
	}), P(ue), Di(ue, (e) => i = e, () => i), H((e) => {
		de = ci(ue, 1, "pc-root pc-native-workspace svelte-1dr9aew", null, de, { "pc-native-flat": U(r).nativeFlatCanvas }), fe = ui(ue, "", fe, { "--pc-details-width": `${U(w)}px` }), be = ci(ye, 1, "pc-preview-pane", null, be, { "pc-preview-collapsed": U(b) }), xe = ui(ye, "", xe, e), $(Ce, "aria-expanded", !U(b)), J(we, U(b) ? "Expand preview" : "Collapse preview"), $(Te, "hidden", U(b)), $(Re, "hidden", !U(r).inspectorOpen), $(Ge, "hidden", !!U(r).commentDetails);
	}, [() => ({ "--pc-preview-height": `${Math.min(U(y), U(x))}px` })]), G("click", Ce, () => j(!U(b))), G("click", Be, () => n().managePortals?.()), q(e, ue), He(le);
}
Cr(["click", "keydown"]);
//#endregion
//#region ui/entry.js
function Su(e, t) {
	let n = document.createElement("div");
	n.style.cssText = "position:absolute;left:0;top:0;visibility:hidden;pointer-events:none", n.setAttribute("aria-hidden", "true"), n.inert = !0, e.append(n);
	let r;
	try {
		r = Ir(Li, {
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
		r && Br(r), n.remove();
	}
}
function Cu(e, t) {
	let n = Ir(ia, {
		target: e,
		props: { actions: t }
	});
	return It(), {
		...n.getLayers(),
		setComments: (e, t) => It(() => n.setComments(e, t)),
		setNodes: (e) => It(() => n.setNodes(e)),
		setNodeProfiles: (e) => It(() => n.setNodeProfiles(e)),
		setGroups: (e) => It(() => n.setGroups(e)),
		setWires: (e, t, r) => It(() => n.setWires(e, t, r)),
		setPositions: (e, t) => It(() => n.setPositions(e, t)),
		destroy: () => Br(n)
	};
}
function wu(e, t) {
	let n = Ir(xu, {
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
		destroy: () => Br(n)
	};
}
//#endregion
export { Su as measureNodeCard, Cu as mountCanvas, wu as mountWorkbench };
