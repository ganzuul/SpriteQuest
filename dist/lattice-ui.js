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
var _ = 1024, v = 2048, y = 4096, b = 8192, x = 16384, S = 32768, ee = 1 << 25, C = 65536, w = 1 << 19, te = 1 << 20, ne = 1 << 25, re = 65536, ie = 1 << 21, ae = 1 << 22, T = 1 << 23, oe = Symbol("$state"), se = Symbol("legacy props"), ce = Symbol(""), le = Symbol("attributes"), ue = Symbol("class"), de = Symbol("style"), fe = Symbol("text"), pe = Symbol("form reset"), me = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), he = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml");
function ge(e) {
	throw Error("https://svelte.dev/e/lifecycle_outside_component");
}
//#endregion
//#region node_modules/svelte/src/internal/client/errors.js
function _e() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function ve(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function ye(e) {
	throw Error("https://svelte.dev/e/effect_in_teardown");
}
function be() {
	throw Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function xe(e) {
	throw Error("https://svelte.dev/e/effect_orphan");
}
function Se() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Ce(e) {
	throw Error("https://svelte.dev/e/props_invalid_value");
}
function we() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Te() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function Ee() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function De() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
function Oe() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function ke(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
function Ae() {
	console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function je() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/hydration.js
var E = !1;
function Me(e) {
	E = e;
}
var D;
function Ne(t) {
	if (t === null) throw ke(), e;
	return D = t;
}
function Pe() {
	return Ne(/* @__PURE__ */ un(D));
}
function O(t) {
	if (E) {
		if (/* @__PURE__ */ un(D) !== null) throw ke(), e;
		D = t;
	}
}
function Fe(e = 1) {
	if (E) {
		for (var t = e, n = D; t--;) n = /* @__PURE__ */ un(n);
		D = n;
	}
}
function Ie(e = !0) {
	for (var t = 0, n = D;;) {
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
function Le(t) {
	if (!t || t.nodeType !== 8) throw ke(), e;
	return t.data;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/equality.js
function Re(e) {
	return e === this.v;
}
function ze(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function Be(e) {
	return !ze(e, this.v);
}
//#endregion
//#region node_modules/svelte/src/internal/flags/index.js
var Ve = !1;
function He() {
	Ve = !0;
}
//#endregion
//#region node_modules/svelte/src/internal/client/context.js
var k = null;
function Ue(e) {
	k = e;
}
function A(e, t = !1, n) {
	k = {
		p: k,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: H,
		l: Ve && !t ? {
			s: null,
			u: null,
			$: []
		} : null
	};
}
function j(e) {
	var t = k, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) xn(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, k = t.p, e ?? {};
}
function We() {
	return !Ve || k !== null && k.l === null;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/task.js
var Ge = [];
function Ke() {
	var e = Ge;
	Ge = [], h(e);
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
	if (t === null) return V.f |= T, e;
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
var Ze = ~(v | y | _);
function M(e, t) {
	e.f = e.f & Ze | t;
}
function Qe(e) {
	e.f & 512 || e.deps === null ? M(e, _) : M(e, y);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
function $e(e) {
	if (e !== null) for (let t of e) t.f & 2 && t.f & 65536 && (t.f ^= re, $e(t.deps));
}
function et(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), $e(e.deps), M(e, _);
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
	E && /* @__PURE__ */ ln(e) !== null && dn(e);
}
var it = !1;
function at() {
	it || (it = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[pe]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function ot(e) {
	var t = V, n = H;
	Un(null), Wn(null);
	try {
		return e();
	} finally {
		Un(t), Wn(n);
	}
}
function st(e, t, n, r = n) {
	e.addEventListener(t, () => ot(n));
	let i = e[pe];
	e[pe] = i ? () => {
		i(), r(!0);
	} : () => r(!0), at();
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function ct(e) {
	let t = 0, n = qt(0), r;
	return () => {
		vn() && (W(n), Tn(() => (t === 0 && (r = ur(() => e(() => Zt(n)))), t += 1, () => {
			qe(() => {
				--t, t === 0 && (r?.(), r = void 0, Zt(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var lt = C | w;
function ut(e, t, n, r) {
	new dt(e, t, n, r);
}
var dt = class {
	parent;
	is_pending = !1;
	transform_error;
	#e;
	#t = E ? D : null;
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
	#h = ct(() => (this.#m = qt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = H;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = H.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = En(() => {
			if (E) {
				let e = this.#t;
				Pe();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, lt), E && (this.#e = D);
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
		qe(r), t && (this.#s = Dn(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			t ? je() : (t = !0, n && De(), this.#s !== null && Nn(this.#s, () => {
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
		e && (this.is_pending = !0, this.#o = Dn(() => e(this.#e)), qe(() => {
			var e = this.#c = document.createDocumentFragment(), t = cn();
			e.append(t), this.#a = this.#S(() => Dn(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, Nn(this.#o, () => {
				this.#o = null;
			}), this.#x(N));
		}));
	}
	#b() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#l = 0, this.#a = Dn(() => {
				this.#r(this.#e);
			}), this.#u > 0) {
				var e = this.#c = document.createDocumentFragment();
				Ln(this.#a, e);
				let t = this.#n.pending;
				this.#o = Dn(() => t(this.#e));
			} else this.#x(N);
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
		var t = H, n = V, r = k;
		Wn(this.#i), Un(this.#i), Ue(this.#i.ctx);
		try {
			return It.ensure(), e();
		} catch (e) {
			return Ye(e), null;
		} finally {
			Wn(t), Un(n), Ue(r);
		}
	}
	#C(e, t) {
		this.has_pending_snippet() ? (this.#u += e, this.#u === 0 && (this.#x(t), this.#o && Nn(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null))) : this.parent && this.parent.#C(e, t);
	}
	update_pending_count(e, t) {
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, qe(() => {
			this.#d = !1, this.#m && Yt(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), W(this.#m);
	}
	error(e) {
		if (!this.#n.onerror && !this.#n.failed) throw e;
		N?.is_fork ? (this.#a && N.skip_effect(this.#a), this.#o && N.skip_effect(this.#o), this.#s && N.skip_effect(this.#s), N.oncommit(() => {
			this.#w(e);
		})) : this.#w(e);
	}
	#w(e) {
		this.#a &&= (B(this.#a), null), this.#o &&= (B(this.#o), null), this.#s &&= (B(this.#s), null), E && (Ne(this.#t), Fe(), Ne(Ie()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return Dn(() => {
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
function ft(e, t, n, r) {
	let i = We() ? gt : bt;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = H, c = pt(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				Xe(e, s);
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
		Promise.all(n.map((e) => /* @__PURE__ */ vt(e))).then(u).catch((e) => Xe(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), mt();
	}) : f();
}
function pt() {
	var e = H, t = V, n = k, r = N;
	return function(i = !0) {
		Wn(e), Un(t), Ue(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function mt(e = !0) {
	Wn(null), Un(null), Ue(null), e && N?.deactivate();
}
function ht() {
	var e = H, t = e.b, n = N, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function gt(e) {
	var n = 2 | v;
	return H !== null && (H.f |= w), {
		ctx: k,
		deps: null,
		effects: null,
		equals: Re,
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
var _t = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function vt(e, n, r) {
	let i = H;
	i === null && _e();
	var a = void 0, o = qt(t), s = !V, c = /* @__PURE__ */ new Set();
	return wn(() => {
		var t = H, n = g();
		a = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== me && n.reject(e);
			}).finally(mt);
		} catch (e) {
			n.reject(e), mt();
		}
		var r = N;
		if (s) {
			if (t.f & 32768) var l = ht();
			if (i.b?.is_rendered()) r.async_deriveds.get(t)?.reject(_t);
			else for (let e of c.values()) e.reject(_t);
			c.add(n), r.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), c.delete(n), t !== _t && (r.activate(), t ? (o.f |= T, Yt(o, t)) : (o.f & 8388608 && (o.f ^= T), Yt(o, e)), r.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), yn(() => {
		for (let e of c) e.reject(_t);
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
function yt(e) {
	let t = /* @__PURE__ */ gt(e);
	return Kn(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function bt(e) {
	let t = /* @__PURE__ */ gt(e);
	return t.equals = Be, t;
}
function xt(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) B(t[n]);
	}
}
function St(e) {
	var n, r = H, i = e.parent;
	if (!Bn && i !== null && e.v !== t && i.f & 24576) return Oe(), e.v;
	Wn(i);
	try {
		e.f &= ~re, xt(e), n = rr(e);
	} finally {
		Wn(r);
	}
	return n;
}
function Ct(e) {
	var t = St(e);
	!e.equals(t) && (e.wv = er(), (!N?.is_fork || e.deps === null) && (N === null ? e.v = t : (N.capture(e, t, !0), Dt?.capture(e, t, !0)), e.deps === null)) ? M(e, _) : Bn || (Ot === null ? Qe(e) : (vn() || N?.is_fork) && Ot.set(e, t));
}
function wt(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && ot(() => {
		t.ac.abort(me), t.ac = null;
	}), t.fn !== null && (t.teardown = m), ar(t, 0), kn(t));
}
function Tt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && or(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
var Et = null, N = null, Dt = null, Ot = null, kt = null, At = !1, jt = !1, Mt = null, Nt = null, Pt = 0, Ft = 1, It = class e {
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
			for (var r of n.d) M(r, v), t(r);
			for (r of n.m) M(r, y), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, Pt++ > 1e3 && (this.#x(), Rt());
		for (let e of this.#u) this.#d.delete(e), M(e, v), this.schedule(e);
		for (let e of this.#d) M(e, y), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = Mt = [], r = [], i = Nt = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw Ut(e), this.#h() || this.discard(), t;
		}
		if (N = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (Mt = null, Nt = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) Ht(e, t);
			i.length > 0 && N.#g();
			return;
		}
		let o = this.#v();
		if (o) this.#b(r), this.#b(n), o.#y(this);
		else {
			this.#u.clear(), this.#d.clear();
			for (let e of this.#r) e(this);
			this.#r.clear(), Dt = this, Bt(r), Bt(n), Dt = null, this.#s?.resolve();
			var s = N;
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
		e.f ^= _;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= _ : i & 4 ? t.push(r) : tr(r) && (i & 16 && this.#d.add(r), or(r));
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), M(i, v), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), N = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) et(e[t], this.#u, this.#d);
	}
	capture(e, n, r = !1) {
		e.v !== t && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [n, r]), Ot?.set(e, n)), this.is_fork || (e.v = n);
	}
	activate() {
		N = this;
	}
	deactivate() {
		N = null, Ot = null;
	}
	flush() {
		try {
			jt = !0, N = this, this.#g();
		} finally {
			Pt = 0, kt = null, Mt = null, Nt = null, jt = !1, N = null, Ot = null, Gt.clear();
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
		return (this.#s ??= g()).promise;
	}
	static ensure() {
		if (N === null) {
			let t = N = new e();
			!jt && !At && qe(() => {
				t.#e || t.flush();
			});
		}
		return N;
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
				if (Mt !== null && t === H && (V === null || !(V.f & 2))) return;
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
			e === null || (e.#n = t), t === null ? Et = e : t.#t = e, this.linked = !1;
		}
	}
};
function Lt(e) {
	var t = At;
	At = !0;
	try {
		var n;
		for (e && (N !== null && !N.is_fork && N.flush(), n = e());;) {
			if (Je(), N === null) return n;
			N.flush();
		}
	} finally {
		At = t;
	}
}
function Rt() {
	try {
		Se();
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
			if (!(r.f & 24576) && tr(r) && (zt = /* @__PURE__ */ new Set(), or(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Mn(r), zt?.size > 0)) {
				Gt.clear();
				for (let e of zt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) zt.has(n) && (zt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || or(n);
					}
				}
				zt.clear();
			}
		}
		zt = null;
	}
}
function Vt(e) {
	N.schedule(e);
}
function Ht(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), M(e, _);
		for (var n = e.first; n !== null;) Ht(n, t), n = n.next;
	}
}
function Ut(e) {
	M(e, _);
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
		equals: Re,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function P(e, t) {
	let n = qt(e, t);
	return Kn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function Jt(e, t = !1, n = !0) {
	let r = qt(e);
	return t || (r.equals = Be), Ve && n && k !== null && k.l !== null && (k.l.s ??= []).push(r), r;
}
function F(e, t, n = !1) {
	return V !== null && (!Hn || V.f & 131072) && We() && V.f & 4325394 && (Gn === null || !Gn.has(e)) && Ee(), Yt(e, n ? $t(t) : t, Nt);
}
function Yt(e, t, n = null) {
	if (!e.equals(t)) {
		Bn ? Gt.set(e, t) : Gt.has(e) || Gt.set(e, e.v);
		var r = It.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && St(t), Ot === null && Qe(t);
		}
		e.wv = er(), Qt(e, v, n), We() && H !== null && H.f & 1024 && !(H.f & 96) && (Jn === null ? Yn([e]) : Jn.push(e)), !r.is_fork && Wt.size > 0 && !Kt && Xt();
	}
	return t;
}
function Xt() {
	Kt = !1;
	for (let e of Wt) {
		e.f & 1024 && M(e, y);
		let t;
		try {
			t = tr(e);
		} catch {
			t = !0;
		}
		t && or(e);
	}
	Wt.clear();
}
function Zt(e) {
	F(e, e.v + 1);
}
function Qt(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = We(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (i || s !== H) {
			var l = (c & v) === 0;
			if (l && M(s, t), c & 131072) Wt.add(s);
			else if (c & 2) {
				var u = s;
				Ot?.delete(u), c & 65536 || (c & 512 && (H === null || !(H.f & 2097152)) && (s.f |= re), Qt(u, y, n));
			} else if (l) {
				var d = s;
				c & 16 && zt !== null && zt.add(d), n === null ? Vt(d) : n.push(d);
			}
		}
	}
}
function $t(e) {
	if (typeof e != "object" || !e || oe in e) return e;
	let n = f(e);
	if (n !== u && n !== d) return e;
	var i = /* @__PURE__ */ new Map(), a = r(e), o = /* @__PURE__ */ P(0), s = null, l = Qn, p = (e) => {
		if (Qn === l) return e();
		var t = V, n = Qn;
		Un(null), $n(l);
		var r = e();
		return Un(t), $n(n), r;
	};
	return a && i.set("length", /* @__PURE__ */ P(e.length, s)), new Proxy(e, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && we();
			var r = i.get(t);
			return r === void 0 ? p(() => {
				var e = /* @__PURE__ */ P(n.value, s);
				return i.set(t, e), e;
			}) : F(r, n.value, !0), !0;
		},
		deleteProperty(e, n) {
			var r = i.get(n);
			if (r === void 0) {
				if (n in e) {
					let e = p(() => /* @__PURE__ */ P(t, s));
					i.set(n, e), Zt(o);
				}
			} else F(r, t), Zt(o);
			return !0;
		},
		get(n, r, a) {
			if (r === oe) return e;
			var o = i.get(r), l = r in n;
			if (o === void 0 && (!l || c(n, r)?.writable) && (o = p(() => /* @__PURE__ */ P($t(l ? n[r] : t), s)), i.set(r, o)), o !== void 0) {
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
			if (n === oe) return !0;
			var r = i.get(n), a = r !== void 0 && r.v !== t || Reflect.has(e, n);
			return (r !== void 0 || H !== null && (!a || c(e, n)?.writable)) && (r === void 0 && (r = p(() => /* @__PURE__ */ P(a ? $t(e[n]) : t, s)), i.set(n, r)), W(r) === t) ? !1 : a;
		},
		set(e, n, r, l) {
			var u = i.get(n), d = n in e;
			if (a && n === "length") for (var f = r; f < u.v; f += 1) {
				var m = i.get(f + "");
				m === void 0 ? f in e && (m = p(() => /* @__PURE__ */ P(t, s)), i.set(f + "", m)) : F(m, t);
			}
			if (u === void 0) (!d || c(e, n)?.writable) && (u = p(() => /* @__PURE__ */ P(void 0, s)), F(u, $t(r)), i.set(n, u));
			else {
				d = u.v !== t;
				var h = p(() => $t(r));
				F(u, h);
			}
			var g = Reflect.getOwnPropertyDescriptor(e, n);
			if (g?.set && g.set.call(l, r), !d) {
				if (a && typeof n == "string") {
					var _ = i.get("length"), v = Number(n);
					Number.isInteger(v) && v >= _.v && F(_, v + 1);
				}
				Zt(o);
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
			Te();
		}
	});
}
function en(e) {
	try {
		if (typeof e == "object" && e && oe in e) return e[oe];
	} catch {}
	return e;
}
function tn(e, t) {
	return Object.is(en(e), en(t));
}
var nn, rn, an, on;
function sn() {
	if (nn === void 0) {
		nn = window, rn = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		an = c(t, "firstChild").get, on = c(t, "nextSibling").get, p(e) && (e[ue] = void 0, e[le] = null, e[de] = void 0, e.__e = void 0), p(n) && (n[fe] = void 0);
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
function I(e, t) {
	if (!E) return /* @__PURE__ */ ln(e);
	var n = /* @__PURE__ */ ln(D);
	if (n === null) n = D.appendChild(cn());
	else if (t && n.nodeType !== 3) {
		var r = cn();
		return n?.before(r), Ne(r), r;
	}
	return t && mn(n), Ne(n), n;
}
function L(e, t = !1) {
	if (!E) {
		var n = /* @__PURE__ */ ln(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ un(n) : n;
	}
	if (t) {
		if (D?.nodeType !== 3) {
			var r = cn();
			return D?.before(r), Ne(r), r;
		}
		mn(D);
	}
	return D;
}
function R(e, t = 1, n = !1) {
	let r = E ? D : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ un(r);
	if (!E) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = cn();
			return r === null ? i?.after(a) : r.before(a), Ne(a), a;
		}
		mn(r);
	}
	return Ne(r), r;
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
	H === null && (V === null && xe(e), be()), Bn && ye(e);
}
function gn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function _n(e, t) {
	var n = H;
	n !== null && n.f & 8192 && (e |= b);
	var r = {
		ctx: k,
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
	N?.register_created_effect(r);
	var i = r;
	if (e & 4) Mt === null ? It.ensure().schedule(r) : Mt.push(r);
	else if (t !== null) {
		try {
			or(r);
		} catch (e) {
			throw B(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= C));
	}
	if (i !== null && (i.parent = n, n !== null && gn(i, n), V !== null && V.f & 2 && !(e & 64))) {
		var a = V;
		(a.effects ??= []).push(i);
	}
	return r;
}
function vn() {
	return V !== null && !Hn;
}
function yn(e) {
	let t = _n(8, null);
	return M(t, _), t.teardown = e, t;
}
function bn(e) {
	hn("$effect");
	var t = H.f;
	if (!V && t & 32 && k !== null && !k.i) {
		var n = k;
		(n.e ??= []).push(e);
	} else return xn(e);
}
function xn(e) {
	return _n(4 | te, e);
}
function Sn(e) {
	It.ensure();
	let t = _n(64 | w, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? Nn(t, () => {
			B(t), n(void 0);
		}) : (B(t), n(void 0));
	});
}
function Cn(e) {
	return _n(4, e);
}
function wn(e) {
	return _n(ae | w, e);
}
function Tn(e, t = 0) {
	return _n(8 | t, e);
}
function z(e, t = [], n = [], r = []) {
	ft(r, t, n, (t) => {
		_n(8, () => {
			e(...t.map(W));
		});
	});
}
function En(e, t = 0) {
	return _n(16 | t, e);
}
function Dn(e) {
	return _n(32 | w, e);
}
function On(e) {
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
function kn(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && ot(() => {
			e.abort(me);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : B(n, t), n = r;
	}
}
function An(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || B(t), t = n;
	}
}
function B(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (jn(e.nodes.start, e.nodes.end), n = !0), e.f |= ee, kn(e, t && !n), ar(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	On(e), e.f ^= ee, e.f |= x;
	var i = e.parent;
	i !== null && i.first !== null && Mn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function jn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ un(e);
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
		n && B(e), t && t();
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
		e.f ^= b, e.f & 1024 || (M(e, v), It.ensure().schedule(e));
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
		var i = n === r ? null : /* @__PURE__ */ un(n);
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
var U = null, qn = 0, Jn = null;
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
	if (t & 2 && (e.f &= ~re), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (tr(a) && Ct(a), a.wv > e.wv) return !0;
		}
		t & 512 && Ot === null && M(e, _);
	}
	return !1;
}
function nr(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Gn !== null && Gn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? nr(a, t, !1) : t === a && (n ? M(a, v) : a.f & 1024 && M(a, y), Vt(a));
	}
}
function rr(e) {
	var t = U, n = qn, r = Jn, i = V, a = Gn, o = k, s = Hn, c = Qn, l = e.f;
	U = null, qn = 0, Jn = null, V = l & 96 ? null : e, Gn = null, Ue(e.ctx), Hn = !1, Qn = ++Zn, e.ac !== null && (ot(() => {
		e.ac.abort(me);
	}), e.ac = null);
	try {
		e.f |= ie;
		var u = e.fn, d = u();
		e.f |= S;
		var f = e.deps, p = N?.is_fork;
		if (U !== null) {
			var m;
			if (p || ar(e, qn), f !== null && qn > 0) for (f.length = qn + U.length, m = 0; m < U.length; m++) f[qn + m] = U[m];
			else e.deps = f = U;
			if (vn() && e.f & 512) for (m = qn; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && qn < f.length && (ar(e, qn), f.length = qn);
		if (We() && Jn !== null && !Hn && f !== null && !(e.f & 6146)) for (m = 0; m < Jn.length; m++) nr(Jn[m], e);
		if (i !== null && i !== e) {
			if (Zn++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = Zn;
			if (t !== null) for (let e of t) e.rv = Zn;
			Jn !== null && (r === null ? r = Jn : r.push(...Jn));
		}
		return e.f & 8388608 && (e.f ^= T), d;
	} catch (e) {
		return Ye(e);
	} finally {
		e.f ^= ie, U = t, qn = n, Jn = r, V = i, Gn = a, Ue(o), Hn = s, Qn = c;
	}
}
function ir(e, n) {
	let r = n.reactions;
	if (r !== null) {
		var o = i.call(r, e);
		if (o !== -1) {
			var s = r.length - 1;
			s === 0 ? r = n.reactions = null : (r[o] = r[s], r.pop());
		}
	}
	if (r === null && n.f & 2 && (U === null || !a.call(U, n))) {
		var c = n;
		c.f & 512 && (c.f ^= 512, c.f &= ~re), c.v !== t && Qe(c), c.ac !== null && ot(() => {
			c.ac.abort(me), c.ac = null, M(c, v);
		}), wt(c), ar(c, 0);
	}
}
function ar(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) ir(e, n[r]);
}
function or(e) {
	var t = e.f;
	if (!(t & 16384)) {
		M(e, _);
		var n = H, r = zn;
		H = e, zn = !(t & 96);
		try {
			t & 16777232 ? An(e) : kn(e), On(e);
			var i = rr(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = Xn;
		} finally {
			zn = r, H = n;
		}
	}
}
async function sr() {
	await Promise.resolve(), Lt();
}
function W(e) {
	var t = !!(e.f & 2);
	if (Rn?.add(e), V !== null && !Hn && !(H !== null && H.f & 16384) && (Gn === null || !Gn.has(e))) {
		var n = V.deps;
		if (V.f & 2097152) e.rv < Zn && (e.rv = Zn, U === null && n !== null && n[qn] === e ? qn++ : U === null ? U = [e] : U.push(e));
		else {
			V.deps ??= [], a.call(V.deps, e) || V.deps.push(e);
			var r = e.reactions;
			r === null ? e.reactions = [V] : a.call(r, V) || r.push(V);
		}
	}
	if (Bn && Gt.has(e)) return Gt.get(e);
	if (t) {
		var i = e;
		if (Bn) {
			var o = i.v;
			return (!(i.f & 1024) && i.reactions !== null || lr(i)) && (o = St(i)), Gt.set(i, o), o;
		}
		var s = !(i.f & 512) && !Hn && V !== null && (zn || !!(V.f & 512)), c = (i.f & S) === 0;
		tr(i) && (s && (i.f |= 512), Ct(i)), s && !c && (Tt(i), cr(i));
	}
	if (Ot?.has(e)) return Ot.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function cr(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (Tt(t), cr(t));
}
function lr(e) {
	if (e.v === t) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Gt.has(t) || t.f & 2 && lr(t)) return !0;
	return !1;
}
function ur(e) {
	var t = Hn;
	try {
		return Hn = !0, e();
	} finally {
		Hn = t;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
var dr = Symbol("events"), fr = /* @__PURE__ */ new Set(), pr = /* @__PURE__ */ new Set();
function mr(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || yr.call(t, e), !e.cancelBubble) return ot(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? qe(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function hr(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = mr(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && yn(() => {
		t.removeEventListener(e, o, a);
	});
}
function G(e, t, n) {
	(t[dr] ??= {})[e] = n;
}
function gr(e) {
	for (var t = 0; t < e.length; t++) fr.add(e[t]);
	for (var n of pr) n(e);
}
var _r = null, vr = !1;
function yr(e) {
	var t = this, n = t.ownerDocument, r = e.type, i = e.composedPath?.() || [], a = i[0] || e.target;
	_r = e, vr || (vr = !0, setTimeout(() => {
		vr = !1, _r = null;
	}));
	var o = 0, c = _r === e && e[dr];
	if (c) {
		var l = i.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[dr] = t;
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
					var h = a[dr]?.[r];
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
			e[dr] = t, delete e.currentTarget, Un(d), Wn(f);
		}
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/reconciler.js
var br = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function xr(e) {
	return br?.createHTML(e) ?? e;
}
function Sr(e) {
	var t = pn("template");
	return t.innerHTML = xr(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function Cr(e, t) {
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
		if (E) return Cr(D, null), D;
		i === void 0 && (i = Sr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ ln(i)));
		var t = r || rn ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ ln(t), s = t.lastChild;
			Cr(o, s);
		} else Cr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function wr(e, t, n = "svg") {
	var r = !e.startsWith("<!>"), i = !!(t & 1), a = `<${n}>${r ? e : "<!>" + e}</${n}>`, o;
	return () => {
		if (E) return Cr(D, null), D;
		if (!o) {
			var e = /* @__PURE__ */ ln(Sr(a));
			if (i) for (o = document.createDocumentFragment(); /* @__PURE__ */ ln(e);) o.appendChild(/* @__PURE__ */ ln(e));
			else o = /* @__PURE__ */ ln(e);
		}
		var t = o.cloneNode(!0);
		if (i) {
			var n = /* @__PURE__ */ ln(t), r = t.lastChild;
			Cr(n, r);
		} else Cr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Tr(e, t) {
	return /* @__PURE__ */ wr(e, t, "svg");
}
function Er() {
	if (E) return Cr(D, null), D;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = cn();
	return e.append(t, n), Cr(t, n), e;
}
function q(e, t) {
	if (E) {
		var n = H;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = D), Pe();
	} else e !== null && e.before(t);
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var Dr = ["touchstart", "touchmove"];
function Or(e) {
	return Dr.includes(e);
}
function J(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[fe] ??= e.nodeValue) && (e[fe] = n, e.nodeValue = `${n}`);
}
function kr(e, t) {
	return jr(e, t);
}
var Ar = /* @__PURE__ */ new Map();
function jr(t, { target: n, anchor: r, props: i = {}, events: a, context: s, intro: c = !0, transformError: l }) {
	sn();
	var u = void 0, d = Sn(() => {
		var c = r ?? n.appendChild(cn());
		ut(c, { pending: () => {} }, (n) => {
			A({});
			var r = k;
			if (s && (r.c = s), a && (i.$$events = a), E && Cr(n, null), u = t(n, i) || {}, E && (H.nodes.end = D, D === null || D.nodeType !== 8 || D.data !== "]")) throw ke(), e;
			j();
		}, l);
		var d = /* @__PURE__ */ new Set(), f = (e) => {
			for (var t = 0; t < e.length; t++) {
				var r = e[t];
				if (!d.has(r)) {
					d.add(r);
					var i = Or(r);
					for (let e of [n, document]) {
						var a = Ar.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), Ar.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, yr, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return f(o(fr)), pr.add(f), () => {
			for (var e of d) for (let r of [n, document]) {
				var t = Ar.get(r), i = t.get(e);
				--i == 0 ? (r.removeEventListener(e, yr), t.delete(e), t.size === 0 && Ar.delete(r)) : t.set(e, i);
			}
			pr.delete(f), c !== r && c.parentNode?.removeChild(c);
		};
	});
	return Mr.set(u, d), u;
}
var Mr = /* @__PURE__ */ new WeakMap();
function Nr(e, t) {
	let n = Mr.get(e);
	return n ? (Mr.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/branches.js
var Pr = class {
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
				r && (B(r.effect), this.#n.delete(n));
			}
			for (let [e, r] of this.#t) {
				if (e === t || this.#r.has(e)) continue;
				let i = () => {
					if (Array.from(this.#e.values()).includes(e)) {
						var t = document.createDocumentFragment();
						Ln(r, t), t.append(cn()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else B(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), Nn(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (B(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = N, r = fn();
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
		} else E && (this.anchor = D), this.#a(n);
	}
};
function Fr(e) {
	k === null && ge("onMount"), Ve && k.l !== null ? Lr(k).m.push(e) : bn(() => {
		let t = ur(e);
		if (typeof t == "function") return t;
	});
}
function Ir(e) {
	k === null && ge("onDestroy"), Fr(() => () => ur(e));
}
function Lr(e) {
	var t = e.l;
	return t.u ??= {
		a: [],
		b: [],
		m: []
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
function Y(e, t, n = !1) {
	var r;
	E && (r = D, Pe());
	var i = new Pr(e), a = n ? C : 0;
	function o(e, t) {
		if (E) {
			var n = Le(r);
			if (e !== parseInt(n.substring(1))) {
				var a = Ie();
				Ne(a), i.anchor = a, Me(!1), i.ensure(e, t), Me(!0);
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
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
function Rr(e, t) {
	return t;
}
function zr(e, t, n) {
	for (var r = [], i = t.length, a, s = t.length, c = 0; c < i; c++) {
		let n = t[c];
		Nn(n, () => {
			if (a) {
				if (a.pending.delete(n), a.done.add(n), a.pending.size === 0) {
					var t = e.outrogroups;
					Br(e, o(a.done)), t.delete(a), t.size === 0 && (e.outrogroups = null);
				}
			} else --s;
		}, !1);
	}
	if (s === 0) {
		var l = r.length === 0 && n !== null && e.pending.size === 0;
		if (l) {
			var u = n, d = u.parentNode;
			dn(d), d.append(u), e.items.clear();
		}
		Br(e, t, !l);
	} else a = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(a);
}
function Br(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= ne, Ln(a, document.createDocumentFragment())) : B(t[i], n);
	}
}
var Vr;
function X(e, t, n, i, a, s = null) {
	var c = e, l = /* @__PURE__ */ new Map();
	if (t & 4) {
		var u = e;
		c = E ? Ne(/* @__PURE__ */ ln(u)) : u.appendChild(cn());
	}
	E && Pe();
	var d = null, f = /* @__PURE__ */ bt(() => {
		var e = n();
		return r(e) ? e : e == null ? [] : o(e);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, Ur(v, p, c, t, i), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= ne, Gr(d, null, c)) : Fn(d) : Nn(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: En(() => {
			p = W(f);
			var e = p.length;
			let r = !1;
			E && Le(c) === "[!" != (e === 0) && (c = Ie(), Ne(c), Me(!1), r = !0);
			for (var o = /* @__PURE__ */ new Set(), u = N, v = fn(), y = 0; y < e; y += 1) {
				E && D.nodeType === 8 && D.data === "]" && (c = D, r = !0, Me(!1));
				var b = p[y], x = i(b, y), S = h ? null : l.get(x);
				S ? (S.v && Yt(S.v, b), S.i && Yt(S.i, y), v && u.unskip_effect(S.e)) : (S = Wr(l, h ? c : Vr ??= cn(), b, x, y, a, t, n), h || (S.e.f |= ne), l.set(x, S)), o.add(x);
			}
			if (e === 0 && s && !d && (h ? d = Dn(() => s(c)) : (d = Dn(() => s(Vr ??= cn())), d.f |= ne)), e > o.size && ve("", "", ""), E && e > 0 && Ne(Ie()), !h) {
				if (m.set(u, o), v) {
					for (let [e, t] of l) o.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			r && Me(!0), W(f);
		}),
		flags: t,
		items: l,
		pending: m,
		outrogroups: null,
		fallback: d
	};
	h = !1, E && (c = D);
}
function Hr(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function Ur(e, t, n, r, i) {
	var a = !!(r & 8), s = t.length, c = e.items, l = Hr(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (a) for (v = 0; v < s; v += 1) h = t[v], g = i(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = i(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (Fn(_), a && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= ne, _ === l) Gr(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), Kr(e, d, _), Kr(e, _, y), Gr(_, y, n), d = _, p = [], m = [], l = Hr(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], ee = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) Gr(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					Kr(e, S.prev, ee.next), Kr(e, d, S), Kr(e, ee, b), l = b, d = ee, --v, p = [], m = [];
				} else u.delete(_), Gr(_, l, n), Kr(e, _.prev, _.next), Kr(e, _, d === null ? e.effect.first : d.next), Kr(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = Hr(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = Hr(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (Br(e, o(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var C = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || C.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && C.push(l), l = Hr(l.next);
		var w = C.length;
		if (w > 0) {
			var te = r & 4 && s === 0 ? n : null;
			if (a) {
				for (v = 0; v < w; v += 1) C[v].nodes?.a?.measure();
				for (v = 0; v < w; v += 1) C[v].nodes?.a?.fix();
			}
			zr(e, C, te);
		}
	}
	a && qe(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Wr(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? qt(n) : /* @__PURE__ */ Jt(n, !1, !1) : null, l = o & 2 ? qt(i) : null;
	return {
		v: c,
		i: l,
		e: Dn(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function Gr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ un(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function Kr(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function qr(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") {
		if (Array.isArray(e)) {
			var i = e.length;
			for (t = 0; t < i; t++) e[t] && (n = qr(e[t])) && (r && (r += " "), r += n);
		} else for (n in e) e[n] && (r && (r += " "), r += n);
	}
	return r;
}
function Jr() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = qr(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/shared/attributes.js
function Yr(e) {
	return typeof e == "object" ? Jr(e) : e ?? "";
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
	var o = e[ue];
	if (E || o !== n || o === void 0) {
		var s = Zr(n, r, a);
		(!E || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[ue] = n;
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
	var i = e[de];
	if (E || i !== t) {
		var a = ei(t, r);
		(!E || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[de] = t;
	} else r && (Array.isArray(r) ? (ti(e, n?.[0], r[0]), ti(e, n?.[1], r[1], "important")) : ti(e, n, r));
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function ri(e, t, n = !1) {
	if (e.multiple) {
		if (t == null) return;
		if (!r(t)) return Ae();
		for (var i of e.options) i.selected = t.includes(ai(i));
	} else {
		for (i of e.options) if (tn(ai(i), t)) {
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
	}), yn(() => {
		t.disconnect();
	});
}
function ai(e) {
	return "__value" in e ? e.__value : e.value;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var oi = Symbol("is custom element"), si = Symbol("is html"), ci = he ? "link" : "LINK", li = he ? "progress" : "PROGRESS";
function ui(e) {
	if (E) {
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
		e[pe] = n, qe(n), at();
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
	E && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === ci) || i[t] !== (i[t] = n) && (t === "loading" && (e[ce] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && hi(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function pi(e) {
	return e[le] ??= {
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
	st(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = _i(e) ? vi(a) : a, n(a), N !== null && r.add(N), await sr(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (E && e.defaultValue !== e.value || ur(t) == null && e.value) && (n(_i(e) ? vi(e.value) : e.value), N !== null && r.add(N)), Tn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = N;
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
	return e === t || e?.[oe] === t;
}
function $(e = {}, t, n, r) {
	var i = k.r, a = H;
	return Cn(() => {
		var o, s;
		return Tn(() => {
			o = s, s = r?.() || [], ur(() => {
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
	var i = !Ve || !!(n & 2), a = !!(n & 8), o = !!(n & 16), s = r, l = !0, u = void 0, d = () => o && i ? (u ??= /* @__PURE__ */ gt(r), W(u)) : (l && (l = !1, s = o ? ur(r) : r), s);
	let f;
	if (a) {
		var p = oe in e || se in e;
		f = c(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	a ? [m, h] = nt(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && Ce(t), f(m)));
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
	var v = !1, y = (n & 1 ? gt : bt)(() => (v = !1, g()));
	a && W(y);
	var b = H;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? W(y) : i && a ? $t(e) : e;
			return F(y, n), v = !0, s !== void 0 && (s = n), e;
		}
		return Bn && v || b.f & 16384 ? y.v : W(y);
	});
}
var xi = /* @__PURE__ */ K("<article class=\"pc-workflow-starter\"><strong> </strong><p> </p> <small> </small> <button class=\"menu_button\"> </button></article>"), Si = /* @__PURE__ */ K("<small>No supported operations yet. Reference-based voice matching is a future candidate.</small>"), Ci = /* @__PURE__ */ K("<button class=\"menu_button\"> <small> </small></button>"), wi = /* @__PURE__ */ K("<button class=\"menu_button\" draggable=\"true\"> <small>· legacy</small></button>"), Ti = /* @__PURE__ */ K("<details class=\"pc-workflow-family\"><summary> </summary><p> </p> <!> <!> <!></details>"), Ei = /* @__PURE__ */ K("<label>Workflow mode <select aria-label=\"Workflow mode\" class=\"text_pole\"><option>Legacy · Replace prompt</option><option>Native · Guidance and reviewed reply</option></select></label> <h3>Workflow examples</h3> <!> <h3>Node families</h3> <!>", 1), Di = /* @__PURE__ */ K("<option> </option>"), Oi = /* @__PURE__ */ K("<label> <select class=\"text_pole\"><option>Choose a connection</option><!></select></label> <label> <input class=\"text_pole\" placeholder=\"Use profile model\"/></label>", 1), ki = /* @__PURE__ */ K("<p class=\"pc-error\"> </p>"), Ai = /* @__PURE__ */ K("<small> </small>"), ji = /* @__PURE__ */ K("<button class=\"menu_button\"> </button>"), Mi = /* @__PURE__ */ K("<label>Model role<input class=\"text_pole\"/></label> <label>Node connection override<select class=\"text_pole\"><option>Use role binding</option><!></select></label> <label>Node model override<input class=\"text_pole\" placeholder=\"Use bound model\"/></label> <small> </small>", 1), Ni = /* @__PURE__ */ K("<select class=\"text_pole\"></select>"), Pi = /* @__PURE__ */ K("<input type=\"checkbox\"/>"), Fi = /* @__PURE__ */ K("<input class=\"text_pole\" type=\"number\"/>"), Ii = /* @__PURE__ */ K("<textarea class=\"text_pole\"></textarea>"), Li = /* @__PURE__ */ K("<p class=\"pc-error\" role=\"alert\"> </p>"), Ri = /* @__PURE__ */ K("<small>One literal phrase per line. Imported objects use one JSON object per line with a \"phrase\" field; keep their other fields to preserve metadata. Quote a literal phrase that starts with &#123;, [ or &quot; as a JSON string.</small> <!>", 1), zi = /* @__PURE__ */ K("<label> <!></label> <!>", 1), Bi = /* @__PURE__ */ K("<small>Protected literal pins reserve every source message containing an exact match verbatim. A missing pin reports PIN_MISSING. Source IDs are for inspection.</small>"), Vi = /* @__PURE__ */ K("<div class=\"pc-workflow-editor\"><p> </p> <label>Operation name<input class=\"text_pole\"/></label> <label><input type=\"checkbox\"/> Enabled</label> <small>Disabled operations block preflight; they do not bypass.</small> <!> <!> <button class=\"menu_button\">Duplicate operation</button> <button class=\"menu_button pc-danger\">Delete operation</button> <!> <!></div>"), Hi = /* @__PURE__ */ K("<button class=\"menu_button\"> </button> <!>", 1), Ui = /* @__PURE__ */ K("<p role=\"status\"> </p>"), Wi = /* @__PURE__ */ K("<h4>Computed guidance</h4><pre> </pre>", 1), Gi = /* @__PURE__ */ K("<div class=\"pc-workflow-comparison\"><div>Original<pre> </pre></div><div>Candidate<pre> </pre></div></div> <!> <button class=\"menu_button\">Apply reviewed candidate</button> <button class=\"menu_button\">Reject candidate</button> <small>Apply rechecks source freshness. Other memory extensions may already have consumed the original; saving does not confirm durability.</small>", 1), Ki = /* @__PURE__ */ K("<h4>Workflow result</h4> <!> <p> </p> <p> </p> <!> <!> <details><summary>Findings and changes</summary><pre> </pre></details> <details><summary>Reports and request trace</summary><pre> </pre></details>", 1), qi = /* @__PURE__ */ K("<h3> </h3> <p> </p> <strong> </strong> <!> <button class=\"menu_button\"> </button> <small> </small> <!> <button class=\"menu_button\"> </button> <!> <!> <h4>Inspect operations</h4> <!> <!> <!>", 1), Ji = /* @__PURE__ */ K("<section class=\"pc-workflows\"><!></section>");
function Yi(e, t) {
	A(t, !0);
	let n = bi(t, "mode", 3, "setup"), r = /* @__PURE__ */ P(null), i = /* @__PURE__ */ P(null);
	function a(e) {
		(e.graphId !== W(r)?.graphId || e.selectedId !== W(r)?.selectedId) && F(i, null), F(r, e);
	}
	let o = (e) => e.split("\n").filter((e) => e.trim());
	function s(e, n) {
		let r = t.actions.editRules(e, n);
		F(i, r ? {
			text: n,
			error: r
		} : null, !0);
	}
	var c = { update: a }, l = Er(), u = L(l), d = (e) => {
		var a = Ji(), c = I(a), l = (e) => {
			var n = Ei(), i = L(n), a = R(I(i)), o = I(a);
			o.value = o.__value = "legacy";
			var s = R(o);
			s.value = s.__value = "native", O(a);
			var c;
			ii(a), O(i);
			var l = R(i, 4);
			X(l, 17, () => W(r).starters, (e) => e.id, (e, n) => {
				var r = xi(), i = I(r), a = I(i, !0);
				O(i);
				var o = R(i), s = I(o, !0);
				O(o);
				var c = R(o, 2), l = I(c);
				O(c);
				var u = R(c, 2), d = I(u);
				O(u), O(r), z((e) => {
					J(a, W(n).title), J(s, W(n).purpose), J(l, `${W(n).phase === "pre" ? "Before reply · Guidance" : "After reply · Reviewed reply"} · Roles: ${e ?? ""} · Maximum ${W(n).callBound ?? ""} auxiliary requests`), J(d, `Install ${W(n).title ?? ""}`);
				}, [() => W(n).roles.join(", ")]), G("click", u, () => t.actions.install(W(n).id)), q(e, r);
			}), X(R(l, 4), 17, () => W(r).families, (e) => e.name, (e, n) => {
				var i = Ti(), a = I(i), o = I(a, !0);
				O(a);
				var s = R(a), c = I(s, !0);
				O(s);
				var l = R(s, 2), u = (e) => {
					q(e, Si());
				};
				Y(l, (e) => {
					W(n).name === "Transpose" && e(u);
				});
				var d = R(l, 2);
				X(d, 17, () => W(n).operations, (e) => e.id, (e, n) => {
					var i = Ci(), a = I(i), o = R(a), s = I(o);
					O(o), O(i), z(() => {
						i.disabled = !W(r).native || !W(n).compatible, Q(i, "title", W(r).native ? W(n).compatible ? "Add operation" : "This operation requires the " + W(n).phase + " phase." : "Install a native example first; legacy controls remain below."), J(a, `${W(n).title ?? ""} `), J(s, `· ${W(n).phase ?? ""}`);
					}), G("click", i, () => t.actions.addNode(W(n).id)), q(e, i);
				});
				var f = R(d, 2), p = (e) => {
					var r = Er();
					X(L(r), 17, () => W(n).legacy, (e) => e.id, (e, n) => {
						var r = wi(), i = I(r);
						Fe(), O(r), z(() => {
							Q(r, "aria-label", "Add legacy " + W(n).title), J(i, `${W(n).title ?? ""} `);
						}), hr("dragstart", r, (e) => e.dataTransfer?.setData("application/x-prompt-canvas", JSON.stringify({
							kind: "block",
							type: W(n).id
						}))), G("click", r, () => t.actions.addLegacyNode(W(n).id)), q(e, r);
					}), q(e, r);
				};
				Y(f, (e) => {
					W(r).native || e(p);
				}), O(i), z(() => {
					i.open = W(r).native, J(o, W(n).name), J(c, W(n).description);
				}), q(e, i);
			}), z(() => {
				c !== (c = W(r).workflowMode) && (a.value = (a.__value = W(r).workflowMode) ?? "", ri(a, W(r).workflowMode));
			}), G("change", a, (e) => t.actions.setMode(e.currentTarget.value)), q(e, n);
		}, u = (e) => {
			var n = qi(), a = L(n), c = I(a, !0);
			O(a);
			var l = R(a, 2), u = I(l, !0);
			O(l);
			var d = R(l, 2), f = I(d);
			O(d);
			var p = R(d, 2);
			X(p, 17, () => W(r).roles, (e) => e.name, (e, n) => {
				var i = Oi(), a = L(i), o = I(a), s = R(o), c = I(s);
				c.value = c.__value = "", X(R(c), 17, () => W(r).profiles, (e) => e.id, (e, t) => {
					var n = Di(), r = I(n, !0);
					O(n);
					var i = {};
					z(() => {
						J(r, W(t).name), i !== (i = W(t).id) && (n.value = (n.__value = W(t).id) ?? "");
					}), q(e, n);
				}), O(s);
				var l;
				ii(s), O(a);
				var u = R(a, 2), d = I(u), f = R(d);
				ui(f), O(u), z(() => {
					J(o, `${W(n).name ?? ""} connection `), Q(s, "aria-label", W(n).name + " connection"), l !== (l = W(n).profileId) && (s.value = (s.__value = W(n).profileId) ?? "", ri(s, W(n).profileId)), J(d, `${W(n).name ?? ""} model override`), di(f, W(n).model);
				}), G("change", s, (e) => t.actions.bindRole(W(n).name, e.currentTarget.value, W(n).model)), G("input", f, (e) => t.actions.bindRole(W(n).name, W(n).profileId, e.currentTarget.value)), q(e, i);
			});
			var m = R(p, 2), h = I(m);
			O(m);
			var g = R(m, 2), _ = I(g);
			O(g);
			var v = R(g, 2);
			X(v, 17, () => W(r).issues, Rr, (e, t) => {
				var n = ki(), r = I(n, !0);
				O(n), z(() => J(r, W(t))), q(e, n);
			});
			var y = R(v, 2), b = I(y, !0);
			O(y);
			var x = R(y, 2), S = (e) => {
				var t = Ai(), n = I(t);
				O(t), z(() => J(n, `Test workflow does not publish guidance. A later Send reruns the workflow and may incur up to ${W(r).callBound ?? ""} auxiliary requests again.`)), q(e, t);
			};
			Y(x, (e) => {
				W(r).phase === "pre" && e(S);
			});
			var ee = R(x, 2);
			X(ee, 17, () => W(r).groups, (e) => e.id, (e, n) => {
				var r = ji(), i = I(r);
				O(r), z(() => J(i, `${W(n).collapsed ? "Open" : "Fold"} ${W(n).title ?? ""} formation · Surface · maximum ${W(n).callBound ?? ""} ${W(n).callBound === 1 ? "request" : "requests"}`)), G("click", r, () => t.actions.expand(W(n).id)), q(e, r);
			});
			var C = R(ee, 4);
			X(C, 17, () => W(r).nodes, (e) => e.id, (e, n) => {
				var a = Hi(), c = L(a), l = I(c);
				O(c);
				var u = R(c, 2), d = (e) => {
					var a = Vi(), c = I(a), l = I(c);
					O(c);
					var u = R(c, 2), d = R(I(u));
					ui(d), O(u);
					var f = R(u, 2), p = I(f);
					ui(p), Fe(), O(f);
					var m = R(f, 4), h = (e) => {
						var i = Mi(), a = L(i), o = R(I(a));
						ui(o), O(a);
						var s = R(a, 2), c = R(I(s)), l = I(c);
						l.value = l.__value = "", X(R(l), 17, () => W(r).profiles, (e) => e.id, (e, t) => {
							var n = Di(), r = I(n, !0);
							O(n);
							var i = {};
							z(() => {
								J(r, W(t).name), i !== (i = W(t).id) && (n.value = (n.__value = W(t).id) ?? "");
							}), q(e, n);
						}), O(c);
						var u;
						ii(c), O(s);
						var d = R(s, 2), f = R(I(d));
						ui(f), O(d);
						var p = R(d, 2), m = I(p);
						O(p), z(() => {
							di(o, W(n).modelRole), u !== (u = W(n).profileId) && (c.value = (c.__value = W(n).profileId) ?? "", ri(c, W(n).profileId)), di(f, W(n).model), J(m, `Effective connection: ${W(n).effective ?? ""}`);
						}), G("input", o, (e) => t.actions.updateNode(W(n).id, "modelRole", e.currentTarget.value)), G("change", c, (e) => t.actions.updateNode(W(n).id, "profileId", e.currentTarget.value || null)), G("input", f, (e) => t.actions.updateNode(W(n).id, "model", e.currentTarget.value || null)), q(e, i);
					};
					Y(m, (e) => {
						W(n).modelRole && e(h);
					});
					var g = R(m, 2);
					X(g, 17, () => W(n).controls, (e) => e.key, (e, r) => {
						var a = zi(), c = L(a), l = I(c), u = R(l), d = (e) => {
							var i = Ni();
							X(i, 21, () => W(r).options, Rr, (e, t) => {
								var n = Di(), r = I(n, !0);
								O(n);
								var i = {};
								z(() => {
									J(r, W(t)), i !== (i = W(t)) && (n.value = (n.__value = W(t)) ?? "");
								}), q(e, n);
							}), O(i);
							var a;
							ii(i), z((e) => {
								a !== (a = e) && (i.value = (i.__value = e) ?? "", ri(i, e));
							}, [() => String(W(r).value)]), G("change", i, (e) => t.actions.updateNode(W(n).id, W(r).key, e.currentTarget.value)), q(e, i);
						}, f = (e) => {
							var i = Pi();
							ui(i), z((e) => fi(i, e), [() => !!W(r).value]), G("change", i, (e) => t.actions.updateNode(W(n).id, W(r).key, e.currentTarget.checked)), q(e, i);
						}, p = (e) => {
							var i = Fi();
							ui(i), z((e) => {
								Q(i, "aria-label", W(r).label), Q(i, "min", W(r).key === "keepRecent" ? 0 : 1), di(i, e);
							}, [() => Number(W(r).value)]), G("input", i, (e) => t.actions.updateNode(W(n).id, W(r).key, Number(e.currentTarget.value))), q(e, i);
						}, m = (e) => {
							var t = Ii();
							rt(t), z((e) => {
								Q(t, "aria-label", W(r).label), Q(t, "aria-invalid", !!W(i)), Q(t, "aria-describedby", "rule-help-" + W(n).id + (W(i) ? " rule-error-" + W(n).id : "")), di(t, e);
							}, [() => W(i)?.text ?? String(W(r).value)]), G("input", t, (e) => s(W(n).id, e.currentTarget.value)), q(e, t);
						}, h = (e) => {
							var i = Ii();
							rt(i), z((e) => di(i, e), [() => String(W(r).value)]), G("input", i, (e) => t.actions.updateNode(W(n).id, W(r).key, W(r).kind === "lines" ? o(e.currentTarget.value) : e.currentTarget.value)), q(e, i);
						};
						Y(u, (e) => {
							W(r).options ? e(d) : W(r).kind === "boolean" ? e(f, 1) : W(r).kind === "number" ? e(p, 2) : W(r).kind === "rules" ? e(m, 3) : e(h, -1);
						}), O(c);
						var g = R(c, 2), _ = (e) => {
							var t = Ri(), r = L(t), a = R(r, 2), o = (e) => {
								var t = Li(), r = I(t, !0);
								O(t), z(() => {
									Q(t, "id", "rule-error-" + W(n).id), J(r, W(i).error);
								}), q(e, t);
							};
							Y(a, (e) => {
								W(i) && e(o);
							}), z(() => Q(r, "id", "rule-help-" + W(n).id)), q(e, t);
						};
						Y(g, (e) => {
							W(r).kind === "rules" && e(_);
						}), z(() => J(l, `${W(r).label ?? ""} `)), q(e, a);
					});
					var _ = R(g, 2), v = R(_, 2), y = R(v, 2), b = (e) => {
						q(e, Bi());
					};
					Y(y, (e) => {
						W(n).operation === "smart-compactor" && e(b);
					});
					var x = R(y, 2), S = (e) => {
						var t = Ai(), n = I(t, !0);
						O(t), z(() => J(n, W(r).quoteHelp)), q(e, t);
					};
					Y(x, (e) => {
						W(n).operation === "pattern-scan" && e(S);
					}), O(a), z(() => {
						J(l, `${W(n).family ?? ""} · ${W(n).phase ?? ""} phase · ${W(n).input ?? ""} → ${W(n).output ?? ""}`), di(d, W(n).title), fi(p, W(n).enabled);
					}), G("input", d, (e) => t.actions.updateNode(W(n).id, "title", e.currentTarget.value)), G("change", p, (e) => t.actions.updateNode(W(n).id, "enabled", e.currentTarget.checked)), G("click", _, () => t.actions.duplicate(W(n).id)), G("click", v, () => t.actions.remove(W(n).id)), q(e, a);
				};
				Y(u, (e) => {
					W(n).id === W(r).selectedId && e(d);
				}), z(() => {
					Q(c, "aria-pressed", W(r).selectedId === W(n).id), J(l, `Inspect ${W(n).title ?? ""}`);
				}), G("click", c, () => t.actions.inspect(W(n).id)), q(e, a);
			});
			var w = R(C, 2), te = (e) => {
				var t = Ui(), n = I(t, !0);
				O(t), z(() => J(n, W(r).status)), q(e, t);
			};
			Y(w, (e) => {
				W(r).status && e(te);
			});
			var ne = R(w, 2), re = (e) => {
				var n = Ki(), a = R(L(n), 2), o = (e) => {
					var t = ki(), n = I(t, !0);
					O(t), z(() => J(n, W(r).result.error)), q(e, t);
				};
				Y(a, (e) => {
					W(r).result.error && e(o);
				});
				var s = R(a, 2), c = I(s);
				O(s);
				var l = R(s, 2), u = I(l);
				O(l);
				var d = R(l, 2), f = (e) => {
					var t = Wi(), n = R(L(t)), i = I(n, !0);
					O(n), z(() => J(i, W(r).result.guidance)), q(e, t);
				};
				Y(d, (e) => {
					W(r).result.guidance && e(f);
				});
				var p = R(d, 2), m = (e) => {
					var n = Gi(), a = L(n), o = I(a), s = R(I(o)), c = I(s, !0);
					O(s), O(o);
					var l = R(o), u = R(I(l)), d = I(u, !0);
					O(u), O(l), O(a);
					var f = R(a, 2), p = (e) => {
						var t = ki(), n = I(t, !0);
						O(t), z(() => J(n, W(r).result.applyIssue)), q(e, t);
					};
					Y(f, (e) => {
						W(r).result.applyIssue && e(p);
					});
					var m = R(f, 2), h = R(m, 2);
					Fe(2), z(() => {
						J(c, W(r).result.original), J(d, W(r).result.candidate), m.disabled = W(r).busy || !!W(r).result.applyIssue || !!W(i), h.disabled = W(r).busy;
					}), G("click", m, () => t.actions.apply()), G("click", h, () => t.actions.reject()), q(e, n);
				};
				Y(p, (e) => {
					W(r).result.applyAvailable && e(m);
				});
				var h = R(p, 2), g = R(I(h)), _ = I(g, !0);
				O(g), O(h);
				var v = R(h, 2), y = R(I(v)), b = I(y, !0);
				O(y), O(v), z((e, t, n) => {
					J(c, `Actual auxiliary requests: ${W(r).result.actualCalls ?? ""} / ${W(r).result.callBound ?? ""}`), J(u, `Token count method: ${e ?? ""}`), J(_, t), J(b, n);
				}, [
					() => W(r).result.tokenMethods.join(", ") || "Not reported",
					() => JSON.stringify({
						findings: W(r).result.findings,
						changes: W(r).result.changes
					}, null, 2),
					() => JSON.stringify({
						reports: W(r).result.reports,
						calls: W(r).result.calls
					}, null, 2)
				]), q(e, n);
			};
			Y(ne, (e) => {
				W(r).result && e(re);
			}), z(() => {
				J(c, W(r).name), J(u, W(r).phase === "pre" ? "Guidance helps SillyTavern plan its normal reply." : "Review a revision of the latest completed assistant reply."), J(f, `Maximum auxiliary requests: ${W(r).callBound ?? ""}`), J(h, `Assign ${W(r).phase ?? ""} phase and enable native mode`), J(_, `${W(r).assigned ? "Assigned to this phase." : "Phase is not assigned."} Mode: ${W(r).workflowMode ?? ""}. Arming is a separate action.`), y.disabled = W(r).busy || !!W(r).issues.length || !!W(i), J(b, W(r).busy ? "Running…" : W(r).phase === "pre" ? "Test workflow" : "Run reviewed repair");
			}), G("click", m, () => t.actions.assign(W(r)?.phase || "")), G("click", y, () => t.actions.run()), q(e, n);
		};
		Y(c, (e) => {
			n() === "library" ? e(l) : e(u, -1);
		}), O(a), z(() => {
			Q(a, "data-pc-workflows", n()), Q(a, "aria-label", n() === "library" ? "Workflow library" : "Workflow setup and review");
		}), q(e, a);
	};
	return Y(u, (e) => {
		W(r) && e(d);
	}), q(e, l), j(c);
}
gr([
	"change",
	"click",
	"input"
]);
//#endregion
//#region ui/NodeCard.svelte
var Xi = /* @__PURE__ */ K("<span> </span>"), Zi = /* @__PURE__ */ K("<span class=\"pc-off-pill\">OFF</span>"), Qi = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-node-action pc-help-btn fa-solid fa-circle-question\" title=\"How Deciders work\" aria-label=\"How Deciders work\"></button>"), $i = /* @__PURE__ */ K("<button type=\"button\"></button>"), ea = /* @__PURE__ */ K("<div class=\"pc-node-body\"> </div>"), ta = /* @__PURE__ */ K("<div> </div>"), na = /* @__PURE__ */ K("<div><b> </b><span> </span></div>"), ra = /* @__PURE__ */ K("<div><!> <!></div>"), ia = /* @__PURE__ */ K("· <b> </b>", 1), aa = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-node-action pc-node-model pc-node-model-pick\"><i class=\"fa-solid fa-microchip\"></i> <!> <i class=\"fa-solid fa-caret-down pc-model-caret\"></i></button>"), oa = /* @__PURE__ */ K("<div class=\"pc-node-model\"><i class=\"fa-solid fa-microchip\"></i> <!></div>"), sa = /* @__PURE__ */ K("<div><i></i> </div>"), ca = /* @__PURE__ */ K("<span class=\"pc-port-keyname\"> </span>"), la = /* @__PURE__ */ K("<i></i>"), ua = /* @__PURE__ */ K("<div><!><!></div>"), da = /* @__PURE__ */ K("<div role=\"group\"><div class=\"pc-node-head\"><span class=\"pc-badge\"><i></i> </span> <span class=\"pc-node-title\"> </span> <!> <!> <!> <!></div> <!> <!> <!> <!> <!></div>");
function fa(e, t) {
	A(t, !0);
	let n = (e) => e.stopPropagation();
	var r = da();
	let i;
	var a = I(r), o = I(a), s = I(o), c = R(s);
	O(o);
	var l = R(o, 2), u = I(l, !0);
	O(l);
	var d = R(l, 2), f = (e) => {
		var n = Xi(), r = I(n, !0);
		O(n), z(() => {
			Z(n, 1, Yr(t.card.token.className)), Q(n, "title", t.card.token.title), J(r, t.card.token.text);
		}), q(e, n);
	};
	Y(d, (e) => {
		t.card.token && e(f);
	});
	var p = R(d, 2), m = (e) => {
		var n = Zi();
		z(() => Q(n, "title", t.card.offHint)), q(e, n);
	};
	Y(p, (e) => {
		t.card.offHint && e(m);
	});
	var h = R(p, 2), g = (e) => {
		var r = Qi();
		G("mousedown", r, n), G("click", r, (e) => {
			n(e), t.actions.help(t.card.id);
		}), q(e, r);
	};
	Y(h, (e) => {
		t.card.help && e(g);
	});
	var _ = R(h, 2), v = (e) => {
		var r = $i();
		z(() => {
			Z(r, 1, `pc-node-action pc-toggle fa-solid ${t.card.enabled ? "fa-toggle-on pc-toggle-on" : "fa-toggle-off pc-toggle-off"}`), Q(r, "title", t.card.enabled ? "Switched on — click to switch off" : "Switched off — click to switch on"), Q(r, "aria-label", `Switch ${t.card.title} ${t.card.enabled ? "off" : "on"}`), Q(r, "aria-pressed", t.card.enabled);
		}), G("mousedown", r, n), G("click", r, (e) => {
			n(e), t.actions.toggle(t.card.id);
		}), q(e, r);
	};
	Y(_, (e) => {
		t.card.toggle && e(v);
	}), O(a);
	var y = R(a, 2), b = (e) => {
		var n = ea(), r = I(n, !0);
		O(n), z(() => J(r, t.card.body)), q(e, n);
	};
	Y(y, (e) => {
		t.card.body !== null && e(b);
	});
	var x = R(y, 2), S = (e) => {
		var n = ra(), r = I(n), i = (e) => {
			var n = ta(), r = I(n, !0);
			O(n), z(() => {
				Z(n, 1, Yr(t.card.mode.className)), J(r, t.card.mode.text);
			}), q(e, n);
		};
		Y(r, (e) => {
			t.card.mode && e(i);
		}), X(R(r, 2), 17, () => t.card.rows, (e) => e.id, (e, t) => {
			var n = na(), r = I(n), i = I(r, !0);
			O(r);
			var a = R(r), o = I(a, !0);
			O(a), O(n), z(() => {
				Z(n, 1, `pc-dec-key${W(t).chosen ? " pc-dec-chosen" : ""}${W(t).fallback ? " pc-dec-fallback" : ""}`), J(i, W(t).name), J(o, W(t).text);
			}), q(e, n);
		}), O(n), z(() => Z(n, 1, Yr(t.card.rowClass))), q(e, n);
	};
	Y(x, (e) => {
		t.card.body === null && e(S);
	});
	var ee = R(x, 2), C = (e) => {
		var r = Er(), i = L(r), a = (e) => {
			var r = aa(), i = R(I(r)), a = R(i), o = (e) => {
				var n = ia(), r = R(L(n)), i = I(r, !0);
				O(r), z(() => J(i, t.card.model.actual)), q(e, n);
			};
			Y(a, (e) => {
				t.card.model.actual && e(o);
			}), Fe(2), O(r), z(() => {
				Q(r, "title", t.card.model.title), J(i, ` ${t.card.model.where ?? ""}`);
			}), G("mousedown", r, n), G("dblclick", r, n), G("click", r, (e) => {
				n(e), t.actions.model(t.card.id, e.currentTarget);
			}), q(e, r);
		}, o = (e) => {
			var n = oa(), r = R(I(n)), i = R(r), a = (e) => {
				var n = ia(), r = R(L(n)), i = I(r, !0);
				O(r), z(() => J(i, t.card.model.actual)), q(e, n);
			};
			Y(i, (e) => {
				t.card.model.actual && e(a);
			}), O(n), z(() => {
				Q(n, "title", t.card.model.title), J(r, ` ${t.card.model.where ?? ""}`);
			}), q(e, n);
		};
		Y(i, (e) => {
			t.card.model.pick ? e(a) : e(o, -1);
		}), q(e, r);
	};
	Y(ee, (e) => {
		t.card.model && e(C);
	});
	var w = R(ee, 2);
	X(w, 19, () => t.card.notices, (e, t) => `${e.className}:${t}`, (e, t) => {
		var n = sa(), r = I(n), i = R(r);
		O(n), z(() => {
			Z(n, 1, Yr(W(t).className)), Q(n, "title", W(t).title), Z(r, 1, `fa-solid ${W(t).icon}`), J(i, ` ${W(t).text ?? ""}`);
		}), q(e, n);
	}), X(R(w, 2), 17, () => t.card.ports, (e) => e.id, (e, n) => {
		var r = ua();
		let i;
		var a = I(r), o = (e) => {
			var t = ca(), r = I(t, !0);
			O(t), z(() => J(r, W(n).label)), q(e, t);
		};
		Y(a, (e) => {
			W(n).label && e(o);
		});
		var s = R(a), c = (e) => {
			var t = la();
			z(() => Z(t, 1, `fa-solid ${W(n).icon}`)), q(e, t);
		};
		Y(s, (e) => {
			W(n).icon && e(c);
		}), O(r), z(() => {
			Z(r, 1, Yr(W(n).className)), Q(r, "data-node", t.card.id), Q(r, "data-dir", W(n).dir), Q(r, "data-port", W(n).port), Q(r, "data-side", W(n).side), Q(r, "title", W(n).title), i = ni(r, "", i, { left: W(n).left === void 0 ? void 0 : `${W(n).left}%` });
		}), q(e, r);
	}), O(r), z(() => {
		Z(r, 1, Yr(t.card.className)), Q(r, "data-id", t.card.id), Q(r, "title", t.card.hint), Q(r, "aria-label", `${t.card.label}: ${t.card.title}`), i = ni(r, "", i, {
			left: `${t.card.x}px`,
			top: `${t.card.y}px`,
			width: `${t.card.w}px`
		}), Z(s, 1, `fa-solid ${t.card.icon} pc-badge-icon`), J(c, ` ${t.card.label ?? ""}`), Q(l, "title", t.card.titleHint), J(u, t.card.title);
	}), hr("mouseenter", r, () => t.actions.hover(t.card.id)), hr("mouseleave", r, () => t.actions.hover(null)), q(e, r), j();
}
gr([
	"mousedown",
	"click",
	"dblclick"
]);
//#endregion
//#region ui/GroupCard.svelte
var pa = /* @__PURE__ */ K("<span class=\"pc-badge\"><i class=\"fa-solid fa-object-group pc-badge-icon\"></i> Group</span>"), ma = /* @__PURE__ */ K("<i class=\"fa-solid fa-object-group\"></i>"), ha = /* @__PURE__ */ K("<span class=\"pc-group-frame-count\"> </span>"), ga = /* @__PURE__ */ K("<span> </span>"), _a = /* @__PURE__ */ K("<span class=\"pc-off-pill\" title=\"This whole group is switched off. Nothing in it is sent, and nothing passes through it.\">OFF</span>"), va = /* @__PURE__ */ K("<div class=\"pc-node-body\"> </div><div class=\"pc-node-model pc-group-io\"> </div> <div class=\"pc-node-cond\"> </div> <div class=\"pc-gport pc-gport-in\" data-gport=\"in\" title=\"Drag up to a block to wire it into this group\"></div> <div class=\"pc-gport pc-gport-out\" data-gport=\"out\" title=\"Drag to wire a block in this group into another block\"></div>", 1), ya = /* @__PURE__ */ K("<div class=\"pc-group-resize\" data-action=\"resize\" title=\"Drag to resize the blanket\"></div>"), ba = /* @__PURE__ */ K("<div role=\"group\"><div><!> <span> </span> <!> <!> <!> <button type=\"button\"></button> <button type=\"button\" data-action=\"toggle\" aria-label=\"Toggle group\"></button></div> <!></div>");
function xa(e, t) {
	A(t, !0);
	function n(e, n) {
		e.stopPropagation(), e.preventDefault(), t.actions.group(t.group.id, n);
	}
	function r(e, n) {
		e.stopPropagation(), e.detail === 0 && t.actions.group(t.group.id, n);
	}
	var i = ba();
	let a;
	var o = I(i), s = I(o), c = (e) => {
		q(e, pa());
	}, l = (e) => {
		q(e, ma());
	};
	Y(s, (e) => {
		t.group.collapsed ? e(c) : e(l, -1);
	});
	var u = R(s, 2), d = I(u, !0);
	O(u);
	var f = R(u, 2), p = (e) => {
		var n = ha(), r = I(n, !0);
		O(n), z(() => J(r, t.group.count)), q(e, n);
	};
	Y(f, (e) => {
		t.group.collapsed || e(p);
	});
	var m = R(f, 2), h = (e) => {
		var n = ga(), r = I(n, !0);
		O(n), z(() => {
			Z(n, 1, Yr(t.group.token.className)), Q(n, "title", t.group.token.title), J(r, t.group.token.text);
		}), q(e, n);
	};
	Y(m, (e) => {
		t.group.token && e(h);
	});
	var g = R(m, 2), _ = (e) => {
		q(e, _a());
	};
	Y(g, (e) => {
		t.group.enabled || e(_);
	});
	var v = R(g, 2), y = R(v, 2);
	O(o);
	var b = R(o, 2), x = (e) => {
		var n = va(), r = L(n), i = I(r, !0);
		O(r);
		var a = R(r), o = I(a, !0);
		O(a);
		var s = R(a, 2), c = I(s, !0);
		O(s);
		var l = R(s, 2), u = R(l, 2);
		z(() => {
			J(i, t.group.body), J(o, t.group.io), J(c, t.group.enabled ? "double-click to open" : "switched off — nothing goes through"), Q(l, "data-group", t.group.id), Q(u, "data-group", t.group.id);
		}), q(e, n);
	}, S = (e) => {
		q(e, ya());
	};
	Y(b, (e) => {
		t.group.collapsed ? e(x) : e(S, -1);
	}), O(i), z(() => {
		Z(i, 1, Yr(t.group.className)), Q(i, "data-group", t.group.id), Q(i, "aria-label", `Group: ${t.group.title}`), a = ni(i, "", a, {
			left: `${t.group.x}px`,
			top: `${t.group.y}px`,
			width: `${t.group.w}px`,
			height: t.group.collapsed ? void 0 : `${t.group.h}px`
		}), Z(o, 1, Yr(t.group.collapsed ? "pc-node-head" : "pc-group-frame-head")), Z(u, 1, Yr(t.group.collapsed ? "pc-node-title" : "pc-group-frame-title")), J(d, t.group.title), Z(v, 1, `pc-node-action fa-solid pc-group-btn ${t.group.collapsed ? "fa-up-right-and-down-left-from-center" : "fa-down-left-and-up-right-to-center"}`), Q(v, "data-action", t.group.collapsed ? "open" : "collapse"), Q(v, "title", t.group.collapsed ? "Open the group as a blanket" : "Fold the group"), Q(v, "aria-label", t.group.collapsed ? "Open group" : "Fold group"), Z(y, 1, `pc-node-action pc-toggle fa-solid ${t.group.enabled ? "fa-toggle-on pc-toggle-on" : "fa-toggle-off pc-toggle-off"}`), Q(y, "title", t.group.enabled ? "Switch the whole group off" : "Switch the whole group on"), Q(y, "aria-pressed", t.group.enabled);
	}), G("mousedown", v, (e) => n(e, t.group.collapsed ? "open" : "collapse")), G("click", v, (e) => r(e, t.group.collapsed ? "open" : "collapse")), G("mousedown", y, (e) => n(e, "toggle")), G("click", y, (e) => r(e, "toggle")), q(e, i), j();
}
gr(["mousedown", "click"]);
//#endregion
//#region ui/WireLayer.svelte
var Sa = /* @__PURE__ */ Tr("<title> </title>"), Ca = /* @__PURE__ */ Tr("<path class=\"pc-wire-hit\"></path><path></path><text> <!></text>", 1), wa = /* @__PURE__ */ Tr("<path></path>"), Ta = /* @__PURE__ */ Tr("<defs><marker viewBox=\"0 0 10 10\" refX=\"8\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto-start-reverse\"><path d=\"M 0 0 L 10 5 L 0 10 z\" class=\"pc-loop-arrow\"></path></marker></defs><!><!>", 1);
function Ea(e, t) {
	A(t, !0);
	var n = Ta(), r = L(n), i = I(r);
	O(r);
	var a = R(r);
	X(a, 17, () => t.wires, (e) => e.id, (e, n) => {
		var r = Ca(), i = L(r), a = R(i), o = R(a), s = I(o, !0), c = R(s), l = (e) => {
			var t = Sa(), r = I(t, !0);
			O(t), z(() => J(r, W(n).label.title)), q(e, t);
		};
		Y(c, (e) => {
			W(n).label.title && e(l);
		}), O(o), z(() => {
			Q(i, "d", W(n).d), Q(i, "data-id", W(n).id), Q(a, "d", W(n).d), Z(a, 0, Yr(W(n).className)), Q(a, "data-id", W(n).id), Q(a, "marker-end", W(n).arrow ? `url(#${t.markerId})` : void 0), Q(o, "x", W(n).label.x), Q(o, "y", W(n).label.y), Z(o, 0, Yr(W(n).label.className)), Q(o, "data-id", W(n).label.id), Q(o, "text-anchor", W(n).label.anchor), J(s, W(n).label.text);
		}), q(e, r);
	});
	var o = R(a), s = (e) => {
		var n = wa();
		z(() => {
			Q(n, "d", t.ghost.d), Z(n, 0, Yr(t.ghost.className));
		}), q(e, n);
	};
	Y(o, (e) => {
		t.ghost && e(s);
	}), z(() => Q(i, "id", t.markerId)), q(e, n), j();
}
//#endregion
//#region ui/CanvasLayer.svelte
var Da = /* @__PURE__ */ K("<div class=\"pc-viewport\" data-pc-renderer=\"svelte\"><svg class=\"pc-wires\" aria-label=\"Canvas connections\"><!></svg> <div class=\"pc-nodes\"><!> <!> <!></div></div>");
function Oa(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P([]), r = /* @__PURE__ */ P([]), i = /* @__PURE__ */ P([]), a = /* @__PURE__ */ P(null), o = /* @__PURE__ */ P({
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
		F(n, e);
	}
	function f(e) {
		F(r, e);
	}
	function p(e, t, n) {
		F(i, e), F(o, t), F(a, n);
	}
	function m(e, t) {
		let i = new Map(e.map((e) => [e.id, e])), a = new Map(t.map((e) => [e.id, e]));
		F(n, W(n).map((e) => i.has(e.id) ? {
			...e,
			...i.get(e.id)
		} : e)), F(r, W(r).map((e) => a.has(e.id) ? {
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
	}, g = Da(), _ = I(g);
	Ea(I(_), {
		get wires() {
			return W(i);
		},
		get markerId() {
			return t.markerId;
		},
		get ghost() {
			return W(a);
		}
	}), O(_), $(_, (e) => c = e, () => c);
	var v = R(_, 2), y = I(v);
	X(y, 17, () => W(r).filter((e) => !e.collapsed), (e) => e.id, (e, n) => {
		xa(e, {
			get group() {
				return W(n);
			},
			get actions() {
				return t.actions;
			}
		});
	});
	var b = R(y, 2);
	return X(b, 17, () => W(n), (e) => e.id, (e, n) => {
		fa(e, {
			get card() {
				return W(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), X(R(b, 2), 17, () => W(r).filter((e) => e.collapsed), (e) => e.id, (e, n) => {
		xa(e, {
			get group() {
				return W(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), O(v), $(v, (e) => l = e, () => l), O(g), $(g, (e) => s = e, () => s), z(() => {
		Q(_, "width", W(o).w), Q(_, "height", W(o).h), Q(_, "viewBox", `0 0 ${W(o).w} ${W(o).h}`);
	}), q(e, g), j(h);
}
//#endregion
//#region ui/WorkspaceMenus.svelte
var ka = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-flat-menu\" aria-haspopup=\"menu\"> </button>"), Aa = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\"><span> </span><small> </small></button>"), ja = /* @__PURE__ */ K("<div class=\"pc-workspace-menu-panel\" role=\"menu\" tabindex=\"-1\"></div>"), Ma = /* @__PURE__ */ K("<nav class=\"pc-workspace-menus\" aria-label=\"Workspace menus\"><!> <!></nav>");
function Na(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P(""), r, i = /* @__PURE__ */ P(null), a = null, o = /* @__PURE__ */ P(0), s = /* @__PURE__ */ P(0), c = [
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
		F(n, ""), e && a?.focus({ preventScroll: !0 });
	}
	async function f(e, t, r = !1) {
		if (W(n) === e && !r) {
			d();
			return;
		}
		F(n, e, !0), a = t, await sr();
		let c = t.getBoundingClientRect(), l = W(i).getBoundingClientRect();
		F(o, Math.max(4, Math.min(c.left, window.innerWidth - l.width - 4)), !0), F(s, c.bottom + 2), r && W(i).querySelector("button:not(:disabled)")?.focus();
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
		if (e.key === "Escape" && W(n)) e.preventDefault(), e.stopPropagation(), d(!0);
		else if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
			e.preventDefault();
			let i = W(n) || t.textContent || c[0], a = c[(c.indexOf(i) + (e.key === "ArrowRight" ? 1 : c.length - 1)) % c.length], o = r.querySelector(`[data-menu="${a}"]`);
			W(n) ? f(a, o, !0) : o.focus();
		} else if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Home" || e.key === "End") {
			if (e.preventDefault(), !W(n)) {
				f(t.dataset.menu || c[0], t, !0);
				return;
			}
			let r = [...W(i).querySelectorAll("button:not(:disabled)")], a = r.indexOf(t);
			r[e.key === "Home" ? 0 : e.key === "End" ? r.length - 1 : (a + (e.key === "ArrowUp" ? r.length - 1 : 1)) % r.length]?.focus();
		} else e.key === "Tab" && d();
	}
	var h = Ma();
	hr("pointerdown", nn, (e) => {
		W(n) && !r.contains(e.target) && !W(i)?.contains(e.target) && d();
	}), hr("resize", nn, () => d());
	var g = I(h);
	X(g, 17, () => c, Rr, (e, t) => {
		var r = ka(), i = I(r, !0);
		O(r), z(() => {
			Q(r, "data-menu", W(t)), Q(r, "aria-expanded", W(n) === W(t)), J(i, W(t));
		}), G("click", r, (e) => f(W(t), e.currentTarget)), G("keydown", r, m), q(e, r);
	});
	var _ = R(g, 2), v = (e) => {
		var t = ja();
		let r;
		X(t, 21, () => u(W(n)), Rr, (e, t) => {
			var n = Aa(), r = I(n), i = I(r, !0);
			O(r);
			var a = R(r), o = I(a, !0);
			O(a), O(n), z(() => {
				n.disabled = W(t).disabled, J(i, W(t).label), J(o, W(t).shortcut);
			}), G("click", n, () => p(W(t).command)), q(e, n);
		}), O(t), $(t, (e) => F(i, e), () => W(i)), z(() => {
			Q(t, "aria-label", W(n)), r = ni(t, "", r, {
				left: `${W(o)}px`,
				top: `${W(s)}px`
			});
		}), G("keydown", t, m), q(e, t);
	};
	Y(_, (e) => {
		W(n) && e(v);
	}), O(h), $(h, (e) => r = e, () => r), q(e, h), j();
}
gr(["click", "keydown"]);
//#endregion
//#region ui/Toolbar.svelte
var Pa = /* @__PURE__ */ K("<option> </option>"), Fa = /* @__PURE__ */ K("<header class=\"pc-header\" data-pc-ui=\"svelte\"><div class=\"pc-menubar\"><div class=\"pc-brand\"><img width=\"30\" height=\"30\" alt=\"\"/><span>LATTICE</span></div> <!> <button type=\"button\" class=\"pc-btn menu_button pc-close\" title=\"Close\" aria-label=\"Close canvas\">×</button></div> <div class=\"pc-workflow-bar\"><select class=\"pc-select pc-graph-select text_pole\" aria-label=\"Canvas\"></select> <div class=\"pc-header-actions pc-history\"><button type=\"button\" aria-label=\"Undo\">↶</button> <button type=\"button\" aria-label=\"Redo\">↷</button> <span> </span></div> <button type=\"button\" class=\"pc-btn menu_button pc-root-run\"> </button> <span class=\"pc-root-workflow-status\" role=\"status\"> </span> <button type=\"button\" class=\"pc-btn menu_button\" title=\"Workflow setup\">Setup</button> <div class=\"pc-header-actions pc-surface-actions\"><button type=\"button\" title=\"Show or hide the Library\" aria-label=\"Toggle library\">Library</button> <button type=\"button\" title=\"Show or hide the inspector\" aria-label=\"Toggle inspector\">Details</button></div> <label class=\"pc-arm\"><input class=\"pc-arm-input\" type=\"checkbox\"/><span>Arm</span></label></div></header>");
function Ia(e, t) {
	A(t, !0);
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
	}, u = Fa(), d = I(u), f = I(d), p = I(f);
	Fe(), O(f);
	var m = R(f, 2);
	Na(m, {
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
	var h = R(m, 2);
	O(d);
	var g = R(d, 2), _ = I(g);
	X(_, 21, () => t.state.graphs, (e) => e.id, (e, t) => {
		var n = Pa(), r = I(n, !0);
		O(n);
		var i = {};
		z(() => {
			J(r, W(t).name), i !== (i = W(t).id) && (n.value = (n.__value = W(t).id) ?? "");
		}), q(e, n);
	}), O(_), $(_, (e) => r = e, () => r);
	var v;
	ii(_);
	var y = R(_, 2), b = I(y), x = R(b, 2), S = R(x, 2), ee = I(S, !0);
	O(S), O(y);
	var C = R(y, 2), w = I(C, !0);
	O(C);
	var te = R(C, 2), ne = I(te);
	O(te);
	var re = R(te, 2), ie = R(re, 2), ae = I(ie);
	$(ae, (e) => a = e, () => a);
	var T = R(ae, 2);
	$(T, (e) => o = e, () => o), O(ie);
	var oe = R(ie, 2), se = I(oe);
	return ui(se), $(se, (e) => i = e, () => i), Fe(), O(oe), O(g), O(u), $(u, (e) => n = e, () => n), z((e) => {
		Q(p, "src", t.actions.logoUrl), v !== (v = t.state.graphId) && (_.value = (_.__value = t.state.graphId) ?? "", ri(_, t.state.graphId)), Z(b, 1, `pc-btn menu_button pc-undo${t.state.history.undo ? "" : " pc-disabled"}`), b.disabled = !t.state.history.undo, Q(b, "title", t.state.history.undoTitle), Z(x, 1, `pc-btn menu_button pc-redo${t.state.history.redo ? "" : " pc-disabled"}`), x.disabled = !t.state.history.redo, Q(x, "title", t.state.history.redoTitle), Z(S, 1, `pc-history-note${t.state.history.showNote ? " pc-show" : ""}`), J(ee, t.state.history.note), C.disabled = !t.state.workflow?.native || !t.state.workflow?.busy && !!t.state.workflow?.issues.length, Q(C, "title", e), J(w, t.state.workflow?.busy ? "■ Stop" : "▶ Run"), J(ne, `${t.state.workflow?.native ? `${t.state.workflow.phase} · ${t.state.workflow.assigned ? "Assigned" : "Unassigned"} · ≤ ${t.state.workflow.callBound} requests` : "Legacy prompt"} · Autosave`), Z(ae, 1, `pc-btn menu_button pc-pane-toggle${t.state.sideOpen ? " pc-on" : ""}`), Q(ae, "aria-pressed", t.state.sideOpen), Z(T, 1, `pc-btn menu_button pc-pane-toggle${t.state.inspectorOpen ? " pc-on" : ""}`), Q(T, "aria-pressed", t.state.inspectorOpen), fi(se, t.state.armed);
	}, [() => t.state.workflow?.native ? t.state.workflow.issues.join("\n") || "Run the root workflow" : "Install a native workflow example to run"]), G("click", h, () => t.actions.command("close")), G("change", _, (e) => t.actions.pickGraph(e.currentTarget.value)), G("click", b, () => t.actions.command("undo")), G("click", x, () => t.actions.command("redo")), G("click", C, () => t.actions.command(t.state.workflow?.busy ? "stop-workflow" : "run-workflow")), G("click", re, () => t.local("workflow-setup")), G("click", ae, () => t.actions.command("sidebar")), G("click", T, () => t.actions.command("inspector")), G("change", se, (e) => t.actions.arm(e.currentTarget.checked)), q(e, u), j(l);
}
gr(["click", "change"]);
//#endregion
//#region ui/StatusBar.svelte
var La = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-btn menu_button pc-primary\">Run this one instead</button>"), Ra = /* @__PURE__ */ K("<div class=\"pc-status\"><span> </span> <span aria-live=\"polite\"> </span> <!> <span class=\"pc-spacer\"></span> <button type=\"button\" class=\"pc-btn menu_button\"><i class=\"fa-solid fa-thumbtack\"></i> </button> <button type=\"button\" class=\"pc-btn menu_button\"><i class=\"fa-solid fa-user-pen\"></i> </button> <button type=\"button\" class=\"pc-btn menu_button\"><i class=\"fa-solid fa-star\"></i> </button> <button type=\"button\" class=\"pc-btn menu_button pc-primary\"><i class=\"fa-solid fa-eye\"></i> Preview prompt</button></div>");
function za(e, t) {
	A(t, !0);
	let n;
	function r() {
		return n;
	}
	var i = { getElement: r }, a = Ra(), o = I(a), s = I(o, !0);
	O(o);
	var c = R(o, 2), l = I(c, !0);
	O(c);
	var u = R(c, 2), d = (e) => {
		var n = La();
		z(() => Q(n, "title", t.status.overrideTitle)), G("click", n, function(...e) {
			t.actions.unpin?.apply(this, e);
		}), q(e, n);
	};
	Y(u, (e) => {
		t.status.warning && e(d);
	});
	var f = R(u, 4), p = R(I(f));
	O(f);
	var m = R(f, 2), h = R(I(m));
	O(m);
	var g = R(m, 2), _ = R(I(g));
	O(g);
	var v = R(g, 2);
	return O(a), $(a, (e) => n = e, () => n), z(() => {
		Z(o, 1, `pc-pill ${t.status.armed ? "pc-pill-on" : "pc-pill-off"}`), J(s, t.status.armed ? "Armed" : "Off"), Z(c, 1, `pc-status-text${t.status.warning ? " pc-status-warn" : ""}`), J(l, t.status.text), J(p, ` ${t.status.chatPinned ? "Unpin from chat" : "Pin to this chat"}`), Q(m, "title", t.status.charTitle), J(h, ` ${t.status.charPinned ? "Unpin from character" : "Pin to character"}`), J(_, ` ${t.status.isDefault ? "Default canvas" : "Make default"}`);
	}), G("click", f, function(...e) {
		t.actions.pinChat?.apply(this, e);
	}), G("click", m, function(...e) {
		t.actions.pinCharacter?.apply(this, e);
	}), G("click", g, function(...e) {
		t.actions.makeDefault?.apply(this, e);
	}), G("click", v, function(...e) {
		t.actions.preview?.apply(this, e);
	}), q(e, a), j(i);
}
gr(["click"]);
//#endregion
//#region ui/CanvasControls.svelte
var Ba = /* @__PURE__ */ K("<span class=\"pc-selection-count\"> </span>"), Va = /* @__PURE__ */ K("<div class=\"pc-canvas-controls\" role=\"toolbar\" aria-label=\"Canvas tools\"><button type=\"button\" aria-label=\"Select tool\" title=\"Drag empty canvas to select blocks\">Select</button> <button type=\"button\" aria-label=\"Pan tool\" title=\"Drag anywhere to pan; hold Space for temporary pan\">Pan</button> <span class=\"pc-control-separator\"></span> <button type=\"button\" class=\"pc-btn\" aria-label=\"Zoom out\" title=\"Zoom out\">−</button> <output class=\"pc-zoom-readout\" aria-label=\"Canvas zoom\"> </output> <button type=\"button\" class=\"pc-btn\" aria-label=\"Zoom in\" title=\"Zoom in\">+</button> <button type=\"button\" class=\"pc-btn\" title=\"Fit selection (.)\" aria-label=\"Fit selection\">Fit</button> <!></div> <div class=\"pc-gesture-hint\">Drag to select · Shift adds · Alt removes · Space pans</div>", 1);
function Ha(e, t) {
	A(t, !0);
	var n = Va(), r = L(n), i = I(r), a = R(i, 2), o = R(a, 4), s = R(o, 2), c = I(s);
	O(s);
	var l = R(s, 2), u = R(l, 2), d = R(u, 2), f = (e) => {
		var n = Ba(), r = I(n);
		O(n), z(() => J(r, `${t.count ?? ""} selected`)), q(e, n);
	};
	Y(d, (e) => {
		t.count && e(f);
	}), O(r), Fe(2), z((e) => {
		Z(i, 1, `pc-btn${t.camera.mode === "select" ? " pc-on" : ""}`), Q(i, "aria-pressed", t.camera.mode === "select"), Z(a, 1, `pc-btn${t.camera.mode === "pan" ? " pc-on" : ""}`), Q(a, "aria-pressed", t.camera.mode === "pan"), J(c, `${e ?? ""}%`);
	}, [() => Math.round(t.camera.zoom * 100)]), G("click", i, () => t.actions.mode("select")), G("click", a, () => t.actions.mode("pan")), G("click", o, () => t.actions.zoom(1 / 1.15)), G("click", l, () => t.actions.zoom(1.15)), G("click", u, function(...e) {
		t.actions.fitSelection?.apply(this, e);
	}), q(e, n), j();
}
gr(["click"]);
//#endregion
//#region ui/DomainSurface.svelte
var Ua = /* @__PURE__ */ K("<div></div>");
function Wa(e, t) {
	A(t, !0);
	let n;
	function r() {
		return n;
	}
	var i = { getElement: r }, a = Ua();
	return $(a, (e) => n = e, () => n), z(() => {
		Z(a, 1, Yr(t.className)), Q(a, "aria-label", t.label);
	}), q(e, a), j(i);
}
//#endregion
//#region ui/PaneDivider.svelte
var Ga = /* @__PURE__ */ K("<div class=\"pc-pane-divider\" role=\"separator\" aria-label=\"Resize preview\" aria-orientation=\"horizontal\" tabindex=\"0\"></div>");
function Ka(e, t) {
	A(t, !0);
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
	Ir(u);
	var f = Ga();
	hr("blur", nn, u), $(f, (e) => i = e, () => i), z((e, t) => {
		Q(f, "aria-valuemin", n()), Q(f, "aria-valuemax", e), Q(f, "aria-valuenow", t);
	}, [() => Math.round(r()), () => Math.round(t.height)]), G("pointerdown", f, s), G("pointermove", f, c), G("pointerup", f, (e) => l(!1, e.pointerId)), hr("pointercancel", f, (e) => l(!0, e.pointerId)), hr("lostpointercapture", f, (e) => l(!0, e.pointerId)), G("keydown", f, d), q(e, f), j();
}
//#endregion
//#region node_modules/svelte/src/internal/flags/legacy.js
gr([
	"pointerdown",
	"pointermove",
	"pointerup",
	"keydown"
]), He();
//#endregion
//#region ui/GraphTabs.svelte
var qa = /* @__PURE__ */ K("<nav class=\"pc-graph-tabs\" aria-label=\"Open graph views\"><button type=\"button\" class=\"pc-graph-tab\" aria-current=\"page\" title=\"Main graph\">Graph 1</button></nav>");
function Ja(e) {
	q(e, qa());
}
//#endregion
//#region ui/NodeShelf.svelte
var Ya = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-family-row\" aria-haspopup=\"menu\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path></path></svg><span> </span></button>"), Xa = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\">‹ Families</button>"), Za = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\" aria-haspopup=\"menu\"><span class=\"pc-subfamily-name\"> </span><span aria-hidden=\"true\">›</span></button>"), Qa = /* @__PURE__ */ K("<div role=\"menu\" tabindex=\"-1\"><!> <!></div>"), $a = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\"> </button>"), eo = /* @__PURE__ */ K("<input class=\"text_pole\" aria-label=\"Search nodes\" placeholder=\"Search nodes…\"/>"), to = /* @__PURE__ */ K("<button type=\"button\" role=\"menuitem\"><span class=\"pc-leaf-icon\" aria-hidden=\"true\">◇</span><span> </span><small> </small></button>"), no = /* @__PURE__ */ K("<div class=\"pc-shelf-menu pc-leaf-menu\" role=\"menu\" tabindex=\"-1\"><!> <!> <!></div>"), ro = /* @__PURE__ */ K("<nav aria-label=\"Node families\"></nav> <!> <!>", 1);
function io(e, t) {
	A(t, !0);
	let n, r = /* @__PURE__ */ P(null), i = /* @__PURE__ */ P(null), a = /* @__PURE__ */ P(""), o = /* @__PURE__ */ P(""), s = /* @__PURE__ */ P(!1), c = /* @__PURE__ */ P(""), l = /* @__PURE__ */ P(!1), u = /* @__PURE__ */ P(0), d = /* @__PURE__ */ P(0), f = /* @__PURE__ */ P(0), p = /* @__PURE__ */ P(0), m = null, h = [
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
	function v(e = W(a)) {
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
		F(a, ""), F(o, ""), F(s, !1), e && m?.focus({ preventScroll: !0 });
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
	async function ee(e, t) {
		if (W(a) === e) {
			b();
			return;
		}
		F(a, e, !0), F(o, ""), F(s, !1), m = t, await sr();
		let n = t.getBoundingClientRect(), i = W(r).getBoundingClientRect(), c = S(n, i.width, i.height, 110);
		F(u, c.x, !0), F(d, c.y, !0), F(l, c.compact, !0), W(r).querySelector("button")?.focus({ preventScroll: !0 });
	}
	async function C(e, t) {
		F(o, e, !0), await sr();
		let n = t.getBoundingClientRect(), a = W(r).getBoundingClientRect(), s = W(i).getBoundingClientRect(), c = S({
			top: n.top,
			left: a.left,
			right: a.right
		}, s.width, s.height, 155);
		F(f, c.x, !0), F(p, c.y, !0), F(l, W(l) || c.compact, !0), W(i).querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
	}
	async function w() {
		F(a, ""), F(o, ""), F(s, !0), F(c, ""), await sr();
		let e = x();
		F(f, Math.min(136, Math.max(4, e.width - 266)), !0), F(p, 13), W(i).querySelector("input")?.focus();
	}
	function te(e) {
		b(!0), t.add(e.id, e.legacy);
	}
	function ne(e) {
		if (e.key === "Escape") {
			e.preventDefault(), e.stopPropagation(), b(!0);
			return;
		}
		if (e.key === "ArrowLeft" && W(o)) {
			e.preventDefault(), F(o, ""), sr().then(() => W(r).querySelector("button")?.focus());
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
	var re = { openSearch: w }, ie = ro();
	hr("pointerdown", nn, (e) => {
		e.target.closest(".pc-node-shelf, .pc-shelf-menu") || b();
	}), hr("resize", nn, () => b());
	var ae = L(ie);
	X(ae, 21, () => h, Rr, (e, t, n) => {
		var r = Ya();
		let i;
		var o = I(r), s = I(o);
		O(o);
		var c = R(o), l = I(c, !0);
		O(c), O(r), z((e) => {
			Q(r, "data-family", W(t)), r.disabled = e, Q(r, "title", W(t) === "Transpose" ? "No supported Transpose operations yet." : W(t) === "Subgraphs" ? "Reusable subgraphs are not available yet." : "Browse " + W(t) + " nodes"), Q(r, "aria-expanded", W(a) === W(t)), i = ni(r, "", i, { "--pc-family": _[n] }), Q(s, "d", g[n]), J(l, W(t));
		}, [() => !v(W(t)).length || W(t) === "Transpose" || W(t) === "Subgraphs"]), G("click", r, (e) => ee(W(t), e.currentTarget)), G("keydown", r, ne), q(e, r);
	}), O(ae), $(ae, (e) => n = e, () => n);
	var T = R(ae, 2), oe = (e) => {
		var t = Qa();
		let n;
		var i = I(t), s = (e) => {
			var t = Xa();
			G("click", t, () => b(!0)), q(e, t);
		};
		Y(i, (e) => {
			W(l) && e(s);
		}), X(R(i, 2), 17, () => [...new Set(v().map((e) => e.phase))], Rr, (e, t) => {
			var n = Za(), r = I(n), i = I(r, !0);
			O(r), Fe(), O(n), z((e) => {
				Q(n, "aria-expanded", W(o) === W(t)), J(i, e);
			}, [() => y(W(t)).toUpperCase()]), G("click", n, (e) => C(W(t), e.currentTarget)), q(e, n);
		}), O(t), $(t, (e) => F(r, e), () => W(r)), z((e) => {
			Z(t, 1, `pc-shelf-menu pc-family-menu${W(l) && W(o) ? " pc-shelf-replaced" : ""}`), Q(t, "aria-label", W(a) + " categories"), n = ni(t, "", n, e);
		}, [() => ({
			left: `${W(u)}px`,
			top: `${W(d)}px`,
			"--pc-family": _[h.indexOf(W(a))]
		})]), G("keydown", t, ne), q(e, t);
	};
	Y(T, (e) => {
		W(a) && e(oe);
	});
	var se = R(T, 2), ce = (e) => {
		var t = no();
		let n;
		var u = I(t), d = (e) => {
			var t = $a(), n = I(t);
			O(t), z(() => J(n, `‹ ${W(a) ?? ""}`)), G("click", t, () => {
				F(o, ""), sr().then(() => W(r).querySelector("button")?.focus());
			}), q(e, t);
		};
		Y(u, (e) => {
			W(l) && W(o) && e(d);
		});
		var m = R(u, 2), g = (e) => {
			var t = eo();
			ui(t), gi(t, () => W(c), (e) => F(c, e)), q(e, t);
		};
		Y(m, (e) => {
			W(s) && e(g);
		}), X(R(m, 2), 17, () => W(s) ? h.flatMap((e) => v(e)).filter((e) => (e.title + " " + e.id + " " + e.family).toLowerCase().includes(W(c).toLowerCase())) : v().filter((e) => e.phase === W(o)), (e) => e.family + e.id, (e, t) => {
			var n = to(), r = R(I(n)), i = I(r, !0);
			O(r);
			var a = R(r), o = I(a, !0);
			O(a), O(n), z((e) => {
				n.disabled = !W(t).compatible, Q(n, "title", W(t).compatible ? "Add " + W(t).title : "Requires the " + W(t).phase + " phase"), J(i, W(t).title), J(o, e);
			}, [() => W(t).legacy ? "L" : W(t).phase.toUpperCase()]), G("click", n, () => te(W(t))), q(e, n);
		}), O(t), $(t, (e) => F(i, e), () => W(i)), z(() => {
			Q(t, "aria-label", W(s) ? "Search nodes" : W(a) + " nodes"), n = ni(t, "", n, {
				left: `${W(f)}px`,
				top: `${W(p)}px`
			});
		}), G("keydown", t, ne), q(e, t);
	};
	return Y(se, (e) => {
		(W(o) || W(s)) && e(ce);
	}), z(() => Z(ae, 1, `pc-node-shelf${W(l) && W(a) ? " pc-shelf-replaced" : ""}`)), q(e, ie), j(re);
}
gr(["click", "keydown"]);
//#endregion
//#region ui/WorkflowSetup.svelte
var ao = /* @__PURE__ */ K("<option> </option>"), oo = /* @__PURE__ */ K("<label> <select class=\"text_pole\"><option>Choose a connection</option><!></select></label> <label> <input class=\"text_pole\" placeholder=\"Use profile model\"/></label>", 1), so = /* @__PURE__ */ K("<p class=\"pc-error\"> </p>"), co = /* @__PURE__ */ K("<h3> </h3> <p> </p> <p> </p> <!> <button type=\"button\" class=\"pc-btn menu_button\"> </button> <p> </p> <!>", 1), lo = /* @__PURE__ */ K("<article class=\"pc-workflow-starter\"><strong> </strong><p> </p><small> </small><button type=\"button\" class=\"pc-btn menu_button\"> </button></article>"), uo = /* @__PURE__ */ K("<label>Workflow mode<select class=\"text_pole\" aria-label=\"Workflow mode\"><option>Legacy · Replace prompt</option><option>Native · Guidance and reviewed reply</option></select></label> <!> <h3>Workflow examples</h3> <!>", 1);
function fo(e, t) {
	A(t, !0);
	var n = Er(), r = L(n), i = (e) => {
		var n = uo(), r = L(n), i = R(I(r)), a = I(i);
		a.value = a.__value = "legacy";
		var o = R(a);
		o.value = o.__value = "native", O(i);
		var s;
		ii(i), O(r);
		var c = R(r, 2), l = (e) => {
			var n = co(), r = L(n), i = I(r, !0);
			O(r);
			var a = R(r, 2), o = I(a, !0);
			O(a);
			var s = R(a, 2), c = I(s);
			O(s);
			var l = R(s, 2);
			X(l, 17, () => t.view.roles, (e) => e.name, (e, n) => {
				var r = oo(), i = L(r), a = I(i), o = R(a), s = I(o);
				s.value = s.__value = "", X(R(s), 17, () => t.view.profiles, (e) => e.id, (e, t) => {
					var n = ao(), r = I(n, !0);
					O(n);
					var i = {};
					z(() => {
						J(r, W(t).name), i !== (i = W(t).id) && (n.value = (n.__value = W(t).id) ?? "");
					}), q(e, n);
				}), O(o);
				var c;
				ii(o), O(i);
				var l = R(i, 2), u = I(l), d = R(u);
				ui(d), O(l), z(() => {
					J(a, `${W(n).name ?? ""} connection`), Q(o, "aria-label", W(n).name + " connection"), c !== (c = W(n).profileId) && (o.value = (o.__value = W(n).profileId) ?? "", ri(o, W(n).profileId)), J(u, `${W(n).name ?? ""} model override`), di(d, W(n).model);
				}), G("change", o, (e) => t.actions.workflowSetup?.bindRole(W(n).name, e.currentTarget.value, W(n).model)), G("input", d, (e) => t.actions.workflowSetup?.bindRole(W(n).name, W(n).profileId, e.currentTarget.value)), q(e, r);
			});
			var u = R(l, 2), d = I(u);
			O(u);
			var f = R(u, 2), p = I(f);
			O(f), X(R(f, 2), 17, () => t.view.issues, Rr, (e, t) => {
				var n = so(), r = I(n, !0);
				O(n), z(() => J(r, W(t))), q(e, n);
			}), z(() => {
				J(i, t.view.name), J(o, t.view.phase === "pre" ? "Guidance helps SillyTavern plan its normal reply." : "Review a revision of the latest completed assistant reply."), J(c, `Maximum auxiliary requests: ${t.view.callBound ?? ""}`), J(d, `Assign ${t.view.phase ?? ""} phase and enable native mode`), J(p, `${t.view.assigned ? "Assigned to this phase." : "Phase is not assigned."} Arming is a separate action.`);
			}), G("click", u, () => t.actions.workflowSetup?.assign(t.view?.phase || "")), q(e, n);
		};
		Y(c, (e) => {
			t.view.native && e(l);
		}), X(R(c, 4), 17, () => t.view.starters, (e) => e.id, (e, n) => {
			var r = lo(), i = I(r), a = I(i, !0);
			O(i);
			var o = R(i), s = I(o, !0);
			O(o);
			var c = R(o), l = I(c);
			O(c);
			var u = R(c), d = I(u);
			O(u), O(r), z(() => {
				J(a, W(n).title), J(s, W(n).purpose), J(l, `${W(n).phase === "pre" ? "Before reply" : "After reply"} · Maximum ${W(n).callBound ?? ""} auxiliary requests`), J(d, `Install ${W(n).title ?? ""}`);
			}), G("click", u, () => t.actions.workflowSetup?.install(W(n).id)), q(e, r);
		}), z(() => {
			s !== (s = t.view.workflowMode) && (i.value = (i.__value = t.view.workflowMode) ?? "", ri(i, t.view.workflowMode));
		}), G("change", i, (e) => t.actions.workflowSetup?.setMode(e.currentTarget.value)), q(e, n);
	};
	Y(r, (e) => {
		t.view && e(i);
	}), q(e, n), j();
}
gr([
	"change",
	"input",
	"click"
]);
//#endregion
//#region ui/Workbench.svelte
var po = /* @__PURE__ */ K("<p>Browse node families on the floating shelf. Middle mouse pans the graph; the wheel zooms around the pointer. Use the divider or its arrow keys to resize Preview.</p><p>Library holds personal blocks and saved material. Setup contains workflow examples, phase assignment and role defaults. Arm enables the selected host workflow; Run tests it explicitly.</p>", 1), mo = /* @__PURE__ */ K("<div class=\"pc-workspace-overlay\"><div class=\"pc-workspace-dialog\" role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\"><header><h2> </h2><button type=\"button\" class=\"pc-btn menu_button\" aria-label=\"Close panel\">×</button></header> <!></div></div>"), ho = /* @__PURE__ */ K("<div class=\"pc-root\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Lattice\" data-pc-workbench=\"svelte\"><!> <!> <div class=\"pc-body\"><!> <div class=\"pc-stage\"><section aria-label=\"Output preview\"><header class=\"pc-preview-pane-head\"><strong>Preview</strong><button type=\"button\" class=\"pc-btn menu_button\"> </button></header> <div class=\"pc-preview-content\"><!> <p class=\"pc-preview-placeholder\"> </p></div></section> <!> <!> <div class=\"pc-canvas-area\"><div class=\"pc-canvas-host\" aria-label=\"Node canvas\"></div> <!> <!></div></div> <!></div> <!></div>");
function go(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P({
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
		F(n, {
			...W(n),
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
	let h = m(), g = /* @__PURE__ */ P($t(h.height)), _ = /* @__PURE__ */ P($t(h.collapsed)), v = /* @__PURE__ */ P(500), y = /* @__PURE__ */ P(""), b = /* @__PURE__ */ P(null), x = null, S;
	function ee() {
		try {
			localStorage.setItem(p, JSON.stringify({
				height: W(g),
				collapsed: W(_)
			}));
		} catch {}
	}
	function C() {
		t.actions.resizeStart?.();
	}
	function w(e) {
		C(), F(_, e, !0), ee();
	}
	function te() {
		w(!1);
	}
	async function ne(e) {
		e === "open-workflow" ? o.focusGraphSelect() : e === "show-preview" ? w(!1) : e === "collapse-preview" ? w(!0) : e === "add-node" ? S.openSearch() : (x = document.activeElement, F(y, e, !0), await sr(), W(b).querySelector("button")?.focus());
	}
	function re() {
		F(y, ""), x?.focus({ preventScroll: !0 });
	}
	function ie(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), re()), e.key === "Tab") {
			let t = [...W(b).querySelectorAll("button:not(:disabled), input, select, textarea, [tabindex=\"0\"]")], n = t[0], r = t.at(-1);
			e.shiftKey && document.activeElement === n && (e.preventDefault(), r?.focus()), !e.shiftKey && document.activeElement === r && (e.preventDefault(), n?.focus());
		}
	}
	Fr(() => {
		let e = () => {
			F(v, Math.max(90, a.clientHeight - 190), !0);
		}, t = globalThis.ResizeObserver;
		if (!t) return e(), window.addEventListener("resize", e), () => window.removeEventListener("resize", e);
		let n = new t(e);
		return n.observe(a), () => n.disconnect();
	});
	var ae = {
		getParts: d,
		update: f,
		revealPreview: te
	}, T = ho(), oe = I(T);
	$(Ia(oe, {
		get state() {
			return W(n);
		},
		get actions() {
			return t.actions;
		},
		local: ne
	}), (e) => o = e, () => o);
	var se = R(oe, 2);
	$(za(se, {
		get status() {
			return W(n).status;
		},
		get actions() {
			return t.actions;
		}
	}), (e) => s = e, () => s);
	var ce = R(se, 2), le = I(ce);
	$(Wa(le, {
		className: "pc-sidebar",
		label: "Block library"
	}), (e) => c = e, () => c);
	var ue = R(le, 2), de = I(ue);
	let fe, pe;
	var me = I(de), he = R(I(me)), ge = I(he, !0);
	O(he), O(me);
	var _e = R(me, 2), ve = I(_e);
	$(Wa(ve, {
		className: "pc-preview",
		label: "Prompt preview"
	}), (e) => u = e, () => u);
	var ye = R(ve, 2), be = I(ye, !0);
	O(ye), O(_e), O(de);
	var xe = R(de, 2), Se = (e) => {
		{
			let t = /* @__PURE__ */ yt(() => Math.min(W(g), W(v)));
			Ka(e, {
				get height() {
					return W(t);
				},
				get max() {
					return W(v);
				},
				start: C,
				change: (e) => {
					F(g, e, !0), ee();
				}
			});
		}
	};
	Y(xe, (e) => {
		W(_) || e(Se);
	});
	var Ce = R(xe, 2);
	Ja(Ce, {});
	var we = R(Ce, 2), Te = I(we);
	$(Te, (e) => i = e, () => i);
	var Ee = R(Te, 2);
	$(io(Ee, {
		get view() {
			return W(n).workflow;
		},
		add: (e, n) => t.actions.addNode?.(e, n)
	}), (e) => S = e, () => S), Ha(R(Ee, 2), {
		get camera() {
			return W(n).camera;
		},
		get count() {
			return W(n).selectionCount;
		},
		get actions() {
			return t.actions;
		}
	}), O(we), O(ue), $(ue, (e) => a = e, () => a), $(Wa(R(ue, 2), {
		className: "pc-inspector",
		label: "Selection inspector"
	}), (e) => l = e, () => l), O(ce);
	var De = R(ce, 2), Oe = (e) => {
		var r = mo(), i = I(r), a = I(i), o = I(a), s = I(o, !0);
		O(o);
		var c = R(o);
		O(a);
		var l = R(a, 2), u = (e) => {
			fo(e, {
				get view() {
					return W(n).workflow;
				},
				get actions() {
					return t.actions;
				}
			});
		}, d = (e) => {
			var t = po();
			Fe(), q(e, t);
		};
		Y(l, (e) => {
			W(y) === "workflow-setup" ? e(u) : e(d, -1);
		}), O(i), $(i, (e) => F(b, e), () => W(b)), O(r), z(() => {
			Q(i, "aria-label", W(y) === "workflow-setup" ? "Workflow setup" : "Workspace guide"), J(s, W(y) === "workflow-setup" ? "Workflow setup" : "Workspace guide");
		}), G("keydown", i, ie), hr("paste", i, (e) => e.stopPropagation()), G("click", c, re), q(e, r);
	};
	return Y(De, (e) => {
		W(y) && e(Oe);
	}), O(T), $(T, (e) => r = e, () => r), z((e) => {
		fe = Z(de, 1, "pc-preview-pane", null, fe, { "pc-preview-collapsed": W(_) }), pe = ni(de, "", pe, e), Q(he, "aria-expanded", !W(_)), J(ge, W(_) ? "Expand preview" : "Collapse preview"), Q(_e, "hidden", W(_)), J(be, W(n).workflow?.native ? "Run the workflow to review its result in Details." : "Choose Preview › Compile prompt to inspect the current prompt.");
	}, [() => ({ "--pc-preview-height": `${Math.min(W(g), W(v))}px` })]), G("click", he, () => w(!W(_))), q(e, T), j(ae);
}
gr(["click", "keydown"]);
//#endregion
//#region ui/entry.js
var _o = 0;
function vo(e, t) {
	let n = kr(Oa, {
		target: e,
		props: {
			actions: t,
			markerId: `pc-loop-arrow-${++_o}`
		}
	});
	return Lt(), {
		...n.getLayers(),
		setNodes: (e) => Lt(() => n.setNodes(e)),
		setGroups: (e) => Lt(() => n.setGroups(e)),
		setWires: (e, t, r) => Lt(() => n.setWires(e, t, r)),
		setPositions: (e, t) => Lt(() => n.setPositions(e, t)),
		destroy: () => Nr(n)
	};
}
function yo(e, t) {
	let n = kr(go, {
		target: e,
		props: { actions: t }
	});
	return Lt(), {
		...n.getParts(),
		update: (e) => Lt(() => n.update(e)),
		revealPreview: () => Lt(() => n.revealPreview()),
		destroy: () => Nr(n)
	};
}
function bo(e, t, n = "setup") {
	let r = kr(Yi, {
		target: e,
		props: {
			actions: t,
			mode: n
		}
	});
	return Lt(), {
		update: (e) => Lt(() => r.update(e)),
		destroy: () => Nr(r)
	};
}
//#endregion
export { vo as mountCanvas, yo as mountWorkbench, bo as mountWorkflowSurface };
