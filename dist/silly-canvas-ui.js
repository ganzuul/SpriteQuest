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
function _(e, t) {
	if (Array.isArray(e)) return e;
	if (t === void 0 || !(Symbol.iterator in e)) return Array.from(e);
	let n = [];
	for (let r of e) if (n.push(r), n.length === t) break;
	return n;
}
var v = 1024, y = 2048, b = 4096, x = 8192, S = 16384, ee = 32768, te = 1 << 25, ne = 65536, re = 1 << 19, ie = 1 << 20, ae = 1 << 25, oe = 65536, se = 1 << 21, ce = 1 << 22, le = 1 << 23, ue = Symbol("$state"), de = Symbol("legacy props"), fe = Symbol(""), pe = Symbol("attributes"), me = Symbol("class"), he = Symbol("style"), ge = Symbol("text"), _e = Symbol("form reset"), ve = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), ye = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml");
//#endregion
//#region node_modules/svelte/src/internal/client/errors.js
function be() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function xe(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
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
var C = !1;
function Me(e) {
	C = e;
}
var w;
function Ne(t) {
	if (t === null) throw ke(), e;
	return w = t;
}
function Pe() {
	return Ne(/* @__PURE__ */ cn(w));
}
function T(t) {
	if (C) {
		if (/* @__PURE__ */ cn(w) !== null) throw ke(), e;
		w = t;
	}
}
function Fe(e = 1) {
	if (C) {
		for (var t = e, n = w; t--;) n = /* @__PURE__ */ cn(n);
		w = n;
	}
}
function Ie(e = !0) {
	for (var t = 0, n = w;;) {
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
		r: B,
		l: null
	};
}
function We(e) {
	var t = Ve, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) _n(r);
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
	Ke = [], h(e);
}
function Je(e) {
	if (Ke.length === 0 && !At) {
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
	var t = B;
	if (t === null) return R.f |= le, e;
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
var Qe = ~(y | b | v);
function E(e, t) {
	e.f = e.f & Qe | t;
}
function $e(e) {
	e.f & 512 || e.deps === null ? E(e, v) : E(e, b);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
function et(e) {
	if (e !== null) for (let t of e) t.f & 2 && t.f & 65536 && (t.f ^= oe, et(t.deps));
}
function tt(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), et(e.deps), E(e, v);
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
	C && /* @__PURE__ */ j(e) !== null && ln(e);
}
var at = !1;
function ot() {
	at || (at = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[_e]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function st(e) {
	var t = R, n = B;
	z(null), Rn(null);
	try {
		return e();
	} finally {
		z(t), Rn(n);
	}
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function ct(e) {
	let t = 0, n = qt(0), r;
	return () => {
		hn() && (U(n), xn(() => (t === 0 && (r = nr(() => e(() => Zt(n)))), t += 1, () => {
			Je(() => {
				--t, t === 0 && (r?.(), r = void 0, Zt(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var lt = ne | re;
function ut(e, t, n, r) {
	new dt(e, t, n, r);
}
var dt = class {
	parent;
	is_pending = !1;
	transform_error;
	#e;
	#t = C ? w : null;
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
			var t = B;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = B.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = Sn(() => {
			if (C) {
				let e = this.#t;
				Pe();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, lt), C && (this.#e = w);
	}
	#g() {
		try {
			this.#a = I(() => this.#r(this.#e));
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		let t = this.#n.failed, { reset: n, invoke_onerror: r } = this.#v(e);
		Je(r), t && (this.#s = I(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			t ? je() : (t = !0, n && De(), this.#s !== null && On(this.#s, () => {
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
		e && (this.is_pending = !0, this.#o = I(() => e(this.#e)), Je(() => {
			var e = this.#c = document.createDocumentFragment(), t = A();
			e.append(t), this.#a = this.#S(() => I(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, On(this.#o, () => {
				this.#o = null;
			}), this.#x(D));
		}));
	}
	#b() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#l = 0, this.#a = I(() => {
				this.#r(this.#e);
			}), this.#u > 0) {
				var e = this.#c = document.createDocumentFragment();
				Mn(this.#a, e);
				let t = this.#n.pending;
				this.#o = I(() => t(this.#e));
			} else this.#x(D);
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
		var t = B, n = R, r = Ve;
		Rn(this.#i), z(this.#i), He(this.#i.ctx);
		try {
			return It.ensure(), e();
		} catch (e) {
			return Xe(e), null;
		} finally {
			Rn(t), z(n), He(r);
		}
	}
	#C(e, t) {
		this.has_pending_snippet() ? (this.#u += e, this.#u === 0 && (this.#x(t), this.#o && On(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null))) : this.parent && this.parent.#C(e, t);
	}
	update_pending_count(e, t) {
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, Je(() => {
			this.#d = !1, this.#m && Yt(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), U(this.#m);
	}
	error(e) {
		if (!this.#n.onerror && !this.#n.failed) throw e;
		D?.is_fork ? (this.#a && D.skip_effect(this.#a), this.#o && D.skip_effect(this.#o), this.#s && D.skip_effect(this.#s), D.oncommit(() => {
			this.#w(e);
		})) : this.#w(e);
	}
	#w(e) {
		this.#a &&= (L(this.#a), null), this.#o &&= (L(this.#o), null), this.#s &&= (L(this.#s), null), C && (Ne(this.#t), Fe(), Ne(Ie()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return I(() => {
						var r = B;
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
function ft(e, t, n, r) {
	let i = Ge() ? gt : bt;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = B, c = pt(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				Ze(e, s);
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
		Promise.all(n.map((e) => /* @__PURE__ */ vt(e))).then(u).catch((e) => Ze(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), mt();
	}) : f();
}
function pt() {
	var e = B, t = R, n = Ve, r = D;
	return function(i = !0) {
		Rn(e), z(t), He(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function mt(e = !0) {
	Rn(null), z(null), He(null), e && D?.deactivate();
}
function ht() {
	var e = B, t = e.b, n = D, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function gt(e) {
	var n = 2 | y;
	return B !== null && (B.f |= re), {
		ctx: Ve,
		deps: null,
		effects: null,
		equals: Re,
		f: n,
		fn: e,
		reactions: null,
		rv: 0,
		v: t,
		wv: 0,
		parent: B,
		ac: null
	};
}
var _t = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function vt(e, n, r) {
	let i = B;
	i === null && be();
	var a = void 0, o = qt(t), s = !R, c = /* @__PURE__ */ new Set();
	return bn(() => {
		var t = B, n = g();
		a = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== ve && n.reject(e);
			}).finally(mt);
		} catch (e) {
			n.reject(e), mt();
		}
		var r = D;
		if (s) {
			if (t.f & 32768) var l = ht();
			if (i.b?.is_rendered()) r.async_deriveds.get(t)?.reject(_t);
			else for (let e of c.values()) e.reject(_t);
			c.add(n), r.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), c.delete(n), t !== _t && (r.activate(), t ? (o.f |= le, Yt(o, t)) : (o.f & 8388608 && (o.f ^= le), Yt(o, e)), r.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), gn(() => {
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
	return Bn(t), t;
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
		for (var n = 0; n < t.length; n += 1) L(t[n]);
	}
}
function St(e) {
	var n, r = B, i = e.parent;
	if (!Fn && i !== null && e.v !== t && i.f & 24576) return Oe(), e.v;
	Rn(i);
	try {
		e.f &= ~oe, xt(e), n = Xn(e);
	} finally {
		Rn(r);
	}
	return n;
}
function Ct(e) {
	var t = St(e);
	!e.equals(t) && (e.wv = qn(), (!D?.is_fork || e.deps === null) && (D === null ? e.v = t : (D.capture(e, t, !0), Dt?.capture(e, t, !0)), e.deps === null)) ? E(e, v) : Fn || (Ot === null ? $e(e) : (hn() || D?.is_fork) && Ot.set(e, t));
}
function wt(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && st(() => {
		t.ac.abort(ve), t.ac = null;
	}), t.fn !== null && (t.teardown = m), Qn(t, 0), wn(t));
}
function Tt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && $n(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
var Et = null, D = null, Dt = null, Ot = null, kt = null, At = !1, jt = !1, Mt = null, Nt = null, Pt = 0, Ft = 1, It = class e {
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
			for (var r of n.d) E(r, y), t(r);
			for (r of n.m) E(r, b), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, Pt++ > 1e3 && (this.#x(), Rt());
		for (let e of this.#u) this.#d.delete(e), E(e, y), this.schedule(e);
		for (let e of this.#d) E(e, b), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = Mt = [], r = [], i = Nt = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw Ut(e), this.#h() || this.discard(), t;
		}
		if (D = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (Mt = null, Nt = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) Ht(e, t);
			i.length > 0 && D.#g();
			return;
		}
		let o = this.#v();
		if (o) this.#b(r), this.#b(n), o.#y(this);
		else {
			this.#u.clear(), this.#d.clear();
			for (let e of this.#r) e(this);
			this.#r.clear(), Dt = this, Bt(r), Bt(n), Dt = null, this.#s?.resolve();
			var s = D;
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
		e.f ^= v;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= v : i & 4 ? t.push(r) : Jn(r) && (i & 16 && this.#d.add(r), $n(r));
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), E(i, y), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), D = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) tt(e[t], this.#u, this.#d);
	}
	capture(e, n, r = !1) {
		e.v !== t && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [n, r]), Ot?.set(e, n)), this.is_fork || (e.v = n);
	}
	activate() {
		D = this;
	}
	deactivate() {
		D = null, Ot = null;
	}
	flush() {
		try {
			jt = !0, D = this, this.#g();
		} finally {
			Pt = 0, kt = null, Mt = null, Nt = null, jt = !1, D = null, Ot = null, Gt.clear();
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
		return (this.#s ??= g()).promise;
	}
	static ensure() {
		if (D === null) {
			let t = D = new e();
			!jt && !At && Je(() => {
				t.#e || t.flush();
			});
		}
		return D;
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
				if (Mt !== null && t === B && (R === null || !(R.f & 2))) return;
				if (n & 96) {
					if (!(n & 1024)) return;
					t.f ^= v;
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
		for (e && (D !== null && !D.is_fork && D.flush(), n = e());;) {
			if (Ye(), D === null) return n;
			D.flush();
		}
	} finally {
		At = t;
	}
}
function Rt() {
	try {
		Se();
	} catch (e) {
		Ze(e, kt);
	}
}
var zt = null;
function Bt(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && Jn(r) && (zt = /* @__PURE__ */ new Set(), $n(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Dn(r), zt?.size > 0)) {
				Gt.clear();
				for (let e of zt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) zt.has(n) && (zt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || $n(n);
					}
				}
				zt.clear();
			}
		}
		zt = null;
	}
}
function Vt(e) {
	D.schedule(e);
}
function Ht(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), E(e, v);
		for (var n = e.first; n !== null;) Ht(n, t), n = n.next;
	}
}
function Ut(e) {
	E(e, v);
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
function O(e, t) {
	let n = qt(e, t);
	return Bn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function Jt(e, t = !1, n = !0) {
	let r = qt(e);
	return t || (r.equals = Be), r;
}
function k(e, t, n = !1) {
	return R !== null && (!Ln || R.f & 131072) && Ge() && R.f & 4325394 && (zn === null || !zn.has(e)) && Ee(), Yt(e, n ? $t(t) : t, Nt);
}
function Yt(e, t, n = null) {
	if (!e.equals(t)) {
		Fn ? Gt.set(e, t) : Gt.has(e) || Gt.set(e, e.v);
		var r = It.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && St(t), Ot === null && $e(t);
		}
		e.wv = qn(), Qt(e, y, n), Ge() && B !== null && B.f & 1024 && !(B.f & 96) && (Vn === null ? Hn([e]) : Vn.push(e)), !r.is_fork && Wt.size > 0 && !Kt && Xt();
	}
	return t;
}
function Xt() {
	Kt = !1;
	for (let e of Wt) {
		e.f & 1024 && E(e, b);
		let t;
		try {
			t = Jn(e);
		} catch {
			t = !0;
		}
		t && $n(e);
	}
	Wt.clear();
}
function Zt(e) {
	k(e, e.v + 1);
}
function Qt(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = Ge(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (i || s !== B) {
			var l = (c & y) === 0;
			if (l && E(s, t), c & 131072) Wt.add(s);
			else if (c & 2) {
				var u = s;
				Ot?.delete(u), c & 65536 || (c & 512 && (B === null || !(B.f & 2097152)) && (s.f |= oe), Qt(u, b, n));
			} else if (l) {
				var d = s;
				c & 16 && zt !== null && zt.add(d), n === null ? Vt(d) : n.push(d);
			}
		}
	}
}
function $t(e) {
	if (typeof e != "object" || !e || ue in e) return e;
	let n = f(e);
	if (n !== u && n !== d) return e;
	var i = /* @__PURE__ */ new Map(), a = r(e), o = /* @__PURE__ */ O(0), s = null, l = Gn, p = (e) => {
		if (Gn === l) return e();
		var t = R, n = Gn;
		z(null), Kn(l);
		var r = e();
		return z(t), Kn(n), r;
	};
	return a && i.set("length", /* @__PURE__ */ O(e.length, s)), new Proxy(e, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && we();
			var r = i.get(t);
			return r === void 0 ? p(() => {
				var e = /* @__PURE__ */ O(n.value, s);
				return i.set(t, e), e;
			}) : k(r, n.value, !0), !0;
		},
		deleteProperty(e, n) {
			var r = i.get(n);
			if (r === void 0) {
				if (n in e) {
					let e = p(() => /* @__PURE__ */ O(t, s));
					i.set(n, e), Zt(o);
				}
			} else k(r, t), Zt(o);
			return !0;
		},
		get(n, r, a) {
			if (r === ue) return e;
			var o = i.get(r), l = r in n;
			if (o === void 0 && (!l || c(n, r)?.writable) && (o = p(() => /* @__PURE__ */ O($t(l ? n[r] : t), s)), i.set(r, o)), o !== void 0) {
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
			if (n === ue) return !0;
			var r = i.get(n), a = r !== void 0 && r.v !== t || Reflect.has(e, n);
			return (r !== void 0 || B !== null && (!a || c(e, n)?.writable)) && (r === void 0 && (r = p(() => /* @__PURE__ */ O(a ? $t(e[n]) : t, s)), i.set(n, r)), U(r) === t) ? !1 : a;
		},
		set(e, n, r, l) {
			var u = i.get(n), d = n in e;
			if (a && n === "length") for (var f = r; f < u.v; f += 1) {
				var m = i.get(f + "");
				m === void 0 ? f in e && (m = p(() => /* @__PURE__ */ O(t, s)), i.set(f + "", m)) : k(m, t);
			}
			if (u === void 0) (!d || c(e, n)?.writable) && (u = p(() => /* @__PURE__ */ O(void 0, s)), k(u, $t(r)), i.set(n, u));
			else {
				d = u.v !== t;
				var h = p(() => $t(r));
				k(u, h);
			}
			var g = Reflect.getOwnPropertyDescriptor(e, n);
			if (g?.set && g.set.call(l, r), !d) {
				if (a && typeof n == "string") {
					var _ = i.get("length"), v = Number(n);
					Number.isInteger(v) && v >= _.v && k(_, v + 1);
				}
				Zt(o);
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
			Te();
		}
	});
}
function en(e) {
	try {
		if (typeof e == "object" && e && ue in e) return e[ue];
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
		an = c(t, "firstChild").get, on = c(t, "nextSibling").get, p(e) && (e[me] = void 0, e[pe] = null, e[he] = void 0, e.__e = void 0), p(n) && (n[ge] = void 0);
	}
}
function A(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function j(e) {
	return an.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function cn(e) {
	return on.call(e);
}
function M(e, t) {
	if (!C) return /* @__PURE__ */ j(e);
	var n = /* @__PURE__ */ j(w);
	if (n === null) n = w.appendChild(A());
	else if (t && n.nodeType !== 3) {
		var r = A();
		return n?.before(r), Ne(r), r;
	}
	return t && fn(n), Ne(n), n;
}
function N(e, t = !1) {
	if (!C) {
		var n = /* @__PURE__ */ j(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ cn(n) : n;
	}
	if (t) {
		if (w?.nodeType !== 3) {
			var r = A();
			return w?.before(r), Ne(r), r;
		}
		fn(w);
	}
	return w;
}
function P(e, t = 1, n = !1) {
	let r = C ? w : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ cn(r);
	if (!C) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = A();
			return r === null ? i?.after(a) : r.before(a), Ne(a), a;
		}
		fn(r);
	}
	return Ne(r), r;
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
function pn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function mn(e, t) {
	var n = B;
	n !== null && n.f & 8192 && (e |= x);
	var r = {
		ctx: Ve,
		deps: null,
		nodes: null,
		f: e | y | 512,
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
	D?.register_created_effect(r);
	var i = r;
	if (e & 4) Mt === null ? It.ensure().schedule(r) : Mt.push(r);
	else if (t !== null) {
		try {
			$n(r);
		} catch (e) {
			throw L(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= ne));
	}
	if (i !== null && (i.parent = n, n !== null && pn(i, n), R !== null && R.f & 2 && !(e & 64))) {
		var a = R;
		(a.effects ??= []).push(i);
	}
	return r;
}
function hn() {
	return R !== null && !Ln;
}
function gn(e) {
	let t = mn(8, null);
	return E(t, v), t.teardown = e, t;
}
function _n(e) {
	return mn(4 | ie, e);
}
function vn(e) {
	It.ensure();
	let t = mn(64 | re, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? On(t, () => {
			L(t), n(void 0);
		}) : (L(t), n(void 0));
	});
}
function yn(e) {
	return mn(4, e);
}
function bn(e) {
	return mn(ce | re, e);
}
function xn(e, t = 0) {
	return mn(8 | t, e);
}
function F(e, t = [], n = [], r = []) {
	ft(r, t, n, (t) => {
		mn(8, () => {
			e(...t.map(U));
		});
	});
}
function Sn(e, t = 0) {
	return mn(16 | t, e);
}
function I(e) {
	return mn(32 | re, e);
}
function Cn(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = Fn, n = R;
		In(!0), z(null);
		try {
			t.call(null);
		} finally {
			In(e), z(n);
		}
	}
}
function wn(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && st(() => {
			e.abort(ve);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : L(n, t), n = r;
	}
}
function Tn(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || L(t), t = n;
	}
}
function L(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (En(e.nodes.start, e.nodes.end), n = !0), e.f |= te, wn(e, t && !n), Qn(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	Cn(e), e.f ^= te, e.f |= S;
	var i = e.parent;
	i !== null && i.first !== null && Dn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function En(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ cn(e);
		e.remove(), e = n;
	}
}
function Dn(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function On(e, t, n = !0) {
	var r = [];
	kn(e, r, !0);
	var i = () => {
		n && L(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function kn(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= x;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				kn(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function An(e) {
	jn(e, !0);
}
function jn(e, t) {
	if (e.f & 8192) {
		e.f ^= x, e.f & 1024 || (E(e, y), It.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = !!(n.f & 65536) || !!(n.f & 32);
			jn(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function Mn(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ cn(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/legacy.js
var Nn = null, Pn = !1, Fn = !1;
function In(e) {
	Fn = e;
}
var R = null, Ln = !1;
function z(e) {
	R = e;
}
var B = null;
function Rn(e) {
	B = e;
}
var zn = null;
function Bn(e) {
	R !== null && (zn ??= /* @__PURE__ */ new Set()).add(e);
}
var V = null, H = 0, Vn = null;
function Hn(e) {
	Vn = e;
}
var Un = 1, Wn = 0, Gn = Wn;
function Kn(e) {
	Gn = e;
}
function qn() {
	return ++Un;
}
function Jn(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~oe), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (Jn(a) && Ct(a), a.wv > e.wv) return !0;
		}
		t & 512 && Ot === null && E(e, v);
	}
	return !1;
}
function Yn(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(zn !== null && zn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? Yn(a, t, !1) : t === a && (n ? E(a, y) : a.f & 1024 && E(a, b), Vt(a));
	}
}
function Xn(e) {
	var t = V, n = H, r = Vn, i = R, a = zn, o = Ve, s = Ln, c = Gn, l = e.f;
	V = null, H = 0, Vn = null, R = l & 96 ? null : e, zn = null, He(e.ctx), Ln = !1, Gn = ++Wn, e.ac !== null && (st(() => {
		e.ac.abort(ve);
	}), e.ac = null);
	try {
		e.f |= se;
		var u = e.fn, d = u();
		e.f |= ee;
		var f = e.deps, p = D?.is_fork;
		if (V !== null) {
			var m;
			if (p || Qn(e, H), f !== null && H > 0) for (f.length = H + V.length, m = 0; m < V.length; m++) f[H + m] = V[m];
			else e.deps = f = V;
			if (hn() && e.f & 512) for (m = H; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && H < f.length && (Qn(e, H), f.length = H);
		if (Ge() && Vn !== null && !Ln && f !== null && !(e.f & 6146)) for (m = 0; m < Vn.length; m++) Yn(Vn[m], e);
		if (i !== null && i !== e) {
			if (Wn++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = Wn;
			if (t !== null) for (let e of t) e.rv = Wn;
			Vn !== null && (r === null ? r = Vn : r.push(...Vn));
		}
		return e.f & 8388608 && (e.f ^= le), d;
	} catch (e) {
		return Xe(e);
	} finally {
		e.f ^= se, V = t, H = n, Vn = r, R = i, zn = a, He(o), Ln = s, Gn = c;
	}
}
function Zn(e, n) {
	let r = n.reactions;
	if (r !== null) {
		var o = i.call(r, e);
		if (o !== -1) {
			var s = r.length - 1;
			s === 0 ? r = n.reactions = null : (r[o] = r[s], r.pop());
		}
	}
	if (r === null && n.f & 2 && (V === null || !a.call(V, n))) {
		var c = n;
		c.f & 512 && (c.f ^= 512, c.f &= ~oe), c.v !== t && $e(c), c.ac !== null && st(() => {
			c.ac.abort(ve), c.ac = null, E(c, y);
		}), wt(c), Qn(c, 0);
	}
}
function Qn(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) Zn(e, n[r]);
}
function $n(e) {
	var t = e.f;
	if (!(t & 16384)) {
		E(e, v);
		var n = B, r = Pn;
		B = e, Pn = !(t & 96);
		try {
			t & 16777232 ? Tn(e) : wn(e), Cn(e);
			var i = Xn(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = Un;
		} finally {
			Pn = r, B = n;
		}
	}
}
function U(e) {
	var t = !!(e.f & 2);
	if (Nn?.add(e), R !== null && !Ln && !(B !== null && B.f & 16384) && (zn === null || !zn.has(e))) {
		var n = R.deps;
		if (R.f & 2097152) e.rv < Wn && (e.rv = Wn, V === null && n !== null && n[H] === e ? H++ : V === null ? V = [e] : V.push(e));
		else {
			R.deps ??= [], a.call(R.deps, e) || R.deps.push(e);
			var r = e.reactions;
			r === null ? e.reactions = [R] : a.call(r, R) || r.push(R);
		}
	}
	if (Fn && Gt.has(e)) return Gt.get(e);
	if (t) {
		var i = e;
		if (Fn) {
			var o = i.v;
			return (!(i.f & 1024) && i.reactions !== null || tr(i)) && (o = St(i)), Gt.set(i, o), o;
		}
		var s = !(i.f & 512) && !Ln && R !== null && (Pn || !!(R.f & 512)), c = (i.f & ee) === 0;
		Jn(i) && (s && (i.f |= 512), Ct(i)), s && !c && (Tt(i), er(i));
	}
	if (Ot?.has(e)) return Ot.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function er(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (Tt(t), er(t));
}
function tr(e) {
	if (e.v === t) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Gt.has(t) || t.f & 2 && tr(t)) return !0;
	return !1;
}
function nr(e) {
	var t = Ln;
	try {
		return Ln = !0, e();
	} finally {
		Ln = t;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
var rr = Symbol("events"), ir = /* @__PURE__ */ new Set(), ar = /* @__PURE__ */ new Set();
function or(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || dr.call(t, e), !e.cancelBubble) return st(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Je(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function sr(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = or(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && gn(() => {
		t.removeEventListener(e, o, a);
	});
}
function W(e, t, n) {
	(t[rr] ??= {})[e] = n;
}
function cr(e) {
	for (var t = 0; t < e.length; t++) ir.add(e[t]);
	for (var n of ar) n(e);
}
var lr = null, ur = !1;
function dr(e) {
	var t = this, n = t.ownerDocument, r = e.type, i = e.composedPath?.() || [], a = i[0] || e.target;
	lr = e, ur || (ur = !0, setTimeout(() => {
		ur = !1, lr = null;
	}));
	var o = 0, c = lr === e && e[rr];
	if (c) {
		var l = i.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[rr] = t;
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
		var d = R, f = B;
		z(null), Rn(null);
		try {
			for (var p, m = []; a !== null && a !== t;) {
				try {
					var h = a[rr]?.[r];
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
			e[rr] = t, delete e.currentTarget, z(d), Rn(f);
		}
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/reconciler.js
var fr = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function pr(e) {
	return fr?.createHTML(e) ?? e;
}
function mr(e) {
	var t = dn("template");
	return t.innerHTML = pr(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function hr(e, t) {
	var n = B;
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
		if (C) return hr(w, null), w;
		i === void 0 && (i = mr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ j(i)));
		var t = r || rn ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ j(t), s = t.lastChild;
			hr(o, s);
		} else hr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function gr(e, t, n = "svg") {
	var r = !e.startsWith("<!>"), i = !!(t & 1), a = `<${n}>${r ? e : "<!>" + e}</${n}>`, o;
	return () => {
		if (C) return hr(w, null), w;
		if (!o) {
			var e = /* @__PURE__ */ j(mr(a));
			if (i) for (o = document.createDocumentFragment(); /* @__PURE__ */ j(e);) o.appendChild(/* @__PURE__ */ j(e));
			else o = /* @__PURE__ */ j(e);
		}
		var t = o.cloneNode(!0);
		if (i) {
			var n = /* @__PURE__ */ j(t), r = t.lastChild;
			hr(n, r);
		} else hr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function _r(e, t) {
	return /* @__PURE__ */ gr(e, t, "svg");
}
function vr() {
	if (C) return hr(w, null), w;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = A();
	return e.append(t, n), hr(t, n), e;
}
function K(e, t) {
	if (C) {
		var n = B;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = w), Pe();
	} else e !== null && e.before(t);
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var yr = ["touchstart", "touchmove"];
function br(e) {
	return yr.includes(e);
}
function q(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[ge] ??= e.nodeValue) && (e[ge] = n, e.nodeValue = `${n}`);
}
function xr(e, t) {
	return Cr(e, t);
}
var Sr = /* @__PURE__ */ new Map();
function Cr(t, { target: n, anchor: r, props: i = {}, events: a, context: s, intro: c = !0, transformError: l }) {
	sn();
	var u = void 0, d = vn(() => {
		var c = r ?? n.appendChild(A());
		ut(c, { pending: () => {} }, (n) => {
			Ue({});
			var r = Ve;
			if (s && (r.c = s), a && (i.$$events = a), C && hr(n, null), u = t(n, i) || {}, C && (B.nodes.end = w, w === null || w.nodeType !== 8 || w.data !== "]")) throw ke(), e;
			We();
		}, l);
		var d = /* @__PURE__ */ new Set(), f = (e) => {
			for (var t = 0; t < e.length; t++) {
				var r = e[t];
				if (!d.has(r)) {
					d.add(r);
					var i = br(r);
					for (let e of [n, document]) {
						var a = Sr.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), Sr.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, dr, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return f(o(ir)), ar.add(f), () => {
			for (var e of d) for (let r of [n, document]) {
				var t = Sr.get(r), i = t.get(e);
				--i == 0 ? (r.removeEventListener(e, dr), t.delete(e), t.size === 0 && Sr.delete(r)) : t.set(e, i);
			}
			ar.delete(f), c !== r && c.parentNode?.removeChild(c);
		};
	});
	return wr.set(u, d), u;
}
var wr = /* @__PURE__ */ new WeakMap();
function Tr(e, t) {
	let n = wr.get(e);
	return n ? (wr.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/branches.js
var Er = class {
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
			if (n) An(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (An(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
			}
			for (let [t, n] of this.#e) {
				if (this.#e.delete(t), t === e) break;
				let r = this.#n.get(n);
				r && (L(r.effect), this.#n.delete(n));
			}
			for (let [e, r] of this.#t) {
				if (e === t || this.#r.has(e)) continue;
				let i = () => {
					if (Array.from(this.#e.values()).includes(e)) {
						var t = document.createDocumentFragment();
						Mn(r, t), t.append(A()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else L(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), On(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (L(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = D, r = un();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = A();
				i.append(a), this.#n.set(e, {
					effect: I(() => t(a)),
					fragment: i
				});
			} else this.#t.set(e, I(() => t(this.anchor)));
		}
		if (this.#e.set(n, e), r) {
			for (let [t, r] of this.#t) t === e ? n.unskip_effect(r) : n.skip_effect(r);
			for (let [t, r] of this.#n) t === e ? n.unskip_effect(r.effect) : n.skip_effect(r.effect);
			n.oncommit(this.#a), n.ondiscard(this.#o);
		} else C && (this.anchor = w), this.#a(n);
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
function J(e, t, n = !1) {
	var r;
	C && (r = w, Pe());
	var i = new Er(e), a = n ? ne : 0;
	function o(e, t) {
		if (C) {
			var n = Le(r);
			if (e !== parseInt(n.substring(1))) {
				var a = Ie();
				Ne(a), i.anchor = a, Me(!1), i.ensure(e, t), Me(!0);
				return;
			}
		}
		i.ensure(e, t);
	}
	Sn(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
function Dr(e, t) {
	return t;
}
function Or(e, t, n) {
	for (var r = [], i = t.length, a, s = t.length, c = 0; c < i; c++) {
		let n = t[c];
		On(n, () => {
			if (a) {
				if (a.pending.delete(n), a.done.add(n), a.pending.size === 0) {
					var t = e.outrogroups;
					kr(e, o(a.done)), t.delete(a), t.size === 0 && (e.outrogroups = null);
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
		kr(e, t, !l);
	} else a = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(a);
}
function kr(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= ae, Mn(a, document.createDocumentFragment())) : L(t[i], n);
	}
}
var Ar;
function Y(e, t, n, i, a, s = null) {
	var c = e, l = /* @__PURE__ */ new Map();
	if (t & 4) {
		var u = e;
		c = C ? Ne(/* @__PURE__ */ j(u)) : u.appendChild(A());
	}
	C && Pe();
	var d = null, f = /* @__PURE__ */ bt(() => {
		var e = n();
		return r(e) ? e : e == null ? [] : o(e);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, Mr(v, p, c, t, i), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= ae, Pr(d, null, c)) : An(d) : On(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: Sn(() => {
			p = U(f);
			var e = p.length;
			let r = !1;
			C && Le(c) === "[!" != (e === 0) && (c = Ie(), Ne(c), Me(!1), r = !0);
			for (var o = /* @__PURE__ */ new Set(), u = D, v = un(), y = 0; y < e; y += 1) {
				C && w.nodeType === 8 && w.data === "]" && (c = w, r = !0, Me(!1));
				var b = p[y], x = i(b, y), S = h ? null : l.get(x);
				S ? (S.v && Yt(S.v, b), S.i && Yt(S.i, y), v && u.unskip_effect(S.e)) : (S = Nr(l, h ? c : Ar ??= A(), b, x, y, a, t, n), h || (S.e.f |= ae), l.set(x, S)), o.add(x);
			}
			if (e === 0 && s && !d && (h ? d = I(() => s(c)) : (d = I(() => s(Ar ??= A())), d.f |= ae)), e > o.size && xe("", "", ""), C && e > 0 && Ne(Ie()), !h) {
				if (m.set(u, o), v) {
					for (let [e, t] of l) o.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			r && Me(!0), U(f);
		}),
		flags: t,
		items: l,
		pending: m,
		outrogroups: null,
		fallback: d
	};
	h = !1, C && (c = w);
}
function jr(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function Mr(e, t, n, r, i) {
	var a = !!(r & 8), s = t.length, c = e.items, l = jr(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (a) for (v = 0; v < s; v += 1) h = t[v], g = i(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = i(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (An(_), a && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= ae, _ === l) Pr(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), Fr(e, d, _), Fr(e, _, y), Pr(_, y, n), d = _, p = [], m = [], l = jr(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], ee = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) Pr(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					Fr(e, S.prev, ee.next), Fr(e, d, S), Fr(e, ee, b), l = b, d = ee, --v, p = [], m = [];
				} else u.delete(_), Pr(_, l, n), Fr(e, _.prev, _.next), Fr(e, _, d === null ? e.effect.first : d.next), Fr(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = jr(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = jr(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (kr(e, o(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var te = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || te.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && te.push(l), l = jr(l.next);
		var ne = te.length;
		if (ne > 0) {
			var re = r & 4 && s === 0 ? n : null;
			if (a) {
				for (v = 0; v < ne; v += 1) te[v].nodes?.a?.measure();
				for (v = 0; v < ne; v += 1) te[v].nodes?.a?.fix();
			}
			Or(e, te, re);
		}
	}
	a && Je(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Nr(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? qt(n) : /* @__PURE__ */ Jt(n, !1, !1) : null, l = o & 2 ? qt(i) : null;
	return {
		v: c,
		i: l,
		e: I(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function Pr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ cn(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function Fr(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function Ir(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") {
		if (Array.isArray(e)) {
			var i = e.length;
			for (t = 0; t < i; t++) e[t] && (n = Ir(e[t])) && (r && (r += " "), r += n);
		} else for (n in e) e[n] && (r && (r += " "), r += n);
	}
	return r;
}
function Lr() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = Ir(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/shared/attributes.js
function X(e) {
	return typeof e == "object" ? Lr(e) : e ?? "";
}
var Rr = [..." 	\n\r\f\xA0\v﻿"];
function zr(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || Rr.includes(r[o - 1])) && (s === r.length || Rr.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function Br(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function Vr(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function Hr(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\/\*.*?\*\//g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(Vr)), i && c.push(...Object.keys(i).map(Vr));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = Vr(e.substring(l, u).trim());
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
		return r && (n += Br(r)), i && (n += Br(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/class.js
function Z(e, t, n, r, i, a) {
	var o = e[me];
	if (C || o !== n || o === void 0) {
		var s = zr(n, r, a);
		(!C || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[me] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/style.js
function Ur(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function Wr(e, t, n, r) {
	var i = e[he];
	if (C || i !== t) {
		var a = Hr(t, r);
		(!C || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[he] = t;
	} else r && (Array.isArray(r) ? (Ur(e, n?.[0], r[0]), Ur(e, n?.[1], r[1], "important")) : Ur(e, n, r));
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function Gr(e, t, n = !1) {
	if (e.multiple) {
		if (t == null) return;
		if (!r(t)) return Ae();
		for (var i of e.options) i.selected = t.includes(qr(i));
	} else {
		for (i of e.options) if (tn(qr(i), t)) {
			i.selected = !0;
			return;
		}
		(!n || t !== void 0) && (e.selectedIndex = -1);
	}
}
function Kr(e) {
	var t = new MutationObserver(() => {
		"__value" in e && Gr(e, e.__value);
	});
	t.observe(e, {
		childList: !0,
		subtree: !0,
		attributes: !0,
		attributeFilter: ["value"]
	}), gn(() => {
		t.disconnect();
	});
}
function qr(e) {
	return "__value" in e ? e.__value : e.value;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var Jr = Symbol("is custom element"), Yr = Symbol("is html"), Xr = ye ? "link" : "LINK", Zr = ye ? "progress" : "PROGRESS";
function Qr(e) {
	if (C) {
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
		e[_e] = n, Je(n), ot();
	}
}
function $r(e, t) {
	var n = ti(e);
	n.value !== (n.value = t ?? void 0) && (e.value !== t || t === 0 && e.nodeName === Zr) && (e.value = t ?? "");
}
function ei(e, t) {
	var n = ti(e);
	n.checked !== (n.checked = t ?? void 0) && (e.checked = t);
}
function Q(e, t, n, r) {
	var i = ti(e);
	C && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === Xr) || i[t] !== (i[t] = n) && (t === "loading" && (e[fe] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && ri(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function ti(e) {
	return e[pe] ??= {
		[Jr]: e.nodeName.includes("-"),
		[Yr]: e.namespaceURI === n
	};
}
var ni = /* @__PURE__ */ new Map();
function ri(e) {
	var t = e.getAttribute("is") || e.nodeName, n = ni.get(t);
	if (n) return n;
	ni.set(t, n = []);
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var o in r = l(i), r) r[o].set && o !== "innerHTML" && o !== "textContent" && o !== "innerText" && n.push(o);
		i = f(i);
	}
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function ii(e, t) {
	return e === t || e?.[ue] === t;
}
function $(e = {}, t, n, r) {
	var i = Ve.r, a = B;
	return yn(() => {
		var o, s;
		return xn(() => {
			o = s, s = r?.() || [], nr(() => {
				ii(n(...s), e) || (t(e, ...s), o && ii(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && ii(n(...s), e) && t(null, ...s);
			}, c = r.teardown;
			r.teardown = () => {
				o(), c?.();
			};
		};
	}), e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/props.js
function ai(e, t, n, r) {
	var i = !0, a = !!(n & 8), o = !!(n & 16), s = r, l = !0, u = void 0, d = () => o && i ? (u ??= /* @__PURE__ */ gt(r), U(u)) : (l && (l = !1, s = o ? nr(r) : r), s);
	let f;
	if (a) {
		var p = ue in e || de in e;
		f = c(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	a ? [m, h] = rt(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && Ce(t), f(m)));
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
	a && U(y);
	var b = B;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? U(y) : i && a ? $t(e) : e;
			return k(y, n), v = !0, s !== void 0 && (s = n), e;
		}
		return Fn && v || b.f & 16384 ? y.v : U(y);
	});
}
var oi = /* @__PURE__ */ G("<article class=\"pc-workflow-starter\"><strong> </strong><p> </p> <small> </small> <button class=\"menu_button\"> </button></article>"), si = /* @__PURE__ */ G("<small>No supported operations yet. Reference-based voice matching is a future candidate.</small>"), ci = /* @__PURE__ */ G("<button class=\"menu_button\"> <small> </small></button>"), li = /* @__PURE__ */ G("<button class=\"menu_button\" draggable=\"true\"> <small>· legacy</small></button>"), ui = /* @__PURE__ */ G("<details class=\"pc-workflow-family\"><summary> </summary><p> </p> <!> <!> <!></details>"), di = /* @__PURE__ */ G("<label>Workflow mode <select aria-label=\"Workflow mode\" class=\"text_pole\"><option>Legacy · Replace prompt</option><option>Native · Guidance and reviewed reply</option></select></label> <h3>Workflow examples</h3> <!> <h3>Node families</h3> <!>", 1), fi = /* @__PURE__ */ G("<option> </option>"), pi = /* @__PURE__ */ G("<label> <select class=\"text_pole\"><option>Choose a connection</option><!></select></label> <label> <input class=\"text_pole\" placeholder=\"Use profile model\"/></label>", 1), mi = /* @__PURE__ */ G("<p class=\"pc-error\"> </p>"), hi = /* @__PURE__ */ G("<small> </small>"), gi = /* @__PURE__ */ G("<button class=\"menu_button\"> </button>"), _i = /* @__PURE__ */ G("<label>Model role<input class=\"text_pole\"/></label> <label>Node connection override<select class=\"text_pole\"><option>Use role binding</option><!></select></label> <label>Node model override<input class=\"text_pole\" placeholder=\"Use bound model\"/></label> <small> </small>", 1), vi = /* @__PURE__ */ G("<select class=\"text_pole\"></select>"), yi = /* @__PURE__ */ G("<input type=\"checkbox\"/>"), bi = /* @__PURE__ */ G("<input class=\"text_pole\" type=\"number\"/>"), xi = /* @__PURE__ */ G("<textarea class=\"text_pole\"></textarea>"), Si = /* @__PURE__ */ G("<label> <!></label>"), Ci = /* @__PURE__ */ G("<small>Protected literal pins reserve every source message containing an exact match verbatim. A missing pin reports PIN_MISSING. Source IDs are for inspection.</small>"), wi = /* @__PURE__ */ G("<div class=\"pc-workflow-editor\"><p> </p> <label>Operation name<input class=\"text_pole\"/></label> <label><input type=\"checkbox\"/> Enabled</label> <small>Disabled operations block preflight; they do not bypass.</small> <!> <!> <button class=\"menu_button\">Duplicate operation</button> <button class=\"menu_button pc-danger\">Delete operation</button> <!> <!></div>"), Ti = /* @__PURE__ */ G("<button class=\"menu_button\"> </button> <!>", 1), Ei = /* @__PURE__ */ G("<p role=\"status\"> </p>"), Di = /* @__PURE__ */ G("<h4>Computed guidance</h4><pre> </pre>", 1), Oi = /* @__PURE__ */ G("<div class=\"pc-workflow-comparison\"><div>Original<pre> </pre></div><div>Candidate<pre> </pre></div></div> <!> <button class=\"menu_button\">Apply reviewed candidate</button> <button class=\"menu_button\">Reject candidate</button> <small>Apply rechecks source freshness. Other memory extensions may already have consumed the original; saving does not confirm durability.</small>", 1), ki = /* @__PURE__ */ G("<h4>Workflow result</h4> <!> <p> </p> <p> </p> <!> <!> <details><summary>Findings and changes</summary><pre> </pre></details> <details><summary>Reports and request trace</summary><pre> </pre></details>", 1), Ai = /* @__PURE__ */ G("<h3> </h3> <p> </p> <strong> </strong> <!> <button class=\"menu_button\"> </button> <small> </small> <!> <button class=\"menu_button\"> </button> <!> <!> <h4>Inspect operations</h4> <!> <!> <!>", 1), ji = /* @__PURE__ */ G("<section class=\"pc-workflows\"><!></section>");
function Mi(e, t) {
	Ue(t, !0);
	let n = ai(t, "mode", 3, "setup"), r = /* @__PURE__ */ O(null);
	function i(e) {
		k(r, e);
	}
	let a = (e) => e.split("\n").filter((e) => e.trim());
	var o = { update: i }, s = vr(), c = N(s), l = (e) => {
		var i = ji(), o = M(i), s = (e) => {
			var n = di(), i = N(n), a = P(M(i)), o = M(a);
			o.value = o.__value = "legacy";
			var s = P(o);
			s.value = s.__value = "native", T(a);
			var c;
			Kr(a), T(i);
			var l = P(i, 4);
			Y(l, 17, () => U(r).starters, (e) => e.id, (e, n) => {
				var r = oi(), i = M(r), a = M(i, !0);
				T(i);
				var o = P(i), s = M(o, !0);
				T(o);
				var c = P(o, 2), l = M(c);
				T(c);
				var u = P(c, 2), d = M(u);
				T(u), T(r), F((e) => {
					q(a, U(n).title), q(s, U(n).purpose), q(l, `${U(n).phase === "pre" ? "Before reply · Guidance" : "After reply · Reviewed reply"} · Roles: ${e ?? ""} · Maximum ${U(n).callBound ?? ""} auxiliary requests`), q(d, `Install ${U(n).title ?? ""}`);
				}, [() => U(n).roles.join(", ")]), W("click", u, () => t.actions.install(U(n).id)), K(e, r);
			}), Y(P(l, 4), 17, () => U(r).families, (e) => e.name, (e, n) => {
				var i = ui(), a = M(i), o = M(a, !0);
				T(a);
				var s = P(a), c = M(s, !0);
				T(s);
				var l = P(s, 2), u = (e) => {
					K(e, si());
				};
				J(l, (e) => {
					U(n).name === "Transpose" && e(u);
				});
				var d = P(l, 2);
				Y(d, 17, () => U(n).operations, (e) => e.id, (e, n) => {
					var i = ci(), a = M(i), o = P(a), s = M(o);
					T(o), T(i), F(() => {
						i.disabled = !U(r).native || !U(n).compatible, Q(i, "title", U(r).native ? U(n).compatible ? "Add operation" : "This operation requires the " + U(n).phase + " phase." : "Install a native example first; legacy controls remain below."), q(a, `${U(n).title ?? ""} `), q(s, `· ${U(n).phase ?? ""}`);
					}), W("click", i, () => t.actions.addNode(U(n).id)), K(e, i);
				});
				var f = P(d, 2), p = (e) => {
					var r = vr();
					Y(N(r), 17, () => U(n).legacy, (e) => e.id, (e, n) => {
						var r = li(), i = M(r);
						Fe(), T(r), F(() => {
							Q(r, "aria-label", "Add legacy " + U(n).title), q(i, `${U(n).title ?? ""} `);
						}), sr("dragstart", r, (e) => e.dataTransfer?.setData("application/x-prompt-canvas", JSON.stringify({
							kind: "block",
							type: U(n).id
						}))), W("click", r, () => t.actions.addLegacyNode(U(n).id)), K(e, r);
					}), K(e, r);
				};
				J(f, (e) => {
					U(r).native || e(p);
				}), T(i), F(() => {
					i.open = U(r).native, q(o, U(n).name), q(c, U(n).description);
				}), K(e, i);
			}), F(() => {
				c !== (c = U(r).workflowMode) && (a.value = (a.__value = U(r).workflowMode) ?? "", Gr(a, U(r).workflowMode));
			}), W("change", a, (e) => t.actions.setMode(e.currentTarget.value)), K(e, n);
		}, c = (e) => {
			var n = Ai(), i = N(n), o = M(i, !0);
			T(i);
			var s = P(i, 2), c = M(s, !0);
			T(s);
			var l = P(s, 2), u = M(l);
			T(l);
			var d = P(l, 2);
			Y(d, 17, () => U(r).roles, (e) => e.name, (e, n) => {
				var i = pi(), a = N(i), o = M(a), s = P(o), c = M(s);
				c.value = c.__value = "", Y(P(c), 17, () => U(r).profiles, (e) => e.id, (e, t) => {
					var n = fi(), r = M(n, !0);
					T(n);
					var i = {};
					F(() => {
						q(r, U(t).name), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
					}), K(e, n);
				}), T(s);
				var l;
				Kr(s), T(a);
				var u = P(a, 2), d = M(u), f = P(d);
				Qr(f), T(u), F(() => {
					q(o, `${U(n).name ?? ""} connection `), Q(s, "aria-label", U(n).name + " connection"), l !== (l = U(n).profileId) && (s.value = (s.__value = U(n).profileId) ?? "", Gr(s, U(n).profileId)), q(d, `${U(n).name ?? ""} model override`), $r(f, U(n).model);
				}), W("change", s, (e) => t.actions.bindRole(U(n).name, e.currentTarget.value, U(n).model)), W("input", f, (e) => t.actions.bindRole(U(n).name, U(n).profileId, e.currentTarget.value)), K(e, i);
			});
			var f = P(d, 2), p = M(f);
			T(f);
			var m = P(f, 2), h = M(m);
			T(m);
			var g = P(m, 2);
			Y(g, 17, () => U(r).issues, Dr, (e, t) => {
				var n = mi(), r = M(n, !0);
				T(n), F(() => q(r, U(t))), K(e, n);
			});
			var _ = P(g, 2), v = M(_, !0);
			T(_);
			var y = P(_, 2), b = (e) => {
				var t = hi(), n = M(t);
				T(t), F(() => q(n, `Test workflow does not publish guidance. A later Send reruns the workflow and may incur up to ${U(r).callBound ?? ""} auxiliary requests again.`)), K(e, t);
			};
			J(y, (e) => {
				U(r).phase === "pre" && e(b);
			});
			var x = P(y, 2);
			Y(x, 17, () => U(r).groups, (e) => e.id, (e, n) => {
				var r = gi(), i = M(r);
				T(r), F(() => q(i, `${U(n).collapsed ? "Open" : "Fold"} ${U(n).title ?? ""} formation · Surface · maximum 1 request`)), W("click", r, () => t.actions.expand(U(n).id)), K(e, r);
			});
			var S = P(x, 4);
			Y(S, 17, () => U(r).nodes, (e) => e.id, (e, n) => {
				var i = Ti(), o = N(i), s = M(o);
				T(o);
				var c = P(o, 2), l = (e) => {
					var i = wi(), o = M(i), s = M(o);
					T(o);
					var c = P(o, 2), l = P(M(c));
					Qr(l), T(c);
					var u = P(c, 2), d = M(u);
					Qr(d), Fe(), T(u);
					var f = P(u, 4), p = (e) => {
						var i = _i(), a = N(i), o = P(M(a));
						Qr(o), T(a);
						var s = P(a, 2), c = P(M(s)), l = M(c);
						l.value = l.__value = "", Y(P(l), 17, () => U(r).profiles, (e) => e.id, (e, t) => {
							var n = fi(), r = M(n, !0);
							T(n);
							var i = {};
							F(() => {
								q(r, U(t).name), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
							}), K(e, n);
						}), T(c);
						var u;
						Kr(c), T(s);
						var d = P(s, 2), f = P(M(d));
						Qr(f), T(d);
						var p = P(d, 2), m = M(p);
						T(p), F(() => {
							$r(o, U(n).modelRole), u !== (u = U(n).profileId) && (c.value = (c.__value = U(n).profileId) ?? "", Gr(c, U(n).profileId)), $r(f, U(n).model), q(m, `Effective connection: ${U(n).effective ?? ""}`);
						}), W("input", o, (e) => t.actions.updateNode(U(n).id, "modelRole", e.currentTarget.value)), W("change", c, (e) => t.actions.updateNode(U(n).id, "profileId", e.currentTarget.value || null)), W("input", f, (e) => t.actions.updateNode(U(n).id, "model", e.currentTarget.value || null)), K(e, i);
					};
					J(f, (e) => {
						U(n).modelRole && e(p);
					});
					var m = P(f, 2);
					Y(m, 17, () => U(n).controls, (e) => e.key, (e, r) => {
						var i = Si(), o = M(i), s = P(o), c = (e) => {
							var i = vi();
							Y(i, 21, () => U(r).options, Dr, (e, t) => {
								var n = fi(), r = M(n, !0);
								T(n);
								var i = {};
								F(() => {
									q(r, U(t)), i !== (i = U(t)) && (n.value = (n.__value = U(t)) ?? "");
								}), K(e, n);
							}), T(i);
							var a;
							Kr(i), F((e) => {
								a !== (a = e) && (i.value = (i.__value = e) ?? "", Gr(i, e));
							}, [() => String(U(r).value)]), W("change", i, (e) => t.actions.updateNode(U(n).id, U(r).key, e.currentTarget.value)), K(e, i);
						}, l = (e) => {
							var i = yi();
							Qr(i), F((e) => ei(i, e), [() => !!U(r).value]), W("change", i, (e) => t.actions.updateNode(U(n).id, U(r).key, e.currentTarget.checked)), K(e, i);
						}, u = (e) => {
							var i = bi();
							Qr(i), F((e) => {
								Q(i, "aria-label", U(r).label), Q(i, "min", U(r).key === "keepRecent" ? 0 : 1), $r(i, e);
							}, [() => Number(U(r).value)]), W("input", i, (e) => t.actions.updateNode(U(n).id, U(r).key, Number(e.currentTarget.value))), K(e, i);
						}, d = (e) => {
							var i = xi();
							it(i), F((e) => $r(i, e), [() => String(U(r).value)]), W("input", i, (e) => t.actions.updateNode(U(n).id, U(r).key, U(r).kind === "lines" ? a(e.currentTarget.value) : e.currentTarget.value)), K(e, i);
						};
						J(s, (e) => {
							U(r).options ? e(c) : U(r).kind === "boolean" ? e(l, 1) : U(r).kind === "number" ? e(u, 2) : e(d, -1);
						}), T(i), F(() => q(o, `${U(r).label ?? ""} `)), K(e, i);
					});
					var h = P(m, 2), g = P(h, 2), _ = P(g, 2), v = (e) => {
						K(e, Ci());
					};
					J(_, (e) => {
						U(n).operation === "smart-compactor" && e(v);
					});
					var y = P(_, 2), b = (e) => {
						var t = hi(), n = M(t, !0);
						T(t), F(() => q(n, U(r).quoteHelp)), K(e, t);
					};
					J(y, (e) => {
						U(n).operation === "pattern-scan" && e(b);
					}), T(i), F(() => {
						q(s, `${U(n).family ?? ""} · ${U(n).phase ?? ""} phase · ${U(n).input ?? ""} → ${U(n).output ?? ""}`), $r(l, U(n).title), ei(d, U(n).enabled);
					}), W("input", l, (e) => t.actions.updateNode(U(n).id, "title", e.currentTarget.value)), W("change", d, (e) => t.actions.updateNode(U(n).id, "enabled", e.currentTarget.checked)), W("click", h, () => t.actions.duplicate(U(n).id)), W("click", g, () => t.actions.remove(U(n).id)), K(e, i);
				};
				J(c, (e) => {
					U(n).id === U(r).selectedId && e(l);
				}), F(() => {
					Q(o, "aria-pressed", U(r).selectedId === U(n).id), q(s, `Inspect ${U(n).title ?? ""}`);
				}), W("click", o, () => t.actions.inspect(U(n).id)), K(e, i);
			});
			var ee = P(S, 2), te = (e) => {
				var t = Ei(), n = M(t, !0);
				T(t), F(() => q(n, U(r).status)), K(e, t);
			};
			J(ee, (e) => {
				U(r).status && e(te);
			});
			var ne = P(ee, 2), re = (e) => {
				var n = ki(), i = P(N(n), 2), a = (e) => {
					var t = mi(), n = M(t, !0);
					T(t), F(() => q(n, U(r).result.error)), K(e, t);
				};
				J(i, (e) => {
					U(r).result.error && e(a);
				});
				var o = P(i, 2), s = M(o);
				T(o);
				var c = P(o, 2), l = M(c);
				T(c);
				var u = P(c, 2), d = (e) => {
					var t = Di(), n = P(N(t)), i = M(n, !0);
					T(n), F(() => q(i, U(r).result.guidance)), K(e, t);
				};
				J(u, (e) => {
					U(r).result.guidance && e(d);
				});
				var f = P(u, 2), p = (e) => {
					var n = Oi(), i = N(n), a = M(i), o = P(M(a)), s = M(o, !0);
					T(o), T(a);
					var c = P(a), l = P(M(c)), u = M(l, !0);
					T(l), T(c), T(i);
					var d = P(i, 2), f = (e) => {
						var t = mi(), n = M(t, !0);
						T(t), F(() => q(n, U(r).result.applyIssue)), K(e, t);
					};
					J(d, (e) => {
						U(r).result.applyIssue && e(f);
					});
					var p = P(d, 2), m = P(p, 2);
					Fe(2), F(() => {
						q(s, U(r).result.original), q(u, U(r).result.candidate), p.disabled = U(r).busy || !!U(r).result.applyIssue, m.disabled = U(r).busy;
					}), W("click", p, () => t.actions.apply()), W("click", m, () => t.actions.reject()), K(e, n);
				};
				J(f, (e) => {
					U(r).result.applyAvailable && e(p);
				});
				var m = P(f, 2), h = P(M(m)), g = M(h, !0);
				T(h), T(m);
				var _ = P(m, 2), v = P(M(_)), y = M(v, !0);
				T(v), T(_), F((e, t, n) => {
					q(s, `Actual auxiliary requests: ${U(r).result.actualCalls ?? ""} / ${U(r).result.callBound ?? ""}`), q(l, `Token count method: ${e ?? ""}`), q(g, t), q(y, n);
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
			J(ne, (e) => {
				U(r).result && e(re);
			}), F(() => {
				q(o, U(r).name), q(c, U(r).phase === "pre" ? "Guidance helps SillyTavern plan its normal reply." : "Review a revision of the latest completed assistant reply."), q(u, `Maximum auxiliary requests: ${U(r).callBound ?? ""}`), q(p, `Assign ${U(r).phase ?? ""} phase and enable native mode`), q(h, `${U(r).assigned ? "Assigned to this phase." : "Phase is not assigned."} Mode: ${U(r).workflowMode ?? ""}. Arming is a separate action.`), _.disabled = U(r).busy || !!U(r).issues.length, q(v, U(r).busy ? "Running…" : U(r).phase === "pre" ? "Test workflow" : "Run reviewed repair");
			}), W("click", f, () => t.actions.assign(U(r)?.phase || "")), W("click", _, () => t.actions.run()), K(e, n);
		};
		J(o, (e) => {
			n() === "library" ? e(s) : e(c, -1);
		}), T(i), F(() => {
			Q(i, "data-pc-workflows", n()), Q(i, "aria-label", n() === "library" ? "Workflow library" : "Workflow setup and review");
		}), K(e, i);
	};
	return J(c, (e) => {
		U(r) && e(l);
	}), K(e, s), We(o);
}
cr([
	"change",
	"click",
	"input"
]);
//#endregion
//#region ui/NodeCard.svelte
var Ni = /* @__PURE__ */ G("<span> </span>"), Pi = /* @__PURE__ */ G("<span class=\"pc-off-pill\">OFF</span>"), Fi = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-node-action pc-help-btn fa-solid fa-circle-question\" title=\"How Deciders work\" aria-label=\"How Deciders work\"></button>"), Ii = /* @__PURE__ */ G("<button type=\"button\"></button>"), Li = /* @__PURE__ */ G("<div class=\"pc-node-body\"> </div>"), Ri = /* @__PURE__ */ G("<div> </div>"), zi = /* @__PURE__ */ G("<div><b> </b><span> </span></div>"), Bi = /* @__PURE__ */ G("<div><!> <!></div>"), Vi = /* @__PURE__ */ G("· <b> </b>", 1), Hi = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-node-action pc-node-model pc-node-model-pick\"><i class=\"fa-solid fa-microchip\"></i> <!> <i class=\"fa-solid fa-caret-down pc-model-caret\"></i></button>"), Ui = /* @__PURE__ */ G("<div class=\"pc-node-model\"><i class=\"fa-solid fa-microchip\"></i> <!></div>"), Wi = /* @__PURE__ */ G("<div><i></i> </div>"), Gi = /* @__PURE__ */ G("<span class=\"pc-port-keyname\"> </span>"), Ki = /* @__PURE__ */ G("<i></i>"), qi = /* @__PURE__ */ G("<div><!><!></div>"), Ji = /* @__PURE__ */ G("<div role=\"group\"><div class=\"pc-node-head\"><span class=\"pc-badge\"><i></i> </span> <span class=\"pc-node-title\"> </span> <!> <!> <!> <!></div> <!> <!> <!> <!> <!></div>");
function Yi(e, t) {
	Ue(t, !0);
	let n = (e) => e.stopPropagation();
	var r = Ji();
	let i;
	var a = M(r), o = M(a), s = M(o), c = P(s);
	T(o);
	var l = P(o, 2), u = M(l, !0);
	T(l);
	var d = P(l, 2), f = (e) => {
		var n = Ni(), r = M(n, !0);
		T(n), F(() => {
			Z(n, 1, X(t.card.token.className)), Q(n, "title", t.card.token.title), q(r, t.card.token.text);
		}), K(e, n);
	};
	J(d, (e) => {
		t.card.token && e(f);
	});
	var p = P(d, 2), m = (e) => {
		var n = Pi();
		F(() => Q(n, "title", t.card.offHint)), K(e, n);
	};
	J(p, (e) => {
		t.card.offHint && e(m);
	});
	var h = P(p, 2), g = (e) => {
		var r = Fi();
		W("mousedown", r, n), W("click", r, (e) => {
			n(e), t.actions.help(t.card.id);
		}), K(e, r);
	};
	J(h, (e) => {
		t.card.help && e(g);
	});
	var _ = P(h, 2), v = (e) => {
		var r = Ii();
		F(() => {
			Z(r, 1, `pc-node-action pc-toggle fa-solid ${t.card.enabled ? "fa-toggle-on pc-toggle-on" : "fa-toggle-off pc-toggle-off"}`), Q(r, "title", t.card.enabled ? "Switched on — click to switch off" : "Switched off — click to switch on"), Q(r, "aria-label", `Switch ${t.card.title} ${t.card.enabled ? "off" : "on"}`), Q(r, "aria-pressed", t.card.enabled);
		}), W("mousedown", r, n), W("click", r, (e) => {
			n(e), t.actions.toggle(t.card.id);
		}), K(e, r);
	};
	J(_, (e) => {
		t.card.toggle && e(v);
	}), T(a);
	var y = P(a, 2), b = (e) => {
		var n = Li(), r = M(n, !0);
		T(n), F(() => q(r, t.card.body)), K(e, n);
	};
	J(y, (e) => {
		t.card.body !== null && e(b);
	});
	var x = P(y, 2), S = (e) => {
		var n = Bi(), r = M(n), i = (e) => {
			var n = Ri(), r = M(n, !0);
			T(n), F(() => {
				Z(n, 1, X(t.card.mode.className)), q(r, t.card.mode.text);
			}), K(e, n);
		};
		J(r, (e) => {
			t.card.mode && e(i);
		}), Y(P(r, 2), 17, () => t.card.rows, (e) => e.id, (e, t) => {
			var n = zi(), r = M(n), i = M(r, !0);
			T(r);
			var a = P(r), o = M(a, !0);
			T(a), T(n), F(() => {
				Z(n, 1, `pc-dec-key${U(t).chosen ? " pc-dec-chosen" : ""}${U(t).fallback ? " pc-dec-fallback" : ""}`), q(i, U(t).name), q(o, U(t).text);
			}), K(e, n);
		}), T(n), F(() => Z(n, 1, X(t.card.rowClass))), K(e, n);
	};
	J(x, (e) => {
		t.card.body === null && e(S);
	});
	var ee = P(x, 2), te = (e) => {
		var r = vr(), i = N(r), a = (e) => {
			var r = Hi(), i = P(M(r)), a = P(i), o = (e) => {
				var n = Vi(), r = P(N(n)), i = M(r, !0);
				T(r), F(() => q(i, t.card.model.actual)), K(e, n);
			};
			J(a, (e) => {
				t.card.model.actual && e(o);
			}), Fe(2), T(r), F(() => {
				Q(r, "title", t.card.model.title), q(i, ` ${t.card.model.where ?? ""}`);
			}), W("mousedown", r, n), W("dblclick", r, n), W("click", r, (e) => {
				n(e), t.actions.model(t.card.id, e.currentTarget);
			}), K(e, r);
		}, o = (e) => {
			var n = Ui(), r = P(M(n)), i = P(r), a = (e) => {
				var n = Vi(), r = P(N(n)), i = M(r, !0);
				T(r), F(() => q(i, t.card.model.actual)), K(e, n);
			};
			J(i, (e) => {
				t.card.model.actual && e(a);
			}), T(n), F(() => {
				Q(n, "title", t.card.model.title), q(r, ` ${t.card.model.where ?? ""}`);
			}), K(e, n);
		};
		J(i, (e) => {
			t.card.model.pick ? e(a) : e(o, -1);
		}), K(e, r);
	};
	J(ee, (e) => {
		t.card.model && e(te);
	});
	var ne = P(ee, 2);
	Y(ne, 19, () => t.card.notices, (e, t) => `${e.className}:${t}`, (e, t) => {
		var n = Wi(), r = M(n), i = P(r);
		T(n), F(() => {
			Z(n, 1, X(U(t).className)), Q(n, "title", U(t).title), Z(r, 1, `fa-solid ${U(t).icon}`), q(i, ` ${U(t).text ?? ""}`);
		}), K(e, n);
	}), Y(P(ne, 2), 17, () => t.card.ports, (e) => e.id, (e, n) => {
		var r = qi();
		let i;
		var a = M(r), o = (e) => {
			var t = Gi(), r = M(t, !0);
			T(t), F(() => q(r, U(n).label)), K(e, t);
		};
		J(a, (e) => {
			U(n).label && e(o);
		});
		var s = P(a), c = (e) => {
			var t = Ki();
			F(() => Z(t, 1, `fa-solid ${U(n).icon}`)), K(e, t);
		};
		J(s, (e) => {
			U(n).icon && e(c);
		}), T(r), F(() => {
			Z(r, 1, X(U(n).className)), Q(r, "data-node", t.card.id), Q(r, "data-dir", U(n).dir), Q(r, "data-port", U(n).port), Q(r, "data-side", U(n).side), Q(r, "title", U(n).title), i = Wr(r, "", i, { left: U(n).left === void 0 ? void 0 : `${U(n).left}%` });
		}), K(e, r);
	}), T(r), F(() => {
		Z(r, 1, X(t.card.className)), Q(r, "data-id", t.card.id), Q(r, "title", t.card.hint), Q(r, "aria-label", `${t.card.label}: ${t.card.title}`), i = Wr(r, "", i, {
			left: `${t.card.x}px`,
			top: `${t.card.y}px`,
			width: `${t.card.w}px`
		}), Z(s, 1, `fa-solid ${t.card.icon} pc-badge-icon`), q(c, ` ${t.card.label ?? ""}`), Q(l, "title", t.card.titleHint), q(u, t.card.title);
	}), sr("mouseenter", r, () => t.actions.hover(t.card.id)), sr("mouseleave", r, () => t.actions.hover(null)), K(e, r), We();
}
cr([
	"mousedown",
	"click",
	"dblclick"
]);
//#endregion
//#region ui/GroupCard.svelte
var Xi = /* @__PURE__ */ G("<span class=\"pc-badge\"><i class=\"fa-solid fa-object-group pc-badge-icon\"></i> Group</span>"), Zi = /* @__PURE__ */ G("<i class=\"fa-solid fa-object-group\"></i>"), Qi = /* @__PURE__ */ G("<span class=\"pc-group-frame-count\"> </span>"), $i = /* @__PURE__ */ G("<span> </span>"), ea = /* @__PURE__ */ G("<span class=\"pc-off-pill\" title=\"This whole group is switched off. Nothing in it is sent, and nothing passes through it.\">OFF</span>"), ta = /* @__PURE__ */ G("<div class=\"pc-node-body\"> </div><div class=\"pc-node-model pc-group-io\"> </div> <div class=\"pc-node-cond\"> </div> <div class=\"pc-gport pc-gport-in\" data-gport=\"in\" title=\"Drag up to a block to wire it into this group\"></div> <div class=\"pc-gport pc-gport-out\" data-gport=\"out\" title=\"Drag to wire a block in this group into another block\"></div>", 1), na = /* @__PURE__ */ G("<div class=\"pc-group-resize\" data-action=\"resize\" title=\"Drag to resize the blanket\"></div>"), ra = /* @__PURE__ */ G("<div role=\"group\"><div><!> <span> </span> <!> <!> <!> <button type=\"button\"></button> <button type=\"button\" data-action=\"toggle\" aria-label=\"Toggle group\"></button></div> <!></div>");
function ia(e, t) {
	Ue(t, !0);
	function n(e, n) {
		e.stopPropagation(), e.preventDefault(), t.actions.group(t.group.id, n);
	}
	function r(e, n) {
		e.stopPropagation(), e.detail === 0 && t.actions.group(t.group.id, n);
	}
	var i = ra();
	let a;
	var o = M(i), s = M(o), c = (e) => {
		K(e, Xi());
	}, l = (e) => {
		K(e, Zi());
	};
	J(s, (e) => {
		t.group.collapsed ? e(c) : e(l, -1);
	});
	var u = P(s, 2), d = M(u, !0);
	T(u);
	var f = P(u, 2), p = (e) => {
		var n = Qi(), r = M(n, !0);
		T(n), F(() => q(r, t.group.count)), K(e, n);
	};
	J(f, (e) => {
		t.group.collapsed || e(p);
	});
	var m = P(f, 2), h = (e) => {
		var n = $i(), r = M(n, !0);
		T(n), F(() => {
			Z(n, 1, X(t.group.token.className)), Q(n, "title", t.group.token.title), q(r, t.group.token.text);
		}), K(e, n);
	};
	J(m, (e) => {
		t.group.token && e(h);
	});
	var g = P(m, 2), _ = (e) => {
		K(e, ea());
	};
	J(g, (e) => {
		t.group.enabled || e(_);
	});
	var v = P(g, 2), y = P(v, 2);
	T(o);
	var b = P(o, 2), x = (e) => {
		var n = ta(), r = N(n), i = M(r, !0);
		T(r);
		var a = P(r), o = M(a, !0);
		T(a);
		var s = P(a, 2), c = M(s, !0);
		T(s);
		var l = P(s, 2), u = P(l, 2);
		F(() => {
			q(i, t.group.body), q(o, t.group.io), q(c, t.group.enabled ? "double-click to open" : "switched off — nothing goes through"), Q(l, "data-group", t.group.id), Q(u, "data-group", t.group.id);
		}), K(e, n);
	}, S = (e) => {
		K(e, na());
	};
	J(b, (e) => {
		t.group.collapsed ? e(x) : e(S, -1);
	}), T(i), F(() => {
		Z(i, 1, X(t.group.className)), Q(i, "data-group", t.group.id), Q(i, "aria-label", `Group: ${t.group.title}`), a = Wr(i, "", a, {
			left: `${t.group.x}px`,
			top: `${t.group.y}px`,
			width: `${t.group.w}px`,
			height: t.group.collapsed ? void 0 : `${t.group.h}px`
		}), Z(o, 1, X(t.group.collapsed ? "pc-node-head" : "pc-group-frame-head")), Z(u, 1, X(t.group.collapsed ? "pc-node-title" : "pc-group-frame-title")), q(d, t.group.title), Z(v, 1, `pc-node-action fa-solid pc-group-btn ${t.group.collapsed ? "fa-up-right-and-down-left-from-center" : "fa-down-left-and-up-right-to-center"}`), Q(v, "data-action", t.group.collapsed ? "open" : "collapse"), Q(v, "title", t.group.collapsed ? "Open the group as a blanket" : "Fold the group"), Q(v, "aria-label", t.group.collapsed ? "Open group" : "Fold group"), Z(y, 1, `pc-node-action pc-toggle fa-solid ${t.group.enabled ? "fa-toggle-on pc-toggle-on" : "fa-toggle-off pc-toggle-off"}`), Q(y, "title", t.group.enabled ? "Switch the whole group off" : "Switch the whole group on"), Q(y, "aria-pressed", t.group.enabled);
	}), W("mousedown", v, (e) => n(e, t.group.collapsed ? "open" : "collapse")), W("click", v, (e) => r(e, t.group.collapsed ? "open" : "collapse")), W("mousedown", y, (e) => n(e, "toggle")), W("click", y, (e) => r(e, "toggle")), K(e, i), We();
}
cr(["mousedown", "click"]);
//#endregion
//#region ui/WireLayer.svelte
var aa = /* @__PURE__ */ _r("<title> </title>"), oa = /* @__PURE__ */ _r("<path class=\"pc-wire-hit\"></path><path></path><text> <!></text>", 1), sa = /* @__PURE__ */ _r("<path></path>"), ca = /* @__PURE__ */ _r("<defs><marker viewBox=\"0 0 10 10\" refX=\"8\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto-start-reverse\"><path d=\"M 0 0 L 10 5 L 0 10 z\" class=\"pc-loop-arrow\"></path></marker></defs><!><!>", 1);
function la(e, t) {
	Ue(t, !0);
	var n = ca(), r = N(n), i = M(r);
	T(r);
	var a = P(r);
	Y(a, 17, () => t.wires, (e) => e.id, (e, n) => {
		var r = oa(), i = N(r), a = P(i), o = P(a), s = M(o, !0), c = P(s), l = (e) => {
			var t = aa(), r = M(t, !0);
			T(t), F(() => q(r, U(n).label.title)), K(e, t);
		};
		J(c, (e) => {
			U(n).label.title && e(l);
		}), T(o), F(() => {
			Q(i, "d", U(n).d), Q(i, "data-id", U(n).id), Q(a, "d", U(n).d), Z(a, 0, X(U(n).className)), Q(a, "data-id", U(n).id), Q(a, "marker-end", U(n).arrow ? `url(#${t.markerId})` : void 0), Q(o, "x", U(n).label.x), Q(o, "y", U(n).label.y), Z(o, 0, X(U(n).label.className)), Q(o, "data-id", U(n).label.id), Q(o, "text-anchor", U(n).label.anchor), q(s, U(n).label.text);
		}), K(e, r);
	});
	var o = P(a), s = (e) => {
		var n = sa();
		F(() => {
			Q(n, "d", t.ghost.d), Z(n, 0, X(t.ghost.className));
		}), K(e, n);
	};
	J(o, (e) => {
		t.ghost && e(s);
	}), F(() => Q(i, "id", t.markerId)), K(e, n), We();
}
//#endregion
//#region ui/CanvasLayer.svelte
var ua = /* @__PURE__ */ G("<div class=\"pc-viewport\" data-pc-renderer=\"svelte\"><svg class=\"pc-wires\" aria-label=\"Canvas connections\"><!></svg> <div class=\"pc-nodes\"><!> <!> <!></div></div>");
function da(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ O([]), r = /* @__PURE__ */ O([]), i = /* @__PURE__ */ O([]), a = /* @__PURE__ */ O(null), o = /* @__PURE__ */ O({
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
		k(n, e);
	}
	function f(e) {
		k(r, e);
	}
	function p(e, t, n) {
		k(i, e), k(o, t), k(a, n);
	}
	function m(e, t) {
		let i = new Map(e.map((e) => [e.id, e])), a = new Map(t.map((e) => [e.id, e]));
		k(n, U(n).map((e) => i.has(e.id) ? {
			...e,
			...i.get(e.id)
		} : e)), k(r, U(r).map((e) => a.has(e.id) ? {
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
	}, g = ua(), _ = M(g);
	la(M(_), {
		get wires() {
			return U(i);
		},
		get markerId() {
			return t.markerId;
		},
		get ghost() {
			return U(a);
		}
	}), T(_), $(_, (e) => c = e, () => c);
	var v = P(_, 2), y = M(v);
	Y(y, 17, () => U(r).filter((e) => !e.collapsed), (e) => e.id, (e, n) => {
		ia(e, {
			get group() {
				return U(n);
			},
			get actions() {
				return t.actions;
			}
		});
	});
	var b = P(y, 2);
	return Y(b, 17, () => U(n), (e) => e.id, (e, n) => {
		Yi(e, {
			get card() {
				return U(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), Y(P(b, 2), 17, () => U(r).filter((e) => e.collapsed), (e) => e.id, (e, n) => {
		ia(e, {
			get group() {
				return U(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), T(v), $(v, (e) => l = e, () => l), T(g), $(g, (e) => s = e, () => s), F(() => {
		Q(_, "width", U(o).w), Q(_, "height", U(o).h), Q(_, "viewBox", `0 0 ${U(o).w} ${U(o).h}`);
	}), K(e, g), We(h);
}
//#endregion
//#region ui/Toolbar.svelte
var fa = /* @__PURE__ */ G("<option> </option>"), pa = /* @__PURE__ */ G("<button type=\"button\"><i></i> </button>"), ma = /* @__PURE__ */ G("<header class=\"pc-header\" data-pc-ui=\"svelte\"><div class=\"pc-brand\"><i class=\"fa-solid fa-diagram-project\"></i><span>Silly Canvas</span></div> <select class=\"pc-select pc-graph-select text_pole\" aria-label=\"Canvas\"></select> <div class=\"pc-header-actions pc-history\"><button type=\"button\" aria-label=\"Undo\">↶</button> <button type=\"button\" aria-label=\"Redo\">↷</button> <span> </span></div> <div class=\"pc-header-actions pc-document-actions\"><button type=\"button\" class=\"pc-btn menu_button\" title=\"New canvas\">+ New</button> <details class=\"pc-toolbar-menu\"><summary class=\"pc-btn menu_button\" aria-label=\"Canvas actions\">Canvas <span aria-hidden=\"true\">⌄</span></summary> <div class=\"pc-toolbar-menu-panel\"></div></details> <button type=\"button\" class=\"pc-btn menu_button\" title=\"Fit to view\">Fit</button> <button type=\"button\" class=\"pc-btn menu_button pc-theme-btn\" title=\"Theme and colours\"><i class=\"fa-solid fa-palette\"></i><span>Theme</span></button></div> <div class=\"pc-header-actions pc-surface-actions\"><button type=\"button\" title=\"Show or hide the library\" aria-label=\"Toggle library\"><i class=\"fa-solid fa-list-ul\"></i><span>Library</span></button> <button type=\"button\" title=\"Show or hide the inspector\" aria-label=\"Toggle inspector\"><i class=\"fa-solid fa-sliders\"></i><span>Inspector</span></button></div> <label class=\"pc-arm\"><input class=\"pc-arm-input\" type=\"checkbox\"/><span>Arm</span></label> <button type=\"button\" class=\"pc-btn menu_button pc-close\" title=\"Close\" aria-label=\"Close canvas\">×</button></header>");
function ha(e, t) {
	Ue(t, !0);
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
	let c = [
		[
			"duplicate",
			"Duplicate canvas",
			"fa-clone"
		],
		[
			"rename",
			"Rename canvas",
			"fa-i-cursor"
		],
		[
			"import",
			"Import canvas",
			"fa-file-import"
		],
		[
			"export",
			"Export canvas",
			"fa-file-export"
		],
		[
			"seed",
			"Seed from SillyTavern’s current prompt order",
			"fa-wand-magic-sparkles"
		],
		[
			"delete",
			"Delete canvas",
			"fa-trash-can"
		]
	];
	var l = { getParts: s }, u = ma(), d = P(M(u), 2);
	Y(d, 21, () => t.state.graphs, (e) => e.id, (e, t) => {
		var n = fa(), r = M(n, !0);
		T(n);
		var i = {};
		F(() => {
			q(r, U(t).name), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
		}), K(e, n);
	}), T(d), $(d, (e) => r = e, () => r);
	var f;
	Kr(d);
	var p = P(d, 2), m = M(p), h = P(m, 2), g = P(h, 2), v = M(g, !0);
	T(g), T(p);
	var y = P(p, 2), b = M(y), x = P(b, 2), S = P(M(x), 2);
	Y(S, 21, () => c, ([e, t, n]) => e, (e, n) => {
		var r = /* @__PURE__ */ yt(() => _(U(n), 3));
		let i = () => U(r)[0], a = () => U(r)[1], o = () => U(r)[2];
		var s = pa(), c = M(s), l = P(c);
		T(s), F(() => {
			Z(s, 1, `pc-btn menu_button${i() === "delete" ? " pc-danger" : ""}`), Q(s, "title", a()), Z(c, 1, `fa-solid ${o()}`), q(l, ` ${a() ?? ""}`);
		}), W("click", s, (e) => {
			t.actions.command(i()), e.currentTarget.closest("details")?.removeAttribute("open");
		}), K(e, s);
	}), T(S), T(x);
	var ee = P(x, 2), te = P(ee, 2);
	T(y);
	var ne = P(y, 2), re = M(ne);
	$(re, (e) => a = e, () => a);
	var ie = P(re, 2);
	$(ie, (e) => o = e, () => o), T(ne);
	var ae = P(ne, 2), oe = M(ae);
	Qr(oe), $(oe, (e) => i = e, () => i), Fe(), T(ae);
	var se = P(ae, 2);
	return T(u), $(u, (e) => n = e, () => n), F(() => {
		f !== (f = t.state.graphId) && (d.value = (d.__value = t.state.graphId) ?? "", Gr(d, t.state.graphId)), Z(m, 1, `pc-btn menu_button pc-undo${t.state.history.undo ? "" : " pc-disabled"}`), m.disabled = !t.state.history.undo, Q(m, "title", t.state.history.undoTitle), Z(h, 1, `pc-btn menu_button pc-redo${t.state.history.redo ? "" : " pc-disabled"}`), h.disabled = !t.state.history.redo, Q(h, "title", t.state.history.redoTitle), Z(g, 1, `pc-history-note${t.state.history.showNote ? " pc-show" : ""}`), q(v, t.state.history.note), Z(re, 1, `pc-btn menu_button pc-pane-toggle${t.state.sideOpen ? " pc-on" : ""}`), Q(re, "aria-pressed", t.state.sideOpen), Z(ie, 1, `pc-btn menu_button pc-pane-toggle${t.state.inspectorOpen ? " pc-on" : ""}`), Q(ie, "aria-pressed", t.state.inspectorOpen), ei(oe, t.state.armed);
	}), W("change", d, (e) => t.actions.pickGraph(e.currentTarget.value)), W("click", m, () => t.actions.command("undo")), W("click", h, () => t.actions.command("redo")), W("click", b, () => t.actions.command("new")), W("click", ee, () => t.actions.command("fit")), W("click", te, () => t.actions.command("theme")), W("click", re, () => t.actions.command("sidebar")), W("click", ie, () => t.actions.command("inspector")), W("change", oe, (e) => t.actions.arm(e.currentTarget.checked)), W("click", se, () => t.actions.command("close")), K(e, u), We(l);
}
cr(["change", "click"]);
//#endregion
//#region ui/StatusBar.svelte
var ga = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-btn menu_button pc-primary\">Run this one instead</button>"), _a = /* @__PURE__ */ G("<div class=\"pc-status\"><span> </span> <span aria-live=\"polite\"> </span> <!> <span class=\"pc-spacer\"></span> <button type=\"button\" class=\"pc-btn menu_button\"><i class=\"fa-solid fa-thumbtack\"></i> </button> <button type=\"button\" class=\"pc-btn menu_button\"><i class=\"fa-solid fa-user-pen\"></i> </button> <button type=\"button\" class=\"pc-btn menu_button\"><i class=\"fa-solid fa-star\"></i> </button> <button type=\"button\" class=\"pc-btn menu_button pc-primary\"><i class=\"fa-solid fa-eye\"></i> Preview prompt</button></div>");
function va(e, t) {
	Ue(t, !0);
	let n;
	function r() {
		return n;
	}
	var i = { getElement: r }, a = _a(), o = M(a), s = M(o, !0);
	T(o);
	var c = P(o, 2), l = M(c, !0);
	T(c);
	var u = P(c, 2), d = (e) => {
		var n = ga();
		F(() => Q(n, "title", t.status.overrideTitle)), W("click", n, function(...e) {
			t.actions.unpin?.apply(this, e);
		}), K(e, n);
	};
	J(u, (e) => {
		t.status.warning && e(d);
	});
	var f = P(u, 4), p = P(M(f));
	T(f);
	var m = P(f, 2), h = P(M(m));
	T(m);
	var g = P(m, 2), _ = P(M(g));
	T(g);
	var v = P(g, 2);
	return T(a), $(a, (e) => n = e, () => n), F(() => {
		Z(o, 1, `pc-pill ${t.status.armed ? "pc-pill-on" : "pc-pill-off"}`), q(s, t.status.armed ? "Armed" : "Off"), Z(c, 1, `pc-status-text${t.status.warning ? " pc-status-warn" : ""}`), q(l, t.status.text), q(p, ` ${t.status.chatPinned ? "Unpin from chat" : "Pin to this chat"}`), Q(m, "title", t.status.charTitle), q(h, ` ${t.status.charPinned ? "Unpin from character" : "Pin to character"}`), q(_, ` ${t.status.isDefault ? "Default canvas" : "Make default"}`);
	}), W("click", f, function(...e) {
		t.actions.pinChat?.apply(this, e);
	}), W("click", m, function(...e) {
		t.actions.pinCharacter?.apply(this, e);
	}), W("click", g, function(...e) {
		t.actions.makeDefault?.apply(this, e);
	}), W("click", v, function(...e) {
		t.actions.preview?.apply(this, e);
	}), K(e, a), We(i);
}
cr(["click"]);
//#endregion
//#region ui/CanvasControls.svelte
var ya = /* @__PURE__ */ G("<span class=\"pc-selection-count\"> </span>"), ba = /* @__PURE__ */ G("<div class=\"pc-canvas-controls\" role=\"toolbar\" aria-label=\"Canvas tools\"><button type=\"button\" aria-label=\"Select tool\" title=\"Drag empty canvas to select blocks\">Select</button> <button type=\"button\" aria-label=\"Pan tool\" title=\"Drag anywhere to pan; hold Space for temporary pan\">Pan</button> <span class=\"pc-control-separator\"></span> <button type=\"button\" class=\"pc-btn\" aria-label=\"Zoom out\" title=\"Zoom out\">−</button> <output class=\"pc-zoom-readout\" aria-label=\"Canvas zoom\"> </output> <button type=\"button\" class=\"pc-btn\" aria-label=\"Zoom in\" title=\"Zoom in\">+</button> <button type=\"button\" class=\"pc-btn\" title=\"Fit selection (.)\" aria-label=\"Fit selection\">Fit</button> <!></div> <div class=\"pc-gesture-hint\">Drag to select · Shift adds · Alt removes · Space pans</div>", 1);
function xa(e, t) {
	Ue(t, !0);
	var n = ba(), r = N(n), i = M(r), a = P(i, 2), o = P(a, 4), s = P(o, 2), c = M(s);
	T(s);
	var l = P(s, 2), u = P(l, 2), d = P(u, 2), f = (e) => {
		var n = ya(), r = M(n);
		T(n), F(() => q(r, `${t.count ?? ""} selected`)), K(e, n);
	};
	J(d, (e) => {
		t.count && e(f);
	}), T(r), Fe(2), F((e) => {
		Z(i, 1, `pc-btn${t.camera.mode === "select" ? " pc-on" : ""}`), Q(i, "aria-pressed", t.camera.mode === "select"), Z(a, 1, `pc-btn${t.camera.mode === "pan" ? " pc-on" : ""}`), Q(a, "aria-pressed", t.camera.mode === "pan"), q(c, `${e ?? ""}%`);
	}, [() => Math.round(t.camera.zoom * 100)]), W("click", i, () => t.actions.mode("select")), W("click", a, () => t.actions.mode("pan")), W("click", o, () => t.actions.zoom(1 / 1.15)), W("click", l, () => t.actions.zoom(1.15)), W("click", u, function(...e) {
		t.actions.fitSelection?.apply(this, e);
	}), K(e, n), We();
}
cr(["click"]);
//#endregion
//#region ui/DomainSurface.svelte
var Sa = /* @__PURE__ */ G("<div></div>");
function Ca(e, t) {
	Ue(t, !0);
	let n;
	function r() {
		return n;
	}
	var i = { getElement: r }, a = Sa();
	return $(a, (e) => n = e, () => n), F(() => {
		Z(a, 1, X(t.className)), Q(a, "aria-label", t.label);
	}), K(e, a), We(i);
}
//#endregion
//#region ui/Workbench.svelte
var wa = /* @__PURE__ */ G("<div class=\"pc-root\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Silly Canvas\" data-pc-workbench=\"svelte\"><!> <!> <div class=\"pc-body\"><!> <div class=\"pc-stage\"><div class=\"pc-canvas-area\"><div class=\"pc-canvas-host\" aria-label=\"Node canvas\"></div> <!></div> <!></div> <!></div></div>");
function Ta(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ O({
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
	}), r, i, a, o, s, c, l;
	function u() {
		return {
			root: r,
			parts: {
				...a.getParts(),
				status: o.getElement(),
				sidebar: s.getElement(),
				inspector: c.getElement(),
				preview: l.getElement(),
				canvasHost: i
			}
		};
	}
	function d(e) {
		k(n, {
			...U(n),
			...e
		});
	}
	var f = {
		getParts: u,
		update: d
	}, p = wa(), m = M(p);
	$(ha(m, {
		get state() {
			return U(n);
		},
		get actions() {
			return t.actions;
		}
	}), (e) => a = e, () => a);
	var h = P(m, 2);
	$(va(h, {
		get status() {
			return U(n).status;
		},
		get actions() {
			return t.actions;
		}
	}), (e) => o = e, () => o);
	var g = P(h, 2), _ = M(g);
	$(Ca(_, {
		className: "pc-sidebar",
		label: "Block library"
	}), (e) => s = e, () => s);
	var v = P(_, 2), y = M(v), b = M(y);
	return $(b, (e) => i = e, () => i), xa(P(b, 2), {
		get camera() {
			return U(n).camera;
		},
		get count() {
			return U(n).selectionCount;
		},
		get actions() {
			return t.actions;
		}
	}), T(y), $(Ca(P(y, 2), {
		className: "pc-preview",
		label: "Prompt preview"
	}), (e) => l = e, () => l), T(v), $(Ca(P(v, 2), {
		className: "pc-inspector",
		label: "Selection inspector"
	}), (e) => c = e, () => c), T(g), T(p), $(p, (e) => r = e, () => r), K(e, p), We(f);
}
//#endregion
//#region ui/entry.js
var Ea = 0;
function Da(e, t) {
	let n = xr(da, {
		target: e,
		props: {
			actions: t,
			markerId: `pc-loop-arrow-${++Ea}`
		}
	});
	return Lt(), {
		...n.getLayers(),
		setNodes: (e) => Lt(() => n.setNodes(e)),
		setGroups: (e) => Lt(() => n.setGroups(e)),
		setWires: (e, t, r) => Lt(() => n.setWires(e, t, r)),
		setPositions: (e, t) => Lt(() => n.setPositions(e, t)),
		destroy: () => Tr(n)
	};
}
function Oa(e, t) {
	let n = xr(Ta, {
		target: e,
		props: { actions: t }
	});
	return Lt(), {
		...n.getParts(),
		update: (e) => Lt(() => n.update(e)),
		destroy: () => Tr(n)
	};
}
function ka(e, t, n = "setup") {
	let r = xr(Mi, {
		target: e,
		props: {
			actions: t,
			mode: n
		}
	});
	return Lt(), {
		update: (e) => Lt(() => r.update(e)),
		destroy: () => Tr(r)
	};
}
//#endregion
export { Da as mountCanvas, Oa as mountWorkbench, ka as mountWorkflowSurface };
