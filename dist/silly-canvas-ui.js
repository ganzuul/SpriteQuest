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
var h = 1024, g = 2048, _ = 4096, v = 8192, y = 16384, b = 32768, x = 1 << 25, S = 65536, C = 1 << 19, ee = 1 << 20, te = 1 << 25, w = 65536, ne = 1 << 21, re = 1 << 22, ie = 1 << 23, ae = Symbol("$state"), oe = Symbol(""), se = Symbol("attributes"), ce = Symbol("class"), le = Symbol("style"), ue = Symbol("text"), de = Symbol("form reset"), fe = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), pe = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml");
//#endregion
//#region node_modules/svelte/src/internal/client/errors.js
function me() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function he(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function ge() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
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
var xe = {}, T = Symbol("uninitialized"), Se = "http://www.w3.org/1999/xhtml";
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
var E = !1;
function De(e) {
	E = e;
}
var D;
function O(e) {
	if (e === null) throw we(), xe;
	return D = e;
}
function Oe() {
	return O(/* @__PURE__ */ Qt(D));
}
function k(e) {
	if (E) {
		if (/* @__PURE__ */ Qt(D) !== null) throw we(), xe;
		D = e;
	}
}
function ke(e = 1) {
	if (E) {
		for (var t = e, n = D; t--;) n = /* @__PURE__ */ Qt(n);
		D = n;
	}
}
function Ae(e = !0) {
	for (var t = 0, n = D;;) {
		if (n.nodeType === 8) {
			var r = n.data;
			if (r === "]") {
				if (t === 0) return n;
				--t;
			} else (r === "[" || r === "[!" || r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
		}
		var i = /* @__PURE__ */ Qt(n);
		e && n.remove(), n = i;
	}
}
function je(e) {
	if (!e || e.nodeType !== 8) throw we(), xe;
	return e.data;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/equality.js
function Me(e) {
	return e === this.v;
}
function Ne(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function Pe(e) {
	return !Ne(e, this.v);
}
//#endregion
//#region node_modules/svelte/src/internal/client/context.js
var A = null;
function Fe(e) {
	A = e;
}
function Ie(e, t = !1, n) {
	A = {
		p: A,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: V,
		l: null
	};
}
function Le(e) {
	var t = A, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) ln(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, A = t.p, e ?? {};
}
function Re() {
	return !0;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/task.js
var ze = [];
function Be() {
	var e = ze;
	ze = [], f(e);
}
function Ve(e) {
	if (ze.length === 0 && !bt) {
		var t = ze;
		queueMicrotask(() => {
			t === ze && Be();
		});
	}
	ze.push(e);
}
function He() {
	for (; ze.length > 0;) Be();
}
function Ue(e) {
	var t = V;
	if (t === null) return B.f |= ie, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	We(e, t);
}
function We(e, t) {
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
var Ge = ~(g | _ | h);
function j(e, t) {
	e.f = e.f & Ge | t;
}
function Ke(e) {
	e.f & 512 || e.deps === null ? j(e, h) : j(e, _);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
function qe(e) {
	if (e !== null) for (let t of e) t.f & 2 && t.f & 65536 && (t.f ^= w, qe(t.deps));
}
function Je(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), qe(e.deps), j(e, h);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/store.js
var Ye = !1;
function Xe() {
	Ye || (Ye = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[de]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function Ze(e) {
	var t = B, n = V;
	jn(null), Mn(null);
	try {
		return e();
	} finally {
		jn(t), Mn(n);
	}
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function Qe(e) {
	let t = 0, n = Lt(0), r;
	return () => {
		sn() && (W(n), pn(() => (t === 0 && (r = Xn(() => e(() => Vt(n)))), t += 1, () => {
			Ve(() => {
				--t, t === 0 && (r?.(), r = void 0, Vt(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var $e = S | C;
function et(e, t, n, r) {
	new tt(e, t, n, r);
}
var tt = class {
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
	#h = Qe(() => (this.#m = Lt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = V;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = V.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = mn(() => {
			if (E) {
				let e = this.#t;
				Oe();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, $e), E && (this.#e = D);
	}
	#g() {
		try {
			this.#a = hn(() => this.#r(this.#e));
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		let t = this.#n.failed, { reset: n, invoke_onerror: r } = this.#v(e);
		Ve(r), t && (this.#s = hn(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			t ? Ee() : (t = !0, n && be(), this.#s !== null && xn(this.#s, () => {
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
					We(e, this.#i && this.#i.parent);
				}
			}
		};
	}
	#y() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = hn(() => e(this.#e)), Ve(() => {
			var e = this.#c = document.createDocumentFragment(), t = F();
			e.append(t), this.#a = this.#S(() => hn(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, xn(this.#o, () => {
				this.#o = null;
			}), this.#x(M));
		}));
	}
	#b() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#l = 0, this.#a = hn(() => {
				this.#r(this.#e);
			}), this.#u > 0) {
				var e = this.#c = document.createDocumentFragment();
				Tn(this.#a, e);
				let t = this.#n.pending;
				this.#o = hn(() => t(this.#e));
			} else this.#x(M);
		} catch (e) {
			this.error(e);
		}
	}
	#x(e) {
		this.is_pending = !1, e.transfer_effects(this.#f, this.#p);
	}
	defer_effect(e) {
		Je(e, this.#f, this.#p);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#n.pending;
	}
	#S(e) {
		var t = V, n = B, r = A;
		Mn(this.#i), jn(this.#i), Fe(this.#i.ctx);
		try {
			return Et.ensure(), e();
		} catch (e) {
			return Ue(e), null;
		} finally {
			Mn(t), jn(n), Fe(r);
		}
	}
	#C(e, t) {
		this.has_pending_snippet() ? (this.#u += e, this.#u === 0 && (this.#x(t), this.#o && xn(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null))) : this.parent && this.parent.#C(e, t);
	}
	update_pending_count(e, t) {
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, Ve(() => {
			this.#d = !1, this.#m && zt(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), W(this.#m);
	}
	error(e) {
		if (!this.#n.onerror && !this.#n.failed) throw e;
		M?.is_fork ? (this.#a && M.skip_effect(this.#a), this.#o && M.skip_effect(this.#o), this.#s && M.skip_effect(this.#s), M.oncommit(() => {
			this.#w(e);
		})) : this.#w(e);
	}
	#w(e) {
		this.#a &&= (z(this.#a), null), this.#o &&= (z(this.#o), null), this.#s &&= (z(this.#s), null), E && (O(this.#t), ke(), O(Ae()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return hn(() => {
						var r = V;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return We(e, this.#i.parent), null;
				}
			}));
		};
		Ve(() => {
			var t;
			try {
				t = this.transform_error(e);
			} catch (e) {
				We(e, this.#i && this.#i.parent);
				return;
			}
			typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => We(e, this.#i && this.#i.parent)) : n(t);
		});
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/async.js
function nt(e, t, n, r) {
	let i = Re() ? ot : ut;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = V, c = rt(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				We(e, s);
			}
			it();
		}
	}
	var d = at();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ ct(e))).then(u).catch((e) => We(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), it();
	}) : f();
}
function rt() {
	var e = V, t = B, n = A, r = M;
	return function(i = !0) {
		Mn(e), jn(t), Fe(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function it(e = !0) {
	Mn(null), jn(null), Fe(null), e && M?.deactivate();
}
function at() {
	var e = V, t = e.b, n = M, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function ot(e) {
	var t = 2 | g;
	return V !== null && (V.f |= C), {
		ctx: A,
		deps: null,
		effects: null,
		equals: Me,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v: T,
		wv: 0,
		parent: V,
		ac: null
	};
}
var st = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function ct(e, t, n) {
	let r = V;
	r === null && me();
	var i = void 0, a = Lt(T), o = !B, s = /* @__PURE__ */ new Set();
	return fn(() => {
		var t = V, n = p();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== fe && n.reject(e);
			}).finally(it);
		} catch (e) {
			n.reject(e), it();
		}
		var c = M;
		if (o) {
			if (t.f & 32768) var l = at();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(st);
			else for (let e of s.values()) e.reject(st);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== st && (c.activate(), t ? (a.f |= ie, zt(a, t)) : (a.f & 8388608 && (a.f ^= ie), zt(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), cn(() => {
		for (let e of s) e.reject(st);
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
function lt(e) {
	let t = /* @__PURE__ */ ot(e);
	return Pn(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function ut(e) {
	let t = /* @__PURE__ */ ot(e);
	return t.equals = Pe, t;
}
function dt(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) z(t[n]);
	}
}
function ft(e) {
	var t, n = V, r = e.parent;
	if (!On && r !== null && e.v !== T && r.f & 24576) return Ce(), e.v;
	Mn(r);
	try {
		e.f &= ~w, dt(e), t = Wn(e);
	} finally {
		Mn(n);
	}
	return t;
}
function pt(e) {
	var t = ft(e);
	!e.equals(t) && (e.wv = Vn(), (!M?.is_fork || e.deps === null) && (M === null ? e.v = t : (M.capture(e, t, !0), _t?.capture(e, t, !0)), e.deps === null)) ? j(e, h) : On || (vt === null ? Ke(e) : (sn() || M?.is_fork) && vt.set(e, t));
}
function mt(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && Ze(() => {
		t.ac.abort(fe), t.ac = null;
	}), t.fn !== null && (t.teardown = d), Kn(t, 0), _n(t));
}
function ht(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && qn(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
var gt = null, M = null, _t = null, vt = null, yt = null, bt = !1, xt = !1, St = null, Ct = null, wt = 0, Tt = 1, Et = class e {
	id = Tt++;
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
		gt === null ? gt = this : (gt.#n = this, this.#t = gt), gt = this;
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
			for (var r of n.d) j(r, g), t(r);
			for (r of n.m) j(r, _), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, wt++ > 1e3 && (this.#x(), Ot());
		for (let e of this.#u) this.#d.delete(e), j(e, g), this.schedule(e);
		for (let e of this.#d) j(e, _), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = St = [], r = [], i = Ct = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw Nt(e), this.#h() || this.discard(), t;
		}
		if (M = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (St = null, Ct = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) Mt(e, t);
			i.length > 0 && M.#g();
			return;
		}
		let o = this.#v();
		if (o) this.#b(r), this.#b(n), o.#y(this);
		else {
			this.#u.clear(), this.#d.clear();
			for (let e of this.#r) e(this);
			this.#r.clear(), _t = this, At(r), At(n), _t = null, this.#s?.resolve();
			var s = M;
			if (this.#a === 0 && (this.#c.length === 0 || s !== null) && this.#x(), this.#c.length > 0) {
				if (s !== null) {
					let e = s;
					e.#c.push(...this.#c.filter((t) => !e.#c.includes(t)));
				} else s = this;
			}
			s !== null && (Ft.clear(), s.#g());
		}
	}
	#_(e, t, n) {
		e.f ^= h;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= h : i & 4 ? t.push(r) : Hn(r) && (i & 16 && this.#d.add(r), qn(r));
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), j(i, g), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), M = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) Je(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== T && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), vt?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		M = this;
	}
	deactivate() {
		M = null, vt = null;
	}
	flush() {
		try {
			xt = !0, M = this, this.#g();
		} finally {
			wt = 0, yt = null, St = null, Ct = null, xt = !1, M = null, vt = null, Ft.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(st);
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
		this.#m || (this.#m = !0, Ve(() => {
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
		if (M === null) {
			let t = M = new e();
			!xt && !bt && Ve(() => {
				t.#e || t.flush();
			});
		}
		return M;
	}
	apply() {
		vt = null;
	}
	schedule(e) {
		if (yt = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) e.b.defer_effect(e);
		else {
			for (var t = e; t.parent !== null;) {
				t = t.parent;
				var n = t.f;
				if (St !== null && t === V && (B === null || !(B.f & 2))) return;
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
			e === null || (e.#n = t), t === null ? gt = e : t.#t = e, this.linked = !1;
		}
	}
};
function Dt(e) {
	var t = bt;
	bt = !0;
	try {
		var n;
		for (e && (M !== null && !M.is_fork && M.flush(), n = e());;) {
			if (He(), M === null) return n;
			M.flush();
		}
	} finally {
		bt = t;
	}
}
function Ot() {
	try {
		ge();
	} catch (e) {
		We(e, yt);
	}
}
var kt = null;
function At(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && Hn(r) && (kt = /* @__PURE__ */ new Set(), qn(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && bn(r), kt?.size > 0)) {
				Ft.clear();
				for (let e of kt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) kt.has(n) && (kt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || qn(n);
					}
				}
				kt.clear();
			}
		}
		kt = null;
	}
}
function jt(e) {
	M.schedule(e);
}
function Mt(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), j(e, h);
		for (var n = e.first; n !== null;) Mt(n, t), n = n.next;
	}
}
function Nt(e) {
	j(e, h);
	for (var t = e.first; t !== null;) Nt(t), t = t.next;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/sources.js
var Pt = /* @__PURE__ */ new Set(), Ft = /* @__PURE__ */ new Map(), It = !1;
function Lt(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: Me,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function N(e, t) {
	let n = Lt(e, t);
	return Pn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function Rt(e, t = !1, n = !0) {
	let r = Lt(e);
	return t || (r.equals = Pe), r;
}
function P(e, t, n = !1) {
	return B !== null && (!An || B.f & 131072) && Re() && B.f & 4325394 && (Nn === null || !Nn.has(e)) && ye(), zt(e, n ? Ut(t) : t, Ct);
}
function zt(e, t, n = null) {
	if (!e.equals(t)) {
		On ? Ft.set(e, t) : Ft.has(e) || Ft.set(e, e.v);
		var r = Et.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && ft(t), vt === null && Ke(t);
		}
		e.wv = Vn(), Ht(e, g, n), Re() && V !== null && V.f & 1024 && !(V.f & 96) && (Fn === null ? In([e]) : Fn.push(e)), !r.is_fork && Pt.size > 0 && !It && Bt();
	}
	return t;
}
function Bt() {
	It = !1;
	for (let e of Pt) {
		e.f & 1024 && j(e, _);
		let t;
		try {
			t = Hn(e);
		} catch {
			t = !0;
		}
		t && qn(e);
	}
	Pt.clear();
}
function Vt(e) {
	P(e, e.v + 1);
}
function Ht(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = Re(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (i || s !== V) {
			var l = (c & g) === 0;
			if (l && j(s, t), c & 131072) Pt.add(s);
			else if (c & 2) {
				var u = s;
				vt?.delete(u), c & 65536 || (c & 512 && (V === null || !(V.f & 2097152)) && (s.f |= w), Ht(u, _, n));
			} else if (l) {
				var d = s;
				c & 16 && kt !== null && kt.add(d), n === null ? jt(d) : n.push(d);
			}
		}
	}
}
function Ut(t) {
	if (typeof t != "object" || !t || ae in t) return t;
	let n = l(t);
	if (n !== s && n !== c) return t;
	var r = /* @__PURE__ */ new Map(), i = e(t), o = /* @__PURE__ */ N(0), u = null, d = zn, f = (e) => {
		if (zn === d) return e();
		var t = B, n = zn;
		jn(null), Bn(d);
		var r = e();
		return jn(t), Bn(n), r;
	};
	return i && r.set("length", /* @__PURE__ */ N(t.length, u)), new Proxy(t, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && _e();
			var i = r.get(t);
			return i === void 0 ? f(() => {
				var e = /* @__PURE__ */ N(n.value, u);
				return r.set(t, e), e;
			}) : P(i, n.value, !0), !0;
		},
		deleteProperty(e, t) {
			var n = r.get(t);
			if (n === void 0) {
				if (t in e) {
					let e = f(() => /* @__PURE__ */ N(T, u));
					r.set(t, e), Vt(o);
				}
			} else P(n, T), Vt(o);
			return !0;
		},
		get(e, n, i) {
			if (n === ae) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ N(Ut(s ? e[n] : T), u)), r.set(n, o)), o !== void 0) {
				var c = W(o);
				return c === T ? void 0 : c;
			}
			return Reflect.get(e, n, i);
		},
		getOwnPropertyDescriptor(e, t) {
			var n = Reflect.getOwnPropertyDescriptor(e, t);
			if (n && "value" in n) {
				var i = r.get(t);
				i && (n.value = W(i));
			} else if (n === void 0) {
				var a = r.get(t), o = a?.v;
				if (a !== void 0 && o !== T) return {
					enumerable: !0,
					configurable: !0,
					value: o,
					writable: !0
				};
			}
			return n;
		},
		has(e, t) {
			if (t === ae) return !0;
			var n = r.get(t), i = n !== void 0 && n.v !== T || Reflect.has(e, t);
			return (n !== void 0 || V !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ N(i ? Ut(e[t]) : T, u)), r.set(t, n)), W(n) === T) ? !1 : i;
		},
		set(e, t, n, s) {
			var c = r.get(t), l = t in e;
			if (i && t === "length") for (var d = n; d < c.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ N(T, u)), r.set(d + "", p)) : P(p, T);
			}
			if (c === void 0) (!l || a(e, t)?.writable) && (c = f(() => /* @__PURE__ */ N(void 0, u)), P(c, Ut(n)), r.set(t, c));
			else {
				l = c.v !== T;
				var m = f(() => Ut(n));
				P(c, m);
			}
			var h = Reflect.getOwnPropertyDescriptor(e, t);
			if (h?.set && h.set.call(s, n), !l) {
				if (i && typeof t == "string") {
					var g = r.get("length"), _ = Number(t);
					Number.isInteger(_) && _ >= g.v && P(g, _ + 1);
				}
				Vt(o);
			}
			return !0;
		},
		ownKeys(e) {
			W(o);
			var t = Reflect.ownKeys(e).filter((e) => {
				var t = r.get(e);
				return t === void 0 || t.v !== T;
			});
			for (var [n, i] of r) i.v !== T && !(n in e) && t.push(n);
			return t;
		},
		setPrototypeOf() {
			ve();
		}
	});
}
function Wt(e) {
	try {
		if (typeof e == "object" && e && ae in e) return e[ae];
	} catch {}
	return e;
}
function Gt(e, t) {
	return Object.is(Wt(e), Wt(t));
}
var Kt, qt, Jt, Yt;
function Xt() {
	if (Kt === void 0) {
		Kt = window, qt = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		Jt = a(t, "firstChild").get, Yt = a(t, "nextSibling").get, u(e) && (e[ce] = void 0, e[se] = null, e[le] = void 0, e.__e = void 0), u(n) && (n[ue] = void 0);
	}
}
function F(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function Zt(e) {
	return Jt.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function Qt(e) {
	return Yt.call(e);
}
function I(e, t) {
	if (!E) return /* @__PURE__ */ Zt(e);
	var n = /* @__PURE__ */ Zt(D);
	if (n === null) n = D.appendChild(F());
	else if (t && n.nodeType !== 3) {
		var r = F();
		return n?.before(r), O(r), r;
	}
	return t && rn(n), O(n), n;
}
function $t(e, t = !1) {
	if (!E) {
		var n = /* @__PURE__ */ Zt(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Qt(n) : n;
	}
	if (t) {
		if (D?.nodeType !== 3) {
			var r = F();
			return D?.before(r), O(r), r;
		}
		rn(D);
	}
	return D;
}
function L(e, t = 1, n = !1) {
	let r = E ? D : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ Qt(r);
	if (!E) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = F();
			return r === null ? i?.after(a) : r.before(a), O(a), a;
		}
		rn(r);
	}
	return O(r), r;
}
function en(e) {
	e.textContent = "";
}
function tn() {
	return !1;
}
function nn(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function rn(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/effects.js
function an(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function on(e, t) {
	var n = V;
	n !== null && n.f & 8192 && (e |= v);
	var r = {
		ctx: A,
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
	M?.register_created_effect(r);
	var i = r;
	if (e & 4) St === null ? Et.ensure().schedule(r) : St.push(r);
	else if (t !== null) {
		try {
			qn(r);
		} catch (e) {
			throw z(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= S));
	}
	if (i !== null && (i.parent = n, n !== null && an(i, n), B !== null && B.f & 2 && !(e & 64))) {
		var a = B;
		(a.effects ??= []).push(i);
	}
	return r;
}
function sn() {
	return B !== null && !An;
}
function cn(e) {
	let t = on(8, null);
	return j(t, h), t.teardown = e, t;
}
function ln(e) {
	return on(4 | ee, e);
}
function un(e) {
	Et.ensure();
	let t = on(64 | C, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? xn(t, () => {
			z(t), n(void 0);
		}) : (z(t), n(void 0));
	});
}
function dn(e) {
	return on(4, e);
}
function fn(e) {
	return on(re | C, e);
}
function pn(e, t = 0) {
	return on(8 | t, e);
}
function R(e, t = [], n = [], r = []) {
	nt(r, t, n, (t) => {
		on(8, () => {
			e(...t.map(W));
		});
	});
}
function mn(e, t = 0) {
	return on(16 | t, e);
}
function hn(e) {
	return on(32 | C, e);
}
function gn(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = On, n = B;
		kn(!0), jn(null);
		try {
			t.call(null);
		} finally {
			kn(e), jn(n);
		}
	}
}
function _n(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && Ze(() => {
			e.abort(fe);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : z(n, t), n = r;
	}
}
function vn(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || z(t), t = n;
	}
}
function z(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (yn(e.nodes.start, e.nodes.end), n = !0), e.f |= x, _n(e, t && !n), Kn(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	gn(e), e.f ^= x, e.f |= y;
	var i = e.parent;
	i !== null && i.first !== null && bn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function yn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ Qt(e);
		e.remove(), e = n;
	}
}
function bn(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function xn(e, t, n = !0) {
	var r = [];
	Sn(e, r, !0);
	var i = () => {
		n && z(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function Sn(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= v;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				Sn(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function Cn(e) {
	wn(e, !0);
}
function wn(e, t) {
	if (e.f & 8192) {
		e.f ^= v, e.f & 1024 || (j(e, g), Et.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = !!(n.f & 65536) || !!(n.f & 32);
			wn(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function Tn(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ Qt(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/legacy.js
var En = null, Dn = !1, On = !1;
function kn(e) {
	On = e;
}
var B = null, An = !1;
function jn(e) {
	B = e;
}
var V = null;
function Mn(e) {
	V = e;
}
var Nn = null;
function Pn(e) {
	B !== null && (Nn ??= /* @__PURE__ */ new Set()).add(e);
}
var H = null, U = 0, Fn = null;
function In(e) {
	Fn = e;
}
var Ln = 1, Rn = 0, zn = Rn;
function Bn(e) {
	zn = e;
}
function Vn() {
	return ++Ln;
}
function Hn(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~w), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (Hn(a) && pt(a), a.wv > e.wv) return !0;
		}
		t & 512 && vt === null && j(e, h);
	}
	return !1;
}
function Un(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Nn !== null && Nn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? Un(a, t, !1) : t === a && (n ? j(a, g) : a.f & 1024 && j(a, _), jt(a));
	}
}
function Wn(e) {
	var t = H, n = U, r = Fn, i = B, a = Nn, o = A, s = An, c = zn, l = e.f;
	H = null, U = 0, Fn = null, B = l & 96 ? null : e, Nn = null, Fe(e.ctx), An = !1, zn = ++Rn, e.ac !== null && (Ze(() => {
		e.ac.abort(fe);
	}), e.ac = null);
	try {
		e.f |= ne;
		var u = e.fn, d = u();
		e.f |= b;
		var f = e.deps, p = M?.is_fork;
		if (H !== null) {
			var m;
			if (p || Kn(e, U), f !== null && U > 0) for (f.length = U + H.length, m = 0; m < H.length; m++) f[U + m] = H[m];
			else e.deps = f = H;
			if (sn() && e.f & 512) for (m = U; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && U < f.length && (Kn(e, U), f.length = U);
		if (Re() && Fn !== null && !An && f !== null && !(e.f & 6146)) for (m = 0; m < Fn.length; m++) Un(Fn[m], e);
		if (i !== null && i !== e) {
			if (Rn++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = Rn;
			if (t !== null) for (let e of t) e.rv = Rn;
			Fn !== null && (r === null ? r = Fn : r.push(...Fn));
		}
		return e.f & 8388608 && (e.f ^= ie), d;
	} catch (e) {
		return Ue(e);
	} finally {
		e.f ^= ne, H = t, U = n, Fn = r, B = i, Nn = a, Fe(o), An = s, zn = c;
	}
}
function Gn(e, r) {
	let i = r.reactions;
	if (i !== null) {
		var a = t.call(i, e);
		if (a !== -1) {
			var o = i.length - 1;
			o === 0 ? i = r.reactions = null : (i[a] = i[o], i.pop());
		}
	}
	if (i === null && r.f & 2 && (H === null || !n.call(H, r))) {
		var s = r;
		s.f & 512 && (s.f ^= 512, s.f &= ~w), s.v !== T && Ke(s), s.ac !== null && Ze(() => {
			s.ac.abort(fe), s.ac = null, j(s, g);
		}), mt(s), Kn(s, 0);
	}
}
function Kn(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) Gn(e, n[r]);
}
function qn(e) {
	var t = e.f;
	if (!(t & 16384)) {
		j(e, h);
		var n = V, r = Dn;
		V = e, Dn = !(t & 96);
		try {
			t & 16777232 ? vn(e) : _n(e), gn(e);
			var i = Wn(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = Ln;
		} finally {
			Dn = r, V = n;
		}
	}
}
function W(e) {
	var t = !!(e.f & 2);
	if (En?.add(e), B !== null && !An && !(V !== null && V.f & 16384) && (Nn === null || !Nn.has(e))) {
		var r = B.deps;
		if (B.f & 2097152) e.rv < Rn && (e.rv = Rn, H === null && r !== null && r[U] === e ? U++ : H === null ? H = [e] : H.push(e));
		else {
			B.deps ??= [], n.call(B.deps, e) || B.deps.push(e);
			var i = e.reactions;
			i === null ? e.reactions = [B] : n.call(i, B) || i.push(B);
		}
	}
	if (On && Ft.has(e)) return Ft.get(e);
	if (t) {
		var a = e;
		if (On) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || Yn(a)) && (o = ft(a)), Ft.set(a, o), o;
		}
		var s = !(a.f & 512) && !An && B !== null && (Dn || !!(B.f & 512)), c = (a.f & b) === 0;
		Hn(a) && (s && (a.f |= 512), pt(a)), s && !c && (ht(a), Jn(a));
	}
	if (vt?.has(e)) return vt.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function Jn(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (ht(t), Jn(t));
}
function Yn(e) {
	if (e.v === T) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Ft.has(t) || t.f & 2 && Yn(t)) return !0;
	return !1;
}
function Xn(e) {
	var t = An;
	try {
		return An = !0, e();
	} finally {
		An = t;
	}
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var Zn = ["touchstart", "touchmove"];
function Qn(e) {
	return Zn.includes(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
var $n = Symbol("events"), er = /* @__PURE__ */ new Set(), tr = /* @__PURE__ */ new Set();
function nr(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || sr.call(t, e), !e.cancelBubble) return Ze(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Ve(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function rr(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = nr(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && cn(() => {
		t.removeEventListener(e, o, a);
	});
}
function G(e, t, n) {
	(t[$n] ??= {})[e] = n;
}
function ir(e) {
	for (var t = 0; t < e.length; t++) er.add(e[t]);
	for (var n of tr) n(e);
}
var ar = null, or = !1;
function sr(e) {
	var t = this, n = t.ownerDocument, r = e.type, a = e.composedPath?.() || [], o = a[0] || e.target;
	ar = e, or || (or = !0, setTimeout(() => {
		or = !1, ar = null;
	}));
	var s = 0, c = ar === e && e[$n];
	if (c) {
		var l = a.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[$n] = t;
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
		var d = B, f = V;
		jn(null), Mn(null);
		try {
			for (var p, m = []; o !== null && o !== t;) {
				try {
					var h = o[$n]?.[r];
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
			e[$n] = t, delete e.currentTarget, jn(d), Mn(f);
		}
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/reconciler.js
var cr = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function lr(e) {
	return cr?.createHTML(e) ?? e;
}
function ur(e) {
	var t = nn("template");
	return t.innerHTML = lr(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function dr(e, t) {
	var n = V;
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
		if (E) return dr(D, null), D;
		i === void 0 && (i = ur(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ Zt(i)));
		var t = r || qt ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ Zt(t), s = t.lastChild;
			dr(o, s);
		} else dr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function fr(e, t, n = "svg") {
	var r = !e.startsWith("<!>"), i = !!(t & 1), a = `<${n}>${r ? e : "<!>" + e}</${n}>`, o;
	return () => {
		if (E) return dr(D, null), D;
		if (!o) {
			var e = /* @__PURE__ */ Zt(ur(a));
			if (i) for (o = document.createDocumentFragment(); /* @__PURE__ */ Zt(e);) o.appendChild(/* @__PURE__ */ Zt(e));
			else o = /* @__PURE__ */ Zt(e);
		}
		var t = o.cloneNode(!0);
		if (i) {
			var n = /* @__PURE__ */ Zt(t), r = t.lastChild;
			dr(n, r);
		} else dr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function pr(e, t) {
	return /* @__PURE__ */ fr(e, t, "svg");
}
function mr() {
	if (E) return dr(D, null), D;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = F();
	return e.append(t, n), dr(t, n), e;
}
function q(e, t) {
	if (E) {
		var n = V;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = D), Oe();
	} else e !== null && e.before(t);
}
function J(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[ue] ??= e.nodeValue) && (e[ue] = n, e.nodeValue = `${n}`);
}
function hr(e, t) {
	return _r(e, t);
}
var gr = /* @__PURE__ */ new Map();
function _r(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	Xt();
	var l = void 0, u = un(() => {
		var s = n ?? t.appendChild(F());
		et(s, { pending: () => {} }, (t) => {
			Ie({});
			var n = A;
			if (o && (n.c = o), a && (i.$$events = a), E && dr(t, null), l = e(t, i) || {}, E && (V.nodes.end = D, D === null || D.nodeType !== 8 || D.data !== "]")) throw we(), xe;
			Le();
		}, c);
		var u = /* @__PURE__ */ new Set(), d = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!u.has(r)) {
					u.add(r);
					var i = Qn(r);
					for (let e of [t, document]) {
						var a = gr.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), gr.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, sr, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return d(r(er)), tr.add(d), () => {
			for (var e of u) for (let n of [t, document]) {
				var r = gr.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, sr), r.delete(e), r.size === 0 && gr.delete(n)) : r.set(e, i);
			}
			tr.delete(d), s !== n && s.parentNode?.removeChild(s);
		};
	});
	return vr.set(l, u), l;
}
var vr = /* @__PURE__ */ new WeakMap();
function yr(e, t) {
	let n = vr.get(e);
	return n ? (vr.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/branches.js
var br = class {
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
			if (n) Cn(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (Cn(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
			}
			for (let [t, n] of this.#e) {
				if (this.#e.delete(t), t === e) break;
				let r = this.#n.get(n);
				r && (z(r.effect), this.#n.delete(n));
			}
			for (let [e, r] of this.#t) {
				if (e === t || this.#r.has(e)) continue;
				let i = () => {
					if (Array.from(this.#e.values()).includes(e)) {
						var t = document.createDocumentFragment();
						Tn(r, t), t.append(F()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else z(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), xn(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (z(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = M, r = tn();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = F();
				i.append(a), this.#n.set(e, {
					effect: hn(() => t(a)),
					fragment: i
				});
			} else this.#t.set(e, hn(() => t(this.anchor)));
		}
		if (this.#e.set(n, e), r) {
			for (let [t, r] of this.#t) t === e ? n.unskip_effect(r) : n.skip_effect(r);
			for (let [t, r] of this.#n) t === e ? n.unskip_effect(r.effect) : n.skip_effect(r.effect);
			n.oncommit(this.#a), n.ondiscard(this.#o);
		} else E && (this.anchor = D), this.#a(n);
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
function Y(e, t, n = !1) {
	var r;
	E && (r = D, Oe());
	var i = new br(e), a = n ? S : 0;
	function o(e, t) {
		if (E) {
			var n = je(r);
			if (e !== parseInt(n.substring(1))) {
				var a = Ae();
				O(a), i.anchor = a, De(!1), i.ensure(e, t), De(!0);
				return;
			}
		}
		i.ensure(e, t);
	}
	mn(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
function xr(e, t, n) {
	for (var i = [], a = t.length, o, s = t.length, c = 0; c < a; c++) {
		let n = t[c];
		xn(n, () => {
			if (o) {
				if (o.pending.delete(n), o.done.add(n), o.pending.size === 0) {
					var t = e.outrogroups;
					Sr(e, r(o.done)), t.delete(o), t.size === 0 && (e.outrogroups = null);
				}
			} else --s;
		}, !1);
	}
	if (s === 0) {
		var l = i.length === 0 && n !== null && e.pending.size === 0;
		if (l) {
			var u = n, d = u.parentNode;
			en(d), d.append(u), e.items.clear();
		}
		Sr(e, t, !l);
	} else o = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(o);
}
function Sr(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= te, Tn(a, document.createDocumentFragment())) : z(t[i], n);
	}
}
var Cr;
function wr(t, n, i, a, o, s = null) {
	var c = t, l = /* @__PURE__ */ new Map();
	if (n & 4) {
		var u = t;
		c = E ? O(/* @__PURE__ */ Zt(u)) : u.appendChild(F());
	}
	E && Oe();
	var d = null, f = /* @__PURE__ */ ut(() => {
		var t = i();
		return e(t) ? t : t == null ? [] : r(t);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, Er(v, p, c, n, a), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= te, Or(d, null, c)) : Cn(d) : xn(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: mn(() => {
			p = W(f);
			var e = p.length;
			let t = !1;
			E && je(c) === "[!" != (e === 0) && (c = Ae(), O(c), De(!1), t = !0);
			for (var r = /* @__PURE__ */ new Set(), u = M, v = tn(), y = 0; y < e; y += 1) {
				E && D.nodeType === 8 && D.data === "]" && (c = D, t = !0, De(!1));
				var b = p[y], x = a(b, y), S = h ? null : l.get(x);
				S ? (S.v && zt(S.v, b), S.i && zt(S.i, y), v && u.unskip_effect(S.e)) : (S = Dr(l, h ? c : Cr ??= F(), b, x, y, o, n, i), h || (S.e.f |= te), l.set(x, S)), r.add(x);
			}
			if (e === 0 && s && !d && (h ? d = hn(() => s(c)) : (d = hn(() => s(Cr ??= F())), d.f |= te)), e > r.size && he("", "", ""), E && e > 0 && O(Ae()), !h) {
				if (m.set(u, r), v) {
					for (let [e, t] of l) r.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			t && De(!0), W(f);
		}),
		flags: n,
		items: l,
		pending: m,
		outrogroups: null,
		fallback: d
	};
	h = !1, E && (c = D);
}
function Tr(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function Er(e, t, n, i, a) {
	var o = !!(i & 8), s = t.length, c = e.items, l = Tr(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (o) for (v = 0; v < s; v += 1) h = t[v], g = a(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = a(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (Cn(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= te, _ === l) Or(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), kr(e, d, _), kr(e, _, y), Or(_, y, n), d = _, p = [], m = [], l = Tr(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], C = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) Or(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					kr(e, S.prev, C.next), kr(e, d, S), kr(e, C, b), l = b, d = C, --v, p = [], m = [];
				} else u.delete(_), Or(_, l, n), kr(e, _.prev, _.next), kr(e, _, d === null ? e.effect.first : d.next), kr(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = Tr(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = Tr(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (Sr(e, r(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var ee = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || ee.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && ee.push(l), l = Tr(l.next);
		var w = ee.length;
		if (w > 0) {
			var ne = i & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < w; v += 1) ee[v].nodes?.a?.measure();
				for (v = 0; v < w; v += 1) ee[v].nodes?.a?.fix();
			}
			xr(e, ee, ne);
		}
	}
	o && Ve(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Dr(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? Lt(n) : /* @__PURE__ */ Rt(n, !1, !1) : null, l = o & 2 ? Lt(i) : null;
	return {
		v: c,
		i: l,
		e: hn(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function Or(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ Qt(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function kr(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function Ar(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") {
		if (Array.isArray(e)) {
			var i = e.length;
			for (t = 0; t < i; t++) e[t] && (n = Ar(e[t])) && (r && (r += " "), r += n);
		} else for (n in e) e[n] && (r && (r += " "), r += n);
	}
	return r;
}
function jr() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = Ar(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/shared/attributes.js
function X(e) {
	return typeof e == "object" ? jr(e) : e ?? "";
}
var Mr = [..." 	\n\r\f\xA0\v﻿"];
function Nr(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || Mr.includes(r[o - 1])) && (s === r.length || Mr.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function Pr(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function Fr(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function Ir(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\/\*.*?\*\//g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(Fr)), i && c.push(...Object.keys(i).map(Fr));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = Fr(e.substring(l, u).trim());
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
		return r && (n += Pr(r)), i && (n += Pr(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/class.js
function Z(e, t, n, r, i, a) {
	var o = e[ce];
	if (E || o !== n || o === void 0) {
		var s = Nr(n, r, a);
		(!E || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[ce] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/style.js
function Lr(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function Rr(e, t, n, r) {
	var i = e[le];
	if (E || i !== t) {
		var a = Ir(t, r);
		(!E || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[le] = t;
	} else r && (Array.isArray(r) ? (Lr(e, n?.[0], r[0]), Lr(e, n?.[1], r[1], "important")) : Lr(e, n, r));
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function zr(t, n, r = !1) {
	if (t.multiple) {
		if (n == null) return;
		if (!e(n)) return Te();
		for (var i of t.options) i.selected = n.includes(Vr(i));
	} else {
		for (i of t.options) if (Gt(Vr(i), n)) {
			i.selected = !0;
			return;
		}
		(!r || n !== void 0) && (t.selectedIndex = -1);
	}
}
function Br(e) {
	var t = new MutationObserver(() => {
		"__value" in e && zr(e, e.__value);
	});
	t.observe(e, {
		childList: !0,
		subtree: !0,
		attributes: !0,
		attributeFilter: ["value"]
	}), cn(() => {
		t.disconnect();
	});
}
function Vr(e) {
	return "__value" in e ? e.__value : e.value;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var Hr = Symbol("is custom element"), Ur = Symbol("is html"), Wr = pe ? "link" : "LINK";
function Gr(e) {
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
		e[de] = n, Ve(n), Xe();
	}
}
function Kr(e, t) {
	var n = qr(e);
	n.checked !== (n.checked = t ?? void 0) && (e.checked = t);
}
function Q(e, t, n, r) {
	var i = qr(e);
	E && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === Wr) || i[t] !== (i[t] = n) && (t === "loading" && (e[oe] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Yr(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function qr(e) {
	return e[se] ??= {
		[Hr]: e.nodeName.includes("-"),
		[Ur]: e.namespaceURI === Se
	};
}
var Jr = /* @__PURE__ */ new Map();
function Yr(e) {
	var t = e.getAttribute("is") || e.nodeName, n = Jr.get(t);
	if (n) return n;
	Jr.set(t, n = []);
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var s in r = o(i), r) r[s].set && s !== "innerHTML" && s !== "textContent" && s !== "innerText" && n.push(s);
		i = l(i);
	}
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function Xr(e, t) {
	return e === t || e?.[ae] === t;
}
function $(e = {}, t, n, r) {
	var i = A.r, a = V;
	return dn(() => {
		var o, s;
		return pn(() => {
			o = s, s = r?.() || [], Xn(() => {
				Xr(n(...s), e) || (t(e, ...s), o && Xr(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && Xr(n(...s), e) && t(null, ...s);
			}, c = r.teardown;
			r.teardown = () => {
				o(), c?.();
			};
		};
	}), e;
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region ui/NodeCard.svelte
var Zr = /* @__PURE__ */ K("<span> </span>"), Qr = /* @__PURE__ */ K("<span class=\"pc-off-pill\">OFF</span>"), $r = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-node-action pc-help-btn fa-solid fa-circle-question\" title=\"How Deciders work\" aria-label=\"How Deciders work\"></button>"), ei = /* @__PURE__ */ K("<button type=\"button\"></button>"), ti = /* @__PURE__ */ K("<div class=\"pc-node-body\"> </div>"), ni = /* @__PURE__ */ K("<div> </div>"), ri = /* @__PURE__ */ K("<div><b> </b><span> </span></div>"), ii = /* @__PURE__ */ K("<div><!> <!></div>"), ai = /* @__PURE__ */ K("· <b> </b>", 1), oi = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-node-action pc-node-model pc-node-model-pick\"><i class=\"fa-solid fa-microchip\"></i> <!> <i class=\"fa-solid fa-caret-down pc-model-caret\"></i></button>"), si = /* @__PURE__ */ K("<div class=\"pc-node-model\"><i class=\"fa-solid fa-microchip\"></i> <!></div>"), ci = /* @__PURE__ */ K("<div><i></i> </div>"), li = /* @__PURE__ */ K("<span class=\"pc-port-keyname\"> </span>"), ui = /* @__PURE__ */ K("<i></i>"), di = /* @__PURE__ */ K("<div><!><!></div>"), fi = /* @__PURE__ */ K("<div role=\"group\"><div class=\"pc-node-head\"><span class=\"pc-badge\"><i></i> </span> <span class=\"pc-node-title\"> </span> <!> <!> <!> <!></div> <!> <!> <!> <!> <!></div>");
function pi(e, t) {
	Ie(t, !0);
	let n = (e) => e.stopPropagation();
	var r = fi();
	let i;
	var a = I(r), o = I(a), s = I(o), c = L(s);
	k(o);
	var l = L(o, 2), u = I(l, !0);
	k(l);
	var d = L(l, 2), f = (e) => {
		var n = Zr(), r = I(n, !0);
		k(n), R(() => {
			Z(n, 1, X(t.card.token.className)), Q(n, "title", t.card.token.title), J(r, t.card.token.text);
		}), q(e, n);
	};
	Y(d, (e) => {
		t.card.token && e(f);
	});
	var p = L(d, 2), m = (e) => {
		var n = Qr();
		R(() => Q(n, "title", t.card.offHint)), q(e, n);
	};
	Y(p, (e) => {
		t.card.offHint && e(m);
	});
	var h = L(p, 2), g = (e) => {
		var r = $r();
		G("mousedown", r, n), G("click", r, (e) => {
			n(e), t.actions.help(t.card.id);
		}), q(e, r);
	};
	Y(h, (e) => {
		t.card.help && e(g);
	});
	var _ = L(h, 2), v = (e) => {
		var r = ei();
		R(() => {
			Z(r, 1, `pc-node-action pc-toggle fa-solid ${t.card.enabled ? "fa-toggle-on pc-toggle-on" : "fa-toggle-off pc-toggle-off"}`), Q(r, "title", t.card.enabled ? "Switched on — click to switch off" : "Switched off — click to switch on"), Q(r, "aria-label", `Switch ${t.card.title} ${t.card.enabled ? "off" : "on"}`), Q(r, "aria-pressed", t.card.enabled);
		}), G("mousedown", r, n), G("click", r, (e) => {
			n(e), t.actions.toggle(t.card.id);
		}), q(e, r);
	};
	Y(_, (e) => {
		t.card.toggle && e(v);
	}), k(a);
	var y = L(a, 2), b = (e) => {
		var n = ti(), r = I(n, !0);
		k(n), R(() => J(r, t.card.body)), q(e, n);
	};
	Y(y, (e) => {
		t.card.body !== null && e(b);
	});
	var x = L(y, 2), S = (e) => {
		var n = ii(), r = I(n), i = (e) => {
			var n = ni(), r = I(n, !0);
			k(n), R(() => {
				Z(n, 1, X(t.card.mode.className)), J(r, t.card.mode.text);
			}), q(e, n);
		};
		Y(r, (e) => {
			t.card.mode && e(i);
		}), wr(L(r, 2), 17, () => t.card.rows, (e) => e.id, (e, t) => {
			var n = ri(), r = I(n), i = I(r, !0);
			k(r);
			var a = L(r), o = I(a, !0);
			k(a), k(n), R(() => {
				Z(n, 1, `pc-dec-key${W(t).chosen ? " pc-dec-chosen" : ""}${W(t).fallback ? " pc-dec-fallback" : ""}`), J(i, W(t).name), J(o, W(t).text);
			}), q(e, n);
		}), k(n), R(() => Z(n, 1, X(t.card.rowClass))), q(e, n);
	};
	Y(x, (e) => {
		t.card.body === null && e(S);
	});
	var C = L(x, 2), ee = (e) => {
		var r = mr(), i = $t(r), a = (e) => {
			var r = oi(), i = L(I(r)), a = L(i), o = (e) => {
				var n = ai(), r = L($t(n)), i = I(r, !0);
				k(r), R(() => J(i, t.card.model.actual)), q(e, n);
			};
			Y(a, (e) => {
				t.card.model.actual && e(o);
			}), ke(2), k(r), R(() => {
				Q(r, "title", t.card.model.title), J(i, ` ${t.card.model.where ?? ""}`);
			}), G("mousedown", r, n), G("dblclick", r, n), G("click", r, (e) => {
				n(e), t.actions.model(t.card.id, e.currentTarget);
			}), q(e, r);
		}, o = (e) => {
			var n = si(), r = L(I(n)), i = L(r), a = (e) => {
				var n = ai(), r = L($t(n)), i = I(r, !0);
				k(r), R(() => J(i, t.card.model.actual)), q(e, n);
			};
			Y(i, (e) => {
				t.card.model.actual && e(a);
			}), k(n), R(() => {
				Q(n, "title", t.card.model.title), J(r, ` ${t.card.model.where ?? ""}`);
			}), q(e, n);
		};
		Y(i, (e) => {
			t.card.model.pick ? e(a) : e(o, -1);
		}), q(e, r);
	};
	Y(C, (e) => {
		t.card.model && e(ee);
	});
	var te = L(C, 2);
	wr(te, 19, () => t.card.notices, (e, t) => `${e.className}:${t}`, (e, t) => {
		var n = ci(), r = I(n), i = L(r);
		k(n), R(() => {
			Z(n, 1, X(W(t).className)), Q(n, "title", W(t).title), Z(r, 1, `fa-solid ${W(t).icon}`), J(i, ` ${W(t).text ?? ""}`);
		}), q(e, n);
	}), wr(L(te, 2), 17, () => t.card.ports, (e) => e.id, (e, n) => {
		var r = di();
		let i;
		var a = I(r), o = (e) => {
			var t = li(), r = I(t, !0);
			k(t), R(() => J(r, W(n).label)), q(e, t);
		};
		Y(a, (e) => {
			W(n).label && e(o);
		});
		var s = L(a), c = (e) => {
			var t = ui();
			R(() => Z(t, 1, `fa-solid ${W(n).icon}`)), q(e, t);
		};
		Y(s, (e) => {
			W(n).icon && e(c);
		}), k(r), R(() => {
			Z(r, 1, X(W(n).className)), Q(r, "data-node", t.card.id), Q(r, "data-dir", W(n).dir), Q(r, "data-port", W(n).port), Q(r, "data-side", W(n).side), Q(r, "title", W(n).title), i = Rr(r, "", i, { left: W(n).left === void 0 ? void 0 : `${W(n).left}%` });
		}), q(e, r);
	}), k(r), R(() => {
		Z(r, 1, X(t.card.className)), Q(r, "data-id", t.card.id), Q(r, "title", t.card.hint), Q(r, "aria-label", `${t.card.label}: ${t.card.title}`), i = Rr(r, "", i, {
			left: `${t.card.x}px`,
			top: `${t.card.y}px`,
			width: `${t.card.w}px`
		}), Z(s, 1, `fa-solid ${t.card.icon} pc-badge-icon`), J(c, ` ${t.card.label ?? ""}`), Q(l, "title", t.card.titleHint), J(u, t.card.title);
	}), rr("mouseenter", r, () => t.actions.hover(t.card.id)), rr("mouseleave", r, () => t.actions.hover(null)), q(e, r), Le();
}
ir([
	"mousedown",
	"click",
	"dblclick"
]);
//#endregion
//#region ui/GroupCard.svelte
var mi = /* @__PURE__ */ K("<span class=\"pc-badge\"><i class=\"fa-solid fa-object-group pc-badge-icon\"></i> Group</span>"), hi = /* @__PURE__ */ K("<i class=\"fa-solid fa-object-group\"></i>"), gi = /* @__PURE__ */ K("<span class=\"pc-group-frame-count\"> </span>"), _i = /* @__PURE__ */ K("<span> </span>"), vi = /* @__PURE__ */ K("<span class=\"pc-off-pill\" title=\"This whole group is switched off. Nothing in it is sent, and nothing passes through it.\">OFF</span>"), yi = /* @__PURE__ */ K("<div class=\"pc-node-body\"> </div><div class=\"pc-node-model pc-group-io\"> </div> <div class=\"pc-node-cond\"> </div> <div class=\"pc-gport pc-gport-in\" data-gport=\"in\" title=\"Drag up to a block to wire it into this group\"></div> <div class=\"pc-gport pc-gport-out\" data-gport=\"out\" title=\"Drag to wire a block in this group into another block\"></div>", 1), bi = /* @__PURE__ */ K("<div class=\"pc-group-resize\" data-action=\"resize\" title=\"Drag to resize the blanket\"></div>"), xi = /* @__PURE__ */ K("<div role=\"group\"><div><!> <span> </span> <!> <!> <!> <button type=\"button\"></button> <button type=\"button\" data-action=\"toggle\" aria-label=\"Toggle group\"></button></div> <!></div>");
function Si(e, t) {
	Ie(t, !0);
	function n(e, n) {
		e.stopPropagation(), e.preventDefault(), t.actions.group(t.group.id, n);
	}
	function r(e, n) {
		e.stopPropagation(), e.detail === 0 && t.actions.group(t.group.id, n);
	}
	var i = xi();
	let a;
	var o = I(i), s = I(o), c = (e) => {
		q(e, mi());
	}, l = (e) => {
		q(e, hi());
	};
	Y(s, (e) => {
		t.group.collapsed ? e(c) : e(l, -1);
	});
	var u = L(s, 2), d = I(u, !0);
	k(u);
	var f = L(u, 2), p = (e) => {
		var n = gi(), r = I(n, !0);
		k(n), R(() => J(r, t.group.count)), q(e, n);
	};
	Y(f, (e) => {
		t.group.collapsed || e(p);
	});
	var m = L(f, 2), h = (e) => {
		var n = _i(), r = I(n, !0);
		k(n), R(() => {
			Z(n, 1, X(t.group.token.className)), Q(n, "title", t.group.token.title), J(r, t.group.token.text);
		}), q(e, n);
	};
	Y(m, (e) => {
		t.group.token && e(h);
	});
	var g = L(m, 2), _ = (e) => {
		q(e, vi());
	};
	Y(g, (e) => {
		t.group.enabled || e(_);
	});
	var v = L(g, 2), y = L(v, 2);
	k(o);
	var b = L(o, 2), x = (e) => {
		var n = yi(), r = $t(n), i = I(r, !0);
		k(r);
		var a = L(r), o = I(a, !0);
		k(a);
		var s = L(a, 2), c = I(s, !0);
		k(s);
		var l = L(s, 2), u = L(l, 2);
		R(() => {
			J(i, t.group.body), J(o, t.group.io), J(c, t.group.enabled ? "double-click to open" : "switched off — nothing goes through"), Q(l, "data-group", t.group.id), Q(u, "data-group", t.group.id);
		}), q(e, n);
	}, S = (e) => {
		q(e, bi());
	};
	Y(b, (e) => {
		t.group.collapsed ? e(x) : e(S, -1);
	}), k(i), R(() => {
		Z(i, 1, X(t.group.className)), Q(i, "data-group", t.group.id), Q(i, "aria-label", `Group: ${t.group.title}`), a = Rr(i, "", a, {
			left: `${t.group.x}px`,
			top: `${t.group.y}px`,
			width: `${t.group.w}px`,
			height: t.group.collapsed ? void 0 : `${t.group.h}px`
		}), Z(o, 1, X(t.group.collapsed ? "pc-node-head" : "pc-group-frame-head")), Z(u, 1, X(t.group.collapsed ? "pc-node-title" : "pc-group-frame-title")), J(d, t.group.title), Z(v, 1, `pc-node-action fa-solid pc-group-btn ${t.group.collapsed ? "fa-up-right-and-down-left-from-center" : "fa-down-left-and-up-right-to-center"}`), Q(v, "data-action", t.group.collapsed ? "open" : "collapse"), Q(v, "title", t.group.collapsed ? "Open the group as a blanket" : "Fold the group"), Q(v, "aria-label", t.group.collapsed ? "Open group" : "Fold group"), Z(y, 1, `pc-node-action pc-toggle fa-solid ${t.group.enabled ? "fa-toggle-on pc-toggle-on" : "fa-toggle-off pc-toggle-off"}`), Q(y, "title", t.group.enabled ? "Switch the whole group off" : "Switch the whole group on"), Q(y, "aria-pressed", t.group.enabled);
	}), G("mousedown", v, (e) => n(e, t.group.collapsed ? "open" : "collapse")), G("click", v, (e) => r(e, t.group.collapsed ? "open" : "collapse")), G("mousedown", y, (e) => n(e, "toggle")), G("click", y, (e) => r(e, "toggle")), q(e, i), Le();
}
ir(["mousedown", "click"]);
//#endregion
//#region ui/WireLayer.svelte
var Ci = /* @__PURE__ */ pr("<title> </title>"), wi = /* @__PURE__ */ pr("<path class=\"pc-wire-hit\"></path><path></path><text> <!></text>", 1), Ti = /* @__PURE__ */ pr("<path></path>"), Ei = /* @__PURE__ */ pr("<defs><marker viewBox=\"0 0 10 10\" refX=\"8\" refY=\"5\" markerWidth=\"7\" markerHeight=\"7\" orient=\"auto-start-reverse\"><path d=\"M 0 0 L 10 5 L 0 10 z\" class=\"pc-loop-arrow\"></path></marker></defs><!><!>", 1);
function Di(e, t) {
	Ie(t, !0);
	var n = Ei(), r = $t(n), i = I(r);
	k(r);
	var a = L(r);
	wr(a, 17, () => t.wires, (e) => e.id, (e, n) => {
		var r = wi(), i = $t(r), a = L(i), o = L(a), s = I(o, !0), c = L(s), l = (e) => {
			var t = Ci(), r = I(t, !0);
			k(t), R(() => J(r, W(n).label.title)), q(e, t);
		};
		Y(c, (e) => {
			W(n).label.title && e(l);
		}), k(o), R(() => {
			Q(i, "d", W(n).d), Q(i, "data-id", W(n).id), Q(a, "d", W(n).d), Z(a, 0, X(W(n).className)), Q(a, "data-id", W(n).id), Q(a, "marker-end", W(n).arrow ? `url(#${t.markerId})` : void 0), Q(o, "x", W(n).label.x), Q(o, "y", W(n).label.y), Z(o, 0, X(W(n).label.className)), Q(o, "data-id", W(n).label.id), Q(o, "text-anchor", W(n).label.anchor), J(s, W(n).label.text);
		}), q(e, r);
	});
	var o = L(a), s = (e) => {
		var n = Ti();
		R(() => {
			Q(n, "d", t.ghost.d), Z(n, 0, X(t.ghost.className));
		}), q(e, n);
	};
	Y(o, (e) => {
		t.ghost && e(s);
	}), R(() => Q(i, "id", t.markerId)), q(e, n), Le();
}
//#endregion
//#region ui/CanvasLayer.svelte
var Oi = /* @__PURE__ */ K("<div class=\"pc-viewport\" data-pc-renderer=\"svelte\"><svg class=\"pc-wires\" aria-label=\"Canvas connections\"><!></svg> <div class=\"pc-nodes\"><!> <!> <!></div></div>");
function ki(e, t) {
	Ie(t, !0);
	let n = /* @__PURE__ */ N([]), r = /* @__PURE__ */ N([]), i = /* @__PURE__ */ N([]), a = /* @__PURE__ */ N(null), o = /* @__PURE__ */ N({
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
		P(n, e);
	}
	function f(e) {
		P(r, e);
	}
	function p(e, t, n) {
		P(i, e), P(o, t), P(a, n);
	}
	function m(e, t) {
		let i = new Map(e.map((e) => [e.id, e])), a = new Map(t.map((e) => [e.id, e]));
		P(n, W(n).map((e) => i.has(e.id) ? {
			...e,
			...i.get(e.id)
		} : e)), P(r, W(r).map((e) => a.has(e.id) ? {
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
	}, g = Oi(), _ = I(g);
	Di(I(_), {
		get wires() {
			return W(i);
		},
		get markerId() {
			return t.markerId;
		},
		get ghost() {
			return W(a);
		}
	}), k(_), $(_, (e) => c = e, () => c);
	var v = L(_, 2), y = I(v);
	wr(y, 17, () => W(r).filter((e) => !e.collapsed), (e) => e.id, (e, n) => {
		Si(e, {
			get group() {
				return W(n);
			},
			get actions() {
				return t.actions;
			}
		});
	});
	var b = L(y, 2);
	return wr(b, 17, () => W(n), (e) => e.id, (e, n) => {
		pi(e, {
			get card() {
				return W(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), wr(L(b, 2), 17, () => W(r).filter((e) => e.collapsed), (e) => e.id, (e, n) => {
		Si(e, {
			get group() {
				return W(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), k(v), $(v, (e) => l = e, () => l), k(g), $(g, (e) => s = e, () => s), R(() => {
		Q(_, "width", W(o).w), Q(_, "height", W(o).h), Q(_, "viewBox", `0 0 ${W(o).w} ${W(o).h}`);
	}), q(e, g), Le(h);
}
//#endregion
//#region ui/Toolbar.svelte
var Ai = /* @__PURE__ */ K("<option> </option>"), ji = /* @__PURE__ */ K("<button type=\"button\"><i></i> </button>"), Mi = /* @__PURE__ */ K("<header class=\"pc-header\" data-pc-ui=\"svelte\"><div class=\"pc-brand\"><i class=\"fa-solid fa-diagram-project\"></i><span>Silly Canvas</span></div> <select class=\"pc-select pc-graph-select text_pole\" aria-label=\"Canvas\"></select> <div class=\"pc-header-actions pc-history\"><button type=\"button\" aria-label=\"Undo\">↶</button> <button type=\"button\" aria-label=\"Redo\">↷</button> <span> </span></div> <div class=\"pc-header-actions pc-document-actions\"><button type=\"button\" class=\"pc-btn menu_button\" title=\"New canvas\">+ New</button> <details class=\"pc-toolbar-menu\"><summary class=\"pc-btn menu_button\" aria-label=\"Canvas actions\">Canvas <span aria-hidden=\"true\">⌄</span></summary> <div class=\"pc-toolbar-menu-panel\"></div></details> <button type=\"button\" class=\"pc-btn menu_button\" title=\"Fit to view\">Fit</button> <button type=\"button\" class=\"pc-btn menu_button pc-theme-btn\" title=\"Theme and colours\"><i class=\"fa-solid fa-palette\"></i><span>Theme</span></button></div> <div class=\"pc-header-actions pc-surface-actions\"><button type=\"button\" title=\"Show or hide the library\" aria-label=\"Toggle library\"><i class=\"fa-solid fa-list-ul\"></i><span>Library</span></button> <button type=\"button\" title=\"Show or hide the inspector\" aria-label=\"Toggle inspector\"><i class=\"fa-solid fa-sliders\"></i><span>Inspector</span></button></div> <label class=\"pc-arm\"><input class=\"pc-arm-input\" type=\"checkbox\"/><span>Arm</span></label> <button type=\"button\" class=\"pc-btn menu_button pc-close\" title=\"Close\" aria-label=\"Close canvas\">×</button></header>");
function Ni(e, t) {
	Ie(t, !0);
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
	var l = { getParts: s }, u = Mi(), d = L(I(u), 2);
	wr(d, 21, () => t.state.graphs, (e) => e.id, (e, t) => {
		var n = Ai(), r = I(n, !0);
		k(n);
		var i = {};
		R(() => {
			J(r, W(t).name), i !== (i = W(t).id) && (n.value = (n.__value = W(t).id) ?? "");
		}), q(e, n);
	}), k(d), $(d, (e) => r = e, () => r);
	var f;
	Br(d);
	var p = L(d, 2), h = I(p), g = L(h, 2), _ = L(g, 2), v = I(_, !0);
	k(_), k(p);
	var y = L(p, 2), b = I(y), x = L(b, 2), S = L(I(x), 2);
	wr(S, 21, () => c, ([e, t, n]) => e, (e, n) => {
		var r = /* @__PURE__ */ lt(() => m(W(n), 3));
		let i = () => W(r)[0], a = () => W(r)[1], o = () => W(r)[2];
		var s = ji(), c = I(s), l = L(c);
		k(s), R(() => {
			Z(s, 1, `pc-btn menu_button${i() === "delete" ? " pc-danger" : ""}`), Q(s, "title", a()), Z(c, 1, `fa-solid ${o()}`), J(l, ` ${a() ?? ""}`);
		}), G("click", s, (e) => {
			t.actions.command(i()), e.currentTarget.closest("details")?.removeAttribute("open");
		}), q(e, s);
	}), k(S), k(x);
	var C = L(x, 2), ee = L(C, 2);
	k(y);
	var te = L(y, 2), w = I(te);
	$(w, (e) => a = e, () => a);
	var ne = L(w, 2);
	$(ne, (e) => o = e, () => o), k(te);
	var re = L(te, 2), ie = I(re);
	Gr(ie), $(ie, (e) => i = e, () => i), ke(), k(re);
	var ae = L(re, 2);
	return k(u), $(u, (e) => n = e, () => n), R(() => {
		f !== (f = t.state.graphId) && (d.value = (d.__value = t.state.graphId) ?? "", zr(d, t.state.graphId)), Z(h, 1, `pc-btn menu_button pc-undo${t.state.history.undo ? "" : " pc-disabled"}`), h.disabled = !t.state.history.undo, Q(h, "title", t.state.history.undoTitle), Z(g, 1, `pc-btn menu_button pc-redo${t.state.history.redo ? "" : " pc-disabled"}`), g.disabled = !t.state.history.redo, Q(g, "title", t.state.history.redoTitle), Z(_, 1, `pc-history-note${t.state.history.showNote ? " pc-show" : ""}`), J(v, t.state.history.note), Z(w, 1, `pc-btn menu_button pc-pane-toggle${t.state.sideOpen ? " pc-on" : ""}`), Q(w, "aria-pressed", t.state.sideOpen), Z(ne, 1, `pc-btn menu_button pc-pane-toggle${t.state.inspectorOpen ? " pc-on" : ""}`), Q(ne, "aria-pressed", t.state.inspectorOpen), Kr(ie, t.state.armed);
	}), G("change", d, (e) => t.actions.pickGraph(e.currentTarget.value)), G("click", h, () => t.actions.command("undo")), G("click", g, () => t.actions.command("redo")), G("click", b, () => t.actions.command("new")), G("click", C, () => t.actions.command("fit")), G("click", ee, () => t.actions.command("theme")), G("click", w, () => t.actions.command("sidebar")), G("click", ne, () => t.actions.command("inspector")), G("change", ie, (e) => t.actions.arm(e.currentTarget.checked)), G("click", ae, () => t.actions.command("close")), q(e, u), Le(l);
}
ir(["change", "click"]);
//#endregion
//#region ui/StatusBar.svelte
var Pi = /* @__PURE__ */ K("<button type=\"button\" class=\"pc-btn menu_button pc-primary\">Run this one instead</button>"), Fi = /* @__PURE__ */ K("<div class=\"pc-status\"><span> </span> <span aria-live=\"polite\"> </span> <!> <span class=\"pc-spacer\"></span> <button type=\"button\" class=\"pc-btn menu_button\"><i class=\"fa-solid fa-thumbtack\"></i> </button> <button type=\"button\" class=\"pc-btn menu_button\"><i class=\"fa-solid fa-user-pen\"></i> </button> <button type=\"button\" class=\"pc-btn menu_button\"><i class=\"fa-solid fa-star\"></i> </button> <button type=\"button\" class=\"pc-btn menu_button pc-primary\"><i class=\"fa-solid fa-eye\"></i> Preview prompt</button></div>");
function Ii(e, t) {
	Ie(t, !0);
	let n;
	function r() {
		return n;
	}
	var i = { getElement: r }, a = Fi(), o = I(a), s = I(o, !0);
	k(o);
	var c = L(o, 2), l = I(c, !0);
	k(c);
	var u = L(c, 2), d = (e) => {
		var n = Pi();
		R(() => Q(n, "title", t.status.overrideTitle)), G("click", n, function(...e) {
			t.actions.unpin?.apply(this, e);
		}), q(e, n);
	};
	Y(u, (e) => {
		t.status.warning && e(d);
	});
	var f = L(u, 4), p = L(I(f));
	k(f);
	var m = L(f, 2), h = L(I(m));
	k(m);
	var g = L(m, 2), _ = L(I(g));
	k(g);
	var v = L(g, 2);
	return k(a), $(a, (e) => n = e, () => n), R(() => {
		Z(o, 1, `pc-pill ${t.status.armed ? "pc-pill-on" : "pc-pill-off"}`), J(s, t.status.armed ? "Armed" : "Off"), Z(c, 1, `pc-status-text${t.status.warning ? " pc-status-warn" : ""}`), J(l, t.status.text), J(p, ` ${t.status.chatPinned ? "Unpin from chat" : "Pin to this chat"}`), Q(m, "title", t.status.charTitle), J(h, ` ${t.status.charPinned ? "Unpin from character" : "Pin to character"}`), J(_, ` ${t.status.isDefault ? "Default canvas" : "Make default"}`);
	}), G("click", f, function(...e) {
		t.actions.pinChat?.apply(this, e);
	}), G("click", m, function(...e) {
		t.actions.pinCharacter?.apply(this, e);
	}), G("click", g, function(...e) {
		t.actions.makeDefault?.apply(this, e);
	}), G("click", v, function(...e) {
		t.actions.preview?.apply(this, e);
	}), q(e, a), Le(i);
}
ir(["click"]);
//#endregion
//#region ui/CanvasControls.svelte
var Li = /* @__PURE__ */ K("<span class=\"pc-selection-count\"> </span>"), Ri = /* @__PURE__ */ K("<div class=\"pc-canvas-controls\" role=\"toolbar\" aria-label=\"Canvas tools\"><button type=\"button\" aria-label=\"Select tool\" title=\"Drag empty canvas to select blocks\">Select</button> <button type=\"button\" aria-label=\"Pan tool\" title=\"Drag anywhere to pan; hold Space for temporary pan\">Pan</button> <span class=\"pc-control-separator\"></span> <button type=\"button\" class=\"pc-btn\" aria-label=\"Zoom out\" title=\"Zoom out\">−</button> <output class=\"pc-zoom-readout\" aria-label=\"Canvas zoom\"> </output> <button type=\"button\" class=\"pc-btn\" aria-label=\"Zoom in\" title=\"Zoom in\">+</button> <button type=\"button\" class=\"pc-btn\" title=\"Fit selection (.)\" aria-label=\"Fit selection\">Fit</button> <!></div> <div class=\"pc-gesture-hint\">Drag to select · Shift adds · Alt removes · Space pans</div>", 1);
function zi(e, t) {
	Ie(t, !0);
	var n = Ri(), r = $t(n), i = I(r), a = L(i, 2), o = L(a, 4), s = L(o, 2), c = I(s);
	k(s);
	var l = L(s, 2), u = L(l, 2), d = L(u, 2), f = (e) => {
		var n = Li(), r = I(n);
		k(n), R(() => J(r, `${t.count ?? ""} selected`)), q(e, n);
	};
	Y(d, (e) => {
		t.count && e(f);
	}), k(r), ke(2), R((e) => {
		Z(i, 1, `pc-btn${t.camera.mode === "select" ? " pc-on" : ""}`), Q(i, "aria-pressed", t.camera.mode === "select"), Z(a, 1, `pc-btn${t.camera.mode === "pan" ? " pc-on" : ""}`), Q(a, "aria-pressed", t.camera.mode === "pan"), J(c, `${e ?? ""}%`);
	}, [() => Math.round(t.camera.zoom * 100)]), G("click", i, () => t.actions.mode("select")), G("click", a, () => t.actions.mode("pan")), G("click", o, () => t.actions.zoom(1 / 1.15)), G("click", l, () => t.actions.zoom(1.15)), G("click", u, function(...e) {
		t.actions.fitSelection?.apply(this, e);
	}), q(e, n), Le();
}
ir(["click"]);
//#endregion
//#region ui/DomainSurface.svelte
var Bi = /* @__PURE__ */ K("<div></div>");
function Vi(e, t) {
	Ie(t, !0);
	let n;
	function r() {
		return n;
	}
	var i = { getElement: r }, a = Bi();
	return $(a, (e) => n = e, () => n), R(() => {
		Z(a, 1, X(t.className)), Q(a, "aria-label", t.label);
	}), q(e, a), Le(i);
}
//#endregion
//#region ui/Workbench.svelte
var Hi = /* @__PURE__ */ K("<div class=\"pc-root\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Silly Canvas\" data-pc-workbench=\"svelte\"><!> <!> <div class=\"pc-body\"><!> <div class=\"pc-stage\"><div class=\"pc-canvas-area\"><div class=\"pc-canvas-host\" aria-label=\"Node canvas\"></div> <!></div> <!></div> <!></div></div>");
function Ui(e, t) {
	Ie(t, !0);
	let n = /* @__PURE__ */ N({
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
		P(n, {
			...W(n),
			...e
		});
	}
	var f = {
		getParts: u,
		update: d
	}, p = Hi(), m = I(p);
	$(Ni(m, {
		get state() {
			return W(n);
		},
		get actions() {
			return t.actions;
		}
	}), (e) => a = e, () => a);
	var h = L(m, 2);
	$(Ii(h, {
		get status() {
			return W(n).status;
		},
		get actions() {
			return t.actions;
		}
	}), (e) => o = e, () => o);
	var g = L(h, 2), _ = I(g);
	$(Vi(_, {
		className: "pc-sidebar",
		label: "Block library"
	}), (e) => s = e, () => s);
	var v = L(_, 2), y = I(v), b = I(y);
	return $(b, (e) => i = e, () => i), zi(L(b, 2), {
		get camera() {
			return W(n).camera;
		},
		get count() {
			return W(n).selectionCount;
		},
		get actions() {
			return t.actions;
		}
	}), k(y), $(Vi(L(y, 2), {
		className: "pc-preview",
		label: "Prompt preview"
	}), (e) => l = e, () => l), k(v), $(Vi(L(v, 2), {
		className: "pc-inspector",
		label: "Selection inspector"
	}), (e) => c = e, () => c), k(g), k(p), $(p, (e) => r = e, () => r), q(e, p), Le(f);
}
//#endregion
//#region ui/entry.js
var Wi = 0;
function Gi(e, t) {
	let n = hr(ki, {
		target: e,
		props: {
			actions: t,
			markerId: `pc-loop-arrow-${++Wi}`
		}
	});
	return Dt(), {
		...n.getLayers(),
		setNodes: (e) => Dt(() => n.setNodes(e)),
		setGroups: (e) => Dt(() => n.setGroups(e)),
		setWires: (e, t, r) => Dt(() => n.setWires(e, t, r)),
		setPositions: (e, t) => Dt(() => n.setPositions(e, t)),
		destroy: () => yr(n)
	};
}
function Ki(e, t) {
	let n = hr(Ui, {
		target: e,
		props: { actions: t }
	});
	return Dt(), {
		...n.getParts(),
		update: (e) => Dt(() => n.update(e)),
		destroy: () => yr(n)
	};
}
//#endregion
export { Gi as mountCanvas, Ki as mountWorkbench };
