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
var h = 1024, g = 2048, _ = 4096, v = 8192, y = 16384, b = 32768, x = 1 << 25, S = 65536, C = 1 << 19, w = 1 << 20, T = 1 << 25, E = 65536, D = 1 << 21, O = 1 << 22, ee = 1 << 23, k = Symbol("$state"), A = Symbol("legacy props"), te = Symbol(""), ne = Symbol("attributes"), j = Symbol("class"), re = Symbol("style"), ie = Symbol("text"), ae = Symbol("form reset"), oe = new class extends Error {
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
var De = !1;
function Oe(e) {
	De = e;
}
var M;
function ke(e) {
	if (e === null) throw we(), be;
	return M = e;
}
function Ae() {
	return ke(/* @__PURE__ */ dn(M));
}
function N(e) {
	if (De) {
		if (/* @__PURE__ */ dn(M) !== null) throw we(), be;
		M = e;
	}
}
function je(e = 1) {
	if (De) {
		for (var t = e, n = M; t--;) n = /* @__PURE__ */ dn(n);
		M = n;
	}
}
function Me(e = !0) {
	for (var t = 0, n = M;;) {
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
function Ne(e) {
	if (!e || e.nodeType !== 8) throw we(), be;
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
		r: qn,
		l: null
	};
}
function Ue(e) {
	var t = Be, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) Sn(r);
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
	if (Ge.length === 0 && !At) {
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
	var t = qn;
	if (t === null) return Wn.f |= ee, e;
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
	De && /* @__PURE__ */ un(e) !== null && fn(e);
}
var at = !1;
function ot() {
	at || (at = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[ae]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function st(e) {
	var t = Wn, n = qn;
	Kn(null), Jn(null);
	try {
		return e();
	} finally {
		Kn(t), Jn(n);
	}
}
function ct(e, t, n, r = n) {
	e.addEventListener(t, () => st(n));
	let i = e[ae];
	e[ae] = i ? () => {
		i(), r(!0);
	} : () => r(!0), ot();
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function lt(e) {
	let t = 0, n = qt(0), r;
	return () => {
		yn() && (H(n), En(() => (t === 0 && (r = hr(() => e(() => Zt(n)))), t += 1, () => {
			qe(() => {
				--t, t === 0 && (r?.(), r = void 0, Zt(n));
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
	#t = De ? M : null;
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
	#h = lt(() => (this.#m = qt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = qn;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = qn.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = Dn(() => {
			if (De) {
				let e = this.#t;
				Ae();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, ut), De && (this.#e = M);
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
		qe(r), t && (this.#s = On(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			t ? Ee() : (t = !0, n && ye(), this.#s !== null && Fn(this.#s, () => {
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
		e && (this.is_pending = !0, this.#o = On(() => e(this.#e)), qe(() => {
			var e = this.#c = document.createDocumentFragment(), t = ln();
			e.append(t), this.#a = this.#S(() => On(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, Fn(this.#o, () => {
				this.#o = null;
			}), this.#x(F));
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
			} else this.#x(F);
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
		var t = qn, n = Wn, r = Be;
		Jn(this.#i), Kn(this.#i), Ve(this.#i.ctx);
		try {
			return It.ensure(), e();
		} catch (e) {
			return Ye(e), null;
		} finally {
			Jn(t), Kn(n), Ve(r);
		}
	}
	#C(e, t) {
		this.has_pending_snippet() ? (this.#u += e, this.#u === 0 && (this.#x(t), this.#o && Fn(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null))) : this.parent && this.parent.#C(e, t);
	}
	update_pending_count(e, t) {
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, qe(() => {
			this.#d = !1, this.#m && Yt(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), H(this.#m);
	}
	error(e) {
		if (!this.#n.onerror && !this.#n.failed) throw e;
		F?.is_fork ? (this.#a && F.skip_effect(this.#a), this.#o && F.skip_effect(this.#o), this.#s && F.skip_effect(this.#s), F.oncommit(() => {
			this.#w(e);
		})) : this.#w(e);
	}
	#w(e) {
		this.#a &&= (Mn(this.#a), null), this.#o &&= (Mn(this.#o), null), this.#s &&= (Mn(this.#s), null), De && (ke(this.#t), je(), ke(Me()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return On(() => {
						var r = qn;
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
	var s = qn, c = mt(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
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
	var e = qn, t = Wn, n = Be, r = F;
	return function(i = !0) {
		Jn(e), Kn(t), Ve(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function ht(e = !0) {
	Jn(null), Kn(null), Ve(null), e && F?.deactivate();
}
function gt() {
	var e = qn, t = e.b, n = F, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function _t(e) {
	var t = 2 | g;
	return qn !== null && (qn.f |= C), {
		ctx: Be,
		deps: null,
		effects: null,
		equals: Pe,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v: xe,
		wv: 0,
		parent: qn,
		ac: null
	};
}
var vt = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function yt(e, t, n) {
	let r = qn;
	r === null && le();
	var i = void 0, a = qt(xe), o = !Wn, s = /* @__PURE__ */ new Set();
	return Tn(() => {
		var t = qn, n = p();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== oe && n.reject(e);
			}).finally(ht);
		} catch (e) {
			n.reject(e), ht();
		}
		var c = F;
		if (o) {
			if (t.f & 32768) var l = gt();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(vt);
			else for (let e of s.values()) e.reject(vt);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== vt && (c.activate(), t ? (a.f |= ee, Yt(a, t)) : (a.f & 8388608 && (a.f ^= ee), Yt(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), bn(() => {
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
function P(e) {
	let t = /* @__PURE__ */ _t(e);
	return Xn(t), t;
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
		for (var n = 0; n < t.length; n += 1) Mn(t[n]);
	}
}
function St(e) {
	var t, n = qn, r = e.parent;
	if (!Hn && r !== null && e.v !== xe && r.f & 24576) return Ce(), e.v;
	Jn(r);
	try {
		e.f &= ~E, xt(e), t = cr(e);
	} finally {
		Jn(n);
	}
	return t;
}
function Ct(e) {
	var t = St(e);
	!e.equals(t) && (e.wv = ar(), (!F?.is_fork || e.deps === null) && (F === null ? e.v = t : (F.capture(e, t, !0), Dt?.capture(e, t, !0)), e.deps === null)) ? Qe(e, h) : Hn || (Ot === null ? $e(e) : (yn() || F?.is_fork) && Ot.set(e, t));
}
function wt(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && st(() => {
		t.ac.abort(oe), t.ac = null;
	}), t.fn !== null && (t.teardown = d), ur(t, 0), An(t));
}
function Tt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && dr(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
var Et = null, F = null, Dt = null, Ot = null, kt = null, At = !1, jt = !1, Mt = null, Nt = null, Pt = 0, Ft = 1, It = class e {
	id = Ft++;
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
		this.#e = !0, Pt++ > 1e3 && (this.#x(), Rt());
		for (let e of this.#u) this.#d.delete(e), Qe(e, g), this.schedule(e);
		for (let e of this.#d) Qe(e, _), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = Mt = [], r = [], i = Nt = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw Ut(e), this.#h() || this.discard(), t;
		}
		if (F = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (Mt = null, Nt = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) Ht(e, t);
			i.length > 0 && F.#g();
			return;
		}
		let o = this.#v();
		if (o) this.#b(r), this.#b(n), o.#y(this);
		else {
			this.#u.clear(), this.#d.clear();
			for (let e of this.#r) e(this);
			this.#r.clear(), Dt = this, Bt(r), Bt(n), Dt = null, this.#s?.resolve();
			var s = F;
			if (this.#a === 0 && (this.#c.length === 0 || s !== null) && this.#x(), this.#c.length > 0) {
				if (s !== null) {
					let e = s;
					e.#c.push(...this.#c.filter((t) => !e.#c.includes(t)));
				} else s = this;
			}
			s !== null && (Gt.clear(), s.#g());
		}
	}
	#_(e, t, n) {
		e.f ^= h;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= h : i & 4 ? t.push(r) : or(r) && (i & 16 && this.#d.add(r), dr(r));
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
		this.oncommit(() => e.discard()), e.#x(), F = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) tt(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== xe && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), Ot?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		F = this;
	}
	deactivate() {
		F = null, Ot = null;
	}
	flush() {
		try {
			jt = !0, F = this, this.#g();
		} finally {
			Pt = 0, kt = null, Mt = null, Nt = null, jt = !1, F = null, Ot = null, Gt.clear();
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
		if (F === null) {
			let t = F = new e();
			!jt && !At && qe(() => {
				t.#e || t.flush();
			});
		}
		return F;
	}
	apply() {
		Ot = null;
	}
	schedule(e) {
		if (kt = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) e.b.defer_effect(e);
		else {
			for (var t = e; t.parent !== null;) {
				t = t.parent;
				var n = t.f;
				if (Mt !== null && t === qn && (Wn === null || !(Wn.f & 2))) return;
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
function Lt(e) {
	var t = At;
	At = !0;
	try {
		var n;
		for (e && (F !== null && !F.is_fork && F.flush(), n = e());;) {
			if (Je(), F === null) return n;
			F.flush();
		}
	} finally {
		At = t;
	}
}
function Rt() {
	try {
		me();
	} catch (e) {
		Xe(e, kt);
	}
}
var zt = null;
function Bt(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && or(r) && (zt = /* @__PURE__ */ new Set(), dr(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Pn(r), zt?.size > 0)) {
				Gt.clear();
				for (let e of zt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) zt.has(n) && (zt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || dr(n);
					}
				}
				zt.clear();
			}
		}
		zt = null;
	}
}
function Vt(e) {
	F.schedule(e);
}
function Ht(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), Qe(e, h);
		for (var n = e.first; n !== null;) Ht(n, t), n = n.next;
	}
}
function Ut(e) {
	Qe(e, h);
	for (var t = e.first; t !== null;) Ut(t), t = t.next;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/sources.js
var Wt = /* @__PURE__ */ new Set(), Gt = /* @__PURE__ */ new Map(), Kt = !1;
function qt(e, t) {
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
function I(e, t) {
	let n = qt(e, t);
	return Xn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function Jt(e, t = !1, n = !0) {
	let r = qt(e);
	return t || (r.equals = Ie), r;
}
function L(e, t, n = !1) {
	return Wn !== null && (!Gn || Wn.f & 131072) && We() && Wn.f & 4325394 && (Yn === null || !Yn.has(e)) && ve(), Yt(e, n ? $t(t) : t, Nt);
}
function Yt(e, t, n = null) {
	if (!e.equals(t)) {
		Hn ? Gt.set(e, t) : Gt.has(e) || Gt.set(e, e.v);
		var r = It.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && St(t), Ot === null && $e(t);
		}
		e.wv = ar(), Qt(e, g, n), We() && qn !== null && qn.f & 1024 && !(qn.f & 96) && ($n === null ? er([e]) : $n.push(e)), !r.is_fork && Wt.size > 0 && !Kt && Xt();
	}
	return t;
}
function Xt() {
	Kt = !1;
	for (let e of Wt) {
		e.f & 1024 && Qe(e, _);
		let t;
		try {
			t = or(e);
		} catch {
			t = !0;
		}
		t && dr(e);
	}
	Wt.clear();
}
function Zt(e) {
	L(e, e.v + 1);
}
function Qt(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = We(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (i || s !== qn) {
			var l = (c & g) === 0;
			if (l && Qe(s, t), c & 131072) Wt.add(s);
			else if (c & 2) {
				var u = s;
				Ot?.delete(u), c & 65536 || (c & 512 && (qn === null || !(qn.f & 2097152)) && (s.f |= E), Qt(u, _, n));
			} else if (l) {
				var d = s;
				c & 16 && zt !== null && zt.add(d), n === null ? Vt(d) : n.push(d);
			}
		}
	}
}
function $t(t) {
	if (typeof t != "object" || !t || k in t) return t;
	let n = l(t);
	if (n !== s && n !== c) return t;
	var r = /* @__PURE__ */ new Map(), i = e(t), o = /* @__PURE__ */ I(0), u = null, d = rr, f = (e) => {
		if (rr === d) return e();
		var t = Wn, n = rr;
		Kn(null), ir(d);
		var r = e();
		return Kn(t), ir(n), r;
	};
	return i && r.set("length", /* @__PURE__ */ I(t.length, u)), new Proxy(t, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && ge();
			var i = r.get(t);
			return i === void 0 ? f(() => {
				var e = /* @__PURE__ */ I(n.value, u);
				return r.set(t, e), e;
			}) : L(i, n.value, !0), !0;
		},
		deleteProperty(e, t) {
			var n = r.get(t);
			if (n === void 0) {
				if (t in e) {
					let e = f(() => /* @__PURE__ */ I(xe, u));
					r.set(t, e), Zt(o);
				}
			} else L(n, xe), Zt(o);
			return !0;
		},
		get(e, n, i) {
			if (n === k) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ I($t(s ? e[n] : xe), u)), r.set(n, o)), o !== void 0) {
				var c = H(o);
				return c === xe ? void 0 : c;
			}
			return Reflect.get(e, n, i);
		},
		getOwnPropertyDescriptor(e, t) {
			var n = Reflect.getOwnPropertyDescriptor(e, t);
			if (n && "value" in n) {
				var i = r.get(t);
				i && (n.value = H(i));
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
			if (t === k) return !0;
			var n = r.get(t), i = n !== void 0 && n.v !== xe || Reflect.has(e, t);
			return (n !== void 0 || qn !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ I(i ? $t(e[t]) : xe, u)), r.set(t, n)), H(n) === xe) ? !1 : i;
		},
		set(e, t, n, s) {
			var c = r.get(t), l = t in e;
			if (i && t === "length") for (var d = n; d < c.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ I(xe, u)), r.set(d + "", p)) : L(p, xe);
			}
			if (c === void 0) (!l || a(e, t)?.writable) && (c = f(() => /* @__PURE__ */ I(void 0, u)), L(c, $t(n)), r.set(t, c));
			else {
				l = c.v !== xe;
				var m = f(() => $t(n));
				L(c, m);
			}
			var h = Reflect.getOwnPropertyDescriptor(e, t);
			if (h?.set && h.set.call(s, n), !l) {
				if (i && typeof t == "string") {
					var g = r.get("length"), _ = Number(t);
					Number.isInteger(_) && _ >= g.v && L(g, _ + 1);
				}
				Zt(o);
			}
			return !0;
		},
		ownKeys(e) {
			H(o);
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
function en(e) {
	try {
		if (typeof e == "object" && e && k in e) return e[k];
	} catch {}
	return e;
}
function tn(e, t) {
	return Object.is(en(e), en(t));
}
var nn, rn, an, on, sn;
function cn() {
	if (nn === void 0) {
		nn = window, rn = document, an = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		on = a(t, "firstChild").get, sn = a(t, "nextSibling").get, u(e) && (e[j] = void 0, e[ne] = null, e[re] = void 0, e.__e = void 0), u(n) && (n[ie] = void 0);
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
function R(e, t) {
	if (!De) return /* @__PURE__ */ un(e);
	var n = /* @__PURE__ */ un(M);
	if (n === null) n = M.appendChild(ln());
	else if (t && n.nodeType !== 3) {
		var r = ln();
		return n?.before(r), ke(r), r;
	}
	return t && hn(n), ke(n), n;
}
function z(e, t = !1) {
	if (!De) {
		var n = /* @__PURE__ */ un(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ dn(n) : n;
	}
	if (t) {
		if (M?.nodeType !== 3) {
			var r = ln();
			return M?.before(r), ke(r), r;
		}
		hn(M);
	}
	return M;
}
function B(e, t = 1, n = !1) {
	let r = De ? M : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ dn(r);
	if (!De) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = ln();
			return r === null ? i?.after(a) : r.before(a), ke(a), a;
		}
		hn(r);
	}
	return ke(r), r;
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
	qn === null && (Wn === null && pe(e), fe()), Hn && de(e);
}
function _n(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function vn(e, t) {
	var n = qn;
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
	F?.register_created_effect(r);
	var i = r;
	if (e & 4) Mt === null ? It.ensure().schedule(r) : Mt.push(r);
	else if (t !== null) {
		try {
			dr(r);
		} catch (e) {
			throw Mn(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= S));
	}
	if (i !== null && (i.parent = n, n !== null && _n(i, n), Wn !== null && Wn.f & 2 && !(e & 64))) {
		var a = Wn;
		(a.effects ??= []).push(i);
	}
	return r;
}
function yn() {
	return Wn !== null && !Gn;
}
function bn(e) {
	let t = vn(8, null);
	return Qe(t, h), t.teardown = e, t;
}
function xn(e) {
	gn("$effect");
	var t = qn.f;
	if (!Wn && t & 32 && Be !== null && !Be.i) {
		var n = Be;
		(n.e ??= []).push(e);
	} else return Sn(e);
}
function Sn(e) {
	return vn(4 | w, e);
}
function Cn(e) {
	It.ensure();
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
function V(e, t = [], n = [], r = []) {
	pt(r, t, n, (t) => {
		vn(8, () => {
			e(...t.map(H));
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
		let e = Hn, n = Wn;
		Un(!0), Kn(null);
		try {
			t.call(null);
		} finally {
			Un(e), Kn(n);
		}
	}
}
function An(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && st(() => {
			e.abort(oe);
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
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (Nn(e.nodes.start, e.nodes.end), n = !0), e.f |= x, An(e, t && !n), ur(e, 0);
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
		e.f ^= v, e.f & 1024 || (Qe(e, g), It.ensure().schedule(e));
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
var Wn = null, Gn = !1;
function Kn(e) {
	Wn = e;
}
var qn = null;
function Jn(e) {
	qn = e;
}
var Yn = null;
function Xn(e) {
	Wn !== null && (Yn ??= /* @__PURE__ */ new Set()).add(e);
}
var Zn = null, Qn = 0, $n = null;
function er(e) {
	$n = e;
}
var tr = 1, nr = 0, rr = nr;
function ir(e) {
	rr = e;
}
function ar() {
	return ++tr;
}
function or(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~E), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (or(a) && Ct(a), a.wv > e.wv) return !0;
		}
		t & 512 && Ot === null && Qe(e, h);
	}
	return !1;
}
function sr(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Yn !== null && Yn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? sr(a, t, !1) : t === a && (n ? Qe(a, g) : a.f & 1024 && Qe(a, _), Vt(a));
	}
}
function cr(e) {
	var t = Zn, n = Qn, r = $n, i = Wn, a = Yn, o = Be, s = Gn, c = rr, l = e.f;
	Zn = null, Qn = 0, $n = null, Wn = l & 96 ? null : e, Yn = null, Ve(e.ctx), Gn = !1, rr = ++nr, e.ac !== null && (st(() => {
		e.ac.abort(oe);
	}), e.ac = null);
	try {
		e.f |= D;
		var u = e.fn, d = u();
		e.f |= b;
		var f = e.deps, p = F?.is_fork;
		if (Zn !== null) {
			var m;
			if (p || ur(e, Qn), f !== null && Qn > 0) for (f.length = Qn + Zn.length, m = 0; m < Zn.length; m++) f[Qn + m] = Zn[m];
			else e.deps = f = Zn;
			if (yn() && e.f & 512) for (m = Qn; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && Qn < f.length && (ur(e, Qn), f.length = Qn);
		if (We() && $n !== null && !Gn && f !== null && !(e.f & 6146)) for (m = 0; m < $n.length; m++) sr($n[m], e);
		if (i !== null && i !== e) {
			if (nr++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = nr;
			if (t !== null) for (let e of t) e.rv = nr;
			$n !== null && (r === null ? r = $n : r.push(...$n));
		}
		return e.f & 8388608 && (e.f ^= ee), d;
	} catch (e) {
		return Ye(e);
	} finally {
		e.f ^= D, Zn = t, Qn = n, $n = r, Wn = i, Yn = a, Ve(o), Gn = s, rr = c;
	}
}
function lr(e, r) {
	let i = r.reactions;
	if (i !== null) {
		var a = t.call(i, e);
		if (a !== -1) {
			var o = i.length - 1;
			o === 0 ? i = r.reactions = null : (i[a] = i[o], i.pop());
		}
	}
	if (i === null && r.f & 2 && (Zn === null || !n.call(Zn, r))) {
		var s = r;
		s.f & 512 && (s.f ^= 512, s.f &= ~E), s.v !== xe && $e(s), s.ac !== null && st(() => {
			s.ac.abort(oe), s.ac = null, Qe(s, g);
		}), wt(s), ur(s, 0);
	}
}
function ur(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) lr(e, n[r]);
}
function dr(e) {
	var t = e.f;
	if (!(t & 16384)) {
		Qe(e, h);
		var n = qn, r = Vn;
		qn = e, Vn = !(t & 96);
		try {
			t & 16777232 ? jn(e) : An(e), kn(e);
			var i = cr(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = tr;
		} finally {
			Vn = r, qn = n;
		}
	}
}
async function fr() {
	await Promise.resolve(), Lt();
}
function H(e) {
	var t = !!(e.f & 2);
	if (Bn?.add(e), Wn !== null && !Gn && !(qn !== null && qn.f & 16384) && (Yn === null || !Yn.has(e))) {
		var r = Wn.deps;
		if (Wn.f & 2097152) e.rv < nr && (e.rv = nr, Zn === null && r !== null && r[Qn] === e ? Qn++ : Zn === null ? Zn = [e] : Zn.push(e));
		else {
			Wn.deps ??= [], n.call(Wn.deps, e) || Wn.deps.push(e);
			var i = e.reactions;
			i === null ? e.reactions = [Wn] : n.call(i, Wn) || i.push(Wn);
		}
	}
	if (Hn && Gt.has(e)) return Gt.get(e);
	if (t) {
		var a = e;
		if (Hn) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || mr(a)) && (o = St(a)), Gt.set(a, o), o;
		}
		var s = !(a.f & 512) && !Gn && Wn !== null && (Vn || !!(Wn.f & 512)), c = (a.f & b) === 0;
		or(a) && (s && (a.f |= 512), Ct(a)), s && !c && (Tt(a), pr(a));
	}
	if (Ot?.has(e)) return Ot.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function pr(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (Tt(t), pr(t));
}
function mr(e) {
	if (e.v === xe) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Gt.has(t) || t.f & 2 && mr(t)) return !0;
	return !1;
}
function hr(e) {
	var t = Gn;
	try {
		return Gn = !0, e();
	} finally {
		Gn = t;
	}
}
function gr(e) {
	if (!(typeof e != "object" || !e || e instanceof EventTarget)) {
		if (k in e) _r(e);
		else if (!Array.isArray(e)) for (let t in e) {
			let n = e[t];
			typeof n == "object" && n && k in n && _r(n);
		}
	}
}
function _r(e, t = /* @__PURE__ */ new Set()) {
	if (typeof e == "object" && e && !(e instanceof EventTarget) && !t.has(e)) {
		t.add(e), e instanceof Date && e.getTime();
		for (let n in e) try {
			_r(e[n], t);
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
var vr = ["touchstart", "touchmove"];
function yr(e) {
	return vr.includes(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
var br = Symbol("events"), xr = /* @__PURE__ */ new Set(), Sr = /* @__PURE__ */ new Set();
function Cr(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || Dr.call(t, e), !e.cancelBubble) return st(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? qe(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function U(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = Cr(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && bn(() => {
		t.removeEventListener(e, o, a);
	});
}
function W(e, t, n) {
	(t[br] ??= {})[e] = n;
}
function wr(e) {
	for (var t = 0; t < e.length; t++) xr.add(e[t]);
	for (var n of Sr) n(e);
}
var Tr = null, Er = !1;
function Dr(e) {
	var t = this, n = t.ownerDocument, r = e.type, a = e.composedPath?.() || [], o = a[0] || e.target;
	Tr = e, Er || (Er = !0, setTimeout(() => {
		Er = !1, Tr = null;
	}));
	var s = 0, c = Tr === e && e[br];
	if (c) {
		var l = a.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[br] = t;
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
		var d = Wn, f = qn;
		Kn(null), Jn(null);
		try {
			for (var p, m = []; o !== null && o !== t;) {
				try {
					var h = o[br]?.[r];
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
			e[br] = t, delete e.currentTarget, Kn(d), Jn(f);
		}
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/reconciler.js
var Or = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function kr(e) {
	return Or?.createHTML(e) ?? e;
}
function Ar(e) {
	var t = mn("template");
	return t.innerHTML = kr(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function jr(e, t) {
	var n = qn;
	n.nodes === null && (n.nodes = {
		start: e,
		end: t,
		a: null,
		t: null
	});
}
/*#__NO_SIDE_EFFECTS__*/
function G(e, t) {
	var n = !!(t & 1), r = !!(t & 2), i, a = !e.startsWith("<!>");
	return () => {
		if (De) return jr(M, null), M;
		i === void 0 && (i = Ar(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ un(i)));
		var t = r || an ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ un(t), s = t.lastChild;
			jr(o, s);
		} else jr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Mr(e, t, n = "svg") {
	var r = !e.startsWith("<!>"), i = !!(t & 1), a = `<${n}>${r ? e : "<!>" + e}</${n}>`, o;
	return () => {
		if (De) return jr(M, null), M;
		if (!o) {
			var e = /* @__PURE__ */ un(Ar(a));
			if (i) for (o = document.createDocumentFragment(); /* @__PURE__ */ un(e);) o.appendChild(/* @__PURE__ */ un(e));
			else o = /* @__PURE__ */ un(e);
		}
		var t = o.cloneNode(!0);
		if (i) {
			var n = /* @__PURE__ */ un(t), r = t.lastChild;
			jr(n, r);
		} else jr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Nr(e, t) {
	return /* @__PURE__ */ Mr(e, t, "svg");
}
function Pr(e = "") {
	if (!De) {
		var t = ln(e + "");
		return jr(t, t), t;
	}
	var n = M;
	return n.nodeType === 3 ? hn(n) : (n.before(n = ln()), ke(n)), jr(n, n), n;
}
function Fr() {
	if (De) return jr(M, null), M;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = ln();
	return e.append(t, n), jr(t, n), e;
}
function K(e, t) {
	if (De) {
		var n = qn;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = M), Ae();
	} else e !== null && e.before(t);
}
function Ir() {
	if (De && M && M.nodeType === 8 && M.textContent?.startsWith("$")) {
		let e = M.textContent.substring(1);
		return Ae(), e;
	}
	return (window.__svelte ??= {}).uid ??= 1, `c${window.__svelte.uid++}`;
}
function q(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[ie] ??= e.nodeValue) && (e[ie] = n, e.nodeValue = `${n}`);
}
function Lr(e, t) {
	return zr(e, t);
}
var Rr = /* @__PURE__ */ new Map();
function zr(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	cn();
	var l = void 0, u = Cn(() => {
		var s = n ?? t.appendChild(ln());
		dt(s, { pending: () => {} }, (t) => {
			He({});
			var n = Be;
			if (o && (n.c = o), a && (i.$$events = a), De && jr(t, null), l = e(t, i) || {}, De && (qn.nodes.end = M, M === null || M.nodeType !== 8 || M.data !== "]")) throw we(), be;
			Ue();
		}, c);
		var u = /* @__PURE__ */ new Set(), d = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!u.has(r)) {
					u.add(r);
					var i = yr(r);
					for (let e of [t, document]) {
						var a = Rr.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), Rr.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, Dr, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return d(r(xr)), Sr.add(d), () => {
			for (var e of u) for (let n of [t, document]) {
				var r = Rr.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, Dr), r.delete(e), r.size === 0 && Rr.delete(n)) : r.set(e, i);
			}
			Sr.delete(d), s !== n && s.parentNode?.removeChild(s);
		};
	});
	return Br.set(l, u), l;
}
var Br = /* @__PURE__ */ new WeakMap();
function Vr(e, t) {
	let n = Br.get(e);
	return n ? (Br.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/branches.js
var Hr = class {
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
		var n = F, r = pn();
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
		} else De && (this.anchor = M), this.#a(n);
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
function J(e, t, n = !1) {
	var r;
	De && (r = M, Ae());
	var i = new Hr(e), a = n ? S : 0;
	function o(e, t) {
		if (De) {
			var n = Ne(r);
			if (e !== parseInt(n.substring(1))) {
				var a = Me();
				ke(a), i.anchor = a, Oe(!1), i.ensure(e, t), Oe(!0);
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
var Ur = Symbol("NaN");
function Wr(e, t, n) {
	De && Ae();
	var r = new Hr(e), i = !We();
	Dn(() => {
		var e = t();
		e !== e && (e = Ur), i && typeof e == "object" && e && (e = {}), r.ensure(e, n);
	});
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
function Gr(e, t) {
	return t;
}
function Kr(e, t, n) {
	for (var i = [], a = t.length, o, s = t.length, c = 0; c < a; c++) {
		let n = t[c];
		Fn(n, () => {
			if (o) {
				if (o.pending.delete(n), o.done.add(n), o.pending.size === 0) {
					var t = e.outrogroups;
					qr(e, r(o.done)), t.delete(o), t.size === 0 && (e.outrogroups = null);
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
		qr(e, t, !l);
	} else o = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(o);
}
function qr(e, t, n = !0) {
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
var Jr;
function Y(t, n, i, a, o, s = null) {
	var c = t, l = /* @__PURE__ */ new Map();
	if (n & 4) {
		var u = t;
		c = De ? ke(/* @__PURE__ */ un(u)) : u.appendChild(ln());
	}
	De && Ae();
	var d = null, f = /* @__PURE__ */ bt(() => {
		var t = i();
		return e(t) ? t : t == null ? [] : r(t);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, Xr(v, p, c, n, a), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= T, Qr(d, null, c)) : Ln(d) : Fn(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: Dn(() => {
			p = H(f);
			var e = p.length;
			let t = !1;
			De && Ne(c) === "[!" != (e === 0) && (c = Me(), ke(c), Oe(!1), t = !0);
			for (var r = /* @__PURE__ */ new Set(), u = F, v = pn(), y = 0; y < e; y += 1) {
				De && M.nodeType === 8 && M.data === "]" && (c = M, t = !0, Oe(!1));
				var b = p[y], x = a(b, y), S = h ? null : l.get(x);
				S ? (S.v && Yt(S.v, b), S.i && Yt(S.i, y), v && u.unskip_effect(S.e)) : (S = Zr(l, h ? c : Jr ??= ln(), b, x, y, o, n, i), h || (S.e.f |= T), l.set(x, S)), r.add(x);
			}
			if (e === 0 && s && !d && (h ? d = On(() => s(c)) : (d = On(() => s(Jr ??= ln())), d.f |= T)), e > r.size && ue("", "", ""), De && e > 0 && ke(Me()), !h) {
				if (m.set(u, r), v) {
					for (let [e, t] of l) r.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			t && Oe(!0), H(f);
		}),
		flags: n,
		items: l,
		pending: m,
		outrogroups: null,
		fallback: d
	};
	h = !1, De && (c = M);
}
function Yr(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function Xr(e, t, n, i, a) {
	var o = !!(i & 8), s = t.length, c = e.items, l = Yr(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (o) for (v = 0; v < s; v += 1) h = t[v], g = a(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = a(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (Ln(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= T, _ === l) Qr(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), $r(e, d, _), $r(e, _, y), Qr(_, y, n), d = _, p = [], m = [], l = Yr(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], C = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) Qr(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					$r(e, S.prev, C.next), $r(e, d, S), $r(e, C, b), l = b, d = C, --v, p = [], m = [];
				} else u.delete(_), Qr(_, l, n), $r(e, _.prev, _.next), $r(e, _, d === null ? e.effect.first : d.next), $r(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = Yr(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = Yr(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (qr(e, r(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var w = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || w.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && w.push(l), l = Yr(l.next);
		var E = w.length;
		if (E > 0) {
			var D = i & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < E; v += 1) w[v].nodes?.a?.measure();
				for (v = 0; v < E; v += 1) w[v].nodes?.a?.fix();
			}
			Kr(e, w, D);
		}
	}
	o && qe(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Zr(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? qt(n) : /* @__PURE__ */ Jt(n, !1, !1) : null, l = o & 2 ? qt(i) : null;
	return {
		v: c,
		i: l,
		e: On(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function Qr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ dn(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function $r(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/actions.js
function ei(e, t, n) {
	wn(() => {
		var r = hr(() => t(e, n?.()) || {});
		if (n && r?.update) {
			var i = !1, a = {};
			En(() => {
				var e = n();
				gr(e), i && Fe(a, e) && (a = e, r.update(e));
			}), i = !0;
		}
		if (r?.destroy) return () => r.destroy();
	});
}
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function ti(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") {
		if (Array.isArray(e)) {
			var i = e.length;
			for (t = 0; t < i; t++) e[t] && (n = ti(e[t])) && (r && (r += " "), r += n);
		} else for (n in e) e[n] && (r && (r += " "), r += n);
	}
	return r;
}
function ni() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = ti(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/shared/attributes.js
function ri(e) {
	return typeof e == "object" ? ni(e) : e ?? "";
}
var ii = [..." 	\n\r\f\xA0\v﻿"];
function ai(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || ii.includes(r[o - 1])) && (s === r.length || ii.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function oi(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function si(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function ci(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\/\*.*?\*\//g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(si)), i && c.push(...Object.keys(i).map(si));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = si(e.substring(l, u).trim());
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
		return r && (n += oi(r)), i && (n += oi(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/class.js
function li(e, t, n, r, i, a) {
	var o = e[j];
	if (De || o !== n || o === void 0) {
		var s = ai(n, r, a);
		(!De || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[j] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/style.js
function ui(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function di(e, t, n, r) {
	var i = e[re];
	if (De || i !== t) {
		var a = ci(t, r);
		(!De || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[re] = t;
	} else r && (Array.isArray(r) ? (ui(e, n?.[0], r[0]), ui(e, n?.[1], r[1], "important")) : ui(e, n, r));
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function fi(t, n, r = !1) {
	if (t.multiple) {
		if (n == null) return;
		if (!e(n)) return Te();
		for (var i of t.options) i.selected = n.includes(hi(i));
	} else {
		for (i of t.options) if (tn(hi(i), n)) {
			i.selected = !0;
			return;
		}
		(!r || n !== void 0) && (t.selectedIndex = -1);
	}
}
function pi(e) {
	var t = new MutationObserver(() => {
		"__value" in e && fi(e, e.__value);
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
function mi(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet(), i = !0;
	ct(e, "change", (t) => {
		var i = t ? "[selected]" : ":checked", a;
		if (e.multiple) a = [].map.call(e.querySelectorAll(i), hi);
		else {
			var o = e.querySelector(i) ?? e.querySelector("option:not([disabled])");
			a = o && hi(o);
		}
		n(a), e.__value = a, F !== null && r.add(F);
	}), wn(() => {
		var a = t();
		if (e === document.activeElement) {
			var o = F;
			if (r.has(o)) return;
		}
		if (fi(e, a, i), i && a === void 0) {
			var s = e.querySelector(":checked");
			s !== null && (a = hi(s), n(a));
		}
		e.__value = a, i = !1;
	}), pi(e);
}
function hi(e) {
	return "__value" in e ? e.__value : e.value;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var gi = Symbol("is custom element"), _i = Symbol("is html"), vi = se ? "link" : "LINK", yi = se ? "progress" : "PROGRESS";
function X(e) {
	if (De) {
		var t = !1, n = () => {
			if (!t) {
				if (t = !0, e.hasAttribute("value")) {
					var n = e.value;
					Z(e, "value", null), e.value = n;
				}
				if (e.hasAttribute("checked")) {
					var r = e.checked;
					Z(e, "checked", null), e.checked = r;
				}
			}
		};
		e[ae] = n, qe(n), ot();
	}
}
function bi(e, t) {
	var n = Si(e);
	n.value !== (n.value = t ?? void 0) && (e.value !== t || t === 0 && e.nodeName === yi) && (e.value = t ?? "");
}
function xi(e, t) {
	var n = Si(e);
	n.checked !== (n.checked = t ?? void 0) && (e.checked = t);
}
function Z(e, t, n, r) {
	var i = Si(e);
	De && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === vi) || i[t] !== (i[t] = n) && (t === "loading" && (e[te] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && wi(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function Si(e) {
	return e[ne] ??= {
		[gi]: e.nodeName.includes("-"),
		[_i]: e.namespaceURI === Se
	};
}
var Ci = /* @__PURE__ */ new Map();
function wi(e) {
	var t = e.getAttribute("is") || e.nodeName, n = Ci.get(t);
	if (n) return n;
	Ci.set(t, n = []);
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var s in r = o(i), r) r[s].set && s !== "innerHTML" && s !== "textContent" && s !== "innerText" && n.push(s);
		i = l(i);
	}
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function Ti(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet();
	ct(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = Ei(e) ? Di(a) : a, n(a), F !== null && r.add(F), await fr(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (De && e.defaultValue !== e.value || hr(t) == null && e.value) && (n(Ei(e) ? Di(e.value) : e.value), F !== null && r.add(F)), En(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = F;
			if (r.has(i)) return;
		}
		Ei(e) && n === Di(e.value) || (e.type !== "date" || n || e.value) && n !== e.value && (e.value = n ?? "");
	});
}
function Ei(e) {
	var t = e.type;
	return t === "number" || t === "range";
}
function Di(e) {
	return e === "" ? null : +e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function Oi(e, t) {
	return e === t || e?.[k] === t;
}
function Q(e = {}, t, n, r) {
	var i = Be.r, a = qn;
	return wn(() => {
		var o, s;
		return En(() => {
			o = s, s = r?.() || [], hr(() => {
				Oi(n(...s), e) || (t(e, ...s), o && Oi(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && Oi(n(...s), e) && t(null, ...s);
			}, c = r.teardown;
			r.teardown = () => {
				o(), c?.();
			};
		};
	}), e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/props.js
function ki(e, t, n, r) {
	var i = !0, o = !!(n & 8), s = !!(n & 16), c = r, l = !0, u = void 0, d = () => s && i ? (u ??= /* @__PURE__ */ _t(r), H(u)) : (l && (l = !1, c = s ? hr(r) : r), c);
	let f;
	if (o) {
		var p = k in e || A in e;
		f = a(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	o ? [m, h] = rt(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && he(t), f(m)));
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
	o && H(y);
	var b = qn;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? H(y) : i && o ? $t(e) : e;
			return L(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return Hn && v || b.f & 16384 ? y.v : H(y);
	});
}
function Ai(e) {
	Be === null && ce("onMount"), xn(() => {
		let t = hr(e);
		if (typeof t == "function") return t;
	});
}
function ji(e) {
	Be === null && ce("onDestroy"), Ai(() => () => hr(e));
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region ui/NodeCard.svelte
var Mi = /* @__PURE__ */ G("<span class=\"pc-modifier-badge svelte-1jilz27\"> </span>"), Ni = /* @__PURE__ */ G("<div><span class=\"pc-native-pin-label\"> </span> <div role=\"img\"></div></div>"), Pi = /* @__PURE__ */ G("<div class=\"pc-node-body\"> </div>"), Fi = /* @__PURE__ */ G("<span class=\"pc-native-alias\"> </span>"), Ii = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-node-action pc-host-result\" aria-label=\"Preview host result\"><i class=\"fa-solid fa-eye\" aria-hidden=\"true\"></i> Host result</button>"), Li = /* @__PURE__ */ G("<div role=\"group\" tabindex=\"0\"><div class=\"pc-native-heading\"><svg class=\"pc-native-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path></path></svg><span class=\"pc-node-title\"> </span><!></div> <div class=\"pc-native-pins\"></div> <!> <!> <!></div>");
function Ri(e, t) {
	He(t, !0);
	let n = (e) => e.stopPropagation();
	var r = Li();
	let i;
	var a = R(r), o = R(a), s = R(o);
	N(o);
	var c = B(o), l = R(c, !0);
	N(c);
	var u = B(c), d = (e) => {
		var n = Mi(), r = R(n);
		N(n), V(() => {
			Z(n, "title", t.card.modifierSummary.text), Z(n, "aria-label", t.card.modifierSummary.text), q(r, `+${t.card.modifierSummary.count ?? ""}`);
		}), K(e, n);
	};
	J(u, (e) => {
		t.card.modifierSummary && e(d);
	}), N(a);
	var f = B(a, 2);
	Y(f, 21, () => t.card.ports, (e) => e.id, (e, n) => {
		var r = Ni();
		let i;
		var a = R(r), o = R(a, !0);
		N(a);
		var s = B(a, 2);
		N(r), V(() => {
			li(r, 1, `pc-native-row pc-native-row-${H(n).dir}`, "svelte-1jilz27"), i = di(r, "", i, { "grid-row": H(n).row }), q(o, H(n).label), li(s, 1, ri(H(n).className), "svelte-1jilz27"), Z(s, "data-node", t.card.id), Z(s, "data-dir", H(n).dir), Z(s, "data-port", H(n).port), Z(s, "data-side", H(n).side), Z(s, "data-kind", H(n).kind), Z(s, "title", H(n).title), Z(s, "aria-label", H(n).title);
		}), U("mouseenter", s, () => t.actions.hoverPin({
			nodeId: t.card.id,
			dir: H(n).dir,
			port: H(n).port
		})), U("mouseleave", s, () => t.actions.hoverPin(null)), K(e, r);
	}), N(f);
	var p = B(f, 2), m = (e) => {
		var n = Pi(), r = R(n, !0);
		N(n), V(() => q(r, t.card.body)), K(e, n);
	};
	J(p, (e) => {
		t.card.type === "note" && e(m);
	});
	var h = B(p, 2), g = (e) => {
		var n = Fi(), r = R(n, !0);
		N(n), V(() => {
			Z(n, "title", t.card.titleHint), q(r, t.card.title);
		}), K(e, n);
	};
	J(h, (e) => {
		t.card.compact && e(g);
	});
	var _ = B(h, 2), v = (e) => {
		var r = Ii();
		W("mousedown", r, n), W("click", r, (e) => {
			n(e), t.actions.hostResult(t.card.id);
		}), K(e, r);
	};
	J(_, (e) => {
		t.card.hostResult && e(v);
	}), N(r), V(() => {
		li(r, 1, ri(t.card.className), "svelte-1jilz27"), Z(r, "data-id", t.card.id), Z(r, "title", t.card.offHint), Z(r, "aria-label", `${t.card.label}: ${t.card.title}`), i = di(r, "", i, {
			left: `${t.card.x}px`,
			top: `${t.card.y}px`
		}), Z(s, "d", t.card.iconPath), Z(c, "title", t.card.titleHint), q(l, t.card.title);
	}), K(e, r), Ue();
}
wr(["mousedown", "click"]);
//#endregion
//#region ui/GroupCard.svelte
var zi = /* @__PURE__ */ G("<div class=\"pc-node-body\"> </div>"), Bi = /* @__PURE__ */ G("<div role=\"group\"><div><i class=\"fa-solid fa-object-group\" aria-hidden=\"true\"></i> <span> </span> <span class=\"pc-group-frame-count\"> </span> <button type=\"button\"></button></div> <!></div>");
function Vi(e, t) {
	He(t, !0);
	function n(e, n) {
		e.stopPropagation(), e.preventDefault(), t.actions.group(t.group.id, n);
	}
	function r(e, n) {
		e.stopPropagation(), e.detail === 0 && t.actions.group(t.group.id, n);
	}
	var i = Bi();
	let a;
	var o = R(i), s = B(R(o), 2), c = R(s, !0);
	N(s);
	var l = B(s, 2), u = R(l, !0);
	N(l);
	var d = B(l, 2);
	N(o);
	var f = B(o, 2), p = (e) => {
		var n = zi(), r = R(n, !0);
		N(n), V(() => q(r, t.group.body)), K(e, n);
	};
	J(f, (e) => {
		t.group.collapsed && e(p);
	}), N(i), V(() => {
		li(i, 1, ri(t.group.className)), Z(i, "data-group", t.group.id), Z(i, "aria-label", `Group: ${t.group.title}`), a = di(i, "", a, {
			left: `${t.group.x}px`,
			top: `${t.group.y}px`,
			width: `${t.group.w}px`,
			height: t.group.collapsed ? void 0 : `${t.group.h}px`
		}), li(o, 1, ri(t.group.collapsed ? "pc-node-head" : "pc-group-frame-head")), li(s, 1, ri(t.group.collapsed ? "pc-node-title" : "pc-group-frame-title")), q(c, t.group.title), q(u, t.group.count), li(d, 1, `pc-node-action fa-solid pc-group-btn ${t.group.collapsed ? "fa-up-right-and-down-left-from-center" : "fa-down-left-and-up-right-to-center"}`), Z(d, "data-action", t.group.collapsed ? "open" : "collapse"), Z(d, "title", t.group.collapsed ? "Open group" : "Fold group"), Z(d, "aria-label", t.group.collapsed ? "Open group" : "Fold group");
	}), W("mousedown", d, (e) => n(e, t.group.collapsed ? "open" : "collapse")), W("click", d, (e) => r(e, t.group.collapsed ? "open" : "collapse")), K(e, i), Ue();
}
wr(["mousedown", "click"]);
//#endregion
//#region ui/WireLayer.svelte
var Hi = /* @__PURE__ */ Nr("<path class=\"pc-wire-hit\"></path><path><title> </title></path><text text-anchor=\"middle\"> </text>", 1), Ui = /* @__PURE__ */ Nr("<path></path>"), Wi = /* @__PURE__ */ Nr("<!><!>", 1);
function Gi(e, t) {
	He(t, !0);
	var n = Wi(), r = z(n);
	Y(r, 17, () => t.wires, (e) => e.id, (e, t) => {
		var n = Hi(), r = z(n), i = B(r), a = R(i), o = R(a);
		N(a), N(i);
		var s = B(i), c = R(s, !0);
		N(s), V(() => {
			Z(r, "d", H(t).d), Z(r, "data-id", H(t).id), Z(i, "d", H(t).d), li(i, 0, ri(H(t).className)), Z(i, "data-id", H(t).id), Z(i, "data-kind", H(t).kind), q(o, `${H(t).kind ?? ""} artifact`), Z(s, "x", H(t).label.x), Z(s, "y", H(t).label.y), li(s, 0, ri(H(t).label.className)), q(c, H(t).label.text);
		}), K(e, n);
	});
	var i = B(r), a = (e) => {
		var n = Ui();
		V(() => {
			Z(n, "d", t.ghost.d), li(n, 0, ri(t.ghost.className));
		}), K(e, n);
	};
	J(i, (e) => {
		t.ghost && e(a);
	}), K(e, n), Ue();
}
//#endregion
//#region ui/CommentFrame.svelte
var Ki = /* @__PURE__ */ G("<span class=\"pc-comment-title svelte-118xm2r\"> </span>"), qi = /* @__PURE__ */ G("<input class=\"pc-comment-title-input svelte-118xm2r\" aria-label=\"Comment title\"/>"), Ji = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-comment-resize svelte-118xm2r\" title=\"Drag to resize comment\"></button>"), Yi = /* @__PURE__ */ G("<div role=\"group\"><header class=\"pc-comment-header svelte-118xm2r\"><button type=\"button\" class=\"pc-comment-select svelte-118xm2r\" title=\"Drag header to move comment\">⋮⋮</button> <!></header> <div class=\"pc-comment-notes svelte-118xm2r\"> </div> <!></div>");
function Xi(e, t) {
	He(t, !0);
	let n = (e) => e.stopPropagation();
	var r = Yi();
	let i, a;
	var o = R(r), s = R(o), c = B(s, 2), l = (e) => {
		var n = Ki(), r = R(n, !0);
		N(n), V(() => q(r, t.comment.title)), K(e, n);
	}, u = (e) => {
		var r = qi();
		X(r), V(() => bi(r, t.comment.title)), U("focus", r, () => t.actions.select(t.comment.id)), U("pointerdown", r, n, !0), U("mousedown", r, n, !0), U("click", r, n, !0), U("keydown", r, n, !0), W("change", r, (e) => {
			t.comment.readOnly || t.actions.update(t.comment.id, { title: e.currentTarget.value });
		}), K(e, r);
	};
	J(c, (e) => {
		t.comment.readOnly ? e(l) : e(u, -1);
	}), N(o);
	var d = B(o, 2), f = R(d, !0);
	N(d);
	var p = B(d, 2), m = (e) => {
		var n = Ji();
		V(() => Z(n, "aria-label", `Resize comment: ${t.comment.title}`)), W("click", n, (e) => {
			e.detail === 0 && t.actions.select(t.comment.id);
		}), K(e, n);
	};
	J(p, (e) => {
		t.comment.readOnly || e(m);
	}), N(r), V(() => {
		i = li(r, 1, "pc-comment-frame svelte-118xm2r", null, i, {
			"pc-comment-selected": t.comment.selected,
			"pc-comment-readonly": t.comment.readOnly
		}), Z(r, "data-id", t.comment.id), Z(r, "aria-label", `Comment: ${t.comment.title}`), a = di(r, "", a, {
			left: `${t.comment.x}px`,
			top: `${t.comment.y}px`,
			width: `${t.comment.w}px`,
			height: `${t.comment.h}px`,
			"--frame-color": t.comment.color
		}), Z(s, "aria-label", `Select comment: ${t.comment.title}`), q(f, t.comment.content);
	}), W("click", s, (e) => {
		e.detail === 0 && t.actions.select(t.comment.id);
	}), K(e, r), Ue();
}
wr(["click", "change"]);
//#endregion
//#region ui/NodeProfilePicker.svelte
var Zi = /* @__PURE__ */ G("<div class=\"node-model-meta svelte-jdmiua\"> </div>"), Qi = /* @__PURE__ */ Nr("<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-jdmiua\"><path d=\"m5 12 4 4L19 6\" class=\"svelte-jdmiua\"></path></svg>"), $i = /* @__PURE__ */ G("<button type=\"button\" role=\"option\"><span class=\"profile-option-copy svelte-jdmiua\"><span class=\"profile-name svelte-jdmiua\"> </span><span class=\"profile-meta svelte-jdmiua\"> </span></span><span class=\"profile-check svelte-jdmiua\"><!></span></button>"), ea = /* @__PURE__ */ G("<div class=\"profile-error svelte-jdmiua\" role=\"alert\"> </div>"), ta = /* @__PURE__ */ G("<div class=\"profile-menu svelte-jdmiua\"><div class=\"profile-search svelte-jdmiua\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-jdmiua\"><circle cx=\"10\" cy=\"10\" r=\"6\" class=\"svelte-jdmiua\"></circle><path d=\"m15 15 5 5\" class=\"svelte-jdmiua\"></path></svg><input role=\"combobox\" aria-label=\"Search connection profiles\" aria-autocomplete=\"list\" aria-expanded=\"true\" placeholder=\"Search connection profiles…\" autocomplete=\"off\" spellcheck=\"false\" maxlength=\"200\" class=\"svelte-jdmiua\"/></div> <div class=\"profile-options svelte-jdmiua\" role=\"listbox\" aria-label=\"Connection profiles\"></div> <!></div>"), na = /* @__PURE__ */ G("<div class=\"pc-node-profile svelte-jdmiua\" role=\"group\" aria-label=\"Node connection profile\"><!> <div class=\"profile-picker svelte-jdmiua\"><button type=\"button\" class=\"profile-bar svelte-jdmiua\" aria-haspopup=\"listbox\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-jdmiua\"><path d=\"M12 22v-5M15 8V2M17 8a1 1 0 0 1 1 1v4a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1zM9 8V2\" class=\"svelte-jdmiua\"></path></svg><span class=\"profile-value svelte-jdmiua\"> </span><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-jdmiua\"><path d=\"m6 9 6 6 6-6\" class=\"svelte-jdmiua\"></path></svg></button> <!></div></div>");
function ra(e, t) {
	He(t, !0);
	let n = /* @__PURE__ */ I(!1), r = /* @__PURE__ */ I(""), i = /* @__PURE__ */ I(0), a = /* @__PURE__ */ I(""), o = /* @__PURE__ */ I(!1), s = -1, c = 0, l = !1, u = /* @__PURE__ */ I(35), d, f, p = /* @__PURE__ */ I(void 0), m = /* @__PURE__ */ I(void 0), h = (e) => e.stopPropagation();
	function g(e) {
		let t = (e) => {
			ne(e);
		}, n = (t) => {
			t.detail !== e && ee();
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
	let _ = /* @__PURE__ */ P(() => H(r).toLocaleLowerCase().trim().split(/\s+/).filter(Boolean)), v = /* @__PURE__ */ P(() => [...t.row.options.filter((e) => e.active), ...t.row.options.filter((e) => !e.active && H(_).every((t) => `${e.label} ${e.apiLabel} ${e.model}`.toLocaleLowerCase().includes(t)))]), y = /* @__PURE__ */ P(() => Math.max(1, Math.min(330, t.row.visibleBounds.w - 16))), b = /* @__PURE__ */ P(() => Math.max(t.row.visibleBounds.x + 8, Math.min(t.row.x, t.row.visibleBounds.x + t.row.visibleBounds.w - H(y) - 8)) - t.row.x), x = /* @__PURE__ */ P(() => t.row.h + t.row.clearance + 7), S = /* @__PURE__ */ P(() => t.row.visibleBounds.y + t.row.visibleBounds.h - (t.row.y + H(x) + H(u) + 6) - 8), C = /* @__PURE__ */ P(() => t.row.y + H(x) - t.row.visibleBounds.y - 14), w = /* @__PURE__ */ P(() => H(S) < 130 && H(C) > H(S)), T = /* @__PURE__ */ P(() => Math.max(H(C), H(S)) < 78), E = /* @__PURE__ */ P(() => Math.max(0, Math.min(244, (H(T) ? t.row.visibleBounds.h - 16 : H(w) ? H(C) : H(S)) - 54))), D = /* @__PURE__ */ P(() => t.row.visibleBounds.y + 8 - t.row.y - H(x)), O = (e) => `${t.row.id}-profile-option-${e}`;
	function ee(e = !1, t = !1) {
		t || (c++, l = !1), L(n, !1), L(r, ""), L(a, ""), L(o, !1), e && f?.focus({ preventScroll: !0 });
	}
	async function k() {
		if (!t.row.editable) return;
		let e = t.row.selection.selectionKey;
		if (await t.refreshProfiles?.(t.row.selection), !t.row.editable || !d?.isConnected || t.row.selection.selectionKey !== e) return;
		let c = f.getBoundingClientRect(), l = c.width > 0 && t.row.w > 0 ? c.width / t.row.w : 1;
		L(u, c.height > 0 ? c.height / l : 35, !0), window.dispatchEvent(new CustomEvent("pc-node-profile-open", { detail: d })), s = t.row.authorityVersion, L(r, ""), L(a, ""), L(o, !1), L(i, Math.max(0, H(v).findIndex((e) => e.value === t.row.value)), !0), L(n, !0), await fr(), H(n) && (H(p)?.focus({ preventScroll: !0 }), H(m) && (H(m).scrollTop = 0));
	}
	function A() {
		let e = H(v).find((e) => e.active);
		L(i, !H(_).length || e && H(_).every((t) => e.label.toLocaleLowerCase().includes(t)) ? 0 : H(v).length > 1 ? 1 : -1, !0), H(m) && (H(m).scrollTop = 0);
	}
	async function te(e) {
		if (!H(n) || !t.row.editable || H(o) || t.row.authorityVersion !== s || !t.editProfile) return;
		let r = s, i = t.row.selection, u = c;
		L(o, !0), L(a, ""), l = !0;
		try {
			let o = await t.editProfile(i, e.value);
			if (o.ok) {
				c === u && d?.isConnected && t.row.selection.selectionKey === i.selectionKey && JSON.stringify(t.row.selection.address) === JSON.stringify(i.address) && (!H(n) || s === r) && ee(!0);
				return;
			}
			if (!H(n) || t.row.authorityVersion !== r) return;
			L(a, o.error.message, !0);
		} catch (e) {
			H(n) && t.row.authorityVersion === r && L(a, e instanceof Error ? e.message : "Could not change connection profile", !0);
		} finally {
			t.row.authorityVersion === r && L(o, !1), c === u && (l = !1);
		}
	}
	async function ne(e) {
		h(e), H(n) ? e.key === "Escape" ? (e.preventDefault(), ee(!0)) : e.key === "ArrowDown" || e.key === "ArrowUp" ? (e.preventDefault(), L(i, Math.max(0, Math.min(H(v).length - 1, H(i) + (e.key === "ArrowDown" ? 1 : -1))), !0), await fr(), H(m)?.querySelector(".is-active")?.scrollIntoView?.({ block: "nearest" }), H(p)?.focus({ preventScroll: !0 })) : e.key === "Enter" && e.target === H(p) && (e.preventDefault(), H(v)[H(i)] && await te(H(v)[H(i)])) : [
			"ArrowDown",
			"ArrowUp",
			"Enter",
			" "
		].includes(e.key) && (e.preventDefault(), await k());
	}
	function j(e) {
		e.preventDefault(), h(e), H(m) && (H(m).scrollTop += e.deltaY * (e.deltaMode === 1 ? 18 : e.deltaMode === 2 ? H(m).clientHeight : 1));
	}
	xn(() => {
		H(n) && (t.row.authorityVersion !== s || !t.row.editable) && ee(!1, !0);
	});
	var re = na();
	U("pointerdown", rn, (e) => {
		(H(n) || l) && !d.contains(e.target) && ee();
	});
	let ie;
	var ae = R(re), oe = (e) => {
		var n = Zi(), r = R(n, !0);
		N(n), V(() => {
			Z(n, "title", t.row.model), q(r, t.row.model);
		}), K(e, n);
	};
	J(ae, (e) => {
		t.row.model && e(oe);
	});
	var se = B(ae, 2);
	let ce;
	var le = R(se), ue = B(R(le)), de = R(ue, !0);
	N(ue), je(), N(le), Q(le, (e) => f = e, () => f);
	var fe = B(le, 2), pe = (e) => {
		var n = ta();
		let s;
		var c = R(n), l = B(R(c));
		X(l), Q(l, (e) => L(p, e), () => H(p)), N(c);
		var d = B(c, 2);
		let f;
		Y(d, 23, () => H(v), (e) => e.value, (e, n, r) => {
			var a = $i();
			let s;
			var c = R(a), l = R(c), u = R(l, !0);
			N(l);
			var d = B(l), f = R(d, !0);
			N(d), N(c);
			var p = B(c), m = R(p), h = (e) => {
				K(e, Qi());
			};
			J(m, (e) => {
				H(n).value === t.row.value && e(h);
			}), N(p), N(a), V((e, c) => {
				Z(a, "id", e), s = li(a, 1, "profile-option svelte-jdmiua", null, s, { "is-active": H(r) === H(i) }), Z(a, "aria-selected", H(n).value === t.row.value), a.disabled = H(o), Z(l, "title", H(n).label), q(u, H(n).label), q(f, c);
			}, [() => O(H(r)), () => H(n).active ? "Follows SillyTavern’s current model" : [H(n).apiLabel, H(n).model].filter(Boolean).join(" · ")]), W("click", a, () => te(H(n))), K(e, a);
		}), N(d), Q(d, (e) => L(m, e), () => H(m));
		var h = B(d, 2), g = (e) => {
			var t = ea(), n = R(t, !0);
			N(t), V(() => q(n, H(a))), K(e, t);
		};
		J(h, (e) => {
			H(a) && e(g);
		}), N(n), V((e) => {
			s = di(n, "", s, {
				width: `${H(y)}px`,
				left: `${H(b)}px`,
				top: H(T) ? `${H(D)}px` : H(w) ? "auto" : `${H(u) + 6}px`,
				bottom: !H(T) && H(w) ? `${H(u) + 6}px` : "auto"
			}), Z(l, "aria-controls", `${t.row.id}-profile-list`), Z(l, "aria-activedescendant", e), Z(d, "id", `${t.row.id}-profile-list`), f = di(d, "", f, { "max-height": `${H(E)}px` });
		}, [() => H(i) >= 0 && H(v).length ? O(H(i)) : void 0]), W("input", l, A), Ti(l, () => H(r), (e) => L(r, e)), U("wheel", d, j), K(e, n);
	};
	J(fe, (e) => {
		H(n) && e(pe);
	}), N(se), N(re), Q(re, (e) => d = e, () => d), ei(re, (e) => g?.(e)), V(() => {
		Z(re, "data-id", t.row.id), ie = di(re, "", ie, {
			left: `${t.row.x}px`,
			top: `${t.row.y}px`,
			width: `${t.row.w}px`,
			"z-index": H(n) ? 20 : 2
		}), ce = di(se, "", ce, { top: `${H(x)}px` }), Z(le, "title", t.row.label), Z(le, "aria-label", `Connection profile: ${t.row.label}`), Z(le, "aria-expanded", H(n)), le.disabled = !t.row.editable, q(de, t.row.label);
	}), U("wheel", re, h), W("click", le, () => H(n) ? ee() : k()), K(e, re), Ue();
}
wr(["click", "input"]);
//#endregion
//#region ui/CanvasLayer.svelte
var ia = /* @__PURE__ */ G("<div class=\"pc-viewport\" data-pc-renderer=\"svelte\"><div class=\"pc-comment-layer svelte-o7b704\"></div> <svg class=\"pc-wires\" aria-label=\"Canvas connections\"><!></svg> <div class=\"pc-nodes\"><!> <!> <!></div> <div class=\"pc-node-profile-layer svelte-o7b704\"></div></div>");
function aa(e, t) {
	He(t, !0);
	let n = /* @__PURE__ */ I([]), r = /* @__PURE__ */ I([]), i = /* @__PURE__ */ I([]), a = /* @__PURE__ */ I([]), o = /* @__PURE__ */ I([]), s = /* @__PURE__ */ I({
		select() {},
		update() {},
		command() {}
	}), c = /* @__PURE__ */ I(null), l = /* @__PURE__ */ I({
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
		L(a, e), L(s, t);
	}
	function g(e) {
		L(n, e);
	}
	function _(e) {
		L(o, e);
	}
	function v(e) {
		L(r, e);
	}
	function y(e, t, n) {
		L(i, e), L(l, t), L(c, n);
	}
	function b(e, t) {
		let i = new Map(e.map((e) => [e.id, e])), o = new Map(t.map((e) => [e.id, e]));
		L(n, H(n).map((e) => i.has(e.id) ? {
			...e,
			...i.get(e.id)
		} : e)), L(a, H(a).map((e) => i.has(e.id) ? {
			...e,
			...i.get(e.id)
		} : e)), L(r, H(r).map((e) => o.has(e.id) ? {
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
	}, S = ia(), C = R(S);
	Y(C, 21, () => H(a), (e) => e.id, (e, t) => {
		Xi(e, {
			get comment() {
				return H(t);
			},
			get actions() {
				return H(s);
			}
		});
	}), N(C), Q(C, (e) => p = e, () => p);
	var w = B(C, 2);
	Gi(R(w), {
		get wires() {
			return H(i);
		},
		get ghost() {
			return H(c);
		}
	}), N(w), Q(w, (e) => d = e, () => d);
	var T = B(w, 2), E = R(T);
	Y(E, 17, () => H(r).filter((e) => !e.collapsed), (e) => e.id, (e, n) => {
		Vi(e, {
			get group() {
				return H(n);
			},
			get actions() {
				return t.actions;
			}
		});
	});
	var D = B(E, 2);
	Y(D, 17, () => H(n), (e) => e.id, (e, n) => {
		Ri(e, {
			get card() {
				return H(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), Y(B(D, 2), 17, () => H(r).filter((e) => e.collapsed), (e) => e.id, (e, n) => {
		Vi(e, {
			get group() {
				return H(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), N(T), Q(T, (e) => f = e, () => f);
	var O = B(T, 2);
	return Y(O, 21, () => H(o), (e) => e.id, (e, n) => {
		ra(e, {
			get row() {
				return H(n);
			},
			get editProfile() {
				return t.actions.editProfile;
			},
			get refreshProfiles() {
				return t.actions.refreshProfiles;
			}
		});
	}), N(O), N(S), Q(S, (e) => u = e, () => u), V(() => {
		Z(w, "width", H(l).w), Z(w, "height", H(l).h), Z(w, "viewBox", `0 0 ${H(l).w} ${H(l).h}`);
	}), K(e, S), Ue(x);
}
//#endregion
//#region ui/workspace-menu-model.ts
var $ = (e, t, n = "", r = !1, i = "") => ({
	label: e,
	command: t,
	icon: n,
	disabled: r,
	shortcut: i
}), oa = (e, t, n, r = !1, i = "check") => ({
	label: e,
	command: t,
	checked: n,
	disabled: r,
	kind: i
});
function sa(e, t = {
	previewOpen: !0,
	shelfOpen: !0
}) {
	let n = e.menuCapabilities ?? {}, r = e.rootWorkflow ?? e.workflow, i = e.outputPreview, a = !!e.readOnly, o = !!r?.ownedBusy, s = !!r && [
		"unified",
		"pre",
		"post"
	].includes(r.phase), c = r?.phase === "unified" ? "Assign workflow" : `Assign legacy ${r?.phase ?? ""} phase`;
	return [
		{
			name: "File",
			groups: [
				[
					$("New workflow", "new", "add"),
					$("Open workflow…", "open-workflow", "open"),
					$("Examples…", "examples", "library")
				],
				[
					$("Save to workspace", "save", "save", !r),
					$("Duplicate workflow", "duplicate", "duplicate", !r),
					$("Rename workflow…", "rename", "rename", !r)
				],
				[$("Import into current graph…", "import-into-graph", "open", a), $("Export portable workflow…", "export", "export", !r)],
				[{
					...$("Delete workflow…", "delete", "delete", !r),
					tone: "danger"
				}, $("Close workspace", "close", "close")]
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
					oa("Show Details", "inspector", !!e.inspectorOpen),
					oa("Show preview", "toggle-preview", t.previewOpen),
					oa("Show node shelf", "toggle-shelf", t.shelfOpen)
				],
				[oa("Follow selection", "follow-preview", i?.followSelection ?? !0, !i, "radio"), oa("Pin current output", "pin-preview", !!i?.pinned, !i?.selectedKey || i?.status === "removed", "radio")],
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
					oa("Select tool", "select-tool", e.camera?.mode !== "pan", !1, "radio"),
					oa("Pan tool", "pan-tool", e.camera?.mode === "pan", !1, "radio"),
					oa("Compact cards", "compact-selection", !!n.compactChecked, !n.compact)
				]
			]
		},
		{
			name: "Workflow",
			groups: [
				[
					$(c, "assign-workflow-phase", "assign", !s || !!r?.assigned || o),
					$("Clear assignment", "clear-workflow-assignment", "clear", !s || !r?.assigned || o),
					oa("Arm workflow", "arm-workflow", !!e.armed, !r)
				],
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
					children: [
						$("Workflow Data…", "story-documents", "library"),
						$("Fast connections…", "fast-connections", "connect"),
						$("Recall arms…", "recall-arms", "arm")
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
var ca = /* @__PURE__ */ new Set([
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
	"fast-connections",
	"story-documents",
	"recall-arms"
]), la = {
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
}, ua = /* @__PURE__ */ Nr("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" focusable=\"false\"><path></path></svg>"), da = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-workspace-menu-item\" tabindex=\"-1\"><span class=\"pc-workspace-menu-icon\" aria-hidden=\"true\"><!></span> <span class=\"pc-workspace-menu-state\" aria-hidden=\"true\"> </span> <span class=\"pc-workspace-menu-label\"> </span> <kbd aria-hidden=\"true\"> </kbd> <span class=\"pc-workspace-menu-caret\" aria-hidden=\"true\"> </span></button>"), fa = /* @__PURE__ */ G("<button type=\"button\" role=\"menuitem\" class=\"pc-flat-menu\" aria-haspopup=\"menu\"> </button>"), pa = /* @__PURE__ */ G("<div class=\"pc-workspace-menu-separator\" role=\"separator\"></div>"), ma = /* @__PURE__ */ G("<!> <!>", 1), ha = /* @__PURE__ */ G("<div id=\"pc-workspace-submenu\" class=\"pc-workspace-menu-panel pc-workspace-submenu\" role=\"menu\" tabindex=\"-1\"><!></div>"), ga = /* @__PURE__ */ G("<div id=\"pc-workspace-menu\" class=\"pc-workspace-menu-panel\" role=\"menu\" tabindex=\"-1\"></div> <!>", 1), _a = /* @__PURE__ */ G("<div class=\"pc-workspace-menus\" role=\"menubar\" tabindex=\"-1\" aria-label=\"Workspace menus\"><!> <!></div>");
function va(e, t) {
	He(t, !0);
	let n = (e, t = d, n = d) => {
		var r = Fr();
		Y(z(r), 17, t, Gr, (e, t) => {
			var r = da(), i = R(r), a = R(i), o = (e) => {
				var n = ua(), r = R(n);
				N(n), V(() => Z(r, "d", la[H(t).icon])), K(e, n);
			};
			J(a, (e) => {
				H(t).icon && la[H(t).icon] && e(o);
			}), N(i);
			var s = B(i, 2), c = R(s, !0);
			N(s);
			var l = B(s, 2), u = R(l, !0);
			N(l);
			var d = B(l, 2), p = R(d, !0);
			N(d);
			var m = B(d, 2), h = R(m, !0);
			N(m), N(r), V(() => {
				Z(r, "role", H(t).kind === "radio" ? "menuitemradio" : H(t).kind === "check" ? "menuitemcheckbox" : "menuitem"), Z(r, "aria-label", H(t).label), Z(r, "aria-disabled", !!H(t).disabled), Z(r, "aria-checked", H(t).kind ? !!H(t).checked : void 0), Z(r, "aria-haspopup", H(t).children ? "menu" : void 0), Z(r, "aria-expanded", H(t).children ? H(f) === H(t) : void 0), Z(r, "aria-controls", H(t).children && H(f) === H(t) ? "pc-workspace-submenu" : void 0), Z(r, "data-command", H(t).command), Z(r, "data-tone", H(t).tone), r.disabled = H(t).disabled, q(c, H(t).checked ? H(t).kind === "radio" ? "●" : "✓" : ""), q(u, H(t).label), q(p, H(t).shortcut ?? ""), q(h, H(t).children ? "›" : "");
			}), W("click", r, (e) => D(H(t), e.currentTarget)), U("pointerenter", r, (e) => {
				n() || (H(t).children ? E(H(t), e.currentTarget) : L(f, null));
			}), K(e, r);
		}), K(e, r);
	}, r = /* @__PURE__ */ P(() => sa(t.state, t.panels)), i = /* @__PURE__ */ I(""), a = /* @__PURE__ */ I(0), o, s = /* @__PURE__ */ I(null), c = /* @__PURE__ */ I(null), l = null, u = null, f = /* @__PURE__ */ I(null), p = /* @__PURE__ */ I(0), m = /* @__PURE__ */ I(0), h = /* @__PURE__ */ I(0), g = /* @__PURE__ */ I(0), _ = 0, v = "", y = "", b = 0, x = /* @__PURE__ */ P(() => `${t.state.graphId}:${t.state.graphViews?.active.key ?? ""}:${t.state.graphViews?.viewEpoch ?? ""}`);
	xn(() => {
		H(i) && v !== H(x) && C();
	});
	let S = (e) => e ? [...e.querySelectorAll("button:not(:disabled)")] : [];
	function C(e = !1) {
		_++, L(i, ""), L(f, null), y = "", e && l?.isConnected && l.focus({ preventScroll: !0 });
	}
	function w(e, t, n = !1) {
		let r = e.getBoundingClientRect(), i = window.innerWidth, a = window.innerHeight, o = n ? t.right - 1 : t.left, s = n ? t.top : t.bottom + 2;
		return n && o + r.width > i - 4 && (o = t.left - r.width + 1, o < 4 && (o = t.left, s = t.bottom + r.height <= a - 4 ? t.bottom : t.top - r.height)), {
			x: Math.max(4, Math.min(o, i - r.width - 4)),
			y: Math.max(4, Math.min(s, a - r.height - 4))
		};
	}
	async function T(e, t, n = "first", o = !1) {
		if (H(i) === e && o) {
			C(!0);
			return;
		}
		L(i, e, !0), L(f, null), l = t, L(a, H(r).findIndex((t) => t.name === e), !0), v = H(x), y = "";
		let c = ++_;
		if (await fr(), c !== _ || !H(s)) return;
		let u = w(H(s), t.getBoundingClientRect());
		L(p, u.x, !0), L(m, u.y, !0), n && (n === "last" ? S(H(s)).at(-1) : S(H(s))[0])?.focus();
	}
	async function E(e, t, n = !1) {
		if (e.disabled || !e.children || !H(i)) return;
		L(f, e), u = t, y = "";
		let r = _;
		if (await fr(), r !== _ || !H(c) || H(f) !== e) return;
		let a = w(H(c), t.getBoundingClientRect(), !0);
		L(h, a.x, !0), L(g, a.y, !0), n && S(H(c))[0]?.focus();
	}
	function D(e, n) {
		if (e.disabled || v !== H(x)) return;
		if (e.children) {
			E(e, n, !0);
			return;
		}
		let r = e.command;
		C(!0), ca.has(r) ? t.local(r) : r === "arm-workflow" ? t.actions.arm(!t.state.armed) : r === "select-tool" || r === "pan-tool" ? t.actions.mode(r === "select-tool" ? "select" : "pan") : r === "zoom-in" || r === "zoom-out" ? t.actions.zoom(r === "zoom-in" ? 1.15 : 1 / 1.15) : r === "fit-selection" ? t.actions.fitSelection() : t.actions.command(r);
	}
	function O(e) {
		return o.querySelector(`[data-menu="${H(r)[e].name}"]`);
	}
	function ee(e) {
		if (!H(i) && (e.ctrlKey || e.metaKey)) return;
		e.stopPropagation();
		let t = e.target, n = t.hasAttribute("data-menu");
		if (e.key === "Tab") {
			H(i) && C(!0);
			return;
		}
		if (e.key === "Escape") {
			H(i) && (e.preventDefault(), C(!0));
			return;
		}
		let o = t.closest("[role=\"menu\"]") ?? H(s), l = o === H(c) && !!H(f), d = S(o), p = d.indexOf(t);
		if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
			if (e.preventDefault(), l) {
				e.key === "ArrowLeft" && (L(f, null), u?.focus());
				return;
			}
			if (!n && e.key === "ArrowRight") {
				let e = H(r).find((e) => e.name === H(i))?.groups.flat().find((e) => e.command === t.dataset.command);
				if (e?.children) {
					E(e, t, !0);
					return;
				}
			}
			let o = (H(a) + (e.key === "ArrowRight" ? 1 : H(r).length - 1)) % H(r).length;
			L(a, o), H(i) ? T(H(r)[o].name, O(o)) : O(o).focus();
		} else if ([
			"ArrowDown",
			"ArrowUp",
			"Home",
			"End"
		].includes(e.key)) e.preventDefault(), n ? e.key === "Home" || e.key === "End" ? (L(a, e.key === "Home" ? 0 : H(r).length - 1, !0), O(H(a)).focus()) : T(t.dataset.menu, t, e.key === "ArrowUp" ? "last" : "first") : (l || L(f, null), d[e.key === "Home" ? 0 : e.key === "End" ? d.length - 1 : (p + (e.key === "ArrowUp" ? d.length - 1 : 1)) % d.length]?.focus());
		else if (e.key === "Enter" || e.key === " ") e.preventDefault(), t.click();
		else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
			e.preventDefault();
			let t = Date.now();
			y = (t - b > 700 ? "" : y) + e.key.toLowerCase(), b = t;
			let o = y.split("").every((e) => e === y[0]) ? y[0] : y;
			if (n && !H(i)) {
				let e = H(r).findIndex((e, t) => H(r)[(H(a) + t + 1) % H(r).length].name.toLowerCase().startsWith(o));
				e >= 0 && (L(a, (H(a) + e + 1) % H(r).length), O(H(a)).focus());
			} else [...d.slice(p + 1), ...d.slice(0, p + 1)].find((e) => e.getAttribute("aria-label")?.toLowerCase().startsWith(o))?.focus();
		}
	}
	function k(e) {
		H(i) && o?.contains(e.target) && e.stopPropagation();
	}
	var A = _a();
	U("pointerdown", nn, (e) => {
		H(i) && !o.contains(e.target) && C();
	}), U("resize", nn, () => C()), U("keyup", nn, k, !0);
	var te = R(A);
	Y(te, 17, () => H(r), Gr, (e, t, n) => {
		var r = fa(), o = R(r, !0);
		N(r), V(() => {
			Z(r, "data-menu", H(t).name), Z(r, "tabindex", H(a) === n ? 0 : -1), Z(r, "aria-expanded", H(i) === H(t).name), Z(r, "aria-controls", H(i) === H(t).name ? "pc-workspace-menu" : void 0), q(o, H(t).name);
		}), U("focus", r, () => L(a, n, !0)), W("click", r, (e) => T(H(t).name, e.currentTarget, "first", !0)), U("pointerenter", r, (e) => {
			H(i) && H(i) !== H(t).name && T(H(t).name, e.currentTarget);
		}), K(e, r);
	});
	var ne = B(te, 2), j = (e) => {
		var t = ga(), a = z(t);
		let o;
		Y(a, 21, () => H(r).find((e) => e.name === H(i))?.groups ?? [], Gr, (e, t, r) => {
			var i = ma(), a = z(i), o = (e) => {
				K(e, pa());
			};
			J(a, (e) => {
				r && e(o);
			});
			var s = B(a, 2);
			n(s, () => H(t), () => !1), K(e, i);
		}), N(a), Q(a, (e) => L(s, e), () => H(s));
		var l = B(a, 2), u = (e) => {
			var t = ha();
			let r;
			var i = R(t);
			n(i, () => H(f).children, () => !0), N(t), Q(t, (e) => L(c, e), () => H(c)), V(() => {
				Z(t, "aria-label", `${H(f).label} options`), r = di(t, "", r, {
					left: `${H(h)}px`,
					top: `${H(g)}px`
				});
			}), K(e, t);
		};
		J(l, (e) => {
			H(f)?.children && e(u);
		}), V(() => {
			Z(a, "aria-label", H(i)), o = di(a, "", o, {
				left: `${H(p)}px`,
				top: `${H(m)}px`
			});
		}), K(e, t);
	};
	J(ne, (e) => {
		H(i) && e(j);
	}), N(A), Q(A, (e) => o = e, () => o), W("keydown", A, ee), W("keyup", A, k), U("paste", A, k), W("pointerdown", A, k), K(e, A), Ue();
}
wr([
	"click",
	"keydown",
	"keyup",
	"pointerdown"
]);
//#endregion
//#region ui/Toolbar.svelte
var ya = /* @__PURE__ */ G("<option> </option>"), ba = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-btn menu_button pc-root-run\">■ Stop</button>"), xa = /* @__PURE__ */ G("<span class=\"pc-send-guidance\" title=\"Assign and arm the workflow, then Send in SillyTavern.\">Generate with Send</span>"), Sa = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-btn menu_button pc-root-run\">▶ Run</button>"), Ca = /* @__PURE__ */ G("<header class=\"pc-header\" data-pc-ui=\"svelte\"><div class=\"pc-menubar\"><div class=\"pc-brand\"><img width=\"30\" height=\"30\" alt=\"\"/><span>LATTICE</span></div> <!> <button type=\"button\" class=\"pc-btn menu_button pc-close\" title=\"Close\" aria-label=\"Close canvas\">×</button></div> <div class=\"pc-workflow-bar\"><select class=\"pc-select pc-graph-select text_pole\" aria-label=\"Workflow\"></select> <div class=\"pc-header-actions pc-history\"><button type=\"button\" aria-label=\"Undo\">↶</button> <button type=\"button\" aria-label=\"Redo\">↷</button> <span> </span></div> <!> <span class=\"pc-root-workflow-status\" role=\"status\"> </span> <div class=\"pc-header-actions pc-surface-actions\"><button type=\"button\" title=\"Show or hide the inspector\" aria-label=\"Toggle inspector\">Details</button></div> <label class=\"pc-arm\"><input class=\"pc-arm-input\" type=\"checkbox\"/><span>Arm</span></label></div></header>");
function wa(e, t) {
	He(t, !0);
	let n = /* @__PURE__ */ P(() => t.state.rootWorkflow ?? t.state.workflow), r, i, a, o;
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
	}, u = Ca(), d = R(u), f = R(d), p = R(f);
	je(), N(f);
	var m = B(f, 2);
	va(m, {
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
	var h = B(m, 2);
	N(d);
	var g = B(d, 2), _ = R(g);
	Y(_, 21, () => t.state.graphs, (e) => e.id, (e, t) => {
		var n = ya(), r = R(n, !0);
		N(n);
		var i = {};
		V(() => {
			q(r, H(t).name), i !== (i = H(t).id) && (n.value = (n.__value = H(t).id) ?? "");
		}), K(e, n);
	}), N(_), Q(_, (e) => i = e, () => i);
	var v;
	pi(_);
	var y = B(_, 2), b = R(y), x = B(b, 2), S = B(x, 2), C = R(S, !0);
	N(S), N(y);
	var w = B(y, 2), T = (e) => {
		var n = ba();
		W("click", n, () => t.actions.command("stop-workflow")), K(e, n);
	}, E = (e) => {
		K(e, xa());
	}, D = (e) => {
		var r = Sa();
		V((e) => {
			r.disabled = !H(n) || !!H(n).issues.length, Z(r, "title", e);
		}, [() => H(n)?.issues.join("\n") || "Run the root workflow"]), W("click", r, () => t.actions.command("run-workflow")), K(e, r);
	};
	J(w, (e) => {
		H(n)?.ownedBusy || H(n)?.busy ? e(T) : H(n)?.phase === "unified" ? e(E, 1) : e(D, -1);
	});
	var O = B(w, 2), ee = R(O);
	N(O);
	var k = B(O, 2), A = R(k);
	Q(A, (e) => o = e, () => o), N(k);
	var te = B(k, 2), ne = R(te);
	return X(ne), Q(ne, (e) => a = e, () => a), je(), N(te), N(g), N(u), Q(u, (e) => r = e, () => r), V(() => {
		Z(p, "src", t.actions.logoUrl), v !== (v = t.state.graphId) && (_.value = (_.__value = t.state.graphId) ?? "", fi(_, t.state.graphId)), li(b, 1, `pc-btn menu_button pc-undo${t.state.history.undo ? "" : " pc-disabled"}`), b.disabled = !t.state.history.undo, Z(b, "title", t.state.history.undoTitle), li(x, 1, `pc-btn menu_button pc-redo${t.state.history.redo ? "" : " pc-disabled"}`), x.disabled = !t.state.history.redo, Z(x, "title", t.state.history.redoTitle), li(S, 1, `pc-history-note${t.state.history.showNote ? " pc-show" : ""}`), q(C, t.state.history.note), q(ee, `${H(n) ? `${H(n).phase} · ${H(n).assigned ? "Assigned" : "Unassigned"} · ≤ ${H(n).callBound} requests` : "Workflow unavailable"} · Autosave in SillyTavern`), li(A, 1, `pc-btn menu_button pc-pane-toggle${t.state.inspectorOpen ? " pc-on" : ""}`), Z(A, "aria-pressed", t.state.inspectorOpen), xi(ne, t.state.armed);
	}), W("click", h, () => t.actions.command("close")), W("change", _, (e) => t.actions.pickGraph(e.currentTarget.value)), W("click", b, () => t.actions.command("undo")), W("click", x, () => t.actions.command("redo")), W("click", A, () => t.actions.command("inspector")), W("change", ne, (e) => t.actions.arm(e.currentTarget.checked)), K(e, u), Ue(l);
}
wr(["click", "change"]);
//#endregion
//#region ui/PaneDivider.svelte
var Ta = /* @__PURE__ */ G("<div class=\"pc-pane-divider\" role=\"separator\" aria-label=\"Resize preview\" aria-orientation=\"horizontal\" tabindex=\"0\"></div>");
function Ea(e, t) {
	He(t, !0);
	let n = ki(t, "min", 3, 90), r = ki(t, "max", 3, 500), i, a = null, o = (e) => Math.max(n(), Math.min(r(), e));
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
	ji(u);
	var f = Ta();
	U("blur", nn, u), Q(f, (e) => i = e, () => i), V((e, t) => {
		Z(f, "aria-valuemin", n()), Z(f, "aria-valuemax", e), Z(f, "aria-valuenow", t);
	}, [() => Math.round(r()), () => Math.round(t.height)]), W("pointerdown", f, s), W("pointermove", f, c), W("pointerup", f, (e) => l(!1, e.pointerId)), U("pointercancel", f, (e) => l(!0, e.pointerId)), U("lostpointercapture", f, (e) => l(!0, e.pointerId)), W("keydown", f, d), K(e, f), Ue();
}
wr([
	"pointerdown",
	"pointermove",
	"pointerup",
	"keydown"
]);
//#endregion
//#region ui/DetailsDivider.svelte
var Da = /* @__PURE__ */ G("<div class=\"pc-details-divider svelte-1iyzcro\" role=\"separator\" aria-label=\"Resize Details\" aria-orientation=\"vertical\" tabindex=\"0\"></div>");
function Oa(e, t) {
	He(t, !0);
	let n = ki(t, "min", 3, 220), r = ki(t, "max", 3, 520), i, a = null, o = (e) => Math.max(n(), Math.min(r(), e));
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
	ji(c);
	var f = Da();
	U("blur", nn, c), Q(f, (e) => i = e, () => i), V((e, t) => {
		Z(f, "aria-valuemin", n()), Z(f, "aria-valuemax", e), Z(f, "aria-valuenow", t);
	}, [() => Math.round(r()), () => Math.round(t.width)]), W("pointerdown", f, l), W("pointermove", f, u), W("pointerup", f, (e) => s(!1, e.pointerId)), U("pointercancel", f, (e) => s(!0, e.pointerId)), U("lostpointercapture", f, (e) => s(!0, e.pointerId)), W("keydown", f, d), K(e, f), Ue();
}
wr([
	"pointerdown",
	"pointermove",
	"pointerup",
	"keydown"
]);
//#endregion
//#region ui/GraphTabs.svelte
var ka = /* @__PURE__ */ G("<span class=\"pc-graph-tab-lock svelte-7ptwed\" aria-label=\"Read only\">◇</span>"), Aa = /* @__PURE__ */ G("<input type=\"text\" title=\"Enter to save, Escape to cancel\"/>"), ja = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-graph-tab-close svelte-7ptwed\">×</button>"), Ma = /* @__PURE__ */ G("<div><button type=\"button\" role=\"tab\" aria-haspopup=\"menu\"><span class=\"svelte-7ptwed\"> </span><!></button> <!> <!></div>"), Na = /* @__PURE__ */ G("<button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button>"), Pa = /* @__PURE__ */ G("<button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Save workflow</button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close tab</button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close other tabs</button> <!>", 1), Fa = /* @__PURE__ */ G("<!> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close active view</button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close other views</button> <!>", 1), Ia = /* @__PURE__ */ G("<div role=\"menu\" tabindex=\"-1\"><!></div>"), La = /* @__PURE__ */ G("<nav aria-label=\"Open graph views\"><div class=\"pc-graph-tab-list svelte-7ptwed\" role=\"tablist\" aria-label=\"Graph views\"></div> <button type=\"button\" class=\"pc-graph-view-overflow svelte-7ptwed\" aria-label=\"Graph view actions\" title=\"Focus, close or reopen graph views\" aria-haspopup=\"menu\">⋯</button> <!></nav>");
function Ra(e, t) {
	He(t, !0);
	let n = ki(t, "actions", 19, () => ({})), r = ki(t, "idPrefix", 3, "pc-graph-view"), i = /* @__PURE__ */ I(null), a = /* @__PURE__ */ I(null), o = /* @__PURE__ */ I(null), s = /* @__PURE__ */ I(!1), c = /* @__PURE__ */ I(""), l = /* @__PURE__ */ I(""), u = /* @__PURE__ */ I(0), d = /* @__PURE__ */ I(0), f = "", p = /* @__PURE__ */ I(""), m = /* @__PURE__ */ I(""), h = /* @__PURE__ */ I(null), g = "", _ = null, v = 0, y = /* @__PURE__ */ P(() => t.views?.tabs.find((e) => e.key === H(l))), b = {};
	xn(() => {
		let e = t.views?.active.key ?? "";
		f === e ? t.views && !t.views.tabs.some((e) => e.key === H(c)) && L(c, e, !0) : (L(c, e, !0), O(), L(p, "")), H(l) && !H(y) && O(), H(p) && (t.views?.workflowId !== g || !t.views.tabs.some((e) => e.key === H(p))) && L(p, ""), f = e;
	});
	async function x(e) {
		let r = t.views?.tabs.find((t) => t.key === e);
		if (!r || r.identity.kind === "library" || !n().renameView || n().canRenameView?.(e) === !1) return;
		let i = ++v;
		_ = null, O(), g = t.views.workflowId, L(m, r.label, !0), L(p, e, !0), await fr(), H(p) === e && v === i && (_ = H(h), H(h)?.focus({ preventScroll: !0 }), H(h)?.select());
	}
	async function S(e, r, i = !0) {
		let a = H(p), o = t.views?.tabs.find((e) => e.key === a), s = H(m).trim();
		a && e === _ && (L(p, ""), _ = null, r && o && s && s !== o.label && t.views?.workflowId === g && o.identity.kind !== "library" && n().canRenameView?.(a) !== !1 && n().renameView?.(a, s), i && (await fr(), b[a]?.focus({ preventScroll: !0 })));
	}
	function C(e) {
		e.stopPropagation(), !e.isComposing && (e.key === "Enter" || e.key === "Escape") && (e.preventDefault(), S(e.currentTarget, e.key === "Enter"));
	}
	function w(e) {
		let t = e.breadcrumbs.map((e) => e.label).join(" / ") || e.label, n = e.identity;
		return n.kind === "instance" ? `${t} (${n.instancePath.map((e) => JSON.stringify(e)).join(" → ")})` : n.kind === "library" ? `${t} · Library v${n.definitionRef.version} (${n.definitionRef.id})` : t;
	}
	function T(e) {
		L(c, e, !0), n().focusView?.(e), b[e]?.focus({ preventScroll: !0 });
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
		n().closeView?.(e.key), await fr();
		let r = t.views?.active.key;
		r && t.views?.tabs.some((e) => e.key === r) && (L(c, r, !0), b[r]?.focus({ preventScroll: !0 }));
	}
	function O(e = !1) {
		let t = H(l) ? b[H(l)] : H(o);
		L(s, !1), L(l, ""), e && t?.focus({ preventScroll: !0 });
	}
	function ee(e, t) {
		e.preventDefault(), e.stopPropagation(), k(t, e.clientX, e.clientY);
	}
	async function k(e, t, n) {
		if (L(l, e.key, !0), L(u, t, !0), L(d, n, !0), L(s, !0), await fr(), !H(s) || H(l) !== e.key) return;
		let r = H(a)?.getBoundingClientRect();
		L(u, Math.min(Math.max(8, t), Math.max(8, window.innerWidth - (r?.width ?? 0) - 8)), !0), L(d, Math.min(Math.max(8, n), Math.max(8, window.innerHeight - (r?.height ?? 0) - 8)), !0), H(a)?.querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
	}
	async function A() {
		let e = !!H(l);
		L(l, ""), L(s, e || !H(s), !0), H(s) && (await fr(), H(s) && H(a)?.querySelector("button:not(:disabled)")?.focus());
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
		let t = [...H(a).querySelectorAll("button:not(:disabled)")], n = t.indexOf(e.target);
		t[e.key === "Home" ? 0 : e.key === "End" ? t.length - 1 : (n + (e.key === "ArrowUp" ? t.length - 1 : 1)) % t.length]?.focus();
	}
	function ne(e) {
		O(!0), e();
	}
	function j(e) {
		let t = H(y);
		t && (O(!0), e(t));
	}
	var re = { startRename: x }, ie = Fr();
	U("pointerdown", nn, (e) => {
		H(s) && !H(a)?.contains(e.target) && e.target !== H(o) && O();
	}), U("resize", nn, () => O());
	var ae = z(ie), oe = (e) => {
		var f = La();
		let g;
		var _ = R(f);
		Y(_, 23, () => t.views.tabs, (e) => e.key, (e, n, i) => {
			var a = Ma();
			let o;
			var u = R(a);
			let d;
			var f = R(u), g = R(f, !0);
			N(f);
			var _ = B(f), v = (e) => {
				K(e, ka());
			};
			J(_, (e) => {
				H(n).readOnly && e(v);
			}), N(u), Q(u, (e, t) => b[t.key] = e, (e) => b?.[e.key], () => [H(n)]);
			var y = B(u, 2), x = (e) => {
				var t = Aa();
				X(t);
				let r;
				Q(t, (e) => L(h, e), () => H(h)), V(() => {
					r = li(t, 1, "pc-graph-tab-rename svelte-7ptwed", null, r, { "pc-graph-tab-closeable": H(n).identity.kind !== "root" }), Z(t, "aria-label", H(n).identity.kind === "root" ? "Graph name" : "Subgraph name"), Z(t, "maxlength", H(n).identity.kind === "instance" ? 80 : void 0);
				}), W("keydown", t, C), U("blur", t, (e) => S(e.currentTarget, !0, !1)), Ti(t, () => H(m), (e) => L(m, e)), K(e, t);
			};
			J(y, (e) => {
				H(p) === H(n).key && e(x);
			});
			var O = B(y, 2), k = (e) => {
				var r = ja();
				V((e, i) => {
					Z(r, "aria-label", e), Z(r, "title", i), Z(r, "tabindex", H(n).key === (H(c) || t.views.active.key) ? 0 : -1);
				}, [() => `Close ${H(n).label} · ${w(H(n))}`, () => `Close ${w(H(n))}`]), W("click", r, () => D(H(n))), W("contextmenu", r, (e) => ee(e, H(n))), W("keydown", r, (e) => E(e, H(i))), K(e, r);
			};
			J(O, (e) => {
				H(n).identity.kind !== "root" && e(k);
			}), N(a), V((e) => {
				o = li(a, 1, "pc-graph-tab-item svelte-7ptwed", null, o, {
					"pc-graph-tab-active": H(n).key === t.views.active.key,
					"pc-graph-tab-editing": H(p) === H(n).key
				}), d = li(u, 1, "pc-graph-tab svelte-7ptwed", null, d, { "pc-graph-tab-closeable": H(n).identity.kind !== "root" }), Z(u, "id", `${r()}-${H(i)}`), Z(u, "aria-controls", t.panelId), Z(u, "aria-selected", H(n).key === t.views.active.key), Z(u, "aria-expanded", H(s) && H(l) === H(n).key), Z(u, "tabindex", H(p) !== H(n).key && H(n).key === (H(c) || t.views.active.key) ? 0 : -1), Z(u, "title", e), q(g, H(n).label);
			}, [() => w(H(n))]), W("click", u, () => T(H(n).key)), W("pointerdown", u, (e) => {
				e.button === 2 && e.preventDefault();
			}), W("contextmenu", u, (e) => ee(e, H(n))), W("keydown", u, (e) => E(e, H(i))), K(e, a);
		}), N(_);
		var v = B(_, 2);
		Q(v, (e) => L(o, e), () => H(o));
		var O = B(v, 2), k = (e) => {
			var r = Ia();
			let i;
			var o = R(r), s = (e) => {
				let r = /* @__PURE__ */ P(() => H(y)), i = /* @__PURE__ */ P(() => n().canRenameView?.(H(r).key) === !1);
				var a = Pa(), o = z(a), s = B(o, 2), c = R(s, !0);
				N(s);
				var l = B(s, 2), u = R(l, !0);
				N(l);
				var d = B(l, 2), f = B(d, 2);
				Y(B(f, 2), 17, () => t.views.closedViews, (e) => e.key, (e, t) => {
					var r = Na(), i = R(r);
					N(r), V((e, a) => {
						r.disabled = !n().reopenView, Z(r, "title", e), q(i, `Reopen ${H(t).label ?? ""} · ${a ?? ""}`);
					}, [() => w(H(t)), () => w(H(t))]), W("click", r, () => ne(() => n().reopenView?.(H(t).key))), K(e, r);
				}), V((e) => {
					o.disabled = !n().saveView, s.disabled = !n().exportView, q(c, H(r).identity.kind === "root" ? "Export workflow JSON" : "Export subgraph JSON"), l.disabled = H(r).identity.kind === "library" || H(i) || !n().renameView, Z(l, "title", H(r).identity.kind === "library" ? "Library inspection is read only." : H(i) ? "Make a local copy of the containing graph to rename this subgraph." : void 0), q(u, H(r).identity.kind === "root" ? "Rename graph" : "Rename subgraph"), d.disabled = H(r).identity.kind === "root" || !n().closeView, f.disabled = e;
				}, [() => t.views.tabs.every((e) => e.identity.kind === "root" || e.key === H(r).key) || !n().closeOtherViews]), W("click", o, () => j((e) => n().saveView?.(e.key))), W("click", s, () => j((e) => n().exportView?.(e.key))), W("click", l, () => j((e) => x(e.key))), W("click", d, () => j((e) => D(e))), W("click", f, () => j((e) => n().closeOtherViews?.(e.key))), K(e, a);
			}, c = (e) => {
				var r = Fa(), i = z(r);
				Y(i, 17, () => t.views.tabs, (e) => e.key, (e, t) => {
					var n = Na(), r = R(n);
					N(n), V((e, t) => {
						Z(n, "title", e), q(r, `Focus ${t ?? ""}`);
					}, [() => w(H(t)), () => w(H(t))]), W("click", n, () => ne(() => T(H(t).key))), K(e, n);
				});
				var a = B(i, 2), o = B(a, 2);
				Y(B(o, 2), 17, () => t.views.closedViews, (e) => e.key, (e, t) => {
					var r = Na(), i = R(r);
					N(r), V((e, n) => {
						Z(r, "title", e), q(i, `Reopen ${H(t).label ?? ""} · ${n ?? ""}`);
					}, [() => w(H(t)), () => w(H(t))]), W("click", r, () => ne(() => n().reopenView?.(H(t).key))), K(e, r);
				}), V((e) => {
					a.disabled = t.views.active.identity.kind === "root" || !n().closeView, o.disabled = e;
				}, [() => t.views.tabs.every((e) => e.identity.kind === "root" || e.key === t.views.active.key) || !n().closeOtherViews]), W("click", a, () => ne(() => D(t.views.active))), W("click", o, () => ne(() => n().closeOtherViews?.(t.views.active.key))), K(e, r);
			};
			J(o, (e) => {
				H(y) ? e(s) : e(c, -1);
			}), N(r), Q(r, (e) => L(a, e), () => H(a)), V(() => {
				i = li(r, 1, "pc-graph-view-menu svelte-7ptwed", null, i, { "pc-graph-tab-menu": !!H(l) }), di(r, H(l) ? `left: ${H(u)}px; top: ${H(d)}px;` : void 0), Z(r, "aria-label", H(y) ? `Actions for ${H(y).label}` : "Graph view actions");
			}), W("keydown", r, te), K(e, r);
		};
		J(O, (e) => {
			H(s) && e(k);
		}), N(f), Q(f, (e) => L(i, e), () => H(i)), V(() => {
			g = li(f, 1, "pc-graph-tabs pc-graph-tabs-multi svelte-7ptwed", null, g, { "pc-graph-tabs-menu-open": H(s) }), Z(v, "aria-expanded", H(s) && !H(l));
		}), W("click", v, A), K(e, f);
	};
	return J(ae, (e) => {
		t.views && e(oe);
	}), K(e, ie), Ue(re);
}
wr([
	"click",
	"pointerdown",
	"contextmenu",
	"keydown"
]);
//#endregion
//#region ui/GraphBreadcrumbs.svelte
var za = /* @__PURE__ */ G("<span aria-current=\"page\" class=\"svelte-18ovafz\"> </span>"), Ba = /* @__PURE__ */ G("<button type=\"button\" class=\"svelte-18ovafz\"> </button>"), Va = /* @__PURE__ */ G("<li class=\"svelte-18ovafz\"><!></li>"), Ha = /* @__PURE__ */ G("<div class=\"pc-graph-location svelte-18ovafz\"><nav aria-label=\"Graph location\" class=\"svelte-18ovafz\"><ol class=\"svelte-18ovafz\"></ol></nav> <span class=\"pc-graph-scope svelte-18ovafz\"> <!><!></span></div>");
function Ua(e, t) {
	He(t, !0);
	let n = ki(t, "actions", 19, () => ({})), r = /* @__PURE__ */ P(() => t.view?.identity.kind === "library" ? t.view.identity.definitionRef : t.definitionRef ?? t.view?.definitionRef);
	function i(e) {
		return e.identity.kind === "instance" ? !!n().openInstance : !!n().focusView;
	}
	function a(e) {
		e.identity.kind === "instance" ? n().openInstance?.(e.identity.instancePath) : n().focusView?.(e.key);
	}
	var o = Fr(), s = z(o), c = (e) => {
		var n = Ha(), o = R(n), s = R(o);
		Y(s, 23, () => t.view.breadcrumbs, (e) => e.key, (e, n, r) => {
			var o = Va(), s = R(o), c = (e) => {
				var t = za(), r = R(t, !0);
				N(t), V(() => q(r, H(n).label)), K(e, t);
			}, l = (e) => {
				var t = Ba(), r = R(t, !0);
				N(t), V((e) => {
					t.disabled = e, q(r, H(n).label);
				}, [() => !i(H(n))]), W("click", t, () => a(H(n))), K(e, t);
			};
			J(s, (e) => {
				H(r) === t.view.breadcrumbs.length - 1 ? e(c) : e(l, -1);
			}), N(o), K(e, o);
		}), N(s), N(o);
		var c = B(o, 2), l = R(c, !0), u = B(l), d = (e) => {
			var t = Pr();
			V(() => q(t, `· v${H(r).version ?? ""}`)), K(e, t);
		};
		J(u, (e) => {
			H(r) && e(d);
		});
		var f = B(u), p = (e) => {
			K(e, Pr("· Read only"));
		};
		J(f, (e) => {
			(t.view.readOnly || t.view.identity.kind === "library") && e(p);
		}), N(c), N(n), V(() => {
			Z(c, "title", H(r) ? `${H(r).id} · v${H(r).version} · ${H(r).semanticHash}` : void 0), q(l, t.view.identity.kind === "library" ? "Library inspection" : "Instance graph");
		}), K(e, n);
	};
	J(s, (e) => {
		t.view && t.view.identity.kind !== "root" && e(c);
	}), K(e, o), Ue();
}
wr(["click"]);
//#endregion
//#region ui/StructuredControl.svelte
var Wa = /* @__PURE__ */ G("<small class=\"svelte-taw2zx\">Rows are available when this JSON has a supported shape.</small>"), Ga = /* @__PURE__ */ G("<label class=\"svelte-taw2zx\"> </label><textarea class=\"pc-structured-raw svelte-taw2zx\" spellcheck=\"false\"></textarea> <!>", 1), Ka = /* @__PURE__ */ G("<option class=\"svelte-taw2zx\"> </option>"), qa = /* @__PURE__ */ G("<label class=\"svelte-taw2zx\">Phase</label><select class=\"svelte-taw2zx\"></select> <label class=\"svelte-taw2zx\">Steps</label><input type=\"number\" min=\"1\" max=\"64\" step=\"1\" class=\"svelte-taw2zx\"/>", 1), Ja = /* @__PURE__ */ G("<label class=\"svelte-taw2zx\">Name</label><input maxlength=\"128\" class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Value</label><input type=\"number\" step=\"any\" class=\"svelte-taw2zx\"/>", 1), Ya = /* @__PURE__ */ G("<label class=\"svelte-taw2zx\">Default (JSON)</label><textarea class=\"svelte-taw2zx\"></textarea>", 1), Xa = /* @__PURE__ */ G("<label class=\"svelte-taw2zx\">Name</label><input class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Path (JSON array)</label><input class=\"svelte-taw2zx\"/> <label class=\"pc-structured-check svelte-taw2zx\"><input type=\"checkbox\" class=\"svelte-taw2zx\"/> Required</label> <label class=\"pc-structured-check svelte-taw2zx\"><input type=\"checkbox\" class=\"svelte-taw2zx\"/> Use default when missing</label><small class=\"svelte-taw2zx\">Defaults apply when Required is off.</small> <!>", 1), Za = /* @__PURE__ */ G("<label class=\"svelte-taw2zx\">ID</label><input maxlength=\"128\" class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Label</label><input maxlength=\"80\" class=\"svelte-taw2zx\"/>", 1), Qa = /* @__PURE__ */ G("<label class=\"svelte-taw2zx\">Name</label><input class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Text</label><textarea class=\"svelte-taw2zx\"></textarea>", 1), $a = /* @__PURE__ */ G("<label class=\"svelte-taw2zx\">Kind</label><select class=\"svelte-taw2zx\"><option class=\"svelte-taw2zx\">Literal</option><option class=\"svelte-taw2zx\">Regular expression</option></select> <label class=\"svelte-taw2zx\">Pattern</label><input class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Replacement</label><textarea class=\"svelte-taw2zx\"></textarea> <label class=\"svelte-taw2zx\">Flags</label><input class=\"svelte-taw2zx\"/>", 1), eo = /* @__PURE__ */ G("<button type=\"button\" class=\"svelte-taw2zx\">Move up</button><button type=\"button\" class=\"svelte-taw2zx\">Move down</button>", 1), to = /* @__PURE__ */ G("<fieldset class=\"pc-structured-row svelte-taw2zx\"><legend class=\"svelte-taw2zx\"> </legend> <!> <div class=\"pc-structured-actions svelte-taw2zx\"><!><button type=\"button\" class=\"svelte-taw2zx\">Remove</button></div></fieldset>"), no = /* @__PURE__ */ G("<div class=\"pc-structured-rows svelte-taw2zx\"></div> <button type=\"button\" class=\"svelte-taw2zx\"> </button>", 1), ro = /* @__PURE__ */ G("<div class=\"pc-structured-control svelte-taw2zx\"><div class=\"pc-structured-mode svelte-taw2zx\"><button type=\"button\" class=\"svelte-taw2zx\"> </button></div> <!></div>");
function io(e, t) {
	He(t, !0);
	let n = ki(t, "disabled", 3, !1), r = ki(t, "error", 3, ""), i = [
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
	let c = /* @__PURE__ */ P(() => t.control.structured === "fields" ? "field" : t.control.structured === "sections" ? "section" : t.control.structured === "slots" ? "slot" : t.control.structured === "numeric-map" ? "value" : t.control.structured === "durations" ? "duration" : "rule"), l = /* @__PURE__ */ P(() => t.control.structured === "fields" ? 128 : t.control.structured === "slots" ? 16 : t.control.structured === "numeric-map" ? 32 : t.control.structured === "durations" ? 5 : 64), u = /* @__PURE__ */ P(() => t.control.structured === "slots" ? 2 : 0);
	function d() {
		try {
			let e = JSON.parse(t.text);
			return o(e) ? t.control.structured === "durations" ? s(e) && Object.entries(e).every(([e, t]) => i.includes(e) && Number.isSafeInteger(t) && Number(t) >= 1 && Number(t) <= 64) ? Object.entries(e).map(([e, t]) => ({
				name: e,
				number: t
			})) : null : t.control.structured === "numeric-map" ? s(e) && Object.keys(e).length <= 32 && Object.values(e).every((e) => typeof e == "number" && Number.isFinite(e)) ? Object.entries(e).map(([e, t]) => ({
				name: e,
				number: t
			})) : null : !Array.isArray(e) || e.length > H(l) ? null : t.control.structured === "fields" ? e.every((e) => s(e) && Object.keys(e).every((e) => [
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
	let f = /* @__PURE__ */ P(d), p = /* @__PURE__ */ I(!1), m = /* @__PURE__ */ P(() => H(p) || !H(f));
	function h(e) {
		n() || (L(p, !0), t.ontext(e));
	}
	function g(e) {
		n() || t.ontext(JSON.stringify(e, null, 2));
	}
	function _(e) {
		g(["numeric-map", "durations"].includes(t.control.structured ?? "") ? Object.fromEntries(e.map((e) => [String(e.name), e.number])) : e);
	}
	function v(e, t, r) {
		!n() && H(f) && _(H(f).map((n, i) => i === e ? {
			...n,
			[t]: r
		} : n));
	}
	function y() {
		if (n() || !H(f) || H(f).length >= H(l)) return;
		let e = 1;
		for (; H(f).some((t) => t.name === H(c) + e || t.id === "context-" + e);) e++;
		_([...H(f), t.control.structured === "fields" ? {
			name: H(c) + e,
			path: []
		} : t.control.structured === "sections" ? {
			name: H(c) + e,
			text: ""
		} : t.control.structured === "slots" ? {
			id: "context-" + e,
			label: "Context " + e
		} : t.control.structured === "numeric-map" ? {
			name: H(c) + e,
			number: 0
		} : t.control.structured === "durations" ? {
			name: i.find((e) => !H(f).some((t) => t.name === e)),
			number: 1
		} : {
			kind: "literal",
			pattern: "text",
			replacement: ""
		}]);
	}
	function b(e, r) {
		let i = r.valueAsNumber;
		!n() && H(f) && (!Number.isFinite(i) || t.control.structured === "durations" && (!Number.isSafeInteger(i) || i < 1 || i > 64) ? r.value = String(H(f)[e].number) : v(e, "number", i));
	}
	function x(e, t) {
		!n() && H(f) && (!t.value.trim() || t.value.length > 128 || H(f).some((n, r) => r !== e && n.name === t.value) ? t.value = String(H(f)[e].name) : v(e, "name", t.value));
	}
	function S(e, r, i) {
		if (!n() && H(f)) try {
			let t = JSON.parse(i);
			if (!o(t)) throw Error("Nonfinite JSON");
			v(e, r, t);
		} catch {
			let n = 0, a = "__structured_json_0__";
			for (; t.text.includes(a);) a = "__structured_json_" + ++n + "__";
			let o = H(f).map((t, n) => n === e ? {
				...t,
				[r]: a
			} : t);
			L(p, !0), t.ontext(JSON.stringify(o, null, 2).replace(JSON.stringify(a), () => i));
		}
	}
	function C(e, t) {
		!n() && H(f) && _(H(f).map((n, r) => {
			if (r !== e) return n;
			let i = { ...n };
			return t ? i.default = null : delete i.default, i;
		}));
	}
	function w(e) {
		!n() && H(f) && H(f).length > H(u) && _(H(f).filter((t, n) => n !== e));
	}
	function T(e, t) {
		if (n() || !H(f) || e + t < 0 || e + t >= H(f).length) return;
		let r = [...H(f)];
		[r[e], r[e + t]] = [r[e + t], r[e]], _(r);
	}
	var E = ro(), D = R(E), O = R(D), ee = R(O, !0);
	N(O), N(D);
	var k = B(D, 2), A = (e) => {
		var i = Ga(), a = z(i), o = R(a);
		N(a);
		var s = B(a);
		it(s);
		var c = B(s, 2), l = (e) => {
			K(e, Wa());
		};
		J(c, (e) => {
			H(f) || e(l);
		}), V(() => {
			Z(a, "for", t.idPrefix + "-raw"), q(o, `${t.control.label ?? ""} (JSON)`), Z(s, "id", t.idPrefix + "-raw"), Z(s, "aria-label", t.control.label), Z(s, "aria-invalid", !!r()), Z(s, "aria-describedby", r() ? t.idPrefix + "-error" : void 0), bi(s, t.text), s.disabled = n();
		}), W("input", s, (e) => h(e.currentTarget.value)), K(e, i);
	}, te = (e) => {
		var r = no(), a = z(r);
		Y(a, 21, () => H(f), Gr, (e, r, a) => {
			var o = to(), s = R(o), l = R(s);
			N(s);
			var d = B(s, 2), p = (e) => {
				var o = qa(), s = z(o), c = B(s);
				Z(c, "aria-label", "Duration " + (a + 1) + " phase"), Y(c, 21, () => i, Gr, (e, t) => {
					var n = Ka(), r = R(n, !0);
					N(n);
					var i = {};
					V((e, a) => {
						n.disabled = e, q(r, a), i !== (i = H(t)) && (n.value = (n.__value = H(t)) ?? "");
					}, [() => H(f).some((e, n) => n !== a && e.name === H(t)), () => H(t)[0].toUpperCase() + H(t).slice(1)]), K(e, n);
				}), N(c);
				var l;
				pi(c);
				var u = B(c, 2), d = B(u);
				X(d), Z(d, "aria-label", "Duration " + (a + 1) + " steps"), V((e, r) => {
					Z(s, "for", t.idPrefix + "-phase-" + a), Z(c, "id", t.idPrefix + "-phase-" + a), c.disabled = n(), l !== (l = e) && (c.value = (c.__value = e) ?? "", fi(c, e)), Z(u, "for", t.idPrefix + "-steps-" + a), Z(d, "id", t.idPrefix + "-steps-" + a), bi(d, r), d.disabled = n();
				}, [() => String(H(r).name), () => Number(H(r).number)]), W("change", c, (e) => x(a, e.currentTarget)), W("change", d, (e) => b(a, e.currentTarget)), K(e, o);
			}, m = (e) => {
				var i = Ja(), o = z(i), s = B(o);
				X(s), Z(s, "aria-label", "Value " + (a + 1) + " name");
				var c = B(s, 2), l = B(c);
				X(l), Z(l, "aria-label", "Value " + (a + 1) + " number"), V((e, r) => {
					Z(o, "for", t.idPrefix + "-name-" + a), Z(s, "id", t.idPrefix + "-name-" + a), bi(s, e), s.disabled = n(), Z(c, "for", t.idPrefix + "-number-" + a), Z(l, "id", t.idPrefix + "-number-" + a), bi(l, r), Z(l, "min", t.control.min), Z(l, "max", t.control.max), l.disabled = n();
				}, [() => String(H(r).name), () => Number(H(r).number)]), W("change", s, (e) => x(a, e.currentTarget)), W("change", l, (e) => b(a, e.currentTarget)), K(e, i);
			}, h = (e) => {
				var i = Xa(), o = z(i), s = B(o);
				X(s), Z(s, "aria-label", "Field " + (a + 1) + " name");
				var c = B(s, 2), l = B(c);
				X(l), Z(l, "aria-label", "Field " + (a + 1) + " path (JSON array)");
				var u = B(l, 2), d = R(u);
				X(d), Z(d, "aria-label", "Field " + (a + 1) + " required"), je(), N(u);
				var f = B(u, 2), p = R(f);
				X(p), Z(p, "aria-label", "Field " + (a + 1) + " use default"), je(), N(f);
				var m = B(f, 3), h = (e) => {
					var i = Ya(), o = z(i), s = B(o);
					it(s), Z(s, "aria-label", "Field " + (a + 1) + " default (JSON)"), V((e) => {
						Z(o, "for", t.idPrefix + "-default-" + a), Z(s, "id", t.idPrefix + "-default-" + a), bi(s, e), s.disabled = n();
					}, [() => JSON.stringify(H(r).default, null, 2)]), W("change", s, (e) => S(a, "default", e.currentTarget.value)), K(e, i);
				}, g = /* @__PURE__ */ P(() => Object.hasOwn(H(r), "default"));
				J(m, (e) => {
					H(g) && e(h);
				}), V((e, i, u) => {
					Z(o, "for", t.idPrefix + "-name-" + a), Z(s, "id", t.idPrefix + "-name-" + a), bi(s, e), s.disabled = n(), Z(c, "for", t.idPrefix + "-path-" + a), Z(l, "id", t.idPrefix + "-path-" + a), bi(l, i), l.disabled = n(), xi(d, H(r).required !== !1), d.disabled = n(), xi(p, u), p.disabled = n();
				}, [
					() => String(H(r).name),
					() => JSON.stringify(H(r).path),
					() => Object.hasOwn(H(r), "default")
				]), W("input", s, (e) => v(a, "name", e.currentTarget.value)), W("change", l, (e) => S(a, "path", e.currentTarget.value)), W("change", d, (e) => v(a, "required", e.currentTarget.checked)), W("change", p, (e) => C(a, e.currentTarget.checked)), K(e, i);
			}, g = (e) => {
				var i = Za(), o = z(i), s = B(o);
				X(s), Z(s, "aria-label", "Slot " + (a + 1) + " ID");
				var c = B(s, 2), l = B(c);
				X(l), Z(l, "aria-label", "Slot " + (a + 1) + " label"), V((e, r) => {
					Z(o, "for", t.idPrefix + "-slot-id-" + a), Z(s, "id", t.idPrefix + "-slot-id-" + a), bi(s, e), s.disabled = n(), Z(c, "for", t.idPrefix + "-slot-label-" + a), Z(l, "id", t.idPrefix + "-slot-label-" + a), bi(l, r), l.disabled = n();
				}, [() => String(H(r).id), () => String(H(r).label)]), W("input", s, (e) => v(a, "id", e.currentTarget.value)), W("input", l, (e) => v(a, "label", e.currentTarget.value)), K(e, i);
			}, _ = (e) => {
				var i = Qa(), o = z(i), s = B(o);
				X(s), Z(s, "aria-label", "Section " + (a + 1) + " name");
				var c = B(s, 2), l = B(c);
				it(l), Z(l, "aria-label", "Section " + (a + 1) + " text"), V((e, r) => {
					Z(o, "for", t.idPrefix + "-name-" + a), Z(s, "id", t.idPrefix + "-name-" + a), bi(s, e), s.disabled = n(), Z(c, "for", t.idPrefix + "-text-" + a), Z(l, "id", t.idPrefix + "-text-" + a), bi(l, r), l.disabled = n();
				}, [() => String(H(r).name), () => String(H(r).text)]), W("input", s, (e) => v(a, "name", e.currentTarget.value)), W("input", l, (e) => v(a, "text", e.currentTarget.value)), K(e, i);
			}, y = (e) => {
				var i = $a(), o = z(i), s = B(o);
				Z(s, "aria-label", "Rule " + (a + 1) + " kind");
				var c = R(s);
				c.value = c.__value = "literal";
				var l = B(c);
				l.value = l.__value = "regex", N(s);
				var u;
				pi(s);
				var d = B(s, 2), f = B(d);
				X(f), Z(f, "aria-label", "Rule " + (a + 1) + " pattern");
				var p = B(f, 2), m = B(p);
				it(m), Z(m, "aria-label", "Rule " + (a + 1) + " replacement");
				var h = B(m, 2), g = B(h);
				X(g), Z(g, "aria-label", "Rule " + (a + 1) + " flags"), V((e, r, i, c) => {
					Z(o, "for", t.idPrefix + "-kind-" + a), Z(s, "id", t.idPrefix + "-kind-" + a), s.disabled = n(), u !== (u = e) && (s.value = (s.__value = e) ?? "", fi(s, e)), Z(d, "for", t.idPrefix + "-pattern-" + a), Z(f, "id", t.idPrefix + "-pattern-" + a), bi(f, r), f.disabled = n(), Z(p, "for", t.idPrefix + "-replacement-" + a), Z(m, "id", t.idPrefix + "-replacement-" + a), bi(m, i), m.disabled = n(), Z(h, "for", t.idPrefix + "-flags-" + a), Z(g, "id", t.idPrefix + "-flags-" + a), bi(g, c), g.disabled = n();
				}, [
					() => String(H(r).kind),
					() => String(H(r).pattern),
					() => String(H(r).replacement ?? ""),
					() => String(H(r).flags ?? "")
				]), W("change", s, (e) => v(a, "kind", e.currentTarget.value)), W("input", f, (e) => v(a, "pattern", e.currentTarget.value)), W("input", m, (e) => v(a, "replacement", e.currentTarget.value)), W("input", g, (e) => v(a, "flags", e.currentTarget.value)), K(e, i);
			};
			J(d, (e) => {
				t.control.structured === "durations" ? e(p) : t.control.structured === "numeric-map" ? e(m, 1) : t.control.structured === "fields" ? e(h, 2) : t.control.structured === "slots" ? e(g, 3) : t.control.structured === "sections" ? e(_, 4) : e(y, -1);
			});
			var E = B(d, 2), D = R(E), O = (e) => {
				var t = eo(), r = z(t), i = B(r);
				V(() => {
					Z(r, "aria-label", "Move " + H(c) + " " + (a + 1) + " up"), r.disabled = n() || a === 0, Z(i, "aria-label", "Move " + H(c) + " " + (a + 1) + " down"), i.disabled = n() || a === H(f).length - 1;
				}), W("click", r, () => T(a, -1)), W("click", i, () => T(a, 1)), K(e, t);
			}, ee = /* @__PURE__ */ P(() => !["numeric-map", "durations"].includes(t.control.structured ?? ""));
			J(D, (e) => {
				H(ee) && e(O);
			});
			var k = B(D);
			N(E), N(o), V((e) => {
				q(l, `${e ?? ""} ${a + 1}`), Z(k, "aria-label", "Remove " + H(c) + " " + (a + 1)), k.disabled = n() || H(f).length <= H(u);
			}, [() => H(c)[0].toUpperCase() + H(c).slice(1)]), W("click", k, () => w(a)), K(e, o);
		}), N(a);
		var o = B(a, 2), s = R(o);
		N(o), V(() => {
			Z(o, "aria-label", "Add " + H(c)), o.disabled = n() || H(f).length >= H(l), q(s, `Add ${H(c) ?? ""}`);
		}), W("click", o, y), K(e, r);
	};
	J(k, (e) => {
		H(m) ? e(A) : H(f) && e(te, 1);
	}), N(E), V(() => {
		Z(E, "data-structured-control", t.control.structured), Z(O, "aria-label", "Edit " + t.control.label + (H(m) ? " as rows" : " as JSON")), O.disabled = n() || H(m) && !H(f), q(ee, H(m) ? "Use rows" : "Edit JSON");
	}), W("click", O, () => {
		!n() && H(f) && L(p, !H(m));
	}), K(e, E), Ue();
}
wr([
	"click",
	"input",
	"change"
]);
//#endregion
//#region ui/DetailControl.svelte
var ao = /* @__PURE__ */ G("<span class=\"pc-control-label svelte-16a137\"> </span> <!>", 1), oo = /* @__PURE__ */ G("<label class=\"pc-detail-check svelte-16a137\"><input type=\"checkbox\" class=\"svelte-16a137\"/> </label>"), so = /* @__PURE__ */ G("<label class=\"svelte-16a137\"><input type=\"radio\" class=\"svelte-16a137\"/><span class=\"svelte-16a137\"> </span></label>"), co = /* @__PURE__ */ G("<span class=\"pc-control-label svelte-16a137\"> </span> <div class=\"pc-control-segments svelte-16a137\" role=\"radiogroup\"></div>", 1), lo = /* @__PURE__ */ G("<option class=\"svelte-16a137\"> </option>"), uo = /* @__PURE__ */ G("<select class=\"svelte-16a137\"></select>"), fo = /* @__PURE__ */ G("<input type=\"number\" class=\"svelte-16a137\"/>"), po = /* @__PURE__ */ G("<textarea class=\"svelte-16a137\"></textarea>"), mo = /* @__PURE__ */ G("<input type=\"text\" class=\"svelte-16a137\"/>"), ho = /* @__PURE__ */ G("<label class=\"svelte-16a137\"> </label> <!>", 1), go = /* @__PURE__ */ G("<button type=\"button\" class=\"svelte-16a137\"> </button>"), _o = /* @__PURE__ */ G("<small class=\"svelte-16a137\"> </small>"), vo = /* @__PURE__ */ G("<p class=\"pc-detail-error svelte-16a137\" role=\"alert\"> </p>"), yo = /* @__PURE__ */ G("<div><!> <!> <!> <!> <!></div>");
function bo(e, t) {
	He(t, !0);
	let n = ki(t, "error", 3, ""), r = ki(t, "disabled", 3, !1), i = ki(t, "pending", 3, !1), a = () => t.control.editor === "enum" && (t.control.options?.length ?? 0) > 1 && (t.control.options?.length ?? 0) <= 3 && t.control.options.every((e) => e.label.length <= 10), o = () => t.control.effective !== void 0 && t.control.effective !== t.text && t.control.source !== "Saved setting" ? t.control.source : "";
	var s = yo();
	let c;
	var l = R(s), u = (e) => {
		var i = ao(), a = z(i), o = R(a, !0);
		N(a), io(B(a, 2), {
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
		}), V(() => q(o, t.control.label)), K(e, i);
	}, d = (e) => {
		var n = oo(), i = R(n);
		X(i);
		var a = B(i, 1, !0);
		N(n), V((e) => {
			Z(i, "aria-label", t.control.label), xi(i, e), i.disabled = r(), q(a, t.control.label);
		}, [() => !!t.control.value]), W("change", i, (e) => {
			r() || t.onvalue(e.currentTarget.checked);
		}), K(e, n);
	}, f = (e) => {
		var n = co(), i = z(n), a = R(i, !0);
		N(i);
		var o = B(i, 2);
		Y(o, 21, () => t.control.options ?? [], (e) => e.value, (e, n) => {
			var i = so(), a = R(i);
			X(a);
			var o = B(a), s = R(o, !0);
			N(o), N(i), V((e) => {
				Z(a, "name", t.idPrefix + "-choice"), Z(a, "aria-label", H(n).label), bi(a, H(n).value), xi(a, e), a.disabled = r(), q(s, H(n).label);
			}, [() => String(t.control.value) === H(n).value]), W("change", a, (e) => {
				!r() && e.currentTarget.checked && t.onvalue(H(n).value);
			}), K(e, i);
		}), N(o), V(() => {
			q(a, t.control.label), Z(o, "aria-label", t.control.label);
		}), K(e, n);
	}, p = /* @__PURE__ */ P(() => a()), m = (e) => {
		var i = ho(), a = z(i), o = R(a, !0);
		N(a);
		var s = B(a, 2), c = (e) => {
			var n = uo();
			Y(n, 21, () => t.control.options ?? [], (e) => e.value, (e, t) => {
				var n = lo(), r = R(n, !0);
				N(n);
				var i = {};
				V(() => {
					q(r, H(t).label), i !== (i = H(t).value) && (n.value = (n.__value = H(t).value) ?? "");
				}), K(e, n);
			}), N(n);
			var i;
			pi(n), V((e) => {
				Z(n, "id", t.idPrefix + "-editor"), Z(n, "aria-label", t.control.label), n.disabled = r(), i !== (i = e) && (n.value = (n.__value = e) ?? "", fi(n, e));
			}, [() => String(t.control.value)]), W("change", n, (e) => {
				r() || t.onvalue(e.currentTarget.value);
			}), K(e, n);
		}, l = (e) => {
			var i = fo();
			X(i), V((e) => {
				Z(i, "id", t.idPrefix + "-editor"), Z(i, "aria-label", t.control.label), Z(i, "min", t.control.min), Z(i, "max", t.control.max), Z(i, "step", t.control.step ?? 1), Z(i, "aria-invalid", !!n()), Z(i, "aria-describedby", n() ? t.idPrefix + "-error" : void 0), bi(i, e), i.disabled = r();
			}, [() => Number(t.control.value)]), W("change", i, (e) => {
				r() || t.onnumber(e.currentTarget);
			}), K(e, i);
		}, u = (e) => {
			var i = po();
			it(i), V(() => {
				Z(i, "id", t.idPrefix + "-editor"), Z(i, "aria-label", t.control.label), Z(i, "aria-invalid", !!n()), Z(i, "aria-describedby", n() ? t.idPrefix + "-error" : void 0), bi(i, t.text), i.disabled = r();
			}), W("input", i, (e) => {
				r() || t.ontext(e.currentTarget.value);
			}), K(e, i);
		}, d = (e) => {
			var n = mo();
			X(n), V(() => {
				Z(n, "id", t.idPrefix + "-editor"), Z(n, "aria-label", t.control.label), bi(n, t.text), n.disabled = r();
			}), W("change", n, (e) => {
				r() || t.onvalue(e.currentTarget.value);
			}), K(e, n);
		}, f = /* @__PURE__ */ P(() => t.control.singleLine && t.control.editor === "text" && !t.text.includes("\n") && !t.text.includes("\r")), p = (e) => {
			var n = po();
			it(n), V(() => {
				Z(n, "id", t.idPrefix + "-editor"), Z(n, "aria-label", t.control.label), bi(n, t.text), n.disabled = r();
			}), W("change", n, (e) => {
				r() || t.onvalue(e.currentTarget.value);
			}), K(e, n);
		};
		J(s, (e) => {
			t.control.editor === "enum" ? e(c) : t.control.editor === "number" ? e(l, 1) : t.control.editor === "json" || t.control.editor === "lines" ? e(u, 2) : H(f) ? e(d, 3) : e(p, -1);
		}), V(() => {
			Z(a, "for", t.idPrefix + "-editor"), q(o, t.control.label);
		}), K(e, i);
	};
	J(l, (e) => {
		t.control.structured && t.control.editor === "json" ? e(u) : t.control.editor === "boolean" ? e(d, 1) : H(p) ? e(f, 2) : e(m, -1);
	});
	var h = B(l, 2), g = (e) => {
		var n = go(), a = R(n, !0);
		N(n), V(() => {
			Z(n, "data-save-control", t.control.key), n.disabled = r() || i(), q(a, i() ? "Validating…" : "Save " + t.control.label);
		}), W("click", n, () => {
			!r() && !i() && t.onsave();
		}), K(e, n);
	};
	J(h, (e) => {
		(t.control.editor === "json" || t.control.editor === "lines") && e(g);
	});
	var _ = B(h, 2), v = (e) => {
		var n = _o(), r = R(n, !0);
		N(n), V(() => q(r, t.control.help)), K(e, n);
	};
	J(_, (e) => {
		t.control.help && e(v);
	});
	var y = B(_, 2), b = (e) => {
		var n = _o(), r = R(n, !0);
		N(n), V(() => q(r, t.control.exposureNote)), K(e, n);
	}, x = (e) => {
		var n = _o(), r = R(n);
		N(n), V((e) => q(r, `${e ?? ""} · Effective: ${t.control.effective ?? ""}`), [() => o()]), K(e, n);
	}, S = /* @__PURE__ */ P(() => o());
	J(y, (e) => {
		t.control.exposureNote ? e(b) : H(S) && e(x, 1);
	});
	var C = B(y, 2), w = (e) => {
		var r = vo(), i = R(r, !0);
		N(r), V(() => {
			Z(r, "id", t.idPrefix + "-error"), q(i, n());
		}), K(e, r);
	};
	J(C, (e) => {
		n() && e(w);
	}), N(s), V(() => c = li(s, 1, "pc-detail-control svelte-16a137", null, c, { "pc-control-number": t.control.editor === "number" })), K(e, s), Ue();
}
wr([
	"change",
	"input",
	"click"
]);
//#endregion
//#region ui/ModifierStack.svelte
var xo = /* @__PURE__ */ G("<label class=\"svelte-1ibq9q\"><input type=\"checkbox\" class=\"svelte-1ibq9q\"/> </label>"), So = /* @__PURE__ */ G("<option class=\"svelte-1ibq9q\"> </option>"), Co = /* @__PURE__ */ G("<label class=\"pc-modifier-check svelte-1ibq9q\"><input type=\"checkbox\" class=\"svelte-1ibq9q\"/> </label>"), wo = /* @__PURE__ */ G("<select class=\"svelte-1ibq9q\"></select>"), To = /* @__PURE__ */ G("<input type=\"number\" class=\"svelte-1ibq9q\"/>"), Eo = /* @__PURE__ */ G("<textarea class=\"svelte-1ibq9q\"></textarea>"), Do = /* @__PURE__ */ G("<label class=\"svelte-1ibq9q\"> </label> <!>", 1), Oo = /* @__PURE__ */ G("<small class=\"svelte-1ibq9q\"> </small>"), ko = /* @__PURE__ */ G("<!> <!>", 1), Ao = /* @__PURE__ */ G("<details class=\"svelte-1ibq9q\"><summary class=\"svelte-1ibq9q\"> <!></summary> <!> <button type=\"button\" class=\"svelte-1ibq9q\"> </button></details>"), jo = /* @__PURE__ */ G("<p class=\"pc-modifier-error svelte-1ibq9q\" role=\"alert\"> </p>"), Mo = /* @__PURE__ */ G("<div class=\"pc-modifier-entry svelte-1ibq9q\"><div class=\"pc-modifier-heading svelte-1ibq9q\"><label class=\"svelte-1ibq9q\"><input type=\"checkbox\" class=\"svelte-1ibq9q\"/><span class=\"svelte-1ibq9q\"> <small class=\"svelte-1ibq9q\"> </small></span></label> <div class=\"pc-modifier-order svelte-1ibq9q\"><button type=\"button\" title=\"Move up\" class=\"svelte-1ibq9q\">↑</button> <button type=\"button\" title=\"Move down\" class=\"svelte-1ibq9q\">↓</button> <button type=\"button\" title=\"Remove\" class=\"svelte-1ibq9q\">×</button></div></div> <!> <!></div>"), No = /* @__PURE__ */ G("<div class=\"pc-modifier-stack svelte-1ibq9q\"><small class=\"svelte-1ibq9q\"> </small> <!></div>"), Po = /* @__PURE__ */ G("<small role=\"status\" class=\"svelte-1ibq9q\">Validating modifiers…</small>"), Fo = /* @__PURE__ */ G("<section class=\"pc-modifiers svelte-1ibq9q\" data-modifier-controls=\"\" aria-label=\"Text modifiers\"><div class=\"pc-modifier-quick svelte-1ibq9q\"><!> <select aria-label=\"Add text modifier\" class=\"svelte-1ibq9q\"><option class=\"svelte-1ibq9q\">Add modifier…</option><!></select></div> <!> <!> <!></section>");
function Io(e, t) {
	He(t, !0);
	let n = (e) => t.options.find((t) => t.type === e.type), r = (e) => n(e)?.label ?? e.type, i = (e) => t.drafts[e.id]?.settings ?? e.settings, a = (e) => t.disabled || t.busy || !t.options.some((t) => t.type === e) || t.items.length >= 16 && !t.items.some((t) => t.type === e);
	var o = Fo(), s = R(o), c = R(s);
	Y(c, 16, () => ["trim", "wrap"], Gr, (e, n) => {
		var r = xo(), i = R(r);
		X(i);
		var o = B(i, 1, !0);
		N(r), V((e, t) => {
			Z(i, "aria-label", (n === "trim" ? "Trim" : "Wrap") + " output"), xi(i, e), i.disabled = t, q(o, n === "trim" ? "Trim" : "Wrap");
		}, [() => t.items.some((e) => e.type === n && e.enabled), () => a(n)]), W("change", i, (e) => {
			a(n) || t.onquick(n, e.currentTarget.checked);
		}), K(e, r);
	});
	var l = B(c, 2), u = R(l);
	u.value = u.__value = "", Y(B(u), 17, () => t.options.filter((e) => !["trim", "wrap"].includes(e.type)), (e) => e.type, (e, t) => {
		var n = So(), r = R(n, !0);
		N(n);
		var i = {};
		V(() => {
			q(r, H(t).label), i !== (i = H(t).type) && (n.value = (n.__value = H(t).type) ?? "");
		}), K(e, n);
	}), N(l), l.value = l.__value = "", N(s);
	var d = B(s, 2), f = (e) => {
		var a = No(), o = R(a), s = R(o);
		N(o), Y(B(o, 2), 19, () => t.items, (e) => e.id, (e, a, o) => {
			let s = /* @__PURE__ */ P(() => n(H(a))), c = /* @__PURE__ */ P(() => r(H(a))), l = /* @__PURE__ */ P(() => t.drafts[H(a).id]);
			var u = Mo(), d = R(u), f = R(d), p = R(f);
			X(p);
			var m = B(p), h = R(m), g = B(h), _ = R(g, !0);
			N(g), N(m), N(f);
			var v = B(f, 2), y = R(v), b = B(y, 2), x = B(b, 2);
			N(v), N(d);
			var S = B(d, 2), C = (e) => {
				var n = Ao(), r = R(n), o = R(r), u = B(o), d = (e) => {
					K(e, Pr("· Unsaved"));
				};
				J(u, (e) => {
					H(l)?.dirty && e(d);
				}), N(r);
				var f = B(r, 2);
				Y(f, 17, () => H(s).fields, (e) => e.key, (e, n) => {
					let r = /* @__PURE__ */ P(() => t.idPrefix + "-modifier-" + H(a).id + "-" + H(n).key);
					var o = ko(), s = z(o), l = (e) => {
						var o = Co(), s = R(o);
						X(s);
						var l = B(s, 1, !0);
						N(o), V((e) => {
							Z(s, "id", H(r)), Z(s, "aria-label", H(c) + " " + H(n).label), xi(s, e), s.disabled = t.disabled, q(l, H(n).label);
						}, [() => !!i(H(a))[H(n).key]]), W("change", s, (e) => {
							t.disabled || t.ondraft(H(a).id, H(n).key, e.currentTarget.checked);
						}), K(e, o);
					}, u = (e) => {
						var o = Do(), s = z(o), l = R(s, !0);
						N(s);
						var u = B(s, 2), d = (e) => {
							var o = wo();
							Y(o, 21, () => H(n).options ?? [], (e) => e.value, (e, t) => {
								var n = So(), r = R(n, !0);
								N(n);
								var i = {};
								V(() => {
									q(r, H(t).label), i !== (i = H(t).value) && (n.value = (n.__value = H(t).value) ?? "");
								}), K(e, n);
							}), N(o);
							var s;
							pi(o), V((e) => {
								Z(o, "id", H(r)), Z(o, "aria-label", H(c) + " " + H(n).label), o.disabled = t.disabled, s !== (s = e) && (o.value = (o.__value = e) ?? "", fi(o, e));
							}, [() => String(i(H(a))[H(n).key] ?? "")]), W("change", o, (e) => {
								t.disabled || t.ondraft(H(a).id, H(n).key, e.currentTarget.value);
							}), K(e, o);
						}, f = (e) => {
							var o = To();
							X(o), V((e) => {
								Z(o, "id", H(r)), Z(o, "aria-label", H(c) + " " + H(n).label), Z(o, "min", H(n).min), Z(o, "max", H(n).max), Z(o, "step", H(n).step ?? 1), bi(o, e), o.disabled = t.disabled;
							}, [() => String(i(H(a))[H(n).key] ?? "")]), W("input", o, (e) => {
								t.disabled || t.ondraft(H(a).id, H(n).key, e.currentTarget.value ? Number(e.currentTarget.value) : null);
							}), K(e, o);
						}, p = (e) => {
							var o = Eo();
							it(o), V((e) => {
								Z(o, "id", H(r)), Z(o, "aria-label", H(c) + " " + H(n).label), bi(o, e), o.disabled = t.disabled;
							}, [() => String(i(H(a))[H(n).key] ?? "")]), W("input", o, (e) => {
								t.disabled || t.ondraft(H(a).id, H(n).key, e.currentTarget.value);
							}), K(e, o);
						};
						J(u, (e) => {
							H(n).editor === "enum" ? e(d) : H(n).editor === "number" ? e(f, 1) : e(p, -1);
						}), V(() => {
							Z(s, "for", H(r)), q(l, H(n).label);
						}), K(e, o);
					};
					J(s, (e) => {
						H(n).editor === "boolean" ? e(l) : e(u, -1);
					});
					var d = B(s, 2), f = (e) => {
						var t = Oo(), r = R(t, !0);
						N(t), V(() => q(r, H(n).help)), K(e, t);
					};
					J(d, (e) => {
						H(n).help && e(f);
					}), K(e, o);
				});
				var p = B(f, 2), m = R(p, !0);
				N(p), N(n), V(() => {
					n.open = !!H(l)?.dirty || !!H(l)?.error, q(o, `${H(c) ?? ""} settings`), Z(p, "aria-label", "Save " + H(c) + " settings"), p.disabled = t.disabled || !!H(l)?.pending || !H(l)?.dirty, q(m, H(l)?.pending ? "Validating…" : "Save settings");
				}), W("click", p, () => {
					!t.disabled && !H(l)?.pending && H(l)?.dirty && t.onsave(H(a).id);
				}), K(e, n);
			};
			J(S, (e) => {
				H(s)?.fields.length && e(C);
			});
			var w = B(S, 2), T = (e) => {
				var t = jo(), n = R(t, !0);
				N(t), V(() => q(n, H(l).error)), K(e, t);
			};
			J(w, (e) => {
				H(l)?.error && e(T);
			}), N(u), V(() => {
				Z(u, "data-modifier-id", H(a).id), Z(u, "data-modifier-state", H(a).enabled ? "active" : "disabled"), Z(p, "aria-label", "Enable " + H(c) + " modifier"), xi(p, H(a).enabled), p.disabled = t.disabled || t.busy, q(h, `${H(o) + 1}. ${H(c) ?? ""}`), q(_, H(a).enabled ? "Active" : "Disabled"), Z(y, "aria-label", "Move " + H(c) + " up"), y.disabled = t.disabled || t.busy || H(o) === 0, Z(b, "aria-label", "Move " + H(c) + " down"), b.disabled = t.disabled || t.busy || H(o) === t.items.length - 1, Z(x, "aria-label", "Remove " + H(c) + " modifier"), x.disabled = t.disabled || t.busy;
			}), W("change", p, (e) => {
				!t.disabled && !t.busy && t.onenable(H(a).id, e.currentTarget.checked);
			}), W("click", y, () => {
				!t.disabled && !t.busy && H(o) > 0 && t.onmove(H(a).id, -1);
			}), W("click", b, () => {
				!t.disabled && !t.busy && H(o) < t.items.length - 1 && t.onmove(H(a).id, 1);
			}), W("click", x, () => {
				!t.disabled && !t.busy && t.onremove(H(a).id);
			}), K(e, u);
		}), N(a), V((e) => q(s, `${e ?? ""} active · ${t.items.length ?? ""} total · Applied in order`), [() => t.items.filter((e) => e.enabled).length]), K(e, a);
	};
	J(d, (e) => {
		t.items.length && e(f);
	});
	var p = B(d, 2), m = (e) => {
		K(e, Po());
	};
	J(p, (e) => {
		t.busy && e(m);
	});
	var h = B(p, 2), g = (e) => {
		var n = jo(), r = R(n, !0);
		N(n), V(() => q(r, t.error)), K(e, n);
	};
	J(h, (e) => {
		t.error && e(g);
	}), N(o), V(() => l.disabled = t.disabled || t.busy || t.items.length >= 16), W("change", l, (e) => {
		let n = e.currentTarget.value;
		e.currentTarget.value = "", !t.disabled && !t.busy && t.items.length < 16 && n && t.onadd(n);
	}), K(e, o), Ue();
}
wr([
	"change",
	"click",
	"input"
]);
//#endregion
//#region ui/NodeDetails.svelte
var Lo = /* @__PURE__ */ G("<small data-canonical-title=\"\" class=\"svelte-59ntjv\"> </small>"), Ro = /* @__PURE__ */ G("<p role=\"alert\" class=\"pc-detail-error svelte-59ntjv\"> </p>"), zo = /* @__PURE__ */ G("<label class=\"svelte-59ntjv\">Workflow stage<select aria-label=\"Workflow stage\" class=\"svelte-59ntjv\"><option class=\"svelte-59ntjv\">Preparation · before Generate Reply</option><option class=\"svelte-59ntjv\">Response · after Generate Reply</option></select></label><!>", 1), Bo = /* @__PURE__ */ G("<p class=\"svelte-59ntjv\"><button type=\"button\" class=\"svelte-59ntjv\">Configure Fast connections…</button></p>"), Vo = /* @__PURE__ */ G("<span class=\"svelte-59ntjv\">Read-only body</span>"), Ho = /* @__PURE__ */ G("<span class=\"pc-detail-blocked svelte-59ntjv\">Blocks run · Disabled</span>"), Uo = /* @__PURE__ */ G("<p class=\"pc-detail-state svelte-59ntjv\"><!><!></p>"), Wo = /* @__PURE__ */ G("<p class=\"pc-detail-error svelte-59ntjv\" role=\"alert\"> </p>"), Go = /* @__PURE__ */ G("<option class=\"svelte-59ntjv\"> </option>"), Ko = /* @__PURE__ */ G("<fieldset class=\"pc-detail-group svelte-59ntjv\" data-boundary-controls=\"\"><legend class=\"svelte-59ntjv\"> </legend> <label class=\"svelte-59ntjv\">Type<select aria-label=\"Subgraph port type\" class=\"svelte-59ntjv\"></select></label> <label class=\"pc-detail-check svelte-59ntjv\"><input aria-label=\"Required subgraph port\" type=\"checkbox\" class=\"svelte-59ntjv\"/> Required</label> <div class=\"pc-detail-actions svelte-59ntjv\"><button type=\"button\" data-save-boundary=\"\" class=\"svelte-59ntjv\"> </button></div> <small class=\"svelte-59ntjv\">Labels appear on the subgraph block. Disconnect incompatible connections before changing the type. Deleting this node removes its port and attached connections.</small> <!></fieldset>"), qo = /* @__PURE__ */ G("<p role=\"status\" class=\"svelte-59ntjv\">Loading file…</p>"), Jo = /* @__PURE__ */ G("<div data-file-input-controls=\"\" class=\"svelte-59ntjv\"><label class=\"svelte-59ntjv\"> <input type=\"file\" accept=\".txt,.md,.json,text/plain,text/markdown,application/json\" class=\"svelte-59ntjv\"/></label> <p class=\"svelte-59ntjv\"> </p> <small class=\"svelte-59ntjv\">The file's UTF-8 text is embedded in this workflow. Runs use the saved snapshot; replace the file to refresh it.</small> <small class=\"svelte-59ntjv\">Choose a .txt, .md or .json file up to 400,000 bytes and 100,000 UTF-16 code units.</small> <!> <!></div>"), Yo = /* @__PURE__ */ G("<details class=\"pc-detail-group svelte-59ntjv\"><summary class=\"svelte-59ntjv\"> </summary> <!></details>"), Xo = /* @__PURE__ */ G("<fieldset class=\"pc-detail-group pc-detail-main svelte-59ntjv\" data-operation-controls=\"\"><!> <!></fieldset> <!>", 1), Zo = /* @__PURE__ */ G("<label class=\"svelte-59ntjv\">Model identifier<input class=\"svelte-59ntjv\"/></label>"), Qo = /* @__PURE__ */ G("<small class=\"svelte-59ntjv\"> </small>"), $o = /* @__PURE__ */ G("<fieldset class=\"svelte-59ntjv\"><legend class=\"svelte-59ntjv\"> </legend> <label class=\"svelte-59ntjv\">Connection profile<select class=\"svelte-59ntjv\"><option class=\"svelte-59ntjv\">Use helper connection</option><!><!></select></label> <label class=\"svelte-59ntjv\">Model mode<select class=\"svelte-59ntjv\"></select></label> <!> <small class=\"svelte-59ntjv\"> </small><small class=\"svelte-59ntjv\"> </small><!> <!></fieldset>"), es = /* @__PURE__ */ G("<small class=\"svelte-59ntjv\">This helper has no text model calls to configure.</small>"), ts = /* @__PURE__ */ G("<details class=\"pc-detail-group svelte-59ntjv\" data-helper-model-controls=\"\" open=\"\"><summary class=\"svelte-59ntjv\">Helper model bindings</summary> <small class=\"svelte-59ntjv\">Choose a connection for each text model role in the pinned helper. These selections belong to this For Each node.</small> <!> <!></details>"), ns = /* @__PURE__ */ G("<label class=\"svelte-59ntjv\">Model identifier<input aria-label=\"Model identifier\" class=\"svelte-59ntjv\"/></label>"), rs = /* @__PURE__ */ G("<details class=\"pc-detail-group svelte-59ntjv\" data-model-controls=\"\" open=\"\"><summary class=\"svelte-59ntjv\"> </summary> <label class=\"svelte-59ntjv\">Connection profile<select aria-label=\"Connection profile\" class=\"svelte-59ntjv\"><option class=\"svelte-59ntjv\">Choose a connection</option><!><!></select></label> <label class=\"svelte-59ntjv\">Model mode<select aria-label=\"Model mode\" class=\"svelte-59ntjv\"></select></label> <!> <details data-binding-advanced=\"\" class=\"svelte-59ntjv\"><summary class=\"svelte-59ntjv\">Advanced connection settings</summary> <label class=\"svelte-59ntjv\">Connection mode<select aria-label=\"Connection mode\" class=\"svelte-59ntjv\"></select></label> <label class=\"svelte-59ntjv\">Model role<input aria-label=\"Model role\" class=\"svelte-59ntjv\"/></label></details> <!><!> <!> <!></details>"), is = /* @__PURE__ */ G("<p class=\"pc-detail-port svelte-59ntjv\"> <small class=\"svelte-59ntjv\"> </small></p>"), as = /* @__PURE__ */ G("<details class=\"pc-detail-group svelte-59ntjv\"><summary class=\"svelte-59ntjv\">Inputs and outputs</summary><!></details>"), os = /* @__PURE__ */ G("<p role=\"status\" class=\"svelte-59ntjv\"> </p>"), ss = /* @__PURE__ */ G("<header class=\"svelte-59ntjv\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-59ntjv\"><path class=\"svelte-59ntjv\"></path></svg> <div class=\"pc-detail-identity svelte-59ntjv\"><input class=\"pc-detail-name svelte-59ntjv\" aria-label=\"Node name\"/> <!> <small class=\"svelte-59ntjv\"> </small></div></header> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>", 1), cs = /* @__PURE__ */ G("<p class=\"pc-detail-empty svelte-59ntjv\">Select a node to inspect its settings.</p>"), ls = /* @__PURE__ */ G("<section class=\"pc-node-details svelte-59ntjv\" aria-label=\"Node details\"><!></section>");
function us(e, t) {
	He(t, !0);
	let n = (e, n = d) => {
		{
			let s = /* @__PURE__ */ P(() => H(a)[n().key]?.text ?? ee(n())), c = /* @__PURE__ */ P(() => H(a)[n().key]?.error || H(o)[n().key] || ""), l = /* @__PURE__ */ P(() => !!t.view?.readOnly || !r().editControl), u = /* @__PURE__ */ P(() => !!H(a)[n().key]?.pending), d = /* @__PURE__ */ P(() => i() + "-" + n().key);
			bo(e, {
				get control() {
					return n();
				},
				get text() {
					return H(s);
				},
				get error() {
					return H(c);
				},
				get disabled() {
					return H(l);
				},
				get pending() {
					return H(u);
				},
				get idPrefix() {
					return H(d);
				},
				ontext: (e) => j(n(), e),
				onvalue: (e) => ie(n(), e),
				onnumber: (e) => ae(n(), e),
				onsave: () => re(n())
			});
		}
	}, r = ki(t, "actions", 19, () => ({})), i = ki(t, "idPrefix", 3, "pc-node-details"), a = /* @__PURE__ */ I($t({})), o = /* @__PURE__ */ I($t({})), s = "", c = "", l = "", u = 0, f = 0, p = 0, h = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ I(!1), _ = 0, v = 0, y = 0, b = /* @__PURE__ */ new Map(), x = /* @__PURE__ */ new Map(), S = /* @__PURE__ */ new Map(), C = (e) => Object.fromEntries(Object.entries(e).map(([e, t]) => [e, {
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
	ji(() => {
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
		(i || n !== c || r !== l) && ((i || r !== l) && (f++, y++), i && (p++, s && S.set(s, hr(() => C(H(a))))), s = e, c = n, l = r, h.clear(), u++, L(o, {}, !0), L(g, !1), v++, L(a, w(i ? S.get(e) ?? {} : hr(() => H(a)), t.view), !0));
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
	function A(e) {
		let t = (x.get(e) ?? 0) + 1;
		return x.set(e, t), t;
	}
	async function te(e, n, r) {
		let i = t.view;
		if (!i || (n ? !i.canPresent : e === "profileId" || e === "model" ? !ge(i) : i.readOnly)) return;
		let s = D(i), c = ++u, l = p, d = k(i, e), f = H(a)[e] && d ? A(e) : null;
		h.set(e, c), L(o, {
			...H(o),
			[e]: ""
		}, !0), H(a)[e] && L(a, {
			...H(a),
			[e]: {
				...H(a)[e],
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
		if (g && f !== null && H(a)[e] && E && t.view && p === l && T(t.view) === T(s) && x.get(e) === f && k(t.view, e) === d) {
			let t = { ...H(a) };
			delete t[e], L(a, t, !0);
		}
		if (O(s) && h.get(e) === c && (h.delete(e), L(o, {
			...H(o),
			[e]: m
		}, !0), H(a)[e])) {
			if (m) L(a, {
				...H(a),
				[e]: {
					...H(a)[e],
					error: m,
					pending: !1
				}
			}, !0);
			else {
				let t = { ...H(a) };
				delete t[e], L(a, t, !0);
			}
		}
	}
	function ne(e) {
		let n = e.files?.[0];
		e.value = "", n && t.view?.fileInput && !t.view.readOnly && r().loadFile && !H(a).fileInput?.pending && (L(a, {
			...H(a),
			fileInput: {
				text: "",
				error: "",
				pending: !1
			}
		}, !0), te("fileInput", !1, (e) => r().loadFile(e, n)));
	}
	function j(e, n) {
		t.view && !t.view.readOnly && (A(e.key), h.delete(e.key), L(a, {
			...H(a),
			[e.key]: {
				text: n,
				error: "",
				pending: !1,
				editor: e.editor,
				representation: e.representation
			}
		}, !0), L(o, {
			...H(o),
			[e.key]: ""
		}, !0));
	}
	function re(e) {
		if (!t.view || t.view.readOnly || !r().editControl) return;
		let n = H(a)[e.key]?.text ?? ee(e), i = n;
		if (e.editor === "json") try {
			if (!(e.representation === "json-text" && e.allowEmpty && n.trim() === "")) {
				let t = JSON.parse(n);
				e.representation !== "json-text" && (i = t);
			}
		} catch {
			L(a, {
				...H(a),
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
		!n.value.trim() || !Number.isFinite(i) ? L(o, {
			...H(o),
			[e.key]: "Enter a finite number before saving."
		}, !0) : n.validity.valid ? ie(e, i) : L(o, {
			...H(o),
			[e.key]: "Enter a number within the allowed range and step."
		}, !0);
	}
	let oe = (e, t) => JSON.stringify([
		"helper-binding",
		e,
		t
	]), se = (e) => t.view?.helperBindings?.roles.find((t) => t.role === e), ce = () => !!t.view?.helperBindings?.editable && !t.view.readOnly && !!r().editHelperBinding, le = (e) => H(a)[oe(e, "model")] ? "override" : se(e)?.model.mode;
	function ue(e, t, n, i) {
		ce() && se(e) && te(oe(e, t), !1, (a) => r().editHelperBinding(a, e, t, n, i));
	}
	function de(e, n) {
		if (!ce() || !se(e)) return;
		let r = oe(e, "model");
		A(r), h.delete(r), L(a, {
			...H(a),
			[r]: {
				text: n,
				error: "",
				pending: !1,
				helperKey: t.view?.helperBindings?.helperKey
			}
		}, !0), L(o, {
			...H(o),
			[r]: ""
		}, !0);
	}
	function fe(e, t) {
		let n = se(e);
		if (!ce() || !n?.model.allowedModes.some((e) => e.value === t)) return;
		let r = oe(e, "model");
		if (t === "override") {
			de(e, H(a)[r]?.text ?? n.model.value ?? "");
			return;
		}
		h.delete(r);
		let i = { ...H(a) };
		delete i[r], L(a, i, !0), L(o, {
			...H(o),
			[r]: ""
		}, !0), t !== n.model.mode && ue(e, "model", t, null);
	}
	function pe(e, t) {
		if (!ce() || le(e) !== "override") return;
		de(e, t);
		let n = oe(e, "model");
		!t.trim() || t.length > 256 ? L(o, {
			...H(o),
			[n]: "Enter a model identifier of 1–256 characters."
		}, !0) : ue(e, "model", "override", t);
	}
	function me(e, t, n) {
		he(e)?.allowedModes.some((e) => e.value === t) && r().editBinding && te(e, !1, (i) => r().editBinding(i, e, t, n));
	}
	let he = (e) => e === "profileId" ? t.view?.model?.profile : t.view?.model?.model, ge = (e = t.view) => !!e?.model && (e.model.editable ?? !e.readOnly) && !!r().editBinding, _e = (e) => H(a)[e] ? "override" : he(e)?.mode, ve = (e) => H(a)[e]?.text ?? he(e)?.value ?? "", ye = () => {
		let e = t.view?.model?.profile;
		return H(a).profileId?.text ?? (e && Object.hasOwn(e, "effectiveValue") ? e.effectiveValue ?? "" : e?.value ?? "");
	}, be = () => t.view?.model?.profile.mode === "override" || !!t.view?.model?.profileDefaultModel;
	function xe(e, t) {
		ge() && he(e)?.allowedModes.some((e) => e.value === "override") && (A(e), h.delete(e), L(a, {
			...H(a),
			[e]: {
				text: t,
				error: "",
				pending: !1
			}
		}, !0), L(o, {
			...H(o),
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
		let r = { ...H(a) };
		delete r[e], L(a, r, !0), L(o, {
			...H(o),
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
				L(a, {
					...H(a),
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
		let t = H(a)["modifier:" + e.id];
		if (t) try {
			return JSON.parse(t.text);
		} catch {}
		return e.settings;
	}
	let De = () => Object.fromEntries((t.view?.modifiers?.items ?? []).map((e) => {
		let t = H(a)["modifier:" + e.id];
		return [e.id, {
			settings: Ee(e),
			error: t?.error || H(o)["modifier:" + e.id] || "",
			pending: !!t?.pending,
			dirty: !!t
		}];
	}));
	function Oe(e) {
		if (!we() || H(g) || e.length > 16 || !r().editModifiers) return;
		let t = ++v;
		L(g, !0), te("modifiers", !1, (t) => r().editModifiers(t, e)).finally(() => {
			t === v && L(g, !1);
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
	function Ae(e, n) {
		we() && t.view?.modifiers?.items.some((t) => t.id === e) && Oe(Te().map((t) => t.id === e ? {
			...t,
			enabled: n
		} : t));
	}
	function Me(e) {
		we() && t.view?.modifiers?.items.some((t) => t.id === e) && Oe(Te().filter((t) => t.id !== e));
	}
	function Ne(e, t) {
		if (!we()) return;
		let n = Te(), r = n.findIndex((t) => t.id === e), i = r + t;
		r < 0 || i < 0 || i >= n.length || ([n[r], n[i]] = [n[i], n[r]], Oe(n));
	}
	function Pe(e, n, r) {
		if (!we()) return;
		let i = t.view?.modifiers?.items.find((t) => t.id === e), s = t.view?.modifiers?.options.find((e) => e.type === i?.type);
		if (!i || !s?.fields.some((e) => e.key === n)) return;
		let c = "modifier:" + e;
		b.set(c, (b.get(c) ?? 0) + 1), h.delete(c), L(o, {
			...H(o),
			[c]: ""
		}, !0), L(a, {
			...H(a),
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
	function Fe(e) {
		if (!we() || !r().editModifiers) return;
		let n = t.view?.modifiers?.items.find((t) => t.id === e), i = "modifier:" + e;
		if (!n || !H(a)[i] || H(a)[i].pending) return;
		let o = (b.get(i) ?? 0) + 1, s = y, c = n.type;
		b.set(i, o);
		let l = Ee(n), u = Te().map((t) => t.id === e ? {
			...t,
			settings: l
		} : t);
		te(i, !1, async (n) => {
			let l = await r().editModifiers(n, u);
			if (l.ok && E && t.view && T(t.view) === T(n) && y === s && b.get(i) === o && t.view.modifiers?.items.some((t) => t.id === e && t.type === c)) {
				let e = { ...H(a) };
				delete e[i], L(a, e, !0);
			}
			return l;
		});
	}
	let Ie = () => {
		let e = /* @__PURE__ */ new Map();
		for (let n of t.view?.controls ?? []) {
			let t = n.group && n.group !== "Main" ? n.group : n.advanced ? "Advanced" : "Main";
			e.set(t, [...e.get(t) ?? [], n]);
		}
		return [...e].sort(([e], [t]) => e === "Main" ? -1 : +(t === "Main"));
	}, Le = (e) => e.some((e) => !!(H(a)[e.key]?.error || H(o)[e.key])), Re = () => t.view?.model ? `Model connection · ${t.view.model.issue ? "Binding needs attention" : t.view.model.effective || "Choose a connection"}` : "";
	function ze(e) {
		t.view && !t.view.boundary && r().present && te("alias", !0, (n) => r().present(n, "alias", e === t.view?.canonicalTitle ? "" : e));
	}
	function Be() {
		return {
			label: H(a).boundary?.text ?? t.view?.boundary?.label ?? "",
			artifactKind: H(a).boundary?.artifactKind ?? t.view?.boundary?.kind ?? "",
			required: H(a).boundary?.required ?? t.view?.boundary?.required ?? !1
		};
	}
	function Ve(e, n) {
		if (!t.view?.boundary || t.view.readOnly || !r().editInterface || e === "artifactKind" && !t.view.boundary.kinds.includes(String(n))) return;
		let i = {
			...Be(),
			[e]: n
		};
		f++, h.delete("boundary"), L(o, {
			...H(o),
			boundary: ""
		}, !0), L(a, {
			...H(a),
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
	function We() {
		if (!t.view?.boundary || t.view.readOnly || !r().editInterface || H(a).boundary?.pending) return;
		let e = t.view.boundary.id, n = Be();
		if (!n.label.trim() || !t.view.boundary.kinds.includes(n.artifactKind)) return;
		let i = ++f;
		L(a, {
			...H(a),
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
				let e = { ...H(a) };
				delete e.boundary, L(a, e, !0);
			}
			return s;
		});
	}
	var Ge = ls(), Ke = R(Ge), qe = (e) => {
		var s = ss(), c = z(s);
		let l;
		var u = R(c), d = R(u);
		N(u);
		var f = B(u, 2), p = R(f);
		X(p);
		var h = B(p, 2), _ = (e) => {
			var n = Lo(), r = R(n);
			N(n), V(() => q(r, `Canonical type: ${t.view.canonicalTitle ?? ""}`)), K(e, n);
		};
		J(h, (e) => {
			!t.view.boundary && (t.view.alias || t.view.title || t.view.canonicalTitle) !== t.view.canonicalTitle && e(_);
		});
		var v = B(h, 2), y = R(v, !0);
		N(v), N(f), N(c);
		var b = B(c, 2), x = (e) => {
			var n = zo(), i = z(n), a = B(R(i)), s = R(a);
			s.value = s.__value = "pre";
			var c = B(s);
			c.value = c.__value = "post", N(a);
			var l;
			pi(a), N(i);
			var u = B(i), d = (e) => {
				var t = Ro(), n = R(t, !0);
				N(t), V(() => q(n, H(o).phase)), K(e, t);
			};
			J(u, (e) => {
				H(o).phase && e(d);
			}), V(() => {
				a.disabled = t.view.readOnly || !r().editPhase, l !== (l = t.view.phase) && (a.value = (a.__value = t.view.phase) ?? "", fi(a, t.view.phase));
			}), W("change", a, (e) => {
				let t = e.currentTarget.value;
				te("phase", !1, (e) => r().editPhase(e, t));
			}), K(e, n);
		};
		J(b, (e) => {
			t.view.phaseEditable && e(x);
		});
		var S = B(b, 2), C = (e) => {
			var t = Bo(), n = R(t);
			N(t), V(() => n.disabled = !r().openFastConnections), W("click", n, () => r().openFastConnections?.()), K(e, t);
		};
		J(S, (e) => {
			t.view.operation === "fast-decision" && e(C);
		});
		var w = B(S, 2), T = (e) => {
			var n = Uo(), r = R(n), i = (e) => {
				K(e, Vo());
			};
			J(r, (e) => {
				t.view.readOnly && e(i);
			});
			var a = B(r), o = (e) => {
				K(e, Ho());
			};
			J(a, (e) => {
				t.view.enabled || e(o);
			}), N(n), K(e, n);
		};
		J(w, (e) => {
			(t.view.readOnly || !t.view.enabled) && e(T);
		});
		var E = B(w, 2), D = (e) => {
			var t = Wo(), n = R(t, !0);
			N(t), V(() => q(n, H(o).alias)), K(e, t);
		};
		J(E, (e) => {
			H(o).alias && e(D);
		});
		var O = B(E, 2), ee = (e) => {
			var n = Ko(), i = R(n), s = R(i);
			N(i);
			var c = B(i, 2), l = B(R(c));
			Y(l, 21, () => t.view.boundary.kinds, Gr, (e, t) => {
				var n = Go(), r = R(n, !0);
				N(n);
				var i = {};
				V(() => {
					q(r, H(t)), i !== (i = H(t)) && (n.value = (n.__value = H(t)) ?? "");
				}), K(e, n);
			}), N(l);
			var u;
			pi(l), N(c);
			var d = B(c, 2), f = R(d);
			X(f), je(), N(d);
			var p = B(d, 2), m = R(p), h = R(m, !0);
			N(m), N(p);
			var g = B(p, 4), _ = (e) => {
				var t = Wo(), n = R(t, !0);
				N(t), V(() => q(n, H(a).boundary?.error || H(o).boundary)), K(e, t);
			};
			J(g, (e) => {
				(H(a).boundary?.error || H(o).boundary) && e(_);
			}), N(n), V((e, n, i) => {
				q(s, `Subgraph ${t.view.boundary.direction ?? ""}`), l.disabled = t.view.readOnly || !r().editInterface, u !== (u = e) && (l.value = (l.__value = e) ?? "", fi(l, e)), xi(f, n), f.disabled = t.view.readOnly || !r().editInterface, m.disabled = i, q(h, H(a).boundary?.pending ? "Validating…" : "Save port");
			}, [
				() => Be().artifactKind,
				() => Be().required,
				() => t.view.readOnly || !r().editInterface || !Be().label.trim() || !!H(a).boundary?.pending
			]), W("change", l, (e) => Ve("artifactKind", e.currentTarget.value)), W("change", f, (e) => Ve("required", e.currentTarget.checked)), W("click", m, () => We()), K(e, n);
		};
		J(O, (e) => {
			t.view.boundary && e(ee);
		});
		var k = B(O, 2), A = (e) => {
			var s = Xo(), c = z(s), l = R(c), u = (e) => {
				var n = Jo(), s = R(n), c = R(s, !0), l = B(c);
				N(s);
				var u = B(s, 2), d = R(u, !0);
				N(u);
				var f = B(u, 6), p = (e) => {
					K(e, qo());
				};
				J(f, (e) => {
					H(a).fileInput?.pending && e(p);
				});
				var m = B(f, 2), h = (e) => {
					var t = Wo(), n = R(t, !0);
					N(t), V(() => {
						Z(t, "id", i() + "-error-fileInput"), q(n, H(o).fileInput);
					}), K(e, t);
				};
				J(m, (e) => {
					H(o).fileInput && e(h);
				}), N(n), V(() => {
					q(c, t.view.fileInput.loaded ? "Replace file" : "Choose file"), Z(l, "aria-label", t.view.fileInput.loaded ? "Replace file" : "Choose file"), l.disabled = t.view.readOnly || !r().loadFile || !!H(a).fileInput?.pending, Z(l, "aria-invalid", !!H(o).fileInput), Z(l, "aria-describedby", H(o).fileInput ? i() + "-error-fileInput" : void 0), q(d, t.view.fileInput.loaded ? "Loaded file: " + t.view.fileInput.fileName : "No file loaded.");
				}), W("change", l, (e) => ne(e.currentTarget)), K(e, n);
			};
			J(l, (e) => {
				t.view.fileInput && e(u);
			}), Y(B(l, 2), 17, () => Ie().filter(([e]) => e === "Main"), ([e, t]) => e, (e, t) => {
				var r = /* @__PURE__ */ P(() => m(H(t), 2));
				let i = () => H(r)[1];
				var a = Fr();
				Y(z(a), 17, i, (e) => e.key, (e, t) => {
					n(e, () => H(t));
				}), K(e, a);
			}), N(c), Y(B(c, 2), 17, () => Ie().filter(([e]) => e !== "Main"), ([e, t]) => e, (e, t) => {
				var r = /* @__PURE__ */ P(() => m(H(t), 2));
				let i = () => H(r)[0], a = () => H(r)[1];
				var o = Yo(), s = R(o), c = R(s, !0);
				N(s), Y(B(s, 2), 17, a, (e) => e.key, (e, t) => {
					n(e, () => H(t));
				}), N(o), V((e) => {
					Z(o, "data-control-group", i()), o.open = e, q(c, i());
				}, [() => Le(a())]), K(e, o);
			}), K(e, s);
		};
		J(k, (e) => {
			t.view.boundary || e(A);
		});
		var j = B(k, 2), re = (e) => {
			var n = ts(), r = B(R(n), 4);
			Y(r, 17, () => t.view.helperBindings.roles, (e) => e.role, (e, t) => {
				var n = $o(), r = R(n), i = R(r, !0);
				N(r);
				var s = B(r, 2), c = B(R(s)), l = R(c);
				l.value = l.__value = "";
				var u = B(l), d = (e) => {
					var n = Go(), r = R(n);
					N(n);
					var i = {};
					V(() => {
						q(r, `Unavailable connection · ${H(t).profile.value ?? ""}`), i !== (i = H(t).profile.value) && (n.value = (n.__value = H(t).profile.value) ?? "");
					}), K(e, n);
				}, f = /* @__PURE__ */ P(() => H(t).profile.value && !(H(t).profile.options ?? []).some((e) => e.value === H(t).profile.value));
				J(u, (e) => {
					H(f) && e(d);
				}), Y(B(u), 17, () => H(t).profile.options ?? [], (e) => e.value, (e, t) => {
					var n = Go(), r = R(n, !0);
					N(n);
					var i = {};
					V(() => {
						q(r, H(t).label), i !== (i = H(t).value) && (n.value = (n.__value = H(t).value) ?? "");
					}), K(e, n);
				}), N(c);
				var p;
				pi(c), N(s);
				var m = B(s, 2), h = B(R(m));
				Y(h, 21, () => H(t).model.allowedModes, (e) => e.value, (e, t) => {
					var n = Go(), r = R(n, !0);
					N(n);
					var i = {};
					V(() => {
						q(r, H(t).label), i !== (i = H(t).value) && (n.value = (n.__value = H(t).value) ?? "");
					}), K(e, n);
				}), N(h);
				var g;
				pi(h), N(m);
				var _ = B(m, 2), v = (e) => {
					var n = Zo(), r = B(R(n));
					X(r), N(n), V((e, n) => {
						Z(r, "aria-label", H(t).role + " model identifier"), bi(r, e), r.disabled = n;
					}, [() => H(a)[oe(H(t).role, "model")]?.text ?? H(t).model.value ?? "", () => !ce()]), W("input", r, (e) => de(H(t).role, e.currentTarget.value)), W("change", r, (e) => pe(H(t).role, e.currentTarget.value)), K(e, n);
				}, y = /* @__PURE__ */ P(() => le(H(t).role) === "override");
				J(_, (e) => {
					H(y) && e(v);
				});
				var b = B(_, 2), x = R(b);
				N(b);
				var S = B(b), C = R(S, !0);
				N(S);
				var w = B(S), T = (e) => {
					var n = Qo(), r = R(n, !0);
					N(n), V(() => q(r, H(t).caveat)), K(e, n);
				};
				J(w, (e) => {
					H(t).caveat && e(T);
				});
				var E = B(w, 2), D = (e) => {
					var n = Wo(), r = R(n, !0);
					N(n), V((e) => q(r, e), [() => H(o)[oe(H(t).role, "profileId")] || H(o)[oe(H(t).role, "model")]]), K(e, n);
				}, O = /* @__PURE__ */ P(() => H(o)[oe(H(t).role, "profileId")] || H(o)[oe(H(t).role, "model")]);
				J(E, (e) => {
					H(O) && e(D);
				}), N(n), V((e, n, r) => {
					q(i, H(t).label), Z(c, "aria-label", H(t).role + " connection profile"), c.disabled = e, p !== (p = H(t).profile.value ?? "") && (c.value = (c.__value = H(t).profile.value ?? "") ?? "", fi(c, H(t).profile.value ?? "")), Z(h, "aria-label", H(t).role + " model mode"), h.disabled = n, g !== (g = r) && (h.value = (h.__value = r) ?? "", fi(h, r)), q(x, `Effective connection: ${H(t).effective ?? ""}`), q(C, H(t).source);
				}, [
					() => !ce(),
					() => !ce(),
					() => le(H(t).role)
				]), W("change", c, (e) => ue(H(t).role, "profileId", e.currentTarget.value ? "override" : "inherit", e.currentTarget.value || null)), W("change", h, (e) => fe(H(t).role, e.currentTarget.value)), K(e, n);
			});
			var i = B(r, 2), s = (e) => {
				var n = Wo(), r = R(n, !0);
				N(n), V(() => q(r, t.view.helperBindings.issue)), K(e, n);
			}, c = (e) => {
				K(e, es());
			};
			J(i, (e) => {
				t.view.helperBindings.issue ? e(s) : t.view.helperBindings.roles.length || e(c, 1);
			}), N(n), K(e, n);
		};
		J(j, (e) => {
			t.view.helperBindings && e(re);
		});
		var ie = B(j, 2), ae = (e) => {
			var n = rs(), i = R(n), s = R(i, !0);
			N(i);
			var c = B(i, 2), l = B(R(c)), u = R(l);
			u.value = u.__value = "";
			var d = B(u), f = (e) => {
				var t = Go(), n = R(t);
				N(t);
				var r = {};
				V((e, i) => {
					q(n, `Unavailable connection · ${e ?? ""}`), r !== (r = i) && (t.value = (t.__value = i) ?? "");
				}, [() => ye(), () => ye()]), K(e, t);
			}, p = /* @__PURE__ */ P(() => ye() && !(t.view.model.profile.options ?? []).some((e) => e.value === ye()));
			J(d, (e) => {
				H(p) && e(f);
			}), Y(B(d), 17, () => t.view.model.profile.options ?? [], (e) => e.value, (e, t) => {
				var n = Go(), r = R(n, !0);
				N(n);
				var i = {};
				V(() => {
					q(r, H(t).label), i !== (i = H(t).value) && (n.value = (n.__value = H(t).value) ?? "");
				}), K(e, n);
			}), N(l);
			var m;
			pi(l), N(c);
			var h = B(c, 2), g = B(R(h));
			Y(g, 21, () => t.view.model.model.allowedModes, (e) => e.value, (e, n) => {
				var r = Go(), i = R(r, !0);
				N(r);
				var a = {};
				V((e) => {
					q(i, e), a !== (a = H(n).value) && (r.value = (r.__value = H(n).value) ?? "");
				}, [() => H(n).value === "inherit" && !t.view.readOnly ? be() || !t.view.model.model.effectiveValue ? "Use profile model" : "Existing role model" : H(n).label]), K(e, r);
			}), N(g);
			var _;
			pi(g), N(h);
			var v = B(h, 2), y = (e) => {
				var t = ns(), n = B(R(t));
				X(n), N(t), V((e, t) => {
					bi(n, e), n.disabled = t;
				}, [() => ve("model"), () => !ge()]), W("input", n, (e) => xe("model", e.currentTarget.value)), W("change", n, (e) => Ce("model", e.currentTarget.value)), K(e, t);
			}, b = /* @__PURE__ */ P(() => _e("model") === "override");
			J(v, (e) => {
				H(b) && e(y);
			});
			var x = B(v, 2), S = B(R(x), 2), C = B(R(S));
			Y(C, 21, () => t.view.model.profile.allowedModes, (e) => e.value, (e, t) => {
				var n = Go(), r = R(n, !0);
				N(n);
				var i = {};
				V(() => {
					q(r, H(t).label), i !== (i = H(t).value) && (n.value = (n.__value = H(t).value) ?? "");
				}), K(e, n);
			}), N(C);
			var w;
			pi(C), N(S);
			var T = B(S, 2), E = B(R(T));
			X(E), N(T), N(x);
			var D = B(x, 2), O = (e) => {
				var n = Qo(), r = R(n);
				N(n), V(() => q(r, `Effective connection: ${t.view.model.effective ?? ""}`)), K(e, n);
			}, ee = /* @__PURE__ */ P(() => !t.view.model.issue || t.view.model.effective.trim() !== t.view.model.issue.trim());
			J(D, (e) => {
				H(ee) && e(O);
			});
			var k = B(D), A = (e) => {
				var n = Qo(), r = R(n, !0);
				N(n), V(() => q(r, t.view.model.source)), K(e, n);
			};
			J(k, (e) => {
				t.view.model.source && e(A);
			});
			var ne = B(k, 2), j = (e) => {
				var n = Wo(), r = R(n, !0);
				N(n), V(() => q(r, t.view.model.issue)), K(e, n);
			};
			J(ne, (e) => {
				t.view.model.issue && e(j);
			});
			var re = B(ne, 2), ie = (e) => {
				var t = Wo(), n = R(t, !0);
				N(t), V(() => q(n, H(o).modelRole || H(a).profileId?.error || H(o).profileId || H(a).model?.error || H(o).model)), K(e, t);
			};
			J(re, (e) => {
				(H(o).modelRole || H(a).profileId?.error || H(o).profileId || H(a).model?.error || H(o).model) && e(ie);
			}), N(n), V((e, n, i, a, o, c, u) => {
				q(s, e), l.disabled = n, m !== (m = i) && (l.value = (l.__value = i) ?? "", fi(l, i)), g.disabled = a, _ !== (_ = o) && (g.value = (g.__value = o) ?? "", fi(g, o)), C.disabled = c, w !== (w = u) && (C.value = (C.__value = u) ?? "", fi(C, u)), bi(E, t.view.model.role), E.disabled = t.view.readOnly || !t.view.model.roleEditable || !r().editField;
			}, [
				() => Re(),
				() => !ge() || !t.view.model.profile.allowedModes.some((e) => e.value === "override"),
				() => ye(),
				() => !ge(),
				() => _e("model"),
				() => !ge(),
				() => _e("profileId")
			]), W("change", l, (e) => Ce("profileId", e.currentTarget.value)), W("change", g, (e) => Se("model", e.currentTarget.value)), W("change", C, (e) => Se("profileId", e.currentTarget.value)), W("change", E, (e) => {
				let n = e.currentTarget.value;
				t.view?.model?.roleEditable && r().editField && te("modelRole", !1, (e) => r().editField(e, "modelRole", n));
			}), K(e, n);
		};
		J(ie, (e) => {
			t.view.model && e(ae);
		});
		var se = B(ie, 2), me = (e) => {
			var n = as();
			Y(B(R(n)), 17, () => t.view.ports, (e) => e.direction + ":" + e.id, (e, t) => {
				var n = is(), r = R(n), i = B(r), a = R(i, !0);
				N(i), N(n), V(() => {
					q(r, `${H(t).direction === "input" ? "In" : "Out"} · ${H(t).label ?? ""}`), q(a, H(t).kind);
				}), K(e, n);
			}), N(n), K(e, n);
		};
		J(se, (e) => {
			t.view.ports.length && e(me);
		});
		var he = B(se, 2), Te = (e) => {
			var n = os(), r = R(n, !0);
			N(n), V(() => q(r, t.view.status)), K(e, n);
		};
		J(he, (e) => {
			t.view.status && e(Te);
		});
		var Ee = B(he, 2);
		Y(Ee, 17, () => t.view.issues ?? [], Gr, (e, t) => {
			var n = Wo(), r = R(n, !0);
			N(n), V(() => q(r, H(t))), K(e, n);
		});
		var Oe = B(Ee, 2), He = (e) => {
			{
				let n = /* @__PURE__ */ P(() => !we()), r = /* @__PURE__ */ P(De), a = /* @__PURE__ */ P(() => H(o).modifiers || "");
				Io(e, {
					get items() {
						return t.view.modifiers.items;
					},
					get options() {
						return t.view.modifiers.options;
					},
					get disabled() {
						return H(n);
					},
					get busy() {
						return H(g);
					},
					get drafts() {
						return H(r);
					},
					get error() {
						return H(a);
					},
					get idPrefix() {
						return i();
					},
					onquick: ke,
					onadd: M,
					onenable: Ae,
					onremove: Me,
					onmove: Ne,
					ondraft: Pe,
					onsave: Fe
				});
			}
		};
		J(Oe, (e) => {
			t.view.modifiers && e(He);
		}), V((e) => {
			l = di(c, "", l, { "--pc-detail-family": t.view.familyColor ?? "var(--pc-accent)" }), Z(d, "d", t.view.iconPath), Z(p, "id", i() + "-name"), Z(p, "maxlength", t.view.boundary ? void 0 : 80), bi(p, e), p.disabled = t.view.boundary ? t.view.readOnly || !r().editInterface : !t.view.canPresent || !r().present, q(y, t.view.boundary ? "Subgraph " + t.view.boundary.direction : t.view.family + " · " + t.view.phase + " phase");
		}, [() => t.view.boundary ? Be().label : t.view.alias || t.view.title || t.view.canonicalTitle]), W("input", p, (e) => {
			t.view?.boundary && Ve("label", e.currentTarget.value);
		}), W("change", p, (e) => {
			t.view?.boundary || ze(e.currentTarget.value);
		}), K(e, s);
	}, Je = (e) => {
		K(e, cs());
	};
	J(Ke, (e) => {
		t.view ? e(qe) : e(Je, -1);
	}), N(Ge), K(e, Ge), Ue();
}
wr([
	"input",
	"change",
	"click"
]);
//#endregion
//#region ui/CommentDetails.svelte
var ds = /* @__PURE__ */ G("<p class=\"pc-detail-meta svelte-17djc3u\">Read-only comment</p>"), fs = /* @__PURE__ */ G("<section class=\"pc-comment-details svelte-17djc3u\" aria-label=\"Comment details\"><h3 class=\"svelte-17djc3u\">Comment</h3> <!> <fieldset class=\"pc-detail-group svelte-17djc3u\"><legend class=\"svelte-17djc3u\">Comment</legend> <label class=\"svelte-17djc3u\">Title<input aria-label=\"Comment title\" class=\"svelte-17djc3u\"/></label> <label class=\"svelte-17djc3u\">Notes<textarea aria-label=\"Comment notes\" rows=\"5\" class=\"svelte-17djc3u\"></textarea></label> <label class=\"pc-comment-color-label svelte-17djc3u\">Color<input aria-label=\"Comment color\" type=\"color\" class=\"svelte-17djc3u\"/></label> <label class=\"pc-detail-check svelte-17djc3u\"><input aria-label=\"Move contents\" type=\"checkbox\" class=\"svelte-17djc3u\"/> Move contents</label> <small class=\"svelte-17djc3u\">Moves fully contained nodes when you drag the comment header.</small></fieldset> <div class=\"pc-comment-commands svelte-17djc3u\"><button type=\"button\" class=\"pc-btn svelte-17djc3u\">Fit to contents</button> <button type=\"button\" class=\"pc-btn pc-danger svelte-17djc3u\">Delete comment</button></div> <small class=\"svelte-17djc3u\">Deleting this comment keeps its contents.</small></section>");
function ps(e, t) {
	He(t, !0);
	let n = ki(t, "readOnly", 3, !1), r = /* @__PURE__ */ P(() => n() || t.comment.readOnly), i = (e) => e.stopPropagation();
	function a(e) {
		H(r) || t.onPatch(e);
	}
	function o(e) {
		H(r) || t.onCommand(e);
	}
	var s = fs(), c = B(R(s), 2), l = (e) => {
		K(e, ds());
	};
	J(c, (e) => {
		H(r) && e(l);
	});
	var u = B(c, 2), d = B(R(u), 2), f = B(R(d));
	X(f), N(d);
	var p = B(d, 2), m = B(R(p));
	it(m), N(p);
	var h = B(p, 2), g = B(R(h));
	X(g), N(h);
	var _ = B(h, 2), v = R(_);
	X(v), je(), N(_), je(2), N(u);
	var y = B(u, 2), b = R(y), x = B(b, 2);
	N(y), je(2), N(s), V(() => {
		u.disabled = H(r), bi(f, t.comment.title), f.disabled = H(r), bi(m, t.comment.content), m.disabled = H(r), bi(g, t.comment.color), g.disabled = H(r), xi(v, t.comment.moveContents), v.disabled = H(r), b.disabled = H(r), x.disabled = H(r);
	}), U("keydown", f, i, !0), W("change", f, (e) => a({ title: e.currentTarget.value })), U("keydown", m, i, !0), W("change", m, (e) => a({ content: e.currentTarget.value })), W("change", g, (e) => a({ color: e.currentTarget.value })), W("change", v, (e) => a({ moveContents: e.currentTarget.checked })), W("click", b, () => o("fit")), W("click", x, () => o("delete")), K(e, s), Ue();
}
wr(["change", "click"]);
//#endregion
//#region ui/OutputPreview.svelte
var ms = /* @__PURE__ */ G("<option class=\"svelte-ee2ehy\"> </option>"), hs = /* @__PURE__ */ G("<label class=\"pc-preview-choice svelte-ee2ehy\"><span class=\"pc-preview-sr-only svelte-ee2ehy\">Preview output</span><select aria-label=\"Preview output\" class=\"svelte-ee2ehy\"><option disabled=\"\" class=\"svelte-ee2ehy\">Choose an output</option><!></select></label>"), gs = /* @__PURE__ */ G("<button type=\"button\" aria-label=\"Collapse preview\" title=\"Collapse preview\" class=\"svelte-ee2ehy\">▴</button>"), _s = /* @__PURE__ */ G("<button type=\"button\" role=\"tab\" class=\"svelte-ee2ehy\"> </button>"), vs = /* @__PURE__ */ G("<div class=\"pc-preview-tabs svelte-ee2ehy\" role=\"tablist\" aria-label=\"Recorded artifacts\"></div>"), ys = /* @__PURE__ */ G("<p class=\"pc-preview-note svelte-ee2ehy\"> </p>"), bs = /* @__PURE__ */ G("<pre class=\"svelte-ee2ehy\"> </pre>"), xs = /* @__PURE__ */ G("<small class=\"pc-preview-note svelte-ee2ehy\"> </small>"), Ss = /* @__PURE__ */ G("<div role=\"tabpanel\" tabindex=\"0\" class=\"svelte-ee2ehy\"><article class=\"svelte-ee2ehy\"><div class=\"pc-preview-section-heading svelte-ee2ehy\"><span class=\"svelte-ee2ehy\"> </span><small class=\"svelte-ee2ehy\"> </small></div> <!> <!></article></div>"), Cs = /* @__PURE__ */ G("<p class=\"pc-preview-empty svelte-ee2ehy\"> </p>"), ws = /* @__PURE__ */ G("<section aria-label=\"Accepted consequences\" class=\"pc-preview-settlement svelte-ee2ehy\"><strong class=\"svelte-ee2ehy\"> </strong> <!></section>"), Ts = /* @__PURE__ */ G("<p class=\"pc-preview-error svelte-ee2ehy\"> </p>"), Es = /* @__PURE__ */ G("<button type=\"button\" data-run-here=\"\" title=\"Runs the selected output's dependencies. Results are diagnostic previews.\" class=\"svelte-ee2ehy\"> </button>"), Ds = /* @__PURE__ */ G("<button type=\"button\" data-preview-apply=\"\" class=\"svelte-ee2ehy\"> </button><button type=\"button\" class=\"svelte-ee2ehy\"> </button>", 1), Os = /* @__PURE__ */ G("<header class=\"svelte-ee2ehy\"><h3 class=\"svelte-ee2ehy\"> </h3> <!> <div class=\"pc-preview-tools svelte-ee2ehy\"><button type=\"button\" aria-label=\"Pin preview\" class=\"svelte-ee2ehy\"> </button><!></div></header> <!> <div class=\"pc-preview-sections svelte-ee2ehy\"><!> <!> <!> <!> <!> <!> <!> <!></div> <footer class=\"svelte-ee2ehy\"><span class=\"pc-preview-status svelte-ee2ehy\"> </span> <span class=\"svelte-ee2ehy\"> </span> <!> <!></footer>", 1), ks = /* @__PURE__ */ G("<p class=\"pc-preview-empty svelte-ee2ehy\">Select a node output to inspect its recorded result.</p>"), As = /* @__PURE__ */ G("<section class=\"pc-output-preview svelte-ee2ehy\" aria-label=\"Output preview\"><!></section>");
function js(e, t) {
	let n = Ir();
	He(t, !0);
	let r = ki(t, "actions", 19, () => ({})), i = /* @__PURE__ */ P(() => JSON.stringify([t.view?.sourceKey, t.view?.selectedKey])), a = /* @__PURE__ */ I($t({
		scope: "",
		id: null
	})), o = /* @__PURE__ */ P(() => (H(a).scope === H(i) ? t.view?.sections.find((e) => e.id === H(a).id) : null) ?? t.view?.sections[0] ?? null);
	xn(() => {
		let e = H(a).scope === H(i) && t.view?.sections.some((e) => e.id === H(a).id) ? H(a).id : t.view?.sections[0]?.id ?? null;
		(H(a).scope !== H(i) || H(a).id !== e) && L(a, {
			scope: H(i),
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
		L(a, {
			scope: H(i),
			id: r[o].id
		}, !0), e.currentTarget.parentElement?.querySelectorAll("[role=\"tab\"]")[o]?.focus();
	}
	let l = /* @__PURE__ */ P(() => t.view?.choices.find((e) => e.key === t.view?.selectedKey) ?? null), u = (e) => ({
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
	}, p = /* @__PURE__ */ P(() => !!(t.view && H(l) && t.view.status !== "removed" && !t.view.busy && t.view.runHere?.enabled && r().runHere)), m = /* @__PURE__ */ P(() => !!(t.view && H(l) && t.view.review?.mode === "root" && t.view.review.selectedRootTerminal && "kind" in H(l).target && H(l).target.address.instancePath.length === 0 && d(H(l).target) === d(t.view.review.selector.terminal))), h = /* @__PURE__ */ P(() => !!(t.view && t.view.status === "current" && !t.view.busy && H(m) && t.view.review?.fresh && t.view.review.canApply && r().apply)), g = /* @__PURE__ */ P(() => !!(t.view && !t.view.busy && H(m) && r().reject));
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
	var y = As(), b = R(y), x = (e) => {
		var d = Os(), m = z(d), y = R(m), b = R(y, !0);
		N(y);
		var x = B(y, 2), S = (e) => {
			var n = hs(), i = B(R(n)), a = R(i);
			a.value = a.__value = "", Y(B(a), 17, () => t.view.choices, (e) => e.key, (e, t) => {
				var n = ms(), r = R(n);
				N(n);
				var i = {};
				V(() => {
					q(r, `${H(t).label ?? ""} · ${H(t).kind ?? ""}`), i !== (i = H(t).key) && (n.value = (n.__value = H(t).key) ?? "");
				}), K(e, n);
			}), N(i);
			var o;
			pi(i), N(n), V(() => {
				i.disabled = !r().select, o !== (o = t.view.selectedKey ?? "") && (i.value = (i.__value = t.view.selectedKey ?? "") ?? "", fi(i, t.view.selectedKey ?? ""));
			}), W("change", i, (e) => _(e.currentTarget.value)), K(e, n);
		};
		J(x, (e) => {
			t.view.choices.length && e(S);
		});
		var C = B(x, 2), w = R(C), T = R(w, !0);
		N(w);
		var E = B(w), D = (e) => {
			var n = gs();
			W("click", n, function(...e) {
				t.collapse?.apply(this, e);
			}), K(e, n);
		};
		J(E, (e) => {
			t.collapse && e(D);
		}), N(C), N(m);
		var O = B(m, 2), ee = (e) => {
			var r = vs();
			Y(r, 23, () => t.view.sections, (e) => e.id, (e, t, r) => {
				var l = _s(), u = R(l, !0);
				N(l), V((e) => {
					Z(l, "id", e), Z(l, "aria-selected", H(o)?.id === H(t).id), Z(l, "aria-controls", n + "-panel"), Z(l, "tabindex", H(o)?.id === H(t).id ? 0 : -1), q(u, H(t).label);
				}, [() => s(H(t).id)]), W("click", l, () => {
					L(a, {
						scope: H(i),
						id: H(t).id
					}, !0);
				}), U("keydown", l, (e) => c(e, H(r)), !0), K(e, l);
			}), N(r), K(e, r);
		};
		J(O, (e) => {
			t.view.sections.length && e(ee);
		});
		var k = B(O, 2), A = R(k), te = (e) => {
			let t = /* @__PURE__ */ P(() => H(o));
			var r = Ss(), i = R(r), a = R(i), c = R(a), l = R(c, !0);
			N(c);
			var u = B(c), d = R(u, !0);
			N(u), N(a);
			var f = B(a, 2), p = (e) => {
				var n = ys(), r = R(n, !0);
				N(n), V(() => q(r, H(t).text)), K(e, n);
			}, m = (e) => {
				var n = bs(), r = R(n, !0);
				N(n), V(() => q(r, H(t).text)), K(e, n);
			};
			J(f, (e) => {
				H(t).format === "omitted" ? e(p) : e(m, -1);
			});
			var h = B(f, 2), g = (e) => {
				var n = xs(), r = R(n);
				N(n), V(() => q(r, `Truncated diagnostic${H(t).format === "json-prefix-text" ? " · JSON prefix shown as text" : ""}`)), K(e, n);
			};
			J(h, (e) => {
				H(t).truncated && e(g);
			}), N(i), N(r), V((e) => {
				Z(r, "id", n + "-panel"), Z(r, "aria-labelledby", e), Z(i, "data-artifact-kind", H(t).kind), q(l, H(t).label), q(d, H(t).kind);
			}, [() => s(H(t).id)]), U("keydown", r, (e) => e.stopPropagation(), !0), U("paste", r, (e) => e.stopPropagation(), !0), K(e, r);
		}, ne = (e) => {
			var n = Cs(), r = R(n, !0);
			N(n), V(() => q(r, t.view.status === "not-run" ? "Run this workflow or use Run to here to inspect an output." : "No recorded artifact is available for this output.")), K(e, n);
		};
		J(A, (e) => {
			H(o) ? e(te) : e(ne, -1);
		});
		var j = B(A, 2), re = (e) => {
			var n = ws(), r = R(n), i = R(r);
			N(r), Y(B(r, 2), 17, () => t.view.settlement.receipts, (e) => e.intentId + ":" + e.targetId, (e, t) => {
				var n = ys(), r = R(n);
				N(n), V(() => q(r, `${H(t).targetId ?? ""} · ${H(t).status ?? ""}${H(t).error ? " · " + H(t).error.message : ""}`)), K(e, n);
			}), N(n), V(() => q(i, `Accepted consequences · ${t.view.settlement.status === "settled" ? "Saved" : t.view.settlement.status === "partial" ? "Some targets failed" : "Save confirmation needed"}`)), K(e, n);
		};
		J(j, (e) => {
			t.view.settlement && e(re);
		});
		var ie = B(j, 2), ae = (e) => {
			var n = ys(), r = R(n, !0);
			N(n), V(() => q(r, t.view.statusDetail)), K(e, n);
		};
		J(ie, (e) => {
			t.view.statusDetail && e(ae);
		});
		var oe = B(ie, 2);
		Y(oe, 17, () => t.view.sections.filter((e) => e.id !== H(o)?.id && (e.format === "omitted" || e.truncated)), (e) => e.id, (e, t) => {
			var n = ys(), r = R(n);
			N(n), V(() => q(r, `${H(t).label ?? ""}: ${(H(t).format === "omitted" ? H(t).text : "Truncated diagnostic" + (H(t).format === "json-prefix-text" ? " · JSON prefix shown as text" : "")) ?? ""}`)), K(e, n);
		});
		var se = B(oe, 2), ce = (e) => {
			var n = ys(), r = R(n, !0);
			N(n), V(() => q(r, t.view.runHere.issue)), K(e, n);
		};
		J(se, (e) => {
			t.view.runHere?.issue && e(ce);
		});
		var le = B(se, 2);
		Y(le, 17, () => t.view.issues, Gr, (e, t) => {
			var n = Ts(), r = R(n, !0);
			N(n), V(() => q(r, H(t))), K(e, n);
		});
		var ue = B(le, 2), de = (e) => {
			var n = Ts(), r = R(n, !0);
			N(n), V(() => q(r, t.view.review.issue)), K(e, n);
		};
		J(ue, (e) => {
			t.view.review?.issue && e(de);
		});
		var fe = B(ue, 2), pe = (e) => {
			var n = xs(), r = R(n, !0);
			N(n), V(() => q(r, t.view.review.persistOnly ? "Retry keeps the accepted reply and retries failed targets. No model request is made." : "Apply rechecks the source, connection and final evidence. Recorded preview text may be truncated.")), K(e, n);
		};
		J(fe, (e) => {
			t.view.review && e(pe);
		}), N(k);
		var me = B(k, 2), he = R(me), ge = R(he, !0);
		N(he);
		var _e = B(he, 2), ve = R(_e, !0);
		N(_e);
		var ye = B(_e, 2), be = (e) => {
			var n = Es(), i = R(n);
			N(n), V(() => {
				n.disabled = !H(p), q(i, `Run to here · maximum ${t.view.runHere.callBound ?? ""} ${t.view.runHere.callBound === 1 ? "request" : "requests"}`);
			}), W("click", n, () => {
				t.view && H(l) && H(p) && r().runHere?.(t.view.sourceKey, f(H(l).target));
			}), K(e, n);
		};
		J(ye, (e) => {
			t.view.runHere && e(be);
		});
		var xe = B(ye, 2), Se = (e) => {
			var n = Ds(), i = z(n), a = R(i, !0);
			N(i);
			var o = B(i), s = R(o, !0);
			N(o), V(() => {
				i.disabled = !H(h), q(a, t.view.review.persistOnly ? "Retry failed persistence" : "Apply reviewed candidate"), o.disabled = !H(g), q(s, t.view.review.persistOnly ? "Close persistence review" : "Reject candidate");
			}), W("click", i, () => {
				t.view?.review && H(h) && r().apply?.(v(t.view.review.selector));
			}), W("click", o, () => {
				t.view?.review && H(g) && r().reject?.(v(t.view.review.selector));
			}), K(e, n);
		};
		J(xe, (e) => {
			t.view.review && e(Se);
		}), N(me), V((e) => {
			q(b, H(l)?.label ?? t.view.title), Z(w, "title", t.view.pinned ? "Unpin and follow selection" : "Keep this output visible"), Z(w, "aria-pressed", t.view.pinned), w.disabled = t.view.pinned ? !r().follow : !H(l) || !r().pin, q(T, t.view.pinned ? "Pinned output" : "Pin output"), Z(he, "data-status", t.view.status), q(ge, e), q(ve, t.view.pinned ? "Pinned preview" : t.view.followSelection ? "Following selection" : "Selection not followed");
		}, [() => u(t.view.status)]), W("click", w, () => {
			t.view?.pinned ? r().follow?.() : t.view && H(l) && r().pin?.(t.view.sourceKey, f(H(l).target));
		}), K(e, d);
	}, S = (e) => {
		K(e, ks());
	};
	J(b, (e) => {
		t.view ? e(x) : e(S, -1);
	}), N(y), K(e, y), Ue();
}
wr(["change", "click"]);
//#endregion
//#region ui/RunDetails.svelte
var Ms = /* @__PURE__ */ G("<p class=\"pc-run-memory svelte-f9s2fm\" role=\"status\"> </p>"), Ns = /* @__PURE__ */ G("<p class=\"pc-run-error svelte-f9s2fm\"> </p>"), Ps = /* @__PURE__ */ G("<p class=\"pc-run-empty svelte-f9s2fm\">No execution plan has been recorded.</p>"), Fs = /* @__PURE__ */ G("<span aria-hidden=\"true\" class=\"svelte-f9s2fm\">▱</span>"), Is = /* @__PURE__ */ G("<small class=\"svelte-f9s2fm\"> </small>"), Ls = /* @__PURE__ */ G("<details class=\"svelte-f9s2fm\"><summary class=\"svelte-f9s2fm\">Reported usage</summary><div class=\"pc-run-usage svelte-f9s2fm\"><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small></div></details>"), Rs = /* @__PURE__ */ G("<li class=\"svelte-f9s2fm\"><div class=\"pc-run-row-heading svelte-f9s2fm\"><button type=\"button\" class=\"svelte-f9s2fm\"><!> </button><span class=\"pc-run-status svelte-f9s2fm\"> </span></div> <!> <div class=\"pc-run-row-meta svelte-f9s2fm\"><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small></div> <!> <!></li>"), zs = /* @__PURE__ */ G("<header class=\"svelte-f9s2fm\"><h3 class=\"svelte-f9s2fm\">Run details</h3><span class=\"pc-run-status svelte-f9s2fm\"> </span></header> <div class=\"pc-run-summary svelte-f9s2fm\"><p class=\"svelte-f9s2fm\"> </p><p class=\"svelte-f9s2fm\"> </p><p class=\"svelte-f9s2fm\"> </p></div> <!> <!> <!> <ol class=\"pc-run-rows svelte-f9s2fm\"></ol>", 1), Bs = /* @__PURE__ */ G("<p class=\"pc-run-empty svelte-f9s2fm\">Run a workflow to inspect its processing stages.</p>"), Vs = /* @__PURE__ */ G("<section class=\"pc-run-details svelte-f9s2fm\" aria-label=\"Run details\"><!></section>");
function Hs(e, t) {
	He(t, !0);
	let n = ki(t, "actions", 19, () => ({})), r = (e) => e === "not-run" ? "Not run" : e === "empty" ? "Ready" : e.charAt(0).toUpperCase() + e.slice(1), i = (e) => e !== null && Number.isFinite(e) && e >= 0 ? (e / 1e3).toFixed(2) + "s" : "Unknown", a = (e) => e != null && Number.isFinite(e) && e >= 0 ? String(e) : "Unknown";
	var o = Vs(), s = R(o), c = (e) => {
		var o = zs(), s = z(o), c = B(R(s)), l = R(c, !0);
		N(c), N(s);
		var u = B(s, 2), d = R(u), f = R(d);
		N(d);
		var p = B(d), m = R(p);
		N(p);
		var h = B(p), g = R(h);
		N(h), N(u);
		var _ = B(u, 2), v = (e) => {
			var n = Ms(), r = R(n, !0);
			N(n), V(() => q(r, t.view.memoryStatus)), K(e, n);
		};
		J(_, (e) => {
			t.view.memoryStatus && e(v);
		});
		var y = B(_, 2), b = (e) => {
			var n = Ns(), r = R(n, !0);
			N(n), V(() => q(r, t.view.issue)), K(e, n);
		};
		J(y, (e) => {
			t.view.issue && e(b);
		});
		var x = B(y, 2), S = (e) => {
			K(e, Ps());
		};
		J(x, (e) => {
			t.view.rows.length || e(S);
		});
		var C = B(x, 2);
		Y(C, 21, () => t.view.rows, (e) => e.key, (e, o) => {
			var s = Rs();
			let c;
			var l = R(s), u = R(l), d = R(u), f = (e) => {
				K(e, Fs());
			};
			J(d, (e) => {
				H(o).kind === "instance" && e(f);
			});
			var p = B(d, 1, !0);
			N(u);
			var m = B(u), h = R(m, !0);
			N(m), N(l);
			var g = B(l, 2), _ = (e) => {
				var t = Is(), n = R(t, !0);
				N(t), V((e) => q(n, e), [() => r(H(o).subphase)]), K(e, t);
			};
			J(g, (e) => {
				H(o).subphase && e(_);
			});
			var v = B(g, 2), y = R(v), b = R(y);
			N(y);
			var x = B(y), S = R(x);
			N(x), N(v);
			var C = B(v, 2), w = (e) => {
				var t = Ns(), n = R(t, !0);
				N(t), V(() => q(n, H(o).issue)), K(e, t);
			};
			J(C, (e) => {
				H(o).issue && e(w);
			});
			var T = B(C, 2), E = (e) => {
				var t = Ls(), n = B(R(t)), r = R(n), i = R(r);
				N(r);
				var s = B(r), c = R(s);
				N(s);
				var l = B(s), u = R(l);
				N(l);
				var d = B(l), f = R(d);
				N(d), N(n), N(t), V((e, t, n) => {
					q(i, `Input tokens: ${e ?? ""}`), q(c, `Output tokens: ${t ?? ""}`), q(u, `Total tokens: ${n ?? ""}`), q(f, `Cost: ${H(o).usage?.cost ?? "Unknown" ?? ""}`);
				}, [
					() => a(H(o).usage?.inputTokens),
					() => a(H(o).usage?.outputTokens),
					() => a(H(o).usage?.totalTokens)
				]), K(e, t);
			};
			J(T, (e) => {
				H(o).kind === "primitive" && e(E);
			}), N(s), V((e, t, r) => {
				Z(s, "data-run-row", H(o).key), Z(s, "data-depth", H(o).depth), Z(s, "data-status", H(o).status), c = di(s, "", c, e), Z(u, "aria-label", "Open " + H(o).title + " in graph"), u.disabled = !n().jump, q(p, H(o).title), Z(m, "data-status", H(o).status), q(h, t), q(b, `Duration: ${r ?? ""}`), q(S, `${H(o).attempts ?? ""} of ${H(o).callBound ?? ""} requests`);
			}, [
				() => ({ "margin-left": `${Math.max(0, Math.min(8, H(o).depth)) * 12}px` }),
				() => r(H(o).status),
				() => i(H(o).durationMs)
			]), W("click", u, () => {
				t.view && n().jump?.(t.view.runId, {
					...H(o).address,
					instancePath: [...H(o).address.instancePath]
				});
			}), K(e, s);
		}), N(C), V((e, n) => {
			Z(c, "data-status", t.view.status), q(l, e), q(f, `${t.view.completedCount ?? ""} of ${t.view.executableCount ?? ""} stages complete`), q(m, `${t.view.actualCalls ?? ""} of ${t.view.callBound ?? ""} requests`), q(g, `Elapsed: ${n ?? ""}`);
		}, [() => r(t.view.status), () => i(t.view.elapsedMs)]), K(e, o);
	}, l = (e) => {
		K(e, Bs());
	};
	J(s, (e) => {
		t.view ? e(c) : e(l, -1);
	}), N(o), K(e, o), Ue();
}
wr(["click"]);
//#endregion
//#region ui/RunMeter.svelte
var Us = /* @__PURE__ */ G("<span class=\"pc-run-meter-elapsed svelte-1tkcp3\" data-run-elapsed=\"\"> </span>"), Ws = /* @__PURE__ */ G("<span class=\"pc-run-pixel svelte-1tkcp3\" data-run-pixel=\"\"></span>"), Gs = /* @__PURE__ */ G("<button class=\"pc-run-meter svelte-1tkcp3\"><span class=\"pc-run-meter-label svelte-1tkcp3\"> </span> <!> <span class=\"pc-run-meter-pixels svelte-1tkcp3\" aria-hidden=\"true\"></span></button>");
function Ks(e, t) {
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
	], i = /* @__PURE__ */ P(() => {
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
	}), a = /* @__PURE__ */ P(() => t.view ? "Open run details. " + n(t.view.status) + ". " + t.view.completedCount + " of " + t.view.executableCount + " stages complete. " + t.view.actualCalls + " of " + t.view.callBound + " requests." : "Open run details");
	var o = Fr(), s = z(o), c = (e) => {
		var r = Gs(), o = R(r), s = R(o, !0);
		N(o);
		var c = B(o, 2), l = (e) => {
			var n = Us(), r = R(n);
			N(n), V((e) => q(r, `${e ?? ""}s`), [() => (t.view.elapsedMs / 1e3).toFixed(1)]), K(e, n);
		}, u = /* @__PURE__ */ P(() => t.view.elapsedMs !== null && Number.isFinite(t.view.elapsedMs) && t.view.elapsedMs >= 0);
		J(c, (e) => {
			H(u) && e(l);
		});
		var d = B(c, 2);
		Y(d, 21, () => H(i), (e) => e.key, (e, t) => {
			var n = Ws();
			V(() => {
				Z(n, "data-status", H(t).status), Z(n, "title", H(t).title);
			}), K(e, n);
		}), N(d), N(r), V((e) => {
			Z(r, "aria-label", H(a)), Z(r, "title", H(a)), r.disabled = !t.open, q(s, e);
		}, [() => n(t.view.status)]), W("click", r, () => t.open?.()), K(e, r);
	};
	J(s, (e) => {
		t.view && e(c);
	}), K(e, o), Ue();
}
wr(["click"]);
//#endregion
//#region ui/PortalManager.svelte
var qs = /* @__PURE__ */ G("<button type=\"button\" class=\"svelte-mnv790\">Close</button>"), Js = /* @__PURE__ */ G("<option class=\"svelte-mnv790\"> </option>"), Ys = /* @__PURE__ */ G("<label class=\"svelte-mnv790\">Portal name<input aria-label=\"Portal name\" class=\"svelte-mnv790\"/></label> <p class=\"pc-note svelte-mnv790\"> </p> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-rename=\"\" class=\"svelte-mnv790\">Rename</button></div>", 1), Xs = /* @__PURE__ */ G("<p class=\"pc-note svelte-mnv790\">Select a portal or create one from an output.</p>"), Zs = /* @__PURE__ */ G("<button type=\"button\" data-portal-jump-source=\"\" class=\"svelte-mnv790\">Jump to source</button>"), Qs = /* @__PURE__ */ G("<label class=\"pc-check svelte-mnv790\"><input type=\"checkbox\" aria-label=\"Replace existing connection\" class=\"svelte-mnv790\"/>Replace existing connection</label>"), $s = /* @__PURE__ */ G("<button type=\"button\" data-portal-jump-consumer=\"\" class=\"svelte-mnv790\">Jump</button>"), ec = /* @__PURE__ */ G("<div class=\"pc-consumer svelte-mnv790\"><span class=\"svelte-mnv790\"> </span><div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-restore=\"\" class=\"svelte-mnv790\">Restore wire</button> <!></div></div>"), tc = /* @__PURE__ */ G("<p class=\"pc-note svelte-mnv790\">No consumers.</p>"), nc = /* @__PURE__ */ G("<label class=\"svelte-mnv790\">Existing consumers<select aria-label=\"Existing consumers\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Choose before deleting…</option><option class=\"svelte-mnv790\">Restore visible wires</option><option class=\"svelte-mnv790\">Disconnect consumers</option></select></label>"), rc = /* @__PURE__ */ G("<details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Consumers</summary> <label class=\"svelte-mnv790\">Compatible receiver<select aria-label=\"Compatible receiver\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select input…</option><!></select></label> <!> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-connect=\"\" class=\"svelte-mnv790\">Connect receiver</button></div> <!> <!> <!> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-delete=\"\" class=\"svelte-mnv790\">Delete portal</button></div></details>"), ic = /* @__PURE__ */ G("<details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Convert to portal</summary><p class=\"pc-note svelte-mnv790\"> </p><div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-convert=\"\" class=\"svelte-mnv790\"> </button></div></details>"), ac = /* @__PURE__ */ G("<p class=\"pc-error svelte-mnv790\"> </p>"), oc = /* @__PURE__ */ G("<p class=\"pc-error svelte-mnv790\" role=\"alert\"> </p>"), sc = /* @__PURE__ */ G("<p class=\"pc-note svelte-mnv790\" role=\"status\">Preparing change…</p>"), cc = /* @__PURE__ */ G("<p class=\"pc-note svelte-mnv790\"> </p> <label class=\"svelte-mnv790\">Portal<select aria-label=\"Selected portal\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select portal…</option><!></select></label> <!> <details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Source</summary> <label class=\"svelte-mnv790\">Output<select aria-label=\"Portal source\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select output…</option><!></select></label> <label class=\"svelte-mnv790\">New portal name<input aria-label=\"New portal name\" class=\"svelte-mnv790\"/></label> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-create=\"\" class=\"svelte-mnv790\">Create portal</button> <button type=\"button\" data-portal-retarget=\"\" class=\"svelte-mnv790\">Retarget</button> <!></div></details> <!> <!> <!> <!> <!>", 1), lc = /* @__PURE__ */ G("<p class=\"pc-note svelte-mnv790\">Open a graph to manage its portals.</p>"), uc = /* @__PURE__ */ G("<section class=\"pc-manager svelte-mnv790\" aria-label=\"Manage portals\"><header class=\"svelte-mnv790\"><h2 class=\"svelte-mnv790\">Manage portals</h2><!></header> <!></section>");
function dc(e, t) {
	He(t, !0);
	let n = ki(t, "actions", 19, () => ({})), r = /* @__PURE__ */ I(""), i = /* @__PURE__ */ I(""), a = /* @__PURE__ */ I(""), o = /* @__PURE__ */ I(""), s = /* @__PURE__ */ I(""), c = /* @__PURE__ */ I(!1), l = /* @__PURE__ */ I(""), u = /* @__PURE__ */ I(""), d = "", f = 0, p = !0, m = (e) => JSON.stringify(e.kind === "graph" ? [
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
	]), h = /* @__PURE__ */ P(() => t.view?.publishers.find((e) => e.id === t.view.selectedPortalId)), g = /* @__PURE__ */ P(() => !!t.view && !!H(h) && t.view.capabilities.rename && (t.view.renameMode === "presentation" ? t.view.canPresent : t.view.scope.kind === "graph" && !t.view.readOnly) && !!n().rename), _ = /* @__PURE__ */ P(() => t.view?.sources.find((e) => e.key === H(a) && e.direction === "output")), v = /* @__PURE__ */ P(() => t.view?.receivers.find((e) => e.key === H(o) && e.direction === "input" && e.kind === H(h)?.kind)), y = /* @__PURE__ */ P(() => !!H(h) && !!H(v) && (!H(v).occupied || H(c)) && C("connect") && !!n().connect), b = /* @__PURE__ */ P(() => !!H(h) && C("remove") && !!n().deletePublisher && (!t.view?.consumers.length || H(s) === "restore" || H(s) === "disconnect"));
	xn(() => {
		let e = t.view ? JSON.stringify([
			t.view.managerKey,
			t.view.revision,
			m(t.view.scope),
			t.view.selectedPortalId,
			t.view.renameMode
		]) : "";
		d !== e && (d = e, L(r, H(h)?.label ?? "", !0), L(i, ""), L(a, t.view?.sources.find((e) => e.nodeId === H(h)?.source.nodeId && e.portId === H(h)?.source.portId)?.key ?? "", !0), L(o, ""), L(s, ""), L(c, !1), L(l, ""), L(u, ""), f++);
	}), ji(() => {
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
		L(l, ""), L(u, ""), f++;
	}
	async function T(e, n, r) {
		if (!t.view || !n || H(u)) return;
		let i = x(t.view), a = ++f, o = t.view.selectedPortalId;
		L(u, e, !0), L(l, "");
		try {
			let e = await r(i);
			p && a === f && t.view?.managerKey === i.managerKey && t.view.revision === i.revision && m(t.view.scope) === m(i.scope) && t.view.selectedPortalId === o && (L(u, ""), L(l, e.ok ? "" : e.error.code + ": " + e.error.message, !0));
		} catch (e) {
			p && a === f && t.view?.managerKey === i.managerKey && t.view.revision === i.revision && m(t.view.scope) === m(i.scope) && t.view.selectedPortalId === o && (L(u, ""), L(l, e instanceof Error ? e.message : "The portal change could not be accepted.", !0));
		}
	}
	var E = uc(), D = R(E), O = B(R(D)), ee = (e) => {
		var t = qs();
		W("click", t, () => n().close?.()), K(e, t);
	};
	J(O, (e) => {
		n().close && e(ee);
	}), N(D);
	var k = B(D, 2), A = (e) => {
		var d = cc(), f = z(d), p = R(f);
		N(f);
		var m = B(f, 2), E = B(R(m)), D = R(E);
		D.value = D.__value = "", Y(B(D), 17, () => t.view.publishers, (e) => e.id, (e, t) => {
			var n = Js(), r = R(n);
			N(n);
			var i = {};
			V(() => {
				q(r, `${H(t).label ?? ""} · ${H(t).kind ?? ""}`), i !== (i = H(t).id) && (n.value = (n.__value = H(t).id) ?? "");
			}), K(e, n);
		}), N(E);
		var O;
		pi(E), N(m);
		var ee = B(m, 2), k = (e) => {
			var i = Ys(), a = z(i), o = B(R(a));
			X(o), N(a);
			var s = B(a, 2), c = R(s);
			N(s);
			var l = B(s, 2), d = R(l);
			N(l), V(() => {
				bi(o, H(r)), o.disabled = !H(g), q(c, `${t.view.renameMode === "presentation" ? "Local workspace label · not exported" : "Authored portal label"} · ${H(h).kind ?? ""}`), d.disabled = !H(g) || !!H(u);
			}), W("input", o, (e) => {
				L(r, e.currentTarget.value, !0), w();
			}), W("click", d, () => {
				let e = H(h)?.id, i = t.view?.renameMode, a = H(r);
				e && i && n().rename && T("rename", H(g), (t) => n().rename(t, e, a, i));
			}), K(e, i);
		}, A = (e) => {
			K(e, Xs());
		};
		J(ee, (e) => {
			H(h) ? e(k) : e(A, -1);
		});
		var te = B(ee, 2), ne = B(R(te), 2), j = B(R(ne)), re = R(j);
		re.value = re.__value = "", Y(B(re), 17, () => t.view.sources, (e) => e.key, (e, t) => {
			var n = Js(), r = R(n);
			N(n);
			var i = {};
			V(() => {
				q(r, `${H(t).label ?? ""} · ${H(t).kind ?? ""}`), i !== (i = H(t).key) && (n.value = (n.__value = H(t).key) ?? "");
			}), K(e, n);
		}), N(j);
		var ie;
		pi(j), N(ne);
		var ae = B(ne, 2), oe = B(R(ae));
		X(oe), N(ae);
		var se = B(ae, 2), ce = R(se), le = B(ce, 2), ue = B(le, 2), de = (e) => {
			var r = Zs();
			W("click", r, () => {
				t.view && H(h) && n().jumpSource?.(x(t.view), S(H(h).source));
			}), K(e, r);
		};
		J(ue, (e) => {
			H(h) && n().jumpSource && e(de);
		}), N(se), N(te);
		var fe = B(te, 2), pe = (e) => {
			var r = rc(), i = B(R(r), 2), a = B(R(i)), l = R(a);
			l.value = l.__value = "", Y(B(l), 17, () => t.view.receivers, (e) => e.key, (e, t) => {
				var n = Js(), r = R(n);
				N(n);
				var i = {};
				V(() => {
					q(r, `${H(t).label ?? ""}${H(t).occupied ? " · Connected" : ""}`), i !== (i = H(t).key) && (n.value = (n.__value = H(t).key) ?? "");
				}), K(e, n);
			}), N(a);
			var d;
			pi(a), N(i);
			var f = B(i, 2), p = (e) => {
				var t = Qs(), n = R(t);
				X(n), je(), N(t), V((e) => {
					xi(n, H(c)), n.disabled = e;
				}, [() => !C("connect")]), W("change", n, (e) => {
					L(c, e.currentTarget.checked, !0), w();
				}), K(e, t);
			};
			J(f, (e) => {
				H(v)?.occupied && e(p);
			});
			var m = B(f, 2), g = R(m);
			N(m);
			var _ = B(m, 2);
			Y(_, 17, () => t.view.consumers, (e) => e.edgeId, (e, r) => {
				var i = ec(), a = R(i), o = R(a, !0);
				N(a);
				var s = B(a), c = R(s), l = B(c, 2), d = (e) => {
					var i = $s();
					W("click", i, () => {
						let e = t.view?.consumers.find((e) => e.edgeId === H(r).edgeId);
						t.view && e && n().jumpConsumer?.(x(t.view), e.edgeId, S(e.to));
					}), K(e, i);
				};
				J(l, (e) => {
					n().jumpConsumer && e(d);
				}), N(s), N(i), V((e) => {
					q(o, H(r).label), c.disabled = e;
				}, [() => !C("restore") || !n().restoreWire || !!H(u)]), W("click", c, () => {
					let e = t.view?.consumers.find((e) => e.edgeId === H(r).edgeId);
					e && n().restoreWire && T("restore", C("restore"), (t) => n().restoreWire(t, e.edgeId));
				}), K(e, i);
			});
			var E = B(_, 2), D = (e) => {
				K(e, tc());
			};
			J(E, (e) => {
				t.view.consumers.length || e(D);
			});
			var O = B(E, 2), ee = (e) => {
				var t = nc(), n = B(R(t)), r = R(n);
				r.value = r.__value = "";
				var i = B(r);
				i.value = i.__value = "restore";
				var a = B(i);
				a.value = a.__value = "disconnect", N(n);
				var o;
				pi(n), N(t), V((e) => {
					n.disabled = e, o !== (o = H(s)) && (n.value = (n.__value = H(s)) ?? "", fi(n, H(s)));
				}, [() => !C("remove")]), W("change", n, (e) => {
					L(s, e.currentTarget.value, !0), w();
				}), K(e, t);
			};
			J(O, (e) => {
				t.view.consumers.length && e(ee);
			});
			var k = B(O, 2), A = R(k);
			N(k), N(r), V((e) => {
				a.disabled = e, d !== (d = H(o)) && (a.value = (a.__value = H(o)) ?? "", fi(a, H(o))), g.disabled = !H(y) || !!H(u), A.disabled = !H(b) || !!H(u);
			}, [() => !C("connect") || !n().connect]), W("change", a, (e) => {
				L(o, e.currentTarget.value, !0), L(c, !1), w();
			}), W("click", g, () => {
				let e = H(v), t = H(h)?.id, r = H(c);
				e && t && n().connect && T("connect", H(y), (i) => n().connect(i, t, S(e), r));
			}), W("click", A, () => {
				let e = H(h)?.id, r = t.view?.consumers.length ? H(s) : "restore";
				e && (r === "restore" || r === "disconnect") && n().deletePublisher && T("remove", H(b), (t) => n().deletePublisher(t, e, r));
			}), K(e, r);
		};
		J(fe, (e) => {
			H(h) && e(pe);
		});
		var me = B(fe, 2), he = (e) => {
			var r = ic(), i = B(R(r)), a = R(i, !0);
			N(i);
			var o = B(i), s = R(o), c = R(s);
			N(s), N(o), N(r), V((e) => {
				q(a, t.view.conversion.label), s.disabled = e, q(c, `Convert ${t.view.conversion.kind === "wire" ? "wire" : "output"}`);
			}, [() => !C("convert") || !!H(u) || (t.view.conversion.kind === "wire" ? !n().convertWire : !n().convertOutput)]), W("click", s, () => {
				let e = t.view?.conversion;
				e?.kind === "wire" && n().convertWire ? T("convert", C("convert"), (t) => n().convertWire(t, e.edgeId)) : e?.kind === "output" && n().convertOutput && T("convert", C("convert"), (t) => n().convertOutput(t, S(e.endpoint)));
			}), K(e, r);
		};
		J(me, (e) => {
			t.view.conversion && e(he);
		});
		var ge = B(me, 2), _e = (e) => {
			var n = ac(), r = R(n, !0);
			N(n), V(() => q(r, t.view.issue)), K(e, n);
		};
		J(ge, (e) => {
			t.view.issue && e(_e);
		});
		var ve = B(ge, 2), ye = (e) => {
			var t = oc(), n = R(t, !0);
			N(t), V(() => q(n, H(l))), K(e, t);
		};
		J(ve, (e) => {
			H(l) && e(ye);
		});
		var be = B(ve, 2), xe = (e) => {
			K(e, sc());
		};
		J(be, (e) => {
			H(u) && e(xe);
		}), V((e, r, o, s) => {
			q(p, `${t.view.scopeLabel ?? ""}${t.view.readOnly ? " · Read-only graph" : ""}`), E.disabled = !n().selectPortal, O !== (O = t.view.selectedPortalId ?? "") && (E.value = (E.__value = t.view.selectedPortalId ?? "") ?? "", fi(E, t.view.selectedPortalId ?? "")), j.disabled = e, ie !== (ie = H(a)) && (j.value = (j.__value = H(a)) ?? "", fi(j, H(a))), bi(oe, H(i)), oe.disabled = r, ce.disabled = o, le.disabled = s;
		}, [
			() => !C("create") && !C("retarget"),
			() => !C("create") || !n().create,
			() => !C("create") || !n().create || !H(_) || !H(i).trim() || !!H(u),
			() => !C("retarget") || !n().retarget || !H(_) || !H(h) || !!H(u)
		]), W("change", E, (e) => {
			let r = e.currentTarget.value;
			e.currentTarget.selectedIndex >= 0 && t.view && n().selectPortal && (!r || t.view.publishers.some((e) => e.id === r)) && n().selectPortal(x(t.view), r || null);
		}), W("change", j, (e) => {
			L(a, e.currentTarget.value, !0), w();
		}), W("input", oe, (e) => {
			L(i, e.currentTarget.value, !0), w();
		}), W("click", ce, () => {
			let e = H(_), t = H(i);
			e && t.trim() && n().create && T("create", C("create"), (r) => n().create(r, t, S(e)));
		}), W("click", le, () => {
			let e = H(_), t = H(h)?.id;
			e && t && n().retarget && T("retarget", C("retarget"), (r) => n().retarget(r, t, S(e)));
		}), K(e, d);
	}, te = (e) => {
		K(e, lc());
	};
	J(k, (e) => {
		t.view ? e(A) : e(te, -1);
	}), N(E), K(e, E), Ue();
}
wr([
	"click",
	"change",
	"input"
]);
//#endregion
//#region ui/SubgraphSave.svelte
var fc = /* @__PURE__ */ G("<option class=\"svelte-1n658sg\"> </option>"), pc = /* @__PURE__ */ G("<p class=\"pc-save-error svelte-1n658sg\" role=\"alert\"> </p>"), mc = /* @__PURE__ */ G("<div class=\"pc-workspace-overlay svelte-1n658sg\"><div class=\"pc-workspace-dialog pc-subgraph-save svelte-1n658sg\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Save subgraph\" tabindex=\"-1\"><header class=\"svelte-1n658sg\"><h2 class=\"svelte-1n658sg\">Save subgraph</h2><button type=\"button\" aria-label=\"Close save subgraph\" class=\"svelte-1n658sg\">×</button></header> <form class=\"svelte-1n658sg\"><label class=\"svelte-1n658sg\">Name<input aria-label=\"Subgraph name\" maxlength=\"80\" class=\"svelte-1n658sg\"/></label> <label class=\"svelte-1n658sg\">Save as<select aria-label=\"Save as\" class=\"svelte-1n658sg\"><option class=\"svelte-1n658sg\">Save new subgraph</option><!></select></label> <p class=\"svelte-1n658sg\">Edits stay local until you save. Existing placed copies stay unchanged.</p> <!> <footer class=\"svelte-1n658sg\"><button type=\"button\" class=\"svelte-1n658sg\">Cancel</button><button type=\"submit\" data-save-subgraph=\"\" class=\"svelte-1n658sg\"> </button></footer></form></div></div>");
function hc(e, t) {
	He(t, !0);
	let n, r = /* @__PURE__ */ I(""), i = /* @__PURE__ */ I(""), a = /* @__PURE__ */ I(!1), o = /* @__PURE__ */ I(""), s = "", c = 0;
	xn(() => {
		if (t.view.key === s) return;
		s = t.view.key, c++, L(r, t.view.name, !0), L(i, t.view.targetId ?? "", !0), L(a, !1), L(o, "");
		let e = s;
		fr().then(() => {
			if (t.view.key === e) {
				let e = n?.querySelector("input");
				e?.focus({ preventScroll: !0 }), e?.select();
			}
		});
	}), Ai(() => {
		let e = document.activeElement;
		return () => e?.focus({ preventScroll: !0 });
	});
	async function l(e) {
		if (e.preventDefault(), !t.actions || !H(r).trim() || H(a) || H(i) && !t.view.entries.some((e) => e.id === H(i))) return;
		let n = t.view.key, s = ++c;
		L(a, !0), L(o, "");
		try {
			await t.actions.save(n, H(r), H(i) || null);
		} catch {
			t.view.key === n && s === c && L(o, "The subgraph could not be saved. Please try again.");
		} finally {
			t.view.key === n && s === c && L(a, !1);
		}
	}
	function u(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), t.actions?.close()), e.key === "Tab") {
			let t = [...n.querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled)")], r = t[0], i = t.at(-1);
			e.shiftKey && document.activeElement === r && (e.preventDefault(), i?.focus()), !e.shiftKey && document.activeElement === i && (e.preventDefault(), r?.focus());
		}
	}
	var d = mc(), f = R(d), p = R(f), m = B(R(p));
	N(p);
	var h = B(p, 2), g = R(h), _ = B(R(g));
	X(_), N(g);
	var v = B(g, 2), y = B(R(v)), b = R(y);
	b.value = b.__value = "", Y(B(b), 17, () => t.view.entries, (e) => e.id, (e, t) => {
		var n = fc(), r = R(n);
		N(n);
		var i = {};
		V(() => {
			q(r, `Update ${H(t).name ?? ""}`), i !== (i = H(t).id) && (n.value = (n.__value = H(t).id) ?? "");
		}), K(e, n);
	}), N(y), N(v);
	var x = B(v, 4), S = (e) => {
		var n = pc(), r = R(n, !0);
		N(n), V(() => q(r, t.view.error || H(o))), K(e, n);
	};
	J(x, (e) => {
		(t.view.error || H(o)) && e(S);
	});
	var C = B(x, 2), w = R(C), T = B(w), E = R(T, !0);
	N(T), N(C), N(h), N(f), Q(f, (e) => n = e, () => n), N(d), V((e) => {
		T.disabled = e, q(E, H(a) ? "Saving…" : "Save");
	}, [() => !t.actions || !H(r).trim() || H(a)]), U("keydown", f, u, !0), U("paste", f, (e) => e.stopPropagation()), W("click", m, () => t.actions?.close()), U("submit", h, l), Ti(_, () => H(r), (e) => L(r, e)), mi(y, () => H(i), (e) => L(i, e)), W("click", w, () => t.actions?.close()), K(e, d), Ue();
}
wr(["click"]);
//#endregion
//#region ui/FastConnections.svelte
var gc = /* @__PURE__ */ G("<option class=\"svelte-1n96rai\"> </option>"), _c = /* @__PURE__ */ G("<p class=\"pc-fast-key-status svelte-1n96rai\"> </p>"), vc = /* @__PURE__ */ G("<p role=\"alert\" class=\"svelte-1n96rai\"> </p>"), yc = /* @__PURE__ */ G("<p role=\"status\" class=\"svelte-1n96rai\"> </p>"), bc = /* @__PURE__ */ G("<section class=\"pc-fast-connections svelte-1n96rai\" aria-label=\"Fast connection setup\"><p class=\"svelte-1n96rai\">Configure a typed Jev, Laya or compatible model for Fast Decision. Node settings keep only the connection ID.</p> <label class=\"svelte-1n96rai\">Configured Fast connection<select aria-label=\"Configured Fast connection\" class=\"svelte-1n96rai\"><option class=\"svelte-1n96rai\">New connection</option><!></select></label> <div class=\"pc-fast-fields svelte-1n96rai\"><label class=\"svelte-1n96rai\">Connection ID<input aria-label=\"Connection ID\" maxlength=\"128\" class=\"svelte-1n96rai\"/></label> <label class=\"svelte-1n96rai\">Connection name<input aria-label=\"Connection name\" maxlength=\"256\" class=\"svelte-1n96rai\"/></label> <label class=\"svelte-1n96rai\">Provider<select aria-label=\"Provider\" class=\"svelte-1n96rai\"><option class=\"svelte-1n96rai\">Jev API</option><option class=\"svelte-1n96rai\">Laya</option><option class=\"svelte-1n96rai\">Compatible typed API</option></select></label> <label class=\"svelte-1n96rai\">Typed model<input aria-label=\"Typed model\" maxlength=\"256\" class=\"svelte-1n96rai\"/></label></div> <label class=\"svelte-1n96rai\">Typed endpoint<input aria-label=\"Typed endpoint\" type=\"url\" maxlength=\"2048\" class=\"svelte-1n96rai\"/></label> <small class=\"svelte-1n96rai\"> </small> <label class=\"svelte-1n96rai\">Session API key<input aria-label=\"Session API key\" type=\"password\" autocomplete=\"new-password\" spellcheck=\"false\" maxlength=\"8192\" class=\"svelte-1n96rai\"/></label> <small class=\"svelte-1n96rai\">Keys are session-only. Re-enter them after restarting SillyTavern. Leave this field empty to keep an existing session key.</small> <!> <!> <!> <footer class=\"svelte-1n96rai\"><button type=\"button\" class=\"svelte-1n96rai\"> </button><button type=\"button\" class=\"svelte-1n96rai\">Clear session key</button><button type=\"button\" class=\"svelte-1n96rai\">Remove connection</button><button type=\"button\" class=\"svelte-1n96rai\">Close</button></footer></section>");
function xc(e, t) {
	He(t, !0);
	let n = ki(t, "actions", 19, () => ({})), r = /* @__PURE__ */ I(""), i = /* @__PURE__ */ I(""), a = /* @__PURE__ */ I(""), o = /* @__PURE__ */ I("jev"), s = /* @__PURE__ */ I(""), c = /* @__PURE__ */ I(""), l = /* @__PURE__ */ I(""), u = /* @__PURE__ */ I(!1), d = /* @__PURE__ */ I(""), f = /* @__PURE__ */ I(""), p = /* @__PURE__ */ I($t(hr(() => t.view.userId))), m = 0, h = /* @__PURE__ */ P(() => t.view.connections.find((e) => e.id === H(r)));
	function g() {
		m++, L(p, t.view.userId, !0), v(""), L(f, "The active user changed. Choose a connection for this user.");
	}
	xn(() => {
		H(p) !== t.view.userId && g();
	});
	function _() {
		if (H(p) !== t.view.userId) return g(), null;
		let e = m, n = H(p);
		return {
			userId: n,
			current: () => m === e && H(p) === n && t.view.userId === n
		};
	}
	function v(e) {
		L(r, e, !0), L(l, ""), L(d, ""), L(f, "");
		let n = t.view.connections.find((t) => t.id === e);
		L(i, n?.id ?? "", !0), L(a, n?.label ?? "", !0), L(o, n?.provider ?? "jev", !0), L(s, n?.model ?? "", !0), L(c, n?.endpoint ?? "", !0);
	}
	function y(e) {
		e?.ok ? L(d, e.data?.message ?? "Connection settings updated.", !0) : L(f, e?.error.message ?? "Fast connection settings are unavailable.", !0);
	}
	async function b() {
		if (H(u) || !n().save) return;
		let e = _();
		if (!e) return;
		let t = H(l);
		L(l, ""), L(u, !0), L(d, ""), L(f, "");
		let p = {
			id: H(i),
			label: H(a) || H(i),
			provider: H(o),
			model: H(s),
			...H(o) === "jev" ? {} : { endpoint: H(c) }
		};
		try {
			let i = await n().save(p, t, e.userId);
			e.current() && (y(i), i.ok && L(r, p.id, !0));
		} catch {
			e.current() && L(f, "Fast connection settings could not be updated.");
		} finally {
			L(u, !1);
		}
	}
	async function x() {
		if (!H(r) || H(u) || !n().remove) return;
		let e = _();
		if (e) {
			L(l, ""), L(u, !0), L(f, ""), L(d, "");
			try {
				let t = await n().remove(H(r), e.userId);
				e.current() && (t.ok && v(""), y(t));
			} catch {
				e.current() && L(f, "The connection could not be removed.");
			} finally {
				L(u, !1);
			}
		}
	}
	async function S() {
		if (!H(r) || H(u) || !n().clearCredential) return;
		let e = _();
		if (e) {
			L(l, ""), L(u, !0), L(f, ""), L(d, "");
			try {
				let t = await n().clearCredential(H(r), e.userId);
				e.current() && y(t);
			} catch {
				e.current() && L(f, "The session key could not be cleared.");
			} finally {
				L(u, !1);
			}
		}
	}
	var C = bc(), w = B(R(C), 2), T = B(R(w)), E = R(T);
	E.value = E.__value = "", Y(B(E), 17, () => t.view.connections, (e) => e.id, (e, t) => {
		var n = gc(), r = R(n);
		N(n);
		var i = {};
		V(() => {
			q(r, `${H(t).label ?? ""} · ${H(t).provider ?? ""} · ${H(t).model ?? ""}`), i !== (i = H(t).id) && (n.value = (n.__value = H(t).id) ?? "");
		}), K(e, n);
	}), N(T);
	var D;
	pi(T), N(w);
	var O = B(w, 2), ee = R(O), k = B(R(ee));
	X(k), N(ee);
	var A = B(ee, 2), te = B(R(A));
	X(te), N(A);
	var ne = B(A, 2), j = B(R(ne)), re = R(j);
	re.value = re.__value = "jev";
	var ie = B(re);
	ie.value = ie.__value = "laya";
	var ae = B(ie);
	ae.value = ae.__value = "compatible", N(j);
	var oe;
	pi(j), N(ne);
	var se = B(ne, 2), ce = B(R(se));
	X(ce), N(se), N(O);
	var le = B(O, 2), ue = B(R(le));
	X(ue), N(le);
	var de = B(le, 2), fe = R(de, !0);
	N(de);
	var pe = B(de, 2), me = B(R(pe));
	X(me), N(pe);
	var he = B(pe, 4), ge = (e) => {
		var t = _c(), n = R(t);
		N(t), V(() => q(n, `Session key: ${H(h).credentialReady ? "ready" : "not entered"}`)), K(e, t);
	};
	J(he, (e) => {
		H(h) && e(ge);
	});
	var _e = B(he, 2), ve = (e) => {
		var n = vc(), r = R(n, !0);
		N(n), V(() => q(r, H(f) || t.view.issue)), K(e, n);
	};
	J(_e, (e) => {
		(t.view.issue || H(f)) && e(ve);
	});
	var ye = B(_e, 2), be = (e) => {
		var t = yc(), n = R(t, !0);
		N(t), V(() => q(n, H(d))), K(e, t);
	};
	J(ye, (e) => {
		H(d) && e(be);
	});
	var xe = B(ye, 2), Se = R(xe), Ce = R(Se, !0);
	N(Se);
	var we = B(Se), Te = B(we), Ee = B(Te);
	N(xe), N(C), V(() => {
		T.disabled = H(u), D !== (D = H(r)) && (T.value = (T.__value = H(r)) ?? "", fi(T, H(r))), bi(k, H(i)), k.disabled = H(u) || !!H(r), bi(te, H(a)), te.disabled = H(u), j.disabled = H(u), oe !== (oe = H(o)) && (j.value = (j.__value = H(o)) ?? "", fi(j, H(o))), bi(ce, H(s)), ce.disabled = H(u), bi(ue, H(o) === "jev" ? "https://api.typesafe.ai/v1/systemone" : H(c)), ue.readOnly = H(o) === "jev", ue.disabled = H(u), q(fe, H(o) === "jev" ? "Jev uses its fixed SystemOne endpoint and requires a session API key." : "Enter the complete /v1/systemone route using HTTPS or HTTP on localhost. A session key is optional for an unauthenticated local service."), bi(me, H(l)), me.disabled = H(u), Se.disabled = H(u) || !n().save || !!t.view.issue, q(Ce, H(u) ? "Applying…" : "Save connection"), we.disabled = H(u) || !H(h)?.credentialReady || !n().clearCredential, Te.disabled = H(u) || !H(r) || !n().remove;
	}), W("change", T, (e) => v(e.currentTarget.value)), W("input", k, (e) => L(i, e.currentTarget.value, !0)), W("input", te, (e) => L(a, e.currentTarget.value, !0)), W("change", j, (e) => {
		L(o, e.currentTarget.value, !0);
	}), W("input", ce, (e) => L(s, e.currentTarget.value, !0)), W("input", ue, (e) => L(c, e.currentTarget.value, !0)), W("input", me, (e) => L(l, e.currentTarget.value, !0)), W("click", Se, b), W("click", we, S), W("click", Te, x), W("click", Ee, () => {
		L(l, ""), t.close();
	}), K(e, C), Ue();
}
wr([
	"change",
	"input",
	"click"
]);
//#endregion
//#region src/workflow/operations/json-data.js?v=0.26.0
function Sc(e) {
	if (typeof e != "object" || !e) return JSON.stringify(e);
	if (Array.isArray(e)) {
		let t = "[";
		for (let n = 0; n < e.length; n++) t += `${n ? "," : ""}${Sc(e[n])}`;
		return `${t}]`;
	}
	let t = "{", n = Object.keys(e);
	for (let r = 0; r < n.length; r++) {
		let i = n[r];
		t += `${r ? "," : ""}${JSON.stringify(i)}:${Sc(e[i])}`;
	}
	return `${t}}`;
}
function Cc(e) {
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
		if (new TextEncoder().encode(Sc(t)).byteLength > 262144) throw Error("JSON byte limit exceeded.");
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
var wc = (e, t) => ({
	ok: !1,
	error: {
		code: e,
		message: t
	}
}), Tc = (e) => Number.isSafeInteger(e) && e >= 0, Ec = (e, t) => Object.hasOwn(e, t) ? e[t] : void 0, Dc = (e) => typeof e == "object" && !!e && !Array.isArray(e), Oc = (e) => typeof e == "string" && e.trim().length > 0 && e.length <= 256, kc = (e) => Array.isArray(e) && e.every((e) => typeof e == "string" && e.length > 0 && e.length <= 4096);
function Ac(e, t) {
	let n = jc(e);
	if (!n.ok) return n;
	let r = n.data, i = Cc(t);
	if (!i.ok || !i.data.value || Array.isArray(i.data.value) || typeof i.data.value != "object") return wc("INVALID_PROPOSAL", "Use a plain duration or destination proposal.");
	let a = i.data.value, o = Ec(a, "kind");
	if (o !== "duration" && o !== "destination") return wc("UNRESOLVED_TIME", "An explicit duration or destination is required.");
	if (o === "duration" ? !Tc(Ec(a, "minutes")) || Object.hasOwn(a, "absoluteMinute") : !Tc(Ec(a, "absoluteMinute")) || Object.hasOwn(a, "minutes")) return wc("INVALID_PROPOSAL", "Use one nonnegative safe-integer minute value.");
	let s = [
		"kind",
		"evidence",
		o === "duration" ? "minutes" : "absoluteMinute"
	];
	if (Object.keys(a).some((e) => !s.includes(e))) return wc("INVALID_PROPOSAL", "Proposal contains ambiguous or unsupported timing fields.");
	let c = o === "destination" ? a.absoluteMinute : r.absoluteMinute + a.minutes;
	if (!Tc(c) || c < r.absoluteMinute) return wc("INVALID_DESTINATION", "Destination must be a forward safe-integer minute.");
	let l = Nc(Object.hasOwn(a, "evidence") ? a.evidence : { kind: "explicit" });
	if (!l.ok) return l;
	let u = l.data, d = u.kind, f = structuredClone(r), p = structuredClone(u);
	return o === "duration" && r.timeEvidence?.kind === "estimate" && (p = d === "estimate" ? {
		...p,
		lineage: [.../* @__PURE__ */ new Set([...r.timeEvidence.lineage ?? [r.timeEvidence.origin], ...u.lineage ?? [u.origin]])]
	} : structuredClone(r.timeEvidence), p.lineage?.length > 64) ? wc("EVIDENCE_LIMIT", "Estimate provenance exceeds 64 sources; hold the entire time projection.") : Mc({
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
function jc(e) {
	let t = Cc(e);
	if (!t.ok || !t.data.value || typeof t.data.value != "object" || Array.isArray(t.data.value)) return wc("INVALID_CLOCK", "Clock must contain bounded own plain data.");
	let n = t.data.value;
	if (!Oc(Ec(n, "clockId")) || !Oc(Ec(n, "calendarId")) || !Tc(Ec(n, "absoluteMinute")) || !Tc(Ec(n, "dayLengthMinutes")) || n.dayLengthMinutes === 0) return wc("INVALID_CLOCK", "Clock requires identities and safe-integer minute/calendar values.");
	if (Object.hasOwn(n, "schemaVersion") && n.schemaVersion !== 1) return wc("INVALID_CLOCK", "Clock schema version must be 1.");
	if (Object.hasOwn(n, "revision") && (!Tc(n.revision) || n.revision < 1)) return wc("INVALID_CLOCK", "Clock revision must be a positive safe integer.");
	if (Object.hasOwn(n, "timeEvidence") && !Nc(n.timeEvidence).ok) return wc("INVALID_CLOCK", "Clock time evidence must retain accepted provenance.");
	if (Object.hasOwn(n, "settledTimeEventIds") && !kc(n.settledTimeEventIds)) return wc("INVALID_CLOCK", "Settled occurrence IDs must be a bounded string array.");
	for (let [e, t] of [
		["unit", "minute"],
		["originMinute", 0],
		["originDay", 1]
	]) if (Object.hasOwn(n, e) && n[e] !== t) return wc("INVALID_CALENDAR", "This calendar uses minute units with minute zero at Day 1.");
	return {
		ok: !0,
		data: n
	};
}
function Mc(e) {
	let t = Cc(e);
	return t.ok ? {
		ok: !0,
		data: t.data.value
	} : wc("OUTPUT_LIMIT", "Projection exceeds the bounded plain-data DTO budget.");
}
function Nc(e) {
	if (!Dc(e)) return wc("INVALID_EVIDENCE", "Evidence must be a plain record.");
	let t = Ec(e, "kind");
	if (![
		"explicit",
		"authored-rule",
		"validated-extraction",
		"estimate",
		"vague"
	].includes(t)) return wc("INVALID_EVIDENCE", "Use a supported time evidence kind.");
	let n = t === "estimate" ? [
		"kind",
		"origin",
		"acceptancePolicy",
		"lineage"
	] : ["kind", "origin"];
	if (Object.keys(e).some((e) => !n.includes(e))) return wc("INVALID_EVIDENCE", "Evidence contains unsupported or contradictory fields.");
	let r = typeof Ec(e, "origin") == "string" && e.origin.trim().length > 0;
	if (Object.hasOwn(e, "origin") && !r) return wc("INVALID_EVIDENCE", "Evidence origin must be nonempty text.");
	if (t === "estimate" && Object.hasOwn(e, "acceptancePolicy") && !["accept", "unresolved"].includes(e.acceptancePolicy)) return wc("INVALID_EVIDENCE", "Estimate acceptance policy must be accept or unresolved.");
	if (Object.hasOwn(e, "lineage")) {
		let t = e.lineage;
		if (!Array.isArray(t) || t.length === 0 || !t.every((e) => typeof e == "string" && e.trim().length > 0) || new Set(t).size !== t.length || !t.includes(e.origin)) return wc("INVALID_EVIDENCE", "Estimate lineage must contain distinct nonempty text origins including the current origin.");
		if (t.length > 64) return wc("EVIDENCE_LIMIT", "Estimate provenance exceeds 64 sources; hold the entire time projection.");
	}
	return t === "vague" || t === "estimate" && (!r || Ec(e, "acceptancePolicy") !== "accept") ? wc("UNRESOLVED_TIME", "Estimated or vague time needs an explicit accepted authored rule.") : ["authored-rule", "validated-extraction"].includes(t) && !r ? wc("INVALID_EVIDENCE", "Rule and extraction evidence must identify their origin.") : {
		ok: !0,
		data: e
	};
}
new TextEncoder();
//#endregion
//#region src/ui/story-document-setup.js
var Pc = (e, t) => ({
	ok: !1,
	error: {
		code: e,
		message: t
	}
});
function Fc(e, t, n = 0) {
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
	return Ac(r, {
		kind: "duration",
		minutes: 0
	}).ok ? {
		ok: !0,
		data: { text: JSON.stringify(r, null, 2) }
	} : Pc("INVALID_CLOCK_TEMPLATE", "Choose explicit clock/calendar IDs and a nonnegative whole story minute.");
}
//#endregion
//#region ui/StoryDocuments.svelte
var Ic = /* @__PURE__ */ G("<p role=\"alert\" class=\"svelte-1t33cem\"> </p>"), Lc = /* @__PURE__ */ G("<option class=\"svelte-1t33cem\"> </option>"), Rc = /* @__PURE__ */ G("<label class=\"svelte-1t33cem\">Actor ID<input aria-label=\"Actor ID\" maxlength=\"128\" class=\"svelte-1t33cem\"/></label>"), zc = /* @__PURE__ */ G("<label class=\"svelte-1t33cem\">CSV columns, comma separated<input aria-label=\"CSV columns\" class=\"svelte-1t33cem\"/></label>"), Bc = /* @__PURE__ */ G("<details class=\"svelte-1t33cem\"><summary class=\"svelte-1t33cem\">Story clock template</summary><label class=\"svelte-1t33cem\">Calendar ID<input aria-label=\"Calendar ID\" class=\"svelte-1t33cem\"/></label><label class=\"svelte-1t33cem\">Starting story minute<input aria-label=\"Starting story minute\" type=\"number\" min=\"0\" step=\"1\" class=\"svelte-1t33cem\"/></label><button type=\"button\" class=\"svelte-1t33cem\">Use story clock template</button><p class=\"svelte-1t33cem\">Midnight on the first day is minute 0. The clock advances through graph events, using explicit story time.</p></details>"), Vc = /* @__PURE__ */ G("<p role=\"status\" class=\"svelte-1t33cem\"> </p>"), Hc = /* @__PURE__ */ G("<div class=\"pc-story-documents svelte-1t33cem\"><p class=\"svelte-1t33cem\"> </p> <p class=\"svelte-1t33cem\">Manage the documents used by your workflows here. Updating an authorization or its initial template leaves existing canonical document content intact. Read File and Write File use these target IDs.</p> <!> <label class=\"svelte-1t33cem\">Workflow data document<select aria-label=\"Workflow data document\" class=\"svelte-1t33cem\"><option class=\"svelte-1t33cem\">New document authorization</option><!></select></label> <div class=\"pc-document-actions svelte-1t33cem\"><button type=\"button\" class=\"svelte-1t33cem\">Load initial template</button><button type=\"button\" class=\"svelte-1t33cem\">Remove authorization</button><button type=\"button\" class=\"svelte-1t33cem\">Refresh scope</button></div> <form class=\"svelte-1t33cem\"><label class=\"svelte-1t33cem\">Logical target ID<input aria-label=\"Logical target ID\" maxlength=\"128\" placeholder=\"souls.json\" class=\"svelte-1t33cem\"/></label> <label class=\"svelte-1t33cem\">Document name<input aria-label=\"Document name\" maxlength=\"256\" class=\"svelte-1t33cem\"/></label> <label class=\"svelte-1t33cem\">Format<select aria-label=\"Document format\" class=\"svelte-1t33cem\"><option class=\"svelte-1t33cem\">JSON</option><option class=\"svelte-1t33cem\">JSON Lines</option><option class=\"svelte-1t33cem\">CSV</option><option class=\"svelte-1t33cem\">Plain text</option><option class=\"svelte-1t33cem\">Markdown</option></select></label> <label class=\"svelte-1t33cem\">Visibility<select aria-label=\"Document visibility\" class=\"svelte-1t33cem\"><option class=\"svelte-1t33cem\">Public</option><option class=\"svelte-1t33cem\">Hidden</option><option class=\"svelte-1t33cem\">Actor private</option></select></label> <!> <!> <!> <label class=\"svelte-1t33cem\">Initial template<textarea aria-label=\"Initial template\" rows=\"7\" maxlength=\"100000\" class=\"svelte-1t33cem\"></textarea></label> <p class=\"svelte-1t33cem\">JSON templates preserve your chosen object or list structure. CSV uses the named columns. Existing authorizations require explicit template loading before editing.</p> <!><!> <footer class=\"svelte-1t33cem\"><button type=\"button\" class=\"svelte-1t33cem\">Close</button><button type=\"submit\" class=\"svelte-1t33cem\"> </button></footer></form></div>");
function Uc(e, t) {
	He(t, !0);
	let n = /* @__PURE__ */ I(""), r = /* @__PURE__ */ I(""), i = /* @__PURE__ */ I(""), a = /* @__PURE__ */ I("json"), o = /* @__PURE__ */ I(""), s = /* @__PURE__ */ I("public"), c = /* @__PURE__ */ I(""), l = /* @__PURE__ */ I(""), u = /* @__PURE__ */ I(!1), d = /* @__PURE__ */ I(""), f = /* @__PURE__ */ I(""), p = /* @__PURE__ */ I(!1), m = /* @__PURE__ */ I("story-calendar"), h = /* @__PURE__ */ I(0), g = "", _ = 0;
	function v() {
		L(r, ""), L(i, ""), L(a, "json"), L(o, ""), L(s, "public"), L(c, ""), L(l, ""), L(p, !1), L(d, ""), L(f, "");
	}
	xn(() => {
		t.view.key !== g && (g = t.view.key, _++, L(u, !1), L(n, ""), v());
	});
	function y() {
		_++, L(u, !1), v();
		let e = t.view.documents.find((e) => e.targetId === H(n));
		e && (L(r, e.targetId, !0), L(i, e.name, !0), L(a, e.format, !0), L(s, e.visibility.kind, !0), L(c, e.visibility.kind === "actor-private" ? e.visibility.actorId : "", !0), L(l, e.columns?.join(", ") ?? "", !0));
	}
	function b() {
		let e = Fc(H(r), H(m), H(h));
		e.ok ? (L(o, e.data.text, !0), L(d, "")) : L(d, e.error.message, !0);
	}
	async function x(e) {
		if (!t.actions || H(u) || !t.view.key) return;
		let m = t.view.key, h = ++_;
		L(u, !0), L(d, ""), L(f, "");
		try {
			let u;
			if (e === "load") u = await t.actions.load(m, H(n));
			else if (e === "remove") u = await t.actions.remove(m, H(n));
			else {
				let e = {
					targetId: H(r),
					name: H(i),
					format: H(a),
					content: H(o),
					visibility: H(s) === "actor-private" ? {
						kind: H(s),
						actorId: H(c)
					} : { kind: H(s) }
				};
				H(a) === "csv" && (e.columns = H(l).split(",").map((e) => e.trim()).filter(Boolean)), u = await t.actions.save(m, e);
			}
			if (m !== t.view.key || h !== _) return;
			if (!u?.ok) {
				L(d, u?.error?.message ?? "Workflow Data setup could not be applied.", !0);
				return;
			}
			if (e === "load") {
				let e = u.data?.definition;
				if (!e) {
					L(d, "The initial template could not be loaded.");
					return;
				}
				L(r, e.targetId, !0), L(i, e.name, !0), L(a, e.format, !0), L(o, e.content, !0), L(s, e.visibility.kind, !0), L(c, e.visibility.actorId ?? "", !0), L(l, e.columns?.join(", ") ?? "", !0), L(p, !0);
			} else L(f, u.data?.message ?? "Authorization updated locally.", !0), L(p, !1);
		} catch {
			m === t.view.key && h === _ && L(d, "Workflow Data setup could not be applied.");
		} finally {
			m === t.view.key && h === _ && L(u, !1);
		}
	}
	var S = Hc(), C = R(S), w = R(C);
	N(C);
	var T = B(C, 4), E = (e) => {
		var n = Ic(), r = R(n, !0);
		N(n), V(() => q(r, t.view.issue)), K(e, n);
	};
	J(T, (e) => {
		t.view.issue && e(E);
	});
	var D = B(T, 2), O = B(R(D)), ee = R(O);
	ee.value = ee.__value = "", Y(B(ee), 17, () => t.view.documents, (e) => e.targetId, (e, t) => {
		var n = Lc(), r = R(n);
		N(n);
		var i = {};
		V(() => {
			q(r, `${H(t).name ?? ""} (${H(t).targetId ?? ""}, ${H(t).format ?? ""}, ${H(t).visibility.kind ?? ""})`), i !== (i = H(t).targetId) && (n.value = (n.__value = H(t).targetId) ?? "");
		}), K(e, n);
	}), N(O), N(D);
	var k = B(D, 2), A = R(k), te = B(A), ne = B(te);
	N(k);
	var j = B(k, 2), re = R(j), ie = B(R(re));
	X(ie), N(re);
	var ae = B(re, 2), oe = B(R(ae));
	X(oe), N(ae);
	var se = B(ae, 2), ce = B(R(se)), le = R(ce);
	le.value = le.__value = "json";
	var ue = B(le);
	ue.value = ue.__value = "jsonl";
	var de = B(ue);
	de.value = de.__value = "csv";
	var fe = B(de);
	fe.value = fe.__value = "text";
	var pe = B(fe);
	pe.value = pe.__value = "markdown", N(ce), N(se);
	var me = B(se, 2), he = B(R(me)), ge = R(he);
	ge.value = ge.__value = "public";
	var _e = B(ge);
	_e.value = _e.__value = "hidden";
	var ve = B(_e);
	ve.value = ve.__value = "actor-private", N(he), N(me);
	var ye = B(me, 2), be = (e) => {
		var t = Rc(), n = B(R(t));
		X(n), N(t), V(() => n.disabled = H(u)), Ti(n, () => H(c), (e) => L(c, e)), K(e, t);
	};
	J(ye, (e) => {
		H(s) === "actor-private" && e(be);
	});
	var xe = B(ye, 2), Se = (e) => {
		var t = zc(), n = B(R(t));
		X(n), N(t), V(() => n.disabled = H(u)), Ti(n, () => H(l), (e) => L(l, e)), K(e, t);
	};
	J(xe, (e) => {
		H(a) === "csv" && e(Se);
	});
	var Ce = B(xe, 2), we = (e) => {
		var t = Bc(), i = B(R(t)), a = B(R(i));
		X(a), N(i);
		var o = B(i), s = B(R(o));
		X(s), N(o);
		var c = B(o);
		je(), N(t), V((e) => {
			a.disabled = H(u), s.disabled = H(u), c.disabled = e;
		}, [() => !H(r).trim() || H(u) || !!H(n) && !H(p)]), Ti(a, () => H(m), (e) => L(m, e)), Ti(s, () => H(h), (e) => L(h, e)), W("click", c, b), K(e, t);
	};
	J(Ce, (e) => {
		H(a) === "json" && e(we);
	});
	var Te = B(Ce, 2), Ee = B(R(Te));
	it(Ee), N(Te);
	var De = B(Te, 4), Oe = (e) => {
		var t = Ic(), n = R(t, !0);
		N(t), V(() => q(n, H(d))), K(e, t);
	};
	J(De, (e) => {
		H(d) && e(Oe);
	});
	var M = B(De), ke = (e) => {
		var n = Vc(), r = R(n, !0);
		N(n), V(() => q(r, H(f) || t.view.notice)), K(e, n);
	};
	J(M, (e) => {
		(H(f) || t.view.notice) && e(ke);
	});
	var Ae = B(M, 2), Me = R(Ae), Ne = B(Me), Pe = R(Ne, !0);
	N(Ne), N(Ae), N(j), N(S), V((e) => {
		q(w, `Active user: ${(t.view.scope.userId || "Unavailable") ?? ""} · Chat: ${(t.view.scope.chatId || "Unavailable") ?? ""}`), O.disabled = H(u), A.disabled = !H(n) || H(u), te.disabled = !H(n) || H(u), ne.disabled = H(u), ie.disabled = !!H(n) || H(u), oe.disabled = H(u), ce.disabled = !!H(n) || H(u), he.disabled = H(u), Ee.disabled = H(u) || !!H(n) && !H(p), Z(Ee, "placeholder", H(a) === "json" ? "[]" : ""), Ne.disabled = e, q(Pe, H(u) ? "Saving…" : "Save authorization");
	}, [() => !t.actions || !t.view.key || !H(r).trim() || !H(i).trim() || H(u) || !!H(n) && !H(p) || H(s) === "actor-private" && !H(c).trim()]), W("change", O, y), mi(O, () => H(n), (e) => L(n, e)), W("click", A, () => x("load")), W("click", te, () => x("remove")), W("click", ne, () => t.actions?.refresh()), U("submit", j, (e) => {
		e.preventDefault(), x("save");
	}), Ti(ie, () => H(r), (e) => L(r, e)), Ti(oe, () => H(i), (e) => L(i, e)), mi(ce, () => H(a), (e) => L(a, e)), mi(he, () => H(s), (e) => L(s, e)), Ti(Ee, () => H(o), (e) => L(o, e)), W("click", Me, function(...e) {
		t.close?.apply(this, e);
	}), K(e, S), Ue();
}
wr(["change", "click"]);
//#endregion
//#region ui/RecallArms.svelte
var Wc = /* @__PURE__ */ G("<p class=\"svelte-34wc6n\"> </p>"), Gc = /* @__PURE__ */ G("<p role=\"alert\" class=\"svelte-34wc6n\"> </p>"), Kc = /* @__PURE__ */ G("<p class=\"svelte-34wc6n\">Add a Hotkey Arm node to the assigned unified workflow for the active character, then enable Lattice. Configure the actor, memory set, target and use policy in Details.</p>"), qc = /* @__PURE__ */ G("<fieldset class=\"svelte-34wc6n\"><legend> </legend> <p class=\"svelte-34wc6n\"> </p> <p class=\"svelte-34wc6n\"> </p> <button type=\"button\"> </button></fieldset>"), Jc = /* @__PURE__ */ G("<header class=\"svelte-34wc6n\"><h2>Recall arms</h2><button type=\"button\">Close</button></header> <p class=\"svelte-34wc6n\">Arm a memory set for the next reply, generated swipe, or both. Automatic Recall triggers use the workflow’s own conditions.</p> <!> <!> <!> <!> <p class=\"svelte-34wc6n\"><button type=\"button\">Refresh recall state</button></p> <small class=\"svelte-34wc6n\">Shortcuts use physical keys and do not fire while typing in inputs. Duplicate active shortcuts require a different key. Editing the graph or switching scope revokes old shortcuts.</small>", 1);
function Yc(e, t) {
	He(t, !0);
	let n = /* @__PURE__ */ I(""), r = /* @__PURE__ */ I(""), i = (e) => [
		e.ctrl ? "Ctrl" : "",
		e.alt ? "Alt" : "",
		e.shift ? "Shift" : "",
		e.meta ? "Meta" : "",
		e.code.replace(/^Key|^Digit/u, "")
	].filter(Boolean).join("+");
	async function a(e, i) {
		if (!H(n)) {
			L(n, e, !0), L(r, "");
			try {
				let n = await (i ? t.actions?.disarm(e) : t.actions?.arm(e));
				n?.ok !== !0 && L(r, n?.error.message ?? "Recall controls are unavailable.", !0);
			} catch {
				L(r, "Recall controls are unavailable.");
			} finally {
				L(n, "");
			}
		}
	}
	var o = Jc(), s = z(o), c = B(R(s));
	N(s);
	var l = B(s, 4), u = (e) => {
		var n = Wc(), r = R(n);
		N(n), V(() => q(r, `User ${t.view.scope.userId ?? ""} · Chat ${t.view.scope.chatId ?? ""} · Actor ${t.view.scope.actorId ?? ""}`)), K(e, n);
	};
	J(l, (e) => {
		t.view.scope && e(u);
	});
	var d = B(l, 2), f = (e) => {
		var n = Gc(), i = R(n, !0);
		N(n), V(() => q(i, H(r) || t.view.issue)), K(e, n);
	};
	J(d, (e) => {
		(t.view.issue || H(r)) && e(f);
	});
	var p = B(d, 2), m = (e) => {
		K(e, Kc());
	};
	J(p, (e) => {
		t.view.nodes.length || e(m);
	});
	var h = B(p, 2);
	Y(h, 17, () => t.view.nodes, (e) => e.nodeId, (e, r) => {
		var o = qc(), s = R(o), c = R(s);
		N(s);
		var l = B(s, 2), u = R(l);
		N(l);
		var d = B(l, 2), f = R(d);
		N(d);
		var p = B(d, 2), m = R(p, !0);
		N(p), N(o), V((e) => {
			q(c, `${H(r).memorySetId ?? ""} · ${H(r).armed ? "Armed" : "Disarmed"}`), q(u, `${e ?? ""} · ${H(r).target ?? ""} · ${H(r).uses ?? ""} · consume on ${H(r).consumeOn ?? ""}`), q(f, `Remaining: ${H(r).remaining.reply ? "reply " : ""}${H(r).remaining.swipe ? "swipe" : ""}${!H(r).remaining.reply && !H(r).remaining.swipe ? "none" : ""}. Pending generations: ${H(r).pendingCount ?? ""}.`), Z(p, "aria-label", (H(r).armed ? "Disarm " : "Arm ") + H(r).memorySetId), p.disabled = !!H(n) || !t.actions, q(m, H(n) === H(r).nodeId ? "Updating…" : H(r).armed ? "Disarm" : "Arm");
		}, [() => i(H(r).hotkey)]), W("click", p, () => a(H(r).nodeId, H(r).armed)), K(e, o);
	});
	var g = B(h, 2), _ = R(g);
	N(g), je(2), V(() => _.disabled = !!H(n) || !t.actions), W("click", c, function(...e) {
		t.close?.apply(this, e);
	}), W("click", _, () => t.actions?.refresh()), K(e, o), Ue();
}
wr(["click"]);
//#endregion
//#region ui/ConfigureNode.svelte
var Xc = /* @__PURE__ */ G("<option class=\"svelte-1srbsqt\"> </option>"), Zc = /* @__PURE__ */ G("<p class=\"svelte-1srbsqt\">Authorize a document in Tools › Workflow Data, then reopen node creation.</p>"), Qc = /* @__PURE__ */ G("<label class=\"svelte-1srbsqt\">Workflow data document<select aria-label=\"Workflow data document\" class=\"svelte-1srbsqt\"><option class=\"svelte-1srbsqt\">Choose an authorized target</option><!></select></label><!>", 1), $c = /* @__PURE__ */ G("<label class=\"svelte-1srbsqt\">Pinned Data helper<select aria-label=\"Pinned Data helper\" class=\"svelte-1srbsqt\"><option class=\"svelte-1srbsqt\">Choose an existing item/result helper</option><!></select></label><p class=\"svelte-1srbsqt\">Helpers use exact pinned versions with Data item and result ports. Set iteration mode and requestBoundPerIteration in the controls below.</p>", 1), el = /* @__PURE__ */ G("<p role=\"alert\" class=\"svelte-1srbsqt\"> </p>"), tl = /* @__PURE__ */ G("<div class=\"pc-workspace-overlay svelte-1srbsqt\"><div class=\"pc-workspace-dialog pc-configure-node svelte-1srbsqt\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Configure node\" tabindex=\"-1\"><header class=\"svelte-1srbsqt\"><h2 class=\"svelte-1srbsqt\"> </h2><button type=\"button\" aria-label=\"Close node configuration\" class=\"svelte-1srbsqt\">×</button></header> <p class=\"svelte-1srbsqt\">Complete the required settings before creating the node. Cancel leaves the graph unchanged.</p> <form class=\"svelte-1srbsqt\"><label class=\"svelte-1srbsqt\">Stage<select aria-label=\"Node stage\" class=\"svelte-1srbsqt\"><option class=\"svelte-1srbsqt\">Preparation</option><option class=\"svelte-1srbsqt\">Response</option></select></label> <!> <!> <label class=\"svelte-1srbsqt\">Declared node controls<textarea aria-label=\"Node controls JSON\" rows=\"14\" maxlength=\"200000\" class=\"svelte-1srbsqt\"></textarea></label> <!> <footer class=\"svelte-1srbsqt\"><button type=\"button\" class=\"svelte-1srbsqt\">Cancel</button><button type=\"submit\" class=\"svelte-1srbsqt\"> </button></footer></form></div></div>");
function nl(e, t) {
	He(t, !0);
	let n, r = /* @__PURE__ */ I(""), i = /* @__PURE__ */ I("pre"), a = /* @__PURE__ */ I(""), o = /* @__PURE__ */ I(""), s = /* @__PURE__ */ I(!1), c = /* @__PURE__ */ I(""), l = "", u = 0, d = /* @__PURE__ */ P(() => t.view.operation === "read-file" || t.view.operation === "story-clock" || t.view.operation === "commit-outcomes");
	xn(() => {
		if (t.view.key === l) return;
		l = t.view.key, u++, L(r, t.view.controls, !0), L(i, t.view.phase, !0), L(s, !1), L(c, "");
		try {
			let e = JSON.parse(H(r));
			L(a, e.targetId ?? e.clockId ?? "", !0), L(o, t.view.helpers.find((t) => JSON.stringify(t.ref) === JSON.stringify(e.helper))?.key ?? "", !0);
		} catch {
			L(a, ""), L(o, "");
		}
		let e = l;
		fr().then(() => {
			t.view.key === e && n?.querySelector("select,textarea,input")?.focus({ preventScroll: !0 });
		});
	}), Ai(() => {
		let e = document.activeElement;
		return () => e?.focus({ preventScroll: !0 });
	});
	function f(e, t) {
		try {
			let n = JSON.parse(H(r));
			if (!n || Array.isArray(n) || typeof n != "object") throw Error();
			n[e] = t, L(r, JSON.stringify(n, null, 2), !0), L(c, "");
		} catch {
			L(c, "Use a JSON object before selecting a configured value.");
		}
	}
	async function p(e) {
		if (e.preventDefault(), !t.actions || H(s)) return;
		let n = t.view.key, a = ++u;
		L(s, !0), L(c, "");
		try {
			let e = await t.actions.apply(n, H(r), H(i));
			n === t.view.key && a === u && !e?.ok && L(c, e?.error?.message ?? "The node could not be prepared.", !0);
		} catch {
			n === t.view.key && a === u && L(c, "The node could not be prepared.");
		} finally {
			n === t.view.key && a === u && L(s, !1);
		}
	}
	function m(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), t.actions?.cancel(t.view.key)), e.key === "Tab") {
			let t = [...n.querySelectorAll("button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled)")], r = t[0], i = t.at(-1);
			e.shiftKey && document.activeElement === r && (e.preventDefault(), i?.focus()), !e.shiftKey && document.activeElement === i && (e.preventDefault(), r?.focus());
		}
	}
	var h = tl(), g = R(h), _ = R(g), v = R(_), y = R(v);
	N(v);
	var b = B(v);
	N(_);
	var x = B(_, 4), S = R(x), C = B(R(S)), w = R(C);
	w.value = w.__value = "pre";
	var T = B(w);
	T.value = T.__value = "post", N(C), N(S);
	var E = B(S, 2), D = (e) => {
		var n = Qc(), r = z(n), i = B(R(r)), o = R(i);
		o.value = o.__value = "", Y(B(o), 17, () => t.view.targets.filter((e) => !["story-clock", "commit-outcomes"].includes(t.view.operation) || e.format === "json"), (e) => e.targetId, (e, t) => {
			var n = Xc(), r = R(n);
			N(n);
			var i = {};
			V(() => {
				q(r, `${H(t).name ?? ""} (${H(t).targetId ?? ""})`), i !== (i = H(t).targetId) && (n.value = (n.__value = H(t).targetId) ?? "");
			}), K(e, n);
		}), N(i), N(r);
		var c = B(r), l = (e) => {
			K(e, Zc());
		};
		J(c, (e) => {
			t.view.targets.length || e(l);
		}), V(() => i.disabled = H(s)), W("change", i, () => f(t.view.operation === "story-clock" ? "clockId" : "targetId", H(a))), mi(i, () => H(a), (e) => L(a, e)), K(e, n);
	};
	J(E, (e) => {
		H(d) && e(D);
	});
	var O = B(E, 2), ee = (e) => {
		var n = $c(), r = z(n), i = B(R(r)), a = R(i);
		a.value = a.__value = "", Y(B(a), 17, () => t.view.helpers, (e) => e.key, (e, t) => {
			var n = Xc(), r = R(n);
			N(n);
			var i = {};
			V(() => {
				q(r, `${H(t).label ?? ""}${H(t).stateful ? " (projected state)" : ""}`), i !== (i = H(t).key) && (n.value = (n.__value = H(t).key) ?? "");
			}), K(e, n);
		}), N(i), N(r), je(), V(() => i.disabled = H(s)), W("change", i, () => {
			let e = t.view.helpers.find((e) => e.key === H(o));
			e && f("helper", e.ref);
		}), mi(i, () => H(o), (e) => L(o, e)), K(e, n);
	};
	J(O, (e) => {
		t.view.operation === "for-each" && e(ee);
	});
	var k = B(O, 2), A = B(R(k));
	it(A), N(k);
	var te = B(k, 2), ne = (e) => {
		var t = el(), n = R(t, !0);
		N(t), V(() => q(n, H(c))), K(e, t);
	};
	J(te, (e) => {
		H(c) && e(ne);
	});
	var j = B(te, 2), re = R(j), ie = B(re), ae = R(ie, !0);
	N(ie), N(j), N(x), N(g), Q(g, (e) => n = e, () => n), N(h), V(() => {
		q(y, `Configure ${t.view.title ?? ""}`), C.disabled = t.view.phaseLocked || H(s), A.disabled = H(s), ie.disabled = !t.actions || H(s), q(ae, H(s) ? "Preparing…" : "Create node");
	}), U("keydown", g, m, !0), U("paste", g, (e) => e.stopPropagation()), W("click", b, () => t.actions?.cancel(t.view.key)), U("submit", x, p), mi(C, () => H(i), (e) => L(i, e)), Ti(A, () => H(r), (e) => L(r, e)), W("click", re, () => t.actions?.cancel(t.view.key)), K(e, h), Ue();
}
wr(["click", "change"]);
//#endregion
//#region ui/NewWorkflowPrompt.svelte
var rl = /* @__PURE__ */ G("<div class=\"pc-workspace-overlay\"><div class=\"pc-workspace-dialog pc-new-workflow-prompt svelte-121ekho\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Save workflow changes?\" tabindex=\"-1\"><h2 class=\"svelte-121ekho\">Save workflow changes?</h2> <p class=\"svelte-121ekho\"><strong class=\"svelte-121ekho\"> </strong> has unsaved changes.</p> <p class=\"svelte-121ekho\">Save downloads workflow JSON before opening a new workflow. Your existing workflow stays in the workspace.</p> <label class=\"svelte-121ekho\">New workflow type<select aria-label=\"New workflow type\" class=\"svelte-121ekho\"><option>Unified workflow</option><option>Legacy pre workflow</option><option>Legacy post workflow</option></select></label> <footer class=\"svelte-121ekho\"><button type=\"button\" class=\"svelte-121ekho\">Save</button><button type=\"button\" class=\"svelte-121ekho\">Discard</button><button type=\"button\" class=\"svelte-121ekho\">Cancel</button></footer></div></div>");
function il(e, t) {
	He(t, !0);
	let n = /* @__PURE__ */ I($t(hr(() => t.view.phase ?? "unified"))), r, i;
	Ai(() => {
		let e = document.activeElement;
		return i.focus({ preventScroll: !0 }), () => e?.focus({ preventScroll: !0 });
	});
	function a(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), t.actions?.choose("cancel", H(n))), e.key === "Tab") {
			let t = [...r.querySelectorAll("button:not(:disabled), select:not(:disabled)")], n = t.indexOf(document.activeElement);
			e.shiftKey && n <= 0 && (e.preventDefault(), t.at(-1)?.focus()), !e.shiftKey && (n < 0 || n === t.length - 1) && (e.preventDefault(), t[0]?.focus());
		}
	}
	var o = rl(), s = R(o), c = B(R(s), 2), l = R(c), u = R(l, !0);
	N(l), je(), N(c);
	var d = B(c, 4), f = B(R(d)), p = R(f);
	p.value = p.__value = "unified";
	var m = B(p);
	m.value = m.__value = "pre";
	var h = B(m);
	h.value = h.__value = "post", N(f);
	var g;
	pi(f), N(d);
	var _ = B(d, 2), v = R(_), y = B(v), b = B(y);
	Q(b, (e) => i = e, () => i), N(_), N(s), Q(s, (e) => r = e, () => r), N(o), V(() => {
		q(u, t.view.name), g !== (g = H(n)) && (f.value = (f.__value = H(n)) ?? "", fi(f, H(n)));
	}), U("keydown", s, a, !0), U("paste", s, (e) => e.stopPropagation(), !0), W("change", f, (e) => L(n, e.currentTarget.value, !0)), W("click", v, () => t.actions?.choose("save", H(n))), W("click", y, () => t.actions?.choose("discard", H(n))), W("click", b, () => t.actions?.choose("cancel", H(n))), K(e, o), Ue();
}
wr(["change", "click"]);
//#endregion
//#region ui/NodeSearch.svelte
var al = /* @__PURE__ */ G("<label class=\"pc-context-check svelte-golf61\"><input type=\"checkbox\" class=\"svelte-golf61\"/>Context sensitive</label>"), ol = /* @__PURE__ */ G("<span class=\"pc-search-context svelte-golf61\"> </span>"), sl = /* @__PURE__ */ G("<label class=\"pc-search-field svelte-golf61\"><input type=\"search\" aria-label=\"Search nodes and subgraphs\" placeholder=\"Search…\" autocomplete=\"off\" role=\"combobox\" aria-expanded=\"true\" class=\"svelte-golf61\"/></label> <!> <!>", 1), cl = /* @__PURE__ */ G("<p class=\"pc-search-context svelte-golf61\">Choose the named port to connect.</p>"), ll = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-search-result svelte-golf61\" role=\"option\"><span class=\"svelte-golf61\"> </span> <span class=\"pc-family svelte-golf61\"> </span></button>"), ul = /* @__PURE__ */ G("<p class=\"pc-empty svelte-golf61\">No nodes match.</p>"), dl = /* @__PURE__ */ G("<p class=\"pc-feedback svelte-golf61\" role=\"status\"> </p>"), fl = /* @__PURE__ */ G("<div class=\"pc-node-search svelte-golf61\" role=\"dialog\" aria-modal=\"false\" tabindex=\"-1\"><!> <div class=\"pc-search-results svelte-golf61\" role=\"listbox\"></div> <!></div>");
function pl(e, t) {
	let n = Ir();
	He(t, !0);
	let r = ki(t, "view", 3, null), i = ki(t, "actions", 19, () => ({})), a = /* @__PURE__ */ I(void 0), o = /* @__PURE__ */ I(void 0), s = /* @__PURE__ */ I(""), c = /* @__PURE__ */ I(0), l = /* @__PURE__ */ I(8), u = /* @__PURE__ */ I(8), d, f, p = (e) => [
		e.label,
		e.family,
		e.purpose ?? "",
		e.shortcode ?? "",
		...e.searchAliases ?? []
	].join(" ").toLocaleLowerCase(), m = /* @__PURE__ */ P(() => (r()?.choices ?? []).filter((e) => p(e).includes(H(s).toLocaleLowerCase().trim()))), h = /* @__PURE__ */ P(() => r()?.mode === "ports" ? r().ports : H(m)), g = (e) => "id" in e ? e.id : e.portId, _ = (e) => !!r()?.readOnly || "disabledReason" in e && !!e.disabledReason, v = /* @__PURE__ */ P(() => H(h).filter((e) => !_(e))), y = /* @__PURE__ */ P(() => H(v)[Math.min(H(c), Math.max(0, H(v).length - 1))]), b = (e) => ({
		Input: "#96ad52",
		Shaping: "#589aab",
		Surface: "#92c9ad",
		Transpose: "#9080b6",
		Derive: "#b65b9e",
		Output: "#c96d82",
		Subgraphs: "#a3aa99"
	})[e] ?? "#a1a59b";
	function x() {
		if (!r() || !H(a)) return;
		let e = H(a).getBoundingClientRect(), t = document.documentElement.clientWidth || window.innerWidth, n = document.documentElement.clientHeight || window.innerHeight;
		L(l, Math.max(8, Math.min(r().screenAnchor.x, t - e.width - 8)), !0), L(u, Math.max(8, Math.min(r().screenAnchor.y, n - e.height - 8)), !0);
	}
	xn(() => {
		let e = r()?.key, t = r()?.mode, n = r()?.screenAnchor;
		if (e === void 0 || !n) return;
		let i = d !== e || f !== t;
		d !== e && L(s, ""), i && L(c, 0), d = e, f = t, fr().then(() => {
			r()?.key === e && r().mode === t && (x(), i && (t === "nodes" ? H(o)?.focus() : (H(a)?.querySelector("[data-port]:not(:disabled)") ?? H(a))?.focus()));
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
		].includes(e.key) ? (e.preventDefault(), L(c, e.key === "Home" ? 0 : e.key === "End" ? Math.max(0, H(v).length - 1) : H(v).length ? (H(c) + (e.key === "ArrowDown" ? 1 : -1) + H(v).length) % H(v).length : 0, !0)) : e.key === "Enter" && (e.preventDefault(), S(H(y)));
	}
	xn(() => {
		if (!r()) return;
		let e = (e) => {
			H(a) && !H(a).contains(e.target) && i().dismiss?.();
		};
		return window.addEventListener("pointerdown", e, !0), () => window.removeEventListener("pointerdown", e, !0);
	});
	var T = Fr();
	U("resize", nn, x);
	var E = z(T), D = (e) => {
		var t = fl();
		let i;
		var d = R(t), f = (e) => {
			var t = sl(), i = z(t), a = R(i);
			X(a), Q(a, (e) => L(o, e), () => H(o)), N(i);
			var l = B(i, 2), u = (e) => {
				var t = al(), n = R(t);
				X(n), je(), N(t), V(() => {
					xi(n, r().contextSensitive), n.disabled = r().readOnly;
				}), W("change", n, C), K(e, t);
			};
			J(l, (e) => {
				r().origin && e(u);
			});
			var d = B(l, 2), f = (e) => {
				var t = ol(), n = R(t, !0);
				N(t), V(() => q(n, (r().origin.dir === "out" ? "Accepts " : "Produces ") + r().origin.kind)), K(e, t);
			};
			J(d, (e) => {
				r().origin && e(f);
			}), V((e) => {
				Z(a, "aria-controls", n + "-results"), Z(a, "aria-activedescendant", e);
			}, [() => H(y) ? n + "-item-" + H(h).indexOf(H(y)) : void 0]), W("input", a, () => L(c, 0)), Ti(a, () => H(s), (e) => L(s, e)), K(e, t);
		}, p = (e) => {
			K(e, cl());
		};
		J(d, (e) => {
			r().mode === "nodes" ? e(f) : e(p, -1);
		});
		var m = B(d, 2);
		Y(m, 21, () => H(h), (e) => g(e), (e, t) => {
			var r = ll(), i = R(r), a = R(i, !0);
			N(i);
			var o = B(i, 1, !0);
			o.nodeValue = " ";
			var s = B(o);
			let l;
			var u = R(s, !0);
			N(s), N(r), V((e, n, i, o) => {
				Z(r, "aria-selected", H(y) === H(t)), Z(r, "id", e), Z(r, "data-choice", "id" in H(t) ? H(t).id : void 0), Z(r, "data-port", "portId" in H(t) ? H(t).portId : void 0), r.disabled = n, Z(r, "title", "disabledReason" in H(t) ? H(t).disabledReason : void 0), q(a, i), l = di(s, "", l, o), q(u, "family" in H(t) ? H(t).family : H(t).kind);
			}, [
				() => n + "-item-" + H(h).indexOf(H(t)),
				() => _(H(t)),
				() => H(t).label || g(H(t)),
				() => ({ color: "family" in H(t) ? b(H(t).family) : void 0 })
			]), W("click", r, () => S(H(t))), U("focus", r, () => {
				let e = H(v).indexOf(H(t));
				e >= 0 && L(c, e, !0);
			}), K(e, r);
		}, (e) => {
			K(e, ul());
		}), N(m);
		var x = B(m, 2), T = (e) => {
			var t = dl(), n = R(t, !0);
			N(t), V(() => q(n, r().feedback)), K(e, t);
		};
		J(x, (e) => {
			r().feedback && e(T);
		}), N(t), Q(t, (e) => L(a, e), () => H(a)), V(() => {
			Z(t, "aria-label", r().mode === "ports" ? "Choose connection port" : "Add node"), i = di(t, "", i, {
				left: `${H(l) ?? ""}px`,
				top: `${H(u) ?? ""}px`
			}), Z(m, "id", n + "-results"), Z(m, "aria-label", r().mode === "ports" ? "Compatible ports" : "Nodes and subgraphs");
		}), W("keydown", t, w), K(e, t);
	};
	J(E, (e) => {
		r() && e(D);
	}), K(e, T), Ue();
}
wr([
	"keydown",
	"input",
	"change",
	"click"
]);
//#endregion
//#region ui/PinMenu.svelte
var ml = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-pin-action svelte-i73q0t\"> </button>"), hl = /* @__PURE__ */ G("<p class=\"pc-empty svelte-i73q0t\">No attached links.</p>"), gl = /* @__PURE__ */ G("<div class=\"pc-pin-menu svelte-i73q0t\" role=\"dialog\" aria-label=\"Pin actions\" aria-modal=\"false\" tabindex=\"-1\"><div class=\"pc-menu-head svelte-i73q0t\"><h2 class=\"svelte-i73q0t\"> </h2><button type=\"button\" aria-label=\"Close pin actions\" class=\"svelte-i73q0t\">Close</button></div> <p class=\"pc-kind svelte-i73q0t\"> </p> <!></div>");
function _l(e, t) {
	He(t, !0);
	let n = ki(t, "view", 3, null), r = ki(t, "actions", 19, () => ({})), i = /* @__PURE__ */ I(void 0), a = /* @__PURE__ */ I(8), o = /* @__PURE__ */ I(8), s, c = (e) => !!e.disabled || !!n()?.readOnly && e.capability !== "navigation";
	function l() {
		if (!n() || !H(i)) return;
		let e = H(i).getBoundingClientRect(), t = document.documentElement.clientWidth || window.innerWidth, r = document.documentElement.clientHeight || window.innerHeight;
		L(a, Math.max(8, Math.min(n().screenAnchor.x, t - e.width - 8)), !0), L(o, Math.max(8, Math.min(n().screenAnchor.y, r - e.height - 8)), !0);
	}
	xn(() => {
		let e = n()?.key, t = n()?.screenAnchor;
		if (e === void 0 || !t) return;
		let r = s !== e;
		s = e, fr().then(() => {
			n()?.key === e && (l(), r && (H(i)?.querySelector("[data-entry]:not(:disabled)") ?? H(i))?.focus());
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
		let t = [...H(i)?.querySelectorAll("[data-entry]:not(:disabled)") ?? []], a = t.indexOf(document.activeElement);
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
	var f = Fr();
	U("resize", nn, l);
	var p = z(f), m = (e) => {
		var t = gl();
		let s;
		var l = R(t), f = R(l), p = R(f, !0);
		N(f);
		var m = B(f);
		N(l);
		var h = B(l, 2), g = R(h);
		N(h), Y(B(h, 2), 17, () => n().entries, (e) => e.id, (e, t) => {
			var n = ml(), r = R(n, !0);
			N(n), V((e) => {
				Z(n, "data-entry", H(t).id), n.disabled = e, Z(n, "title", H(t).reason), q(r, H(t).label);
			}, [() => c(H(t))]), W("click", n, () => u(H(t))), K(e, n);
		}, (e) => {
			K(e, hl());
		}), N(t), Q(t, (e) => L(i, e), () => H(i)), V(() => {
			s = di(t, "", s, {
				left: `${H(a) ?? ""}px`,
				top: `${H(o) ?? ""}px`
			}), q(p, n().title), q(g, `${n().kind ?? ""}${n().readOnly ? " · Read only" : ""}`);
		}), W("keydown", t, d), W("click", m, () => r().dismiss?.()), K(e, t);
	};
	J(p, (e) => {
		n() && e(m);
	}), K(e, f), Ue();
}
wr(["keydown", "click"]);
//#endregion
//#region src/ui/node-palette.js
var vl = "M3 7 12 2l9 5v10l-9 5-9-5ZM3 7l9 5 9-5M12 12v10", yl = "M3 6l4-2 4 2v5l-4 2-4-2ZM3 6l4 2 4-2M7 8v5M13 6l4-2 4 2v5l-4 2-4-2ZM13 6l4 2 4-2M17 8v5M8 15l4-2 4 2v5l-4 2-4-2ZM8 15l4 2 4-2M12 17v5", bl = Object.freeze([
	{
		name: "Input",
		color: "#96ad52",
		icon: vl
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
		icon: vl
	},
	{
		name: "Subgraphs",
		color: "#a3aa99",
		icon: yl
	}
].map((e) => Object.freeze(e))), xl = {
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
	Library: yl,
	Routing: "M3 12h18m-7-7 7 7-7 7",
	Blocks: vl,
	Reflect: "M21 12s-4-7-9-7-9 7-9 7 4 7 9 7 9-7 9-7ZM15 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0",
	Internalize: "M4 4h16v16H4M8 8l4 4 4-4M12 12v5",
	Express: "M4 4h16v12H9l-5 4ZM8 8h8M8 12h5",
	Memory: "M5 3h14v18H5ZM8 7h8M8 11h8M8 15h5",
	State: "M3 12h4l3-7 4 14 3-7h4"
}, Sl = Object.freeze(Object.fromEntries(Object.entries(xl).map(([e, t]) => [e, Object.freeze({
	name: e,
	icon: t
})]))), Cl = {
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
		xl.Planning
	],
	compose: [
		"Assembly",
		"co",
		xl.Assembly
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
		xl.Validation
	],
	"json-decode": [
		"Parsing",
		"jd",
		xl.Parsing
	],
	"select-fields": [
		"Extraction",
		"sf",
		xl.Extraction
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
		xl.Delivery
	],
	reroute: [
		"Routing",
		"rt",
		xl.Routing
	],
	reflect: [
		"Reflect",
		"rf",
		xl.Reflect
	],
	internalize: [
		"Internalize",
		"in",
		xl.Internalize
	],
	express: [
		"Express",
		"ex",
		xl.Express
	],
	context: [
		"Context",
		"cx",
		xl.Context
	],
	memory: [
		"Memory",
		"mm",
		xl.Memory
	],
	state: [
		"State",
		"sv",
		xl.State
	]
}, wl = Object.freeze(Object.fromEntries(Object.entries(Cl).map(([e, [t, n, r]]) => [e, Object.freeze({
	group: t,
	shortcode: n,
	icon: r
})]))), Tl = Object.freeze({
	group: "Blocks",
	shortcode: "",
	icon: vl
}), El = (e) => Object.hasOwn(wl, e) ? wl[e] : Tl, Dl = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-family-row\" aria-haspopup=\"menu\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path></path></svg><span> </span></button>"), Ol = /* @__PURE__ */ G("<button type=\"button\" role=\"menuitem\">‹ Families</button>"), kl = /* @__PURE__ */ G("<input class=\"text_pole\" aria-label=\"Search nodes\" placeholder=\"Search nodes…\"/>"), Al = /* @__PURE__ */ G("<div class=\"pc-shelf-group svelte-hk6fzp\" role=\"presentation\"> </div>"), jl = /* @__PURE__ */ G("<!> <button type=\"button\" role=\"menuitem\" class=\"svelte-hk6fzp\"><svg class=\"pc-leaf-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path></path></svg><span class=\"pc-catalog-name\"> </span><small> </small></button>", 1), Ml = /* @__PURE__ */ G("<div role=\"menu\" tabindex=\"-1\"><!> <!> <!></div>"), Nl = /* @__PURE__ */ G("<div class=\"pc-shelf-menu pc-shelf-subgraph-menu svelte-hk6fzp\" role=\"menu\" tabindex=\"-1\"><button type=\"button\" role=\"menuitem\" data-shelf-subgraph-action=\"open\">Open saved definition</button> <button type=\"button\" role=\"menuitem\" data-shelf-subgraph-action=\"delete\">Delete</button></div>"), Pl = /* @__PURE__ */ G("<div class=\"pc-shelf-drag-preview svelte-hk6fzp\" aria-hidden=\"true\"> </div>"), Fl = /* @__PURE__ */ G("<nav aria-label=\"Node families\"></nav> <!> <!> <!>", 1);
function Il(e, t) {
	He(t, !0);
	let n = ki(t, "readOnly", 3, !1), r, i = /* @__PURE__ */ I(null), a = /* @__PURE__ */ I(""), o = /* @__PURE__ */ I(!1), s = /* @__PURE__ */ I(""), c = /* @__PURE__ */ I(!1), l = /* @__PURE__ */ I(0), u = /* @__PURE__ */ I(0), d = null, f = 0, p = /* @__PURE__ */ I(null), m = /* @__PURE__ */ I(null), h = null, g = bl.map((e) => e.name), _ = (e) => bl.find((t) => t.name === e)?.color, v = null, y = null, b = null, x = /* @__PURE__ */ I(null);
	function S() {
		y !== null && clearTimeout(y), y = null;
		let e = v;
		v = null, L(x, null), document.body.classList.remove("pc-shelf-dragging"), e?.button.hasPointerCapture?.(e.pointerId) && e.button.releasePointerCapture(e.pointerId);
	}
	function C() {
		v && (y !== null && clearTimeout(y), y = null, b = v.button, document.body.classList.add("pc-shelf-dragging"), L(x, {
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
		}, !H(x) && Math.hypot(e.clientX - v.start.x, e.clientY - v.start.y) >= 5 && C(), H(x) && (e.preventDefault(), L(x, {
			...H(x),
			...v.point
		}, !0)));
	}
	function E(e) {
		if (!v || e.pointerId !== v.pointerId) return;
		let t = v.entry, n = !!H(x), i = n ? document.elementFromPoint(e.clientX, e.clientY) : null, a = r.closest(".pc-canvas-area")?.querySelector(".pc-canvas-host");
		S(), n && (e.preventDefault(), e.stopPropagation(), i && a?.contains(i) && ie(t, {
			x: e.clientX,
			y: e.clientY
		}));
	}
	function D(e, t) {
		e.currentTarget === b && e.detail !== 0 ? b = null : ie(t);
	}
	function O(e = H(a)) {
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
				let i = n.id.startsWith("operation:") ? n.id.split(":")[1] : "", a = El(i), o = i ? n.label.split(" · ")[0] : n.label, s = n.id.startsWith("boundary:");
				return {
					...n,
					title: o,
					compatible: !n.disabledReason && !!t.choose,
					catalog: !0,
					shortcode: i ? a.shortcode || n.shortcode || "" : n.shortcode ?? a.shortcode,
					group: e === "Subgraphs" ? s ? "Interface" : "Library" : void 0,
					icon: e === "Subgraphs" ? s ? Sl.Routing.icon : Sl.Library.icon : a.icon,
					searchAliases: r
				};
			});
		}
		let n = t.view?.families.find((t) => t.name === e);
		return n ? n.operations.filter((t) => e !== "Surface" || !["pattern-scan", "validate-patches"].includes(t.id)).map((t) => ({
			...t,
			...El(t.id),
			family: e
		})) : [];
	}
	function ee(e = !1) {
		L(p, null), e && h?.focus({ preventScroll: !0 });
	}
	function k(e = !1) {
		S(), f++, L(a, ""), L(o, !1), ee(), e && d?.focus({ preventScroll: !0 });
	}
	xn(() => (t.view?.graphId, t.choices, n(), () => k()));
	function A() {
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
		let i = A(), a = i.right - e.right - 6, o = e.left - i.left - 6, s = a >= t || o >= t, c = a >= t ? e.right - i.left + 3 : o >= t ? e.left - i.left - t - 3 : 13;
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
		if (ee(), H(a) === e) {
			n && H(i)?.querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
			return;
		}
		let r = ++f;
		if (L(a, e, !0), L(o, !1), d = t, await fr(), r !== f || H(a) !== e || !H(i)?.isConnected) return;
		let s = t.getBoundingClientRect(), p = H(i).getBoundingClientRect(), m = te({
			top: ne(s, H(i), p),
			left: s.left,
			right: s.right
		}, p.width, p.height, 128);
		L(l, m.x, !0), L(u, m.y, !0), L(c, m.compact, !0), n && H(i).querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
	}
	async function re() {
		let e = ++f;
		if (L(a, ""), L(o, !0), L(s, ""), await fr(), e !== f || !H(o) || !H(i)?.isConnected) return;
		let t = A();
		L(l, Math.min(136, Math.max(4, t.width - 254)), !0), L(u, 13), H(i).querySelector("input")?.focus();
	}
	function ie(e, r) {
		let i = O(e.family).find((t) => t.id === e.id);
		i?.compatible && !n() && (k(!0), r ? i.catalog ? t.choose?.(i.id, r) : t.add(i.id, r) : i.catalog ? t.choose?.(i.id) : t.add(i.id));
	}
	async function ae(e, n) {
		let r = O("Subgraphs").find((t) => t.id === e.dataset.shelfChoice);
		if (!r?.definitionRef || !t.shelfSubgraph) return;
		let i = A(), a = e.getBoundingClientRect();
		if (h = e, L(p, {
			id: r.id,
			title: r.title,
			x: (n?.x ?? a.right) - i.left,
			y: (n?.y ?? a.top) - i.top
		}, !0), await fr(), !H(p) || H(p).id !== r.id || !H(m)?.isConnected) return;
		let o = H(m).getBoundingClientRect();
		L(p, {
			...H(p),
			x: Math.max(4, Math.min(H(p).x, i.width - o.width - 4)),
			y: Math.max(4, Math.min(H(p).y, i.height - o.height - 4))
		}, !0), H(m).querySelector("button")?.focus({ preventScroll: !0 });
	}
	function oe(e) {
		let n = e.target.closest("[data-shelf-choice]");
		n && O("Subgraphs").some((e) => e.id === n.dataset.shelfChoice && e.definitionRef) && t.shelfSubgraph && (e.preventDefault(), e.stopPropagation(), ae(n, {
			x: e.clientX,
			y: e.clientY
		}));
	}
	function se(e) {
		let n = O("Subgraphs").find((e) => e.id === H(p)?.id);
		k(!0), n?.definitionRef && t.shelfSubgraph?.(n.id, e);
	}
	function ce(e) {
		if ((e.key === "ContextMenu" || e.key === "F10" && e.shiftKey) && e.target.dataset.shelfChoice) {
			e.preventDefault(), e.stopPropagation(), ae(e.target);
			return;
		}
		if (H(p) && e.key === "Escape") {
			e.preventDefault(), e.stopPropagation(), ee(!0);
			return;
		}
		if (e.key === "Escape") {
			e.preventDefault(), e.stopPropagation(), k(!0);
			return;
		}
		let t = e.target;
		if (e.key === "ArrowRight" && t.dataset.family && !t.disabled) {
			e.preventDefault(), e.stopPropagation(), j(t.dataset.family, t);
			return;
		}
		if (e.key === "ArrowLeft" && H(a)) {
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
	var le = { openSearch: re }, ue = Fl();
	U("pointerdown", nn, (e) => {
		e.target.closest(".pc-node-shelf, .pc-shelf-menu") || k();
	}), U("pointermove", nn, T), U("pointerup", nn, E), U("pointercancel", nn, () => S()), U("blur", nn, () => k()), U("resize", nn, () => k()), U("keydown", nn, (e) => {
		v && e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), k(!0));
	});
	var de = z(ue);
	Y(de, 21, () => bl, Gr, (e, t) => {
		var n = Dl();
		let r;
		var i = R(n), o = R(i);
		N(i);
		var s = B(i), c = R(s, !0);
		N(s), N(n), V((e) => {
			Z(n, "data-family", H(t).name), n.disabled = e, Z(n, "title", "Browse " + H(t).name + " nodes"), Z(n, "aria-expanded", H(a) === H(t).name), r = di(n, "", r, { "--pc-family": H(t).color }), Z(o, "d", H(t).icon), q(c, H(t).name);
		}, [() => !O(H(t).name).length]), W("click", n, (e) => j(H(t).name, e.currentTarget)), U("pointerenter", n, (e) => {
			e.pointerType !== "touch" && !e.currentTarget.disabled && j(H(t).name, e.currentTarget, !1);
		}), W("keydown", n, ce), K(e, n);
	}), N(de), Q(de, (e) => r = e, () => r);
	var fe = B(de, 2), pe = (e) => {
		let r = /* @__PURE__ */ P(() => H(o) ? g.flatMap((e) => O(e)).filter((e) => [
			e.title,
			e.id,
			e.family,
			e.purpose,
			e.shortcode,
			...e.searchAliases ?? []
		].join(" ").toLowerCase().includes(H(s).toLowerCase())) : O());
		var d = Ml();
		let f;
		var p = R(d), m = (e) => {
			var t = Ol();
			W("click", t, () => k(!0)), K(e, t);
		};
		J(p, (e) => {
			H(c) && H(a) && e(m);
		});
		var h = B(p, 2), v = (e) => {
			var t = kl();
			X(t), Ti(t, () => H(s), (e) => L(s, e)), K(e, t);
		};
		J(h, (e) => {
			H(o) && e(v);
		}), Y(B(h, 2), 19, () => H(r), (e) => e.family + e.id, (e, i, a) => {
			let s = /* @__PURE__ */ P(() => !H(i).compatible || n()), c = /* @__PURE__ */ P(() => !!H(i).definitionRef && !!t.shelfSubgraph);
			var l = jl(), u = z(l), d = (e) => {
				var t = Al(), n = R(t, !0);
				N(t), V(() => {
					Z(t, "data-shelf-group", H(i).group), q(n, H(i).group);
				}), K(e, t);
			};
			J(u, (e) => {
				!H(o) && H(i).group && H(r)[H(a) - 1]?.group !== H(i).group && e(d);
			});
			var f = B(u, 2);
			let p;
			var m = R(f), h = R(m);
			N(m);
			var g = B(m), v = R(g, !0);
			N(g);
			var y = B(g), b = R(y, !0);
			N(y), N(f), V((e) => {
				Z(f, "data-shelf-choice", H(i).id), Z(f, "data-insertion-disabled", H(s)), f.disabled = H(s) && !H(c), Z(f, "aria-disabled", H(s) && !H(c)), Z(f, "aria-haspopup", H(c) ? "menu" : void 0), Z(f, "title", n() ? H(c) ? "This graph is read-only. Right-click for subgraph actions." : "This graph is read-only." : H(i).disabledReason || (H(i).compatible ? H(i).purpose || "Add " + H(i).title : "Requires the " + H(i).phase + " phase")), p = di(f, "", p, e), Z(h, "d", H(i).icon), q(v, H(i).title), q(b, H(i).shortcode);
			}, [() => ({ "--pc-family": _(H(i).family) })]), W("pointerdown", f, (e) => w(e, H(i))), U("lostpointercapture", f, () => S()), W("click", f, (e) => D(e, H(i))), K(e, l);
		}), N(d), Q(d, (e) => L(i, e), () => H(i)), V((e) => {
			li(d, 1, `pc-shelf-menu ${H(o) ? "pc-leaf-menu" : "pc-family-menu"}`, "svelte-hk6fzp"), Z(d, "aria-label", H(o) ? "Search nodes" : H(a) + " nodes"), f = di(d, "", f, e);
		}, [() => ({
			left: `${H(l)}px`,
			top: `${H(u)}px`,
			"--pc-family": _(H(a))
		})]), W("keydown", d, ce), W("contextmenu", d, oe), K(e, d);
	};
	J(fe, (e) => {
		(H(a) || H(o)) && e(pe);
	});
	var me = B(fe, 2), he = (e) => {
		var t = Nl();
		let n;
		var r = R(t), i = B(r, 2);
		N(t), Q(t, (e) => L(m, e), () => H(m)), V(() => {
			Z(t, "aria-label", H(p).title + " actions"), n = di(t, "", n, {
				left: `${H(p).x}px`,
				top: `${H(p).y}px`
			});
		}), W("keydown", t, ce), W("click", r, () => se("open")), W("click", i, () => se("delete")), K(e, t);
	};
	J(me, (e) => {
		H(p) && e(he);
	});
	var ge = B(me, 2), _e = (e) => {
		var t = Pl();
		let n;
		var r = R(t, !0);
		N(t), V((e) => {
			n = di(t, "", n, e), q(r, H(x).title);
		}, [() => ({
			"--pc-family": _(H(x).family),
			left: `${H(x).x + 12}px`,
			top: `${H(x).y + 12}px`
		})]), K(e, t);
	};
	return J(ge, (e) => {
		H(x) && e(_e);
	}), V(() => li(de, 1, `pc-node-shelf${H(c) && H(a) ? " pc-shelf-replaced" : ""}`, "svelte-hk6fzp")), K(e, ue), Ue(le);
}
wr([
	"click",
	"keydown",
	"contextmenu",
	"pointerdown"
]);
//#endregion
//#region ui/ExamplesBrowser.svelte
var Ll = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-btn menu_button svelte-18p7ib8\">Retry</button>"), Rl = /* @__PURE__ */ G("<div class=\"pc-examples-issue svelte-18p7ib8\" role=\"alert\"><span class=\"svelte-18p7ib8\"> </span><!></div>"), zl = /* @__PURE__ */ Nr("<g class=\"pc-example-comment svelte-18p7ib8\"><rect rx=\"4\" class=\"svelte-18p7ib8\"></rect><text class=\"svelte-18p7ib8\"> </text></g>"), Bl = /* @__PURE__ */ Nr("<path class=\"pc-wire pc-wire-native svelte-18p7ib8\"></path>"), Vl = /* @__PURE__ */ Nr("<circle class=\"pc-example-pin-dot svelte-18p7ib8\" r=\"4\"></circle><path class=\"pc-example-pin-cue svelte-18p7ib8\"></path><text class=\"pc-example-pin-label svelte-18p7ib8\"> </text>", 1), Hl = /* @__PURE__ */ Nr("<g><rect class=\"pc-example-card svelte-18p7ib8\" rx=\"4\"></rect><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\"><path class=\"pc-example-icon svelte-18p7ib8\"></path></svg><text class=\"pc-example-node-title svelte-18p7ib8\" lengthAdjust=\"spacingAndGlyphs\"> </text><!></g>"), Ul = /* @__PURE__ */ Nr("<svg class=\"pc-example-preview svelte-18p7ib8\" preserveAspectRatio=\"xMidYMid meet\" aria-hidden=\"true\" focusable=\"false\"><!><!><!></svg>"), Wl = /* @__PURE__ */ G("<span class=\"pc-example-unavailable-preview svelte-18p7ib8\"><strong class=\"svelte-18p7ib8\">Unavailable</strong><span class=\"svelte-18p7ib8\"> </span></span>"), Gl = /* @__PURE__ */ G("<button type=\"button\"><!> <span class=\"pc-example-title svelte-18p7ib8\"> </span></button>"), Kl = /* @__PURE__ */ G("<!> <div class=\"pc-examples-grid svelte-18p7ib8\"></div>", 1);
function ql(e, t) {
	He(t, !0);
	let n = {
		context: "M -4,0 a 4,4 0 1,0 8,0 a 4,4 0 1,0 -8,0",
		text: "M -3.4,0 a 3.4,3.4 0 1,0 6.8,0 a 3.4,3.4 0 1,0 -6.8,0",
		data: "M -4,-4 H 4 V 4 H -4 Z",
		guidance: "M 0,-5 L 5,0 L 0,5 L -5,0 Z",
		draft: "M 0,-5 L 4.76,-1.55 L 2.94,4.05 L -2.94,4.05 L -4.76,-1.55 Z",
		findings: "M 0,-5 L 4.33,3 L -4.33,3 Z",
		patches: "M -2.5,-4.33 L 2.5,-4.33 L 5,0 L 2.5,4.33 L -2.5,4.33 L -5,0 Z",
		candidate: "M -1.5,-5 H 1.5 V -1.5 H 5 V 1.5 H 1.5 V 5 H -1.5 V 1.5 H -5 V -1.5 H -1.5 Z"
	}, r = ki(t, "examples", 19, () => []), i = ki(t, "issue", 3, ""), a = ki(t, "scrollTop", 3, 0), o, s = /* @__PURE__ */ I("");
	Ai(() => {
		o.scrollTop = a();
	});
	async function c(e) {
		if (!H(s)) {
			L(s, e, !0);
			try {
				await t.open(e);
			} finally {
				L(s, "");
			}
		}
	}
	var l = Kl(), u = z(l), d = (e) => {
		var n = Rl(), r = R(n), a = R(r, !0);
		N(r);
		var o = B(r), s = (e) => {
			var n = Ll();
			W("click", n, () => t.retry?.()), K(e, n);
		};
		J(o, (e) => {
			t.retry && e(s);
		}), N(n), V(() => q(a, i())), K(e, n);
	};
	J(u, (e) => {
		i() && e(d);
	});
	var f = B(u, 2);
	Y(f, 21, r, (e) => e.id, (e, t) => {
		let r = /* @__PURE__ */ P(() => H(t).thumbnail);
		var i = Gl();
		let a;
		var o = R(i), l = (e) => {
			var t = Ul(), i = R(t);
			Y(i, 17, () => H(r).comments, (e) => e.id, (e, t) => {
				var n = zl(), r = R(n);
				let i;
				var a = B(r), o = R(a, !0);
				N(a), N(n), V(() => {
					Z(n, "data-id", H(t).id), Z(r, "x", H(t).x), Z(r, "y", H(t).y), Z(r, "width", H(t).w), Z(r, "height", H(t).h), i = di(r, "", i, { stroke: H(t).color }), Z(a, "x", H(t).x + 12), Z(a, "y", H(t).y + 24), q(o, H(t).title);
				}), K(e, n);
			});
			var a = B(i);
			Y(a, 17, () => H(r).wires, (e) => e.id, (e, t) => {
				var n = Bl();
				V(() => {
					Z(n, "data-kind", H(t).kind), Z(n, "data-id", H(t).id), Z(n, "d", H(t).d);
				}), K(e, n);
			}), Y(B(a), 17, () => H(r).nodes, (e) => e.id, (e, t) => {
				var r = Hl(), i = R(r), a = B(i), o = R(a);
				N(a);
				var s = B(a), c = R(s, !0);
				N(s), Y(B(s), 17, () => H(t).ports, (e) => e.id, (e, t) => {
					var r = Vl(), i = z(r), a = B(i), o = B(a), s = R(o, !0);
					N(o), V(() => {
						Z(i, "data-kind", H(t).kind), Z(i, "cx", H(t).x), Z(i, "cy", H(t).y), Z(a, "data-kind", H(t).kind), Z(a, "transform", `translate(${H(t).x} ${H(t).y})`), Z(a, "d", n[H(t).kind] ?? n.context), Z(o, "x", H(t).x + (H(t).dir === "in" ? 9 : -9)), Z(o, "y", H(t).y + 4), Z(o, "text-anchor", H(t).dir === "in" ? "start" : "end"), q(s, H(t).label);
					}), K(e, r);
				}), N(r), V(() => {
					li(r, 0, ri(H(t).className), "svelte-18p7ib8"), Z(r, "data-id", H(t).id), Z(i, "x", H(t).x), Z(i, "y", H(t).y), Z(i, "width", H(t).w), Z(i, "height", H(t).h), Z(a, "x", H(t).x + 8), Z(a, "y", H(t).y + 7), Z(o, "d", H(t).iconPath), Z(s, "x", H(t).x + 28), Z(s, "y", H(t).y + 20), Z(s, "textLength", H(t).title.length * 6 > H(t).w - 36 ? H(t).w - 36 : void 0), q(c, H(t).title);
				}), K(e, r);
			}), N(t), V(() => Z(t, "viewBox", `${H(r).bounds.x} ${H(r).bounds.y} ${H(r).bounds.w} ${H(r).bounds.h}`)), K(e, t);
		}, u = (e) => {
			var n = Wl(), r = B(R(n)), i = R(r, !0);
			N(r), N(n), V(() => {
				Z(r, "id", `pc-example-issue-${H(t).number}`), q(i, H(t).issue);
			}), K(e, n);
		};
		J(o, (e) => {
			H(r) ? e(l) : e(u, -1);
		});
		var d = B(o, 2), f = R(d, !0);
		N(d), N(i), V(() => {
			a = li(i, 1, "pc-example-tile svelte-18p7ib8", null, a, { "pc-example-unavailable": !H(r) }), Z(i, "aria-label", H(t).title), Z(i, "aria-describedby", H(t).issue ? `pc-example-issue-${H(t).number}` : void 0), Z(i, "title", H(t).issue || H(t).goal), i.disabled = !!H(s) || !H(r), q(f, H(t).title);
		}), W("click", i, () => c(H(t).id)), K(e, i);
	}), N(f), Q(f, (e) => o = e, () => o), V(() => Z(f, "aria-busy", !!H(s))), U("scroll", f, () => t.scroll(o.scrollTop)), K(e, l), Ue();
}
wr(["click"]);
//#endregion
//#region ui/ImportReview.svelte
var Jl = /* @__PURE__ */ G("<p> </p>"), Yl = /* @__PURE__ */ G("<li> </li>"), Xl = /* @__PURE__ */ G("<h3>Saved bindings to review</h3><ul></ul>", 1), Zl = /* @__PURE__ */ G("<p>Saved model metadata is present. Review local connections before running.</p>"), Ql = /* @__PURE__ */ G("<h3>Imported terminal effects</h3><ul></ul>", 1), $l = /* @__PURE__ */ G("<p>No imported terminal effects.</p>"), eu = /* @__PURE__ */ G("<p role=\"alert\"> </p>"), tu = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-btn menu_button\">Prepare again</button>"), nu = /* @__PURE__ */ G("<div class=\"pc-workspace-overlay pc-import-overlay\"><div class=\"pc-workspace-dialog pc-import-review\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Import into graph\" tabindex=\"-1\"><header><h2>Import into graph</h2><button type=\"button\" class=\"pc-btn menu_button\" aria-label=\"Cancel import\">×</button></header> <p><strong> </strong> <small> </small></p> <dl><dt>Phase</dt><dd> </dd><dt>Additions</dt><dd> </dd><dt>Conservative request bound</dt><dd> </dd></dl> <p class=\"pc-import-explanation\">This authoring bound includes unfinished branches. Bindings and reachable execution are checked when you explicitly run the workflow.</p> <!> <!> <!> <p>Insertion keeps internal wiring and relative layout. It does not connect matching names, arm or assign the graph, run requests, publish Guidance, or Apply a reply.</p> <!> <footer><button type=\"button\" class=\"pc-btn menu_button\">Cancel</button><!><button type=\"button\" class=\"pc-btn menu_button pc-import-accept\">Insert into graph</button></footer></div></div>");
function ru(e, t) {
	He(t, !0);
	let n;
	Ai(() => {
		let e = document.activeElement;
		return n.querySelector("button")?.focus(), () => e?.focus({ preventScroll: !0 });
	});
	function r(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), t.actions.cancelImport?.()), e.key === "Tab") {
			let t = [...n.querySelectorAll("button:not(:disabled)")], r = t[0], i = t.at(-1);
			e.shiftKey && document.activeElement === r && (e.preventDefault(), i?.focus()), !e.shiftKey && document.activeElement === i && (e.preventDefault(), r?.focus());
		}
	}
	var i = nu(), a = R(i), o = R(a), s = B(R(o));
	N(o);
	var c = B(o, 2), l = R(c), u = R(l, !0);
	N(l);
	var d = B(l, 2), f = R(d, !0);
	N(d), N(c);
	var p = B(c, 2), m = B(R(p)), h = R(m, !0);
	N(m);
	var g = B(m, 2), _ = R(g);
	N(g);
	var v = B(g, 2), y = R(v);
	N(v), N(p);
	var b = B(p, 4), x = (e) => {
		var n = Jl(), r = R(n);
		N(n), V((e) => q(r, `Imported model roles: ${e ?? ""}.`), [() => t.view.requiredRoles.join(", ")]), K(e, n);
	};
	J(b, (e) => {
		t.view.requiredRoles.length && e(x);
	});
	var S = B(b, 2), C = (e) => {
		var n = Xl(), r = B(z(n));
		Y(r, 21, () => t.view.unresolvedBindings, Gr, (e, t) => {
			var n = Yl(), r = R(n);
			N(n), V((e) => q(r, `${H(t).title ?? ""} · ${H(t).role ?? ""}: missing ${e ?? ""}`), [() => H(t).missing.join(" and ")]), K(e, n);
		}), N(r), K(e, n);
	}, w = (e) => {
		K(e, Zl());
	};
	J(S, (e) => {
		t.view.unresolvedBindings.length ? e(C) : t.view.bindingReviewRequired && e(w, 1);
	});
	var T = B(S, 2), E = (e) => {
		var n = Ql(), r = B(z(n));
		Y(r, 21, () => t.view.terminals, Gr, (e, t) => {
			var n = Yl(), r = R(n);
			N(n), V(() => q(r, `${H(t).title ?? ""} · ${H(t).operation ?? ""}`)), K(e, n);
		}), N(r), K(e, n);
	}, D = (e) => {
		K(e, $l());
	};
	J(T, (e) => {
		t.view.terminals.length ? e(E) : e(D, -1);
	});
	var O = B(T, 4), ee = (e) => {
		var n = eu(), r = R(n, !0);
		N(n), V(() => q(r, t.view.error)), K(e, n);
	};
	J(O, (e) => {
		t.view.error && e(ee);
	});
	var k = B(O, 2), A = R(k), te = B(A), ne = (e) => {
		var n = tu();
		W("click", n, () => t.actions.prepareImportAgain?.()), K(e, n);
	};
	J(te, (e) => {
		t.view.error && e(ne);
	});
	var j = B(te);
	N(k), N(a), Q(a, (e) => n = e, () => n), N(i), V(() => {
		q(u, t.view.name), q(f, t.view.fileName), q(h, t.view.phase), q(_, `${t.view.nodeCount ?? ""} blocks · ${t.view.wireCount ?? ""} wires · ${t.view.groupCount ?? ""} groups`), q(y, `${t.view.callBound ?? ""} total · ${t.view.importedCallBound ?? ""} imported`), j.disabled = !!t.view.error;
	}), W("keydown", a, r), U("paste", a, (e) => e.stopPropagation()), W("click", s, () => t.actions.cancelImport?.()), W("click", A, () => t.actions.cancelImport?.()), W("click", j, () => t.actions.acceptImport?.()), K(e, i), Ue();
}
wr(["keydown", "click"]);
//#endregion
//#region ui/WorkspaceReport.svelte
var iu = /* @__PURE__ */ G("<li class=\"svelte-1xdk4mm\"> </li>"), au = /* @__PURE__ */ G("<ul></ul>"), ou = /* @__PURE__ */ G("<p role=\"status\" class=\"svelte-1xdk4mm\">No validation issues found.</p>"), su = /* @__PURE__ */ G("<p class=\"svelte-1xdk4mm\">Root workflow: <strong> </strong> </p> <!> <p class=\"svelte-1xdk4mm\">Validation checks the current workflow without running it. Diagnostic previews and Apply recheck their inputs when used.</p>", 1), cu = /* @__PURE__ */ G("<p class=\"svelte-1xdk4mm\">Workflow validation is unavailable.</p>"), lu = /* @__PURE__ */ G("<p class=\"svelte-1xdk4mm\"><strong> </strong></p> <p class=\"svelte-1xdk4mm\">Named-pin workflows, optional scene guidance and reviewed reply repairs for SillyTavern.</p> <p class=\"svelte-1xdk4mm\"><a target=\"_blank\" rel=\"noreferrer\" class=\"svelte-1xdk4mm\">Project guide</a></p>", 1), uu = /* @__PURE__ */ G("<p class=\"svelte-1xdk4mm\">Browse the node shelf by family. Select a node to read its controls, connections and help in Details.</p> <p class=\"svelte-1xdk4mm\"><a target=\"_blank\" rel=\"noreferrer\" class=\"svelte-1xdk4mm\">Open the complete node reference</a></p>", 1), du = /* @__PURE__ */ G("<table class=\"svelte-1xdk4mm\"><thead><tr><th class=\"svelte-1xdk4mm\">Action</th><th class=\"svelte-1xdk4mm\">Shortcut</th></tr></thead><tbody><tr><td class=\"svelte-1xdk4mm\">Undo / Redo</td><td class=\"svelte-1xdk4mm\">Ctrl Z / Ctrl Shift Z</td></tr><tr><td class=\"svelte-1xdk4mm\">Cut / Copy / Paste</td><td class=\"svelte-1xdk4mm\">Ctrl X / Ctrl C / Ctrl V</td></tr><tr><td class=\"svelte-1xdk4mm\">Duplicate / Delete selection</td><td class=\"svelte-1xdk4mm\">Ctrl D / Delete</td></tr><tr><td class=\"svelte-1xdk4mm\">Select all</td><td class=\"svelte-1xdk4mm\">Ctrl A</td></tr><tr><td class=\"svelte-1xdk4mm\">Group / Ungroup</td><td class=\"svelte-1xdk4mm\">Ctrl G / Ctrl Shift G</td></tr><tr><td class=\"svelte-1xdk4mm\">Comment selection / Add comment</td><td class=\"svelte-1xdk4mm\">C</td></tr><tr><td class=\"svelte-1xdk4mm\">Center / Fit selection</td><td class=\"svelte-1xdk4mm\">F / .</td></tr><tr><td class=\"svelte-1xdk4mm\">Rename selection</td><td class=\"svelte-1xdk4mm\">F2</td></tr><tr><td class=\"svelte-1xdk4mm\">Pan / Zoom</td><td class=\"svelte-1xdk4mm\">Middle mouse / Wheel</td></tr><tr><td class=\"svelte-1xdk4mm\">Dismiss a menu or panel</td><td class=\"svelte-1xdk4mm\">Escape</td></tr></tbody></table> <p class=\"svelte-1xdk4mm\">In menus, use arrows to move, Home/End to jump, type a label to find it, and Enter/Space to choose it. Tab dismisses the menu.</p>", 1), fu = /* @__PURE__ */ G("<p class=\"svelte-1xdk4mm\">Browse node families on the floating shelf. Middle mouse pans the graph; the wheel zooms around the pointer. Use the dividers or their arrow keys to resize Preview and Details. View controls panel visibility and restores the default layout.</p> <p class=\"svelte-1xdk4mm\">File opens examples and workflows, saves edits to SillyTavern, imports a fragment into the current graph, and exports a portable copy without local connections. The workflow selector chooses a saved root; graph tabs open child views.</p> <p class=\"svelte-1xdk4mm\">Assign and arm a unified workflow from Workflow, then Send in SillyTavern to generate a reply. Select model nodes to choose their connections in Details. Workflow › Configure holds Workflow Data, Fast connections and Recall arms.</p> <p class=\"svelte-1xdk4mm\">Graph groups nodes, creates and saves subgraphs, adds comments and manages portals. Right-click actions remain available beside the relevant node or pin.</p> <p class=\"svelte-1xdk4mm\">Preview follows selection until you pin an output. Workflow › Run to current output tests its dependencies within the displayed request bound. Apply and Reject stay beside the exact result they review.</p> <p class=\"svelte-1xdk4mm\"><a target=\"_blank\" rel=\"noreferrer\" class=\"svelte-1xdk4mm\">Open the project guide</a> · <a target=\"_blank\" rel=\"noreferrer\" class=\"svelte-1xdk4mm\">Node reference</a></p>", 1);
function pu(e, t) {
	He(t, !0);
	var n = Fr(), r = z(n), i = (e) => {
		var n = Fr(), r = z(n), i = (e) => {
			var n = su(), r = z(n), i = B(R(r)), a = R(i, !0);
			N(i);
			var o = B(i);
			N(r);
			var s = B(r, 2), c = (e) => {
				var n = au();
				Y(n, 21, () => t.workflow.issues, Gr, (e, t) => {
					var n = iu(), r = R(n, !0);
					N(n), V(() => q(r, H(t))), K(e, n);
				}), N(n), K(e, n);
			}, l = (e) => {
				K(e, ou());
			};
			J(s, (e) => {
				t.workflow.issues.length ? e(c) : e(l, -1);
			}), je(2), V(() => {
				q(a, t.workflow.name), q(o, ` · ${t.workflow.phase ?? ""} · maximum ${t.workflow.callBound ?? ""} model requests.`);
			}), K(e, n);
		}, a = (e) => {
			K(e, cu());
		};
		J(r, (e) => {
			t.workflow ? e(i) : e(a, -1);
		}), K(e, n);
	}, a = (e) => {
		var n = lu(), r = z(n), i = R(r), a = R(i);
		N(i), N(r);
		var o = B(r, 4), s = R(o);
		N(o), V(() => {
			q(a, `Lattice ${t.version ?? ""}`), Z(s, "href", t.guideUrl);
		}), K(e, n);
	}, o = (e) => {
		var n = uu(), r = B(z(n), 2), i = R(r);
		N(r), V(() => Z(i, "href", t.referenceUrl)), K(e, n);
	}, s = (e) => {
		var t = du();
		je(2), K(e, t);
	}, c = (e) => {
		var n = fu(), r = B(z(n), 10), i = R(r), a = B(i, 2);
		N(r), V(() => {
			Z(i, "href", t.guideUrl), Z(a, "href", t.referenceUrl);
		}), K(e, n);
	};
	J(r, (e) => {
		t.panel === "validate-workflow" ? e(i) : t.panel === "about" ? e(a, 1) : t.panel === "node-reference" ? e(o, 2) : t.panel === "shortcuts" ? e(s, 3) : e(c, -1);
	}), K(e, n), Ue();
}
var mu = {
	display_name: "Lattice",
	loading_order: 120,
	generate_interceptor: "latticeGenerationInterceptor",
	requires: [],
	optional: [],
	js: "index.js?v=0.26.0",
	css: "style.css",
	author: "Dulgadurbit",
	version: "0.26.0",
	homePage: "https://github.com/MentallyQuill/Lattice",
	auto_update: !1,
	description: "Build named-pin workflows for optional scene guidance and reviewed reply repairs in SillyTavern, with per-node model connections."
}, hu = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-recall-badge\"> </button>"), gu = /* @__PURE__ */ G("<p class=\"pc-native-diagnostic svelte-1dr9aew\" role=\"alert\"> </p>"), _u = /* @__PURE__ */ G("<div class=\"pc-workspace-overlay\"><div role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\"><header class=\"svelte-1dr9aew\"><h2 class=\"svelte-1dr9aew\"> </h2><button type=\"button\" class=\"pc-btn menu_button\" aria-label=\"Close panel\">×</button></header> <!></div></div>"), vu = /* @__PURE__ */ G("<div class=\"pc-workspace-overlay\"><div class=\"pc-manager-dialog svelte-1dr9aew\" role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\" aria-label=\"Manage portals\"><!></div></div>"), yu = /* @__PURE__ */ G("<div role=\"dialog\" aria-modal=\"true\" aria-label=\"Lattice\" data-pc-workbench=\"svelte\"><!> <!> <div class=\"pc-body\" role=\"region\" aria-label=\"Workspace panels\" tabindex=\"0\"><div class=\"pc-stage\"><section aria-label=\"Output preview\"><header class=\"pc-preview-pane-head\"><strong>Preview</strong><button type=\"button\" class=\"pc-btn menu_button\"> </button></header> <div class=\"pc-preview-content\"><!></div></section> <!> <!> <!> <div class=\"pc-canvas-area\" id=\"pc-workspace-graph\" role=\"tabpanel\"><div class=\"pc-workspace-run svelte-1dr9aew\"><!></div> <div class=\"pc-canvas-host\" aria-label=\"Node canvas\"></div> <!> <div><!></div></div></div> <!> <div class=\"pc-inspector pc-workspace-details svelte-1dr9aew\"><header class=\"pc-details-heading svelte-1dr9aew\"><strong class=\"svelte-1dr9aew\">Details</strong><button type=\"button\" aria-label=\"Close Details\" title=\"Close Details\" class=\"svelte-1dr9aew\">×</button></header> <!> <div class=\"pc-node-details-holder svelte-1dr9aew\"><!></div></div></div> <!> <!> <!> <!> <!> <!> <!> <!></div>");
function bu(e, t) {
	He(t, !0);
	let n = ki(t, "actions", 7), r = /* @__PURE__ */ I({
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
		L(r, {
			...H(r),
			...e
		}), e.fastConnectionsActive === !0 ? ue("fast-connections") : e.fastConnectionsActive === !1 && H(D) === "fast-connections" && de();
	}
	function m(e) {
		return u?.startRename(e);
	}
	async function h(e, t) {
		if (await fr(), !t()) return;
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
	let v = _(), y = /* @__PURE__ */ I($t(v.height)), b = /* @__PURE__ */ I($t(v.collapsed)), x = /* @__PURE__ */ I(500), S = /* @__PURE__ */ I($t(v.shelfOpen)), C = /* @__PURE__ */ I(null), w = /* @__PURE__ */ I(520), T = /* @__PURE__ */ P(() => Math.max(220, Math.min(H(w), H(C) ?? H(r).detailsWidth ?? 258)));
	function E(e) {
		L(C, null), L(r, {
			...H(r),
			detailsWidth: e
		}), n().resizeDetails?.(e);
	}
	let D = /* @__PURE__ */ I(""), O = /* @__PURE__ */ P(() => ({
		examples: "Examples",
		"run-details": "Run details",
		"fast-connections": "Fast connections",
		"story-documents": "Workflow Data",
		"recall-arms": "Recall arms",
		"validate-workflow": "Workflow validation",
		"node-reference": "Node reference",
		shortcuts: "Keyboard shortcuts",
		about: "About Lattice"
	})[H(D)] ?? "Workspace guide"), ee = /* @__PURE__ */ P(() => H(r).rootWorkflow ?? H(r).workflow), k = /* @__PURE__ */ P(() => n().logoUrl ? new URL("../docs/node-reference.md", n().logoUrl).href : ""), A = /* @__PURE__ */ P(() => n().logoUrl ? new URL("../README.md", n().logoUrl).href : ""), te = /* @__PURE__ */ I(null), ne = null, j = 0, re = /* @__PURE__ */ I(0), ie;
	function ae() {
		try {
			localStorage.setItem(g, JSON.stringify({
				height: H(y),
				collapsed: H(b),
				shelfOpen: H(S)
			}));
		} catch {}
	}
	function oe() {
		n().resizeStart?.();
	}
	function se(e) {
		oe(), L(b, e, !0), ae();
	}
	function ce() {
		se(!1);
	}
	function le(e) {
		let t = H(r).outputPreview;
		if (!t) return;
		if (e === "follow-preview" || e === "pin-preview" && t.pinned) {
			n().outputPreview?.follow?.();
			return;
		}
		let i = t.choices.find((e) => e.key === t.selectedKey);
		if (!i || t.status === "removed") return;
		let a = structuredClone(i.target);
		e === "pin-preview" ? n().outputPreview?.pin?.(t.sourceKey, a) : e === "run-preview" && t.runHere?.enabled && !t.busy && !H(ee)?.ownedBusy && (se(!1), n().outputPreview?.runHere?.(t.sourceKey, a));
	}
	async function ue(e) {
		if (e === "show-preview") se(!1);
		else if (e === "collapse-preview") se(!0);
		else if (e === "toggle-preview") se(!H(b));
		else if (e === "toggle-shelf") oe(), L(S, !H(S)), ae();
		else if (e === "reset-layout") oe(), L(y, 240), L(b, !1), L(S, !0), E(258), H(r).inspectorOpen || n().command("inspector"), ae();
		else if (e === "add-node") L(S, !0), ae(), await fr(), ie.openSearch();
		else if ([
			"follow-preview",
			"pin-preview",
			"run-preview"
		].includes(e)) le(e);
		else {
			ne = document.activeElement, e === "examples" && n().refreshExamples?.(), e === "fast-connections" && n().fastConnections?.refresh?.(), e === "story-documents" && n().storyDocuments?.refresh?.(), e === "recall-arms" && n().recallArms?.refresh?.();
			let t = ++j;
			L(D, e, !0), await fr(), t === j && H(D) === e && H(te)?.querySelector("button")?.focus();
		}
	}
	function de() {
		j++, L(D, ""), ne?.focus({ preventScroll: !0 });
	}
	async function fe(e) {
		let t = j;
		try {
			let r = await n().openExample?.(e);
			return r === !0 && t === j && H(D) === "examples" && de(), r === !0;
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
			let t = [...H(te).querySelectorAll("a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex=\"0\"]")], n = t[0], r = t.at(-1);
			e.shiftKey && document.activeElement === n && (e.preventDefault(), r?.focus()), !e.shiftKey && document.activeElement === r && (e.preventDefault(), n?.focus());
		}
	}
	Ai(() => {
		let e = () => {
			L(x, Math.max(90, s.clientHeight - 190), !0), L(w, Math.max(220, Math.min(520, (a.clientWidth || i.clientWidth || window.innerWidth) - 368)), !0);
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
	}, ge = yu();
	let _e, ve;
	var ye = R(ge);
	{
		let e = /* @__PURE__ */ P(() => ({
			previewOpen: !H(b),
			shelfOpen: H(S)
		}));
		Q(wa(ye, {
			get state() {
				return H(r);
			},
			get actions() {
				return n();
			},
			local: ue,
			get panels() {
				return H(e);
			}
		}), (e) => l = e, () => l);
	}
	var be = B(ye, 2), xe = (e) => {
		var t = hu(), n = R(t);
		N(t), V((e) => q(n, `Recall armed · ${e ?? ""}`), [() => H(r).recallArms.nodes.filter((e) => e.armed).length]), W("click", t, () => ue("recall-arms")), K(e, t);
	}, Se = /* @__PURE__ */ P(() => H(r).recallArms?.nodes.some((e) => e.armed));
	J(be, (e) => {
		H(Se) && e(xe);
	});
	var Ce = B(be, 2), we = R(Ce), Te = R(we);
	let Ee, De;
	var Oe = R(Te), M = B(R(Oe)), ke = R(M, !0);
	N(M), N(Oe);
	var Ae = B(Oe, 2), je = R(Ae);
	{
		let e = /* @__PURE__ */ P(() => H(r).outputPreview ?? null);
		js(je, {
			get view() {
				return H(e);
			},
			get actions() {
				return n().outputPreview;
			},
			collapse: () => se(!0)
		});
	}
	N(Ae), N(Te);
	var Me = B(Te, 2), Ne = (e) => {
		{
			let t = /* @__PURE__ */ P(() => Math.min(H(y), H(x)));
			Ea(e, {
				get height() {
					return H(t);
				},
				get max() {
					return H(x);
				},
				start: oe,
				change: (e) => {
					L(y, e, !0), ae();
				}
			});
		}
	};
	J(Me, (e) => {
		H(b) || e(Ne);
	});
	var Pe = B(Me, 2);
	Q(Ra(Pe, {
		get views() {
			return H(r).graphViews;
		},
		get actions() {
			return n().graphViewActions;
		},
		panelId: "pc-workspace-graph"
	}), (e) => u = e, () => u);
	var Fe = B(Pe, 2);
	{
		let e = /* @__PURE__ */ P(() => H(r).graphViews?.active);
		Ua(Fe, {
			get view() {
				return H(e);
			},
			get actions() {
				return n().graphViewActions;
			}
		});
	}
	var Ie = B(Fe, 2), Le = R(Ie), Re = R(Le);
	{
		let e = /* @__PURE__ */ P(() => H(r).runMeter ?? null);
		Ks(Re, {
			get view() {
				return H(e);
			},
			open: () => {
				L(D, "run-details");
			}
		});
	}
	N(Le);
	var ze = B(Le, 2);
	Q(ze, (e) => o = e, () => o);
	var Be = B(ze, 2), Ve = (e) => {
		var t = gu(), n = R(t, !0);
		N(t), V(() => q(n, H(r).nativeDiagnostic)), K(e, t);
	};
	J(Be, (e) => {
		H(r).nativeDiagnostic && e(Ve);
	});
	var We = B(Be, 2);
	Q(Il(R(We), {
		get view() {
			return H(r).workflow;
		},
		get choices() {
			return H(r).nativeChoices;
		},
		get choose() {
			return n().chooseNative;
		},
		get shelfSubgraph() {
			return n().shelfSubgraph;
		},
		get readOnly() {
			return H(r).readOnly;
		},
		add: (e, t) => n().addNode?.(e, t)
	}), (e) => ie = e, () => ie), N(We), N(Ie), N(we), Q(we, (e) => s = e, () => s);
	var Ge = B(we, 2), Ke = (e) => {
		var t = Fr();
		Wr(z(t), () => H(r).graphViews?.active.key ?? H(r).graphId, (e) => {
			Oa(e, {
				get width() {
					return H(T);
				},
				get max() {
					return H(w);
				},
				start: oe,
				preview: (e) => L(C, e, !0),
				change: E
			});
		}), K(e, t);
	};
	J(Ge, (e) => {
		H(r).inspectorOpen && e(Ke);
	});
	var qe = B(Ge, 2), Je = R(qe), Ye = B(R(Je));
	N(Je);
	var Xe = B(Je, 2), Ze = (e) => {
		let t = /* @__PURE__ */ P(() => H(r).commentDetails);
		ps(e, {
			get comment() {
				return H(t).comment;
			},
			onPatch: (e) => n().commentDetails?.patch(H(t).selection, e),
			onCommand: (e) => n().commentDetails?.command(H(t).selection, e)
		});
	};
	J(Xe, (e) => {
		H(r).commentDetails && e(Ze);
	});
	var Qe = B(Xe, 2), $e = R(Qe);
	{
		let e = /* @__PURE__ */ P(() => H(r).commentDetails ? null : H(r).nodeDetails ?? null);
		us($e, {
			get view() {
				return H(e);
			},
			get actions() {
				return n().nodeDetails;
			}
		});
	}
	N(Qe), N(qe), Q(qe, (e) => c = e, () => c), N(Ce), Q(Ce, (e) => a = e, () => a);
	var et = B(Ce, 2), tt = (e) => {
		var t = _u(), i = R(t);
		let a;
		var o = R(i), s = R(o), c = R(s, !0);
		N(s);
		var l = B(s);
		N(o);
		var u = B(o, 2), d = (e) => {
			ql(e, {
				get examples() {
					return H(r).examples;
				},
				get issue() {
					return H(r).examplesIssue;
				},
				get retry() {
					return n().refreshExamples;
				},
				get scrollTop() {
					return H(re);
				},
				scroll: (e) => L(re, e, !0),
				open: fe
			});
		}, f = (e) => {
			{
				let t = /* @__PURE__ */ P(() => H(r).fastConnections ?? {
					userId: "",
					connections: [],
					issue: "Fast connection settings are unavailable."
				});
				xc(e, {
					get view() {
						return H(t);
					},
					get actions() {
						return n().fastConnections;
					},
					close: de
				});
			}
		}, p = (e) => {
			{
				let t = /* @__PURE__ */ P(() => H(r).recallArms ?? {
					scope: null,
					nodes: [],
					issue: "Recall state is unavailable."
				});
				Yc(e, {
					get view() {
						return H(t);
					},
					get actions() {
						return n().recallArms;
					},
					close: de
				});
			}
		}, m = (e) => {
			{
				let t = /* @__PURE__ */ P(() => H(r).storyDocuments ?? {
					key: "",
					revision: "",
					scope: {
						userId: "",
						chatId: ""
					},
					documents: [],
					issue: "Workflow Data setup is unavailable."
				});
				Uc(e, {
					get view() {
						return H(t);
					},
					get actions() {
						return n().storyDocuments;
					},
					close: de
				});
			}
		}, h = (e) => {
			{
				let t = /* @__PURE__ */ P(() => H(r).runDetails ?? null);
				Hs(e, {
					get view() {
						return H(t);
					},
					get actions() {
						return n().runDetails;
					}
				});
			}
		}, g = (e) => {
			pu(e, {
				get panel() {
					return H(D);
				},
				get workflow() {
					return H(ee);
				},
				get version() {
					return mu.version;
				},
				get referenceUrl() {
					return H(k);
				},
				get guideUrl() {
					return H(A);
				}
			});
		};
		J(u, (e) => {
			H(D) === "examples" ? e(d) : H(D) === "fast-connections" ? e(f, 1) : H(D) === "recall-arms" ? e(p, 2) : H(D) === "story-documents" ? e(m, 3) : H(D) === "run-details" ? e(h, 4) : e(g, -1);
		}), N(i), Q(i, (e) => L(te, e), () => H(te)), N(t), V(() => {
			a = li(i, 1, "pc-workspace-dialog svelte-1dr9aew", null, a, { "pc-examples-dialog": H(D) === "examples" }), Z(i, "aria-label", H(O)), q(c, H(O));
		}), W("keydown", i, me), U("paste", i, (e) => e.stopPropagation()), W("click", l, de), K(e, t);
	};
	J(et, (e) => {
		H(D) && e(tt);
	});
	var nt = B(et, 2);
	pl(nt, {
		get view() {
			return H(r).nativeSearch;
		},
		get actions() {
			return n().nativeSearch;
		}
	});
	var rt = B(nt, 2);
	_l(rt, {
		get view() {
			return H(r).nativePinMenu;
		},
		get actions() {
			return n().nativePinMenu;
		}
	});
	var it = B(rt, 2), at = (e) => {
		var t = vu(), i = R(t);
		dc(R(i), {
			get view() {
				return H(r).portalManager;
			},
			get actions() {
				return n().portalManager;
			}
		}), N(i), N(t), W("keydown", i, pe), U("paste", i, (e) => e.stopPropagation()), K(e, t);
	};
	J(it, (e) => {
		H(r).portalManager && e(at);
	});
	var ot = B(it, 2), st = (e) => {
		nl(e, {
			get view() {
				return H(r).configureNode;
			},
			get actions() {
				return n().configureNode;
			}
		});
	};
	J(ot, (e) => {
		H(r).configureNode && e(st);
	});
	var ct = B(ot, 2), lt = (e) => {
		hc(e, {
			get view() {
				return H(r).subgraphSave;
			},
			get actions() {
				return n().subgraphSave;
			}
		});
	};
	J(ct, (e) => {
		H(r).subgraphSave && e(lt);
	});
	var ut = B(ct, 2), dt = (e) => {
		ru(e, {
			get view() {
				return H(r).importReview;
			},
			get actions() {
				return n();
			}
		});
	};
	J(ut, (e) => {
		H(r).importReview && e(dt);
	});
	var ft = B(ut, 2), pt = (e) => {
		il(e, {
			get view() {
				return H(r).newWorkflowPrompt;
			},
			get actions() {
				return n().newWorkflowPrompt;
			}
		});
	};
	return J(ft, (e) => {
		H(r).newWorkflowPrompt && e(pt);
	}), N(ge), Q(ge, (e) => i = e, () => i), V((e) => {
		_e = li(ge, 1, "pc-root pc-native-workspace svelte-1dr9aew", null, _e, { "pc-native-flat": H(r).nativeFlatCanvas }), ve = di(ge, "", ve, { "--pc-details-width": `${H(T)}px` }), Ee = li(Te, 1, "pc-preview-pane", null, Ee, { "pc-preview-collapsed": H(b) }), De = di(Te, "", De, e), Z(M, "aria-label", H(b) ? "Expand preview" : "Collapse preview"), Z(M, "title", H(b) ? "Expand preview" : "Collapse preview"), Z(M, "aria-expanded", !H(b)), q(ke, H(b) ? "▾" : "▴"), Z(Ae, "hidden", H(b)), Z(We, "hidden", !H(S)), Z(qe, "hidden", !H(r).inspectorOpen), Z(Qe, "hidden", !!H(r).commentDetails);
	}, [() => ({ "--pc-preview-height": `${Math.min(H(y), H(x))}px` })]), W("click", M, () => se(!H(b))), W("click", Ye, () => n().command("inspector")), K(e, ge), Ue(he);
}
wr(["click", "keydown"]);
//#endregion
//#region ui/entry.js
function xu(e, t) {
	let n = document.createElement("div");
	n.style.cssText = "position:absolute;left:0;top:0;visibility:hidden;pointer-events:none", n.setAttribute("aria-hidden", "true"), n.inert = !0, e.append(n);
	let r;
	try {
		r = Lr(Ri, {
			target: n,
			props: {
				card: t,
				actions: {
					hoverPin() {},
					hostResult() {}
				}
			}
		}), Lt();
		let { width: e, height: i } = n.querySelector(".pc-node").getBoundingClientRect();
		return {
			width: e,
			height: i
		};
	} finally {
		r && Vr(r), n.remove();
	}
}
function Su(e, t) {
	let n = Lr(aa, {
		target: e,
		props: { actions: t }
	});
	return Lt(), {
		...n.getLayers(),
		setComments: (e, t) => Lt(() => n.setComments(e, t)),
		setNodes: (e) => Lt(() => n.setNodes(e)),
		setNodeProfiles: (e) => Lt(() => n.setNodeProfiles(e)),
		setGroups: (e) => Lt(() => n.setGroups(e)),
		setWires: (e, t, r) => Lt(() => n.setWires(e, t, r)),
		setPositions: (e, t) => Lt(() => n.setPositions(e, t)),
		destroy: () => Vr(n)
	};
}
function Cu(e, t) {
	let n = Lr(bu, {
		target: e,
		props: { actions: t }
	});
	return Lt(), {
		...n.getParts(),
		update: (e) => Lt(() => n.update(e)),
		updateActions: (e) => Lt(() => n.updateActions(e)),
		revealPreview: () => Lt(() => n.revealPreview()),
		renameGraphView: (e) => n.renameGraphView(e),
		focusCommentTitle: (e, t) => n.focusCommentTitle(e, t),
		destroy: () => Vr(n)
	};
}
//#endregion
export { xu as measureNodeCard, Su as mountCanvas, Cu as mountWorkbench };
