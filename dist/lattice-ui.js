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
var m = 1024, h = 2048, g = 4096, _ = 8192, v = 16384, y = 32768, b = 1 << 25, x = 65536, S = 1 << 19, C = 1 << 20, w = 1 << 25, T = 65536, E = 1 << 21, D = 1 << 22, O = 1 << 23, k = Symbol("$state"), ee = Symbol("legacy props"), te = Symbol(""), A = Symbol("attributes"), j = Symbol("class"), M = Symbol("style"), ne = Symbol("text"), re = Symbol("form reset"), ie = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), ae = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml");
function oe(e) {
	throw Error("https://svelte.dev/e/lifecycle_outside_component");
}
//#endregion
//#region node_modules/svelte/src/internal/client/errors.js
function se() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function ce(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function le(e) {
	throw Error("https://svelte.dev/e/effect_in_teardown");
}
function ue() {
	throw Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function de(e) {
	throw Error("https://svelte.dev/e/effect_orphan");
}
function fe() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function pe(e) {
	throw Error("https://svelte.dev/e/props_invalid_value");
}
function me() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function he() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function ge() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function _e() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
//#endregion
//#region node_modules/svelte/src/constants.js
var ve = {}, ye = Symbol("uninitialized"), be = "http://www.w3.org/1999/xhtml";
function xe() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function Se(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
function Ce() {
	console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function we() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/hydration.js
var N = !1;
function Te(e) {
	N = e;
}
var P;
function Ee(e) {
	if (e === null) throw Se(), ve;
	return P = e;
}
function De() {
	return Ee(/* @__PURE__ */ sn(P));
}
function F(e) {
	if (N) {
		if (/* @__PURE__ */ sn(P) !== null) throw Se(), ve;
		P = e;
	}
}
function Oe(e = 1) {
	if (N) {
		for (var t = e, n = P; t--;) n = /* @__PURE__ */ sn(n);
		P = n;
	}
}
function ke(e = !0) {
	for (var t = 0, n = P;;) {
		if (n.nodeType === 8) {
			var r = n.data;
			if (r === "]") {
				if (t === 0) return n;
				--t;
			} else (r === "[" || r === "[!" || r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
		}
		var i = /* @__PURE__ */ sn(n);
		e && n.remove(), n = i;
	}
}
function Ae(e) {
	if (!e || e.nodeType !== 8) throw Se(), ve;
	return e.data;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/equality.js
function je(e) {
	return e === this.v;
}
function Me(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function Ne(e) {
	return !Me(e, this.v);
}
//#endregion
//#region node_modules/svelte/src/internal/shared/clone.js
var Pe = [];
function Fe(e, t = !1, n = !1) {
	return Ie(e, /* @__PURE__ */ new Map(), "", Pe, null, n);
}
function Ie(t, n, r, i, a = null, o = !1) {
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
				d in t && (u[d] = Ie(f, n, r, i, null, o));
			}
			return u;
		}
		if (l(t) === s) {
			u = {}, n.set(t, u), a !== null && n.set(a, u);
			for (var p of Object.keys(t)) u[p] = Ie(t[p], n, r, i, null, o);
			return u;
		}
		if (t instanceof Date) return structuredClone(t);
		if (typeof t.toJSON == "function" && !o) return Ie(t.toJSON(), n, r, i, t);
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
var Le = null;
function Re(e) {
	Le = e;
}
function ze(e, t = !1, n) {
	Le = {
		p: Le,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: W,
		l: null
	};
}
function Be(e) {
	var t = Le, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) yn(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, Le = t.p, e ?? {};
}
function Ve() {
	return !0;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/task.js
var He = [];
function Ue() {
	var e = He;
	He = [], f(e);
}
function We(e) {
	if (He.length === 0 && !Dt) {
		var t = He;
		queueMicrotask(() => {
			t === He && Ue();
		});
	}
	He.push(e);
}
function Ge() {
	for (; He.length > 0;) Ue();
}
function Ke(e) {
	var t = W;
	if (t === null) return U.f |= O, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	qe(e, t);
}
function qe(e, t) {
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
var Je = ~(h | g | m);
function Ye(e, t) {
	e.f = e.f & Je | t;
}
function Xe(e) {
	e.f & 512 || e.deps === null ? Ye(e, m) : Ye(e, g);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
function Ze(e) {
	if (e !== null) for (let t of e) t.f & 2 && t.f & 65536 && (t.f ^= T, Ze(t.deps));
}
function Qe(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), Ze(e.deps), Ye(e, m);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/store.js
var $e = !1;
function et(e) {
	var t = $e;
	try {
		return $e = !1, [e(), $e];
	} finally {
		$e = t;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/misc.js
function tt(e) {
	N && /* @__PURE__ */ on(e) !== null && ln(e);
}
var nt = !1;
function rt() {
	nt || (nt = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[re]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function it(e) {
	var t = U, n = W;
	Hn(null), Un(null);
	try {
		return e();
	} finally {
		Hn(t), Un(n);
	}
}
function at(e, t, n, r = n) {
	e.addEventListener(t, () => it(n));
	let i = e[re];
	e[re] = i ? () => {
		i(), r(!0);
	} : () => r(!0), rt();
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function ot(e) {
	let t = 0, n = Wt(0), r;
	return () => {
		gn() && (G(n), Cn(() => (t === 0 && (r = ur(() => e(() => Jt(n)))), t += 1, () => {
			We(() => {
				--t, t === 0 && (r?.(), r = void 0, Jt(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var st = x | S;
function ct(e, t, n, r) {
	new lt(e, t, n, r);
}
var lt = class {
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
	#h = ot(() => (this.#m = Wt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = W;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = W.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = wn(() => {
			if (N) {
				let e = this.#t;
				De();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, st), N && (this.#e = P);
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
		We(r), t && (this.#s = Tn(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			t ? we() : (t = !0, n && _e(), this.#s !== null && Mn(this.#s, () => {
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
					qe(e, this.#i && this.#i.parent);
				}
			}
		};
	}
	#y() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = Tn(() => e(this.#e)), We(() => {
			var e = this.#c = document.createDocumentFragment(), t = an();
			e.append(t), this.#a = this.#S(() => Tn(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, Mn(this.#o, () => {
				this.#o = null;
			}), this.#x(L));
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
			} else this.#x(L);
		} catch (e) {
			this.error(e);
		}
	}
	#x(e) {
		this.is_pending = !1, e.transfer_effects(this.#f, this.#p);
	}
	defer_effect(e) {
		Qe(e, this.#f, this.#p);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#n.pending;
	}
	#S(e) {
		var t = W, n = U, r = Le;
		Un(this.#i), Hn(this.#i), Re(this.#i.ctx);
		try {
			return Nt.ensure(), e();
		} catch (e) {
			return Ke(e), null;
		} finally {
			Un(t), Hn(n), Re(r);
		}
	}
	#C(e, t) {
		this.has_pending_snippet() ? (this.#u += e, this.#u === 0 && (this.#x(t), this.#o && Mn(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null))) : this.parent && this.parent.#C(e, t);
	}
	update_pending_count(e, t) {
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, We(() => {
			this.#d = !1, this.#m && Kt(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), G(this.#m);
	}
	error(e) {
		if (!this.#n.onerror && !this.#n.failed) throw e;
		L?.is_fork ? (this.#a && L.skip_effect(this.#a), this.#o && L.skip_effect(this.#o), this.#s && L.skip_effect(this.#s), L.oncommit(() => {
			this.#w(e);
		})) : this.#w(e);
	}
	#w(e) {
		this.#a &&= (kn(this.#a), null), this.#o &&= (kn(this.#o), null), this.#s &&= (kn(this.#s), null), N && (Ee(this.#t), Oe(), Ee(ke()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return Tn(() => {
						var r = W;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return qe(e, this.#i.parent), null;
				}
			}));
		};
		We(() => {
			var t;
			try {
				t = this.transform_error(e);
			} catch (e) {
				qe(e, this.#i && this.#i.parent);
				return;
			}
			typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => qe(e, this.#i && this.#i.parent)) : n(t);
		});
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/async.js
function ut(e, t, n, r) {
	let i = Ve() ? mt : _t;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = W, c = dt(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				qe(e, s);
			}
			ft();
		}
	}
	var d = pt();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ gt(e))).then(u).catch((e) => qe(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), ft();
	}) : f();
}
function dt() {
	var e = W, t = U, n = Le, r = L;
	return function(i = !0) {
		Un(e), Hn(t), Re(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function ft(e = !0) {
	Un(null), Hn(null), Re(null), e && L?.deactivate();
}
function pt() {
	var e = W, t = e.b, n = L, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function mt(e) {
	var t = 2 | h;
	return W !== null && (W.f |= S), {
		ctx: Le,
		deps: null,
		effects: null,
		equals: je,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v: ye,
		wv: 0,
		parent: W,
		ac: null
	};
}
var ht = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function gt(e, t, n) {
	let r = W;
	r === null && se();
	var i = void 0, a = Wt(ye), o = !U, s = /* @__PURE__ */ new Set();
	return Sn(() => {
		var t = W, n = p();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== ie && n.reject(e);
			}).finally(ft);
		} catch (e) {
			n.reject(e), ft();
		}
		var c = L;
		if (o) {
			if (t.f & 32768) var l = pt();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(ht);
			else for (let e of s.values()) e.reject(ht);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== ht && (c.activate(), t ? (a.f |= O, Kt(a, t)) : (a.f & 8388608 && (a.f ^= O), Kt(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), _n(() => {
		for (let e of s) e.reject(ht);
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
	let t = /* @__PURE__ */ mt(e);
	return Gn(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function _t(e) {
	let t = /* @__PURE__ */ mt(e);
	return t.equals = Ne, t;
}
function vt(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) kn(t[n]);
	}
}
function yt(e) {
	var t, n = W, r = e.parent;
	if (!zn && r !== null && e.v !== ye && r.f & 24576) return xe(), e.v;
	Un(r);
	try {
		e.f &= ~T, vt(e), t = rr(e);
	} finally {
		Un(n);
	}
	return t;
}
function bt(e) {
	var t = yt(e);
	!e.equals(t) && (e.wv = er(), (!L?.is_fork || e.deps === null) && (L === null ? e.v = t : (L.capture(e, t, !0), wt?.capture(e, t, !0)), e.deps === null)) ? Ye(e, m) : zn || (Tt === null ? Xe(e) : (gn() || L?.is_fork) && Tt.set(e, t));
}
function xt(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && it(() => {
		t.ac.abort(ie), t.ac = null;
	}), t.fn !== null && (t.teardown = d), ar(t, 0), Dn(t));
}
function St(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && or(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
var Ct = null, L = null, wt = null, Tt = null, Et = null, Dt = !1, Ot = !1, kt = null, At = null, jt = 0, Mt = 1, Nt = class e {
	id = Mt++;
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
		Ct === null ? Ct = this : (Ct.#n = this, this.#t = Ct), Ct = this;
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
			for (var r of n.d) Ye(r, h), t(r);
			for (r of n.m) Ye(r, g), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, jt++ > 1e3 && (this.#x(), Ft());
		for (let e of this.#u) this.#d.delete(e), Ye(e, h), this.schedule(e);
		for (let e of this.#d) Ye(e, g), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = kt = [], r = [], i = At = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw Bt(e), this.#h() || this.discard(), t;
		}
		if (L = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (kt = null, At = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) zt(e, t);
			i.length > 0 && L.#g();
			return;
		}
		let o = this.#v();
		if (o) this.#b(r), this.#b(n), o.#y(this);
		else {
			this.#u.clear(), this.#d.clear();
			for (let e of this.#r) e(this);
			this.#r.clear(), wt = this, Lt(r), Lt(n), wt = null, this.#s?.resolve();
			var s = L;
			if (this.#a === 0 && (this.#c.length === 0 || s !== null) && this.#x(), this.#c.length > 0) {
				if (s !== null) {
					let e = s;
					e.#c.push(...this.#c.filter((t) => !e.#c.includes(t)));
				} else s = this;
			}
			s !== null && (Ht.clear(), s.#g());
		}
	}
	#_(e, t, n) {
		e.f ^= m;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= m : i & 4 ? t.push(r) : tr(r) && (i & 16 && this.#d.add(r), or(r));
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), Ye(i, h), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), L = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) Qe(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== ye && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), Tt?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		L = this;
	}
	deactivate() {
		L = null, Tt = null;
	}
	flush() {
		try {
			Ot = !0, L = this, this.#g();
		} finally {
			jt = 0, Et = null, kt = null, At = null, Ot = !1, L = null, Tt = null, Ht.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(ht);
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
		this.#m || (this.#m = !0, We(() => {
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
			!Ot && !Dt && We(() => {
				t.#e || t.flush();
			});
		}
		return L;
	}
	apply() {
		Tt = null;
	}
	schedule(e) {
		if (Et = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) e.b.defer_effect(e);
		else {
			for (var t = e; t.parent !== null;) {
				t = t.parent;
				var n = t.f;
				if (kt !== null && t === W && (U === null || !(U.f & 2))) return;
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
			e === null || (e.#n = t), t === null ? Ct = e : t.#t = e, this.linked = !1;
		}
	}
};
function Pt(e) {
	var t = Dt;
	Dt = !0;
	try {
		var n;
		for (e && (L !== null && !L.is_fork && L.flush(), n = e());;) {
			if (Ge(), L === null) return n;
			L.flush();
		}
	} finally {
		Dt = t;
	}
}
function Ft() {
	try {
		fe();
	} catch (e) {
		qe(e, Et);
	}
}
var It = null;
function Lt(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && tr(r) && (It = /* @__PURE__ */ new Set(), or(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && jn(r), It?.size > 0)) {
				Ht.clear();
				for (let e of It) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) It.has(n) && (It.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || or(n);
					}
				}
				It.clear();
			}
		}
		It = null;
	}
}
function Rt(e) {
	L.schedule(e);
}
function zt(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), Ye(e, m);
		for (var n = e.first; n !== null;) zt(n, t), n = n.next;
	}
}
function Bt(e) {
	Ye(e, m);
	for (var t = e.first; t !== null;) Bt(t), t = t.next;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/sources.js
var Vt = /* @__PURE__ */ new Set(), Ht = /* @__PURE__ */ new Map(), Ut = !1;
function Wt(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: je,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function R(e, t) {
	let n = Wt(e, t);
	return Gn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function Gt(e, t = !1, n = !0) {
	let r = Wt(e);
	return t || (r.equals = Ne), r;
}
function z(e, t, n = !1) {
	return U !== null && (!Vn || U.f & 131072) && Ve() && U.f & 4325394 && (Wn === null || !Wn.has(e)) && ge(), Kt(e, n ? Xt(t) : t, At);
}
function Kt(e, t, n = null) {
	if (!e.equals(t)) {
		zn ? Ht.set(e, t) : Ht.has(e) || Ht.set(e, e.v);
		var r = Nt.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && yt(t), Tt === null && Xe(t);
		}
		e.wv = er(), Yt(e, h, n), Ve() && W !== null && W.f & 1024 && !(W.f & 96) && (Jn === null ? Yn([e]) : Jn.push(e)), !r.is_fork && Vt.size > 0 && !Ut && qt();
	}
	return t;
}
function qt() {
	Ut = !1;
	for (let e of Vt) {
		e.f & 1024 && Ye(e, g);
		let t;
		try {
			t = tr(e);
		} catch {
			t = !0;
		}
		t && or(e);
	}
	Vt.clear();
}
function Jt(e) {
	z(e, e.v + 1);
}
function Yt(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = Ve(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (i || s !== W) {
			var l = (c & h) === 0;
			if (l && Ye(s, t), c & 131072) Vt.add(s);
			else if (c & 2) {
				var u = s;
				Tt?.delete(u), c & 65536 || (c & 512 && (W === null || !(W.f & 2097152)) && (s.f |= T), Yt(u, g, n));
			} else if (l) {
				var d = s;
				c & 16 && It !== null && It.add(d), n === null ? Rt(d) : n.push(d);
			}
		}
	}
}
function Xt(t) {
	if (typeof t != "object" || !t || k in t) return t;
	let n = l(t);
	if (n !== s && n !== c) return t;
	var r = /* @__PURE__ */ new Map(), i = e(t), o = /* @__PURE__ */ R(0), u = null, d = Qn, f = (e) => {
		if (Qn === d) return e();
		var t = U, n = Qn;
		Hn(null), $n(d);
		var r = e();
		return Hn(t), $n(n), r;
	};
	return i && r.set("length", /* @__PURE__ */ R(t.length, u)), new Proxy(t, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && me();
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
					let e = f(() => /* @__PURE__ */ R(ye, u));
					r.set(t, e), Jt(o);
				}
			} else z(n, ye), Jt(o);
			return !0;
		},
		get(e, n, i) {
			if (n === k) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ R(Xt(s ? e[n] : ye), u)), r.set(n, o)), o !== void 0) {
				var c = G(o);
				return c === ye ? void 0 : c;
			}
			return Reflect.get(e, n, i);
		},
		getOwnPropertyDescriptor(e, t) {
			var n = Reflect.getOwnPropertyDescriptor(e, t);
			if (n && "value" in n) {
				var i = r.get(t);
				i && (n.value = G(i));
			} else if (n === void 0) {
				var a = r.get(t), o = a?.v;
				if (a !== void 0 && o !== ye) return {
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
			var n = r.get(t), i = n !== void 0 && n.v !== ye || Reflect.has(e, t);
			return (n !== void 0 || W !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ R(i ? Xt(e[t]) : ye, u)), r.set(t, n)), G(n) === ye) ? !1 : i;
		},
		set(e, t, n, s) {
			var c = r.get(t), l = t in e;
			if (i && t === "length") for (var d = n; d < c.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ R(ye, u)), r.set(d + "", p)) : z(p, ye);
			}
			if (c === void 0) (!l || a(e, t)?.writable) && (c = f(() => /* @__PURE__ */ R(void 0, u)), z(c, Xt(n)), r.set(t, c));
			else {
				l = c.v !== ye;
				var m = f(() => Xt(n));
				z(c, m);
			}
			var h = Reflect.getOwnPropertyDescriptor(e, t);
			if (h?.set && h.set.call(s, n), !l) {
				if (i && typeof t == "string") {
					var g = r.get("length"), _ = Number(t);
					Number.isInteger(_) && _ >= g.v && z(g, _ + 1);
				}
				Jt(o);
			}
			return !0;
		},
		ownKeys(e) {
			G(o);
			var t = Reflect.ownKeys(e).filter((e) => {
				var t = r.get(e);
				return t === void 0 || t.v !== ye;
			});
			for (var [n, i] of r) i.v !== ye && !(n in e) && t.push(n);
			return t;
		},
		setPrototypeOf() {
			he();
		}
	});
}
function Zt(e) {
	try {
		if (typeof e == "object" && e && k in e) return e[k];
	} catch {}
	return e;
}
function Qt(e, t) {
	return Object.is(Zt(e), Zt(t));
}
var $t, en, tn, nn;
function rn() {
	if ($t === void 0) {
		$t = window, en = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		tn = a(t, "firstChild").get, nn = a(t, "nextSibling").get, u(e) && (e[j] = void 0, e[A] = null, e[M] = void 0, e.__e = void 0), u(n) && (n[ne] = void 0);
	}
}
function an(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function on(e) {
	return tn.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function sn(e) {
	return nn.call(e);
}
function B(e, t) {
	if (!N) return /* @__PURE__ */ on(e);
	var n = /* @__PURE__ */ on(P);
	if (n === null) n = P.appendChild(an());
	else if (t && n.nodeType !== 3) {
		var r = an();
		return n?.before(r), Ee(r), r;
	}
	return t && fn(n), Ee(n), n;
}
function cn(e, t = !1) {
	if (!N) {
		var n = /* @__PURE__ */ on(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ sn(n) : n;
	}
	if (t) {
		if (P?.nodeType !== 3) {
			var r = an();
			return P?.before(r), Ee(r), r;
		}
		fn(P);
	}
	return P;
}
function V(e, t = 1, n = !1) {
	let r = N ? P : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ sn(r);
	if (!N) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = an();
			return r === null ? i?.after(a) : r.before(a), Ee(a), a;
		}
		fn(r);
	}
	return Ee(r), r;
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
	W === null && (U === null && de(e), ue()), zn && le(e);
}
function mn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function hn(e, t) {
	var n = W;
	n !== null && n.f & 8192 && (e |= _);
	var r = {
		ctx: Le,
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
	L?.register_created_effect(r);
	var i = r;
	if (e & 4) kt === null ? Nt.ensure().schedule(r) : kt.push(r);
	else if (t !== null) {
		try {
			or(r);
		} catch (e) {
			throw kn(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= x));
	}
	if (i !== null && (i.parent = n, n !== null && mn(i, n), U !== null && U.f & 2 && !(e & 64))) {
		var a = U;
		(a.effects ??= []).push(i);
	}
	return r;
}
function gn() {
	return U !== null && !Vn;
}
function _n(e) {
	let t = hn(8, null);
	return Ye(t, m), t.teardown = e, t;
}
function vn(e) {
	pn("$effect");
	var t = W.f;
	if (!U && t & 32 && Le !== null && !Le.i) {
		var n = Le;
		(n.e ??= []).push(e);
	} else return yn(e);
}
function yn(e) {
	return hn(4 | C, e);
}
function bn(e) {
	Nt.ensure();
	let t = hn(64 | S, e);
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
	return hn(D | S, e);
}
function Cn(e, t = 0) {
	return hn(8 | t, e);
}
function H(e, t = [], n = [], r = []) {
	ut(r, t, n, (t) => {
		hn(8, () => {
			e(...t.map(G));
		});
	});
}
function wn(e, t = 0) {
	return hn(16 | t, e);
}
function Tn(e) {
	return hn(32 | S, e);
}
function En(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = zn, n = U;
		Bn(!0), Hn(null);
		try {
			t.call(null);
		} finally {
			Bn(e), Hn(n);
		}
	}
}
function Dn(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && it(() => {
			e.abort(ie);
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
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (An(e.nodes.start, e.nodes.end), n = !0), e.f |= b, Dn(e, t && !n), ar(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	En(e), e.f ^= b, e.f |= v;
	var i = e.parent;
	i !== null && i.first !== null && jn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function An(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ sn(e);
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
		e.f ^= _;
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
		e.f ^= _, e.f & 1024 || (Ye(e, h), Nt.ensure().schedule(e));
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
		var i = n === r ? null : /* @__PURE__ */ sn(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/legacy.js
var Ln = null, Rn = !1, zn = !1;
function Bn(e) {
	zn = e;
}
var U = null, Vn = !1;
function Hn(e) {
	U = e;
}
var W = null;
function Un(e) {
	W = e;
}
var Wn = null;
function Gn(e) {
	U !== null && (Wn ??= /* @__PURE__ */ new Set()).add(e);
}
var Kn = null, qn = 0, Jn = null;
function Yn(e) {
	Jn = e;
}
var Xn = 1, Zn = 0, Qn = Zn;
function $n(e) {
	Qn = e;
}
function er() {
	return ++Xn;
}
function tr(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~T), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (tr(a) && bt(a), a.wv > e.wv) return !0;
		}
		t & 512 && Tt === null && Ye(e, m);
	}
	return !1;
}
function nr(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Wn !== null && Wn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? nr(a, t, !1) : t === a && (n ? Ye(a, h) : a.f & 1024 && Ye(a, g), Rt(a));
	}
}
function rr(e) {
	var t = Kn, n = qn, r = Jn, i = U, a = Wn, o = Le, s = Vn, c = Qn, l = e.f;
	Kn = null, qn = 0, Jn = null, U = l & 96 ? null : e, Wn = null, Re(e.ctx), Vn = !1, Qn = ++Zn, e.ac !== null && (it(() => {
		e.ac.abort(ie);
	}), e.ac = null);
	try {
		e.f |= E;
		var u = e.fn, d = u();
		e.f |= y;
		var f = e.deps, p = L?.is_fork;
		if (Kn !== null) {
			var m;
			if (p || ar(e, qn), f !== null && qn > 0) for (f.length = qn + Kn.length, m = 0; m < Kn.length; m++) f[qn + m] = Kn[m];
			else e.deps = f = Kn;
			if (gn() && e.f & 512) for (m = qn; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && qn < f.length && (ar(e, qn), f.length = qn);
		if (Ve() && Jn !== null && !Vn && f !== null && !(e.f & 6146)) for (m = 0; m < Jn.length; m++) nr(Jn[m], e);
		if (i !== null && i !== e) {
			if (Zn++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = Zn;
			if (t !== null) for (let e of t) e.rv = Zn;
			Jn !== null && (r === null ? r = Jn : r.push(...Jn));
		}
		return e.f & 8388608 && (e.f ^= O), d;
	} catch (e) {
		return Ke(e);
	} finally {
		e.f ^= E, Kn = t, qn = n, Jn = r, U = i, Wn = a, Re(o), Vn = s, Qn = c;
	}
}
function ir(e, r) {
	let i = r.reactions;
	if (i !== null) {
		var a = t.call(i, e);
		if (a !== -1) {
			var o = i.length - 1;
			o === 0 ? i = r.reactions = null : (i[a] = i[o], i.pop());
		}
	}
	if (i === null && r.f & 2 && (Kn === null || !n.call(Kn, r))) {
		var s = r;
		s.f & 512 && (s.f ^= 512, s.f &= ~T), s.v !== ye && Xe(s), s.ac !== null && it(() => {
			s.ac.abort(ie), s.ac = null, Ye(s, h);
		}), xt(s), ar(s, 0);
	}
}
function ar(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) ir(e, n[r]);
}
function or(e) {
	var t = e.f;
	if (!(t & 16384)) {
		Ye(e, m);
		var n = W, r = Rn;
		W = e, Rn = !(t & 96);
		try {
			t & 16777232 ? On(e) : Dn(e), En(e);
			var i = rr(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = Xn;
		} finally {
			Rn = r, W = n;
		}
	}
}
async function sr() {
	await Promise.resolve(), Pt();
}
function G(e) {
	var t = !!(e.f & 2);
	if (Ln?.add(e), U !== null && !Vn && !(W !== null && W.f & 16384) && (Wn === null || !Wn.has(e))) {
		var r = U.deps;
		if (U.f & 2097152) e.rv < Zn && (e.rv = Zn, Kn === null && r !== null && r[qn] === e ? qn++ : Kn === null ? Kn = [e] : Kn.push(e));
		else {
			U.deps ??= [], n.call(U.deps, e) || U.deps.push(e);
			var i = e.reactions;
			i === null ? e.reactions = [U] : n.call(i, U) || i.push(U);
		}
	}
	if (zn && Ht.has(e)) return Ht.get(e);
	if (t) {
		var a = e;
		if (zn) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || lr(a)) && (o = yt(a)), Ht.set(a, o), o;
		}
		var s = !(a.f & 512) && !Vn && U !== null && (Rn || !!(U.f & 512)), c = (a.f & y) === 0;
		tr(a) && (s && (a.f |= 512), bt(a)), s && !c && (St(a), cr(a));
	}
	if (Tt?.has(e)) return Tt.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function cr(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (St(t), cr(t));
}
function lr(e) {
	if (e.v === ye) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Ht.has(t) || t.f & 2 && lr(t)) return !0;
	return !1;
}
function ur(e) {
	var t = Vn;
	try {
		return Vn = !0, e();
	} finally {
		Vn = t;
	}
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var dr = ["touchstart", "touchmove"];
function fr(e) {
	return dr.includes(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
var pr = Symbol("events"), mr = /* @__PURE__ */ new Set(), hr = /* @__PURE__ */ new Set();
function gr(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || xr.call(t, e), !e.cancelBubble) return it(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? We(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function _r(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = gr(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && _n(() => {
		t.removeEventListener(e, o, a);
	});
}
function K(e, t, n) {
	(t[pr] ??= {})[e] = n;
}
function vr(e) {
	for (var t = 0; t < e.length; t++) mr.add(e[t]);
	for (var n of hr) n(e);
}
var yr = null, br = !1;
function xr(e) {
	var t = this, n = t.ownerDocument, r = e.type, a = e.composedPath?.() || [], o = a[0] || e.target;
	yr = e, br || (br = !0, setTimeout(() => {
		br = !1, yr = null;
	}));
	var s = 0, c = yr === e && e[pr];
	if (c) {
		var l = a.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[pr] = t;
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
		var d = U, f = W;
		Hn(null), Un(null);
		try {
			for (var p, m = []; o !== null && o !== t;) {
				try {
					var h = o[pr]?.[r];
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
			e[pr] = t, delete e.currentTarget, Hn(d), Un(f);
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
	var t = dn("template");
	return t.innerHTML = Cr(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function Tr(e, t) {
	var n = W;
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
		if (N) return Tr(P, null), P;
		i === void 0 && (i = wr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ on(i)));
		var t = r || en ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ on(t), s = t.lastChild;
			Tr(o, s);
		} else Tr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Er(e, t, n = "svg") {
	var r = !e.startsWith("<!>"), i = !!(t & 1), a = `<${n}>${r ? e : "<!>" + e}</${n}>`, o;
	return () => {
		if (N) return Tr(P, null), P;
		if (!o) {
			var e = /* @__PURE__ */ on(wr(a));
			if (i) for (o = document.createDocumentFragment(); /* @__PURE__ */ on(e);) o.appendChild(/* @__PURE__ */ on(e));
			else o = /* @__PURE__ */ on(e);
		}
		var t = o.cloneNode(!0);
		if (i) {
			var n = /* @__PURE__ */ on(t), r = t.lastChild;
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
	if (!N) {
		var t = an(e + "");
		return Tr(t, t), t;
	}
	var n = P;
	return n.nodeType === 3 ? fn(n) : (n.before(n = an()), Ee(n)), Tr(n, n), n;
}
function kr() {
	if (N) return Tr(P, null), P;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = an();
	return e.append(t, n), Tr(t, n), e;
}
function J(e, t) {
	if (N) {
		var n = W;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = P), De();
	} else e !== null && e.before(t);
}
function Ar() {
	if (N && P && P.nodeType === 8 && P.textContent?.startsWith("$")) {
		let e = P.textContent.substring(1);
		return De(), e;
	}
	return (window.__svelte ??= {}).uid ??= 1, `c${window.__svelte.uid++}`;
}
function Y(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[ne] ??= e.nodeValue) && (e[ne] = n, e.nodeValue = `${n}`);
}
function jr(e, t) {
	return Nr(e, t);
}
var Mr = /* @__PURE__ */ new Map();
function Nr(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	rn();
	var l = void 0, u = bn(() => {
		var s = n ?? t.appendChild(an());
		ct(s, { pending: () => {} }, (t) => {
			ze({});
			var n = Le;
			if (o && (n.c = o), a && (i.$$events = a), N && Tr(t, null), l = e(t, i) || {}, N && (W.nodes.end = P, P === null || P.nodeType !== 8 || P.data !== "]")) throw Se(), ve;
			Be();
		}, c);
		var u = /* @__PURE__ */ new Set(), d = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!u.has(r)) {
					u.add(r);
					var i = fr(r);
					for (let e of [t, document]) {
						var a = Mr.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), Mr.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, xr, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return d(r(mr)), hr.add(d), () => {
			for (var e of u) for (let n of [t, document]) {
				var r = Mr.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, xr), r.delete(e), r.size === 0 && Mr.delete(n)) : r.set(e, i);
			}
			hr.delete(d), s !== n && s.parentNode?.removeChild(s);
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
						In(r, t), t.append(an()), this.#n.set(e, {
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
		var n = L, r = un();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = an();
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
		} else N && (this.anchor = P), this.#a(n);
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
function X(e, t, n = !1) {
	var r;
	N && (r = P, De());
	var i = new Ir(e), a = n ? x : 0;
	function o(e, t) {
		if (N) {
			var n = Ae(r);
			if (e !== parseInt(n.substring(1))) {
				var a = ke();
				Ee(a), i.anchor = a, Te(!1), i.ensure(e, t), Te(!0);
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
function Lr(e, t) {
	return t;
}
function Rr(e, t, n) {
	for (var i = [], a = t.length, o, s = t.length, c = 0; c < a; c++) {
		let n = t[c];
		Mn(n, () => {
			if (o) {
				if (o.pending.delete(n), o.done.add(n), o.pending.size === 0) {
					var t = e.outrogroups;
					zr(e, r(o.done)), t.delete(o), t.size === 0 && (e.outrogroups = null);
				}
			} else --s;
		}, !1);
	}
	if (s === 0) {
		var l = i.length === 0 && n !== null && e.pending.size === 0;
		if (l) {
			var u = n, d = u.parentNode;
			ln(d), d.append(u), e.items.clear();
		}
		zr(e, t, !l);
	} else o = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(o);
}
function zr(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= w, In(a, document.createDocumentFragment())) : kn(t[i], n);
	}
}
var Br;
function Z(t, n, i, a, o, s = null) {
	var c = t, l = /* @__PURE__ */ new Map();
	if (n & 4) {
		var u = t;
		c = N ? Ee(/* @__PURE__ */ on(u)) : u.appendChild(an());
	}
	N && De();
	var d = null, f = /* @__PURE__ */ _t(() => {
		var t = i();
		return e(t) ? t : t == null ? [] : r(t);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, Hr(v, p, c, n, a), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= w, Wr(d, null, c)) : Pn(d) : Mn(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: wn(() => {
			p = G(f);
			var e = p.length;
			let t = !1;
			N && Ae(c) === "[!" != (e === 0) && (c = ke(), Ee(c), Te(!1), t = !0);
			for (var r = /* @__PURE__ */ new Set(), u = L, v = un(), y = 0; y < e; y += 1) {
				N && P.nodeType === 8 && P.data === "]" && (c = P, t = !0, Te(!1));
				var b = p[y], x = a(b, y), S = h ? null : l.get(x);
				S ? (S.v && Kt(S.v, b), S.i && Kt(S.i, y), v && u.unskip_effect(S.e)) : (S = Ur(l, h ? c : Br ??= an(), b, x, y, o, n, i), h || (S.e.f |= w), l.set(x, S)), r.add(x);
			}
			if (e === 0 && s && !d && (h ? d = Tn(() => s(c)) : (d = Tn(() => s(Br ??= an())), d.f |= w)), e > r.size && ce("", "", ""), N && e > 0 && Ee(ke()), !h) {
				if (m.set(u, r), v) {
					for (let [e, t] of l) r.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			t && Te(!0), G(f);
		}),
		flags: n,
		items: l,
		pending: m,
		outrogroups: null,
		fallback: d
	};
	h = !1, N && (c = P);
}
function Vr(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function Hr(e, t, n, i, a) {
	var o = !!(i & 8), s = t.length, c = e.items, l = Vr(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (o) for (v = 0; v < s; v += 1) h = t[v], g = a(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = a(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (Pn(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= w, _ === l) Wr(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), Gr(e, d, _), Gr(e, _, y), Wr(_, y, n), d = _, p = [], m = [], l = Vr(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], C = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) Wr(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					Gr(e, S.prev, C.next), Gr(e, d, S), Gr(e, C, b), l = b, d = C, --v, p = [], m = [];
				} else u.delete(_), Wr(_, l, n), Gr(e, _.prev, _.next), Gr(e, _, d === null ? e.effect.first : d.next), Gr(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = Vr(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = Vr(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (zr(e, r(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var T = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || T.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && T.push(l), l = Vr(l.next);
		var E = T.length;
		if (E > 0) {
			var D = i & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < E; v += 1) T[v].nodes?.a?.measure();
				for (v = 0; v < E; v += 1) T[v].nodes?.a?.fix();
			}
			Rr(e, T, D);
		}
	}
	o && We(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Ur(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? Wt(n) : /* @__PURE__ */ Gt(n, !1, !1) : null, l = o & 2 ? Wt(i) : null;
	return {
		v: c,
		i: l,
		e: Tn(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function Wr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ sn(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function Gr(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function Kr(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") {
		if (Array.isArray(e)) {
			var i = e.length;
			for (t = 0; t < i; t++) e[t] && (n = Kr(e[t])) && (r && (r += " "), r += n);
		} else for (n in e) e[n] && (r && (r += " "), r += n);
	}
	return r;
}
function qr() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = Kr(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/shared/attributes.js
function Jr(e) {
	return typeof e == "object" ? qr(e) : e ?? "";
}
var Yr = [..." 	\n\r\f\xA0\v﻿"];
function Xr(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || Yr.includes(r[o - 1])) && (s === r.length || Yr.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function Zr(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function Qr(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function $r(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\/\*.*?\*\//g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(Qr)), i && c.push(...Object.keys(i).map(Qr));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = Qr(e.substring(l, u).trim());
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
		return r && (n += Zr(r)), i && (n += Zr(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/class.js
function ei(e, t, n, r, i, a) {
	var o = e[j];
	if (N || o !== n || o === void 0) {
		var s = Xr(n, r, a);
		(!N || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[j] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/style.js
function ti(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function ni(e, t, n, r) {
	var i = e[M];
	if (N || i !== t) {
		var a = $r(t, r);
		(!N || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[M] = t;
	} else r && (Array.isArray(r) ? (ti(e, n?.[0], r[0]), ti(e, n?.[1], r[1], "important")) : ti(e, n, r));
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function ri(t, n, r = !1) {
	if (t.multiple) {
		if (n == null) return;
		if (!e(n)) return Ce();
		for (var i of t.options) i.selected = n.includes(ai(i));
	} else {
		for (i of t.options) if (Qt(ai(i), n)) {
			i.selected = !0;
			return;
		}
		(!r || n !== void 0) && (t.selectedIndex = -1);
	}
}
function ii(e) {
	var t = new MutationObserver(() => {
		"__value" in e && ri(e, e.__value);
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
function ai(e) {
	return "__value" in e ? e.__value : e.value;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var oi = Symbol("is custom element"), si = Symbol("is html"), ci = ae ? "link" : "LINK", li = ae ? "progress" : "PROGRESS";
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
		e[re] = n, We(n), rt();
	}
}
function ui(e, t) {
	var n = fi(e);
	n.value !== (n.value = t ?? void 0) && (e.value !== t || t === 0 && e.nodeName === li) && (e.value = t ?? "");
}
function di(e, t) {
	var n = fi(e);
	n.checked !== (n.checked = t ?? void 0) && (e.checked = t);
}
function $(e, t, n, r) {
	var i = fi(e);
	N && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === ci) || i[t] !== (i[t] = n) && (t === "loading" && (e[te] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && mi(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function fi(e) {
	return e[A] ??= {
		[oi]: e.nodeName.includes("-"),
		[si]: e.namespaceURI === be
	};
}
var pi = /* @__PURE__ */ new Map();
function mi(e) {
	var t = e.getAttribute("is") || e.nodeName, n = pi.get(t);
	if (n) return n;
	pi.set(t, n = []);
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var s in r = o(i), r) r[s].set && s !== "innerHTML" && s !== "textContent" && s !== "innerText" && n.push(s);
		i = l(i);
	}
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function hi(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet();
	at(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = gi(e) ? _i(a) : a, n(a), L !== null && r.add(L), await sr(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (N && e.defaultValue !== e.value || ur(t) == null && e.value) && (n(gi(e) ? _i(e.value) : e.value), L !== null && r.add(L)), Cn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = L;
			if (r.has(i)) return;
		}
		gi(e) && n === _i(e.value) || (e.type !== "date" || n || e.value) && n !== e.value && (e.value = n ?? "");
	});
}
function gi(e) {
	var t = e.type;
	return t === "number" || t === "range";
}
function _i(e) {
	return e === "" ? null : +e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function vi(e, t) {
	return e === t || e?.[k] === t;
}
function yi(e = {}, t, n, r) {
	var i = Le.r, a = W;
	return xn(() => {
		var o, s;
		return Cn(() => {
			o = s, s = r?.() || [], ur(() => {
				vi(n(...s), e) || (t(e, ...s), o && vi(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && vi(n(...s), e) && t(null, ...s);
			}, c = r.teardown;
			r.teardown = () => {
				o(), c?.();
			};
		};
	}), e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/props.js
function bi(e, t, n, r) {
	var i = !0, o = !!(n & 8), s = !!(n & 16), c = r, l = !0, u = void 0, d = () => s && i ? (u ??= /* @__PURE__ */ mt(r), G(u)) : (l && (l = !1, c = s ? ur(r) : r), c);
	let f;
	if (o) {
		var p = k in e || ee in e;
		f = a(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	o ? [m, h] = et(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && pe(t), f(m)));
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
	var v = !1, y = (n & 1 ? mt : _t)(() => (v = !1, g()));
	o && G(y);
	var b = W;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? G(y) : i && o ? Xt(e) : e;
			return z(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return zn && v || b.f & 16384 ? y.v : G(y);
	});
}
function xi(e) {
	Le === null && oe("onMount"), vn(() => {
		let t = ur(e);
		if (typeof t == "function") return t;
	});
}
function Si(e) {
	Le === null && oe("onDestroy"), xi(() => () => ur(e));
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region ui/NodeCard.svelte
var Ci = /* @__PURE__ */ q("<div><span class=\"pc-native-pin-label\"> </span> <div role=\"img\"></div></div>"), wi = /* @__PURE__ */ q("<div class=\"pc-node-body\"> </div>"), Ti = /* @__PURE__ */ q("<span class=\"pc-native-alias\"> </span>"), Ei = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-node-action pc-host-result\" aria-label=\"Preview host result\"><i class=\"fa-solid fa-eye\" aria-hidden=\"true\"></i> Host result</button>"), Di = /* @__PURE__ */ q("<div role=\"group\"><div class=\"pc-native-heading\"><svg class=\"pc-native-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path></path></svg><span class=\"pc-node-title\"> </span></div> <div class=\"pc-native-pins\"></div> <!> <!> <!></div>");
function Oi(e, t) {
	ze(t, !0);
	let n = (e) => e.stopPropagation();
	var r = Di();
	let i;
	var a = B(r), o = B(a), s = B(o);
	F(o);
	var c = V(o), l = B(c, !0);
	F(c), F(a);
	var u = V(a, 2);
	Z(u, 21, () => t.card.ports, (e) => e.id, (e, n) => {
		var r = Ci();
		let i;
		var a = B(r), o = B(a, !0);
		F(a);
		var s = V(a, 2);
		F(r), H(() => {
			ei(r, 1, `pc-native-row pc-native-row-${G(n).dir}`), i = ni(r, "", i, { "grid-row": G(n).row }), Y(o, G(n).label), ei(s, 1, Jr(G(n).className)), $(s, "data-node", t.card.id), $(s, "data-dir", G(n).dir), $(s, "data-port", G(n).port), $(s, "data-side", G(n).side), $(s, "data-kind", G(n).kind), $(s, "title", G(n).title), $(s, "aria-label", G(n).title);
		}), _r("mouseenter", s, () => t.actions.hoverPin({
			nodeId: t.card.id,
			dir: G(n).dir,
			port: G(n).port
		})), _r("mouseleave", s, () => t.actions.hoverPin(null)), J(e, r);
	}), F(u);
	var d = V(u, 2), f = (e) => {
		var n = wi(), r = B(n, !0);
		F(n), H(() => Y(r, t.card.body)), J(e, n);
	};
	X(d, (e) => {
		t.card.type === "note" && e(f);
	});
	var p = V(d, 2), m = (e) => {
		var n = Ti(), r = B(n, !0);
		F(n), H(() => {
			$(n, "title", t.card.titleHint), Y(r, t.card.title);
		}), J(e, n);
	};
	X(p, (e) => {
		t.card.compact && e(m);
	});
	var h = V(p, 2), g = (e) => {
		var r = Ei();
		K("mousedown", r, n), K("click", r, (e) => {
			n(e), t.actions.hostResult(t.card.id);
		}), J(e, r);
	};
	X(h, (e) => {
		t.card.hostResult && e(g);
	}), F(r), H(() => {
		ei(r, 1, Jr(t.card.className)), $(r, "data-id", t.card.id), $(r, "title", t.card.offHint), $(r, "aria-label", `${t.card.label}: ${t.card.title}`), i = ni(r, "", i, {
			left: `${t.card.x}px`,
			top: `${t.card.y}px`
		}), $(s, "d", t.card.iconPath), $(c, "title", t.card.titleHint), Y(l, t.card.title);
	}), J(e, r), Be();
}
vr(["mousedown", "click"]);
//#endregion
//#region ui/GroupCard.svelte
var ki = /* @__PURE__ */ q("<div class=\"pc-node-body\"> </div>"), Ai = /* @__PURE__ */ q("<div role=\"group\"><div><i class=\"fa-solid fa-object-group\" aria-hidden=\"true\"></i> <span> </span> <span class=\"pc-group-frame-count\"> </span> <button type=\"button\"></button></div> <!></div>");
function ji(e, t) {
	ze(t, !0);
	function n(e, n) {
		e.stopPropagation(), e.preventDefault(), t.actions.group(t.group.id, n);
	}
	function r(e, n) {
		e.stopPropagation(), e.detail === 0 && t.actions.group(t.group.id, n);
	}
	var i = Ai();
	let a;
	var o = B(i), s = V(B(o), 2), c = B(s, !0);
	F(s);
	var l = V(s, 2), u = B(l, !0);
	F(l);
	var d = V(l, 2);
	F(o);
	var f = V(o, 2), p = (e) => {
		var n = ki(), r = B(n, !0);
		F(n), H(() => Y(r, t.group.body)), J(e, n);
	};
	X(f, (e) => {
		t.group.collapsed && e(p);
	}), F(i), H(() => {
		ei(i, 1, Jr(t.group.className)), $(i, "data-group", t.group.id), $(i, "aria-label", `Group: ${t.group.title}`), a = ni(i, "", a, {
			left: `${t.group.x}px`,
			top: `${t.group.y}px`,
			width: `${t.group.w}px`,
			height: t.group.collapsed ? void 0 : `${t.group.h}px`
		}), ei(o, 1, Jr(t.group.collapsed ? "pc-node-head" : "pc-group-frame-head")), ei(s, 1, Jr(t.group.collapsed ? "pc-node-title" : "pc-group-frame-title")), Y(c, t.group.title), Y(u, t.group.count), ei(d, 1, `pc-node-action fa-solid pc-group-btn ${t.group.collapsed ? "fa-up-right-and-down-left-from-center" : "fa-down-left-and-up-right-to-center"}`), $(d, "data-action", t.group.collapsed ? "open" : "collapse"), $(d, "title", t.group.collapsed ? "Open group" : "Fold group"), $(d, "aria-label", t.group.collapsed ? "Open group" : "Fold group");
	}), K("mousedown", d, (e) => n(e, t.group.collapsed ? "open" : "collapse")), K("click", d, (e) => r(e, t.group.collapsed ? "open" : "collapse")), J(e, i), Be();
}
vr(["mousedown", "click"]);
//#endregion
//#region ui/WireLayer.svelte
var Mi = /* @__PURE__ */ Dr("<path class=\"pc-wire-hit\"></path><path><title> </title></path><text text-anchor=\"middle\"> </text>", 1), Ni = /* @__PURE__ */ Dr("<path></path>"), Pi = /* @__PURE__ */ Dr("<!><!>", 1);
function Fi(e, t) {
	ze(t, !0);
	var n = Pi(), r = cn(n);
	Z(r, 17, () => t.wires, (e) => e.id, (e, t) => {
		var n = Mi(), r = cn(n), i = V(r), a = B(i), o = B(a);
		F(a), F(i);
		var s = V(i), c = B(s, !0);
		F(s), H(() => {
			$(r, "d", G(t).d), $(r, "data-id", G(t).id), $(i, "d", G(t).d), ei(i, 0, Jr(G(t).className)), $(i, "data-id", G(t).id), $(i, "data-kind", G(t).kind), Y(o, `${G(t).kind ?? ""} artifact`), $(s, "x", G(t).label.x), $(s, "y", G(t).label.y), ei(s, 0, Jr(G(t).label.className)), Y(c, G(t).label.text);
		}), J(e, n);
	});
	var i = V(r), a = (e) => {
		var n = Ni();
		H(() => {
			$(n, "d", t.ghost.d), ei(n, 0, Jr(t.ghost.className));
		}), J(e, n);
	};
	X(i, (e) => {
		t.ghost && e(a);
	}), J(e, n), Be();
}
//#endregion
//#region ui/CanvasLayer.svelte
var Ii = /* @__PURE__ */ q("<div class=\"pc-viewport\" data-pc-renderer=\"svelte\"><svg class=\"pc-wires\" aria-label=\"Canvas connections\"><!></svg> <div class=\"pc-nodes\"><!> <!> <!></div></div>");
function Li(e, t) {
	ze(t, !0);
	let n = /* @__PURE__ */ R([]), r = /* @__PURE__ */ R([]), i = /* @__PURE__ */ R([]), a = /* @__PURE__ */ R(null), o = /* @__PURE__ */ R({
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
		z(n, e);
	}
	function f(e) {
		z(r, e);
	}
	function p(e, t, n) {
		z(i, e), z(o, t), z(a, n);
	}
	function m(e, t) {
		let i = new Map(e.map((e) => [e.id, e])), a = new Map(t.map((e) => [e.id, e]));
		z(n, G(n).map((e) => i.has(e.id) ? {
			...e,
			...i.get(e.id)
		} : e)), z(r, G(r).map((e) => a.has(e.id) ? {
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
	}, g = Ii(), _ = B(g);
	Fi(B(_), {
		get wires() {
			return G(i);
		},
		get ghost() {
			return G(a);
		}
	}), F(_), yi(_, (e) => c = e, () => c);
	var v = V(_, 2), y = B(v);
	Z(y, 17, () => G(r).filter((e) => !e.collapsed), (e) => e.id, (e, n) => {
		ji(e, {
			get group() {
				return G(n);
			},
			get actions() {
				return t.actions;
			}
		});
	});
	var b = V(y, 2);
	return Z(b, 17, () => G(n), (e) => e.id, (e, n) => {
		Oi(e, {
			get card() {
				return G(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), Z(V(b, 2), 17, () => G(r).filter((e) => e.collapsed), (e) => e.id, (e, n) => {
		ji(e, {
			get group() {
				return G(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), F(v), yi(v, (e) => l = e, () => l), F(g), yi(g, (e) => s = e, () => s), H(() => {
		$(_, "width", G(o).w), $(_, "height", G(o).h), $(_, "viewBox", `0 0 ${G(o).w} ${G(o).h}`);
	}), J(e, g), Be(h);
}
//#endregion
//#region ui/WorkspaceMenus.svelte
var Ri = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-flat-menu\" aria-haspopup=\"menu\"> </button>"), zi = /* @__PURE__ */ q("<button type=\"button\" role=\"menuitem\"><span> </span><small> </small></button>"), Bi = /* @__PURE__ */ q("<div class=\"pc-workspace-menu-panel\" role=\"menu\" tabindex=\"-1\"></div>"), Vi = /* @__PURE__ */ q("<nav class=\"pc-workspace-menus\" aria-label=\"Workspace menus\"><!> <!></nav>");
function Hi(e, t) {
	ze(t, !0);
	let n = /* @__PURE__ */ I(() => t.state.rootWorkflow ?? t.state.workflow), r = /* @__PURE__ */ R(""), i, a = /* @__PURE__ */ R(null), o = null, s = /* @__PURE__ */ R(0), c = /* @__PURE__ */ R(0), l = [
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
				u("Run workflow", "run-workflow", "", !G(n) || !!G(n)?.busy || !!G(n)?.issues.length),
				u("Stop workflow", "stop-workflow", "", !G(n)?.busy),
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
		z(r, ""), e && o?.focus({ preventScroll: !0 });
	}
	async function p(e, t, n = !1) {
		if (G(r) === e && !n) {
			f();
			return;
		}
		z(r, e, !0), o = t, await sr();
		let i = t.getBoundingClientRect(), l = G(a).getBoundingClientRect();
		z(s, Math.max(4, Math.min(i.left, window.innerWidth - l.width - 4)), !0), z(c, i.bottom + 2), n && G(a).querySelector("button:not(:disabled)")?.focus();
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
		if (e.key === "Escape" && G(r)) e.preventDefault(), e.stopPropagation(), f(!0);
		else if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
			e.preventDefault();
			let n = G(r) || t.textContent || l[0], a = l[(l.indexOf(n) + (e.key === "ArrowRight" ? 1 : l.length - 1)) % l.length], o = i.querySelector(`[data-menu="${a}"]`);
			G(r) ? p(a, o, !0) : o.focus();
		} else if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Home" || e.key === "End") {
			if (e.preventDefault(), !G(r)) {
				p(t.dataset.menu || l[0], t, !0);
				return;
			}
			let n = [...G(a).querySelectorAll("button:not(:disabled)")], i = n.indexOf(t);
			n[e.key === "Home" ? 0 : e.key === "End" ? n.length - 1 : (i + (e.key === "ArrowUp" ? n.length - 1 : 1)) % n.length]?.focus();
		} else e.key === "Tab" && f();
	}
	var g = Vi();
	_r("pointerdown", $t, (e) => {
		G(r) && !i.contains(e.target) && !G(a)?.contains(e.target) && f();
	}), _r("resize", $t, () => f());
	var _ = B(g);
	Z(_, 17, () => l, Lr, (e, t) => {
		var n = Ri(), i = B(n, !0);
		F(n), H(() => {
			$(n, "data-menu", G(t)), $(n, "aria-expanded", G(r) === G(t)), Y(i, G(t));
		}), K("click", n, (e) => p(G(t), e.currentTarget)), K("keydown", n, h), J(e, n);
	});
	var v = V(_, 2), y = (e) => {
		var t = Bi();
		let n;
		Z(t, 21, () => d(G(r)), Lr, (e, t) => {
			var n = zi(), r = B(n), i = B(r, !0);
			F(r);
			var a = V(r), o = B(a, !0);
			F(a), F(n), H(() => {
				n.disabled = G(t).disabled, Y(i, G(t).label), Y(o, G(t).shortcut);
			}), K("click", n, () => m(G(t).command)), J(e, n);
		}), F(t), yi(t, (e) => z(a, e), () => G(a)), H(() => {
			$(t, "aria-label", G(r)), n = ni(t, "", n, {
				left: `${G(s)}px`,
				top: `${G(c)}px`
			});
		}), K("keydown", t, h), J(e, t);
	};
	X(v, (e) => {
		G(r) && e(y);
	}), F(g), yi(g, (e) => i = e, () => i), J(e, g), Be();
}
vr(["click", "keydown"]);
//#endregion
//#region ui/Toolbar.svelte
var Ui = /* @__PURE__ */ q("<option> </option>"), Wi = /* @__PURE__ */ q("<header class=\"pc-header\" data-pc-ui=\"svelte\"><div class=\"pc-menubar\"><div class=\"pc-brand\"><img width=\"30\" height=\"30\" alt=\"\"/><span>LATTICE</span></div> <!> <button type=\"button\" class=\"pc-btn menu_button pc-close\" title=\"Close\" aria-label=\"Close canvas\">×</button></div> <div class=\"pc-workflow-bar\"><select class=\"pc-select pc-graph-select text_pole\" aria-label=\"Workflow\"></select> <div class=\"pc-header-actions pc-history\"><button type=\"button\" aria-label=\"Undo\">↶</button> <button type=\"button\" aria-label=\"Redo\">↷</button> <span> </span></div> <button type=\"button\" class=\"pc-btn menu_button pc-root-run\"> </button> <span class=\"pc-root-workflow-status\" role=\"status\"> </span> <button type=\"button\" class=\"pc-btn menu_button\" title=\"Workflow setup\">Setup</button> <div class=\"pc-header-actions pc-surface-actions\"><button type=\"button\" title=\"Show or hide the inspector\" aria-label=\"Toggle inspector\">Details</button></div> <label class=\"pc-arm\"><input class=\"pc-arm-input\" type=\"checkbox\"/><span>Arm</span></label></div></header>");
function Gi(e, t) {
	ze(t, !0);
	let n = /* @__PURE__ */ I(() => t.state.rootWorkflow ?? t.state.workflow), r, i, a, o;
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
	}, u = Wi(), d = B(u), f = B(d), p = B(f);
	Oe(), F(f);
	var m = V(f, 2);
	Hi(m, {
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
	F(d);
	var g = V(d, 2), _ = B(g);
	Z(_, 21, () => t.state.graphs, (e) => e.id, (e, t) => {
		var n = Ui(), r = B(n, !0);
		F(n);
		var i = {};
		H(() => {
			Y(r, G(t).name), i !== (i = G(t).id) && (n.value = (n.__value = G(t).id) ?? "");
		}), J(e, n);
	}), F(_), yi(_, (e) => i = e, () => i);
	var v;
	ii(_);
	var y = V(_, 2), b = B(y), x = V(b, 2), S = V(x, 2), C = B(S, !0);
	F(S), F(y);
	var w = V(y, 2), T = B(w, !0);
	F(w);
	var E = V(w, 2), D = B(E);
	F(E);
	var O = V(E, 2), k = V(O, 2), ee = B(k);
	yi(ee, (e) => o = e, () => o), F(k);
	var te = V(k, 2), A = B(te);
	return Q(A), yi(A, (e) => a = e, () => a), Oe(), F(te), F(g), F(u), yi(u, (e) => r = e, () => r), H((e) => {
		$(p, "src", t.actions.logoUrl), v !== (v = t.state.graphId) && (_.value = (_.__value = t.state.graphId) ?? "", ri(_, t.state.graphId)), ei(b, 1, `pc-btn menu_button pc-undo${t.state.history.undo ? "" : " pc-disabled"}`), b.disabled = !t.state.history.undo, $(b, "title", t.state.history.undoTitle), ei(x, 1, `pc-btn menu_button pc-redo${t.state.history.redo ? "" : " pc-disabled"}`), x.disabled = !t.state.history.redo, $(x, "title", t.state.history.redoTitle), ei(S, 1, `pc-history-note${t.state.history.showNote ? " pc-show" : ""}`), Y(C, t.state.history.note), w.disabled = !G(n) || !G(n).busy && !!G(n).issues.length, $(w, "title", e), Y(T, G(n)?.busy ? "■ Stop" : "▶ Run"), Y(D, `${G(n) ? `${G(n).phase} · ${G(n).assigned ? "Assigned" : "Unassigned"} · ≤ ${G(n).callBound} requests` : "Workflow unavailable"} · Autosave`), ei(ee, 1, `pc-btn menu_button pc-pane-toggle${t.state.inspectorOpen ? " pc-on" : ""}`), $(ee, "aria-pressed", t.state.inspectorOpen), di(A, t.state.armed);
	}, [() => G(n)?.issues.join("\n") || "Run the root workflow"]), K("click", h, () => t.actions.command("close")), K("change", _, (e) => t.actions.pickGraph(e.currentTarget.value)), K("click", b, () => t.actions.command("undo")), K("click", x, () => t.actions.command("redo")), K("click", w, () => t.actions.command(G(n)?.busy ? "stop-workflow" : "run-workflow")), K("click", O, () => t.local("workflow-setup")), K("click", ee, () => t.actions.command("inspector")), K("change", A, (e) => t.actions.arm(e.currentTarget.checked)), J(e, u), Be(l);
}
vr(["click", "change"]);
//#endregion
//#region ui/PaneDivider.svelte
var Ki = /* @__PURE__ */ q("<div class=\"pc-pane-divider\" role=\"separator\" aria-label=\"Resize preview\" aria-orientation=\"horizontal\" tabindex=\"0\"></div>");
function qi(e, t) {
	ze(t, !0);
	let n = bi(t, "min", 3, 90), r = bi(t, "max", 3, 500), i, a = null, o = (e) => Math.max(n(), Math.min(r(), e));
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
	Si(u);
	var f = Ki();
	_r("blur", $t, u), yi(f, (e) => i = e, () => i), H((e, t) => {
		$(f, "aria-valuemin", n()), $(f, "aria-valuemax", e), $(f, "aria-valuenow", t);
	}, [() => Math.round(r()), () => Math.round(t.height)]), K("pointerdown", f, s), K("pointermove", f, c), K("pointerup", f, (e) => l(!1, e.pointerId)), _r("pointercancel", f, (e) => l(!0, e.pointerId)), _r("lostpointercapture", f, (e) => l(!0, e.pointerId)), K("keydown", f, d), J(e, f), Be();
}
vr([
	"pointerdown",
	"pointermove",
	"pointerup",
	"keydown"
]);
//#endregion
//#region ui/GraphTabs.svelte
var Ji = /* @__PURE__ */ q("<span class=\"pc-graph-tab-lock svelte-7ptwed\" aria-label=\"Read only\">◇</span>"), Yi = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-graph-tab-close svelte-7ptwed\">×</button>"), Xi = /* @__PURE__ */ q("<div><button type=\"button\" role=\"tab\"><span class=\"svelte-7ptwed\"> </span><!></button> <!></div>"), Zi = /* @__PURE__ */ q("<button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button>"), Qi = /* @__PURE__ */ q("<div class=\"pc-graph-view-menu svelte-7ptwed\" role=\"menu\" aria-label=\"Graph view actions\" tabindex=\"-1\"><!> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close active view</button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close other views</button> <!></div>"), $i = /* @__PURE__ */ q("<nav class=\"pc-graph-tabs pc-graph-tabs-multi svelte-7ptwed\" aria-label=\"Open graph views\"><div class=\"pc-graph-tab-list svelte-7ptwed\" role=\"tablist\" aria-label=\"Graph views\"></div> <button type=\"button\" class=\"pc-graph-view-overflow svelte-7ptwed\" aria-label=\"Graph view actions\" title=\"Focus, close or reopen graph views\" aria-haspopup=\"menu\">⋯</button> <!></nav>");
function ea(e, t) {
	ze(t, !0);
	let n = bi(t, "actions", 19, () => ({})), r = bi(t, "idPrefix", 3, "pc-graph-view"), i = /* @__PURE__ */ R(null), a = /* @__PURE__ */ R(null), o = /* @__PURE__ */ R(null), s = /* @__PURE__ */ R(!1), c = /* @__PURE__ */ R(""), l = "", u = {};
	vn(() => {
		let e = t.views?.active.key ?? "";
		l === e ? t.views && !t.views.tabs.some((e) => e.key === G(c)) && z(c, e, !0) : (z(c, e, !0), z(s, !1)), l = e;
	});
	function d(e) {
		let t = e.breadcrumbs.map((e) => e.label).join(" / ") || e.label, n = e.identity;
		return n.kind === "instance" ? `${t} (${n.instancePath.map((e) => JSON.stringify(e)).join(" → ")})` : n.kind === "library" ? `${t} · Library v${n.definitionRef.version} (${n.definitionRef.id})` : t;
	}
	function f(e) {
		z(c, e, !0), n().focusView?.(e), u[e]?.focus({ preventScroll: !0 });
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
		n().closeView?.(e.key), await sr();
		let r = t.views?.active.key;
		r && t.views?.tabs.some((e) => e.key === r) && (z(c, r, !0), u[r]?.focus({ preventScroll: !0 }));
	}
	function h(e = !1) {
		z(s, !1), e && G(o)?.focus({ preventScroll: !0 });
	}
	async function g() {
		z(s, !G(s)), G(s) && (await sr(), G(s) && G(a)?.querySelector("button:not(:disabled)")?.focus());
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
		let t = [...G(a).querySelectorAll("button:not(:disabled)")], n = t.indexOf(e.target);
		t[e.key === "Home" ? 0 : e.key === "End" ? t.length - 1 : (n + (e.key === "ArrowUp" ? t.length - 1 : 1)) % t.length]?.focus();
	}
	function v(e) {
		h(!0), e();
	}
	var y = kr();
	_r("pointerdown", $t, (e) => {
		G(s) && !G(i)?.contains(e.target) && h();
	});
	var b = cn(y), x = (e) => {
		var l = $i(), h = B(l);
		Z(h, 23, () => t.views.tabs, (e) => e.key, (e, n, i) => {
			var a = Xi();
			let o;
			var s = B(a);
			let l;
			var h = B(s), g = B(h, !0);
			F(h);
			var _ = V(h), v = (e) => {
				J(e, Ji());
			};
			X(_, (e) => {
				G(n).readOnly && e(v);
			}), F(s), yi(s, (e, t) => u[t.key] = e, (e) => u?.[e.key], () => [G(n)]);
			var y = V(s, 2), b = (e) => {
				var r = Yi();
				H((e, i) => {
					$(r, "aria-label", e), $(r, "title", i), $(r, "tabindex", G(n).key === (G(c) || t.views.active.key) ? 0 : -1);
				}, [() => `Close ${G(n).label} · ${d(G(n))}`, () => `Close ${d(G(n))}`]), K("click", r, () => m(G(n))), J(e, r);
			};
			X(y, (e) => {
				G(n).identity.kind !== "root" && e(b);
			}), F(a), H((e) => {
				o = ei(a, 1, "pc-graph-tab-item svelte-7ptwed", null, o, { "pc-graph-tab-active": G(n).key === t.views.active.key }), l = ei(s, 1, "pc-graph-tab svelte-7ptwed", null, l, { "pc-graph-tab-closeable": G(n).identity.kind !== "root" }), $(s, "id", `${r()}-${G(i)}`), $(s, "aria-controls", t.panelId), $(s, "aria-selected", G(n).key === t.views.active.key), $(s, "tabindex", G(n).key === (G(c) || t.views.active.key) ? 0 : -1), $(s, "title", e), Y(g, G(n).label);
			}, [() => d(G(n))]), K("click", s, () => f(G(n).key)), K("keydown", s, (e) => p(e, G(i))), J(e, a);
		}), F(h);
		var y = V(h, 2);
		yi(y, (e) => z(o, e), () => G(o));
		var b = V(y, 2), x = (e) => {
			var r = Qi(), i = B(r);
			Z(i, 17, () => t.views.tabs, (e) => e.key, (e, t) => {
				var n = Zi(), r = B(n);
				F(n), H((e, t) => {
					$(n, "title", e), Y(r, `Focus ${t ?? ""}`);
				}, [() => d(G(t)), () => d(G(t))]), K("click", n, () => v(() => f(G(t).key))), J(e, n);
			});
			var o = V(i, 2), s = V(o, 2);
			Z(V(s, 2), 17, () => t.views.closedViews, (e) => e.key, (e, t) => {
				var r = Zi(), i = B(r);
				F(r), H((e, n) => {
					$(r, "title", e), Y(i, `Reopen ${G(t).label ?? ""} · ${n ?? ""}`);
				}, [() => d(G(t)), () => d(G(t))]), K("click", r, () => v(() => n().reopenView?.(G(t).key))), J(e, r);
			}), F(r), yi(r, (e) => z(a, e), () => G(a)), H((e) => {
				o.disabled = t.views.active.identity.kind === "root" || !n().closeView, s.disabled = e;
			}, [() => t.views.tabs.every((e) => e.identity.kind === "root" || e.key === t.views.active.key) || !n().closeOtherViews]), K("keydown", r, _), K("click", o, () => v(() => m(t.views.active))), K("click", s, () => v(() => n().closeOtherViews?.(t.views.active.key))), J(e, r);
		};
		X(b, (e) => {
			G(s) && e(x);
		}), F(l), yi(l, (e) => z(i, e), () => G(i)), H(() => $(y, "aria-expanded", G(s))), K("click", y, g), J(e, l);
	};
	X(b, (e) => {
		t.views && e(x);
	}), J(e, y), Be();
}
vr(["click", "keydown"]);
//#endregion
//#region ui/GraphBreadcrumbs.svelte
var ta = /* @__PURE__ */ q("<span aria-current=\"page\" class=\"svelte-18ovafz\"> </span>"), na = /* @__PURE__ */ q("<button type=\"button\" class=\"svelte-18ovafz\"> </button>"), ra = /* @__PURE__ */ q("<li class=\"svelte-18ovafz\"><!></li>"), ia = /* @__PURE__ */ q("<div class=\"pc-graph-location svelte-18ovafz\"><nav aria-label=\"Graph location\" class=\"svelte-18ovafz\"><ol class=\"svelte-18ovafz\"></ol></nav> <span class=\"pc-graph-scope svelte-18ovafz\"> <!><!></span></div>");
function aa(e, t) {
	ze(t, !0);
	let n = bi(t, "actions", 19, () => ({})), r = /* @__PURE__ */ I(() => t.view?.identity.kind === "library" ? t.view.identity.definitionRef : t.definitionRef ?? t.view?.definitionRef);
	function i(e) {
		return e.identity.kind === "instance" ? !!n().openInstance : !!n().focusView;
	}
	function a(e) {
		e.identity.kind === "instance" ? n().openInstance?.(e.identity.instancePath) : n().focusView?.(e.key);
	}
	var o = kr(), s = cn(o), c = (e) => {
		var n = ia(), o = B(n), s = B(o);
		Z(s, 23, () => t.view.breadcrumbs, (e) => e.key, (e, n, r) => {
			var o = ra(), s = B(o), c = (e) => {
				var t = ta(), r = B(t, !0);
				F(t), H(() => Y(r, G(n).label)), J(e, t);
			}, l = (e) => {
				var t = na(), r = B(t, !0);
				F(t), H((e) => {
					t.disabled = e, Y(r, G(n).label);
				}, [() => !i(G(n))]), K("click", t, () => a(G(n))), J(e, t);
			};
			X(s, (e) => {
				G(r) === t.view.breadcrumbs.length - 1 ? e(c) : e(l, -1);
			}), F(o), J(e, o);
		}), F(s), F(o);
		var c = V(o, 2), l = B(c, !0), u = V(l), d = (e) => {
			var t = Or();
			H(() => Y(t, `· v${G(r).version ?? ""}`)), J(e, t);
		};
		X(u, (e) => {
			G(r) && e(d);
		});
		var f = V(u), p = (e) => {
			J(e, Or("· Read only"));
		};
		X(f, (e) => {
			(t.view.readOnly || t.view.identity.kind === "library") && e(p);
		}), F(c), F(n), H(() => {
			$(c, "title", G(r) ? `${G(r).id} · v${G(r).version} · ${G(r).semanticHash}` : void 0), Y(l, t.view.identity.kind === "library" ? "Library inspection" : "Instance graph");
		}), J(e, n);
	};
	X(s, (e) => {
		t.view && t.view.identity.kind !== "root" && e(c);
	}), J(e, o), Be();
}
vr(["click"]);
//#endregion
//#region ui/NodeDetails.svelte
var oa = /* @__PURE__ */ q("<p class=\"pc-detail-error svelte-59ntjv\" role=\"alert\"> </p>"), sa = /* @__PURE__ */ q("<option class=\"svelte-59ntjv\"> </option>"), ca = /* @__PURE__ */ q("<select class=\"svelte-59ntjv\"></select>"), la = /* @__PURE__ */ q("<input type=\"checkbox\" class=\"svelte-59ntjv\"/>"), ua = /* @__PURE__ */ q("<input type=\"number\" class=\"svelte-59ntjv\"/>"), da = /* @__PURE__ */ q("<textarea class=\"svelte-59ntjv\"></textarea>"), fa = /* @__PURE__ */ q("<button type=\"button\" class=\"svelte-59ntjv\"> </button>"), pa = /* @__PURE__ */ q("<small class=\"svelte-59ntjv\"> </small>"), ma = /* @__PURE__ */ q("<small class=\"svelte-59ntjv\"> <!></small>"), ha = /* @__PURE__ */ q("<label class=\"svelte-59ntjv\"> <!></label> <!> <!> <!> <!> <!>", 1), ga = /* @__PURE__ */ q("<label class=\"svelte-59ntjv\">Connection profile<select aria-label=\"Connection profile\" class=\"svelte-59ntjv\"><option class=\"svelte-59ntjv\">Choose a connection</option><!></select></label>"), _a = /* @__PURE__ */ q("<label class=\"svelte-59ntjv\">Model identifier<input aria-label=\"Model identifier\" class=\"svelte-59ntjv\"/></label>"), va = /* @__PURE__ */ q("<p class=\"pc-detail-error svelte-59ntjv\"> </p>"), ya = /* @__PURE__ */ q("<fieldset class=\"pc-detail-group svelte-59ntjv\" data-model-controls=\"\"><legend class=\"svelte-59ntjv\">Model</legend> <label class=\"svelte-59ntjv\">Model role<input aria-label=\"Model role\" class=\"svelte-59ntjv\"/></label> <label class=\"svelte-59ntjv\">Connection mode<select aria-label=\"Connection mode\" class=\"svelte-59ntjv\"></select></label> <!> <label class=\"svelte-59ntjv\">Model mode<select aria-label=\"Model mode\" class=\"svelte-59ntjv\"></select></label> <!> <small class=\"svelte-59ntjv\"> </small><small class=\"svelte-59ntjv\"> </small> <!> <!></fieldset>"), ba = /* @__PURE__ */ q("<p class=\"pc-detail-port svelte-59ntjv\"> <small class=\"svelte-59ntjv\"> </small></p>"), xa = /* @__PURE__ */ q("<details class=\"svelte-59ntjv\"><summary class=\"svelte-59ntjv\">Inputs and outputs</summary><!></details>"), Sa = /* @__PURE__ */ q("<p role=\"status\" class=\"svelte-59ntjv\"> </p>"), Ca = /* @__PURE__ */ q("<header class=\"svelte-59ntjv\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-59ntjv\"><path class=\"svelte-59ntjv\"></path></svg><div class=\"svelte-59ntjv\"><h3 class=\"svelte-59ntjv\"> </h3><small class=\"svelte-59ntjv\"> </small></div></header> <p class=\"pc-detail-meta svelte-59ntjv\"> <!></p> <fieldset class=\"pc-detail-group svelte-59ntjv\"><legend class=\"svelte-59ntjv\">Presentation</legend> <label class=\"svelte-59ntjv\">Alias<input aria-label=\"Alias\" maxlength=\"80\" class=\"svelte-59ntjv\"/></label> <button type=\"button\" class=\"svelte-59ntjv\">Reset alias</button> <label class=\"pc-detail-check svelte-59ntjv\"><input aria-label=\"Compact card\" type=\"checkbox\" class=\"svelte-59ntjv\"/> Compact card</label> <!></fieldset> <fieldset class=\"pc-detail-group svelte-59ntjv\"><legend class=\"svelte-59ntjv\">Operation</legend> <label class=\"pc-detail-check svelte-59ntjv\"><input aria-label=\"Enabled\" type=\"checkbox\" class=\"svelte-59ntjv\"/> Enabled</label> <small class=\"svelte-59ntjv\">Disabled operations block execution.</small> <!> <!></fieldset> <!> <!> <!> <!> <footer class=\"svelte-59ntjv\"><button type=\"button\" class=\"svelte-59ntjv\">Duplicate</button><button type=\"button\" class=\"pc-detail-danger svelte-59ntjv\">Delete</button></footer>", 1), wa = /* @__PURE__ */ q("<p class=\"pc-detail-empty svelte-59ntjv\">Select a node to inspect its settings.</p>"), Ta = /* @__PURE__ */ q("<section class=\"pc-node-details svelte-59ntjv\" aria-label=\"Node details\"><!></section>");
function Ea(e, t) {
	ze(t, !0);
	let n = bi(t, "actions", 19, () => ({})), r = bi(t, "idPrefix", 3, "pc-node-details"), i = /* @__PURE__ */ R(Xt({})), a = /* @__PURE__ */ R(Xt({})), o = "", s = "", c = 0, l = /* @__PURE__ */ new Map(), u = (e) => JSON.stringify([e.selectionKey, "kind" in e.address ? [
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
	Si(() => {
		d = !1, l.clear();
	}), vn(() => {
		let e = t.view ? u(t.view) : "", n = t.view?.revision ?? "", r = e !== o;
		(r || n !== s) && (o = e, s = n, l.clear(), c++, z(a, {}, !0), z(i, r ? {} : ur(() => Object.fromEntries(Object.entries(G(i)).map(([e, t]) => [e, {
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
		l.set(e, u), z(a, {
			...G(a),
			[e]: ""
		}, !0), G(i)[e] && z(i, {
			...G(i),
			[e]: {
				...G(i)[e],
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
		if (p(s) && l.get(e) === u && (l.delete(e), z(a, {
			...G(a),
			[e]: d
		}, !0), G(i)[e])) {
			if (d) z(i, {
				...G(i),
				[e]: {
					...G(i)[e],
					error: d,
					pending: !1
				}
			}, !0);
			else {
				let t = { ...G(i) };
				delete t[e], z(i, t, !0);
			}
		}
	}
	function g(e, n) {
		t.view && !t.view.readOnly && (l.delete(e.key), z(i, {
			...G(i),
			[e.key]: {
				text: n,
				error: "",
				pending: !1
			}
		}, !0), z(a, {
			...G(a),
			[e.key]: ""
		}, !0));
	}
	function _(e) {
		if (!t.view || t.view.readOnly || !n().editControl) return;
		let r = G(i)[e.key]?.text ?? m(e), a = r;
		if (e.editor === "json") try {
			if (!(e.representation === "json-text" && e.allowEmpty && r.trim() === "")) {
				let t = JSON.parse(r);
				e.representation !== "json-text" && (a = t);
			}
		} catch {
			z(i, {
				...G(i),
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
	let b = (e) => e === "profileId" ? t.view?.model?.profile : t.view?.model?.model, x = (e) => G(i)[e] ? "override" : b(e)?.mode, S = (e) => G(i)[e]?.text ?? b(e)?.value ?? "";
	function C(e, r) {
		t.view && !t.view.readOnly && n().editBinding && b(e)?.allowedModes.some((e) => e.value === "override") && (l.delete(e), z(i, {
			...G(i),
			[e]: {
				text: r,
				error: "",
				pending: !1
			}
		}, !0), z(a, {
			...G(a),
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
		let s = { ...G(i) };
		delete s[e], z(i, s, !0), z(a, {
			...G(a),
			[e]: ""
		}, !0), r !== o.mode && y(e, r, null);
	}
	function T(e, r) {
		t.view && !t.view.readOnly && x(e) === "override" && n().editBinding && b(e)?.allowedModes.some((e) => e.value === "override") && (C(e, r), r.trim() ? y(e, "override", r) : z(i, {
			...G(i),
			[e]: {
				text: r,
				error: e === "profileId" ? "Choose a connection before saving an override." : "Enter a model identifier before saving an override.",
				pending: !1
			}
		}, !0));
	}
	var E = Ta(), D = B(E), O = (e) => {
		var o = Ca(), s = cn(o), c = B(s), l = B(c);
		F(c);
		var u = V(c), d = B(u), p = B(d, !0);
		F(d);
		var y = V(d), b = B(y);
		F(y), F(u), F(s);
		var E = V(s, 2), D = B(E), O = V(D), k = (e) => {
			J(e, Or("· Read-only body"));
		};
		X(O, (e) => {
			t.view.readOnly && e(k);
		}), F(E);
		var ee = V(E, 2), te = V(B(ee), 2), A = V(B(te));
		Q(A), F(te);
		var j = V(te, 2), M = V(j, 2), ne = B(M);
		Q(ne), Oe(), F(M);
		var re = V(M, 2), ie = (e) => {
			var t = oa(), n = B(t, !0);
			F(t), H(() => Y(n, G(a).alias || G(a).compact)), J(e, t);
		};
		X(re, (e) => {
			(G(a).alias || G(a).compact) && e(ie);
		}), F(ee);
		var ae = V(ee, 2), oe = V(B(ae), 2), se = B(oe);
		Q(se), Oe(), F(oe);
		var ce = V(oe, 4), le = (e) => {
			var t = oa(), n = B(t, !0);
			F(t), H(() => Y(n, G(a).enabled)), J(e, t);
		};
		X(ce, (e) => {
			G(a).enabled && e(le);
		}), Z(V(ce, 2), 17, () => t.view.controls, (e) => e.key, (e, o) => {
			var s = ha(), c = cn(s), l = B(c), u = V(l), d = (e) => {
				var r = ca();
				Z(r, 21, () => G(o).options ?? [], (e) => e.value, (e, t) => {
					var n = sa(), r = B(n, !0);
					F(n);
					var i = {};
					H(() => {
						Y(r, G(t).label), i !== (i = G(t).value) && (n.value = (n.__value = G(t).value) ?? "");
					}), J(e, n);
				}), F(r);
				var i;
				ii(r), H((e) => {
					$(r, "aria-label", G(o).label), r.disabled = t.view.readOnly || !n().editControl, i !== (i = e) && (r.value = (r.__value = e) ?? "", ri(r, e));
				}, [() => String(G(o).value)]), K("change", r, (e) => v(G(o), e.currentTarget.value)), J(e, r);
			}, f = (e) => {
				var r = la();
				Q(r), H((e) => {
					$(r, "aria-label", G(o).label), di(r, e), r.disabled = t.view.readOnly || !n().editControl;
				}, [() => !!G(o).value]), K("change", r, (e) => v(G(o), e.currentTarget.checked)), J(e, r);
			}, p = (e) => {
				var r = ua();
				Q(r), H((e) => {
					$(r, "aria-label", G(o).label), $(r, "min", G(o).min), $(r, "max", G(o).max), ui(r, e), r.disabled = t.view.readOnly || !n().editControl;
				}, [() => Number(G(o).value)]), K("change", r, (e) => v(G(o), Number(e.currentTarget.value))), J(e, r);
			}, h = (e) => {
				var s = da();
				tt(s), H((e) => {
					$(s, "aria-label", G(o).label), $(s, "aria-invalid", !!(G(i)[G(o).key]?.error || G(a)[G(o).key])), $(s, "aria-describedby", G(i)[G(o).key]?.error || G(a)[G(o).key] ? r() + "-error-" + G(o).key : void 0), ui(s, e), s.disabled = t.view.readOnly || !n().editControl;
				}, [() => G(i)[G(o).key]?.text ?? m(G(o))]), K("input", s, (e) => g(G(o), e.currentTarget.value)), J(e, s);
			}, y = (e) => {
				var r = da();
				tt(r), H((e) => {
					$(r, "aria-label", G(o).label), ui(r, e), r.disabled = t.view.readOnly || !n().editControl;
				}, [() => m(G(o))]), K("change", r, (e) => v(G(o), e.currentTarget.value)), J(e, r);
			};
			X(u, (e) => {
				G(o).editor === "enum" ? e(d) : G(o).editor === "boolean" ? e(f, 1) : G(o).editor === "number" ? e(p, 2) : G(o).editor === "json" || G(o).editor === "lines" ? e(h, 3) : e(y, -1);
			}), F(c);
			var b = V(c, 2), x = (e) => {
				var r = fa(), a = B(r, !0);
				F(r), H(() => {
					$(r, "data-save-control", G(o).key), r.disabled = t.view.readOnly || !n().editControl || !!G(i)[G(o).key]?.pending, Y(a, G(i)[G(o).key]?.pending ? "Validating…" : "Save " + G(o).label);
				}), K("click", r, () => _(G(o))), J(e, r);
			};
			X(b, (e) => {
				(G(o).editor === "json" || G(o).editor === "lines") && e(x);
			});
			var S = V(b, 2), C = (e) => {
				var t = pa(), n = B(t, !0);
				F(t), H(() => Y(n, G(o).help)), J(e, t);
			};
			X(S, (e) => {
				G(o).help && e(C);
			});
			var w = V(S, 2), T = (e) => {
				var t = pa(), n = B(t, !0);
				F(t), H(() => Y(n, G(o).exposureNote)), J(e, t);
			};
			X(w, (e) => {
				G(o).exposureNote && e(T);
			});
			var E = V(w, 2), D = (e) => {
				var t = ma(), n = B(t), r = V(n), i = (e) => {
					var t = Or();
					H(() => Y(t, `· ${G(o).source ?? ""}`)), J(e, t);
				};
				X(r, (e) => {
					G(o).source && e(i);
				}), F(t), H(() => Y(n, `Effective: ${G(o).effective ?? ""}`)), J(e, t);
			};
			X(E, (e) => {
				G(o).effective !== void 0 && e(D);
			});
			var O = V(E, 2), k = (e) => {
				var t = oa(), n = B(t, !0);
				F(t), H(() => {
					$(t, "id", r() + "-error-" + G(o).key), Y(n, G(i)[G(o).key]?.error || G(a)[G(o).key]);
				}), J(e, t);
			};
			X(O, (e) => {
				(G(i)[G(o).key]?.error || G(a)[G(o).key]) && e(k);
			}), H(() => Y(l, `${G(o).label ?? ""} `)), J(e, s);
		}), F(ae);
		var ue = V(ae, 2), de = (e) => {
			var r = ya(), o = V(B(r), 2), s = V(B(o));
			Q(s), F(o);
			var c = V(o, 2), l = V(B(c));
			Z(l, 21, () => t.view.model.profile.allowedModes, (e) => e.value, (e, t) => {
				var n = sa(), r = B(n, !0);
				F(n);
				var i = {};
				H(() => {
					Y(r, G(t).label), i !== (i = G(t).value) && (n.value = (n.__value = G(t).value) ?? "");
				}), J(e, n);
			}), F(l);
			var u;
			ii(l), F(c);
			var d = V(c, 2), f = (e) => {
				var r = ga(), i = V(B(r)), a = B(i);
				a.value = a.__value = "", Z(V(a), 17, () => t.view.model.profile.options ?? [], (e) => e.value, (e, t) => {
					var n = sa(), r = B(n, !0);
					F(n);
					var i = {};
					H(() => {
						Y(r, G(t).label), i !== (i = G(t).value) && (n.value = (n.__value = G(t).value) ?? "");
					}), J(e, n);
				}), F(i);
				var o;
				ii(i), F(r), H((e) => {
					i.disabled = t.view.readOnly || !n().editBinding, o !== (o = e) && (i.value = (i.__value = e) ?? "", ri(i, e));
				}, [() => S("profileId")]), K("change", i, (e) => T("profileId", e.currentTarget.value)), J(e, r);
			}, p = /* @__PURE__ */ I(() => x("profileId") === "override");
			X(d, (e) => {
				G(p) && e(f);
			});
			var m = V(d, 2), g = V(B(m));
			Z(g, 21, () => t.view.model.model.allowedModes, (e) => e.value, (e, t) => {
				var n = sa(), r = B(n, !0);
				F(n);
				var i = {};
				H(() => {
					Y(r, G(t).label), i !== (i = G(t).value) && (n.value = (n.__value = G(t).value) ?? "");
				}), J(e, n);
			}), F(g);
			var _;
			ii(g), F(m);
			var v = V(m, 2), y = (e) => {
				var r = _a(), i = V(B(r));
				Q(i), F(r), H((e) => {
					ui(i, e), i.disabled = t.view.readOnly || !n().editBinding;
				}, [() => S("model")]), K("input", i, (e) => C("model", e.currentTarget.value)), K("change", i, (e) => T("model", e.currentTarget.value)), J(e, r);
			}, b = /* @__PURE__ */ I(() => x("model") === "override");
			X(v, (e) => {
				G(b) && e(y);
			});
			var E = V(v, 2), D = B(E);
			F(E);
			var O = V(E), k = B(O, !0);
			F(O);
			var ee = V(O, 2), te = (e) => {
				var n = va(), r = B(n, !0);
				F(n), H(() => Y(r, t.view.model.issue)), J(e, n);
			};
			X(ee, (e) => {
				t.view.model.issue && e(te);
			});
			var A = V(ee, 2), j = (e) => {
				var t = oa(), n = B(t, !0);
				F(t), H(() => Y(n, G(a).modelRole || G(i).profileId?.error || G(a).profileId || G(i).model?.error || G(a).model)), J(e, t);
			};
			X(A, (e) => {
				(G(a).modelRole || G(i).profileId?.error || G(a).profileId || G(i).model?.error || G(a).model) && e(j);
			}), F(r), H((e, r) => {
				ui(s, t.view.model.role), s.disabled = t.view.readOnly || !t.view.model.roleEditable || !n().editField, l.disabled = t.view.readOnly || !n().editBinding, u !== (u = e) && (l.value = (l.__value = e) ?? "", ri(l, e)), g.disabled = t.view.readOnly || !n().editBinding, _ !== (_ = r) && (g.value = (g.__value = r) ?? "", ri(g, r)), Y(D, `Effective connection: ${t.view.model.effective ?? ""}`), Y(k, t.view.model.source);
			}, [() => x("profileId"), () => x("model")]), K("change", s, (e) => {
				let r = e.currentTarget.value;
				t.view?.model?.roleEditable && n().editField && h("modelRole", !1, (e) => n().editField(e, "modelRole", r));
			}), K("change", l, (e) => w("profileId", e.currentTarget.value)), K("change", g, (e) => w("model", e.currentTarget.value)), J(e, r);
		};
		X(ue, (e) => {
			t.view.model && e(de);
		});
		var fe = V(ue, 2), pe = (e) => {
			var n = xa();
			Z(V(B(n)), 17, () => t.view.ports, (e) => e.direction + ":" + e.id, (e, t) => {
				var n = ba(), r = B(n), i = V(r), a = B(i, !0);
				F(i), F(n), H(() => {
					Y(r, `${G(t).direction === "input" ? "In" : "Out"} · ${G(t).label ?? ""}`), Y(a, G(t).kind);
				}), J(e, n);
			}), F(n), J(e, n);
		};
		X(fe, (e) => {
			t.view.ports.length && e(pe);
		});
		var me = V(fe, 2), he = (e) => {
			var n = Sa(), r = B(n, !0);
			F(n), H(() => Y(r, t.view.status)), J(e, n);
		};
		X(me, (e) => {
			t.view.status && e(he);
		});
		var ge = V(me, 2);
		Z(ge, 17, () => t.view.issues ?? [], Lr, (e, t) => {
			var n = va(), r = B(n, !0);
			F(n), H(() => Y(r, G(t))), J(e, n);
		});
		var _e = V(ge, 2), ve = B(_e), ye = V(ve);
		F(_e), H(() => {
			$(l, "d", t.view.iconPath), Y(p, t.view.title), Y(b, `Canonical type: ${t.view.canonicalTitle ?? ""}`), Y(D, `${t.view.family ?? ""} · ${t.view.phase ?? ""} phase`), ui(A, t.view.alias), A.disabled = !t.view.canPresent || !n().present, j.disabled = !t.view.canPresent || !n().present, di(ne, t.view.compact), ne.disabled = !t.view.canPresent || !n().present, di(se, t.view.enabled), se.disabled = t.view.readOnly || !n().editField, ve.disabled = t.view.readOnly || !n().duplicate, ye.disabled = t.view.readOnly || !n().remove;
		}), K("change", A, (e) => {
			let t = e.currentTarget.value;
			n().present && h("alias", !0, (e) => n().present(e, "alias", t));
		}), K("click", j, () => {
			n().present && h("alias", !0, (e) => n().present(e, "alias", ""));
		}), K("change", ne, (e) => {
			let t = e.currentTarget.checked;
			n().present && h("compact", !0, (e) => n().present(e, "compact", t));
		}), K("change", se, (e) => {
			let t = e.currentTarget.checked;
			n().editField && h("enabled", !1, (e) => n().editField(e, "enabled", t));
		}), K("click", ve, () => {
			t.view && !t.view.readOnly && n().duplicate?.(f(t.view));
		}), K("click", ye, () => {
			t.view && !t.view.readOnly && n().remove?.(f(t.view));
		}), J(e, o);
	}, k = (e) => {
		J(e, wa());
	};
	X(D, (e) => {
		t.view ? e(O) : e(k, -1);
	}), F(E), J(e, E), Be();
}
vr([
	"change",
	"click",
	"input"
]);
//#endregion
//#region ui/OutputPreview.svelte
var Da = /* @__PURE__ */ q("<option class=\"svelte-ee2ehy\"> </option>"), Oa = /* @__PURE__ */ q("<label class=\"pc-preview-choice svelte-ee2ehy\"><span class=\"pc-preview-sr-only svelte-ee2ehy\">Preview output</span><select aria-label=\"Preview output\" class=\"svelte-ee2ehy\"><option disabled=\"\" class=\"svelte-ee2ehy\">Choose an output</option><!></select></label>"), ka = /* @__PURE__ */ q("<button type=\"button\" class=\"svelte-ee2ehy\">Collapse preview</button>"), Aa = /* @__PURE__ */ q("<button type=\"button\" role=\"tab\" class=\"svelte-ee2ehy\"> </button>"), ja = /* @__PURE__ */ q("<div class=\"pc-preview-tabs svelte-ee2ehy\" role=\"tablist\" aria-label=\"Recorded artifacts\"></div>"), Ma = /* @__PURE__ */ q("<p class=\"pc-preview-note svelte-ee2ehy\"> </p>"), Na = /* @__PURE__ */ q("<pre class=\"svelte-ee2ehy\"> </pre>"), Pa = /* @__PURE__ */ q("<small class=\"pc-preview-note svelte-ee2ehy\"> </small>"), Fa = /* @__PURE__ */ q("<div role=\"tabpanel\" tabindex=\"0\" class=\"svelte-ee2ehy\"><article class=\"svelte-ee2ehy\"><div class=\"pc-preview-section-heading svelte-ee2ehy\"><span class=\"svelte-ee2ehy\"> </span><small class=\"svelte-ee2ehy\"> </small></div> <!> <!></article></div>"), Ia = /* @__PURE__ */ q("<p class=\"pc-preview-empty svelte-ee2ehy\"> </p>"), La = /* @__PURE__ */ q("<p class=\"pc-preview-error svelte-ee2ehy\"> </p>"), Ra = /* @__PURE__ */ q("<small class=\"pc-preview-note svelte-ee2ehy\">Apply rechecks the source and connection. Recorded preview text may be truncated.</small>"), za = /* @__PURE__ */ q("<button type=\"button\" data-run-here=\"\" title=\"Runs the selected output's dependencies. Results are diagnostic previews.\" class=\"svelte-ee2ehy\"> </button>"), Ba = /* @__PURE__ */ q("<button type=\"button\" data-preview-apply=\"\" class=\"svelte-ee2ehy\">Apply reviewed candidate</button><button type=\"button\" class=\"svelte-ee2ehy\">Reject candidate</button>", 1), Va = /* @__PURE__ */ q("<header class=\"svelte-ee2ehy\"><h3 class=\"svelte-ee2ehy\"> </h3> <!> <div class=\"pc-preview-tools svelte-ee2ehy\"><button type=\"button\" class=\"svelte-ee2ehy\">Follow selection</button><button type=\"button\" class=\"svelte-ee2ehy\"> </button><!></div></header> <!> <div class=\"pc-preview-sections svelte-ee2ehy\"><!> <!> <!> <!> <!> <!> <!></div> <footer class=\"svelte-ee2ehy\"><span class=\"pc-preview-status svelte-ee2ehy\"> </span> <span class=\"svelte-ee2ehy\"> </span> <!> <!></footer>", 1), Ha = /* @__PURE__ */ q("<p class=\"pc-preview-empty svelte-ee2ehy\">Select a node output to inspect its recorded result.</p>"), Ua = /* @__PURE__ */ q("<section class=\"pc-output-preview svelte-ee2ehy\" aria-label=\"Output preview\"><!></section>");
function Wa(e, t) {
	let n = Ar();
	ze(t, !0);
	let r = bi(t, "actions", 19, () => ({})), i = /* @__PURE__ */ I(() => JSON.stringify([t.view?.sourceKey, t.view?.selectedKey])), a = /* @__PURE__ */ R(Xt({
		scope: "",
		id: null
	})), o = /* @__PURE__ */ I(() => (G(a).scope === G(i) ? t.view?.sections.find((e) => e.id === G(a).id) : null) ?? t.view?.sections[0] ?? null);
	vn(() => {
		let e = G(a).scope === G(i) && t.view?.sections.some((e) => e.id === G(a).id) ? G(a).id : t.view?.sections[0]?.id ?? null;
		(G(a).scope !== G(i) || G(a).id !== e) && z(a, {
			scope: G(i),
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
			scope: G(i),
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
	}, p = /* @__PURE__ */ I(() => !!(t.view && G(l) && t.view.status !== "removed" && !t.view.busy && t.view.runHere?.enabled && r().runHere)), m = /* @__PURE__ */ I(() => !!(t.view && G(l) && t.view.review?.mode === "root" && t.view.review.selectedRootTerminal && "kind" in G(l).target && G(l).target.address.instancePath.length === 0 && d(G(l).target) === d(t.view.review.selector.terminal))), h = /* @__PURE__ */ I(() => !!(t.view && t.view.status === "current" && !t.view.busy && G(m) && t.view.review?.fresh && t.view.review.canApply && r().apply)), g = /* @__PURE__ */ I(() => !!(t.view && !t.view.busy && G(m) && r().reject));
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
	var y = Ua(), b = B(y), x = (e) => {
		var d = Va(), m = cn(d), y = B(m), b = B(y, !0);
		F(y);
		var x = V(y, 2), S = (e) => {
			var n = Oa(), i = V(B(n)), a = B(i);
			a.value = a.__value = "", Z(V(a), 17, () => t.view.choices, (e) => e.key, (e, t) => {
				var n = Da(), r = B(n);
				F(n);
				var i = {};
				H(() => {
					Y(r, `${G(t).label ?? ""} · ${G(t).kind ?? ""}`), i !== (i = G(t).key) && (n.value = (n.__value = G(t).key) ?? "");
				}), J(e, n);
			}), F(i);
			var o;
			ii(i), F(n), H(() => {
				i.disabled = !r().select, o !== (o = t.view.selectedKey ?? "") && (i.value = (i.__value = t.view.selectedKey ?? "") ?? "", ri(i, t.view.selectedKey ?? ""));
			}), K("change", i, (e) => _(e.currentTarget.value)), J(e, n);
		};
		X(x, (e) => {
			t.view.choices.length && e(S);
		});
		var C = V(x, 2), w = B(C), T = V(w), E = B(T, !0);
		F(T);
		var D = V(T), O = (e) => {
			var n = ka();
			K("click", n, function(...e) {
				t.collapse?.apply(this, e);
			}), J(e, n);
		};
		X(D, (e) => {
			t.collapse && e(O);
		}), F(C), F(m);
		var k = V(m, 2), ee = (e) => {
			var r = ja();
			Z(r, 23, () => t.view.sections, (e) => e.id, (e, t, r) => {
				var l = Aa(), u = B(l, !0);
				F(l), H((e) => {
					$(l, "id", e), $(l, "aria-selected", G(o)?.id === G(t).id), $(l, "aria-controls", n + "-panel"), $(l, "tabindex", G(o)?.id === G(t).id ? 0 : -1), Y(u, G(t).label);
				}, [() => s(G(t).id)]), K("click", l, () => {
					z(a, {
						scope: G(i),
						id: G(t).id
					}, !0);
				}), _r("keydown", l, (e) => c(e, G(r)), !0), J(e, l);
			}), F(r), J(e, r);
		};
		X(k, (e) => {
			t.view.sections.length && e(ee);
		});
		var te = V(k, 2), A = B(te), j = (e) => {
			let t = /* @__PURE__ */ I(() => G(o));
			var r = Fa(), i = B(r), a = B(i), c = B(a), l = B(c, !0);
			F(c);
			var u = V(c), d = B(u, !0);
			F(u), F(a);
			var f = V(a, 2), p = (e) => {
				var n = Ma(), r = B(n, !0);
				F(n), H(() => Y(r, G(t).text)), J(e, n);
			}, m = (e) => {
				var n = Na(), r = B(n, !0);
				F(n), H(() => Y(r, G(t).text)), J(e, n);
			};
			X(f, (e) => {
				G(t).format === "omitted" ? e(p) : e(m, -1);
			});
			var h = V(f, 2), g = (e) => {
				var n = Pa(), r = B(n);
				F(n), H(() => Y(r, `Truncated diagnostic${G(t).format === "json-prefix-text" ? " · JSON prefix shown as text" : ""}`)), J(e, n);
			};
			X(h, (e) => {
				G(t).truncated && e(g);
			}), F(i), F(r), H((e) => {
				$(r, "id", n + "-panel"), $(r, "aria-labelledby", e), $(i, "data-artifact-kind", G(t).kind), Y(l, G(t).label), Y(d, G(t).kind);
			}, [() => s(G(t).id)]), _r("keydown", r, (e) => e.stopPropagation(), !0), _r("paste", r, (e) => e.stopPropagation(), !0), J(e, r);
		}, M = (e) => {
			var n = Ia(), r = B(n, !0);
			F(n), H(() => Y(r, t.view.status === "not-run" ? "Run this workflow or use Run to here to inspect an output." : "No recorded artifact is available for this output.")), J(e, n);
		};
		X(A, (e) => {
			G(o) ? e(j) : e(M, -1);
		});
		var ne = V(A, 2), re = (e) => {
			var n = Ma(), r = B(n, !0);
			F(n), H(() => Y(r, t.view.statusDetail)), J(e, n);
		};
		X(ne, (e) => {
			t.view.statusDetail && e(re);
		});
		var ie = V(ne, 2);
		Z(ie, 17, () => t.view.sections.filter((e) => e.id !== G(o)?.id && (e.format === "omitted" || e.truncated)), (e) => e.id, (e, t) => {
			var n = Ma(), r = B(n);
			F(n), H(() => Y(r, `${G(t).label ?? ""}: ${(G(t).format === "omitted" ? G(t).text : "Truncated diagnostic" + (G(t).format === "json-prefix-text" ? " · JSON prefix shown as text" : "")) ?? ""}`)), J(e, n);
		});
		var ae = V(ie, 2), oe = (e) => {
			var n = Ma(), r = B(n, !0);
			F(n), H(() => Y(r, t.view.runHere.issue)), J(e, n);
		};
		X(ae, (e) => {
			t.view.runHere?.issue && e(oe);
		});
		var se = V(ae, 2);
		Z(se, 17, () => t.view.issues, Lr, (e, t) => {
			var n = La(), r = B(n, !0);
			F(n), H(() => Y(r, G(t))), J(e, n);
		});
		var ce = V(se, 2), le = (e) => {
			var n = La(), r = B(n, !0);
			F(n), H(() => Y(r, t.view.review.issue)), J(e, n);
		};
		X(ce, (e) => {
			t.view.review?.issue && e(le);
		});
		var ue = V(ce, 2), de = (e) => {
			J(e, Ra());
		};
		X(ue, (e) => {
			t.view.review && e(de);
		}), F(te);
		var fe = V(te, 2), pe = B(fe), me = B(pe, !0);
		F(pe);
		var he = V(pe, 2), ge = B(he, !0);
		F(he);
		var _e = V(he, 2), ve = (e) => {
			var n = za(), i = B(n);
			F(n), H(() => {
				n.disabled = !G(p), Y(i, `Run to here · maximum ${t.view.runHere.callBound ?? ""} ${t.view.runHere.callBound === 1 ? "request" : "requests"}`);
			}), K("click", n, () => {
				t.view && G(l) && G(p) && r().runHere?.(t.view.sourceKey, f(G(l).target));
			}), J(e, n);
		};
		X(_e, (e) => {
			t.view.runHere && e(ve);
		});
		var ye = V(_e, 2), be = (e) => {
			var n = Ba(), i = cn(n), a = V(i);
			H(() => {
				i.disabled = !G(h), a.disabled = !G(g);
			}), K("click", i, () => {
				t.view?.review && G(h) && r().apply?.(v(t.view.review.selector));
			}), K("click", a, () => {
				t.view?.review && G(g) && r().reject?.(v(t.view.review.selector));
			}), J(e, n);
		};
		X(ye, (e) => {
			t.view.review && e(be);
		}), F(fe), H((e) => {
			Y(b, G(l)?.label ?? t.view.title), $(w, "aria-pressed", t.view.followSelection), w.disabled = !r().follow, $(T, "aria-pressed", t.view.pinned), T.disabled = t.view.pinned ? !r().follow : !G(l) || !r().pin, Y(E, t.view.pinned ? "Unpin preview" : "Pin preview"), $(pe, "data-status", t.view.status), Y(me, e), Y(ge, t.view.pinned ? "Pinned preview" : t.view.followSelection ? "Following selection" : "Selection not followed");
		}, [() => u(t.view.status)]), K("click", w, () => r().follow?.()), K("click", T, () => {
			t.view?.pinned ? r().follow?.() : t.view && G(l) && r().pin?.(t.view.sourceKey, f(G(l).target));
		}), J(e, d);
	}, S = (e) => {
		J(e, Ha());
	};
	X(b, (e) => {
		t.view ? e(x) : e(S, -1);
	}), F(y), J(e, y), Be();
}
vr(["change", "click"]);
//#endregion
//#region ui/RunDetails.svelte
var Ga = /* @__PURE__ */ q("<p class=\"pc-run-error svelte-f9s2fm\"> </p>"), Ka = /* @__PURE__ */ q("<p class=\"pc-run-empty svelte-f9s2fm\">No execution plan has been recorded.</p>"), qa = /* @__PURE__ */ q("<span aria-hidden=\"true\" class=\"svelte-f9s2fm\">▱</span>"), Ja = /* @__PURE__ */ q("<small class=\"svelte-f9s2fm\"> </small>"), Ya = /* @__PURE__ */ q("<details class=\"svelte-f9s2fm\"><summary class=\"svelte-f9s2fm\">Reported usage</summary><div class=\"pc-run-usage svelte-f9s2fm\"><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small></div></details>"), Xa = /* @__PURE__ */ q("<li class=\"svelte-f9s2fm\"><div class=\"pc-run-row-heading svelte-f9s2fm\"><button type=\"button\" class=\"svelte-f9s2fm\"><!> </button><span class=\"pc-run-status svelte-f9s2fm\"> </span></div> <!> <div class=\"pc-run-row-meta svelte-f9s2fm\"><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small></div> <!> <!></li>"), Za = /* @__PURE__ */ q("<header class=\"svelte-f9s2fm\"><h3 class=\"svelte-f9s2fm\">Run details</h3><span class=\"pc-run-status svelte-f9s2fm\"> </span></header> <div class=\"pc-run-summary svelte-f9s2fm\"><p class=\"svelte-f9s2fm\"> </p><p class=\"svelte-f9s2fm\"> </p><p class=\"svelte-f9s2fm\"> </p></div> <!> <!> <ol class=\"pc-run-rows svelte-f9s2fm\"></ol>", 1), Qa = /* @__PURE__ */ q("<p class=\"pc-run-empty svelte-f9s2fm\">Run a workflow to inspect its processing stages.</p>"), $a = /* @__PURE__ */ q("<section class=\"pc-run-details svelte-f9s2fm\" aria-label=\"Run details\"><!></section>");
function eo(e, t) {
	ze(t, !0);
	let n = bi(t, "actions", 19, () => ({})), r = (e) => e === "not-run" ? "Not run" : e === "empty" ? "Ready" : e.charAt(0).toUpperCase() + e.slice(1), i = (e) => e !== null && Number.isFinite(e) && e >= 0 ? (e / 1e3).toFixed(2) + "s" : "Unknown", a = (e) => e != null && Number.isFinite(e) && e >= 0 ? String(e) : "Unknown";
	var o = $a(), s = B(o), c = (e) => {
		var o = Za(), s = cn(o), c = V(B(s)), l = B(c, !0);
		F(c), F(s);
		var u = V(s, 2), d = B(u), f = B(d);
		F(d);
		var p = V(d), m = B(p);
		F(p);
		var h = V(p), g = B(h);
		F(h), F(u);
		var _ = V(u, 2), v = (e) => {
			var n = Ga(), r = B(n, !0);
			F(n), H(() => Y(r, t.view.issue)), J(e, n);
		};
		X(_, (e) => {
			t.view.issue && e(v);
		});
		var y = V(_, 2), b = (e) => {
			J(e, Ka());
		};
		X(y, (e) => {
			t.view.rows.length || e(b);
		});
		var x = V(y, 2);
		Z(x, 21, () => t.view.rows, (e) => e.key, (e, o) => {
			var s = Xa();
			let c;
			var l = B(s), u = B(l), d = B(u), f = (e) => {
				J(e, qa());
			};
			X(d, (e) => {
				G(o).kind === "instance" && e(f);
			});
			var p = V(d, 1, !0);
			F(u);
			var m = V(u), h = B(m, !0);
			F(m), F(l);
			var g = V(l, 2), _ = (e) => {
				var t = Ja(), n = B(t, !0);
				F(t), H((e) => Y(n, e), [() => r(G(o).subphase)]), J(e, t);
			};
			X(g, (e) => {
				G(o).subphase && e(_);
			});
			var v = V(g, 2), y = B(v), b = B(y);
			F(y);
			var x = V(y), S = B(x);
			F(x), F(v);
			var C = V(v, 2), w = (e) => {
				var t = Ga(), n = B(t, !0);
				F(t), H(() => Y(n, G(o).issue)), J(e, t);
			};
			X(C, (e) => {
				G(o).issue && e(w);
			});
			var T = V(C, 2), E = (e) => {
				var t = Ya(), n = V(B(t)), r = B(n), i = B(r);
				F(r);
				var s = V(r), c = B(s);
				F(s);
				var l = V(s), u = B(l);
				F(l);
				var d = V(l), f = B(d);
				F(d), F(n), F(t), H((e, t, n) => {
					Y(i, `Input tokens: ${e ?? ""}`), Y(c, `Output tokens: ${t ?? ""}`), Y(u, `Total tokens: ${n ?? ""}`), Y(f, `Cost: ${G(o).usage?.cost ?? "Unknown" ?? ""}`);
				}, [
					() => a(G(o).usage?.inputTokens),
					() => a(G(o).usage?.outputTokens),
					() => a(G(o).usage?.totalTokens)
				]), J(e, t);
			};
			X(T, (e) => {
				G(o).kind === "primitive" && e(E);
			}), F(s), H((e, t, r) => {
				$(s, "data-run-row", G(o).key), $(s, "data-depth", G(o).depth), $(s, "data-status", G(o).status), c = ni(s, "", c, e), $(u, "aria-label", "Open " + G(o).title + " in graph"), u.disabled = !n().jump, Y(p, G(o).title), $(m, "data-status", G(o).status), Y(h, t), Y(b, `Duration: ${r ?? ""}`), Y(S, `${G(o).attempts ?? ""} of ${G(o).callBound ?? ""} requests`);
			}, [
				() => ({ "margin-left": `${Math.max(0, Math.min(8, G(o).depth)) * 12}px` }),
				() => r(G(o).status),
				() => i(G(o).durationMs)
			]), K("click", u, () => {
				t.view && n().jump?.(t.view.runId, {
					...G(o).address,
					instancePath: [...G(o).address.instancePath]
				});
			}), J(e, s);
		}), F(x), H((e, n) => {
			$(c, "data-status", t.view.status), Y(l, e), Y(f, `${t.view.completedCount ?? ""} of ${t.view.executableCount ?? ""} stages complete`), Y(m, `${t.view.actualCalls ?? ""} of ${t.view.callBound ?? ""} requests`), Y(g, `Elapsed: ${n ?? ""}`);
		}, [() => r(t.view.status), () => i(t.view.elapsedMs)]), J(e, o);
	}, l = (e) => {
		J(e, Qa());
	};
	X(s, (e) => {
		t.view ? e(c) : e(l, -1);
	}), F(o), J(e, o), Be();
}
vr(["click"]);
//#endregion
//#region ui/RunMeter.svelte
var to = /* @__PURE__ */ q("<span class=\"pc-run-meter-elapsed svelte-1tkcp3\" data-run-elapsed=\"\"> </span>"), no = /* @__PURE__ */ q("<span class=\"pc-run-pixel svelte-1tkcp3\" data-run-pixel=\"\"></span>"), ro = /* @__PURE__ */ q("<button class=\"pc-run-meter svelte-1tkcp3\"><span class=\"pc-run-meter-label svelte-1tkcp3\"> </span> <!> <span class=\"pc-run-meter-pixels svelte-1tkcp3\" aria-hidden=\"true\"></span></button>");
function io(e, t) {
	ze(t, !0);
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
	var o = kr(), s = cn(o), c = (e) => {
		var r = ro(), o = B(r), s = B(o, !0);
		F(o);
		var c = V(o, 2), l = (e) => {
			var n = to(), r = B(n);
			F(n), H((e) => Y(r, `${e ?? ""}s`), [() => (t.view.elapsedMs / 1e3).toFixed(1)]), J(e, n);
		}, u = /* @__PURE__ */ I(() => t.view.elapsedMs !== null && Number.isFinite(t.view.elapsedMs) && t.view.elapsedMs >= 0);
		X(c, (e) => {
			G(u) && e(l);
		});
		var d = V(c, 2);
		Z(d, 21, () => G(i), (e) => e.key, (e, t) => {
			var n = no();
			H(() => {
				$(n, "data-status", G(t).status), $(n, "title", G(t).title);
			}), J(e, n);
		}), F(d), F(r), H((e) => {
			$(r, "aria-label", G(a)), $(r, "title", G(a)), r.disabled = !t.open, Y(s, e);
		}, [() => n(t.view.status)]), K("click", r, () => t.open?.()), J(e, r);
	};
	X(s, (e) => {
		t.view && e(c);
	}), J(e, o), Be();
}
vr(["click"]);
//#endregion
//#region ui/PortalManager.svelte
var ao = /* @__PURE__ */ q("<button type=\"button\" class=\"svelte-mnv790\">Close</button>"), oo = /* @__PURE__ */ q("<option class=\"svelte-mnv790\"> </option>"), so = /* @__PURE__ */ q("<label class=\"svelte-mnv790\">Portal name<input aria-label=\"Portal name\" class=\"svelte-mnv790\"/></label> <p class=\"pc-note svelte-mnv790\"> </p> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-rename=\"\" class=\"svelte-mnv790\">Rename</button></div>", 1), co = /* @__PURE__ */ q("<p class=\"pc-note svelte-mnv790\">Select a portal or create one from an output.</p>"), lo = /* @__PURE__ */ q("<button type=\"button\" data-portal-jump-source=\"\" class=\"svelte-mnv790\">Jump to source</button>"), uo = /* @__PURE__ */ q("<label class=\"pc-check svelte-mnv790\"><input type=\"checkbox\" aria-label=\"Replace existing connection\" class=\"svelte-mnv790\"/>Replace existing connection</label>"), fo = /* @__PURE__ */ q("<button type=\"button\" data-portal-jump-consumer=\"\" class=\"svelte-mnv790\">Jump</button>"), po = /* @__PURE__ */ q("<div class=\"pc-consumer svelte-mnv790\"><span class=\"svelte-mnv790\"> </span><div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-restore=\"\" class=\"svelte-mnv790\">Restore wire</button> <!></div></div>"), mo = /* @__PURE__ */ q("<p class=\"pc-note svelte-mnv790\">No consumers.</p>"), ho = /* @__PURE__ */ q("<label class=\"svelte-mnv790\">Existing consumers<select aria-label=\"Existing consumers\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Choose before deleting…</option><option class=\"svelte-mnv790\">Restore visible wires</option><option class=\"svelte-mnv790\">Disconnect consumers</option></select></label>"), go = /* @__PURE__ */ q("<details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Consumers</summary> <label class=\"svelte-mnv790\">Compatible receiver<select aria-label=\"Compatible receiver\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select input…</option><!></select></label> <!> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-connect=\"\" class=\"svelte-mnv790\">Connect receiver</button></div> <!> <!> <!> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-delete=\"\" class=\"svelte-mnv790\">Delete portal</button></div></details>"), _o = /* @__PURE__ */ q("<details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Convert to portal</summary><p class=\"pc-note svelte-mnv790\"> </p><div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-convert=\"\" class=\"svelte-mnv790\"> </button></div></details>"), vo = /* @__PURE__ */ q("<p class=\"pc-error svelte-mnv790\"> </p>"), yo = /* @__PURE__ */ q("<p class=\"pc-error svelte-mnv790\" role=\"alert\"> </p>"), bo = /* @__PURE__ */ q("<p class=\"pc-note svelte-mnv790\" role=\"status\">Preparing change…</p>"), xo = /* @__PURE__ */ q("<p class=\"pc-note svelte-mnv790\"> </p> <label class=\"svelte-mnv790\">Portal<select aria-label=\"Selected portal\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select portal…</option><!></select></label> <!> <details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Source</summary> <label class=\"svelte-mnv790\">Output<select aria-label=\"Portal source\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select output…</option><!></select></label> <label class=\"svelte-mnv790\">New portal name<input aria-label=\"New portal name\" class=\"svelte-mnv790\"/></label> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-create=\"\" class=\"svelte-mnv790\">Create portal</button> <button type=\"button\" data-portal-retarget=\"\" class=\"svelte-mnv790\">Retarget</button> <!></div></details> <!> <!> <!> <!> <!>", 1), So = /* @__PURE__ */ q("<p class=\"pc-note svelte-mnv790\">Open a graph to manage its portals.</p>"), Co = /* @__PURE__ */ q("<section class=\"pc-manager svelte-mnv790\" aria-label=\"Manage portals\"><header class=\"svelte-mnv790\"><h2 class=\"svelte-mnv790\">Manage portals</h2><!></header> <!></section>");
function wo(e, t) {
	ze(t, !0);
	let n = bi(t, "actions", 19, () => ({})), r = /* @__PURE__ */ R(""), i = /* @__PURE__ */ R(""), a = /* @__PURE__ */ R(""), o = /* @__PURE__ */ R(""), s = /* @__PURE__ */ R(""), c = /* @__PURE__ */ R(!1), l = /* @__PURE__ */ R(""), u = /* @__PURE__ */ R(""), d = "", f = 0, p = !0, m = (e) => JSON.stringify(e.kind === "graph" ? [
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
	]), h = /* @__PURE__ */ I(() => t.view?.publishers.find((e) => e.id === t.view.selectedPortalId)), g = /* @__PURE__ */ I(() => !!t.view && !!G(h) && t.view.capabilities.rename && (t.view.renameMode === "presentation" ? t.view.canPresent : t.view.scope.kind === "graph" && !t.view.readOnly) && !!n().rename), _ = /* @__PURE__ */ I(() => t.view?.sources.find((e) => e.key === G(a) && e.direction === "output")), v = /* @__PURE__ */ I(() => t.view?.receivers.find((e) => e.key === G(o) && e.direction === "input" && e.kind === G(h)?.kind)), y = /* @__PURE__ */ I(() => !!G(h) && !!G(v) && (!G(v).occupied || G(c)) && C("connect") && !!n().connect), b = /* @__PURE__ */ I(() => !!G(h) && C("remove") && !!n().deletePublisher && (!t.view?.consumers.length || G(s) === "restore" || G(s) === "disconnect"));
	vn(() => {
		let e = t.view ? JSON.stringify([
			t.view.managerKey,
			t.view.revision,
			m(t.view.scope),
			t.view.selectedPortalId,
			t.view.renameMode
		]) : "";
		d !== e && (d = e, z(r, G(h)?.label ?? "", !0), z(i, ""), z(a, t.view?.sources.find((e) => e.nodeId === G(h)?.source.nodeId && e.portId === G(h)?.source.portId)?.key ?? "", !0), z(o, ""), z(s, ""), z(c, !1), z(l, ""), z(u, ""), f++);
	}), Si(() => {
		p = !1, f++;
	});
	let x = (e) => ({
		managerKey: e.managerKey,
		revision: e.revision,
		scope: Fe(e.scope)
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
		if (!t.view || !n || G(u)) return;
		let i = x(t.view), a = ++f, o = t.view.selectedPortalId;
		z(u, e, !0), z(l, "");
		try {
			let e = await r(i);
			p && a === f && t.view?.managerKey === i.managerKey && t.view.revision === i.revision && m(t.view.scope) === m(i.scope) && t.view.selectedPortalId === o && (z(u, ""), z(l, e.ok ? "" : e.error.code + ": " + e.error.message, !0));
		} catch (e) {
			p && a === f && t.view?.managerKey === i.managerKey && t.view.revision === i.revision && m(t.view.scope) === m(i.scope) && t.view.selectedPortalId === o && (z(u, ""), z(l, e instanceof Error ? e.message : "The portal change could not be accepted.", !0));
		}
	}
	var E = Co(), D = B(E), O = V(B(D)), k = (e) => {
		var t = ao();
		K("click", t, () => n().close?.()), J(e, t);
	};
	X(O, (e) => {
		n().close && e(k);
	}), F(D);
	var ee = V(D, 2), te = (e) => {
		var d = xo(), f = cn(d), p = B(f);
		F(f);
		var m = V(f, 2), E = V(B(m)), D = B(E);
		D.value = D.__value = "", Z(V(D), 17, () => t.view.publishers, (e) => e.id, (e, t) => {
			var n = oo(), r = B(n);
			F(n);
			var i = {};
			H(() => {
				Y(r, `${G(t).label ?? ""} · ${G(t).kind ?? ""}`), i !== (i = G(t).id) && (n.value = (n.__value = G(t).id) ?? "");
			}), J(e, n);
		}), F(E);
		var O;
		ii(E), F(m);
		var k = V(m, 2), ee = (e) => {
			var i = so(), a = cn(i), o = V(B(a));
			Q(o), F(a);
			var s = V(a, 2), c = B(s);
			F(s);
			var l = V(s, 2), d = B(l);
			F(l), H(() => {
				ui(o, G(r)), o.disabled = !G(g), Y(c, `${t.view.renameMode === "presentation" ? "Local workspace label · not exported" : "Authored portal label"} · ${G(h).kind ?? ""}`), d.disabled = !G(g) || !!G(u);
			}), K("input", o, (e) => {
				z(r, e.currentTarget.value, !0), w();
			}), K("click", d, () => {
				let e = G(h)?.id, i = t.view?.renameMode, a = G(r);
				e && i && n().rename && T("rename", G(g), (t) => n().rename(t, e, a, i));
			}), J(e, i);
		}, te = (e) => {
			J(e, co());
		};
		X(k, (e) => {
			G(h) ? e(ee) : e(te, -1);
		});
		var A = V(k, 2), j = V(B(A), 2), M = V(B(j)), ne = B(M);
		ne.value = ne.__value = "", Z(V(ne), 17, () => t.view.sources, (e) => e.key, (e, t) => {
			var n = oo(), r = B(n);
			F(n);
			var i = {};
			H(() => {
				Y(r, `${G(t).label ?? ""} · ${G(t).kind ?? ""}`), i !== (i = G(t).key) && (n.value = (n.__value = G(t).key) ?? "");
			}), J(e, n);
		}), F(M);
		var re;
		ii(M), F(j);
		var ie = V(j, 2), ae = V(B(ie));
		Q(ae), F(ie);
		var oe = V(ie, 2), se = B(oe), ce = V(se, 2), le = V(ce, 2), ue = (e) => {
			var r = lo();
			K("click", r, () => {
				t.view && G(h) && n().jumpSource?.(x(t.view), S(G(h).source));
			}), J(e, r);
		};
		X(le, (e) => {
			G(h) && n().jumpSource && e(ue);
		}), F(oe), F(A);
		var de = V(A, 2), fe = (e) => {
			var r = go(), i = V(B(r), 2), a = V(B(i)), l = B(a);
			l.value = l.__value = "", Z(V(l), 17, () => t.view.receivers, (e) => e.key, (e, t) => {
				var n = oo(), r = B(n);
				F(n);
				var i = {};
				H(() => {
					Y(r, `${G(t).label ?? ""}${G(t).occupied ? " · Connected" : ""}`), i !== (i = G(t).key) && (n.value = (n.__value = G(t).key) ?? "");
				}), J(e, n);
			}), F(a);
			var d;
			ii(a), F(i);
			var f = V(i, 2), p = (e) => {
				var t = uo(), n = B(t);
				Q(n), Oe(), F(t), H((e) => {
					di(n, G(c)), n.disabled = e;
				}, [() => !C("connect")]), K("change", n, (e) => {
					z(c, e.currentTarget.checked, !0), w();
				}), J(e, t);
			};
			X(f, (e) => {
				G(v)?.occupied && e(p);
			});
			var m = V(f, 2), g = B(m);
			F(m);
			var _ = V(m, 2);
			Z(_, 17, () => t.view.consumers, (e) => e.edgeId, (e, r) => {
				var i = po(), a = B(i), o = B(a, !0);
				F(a);
				var s = V(a), c = B(s), l = V(c, 2), d = (e) => {
					var i = fo();
					K("click", i, () => {
						let e = t.view?.consumers.find((e) => e.edgeId === G(r).edgeId);
						t.view && e && n().jumpConsumer?.(x(t.view), e.edgeId, S(e.to));
					}), J(e, i);
				};
				X(l, (e) => {
					n().jumpConsumer && e(d);
				}), F(s), F(i), H((e) => {
					Y(o, G(r).label), c.disabled = e;
				}, [() => !C("restore") || !n().restoreWire || !!G(u)]), K("click", c, () => {
					let e = t.view?.consumers.find((e) => e.edgeId === G(r).edgeId);
					e && n().restoreWire && T("restore", C("restore"), (t) => n().restoreWire(t, e.edgeId));
				}), J(e, i);
			});
			var E = V(_, 2), D = (e) => {
				J(e, mo());
			};
			X(E, (e) => {
				t.view.consumers.length || e(D);
			});
			var O = V(E, 2), k = (e) => {
				var t = ho(), n = V(B(t)), r = B(n);
				r.value = r.__value = "";
				var i = V(r);
				i.value = i.__value = "restore";
				var a = V(i);
				a.value = a.__value = "disconnect", F(n);
				var o;
				ii(n), F(t), H((e) => {
					n.disabled = e, o !== (o = G(s)) && (n.value = (n.__value = G(s)) ?? "", ri(n, G(s)));
				}, [() => !C("remove")]), K("change", n, (e) => {
					z(s, e.currentTarget.value, !0), w();
				}), J(e, t);
			};
			X(O, (e) => {
				t.view.consumers.length && e(k);
			});
			var ee = V(O, 2), te = B(ee);
			F(ee), F(r), H((e) => {
				a.disabled = e, d !== (d = G(o)) && (a.value = (a.__value = G(o)) ?? "", ri(a, G(o))), g.disabled = !G(y) || !!G(u), te.disabled = !G(b) || !!G(u);
			}, [() => !C("connect") || !n().connect]), K("change", a, (e) => {
				z(o, e.currentTarget.value, !0), z(c, !1), w();
			}), K("click", g, () => {
				let e = G(v), t = G(h)?.id, r = G(c);
				e && t && n().connect && T("connect", G(y), (i) => n().connect(i, t, S(e), r));
			}), K("click", te, () => {
				let e = G(h)?.id, r = t.view?.consumers.length ? G(s) : "restore";
				e && (r === "restore" || r === "disconnect") && n().deletePublisher && T("remove", G(b), (t) => n().deletePublisher(t, e, r));
			}), J(e, r);
		};
		X(de, (e) => {
			G(h) && e(fe);
		});
		var pe = V(de, 2), me = (e) => {
			var r = _o(), i = V(B(r)), a = B(i, !0);
			F(i);
			var o = V(i), s = B(o), c = B(s);
			F(s), F(o), F(r), H((e) => {
				Y(a, t.view.conversion.label), s.disabled = e, Y(c, `Convert ${t.view.conversion.kind === "wire" ? "wire" : "output"}`);
			}, [() => !C("convert") || !!G(u) || (t.view.conversion.kind === "wire" ? !n().convertWire : !n().convertOutput)]), K("click", s, () => {
				let e = t.view?.conversion;
				e?.kind === "wire" && n().convertWire ? T("convert", C("convert"), (t) => n().convertWire(t, e.edgeId)) : e?.kind === "output" && n().convertOutput && T("convert", C("convert"), (t) => n().convertOutput(t, S(e.endpoint)));
			}), J(e, r);
		};
		X(pe, (e) => {
			t.view.conversion && e(me);
		});
		var he = V(pe, 2), ge = (e) => {
			var n = vo(), r = B(n, !0);
			F(n), H(() => Y(r, t.view.issue)), J(e, n);
		};
		X(he, (e) => {
			t.view.issue && e(ge);
		});
		var _e = V(he, 2), ve = (e) => {
			var t = yo(), n = B(t, !0);
			F(t), H(() => Y(n, G(l))), J(e, t);
		};
		X(_e, (e) => {
			G(l) && e(ve);
		});
		var ye = V(_e, 2), be = (e) => {
			J(e, bo());
		};
		X(ye, (e) => {
			G(u) && e(be);
		}), H((e, r, o, s) => {
			Y(p, `${t.view.scopeLabel ?? ""}${t.view.readOnly ? " · Read-only graph" : ""}`), E.disabled = !n().selectPortal, O !== (O = t.view.selectedPortalId ?? "") && (E.value = (E.__value = t.view.selectedPortalId ?? "") ?? "", ri(E, t.view.selectedPortalId ?? "")), M.disabled = e, re !== (re = G(a)) && (M.value = (M.__value = G(a)) ?? "", ri(M, G(a))), ui(ae, G(i)), ae.disabled = r, se.disabled = o, ce.disabled = s;
		}, [
			() => !C("create") && !C("retarget"),
			() => !C("create") || !n().create,
			() => !C("create") || !n().create || !G(_) || !G(i).trim() || !!G(u),
			() => !C("retarget") || !n().retarget || !G(_) || !G(h) || !!G(u)
		]), K("change", E, (e) => {
			let r = e.currentTarget.value;
			e.currentTarget.selectedIndex >= 0 && t.view && n().selectPortal && (!r || t.view.publishers.some((e) => e.id === r)) && n().selectPortal(x(t.view), r || null);
		}), K("change", M, (e) => {
			z(a, e.currentTarget.value, !0), w();
		}), K("input", ae, (e) => {
			z(i, e.currentTarget.value, !0), w();
		}), K("click", se, () => {
			let e = G(_), t = G(i);
			e && t.trim() && n().create && T("create", C("create"), (r) => n().create(r, t, S(e)));
		}), K("click", ce, () => {
			let e = G(_), t = G(h)?.id;
			e && t && n().retarget && T("retarget", C("retarget"), (r) => n().retarget(r, t, S(e)));
		}), J(e, d);
	}, A = (e) => {
		J(e, So());
	};
	X(ee, (e) => {
		t.view ? e(te) : e(A, -1);
	}), F(E), J(e, E), Be();
}
vr([
	"click",
	"change",
	"input"
]);
//#endregion
//#region ui/SubgraphManager.svelte
var To = /* @__PURE__ */ q("<button type=\"button\" class=\"svelte-xi74w\">Close</button>"), Eo = /* @__PURE__ */ q("<option class=\"svelte-xi74w\"> </option>"), Do = /* @__PURE__ */ q("<p class=\"pc-note svelte-xi74w\"> </p> <label class=\"svelte-xi74w\">Definition name<input aria-label=\"Definition name\" class=\"svelte-xi74w\"/></label> <div class=\"pc-actions svelte-xi74w\"><button type=\"button\" data-subgraph-open-library=\"\" class=\"svelte-xi74w\">Open definition</button> <button type=\"button\" data-subgraph-rename=\"\" class=\"svelte-xi74w\">Save name as revision</button> <button type=\"button\" data-subgraph-duplicate=\"\" class=\"svelte-xi74w\">Duplicate</button> <button type=\"button\" data-subgraph-export=\"\" class=\"svelte-xi74w\">Export .json</button> <button type=\"button\" data-subgraph-remove=\"\" class=\"svelte-xi74w\">Remove revision</button></div> <label class=\"svelte-xi74w\">Insert into<select aria-label=\"Insert destination\" class=\"svelte-xi74w\"><option class=\"svelte-xi74w\">Choose editable graph…</option><!></select></label> <div class=\"pc-actions svelte-xi74w\"><button type=\"button\" data-subgraph-insert=\"\" class=\"svelte-xi74w\"> </button></div>", 1), Oo = /* @__PURE__ */ q("<p class=\"pc-note svelte-xi74w\"> </p>"), ko = /* @__PURE__ */ q("<div class=\"pc-row svelte-xi74w\"><p class=\"pc-note svelte-xi74w\"> </p><div class=\"pc-port-fields svelte-xi74w\"><label class=\"svelte-xi74w\">Label<input class=\"svelte-xi74w\"/></label> <label class=\"svelte-xi74w\">Kind<select class=\"svelte-xi74w\"></select></label></div><label class=\"pc-check svelte-xi74w\"><input type=\"checkbox\" class=\"svelte-xi74w\"/>Required</label> <div class=\"pc-actions svelte-xi74w\"><button type=\"button\" data-save-interface=\"\" class=\"svelte-xi74w\">Save port</button><button type=\"button\" data-remove-interface=\"\" class=\"svelte-xi74w\">Remove port</button></div></div>"), Ao = /* @__PURE__ */ q("<div class=\"pc-port-fields svelte-xi74w\"><label class=\"svelte-xi74w\">New port<input aria-label=\"New interface label\" class=\"svelte-xi74w\"/></label><label class=\"svelte-xi74w\">Direction<select aria-label=\"New interface direction\" class=\"svelte-xi74w\"><option class=\"svelte-xi74w\">Input</option><option class=\"svelte-xi74w\">Output</option></select></label></div> <label class=\"svelte-xi74w\">Kind<select aria-label=\"New interface kind\" class=\"svelte-xi74w\"></select></label> <label class=\"pc-check svelte-xi74w\"><input type=\"checkbox\" aria-label=\"New interface required\" class=\"svelte-xi74w\"/>Required</label> <div class=\"pc-actions svelte-xi74w\"><button type=\"button\" data-add-interface=\"\" class=\"svelte-xi74w\">Add boundary</button></div>", 1), jo = /* @__PURE__ */ q("<div class=\"pc-row svelte-xi74w\"><label class=\"svelte-xi74w\">Label<input class=\"svelte-xi74w\"/></label><p class=\"pc-note svelte-xi74w\"> </p> <div class=\"pc-actions svelte-xi74w\"><button type=\"button\" data-save-parameter=\"\" class=\"svelte-xi74w\">Save parameter</button><button type=\"button\" data-remove-parameter=\"\" class=\"svelte-xi74w\">Remove parameter</button></div></div>"), Mo = /* @__PURE__ */ q("<label class=\"svelte-xi74w\">New parameter<input aria-label=\"New parameter label\" class=\"svelte-xi74w\"/></label> <label class=\"svelte-xi74w\">Target<select aria-label=\"Exposed parameter target\" class=\"svelte-xi74w\"><option class=\"svelte-xi74w\">Select eligible control…</option><!></select></label> <div class=\"pc-actions svelte-xi74w\"><button type=\"button\" data-add-parameter=\"\" class=\"svelte-xi74w\">Expose parameter</button></div>", 1), No = /* @__PURE__ */ q("<details open=\"\" class=\"svelte-xi74w\"><summary class=\"svelte-xi74w\">Interface</summary> <p class=\"pc-note svelte-xi74w\"> </p> <!> <!> <!> <p class=\"pc-note svelte-xi74w\">Ports keep stable IDs. Connected incompatible edits must be resolved before saving.</p></details> <details open=\"\" class=\"svelte-xi74w\"><summary class=\"svelte-xi74w\">Exposed parameters</summary> <!> <!> <!></details>", 1), Po = /* @__PURE__ */ q("<label class=\"svelte-xi74w\">Revision target<select aria-label=\"Shelf revision target\" class=\"svelte-xi74w\"><option class=\"svelte-xi74w\">Select exact shelf revision…</option><!></select></label>"), Fo = /* @__PURE__ */ q("<input type=\"checkbox\" class=\"svelte-xi74w\"/>"), Io = /* @__PURE__ */ q("<textarea class=\"svelte-xi74w\"></textarea>"), Lo = /* @__PURE__ */ q("<select class=\"svelte-xi74w\"></select>"), Ro = /* @__PURE__ */ q("<input class=\"svelte-xi74w\"/>"), zo = /* @__PURE__ */ q("<div class=\"pc-row svelte-xi74w\"><label class=\"svelte-xi74w\"> <!></label><p class=\"pc-note svelte-xi74w\"> </p> <div class=\"pc-actions svelte-xi74w\"><button type=\"button\" class=\"svelte-xi74w\">Save override</button><button type=\"button\" class=\"svelte-xi74w\">Use definition value</button></div></div>"), Bo = /* @__PURE__ */ q("<details open=\"\" class=\"svelte-xi74w\"><summary class=\"svelte-xi74w\">Parameter overrides</summary> <!></details>"), Vo = /* @__PURE__ */ q("<select class=\"svelte-xi74w\"><option class=\"svelte-xi74w\">Select connection…</option><!></select>"), Ho = /* @__PURE__ */ q("<label class=\"svelte-xi74w\">Saved connection<!></label>"), Uo = /* @__PURE__ */ q("<label class=\"svelte-xi74w\">Saved model<input class=\"svelte-xi74w\"/></label>"), Wo = /* @__PURE__ */ q("<p class=\"pc-error svelte-xi74w\"> </p>"), Go = /* @__PURE__ */ q("<div class=\"pc-row svelte-xi74w\"><p class=\"svelte-xi74w\"> </p> <label class=\"svelte-xi74w\">Connection mode<select class=\"svelte-xi74w\"></select></label> <!> <label class=\"svelte-xi74w\">Model mode<select class=\"svelte-xi74w\"></select></label> <!> <p class=\"pc-note svelte-xi74w\"> </p><!></div>"), Ko = /* @__PURE__ */ q("<details open=\"\" data-instance-model=\"\" class=\"svelte-xi74w\"><summary class=\"svelte-xi74w\">Model bindings</summary> <!></details>"), qo = /* @__PURE__ */ q("<option class=\"svelte-xi74w\">Drop override</option>"), Jo = /* @__PURE__ */ q("<label class=\"svelte-xi74w\"> <select class=\"svelte-xi74w\"><!><!></select></label>"), Yo = /* @__PURE__ */ q("<p class=\"pc-note svelte-xi74w\">No mappings.</p>"), Xo = /* @__PURE__ */ q("<details open=\"\" class=\"svelte-xi74w\"><summary class=\"svelte-xi74w\"> </summary><!><!></details>"), Zo = /* @__PURE__ */ q("<p class=\"pc-note svelte-xi74w\">Mappings changed. Prepare the update before accepting.</p>"), Qo = /* @__PURE__ */ q("<details open=\"\" class=\"svelte-xi74w\"><summary class=\"svelte-xi74w\">Update instance</summary> <label class=\"svelte-xi74w\">Target revision<select aria-label=\"Instance update revision\" class=\"svelte-xi74w\"><option class=\"svelte-xi74w\">Choose exact revision…</option><!></select></label> <!> <!> <!> <div class=\"pc-actions svelte-xi74w\"><button type=\"button\" data-prepare-instance-update=\"\" class=\"svelte-xi74w\">Prepare update</button><button type=\"button\" data-accept-instance-update=\"\" class=\"svelte-xi74w\">Accept prepared update</button></div></details>"), $o = /* @__PURE__ */ q("<details open=\"\" class=\"svelte-xi74w\"><summary class=\"svelte-xi74w\">Instance</summary><p class=\"pc-note svelte-xi74w\"> </p><div class=\"pc-actions svelte-xi74w\"><button type=\"button\" class=\"svelte-xi74w\">Open graph</button> <button type=\"button\" data-subgraph-local-copy=\"\" class=\"svelte-xi74w\">Make local copy</button> <button type=\"button\" data-subgraph-unpack=\"\" class=\"svelte-xi74w\">Unpack</button></div> <label class=\"svelte-xi74w\">Saved definition name<input aria-label=\"Saved definition name\" class=\"svelte-xi74w\"/></label> <label class=\"svelte-xi74w\">Save to shelf<select aria-label=\"Shelf save mode\" class=\"svelte-xi74w\"><option class=\"svelte-xi74w\">New entry with private identity</option><option class=\"svelte-xi74w\">Revision of selected entry</option></select></label> <!> <div class=\"pc-actions svelte-xi74w\"><button type=\"button\" data-subgraph-save-shelf=\"\" class=\"svelte-xi74w\">Save definition to shelf</button></div> <p class=\"pc-note svelte-xi74w\">Instance overrides remain on the wrapper. Saving does not bake them into the definition.</p></details> <!> <!> <!>", 1), es = /* @__PURE__ */ q("<details open=\"\" class=\"svelte-xi74w\"><summary class=\"svelte-xi74w\">Create subgraph</summary><p class=\"pc-note svelte-xi74w\"> </p><label class=\"svelte-xi74w\">Name<input aria-label=\"Selection subgraph name\" class=\"svelte-xi74w\"/></label><div class=\"pc-actions svelte-xi74w\"><button type=\"button\" data-subgraph-convert-selection=\"\" class=\"svelte-xi74w\">Convert selection</button></div></details>"), ts = /* @__PURE__ */ q("<p class=\"pc-error svelte-xi74w\" role=\"alert\"> </p>"), ns = /* @__PURE__ */ q("<p class=\"pc-note svelte-xi74w\" role=\"status\">Preparing change…</p>"), rs = /* @__PURE__ */ q("<p class=\"pc-note svelte-xi74w\"> </p> <details open=\"\" class=\"svelte-xi74w\"><summary class=\"svelte-xi74w\">Library</summary> <label class=\"svelte-xi74w\">Revision<select aria-label=\"Library revision\" class=\"svelte-xi74w\"><option class=\"svelte-xi74w\">Select revision…</option><!></select></label> <!> <div class=\"pc-actions svelte-xi74w\"><button type=\"button\" data-subgraph-import=\"\" class=\"svelte-xi74w\">Import .json</button></div> <p class=\"pc-note svelte-xi74w\">Shelf revisions are immutable. Removing one keeps placed instances intact.</p></details> <!> <!> <!> <!> <!> <!>", 1), is = /* @__PURE__ */ q("<p class=\"pc-note svelte-xi74w\">Open a graph to manage subgraphs.</p>"), as = /* @__PURE__ */ q("<section class=\"pc-manager svelte-xi74w\" aria-label=\"Manage subgraphs\"><header class=\"svelte-xi74w\"><h2 class=\"svelte-xi74w\">Manage subgraphs</h2><!></header> <!></section>");
function os(e, t) {
	ze(t, !0);
	let n = bi(t, "actions", 19, () => ({})), r = /* @__PURE__ */ R(""), i = /* @__PURE__ */ R(""), a = /* @__PURE__ */ R(""), o = /* @__PURE__ */ R(Xt({})), s = /* @__PURE__ */ R(Xt({})), c = /* @__PURE__ */ R(Xt({})), l = [
		"portMap",
		"parameterMap",
		"roleMap",
		"nodeBindingMap"
	], u = {
		portMap: "Ports",
		parameterMap: "Parameters",
		roleMap: "Model roles",
		nodeBindingMap: "Node bindings"
	}, d = /* @__PURE__ */ R({
		portMap: {},
		parameterMap: {},
		roleMap: {},
		nodeBindingMap: {}
	}), f = /* @__PURE__ */ R(""), p = /* @__PURE__ */ R(""), m = /* @__PURE__ */ R("input"), h = /* @__PURE__ */ R(!0), g = /* @__PURE__ */ R(""), _ = /* @__PURE__ */ R(""), v = /* @__PURE__ */ R("new"), y = /* @__PURE__ */ R(""), b = /* @__PURE__ */ R(""), x = "", S = 0, C = !0, w = (e) => e ? JSON.stringify([
		e.id,
		e.version,
		e.semanticHash
	]) : "", T = (e) => JSON.stringify(e.kind === "graph" ? [
		"graph",
		e.workflowId,
		e.instancePath,
		w(e.definitionRef)
	] : ["library", w(e.definitionRef)]), E = /* @__PURE__ */ I(() => t.view?.entries.find((e) => w(e.ref) === w(t.view.selectedRef))), D = /* @__PURE__ */ I(() => t.view?.destinations.find((e) => e.key === t.view.selectedDestinationKey)), O = /* @__PURE__ */ I(() => !!t.view && t.view.permissions.bodyEdit && t.view.scope.kind === "graph" && (!t.view.instance || t.view.instance.owned)), k = /* @__PURE__ */ I(() => t.view?.update?.choices.find((e) => e.key === t.view.update?.selectedKey)), ee = /* @__PURE__ */ I(() => JSON.stringify(G(d)) !== JSON.stringify(ne(t.view?.update ?? null)));
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
		e !== x && (x = e, z(r, G(E)?.name ?? t.view?.definition?.name ?? "", !0), z(i, ""), z(a, ""), S++, z(o, Object.fromEntries((t.view?.definition?.interface ?? []).map((e) => [e.id, {
			label: e.label,
			artifactKind: e.kind,
			required: e.required
		}])), !0), z(s, Object.fromEntries((t.view?.definition?.parameters ?? []).map((e) => [e.id, e.label])), !0), z(c, Object.fromEntries((t.view?.instance?.parameters ?? []).map((e) => [e.id, ae(e.control)])), !0), z(d, ne(t.view?.update ?? null)), z(f, ""), z(p, t.view?.definition?.kinds[0] ?? "", !0), z(m, "input"), z(h, !0), z(g, ""), z(_, ""), z(v, "new"), z(y, ""), z(b, ""));
	}), Si(() => {
		C = !1, S++;
	});
	let te = (e) => ({
		managerKey: e.managerKey,
		revision: e.revision,
		libraryRevision: e.libraryRevision,
		scope: Fe(e.scope)
	}), A = (e) => ({
		id: e.id,
		version: e.version,
		semanticHash: e.semanticHash
	});
	function j(e, n) {
		return !!t.view && t.view.capabilities[e] && (!n || t.view.permissions[n]) && (!["bodyEdit", "instanceEdit"].includes(n ?? "") || t.view.scope.kind === "graph") && (!["editInterface", "editParameter"].includes(e) || G(O));
	}
	function M() {
		z(i, ""), z(a, ""), S++;
	}
	function ne(e) {
		return {
			portMap: Object.fromEntries((e?.portMap ?? []).map((e) => [e.from, e.to])),
			parameterMap: Object.fromEntries((e?.parameterMap ?? []).map((e) => [e.from, e.to])),
			roleMap: Object.fromEntries((e?.roleMap ?? []).map((e) => [e.from, e.to])),
			nodeBindingMap: Object.fromEntries((e?.nodeBindingMap ?? []).map((e) => [e.from, e.to]))
		};
	}
	function re(e, n, r) {
		let i = t.view?.update?.[e].find((e) => e.from === n);
		if (!i || !j("prepareUpdate", "instanceEdit")) return;
		let a;
		try {
			a = JSON.parse(r);
		} catch {
			return;
		}
		(a === null ? !i.canDrop : typeof a != "string" || !i.options.some((e) => e.id === a)) || (z(d, {
			...G(d),
			[e]: {
				...G(d)[e],
				[n]: a
			}
		}), M());
	}
	function ie(e) {
		let r = t.view?.instance, i = t.view?.update, a = G(k);
		if (r && i && a) {
			if (e) {
				if (!i.preparedKey || G(ee) || !j("acceptUpdate", "instanceEdit") || !n().acceptUpdate) return;
				let e = i.preparedKey;
				me("acceptUpdate", !0, (t) => n().acceptUpdate(t, e, A(r.ref), A(a.ref)));
			} else if (j("prepareUpdate", "instanceEdit") && n().prepareUpdate) {
				let e = structuredClone(G(d));
				me("prepareUpdate", !0, (t) => n().prepareUpdate(t, A(r.ref), A(a.ref), e));
			}
		}
	}
	function ae(e) {
		return e.editor === "boolean" ? e.value === !0 : e.editor === "json" && e.representation === "json-value" ? JSON.stringify(e.value, null, 2) ?? "" : e.editor === "lines" && Array.isArray(e.value) ? e.value.join("\n") : String(e.value ?? "");
	}
	function oe(e, t) {
		return G(c)[e] ?? ae(t);
	}
	function se(e, t) {
		z(c, {
			...G(c),
			[e]: t
		}, !0), M();
	}
	function ce(e, r = !1) {
		let a = t.view?.instance?.parameters.find((t) => t.id === e);
		if (!a || !j("editParameterOverride", "instanceEdit") || !n().editParameterOverride) return;
		if (r) {
			me("editParameterOverride", !0, (t) => n().editParameterOverride(t, e, "reset"));
			return;
		}
		let o = a.control, s = oe(e, o), c = s;
		if (o.editor === "json") {
			let e = String(s);
			try {
				if (o.representation === "json-text" && o.allowEmpty && !e.trim()) c = e;
				else {
					let t = JSON.parse(e);
					c = o.representation === "json-text" ? e : t;
				}
			} catch {
				z(i, "Enter valid JSON before saving.");
				return;
			}
		} else if (o.editor === "number") {
			if (c = Number(s), !String(s).trim() || !Number.isFinite(c)) {
				z(i, "Enter a finite number before saving.");
				return;
			}
		} else if (o.editor === "lines") c = String(s).split(/\r?\n/);
		else if (o.editor === "enum" && !o.options?.some((e) => e.value === c)) {
			z(i, "Choose an available value before saving.");
			return;
		}
		me("editParameterOverride", !0, (t) => n().editParameterOverride(t, e, "set", c));
	}
	function le(e, r, i, a, o = !1) {
		let s = t.view?.instance?.bindings.find((t) => t.key === e), c = r === "profileId" ? s?.profile : s?.model;
		if (!s?.editable || !c || !j("editBindingOverride", "instanceEdit") || !n().editBindingOverride || !c.allowedModes.some((e) => e.value === i) || o && c.mode !== "override") return;
		let l = Fe(s.target);
		me("editBindingOverride", !0, (e) => n().editBindingOverride(e, l, r, i, a));
	}
	function ue(e) {
		return G(o)[e.id] ?? {
			label: e.label,
			artifactKind: e.kind,
			required: e.required
		};
	}
	function de(e, t, n) {
		z(o, {
			...G(o),
			[e.id]: {
				...ue(e),
				[t]: n
			}
		}, !0), M();
	}
	function fe(e) {
		t.view?.definition && j("editInterface", "bodyEdit") && n().editInterface && (e.kind === "add" || t.view.definition.interface.some((t) => t.id === e.id)) && (e.kind === "remove" || t.view.definition.kinds.includes(e.artifactKind)) && me("editInterface", !0, (t) => n().editInterface(t, Fe(e)));
	}
	function pe(e) {
		t.view?.definition && j("editParameter", "bodyEdit") && n().editParameter && (e.kind === "add" || t.view.definition.parameters.some((t) => t.id === e.id)) && (e.kind !== "add" || t.view.definition.eligibleTargets.some((t) => JSON.stringify(t.target) === JSON.stringify(e.target))) && me("editParameter", !0, (t) => n().editParameter(t, Fe(e)));
	}
	async function me(e, n, r) {
		if (!t.view || !n || G(a)) return;
		let o = te(t.view), s = ++S, c = w(t.view.selectedRef);
		z(a, e, !0), z(i, "");
		let l = () => C && s === S && t.view?.managerKey === o.managerKey && t.view.revision === o.revision && t.view.libraryRevision === o.libraryRevision && T(t.view.scope) === T(o.scope) && w(t.view.selectedRef) === c;
		try {
			let e = await r(o);
			l() && (z(a, ""), z(i, e.ok ? "" : e.error.code + ": " + e.error.message, !0));
		} catch (e) {
			l() && (z(a, ""), z(i, e instanceof Error ? e.message : "The subgraph change could not be accepted.", !0));
		}
	}
	var he = as(), ge = B(he), _e = V(B(ge)), ve = (e) => {
		var t = To();
		K("click", t, () => n().close?.()), J(e, t);
	};
	X(_e, (e) => {
		n().close && e(ve);
	}), F(ge);
	var ye = V(ge, 2), be = (e) => {
		var o = rs(), c = cn(o), x = B(c, !0);
		F(c);
		var S = V(c, 2), C = V(B(S), 2), w = V(B(C)), T = B(w);
		T.value = T.__value = "", Z(V(T), 17, () => t.view.entries, (e) => e.key, (e, t) => {
			var n = Eo(), r = B(n);
			F(n);
			var i = {};
			H(() => {
				Y(r, `${G(t).name ?? ""} · v${G(t).ref.version ?? ""} · ${G(t).phase ?? ""}`), i !== (i = G(t).key) && (n.value = (n.__value = G(t).key) ?? "");
			}), J(e, n);
		}), F(w);
		var ne;
		ii(w), F(C);
		var ae = V(C, 2), he = (e) => {
			var i = Do(), o = cn(i), s = B(o);
			F(o);
			var c = V(o, 2), l = V(B(c));
			Q(l), F(c);
			var u = V(c, 2), d = B(u), f = V(d, 2), p = V(f, 2), m = V(p, 2), h = V(m, 2);
			F(u);
			var g = V(u, 2), _ = V(B(g)), v = B(_);
			v.value = v.__value = "", Z(V(v), 17, () => t.view.destinations, (e) => e.key, (e, t) => {
				var n = Eo(), r = B(n, !0);
				F(n);
				var i = {};
				H(() => {
					Y(r, G(t).label), i !== (i = G(t).key) && (n.value = (n.__value = G(t).key) ?? "");
				}), J(e, n);
			}), F(_);
			var y;
			ii(_), F(g);
			var b = V(g, 2), x = B(b), S = B(x);
			F(x), F(b), H((e, i, a, o, c) => {
				Y(s, `Version ${G(E).ref.version ?? ""} · ${G(E).nodeCount ?? ""} nodes · ${G(E).wireCount ?? ""} wires`), ui(l, G(r)), l.disabled = !t.view.permissions.libraryWrite, d.disabled = !n().openLibrary, f.disabled = e, p.disabled = i, m.disabled = a, h.disabled = o, _.disabled = !n().selectDestination, y !== (y = G(D)?.key ?? "") && (_.value = (_.__value = G(D)?.key ?? "") ?? "", ri(_, G(D)?.key ?? "")), x.disabled = c, Y(S, `Insert into ${G(D)?.label ?? "graph" ?? ""}`);
			}, [
				() => !j("renameRevision", "libraryWrite") || !n().renameRevision || !G(r).trim() || !!G(a),
				() => !j("duplicate", "libraryWrite") || !n().duplicate || !G(r).trim() || !!G(a),
				() => !j("exportJSON") || !n().exportJSON || !!G(a),
				() => !j("removeRevision", "libraryWrite") || !n().removeRevision || !!G(a),
				() => !j("insert", "insert") || !n().insert || !G(D) || !!G(a)
			]), K("input", l, (e) => {
				z(r, e.currentTarget.value, !0), M();
			}), K("click", d, () => {
				t.view && G(E) && n().openLibrary?.(te(t.view), A(G(E).ref));
			}), K("click", f, () => {
				let e = G(E), t = G(r);
				e && t.trim() && n().renameRevision && me("renameRevision", j("renameRevision", "libraryWrite"), (r) => n().renameRevision(r, A(e.ref), t));
			}), K("click", p, () => {
				let e = G(E), t = G(r);
				e && t.trim() && n().duplicate && me("duplicate", j("duplicate", "libraryWrite"), (r) => n().duplicate(r, A(e.ref), t));
			}), K("click", m, () => {
				let e = G(E);
				e && n().exportJSON && me("exportJSON", j("exportJSON"), (t) => n().exportJSON(t, A(e.ref)));
			}), K("click", h, () => {
				let e = G(E);
				e && n().removeRevision && me("removeRevision", j("removeRevision", "libraryWrite"), (t) => n().removeRevision(t, A(e.ref)));
			}), K("change", _, (e) => {
				let r = e.currentTarget.value;
				e.currentTarget.selectedIndex >= 0 && t.view && n().selectDestination && (!r || t.view.destinations.some((e) => e.key === r)) && n().selectDestination(te(t.view), r || null);
			}), K("click", x, () => {
				let e = G(E), t = G(D);
				e && t && n().insert && me("insert", j("insert", "insert"), (r) => n().insert(r, A(e.ref), t.key));
			}), J(e, i);
		};
		X(ae, (e) => {
			G(E) && e(he);
		});
		var ge = V(ae, 2), _e = B(ge);
		F(ge), Oe(2), F(S);
		var ve = V(S, 2), ye = (e) => {
			var r = No(), i = cn(r), o = V(B(i), 2), c = B(o);
			F(o);
			var l = V(o, 2), u = (e) => {
				var n = Oo(), r = B(n, !0);
				F(n), H(() => Y(r, t.view.definition.description)), J(e, n);
			};
			X(l, (e) => {
				t.view.definition.description && e(u);
			});
			var d = V(l, 2);
			Z(d, 17, () => t.view.definition.interface, (e) => e.id, (e, r) => {
				var i = ko(), o = B(i), s = B(o);
				F(o);
				var c = V(o), l = B(c), u = V(B(l));
				Q(u), F(l);
				var d = V(l, 2), f = V(B(d));
				Z(f, 21, () => t.view.definition.kinds, Lr, (e, t) => {
					var n = Eo(), r = B(n, !0);
					F(n);
					var i = {};
					H(() => {
						Y(r, G(t)), i !== (i = G(t)) && (n.value = (n.__value = G(t)) ?? "");
					}), J(e, n);
				}), F(f);
				var p;
				ii(f), F(d), F(c);
				var m = V(c), h = B(m);
				Q(h), Oe(), F(m);
				var g = V(m, 2), _ = B(g), v = V(_);
				F(g), F(i), H((e, t, n, i, a, o, c, l) => {
					Y(s, `${G(r).direction ?? ""} · ${G(r).id ?? ""} · Boundary ${G(r).boundaryNodeId ?? ""}`), $(u, "aria-label", "Interface label " + G(r).id), ui(u, e), u.disabled = t, $(f, "aria-label", "Interface kind " + G(r).id), f.disabled = n, p !== (p = i) && (f.value = (f.__value = i) ?? "", ri(f, i)), $(h, "aria-label", "Required interface " + G(r).id), di(h, a), h.disabled = o, _.disabled = c, v.disabled = l;
				}, [
					() => ue(G(r)).label,
					() => !j("editInterface", "bodyEdit") || !n().editInterface,
					() => !j("editInterface", "bodyEdit") || !n().editInterface,
					() => ue(G(r)).artifactKind,
					() => ue(G(r)).required,
					() => !j("editInterface", "bodyEdit") || !n().editInterface,
					() => !j("editInterface", "bodyEdit") || !n().editInterface || !!G(a),
					() => !j("editInterface", "bodyEdit") || !n().editInterface || !!G(a)
				]), K("input", u, (e) => de(G(r), "label", e.currentTarget.value)), K("change", f, (e) => de(G(r), "artifactKind", e.currentTarget.value)), K("change", h, (e) => de(G(r), "required", e.currentTarget.checked)), K("click", _, () => fe({
					kind: "update",
					id: G(r).id,
					...ue(G(r))
				})), K("click", v, () => fe({
					kind: "remove",
					id: G(r).id
				})), J(e, i);
			});
			var v = V(d, 2), y = (e) => {
				var r = Ao(), i = cn(r), o = B(i), s = V(B(o));
				Q(s), F(o);
				var c = V(o), l = V(B(c)), u = B(l);
				u.value = u.__value = "input";
				var d = V(u);
				d.value = d.__value = "output", F(l);
				var g;
				ii(l), F(c), F(i);
				var _ = V(i, 2), v = V(B(_));
				Z(v, 21, () => t.view.definition.kinds, Lr, (e, t) => {
					var n = Eo(), r = B(n, !0);
					F(n);
					var i = {};
					H(() => {
						Y(r, G(t)), i !== (i = G(t)) && (n.value = (n.__value = G(t)) ?? "");
					}), J(e, n);
				}), F(v);
				var y;
				ii(v), F(_);
				var b = V(_, 2), x = B(b);
				Q(x), Oe(), F(b);
				var S = V(b, 2), C = B(S);
				F(S), H((e) => {
					ui(s, G(f)), g !== (g = G(m)) && (l.value = (l.__value = G(m)) ?? "", ri(l, G(m))), y !== (y = G(p)) && (v.value = (v.__value = G(p)) ?? "", ri(v, G(p))), di(x, G(h)), C.disabled = e;
				}, [() => !G(f).trim() || !n().editInterface || !!G(a)]), K("input", s, (e) => {
					z(f, e.currentTarget.value, !0), M();
				}), K("change", l, (e) => {
					let t = e.currentTarget.value;
					(t === "input" || t === "output") && z(m, t, !0), M();
				}), K("change", v, (e) => {
					z(p, e.currentTarget.value, !0), M();
				}), K("change", x, (e) => {
					z(h, e.currentTarget.checked, !0), M();
				}), K("click", C, () => {
					G(f).trim() && fe({
						kind: "add",
						label: G(f),
						direction: G(m),
						artifactKind: G(p),
						required: G(h)
					});
				}), J(e, r);
			}, b = /* @__PURE__ */ I(() => j("editInterface", "bodyEdit"));
			X(v, (e) => {
				G(b) && e(y);
			}), Oe(2), F(i);
			var x = V(i, 2), S = V(B(x), 2);
			Z(S, 17, () => t.view.definition.parameters, (e) => e.id, (e, t) => {
				var r = jo(), i = B(r), o = V(B(i));
				Q(o), F(i);
				var c = V(i), l = B(c);
				F(c);
				var u = V(c, 2), d = B(u), f = V(d);
				F(u), F(r), H((e, n, r, i) => {
					$(o, "aria-label", "Parameter label " + G(t).id), ui(o, G(s)[G(t).id] ?? G(t).label), o.disabled = e, Y(l, `${n ?? ""}${G(t).target.instancePath.length ? " / " : ""}${G(t).target.nodeId ?? ""} · ${G(t).target.controlId ?? ""}`), d.disabled = r, f.disabled = i;
				}, [
					() => !j("editParameter", "bodyEdit") || !n().editParameter,
					() => G(t).target.instancePath.join(" / "),
					() => !j("editParameter", "bodyEdit") || !n().editParameter || !!G(a),
					() => !j("editParameter", "bodyEdit") || !n().editParameter || !!G(a)
				]), K("input", o, (e) => {
					z(s, {
						...G(s),
						[G(t).id]: e.currentTarget.value
					}, !0), M();
				}), K("click", d, () => pe({
					kind: "update",
					id: G(t).id,
					label: G(s)[G(t).id] ?? G(t).label
				})), K("click", f, () => pe({
					kind: "remove",
					id: G(t).id
				})), J(e, r);
			});
			var C = V(S, 2), w = (e) => {
				var r = Mo(), i = cn(r), o = V(B(i));
				Q(o), F(i);
				var s = V(i, 2), c = V(B(s)), l = B(c);
				l.value = l.__value = "", Z(V(l), 17, () => t.view.definition.eligibleTargets, (e) => e.key, (e, t) => {
					var n = Eo(), r = B(n, !0);
					F(n);
					var i = {};
					H(() => {
						Y(r, G(t).label), i !== (i = G(t).key) && (n.value = (n.__value = G(t).key) ?? "");
					}), J(e, n);
				}), F(c);
				var u;
				ii(c), F(s);
				var d = V(s, 2), f = B(d);
				F(d), H((e) => {
					ui(o, G(g)), u !== (u = G(_)) && (c.value = (c.__value = G(_)) ?? "", ri(c, G(_))), f.disabled = e;
				}, [() => !G(g).trim() || !t.view.definition.eligibleTargets.some((e) => e.key === G(_)) || !n().editParameter || !!G(a)]), K("input", o, (e) => {
					z(g, e.currentTarget.value, !0), M();
				}), K("change", c, (e) => {
					z(_, e.currentTarget.value, !0), M();
				}), K("click", f, () => {
					let e = t.view?.definition?.eligibleTargets.find((e) => e.key === G(_));
					e && G(g).trim() && pe({
						kind: "add",
						label: G(g),
						target: Fe(e.target)
					});
				}), J(e, r);
			}, T = /* @__PURE__ */ I(() => j("editParameter", "bodyEdit"));
			X(C, (e) => {
				G(T) && e(w);
			});
			var E = V(C, 2), D = (e) => {
				var n = Oo(), r = B(n, !0);
				F(n), H(() => Y(r, t.view.definition.exposureNote)), J(e, n);
			};
			X(E, (e) => {
				t.view.definition.exposureNote && e(D);
			}), F(x), H(() => Y(c, `${t.view.definition.name ?? ""} · ${G(O) ? "Owned local definition" : "Read-only definition"}`)), J(e, r);
		};
		X(ve, (e) => {
			t.view.definition && e(ye);
		});
		var be = V(ve, 2), xe = (e) => {
			var i = $o(), o = cn(i), s = V(B(o)), c = B(s);
			F(s);
			var f = V(s), p = B(f), m = V(p, 2), h = V(m, 2);
			F(f);
			var g = V(f, 2), _ = V(B(g));
			Q(_), F(g);
			var b = V(g, 2), x = V(B(b)), S = B(x);
			S.value = S.__value = "new";
			var C = V(S);
			C.value = C.__value = "revision", F(x);
			var w;
			ii(x), F(b);
			var T = V(b, 2), E = (e) => {
				var n = Po(), r = V(B(n)), i = B(r);
				i.value = i.__value = "", Z(V(i), 17, () => t.view.entries, (e) => e.key, (e, t) => {
					var n = Eo(), r = B(n);
					F(n);
					var i = {};
					H(() => {
						Y(r, `${G(t).name ?? ""} · v${G(t).ref.version ?? ""}`), i !== (i = G(t).key) && (n.value = (n.__value = G(t).key) ?? "");
					}), J(e, n);
				}), F(r);
				var a;
				ii(r), F(n), H((e) => {
					r.disabled = e, a !== (a = G(y)) && (r.value = (r.__value = G(y)) ?? "", ri(r, G(y)));
				}, [() => !j("saveToShelf", "bodyEdit") || !t.view.permissions.libraryWrite]), K("change", r, (e) => {
					z(y, e.currentTarget.value, !0), M();
				}), J(e, n);
			};
			X(T, (e) => {
				G(v) === "revision" && e(E);
			});
			var D = V(T, 2), O = B(D);
			F(D), Oe(2), F(o);
			var ne = V(o, 2), ae = (e) => {
				var r = Bo();
				Z(V(B(r), 2), 17, () => t.view.instance.parameters, (e) => e.id, (e, r) => {
					let i = /* @__PURE__ */ I(() => G(r).control);
					var o = zo(), s = B(o), c = B(s), l = V(c), u = (e) => {
						var t = Fo();
						Q(t), H((e, n) => {
							$(t, "aria-label", "Override " + G(r).label), di(t, e), t.disabled = n;
						}, [() => oe(G(r).id, G(i)) === !0, () => !j("editParameterOverride", "instanceEdit") || !n().editParameterOverride]), K("change", t, (e) => se(G(r).id, e.currentTarget.checked)), J(e, t);
					}, d = (e) => {
						var t = Io();
						tt(t), H((e, n) => {
							$(t, "aria-label", "Override " + G(r).label), ui(t, e), t.disabled = n;
						}, [() => String(oe(G(r).id, G(i))), () => !j("editParameterOverride", "instanceEdit") || !n().editParameterOverride]), K("input", t, (e) => se(G(r).id, e.currentTarget.value)), J(e, t);
					}, f = (e) => {
						var t = Lo();
						Z(t, 21, () => G(i).options ?? [], Lr, (e, t) => {
							var n = Eo(), r = B(n, !0);
							F(n);
							var i = {};
							H(() => {
								Y(r, G(t).label), i !== (i = G(t).value) && (n.value = (n.__value = G(t).value) ?? "");
							}), J(e, n);
						}), F(t);
						var a;
						ii(t), H((e, n) => {
							$(t, "aria-label", "Override " + G(r).label), t.disabled = e, a !== (a = n) && (t.value = (t.__value = n) ?? "", ri(t, n));
						}, [() => !j("editParameterOverride", "instanceEdit") || !n().editParameterOverride, () => String(oe(G(r).id, G(i)))]), K("change", t, (e) => se(G(r).id, e.currentTarget.value)), J(e, t);
					}, p = (e) => {
						var t = Ro();
						Q(t), H((e, n) => {
							$(t, "type", G(i).editor === "number" ? "number" : "text"), $(t, "aria-label", "Override " + G(r).label), ui(t, e), $(t, "min", G(i).min), $(t, "max", G(i).max), t.disabled = n;
						}, [() => String(oe(G(r).id, G(i))), () => !j("editParameterOverride", "instanceEdit") || !n().editParameterOverride]), K("input", t, (e) => se(G(r).id, e.currentTarget.value)), J(e, t);
					};
					X(l, (e) => {
						G(i).editor === "boolean" ? e(u) : G(i).editor === "json" || G(i).editor === "lines" ? e(d, 1) : G(i).editor === "enum" ? e(f, 2) : e(p, -1);
					}), F(s);
					var m = V(s), h = B(m);
					F(m);
					var g = V(m, 2), _ = B(g), v = V(_);
					F(g), F(o), H((e, t) => {
						Y(c, `${G(r).label ?? ""} `), Y(h, `${G(r).overridden ? "Saved instance override" : "Inherited definition value"}${G(i).effective ? " · Effective: " + G(i).effective : ""}${G(i).source ? " · " + G(i).source : ""}`), $(_, "data-save-override", G(r).id), _.disabled = e, $(v, "data-reset-override", G(r).id), v.disabled = t;
					}, [() => !j("editParameterOverride", "instanceEdit") || !n().editParameterOverride || !!G(a), () => !j("editParameterOverride", "instanceEdit") || !n().editParameterOverride || !G(r).overridden || !!G(a)]), K("click", _, () => ce(G(r).id)), K("click", v, () => {
						t.view?.instance?.parameters.find((e) => e.id === G(r).id)?.overridden && ce(G(r).id, !0);
					}), J(e, o);
				}), F(r), J(e, r);
			};
			X(ne, (e) => {
				t.view.instance.parameters.length && e(ae);
			});
			var ue = V(ne, 2), de = (e) => {
				var r = Ko();
				Z(V(B(r), 2), 17, () => t.view.instance.bindings, (e) => e.key, (e, t) => {
					var r = Go(), i = B(r), o = B(i, !0);
					F(i);
					var s = V(i, 2), c = V(B(s));
					Z(c, 21, () => G(t).profile.allowedModes, Lr, (e, t) => {
						var n = Eo(), r = B(n, !0);
						F(n);
						var i = {};
						H(() => {
							Y(r, G(t).label), i !== (i = G(t).value) && (n.value = (n.__value = G(t).value) ?? "");
						}), J(e, n);
					}), F(c);
					var l;
					ii(c), F(s);
					var u = V(s, 2), d = (e) => {
						var r = Ho(), i = V(B(r)), o = (e) => {
							var r = Vo(), i = B(r);
							i.value = i.__value = "", Z(V(i), 17, () => G(t).profile.options, Lr, (e, t) => {
								var n = Eo(), r = B(n, !0);
								F(n);
								var i = {};
								H(() => {
									Y(r, G(t).label), i !== (i = G(t).value) && (n.value = (n.__value = G(t).value) ?? "");
								}), J(e, n);
							}), F(r);
							var o;
							ii(r), H((e) => {
								$(r, "aria-label", "Connection override " + G(t).key), r.disabled = e, o !== (o = G(t).profile.value ?? "") && (r.value = (r.__value = G(t).profile.value ?? "") ?? "", ri(r, G(t).profile.value ?? ""));
							}, [() => !G(t).editable || !j("editBindingOverride", "instanceEdit") || !n().editBindingOverride || !!G(a)]), K("change", r, (e) => le(G(t).key, "profileId", "override", e.currentTarget.value, !0)), J(e, r);
						}, s = (e) => {
							var r = Ro();
							Q(r), H((e) => {
								$(r, "aria-label", "Connection override " + G(t).key), ui(r, G(t).profile.value ?? ""), r.disabled = e;
							}, [() => !G(t).editable || !j("editBindingOverride", "instanceEdit") || !n().editBindingOverride || !!G(a)]), K("change", r, (e) => le(G(t).key, "profileId", "override", e.currentTarget.value, !0)), J(e, r);
						};
						X(i, (e) => {
							G(t).profile.options?.length ? e(o) : e(s, -1);
						}), F(r), J(e, r);
					};
					X(u, (e) => {
						G(t).profile.mode === "override" && e(d);
					});
					var f = V(u, 2), p = V(B(f));
					Z(p, 21, () => G(t).model.allowedModes, Lr, (e, t) => {
						var n = Eo(), r = B(n, !0);
						F(n);
						var i = {};
						H(() => {
							Y(r, G(t).label), i !== (i = G(t).value) && (n.value = (n.__value = G(t).value) ?? "");
						}), J(e, n);
					}), F(p);
					var m;
					ii(p), F(f);
					var h = V(f, 2), g = (e) => {
						var r = Uo(), i = V(B(r));
						Q(i), F(r), H((e) => {
							$(i, "aria-label", "Model override " + G(t).key), ui(i, G(t).model.value ?? ""), i.disabled = e;
						}, [() => !G(t).editable || !j("editBindingOverride", "instanceEdit") || !n().editBindingOverride || !!G(a)]), K("change", i, (e) => le(G(t).key, "model", "override", e.currentTarget.value, !0)), J(e, r);
					};
					X(h, (e) => {
						G(t).model.mode === "override" && e(g);
					});
					var _ = V(h, 2), v = B(_);
					F(_);
					var y = V(_), b = (e) => {
						var n = Wo(), r = B(n, !0);
						F(n), H(() => Y(r, G(t).issue)), J(e, n);
					};
					X(y, (e) => {
						G(t).issue && e(b);
					}), F(r), H((e, n) => {
						Y(o, G(t).label), $(c, "aria-label", "Connection mode " + G(t).key), c.disabled = e, l !== (l = G(t).profile.mode) && (c.value = (c.__value = G(t).profile.mode) ?? "", ri(c, G(t).profile.mode)), $(p, "aria-label", "Model mode " + G(t).key), p.disabled = n, m !== (m = G(t).model.mode) && (p.value = (p.__value = G(t).model.mode) ?? "", ri(p, G(t).model.mode)), Y(v, `Effective: ${G(t).effective ?? ""} · ${G(t).source ?? ""}`);
					}, [() => !G(t).editable || !j("editBindingOverride", "instanceEdit") || !n().editBindingOverride || !!G(a), () => !G(t).editable || !j("editBindingOverride", "instanceEdit") || !n().editBindingOverride || !!G(a)]), K("change", c, (e) => le(G(t).key, "profileId", e.currentTarget.value, G(t).profile.value)), K("change", p, (e) => le(G(t).key, "model", e.currentTarget.value, G(t).model.value)), J(e, r);
				}), F(r), J(e, r);
			};
			X(ue, (e) => {
				t.view.instance.bindings.length && e(de);
			});
			var fe = V(ue, 2), pe = (e) => {
				var r = Qo(), i = V(B(r), 2), o = V(B(i)), s = B(o);
				s.value = s.__value = "", Z(V(s), 17, () => t.view.update.choices, (e) => e.key, (e, t) => {
					var n = Eo(), r = B(n, !0);
					F(n);
					var i = {};
					H(() => {
						Y(r, G(t).label), i !== (i = G(t).key) && (n.value = (n.__value = G(t).key) ?? "");
					}), J(e, n);
				}), F(o);
				var c;
				ii(o), F(i);
				var f = V(i, 2);
				Z(f, 17, () => l, Lr, (e, r) => {
					var i = Xo(), a = B(i), o = B(a, !0);
					F(a);
					var s = V(a);
					Z(s, 17, () => t.view.update[G(r)], (e) => e.from, (e, t) => {
						var i = Jo(), a = B(i, !0), o = V(a), s = B(o);
						Z(s, 17, () => G(t).options, Lr, (e, t) => {
							var n = Eo(), r = B(n, !0);
							F(n);
							var i = {};
							H((e) => {
								Y(r, G(t).label), i !== (i = e) && (n.value = (n.__value = e) ?? "");
							}, [() => JSON.stringify(G(t).id)]), J(e, n);
						});
						var c = V(s), l = (e) => {
							var t = qo();
							t.value = t.__value = "null", J(e, t);
						};
						X(c, (e) => {
							G(t).canDrop && e(l);
						}), F(o);
						var u;
						ii(o), F(i), H((e, n) => {
							Y(a, G(t).label), $(o, "aria-label", "Mapping " + G(r) + " " + G(t).from), $(o, "data-map-kind", G(r)), o.disabled = e, u !== (u = n) && (o.value = (o.__value = n) ?? "", ri(o, n));
						}, [() => !j("prepareUpdate", "instanceEdit") || !n().prepareUpdate, () => JSON.stringify(Object.hasOwn(G(d)[G(r)], G(t).from) ? G(d)[G(r)][G(t).from] : G(t).to)]), K("change", o, (e) => re(G(r), G(t).from, e.currentTarget.value)), J(e, i);
					});
					var c = V(s), l = (e) => {
						J(e, Yo());
					};
					X(c, (e) => {
						t.view.update[G(r)].length || e(l);
					}), F(i), H(() => Y(o, u[G(r)])), J(e, i);
				});
				var p = V(f, 2);
				Z(p, 17, () => t.view.update.summary, Lr, (e, t) => {
					var n = Oo(), r = B(n, !0);
					F(n), H(() => Y(r, G(t))), J(e, n);
				});
				var m = V(p, 2), h = (e) => {
					J(e, Zo());
				};
				X(m, (e) => {
					G(ee) && e(h);
				});
				var g = V(m, 2), _ = B(g), v = V(_);
				F(g), F(r), H((e, r) => {
					o.disabled = !t.view.permissions.instanceEdit || !n().selectUpdateRef, c !== (c = G(k)?.key ?? "") && (o.value = (o.__value = G(k)?.key ?? "") ?? "", ri(o, G(k)?.key ?? "")), _.disabled = e, v.disabled = r;
				}, [() => !j("prepareUpdate", "instanceEdit") || !n().prepareUpdate || !G(k) || !!G(a), () => !j("acceptUpdate", "instanceEdit") || !n().acceptUpdate || !t.view.update.preparedKey || !G(k) || G(ee) || !!G(a)]), K("change", o, (e) => {
					let r = e.currentTarget.value, i = t.view?.update?.choices.find((e) => e.key === r);
					e.currentTarget.selectedIndex >= 0 && t.view && t.view.permissions.instanceEdit && t.view.scope.kind === "graph" && n().selectUpdateRef && (!r || i) && n().selectUpdateRef(te(t.view), i ? A(i.ref) : null);
				}), K("click", _, () => ie(!1)), K("click", v, () => ie(!0)), J(e, r);
			};
			X(fe, (e) => {
				t.view.update && e(pe);
			}), H((e, i, a, o, s) => {
				Y(c, `Pinned v${t.view.instance.ref.version ?? ""} · ${t.view.instance.owned ? "Owned local copy" : "Read-only pinned body"}`), p.disabled = !n().openInstance, m.disabled = e, h.disabled = i, ui(_, G(r)), _.disabled = a, x.disabled = o, w !== (w = G(v)) && (x.value = (x.__value = G(v)) ?? "", ri(x, G(v))), O.disabled = s;
			}, [
				() => !j("makeLocalCopy", "instanceEdit") || !n().makeLocalCopy || !!G(a),
				() => !j("unpack", "instanceEdit") || !n().unpack || !!G(a),
				() => !j("saveToShelf", "bodyEdit") || !t.view.permissions.libraryWrite,
				() => !j("saveToShelf", "bodyEdit") || !t.view.permissions.libraryWrite,
				() => !j("saveToShelf", "bodyEdit") || !t.view.permissions.libraryWrite || !t.view.instance.owned || !n().saveToShelf || !G(r).trim() || G(v) === "revision" && !t.view.entries.some((e) => e.key === G(y)) || !!G(a)
			]), K("click", p, () => {
				t.view?.instance && n().openInstance?.(te(t.view), Fe(t.view.instance.address));
			}), K("click", m, () => {
				let e = t.view?.instance;
				e && n().makeLocalCopy && me("makeLocalCopy", j("makeLocalCopy", "instanceEdit"), (t) => n().makeLocalCopy(t, Fe(e.address), A(e.ref)));
			}), K("click", h, () => {
				let e = t.view?.instance;
				e && n().unpack && me("unpack", j("unpack", "instanceEdit"), (t) => n().unpack(t, Fe(e.address), A(e.ref)));
			}), K("input", _, (e) => {
				z(r, e.currentTarget.value, !0), M();
			}), K("change", x, (e) => {
				let t = e.currentTarget.value;
				(t === "new" || t === "revision") && z(v, t, !0), M();
			}), K("click", O, () => {
				let e = t.view?.entries.find((e) => e.key === G(y)), i = G(v), a = G(r);
				t.view?.instance?.owned && t.view.permissions.libraryWrite && a.trim() && (i === "new" || e) && n().saveToShelf && me("saveToShelf", j("saveToShelf", "bodyEdit"), (t) => n().saveToShelf(t, i, i === "revision" && e ? A(e.ref) : null, a));
			}), J(e, i);
		};
		X(be, (e) => {
			t.view.instance && e(xe);
		});
		var Se = V(be, 2), Ce = (e) => {
			var r = es(), i = V(B(r)), o = B(i, !0);
			F(i);
			var s = V(i), c = V(B(s));
			Q(c), F(s);
			var l = V(s), u = B(l);
			F(l), F(r), H((e, n) => {
				Y(o, t.view.selection.label), ui(c, G(b)), c.disabled = e, u.disabled = n;
			}, [() => !j("convertSelection", "bodyEdit"), () => !j("convertSelection", "bodyEdit") || !n().convertSelection || !G(b).trim() || !t.view.selection.nodeIds.length || !!G(a)]), K("input", c, (e) => {
				z(b, e.currentTarget.value, !0), M();
			}), K("click", u, () => {
				let e = t.view?.selection?.nodeIds, r = G(b);
				e?.length && r.trim() && n().convertSelection && me("convertSelection", j("convertSelection", "bodyEdit"), (t) => n().convertSelection(t, [...e], r));
			}), J(e, r);
		};
		X(Se, (e) => {
			t.view.selection && e(Ce);
		});
		var we = V(Se, 2), N = (e) => {
			var n = Wo(), r = B(n, !0);
			F(n), H(() => Y(r, t.view.issue)), J(e, n);
		};
		X(we, (e) => {
			t.view.issue && e(N);
		});
		var Te = V(we, 2), P = (e) => {
			var t = ts(), n = B(t, !0);
			F(t), H(() => Y(n, G(i))), J(e, t);
		};
		X(Te, (e) => {
			G(i) && e(P);
		});
		var Ee = V(Te, 2), De = (e) => {
			J(e, ns());
		};
		X(Ee, (e) => {
			G(a) && e(De);
		}), H((e) => {
			Y(x, t.view.scopeLabel), w.disabled = !n().selectRef, ne !== (ne = G(E)?.key ?? "") && (w.value = (w.__value = G(E)?.key ?? "") ?? "", ri(w, G(E)?.key ?? "")), _e.disabled = e;
		}, [() => !j("importJSON", "libraryWrite") || !n().importJSON || !!G(a)]), K("change", w, (e) => {
			let r = e.currentTarget.value, i = t.view?.entries.find((e) => e.key === r);
			e.currentTarget.selectedIndex >= 0 && t.view && n().selectRef && (!r || i) && n().selectRef(te(t.view), i ? A(i.ref) : null);
		}), K("click", _e, () => {
			n().importJSON && me("importJSON", j("importJSON", "libraryWrite"), (e) => n().importJSON(e));
		}), J(e, o);
	}, xe = (e) => {
		J(e, is());
	};
	X(ye, (e) => {
		t.view ? e(be) : e(xe, -1);
	}), F(he), J(e, he), Be();
}
vr([
	"click",
	"change",
	"input"
]);
//#endregion
//#region ui/NodeSearch.svelte
var ss = /* @__PURE__ */ q("<label class=\"pc-context-check svelte-golf61\"><input type=\"checkbox\" class=\"svelte-golf61\"/>Context sensitive</label>"), cs = /* @__PURE__ */ q("<label class=\"pc-search-field svelte-golf61\"><span class=\"svelte-golf61\">Search nodes and subgraphs</span><input type=\"search\" placeholder=\"Search…\" autocomplete=\"off\" role=\"combobox\" aria-expanded=\"true\" class=\"svelte-golf61\"/></label> <!> <span class=\"pc-search-context svelte-golf61\"> </span>", 1), ls = /* @__PURE__ */ q("<p class=\"pc-search-context svelte-golf61\">Choose the named port to connect.</p>"), us = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-search-result svelte-golf61\" role=\"option\"><span class=\"svelte-golf61\"> </span> <span class=\"pc-family svelte-golf61\"> </span></button>"), ds = /* @__PURE__ */ q("<p class=\"pc-empty svelte-golf61\">No nodes match.</p>"), fs = /* @__PURE__ */ q("<p class=\"pc-feedback svelte-golf61\" role=\"status\"> </p>"), ps = /* @__PURE__ */ q("<div class=\"pc-node-search svelte-golf61\" role=\"dialog\" aria-modal=\"false\" tabindex=\"-1\"><div class=\"pc-popup-head svelte-golf61\"><h2 class=\"svelte-golf61\"> </h2><button type=\"button\" data-search-close=\"\" class=\"svelte-golf61\">Close</button></div> <!> <div class=\"pc-search-results svelte-golf61\" role=\"listbox\"></div> <!></div>");
function ms(e, t) {
	let n = Ar();
	ze(t, !0);
	let r = bi(t, "view", 3, null), i = bi(t, "actions", 19, () => ({})), a = /* @__PURE__ */ R(void 0), o = /* @__PURE__ */ R(void 0), s = /* @__PURE__ */ R(""), c = /* @__PURE__ */ R(0), l = /* @__PURE__ */ R(8), u = /* @__PURE__ */ R(8), d, f, p = (e) => [
		e.label,
		e.family,
		e.purpose ?? "",
		e.shortcode ?? "",
		...e.searchAliases ?? []
	].join(" ").toLocaleLowerCase(), m = /* @__PURE__ */ I(() => (r()?.choices ?? []).filter((e) => p(e).includes(G(s).toLocaleLowerCase().trim()))), h = /* @__PURE__ */ I(() => r()?.mode === "ports" ? r().ports : G(m)), g = (e) => "id" in e ? e.id : e.portId, _ = (e) => !!r()?.readOnly || "disabledReason" in e && !!e.disabledReason, v = /* @__PURE__ */ I(() => G(h).filter((e) => !_(e))), y = /* @__PURE__ */ I(() => G(v)[Math.min(G(c), Math.max(0, G(v).length - 1))]), b = (e) => ({
		Input: "#96ad52",
		Shaping: "#589aab",
		Surface: "#92c9ad",
		Transpose: "#9080b6",
		Derive: "#b65b9e",
		Output: "#c96d82",
		Subgraphs: "#a3aa99"
	})[e] ?? "#a1a59b";
	function x() {
		if (!r() || !G(a)) return;
		let e = G(a).getBoundingClientRect(), t = document.documentElement.clientWidth || window.innerWidth, n = document.documentElement.clientHeight || window.innerHeight;
		z(l, Math.max(8, Math.min(r().screenAnchor.x, t - e.width - 8)), !0), z(u, Math.max(8, Math.min(r().screenAnchor.y, n - e.height - 8)), !0);
	}
	vn(() => {
		let e = r()?.key, t = r()?.mode, n = r()?.screenAnchor;
		if (e === void 0 || !n) return;
		let i = d !== e || f !== t;
		d !== e && z(s, ""), i && z(c, 0), d = e, f = t, sr().then(() => {
			r()?.key === e && r().mode === t && (x(), i && (t === "nodes" ? G(o)?.focus() : (G(a)?.querySelector("[data-port]:not(:disabled)") ?? G(a))?.focus()));
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
		].includes(e.key) ? (e.preventDefault(), z(c, e.key === "Home" ? 0 : e.key === "End" ? Math.max(0, G(v).length - 1) : G(v).length ? (G(c) + (e.key === "ArrowDown" ? 1 : -1) + G(v).length) % G(v).length : 0, !0)) : e.key === "Enter" && (e.preventDefault(), S(G(y)));
	}
	var T = kr();
	_r("resize", $t, x);
	var E = cn(T), D = (e) => {
		var t = ps();
		let d;
		var f = B(t), p = B(f), m = B(p, !0);
		F(p);
		var x = V(p);
		F(f);
		var T = V(f, 2), E = (e) => {
			var t = cs(), i = cn(t), a = V(B(i));
			Q(a), yi(a, (e) => z(o, e), () => G(o)), F(i);
			var l = V(i, 2), u = (e) => {
				var t = ss(), n = B(t);
				Q(n), Oe(), F(t), H(() => {
					di(n, r().contextSensitive), n.disabled = r().readOnly;
				}), K("change", n, C), J(e, t);
			};
			X(l, (e) => {
				r().origin && e(u);
			});
			var d = V(l, 2), f = B(d, !0);
			F(d), H((e) => {
				$(a, "aria-controls", n + "-results"), $(a, "aria-activedescendant", e), Y(f, r().origin ? (r().origin.dir === "out" ? "Accepts " : "Produces ") + r().origin.kind : "All nodes and subgraphs");
			}, [() => G(y) ? n + "-item-" + G(h).indexOf(G(y)) : void 0]), K("input", a, () => z(c, 0)), hi(a, () => G(s), (e) => z(s, e)), J(e, t);
		}, D = (e) => {
			J(e, ls());
		};
		X(T, (e) => {
			r().mode === "nodes" ? e(E) : e(D, -1);
		});
		var O = V(T, 2);
		Z(O, 21, () => G(h), (e) => g(e), (e, t) => {
			var r = us(), i = B(r), a = B(i, !0);
			F(i);
			var o = V(i, 1, !0);
			o.nodeValue = " ";
			var s = V(o);
			let l;
			var u = B(s, !0);
			F(s), F(r), H((e, n, i, o) => {
				$(r, "aria-selected", G(y) === G(t)), $(r, "id", e), $(r, "data-choice", "id" in G(t) ? G(t).id : void 0), $(r, "data-port", "portId" in G(t) ? G(t).portId : void 0), r.disabled = n, $(r, "title", "disabledReason" in G(t) ? G(t).disabledReason : void 0), Y(a, i), l = ni(s, "", l, o), Y(u, "family" in G(t) ? G(t).family : G(t).kind);
			}, [
				() => n + "-item-" + G(h).indexOf(G(t)),
				() => _(G(t)),
				() => G(t).label || g(G(t)),
				() => ({ color: "family" in G(t) ? b(G(t).family) : void 0 })
			]), K("click", r, () => S(G(t))), _r("focus", r, () => {
				let e = G(v).indexOf(G(t));
				e >= 0 && z(c, e, !0);
			}), J(e, r);
		}, (e) => {
			J(e, ds());
		}), F(O);
		var k = V(O, 2), ee = (e) => {
			var t = fs(), n = B(t, !0);
			F(t), H(() => Y(n, r().feedback)), J(e, t);
		};
		X(k, (e) => {
			r().feedback && e(ee);
		}), F(t), yi(t, (e) => z(a, e), () => G(a)), H(() => {
			$(t, "aria-label", r().mode === "ports" ? "Choose connection port" : "Add node"), d = ni(t, "", d, {
				left: `${G(l) ?? ""}px`,
				top: `${G(u) ?? ""}px`
			}), Y(m, r().mode === "ports" ? "Choose a port" : "Add node"), $(O, "id", n + "-results"), $(O, "aria-label", r().mode === "ports" ? "Compatible ports" : "Nodes and subgraphs");
		}), K("keydown", t, w), K("click", x, () => i().dismiss?.()), J(e, t);
	};
	X(E, (e) => {
		r() && e(D);
	}), J(e, T), Be();
}
vr([
	"keydown",
	"click",
	"input",
	"change"
]);
//#endregion
//#region ui/PinMenu.svelte
var hs = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-pin-action svelte-i73q0t\"> </button>"), gs = /* @__PURE__ */ q("<p class=\"pc-empty svelte-i73q0t\">No attached links.</p>"), _s = /* @__PURE__ */ q("<div class=\"pc-pin-menu svelte-i73q0t\" role=\"dialog\" aria-label=\"Pin actions\" aria-modal=\"false\" tabindex=\"-1\"><div class=\"pc-menu-head svelte-i73q0t\"><h2 class=\"svelte-i73q0t\"> </h2><button type=\"button\" aria-label=\"Close pin actions\" class=\"svelte-i73q0t\">Close</button></div> <p class=\"pc-kind svelte-i73q0t\"> </p> <!></div>");
function vs(e, t) {
	ze(t, !0);
	let n = bi(t, "view", 3, null), r = bi(t, "actions", 19, () => ({})), i = /* @__PURE__ */ R(void 0), a = /* @__PURE__ */ R(8), o = /* @__PURE__ */ R(8), s, c = (e) => !!e.disabled || !!n()?.readOnly && e.capability !== "navigation";
	function l() {
		if (!n() || !G(i)) return;
		let e = G(i).getBoundingClientRect(), t = document.documentElement.clientWidth || window.innerWidth, r = document.documentElement.clientHeight || window.innerHeight;
		z(a, Math.max(8, Math.min(n().screenAnchor.x, t - e.width - 8)), !0), z(o, Math.max(8, Math.min(n().screenAnchor.y, r - e.height - 8)), !0);
	}
	vn(() => {
		let e = n()?.key, t = n()?.screenAnchor;
		if (e === void 0 || !t) return;
		let r = s !== e;
		s = e, sr().then(() => {
			n()?.key === e && (l(), r && (G(i)?.querySelector("[data-entry]:not(:disabled)") ?? G(i))?.focus());
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
		let t = [...G(i)?.querySelectorAll("[data-entry]:not(:disabled)") ?? []], a = t.indexOf(document.activeElement);
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
	_r("resize", $t, l);
	var p = cn(f), m = (e) => {
		var t = _s();
		let s;
		var l = B(t), f = B(l), p = B(f, !0);
		F(f);
		var m = V(f);
		F(l);
		var h = V(l, 2), g = B(h);
		F(h), Z(V(h, 2), 17, () => n().entries, (e) => e.id, (e, t) => {
			var n = hs(), r = B(n, !0);
			F(n), H((e) => {
				$(n, "data-entry", G(t).id), n.disabled = e, $(n, "title", G(t).reason), Y(r, G(t).label);
			}, [() => c(G(t))]), K("click", n, () => u(G(t))), J(e, n);
		}, (e) => {
			J(e, gs());
		}), F(t), yi(t, (e) => z(i, e), () => G(i)), H(() => {
			s = ni(t, "", s, {
				left: `${G(a) ?? ""}px`,
				top: `${G(o) ?? ""}px`
			}), Y(p, n().title), Y(g, `${n().kind ?? ""}${n().readOnly ? " · Read only" : ""}`);
		}), K("keydown", t, d), K("click", m, () => r().dismiss?.()), J(e, t);
	};
	X(p, (e) => {
		n() && e(m);
	}), J(e, f), Be();
}
vr(["keydown", "click"]);
//#endregion
//#region src/ui/node-palette.js
var ys = "M3 7 12 2l9 5v10l-9 5-9-5ZM3 7l9 5 9-5M12 12v10", bs = "m2 7 5-3 5 3v6l-5 3-5-3Zm10 0 5-3 5 3v6l-5 3-5-3ZM7 16v4l5 3 5-3v-4", xs = Object.freeze([
	{
		name: "Input",
		color: "#96ad52",
		icon: ys
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
		icon: ys
	},
	{
		name: "Subgraphs",
		color: "#a3aa99",
		icon: bs
	}
].map((e) => Object.freeze(e))), Ss = {
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
	Library: bs,
	Routing: "M3 12h18m-7-7 7 7-7 7",
	Blocks: ys
}, Cs = Object.freeze(Object.fromEntries(Object.entries(Ss).map(([e, t]) => [e, Object.freeze({
	name: e,
	icon: t
})]))), ws = {
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
		Ss.Planning
	],
	compose: [
		"Assembly",
		"co",
		Ss.Assembly
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
		Ss.Validation
	],
	"json-decode": [
		"Parsing",
		"jd",
		Ss.Parsing
	],
	"select-fields": [
		"Extraction",
		"sf",
		Ss.Extraction
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
		Ss.Delivery
	],
	reroute: [
		"Routing",
		"rt",
		Ss.Routing
	]
}, Ts = Object.freeze(Object.fromEntries(Object.entries(ws).map(([e, [t, n, r]]) => [e, Object.freeze({
	group: t,
	shortcode: n,
	icon: r
})]))), Es = Object.freeze({
	group: "Blocks",
	shortcode: "",
	icon: ys
}), Ds = (e) => Object.hasOwn(Ts, e) ? Ts[e] : Es, Os = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-family-row\" aria-haspopup=\"menu\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path></path></svg><span> </span></button>"), ks = /* @__PURE__ */ q("<button type=\"button\" role=\"menuitem\">‹ Families</button>"), As = /* @__PURE__ */ q("<button type=\"button\" role=\"menuitem\" aria-haspopup=\"menu\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path></path></svg><span class=\"pc-subfamily-name\"> </span><svg class=\"pc-sub-chevron\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"m9 5 7 7-7 7\"></path></svg></button>"), js = /* @__PURE__ */ q("<div role=\"menu\" tabindex=\"-1\"><!> <!></div>"), Ms = /* @__PURE__ */ q("<button type=\"button\" role=\"menuitem\"> </button>"), Ns = /* @__PURE__ */ q("<input class=\"text_pole\" aria-label=\"Search nodes\" placeholder=\"Search nodes…\"/>"), Ps = /* @__PURE__ */ q("<button type=\"button\" role=\"menuitem\"><svg class=\"pc-leaf-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path></path></svg><span class=\"pc-catalog-name\"> </span><small> </small></button>"), Fs = /* @__PURE__ */ q("<button type=\"button\" role=\"menuitem\" data-shelf-manage=\"\"><svg class=\"pc-leaf-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M3 6h18M3 18h18M8 3v6m8 6v6M3 12h18m-5-3v6\"></path></svg><span class=\"pc-catalog-name\">Manage subgraphs…</span></button>"), Is = /* @__PURE__ */ q("<div class=\"pc-shelf-menu pc-leaf-menu\" role=\"menu\" tabindex=\"-1\"><!> <!> <!> <!></div>"), Ls = /* @__PURE__ */ q("<nav aria-label=\"Node families\"></nav> <!> <!>", 1);
function Rs(e, t) {
	ze(t, !0);
	let n = bi(t, "readOnly", 3, !1), r, i = /* @__PURE__ */ R(null), a = /* @__PURE__ */ R(null), o = /* @__PURE__ */ R(""), s = /* @__PURE__ */ R(""), c = /* @__PURE__ */ R(!1), l = /* @__PURE__ */ R(""), u = /* @__PURE__ */ R(!1), d = /* @__PURE__ */ R(0), f = /* @__PURE__ */ R(0), p = /* @__PURE__ */ R(0), m = /* @__PURE__ */ R(0), h = null, g = 0, _ = xs.map((e) => e.name);
	function v(e = G(o)) {
		if (t.choices !== void 0) return t.choices.filter((t) => t.family === e).map((n) => {
			let r = Ds(n.id.startsWith("operation:") ? n.id.split(":")[1] : "");
			return {
				...n,
				title: n.label,
				compatible: !n.disabledReason && !!t.choose,
				catalog: !0,
				group: e === "Subgraphs" ? "Library" : r.group,
				shortcode: n.shortcode ?? r.shortcode,
				icon: e === "Subgraphs" ? Cs.Library.icon : r.icon
			};
		});
		let n = t.view?.families.find((t) => t.name === e);
		return n ? n.operations.filter((t) => e !== "Surface" || !["pattern-scan", "validate-patches"].includes(t.id)).map((t) => ({
			...t,
			...Ds(t.id),
			family: e
		})) : [];
	}
	let y = () => [.../* @__PURE__ */ new Set([...v().map((e) => e.group), ...G(o) === "Subgraphs" && t.manageSubgraphs ? ["Library"] : []])];
	function b(e = !1) {
		g++, z(o, ""), z(s, ""), z(c, !1), e && h?.focus({ preventScroll: !0 });
	}
	vn(() => (t.view?.graphId, t.choices, () => b()));
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
		if (G(o) === e) {
			n && G(i)?.querySelector("button")?.focus({ preventScroll: !0 });
			return;
		}
		let r = ++g;
		if (z(o, e, !0), z(s, ""), z(c, !1), h = t, await sr(), r !== g || G(o) !== e || !G(i)?.isConnected) return;
		let a = t.getBoundingClientRect(), l = G(i).getBoundingClientRect(), p = S(a, l.width, l.height, 110);
		z(d, p.x, !0), z(f, p.y, !0), z(u, p.compact, !0), n && G(i).querySelector("button")?.focus({ preventScroll: !0 });
	}
	async function w(e, t, n = !0) {
		if (G(s) === e) {
			n && G(a)?.querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
			return;
		}
		let r = ++g, c = G(o);
		if (z(s, e, !0), await sr(), r !== g || G(s) !== e || G(o) !== c || !G(a)?.isConnected) return;
		let l = t.getBoundingClientRect(), d = G(i).getBoundingClientRect(), f = G(a).getBoundingClientRect(), h = S({
			top: l.top,
			left: d.left,
			right: d.right
		}, f.width, f.height, 155);
		z(p, h.x, !0), z(m, h.y, !0), z(u, G(u) || h.compact, !0), n && G(a).querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
	}
	async function T() {
		let e = ++g;
		if (z(o, ""), z(s, ""), z(c, !0), z(l, ""), await sr(), e !== g || !G(c) || !G(a)?.isConnected) return;
		let t = x();
		z(p, Math.min(136, Math.max(4, t.width - 266)), !0), z(m, 13), G(a).querySelector("input")?.focus();
	}
	function E(e) {
		let r = v(e.family).find((t) => t.id === e.id);
		r?.compatible && !n() && (b(!0), r.catalog ? t.choose?.(r.id) : t.add(r.id));
	}
	async function D() {
		let e = G(s), t = G(o), n = ++g;
		z(s, ""), await sr(), n === g && G(o) === t && !G(s) && G(i)?.isConnected && [...G(i).querySelectorAll("[data-subfamily]")].find((t) => t.dataset.subfamily === e)?.focus({ preventScroll: !0 });
	}
	function O(e) {
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
		if (e.key === "ArrowLeft" && G(s)) {
			e.preventDefault(), e.stopPropagation(), D();
			return;
		}
		if (e.key === "ArrowLeft" && G(o)) {
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
	var k = { openSearch: T }, ee = Ls();
	_r("pointerdown", $t, (e) => {
		e.target.closest(".pc-node-shelf, .pc-shelf-menu") || b();
	}), _r("resize", $t, () => b());
	var te = cn(ee);
	Z(te, 21, () => xs, Lr, (e, n) => {
		var r = Os();
		let i;
		var a = B(r), s = B(a);
		F(a);
		var c = V(a), l = B(c, !0);
		F(c), F(r), H((e) => {
			$(r, "data-family", G(n).name), r.disabled = e, $(r, "title", G(n).name === "Transpose" ? "No supported Transpose operations yet." : "Browse " + G(n).name + " nodes"), $(r, "aria-expanded", G(o) === G(n).name), i = ni(r, "", i, { "--pc-family": G(n).color }), $(s, "d", G(n).icon), Y(l, G(n).name);
		}, [() => !v(G(n).name).length && !(G(n).name === "Subgraphs" && t.manageSubgraphs) || G(n).name === "Transpose"]), K("click", r, (e) => C(G(n).name, e.currentTarget)), _r("pointerenter", r, (e) => {
			e.pointerType !== "touch" && !e.currentTarget.disabled && C(G(n).name, e.currentTarget, !1);
		}), K("keydown", r, O), J(e, r);
	}), F(te), yi(te, (e) => r = e, () => r);
	var A = V(te, 2), j = (e) => {
		var t = js();
		let n;
		var r = B(t), a = (e) => {
			var t = ks();
			K("click", t, () => b(!0)), J(e, t);
		};
		X(r, (e) => {
			G(u) && e(a);
		}), Z(V(r, 2), 17, y, Lr, (e, t) => {
			var n = As(), r = B(n), i = B(r);
			F(r);
			var a = V(r), o = B(a, !0);
			F(a), Oe(), F(n), H((e) => {
				$(n, "data-subfamily", G(t)), $(n, "aria-expanded", G(s) === G(t)), $(i, "d", Cs[G(t)]?.icon), Y(o, e);
			}, [() => G(t).toUpperCase()]), K("click", n, (e) => w(G(t), e.currentTarget)), _r("pointerenter", n, (e) => {
				e.pointerType !== "touch" && w(G(t), e.currentTarget, !1);
			}), J(e, n);
		}), F(t), yi(t, (e) => z(i, e), () => G(i)), H((e) => {
			ei(t, 1, `pc-shelf-menu pc-family-menu${G(u) && G(s) ? " pc-shelf-replaced" : ""}`), $(t, "aria-label", G(o) + " categories"), n = ni(t, "", n, e);
		}, [() => ({
			left: `${G(d)}px`,
			top: `${G(f)}px`,
			"--pc-family": xs.find((e) => e.name === G(o))?.color
		})]), K("keydown", t, O), J(e, t);
	};
	X(A, (e) => {
		G(o) && e(j);
	});
	var M = V(A, 2), ne = (e) => {
		var r = Is();
		let i;
		var d = B(r), f = (e) => {
			var t = Ms(), n = B(t);
			F(t), H(() => Y(n, `‹ ${G(o) ?? ""}`)), K("click", t, D), J(e, t);
		};
		X(d, (e) => {
			G(u) && G(s) && e(f);
		});
		var h = V(d, 2), g = (e) => {
			var t = Ns();
			Q(t), hi(t, () => G(l), (e) => z(l, e)), J(e, t);
		};
		X(h, (e) => {
			G(c) && e(g);
		});
		var y = V(h, 2);
		Z(y, 17, () => G(c) ? _.flatMap((e) => v(e)).filter((e) => [
			e.title,
			e.id,
			e.family,
			e.purpose,
			e.shortcode,
			...e.searchAliases ?? []
		].join(" ").toLowerCase().includes(G(l).toLowerCase())) : v().filter((e) => e.group === G(s)), (e) => e.family + e.id, (e, t) => {
			var r = Ps(), i = B(r), a = B(i);
			F(i);
			var o = V(i), s = B(o, !0);
			F(o);
			var c = V(o), l = B(c, !0);
			F(c), F(r), H(() => {
				$(r, "data-shelf-choice", G(t).id), r.disabled = !G(t).compatible || n(), $(r, "title", n() ? "This graph is read-only." : G(t).disabledReason || (G(t).compatible ? G(t).purpose || "Add " + G(t).title : "Requires the " + G(t).phase + " phase")), $(a, "d", G(t).icon), Y(s, G(t).title), Y(l, G(t).shortcode);
			}), K("click", r, () => E(G(t))), J(e, r);
		});
		var x = V(y, 2), S = (e) => {
			var n = Fs();
			K("click", n, () => {
				b(!0), t.manageSubgraphs?.();
			}), J(e, n);
		};
		X(x, (e) => {
			!G(c) && G(o) === "Subgraphs" && t.manageSubgraphs && e(S);
		}), F(r), yi(r, (e) => z(a, e), () => G(a)), H(() => {
			$(r, "aria-label", G(c) ? "Search nodes" : G(o) + " nodes"), i = ni(r, "", i, {
				left: `${G(p)}px`,
				top: `${G(m)}px`
			});
		}), K("keydown", r, O), J(e, r);
	};
	return X(M, (e) => {
		(G(s) || G(c)) && e(ne);
	}), H(() => ei(te, 1, `pc-node-shelf${G(u) && G(o) ? " pc-shelf-replaced" : ""}`)), J(e, ee), Be(k);
}
vr(["click", "keydown"]);
//#endregion
//#region ui/WorkflowSetup.svelte
var zs = /* @__PURE__ */ q("<option> </option>"), Bs = /* @__PURE__ */ q("<label> <select class=\"text_pole\"><option>Choose a connection</option><!></select></label> <label> <input class=\"text_pole\" placeholder=\"Use profile model\"/></label>", 1), Vs = /* @__PURE__ */ q("<p class=\"pc-error\"> </p>"), Hs = /* @__PURE__ */ q("<article class=\"pc-workflow-starter\"><strong> </strong><p> </p><small> </small><button type=\"button\" class=\"pc-btn menu_button\"> </button></article>"), Us = /* @__PURE__ */ q("<h3> </h3> <p> </p> <p> </p> <!> <button type=\"button\" class=\"pc-btn menu_button\"> </button> <p> </p> <!> <h3>Workflow examples</h3> <!>", 1);
function Ws(e, t) {
	ze(t, !0);
	var n = kr(), r = cn(n), i = (e) => {
		var n = Us(), r = cn(n), i = B(r, !0);
		F(r);
		var a = V(r, 2), o = B(a, !0);
		F(a);
		var s = V(a, 2), c = B(s);
		F(s);
		var l = V(s, 2);
		Z(l, 17, () => t.view.roles, (e) => e.name, (e, n) => {
			var r = Bs(), i = cn(r), a = B(i), o = V(a), s = B(o);
			s.value = s.__value = "", Z(V(s), 17, () => t.view.profiles, (e) => e.id, (e, t) => {
				var n = zs(), r = B(n, !0);
				F(n);
				var i = {};
				H(() => {
					Y(r, G(t).name), i !== (i = G(t).id) && (n.value = (n.__value = G(t).id) ?? "");
				}), J(e, n);
			}), F(o);
			var c;
			ii(o), F(i);
			var l = V(i, 2), u = B(l), d = V(u);
			Q(d), F(l), H(() => {
				Y(a, `${G(n).name ?? ""} connection`), $(o, "aria-label", G(n).name + " connection"), c !== (c = G(n).profileId) && (o.value = (o.__value = G(n).profileId) ?? "", ri(o, G(n).profileId)), Y(u, `${G(n).name ?? ""} model override`), ui(d, G(n).model);
			}), K("change", o, (e) => t.actions.workflowSetup?.bindRole(G(n).name, e.currentTarget.value, G(n).model)), K("input", d, (e) => t.actions.workflowSetup?.bindRole(G(n).name, G(n).profileId, e.currentTarget.value)), J(e, r);
		});
		var u = V(l, 2), d = B(u);
		F(u);
		var f = V(u, 2), p = B(f);
		F(f);
		var m = V(f, 2);
		Z(m, 17, () => t.view.issues, Lr, (e, t) => {
			var n = Vs(), r = B(n, !0);
			F(n), H(() => Y(r, G(t))), J(e, n);
		}), Z(V(m, 4), 17, () => t.view.starters, (e) => e.id, (e, n) => {
			var r = Hs(), i = B(r), a = B(i, !0);
			F(i);
			var o = V(i), s = B(o, !0);
			F(o);
			var c = V(o), l = B(c);
			F(c);
			var u = V(c), d = B(u);
			F(u), F(r), H(() => {
				Y(a, G(n).title), Y(s, G(n).purpose), Y(l, `${G(n).phase === "pre" ? "Before reply" : "After reply"} · Maximum ${G(n).callBound ?? ""} auxiliary requests`), Y(d, `Install ${G(n).title ?? ""}`);
			}), K("click", u, () => t.actions.workflowSetup?.install(G(n).id)), J(e, r);
		}), H(() => {
			Y(i, t.view.name), Y(o, t.view.phase === "pre" ? "Guidance helps SillyTavern plan its normal reply." : "Review a revision of the latest completed assistant reply."), Y(c, `Maximum auxiliary requests: ${t.view.callBound ?? ""}`), Y(d, `Assign ${t.view.phase ?? ""} phase`), Y(p, `${t.view.assigned ? "Assigned to this phase." : "Phase is not assigned."} Arming is a separate action.`);
		}), K("click", u, () => t.actions.workflowSetup?.assign(t.view?.phase || "")), J(e, n);
	};
	X(r, (e) => {
		t.view && e(i);
	}), J(e, n), Be();
}
vr([
	"change",
	"input",
	"click"
]);
//#endregion
//#region ui/ImportReview.svelte
var Gs = /* @__PURE__ */ q("<p> </p>"), Ks = /* @__PURE__ */ q("<li> </li>"), qs = /* @__PURE__ */ q("<h3>Saved bindings to review</h3><ul></ul>", 1), Js = /* @__PURE__ */ q("<p>Saved model metadata is present. Review local connections before running.</p>"), Ys = /* @__PURE__ */ q("<h3>Imported terminal effects</h3><ul></ul>", 1), Xs = /* @__PURE__ */ q("<p>No imported terminal effects.</p>"), Zs = /* @__PURE__ */ q("<p role=\"alert\"> </p>"), Qs = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-btn menu_button\">Prepare again</button>"), $s = /* @__PURE__ */ q("<div class=\"pc-workspace-overlay pc-import-overlay\"><div class=\"pc-workspace-dialog pc-import-review\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Import into graph\" tabindex=\"-1\"><header><h2>Import into graph</h2><button type=\"button\" class=\"pc-btn menu_button\" aria-label=\"Cancel import\">×</button></header> <p><strong> </strong> <small> </small></p> <dl><dt>Phase</dt><dd> </dd><dt>Additions</dt><dd> </dd><dt>Conservative request bound</dt><dd> </dd></dl> <p class=\"pc-import-explanation\">This authoring bound includes unfinished branches. Bindings and reachable execution are checked when you explicitly run the workflow.</p> <!> <!> <!> <p>Insertion keeps internal wiring and relative layout. It does not connect matching names, arm or assign the graph, run requests, publish Guidance, or Apply a reply.</p> <!> <footer><button type=\"button\" class=\"pc-btn menu_button\">Cancel</button><!><button type=\"button\" class=\"pc-btn menu_button pc-import-accept\">Insert into graph</button></footer></div></div>");
function ec(e, t) {
	ze(t, !0);
	let n;
	xi(() => {
		let e = document.activeElement;
		return n.querySelector("button")?.focus(), () => e?.focus({ preventScroll: !0 });
	});
	function r(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), t.actions.cancelImport?.()), e.key === "Tab") {
			let t = [...n.querySelectorAll("button:not(:disabled)")], r = t[0], i = t.at(-1);
			e.shiftKey && document.activeElement === r && (e.preventDefault(), i?.focus()), !e.shiftKey && document.activeElement === i && (e.preventDefault(), r?.focus());
		}
	}
	var i = $s(), a = B(i), o = B(a), s = V(B(o));
	F(o);
	var c = V(o, 2), l = B(c), u = B(l, !0);
	F(l);
	var d = V(l, 2), f = B(d, !0);
	F(d), F(c);
	var p = V(c, 2), m = V(B(p)), h = B(m, !0);
	F(m);
	var g = V(m, 2), _ = B(g);
	F(g);
	var v = V(g, 2), y = B(v);
	F(v), F(p);
	var b = V(p, 4), x = (e) => {
		var n = Gs(), r = B(n);
		F(n), H((e) => Y(r, `Imported model roles: ${e ?? ""}.`), [() => t.view.requiredRoles.join(", ")]), J(e, n);
	};
	X(b, (e) => {
		t.view.requiredRoles.length && e(x);
	});
	var S = V(b, 2), C = (e) => {
		var n = qs(), r = V(cn(n));
		Z(r, 21, () => t.view.unresolvedBindings, Lr, (e, t) => {
			var n = Ks(), r = B(n);
			F(n), H((e) => Y(r, `${G(t).title ?? ""} · ${G(t).role ?? ""}: missing ${e ?? ""}`), [() => G(t).missing.join(" and ")]), J(e, n);
		}), F(r), J(e, n);
	}, w = (e) => {
		J(e, Js());
	};
	X(S, (e) => {
		t.view.unresolvedBindings.length ? e(C) : t.view.bindingReviewRequired && e(w, 1);
	});
	var T = V(S, 2), E = (e) => {
		var n = Ys(), r = V(cn(n));
		Z(r, 21, () => t.view.terminals, Lr, (e, t) => {
			var n = Ks(), r = B(n);
			F(n), H(() => Y(r, `${G(t).title ?? ""} · ${G(t).operation ?? ""}`)), J(e, n);
		}), F(r), J(e, n);
	}, D = (e) => {
		J(e, Xs());
	};
	X(T, (e) => {
		t.view.terminals.length ? e(E) : e(D, -1);
	});
	var O = V(T, 4), k = (e) => {
		var n = Zs(), r = B(n, !0);
		F(n), H(() => Y(r, t.view.error)), J(e, n);
	};
	X(O, (e) => {
		t.view.error && e(k);
	});
	var ee = V(O, 2), te = B(ee), A = V(te), j = (e) => {
		var n = Qs();
		K("click", n, () => t.actions.prepareImportAgain?.()), J(e, n);
	};
	X(A, (e) => {
		t.view.error && e(j);
	});
	var M = V(A);
	F(ee), F(a), yi(a, (e) => n = e, () => n), F(i), H(() => {
		Y(u, t.view.name), Y(f, t.view.fileName), Y(h, t.view.phase), Y(_, `${t.view.nodeCount ?? ""} blocks · ${t.view.wireCount ?? ""} wires · ${t.view.groupCount ?? ""} groups`), Y(y, `${t.view.callBound ?? ""} total · ${t.view.importedCallBound ?? ""} imported`), M.disabled = !!t.view.error;
	}), K("keydown", a, r), _r("paste", a, (e) => e.stopPropagation()), K("click", s, () => t.actions.cancelImport?.()), K("click", te, () => t.actions.cancelImport?.()), K("click", M, () => t.actions.acceptImport?.()), J(e, i), Be();
}
vr(["keydown", "click"]);
//#endregion
//#region ui/Workbench.svelte
var tc = /* @__PURE__ */ q("<p class=\"pc-native-diagnostic svelte-1dr9aew\" role=\"alert\"> </p>"), nc = /* @__PURE__ */ q("<p>Browse node families on the floating shelf. Middle mouse pans the graph; the wheel zooms around the pointer. Use the divider or its arrow keys to resize Preview.</p><p>Setup contains workflow examples, phase assignment and role defaults. Subgraphs manages reusable definitions. Arm enables the selected host workflow; Run tests it explicitly.</p><p>File › Import into graph reviews a same-phase fragment before one undoable insertion. Import workflow opens a separate graph.</p><p>Right-click empty graph space or drag from a pin to search for compatible nodes. Double-click a subgraph to open its saved body in a graph tab. Pinned bodies are read-only; Make local copy enables edits through the real parent instance.</p><p>The Subgraphs shelf manages individual subgraph JSON files. Portals connect pins through named references. Preview artifact tabs show results for the selected node; Run to here checks the request bound before running. Apply reviews the fresh result against the full root workflow.</p>", 1), rc = /* @__PURE__ */ q("<div class=\"pc-workspace-overlay\"><div class=\"pc-workspace-dialog\" role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\"><header><h2> </h2><button type=\"button\" class=\"pc-btn menu_button\" aria-label=\"Close panel\">×</button></header> <!></div></div>"), ic = /* @__PURE__ */ q("<div class=\"pc-workspace-overlay\"><div class=\"pc-manager-dialog svelte-1dr9aew\" role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\" aria-label=\"Manage portals\"><!></div></div>"), ac = /* @__PURE__ */ q("<div class=\"pc-workspace-overlay\"><div class=\"pc-manager-dialog svelte-1dr9aew\" role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\" aria-label=\"Manage subgraphs\"><!></div></div>"), oc = /* @__PURE__ */ q("<div role=\"dialog\" aria-modal=\"true\" aria-label=\"Lattice\" data-pc-workbench=\"svelte\"><!> <div class=\"pc-body\" role=\"region\" aria-label=\"Workspace panels\" tabindex=\"0\"><div class=\"pc-stage\"><section aria-label=\"Output preview\"><header class=\"pc-preview-pane-head\"><strong>Preview</strong><button type=\"button\" class=\"pc-btn menu_button\"> </button></header> <div class=\"pc-preview-content\"><!></div></section> <!> <!> <div class=\"pc-canvas-area\" id=\"pc-workspace-graph\" role=\"tabpanel\"><div class=\"pc-workspace-run svelte-1dr9aew\"><!></div> <!> <div class=\"pc-canvas-host\" aria-label=\"Node canvas\"></div> <!> <!></div></div> <div class=\"pc-inspector pc-workspace-details svelte-1dr9aew\"><header class=\"pc-details-heading svelte-1dr9aew\"><strong class=\"svelte-1dr9aew\">Details</strong><button type=\"button\" class=\"svelte-1dr9aew\">Portals</button><button type=\"button\" class=\"svelte-1dr9aew\">Subgraphs</button></header><!></div></div> <!> <!> <!> <!> <!> <!></div>");
function sc(e, t) {
	ze(t, !0);
	let n = bi(t, "actions", 7), r = /* @__PURE__ */ R({
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
	}), i, a, o, s, c;
	function l() {
		return {
			root: i,
			parts: {
				...c.getParts(),
				inspector: s,
				canvasHost: a
			}
		};
	}
	function u(e) {
		n({
			...n(),
			...e
		});
	}
	function d(e) {
		z(r, {
			...G(r),
			...e
		});
	}
	let f = "lattice.workspace.preview";
	function p() {
		try {
			let e = JSON.parse(localStorage.getItem(f) || "null");
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
	let m = p(), h = /* @__PURE__ */ R(Xt(m.height)), g = /* @__PURE__ */ R(Xt(m.collapsed)), _ = /* @__PURE__ */ R(500), v = /* @__PURE__ */ R(""), y = /* @__PURE__ */ R(null), b = null, x;
	function S() {
		try {
			localStorage.setItem(f, JSON.stringify({
				height: G(h),
				collapsed: G(g)
			}));
		} catch {}
	}
	function C() {
		n().resizeStart?.();
	}
	function w(e) {
		C(), z(g, e, !0), S();
	}
	function T() {
		w(!1);
	}
	function E() {
		return D("workflow-setup");
	}
	async function D(e) {
		e === "open-workflow" ? c.focusGraphSelect() : e === "show-preview" ? w(!1) : e === "collapse-preview" ? w(!0) : e === "add-node" ? x.openSearch() : (b = document.activeElement, z(v, e, !0), await sr(), G(y).querySelector("button")?.focus());
	}
	function O() {
		z(v, ""), b?.focus({ preventScroll: !0 });
	}
	function k(e, t) {
		if (e.stopPropagation(), e.key === "Escape") e.preventDefault(), n()[t]?.close?.();
		else if (e.key === "Tab") {
			let t = [...e.currentTarget.querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex=\"0\"]")], n = t[0], r = t.at(-1);
			e.shiftKey && document.activeElement === n && (e.preventDefault(), r?.focus()), !e.shiftKey && document.activeElement === r && (e.preventDefault(), n?.focus());
		}
	}
	function ee(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), O()), e.key === "Tab") {
			let t = [...G(y).querySelectorAll("button:not(:disabled), input, select, textarea, [tabindex=\"0\"]")], n = t[0], r = t.at(-1);
			e.shiftKey && document.activeElement === n && (e.preventDefault(), r?.focus()), !e.shiftKey && document.activeElement === r && (e.preventDefault(), n?.focus());
		}
	}
	xi(() => {
		let e = () => {
			z(_, Math.max(90, o.clientHeight - 190), !0);
		}, t = globalThis.ResizeObserver;
		if (!t) return e(), window.addEventListener("resize", e), () => window.removeEventListener("resize", e);
		let n = new t(e);
		return n.observe(o), () => n.disconnect();
	});
	var te = {
		getParts: l,
		updateActions: u,
		update: d,
		revealPreview: T,
		revealWorkflowSetup: E
	}, A = oc();
	let j;
	var M = B(A);
	yi(Gi(M, {
		get state() {
			return G(r);
		},
		get actions() {
			return n();
		},
		local: D
	}), (e) => c = e, () => c);
	var ne = V(M, 2), re = B(ne), ie = B(re);
	let ae, oe;
	var se = B(ie), ce = V(B(se)), le = B(ce, !0);
	F(ce), F(se);
	var ue = V(se, 2), de = B(ue);
	{
		let e = /* @__PURE__ */ I(() => G(r).outputPreview ?? null);
		Wa(de, {
			get view() {
				return G(e);
			},
			get actions() {
				return n().outputPreview;
			},
			collapse: () => w(!0)
		});
	}
	F(ue), F(ie);
	var fe = V(ie, 2), pe = (e) => {
		{
			let t = /* @__PURE__ */ I(() => Math.min(G(h), G(_)));
			qi(e, {
				get height() {
					return G(t);
				},
				get max() {
					return G(_);
				},
				start: C,
				change: (e) => {
					z(h, e, !0), S();
				}
			});
		}
	};
	X(fe, (e) => {
		G(g) || e(pe);
	});
	var me = V(fe, 2);
	ea(me, {
		get views() {
			return G(r).graphViews;
		},
		get actions() {
			return n().graphViewActions;
		},
		panelId: "pc-workspace-graph"
	});
	var he = V(me, 2), ge = B(he), _e = B(ge);
	{
		let e = /* @__PURE__ */ I(() => G(r).runMeter ?? null);
		io(_e, {
			get view() {
				return G(e);
			},
			open: () => {
				z(v, "run-details");
			}
		});
	}
	F(ge);
	var ve = V(ge, 2);
	{
		let e = /* @__PURE__ */ I(() => G(r).graphViews?.active);
		aa(ve, {
			get view() {
				return G(e);
			},
			get actions() {
				return n().graphViewActions;
			}
		});
	}
	var ye = V(ve, 2);
	yi(ye, (e) => a = e, () => a);
	var be = V(ye, 2), xe = (e) => {
		var t = tc(), n = B(t, !0);
		F(t), H(() => Y(n, G(r).nativeDiagnostic)), J(e, t);
	};
	X(be, (e) => {
		G(r).nativeDiagnostic && e(xe);
	}), yi(Rs(V(be, 2), {
		get view() {
			return G(r).workflow;
		},
		get choices() {
			return G(r).nativeChoices;
		},
		get choose() {
			return n().chooseNative;
		},
		get manageSubgraphs() {
			return n().manageSubgraphs;
		},
		get readOnly() {
			return G(r).readOnly;
		},
		add: (e) => n().addNode?.(e)
	}), (e) => x = e, () => x), F(he), F(re), yi(re, (e) => o = e, () => o);
	var Se = V(re, 2), Ce = B(Se), we = V(B(Ce)), N = V(we);
	F(Ce);
	var Te = V(Ce);
	{
		let e = /* @__PURE__ */ I(() => G(r).nodeDetails ?? null);
		Ea(Te, {
			get view() {
				return G(e);
			},
			get actions() {
				return n().nodeDetails;
			}
		});
	}
	F(Se), yi(Se, (e) => s = e, () => s), F(ne);
	var P = V(ne, 2), Ee = (e) => {
		var t = rc(), i = B(t), a = B(i), o = B(a), s = B(o, !0);
		F(o);
		var c = V(o);
		F(a);
		var l = V(a, 2), u = (e) => {
			{
				let t = /* @__PURE__ */ I(() => G(r).runDetails ?? null);
				eo(e, {
					get view() {
						return G(t);
					},
					get actions() {
						return n().runDetails;
					}
				});
			}
		}, d = (e) => {
			{
				let t = /* @__PURE__ */ I(() => G(r).rootWorkflow ?? G(r).workflow);
				Ws(e, {
					get view() {
						return G(t);
					},
					get actions() {
						return n();
					}
				});
			}
		}, f = (e) => {
			var t = nc();
			Oe(4), J(e, t);
		};
		X(l, (e) => {
			G(v) === "run-details" ? e(u) : G(v) === "workflow-setup" ? e(d, 1) : e(f, -1);
		}), F(i), yi(i, (e) => z(y, e), () => G(y)), F(t), H(() => {
			$(i, "aria-label", G(v) === "workflow-setup" ? "Workflow setup" : G(v) === "run-details" ? "Run details" : "Workspace guide"), Y(s, G(v) === "workflow-setup" ? "Workflow setup" : G(v) === "run-details" ? "Run details" : "Workspace guide");
		}), K("keydown", i, ee), _r("paste", i, (e) => e.stopPropagation()), K("click", c, O), J(e, t);
	};
	X(P, (e) => {
		G(v) && e(Ee);
	});
	var De = V(P, 2);
	ms(De, {
		get view() {
			return G(r).nativeSearch;
		},
		get actions() {
			return n().nativeSearch;
		}
	});
	var ke = V(De, 2);
	vs(ke, {
		get view() {
			return G(r).nativePinMenu;
		},
		get actions() {
			return n().nativePinMenu;
		}
	});
	var Ae = V(ke, 2), je = (e) => {
		var t = ic(), i = B(t);
		wo(B(i), {
			get view() {
				return G(r).portalManager;
			},
			get actions() {
				return n().portalManager;
			}
		}), F(i), F(t), K("keydown", i, (e) => k(e, "portalManager")), _r("paste", i, (e) => e.stopPropagation()), J(e, t);
	};
	X(Ae, (e) => {
		G(r).portalManager && e(je);
	});
	var Me = V(Ae, 2), Ne = (e) => {
		var t = ac(), i = B(t);
		os(B(i), {
			get view() {
				return G(r).subgraphManager;
			},
			get actions() {
				return n().subgraphManager;
			}
		}), F(i), F(t), K("keydown", i, (e) => k(e, "subgraphManager")), _r("paste", i, (e) => e.stopPropagation()), J(e, t);
	};
	X(Me, (e) => {
		G(r).subgraphManager && e(Ne);
	});
	var Pe = V(Me, 2), Fe = (e) => {
		ec(e, {
			get view() {
				return G(r).importReview;
			},
			get actions() {
				return n();
			}
		});
	};
	return X(Pe, (e) => {
		G(r).importReview && e(Fe);
	}), F(A), yi(A, (e) => i = e, () => i), H((e) => {
		j = ei(A, 1, "pc-root pc-native-workspace svelte-1dr9aew", null, j, { "pc-native-flat": G(r).nativeFlatCanvas }), ae = ei(ie, 1, "pc-preview-pane", null, ae, { "pc-preview-collapsed": G(g) }), oe = ni(ie, "", oe, e), $(ce, "aria-expanded", !G(g)), Y(le, G(g) ? "Expand preview" : "Collapse preview"), $(ue, "hidden", G(g)), $(Se, "hidden", !G(r).inspectorOpen);
	}, [() => ({ "--pc-preview-height": `${Math.min(G(h), G(_))}px` })]), K("click", ce, () => w(!G(g))), K("click", we, () => n().managePortals?.()), K("click", N, () => n().manageSubgraphs?.()), J(e, A), Be(te);
}
vr(["click", "keydown"]);
//#endregion
//#region ui/entry.js
function cc(e, t) {
	let n = jr(Li, {
		target: e,
		props: { actions: t }
	});
	return Pt(), {
		...n.getLayers(),
		setNodes: (e) => Pt(() => n.setNodes(e)),
		setGroups: (e) => Pt(() => n.setGroups(e)),
		setWires: (e, t, r) => Pt(() => n.setWires(e, t, r)),
		setPositions: (e, t) => Pt(() => n.setPositions(e, t)),
		destroy: () => Fr(n)
	};
}
function lc(e, t) {
	let n = jr(sc, {
		target: e,
		props: { actions: t }
	});
	return Pt(), {
		...n.getParts(),
		update: (e) => Pt(() => n.update(e)),
		updateActions: (e) => Pt(() => n.updateActions(e)),
		revealPreview: () => Pt(() => n.revealPreview()),
		revealWorkflowSetup: () => Pt(() => n.revealWorkflowSetup()),
		destroy: () => Fr(n)
	};
}
//#endregion
export { cc as mountCanvas, lc as mountWorkbench };
