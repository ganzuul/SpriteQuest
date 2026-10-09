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
var _ = 1024, v = 2048, y = 4096, b = 8192, x = 16384, S = 32768, C = 1 << 25, w = 65536, T = 1 << 19, ee = 1 << 20, te = 1 << 25, ne = 65536, re = 1 << 21, ie = 1 << 22, E = 1 << 23, ae = Symbol("$state"), oe = Symbol("legacy props"), se = Symbol(""), ce = Symbol("attributes"), le = Symbol("class"), ue = Symbol("style"), de = Symbol("text"), fe = Symbol("form reset"), pe = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), me = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml");
function he(e) {
	throw Error("https://svelte.dev/e/lifecycle_outside_component");
}
//#endregion
//#region node_modules/svelte/src/internal/client/errors.js
function ge() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function _e(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function ve(e) {
	throw Error("https://svelte.dev/e/effect_in_teardown");
}
function ye() {
	throw Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function be(e) {
	throw Error("https://svelte.dev/e/effect_orphan");
}
function xe() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Se(e) {
	throw Error("https://svelte.dev/e/props_invalid_value");
}
function Ce() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function we() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function Te() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Ee() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
function De() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function Oe(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
function ke() {
	console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Ae() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/hydration.js
var D = !1;
function je(e) {
	D = e;
}
var O;
function Me(t) {
	if (t === null) throw Oe(), e;
	return O = t;
}
function Ne() {
	return Me(/* @__PURE__ */ ln(O));
}
function k(t) {
	if (D) {
		if (/* @__PURE__ */ ln(O) !== null) throw Oe(), e;
		O = t;
	}
}
function Pe(e = 1) {
	if (D) {
		for (var t = e, n = O; t--;) n = /* @__PURE__ */ ln(n);
		O = n;
	}
}
function Fe(e = !0) {
	for (var t = 0, n = O;;) {
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
function Ie(t) {
	if (!t || t.nodeType !== 8) throw Oe(), e;
	return t.data;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/equality.js
function Le(e) {
	return e === this.v;
}
function Re(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function ze(e) {
	return !Re(e, this.v);
}
//#endregion
//#region node_modules/svelte/src/internal/flags/index.js
var Be = !1;
function Ve() {
	Be = !0;
}
//#endregion
//#region node_modules/svelte/src/internal/client/context.js
var A = null;
function He(e) {
	A = e;
}
function j(e, t = !1, n) {
	A = {
		p: A,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: H,
		l: Be && !t ? {
			s: null,
			u: null,
			$: []
		} : null
	};
}
function M(e) {
	var t = A, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) bn(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, A = t.p, e ?? {};
}
function Ue() {
	return !Be || A !== null && A.l === null;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/task.js
var We = [];
function Ge() {
	var e = We;
	We = [], h(e);
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
	var t = H;
	if (t === null) return V.f |= E, e;
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
var Xe = ~(v | y | _);
function N(e, t) {
	e.f = e.f & Xe | t;
}
function Ze(e) {
	e.f & 512 || e.deps === null ? N(e, _) : N(e, y);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
function Qe(e) {
	if (e !== null) for (let t of e) t.f & 2 && t.f & 65536 && (t.f ^= ne, Qe(t.deps));
}
function $e(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), Qe(e.deps), N(e, _);
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
	D && /* @__PURE__ */ cn(e) !== null && un(e);
}
var rt = !1;
function it() {
	rt || (rt = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[fe]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function at(e) {
	var t = V, n = H;
	Un(null), Wn(null);
	try {
		return e();
	} finally {
		Un(t), Wn(n);
	}
}
function ot(e, t, n, r = n) {
	e.addEventListener(t, () => at(n));
	let i = e[fe];
	e[fe] = i ? () => {
		i(), r(!0);
	} : () => r(!0), it();
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function st(e) {
	let t = 0, n = Kt(0), r;
	return () => {
		_n() && (U(n), wn(() => (t === 0 && (r = dr(() => e(() => Xt(n)))), t += 1, () => {
			Ke(() => {
				--t, t === 0 && (r?.(), r = void 0, Xt(n));
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
	#t = D ? O : null;
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
	#h = st(() => (this.#m = Kt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = H;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = H.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = Tn(() => {
			if (D) {
				let e = this.#t;
				Ne();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, ct), D && (this.#e = O);
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
		Ke(r), t && (this.#s = En(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			t ? Ae() : (t = !0, n && Ee(), this.#s !== null && Nn(this.#s, () => {
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
		e && (this.is_pending = !0, this.#o = En(() => e(this.#e)), Ke(() => {
			var e = this.#c = document.createDocumentFragment(), t = sn();
			e.append(t), this.#a = this.#S(() => En(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, Nn(this.#o, () => {
				this.#o = null;
			}), this.#x(P));
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
			} else this.#x(P);
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
		var t = H, n = V, r = A;
		Wn(this.#i), Un(this.#i), He(this.#i.ctx);
		try {
			return Ft.ensure(), e();
		} catch (e) {
			return Je(e), null;
		} finally {
			Wn(t), Un(n), He(r);
		}
	}
	#C(e, t) {
		this.has_pending_snippet() ? (this.#u += e, this.#u === 0 && (this.#x(t), this.#o && Nn(this.#o, () => {
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
		P?.is_fork ? (this.#a && P.skip_effect(this.#a), this.#o && P.skip_effect(this.#o), this.#s && P.skip_effect(this.#s), P.oncommit(() => {
			this.#w(e);
		})) : this.#w(e);
	}
	#w(e) {
		this.#a &&= (An(this.#a), null), this.#o &&= (An(this.#o), null), this.#s &&= (An(this.#s), null), D && (Me(this.#t), Pe(), Me(Fe()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return En(() => {
						var r = H;
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
function dt(e, t, n, r) {
	let i = Ue() ? ht : yt;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = H, c = ft(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				Ye(e, s);
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
		Promise.all(n.map((e) => /* @__PURE__ */ _t(e))).then(u).catch((e) => Ye(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), pt();
	}) : f();
}
function ft() {
	var e = H, t = V, n = A, r = P;
	return function(i = !0) {
		Wn(e), Un(t), He(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function pt(e = !0) {
	Wn(null), Un(null), He(null), e && P?.deactivate();
}
function mt() {
	var e = H, t = e.b, n = P, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function ht(e) {
	var n = 2 | v;
	return H !== null && (H.f |= T), {
		ctx: A,
		deps: null,
		effects: null,
		equals: Le,
		f: n,
		fn: e,
		reactions: null,
		rv: 0,
		v: t,
		wv: 0,
		parent: H,
		ac: null
	};
}
var gt = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function _t(e, n, r) {
	let i = H;
	i === null && ge();
	var a = void 0, o = Kt(t), s = !V, c = /* @__PURE__ */ new Set();
	return Cn(() => {
		var t = H, n = g();
		a = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== pe && n.reject(e);
			}).finally(pt);
		} catch (e) {
			n.reject(e), pt();
		}
		var r = P;
		if (s) {
			if (t.f & 32768) var l = mt();
			if (i.b?.is_rendered()) r.async_deriveds.get(t)?.reject(gt);
			else for (let e of c.values()) e.reject(gt);
			c.add(n), r.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), c.delete(n), t !== gt && (r.activate(), t ? (o.f |= E, Jt(o, t)) : (o.f & 8388608 && (o.f ^= E), Jt(o, e)), r.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), vn(() => {
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
function vt(e) {
	let t = /* @__PURE__ */ ht(e);
	return Kn(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function yt(e) {
	let t = /* @__PURE__ */ ht(e);
	return t.equals = ze, t;
}
function bt(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) An(t[n]);
	}
}
function xt(e) {
	var n, r = H, i = e.parent;
	if (!Bn && i !== null && e.v !== t && i.f & 24576) return De(), e.v;
	Wn(i);
	try {
		e.f &= ~ne, bt(e), n = ir(e);
	} finally {
		Wn(r);
	}
	return n;
}
function St(e) {
	var t = xt(e);
	!e.equals(t) && (e.wv = tr(), (!P?.is_fork || e.deps === null) && (P === null ? e.v = t : (P.capture(e, t, !0), Et?.capture(e, t, !0)), e.deps === null)) ? N(e, _) : Bn || (Dt === null ? Ze(e) : (_n() || P?.is_fork) && Dt.set(e, t));
}
function Ct(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && at(() => {
		t.ac.abort(pe), t.ac = null;
	}), t.fn !== null && (t.teardown = m), or(t, 0), On(t));
}
function wt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && sr(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
var Tt = null, P = null, Et = null, Dt = null, Ot = null, kt = !1, At = !1, jt = null, Mt = null, Nt = 0, Pt = 1, Ft = class e {
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
			for (var r of n.d) N(r, v), t(r);
			for (r of n.m) N(r, y), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, Nt++ > 1e3 && (this.#x(), Lt());
		for (let e of this.#u) this.#d.delete(e), N(e, v), this.schedule(e);
		for (let e of this.#d) N(e, y), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = jt = [], r = [], i = Mt = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw Ht(e), this.#h() || this.discard(), t;
		}
		if (P = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (jt = null, Mt = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) Vt(e, t);
			i.length > 0 && P.#g();
			return;
		}
		let o = this.#v();
		if (o) this.#b(r), this.#b(n), o.#y(this);
		else {
			this.#u.clear(), this.#d.clear();
			for (let e of this.#r) e(this);
			this.#r.clear(), Et = this, zt(r), zt(n), Et = null, this.#s?.resolve();
			var s = P;
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), N(i, v), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), P = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) $e(e[t], this.#u, this.#d);
	}
	capture(e, n, r = !1) {
		e.v !== t && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [n, r]), Dt?.set(e, n)), this.is_fork || (e.v = n);
	}
	activate() {
		P = this;
	}
	deactivate() {
		P = null, Dt = null;
	}
	flush() {
		try {
			At = !0, P = this, this.#g();
		} finally {
			Nt = 0, Ot = null, jt = null, Mt = null, At = !1, P = null, Dt = null, Wt.clear();
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
		return (this.#s ??= g()).promise;
	}
	static ensure() {
		if (P === null) {
			let t = P = new e();
			!At && !kt && Ke(() => {
				t.#e || t.flush();
			});
		}
		return P;
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
				if (jt !== null && t === H && (V === null || !(V.f & 2))) return;
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
			e === null || (e.#n = t), t === null ? Tt = e : t.#t = e, this.linked = !1;
		}
	}
};
function It(e) {
	var t = kt;
	kt = !0;
	try {
		var n;
		for (e && (P !== null && !P.is_fork && P.flush(), n = e());;) {
			if (qe(), P === null) return n;
			P.flush();
		}
	} finally {
		kt = t;
	}
}
function Lt() {
	try {
		xe();
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
			if (!(r.f & 24576) && nr(r) && (Rt = /* @__PURE__ */ new Set(), sr(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Mn(r), Rt?.size > 0)) {
				Wt.clear();
				for (let e of Rt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) Rt.has(n) && (Rt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || sr(n);
					}
				}
				Rt.clear();
			}
		}
		Rt = null;
	}
}
function Bt(e) {
	P.schedule(e);
}
function Vt(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), N(e, _);
		for (var n = e.first; n !== null;) Vt(n, t), n = n.next;
	}
}
function Ht(e) {
	N(e, _);
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
		equals: Le,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function F(e, t) {
	let n = Kt(e, t);
	return Kn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function qt(e, t = !1, n = !0) {
	let r = Kt(e);
	return t || (r.equals = ze), Be && n && A !== null && A.l !== null && (A.l.s ??= []).push(r), r;
}
function I(e, t, n = !1) {
	return V !== null && (!Hn || V.f & 131072) && Ue() && V.f & 4325394 && (Gn === null || !Gn.has(e)) && Te(), Jt(e, n ? Qt(t) : t, Mt);
}
function Jt(e, t, n = null) {
	if (!e.equals(t)) {
		Bn ? Wt.set(e, t) : Wt.has(e) || Wt.set(e, e.v);
		var r = Ft.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && xt(t), Dt === null && Ze(t);
		}
		e.wv = tr(), Zt(e, v, n), Ue() && H !== null && H.f & 1024 && !(H.f & 96) && (Yn === null ? Xn([e]) : Yn.push(e)), !r.is_fork && Ut.size > 0 && !Gt && Yt();
	}
	return t;
}
function Yt() {
	Gt = !1;
	for (let e of Ut) {
		e.f & 1024 && N(e, y);
		let t;
		try {
			t = nr(e);
		} catch {
			t = !0;
		}
		t && sr(e);
	}
	Ut.clear();
}
function Xt(e) {
	I(e, e.v + 1);
}
function Zt(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = Ue(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (i || s !== H) {
			var l = (c & v) === 0;
			if (l && N(s, t), c & 131072) Ut.add(s);
			else if (c & 2) {
				var u = s;
				Dt?.delete(u), c & 65536 || (c & 512 && (H === null || !(H.f & 2097152)) && (s.f |= ne), Zt(u, y, n));
			} else if (l) {
				var d = s;
				c & 16 && Rt !== null && Rt.add(d), n === null ? Bt(d) : n.push(d);
			}
		}
	}
}
function Qt(e) {
	if (typeof e != "object" || !e || ae in e) return e;
	let n = f(e);
	if (n !== u && n !== d) return e;
	var i = /* @__PURE__ */ new Map(), a = r(e), o = /* @__PURE__ */ F(0), s = null, l = $n, p = (e) => {
		if ($n === l) return e();
		var t = V, n = $n;
		Un(null), er(l);
		var r = e();
		return Un(t), er(n), r;
	};
	return a && i.set("length", /* @__PURE__ */ F(e.length, s)), new Proxy(e, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && Ce();
			var r = i.get(t);
			return r === void 0 ? p(() => {
				var e = /* @__PURE__ */ F(n.value, s);
				return i.set(t, e), e;
			}) : I(r, n.value, !0), !0;
		},
		deleteProperty(e, n) {
			var r = i.get(n);
			if (r === void 0) {
				if (n in e) {
					let e = p(() => /* @__PURE__ */ F(t, s));
					i.set(n, e), Xt(o);
				}
			} else I(r, t), Xt(o);
			return !0;
		},
		get(n, r, a) {
			if (r === ae) return e;
			var o = i.get(r), l = r in n;
			if (o === void 0 && (!l || c(n, r)?.writable) && (o = p(() => /* @__PURE__ */ F(Qt(l ? n[r] : t), s)), i.set(r, o)), o !== void 0) {
				var u = U(o);
				return u === t ? void 0 : u;
			}
			return Reflect.get(n, r, a);
		},
		getOwnPropertyDescriptor(e, n) {
			var r = Reflect.getOwnPropertyDescriptor(e, n);
			if (r && "value" in r) {
				var a = i.get(n);
				a && (r.value = U(a));
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
			if (n === ae) return !0;
			var r = i.get(n), a = r !== void 0 && r.v !== t || Reflect.has(e, n);
			return (r !== void 0 || H !== null && (!a || c(e, n)?.writable)) && (r === void 0 && (r = p(() => /* @__PURE__ */ F(a ? Qt(e[n]) : t, s)), i.set(n, r)), U(r) === t) ? !1 : a;
		},
		set(e, n, r, l) {
			var u = i.get(n), d = n in e;
			if (a && n === "length") for (var f = r; f < u.v; f += 1) {
				var m = i.get(f + "");
				m === void 0 ? f in e && (m = p(() => /* @__PURE__ */ F(t, s)), i.set(f + "", m)) : I(m, t);
			}
			if (u === void 0) (!d || c(e, n)?.writable) && (u = p(() => /* @__PURE__ */ F(void 0, s)), I(u, Qt(r)), i.set(n, u));
			else {
				d = u.v !== t;
				var h = p(() => Qt(r));
				I(u, h);
			}
			var g = Reflect.getOwnPropertyDescriptor(e, n);
			if (g?.set && g.set.call(l, r), !d) {
				if (a && typeof n == "string") {
					var _ = i.get("length"), v = Number(n);
					Number.isInteger(v) && v >= _.v && I(_, v + 1);
				}
				Xt(o);
			}
			return !0;
		},
		ownKeys(e) {
			U(o);
			var n = Reflect.ownKeys(e).filter((e) => {
				var n = i.get(e);
				return n === void 0 || n.v !== t;
			});
			for (var [r, a] of i) a.v !== t && !(r in e) && n.push(r);
			return n;
		},
		setPrototypeOf() {
			we();
		}
	});
}
function $t(e) {
	try {
		if (typeof e == "object" && e && ae in e) return e[ae];
	} catch {}
	return e;
}
function en(e, t) {
	return Object.is($t(e), $t(t));
}
var tn, nn, rn, an;
function on() {
	if (tn === void 0) {
		tn = window, nn = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		rn = c(t, "firstChild").get, an = c(t, "nextSibling").get, p(e) && (e[le] = void 0, e[ce] = null, e[ue] = void 0, e.__e = void 0), p(n) && (n[de] = void 0);
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
function L(e, t) {
	if (!D) return /* @__PURE__ */ cn(e);
	var n = /* @__PURE__ */ cn(O);
	if (n === null) n = O.appendChild(sn());
	else if (t && n.nodeType !== 3) {
		var r = sn();
		return n?.before(r), Me(r), r;
	}
	return t && pn(n), Me(n), n;
}
function R(e, t = !1) {
	if (!D) {
		var n = /* @__PURE__ */ cn(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ ln(n) : n;
	}
	if (t) {
		if (O?.nodeType !== 3) {
			var r = sn();
			return O?.before(r), Me(r), r;
		}
		pn(O);
	}
	return O;
}
function z(e, t = 1, n = !1) {
	let r = D ? O : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ ln(r);
	if (!D) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = sn();
			return r === null ? i?.after(a) : r.before(a), Me(a), a;
		}
		pn(r);
	}
	return Me(r), r;
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
	H === null && (V === null && be(e), ye()), Bn && ve(e);
}
function hn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function gn(e, t) {
	var n = H;
	n !== null && n.f & 8192 && (e |= b);
	var r = {
		ctx: A,
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
	P?.register_created_effect(r);
	var i = r;
	if (e & 4) jt === null ? Ft.ensure().schedule(r) : jt.push(r);
	else if (t !== null) {
		try {
			sr(r);
		} catch (e) {
			throw An(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= w));
	}
	if (i !== null && (i.parent = n, n !== null && hn(i, n), V !== null && V.f & 2 && !(e & 64))) {
		var a = V;
		(a.effects ??= []).push(i);
	}
	return r;
}
function _n() {
	return V !== null && !Hn;
}
function vn(e) {
	let t = gn(8, null);
	return N(t, _), t.teardown = e, t;
}
function yn(e) {
	mn("$effect");
	var t = H.f;
	if (!V && t & 32 && A !== null && !A.i) {
		var n = A;
		(n.e ??= []).push(e);
	} else return bn(e);
}
function bn(e) {
	return gn(4 | ee, e);
}
function xn(e) {
	Ft.ensure();
	let t = gn(64 | T, e);
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
	return gn(ie | T, e);
}
function wn(e, t = 0) {
	return gn(8 | t, e);
}
function B(e, t = [], n = [], r = []) {
	dt(r, t, n, (t) => {
		gn(8, () => {
			e(...t.map(U));
		});
	});
}
function Tn(e, t = 0) {
	return gn(16 | t, e);
}
function En(e) {
	return gn(32 | T, e);
}
function Dn(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = Bn, n = V;
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
			e.abort(pe);
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
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (jn(e.nodes.start, e.nodes.end), n = !0), e.f |= C, On(e, t && !n), or(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	Dn(e), e.f ^= C, e.f |= x;
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
		e.f ^= b;
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
		e.f ^= b, e.f & 1024 || (N(e, v), Ft.ensure().schedule(e));
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
//#region node_modules/svelte/src/internal/client/legacy.js
var Rn = null, zn = !1, Bn = !1;
function Vn(e) {
	Bn = e;
}
var V = null, Hn = !1;
function Un(e) {
	V = e;
}
var H = null;
function Wn(e) {
	H = e;
}
var Gn = null;
function Kn(e) {
	V !== null && (Gn ??= /* @__PURE__ */ new Set()).add(e);
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
	if (t & 2 && (e.f &= ~ne), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (nr(a) && St(a), a.wv > e.wv) return !0;
		}
		t & 512 && Dt === null && N(e, _);
	}
	return !1;
}
function rr(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Gn !== null && Gn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? rr(a, t, !1) : t === a && (n ? N(a, v) : a.f & 1024 && N(a, y), Bt(a));
	}
}
function ir(e) {
	var t = qn, n = Jn, r = Yn, i = V, a = Gn, o = A, s = Hn, c = $n, l = e.f;
	qn = null, Jn = 0, Yn = null, V = l & 96 ? null : e, Gn = null, He(e.ctx), Hn = !1, $n = ++Qn, e.ac !== null && (at(() => {
		e.ac.abort(pe);
	}), e.ac = null);
	try {
		e.f |= re;
		var u = e.fn, d = u();
		e.f |= S;
		var f = e.deps, p = P?.is_fork;
		if (qn !== null) {
			var m;
			if (p || or(e, Jn), f !== null && Jn > 0) for (f.length = Jn + qn.length, m = 0; m < qn.length; m++) f[Jn + m] = qn[m];
			else e.deps = f = qn;
			if (_n() && e.f & 512) for (m = Jn; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && Jn < f.length && (or(e, Jn), f.length = Jn);
		if (Ue() && Yn !== null && !Hn && f !== null && !(e.f & 6146)) for (m = 0; m < Yn.length; m++) rr(Yn[m], e);
		if (i !== null && i !== e) {
			if (Qn++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = Qn;
			if (t !== null) for (let e of t) e.rv = Qn;
			Yn !== null && (r === null ? r = Yn : r.push(...Yn));
		}
		return e.f & 8388608 && (e.f ^= E), d;
	} catch (e) {
		return Je(e);
	} finally {
		e.f ^= re, qn = t, Jn = n, Yn = r, V = i, Gn = a, He(o), Hn = s, $n = c;
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
		c.f & 512 && (c.f ^= 512, c.f &= ~ne), c.v !== t && Ze(c), c.ac !== null && at(() => {
			c.ac.abort(pe), c.ac = null, N(c, v);
		}), Ct(c), or(c, 0);
	}
}
function or(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) ar(e, n[r]);
}
function sr(e) {
	var t = e.f;
	if (!(t & 16384)) {
		N(e, _);
		var n = H, r = zn;
		H = e, zn = !(t & 96);
		try {
			t & 16777232 ? kn(e) : On(e), Dn(e);
			var i = ir(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = Zn;
		} finally {
			zn = r, H = n;
		}
	}
}
async function cr() {
	await Promise.resolve(), It();
}
function U(e) {
	var t = !!(e.f & 2);
	if (Rn?.add(e), V !== null && !Hn && !(H !== null && H.f & 16384) && (Gn === null || !Gn.has(e))) {
		var n = V.deps;
		if (V.f & 2097152) e.rv < Qn && (e.rv = Qn, qn === null && n !== null && n[Jn] === e ? Jn++ : qn === null ? qn = [e] : qn.push(e));
		else {
			V.deps ??= [], a.call(V.deps, e) || V.deps.push(e);
			var r = e.reactions;
			r === null ? e.reactions = [V] : a.call(r, V) || r.push(V);
		}
	}
	if (Bn && Wt.has(e)) return Wt.get(e);
	if (t) {
		var i = e;
		if (Bn) {
			var o = i.v;
			return (!(i.f & 1024) && i.reactions !== null || ur(i)) && (o = xt(i)), Wt.set(i, o), o;
		}
		var s = !(i.f & 512) && !Hn && V !== null && (zn || !!(V.f & 512)), c = (i.f & S) === 0;
		nr(i) && (s && (i.f |= 512), St(i)), s && !c && (wt(i), lr(i));
	}
	if (Dt?.has(e)) return Dt.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function lr(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (wt(t), lr(t));
}
function ur(e) {
	if (e.v === t) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Wt.has(t) || t.f & 2 && ur(t)) return !0;
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
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Ke(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function gr(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = hr(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && vn(() => {
		t.removeEventListener(e, o, a);
	});
}
function W(e, t, n) {
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
		var d = V, f = H;
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
	var t = fn("template");
	return t.innerHTML = Sr(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function wr(e, t) {
	var n = H;
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
		if (D) return wr(O, null), O;
		i === void 0 && (i = Cr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ cn(i)));
		var t = r || nn ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ cn(t), s = t.lastChild;
			wr(o, s);
		} else wr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Tr(e, t, n = "svg") {
	var r = !e.startsWith("<!>"), i = !!(t & 1), a = `<${n}>${r ? e : "<!>" + e}</${n}>`, o;
	return () => {
		if (D) return wr(O, null), O;
		if (!o) {
			var e = /* @__PURE__ */ cn(Cr(a));
			if (i) for (o = document.createDocumentFragment(); /* @__PURE__ */ cn(e);) o.appendChild(/* @__PURE__ */ cn(e));
			else o = /* @__PURE__ */ cn(e);
		}
		var t = o.cloneNode(!0);
		if (i) {
			var n = /* @__PURE__ */ cn(t), r = t.lastChild;
			wr(n, r);
		} else wr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Er(e, t) {
	return /* @__PURE__ */ Tr(e, t, "svg");
}
function Dr() {
	if (D) return wr(O, null), O;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = sn();
	return e.append(t, n), wr(t, n), e;
}
function K(e, t) {
	if (D) {
		var n = H;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = O), Ne();
	} else e !== null && e.before(t);
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var Or = ["touchstart", "touchmove"];
function kr(e) {
	return Or.includes(e);
}
function q(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[de] ??= e.nodeValue) && (e[de] = n, e.nodeValue = `${n}`);
}
function Ar(e, t) {
	return Mr(e, t);
}
var jr = /* @__PURE__ */ new Map();
function Mr(t, { target: n, anchor: r, props: i = {}, events: a, context: s, intro: c = !0, transformError: l }) {
	on();
	var u = void 0, d = xn(() => {
		var c = r ?? n.appendChild(sn());
		lt(c, { pending: () => {} }, (n) => {
			j({});
			var r = A;
			if (s && (r.c = s), a && (i.$$events = a), D && wr(n, null), u = t(n, i) || {}, D && (H.nodes.end = O, O === null || O.nodeType !== 8 || O.data !== "]")) throw Oe(), e;
			M();
		}, l);
		var d = /* @__PURE__ */ new Set(), f = (e) => {
			for (var t = 0; t < e.length; t++) {
				var r = e[t];
				if (!d.has(r)) {
					d.add(r);
					var i = kr(r);
					for (let e of [n, document]) {
						var a = jr.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), jr.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, br, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return f(o(pr)), mr.add(f), () => {
			for (var e of d) for (let r of [n, document]) {
				var t = jr.get(r), i = t.get(e);
				--i == 0 ? (r.removeEventListener(e, br), t.delete(e), t.size === 0 && jr.delete(r)) : t.set(e, i);
			}
			mr.delete(f), c !== r && c.parentNode?.removeChild(c);
		};
	});
	return Nr.set(u, d), u;
}
var Nr = /* @__PURE__ */ new WeakMap();
function Pr(e, t) {
	let n = Nr.get(e);
	return n ? (Nr.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/branches.js
var Fr = class {
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
		var n = P, r = dn();
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
		} else D && (this.anchor = O), this.#a(n);
	}
};
function Ir(e) {
	A === null && he("onMount"), Be && A.l !== null ? Rr(A).m.push(e) : yn(() => {
		let t = dr(e);
		if (typeof t == "function") return t;
	});
}
function Lr(e) {
	A === null && he("onDestroy"), Ir(() => () => dr(e));
}
function Rr(e) {
	var t = e.l;
	return t.u ??= {
		a: [],
		b: [],
		m: []
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
function J(e, t, n = !1) {
	var r;
	D && (r = O, Ne());
	var i = new Fr(e), a = n ? w : 0;
	function o(e, t) {
		if (D) {
			var n = Ie(r);
			if (e !== parseInt(n.substring(1))) {
				var a = Fe();
				Me(a), i.anchor = a, je(!1), i.ensure(e, t), je(!0);
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
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
function zr(e, t) {
	return t;
}
function Br(e, t, n) {
	for (var r = [], i = t.length, a, s = t.length, c = 0; c < i; c++) {
		let n = t[c];
		Nn(n, () => {
			if (a) {
				if (a.pending.delete(n), a.done.add(n), a.pending.size === 0) {
					var t = e.outrogroups;
					Vr(e, o(a.done)), t.delete(a), t.size === 0 && (e.outrogroups = null);
				}
			} else --s;
		}, !1);
	}
	if (s === 0) {
		var l = r.length === 0 && n !== null && e.pending.size === 0;
		if (l) {
			var u = n, d = u.parentNode;
			un(d), d.append(u), e.items.clear();
		}
		Vr(e, t, !l);
	} else a = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(a);
}
function Vr(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= te, Ln(a, document.createDocumentFragment())) : An(t[i], n);
	}
}
var Hr;
function Y(e, t, n, i, a, s = null) {
	var c = e, l = /* @__PURE__ */ new Map();
	if (t & 4) {
		var u = e;
		c = D ? Me(/* @__PURE__ */ cn(u)) : u.appendChild(sn());
	}
	D && Ne();
	var d = null, f = /* @__PURE__ */ yt(() => {
		var e = n();
		return r(e) ? e : e == null ? [] : o(e);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, Wr(v, p, c, t, i), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= te, Kr(d, null, c)) : Fn(d) : Nn(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: Tn(() => {
			p = U(f);
			var e = p.length;
			let r = !1;
			D && Ie(c) === "[!" != (e === 0) && (c = Fe(), Me(c), je(!1), r = !0);
			for (var o = /* @__PURE__ */ new Set(), u = P, v = dn(), y = 0; y < e; y += 1) {
				D && O.nodeType === 8 && O.data === "]" && (c = O, r = !0, je(!1));
				var b = p[y], x = i(b, y), S = h ? null : l.get(x);
				S ? (S.v && Jt(S.v, b), S.i && Jt(S.i, y), v && u.unskip_effect(S.e)) : (S = Gr(l, h ? c : Hr ??= sn(), b, x, y, a, t, n), h || (S.e.f |= te), l.set(x, S)), o.add(x);
			}
			if (e === 0 && s && !d && (h ? d = En(() => s(c)) : (d = En(() => s(Hr ??= sn())), d.f |= te)), e > o.size && _e("", "", ""), D && e > 0 && Me(Fe()), !h) {
				if (m.set(u, o), v) {
					for (let [e, t] of l) o.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			r && je(!0), U(f);
		}),
		flags: t,
		items: l,
		pending: m,
		outrogroups: null,
		fallback: d
	};
	h = !1, D && (c = O);
}
function Ur(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function Wr(e, t, n, r, i) {
	var a = !!(r & 8), s = t.length, c = e.items, l = Ur(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (a) for (v = 0; v < s; v += 1) h = t[v], g = i(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = i(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (Fn(_), a && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= te, _ === l) Kr(_, null, n);
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
		for (let t of e.outrogroups) t.pending.size === 0 && (Vr(e, o(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var w = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || w.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && w.push(l), l = Ur(l.next);
		var T = w.length;
		if (T > 0) {
			var ee = r & 4 && s === 0 ? n : null;
			if (a) {
				for (v = 0; v < T; v += 1) w[v].nodes?.a?.measure();
				for (v = 0; v < T; v += 1) w[v].nodes?.a?.fix();
			}
			Br(e, w, ee);
		}
	}
	a && Ke(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Gr(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? Kt(n) : /* @__PURE__ */ qt(n, !1, !1) : null, l = o & 2 ? Kt(i) : null;
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
		var o = /* @__PURE__ */ ln(r);
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
function X(e) {
	return typeof e == "object" ? Yr(e) : e ?? "";
}
var Xr = [..." 	\n\r\f\xA0\v﻿"];
function Zr(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || Xr.includes(r[o - 1])) && (s === r.length || Xr.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function Qr(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function $r(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function ei(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\/\*.*?\*\//g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map($r)), i && c.push(...Object.keys(i).map($r));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = $r(e.substring(l, u).trim());
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
		return r && (n += Qr(r)), i && (n += Qr(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/class.js
function Z(e, t, n, r, i, a) {
	var o = e[le];
	if (D || o !== n || o === void 0) {
		var s = Zr(n, r, a);
		(!D || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[le] = n;
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
	var i = e[ue];
	if (D || i !== t) {
		var a = ei(t, r);
		(!D || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[ue] = t;
	} else r && (Array.isArray(r) ? (ti(e, n?.[0], r[0]), ti(e, n?.[1], r[1], "important")) : ti(e, n, r));
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function ri(e, t, n = !1) {
	if (e.multiple) {
		if (t == null) return;
		if (!r(t)) return ke();
		for (var i of e.options) i.selected = t.includes(ai(i));
	} else {
		for (i of e.options) if (en(ai(i), t)) {
			i.selected = !0;
			return;
		}
		(!n || t !== void 0) && (e.selectedIndex = -1);
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
	}), vn(() => {
		t.disconnect();
	});
}
function ai(e) {
	return "__value" in e ? e.__value : e.value;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var oi = Symbol("is custom element"), si = Symbol("is html"), ci = me ? "link" : "LINK", li = me ? "progress" : "PROGRESS";
function ui(e) {
	if (D) {
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
		e[fe] = n, Ke(n), it();
	}
}
function di(e, t) {
	var n = pi(e);
	n.value !== (n.value = t ?? void 0) && (e.value !== t || t === 0 && e.nodeName === li) && (e.value = t ?? "");
}
function fi(e, t) {
	var n = pi(e);
	n.checked !== (n.checked = t ?? void 0) && (e.checked = t);
}
function Q(e, t, n, r) {
	var i = pi(e);
	D && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === ci) || i[t] !== (i[t] = n) && (t === "loading" && (e[se] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && hi(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function pi(e) {
	return e[ce] ??= {
		[oi]: e.nodeName.includes("-"),
		[si]: e.namespaceURI === n
	};
}
var mi = /* @__PURE__ */ new Map();
function hi(e) {
	var t = e.getAttribute("is") || e.nodeName, n = mi.get(t);
	if (n) return n;
	mi.set(t, n = []);
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var o in r = l(i), r) r[o].set && o !== "innerHTML" && o !== "textContent" && o !== "innerText" && n.push(o);
		i = f(i);
	}
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function gi(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet();
	ot(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = _i(e) ? vi(a) : a, n(a), P !== null && r.add(P), await cr(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (D && e.defaultValue !== e.value || dr(t) == null && e.value) && (n(_i(e) ? vi(e.value) : e.value), P !== null && r.add(P)), wn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = P;
			if (r.has(i)) return;
		}
		_i(e) && n === vi(e.value) || (e.type !== "date" || n || e.value) && n !== e.value && (e.value = n ?? "");
	});
}
function _i(e) {
	var t = e.type;
	return t === "number" || t === "range";
}
function vi(e) {
	return e === "" ? null : +e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function yi(e, t) {
	return e === t || e?.[ae] === t;
}
function $(e = {}, t, n, r) {
	var i = A.r, a = H;
	return Sn(() => {
		var o, s;
		return wn(() => {
			o = s, s = r?.() || [], dr(() => {
				yi(n(...s), e) || (t(e, ...s), o && yi(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && yi(n(...s), e) && t(null, ...s);
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
	var i = !Be || !!(n & 2), a = !!(n & 8), o = !!(n & 16), s = r, l = !0, u = void 0, d = () => o && i ? (u ??= /* @__PURE__ */ ht(r), U(u)) : (l && (l = !1, s = o ? dr(r) : r), s);
	let f;
	if (a) {
		var p = ae in e || oe in e;
		f = c(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	a ? [m, h] = tt(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && Se(t), f(m)));
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
	var v = !1, y = (n & 1 ? ht : yt)(() => (v = !1, g()));
	a && U(y);
	var b = H;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? U(y) : i && a ? Qt(e) : e;
			return I(y, n), v = !0, s !== void 0 && (s = n), e;
		}
		return Bn && v || b.f & 16384 ? y.v : U(y);
	});
}
var xi = /* @__PURE__ */ G("<article class=\"pc-workflow-starter\"><strong> </strong><p> </p> <small> </small> <button class=\"menu_button\"> </button></article>"), Si = /* @__PURE__ */ G("<small>No supported operations yet. Reference-based voice matching is a future candidate.</small>"), Ci = /* @__PURE__ */ G("<button class=\"menu_button\"> <small> </small></button>"), wi = /* @__PURE__ */ G("<button class=\"menu_button\" draggable=\"true\"> <small>· legacy</small></button>"), Ti = /* @__PURE__ */ G("<details class=\"pc-workflow-family\"><summary> </summary><p> </p> <!> <!> <!></details>"), Ei = /* @__PURE__ */ G("<label>Workflow mode <select aria-label=\"Workflow mode\" class=\"text_pole\"><option>Legacy · Replace prompt</option><option>Native · Guidance and reviewed reply</option></select></label> <h3>Workflow examples</h3> <!> <h3>Node families</h3> <!>", 1), Di = /* @__PURE__ */ G("<option> </option>"), Oi = /* @__PURE__ */ G("<label> <select class=\"text_pole\"><option>Choose a connection</option><!></select></label> <label> <input class=\"text_pole\" placeholder=\"Use profile model\"/></label>", 1), ki = /* @__PURE__ */ G("<p class=\"pc-error\"> </p>"), Ai = /* @__PURE__ */ G("<small> </small>"), ji = /* @__PURE__ */ G("<button class=\"menu_button\"> </button>"), Mi = /* @__PURE__ */ G("<label>Model role<input class=\"text_pole\"/></label> <label>Node connection override<select class=\"text_pole\"><option>Use role binding</option><!></select></label> <label>Node model override<input class=\"text_pole\" placeholder=\"Use bound model\"/></label> <small> </small>", 1), Ni = /* @__PURE__ */ G("<select class=\"text_pole\"></select>"), Pi = /* @__PURE__ */ G("<input type=\"checkbox\"/>"), Fi = /* @__PURE__ */ G("<input class=\"text_pole\" type=\"number\"/>"), Ii = /* @__PURE__ */ G("<textarea class=\"text_pole\"></textarea>"), Li = /* @__PURE__ */ G("<p class=\"pc-error\" role=\"alert\"> </p>"), Ri = /* @__PURE__ */ G("<small>One literal phrase per line. Imported objects use one JSON object per line with a \"phrase\" field; keep their other fields to preserve metadata. Quote a literal phrase that starts with &#123;, [ or &quot; as a JSON string.</small> <!>", 1), zi = /* @__PURE__ */ G("<label> <!></label> <!>", 1), Bi = /* @__PURE__ */ G("<small>Protected literal pins reserve every source message containing an exact match verbatim. A missing pin reports PIN_MISSING. Source IDs are for inspection.</small>"), Vi = /* @__PURE__ */ G("<div class=\"pc-workflow-editor\"><p> </p> <p> </p> <label>Alias<input class=\"text_pole\" data-alias=\"\" maxlength=\"80\"/></label> <button class=\"menu_button\">Reset alias</button> <label><input type=\"checkbox\"/> Compact card</label> <label><input type=\"checkbox\"/> Enabled</label> <small>Disabled operations block preflight; they do not bypass.</small> <!> <!> <button class=\"menu_button\">Duplicate operation</button> <button class=\"menu_button pc-danger\">Delete operation</button> <!> <!></div>"), Hi = /* @__PURE__ */ G("<button class=\"menu_button\"> </button> <!>", 1), Ui = /* @__PURE__ */ G("<p role=\"status\"> </p>"), Wi = /* @__PURE__ */ G("<h4>Computed guidance</h4><pre> </pre>", 1), Gi = /* @__PURE__ */ G("<div class=\"pc-workflow-comparison\"><div>Original<pre> </pre></div><div>Candidate<pre> </pre></div></div> <!> <button class=\"menu_button\">Apply reviewed candidate</button> <button class=\"menu_button\">Reject candidate</button> <small>Apply rechecks source freshness. Other memory extensions may already have consumed the original; saving does not confirm durability.</small>", 1), Ki = /* @__PURE__ */ G("<h4 class=\"pc-workflow-result\">Workflow result</h4> <!> <p> </p> <p> </p> <!> <!> <details><summary>Findings and changes</summary><pre> </pre></details> <details><summary>Reports and request trace</summary><pre> </pre></details>", 1), qi = /* @__PURE__ */ G("<h3> </h3> <p> </p> <strong> </strong> <!> <button class=\"menu_button\"> </button> <small> </small> <!> <button class=\"menu_button\"> </button> <!> <!> <h4>Inspect operations</h4> <!> <!> <!>", 1), Ji = /* @__PURE__ */ G("<section class=\"pc-workflows\"><!></section>");
function Yi(e, t) {
	j(t, !0);
	let n = bi(t, "mode", 3, "setup"), r = /* @__PURE__ */ F(null), i = /* @__PURE__ */ F(null);
	function a(e) {
		(e.graphId !== U(r)?.graphId || e.selectedId !== U(r)?.selectedId) && I(i, null), I(r, e);
	}
	let o = (e) => e.split("\n").filter((e) => e.trim());
	function s(e, n) {
		let r = t.actions.editRules(e, n);
		I(i, r ? {
			text: n,
			error: r
		} : null, !0);
	}
	var c = { update: a }, l = Dr(), u = R(l), d = (e) => {
		var a = Ji(), c = L(a), l = (e) => {
			var n = Ei(), i = R(n), a = z(L(i)), o = L(a);
			o.value = o.__value = "legacy";
			var s = z(o);
			s.value = s.__value = "native", k(a);
			var c;
			ii(a), k(i);
			var l = z(i, 4);
			Y(l, 17, () => U(r).starters, (e) => e.id, (e, n) => {
				var r = xi(), i = L(r), a = L(i, !0);
				k(i);
				var o = z(i), s = L(o, !0);
				k(o);
				var c = z(o, 2), l = L(c);
				k(c);
				var u = z(c, 2), d = L(u);
				k(u), k(r), B((e) => {
					q(a, U(n).title), q(s, U(n).purpose), q(l, `${U(n).phase === "pre" ? "Before reply · Guidance" : "After reply · Reviewed reply"} · Roles: ${e ?? ""} · Maximum ${U(n).callBound ?? ""} auxiliary requests`), q(d, `Install ${U(n).title ?? ""}`);
				}, [() => U(n).roles.join(", ")]), W("click", u, () => t.actions.install(U(n).id)), K(e, r);
			}), Y(z(l, 4), 17, () => U(r).families, (e) => e.name, (e, n) => {
				var i = Ti(), a = L(i), o = L(a, !0);
				k(a);
				var s = z(a), c = L(s, !0);
				k(s);
				var l = z(s, 2), u = (e) => {
					K(e, Si());
				};
				J(l, (e) => {
					U(n).name === "Transpose" && e(u);
				});
				var d = z(l, 2);
				Y(d, 17, () => U(n).operations, (e) => e.id, (e, n) => {
					var i = Ci(), a = L(i), o = z(a), s = L(o);
					k(o), k(i), B(() => {
						i.disabled = !U(r).native || !U(n).compatible, Q(i, "title", U(r).native ? U(n).compatible ? "Add operation" : "This operation requires the " + U(n).phase + " phase." : "Install a native example first; legacy controls remain below."), q(a, `${U(n).title ?? ""} `), q(s, `· ${U(n).phase ?? ""}`);
					}), W("click", i, () => t.actions.addNode(U(n).id)), K(e, i);
				});
				var f = z(d, 2), p = (e) => {
					var r = Dr();
					Y(R(r), 17, () => U(n).legacy, (e) => e.id, (e, n) => {
						var r = wi(), i = L(r);
						Pe(), k(r), B(() => {
							Q(r, "aria-label", "Add legacy " + U(n).title), q(i, `${U(n).title ?? ""} `);
						}), gr("dragstart", r, (e) => e.dataTransfer?.setData("application/x-prompt-canvas", JSON.stringify({
							kind: "block",
							type: U(n).id
						}))), W("click", r, () => t.actions.addLegacyNode(U(n).id)), K(e, r);
					}), K(e, r);
				};
				J(f, (e) => {
					U(r).native || e(p);
				}), k(i), B(() => {
					i.open = U(r).native, q(o, U(n).name), q(c, U(n).description);
				}), K(e, i);
			}), B(() => {
				c !== (c = U(r).workflowMode) && (a.value = (a.__value = U(r).workflowMode) ?? "", ri(a, U(r).workflowMode));
			}), W("change", a, (e) => t.actions.setMode(e.currentTarget.value)), K(e, n);
		}, u = (e) => {
			var n = qi(), a = R(n), c = L(a, !0);
			k(a);
			var l = z(a, 2), u = L(l, !0);
			k(l);
			var d = z(l, 2), f = L(d);
			k(d);
			var p = z(d, 2);
			Y(p, 17, () => U(r).roles, (e) => e.name, (e, n) => {
				var i = Oi(), a = R(i), o = L(a), s = z(o), c = L(s);
				c.value = c.__value = "", Y(z(c), 17, () => U(r).profiles, (e) => e.id, (e, t) => {
					var n = Di(), r = L(n, !0);
					k(n);
					var i = {};
					B(() => {
						q(r, U(t).name), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
					}), K(e, n);
				}), k(s);
				var l;
				ii(s), k(a);
				var u = z(a, 2), d = L(u), f = z(d);
				ui(f), k(u), B(() => {
					q(o, `${U(n).name ?? ""} connection `), Q(s, "aria-label", U(n).name + " connection"), l !== (l = U(n).profileId) && (s.value = (s.__value = U(n).profileId) ?? "", ri(s, U(n).profileId)), q(d, `${U(n).name ?? ""} model override`), di(f, U(n).model);
				}), W("change", s, (e) => t.actions.bindRole(U(n).name, e.currentTarget.value, U(n).model)), W("input", f, (e) => t.actions.bindRole(U(n).name, U(n).profileId, e.currentTarget.value)), K(e, i);
			});
			var m = z(p, 2), h = L(m);
			k(m);
			var g = z(m, 2), _ = L(g);
			k(g);
			var v = z(g, 2);
			Y(v, 17, () => U(r).issues, zr, (e, t) => {
				var n = ki(), r = L(n, !0);
				k(n), B(() => q(r, U(t))), K(e, n);
			});
			var y = z(v, 2), b = L(y, !0);
			k(y);
			var x = z(y, 2), S = (e) => {
				var t = Ai(), n = L(t);
				k(t), B(() => q(n, `Test workflow does not publish guidance. A later Send reruns the workflow and may incur up to ${U(r).callBound ?? ""} auxiliary requests again.`)), K(e, t);
			};
			J(x, (e) => {
				U(r).phase === "pre" && e(S);
			});
			var C = z(x, 2);
			Y(C, 17, () => U(r).groups, (e) => e.id, (e, n) => {
				var r = ji(), i = L(r);
				k(r), B(() => q(i, `${U(n).collapsed ? "Open" : "Fold"} ${U(n).title ?? ""} formation · Surface · maximum ${U(n).callBound ?? ""} ${U(n).callBound === 1 ? "request" : "requests"}`)), W("click", r, () => t.actions.expand(U(n).id)), K(e, r);
			});
			var w = z(C, 4);
			Y(w, 17, () => U(r).nodes, (e) => e.id, (e, n) => {
				var a = Hi(), c = R(a), l = L(c);
				k(c);
				var u = z(c, 2), d = (e) => {
					var a = Vi(), c = L(a), l = L(c);
					k(c);
					var u = z(c, 2), d = L(u);
					k(u);
					var f = z(u, 2), p = z(L(f));
					ui(p), k(f);
					var m = z(f, 2), h = z(m, 2), g = L(h);
					ui(g), Pe(), k(h);
					var _ = z(h, 2), v = L(_);
					ui(v), Pe(), k(_);
					var y = z(_, 4), b = (e) => {
						var i = Mi(), a = R(i), o = z(L(a));
						ui(o), k(a);
						var s = z(a, 2), c = z(L(s)), l = L(c);
						l.value = l.__value = "", Y(z(l), 17, () => U(r).profiles, (e) => e.id, (e, t) => {
							var n = Di(), r = L(n, !0);
							k(n);
							var i = {};
							B(() => {
								q(r, U(t).name), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
							}), K(e, n);
						}), k(c);
						var u;
						ii(c), k(s);
						var d = z(s, 2), f = z(L(d));
						ui(f), k(d);
						var p = z(d, 2), m = L(p);
						k(p), B(() => {
							di(o, U(n).modelRole), u !== (u = U(n).profileId) && (c.value = (c.__value = U(n).profileId) ?? "", ri(c, U(n).profileId)), di(f, U(n).model), q(m, `Effective connection: ${U(n).effective ?? ""}`);
						}), W("input", o, (e) => t.actions.updateNode(U(n).id, "modelRole", e.currentTarget.value)), W("change", c, (e) => t.actions.updateNode(U(n).id, "profileId", e.currentTarget.value || null)), W("input", f, (e) => t.actions.updateNode(U(n).id, "model", e.currentTarget.value || null)), K(e, i);
					};
					J(y, (e) => {
						U(n).modelRole && e(b);
					});
					var x = z(y, 2);
					Y(x, 17, () => U(n).controls, (e) => e.key, (e, r) => {
						var a = zi(), c = R(a), l = L(c), u = z(l), d = (e) => {
							var i = Ni();
							Y(i, 21, () => U(r).options, zr, (e, t) => {
								var n = Di(), r = L(n, !0);
								k(n);
								var i = {};
								B(() => {
									q(r, U(t)), i !== (i = U(t)) && (n.value = (n.__value = U(t)) ?? "");
								}), K(e, n);
							}), k(i);
							var a;
							ii(i), B((e) => {
								a !== (a = e) && (i.value = (i.__value = e) ?? "", ri(i, e));
							}, [() => String(U(r).value)]), W("change", i, (e) => t.actions.updateNode(U(n).id, U(r).key, e.currentTarget.value)), K(e, i);
						}, f = (e) => {
							var i = Pi();
							ui(i), B((e) => fi(i, e), [() => !!U(r).value]), W("change", i, (e) => t.actions.updateNode(U(n).id, U(r).key, e.currentTarget.checked)), K(e, i);
						}, p = (e) => {
							var i = Fi();
							ui(i), B((e) => {
								Q(i, "aria-label", U(r).label), Q(i, "min", U(r).key === "keepRecent" ? 0 : 1), di(i, e);
							}, [() => Number(U(r).value)]), W("input", i, (e) => t.actions.updateNode(U(n).id, U(r).key, Number(e.currentTarget.value))), K(e, i);
						}, m = (e) => {
							var t = Ii();
							nt(t), B((e) => {
								Q(t, "aria-label", U(r).label), Q(t, "aria-invalid", !!U(i)), Q(t, "aria-describedby", "rule-help-" + U(n).id + (U(i) ? " rule-error-" + U(n).id : "")), di(t, e);
							}, [() => U(i)?.text ?? String(U(r).value)]), W("input", t, (e) => s(U(n).id, e.currentTarget.value)), K(e, t);
						}, h = (e) => {
							var i = Ii();
							nt(i), B((e) => di(i, e), [() => String(U(r).value)]), W("input", i, (e) => t.actions.updateNode(U(n).id, U(r).key, U(r).kind === "lines" ? o(e.currentTarget.value) : e.currentTarget.value)), K(e, i);
						};
						J(u, (e) => {
							U(r).options ? e(d) : U(r).kind === "boolean" ? e(f, 1) : U(r).kind === "number" ? e(p, 2) : U(r).kind === "rules" ? e(m, 3) : e(h, -1);
						}), k(c);
						var g = z(c, 2), _ = (e) => {
							var t = Ri(), r = R(t), a = z(r, 2), o = (e) => {
								var t = Li(), r = L(t, !0);
								k(t), B(() => {
									Q(t, "id", "rule-error-" + U(n).id), q(r, U(i).error);
								}), K(e, t);
							};
							J(a, (e) => {
								U(i) && e(o);
							}), B(() => Q(r, "id", "rule-help-" + U(n).id)), K(e, t);
						};
						J(g, (e) => {
							U(r).kind === "rules" && e(_);
						}), B(() => q(l, `${U(r).label ?? ""} `)), K(e, a);
					});
					var S = z(x, 2), C = z(S, 2), w = z(C, 2), T = (e) => {
						K(e, Bi());
					};
					J(w, (e) => {
						U(n).operation === "smart-compactor" && e(T);
					});
					var ee = z(w, 2), te = (e) => {
						var t = Ai(), n = L(t, !0);
						k(t), B(() => q(n, U(r).quoteHelp)), K(e, t);
					};
					J(ee, (e) => {
						U(n).operation === "pattern-scan" && e(te);
					}), k(a), B(() => {
						q(l, `${U(n).family ?? ""} · ${U(n).phase ?? ""} phase · ${U(n).input ?? ""} → ${U(n).output ?? ""}`), q(d, `Canonical type: ${U(n).canonicalTitle ?? ""}`), di(p, U(n).alias), fi(g, U(n).compact), fi(v, U(n).enabled);
					}), W("input", p, (e) => t.actions.presentNode(U(n).id, "alias", e.currentTarget.value)), W("click", m, () => t.actions.presentNode(U(n).id, "alias", "")), W("change", g, (e) => t.actions.presentNode(U(n).id, "compact", e.currentTarget.checked)), W("change", v, (e) => t.actions.updateNode(U(n).id, "enabled", e.currentTarget.checked)), W("click", S, () => t.actions.duplicate(U(n).id)), W("click", C, () => t.actions.remove(U(n).id)), K(e, a);
				};
				J(u, (e) => {
					U(n).id === U(r).selectedId && e(d);
				}), B(() => {
					Q(c, "aria-pressed", U(r).selectedId === U(n).id), q(l, `Inspect ${U(n).title ?? ""}`);
				}), W("click", c, () => t.actions.inspect(U(n).id)), K(e, a);
			});
			var T = z(w, 2), ee = (e) => {
				var t = Ui(), n = L(t, !0);
				k(t), B(() => q(n, U(r).status)), K(e, t);
			};
			J(T, (e) => {
				U(r).status && e(ee);
			});
			var te = z(T, 2), ne = (e) => {
				var n = Ki(), a = z(R(n), 2), o = (e) => {
					var t = ki(), n = L(t, !0);
					k(t), B(() => q(n, U(r).result.error)), K(e, t);
				};
				J(a, (e) => {
					U(r).result.error && e(o);
				});
				var s = z(a, 2), c = L(s);
				k(s);
				var l = z(s, 2), u = L(l);
				k(l);
				var d = z(l, 2), f = (e) => {
					var t = Wi(), n = z(R(t)), i = L(n, !0);
					k(n), B(() => q(i, U(r).result.guidance)), K(e, t);
				};
				J(d, (e) => {
					U(r).result.guidance && e(f);
				});
				var p = z(d, 2), m = (e) => {
					var n = Gi(), a = R(n), o = L(a), s = z(L(o)), c = L(s, !0);
					k(s), k(o);
					var l = z(o), u = z(L(l)), d = L(u, !0);
					k(u), k(l), k(a);
					var f = z(a, 2), p = (e) => {
						var t = ki(), n = L(t, !0);
						k(t), B(() => q(n, U(r).result.applyIssue)), K(e, t);
					};
					J(f, (e) => {
						U(r).result.applyIssue && e(p);
					});
					var m = z(f, 2), h = z(m, 2);
					Pe(2), B(() => {
						q(c, U(r).result.original), q(d, U(r).result.candidate), m.disabled = U(r).busy || !!U(r).result.applyIssue || !!U(i), h.disabled = U(r).busy;
					}), W("click", m, () => t.actions.apply()), W("click", h, () => t.actions.reject()), K(e, n);
				};
				J(p, (e) => {
					U(r).result.applyAvailable && e(m);
				});
				var h = z(p, 2), g = z(L(h)), _ = L(g, !0);
				k(g), k(h);
				var v = z(h, 2), y = z(L(v)), b = L(y, !0);
				k(y), k(v), B((e, t, n) => {
					q(c, `Actual auxiliary requests: ${U(r).result.actualCalls ?? ""} / ${U(r).result.callBound ?? ""}`), q(u, `Token count method: ${e ?? ""}`), q(_, t), q(b, n);
				}, [
					() => U(r).result.tokenMethods.join(", ") || "Not reported",
					() => JSON.stringify({
						findings: U(r).result.findings,
						changes: U(r).result.changes
					}, null, 2),
					() => JSON.stringify({
						reports: U(r).result.reports,
						calls: U(r).result.calls
					}, null, 2)
				]), K(e, n);
			};
			J(te, (e) => {
				U(r).result && e(ne);
			}), B(() => {
				q(c, U(r).name), q(u, U(r).phase === "pre" ? "Guidance helps SillyTavern plan its normal reply." : "Review a revision of the latest completed assistant reply."), q(f, `Maximum auxiliary requests: ${U(r).callBound ?? ""}`), q(h, `Assign ${U(r).phase ?? ""} phase and enable native mode`), q(_, `${U(r).assigned ? "Assigned to this phase." : "Phase is not assigned."} Mode: ${U(r).workflowMode ?? ""}. Arming is a separate action.`), y.disabled = U(r).busy || !!U(r).issues.length || !!U(i), q(b, U(r).busy ? "Running…" : U(r).phase === "pre" ? "Test workflow" : "Run reviewed repair");
			}), W("click", m, () => t.actions.assign(U(r)?.phase || "")), W("click", y, () => t.actions.run()), K(e, n);
		};
		J(c, (e) => {
			n() === "library" ? e(l) : e(u, -1);
		}), k(a), B(() => {
			Q(a, "data-pc-workflows", n()), Q(a, "aria-label", n() === "library" ? "Workflow library" : "Workflow setup and review");
		}), K(e, a);
	};
	return J(u, (e) => {
		U(r) && e(d);
	}), K(e, l), M(c);
}
_r([
	"change",
	"click",
	"input"
]);
//#endregion
//#region ui/NodeCard.svelte
var Xi = /* @__PURE__ */ G("<div><span class=\"pc-native-pin-label\"> <small> </small></span> <div role=\"img\"></div></div>"), Zi = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-node-action pc-host-result\" aria-label=\"Preview host result\"><i class=\"fa-solid fa-eye\" aria-hidden=\"true\"></i> Host result</button>"), Qi = /* @__PURE__ */ G("<div class=\"pc-native-heading\"><svg class=\"pc-native-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path></path></svg><span class=\"pc-node-title\"> </span></div> <div class=\"pc-native-pins\"></div> <!>", 1), $i = /* @__PURE__ */ G("<span> </span>"), ea = /* @__PURE__ */ G("<span class=\"pc-off-pill\">OFF</span>"), ta = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-node-action pc-help-btn fa-solid fa-circle-question\" title=\"How Deciders work\" aria-label=\"How Deciders work\"></button>"), na = /* @__PURE__ */ G("<button type=\"button\"></button>"), ra = /* @__PURE__ */ G("<div class=\"pc-node-body\"> </div>"), ia = /* @__PURE__ */ G("<div> </div>"), aa = /* @__PURE__ */ G("<div><b> </b><span> </span></div>"), oa = /* @__PURE__ */ G("<div><!> <!></div>"), sa = /* @__PURE__ */ G("· <b> </b>", 1), ca = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-node-action pc-node-model pc-node-model-pick\"><i class=\"fa-solid fa-microchip\"></i> <!> <i class=\"fa-solid fa-caret-down pc-model-caret\"></i></button>"), la = /* @__PURE__ */ G("<div class=\"pc-node-model\"><i class=\"fa-solid fa-microchip\"></i> <!></div>"), ua = /* @__PURE__ */ G("<div><i></i> </div>"), da = /* @__PURE__ */ G("<span class=\"pc-port-keyname\"> </span>"), fa = /* @__PURE__ */ G("<i></i>"), pa = /* @__PURE__ */ G("<div><!><!></div>"), ma = /* @__PURE__ */ G("<div class=\"pc-node-head\"><span class=\"pc-badge\"><i></i> </span> <span class=\"pc-node-title\"> </span> <!> <!> <!> <!></div> <!> <!> <!> <!> <!>", 1), ha = /* @__PURE__ */ G("<div role=\"group\"><!></div>");
function ga(e, t) {
	j(t, !0);
	let n = (e) => e.stopPropagation();
	var r = ha();
	let i;
	var a = L(r), o = (e) => {
		var r = Qi(), i = R(r), a = L(i), o = L(a);
		k(a);
		var s = z(a), c = L(s, !0);
		k(s), k(i);
		var l = z(i, 2);
		Y(l, 21, () => t.card.ports, (e) => e.id, (e, n) => {
			var r = Xi();
			let i;
			var a = L(r), o = L(a, !0), s = z(o), c = L(s, !0);
			k(s), k(a);
			var l = z(a, 2);
			k(r), B(() => {
				Z(r, 1, `pc-native-row pc-native-row-${U(n).dir}`), i = ni(r, "", i, { "grid-row": U(n).row }), q(o, U(n).label), q(c, U(n).kind), Z(l, 1, X(U(n).className)), Q(l, "data-node", t.card.id), Q(l, "data-dir", U(n).dir), Q(l, "data-port", U(n).port), Q(l, "data-side", U(n).side), Q(l, "data-kind", U(n).kind), Q(l, "title", U(n).title), Q(l, "aria-label", U(n).title);
			}), gr("mouseenter", l, () => t.actions.hoverPin({
				nodeId: t.card.id,
				dir: U(n).dir,
				port: U(n).port
			})), gr("mouseleave", l, () => t.actions.hoverPin(null)), K(e, r);
		}), k(l);
		var u = z(l, 2), d = (e) => {
			var r = Zi();
			W("mousedown", r, n), W("click", r, (e) => {
				n(e), t.actions.hostResult(t.card.id);
			}), K(e, r);
		};
		J(u, (e) => {
			t.card.hostResult && e(d);
		}), B(() => {
			Q(o, "d", t.card.iconPath), Q(s, "title", t.card.titleHint), q(c, t.card.title);
		}), K(e, r);
	}, s = (e) => {
		var r = ma(), i = R(r), a = L(i), o = L(a), s = z(o);
		k(a);
		var c = z(a, 2), l = L(c, !0);
		k(c);
		var u = z(c, 2), d = (e) => {
			var n = $i(), r = L(n, !0);
			k(n), B(() => {
				Z(n, 1, X(t.card.token.className)), Q(n, "title", t.card.token.title), q(r, t.card.token.text);
			}), K(e, n);
		};
		J(u, (e) => {
			t.card.token && e(d);
		});
		var f = z(u, 2), p = (e) => {
			var n = ea();
			B(() => Q(n, "title", t.card.offHint)), K(e, n);
		};
		J(f, (e) => {
			t.card.offHint && e(p);
		});
		var m = z(f, 2), h = (e) => {
			var r = ta();
			W("mousedown", r, n), W("click", r, (e) => {
				n(e), t.actions.help(t.card.id);
			}), K(e, r);
		};
		J(m, (e) => {
			t.card.help && e(h);
		});
		var g = z(m, 2), _ = (e) => {
			var r = na();
			B(() => {
				Z(r, 1, `pc-node-action pc-toggle fa-solid ${t.card.enabled ? "fa-toggle-on pc-toggle-on" : "fa-toggle-off pc-toggle-off"}`), Q(r, "title", t.card.enabled ? "Switched on — click to switch off" : "Switched off — click to switch on"), Q(r, "aria-label", `Switch ${t.card.title} ${t.card.enabled ? "off" : "on"}`), Q(r, "aria-pressed", t.card.enabled);
			}), W("mousedown", r, n), W("click", r, (e) => {
				n(e), t.actions.toggle(t.card.id);
			}), K(e, r);
		};
		J(g, (e) => {
			t.card.toggle && e(_);
		}), k(i);
		var v = z(i, 2), y = (e) => {
			var n = ra(), r = L(n, !0);
			k(n), B(() => q(r, t.card.body)), K(e, n);
		};
		J(v, (e) => {
			t.card.body !== null && e(y);
		});
		var b = z(v, 2), x = (e) => {
			var n = oa(), r = L(n), i = (e) => {
				var n = ia(), r = L(n, !0);
				k(n), B(() => {
					Z(n, 1, X(t.card.mode.className)), q(r, t.card.mode.text);
				}), K(e, n);
			};
			J(r, (e) => {
				t.card.mode && e(i);
			}), Y(z(r, 2), 17, () => t.card.rows, (e) => e.id, (e, t) => {
				var n = aa(), r = L(n), i = L(r, !0);
				k(r);
				var a = z(r), o = L(a, !0);
				k(a), k(n), B(() => {
					Z(n, 1, `pc-dec-key${U(t).chosen ? " pc-dec-chosen" : ""}${U(t).fallback ? " pc-dec-fallback" : ""}`), q(i, U(t).name), q(o, U(t).text);
				}), K(e, n);
			}), k(n), B(() => Z(n, 1, X(t.card.rowClass))), K(e, n);
		};
		J(b, (e) => {
			t.card.body === null && e(x);
		});
		var S = z(b, 2), C = (e) => {
			var r = Dr(), i = R(r), a = (e) => {
				var r = ca(), i = z(L(r)), a = z(i), o = (e) => {
					var n = sa(), r = z(R(n)), i = L(r, !0);
					k(r), B(() => q(i, t.card.model.actual)), K(e, n);
				};
				J(a, (e) => {
					t.card.model.actual && e(o);
				}), Pe(2), k(r), B(() => {
					Q(r, "title", t.card.model.title), q(i, ` ${t.card.model.where ?? ""}`);
				}), W("mousedown", r, n), W("dblclick", r, n), W("click", r, (e) => {
					n(e), t.actions.model(t.card.id, e.currentTarget);
				}), K(e, r);
			}, o = (e) => {
				var n = la(), r = z(L(n)), i = z(r), a = (e) => {
					var n = sa(), r = z(R(n)), i = L(r, !0);
					k(r), B(() => q(i, t.card.model.actual)), K(e, n);
				};
				J(i, (e) => {
					t.card.model.actual && e(a);
				}), k(n), B(() => {
					Q(n, "title", t.card.model.title), q(r, ` ${t.card.model.where ?? ""}`);
				}), K(e, n);
			};
			J(i, (e) => {
				t.card.model.pick ? e(a) : e(o, -1);
			}), K(e, r);
		};
		J(S, (e) => {
			t.card.model && e(C);
		});
		var w = z(S, 2);
		Y(w, 19, () => t.card.notices, (e, t) => `${e.className}:${t}`, (e, t) => {
			var n = ua(), r = L(n), i = z(r);
			k(n), B(() => {
				Z(n, 1, X(U(t).className)), Q(n, "title", U(t).title), Z(r, 1, `fa-solid ${U(t).icon}`), q(i, ` ${U(t).text ?? ""}`);
			}), K(e, n);
		}), Y(z(w, 2), 17, () => t.card.ports, (e) => e.id, (e, n) => {
			var r = pa();
			let i;
			var a = L(r), o = (e) => {
				var t = da(), r = L(t, !0);
				k(t), B(() => q(r, U(n).label)), K(e, t);
			};
			J(a, (e) => {
				U(n).label && e(o);
			});
			var s = z(a), c = (e) => {
				var t = fa();
				B(() => Z(t, 1, `fa-solid ${U(n).icon}`)), K(e, t);
			};
			J(s, (e) => {
				U(n).icon && e(c);
			}), k(r), B(() => {
				Z(r, 1, X(U(n).className)), Q(r, "data-node", t.card.id), Q(r, "data-dir", U(n).dir), Q(r, "data-port", U(n).port), Q(r, "data-side", U(n).side), Q(r, "title", U(n).title), i = ni(r, "", i, { left: U(n).left === void 0 ? void 0 : `${U(n).left}%` });
			}), K(e, r);
		}), B(() => {
			Z(o, 1, `fa-solid ${t.card.icon} pc-badge-icon`), q(s, ` ${t.card.label ?? ""}`), Q(c, "title", t.card.titleHint), q(l, t.card.title);
		}), K(e, r);
	};
	J(a, (e) => {
		t.card.native ? e(o) : e(s, -1);
	}), k(r), B(() => {
		Z(r, 1, X(t.card.className)), Q(r, "data-id", t.card.id), Q(r, "title", t.card.hint), Q(r, "aria-label", `${t.card.label}: ${t.card.title}`), i = ni(r, "", i, {
			left: `${t.card.x}px`,
			top: `${t.card.y}px`,
			width: t.card.native ? void 0 : `${t.card.w}px`
		});
	}), gr("mouseenter", r, () => {
		t.card.native || t.actions.hover(t.card.id);
	}), gr("mouseleave", r, () => t.actions.hover(null)), K(e, r), M();
}
_r([
	"mousedown",
	"click",
	"dblclick"
]);
//#endregion
//#region ui/GroupCard.svelte
var _a = /* @__PURE__ */ G("<span class=\"pc-badge\"><i class=\"fa-solid fa-object-group pc-badge-icon\"></i> Group</span>"), va = /* @__PURE__ */ G("<i class=\"fa-solid fa-object-group\"></i>"), ya = /* @__PURE__ */ G("<span class=\"pc-group-frame-count\"> </span>"), ba = /* @__PURE__ */ G("<span> </span>"), xa = /* @__PURE__ */ G("<span class=\"pc-off-pill\" title=\"This whole group is switched off. Nothing in it is sent, and nothing passes through it.\">OFF</span>"), Sa = /* @__PURE__ */ G("<div class=\"pc-node-body\"> </div><div class=\"pc-node-model pc-group-io\"> </div> <div class=\"pc-node-cond\"> </div> <div class=\"pc-gport pc-gport-in\" data-gport=\"in\" title=\"Drag up to a block to wire it into this group\"></div> <div class=\"pc-gport pc-gport-out\" data-gport=\"out\" title=\"Drag to wire a block in this group into another block\"></div>", 1), Ca = /* @__PURE__ */ G("<div class=\"pc-group-resize\" data-action=\"resize\" title=\"Drag to resize the blanket\"></div>"), wa = /* @__PURE__ */ G("<div role=\"group\"><div><!> <span> </span> <!> <!> <!> <button type=\"button\"></button> <button type=\"button\" data-action=\"toggle\" aria-label=\"Toggle group\"></button></div> <!></div>");
function Ta(e, t) {
	j(t, !0);
	function n(e, n) {
		e.stopPropagation(), e.preventDefault(), t.actions.group(t.group.id, n);
	}
	function r(e, n) {
		e.stopPropagation(), e.detail === 0 && t.actions.group(t.group.id, n);
	}
	var i = wa();
	let a;
	var o = L(i), s = L(o), c = (e) => {
		K(e, _a());
	}, l = (e) => {
		K(e, va());
	};
	J(s, (e) => {
		t.group.collapsed ? e(c) : e(l, -1);
	});
	var u = z(s, 2), d = L(u, !0);
	k(u);
	var f = z(u, 2), p = (e) => {
		var n = ya(), r = L(n, !0);
		k(n), B(() => q(r, t.group.count)), K(e, n);
	};
	J(f, (e) => {
		t.group.collapsed || e(p);
	});
	var m = z(f, 2), h = (e) => {
		var n = ba(), r = L(n, !0);
		k(n), B(() => {
			Z(n, 1, X(t.group.token.className)), Q(n, "title", t.group.token.title), q(r, t.group.token.text);
		}), K(e, n);
	};
	J(m, (e) => {
		t.group.token && e(h);
	});
	var g = z(m, 2), _ = (e) => {
		K(e, xa());
	};
	J(g, (e) => {
		t.group.enabled || e(_);
	});
	var v = z(g, 2), y = z(v, 2);
	k(o);
	var b = z(o, 2), x = (e) => {
		var n = Sa(), r = R(n), i = L(r, !0);
		k(r);
		var a = z(r), o = L(a, !0);
		k(a);
		var s = z(a, 2), c = L(s, !0);
		k(s);
		var l = z(s, 2), u = z(l, 2);
		B(() => {
			q(i, t.group.body), q(o, t.group.io), q(c, t.group.enabled ? "double-click to open" : "switched off — nothing goes through"), Q(l, "data-group", t.group.id), Q(u, "data-group", t.group.id);
		}), K(e, n);
	}, S = (e) => {
		K(e, Ca());
	};
	J(b, (e) => {
		t.group.collapsed ? e(x) : e(S, -1);
	}), k(i), B(() => {
		Z(i, 1, X(t.group.className)), Q(i, "data-group", t.group.id), Q(i, "aria-label", `Group: ${t.group.title}`), a = ni(i, "", a, {
			left: `${t.group.x}px`,
			top: `${t.group.y}px`,
			width: `${t.group.w}px`,
			height: t.group.collapsed ? void 0 : `${t.group.h}px`
		}), Z(o, 1, X(t.group.collapsed ? "pc-node-head" : "pc-group-frame-head")), Z(u, 1, X(t.group.collapsed ? "pc-node-title" : "pc-group-frame-title")), q(d, t.group.title), Z(v, 1, `pc-node-action fa-solid pc-group-btn ${t.group.collapsed ? "fa-up-right-and-down-left-from-center" : "fa-down-left-and-up-right-to-center"}`), Q(v, "data-action", t.group.collapsed ? "open" : "collapse"), Q(v, "title", t.group.collapsed ? "Open the group as a blanket" : "Fold the group"), Q(v, "aria-label", t.group.collapsed ? "Open group" : "Fold group"), Z(y, 1, `pc-node-action pc-toggle fa-solid ${t.group.enabled ? "fa-toggle-on pc-toggle-on" : "fa-toggle-off pc-toggle-off"}`), Q(y, "title", t.group.enabled ? "Switch the whole group off" : "Switch the whole group on"), Q(y, "aria-pressed", t.group.enabled);
	}), W("mousedown", v, (e) => n(e, t.group.collapsed ? "open" : "collapse")), W("click", v, (e) => r(e, t.group.collapsed ? "open" : "collapse")), W("mousedown", y, (e) => n(e, "toggle")), W("click", y, (e) => r(e, "toggle")), K(e, i), M();
}
_r(["mousedown", "click"]);
//#endregion
//#region ui/WireLayer.svelte
var Ea = /* @__PURE__ */ Er("<title> </title>"), Da = /* @__PURE__ */ Er("<path class=\"pc-wire-hit\"></path><path><title> </title></path><text> <!></text>", 1), Oa = /* @__PURE__ */ Er("<path></path>"), ka = /* @__PURE__ */ Er("<defs><marker viewBox=\"0 0 10 10\" refX=\"8\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto-start-reverse\"><path d=\"M 0 0 L 10 5 L 0 10 z\" class=\"pc-loop-arrow\"></path></marker></defs><!><!>", 1);
function Aa(e, t) {
	j(t, !0);
	var n = ka(), r = R(n), i = L(r);
	k(r);
	var a = z(r);
	Y(a, 17, () => t.wires, (e) => e.id, (e, n) => {
		var r = Da(), i = R(r), a = z(i), o = L(a), s = L(o, !0);
		k(o), k(a);
		var c = z(a), l = L(c, !0), u = z(l), d = (e) => {
			var t = Ea(), r = L(t, !0);
			k(t), B(() => q(r, U(n).label.title)), K(e, t);
		};
		J(u, (e) => {
			U(n).label.title && e(d);
		}), k(c), B(() => {
			Q(i, "d", U(n).d), Q(i, "data-id", U(n).id), Q(a, "d", U(n).d), Z(a, 0, X(U(n).className)), Q(a, "data-id", U(n).id), Q(a, "data-kind", U(n).kind), Q(a, "marker-end", U(n).arrow ? `url(#${t.markerId})` : void 0), q(s, U(n).kind ? `${U(n).kind} artifact` : U(n).label.text), Q(c, "x", U(n).label.x), Q(c, "y", U(n).label.y), Z(c, 0, X(U(n).label.className)), Q(c, "data-id", U(n).label.id), Q(c, "text-anchor", U(n).label.anchor), q(l, U(n).label.text);
		}), K(e, r);
	});
	var o = z(a), s = (e) => {
		var n = Oa();
		B(() => {
			Q(n, "d", t.ghost.d), Z(n, 0, X(t.ghost.className));
		}), K(e, n);
	};
	J(o, (e) => {
		t.ghost && e(s);
	}), B(() => Q(i, "id", t.markerId)), K(e, n), M();
}
//#endregion
//#region ui/CanvasLayer.svelte
var ja = /* @__PURE__ */ G("<div class=\"pc-viewport\" data-pc-renderer=\"svelte\"><svg class=\"pc-wires\" aria-label=\"Canvas connections\"><!></svg> <div class=\"pc-nodes\"><!> <!> <!></div></div>");
function Ma(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F([]), r = /* @__PURE__ */ F([]), i = /* @__PURE__ */ F([]), a = /* @__PURE__ */ F(null), o = /* @__PURE__ */ F({
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
		I(n, e);
	}
	function f(e) {
		I(r, e);
	}
	function p(e, t, n) {
		I(i, e), I(o, t), I(a, n);
	}
	function m(e, t) {
		let i = new Map(e.map((e) => [e.id, e])), a = new Map(t.map((e) => [e.id, e]));
		I(n, U(n).map((e) => i.has(e.id) ? {
			...e,
			...i.get(e.id)
		} : e)), I(r, U(r).map((e) => a.has(e.id) ? {
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
	}, g = ja(), _ = L(g);
	Aa(L(_), {
		get wires() {
			return U(i);
		},
		get markerId() {
			return t.markerId;
		},
		get ghost() {
			return U(a);
		}
	}), k(_), $(_, (e) => c = e, () => c);
	var v = z(_, 2), y = L(v);
	Y(y, 17, () => U(r).filter((e) => !e.collapsed), (e) => e.id, (e, n) => {
		Ta(e, {
			get group() {
				return U(n);
			},
			get actions() {
				return t.actions;
			}
		});
	});
	var b = z(y, 2);
	return Y(b, 17, () => U(n), (e) => e.id, (e, n) => {
		ga(e, {
			get card() {
				return U(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), Y(z(b, 2), 17, () => U(r).filter((e) => e.collapsed), (e) => e.id, (e, n) => {
		Ta(e, {
			get group() {
				return U(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), k(v), $(v, (e) => l = e, () => l), k(g), $(g, (e) => s = e, () => s), B(() => {
		Q(_, "width", U(o).w), Q(_, "height", U(o).h), Q(_, "viewBox", `0 0 ${U(o).w} ${U(o).h}`);
	}), K(e, g), M(h);
}
//#endregion
//#region ui/WorkspaceMenus.svelte
var Na = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-flat-menu\" aria-haspopup=\"menu\"> </button>"), Pa = /* @__PURE__ */ G("<button type=\"button\" role=\"menuitem\"><span> </span><small> </small></button>"), Fa = /* @__PURE__ */ G("<div class=\"pc-workspace-menu-panel\" role=\"menu\" tabindex=\"-1\"></div>"), Ia = /* @__PURE__ */ G("<nav class=\"pc-workspace-menus\" aria-label=\"Workspace menus\"><!> <!></nav>");
function La(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(""), r, i = /* @__PURE__ */ F(null), a = null, o = /* @__PURE__ */ F(0), s = /* @__PURE__ */ F(0), c = [
		"File",
		"Edit",
		"Graph",
		"Node",
		"Preview",
		"Workflows",
		"Tools",
		"Help"
	], l = (e, t, n = "", r = !1) => ({
		label: e,
		command: t,
		shortcut: n,
		disabled: r
	});
	function u(e) {
		switch (e) {
			case "File": return [
				l("New canvas", "new"),
				l("Open workflow…", "open-workflow"),
				l("Import canvas", "import"),
				l("Import into graph…", "import-into-graph"),
				l("Export canvas", "export"),
				l("Close workspace", "close")
			];
			case "Edit": return [
				l("Undo", "undo", "Ctrl Z", !t.state.history.undo),
				l("Redo", "redo", "Ctrl Shift Z", !t.state.history.redo),
				l("Copy", "copy", "Ctrl C", !t.state.selectionActions?.copy),
				l("Cut", "cut", "Ctrl X", !t.state.selectionActions?.cut),
				l("Paste", "paste", "Ctrl V"),
				l("Delete selection", "delete-selection", "Del", !t.state.selectionActions?.delete)
			];
			case "Graph": return [
				l("Fit to view", "fit"),
				l("Fit selection", "fit-selection", "", !t.state.selectionCount),
				l("Duplicate canvas", "duplicate"),
				l("Rename canvas", "rename"),
				l("Seed from SillyTavern’s current prompt order", "seed", "", !!t.state.nativeGraph),
				l("Delete canvas", "delete")
			];
			case "Node": return [
				l("Add node…", "add-node"),
				l("Inspect selection", "reveal-inspector"),
				l("Library", "sidebar")
			];
			case "Preview": return [
				l("Compile prompt", "preview"),
				l("Show preview", "show-preview"),
				l("Collapse preview", "collapse-preview")
			];
			case "Workflows": return [
				l("Workflow setup…", "workflow-setup"),
				l("Workflow examples…", "workflow-setup"),
				l("Run workflow", "run-workflow", "", !t.state.workflow?.native || !!t.state.workflow?.busy || !!t.state.workflow?.issues.length),
				l("Stop workflow", "stop-workflow", "", !t.state.workflow?.busy),
				l("Library", "sidebar")
			];
			case "Tools": return [
				l("Theme and colours", "theme"),
				l("Toggle inspector", "inspector"),
				l("Toggle Library", "sidebar")
			];
			default: return [l("Workspace guide", "help")];
		}
	}
	function d(e = !1) {
		I(n, ""), e && a?.focus({ preventScroll: !0 });
	}
	async function f(e, t, r = !1) {
		if (U(n) === e && !r) {
			d();
			return;
		}
		I(n, e, !0), a = t, await cr();
		let c = t.getBoundingClientRect(), l = U(i).getBoundingClientRect();
		I(o, Math.max(4, Math.min(c.left, window.innerWidth - l.width - 4)), !0), I(s, c.bottom + 2), r && U(i).querySelector("button:not(:disabled)")?.focus();
	}
	function p(e) {
		d(!0), [
			"open-workflow",
			"workflow-setup",
			"show-preview",
			"collapse-preview",
			"add-node",
			"help"
		].includes(e) ? t.local(e) : e === "preview" ? (t.local("show-preview"), t.actions.preview()) : t.actions.command(e);
	}
	function m(e) {
		let t = e.target;
		if (e.key === "Escape" && U(n)) e.preventDefault(), e.stopPropagation(), d(!0);
		else if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
			e.preventDefault();
			let i = U(n) || t.textContent || c[0], a = c[(c.indexOf(i) + (e.key === "ArrowRight" ? 1 : c.length - 1)) % c.length], o = r.querySelector(`[data-menu="${a}"]`);
			U(n) ? f(a, o, !0) : o.focus();
		} else if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Home" || e.key === "End") {
			if (e.preventDefault(), !U(n)) {
				f(t.dataset.menu || c[0], t, !0);
				return;
			}
			let r = [...U(i).querySelectorAll("button:not(:disabled)")], a = r.indexOf(t);
			r[e.key === "Home" ? 0 : e.key === "End" ? r.length - 1 : (a + (e.key === "ArrowUp" ? r.length - 1 : 1)) % r.length]?.focus();
		} else e.key === "Tab" && d();
	}
	var h = Ia();
	gr("pointerdown", tn, (e) => {
		U(n) && !r.contains(e.target) && !U(i)?.contains(e.target) && d();
	}), gr("resize", tn, () => d());
	var g = L(h);
	Y(g, 17, () => c, zr, (e, t) => {
		var r = Na(), i = L(r, !0);
		k(r), B(() => {
			Q(r, "data-menu", U(t)), Q(r, "aria-expanded", U(n) === U(t)), q(i, U(t));
		}), W("click", r, (e) => f(U(t), e.currentTarget)), W("keydown", r, m), K(e, r);
	});
	var _ = z(g, 2), v = (e) => {
		var t = Fa();
		let r;
		Y(t, 21, () => u(U(n)), zr, (e, t) => {
			var n = Pa(), r = L(n), i = L(r, !0);
			k(r);
			var a = z(r), o = L(a, !0);
			k(a), k(n), B(() => {
				n.disabled = U(t).disabled, q(i, U(t).label), q(o, U(t).shortcut);
			}), W("click", n, () => p(U(t).command)), K(e, n);
		}), k(t), $(t, (e) => I(i, e), () => U(i)), B(() => {
			Q(t, "aria-label", U(n)), r = ni(t, "", r, {
				left: `${U(o)}px`,
				top: `${U(s)}px`
			});
		}), W("keydown", t, m), K(e, t);
	};
	J(_, (e) => {
		U(n) && e(v);
	}), k(h), $(h, (e) => r = e, () => r), K(e, h), M();
}
_r(["click", "keydown"]);
//#endregion
//#region ui/Toolbar.svelte
var Ra = /* @__PURE__ */ G("<option> </option>"), za = /* @__PURE__ */ G("<header class=\"pc-header\" data-pc-ui=\"svelte\"><div class=\"pc-menubar\"><div class=\"pc-brand\"><img width=\"30\" height=\"30\" alt=\"\"/><span>LATTICE</span></div> <!> <button type=\"button\" class=\"pc-btn menu_button pc-close\" title=\"Close\" aria-label=\"Close canvas\">×</button></div> <div class=\"pc-workflow-bar\"><select class=\"pc-select pc-graph-select text_pole\" aria-label=\"Canvas\"></select> <div class=\"pc-header-actions pc-history\"><button type=\"button\" aria-label=\"Undo\">↶</button> <button type=\"button\" aria-label=\"Redo\">↷</button> <span> </span></div> <button type=\"button\" class=\"pc-btn menu_button pc-root-run\"> </button> <span class=\"pc-root-workflow-status\" role=\"status\"> </span> <button type=\"button\" class=\"pc-btn menu_button\" title=\"Workflow setup\">Setup</button> <div class=\"pc-header-actions pc-surface-actions\"><button type=\"button\" title=\"Show or hide the Library\" aria-label=\"Toggle library\">Library</button> <button type=\"button\" title=\"Show or hide the inspector\" aria-label=\"Toggle inspector\">Details</button></div> <label class=\"pc-arm\"><input class=\"pc-arm-input\" type=\"checkbox\"/><span>Arm</span></label></div></header>");
function Ba(e, t) {
	j(t, !0);
	let n, r, i, a, o;
	function s() {
		return {
			header: n,
			graphSelect: r,
			arm: i,
			sideBtn: a,
			inspBtn: o
		};
	}
	function c() {
		r.focus();
	}
	var l = {
		getParts: s,
		focusGraphSelect: c
	}, u = za(), d = L(u), f = L(d), p = L(f);
	Pe(), k(f);
	var m = z(f, 2);
	La(m, {
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
	k(d);
	var g = z(d, 2), _ = L(g);
	Y(_, 21, () => t.state.graphs, (e) => e.id, (e, t) => {
		var n = Ra(), r = L(n, !0);
		k(n);
		var i = {};
		B(() => {
			q(r, U(t).name), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
		}), K(e, n);
	}), k(_), $(_, (e) => r = e, () => r);
	var v;
	ii(_);
	var y = z(_, 2), b = L(y), x = z(b, 2), S = z(x, 2), C = L(S, !0);
	k(S), k(y);
	var w = z(y, 2), T = L(w, !0);
	k(w);
	var ee = z(w, 2), te = L(ee);
	k(ee);
	var ne = z(ee, 2), re = z(ne, 2), ie = L(re);
	$(ie, (e) => a = e, () => a);
	var E = z(ie, 2);
	$(E, (e) => o = e, () => o), k(re);
	var ae = z(re, 2), oe = L(ae);
	return ui(oe), $(oe, (e) => i = e, () => i), Pe(), k(ae), k(g), k(u), $(u, (e) => n = e, () => n), B((e) => {
		Q(p, "src", t.actions.logoUrl), v !== (v = t.state.graphId) && (_.value = (_.__value = t.state.graphId) ?? "", ri(_, t.state.graphId)), Z(b, 1, `pc-btn menu_button pc-undo${t.state.history.undo ? "" : " pc-disabled"}`), b.disabled = !t.state.history.undo, Q(b, "title", t.state.history.undoTitle), Z(x, 1, `pc-btn menu_button pc-redo${t.state.history.redo ? "" : " pc-disabled"}`), x.disabled = !t.state.history.redo, Q(x, "title", t.state.history.redoTitle), Z(S, 1, `pc-history-note${t.state.history.showNote ? " pc-show" : ""}`), q(C, t.state.history.note), w.disabled = !t.state.workflow?.native || !t.state.workflow?.busy && !!t.state.workflow?.issues.length, Q(w, "title", e), q(T, t.state.workflow?.busy ? "■ Stop" : "▶ Run"), q(te, `${t.state.workflow?.native ? `${t.state.workflow.phase} · ${t.state.workflow.assigned ? "Assigned" : "Unassigned"} · ≤ ${t.state.workflow.callBound} requests` : "Legacy prompt"} · Autosave`), Z(ie, 1, `pc-btn menu_button pc-pane-toggle${t.state.sideOpen ? " pc-on" : ""}`), Q(ie, "aria-pressed", t.state.sideOpen), Z(E, 1, `pc-btn menu_button pc-pane-toggle${t.state.inspectorOpen ? " pc-on" : ""}`), Q(E, "aria-pressed", t.state.inspectorOpen), fi(oe, t.state.armed);
	}, [() => t.state.workflow?.native ? t.state.workflow.issues.join("\n") || "Run the root workflow" : "Install a native workflow example to run"]), W("click", h, () => t.actions.command("close")), W("change", _, (e) => t.actions.pickGraph(e.currentTarget.value)), W("click", b, () => t.actions.command("undo")), W("click", x, () => t.actions.command("redo")), W("click", w, () => t.actions.command(t.state.workflow?.busy ? "stop-workflow" : "run-workflow")), W("click", ne, () => t.local("workflow-setup")), W("click", ie, () => t.actions.command("sidebar")), W("click", E, () => t.actions.command("inspector")), W("change", oe, (e) => t.actions.arm(e.currentTarget.checked)), K(e, u), M(l);
}
_r(["click", "change"]);
//#endregion
//#region ui/StatusBar.svelte
var Va = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-btn menu_button pc-primary\">Run this one instead</button>"), Ha = /* @__PURE__ */ G("<div class=\"pc-status\"><span> </span> <span aria-live=\"polite\"> </span> <!> <span class=\"pc-spacer\"></span> <button type=\"button\" class=\"pc-btn menu_button\"><i class=\"fa-solid fa-thumbtack\"></i> </button> <button type=\"button\" class=\"pc-btn menu_button\"><i class=\"fa-solid fa-user-pen\"></i> </button> <button type=\"button\" class=\"pc-btn menu_button\"><i class=\"fa-solid fa-star\"></i> </button> <button type=\"button\" class=\"pc-btn menu_button pc-primary\"><i class=\"fa-solid fa-eye\"></i> Preview prompt</button></div>");
function Ua(e, t) {
	j(t, !0);
	let n;
	function r() {
		return n;
	}
	var i = { getElement: r }, a = Ha(), o = L(a), s = L(o, !0);
	k(o);
	var c = z(o, 2), l = L(c, !0);
	k(c);
	var u = z(c, 2), d = (e) => {
		var n = Va();
		B(() => Q(n, "title", t.status.overrideTitle)), W("click", n, function(...e) {
			t.actions.unpin?.apply(this, e);
		}), K(e, n);
	};
	J(u, (e) => {
		t.status.warning && e(d);
	});
	var f = z(u, 4), p = z(L(f));
	k(f);
	var m = z(f, 2), h = z(L(m));
	k(m);
	var g = z(m, 2), _ = z(L(g));
	k(g);
	var v = z(g, 2);
	return k(a), $(a, (e) => n = e, () => n), B(() => {
		Z(o, 1, `pc-pill ${t.status.armed ? "pc-pill-on" : "pc-pill-off"}`), q(s, t.status.armed ? "Armed" : "Off"), Z(c, 1, `pc-status-text${t.status.warning ? " pc-status-warn" : ""}`), q(l, t.status.text), q(p, ` ${t.status.chatPinned ? "Unpin from chat" : "Pin to this chat"}`), Q(m, "title", t.status.charTitle), q(h, ` ${t.status.charPinned ? "Unpin from character" : "Pin to character"}`), q(_, ` ${t.status.isDefault ? "Default canvas" : "Make default"}`);
	}), W("click", f, function(...e) {
		t.actions.pinChat?.apply(this, e);
	}), W("click", m, function(...e) {
		t.actions.pinCharacter?.apply(this, e);
	}), W("click", g, function(...e) {
		t.actions.makeDefault?.apply(this, e);
	}), W("click", v, function(...e) {
		t.actions.preview?.apply(this, e);
	}), K(e, a), M(i);
}
_r(["click"]);
//#endregion
//#region ui/CanvasControls.svelte
var Wa = /* @__PURE__ */ G("<span class=\"pc-selection-count\"> </span>"), Ga = /* @__PURE__ */ G("<div class=\"pc-canvas-controls\" role=\"toolbar\" aria-label=\"Canvas tools\"><button type=\"button\" aria-label=\"Select tool\" title=\"Drag empty canvas to select blocks\">Select</button> <button type=\"button\" aria-label=\"Pan tool\" title=\"Drag anywhere to pan; hold Space for temporary pan\">Pan</button> <span class=\"pc-control-separator\"></span> <button type=\"button\" class=\"pc-btn\" aria-label=\"Zoom out\" title=\"Zoom out\">−</button> <output class=\"pc-zoom-readout\" aria-label=\"Canvas zoom\"> </output> <button type=\"button\" class=\"pc-btn\" aria-label=\"Zoom in\" title=\"Zoom in\">+</button> <button type=\"button\" class=\"pc-btn\" title=\"Fit selection (.)\" aria-label=\"Fit selection\">Fit</button> <!></div> <div class=\"pc-gesture-hint\">Drag to select · Shift adds · Alt removes · Space pans</div>", 1);
function Ka(e, t) {
	j(t, !0);
	var n = Ga(), r = R(n), i = L(r), a = z(i, 2), o = z(a, 4), s = z(o, 2), c = L(s);
	k(s);
	var l = z(s, 2), u = z(l, 2), d = z(u, 2), f = (e) => {
		var n = Wa(), r = L(n);
		k(n), B(() => q(r, `${t.count ?? ""} selected`)), K(e, n);
	};
	J(d, (e) => {
		t.count && e(f);
	}), k(r), Pe(2), B((e) => {
		Z(i, 1, `pc-btn${t.camera.mode === "select" ? " pc-on" : ""}`), Q(i, "aria-pressed", t.camera.mode === "select"), Z(a, 1, `pc-btn${t.camera.mode === "pan" ? " pc-on" : ""}`), Q(a, "aria-pressed", t.camera.mode === "pan"), q(c, `${e ?? ""}%`);
	}, [() => Math.round(t.camera.zoom * 100)]), W("click", i, () => t.actions.mode("select")), W("click", a, () => t.actions.mode("pan")), W("click", o, () => t.actions.zoom(1 / 1.15)), W("click", l, () => t.actions.zoom(1.15)), W("click", u, function(...e) {
		t.actions.fitSelection?.apply(this, e);
	}), K(e, n), M();
}
_r(["click"]);
//#endregion
//#region ui/DomainSurface.svelte
var qa = /* @__PURE__ */ G("<div></div>");
function Ja(e, t) {
	j(t, !0);
	let n;
	function r() {
		return n;
	}
	var i = { getElement: r }, a = qa();
	return $(a, (e) => n = e, () => n), B(() => {
		Z(a, 1, X(t.className)), Q(a, "aria-label", t.label);
	}), K(e, a), M(i);
}
//#endregion
//#region ui/PaneDivider.svelte
var Ya = /* @__PURE__ */ G("<div class=\"pc-pane-divider\" role=\"separator\" aria-label=\"Resize preview\" aria-orientation=\"horizontal\" tabindex=\"0\"></div>");
function Xa(e, t) {
	j(t, !0);
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
	Lr(u);
	var f = Ya();
	gr("blur", tn, u), $(f, (e) => i = e, () => i), B((e, t) => {
		Q(f, "aria-valuemin", n()), Q(f, "aria-valuemax", e), Q(f, "aria-valuenow", t);
	}, [() => Math.round(r()), () => Math.round(t.height)]), W("pointerdown", f, s), W("pointermove", f, c), W("pointerup", f, (e) => l(!1, e.pointerId)), gr("pointercancel", f, (e) => l(!0, e.pointerId)), gr("lostpointercapture", f, (e) => l(!0, e.pointerId)), W("keydown", f, d), K(e, f), M();
}
//#endregion
//#region node_modules/svelte/src/internal/flags/legacy.js
_r([
	"pointerdown",
	"pointermove",
	"pointerup",
	"keydown"
]), Ve();
//#endregion
//#region ui/GraphTabs.svelte
var Za = /* @__PURE__ */ G("<nav class=\"pc-graph-tabs\" aria-label=\"Open graph views\"><button type=\"button\" class=\"pc-graph-tab\" aria-current=\"page\" title=\"Main graph\">Graph 1</button></nav>");
function Qa(e) {
	K(e, Za());
}
//#endregion
//#region ui/NodeShelf.svelte
var $a = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-family-row\" aria-haspopup=\"menu\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path></path></svg><span> </span></button>"), eo = /* @__PURE__ */ G("<button type=\"button\" role=\"menuitem\">‹ Families</button>"), to = /* @__PURE__ */ G("<button type=\"button\" role=\"menuitem\" aria-haspopup=\"menu\"><span class=\"pc-subfamily-name\"> </span><span aria-hidden=\"true\">›</span></button>"), no = /* @__PURE__ */ G("<div role=\"menu\" tabindex=\"-1\"><!> <!></div>"), ro = /* @__PURE__ */ G("<button type=\"button\" role=\"menuitem\"> </button>"), io = /* @__PURE__ */ G("<input class=\"text_pole\" aria-label=\"Search nodes\" placeholder=\"Search nodes…\"/>"), ao = /* @__PURE__ */ G("<button type=\"button\" role=\"menuitem\"><span class=\"pc-leaf-icon\" aria-hidden=\"true\">◇</span><span> </span><small> </small></button>"), oo = /* @__PURE__ */ G("<div class=\"pc-shelf-menu pc-leaf-menu\" role=\"menu\" tabindex=\"-1\"><!> <!> <!></div>"), so = /* @__PURE__ */ G("<nav aria-label=\"Node families\"></nav> <!> <!>", 1);
function co(e, t) {
	j(t, !0);
	let n, r = /* @__PURE__ */ F(null), i = /* @__PURE__ */ F(null), a = /* @__PURE__ */ F(""), o = /* @__PURE__ */ F(""), s = /* @__PURE__ */ F(!1), c = /* @__PURE__ */ F(""), l = /* @__PURE__ */ F(!1), u = /* @__PURE__ */ F(0), d = /* @__PURE__ */ F(0), f = /* @__PURE__ */ F(0), p = /* @__PURE__ */ F(0), m = null, h = [
		"Input",
		"Shaping",
		"Surface",
		"Transpose",
		"Derive",
		"Output",
		"Subgraphs"
	], g = [
		"M3 7 12 2l9 5v10l-9 5-9-5ZM3 7l9 5 9-5M12 12v10",
		"M20 8a8 8 0 1 0 0 8M20 3v5h-5",
		"M12 3v18M3 12h18M5 5l14 14",
		"M3 7h18m-4-4 4 4-4 4M21 17H3m4-4-4 4 4 4",
		"M5 20v-6M12 20V8M19 20V3",
		"M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5",
		"M3 3h7v7H3ZM14 14h7v7h-7ZM7 10v7h7"
	], _ = [
		"#7fbfa2",
		"#b3b776",
		"#d3a884",
		"#a49ab9",
		"#87b2d0",
		"#a8c883",
		"#bda3c7"
	];
	function v(e = U(a)) {
		let n = t.view?.families.find((t) => t.name === e);
		return n ? t.view?.native ? n.operations.filter((t) => e !== "Surface" || !["pattern-scan", "validate-patches"].includes(t.id)).map((t) => ({
			...t,
			legacy: !1,
			family: e
		})) : n.legacy.map((t) => ({
			...t,
			legacy: !0,
			compatible: !0,
			phase: "legacy",
			family: e
		})) : [];
	}
	let y = (e) => e === "pre" ? "Planning" : e === "post" ? "Reply" : "Legacy blocks";
	function b(e = !1) {
		I(a, ""), I(o, ""), I(s, !1), e && m?.focus({ preventScroll: !0 });
	}
	function x() {
		let e = n.closest(".pc-canvas-area"), t = e.getBoundingClientRect();
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
	async function C(e, t) {
		if (U(a) === e) {
			b();
			return;
		}
		I(a, e, !0), I(o, ""), I(s, !1), m = t, await cr();
		let n = t.getBoundingClientRect(), i = U(r).getBoundingClientRect(), c = S(n, i.width, i.height, 110);
		I(u, c.x, !0), I(d, c.y, !0), I(l, c.compact, !0), U(r).querySelector("button")?.focus({ preventScroll: !0 });
	}
	async function w(e, t) {
		I(o, e, !0), await cr();
		let n = t.getBoundingClientRect(), a = U(r).getBoundingClientRect(), s = U(i).getBoundingClientRect(), c = S({
			top: n.top,
			left: a.left,
			right: a.right
		}, s.width, s.height, 155);
		I(f, c.x, !0), I(p, c.y, !0), I(l, U(l) || c.compact, !0), U(i).querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
	}
	async function T() {
		I(a, ""), I(o, ""), I(s, !0), I(c, ""), await cr();
		let e = x();
		I(f, Math.min(136, Math.max(4, e.width - 266)), !0), I(p, 13), U(i).querySelector("input")?.focus();
	}
	function ee(e) {
		b(!0), t.add(e.id, e.legacy);
	}
	function te(e) {
		if (e.key === "Escape") {
			e.preventDefault(), e.stopPropagation(), b(!0);
			return;
		}
		if (e.key === "ArrowLeft" && U(o)) {
			e.preventDefault(), I(o, ""), cr().then(() => U(r).querySelector("button")?.focus());
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
		let t = [...(e.target.closest("[role=\"menu\"]") || n).querySelectorAll("button:not(:disabled)")].filter((e) => e.getBoundingClientRect().height > 0), i = t.indexOf(e.target);
		t[e.key === "Home" ? 0 : e.key === "End" ? t.length - 1 : (i + (e.key === "ArrowUp" ? t.length - 1 : 1)) % t.length]?.focus();
	}
	var ne = { openSearch: T }, re = so();
	gr("pointerdown", tn, (e) => {
		e.target.closest(".pc-node-shelf, .pc-shelf-menu") || b();
	}), gr("resize", tn, () => b());
	var ie = R(re);
	Y(ie, 21, () => h, zr, (e, t, n) => {
		var r = $a();
		let i;
		var o = L(r), s = L(o);
		k(o);
		var c = z(o), l = L(c, !0);
		k(c), k(r), B((e) => {
			Q(r, "data-family", U(t)), r.disabled = e, Q(r, "title", U(t) === "Transpose" ? "No supported Transpose operations yet." : U(t) === "Subgraphs" ? "Reusable subgraphs are not available yet." : "Browse " + U(t) + " nodes"), Q(r, "aria-expanded", U(a) === U(t)), i = ni(r, "", i, { "--pc-family": _[n] }), Q(s, "d", g[n]), q(l, U(t));
		}, [() => !v(U(t)).length || U(t) === "Transpose" || U(t) === "Subgraphs"]), W("click", r, (e) => C(U(t), e.currentTarget)), W("keydown", r, te), K(e, r);
	}), k(ie), $(ie, (e) => n = e, () => n);
	var E = z(ie, 2), ae = (e) => {
		var t = no();
		let n;
		var i = L(t), s = (e) => {
			var t = eo();
			W("click", t, () => b(!0)), K(e, t);
		};
		J(i, (e) => {
			U(l) && e(s);
		}), Y(z(i, 2), 17, () => [...new Set(v().map((e) => e.phase))], zr, (e, t) => {
			var n = to(), r = L(n), i = L(r, !0);
			k(r), Pe(), k(n), B((e) => {
				Q(n, "aria-expanded", U(o) === U(t)), q(i, e);
			}, [() => y(U(t)).toUpperCase()]), W("click", n, (e) => w(U(t), e.currentTarget)), K(e, n);
		}), k(t), $(t, (e) => I(r, e), () => U(r)), B((e) => {
			Z(t, 1, `pc-shelf-menu pc-family-menu${U(l) && U(o) ? " pc-shelf-replaced" : ""}`), Q(t, "aria-label", U(a) + " categories"), n = ni(t, "", n, e);
		}, [() => ({
			left: `${U(u)}px`,
			top: `${U(d)}px`,
			"--pc-family": _[h.indexOf(U(a))]
		})]), W("keydown", t, te), K(e, t);
	};
	J(E, (e) => {
		U(a) && e(ae);
	});
	var oe = z(E, 2), se = (e) => {
		var t = oo();
		let n;
		var u = L(t), d = (e) => {
			var t = ro(), n = L(t);
			k(t), B(() => q(n, `‹ ${U(a) ?? ""}`)), W("click", t, () => {
				I(o, ""), cr().then(() => U(r).querySelector("button")?.focus());
			}), K(e, t);
		};
		J(u, (e) => {
			U(l) && U(o) && e(d);
		});
		var m = z(u, 2), g = (e) => {
			var t = io();
			ui(t), gi(t, () => U(c), (e) => I(c, e)), K(e, t);
		};
		J(m, (e) => {
			U(s) && e(g);
		}), Y(z(m, 2), 17, () => U(s) ? h.flatMap((e) => v(e)).filter((e) => (e.title + " " + e.id + " " + e.family).toLowerCase().includes(U(c).toLowerCase())) : v().filter((e) => e.phase === U(o)), (e) => e.family + e.id, (e, t) => {
			var n = ao(), r = z(L(n)), i = L(r, !0);
			k(r);
			var a = z(r), o = L(a, !0);
			k(a), k(n), B((e) => {
				n.disabled = !U(t).compatible, Q(n, "title", U(t).compatible ? "Add " + U(t).title : "Requires the " + U(t).phase + " phase"), q(i, U(t).title), q(o, e);
			}, [() => U(t).legacy ? "L" : U(t).phase.toUpperCase()]), W("click", n, () => ee(U(t))), K(e, n);
		}), k(t), $(t, (e) => I(i, e), () => U(i)), B(() => {
			Q(t, "aria-label", U(s) ? "Search nodes" : U(a) + " nodes"), n = ni(t, "", n, {
				left: `${U(f)}px`,
				top: `${U(p)}px`
			});
		}), W("keydown", t, te), K(e, t);
	};
	return J(oe, (e) => {
		(U(o) || U(s)) && e(se);
	}), B(() => Z(ie, 1, `pc-node-shelf${U(l) && U(a) ? " pc-shelf-replaced" : ""}`)), K(e, re), M(ne);
}
_r(["click", "keydown"]);
//#endregion
//#region ui/WorkflowSetup.svelte
var lo = /* @__PURE__ */ G("<option> </option>"), uo = /* @__PURE__ */ G("<label> <select class=\"text_pole\"><option>Choose a connection</option><!></select></label> <label> <input class=\"text_pole\" placeholder=\"Use profile model\"/></label>", 1), fo = /* @__PURE__ */ G("<p class=\"pc-error\"> </p>"), po = /* @__PURE__ */ G("<h3> </h3> <p> </p> <p> </p> <!> <button type=\"button\" class=\"pc-btn menu_button\"> </button> <p> </p> <!>", 1), mo = /* @__PURE__ */ G("<article class=\"pc-workflow-starter\"><strong> </strong><p> </p><small> </small><button type=\"button\" class=\"pc-btn menu_button\"> </button></article>"), ho = /* @__PURE__ */ G("<label>Workflow mode<select class=\"text_pole\" aria-label=\"Workflow mode\"><option>Legacy · Replace prompt</option><option>Native · Guidance and reviewed reply</option></select></label> <!> <h3>Workflow examples</h3> <!>", 1);
function go(e, t) {
	j(t, !0);
	var n = Dr(), r = R(n), i = (e) => {
		var n = ho(), r = R(n), i = z(L(r)), a = L(i);
		a.value = a.__value = "legacy";
		var o = z(a);
		o.value = o.__value = "native", k(i);
		var s;
		ii(i), k(r);
		var c = z(r, 2), l = (e) => {
			var n = po(), r = R(n), i = L(r, !0);
			k(r);
			var a = z(r, 2), o = L(a, !0);
			k(a);
			var s = z(a, 2), c = L(s);
			k(s);
			var l = z(s, 2);
			Y(l, 17, () => t.view.roles, (e) => e.name, (e, n) => {
				var r = uo(), i = R(r), a = L(i), o = z(a), s = L(o);
				s.value = s.__value = "", Y(z(s), 17, () => t.view.profiles, (e) => e.id, (e, t) => {
					var n = lo(), r = L(n, !0);
					k(n);
					var i = {};
					B(() => {
						q(r, U(t).name), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
					}), K(e, n);
				}), k(o);
				var c;
				ii(o), k(i);
				var l = z(i, 2), u = L(l), d = z(u);
				ui(d), k(l), B(() => {
					q(a, `${U(n).name ?? ""} connection`), Q(o, "aria-label", U(n).name + " connection"), c !== (c = U(n).profileId) && (o.value = (o.__value = U(n).profileId) ?? "", ri(o, U(n).profileId)), q(u, `${U(n).name ?? ""} model override`), di(d, U(n).model);
				}), W("change", o, (e) => t.actions.workflowSetup?.bindRole(U(n).name, e.currentTarget.value, U(n).model)), W("input", d, (e) => t.actions.workflowSetup?.bindRole(U(n).name, U(n).profileId, e.currentTarget.value)), K(e, r);
			});
			var u = z(l, 2), d = L(u);
			k(u);
			var f = z(u, 2), p = L(f);
			k(f), Y(z(f, 2), 17, () => t.view.issues, zr, (e, t) => {
				var n = fo(), r = L(n, !0);
				k(n), B(() => q(r, U(t))), K(e, n);
			}), B(() => {
				q(i, t.view.name), q(o, t.view.phase === "pre" ? "Guidance helps SillyTavern plan its normal reply." : "Review a revision of the latest completed assistant reply."), q(c, `Maximum auxiliary requests: ${t.view.callBound ?? ""}`), q(d, `Assign ${t.view.phase ?? ""} phase and enable native mode`), q(p, `${t.view.assigned ? "Assigned to this phase." : "Phase is not assigned."} Arming is a separate action.`);
			}), W("click", u, () => t.actions.workflowSetup?.assign(t.view?.phase || "")), K(e, n);
		};
		J(c, (e) => {
			t.view.native && e(l);
		}), Y(z(c, 4), 17, () => t.view.starters, (e) => e.id, (e, n) => {
			var r = mo(), i = L(r), a = L(i, !0);
			k(i);
			var o = z(i), s = L(o, !0);
			k(o);
			var c = z(o), l = L(c);
			k(c);
			var u = z(c), d = L(u);
			k(u), k(r), B(() => {
				q(a, U(n).title), q(s, U(n).purpose), q(l, `${U(n).phase === "pre" ? "Before reply" : "After reply"} · Maximum ${U(n).callBound ?? ""} auxiliary requests`), q(d, `Install ${U(n).title ?? ""}`);
			}), W("click", u, () => t.actions.workflowSetup?.install(U(n).id)), K(e, r);
		}), B(() => {
			s !== (s = t.view.workflowMode) && (i.value = (i.__value = t.view.workflowMode) ?? "", ri(i, t.view.workflowMode));
		}), W("change", i, (e) => t.actions.workflowSetup?.setMode(e.currentTarget.value)), K(e, n);
	};
	J(r, (e) => {
		t.view && e(i);
	}), K(e, n), M();
}
_r([
	"change",
	"input",
	"click"
]);
//#endregion
//#region ui/ImportReview.svelte
var _o = /* @__PURE__ */ G("<p>A legacy graph has one Output. Import a fragment without another Output, or use Import canvas to open the full workflow separately.</p>"), vo = /* @__PURE__ */ G("<p> </p>"), yo = /* @__PURE__ */ G("<li> </li>"), bo = /* @__PURE__ */ G("<h3>Saved bindings to review</h3><ul></ul>", 1), xo = /* @__PURE__ */ G("<h3>Imported terminal effects</h3><ul></ul>", 1), So = /* @__PURE__ */ G("<p>No imported terminal effects.</p>"), Co = /* @__PURE__ */ G("<p role=\"alert\"> </p>"), wo = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-btn menu_button\">Prepare again</button>"), To = /* @__PURE__ */ G("<div class=\"pc-workspace-overlay pc-import-overlay\"><div class=\"pc-workspace-dialog pc-import-review\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Import into graph\" tabindex=\"-1\"><header><h2>Import into graph</h2><button type=\"button\" class=\"pc-btn menu_button\" aria-label=\"Cancel import\">×</button></header> <p><strong> </strong> <small> </small></p> <dl><dt>Phase</dt><dd> </dd><dt>Additions</dt><dd> </dd><dt>Conservative request bound</dt><dd> </dd></dl> <p class=\"pc-import-explanation\"> </p> <!> <!> <!> <!> <p>Insertion keeps internal wiring and relative layout. It does not connect matching names, arm or assign the graph, run requests, publish Guidance, or Apply a reply.</p> <!> <footer><button type=\"button\" class=\"pc-btn menu_button\">Cancel</button><!><button type=\"button\" class=\"pc-btn menu_button pc-import-accept\">Insert into graph</button></footer></div></div>");
function Eo(e, t) {
	j(t, !0);
	let n;
	Ir(() => {
		let e = document.activeElement;
		return n.querySelector("button")?.focus(), () => e?.focus({ preventScroll: !0 });
	});
	function r(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), t.actions.cancelImport?.()), e.key === "Tab") {
			let t = [...n.querySelectorAll("button:not(:disabled)")], r = t[0], i = t.at(-1);
			e.shiftKey && document.activeElement === r && (e.preventDefault(), i?.focus()), !e.shiftKey && document.activeElement === i && (e.preventDefault(), r?.focus());
		}
	}
	var i = To(), a = L(i), o = L(a), s = z(L(o));
	k(o);
	var c = z(o, 2), l = L(c), u = L(l, !0);
	k(l);
	var d = z(l, 2), f = L(d, !0);
	k(d), k(c);
	var p = z(c, 2), m = z(L(p)), h = L(m, !0);
	k(m);
	var g = z(m, 2), _ = L(g);
	k(g);
	var v = z(g, 2), y = L(v);
	k(v), k(p);
	var b = z(p, 2), x = L(b);
	k(b);
	var S = z(b, 2), C = (e) => {
		K(e, _o());
	};
	J(S, (e) => {
		t.view.phase === "legacy" && e(C);
	});
	var w = z(S, 2), T = (e) => {
		var n = vo(), r = L(n);
		k(n), B((e) => q(r, `Imported model roles: ${e ?? ""}.`), [() => t.view.requiredRoles.join(", ")]), K(e, n);
	};
	J(w, (e) => {
		t.view.requiredRoles.length && e(T);
	});
	var ee = z(w, 2), te = (e) => {
		var n = bo(), r = z(R(n));
		Y(r, 21, () => t.view.unresolvedBindings, zr, (e, t) => {
			var n = yo(), r = L(n);
			k(n), B((e) => q(r, `${U(t).title ?? ""} · ${U(t).role ?? ""}: missing ${e ?? ""}`), [() => U(t).missing.join(" and ")]), K(e, n);
		}), k(r), K(e, n);
	}, ne = (e) => {
		var n = vo(), r = L(n);
		k(n), B(() => q(r, `${t.view.phase === "legacy" ? `${t.view.inheritedBindingCount} imported model blocks inherit host defaults.` : "Saved model metadata is present."} Review local connections before running.`)), K(e, n);
	};
	J(ee, (e) => {
		t.view.unresolvedBindings.length ? e(te) : t.view.bindingReviewRequired && e(ne, 1);
	});
	var re = z(ee, 2), ie = (e) => {
		var n = xo(), r = z(R(n));
		Y(r, 21, () => t.view.terminals, zr, (e, t) => {
			var n = yo(), r = L(n);
			k(n), B(() => q(r, `${U(t).title ?? ""} · ${U(t).operation ?? ""}`)), K(e, n);
		}), k(r), K(e, n);
	}, E = (e) => {
		K(e, So());
	};
	J(re, (e) => {
		t.view.terminals.length ? e(ie) : e(E, -1);
	});
	var ae = z(re, 4), oe = (e) => {
		var n = Co(), r = L(n, !0);
		k(n), B(() => q(r, t.view.error)), K(e, n);
	};
	J(ae, (e) => {
		t.view.error && e(oe);
	});
	var se = z(ae, 2), ce = L(se), le = z(ce), ue = (e) => {
		var n = wo();
		W("click", n, () => t.actions.prepareImportAgain?.()), K(e, n);
	};
	J(le, (e) => {
		t.view.error && e(ue);
	});
	var de = z(le);
	k(se), k(a), $(a, (e) => n = e, () => n), k(i), B(() => {
		q(u, t.view.name), q(f, t.view.fileName), q(h, t.view.phase), q(_, `${t.view.nodeCount ?? ""} blocks · ${t.view.wireCount ?? ""} wires · ${t.view.groupCount ?? ""} groups`), q(y, `${t.view.callBound ?? ""} total · ${t.view.importedCallBound ?? ""} imported`), q(x, `This authoring bound includes unfinished branches. ${t.view.phase === "legacy" ? "Legacy repeats and loops are conservatively overcounted; actual reachable calls may be lower." : "Bindings and reachable execution are checked when you explicitly run the workflow."}`), de.disabled = !!t.view.error;
	}), W("keydown", a, r), gr("paste", a, (e) => e.stopPropagation()), W("click", s, () => t.actions.cancelImport?.()), W("click", ce, () => t.actions.cancelImport?.()), W("click", de, () => t.actions.acceptImport?.()), K(e, i), M();
}
_r(["keydown", "click"]);
//#endregion
//#region ui/Workbench.svelte
var Do = /* @__PURE__ */ G("<p>Browse node families on the floating shelf. Middle mouse pans the graph; the wheel zooms around the pointer. Use the divider or its arrow keys to resize Preview.</p><p>Library holds personal blocks and saved material. Setup contains workflow examples, phase assignment and role defaults. Arm enables the selected host workflow; Run tests it explicitly.</p><p>File › Import into graph reviews a same-mode fragment before one undoable insertion. Import canvas opens a separate graph. Legacy canvases have one Output: use a fragment without another Output, or open the full workflow separately. Legacy request bounds conservatively include possible repeats and loops; actual reachable calls may be lower.</p>", 1), Oo = /* @__PURE__ */ G("<div class=\"pc-workspace-overlay\"><div class=\"pc-workspace-dialog\" role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\"><header><h2> </h2><button type=\"button\" class=\"pc-btn menu_button\" aria-label=\"Close panel\">×</button></header> <!></div></div>"), ko = /* @__PURE__ */ G("<div class=\"pc-root\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Lattice\" data-pc-workbench=\"svelte\"><!> <!> <div class=\"pc-body\"><!> <div class=\"pc-stage\"><section aria-label=\"Output preview\"><header class=\"pc-preview-pane-head\"><strong>Preview</strong><button type=\"button\" class=\"pc-btn menu_button\"> </button></header> <div class=\"pc-preview-content\"><!> <p class=\"pc-preview-placeholder\"> </p></div></section> <!> <!> <div class=\"pc-canvas-area\"><div class=\"pc-canvas-host\" aria-label=\"Node canvas\"></div> <!> <!></div></div> <!></div> <!> <!></div>");
function Ao(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F({
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
	}), r, i, a, o, s, c, l, u;
	function d() {
		return {
			root: r,
			parts: {
				...o.getParts(),
				status: s.getElement(),
				sidebar: c.getElement(),
				inspector: l.getElement(),
				preview: u.getElement(),
				canvasHost: i
			}
		};
	}
	function f(e) {
		I(n, {
			...U(n),
			...e
		});
	}
	let p = "lattice.workspace.preview";
	function m() {
		try {
			let e = JSON.parse(localStorage.getItem(p) || "null");
			return {
				height: Number.isFinite(e?.height) ? Math.max(90, Math.min(600, e.height)) : 220,
				collapsed: e?.collapsed === !0
			};
		} catch {
			return {
				height: 220,
				collapsed: !1
			};
		}
	}
	let h = m(), g = /* @__PURE__ */ F(Qt(h.height)), _ = /* @__PURE__ */ F(Qt(h.collapsed)), v = /* @__PURE__ */ F(500), y = /* @__PURE__ */ F(""), b = /* @__PURE__ */ F(null), x = null, S;
	function C() {
		try {
			localStorage.setItem(p, JSON.stringify({
				height: U(g),
				collapsed: U(_)
			}));
		} catch {}
	}
	function w() {
		t.actions.resizeStart?.();
	}
	function T(e) {
		w(), I(_, e, !0), C();
	}
	function ee() {
		T(!1);
	}
	async function te(e) {
		e === "open-workflow" ? o.focusGraphSelect() : e === "show-preview" ? T(!1) : e === "collapse-preview" ? T(!0) : e === "add-node" ? S.openSearch() : (x = document.activeElement, I(y, e, !0), await cr(), U(b).querySelector("button")?.focus());
	}
	function ne() {
		I(y, ""), x?.focus({ preventScroll: !0 });
	}
	function re(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), ne()), e.key === "Tab") {
			let t = [...U(b).querySelectorAll("button:not(:disabled), input, select, textarea, [tabindex=\"0\"]")], n = t[0], r = t.at(-1);
			e.shiftKey && document.activeElement === n && (e.preventDefault(), r?.focus()), !e.shiftKey && document.activeElement === r && (e.preventDefault(), n?.focus());
		}
	}
	Ir(() => {
		let e = () => {
			I(v, Math.max(90, a.clientHeight - 190), !0);
		}, t = globalThis.ResizeObserver;
		if (!t) return e(), window.addEventListener("resize", e), () => window.removeEventListener("resize", e);
		let n = new t(e);
		return n.observe(a), () => n.disconnect();
	});
	var ie = {
		getParts: d,
		update: f,
		revealPreview: ee
	}, E = ko(), ae = L(E);
	$(Ba(ae, {
		get state() {
			return U(n);
		},
		get actions() {
			return t.actions;
		},
		local: te
	}), (e) => o = e, () => o);
	var oe = z(ae, 2);
	$(Ua(oe, {
		get status() {
			return U(n).status;
		},
		get actions() {
			return t.actions;
		}
	}), (e) => s = e, () => s);
	var se = z(oe, 2), ce = L(se);
	$(Ja(ce, {
		className: "pc-sidebar",
		label: "Block library"
	}), (e) => c = e, () => c);
	var le = z(ce, 2), ue = L(le);
	let de, fe;
	var pe = L(ue), me = z(L(pe)), he = L(me, !0);
	k(me), k(pe);
	var ge = z(pe, 2), _e = L(ge);
	$(Ja(_e, {
		className: "pc-preview",
		label: "Prompt preview"
	}), (e) => u = e, () => u);
	var ve = z(_e, 2), ye = L(ve, !0);
	k(ve), k(ge), k(ue);
	var be = z(ue, 2), xe = (e) => {
		{
			let t = /* @__PURE__ */ vt(() => Math.min(U(g), U(v)));
			Xa(e, {
				get height() {
					return U(t);
				},
				get max() {
					return U(v);
				},
				start: w,
				change: (e) => {
					I(g, e, !0), C();
				}
			});
		}
	};
	J(be, (e) => {
		U(_) || e(xe);
	});
	var Se = z(be, 2);
	Qa(Se, {});
	var Ce = z(Se, 2), we = L(Ce);
	$(we, (e) => i = e, () => i);
	var Te = z(we, 2);
	$(co(Te, {
		get view() {
			return U(n).workflow;
		},
		add: (e, n) => t.actions.addNode?.(e, n)
	}), (e) => S = e, () => S), Ka(z(Te, 2), {
		get camera() {
			return U(n).camera;
		},
		get count() {
			return U(n).selectionCount;
		},
		get actions() {
			return t.actions;
		}
	}), k(Ce), k(le), $(le, (e) => a = e, () => a), $(Ja(z(le, 2), {
		className: "pc-inspector",
		label: "Selection inspector"
	}), (e) => l = e, () => l), k(se);
	var Ee = z(se, 2), De = (e) => {
		var r = Oo(), i = L(r), a = L(i), o = L(a), s = L(o, !0);
		k(o);
		var c = z(o);
		k(a);
		var l = z(a, 2), u = (e) => {
			go(e, {
				get view() {
					return U(n).workflow;
				},
				get actions() {
					return t.actions;
				}
			});
		}, d = (e) => {
			var t = Do();
			Pe(2), K(e, t);
		};
		J(l, (e) => {
			U(y) === "workflow-setup" ? e(u) : e(d, -1);
		}), k(i), $(i, (e) => I(b, e), () => U(b)), k(r), B(() => {
			Q(i, "aria-label", U(y) === "workflow-setup" ? "Workflow setup" : "Workspace guide"), q(s, U(y) === "workflow-setup" ? "Workflow setup" : "Workspace guide");
		}), W("keydown", i, re), gr("paste", i, (e) => e.stopPropagation()), W("click", c, ne), K(e, r);
	};
	J(Ee, (e) => {
		U(y) && e(De);
	});
	var Oe = z(Ee, 2), ke = (e) => {
		Eo(e, {
			get view() {
				return U(n).importReview;
			},
			get actions() {
				return t.actions;
			}
		});
	};
	return J(Oe, (e) => {
		U(n).importReview && e(ke);
	}), k(E), $(E, (e) => r = e, () => r), B((e) => {
		de = Z(ue, 1, "pc-preview-pane", null, de, { "pc-preview-collapsed": U(_) }), fe = ni(ue, "", fe, e), Q(me, "aria-expanded", !U(_)), q(he, U(_) ? "Expand preview" : "Collapse preview"), Q(ge, "hidden", U(_)), q(ye, U(n).workflow?.native ? "Run the workflow to review its result in Details." : "Choose Preview › Compile prompt to inspect the current prompt.");
	}, [() => ({ "--pc-preview-height": `${Math.min(U(g), U(v))}px` })]), W("click", me, () => T(!U(_))), K(e, E), M(ie);
}
_r(["click", "keydown"]);
//#endregion
//#region ui/entry.js
var jo = 0;
function Mo(e, t) {
	let n = Ar(Ma, {
		target: e,
		props: {
			actions: t,
			markerId: `pc-loop-arrow-${++jo}`
		}
	});
	return It(), {
		...n.getLayers(),
		setNodes: (e) => It(() => n.setNodes(e)),
		setGroups: (e) => It(() => n.setGroups(e)),
		setWires: (e, t, r) => It(() => n.setWires(e, t, r)),
		setPositions: (e, t) => It(() => n.setPositions(e, t)),
		destroy: () => Pr(n)
	};
}
function No(e, t) {
	let n = Ar(Ao, {
		target: e,
		props: { actions: t }
	});
	return It(), {
		...n.getParts(),
		update: (e) => It(() => n.update(e)),
		revealPreview: () => It(() => n.revealPreview()),
		destroy: () => Pr(n)
	};
}
function Po(e, t, n = "setup") {
	let r = Ar(Yi, {
		target: e,
		props: {
			actions: t,
			mode: n
		}
	});
	return It(), {
		update: (e) => It(() => r.update(e)),
		destroy: () => Pr(r)
	};
}
//#endregion
export { Mo as mountCanvas, No as mountWorkbench, Po as mountWorkflowSurface };
