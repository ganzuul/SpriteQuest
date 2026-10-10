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
var h = 1024, g = 2048, _ = 4096, v = 8192, y = 16384, b = 32768, x = 1 << 25, S = 65536, C = 1 << 19, w = 1 << 20, T = 1 << 25, E = 65536, D = 1 << 21, O = 1 << 22, ee = 1 << 23, k = Symbol("$state"), te = Symbol("legacy props"), ne = Symbol(""), re = Symbol("attributes"), ie = Symbol("class"), ae = Symbol("style"), oe = Symbol("text"), se = Symbol("form reset"), ce = new class extends Error {
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
//#endregion
//#region node_modules/svelte/src/constants.js
var Se = {}, Ce = Symbol("uninitialized"), we = "http://www.w3.org/1999/xhtml";
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
var A = !1;
function ke(e) {
	A = e;
}
var j;
function Ae(e) {
	if (e === null) throw Ee(), Se;
	return j = e;
}
function je() {
	return Ae(/* @__PURE__ */ dn(j));
}
function M(e) {
	if (A) {
		if (/* @__PURE__ */ dn(j) !== null) throw Ee(), Se;
		j = e;
	}
}
function Me(e = 1) {
	if (A) {
		for (var t = e, n = j; t--;) n = /* @__PURE__ */ dn(n);
		j = n;
	}
}
function Ne(e = !0) {
	for (var t = 0, n = j;;) {
		if (n.nodeType === 8) {
			var r = n.data;
			if (r === "]") {
				if (t === 0) return n;
				--t;
			} else (r === "[" || r === "[!" || r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
		}
		var i = /* @__PURE__ */ dn(n);
		e && n.remove(), n = i;
	}
}
function Pe(e) {
	if (!e || e.nodeType !== 8) throw Ee(), Se;
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
		r: H,
		l: null
	};
}
function We(e) {
	var t = Ve, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) Sn(r);
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
	var t = H;
	if (t === null) return V.f |= ee, e;
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
	A && /* @__PURE__ */ un(e) !== null && fn(e);
}
var ot = !1;
function st() {
	ot || (ot = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[se]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function ct(e) {
	var t = V, n = H;
	Gn(null), Kn(null);
	try {
		return e();
	} finally {
		Gn(t), Kn(n);
	}
}
function lt(e, t, n, r = n) {
	e.addEventListener(t, () => ct(n));
	let i = e[se];
	e[se] = i ? () => {
		i(), r(!0);
	} : () => r(!0), st();
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function ut(e) {
	let t = 0, n = Jt(0), r;
	return () => {
		yn() && (U(n), En(() => (t === 0 && (r = pr(() => e(() => Qt(n)))), t += 1, () => {
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
	#t = A ? j : null;
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
			var t = H;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = H.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = Dn(() => {
			if (A) {
				let e = this.#t;
				je();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, dt), A && (this.#e = j);
	}
	#g() {
		try {
			this.#a = On(() => this.#r(this.#e));
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		let t = this.#n.failed, { reset: n, invoke_onerror: r } = this.#v(e);
		Je(r), t && (this.#s = On(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			t ? Oe() : (t = !0, n && xe(), this.#s !== null && Fn(this.#s, () => {
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
		e && (this.is_pending = !0, this.#o = On(() => e(this.#e)), Je(() => {
			var e = this.#c = document.createDocumentFragment(), t = ln();
			e.append(t), this.#a = this.#S(() => On(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, Fn(this.#o, () => {
				this.#o = null;
			}), this.#x(P));
		}));
	}
	#b() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#l = 0, this.#a = On(() => {
				this.#r(this.#e);
			}), this.#u > 0) {
				var e = this.#c = document.createDocumentFragment();
				zn(this.#a, e);
				let t = this.#n.pending;
				this.#o = On(() => t(this.#e));
			} else this.#x(P);
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
		var t = H, n = V, r = Ve;
		Kn(this.#i), Gn(this.#i), He(this.#i.ctx);
		try {
			return Lt.ensure(), e();
		} catch (e) {
			return Xe(e), null;
		} finally {
			Kn(t), Gn(n), He(r);
		}
	}
	#C(e, t) {
		this.has_pending_snippet() ? (this.#u += e, this.#u === 0 && (this.#x(t), this.#o && Fn(this.#o, () => {
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
		P?.is_fork ? (this.#a && P.skip_effect(this.#a), this.#o && P.skip_effect(this.#o), this.#s && P.skip_effect(this.#s), P.oncommit(() => {
			this.#w(e);
		})) : this.#w(e);
	}
	#w(e) {
		this.#a &&= (Mn(this.#a), null), this.#o &&= (Mn(this.#o), null), this.#s &&= (Mn(this.#s), null), A && (Ae(this.#t), Me(), Ae(Ne()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return On(() => {
						var r = H;
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
	var s = H, c = ht(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
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
	var e = H, t = V, n = Ve, r = P;
	return function(i = !0) {
		Kn(e), Gn(t), He(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function gt(e = !0) {
	Kn(null), Gn(null), He(null), e && P?.deactivate();
}
function _t() {
	var e = H, t = e.b, n = P, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function vt(e) {
	var t = 2 | g;
	return H !== null && (H.f |= C), {
		ctx: Ve,
		deps: null,
		effects: null,
		equals: Fe,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v: Ce,
		wv: 0,
		parent: H,
		ac: null
	};
}
var yt = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function bt(e, t, n) {
	let r = H;
	r === null && de();
	var i = void 0, a = Jt(Ce), o = !V, s = /* @__PURE__ */ new Set();
	return Tn(() => {
		var t = H, n = p();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== ce && n.reject(e);
			}).finally(gt);
		} catch (e) {
			n.reject(e), gt();
		}
		var c = P;
		if (o) {
			if (t.f & 32768) var l = _t();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(yt);
			else for (let e of s.values()) e.reject(yt);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== yt && (c.activate(), t ? (a.f |= ee, Xt(a, t)) : (a.f & 8388608 && (a.f ^= ee), Xt(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), bn(() => {
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
function N(e) {
	let t = /* @__PURE__ */ vt(e);
	return Jn(t), t;
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
		for (var n = 0; n < t.length; n += 1) Mn(t[n]);
	}
}
function Ct(e) {
	var t, n = H, r = e.parent;
	if (!Hn && r !== null && e.v !== Ce && r.f & 24576) return Te(), e.v;
	Kn(r);
	try {
		e.f &= ~E, St(e), t = or(e);
	} finally {
		Kn(n);
	}
	return t;
}
function wt(e) {
	var t = Ct(e);
	!e.equals(t) && (e.wv = rr(), (!P?.is_fork || e.deps === null) && (P === null ? e.v = t : (P.capture(e, t, !0), Ot?.capture(e, t, !0)), e.deps === null)) ? $e(e, h) : Hn || (kt === null ? et(e) : (yn() || P?.is_fork) && kt.set(e, t));
}
function Tt(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && ct(() => {
		t.ac.abort(ce), t.ac = null;
	}), t.fn !== null && (t.teardown = d), cr(t, 0), An(t));
}
function Et(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && lr(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
var Dt = null, P = null, Ot = null, kt = null, At = null, jt = !1, Mt = !1, Nt = null, Pt = null, Ft = 0, It = 1, Lt = class e {
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
		if (P = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (Nt = null, Pt = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) Ut(e, t);
			i.length > 0 && P.#g();
			return;
		}
		let o = this.#v();
		if (o) this.#b(r), this.#b(n), o.#y(this);
		else {
			this.#u.clear(), this.#d.clear();
			for (let e of this.#r) e(this);
			this.#r.clear(), Ot = this, Vt(r), Vt(n), Ot = null, this.#s?.resolve();
			var s = P;
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), $e(i, g), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), P = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) nt(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== Ce && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), kt?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		P = this;
	}
	deactivate() {
		P = null, kt = null;
	}
	flush() {
		try {
			Mt = !0, P = this, this.#g();
		} finally {
			Ft = 0, At = null, Nt = null, Pt = null, Mt = !1, P = null, kt = null, Kt.clear();
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
		if (P === null) {
			let t = P = new e();
			!Mt && !jt && Je(() => {
				t.#e || t.flush();
			});
		}
		return P;
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
				if (Nt !== null && t === H && (V === null || !(V.f & 2))) return;
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
		for (e && (P !== null && !P.is_fork && P.flush(), n = e());;) {
			if (Ye(), P === null) return n;
			P.flush();
		}
	} finally {
		jt = t;
	}
}
function zt() {
	try {
		ge();
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
			if (!(r.f & 24576) && ir(r) && (Bt = /* @__PURE__ */ new Set(), lr(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Pn(r), Bt?.size > 0)) {
				Kt.clear();
				for (let e of Bt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) Bt.has(n) && (Bt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || lr(n);
					}
				}
				Bt.clear();
			}
		}
		Bt = null;
	}
}
function Ht(e) {
	P.schedule(e);
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
function F(e, t) {
	let n = Jt(e, t);
	return Jn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function Yt(e, t = !1, n = !0) {
	let r = Jt(e);
	return t || (r.equals = Le), r;
}
function I(e, t, n = !1) {
	return V !== null && (!Wn || V.f & 131072) && Ge() && V.f & 4325394 && (qn === null || !qn.has(e)) && be(), Xt(e, n ? en(t) : t, Pt);
}
function Xt(e, t, n = null) {
	if (!e.equals(t)) {
		Hn ? Kt.set(e, t) : Kt.has(e) || Kt.set(e, e.v);
		var r = Lt.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && Ct(t), kt === null && et(t);
		}
		e.wv = rr(), $t(e, g, n), Ge() && H !== null && H.f & 1024 && !(H.f & 96) && (Zn === null ? Qn([e]) : Zn.push(e)), !r.is_fork && Gt.size > 0 && !qt && Zt();
	}
	return t;
}
function Zt() {
	qt = !1;
	for (let e of Gt) {
		e.f & 1024 && $e(e, _);
		let t;
		try {
			t = ir(e);
		} catch {
			t = !0;
		}
		t && lr(e);
	}
	Gt.clear();
}
function Qt(e) {
	I(e, e.v + 1);
}
function $t(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = Ge(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (i || s !== H) {
			var l = (c & g) === 0;
			if (l && $e(s, t), c & 131072) Gt.add(s);
			else if (c & 2) {
				var u = s;
				kt?.delete(u), c & 65536 || (c & 512 && (H === null || !(H.f & 2097152)) && (s.f |= E), $t(u, _, n));
			} else if (l) {
				var d = s;
				c & 16 && Bt !== null && Bt.add(d), n === null ? Ht(d) : n.push(d);
			}
		}
	}
}
function en(t) {
	if (typeof t != "object" || !t || k in t) return t;
	let n = l(t);
	if (n !== s && n !== c) return t;
	var r = /* @__PURE__ */ new Map(), i = e(t), o = /* @__PURE__ */ F(0), u = null, d = tr, f = (e) => {
		if (tr === d) return e();
		var t = V, n = tr;
		Gn(null), nr(d);
		var r = e();
		return Gn(t), nr(n), r;
	};
	return i && r.set("length", /* @__PURE__ */ F(t.length, u)), new Proxy(t, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && ve();
			var i = r.get(t);
			return i === void 0 ? f(() => {
				var e = /* @__PURE__ */ F(n.value, u);
				return r.set(t, e), e;
			}) : I(i, n.value, !0), !0;
		},
		deleteProperty(e, t) {
			var n = r.get(t);
			if (n === void 0) {
				if (t in e) {
					let e = f(() => /* @__PURE__ */ F(Ce, u));
					r.set(t, e), Qt(o);
				}
			} else I(n, Ce), Qt(o);
			return !0;
		},
		get(e, n, i) {
			if (n === k) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ F(en(s ? e[n] : Ce), u)), r.set(n, o)), o !== void 0) {
				var c = U(o);
				return c === Ce ? void 0 : c;
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
				if (a !== void 0 && o !== Ce) return {
					enumerable: !0,
					configurable: !0,
					value: o,
					writable: !0
				};
			}
			return n;
		},
		has(e, t) {
			if (t === k) return !0;
			var n = r.get(t), i = n !== void 0 && n.v !== Ce || Reflect.has(e, t);
			return (n !== void 0 || H !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ F(i ? en(e[t]) : Ce, u)), r.set(t, n)), U(n) === Ce) ? !1 : i;
		},
		set(e, t, n, s) {
			var c = r.get(t), l = t in e;
			if (i && t === "length") for (var d = n; d < c.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ F(Ce, u)), r.set(d + "", p)) : I(p, Ce);
			}
			if (c === void 0) (!l || a(e, t)?.writable) && (c = f(() => /* @__PURE__ */ F(void 0, u)), I(c, en(n)), r.set(t, c));
			else {
				l = c.v !== Ce;
				var m = f(() => en(n));
				I(c, m);
			}
			var h = Reflect.getOwnPropertyDescriptor(e, t);
			if (h?.set && h.set.call(s, n), !l) {
				if (i && typeof t == "string") {
					var g = r.get("length"), _ = Number(t);
					Number.isInteger(_) && _ >= g.v && I(g, _ + 1);
				}
				Qt(o);
			}
			return !0;
		},
		ownKeys(e) {
			U(o);
			var t = Reflect.ownKeys(e).filter((e) => {
				var t = r.get(e);
				return t === void 0 || t.v !== Ce;
			});
			for (var [n, i] of r) i.v !== Ce && !(n in e) && t.push(n);
			return t;
		},
		setPrototypeOf() {
			ye();
		}
	});
}
function tn(e) {
	try {
		if (typeof e == "object" && e && k in e) return e[k];
	} catch {}
	return e;
}
function nn(e, t) {
	return Object.is(tn(e), tn(t));
}
var rn, an, on, sn;
function cn() {
	if (rn === void 0) {
		rn = window, an = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		on = a(t, "firstChild").get, sn = a(t, "nextSibling").get, u(e) && (e[ie] = void 0, e[re] = null, e[ae] = void 0, e.__e = void 0), u(n) && (n[oe] = void 0);
	}
}
function ln(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function un(e) {
	return on.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function dn(e) {
	return sn.call(e);
}
function L(e, t) {
	if (!A) return /* @__PURE__ */ un(e);
	var n = /* @__PURE__ */ un(j);
	if (n === null) n = j.appendChild(ln());
	else if (t && n.nodeType !== 3) {
		var r = ln();
		return n?.before(r), Ae(r), r;
	}
	return t && hn(n), Ae(n), n;
}
function R(e, t = !1) {
	if (!A) {
		var n = /* @__PURE__ */ un(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ dn(n) : n;
	}
	if (t) {
		if (j?.nodeType !== 3) {
			var r = ln();
			return j?.before(r), Ae(r), r;
		}
		hn(j);
	}
	return j;
}
function z(e, t = 1, n = !1) {
	let r = A ? j : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ dn(r);
	if (!A) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = ln();
			return r === null ? i?.after(a) : r.before(a), Ae(a), a;
		}
		hn(r);
	}
	return Ae(r), r;
}
function fn(e) {
	e.textContent = "";
}
function pn() {
	return !1;
}
function mn(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function hn(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/effects.js
function gn(e) {
	H === null && (V === null && he(e), me()), Hn && pe(e);
}
function _n(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function vn(e, t) {
	var n = H;
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
	P?.register_created_effect(r);
	var i = r;
	if (e & 4) Nt === null ? Lt.ensure().schedule(r) : Nt.push(r);
	else if (t !== null) {
		try {
			lr(r);
		} catch (e) {
			throw Mn(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= S));
	}
	if (i !== null && (i.parent = n, n !== null && _n(i, n), V !== null && V.f & 2 && !(e & 64))) {
		var a = V;
		(a.effects ??= []).push(i);
	}
	return r;
}
function yn() {
	return V !== null && !Wn;
}
function bn(e) {
	let t = vn(8, null);
	return $e(t, h), t.teardown = e, t;
}
function xn(e) {
	gn("$effect");
	var t = H.f;
	if (!V && t & 32 && Ve !== null && !Ve.i) {
		var n = Ve;
		(n.e ??= []).push(e);
	} else return Sn(e);
}
function Sn(e) {
	return vn(4 | w, e);
}
function Cn(e) {
	Lt.ensure();
	let t = vn(64 | C, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? Fn(t, () => {
			Mn(t), n(void 0);
		}) : (Mn(t), n(void 0));
	});
}
function wn(e) {
	return vn(4, e);
}
function Tn(e) {
	return vn(O | C, e);
}
function En(e, t = 0) {
	return vn(8 | t, e);
}
function B(e, t = [], n = [], r = []) {
	mt(r, t, n, (t) => {
		vn(8, () => {
			e(...t.map(U));
		});
	});
}
function Dn(e, t = 0) {
	return vn(16 | t, e);
}
function On(e) {
	return vn(32 | C, e);
}
function kn(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = Hn, n = V;
		Un(!0), Gn(null);
		try {
			t.call(null);
		} finally {
			Un(e), Gn(n);
		}
	}
}
function An(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && ct(() => {
			e.abort(ce);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : Mn(n, t), n = r;
	}
}
function jn(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || Mn(t), t = n;
	}
}
function Mn(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (Nn(e.nodes.start, e.nodes.end), n = !0), e.f |= x, An(e, t && !n), cr(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	kn(e), e.f ^= x, e.f |= y;
	var i = e.parent;
	i !== null && i.first !== null && Pn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Nn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ dn(e);
		e.remove(), e = n;
	}
}
function Pn(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Fn(e, t, n = !0) {
	var r = [];
	In(e, r, !0);
	var i = () => {
		n && Mn(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function In(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= v;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				In(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function Ln(e) {
	Rn(e, !0);
}
function Rn(e, t) {
	if (e.f & 8192) {
		e.f ^= v, e.f & 1024 || ($e(e, g), Lt.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = !!(n.f & 65536) || !!(n.f & 32);
			Rn(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function zn(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ dn(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/legacy.js
var Bn = null, Vn = !1, Hn = !1;
function Un(e) {
	Hn = e;
}
var V = null, Wn = !1;
function Gn(e) {
	V = e;
}
var H = null;
function Kn(e) {
	H = e;
}
var qn = null;
function Jn(e) {
	V !== null && (qn ??= /* @__PURE__ */ new Set()).add(e);
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
			if (ir(a) && wt(a), a.wv > e.wv) return !0;
		}
		t & 512 && kt === null && $e(e, h);
	}
	return !1;
}
function ar(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(qn !== null && qn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? ar(a, t, !1) : t === a && (n ? $e(a, g) : a.f & 1024 && $e(a, _), Ht(a));
	}
}
function or(e) {
	var t = Yn, n = Xn, r = Zn, i = V, a = qn, o = Ve, s = Wn, c = tr, l = e.f;
	Yn = null, Xn = 0, Zn = null, V = l & 96 ? null : e, qn = null, He(e.ctx), Wn = !1, tr = ++er, e.ac !== null && (ct(() => {
		e.ac.abort(ce);
	}), e.ac = null);
	try {
		e.f |= D;
		var u = e.fn, d = u();
		e.f |= b;
		var f = e.deps, p = P?.is_fork;
		if (Yn !== null) {
			var m;
			if (p || cr(e, Xn), f !== null && Xn > 0) for (f.length = Xn + Yn.length, m = 0; m < Yn.length; m++) f[Xn + m] = Yn[m];
			else e.deps = f = Yn;
			if (yn() && e.f & 512) for (m = Xn; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && Xn < f.length && (cr(e, Xn), f.length = Xn);
		if (Ge() && Zn !== null && !Wn && f !== null && !(e.f & 6146)) for (m = 0; m < Zn.length; m++) ar(Zn[m], e);
		if (i !== null && i !== e) {
			if (er++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = er;
			if (t !== null) for (let e of t) e.rv = er;
			Zn !== null && (r === null ? r = Zn : r.push(...Zn));
		}
		return e.f & 8388608 && (e.f ^= ee), d;
	} catch (e) {
		return Xe(e);
	} finally {
		e.f ^= D, Yn = t, Xn = n, Zn = r, V = i, qn = a, He(o), Wn = s, tr = c;
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
		s.f & 512 && (s.f ^= 512, s.f &= ~E), s.v !== Ce && et(s), s.ac !== null && ct(() => {
			s.ac.abort(ce), s.ac = null, $e(s, g);
		}), Tt(s), cr(s, 0);
	}
}
function cr(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) sr(e, n[r]);
}
function lr(e) {
	var t = e.f;
	if (!(t & 16384)) {
		$e(e, h);
		var n = H, r = Vn;
		H = e, Vn = !(t & 96);
		try {
			t & 16777232 ? jn(e) : An(e), kn(e);
			var i = or(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = $n;
		} finally {
			Vn = r, H = n;
		}
	}
}
async function ur() {
	await Promise.resolve(), Rt();
}
function U(e) {
	var t = !!(e.f & 2);
	if (Bn?.add(e), V !== null && !Wn && !(H !== null && H.f & 16384) && (qn === null || !qn.has(e))) {
		var r = V.deps;
		if (V.f & 2097152) e.rv < er && (e.rv = er, Yn === null && r !== null && r[Xn] === e ? Xn++ : Yn === null ? Yn = [e] : Yn.push(e));
		else {
			V.deps ??= [], n.call(V.deps, e) || V.deps.push(e);
			var i = e.reactions;
			i === null ? e.reactions = [V] : n.call(i, V) || i.push(V);
		}
	}
	if (Hn && Kt.has(e)) return Kt.get(e);
	if (t) {
		var a = e;
		if (Hn) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || fr(a)) && (o = Ct(a)), Kt.set(a, o), o;
		}
		var s = !(a.f & 512) && !Wn && V !== null && (Vn || !!(V.f & 512)), c = (a.f & b) === 0;
		ir(a) && (s && (a.f |= 512), wt(a)), s && !c && (Et(a), dr(a));
	}
	if (kt?.has(e)) return kt.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function dr(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (Et(t), dr(t));
}
function fr(e) {
	if (e.v === Ce) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Kt.has(t) || t.f & 2 && fr(t)) return !0;
	return !1;
}
function pr(e) {
	var t = Wn;
	try {
		return Wn = !0, e();
	} finally {
		Wn = t;
	}
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var mr = ["touchstart", "touchmove"];
function hr(e) {
	return mr.includes(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
var gr = Symbol("events"), _r = /* @__PURE__ */ new Set(), vr = /* @__PURE__ */ new Set();
function yr(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || Cr.call(t, e), !e.cancelBubble) return ct(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Je(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function W(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = yr(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && bn(() => {
		t.removeEventListener(e, o, a);
	});
}
function G(e, t, n) {
	(t[gr] ??= {})[e] = n;
}
function br(e) {
	for (var t = 0; t < e.length; t++) _r.add(e[t]);
	for (var n of vr) n(e);
}
var xr = null, Sr = !1;
function Cr(e) {
	var t = this, n = t.ownerDocument, r = e.type, a = e.composedPath?.() || [], o = a[0] || e.target;
	xr = e, Sr || (Sr = !0, setTimeout(() => {
		Sr = !1, xr = null;
	}));
	var s = 0, c = xr === e && e[gr];
	if (c) {
		var l = a.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[gr] = t;
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
		var d = V, f = H;
		Gn(null), Kn(null);
		try {
			for (var p, m = []; o !== null && o !== t;) {
				try {
					var h = o[gr]?.[r];
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
			e[gr] = t, delete e.currentTarget, Gn(d), Kn(f);
		}
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/reconciler.js
var wr = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function Tr(e) {
	return wr?.createHTML(e) ?? e;
}
function Er(e) {
	var t = mn("template");
	return t.innerHTML = Tr(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function Dr(e, t) {
	var n = H;
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
		if (A) return Dr(j, null), j;
		i === void 0 && (i = Er(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ un(i)));
		var t = r || an ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ un(t), s = t.lastChild;
			Dr(o, s);
		} else Dr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Or(e, t, n = "svg") {
	var r = !e.startsWith("<!>"), i = !!(t & 1), a = `<${n}>${r ? e : "<!>" + e}</${n}>`, o;
	return () => {
		if (A) return Dr(j, null), j;
		if (!o) {
			var e = /* @__PURE__ */ un(Er(a));
			if (i) for (o = document.createDocumentFragment(); /* @__PURE__ */ un(e);) o.appendChild(/* @__PURE__ */ un(e));
			else o = /* @__PURE__ */ un(e);
		}
		var t = o.cloneNode(!0);
		if (i) {
			var n = /* @__PURE__ */ un(t), r = t.lastChild;
			Dr(n, r);
		} else Dr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function kr(e, t) {
	return /* @__PURE__ */ Or(e, t, "svg");
}
function Ar(e = "") {
	if (!A) {
		var t = ln(e + "");
		return Dr(t, t), t;
	}
	var n = j;
	return n.nodeType === 3 ? hn(n) : (n.before(n = ln()), Ae(n)), Dr(n, n), n;
}
function jr() {
	if (A) return Dr(j, null), j;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = ln();
	return e.append(t, n), Dr(t, n), e;
}
function q(e, t) {
	if (A) {
		var n = H;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = j), je();
	} else e !== null && e.before(t);
}
function Mr() {
	if (A && j && j.nodeType === 8 && j.textContent?.startsWith("$")) {
		let e = j.textContent.substring(1);
		return je(), e;
	}
	return (window.__svelte ??= {}).uid ??= 1, `c${window.__svelte.uid++}`;
}
function J(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[oe] ??= e.nodeValue) && (e[oe] = n, e.nodeValue = `${n}`);
}
function Nr(e, t) {
	return Fr(e, t);
}
var Pr = /* @__PURE__ */ new Map();
function Fr(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	cn();
	var l = void 0, u = Cn(() => {
		var s = n ?? t.appendChild(ln());
		ft(s, { pending: () => {} }, (t) => {
			Ue({});
			var n = Ve;
			if (o && (n.c = o), a && (i.$$events = a), A && Dr(t, null), l = e(t, i) || {}, A && (H.nodes.end = j, j === null || j.nodeType !== 8 || j.data !== "]")) throw Ee(), Se;
			We();
		}, c);
		var u = /* @__PURE__ */ new Set(), d = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!u.has(r)) {
					u.add(r);
					var i = hr(r);
					for (let e of [t, document]) {
						var a = Pr.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), Pr.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, Cr, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return d(r(_r)), vr.add(d), () => {
			for (var e of u) for (let n of [t, document]) {
				var r = Pr.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, Cr), r.delete(e), r.size === 0 && Pr.delete(n)) : r.set(e, i);
			}
			vr.delete(d), s !== n && s.parentNode?.removeChild(s);
		};
	});
	return Ir.set(l, u), l;
}
var Ir = /* @__PURE__ */ new WeakMap();
function Lr(e, t) {
	let n = Ir.get(e);
	return n ? (Ir.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/branches.js
var Rr = class {
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
			if (n) Ln(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (Ln(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
			}
			for (let [t, n] of this.#e) {
				if (this.#e.delete(t), t === e) break;
				let r = this.#n.get(n);
				r && (Mn(r.effect), this.#n.delete(n));
			}
			for (let [e, r] of this.#t) {
				if (e === t || this.#r.has(e)) continue;
				let i = () => {
					if (Array.from(this.#e.values()).includes(e)) {
						var t = document.createDocumentFragment();
						zn(r, t), t.append(ln()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else Mn(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), Fn(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (Mn(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = P, r = pn();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = ln();
				i.append(a), this.#n.set(e, {
					effect: On(() => t(a)),
					fragment: i
				});
			} else this.#t.set(e, On(() => t(this.anchor)));
		}
		if (this.#e.set(n, e), r) {
			for (let [t, r] of this.#t) t === e ? n.unskip_effect(r) : n.skip_effect(r);
			for (let [t, r] of this.#n) t === e ? n.unskip_effect(r.effect) : n.skip_effect(r.effect);
			n.oncommit(this.#a), n.ondiscard(this.#o);
		} else A && (this.anchor = j), this.#a(n);
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
function Y(e, t, n = !1) {
	var r;
	A && (r = j, je());
	var i = new Rr(e), a = n ? S : 0;
	function o(e, t) {
		if (A) {
			var n = Pe(r);
			if (e !== parseInt(n.substring(1))) {
				var a = Ne();
				Ae(a), i.anchor = a, ke(!1), i.ensure(e, t), ke(!0);
				return;
			}
		}
		i.ensure(e, t);
	}
	Dn(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/key.js
var zr = Symbol("NaN");
function Br(e, t, n) {
	A && je();
	var r = new Rr(e), i = !Ge();
	Dn(() => {
		var e = t();
		e !== e && (e = zr), i && typeof e == "object" && e && (e = {}), r.ensure(e, n);
	});
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
function Vr(e, t) {
	return t;
}
function Hr(e, t, n) {
	for (var i = [], a = t.length, o, s = t.length, c = 0; c < a; c++) {
		let n = t[c];
		Fn(n, () => {
			if (o) {
				if (o.pending.delete(n), o.done.add(n), o.pending.size === 0) {
					var t = e.outrogroups;
					Ur(e, r(o.done)), t.delete(o), t.size === 0 && (e.outrogroups = null);
				}
			} else --s;
		}, !1);
	}
	if (s === 0) {
		var l = i.length === 0 && n !== null && e.pending.size === 0;
		if (l) {
			var u = n, d = u.parentNode;
			fn(d), d.append(u), e.items.clear();
		}
		Ur(e, t, !l);
	} else o = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(o);
}
function Ur(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= T, zn(a, document.createDocumentFragment())) : Mn(t[i], n);
	}
}
var Wr;
function X(t, n, i, a, o, s = null) {
	var c = t, l = /* @__PURE__ */ new Map();
	if (n & 4) {
		var u = t;
		c = A ? Ae(/* @__PURE__ */ un(u)) : u.appendChild(ln());
	}
	A && je();
	var d = null, f = /* @__PURE__ */ xt(() => {
		var t = i();
		return e(t) ? t : t == null ? [] : r(t);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, Kr(v, p, c, n, a), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= T, Jr(d, null, c)) : Ln(d) : Fn(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: Dn(() => {
			p = U(f);
			var e = p.length;
			let t = !1;
			A && Pe(c) === "[!" != (e === 0) && (c = Ne(), Ae(c), ke(!1), t = !0);
			for (var r = /* @__PURE__ */ new Set(), u = P, v = pn(), y = 0; y < e; y += 1) {
				A && j.nodeType === 8 && j.data === "]" && (c = j, t = !0, ke(!1));
				var b = p[y], x = a(b, y), S = h ? null : l.get(x);
				S ? (S.v && Xt(S.v, b), S.i && Xt(S.i, y), v && u.unskip_effect(S.e)) : (S = qr(l, h ? c : Wr ??= ln(), b, x, y, o, n, i), h || (S.e.f |= T), l.set(x, S)), r.add(x);
			}
			if (e === 0 && s && !d && (h ? d = On(() => s(c)) : (d = On(() => s(Wr ??= ln())), d.f |= T)), e > r.size && fe("", "", ""), A && e > 0 && Ae(Ne()), !h) {
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
	h = !1, A && (c = j);
}
function Gr(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function Kr(e, t, n, i, a) {
	var o = !!(i & 8), s = t.length, c = e.items, l = Gr(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (o) for (v = 0; v < s; v += 1) h = t[v], g = a(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = a(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (Ln(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= T, _ === l) Jr(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), Yr(e, d, _), Yr(e, _, y), Jr(_, y, n), d = _, p = [], m = [], l = Gr(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], C = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) Jr(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					Yr(e, S.prev, C.next), Yr(e, d, S), Yr(e, C, b), l = b, d = C, --v, p = [], m = [];
				} else u.delete(_), Jr(_, l, n), Yr(e, _.prev, _.next), Yr(e, _, d === null ? e.effect.first : d.next), Yr(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = Gr(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = Gr(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (Ur(e, r(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var w = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || w.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && w.push(l), l = Gr(l.next);
		var E = w.length;
		if (E > 0) {
			var D = i & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < E; v += 1) w[v].nodes?.a?.measure();
				for (v = 0; v < E; v += 1) w[v].nodes?.a?.fix();
			}
			Hr(e, w, D);
		}
	}
	o && Je(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function qr(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? Jt(n) : /* @__PURE__ */ Yt(n, !1, !1) : null, l = o & 2 ? Jt(i) : null;
	return {
		v: c,
		i: l,
		e: On(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function Jr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ dn(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function Yr(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function Xr(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") {
		if (Array.isArray(e)) {
			var i = e.length;
			for (t = 0; t < i; t++) e[t] && (n = Xr(e[t])) && (r && (r += " "), r += n);
		} else for (n in e) e[n] && (r && (r += " "), r += n);
	}
	return r;
}
function Zr() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = Xr(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/shared/attributes.js
function Qr(e) {
	return typeof e == "object" ? Zr(e) : e ?? "";
}
var $r = [..." 	\n\r\f\xA0\v﻿"];
function ei(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || $r.includes(r[o - 1])) && (s === r.length || $r.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function ti(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function ni(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function ri(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\/\*.*?\*\//g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(ni)), i && c.push(...Object.keys(i).map(ni));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = ni(e.substring(l, u).trim());
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
		return r && (n += ti(r)), i && (n += ti(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/class.js
function ii(e, t, n, r, i, a) {
	var o = e[ie];
	if (A || o !== n || o === void 0) {
		var s = ei(n, r, a);
		(!A || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[ie] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/style.js
function ai(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function oi(e, t, n, r) {
	var i = e[ae];
	if (A || i !== t) {
		var a = ri(t, r);
		(!A || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[ae] = t;
	} else r && (Array.isArray(r) ? (ai(e, n?.[0], r[0]), ai(e, n?.[1], r[1], "important")) : ai(e, n, r));
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function si(t, n, r = !1) {
	if (t.multiple) {
		if (n == null) return;
		if (!e(n)) return De();
		for (var i of t.options) i.selected = n.includes(ui(i));
	} else {
		for (i of t.options) if (nn(ui(i), n)) {
			i.selected = !0;
			return;
		}
		(!r || n !== void 0) && (t.selectedIndex = -1);
	}
}
function ci(e) {
	var t = new MutationObserver(() => {
		"__value" in e && si(e, e.__value);
	});
	t.observe(e, {
		childList: !0,
		subtree: !0,
		attributes: !0,
		attributeFilter: ["value"]
	}), bn(() => {
		t.disconnect();
	});
}
function li(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet(), i = !0;
	lt(e, "change", (t) => {
		var i = t ? "[selected]" : ":checked", a;
		if (e.multiple) a = [].map.call(e.querySelectorAll(i), ui);
		else {
			var o = e.querySelector(i) ?? e.querySelector("option:not([disabled])");
			a = o && ui(o);
		}
		n(a), e.__value = a, P !== null && r.add(P);
	}), wn(() => {
		var a = t();
		if (e === document.activeElement) {
			var o = P;
			if (r.has(o)) return;
		}
		if (si(e, a, i), i && a === void 0) {
			var s = e.querySelector(":checked");
			s !== null && (a = ui(s), n(a));
		}
		e.__value = a, i = !1;
	}), ci(e);
}
function ui(e) {
	return "__value" in e ? e.__value : e.value;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var di = Symbol("is custom element"), fi = Symbol("is html"), pi = le ? "link" : "LINK", mi = le ? "progress" : "PROGRESS";
function Z(e) {
	if (A) {
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
		e[se] = n, Je(n), st();
	}
}
function hi(e, t) {
	var n = _i(e);
	n.value !== (n.value = t ?? void 0) && (e.value !== t || t === 0 && e.nodeName === mi) && (e.value = t ?? "");
}
function gi(e, t) {
	var n = _i(e);
	n.checked !== (n.checked = t ?? void 0) && (e.checked = t);
}
function Q(e, t, n, r) {
	var i = _i(e);
	A && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === pi) || i[t] !== (i[t] = n) && (t === "loading" && (e[ne] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && yi(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function _i(e) {
	return e[re] ??= {
		[di]: e.nodeName.includes("-"),
		[fi]: e.namespaceURI === we
	};
}
var vi = /* @__PURE__ */ new Map();
function yi(e) {
	var t = e.getAttribute("is") || e.nodeName, n = vi.get(t);
	if (n) return n;
	vi.set(t, n = []);
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var s in r = o(i), r) r[s].set && s !== "innerHTML" && s !== "textContent" && s !== "innerText" && n.push(s);
		i = l(i);
	}
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function bi(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet();
	lt(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = xi(e) ? Si(a) : a, n(a), P !== null && r.add(P), await ur(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (A && e.defaultValue !== e.value || pr(t) == null && e.value) && (n(xi(e) ? Si(e.value) : e.value), P !== null && r.add(P)), En(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = P;
			if (r.has(i)) return;
		}
		xi(e) && n === Si(e.value) || (e.type !== "date" || n || e.value) && n !== e.value && (e.value = n ?? "");
	});
}
function xi(e) {
	var t = e.type;
	return t === "number" || t === "range";
}
function Si(e) {
	return e === "" ? null : +e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function Ci(e, t) {
	return e === t || e?.[k] === t;
}
function $(e = {}, t, n, r) {
	var i = Ve.r, a = H;
	return wn(() => {
		var o, s;
		return En(() => {
			o = s, s = r?.() || [], pr(() => {
				Ci(n(...s), e) || (t(e, ...s), o && Ci(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && Ci(n(...s), e) && t(null, ...s);
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
	var i = !0, o = !!(n & 8), s = !!(n & 16), c = r, l = !0, u = void 0, d = () => s && i ? (u ??= /* @__PURE__ */ vt(r), U(u)) : (l && (l = !1, c = s ? pr(r) : r), c);
	let f;
	if (o) {
		var p = k in e || te in e;
		f = a(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	o ? [m, h] = it(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && _e(t), f(m)));
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
	var b = H;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? U(y) : i && o ? en(e) : e;
			return I(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return Hn && v || b.f & 16384 ? y.v : U(y);
	});
}
function Ti(e) {
	Ve === null && ue("onMount"), xn(() => {
		let t = pr(e);
		if (typeof t == "function") return t;
	});
}
function Ei(e) {
	Ve === null && ue("onDestroy"), Ti(() => () => pr(e));
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region ui/NodeCard.svelte
var Di = /* @__PURE__ */ K("<span class=\"pc-modifier-badge svelte-1jilz27\"> </span>"), Oi = /* @__PURE__ */ K("<div><span class=\"pc-native-pin-label\"> </span> <div role=\"img\"></div></div>"), ki = /* @__PURE__ */ K("<div class=\"pc-node-body\"> </div>"), Ai = /* @__PURE__ */ K("<span class=\"pc-native-alias\"> </span>"), ji = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-node-action pc-host-result\" aria-label=\"Preview host result\"><i class=\"fa-solid fa-eye\" aria-hidden=\"true\"></i> Host result</button>"), Mi = /* @__PURE__ */ K("<div role=\"group\" tabindex=\"0\"><div class=\"pc-native-heading\"><svg class=\"pc-native-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path></path></svg><span class=\"pc-node-title\"> </span><!></div> <div class=\"pc-native-pins\"></div> <!> <!> <!></div>");
function Ni(e, t) {
	Ue(t, !0);
	let n = (e) => e.stopPropagation();
	var r = Mi();
	let i;
	var a = L(r), o = L(a), s = L(o);
	M(o);
	var c = z(o), l = L(c, !0);
	M(c);
	var u = z(c), d = (e) => {
		var n = Di(), r = L(n);
		M(n), B(() => {
			Q(n, "title", t.card.modifierSummary.text), Q(n, "aria-label", t.card.modifierSummary.text), J(r, `+${t.card.modifierSummary.count ?? ""}`);
		}), q(e, n);
	};
	Y(u, (e) => {
		t.card.modifierSummary && e(d);
	}), M(a);
	var f = z(a, 2);
	X(f, 21, () => t.card.ports, (e) => e.id, (e, n) => {
		var r = Oi();
		let i;
		var a = L(r), o = L(a, !0);
		M(a);
		var s = z(a, 2);
		M(r), B(() => {
			ii(r, 1, `pc-native-row pc-native-row-${U(n).dir}`, "svelte-1jilz27"), i = oi(r, "", i, { "grid-row": U(n).row }), J(o, U(n).label), ii(s, 1, Qr(U(n).className), "svelte-1jilz27"), Q(s, "data-node", t.card.id), Q(s, "data-dir", U(n).dir), Q(s, "data-port", U(n).port), Q(s, "data-side", U(n).side), Q(s, "data-kind", U(n).kind), Q(s, "title", U(n).title), Q(s, "aria-label", U(n).title);
		}), W("mouseenter", s, () => t.actions.hoverPin({
			nodeId: t.card.id,
			dir: U(n).dir,
			port: U(n).port
		})), W("mouseleave", s, () => t.actions.hoverPin(null)), q(e, r);
	}), M(f);
	var p = z(f, 2), m = (e) => {
		var n = ki(), r = L(n, !0);
		M(n), B(() => J(r, t.card.body)), q(e, n);
	};
	Y(p, (e) => {
		t.card.type === "note" && e(m);
	});
	var h = z(p, 2), g = (e) => {
		var n = Ai(), r = L(n, !0);
		M(n), B(() => {
			Q(n, "title", t.card.titleHint), J(r, t.card.title);
		}), q(e, n);
	};
	Y(h, (e) => {
		t.card.compact && e(g);
	});
	var _ = z(h, 2), v = (e) => {
		var r = ji();
		G("mousedown", r, n), G("click", r, (e) => {
			n(e), t.actions.hostResult(t.card.id);
		}), q(e, r);
	};
	Y(_, (e) => {
		t.card.hostResult && e(v);
	}), M(r), B(() => {
		ii(r, 1, Qr(t.card.className), "svelte-1jilz27"), Q(r, "data-id", t.card.id), Q(r, "title", t.card.offHint), Q(r, "aria-label", `${t.card.label}: ${t.card.title}`), i = oi(r, "", i, {
			left: `${t.card.x}px`,
			top: `${t.card.y}px`
		}), Q(s, "d", t.card.iconPath), Q(c, "title", t.card.titleHint), J(l, t.card.title);
	}), q(e, r), We();
}
br(["mousedown", "click"]);
//#endregion
//#region ui/GroupCard.svelte
var Pi = /* @__PURE__ */ K("<div class=\"pc-node-body\"> </div>"), Fi = /* @__PURE__ */ K("<div role=\"group\"><div><i class=\"fa-solid fa-object-group\" aria-hidden=\"true\"></i> <span> </span> <span class=\"pc-group-frame-count\"> </span> <button type=\"button\"></button></div> <!></div>");
function Ii(e, t) {
	Ue(t, !0);
	function n(e, n) {
		e.stopPropagation(), e.preventDefault(), t.actions.group(t.group.id, n);
	}
	function r(e, n) {
		e.stopPropagation(), e.detail === 0 && t.actions.group(t.group.id, n);
	}
	var i = Fi();
	let a;
	var o = L(i), s = z(L(o), 2), c = L(s, !0);
	M(s);
	var l = z(s, 2), u = L(l, !0);
	M(l);
	var d = z(l, 2);
	M(o);
	var f = z(o, 2), p = (e) => {
		var n = Pi(), r = L(n, !0);
		M(n), B(() => J(r, t.group.body)), q(e, n);
	};
	Y(f, (e) => {
		t.group.collapsed && e(p);
	}), M(i), B(() => {
		ii(i, 1, Qr(t.group.className)), Q(i, "data-group", t.group.id), Q(i, "aria-label", `Group: ${t.group.title}`), a = oi(i, "", a, {
			left: `${t.group.x}px`,
			top: `${t.group.y}px`,
			width: `${t.group.w}px`,
			height: t.group.collapsed ? void 0 : `${t.group.h}px`
		}), ii(o, 1, Qr(t.group.collapsed ? "pc-node-head" : "pc-group-frame-head")), ii(s, 1, Qr(t.group.collapsed ? "pc-node-title" : "pc-group-frame-title")), J(c, t.group.title), J(u, t.group.count), ii(d, 1, `pc-node-action fa-solid pc-group-btn ${t.group.collapsed ? "fa-up-right-and-down-left-from-center" : "fa-down-left-and-up-right-to-center"}`), Q(d, "data-action", t.group.collapsed ? "open" : "collapse"), Q(d, "title", t.group.collapsed ? "Open group" : "Fold group"), Q(d, "aria-label", t.group.collapsed ? "Open group" : "Fold group");
	}), G("mousedown", d, (e) => n(e, t.group.collapsed ? "open" : "collapse")), G("click", d, (e) => r(e, t.group.collapsed ? "open" : "collapse")), q(e, i), We();
}
br(["mousedown", "click"]);
//#endregion
//#region ui/WireLayer.svelte
var Li = /* @__PURE__ */ kr("<path class=\"pc-wire-hit\"></path><path><title> </title></path><text text-anchor=\"middle\"> </text>", 1), Ri = /* @__PURE__ */ kr("<path></path>"), zi = /* @__PURE__ */ kr("<!><!>", 1);
function Bi(e, t) {
	Ue(t, !0);
	var n = zi(), r = R(n);
	X(r, 17, () => t.wires, (e) => e.id, (e, t) => {
		var n = Li(), r = R(n), i = z(r), a = L(i), o = L(a);
		M(a), M(i);
		var s = z(i), c = L(s, !0);
		M(s), B(() => {
			Q(r, "d", U(t).d), Q(r, "data-id", U(t).id), Q(i, "d", U(t).d), ii(i, 0, Qr(U(t).className)), Q(i, "data-id", U(t).id), Q(i, "data-kind", U(t).kind), J(o, `${U(t).kind ?? ""} artifact`), Q(s, "x", U(t).label.x), Q(s, "y", U(t).label.y), ii(s, 0, Qr(U(t).label.className)), J(c, U(t).label.text);
		}), q(e, n);
	});
	var i = z(r), a = (e) => {
		var n = Ri();
		B(() => {
			Q(n, "d", t.ghost.d), ii(n, 0, Qr(t.ghost.className));
		}), q(e, n);
	};
	Y(i, (e) => {
		t.ghost && e(a);
	}), q(e, n), We();
}
//#endregion
//#region ui/CommentFrame.svelte
var Vi = /* @__PURE__ */ K("<span class=\"pc-comment-title svelte-118xm2r\"> </span>"), Hi = /* @__PURE__ */ K("<input class=\"pc-comment-title-input svelte-118xm2r\" aria-label=\"Comment title\"/>"), Ui = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-comment-resize svelte-118xm2r\" title=\"Drag to resize comment\"></button>"), Wi = /* @__PURE__ */ K("<div role=\"group\"><header class=\"pc-comment-header svelte-118xm2r\"><button type=\"button\" class=\"pc-comment-select svelte-118xm2r\" title=\"Drag header to move comment\">⋮⋮</button> <!></header> <div class=\"pc-comment-notes svelte-118xm2r\"> </div> <!></div>");
function Gi(e, t) {
	Ue(t, !0);
	let n = (e) => e.stopPropagation();
	var r = Wi();
	let i, a;
	var o = L(r), s = L(o), c = z(s, 2), l = (e) => {
		var n = Vi(), r = L(n, !0);
		M(n), B(() => J(r, t.comment.title)), q(e, n);
	}, u = (e) => {
		var r = Hi();
		Z(r), B(() => hi(r, t.comment.title)), W("focus", r, () => t.actions.select(t.comment.id)), W("pointerdown", r, n, !0), W("mousedown", r, n, !0), W("click", r, n, !0), W("keydown", r, n, !0), G("change", r, (e) => {
			t.comment.readOnly || t.actions.update(t.comment.id, { title: e.currentTarget.value });
		}), q(e, r);
	};
	Y(c, (e) => {
		t.comment.readOnly ? e(l) : e(u, -1);
	}), M(o);
	var d = z(o, 2), f = L(d, !0);
	M(d);
	var p = z(d, 2), m = (e) => {
		var n = Ui();
		B(() => Q(n, "aria-label", `Resize comment: ${t.comment.title}`)), G("click", n, (e) => {
			e.detail === 0 && t.actions.select(t.comment.id);
		}), q(e, n);
	};
	Y(p, (e) => {
		t.comment.readOnly || e(m);
	}), M(r), B(() => {
		i = ii(r, 1, "pc-comment-frame svelte-118xm2r", null, i, {
			"pc-comment-selected": t.comment.selected,
			"pc-comment-readonly": t.comment.readOnly
		}), Q(r, "data-id", t.comment.id), Q(r, "aria-label", `Comment: ${t.comment.title}`), a = oi(r, "", a, {
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
br(["click", "change"]);
//#endregion
//#region ui/CanvasLayer.svelte
var Ki = /* @__PURE__ */ K("<div class=\"pc-viewport\" data-pc-renderer=\"svelte\"><div class=\"pc-comment-layer svelte-o7b704\"></div> <svg class=\"pc-wires\" aria-label=\"Canvas connections\"><!></svg> <div class=\"pc-nodes\"><!> <!> <!></div></div>");
function qi(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ F([]), r = /* @__PURE__ */ F([]), i = /* @__PURE__ */ F([]), a = /* @__PURE__ */ F([]), o = /* @__PURE__ */ F({
		select() {},
		update() {},
		command() {}
	}), s = /* @__PURE__ */ F(null), c = /* @__PURE__ */ F({
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
		I(a, e), I(o, t);
	}
	function h(e) {
		I(n, e);
	}
	function g(e) {
		I(r, e);
	}
	function _(e, t, n) {
		I(i, e), I(c, t), I(s, n);
	}
	function v(e, t) {
		let i = new Map(e.map((e) => [e.id, e])), o = new Map(t.map((e) => [e.id, e]));
		I(n, U(n).map((e) => i.has(e.id) ? {
			...e,
			...i.get(e.id)
		} : e)), I(a, U(a).map((e) => i.has(e.id) ? {
			...e,
			...i.get(e.id)
		} : e)), I(r, U(r).map((e) => o.has(e.id) ? {
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
	}, b = Ki(), x = L(b);
	X(x, 21, () => U(a), (e) => e.id, (e, t) => {
		Gi(e, {
			get comment() {
				return U(t);
			},
			get actions() {
				return U(o);
			}
		});
	}), M(x), $(x, (e) => f = e, () => f);
	var S = z(x, 2);
	Bi(L(S), {
		get wires() {
			return U(i);
		},
		get ghost() {
			return U(s);
		}
	}), M(S), $(S, (e) => u = e, () => u);
	var C = z(S, 2), w = L(C);
	X(w, 17, () => U(r).filter((e) => !e.collapsed), (e) => e.id, (e, n) => {
		Ii(e, {
			get group() {
				return U(n);
			},
			get actions() {
				return t.actions;
			}
		});
	});
	var T = z(w, 2);
	return X(T, 17, () => U(n), (e) => e.id, (e, n) => {
		Ni(e, {
			get card() {
				return U(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), X(z(T, 2), 17, () => U(r).filter((e) => e.collapsed), (e) => e.id, (e, n) => {
		Ii(e, {
			get group() {
				return U(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), M(C), $(C, (e) => d = e, () => d), M(b), $(b, (e) => l = e, () => l), B(() => {
		Q(S, "width", U(c).w), Q(S, "height", U(c).h), Q(S, "viewBox", `0 0 ${U(c).w} ${U(c).h}`);
	}), q(e, b), We(y);
}
//#endregion
//#region ui/WorkspaceMenus.svelte
var Ji = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-flat-menu\" aria-haspopup=\"menu\"> </button>"), Yi = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\"><span> </span><small> </small></button>"), Xi = /* @__PURE__ */ K("<div class=\"pc-workspace-menu-panel\" role=\"menu\" tabindex=\"-1\"></div>"), Zi = /* @__PURE__ */ K("<nav class=\"pc-workspace-menus\" aria-label=\"Workspace menus\"><!> <!></nav>");
function Qi(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ N(() => t.state.rootWorkflow ?? t.state.workflow), r = /* @__PURE__ */ F(""), i, a = /* @__PURE__ */ F(null), o = null, s = /* @__PURE__ */ F(0), c = /* @__PURE__ */ F(0), l = [
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
				u("Workflow setup…", "workflow-setup"),
				u("Workflow examples…", "examples"),
				u("Run workflow", "run-workflow", "", !U(n) || !!U(n)?.busy || !!U(n)?.issues.length),
				u("Stop workflow", "stop-workflow", "", !U(n)?.busy)
			];
			case "Tools": return [u("Theme and colours", "theme"), u("Toggle inspector", "inspector")];
			default: return [u("Workspace guide", "help")];
		}
	}
	function f(e = !1) {
		I(r, ""), e && o?.focus({ preventScroll: !0 });
	}
	async function p(e, t, n = !1) {
		if (U(r) === e && !n) {
			f();
			return;
		}
		I(r, e, !0), o = t, await ur();
		let i = t.getBoundingClientRect(), l = U(a).getBoundingClientRect();
		I(s, Math.max(4, Math.min(i.left, window.innerWidth - l.width - 4)), !0), I(c, i.bottom + 2), n && U(a).querySelector("button:not(:disabled)")?.focus();
	}
	function m(e) {
		f(!0), [
			"workflow-setup",
			"examples",
			"show-preview",
			"collapse-preview",
			"add-node",
			"help"
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
	var g = Zi();
	W("pointerdown", rn, (e) => {
		U(r) && !i.contains(e.target) && !U(a)?.contains(e.target) && f();
	}), W("resize", rn, () => f());
	var _ = L(g);
	X(_, 17, () => l, Vr, (e, t) => {
		var n = Ji(), i = L(n, !0);
		M(n), B(() => {
			Q(n, "data-menu", U(t)), Q(n, "aria-expanded", U(r) === U(t)), J(i, U(t));
		}), G("click", n, (e) => p(U(t), e.currentTarget)), G("keydown", n, h), q(e, n);
	});
	var v = z(_, 2), y = (e) => {
		var t = Xi();
		let n;
		X(t, 21, () => d(U(r)), Vr, (e, t) => {
			var n = Yi(), r = L(n), i = L(r, !0);
			M(r);
			var a = z(r), o = L(a, !0);
			M(a), M(n), B(() => {
				n.disabled = U(t).disabled, J(i, U(t).label), J(o, U(t).shortcut);
			}), G("click", n, () => m(U(t).command)), q(e, n);
		}), M(t), $(t, (e) => I(a, e), () => U(a)), B(() => {
			Q(t, "aria-label", U(r)), n = oi(t, "", n, {
				left: `${U(s)}px`,
				top: `${U(c)}px`
			});
		}), G("keydown", t, h), q(e, t);
	};
	Y(v, (e) => {
		U(r) && e(y);
	}), M(g), $(g, (e) => i = e, () => i), q(e, g), We();
}
br(["click", "keydown"]);
//#endregion
//#region ui/Toolbar.svelte
var $i = /* @__PURE__ */ K("<option> </option>"), ea = /* @__PURE__ */ K("<header class=\"pc-header\" data-pc-ui=\"svelte\"><div class=\"pc-menubar\"><div class=\"pc-brand\"><img width=\"30\" height=\"30\" alt=\"\"/><span>LATTICE</span></div> <!> <button type=\"button\" class=\"pc-btn menu_button pc-close\" title=\"Close\" aria-label=\"Close canvas\">×</button></div> <div class=\"pc-workflow-bar\"><select class=\"pc-select pc-graph-select text_pole\" aria-label=\"Workflow\"></select> <div class=\"pc-header-actions pc-history\"><button type=\"button\" aria-label=\"Undo\">↶</button> <button type=\"button\" aria-label=\"Redo\">↷</button> <span> </span></div> <button type=\"button\" class=\"pc-btn menu_button pc-root-run\"> </button> <span class=\"pc-root-workflow-status\" role=\"status\"> </span> <button type=\"button\" class=\"pc-btn menu_button\" title=\"Workflow setup\">Setup</button> <div class=\"pc-header-actions pc-surface-actions\"><button type=\"button\" title=\"Show or hide the inspector\" aria-label=\"Toggle inspector\">Details</button></div> <label class=\"pc-arm\"><input class=\"pc-arm-input\" type=\"checkbox\"/><span>Arm</span></label></div></header>");
function ta(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ N(() => t.state.rootWorkflow ?? t.state.workflow), r, i, a, o;
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
	}, u = ea(), d = L(u), f = L(d), p = L(f);
	Me(), M(f);
	var m = z(f, 2);
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
	var h = z(m, 2);
	M(d);
	var g = z(d, 2), _ = L(g);
	X(_, 21, () => t.state.graphs, (e) => e.id, (e, t) => {
		var n = $i(), r = L(n, !0);
		M(n);
		var i = {};
		B(() => {
			J(r, U(t).name), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
		}), q(e, n);
	}), M(_), $(_, (e) => i = e, () => i);
	var v;
	ci(_);
	var y = z(_, 2), b = L(y), x = z(b, 2), S = z(x, 2), C = L(S, !0);
	M(S), M(y);
	var w = z(y, 2), T = L(w, !0);
	M(w);
	var E = z(w, 2), D = L(E);
	M(E);
	var O = z(E, 2), ee = z(O, 2), k = L(ee);
	$(k, (e) => o = e, () => o), M(ee);
	var te = z(ee, 2), ne = L(te);
	return Z(ne), $(ne, (e) => a = e, () => a), Me(), M(te), M(g), M(u), $(u, (e) => r = e, () => r), B((e) => {
		Q(p, "src", t.actions.logoUrl), v !== (v = t.state.graphId) && (_.value = (_.__value = t.state.graphId) ?? "", si(_, t.state.graphId)), ii(b, 1, `pc-btn menu_button pc-undo${t.state.history.undo ? "" : " pc-disabled"}`), b.disabled = !t.state.history.undo, Q(b, "title", t.state.history.undoTitle), ii(x, 1, `pc-btn menu_button pc-redo${t.state.history.redo ? "" : " pc-disabled"}`), x.disabled = !t.state.history.redo, Q(x, "title", t.state.history.redoTitle), ii(S, 1, `pc-history-note${t.state.history.showNote ? " pc-show" : ""}`), J(C, t.state.history.note), w.disabled = !U(n) || !U(n).busy && !!U(n).issues.length, Q(w, "title", e), J(T, U(n)?.busy ? "■ Stop" : "▶ Run"), J(D, `${U(n) ? `${U(n).phase} · ${U(n).assigned ? "Assigned" : "Unassigned"} · ≤ ${U(n).callBound} requests` : "Workflow unavailable"} · Autosave in SillyTavern`), ii(k, 1, `pc-btn menu_button pc-pane-toggle${t.state.inspectorOpen ? " pc-on" : ""}`), Q(k, "aria-pressed", t.state.inspectorOpen), gi(ne, t.state.armed);
	}, [() => U(n)?.issues.join("\n") || "Run the root workflow"]), G("click", h, () => t.actions.command("close")), G("change", _, (e) => t.actions.pickGraph(e.currentTarget.value)), G("click", b, () => t.actions.command("undo")), G("click", x, () => t.actions.command("redo")), G("click", w, () => t.actions.command(U(n)?.busy ? "stop-workflow" : "run-workflow")), G("click", O, () => t.local("workflow-setup")), G("click", k, () => t.actions.command("inspector")), G("change", ne, (e) => t.actions.arm(e.currentTarget.checked)), q(e, u), We(l);
}
br(["click", "change"]);
//#endregion
//#region ui/PaneDivider.svelte
var na = /* @__PURE__ */ K("<div class=\"pc-pane-divider\" role=\"separator\" aria-label=\"Resize preview\" aria-orientation=\"horizontal\" tabindex=\"0\"></div>");
function ra(e, t) {
	Ue(t, !0);
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
	W("blur", rn, u), $(f, (e) => i = e, () => i), B((e, t) => {
		Q(f, "aria-valuemin", n()), Q(f, "aria-valuemax", e), Q(f, "aria-valuenow", t);
	}, [() => Math.round(r()), () => Math.round(t.height)]), G("pointerdown", f, s), G("pointermove", f, c), G("pointerup", f, (e) => l(!1, e.pointerId)), W("pointercancel", f, (e) => l(!0, e.pointerId)), W("lostpointercapture", f, (e) => l(!0, e.pointerId)), G("keydown", f, d), q(e, f), We();
}
br([
	"pointerdown",
	"pointermove",
	"pointerup",
	"keydown"
]);
//#endregion
//#region ui/DetailsDivider.svelte
var ia = /* @__PURE__ */ K("<div class=\"pc-details-divider svelte-1iyzcro\" role=\"separator\" aria-label=\"Resize Details\" aria-orientation=\"vertical\" tabindex=\"0\"></div>");
function aa(e, t) {
	Ue(t, !0);
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
	W("blur", rn, c), $(f, (e) => i = e, () => i), B((e, t) => {
		Q(f, "aria-valuemin", n()), Q(f, "aria-valuemax", e), Q(f, "aria-valuenow", t);
	}, [() => Math.round(r()), () => Math.round(t.width)]), G("pointerdown", f, l), G("pointermove", f, u), G("pointerup", f, (e) => s(!1, e.pointerId)), W("pointercancel", f, (e) => s(!0, e.pointerId)), W("lostpointercapture", f, (e) => s(!0, e.pointerId)), G("keydown", f, d), q(e, f), We();
}
br([
	"pointerdown",
	"pointermove",
	"pointerup",
	"keydown"
]);
//#endregion
//#region ui/GraphTabs.svelte
var oa = /* @__PURE__ */ K("<span class=\"pc-graph-tab-lock svelte-7ptwed\" aria-label=\"Read only\">◇</span>"), sa = /* @__PURE__ */ K("<input type=\"text\" title=\"Enter to save, Escape to cancel\"/>"), ca = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-graph-tab-close svelte-7ptwed\">×</button>"), la = /* @__PURE__ */ K("<div><button type=\"button\" role=\"tab\" aria-haspopup=\"menu\"><span class=\"svelte-7ptwed\"> </span><!></button> <!> <!></div>"), ua = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button>"), da = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Save workflow</button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close tab</button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close other tabs</button> <!>", 1), fa = /* @__PURE__ */ K("<!> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close active view</button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close other views</button> <!>", 1), pa = /* @__PURE__ */ K("<div role=\"menu\" tabindex=\"-1\"><!></div>"), ma = /* @__PURE__ */ K("<nav aria-label=\"Open graph views\"><div class=\"pc-graph-tab-list svelte-7ptwed\" role=\"tablist\" aria-label=\"Graph views\"></div> <button type=\"button\" class=\"pc-graph-view-overflow svelte-7ptwed\" aria-label=\"Graph view actions\" title=\"Focus, close or reopen graph views\" aria-haspopup=\"menu\">⋯</button> <!></nav>");
function ha(e, t) {
	Ue(t, !0);
	let n = wi(t, "actions", 19, () => ({})), r = wi(t, "idPrefix", 3, "pc-graph-view"), i = /* @__PURE__ */ F(null), a = /* @__PURE__ */ F(null), o = /* @__PURE__ */ F(null), s = /* @__PURE__ */ F(!1), c = /* @__PURE__ */ F(""), l = /* @__PURE__ */ F(""), u = /* @__PURE__ */ F(0), d = /* @__PURE__ */ F(0), f = "", p = /* @__PURE__ */ F(""), m = /* @__PURE__ */ F(""), h = /* @__PURE__ */ F(null), g = "", _ = null, v = 0, y = /* @__PURE__ */ N(() => t.views?.tabs.find((e) => e.key === U(l))), b = {};
	xn(() => {
		let e = t.views?.active.key ?? "";
		f === e ? t.views && !t.views.tabs.some((e) => e.key === U(c)) && I(c, e, !0) : (I(c, e, !0), O(), I(p, "")), U(l) && !U(y) && O(), U(p) && (t.views?.workflowId !== g || !t.views.tabs.some((e) => e.key === U(p))) && I(p, ""), f = e;
	});
	async function x(e) {
		let r = t.views?.tabs.find((t) => t.key === e);
		if (!r || r.identity.kind === "library" || !n().renameView || n().canRenameView?.(e) === !1) return;
		let i = ++v;
		_ = null, O(), g = t.views.workflowId, I(m, r.label, !0), I(p, e, !0), await ur(), U(p) === e && v === i && (_ = U(h), U(h)?.focus({ preventScroll: !0 }), U(h)?.select());
	}
	async function S(e, r, i = !0) {
		let a = U(p), o = t.views?.tabs.find((e) => e.key === a), s = U(m).trim();
		a && e === _ && (I(p, ""), _ = null, r && o && s && s !== o.label && t.views?.workflowId === g && o.identity.kind !== "library" && n().canRenameView?.(a) !== !1 && n().renameView?.(a, s), i && (await ur(), b[a]?.focus({ preventScroll: !0 })));
	}
	function C(e) {
		e.stopPropagation(), !e.isComposing && (e.key === "Enter" || e.key === "Escape") && (e.preventDefault(), S(e.currentTarget, e.key === "Enter"));
	}
	function w(e) {
		let t = e.breadcrumbs.map((e) => e.label).join(" / ") || e.label, n = e.identity;
		return n.kind === "instance" ? `${t} (${n.instancePath.map((e) => JSON.stringify(e)).join(" → ")})` : n.kind === "library" ? `${t} · Library v${n.definitionRef.version} (${n.definitionRef.id})` : t;
	}
	function T(e) {
		I(c, e, !0), n().focusView?.(e), b[e]?.focus({ preventScroll: !0 });
	}
	function E(e, n) {
		if (t.views && (e.key === "ContextMenu" || e.key === "F10" && e.shiftKey)) {
			e.preventDefault(), e.stopPropagation();
			let r = t.views.tabs[n], i = b[r.key]?.getBoundingClientRect();
			k(r, i?.left ?? 8, i?.bottom ?? 8);
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
		r && t.views?.tabs.some((e) => e.key === r) && (I(c, r, !0), b[r]?.focus({ preventScroll: !0 }));
	}
	function O(e = !1) {
		let t = U(l) ? b[U(l)] : U(o);
		I(s, !1), I(l, ""), e && t?.focus({ preventScroll: !0 });
	}
	function ee(e, t) {
		e.preventDefault(), e.stopPropagation(), k(t, e.clientX, e.clientY);
	}
	async function k(e, t, n) {
		if (I(l, e.key, !0), I(u, t, !0), I(d, n, !0), I(s, !0), await ur(), !U(s) || U(l) !== e.key) return;
		let r = U(a)?.getBoundingClientRect();
		I(u, Math.min(Math.max(8, t), Math.max(8, window.innerWidth - (r?.width ?? 0) - 8)), !0), I(d, Math.min(Math.max(8, n), Math.max(8, window.innerHeight - (r?.height ?? 0) - 8)), !0), U(a)?.querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
	}
	async function te() {
		let e = !!U(l);
		I(l, ""), I(s, e || !U(s), !0), U(s) && (await ur(), U(s) && U(a)?.querySelector("button:not(:disabled)")?.focus());
	}
	function ne(e) {
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
	function re(e) {
		O(!0), e();
	}
	function ie(e) {
		let t = U(y);
		t && (O(!0), e(t));
	}
	var ae = { startRename: x }, oe = jr();
	W("pointerdown", rn, (e) => {
		U(s) && !U(a)?.contains(e.target) && e.target !== U(o) && O();
	}), W("resize", rn, () => O());
	var se = R(oe), ce = (e) => {
		var f = ma();
		let g;
		var _ = L(f);
		X(_, 23, () => t.views.tabs, (e) => e.key, (e, n, i) => {
			var a = la();
			let o;
			var u = L(a);
			let d;
			var f = L(u), g = L(f, !0);
			M(f);
			var _ = z(f), v = (e) => {
				q(e, oa());
			};
			Y(_, (e) => {
				U(n).readOnly && e(v);
			}), M(u), $(u, (e, t) => b[t.key] = e, (e) => b?.[e.key], () => [U(n)]);
			var y = z(u, 2), x = (e) => {
				var t = sa();
				Z(t);
				let r;
				$(t, (e) => I(h, e), () => U(h)), B(() => {
					r = ii(t, 1, "pc-graph-tab-rename svelte-7ptwed", null, r, { "pc-graph-tab-closeable": U(n).identity.kind !== "root" }), Q(t, "aria-label", U(n).identity.kind === "root" ? "Graph name" : "Subgraph name"), Q(t, "maxlength", U(n).identity.kind === "instance" ? 80 : void 0);
				}), G("keydown", t, C), W("blur", t, (e) => S(e.currentTarget, !0, !1)), bi(t, () => U(m), (e) => I(m, e)), q(e, t);
			};
			Y(y, (e) => {
				U(p) === U(n).key && e(x);
			});
			var O = z(y, 2), k = (e) => {
				var r = ca();
				B((e, i) => {
					Q(r, "aria-label", e), Q(r, "title", i), Q(r, "tabindex", U(n).key === (U(c) || t.views.active.key) ? 0 : -1);
				}, [() => `Close ${U(n).label} · ${w(U(n))}`, () => `Close ${w(U(n))}`]), G("click", r, () => D(U(n))), G("contextmenu", r, (e) => ee(e, U(n))), G("keydown", r, (e) => E(e, U(i))), q(e, r);
			};
			Y(O, (e) => {
				U(n).identity.kind !== "root" && e(k);
			}), M(a), B((e) => {
				o = ii(a, 1, "pc-graph-tab-item svelte-7ptwed", null, o, {
					"pc-graph-tab-active": U(n).key === t.views.active.key,
					"pc-graph-tab-editing": U(p) === U(n).key
				}), d = ii(u, 1, "pc-graph-tab svelte-7ptwed", null, d, { "pc-graph-tab-closeable": U(n).identity.kind !== "root" }), Q(u, "id", `${r()}-${U(i)}`), Q(u, "aria-controls", t.panelId), Q(u, "aria-selected", U(n).key === t.views.active.key), Q(u, "aria-expanded", U(s) && U(l) === U(n).key), Q(u, "tabindex", U(p) !== U(n).key && U(n).key === (U(c) || t.views.active.key) ? 0 : -1), Q(u, "title", e), J(g, U(n).label);
			}, [() => w(U(n))]), G("click", u, () => T(U(n).key)), G("pointerdown", u, (e) => {
				e.button === 2 && e.preventDefault();
			}), G("contextmenu", u, (e) => ee(e, U(n))), G("keydown", u, (e) => E(e, U(i))), q(e, a);
		}), M(_);
		var v = z(_, 2);
		$(v, (e) => I(o, e), () => U(o));
		var O = z(v, 2), k = (e) => {
			var r = pa();
			let i;
			var o = L(r), s = (e) => {
				let r = /* @__PURE__ */ N(() => U(y)), i = /* @__PURE__ */ N(() => n().canRenameView?.(U(r).key) === !1);
				var a = da(), o = R(a), s = z(o, 2), c = L(s, !0);
				M(s);
				var l = z(s, 2), u = L(l, !0);
				M(l);
				var d = z(l, 2), f = z(d, 2);
				X(z(f, 2), 17, () => t.views.closedViews, (e) => e.key, (e, t) => {
					var r = ua(), i = L(r);
					M(r), B((e, a) => {
						r.disabled = !n().reopenView, Q(r, "title", e), J(i, `Reopen ${U(t).label ?? ""} · ${a ?? ""}`);
					}, [() => w(U(t)), () => w(U(t))]), G("click", r, () => re(() => n().reopenView?.(U(t).key))), q(e, r);
				}), B((e) => {
					o.disabled = !n().saveView, s.disabled = !n().exportView, J(c, U(r).identity.kind === "root" ? "Export workflow JSON" : "Export subgraph JSON"), l.disabled = U(r).identity.kind === "library" || U(i) || !n().renameView, Q(l, "title", U(r).identity.kind === "library" ? "Library inspection is read only." : U(i) ? "Make a local copy of the containing graph to rename this subgraph." : void 0), J(u, U(r).identity.kind === "root" ? "Rename graph" : "Rename subgraph"), d.disabled = U(r).identity.kind === "root" || !n().closeView, f.disabled = e;
				}, [() => t.views.tabs.every((e) => e.identity.kind === "root" || e.key === U(r).key) || !n().closeOtherViews]), G("click", o, () => ie((e) => n().saveView?.(e.key))), G("click", s, () => ie((e) => n().exportView?.(e.key))), G("click", l, () => ie((e) => x(e.key))), G("click", d, () => ie((e) => D(e))), G("click", f, () => ie((e) => n().closeOtherViews?.(e.key))), q(e, a);
			}, c = (e) => {
				var r = fa(), i = R(r);
				X(i, 17, () => t.views.tabs, (e) => e.key, (e, t) => {
					var n = ua(), r = L(n);
					M(n), B((e, t) => {
						Q(n, "title", e), J(r, `Focus ${t ?? ""}`);
					}, [() => w(U(t)), () => w(U(t))]), G("click", n, () => re(() => T(U(t).key))), q(e, n);
				});
				var a = z(i, 2), o = z(a, 2);
				X(z(o, 2), 17, () => t.views.closedViews, (e) => e.key, (e, t) => {
					var r = ua(), i = L(r);
					M(r), B((e, n) => {
						Q(r, "title", e), J(i, `Reopen ${U(t).label ?? ""} · ${n ?? ""}`);
					}, [() => w(U(t)), () => w(U(t))]), G("click", r, () => re(() => n().reopenView?.(U(t).key))), q(e, r);
				}), B((e) => {
					a.disabled = t.views.active.identity.kind === "root" || !n().closeView, o.disabled = e;
				}, [() => t.views.tabs.every((e) => e.identity.kind === "root" || e.key === t.views.active.key) || !n().closeOtherViews]), G("click", a, () => re(() => D(t.views.active))), G("click", o, () => re(() => n().closeOtherViews?.(t.views.active.key))), q(e, r);
			};
			Y(o, (e) => {
				U(y) ? e(s) : e(c, -1);
			}), M(r), $(r, (e) => I(a, e), () => U(a)), B(() => {
				i = ii(r, 1, "pc-graph-view-menu svelte-7ptwed", null, i, { "pc-graph-tab-menu": !!U(l) }), oi(r, U(l) ? `left: ${U(u)}px; top: ${U(d)}px;` : void 0), Q(r, "aria-label", U(y) ? `Actions for ${U(y).label}` : "Graph view actions");
			}), G("keydown", r, ne), q(e, r);
		};
		Y(O, (e) => {
			U(s) && e(k);
		}), M(f), $(f, (e) => I(i, e), () => U(i)), B(() => {
			g = ii(f, 1, "pc-graph-tabs pc-graph-tabs-multi svelte-7ptwed", null, g, { "pc-graph-tabs-menu-open": U(s) }), Q(v, "aria-expanded", U(s) && !U(l));
		}), G("click", v, te), q(e, f);
	};
	return Y(se, (e) => {
		t.views && e(ce);
	}), q(e, oe), We(ae);
}
br([
	"click",
	"pointerdown",
	"contextmenu",
	"keydown"
]);
//#endregion
//#region ui/GraphBreadcrumbs.svelte
var ga = /* @__PURE__ */ K("<span aria-current=\"page\" class=\"svelte-18ovafz\"> </span>"), _a = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-18ovafz\"> </button>"), va = /* @__PURE__ */ K("<li class=\"svelte-18ovafz\"><!></li>"), ya = /* @__PURE__ */ K("<div class=\"pc-graph-location svelte-18ovafz\"><nav aria-label=\"Graph location\" class=\"svelte-18ovafz\"><ol class=\"svelte-18ovafz\"></ol></nav> <span class=\"pc-graph-scope svelte-18ovafz\"> <!><!></span></div>");
function ba(e, t) {
	Ue(t, !0);
	let n = wi(t, "actions", 19, () => ({})), r = /* @__PURE__ */ N(() => t.view?.identity.kind === "library" ? t.view.identity.definitionRef : t.definitionRef ?? t.view?.definitionRef);
	function i(e) {
		return e.identity.kind === "instance" ? !!n().openInstance : !!n().focusView;
	}
	function a(e) {
		e.identity.kind === "instance" ? n().openInstance?.(e.identity.instancePath) : n().focusView?.(e.key);
	}
	var o = jr(), s = R(o), c = (e) => {
		var n = ya(), o = L(n), s = L(o);
		X(s, 23, () => t.view.breadcrumbs, (e) => e.key, (e, n, r) => {
			var o = va(), s = L(o), c = (e) => {
				var t = ga(), r = L(t, !0);
				M(t), B(() => J(r, U(n).label)), q(e, t);
			}, l = (e) => {
				var t = _a(), r = L(t, !0);
				M(t), B((e) => {
					t.disabled = e, J(r, U(n).label);
				}, [() => !i(U(n))]), G("click", t, () => a(U(n))), q(e, t);
			};
			Y(s, (e) => {
				U(r) === t.view.breadcrumbs.length - 1 ? e(c) : e(l, -1);
			}), M(o), q(e, o);
		}), M(s), M(o);
		var c = z(o, 2), l = L(c, !0), u = z(l), d = (e) => {
			var t = Ar();
			B(() => J(t, `· v${U(r).version ?? ""}`)), q(e, t);
		};
		Y(u, (e) => {
			U(r) && e(d);
		});
		var f = z(u), p = (e) => {
			q(e, Ar("· Read only"));
		};
		Y(f, (e) => {
			(t.view.readOnly || t.view.identity.kind === "library") && e(p);
		}), M(c), M(n), B(() => {
			Q(c, "title", U(r) ? `${U(r).id} · v${U(r).version} · ${U(r).semanticHash}` : void 0), J(l, t.view.identity.kind === "library" ? "Library inspection" : "Instance graph");
		}), q(e, n);
	};
	Y(s, (e) => {
		t.view && t.view.identity.kind !== "root" && e(c);
	}), q(e, o), We();
}
br(["click"]);
//#endregion
//#region ui/StructuredControl.svelte
var xa = /* @__PURE__ */ K("<small class=\"svelte-taw2zx\">Rows are available when this JSON has a supported shape.</small>"), Sa = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\"> </label><textarea class=\"pc-structured-raw svelte-taw2zx\" spellcheck=\"false\"></textarea> <!>", 1), Ca = /* @__PURE__ */ K("<option class=\"svelte-taw2zx\"> </option>"), wa = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">Phase</label><select class=\"svelte-taw2zx\"></select> <label class=\"svelte-taw2zx\">Steps</label><input type=\"number\" min=\"1\" max=\"64\" step=\"1\" class=\"svelte-taw2zx\"/>", 1), Ta = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">Name</label><input maxlength=\"128\" class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Value</label><input type=\"number\" step=\"any\" class=\"svelte-taw2zx\"/>", 1), Ea = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">Default (JSON)</label><textarea class=\"svelte-taw2zx\"></textarea>", 1), Da = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">Name</label><input class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Path (JSON array)</label><input class=\"svelte-taw2zx\"/> <label class=\"pc-structured-check svelte-taw2zx\"><input type=\"checkbox\" class=\"svelte-taw2zx\"/> Required</label> <label class=\"pc-structured-check svelte-taw2zx\"><input type=\"checkbox\" class=\"svelte-taw2zx\"/> Use default when missing</label><small class=\"svelte-taw2zx\">Defaults apply when Required is off.</small> <!>", 1), Oa = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">ID</label><input maxlength=\"128\" class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Label</label><input maxlength=\"80\" class=\"svelte-taw2zx\"/>", 1), ka = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">Name</label><input class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Text</label><textarea class=\"svelte-taw2zx\"></textarea>", 1), Aa = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">Kind</label><select class=\"svelte-taw2zx\"><option class=\"svelte-taw2zx\">Literal</option><option class=\"svelte-taw2zx\">Regular expression</option></select> <label class=\"svelte-taw2zx\">Pattern</label><input class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Replacement</label><textarea class=\"svelte-taw2zx\"></textarea> <label class=\"svelte-taw2zx\">Flags</label><input class=\"svelte-taw2zx\"/>", 1), ja = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-taw2zx\">Move up</button><button type=\"button\" class=\"svelte-taw2zx\">Move down</button>", 1), Ma = /* @__PURE__ */ K("<fieldset class=\"pc-structured-row svelte-taw2zx\"><legend class=\"svelte-taw2zx\"> </legend> <!> <div class=\"pc-structured-actions svelte-taw2zx\"><!><button type=\"button\" class=\"svelte-taw2zx\">Remove</button></div></fieldset>"), Na = /* @__PURE__ */ K("<div class=\"pc-structured-rows svelte-taw2zx\"></div> <button type=\"button\" class=\"svelte-taw2zx\"> </button>", 1), Pa = /* @__PURE__ */ K("<div class=\"pc-structured-control svelte-taw2zx\"><div class=\"pc-structured-mode svelte-taw2zx\"><button type=\"button\" class=\"svelte-taw2zx\"> </button></div> <!></div>");
function Fa(e, t) {
	Ue(t, !0);
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
	let c = /* @__PURE__ */ N(() => t.control.structured === "fields" ? "field" : t.control.structured === "sections" ? "section" : t.control.structured === "slots" ? "slot" : t.control.structured === "numeric-map" ? "value" : t.control.structured === "durations" ? "duration" : "rule"), l = /* @__PURE__ */ N(() => t.control.structured === "fields" ? 128 : t.control.structured === "slots" ? 16 : t.control.structured === "numeric-map" ? 32 : t.control.structured === "durations" ? 5 : 64), u = /* @__PURE__ */ N(() => t.control.structured === "slots" ? 2 : 0);
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
	let f = /* @__PURE__ */ N(d), p = /* @__PURE__ */ F(!1), m = /* @__PURE__ */ N(() => U(p) || !U(f));
	function h(e) {
		n() || (I(p, !0), t.ontext(e));
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
			I(p, !0), t.ontext(JSON.stringify(o, null, 2).replace(JSON.stringify(a), () => i));
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
	var E = Pa(), D = L(E), O = L(D), ee = L(O, !0);
	M(O), M(D);
	var k = z(D, 2), te = (e) => {
		var i = Sa(), a = R(i), o = L(a);
		M(a);
		var s = z(a);
		at(s);
		var c = z(s, 2), l = (e) => {
			q(e, xa());
		};
		Y(c, (e) => {
			U(f) || e(l);
		}), B(() => {
			Q(a, "for", t.idPrefix + "-raw"), J(o, `${t.control.label ?? ""} (JSON)`), Q(s, "id", t.idPrefix + "-raw"), Q(s, "aria-label", t.control.label), Q(s, "aria-invalid", !!r()), Q(s, "aria-describedby", r() ? t.idPrefix + "-error" : void 0), hi(s, t.text), s.disabled = n();
		}), G("input", s, (e) => h(e.currentTarget.value)), q(e, i);
	}, ne = (e) => {
		var r = Na(), a = R(r);
		X(a, 21, () => U(f), Vr, (e, r, a) => {
			var o = Ma(), s = L(o), l = L(s);
			M(s);
			var d = z(s, 2), p = (e) => {
				var o = wa(), s = R(o), c = z(s);
				Q(c, "aria-label", "Duration " + (a + 1) + " phase"), X(c, 21, () => i, Vr, (e, t) => {
					var n = Ca(), r = L(n, !0);
					M(n);
					var i = {};
					B((e, a) => {
						n.disabled = e, J(r, a), i !== (i = U(t)) && (n.value = (n.__value = U(t)) ?? "");
					}, [() => U(f).some((e, n) => n !== a && e.name === U(t)), () => U(t)[0].toUpperCase() + U(t).slice(1)]), q(e, n);
				}), M(c);
				var l;
				ci(c);
				var u = z(c, 2), d = z(u);
				Z(d), Q(d, "aria-label", "Duration " + (a + 1) + " steps"), B((e, r) => {
					Q(s, "for", t.idPrefix + "-phase-" + a), Q(c, "id", t.idPrefix + "-phase-" + a), c.disabled = n(), l !== (l = e) && (c.value = (c.__value = e) ?? "", si(c, e)), Q(u, "for", t.idPrefix + "-steps-" + a), Q(d, "id", t.idPrefix + "-steps-" + a), hi(d, r), d.disabled = n();
				}, [() => String(U(r).name), () => Number(U(r).number)]), G("change", c, (e) => x(a, e.currentTarget)), G("change", d, (e) => b(a, e.currentTarget)), q(e, o);
			}, m = (e) => {
				var i = Ta(), o = R(i), s = z(o);
				Z(s), Q(s, "aria-label", "Value " + (a + 1) + " name");
				var c = z(s, 2), l = z(c);
				Z(l), Q(l, "aria-label", "Value " + (a + 1) + " number"), B((e, r) => {
					Q(o, "for", t.idPrefix + "-name-" + a), Q(s, "id", t.idPrefix + "-name-" + a), hi(s, e), s.disabled = n(), Q(c, "for", t.idPrefix + "-number-" + a), Q(l, "id", t.idPrefix + "-number-" + a), hi(l, r), Q(l, "min", t.control.min), Q(l, "max", t.control.max), l.disabled = n();
				}, [() => String(U(r).name), () => Number(U(r).number)]), G("change", s, (e) => x(a, e.currentTarget)), G("change", l, (e) => b(a, e.currentTarget)), q(e, i);
			}, h = (e) => {
				var i = Da(), o = R(i), s = z(o);
				Z(s), Q(s, "aria-label", "Field " + (a + 1) + " name");
				var c = z(s, 2), l = z(c);
				Z(l), Q(l, "aria-label", "Field " + (a + 1) + " path (JSON array)");
				var u = z(l, 2), d = L(u);
				Z(d), Q(d, "aria-label", "Field " + (a + 1) + " required"), Me(), M(u);
				var f = z(u, 2), p = L(f);
				Z(p), Q(p, "aria-label", "Field " + (a + 1) + " use default"), Me(), M(f);
				var m = z(f, 3), h = (e) => {
					var i = Ea(), o = R(i), s = z(o);
					at(s), Q(s, "aria-label", "Field " + (a + 1) + " default (JSON)"), B((e) => {
						Q(o, "for", t.idPrefix + "-default-" + a), Q(s, "id", t.idPrefix + "-default-" + a), hi(s, e), s.disabled = n();
					}, [() => JSON.stringify(U(r).default, null, 2)]), G("change", s, (e) => S(a, "default", e.currentTarget.value)), q(e, i);
				}, g = /* @__PURE__ */ N(() => Object.hasOwn(U(r), "default"));
				Y(m, (e) => {
					U(g) && e(h);
				}), B((e, i, u) => {
					Q(o, "for", t.idPrefix + "-name-" + a), Q(s, "id", t.idPrefix + "-name-" + a), hi(s, e), s.disabled = n(), Q(c, "for", t.idPrefix + "-path-" + a), Q(l, "id", t.idPrefix + "-path-" + a), hi(l, i), l.disabled = n(), gi(d, U(r).required !== !1), d.disabled = n(), gi(p, u), p.disabled = n();
				}, [
					() => String(U(r).name),
					() => JSON.stringify(U(r).path),
					() => Object.hasOwn(U(r), "default")
				]), G("input", s, (e) => v(a, "name", e.currentTarget.value)), G("change", l, (e) => S(a, "path", e.currentTarget.value)), G("change", d, (e) => v(a, "required", e.currentTarget.checked)), G("change", p, (e) => C(a, e.currentTarget.checked)), q(e, i);
			}, g = (e) => {
				var i = Oa(), o = R(i), s = z(o);
				Z(s), Q(s, "aria-label", "Slot " + (a + 1) + " ID");
				var c = z(s, 2), l = z(c);
				Z(l), Q(l, "aria-label", "Slot " + (a + 1) + " label"), B((e, r) => {
					Q(o, "for", t.idPrefix + "-slot-id-" + a), Q(s, "id", t.idPrefix + "-slot-id-" + a), hi(s, e), s.disabled = n(), Q(c, "for", t.idPrefix + "-slot-label-" + a), Q(l, "id", t.idPrefix + "-slot-label-" + a), hi(l, r), l.disabled = n();
				}, [() => String(U(r).id), () => String(U(r).label)]), G("input", s, (e) => v(a, "id", e.currentTarget.value)), G("input", l, (e) => v(a, "label", e.currentTarget.value)), q(e, i);
			}, _ = (e) => {
				var i = ka(), o = R(i), s = z(o);
				Z(s), Q(s, "aria-label", "Section " + (a + 1) + " name");
				var c = z(s, 2), l = z(c);
				at(l), Q(l, "aria-label", "Section " + (a + 1) + " text"), B((e, r) => {
					Q(o, "for", t.idPrefix + "-name-" + a), Q(s, "id", t.idPrefix + "-name-" + a), hi(s, e), s.disabled = n(), Q(c, "for", t.idPrefix + "-text-" + a), Q(l, "id", t.idPrefix + "-text-" + a), hi(l, r), l.disabled = n();
				}, [() => String(U(r).name), () => String(U(r).text)]), G("input", s, (e) => v(a, "name", e.currentTarget.value)), G("input", l, (e) => v(a, "text", e.currentTarget.value)), q(e, i);
			}, y = (e) => {
				var i = Aa(), o = R(i), s = z(o);
				Q(s, "aria-label", "Rule " + (a + 1) + " kind");
				var c = L(s);
				c.value = c.__value = "literal";
				var l = z(c);
				l.value = l.__value = "regex", M(s);
				var u;
				ci(s);
				var d = z(s, 2), f = z(d);
				Z(f), Q(f, "aria-label", "Rule " + (a + 1) + " pattern");
				var p = z(f, 2), m = z(p);
				at(m), Q(m, "aria-label", "Rule " + (a + 1) + " replacement");
				var h = z(m, 2), g = z(h);
				Z(g), Q(g, "aria-label", "Rule " + (a + 1) + " flags"), B((e, r, i, c) => {
					Q(o, "for", t.idPrefix + "-kind-" + a), Q(s, "id", t.idPrefix + "-kind-" + a), s.disabled = n(), u !== (u = e) && (s.value = (s.__value = e) ?? "", si(s, e)), Q(d, "for", t.idPrefix + "-pattern-" + a), Q(f, "id", t.idPrefix + "-pattern-" + a), hi(f, r), f.disabled = n(), Q(p, "for", t.idPrefix + "-replacement-" + a), Q(m, "id", t.idPrefix + "-replacement-" + a), hi(m, i), m.disabled = n(), Q(h, "for", t.idPrefix + "-flags-" + a), Q(g, "id", t.idPrefix + "-flags-" + a), hi(g, c), g.disabled = n();
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
			var E = z(d, 2), D = L(E), O = (e) => {
				var t = ja(), r = R(t), i = z(r);
				B(() => {
					Q(r, "aria-label", "Move " + U(c) + " " + (a + 1) + " up"), r.disabled = n() || a === 0, Q(i, "aria-label", "Move " + U(c) + " " + (a + 1) + " down"), i.disabled = n() || a === U(f).length - 1;
				}), G("click", r, () => T(a, -1)), G("click", i, () => T(a, 1)), q(e, t);
			}, ee = /* @__PURE__ */ N(() => !["numeric-map", "durations"].includes(t.control.structured ?? ""));
			Y(D, (e) => {
				U(ee) && e(O);
			});
			var k = z(D);
			M(E), M(o), B((e) => {
				J(l, `${e ?? ""} ${a + 1}`), Q(k, "aria-label", "Remove " + U(c) + " " + (a + 1)), k.disabled = n() || U(f).length <= U(u);
			}, [() => U(c)[0].toUpperCase() + U(c).slice(1)]), G("click", k, () => w(a)), q(e, o);
		}), M(a);
		var o = z(a, 2), s = L(o);
		M(o), B(() => {
			Q(o, "aria-label", "Add " + U(c)), o.disabled = n() || U(f).length >= U(l), J(s, `Add ${U(c) ?? ""}`);
		}), G("click", o, y), q(e, r);
	};
	Y(k, (e) => {
		U(m) ? e(te) : U(f) && e(ne, 1);
	}), M(E), B(() => {
		Q(E, "data-structured-control", t.control.structured), Q(O, "aria-label", "Edit " + t.control.label + (U(m) ? " as rows" : " as JSON")), O.disabled = n() || U(m) && !U(f), J(ee, U(m) ? "Use rows" : "Edit JSON");
	}), G("click", O, () => {
		!n() && U(f) && I(p, !U(m));
	}), q(e, E), We();
}
br([
	"click",
	"input",
	"change"
]);
//#endregion
//#region ui/DetailControl.svelte
var Ia = /* @__PURE__ */ K("<span class=\"pc-control-label svelte-16a137\"> </span> <!>", 1), La = /* @__PURE__ */ K("<label class=\"pc-detail-check svelte-16a137\"><input type=\"checkbox\" class=\"svelte-16a137\"/> </label>"), Ra = /* @__PURE__ */ K("<label class=\"svelte-16a137\"><input type=\"radio\" class=\"svelte-16a137\"/><span class=\"svelte-16a137\"> </span></label>"), za = /* @__PURE__ */ K("<span class=\"pc-control-label svelte-16a137\"> </span> <div class=\"pc-control-segments svelte-16a137\" role=\"radiogroup\"></div>", 1), Ba = /* @__PURE__ */ K("<option class=\"svelte-16a137\"> </option>"), Va = /* @__PURE__ */ K("<select class=\"svelte-16a137\"></select>"), Ha = /* @__PURE__ */ K("<input type=\"number\" class=\"svelte-16a137\"/>"), Ua = /* @__PURE__ */ K("<textarea class=\"svelte-16a137\"></textarea>"), Wa = /* @__PURE__ */ K("<input type=\"text\" class=\"svelte-16a137\"/>"), Ga = /* @__PURE__ */ K("<label class=\"svelte-16a137\"> </label> <!>", 1), Ka = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-16a137\"> </button>"), qa = /* @__PURE__ */ K("<small class=\"svelte-16a137\"> </small>"), Ja = /* @__PURE__ */ K("<p class=\"pc-detail-error svelte-16a137\" role=\"alert\"> </p>"), Ya = /* @__PURE__ */ K("<div><!> <!> <!> <!> <!></div>");
function Xa(e, t) {
	Ue(t, !0);
	let n = wi(t, "error", 3, ""), r = wi(t, "disabled", 3, !1), i = wi(t, "pending", 3, !1), a = () => t.control.editor === "enum" && (t.control.options?.length ?? 0) > 1 && (t.control.options?.length ?? 0) <= 3 && t.control.options.every((e) => e.label.length <= 10), o = () => t.control.effective !== void 0 && t.control.effective !== t.text && t.control.source !== "Saved setting" ? t.control.source : "";
	var s = Ya();
	let c;
	var l = L(s), u = (e) => {
		var i = Ia(), a = R(i), o = L(a, !0);
		M(a), Fa(z(a, 2), {
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
		}), B(() => J(o, t.control.label)), q(e, i);
	}, d = (e) => {
		var n = La(), i = L(n);
		Z(i);
		var a = z(i, 1, !0);
		M(n), B((e) => {
			Q(i, "aria-label", t.control.label), gi(i, e), i.disabled = r(), J(a, t.control.label);
		}, [() => !!t.control.value]), G("change", i, (e) => {
			r() || t.onvalue(e.currentTarget.checked);
		}), q(e, n);
	}, f = (e) => {
		var n = za(), i = R(n), a = L(i, !0);
		M(i);
		var o = z(i, 2);
		X(o, 21, () => t.control.options ?? [], (e) => e.value, (e, n) => {
			var i = Ra(), a = L(i);
			Z(a);
			var o = z(a), s = L(o, !0);
			M(o), M(i), B((e) => {
				Q(a, "name", t.idPrefix + "-choice"), Q(a, "aria-label", U(n).label), hi(a, U(n).value), gi(a, e), a.disabled = r(), J(s, U(n).label);
			}, [() => String(t.control.value) === U(n).value]), G("change", a, (e) => {
				!r() && e.currentTarget.checked && t.onvalue(U(n).value);
			}), q(e, i);
		}), M(o), B(() => {
			J(a, t.control.label), Q(o, "aria-label", t.control.label);
		}), q(e, n);
	}, p = /* @__PURE__ */ N(() => a()), m = (e) => {
		var i = Ga(), a = R(i), o = L(a, !0);
		M(a);
		var s = z(a, 2), c = (e) => {
			var n = Va();
			X(n, 21, () => t.control.options ?? [], (e) => e.value, (e, t) => {
				var n = Ba(), r = L(n, !0);
				M(n);
				var i = {};
				B(() => {
					J(r, U(t).label), i !== (i = U(t).value) && (n.value = (n.__value = U(t).value) ?? "");
				}), q(e, n);
			}), M(n);
			var i;
			ci(n), B((e) => {
				Q(n, "id", t.idPrefix + "-editor"), Q(n, "aria-label", t.control.label), n.disabled = r(), i !== (i = e) && (n.value = (n.__value = e) ?? "", si(n, e));
			}, [() => String(t.control.value)]), G("change", n, (e) => {
				r() || t.onvalue(e.currentTarget.value);
			}), q(e, n);
		}, l = (e) => {
			var i = Ha();
			Z(i), B((e) => {
				Q(i, "id", t.idPrefix + "-editor"), Q(i, "aria-label", t.control.label), Q(i, "min", t.control.min), Q(i, "max", t.control.max), Q(i, "step", t.control.step ?? 1), Q(i, "aria-invalid", !!n()), Q(i, "aria-describedby", n() ? t.idPrefix + "-error" : void 0), hi(i, e), i.disabled = r();
			}, [() => Number(t.control.value)]), G("change", i, (e) => {
				r() || t.onnumber(e.currentTarget);
			}), q(e, i);
		}, u = (e) => {
			var i = Ua();
			at(i), B(() => {
				Q(i, "id", t.idPrefix + "-editor"), Q(i, "aria-label", t.control.label), Q(i, "aria-invalid", !!n()), Q(i, "aria-describedby", n() ? t.idPrefix + "-error" : void 0), hi(i, t.text), i.disabled = r();
			}), G("input", i, (e) => {
				r() || t.ontext(e.currentTarget.value);
			}), q(e, i);
		}, d = (e) => {
			var n = Wa();
			Z(n), B(() => {
				Q(n, "id", t.idPrefix + "-editor"), Q(n, "aria-label", t.control.label), hi(n, t.text), n.disabled = r();
			}), G("change", n, (e) => {
				r() || t.onvalue(e.currentTarget.value);
			}), q(e, n);
		}, f = /* @__PURE__ */ N(() => t.control.singleLine && t.control.editor === "text" && !t.text.includes("\n") && !t.text.includes("\r")), p = (e) => {
			var n = Ua();
			at(n), B(() => {
				Q(n, "id", t.idPrefix + "-editor"), Q(n, "aria-label", t.control.label), hi(n, t.text), n.disabled = r();
			}), G("change", n, (e) => {
				r() || t.onvalue(e.currentTarget.value);
			}), q(e, n);
		};
		Y(s, (e) => {
			t.control.editor === "enum" ? e(c) : t.control.editor === "number" ? e(l, 1) : t.control.editor === "json" || t.control.editor === "lines" ? e(u, 2) : U(f) ? e(d, 3) : e(p, -1);
		}), B(() => {
			Q(a, "for", t.idPrefix + "-editor"), J(o, t.control.label);
		}), q(e, i);
	};
	Y(l, (e) => {
		t.control.structured && t.control.editor === "json" ? e(u) : t.control.editor === "boolean" ? e(d, 1) : U(p) ? e(f, 2) : e(m, -1);
	});
	var h = z(l, 2), g = (e) => {
		var n = Ka(), a = L(n, !0);
		M(n), B(() => {
			Q(n, "data-save-control", t.control.key), n.disabled = r() || i(), J(a, i() ? "Validating…" : "Save " + t.control.label);
		}), G("click", n, () => {
			!r() && !i() && t.onsave();
		}), q(e, n);
	};
	Y(h, (e) => {
		(t.control.editor === "json" || t.control.editor === "lines") && e(g);
	});
	var _ = z(h, 2), v = (e) => {
		var n = qa(), r = L(n, !0);
		M(n), B(() => J(r, t.control.help)), q(e, n);
	};
	Y(_, (e) => {
		t.control.help && e(v);
	});
	var y = z(_, 2), b = (e) => {
		var n = qa(), r = L(n, !0);
		M(n), B(() => J(r, t.control.exposureNote)), q(e, n);
	}, x = (e) => {
		var n = qa(), r = L(n);
		M(n), B((e) => J(r, `${e ?? ""} · Effective: ${t.control.effective ?? ""}`), [() => o()]), q(e, n);
	}, S = /* @__PURE__ */ N(() => o());
	Y(y, (e) => {
		t.control.exposureNote ? e(b) : U(S) && e(x, 1);
	});
	var C = z(y, 2), w = (e) => {
		var r = Ja(), i = L(r, !0);
		M(r), B(() => {
			Q(r, "id", t.idPrefix + "-error"), J(i, n());
		}), q(e, r);
	};
	Y(C, (e) => {
		n() && e(w);
	}), M(s), B(() => c = ii(s, 1, "pc-detail-control svelte-16a137", null, c, { "pc-control-number": t.control.editor === "number" })), q(e, s), We();
}
br([
	"change",
	"input",
	"click"
]);
//#endregion
//#region ui/ModifierStack.svelte
var Za = /* @__PURE__ */ K("<label class=\"svelte-1ibq9q\"><input type=\"checkbox\" class=\"svelte-1ibq9q\"/> </label>"), Qa = /* @__PURE__ */ K("<option class=\"svelte-1ibq9q\"> </option>"), $a = /* @__PURE__ */ K("<label class=\"pc-modifier-check svelte-1ibq9q\"><input type=\"checkbox\" class=\"svelte-1ibq9q\"/> </label>"), eo = /* @__PURE__ */ K("<select class=\"svelte-1ibq9q\"></select>"), to = /* @__PURE__ */ K("<input type=\"number\" class=\"svelte-1ibq9q\"/>"), no = /* @__PURE__ */ K("<textarea class=\"svelte-1ibq9q\"></textarea>"), ro = /* @__PURE__ */ K("<label class=\"svelte-1ibq9q\"> </label> <!>", 1), io = /* @__PURE__ */ K("<small class=\"svelte-1ibq9q\"> </small>"), ao = /* @__PURE__ */ K("<!> <!>", 1), oo = /* @__PURE__ */ K("<details class=\"svelte-1ibq9q\"><summary class=\"svelte-1ibq9q\"> <!></summary> <!> <button type=\"button\" class=\"svelte-1ibq9q\"> </button></details>"), so = /* @__PURE__ */ K("<p class=\"pc-modifier-error svelte-1ibq9q\" role=\"alert\"> </p>"), co = /* @__PURE__ */ K("<div class=\"pc-modifier-entry svelte-1ibq9q\"><div class=\"pc-modifier-heading svelte-1ibq9q\"><label class=\"svelte-1ibq9q\"><input type=\"checkbox\" class=\"svelte-1ibq9q\"/><span class=\"svelte-1ibq9q\"> <small class=\"svelte-1ibq9q\"> </small></span></label> <div class=\"pc-modifier-order svelte-1ibq9q\"><button type=\"button\" title=\"Move up\" class=\"svelte-1ibq9q\">↑</button> <button type=\"button\" title=\"Move down\" class=\"svelte-1ibq9q\">↓</button> <button type=\"button\" title=\"Remove\" class=\"svelte-1ibq9q\">×</button></div></div> <!> <!></div>"), lo = /* @__PURE__ */ K("<div class=\"pc-modifier-stack svelte-1ibq9q\"><small class=\"svelte-1ibq9q\"> </small> <!></div>"), uo = /* @__PURE__ */ K("<small role=\"status\" class=\"svelte-1ibq9q\">Validating modifiers…</small>"), fo = /* @__PURE__ */ K("<section class=\"pc-modifiers svelte-1ibq9q\" data-modifier-controls=\"\" aria-label=\"Text modifiers\"><div class=\"pc-modifier-quick svelte-1ibq9q\"><!> <select aria-label=\"Add text modifier\" class=\"svelte-1ibq9q\"><option class=\"svelte-1ibq9q\">Add modifier…</option><!></select></div> <!> <!> <!></section>");
function po(e, t) {
	Ue(t, !0);
	let n = (e) => t.options.find((t) => t.type === e.type), r = (e) => n(e)?.label ?? e.type, i = (e) => t.drafts[e.id]?.settings ?? e.settings, a = (e) => t.disabled || t.busy || !t.options.some((t) => t.type === e) || t.items.length >= 16 && !t.items.some((t) => t.type === e);
	var o = fo(), s = L(o), c = L(s);
	X(c, 16, () => ["trim", "wrap"], Vr, (e, n) => {
		var r = Za(), i = L(r);
		Z(i);
		var o = z(i, 1, !0);
		M(r), B((e, t) => {
			Q(i, "aria-label", (n === "trim" ? "Trim" : "Wrap") + " output"), gi(i, e), i.disabled = t, J(o, n === "trim" ? "Trim" : "Wrap");
		}, [() => t.items.some((e) => e.type === n && e.enabled), () => a(n)]), G("change", i, (e) => {
			a(n) || t.onquick(n, e.currentTarget.checked);
		}), q(e, r);
	});
	var l = z(c, 2), u = L(l);
	u.value = u.__value = "", X(z(u), 17, () => t.options.filter((e) => !["trim", "wrap"].includes(e.type)), (e) => e.type, (e, t) => {
		var n = Qa(), r = L(n, !0);
		M(n);
		var i = {};
		B(() => {
			J(r, U(t).label), i !== (i = U(t).type) && (n.value = (n.__value = U(t).type) ?? "");
		}), q(e, n);
	}), M(l), l.value = l.__value = "", M(s);
	var d = z(s, 2), f = (e) => {
		var a = lo(), o = L(a), s = L(o);
		M(o), X(z(o, 2), 19, () => t.items, (e) => e.id, (e, a, o) => {
			let s = /* @__PURE__ */ N(() => n(U(a))), c = /* @__PURE__ */ N(() => r(U(a))), l = /* @__PURE__ */ N(() => t.drafts[U(a).id]);
			var u = co(), d = L(u), f = L(d), p = L(f);
			Z(p);
			var m = z(p), h = L(m), g = z(h), _ = L(g, !0);
			M(g), M(m), M(f);
			var v = z(f, 2), y = L(v), b = z(y, 2), x = z(b, 2);
			M(v), M(d);
			var S = z(d, 2), C = (e) => {
				var n = oo(), r = L(n), o = L(r), u = z(o), d = (e) => {
					q(e, Ar("· Unsaved"));
				};
				Y(u, (e) => {
					U(l)?.dirty && e(d);
				}), M(r);
				var f = z(r, 2);
				X(f, 17, () => U(s).fields, (e) => e.key, (e, n) => {
					let r = /* @__PURE__ */ N(() => t.idPrefix + "-modifier-" + U(a).id + "-" + U(n).key);
					var o = ao(), s = R(o), l = (e) => {
						var o = $a(), s = L(o);
						Z(s);
						var l = z(s, 1, !0);
						M(o), B((e) => {
							Q(s, "id", U(r)), Q(s, "aria-label", U(c) + " " + U(n).label), gi(s, e), s.disabled = t.disabled, J(l, U(n).label);
						}, [() => !!i(U(a))[U(n).key]]), G("change", s, (e) => {
							t.disabled || t.ondraft(U(a).id, U(n).key, e.currentTarget.checked);
						}), q(e, o);
					}, u = (e) => {
						var o = ro(), s = R(o), l = L(s, !0);
						M(s);
						var u = z(s, 2), d = (e) => {
							var o = eo();
							X(o, 21, () => U(n).options ?? [], (e) => e.value, (e, t) => {
								var n = Qa(), r = L(n, !0);
								M(n);
								var i = {};
								B(() => {
									J(r, U(t).label), i !== (i = U(t).value) && (n.value = (n.__value = U(t).value) ?? "");
								}), q(e, n);
							}), M(o);
							var s;
							ci(o), B((e) => {
								Q(o, "id", U(r)), Q(o, "aria-label", U(c) + " " + U(n).label), o.disabled = t.disabled, s !== (s = e) && (o.value = (o.__value = e) ?? "", si(o, e));
							}, [() => String(i(U(a))[U(n).key] ?? "")]), G("change", o, (e) => {
								t.disabled || t.ondraft(U(a).id, U(n).key, e.currentTarget.value);
							}), q(e, o);
						}, f = (e) => {
							var o = to();
							Z(o), B((e) => {
								Q(o, "id", U(r)), Q(o, "aria-label", U(c) + " " + U(n).label), Q(o, "min", U(n).min), Q(o, "max", U(n).max), Q(o, "step", U(n).step ?? 1), hi(o, e), o.disabled = t.disabled;
							}, [() => String(i(U(a))[U(n).key] ?? "")]), G("input", o, (e) => {
								t.disabled || t.ondraft(U(a).id, U(n).key, e.currentTarget.value ? Number(e.currentTarget.value) : null);
							}), q(e, o);
						}, p = (e) => {
							var o = no();
							at(o), B((e) => {
								Q(o, "id", U(r)), Q(o, "aria-label", U(c) + " " + U(n).label), hi(o, e), o.disabled = t.disabled;
							}, [() => String(i(U(a))[U(n).key] ?? "")]), G("input", o, (e) => {
								t.disabled || t.ondraft(U(a).id, U(n).key, e.currentTarget.value);
							}), q(e, o);
						};
						Y(u, (e) => {
							U(n).editor === "enum" ? e(d) : U(n).editor === "number" ? e(f, 1) : e(p, -1);
						}), B(() => {
							Q(s, "for", U(r)), J(l, U(n).label);
						}), q(e, o);
					};
					Y(s, (e) => {
						U(n).editor === "boolean" ? e(l) : e(u, -1);
					});
					var d = z(s, 2), f = (e) => {
						var t = io(), r = L(t, !0);
						M(t), B(() => J(r, U(n).help)), q(e, t);
					};
					Y(d, (e) => {
						U(n).help && e(f);
					}), q(e, o);
				});
				var p = z(f, 2), m = L(p, !0);
				M(p), M(n), B(() => {
					n.open = !!U(l)?.dirty || !!U(l)?.error, J(o, `${U(c) ?? ""} settings`), Q(p, "aria-label", "Save " + U(c) + " settings"), p.disabled = t.disabled || !!U(l)?.pending || !U(l)?.dirty, J(m, U(l)?.pending ? "Validating…" : "Save settings");
				}), G("click", p, () => {
					!t.disabled && !U(l)?.pending && U(l)?.dirty && t.onsave(U(a).id);
				}), q(e, n);
			};
			Y(S, (e) => {
				U(s)?.fields.length && e(C);
			});
			var w = z(S, 2), T = (e) => {
				var t = so(), n = L(t, !0);
				M(t), B(() => J(n, U(l).error)), q(e, t);
			};
			Y(w, (e) => {
				U(l)?.error && e(T);
			}), M(u), B(() => {
				Q(u, "data-modifier-id", U(a).id), Q(u, "data-modifier-state", U(a).enabled ? "active" : "disabled"), Q(p, "aria-label", "Enable " + U(c) + " modifier"), gi(p, U(a).enabled), p.disabled = t.disabled || t.busy, J(h, `${U(o) + 1}. ${U(c) ?? ""}`), J(_, U(a).enabled ? "Active" : "Disabled"), Q(y, "aria-label", "Move " + U(c) + " up"), y.disabled = t.disabled || t.busy || U(o) === 0, Q(b, "aria-label", "Move " + U(c) + " down"), b.disabled = t.disabled || t.busy || U(o) === t.items.length - 1, Q(x, "aria-label", "Remove " + U(c) + " modifier"), x.disabled = t.disabled || t.busy;
			}), G("change", p, (e) => {
				!t.disabled && !t.busy && t.onenable(U(a).id, e.currentTarget.checked);
			}), G("click", y, () => {
				!t.disabled && !t.busy && U(o) > 0 && t.onmove(U(a).id, -1);
			}), G("click", b, () => {
				!t.disabled && !t.busy && U(o) < t.items.length - 1 && t.onmove(U(a).id, 1);
			}), G("click", x, () => {
				!t.disabled && !t.busy && t.onremove(U(a).id);
			}), q(e, u);
		}), M(a), B((e) => J(s, `${e ?? ""} active · ${t.items.length ?? ""} total · Applied in order`), [() => t.items.filter((e) => e.enabled).length]), q(e, a);
	};
	Y(d, (e) => {
		t.items.length && e(f);
	});
	var p = z(d, 2), m = (e) => {
		q(e, uo());
	};
	Y(p, (e) => {
		t.busy && e(m);
	});
	var h = z(p, 2), g = (e) => {
		var n = so(), r = L(n, !0);
		M(n), B(() => J(r, t.error)), q(e, n);
	};
	Y(h, (e) => {
		t.error && e(g);
	}), M(o), B(() => l.disabled = t.disabled || t.busy || t.items.length >= 16), G("change", l, (e) => {
		let n = e.currentTarget.value;
		e.currentTarget.value = "", !t.disabled && !t.busy && t.items.length < 16 && n && t.onadd(n);
	}), q(e, o), We();
}
br([
	"change",
	"click",
	"input"
]);
//#endregion
//#region ui/NodeDetails.svelte
var mo = /* @__PURE__ */ K("<small data-canonical-title=\"\" class=\"svelte-59ntjv\"> </small>"), ho = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-59ntjv\">Duplicate</button>"), go = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-detail-danger svelte-59ntjv\">Delete</button>"), _o = /* @__PURE__ */ K("<details class=\"pc-detail-commands svelte-59ntjv\"><summary aria-label=\"Node commands\" title=\"Node commands\" class=\"svelte-59ntjv\">⋯</summary><div class=\"pc-detail-command-list svelte-59ntjv\"><!> <!></div></details>"), vo = /* @__PURE__ */ K("<span class=\"svelte-59ntjv\">Read-only body</span>"), yo = /* @__PURE__ */ K("<span class=\"pc-detail-blocked svelte-59ntjv\">Blocks run · Disabled</span>"), bo = /* @__PURE__ */ K("<p class=\"pc-detail-state svelte-59ntjv\"><!><!></p>"), xo = /* @__PURE__ */ K("<p class=\"pc-detail-error svelte-59ntjv\" role=\"alert\"> </p>"), So = /* @__PURE__ */ K("<option class=\"svelte-59ntjv\"> </option>"), Co = /* @__PURE__ */ K("<fieldset class=\"pc-detail-group svelte-59ntjv\" data-boundary-controls=\"\"><legend class=\"svelte-59ntjv\"> </legend> <label class=\"svelte-59ntjv\">Type<select aria-label=\"Subgraph port type\" class=\"svelte-59ntjv\"></select></label> <label class=\"pc-detail-check svelte-59ntjv\"><input aria-label=\"Required subgraph port\" type=\"checkbox\" class=\"svelte-59ntjv\"/> Required</label> <div class=\"pc-detail-actions svelte-59ntjv\"><button type=\"button\" data-save-boundary=\"\" class=\"svelte-59ntjv\"> </button></div> <small class=\"svelte-59ntjv\">Labels appear on the subgraph block. Disconnect incompatible connections before changing the type. Deleting this node removes its port and attached connections.</small> <!></fieldset>"), wo = /* @__PURE__ */ K("<p role=\"status\" class=\"svelte-59ntjv\">Loading file…</p>"), To = /* @__PURE__ */ K("<div data-file-input-controls=\"\" class=\"svelte-59ntjv\"><label class=\"svelte-59ntjv\"> <input type=\"file\" accept=\".txt,.md,.json,text/plain,text/markdown,application/json\" class=\"svelte-59ntjv\"/></label> <p class=\"svelte-59ntjv\"> </p> <small class=\"svelte-59ntjv\">The file's UTF-8 text is embedded in this workflow. Runs use the saved snapshot; replace the file to refresh it.</small> <small class=\"svelte-59ntjv\">Choose a .txt, .md or .json file up to 400,000 bytes and 100,000 UTF-16 code units.</small> <!> <!></div>"), Eo = /* @__PURE__ */ K("<details class=\"pc-detail-group svelte-59ntjv\"><summary class=\"svelte-59ntjv\"> </summary> <!></details>"), Do = /* @__PURE__ */ K("<fieldset class=\"pc-detail-group pc-detail-main svelte-59ntjv\" data-operation-controls=\"\"><!> <!></fieldset> <!>", 1), Oo = /* @__PURE__ */ K("<label class=\"svelte-59ntjv\">Connection profile<select aria-label=\"Connection profile\" class=\"svelte-59ntjv\"><option class=\"svelte-59ntjv\">Choose a connection</option><!></select></label>"), ko = /* @__PURE__ */ K("<label class=\"svelte-59ntjv\">Model identifier<input aria-label=\"Model identifier\" class=\"svelte-59ntjv\"/></label>"), Ao = /* @__PURE__ */ K("<small class=\"svelte-59ntjv\"> </small>"), jo = /* @__PURE__ */ K("<details class=\"pc-detail-group svelte-59ntjv\" data-model-controls=\"\"><summary class=\"svelte-59ntjv\"> </summary> <label class=\"svelte-59ntjv\">Model role<input aria-label=\"Model role\" class=\"svelte-59ntjv\"/></label> <label class=\"svelte-59ntjv\">Connection mode<select aria-label=\"Connection mode\" class=\"svelte-59ntjv\"></select></label> <!> <label class=\"svelte-59ntjv\">Model mode<select aria-label=\"Model mode\" class=\"svelte-59ntjv\"></select></label> <!> <!><!> <!> <!></details>"), Mo = /* @__PURE__ */ K("<p class=\"pc-detail-port svelte-59ntjv\"> <small class=\"svelte-59ntjv\"> </small></p>"), No = /* @__PURE__ */ K("<details class=\"pc-detail-group svelte-59ntjv\"><summary class=\"svelte-59ntjv\">Inputs and outputs</summary><!></details>"), Po = /* @__PURE__ */ K("<p role=\"status\" class=\"svelte-59ntjv\"> </p>"), Fo = /* @__PURE__ */ K("<header class=\"svelte-59ntjv\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-59ntjv\"><path class=\"svelte-59ntjv\"></path></svg> <div class=\"pc-detail-identity svelte-59ntjv\"><input class=\"pc-detail-name svelte-59ntjv\" aria-label=\"Node name\"/> <!> <small class=\"svelte-59ntjv\"> </small></div> <!></header> <!> <!> <!> <!> <!> <!> <!> <!> <!>", 1), Io = /* @__PURE__ */ K("<p class=\"pc-detail-empty svelte-59ntjv\">Select a node to inspect its settings.</p>"), Lo = /* @__PURE__ */ K("<section class=\"pc-node-details svelte-59ntjv\" aria-label=\"Node details\"><!></section>");
function Ro(e, t) {
	Ue(t, !0);
	let n = (e, n = d) => {
		{
			let s = /* @__PURE__ */ N(() => U(a)[n().key]?.text ?? ee(n())), c = /* @__PURE__ */ N(() => U(a)[n().key]?.error || U(o)[n().key] || ""), l = /* @__PURE__ */ N(() => !!t.view?.readOnly || !r().editControl), u = /* @__PURE__ */ N(() => !!U(a)[n().key]?.pending), d = /* @__PURE__ */ N(() => i() + "-" + n().key);
			Xa(e, {
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
				ontext: (e) => ie(n(), e),
				onvalue: (e) => oe(n(), e),
				onnumber: (e) => se(n(), e),
				onsave: () => ae(n())
			});
		}
	}, r = wi(t, "actions", 19, () => ({})), i = wi(t, "idPrefix", 3, "pc-node-details"), a = /* @__PURE__ */ F(en({})), o = /* @__PURE__ */ F(en({})), s = "", c = "", l = "", u = 0, f = 0, p = 0, h = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ F(!1), _ = 0, v = 0, y = 0, b = /* @__PURE__ */ new Map(), x = /* @__PURE__ */ new Map(), S = /* @__PURE__ */ new Map(), C = (e) => Object.fromEntries(Object.entries(e).map(([e, t]) => [e, {
		...t,
		pending: !1
	}]));
	function w(e, t) {
		return t ? Object.fromEntries(Object.entries(C(e)).flatMap(([e, n]) => {
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
	}), xn(() => {
		let e = t.view ? T(t.view) : "", n = t.view?.revision ?? "", r = JSON.stringify([
			t.view?.controls.map((e) => [
				e.key,
				e.editor,
				e.representation
			]),
			t.view?.model?.profile.allowedModes,
			t.view?.model?.model.allowedModes,
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
		(i || n !== c || r !== l) && ((i || r !== l) && (f++, y++), i && (p++, s && S.set(s, pr(() => C(U(a))))), s = e, c = n, l = r, h.clear(), u++, I(o, {}, !0), I(g, !1), v++, I(a, w(i ? S.get(e) ?? {} : pr(() => U(a)), t.view), !0));
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
	function ee(e) {
		return e.editor === "json" ? e.representation === "json-text" ? String(e.value ?? "") : JSON.stringify(e.value, null, 2) : e.editor === "lines" && Array.isArray(e.value) ? e.value.join("\n") : String(e.value ?? "");
	}
	function k(e, t) {
		if (t === "model" || t === "profileId") return (t === "model" ? e.model?.model : e.model?.profile)?.allowedModes.some((e) => e.value === "override") ? "binding:" + t : null;
		let n = e.controls.find((e) => e.key === t);
		return n && (n.editor === "json" || n.editor === "lines") ? JSON.stringify([
			n.editor,
			n.representation,
			n.allowEmpty,
			n.structured
		]) : null;
	}
	function te(e) {
		let t = (x.get(e) ?? 0) + 1;
		return x.set(e, t), t;
	}
	async function ne(e, n, r) {
		let i = t.view;
		if (!i || (n ? !i.canPresent : i.readOnly)) return;
		let s = D(i), c = ++u, l = p, d = k(i, e), f = U(a)[e] && d ? te(e) : null;
		h.set(e, c), I(o, {
			...U(o),
			[e]: ""
		}, !0), U(a)[e] && I(a, {
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
		if (g && f !== null && U(a)[e] && E && t.view && p === l && T(t.view) === T(s) && x.get(e) === f && k(t.view, e) === d) {
			let t = { ...U(a) };
			delete t[e], I(a, t, !0);
		}
		if (O(s) && h.get(e) === c && (h.delete(e), I(o, {
			...U(o),
			[e]: m
		}, !0), U(a)[e])) {
			if (m) I(a, {
				...U(a),
				[e]: {
					...U(a)[e],
					error: m,
					pending: !1
				}
			}, !0);
			else {
				let t = { ...U(a) };
				delete t[e], I(a, t, !0);
			}
		}
	}
	function re(e) {
		let n = e.files?.[0];
		e.value = "", n && t.view?.fileInput && !t.view.readOnly && r().loadFile && !U(a).fileInput?.pending && (I(a, {
			...U(a),
			fileInput: {
				text: "",
				error: "",
				pending: !1
			}
		}, !0), ne("fileInput", !1, (e) => r().loadFile(e, n)));
	}
	function ie(e, n) {
		t.view && !t.view.readOnly && (te(e.key), h.delete(e.key), I(a, {
			...U(a),
			[e.key]: {
				text: n,
				error: "",
				pending: !1,
				editor: e.editor,
				representation: e.representation
			}
		}, !0), I(o, {
			...U(o),
			[e.key]: ""
		}, !0));
	}
	function ae(e) {
		if (!t.view || t.view.readOnly || !r().editControl) return;
		let n = U(a)[e.key]?.text ?? ee(e), i = n;
		if (e.editor === "json") try {
			if (!(e.representation === "json-text" && e.allowEmpty && n.trim() === "")) {
				let t = JSON.parse(n);
				e.representation !== "json-text" && (i = t);
			}
		} catch {
			I(a, {
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
		ne(e.key, !1, (t) => r().editControl(t, e.key, i));
	}
	function oe(e, t) {
		r().editControl && ne(e.key, !1, (n) => r().editControl(n, e.key, t));
	}
	function se(e, n) {
		if (!t.view || t.view.readOnly || !r().editControl) return;
		let i = Number(n.value);
		!n.value.trim() || !Number.isFinite(i) ? I(o, {
			...U(o),
			[e.key]: "Enter a finite number before saving."
		}, !0) : n.validity.valid ? oe(e, i) : I(o, {
			...U(o),
			[e.key]: "Enter a number within the allowed range and step."
		}, !0);
	}
	function ce(e, t, n) {
		le(e)?.allowedModes.some((e) => e.value === t) && r().editBinding && ne(e, !1, (i) => r().editBinding(i, e, t, n));
	}
	let le = (e) => e === "profileId" ? t.view?.model?.profile : t.view?.model?.model, ue = (e) => U(a)[e] ? "override" : le(e)?.mode, de = (e) => U(a)[e]?.text ?? le(e)?.value ?? "";
	function fe(e, n) {
		t.view && !t.view.readOnly && r().editBinding && le(e)?.allowedModes.some((e) => e.value === "override") && (te(e), h.delete(e), I(a, {
			...U(a),
			[e]: {
				text: n,
				error: "",
				pending: !1
			}
		}, !0), I(o, {
			...U(o),
			[e]: ""
		}, !0));
	}
	function pe(e, n) {
		let i = le(e);
		if (!t.view || t.view.readOnly || !r().editBinding || !i?.allowedModes.some((e) => e.value === n)) return;
		if (n === "override") {
			fe(e, de(e));
			return;
		}
		h.delete(e);
		let s = { ...U(a) };
		delete s[e], I(a, s, !0), I(o, {
			...U(o),
			[e]: ""
		}, !0), n !== i.mode && ce(e, n, null);
	}
	function me(e, n) {
		t.view && !t.view.readOnly && ue(e) === "override" && r().editBinding && le(e)?.allowedModes.some((e) => e.value === "override") && (fe(e, n), n.trim() ? ce(e, "override", n) : I(a, {
			...U(a),
			[e]: {
				text: n,
				error: e === "profileId" ? "Choose a connection before saving an override." : "Enter a model identifier before saving an override.",
				pending: !1
			}
		}, !0));
	}
	let he = () => !!t.view?.modifiers?.editable && !t.view.readOnly && !!r().editModifiers, ge = () => JSON.parse(JSON.stringify(t.view?.modifiers?.items ?? []));
	function _e(e) {
		let t = U(a)["modifier:" + e.id];
		if (t) try {
			return JSON.parse(t.text);
		} catch {}
		return e.settings;
	}
	let ve = () => Object.fromEntries((t.view?.modifiers?.items ?? []).map((e) => {
		let t = U(a)["modifier:" + e.id];
		return [e.id, {
			settings: _e(e),
			error: t?.error || U(o)["modifier:" + e.id] || "",
			pending: !!t?.pending,
			dirty: !!t
		}];
	}));
	function ye(e) {
		if (!he() || U(g) || e.length > 16 || !r().editModifiers) return;
		let t = ++v;
		I(g, !0), ne("modifiers", !1, (t) => r().editModifiers(t, e)).finally(() => {
			t === v && I(g, !1);
		});
	}
	function be(e) {
		if (!he() || !t.view?.modifiers || t.view.modifiers.items.length >= 16) return;
		let n = t.view.modifiers.options.find((t) => t.type === e);
		if (!n) return;
		let r = ge(), i;
		do
			i = `mod-${e.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 28)}-${Date.now().toString(36)}-${(++_).toString(36)}`;
		while (r.some((e) => e.id === i));
		ye([...r, {
			id: i,
			type: e,
			version: 1,
			enabled: !0,
			settings: JSON.parse(JSON.stringify(n.defaultSettings))
		}]);
	}
	function xe(e, n) {
		if (!he() || !t.view?.modifiers || !t.view.modifiers.options.some((t) => t.type === e)) return;
		let r = ge();
		r.some((t) => t.type === e) ? ye(r.map((t) => t.type === e ? {
			...t,
			enabled: n
		} : t)) : n && be(e);
	}
	function Se(e, n) {
		he() && t.view?.modifiers?.items.some((t) => t.id === e) && ye(ge().map((t) => t.id === e ? {
			...t,
			enabled: n
		} : t));
	}
	function Ce(e) {
		he() && t.view?.modifiers?.items.some((t) => t.id === e) && ye(ge().filter((t) => t.id !== e));
	}
	function we(e, t) {
		if (!he()) return;
		let n = ge(), r = n.findIndex((t) => t.id === e), i = r + t;
		r < 0 || i < 0 || i >= n.length || ([n[r], n[i]] = [n[i], n[r]], ye(n));
	}
	function Te(e, n, r) {
		if (!he()) return;
		let i = t.view?.modifiers?.items.find((t) => t.id === e), s = t.view?.modifiers?.options.find((e) => e.type === i?.type);
		if (!i || !s?.fields.some((e) => e.key === n)) return;
		let c = "modifier:" + e;
		b.set(c, (b.get(c) ?? 0) + 1), h.delete(c), I(o, {
			...U(o),
			[c]: ""
		}, !0), I(a, {
			...U(a),
			[c]: {
				text: JSON.stringify({
					..._e(i),
					[n]: r
				}),
				error: "",
				pending: !1,
				modifierType: i.type
			}
		}, !0);
	}
	function Ee(e) {
		if (!he() || !r().editModifiers) return;
		let n = t.view?.modifiers?.items.find((t) => t.id === e), i = "modifier:" + e;
		if (!n || !U(a)[i] || U(a)[i].pending) return;
		let o = (b.get(i) ?? 0) + 1, s = y, c = n.type;
		b.set(i, o);
		let l = _e(n), u = ge().map((t) => t.id === e ? {
			...t,
			settings: l
		} : t);
		ne(i, !1, async (n) => {
			let l = await r().editModifiers(n, u);
			if (l.ok && E && t.view && T(t.view) === T(n) && y === s && b.get(i) === o && t.view.modifiers?.items.some((t) => t.id === e && t.type === c)) {
				let e = { ...U(a) };
				delete e[i], I(a, e, !0);
			}
			return l;
		});
	}
	let De = () => {
		let e = /* @__PURE__ */ new Map();
		for (let n of t.view?.controls ?? []) {
			let t = n.group && n.group !== "Main" ? n.group : n.advanced ? "Advanced" : "Main";
			e.set(t, [...e.get(t) ?? [], n]);
		}
		return [...e].sort(([e], [t]) => e === "Main" ? -1 : +(t === "Main"));
	}, Oe = (e) => e.some((e) => !!(U(a)[e.key]?.error || U(o)[e.key])), A = () => !!(t.view?.model?.issue || U(a).profileId || U(a).model || U(o).modelRole || U(o).profileId || U(o).model), ke = () => {
		if (!t.view?.model) return "";
		let e = ue("profileId"), n = ue("model"), r = e === "block" || n === "block" ? "Inheritance blocked" : t.view.model.source === "Containing instance override" ? "Instance binding" : e === "override" || n === "override" ? "Override" : "Inherit role";
		return `${t.view.model.role || "Model"} · ${r} · ${t.view.model.issue ? "Binding needs attention" : t.view.model.effective || "Missing binding"}`;
	};
	function j(e) {
		t.view && !t.view.boundary && r().present && ne("alias", !0, (n) => r().present(n, "alias", e === t.view?.canonicalTitle ? "" : e));
	}
	function Ae() {
		return {
			label: U(a).boundary?.text ?? t.view?.boundary?.label ?? "",
			artifactKind: U(a).boundary?.artifactKind ?? t.view?.boundary?.kind ?? "",
			required: U(a).boundary?.required ?? t.view?.boundary?.required ?? !1
		};
	}
	function je(e, n) {
		if (!t.view?.boundary || t.view.readOnly || !r().editInterface || e === "artifactKind" && !t.view.boundary.kinds.includes(String(n))) return;
		let i = {
			...Ae(),
			[e]: n
		};
		f++, h.delete("boundary"), I(o, {
			...U(o),
			boundary: ""
		}, !0), I(a, {
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
	function Ne() {
		if (!t.view?.boundary || t.view.readOnly || !r().editInterface || U(a).boundary?.pending) return;
		let e = t.view.boundary.id, n = Ae();
		if (!n.label.trim() || !t.view.boundary.kinds.includes(n.artifactKind)) return;
		let i = ++f;
		I(a, {
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
		}, !0), ne("boundary", !1, async (o) => {
			let s = await r().editInterface(o, {
				kind: "update",
				id: e,
				...n
			});
			if (s.ok && E && t.view?.boundary?.id === e && T(t.view) === T(o) && f === i) {
				let e = { ...U(a) };
				delete e.boundary, I(a, e, !0);
			}
			return s;
		});
	}
	var Pe = Lo(), Fe = L(Pe), Ie = (e) => {
		var s = Fo(), c = R(s);
		let l;
		var u = L(c), d = L(u);
		M(u);
		var f = z(u, 2), p = L(f);
		Z(p);
		var h = z(p, 2), _ = (e) => {
			var n = mo(), r = L(n);
			M(n), B(() => J(r, `Canonical type: ${t.view.canonicalTitle ?? ""}`)), q(e, n);
		};
		Y(h, (e) => {
			!t.view.boundary && (t.view.alias || t.view.title || t.view.canonicalTitle) !== t.view.canonicalTitle && e(_);
		});
		var v = z(h, 2), y = L(v, !0);
		M(v), M(f);
		var b = z(f, 2), x = (e) => {
			var n = _o(), i = z(L(n)), a = L(i), o = (e) => {
				var n = ho();
				B(() => n.disabled = t.view.readOnly), G("click", n, () => {
					t.view && !t.view.readOnly && r().duplicate?.(D(t.view));
				}), q(e, n);
			};
			Y(a, (e) => {
				!t.view.boundary && r().duplicate && e(o);
			});
			var s = z(a, 2), c = (e) => {
				var n = go();
				B(() => n.disabled = t.view.readOnly), G("click", n, () => {
					t.view && !t.view.readOnly && r().remove?.(D(t.view));
				}), q(e, n);
			};
			Y(s, (e) => {
				r().remove && e(c);
			}), M(i), M(n), q(e, n);
		};
		Y(b, (e) => {
			(r().duplicate || r().remove) && e(x);
		}), M(c);
		var S = z(c, 2), C = (e) => {
			var n = bo(), r = L(n), i = (e) => {
				q(e, vo());
			};
			Y(r, (e) => {
				t.view.readOnly && e(i);
			});
			var a = z(r), o = (e) => {
				q(e, yo());
			};
			Y(a, (e) => {
				t.view.enabled || e(o);
			}), M(n), q(e, n);
		};
		Y(S, (e) => {
			(t.view.readOnly || !t.view.enabled) && e(C);
		});
		var w = z(S, 2), T = (e) => {
			var t = xo(), n = L(t, !0);
			M(t), B(() => J(n, U(o).alias)), q(e, t);
		};
		Y(w, (e) => {
			U(o).alias && e(T);
		});
		var E = z(w, 2), O = (e) => {
			var n = Co(), i = L(n), s = L(i);
			M(i);
			var c = z(i, 2), l = z(L(c));
			X(l, 21, () => t.view.boundary.kinds, Vr, (e, t) => {
				var n = So(), r = L(n, !0);
				M(n);
				var i = {};
				B(() => {
					J(r, U(t)), i !== (i = U(t)) && (n.value = (n.__value = U(t)) ?? "");
				}), q(e, n);
			}), M(l);
			var u;
			ci(l), M(c);
			var d = z(c, 2), f = L(d);
			Z(f), Me(), M(d);
			var p = z(d, 2), m = L(p), h = L(m, !0);
			M(m), M(p);
			var g = z(p, 4), _ = (e) => {
				var t = xo(), n = L(t, !0);
				M(t), B(() => J(n, U(a).boundary?.error || U(o).boundary)), q(e, t);
			};
			Y(g, (e) => {
				(U(a).boundary?.error || U(o).boundary) && e(_);
			}), M(n), B((e, n, i) => {
				J(s, `Subgraph ${t.view.boundary.direction ?? ""}`), l.disabled = t.view.readOnly || !r().editInterface, u !== (u = e) && (l.value = (l.__value = e) ?? "", si(l, e)), gi(f, n), f.disabled = t.view.readOnly || !r().editInterface, m.disabled = i, J(h, U(a).boundary?.pending ? "Validating…" : "Save port");
			}, [
				() => Ae().artifactKind,
				() => Ae().required,
				() => t.view.readOnly || !r().editInterface || !Ae().label.trim() || !!U(a).boundary?.pending
			]), G("change", l, (e) => je("artifactKind", e.currentTarget.value)), G("change", f, (e) => je("required", e.currentTarget.checked)), G("click", m, () => Ne()), q(e, n);
		};
		Y(E, (e) => {
			t.view.boundary && e(O);
		});
		var ee = z(E, 2), k = (e) => {
			var s = Do(), c = R(s), l = L(c), u = (e) => {
				var n = To(), s = L(n), c = L(s, !0), l = z(c);
				M(s);
				var u = z(s, 2), d = L(u, !0);
				M(u);
				var f = z(u, 6), p = (e) => {
					q(e, wo());
				};
				Y(f, (e) => {
					U(a).fileInput?.pending && e(p);
				});
				var m = z(f, 2), h = (e) => {
					var t = xo(), n = L(t, !0);
					M(t), B(() => {
						Q(t, "id", i() + "-error-fileInput"), J(n, U(o).fileInput);
					}), q(e, t);
				};
				Y(m, (e) => {
					U(o).fileInput && e(h);
				}), M(n), B(() => {
					J(c, t.view.fileInput.loaded ? "Replace file" : "Choose file"), Q(l, "aria-label", t.view.fileInput.loaded ? "Replace file" : "Choose file"), l.disabled = t.view.readOnly || !r().loadFile || !!U(a).fileInput?.pending, Q(l, "aria-invalid", !!U(o).fileInput), Q(l, "aria-describedby", U(o).fileInput ? i() + "-error-fileInput" : void 0), J(d, t.view.fileInput.loaded ? "Loaded file: " + t.view.fileInput.fileName : "No file loaded.");
				}), G("change", l, (e) => re(e.currentTarget)), q(e, n);
			};
			Y(l, (e) => {
				t.view.fileInput && e(u);
			}), X(z(l, 2), 17, () => De().filter(([e]) => e === "Main"), ([e, t]) => e, (e, t) => {
				var r = /* @__PURE__ */ N(() => m(U(t), 2));
				let i = () => U(r)[1];
				var a = jr();
				X(R(a), 17, i, (e) => e.key, (e, t) => {
					n(e, () => U(t));
				}), q(e, a);
			}), M(c), X(z(c, 2), 17, () => De().filter(([e]) => e !== "Main"), ([e, t]) => e, (e, t) => {
				var r = /* @__PURE__ */ N(() => m(U(t), 2));
				let i = () => U(r)[0], a = () => U(r)[1];
				var o = Eo(), s = L(o), c = L(s, !0);
				M(s), X(z(s, 2), 17, a, (e) => e.key, (e, t) => {
					n(e, () => U(t));
				}), M(o), B((e) => {
					Q(o, "data-control-group", i()), o.open = e, J(c, i());
				}, [() => Oe(a())]), q(e, o);
			}), q(e, s);
		};
		Y(ee, (e) => {
			t.view.boundary || e(k);
		});
		var te = z(ee, 2), ie = (e) => {
			var n = jo(), i = L(n), s = L(i, !0);
			M(i);
			var c = z(i, 2), l = z(L(c));
			Z(l), M(c);
			var u = z(c, 2), d = z(L(u));
			X(d, 21, () => t.view.model.profile.allowedModes, (e) => e.value, (e, t) => {
				var n = So(), r = L(n, !0);
				M(n);
				var i = {};
				B(() => {
					J(r, U(t).label), i !== (i = U(t).value) && (n.value = (n.__value = U(t).value) ?? "");
				}), q(e, n);
			}), M(d);
			var f;
			ci(d), M(u);
			var p = z(u, 2), m = (e) => {
				var n = Oo(), i = z(L(n)), a = L(i);
				a.value = a.__value = "", X(z(a), 17, () => t.view.model.profile.options ?? [], (e) => e.value, (e, t) => {
					var n = So(), r = L(n, !0);
					M(n);
					var i = {};
					B(() => {
						J(r, U(t).label), i !== (i = U(t).value) && (n.value = (n.__value = U(t).value) ?? "");
					}), q(e, n);
				}), M(i);
				var o;
				ci(i), M(n), B((e) => {
					i.disabled = t.view.readOnly || !r().editBinding, o !== (o = e) && (i.value = (i.__value = e) ?? "", si(i, e));
				}, [() => de("profileId")]), G("change", i, (e) => me("profileId", e.currentTarget.value)), q(e, n);
			}, h = /* @__PURE__ */ N(() => ue("profileId") === "override");
			Y(p, (e) => {
				U(h) && e(m);
			});
			var g = z(p, 2), _ = z(L(g));
			X(_, 21, () => t.view.model.model.allowedModes, (e) => e.value, (e, t) => {
				var n = So(), r = L(n, !0);
				M(n);
				var i = {};
				B(() => {
					J(r, U(t).label), i !== (i = U(t).value) && (n.value = (n.__value = U(t).value) ?? "");
				}), q(e, n);
			}), M(_);
			var v;
			ci(_), M(g);
			var y = z(g, 2), b = (e) => {
				var n = ko(), i = z(L(n));
				Z(i), M(n), B((e) => {
					hi(i, e), i.disabled = t.view.readOnly || !r().editBinding;
				}, [() => de("model")]), G("input", i, (e) => fe("model", e.currentTarget.value)), G("change", i, (e) => me("model", e.currentTarget.value)), q(e, n);
			}, x = /* @__PURE__ */ N(() => ue("model") === "override");
			Y(y, (e) => {
				U(x) && e(b);
			});
			var S = z(y, 2), C = (e) => {
				var n = Ao(), r = L(n);
				M(n), B(() => J(r, `Effective connection: ${t.view.model.effective ?? ""}`)), q(e, n);
			}, w = /* @__PURE__ */ N(() => !t.view.model.issue || t.view.model.effective.trim() !== t.view.model.issue.trim());
			Y(S, (e) => {
				U(w) && e(C);
			});
			var T = z(S), E = (e) => {
				var n = Ao(), r = L(n, !0);
				M(n), B(() => J(r, t.view.model.source)), q(e, n);
			};
			Y(T, (e) => {
				t.view.model.source && e(E);
			});
			var D = z(T, 2), O = (e) => {
				var n = xo(), r = L(n, !0);
				M(n), B(() => J(r, t.view.model.issue)), q(e, n);
			};
			Y(D, (e) => {
				t.view.model.issue && e(O);
			});
			var ee = z(D, 2), k = (e) => {
				var t = xo(), n = L(t, !0);
				M(t), B(() => J(n, U(o).modelRole || U(a).profileId?.error || U(o).profileId || U(a).model?.error || U(o).model)), q(e, t);
			};
			Y(ee, (e) => {
				(U(o).modelRole || U(a).profileId?.error || U(o).profileId || U(a).model?.error || U(o).model) && e(k);
			}), M(n), B((e, i, a, o) => {
				n.open = e, J(s, i), hi(l, t.view.model.role), l.disabled = t.view.readOnly || !t.view.model.roleEditable || !r().editField, d.disabled = t.view.readOnly || !r().editBinding, f !== (f = a) && (d.value = (d.__value = a) ?? "", si(d, a)), _.disabled = t.view.readOnly || !r().editBinding, v !== (v = o) && (_.value = (_.__value = o) ?? "", si(_, o));
			}, [
				() => A(),
				() => ke(),
				() => ue("profileId"),
				() => ue("model")
			]), G("change", l, (e) => {
				let n = e.currentTarget.value;
				t.view?.model?.roleEditable && r().editField && ne("modelRole", !1, (e) => r().editField(e, "modelRole", n));
			}), G("change", d, (e) => pe("profileId", e.currentTarget.value)), G("change", _, (e) => pe("model", e.currentTarget.value)), q(e, n);
		};
		Y(te, (e) => {
			t.view.model && e(ie);
		});
		var ae = z(te, 2), oe = (e) => {
			var n = No();
			X(z(L(n)), 17, () => t.view.ports, (e) => e.direction + ":" + e.id, (e, t) => {
				var n = Mo(), r = L(n), i = z(r), a = L(i, !0);
				M(i), M(n), B(() => {
					J(r, `${U(t).direction === "input" ? "In" : "Out"} · ${U(t).label ?? ""}`), J(a, U(t).kind);
				}), q(e, n);
			}), M(n), q(e, n);
		};
		Y(ae, (e) => {
			t.view.ports.length && e(oe);
		});
		var se = z(ae, 2), ce = (e) => {
			var n = Po(), r = L(n, !0);
			M(n), B(() => J(r, t.view.status)), q(e, n);
		};
		Y(se, (e) => {
			t.view.status && e(ce);
		});
		var le = z(se, 2);
		X(le, 17, () => t.view.issues ?? [], Vr, (e, t) => {
			var n = xo(), r = L(n, !0);
			M(n), B(() => J(r, U(t))), q(e, n);
		});
		var ge = z(le, 2), _e = (e) => {
			{
				let n = /* @__PURE__ */ N(() => !he()), r = /* @__PURE__ */ N(ve), a = /* @__PURE__ */ N(() => U(o).modifiers || "");
				po(e, {
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
					onquick: xe,
					onadd: be,
					onenable: Se,
					onremove: Ce,
					onmove: we,
					ondraft: Te,
					onsave: Ee
				});
			}
		};
		Y(ge, (e) => {
			t.view.modifiers && e(_e);
		}), B((e) => {
			l = oi(c, "", l, { "--pc-detail-family": t.view.familyColor ?? "var(--pc-accent)" }), Q(d, "d", t.view.iconPath), Q(p, "id", i() + "-name"), Q(p, "maxlength", t.view.boundary ? void 0 : 80), hi(p, e), p.disabled = t.view.boundary ? t.view.readOnly || !r().editInterface : !t.view.canPresent || !r().present, J(y, t.view.boundary ? "Subgraph " + t.view.boundary.direction : t.view.family + " · " + t.view.phase + " phase");
		}, [() => t.view.boundary ? Ae().label : t.view.alias || t.view.title || t.view.canonicalTitle]), G("input", p, (e) => {
			t.view?.boundary && je("label", e.currentTarget.value);
		}), G("change", p, (e) => {
			t.view?.boundary || j(e.currentTarget.value);
		}), q(e, s);
	}, Le = (e) => {
		q(e, Io());
	};
	Y(Fe, (e) => {
		t.view ? e(Ie) : e(Le, -1);
	}), M(Pe), q(e, Pe), We();
}
br([
	"input",
	"change",
	"click"
]);
//#endregion
//#region ui/CommentDetails.svelte
var zo = /* @__PURE__ */ K("<p class=\"pc-detail-meta svelte-17djc3u\">Read-only comment</p>"), Bo = /* @__PURE__ */ K("<section class=\"pc-comment-details svelte-17djc3u\" aria-label=\"Comment details\"><h3 class=\"svelte-17djc3u\">Comment</h3> <!> <fieldset class=\"pc-detail-group svelte-17djc3u\"><legend class=\"svelte-17djc3u\">Comment</legend> <label class=\"svelte-17djc3u\">Title<input aria-label=\"Comment title\" class=\"svelte-17djc3u\"/></label> <label class=\"svelte-17djc3u\">Notes<textarea aria-label=\"Comment notes\" rows=\"5\" class=\"svelte-17djc3u\"></textarea></label> <label class=\"pc-comment-color-label svelte-17djc3u\">Color<input aria-label=\"Comment color\" type=\"color\" class=\"svelte-17djc3u\"/></label> <label class=\"pc-detail-check svelte-17djc3u\"><input aria-label=\"Move contents\" type=\"checkbox\" class=\"svelte-17djc3u\"/> Move contents</label> <small class=\"svelte-17djc3u\">Moves fully contained nodes when you drag the comment header.</small></fieldset> <div class=\"pc-comment-commands svelte-17djc3u\"><button type=\"button\" class=\"pc-btn svelte-17djc3u\">Fit to contents</button> <button type=\"button\" class=\"pc-btn pc-danger svelte-17djc3u\">Delete comment</button></div> <small class=\"svelte-17djc3u\">Deleting this comment keeps its contents.</small></section>");
function Vo(e, t) {
	Ue(t, !0);
	let n = wi(t, "readOnly", 3, !1), r = /* @__PURE__ */ N(() => n() || t.comment.readOnly), i = (e) => e.stopPropagation();
	function a(e) {
		U(r) || t.onPatch(e);
	}
	function o(e) {
		U(r) || t.onCommand(e);
	}
	var s = Bo(), c = z(L(s), 2), l = (e) => {
		q(e, zo());
	};
	Y(c, (e) => {
		U(r) && e(l);
	});
	var u = z(c, 2), d = z(L(u), 2), f = z(L(d));
	Z(f), M(d);
	var p = z(d, 2), m = z(L(p));
	at(m), M(p);
	var h = z(p, 2), g = z(L(h));
	Z(g), M(h);
	var _ = z(h, 2), v = L(_);
	Z(v), Me(), M(_), Me(2), M(u);
	var y = z(u, 2), b = L(y), x = z(b, 2);
	M(y), Me(2), M(s), B(() => {
		u.disabled = U(r), hi(f, t.comment.title), f.disabled = U(r), hi(m, t.comment.content), m.disabled = U(r), hi(g, t.comment.color), g.disabled = U(r), gi(v, t.comment.moveContents), v.disabled = U(r), b.disabled = U(r), x.disabled = U(r);
	}), W("keydown", f, i, !0), G("change", f, (e) => a({ title: e.currentTarget.value })), W("keydown", m, i, !0), G("change", m, (e) => a({ content: e.currentTarget.value })), G("change", g, (e) => a({ color: e.currentTarget.value })), G("change", v, (e) => a({ moveContents: e.currentTarget.checked })), G("click", b, () => o("fit")), G("click", x, () => o("delete")), q(e, s), We();
}
br(["change", "click"]);
//#endregion
//#region ui/OutputPreview.svelte
var Ho = /* @__PURE__ */ K("<option class=\"svelte-ee2ehy\"> </option>"), Uo = /* @__PURE__ */ K("<label class=\"pc-preview-choice svelte-ee2ehy\"><span class=\"pc-preview-sr-only svelte-ee2ehy\">Preview output</span><select aria-label=\"Preview output\" class=\"svelte-ee2ehy\"><option disabled=\"\" class=\"svelte-ee2ehy\">Choose an output</option><!></select></label>"), Wo = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-ee2ehy\">Collapse preview</button>"), Go = /* @__PURE__ */ K("<button type=\"button\" role=\"tab\" class=\"svelte-ee2ehy\"> </button>"), Ko = /* @__PURE__ */ K("<div class=\"pc-preview-tabs svelte-ee2ehy\" role=\"tablist\" aria-label=\"Recorded artifacts\"></div>"), qo = /* @__PURE__ */ K("<p class=\"pc-preview-note svelte-ee2ehy\"> </p>"), Jo = /* @__PURE__ */ K("<pre class=\"svelte-ee2ehy\"> </pre>"), Yo = /* @__PURE__ */ K("<small class=\"pc-preview-note svelte-ee2ehy\"> </small>"), Xo = /* @__PURE__ */ K("<div role=\"tabpanel\" tabindex=\"0\" class=\"svelte-ee2ehy\"><article class=\"svelte-ee2ehy\"><div class=\"pc-preview-section-heading svelte-ee2ehy\"><span class=\"svelte-ee2ehy\"> </span><small class=\"svelte-ee2ehy\"> </small></div> <!> <!></article></div>"), Zo = /* @__PURE__ */ K("<p class=\"pc-preview-empty svelte-ee2ehy\"> </p>"), Qo = /* @__PURE__ */ K("<p class=\"pc-preview-error svelte-ee2ehy\"> </p>"), $o = /* @__PURE__ */ K("<small class=\"pc-preview-note svelte-ee2ehy\">Apply rechecks the source and connection. Recorded preview text may be truncated.</small>"), es = /* @__PURE__ */ K("<button type=\"button\" data-run-here=\"\" title=\"Runs the selected output's dependencies. Results are diagnostic previews.\" class=\"svelte-ee2ehy\"> </button>"), ts = /* @__PURE__ */ K("<button type=\"button\" data-preview-apply=\"\" class=\"svelte-ee2ehy\">Apply reviewed candidate</button><button type=\"button\" class=\"svelte-ee2ehy\">Reject candidate</button>", 1), ns = /* @__PURE__ */ K("<header class=\"svelte-ee2ehy\"><h3 class=\"svelte-ee2ehy\"> </h3> <!> <div class=\"pc-preview-tools svelte-ee2ehy\"><button type=\"button\" class=\"svelte-ee2ehy\">Follow selection</button><button type=\"button\" class=\"svelte-ee2ehy\"> </button><!></div></header> <!> <div class=\"pc-preview-sections svelte-ee2ehy\"><!> <!> <!> <!> <!> <!> <!></div> <footer class=\"svelte-ee2ehy\"><span class=\"pc-preview-status svelte-ee2ehy\"> </span> <span class=\"svelte-ee2ehy\"> </span> <!> <!></footer>", 1), rs = /* @__PURE__ */ K("<p class=\"pc-preview-empty svelte-ee2ehy\">Select a node output to inspect its recorded result.</p>"), is = /* @__PURE__ */ K("<section class=\"pc-output-preview svelte-ee2ehy\" aria-label=\"Output preview\"><!></section>");
function as(e, t) {
	let n = Mr();
	Ue(t, !0);
	let r = wi(t, "actions", 19, () => ({})), i = /* @__PURE__ */ N(() => JSON.stringify([t.view?.sourceKey, t.view?.selectedKey])), a = /* @__PURE__ */ F(en({
		scope: "",
		id: null
	})), o = /* @__PURE__ */ N(() => (U(a).scope === U(i) ? t.view?.sections.find((e) => e.id === U(a).id) : null) ?? t.view?.sections[0] ?? null);
	xn(() => {
		let e = U(a).scope === U(i) && t.view?.sections.some((e) => e.id === U(a).id) ? U(a).id : t.view?.sections[0]?.id ?? null;
		(U(a).scope !== U(i) || U(a).id !== e) && I(a, {
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
		I(a, {
			scope: U(i),
			id: r[o].id
		}, !0), e.currentTarget.parentElement?.querySelectorAll("[role=\"tab\"]")[o]?.focus();
	}
	let l = /* @__PURE__ */ N(() => t.view?.choices.find((e) => e.key === t.view?.selectedKey) ?? null), u = (e) => ({
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
	}, p = /* @__PURE__ */ N(() => !!(t.view && U(l) && t.view.status !== "removed" && !t.view.busy && t.view.runHere?.enabled && r().runHere)), m = /* @__PURE__ */ N(() => !!(t.view && U(l) && t.view.review?.mode === "root" && t.view.review.selectedRootTerminal && "kind" in U(l).target && U(l).target.address.instancePath.length === 0 && d(U(l).target) === d(t.view.review.selector.terminal))), h = /* @__PURE__ */ N(() => !!(t.view && t.view.status === "current" && !t.view.busy && U(m) && t.view.review?.fresh && t.view.review.canApply && r().apply)), g = /* @__PURE__ */ N(() => !!(t.view && !t.view.busy && U(m) && r().reject));
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
	var y = is(), b = L(y), x = (e) => {
		var d = ns(), m = R(d), y = L(m), b = L(y, !0);
		M(y);
		var x = z(y, 2), S = (e) => {
			var n = Uo(), i = z(L(n)), a = L(i);
			a.value = a.__value = "", X(z(a), 17, () => t.view.choices, (e) => e.key, (e, t) => {
				var n = Ho(), r = L(n);
				M(n);
				var i = {};
				B(() => {
					J(r, `${U(t).label ?? ""} · ${U(t).kind ?? ""}`), i !== (i = U(t).key) && (n.value = (n.__value = U(t).key) ?? "");
				}), q(e, n);
			}), M(i);
			var o;
			ci(i), M(n), B(() => {
				i.disabled = !r().select, o !== (o = t.view.selectedKey ?? "") && (i.value = (i.__value = t.view.selectedKey ?? "") ?? "", si(i, t.view.selectedKey ?? ""));
			}), G("change", i, (e) => _(e.currentTarget.value)), q(e, n);
		};
		Y(x, (e) => {
			t.view.choices.length && e(S);
		});
		var C = z(x, 2), w = L(C), T = z(w), E = L(T, !0);
		M(T);
		var D = z(T), O = (e) => {
			var n = Wo();
			G("click", n, function(...e) {
				t.collapse?.apply(this, e);
			}), q(e, n);
		};
		Y(D, (e) => {
			t.collapse && e(O);
		}), M(C), M(m);
		var ee = z(m, 2), k = (e) => {
			var r = Ko();
			X(r, 23, () => t.view.sections, (e) => e.id, (e, t, r) => {
				var l = Go(), u = L(l, !0);
				M(l), B((e) => {
					Q(l, "id", e), Q(l, "aria-selected", U(o)?.id === U(t).id), Q(l, "aria-controls", n + "-panel"), Q(l, "tabindex", U(o)?.id === U(t).id ? 0 : -1), J(u, U(t).label);
				}, [() => s(U(t).id)]), G("click", l, () => {
					I(a, {
						scope: U(i),
						id: U(t).id
					}, !0);
				}), W("keydown", l, (e) => c(e, U(r)), !0), q(e, l);
			}), M(r), q(e, r);
		};
		Y(ee, (e) => {
			t.view.sections.length && e(k);
		});
		var te = z(ee, 2), ne = L(te), re = (e) => {
			let t = /* @__PURE__ */ N(() => U(o));
			var r = Xo(), i = L(r), a = L(i), c = L(a), l = L(c, !0);
			M(c);
			var u = z(c), d = L(u, !0);
			M(u), M(a);
			var f = z(a, 2), p = (e) => {
				var n = qo(), r = L(n, !0);
				M(n), B(() => J(r, U(t).text)), q(e, n);
			}, m = (e) => {
				var n = Jo(), r = L(n, !0);
				M(n), B(() => J(r, U(t).text)), q(e, n);
			};
			Y(f, (e) => {
				U(t).format === "omitted" ? e(p) : e(m, -1);
			});
			var h = z(f, 2), g = (e) => {
				var n = Yo(), r = L(n);
				M(n), B(() => J(r, `Truncated diagnostic${U(t).format === "json-prefix-text" ? " · JSON prefix shown as text" : ""}`)), q(e, n);
			};
			Y(h, (e) => {
				U(t).truncated && e(g);
			}), M(i), M(r), B((e) => {
				Q(r, "id", n + "-panel"), Q(r, "aria-labelledby", e), Q(i, "data-artifact-kind", U(t).kind), J(l, U(t).label), J(d, U(t).kind);
			}, [() => s(U(t).id)]), W("keydown", r, (e) => e.stopPropagation(), !0), W("paste", r, (e) => e.stopPropagation(), !0), q(e, r);
		}, ie = (e) => {
			var n = Zo(), r = L(n, !0);
			M(n), B(() => J(r, t.view.status === "not-run" ? "Run this workflow or use Run to here to inspect an output." : "No recorded artifact is available for this output.")), q(e, n);
		};
		Y(ne, (e) => {
			U(o) ? e(re) : e(ie, -1);
		});
		var ae = z(ne, 2), oe = (e) => {
			var n = qo(), r = L(n, !0);
			M(n), B(() => J(r, t.view.statusDetail)), q(e, n);
		};
		Y(ae, (e) => {
			t.view.statusDetail && e(oe);
		});
		var se = z(ae, 2);
		X(se, 17, () => t.view.sections.filter((e) => e.id !== U(o)?.id && (e.format === "omitted" || e.truncated)), (e) => e.id, (e, t) => {
			var n = qo(), r = L(n);
			M(n), B(() => J(r, `${U(t).label ?? ""}: ${(U(t).format === "omitted" ? U(t).text : "Truncated diagnostic" + (U(t).format === "json-prefix-text" ? " · JSON prefix shown as text" : "")) ?? ""}`)), q(e, n);
		});
		var ce = z(se, 2), le = (e) => {
			var n = qo(), r = L(n, !0);
			M(n), B(() => J(r, t.view.runHere.issue)), q(e, n);
		};
		Y(ce, (e) => {
			t.view.runHere?.issue && e(le);
		});
		var ue = z(ce, 2);
		X(ue, 17, () => t.view.issues, Vr, (e, t) => {
			var n = Qo(), r = L(n, !0);
			M(n), B(() => J(r, U(t))), q(e, n);
		});
		var de = z(ue, 2), fe = (e) => {
			var n = Qo(), r = L(n, !0);
			M(n), B(() => J(r, t.view.review.issue)), q(e, n);
		};
		Y(de, (e) => {
			t.view.review?.issue && e(fe);
		});
		var pe = z(de, 2), me = (e) => {
			q(e, $o());
		};
		Y(pe, (e) => {
			t.view.review && e(me);
		}), M(te);
		var he = z(te, 2), ge = L(he), _e = L(ge, !0);
		M(ge);
		var ve = z(ge, 2), ye = L(ve, !0);
		M(ve);
		var be = z(ve, 2), xe = (e) => {
			var n = es(), i = L(n);
			M(n), B(() => {
				n.disabled = !U(p), J(i, `Run to here · maximum ${t.view.runHere.callBound ?? ""} ${t.view.runHere.callBound === 1 ? "request" : "requests"}`);
			}), G("click", n, () => {
				t.view && U(l) && U(p) && r().runHere?.(t.view.sourceKey, f(U(l).target));
			}), q(e, n);
		};
		Y(be, (e) => {
			t.view.runHere && e(xe);
		});
		var Se = z(be, 2), Ce = (e) => {
			var n = ts(), i = R(n), a = z(i);
			B(() => {
				i.disabled = !U(h), a.disabled = !U(g);
			}), G("click", i, () => {
				t.view?.review && U(h) && r().apply?.(v(t.view.review.selector));
			}), G("click", a, () => {
				t.view?.review && U(g) && r().reject?.(v(t.view.review.selector));
			}), q(e, n);
		};
		Y(Se, (e) => {
			t.view.review && e(Ce);
		}), M(he), B((e) => {
			J(b, U(l)?.label ?? t.view.title), Q(w, "aria-pressed", t.view.followSelection), w.disabled = !r().follow, Q(T, "aria-pressed", t.view.pinned), T.disabled = t.view.pinned ? !r().follow : !U(l) || !r().pin, J(E, t.view.pinned ? "Unpin preview" : "Pin preview"), Q(ge, "data-status", t.view.status), J(_e, e), J(ye, t.view.pinned ? "Pinned preview" : t.view.followSelection ? "Following selection" : "Selection not followed");
		}, [() => u(t.view.status)]), G("click", w, () => r().follow?.()), G("click", T, () => {
			t.view?.pinned ? r().follow?.() : t.view && U(l) && r().pin?.(t.view.sourceKey, f(U(l).target));
		}), q(e, d);
	}, S = (e) => {
		q(e, rs());
	};
	Y(b, (e) => {
		t.view ? e(x) : e(S, -1);
	}), M(y), q(e, y), We();
}
br(["change", "click"]);
//#endregion
//#region ui/RunDetails.svelte
var os = /* @__PURE__ */ K("<p class=\"pc-run-memory svelte-f9s2fm\" role=\"status\"> </p>"), ss = /* @__PURE__ */ K("<p class=\"pc-run-error svelte-f9s2fm\"> </p>"), cs = /* @__PURE__ */ K("<p class=\"pc-run-empty svelte-f9s2fm\">No execution plan has been recorded.</p>"), ls = /* @__PURE__ */ K("<span aria-hidden=\"true\" class=\"svelte-f9s2fm\">▱</span>"), us = /* @__PURE__ */ K("<small class=\"svelte-f9s2fm\"> </small>"), ds = /* @__PURE__ */ K("<details class=\"svelte-f9s2fm\"><summary class=\"svelte-f9s2fm\">Reported usage</summary><div class=\"pc-run-usage svelte-f9s2fm\"><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small></div></details>"), fs = /* @__PURE__ */ K("<li class=\"svelte-f9s2fm\"><div class=\"pc-run-row-heading svelte-f9s2fm\"><button type=\"button\" class=\"svelte-f9s2fm\"><!> </button><span class=\"pc-run-status svelte-f9s2fm\"> </span></div> <!> <div class=\"pc-run-row-meta svelte-f9s2fm\"><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small></div> <!> <!></li>"), ps = /* @__PURE__ */ K("<header class=\"svelte-f9s2fm\"><h3 class=\"svelte-f9s2fm\">Run details</h3><span class=\"pc-run-status svelte-f9s2fm\"> </span></header> <div class=\"pc-run-summary svelte-f9s2fm\"><p class=\"svelte-f9s2fm\"> </p><p class=\"svelte-f9s2fm\"> </p><p class=\"svelte-f9s2fm\"> </p></div> <!> <!> <!> <ol class=\"pc-run-rows svelte-f9s2fm\"></ol>", 1), ms = /* @__PURE__ */ K("<p class=\"pc-run-empty svelte-f9s2fm\">Run a workflow to inspect its processing stages.</p>"), hs = /* @__PURE__ */ K("<section class=\"pc-run-details svelte-f9s2fm\" aria-label=\"Run details\"><!></section>");
function gs(e, t) {
	Ue(t, !0);
	let n = wi(t, "actions", 19, () => ({})), r = (e) => e === "not-run" ? "Not run" : e === "empty" ? "Ready" : e.charAt(0).toUpperCase() + e.slice(1), i = (e) => e !== null && Number.isFinite(e) && e >= 0 ? (e / 1e3).toFixed(2) + "s" : "Unknown", a = (e) => e != null && Number.isFinite(e) && e >= 0 ? String(e) : "Unknown";
	var o = hs(), s = L(o), c = (e) => {
		var o = ps(), s = R(o), c = z(L(s)), l = L(c, !0);
		M(c), M(s);
		var u = z(s, 2), d = L(u), f = L(d);
		M(d);
		var p = z(d), m = L(p);
		M(p);
		var h = z(p), g = L(h);
		M(h), M(u);
		var _ = z(u, 2), v = (e) => {
			var n = os(), r = L(n, !0);
			M(n), B(() => J(r, t.view.memoryStatus)), q(e, n);
		};
		Y(_, (e) => {
			t.view.memoryStatus && e(v);
		});
		var y = z(_, 2), b = (e) => {
			var n = ss(), r = L(n, !0);
			M(n), B(() => J(r, t.view.issue)), q(e, n);
		};
		Y(y, (e) => {
			t.view.issue && e(b);
		});
		var x = z(y, 2), S = (e) => {
			q(e, cs());
		};
		Y(x, (e) => {
			t.view.rows.length || e(S);
		});
		var C = z(x, 2);
		X(C, 21, () => t.view.rows, (e) => e.key, (e, o) => {
			var s = fs();
			let c;
			var l = L(s), u = L(l), d = L(u), f = (e) => {
				q(e, ls());
			};
			Y(d, (e) => {
				U(o).kind === "instance" && e(f);
			});
			var p = z(d, 1, !0);
			M(u);
			var m = z(u), h = L(m, !0);
			M(m), M(l);
			var g = z(l, 2), _ = (e) => {
				var t = us(), n = L(t, !0);
				M(t), B((e) => J(n, e), [() => r(U(o).subphase)]), q(e, t);
			};
			Y(g, (e) => {
				U(o).subphase && e(_);
			});
			var v = z(g, 2), y = L(v), b = L(y);
			M(y);
			var x = z(y), S = L(x);
			M(x), M(v);
			var C = z(v, 2), w = (e) => {
				var t = ss(), n = L(t, !0);
				M(t), B(() => J(n, U(o).issue)), q(e, t);
			};
			Y(C, (e) => {
				U(o).issue && e(w);
			});
			var T = z(C, 2), E = (e) => {
				var t = ds(), n = z(L(t)), r = L(n), i = L(r);
				M(r);
				var s = z(r), c = L(s);
				M(s);
				var l = z(s), u = L(l);
				M(l);
				var d = z(l), f = L(d);
				M(d), M(n), M(t), B((e, t, n) => {
					J(i, `Input tokens: ${e ?? ""}`), J(c, `Output tokens: ${t ?? ""}`), J(u, `Total tokens: ${n ?? ""}`), J(f, `Cost: ${U(o).usage?.cost ?? "Unknown" ?? ""}`);
				}, [
					() => a(U(o).usage?.inputTokens),
					() => a(U(o).usage?.outputTokens),
					() => a(U(o).usage?.totalTokens)
				]), q(e, t);
			};
			Y(T, (e) => {
				U(o).kind === "primitive" && e(E);
			}), M(s), B((e, t, r) => {
				Q(s, "data-run-row", U(o).key), Q(s, "data-depth", U(o).depth), Q(s, "data-status", U(o).status), c = oi(s, "", c, e), Q(u, "aria-label", "Open " + U(o).title + " in graph"), u.disabled = !n().jump, J(p, U(o).title), Q(m, "data-status", U(o).status), J(h, t), J(b, `Duration: ${r ?? ""}`), J(S, `${U(o).attempts ?? ""} of ${U(o).callBound ?? ""} requests`);
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
		}), M(C), B((e, n) => {
			Q(c, "data-status", t.view.status), J(l, e), J(f, `${t.view.completedCount ?? ""} of ${t.view.executableCount ?? ""} stages complete`), J(m, `${t.view.actualCalls ?? ""} of ${t.view.callBound ?? ""} requests`), J(g, `Elapsed: ${n ?? ""}`);
		}, [() => r(t.view.status), () => i(t.view.elapsedMs)]), q(e, o);
	}, l = (e) => {
		q(e, ms());
	};
	Y(s, (e) => {
		t.view ? e(c) : e(l, -1);
	}), M(o), q(e, o), We();
}
br(["click"]);
//#endregion
//#region ui/RunMeter.svelte
var _s = /* @__PURE__ */ K("<span class=\"pc-run-meter-elapsed svelte-1tkcp3\" data-run-elapsed=\"\"> </span>"), vs = /* @__PURE__ */ K("<span class=\"pc-run-pixel svelte-1tkcp3\" data-run-pixel=\"\"></span>"), ys = /* @__PURE__ */ K("<button class=\"pc-run-meter svelte-1tkcp3\"><span class=\"pc-run-meter-label svelte-1tkcp3\"> </span> <!> <span class=\"pc-run-meter-pixels svelte-1tkcp3\" aria-hidden=\"true\"></span></button>");
function bs(e, t) {
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
	], i = /* @__PURE__ */ N(() => {
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
	}), a = /* @__PURE__ */ N(() => t.view ? "Open run details. " + n(t.view.status) + ". " + t.view.completedCount + " of " + t.view.executableCount + " stages complete. " + t.view.actualCalls + " of " + t.view.callBound + " requests." : "Open run details");
	var o = jr(), s = R(o), c = (e) => {
		var r = ys(), o = L(r), s = L(o, !0);
		M(o);
		var c = z(o, 2), l = (e) => {
			var n = _s(), r = L(n);
			M(n), B((e) => J(r, `${e ?? ""}s`), [() => (t.view.elapsedMs / 1e3).toFixed(1)]), q(e, n);
		}, u = /* @__PURE__ */ N(() => t.view.elapsedMs !== null && Number.isFinite(t.view.elapsedMs) && t.view.elapsedMs >= 0);
		Y(c, (e) => {
			U(u) && e(l);
		});
		var d = z(c, 2);
		X(d, 21, () => U(i), (e) => e.key, (e, t) => {
			var n = vs();
			B(() => {
				Q(n, "data-status", U(t).status), Q(n, "title", U(t).title);
			}), q(e, n);
		}), M(d), M(r), B((e) => {
			Q(r, "aria-label", U(a)), Q(r, "title", U(a)), r.disabled = !t.open, J(s, e);
		}, [() => n(t.view.status)]), G("click", r, () => t.open?.()), q(e, r);
	};
	Y(s, (e) => {
		t.view && e(c);
	}), q(e, o), We();
}
br(["click"]);
//#endregion
//#region ui/PortalManager.svelte
var xs = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-mnv790\">Close</button>"), Ss = /* @__PURE__ */ K("<option class=\"svelte-mnv790\"> </option>"), Cs = /* @__PURE__ */ K("<label class=\"svelte-mnv790\">Portal name<input aria-label=\"Portal name\" class=\"svelte-mnv790\"/></label> <p class=\"pc-note svelte-mnv790\"> </p> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-rename=\"\" class=\"svelte-mnv790\">Rename</button></div>", 1), ws = /* @__PURE__ */ K("<p class=\"pc-note svelte-mnv790\">Select a portal or create one from an output.</p>"), Ts = /* @__PURE__ */ K("<button type=\"button\" data-portal-jump-source=\"\" class=\"svelte-mnv790\">Jump to source</button>"), Es = /* @__PURE__ */ K("<label class=\"pc-check svelte-mnv790\"><input type=\"checkbox\" aria-label=\"Replace existing connection\" class=\"svelte-mnv790\"/>Replace existing connection</label>"), Ds = /* @__PURE__ */ K("<button type=\"button\" data-portal-jump-consumer=\"\" class=\"svelte-mnv790\">Jump</button>"), Os = /* @__PURE__ */ K("<div class=\"pc-consumer svelte-mnv790\"><span class=\"svelte-mnv790\"> </span><div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-restore=\"\" class=\"svelte-mnv790\">Restore wire</button> <!></div></div>"), ks = /* @__PURE__ */ K("<p class=\"pc-note svelte-mnv790\">No consumers.</p>"), As = /* @__PURE__ */ K("<label class=\"svelte-mnv790\">Existing consumers<select aria-label=\"Existing consumers\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Choose before deleting…</option><option class=\"svelte-mnv790\">Restore visible wires</option><option class=\"svelte-mnv790\">Disconnect consumers</option></select></label>"), js = /* @__PURE__ */ K("<details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Consumers</summary> <label class=\"svelte-mnv790\">Compatible receiver<select aria-label=\"Compatible receiver\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select input…</option><!></select></label> <!> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-connect=\"\" class=\"svelte-mnv790\">Connect receiver</button></div> <!> <!> <!> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-delete=\"\" class=\"svelte-mnv790\">Delete portal</button></div></details>"), Ms = /* @__PURE__ */ K("<details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Convert to portal</summary><p class=\"pc-note svelte-mnv790\"> </p><div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-convert=\"\" class=\"svelte-mnv790\"> </button></div></details>"), Ns = /* @__PURE__ */ K("<p class=\"pc-error svelte-mnv790\"> </p>"), Ps = /* @__PURE__ */ K("<p class=\"pc-error svelte-mnv790\" role=\"alert\"> </p>"), Fs = /* @__PURE__ */ K("<p class=\"pc-note svelte-mnv790\" role=\"status\">Preparing change…</p>"), Is = /* @__PURE__ */ K("<p class=\"pc-note svelte-mnv790\"> </p> <label class=\"svelte-mnv790\">Portal<select aria-label=\"Selected portal\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select portal…</option><!></select></label> <!> <details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Source</summary> <label class=\"svelte-mnv790\">Output<select aria-label=\"Portal source\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select output…</option><!></select></label> <label class=\"svelte-mnv790\">New portal name<input aria-label=\"New portal name\" class=\"svelte-mnv790\"/></label> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-create=\"\" class=\"svelte-mnv790\">Create portal</button> <button type=\"button\" data-portal-retarget=\"\" class=\"svelte-mnv790\">Retarget</button> <!></div></details> <!> <!> <!> <!> <!>", 1), Ls = /* @__PURE__ */ K("<p class=\"pc-note svelte-mnv790\">Open a graph to manage its portals.</p>"), Rs = /* @__PURE__ */ K("<section class=\"pc-manager svelte-mnv790\" aria-label=\"Manage portals\"><header class=\"svelte-mnv790\"><h2 class=\"svelte-mnv790\">Manage portals</h2><!></header> <!></section>");
function zs(e, t) {
	Ue(t, !0);
	let n = wi(t, "actions", 19, () => ({})), r = /* @__PURE__ */ F(""), i = /* @__PURE__ */ F(""), a = /* @__PURE__ */ F(""), o = /* @__PURE__ */ F(""), s = /* @__PURE__ */ F(""), c = /* @__PURE__ */ F(!1), l = /* @__PURE__ */ F(""), u = /* @__PURE__ */ F(""), d = "", f = 0, p = !0, m = (e) => JSON.stringify(e.kind === "graph" ? [
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
	]), h = /* @__PURE__ */ N(() => t.view?.publishers.find((e) => e.id === t.view.selectedPortalId)), g = /* @__PURE__ */ N(() => !!t.view && !!U(h) && t.view.capabilities.rename && (t.view.renameMode === "presentation" ? t.view.canPresent : t.view.scope.kind === "graph" && !t.view.readOnly) && !!n().rename), _ = /* @__PURE__ */ N(() => t.view?.sources.find((e) => e.key === U(a) && e.direction === "output")), v = /* @__PURE__ */ N(() => t.view?.receivers.find((e) => e.key === U(o) && e.direction === "input" && e.kind === U(h)?.kind)), y = /* @__PURE__ */ N(() => !!U(h) && !!U(v) && (!U(v).occupied || U(c)) && C("connect") && !!n().connect), b = /* @__PURE__ */ N(() => !!U(h) && C("remove") && !!n().deletePublisher && (!t.view?.consumers.length || U(s) === "restore" || U(s) === "disconnect"));
	xn(() => {
		let e = t.view ? JSON.stringify([
			t.view.managerKey,
			t.view.revision,
			m(t.view.scope),
			t.view.selectedPortalId,
			t.view.renameMode
		]) : "";
		d !== e && (d = e, I(r, U(h)?.label ?? "", !0), I(i, ""), I(a, t.view?.sources.find((e) => e.nodeId === U(h)?.source.nodeId && e.portId === U(h)?.source.portId)?.key ?? "", !0), I(o, ""), I(s, ""), I(c, !1), I(l, ""), I(u, ""), f++);
	}), Ei(() => {
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
		I(l, ""), I(u, ""), f++;
	}
	async function T(e, n, r) {
		if (!t.view || !n || U(u)) return;
		let i = x(t.view), a = ++f, o = t.view.selectedPortalId;
		I(u, e, !0), I(l, "");
		try {
			let e = await r(i);
			p && a === f && t.view?.managerKey === i.managerKey && t.view.revision === i.revision && m(t.view.scope) === m(i.scope) && t.view.selectedPortalId === o && (I(u, ""), I(l, e.ok ? "" : e.error.code + ": " + e.error.message, !0));
		} catch (e) {
			p && a === f && t.view?.managerKey === i.managerKey && t.view.revision === i.revision && m(t.view.scope) === m(i.scope) && t.view.selectedPortalId === o && (I(u, ""), I(l, e instanceof Error ? e.message : "The portal change could not be accepted.", !0));
		}
	}
	var E = Rs(), D = L(E), O = z(L(D)), ee = (e) => {
		var t = xs();
		G("click", t, () => n().close?.()), q(e, t);
	};
	Y(O, (e) => {
		n().close && e(ee);
	}), M(D);
	var k = z(D, 2), te = (e) => {
		var d = Is(), f = R(d), p = L(f);
		M(f);
		var m = z(f, 2), E = z(L(m)), D = L(E);
		D.value = D.__value = "", X(z(D), 17, () => t.view.publishers, (e) => e.id, (e, t) => {
			var n = Ss(), r = L(n);
			M(n);
			var i = {};
			B(() => {
				J(r, `${U(t).label ?? ""} · ${U(t).kind ?? ""}`), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
			}), q(e, n);
		}), M(E);
		var O;
		ci(E), M(m);
		var ee = z(m, 2), k = (e) => {
			var i = Cs(), a = R(i), o = z(L(a));
			Z(o), M(a);
			var s = z(a, 2), c = L(s);
			M(s);
			var l = z(s, 2), d = L(l);
			M(l), B(() => {
				hi(o, U(r)), o.disabled = !U(g), J(c, `${t.view.renameMode === "presentation" ? "Local workspace label · not exported" : "Authored portal label"} · ${U(h).kind ?? ""}`), d.disabled = !U(g) || !!U(u);
			}), G("input", o, (e) => {
				I(r, e.currentTarget.value, !0), w();
			}), G("click", d, () => {
				let e = U(h)?.id, i = t.view?.renameMode, a = U(r);
				e && i && n().rename && T("rename", U(g), (t) => n().rename(t, e, a, i));
			}), q(e, i);
		}, te = (e) => {
			q(e, ws());
		};
		Y(ee, (e) => {
			U(h) ? e(k) : e(te, -1);
		});
		var ne = z(ee, 2), re = z(L(ne), 2), ie = z(L(re)), ae = L(ie);
		ae.value = ae.__value = "", X(z(ae), 17, () => t.view.sources, (e) => e.key, (e, t) => {
			var n = Ss(), r = L(n);
			M(n);
			var i = {};
			B(() => {
				J(r, `${U(t).label ?? ""} · ${U(t).kind ?? ""}`), i !== (i = U(t).key) && (n.value = (n.__value = U(t).key) ?? "");
			}), q(e, n);
		}), M(ie);
		var oe;
		ci(ie), M(re);
		var se = z(re, 2), ce = z(L(se));
		Z(ce), M(se);
		var le = z(se, 2), ue = L(le), de = z(ue, 2), fe = z(de, 2), pe = (e) => {
			var r = Ts();
			G("click", r, () => {
				t.view && U(h) && n().jumpSource?.(x(t.view), S(U(h).source));
			}), q(e, r);
		};
		Y(fe, (e) => {
			U(h) && n().jumpSource && e(pe);
		}), M(le), M(ne);
		var me = z(ne, 2), he = (e) => {
			var r = js(), i = z(L(r), 2), a = z(L(i)), l = L(a);
			l.value = l.__value = "", X(z(l), 17, () => t.view.receivers, (e) => e.key, (e, t) => {
				var n = Ss(), r = L(n);
				M(n);
				var i = {};
				B(() => {
					J(r, `${U(t).label ?? ""}${U(t).occupied ? " · Connected" : ""}`), i !== (i = U(t).key) && (n.value = (n.__value = U(t).key) ?? "");
				}), q(e, n);
			}), M(a);
			var d;
			ci(a), M(i);
			var f = z(i, 2), p = (e) => {
				var t = Es(), n = L(t);
				Z(n), Me(), M(t), B((e) => {
					gi(n, U(c)), n.disabled = e;
				}, [() => !C("connect")]), G("change", n, (e) => {
					I(c, e.currentTarget.checked, !0), w();
				}), q(e, t);
			};
			Y(f, (e) => {
				U(v)?.occupied && e(p);
			});
			var m = z(f, 2), g = L(m);
			M(m);
			var _ = z(m, 2);
			X(_, 17, () => t.view.consumers, (e) => e.edgeId, (e, r) => {
				var i = Os(), a = L(i), o = L(a, !0);
				M(a);
				var s = z(a), c = L(s), l = z(c, 2), d = (e) => {
					var i = Ds();
					G("click", i, () => {
						let e = t.view?.consumers.find((e) => e.edgeId === U(r).edgeId);
						t.view && e && n().jumpConsumer?.(x(t.view), e.edgeId, S(e.to));
					}), q(e, i);
				};
				Y(l, (e) => {
					n().jumpConsumer && e(d);
				}), M(s), M(i), B((e) => {
					J(o, U(r).label), c.disabled = e;
				}, [() => !C("restore") || !n().restoreWire || !!U(u)]), G("click", c, () => {
					let e = t.view?.consumers.find((e) => e.edgeId === U(r).edgeId);
					e && n().restoreWire && T("restore", C("restore"), (t) => n().restoreWire(t, e.edgeId));
				}), q(e, i);
			});
			var E = z(_, 2), D = (e) => {
				q(e, ks());
			};
			Y(E, (e) => {
				t.view.consumers.length || e(D);
			});
			var O = z(E, 2), ee = (e) => {
				var t = As(), n = z(L(t)), r = L(n);
				r.value = r.__value = "";
				var i = z(r);
				i.value = i.__value = "restore";
				var a = z(i);
				a.value = a.__value = "disconnect", M(n);
				var o;
				ci(n), M(t), B((e) => {
					n.disabled = e, o !== (o = U(s)) && (n.value = (n.__value = U(s)) ?? "", si(n, U(s)));
				}, [() => !C("remove")]), G("change", n, (e) => {
					I(s, e.currentTarget.value, !0), w();
				}), q(e, t);
			};
			Y(O, (e) => {
				t.view.consumers.length && e(ee);
			});
			var k = z(O, 2), te = L(k);
			M(k), M(r), B((e) => {
				a.disabled = e, d !== (d = U(o)) && (a.value = (a.__value = U(o)) ?? "", si(a, U(o))), g.disabled = !U(y) || !!U(u), te.disabled = !U(b) || !!U(u);
			}, [() => !C("connect") || !n().connect]), G("change", a, (e) => {
				I(o, e.currentTarget.value, !0), I(c, !1), w();
			}), G("click", g, () => {
				let e = U(v), t = U(h)?.id, r = U(c);
				e && t && n().connect && T("connect", U(y), (i) => n().connect(i, t, S(e), r));
			}), G("click", te, () => {
				let e = U(h)?.id, r = t.view?.consumers.length ? U(s) : "restore";
				e && (r === "restore" || r === "disconnect") && n().deletePublisher && T("remove", U(b), (t) => n().deletePublisher(t, e, r));
			}), q(e, r);
		};
		Y(me, (e) => {
			U(h) && e(he);
		});
		var ge = z(me, 2), _e = (e) => {
			var r = Ms(), i = z(L(r)), a = L(i, !0);
			M(i);
			var o = z(i), s = L(o), c = L(s);
			M(s), M(o), M(r), B((e) => {
				J(a, t.view.conversion.label), s.disabled = e, J(c, `Convert ${t.view.conversion.kind === "wire" ? "wire" : "output"}`);
			}, [() => !C("convert") || !!U(u) || (t.view.conversion.kind === "wire" ? !n().convertWire : !n().convertOutput)]), G("click", s, () => {
				let e = t.view?.conversion;
				e?.kind === "wire" && n().convertWire ? T("convert", C("convert"), (t) => n().convertWire(t, e.edgeId)) : e?.kind === "output" && n().convertOutput && T("convert", C("convert"), (t) => n().convertOutput(t, S(e.endpoint)));
			}), q(e, r);
		};
		Y(ge, (e) => {
			t.view.conversion && e(_e);
		});
		var ve = z(ge, 2), ye = (e) => {
			var n = Ns(), r = L(n, !0);
			M(n), B(() => J(r, t.view.issue)), q(e, n);
		};
		Y(ve, (e) => {
			t.view.issue && e(ye);
		});
		var be = z(ve, 2), xe = (e) => {
			var t = Ps(), n = L(t, !0);
			M(t), B(() => J(n, U(l))), q(e, t);
		};
		Y(be, (e) => {
			U(l) && e(xe);
		});
		var Se = z(be, 2), Ce = (e) => {
			q(e, Fs());
		};
		Y(Se, (e) => {
			U(u) && e(Ce);
		}), B((e, r, o, s) => {
			J(p, `${t.view.scopeLabel ?? ""}${t.view.readOnly ? " · Read-only graph" : ""}`), E.disabled = !n().selectPortal, O !== (O = t.view.selectedPortalId ?? "") && (E.value = (E.__value = t.view.selectedPortalId ?? "") ?? "", si(E, t.view.selectedPortalId ?? "")), ie.disabled = e, oe !== (oe = U(a)) && (ie.value = (ie.__value = U(a)) ?? "", si(ie, U(a))), hi(ce, U(i)), ce.disabled = r, ue.disabled = o, de.disabled = s;
		}, [
			() => !C("create") && !C("retarget"),
			() => !C("create") || !n().create,
			() => !C("create") || !n().create || !U(_) || !U(i).trim() || !!U(u),
			() => !C("retarget") || !n().retarget || !U(_) || !U(h) || !!U(u)
		]), G("change", E, (e) => {
			let r = e.currentTarget.value;
			e.currentTarget.selectedIndex >= 0 && t.view && n().selectPortal && (!r || t.view.publishers.some((e) => e.id === r)) && n().selectPortal(x(t.view), r || null);
		}), G("change", ie, (e) => {
			I(a, e.currentTarget.value, !0), w();
		}), G("input", ce, (e) => {
			I(i, e.currentTarget.value, !0), w();
		}), G("click", ue, () => {
			let e = U(_), t = U(i);
			e && t.trim() && n().create && T("create", C("create"), (r) => n().create(r, t, S(e)));
		}), G("click", de, () => {
			let e = U(_), t = U(h)?.id;
			e && t && n().retarget && T("retarget", C("retarget"), (r) => n().retarget(r, t, S(e)));
		}), q(e, d);
	}, ne = (e) => {
		q(e, Ls());
	};
	Y(k, (e) => {
		t.view ? e(te) : e(ne, -1);
	}), M(E), q(e, E), We();
}
br([
	"click",
	"change",
	"input"
]);
//#endregion
//#region ui/SubgraphSave.svelte
var Bs = /* @__PURE__ */ K("<option class=\"svelte-1n658sg\"> </option>"), Vs = /* @__PURE__ */ K("<p class=\"pc-save-error svelte-1n658sg\" role=\"alert\"> </p>"), Hs = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay svelte-1n658sg\"><div class=\"pc-workspace-dialog pc-subgraph-save svelte-1n658sg\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Save subgraph\" tabindex=\"-1\"><header class=\"svelte-1n658sg\"><h2 class=\"svelte-1n658sg\">Save subgraph</h2><button type=\"button\" aria-label=\"Close save subgraph\" class=\"svelte-1n658sg\">×</button></header> <form class=\"svelte-1n658sg\"><label class=\"svelte-1n658sg\">Name<input aria-label=\"Subgraph name\" maxlength=\"80\" class=\"svelte-1n658sg\"/></label> <label class=\"svelte-1n658sg\">Save as<select aria-label=\"Save as\" class=\"svelte-1n658sg\"><option class=\"svelte-1n658sg\">Save new subgraph</option><!></select></label> <p class=\"svelte-1n658sg\">Edits stay local until you save. Existing placed copies stay unchanged.</p> <!> <footer class=\"svelte-1n658sg\"><button type=\"button\" class=\"svelte-1n658sg\">Cancel</button><button type=\"submit\" data-save-subgraph=\"\" class=\"svelte-1n658sg\"> </button></footer></form></div></div>");
function Us(e, t) {
	Ue(t, !0);
	let n, r = /* @__PURE__ */ F(""), i = /* @__PURE__ */ F(""), a = /* @__PURE__ */ F(!1), o = /* @__PURE__ */ F(""), s = "", c = 0;
	xn(() => {
		if (t.view.key === s) return;
		s = t.view.key, c++, I(r, t.view.name, !0), I(i, t.view.targetId ?? "", !0), I(a, !1), I(o, "");
		let e = s;
		ur().then(() => {
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
		if (e.preventDefault(), !t.actions || !U(r).trim() || U(a) || U(i) && !t.view.entries.some((e) => e.id === U(i))) return;
		let n = t.view.key, s = ++c;
		I(a, !0), I(o, "");
		try {
			await t.actions.save(n, U(r), U(i) || null);
		} catch {
			t.view.key === n && s === c && I(o, "The subgraph could not be saved. Please try again.");
		} finally {
			t.view.key === n && s === c && I(a, !1);
		}
	}
	function u(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), t.actions?.close()), e.key === "Tab") {
			let t = [...n.querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled)")], r = t[0], i = t.at(-1);
			e.shiftKey && document.activeElement === r && (e.preventDefault(), i?.focus()), !e.shiftKey && document.activeElement === i && (e.preventDefault(), r?.focus());
		}
	}
	var d = Hs(), f = L(d), p = L(f), m = z(L(p));
	M(p);
	var h = z(p, 2), g = L(h), _ = z(L(g));
	Z(_), M(g);
	var v = z(g, 2), y = z(L(v)), b = L(y);
	b.value = b.__value = "", X(z(b), 17, () => t.view.entries, (e) => e.id, (e, t) => {
		var n = Bs(), r = L(n);
		M(n);
		var i = {};
		B(() => {
			J(r, `Update ${U(t).name ?? ""}`), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
		}), q(e, n);
	}), M(y), M(v);
	var x = z(v, 4), S = (e) => {
		var n = Vs(), r = L(n, !0);
		M(n), B(() => J(r, t.view.error || U(o))), q(e, n);
	};
	Y(x, (e) => {
		(t.view.error || U(o)) && e(S);
	});
	var C = z(x, 2), w = L(C), T = z(w), E = L(T, !0);
	M(T), M(C), M(h), M(f), $(f, (e) => n = e, () => n), M(d), B((e) => {
		T.disabled = e, J(E, U(a) ? "Saving…" : "Save");
	}, [() => !t.actions || !U(r).trim() || U(a)]), W("keydown", f, u, !0), W("paste", f, (e) => e.stopPropagation()), G("click", m, () => t.actions?.close()), W("submit", h, l), bi(_, () => U(r), (e) => I(r, e)), li(y, () => U(i), (e) => I(i, e)), G("click", w, () => t.actions?.close()), q(e, d), We();
}
br(["click"]);
//#endregion
//#region ui/NewWorkflowPrompt.svelte
var Ws = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay\"><div class=\"pc-workspace-dialog pc-new-workflow-prompt svelte-121ekho\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Save workflow changes?\" tabindex=\"-1\"><h2 class=\"svelte-121ekho\">Save workflow changes?</h2> <p class=\"svelte-121ekho\"><strong class=\"svelte-121ekho\"> </strong> has unsaved changes.</p> <p class=\"svelte-121ekho\">Save downloads workflow JSON before opening a new blank canvas. Your existing workflow stays in the workspace.</p> <footer class=\"svelte-121ekho\"><button type=\"button\" class=\"svelte-121ekho\">Save</button><button type=\"button\" class=\"svelte-121ekho\">Discard</button><button type=\"button\" class=\"svelte-121ekho\">Cancel</button></footer></div></div>");
function Gs(e, t) {
	Ue(t, !0);
	let n, r;
	Ti(() => {
		let e = document.activeElement;
		return r.focus({ preventScroll: !0 }), () => e?.focus({ preventScroll: !0 });
	});
	function i(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), t.actions?.choose("cancel")), e.key === "Tab") {
			let t = [...n.querySelectorAll("button:not(:disabled)")], r = t.indexOf(document.activeElement);
			e.shiftKey && r <= 0 && (e.preventDefault(), t.at(-1)?.focus()), !e.shiftKey && (r < 0 || r === t.length - 1) && (e.preventDefault(), t[0]?.focus());
		}
	}
	var a = Ws(), o = L(a), s = z(L(o), 2), c = L(s), l = L(c, !0);
	M(c), Me(), M(s);
	var u = z(s, 4), d = L(u), f = z(d), p = z(f);
	$(p, (e) => r = e, () => r), M(u), M(o), $(o, (e) => n = e, () => n), M(a), B(() => J(l, t.view.name)), W("keydown", o, i, !0), W("paste", o, (e) => e.stopPropagation(), !0), G("click", d, () => t.actions?.choose("save")), G("click", f, () => t.actions?.choose("discard")), G("click", p, () => t.actions?.choose("cancel")), q(e, a), We();
}
br(["click"]);
//#endregion
//#region ui/NodeSearch.svelte
var Ks = /* @__PURE__ */ K("<label class=\"pc-context-check svelte-golf61\"><input type=\"checkbox\" class=\"svelte-golf61\"/>Context sensitive</label>"), qs = /* @__PURE__ */ K("<span class=\"pc-search-context svelte-golf61\"> </span>"), Js = /* @__PURE__ */ K("<label class=\"pc-search-field svelte-golf61\"><input type=\"search\" aria-label=\"Search nodes and subgraphs\" placeholder=\"Search…\" autocomplete=\"off\" role=\"combobox\" aria-expanded=\"true\" class=\"svelte-golf61\"/></label> <!> <!>", 1), Ys = /* @__PURE__ */ K("<p class=\"pc-search-context svelte-golf61\">Choose the named port to connect.</p>"), Xs = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-search-result svelte-golf61\" role=\"option\"><span class=\"svelte-golf61\"> </span> <span class=\"pc-family svelte-golf61\"> </span></button>"), Zs = /* @__PURE__ */ K("<p class=\"pc-empty svelte-golf61\">No nodes match.</p>"), Qs = /* @__PURE__ */ K("<p class=\"pc-feedback svelte-golf61\" role=\"status\"> </p>"), $s = /* @__PURE__ */ K("<div class=\"pc-node-search svelte-golf61\" role=\"dialog\" aria-modal=\"false\" tabindex=\"-1\"><!> <div class=\"pc-search-results svelte-golf61\" role=\"listbox\"></div> <!></div>");
function ec(e, t) {
	let n = Mr();
	Ue(t, !0);
	let r = wi(t, "view", 3, null), i = wi(t, "actions", 19, () => ({})), a = /* @__PURE__ */ F(void 0), o = /* @__PURE__ */ F(void 0), s = /* @__PURE__ */ F(""), c = /* @__PURE__ */ F(0), l = /* @__PURE__ */ F(8), u = /* @__PURE__ */ F(8), d, f, p = (e) => [
		e.label,
		e.family,
		e.purpose ?? "",
		e.shortcode ?? "",
		...e.searchAliases ?? []
	].join(" ").toLocaleLowerCase(), m = /* @__PURE__ */ N(() => (r()?.choices ?? []).filter((e) => p(e).includes(U(s).toLocaleLowerCase().trim()))), h = /* @__PURE__ */ N(() => r()?.mode === "ports" ? r().ports : U(m)), g = (e) => "id" in e ? e.id : e.portId, _ = (e) => !!r()?.readOnly || "disabledReason" in e && !!e.disabledReason, v = /* @__PURE__ */ N(() => U(h).filter((e) => !_(e))), y = /* @__PURE__ */ N(() => U(v)[Math.min(U(c), Math.max(0, U(v).length - 1))]), b = (e) => ({
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
		I(l, Math.max(8, Math.min(r().screenAnchor.x, t - e.width - 8)), !0), I(u, Math.max(8, Math.min(r().screenAnchor.y, n - e.height - 8)), !0);
	}
	xn(() => {
		let e = r()?.key, t = r()?.mode, n = r()?.screenAnchor;
		if (e === void 0 || !n) return;
		let i = d !== e || f !== t;
		d !== e && I(s, ""), i && I(c, 0), d = e, f = t, ur().then(() => {
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
		].includes(e.key) ? (e.preventDefault(), I(c, e.key === "Home" ? 0 : e.key === "End" ? Math.max(0, U(v).length - 1) : U(v).length ? (U(c) + (e.key === "ArrowDown" ? 1 : -1) + U(v).length) % U(v).length : 0, !0)) : e.key === "Enter" && (e.preventDefault(), S(U(y)));
	}
	xn(() => {
		if (!r()) return;
		let e = (e) => {
			U(a) && !U(a).contains(e.target) && i().dismiss?.();
		};
		return window.addEventListener("pointerdown", e, !0), () => window.removeEventListener("pointerdown", e, !0);
	});
	var T = jr();
	W("resize", rn, x);
	var E = R(T), D = (e) => {
		var t = $s();
		let i;
		var d = L(t), f = (e) => {
			var t = Js(), i = R(t), a = L(i);
			Z(a), $(a, (e) => I(o, e), () => U(o)), M(i);
			var l = z(i, 2), u = (e) => {
				var t = Ks(), n = L(t);
				Z(n), Me(), M(t), B(() => {
					gi(n, r().contextSensitive), n.disabled = r().readOnly;
				}), G("change", n, C), q(e, t);
			};
			Y(l, (e) => {
				r().origin && e(u);
			});
			var d = z(l, 2), f = (e) => {
				var t = qs(), n = L(t, !0);
				M(t), B(() => J(n, (r().origin.dir === "out" ? "Accepts " : "Produces ") + r().origin.kind)), q(e, t);
			};
			Y(d, (e) => {
				r().origin && e(f);
			}), B((e) => {
				Q(a, "aria-controls", n + "-results"), Q(a, "aria-activedescendant", e);
			}, [() => U(y) ? n + "-item-" + U(h).indexOf(U(y)) : void 0]), G("input", a, () => I(c, 0)), bi(a, () => U(s), (e) => I(s, e)), q(e, t);
		}, p = (e) => {
			q(e, Ys());
		};
		Y(d, (e) => {
			r().mode === "nodes" ? e(f) : e(p, -1);
		});
		var m = z(d, 2);
		X(m, 21, () => U(h), (e) => g(e), (e, t) => {
			var r = Xs(), i = L(r), a = L(i, !0);
			M(i);
			var o = z(i, 1, !0);
			o.nodeValue = " ";
			var s = z(o);
			let l;
			var u = L(s, !0);
			M(s), M(r), B((e, n, i, o) => {
				Q(r, "aria-selected", U(y) === U(t)), Q(r, "id", e), Q(r, "data-choice", "id" in U(t) ? U(t).id : void 0), Q(r, "data-port", "portId" in U(t) ? U(t).portId : void 0), r.disabled = n, Q(r, "title", "disabledReason" in U(t) ? U(t).disabledReason : void 0), J(a, i), l = oi(s, "", l, o), J(u, "family" in U(t) ? U(t).family : U(t).kind);
			}, [
				() => n + "-item-" + U(h).indexOf(U(t)),
				() => _(U(t)),
				() => U(t).label || g(U(t)),
				() => ({ color: "family" in U(t) ? b(U(t).family) : void 0 })
			]), G("click", r, () => S(U(t))), W("focus", r, () => {
				let e = U(v).indexOf(U(t));
				e >= 0 && I(c, e, !0);
			}), q(e, r);
		}, (e) => {
			q(e, Zs());
		}), M(m);
		var x = z(m, 2), T = (e) => {
			var t = Qs(), n = L(t, !0);
			M(t), B(() => J(n, r().feedback)), q(e, t);
		};
		Y(x, (e) => {
			r().feedback && e(T);
		}), M(t), $(t, (e) => I(a, e), () => U(a)), B(() => {
			Q(t, "aria-label", r().mode === "ports" ? "Choose connection port" : "Add node"), i = oi(t, "", i, {
				left: `${U(l) ?? ""}px`,
				top: `${U(u) ?? ""}px`
			}), Q(m, "id", n + "-results"), Q(m, "aria-label", r().mode === "ports" ? "Compatible ports" : "Nodes and subgraphs");
		}), G("keydown", t, w), q(e, t);
	};
	Y(E, (e) => {
		r() && e(D);
	}), q(e, T), We();
}
br([
	"keydown",
	"input",
	"change",
	"click"
]);
//#endregion
//#region ui/PinMenu.svelte
var tc = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-pin-action svelte-i73q0t\"> </button>"), nc = /* @__PURE__ */ K("<p class=\"pc-empty svelte-i73q0t\">No attached links.</p>"), rc = /* @__PURE__ */ K("<div class=\"pc-pin-menu svelte-i73q0t\" role=\"dialog\" aria-label=\"Pin actions\" aria-modal=\"false\" tabindex=\"-1\"><div class=\"pc-menu-head svelte-i73q0t\"><h2 class=\"svelte-i73q0t\"> </h2><button type=\"button\" aria-label=\"Close pin actions\" class=\"svelte-i73q0t\">Close</button></div> <p class=\"pc-kind svelte-i73q0t\"> </p> <!></div>");
function ic(e, t) {
	Ue(t, !0);
	let n = wi(t, "view", 3, null), r = wi(t, "actions", 19, () => ({})), i = /* @__PURE__ */ F(void 0), a = /* @__PURE__ */ F(8), o = /* @__PURE__ */ F(8), s, c = (e) => !!e.disabled || !!n()?.readOnly && e.capability !== "navigation";
	function l() {
		if (!n() || !U(i)) return;
		let e = U(i).getBoundingClientRect(), t = document.documentElement.clientWidth || window.innerWidth, r = document.documentElement.clientHeight || window.innerHeight;
		I(a, Math.max(8, Math.min(n().screenAnchor.x, t - e.width - 8)), !0), I(o, Math.max(8, Math.min(n().screenAnchor.y, r - e.height - 8)), !0);
	}
	xn(() => {
		let e = n()?.key, t = n()?.screenAnchor;
		if (e === void 0 || !t) return;
		let r = s !== e;
		s = e, ur().then(() => {
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
	var f = jr();
	W("resize", rn, l);
	var p = R(f), m = (e) => {
		var t = rc();
		let s;
		var l = L(t), f = L(l), p = L(f, !0);
		M(f);
		var m = z(f);
		M(l);
		var h = z(l, 2), g = L(h);
		M(h), X(z(h, 2), 17, () => n().entries, (e) => e.id, (e, t) => {
			var n = tc(), r = L(n, !0);
			M(n), B((e) => {
				Q(n, "data-entry", U(t).id), n.disabled = e, Q(n, "title", U(t).reason), J(r, U(t).label);
			}, [() => c(U(t))]), G("click", n, () => u(U(t))), q(e, n);
		}, (e) => {
			q(e, nc());
		}), M(t), $(t, (e) => I(i, e), () => U(i)), B(() => {
			s = oi(t, "", s, {
				left: `${U(a) ?? ""}px`,
				top: `${U(o) ?? ""}px`
			}), J(p, n().title), J(g, `${n().kind ?? ""}${n().readOnly ? " · Read only" : ""}`);
		}), G("keydown", t, d), G("click", m, () => r().dismiss?.()), q(e, t);
	};
	Y(p, (e) => {
		n() && e(m);
	}), q(e, f), We();
}
br(["keydown", "click"]);
//#endregion
//#region src/ui/node-palette.js
var ac = "M3 7 12 2l9 5v10l-9 5-9-5ZM3 7l9 5 9-5M12 12v10", oc = "M3 6l4-2 4 2v5l-4 2-4-2ZM3 6l4 2 4-2M7 8v5M13 6l4-2 4 2v5l-4 2-4-2ZM13 6l4 2 4-2M17 8v5M8 15l4-2 4 2v5l-4 2-4-2ZM8 15l4 2 4-2M12 17v5", sc = Object.freeze([
	{
		name: "Input",
		color: "#96ad52",
		icon: ac
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
		icon: ac
	},
	{
		name: "Subgraphs",
		color: "#a3aa99",
		icon: oc
	}
].map((e) => Object.freeze(e))), cc = {
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
	Library: oc,
	Routing: "M3 12h18m-7-7 7 7-7 7",
	Blocks: ac,
	Reflect: "M21 12s-4-7-9-7-9 7-9 7 4 7 9 7 9-7 9-7ZM15 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0",
	Internalize: "M4 4h16v16H4M8 8l4 4 4-4M12 12v5",
	Express: "M4 4h16v12H9l-5 4ZM8 8h8M8 12h5",
	Memory: "M5 3h14v18H5ZM8 7h8M8 11h8M8 15h5",
	State: "M3 12h4l3-7 4 14 3-7h4"
}, lc = Object.freeze(Object.fromEntries(Object.entries(cc).map(([e, t]) => [e, Object.freeze({
	name: e,
	icon: t
})]))), uc = {
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
		cc.Planning
	],
	compose: [
		"Assembly",
		"co",
		cc.Assembly
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
		cc.Validation
	],
	"json-decode": [
		"Parsing",
		"jd",
		cc.Parsing
	],
	"select-fields": [
		"Extraction",
		"sf",
		cc.Extraction
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
		cc.Delivery
	],
	reroute: [
		"Routing",
		"rt",
		cc.Routing
	],
	reflect: [
		"Reflect",
		"rf",
		cc.Reflect
	],
	internalize: [
		"Internalize",
		"in",
		cc.Internalize
	],
	express: [
		"Express",
		"ex",
		cc.Express
	],
	context: [
		"Context",
		"cx",
		cc.Context
	],
	memory: [
		"Memory",
		"mm",
		cc.Memory
	],
	state: [
		"State",
		"sv",
		cc.State
	]
}, dc = Object.freeze(Object.fromEntries(Object.entries(uc).map(([e, [t, n, r]]) => [e, Object.freeze({
	group: t,
	shortcode: n,
	icon: r
})]))), fc = Object.freeze({
	group: "Blocks",
	shortcode: "",
	icon: ac
}), pc = (e) => Object.hasOwn(dc, e) ? dc[e] : fc, mc = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-family-row\" aria-haspopup=\"menu\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path></path></svg><span> </span></button>"), hc = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\">‹ Families</button>"), gc = /* @__PURE__ */ K("<input class=\"text_pole\" aria-label=\"Search nodes\" placeholder=\"Search nodes…\"/>"), _c = /* @__PURE__ */ K("<div class=\"pc-shelf-group svelte-hk6fzp\" role=\"presentation\"> </div>"), vc = /* @__PURE__ */ K("<!> <button type=\"button\" role=\"menuitem\" class=\"svelte-hk6fzp\"><svg class=\"pc-leaf-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path></path></svg><span class=\"pc-catalog-name\"> </span><small> </small></button>", 1), yc = /* @__PURE__ */ K("<div role=\"menu\" tabindex=\"-1\"><!> <!> <!></div>"), bc = /* @__PURE__ */ K("<div class=\"pc-shelf-menu pc-shelf-subgraph-menu svelte-hk6fzp\" role=\"menu\" tabindex=\"-1\"><button type=\"button\" role=\"menuitem\" data-shelf-subgraph-action=\"open\">Open saved definition</button> <button type=\"button\" role=\"menuitem\" data-shelf-subgraph-action=\"delete\">Delete</button></div>"), xc = /* @__PURE__ */ K("<div class=\"pc-shelf-drag-preview svelte-hk6fzp\" aria-hidden=\"true\"> </div>"), Sc = /* @__PURE__ */ K("<nav aria-label=\"Node families\"></nav> <!> <!> <!>", 1);
function Cc(e, t) {
	Ue(t, !0);
	let n = wi(t, "readOnly", 3, !1), r, i = /* @__PURE__ */ F(null), a = /* @__PURE__ */ F(""), o = /* @__PURE__ */ F(!1), s = /* @__PURE__ */ F(""), c = /* @__PURE__ */ F(!1), l = /* @__PURE__ */ F(0), u = /* @__PURE__ */ F(0), d = null, f = 0, p = /* @__PURE__ */ F(null), m = /* @__PURE__ */ F(null), h = null, g = sc.map((e) => e.name), _ = (e) => sc.find((t) => t.name === e)?.color, v = null, y = null, b = null, x = /* @__PURE__ */ F(null);
	function S() {
		y !== null && clearTimeout(y), y = null;
		let e = v;
		v = null, I(x, null), document.body.classList.remove("pc-shelf-dragging"), e?.button.hasPointerCapture?.(e.pointerId) && e.button.releasePointerCapture(e.pointerId);
	}
	function C() {
		v && (y !== null && clearTimeout(y), y = null, b = v.button, document.body.classList.add("pc-shelf-dragging"), I(x, {
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
		}, !U(x) && Math.hypot(e.clientX - v.start.x, e.clientY - v.start.y) >= 5 && C(), U(x) && (e.preventDefault(), I(x, {
			...U(x),
			...v.point
		}, !0)));
	}
	function E(e) {
		if (!v || e.pointerId !== v.pointerId) return;
		let t = v.entry, n = !!U(x), i = n ? document.elementFromPoint(e.clientX, e.clientY) : null, a = r.closest(".pc-canvas-area")?.querySelector(".pc-canvas-host");
		S(), n && (e.preventDefault(), e.stopPropagation(), i && a?.contains(i) && oe(t, {
			x: e.clientX,
			y: e.clientY
		}));
	}
	function D(e, t) {
		e.currentTarget === b && e.detail !== 0 ? b = null : oe(t);
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
				let i = n.id.startsWith("operation:") ? n.id.split(":")[1] : "", a = pc(i), o = i ? n.label.split(" · ")[0] : n.label, s = n.id.startsWith("boundary:");
				return {
					...n,
					title: o,
					compatible: !n.disabledReason && !!t.choose,
					catalog: !0,
					shortcode: i ? a.shortcode || n.shortcode || "" : n.shortcode ?? a.shortcode,
					group: e === "Subgraphs" ? s ? "Interface" : "Library" : void 0,
					icon: e === "Subgraphs" ? s ? lc.Routing.icon : lc.Library.icon : a.icon,
					searchAliases: r
				};
			});
		}
		let n = t.view?.families.find((t) => t.name === e);
		return n ? n.operations.filter((t) => e !== "Surface" || !["pattern-scan", "validate-patches"].includes(t.id)).map((t) => ({
			...t,
			...pc(t.id),
			family: e
		})) : [];
	}
	function ee(e = !1) {
		I(p, null), e && h?.focus({ preventScroll: !0 });
	}
	function k(e = !1) {
		S(), f++, I(a, ""), I(o, !1), ee(), e && d?.focus({ preventScroll: !0 });
	}
	xn(() => (t.view?.graphId, t.choices, n(), () => k()));
	function te() {
		let e = r.closest(".pc-canvas-area"), t = e.getBoundingClientRect();
		return {
			left: t.left + e.clientLeft,
			top: t.top + e.clientTop,
			right: t.right - e.clientLeft,
			width: e.clientWidth,
			height: e.clientHeight
		};
	}
	function ne(e, t, n, r) {
		let i = te(), a = i.right - e.right - 6, o = e.left - i.left - 6, s = a >= t || o >= t, c = a >= t ? e.right - i.left + 3 : o >= t ? e.left - i.left - t - 3 : 13;
		return {
			x: Math.max(4, Math.min(c, i.width - t - 4)),
			y: Math.max(4, Math.min(e.top - i.top, i.height - n - 4)),
			compact: !s || i.width < t + r + 26
		};
	}
	function re(e, t, n) {
		let r = t.querySelector("button")?.getBoundingClientRect();
		return r ? e.top + (e.height - r.height) / 2 - (r.top - n.top) : e.top;
	}
	async function ie(e, t, n = !0) {
		if (v) return;
		if (ee(), U(a) === e) {
			n && U(i)?.querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
			return;
		}
		let r = ++f;
		if (I(a, e, !0), I(o, !1), d = t, await ur(), r !== f || U(a) !== e || !U(i)?.isConnected) return;
		let s = t.getBoundingClientRect(), p = U(i).getBoundingClientRect(), m = ne({
			top: re(s, U(i), p),
			left: s.left,
			right: s.right
		}, p.width, p.height, 128);
		I(l, m.x, !0), I(u, m.y, !0), I(c, m.compact, !0), n && U(i).querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
	}
	async function ae() {
		let e = ++f;
		if (I(a, ""), I(o, !0), I(s, ""), await ur(), e !== f || !U(o) || !U(i)?.isConnected) return;
		let t = te();
		I(l, Math.min(136, Math.max(4, t.width - 254)), !0), I(u, 13), U(i).querySelector("input")?.focus();
	}
	function oe(e, r) {
		let i = O(e.family).find((t) => t.id === e.id);
		i?.compatible && !n() && (k(!0), r ? i.catalog ? t.choose?.(i.id, r) : t.add(i.id, r) : i.catalog ? t.choose?.(i.id) : t.add(i.id));
	}
	async function se(e, n) {
		let r = O("Subgraphs").find((t) => t.id === e.dataset.shelfChoice);
		if (!r?.definitionRef || !t.shelfSubgraph) return;
		let i = te(), a = e.getBoundingClientRect();
		if (h = e, I(p, {
			id: r.id,
			title: r.title,
			x: (n?.x ?? a.right) - i.left,
			y: (n?.y ?? a.top) - i.top
		}, !0), await ur(), !U(p) || U(p).id !== r.id || !U(m)?.isConnected) return;
		let o = U(m).getBoundingClientRect();
		I(p, {
			...U(p),
			x: Math.max(4, Math.min(U(p).x, i.width - o.width - 4)),
			y: Math.max(4, Math.min(U(p).y, i.height - o.height - 4))
		}, !0), U(m).querySelector("button")?.focus({ preventScroll: !0 });
	}
	function ce(e) {
		let n = e.target.closest("[data-shelf-choice]");
		n && O("Subgraphs").some((e) => e.id === n.dataset.shelfChoice && e.definitionRef) && t.shelfSubgraph && (e.preventDefault(), e.stopPropagation(), se(n, {
			x: e.clientX,
			y: e.clientY
		}));
	}
	function le(e) {
		let n = O("Subgraphs").find((e) => e.id === U(p)?.id);
		k(!0), n?.definitionRef && t.shelfSubgraph?.(n.id, e);
	}
	function ue(e) {
		if ((e.key === "ContextMenu" || e.key === "F10" && e.shiftKey) && e.target.dataset.shelfChoice) {
			e.preventDefault(), e.stopPropagation(), se(e.target);
			return;
		}
		if (U(p) && e.key === "Escape") {
			e.preventDefault(), e.stopPropagation(), ee(!0);
			return;
		}
		if (e.key === "Escape") {
			e.preventDefault(), e.stopPropagation(), k(!0);
			return;
		}
		let t = e.target;
		if (e.key === "ArrowRight" && t.dataset.family && !t.disabled) {
			e.preventDefault(), e.stopPropagation(), ie(t.dataset.family, t);
			return;
		}
		if (e.key === "ArrowLeft" && U(a)) {
			e.preventDefault(), e.stopPropagation(), k(!0);
			return;
		}
		if (e.key === "Tab") {
			k();
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
	var de = { openSearch: ae }, fe = Sc();
	W("pointerdown", rn, (e) => {
		e.target.closest(".pc-node-shelf, .pc-shelf-menu") || k();
	}), W("pointermove", rn, T), W("pointerup", rn, E), W("pointercancel", rn, () => S()), W("blur", rn, () => k()), W("resize", rn, () => k()), W("keydown", rn, (e) => {
		v && e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), k(!0));
	});
	var pe = R(fe);
	X(pe, 21, () => sc, Vr, (e, t) => {
		var n = mc();
		let r;
		var i = L(n), o = L(i);
		M(i);
		var s = z(i), c = L(s, !0);
		M(s), M(n), B((e) => {
			Q(n, "data-family", U(t).name), n.disabled = e, Q(n, "title", "Browse " + U(t).name + " nodes"), Q(n, "aria-expanded", U(a) === U(t).name), r = oi(n, "", r, { "--pc-family": U(t).color }), Q(o, "d", U(t).icon), J(c, U(t).name);
		}, [() => !O(U(t).name).length]), G("click", n, (e) => ie(U(t).name, e.currentTarget)), W("pointerenter", n, (e) => {
			e.pointerType !== "touch" && !e.currentTarget.disabled && ie(U(t).name, e.currentTarget, !1);
		}), G("keydown", n, ue), q(e, n);
	}), M(pe), $(pe, (e) => r = e, () => r);
	var me = z(pe, 2), he = (e) => {
		let r = /* @__PURE__ */ N(() => U(o) ? g.flatMap((e) => O(e)).filter((e) => [
			e.title,
			e.id,
			e.family,
			e.purpose,
			e.shortcode,
			...e.searchAliases ?? []
		].join(" ").toLowerCase().includes(U(s).toLowerCase())) : O());
		var d = yc();
		let f;
		var p = L(d), m = (e) => {
			var t = hc();
			G("click", t, () => k(!0)), q(e, t);
		};
		Y(p, (e) => {
			U(c) && U(a) && e(m);
		});
		var h = z(p, 2), v = (e) => {
			var t = gc();
			Z(t), bi(t, () => U(s), (e) => I(s, e)), q(e, t);
		};
		Y(h, (e) => {
			U(o) && e(v);
		}), X(z(h, 2), 19, () => U(r), (e) => e.family + e.id, (e, i, a) => {
			let s = /* @__PURE__ */ N(() => !U(i).compatible || n()), c = /* @__PURE__ */ N(() => !!U(i).definitionRef && !!t.shelfSubgraph);
			var l = vc(), u = R(l), d = (e) => {
				var t = _c(), n = L(t, !0);
				M(t), B(() => {
					Q(t, "data-shelf-group", U(i).group), J(n, U(i).group);
				}), q(e, t);
			};
			Y(u, (e) => {
				!U(o) && U(i).group && U(r)[U(a) - 1]?.group !== U(i).group && e(d);
			});
			var f = z(u, 2);
			let p;
			var m = L(f), h = L(m);
			M(m);
			var g = z(m), v = L(g, !0);
			M(g);
			var y = z(g), b = L(y, !0);
			M(y), M(f), B((e) => {
				Q(f, "data-shelf-choice", U(i).id), Q(f, "data-insertion-disabled", U(s)), f.disabled = U(s) && !U(c), Q(f, "aria-disabled", U(s) && !U(c)), Q(f, "aria-haspopup", U(c) ? "menu" : void 0), Q(f, "title", n() ? U(c) ? "This graph is read-only. Right-click for subgraph actions." : "This graph is read-only." : U(i).disabledReason || (U(i).compatible ? U(i).purpose || "Add " + U(i).title : "Requires the " + U(i).phase + " phase")), p = oi(f, "", p, e), Q(h, "d", U(i).icon), J(v, U(i).title), J(b, U(i).shortcode);
			}, [() => ({ "--pc-family": _(U(i).family) })]), G("pointerdown", f, (e) => w(e, U(i))), W("lostpointercapture", f, () => S()), G("click", f, (e) => D(e, U(i))), q(e, l);
		}), M(d), $(d, (e) => I(i, e), () => U(i)), B((e) => {
			ii(d, 1, `pc-shelf-menu ${U(o) ? "pc-leaf-menu" : "pc-family-menu"}`, "svelte-hk6fzp"), Q(d, "aria-label", U(o) ? "Search nodes" : U(a) + " nodes"), f = oi(d, "", f, e);
		}, [() => ({
			left: `${U(l)}px`,
			top: `${U(u)}px`,
			"--pc-family": _(U(a))
		})]), G("keydown", d, ue), G("contextmenu", d, ce), q(e, d);
	};
	Y(me, (e) => {
		(U(a) || U(o)) && e(he);
	});
	var ge = z(me, 2), _e = (e) => {
		var t = bc();
		let n;
		var r = L(t), i = z(r, 2);
		M(t), $(t, (e) => I(m, e), () => U(m)), B(() => {
			Q(t, "aria-label", U(p).title + " actions"), n = oi(t, "", n, {
				left: `${U(p).x}px`,
				top: `${U(p).y}px`
			});
		}), G("keydown", t, ue), G("click", r, () => le("open")), G("click", i, () => le("delete")), q(e, t);
	};
	Y(ge, (e) => {
		U(p) && e(_e);
	});
	var ve = z(ge, 2), ye = (e) => {
		var t = xc();
		let n;
		var r = L(t, !0);
		M(t), B((e) => {
			n = oi(t, "", n, e), J(r, U(x).title);
		}, [() => ({
			"--pc-family": _(U(x).family),
			left: `${U(x).x + 12}px`,
			top: `${U(x).y + 12}px`
		})]), q(e, t);
	};
	return Y(ve, (e) => {
		U(x) && e(ye);
	}), B(() => ii(pe, 1, `pc-node-shelf${U(c) && U(a) ? " pc-shelf-replaced" : ""}`, "svelte-hk6fzp")), q(e, fe), We(de);
}
br([
	"click",
	"keydown",
	"contextmenu",
	"pointerdown"
]);
//#endregion
//#region ui/WorkflowSetup.svelte
var wc = /* @__PURE__ */ K("<option> </option>"), Tc = /* @__PURE__ */ K("<label> <select class=\"text_pole\"><option>Choose a connection</option><!></select></label> <label> <input class=\"text_pole\" placeholder=\"Use profile model\"/></label>", 1), Ec = /* @__PURE__ */ K("<p class=\"pc-error\"> </p>"), Dc = /* @__PURE__ */ K("<article class=\"pc-workflow-starter\"><strong> </strong><p> </p><small> </small><button type=\"button\" class=\"pc-btn menu_button\"> </button></article>"), Oc = /* @__PURE__ */ K("<h3> </h3> <p> </p> <p> </p> <!> <button type=\"button\" class=\"pc-btn menu_button\"> </button> <p> </p> <!> <h3>Workflow examples</h3> <!>", 1);
function kc(e, t) {
	Ue(t, !0);
	var n = jr(), r = R(n), i = (e) => {
		var n = Oc(), r = R(n), i = L(r, !0);
		M(r);
		var a = z(r, 2), o = L(a, !0);
		M(a);
		var s = z(a, 2), c = L(s);
		M(s);
		var l = z(s, 2);
		X(l, 17, () => t.view.roles, (e) => e.name, (e, n) => {
			var r = Tc(), i = R(r), a = L(i), o = z(a), s = L(o);
			s.value = s.__value = "", X(z(s), 17, () => t.view.profiles, (e) => e.id, (e, t) => {
				var n = wc(), r = L(n, !0);
				M(n);
				var i = {};
				B(() => {
					J(r, U(t).name), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
				}), q(e, n);
			}), M(o);
			var c;
			ci(o), M(i);
			var l = z(i, 2), u = L(l), d = z(u);
			Z(d), M(l), B(() => {
				J(a, `${U(n).name ?? ""} connection`), Q(o, "aria-label", U(n).name + " connection"), c !== (c = U(n).profileId) && (o.value = (o.__value = U(n).profileId) ?? "", si(o, U(n).profileId)), J(u, `${U(n).name ?? ""} model override`), hi(d, U(n).model);
			}), G("change", o, (e) => t.actions.workflowSetup?.bindRole(U(n).name, e.currentTarget.value, U(n).model)), G("input", d, (e) => t.actions.workflowSetup?.bindRole(U(n).name, U(n).profileId, e.currentTarget.value)), q(e, r);
		});
		var u = z(l, 2), d = L(u);
		M(u);
		var f = z(u, 2), p = L(f);
		M(f);
		var m = z(f, 2);
		X(m, 17, () => t.view.issues, Vr, (e, t) => {
			var n = Ec(), r = L(n, !0);
			M(n), B(() => J(r, U(t))), q(e, n);
		}), X(z(m, 4), 17, () => t.view.starters, (e) => e.id, (e, n) => {
			var r = Dc(), i = L(r), a = L(i, !0);
			M(i);
			var o = z(i), s = L(o, !0);
			M(o);
			var c = z(o), l = L(c);
			M(c);
			var u = z(c), d = L(u);
			M(u), M(r), B(() => {
				J(a, U(n).title), J(s, U(n).purpose), J(l, `${U(n).phase === "pre" ? "Before reply" : "After reply"} · Maximum ${U(n).callBound ?? ""} auxiliary requests`), J(d, `Install ${U(n).title ?? ""}`);
			}), G("click", u, () => t.actions.workflowSetup?.install(U(n).id)), q(e, r);
		}), B(() => {
			J(i, t.view.name), J(o, t.view.phase === "pre" ? "Guidance helps SillyTavern plan its normal reply." : "Review a revision of the latest completed assistant reply."), J(c, `Maximum auxiliary requests: ${t.view.callBound ?? ""}`), J(d, `Assign ${t.view.phase ?? ""} phase`), J(p, `${t.view.assigned ? "Assigned to this phase." : "Phase is not assigned."} Arming is a separate action.`);
		}), G("click", u, () => t.actions.workflowSetup?.assign(t.view?.phase || "")), q(e, n);
	};
	Y(r, (e) => {
		t.view && e(i);
	}), q(e, n), We();
}
br([
	"change",
	"input",
	"click"
]);
//#endregion
//#region ui/ExamplesBrowser.svelte
var Ac = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-btn menu_button svelte-18p7ib8\">Retry</button>"), jc = /* @__PURE__ */ K("<div class=\"pc-examples-issue svelte-18p7ib8\" role=\"alert\"><span class=\"svelte-18p7ib8\"> </span><!></div>"), Mc = /* @__PURE__ */ kr("<g class=\"pc-example-comment svelte-18p7ib8\"><rect rx=\"4\" class=\"svelte-18p7ib8\"></rect><text class=\"svelte-18p7ib8\"> </text></g>"), Nc = /* @__PURE__ */ kr("<path class=\"pc-wire pc-wire-native svelte-18p7ib8\"></path>"), Pc = /* @__PURE__ */ kr("<circle class=\"pc-example-pin-dot svelte-18p7ib8\" r=\"4\"></circle><path class=\"pc-example-pin-cue svelte-18p7ib8\"></path><text class=\"pc-example-pin-label svelte-18p7ib8\"> </text>", 1), Fc = /* @__PURE__ */ kr("<g><rect class=\"pc-example-card svelte-18p7ib8\" rx=\"4\"></rect><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\"><path class=\"pc-example-icon svelte-18p7ib8\"></path></svg><text class=\"pc-example-node-title svelte-18p7ib8\" lengthAdjust=\"spacingAndGlyphs\"> </text><!></g>"), Ic = /* @__PURE__ */ kr("<svg class=\"pc-example-preview svelte-18p7ib8\" preserveAspectRatio=\"xMidYMid meet\" aria-hidden=\"true\" focusable=\"false\"><!><!><!></svg>"), Lc = /* @__PURE__ */ K("<span class=\"pc-example-unavailable-preview svelte-18p7ib8\"><strong class=\"svelte-18p7ib8\">Unavailable</strong><span class=\"svelte-18p7ib8\"> </span></span>"), Rc = /* @__PURE__ */ K("<button type=\"button\"><!> <span class=\"pc-example-title svelte-18p7ib8\"> </span></button>"), zc = /* @__PURE__ */ K("<!> <div class=\"pc-examples-grid svelte-18p7ib8\"></div>", 1);
function Bc(e, t) {
	Ue(t, !0);
	let n = {
		context: "M -4,0 a 4,4 0 1,0 8,0 a 4,4 0 1,0 -8,0",
		text: "M -3.4,0 a 3.4,3.4 0 1,0 6.8,0 a 3.4,3.4 0 1,0 -6.8,0",
		data: "M -4,-4 H 4 V 4 H -4 Z",
		guidance: "M 0,-5 L 5,0 L 0,5 L -5,0 Z",
		draft: "M 0,-5 L 4.76,-1.55 L 2.94,4.05 L -2.94,4.05 L -4.76,-1.55 Z",
		findings: "M 0,-5 L 4.33,3 L -4.33,3 Z",
		patches: "M -2.5,-4.33 L 2.5,-4.33 L 5,0 L 2.5,4.33 L -2.5,4.33 L -5,0 Z",
		candidate: "M -1.5,-5 H 1.5 V -1.5 H 5 V 1.5 H 1.5 V 5 H -1.5 V 1.5 H -5 V -1.5 H -1.5 Z"
	}, r = wi(t, "examples", 19, () => []), i = wi(t, "issue", 3, ""), a = wi(t, "scrollTop", 3, 0), o, s = /* @__PURE__ */ F("");
	Ti(() => {
		o.scrollTop = a();
	});
	async function c(e) {
		if (!U(s)) {
			I(s, e, !0);
			try {
				await t.open(e);
			} finally {
				I(s, "");
			}
		}
	}
	var l = zc(), u = R(l), d = (e) => {
		var n = jc(), r = L(n), a = L(r, !0);
		M(r);
		var o = z(r), s = (e) => {
			var n = Ac();
			G("click", n, () => t.retry?.()), q(e, n);
		};
		Y(o, (e) => {
			t.retry && e(s);
		}), M(n), B(() => J(a, i())), q(e, n);
	};
	Y(u, (e) => {
		i() && e(d);
	});
	var f = z(u, 2);
	X(f, 21, r, (e) => e.id, (e, t) => {
		let r = /* @__PURE__ */ N(() => U(t).thumbnail);
		var i = Rc();
		let a;
		var o = L(i), l = (e) => {
			var t = Ic(), i = L(t);
			X(i, 17, () => U(r).comments, (e) => e.id, (e, t) => {
				var n = Mc(), r = L(n);
				let i;
				var a = z(r), o = L(a, !0);
				M(a), M(n), B(() => {
					Q(n, "data-id", U(t).id), Q(r, "x", U(t).x), Q(r, "y", U(t).y), Q(r, "width", U(t).w), Q(r, "height", U(t).h), i = oi(r, "", i, { stroke: U(t).color }), Q(a, "x", U(t).x + 12), Q(a, "y", U(t).y + 24), J(o, U(t).title);
				}), q(e, n);
			});
			var a = z(i);
			X(a, 17, () => U(r).wires, (e) => e.id, (e, t) => {
				var n = Nc();
				B(() => {
					Q(n, "data-kind", U(t).kind), Q(n, "data-id", U(t).id), Q(n, "d", U(t).d);
				}), q(e, n);
			}), X(z(a), 17, () => U(r).nodes, (e) => e.id, (e, t) => {
				var r = Fc(), i = L(r), a = z(i), o = L(a);
				M(a);
				var s = z(a), c = L(s, !0);
				M(s), X(z(s), 17, () => U(t).ports, (e) => e.id, (e, t) => {
					var r = Pc(), i = R(r), a = z(i), o = z(a), s = L(o, !0);
					M(o), B(() => {
						Q(i, "data-kind", U(t).kind), Q(i, "cx", U(t).x), Q(i, "cy", U(t).y), Q(a, "data-kind", U(t).kind), Q(a, "transform", `translate(${U(t).x} ${U(t).y})`), Q(a, "d", n[U(t).kind] ?? n.context), Q(o, "x", U(t).x + (U(t).dir === "in" ? 9 : -9)), Q(o, "y", U(t).y + 4), Q(o, "text-anchor", U(t).dir === "in" ? "start" : "end"), J(s, U(t).label);
					}), q(e, r);
				}), M(r), B(() => {
					ii(r, 0, Qr(U(t).className), "svelte-18p7ib8"), Q(r, "data-id", U(t).id), Q(i, "x", U(t).x), Q(i, "y", U(t).y), Q(i, "width", U(t).w), Q(i, "height", U(t).h), Q(a, "x", U(t).x + 8), Q(a, "y", U(t).y + 7), Q(o, "d", U(t).iconPath), Q(s, "x", U(t).x + 28), Q(s, "y", U(t).y + 20), Q(s, "textLength", U(t).title.length * 6 > U(t).w - 36 ? U(t).w - 36 : void 0), J(c, U(t).title);
				}), q(e, r);
			}), M(t), B(() => Q(t, "viewBox", `${U(r).bounds.x} ${U(r).bounds.y} ${U(r).bounds.w} ${U(r).bounds.h}`)), q(e, t);
		}, u = (e) => {
			var n = Lc(), r = z(L(n)), i = L(r, !0);
			M(r), M(n), B(() => {
				Q(r, "id", `pc-example-issue-${U(t).number}`), J(i, U(t).issue);
			}), q(e, n);
		};
		Y(o, (e) => {
			U(r) ? e(l) : e(u, -1);
		});
		var d = z(o, 2), f = L(d, !0);
		M(d), M(i), B(() => {
			a = ii(i, 1, "pc-example-tile svelte-18p7ib8", null, a, { "pc-example-unavailable": !U(r) }), Q(i, "aria-label", U(t).title), Q(i, "aria-describedby", U(t).issue ? `pc-example-issue-${U(t).number}` : void 0), Q(i, "title", U(t).issue || U(t).goal), i.disabled = !!U(s) || !U(r), J(f, U(t).title);
		}), G("click", i, () => c(U(t).id)), q(e, i);
	}), M(f), $(f, (e) => o = e, () => o), B(() => Q(f, "aria-busy", !!U(s))), W("scroll", f, () => t.scroll(o.scrollTop)), q(e, l), We();
}
br(["click"]);
//#endregion
//#region ui/ImportReview.svelte
var Vc = /* @__PURE__ */ K("<p> </p>"), Hc = /* @__PURE__ */ K("<li> </li>"), Uc = /* @__PURE__ */ K("<h3>Saved bindings to review</h3><ul></ul>", 1), Wc = /* @__PURE__ */ K("<p>Saved model metadata is present. Review local connections before running.</p>"), Gc = /* @__PURE__ */ K("<h3>Imported terminal effects</h3><ul></ul>", 1), Kc = /* @__PURE__ */ K("<p>No imported terminal effects.</p>"), qc = /* @__PURE__ */ K("<p role=\"alert\"> </p>"), Jc = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-btn menu_button\">Prepare again</button>"), Yc = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay pc-import-overlay\"><div class=\"pc-workspace-dialog pc-import-review\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Import into graph\" tabindex=\"-1\"><header><h2>Import into graph</h2><button type=\"button\" class=\"pc-btn menu_button\" aria-label=\"Cancel import\">×</button></header> <p><strong> </strong> <small> </small></p> <dl><dt>Phase</dt><dd> </dd><dt>Additions</dt><dd> </dd><dt>Conservative request bound</dt><dd> </dd></dl> <p class=\"pc-import-explanation\">This authoring bound includes unfinished branches. Bindings and reachable execution are checked when you explicitly run the workflow.</p> <!> <!> <!> <p>Insertion keeps internal wiring and relative layout. It does not connect matching names, arm or assign the graph, run requests, publish Guidance, or Apply a reply.</p> <!> <footer><button type=\"button\" class=\"pc-btn menu_button\">Cancel</button><!><button type=\"button\" class=\"pc-btn menu_button pc-import-accept\">Insert into graph</button></footer></div></div>");
function Xc(e, t) {
	Ue(t, !0);
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
	var i = Yc(), a = L(i), o = L(a), s = z(L(o));
	M(o);
	var c = z(o, 2), l = L(c), u = L(l, !0);
	M(l);
	var d = z(l, 2), f = L(d, !0);
	M(d), M(c);
	var p = z(c, 2), m = z(L(p)), h = L(m, !0);
	M(m);
	var g = z(m, 2), _ = L(g);
	M(g);
	var v = z(g, 2), y = L(v);
	M(v), M(p);
	var b = z(p, 4), x = (e) => {
		var n = Vc(), r = L(n);
		M(n), B((e) => J(r, `Imported model roles: ${e ?? ""}.`), [() => t.view.requiredRoles.join(", ")]), q(e, n);
	};
	Y(b, (e) => {
		t.view.requiredRoles.length && e(x);
	});
	var S = z(b, 2), C = (e) => {
		var n = Uc(), r = z(R(n));
		X(r, 21, () => t.view.unresolvedBindings, Vr, (e, t) => {
			var n = Hc(), r = L(n);
			M(n), B((e) => J(r, `${U(t).title ?? ""} · ${U(t).role ?? ""}: missing ${e ?? ""}`), [() => U(t).missing.join(" and ")]), q(e, n);
		}), M(r), q(e, n);
	}, w = (e) => {
		q(e, Wc());
	};
	Y(S, (e) => {
		t.view.unresolvedBindings.length ? e(C) : t.view.bindingReviewRequired && e(w, 1);
	});
	var T = z(S, 2), E = (e) => {
		var n = Gc(), r = z(R(n));
		X(r, 21, () => t.view.terminals, Vr, (e, t) => {
			var n = Hc(), r = L(n);
			M(n), B(() => J(r, `${U(t).title ?? ""} · ${U(t).operation ?? ""}`)), q(e, n);
		}), M(r), q(e, n);
	}, D = (e) => {
		q(e, Kc());
	};
	Y(T, (e) => {
		t.view.terminals.length ? e(E) : e(D, -1);
	});
	var O = z(T, 4), ee = (e) => {
		var n = qc(), r = L(n, !0);
		M(n), B(() => J(r, t.view.error)), q(e, n);
	};
	Y(O, (e) => {
		t.view.error && e(ee);
	});
	var k = z(O, 2), te = L(k), ne = z(te), re = (e) => {
		var n = Jc();
		G("click", n, () => t.actions.prepareImportAgain?.()), q(e, n);
	};
	Y(ne, (e) => {
		t.view.error && e(re);
	});
	var ie = z(ne);
	M(k), M(a), $(a, (e) => n = e, () => n), M(i), B(() => {
		J(u, t.view.name), J(f, t.view.fileName), J(h, t.view.phase), J(_, `${t.view.nodeCount ?? ""} blocks · ${t.view.wireCount ?? ""} wires · ${t.view.groupCount ?? ""} groups`), J(y, `${t.view.callBound ?? ""} total · ${t.view.importedCallBound ?? ""} imported`), ie.disabled = !!t.view.error;
	}), G("keydown", a, r), W("paste", a, (e) => e.stopPropagation()), G("click", s, () => t.actions.cancelImport?.()), G("click", te, () => t.actions.cancelImport?.()), G("click", ie, () => t.actions.acceptImport?.()), q(e, i), We();
}
br(["keydown", "click"]);
//#endregion
//#region ui/Workbench.svelte
var Zc = /* @__PURE__ */ K("<p class=\"pc-native-diagnostic svelte-1dr9aew\" role=\"alert\"> </p>"), Qc = /* @__PURE__ */ K("<p>Browse node families on the floating shelf. Middle mouse pans the graph; the wheel zooms around the pointer. Use the divider or its arrow keys to resize Preview.</p><p>Setup contains workflow examples, phase assignment and role defaults. Arm enables the selected host workflow; Run tests it explicitly.</p><p>File › Open workflow chooses a JSON file and opens a separate workflow. Save workflow keeps committed edits and connections in SillyTavern. Export workflow JSON downloads a portable sharing copy without local connections. Import into graph reviews a same-phase fragment before one undoable insertion.</p><p>Select nodes and right-click Create Subgraph to open their connected body in a new tab. Double-click a subgraph to open it. Add Input and Output nodes from the Subgraphs shelf inside an editable subgraph, then name and configure their ports in Details.</p><p>Right-click a subgraph block and choose Add to Subgraphs to save it for reuse. Right-click a saved shelf entry to delete it. Saving updates the shelf only when you choose to save; existing placed copies stay unchanged. Portals connect pins through named references. Preview artifact tabs show results for the selected node; Run to here checks the request bound before running. Apply reviews the fresh result against the full root workflow.</p>", 1), $c = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay\"><div role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\"><header class=\"svelte-1dr9aew\"><h2 class=\"svelte-1dr9aew\"> </h2><button type=\"button\" class=\"pc-btn menu_button\" aria-label=\"Close panel\">×</button></header> <!></div></div>"), el = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay\"><div class=\"pc-manager-dialog svelte-1dr9aew\" role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\" aria-label=\"Manage portals\"><!></div></div>"), tl = /* @__PURE__ */ K("<div role=\"dialog\" aria-modal=\"true\" aria-label=\"Lattice\" data-pc-workbench=\"svelte\"><!> <div class=\"pc-body\" role=\"region\" aria-label=\"Workspace panels\" tabindex=\"0\"><div class=\"pc-stage\"><section aria-label=\"Output preview\"><header class=\"pc-preview-pane-head\"><strong>Preview</strong><button type=\"button\" class=\"pc-btn menu_button\"> </button></header> <div class=\"pc-preview-content\"><!></div></section> <!> <!> <!> <div class=\"pc-canvas-area\" id=\"pc-workspace-graph\" role=\"tabpanel\"><div class=\"pc-workspace-run svelte-1dr9aew\"><!></div> <div class=\"pc-canvas-host\" aria-label=\"Node canvas\"></div> <!> <!></div></div> <!> <div class=\"pc-inspector pc-workspace-details svelte-1dr9aew\"><header class=\"pc-details-heading svelte-1dr9aew\"><strong class=\"svelte-1dr9aew\">Details</strong><button type=\"button\" class=\"svelte-1dr9aew\">Portals</button></header> <!> <div class=\"pc-node-details-holder svelte-1dr9aew\"><!></div></div></div> <!> <!> <!> <!> <!> <!> <!></div>");
function nl(e, t) {
	Ue(t, !0);
	let n = wi(t, "actions", 7), r = /* @__PURE__ */ F({
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
		I(r, {
			...U(r),
			...e
		});
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
	let v = _(), y = /* @__PURE__ */ F(en(v.height)), b = /* @__PURE__ */ F(en(v.collapsed)), x = /* @__PURE__ */ F(500), S = /* @__PURE__ */ F(null), C = /* @__PURE__ */ F(520), w = /* @__PURE__ */ N(() => Math.max(220, Math.min(U(C), U(S) ?? U(r).detailsWidth ?? 258)));
	function T(e) {
		I(S, null), I(r, {
			...U(r),
			detailsWidth: e
		}), n().resizeDetails?.(e);
	}
	let E = /* @__PURE__ */ F(""), D = /* @__PURE__ */ F(null), O = null, ee = 0, k = /* @__PURE__ */ F(0), te;
	function ne() {
		try {
			localStorage.setItem(g, JSON.stringify({
				height: U(y),
				collapsed: U(b)
			}));
		} catch {}
	}
	function re() {
		n().resizeStart?.();
	}
	function ie(e) {
		re(), I(b, e, !0), ne();
	}
	function ae() {
		ie(!1);
	}
	function oe() {
		return se("workflow-setup");
	}
	async function se(e) {
		e === "show-preview" ? ie(!1) : e === "collapse-preview" ? ie(!0) : e === "add-node" ? te.openSearch() : (O = document.activeElement, e === "examples" && n().refreshExamples?.(), ee++, I(E, e, !0), await ur(), U(D).querySelector("button")?.focus());
	}
	function ce() {
		ee++, I(E, ""), O?.focus({ preventScroll: !0 });
	}
	async function le(e) {
		let t = ee;
		try {
			let r = await n().openExample?.(e);
			return r === !0 && t === ee && U(E) === "examples" && ce(), r === !0;
		} catch {
			return !1;
		}
	}
	function ue(e) {
		if (e.stopPropagation(), e.key === "Escape") e.preventDefault(), n().portalManager?.close?.();
		else if (e.key === "Tab") {
			let t = [...e.currentTarget.querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex=\"0\"]")], n = t[0], r = t.at(-1);
			e.shiftKey && document.activeElement === n && (e.preventDefault(), r?.focus()), !e.shiftKey && document.activeElement === r && (e.preventDefault(), n?.focus());
		}
	}
	function de(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), ce()), e.key === "Tab") {
			let t = [...U(D).querySelectorAll("button:not(:disabled), input, select, textarea, [tabindex=\"0\"]")], n = t[0], r = t.at(-1);
			e.shiftKey && document.activeElement === n && (e.preventDefault(), r?.focus()), !e.shiftKey && document.activeElement === r && (e.preventDefault(), n?.focus());
		}
	}
	Ti(() => {
		let e = () => {
			I(x, Math.max(90, s.clientHeight - 190), !0), I(C, Math.max(220, Math.min(520, (a.clientWidth || i.clientWidth || window.innerWidth) - 368)), !0);
		}, t = globalThis.ResizeObserver;
		if (!t) return e(), window.addEventListener("resize", e), () => window.removeEventListener("resize", e);
		let n = new t(e);
		return n.observe(s), n.observe(a), e(), () => n.disconnect();
	});
	var fe = {
		getParts: d,
		updateActions: f,
		update: p,
		renameGraphView: m,
		focusCommentTitle: h,
		revealPreview: ae,
		revealWorkflowSetup: oe
	}, pe = tl();
	let me, he;
	var ge = L(pe);
	$(ta(ge, {
		get state() {
			return U(r);
		},
		get actions() {
			return n();
		},
		local: se
	}), (e) => l = e, () => l);
	var _e = z(ge, 2), ve = L(_e), ye = L(ve);
	let be, xe;
	var Se = L(ye), Ce = z(L(Se)), we = L(Ce, !0);
	M(Ce), M(Se);
	var Te = z(Se, 2), Ee = L(Te);
	{
		let e = /* @__PURE__ */ N(() => U(r).outputPreview ?? null);
		as(Ee, {
			get view() {
				return U(e);
			},
			get actions() {
				return n().outputPreview;
			},
			collapse: () => ie(!0)
		});
	}
	M(Te), M(ye);
	var De = z(ye, 2), Oe = (e) => {
		{
			let t = /* @__PURE__ */ N(() => Math.min(U(y), U(x)));
			ra(e, {
				get height() {
					return U(t);
				},
				get max() {
					return U(x);
				},
				start: re,
				change: (e) => {
					I(y, e, !0), ne();
				}
			});
		}
	};
	Y(De, (e) => {
		U(b) || e(Oe);
	});
	var A = z(De, 2);
	$(ha(A, {
		get views() {
			return U(r).graphViews;
		},
		get actions() {
			return n().graphViewActions;
		},
		panelId: "pc-workspace-graph"
	}), (e) => u = e, () => u);
	var ke = z(A, 2);
	{
		let e = /* @__PURE__ */ N(() => U(r).graphViews?.active);
		ba(ke, {
			get view() {
				return U(e);
			},
			get actions() {
				return n().graphViewActions;
			}
		});
	}
	var j = z(ke, 2), Ae = L(j), je = L(Ae);
	{
		let e = /* @__PURE__ */ N(() => U(r).runMeter ?? null);
		bs(je, {
			get view() {
				return U(e);
			},
			open: () => {
				I(E, "run-details");
			}
		});
	}
	M(Ae);
	var Ne = z(Ae, 2);
	$(Ne, (e) => o = e, () => o);
	var Pe = z(Ne, 2), Fe = (e) => {
		var t = Zc(), n = L(t, !0);
		M(t), B(() => J(n, U(r).nativeDiagnostic)), q(e, t);
	};
	Y(Pe, (e) => {
		U(r).nativeDiagnostic && e(Fe);
	}), $(Cc(z(Pe, 2), {
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
	}), (e) => te = e, () => te), M(j), M(ve), $(ve, (e) => s = e, () => s);
	var Ie = z(ve, 2), Le = (e) => {
		var t = jr();
		Br(R(t), () => U(r).graphViews?.active.key ?? U(r).graphId, (e) => {
			aa(e, {
				get width() {
					return U(w);
				},
				get max() {
					return U(C);
				},
				start: re,
				preview: (e) => I(S, e, !0),
				change: T
			});
		}), q(e, t);
	};
	Y(Ie, (e) => {
		U(r).inspectorOpen && e(Le);
	});
	var Re = z(Ie, 2), ze = L(Re), Be = z(L(ze));
	M(ze);
	var Ve = z(ze, 2), He = (e) => {
		let t = /* @__PURE__ */ N(() => U(r).commentDetails);
		Vo(e, {
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
	var Ge = z(Ve, 2), Ke = L(Ge);
	{
		let e = /* @__PURE__ */ N(() => U(r).commentDetails ? null : U(r).nodeDetails ?? null);
		Ro(Ke, {
			get view() {
				return U(e);
			},
			get actions() {
				return n().nodeDetails;
			}
		});
	}
	M(Ge), M(Re), $(Re, (e) => c = e, () => c), M(_e), $(_e, (e) => a = e, () => a);
	var qe = z(_e, 2), Je = (e) => {
		var t = $c(), i = L(t);
		let a;
		var o = L(i), s = L(o), c = L(s, !0);
		M(s);
		var l = z(s);
		M(o);
		var u = z(o, 2), d = (e) => {
			Bc(e, {
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
					return U(k);
				},
				scroll: (e) => I(k, e, !0),
				open: le
			});
		}, f = (e) => {
			{
				let t = /* @__PURE__ */ N(() => U(r).runDetails ?? null);
				gs(e, {
					get view() {
						return U(t);
					},
					get actions() {
						return n().runDetails;
					}
				});
			}
		}, p = (e) => {
			{
				let t = /* @__PURE__ */ N(() => U(r).rootWorkflow ?? U(r).workflow);
				kc(e, {
					get view() {
						return U(t);
					},
					get actions() {
						return n();
					}
				});
			}
		}, m = (e) => {
			var t = Qc();
			Me(4), q(e, t);
		};
		Y(u, (e) => {
			U(E) === "examples" ? e(d) : U(E) === "run-details" ? e(f, 1) : U(E) === "workflow-setup" ? e(p, 2) : e(m, -1);
		}), M(i), $(i, (e) => I(D, e), () => U(D)), M(t), B(() => {
			a = ii(i, 1, "pc-workspace-dialog svelte-1dr9aew", null, a, { "pc-examples-dialog": U(E) === "examples" }), Q(i, "aria-label", U(E) === "examples" ? "Examples" : U(E) === "workflow-setup" ? "Workflow setup" : U(E) === "run-details" ? "Run details" : "Workspace guide"), J(c, U(E) === "examples" ? "Examples" : U(E) === "workflow-setup" ? "Workflow setup" : U(E) === "run-details" ? "Run details" : "Workspace guide");
		}), G("keydown", i, de), W("paste", i, (e) => e.stopPropagation()), G("click", l, ce), q(e, t);
	};
	Y(qe, (e) => {
		U(E) && e(Je);
	});
	var Ye = z(qe, 2);
	ec(Ye, {
		get view() {
			return U(r).nativeSearch;
		},
		get actions() {
			return n().nativeSearch;
		}
	});
	var Xe = z(Ye, 2);
	ic(Xe, {
		get view() {
			return U(r).nativePinMenu;
		},
		get actions() {
			return n().nativePinMenu;
		}
	});
	var Ze = z(Xe, 2), Qe = (e) => {
		var t = el(), i = L(t);
		zs(L(i), {
			get view() {
				return U(r).portalManager;
			},
			get actions() {
				return n().portalManager;
			}
		}), M(i), M(t), G("keydown", i, ue), W("paste", i, (e) => e.stopPropagation()), q(e, t);
	};
	Y(Ze, (e) => {
		U(r).portalManager && e(Qe);
	});
	var $e = z(Ze, 2), et = (e) => {
		Us(e, {
			get view() {
				return U(r).subgraphSave;
			},
			get actions() {
				return n().subgraphSave;
			}
		});
	};
	Y($e, (e) => {
		U(r).subgraphSave && e(et);
	});
	var tt = z($e, 2), nt = (e) => {
		Xc(e, {
			get view() {
				return U(r).importReview;
			},
			get actions() {
				return n();
			}
		});
	};
	Y(tt, (e) => {
		U(r).importReview && e(nt);
	});
	var rt = z(tt, 2), it = (e) => {
		Gs(e, {
			get view() {
				return U(r).newWorkflowPrompt;
			},
			get actions() {
				return n().newWorkflowPrompt;
			}
		});
	};
	return Y(rt, (e) => {
		U(r).newWorkflowPrompt && e(it);
	}), M(pe), $(pe, (e) => i = e, () => i), B((e) => {
		me = ii(pe, 1, "pc-root pc-native-workspace svelte-1dr9aew", null, me, { "pc-native-flat": U(r).nativeFlatCanvas }), he = oi(pe, "", he, { "--pc-details-width": `${U(w)}px` }), be = ii(ye, 1, "pc-preview-pane", null, be, { "pc-preview-collapsed": U(b) }), xe = oi(ye, "", xe, e), Q(Ce, "aria-expanded", !U(b)), J(we, U(b) ? "Expand preview" : "Collapse preview"), Q(Te, "hidden", U(b)), Q(Re, "hidden", !U(r).inspectorOpen), Q(Ge, "hidden", !!U(r).commentDetails);
	}, [() => ({ "--pc-preview-height": `${Math.min(U(y), U(x))}px` })]), G("click", Ce, () => ie(!U(b))), G("click", Be, () => n().managePortals?.()), q(e, pe), We(fe);
}
br(["click", "keydown"]);
//#endregion
//#region ui/entry.js
function rl(e, t) {
	let n = document.createElement("div");
	n.style.cssText = "position:absolute;left:0;top:0;visibility:hidden;pointer-events:none", n.setAttribute("aria-hidden", "true"), n.inert = !0, e.append(n);
	let r;
	try {
		r = Nr(Ni, {
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
		r && Lr(r), n.remove();
	}
}
function il(e, t) {
	let n = Nr(qi, {
		target: e,
		props: { actions: t }
	});
	return Rt(), {
		...n.getLayers(),
		setComments: (e, t) => Rt(() => n.setComments(e, t)),
		setNodes: (e) => Rt(() => n.setNodes(e)),
		setGroups: (e) => Rt(() => n.setGroups(e)),
		setWires: (e, t, r) => Rt(() => n.setWires(e, t, r)),
		setPositions: (e, t) => Rt(() => n.setPositions(e, t)),
		destroy: () => Lr(n)
	};
}
function al(e, t) {
	let n = Nr(nl, {
		target: e,
		props: { actions: t }
	});
	return Rt(), {
		...n.getParts(),
		update: (e) => Rt(() => n.update(e)),
		updateActions: (e) => Rt(() => n.updateActions(e)),
		revealPreview: () => Rt(() => n.revealPreview()),
		revealWorkflowSetup: () => Rt(() => n.revealWorkflowSetup()),
		renameGraphView: (e) => n.renameGraphView(e),
		focusCommentTitle: (e, t) => n.focusCommentTitle(e, t),
		destroy: () => Lr(n)
	};
}
//#endregion
export { rl as measureNodeCard, il as mountCanvas, al as mountWorkbench };
