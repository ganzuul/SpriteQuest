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
var h = 1024, g = 2048, _ = 4096, v = 8192, y = 16384, b = 32768, x = 1 << 25, S = 65536, C = 1 << 19, w = 1 << 20, T = 1 << 25, E = 65536, ee = 1 << 21, D = 1 << 22, O = 1 << 23, k = Symbol("$state"), A = Symbol("legacy props"), te = Symbol(""), ne = Symbol("attributes"), re = Symbol("class"), ie = Symbol("style"), ae = Symbol("text"), oe = Symbol("form reset"), se = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), ce = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml");
function le(e) {
	throw Error("https://svelte.dev/e/lifecycle_outside_component");
}
//#endregion
//#region node_modules/svelte/src/internal/client/errors.js
function ue() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function de(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function fe(e) {
	throw Error("https://svelte.dev/e/effect_in_teardown");
}
function pe() {
	throw Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function me(e) {
	throw Error("https://svelte.dev/e/effect_orphan");
}
function he() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function ge(e) {
	throw Error("https://svelte.dev/e/props_invalid_value");
}
function _e() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function ve() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function ye() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function be() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
//#endregion
//#region node_modules/svelte/src/constants.js
var xe = {}, Se = Symbol("uninitialized"), Ce = "http://www.w3.org/1999/xhtml";
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
var j = !1;
function Oe(e) {
	j = e;
}
var M;
function ke(e) {
	if (e === null) throw Te(), xe;
	return M = e;
}
function Ae() {
	return ke(/* @__PURE__ */ dn(M));
}
function N(e) {
	if (j) {
		if (/* @__PURE__ */ dn(M) !== null) throw Te(), xe;
		M = e;
	}
}
function je(e = 1) {
	if (j) {
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
	if (!e || e.nodeType !== 8) throw Te(), xe;
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
		r: H,
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
	var t = H;
	if (t === null) return Wn.f |= O, e;
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
	j && /* @__PURE__ */ un(e) !== null && fn(e);
}
var at = !1;
function ot() {
	at || (at = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[oe]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function st(e) {
	var t = Wn, n = H;
	Kn(null), qn(null);
	try {
		return e();
	} finally {
		Kn(t), qn(n);
	}
}
function ct(e, t, n, r = n) {
	e.addEventListener(t, () => st(n));
	let i = e[oe];
	e[oe] = i ? () => {
		i(), r(!0);
	} : () => r(!0), ot();
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function lt(e) {
	let t = 0, n = qt(0), r;
	return () => {
		yn() && (U(n), En(() => (t === 0 && (r = mr(() => e(() => Zt(n)))), t += 1, () => {
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
	#t = j ? M : null;
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
			var t = H;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = H.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = Dn(() => {
			if (j) {
				let e = this.#t;
				Ae();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, ut), j && (this.#e = M);
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
			t ? De() : (t = !0, n && be(), this.#s !== null && Fn(this.#s, () => {
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
		var t = H, n = Wn, r = Be;
		qn(this.#i), Kn(this.#i), Ve(this.#i.ctx);
		try {
			return It.ensure(), e();
		} catch (e) {
			return Ye(e), null;
		} finally {
			qn(t), Kn(n), Ve(r);
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
		return this.#h(), U(this.#m);
	}
	error(e) {
		if (!this.#n.onerror && !this.#n.failed) throw e;
		F?.is_fork ? (this.#a && F.skip_effect(this.#a), this.#o && F.skip_effect(this.#o), this.#s && F.skip_effect(this.#s), F.oncommit(() => {
			this.#w(e);
		})) : this.#w(e);
	}
	#w(e) {
		this.#a &&= (Mn(this.#a), null), this.#o &&= (Mn(this.#o), null), this.#s &&= (Mn(this.#s), null), j && (ke(this.#t), je(), ke(Me()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return On(() => {
						var r = H;
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
	var s = H, c = mt(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
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
	var e = H, t = Wn, n = Be, r = F;
	return function(i = !0) {
		qn(e), Kn(t), Ve(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function ht(e = !0) {
	qn(null), Kn(null), Ve(null), e && F?.deactivate();
}
function gt() {
	var e = H, t = e.b, n = F, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function _t(e) {
	var t = 2 | g;
	return H !== null && (H.f |= C), {
		ctx: Be,
		deps: null,
		effects: null,
		equals: Pe,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v: Se,
		wv: 0,
		parent: H,
		ac: null
	};
}
var vt = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function yt(e, t, n) {
	let r = H;
	r === null && ue();
	var i = void 0, a = qt(Se), o = !Wn, s = /* @__PURE__ */ new Set();
	return Tn(() => {
		var t = H, n = p();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== se && n.reject(e);
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
			l?.(), s.delete(n), t !== vt && (c.activate(), t ? (a.f |= O, Yt(a, t)) : (a.f & 8388608 && (a.f ^= O), Yt(a, e)), c.deactivate());
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
	return Yn(t), t;
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
	var t, n = H, r = e.parent;
	if (!Hn && r !== null && e.v !== Se && r.f & 24576) return we(), e.v;
	qn(r);
	try {
		e.f &= ~E, xt(e), t = sr(e);
	} finally {
		qn(n);
	}
	return t;
}
function Ct(e) {
	var t = St(e);
	!e.equals(t) && (e.wv = ir(), (!F?.is_fork || e.deps === null) && (F === null ? e.v = t : (F.capture(e, t, !0), Dt?.capture(e, t, !0)), e.deps === null)) ? Qe(e, h) : Hn || (Ot === null ? $e(e) : (yn() || F?.is_fork) && Ot.set(e, t));
}
function wt(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && st(() => {
		t.ac.abort(se), t.ac = null;
	}), t.fn !== null && (t.teardown = d), lr(t, 0), An(t));
}
function Tt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && ur(t);
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
		e.v !== Se && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), Ot?.set(e, t)), this.is_fork || (e.v = t);
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
				if (Mt !== null && t === H && (Wn === null || !(Wn.f & 2))) return;
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
		he();
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
			if (!(r.f & 24576) && ar(r) && (zt = /* @__PURE__ */ new Set(), ur(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Pn(r), zt?.size > 0)) {
				Gt.clear();
				for (let e of zt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) zt.has(n) && (zt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || ur(n);
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
	return Yn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function Jt(e, t = !1, n = !0) {
	let r = qt(e);
	return t || (r.equals = Ie), r;
}
function L(e, t, n = !1) {
	return Wn !== null && (!Gn || Wn.f & 131072) && We() && Wn.f & 4325394 && (Jn === null || !Jn.has(e)) && ye(), Yt(e, n ? $t(t) : t, Nt);
}
function Yt(e, t, n = null) {
	if (!e.equals(t)) {
		Hn ? Gt.set(e, t) : Gt.has(e) || Gt.set(e, e.v);
		var r = It.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && St(t), Ot === null && $e(t);
		}
		e.wv = ir(), Qt(e, g, n), We() && H !== null && H.f & 1024 && !(H.f & 96) && (Qn === null ? $n([e]) : Qn.push(e)), !r.is_fork && Wt.size > 0 && !Kt && Xt();
	}
	return t;
}
function Xt() {
	Kt = !1;
	for (let e of Wt) {
		e.f & 1024 && Qe(e, _);
		let t;
		try {
			t = ar(e);
		} catch {
			t = !0;
		}
		t && ur(e);
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
		if (i || s !== H) {
			var l = (c & g) === 0;
			if (l && Qe(s, t), c & 131072) Wt.add(s);
			else if (c & 2) {
				var u = s;
				Ot?.delete(u), c & 65536 || (c & 512 && (H === null || !(H.f & 2097152)) && (s.f |= E), Qt(u, _, n));
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
	var r = /* @__PURE__ */ new Map(), i = e(t), o = /* @__PURE__ */ I(0), u = null, d = nr, f = (e) => {
		if (nr === d) return e();
		var t = Wn, n = nr;
		Kn(null), rr(d);
		var r = e();
		return Kn(t), rr(n), r;
	};
	return i && r.set("length", /* @__PURE__ */ I(t.length, u)), new Proxy(t, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && _e();
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
					let e = f(() => /* @__PURE__ */ I(Se, u));
					r.set(t, e), Zt(o);
				}
			} else L(n, Se), Zt(o);
			return !0;
		},
		get(e, n, i) {
			if (n === k) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ I($t(s ? e[n] : Se), u)), r.set(n, o)), o !== void 0) {
				var c = U(o);
				return c === Se ? void 0 : c;
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
				if (a !== void 0 && o !== Se) return {
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
			var n = r.get(t), i = n !== void 0 && n.v !== Se || Reflect.has(e, t);
			return (n !== void 0 || H !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ I(i ? $t(e[t]) : Se, u)), r.set(t, n)), U(n) === Se) ? !1 : i;
		},
		set(e, t, n, s) {
			var c = r.get(t), l = t in e;
			if (i && t === "length") for (var d = n; d < c.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ I(Se, u)), r.set(d + "", p)) : L(p, Se);
			}
			if (c === void 0) (!l || a(e, t)?.writable) && (c = f(() => /* @__PURE__ */ I(void 0, u)), L(c, $t(n)), r.set(t, c));
			else {
				l = c.v !== Se;
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
			U(o);
			var t = Reflect.ownKeys(e).filter((e) => {
				var t = r.get(e);
				return t === void 0 || t.v !== Se;
			});
			for (var [n, i] of r) i.v !== Se && !(n in e) && t.push(n);
			return t;
		},
		setPrototypeOf() {
			ve();
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
		on = a(t, "firstChild").get, sn = a(t, "nextSibling").get, u(e) && (e[re] = void 0, e[ne] = null, e[ie] = void 0, e.__e = void 0), u(n) && (n[ae] = void 0);
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
	if (!j) return /* @__PURE__ */ un(e);
	var n = /* @__PURE__ */ un(M);
	if (n === null) n = M.appendChild(ln());
	else if (t && n.nodeType !== 3) {
		var r = ln();
		return n?.before(r), ke(r), r;
	}
	return t && hn(n), ke(n), n;
}
function z(e, t = !1) {
	if (!j) {
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
	let r = j ? M : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ dn(r);
	if (!j) return r;
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
	H === null && (Wn === null && me(e), pe()), Hn && fe(e);
}
function _n(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function vn(e, t) {
	var n = H;
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
			ur(r);
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
	var t = H.f;
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
	return vn(D | C, e);
}
function En(e, t = 0) {
	return vn(8 | t, e);
}
function V(e, t = [], n = [], r = []) {
	pt(r, t, n, (t) => {
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
			e.abort(se);
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
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (Nn(e.nodes.start, e.nodes.end), n = !0), e.f |= x, An(e, t && !n), lr(e, 0);
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
var H = null;
function qn(e) {
	H = e;
}
var Jn = null;
function Yn(e) {
	Wn !== null && (Jn ??= /* @__PURE__ */ new Set()).add(e);
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
			if (ar(a) && Ct(a), a.wv > e.wv) return !0;
		}
		t & 512 && Ot === null && Qe(e, h);
	}
	return !1;
}
function or(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Jn !== null && Jn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? or(a, t, !1) : t === a && (n ? Qe(a, g) : a.f & 1024 && Qe(a, _), Vt(a));
	}
}
function sr(e) {
	var t = Xn, n = Zn, r = Qn, i = Wn, a = Jn, o = Be, s = Gn, c = nr, l = e.f;
	Xn = null, Zn = 0, Qn = null, Wn = l & 96 ? null : e, Jn = null, Ve(e.ctx), Gn = !1, nr = ++tr, e.ac !== null && (st(() => {
		e.ac.abort(se);
	}), e.ac = null);
	try {
		e.f |= ee;
		var u = e.fn, d = u();
		e.f |= b;
		var f = e.deps, p = F?.is_fork;
		if (Xn !== null) {
			var m;
			if (p || lr(e, Zn), f !== null && Zn > 0) for (f.length = Zn + Xn.length, m = 0; m < Xn.length; m++) f[Zn + m] = Xn[m];
			else e.deps = f = Xn;
			if (yn() && e.f & 512) for (m = Zn; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && Zn < f.length && (lr(e, Zn), f.length = Zn);
		if (We() && Qn !== null && !Gn && f !== null && !(e.f & 6146)) for (m = 0; m < Qn.length; m++) or(Qn[m], e);
		if (i !== null && i !== e) {
			if (tr++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = tr;
			if (t !== null) for (let e of t) e.rv = tr;
			Qn !== null && (r === null ? r = Qn : r.push(...Qn));
		}
		return e.f & 8388608 && (e.f ^= O), d;
	} catch (e) {
		return Ye(e);
	} finally {
		e.f ^= ee, Xn = t, Zn = n, Qn = r, Wn = i, Jn = a, Ve(o), Gn = s, nr = c;
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
		s.f & 512 && (s.f ^= 512, s.f &= ~E), s.v !== Se && $e(s), s.ac !== null && st(() => {
			s.ac.abort(se), s.ac = null, Qe(s, g);
		}), wt(s), lr(s, 0);
	}
}
function lr(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) cr(e, n[r]);
}
function ur(e) {
	var t = e.f;
	if (!(t & 16384)) {
		Qe(e, h);
		var n = H, r = Vn;
		H = e, Vn = !(t & 96);
		try {
			t & 16777232 ? jn(e) : An(e), kn(e);
			var i = sr(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = er;
		} finally {
			Vn = r, H = n;
		}
	}
}
async function dr() {
	await Promise.resolve(), Lt();
}
function U(e) {
	var t = !!(e.f & 2);
	if (Bn?.add(e), Wn !== null && !Gn && !(H !== null && H.f & 16384) && (Jn === null || !Jn.has(e))) {
		var r = Wn.deps;
		if (Wn.f & 2097152) e.rv < tr && (e.rv = tr, Xn === null && r !== null && r[Zn] === e ? Zn++ : Xn === null ? Xn = [e] : Xn.push(e));
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
			return (!(a.f & 1024) && a.reactions !== null || pr(a)) && (o = St(a)), Gt.set(a, o), o;
		}
		var s = !(a.f & 512) && !Gn && Wn !== null && (Vn || !!(Wn.f & 512)), c = (a.f & b) === 0;
		ar(a) && (s && (a.f |= 512), Ct(a)), s && !c && (Tt(a), fr(a));
	}
	if (Ot?.has(e)) return Ot.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function fr(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (Tt(t), fr(t));
}
function pr(e) {
	if (e.v === Se) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Gt.has(t) || t.f & 2 && pr(t)) return !0;
	return !1;
}
function mr(e) {
	var t = Gn;
	try {
		return Gn = !0, e();
	} finally {
		Gn = t;
	}
}
function hr(e) {
	if (!(typeof e != "object" || !e || e instanceof EventTarget)) {
		if (k in e) gr(e);
		else if (!Array.isArray(e)) for (let t in e) {
			let n = e[t];
			typeof n == "object" && n && k in n && gr(n);
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
		if (r.capture || Er.call(t, e), !e.cancelBubble) return st(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? qe(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function W(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = Sr(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && bn(() => {
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
		var d = Wn, f = H;
		Kn(null), qn(null);
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
			e[yr] = t, delete e.currentTarget, Kn(d), qn(f);
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
	var t = mn("template");
	return t.innerHTML = Or(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function Ar(e, t) {
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
		if (j) return Ar(M, null), M;
		i === void 0 && (i = kr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ un(i)));
		var t = r || an ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ un(t), s = t.lastChild;
			Ar(o, s);
		} else Ar(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function jr(e, t, n = "svg") {
	var r = !e.startsWith("<!>"), i = !!(t & 1), a = `<${n}>${r ? e : "<!>" + e}</${n}>`, o;
	return () => {
		if (j) return Ar(M, null), M;
		if (!o) {
			var e = /* @__PURE__ */ un(kr(a));
			if (i) for (o = document.createDocumentFragment(); /* @__PURE__ */ un(e);) o.appendChild(/* @__PURE__ */ un(e));
			else o = /* @__PURE__ */ un(e);
		}
		var t = o.cloneNode(!0);
		if (i) {
			var n = /* @__PURE__ */ un(t), r = t.lastChild;
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
	if (!j) {
		var t = ln(e + "");
		return Ar(t, t), t;
	}
	var n = M;
	return n.nodeType === 3 ? hn(n) : (n.before(n = ln()), ke(n)), Ar(n, n), n;
}
function Pr() {
	if (j) return Ar(M, null), M;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = ln();
	return e.append(t, n), Ar(t, n), e;
}
function q(e, t) {
	if (j) {
		var n = H;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = M), Ae();
	} else e !== null && e.before(t);
}
function Fr() {
	if (j && M && M.nodeType === 8 && M.textContent?.startsWith("$")) {
		let e = M.textContent.substring(1);
		return Ae(), e;
	}
	return (window.__svelte ??= {}).uid ??= 1, `c${window.__svelte.uid++}`;
}
function J(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[ae] ??= e.nodeValue) && (e[ae] = n, e.nodeValue = `${n}`);
}
function Ir(e, t) {
	return Rr(e, t);
}
var Lr = /* @__PURE__ */ new Map();
function Rr(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	cn();
	var l = void 0, u = Cn(() => {
		var s = n ?? t.appendChild(ln());
		dt(s, { pending: () => {} }, (t) => {
			He({});
			var n = Be;
			if (o && (n.c = o), a && (i.$$events = a), j && Ar(t, null), l = e(t, i) || {}, j && (H.nodes.end = M, M === null || M.nodeType !== 8 || M.data !== "]")) throw Te(), xe;
			Ue();
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
		} else j && (this.anchor = M), this.#a(n);
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
function Y(e, t, n = !1) {
	var r;
	j && (r = M, Ae());
	var i = new Vr(e), a = n ? S : 0;
	function o(e, t) {
		if (j) {
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
var Hr = Symbol("NaN");
function Ur(e, t, n) {
	j && Ae();
	var r = new Vr(e), i = !We();
	Dn(() => {
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
		Fn(n, () => {
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
			fn(d), d.append(u), e.items.clear();
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
		r?.has(a) ? (a.f |= T, zn(a, document.createDocumentFragment())) : Mn(t[i], n);
	}
}
var qr;
function X(t, n, i, a, o, s = null) {
	var c = t, l = /* @__PURE__ */ new Map();
	if (n & 4) {
		var u = t;
		c = j ? ke(/* @__PURE__ */ un(u)) : u.appendChild(ln());
	}
	j && Ae();
	var d = null, f = /* @__PURE__ */ bt(() => {
		var t = i();
		return e(t) ? t : t == null ? [] : r(t);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, Yr(v, p, c, n, a), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= T, Zr(d, null, c)) : Ln(d) : Fn(d, () => {
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
			j && Ne(c) === "[!" != (e === 0) && (c = Me(), ke(c), Oe(!1), t = !0);
			for (var r = /* @__PURE__ */ new Set(), u = F, v = pn(), y = 0; y < e; y += 1) {
				j && M.nodeType === 8 && M.data === "]" && (c = M, t = !0, Oe(!1));
				var b = p[y], x = a(b, y), S = h ? null : l.get(x);
				S ? (S.v && Yt(S.v, b), S.i && Yt(S.i, y), v && u.unskip_effect(S.e)) : (S = Xr(l, h ? c : qr ??= ln(), b, x, y, o, n, i), h || (S.e.f |= T), l.set(x, S)), r.add(x);
			}
			if (e === 0 && s && !d && (h ? d = On(() => s(c)) : (d = On(() => s(qr ??= ln())), d.f |= T)), e > r.size && de("", "", ""), j && e > 0 && ke(Me()), !h) {
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
	h = !1, j && (c = M);
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
		if (_.f & 8192 && (Ln(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
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
			var ee = i & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < E; v += 1) w[v].nodes?.a?.measure();
				for (v = 0; v < E; v += 1) w[v].nodes?.a?.fix();
			}
			Gr(e, w, ee);
		}
	}
	o && qe(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Xr(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? qt(n) : /* @__PURE__ */ Jt(n, !1, !1) : null, l = o & 2 ? qt(i) : null;
	return {
		v: c,
		i: l,
		e: On(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function Zr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ dn(r);
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
	wn(() => {
		var r = mr(() => t(e, n?.()) || {});
		if (n && r?.update) {
			var i = !1, a = {};
			En(() => {
				var e = n();
				hr(e), i && Fe(a, e) && (a = e, r.update(e));
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
	var o = e[re];
	if (j || o !== n || o === void 0) {
		var s = ii(n, r, a);
		(!j || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[re] = n;
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
	var i = e[ie];
	if (j || i !== t) {
		var a = si(t, r);
		(!j || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[ie] = t;
	} else r && (Array.isArray(r) ? (li(e, n?.[0], r[0]), li(e, n?.[1], r[1], "important")) : li(e, n, r));
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function di(t, n, r = !1) {
	if (t.multiple) {
		if (n == null) return;
		if (!e(n)) return Ee();
		for (var i of t.options) i.selected = n.includes(mi(i));
	} else {
		for (i of t.options) if (tn(mi(i), n)) {
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
	}), bn(() => {
		t.disconnect();
	});
}
function pi(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet(), i = !0;
	ct(e, "change", (t) => {
		var i = t ? "[selected]" : ":checked", a;
		if (e.multiple) a = [].map.call(e.querySelectorAll(i), mi);
		else {
			var o = e.querySelector(i) ?? e.querySelector("option:not([disabled])");
			a = o && mi(o);
		}
		n(a), e.__value = a, F !== null && r.add(F);
	}), wn(() => {
		var a = t();
		if (e === document.activeElement) {
			var o = F;
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
var hi = Symbol("is custom element"), gi = Symbol("is html"), _i = ce ? "link" : "LINK", vi = ce ? "progress" : "PROGRESS";
function Z(e) {
	if (j) {
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
		e[oe] = n, qe(n), ot();
	}
}
function yi(e, t) {
	var n = xi(e);
	n.value !== (n.value = t ?? void 0) && (e.value !== t || t === 0 && e.nodeName === vi) && (e.value = t ?? "");
}
function bi(e, t) {
	var n = xi(e);
	n.checked !== (n.checked = t ?? void 0) && (e.checked = t);
}
function Q(e, t, n, r) {
	var i = xi(e);
	j && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === _i) || i[t] !== (i[t] = n) && (t === "loading" && (e[te] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Ci(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function xi(e) {
	return e[ne] ??= {
		[hi]: e.nodeName.includes("-"),
		[gi]: e.namespaceURI === Ce
	};
}
var Si = /* @__PURE__ */ new Map();
function Ci(e) {
	var t = e.getAttribute("is") || e.nodeName, n = Si.get(t);
	if (n) return n;
	Si.set(t, n = []);
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var s in r = o(i), r) r[s].set && s !== "innerHTML" && s !== "textContent" && s !== "innerText" && n.push(s);
		i = l(i);
	}
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function wi(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet();
	ct(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = Ti(e) ? Ei(a) : a, n(a), F !== null && r.add(F), await dr(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (j && e.defaultValue !== e.value || mr(t) == null && e.value) && (n(Ti(e) ? Ei(e.value) : e.value), F !== null && r.add(F)), En(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = F;
			if (r.has(i)) return;
		}
		Ti(e) && n === Ei(e.value) || (e.type !== "date" || n || e.value) && n !== e.value && (e.value = n ?? "");
	});
}
function Ti(e) {
	var t = e.type;
	return t === "number" || t === "range";
}
function Ei(e) {
	return e === "" ? null : +e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function Di(e, t) {
	return e === t || e?.[k] === t;
}
function $(e = {}, t, n, r) {
	var i = Be.r, a = H;
	return wn(() => {
		var o, s;
		return En(() => {
			o = s, s = r?.() || [], mr(() => {
				Di(n(...s), e) || (t(e, ...s), o && Di(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && Di(n(...s), e) && t(null, ...s);
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
	var i = !0, o = !!(n & 8), s = !!(n & 16), c = r, l = !0, u = void 0, d = () => s && i ? (u ??= /* @__PURE__ */ _t(r), U(u)) : (l && (l = !1, c = s ? mr(r) : r), c);
	let f;
	if (o) {
		var p = k in e || A in e;
		f = a(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	o ? [m, h] = rt(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && ge(t), f(m)));
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
	var b = H;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? U(y) : i && o ? $t(e) : e;
			return L(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return Hn && v || b.f & 16384 ? y.v : U(y);
	});
}
function ki(e) {
	Be === null && le("onMount"), xn(() => {
		let t = mr(e);
		if (typeof t == "function") return t;
	});
}
function Ai(e) {
	Be === null && le("onDestroy"), ki(() => () => mr(e));
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region ui/NodeCard.svelte
var ji = /* @__PURE__ */ K("<span class=\"pc-modifier-badge svelte-1jilz27\"> </span>"), Mi = /* @__PURE__ */ K("<div><span class=\"pc-native-pin-label\"> </span> <div role=\"img\"></div></div>"), Ni = /* @__PURE__ */ K("<div class=\"pc-node-body\"> </div>"), Pi = /* @__PURE__ */ K("<span class=\"pc-native-alias\"> </span>"), Fi = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-node-action pc-host-result\" aria-label=\"Preview host result\"><i class=\"fa-solid fa-eye\" aria-hidden=\"true\"></i> Host result</button>"), Ii = /* @__PURE__ */ K("<div role=\"group\" tabindex=\"0\"><div class=\"pc-native-heading\"><svg class=\"pc-native-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path></path></svg><span class=\"pc-node-title\"> </span><!></div> <div class=\"pc-native-pins\"></div> <!> <!> <!></div>");
function Li(e, t) {
	He(t, !0);
	let n = (e) => e.stopPropagation();
	var r = Ii();
	let i;
	var a = R(r), o = R(a), s = R(o);
	N(o);
	var c = B(o), l = R(c, !0);
	N(c);
	var u = B(c), d = (e) => {
		var n = ji(), r = R(n);
		N(n), V(() => {
			Q(n, "title", t.card.modifierSummary.text), Q(n, "aria-label", t.card.modifierSummary.text), J(r, `+${t.card.modifierSummary.count ?? ""}`);
		}), q(e, n);
	};
	Y(u, (e) => {
		t.card.modifierSummary && e(d);
	}), N(a);
	var f = B(a, 2);
	X(f, 21, () => t.card.ports, (e) => e.id, (e, n) => {
		var r = Mi();
		let i;
		var a = R(r), o = R(a, !0);
		N(a);
		var s = B(a, 2);
		N(r), V(() => {
			ci(r, 1, `pc-native-row pc-native-row-${U(n).dir}`, "svelte-1jilz27"), i = ui(r, "", i, { "grid-row": U(n).row }), J(o, U(n).label), ci(s, 1, ni(U(n).className), "svelte-1jilz27"), Q(s, "data-node", t.card.id), Q(s, "data-dir", U(n).dir), Q(s, "data-port", U(n).port), Q(s, "data-side", U(n).side), Q(s, "data-kind", U(n).kind), Q(s, "title", U(n).title), Q(s, "aria-label", U(n).title);
		}), W("mouseenter", s, () => t.actions.hoverPin({
			nodeId: t.card.id,
			dir: U(n).dir,
			port: U(n).port
		})), W("mouseleave", s, () => t.actions.hoverPin(null)), q(e, r);
	}), N(f);
	var p = B(f, 2), m = (e) => {
		var n = Ni(), r = R(n, !0);
		N(n), V(() => J(r, t.card.body)), q(e, n);
	};
	Y(p, (e) => {
		t.card.type === "note" && e(m);
	});
	var h = B(p, 2), g = (e) => {
		var n = Pi(), r = R(n, !0);
		N(n), V(() => {
			Q(n, "title", t.card.titleHint), J(r, t.card.title);
		}), q(e, n);
	};
	Y(h, (e) => {
		t.card.compact && e(g);
	});
	var _ = B(h, 2), v = (e) => {
		var r = Fi();
		G("mousedown", r, n), G("click", r, (e) => {
			n(e), t.actions.hostResult(t.card.id);
		}), q(e, r);
	};
	Y(_, (e) => {
		t.card.hostResult && e(v);
	}), N(r), V(() => {
		ci(r, 1, ni(t.card.className), "svelte-1jilz27"), Q(r, "data-id", t.card.id), Q(r, "title", t.card.offHint), Q(r, "aria-label", `${t.card.label}: ${t.card.title}`), i = ui(r, "", i, {
			left: `${t.card.x}px`,
			top: `${t.card.y}px`
		}), Q(s, "d", t.card.iconPath), Q(c, "title", t.card.titleHint), J(l, t.card.title);
	}), q(e, r), Ue();
}
Cr(["mousedown", "click"]);
//#endregion
//#region ui/GroupCard.svelte
var Ri = /* @__PURE__ */ K("<div class=\"pc-node-body\"> </div>"), zi = /* @__PURE__ */ K("<div role=\"group\"><div><i class=\"fa-solid fa-object-group\" aria-hidden=\"true\"></i> <span> </span> <span class=\"pc-group-frame-count\"> </span> <button type=\"button\"></button></div> <!></div>");
function Bi(e, t) {
	He(t, !0);
	function n(e, n) {
		e.stopPropagation(), e.preventDefault(), t.actions.group(t.group.id, n);
	}
	function r(e, n) {
		e.stopPropagation(), e.detail === 0 && t.actions.group(t.group.id, n);
	}
	var i = zi();
	let a;
	var o = R(i), s = B(R(o), 2), c = R(s, !0);
	N(s);
	var l = B(s, 2), u = R(l, !0);
	N(l);
	var d = B(l, 2);
	N(o);
	var f = B(o, 2), p = (e) => {
		var n = Ri(), r = R(n, !0);
		N(n), V(() => J(r, t.group.body)), q(e, n);
	};
	Y(f, (e) => {
		t.group.collapsed && e(p);
	}), N(i), V(() => {
		ci(i, 1, ni(t.group.className)), Q(i, "data-group", t.group.id), Q(i, "aria-label", `Group: ${t.group.title}`), a = ui(i, "", a, {
			left: `${t.group.x}px`,
			top: `${t.group.y}px`,
			width: `${t.group.w}px`,
			height: t.group.collapsed ? void 0 : `${t.group.h}px`
		}), ci(o, 1, ni(t.group.collapsed ? "pc-node-head" : "pc-group-frame-head")), ci(s, 1, ni(t.group.collapsed ? "pc-node-title" : "pc-group-frame-title")), J(c, t.group.title), J(u, t.group.count), ci(d, 1, `pc-node-action fa-solid pc-group-btn ${t.group.collapsed ? "fa-up-right-and-down-left-from-center" : "fa-down-left-and-up-right-to-center"}`), Q(d, "data-action", t.group.collapsed ? "open" : "collapse"), Q(d, "title", t.group.collapsed ? "Open group" : "Fold group"), Q(d, "aria-label", t.group.collapsed ? "Open group" : "Fold group");
	}), G("mousedown", d, (e) => n(e, t.group.collapsed ? "open" : "collapse")), G("click", d, (e) => r(e, t.group.collapsed ? "open" : "collapse")), q(e, i), Ue();
}
Cr(["mousedown", "click"]);
//#endregion
//#region ui/WireLayer.svelte
var Vi = /* @__PURE__ */ Mr("<path class=\"pc-wire-hit\"></path><path><title> </title></path><text text-anchor=\"middle\"> </text>", 1), Hi = /* @__PURE__ */ Mr("<path></path>"), Ui = /* @__PURE__ */ Mr("<!><!>", 1);
function Wi(e, t) {
	He(t, !0);
	var n = Ui(), r = z(n);
	X(r, 17, () => t.wires, (e) => e.id, (e, t) => {
		var n = Vi(), r = z(n), i = B(r), a = R(i), o = R(a);
		N(a), N(i);
		var s = B(i), c = R(s, !0);
		N(s), V(() => {
			Q(r, "d", U(t).d), Q(r, "data-id", U(t).id), Q(i, "d", U(t).d), ci(i, 0, ni(U(t).className)), Q(i, "data-id", U(t).id), Q(i, "data-kind", U(t).kind), J(o, `${U(t).kind ?? ""} artifact`), Q(s, "x", U(t).label.x), Q(s, "y", U(t).label.y), ci(s, 0, ni(U(t).label.className)), J(c, U(t).label.text);
		}), q(e, n);
	});
	var i = B(r), a = (e) => {
		var n = Hi();
		V(() => {
			Q(n, "d", t.ghost.d), ci(n, 0, ni(t.ghost.className));
		}), q(e, n);
	};
	Y(i, (e) => {
		t.ghost && e(a);
	}), q(e, n), Ue();
}
//#endregion
//#region ui/CommentFrame.svelte
var Gi = /* @__PURE__ */ K("<span class=\"pc-comment-title svelte-118xm2r\"> </span>"), Ki = /* @__PURE__ */ K("<input class=\"pc-comment-title-input svelte-118xm2r\" aria-label=\"Comment title\"/>"), qi = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-comment-resize svelte-118xm2r\" title=\"Drag to resize comment\"></button>"), Ji = /* @__PURE__ */ K("<div role=\"group\"><header class=\"pc-comment-header svelte-118xm2r\"><button type=\"button\" class=\"pc-comment-select svelte-118xm2r\" title=\"Drag header to move comment\">⋮⋮</button> <!></header> <div class=\"pc-comment-notes svelte-118xm2r\"> </div> <!></div>");
function Yi(e, t) {
	He(t, !0);
	let n = (e) => e.stopPropagation();
	var r = Ji();
	let i, a;
	var o = R(r), s = R(o), c = B(s, 2), l = (e) => {
		var n = Gi(), r = R(n, !0);
		N(n), V(() => J(r, t.comment.title)), q(e, n);
	}, u = (e) => {
		var r = Ki();
		Z(r), V(() => yi(r, t.comment.title)), W("focus", r, () => t.actions.select(t.comment.id)), W("pointerdown", r, n, !0), W("mousedown", r, n, !0), W("click", r, n, !0), W("keydown", r, n, !0), G("change", r, (e) => {
			t.comment.readOnly || t.actions.update(t.comment.id, { title: e.currentTarget.value });
		}), q(e, r);
	};
	Y(c, (e) => {
		t.comment.readOnly ? e(l) : e(u, -1);
	}), N(o);
	var d = B(o, 2), f = R(d, !0);
	N(d);
	var p = B(d, 2), m = (e) => {
		var n = qi();
		V(() => Q(n, "aria-label", `Resize comment: ${t.comment.title}`)), G("click", n, (e) => {
			e.detail === 0 && t.actions.select(t.comment.id);
		}), q(e, n);
	};
	Y(p, (e) => {
		t.comment.readOnly || e(m);
	}), N(r), V(() => {
		i = ci(r, 1, "pc-comment-frame svelte-118xm2r", null, i, {
			"pc-comment-selected": t.comment.selected,
			"pc-comment-readonly": t.comment.readOnly
		}), Q(r, "data-id", t.comment.id), Q(r, "aria-label", `Comment: ${t.comment.title}`), a = ui(r, "", a, {
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
Cr(["click", "change"]);
//#endregion
//#region ui/NodeProfilePicker.svelte
var Xi = /* @__PURE__ */ K("<div class=\"node-model-meta svelte-jdmiua\"> </div>"), Zi = /* @__PURE__ */ Mr("<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-jdmiua\"><path d=\"m5 12 4 4L19 6\" class=\"svelte-jdmiua\"></path></svg>"), Qi = /* @__PURE__ */ K("<button type=\"button\" role=\"option\"><span class=\"profile-option-copy svelte-jdmiua\"><span class=\"profile-name svelte-jdmiua\"> </span><span class=\"profile-meta svelte-jdmiua\"> </span></span><span class=\"profile-check svelte-jdmiua\"><!></span></button>"), $i = /* @__PURE__ */ K("<div class=\"profile-error svelte-jdmiua\" role=\"alert\"> </div>"), ea = /* @__PURE__ */ K("<div class=\"profile-menu svelte-jdmiua\"><div class=\"profile-search svelte-jdmiua\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-jdmiua\"><circle cx=\"10\" cy=\"10\" r=\"6\" class=\"svelte-jdmiua\"></circle><path d=\"m15 15 5 5\" class=\"svelte-jdmiua\"></path></svg><input role=\"combobox\" aria-label=\"Search connection profiles\" aria-autocomplete=\"list\" aria-expanded=\"true\" placeholder=\"Search connection profiles…\" autocomplete=\"off\" spellcheck=\"false\" maxlength=\"200\" class=\"svelte-jdmiua\"/></div> <div class=\"profile-options svelte-jdmiua\" role=\"listbox\" aria-label=\"Connection profiles\"></div> <!></div>"), ta = /* @__PURE__ */ K("<div class=\"pc-node-profile svelte-jdmiua\" role=\"group\" aria-label=\"Node connection profile\"><!> <div class=\"profile-picker svelte-jdmiua\"><button type=\"button\" class=\"profile-bar svelte-jdmiua\" aria-haspopup=\"listbox\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-jdmiua\"><path d=\"M12 22v-5M15 8V2M17 8a1 1 0 0 1 1 1v4a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1zM9 8V2\" class=\"svelte-jdmiua\"></path></svg><span class=\"profile-value svelte-jdmiua\"> </span><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-jdmiua\"><path d=\"m6 9 6 6 6-6\" class=\"svelte-jdmiua\"></path></svg></button> <!></div></div>");
function na(e, t) {
	He(t, !0);
	let n = /* @__PURE__ */ I(!1), r = /* @__PURE__ */ I(""), i = /* @__PURE__ */ I(0), a = /* @__PURE__ */ I(""), o = /* @__PURE__ */ I(!1), s = -1, c = 0, l = !1, u = /* @__PURE__ */ I(35), d, f, p = /* @__PURE__ */ I(void 0), m = /* @__PURE__ */ I(void 0), h = (e) => e.stopPropagation();
	function g(e) {
		let t = (e) => {
			re(e);
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
	let _ = /* @__PURE__ */ P(() => U(r).toLocaleLowerCase().trim().split(/\s+/).filter(Boolean)), v = /* @__PURE__ */ P(() => [...t.row.options.filter((e) => e.active), ...t.row.options.filter((e) => !e.active && U(_).every((t) => `${e.label} ${e.apiLabel} ${e.model}`.toLocaleLowerCase().includes(t)))]), y = /* @__PURE__ */ P(() => Math.max(1, Math.min(330, t.row.visibleBounds.w - 16))), b = /* @__PURE__ */ P(() => Math.max(t.row.visibleBounds.x + 8, Math.min(t.row.x, t.row.visibleBounds.x + t.row.visibleBounds.w - U(y) - 8)) - t.row.x), x = /* @__PURE__ */ P(() => t.row.h + t.row.clearance + 7), S = /* @__PURE__ */ P(() => t.row.visibleBounds.y + t.row.visibleBounds.h - (t.row.y + U(x) + U(u) + 6) - 8), C = /* @__PURE__ */ P(() => t.row.y + U(x) - t.row.visibleBounds.y - 14), w = /* @__PURE__ */ P(() => U(S) < 130 && U(C) > U(S)), T = /* @__PURE__ */ P(() => Math.max(U(C), U(S)) < 78), E = /* @__PURE__ */ P(() => Math.max(0, U(T) ? t.row.visibleBounds.h - 16 : U(w) ? U(C) : U(S))), ee = /* @__PURE__ */ P(() => Math.max(0, Math.min(244, U(E) - 54))), D = /* @__PURE__ */ P(() => t.row.visibleBounds.y + 8 - t.row.y - U(x)), O = (e) => `${t.row.id}-profile-option-${e}`;
	function k(e = !1, t = !1) {
		t || (c++, l = !1), L(n, !1), L(r, ""), L(a, ""), L(o, !1), e && f?.focus({ preventScroll: !0 });
	}
	async function A() {
		if (!t.row.editable) return;
		let e = t.row.selection.selectionKey;
		if (await t.refreshProfiles?.(t.row.selection), !t.row.editable || !d?.isConnected || t.row.selection.selectionKey !== e) return;
		let c = f.getBoundingClientRect(), l = c.width > 0 && t.row.w > 0 ? c.width / t.row.w : 1;
		L(u, c.height > 0 ? c.height / l : 35, !0), window.dispatchEvent(new CustomEvent("pc-node-profile-open", { detail: d })), s = t.row.authorityVersion, L(r, ""), L(a, ""), L(o, !1), L(i, Math.max(0, U(v).findIndex((e) => e.value === t.row.value)), !0), L(n, !0), await dr(), U(n) && (U(p)?.focus({ preventScroll: !0 }), U(m) && (U(m).scrollTop = 0));
	}
	function te() {
		let e = U(v).find((e) => e.active);
		L(i, !U(_).length || e && U(_).every((t) => e.label.toLocaleLowerCase().includes(t)) ? 0 : U(v).length > 1 ? 1 : -1, !0), U(m) && (U(m).scrollTop = 0);
	}
	async function ne(e) {
		if (!U(n) || !t.row.editable || U(o) || t.row.authorityVersion !== s || !t.editProfile) return;
		let r = s, i = t.row.selection, u = c;
		L(o, !0), L(a, ""), l = !0;
		try {
			let o = await t.editProfile(i, e.value);
			if (o.ok) {
				c === u && d?.isConnected && t.row.selection.selectionKey === i.selectionKey && JSON.stringify(t.row.selection.address) === JSON.stringify(i.address) && (!U(n) || s === r) && k(!0);
				return;
			}
			if (!U(n) || t.row.authorityVersion !== r) return;
			L(a, o.error.message, !0);
		} catch (e) {
			U(n) && t.row.authorityVersion === r && L(a, e instanceof Error ? e.message : "Could not change connection profile", !0);
		} finally {
			t.row.authorityVersion === r && L(o, !1), c === u && (l = !1);
		}
	}
	async function re(e) {
		h(e), U(n) ? e.key === "Escape" ? (e.preventDefault(), k(!0)) : e.key === "ArrowDown" || e.key === "ArrowUp" ? (e.preventDefault(), L(i, Math.max(0, Math.min(U(v).length - 1, U(i) + (e.key === "ArrowDown" ? 1 : -1))), !0), await dr(), U(m)?.querySelector(".is-active")?.scrollIntoView?.({ block: "nearest" }), U(p)?.focus({ preventScroll: !0 })) : e.key === "Enter" && e.target === U(p) && (e.preventDefault(), U(v)[U(i)] && await ne(U(v)[U(i)])) : [
			"ArrowDown",
			"ArrowUp",
			"Enter",
			" "
		].includes(e.key) && (e.preventDefault(), await A());
	}
	function ie(e) {
		e.preventDefault(), h(e), U(m) && (U(m).scrollTop += e.deltaY * (e.deltaMode === 1 ? 18 : e.deltaMode === 2 ? U(m).clientHeight : 1));
	}
	xn(() => {
		U(n) && (t.row.authorityVersion !== s || !t.row.editable) && k(!1, !0);
	});
	var ae = ta();
	W("pointerdown", rn, (e) => {
		(U(n) || l) && !d.contains(e.target) && k();
	});
	let oe;
	var se = R(ae), ce = (e) => {
		var n = Xi(), r = R(n, !0);
		N(n), V(() => {
			Q(n, "title", t.row.model), J(r, t.row.model);
		}), q(e, n);
	};
	Y(se, (e) => {
		t.row.model && e(ce);
	});
	var le = B(se, 2);
	let ue;
	var de = R(le), fe = B(R(de)), pe = R(fe, !0);
	N(fe), je(), N(de), $(de, (e) => f = e, () => f);
	var me = B(de, 2), he = (e) => {
		var n = ea();
		let s;
		var c = R(n), l = B(R(c));
		Z(l), $(l, (e) => L(p, e), () => U(p)), N(c);
		var d = B(c, 2);
		let f;
		X(d, 23, () => U(v), (e) => e.value, (e, n, r) => {
			var a = Qi();
			let s;
			var c = R(a), l = R(c), u = R(l, !0);
			N(l);
			var d = B(l), f = R(d, !0);
			N(d), N(c);
			var p = B(c), m = R(p), h = (e) => {
				q(e, Zi());
			};
			Y(m, (e) => {
				U(n).value === t.row.value && e(h);
			}), N(p), N(a), V((e, c) => {
				Q(a, "id", e), s = ci(a, 1, "profile-option svelte-jdmiua", null, s, { "is-active": U(r) === U(i) }), Q(a, "aria-selected", U(n).value === t.row.value), a.disabled = U(o), Q(l, "title", U(n).label), J(u, U(n).label), J(f, c);
			}, [() => O(U(r)), () => U(n).active ? "Follows SillyTavern’s current model" : [U(n).apiLabel, U(n).model].filter(Boolean).join(" · ")]), G("click", a, () => ne(U(n))), q(e, a);
		}), N(d), $(d, (e) => L(m, e), () => U(m));
		var h = B(d, 2), g = (e) => {
			var t = $i(), n = R(t, !0);
			N(t), V(() => J(n, U(a))), q(e, t);
		};
		Y(h, (e) => {
			U(a) && e(g);
		}), N(n), V((e) => {
			s = ui(n, "", s, {
				width: `${U(y)}px`,
				"max-height": `${U(E)}px`,
				left: `${U(b)}px`,
				top: U(T) ? `${U(D)}px` : U(w) ? "auto" : `${U(u) + 6}px`,
				bottom: !U(T) && U(w) ? `${U(u) + 6}px` : "auto"
			}), Q(l, "aria-controls", `${t.row.id}-profile-list`), Q(l, "aria-activedescendant", e), Q(d, "id", `${t.row.id}-profile-list`), f = ui(d, "", f, { "max-height": `${U(ee)}px` });
		}, [() => U(i) >= 0 && U(v).length ? O(U(i)) : void 0]), G("input", l, te), wi(l, () => U(r), (e) => L(r, e)), W("wheel", d, ie), q(e, n);
	};
	Y(me, (e) => {
		U(n) && e(he);
	}), N(le), N(ae), $(ae, (e) => d = e, () => d), $r(ae, (e) => g?.(e)), V(() => {
		Q(ae, "data-id", t.row.id), oe = ui(ae, "", oe, {
			left: `${t.row.x}px`,
			top: `${t.row.y}px`,
			width: `${t.row.w}px`,
			"z-index": U(n) ? 20 : 2
		}), ue = ui(le, "", ue, { top: `${U(x)}px` }), Q(de, "title", t.row.label), Q(de, "aria-label", `Connection profile: ${t.row.label}`), Q(de, "aria-expanded", U(n)), de.disabled = !t.row.editable, J(pe, t.row.label);
	}), W("wheel", ae, h), G("click", de, () => U(n) ? k() : A()), q(e, ae), Ue();
}
Cr(["click", "input"]);
//#endregion
//#region ui/CanvasLayer.svelte
var ra = /* @__PURE__ */ K("<div class=\"pc-viewport\" data-pc-renderer=\"svelte\"><div class=\"pc-comment-layer svelte-o7b704\"></div> <svg class=\"pc-wires\" aria-label=\"Canvas connections\"><!></svg> <div class=\"pc-nodes\"><!> <!> <!></div> <div class=\"pc-node-profile-layer svelte-o7b704\"></div></div>");
function ia(e, t) {
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
		L(n, U(n).map((e) => i.has(e.id) ? {
			...e,
			...i.get(e.id)
		} : e)), L(a, U(a).map((e) => i.has(e.id) ? {
			...e,
			...i.get(e.id)
		} : e)), L(r, U(r).map((e) => o.has(e.id) ? {
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
	}, S = ra(), C = R(S);
	X(C, 21, () => U(a), (e) => e.id, (e, t) => {
		Yi(e, {
			get comment() {
				return U(t);
			},
			get actions() {
				return U(s);
			}
		});
	}), N(C), $(C, (e) => p = e, () => p);
	var w = B(C, 2);
	Wi(R(w), {
		get wires() {
			return U(i);
		},
		get ghost() {
			return U(c);
		}
	}), N(w), $(w, (e) => d = e, () => d);
	var T = B(w, 2), E = R(T);
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
	var ee = B(E, 2);
	X(ee, 17, () => U(n), (e) => e.id, (e, n) => {
		Li(e, {
			get card() {
				return U(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), X(B(ee, 2), 17, () => U(r).filter((e) => e.collapsed), (e) => e.id, (e, n) => {
		Bi(e, {
			get group() {
				return U(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), N(T), $(T, (e) => f = e, () => f);
	var D = B(T, 2);
	return X(D, 21, () => U(o), (e) => e.id, (e, n) => {
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
	}), N(D), N(S), $(S, (e) => u = e, () => u), V(() => {
		Q(w, "width", U(l).w), Q(w, "height", U(l).h), Q(w, "viewBox", `0 0 ${U(l).w} ${U(l).h}`);
	}), q(e, S), Ue(x);
}
//#endregion
//#region ui/WorkspaceMenus.svelte
var aa = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-flat-menu\" aria-haspopup=\"menu\"> </button>"), oa = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\"><span> </span><small> </small></button>"), sa = /* @__PURE__ */ K("<div class=\"pc-workspace-menu-panel\" role=\"menu\" tabindex=\"-1\"></div>"), ca = /* @__PURE__ */ K("<nav class=\"pc-workspace-menus\" aria-label=\"Workspace menus\"><!> <!></nav>");
function la(e, t) {
	He(t, !0);
	let n = /* @__PURE__ */ P(() => t.state.rootWorkflow ?? t.state.workflow), r = /* @__PURE__ */ I(""), i, a = /* @__PURE__ */ I(null), o = null, s = /* @__PURE__ */ I(0), c = /* @__PURE__ */ I(0), l = [
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
				...t.state.hasArchivedWorkflows ? [u("Export archived workflows…", "export-archived-workflows")] : [],
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
				u("Manage portals…", "manage-portals"),
				u("Duplicate workflow", "duplicate"),
				u("Rename workflow", "rename"),
				u("Delete workflow", "delete")
			];
			case "Node": return [u("Add node…", "add-node"), u("Inspect selection", "reveal-inspector")];
			case "Preview": return [u("Show preview", "show-preview"), u("Collapse preview", "collapse-preview")];
			case "Workflows": return [...U(n)?.phase === "unified" ? [u(U(n).assigned ? "Unified workflow assigned" : "Assign unified workflow", "assign-workflow", "", U(n).assigned || U(n).busy)] : [], u("Stop workflow", "stop-workflow", "", !U(n)?.busy)];
			case "Tools": return [
				u("Recall arms…", "recall-arms"),
				u("Workflow Data…", "story-documents"),
				u("Theme and colours", "theme"),
				u("Toggle inspector", "inspector")
			];
			default: return [u("Workspace guide", "help")];
		}
	}
	function f(e = !1) {
		L(r, ""), e && o?.focus({ preventScroll: !0 });
	}
	async function p(e, t, n = !1) {
		if (U(r) === e && !n) {
			f();
			return;
		}
		L(r, e, !0), o = t, await dr();
		let i = t.getBoundingClientRect(), l = U(a).getBoundingClientRect();
		L(s, Math.max(4, Math.min(i.left, window.innerWidth - l.width - 4)), !0), L(c, i.bottom + 2), n && U(a).querySelector("button:not(:disabled)")?.focus();
	}
	function m(e) {
		f(!0), [
			"examples",
			"show-preview",
			"collapse-preview",
			"add-node",
			"help",
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
	W("pointerdown", nn, (e) => {
		U(r) && !i.contains(e.target) && !U(a)?.contains(e.target) && f();
	}), W("resize", nn, () => f());
	var _ = R(g);
	X(_, 17, () => l, Wr, (e, t) => {
		var n = aa(), i = R(n, !0);
		N(n), V(() => {
			Q(n, "data-menu", U(t)), Q(n, "aria-expanded", U(r) === U(t)), J(i, U(t));
		}), G("click", n, (e) => p(U(t), e.currentTarget)), G("keydown", n, h), q(e, n);
	});
	var v = B(_, 2), y = (e) => {
		var t = sa();
		let n;
		X(t, 21, () => d(U(r)), Wr, (e, t) => {
			var n = oa(), r = R(n), i = R(r, !0);
			N(r);
			var a = B(r), o = R(a, !0);
			N(a), N(n), V(() => {
				n.disabled = U(t).disabled, J(i, U(t).label), J(o, U(t).shortcut);
			}), G("click", n, () => m(U(t).command)), q(e, n);
		}), N(t), $(t, (e) => L(a, e), () => U(a)), V(() => {
			Q(t, "aria-label", U(r)), n = ui(t, "", n, {
				left: `${U(s)}px`,
				top: `${U(c)}px`
			});
		}), G("keydown", t, h), q(e, t);
	};
	Y(v, (e) => {
		U(r) && e(y);
	}), N(g), $(g, (e) => i = e, () => i), q(e, g), Ue();
}
Cr(["click", "keydown"]);
//#endregion
//#region ui/Toolbar.svelte
var ua = /* @__PURE__ */ K("<option> </option>"), da = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-btn menu_button pc-root-stop\" title=\"Stop the workflow\">■ Stop</button>"), fa = /* @__PURE__ */ K("<header class=\"pc-header\" data-pc-ui=\"svelte\"><div class=\"pc-menubar\"><div class=\"pc-brand\"><img width=\"30\" height=\"30\" alt=\"\"/><span>LATTICE</span></div> <!> <button type=\"button\" class=\"pc-btn menu_button pc-close\" title=\"Close\" aria-label=\"Close canvas\">×</button></div> <div class=\"pc-workflow-bar\"><select class=\"pc-select pc-graph-select text_pole\" aria-label=\"Workflow\"></select> <div class=\"pc-header-actions pc-history\"><button type=\"button\" aria-label=\"Undo\">↶</button> <button type=\"button\" aria-label=\"Redo\">↷</button> <span> </span></div> <!> <span class=\"pc-root-workflow-status\" role=\"status\"> </span> <div class=\"pc-header-actions pc-surface-actions\"><button type=\"button\" title=\"Show or hide the inspector\" aria-label=\"Toggle inspector\">Details</button></div> <label class=\"pc-arm\"><input class=\"pc-arm-input\" type=\"checkbox\"/><span>Arm</span></label></div></header>");
function pa(e, t) {
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
	}, u = fa(), d = R(u), f = R(d), p = R(f);
	je(), N(f);
	var m = B(f, 2);
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
	var h = B(m, 2);
	N(d);
	var g = B(d, 2), _ = R(g);
	X(_, 21, () => t.state.graphs, (e) => e.id, (e, t) => {
		var n = ua(), r = R(n, !0);
		N(n);
		var i = {};
		V(() => {
			J(r, U(t).name), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
		}), q(e, n);
	}), N(_), $(_, (e) => i = e, () => i);
	var v;
	fi(_);
	var y = B(_, 2), b = R(y), x = B(b, 2), S = B(x, 2), C = R(S, !0);
	N(S), N(y);
	var w = B(y, 2), T = (e) => {
		var n = da();
		G("click", n, () => t.actions.command("stop-workflow")), q(e, n);
	};
	Y(w, (e) => {
		U(n)?.busy && e(T);
	});
	var E = B(w, 2), ee = R(E);
	N(E);
	var D = B(E, 2), O = R(D);
	$(O, (e) => o = e, () => o), N(D);
	var k = B(D, 2), A = R(k);
	return Z(A), $(A, (e) => a = e, () => a), je(), N(k), N(g), N(u), $(u, (e) => r = e, () => r), V(() => {
		Q(p, "src", t.actions.logoUrl), v !== (v = t.state.graphId) && (_.value = (_.__value = t.state.graphId) ?? "", di(_, t.state.graphId)), ci(b, 1, `pc-btn menu_button pc-undo${t.state.history.undo ? "" : " pc-disabled"}`), b.disabled = !t.state.history.undo, Q(b, "title", t.state.history.undoTitle), ci(x, 1, `pc-btn menu_button pc-redo${t.state.history.redo ? "" : " pc-disabled"}`), x.disabled = !t.state.history.redo, Q(x, "title", t.state.history.redoTitle), ci(S, 1, `pc-history-note${t.state.history.showNote ? " pc-show" : ""}`), J(C, t.state.history.note), J(ee, `${U(n) ? `${U(n).phase} · ${U(n).assigned ? "Assigned" : "Unassigned"} · ≤ ${U(n).callBound} requests` : "Workflow unavailable"} · Autosave in SillyTavern`), ci(O, 1, `pc-btn menu_button pc-pane-toggle${t.state.inspectorOpen ? " pc-on" : ""}`), Q(O, "aria-pressed", t.state.inspectorOpen), bi(A, t.state.armed);
	}), G("click", h, () => t.actions.command("close")), G("change", _, (e) => t.actions.pickGraph(e.currentTarget.value)), G("click", b, () => t.actions.command("undo")), G("click", x, () => t.actions.command("redo")), G("click", O, () => t.actions.command("inspector")), G("change", A, (e) => t.actions.arm(e.currentTarget.checked)), q(e, u), Ue(l);
}
Cr(["click", "change"]);
//#endregion
//#region ui/PaneDivider.svelte
var ma = /* @__PURE__ */ K("<div class=\"pc-pane-divider\" role=\"separator\" aria-label=\"Resize preview\" aria-orientation=\"horizontal\" tabindex=\"0\"></div>");
function ha(e, t) {
	He(t, !0);
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
	var f = ma();
	W("blur", nn, u), $(f, (e) => i = e, () => i), V((e, t) => {
		Q(f, "aria-valuemin", n()), Q(f, "aria-valuemax", e), Q(f, "aria-valuenow", t);
	}, [() => Math.round(r()), () => Math.round(t.height)]), G("pointerdown", f, s), G("pointermove", f, c), G("pointerup", f, (e) => l(!1, e.pointerId)), W("pointercancel", f, (e) => l(!0, e.pointerId)), W("lostpointercapture", f, (e) => l(!0, e.pointerId)), G("keydown", f, d), q(e, f), Ue();
}
Cr([
	"pointerdown",
	"pointermove",
	"pointerup",
	"keydown"
]);
//#endregion
//#region ui/DetailsDivider.svelte
var ga = /* @__PURE__ */ K("<div class=\"pc-details-divider svelte-1iyzcro\" role=\"separator\" aria-label=\"Resize Details\" aria-orientation=\"vertical\" tabindex=\"0\"></div>");
function _a(e, t) {
	He(t, !0);
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
	var f = ga();
	W("blur", nn, c), $(f, (e) => i = e, () => i), V((e, t) => {
		Q(f, "aria-valuemin", n()), Q(f, "aria-valuemax", e), Q(f, "aria-valuenow", t);
	}, [() => Math.round(r()), () => Math.round(t.width)]), G("pointerdown", f, l), G("pointermove", f, u), G("pointerup", f, (e) => s(!1, e.pointerId)), W("pointercancel", f, (e) => s(!0, e.pointerId)), W("lostpointercapture", f, (e) => s(!0, e.pointerId)), G("keydown", f, d), q(e, f), Ue();
}
Cr([
	"pointerdown",
	"pointermove",
	"pointerup",
	"keydown"
]);
//#endregion
//#region ui/GraphTabs.svelte
var va = /* @__PURE__ */ K("<span class=\"pc-graph-tab-lock svelte-7ptwed\" aria-label=\"Read only\">◇</span>"), ya = /* @__PURE__ */ K("<input type=\"text\" title=\"Enter to save, Escape to cancel\"/>"), ba = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-graph-tab-close svelte-7ptwed\">×</button>"), xa = /* @__PURE__ */ K("<div><button type=\"button\" role=\"tab\" aria-haspopup=\"menu\"><span class=\"svelte-7ptwed\"> </span><!></button> <!> <!></div>"), Sa = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button>"), Ca = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Save workflow</button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close tab</button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close other tabs</button> <!>", 1), wa = /* @__PURE__ */ K("<!> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close active view</button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close other views</button> <!>", 1), Ta = /* @__PURE__ */ K("<div role=\"menu\" tabindex=\"-1\"><!></div>"), Ea = /* @__PURE__ */ K("<nav aria-label=\"Open graph views\"><div class=\"pc-graph-tab-list svelte-7ptwed\" role=\"tablist\" aria-label=\"Graph views\"></div> <button type=\"button\" class=\"pc-graph-view-overflow svelte-7ptwed\" aria-label=\"Graph view actions\" title=\"Focus, close or reopen graph views\" aria-haspopup=\"menu\">⋯</button> <!></nav>");
function Da(e, t) {
	He(t, !0);
	let n = Oi(t, "actions", 19, () => ({})), r = Oi(t, "idPrefix", 3, "pc-graph-view"), i = /* @__PURE__ */ I(null), a = /* @__PURE__ */ I(null), o = /* @__PURE__ */ I(null), s = /* @__PURE__ */ I(!1), c = /* @__PURE__ */ I(""), l = /* @__PURE__ */ I(""), u = /* @__PURE__ */ I(0), d = /* @__PURE__ */ I(0), f = "", p = /* @__PURE__ */ I(""), m = /* @__PURE__ */ I(""), h = /* @__PURE__ */ I(null), g = "", _ = null, v = 0, y = /* @__PURE__ */ P(() => t.views?.tabs.find((e) => e.key === U(l))), b = {};
	xn(() => {
		let e = t.views?.active.key ?? "";
		f === e ? t.views && !t.views.tabs.some((e) => e.key === U(c)) && L(c, e, !0) : (L(c, e, !0), D(), L(p, "")), U(l) && !U(y) && D(), U(p) && (t.views?.workflowId !== g || !t.views.tabs.some((e) => e.key === U(p))) && L(p, ""), f = e;
	});
	async function x(e) {
		let r = t.views?.tabs.find((t) => t.key === e);
		if (!r || r.identity.kind === "library" || !n().renameView || n().canRenameView?.(e) === !1) return;
		let i = ++v;
		_ = null, D(), g = t.views.workflowId, L(m, r.label, !0), L(p, e, !0), await dr(), U(p) === e && v === i && (_ = U(h), U(h)?.focus({ preventScroll: !0 }), U(h)?.select());
	}
	async function S(e, r, i = !0) {
		let a = U(p), o = t.views?.tabs.find((e) => e.key === a), s = U(m).trim();
		a && e === _ && (L(p, ""), _ = null, r && o && s && s !== o.label && t.views?.workflowId === g && o.identity.kind !== "library" && n().canRenameView?.(a) !== !1 && n().renameView?.(a, s), i && (await dr(), b[a]?.focus({ preventScroll: !0 })));
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
			t.views.tabs[n].identity.kind !== "root" && ee(t.views.tabs[n]);
			return;
		}
		let r = e.key === "Home" ? 0 : e.key === "End" ? t.views.tabs.length - 1 : (n + (e.key === "ArrowLeft" ? t.views.tabs.length - 1 : 1)) % t.views.tabs.length;
		T(t.views.tabs[r].key);
	}
	async function ee(e) {
		if (e.identity.kind === "root") return;
		n().closeView?.(e.key), await dr();
		let r = t.views?.active.key;
		r && t.views?.tabs.some((e) => e.key === r) && (L(c, r, !0), b[r]?.focus({ preventScroll: !0 }));
	}
	function D(e = !1) {
		let t = U(l) ? b[U(l)] : U(o);
		L(s, !1), L(l, ""), e && t?.focus({ preventScroll: !0 });
	}
	function O(e, t) {
		e.preventDefault(), e.stopPropagation(), k(t, e.clientX, e.clientY);
	}
	async function k(e, t, n) {
		if (L(l, e.key, !0), L(u, t, !0), L(d, n, !0), L(s, !0), await dr(), !U(s) || U(l) !== e.key) return;
		let r = U(a)?.getBoundingClientRect();
		L(u, Math.min(Math.max(8, t), Math.max(8, window.innerWidth - (r?.width ?? 0) - 8)), !0), L(d, Math.min(Math.max(8, n), Math.max(8, window.innerHeight - (r?.height ?? 0) - 8)), !0), U(a)?.querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
	}
	async function A() {
		let e = !!U(l);
		L(l, ""), L(s, e || !U(s), !0), U(s) && (await dr(), U(s) && U(a)?.querySelector("button:not(:disabled)")?.focus());
	}
	function te(e) {
		if (e.stopPropagation(), e.key === "Escape") {
			e.preventDefault(), D(!0);
			return;
		}
		if (e.key === "Tab") {
			D();
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
		D(!0), e();
	}
	function re(e) {
		let t = U(y);
		t && (D(!0), e(t));
	}
	var ie = { startRename: x }, ae = Pr();
	W("pointerdown", nn, (e) => {
		U(s) && !U(a)?.contains(e.target) && e.target !== U(o) && D();
	}), W("resize", nn, () => D());
	var oe = z(ae), se = (e) => {
		var f = Ea();
		let g;
		var _ = R(f);
		X(_, 23, () => t.views.tabs, (e) => e.key, (e, n, i) => {
			var a = xa();
			let o;
			var u = R(a);
			let d;
			var f = R(u), g = R(f, !0);
			N(f);
			var _ = B(f), v = (e) => {
				q(e, va());
			};
			Y(_, (e) => {
				U(n).readOnly && e(v);
			}), N(u), $(u, (e, t) => b[t.key] = e, (e) => b?.[e.key], () => [U(n)]);
			var y = B(u, 2), x = (e) => {
				var t = ya();
				Z(t);
				let r;
				$(t, (e) => L(h, e), () => U(h)), V(() => {
					r = ci(t, 1, "pc-graph-tab-rename svelte-7ptwed", null, r, { "pc-graph-tab-closeable": U(n).identity.kind !== "root" }), Q(t, "aria-label", U(n).identity.kind === "root" ? "Graph name" : "Subgraph name"), Q(t, "maxlength", U(n).identity.kind === "instance" ? 80 : void 0);
				}), G("keydown", t, C), W("blur", t, (e) => S(e.currentTarget, !0, !1)), wi(t, () => U(m), (e) => L(m, e)), q(e, t);
			};
			Y(y, (e) => {
				U(p) === U(n).key && e(x);
			});
			var D = B(y, 2), k = (e) => {
				var r = ba();
				V((e, i) => {
					Q(r, "aria-label", e), Q(r, "title", i), Q(r, "tabindex", U(n).key === (U(c) || t.views.active.key) ? 0 : -1);
				}, [() => `Close ${U(n).label} · ${w(U(n))}`, () => `Close ${w(U(n))}`]), G("click", r, () => ee(U(n))), G("contextmenu", r, (e) => O(e, U(n))), G("keydown", r, (e) => E(e, U(i))), q(e, r);
			};
			Y(D, (e) => {
				U(n).identity.kind !== "root" && e(k);
			}), N(a), V((e) => {
				o = ci(a, 1, "pc-graph-tab-item svelte-7ptwed", null, o, {
					"pc-graph-tab-active": U(n).key === t.views.active.key,
					"pc-graph-tab-editing": U(p) === U(n).key
				}), d = ci(u, 1, "pc-graph-tab svelte-7ptwed", null, d, { "pc-graph-tab-closeable": U(n).identity.kind !== "root" }), Q(u, "id", `${r()}-${U(i)}`), Q(u, "aria-controls", t.panelId), Q(u, "aria-selected", U(n).key === t.views.active.key), Q(u, "aria-expanded", U(s) && U(l) === U(n).key), Q(u, "tabindex", U(p) !== U(n).key && U(n).key === (U(c) || t.views.active.key) ? 0 : -1), Q(u, "title", e), J(g, U(n).label);
			}, [() => w(U(n))]), G("click", u, () => T(U(n).key)), G("pointerdown", u, (e) => {
				e.button === 2 && e.preventDefault();
			}), G("contextmenu", u, (e) => O(e, U(n))), G("keydown", u, (e) => E(e, U(i))), q(e, a);
		}), N(_);
		var v = B(_, 2);
		$(v, (e) => L(o, e), () => U(o));
		var D = B(v, 2), k = (e) => {
			var r = Ta();
			let i;
			var o = R(r), s = (e) => {
				let r = /* @__PURE__ */ P(() => U(y)), i = /* @__PURE__ */ P(() => n().canRenameView?.(U(r).key) === !1);
				var a = Ca(), o = z(a), s = B(o, 2), c = R(s, !0);
				N(s);
				var l = B(s, 2), u = R(l, !0);
				N(l);
				var d = B(l, 2), f = B(d, 2);
				X(B(f, 2), 17, () => t.views.closedViews, (e) => e.key, (e, t) => {
					var r = Sa(), i = R(r);
					N(r), V((e, a) => {
						r.disabled = !n().reopenView, Q(r, "title", e), J(i, `Reopen ${U(t).label ?? ""} · ${a ?? ""}`);
					}, [() => w(U(t)), () => w(U(t))]), G("click", r, () => ne(() => n().reopenView?.(U(t).key))), q(e, r);
				}), V((e) => {
					o.disabled = !n().saveView, s.disabled = !n().exportView, J(c, U(r).identity.kind === "root" ? "Export workflow JSON" : "Export subgraph JSON"), l.disabled = U(r).identity.kind === "library" || U(i) || !n().renameView, Q(l, "title", U(r).identity.kind === "library" ? "Library inspection is read only." : U(i) ? "Make a local copy of the containing graph to rename this subgraph." : void 0), J(u, U(r).identity.kind === "root" ? "Rename graph" : "Rename subgraph"), d.disabled = U(r).identity.kind === "root" || !n().closeView, f.disabled = e;
				}, [() => t.views.tabs.every((e) => e.identity.kind === "root" || e.key === U(r).key) || !n().closeOtherViews]), G("click", o, () => re((e) => n().saveView?.(e.key))), G("click", s, () => re((e) => n().exportView?.(e.key))), G("click", l, () => re((e) => x(e.key))), G("click", d, () => re((e) => ee(e))), G("click", f, () => re((e) => n().closeOtherViews?.(e.key))), q(e, a);
			}, c = (e) => {
				var r = wa(), i = z(r);
				X(i, 17, () => t.views.tabs, (e) => e.key, (e, t) => {
					var n = Sa(), r = R(n);
					N(n), V((e, t) => {
						Q(n, "title", e), J(r, `Focus ${t ?? ""}`);
					}, [() => w(U(t)), () => w(U(t))]), G("click", n, () => ne(() => T(U(t).key))), q(e, n);
				});
				var a = B(i, 2), o = B(a, 2);
				X(B(o, 2), 17, () => t.views.closedViews, (e) => e.key, (e, t) => {
					var r = Sa(), i = R(r);
					N(r), V((e, n) => {
						Q(r, "title", e), J(i, `Reopen ${U(t).label ?? ""} · ${n ?? ""}`);
					}, [() => w(U(t)), () => w(U(t))]), G("click", r, () => ne(() => n().reopenView?.(U(t).key))), q(e, r);
				}), V((e) => {
					a.disabled = t.views.active.identity.kind === "root" || !n().closeView, o.disabled = e;
				}, [() => t.views.tabs.every((e) => e.identity.kind === "root" || e.key === t.views.active.key) || !n().closeOtherViews]), G("click", a, () => ne(() => ee(t.views.active))), G("click", o, () => ne(() => n().closeOtherViews?.(t.views.active.key))), q(e, r);
			};
			Y(o, (e) => {
				U(y) ? e(s) : e(c, -1);
			}), N(r), $(r, (e) => L(a, e), () => U(a)), V(() => {
				i = ci(r, 1, "pc-graph-view-menu svelte-7ptwed", null, i, { "pc-graph-tab-menu": !!U(l) }), ui(r, U(l) ? `left: ${U(u)}px; top: ${U(d)}px;` : void 0), Q(r, "aria-label", U(y) ? `Actions for ${U(y).label}` : "Graph view actions");
			}), G("keydown", r, te), q(e, r);
		};
		Y(D, (e) => {
			U(s) && e(k);
		}), N(f), $(f, (e) => L(i, e), () => U(i)), V(() => {
			g = ci(f, 1, "pc-graph-tabs pc-graph-tabs-multi svelte-7ptwed", null, g, { "pc-graph-tabs-menu-open": U(s) }), Q(v, "aria-expanded", U(s) && !U(l));
		}), G("click", v, A), q(e, f);
	};
	return Y(oe, (e) => {
		t.views && e(se);
	}), q(e, ae), Ue(ie);
}
Cr([
	"click",
	"pointerdown",
	"contextmenu",
	"keydown"
]);
//#endregion
//#region ui/GraphBreadcrumbs.svelte
var Oa = /* @__PURE__ */ K("<span aria-current=\"page\" class=\"svelte-18ovafz\"> </span>"), ka = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-18ovafz\"> </button>"), Aa = /* @__PURE__ */ K("<li class=\"svelte-18ovafz\"><!></li>"), ja = /* @__PURE__ */ K("<div class=\"pc-graph-location svelte-18ovafz\"><nav aria-label=\"Graph location\" class=\"svelte-18ovafz\"><ol class=\"svelte-18ovafz\"></ol></nav> <span class=\"pc-graph-scope svelte-18ovafz\"> <!><!></span></div>");
function Ma(e, t) {
	He(t, !0);
	let n = Oi(t, "actions", 19, () => ({})), r = /* @__PURE__ */ P(() => t.view?.identity.kind === "library" ? t.view.identity.definitionRef : t.definitionRef ?? t.view?.definitionRef);
	function i(e) {
		return e.identity.kind === "instance" ? !!n().openInstance : !!n().focusView;
	}
	function a(e) {
		e.identity.kind === "instance" ? n().openInstance?.(e.identity.instancePath) : n().focusView?.(e.key);
	}
	var o = Pr(), s = z(o), c = (e) => {
		var n = ja(), o = R(n), s = R(o);
		X(s, 23, () => t.view.breadcrumbs, (e) => e.key, (e, n, r) => {
			var o = Aa(), s = R(o), c = (e) => {
				var t = Oa(), r = R(t, !0);
				N(t), V(() => J(r, U(n).label)), q(e, t);
			}, l = (e) => {
				var t = ka(), r = R(t, !0);
				N(t), V((e) => {
					t.disabled = e, J(r, U(n).label);
				}, [() => !i(U(n))]), G("click", t, () => a(U(n))), q(e, t);
			};
			Y(s, (e) => {
				U(r) === t.view.breadcrumbs.length - 1 ? e(c) : e(l, -1);
			}), N(o), q(e, o);
		}), N(s), N(o);
		var c = B(o, 2), l = R(c, !0), u = B(l), d = (e) => {
			var t = Nr();
			V(() => J(t, `· v${U(r).version ?? ""}`)), q(e, t);
		};
		Y(u, (e) => {
			U(r) && e(d);
		});
		var f = B(u), p = (e) => {
			q(e, Nr("· Read only"));
		};
		Y(f, (e) => {
			(t.view.readOnly || t.view.identity.kind === "library") && e(p);
		}), N(c), N(n), V(() => {
			Q(c, "title", U(r) ? `${U(r).id} · v${U(r).version} · ${U(r).semanticHash}` : void 0), J(l, t.view.identity.kind === "library" ? "Library inspection" : "Instance graph");
		}), q(e, n);
	};
	Y(s, (e) => {
		t.view && t.view.identity.kind !== "root" && e(c);
	}), q(e, o), Ue();
}
Cr(["click"]);
//#endregion
//#region ui/StructuredControl.svelte
var Na = /* @__PURE__ */ K("<small class=\"svelte-taw2zx\">Rows are available when this JSON has a supported shape.</small>"), Pa = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\"> </label><textarea class=\"pc-structured-raw svelte-taw2zx\" spellcheck=\"false\"></textarea> <!>", 1), Fa = /* @__PURE__ */ K("<option class=\"svelte-taw2zx\"> </option>"), Ia = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">Phase</label><select class=\"svelte-taw2zx\"></select> <label class=\"svelte-taw2zx\">Steps</label><input type=\"number\" min=\"1\" max=\"64\" step=\"1\" class=\"svelte-taw2zx\"/>", 1), La = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">Name</label><input maxlength=\"128\" class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Value</label><input type=\"number\" step=\"any\" class=\"svelte-taw2zx\"/>", 1), Ra = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">Default (JSON)</label><textarea class=\"svelte-taw2zx\"></textarea>", 1), za = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">Name</label><input class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Path (JSON array)</label><input class=\"svelte-taw2zx\"/> <label class=\"pc-structured-check svelte-taw2zx\"><input type=\"checkbox\" class=\"svelte-taw2zx\"/> Required</label> <label class=\"pc-structured-check svelte-taw2zx\"><input type=\"checkbox\" class=\"svelte-taw2zx\"/> Use default when missing</label><small class=\"svelte-taw2zx\">Defaults apply when Required is off.</small> <!>", 1), Ba = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">ID</label><input maxlength=\"128\" class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Label</label><input maxlength=\"80\" class=\"svelte-taw2zx\"/>", 1), Va = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">Name</label><input class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Text</label><textarea class=\"svelte-taw2zx\"></textarea>", 1), Ha = /* @__PURE__ */ K("<label class=\"svelte-taw2zx\">Kind</label><select class=\"svelte-taw2zx\"><option class=\"svelte-taw2zx\">Literal</option><option class=\"svelte-taw2zx\">Regular expression</option></select> <label class=\"svelte-taw2zx\">Pattern</label><input class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Replacement</label><textarea class=\"svelte-taw2zx\"></textarea> <label class=\"svelte-taw2zx\">Flags</label><input class=\"svelte-taw2zx\"/>", 1), Ua = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-taw2zx\">Move up</button><button type=\"button\" class=\"svelte-taw2zx\">Move down</button>", 1), Wa = /* @__PURE__ */ K("<fieldset class=\"pc-structured-row svelte-taw2zx\"><legend class=\"svelte-taw2zx\"> </legend> <!> <div class=\"pc-structured-actions svelte-taw2zx\"><!><button type=\"button\" class=\"svelte-taw2zx\">Remove</button></div></fieldset>"), Ga = /* @__PURE__ */ K("<div class=\"pc-structured-rows svelte-taw2zx\"></div> <button type=\"button\" class=\"svelte-taw2zx\"> </button>", 1), Ka = /* @__PURE__ */ K("<div class=\"pc-structured-control svelte-taw2zx\"><div class=\"pc-structured-mode svelte-taw2zx\"><button type=\"button\" class=\"svelte-taw2zx\"> </button></div> <!></div>");
function qa(e, t) {
	He(t, !0);
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
	let f = /* @__PURE__ */ P(d), p = /* @__PURE__ */ I(!1), m = /* @__PURE__ */ P(() => U(p) || !U(f));
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
			L(p, !0), t.ontext(JSON.stringify(o, null, 2).replace(JSON.stringify(a), () => i));
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
	var E = Ka(), ee = R(E), D = R(ee), O = R(D, !0);
	N(D), N(ee);
	var k = B(ee, 2), A = (e) => {
		var i = Pa(), a = z(i), o = R(a);
		N(a);
		var s = B(a);
		it(s);
		var c = B(s, 2), l = (e) => {
			q(e, Na());
		};
		Y(c, (e) => {
			U(f) || e(l);
		}), V(() => {
			Q(a, "for", t.idPrefix + "-raw"), J(o, `${t.control.label ?? ""} (JSON)`), Q(s, "id", t.idPrefix + "-raw"), Q(s, "aria-label", t.control.label), Q(s, "aria-invalid", !!r()), Q(s, "aria-describedby", r() ? t.idPrefix + "-error" : void 0), yi(s, t.text), s.disabled = n();
		}), G("input", s, (e) => h(e.currentTarget.value)), q(e, i);
	}, te = (e) => {
		var r = Ga(), a = z(r);
		X(a, 21, () => U(f), Wr, (e, r, a) => {
			var o = Wa(), s = R(o), l = R(s);
			N(s);
			var d = B(s, 2), p = (e) => {
				var o = Ia(), s = z(o), c = B(s);
				Q(c, "aria-label", "Duration " + (a + 1) + " phase"), X(c, 21, () => i, Wr, (e, t) => {
					var n = Fa(), r = R(n, !0);
					N(n);
					var i = {};
					V((e, a) => {
						n.disabled = e, J(r, a), i !== (i = U(t)) && (n.value = (n.__value = U(t)) ?? "");
					}, [() => U(f).some((e, n) => n !== a && e.name === U(t)), () => U(t)[0].toUpperCase() + U(t).slice(1)]), q(e, n);
				}), N(c);
				var l;
				fi(c);
				var u = B(c, 2), d = B(u);
				Z(d), Q(d, "aria-label", "Duration " + (a + 1) + " steps"), V((e, r) => {
					Q(s, "for", t.idPrefix + "-phase-" + a), Q(c, "id", t.idPrefix + "-phase-" + a), c.disabled = n(), l !== (l = e) && (c.value = (c.__value = e) ?? "", di(c, e)), Q(u, "for", t.idPrefix + "-steps-" + a), Q(d, "id", t.idPrefix + "-steps-" + a), yi(d, r), d.disabled = n();
				}, [() => String(U(r).name), () => Number(U(r).number)]), G("change", c, (e) => x(a, e.currentTarget)), G("change", d, (e) => b(a, e.currentTarget)), q(e, o);
			}, m = (e) => {
				var i = La(), o = z(i), s = B(o);
				Z(s), Q(s, "aria-label", "Value " + (a + 1) + " name");
				var c = B(s, 2), l = B(c);
				Z(l), Q(l, "aria-label", "Value " + (a + 1) + " number"), V((e, r) => {
					Q(o, "for", t.idPrefix + "-name-" + a), Q(s, "id", t.idPrefix + "-name-" + a), yi(s, e), s.disabled = n(), Q(c, "for", t.idPrefix + "-number-" + a), Q(l, "id", t.idPrefix + "-number-" + a), yi(l, r), Q(l, "min", t.control.min), Q(l, "max", t.control.max), l.disabled = n();
				}, [() => String(U(r).name), () => Number(U(r).number)]), G("change", s, (e) => x(a, e.currentTarget)), G("change", l, (e) => b(a, e.currentTarget)), q(e, i);
			}, h = (e) => {
				var i = za(), o = z(i), s = B(o);
				Z(s), Q(s, "aria-label", "Field " + (a + 1) + " name");
				var c = B(s, 2), l = B(c);
				Z(l), Q(l, "aria-label", "Field " + (a + 1) + " path (JSON array)");
				var u = B(l, 2), d = R(u);
				Z(d), Q(d, "aria-label", "Field " + (a + 1) + " required"), je(), N(u);
				var f = B(u, 2), p = R(f);
				Z(p), Q(p, "aria-label", "Field " + (a + 1) + " use default"), je(), N(f);
				var m = B(f, 3), h = (e) => {
					var i = Ra(), o = z(i), s = B(o);
					it(s), Q(s, "aria-label", "Field " + (a + 1) + " default (JSON)"), V((e) => {
						Q(o, "for", t.idPrefix + "-default-" + a), Q(s, "id", t.idPrefix + "-default-" + a), yi(s, e), s.disabled = n();
					}, [() => JSON.stringify(U(r).default, null, 2)]), G("change", s, (e) => S(a, "default", e.currentTarget.value)), q(e, i);
				}, g = /* @__PURE__ */ P(() => Object.hasOwn(U(r), "default"));
				Y(m, (e) => {
					U(g) && e(h);
				}), V((e, i, u) => {
					Q(o, "for", t.idPrefix + "-name-" + a), Q(s, "id", t.idPrefix + "-name-" + a), yi(s, e), s.disabled = n(), Q(c, "for", t.idPrefix + "-path-" + a), Q(l, "id", t.idPrefix + "-path-" + a), yi(l, i), l.disabled = n(), bi(d, U(r).required !== !1), d.disabled = n(), bi(p, u), p.disabled = n();
				}, [
					() => String(U(r).name),
					() => JSON.stringify(U(r).path),
					() => Object.hasOwn(U(r), "default")
				]), G("input", s, (e) => v(a, "name", e.currentTarget.value)), G("change", l, (e) => S(a, "path", e.currentTarget.value)), G("change", d, (e) => v(a, "required", e.currentTarget.checked)), G("change", p, (e) => C(a, e.currentTarget.checked)), q(e, i);
			}, g = (e) => {
				var i = Ba(), o = z(i), s = B(o);
				Z(s), Q(s, "aria-label", "Slot " + (a + 1) + " ID");
				var c = B(s, 2), l = B(c);
				Z(l), Q(l, "aria-label", "Slot " + (a + 1) + " label"), V((e, r) => {
					Q(o, "for", t.idPrefix + "-slot-id-" + a), Q(s, "id", t.idPrefix + "-slot-id-" + a), yi(s, e), s.disabled = n(), Q(c, "for", t.idPrefix + "-slot-label-" + a), Q(l, "id", t.idPrefix + "-slot-label-" + a), yi(l, r), l.disabled = n();
				}, [() => String(U(r).id), () => String(U(r).label)]), G("input", s, (e) => v(a, "id", e.currentTarget.value)), G("input", l, (e) => v(a, "label", e.currentTarget.value)), q(e, i);
			}, _ = (e) => {
				var i = Va(), o = z(i), s = B(o);
				Z(s), Q(s, "aria-label", "Section " + (a + 1) + " name");
				var c = B(s, 2), l = B(c);
				it(l), Q(l, "aria-label", "Section " + (a + 1) + " text"), V((e, r) => {
					Q(o, "for", t.idPrefix + "-name-" + a), Q(s, "id", t.idPrefix + "-name-" + a), yi(s, e), s.disabled = n(), Q(c, "for", t.idPrefix + "-text-" + a), Q(l, "id", t.idPrefix + "-text-" + a), yi(l, r), l.disabled = n();
				}, [() => String(U(r).name), () => String(U(r).text)]), G("input", s, (e) => v(a, "name", e.currentTarget.value)), G("input", l, (e) => v(a, "text", e.currentTarget.value)), q(e, i);
			}, y = (e) => {
				var i = Ha(), o = z(i), s = B(o);
				Q(s, "aria-label", "Rule " + (a + 1) + " kind");
				var c = R(s);
				c.value = c.__value = "literal";
				var l = B(c);
				l.value = l.__value = "regex", N(s);
				var u;
				fi(s);
				var d = B(s, 2), f = B(d);
				Z(f), Q(f, "aria-label", "Rule " + (a + 1) + " pattern");
				var p = B(f, 2), m = B(p);
				it(m), Q(m, "aria-label", "Rule " + (a + 1) + " replacement");
				var h = B(m, 2), g = B(h);
				Z(g), Q(g, "aria-label", "Rule " + (a + 1) + " flags"), V((e, r, i, c) => {
					Q(o, "for", t.idPrefix + "-kind-" + a), Q(s, "id", t.idPrefix + "-kind-" + a), s.disabled = n(), u !== (u = e) && (s.value = (s.__value = e) ?? "", di(s, e)), Q(d, "for", t.idPrefix + "-pattern-" + a), Q(f, "id", t.idPrefix + "-pattern-" + a), yi(f, r), f.disabled = n(), Q(p, "for", t.idPrefix + "-replacement-" + a), Q(m, "id", t.idPrefix + "-replacement-" + a), yi(m, i), m.disabled = n(), Q(h, "for", t.idPrefix + "-flags-" + a), Q(g, "id", t.idPrefix + "-flags-" + a), yi(g, c), g.disabled = n();
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
			var E = B(d, 2), ee = R(E), D = (e) => {
				var t = Ua(), r = z(t), i = B(r);
				V(() => {
					Q(r, "aria-label", "Move " + U(c) + " " + (a + 1) + " up"), r.disabled = n() || a === 0, Q(i, "aria-label", "Move " + U(c) + " " + (a + 1) + " down"), i.disabled = n() || a === U(f).length - 1;
				}), G("click", r, () => T(a, -1)), G("click", i, () => T(a, 1)), q(e, t);
			}, O = /* @__PURE__ */ P(() => !["numeric-map", "durations"].includes(t.control.structured ?? ""));
			Y(ee, (e) => {
				U(O) && e(D);
			});
			var k = B(ee);
			N(E), N(o), V((e) => {
				J(l, `${e ?? ""} ${a + 1}`), Q(k, "aria-label", "Remove " + U(c) + " " + (a + 1)), k.disabled = n() || U(f).length <= U(u);
			}, [() => U(c)[0].toUpperCase() + U(c).slice(1)]), G("click", k, () => w(a)), q(e, o);
		}), N(a);
		var o = B(a, 2), s = R(o);
		N(o), V(() => {
			Q(o, "aria-label", "Add " + U(c)), o.disabled = n() || U(f).length >= U(l), J(s, `Add ${U(c) ?? ""}`);
		}), G("click", o, y), q(e, r);
	};
	Y(k, (e) => {
		U(m) ? e(A) : U(f) && e(te, 1);
	}), N(E), V(() => {
		Q(E, "data-structured-control", t.control.structured), Q(D, "aria-label", "Edit " + t.control.label + (U(m) ? " as rows" : " as JSON")), D.disabled = n() || U(m) && !U(f), J(O, U(m) ? "Use rows" : "Edit JSON");
	}), G("click", D, () => {
		!n() && U(f) && L(p, !U(m));
	}), q(e, E), Ue();
}
Cr([
	"click",
	"input",
	"change"
]);
//#endregion
//#region ui/DetailControl.svelte
var Ja = /* @__PURE__ */ K("<span class=\"pc-control-label svelte-16a137\"> </span> <!>", 1), Ya = /* @__PURE__ */ K("<label class=\"pc-detail-check svelte-16a137\"><input type=\"checkbox\" class=\"svelte-16a137\"/> </label>"), Xa = /* @__PURE__ */ K("<label class=\"svelte-16a137\"><input type=\"radio\" class=\"svelte-16a137\"/><span class=\"svelte-16a137\"> </span></label>"), Za = /* @__PURE__ */ K("<span class=\"pc-control-label svelte-16a137\"> </span> <div class=\"pc-control-segments svelte-16a137\" role=\"radiogroup\"></div>", 1), Qa = /* @__PURE__ */ K("<option class=\"svelte-16a137\"> </option>"), $a = /* @__PURE__ */ K("<select class=\"svelte-16a137\"></select>"), eo = /* @__PURE__ */ K("<input type=\"number\" class=\"svelte-16a137\"/>"), to = /* @__PURE__ */ K("<textarea class=\"svelte-16a137\"></textarea>"), no = /* @__PURE__ */ K("<input type=\"text\" class=\"svelte-16a137\"/>"), ro = /* @__PURE__ */ K("<label class=\"svelte-16a137\"> </label> <!>", 1), io = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-16a137\"> </button>"), ao = /* @__PURE__ */ K("<small class=\"svelte-16a137\"> </small>"), oo = /* @__PURE__ */ K("<p class=\"pc-detail-error svelte-16a137\" role=\"alert\"> </p>"), so = /* @__PURE__ */ K("<div><!> <!> <!> <!> <!></div>");
function co(e, t) {
	He(t, !0);
	let n = Oi(t, "error", 3, ""), r = Oi(t, "disabled", 3, !1), i = Oi(t, "pending", 3, !1), a = () => t.control.editor === "enum" && (t.control.options?.length ?? 0) > 1 && (t.control.options?.length ?? 0) <= 3 && t.control.options.every((e) => e.label.length <= 10), o = () => t.control.effective !== void 0 && t.control.effective !== t.text && t.control.source !== "Saved setting" ? t.control.source : "";
	var s = so();
	let c;
	var l = R(s), u = (e) => {
		var i = Ja(), a = z(i), o = R(a, !0);
		N(a), qa(B(a, 2), {
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
		}), V(() => J(o, t.control.label)), q(e, i);
	}, d = (e) => {
		var n = Ya(), i = R(n);
		Z(i);
		var a = B(i, 1, !0);
		N(n), V((e) => {
			Q(i, "aria-label", t.control.label), bi(i, e), i.disabled = r(), J(a, t.control.label);
		}, [() => !!t.control.value]), G("change", i, (e) => {
			r() || t.onvalue(e.currentTarget.checked);
		}), q(e, n);
	}, f = (e) => {
		var n = Za(), i = z(n), a = R(i, !0);
		N(i);
		var o = B(i, 2);
		X(o, 21, () => t.control.options ?? [], (e) => e.value, (e, n) => {
			var i = Xa(), a = R(i);
			Z(a);
			var o = B(a), s = R(o, !0);
			N(o), N(i), V((e) => {
				Q(a, "name", t.idPrefix + "-choice"), Q(a, "aria-label", U(n).label), yi(a, U(n).value), bi(a, e), a.disabled = r(), J(s, U(n).label);
			}, [() => String(t.control.value) === U(n).value]), G("change", a, (e) => {
				!r() && e.currentTarget.checked && t.onvalue(U(n).value);
			}), q(e, i);
		}), N(o), V(() => {
			J(a, t.control.label), Q(o, "aria-label", t.control.label);
		}), q(e, n);
	}, p = /* @__PURE__ */ P(() => a()), m = (e) => {
		var i = ro(), a = z(i), o = R(a, !0);
		N(a);
		var s = B(a, 2), c = (e) => {
			var n = $a();
			X(n, 21, () => t.control.options ?? [], (e) => e.value, (e, t) => {
				var n = Qa(), r = R(n, !0);
				N(n);
				var i = {};
				V(() => {
					J(r, U(t).label), i !== (i = U(t).value) && (n.value = (n.__value = U(t).value) ?? "");
				}), q(e, n);
			}), N(n);
			var i;
			fi(n), V((e) => {
				Q(n, "id", t.idPrefix + "-editor"), Q(n, "aria-label", t.control.label), n.disabled = r(), i !== (i = e) && (n.value = (n.__value = e) ?? "", di(n, e));
			}, [() => String(t.control.value)]), G("change", n, (e) => {
				r() || t.onvalue(e.currentTarget.value);
			}), q(e, n);
		}, l = (e) => {
			var i = eo();
			Z(i), V((e) => {
				Q(i, "id", t.idPrefix + "-editor"), Q(i, "aria-label", t.control.label), Q(i, "min", t.control.min), Q(i, "max", t.control.max), Q(i, "step", t.control.step ?? 1), Q(i, "aria-invalid", !!n()), Q(i, "aria-describedby", n() ? t.idPrefix + "-error" : void 0), yi(i, e), i.disabled = r();
			}, [() => Number(t.control.value)]), G("change", i, (e) => {
				r() || t.onnumber(e.currentTarget);
			}), q(e, i);
		}, u = (e) => {
			var i = to();
			it(i), V(() => {
				Q(i, "id", t.idPrefix + "-editor"), Q(i, "aria-label", t.control.label), Q(i, "aria-invalid", !!n()), Q(i, "aria-describedby", n() ? t.idPrefix + "-error" : void 0), yi(i, t.text), i.disabled = r();
			}), G("input", i, (e) => {
				r() || t.ontext(e.currentTarget.value);
			}), q(e, i);
		}, d = (e) => {
			var n = no();
			Z(n), V(() => {
				Q(n, "id", t.idPrefix + "-editor"), Q(n, "aria-label", t.control.label), yi(n, t.text), n.disabled = r();
			}), G("change", n, (e) => {
				r() || t.onvalue(e.currentTarget.value);
			}), q(e, n);
		}, f = /* @__PURE__ */ P(() => t.control.singleLine && t.control.editor === "text" && !t.text.includes("\n") && !t.text.includes("\r")), p = (e) => {
			var n = to();
			it(n), V(() => {
				Q(n, "id", t.idPrefix + "-editor"), Q(n, "aria-label", t.control.label), yi(n, t.text), n.disabled = r();
			}), G("change", n, (e) => {
				r() || t.onvalue(e.currentTarget.value);
			}), q(e, n);
		};
		Y(s, (e) => {
			t.control.editor === "enum" ? e(c) : t.control.editor === "number" ? e(l, 1) : t.control.editor === "json" || t.control.editor === "lines" ? e(u, 2) : U(f) ? e(d, 3) : e(p, -1);
		}), V(() => {
			Q(a, "for", t.idPrefix + "-editor"), J(o, t.control.label);
		}), q(e, i);
	};
	Y(l, (e) => {
		t.control.structured && t.control.editor === "json" ? e(u) : t.control.editor === "boolean" ? e(d, 1) : U(p) ? e(f, 2) : e(m, -1);
	});
	var h = B(l, 2), g = (e) => {
		var n = io(), a = R(n, !0);
		N(n), V(() => {
			Q(n, "data-save-control", t.control.key), n.disabled = r() || i(), J(a, i() ? "Validating…" : "Save " + t.control.label);
		}), G("click", n, () => {
			!r() && !i() && t.onsave();
		}), q(e, n);
	};
	Y(h, (e) => {
		(t.control.editor === "json" || t.control.editor === "lines") && e(g);
	});
	var _ = B(h, 2), v = (e) => {
		var n = ao(), r = R(n, !0);
		N(n), V(() => J(r, t.control.help)), q(e, n);
	};
	Y(_, (e) => {
		t.control.help && e(v);
	});
	var y = B(_, 2), b = (e) => {
		var n = ao(), r = R(n, !0);
		N(n), V(() => J(r, t.control.exposureNote)), q(e, n);
	}, x = (e) => {
		var n = ao(), r = R(n);
		N(n), V((e) => J(r, `${e ?? ""} · Effective: ${t.control.effective ?? ""}`), [() => o()]), q(e, n);
	}, S = /* @__PURE__ */ P(() => o());
	Y(y, (e) => {
		t.control.exposureNote ? e(b) : U(S) && e(x, 1);
	});
	var C = B(y, 2), w = (e) => {
		var r = oo(), i = R(r, !0);
		N(r), V(() => {
			Q(r, "id", t.idPrefix + "-error"), J(i, n());
		}), q(e, r);
	};
	Y(C, (e) => {
		n() && e(w);
	}), N(s), V(() => c = ci(s, 1, "pc-detail-control svelte-16a137", null, c, { "pc-control-number": t.control.editor === "number" })), q(e, s), Ue();
}
Cr([
	"change",
	"input",
	"click"
]);
//#endregion
//#region ui/ModifierStack.svelte
var lo = /* @__PURE__ */ K("<label class=\"svelte-1ibq9q\"><input type=\"checkbox\" class=\"svelte-1ibq9q\"/> </label>"), uo = /* @__PURE__ */ K("<option class=\"svelte-1ibq9q\"> </option>"), fo = /* @__PURE__ */ K("<label class=\"pc-modifier-check svelte-1ibq9q\"><input type=\"checkbox\" class=\"svelte-1ibq9q\"/> </label>"), po = /* @__PURE__ */ K("<select class=\"svelte-1ibq9q\"></select>"), mo = /* @__PURE__ */ K("<input type=\"number\" class=\"svelte-1ibq9q\"/>"), ho = /* @__PURE__ */ K("<textarea class=\"svelte-1ibq9q\"></textarea>"), go = /* @__PURE__ */ K("<label class=\"svelte-1ibq9q\"> </label> <!>", 1), _o = /* @__PURE__ */ K("<small class=\"svelte-1ibq9q\"> </small>"), vo = /* @__PURE__ */ K("<!> <!>", 1), yo = /* @__PURE__ */ K("<details class=\"svelte-1ibq9q\"><summary class=\"svelte-1ibq9q\"> <!></summary> <!> <button type=\"button\" class=\"svelte-1ibq9q\"> </button></details>"), bo = /* @__PURE__ */ K("<p class=\"pc-modifier-error svelte-1ibq9q\" role=\"alert\"> </p>"), xo = /* @__PURE__ */ K("<div class=\"pc-modifier-entry svelte-1ibq9q\"><div class=\"pc-modifier-heading svelte-1ibq9q\"><label class=\"svelte-1ibq9q\"><input type=\"checkbox\" class=\"svelte-1ibq9q\"/><span class=\"svelte-1ibq9q\"> <small class=\"svelte-1ibq9q\"> </small></span></label> <div class=\"pc-modifier-order svelte-1ibq9q\"><button type=\"button\" title=\"Move up\" class=\"svelte-1ibq9q\">↑</button> <button type=\"button\" title=\"Move down\" class=\"svelte-1ibq9q\">↓</button> <button type=\"button\" title=\"Remove\" class=\"svelte-1ibq9q\">×</button></div></div> <!> <!></div>"), So = /* @__PURE__ */ K("<div class=\"pc-modifier-stack svelte-1ibq9q\"><small class=\"svelte-1ibq9q\"> </small> <!></div>"), Co = /* @__PURE__ */ K("<small role=\"status\" class=\"svelte-1ibq9q\">Validating modifiers…</small>"), wo = /* @__PURE__ */ K("<section class=\"pc-modifiers svelte-1ibq9q\" data-modifier-controls=\"\" aria-label=\"Text modifiers\"><div class=\"pc-modifier-quick svelte-1ibq9q\"><!> <select aria-label=\"Add text modifier\" class=\"svelte-1ibq9q\"><option class=\"svelte-1ibq9q\">Add modifier…</option><!></select></div> <!> <!> <!></section>");
function To(e, t) {
	He(t, !0);
	let n = (e) => t.options.find((t) => t.type === e.type), r = (e) => n(e)?.label ?? e.type, i = (e) => t.drafts[e.id]?.settings ?? e.settings, a = (e) => t.disabled || t.busy || !t.options.some((t) => t.type === e) || t.items.length >= 16 && !t.items.some((t) => t.type === e);
	var o = wo(), s = R(o), c = R(s);
	X(c, 16, () => ["trim", "wrap"], Wr, (e, n) => {
		var r = lo(), i = R(r);
		Z(i);
		var o = B(i, 1, !0);
		N(r), V((e, t) => {
			Q(i, "aria-label", (n === "trim" ? "Trim" : "Wrap") + " output"), bi(i, e), i.disabled = t, J(o, n === "trim" ? "Trim" : "Wrap");
		}, [() => t.items.some((e) => e.type === n && e.enabled), () => a(n)]), G("change", i, (e) => {
			a(n) || t.onquick(n, e.currentTarget.checked);
		}), q(e, r);
	});
	var l = B(c, 2), u = R(l);
	u.value = u.__value = "", X(B(u), 17, () => t.options.filter((e) => !["trim", "wrap"].includes(e.type)), (e) => e.type, (e, t) => {
		var n = uo(), r = R(n, !0);
		N(n);
		var i = {};
		V(() => {
			J(r, U(t).label), i !== (i = U(t).type) && (n.value = (n.__value = U(t).type) ?? "");
		}), q(e, n);
	}), N(l), l.value = l.__value = "", N(s);
	var d = B(s, 2), f = (e) => {
		var a = So(), o = R(a), s = R(o);
		N(o), X(B(o, 2), 19, () => t.items, (e) => e.id, (e, a, o) => {
			let s = /* @__PURE__ */ P(() => n(U(a))), c = /* @__PURE__ */ P(() => r(U(a))), l = /* @__PURE__ */ P(() => t.drafts[U(a).id]);
			var u = xo(), d = R(u), f = R(d), p = R(f);
			Z(p);
			var m = B(p), h = R(m), g = B(h), _ = R(g, !0);
			N(g), N(m), N(f);
			var v = B(f, 2), y = R(v), b = B(y, 2), x = B(b, 2);
			N(v), N(d);
			var S = B(d, 2), C = (e) => {
				var n = yo(), r = R(n), o = R(r), u = B(o), d = (e) => {
					q(e, Nr("· Unsaved"));
				};
				Y(u, (e) => {
					U(l)?.dirty && e(d);
				}), N(r);
				var f = B(r, 2);
				X(f, 17, () => U(s).fields, (e) => e.key, (e, n) => {
					let r = /* @__PURE__ */ P(() => t.idPrefix + "-modifier-" + U(a).id + "-" + U(n).key);
					var o = vo(), s = z(o), l = (e) => {
						var o = fo(), s = R(o);
						Z(s);
						var l = B(s, 1, !0);
						N(o), V((e) => {
							Q(s, "id", U(r)), Q(s, "aria-label", U(c) + " " + U(n).label), bi(s, e), s.disabled = t.disabled, J(l, U(n).label);
						}, [() => !!i(U(a))[U(n).key]]), G("change", s, (e) => {
							t.disabled || t.ondraft(U(a).id, U(n).key, e.currentTarget.checked);
						}), q(e, o);
					}, u = (e) => {
						var o = go(), s = z(o), l = R(s, !0);
						N(s);
						var u = B(s, 2), d = (e) => {
							var o = po();
							X(o, 21, () => U(n).options ?? [], (e) => e.value, (e, t) => {
								var n = uo(), r = R(n, !0);
								N(n);
								var i = {};
								V(() => {
									J(r, U(t).label), i !== (i = U(t).value) && (n.value = (n.__value = U(t).value) ?? "");
								}), q(e, n);
							}), N(o);
							var s;
							fi(o), V((e) => {
								Q(o, "id", U(r)), Q(o, "aria-label", U(c) + " " + U(n).label), o.disabled = t.disabled, s !== (s = e) && (o.value = (o.__value = e) ?? "", di(o, e));
							}, [() => String(i(U(a))[U(n).key] ?? "")]), G("change", o, (e) => {
								t.disabled || t.ondraft(U(a).id, U(n).key, e.currentTarget.value);
							}), q(e, o);
						}, f = (e) => {
							var o = mo();
							Z(o), V((e) => {
								Q(o, "id", U(r)), Q(o, "aria-label", U(c) + " " + U(n).label), Q(o, "min", U(n).min), Q(o, "max", U(n).max), Q(o, "step", U(n).step ?? 1), yi(o, e), o.disabled = t.disabled;
							}, [() => String(i(U(a))[U(n).key] ?? "")]), G("input", o, (e) => {
								t.disabled || t.ondraft(U(a).id, U(n).key, e.currentTarget.value ? Number(e.currentTarget.value) : null);
							}), q(e, o);
						}, p = (e) => {
							var o = ho();
							it(o), V((e) => {
								Q(o, "id", U(r)), Q(o, "aria-label", U(c) + " " + U(n).label), yi(o, e), o.disabled = t.disabled;
							}, [() => String(i(U(a))[U(n).key] ?? "")]), G("input", o, (e) => {
								t.disabled || t.ondraft(U(a).id, U(n).key, e.currentTarget.value);
							}), q(e, o);
						};
						Y(u, (e) => {
							U(n).editor === "enum" ? e(d) : U(n).editor === "number" ? e(f, 1) : e(p, -1);
						}), V(() => {
							Q(s, "for", U(r)), J(l, U(n).label);
						}), q(e, o);
					};
					Y(s, (e) => {
						U(n).editor === "boolean" ? e(l) : e(u, -1);
					});
					var d = B(s, 2), f = (e) => {
						var t = _o(), r = R(t, !0);
						N(t), V(() => J(r, U(n).help)), q(e, t);
					};
					Y(d, (e) => {
						U(n).help && e(f);
					}), q(e, o);
				});
				var p = B(f, 2), m = R(p, !0);
				N(p), N(n), V(() => {
					n.open = !!U(l)?.dirty || !!U(l)?.error, J(o, `${U(c) ?? ""} settings`), Q(p, "aria-label", "Save " + U(c) + " settings"), p.disabled = t.disabled || !!U(l)?.pending || !U(l)?.dirty, J(m, U(l)?.pending ? "Validating…" : "Save settings");
				}), G("click", p, () => {
					!t.disabled && !U(l)?.pending && U(l)?.dirty && t.onsave(U(a).id);
				}), q(e, n);
			};
			Y(S, (e) => {
				U(s)?.fields.length && e(C);
			});
			var w = B(S, 2), T = (e) => {
				var t = bo(), n = R(t, !0);
				N(t), V(() => J(n, U(l).error)), q(e, t);
			};
			Y(w, (e) => {
				U(l)?.error && e(T);
			}), N(u), V(() => {
				Q(u, "data-modifier-id", U(a).id), Q(u, "data-modifier-state", U(a).enabled ? "active" : "disabled"), Q(p, "aria-label", "Enable " + U(c) + " modifier"), bi(p, U(a).enabled), p.disabled = t.disabled || t.busy, J(h, `${U(o) + 1}. ${U(c) ?? ""}`), J(_, U(a).enabled ? "Active" : "Disabled"), Q(y, "aria-label", "Move " + U(c) + " up"), y.disabled = t.disabled || t.busy || U(o) === 0, Q(b, "aria-label", "Move " + U(c) + " down"), b.disabled = t.disabled || t.busy || U(o) === t.items.length - 1, Q(x, "aria-label", "Remove " + U(c) + " modifier"), x.disabled = t.disabled || t.busy;
			}), G("change", p, (e) => {
				!t.disabled && !t.busy && t.onenable(U(a).id, e.currentTarget.checked);
			}), G("click", y, () => {
				!t.disabled && !t.busy && U(o) > 0 && t.onmove(U(a).id, -1);
			}), G("click", b, () => {
				!t.disabled && !t.busy && U(o) < t.items.length - 1 && t.onmove(U(a).id, 1);
			}), G("click", x, () => {
				!t.disabled && !t.busy && t.onremove(U(a).id);
			}), q(e, u);
		}), N(a), V((e) => J(s, `${e ?? ""} active · ${t.items.length ?? ""} total · Applied in order`), [() => t.items.filter((e) => e.enabled).length]), q(e, a);
	};
	Y(d, (e) => {
		t.items.length && e(f);
	});
	var p = B(d, 2), m = (e) => {
		q(e, Co());
	};
	Y(p, (e) => {
		t.busy && e(m);
	});
	var h = B(p, 2), g = (e) => {
		var n = bo(), r = R(n, !0);
		N(n), V(() => J(r, t.error)), q(e, n);
	};
	Y(h, (e) => {
		t.error && e(g);
	}), N(o), V(() => l.disabled = t.disabled || t.busy || t.items.length >= 16), G("change", l, (e) => {
		let n = e.currentTarget.value;
		e.currentTarget.value = "", !t.disabled && !t.busy && t.items.length < 16 && n && t.onadd(n);
	}), q(e, o), Ue();
}
Cr([
	"change",
	"click",
	"input"
]);
//#endregion
//#region ui/NodeDetails.svelte
var Eo = /* @__PURE__ */ K("<small data-canonical-title=\"\" class=\"svelte-59ntjv\"> </small>"), Do = /* @__PURE__ */ K("<p role=\"alert\" class=\"pc-detail-error svelte-59ntjv\"> </p>"), Oo = /* @__PURE__ */ K("<label class=\"svelte-59ntjv\">Workflow stage<select aria-label=\"Workflow stage\" class=\"svelte-59ntjv\"><option class=\"svelte-59ntjv\">Preparation · before Generate Reply</option><option class=\"svelte-59ntjv\">Response · after Generate Reply</option></select></label><!>", 1), ko = /* @__PURE__ */ K("<span class=\"svelte-59ntjv\">Read-only body</span>"), Ao = /* @__PURE__ */ K("<span class=\"pc-detail-blocked svelte-59ntjv\">Blocks run · Disabled</span>"), jo = /* @__PURE__ */ K("<p class=\"pc-detail-state svelte-59ntjv\"><!><!></p>"), Mo = /* @__PURE__ */ K("<p class=\"pc-detail-error svelte-59ntjv\" role=\"alert\"> </p>"), No = /* @__PURE__ */ K("<option class=\"svelte-59ntjv\"> </option>"), Po = /* @__PURE__ */ K("<fieldset class=\"pc-detail-group svelte-59ntjv\" data-boundary-controls=\"\"><legend class=\"svelte-59ntjv\"> </legend> <label class=\"svelte-59ntjv\">Type<select aria-label=\"Subgraph port type\" class=\"svelte-59ntjv\"></select></label> <label class=\"pc-detail-check svelte-59ntjv\"><input aria-label=\"Required subgraph port\" type=\"checkbox\" class=\"svelte-59ntjv\"/> Required</label> <div class=\"pc-detail-actions svelte-59ntjv\"><button type=\"button\" data-save-boundary=\"\" class=\"svelte-59ntjv\"> </button></div> <small class=\"svelte-59ntjv\">Labels appear on the subgraph block. Disconnect incompatible connections before changing the type. Deleting this node removes its port and attached connections.</small> <!></fieldset>"), Fo = /* @__PURE__ */ K("<p role=\"status\" class=\"svelte-59ntjv\">Loading file…</p>"), Io = /* @__PURE__ */ K("<div data-file-input-controls=\"\" class=\"svelte-59ntjv\"><label class=\"svelte-59ntjv\"> <input type=\"file\" accept=\".txt,.md,.json,text/plain,text/markdown,application/json\" class=\"svelte-59ntjv\"/></label> <p class=\"svelte-59ntjv\"> </p> <small class=\"svelte-59ntjv\">The file's UTF-8 text is embedded in this workflow. Runs use the saved snapshot; replace the file to refresh it.</small> <small class=\"svelte-59ntjv\">Choose a .txt, .md or .json file up to 400,000 bytes and 100,000 UTF-16 code units.</small> <!> <!></div>"), Lo = /* @__PURE__ */ K("<details class=\"pc-detail-group svelte-59ntjv\"><summary class=\"svelte-59ntjv\"> </summary> <!></details>"), Ro = /* @__PURE__ */ K("<fieldset class=\"pc-detail-group pc-detail-main svelte-59ntjv\" data-operation-controls=\"\"><!> <!></fieldset> <!>", 1), zo = /* @__PURE__ */ K("<label class=\"svelte-59ntjv\">Model identifier<input class=\"svelte-59ntjv\"/></label>"), Bo = /* @__PURE__ */ K("<small class=\"svelte-59ntjv\"> </small>"), Vo = /* @__PURE__ */ K("<fieldset class=\"svelte-59ntjv\"><legend class=\"svelte-59ntjv\"> </legend> <label class=\"svelte-59ntjv\">Connection profile<select class=\"svelte-59ntjv\"><option class=\"svelte-59ntjv\">Use helper connection</option><!><!></select></label> <label class=\"svelte-59ntjv\">Model mode<select class=\"svelte-59ntjv\"></select></label> <!> <small class=\"svelte-59ntjv\"> </small><small class=\"svelte-59ntjv\"> </small><!> <!></fieldset>"), Ho = /* @__PURE__ */ K("<small class=\"svelte-59ntjv\">This helper has no text model calls to configure.</small>"), Uo = /* @__PURE__ */ K("<details class=\"pc-detail-group svelte-59ntjv\" data-helper-model-controls=\"\" open=\"\"><summary class=\"svelte-59ntjv\">Helper model bindings</summary> <small class=\"svelte-59ntjv\">Choose connections for inherited text model roles in the pinned helper. Explicit helper-node bindings take precedence. These selections belong to this For Each node.</small> <!> <!></details>"), Wo = /* @__PURE__ */ K("<label class=\"svelte-59ntjv\">Model identifier<input aria-label=\"Model identifier\" class=\"svelte-59ntjv\"/></label>"), Go = /* @__PURE__ */ K("<!> <details class=\"pc-detail-group svelte-59ntjv\" data-model-controls=\"\"><summary class=\"svelte-59ntjv\">Advanced model settings</summary> <button type=\"button\" data-reset-profile=\"\" class=\"svelte-59ntjv\"> </button> <small class=\"svelte-59ntjv\">Choose a connection with the bar under this node. Reset removes this node's connection override.</small> <label class=\"svelte-59ntjv\">Model mode<select aria-label=\"Model mode\" class=\"svelte-59ntjv\"></select></label> <!> <label class=\"svelte-59ntjv\">Model role<input aria-label=\"Model role\" class=\"svelte-59ntjv\"/></label> <!><!> <!></details>", 1), Ko = /* @__PURE__ */ K("<p class=\"pc-detail-port svelte-59ntjv\"> <small class=\"svelte-59ntjv\"> </small></p>"), qo = /* @__PURE__ */ K("<details class=\"pc-detail-group svelte-59ntjv\"><summary class=\"svelte-59ntjv\">Inputs and outputs</summary><!></details>"), Jo = /* @__PURE__ */ K("<p role=\"status\" class=\"svelte-59ntjv\"> </p>"), Yo = /* @__PURE__ */ K("<header class=\"svelte-59ntjv\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-59ntjv\"><path class=\"svelte-59ntjv\"></path></svg> <div class=\"pc-detail-identity svelte-59ntjv\"><input class=\"pc-detail-name svelte-59ntjv\" aria-label=\"Node name\"/> <!> <small class=\"svelte-59ntjv\"> </small></div></header> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>", 1), Xo = /* @__PURE__ */ K("<p class=\"pc-detail-empty svelte-59ntjv\">Select a node to inspect its settings.</p>"), Zo = /* @__PURE__ */ K("<section class=\"pc-node-details svelte-59ntjv\" aria-label=\"Node details\"><!></section>");
function Qo(e, t) {
	He(t, !0);
	let n = (e, n = d) => {
		{
			let s = /* @__PURE__ */ P(() => U(a)[n().key]?.text ?? O(n())), c = /* @__PURE__ */ P(() => U(a)[n().key]?.error || U(o)[n().key] || ""), l = /* @__PURE__ */ P(() => !!t.view?.readOnly || !r().editControl), u = /* @__PURE__ */ P(() => !!U(a)[n().key]?.pending), d = /* @__PURE__ */ P(() => i() + "-" + n().key);
			co(e, {
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
				ontext: (e) => re(n(), e),
				onvalue: (e) => ae(n(), e),
				onnumber: (e) => oe(n(), e),
				onsave: () => ie(n())
			});
		}
	}, r = Oi(t, "actions", 19, () => ({})), i = Oi(t, "idPrefix", 3, "pc-node-details"), a = /* @__PURE__ */ I($t({})), o = /* @__PURE__ */ I($t({})), s = "", c = "", l = "", u = 0, f = 0, p = 0, h = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ I(!1), _ = 0, v = 0, y = 0, b = /* @__PURE__ */ new Map(), x = /* @__PURE__ */ new Map(), S = /* @__PURE__ */ new Map(), C = (e) => Object.fromEntries(Object.entries(e).map(([e, t]) => [e, {
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
	Ai(() => {
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
		(i || n !== c || r !== l) && ((i || r !== l) && (f++, y++), i && (p++, s && S.set(s, mr(() => C(U(a))))), s = e, c = n, l = r, h.clear(), u++, L(o, {}, !0), L(g, !1), v++, L(a, w(i ? S.get(e) ?? {} : mr(() => U(a)), t.view), !0));
	});
	let ee = (e) => ({
		selectionKey: e.selectionKey,
		revision: e.revision,
		address: "kind" in e.address ? {
			...e.address,
			definitionRef: { ...e.address.definitionRef }
		} : {
			...e.address,
			instancePath: [...e.address.instancePath]
		}
	}), D = (e) => E && !!t.view && t.view.selectionKey === e.selectionKey && t.view.revision === e.revision && T(t.view) === T(e);
	function O(e) {
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
	function A(e) {
		let t = (x.get(e) ?? 0) + 1;
		return x.set(e, t), t;
	}
	async function te(e, n, r) {
		let i = t.view;
		if (!i || (n ? !i.canPresent : e === "profileId" || e === "model" ? !ve(i) : i.readOnly)) return;
		let s = ee(i), c = ++u, l = p, d = k(i, e), f = U(a)[e] && d ? A(e) : null;
		h.set(e, c), L(o, {
			...U(o),
			[e]: ""
		}, !0), U(a)[e] && L(a, {
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
			delete t[e], L(a, t, !0);
		}
		if (D(s) && h.get(e) === c && (h.delete(e), L(o, {
			...U(o),
			[e]: m
		}, !0), U(a)[e])) {
			if (m) L(a, {
				...U(a),
				[e]: {
					...U(a)[e],
					error: m,
					pending: !1
				}
			}, !0);
			else {
				let t = { ...U(a) };
				delete t[e], L(a, t, !0);
			}
		}
	}
	function ne(e) {
		let n = e.files?.[0];
		e.value = "", n && t.view?.fileInput && !t.view.readOnly && r().loadFile && !U(a).fileInput?.pending && (L(a, {
			...U(a),
			fileInput: {
				text: "",
				error: "",
				pending: !1
			}
		}, !0), te("fileInput", !1, (e) => r().loadFile(e, n)));
	}
	function re(e, n) {
		t.view && !t.view.readOnly && (A(e.key), h.delete(e.key), L(a, {
			...U(a),
			[e.key]: {
				text: n,
				error: "",
				pending: !1,
				editor: e.editor,
				representation: e.representation
			}
		}, !0), L(o, {
			...U(o),
			[e.key]: ""
		}, !0));
	}
	function ie(e) {
		if (!t.view || t.view.readOnly || !r().editControl) return;
		let n = U(a)[e.key]?.text ?? O(e), i = n;
		if (e.editor === "json") try {
			if (!(e.representation === "json-text" && e.allowEmpty && n.trim() === "")) {
				let t = JSON.parse(n);
				e.representation !== "json-text" && (i = t);
			}
		} catch {
			L(a, {
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
	function ae(e, t) {
		r().editControl && te(e.key, !1, (n) => r().editControl(n, e.key, t));
	}
	function oe(e, n) {
		if (!t.view || t.view.readOnly || !r().editControl) return;
		let i = Number(n.value);
		!n.value.trim() || !Number.isFinite(i) ? L(o, {
			...U(o),
			[e.key]: "Enter a finite number before saving."
		}, !0) : n.validity.valid ? ae(e, i) : L(o, {
			...U(o),
			[e.key]: "Enter a number within the allowed range and step."
		}, !0);
	}
	let se = (e, t) => JSON.stringify([
		"helper-binding",
		e,
		t
	]), ce = (e) => t.view?.helperBindings?.roles.find((t) => t.role === e), le = () => !!t.view?.helperBindings?.editable && !t.view.readOnly && !!r().editHelperBinding, ue = (e, t) => le() && ce(e)?.[t === "profileId" ? "profile" : "model"].editable !== !1, de = (e) => U(a)[se(e, "model")] ? "override" : ce(e)?.model.mode;
	function fe(e, t, n, i) {
		ue(e, t) && ce(e) && te(se(e, t), !1, (a) => r().editHelperBinding(a, e, t, n, i));
	}
	function pe(e, n) {
		if (!ue(e, "model") || !ce(e)) return;
		let r = se(e, "model");
		A(r), h.delete(r), L(a, {
			...U(a),
			[r]: {
				text: n,
				error: "",
				pending: !1,
				helperKey: t.view?.helperBindings?.helperKey
			}
		}, !0), L(o, {
			...U(o),
			[r]: ""
		}, !0);
	}
	function me(e, t) {
		let n = ce(e);
		if (!ue(e, "model") || !n?.model.allowedModes.some((e) => e.value === t)) return;
		let r = se(e, "model");
		if (t === "override") {
			pe(e, U(a)[r]?.text ?? n.model.value ?? "");
			return;
		}
		h.delete(r);
		let i = { ...U(a) };
		delete i[r], L(a, i, !0), L(o, {
			...U(o),
			[r]: ""
		}, !0), t !== n.model.mode && fe(e, "model", t, null);
	}
	function he(e, t) {
		if (!ue(e, "model") || de(e) !== "override") return;
		pe(e, t);
		let n = se(e, "model");
		!t.trim() || t.length > 256 ? L(o, {
			...U(o),
			[n]: "Enter a model identifier of 1–256 characters."
		}, !0) : fe(e, "model", "override", t);
	}
	function ge(e, t, n) {
		_e(e)?.allowedModes.some((e) => e.value === t) && r().editBinding && te(e, !1, (i) => r().editBinding(i, e, t, n));
	}
	let _e = (e) => e === "profileId" ? t.view?.model?.profile : t.view?.model?.model, ve = (e = t.view) => !!e?.model && (e.model.editable ?? !e.readOnly) && !!r().editBinding, ye = (e) => U(a)[e] ? "override" : _e(e)?.mode, be = (e) => U(a)[e]?.text ?? _e(e)?.value ?? "", xe = () => t.view?.model?.profile.mode === "override" || !!t.view?.model?.profileDefaultModel;
	function Se(e, t) {
		ve() && _e(e)?.allowedModes.some((e) => e.value === "override") && (A(e), h.delete(e), L(a, {
			...U(a),
			[e]: {
				text: t,
				error: "",
				pending: !1
			}
		}, !0), L(o, {
			...U(o),
			[e]: ""
		}, !0));
	}
	function Ce(e, t) {
		let n = _e(e);
		if (!ve() || !n?.allowedModes.some((e) => e.value === t)) return;
		if (t === "override") {
			Se(e, be(e));
			return;
		}
		h.delete(e);
		let r = { ...U(a) };
		delete r[e], L(a, r, !0), L(o, {
			...U(o),
			[e]: ""
		}, !0), t !== n.mode && ge(e, t, null);
	}
	function we(e, n) {
		if (ve() && (e !== "model" || ye(e) === "override") && _e(e)?.allowedModes.some((e) => e.value === "override")) {
			if (Se(e, n), !n.trim()) {
				let r = t.view?.readOnly ? "block" : "inherit";
				if (e === "model" && xe() && _e(e)?.allowedModes.some((e) => e.value === r)) {
					Ce(e, r);
					return;
				}
				L(a, {
					...U(a),
					[e]: {
						text: n,
						error: "Enter a model identifier before saving an override.",
						pending: !1
					}
				}, !0);
			} else ge(e, "override", n);
		}
	}
	let Te = () => !!t.view?.modifiers?.editable && !t.view.readOnly && !!r().editModifiers, Ee = () => JSON.parse(JSON.stringify(t.view?.modifiers?.items ?? []));
	function De(e) {
		let t = U(a)["modifier:" + e.id];
		if (t) try {
			return JSON.parse(t.text);
		} catch {}
		return e.settings;
	}
	let j = () => Object.fromEntries((t.view?.modifiers?.items ?? []).map((e) => {
		let t = U(a)["modifier:" + e.id];
		return [e.id, {
			settings: De(e),
			error: t?.error || U(o)["modifier:" + e.id] || "",
			pending: !!t?.pending,
			dirty: !!t
		}];
	}));
	function Oe(e) {
		if (!Te() || U(g) || e.length > 16 || !r().editModifiers) return;
		let t = ++v;
		L(g, !0), te("modifiers", !1, (t) => r().editModifiers(t, e)).finally(() => {
			t === v && L(g, !1);
		});
	}
	function M(e) {
		if (!Te() || !t.view?.modifiers || t.view.modifiers.items.length >= 16) return;
		let n = t.view.modifiers.options.find((t) => t.type === e);
		if (!n) return;
		let r = Ee(), i;
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
		if (!Te() || !t.view?.modifiers || !t.view.modifiers.options.some((t) => t.type === e)) return;
		let r = Ee();
		r.some((t) => t.type === e) ? Oe(r.map((t) => t.type === e ? {
			...t,
			enabled: n
		} : t)) : n && M(e);
	}
	function Ae(e, n) {
		Te() && t.view?.modifiers?.items.some((t) => t.id === e) && Oe(Ee().map((t) => t.id === e ? {
			...t,
			enabled: n
		} : t));
	}
	function Me(e) {
		Te() && t.view?.modifiers?.items.some((t) => t.id === e) && Oe(Ee().filter((t) => t.id !== e));
	}
	function Ne(e, t) {
		if (!Te()) return;
		let n = Ee(), r = n.findIndex((t) => t.id === e), i = r + t;
		r < 0 || i < 0 || i >= n.length || ([n[r], n[i]] = [n[i], n[r]], Oe(n));
	}
	function Pe(e, n, r) {
		if (!Te()) return;
		let i = t.view?.modifiers?.items.find((t) => t.id === e), s = t.view?.modifiers?.options.find((e) => e.type === i?.type);
		if (!i || !s?.fields.some((e) => e.key === n)) return;
		let c = "modifier:" + e;
		b.set(c, (b.get(c) ?? 0) + 1), h.delete(c), L(o, {
			...U(o),
			[c]: ""
		}, !0), L(a, {
			...U(a),
			[c]: {
				text: JSON.stringify({
					...De(i),
					[n]: r
				}),
				error: "",
				pending: !1,
				modifierType: i.type
			}
		}, !0);
	}
	function Fe(e) {
		if (!Te() || !r().editModifiers) return;
		let n = t.view?.modifiers?.items.find((t) => t.id === e), i = "modifier:" + e;
		if (!n || !U(a)[i] || U(a)[i].pending) return;
		let o = (b.get(i) ?? 0) + 1, s = y, c = n.type;
		b.set(i, o);
		let l = De(n), u = Ee().map((t) => t.id === e ? {
			...t,
			settings: l
		} : t);
		te(i, !1, async (n) => {
			let l = await r().editModifiers(n, u);
			if (l.ok && E && t.view && T(t.view) === T(n) && y === s && b.get(i) === o && t.view.modifiers?.items.some((t) => t.id === e && t.type === c)) {
				let e = { ...U(a) };
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
	}, Le = (e) => e.some((e) => !!(U(a)[e.key]?.error || U(o)[e.key]));
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
		f++, h.delete("boundary"), L(o, {
			...U(o),
			boundary: ""
		}, !0), L(a, {
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
		L(a, {
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
				delete e.boundary, L(a, e, !0);
			}
			return s;
		});
	}
	var We = Zo(), Ge = R(We), Ke = (e) => {
		var s = Yo(), c = z(s);
		let l;
		var u = R(c), d = R(u);
		N(u);
		var f = B(u, 2), p = R(f);
		Z(p);
		var h = B(p, 2), _ = (e) => {
			var n = Eo(), r = R(n);
			N(n), V(() => J(r, `Canonical type: ${t.view.canonicalTitle ?? ""}`)), q(e, n);
		};
		Y(h, (e) => {
			!t.view.boundary && (t.view.alias || t.view.title || t.view.canonicalTitle) !== t.view.canonicalTitle && e(_);
		});
		var v = B(h, 2), y = R(v, !0);
		N(v), N(f), N(c);
		var b = B(c, 2), x = (e) => {
			var n = Oo(), i = z(n), a = B(R(i)), s = R(a);
			s.value = s.__value = "pre";
			var c = B(s);
			c.value = c.__value = "post", N(a);
			var l;
			fi(a), N(i);
			var u = B(i), d = (e) => {
				var t = Do(), n = R(t, !0);
				N(t), V(() => J(n, U(o).phase)), q(e, t);
			};
			Y(u, (e) => {
				U(o).phase && e(d);
			}), V(() => {
				a.disabled = t.view.readOnly || !r().editPhase, l !== (l = t.view.phase) && (a.value = (a.__value = t.view.phase) ?? "", di(a, t.view.phase));
			}), G("change", a, (e) => {
				let t = e.currentTarget.value;
				te("phase", !1, (e) => r().editPhase(e, t));
			}), q(e, n);
		};
		Y(b, (e) => {
			t.view.phaseEditable && e(x);
		});
		var S = B(b, 2), C = (e) => {
			var n = jo(), r = R(n), i = (e) => {
				q(e, ko());
			};
			Y(r, (e) => {
				t.view.readOnly && e(i);
			});
			var a = B(r), o = (e) => {
				q(e, Ao());
			};
			Y(a, (e) => {
				t.view.enabled || e(o);
			}), N(n), q(e, n);
		};
		Y(S, (e) => {
			(t.view.readOnly || !t.view.enabled) && e(C);
		});
		var w = B(S, 2), T = (e) => {
			var t = Mo(), n = R(t, !0);
			N(t), V(() => J(n, U(o).alias)), q(e, t);
		};
		Y(w, (e) => {
			U(o).alias && e(T);
		});
		var E = B(w, 2), ee = (e) => {
			var n = Po(), i = R(n), s = R(i);
			N(i);
			var c = B(i, 2), l = B(R(c));
			X(l, 21, () => t.view.boundary.kinds, Wr, (e, t) => {
				var n = No(), r = R(n, !0);
				N(n);
				var i = {};
				V(() => {
					J(r, U(t)), i !== (i = U(t)) && (n.value = (n.__value = U(t)) ?? "");
				}), q(e, n);
			}), N(l);
			var u;
			fi(l), N(c);
			var d = B(c, 2), f = R(d);
			Z(f), je(), N(d);
			var p = B(d, 2), m = R(p), h = R(m, !0);
			N(m), N(p);
			var g = B(p, 4), _ = (e) => {
				var t = Mo(), n = R(t, !0);
				N(t), V(() => J(n, U(a).boundary?.error || U(o).boundary)), q(e, t);
			};
			Y(g, (e) => {
				(U(a).boundary?.error || U(o).boundary) && e(_);
			}), N(n), V((e, n, i) => {
				J(s, `Subgraph ${t.view.boundary.direction ?? ""}`), l.disabled = t.view.readOnly || !r().editInterface, u !== (u = e) && (l.value = (l.__value = e) ?? "", di(l, e)), bi(f, n), f.disabled = t.view.readOnly || !r().editInterface, m.disabled = i, J(h, U(a).boundary?.pending ? "Validating…" : "Save port");
			}, [
				() => ze().artifactKind,
				() => ze().required,
				() => t.view.readOnly || !r().editInterface || !ze().label.trim() || !!U(a).boundary?.pending
			]), G("change", l, (e) => Be("artifactKind", e.currentTarget.value)), G("change", f, (e) => Be("required", e.currentTarget.checked)), G("click", m, () => Ve()), q(e, n);
		};
		Y(E, (e) => {
			t.view.boundary && e(ee);
		});
		var D = B(E, 2), O = (e) => {
			var s = Ro(), c = z(s), l = R(c), u = (e) => {
				var n = Io(), s = R(n), c = R(s, !0), l = B(c);
				N(s);
				var u = B(s, 2), d = R(u, !0);
				N(u);
				var f = B(u, 6), p = (e) => {
					q(e, Fo());
				};
				Y(f, (e) => {
					U(a).fileInput?.pending && e(p);
				});
				var m = B(f, 2), h = (e) => {
					var t = Mo(), n = R(t, !0);
					N(t), V(() => {
						Q(t, "id", i() + "-error-fileInput"), J(n, U(o).fileInput);
					}), q(e, t);
				};
				Y(m, (e) => {
					U(o).fileInput && e(h);
				}), N(n), V(() => {
					J(c, t.view.fileInput.loaded ? "Replace file" : "Choose file"), Q(l, "aria-label", t.view.fileInput.loaded ? "Replace file" : "Choose file"), l.disabled = t.view.readOnly || !r().loadFile || !!U(a).fileInput?.pending, Q(l, "aria-invalid", !!U(o).fileInput), Q(l, "aria-describedby", U(o).fileInput ? i() + "-error-fileInput" : void 0), J(d, t.view.fileInput.loaded ? "Loaded file: " + t.view.fileInput.fileName : "No file loaded.");
				}), G("change", l, (e) => ne(e.currentTarget)), q(e, n);
			};
			Y(l, (e) => {
				t.view.fileInput && e(u);
			}), X(B(l, 2), 17, () => Ie().filter(([e]) => e === "Main"), ([e, t]) => e, (e, t) => {
				var r = /* @__PURE__ */ P(() => m(U(t), 2));
				let i = () => U(r)[1];
				var a = Pr();
				X(z(a), 17, i, (e) => e.key, (e, t) => {
					n(e, () => U(t));
				}), q(e, a);
			}), N(c), X(B(c, 2), 17, () => Ie().filter(([e]) => e !== "Main"), ([e, t]) => e, (e, t) => {
				var r = /* @__PURE__ */ P(() => m(U(t), 2));
				let i = () => U(r)[0], a = () => U(r)[1];
				var o = Lo(), s = R(o), c = R(s, !0);
				N(s), X(B(s, 2), 17, a, (e) => e.key, (e, t) => {
					n(e, () => U(t));
				}), N(o), V((e) => {
					Q(o, "data-control-group", i()), o.open = e, J(c, i());
				}, [() => Le(a())]), q(e, o);
			}), q(e, s);
		};
		Y(D, (e) => {
			t.view.boundary || e(O);
		});
		var k = B(D, 2), A = (e) => {
			var n = Uo(), r = B(R(n), 4);
			X(r, 17, () => t.view.helperBindings.roles, (e) => e.role, (e, t) => {
				var n = Vo(), r = R(n), i = R(r, !0);
				N(r);
				var s = B(r, 2), c = B(R(s)), l = R(c);
				l.value = l.__value = "";
				var u = B(l), d = (e) => {
					var n = No(), r = R(n);
					N(n);
					var i = {};
					V(() => {
						J(r, `Unavailable connection · ${U(t).profile.value ?? ""}`), i !== (i = U(t).profile.value) && (n.value = (n.__value = U(t).profile.value) ?? "");
					}), q(e, n);
				}, f = /* @__PURE__ */ P(() => U(t).profile.value && !(U(t).profile.options ?? []).some((e) => e.value === U(t).profile.value));
				Y(u, (e) => {
					U(f) && e(d);
				}), X(B(u), 17, () => U(t).profile.options ?? [], (e) => e.value, (e, t) => {
					var n = No(), r = R(n, !0);
					N(n);
					var i = {};
					V(() => {
						J(r, U(t).label), i !== (i = U(t).value) && (n.value = (n.__value = U(t).value) ?? "");
					}), q(e, n);
				}), N(c);
				var p;
				fi(c), N(s);
				var m = B(s, 2), h = B(R(m));
				X(h, 21, () => U(t).model.allowedModes, (e) => e.value, (e, t) => {
					var n = No(), r = R(n, !0);
					N(n);
					var i = {};
					V(() => {
						J(r, U(t).label), i !== (i = U(t).value) && (n.value = (n.__value = U(t).value) ?? "");
					}), q(e, n);
				}), N(h);
				var g;
				fi(h), N(m);
				var _ = B(m, 2), v = (e) => {
					var n = zo(), r = B(R(n));
					Z(r), N(n), V((e, n) => {
						Q(r, "aria-label", U(t).role + " model identifier"), yi(r, e), r.disabled = n;
					}, [() => U(a)[se(U(t).role, "model")]?.text ?? U(t).model.value ?? "", () => !ue(U(t).role, "model")]), G("input", r, (e) => pe(U(t).role, e.currentTarget.value)), G("change", r, (e) => he(U(t).role, e.currentTarget.value)), q(e, n);
				}, y = /* @__PURE__ */ P(() => de(U(t).role) === "override");
				Y(_, (e) => {
					U(y) && e(v);
				});
				var b = B(_, 2), x = R(b);
				N(b);
				var S = B(b), C = R(S, !0);
				N(S);
				var w = B(S), T = (e) => {
					var n = Bo(), r = R(n, !0);
					N(n), V(() => J(r, U(t).caveat)), q(e, n);
				};
				Y(w, (e) => {
					U(t).caveat && e(T);
				});
				var E = B(w, 2), ee = (e) => {
					var n = Mo(), r = R(n, !0);
					N(n), V((e) => J(r, e), [() => U(o)[se(U(t).role, "profileId")] || U(o)[se(U(t).role, "model")]]), q(e, n);
				}, D = /* @__PURE__ */ P(() => U(o)[se(U(t).role, "profileId")] || U(o)[se(U(t).role, "model")]);
				Y(E, (e) => {
					U(D) && e(ee);
				}), N(n), V((e, n, r) => {
					J(i, U(t).label), Q(c, "aria-label", U(t).role + " connection profile"), c.disabled = e, p !== (p = U(t).profile.value ?? "") && (c.value = (c.__value = U(t).profile.value ?? "") ?? "", di(c, U(t).profile.value ?? "")), Q(h, "aria-label", U(t).role + " model mode"), h.disabled = n, g !== (g = r) && (h.value = (h.__value = r) ?? "", di(h, r)), J(x, `Effective connection: ${U(t).effective ?? ""}`), J(C, U(t).source);
				}, [
					() => !ue(U(t).role, "profileId"),
					() => !ue(U(t).role, "model"),
					() => de(U(t).role)
				]), G("change", c, (e) => fe(U(t).role, "profileId", e.currentTarget.value ? "override" : "inherit", e.currentTarget.value || null)), G("change", h, (e) => me(U(t).role, e.currentTarget.value)), q(e, n);
			});
			var i = B(r, 2), s = (e) => {
				var n = Mo(), r = R(n, !0);
				N(n), V(() => J(r, t.view.helperBindings.issue)), q(e, n);
			}, c = (e) => {
				q(e, Ho());
			};
			Y(i, (e) => {
				t.view.helperBindings.issue ? e(s) : t.view.helperBindings.roles.length || e(c, 1);
			}), N(n), q(e, n);
		};
		Y(k, (e) => {
			t.view.helperBindings && e(A);
		});
		var re = B(k, 2), ie = (e) => {
			var n = Go(), i = z(n), s = (e) => {
				var n = Mo(), r = R(n, !0);
				N(n), V(() => J(r, t.view.model.issue)), q(e, n);
			};
			Y(i, (e) => {
				t.view.model.issue && e(s);
			});
			var c = B(i, 2), l = B(R(c), 2), u = R(l, !0);
			N(l);
			var d = B(l, 4), f = B(R(d));
			X(f, 21, () => t.view.model.model.allowedModes, (e) => e.value, (e, n) => {
				var r = No(), i = R(r, !0);
				N(r);
				var a = {};
				V((e) => {
					J(i, e), a !== (a = U(n).value) && (r.value = (r.__value = U(n).value) ?? "");
				}, [() => U(n).value === "inherit" && !t.view.readOnly ? xe() || !t.view.model.model.effectiveValue ? "Use profile model" : "Existing role model" : U(n).label]), q(e, r);
			}), N(f);
			var p;
			fi(f), N(d);
			var m = B(d, 2), h = (e) => {
				var t = Wo(), n = B(R(t));
				Z(n), N(t), V((e, t) => {
					yi(n, e), n.disabled = t;
				}, [() => be("model"), () => !ve()]), G("input", n, (e) => Se("model", e.currentTarget.value)), G("change", n, (e) => we("model", e.currentTarget.value)), q(e, t);
			}, g = /* @__PURE__ */ P(() => ye("model") === "override");
			Y(m, (e) => {
				U(g) && e(h);
			});
			var _ = B(m, 2), v = B(R(_));
			Z(v), N(_);
			var y = B(_, 2), b = (e) => {
				var n = Bo(), r = R(n);
				N(n), V(() => J(r, `Effective connection: ${t.view.model.effective ?? ""}`)), q(e, n);
			}, x = /* @__PURE__ */ P(() => !t.view.model.issue || t.view.model.effective.trim() !== t.view.model.issue.trim());
			Y(y, (e) => {
				U(x) && e(b);
			});
			var S = B(y), C = (e) => {
				var n = Bo(), r = R(n, !0);
				N(n), V(() => J(r, t.view.model.source)), q(e, n);
			};
			Y(S, (e) => {
				t.view.model.source && e(C);
			});
			var w = B(S, 2), T = (e) => {
				var t = Mo(), n = R(t, !0);
				N(t), V(() => J(n, U(o).modelRole || U(o).profileId || U(a).model?.error || U(o).model)), q(e, t);
			};
			Y(w, (e) => {
				(U(o).modelRole || U(o).profileId || U(a).model?.error || U(o).model) && e(T);
			}), N(c), V((e, n, i) => {
				l.disabled = e, J(u, t.view.readOnly ? "Use definition connection" : "Use inherited connection"), f.disabled = n, p !== (p = i) && (f.value = (f.__value = i) ?? "", di(f, i)), yi(v, t.view.model.role), v.disabled = t.view.readOnly || !t.view.model.roleEditable || !r().editField;
			}, [
				() => !ve() || t.view.model.profile.mode === "inherit" || !t.view.model.profile.allowedModes.some((e) => e.value === "inherit"),
				() => !ve(),
				() => ye("model")
			]), G("click", l, () => ge("profileId", "inherit", null)), G("change", f, (e) => Ce("model", e.currentTarget.value)), G("change", v, (e) => {
				let n = e.currentTarget.value;
				t.view?.model?.roleEditable && r().editField && te("modelRole", !1, (e) => r().editField(e, "modelRole", n));
			}), q(e, n);
		};
		Y(re, (e) => {
			t.view.model && e(ie);
		});
		var ae = B(re, 2), oe = (e) => {
			var n = qo();
			X(B(R(n)), 17, () => t.view.ports, (e) => e.direction + ":" + e.id, (e, t) => {
				var n = Ko(), r = R(n), i = B(r), a = R(i, !0);
				N(i), N(n), V(() => {
					J(r, `${U(t).direction === "input" ? "In" : "Out"} · ${U(t).label ?? ""}`), J(a, U(t).kind);
				}), q(e, n);
			}), N(n), q(e, n);
		};
		Y(ae, (e) => {
			t.view.ports.length && e(oe);
		});
		var ce = B(ae, 2), le = (e) => {
			var n = Jo(), r = R(n, !0);
			N(n), V(() => J(r, t.view.status)), q(e, n);
		};
		Y(ce, (e) => {
			t.view.status && e(le);
		});
		var _e = B(ce, 2);
		X(_e, 17, () => t.view.issues ?? [], Wr, (e, t) => {
			var n = Mo(), r = R(n, !0);
			N(n), V(() => J(r, U(t))), q(e, n);
		});
		var Ee = B(_e, 2), De = (e) => {
			{
				let n = /* @__PURE__ */ P(() => !Te()), r = /* @__PURE__ */ P(j), a = /* @__PURE__ */ P(() => U(o).modifiers || "");
				To(e, {
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
					onenable: Ae,
					onremove: Me,
					onmove: Ne,
					ondraft: Pe,
					onsave: Fe
				});
			}
		};
		Y(Ee, (e) => {
			t.view.modifiers && e(De);
		}), V((e) => {
			l = ui(c, "", l, { "--pc-detail-family": t.view.familyColor ?? "var(--pc-accent)" }), Q(d, "d", t.view.iconPath), Q(p, "id", i() + "-name"), Q(p, "maxlength", t.view.boundary ? void 0 : 80), yi(p, e), p.disabled = t.view.boundary ? t.view.readOnly || !r().editInterface : !t.view.canPresent || !r().present, J(y, t.view.boundary ? "Subgraph " + t.view.boundary.direction : t.view.family + " · " + t.view.phase + " phase");
		}, [() => t.view.boundary ? ze().label : t.view.alias || t.view.title || t.view.canonicalTitle]), G("input", p, (e) => {
			t.view?.boundary && Be("label", e.currentTarget.value);
		}), G("change", p, (e) => {
			t.view?.boundary || Re(e.currentTarget.value);
		}), q(e, s);
	}, qe = (e) => {
		q(e, Xo());
	};
	Y(Ge, (e) => {
		t.view ? e(Ke) : e(qe, -1);
	}), N(We), q(e, We), Ue();
}
Cr([
	"input",
	"change",
	"click"
]);
//#endregion
//#region ui/CommentDetails.svelte
var $o = /* @__PURE__ */ K("<p class=\"pc-detail-meta svelte-17djc3u\">Read-only comment</p>"), es = /* @__PURE__ */ K("<section class=\"pc-comment-details svelte-17djc3u\" aria-label=\"Comment details\"><h3 class=\"svelte-17djc3u\">Comment</h3> <!> <fieldset class=\"pc-detail-group svelte-17djc3u\"><legend class=\"svelte-17djc3u\">Comment</legend> <label class=\"svelte-17djc3u\">Title<input aria-label=\"Comment title\" class=\"svelte-17djc3u\"/></label> <label class=\"svelte-17djc3u\">Notes<textarea aria-label=\"Comment notes\" rows=\"5\" class=\"svelte-17djc3u\"></textarea></label> <label class=\"pc-comment-color-label svelte-17djc3u\">Color<input aria-label=\"Comment color\" type=\"color\" class=\"svelte-17djc3u\"/></label> <label class=\"pc-detail-check svelte-17djc3u\"><input aria-label=\"Move contents\" type=\"checkbox\" class=\"svelte-17djc3u\"/> Move contents</label> <small class=\"svelte-17djc3u\">Moves fully contained nodes when you drag the comment header.</small></fieldset> <div class=\"pc-comment-commands svelte-17djc3u\"><button type=\"button\" class=\"pc-btn svelte-17djc3u\">Fit to contents</button> <button type=\"button\" class=\"pc-btn pc-danger svelte-17djc3u\">Delete comment</button></div> <small class=\"svelte-17djc3u\">Deleting this comment keeps its contents.</small></section>");
function ts(e, t) {
	He(t, !0);
	let n = Oi(t, "readOnly", 3, !1), r = /* @__PURE__ */ P(() => n() || t.comment.readOnly), i = (e) => e.stopPropagation();
	function a(e) {
		U(r) || t.onPatch(e);
	}
	function o(e) {
		U(r) || t.onCommand(e);
	}
	var s = es(), c = B(R(s), 2), l = (e) => {
		q(e, $o());
	};
	Y(c, (e) => {
		U(r) && e(l);
	});
	var u = B(c, 2), d = B(R(u), 2), f = B(R(d));
	Z(f), N(d);
	var p = B(d, 2), m = B(R(p));
	it(m), N(p);
	var h = B(p, 2), g = B(R(h));
	Z(g), N(h);
	var _ = B(h, 2), v = R(_);
	Z(v), je(), N(_), je(2), N(u);
	var y = B(u, 2), b = R(y), x = B(b, 2);
	N(y), je(2), N(s), V(() => {
		u.disabled = U(r), yi(f, t.comment.title), f.disabled = U(r), yi(m, t.comment.content), m.disabled = U(r), yi(g, t.comment.color), g.disabled = U(r), bi(v, t.comment.moveContents), v.disabled = U(r), b.disabled = U(r), x.disabled = U(r);
	}), W("keydown", f, i, !0), G("change", f, (e) => a({ title: e.currentTarget.value })), W("keydown", m, i, !0), G("change", m, (e) => a({ content: e.currentTarget.value })), G("change", g, (e) => a({ color: e.currentTarget.value })), G("change", v, (e) => a({ moveContents: e.currentTarget.checked })), G("click", b, () => o("fit")), G("click", x, () => o("delete")), q(e, s), Ue();
}
Cr(["change", "click"]);
//#endregion
//#region ui/OutputPreview.svelte
var ns = /* @__PURE__ */ K("<option class=\"svelte-ee2ehy\"> </option>"), rs = /* @__PURE__ */ K("<label class=\"pc-preview-choice svelte-ee2ehy\"><span class=\"pc-preview-sr-only svelte-ee2ehy\">Preview output</span><select aria-label=\"Preview output\" class=\"svelte-ee2ehy\"><option disabled=\"\" class=\"svelte-ee2ehy\">Choose an output</option><!></select></label>"), is = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-ee2ehy\">Collapse preview</button>"), as = /* @__PURE__ */ K("<button type=\"button\" role=\"tab\" class=\"svelte-ee2ehy\"> </button>"), os = /* @__PURE__ */ K("<div class=\"pc-preview-tabs svelte-ee2ehy\" role=\"tablist\" aria-label=\"Recorded artifacts\"></div>"), ss = /* @__PURE__ */ K("<p class=\"pc-preview-note svelte-ee2ehy\"> </p>"), cs = /* @__PURE__ */ K("<pre class=\"svelte-ee2ehy\"> </pre>"), ls = /* @__PURE__ */ K("<small class=\"pc-preview-note svelte-ee2ehy\"> </small>"), us = /* @__PURE__ */ K("<div role=\"tabpanel\" tabindex=\"0\" class=\"svelte-ee2ehy\"><article class=\"svelte-ee2ehy\"><div class=\"pc-preview-section-heading svelte-ee2ehy\"><span class=\"svelte-ee2ehy\"> </span><small class=\"svelte-ee2ehy\"> </small></div> <!> <!></article></div>"), ds = /* @__PURE__ */ K("<p class=\"pc-preview-empty svelte-ee2ehy\"> </p>"), fs = /* @__PURE__ */ K("<section aria-label=\"Accepted consequences\" class=\"pc-preview-settlement svelte-ee2ehy\"><strong class=\"svelte-ee2ehy\"> </strong> <!></section>"), ps = /* @__PURE__ */ K("<p class=\"pc-preview-error svelte-ee2ehy\"> </p>"), ms = /* @__PURE__ */ K("<button type=\"button\" data-run-here=\"\" title=\"Runs the selected output's dependencies. Results are diagnostic previews.\" class=\"svelte-ee2ehy\"> </button>"), hs = /* @__PURE__ */ K("<button type=\"button\" data-preview-apply=\"\" class=\"svelte-ee2ehy\"> </button><button type=\"button\" class=\"svelte-ee2ehy\"> </button>", 1), gs = /* @__PURE__ */ K("<header class=\"svelte-ee2ehy\"><h3 class=\"svelte-ee2ehy\"> </h3> <!> <div class=\"pc-preview-tools svelte-ee2ehy\"><button type=\"button\" class=\"svelte-ee2ehy\">Follow selection</button><button type=\"button\" class=\"svelte-ee2ehy\"> </button><!></div></header> <!> <div class=\"pc-preview-sections svelte-ee2ehy\"><!> <!> <!> <!> <!> <!> <!> <!></div> <footer class=\"svelte-ee2ehy\"><span class=\"pc-preview-status svelte-ee2ehy\"> </span> <span class=\"svelte-ee2ehy\"> </span> <!> <!></footer>", 1), _s = /* @__PURE__ */ K("<p class=\"pc-preview-empty svelte-ee2ehy\">Select a node output to inspect its recorded result.</p>"), vs = /* @__PURE__ */ K("<section class=\"pc-output-preview svelte-ee2ehy\" aria-label=\"Output preview\"><!></section>");
function ys(e, t) {
	let n = Fr();
	He(t, !0);
	let r = Oi(t, "actions", 19, () => ({})), i = /* @__PURE__ */ P(() => JSON.stringify([t.view?.sourceKey, t.view?.selectedKey])), a = /* @__PURE__ */ I($t({
		scope: "",
		id: null
	})), o = /* @__PURE__ */ P(() => (U(a).scope === U(i) ? t.view?.sections.find((e) => e.id === U(a).id) : null) ?? t.view?.sections[0] ?? null);
	xn(() => {
		let e = U(a).scope === U(i) && t.view?.sections.some((e) => e.id === U(a).id) ? U(a).id : t.view?.sections[0]?.id ?? null;
		(U(a).scope !== U(i) || U(a).id !== e) && L(a, {
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
		L(a, {
			scope: U(i),
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
	}, p = /* @__PURE__ */ P(() => !!(t.view && U(l) && t.view.status !== "removed" && !t.view.busy && t.view.runHere?.enabled && r().runHere)), m = /* @__PURE__ */ P(() => !!(t.view && U(l) && t.view.review?.mode === "root" && t.view.review.selectedRootTerminal && "kind" in U(l).target && U(l).target.address.instancePath.length === 0 && d(U(l).target) === d(t.view.review.selector.terminal))), h = /* @__PURE__ */ P(() => !!(t.view && t.view.status === "current" && !t.view.busy && U(m) && t.view.review?.fresh && t.view.review.canApply && r().apply)), g = /* @__PURE__ */ P(() => !!(t.view && !t.view.busy && U(m) && r().reject));
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
	var y = vs(), b = R(y), x = (e) => {
		var d = gs(), m = z(d), y = R(m), b = R(y, !0);
		N(y);
		var x = B(y, 2), S = (e) => {
			var n = rs(), i = B(R(n)), a = R(i);
			a.value = a.__value = "", X(B(a), 17, () => t.view.choices, (e) => e.key, (e, t) => {
				var n = ns(), r = R(n);
				N(n);
				var i = {};
				V(() => {
					J(r, `${U(t).label ?? ""} · ${U(t).kind ?? ""}`), i !== (i = U(t).key) && (n.value = (n.__value = U(t).key) ?? "");
				}), q(e, n);
			}), N(i);
			var o;
			fi(i), N(n), V(() => {
				i.disabled = !r().select, o !== (o = t.view.selectedKey ?? "") && (i.value = (i.__value = t.view.selectedKey ?? "") ?? "", di(i, t.view.selectedKey ?? ""));
			}), G("change", i, (e) => _(e.currentTarget.value)), q(e, n);
		};
		Y(x, (e) => {
			t.view.choices.length && e(S);
		});
		var C = B(x, 2), w = R(C), T = B(w), E = R(T, !0);
		N(T);
		var ee = B(T), D = (e) => {
			var n = is();
			G("click", n, function(...e) {
				t.collapse?.apply(this, e);
			}), q(e, n);
		};
		Y(ee, (e) => {
			t.collapse && e(D);
		}), N(C), N(m);
		var O = B(m, 2), k = (e) => {
			var r = os();
			X(r, 23, () => t.view.sections, (e) => e.id, (e, t, r) => {
				var l = as(), u = R(l, !0);
				N(l), V((e) => {
					Q(l, "id", e), Q(l, "aria-selected", U(o)?.id === U(t).id), Q(l, "aria-controls", n + "-panel"), Q(l, "tabindex", U(o)?.id === U(t).id ? 0 : -1), J(u, U(t).label);
				}, [() => s(U(t).id)]), G("click", l, () => {
					L(a, {
						scope: U(i),
						id: U(t).id
					}, !0);
				}), W("keydown", l, (e) => c(e, U(r)), !0), q(e, l);
			}), N(r), q(e, r);
		};
		Y(O, (e) => {
			t.view.sections.length && e(k);
		});
		var A = B(O, 2), te = R(A), ne = (e) => {
			let t = /* @__PURE__ */ P(() => U(o));
			var r = us(), i = R(r), a = R(i), c = R(a), l = R(c, !0);
			N(c);
			var u = B(c), d = R(u, !0);
			N(u), N(a);
			var f = B(a, 2), p = (e) => {
				var n = ss(), r = R(n, !0);
				N(n), V(() => J(r, U(t).text)), q(e, n);
			}, m = (e) => {
				var n = cs(), r = R(n, !0);
				N(n), V(() => J(r, U(t).text)), q(e, n);
			};
			Y(f, (e) => {
				U(t).format === "omitted" ? e(p) : e(m, -1);
			});
			var h = B(f, 2), g = (e) => {
				var n = ls(), r = R(n);
				N(n), V(() => J(r, `Truncated diagnostic${U(t).format === "json-prefix-text" ? " · JSON prefix shown as text" : ""}`)), q(e, n);
			};
			Y(h, (e) => {
				U(t).truncated && e(g);
			}), N(i), N(r), V((e) => {
				Q(r, "id", n + "-panel"), Q(r, "aria-labelledby", e), Q(i, "data-artifact-kind", U(t).kind), J(l, U(t).label), J(d, U(t).kind);
			}, [() => s(U(t).id)]), W("keydown", r, (e) => e.stopPropagation(), !0), W("paste", r, (e) => e.stopPropagation(), !0), q(e, r);
		}, re = (e) => {
			var n = ds(), r = R(n, !0);
			N(n), V(() => J(r, t.view.status === "not-run" ? "Send an assigned workflow or use Run to here to inspect an output." : "No recorded artifact is available for this output.")), q(e, n);
		};
		Y(te, (e) => {
			U(o) ? e(ne) : e(re, -1);
		});
		var ie = B(te, 2), ae = (e) => {
			var n = fs(), r = R(n), i = R(r);
			N(r), X(B(r, 2), 17, () => t.view.settlement.receipts, (e) => e.intentId + ":" + e.targetId, (e, t) => {
				var n = ss(), r = R(n);
				N(n), V(() => J(r, `${U(t).targetId ?? ""} · ${U(t).status ?? ""}${U(t).error ? " · " + U(t).error.message : ""}`)), q(e, n);
			}), N(n), V(() => J(i, `Accepted consequences · ${t.view.settlement.status === "settled" ? "Saved" : t.view.settlement.status === "partial" ? "Some targets failed" : "Save confirmation needed"}`)), q(e, n);
		};
		Y(ie, (e) => {
			t.view.settlement && e(ae);
		});
		var oe = B(ie, 2), se = (e) => {
			var n = ss(), r = R(n, !0);
			N(n), V(() => J(r, t.view.statusDetail)), q(e, n);
		};
		Y(oe, (e) => {
			t.view.statusDetail && e(se);
		});
		var ce = B(oe, 2);
		X(ce, 17, () => t.view.sections.filter((e) => e.id !== U(o)?.id && (e.format === "omitted" || e.truncated)), (e) => e.id, (e, t) => {
			var n = ss(), r = R(n);
			N(n), V(() => J(r, `${U(t).label ?? ""}: ${(U(t).format === "omitted" ? U(t).text : "Truncated diagnostic" + (U(t).format === "json-prefix-text" ? " · JSON prefix shown as text" : "")) ?? ""}`)), q(e, n);
		});
		var le = B(ce, 2), ue = (e) => {
			var n = ss(), r = R(n, !0);
			N(n), V(() => J(r, t.view.runHere.issue)), q(e, n);
		};
		Y(le, (e) => {
			t.view.runHere?.issue && e(ue);
		});
		var de = B(le, 2);
		X(de, 17, () => t.view.issues, Wr, (e, t) => {
			var n = ps(), r = R(n, !0);
			N(n), V(() => J(r, U(t))), q(e, n);
		});
		var fe = B(de, 2), pe = (e) => {
			var n = ps(), r = R(n, !0);
			N(n), V(() => J(r, t.view.review.issue)), q(e, n);
		};
		Y(fe, (e) => {
			t.view.review?.issue && e(pe);
		});
		var me = B(fe, 2), he = (e) => {
			var n = ls(), r = R(n, !0);
			N(n), V(() => J(r, t.view.review.persistOnly ? "Retry keeps the accepted reply and retries failed targets. No model request is made." : "Apply rechecks the source, connection and final evidence. Recorded preview text may be truncated.")), q(e, n);
		};
		Y(me, (e) => {
			t.view.review && e(he);
		}), N(A);
		var ge = B(A, 2), _e = R(ge), ve = R(_e, !0);
		N(_e);
		var ye = B(_e, 2), be = R(ye, !0);
		N(ye);
		var xe = B(ye, 2), Se = (e) => {
			var n = ms(), i = R(n);
			N(n), V(() => {
				n.disabled = !U(p), J(i, `Run to here · maximum ${t.view.runHere.callBound ?? ""} ${t.view.runHere.callBound === 1 ? "request" : "requests"}`);
			}), G("click", n, () => {
				t.view && U(l) && U(p) && r().runHere?.(t.view.sourceKey, f(U(l).target));
			}), q(e, n);
		};
		Y(xe, (e) => {
			t.view.runHere && e(Se);
		});
		var Ce = B(xe, 2), we = (e) => {
			var n = hs(), i = z(n), a = R(i, !0);
			N(i);
			var o = B(i), s = R(o, !0);
			N(o), V(() => {
				i.disabled = !U(h), J(a, t.view.review.persistOnly ? "Retry failed persistence" : "Apply reviewed candidate"), o.disabled = !U(g), J(s, t.view.review.persistOnly ? "Close persistence review" : "Reject candidate");
			}), G("click", i, () => {
				t.view?.review && U(h) && r().apply?.(v(t.view.review.selector));
			}), G("click", o, () => {
				t.view?.review && U(g) && r().reject?.(v(t.view.review.selector));
			}), q(e, n);
		};
		Y(Ce, (e) => {
			t.view.review && e(we);
		}), N(ge), V((e) => {
			J(b, U(l)?.label ?? t.view.title), Q(w, "aria-pressed", t.view.followSelection), w.disabled = !r().follow, Q(T, "aria-pressed", t.view.pinned), T.disabled = t.view.pinned ? !r().follow : !U(l) || !r().pin, J(E, t.view.pinned ? "Unpin preview" : "Pin preview"), Q(_e, "data-status", t.view.status), J(ve, e), J(be, t.view.pinned ? "Pinned preview" : t.view.followSelection ? "Following selection" : "Selection not followed");
		}, [() => u(t.view.status)]), G("click", w, () => r().follow?.()), G("click", T, () => {
			t.view?.pinned ? r().follow?.() : t.view && U(l) && r().pin?.(t.view.sourceKey, f(U(l).target));
		}), q(e, d);
	}, S = (e) => {
		q(e, _s());
	};
	Y(b, (e) => {
		t.view ? e(x) : e(S, -1);
	}), N(y), q(e, y), Ue();
}
Cr(["change", "click"]);
//#endregion
//#region ui/RunDetails.svelte
var bs = /* @__PURE__ */ K("<p class=\"pc-run-error svelte-f9s2fm\"> </p>"), xs = /* @__PURE__ */ K("<p class=\"pc-run-empty svelte-f9s2fm\">No execution plan has been recorded.</p>"), Ss = /* @__PURE__ */ K("<span aria-hidden=\"true\" class=\"svelte-f9s2fm\">▱</span>"), Cs = /* @__PURE__ */ K("<small class=\"svelte-f9s2fm\"> </small>"), ws = /* @__PURE__ */ K("<details class=\"svelte-f9s2fm\"><summary class=\"svelte-f9s2fm\">Reported usage</summary><div class=\"pc-run-usage svelte-f9s2fm\"><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small></div></details>"), Ts = /* @__PURE__ */ K("<li class=\"svelte-f9s2fm\"><div class=\"pc-run-row-heading svelte-f9s2fm\"><button type=\"button\" class=\"svelte-f9s2fm\"><!> </button><span class=\"pc-run-status svelte-f9s2fm\"> </span></div> <!> <div class=\"pc-run-row-meta svelte-f9s2fm\"><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small></div> <!> <!></li>"), Es = /* @__PURE__ */ K("<header class=\"svelte-f9s2fm\"><h3 class=\"svelte-f9s2fm\">Run details</h3><span class=\"pc-run-status svelte-f9s2fm\"> </span></header> <div class=\"pc-run-summary svelte-f9s2fm\"><p class=\"svelte-f9s2fm\"> </p><p class=\"svelte-f9s2fm\"> </p><p class=\"svelte-f9s2fm\"> </p></div> <!> <!> <ol class=\"pc-run-rows svelte-f9s2fm\"></ol>", 1), Ds = /* @__PURE__ */ K("<p class=\"pc-run-empty svelte-f9s2fm\">Send with an assigned workflow or use Run to here to inspect its processing stages.</p>"), Os = /* @__PURE__ */ K("<section class=\"pc-run-details svelte-f9s2fm\" aria-label=\"Run details\"><!></section>");
function ks(e, t) {
	He(t, !0);
	let n = Oi(t, "actions", 19, () => ({})), r = (e) => e === "not-run" ? "Not run" : e === "empty" ? "Ready" : e.charAt(0).toUpperCase() + e.slice(1), i = (e) => e !== null && Number.isFinite(e) && e >= 0 ? (e / 1e3).toFixed(2) + "s" : "Unknown", a = (e) => e != null && Number.isFinite(e) && e >= 0 ? String(e) : "Unknown";
	var o = Os(), s = R(o), c = (e) => {
		var o = Es(), s = z(o), c = B(R(s)), l = R(c, !0);
		N(c), N(s);
		var u = B(s, 2), d = R(u), f = R(d);
		N(d);
		var p = B(d), m = R(p);
		N(p);
		var h = B(p), g = R(h);
		N(h), N(u);
		var _ = B(u, 2), v = (e) => {
			var n = bs(), r = R(n, !0);
			N(n), V(() => J(r, t.view.issue)), q(e, n);
		};
		Y(_, (e) => {
			t.view.issue && e(v);
		});
		var y = B(_, 2), b = (e) => {
			q(e, xs());
		};
		Y(y, (e) => {
			t.view.rows.length || e(b);
		});
		var x = B(y, 2);
		X(x, 21, () => t.view.rows, (e) => e.key, (e, o) => {
			var s = Ts();
			let c;
			var l = R(s), u = R(l), d = R(u), f = (e) => {
				q(e, Ss());
			};
			Y(d, (e) => {
				U(o).kind === "instance" && e(f);
			});
			var p = B(d, 1, !0);
			N(u);
			var m = B(u), h = R(m, !0);
			N(m), N(l);
			var g = B(l, 2), _ = (e) => {
				var t = Cs(), n = R(t, !0);
				N(t), V((e) => J(n, e), [() => r(U(o).subphase)]), q(e, t);
			};
			Y(g, (e) => {
				U(o).subphase && e(_);
			});
			var v = B(g, 2), y = R(v), b = R(y);
			N(y);
			var x = B(y), S = R(x);
			N(x), N(v);
			var C = B(v, 2), w = (e) => {
				var t = bs(), n = R(t, !0);
				N(t), V(() => J(n, U(o).issue)), q(e, t);
			};
			Y(C, (e) => {
				U(o).issue && e(w);
			});
			var T = B(C, 2), E = (e) => {
				var t = ws(), n = B(R(t)), r = R(n), i = R(r);
				N(r);
				var s = B(r), c = R(s);
				N(s);
				var l = B(s), u = R(l);
				N(l);
				var d = B(l), f = R(d);
				N(d), N(n), N(t), V((e, t, n) => {
					J(i, `Input tokens: ${e ?? ""}`), J(c, `Output tokens: ${t ?? ""}`), J(u, `Total tokens: ${n ?? ""}`), J(f, `Cost: ${U(o).usage?.cost ?? "Unknown" ?? ""}`);
				}, [
					() => a(U(o).usage?.inputTokens),
					() => a(U(o).usage?.outputTokens),
					() => a(U(o).usage?.totalTokens)
				]), q(e, t);
			};
			Y(T, (e) => {
				U(o).kind === "primitive" && e(E);
			}), N(s), V((e, t, r) => {
				Q(s, "data-run-row", U(o).key), Q(s, "data-depth", U(o).depth), Q(s, "data-status", U(o).status), c = ui(s, "", c, e), Q(u, "aria-label", "Open " + U(o).title + " in graph"), u.disabled = !n().jump, J(p, U(o).title), Q(m, "data-status", U(o).status), J(h, t), J(b, `Duration: ${r ?? ""}`), J(S, `${U(o).attempts ?? ""} of ${U(o).callBound ?? ""} requests`);
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
		}), N(x), V((e, n) => {
			Q(c, "data-status", t.view.status), J(l, e), J(f, `${t.view.completedCount ?? ""} of ${t.view.executableCount ?? ""} stages complete`), J(m, `${t.view.actualCalls ?? ""} of ${t.view.callBound ?? ""} requests`), J(g, `Elapsed: ${n ?? ""}`);
		}, [() => r(t.view.status), () => i(t.view.elapsedMs)]), q(e, o);
	}, l = (e) => {
		q(e, Ds());
	};
	Y(s, (e) => {
		t.view ? e(c) : e(l, -1);
	}), N(o), q(e, o), Ue();
}
Cr(["click"]);
//#endregion
//#region ui/RunMeter.svelte
var As = /* @__PURE__ */ K("<span class=\"pc-run-meter-elapsed svelte-1tkcp3\" data-run-elapsed=\"\"> </span>"), js = /* @__PURE__ */ K("<span class=\"pc-run-pixel svelte-1tkcp3\" data-run-pixel=\"\"></span>"), Ms = /* @__PURE__ */ K("<button class=\"pc-run-meter svelte-1tkcp3\"><span class=\"pc-run-meter-label svelte-1tkcp3\"> </span> <!> <span class=\"pc-run-meter-pixels svelte-1tkcp3\" aria-hidden=\"true\"></span></button>");
function Ns(e, t) {
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
	var o = Pr(), s = z(o), c = (e) => {
		var r = Ms(), o = R(r), s = R(o, !0);
		N(o);
		var c = B(o, 2), l = (e) => {
			var n = As(), r = R(n);
			N(n), V((e) => J(r, `${e ?? ""}s`), [() => (t.view.elapsedMs / 1e3).toFixed(1)]), q(e, n);
		}, u = /* @__PURE__ */ P(() => t.view.elapsedMs !== null && Number.isFinite(t.view.elapsedMs) && t.view.elapsedMs >= 0);
		Y(c, (e) => {
			U(u) && e(l);
		});
		var d = B(c, 2);
		X(d, 21, () => U(i), (e) => e.key, (e, t) => {
			var n = js();
			V(() => {
				Q(n, "data-status", U(t).status), Q(n, "title", U(t).title);
			}), q(e, n);
		}), N(d), N(r), V((e) => {
			Q(r, "aria-label", U(a)), Q(r, "title", U(a)), r.disabled = !t.open, J(s, e);
		}, [() => n(t.view.status)]), G("click", r, () => t.open?.()), q(e, r);
	};
	Y(s, (e) => {
		t.view && e(c);
	}), q(e, o), Ue();
}
Cr(["click"]);
//#endregion
//#region ui/PortalManager.svelte
var Ps = /* @__PURE__ */ K("<button type=\"button\" class=\"svelte-mnv790\">Close</button>"), Fs = /* @__PURE__ */ K("<option class=\"svelte-mnv790\"> </option>"), Is = /* @__PURE__ */ K("<label class=\"svelte-mnv790\">Portal name<input aria-label=\"Portal name\" class=\"svelte-mnv790\"/></label> <p class=\"pc-note svelte-mnv790\"> </p> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-rename=\"\" class=\"svelte-mnv790\">Rename</button></div>", 1), Ls = /* @__PURE__ */ K("<p class=\"pc-note svelte-mnv790\">Select a portal or create one from an output.</p>"), Rs = /* @__PURE__ */ K("<button type=\"button\" data-portal-jump-source=\"\" class=\"svelte-mnv790\">Jump to source</button>"), zs = /* @__PURE__ */ K("<label class=\"pc-check svelte-mnv790\"><input type=\"checkbox\" aria-label=\"Replace existing connection\" class=\"svelte-mnv790\"/>Replace existing connection</label>"), Bs = /* @__PURE__ */ K("<button type=\"button\" data-portal-jump-consumer=\"\" class=\"svelte-mnv790\">Jump</button>"), Vs = /* @__PURE__ */ K("<div class=\"pc-consumer svelte-mnv790\"><span class=\"svelte-mnv790\"> </span><div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-restore=\"\" class=\"svelte-mnv790\">Restore wire</button> <!></div></div>"), Hs = /* @__PURE__ */ K("<p class=\"pc-note svelte-mnv790\">No consumers.</p>"), Us = /* @__PURE__ */ K("<label class=\"svelte-mnv790\">Existing consumers<select aria-label=\"Existing consumers\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Choose before deleting…</option><option class=\"svelte-mnv790\">Restore visible wires</option><option class=\"svelte-mnv790\">Disconnect consumers</option></select></label>"), Ws = /* @__PURE__ */ K("<details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Consumers</summary> <label class=\"svelte-mnv790\">Compatible receiver<select aria-label=\"Compatible receiver\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select input…</option><!></select></label> <!> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-connect=\"\" class=\"svelte-mnv790\">Connect receiver</button></div> <!> <!> <!> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-delete=\"\" class=\"svelte-mnv790\">Delete portal</button></div></details>"), Gs = /* @__PURE__ */ K("<details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Convert to portal</summary><p class=\"pc-note svelte-mnv790\"> </p><div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-convert=\"\" class=\"svelte-mnv790\"> </button></div></details>"), Ks = /* @__PURE__ */ K("<p class=\"pc-error svelte-mnv790\"> </p>"), qs = /* @__PURE__ */ K("<p class=\"pc-error svelte-mnv790\" role=\"alert\"> </p>"), Js = /* @__PURE__ */ K("<p class=\"pc-note svelte-mnv790\" role=\"status\">Preparing change…</p>"), Ys = /* @__PURE__ */ K("<p class=\"pc-note svelte-mnv790\"> </p> <label class=\"svelte-mnv790\">Portal<select aria-label=\"Selected portal\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select portal…</option><!></select></label> <!> <details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Source</summary> <label class=\"svelte-mnv790\">Output<select aria-label=\"Portal source\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select output…</option><!></select></label> <label class=\"svelte-mnv790\">New portal name<input aria-label=\"New portal name\" class=\"svelte-mnv790\"/></label> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-create=\"\" class=\"svelte-mnv790\">Create portal</button> <button type=\"button\" data-portal-retarget=\"\" class=\"svelte-mnv790\">Retarget</button> <!></div></details> <!> <!> <!> <!> <!>", 1), Xs = /* @__PURE__ */ K("<p class=\"pc-note svelte-mnv790\">Open a graph to manage its portals.</p>"), Zs = /* @__PURE__ */ K("<section class=\"pc-manager svelte-mnv790\" aria-label=\"Manage portals\"><header class=\"svelte-mnv790\"><h2 class=\"svelte-mnv790\">Manage portals</h2><!></header> <!></section>");
function Qs(e, t) {
	He(t, !0);
	let n = Oi(t, "actions", 19, () => ({})), r = /* @__PURE__ */ I(""), i = /* @__PURE__ */ I(""), a = /* @__PURE__ */ I(""), o = /* @__PURE__ */ I(""), s = /* @__PURE__ */ I(""), c = /* @__PURE__ */ I(!1), l = /* @__PURE__ */ I(""), u = /* @__PURE__ */ I(""), d = "", f = 0, p = !0, m = (e) => JSON.stringify(e.kind === "graph" ? [
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
	]), h = /* @__PURE__ */ P(() => t.view?.publishers.find((e) => e.id === t.view.selectedPortalId)), g = /* @__PURE__ */ P(() => !!t.view && !!U(h) && t.view.capabilities.rename && (t.view.renameMode === "presentation" ? t.view.canPresent : t.view.scope.kind === "graph" && !t.view.readOnly) && !!n().rename), _ = /* @__PURE__ */ P(() => t.view?.sources.find((e) => e.key === U(a) && e.direction === "output")), v = /* @__PURE__ */ P(() => t.view?.receivers.find((e) => e.key === U(o) && e.direction === "input" && e.kind === U(h)?.kind)), y = /* @__PURE__ */ P(() => !!U(h) && !!U(v) && (!U(v).occupied || U(c)) && C("connect") && !!n().connect), b = /* @__PURE__ */ P(() => !!U(h) && C("remove") && !!n().deletePublisher && (!t.view?.consumers.length || U(s) === "restore" || U(s) === "disconnect"));
	xn(() => {
		let e = t.view ? JSON.stringify([
			t.view.managerKey,
			t.view.revision,
			m(t.view.scope),
			t.view.selectedPortalId,
			t.view.renameMode
		]) : "";
		d !== e && (d = e, L(r, U(h)?.label ?? "", !0), L(i, ""), L(a, t.view?.sources.find((e) => e.nodeId === U(h)?.source.nodeId && e.portId === U(h)?.source.portId)?.key ?? "", !0), L(o, ""), L(s, ""), L(c, !1), L(l, ""), L(u, ""), f++);
	}), Ai(() => {
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
		if (!t.view || !n || U(u)) return;
		let i = x(t.view), a = ++f, o = t.view.selectedPortalId;
		L(u, e, !0), L(l, "");
		try {
			let e = await r(i);
			p && a === f && t.view?.managerKey === i.managerKey && t.view.revision === i.revision && m(t.view.scope) === m(i.scope) && t.view.selectedPortalId === o && (L(u, ""), L(l, e.ok ? "" : e.error.code + ": " + e.error.message, !0));
		} catch (e) {
			p && a === f && t.view?.managerKey === i.managerKey && t.view.revision === i.revision && m(t.view.scope) === m(i.scope) && t.view.selectedPortalId === o && (L(u, ""), L(l, e instanceof Error ? e.message : "The portal change could not be accepted.", !0));
		}
	}
	var E = Zs(), ee = R(E), D = B(R(ee)), O = (e) => {
		var t = Ps();
		G("click", t, () => n().close?.()), q(e, t);
	};
	Y(D, (e) => {
		n().close && e(O);
	}), N(ee);
	var k = B(ee, 2), A = (e) => {
		var d = Ys(), f = z(d), p = R(f);
		N(f);
		var m = B(f, 2), E = B(R(m)), ee = R(E);
		ee.value = ee.__value = "", X(B(ee), 17, () => t.view.publishers, (e) => e.id, (e, t) => {
			var n = Fs(), r = R(n);
			N(n);
			var i = {};
			V(() => {
				J(r, `${U(t).label ?? ""} · ${U(t).kind ?? ""}`), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
			}), q(e, n);
		}), N(E);
		var D;
		fi(E), N(m);
		var O = B(m, 2), k = (e) => {
			var i = Is(), a = z(i), o = B(R(a));
			Z(o), N(a);
			var s = B(a, 2), c = R(s);
			N(s);
			var l = B(s, 2), d = R(l);
			N(l), V(() => {
				yi(o, U(r)), o.disabled = !U(g), J(c, `${t.view.renameMode === "presentation" ? "Local workspace label · not exported" : "Authored portal label"} · ${U(h).kind ?? ""}`), d.disabled = !U(g) || !!U(u);
			}), G("input", o, (e) => {
				L(r, e.currentTarget.value, !0), w();
			}), G("click", d, () => {
				let e = U(h)?.id, i = t.view?.renameMode, a = U(r);
				e && i && n().rename && T("rename", U(g), (t) => n().rename(t, e, a, i));
			}), q(e, i);
		}, A = (e) => {
			q(e, Ls());
		};
		Y(O, (e) => {
			U(h) ? e(k) : e(A, -1);
		});
		var te = B(O, 2), ne = B(R(te), 2), re = B(R(ne)), ie = R(re);
		ie.value = ie.__value = "", X(B(ie), 17, () => t.view.sources, (e) => e.key, (e, t) => {
			var n = Fs(), r = R(n);
			N(n);
			var i = {};
			V(() => {
				J(r, `${U(t).label ?? ""} · ${U(t).kind ?? ""}`), i !== (i = U(t).key) && (n.value = (n.__value = U(t).key) ?? "");
			}), q(e, n);
		}), N(re);
		var ae;
		fi(re), N(ne);
		var oe = B(ne, 2), se = B(R(oe));
		Z(se), N(oe);
		var ce = B(oe, 2), le = R(ce), ue = B(le, 2), de = B(ue, 2), fe = (e) => {
			var r = Rs();
			G("click", r, () => {
				t.view && U(h) && n().jumpSource?.(x(t.view), S(U(h).source));
			}), q(e, r);
		};
		Y(de, (e) => {
			U(h) && n().jumpSource && e(fe);
		}), N(ce), N(te);
		var pe = B(te, 2), me = (e) => {
			var r = Ws(), i = B(R(r), 2), a = B(R(i)), l = R(a);
			l.value = l.__value = "", X(B(l), 17, () => t.view.receivers, (e) => e.key, (e, t) => {
				var n = Fs(), r = R(n);
				N(n);
				var i = {};
				V(() => {
					J(r, `${U(t).label ?? ""}${U(t).occupied ? " · Connected" : ""}`), i !== (i = U(t).key) && (n.value = (n.__value = U(t).key) ?? "");
				}), q(e, n);
			}), N(a);
			var d;
			fi(a), N(i);
			var f = B(i, 2), p = (e) => {
				var t = zs(), n = R(t);
				Z(n), je(), N(t), V((e) => {
					bi(n, U(c)), n.disabled = e;
				}, [() => !C("connect")]), G("change", n, (e) => {
					L(c, e.currentTarget.checked, !0), w();
				}), q(e, t);
			};
			Y(f, (e) => {
				U(v)?.occupied && e(p);
			});
			var m = B(f, 2), g = R(m);
			N(m);
			var _ = B(m, 2);
			X(_, 17, () => t.view.consumers, (e) => e.edgeId, (e, r) => {
				var i = Vs(), a = R(i), o = R(a, !0);
				N(a);
				var s = B(a), c = R(s), l = B(c, 2), d = (e) => {
					var i = Bs();
					G("click", i, () => {
						let e = t.view?.consumers.find((e) => e.edgeId === U(r).edgeId);
						t.view && e && n().jumpConsumer?.(x(t.view), e.edgeId, S(e.to));
					}), q(e, i);
				};
				Y(l, (e) => {
					n().jumpConsumer && e(d);
				}), N(s), N(i), V((e) => {
					J(o, U(r).label), c.disabled = e;
				}, [() => !C("restore") || !n().restoreWire || !!U(u)]), G("click", c, () => {
					let e = t.view?.consumers.find((e) => e.edgeId === U(r).edgeId);
					e && n().restoreWire && T("restore", C("restore"), (t) => n().restoreWire(t, e.edgeId));
				}), q(e, i);
			});
			var E = B(_, 2), ee = (e) => {
				q(e, Hs());
			};
			Y(E, (e) => {
				t.view.consumers.length || e(ee);
			});
			var D = B(E, 2), O = (e) => {
				var t = Us(), n = B(R(t)), r = R(n);
				r.value = r.__value = "";
				var i = B(r);
				i.value = i.__value = "restore";
				var a = B(i);
				a.value = a.__value = "disconnect", N(n);
				var o;
				fi(n), N(t), V((e) => {
					n.disabled = e, o !== (o = U(s)) && (n.value = (n.__value = U(s)) ?? "", di(n, U(s)));
				}, [() => !C("remove")]), G("change", n, (e) => {
					L(s, e.currentTarget.value, !0), w();
				}), q(e, t);
			};
			Y(D, (e) => {
				t.view.consumers.length && e(O);
			});
			var k = B(D, 2), A = R(k);
			N(k), N(r), V((e) => {
				a.disabled = e, d !== (d = U(o)) && (a.value = (a.__value = U(o)) ?? "", di(a, U(o))), g.disabled = !U(y) || !!U(u), A.disabled = !U(b) || !!U(u);
			}, [() => !C("connect") || !n().connect]), G("change", a, (e) => {
				L(o, e.currentTarget.value, !0), L(c, !1), w();
			}), G("click", g, () => {
				let e = U(v), t = U(h)?.id, r = U(c);
				e && t && n().connect && T("connect", U(y), (i) => n().connect(i, t, S(e), r));
			}), G("click", A, () => {
				let e = U(h)?.id, r = t.view?.consumers.length ? U(s) : "restore";
				e && (r === "restore" || r === "disconnect") && n().deletePublisher && T("remove", U(b), (t) => n().deletePublisher(t, e, r));
			}), q(e, r);
		};
		Y(pe, (e) => {
			U(h) && e(me);
		});
		var he = B(pe, 2), ge = (e) => {
			var r = Gs(), i = B(R(r)), a = R(i, !0);
			N(i);
			var o = B(i), s = R(o), c = R(s);
			N(s), N(o), N(r), V((e) => {
				J(a, t.view.conversion.label), s.disabled = e, J(c, `Convert ${t.view.conversion.kind === "wire" ? "wire" : "output"}`);
			}, [() => !C("convert") || !!U(u) || (t.view.conversion.kind === "wire" ? !n().convertWire : !n().convertOutput)]), G("click", s, () => {
				let e = t.view?.conversion;
				e?.kind === "wire" && n().convertWire ? T("convert", C("convert"), (t) => n().convertWire(t, e.edgeId)) : e?.kind === "output" && n().convertOutput && T("convert", C("convert"), (t) => n().convertOutput(t, S(e.endpoint)));
			}), q(e, r);
		};
		Y(he, (e) => {
			t.view.conversion && e(ge);
		});
		var _e = B(he, 2), ve = (e) => {
			var n = Ks(), r = R(n, !0);
			N(n), V(() => J(r, t.view.issue)), q(e, n);
		};
		Y(_e, (e) => {
			t.view.issue && e(ve);
		});
		var ye = B(_e, 2), be = (e) => {
			var t = qs(), n = R(t, !0);
			N(t), V(() => J(n, U(l))), q(e, t);
		};
		Y(ye, (e) => {
			U(l) && e(be);
		});
		var xe = B(ye, 2), Se = (e) => {
			q(e, Js());
		};
		Y(xe, (e) => {
			U(u) && e(Se);
		}), V((e, r, o, s) => {
			J(p, `${t.view.scopeLabel ?? ""}${t.view.readOnly ? " · Read-only graph" : ""}`), E.disabled = !n().selectPortal, D !== (D = t.view.selectedPortalId ?? "") && (E.value = (E.__value = t.view.selectedPortalId ?? "") ?? "", di(E, t.view.selectedPortalId ?? "")), re.disabled = e, ae !== (ae = U(a)) && (re.value = (re.__value = U(a)) ?? "", di(re, U(a))), yi(se, U(i)), se.disabled = r, le.disabled = o, ue.disabled = s;
		}, [
			() => !C("create") && !C("retarget"),
			() => !C("create") || !n().create,
			() => !C("create") || !n().create || !U(_) || !U(i).trim() || !!U(u),
			() => !C("retarget") || !n().retarget || !U(_) || !U(h) || !!U(u)
		]), G("change", E, (e) => {
			let r = e.currentTarget.value;
			e.currentTarget.selectedIndex >= 0 && t.view && n().selectPortal && (!r || t.view.publishers.some((e) => e.id === r)) && n().selectPortal(x(t.view), r || null);
		}), G("change", re, (e) => {
			L(a, e.currentTarget.value, !0), w();
		}), G("input", se, (e) => {
			L(i, e.currentTarget.value, !0), w();
		}), G("click", le, () => {
			let e = U(_), t = U(i);
			e && t.trim() && n().create && T("create", C("create"), (r) => n().create(r, t, S(e)));
		}), G("click", ue, () => {
			let e = U(_), t = U(h)?.id;
			e && t && n().retarget && T("retarget", C("retarget"), (r) => n().retarget(r, t, S(e)));
		}), q(e, d);
	}, te = (e) => {
		q(e, Xs());
	};
	Y(k, (e) => {
		t.view ? e(A) : e(te, -1);
	}), N(E), q(e, E), Ue();
}
Cr([
	"click",
	"change",
	"input"
]);
//#endregion
//#region ui/SubgraphSave.svelte
var $s = /* @__PURE__ */ K("<option class=\"svelte-1n658sg\"> </option>"), ec = /* @__PURE__ */ K("<p class=\"pc-save-error svelte-1n658sg\" role=\"alert\"> </p>"), tc = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay svelte-1n658sg\"><div class=\"pc-workspace-dialog pc-subgraph-save svelte-1n658sg\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Save subgraph\" tabindex=\"-1\"><header class=\"svelte-1n658sg\"><h2 class=\"svelte-1n658sg\">Save subgraph</h2><button type=\"button\" aria-label=\"Close save subgraph\" class=\"svelte-1n658sg\">×</button></header> <form class=\"svelte-1n658sg\"><label class=\"svelte-1n658sg\">Name<input aria-label=\"Subgraph name\" maxlength=\"80\" class=\"svelte-1n658sg\"/></label> <label class=\"svelte-1n658sg\">Save as<select aria-label=\"Save as\" class=\"svelte-1n658sg\"><option class=\"svelte-1n658sg\">Save new subgraph</option><!></select></label> <p class=\"svelte-1n658sg\">Edits stay local until you save. Existing placed copies stay unchanged.</p> <!> <footer class=\"svelte-1n658sg\"><button type=\"button\" class=\"svelte-1n658sg\">Cancel</button><button type=\"submit\" data-save-subgraph=\"\" class=\"svelte-1n658sg\"> </button></footer></form></div></div>");
function nc(e, t) {
	He(t, !0);
	let n, r = /* @__PURE__ */ I(""), i = /* @__PURE__ */ I(""), a = /* @__PURE__ */ I(!1), o = /* @__PURE__ */ I(""), s = "", c = 0;
	xn(() => {
		if (t.view.key === s) return;
		s = t.view.key, c++, L(r, t.view.name, !0), L(i, t.view.targetId ?? "", !0), L(a, !1), L(o, "");
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
		L(a, !0), L(o, "");
		try {
			await t.actions.save(n, U(r), U(i) || null);
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
	var d = tc(), f = R(d), p = R(f), m = B(R(p));
	N(p);
	var h = B(p, 2), g = R(h), _ = B(R(g));
	Z(_), N(g);
	var v = B(g, 2), y = B(R(v)), b = R(y);
	b.value = b.__value = "", X(B(b), 17, () => t.view.entries, (e) => e.id, (e, t) => {
		var n = $s(), r = R(n);
		N(n);
		var i = {};
		V(() => {
			J(r, `Update ${U(t).name ?? ""}`), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
		}), q(e, n);
	}), N(y), N(v);
	var x = B(v, 4), S = (e) => {
		var n = ec(), r = R(n, !0);
		N(n), V(() => J(r, t.view.error || U(o))), q(e, n);
	};
	Y(x, (e) => {
		(t.view.error || U(o)) && e(S);
	});
	var C = B(x, 2), w = R(C), T = B(w), E = R(T, !0);
	N(T), N(C), N(h), N(f), $(f, (e) => n = e, () => n), N(d), V((e) => {
		T.disabled = e, J(E, U(a) ? "Saving…" : "Save");
	}, [() => !t.actions || !U(r).trim() || U(a)]), W("keydown", f, u, !0), W("paste", f, (e) => e.stopPropagation()), G("click", m, () => t.actions?.close()), W("submit", h, l), wi(_, () => U(r), (e) => L(r, e)), pi(y, () => U(i), (e) => L(i, e)), G("click", w, () => t.actions?.close()), q(e, d), Ue();
}
Cr(["click"]);
//#endregion
//#region src/workflow/operations/json-data.js?v=0.26.0
function rc(e) {
	if (typeof e != "object" || !e) return JSON.stringify(e);
	if (Array.isArray(e)) {
		let t = "[";
		for (let n = 0; n < e.length; n++) t += `${n ? "," : ""}${rc(e[n])}`;
		return `${t}]`;
	}
	let t = "{", n = Object.keys(e);
	for (let r = 0; r < n.length; r++) {
		let i = n[r];
		t += `${r ? "," : ""}${JSON.stringify(i)}:${rc(e[i])}`;
	}
	return `${t}}`;
}
function ic(e) {
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
		if (new TextEncoder().encode(rc(t)).byteLength > 262144) throw Error("JSON byte limit exceeded.");
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
var ac = (e, t) => ({
	ok: !1,
	error: {
		code: e,
		message: t
	}
}), oc = (e) => Number.isSafeInteger(e) && e >= 0, sc = (e, t) => Object.hasOwn(e, t) ? e[t] : void 0, cc = (e) => typeof e == "object" && !!e && !Array.isArray(e), lc = (e) => typeof e == "string" && e.trim().length > 0 && e.length <= 256, uc = (e) => Array.isArray(e) && e.every((e) => typeof e == "string" && e.length > 0 && e.length <= 4096);
function dc(e, t) {
	let n = fc(e);
	if (!n.ok) return n;
	let r = n.data, i = ic(t);
	if (!i.ok || !i.data.value || Array.isArray(i.data.value) || typeof i.data.value != "object") return ac("INVALID_PROPOSAL", "Use a plain duration or destination proposal.");
	let a = i.data.value, o = sc(a, "kind");
	if (o !== "duration" && o !== "destination") return ac("UNRESOLVED_TIME", "An explicit duration or destination is required.");
	if (o === "duration" ? !oc(sc(a, "minutes")) || Object.hasOwn(a, "absoluteMinute") : !oc(sc(a, "absoluteMinute")) || Object.hasOwn(a, "minutes")) return ac("INVALID_PROPOSAL", "Use one nonnegative safe-integer minute value.");
	let s = [
		"kind",
		"evidence",
		o === "duration" ? "minutes" : "absoluteMinute"
	];
	if (Object.keys(a).some((e) => !s.includes(e))) return ac("INVALID_PROPOSAL", "Proposal contains ambiguous or unsupported timing fields.");
	let c = o === "destination" ? a.absoluteMinute : r.absoluteMinute + a.minutes;
	if (!oc(c) || c < r.absoluteMinute) return ac("INVALID_DESTINATION", "Destination must be a forward safe-integer minute.");
	let l = mc(Object.hasOwn(a, "evidence") ? a.evidence : { kind: "explicit" });
	if (!l.ok) return l;
	let u = l.data, d = u.kind, f = structuredClone(r), p = structuredClone(u);
	return o === "duration" && r.timeEvidence?.kind === "estimate" && (p = d === "estimate" ? {
		...p,
		lineage: [.../* @__PURE__ */ new Set([...r.timeEvidence.lineage ?? [r.timeEvidence.origin], ...u.lineage ?? [u.origin]])]
	} : structuredClone(r.timeEvidence), p.lineage?.length > 64) ? ac("EVIDENCE_LIMIT", "Estimate provenance exceeds 64 sources; hold the entire time projection.") : pc({
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
function fc(e) {
	let t = ic(e);
	if (!t.ok || !t.data.value || typeof t.data.value != "object" || Array.isArray(t.data.value)) return ac("INVALID_CLOCK", "Clock must contain bounded own plain data.");
	let n = t.data.value;
	if (!lc(sc(n, "clockId")) || !lc(sc(n, "calendarId")) || !oc(sc(n, "absoluteMinute")) || !oc(sc(n, "dayLengthMinutes")) || n.dayLengthMinutes === 0) return ac("INVALID_CLOCK", "Clock requires identities and safe-integer minute/calendar values.");
	if (Object.hasOwn(n, "schemaVersion") && n.schemaVersion !== 1) return ac("INVALID_CLOCK", "Clock schema version must be 1.");
	if (Object.hasOwn(n, "revision") && (!oc(n.revision) || n.revision < 1)) return ac("INVALID_CLOCK", "Clock revision must be a positive safe integer.");
	if (Object.hasOwn(n, "timeEvidence") && !mc(n.timeEvidence).ok) return ac("INVALID_CLOCK", "Clock time evidence must retain accepted provenance.");
	if (Object.hasOwn(n, "settledTimeEventIds") && !uc(n.settledTimeEventIds)) return ac("INVALID_CLOCK", "Settled occurrence IDs must be a bounded string array.");
	for (let [e, t] of [
		["unit", "minute"],
		["originMinute", 0],
		["originDay", 1]
	]) if (Object.hasOwn(n, e) && n[e] !== t) return ac("INVALID_CALENDAR", "This calendar uses minute units with minute zero at Day 1.");
	return {
		ok: !0,
		data: n
	};
}
function pc(e) {
	let t = ic(e);
	return t.ok ? {
		ok: !0,
		data: t.data.value
	} : ac("OUTPUT_LIMIT", "Projection exceeds the bounded plain-data DTO budget.");
}
function mc(e) {
	if (!cc(e)) return ac("INVALID_EVIDENCE", "Evidence must be a plain record.");
	let t = sc(e, "kind");
	if (![
		"explicit",
		"authored-rule",
		"validated-extraction",
		"estimate",
		"vague"
	].includes(t)) return ac("INVALID_EVIDENCE", "Use a supported time evidence kind.");
	let n = t === "estimate" ? [
		"kind",
		"origin",
		"acceptancePolicy",
		"lineage"
	] : ["kind", "origin"];
	if (Object.keys(e).some((e) => !n.includes(e))) return ac("INVALID_EVIDENCE", "Evidence contains unsupported or contradictory fields.");
	let r = typeof sc(e, "origin") == "string" && e.origin.trim().length > 0;
	if (Object.hasOwn(e, "origin") && !r) return ac("INVALID_EVIDENCE", "Evidence origin must be nonempty text.");
	if (t === "estimate" && Object.hasOwn(e, "acceptancePolicy") && !["accept", "unresolved"].includes(e.acceptancePolicy)) return ac("INVALID_EVIDENCE", "Estimate acceptance policy must be accept or unresolved.");
	if (Object.hasOwn(e, "lineage")) {
		let t = e.lineage;
		if (!Array.isArray(t) || t.length === 0 || !t.every((e) => typeof e == "string" && e.trim().length > 0) || new Set(t).size !== t.length || !t.includes(e.origin)) return ac("INVALID_EVIDENCE", "Estimate lineage must contain distinct nonempty text origins including the current origin.");
		if (t.length > 64) return ac("EVIDENCE_LIMIT", "Estimate provenance exceeds 64 sources; hold the entire time projection.");
	}
	return t === "vague" || t === "estimate" && (!r || sc(e, "acceptancePolicy") !== "accept") ? ac("UNRESOLVED_TIME", "Estimated or vague time needs an explicit accepted authored rule.") : ["authored-rule", "validated-extraction"].includes(t) && !r ? ac("INVALID_EVIDENCE", "Rule and extraction evidence must identify their origin.") : {
		ok: !0,
		data: e
	};
}
new TextEncoder();
//#endregion
//#region src/ui/story-document-setup.js
var hc = (e, t) => ({
	ok: !1,
	error: {
		code: e,
		message: t
	}
});
function gc(e, t, n = 0) {
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
	return dc(r, {
		kind: "duration",
		minutes: 0
	}).ok ? {
		ok: !0,
		data: { text: JSON.stringify(r, null, 2) }
	} : hc("INVALID_CLOCK_TEMPLATE", "Choose explicit clock/calendar IDs and a nonnegative whole story minute.");
}
//#endregion
//#region ui/StoryDocuments.svelte
var _c = /* @__PURE__ */ K("<p role=\"alert\" class=\"svelte-1t33cem\"> </p>"), vc = /* @__PURE__ */ K("<option class=\"svelte-1t33cem\"> </option>"), yc = /* @__PURE__ */ K("<label class=\"svelte-1t33cem\">Actor ID<input aria-label=\"Actor ID\" maxlength=\"128\" class=\"svelte-1t33cem\"/></label>"), bc = /* @__PURE__ */ K("<label class=\"svelte-1t33cem\">CSV columns, comma separated<input aria-label=\"CSV columns\" class=\"svelte-1t33cem\"/></label>"), xc = /* @__PURE__ */ K("<details class=\"svelte-1t33cem\"><summary class=\"svelte-1t33cem\">Story clock template</summary><label class=\"svelte-1t33cem\">Calendar ID<input aria-label=\"Calendar ID\" class=\"svelte-1t33cem\"/></label><label class=\"svelte-1t33cem\">Starting story minute<input aria-label=\"Starting story minute\" type=\"number\" min=\"0\" step=\"1\" class=\"svelte-1t33cem\"/></label><button type=\"button\" class=\"svelte-1t33cem\">Use story clock template</button><p class=\"svelte-1t33cem\">Midnight on the first day is minute 0. The clock advances through graph events, using explicit story time.</p></details>"), Sc = /* @__PURE__ */ K("<p role=\"status\" class=\"svelte-1t33cem\"> </p>"), Cc = /* @__PURE__ */ K("<div class=\"pc-story-documents svelte-1t33cem\"><p class=\"svelte-1t33cem\"> </p> <p class=\"svelte-1t33cem\">Manage the documents used by your workflows here. Updating an authorization or its initial template leaves existing canonical document content intact. Read File and Write File use these target IDs.</p> <!> <label class=\"svelte-1t33cem\">Workflow data document<select aria-label=\"Workflow data document\" class=\"svelte-1t33cem\"><option class=\"svelte-1t33cem\">New document authorization</option><!></select></label> <div class=\"pc-document-actions svelte-1t33cem\"><button type=\"button\" class=\"svelte-1t33cem\">Load initial template</button><button type=\"button\" class=\"svelte-1t33cem\">Remove authorization</button><button type=\"button\" class=\"svelte-1t33cem\">Refresh scope</button></div> <form class=\"svelte-1t33cem\"><label class=\"svelte-1t33cem\">Logical target ID<input aria-label=\"Logical target ID\" maxlength=\"128\" placeholder=\"souls.json\" class=\"svelte-1t33cem\"/></label> <label class=\"svelte-1t33cem\">Document name<input aria-label=\"Document name\" maxlength=\"256\" class=\"svelte-1t33cem\"/></label> <label class=\"svelte-1t33cem\">Format<select aria-label=\"Document format\" class=\"svelte-1t33cem\"><option class=\"svelte-1t33cem\">JSON</option><option class=\"svelte-1t33cem\">JSON Lines</option><option class=\"svelte-1t33cem\">CSV</option><option class=\"svelte-1t33cem\">Plain text</option><option class=\"svelte-1t33cem\">Markdown</option></select></label> <label class=\"svelte-1t33cem\">Visibility<select aria-label=\"Document visibility\" class=\"svelte-1t33cem\"><option class=\"svelte-1t33cem\">Public</option><option class=\"svelte-1t33cem\">Hidden</option><option class=\"svelte-1t33cem\">Actor private</option></select></label> <!> <!> <!> <label class=\"svelte-1t33cem\">Initial template<textarea aria-label=\"Initial template\" rows=\"7\" maxlength=\"100000\" class=\"svelte-1t33cem\"></textarea></label> <p class=\"svelte-1t33cem\">JSON templates preserve your chosen object or list structure. CSV uses the named columns. Existing authorizations require explicit template loading before editing.</p> <!><!> <footer class=\"svelte-1t33cem\"><button type=\"button\" class=\"svelte-1t33cem\">Close</button><button type=\"submit\" class=\"svelte-1t33cem\"> </button></footer></form></div>");
function wc(e, t) {
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
		let e = t.view.documents.find((e) => e.targetId === U(n));
		e && (L(r, e.targetId, !0), L(i, e.name, !0), L(a, e.format, !0), L(s, e.visibility.kind, !0), L(c, e.visibility.kind === "actor-private" ? e.visibility.actorId : "", !0), L(l, e.columns?.join(", ") ?? "", !0));
	}
	function b() {
		let e = gc(U(r), U(m), U(h));
		e.ok ? (L(o, e.data.text, !0), L(d, "")) : L(d, e.error.message, !0);
	}
	async function x(e) {
		if (!t.actions || U(u) || !t.view.key) return;
		let m = t.view.key, h = ++_;
		L(u, !0), L(d, ""), L(f, "");
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
	var S = Cc(), C = R(S), w = R(C);
	N(C);
	var T = B(C, 4), E = (e) => {
		var n = _c(), r = R(n, !0);
		N(n), V(() => J(r, t.view.issue)), q(e, n);
	};
	Y(T, (e) => {
		t.view.issue && e(E);
	});
	var ee = B(T, 2), D = B(R(ee)), O = R(D);
	O.value = O.__value = "", X(B(O), 17, () => t.view.documents, (e) => e.targetId, (e, t) => {
		var n = vc(), r = R(n);
		N(n);
		var i = {};
		V(() => {
			J(r, `${U(t).name ?? ""} (${U(t).targetId ?? ""}, ${U(t).format ?? ""}, ${U(t).visibility.kind ?? ""})`), i !== (i = U(t).targetId) && (n.value = (n.__value = U(t).targetId) ?? "");
		}), q(e, n);
	}), N(D), N(ee);
	var k = B(ee, 2), A = R(k), te = B(A), ne = B(te);
	N(k);
	var re = B(k, 2), ie = R(re), ae = B(R(ie));
	Z(ae), N(ie);
	var oe = B(ie, 2), se = B(R(oe));
	Z(se), N(oe);
	var ce = B(oe, 2), le = B(R(ce)), ue = R(le);
	ue.value = ue.__value = "json";
	var de = B(ue);
	de.value = de.__value = "jsonl";
	var fe = B(de);
	fe.value = fe.__value = "csv";
	var pe = B(fe);
	pe.value = pe.__value = "text";
	var me = B(pe);
	me.value = me.__value = "markdown", N(le), N(ce);
	var he = B(ce, 2), ge = B(R(he)), _e = R(ge);
	_e.value = _e.__value = "public";
	var ve = B(_e);
	ve.value = ve.__value = "hidden";
	var ye = B(ve);
	ye.value = ye.__value = "actor-private", N(ge), N(he);
	var be = B(he, 2), xe = (e) => {
		var t = yc(), n = B(R(t));
		Z(n), N(t), V(() => n.disabled = U(u)), wi(n, () => U(c), (e) => L(c, e)), q(e, t);
	};
	Y(be, (e) => {
		U(s) === "actor-private" && e(xe);
	});
	var Se = B(be, 2), Ce = (e) => {
		var t = bc(), n = B(R(t));
		Z(n), N(t), V(() => n.disabled = U(u)), wi(n, () => U(l), (e) => L(l, e)), q(e, t);
	};
	Y(Se, (e) => {
		U(a) === "csv" && e(Ce);
	});
	var we = B(Se, 2), Te = (e) => {
		var t = xc(), i = B(R(t)), a = B(R(i));
		Z(a), N(i);
		var o = B(i), s = B(R(o));
		Z(s), N(o);
		var c = B(o);
		je(), N(t), V((e) => {
			a.disabled = U(u), s.disabled = U(u), c.disabled = e;
		}, [() => !U(r).trim() || U(u) || !!U(n) && !U(p)]), wi(a, () => U(m), (e) => L(m, e)), wi(s, () => U(h), (e) => L(h, e)), G("click", c, b), q(e, t);
	};
	Y(we, (e) => {
		U(a) === "json" && e(Te);
	});
	var Ee = B(we, 2), De = B(R(Ee));
	it(De), N(Ee);
	var j = B(Ee, 4), Oe = (e) => {
		var t = _c(), n = R(t, !0);
		N(t), V(() => J(n, U(d))), q(e, t);
	};
	Y(j, (e) => {
		U(d) && e(Oe);
	});
	var M = B(j), ke = (e) => {
		var n = Sc(), r = R(n, !0);
		N(n), V(() => J(r, U(f) || t.view.notice)), q(e, n);
	};
	Y(M, (e) => {
		(U(f) || t.view.notice) && e(ke);
	});
	var Ae = B(M, 2), Me = R(Ae), Ne = B(Me), Pe = R(Ne, !0);
	N(Ne), N(Ae), N(re), N(S), V((e) => {
		J(w, `Active user: ${(t.view.scope.userId || "Unavailable") ?? ""} · Chat: ${(t.view.scope.chatId || "Unavailable") ?? ""}`), D.disabled = U(u), A.disabled = !U(n) || U(u), te.disabled = !U(n) || U(u), ne.disabled = U(u), ae.disabled = !!U(n) || U(u), se.disabled = U(u), le.disabled = !!U(n) || U(u), ge.disabled = U(u), De.disabled = U(u) || !!U(n) && !U(p), Q(De, "placeholder", U(a) === "json" ? "[]" : ""), Ne.disabled = e, J(Pe, U(u) ? "Saving…" : "Save authorization");
	}, [() => !t.actions || !t.view.key || !U(r).trim() || !U(i).trim() || U(u) || !!U(n) && !U(p) || U(s) === "actor-private" && !U(c).trim()]), G("change", D, y), pi(D, () => U(n), (e) => L(n, e)), G("click", A, () => x("load")), G("click", te, () => x("remove")), G("click", ne, () => t.actions?.refresh()), W("submit", re, (e) => {
		e.preventDefault(), x("save");
	}), wi(ae, () => U(r), (e) => L(r, e)), wi(se, () => U(i), (e) => L(i, e)), pi(le, () => U(a), (e) => L(a, e)), pi(ge, () => U(s), (e) => L(s, e)), wi(De, () => U(o), (e) => L(o, e)), G("click", Me, function(...e) {
		t.close?.apply(this, e);
	}), q(e, S), Ue();
}
Cr(["change", "click"]);
//#endregion
//#region ui/RecallArms.svelte
var Tc = /* @__PURE__ */ K("<p class=\"svelte-34wc6n\"> </p>"), Ec = /* @__PURE__ */ K("<p role=\"alert\" class=\"svelte-34wc6n\"> </p>"), Dc = /* @__PURE__ */ K("<p class=\"svelte-34wc6n\">Add a Hotkey Arm node to the assigned unified workflow for the active character, then enable Lattice. Configure the actor, memory set, target and use policy in Details.</p>"), Oc = /* @__PURE__ */ K("<fieldset class=\"svelte-34wc6n\"><legend> </legend> <p class=\"svelte-34wc6n\"> </p> <p class=\"svelte-34wc6n\"> </p> <button type=\"button\"> </button></fieldset>"), kc = /* @__PURE__ */ K("<header class=\"svelte-34wc6n\"><h2>Recall arms</h2><button type=\"button\">Close</button></header> <p class=\"svelte-34wc6n\">Arm a memory set for the next reply, generated swipe, or both. Automatic Recall triggers use the workflow’s own conditions.</p> <!> <!> <!> <!> <p class=\"svelte-34wc6n\"><button type=\"button\">Refresh recall state</button></p> <small class=\"svelte-34wc6n\">Shortcuts use physical keys and do not fire while typing in inputs. Duplicate active shortcuts require a different key. Editing the graph or switching scope revokes old shortcuts.</small>", 1);
function Ac(e, t) {
	He(t, !0);
	let n = /* @__PURE__ */ I(""), r = /* @__PURE__ */ I(""), i = (e) => [
		e.ctrl ? "Ctrl" : "",
		e.alt ? "Alt" : "",
		e.shift ? "Shift" : "",
		e.meta ? "Meta" : "",
		e.code.replace(/^Key|^Digit/u, "")
	].filter(Boolean).join("+");
	async function a(e, i) {
		if (!U(n)) {
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
	var o = kc(), s = z(o), c = B(R(s));
	N(s);
	var l = B(s, 4), u = (e) => {
		var n = Tc(), r = R(n);
		N(n), V(() => J(r, `User ${t.view.scope.userId ?? ""} · Chat ${t.view.scope.chatId ?? ""} · Actor ${t.view.scope.actorId ?? ""}`)), q(e, n);
	};
	Y(l, (e) => {
		t.view.scope && e(u);
	});
	var d = B(l, 2), f = (e) => {
		var n = Ec(), i = R(n, !0);
		N(n), V(() => J(i, U(r) || t.view.issue)), q(e, n);
	};
	Y(d, (e) => {
		(t.view.issue || U(r)) && e(f);
	});
	var p = B(d, 2), m = (e) => {
		q(e, Dc());
	};
	Y(p, (e) => {
		t.view.nodes.length || e(m);
	});
	var h = B(p, 2);
	X(h, 17, () => t.view.nodes, (e) => e.nodeId, (e, r) => {
		var o = Oc(), s = R(o), c = R(s);
		N(s);
		var l = B(s, 2), u = R(l);
		N(l);
		var d = B(l, 2), f = R(d);
		N(d);
		var p = B(d, 2), m = R(p, !0);
		N(p), N(o), V((e) => {
			J(c, `${U(r).memorySetId ?? ""} · ${U(r).armed ? "Armed" : "Disarmed"}`), J(u, `${e ?? ""} · ${U(r).target ?? ""} · ${U(r).uses ?? ""} · consume on ${U(r).consumeOn ?? ""}`), J(f, `Remaining: ${U(r).remaining.reply ? "reply " : ""}${U(r).remaining.swipe ? "swipe" : ""}${!U(r).remaining.reply && !U(r).remaining.swipe ? "none" : ""}. Pending generations: ${U(r).pendingCount ?? ""}.`), Q(p, "aria-label", (U(r).armed ? "Disarm " : "Arm ") + U(r).memorySetId), p.disabled = !!U(n) || !t.actions, J(m, U(n) === U(r).nodeId ? "Updating…" : U(r).armed ? "Disarm" : "Arm");
		}, [() => i(U(r).hotkey)]), G("click", p, () => a(U(r).nodeId, U(r).armed)), q(e, o);
	});
	var g = B(h, 2), _ = R(g);
	N(g), je(2), V(() => _.disabled = !!U(n) || !t.actions), G("click", c, function(...e) {
		t.close?.apply(this, e);
	}), G("click", _, () => t.actions?.refresh()), q(e, o), Ue();
}
Cr(["click"]);
//#endregion
//#region ui/ConfigureNode.svelte
var jc = /* @__PURE__ */ K("<option class=\"svelte-1srbsqt\"> </option>"), Mc = /* @__PURE__ */ K("<p class=\"svelte-1srbsqt\">Authorize a document in Tools › Workflow Data, then reopen node creation.</p>"), Nc = /* @__PURE__ */ K("<label class=\"svelte-1srbsqt\">Workflow data document<select aria-label=\"Workflow data document\" class=\"svelte-1srbsqt\"><option class=\"svelte-1srbsqt\">Choose an authorized target</option><!></select></label><!>", 1), Pc = /* @__PURE__ */ K("<label class=\"svelte-1srbsqt\">Pinned Data helper<select aria-label=\"Pinned Data helper\" class=\"svelte-1srbsqt\"><option class=\"svelte-1srbsqt\">Choose an existing item/result helper</option><!></select></label><p class=\"svelte-1srbsqt\">Helpers use exact pinned versions with Data item and result ports. Set iteration mode and requestBoundPerIteration in the controls below.</p>", 1), Fc = /* @__PURE__ */ K("<p role=\"alert\" class=\"svelte-1srbsqt\"> </p>"), Ic = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay svelte-1srbsqt\"><div class=\"pc-workspace-dialog pc-configure-node svelte-1srbsqt\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Configure node\" tabindex=\"-1\"><header class=\"svelte-1srbsqt\"><h2 class=\"svelte-1srbsqt\"> </h2><button type=\"button\" aria-label=\"Close node configuration\" class=\"svelte-1srbsqt\">×</button></header> <p class=\"svelte-1srbsqt\">Complete the required settings before creating the node. Cancel leaves the graph unchanged.</p> <form class=\"svelte-1srbsqt\"><label class=\"svelte-1srbsqt\">Stage<select aria-label=\"Node stage\" class=\"svelte-1srbsqt\"><option class=\"svelte-1srbsqt\">Preparation</option><option class=\"svelte-1srbsqt\">Response</option></select></label> <!> <!> <label class=\"svelte-1srbsqt\">Declared node controls<textarea aria-label=\"Node controls JSON\" rows=\"14\" maxlength=\"200000\" class=\"svelte-1srbsqt\"></textarea></label> <!> <footer class=\"svelte-1srbsqt\"><button type=\"button\" class=\"svelte-1srbsqt\">Cancel</button><button type=\"submit\" class=\"svelte-1srbsqt\"> </button></footer></form></div></div>");
function Lc(e, t) {
	He(t, !0);
	let n, r = /* @__PURE__ */ I(""), i = /* @__PURE__ */ I("pre"), a = /* @__PURE__ */ I(""), o = /* @__PURE__ */ I(""), s = /* @__PURE__ */ I(!1), c = /* @__PURE__ */ I(""), l = "", u = 0, d = /* @__PURE__ */ P(() => t.view.operation === "read-file" || t.view.operation === "story-clock" || t.view.operation === "commit-outcomes");
	xn(() => {
		if (t.view.key === l) return;
		l = t.view.key, u++, L(r, t.view.controls, !0), L(i, t.view.phase, !0), L(s, !1), L(c, "");
		try {
			let e = JSON.parse(U(r));
			L(a, e.targetId ?? e.clockId ?? "", !0), L(o, t.view.helpers.find((t) => JSON.stringify(t.ref) === JSON.stringify(e.helper))?.key ?? "", !0);
		} catch {
			L(a, ""), L(o, "");
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
			n[e] = t, L(r, JSON.stringify(n, null, 2), !0), L(c, "");
		} catch {
			L(c, "Use a JSON object before selecting a configured value.");
		}
	}
	async function p(e) {
		if (e.preventDefault(), !t.actions || U(s)) return;
		let n = t.view.key, a = ++u;
		L(s, !0), L(c, "");
		try {
			let e = await t.actions.apply(n, U(r), U(i));
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
	var h = Ic(), g = R(h), _ = R(g), v = R(_), y = R(v);
	N(v);
	var b = B(v);
	N(_);
	var x = B(_, 4), S = R(x), C = B(R(S)), w = R(C);
	w.value = w.__value = "pre";
	var T = B(w);
	T.value = T.__value = "post", N(C), N(S);
	var E = B(S, 2), ee = (e) => {
		var n = Nc(), r = z(n), i = B(R(r)), o = R(i);
		o.value = o.__value = "", X(B(o), 17, () => t.view.targets.filter((e) => !["story-clock", "commit-outcomes"].includes(t.view.operation) || e.format === "json"), (e) => e.targetId, (e, t) => {
			var n = jc(), r = R(n);
			N(n);
			var i = {};
			V(() => {
				J(r, `${U(t).name ?? ""} (${U(t).targetId ?? ""})`), i !== (i = U(t).targetId) && (n.value = (n.__value = U(t).targetId) ?? "");
			}), q(e, n);
		}), N(i), N(r);
		var c = B(r), l = (e) => {
			q(e, Mc());
		};
		Y(c, (e) => {
			t.view.targets.length || e(l);
		}), V(() => i.disabled = U(s)), G("change", i, () => f(t.view.operation === "story-clock" ? "clockId" : "targetId", U(a))), pi(i, () => U(a), (e) => L(a, e)), q(e, n);
	};
	Y(E, (e) => {
		U(d) && e(ee);
	});
	var D = B(E, 2), O = (e) => {
		var n = Pc(), r = z(n), i = B(R(r)), a = R(i);
		a.value = a.__value = "", X(B(a), 17, () => t.view.helpers, (e) => e.key, (e, t) => {
			var n = jc(), r = R(n);
			N(n);
			var i = {};
			V(() => {
				J(r, `${U(t).label ?? ""}${U(t).stateful ? " (projected state)" : ""}`), i !== (i = U(t).key) && (n.value = (n.__value = U(t).key) ?? "");
			}), q(e, n);
		}), N(i), N(r), je(), V(() => i.disabled = U(s)), G("change", i, () => {
			let e = t.view.helpers.find((e) => e.key === U(o));
			e && f("helper", e.ref);
		}), pi(i, () => U(o), (e) => L(o, e)), q(e, n);
	};
	Y(D, (e) => {
		t.view.operation === "for-each" && e(O);
	});
	var k = B(D, 2), A = B(R(k));
	it(A), N(k);
	var te = B(k, 2), ne = (e) => {
		var t = Fc(), n = R(t, !0);
		N(t), V(() => J(n, U(c))), q(e, t);
	};
	Y(te, (e) => {
		U(c) && e(ne);
	});
	var re = B(te, 2), ie = R(re), ae = B(ie), oe = R(ae, !0);
	N(ae), N(re), N(x), N(g), $(g, (e) => n = e, () => n), N(h), V(() => {
		J(y, `Configure ${t.view.title ?? ""}`), C.disabled = t.view.phaseLocked || U(s), A.disabled = U(s), ae.disabled = !t.actions || U(s), J(oe, U(s) ? "Preparing…" : "Create node");
	}), W("keydown", g, m, !0), W("paste", g, (e) => e.stopPropagation()), G("click", b, () => t.actions?.cancel(t.view.key)), W("submit", x, p), pi(C, () => U(i), (e) => L(i, e)), wi(A, () => U(r), (e) => L(r, e)), G("click", ie, () => t.actions?.cancel(t.view.key)), q(e, h), Ue();
}
Cr(["click", "change"]);
//#endregion
//#region ui/NewWorkflowPrompt.svelte
var Rc = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay\"><div class=\"pc-workspace-dialog pc-new-workflow-prompt svelte-121ekho\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Save workflow changes?\" tabindex=\"-1\"><h2 class=\"svelte-121ekho\">Save workflow changes?</h2> <p class=\"svelte-121ekho\"><strong class=\"svelte-121ekho\"> </strong> has unsaved changes.</p> <p class=\"svelte-121ekho\">Save downloads workflow JSON before opening a new workflow. Your existing workflow stays in the workspace.</p> <footer class=\"svelte-121ekho\"><button type=\"button\" class=\"svelte-121ekho\">Save</button><button type=\"button\" class=\"svelte-121ekho\">Discard</button><button type=\"button\" class=\"svelte-121ekho\">Cancel</button></footer></div></div>");
function zc(e, t) {
	He(t, !0);
	let n, r;
	ki(() => {
		let e = document.activeElement;
		return r.focus({ preventScroll: !0 }), () => e?.focus({ preventScroll: !0 });
	});
	function i(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), t.actions?.choose("cancel")), e.key === "Tab") {
			let t = [...n.querySelectorAll("button:not(:disabled)")], r = t.indexOf(document.activeElement);
			e.shiftKey && r <= 0 && (e.preventDefault(), t.at(-1)?.focus()), !e.shiftKey && (r < 0 || r === t.length - 1) && (e.preventDefault(), t[0]?.focus());
		}
	}
	var a = Rc(), o = R(a), s = B(R(o), 2), c = R(s), l = R(c, !0);
	N(c), je(), N(s);
	var u = B(s, 4), d = R(u), f = B(d), p = B(f);
	$(p, (e) => r = e, () => r), N(u), N(o), $(o, (e) => n = e, () => n), N(a), V(() => J(l, t.view.name)), W("keydown", o, i, !0), W("paste", o, (e) => e.stopPropagation(), !0), G("click", d, () => t.actions?.choose("save")), G("click", f, () => t.actions?.choose("discard")), G("click", p, () => t.actions?.choose("cancel")), q(e, a), Ue();
}
Cr(["click"]);
//#endregion
//#region ui/NodeSearch.svelte
var Bc = /* @__PURE__ */ K("<label class=\"pc-context-check svelte-golf61\"><input type=\"checkbox\" class=\"svelte-golf61\"/>Context sensitive</label>"), Vc = /* @__PURE__ */ K("<span class=\"pc-search-context svelte-golf61\"> </span>"), Hc = /* @__PURE__ */ K("<label class=\"pc-search-field svelte-golf61\"><input type=\"search\" aria-label=\"Search nodes and subgraphs\" placeholder=\"Search…\" autocomplete=\"off\" role=\"combobox\" aria-expanded=\"true\" class=\"svelte-golf61\"/></label> <!> <!>", 1), Uc = /* @__PURE__ */ K("<p class=\"pc-search-context svelte-golf61\">Choose the named port to connect.</p>"), Wc = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-search-result svelte-golf61\" role=\"option\"><span class=\"svelte-golf61\"> </span> <span class=\"pc-family svelte-golf61\"> </span></button>"), Gc = /* @__PURE__ */ K("<p class=\"pc-empty svelte-golf61\">No nodes match.</p>"), Kc = /* @__PURE__ */ K("<p class=\"pc-feedback svelte-golf61\" role=\"status\"> </p>"), qc = /* @__PURE__ */ K("<div class=\"pc-node-search svelte-golf61\" role=\"dialog\" aria-modal=\"false\" tabindex=\"-1\"><!> <div class=\"pc-search-results svelte-golf61\" role=\"listbox\"></div> <!></div>");
function Jc(e, t) {
	let n = Fr();
	He(t, !0);
	let r = Oi(t, "view", 3, null), i = Oi(t, "actions", 19, () => ({})), a = /* @__PURE__ */ I(void 0), o = /* @__PURE__ */ I(void 0), s = /* @__PURE__ */ I(""), c = /* @__PURE__ */ I(0), l = /* @__PURE__ */ I(8), u = /* @__PURE__ */ I(8), d, f, p = (e) => [
		e.label,
		e.family,
		e.purpose ?? "",
		e.shortcode ?? "",
		...e.searchAliases ?? []
	].join(" ").toLocaleLowerCase(), m = /* @__PURE__ */ P(() => (r()?.choices ?? []).filter((e) => p(e).includes(U(s).toLocaleLowerCase().trim()))), h = /* @__PURE__ */ P(() => r()?.mode === "ports" ? r().ports : U(m)), g = (e) => "id" in e ? e.id : e.portId, _ = (e) => !!r()?.readOnly || "disabledReason" in e && !!e.disabledReason, v = /* @__PURE__ */ P(() => U(h).filter((e) => !_(e))), y = /* @__PURE__ */ P(() => U(v)[Math.min(U(c), Math.max(0, U(v).length - 1))]), b = (e) => ({
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
		L(l, Math.max(8, Math.min(r().screenAnchor.x, t - e.width - 8)), !0), L(u, Math.max(8, Math.min(r().screenAnchor.y, n - e.height - 8)), !0);
	}
	xn(() => {
		let e = r()?.key, t = r()?.mode, n = r()?.screenAnchor;
		if (e === void 0 || !n) return;
		let i = d !== e || f !== t;
		d !== e && L(s, ""), i && L(c, 0), d = e, f = t, dr().then(() => {
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
		].includes(e.key) ? (e.preventDefault(), L(c, e.key === "Home" ? 0 : e.key === "End" ? Math.max(0, U(v).length - 1) : U(v).length ? (U(c) + (e.key === "ArrowDown" ? 1 : -1) + U(v).length) % U(v).length : 0, !0)) : e.key === "Enter" && (e.preventDefault(), S(U(y)));
	}
	xn(() => {
		if (!r()) return;
		let e = (e) => {
			U(a) && !U(a).contains(e.target) && i().dismiss?.();
		};
		return window.addEventListener("pointerdown", e, !0), () => window.removeEventListener("pointerdown", e, !0);
	});
	var T = Pr();
	W("resize", nn, x);
	var E = z(T), ee = (e) => {
		var t = qc();
		let i;
		var d = R(t), f = (e) => {
			var t = Hc(), i = z(t), a = R(i);
			Z(a), $(a, (e) => L(o, e), () => U(o)), N(i);
			var l = B(i, 2), u = (e) => {
				var t = Bc(), n = R(t);
				Z(n), je(), N(t), V(() => {
					bi(n, r().contextSensitive), n.disabled = r().readOnly;
				}), G("change", n, C), q(e, t);
			};
			Y(l, (e) => {
				r().origin && e(u);
			});
			var d = B(l, 2), f = (e) => {
				var t = Vc(), n = R(t, !0);
				N(t), V(() => J(n, (r().origin.dir === "out" ? "Accepts " : "Produces ") + r().origin.kind)), q(e, t);
			};
			Y(d, (e) => {
				r().origin && e(f);
			}), V((e) => {
				Q(a, "aria-controls", n + "-results"), Q(a, "aria-activedescendant", e);
			}, [() => U(y) ? n + "-item-" + U(h).indexOf(U(y)) : void 0]), G("input", a, () => L(c, 0)), wi(a, () => U(s), (e) => L(s, e)), q(e, t);
		}, p = (e) => {
			q(e, Uc());
		};
		Y(d, (e) => {
			r().mode === "nodes" ? e(f) : e(p, -1);
		});
		var m = B(d, 2);
		X(m, 21, () => U(h), (e) => g(e), (e, t) => {
			var r = Wc(), i = R(r), a = R(i, !0);
			N(i);
			var o = B(i, 1, !0);
			o.nodeValue = " ";
			var s = B(o);
			let l;
			var u = R(s, !0);
			N(s), N(r), V((e, n, i, o) => {
				Q(r, "aria-selected", U(y) === U(t)), Q(r, "id", e), Q(r, "data-choice", "id" in U(t) ? U(t).id : void 0), Q(r, "data-port", "portId" in U(t) ? U(t).portId : void 0), r.disabled = n, Q(r, "title", "disabledReason" in U(t) ? U(t).disabledReason : void 0), J(a, i), l = ui(s, "", l, o), J(u, "family" in U(t) ? U(t).family : U(t).kind);
			}, [
				() => n + "-item-" + U(h).indexOf(U(t)),
				() => _(U(t)),
				() => U(t).label || g(U(t)),
				() => ({ color: "family" in U(t) ? b(U(t).family) : void 0 })
			]), G("click", r, () => S(U(t))), W("focus", r, () => {
				let e = U(v).indexOf(U(t));
				e >= 0 && L(c, e, !0);
			}), q(e, r);
		}, (e) => {
			q(e, Gc());
		}), N(m);
		var x = B(m, 2), T = (e) => {
			var t = Kc(), n = R(t, !0);
			N(t), V(() => J(n, r().feedback)), q(e, t);
		};
		Y(x, (e) => {
			r().feedback && e(T);
		}), N(t), $(t, (e) => L(a, e), () => U(a)), V(() => {
			Q(t, "aria-label", r().mode === "ports" ? "Choose connection port" : "Add node"), i = ui(t, "", i, {
				left: `${U(l) ?? ""}px`,
				top: `${U(u) ?? ""}px`
			}), Q(m, "id", n + "-results"), Q(m, "aria-label", r().mode === "ports" ? "Compatible ports" : "Nodes and subgraphs");
		}), G("keydown", t, w), q(e, t);
	};
	Y(E, (e) => {
		r() && e(ee);
	}), q(e, T), Ue();
}
Cr([
	"keydown",
	"input",
	"change",
	"click"
]);
//#endregion
//#region ui/PinMenu.svelte
var Yc = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-pin-action svelte-i73q0t\"> </button>"), Xc = /* @__PURE__ */ K("<p class=\"pc-empty svelte-i73q0t\">No attached links.</p>"), Zc = /* @__PURE__ */ K("<div class=\"pc-pin-menu svelte-i73q0t\" role=\"dialog\" aria-label=\"Pin actions\" aria-modal=\"false\" tabindex=\"-1\"><div class=\"pc-menu-head svelte-i73q0t\"><h2 class=\"svelte-i73q0t\"> </h2><button type=\"button\" aria-label=\"Close pin actions\" class=\"svelte-i73q0t\">Close</button></div> <p class=\"pc-kind svelte-i73q0t\"> </p> <!></div>");
function Qc(e, t) {
	He(t, !0);
	let n = Oi(t, "view", 3, null), r = Oi(t, "actions", 19, () => ({})), i = /* @__PURE__ */ I(void 0), a = /* @__PURE__ */ I(8), o = /* @__PURE__ */ I(8), s, c = (e) => !!e.disabled || !!n()?.readOnly && e.capability !== "navigation";
	function l() {
		if (!n() || !U(i)) return;
		let e = U(i).getBoundingClientRect(), t = document.documentElement.clientWidth || window.innerWidth, r = document.documentElement.clientHeight || window.innerHeight;
		L(a, Math.max(8, Math.min(n().screenAnchor.x, t - e.width - 8)), !0), L(o, Math.max(8, Math.min(n().screenAnchor.y, r - e.height - 8)), !0);
	}
	xn(() => {
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
	W("resize", nn, l);
	var p = z(f), m = (e) => {
		var t = Zc();
		let s;
		var l = R(t), f = R(l), p = R(f, !0);
		N(f);
		var m = B(f);
		N(l);
		var h = B(l, 2), g = R(h);
		N(h), X(B(h, 2), 17, () => n().entries, (e) => e.id, (e, t) => {
			var n = Yc(), r = R(n, !0);
			N(n), V((e) => {
				Q(n, "data-entry", U(t).id), n.disabled = e, Q(n, "title", U(t).reason), J(r, U(t).label);
			}, [() => c(U(t))]), G("click", n, () => u(U(t))), q(e, n);
		}, (e) => {
			q(e, Xc());
		}), N(t), $(t, (e) => L(i, e), () => U(i)), V(() => {
			s = ui(t, "", s, {
				left: `${U(a) ?? ""}px`,
				top: `${U(o) ?? ""}px`
			}), J(p, n().title), J(g, `${n().kind ?? ""}${n().readOnly ? " · Read only" : ""}`);
		}), G("keydown", t, d), G("click", m, () => r().dismiss?.()), q(e, t);
	};
	Y(p, (e) => {
		n() && e(m);
	}), q(e, f), Ue();
}
Cr(["keydown", "click"]);
//#endregion
//#region src/ui/node-palette.js
var $c = "M3 7 12 2l9 5v10l-9 5-9-5ZM3 7l9 5 9-5M12 12v10", el = "M3 6l4-2 4 2v5l-4 2-4-2ZM3 6l4 2 4-2M7 8v5M13 6l4-2 4 2v5l-4 2-4-2ZM13 6l4 2 4-2M17 8v5M8 15l4-2 4 2v5l-4 2-4-2ZM8 15l4 2 4-2M12 17v5", tl = Object.freeze([
	{
		name: "Input",
		color: "#96ad52",
		icon: $c
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
		icon: $c
	},
	{
		name: "Subgraphs",
		color: "#a3aa99",
		icon: el
	}
].map((e) => Object.freeze(e))), nl = {
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
	Library: el,
	Routing: "M3 12h18m-7-7 7 7-7 7",
	Blocks: $c,
	Reflect: "M21 12s-4-7-9-7-9 7-9 7 4 7 9 7 9-7 9-7ZM15 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0",
	Internalize: "M4 4h16v16H4M8 8l4 4 4-4M12 12v5",
	Express: "M4 4h16v12H9l-5 4ZM8 8h8M8 12h5",
	Memory: "M5 3h14v18H5ZM8 7h8M8 11h8M8 15h5",
	State: "M3 12h4l3-7 4 14 3-7h4"
}, rl = Object.freeze(Object.fromEntries(Object.entries(nl).map(([e, t]) => [e, Object.freeze({
	name: e,
	icon: t
})]))), il = {
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
		nl.Planning
	],
	compose: [
		"Assembly",
		"co",
		nl.Assembly
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
		nl.Validation
	],
	"json-decode": [
		"Parsing",
		"jd",
		nl.Parsing
	],
	"select-fields": [
		"Extraction",
		"sf",
		nl.Extraction
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
		nl.Delivery
	],
	reroute: [
		"Routing",
		"rt",
		nl.Routing
	],
	reflect: [
		"Reflect",
		"rf",
		nl.Reflect
	],
	internalize: [
		"Internalize",
		"in",
		nl.Internalize
	],
	express: [
		"Express",
		"ex",
		nl.Express
	],
	context: [
		"Context",
		"cx",
		nl.Context
	],
	memory: [
		"Memory",
		"mm",
		nl.Memory
	],
	state: [
		"State",
		"sv",
		nl.State
	]
}, al = Object.freeze(Object.fromEntries(Object.entries(il).map(([e, [t, n, r]]) => [e, Object.freeze({
	group: t,
	shortcode: n,
	icon: r
})]))), ol = Object.freeze({
	group: "Blocks",
	shortcode: "",
	icon: $c
}), sl = (e) => Object.hasOwn(al, e) ? al[e] : ol, cl = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-family-row\" aria-haspopup=\"menu\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path></path></svg><span> </span></button>"), ll = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\">‹ Families</button>"), ul = /* @__PURE__ */ K("<input class=\"text_pole\" aria-label=\"Search nodes\" placeholder=\"Search nodes…\"/>"), dl = /* @__PURE__ */ K("<div class=\"pc-shelf-group svelte-hk6fzp\" role=\"presentation\"> </div>"), fl = /* @__PURE__ */ K("<!> <button type=\"button\" role=\"menuitem\" class=\"svelte-hk6fzp\"><svg class=\"pc-leaf-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path></path></svg><span class=\"pc-catalog-name\"> </span><small> </small></button>", 1), pl = /* @__PURE__ */ K("<div role=\"menu\" tabindex=\"-1\"><!> <!> <!></div>"), ml = /* @__PURE__ */ K("<div class=\"pc-shelf-menu pc-shelf-subgraph-menu svelte-hk6fzp\" role=\"menu\" tabindex=\"-1\"><button type=\"button\" role=\"menuitem\" data-shelf-subgraph-action=\"open\">Open saved definition</button> <button type=\"button\" role=\"menuitem\" data-shelf-subgraph-action=\"delete\">Delete</button></div>"), hl = /* @__PURE__ */ K("<div class=\"pc-shelf-drag-preview svelte-hk6fzp\" aria-hidden=\"true\"> </div>"), gl = /* @__PURE__ */ K("<nav aria-label=\"Node families\"></nav> <!> <!> <!>", 1);
function _l(e, t) {
	He(t, !0);
	let n = Oi(t, "choices", 19, () => []), r = Oi(t, "readOnly", 3, !1), i, a = /* @__PURE__ */ I(null), o = /* @__PURE__ */ I(""), s = /* @__PURE__ */ I(!1), c = /* @__PURE__ */ I(""), l = /* @__PURE__ */ I(!1), u = /* @__PURE__ */ I(0), d = /* @__PURE__ */ I(0), f = null, p = 0, m = /* @__PURE__ */ I(null), h = /* @__PURE__ */ I(null), g = null, _ = tl.map((e) => e.name), v = (e) => tl.find((t) => t.name === e)?.color, y = null, b = null, x = null, S = /* @__PURE__ */ I(null);
	function C() {
		b !== null && clearTimeout(b), b = null;
		let e = y;
		y = null, L(S, null), document.body.classList.remove("pc-shelf-dragging"), e?.button.hasPointerCapture?.(e.pointerId) && e.button.releasePointerCapture(e.pointerId);
	}
	function w() {
		y && (b !== null && clearTimeout(b), b = null, x = y.button, document.body.classList.add("pc-shelf-dragging"), L(S, {
			title: y.entry.title,
			family: y.entry.family,
			...y.point
		}, !0));
	}
	function T(e, t) {
		if (e.button !== 0 || e.isPrimary === !1 || y || r() || !O(t.family).find((e) => e.id === t.id)?.compatible) return;
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
		}, !U(S) && Math.hypot(e.clientX - y.start.x, e.clientY - y.start.y) >= 5 && w(), U(S) && (e.preventDefault(), L(S, {
			...U(S),
			...y.point
		}, !0)));
	}
	function ee(e) {
		if (!y || e.pointerId !== y.pointerId) return;
		let t = y.entry, n = !!U(S), r = n ? document.elementFromPoint(e.clientX, e.clientY) : null, a = i.closest(".pc-canvas-area")?.querySelector(".pc-canvas-host");
		C(), n && (e.preventDefault(), e.stopPropagation(), r && a?.contains(r) && oe(t, {
			x: e.clientX,
			y: e.clientY
		}));
	}
	function D(e, t) {
		e.currentTarget === x && e.detail !== 0 ? x = null : oe(t);
	}
	function O(e = U(o)) {
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
			let i = n.id.startsWith("operation:") ? n.id.split(":")[1] : "", a = sl(i), o = i ? n.label.split(" · ")[0] : n.label, s = n.id.startsWith("boundary:");
			return {
				...n,
				title: o,
				compatible: !n.disabledReason && !!t.choose,
				shortcode: i ? a.shortcode || n.shortcode || "" : n.shortcode ?? a.shortcode,
				group: e === "Subgraphs" ? s ? "Interface" : "Library" : void 0,
				icon: e === "Subgraphs" ? s ? rl.Routing.icon : rl.Library.icon : a.icon,
				searchAliases: r
			};
		});
	}
	function k(e = !1) {
		L(m, null), e && g?.focus({ preventScroll: !0 });
	}
	function A(e = !1) {
		C(), p++, L(o, ""), L(s, !1), k(), e && f?.focus({ preventScroll: !0 });
	}
	xn(() => (t.view?.graphId, n(), r(), () => A()));
	function te() {
		let e = i.closest(".pc-canvas-area"), t = e.getBoundingClientRect();
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
		if (y) return;
		if (k(), U(o) === e) {
			n && U(a)?.querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
			return;
		}
		let r = ++p;
		if (L(o, e, !0), L(s, !1), f = t, await dr(), r !== p || U(o) !== e || !U(a)?.isConnected) return;
		let i = t.getBoundingClientRect(), c = U(a).getBoundingClientRect(), m = ne({
			top: re(i, U(a), c),
			left: i.left,
			right: i.right
		}, c.width, c.height, 128);
		L(u, m.x, !0), L(d, m.y, !0), L(l, m.compact, !0), n && U(a).querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
	}
	async function ae() {
		let e = ++p;
		if (L(o, ""), L(s, !0), L(c, ""), await dr(), e !== p || !U(s) || !U(a)?.isConnected) return;
		let t = te();
		L(u, Math.min(136, Math.max(4, t.width - 254)), !0), L(d, 13), U(a).querySelector("input")?.focus();
	}
	function oe(e, n) {
		let i = O(e.family).find((t) => t.id === e.id);
		i?.compatible && !r() && (A(!0), n ? t.choose?.(i.id, n) : t.choose?.(i.id));
	}
	async function se(e, n) {
		let r = O("Subgraphs").find((t) => t.id === e.dataset.shelfChoice);
		if (!r?.definitionRef || !t.shelfSubgraph) return;
		let i = te(), a = e.getBoundingClientRect();
		if (g = e, L(m, {
			id: r.id,
			title: r.title,
			x: (n?.x ?? a.right) - i.left,
			y: (n?.y ?? a.top) - i.top
		}, !0), await dr(), !U(m) || U(m).id !== r.id || !U(h)?.isConnected) return;
		let o = U(h).getBoundingClientRect();
		L(m, {
			...U(m),
			x: Math.max(4, Math.min(U(m).x, i.width - o.width - 4)),
			y: Math.max(4, Math.min(U(m).y, i.height - o.height - 4))
		}, !0), U(h).querySelector("button")?.focus({ preventScroll: !0 });
	}
	function ce(e) {
		let n = e.target.closest("[data-shelf-choice]");
		n && O("Subgraphs").some((e) => e.id === n.dataset.shelfChoice && e.definitionRef) && t.shelfSubgraph && (e.preventDefault(), e.stopPropagation(), se(n, {
			x: e.clientX,
			y: e.clientY
		}));
	}
	function le(e) {
		let n = O("Subgraphs").find((e) => e.id === U(m)?.id);
		A(!0), n?.definitionRef && t.shelfSubgraph?.(n.id, e);
	}
	function ue(e) {
		if ((e.key === "ContextMenu" || e.key === "F10" && e.shiftKey) && e.target.dataset.shelfChoice) {
			e.preventDefault(), e.stopPropagation(), se(e.target);
			return;
		}
		if (U(m) && e.key === "Escape") {
			e.preventDefault(), e.stopPropagation(), k(!0);
			return;
		}
		if (e.key === "Escape") {
			e.preventDefault(), e.stopPropagation(), A(!0);
			return;
		}
		let t = e.target;
		if (e.key === "ArrowRight" && t.dataset.family && !t.disabled) {
			e.preventDefault(), e.stopPropagation(), ie(t.dataset.family, t);
			return;
		}
		if (e.key === "ArrowLeft" && U(o)) {
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
		let n = [...(e.target.closest("[role=\"menu\"]") || i).querySelectorAll("button:not(:disabled)")], r = n.indexOf(e.target);
		n[e.key === "Home" ? 0 : e.key === "End" ? n.length - 1 : (r + (e.key === "ArrowUp" ? n.length - 1 : 1)) % n.length]?.focus();
	}
	var de = { openSearch: ae }, fe = gl();
	W("pointerdown", nn, (e) => {
		e.target.closest(".pc-node-shelf, .pc-shelf-menu") || A();
	}), W("pointermove", nn, E), W("pointerup", nn, ee), W("pointercancel", nn, () => C()), W("blur", nn, () => A()), W("resize", nn, () => A()), W("keydown", nn, (e) => {
		y && e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), A(!0));
	});
	var pe = z(fe);
	X(pe, 21, () => tl, Wr, (e, t) => {
		var n = cl();
		let r;
		var i = R(n), a = R(i);
		N(i);
		var s = B(i), c = R(s, !0);
		N(s), N(n), V((e) => {
			Q(n, "data-family", U(t).name), n.disabled = e, Q(n, "title", "Browse " + U(t).name + " nodes"), Q(n, "aria-expanded", U(o) === U(t).name), r = ui(n, "", r, { "--pc-family": U(t).color }), Q(a, "d", U(t).icon), J(c, U(t).name);
		}, [() => !O(U(t).name).length]), G("click", n, (e) => ie(U(t).name, e.currentTarget)), W("pointerenter", n, (e) => {
			e.pointerType !== "touch" && !e.currentTarget.disabled && ie(U(t).name, e.currentTarget, !1);
		}), G("keydown", n, ue), q(e, n);
	}), N(pe), $(pe, (e) => i = e, () => i);
	var me = B(pe, 2), he = (e) => {
		let n = /* @__PURE__ */ P(() => U(s) ? _.flatMap((e) => O(e)).filter((e) => [
			e.title,
			e.id,
			e.family,
			e.purpose,
			e.shortcode,
			...e.searchAliases ?? []
		].join(" ").toLowerCase().includes(U(c).toLowerCase())) : O());
		var i = pl();
		let f;
		var p = R(i), m = (e) => {
			var t = ll();
			G("click", t, () => A(!0)), q(e, t);
		};
		Y(p, (e) => {
			U(l) && U(o) && e(m);
		});
		var h = B(p, 2), g = (e) => {
			var t = ul();
			Z(t), wi(t, () => U(c), (e) => L(c, e)), q(e, t);
		};
		Y(h, (e) => {
			U(s) && e(g);
		}), X(B(h, 2), 19, () => U(n), (e) => e.family + e.id, (e, i, a) => {
			let o = /* @__PURE__ */ P(() => !U(i).compatible || r()), c = /* @__PURE__ */ P(() => !!U(i).definitionRef && !!t.shelfSubgraph);
			var l = fl(), u = z(l), d = (e) => {
				var t = dl(), n = R(t, !0);
				N(t), V(() => {
					Q(t, "data-shelf-group", U(i).group), J(n, U(i).group);
				}), q(e, t);
			};
			Y(u, (e) => {
				!U(s) && U(i).group && U(n)[U(a) - 1]?.group !== U(i).group && e(d);
			});
			var f = B(u, 2);
			let p;
			var m = R(f), h = R(m);
			N(m);
			var g = B(m), _ = R(g, !0);
			N(g);
			var y = B(g), b = R(y, !0);
			N(y), N(f), V((e) => {
				Q(f, "data-shelf-choice", U(i).id), Q(f, "data-insertion-disabled", U(o)), f.disabled = U(o) && !U(c), Q(f, "aria-disabled", U(o) && !U(c)), Q(f, "aria-haspopup", U(c) ? "menu" : void 0), Q(f, "title", r() ? U(c) ? "This graph is read-only. Right-click for subgraph actions." : "This graph is read-only." : U(i).disabledReason || (U(i).compatible ? U(i).purpose || "Add " + U(i).title : "Requires the " + U(i).phase + " phase")), p = ui(f, "", p, e), Q(h, "d", U(i).icon), J(_, U(i).title), J(b, U(i).shortcode);
			}, [() => ({ "--pc-family": v(U(i).family) })]), G("pointerdown", f, (e) => T(e, U(i))), W("lostpointercapture", f, () => C()), G("click", f, (e) => D(e, U(i))), q(e, l);
		}), N(i), $(i, (e) => L(a, e), () => U(a)), V((e) => {
			ci(i, 1, `pc-shelf-menu ${U(s) ? "pc-leaf-menu" : "pc-family-menu"}`, "svelte-hk6fzp"), Q(i, "aria-label", U(s) ? "Search nodes" : U(o) + " nodes"), f = ui(i, "", f, e);
		}, [() => ({
			left: `${U(u)}px`,
			top: `${U(d)}px`,
			"--pc-family": v(U(o))
		})]), G("keydown", i, ue), G("contextmenu", i, ce), q(e, i);
	};
	Y(me, (e) => {
		(U(o) || U(s)) && e(he);
	});
	var ge = B(me, 2), _e = (e) => {
		var t = ml();
		let n;
		var r = R(t), i = B(r, 2);
		N(t), $(t, (e) => L(h, e), () => U(h)), V(() => {
			Q(t, "aria-label", U(m).title + " actions"), n = ui(t, "", n, {
				left: `${U(m).x}px`,
				top: `${U(m).y}px`
			});
		}), G("keydown", t, ue), G("click", r, () => le("open")), G("click", i, () => le("delete")), q(e, t);
	};
	Y(ge, (e) => {
		U(m) && e(_e);
	});
	var ve = B(ge, 2), ye = (e) => {
		var t = hl();
		let n;
		var r = R(t, !0);
		N(t), V((e) => {
			n = ui(t, "", n, e), J(r, U(S).title);
		}, [() => ({
			"--pc-family": v(U(S).family),
			left: `${U(S).x + 12}px`,
			top: `${U(S).y + 12}px`
		})]), q(e, t);
	};
	return Y(ve, (e) => {
		U(S) && e(ye);
	}), V(() => ci(pe, 1, `pc-node-shelf${U(l) && U(o) ? " pc-shelf-replaced" : ""}`, "svelte-hk6fzp")), q(e, fe), Ue(de);
}
Cr([
	"click",
	"keydown",
	"contextmenu",
	"pointerdown"
]);
//#endregion
//#region ui/ExamplesBrowser.svelte
var vl = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-btn menu_button svelte-18p7ib8\">Retry</button>"), yl = /* @__PURE__ */ K("<div class=\"pc-examples-issue svelte-18p7ib8\" role=\"alert\"><span class=\"svelte-18p7ib8\"> </span><!></div>"), bl = /* @__PURE__ */ Mr("<g class=\"pc-example-comment svelte-18p7ib8\"><rect rx=\"4\" class=\"svelte-18p7ib8\"></rect><text class=\"svelte-18p7ib8\"> </text></g>"), xl = /* @__PURE__ */ Mr("<path class=\"pc-wire pc-wire-native svelte-18p7ib8\"></path>"), Sl = /* @__PURE__ */ Mr("<circle class=\"pc-example-pin-dot svelte-18p7ib8\" r=\"4\"></circle><path class=\"pc-example-pin-cue svelte-18p7ib8\"></path><text class=\"pc-example-pin-label svelte-18p7ib8\"> </text>", 1), Cl = /* @__PURE__ */ Mr("<g><rect class=\"pc-example-card svelte-18p7ib8\" rx=\"4\"></rect><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\"><path class=\"pc-example-icon svelte-18p7ib8\"></path></svg><text class=\"pc-example-node-title svelte-18p7ib8\" lengthAdjust=\"spacingAndGlyphs\"> </text><!></g>"), wl = /* @__PURE__ */ Mr("<svg class=\"pc-example-preview svelte-18p7ib8\" preserveAspectRatio=\"xMidYMid meet\" aria-hidden=\"true\" focusable=\"false\"><!><!><!></svg>"), Tl = /* @__PURE__ */ K("<span class=\"pc-example-unavailable-preview svelte-18p7ib8\"><strong class=\"svelte-18p7ib8\">Unavailable</strong><span class=\"svelte-18p7ib8\"> </span></span>"), El = /* @__PURE__ */ K("<button type=\"button\"><!> <span class=\"pc-example-title svelte-18p7ib8\"> </span></button>"), Dl = /* @__PURE__ */ K("<!> <div class=\"pc-examples-grid svelte-18p7ib8\"></div>", 1);
function Ol(e, t) {
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
	}, r = Oi(t, "examples", 19, () => []), i = Oi(t, "issue", 3, ""), a = Oi(t, "scrollTop", 3, 0), o, s = /* @__PURE__ */ I("");
	ki(() => {
		o.scrollTop = a();
	});
	async function c(e) {
		if (!U(s)) {
			L(s, e, !0);
			try {
				await t.open(e);
			} finally {
				L(s, "");
			}
		}
	}
	var l = Dl(), u = z(l), d = (e) => {
		var n = yl(), r = R(n), a = R(r, !0);
		N(r);
		var o = B(r), s = (e) => {
			var n = vl();
			G("click", n, () => t.retry?.()), q(e, n);
		};
		Y(o, (e) => {
			t.retry && e(s);
		}), N(n), V(() => J(a, i())), q(e, n);
	};
	Y(u, (e) => {
		i() && e(d);
	});
	var f = B(u, 2);
	X(f, 21, r, (e) => e.id, (e, t) => {
		let r = /* @__PURE__ */ P(() => U(t).thumbnail);
		var i = El();
		let a;
		var o = R(i), l = (e) => {
			var t = wl(), i = R(t);
			X(i, 17, () => U(r).comments, (e) => e.id, (e, t) => {
				var n = bl(), r = R(n);
				let i;
				var a = B(r), o = R(a, !0);
				N(a), N(n), V(() => {
					Q(n, "data-id", U(t).id), Q(r, "x", U(t).x), Q(r, "y", U(t).y), Q(r, "width", U(t).w), Q(r, "height", U(t).h), i = ui(r, "", i, { stroke: U(t).color }), Q(a, "x", U(t).x + 12), Q(a, "y", U(t).y + 24), J(o, U(t).title);
				}), q(e, n);
			});
			var a = B(i);
			X(a, 17, () => U(r).wires, (e) => e.id, (e, t) => {
				var n = xl();
				V(() => {
					Q(n, "data-kind", U(t).kind), Q(n, "data-id", U(t).id), Q(n, "d", U(t).d);
				}), q(e, n);
			}), X(B(a), 17, () => U(r).nodes, (e) => e.id, (e, t) => {
				var r = Cl(), i = R(r), a = B(i), o = R(a);
				N(a);
				var s = B(a), c = R(s, !0);
				N(s), X(B(s), 17, () => U(t).ports, (e) => e.id, (e, t) => {
					var r = Sl(), i = z(r), a = B(i), o = B(a), s = R(o, !0);
					N(o), V(() => {
						Q(i, "data-kind", U(t).kind), Q(i, "cx", U(t).x), Q(i, "cy", U(t).y), Q(a, "data-kind", U(t).kind), Q(a, "transform", `translate(${U(t).x} ${U(t).y})`), Q(a, "d", n[U(t).kind] ?? n.context), Q(o, "x", U(t).x + (U(t).dir === "in" ? 9 : -9)), Q(o, "y", U(t).y + 4), Q(o, "text-anchor", U(t).dir === "in" ? "start" : "end"), J(s, U(t).label);
					}), q(e, r);
				}), N(r), V(() => {
					ci(r, 0, ni(U(t).className), "svelte-18p7ib8"), Q(r, "data-id", U(t).id), Q(i, "x", U(t).x), Q(i, "y", U(t).y), Q(i, "width", U(t).w), Q(i, "height", U(t).h), Q(a, "x", U(t).x + 8), Q(a, "y", U(t).y + 7), Q(o, "d", U(t).iconPath), Q(s, "x", U(t).x + 28), Q(s, "y", U(t).y + 20), Q(s, "textLength", U(t).title.length * 6 > U(t).w - 36 ? U(t).w - 36 : void 0), J(c, U(t).title);
				}), q(e, r);
			}), N(t), V(() => Q(t, "viewBox", `${U(r).bounds.x} ${U(r).bounds.y} ${U(r).bounds.w} ${U(r).bounds.h}`)), q(e, t);
		}, u = (e) => {
			var n = Tl(), r = B(R(n)), i = R(r, !0);
			N(r), N(n), V(() => {
				Q(r, "id", `pc-example-issue-${U(t).number}`), J(i, U(t).issue);
			}), q(e, n);
		};
		Y(o, (e) => {
			U(r) ? e(l) : e(u, -1);
		});
		var d = B(o, 2), f = R(d, !0);
		N(d), N(i), V(() => {
			a = ci(i, 1, "pc-example-tile svelte-18p7ib8", null, a, { "pc-example-unavailable": !U(r) }), Q(i, "aria-label", U(t).title), Q(i, "aria-describedby", U(t).issue ? `pc-example-issue-${U(t).number}` : void 0), Q(i, "title", U(t).issue || U(t).goal), i.disabled = !!U(s) || !U(r), J(f, U(t).title);
		}), G("click", i, () => c(U(t).id)), q(e, i);
	}), N(f), $(f, (e) => o = e, () => o), V(() => Q(f, "aria-busy", !!U(s))), W("scroll", f, () => t.scroll(o.scrollTop)), q(e, l), Ue();
}
Cr(["click"]);
//#endregion
//#region ui/ImportReview.svelte
var kl = /* @__PURE__ */ K("<p> </p>"), Al = /* @__PURE__ */ K("<li> </li>"), jl = /* @__PURE__ */ K("<h3>Saved bindings to review</h3><ul></ul>", 1), Ml = /* @__PURE__ */ K("<p>Saved model metadata is present. Review local connections before running.</p>"), Nl = /* @__PURE__ */ K("<h3>Imported terminal effects</h3><ul></ul>", 1), Pl = /* @__PURE__ */ K("<p>No imported terminal effects.</p>"), Fl = /* @__PURE__ */ K("<p role=\"alert\"> </p>"), Il = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-btn menu_button\">Prepare again</button>"), Ll = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay pc-import-overlay\"><div class=\"pc-workspace-dialog pc-import-review\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Import into graph\" tabindex=\"-1\"><header><h2>Import into graph</h2><button type=\"button\" class=\"pc-btn menu_button\" aria-label=\"Cancel import\">×</button></header> <p><strong> </strong> <small> </small></p> <dl><dt>Phase</dt><dd> </dd><dt>Additions</dt><dd> </dd><dt>Conservative request bound</dt><dd> </dd></dl> <p class=\"pc-import-explanation\">This authoring bound includes unfinished branches. Bindings and reachable execution are checked when you explicitly run the workflow.</p> <!> <!> <!> <p>Insertion keeps internal wiring and relative layout. It does not connect matching names, arm or assign the graph, run requests, publish Guidance, or Apply a reply.</p> <!> <footer><button type=\"button\" class=\"pc-btn menu_button\">Cancel</button><!><button type=\"button\" class=\"pc-btn menu_button pc-import-accept\">Insert into graph</button></footer></div></div>");
function Rl(e, t) {
	He(t, !0);
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
	var i = Ll(), a = R(i), o = R(a), s = B(R(o));
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
		var n = kl(), r = R(n);
		N(n), V((e) => J(r, `Imported model roles: ${e ?? ""}.`), [() => t.view.requiredRoles.join(", ")]), q(e, n);
	};
	Y(b, (e) => {
		t.view.requiredRoles.length && e(x);
	});
	var S = B(b, 2), C = (e) => {
		var n = jl(), r = B(z(n));
		X(r, 21, () => t.view.unresolvedBindings, Wr, (e, t) => {
			var n = Al(), r = R(n);
			N(n), V((e) => J(r, `${U(t).title ?? ""} · ${U(t).role ?? ""}: missing ${e ?? ""}`), [() => U(t).missing.join(" and ")]), q(e, n);
		}), N(r), q(e, n);
	}, w = (e) => {
		q(e, Ml());
	};
	Y(S, (e) => {
		t.view.unresolvedBindings.length ? e(C) : t.view.bindingReviewRequired && e(w, 1);
	});
	var T = B(S, 2), E = (e) => {
		var n = Nl(), r = B(z(n));
		X(r, 21, () => t.view.terminals, Wr, (e, t) => {
			var n = Al(), r = R(n);
			N(n), V(() => J(r, `${U(t).title ?? ""} · ${U(t).operation ?? ""}`)), q(e, n);
		}), N(r), q(e, n);
	}, ee = (e) => {
		q(e, Pl());
	};
	Y(T, (e) => {
		t.view.terminals.length ? e(E) : e(ee, -1);
	});
	var D = B(T, 4), O = (e) => {
		var n = Fl(), r = R(n, !0);
		N(n), V(() => J(r, t.view.error)), q(e, n);
	};
	Y(D, (e) => {
		t.view.error && e(O);
	});
	var k = B(D, 2), A = R(k), te = B(A), ne = (e) => {
		var n = Il();
		G("click", n, () => t.actions.prepareImportAgain?.()), q(e, n);
	};
	Y(te, (e) => {
		t.view.error && e(ne);
	});
	var re = B(te);
	N(k), N(a), $(a, (e) => n = e, () => n), N(i), V(() => {
		J(u, t.view.name), J(f, t.view.fileName), J(h, t.view.phase), J(_, `${t.view.nodeCount ?? ""} blocks · ${t.view.wireCount ?? ""} wires · ${t.view.groupCount ?? ""} groups`), J(y, `${t.view.callBound ?? ""} total · ${t.view.importedCallBound ?? ""} imported`), re.disabled = !!t.view.error;
	}), G("keydown", a, r), W("paste", a, (e) => e.stopPropagation()), G("click", s, () => t.actions.cancelImport?.()), G("click", A, () => t.actions.cancelImport?.()), G("click", re, () => t.actions.acceptImport?.()), q(e, i), Ue();
}
Cr(["keydown", "click"]);
//#endregion
//#region ui/Workbench.svelte
var zl = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-recall-badge\"> </button>"), Bl = /* @__PURE__ */ K("<p class=\"pc-native-diagnostic svelte-1dr9aew\" role=\"alert\"> </p>"), Vl = /* @__PURE__ */ K("<p>Browse node families on the floating shelf. Middle mouse pans the graph; the wheel zooms around the pointer. Use the divider or its arrow keys to resize Preview.</p><p>Open examples from File and assign a unified workflow from Workflows. Its preparation stage feeds Generate Reply, and its response stage reshapes the captured Draft before Review and Publish. Choose each model node's connection with the bar under it. Details contains advanced model overrides and inheritance settings. Arm enables the assigned host workflow. Unified generation starts with Send in SillyTavern; Run to here tests supported nodes.</p><p>File › Open workflow chooses a JSON file and opens a separate workflow. Save workflow keeps committed edits and connections in SillyTavern. Export workflow JSON downloads a portable sharing copy without local connections. Import into graph reviews a compatible fragment before one undoable insertion.</p><p>Select nodes and right-click Create Subgraph to open their connected body in a new tab. Double-click a subgraph to open it. Add Input and Output nodes from the Subgraphs shelf inside an editable subgraph, then name and configure their ports in Details.</p><p>Right-click a subgraph block and choose Add to Subgraphs to save it for reuse. Right-click a saved shelf entry to delete it. Saving updates the shelf only when you choose to save; existing placed copies stay unchanged. Portals connect pins through named references. Preview artifact tabs show results for the selected node; Run to here checks the request bound before running. Apply reviews the fresh result against the full root workflow.</p>", 1), Hl = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay\"><div role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\"><header class=\"svelte-1dr9aew\"><h2 class=\"svelte-1dr9aew\"> </h2><button type=\"button\" class=\"pc-btn menu_button\" aria-label=\"Close panel\">×</button></header> <!></div></div>"), Ul = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay\"><div class=\"pc-manager-dialog svelte-1dr9aew\" role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\" aria-label=\"Manage portals\"><!></div></div>"), Wl = /* @__PURE__ */ K("<div role=\"dialog\" aria-modal=\"true\" aria-label=\"Lattice\" data-pc-workbench=\"svelte\"><!> <!> <div class=\"pc-body\" role=\"region\" aria-label=\"Workspace panels\" tabindex=\"0\"><div class=\"pc-stage\"><section aria-label=\"Output preview\"><header class=\"pc-preview-pane-head\"><strong>Preview</strong><button type=\"button\" class=\"pc-btn menu_button\"> </button></header> <div class=\"pc-preview-content\"><!></div></section> <!> <!> <!> <div class=\"pc-canvas-area\" id=\"pc-workspace-graph\" role=\"tabpanel\"><div class=\"pc-workspace-run svelte-1dr9aew\"><!></div> <div class=\"pc-canvas-host\" aria-label=\"Node canvas\"></div> <!> <!></div></div> <!> <div class=\"pc-inspector pc-workspace-details svelte-1dr9aew\"><header class=\"pc-details-heading svelte-1dr9aew\"><strong class=\"svelte-1dr9aew\">Details</strong></header> <!> <div class=\"pc-node-details-holder svelte-1dr9aew\"><!></div></div></div> <!> <!> <!> <!> <!> <!> <!> <!></div>");
function Gl(e, t) {
	He(t, !0);
	let n = Oi(t, "actions", 7), r = /* @__PURE__ */ I({
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
			...U(r),
			...e
		});
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
	let v = _(), y = /* @__PURE__ */ I($t(v.height)), b = /* @__PURE__ */ I($t(v.collapsed)), x = /* @__PURE__ */ I(500), S = /* @__PURE__ */ I(null), C = /* @__PURE__ */ I(520), w = /* @__PURE__ */ P(() => Math.max(220, Math.min(U(C), U(S) ?? U(r).detailsWidth ?? 258)));
	function T(e) {
		L(S, null), L(r, {
			...U(r),
			detailsWidth: e
		}), n().resizeDetails?.(e);
	}
	let E = /* @__PURE__ */ I(""), ee = /* @__PURE__ */ I(null), D = null, O = 0, k = /* @__PURE__ */ I(0), A;
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
	function re(e) {
		ne(), L(b, e, !0), te();
	}
	function ie() {
		re(!1);
	}
	async function ae(e) {
		if (e === "show-preview") re(!1);
		else if (e === "collapse-preview") re(!0);
		else if (e === "add-node") A.openSearch();
		else {
			D = document.activeElement, e === "examples" && n().refreshExamples?.(), e === "story-documents" && n().storyDocuments?.refresh?.(), e === "recall-arms" && n().recallArms?.refresh?.();
			let t = ++O;
			L(E, e, !0), await dr(), t === O && U(E) === e && U(ee)?.querySelector("button")?.focus();
		}
	}
	function oe() {
		O++, L(E, ""), D?.focus({ preventScroll: !0 });
	}
	async function se(e) {
		let t = O;
		try {
			let r = await n().openExample?.(e);
			return r === !0 && t === O && U(E) === "examples" && oe(), r === !0;
		} catch {
			return !1;
		}
	}
	function ce(e) {
		if (e.stopPropagation(), e.key === "Escape") e.preventDefault(), n().portalManager?.close?.();
		else if (e.key === "Tab") {
			let t = [...e.currentTarget.querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex=\"0\"]")], n = t[0], r = t.at(-1);
			e.shiftKey && document.activeElement === n && (e.preventDefault(), r?.focus()), !e.shiftKey && document.activeElement === r && (e.preventDefault(), n?.focus());
		}
	}
	function le(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), oe()), e.key === "Tab") {
			let t = [...U(ee).querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex=\"0\"]")], n = t[0], r = t.at(-1);
			e.shiftKey && document.activeElement === n && (e.preventDefault(), r?.focus()), !e.shiftKey && document.activeElement === r && (e.preventDefault(), n?.focus());
		}
	}
	ki(() => {
		let e = () => {
			L(x, Math.max(90, s.clientHeight - 190), !0), L(C, Math.max(220, Math.min(520, (a.clientWidth || i.clientWidth || window.innerWidth) - 368)), !0);
		}, t = globalThis.ResizeObserver;
		if (!t) return e(), window.addEventListener("resize", e), () => window.removeEventListener("resize", e);
		let n = new t(e);
		return n.observe(s), n.observe(a), e(), () => n.disconnect();
	});
	var ue = {
		getParts: d,
		updateActions: f,
		update: p,
		renameGraphView: m,
		focusCommentTitle: h,
		revealPreview: ie
	}, de = Wl();
	let fe, pe;
	var me = R(de);
	$(pa(me, {
		get state() {
			return U(r);
		},
		get actions() {
			return n();
		},
		local: ae
	}), (e) => l = e, () => l);
	var he = B(me, 2), ge = (e) => {
		var t = zl(), n = R(t);
		N(t), V((e) => J(n, `Recall armed · ${e ?? ""}`), [() => U(r).recallArms.nodes.filter((e) => e.armed).length]), G("click", t, () => ae("recall-arms")), q(e, t);
	}, _e = /* @__PURE__ */ P(() => U(r).recallArms?.nodes.some((e) => e.armed));
	Y(he, (e) => {
		U(_e) && e(ge);
	});
	var ve = B(he, 2), ye = R(ve), be = R(ye);
	let xe, Se;
	var Ce = R(be), we = B(R(Ce)), Te = R(we, !0);
	N(we), N(Ce);
	var Ee = B(Ce, 2), De = R(Ee);
	{
		let e = /* @__PURE__ */ P(() => U(r).outputPreview ?? null);
		ys(De, {
			get view() {
				return U(e);
			},
			get actions() {
				return n().outputPreview;
			},
			collapse: () => re(!0)
		});
	}
	N(Ee), N(be);
	var j = B(be, 2), Oe = (e) => {
		{
			let t = /* @__PURE__ */ P(() => Math.min(U(y), U(x)));
			ha(e, {
				get height() {
					return U(t);
				},
				get max() {
					return U(x);
				},
				start: ne,
				change: (e) => {
					L(y, e, !0), te();
				}
			});
		}
	};
	Y(j, (e) => {
		U(b) || e(Oe);
	});
	var M = B(j, 2);
	$(Da(M, {
		get views() {
			return U(r).graphViews;
		},
		get actions() {
			return n().graphViewActions;
		},
		panelId: "pc-workspace-graph"
	}), (e) => u = e, () => u);
	var ke = B(M, 2);
	{
		let e = /* @__PURE__ */ P(() => U(r).graphViews?.active);
		Ma(ke, {
			get view() {
				return U(e);
			},
			get actions() {
				return n().graphViewActions;
			}
		});
	}
	var Ae = B(ke, 2), Me = R(Ae), Ne = R(Me);
	{
		let e = /* @__PURE__ */ P(() => U(r).runMeter ?? null);
		Ns(Ne, {
			get view() {
				return U(e);
			},
			open: () => {
				L(E, "run-details");
			}
		});
	}
	N(Me);
	var Pe = B(Me, 2);
	$(Pe, (e) => o = e, () => o);
	var Fe = B(Pe, 2), Ie = (e) => {
		var t = Bl(), n = R(t, !0);
		N(t), V(() => J(n, U(r).nativeDiagnostic)), q(e, t);
	};
	Y(Fe, (e) => {
		U(r).nativeDiagnostic && e(Ie);
	}), $(_l(B(Fe, 2), {
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
	}), (e) => A = e, () => A), N(Ae), N(ye), $(ye, (e) => s = e, () => s);
	var Le = B(ye, 2), Re = (e) => {
		var t = Pr();
		Ur(z(t), () => U(r).graphViews?.active.key ?? U(r).graphId, (e) => {
			_a(e, {
				get width() {
					return U(w);
				},
				get max() {
					return U(C);
				},
				start: ne,
				preview: (e) => L(S, e, !0),
				change: T
			});
		}), q(e, t);
	};
	Y(Le, (e) => {
		U(r).inspectorOpen && e(Re);
	});
	var ze = B(Le, 2), Be = B(R(ze), 2), Ve = (e) => {
		let t = /* @__PURE__ */ P(() => U(r).commentDetails);
		ts(e, {
			get comment() {
				return U(t).comment;
			},
			onPatch: (e) => n().commentDetails?.patch(U(t).selection, e),
			onCommand: (e) => n().commentDetails?.command(U(t).selection, e)
		});
	};
	Y(Be, (e) => {
		U(r).commentDetails && e(Ve);
	});
	var We = B(Be, 2), Ge = R(We);
	{
		let e = /* @__PURE__ */ P(() => U(r).commentDetails ? null : U(r).nodeDetails ?? null);
		Qo(Ge, {
			get view() {
				return U(e);
			},
			get actions() {
				return n().nodeDetails;
			}
		});
	}
	N(We), N(ze), $(ze, (e) => c = e, () => c), N(ve), $(ve, (e) => a = e, () => a);
	var Ke = B(ve, 2), qe = (e) => {
		var t = Hl(), i = R(t);
		let a;
		var o = R(i), s = R(o), c = R(s, !0);
		N(s);
		var l = B(s);
		N(o);
		var u = B(o, 2), d = (e) => {
			Ol(e, {
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
				scroll: (e) => L(k, e, !0),
				open: se
			});
		}, f = (e) => {
			{
				let t = /* @__PURE__ */ P(() => U(r).recallArms ?? {
					scope: null,
					nodes: [],
					issue: "Recall state is unavailable."
				});
				Ac(e, {
					get view() {
						return U(t);
					},
					get actions() {
						return n().recallArms;
					},
					close: oe
				});
			}
		}, p = (e) => {
			{
				let t = /* @__PURE__ */ P(() => U(r).storyDocuments ?? {
					key: "",
					revision: "",
					scope: {
						userId: "",
						chatId: ""
					},
					documents: [],
					issue: "Workflow Data setup is unavailable."
				});
				wc(e, {
					get view() {
						return U(t);
					},
					get actions() {
						return n().storyDocuments;
					},
					close: oe
				});
			}
		}, m = (e) => {
			{
				let t = /* @__PURE__ */ P(() => U(r).runDetails ?? null);
				ks(e, {
					get view() {
						return U(t);
					},
					get actions() {
						return n().runDetails;
					}
				});
			}
		}, h = (e) => {
			var t = Vl();
			je(4), q(e, t);
		};
		Y(u, (e) => {
			U(E) === "examples" ? e(d) : U(E) === "recall-arms" ? e(f, 1) : U(E) === "story-documents" ? e(p, 2) : U(E) === "run-details" ? e(m, 3) : e(h, -1);
		}), N(i), $(i, (e) => L(ee, e), () => U(ee)), N(t), V(() => {
			a = ci(i, 1, "pc-workspace-dialog svelte-1dr9aew", null, a, { "pc-examples-dialog": U(E) === "examples" }), Q(i, "aria-label", U(E) === "examples" ? "Examples" : U(E) === "run-details" ? "Run details" : U(E) === "story-documents" ? "Workflow Data" : U(E) === "recall-arms" ? "Recall arms" : "Workspace guide"), J(c, U(E) === "examples" ? "Examples" : U(E) === "run-details" ? "Run details" : U(E) === "story-documents" ? "Workflow Data" : U(E) === "recall-arms" ? "Recall arms" : "Workspace guide");
		}), G("keydown", i, le), W("paste", i, (e) => e.stopPropagation()), G("click", l, oe), q(e, t);
	};
	Y(Ke, (e) => {
		U(E) && e(qe);
	});
	var Je = B(Ke, 2);
	Jc(Je, {
		get view() {
			return U(r).nativeSearch;
		},
		get actions() {
			return n().nativeSearch;
		}
	});
	var Ye = B(Je, 2);
	Qc(Ye, {
		get view() {
			return U(r).nativePinMenu;
		},
		get actions() {
			return n().nativePinMenu;
		}
	});
	var Xe = B(Ye, 2), Ze = (e) => {
		var t = Ul(), i = R(t);
		Qs(R(i), {
			get view() {
				return U(r).portalManager;
			},
			get actions() {
				return n().portalManager;
			}
		}), N(i), N(t), G("keydown", i, ce), W("paste", i, (e) => e.stopPropagation()), q(e, t);
	};
	Y(Xe, (e) => {
		U(r).portalManager && e(Ze);
	});
	var Qe = B(Xe, 2), $e = (e) => {
		Lc(e, {
			get view() {
				return U(r).configureNode;
			},
			get actions() {
				return n().configureNode;
			}
		});
	};
	Y(Qe, (e) => {
		U(r).configureNode && e($e);
	});
	var et = B(Qe, 2), tt = (e) => {
		nc(e, {
			get view() {
				return U(r).subgraphSave;
			},
			get actions() {
				return n().subgraphSave;
			}
		});
	};
	Y(et, (e) => {
		U(r).subgraphSave && e(tt);
	});
	var nt = B(et, 2), rt = (e) => {
		Rl(e, {
			get view() {
				return U(r).importReview;
			},
			get actions() {
				return n();
			}
		});
	};
	Y(nt, (e) => {
		U(r).importReview && e(rt);
	});
	var it = B(nt, 2), at = (e) => {
		zc(e, {
			get view() {
				return U(r).newWorkflowPrompt;
			},
			get actions() {
				return n().newWorkflowPrompt;
			}
		});
	};
	return Y(it, (e) => {
		U(r).newWorkflowPrompt && e(at);
	}), N(de), $(de, (e) => i = e, () => i), V((e) => {
		fe = ci(de, 1, "pc-root pc-native-workspace svelte-1dr9aew", null, fe, { "pc-native-flat": U(r).nativeFlatCanvas }), pe = ui(de, "", pe, { "--pc-details-width": `${U(w)}px` }), xe = ci(be, 1, "pc-preview-pane", null, xe, { "pc-preview-collapsed": U(b) }), Se = ui(be, "", Se, e), Q(we, "aria-expanded", !U(b)), J(Te, U(b) ? "Expand preview" : "Collapse preview"), Q(Ee, "hidden", U(b)), Q(ze, "hidden", !U(r).inspectorOpen), Q(We, "hidden", !!U(r).commentDetails);
	}, [() => ({ "--pc-preview-height": `${Math.min(U(y), U(x))}px` })]), G("click", we, () => re(!U(b))), q(e, de), Ue(ue);
}
Cr(["click", "keydown"]);
//#endregion
//#region ui/entry.js
function Kl(e, t) {
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
		}), Lt();
		let { width: e, height: i } = n.querySelector(".pc-node").getBoundingClientRect();
		return {
			width: e,
			height: i
		};
	} finally {
		r && Br(r), n.remove();
	}
}
function ql(e, t) {
	let n = Ir(ia, {
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
		destroy: () => Br(n)
	};
}
function Jl(e, t) {
	let n = Ir(Gl, {
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
		destroy: () => Br(n)
	};
}
//#endregion
export { Kl as measureNodeCard, ql as mountCanvas, Jl as mountWorkbench };
