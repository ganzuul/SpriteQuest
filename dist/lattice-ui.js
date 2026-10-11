/*! Svelte runtime: Copyright (c) 2016-2025 Svelte Contributors. MIT license; see THIRD_PARTY_NOTICES.md. */
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/shared/utils.js
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
var h = 1024, g = 2048, _ = 4096, v = 8192, y = 16384, b = 32768, x = 1 << 25, S = 65536, C = 1 << 19, w = 1 << 20, T = 1 << 25, E = 65536, D = 1 << 21, O = 1 << 22, k = 1 << 23, A = Symbol("$state"), j = Symbol("legacy props"), M = Symbol(""), ee = Symbol("attributes"), te = Symbol("class"), ne = Symbol("style"), re = Symbol("text"), ie = Symbol("form reset"), ae = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), oe = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml");
function se(e) {
	throw Error("https://svelte.dev/e/lifecycle_outside_component");
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/errors.js
function ce() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function le(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function ue(e) {
	throw Error("https://svelte.dev/e/effect_in_teardown");
}
function de() {
	throw Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function fe(e) {
	throw Error("https://svelte.dev/e/effect_orphan");
}
function pe() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function me(e) {
	throw Error("https://svelte.dev/e/props_invalid_value");
}
function he() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function ge() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function _e() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function ve() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/constants.js
var ye = {}, be = Symbol("uninitialized"), xe = "http://www.w3.org/1999/xhtml", Se = "http://www.w3.org/2000/svg", Ce = "http://www.w3.org/1998/Math/MathML";
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
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/hydration.js
var N = !1;
function Oe(e) {
	N = e;
}
var ke;
function Ae(e) {
	if (e === null) throw Te(), ye;
	return ke = e;
}
function je() {
	return Ae(/* @__PURE__ */ pn(ke));
}
function P(e) {
	if (N) {
		if (/* @__PURE__ */ pn(ke) !== null) throw Te(), ye;
		ke = e;
	}
}
function Me(e = 1) {
	if (N) {
		for (var t = e, n = ke; t--;) n = /* @__PURE__ */ pn(n);
		ke = n;
	}
}
function Ne(e = !0) {
	for (var t = 0, n = ke;;) {
		if (n.nodeType === 8) {
			var r = n.data;
			if (r === "]") {
				if (t === 0) return n;
				--t;
			} else (r === "[" || r === "[!" || r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
		}
		var i = /* @__PURE__ */ pn(n);
		e && n.remove(), n = i;
	}
}
function Pe(e) {
	if (!e || e.nodeType !== 8) throw Te(), ye;
	return e.data;
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/reactivity/equality.js
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
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/shared/clone.js
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
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/context.js
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
		r: Yn,
		l: null
	};
}
function We(e) {
	var t = Ve, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) wn(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, Ve = t.p, e ?? {};
}
function Ge() {
	return !0;
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/task.js
var Ke = [];
function qe() {
	var e = Ke;
	Ke = [], f(e);
}
function Je(e) {
	if (Ke.length === 0 && !Mt) {
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
	var t = Yn;
	if (t === null) return Kn.f |= k, e;
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
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/reactivity/status.js
var Qe = ~(g | _ | h);
function $e(e, t) {
	e.f = e.f & Qe | t;
}
function et(e) {
	e.f & 512 || e.deps === null ? $e(e, h) : $e(e, _);
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/reactivity/utils.js
function tt(e) {
	if (e !== null) for (let t of e) t.f & 2 && t.f & 65536 && (t.f ^= E, tt(t.deps));
}
function nt(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), tt(e.deps), $e(e, h);
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/reactivity/store.js
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
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/elements/misc.js
function at(e) {
	N && /* @__PURE__ */ fn(e) !== null && mn(e);
}
var ot = !1;
function st() {
	ot || (ot = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[ie]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function ct(e) {
	var t = Kn, n = Yn;
	Jn(null), Xn(null);
	try {
		return e();
	} finally {
		Jn(t), Xn(n);
	}
}
function lt(e, t, n, r = n) {
	e.addEventListener(t, () => ct(n));
	let i = e[ie];
	e[ie] = i ? () => {
		i(), r(!0);
	} : () => r(!0), st();
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/reactivity/create-subscriber.js
function ut(e) {
	let t = 0, n = Yt(0), r;
	return () => {
		xn() && (H(n), On(() => (t === 0 && (r = _r(() => e(() => $t(n)))), t += 1, () => {
			Je(() => {
				--t, t === 0 && (r?.(), r = void 0, $t(n));
			});
		})));
	};
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var dt = S | C;
function ft(e, t, n, r) {
	new pt(e, t, n, r);
}
var pt = class {
	parent;
	is_pending = !1;
	transform_error;
	#e;
	#t = N ? ke : null;
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
	#h = ut(() => (this.#m = Yt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = Yn;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = Yn.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = kn(() => {
			if (N) {
				let e = this.#t;
				je();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, dt), N && (this.#e = ke);
	}
	#g() {
		try {
			this.#a = An(() => this.#r(this.#e));
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		let t = this.#n.failed, { reset: n, invoke_onerror: r } = this.#v(e);
		Je(r), t && (this.#s = An(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			t ? De() : (t = !0, n && ve(), this.#s !== null && Ln(this.#s, () => {
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
		e && (this.is_pending = !0, this.#o = An(() => e(this.#e)), Je(() => {
			var e = this.#c = document.createDocumentFragment(), t = dn();
			e.append(t), this.#a = this.#S(() => An(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, Ln(this.#o, () => {
				this.#o = null;
			}), this.#x(Ot));
		}));
	}
	#b() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#l = 0, this.#a = An(() => {
				this.#r(this.#e);
			}), this.#u > 0) {
				var e = this.#c = document.createDocumentFragment();
				Vn(this.#a, e);
				let t = this.#n.pending;
				this.#o = An(() => t(this.#e));
			} else this.#x(Ot);
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
		var t = Yn, n = Kn, r = Ve;
		Xn(this.#i), Jn(this.#i), He(this.#i.ctx);
		try {
			return Rt.ensure(), e();
		} catch (e) {
			return Xe(e), null;
		} finally {
			Xn(t), Jn(n), He(r);
		}
	}
	#C(e, t) {
		this.has_pending_snippet() ? (this.#u += e, this.#u === 0 && (this.#x(t), this.#o && Ln(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null))) : this.parent && this.parent.#C(e, t);
	}
	update_pending_count(e, t) {
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, Je(() => {
			this.#d = !1, this.#m && Zt(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), H(this.#m);
	}
	error(e) {
		if (!this.#n.onerror && !this.#n.failed) throw e;
		Ot?.is_fork ? (this.#a && Ot.skip_effect(this.#a), this.#o && Ot.skip_effect(this.#o), this.#s && Ot.skip_effect(this.#s), Ot.oncommit(() => {
			this.#w(e);
		})) : this.#w(e);
	}
	#w(e) {
		this.#a &&= (Pn(this.#a), null), this.#o &&= (Pn(this.#o), null), this.#s &&= (Pn(this.#s), null), N && (Ae(this.#t), Me(), Ae(Ne()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return An(() => {
						var r = Yn;
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
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/reactivity/async.js
function mt(e, t, n, r) {
	let i = Ge() ? vt : xt;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = Yn, c = ht(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
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
	var e = Yn, t = Kn, n = Ve, r = Ot;
	return function(i = !0) {
		Xn(e), Jn(t), He(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function gt(e = !0) {
	Xn(null), Jn(null), He(null), e && Ot?.deactivate();
}
function _t() {
	var e = Yn, t = e.b, n = Ot, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function vt(e) {
	var t = 2 | g;
	return Yn !== null && (Yn.f |= C), {
		ctx: Ve,
		deps: null,
		effects: null,
		equals: Fe,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v: be,
		wv: 0,
		parent: Yn,
		ac: null
	};
}
var yt = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function bt(e, t, n) {
	let r = Yn;
	r === null && ce();
	var i = void 0, a = Yt(be), o = !Kn, s = /* @__PURE__ */ new Set();
	return Dn(() => {
		var t = Yn, n = p();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== ae && n.reject(e);
			}).finally(gt);
		} catch (e) {
			n.reject(e), gt();
		}
		var c = Ot;
		if (o) {
			if (t.f & 32768) var l = _t();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(yt);
			else for (let e of s.values()) e.reject(yt);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== yt && (c.activate(), t ? (a.f |= k, Zt(a, t)) : (a.f & 8388608 && (a.f ^= k), Zt(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), Sn(() => {
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
	return Qn(t), t;
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
		for (var n = 0; n < t.length; n += 1) Pn(t[n]);
	}
}
function Ct(e) {
	var t, n = Yn, r = e.parent;
	if (!Wn && r !== null && e.v !== be && r.f & 24576) return we(), e.v;
	Xn(r);
	try {
		e.f &= ~E, St(e), t = ur(e);
	} finally {
		Xn(n);
	}
	return t;
}
function wt(e) {
	var t = Ct(e);
	!e.equals(t) && (e.wv = sr(), (!Ot?.is_fork || e.deps === null) && (Ot === null ? e.v = t : (Ot.capture(e, t, !0), kt?.capture(e, t, !0)), e.deps === null)) ? $e(e, h) : Wn || (At === null ? et(e) : (xn() || Ot?.is_fork) && At.set(e, t));
}
function Tt(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && ct(() => {
		t.ac.abort(ae), t.ac = null;
	}), t.fn !== null && (t.teardown = d), fr(t, 0), Mn(t));
}
function Et(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && pr(t);
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/reactivity/batch.js
var Dt = null, Ot = null, kt = null, At = null, jt = null, Mt = !1, Nt = !1, Pt = null, Ft = null, It = 0, Lt = 1, Rt = class e {
	id = Lt++;
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
		this.#e = !0, It++ > 1e3 && (this.#x(), Bt());
		for (let e of this.#u) this.#d.delete(e), $e(e, g), this.schedule(e);
		for (let e of this.#d) $e(e, _), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = Pt = [], r = [], i = Ft = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw Gt(e), this.#h() || this.discard(), t;
		}
		if (Ot = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (Pt = null, Ft = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) Wt(e, t);
			i.length > 0 && Ot.#g();
			return;
		}
		let o = this.#v();
		if (o) this.#b(r), this.#b(n), o.#y(this);
		else {
			this.#u.clear(), this.#d.clear();
			for (let e of this.#r) e(this);
			this.#r.clear(), kt = this, Ht(r), Ht(n), kt = null, this.#s?.resolve();
			var s = Ot;
			if (this.#a === 0 && (this.#c.length === 0 || s !== null) && this.#x(), this.#c.length > 0) {
				if (s !== null) {
					let e = s;
					e.#c.push(...this.#c.filter((t) => !e.#c.includes(t)));
				} else s = this;
			}
			s !== null && (qt.clear(), s.#g());
		}
	}
	#_(e, t, n) {
		e.f ^= h;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= h : i & 4 ? t.push(r) : cr(r) && (i & 16 && this.#d.add(r), pr(r));
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
		this.oncommit(() => e.discard()), e.#x(), Ot = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) nt(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== be && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), At?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		Ot = this;
	}
	deactivate() {
		Ot = null, At = null;
	}
	flush() {
		try {
			Nt = !0, Ot = this, this.#g();
		} finally {
			It = 0, jt = null, Pt = null, Ft = null, Nt = !1, Ot = null, At = null, qt.clear();
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
		if (Ot === null) {
			let t = Ot = new e();
			!Nt && !Mt && Je(() => {
				t.#e || t.flush();
			});
		}
		return Ot;
	}
	apply() {
		At = null;
	}
	schedule(e) {
		if (jt = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) e.b.defer_effect(e);
		else {
			for (var t = e; t.parent !== null;) {
				t = t.parent;
				var n = t.f;
				if (Pt !== null && t === Yn && (Kn === null || !(Kn.f & 2))) return;
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
function zt(e) {
	var t = Mt;
	Mt = !0;
	try {
		var n;
		for (e && (Ot !== null && !Ot.is_fork && Ot.flush(), n = e());;) {
			if (Ye(), Ot === null) return n;
			Ot.flush();
		}
	} finally {
		Mt = t;
	}
}
function Bt() {
	try {
		pe();
	} catch (e) {
		Ze(e, jt);
	}
}
var Vt = null;
function Ht(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && cr(r) && (Vt = /* @__PURE__ */ new Set(), pr(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && In(r), Vt?.size > 0)) {
				qt.clear();
				for (let e of Vt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) Vt.has(n) && (Vt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || pr(n);
					}
				}
				Vt.clear();
			}
		}
		Vt = null;
	}
}
function Ut(e) {
	Ot.schedule(e);
}
function Wt(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), $e(e, h);
		for (var n = e.first; n !== null;) Wt(n, t), n = n.next;
	}
}
function Gt(e) {
	$e(e, h);
	for (var t = e.first; t !== null;) Gt(t), t = t.next;
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/reactivity/sources.js
var Kt = /* @__PURE__ */ new Set(), qt = /* @__PURE__ */ new Map(), Jt = !1;
function Yt(e, t) {
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
function I(e, t) {
	let n = Yt(e, t);
	return Qn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function Xt(e, t = !1, n = !0) {
	let r = Yt(e);
	return t || (r.equals = Le), r;
}
function L(e, t, n = !1) {
	return Kn !== null && (!qn || Kn.f & 131072) && Ge() && Kn.f & 4325394 && (Zn === null || !Zn.has(e)) && _e(), Zt(e, n ? tn(t) : t, Ft);
}
function Zt(e, t, n = null) {
	if (!e.equals(t)) {
		Wn ? qt.set(e, t) : qt.has(e) || qt.set(e, e.v);
		var r = Rt.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && Ct(t), At === null && et(t);
		}
		e.wv = sr(), en(e, g, n), Ge() && Yn !== null && Yn.f & 1024 && !(Yn.f & 96) && (tr === null ? nr([e]) : tr.push(e)), !r.is_fork && Kt.size > 0 && !Jt && Qt();
	}
	return t;
}
function Qt() {
	Jt = !1;
	for (let e of Kt) {
		e.f & 1024 && $e(e, _);
		let t;
		try {
			t = cr(e);
		} catch {
			t = !0;
		}
		t && pr(e);
	}
	Kt.clear();
}
function $t(e) {
	L(e, e.v + 1);
}
function en(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = Ge(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (i || s !== Yn) {
			var l = (c & g) === 0;
			if (l && $e(s, t), c & 131072) Kt.add(s);
			else if (c & 2) {
				var u = s;
				At?.delete(u), c & 65536 || (c & 512 && (Yn === null || !(Yn.f & 2097152)) && (s.f |= E), en(u, _, n));
			} else if (l) {
				var d = s;
				c & 16 && Vt !== null && Vt.add(d), n === null ? Ut(d) : n.push(d);
			}
		}
	}
}
function tn(t) {
	if (typeof t != "object" || !t || A in t) return t;
	let n = l(t);
	if (n !== s && n !== c) return t;
	var r = /* @__PURE__ */ new Map(), i = e(t), o = /* @__PURE__ */ I(0), u = null, d = ar, f = (e) => {
		if (ar === d) return e();
		var t = Kn, n = ar;
		Jn(null), or(d);
		var r = e();
		return Jn(t), or(n), r;
	};
	return i && r.set("length", /* @__PURE__ */ I(t.length, u)), new Proxy(t, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && he();
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
					let e = f(() => /* @__PURE__ */ I(be, u));
					r.set(t, e), $t(o);
				}
			} else L(n, be), $t(o);
			return !0;
		},
		get(e, n, i) {
			if (n === A) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ I(tn(s ? e[n] : be), u)), r.set(n, o)), o !== void 0) {
				var c = H(o);
				return c === be ? void 0 : c;
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
				if (a !== void 0 && o !== be) return {
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
			var n = r.get(t), i = n !== void 0 && n.v !== be || Reflect.has(e, t);
			return (n !== void 0 || Yn !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ I(i ? tn(e[t]) : be, u)), r.set(t, n)), H(n) === be) ? !1 : i;
		},
		set(e, t, n, s) {
			var c = r.get(t), l = t in e;
			if (i && t === "length") for (var d = n; d < c.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ I(be, u)), r.set(d + "", p)) : L(p, be);
			}
			if (c === void 0) (!l || a(e, t)?.writable) && (c = f(() => /* @__PURE__ */ I(void 0, u)), L(c, tn(n)), r.set(t, c));
			else {
				l = c.v !== be;
				var m = f(() => tn(n));
				L(c, m);
			}
			var h = Reflect.getOwnPropertyDescriptor(e, t);
			if (h?.set && h.set.call(s, n), !l) {
				if (i && typeof t == "string") {
					var g = r.get("length"), _ = Number(t);
					Number.isInteger(_) && _ >= g.v && L(g, _ + 1);
				}
				$t(o);
			}
			return !0;
		},
		ownKeys(e) {
			H(o);
			var t = Reflect.ownKeys(e).filter((e) => {
				var t = r.get(e);
				return t === void 0 || t.v !== be;
			});
			for (var [n, i] of r) i.v !== be && !(n in e) && t.push(n);
			return t;
		},
		setPrototypeOf() {
			ge();
		}
	});
}
function nn(e) {
	try {
		if (typeof e == "object" && e && A in e) return e[A];
	} catch {}
	return e;
}
function rn(e, t) {
	return Object.is(nn(e), nn(t));
}
var an, on, sn, cn, ln;
function un() {
	if (an === void 0) {
		an = window, on = document, sn = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		cn = a(t, "firstChild").get, ln = a(t, "nextSibling").get, u(e) && (e[te] = void 0, e[ee] = null, e[ne] = void 0, e.__e = void 0), u(n) && (n[re] = void 0);
	}
}
function dn(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function fn(e) {
	return cn.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function pn(e) {
	return ln.call(e);
}
function R(e, t) {
	if (!N) return /* @__PURE__ */ fn(e);
	var n = /* @__PURE__ */ fn(ke);
	if (n === null) n = ke.appendChild(dn());
	else if (t && n.nodeType !== 3) {
		var r = dn();
		return n?.before(r), Ae(r), r;
	}
	return t && _n(n), Ae(n), n;
}
function z(e, t = !1) {
	if (!N) {
		var n = /* @__PURE__ */ fn(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ pn(n) : n;
	}
	if (t) {
		if (ke?.nodeType !== 3) {
			var r = dn();
			return ke?.before(r), Ae(r), r;
		}
		_n(ke);
	}
	return ke;
}
function B(e, t = 1, n = !1) {
	let r = N ? ke : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ pn(r);
	if (!N) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = dn();
			return r === null ? i?.after(a) : r.before(a), Ae(a), a;
		}
		_n(r);
	}
	return Ae(r), r;
}
function mn(e) {
	e.textContent = "";
}
function hn() {
	return !1;
}
function gn(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function _n(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/reactivity/effects.js
function vn(e) {
	Yn === null && (Kn === null && fe(e), de()), Wn && ue(e);
}
function yn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function bn(e, t) {
	var n = Yn;
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
	Ot?.register_created_effect(r);
	var i = r;
	if (e & 4) Pt === null ? Rt.ensure().schedule(r) : Pt.push(r);
	else if (t !== null) {
		try {
			pr(r);
		} catch (e) {
			throw Pn(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= S));
	}
	if (i !== null && (i.parent = n, n !== null && yn(i, n), Kn !== null && Kn.f & 2 && !(e & 64))) {
		var a = Kn;
		(a.effects ??= []).push(i);
	}
	return r;
}
function xn() {
	return Kn !== null && !qn;
}
function Sn(e) {
	let t = bn(8, null);
	return $e(t, h), t.teardown = e, t;
}
function Cn(e) {
	vn("$effect");
	var t = Yn.f;
	if (!Kn && t & 32 && Ve !== null && !Ve.i) {
		var n = Ve;
		(n.e ??= []).push(e);
	} else return wn(e);
}
function wn(e) {
	return bn(4 | w, e);
}
function Tn(e) {
	Rt.ensure();
	let t = bn(64 | C, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? Ln(t, () => {
			Pn(t), n(void 0);
		}) : (Pn(t), n(void 0));
	});
}
function En(e) {
	return bn(4, e);
}
function Dn(e) {
	return bn(O | C, e);
}
function On(e, t = 0) {
	return bn(8 | t, e);
}
function V(e, t = [], n = [], r = []) {
	mt(r, t, n, (t) => {
		bn(8, () => {
			e(...t.map(H));
		});
	});
}
function kn(e, t = 0) {
	return bn(16 | t, e);
}
function An(e) {
	return bn(32 | C, e);
}
function jn(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = Wn, n = Kn;
		Gn(!0), Jn(null);
		try {
			t.call(null);
		} finally {
			Gn(e), Jn(n);
		}
	}
}
function Mn(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && ct(() => {
			e.abort(ae);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : Pn(n, t), n = r;
	}
}
function Nn(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || Pn(t), t = n;
	}
}
function Pn(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (Fn(e.nodes.start, e.nodes.end), n = !0), e.f |= x, Mn(e, t && !n), fr(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	jn(e), e.f ^= x, e.f |= y;
	var i = e.parent;
	i !== null && i.first !== null && In(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Fn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ pn(e);
		e.remove(), e = n;
	}
}
function In(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Ln(e, t, n = !0) {
	var r = [];
	Rn(e, r, !0);
	var i = () => {
		n && Pn(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function Rn(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= v;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				Rn(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function zn(e) {
	Bn(e, !0);
}
function Bn(e, t) {
	if (e.f & 8192) {
		e.f ^= v, e.f & 1024 || ($e(e, g), Rt.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = !!(n.f & 65536) || !!(n.f & 32);
			Bn(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function Vn(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ pn(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/legacy.js
var Hn = null, Un = !1, Wn = !1;
function Gn(e) {
	Wn = e;
}
var Kn = null, qn = !1;
function Jn(e) {
	Kn = e;
}
var Yn = null;
function Xn(e) {
	Yn = e;
}
var Zn = null;
function Qn(e) {
	Kn !== null && (Zn ??= /* @__PURE__ */ new Set()).add(e);
}
var $n = null, er = 0, tr = null;
function nr(e) {
	tr = e;
}
var rr = 1, ir = 0, ar = ir;
function or(e) {
	ar = e;
}
function sr() {
	return ++rr;
}
function cr(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~E), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (cr(a) && wt(a), a.wv > e.wv) return !0;
		}
		t & 512 && At === null && $e(e, h);
	}
	return !1;
}
function lr(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Zn !== null && Zn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? lr(a, t, !1) : t === a && (n ? $e(a, g) : a.f & 1024 && $e(a, _), Ut(a));
	}
}
function ur(e) {
	var t = $n, n = er, r = tr, i = Kn, a = Zn, o = Ve, s = qn, c = ar, l = e.f;
	$n = null, er = 0, tr = null, Kn = l & 96 ? null : e, Zn = null, He(e.ctx), qn = !1, ar = ++ir, e.ac !== null && (ct(() => {
		e.ac.abort(ae);
	}), e.ac = null);
	try {
		e.f |= D;
		var u = e.fn, d = u();
		e.f |= b;
		var f = e.deps, p = Ot?.is_fork;
		if ($n !== null) {
			var m;
			if (p || fr(e, er), f !== null && er > 0) for (f.length = er + $n.length, m = 0; m < $n.length; m++) f[er + m] = $n[m];
			else e.deps = f = $n;
			if (xn() && e.f & 512) for (m = er; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && er < f.length && (fr(e, er), f.length = er);
		if (Ge() && tr !== null && !qn && f !== null && !(e.f & 6146)) for (m = 0; m < tr.length; m++) lr(tr[m], e);
		if (i !== null && i !== e) {
			if (ir++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = ir;
			if (t !== null) for (let e of t) e.rv = ir;
			tr !== null && (r === null ? r = tr : r.push(...tr));
		}
		return e.f & 8388608 && (e.f ^= k), d;
	} catch (e) {
		return Xe(e);
	} finally {
		e.f ^= D, $n = t, er = n, tr = r, Kn = i, Zn = a, He(o), qn = s, ar = c;
	}
}
function dr(e, r) {
	let i = r.reactions;
	if (i !== null) {
		var a = t.call(i, e);
		if (a !== -1) {
			var o = i.length - 1;
			o === 0 ? i = r.reactions = null : (i[a] = i[o], i.pop());
		}
	}
	if (i === null && r.f & 2 && ($n === null || !n.call($n, r))) {
		var s = r;
		s.f & 512 && (s.f ^= 512, s.f &= ~E), s.v !== be && et(s), s.ac !== null && ct(() => {
			s.ac.abort(ae), s.ac = null, $e(s, g);
		}), Tt(s), fr(s, 0);
	}
}
function fr(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) dr(e, n[r]);
}
function pr(e) {
	var t = e.f;
	if (!(t & 16384)) {
		$e(e, h);
		var n = Yn, r = Un;
		Yn = e, Un = !(t & 96);
		try {
			t & 16777232 ? Nn(e) : Mn(e), jn(e);
			var i = ur(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = rr;
		} finally {
			Un = r, Yn = n;
		}
	}
}
async function mr() {
	await Promise.resolve(), zt();
}
function H(e) {
	var t = !!(e.f & 2);
	if (Hn?.add(e), Kn !== null && !qn && !(Yn !== null && Yn.f & 16384) && (Zn === null || !Zn.has(e))) {
		var r = Kn.deps;
		if (Kn.f & 2097152) e.rv < ir && (e.rv = ir, $n === null && r !== null && r[er] === e ? er++ : $n === null ? $n = [e] : $n.push(e));
		else {
			Kn.deps ??= [], n.call(Kn.deps, e) || Kn.deps.push(e);
			var i = e.reactions;
			i === null ? e.reactions = [Kn] : n.call(i, Kn) || i.push(Kn);
		}
	}
	if (Wn && qt.has(e)) return qt.get(e);
	if (t) {
		var a = e;
		if (Wn) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || gr(a)) && (o = Ct(a)), qt.set(a, o), o;
		}
		var s = !(a.f & 512) && !qn && Kn !== null && (Un || !!(Kn.f & 512)), c = (a.f & b) === 0;
		cr(a) && (s && (a.f |= 512), wt(a)), s && !c && (Et(a), hr(a));
	}
	if (At?.has(e)) return At.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function hr(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (Et(t), hr(t));
}
function gr(e) {
	if (e.v === be) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (qt.has(t) || t.f & 2 && gr(t)) return !0;
	return !1;
}
function _r(e) {
	var t = qn;
	try {
		return qn = !0, e();
	} finally {
		qn = t;
	}
}
function vr(e) {
	if (!(typeof e != "object" || !e || e instanceof EventTarget)) {
		if (A in e) yr(e);
		else if (!Array.isArray(e)) for (let t in e) {
			let n = e[t];
			typeof n == "object" && n && A in n && yr(n);
		}
	}
}
function yr(e, t = /* @__PURE__ */ new Set()) {
	if (typeof e == "object" && e && !(e instanceof EventTarget) && !t.has(e)) {
		t.add(e), e instanceof Date && e.getTime();
		for (let n in e) try {
			yr(e[n], t);
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
var br = ["touchstart", "touchmove"];
function xr(e) {
	return br.includes(e);
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/elements/events.js
var Sr = Symbol("events"), Cr = /* @__PURE__ */ new Set(), wr = /* @__PURE__ */ new Set();
function Tr(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || kr.call(t, e), !e.cancelBubble) return ct(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Je(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function U(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = Tr(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && Sn(() => {
		t.removeEventListener(e, o, a);
	});
}
function W(e, t, n) {
	(t[Sr] ??= {})[e] = n;
}
function Er(e) {
	for (var t = 0; t < e.length; t++) Cr.add(e[t]);
	for (var n of wr) n(e);
}
var Dr = null, Or = !1;
function kr(e) {
	var t = this, n = t.ownerDocument, r = e.type, a = e.composedPath?.() || [], o = a[0] || e.target;
	Dr = e, Or || (Or = !0, setTimeout(() => {
		Or = !1, Dr = null;
	}));
	var s = 0, c = Dr === e && e[Sr];
	if (c) {
		var l = a.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[Sr] = t;
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
		var d = Kn, f = Yn;
		Jn(null), Xn(null);
		try {
			for (var p, m = []; o !== null && o !== t;) {
				try {
					var h = o[Sr]?.[r];
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
			e[Sr] = t, delete e.currentTarget, Jn(d), Xn(f);
		}
	}
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/reconciler.js
var Ar = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function jr(e) {
	return Ar?.createHTML(e) ?? e;
}
function Mr(e) {
	var t = gn("template");
	return t.innerHTML = jr(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/template.js
function Nr(e, t) {
	var n = Yn;
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
		if (N) return Nr(ke, null), ke;
		i === void 0 && (i = Mr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ fn(i)));
		var t = r || sn ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ fn(t), s = t.lastChild;
			Nr(o, s);
		} else Nr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Pr(e, t, n = "svg") {
	var r = !e.startsWith("<!>"), i = !!(t & 1), a = `<${n}>${r ? e : "<!>" + e}</${n}>`, o;
	return () => {
		if (N) return Nr(ke, null), ke;
		if (!o) {
			var e = /* @__PURE__ */ fn(Mr(a));
			if (i) for (o = document.createDocumentFragment(); /* @__PURE__ */ fn(e);) o.appendChild(/* @__PURE__ */ fn(e));
			else o = /* @__PURE__ */ fn(e);
		}
		var t = o.cloneNode(!0);
		if (i) {
			var n = /* @__PURE__ */ fn(t), r = t.lastChild;
			Nr(n, r);
		} else Nr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Fr(e, t) {
	return /* @__PURE__ */ Pr(e, t, "svg");
}
function Ir(e = "") {
	if (!N) {
		var t = dn(e + "");
		return Nr(t, t), t;
	}
	var n = ke;
	return n.nodeType === 3 ? _n(n) : (n.before(n = dn()), Ae(n)), Nr(n, n), n;
}
function Lr() {
	if (N) return Nr(ke, null), ke;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = dn();
	return e.append(t, n), Nr(t, n), e;
}
function K(e, t) {
	if (N) {
		var n = Yn;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = ke), je();
	} else e !== null && e.before(t);
}
function Rr() {
	if (N && ke && ke.nodeType === 8 && ke.textContent?.startsWith("$")) {
		let e = ke.textContent.substring(1);
		return je(), e;
	}
	return (window.__svelte ??= {}).uid ??= 1, `c${window.__svelte.uid++}`;
}
function q(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[re] ??= e.nodeValue) && (e[re] = n, e.nodeValue = `${n}`);
}
function zr(e, t) {
	return Vr(e, t);
}
var Br = /* @__PURE__ */ new Map();
function Vr(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	un();
	var l = void 0, u = Tn(() => {
		var s = n ?? t.appendChild(dn());
		ft(s, { pending: () => {} }, (t) => {
			Ue({});
			var n = Ve;
			if (o && (n.c = o), a && (i.$$events = a), N && Nr(t, null), l = e(t, i) || {}, N && (Yn.nodes.end = ke, ke === null || ke.nodeType !== 8 || ke.data !== "]")) throw Te(), ye;
			We();
		}, c);
		var u = /* @__PURE__ */ new Set(), d = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!u.has(r)) {
					u.add(r);
					var i = xr(r);
					for (let e of [t, document]) {
						var a = Br.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), Br.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, kr, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return d(r(Cr)), wr.add(d), () => {
			for (var e of u) for (let n of [t, document]) {
				var r = Br.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, kr), r.delete(e), r.size === 0 && Br.delete(n)) : r.set(e, i);
			}
			wr.delete(d), s !== n && s.parentNode?.removeChild(s);
		};
	});
	return Hr.set(l, u), l;
}
var Hr = /* @__PURE__ */ new WeakMap();
function Ur(e, t) {
	let n = Hr.get(e);
	return n ? (Hr.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/blocks/branches.js
var Wr = class {
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
			if (n) zn(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (zn(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
			}
			for (let [t, n] of this.#e) {
				if (this.#e.delete(t), t === e) break;
				let r = this.#n.get(n);
				r && (Pn(r.effect), this.#n.delete(n));
			}
			for (let [e, r] of this.#t) {
				if (e === t || this.#r.has(e)) continue;
				let i = () => {
					if (Array.from(this.#e.values()).includes(e)) {
						var t = document.createDocumentFragment();
						Vn(r, t), t.append(dn()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else Pn(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), Ln(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (Pn(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = Ot, r = hn();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = dn();
				i.append(a), this.#n.set(e, {
					effect: An(() => t(a)),
					fragment: i
				});
			} else this.#t.set(e, An(() => t(this.anchor)));
		}
		if (this.#e.set(n, e), r) {
			for (let [t, r] of this.#t) t === e ? n.unskip_effect(r) : n.skip_effect(r);
			for (let [t, r] of this.#n) t === e ? n.unskip_effect(r.effect) : n.skip_effect(r.effect);
			n.oncommit(this.#a), n.ondiscard(this.#o);
		} else N && (this.anchor = ke), this.#a(n);
	}
};
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/blocks/if.js
function J(e, t, n = !1) {
	var r;
	N && (r = ke, je());
	var i = new Wr(e), a = n ? S : 0;
	function o(e, t) {
		if (N) {
			var n = Pe(r);
			if (e !== parseInt(n.substring(1))) {
				var a = Ne();
				Ae(a), i.anchor = a, Oe(!1), i.ensure(e, t), Oe(!0);
				return;
			}
		}
		i.ensure(e, t);
	}
	kn(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/blocks/key.js
var Gr = Symbol("NaN");
function Kr(e, t, n) {
	N && je();
	var r = new Wr(e), i = !Ge();
	kn(() => {
		var e = t();
		e !== e && (e = Gr), i && typeof e == "object" && e && (e = {}), r.ensure(e, n);
	});
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/blocks/each.js
function qr(e, t) {
	return t;
}
function Jr(e, t, n) {
	for (var i = [], a = t.length, o, s = t.length, c = 0; c < a; c++) {
		let n = t[c];
		Ln(n, () => {
			if (o) {
				if (o.pending.delete(n), o.done.add(n), o.pending.size === 0) {
					var t = e.outrogroups;
					Yr(e, r(o.done)), t.delete(o), t.size === 0 && (e.outrogroups = null);
				}
			} else --s;
		}, !1);
	}
	if (s === 0) {
		var l = i.length === 0 && n !== null && e.pending.size === 0;
		if (l) {
			var u = n, d = u.parentNode;
			mn(d), d.append(u), e.items.clear();
		}
		Yr(e, t, !l);
	} else o = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(o);
}
function Yr(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= T, Vn(a, document.createDocumentFragment())) : Pn(t[i], n);
	}
}
var Xr;
function Y(t, n, i, a, o, s = null) {
	var c = t, l = /* @__PURE__ */ new Map();
	if (n & 4) {
		var u = t;
		c = N ? Ae(/* @__PURE__ */ fn(u)) : u.appendChild(dn());
	}
	N && je();
	var d = null, f = /* @__PURE__ */ xt(() => {
		var t = i();
		return e(t) ? t : t == null ? [] : r(t);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, Qr(v, p, c, n, a), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= T, ei(d, null, c)) : zn(d) : Ln(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: kn(() => {
			p = H(f);
			var e = p.length;
			let t = !1;
			N && Pe(c) === "[!" != (e === 0) && (c = Ne(), Ae(c), Oe(!1), t = !0);
			for (var r = /* @__PURE__ */ new Set(), u = Ot, v = hn(), y = 0; y < e; y += 1) {
				N && ke.nodeType === 8 && ke.data === "]" && (c = ke, t = !0, Oe(!1));
				var b = p[y], x = a(b, y), S = h ? null : l.get(x);
				S ? (S.v && Zt(S.v, b), S.i && Zt(S.i, y), v && u.unskip_effect(S.e)) : (S = $r(l, h ? c : Xr ??= dn(), b, x, y, o, n, i), h || (S.e.f |= T), l.set(x, S)), r.add(x);
			}
			if (e === 0 && s && !d && (h ? d = An(() => s(c)) : (d = An(() => s(Xr ??= dn())), d.f |= T)), e > r.size && le("", "", ""), N && e > 0 && Ae(Ne()), !h) {
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
	h = !1, N && (c = ke);
}
function Zr(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function Qr(e, t, n, i, a) {
	var o = !!(i & 8), s = t.length, c = e.items, l = Zr(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (o) for (v = 0; v < s; v += 1) h = t[v], g = a(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = a(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (zn(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= T, _ === l) ei(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), ti(e, d, _), ti(e, _, y), ei(_, y, n), d = _, p = [], m = [], l = Zr(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], C = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) ei(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					ti(e, S.prev, C.next), ti(e, d, S), ti(e, C, b), l = b, d = C, --v, p = [], m = [];
				} else u.delete(_), ei(_, l, n), ti(e, _.prev, _.next), ti(e, _, d === null ? e.effect.first : d.next), ti(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = Zr(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = Zr(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (Yr(e, r(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var w = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || w.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && w.push(l), l = Zr(l.next);
		var E = w.length;
		if (E > 0) {
			var D = i & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < E; v += 1) w[v].nodes?.a?.measure();
				for (v = 0; v < E; v += 1) w[v].nodes?.a?.fix();
			}
			Jr(e, w, D);
		}
	}
	o && Je(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function $r(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? Yt(n) : /* @__PURE__ */ Xt(n, !1, !1) : null, l = o & 2 ? Yt(i) : null;
	return {
		v: c,
		i: l,
		e: An(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function ei(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ pn(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function ti(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function ni(e, t, n = !1, r = !1, i = !1, a = !1) {
	var o = e, s = "";
	if (n) {
		var c = e;
		N && (o = Ae(/* @__PURE__ */ fn(c)));
	}
	V(() => {
		var e = Yn;
		if (s === (s = t() ?? "")) N && je();
		else if (n && !N) e.nodes = null, c.innerHTML = s, s !== "" && Nr(/* @__PURE__ */ fn(c), c.lastChild);
		else if (e.nodes !== null && (Fn(e.nodes.start, e.nodes.end), e.nodes = null), s !== "") {
			if (N) {
				for (var a = ke.data, l = je(), u = l; l !== null && (l.nodeType !== 8 || l.data !== "");) u = l, l = /* @__PURE__ */ pn(l);
				if (l === null) throw Te(), ye;
				Nr(ke, u), o = Ae(l);
			} else {
				var d = gn(r ? "svg" : i ? "math" : "template", r ? Se : i ? Ce : void 0);
				d.innerHTML = s;
				var f = r || i ? d : d.content;
				if (Nr(/* @__PURE__ */ fn(f), f.lastChild), r || i) for (; /* @__PURE__ */ fn(f);) o.before(/* @__PURE__ */ fn(f));
				else o.before(f);
			}
		}
	});
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/elements/actions.js
function ri(e, t, n) {
	En(() => {
		var r = _r(() => t(e, n?.()) || {});
		if (n && r?.update) {
			var i = !1, a = {};
			On(() => {
				var e = n();
				vr(e), i && Ie(a, e) && (a = e, r.update(e));
			}), i = !0;
		}
		if (r?.destroy) return () => r.destroy();
	});
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/clsx/dist/clsx.mjs
function ii(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") {
		if (Array.isArray(e)) {
			var i = e.length;
			for (t = 0; t < i; t++) e[t] && (n = ii(e[t])) && (r && (r += " "), r += n);
		} else for (n in e) e[n] && (r && (r += " "), r += n);
	}
	return r;
}
function ai() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = ii(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/shared/attributes.js
function oi(e) {
	return typeof e == "object" ? ai(e) : e ?? "";
}
var si = [..." 	\n\r\f\xA0\v﻿"];
function ci(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || si.includes(r[o - 1])) && (s === r.length || si.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function li(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function ui(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function di(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\/\*.*?\*\//g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(ui)), i && c.push(...Object.keys(i).map(ui));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = ui(e.substring(l, u).trim());
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
		return r && (n += li(r)), i && (n += li(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/elements/class.js
function fi(e, t, n, r, i, a) {
	var o = e[te];
	if (N || o !== n || o === void 0) {
		var s = ci(n, r, a);
		(!N || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[te] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/elements/style.js
function pi(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function mi(e, t, n, r) {
	var i = e[ne];
	if (N || i !== t) {
		var a = di(t, r);
		(!N || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[ne] = t;
	} else r && (Array.isArray(r) ? (pi(e, n?.[0], r[0]), pi(e, n?.[1], r[1], "important")) : pi(e, n, r));
	return r;
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function hi(t, n, r = !1) {
	if (t.multiple) {
		if (n == null) return;
		if (!e(n)) return Ee();
		for (var i of t.options) i.selected = n.includes(vi(i));
	} else {
		for (i of t.options) if (rn(vi(i), n)) {
			i.selected = !0;
			return;
		}
		(!r || n !== void 0) && (t.selectedIndex = -1);
	}
}
function gi(e) {
	var t = new MutationObserver(() => {
		"__value" in e && hi(e, e.__value);
	});
	t.observe(e, {
		childList: !0,
		subtree: !0,
		attributes: !0,
		attributeFilter: ["value"]
	}), Sn(() => {
		t.disconnect();
	});
}
function _i(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet(), i = !0;
	lt(e, "change", (t) => {
		var i = t ? "[selected]" : ":checked", a;
		if (e.multiple) a = [].map.call(e.querySelectorAll(i), vi);
		else {
			var o = e.querySelector(i) ?? e.querySelector("option:not([disabled])");
			a = o && vi(o);
		}
		n(a), e.__value = a, Ot !== null && r.add(Ot);
	}), En(() => {
		var a = t();
		if (e === document.activeElement) {
			var o = Ot;
			if (r.has(o)) return;
		}
		if (hi(e, a, i), i && a === void 0) {
			var s = e.querySelector(":checked");
			s !== null && (a = vi(s), n(a));
		}
		e.__value = a, i = !1;
	}), gi(e);
}
function vi(e) {
	return "__value" in e ? e.__value : e.value;
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/elements/attributes.js
var yi = Symbol("is custom element"), bi = Symbol("is html"), xi = oe ? "link" : "LINK", Si = oe ? "progress" : "PROGRESS";
function X(e) {
	if (N) {
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
		e[ie] = n, Je(n), st();
	}
}
function Ci(e, t) {
	var n = Ti(e);
	n.value !== (n.value = t ?? void 0) && (e.value !== t || t === 0 && e.nodeName === Si) && (e.value = t ?? "");
}
function wi(e, t) {
	var n = Ti(e);
	n.checked !== (n.checked = t ?? void 0) && (e.checked = t);
}
function Z(e, t, n, r) {
	var i = Ti(e);
	N && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === xi) || i[t] !== (i[t] = n) && (t === "loading" && (e[M] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Di(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function Ti(e) {
	return e[ee] ??= {
		[yi]: e.nodeName.includes("-"),
		[bi]: e.namespaceURI === xe
	};
}
var Ei = /* @__PURE__ */ new Map();
function Di(e) {
	var t = e.getAttribute("is") || e.nodeName, n = Ei.get(t);
	if (n) return n;
	Ei.set(t, n = []);
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var s in r = o(i), r) r[s].set && s !== "innerHTML" && s !== "textContent" && s !== "innerText" && n.push(s);
		i = l(i);
	}
	return n;
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function Oi(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet();
	lt(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = ki(e) ? Ai(a) : a, n(a), Ot !== null && r.add(Ot), await mr(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (N && e.defaultValue !== e.value || _r(t) == null && e.value) && (n(ki(e) ? Ai(e.value) : e.value), Ot !== null && r.add(Ot)), On(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = Ot;
			if (r.has(i)) return;
		}
		ki(e) && n === Ai(e.value) || (e.type !== "date" || n || e.value) && n !== e.value && (e.value = n ?? "");
	});
}
function ki(e) {
	var t = e.type;
	return t === "number" || t === "range";
}
function Ai(e) {
	return e === "" ? null : +e;
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function ji(e, t) {
	return e === t || e?.[A] === t;
}
function Mi(e = {}, t, n, r) {
	var i = Ve.r, a = Yn;
	return En(() => {
		var o, s;
		return On(() => {
			o = s, s = r?.() || [], _r(() => {
				ji(n(...s), e) || (t(e, ...s), o && ji(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && ji(n(...s), e) && t(null, ...s);
			}, c = r.teardown;
			r.teardown = () => {
				o(), c?.();
			};
		};
	}), e;
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/client/reactivity/props.js
function Ni(e, t, n, r) {
	var i = !0, o = !!(n & 8), s = !!(n & 16), c = r, l = !0, u = void 0, d = () => s && i ? (u ??= /* @__PURE__ */ vt(r), H(u)) : (l && (l = !1, c = s ? _r(r) : r), c);
	let f;
	if (o) {
		var p = A in e || j in e;
		f = a(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	o ? [m, h] = it(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && me(t), f(m)));
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
	o && H(y);
	var b = Yn;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? H(y) : i && o ? tn(e) : e;
			return L(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return Wn && v || b.f & 16384 ? y.v : H(y);
	});
}
function Pi(e) {
	Ve === null && se("onMount"), Cn(() => {
		let t = _r(e);
		if (typeof t == "function") return t;
	});
}
function Fi(e) {
	Ve === null && se("onDestroy"), Pi(() => () => _r(e));
}
//#endregion
//#region F:/git/SillyCanvas/node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region src/ui/artifact-glyph.js
var Ii = Object.freeze([
	"context",
	"guidance",
	"draft",
	"patches",
	"candidate",
	"text",
	"data"
]), Li = .5625;
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
var Ri = Math.sqrt(3) * 5.5 / 2, zi = Object.freeze({
	context: "<circle cx=\"0\" cy=\"0\" r=\"5.5\" />",
	guidance: "<polygon points=\"0,-6.5 6.5,0 0,6.5 -6.5,0\" />",
	draft: "<polygon points=\"0,-5.5 5.5,-1.32 3.41,5.5 -3.41,5.5 -5.5,-1.32\" />",
	patches: `<polygon points="0,${-Ri} 5.5,${Ri} -5.5,${Ri}" />`,
	candidate: "<circle cx=\"0\" cy=\"0\" r=\"6.5\" fill=\"none\" /><circle cx=\"0\" cy=\"0\" r=\"2.475\" />",
	text: "<rect x=\"-7.5\" y=\"-3.465\" width=\"15\" height=\"6.93\" rx=\"3.465\" />",
	data: "<rect x=\"-5.5\" y=\"-5.5\" width=\"11\" height=\"11\" />"
});
function Bi(e) {
	let t = Ii.includes(e) ? e : "context";
	return `<g data-glyph="${t}" transform="scale(${Li})" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round">${zi[t]}</g>`;
}
//#endregion
//#region ui/ArtifactPin.svelte
var Vi = /* @__PURE__ */ Fr("<svg width=\"18\" height=\"18\" viewBox=\"-9 -9 18 18\" aria-hidden=\"true\" focusable=\"false\"></svg>");
function Hi(e, t) {
	Ue(t, !0);
	let n = Ni(t, "className", 3, "pc-pin-glyph");
	var r = Vi();
	ni(r, () => Bi(t.kind), !0), P(r), V(() => {
		fi(r, 0, oi(n())), Z(r, "data-kind", t.kind), Z(r, "x", t.x), Z(r, "y", t.y);
	}), K(e, r), We();
}
//#endregion
//#region ui/NodeCard.svelte
var Ui = /* @__PURE__ */ G("<span class=\"pc-modifier-badge svelte-1jilz27\"> </span>"), Wi = /* @__PURE__ */ G("<div><span class=\"pc-native-pin-label\"> </span> <div role=\"img\"><!></div></div>"), Gi = /* @__PURE__ */ G("<div class=\"pc-node-body\"> </div>"), Ki = /* @__PURE__ */ G("<span class=\"pc-native-alias\"> </span>"), qi = /* @__PURE__ */ G("<div class=\"pc-recall-status-space\" aria-hidden=\"true\"></div>"), Ji = /* @__PURE__ */ Fr("<path class=\"pc-recall-marker\" d=\"M17 18h5M19.5 15.5v5\"></path>"), Yi = /* @__PURE__ */ Fr("<path class=\"pc-recall-marker\" d=\"m16 18 3 3 4-6\"></path>"), Xi = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-node-recall-status\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M7 5a8 8 0 1 1-3 6M3 4v6h6M12 7v5l3 2\"></path><!></svg></button>"), Zi = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-node-action pc-host-result\" aria-label=\"Preview host result\"><i class=\"fa-solid fa-eye\" aria-hidden=\"true\"></i> Host result</button>"), Qi = /* @__PURE__ */ G("<div role=\"group\" tabindex=\"0\"><div class=\"pc-native-heading\"><svg class=\"pc-native-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path></path></svg><span class=\"pc-node-title\"> </span><!></div> <div class=\"pc-native-pins\"></div> <!> <!> <!> <!> <!></div>");
function $i(e, t) {
	Ue(t, !0);
	let n = (e) => e.stopPropagation();
	var r = Qi();
	let i, a;
	var o = R(r), s = R(o), c = R(s);
	P(s);
	var l = B(s), u = R(l, !0);
	P(l);
	var d = B(l), f = (e) => {
		var n = Ui(), r = R(n);
		P(n), V(() => {
			Z(n, "title", t.card.modifierSummary.text), Z(n, "aria-label", t.card.modifierSummary.text), q(r, `+${t.card.modifierSummary.count ?? ""}`);
		}), K(e, n);
	};
	J(d, (e) => {
		t.card.modifierSummary && e(f);
	}), P(o);
	var p = B(o, 2);
	Y(p, 21, () => t.card.ports, (e) => e.id, (e, n) => {
		var r = Wi();
		let i;
		var a = R(r), o = R(a, !0);
		P(a);
		var s = B(a, 2);
		Hi(R(s), { get kind() {
			return H(n).kind;
		} }), P(s), P(r), V(() => {
			fi(r, 1, `pc-native-row pc-native-row-${H(n).dir}`, "svelte-1jilz27"), i = mi(r, "", i, { "grid-row": H(n).row }), q(o, H(n).label), fi(s, 1, oi(H(n).className), "svelte-1jilz27"), Z(s, "data-node", t.card.id), Z(s, "data-dir", H(n).dir), Z(s, "data-port", H(n).port), Z(s, "data-side", H(n).side), Z(s, "data-kind", H(n).kind), Z(s, "title", H(n).title), Z(s, "aria-label", H(n).title);
		}), U("mouseenter", s, () => t.actions.hoverPin({
			nodeId: t.card.id,
			dir: H(n).dir,
			port: H(n).port
		})), U("mouseleave", s, () => t.actions.hoverPin(null)), K(e, r);
	}), P(p);
	var m = B(p, 2), h = (e) => {
		var n = Gi(), r = R(n, !0);
		P(n), V(() => q(r, t.card.body)), K(e, n);
	};
	J(m, (e) => {
		t.card.type === "note" && e(h);
	});
	var g = B(m, 2), _ = (e) => {
		var n = Ki(), r = R(n, !0);
		P(n), V(() => {
			Z(n, "title", t.card.titleHint), q(r, t.card.title);
		}), K(e, n);
	};
	J(g, (e) => {
		t.card.compact && e(_);
	});
	var v = B(g, 2), y = (e) => {
		K(e, qi());
	};
	J(v, (e) => {
		(t.card.label === "Recall" || t.card.label === "Recall Shortcut") && e(y);
	});
	var b = B(v, 2), x = (e) => {
		var r = Xi(), i = R(r), a = B(R(i)), o = (e) => {
			K(e, Ji());
		}, s = (e) => {
			K(e, Yi());
		};
		J(a, (e) => {
			t.card.recall.state === "generation" ? e(o) : t.card.recall.state === "acceptance" && e(s, 1);
		}), P(i), P(r), V(() => {
			Z(r, "data-recall-state", t.card.recall.state), Z(r, "title", t.card.recall.tooltip), Z(r, "aria-label", t.card.recall.ariaLabel);
		}), W("pointerdown", r, n), W("mousedown", r, n), W("contextmenu", r, n), W("keydown", r, n), W("click", r, (e) => {
			n(e), t.actions.openRecallDetails?.(t.card.id);
		}), K(e, r);
	};
	J(b, (e) => {
		t.card.recall && e(x);
	});
	var S = B(b, 2), C = (e) => {
		var r = Zi();
		W("mousedown", r, n), W("click", r, (e) => {
			n(e), t.actions.hostResult(t.card.id);
		}), K(e, r);
	};
	J(S, (e) => {
		t.card.hostResult && e(C);
	}), P(r), V(() => {
		i = fi(r, 1, oi(t.card.className), "svelte-1jilz27", i, { "pc-recall-capable": t.card.label === "Recall" || t.card.label === "Recall Shortcut" }), Z(r, "data-id", t.card.id), Z(r, "title", t.card.offHint), Z(r, "aria-label", `${t.card.label}: ${t.card.title}`), a = mi(r, "", a, {
			left: `${t.card.x}px`,
			top: `${t.card.y}px`
		}), Z(c, "d", t.card.iconPath), Z(l, "title", t.card.titleHint), q(u, t.card.title);
	}), K(e, r), We();
}
Er([
	"pointerdown",
	"mousedown",
	"contextmenu",
	"keydown",
	"click"
]);
//#endregion
//#region ui/GroupCard.svelte
var ea = /* @__PURE__ */ G("<div class=\"pc-node-body\"> </div>"), ta = /* @__PURE__ */ G("<div role=\"group\"><div><i class=\"fa-solid fa-object-group\" aria-hidden=\"true\"></i> <span> </span> <span class=\"pc-group-frame-count\"> </span> <button type=\"button\"></button></div> <!></div>");
function na(e, t) {
	Ue(t, !0);
	function n(e, n) {
		e.stopPropagation(), e.preventDefault(), t.actions.group(t.group.id, n);
	}
	function r(e, n) {
		e.stopPropagation(), e.detail === 0 && t.actions.group(t.group.id, n);
	}
	var i = ta();
	let a;
	var o = R(i), s = B(R(o), 2), c = R(s, !0);
	P(s);
	var l = B(s, 2), u = R(l, !0);
	P(l);
	var d = B(l, 2);
	P(o);
	var f = B(o, 2), p = (e) => {
		var n = ea(), r = R(n, !0);
		P(n), V(() => q(r, t.group.body)), K(e, n);
	};
	J(f, (e) => {
		t.group.collapsed && e(p);
	}), P(i), V(() => {
		fi(i, 1, oi(t.group.className)), Z(i, "data-group", t.group.id), Z(i, "aria-label", `Group: ${t.group.title}`), a = mi(i, "", a, {
			left: `${t.group.x}px`,
			top: `${t.group.y}px`,
			width: `${t.group.w}px`,
			height: t.group.collapsed ? void 0 : `${t.group.h}px`
		}), fi(o, 1, oi(t.group.collapsed ? "pc-node-head" : "pc-group-frame-head")), fi(s, 1, oi(t.group.collapsed ? "pc-node-title" : "pc-group-frame-title")), q(c, t.group.title), q(u, t.group.count), fi(d, 1, `pc-node-action fa-solid pc-group-btn ${t.group.collapsed ? "fa-up-right-and-down-left-from-center" : "fa-down-left-and-up-right-to-center"}`), Z(d, "data-action", t.group.collapsed ? "open" : "collapse"), Z(d, "title", t.group.collapsed ? "Open group" : "Fold group"), Z(d, "aria-label", t.group.collapsed ? "Open group" : "Fold group");
	}), W("mousedown", d, (e) => n(e, t.group.collapsed ? "open" : "collapse")), W("click", d, (e) => r(e, t.group.collapsed ? "open" : "collapse")), K(e, i), We();
}
Er(["mousedown", "click"]);
//#endregion
//#region ui/WireLayer.svelte
var ra = /* @__PURE__ */ Fr("<path class=\"pc-wire-hit\"></path><path><title> </title></path><text text-anchor=\"middle\"> </text>", 1), ia = /* @__PURE__ */ Fr("<path></path>"), aa = /* @__PURE__ */ Fr("<!><!>", 1);
function oa(e, t) {
	Ue(t, !0);
	var n = aa(), r = z(n);
	Y(r, 17, () => t.wires, (e) => e.id, (e, t) => {
		var n = ra(), r = z(n), i = B(r), a = R(i), o = R(a);
		P(a), P(i);
		var s = B(i), c = R(s, !0);
		P(s), V(() => {
			Z(r, "d", H(t).d), Z(r, "data-id", H(t).id), Z(i, "d", H(t).d), fi(i, 0, oi(H(t).className)), Z(i, "data-id", H(t).id), Z(i, "data-kind", H(t).kind), q(o, `${H(t).kind ?? ""} artifact`), Z(s, "x", H(t).label.x), Z(s, "y", H(t).label.y), fi(s, 0, oi(H(t).label.className)), Z(s, "data-id", H(t).id), q(c, H(t).label.text);
		}), K(e, n);
	});
	var i = B(r), a = (e) => {
		var n = ia();
		V(() => {
			Z(n, "d", t.ghost.d), fi(n, 0, oi(t.ghost.className)), Z(n, "data-kind", t.ghost.kind);
		}), K(e, n);
	};
	J(i, (e) => {
		t.ghost && e(a);
	}), K(e, n), We();
}
//#endregion
//#region ui/CommentFrame.svelte
var sa = /* @__PURE__ */ G("<span class=\"pc-comment-title svelte-118xm2r\"> </span>"), ca = /* @__PURE__ */ G("<input class=\"pc-comment-title-input svelte-118xm2r\" aria-label=\"Comment title\"/>"), la = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-comment-resize svelte-118xm2r\" title=\"Drag to resize comment\"></button>"), ua = /* @__PURE__ */ G("<div role=\"group\"><header class=\"pc-comment-header svelte-118xm2r\"><button type=\"button\" class=\"pc-comment-select svelte-118xm2r\" title=\"Drag header to move comment\">⋮⋮</button> <!></header> <div class=\"pc-comment-notes svelte-118xm2r\"> </div> <!></div>");
function da(e, t) {
	Ue(t, !0);
	let n = (e) => e.stopPropagation();
	var r = ua();
	let i, a;
	var o = R(r), s = R(o), c = B(s, 2), l = (e) => {
		var n = sa(), r = R(n, !0);
		P(n), V(() => q(r, t.comment.title)), K(e, n);
	}, u = (e) => {
		var r = ca();
		X(r), V(() => Ci(r, t.comment.title)), U("focus", r, () => t.actions.select(t.comment.id)), U("pointerdown", r, n, !0), U("mousedown", r, n, !0), U("click", r, n, !0), U("keydown", r, n, !0), W("change", r, (e) => {
			t.comment.readOnly || t.actions.update(t.comment.id, { title: e.currentTarget.value });
		}), K(e, r);
	};
	J(c, (e) => {
		t.comment.readOnly ? e(l) : e(u, -1);
	}), P(o);
	var d = B(o, 2), f = R(d, !0);
	P(d);
	var p = B(d, 2), m = (e) => {
		var n = la();
		V(() => Z(n, "aria-label", `Resize comment: ${t.comment.title}`)), W("click", n, (e) => {
			e.detail === 0 && t.actions.select(t.comment.id);
		}), K(e, n);
	};
	J(p, (e) => {
		t.comment.readOnly || e(m);
	}), P(r), V(() => {
		i = fi(r, 1, "pc-comment-frame svelte-118xm2r", null, i, {
			"pc-comment-selected": t.comment.selected,
			"pc-comment-readonly": t.comment.readOnly
		}), Z(r, "data-id", t.comment.id), Z(r, "aria-label", `Comment: ${t.comment.title}`), a = mi(r, "", a, {
			left: `${t.comment.x}px`,
			top: `${t.comment.y}px`,
			width: `${t.comment.w}px`,
			height: `${t.comment.h}px`,
			"--frame-color": t.comment.color
		}), Z(s, "aria-label", `Select comment: ${t.comment.title}`), q(f, t.comment.content);
	}), W("click", s, (e) => {
		e.detail === 0 && t.actions.select(t.comment.id);
	}), K(e, r), We();
}
Er(["click", "change"]);
//#endregion
//#region src/ui/diagnostic-states.js?v=0.27.0
var fa = (e, t, n) => ({
	id: e,
	severity: "info",
	title: t,
	message: n
}), pa = (e, t, n) => ({
	id: e,
	severity: "warning",
	title: t,
	message: n
}), ma = (e, t, n) => ({
	id: e,
	severity: "error",
	title: t,
	message: n
}), ha = "This step starts when you send a message. Enable Lattice, then send a message in SillyTavern to run this workflow.", ga = fa("recording-size-limit", "Preview was not retained", "The preview recording reached its size limit, so this output was not retained. This does not mean the model stopped early."), _a = fa("recording-invalid", "Recorded preview is unavailable", "The recorded preview could not be read safely. This does not establish whether the step succeeded. Choose a current output to inspect."), va = {
	PREVIEW_NOT_RUN: fa("not-run", "Not run yet", "This step has not run yet. Use Run to here when it is available."),
	PREVIEW_RUNNING: fa("running", "Running", "This step is running. Its output will appear when it finishes."),
	PREVIEW_WORKFLOW_RUNNING: fa("workflow-running", "Workflow is running", "The workflow is running. This output is not available yet."),
	PREVIEW_WAITING: fa("waiting", "Waiting for input", "This step is waiting for an earlier step to finish."),
	PREVIEW_UNRESOLVED: fa("unresolved", "No input for this branch", "An earlier step did not produce the input this branch needs. Check that step’s output and branch conditions."),
	PREVIEW_SKIPPED: fa("skipped", "Step skipped", "This branch was intentionally skipped for this run."),
	OUTPUT_NOT_RETAINED: fa("not-retained", "Output is not retained", "No saved preview is available for this output."),
	OUTPUT_REMOVED: fa("output-removed", "Output is no longer available", "The selected output was removed or changed. Choose a current output."),
	EARLIER_OUTPUT: fa("earlier-output", "Earlier output", "This is output from an earlier run. It does not describe the current run."),
	PREVIEW_TRUNCATED: fa("preview-truncated", "Preview shortened", "Only the displayed preview was shortened. This does not mean the model stopped early."),
	MANUAL_NATIVE_TRIGGER_REQUIRED: fa("send-required", "Starts with a message", ha),
	NATIVE_SEND_REQUIRED: fa("send-required", "Starts with a message", ha),
	RECALL_PREVIEW_NO_ACTIVATION: fa("recall-preview", "Recall waits for generation", "Recall runs during a normal SillyTavern message or generated swipe. A manual preview does not activate it."),
	ABORTED: fa("stopped", "Stopped", "This action was stopped. Late output will not be used."),
	CANCELLED: fa("cancelled", "Cancelled", "This action was cancelled."),
	WORKFLOW_CANCELLED: fa("workflow-cancelled", "Workflow stopped", "The workflow was stopped."),
	FILE_CANCELLED: fa("file-cancelled", "File action cancelled", "The file action was cancelled. The open draft is still available."),
	NODE_CONFIGURATION_CANCELLED: fa("node-cancelled", "Node creation cancelled", "Node creation was cancelled."),
	BUSY: fa("busy", "Another action is running", "Wait for generation or reply application to finish before continuing."),
	ALREADY_APPLIED: fa("already-applied", "Already applied", "This revision has already been applied."),
	COMMIT_DISABLED: fa("commit-preview", "Preview does not save memory", "Preview and dry-run execution do not commit memory."),
	RECALL_REGISTRATION_PENDING: fa("recall-registering", "Shortcut is being prepared", "The Recall Shortcut is still being registered."),
	CONTEXT_PRESERVATION: fa("context-preserved", "Original context retained", "The original context is retained alongside the compacted output."),
	COMPRESSION_INPUT_OMITTED: pa("compression-omitted", "Some context was left out", "Some older messages did not fit the compression input. The originals are retained."),
	PERSISTENCE_PARTIAL: pa("save-partial", "Some changes are not saved", "The accepted reply is retained. Some associated changes could not be saved. Review each target’s save status."),
	RECENT_STORAGE_FAILED: pa("recent-storage", "Recent files could not be remembered", "The browser could not remember recent workflow files. Your open workflow is still available."),
	VIEW_PERSISTENCE: pa("view-persistence", "View layout was reset", "The saved graph layout could not be restored. The workflow is available with a fresh view layout.")
};
for (let e of [
	"PERSISTENCE_UNKNOWN",
	"PERSISTENCE_UNVERIFIED",
	"SAVE_UNVERIFIED",
	"APPLY_SAVE_UNVERIFIED"
]) va[e] = pa("save-unverified", "Saving is not confirmed", "The save outcome could not be verified. Confirm the stored data before making another write.");
var ya = /* @__PURE__ */ new Map([
	["Enter valid JSON before saving.", {
		id: "json-setting",
		severity: "error",
		title: "Check the JSON",
		message: "Enter valid JSON before saving."
	}],
	["Enter a finite number before saving.", {
		id: "number-setting",
		severity: "error",
		title: "Check the number",
		message: "Enter a finite number before saving."
	}],
	["Enter a number within the allowed range and step.", {
		id: "range-setting",
		severity: "error",
		title: "Check the number",
		message: "Enter a number within the allowed range and step."
	}],
	["Enter a model identifier before saving an override.", {
		id: "model-override-empty",
		severity: "error",
		title: "Enter a model identifier",
		message: "Enter a model identifier before saving an override."
	}],
	["Enter a model identifier of 1–256 characters.", {
		id: "model-override-length",
		severity: "error",
		title: "Check the model identifier",
		message: "Enter a model identifier of 1–256 characters."
	}],
	["Choose a connection to run.", {
		id: "connection-required",
		severity: "error",
		title: "Choose a connection",
		message: "Choose a connection to run."
	}],
	["Assign a fixed connection to this node or its model role.", {
		id: "fixed-connection",
		severity: "error",
		title: "Choose a connection",
		message: "Assign a fixed connection to this node or its model role."
	}],
	["Use a JSON object before selecting a configured value.", {
		id: "configuration-json",
		severity: "error",
		title: "Check the controls JSON",
		message: "Use a JSON object before selecting a configured value."
	}],
	["Use a positive starting day, a time within the day, and a day length in whole minutes.", ma("clock-starting-values", "Check the clock’s starting values", "Set Starting day to a positive whole number, Starting time to a time within the day, and Hours per day to a positive duration in whole minutes. Enter a Calendar name.")],
	["Load a valid clock template before changing its starting values.", ma("clock-template-needed", "Load a valid clock template", "Use Load initial values to load a valid clock template before changing its starting values.")],
	["Load the initial template before saving.", ma("initial-template-needed", "Load initial values first", "Use Load initial values before changing the initial template with Save settings.")],
	["Choose an actor for private data.", ma("private-actor-needed", "Choose the private actor", "Enter Actor ID when Visibility is Actor private.")],
	["The initial template could not be loaded.", ma("initial-template-load", "Initial template could not be loaded", "The initial template could not be loaded. Check the source document and its authorization in Workflow Data.")],
	["Check the initial settings.", ma("initial-settings", "Check the initial settings", "Check the initial template and settings in Workflow Data.")],
	["Check the new data settings.", ma("new-data-settings", "Check the new data settings", "Check Name, Format, Visibility, and the required initial values in Workflow Data.")],
	["Workflow data could not be updated.", pa("workflow-data-update-unverified", "Workflow Data update is not confirmed", "The Workflow Data update could not be confirmed. Inspect the current data and initial settings before making another change.")],
	["Workflow Data setup could not be applied.", pa("workflow-data-setup-unverified", "Workflow Data setup is not confirmed", "The Workflow Data setup change could not be confirmed. Inspect the current configuration before making another change.")],
	["The subgraph could not be saved. Check the current settings before trying the edit again.", pa("subgraph-save-unverified", "Subgraph saving is not confirmed", "The subgraph save could not be confirmed. Inspect the saved subgraph and current settings before making another change.")],
	["The edit could not be accepted. Check the current settings before trying the edit again.", ma("edit-not-accepted", "Edit could not be accepted", "The edit could not be accepted. Check the current settings and selection before preparing another edit.")],
	["The node could not be prepared.", ma("node-not-prepared", "Node could not be prepared", "The node could not be prepared. Check the required controls in node configuration.")],
	["Memory recall could not be updated.", ma("recall-not-updated", "Recall could not be updated", "Recall could not be updated. Reopen the Recall controls and inspect the current scope and queue status.")],
	["Memory recall is unavailable.", fa("recall-unavailable", "Recall is unavailable", "Recall is unavailable. Check the active chat, character, and enabled workflow.")],
	["The portal change could not be accepted.", ma("portal-not-accepted", "Portal change could not be accepted", "The portal change could not be accepted. Check the current graph view and portal settings.")],
	["Could not change connection profile", ma("profile-not-changed", "Connection profile could not be changed", "The Connection profile could not be changed. Select a current node and check the available profiles.")],
	["Lattice disabled", fa("lattice-disabled", "Lattice is disabled", "Enable Lattice to use this feature.")],
	["This Recall uses automatic triggers.", fa("recall-automatic", "Recall uses automatic triggers", "This Recall uses automatic triggers. Queue recall is available for manual activation settings.")],
	["Recall is already queued.", fa("recall-queued", "Recall is already queued", "Recall is already queued. Use Cancel recall to remove the queued request.")],
	["Memory recall is available in the root workflow.", fa("recall-root", "Open the root workflow", "Memory recall is available in the root workflow.")],
	["Memory recall requires an active user, chat, and character.", fa("recall-active-scope", "Recall needs an active chat", "Open an active user, chat, and character to use Recall.")],
	["This node belongs to another character.", fa("recall-character", "Select the matching character", "This node belongs to another character. Select the matching character to use its Recall controls.")],
	["Add a matching Recall Shortcut to queue this memory set.", fa("recall-shortcut-needed", "Add a Recall Shortcut", "Add a matching Recall Shortcut to queue this memory set.")],
	["The Recall and Shortcut generation targets do not overlap.", fa("recall-targets", "Recall targets do not match", "Choose overlapping generation targets for the Recall and matching Shortcut in Details.")],
	["No manual recall is queued for these nodes.", fa("recall-cancel-empty", "No Recall request to cancel", "No manual recall is queued for these nodes.")],
	["Select an eligible Recall or Recall Shortcut node.", fa("recall-selection", "Select a Recall node", "Select an eligible Recall or Recall Shortcut node.")],
	["Library definitions are read-only.", fa("read-only-library", "Library definition", "Library definitions are read-only. Make a local copy to edit this definition.")],
	["Library inspection is read-only and has no runtime output.", fa("library-preview", "Library definition preview", "Library definitions do not run here. Open a workflow that uses this definition to inspect its output.")],
	["The previous workspace presentation is unreadable.", pa("recovered-layout", "Saved view could not be restored", "The workflow can be opened, but its saved view layout could not be restored.")],
	["The previous recovery draft workspace presentation is unreadable.", pa("recovered-layout", "Saved view could not be restored", "The recovery draft can be opened, but its saved view layout could not be restored.")],
	["No output recorded yet.", va.PREVIEW_NOT_RUN],
	["Artifact omitted: recording-byte-limit", ga],
	["Artifact omitted: recording-metadata-limit", ga],
	["Artifact omitted: canonical-prefix-limit", ga],
	["Artifact omitted: invalid-diagnostic-data", _a],
	["Artifact omitted: invalid diagnostic data", _a],
	["Artifact omitted: unavailable", fa("recording-unavailable", "Recorded preview is unavailable", "No recorded preview is available for this output. Choose a current output to inspect.")],
	["Artifact omitted: historical wrapper mapping unavailable", fa("historical-mapping", "Earlier output cannot be located", "This earlier output cannot be matched to the current subgraph. Choose a current output to inspect.")],
	["Workflow Data setup is unavailable.", fa("data-setup", "Workflow Data needs setup", "Open an active chat to configure Workflow Data.")]
]), ba = (e, t, n) => ({
	id: e,
	severity: "error",
	title: t,
	message: n
}), xa = (e, t, n) => ({
	id: e,
	severity: "warning",
	title: t,
	message: n
}), Sa = " Running it again makes another model request.", Ca = [
	[
		"UNSUPPORTED_BINDING",
		/discards completion evidence|preserves? (?:its )?completion reason/i,
		ba("binding-finish", "Connection cannot verify completion", "This connection does not preserve the completion reason Lattice needs. Choose a connection that reports its completion reason.")
	],
	[
		"UNSUPPORTED_BINDING",
		/proxy|directly resolved/i,
		ba("binding-proxy", "Proxy connection cannot be verified", "Lattice cannot verify this proxy route. Choose a direct connection in Connection profile.")
	],
	[
		"UNSUPPORTED_BINDING",
		/samplers across providers|switching the live connection/i,
		ba("binding-provider", "Provider settings do not match", "This text completion profile uses a different provider from the active SillyTavern connection. Choose a profile for the active provider.")
	],
	[
		"TRUNCATED_OUTPUT",
		/summary/i,
		xa("summary-truncated", "Summary stopped early", "The summary reached Output tokens before finishing. The original context is retained. Increase Output tokens in Details if you choose to run compression again." + Sa)
	],
	[
		"COMPLETION_UNVERIFIED",
		/summary/i,
		xa("summary-unverified", "Summary completion is not confirmed", "The connection did not confirm that the summary finished. The original context is retained. Check that the connection reports a completion reason.")
	],
	[
		"EMPTY_OUTPUT",
		/summary/i,
		xa("summary-empty", "Summary is empty", "The model returned no summary text. The original context is retained. Check the connection and compression settings." + Sa)
	],
	[
		"REQUEST_FAILED",
		/compression/i,
		ba("compression-request", "Compression could not finish", "The compression request could not finish. The original context is retained. Check Connection profile and the provider status." + Sa)
	],
	[
		"INVALID_SETTINGS",
		/target\/completion limit|compaction method/i,
		ba("compactor-settings", "Check Smart Compactor settings", "Use positive Target tokens and Output tokens, a valid Keep recent count, and a supported Method in Details.")
	],
	[
		"INVALID_SETTINGS",
		/presentation|layout|enabled\/group/i,
		ba("node-layout", "Check node appearance", "The saved node appearance or layout is invalid. Check the node’s Details and group membership.")
	],
	[
		"INVALID_SETTINGS",
		/model binding|role binding/i,
		ba("binding-setting", "Check model settings", "Check Connection profile, Model mode, and Model identifier in Details.")
	],
	[
		"INVALID_SETTINGS",
		/^Invalid maxTokens\.$/i,
		ba("output-tokens-setting", "Check Output tokens", "Enter a positive whole number within the allowed range for Output tokens in Details.")
	]
], wa = {
	UNSUPPORTED_BINDING: ba("binding-unsupported", "Connection type is not supported", "Choose a supported chat or text completion connection in Connection profile."),
	BINDING_MISSING: ba("binding-missing", "Choose a connection", "Choose Connection profile on this node before running it."),
	PROFILE_MISSING: ba("profile-missing", "Connection profile is unavailable", "The selected Connection profile is missing or unavailable. Choose an available profile on the node."),
	MODEL_MISSING: ba("model-missing", "Choose a model", "Select a model in the connection profile or set Model identifier in Details."),
	PRESET_MISSING: ba("preset-missing", "Sampler preset is unavailable", "The selected connection profile’s sampler preset is missing. Select an available preset in SillyTavern Connection Manager."),
	INSTRUCT_MISSING: ba("instruct-missing", "Instruct preset is unavailable", "The selected connection profile’s instruct preset is missing. Choose an available instruct preset in SillyTavern."),
	ENDPOINT_MISSING: ba("endpoint-missing", "Connection needs provider settings", "Complete the endpoint and account settings for the selected provider in SillyTavern."),
	BINDING_CHANGED: ba("binding-changed", "Connection settings changed", "The connection changed after it was checked. Review Connection profile and the current provider settings before running this step."),
	SERVICE_UNAVAILABLE: ba("service-unavailable", "SillyTavern service is unavailable", "A required SillyTavern service is unavailable. Check the installed host version and connection settings."),
	REQUEST_FAILED: ba("request-failed", "Model request could not finish", "The model request could not finish. Check Connection profile and the provider status." + Sa),
	TRUNCATED_OUTPUT: xa("model-truncated", "Model output stopped early", "The model reached Output tokens before finishing. Increase Output tokens in Details if you choose to run this step again." + Sa),
	COMPLETION_UNVERIFIED: xa("completion-unverified", "Completion is not confirmed", "The connection did not confirm that the model finished. The unverified result is not used. Check that the connection reports a completion reason."),
	EMPTY_OUTPUT: ba("output-empty", "No text returned", "The model returned no text. Check Connection profile and the request settings." + Sa),
	PIN_MISSING: ba("pin-missing", "Pinned wording was not found", "A phrase in Pinned wording is missing from the input. Check its exact spelling and capitalization in Details."),
	PIN_BUDGET_EXCEEDED: ba("pin-budget", "Protected context exceeds the budget", "Pinned wording and Keep recent preserve more context than Target tokens allows. Increase Target tokens or reduce the protected material in Details."),
	INPUT_LIMIT: ba("compression-input-limit", "Context does not fit compression", "No flexible message fits the compression input limit. Reduce the input context or use Method “select”. The original context is retained."),
	COMPACTION_OVERFLOW: xa("compaction-overflow", "Summary exceeds the context budget", "The summary and protected messages exceed Target tokens. The original context is retained. Increase Target tokens or reduce Pinned wording and Keep recent."),
	TOKEN_COUNT_FAILED: ba("token-count-failed", "Token count is unavailable", "Lattice could not measure the token count. Check the selected connection’s tokenizer. The original input is retained.")
}, Ta = (e, t, n) => ({
	id: e,
	severity: "error",
	title: t,
	message: n
}), Ea = (e, t, n) => ({
	id: e,
	severity: "info",
	title: t,
	message: n
}), Da = (e, t, n) => ({
	id: e,
	severity: "warning",
	title: t,
	message: n
}), Oa = Ta("document-authorization", "Choose an authorized document", "Authorize the document in Workflow › Configure › Workflow Data, then select it in the node’s Details."), ka = Ta("private-material", "Private material is protected", "This output contains restricted or private material and cannot be published here. Check the source visibility and the intended actor."), Aa = Ta("actor-mismatch", "Character scope does not match", "This data belongs to a different character or chat. Select the intended character and check the node’s actor settings."), ja = Ta("resource-scope-changed", "The active scope changed", "The active user, chat, character, or workflow changed. Reopen the affected controls for the current scope."), Ma = {
	FILE_TOO_LARGE: Ta("file-size", "File is too large", "Choose a file no larger than 400,000 bytes."),
	FILE_CONTENT_TOO_LARGE: Ta("file-text-size", "File text is too long", "Choose a file containing no more than 100,000 characters."),
	FILE_NAME_INVALID: Ta("file-name", "Filename is invalid", "Choose a file with a filename between 1 and 255 characters."),
	FILE_INVALID_UTF8: Ta("file-encoding", "File text cannot be read", "Choose a UTF-8 text file."),
	FILE_PERMISSION: Ta("file-permission", "File access was denied", "Choose the workflow file again and allow access, or use Save As to choose another destination."),
	FILE_NOT_FOUND: Ta("file-missing", "File is missing", "The selected file or document no longer exists. Choose an existing file or check the target in Workflow Data."),
	FILE_READ_FAILED: Ta("file-read", "File could not be read", "The selected file could not be read. Choose an accessible file and check its permissions."),
	FILE_WRITE_FAILED: Ta("file-save", "Workflow file could not be saved", "The workflow file could not be saved. Your draft remains open. Use Save As to choose an accessible destination."),
	FILE_DOWNLOAD_FAILED: Ta("file-download", "Workflow copy could not be saved", "The workflow JSON copy could not be saved. Your draft remains open. Check browser download permissions."),
	FILE_CONFLICT: Ta("workflow-file-conflict", "Workflow file changed", "The workflow file changed outside Lattice. Use Save As to preserve your draft without overwriting those changes."),
	FILE_REVISION_CONFLICT: Ta("document-revision-conflict", "Document changed", "The target document changed after it was read. Prepare a new projection and its dependent story output from the current document before acceptance."),
	FILE_REFERENCE_UNAUTHORIZED: Ta("file-reference", "Read the document first", "Connect the Reference output from the current authorized Read File node. An older or substituted reference cannot authorize a write."),
	FILE_RECEIPT_LIMIT: Ta("document-receipts", "Document history is full", "The document reached its revision or save history limit. Reconcile its stored history before preparing another write."),
	FILE_DOCUMENT_LIMIT: Ta("document-limit", "Document exceeds the storage limit", "The proposed document and save history are too large to store. Reduce the document size before preparing another write."),
	FILE_FORMAT_LOCKED: Ta("document-format", "Document format is fixed", "An existing document keeps its format. Create a different target in Workflow Data to use another format."),
	FILE_ACCEPTANCE_REQUIRED: Ea("file-acceptance", "Saving waits for acceptance", "File changes are proposed during execution and are saved only when the full workflow result is accepted."),
	FILE_STAGE_FAILED: Ta("file-staging", "File change could not be prepared", "The file change could not be prepared. Check the target document, current reference, and source evidence."),
	FILE_INTENT_CONFLICT: Ta("file-intent-conflict", "File change identity conflicts", "A previously prepared file change uses this identity for different content. Inspect the retained change and prepare a distinct current change."),
	FILE_BACKEND_FAILED: Ta("document-storage", "Document storage is unavailable", "The document storage service could not complete this action. Check the active chat and Workflow Data configuration."),
	FILE_EVIDENCE_FAILED: Ta("file-evidence", "File evidence could not be checked", "The source evidence for this file change could not be checked. Inspect the current source and prepare evidence from it."),
	DOCUMENT_SETUP_UNAVAILABLE: Ea("document-setup", "Workflow Data needs setup", "Open an active user and chat, then configure documents in Workflow › Configure › Workflow Data."),
	CHAT_REQUIRED: Ea("chat-required", "Open a chat", "Open an active chat before using this feature."),
	ACTOR_REQUIRED: Ea("actor-required", "Select a character", "Select an active character before using character memory."),
	PRIVATE_MATERIAL: ka,
	PRIVATE_DESTINATION: Ta("private-destination", "Destination cannot receive private data", "Choose a destination whose visibility preserves the data’s private actor scope. Check visibility in Workflow Data."),
	INVALIDATED_SOURCES: Da("historical-source-changed", "Stored evidence changed", "Some stored evidence changed or was removed. Review and reconcile that evidence before using it for another memory change."),
	FINAL_EVIDENCE_REEXTRACT_REQUIRED: Ta("final-evidence", "Evidence does not match the final reply", "The final reply changed after its evidence was captured. Extract or rebase the evidence from the final narrative before accepting it."),
	STALE_VERSION: Ta("memory-version", "Memory changed", "The memory store changed after this proposal was prepared. Read the current memory and prepare a new proposal before acceptance."),
	IDEMPOTENCY_CONFLICT: Ta("memory-identity-conflict", "Memory change identity conflicts", "This memory change identity already refers to different or unconfirmed content. Inspect the stored change before preparing another write."),
	MEMORY_SAVE_UNAVAILABLE: Ta("memory-save-unavailable", "Memory saving is unavailable", "SillyTavern’s metadata save service is unavailable. Check the active chat and host installation."),
	MEMORY_BACKEND_FAILED: Ta("memory-backend", "Memory storage could not complete this action", "The memory storage service could not complete this action. Check the active chat, character, and memory configuration."),
	RECEIPT_LIMIT: Ta("memory-receipts", "Memory history is full", "The memory save history reached its limit. Reconcile stored receipts before preparing another write."),
	VERSION_LIMIT: Ta("memory-version-limit", "Memory version limit reached", "The memory store reached its version limit. Reconcile the store before preparing another write."),
	RECALL_UNAVAILABLE: Ea("recall-setup", "Recall needs setup", "Enable Lattice and open a unified workflow for the active character to use Recall."),
	RECALL_QUEUE_CONFLICT: Ta("recall-policy", "Recall settings do not match", "Matching Recall Shortcuts must use matching generation target, repetition, and consumption settings. Check their Details."),
	RECALL_HOTKEY_CONFLICT: Ta("recall-shortcut-conflict", "Shortcut is already assigned", "This key is assigned to another active Recall Shortcut. Choose a different key in Details."),
	INVALID_RECALL_HOTKEY: Ta("recall-shortcut-key", "Choose a supported shortcut", "Choose a physical key with Control, Alt, or Meta, or a function key in Recall Shortcut Details."),
	RECALL_HOTKEY_UNAVAILABLE: Ta("recall-key-unavailable", "Recall shortcut is unavailable", "The Recall keyboard listener is unavailable. Check the active workflow and host installation."),
	RECALL_NOT_QUEUED: Ea("recall-not-queued", "Recall is not queued", "Use Queue recall on a matching Recall Shortcut to arm manual Recall. Automatic triggers use their own conditions."),
	RECALL_TARGET_INELIGIBLE: Ea("recall-ineligible", "Recall does not target this generation", "This generation does not match the configured Recall target. Check the generation target in Details."),
	RECALL_ALREADY_ACTIVATED: Ea("recall-activated", "Recall already activated", "This memory set already activated for this generation."),
	RECALL_USE_RESERVED: Ea("recall-reserved", "Recall is reserved", "A matching Recall allowance is reserved by another generation. Wait for that generation to finish."),
	RECALL_QUEUE_LIMIT: Ta("recall-queue-limit", "Recall queue is full", "Cancel unused Recall requests before adding more."),
	RECALL_GRAPH_INVALID: Ta("recall-workflow", "Recall workflow needs attention", "Recall requires a valid active unified workflow. Review Workflow validation before queueing Recall."),
	RECALL_NODE_UNAVAILABLE: Ta("recall-node", "Choose a current Recall Shortcut", "Select a configured Recall Shortcut in the current workflow."),
	RECALL_RECORDS_UNVERIFIED: Ta("recall-records", "Recall records are not verified", "Use records from a current authorized File or Memory read. Changed or invented records cannot be used for Recall."),
	RECALL_PRESENCE_UNVERIFIED: Ta("recall-presence", "Character presence is not verified", "Recall needs the intended character’s current scene presence and supporting source evidence.")
};
for (let e of [
	"DOCUMENT_NOT_AUTHORIZED",
	"FILE_NOT_AUTHORIZED",
	"FILE_TARGET_UNAUTHORIZED",
	"DOCUMENT_LEASE_UNAUTHORIZED"
]) Ma[e] = Oa;
for (let e of [
	"SCOPE_MISMATCH",
	"RECALL_ACTOR_MISMATCH",
	"ACTOR_FILE_SCOPE_MISMATCH",
	"ACTOR_GUIDANCE_SCOPE"
]) Ma[e] = Aa;
for (let e of [
	"STALE_DOCUMENT_SETUP",
	"STALE_DOCUMENT_SCOPE",
	"STALE_FILE_SCOPE",
	"STALE_RECALL_SCOPE",
	"STALE_RECALL_CONTEXT",
	"STALE_RECALL_SHORTCUT",
	"STALE_RECALL_GENERATION",
	"STALE_EFFECT_SCOPE"
]) Ma[e] = ja;
var Na = [
	["INVALID_MEMORY_CONFIG INVALID_MEMORY_CONTEXT INVALID_MEMORY_METADATA INVALID_MEMORY_READ INVALID_MEMORY_RECALL INVALID_MEMORY_SNAPSHOT INVALID_MEMORY_RECEIPTS INVALID_MEMORY_CONTROLS INVALID_MEMORY_CAS", Ta("memory-settings", "Memory settings need attention", "The memory settings or stored data are invalid. Check the active character, store, and node settings in Details.")],
	["INVALID_RECALL_SCOPE INVALID_RECALL_QUEUE INVALID_RECALL_ACTIVATION INVALID_RECALL_TRIGGER INVALID_RECALL_OWNER INVALID_RECALL_AUTHORITY INVALID_RECALL_PORTS INVALID_RECALL_GENERATION INVALID_RECALL_SETTLEMENT", Ta("recall-settings", "Recall settings need attention", "Check the Recall actor, memory set, generation target, and activation settings in Details.")],
	["INVALID_FILE_CONFIG INVALID_FILE_BACKEND_CONFIG INVALID_FILE_METADATA INVALID_FILE_SNAPSHOT INVALID_FILE_INTENT INVALID_FILE_CONTROLS INVALID_FILE_BACKEND_UPDATE INVALID_FILE_RESPONSE", Ta("document-settings", "Document data needs attention", "The document data or storage configuration is invalid. Check Workflow Data and the affected node’s Details.")],
	["INVALID_DOCUMENT_SETUP INVALID_WORKFLOW_DATA INVALID_CLOCK_TEMPLATE DOCUMENT_SETUP_FAILED", Ta("document-setup-invalid", "Check Workflow Data settings", "Check the target name, initial template, format, and visibility in Workflow Data.")],
	["INVALID_INTROSPECTION_EVIDENCE INVALID_ACCEPTED_MEMORY STATE_EVIDENCE_CHANGED", Ta("memory-evidence", "Memory evidence needs attention", "Use current settled source evidence that belongs to the intended character and matches the accepted narrative.")],
	["FILE_CAPTURE_RELEASED FILE_INTENT_UNAUTHORIZED MEMORY_AUTHORITY_RELEASED RECALL_STATE_RELEASED RECALL_CLAIM_CLOSED RECALL_CLAIM_UNAUTHORIZED RECALL_OWNER_MISSING RECALL_SOURCE_UNAVAILABLE RECALL_PROVENANCE_REQUIRED STALE_RECALL_SOURCE STALE_MEMORY_EVIDENCE", Ta("resource-expired", "Recorded source is no longer current", "The recorded source or permission is no longer current. Inspect the active source and prepare this action again.")]
];
for (let [e, t] of Na) for (let n of e.split(" ")) Ma[n] = t;
//#endregion
//#region src/ui/diagnostic-workflow.js?v=0.27.0
var Q = (e, t, n) => ({
	id: e,
	severity: "error",
	title: t,
	message: n
}), Pa = (e, t, n) => ({
	id: e,
	severity: "info",
	title: t,
	message: n
}), Fa = Q("wire-invalid", "Connection needs attention", "Reconnect existing compatible output and input pins. Remove connections to deleted nodes."), Ia = Q("subgraph-invalid", "Subgraph data needs attention", "The subgraph data does not match its saved definition. Check its definition, ports, and overrides before using it."), La = Pa("definition-read-only", "Definition is read-only", "Make a local copy before editing this subgraph definition."), Ra = {
	UPSTREAM_FAILED: Q("upstream-failed", "An earlier step failed", "This step could not run because an earlier step failed. Inspect the earlier step’s diagnostic first."),
	ARTIFACT_KIND: Q("wire-type", "Connection types do not match", "Connect pins with compatible types. The output type must match the input type."),
	AMBIGUOUS_INPUT: Q("input-multiple", "Input has more than one source", "Each named input accepts one source. Remove the extra connection or combine the data in an appropriate node first."),
	CYCLE: Q("workflow-loop", "Connections form a loop", "The connections form a dependency loop. Remove a connection that feeds a later step back into an earlier step."),
	MISSING_PORTAL: Q("portal-missing", "Portal source is missing", "This portal consumer has no publisher in this graph. Select an existing portal or publish a matching output."),
	INVALID_PORTAL: Q("portal-invalid", "Portal needs attention", "Check the portal’s name, source output, and type. Publish an existing output with the same type."),
	MISSING_TERMINAL: Q("terminal-missing", "Workflow needs an output", "Add Review / Publish to finish a unified workflow, or a stage output to finish a helper."),
	DISABLED_OPERATION: Q("dependency-disabled", "A required step is disabled", "Enable the selected step and its required dependencies before using Run to here."),
	INVALID_STAGE_DEPENDENCY: Q("stage-reversed", "Preparation depends on a reply", "A preparation step cannot read response-stage output. Move a compatible node to the response stage or remove the reverse connection."),
	WRONG_PHASE: Q("stage-mismatch", "Workflow stage does not match", "Choose nodes and subgraphs that support the containing workflow stage. Retired workflows are available for archived export."),
	INVALID_PHASE: Q("node-stage", "Node stage does not match", "Choose a supported preparation or response stage in Details for this node."),
	ROOT_ONLY_OPERATION: Q("root-only", "Step belongs in the root workflow", "Place this step in the root workflow. Reusable helpers need explicit snapshot inputs for state."),
	ROOT_BOUNDARY: Q("root-boundary", "Boundary belongs inside a subgraph", "Add Input and Output boundary nodes inside an editable subgraph."),
	ROOT_ONLY: Q("root-authority", "Full workflow acceptance is required", "This action requires the authorized root workflow and cannot run as an isolated helper."),
	ROOT_REQUIRED: Q("root-settlement", "Full workflow acceptance is required", "Accept the full workflow result to commit its prepared changes. A manual preview does not authorize saving."),
	UNKNOWN_OPERATION: Q("operation-unsupported", "Node type is not supported", "This node type or version is not supported by the installed Lattice version. Check the workflow version and node reference."),
	INVALID_SETTINGS: Q("node-settings", "Node settings need attention", "Some saved settings are invalid. Check the affected node’s controls in Details."),
	INVALID_CONFIGURATION: Q("node-configuration", "Node configuration needs attention", "Use valid JSON containing the declared node controls, then complete the required settings in node configuration."),
	INVALID_INPUT: Q("input-invalid", "Input data does not match", "The input data does not match this step’s expected type or shape. Check the connected source and the node’s Details."),
	INVALID_CONTEXT: Q("context-invalid", "Context data does not match", "The context input is invalid. Check the connected context source and its message data."),
	INVALID_TARGET: Q("target-invalid", "Choose a current output", "Select an existing output pin or terminal step in the current workflow."),
	INVALID_SELECTION: Q("selection-changed", "Selection needs attention", "Select current workflow nodes before continuing."),
	INVALID_GROUP: Q("group-selection", "Group selection needs attention", "Select an editable group to ungroup, or at least two ordinary nodes to create a group."),
	INVALID_JSON: Q("workflow-json", "JSON could not be read", "The text is not valid JSON. Check the JSON syntax or choose a valid workflow file."),
	MALFORMED_WORKFLOW: Q("workflow-malformed", "Workflow data is invalid", "The workflow data is invalid or exceeds its size limit. Choose a valid Lattice workflow file."),
	UNSUPPORTED_PACKAGE: Q("workflow-package", "Choose a Lattice workflow", "Choose a compatible Lattice workflow document or supported portable workflow JSON."),
	UNSUPPORTED_VERSION: Q("workflow-version", "Workflow version is not supported", "This workflow uses an unsupported format or runtime version. Open a compatible workflow or check the installed Lattice version."),
	MISSING_DEFINITION: Q("definition-missing", "Subgraph definition is missing", "The subgraph’s exact saved definition is not included. Import a workflow or subgraph package that includes its pinned definition."),
	DEFINITION_CONFLICT: Q("definition-conflict", "Subgraph versions conflict", "Two subgraphs use the same identity and version for different content. Use an unambiguous saved definition or create a local copy."),
	DEFINITION_RECURSION: Q("definition-recursion", "Subgraph includes itself", "A subgraph cannot include itself through nested definitions. Remove the recursive instance."),
	DEFINITION_DEPTH: Q("definition-depth", "Subgraphs are nested too deeply", "The workflow exceeds eight nested subgraph levels. Flatten or simplify the nested definitions."),
	DEFINITION_IN_USE: Q("definition-in-use", "Subgraph is still in use", "Another saved subgraph uses this revision. Remove that dependency before deleting the saved definition."),
	PARAMETER_IN_USE: Q("parameter-in-use", "Parameter is still in use", "Reset the surviving override or remove the enclosing parameter exposure before removing this parameter."),
	BOUNDARY_SELECTION: Q("boundary-copy", "Copy the subgraph or its interior", "Input and Output boundary nodes belong to their subgraph definition. Copy the interior nodes or the whole subgraph instance."),
	STALE_CONTEXT: Q("view-changed", "The view changed", "The view or selection changed after this action was prepared. Reopen the affected controls or select the current node."),
	STALE_DOCUMENT: Q("document-changed", "Workflow changed during editing", "The workflow changed after the edit began. Prepare the edit again from the current workflow."),
	UNSUPPORTED_VIEW: Q("view-unavailable", "Graph view is unavailable", "This graph view is unavailable. Open an existing view in the current workflow."),
	VIEW_INACTIVE: Q("view-inactive", "Graph view is unavailable", "This graph view is unavailable. Open an existing view in the current workflow."),
	STALE_DEFINITION: Q("definition-changed", "Subgraph changed", "The subgraph definition changed after this action was prepared. Reopen the current subgraph and prepare the edit again."),
	STALE_CANDIDATE: Q("candidate-expired", "Review is no longer current", "This candidate is no longer available or no longer matches the selected reply. Prepare a new review from the current source; running model steps again makes another model request."),
	APPLY_UNAVAILABLE: Q("apply-unavailable", "Reply application is unavailable", "Required SillyTavern reply, save, or swipe services are unavailable. Check the host installation before applying this review."),
	APPLY_FAILED: Q("apply-failed", "Reply could not be applied", "The revision could not be applied and the original local message was restored. A save that was attempted may still be unverified; inspect the stored chat before taking another action."),
	MULTIPLE_NATIVE_GENERATIONS: Q("native-multiple", "More than one Generate Reply path", "A unified workflow supports one Generate Reply boundary. Keep one generation path in the selected workflow."),
	NATIVE_ACTIVATION_REQUIRED: Q("activation-required", "Generate Reply needs On Send", "Connect one root On Send activation to Generate Reply. This workflow starts during SillyTavern message generation."),
	NATIVE_OWNER_MISSING: Pa("native-start", "Starts with a message", "This step starts when you send a message. Enable Lattice, then send a message in SillyTavern to run this workflow."),
	OVERLAPPING_GENERATION: Q("generation-overlap", "Generations overlapped", "Another generation started before this workflow finished. Wait for the active generation to finish before starting another."),
	GUIDANCE_OVERFLOW: Q("guidance-budget", "Guidance exceeds the budget", "The guidance exceeds Token budget at Generate Reply. Reduce the guidance or increase Token budget in Details."),
	READ_ONLY: La,
	READ_ONLY_DEFINITION: La
};
for (let e of [
	"DANGLING_WIRE",
	"INVALID_WIRE",
	"INVALID_PORT",
	"CONFIGURATION_PORT_CHANGED"
]) Ra[e] = Fa;
for (let e of [
	"DEFINITION_REF",
	"DEFINITION_HASH",
	"DEFINITION_DATA",
	"DEFINITION_METADATA",
	"DEFINITION_BODY",
	"DEFINITION_INTERFACE",
	"DEFINITION_PARAMETER",
	"INVALID_OVERRIDE",
	"LOCAL_COPY_OWNERSHIP"
]) Ra[e] = Ia;
for (let e of [
	"GRAPH_LIMIT",
	"DEFINITION_LIMIT",
	"OUTPUT_LIMIT",
	"INPUT_LIMIT_EXCEEDED",
	"EVIDENCE_LIMIT",
	"EFFECT_BUNDLE_LIMIT",
	"EFFECT_PREVIEW_LIMIT"
]) Ra[e] = Q("workflow-limit", "Workflow exceeds a size limit", "This workflow or its data exceeds a supported size limit. Simplify the selected workflow or reduce its input data.");
//#endregion
//#region src/ui/diagnostic-copy.js?v=0.27.0
var za = Object.freeze({
	id: "unknown",
	severity: "error",
	title: "Action could not be completed",
	message: "Lattice could not complete this action. Check the workflow and its settings for more information."
}), Ba = {
	id: "save-status-unverified",
	severity: "warning",
	title: "Saving is not confirmed",
	message: "The stored result could not be verified. Confirm the stored data before making another write."
}, Va = [
	[
		"INVALID_EFFECT_RESULT",
		/persistence|verified status/i,
		Ba
	],
	[
		"INVALID_FILE_BACKEND_RESULT",
		/CAS|acknowledge|durable/i,
		Ba
	],
	[
		"INVALID_MEMORY_BACKEND_RESULT",
		/CAS|acknowledge/i,
		Ba
	],
	[
		"INVALID_PORT",
		/editable subgraph|boundary whose port/i,
		{
			id: "boundary-port",
			severity: "error",
			title: "Open an editable subgraph",
			message: "Open an editable subgraph and select its Input or Output boundary to edit the port."
		}
	],
	[
		"FILE_NOT_FOUND",
		/logical document|creation template/i,
		{
			id: "logical-document-missing",
			severity: "error",
			title: "Workflow document is missing",
			message: "Choose an existing document or configure an initial template in Workflow Data before reading this target."
		}
	],
	[
		"MISSING_INPUT",
		/wrapper output.*no connected source/i,
		{
			id: "subgraph-output-missing",
			severity: "error",
			title: "Subgraph output needs a source",
			message: "Open the subgraph and connect a source to its Output boundary before previewing this output."
		}
	],
	[
		"STALE_SOURCE",
		/memory/i,
		{
			id: "memory-source-changed",
			severity: "error",
			title: "Memory evidence changed",
			message: "The memory evidence changed after it was read. Inspect the current memory and its source before preparing another change."
		}
	]
], Ha = {
	APPLY_UNVERIFIED: {
		id: "apply-unverified",
		severity: "warning",
		title: "Reply application is not confirmed",
		message: "Reply application could not be confirmed. Check the current reply and save status before making another write."
	},
	ACCEPTED_SAVE_UNVERIFIED: {
		id: "accepted-save-unverified",
		severity: "warning",
		title: "Saving is not confirmed",
		message: "The accepted reply remains. The save outcome could not be confirmed. Check the stored data before making another write."
	},
	PUBLICATION_UNKNOWN: Ba,
	EFFECT_WRITE_UNKNOWN: Ba,
	STALE_SOURCE: {
		id: "review-source-changed",
		severity: "error",
		title: "Review is out of date",
		message: "The chat, reply, swipe, or prompt changed after this candidate was prepared. This review cannot be applied. Prepare a new candidate from the current source; running model steps again makes another model request."
	},
	MISSING_INPUT: {
		id: "missing-input",
		severity: "error",
		title: "Input needs a connection",
		message: "This step needs an input. Connect a compatible output to that input.",
		technical: "A required input has no connected source."
	}
}, Ua = {
	...va,
	...wa,
	...Ma,
	...Ra,
	...Ha
}, Wa = {
	id: "send-required",
	severity: "info",
	title: "Starts with a message",
	message: "Send a message in SillyTavern to run this workflow."
}, Ga = new Map(Ca.filter(([, , e]) => [
	"summary-truncated",
	"summary-unverified",
	"summary-empty",
	"compression-request",
	"compactor-settings"
].includes(e.id)).map(([e, , t]) => [e, t])), Ka = /* @__PURE__ */ new Map();
Ka.set(Wa.message, Wa);
for (let e of [
	...Object.values(Ua),
	...Ca.map((e) => e[2]),
	...Va.map((e) => e[2]),
	...ya.values()
]) Ka.set(e.message, e);
function qa(e, t) {
	if (t.enabled && [
		"MANUAL_NATIVE_TRIGGER_REQUIRED",
		"NATIVE_OWNER_MISSING",
		"NATIVE_SEND_REQUIRED"
	].includes(e.code)) return Wa;
	for (let [t, n, r] of Va) if (e.code === t && n.test(e.message)) return r;
	for (let [t, n, r] of Ca) if (e.code === t && n.test(e.message)) return r;
	if (t.operation === "smart-compactor" && Ga.has(e.code)) return Ga.get(e.code);
	if (e.code === "MISSING_INPUT" && (t.nodeTitle || t.inputLabel)) return {
		id: "missing-input",
		severity: "error",
		title: "Input needs a connection",
		message: `${t.nodeTitle || "This step"} needs ${t.inputLabel || "an input"}. Connect a compatible output to that input.`,
		technical: "A required input has no connected source."
	};
	let n = [
		"text",
		"context",
		"draft",
		"patches",
		"guidance",
		"data",
		"activation"
	];
	return e.code === "ARTIFACT_KIND" && n.includes(t.outputType) && n.includes(t.inputType) ? {
		id: "wire-type",
		severity: "error",
		title: "Connection types do not match",
		message: `This output carries ${t.outputType}, but this input needs ${t.inputType}. Connect pins with compatible types.`,
		technical: "The output and input types do not match."
	} : e.code.startsWith("PREVIEW_") && !Ua[e.code] ? {
		id: "preview-state",
		severity: "info",
		title: "Preview status",
		message: "Check the selected output’s current preview status."
	} : Ua[e.code] ?? ya.get(e.message) ?? Ka.get(e.message) ?? za;
}
//#endregion
//#region src/ui/diagnostics.js
var Ja = (e, t) => {
	try {
		let n = Object.getOwnPropertyDescriptor(e, t);
		return n && "value" in n ? n.value : void 0;
	} catch {
		return;
	}
}, Ya = (e) => {
	try {
		return !!e && typeof e == "object" && [Object.prototype, null].includes(Object.getPrototypeOf(e));
	} catch {
		return !1;
	}
}, Xa = (e, t = 4096) => typeof e == "string" ? e.slice(0, t) : "", Za = (e) => {
	let t = Xa(e, 160).replace(/[\u0000-\u001f\u007f]/g, " ").trim();
	return /(?:api[_ -]?key|authorization|bearer\s|password|secret\s*[=:]|sk-[\w-]+)/i.test(t) ? "" : t;
};
function Qa(e) {
	if (typeof e == "string") {
		let t = Xa(e), n = /^([A-Z][A-Z0-9_]{0,63}):\s*(.*)$/s.exec(t);
		return {
			code: n?.[1] || "",
			message: n?.[2] ?? t,
			nodeId: ""
		};
	}
	if (!Ya(e)) return {
		code: "",
		message: "",
		nodeId: ""
	};
	let t = Ja(e, "code");
	return {
		code: typeof t == "string" && /^[A-Z][A-Z0-9_]{0,63}$/.test(t) ? t : "",
		message: Xa(Ja(e, "message")),
		nodeId: Xa(Ja(e, "nodeId"), 256),
		address: $a(Ja(e, "address"))
	};
}
function $a(e) {
	if (!Ya(e)) return;
	let t = Xa(Ja(e, "workflowId"), 256), n = Xa(Ja(e, "nodeId"), 256), r = Ja(e, "instancePath"), i = Ja(r, "length");
	if (!t || !n || !Array.isArray(r) || !Number.isSafeInteger(i) || i > 8) return;
	let a = [];
	for (let e = 0; e < i; e++) {
		let t = Ja(r, String(e));
		if (typeof t != "string" || !t || t.length > 256) return;
		a.push(t);
	}
	return {
		workflowId: t,
		instancePath: a,
		nodeId: n
	};
}
function eo(e) {
	if (!Ya(e)) return {};
	let t = {};
	for (let n of [
		"operation",
		"nodeTitle",
		"inputLabel",
		"outputType",
		"inputType",
		"action"
	]) t[n] = Za(Ja(e, n));
	return t.enabled = Ja(e, "enabled") === !0, t;
}
var to = (e) => JSON.stringify([
	e.code,
	e.message,
	e.address ?? e.nodeId
]);
function no(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n++) t = Math.imul(t ^ e.charCodeAt(n), 16777619);
	return (t >>> 0).toString(36);
}
function ro(e, t = {}) {
	let n = Qa(e), r = qa(n, eo(t));
	return {
		id: `${r.id}-${no(to(n))}`,
		severity: r.severity,
		title: r.title,
		message: r.message,
		technical: n.code ? {
			code: n.code,
			message: r.id === "unknown" ? "No safe technical description is available for this error." : r.technical ?? r.message
		} : null,
		...n.address ? { address: n.address } : {}
	};
}
function io(e, t = {}) {
	return ro(e, t).message;
}
function ao(e, t = {}) {
	if (!Array.isArray(e)) return [];
	let n = [], r = /* @__PURE__ */ new Set(), i = Math.min(Ja(e, "length") || 0, 1e3);
	for (let a = 0; a < i; a++) {
		let i = Ja(e, String(a)), o = to(Qa(i));
		r.has(o) || (r.add(o), n.push(ro(i, t)));
	}
	return n;
}
//#endregion
//#region ui/DiagnosticMessage.svelte
var oo = /* @__PURE__ */ G("<code class=\"svelte-i9ibmv\"> </code>"), so = /* @__PURE__ */ G("<p class=\"svelte-i9ibmv\"> </p>"), co = /* @__PURE__ */ G("<details class=\"svelte-i9ibmv\"><summary class=\"svelte-i9ibmv\">Technical details</summary><!><!></details>"), lo = /* @__PURE__ */ G("<button type=\"button\" class=\"svelte-i9ibmv\">Show node</button>"), uo = /* @__PURE__ */ G("<div class=\"pc-diagnostic svelte-i9ibmv\"><strong class=\"svelte-i9ibmv\"><span class=\"pc-diagnostic-severity\"> </span> </strong> <p class=\"svelte-i9ibmv\"> </p> <!> <!></div>");
function fo(e, t) {
	Ue(t, !0);
	let n = Ni(t, "context", 19, () => ({})), r = /* @__PURE__ */ F(() => t.diagnostic ?? ro(t.issue, n())), i = /* @__PURE__ */ F(() => H(r).address), a = /* @__PURE__ */ F(() => !!(t.reveal && H(i) && typeof H(i).workflowId == "string" && H(i).workflowId.trim() && H(i).workflowId.length <= 256 && typeof H(i).nodeId == "string" && H(i).nodeId.trim() && H(i).nodeId.length <= 256 && Array.isArray(H(i).instancePath) && H(i).instancePath.length <= 8 && H(i).instancePath.every((e) => typeof e == "string" && e.trim() && e.length <= 256))), o = (e) => ({
		info: "Information",
		warning: "Warning",
		error: "Error"
	})[e];
	var s = uo(), c = R(s), l = R(c), u = R(l);
	P(l);
	var d = B(l);
	P(c);
	var f = B(c, 2), p = R(f, !0);
	P(f);
	var m = B(f, 2), h = (e) => {
		var t = co(), n = B(R(t)), i = (e) => {
			var t = oo(), n = R(t, !0);
			P(t), V(() => q(n, H(r).technical.code)), K(e, t);
		};
		J(n, (e) => {
			H(r).technical.code && e(i);
		});
		var a = B(n), o = (e) => {
			var t = so(), n = R(t, !0);
			P(t), V(() => q(n, H(r).technical.message)), K(e, t);
		};
		J(a, (e) => {
			H(r).technical.message && e(o);
		}), P(t), K(e, t);
	};
	J(m, (e) => {
		H(r).technical && e(h);
	});
	var g = B(m, 2), _ = (e) => {
		var n = lo();
		W("click", n, () => {
			H(a) && H(i) && t.reveal?.({
				...H(i),
				instancePath: [...H(i).instancePath]
			});
		}), K(e, n);
	};
	J(g, (e) => {
		H(a) && e(_);
	}), P(s), V((e) => {
		Z(s, "data-diagnostic", H(r).id), Z(s, "data-severity", H(r).severity), q(u, `${e ?? ""}:`), q(d, ` ${H(r).title ?? ""}`), q(p, H(r).message);
	}, [() => o(H(r).severity)]), K(e, s), We();
}
Er(["click"]);
//#endregion
//#region ui/NodeProfilePicker.svelte
var po = /* @__PURE__ */ G("<div class=\"node-model-meta svelte-jdmiua\"> </div>"), mo = /* @__PURE__ */ Fr("<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-jdmiua\"><path d=\"m5 12 4 4L19 6\" class=\"svelte-jdmiua\"></path></svg>"), ho = /* @__PURE__ */ G("<button type=\"button\" role=\"option\"><span class=\"profile-option-copy svelte-jdmiua\"><span class=\"profile-name svelte-jdmiua\"> </span><span class=\"profile-meta svelte-jdmiua\"> </span></span><span class=\"profile-check svelte-jdmiua\"><!></span></button>"), go = /* @__PURE__ */ G("<p class=\"profile-empty svelte-jdmiua\"> </p>"), _o = /* @__PURE__ */ G("<div class=\"profile-error svelte-jdmiua\"><!></div>"), vo = /* @__PURE__ */ G("<div class=\"profile-menu svelte-jdmiua\"><div class=\"profile-search svelte-jdmiua\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-jdmiua\"><circle cx=\"10\" cy=\"10\" r=\"6\" class=\"svelte-jdmiua\"></circle><path d=\"m15 15 5 5\" class=\"svelte-jdmiua\"></path></svg><input role=\"combobox\" aria-label=\"Search connection profiles\" aria-autocomplete=\"list\" aria-expanded=\"true\" placeholder=\"Search connection profiles…\" autocomplete=\"off\" spellcheck=\"false\" maxlength=\"200\" class=\"svelte-jdmiua\"/></div> <div class=\"profile-options svelte-jdmiua\" role=\"listbox\" aria-label=\"Connection profiles\"></div> <!></div>"), yo = /* @__PURE__ */ G("<div class=\"pc-node-profile svelte-jdmiua\" role=\"group\" aria-label=\"Node connection profile\"><!> <div class=\"profile-picker svelte-jdmiua\"><button type=\"button\" class=\"profile-bar svelte-jdmiua\" aria-haspopup=\"listbox\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-jdmiua\"><path d=\"M12 22v-5M15 8V2M17 8a1 1 0 0 1 1 1v4a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1zM9 8V2\" class=\"svelte-jdmiua\"></path></svg><span class=\"profile-value svelte-jdmiua\"> </span><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-jdmiua\"><path d=\"m6 9 6 6 6-6\" class=\"svelte-jdmiua\"></path></svg></button> <!></div></div>");
function bo(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ I(!1), r = /* @__PURE__ */ I(""), i = /* @__PURE__ */ I(0), a = /* @__PURE__ */ I(""), o = /* @__PURE__ */ I(!1), s = -1, c = 0, l = !1, u = /* @__PURE__ */ I(35), d, f, p = /* @__PURE__ */ I(void 0), m = /* @__PURE__ */ I(void 0), h = (e) => e.stopPropagation();
	function g(e) {
		let t = (e) => {
			te(e);
		}, n = (t) => {
			t.detail !== e && A();
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
	let _ = /* @__PURE__ */ F(() => H(r).toLocaleLowerCase().trim().split(/\s+/).filter(Boolean)), v = /* @__PURE__ */ F(() => [...t.row.options.filter((e) => e.active), ...t.row.options.filter((e) => !e.active && H(_).every((t) => `${e.label} ${e.apiLabel} ${e.model}`.toLocaleLowerCase().includes(t)))]), y = /* @__PURE__ */ F(() => Math.max(1, Math.min(330, t.row.visibleBounds.w - 16))), b = /* @__PURE__ */ F(() => Math.max(t.row.visibleBounds.x + 8, Math.min(t.row.x, t.row.visibleBounds.x + t.row.visibleBounds.w - H(y) - 8)) - t.row.x), x = /* @__PURE__ */ F(() => t.row.h + t.row.clearance + 7), S = /* @__PURE__ */ F(() => t.row.visibleBounds.y + t.row.visibleBounds.h - (t.row.y + H(x) + H(u) + 6) - 8), C = /* @__PURE__ */ F(() => t.row.y + H(x) - t.row.visibleBounds.y - 14), w = /* @__PURE__ */ F(() => H(S) < 130 && H(C) > H(S)), T = /* @__PURE__ */ F(() => Math.max(H(C), H(S)) < 78), E = /* @__PURE__ */ F(() => Math.max(0, H(T) ? t.row.visibleBounds.h - 16 : H(w) ? H(C) : H(S))), D = /* @__PURE__ */ F(() => Math.max(0, Math.min(244, H(E) - 54))), O = /* @__PURE__ */ F(() => t.row.visibleBounds.y + 8 - t.row.y - H(x)), k = (e) => `${t.row.id}-profile-option-${e}`;
	function A(e = !1, t = !1) {
		t || (c++, l = !1), L(n, !1), L(r, ""), L(a, ""), L(o, !1), e && f?.focus({ preventScroll: !0 });
	}
	async function j() {
		if (!t.row.editable) return;
		let e = t.row.selection.selectionKey;
		if (await t.refreshProfiles?.(t.row.selection), !t.row.editable || !d?.isConnected || t.row.selection.selectionKey !== e) return;
		let c = f.getBoundingClientRect(), l = c.width > 0 && t.row.w > 0 ? c.width / t.row.w : 1;
		L(u, c.height > 0 ? c.height / l : 35, !0), window.dispatchEvent(new CustomEvent("pc-node-profile-open", { detail: d })), s = t.row.authorityVersion, L(r, ""), L(a, ""), L(o, !1), L(i, Math.max(0, H(v).findIndex((e) => e.value === t.row.value)), !0), L(n, !0), await mr(), H(n) && (H(p)?.focus({ preventScroll: !0 }), H(m) && (H(m).scrollTop = 0));
	}
	function M() {
		let e = H(v).find((e) => e.active);
		L(i, !H(_).length || e && H(_).every((t) => e.label.toLocaleLowerCase().includes(t)) ? 0 : H(v).length > 1 ? 1 : -1, !0), H(m) && (H(m).scrollTop = 0);
	}
	async function ee(e) {
		if (!H(n) || !t.row.editable || H(o) || t.row.authorityVersion !== s || !t.editProfile) return;
		let r = s, i = t.row.selection, u = c;
		L(o, !0), L(a, ""), l = !0;
		try {
			let o = await t.editProfile(i, e.value);
			if (o.ok) {
				c === u && d?.isConnected && t.row.selection.selectionKey === i.selectionKey && JSON.stringify(t.row.selection.address) === JSON.stringify(i.address) && (!H(n) || s === r) && A(!0);
				return;
			}
			if (!H(n) || t.row.authorityVersion !== r) return;
			L(a, o.error.code + ": " + o.error.message);
		} catch (e) {
			H(n) && t.row.authorityVersion === r && L(a, e instanceof Error ? e.message : "Could not change connection profile", !0);
		} finally {
			t.row.authorityVersion === r && L(o, !1), c === u && (l = !1);
		}
	}
	async function te(e) {
		h(e), H(n) ? e.key === "Escape" ? (e.preventDefault(), A(!0)) : e.key === "ArrowDown" || e.key === "ArrowUp" ? (e.preventDefault(), L(i, Math.max(0, Math.min(H(v).length - 1, H(i) + (e.key === "ArrowDown" ? 1 : -1))), !0), await mr(), H(m)?.querySelector(".is-active")?.scrollIntoView?.({ block: "nearest" }), H(p)?.focus({ preventScroll: !0 })) : e.key === "Enter" && e.target === H(p) && (e.preventDefault(), H(v)[H(i)] && await ee(H(v)[H(i)])) : [
			"ArrowDown",
			"ArrowUp",
			"Enter",
			" "
		].includes(e.key) && (e.preventDefault(), await j());
	}
	function ne(e) {
		e.preventDefault(), h(e), H(m) && (H(m).scrollTop += e.deltaY * (e.deltaMode === 1 ? 18 : e.deltaMode === 2 ? H(m).clientHeight : 1));
	}
	Cn(() => {
		H(n) && (t.row.authorityVersion !== s || !t.row.editable) && A(!1, !0);
	});
	var re = yo();
	U("pointerdown", on, (e) => {
		(H(n) || l) && !d.contains(e.target) && A();
	});
	let ie;
	var ae = R(re), oe = (e) => {
		var n = po(), r = R(n, !0);
		P(n), V(() => {
			Z(n, "title", t.row.model), q(r, t.row.model);
		}), K(e, n);
	};
	J(ae, (e) => {
		t.row.model && e(oe);
	});
	var se = B(ae, 2);
	let ce;
	var le = R(se), ue = B(R(le)), de = R(ue, !0);
	P(ue), Me(), P(le), Mi(le, (e) => f = e, () => f);
	var fe = B(le, 2), pe = (e) => {
		var n = vo();
		let s;
		var c = R(n), l = B(R(c));
		X(l), Mi(l, (e) => L(p, e), () => H(p)), P(c);
		var d = B(c, 2);
		let f;
		Y(d, 23, () => H(v), (e) => e.value, (e, n, r) => {
			var a = ho();
			let s;
			var c = R(a), l = R(c), u = R(l, !0);
			P(l);
			var d = B(l), f = R(d, !0);
			P(d), P(c);
			var p = B(c), m = R(p), h = (e) => {
				K(e, mo());
			};
			J(m, (e) => {
				H(n).value === t.row.value && e(h);
			}), P(p), P(a), V((e, c) => {
				Z(a, "id", e), s = fi(a, 1, "profile-option svelte-jdmiua", null, s, { "is-active": H(r) === H(i) }), Z(a, "aria-selected", H(n).value === t.row.value), a.disabled = H(o), Z(l, "title", H(n).label), q(u, H(n).label), q(f, c);
			}, [() => k(H(r)), () => H(n).active ? "Follows SillyTavern’s current model" : [H(n).apiLabel, H(n).model].filter(Boolean).join(" · ")]), W("click", a, () => ee(H(n))), K(e, a);
		}, (e) => {
			var t = go(), n = R(t, !0);
			P(t), V((e) => q(n, e), [() => H(r).trim() ? "No connection profiles match. Clear the search to see available profiles." : "No connection profiles are available. Add one in SillyTavern’s Connection Manager."]), K(e, t);
		}), P(d), Mi(d, (e) => L(m, e), () => H(m));
		var h = B(d, 2), g = (e) => {
			var t = _o();
			fo(R(t), { get issue() {
				return H(a);
			} }), P(t), K(e, t);
		};
		J(h, (e) => {
			H(a) && e(g);
		}), P(n), V((e) => {
			s = mi(n, "", s, {
				width: `${H(y)}px`,
				"max-height": `${H(E)}px`,
				left: `${H(b)}px`,
				top: H(T) ? `${H(O)}px` : H(w) ? "auto" : `${H(u) + 6}px`,
				bottom: !H(T) && H(w) ? `${H(u) + 6}px` : "auto"
			}), Z(l, "aria-controls", `${t.row.id}-profile-list`), Z(l, "aria-activedescendant", e), Z(d, "id", `${t.row.id}-profile-list`), f = mi(d, "", f, { "max-height": `${H(D)}px` });
		}, [() => H(i) >= 0 && H(v).length ? k(H(i)) : void 0]), W("input", l, M), Oi(l, () => H(r), (e) => L(r, e)), U("wheel", d, ne), K(e, n);
	};
	J(fe, (e) => {
		H(n) && e(pe);
	}), P(se), P(re), Mi(re, (e) => d = e, () => d), ri(re, (e) => g?.(e)), V(() => {
		Z(re, "data-id", t.row.id), ie = mi(re, "", ie, {
			left: `${t.row.x}px`,
			top: `${t.row.y}px`,
			width: `${t.row.w}px`,
			"z-index": H(n) ? 20 : 2
		}), ce = mi(se, "", ce, { top: `${H(x)}px` }), Z(le, "title", t.row.label), Z(le, "aria-label", `Connection profile: ${t.row.label}`), Z(le, "aria-expanded", H(n)), le.disabled = !t.row.editable, q(de, t.row.label);
	}), U("wheel", re, h), W("click", le, () => H(n) ? A() : j()), K(e, re), We();
}
Er(["click", "input"]);
//#endregion
//#region ui/CanvasLayer.svelte
var xo = /* @__PURE__ */ G("<div class=\"pc-viewport\" data-pc-renderer=\"svelte\"><div class=\"pc-comment-layer svelte-o7b704\"></div> <svg class=\"pc-wires\" aria-label=\"Canvas connections\"><!></svg> <div class=\"pc-nodes\"><!> <!> <!></div> <div class=\"pc-node-profile-layer svelte-o7b704\"></div></div>");
function So(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ I([]), r = /* @__PURE__ */ I([]), i = /* @__PURE__ */ I([]), a = /* @__PURE__ */ I({}), o = /* @__PURE__ */ I([]), s = /* @__PURE__ */ I([]), c = /* @__PURE__ */ I({
		select() {},
		update() {},
		command() {}
	}), l = /* @__PURE__ */ I(null), u = /* @__PURE__ */ I({
		w: 4e3,
		h: 4e3
	}), d, f, p, m;
	function h() {
		return {
			viewport: d,
			svg: f,
			nodeLayer: p,
			commentLayer: m
		};
	}
	function g(e, t) {
		L(o, e), L(c, t);
	}
	function _(e) {
		L(a, e);
	}
	function v(e) {
		L(n, e);
	}
	function y(e) {
		L(s, e);
	}
	function b(e) {
		L(r, e);
	}
	function x(e, t, n) {
		L(i, e), L(u, t), L(l, n);
	}
	function S(e, t) {
		let i = new Map(e.map((e) => [e.id, e])), a = new Map(t.map((e) => [e.id, e]));
		L(n, H(n).map((e) => i.has(e.id) ? {
			...e,
			...i.get(e.id)
		} : e)), L(o, H(o).map((e) => i.has(e.id) ? {
			...e,
			...i.get(e.id)
		} : e)), L(r, H(r).map((e) => a.has(e.id) ? {
			...e,
			...a.get(e.id)
		} : e));
	}
	var C = {
		getLayers: h,
		setComments: g,
		setRecallStatus: _,
		setNodes: v,
		setNodeProfiles: y,
		setGroups: b,
		setWires: x,
		setPositions: S
	}, w = xo(), T = R(w);
	Y(T, 21, () => H(o), (e) => e.id, (e, t) => {
		da(e, {
			get comment() {
				return H(t);
			},
			get actions() {
				return H(c);
			}
		});
	}), P(T), Mi(T, (e) => m = e, () => m);
	var E = B(T, 2);
	oa(R(E), {
		get wires() {
			return H(i);
		},
		get ghost() {
			return H(l);
		}
	}), P(E), Mi(E, (e) => f = e, () => f);
	var D = B(E, 2), O = R(D);
	Y(O, 17, () => H(r).filter((e) => !e.collapsed), (e) => e.id, (e, n) => {
		na(e, {
			get group() {
				return H(n);
			},
			get actions() {
				return t.actions;
			}
		});
	});
	var k = B(O, 2);
	Y(k, 17, () => H(n), (e) => e.id, (e, n) => {
		{
			let r = /* @__PURE__ */ F(() => ({
				...H(n),
				recall: H(a)[H(n).id]
			}));
			$i(e, {
				get card() {
					return H(r);
				},
				get actions() {
					return t.actions;
				}
			});
		}
	}), Y(B(k, 2), 17, () => H(r).filter((e) => e.collapsed), (e) => e.id, (e, n) => {
		na(e, {
			get group() {
				return H(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), P(D), Mi(D, (e) => p = e, () => p);
	var A = B(D, 2);
	return Y(A, 21, () => H(s), (e) => e.id, (e, n) => {
		bo(e, {
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
	}), P(A), P(w), Mi(w, (e) => d = e, () => d), V(() => {
		Z(E, "width", H(u).w), Z(E, "height", H(u).h), Z(E, "viewBox", `0 0 ${H(u).w} ${H(u).h}`);
	}), K(e, w), We(C);
}
//#endregion
//#region ui/workspace-menu-model.ts
var Co = {
	new: "yellow",
	save: "blue",
	"save-as": "blue",
	"download-document": "blue",
	export: "blue",
	"export-archived-workflows": "blue",
	"delete-selection": "red",
	"reset-layout": "green",
	theme: "purple",
	"add-node": "blue",
	"details-selection": "blue",
	"create-subgraph": "purple",
	"save-subgraph": "blue",
	"comment-selection": "yellow",
	"add-comment": "yellow",
	"manage-portals": "purple",
	"validate-workflow": "green",
	"review-host-result": "blue",
	"stop-workflow": "red",
	"run-preview": "green",
	configure: "blue",
	"story-documents": "teal",
	"memory-recall-menu": "purple",
	"recall-queue-selected": "green",
	"recall-queue-all": "green",
	"recall-cancel-selected": "red",
	"recall-cancel-all": "red",
	"memory-recall": "purple",
	help: "blue"
}, $ = (e, t, n = "", r = !1, i = "") => ({
	label: e,
	command: t,
	icon: n,
	iconTone: Co[t],
	disabled: r,
	shortcut: i
}), wo = (e, t, n, r = !1, i = "check") => ({
	label: e,
	command: t,
	checked: n,
	disabled: r,
	kind: i
});
function To(e, t = {
	previewOpen: !0,
	shelfOpen: !0
}) {
	let n = e.menuCapabilities ?? {}, r = e.rootWorkflow ?? e.workflow, i = e.outputPreview, a = !!e.readOnly, o = !!r?.ownedBusy, s = e.document, c = e.recall?.commands.selected, l = e.recall?.commands.all;
	return [
		{
			name: "File",
			groups: [
				[
					$("New workflow", "new", "add", !!s?.busy, "Ctrl N"),
					$("Open workflow…", "open-workflow", "open", !!s?.busy, "Ctrl O"),
					{
						...$("Open Recent", "recent-menu", "open", !s?.native || !s.recents.length || s.busy),
						children: [...(s?.recents ?? []).map((e) => $(e.name, "open-recent:" + e.id, "open")), {
							...$("Clear Recent", "clear-recent", "clear"),
							title: "Files stay on disk; only this recent list is cleared."
						}]
					},
					$("Open examples…", "examples", "library", !!s?.busy)
				],
				[{
					...$("Recover previous workflows", "recovery-menu", "library", !s?.recovery.length || s.busy),
					children: (s?.recovery ?? []).map((e) => ({
						...$(e.name, "recover-workflow:" + e.id, "open"),
						reason: e.issue ? io(e.issue) : void 0
					}))
				}],
				[...s?.native ? [$("Save workflow", "save", "save", s.busy, "Ctrl S"), $("Save As…", "save-as", "save", s.busy, "Ctrl Shift S")] : [$("Save As…", "download-document", "save", !!s?.busy, "Ctrl S")], $("Rename workflow…", "rename", "rename", !r)],
				[
					$("Import into graph…", "import-into-graph", "open", a),
					$("Export workflow JSON…", "export", "export", !r),
					...e.hasArchivedWorkflows ? [$("Export archived workflows", "export-archived-workflows", "export")] : []
				],
				[$("Close workspace", "close", "close")]
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
					wo("Show Details", "inspector", !!e.inspectorOpen),
					wo("Show preview", "toggle-preview", t.previewOpen),
					wo("Show node shelf", "toggle-shelf", t.shelfOpen)
				],
				[wo("Follow selection", "follow-preview", i?.followSelection ?? !0, !i, "radio"), wo("Pin current output", "pin-preview", !!i?.pinned, !i?.selectedKey || i?.status === "removed", "radio")],
				[
					$("Fit graph", "fit", "fit"),
					$("Fit selection", "fit-selection", "fit", !n.fitSelection, "F"),
					$("Center selection", "center-selection", "fit", !n.hasSelection),
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
					wo("Select tool", "select-tool", e.camera?.mode !== "pan", !1, "radio"),
					wo("Pan tool", "pan-tool", e.camera?.mode === "pan", !1, "radio"),
					wo("Compact cards", "compact-selection", !!n.compactChecked, !n.compact)
				]
			]
		},
		{
			name: "Workflow",
			groups: [
				[wo("Enable Lattice", "enable-workflow", !!e.enabled, !r)],
				[
					$("Validate workflow", "validate-workflow", "check", !r),
					$("Review host result", "review-host-result", "details", !r?.nodes?.some((e) => e.terminal)),
					$("Stop workflow", "stop-workflow", "stop", !n.stop)
				],
				[{
					...$("Run to current output", "run-preview", "run", !i?.runHere?.enabled || !!i?.busy || o),
					reason: i?.busy || o ? "Wait for the current run to finish." : i?.runHere?.reason ?? (i?.selectedKey ? void 0 : "Select a node output to preview first.")
				}, $("Run details…", "run-details", "details", !e.runDetails)],
				[{
					...$("Configure", "configure", "details"),
					children: [$("Workflow Data…", "story-documents", "library")]
				}],
				[{
					...$("Memory recall", "memory-recall-menu", "arm"),
					children: [
						{
							...$("Queue recall for selected nodes", "recall-queue-selected", "add", !c?.queueNodeIds.length),
							reason: c?.queueNodeIds.length ? void 0 : c?.queueReason || "Select an eligible Recall node first."
						},
						{
							...$("Cancel recall for selected nodes", "recall-cancel-selected", "clear", !c?.cancelNodeIds.length),
							reason: c?.cancelNodeIds.length ? void 0 : c?.cancelReason || "Select a node with queued recall first."
						},
						{
							...$("Queue recall for all eligible nodes", "recall-queue-all", "add", !l?.queueNodeIds.length),
							reason: l?.queueNodeIds.length ? void 0 : l?.queueReason || "No Recall nodes are eligible to queue."
						},
						{
							...$("Cancel all queued recall", "recall-cancel-all", "clear", !l?.cancelNodeIds.length),
							reason: l?.cancelNodeIds.length ? void 0 : l?.cancelReason || "No recall is queued to cancel."
						},
						$("Memory recall overview…", "memory-recall", "details")
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
var Eo = /* @__PURE__ */ new Set([
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
	"story-documents",
	"memory-recall"
]), Do = {
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
}, Oo = /* @__PURE__ */ Fr("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\" focusable=\"false\"><path></path></svg>"), ko = /* @__PURE__ */ G("<small style=\"display:block;white-space:normal;font-size:11px;line-height:1.4\"> </small>"), Ao = /* @__PURE__ */ G("<kbd class=\"pc-workspace-menu-shortcut\" aria-hidden=\"true\"> </kbd>"), jo = /* @__PURE__ */ G("<span class=\"pc-workspace-menu-shortcut\" aria-hidden=\"true\"></span>"), Mo = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-workspace-menu-item\" tabindex=\"-1\"><span class=\"pc-workspace-menu-icon\" aria-hidden=\"true\"><!></span> <span class=\"pc-workspace-menu-state\" aria-hidden=\"true\"> </span> <span class=\"pc-workspace-menu-label\"> <!></span> <!> <span class=\"pc-workspace-menu-caret\" aria-hidden=\"true\"> </span></button>"), No = /* @__PURE__ */ G("<button type=\"button\" role=\"menuitem\" class=\"pc-flat-menu\" aria-haspopup=\"menu\"> </button>"), Po = /* @__PURE__ */ G("<div class=\"pc-workspace-menu-separator\" role=\"separator\"></div>"), Fo = /* @__PURE__ */ G("<!> <!>", 1), Io = /* @__PURE__ */ G("<div id=\"pc-workspace-submenu\" class=\"pc-workspace-menu-panel pc-workspace-submenu\" role=\"menu\" tabindex=\"-1\"><!></div>"), Lo = /* @__PURE__ */ G("<div id=\"pc-workspace-menu\" class=\"pc-workspace-menu-panel\" role=\"menu\" tabindex=\"-1\"></div> <!>", 1), Ro = /* @__PURE__ */ G("<div class=\"pc-workspace-menus\" role=\"menubar\" tabindex=\"-1\" aria-label=\"Workspace menus\"><!> <!></div>");
function zo(e, t) {
	let n = Rr();
	Ue(t, !0);
	let r = (e, t = d, r = d) => {
		var i = Lr();
		Y(z(i), 17, t, qr, (e, t) => {
			var i = Mo(), a = R(i), o = R(a), s = (e) => {
				var n = Oo(), r = R(n);
				P(n), V(() => Z(r, "d", Do[H(t).icon])), K(e, n);
			};
			J(o, (e) => {
				H(t).icon && Do[H(t).icon] && e(s);
			}), P(a);
			var c = B(a, 2), l = R(c, !0);
			P(c);
			var u = B(c, 2), d = R(u, !0), f = B(d), m = (e) => {
				var r = ko(), i = R(r, !0);
				P(r), V(() => {
					Z(r, "id", n + "-reason-" + H(t).command), q(i, H(t).reason);
				}), K(e, r);
			};
			J(f, (e) => {
				H(t).reason && e(m);
			}), P(u);
			var h = B(u, 2), g = (e) => {
				var n = Ao(), r = R(n, !0);
				P(n), V(() => q(r, H(t).shortcut)), K(e, n);
			}, _ = (e) => {
				K(e, jo());
			};
			J(h, (e) => {
				H(t).shortcut ? e(g) : e(_, -1);
			});
			var v = B(h, 2), y = R(v, !0);
			P(v), P(i), V(() => {
				Z(i, "role", H(t).kind === "radio" ? "menuitemradio" : H(t).kind === "check" ? "menuitemcheckbox" : "menuitem"), Z(i, "title", H(t).title), Z(i, "aria-label", H(t).label), Z(i, "aria-describedby", H(t).reason ? n + "-reason-" + H(t).command : void 0), Z(i, "aria-disabled", !!H(t).disabled), Z(i, "aria-checked", H(t).kind ? !!H(t).checked : void 0), Z(i, "aria-haspopup", H(t).children ? "menu" : void 0), Z(i, "aria-expanded", H(t).children ? H(p) === H(t) : void 0), Z(i, "aria-controls", H(t).children && H(p) === H(t) ? "pc-workspace-submenu" : void 0), Z(i, "data-command", H(t).command), Z(i, "data-tone", H(t).tone), i.disabled = H(t).disabled, Z(a, "data-icon-tone", H(t).iconTone), q(l, H(t).checked ? H(t).kind === "radio" ? "●" : "✓" : ""), q(d, H(t).label), q(y, H(t).children ? "›" : "");
			}), W("click", i, (e) => k(H(t), e.currentTarget)), U("pointerenter", i, (e) => {
				r() || (H(t).children ? O(H(t), e.currentTarget) : L(p, null));
			}), K(e, i);
		}), K(e, i);
	}, i = /* @__PURE__ */ F(() => To(t.state, t.panels)), a = /* @__PURE__ */ I(""), o = /* @__PURE__ */ I(0), s, c = /* @__PURE__ */ I(null), l = /* @__PURE__ */ I(null), u = null, f = null, p = /* @__PURE__ */ I(null), m = /* @__PURE__ */ I(0), h = /* @__PURE__ */ I(0), g = /* @__PURE__ */ I(0), _ = /* @__PURE__ */ I(0), v = 0, y = "", b = "", x = 0, S = {}, C = /* @__PURE__ */ F(() => `${t.state.menuContextKey ?? ""}:${t.state.graphId}:${t.state.graphViews?.active.key ?? ""}:${t.state.graphViews?.viewEpoch ?? ""}`);
	Cn(() => {
		H(a) && y !== H(C) && T();
	});
	let w = (e) => e ? [...e.querySelectorAll("button:not(:disabled)")] : [];
	function T(e = !1) {
		v++, L(a, ""), L(p, null), b = "", e && u?.isConnected && u.focus({ preventScroll: !0 });
	}
	function E(e, t, n = !1) {
		let r = e.getBoundingClientRect(), i = window.innerWidth, a = window.innerHeight, o = n ? t.right - 1 : t.left, s = n ? t.top : t.bottom + 2;
		return n && o + r.width > i - 4 && (o = t.left - r.width + 1, o < 4 && (o = t.left, s = t.bottom + r.height <= a - 4 ? t.bottom : t.top - r.height)), {
			x: Math.max(4, Math.min(o, i - r.width - 4)),
			y: Math.max(4, Math.min(s, a - r.height - 4))
		};
	}
	async function D(e, n, r = "first", s = !1) {
		if (H(a) === e && s) {
			T(!0);
			return;
		}
		t.actions.resizeStart?.(), L(a, e, !0), L(p, null), u = n, L(o, H(i).findIndex((t) => t.name === e), !0), y = H(C), b = "";
		let l = ++v;
		if (await mr(), l !== v || !H(c)) return;
		let d = E(H(c), n.getBoundingClientRect());
		L(m, d.x, !0), L(h, d.y, !0), r && (r === "last" ? w(H(c)).at(-1) : w(H(c))[0])?.focus();
	}
	async function O(e, n, r = !1) {
		if (e.disabled || !e.children || !H(a)) return;
		e.command === "memory-recall-menu" && t.actions.recall?.refresh(), L(p, e), f = n, b = "";
		let i = v;
		if (await mr(), i !== v || !H(l) || H(p) !== e) return;
		if (e.command === "memory-recall-menu") {
			let e = t.actions.recall?.capture(t.state.recall?.commands.selected.relevantNodeIds ?? []), n = t.actions.recall?.capture(t.state.recall?.commands.all.relevantNodeIds ?? [], "all"), r = () => ({
				ok: !1,
				error: {
					code: "RECALL_UNAVAILABLE",
					message: "Memory recall is unavailable."
				}
			});
			S = {
				"recall-queue-selected": () => e?.queue() ?? r(),
				"recall-cancel-selected": () => e?.cancel() ?? r(),
				"recall-queue-all": () => n?.queue() ?? r(),
				"recall-cancel-all": () => n?.cancel() ?? r()
			};
		}
		let o = E(H(l), n.getBoundingClientRect(), !0);
		L(g, o.x, !0), L(_, o.y, !0), r && w(H(l))[0]?.focus();
	}
	function k(e, n) {
		if (e.disabled || y !== H(C)) return;
		if (e.children) {
			O(e, n, !0);
			return;
		}
		let r = e.command;
		T(!0);
		let i = S[r];
		i ? Promise.resolve(i()).then((e) => {
			e.ok || (t.actions.recall?.reportIssue(e.error.code + ": " + e.error.message), t.actions.recall?.refresh());
		}).catch(() => {
			t.actions.recall?.reportIssue("RECALL_UNAVAILABLE: Memory recall could not be updated."), t.actions.recall?.refresh();
		}) : Eo.has(r) ? t.local(r) : r === "enable-workflow" ? t.actions.setEnabled(!t.state.enabled) : r === "select-tool" || r === "pan-tool" ? t.actions.mode(r === "select-tool" ? "select" : "pan") : r === "zoom-in" || r === "zoom-out" ? t.actions.zoom(r === "zoom-in" ? 1.15 : 1 / 1.15) : r === "fit-selection" ? t.actions.fitSelection() : t.actions.command(r);
	}
	function A(e) {
		return s.querySelector(`[data-menu="${H(i)[e].name}"]`);
	}
	function j(e) {
		if (!H(a) && (e.ctrlKey || e.metaKey)) return;
		e.stopPropagation();
		let t = e.target, n = t.hasAttribute("data-menu");
		if (e.key === "Tab") {
			H(a) && T(!0);
			return;
		}
		if (e.key === "Escape") {
			H(a) && (e.preventDefault(), H(p) && t.closest("[role=\"menu\"]") === H(l) ? (L(p, null), f?.focus({ preventScroll: !0 })) : T(!0));
			return;
		}
		let r = t.closest("[role=\"menu\"]") ?? H(c), s = r === H(l) && !!H(p), u = w(r), d = u.indexOf(t);
		if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
			if (e.preventDefault(), s) {
				e.key === "ArrowLeft" && (L(p, null), f?.focus());
				return;
			}
			if (!n && e.key === "ArrowRight") {
				let e = H(i).find((e) => e.name === H(a))?.groups.flat().find((e) => e.command === t.dataset.command);
				if (e?.children) {
					O(e, t, !0);
					return;
				}
			}
			let r = (H(o) + (e.key === "ArrowRight" ? 1 : H(i).length - 1)) % H(i).length;
			L(o, r), H(a) ? D(H(i)[r].name, A(r)) : A(r).focus();
		} else if ([
			"ArrowDown",
			"ArrowUp",
			"Home",
			"End"
		].includes(e.key)) e.preventDefault(), n ? e.key === "Home" || e.key === "End" ? (L(o, e.key === "Home" ? 0 : H(i).length - 1, !0), A(H(o)).focus()) : D(t.dataset.menu, t, e.key === "ArrowUp" ? "last" : "first") : (s || L(p, null), u[e.key === "Home" ? 0 : e.key === "End" ? u.length - 1 : (d + (e.key === "ArrowUp" ? u.length - 1 : 1)) % u.length]?.focus());
		else if (e.key === "Enter" || e.key === " ") e.preventDefault(), t.click();
		else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
			e.preventDefault();
			let t = Date.now();
			b = (t - x > 700 ? "" : b) + e.key.toLowerCase(), x = t;
			let r = b.split("").every((e) => e === b[0]) ? b[0] : b;
			if (n && !H(a)) {
				let e = H(i).findIndex((e, t) => H(i)[(H(o) + t + 1) % H(i).length].name.toLowerCase().startsWith(r));
				e >= 0 && (L(o, (H(o) + e + 1) % H(i).length), A(H(o)).focus());
			} else [...u.slice(d + 1), ...u.slice(0, d + 1)].find((e) => e.getAttribute("aria-label")?.toLowerCase().startsWith(r))?.focus();
		}
	}
	function M(e) {
		H(a) && s?.contains(e.target) && e.stopPropagation();
	}
	var ee = Ro();
	U("pointerdown", an, (e) => {
		H(a) && !s.contains(e.target) && T();
	}), U("resize", an, () => T()), U("keyup", an, M, !0);
	var te = R(ee);
	Y(te, 17, () => H(i), qr, (e, t, n) => {
		var r = No(), i = R(r, !0);
		P(r), V(() => {
			Z(r, "data-menu", H(t).name), Z(r, "tabindex", H(o) === n ? 0 : -1), Z(r, "aria-expanded", H(a) === H(t).name), Z(r, "aria-controls", H(a) === H(t).name ? "pc-workspace-menu" : void 0), q(i, H(t).name);
		}), U("focus", r, () => L(o, n, !0)), W("click", r, (e) => D(H(t).name, e.currentTarget, "first", !0)), U("pointerenter", r, (e) => {
			H(a) && H(a) !== H(t).name && D(H(t).name, e.currentTarget);
		}), K(e, r);
	});
	var ne = B(te, 2), re = (e) => {
		var t = Lo(), n = z(t);
		let o;
		Y(n, 21, () => H(i).find((e) => e.name === H(a))?.groups ?? [], qr, (e, t, n) => {
			var i = Fo(), a = z(i), o = (e) => {
				K(e, Po());
			};
			J(a, (e) => {
				n && e(o);
			});
			var s = B(a, 2);
			r(s, () => H(t), () => !1), K(e, i);
		}), P(n), Mi(n, (e) => L(c, e), () => H(c));
		var s = B(n, 2), u = (e) => {
			var t = Io();
			let n;
			var i = R(t);
			r(i, () => H(p).children, () => !0), P(t), Mi(t, (e) => L(l, e), () => H(l)), V(() => {
				Z(t, "aria-label", `${H(p).label} options`), n = mi(t, "", n, {
					left: `${H(g)}px`,
					top: `${H(_)}px`
				});
			}), K(e, t);
		};
		J(s, (e) => {
			H(p)?.children && e(u);
		}), V(() => {
			Z(n, "aria-label", H(a)), o = mi(n, "", o, {
				left: `${H(m)}px`,
				top: `${H(h)}px`
			});
		}), K(e, t);
	};
	J(ne, (e) => {
		H(a) && e(re);
	}), P(ee), Mi(ee, (e) => s = e, () => s), W("keydown", ee, j), W("keyup", ee, M), U("paste", ee, M), W("pointerdown", ee, M), K(e, ee), We();
}
Er([
	"click",
	"keydown",
	"keyup",
	"pointerdown"
]);
//#endregion
//#region ui/Toolbar.svelte
var Bo = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-btn menu_button pc-root-stop\" title=\"Stop the workflow\">■ Stop</button>"), Vo = /* @__PURE__ */ G("<header class=\"pc-header\" data-pc-ui=\"svelte\"><div class=\"pc-menubar\"><div class=\"pc-brand\"><img width=\"30\" height=\"30\" alt=\"\"/><span>LATTICE</span></div> <!> <button type=\"button\" class=\"pc-btn menu_button pc-close\" title=\"Close\" aria-label=\"Close canvas\">×</button></div> <div class=\"pc-workflow-bar\"><div class=\"pc-document-heading\"><strong class=\"pc-document-name\"> </strong><span class=\"pc-document-status\" role=\"status\" aria-label=\"Document status\"> <!><!></span></div> <div class=\"pc-header-actions pc-history\"><button type=\"button\" aria-label=\"Undo\">↶</button> <button type=\"button\" aria-label=\"Redo\">↷</button> <span> </span></div> <!> <span class=\"pc-root-workflow-status\" role=\"status\" aria-label=\"Workflow status\"> </span> <div class=\"pc-header-actions pc-surface-actions\"><button type=\"button\" title=\"Show or hide the inspector\" aria-label=\"Toggle inspector\">Details</button></div> <label class=\"pc-enable\"><input class=\"pc-enable-input\" type=\"checkbox\"/><span>Enable Lattice</span></label></div></header>");
function Ho(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ F(() => t.state.rootWorkflow ?? t.state.workflow), r = /* @__PURE__ */ F(() => t.state.document?.dirty ? "Modified" : t.state.document?.busy || t.state.document?.status ? "" : t.state.document ? "Saved" : "Unsaved"), i, a, o;
	function s() {
		return {
			header: i,
			enabledControl: a,
			inspBtn: o
		};
	}
	var c = { getParts: s }, l = Vo(), u = R(l), d = R(u), f = R(d);
	Me(), P(d);
	var p = B(d, 2);
	zo(p, {
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
	var m = B(p, 2);
	P(u);
	var h = B(u, 2), g = R(h), _ = R(g), v = R(_, !0);
	P(_);
	var y = B(_), b = R(y, !0), x = B(b), S = (e) => {
		var t = Ir();
		V(() => q(t, `${H(r) ? " · " : ""}Working…`)), K(e, t);
	};
	J(x, (e) => {
		t.state.document?.busy && e(S);
	});
	var C = B(x), w = (e) => {
		var n = Ir();
		V(() => q(n, `${H(r) || t.state.document.busy ? " · " : ""}${t.state.document.status ?? ""}`)), K(e, n);
	};
	J(C, (e) => {
		t.state.document?.status && t.state.document.status !== H(r) && e(w);
	}), P(y), P(g);
	var T = B(g, 2), E = R(T), D = B(E, 2), O = B(D, 2), k = R(O, !0);
	P(O), P(T);
	var A = B(T, 2), j = (e) => {
		var n = Bo();
		W("click", n, () => t.actions.command("stop-workflow")), K(e, n);
	};
	J(A, (e) => {
		(H(n)?.ownedBusy || H(n)?.busy) && e(j);
	});
	var M = B(A, 2), ee = R(M, !0);
	P(M);
	var te = B(M, 2), ne = R(te);
	Mi(ne, (e) => o = e, () => o), P(te);
	var re = B(te, 2), ie = R(re);
	return X(ie), Mi(ie, (e) => a = e, () => a), Me(), P(re), P(h), P(l), Mi(l, (e) => i = e, () => i), V(() => {
		Z(f, "src", t.actions.logoUrl), Z(_, "title", t.state.document?.name ?? "Untitled"), q(v, t.state.document?.name ?? "Untitled"), q(b, H(r)), fi(E, 1, `pc-btn menu_button pc-undo${t.state.history.undo ? "" : " pc-disabled"}`), E.disabled = !t.state.history.undo, Z(E, "title", t.state.history.undoTitle), fi(D, 1, `pc-btn menu_button pc-redo${t.state.history.redo ? "" : " pc-disabled"}`), D.disabled = !t.state.history.redo, Z(D, "title", t.state.history.redoTitle), fi(O, 1, `pc-history-note${t.state.history.showNote ? " pc-show" : ""}`), q(k, t.state.history.note), q(ee, H(n) ? `${H(n).phase} · ≤ ${H(n).callBound} requests${H(n).status ? " · " + H(n).status : ""}` : "Workflow unavailable"), fi(ne, 1, `pc-btn menu_button pc-pane-toggle${t.state.inspectorOpen ? " pc-on" : ""}`), Z(ne, "aria-pressed", t.state.inspectorOpen), wi(ie, t.state.enabled);
	}), W("click", m, () => t.actions.command("close")), W("click", E, () => t.actions.command("undo")), W("click", D, () => t.actions.command("redo")), W("click", ne, () => t.actions.command("inspector")), W("change", ie, (e) => t.actions.setEnabled(e.currentTarget.checked)), K(e, l), We(c);
}
Er(["click", "change"]);
//#endregion
//#region ui/PaneDivider.svelte
var Uo = /* @__PURE__ */ G("<div class=\"pc-pane-divider\" role=\"separator\" aria-label=\"Resize preview\" aria-orientation=\"horizontal\" tabindex=\"0\"></div>");
function Wo(e, t) {
	Ue(t, !0);
	let n = Ni(t, "min", 3, 90), r = Ni(t, "max", 3, 500), i, a = null, o = (e) => Math.max(n(), Math.min(r(), e));
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
	Fi(u);
	var f = Uo();
	U("blur", an, u), Mi(f, (e) => i = e, () => i), V((e, t) => {
		Z(f, "aria-valuemin", n()), Z(f, "aria-valuemax", e), Z(f, "aria-valuenow", t);
	}, [() => Math.round(r()), () => Math.round(t.height)]), W("pointerdown", f, s), W("pointermove", f, c), W("pointerup", f, (e) => l(!1, e.pointerId)), U("pointercancel", f, (e) => l(!0, e.pointerId)), U("lostpointercapture", f, (e) => l(!0, e.pointerId)), W("keydown", f, d), K(e, f), We();
}
Er([
	"pointerdown",
	"pointermove",
	"pointerup",
	"keydown"
]);
//#endregion
//#region ui/DetailsDivider.svelte
var Go = /* @__PURE__ */ G("<div class=\"pc-details-divider svelte-1iyzcro\" role=\"separator\" aria-label=\"Resize Details\" aria-orientation=\"vertical\" tabindex=\"0\"></div>");
function Ko(e, t) {
	Ue(t, !0);
	let n = Ni(t, "min", 3, 220), r = Ni(t, "max", 3, 520), i, a = null, o = (e) => Math.max(n(), Math.min(r(), e));
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
	Fi(c);
	var f = Go();
	U("blur", an, c), Mi(f, (e) => i = e, () => i), V((e, t) => {
		Z(f, "aria-valuemin", n()), Z(f, "aria-valuemax", e), Z(f, "aria-valuenow", t);
	}, [() => Math.round(r()), () => Math.round(t.width)]), W("pointerdown", f, l), W("pointermove", f, u), W("pointerup", f, (e) => s(!1, e.pointerId)), U("pointercancel", f, (e) => s(!0, e.pointerId)), U("lostpointercapture", f, (e) => s(!0, e.pointerId)), W("keydown", f, d), K(e, f), We();
}
Er([
	"pointerdown",
	"pointermove",
	"pointerup",
	"keydown"
]);
//#endregion
//#region ui/GraphTabs.svelte
var qo = /* @__PURE__ */ G("<span class=\"pc-graph-tab-lock svelte-7ptwed\" aria-label=\"Read only\">◇</span>"), Jo = /* @__PURE__ */ G("<input type=\"text\" title=\"Enter to save, Escape to cancel\"/>"), Yo = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-graph-tab-close svelte-7ptwed\">×</button>"), Xo = /* @__PURE__ */ G("<div><button type=\"button\" role=\"tab\" aria-haspopup=\"menu\"><span class=\"svelte-7ptwed\"> </span><!></button> <!> <!></div>"), Zo = /* @__PURE__ */ G("<button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button>"), Qo = /* @__PURE__ */ G("<button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close tab</button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close other tabs</button> <!>", 1), $o = /* @__PURE__ */ G("<!> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close active view</button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close other views</button> <!>", 1), es = /* @__PURE__ */ G("<div role=\"menu\" tabindex=\"-1\"><!></div>"), ts = /* @__PURE__ */ G("<nav aria-label=\"Open graph views\"><div class=\"pc-graph-tab-list svelte-7ptwed\" role=\"tablist\" aria-label=\"Graph views\"></div> <button type=\"button\" class=\"pc-graph-view-overflow svelte-7ptwed\" aria-label=\"Graph view actions\" title=\"Focus, close or reopen graph views\" aria-haspopup=\"menu\">⋯</button> <!></nav>");
function ns(e, t) {
	Ue(t, !0);
	let n = Ni(t, "actions", 19, () => ({})), r = Ni(t, "idPrefix", 3, "pc-graph-view"), i = /* @__PURE__ */ I(null), a = /* @__PURE__ */ I(null), o = /* @__PURE__ */ I(null), s = /* @__PURE__ */ I(!1), c = /* @__PURE__ */ I(""), l = /* @__PURE__ */ I(""), u = /* @__PURE__ */ I(0), d = /* @__PURE__ */ I(0), f = "", p = /* @__PURE__ */ I(""), m = /* @__PURE__ */ I(""), h = /* @__PURE__ */ I(null), g = "", _ = null, v = 0, y = /* @__PURE__ */ F(() => t.views?.tabs.find((e) => e.key === H(l))), b = {};
	Cn(() => {
		let e = t.views?.active.key ?? "";
		f === e ? t.views && !t.views.tabs.some((e) => e.key === H(c)) && L(c, e, !0) : (L(c, e, !0), O(), L(p, "")), H(l) && !H(y) && O(), H(p) && (t.views?.workflowId !== g || !t.views.tabs.some((e) => e.key === H(p))) && L(p, ""), f = e;
	});
	async function x(e) {
		let r = t.views?.tabs.find((t) => t.key === e);
		if (!r || r.identity.kind === "library" || !n().renameView || n().canRenameView?.(e) === !1) return;
		let i = ++v;
		_ = null, O(), g = t.views.workflowId, L(m, r.label, !0), L(p, e, !0), await mr(), H(p) === e && v === i && (_ = H(h), H(h)?.focus({ preventScroll: !0 }), H(h)?.select());
	}
	async function S(e, r, i = !0) {
		let a = H(p), o = t.views?.tabs.find((e) => e.key === a), s = H(m).trim();
		a && e === _ && (L(p, ""), _ = null, r && o && s && s !== o.label && t.views?.workflowId === g && o.identity.kind !== "library" && n().canRenameView?.(a) !== !1 && n().renameView?.(a, s), i && (await mr(), b[a]?.focus({ preventScroll: !0 })));
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
		n().closeView?.(e.key), await mr();
		let r = t.views?.active.key;
		r && t.views?.tabs.some((e) => e.key === r) && (L(c, r, !0), b[r]?.focus({ preventScroll: !0 }));
	}
	function O(e = !1) {
		let t = H(l) ? b[H(l)] : H(o);
		L(s, !1), L(l, ""), e && t?.focus({ preventScroll: !0 });
	}
	function k(e, t) {
		e.preventDefault(), e.stopPropagation(), A(t, e.clientX, e.clientY);
	}
	async function A(e, t, n) {
		if (L(l, e.key, !0), L(u, t, !0), L(d, n, !0), L(s, !0), await mr(), !H(s) || H(l) !== e.key) return;
		let r = H(a)?.getBoundingClientRect();
		L(u, Math.min(Math.max(8, t), Math.max(8, window.innerWidth - (r?.width ?? 0) - 8)), !0), L(d, Math.min(Math.max(8, n), Math.max(8, window.innerHeight - (r?.height ?? 0) - 8)), !0), H(a)?.querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
	}
	async function j() {
		let e = !!H(l);
		L(l, ""), L(s, e || !H(s), !0), H(s) && (await mr(), H(s) && H(a)?.querySelector("button:not(:disabled)")?.focus());
	}
	function M(e) {
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
	function ee(e) {
		O(!0), e();
	}
	function te(e) {
		let t = H(y);
		t && (O(!0), e(t));
	}
	var ne = { startRename: x }, re = Lr();
	U("pointerdown", an, (e) => {
		H(s) && !H(a)?.contains(e.target) && e.target !== H(o) && O();
	}), U("resize", an, () => O());
	var ie = z(re), ae = (e) => {
		var f = ts();
		let g;
		var _ = R(f);
		Y(_, 23, () => t.views.tabs, (e) => e.key, (e, n, i) => {
			var a = Xo();
			let o;
			var u = R(a);
			let d;
			var f = R(u), g = R(f, !0);
			P(f);
			var _ = B(f), v = (e) => {
				K(e, qo());
			};
			J(_, (e) => {
				H(n).readOnly && e(v);
			}), P(u), Mi(u, (e, t) => b[t.key] = e, (e) => b?.[e.key], () => [H(n)]);
			var y = B(u, 2), x = (e) => {
				var t = Jo();
				X(t);
				let r;
				Mi(t, (e) => L(h, e), () => H(h)), V(() => {
					r = fi(t, 1, "pc-graph-tab-rename svelte-7ptwed", null, r, { "pc-graph-tab-closeable": H(n).identity.kind !== "root" }), Z(t, "aria-label", H(n).identity.kind === "root" ? "Graph name" : "Subgraph name"), Z(t, "maxlength", H(n).identity.kind === "instance" ? 80 : void 0);
				}), W("keydown", t, C), U("blur", t, (e) => S(e.currentTarget, !0, !1)), Oi(t, () => H(m), (e) => L(m, e)), K(e, t);
			};
			J(y, (e) => {
				H(p) === H(n).key && e(x);
			});
			var O = B(y, 2), A = (e) => {
				var r = Yo();
				V((e, i) => {
					Z(r, "aria-label", e), Z(r, "title", i), Z(r, "tabindex", H(n).key === (H(c) || t.views.active.key) ? 0 : -1);
				}, [() => `Close ${H(n).label} · ${w(H(n))}`, () => `Close ${w(H(n))}`]), W("click", r, () => D(H(n))), W("contextmenu", r, (e) => k(e, H(n))), W("keydown", r, (e) => E(e, H(i))), K(e, r);
			};
			J(O, (e) => {
				H(n).identity.kind !== "root" && e(A);
			}), P(a), V((e) => {
				o = fi(a, 1, "pc-graph-tab-item svelte-7ptwed", null, o, {
					"pc-graph-tab-active": H(n).key === t.views.active.key,
					"pc-graph-tab-editing": H(p) === H(n).key
				}), d = fi(u, 1, "pc-graph-tab svelte-7ptwed", null, d, { "pc-graph-tab-closeable": H(n).identity.kind !== "root" }), Z(u, "id", `${r()}-${H(i)}`), Z(u, "aria-controls", t.panelId), Z(u, "aria-selected", H(n).key === t.views.active.key), Z(u, "aria-expanded", H(s) && H(l) === H(n).key), Z(u, "tabindex", H(p) !== H(n).key && H(n).key === (H(c) || t.views.active.key) ? 0 : -1), Z(u, "title", e), q(g, H(n).label);
			}, [() => w(H(n))]), W("click", u, () => T(H(n).key)), W("pointerdown", u, (e) => {
				e.button === 2 && e.preventDefault();
			}), W("contextmenu", u, (e) => k(e, H(n))), W("keydown", u, (e) => E(e, H(i))), K(e, a);
		}), P(_);
		var v = B(_, 2);
		Mi(v, (e) => L(o, e), () => H(o));
		var O = B(v, 2), A = (e) => {
			var r = es();
			let i;
			var o = R(r), s = (e) => {
				let r = /* @__PURE__ */ F(() => H(y)), i = /* @__PURE__ */ F(() => n().canRenameView?.(H(r).key) === !1);
				var a = Qo(), o = z(a), s = R(o, !0);
				P(o);
				var c = B(o, 2), l = R(c, !0);
				P(c);
				var u = B(c, 2), d = B(u, 2);
				Y(B(d, 2), 17, () => t.views.closedViews, (e) => e.key, (e, t) => {
					var r = Zo(), i = R(r);
					P(r), V((e, a) => {
						r.disabled = !n().reopenView, Z(r, "title", e), q(i, `Reopen ${H(t).label ?? ""} · ${a ?? ""}`);
					}, [() => w(H(t)), () => w(H(t))]), W("click", r, () => ee(() => n().reopenView?.(H(t).key))), K(e, r);
				}), V((e) => {
					o.disabled = !n().exportView, q(s, H(r).identity.kind === "root" ? "Export workflow JSON" : "Export subgraph JSON"), c.disabled = H(r).identity.kind === "library" || H(i) || !n().renameView, Z(c, "title", H(r).identity.kind === "library" ? "Library inspection is read only." : H(i) ? "Make a local copy of the containing graph to rename this subgraph." : void 0), q(l, H(r).identity.kind === "root" ? "Rename graph" : "Rename subgraph"), u.disabled = H(r).identity.kind === "root" || !n().closeView, d.disabled = e;
				}, [() => t.views.tabs.every((e) => e.identity.kind === "root" || e.key === H(r).key) || !n().closeOtherViews]), W("click", o, () => te((e) => n().exportView?.(e.key))), W("click", c, () => te((e) => x(e.key))), W("click", u, () => te((e) => D(e))), W("click", d, () => te((e) => n().closeOtherViews?.(e.key))), K(e, a);
			}, c = (e) => {
				var r = $o(), i = z(r);
				Y(i, 17, () => t.views.tabs, (e) => e.key, (e, t) => {
					var n = Zo(), r = R(n);
					P(n), V((e, t) => {
						Z(n, "title", e), q(r, `Focus ${t ?? ""}`);
					}, [() => w(H(t)), () => w(H(t))]), W("click", n, () => ee(() => T(H(t).key))), K(e, n);
				});
				var a = B(i, 2), o = B(a, 2);
				Y(B(o, 2), 17, () => t.views.closedViews, (e) => e.key, (e, t) => {
					var r = Zo(), i = R(r);
					P(r), V((e, n) => {
						Z(r, "title", e), q(i, `Reopen ${H(t).label ?? ""} · ${n ?? ""}`);
					}, [() => w(H(t)), () => w(H(t))]), W("click", r, () => ee(() => n().reopenView?.(H(t).key))), K(e, r);
				}), V((e) => {
					a.disabled = t.views.active.identity.kind === "root" || !n().closeView, o.disabled = e;
				}, [() => t.views.tabs.every((e) => e.identity.kind === "root" || e.key === t.views.active.key) || !n().closeOtherViews]), W("click", a, () => ee(() => D(t.views.active))), W("click", o, () => ee(() => n().closeOtherViews?.(t.views.active.key))), K(e, r);
			};
			J(o, (e) => {
				H(y) ? e(s) : e(c, -1);
			}), P(r), Mi(r, (e) => L(a, e), () => H(a)), V(() => {
				i = fi(r, 1, "pc-graph-view-menu svelte-7ptwed", null, i, { "pc-graph-tab-menu": !!H(l) }), mi(r, H(l) ? `left: ${H(u)}px; top: ${H(d)}px;` : void 0), Z(r, "aria-label", H(y) ? `Actions for ${H(y).label}` : "Graph view actions");
			}), W("keydown", r, M), K(e, r);
		};
		J(O, (e) => {
			H(s) && e(A);
		}), P(f), Mi(f, (e) => L(i, e), () => H(i)), V(() => {
			g = fi(f, 1, "pc-graph-tabs pc-graph-tabs-multi svelte-7ptwed", null, g, { "pc-graph-tabs-menu-open": H(s) }), Z(v, "aria-expanded", H(s) && !H(l));
		}), W("click", v, j), K(e, f);
	};
	return J(ie, (e) => {
		t.views && e(ae);
	}), K(e, re), We(ne);
}
Er([
	"click",
	"pointerdown",
	"contextmenu",
	"keydown"
]);
//#endregion
//#region ui/GraphBreadcrumbs.svelte
var rs = /* @__PURE__ */ G("<span aria-current=\"page\" class=\"svelte-18ovafz\"> </span>"), is = /* @__PURE__ */ G("<button type=\"button\" class=\"svelte-18ovafz\"> </button>"), as = /* @__PURE__ */ G("<li class=\"svelte-18ovafz\"><!></li>"), os = /* @__PURE__ */ G("<div class=\"pc-graph-location svelte-18ovafz\"><nav aria-label=\"Graph location\" class=\"svelte-18ovafz\"><ol class=\"svelte-18ovafz\"></ol></nav> <span class=\"pc-graph-scope svelte-18ovafz\"> <!><!></span></div>");
function ss(e, t) {
	Ue(t, !0);
	let n = Ni(t, "actions", 19, () => ({})), r = /* @__PURE__ */ F(() => t.view?.identity.kind === "library" ? t.view.identity.definitionRef : t.definitionRef ?? t.view?.definitionRef);
	function i(e) {
		return e.identity.kind === "instance" ? !!n().openInstance : !!n().focusView;
	}
	function a(e) {
		e.identity.kind === "instance" ? n().openInstance?.(e.identity.instancePath) : n().focusView?.(e.key);
	}
	var o = Lr(), s = z(o), c = (e) => {
		var n = os(), o = R(n), s = R(o);
		Y(s, 23, () => t.view.breadcrumbs, (e) => e.key, (e, n, r) => {
			var o = as(), s = R(o), c = (e) => {
				var t = rs(), r = R(t, !0);
				P(t), V(() => q(r, H(n).label)), K(e, t);
			}, l = (e) => {
				var t = is(), r = R(t, !0);
				P(t), V((e) => {
					t.disabled = e, q(r, H(n).label);
				}, [() => !i(H(n))]), W("click", t, () => a(H(n))), K(e, t);
			};
			J(s, (e) => {
				H(r) === t.view.breadcrumbs.length - 1 ? e(c) : e(l, -1);
			}), P(o), K(e, o);
		}), P(s), P(o);
		var c = B(o, 2), l = R(c, !0), u = B(l), d = (e) => {
			var t = Ir();
			V(() => q(t, `· v${H(r).version ?? ""}`)), K(e, t);
		};
		J(u, (e) => {
			H(r) && e(d);
		});
		var f = B(u), p = (e) => {
			K(e, Ir("· Read only"));
		};
		J(f, (e) => {
			(t.view.readOnly || t.view.identity.kind === "library") && e(p);
		}), P(c), P(n), V(() => {
			Z(c, "title", H(r) ? `${H(r).id} · v${H(r).version} · ${H(r).semanticHash}` : void 0), q(l, t.view.identity.kind === "library" ? "Library inspection" : "Instance graph");
		}), K(e, n);
	};
	J(s, (e) => {
		t.view && t.view.identity.kind !== "root" && e(c);
	}), K(e, o), We();
}
Er(["click"]);
//#endregion
//#region ui/StructuredControl.svelte
var cs = /* @__PURE__ */ G("<small class=\"svelte-taw2zx\">Rows are available when this JSON has a supported shape.</small>"), ls = /* @__PURE__ */ G("<label class=\"svelte-taw2zx\"> </label><textarea class=\"pc-structured-raw svelte-taw2zx\" spellcheck=\"false\"></textarea> <!>", 1), us = /* @__PURE__ */ G("<option class=\"svelte-taw2zx\"> </option>"), ds = /* @__PURE__ */ G("<label class=\"svelte-taw2zx\">Phase</label><select class=\"svelte-taw2zx\"></select> <label class=\"svelte-taw2zx\">Steps</label><input type=\"number\" min=\"1\" max=\"64\" step=\"1\" class=\"svelte-taw2zx\"/>", 1), fs = /* @__PURE__ */ G("<label class=\"svelte-taw2zx\">Name</label><input maxlength=\"128\" class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Value</label><input type=\"number\" step=\"any\" class=\"svelte-taw2zx\"/>", 1), ps = /* @__PURE__ */ G("<label class=\"svelte-taw2zx\">Default (JSON)</label><textarea class=\"svelte-taw2zx\"></textarea>", 1), ms = /* @__PURE__ */ G("<label class=\"svelte-taw2zx\">Name</label><input class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Path (JSON array)</label><input class=\"svelte-taw2zx\"/> <label class=\"pc-structured-check svelte-taw2zx\"><input type=\"checkbox\" class=\"svelte-taw2zx\"/> Required</label> <label class=\"pc-structured-check svelte-taw2zx\"><input type=\"checkbox\" class=\"svelte-taw2zx\"/> Use default when missing</label><small class=\"svelte-taw2zx\">Defaults apply when Required is off.</small> <!>", 1), hs = /* @__PURE__ */ G("<label class=\"svelte-taw2zx\">ID</label><input maxlength=\"128\" class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Label</label><input maxlength=\"80\" class=\"svelte-taw2zx\"/>", 1), gs = /* @__PURE__ */ G("<label class=\"svelte-taw2zx\">Name</label><input class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Text</label><textarea class=\"svelte-taw2zx\"></textarea>", 1), _s = /* @__PURE__ */ G("<label class=\"svelte-taw2zx\">Kind</label><select class=\"svelte-taw2zx\"><option class=\"svelte-taw2zx\">Literal</option><option class=\"svelte-taw2zx\">Regular expression</option></select> <label class=\"svelte-taw2zx\">Pattern</label><input class=\"svelte-taw2zx\"/> <label class=\"svelte-taw2zx\">Replacement</label><textarea class=\"svelte-taw2zx\"></textarea> <label class=\"svelte-taw2zx\">Flags</label><input class=\"svelte-taw2zx\"/>", 1), vs = /* @__PURE__ */ G("<button type=\"button\" class=\"svelte-taw2zx\">Move up</button><button type=\"button\" class=\"svelte-taw2zx\">Move down</button>", 1), ys = /* @__PURE__ */ G("<fieldset class=\"pc-structured-row svelte-taw2zx\"><legend class=\"svelte-taw2zx\"> </legend> <!> <div class=\"pc-structured-actions svelte-taw2zx\"><!><button type=\"button\" class=\"svelte-taw2zx\">Remove</button></div></fieldset>"), bs = /* @__PURE__ */ G("<div class=\"pc-structured-rows svelte-taw2zx\"></div> <button type=\"button\" class=\"svelte-taw2zx\"> </button>", 1), xs = /* @__PURE__ */ G("<div class=\"pc-structured-control svelte-taw2zx\"><div class=\"pc-structured-mode svelte-taw2zx\"><button type=\"button\" class=\"svelte-taw2zx\"> </button></div> <!></div>");
function Ss(e, t) {
	Ue(t, !0);
	let n = Ni(t, "disabled", 3, !1), r = Ni(t, "error", 3, ""), i = [
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
	let f = /* @__PURE__ */ F(d), p = /* @__PURE__ */ I(!1), m = /* @__PURE__ */ F(() => H(p) || !H(f));
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
	var E = xs(), D = R(E), O = R(D), k = R(O, !0);
	P(O), P(D);
	var A = B(D, 2), j = (e) => {
		var i = ls(), a = z(i), o = R(a);
		P(a);
		var s = B(a);
		at(s);
		var c = B(s, 2), l = (e) => {
			K(e, cs());
		};
		J(c, (e) => {
			H(f) || e(l);
		}), V(() => {
			Z(a, "for", t.idPrefix + "-raw"), q(o, `${t.control.label ?? ""} (JSON)`), Z(s, "id", t.idPrefix + "-raw"), Z(s, "aria-label", t.control.label), Z(s, "aria-invalid", !!r()), Z(s, "aria-describedby", r() ? t.idPrefix + "-error" : void 0), Ci(s, t.text), s.disabled = n();
		}), W("input", s, (e) => h(e.currentTarget.value)), K(e, i);
	}, M = (e) => {
		var r = bs(), a = z(r);
		Y(a, 21, () => H(f), qr, (e, r, a) => {
			var o = ys(), s = R(o), l = R(s);
			P(s);
			var d = B(s, 2), p = (e) => {
				var o = ds(), s = z(o), c = B(s);
				Z(c, "aria-label", "Duration " + (a + 1) + " phase"), Y(c, 21, () => i, qr, (e, t) => {
					var n = us(), r = R(n, !0);
					P(n);
					var i = {};
					V((e, a) => {
						n.disabled = e, q(r, a), i !== (i = H(t)) && (n.value = (n.__value = H(t)) ?? "");
					}, [() => H(f).some((e, n) => n !== a && e.name === H(t)), () => H(t)[0].toUpperCase() + H(t).slice(1)]), K(e, n);
				}), P(c);
				var l;
				gi(c);
				var u = B(c, 2), d = B(u);
				X(d), Z(d, "aria-label", "Duration " + (a + 1) + " steps"), V((e, r) => {
					Z(s, "for", t.idPrefix + "-phase-" + a), Z(c, "id", t.idPrefix + "-phase-" + a), c.disabled = n(), l !== (l = e) && (c.value = (c.__value = e) ?? "", hi(c, e)), Z(u, "for", t.idPrefix + "-steps-" + a), Z(d, "id", t.idPrefix + "-steps-" + a), Ci(d, r), d.disabled = n();
				}, [() => String(H(r).name), () => Number(H(r).number)]), W("change", c, (e) => x(a, e.currentTarget)), W("change", d, (e) => b(a, e.currentTarget)), K(e, o);
			}, m = (e) => {
				var i = fs(), o = z(i), s = B(o);
				X(s), Z(s, "aria-label", "Value " + (a + 1) + " name");
				var c = B(s, 2), l = B(c);
				X(l), Z(l, "aria-label", "Value " + (a + 1) + " number"), V((e, r) => {
					Z(o, "for", t.idPrefix + "-name-" + a), Z(s, "id", t.idPrefix + "-name-" + a), Ci(s, e), s.disabled = n(), Z(c, "for", t.idPrefix + "-number-" + a), Z(l, "id", t.idPrefix + "-number-" + a), Ci(l, r), Z(l, "min", t.control.min), Z(l, "max", t.control.max), l.disabled = n();
				}, [() => String(H(r).name), () => Number(H(r).number)]), W("change", s, (e) => x(a, e.currentTarget)), W("change", l, (e) => b(a, e.currentTarget)), K(e, i);
			}, h = (e) => {
				var i = ms(), o = z(i), s = B(o);
				X(s), Z(s, "aria-label", "Field " + (a + 1) + " name");
				var c = B(s, 2), l = B(c);
				X(l), Z(l, "aria-label", "Field " + (a + 1) + " path (JSON array)");
				var u = B(l, 2), d = R(u);
				X(d), Z(d, "aria-label", "Field " + (a + 1) + " required"), Me(), P(u);
				var f = B(u, 2), p = R(f);
				X(p), Z(p, "aria-label", "Field " + (a + 1) + " use default"), Me(), P(f);
				var m = B(f, 3), h = (e) => {
					var i = ps(), o = z(i), s = B(o);
					at(s), Z(s, "aria-label", "Field " + (a + 1) + " default (JSON)"), V((e) => {
						Z(o, "for", t.idPrefix + "-default-" + a), Z(s, "id", t.idPrefix + "-default-" + a), Ci(s, e), s.disabled = n();
					}, [() => JSON.stringify(H(r).default, null, 2)]), W("change", s, (e) => S(a, "default", e.currentTarget.value)), K(e, i);
				}, g = /* @__PURE__ */ F(() => Object.hasOwn(H(r), "default"));
				J(m, (e) => {
					H(g) && e(h);
				}), V((e, i, u) => {
					Z(o, "for", t.idPrefix + "-name-" + a), Z(s, "id", t.idPrefix + "-name-" + a), Ci(s, e), s.disabled = n(), Z(c, "for", t.idPrefix + "-path-" + a), Z(l, "id", t.idPrefix + "-path-" + a), Ci(l, i), l.disabled = n(), wi(d, H(r).required !== !1), d.disabled = n(), wi(p, u), p.disabled = n();
				}, [
					() => String(H(r).name),
					() => JSON.stringify(H(r).path),
					() => Object.hasOwn(H(r), "default")
				]), W("input", s, (e) => v(a, "name", e.currentTarget.value)), W("change", l, (e) => S(a, "path", e.currentTarget.value)), W("change", d, (e) => v(a, "required", e.currentTarget.checked)), W("change", p, (e) => C(a, e.currentTarget.checked)), K(e, i);
			}, g = (e) => {
				var i = hs(), o = z(i), s = B(o);
				X(s), Z(s, "aria-label", "Slot " + (a + 1) + " ID");
				var c = B(s, 2), l = B(c);
				X(l), Z(l, "aria-label", "Slot " + (a + 1) + " label"), V((e, r) => {
					Z(o, "for", t.idPrefix + "-slot-id-" + a), Z(s, "id", t.idPrefix + "-slot-id-" + a), Ci(s, e), s.disabled = n(), Z(c, "for", t.idPrefix + "-slot-label-" + a), Z(l, "id", t.idPrefix + "-slot-label-" + a), Ci(l, r), l.disabled = n();
				}, [() => String(H(r).id), () => String(H(r).label)]), W("input", s, (e) => v(a, "id", e.currentTarget.value)), W("input", l, (e) => v(a, "label", e.currentTarget.value)), K(e, i);
			}, _ = (e) => {
				var i = gs(), o = z(i), s = B(o);
				X(s), Z(s, "aria-label", "Section " + (a + 1) + " name");
				var c = B(s, 2), l = B(c);
				at(l), Z(l, "aria-label", "Section " + (a + 1) + " text"), V((e, r) => {
					Z(o, "for", t.idPrefix + "-name-" + a), Z(s, "id", t.idPrefix + "-name-" + a), Ci(s, e), s.disabled = n(), Z(c, "for", t.idPrefix + "-text-" + a), Z(l, "id", t.idPrefix + "-text-" + a), Ci(l, r), l.disabled = n();
				}, [() => String(H(r).name), () => String(H(r).text)]), W("input", s, (e) => v(a, "name", e.currentTarget.value)), W("input", l, (e) => v(a, "text", e.currentTarget.value)), K(e, i);
			}, y = (e) => {
				var i = _s(), o = z(i), s = B(o);
				Z(s, "aria-label", "Rule " + (a + 1) + " kind");
				var c = R(s);
				c.value = c.__value = "literal";
				var l = B(c);
				l.value = l.__value = "regex", P(s);
				var u;
				gi(s);
				var d = B(s, 2), f = B(d);
				X(f), Z(f, "aria-label", "Rule " + (a + 1) + " pattern");
				var p = B(f, 2), m = B(p);
				at(m), Z(m, "aria-label", "Rule " + (a + 1) + " replacement");
				var h = B(m, 2), g = B(h);
				X(g), Z(g, "aria-label", "Rule " + (a + 1) + " flags"), V((e, r, i, c) => {
					Z(o, "for", t.idPrefix + "-kind-" + a), Z(s, "id", t.idPrefix + "-kind-" + a), s.disabled = n(), u !== (u = e) && (s.value = (s.__value = e) ?? "", hi(s, e)), Z(d, "for", t.idPrefix + "-pattern-" + a), Z(f, "id", t.idPrefix + "-pattern-" + a), Ci(f, r), f.disabled = n(), Z(p, "for", t.idPrefix + "-replacement-" + a), Z(m, "id", t.idPrefix + "-replacement-" + a), Ci(m, i), m.disabled = n(), Z(h, "for", t.idPrefix + "-flags-" + a), Z(g, "id", t.idPrefix + "-flags-" + a), Ci(g, c), g.disabled = n();
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
				var t = vs(), r = z(t), i = B(r);
				V(() => {
					Z(r, "aria-label", "Move " + H(c) + " " + (a + 1) + " up"), r.disabled = n() || a === 0, Z(i, "aria-label", "Move " + H(c) + " " + (a + 1) + " down"), i.disabled = n() || a === H(f).length - 1;
				}), W("click", r, () => T(a, -1)), W("click", i, () => T(a, 1)), K(e, t);
			}, k = /* @__PURE__ */ F(() => !["numeric-map", "durations"].includes(t.control.structured ?? ""));
			J(D, (e) => {
				H(k) && e(O);
			});
			var A = B(D);
			P(E), P(o), V((e) => {
				q(l, `${e ?? ""} ${a + 1}`), Z(A, "aria-label", "Remove " + H(c) + " " + (a + 1)), A.disabled = n() || H(f).length <= H(u);
			}, [() => H(c)[0].toUpperCase() + H(c).slice(1)]), W("click", A, () => w(a)), K(e, o);
		}), P(a);
		var o = B(a, 2), s = R(o);
		P(o), V(() => {
			Z(o, "aria-label", "Add " + H(c)), o.disabled = n() || H(f).length >= H(l), q(s, `Add ${H(c) ?? ""}`);
		}), W("click", o, y), K(e, r);
	};
	J(A, (e) => {
		H(m) ? e(j) : H(f) && e(M, 1);
	}), P(E), V(() => {
		Z(E, "data-structured-control", t.control.structured), Z(O, "aria-label", "Edit " + t.control.label + (H(m) ? " as rows" : " as JSON")), O.disabled = n() || H(m) && !H(f), q(k, H(m) ? "Use rows" : "Edit JSON");
	}), W("click", O, () => {
		!n() && H(f) && L(p, !H(m));
	}), K(e, E), We();
}
Er([
	"click",
	"input",
	"change"
]);
//#endregion
//#region ui/DetailControl.svelte
var Cs = /* @__PURE__ */ G("<span class=\"pc-control-label svelte-16a137\"> </span> <!>", 1), ws = /* @__PURE__ */ G("<label class=\"pc-detail-check svelte-16a137\"><input type=\"checkbox\" class=\"svelte-16a137\"/> </label>"), Ts = /* @__PURE__ */ G("<label class=\"svelte-16a137\"><input type=\"radio\" class=\"svelte-16a137\"/><span class=\"svelte-16a137\"> </span></label>"), Es = /* @__PURE__ */ G("<span class=\"pc-control-label svelte-16a137\"> </span> <div class=\"pc-control-segments svelte-16a137\" role=\"radiogroup\"></div>", 1), Ds = /* @__PURE__ */ G("<option class=\"svelte-16a137\"> </option>"), Os = /* @__PURE__ */ G("<select class=\"svelte-16a137\"></select>"), ks = /* @__PURE__ */ G("<input type=\"number\" class=\"svelte-16a137\"/>"), As = /* @__PURE__ */ G("<textarea class=\"svelte-16a137\"></textarea>"), js = /* @__PURE__ */ G("<input type=\"text\" class=\"svelte-16a137\"/>"), Ms = /* @__PURE__ */ G("<label class=\"svelte-16a137\"> </label> <!>", 1), Ns = /* @__PURE__ */ G("<button type=\"button\" class=\"svelte-16a137\"> </button>"), Ps = /* @__PURE__ */ G("<small class=\"svelte-16a137\"> </small>"), Fs = /* @__PURE__ */ G("<div class=\"pc-detail-error svelte-16a137\"><!></div>"), Is = /* @__PURE__ */ G("<div><!> <!> <!> <!> <!></div>");
function Ls(e, t) {
	Ue(t, !0);
	let n = Ni(t, "error", 3, ""), r = Ni(t, "disabled", 3, !1), i = Ni(t, "pending", 3, !1), a = () => t.control.editor === "enum" && (t.control.options?.length ?? 0) > 1 && (t.control.options?.length ?? 0) <= 3 && t.control.options.every((e) => e.label.length <= 10), o = () => t.control.effective !== void 0 && t.control.effective !== t.text && t.control.source !== "Saved setting" ? t.control.source : "";
	var s = Is();
	let c;
	var l = R(s), u = (e) => {
		var i = Cs(), a = z(i), o = R(a, !0);
		P(a), Ss(B(a, 2), {
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
		var n = ws(), i = R(n);
		X(i);
		var a = B(i, 1, !0);
		P(n), V((e) => {
			Z(i, "aria-label", t.control.label), wi(i, e), i.disabled = r(), q(a, t.control.label);
		}, [() => !!t.control.value]), W("change", i, (e) => {
			r() || t.onvalue(e.currentTarget.checked);
		}), K(e, n);
	}, f = (e) => {
		var n = Es(), i = z(n), a = R(i, !0);
		P(i);
		var o = B(i, 2);
		Y(o, 21, () => t.control.options ?? [], (e) => e.value, (e, n) => {
			var i = Ts(), a = R(i);
			X(a);
			var o = B(a), s = R(o, !0);
			P(o), P(i), V((e) => {
				Z(a, "name", t.idPrefix + "-choice"), Z(a, "aria-label", H(n).label), Ci(a, H(n).value), wi(a, e), a.disabled = r(), q(s, H(n).label);
			}, [() => String(t.control.value) === H(n).value]), W("change", a, (e) => {
				!r() && e.currentTarget.checked && t.onvalue(H(n).value);
			}), K(e, i);
		}), P(o), V(() => {
			q(a, t.control.label), Z(o, "aria-label", t.control.label);
		}), K(e, n);
	}, p = /* @__PURE__ */ F(() => a()), m = (e) => {
		var i = Ms(), a = z(i), o = R(a, !0);
		P(a);
		var s = B(a, 2), c = (e) => {
			var n = Os();
			Y(n, 21, () => t.control.options ?? [], (e) => e.value, (e, t) => {
				var n = Ds(), r = R(n, !0);
				P(n);
				var i = {};
				V(() => {
					q(r, H(t).label), i !== (i = H(t).value) && (n.value = (n.__value = H(t).value) ?? "");
				}), K(e, n);
			}), P(n);
			var i;
			gi(n), V((e) => {
				Z(n, "id", t.idPrefix + "-editor"), Z(n, "aria-label", t.control.label), n.disabled = r(), i !== (i = e) && (n.value = (n.__value = e) ?? "", hi(n, e));
			}, [() => String(t.control.value)]), W("change", n, (e) => {
				r() || t.onvalue(e.currentTarget.value);
			}), K(e, n);
		}, l = (e) => {
			var i = ks();
			X(i), V((e) => {
				Z(i, "id", t.idPrefix + "-editor"), Z(i, "aria-label", t.control.label), Z(i, "min", t.control.min), Z(i, "max", t.control.max), Z(i, "step", t.control.step ?? 1), Z(i, "aria-invalid", !!n()), Z(i, "aria-describedby", n() ? t.idPrefix + "-error" : void 0), Ci(i, e), i.disabled = r();
			}, [() => Number(t.control.value)]), W("change", i, (e) => {
				r() || t.onnumber(e.currentTarget);
			}), K(e, i);
		}, u = (e) => {
			var i = As();
			at(i), V(() => {
				Z(i, "id", t.idPrefix + "-editor"), Z(i, "aria-label", t.control.label), Z(i, "aria-invalid", !!n()), Z(i, "aria-describedby", n() ? t.idPrefix + "-error" : void 0), Ci(i, t.text), i.disabled = r();
			}), W("input", i, (e) => {
				r() || t.ontext(e.currentTarget.value);
			}), K(e, i);
		}, d = (e) => {
			var n = js();
			X(n), V(() => {
				Z(n, "id", t.idPrefix + "-editor"), Z(n, "aria-label", t.control.label), Ci(n, t.text), n.disabled = r();
			}), W("change", n, (e) => {
				r() || t.onvalue(e.currentTarget.value);
			}), K(e, n);
		}, f = /* @__PURE__ */ F(() => t.control.singleLine && t.control.editor === "text" && !t.text.includes("\n") && !t.text.includes("\r")), p = (e) => {
			var n = As();
			at(n), V(() => {
				Z(n, "id", t.idPrefix + "-editor"), Z(n, "aria-label", t.control.label), Ci(n, t.text), n.disabled = r();
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
		var n = Ns(), a = R(n, !0);
		P(n), V(() => {
			Z(n, "data-save-control", t.control.key), n.disabled = r() || i(), q(a, i() ? "Validating…" : "Save " + t.control.label);
		}), W("click", n, () => {
			!r() && !i() && t.onsave();
		}), K(e, n);
	};
	J(h, (e) => {
		(t.control.editor === "json" || t.control.editor === "lines") && e(g);
	});
	var _ = B(h, 2), v = (e) => {
		var n = Ps(), r = R(n, !0);
		P(n), V(() => q(r, t.control.help)), K(e, n);
	};
	J(_, (e) => {
		t.control.help && e(v);
	});
	var y = B(_, 2), b = (e) => {
		var n = Ps(), r = R(n, !0);
		P(n), V(() => q(r, t.control.exposureNote)), K(e, n);
	}, x = (e) => {
		var n = Ps(), r = R(n);
		P(n), V((e) => q(r, `${e ?? ""} · Effective: ${t.control.effective ?? ""}`), [() => o()]), K(e, n);
	}, S = /* @__PURE__ */ F(() => o());
	J(y, (e) => {
		t.control.exposureNote ? e(b) : H(S) && e(x, 1);
	});
	var C = B(y, 2), w = (e) => {
		var r = Fs(), i = R(r);
		{
			let e = /* @__PURE__ */ F(() => ({ inputLabel: t.control.label }));
			fo(i, {
				get issue() {
					return n();
				},
				get context() {
					return H(e);
				}
			});
		}
		P(r), V(() => Z(r, "id", t.idPrefix + "-error")), K(e, r);
	};
	J(C, (e) => {
		n() && e(w);
	}), P(s), V(() => c = fi(s, 1, "pc-detail-control svelte-16a137", null, c, { "pc-control-number": t.control.editor === "number" })), K(e, s), We();
}
Er([
	"change",
	"input",
	"click"
]);
//#endregion
//#region ui/RecallDetails.svelte
var Rs = /* @__PURE__ */ G("<p class=\"svelte-1kifnmo\"> </p>"), zs = /* @__PURE__ */ G("<div><!></div>"), Bs = /* @__PURE__ */ G("<p class=\"svelte-1kifnmo\">Add a matching Recall node and connect it to the workflow. Queueing this Shortcut has an effect when that Recall executes.</p>"), Vs = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-recall-link svelte-1kifnmo\"> </button>"), Hs = /* @__PURE__ */ G("<section class=\"pc-recall-details svelte-1kifnmo\" aria-label=\"Memory recall\"><h3 class=\"svelte-1kifnmo\">Memory recall</h3><p role=\"status\" class=\"svelte-1kifnmo\"> </p> <dl class=\"svelte-1kifnmo\"><dt class=\"svelte-1kifnmo\">Memory set</dt><dd class=\"svelte-1kifnmo\"> </dd><dt class=\"svelte-1kifnmo\">Target</dt><dd class=\"svelte-1kifnmo\"> </dd><dt class=\"svelte-1kifnmo\">Repetition</dt><dd class=\"svelte-1kifnmo\"> </dd><dt class=\"svelte-1kifnmo\">Consume on</dt><dd class=\"svelte-1kifnmo\"> </dd></dl> <!> <!> <div class=\"pc-detail-actions svelte-1kifnmo\"><button type=\"button\">Queue recall</button><button type=\"button\">Cancel recall</button></div> <!><!><!> <!> <!> <small class=\"svelte-1kifnmo\">Matching nodes share one request. The first successful matching Recall supplies the selection for a generation. Use different memory-set IDs for independent selections. Automatic triggers keep their own conditions.</small></section>");
function Us(e, t) {
	let n = Rr();
	Ue(t, !0);
	let r = /* @__PURE__ */ I(!1), i = /* @__PURE__ */ I(""), a = "", o = 0, s = /* @__PURE__ */ F(() => H(r) ? "Wait for the Recall change to finish." : t.actions.queue ? t.view.queueAllowed ? "" : t.view.reason || "Recall is already queued." : "Queue recall is unavailable in this workspace."), c = /* @__PURE__ */ F(() => H(r) ? "Wait for the Recall change to finish." : t.actions.cancel ? t.view.cancelAllowed ? "" : "No recall is queued to cancel." : "Cancel recall is unavailable in this workspace.");
	Cn(() => {
		a !== t.view.nodeId && (a = t.view.nodeId, o++, L(r, !1), L(i, ""));
	});
	async function l(e) {
		if (H(r)) return;
		let n = t.view.nodeId, a = ++o;
		L(r, !0), L(i, "");
		try {
			let r = await t.actions[e]?.();
			a === o && n === t.view.nodeId && r?.ok !== !0 && L(i, (r?.error ? r.error.code + ": " + r.error.message : void 0) ?? "Memory recall is unavailable.", !0);
		} catch {
			a === o && n === t.view.nodeId && L(i, "Memory recall could not be updated.");
		} finally {
			a === o && n === t.view.nodeId && L(r, !1);
		}
	}
	var u = Hs(), d = B(R(u)), f = R(d, !0);
	P(d);
	var p = B(d, 2), m = B(R(p)), h = R(m, !0);
	P(m);
	var g = B(m, 2), _ = R(g, !0);
	P(g);
	var v = B(g, 2), y = R(v, !0);
	P(v);
	var b = B(v, 2), x = R(b, !0);
	P(b), P(p);
	var S = B(p, 2), C = (e) => {
		var n = Rs(), r = R(n);
		P(n), V(() => q(r, `Remaining: ${t.view.remainingText ?? ""}`)), K(e, n);
	};
	J(S, (e) => {
		t.view.queued && e(C);
	});
	var w = B(S, 2), T = (e) => {
		var n = Rs(), r = R(n);
		P(n), V(() => q(r, `Pending generations: ${t.view.pendingCount ?? ""}`)), K(e, n);
	};
	J(w, (e) => {
		t.view.pendingCount && e(T);
	});
	var E = B(w, 2), D = R(E), O = B(D);
	P(E);
	var k = B(E, 2), A = (e) => {
		var t = Rs(), r = R(t, !0);
		P(t), V(() => {
			Z(t, "id", n + "-queue-reason"), q(r, H(s));
		}), K(e, t);
	}, j = (e) => {
		var n = Rs(), r = R(n, !0);
		P(n), V(() => q(r, t.view.reason)), K(e, n);
	};
	J(k, (e) => {
		H(s) ? e(A) : t.view.reason && e(j, 1);
	});
	var M = B(k), ee = (e) => {
		var t = Rs(), r = R(t, !0);
		P(t), V(() => {
			Z(t, "id", n + "-cancel-reason"), q(r, H(c));
		}), K(e, t);
	};
	J(M, (e) => {
		H(c) && e(ee);
	});
	var te = B(M), ne = (e) => {
		var t = zs();
		fo(R(t), { get issue() {
			return H(i);
		} }), P(t), K(e, t);
	};
	J(te, (e) => {
		H(i) && e(ne);
	});
	var re = B(te, 2), ie = (e) => {
		K(e, Bs());
	}, ae = /* @__PURE__ */ F(() => t.view.shortcutNodeIds.includes(t.view.nodeId) && t.view.consumerCount === 0);
	J(re, (e) => {
		H(ae) && e(ie);
	}), Y(B(re, 2), 17, () => t.view.hotkeys, (e) => e.nodeId, (e, n) => {
		var r = Vs(), i = R(r);
		P(r), V(() => {
			r.disabled = !t.actions.revealShortcut, q(i, `Recall Shortcut · ${H(n).label ?? ""}`);
		}), W("click", r, () => t.actions.revealShortcut?.(H(n).nodeId)), K(e, r);
	}), Me(2), P(u), V(() => {
		q(f, t.view.statusText), q(h, t.view.memorySetId || "Choose a memory set"), q(_, t.view.targetLabel), q(y, t.view.useLabel), q(x, t.view.consumeLabel), D.disabled = H(r) || !t.view.queueAllowed || !t.actions.queue, Z(D, "aria-describedby", H(s) ? n + "-queue-reason" : void 0), O.disabled = H(r) || !t.view.cancelAllowed || !t.actions.cancel, Z(O, "aria-describedby", H(c) ? n + "-cancel-reason" : void 0);
	}), W("click", D, () => l("queue")), W("click", O, () => l("cancel")), K(e, u), We();
}
Er(["click"]);
//#endregion
//#region ui/ModifierStack.svelte
var Ws = /* @__PURE__ */ G("<label class=\"svelte-1ibq9q\"><input type=\"checkbox\" class=\"svelte-1ibq9q\"/> </label>"), Gs = /* @__PURE__ */ G("<option class=\"svelte-1ibq9q\"> </option>"), Ks = /* @__PURE__ */ G("<label class=\"pc-modifier-check svelte-1ibq9q\"><input type=\"checkbox\" class=\"svelte-1ibq9q\"/> </label>"), qs = /* @__PURE__ */ G("<select class=\"svelte-1ibq9q\"></select>"), Js = /* @__PURE__ */ G("<input type=\"number\" class=\"svelte-1ibq9q\"/>"), Ys = /* @__PURE__ */ G("<textarea class=\"svelte-1ibq9q\"></textarea>"), Xs = /* @__PURE__ */ G("<label class=\"svelte-1ibq9q\"> </label> <!>", 1), Zs = /* @__PURE__ */ G("<small class=\"svelte-1ibq9q\"> </small>"), Qs = /* @__PURE__ */ G("<!> <!>", 1), $s = /* @__PURE__ */ G("<details class=\"svelte-1ibq9q\"><summary class=\"svelte-1ibq9q\"> <!></summary> <!> <button type=\"button\" class=\"svelte-1ibq9q\"> </button></details>"), ec = /* @__PURE__ */ G("<div class=\"pc-modifier-error svelte-1ibq9q\"><!></div>"), tc = /* @__PURE__ */ G("<div class=\"pc-modifier-entry svelte-1ibq9q\"><div class=\"pc-modifier-heading svelte-1ibq9q\"><label class=\"svelte-1ibq9q\"><input type=\"checkbox\" class=\"svelte-1ibq9q\"/><span class=\"svelte-1ibq9q\"> <small class=\"svelte-1ibq9q\"> </small></span></label> <div class=\"pc-modifier-order svelte-1ibq9q\"><button type=\"button\" title=\"Move up\" class=\"svelte-1ibq9q\">↑</button> <button type=\"button\" title=\"Move down\" class=\"svelte-1ibq9q\">↓</button> <button type=\"button\" title=\"Remove\" class=\"svelte-1ibq9q\">×</button></div></div> <!> <!></div>"), nc = /* @__PURE__ */ G("<div class=\"pc-modifier-stack svelte-1ibq9q\"><small class=\"svelte-1ibq9q\"> </small> <!></div>"), rc = /* @__PURE__ */ G("<small role=\"status\" class=\"svelte-1ibq9q\">Validating modifiers…</small>"), ic = /* @__PURE__ */ G("<section class=\"pc-modifiers svelte-1ibq9q\" data-modifier-controls=\"\" aria-label=\"Text modifiers\"><div class=\"pc-modifier-quick svelte-1ibq9q\"><!> <select aria-label=\"Add text modifier\" class=\"svelte-1ibq9q\"><option class=\"svelte-1ibq9q\">Add modifier…</option><!></select></div> <!> <!> <!></section>");
function ac(e, t) {
	Ue(t, !0);
	let n = (e) => t.options.find((t) => t.type === e.type), r = (e) => n(e)?.label ?? e.type, i = (e) => t.drafts[e.id]?.settings ?? e.settings, a = (e) => t.disabled || t.busy || !t.options.some((t) => t.type === e) || t.items.length >= 16 && !t.items.some((t) => t.type === e);
	var o = ic(), s = R(o), c = R(s);
	Y(c, 16, () => ["trim", "wrap"], qr, (e, n) => {
		var r = Ws(), i = R(r);
		X(i);
		var o = B(i, 1, !0);
		P(r), V((e, t) => {
			Z(i, "aria-label", (n === "trim" ? "Trim" : "Wrap") + " output"), wi(i, e), i.disabled = t, q(o, n === "trim" ? "Trim" : "Wrap");
		}, [() => t.items.some((e) => e.type === n && e.enabled), () => a(n)]), W("change", i, (e) => {
			a(n) || t.onquick(n, e.currentTarget.checked);
		}), K(e, r);
	});
	var l = B(c, 2), u = R(l);
	u.value = u.__value = "", Y(B(u), 17, () => t.options.filter((e) => !["trim", "wrap"].includes(e.type)), (e) => e.type, (e, t) => {
		var n = Gs(), r = R(n, !0);
		P(n);
		var i = {};
		V(() => {
			q(r, H(t).label), i !== (i = H(t).type) && (n.value = (n.__value = H(t).type) ?? "");
		}), K(e, n);
	}), P(l), l.value = l.__value = "", P(s);
	var d = B(s, 2), f = (e) => {
		var a = nc(), o = R(a), s = R(o);
		P(o), Y(B(o, 2), 19, () => t.items, (e) => e.id, (e, a, o) => {
			let s = /* @__PURE__ */ F(() => n(H(a))), c = /* @__PURE__ */ F(() => r(H(a))), l = /* @__PURE__ */ F(() => t.drafts[H(a).id]);
			var u = tc(), d = R(u), f = R(d), p = R(f);
			X(p);
			var m = B(p), h = R(m), g = B(h), _ = R(g, !0);
			P(g), P(m), P(f);
			var v = B(f, 2), y = R(v), b = B(y, 2), x = B(b, 2);
			P(v), P(d);
			var S = B(d, 2), C = (e) => {
				var n = $s(), r = R(n), o = R(r), u = B(o), d = (e) => {
					K(e, Ir("· Unsaved"));
				};
				J(u, (e) => {
					H(l)?.dirty && e(d);
				}), P(r);
				var f = B(r, 2);
				Y(f, 17, () => H(s).fields, (e) => e.key, (e, n) => {
					let r = /* @__PURE__ */ F(() => t.idPrefix + "-modifier-" + H(a).id + "-" + H(n).key);
					var o = Qs(), s = z(o), l = (e) => {
						var o = Ks(), s = R(o);
						X(s);
						var l = B(s, 1, !0);
						P(o), V((e) => {
							Z(s, "id", H(r)), Z(s, "aria-label", H(c) + " " + H(n).label), wi(s, e), s.disabled = t.disabled, q(l, H(n).label);
						}, [() => !!i(H(a))[H(n).key]]), W("change", s, (e) => {
							t.disabled || t.ondraft(H(a).id, H(n).key, e.currentTarget.checked);
						}), K(e, o);
					}, u = (e) => {
						var o = Xs(), s = z(o), l = R(s, !0);
						P(s);
						var u = B(s, 2), d = (e) => {
							var o = qs();
							Y(o, 21, () => H(n).options ?? [], (e) => e.value, (e, t) => {
								var n = Gs(), r = R(n, !0);
								P(n);
								var i = {};
								V(() => {
									q(r, H(t).label), i !== (i = H(t).value) && (n.value = (n.__value = H(t).value) ?? "");
								}), K(e, n);
							}), P(o);
							var s;
							gi(o), V((e) => {
								Z(o, "id", H(r)), Z(o, "aria-label", H(c) + " " + H(n).label), o.disabled = t.disabled, s !== (s = e) && (o.value = (o.__value = e) ?? "", hi(o, e));
							}, [() => String(i(H(a))[H(n).key] ?? "")]), W("change", o, (e) => {
								t.disabled || t.ondraft(H(a).id, H(n).key, e.currentTarget.value);
							}), K(e, o);
						}, f = (e) => {
							var o = Js();
							X(o), V((e) => {
								Z(o, "id", H(r)), Z(o, "aria-label", H(c) + " " + H(n).label), Z(o, "min", H(n).min), Z(o, "max", H(n).max), Z(o, "step", H(n).step ?? 1), Ci(o, e), o.disabled = t.disabled;
							}, [() => String(i(H(a))[H(n).key] ?? "")]), W("input", o, (e) => {
								t.disabled || t.ondraft(H(a).id, H(n).key, e.currentTarget.value ? Number(e.currentTarget.value) : null);
							}), K(e, o);
						}, p = (e) => {
							var o = Ys();
							at(o), V((e) => {
								Z(o, "id", H(r)), Z(o, "aria-label", H(c) + " " + H(n).label), Ci(o, e), o.disabled = t.disabled;
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
						var t = Zs(), r = R(t, !0);
						P(t), V(() => q(r, H(n).help)), K(e, t);
					};
					J(d, (e) => {
						H(n).help && e(f);
					}), K(e, o);
				});
				var p = B(f, 2), m = R(p, !0);
				P(p), P(n), V(() => {
					n.open = !!H(l)?.dirty || !!H(l)?.error, q(o, `${H(c) ?? ""} settings`), Z(p, "aria-label", "Save " + H(c) + " settings"), p.disabled = t.disabled || !!H(l)?.pending || !H(l)?.dirty, q(m, H(l)?.pending ? "Validating…" : "Save settings");
				}), W("click", p, () => {
					!t.disabled && !H(l)?.pending && H(l)?.dirty && t.onsave(H(a).id);
				}), K(e, n);
			};
			J(S, (e) => {
				H(s)?.fields.length && e(C);
			});
			var w = B(S, 2), T = (e) => {
				var t = ec();
				fo(R(t), { get issue() {
					return H(l).error;
				} }), P(t), K(e, t);
			};
			J(w, (e) => {
				H(l)?.error && e(T);
			}), P(u), V(() => {
				Z(u, "data-modifier-id", H(a).id), Z(u, "data-modifier-state", H(a).enabled ? "active" : "disabled"), Z(p, "aria-label", "Enable " + H(c) + " modifier"), wi(p, H(a).enabled), p.disabled = t.disabled || t.busy, q(h, `${H(o) + 1}. ${H(c) ?? ""}`), q(_, H(a).enabled ? "Active" : "Disabled"), Z(y, "aria-label", "Move " + H(c) + " up"), y.disabled = t.disabled || t.busy || H(o) === 0, Z(b, "aria-label", "Move " + H(c) + " down"), b.disabled = t.disabled || t.busy || H(o) === t.items.length - 1, Z(x, "aria-label", "Remove " + H(c) + " modifier"), x.disabled = t.disabled || t.busy;
			}), W("change", p, (e) => {
				!t.disabled && !t.busy && t.onenable(H(a).id, e.currentTarget.checked);
			}), W("click", y, () => {
				!t.disabled && !t.busy && H(o) > 0 && t.onmove(H(a).id, -1);
			}), W("click", b, () => {
				!t.disabled && !t.busy && H(o) < t.items.length - 1 && t.onmove(H(a).id, 1);
			}), W("click", x, () => {
				!t.disabled && !t.busy && t.onremove(H(a).id);
			}), K(e, u);
		}), P(a), V((e) => q(s, `${e ?? ""} active · ${t.items.length ?? ""} total · Applied in order`), [() => t.items.filter((e) => e.enabled).length]), K(e, a);
	};
	J(d, (e) => {
		t.items.length && e(f);
	});
	var p = B(d, 2), m = (e) => {
		K(e, rc());
	};
	J(p, (e) => {
		t.busy && e(m);
	});
	var h = B(p, 2), g = (e) => {
		var n = ec();
		fo(R(n), { get issue() {
			return t.error;
		} }), P(n), K(e, n);
	};
	J(h, (e) => {
		t.error && e(g);
	}), P(o), V(() => l.disabled = t.disabled || t.busy || t.items.length >= 16), W("change", l, (e) => {
		let n = e.currentTarget.value;
		e.currentTarget.value = "", !t.disabled && !t.busy && t.items.length < 16 && n && t.onadd(n);
	}), K(e, o), We();
}
Er([
	"change",
	"click",
	"input"
]);
//#endregion
//#region ui/WorkflowData.svelte
var oc = /* @__PURE__ */ G("<button type=\"button\" data-load-workflow-data=\"\" class=\"svelte-8bs3bu\"> </button>"), sc = /* @__PURE__ */ G("<label class=\"pc-wd-number svelte-8bs3bu\"><span class=\"svelte-8bs3bu\">Starting day</span><input aria-label=\"Starting day\" type=\"number\" min=\"1\" step=\"1\" class=\"svelte-8bs3bu\"/></label> <label class=\"pc-wd-number svelte-8bs3bu\"><span class=\"svelte-8bs3bu\">Starting time</span><input aria-label=\"Starting time\" type=\"text\" inputmode=\"numeric\" placeholder=\"00:00\" class=\"svelte-8bs3bu\"/></label> <label class=\"pc-wd-number svelte-8bs3bu\"><span class=\"svelte-8bs3bu\">Hours per day</span><input aria-label=\"Hours per day\" type=\"number\" step=\"any\" class=\"svelte-8bs3bu\"/></label> <p class=\"pc-wd-help svelte-8bs3bu\">Initial values only. Saved time stays unchanged.</p>", 1), cc = /* @__PURE__ */ G("<label class=\"pc-wd-block svelte-8bs3bu\"> <textarea rows=\"4\" maxlength=\"100000\" class=\"svelte-8bs3bu\"></textarea></label> <p class=\"pc-wd-help svelte-8bs3bu\"> </p>", 1), lc = /* @__PURE__ */ G("<output class=\"pc-wd-source-value svelte-8bs3bu\"> </output>"), uc = /* @__PURE__ */ G("<button type=\"button\" class=\"svelte-8bs3bu\"> </button>"), dc = /* @__PURE__ */ G("<div class=\"pc-wd-choices svelte-8bs3bu\" role=\"group\"></div>"), fc = /* @__PURE__ */ G("<option class=\"svelte-8bs3bu\"> </option>"), pc = /* @__PURE__ */ G("<select class=\"svelte-8bs3bu\"><!><!></select>"), mc = /* @__PURE__ */ G("<div class=\"pc-wd-create svelte-8bs3bu\"><label class=\"pc-wd-field svelte-8bs3bu\">Name<input maxlength=\"256\" class=\"svelte-8bs3bu\"/></label> <div class=\"pc-wd-actions svelte-8bs3bu\"><button type=\"button\" data-create-workflow-data=\"\" class=\"svelte-8bs3bu\"> </button><button type=\"button\" class=\"svelte-8bs3bu\">Cancel</button></div></div>"), hc = /* @__PURE__ */ G("<label class=\"pc-wd-field svelte-8bs3bu\">Format<select aria-label=\"Document format\" class=\"svelte-8bs3bu\"></select></label><p class=\"pc-wd-help svelte-8bs3bu\">A saved document keeps its format.</p>", 1), gc = /* @__PURE__ */ G("<div class=\"pc-wd-field svelte-8bs3bu\"><span class=\"svelte-8bs3bu\">Format</span><output class=\"svelte-8bs3bu\">JSON</output></div><p class=\"pc-wd-help svelte-8bs3bu\"> </p>", 1), _c = /* @__PURE__ */ G("<label class=\"pc-wd-field svelte-8bs3bu\">Actor ID<input aria-label=\"Private actor ID\" maxlength=\"128\" class=\"svelte-8bs3bu\"/></label>"), vc = /* @__PURE__ */ G("<label class=\"pc-wd-field svelte-8bs3bu\">Columns<input aria-label=\"CSV columns\" placeholder=\"id, text\" class=\"svelte-8bs3bu\"/></label>"), yc = /* @__PURE__ */ G("<label class=\"pc-wd-field svelte-8bs3bu\">Calendar<input aria-label=\"Initial calendar name\" class=\"svelte-8bs3bu\"/></label><label class=\"pc-wd-field svelte-8bs3bu\">Expected calendar<input aria-label=\"Expected calendar\" placeholder=\"Any calendar\" class=\"svelte-8bs3bu\"/></label><p class=\"pc-wd-help svelte-8bs3bu\">Expected calendar validates saved data.</p>", 1), bc = /* @__PURE__ */ G("<p class=\"pc-wd-help svelte-8bs3bu\">Open an active chat to save initial settings.</p>"), xc = /* @__PURE__ */ G("<div class=\"pc-wd-help svelte-8bs3bu\"><!></div>"), Sc = /* @__PURE__ */ G("<div class=\"pc-wd-error svelte-8bs3bu\"><!></div>"), Cc = /* @__PURE__ */ G("<p class=\"pc-wd-help svelte-8bs3bu\" role=\"status\"> </p>"), wc = /* @__PURE__ */ G("<div class=\"pc-workflow-data svelte-8bs3bu\"><p class=\"pc-wd-binding svelte-8bs3bu\"> </p> <details class=\"pc-wd-group svelte-8bs3bu\" data-workflow-initial=\"\"><summary class=\"svelte-8bs3bu\"> <span class=\"svelte-8bs3bu\"> </span></summary> <div class=\"pc-wd-body svelte-8bs3bu\"><!> <!></div></details> <details class=\"pc-wd-group svelte-8bs3bu\" data-workflow-advanced=\"\"><summary class=\"svelte-8bs3bu\">Advanced <span class=\"svelte-8bs3bu\"> </span></summary> <div class=\"pc-wd-body svelte-8bs3bu\"><div class=\"pc-wd-source-row svelte-8bs3bu\"><span class=\"pc-wd-row-label svelte-8bs3bu\"> </span> <!> <button type=\"button\" class=\"pc-wd-add svelte-8bs3bu\">+</button></div> <!> <p class=\"pc-wd-help svelte-8bs3bu\"> </p> <hr class=\"svelte-8bs3bu\"/> <!> <span class=\"pc-wd-label svelte-8bs3bu\">Visibility</span> <div class=\"pc-wd-choices svelte-8bs3bu\" role=\"group\"></div> <!> <!> <label class=\"pc-wd-field svelte-8bs3bu\">Document ID<input readonly=\"\" class=\"svelte-8bs3bu\"/></label> <!></div></details> <div class=\"pc-wd-actions pc-wd-save svelte-8bs3bu\"><button type=\"button\" data-save-workflow-data=\"\" class=\"svelte-8bs3bu\"> </button></div> <!> <!> <!> <!></div>");
function Tc(e, t) {
	Ue(t, !0);
	let n = Ni(t, "actions", 19, () => ({})), r = Ni(t, "disabled", 3, !1), i = Ni(t, "idPrefix", 3, "pc-workflow-data"), a = /* @__PURE__ */ I(null), o = /* @__PURE__ */ I("1"), s = /* @__PURE__ */ I("00:00"), c = /* @__PURE__ */ I("24"), l = /* @__PURE__ */ I("story-calendar"), u = /* @__PURE__ */ I(""), d = /* @__PURE__ */ I("text"), f = /* @__PURE__ */ I("public"), p = /* @__PURE__ */ I(""), m = /* @__PURE__ */ I(""), h = /* @__PURE__ */ I(!1), g = /* @__PURE__ */ I(""), _ = /* @__PURE__ */ I(""), v = /* @__PURE__ */ I(""), y = /* @__PURE__ */ I(""), b = /* @__PURE__ */ I(!1), x = "", S = 0, C = !0, w = /* @__PURE__ */ F(() => t.model.kind === "clock" ? "Clock" : t.model.kind === "outcomes" ? "Outcomes" : "Document"), T = /* @__PURE__ */ F(() => t.model.kind === "clock" ? "clock" : t.model.kind === "outcomes" ? "outcomes" : "document"), E = /* @__PURE__ */ F(() => !r() && t.model.editable && !!H(a) && !H(_)), D = /* @__PURE__ */ F(() => !r() && t.model.editable && t.model.available && !H(_)), O = [
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
	], A = (e) => k.find((t) => t.value === e)?.label ?? e, j = (e) => O.find((t) => t.value === e)?.label ?? e, M = () => JSON.stringify([
		t.selection.selectionKey,
		t.selection.address,
		t.model.targetId,
		t.model.key
	]);
	function ee(e) {
		L(a, e ? structuredClone(e) : null, !0), L(u, e?.content ?? "", !0), L(d, e?.format ?? t.model.format, !0), L(f, e?.visibility.kind ?? t.model.visibility.kind, !0);
		let n = e?.visibility ?? t.model.visibility;
		if (L(p, n.kind === "actor-private" ? n.actorId : "", !0), L(m, e?.columns?.join(", ") ?? "", !0), L(o, "1"), L(s, "00:00"), L(c, "24"), L(l, "story-calendar"), t.model.kind === "clock" && e) try {
			let t = JSON.parse(e.content), n = t.dayLengthMinutes;
			L(o, String(Math.floor(t.absoluteMinute / n) + 1), !0);
			let r = t.absoluteMinute % n;
			L(s, String(Math.floor(r / 60)).padStart(2, "0") + ":" + String(r % 60).padStart(2, "0")), L(c, String(n / 60), !0), L(l, t.calendarId, !0);
		} catch {
			L(a, null), L(v, "Load a valid clock template before changing its starting values.");
		}
		L(b, !1);
	}
	Cn(() => {
		let e = M();
		e !== x && (x = e, S++, L(_, ""), L(v, ""), L(y, ""), L(h, !1), L(g, ""), _r(() => ee(t.model.definition)));
	}), Fi(() => {
		C = !1, S++;
	});
	function te(e, t) {
		(e === "actor" ? !H(D) : !H(E)) || (L(e === "day" ? o : e === "time" ? s : e === "hours" ? c : e === "calendar" ? l : e === "content" ? u : e === "actor" ? p : m, t, !0), S++, L(b, !0), L(v, ""), L(y, ""));
	}
	function ne(e) {
		H(E) && t.model.kind === "notes" && (L(d, e, !0), H(u).trim() || L(u, e === "json" ? "[]" : "", !0), S++, L(b, !0), L(v, ""), L(y, ""));
	}
	function re(e) {
		H(D) && (L(f, e, !0), S++, L(b, !0), L(v, ""), L(y, ""));
	}
	function ie() {
		return H(f) === "actor-private" ? {
			kind: H(f),
			actorId: H(p).trim()
		} : { kind: H(f) };
	}
	function ae() {
		let e = Number(H(o)), t = Number(H(c)) * 60, n = /^(\d+):([0-5]\d)$/.exec(H(s)), r = n ? Number(n[1]) * 60 + Number(n[2]) : NaN, i = (e - 1) * t + r;
		if (!Number.isSafeInteger(e) || e < 1 || !Number.isSafeInteger(t) || t < 1 || !Number.isSafeInteger(r) || r < 0 || r >= t || !Number.isSafeInteger(i) || !H(l).trim()) throw Error("Use a positive starting day, a time within the day, and a day length in whole minutes.");
		return {
			calendarId: H(l).trim(),
			absoluteMinute: i,
			dayLengthMinutes: t
		};
	}
	function oe() {
		if (!H(a)) throw Error("Load the initial template before saving.");
		let e = {
			targetId: t.model.targetId,
			name: H(a).name,
			format: H(d),
			content: H(u),
			visibility: ie()
		};
		if (H(f) === "actor-private" && !H(p).trim()) throw Error("Choose an actor for private data.");
		return t.model.kind === "clock" && (e.content = JSON.stringify({
			...JSON.parse(H(a).content),
			...ae()
		}, null, 2)), H(d) === "csv" && (e.columns = H(m).split(",").map((e) => e.trim()).filter(Boolean)), e;
	}
	let se = /* @__PURE__ */ F(() => H(D) && (H(a) ? !!n().saveWorkflowData : !!n().saveWorkflowDataVisibility) && H(b) && (H(f) !== "actor-private" || !!H(p).trim()));
	async function ce(e, n) {
		if (r() || !t.model.editable || H(_)) return;
		let i = structuredClone(t.selection), a = t.model.key, o = M(), s = ++S, c = e === "load" && H(b) ? {
			visibility: H(f),
			actorId: H(p)
		} : null;
		L(_, e, !0), L(v, ""), L(y, "");
		try {
			let r = await n(i, a);
			if (!C || s !== S || o !== M() || t.selection.revision !== i.revision) return;
			if (!r.ok) {
				L(v, r.error.code + ": " + r.error.message);
				return;
			}
			if (e === "load") {
				if (!r.data?.definition) {
					L(v, "The initial template could not be loaded.");
					return;
				}
				ee(r.data.definition), c && (L(f, c.visibility, !0), L(p, c.actorId, !0), L(b, !0));
			} else L(b, !1), L(h, !1), L(y, r.data?.message ?? (e === "save" ? "Initial settings saved." : "Workflow data updated."), !0);
		} catch (e) {
			C && s === S && o === M() && t.selection.revision === i.revision && L(v, e instanceof Error ? e.message : "Workflow data could not be updated.", !0);
		} finally {
			C && s === S && o === M() && L(_, "");
		}
	}
	function le() {
		if (!H(se)) return;
		if (!H(a) && n().saveWorkflowDataVisibility) {
			ce("save", (e, t) => n().saveWorkflowDataVisibility(e, t, ie()));
			return;
		}
		if (!n().saveWorkflowData) return;
		let e;
		try {
			e = oe();
		} catch (e) {
			L(v, e instanceof Error ? e.message : "Check the initial settings.", !0);
			return;
		}
		ce("save", (t, r) => n().saveWorkflowData(t, r, e));
	}
	function ue(e) {
		!r() && t.model.editable && !H(_) && n().bindWorkflowData && e !== t.model.targetId && t.model.sources.some((t) => t.value === e) && ce("bind", (t, r) => n().bindWorkflowData(t, r, e));
	}
	function de() {
		if (r() || !t.model.editable || !t.model.available || H(_) || !n().createWorkflowData || !H(g).trim()) return;
		let e = {
			name: H(g).trim(),
			kind: t.model.kind,
			format: t.model.kind === "notes" ? H(d) : "json",
			visibility: ie()
		};
		try {
			if (H(f) === "actor-private" && !H(p).trim()) throw Error("Choose an actor for private data.");
			t.model.kind === "clock" && (e = {
				...e,
				...ae()
			});
		} catch (e) {
			L(v, e instanceof Error ? e.message : "Check the new data settings.", !0);
			return;
		}
		ce("create", (t, r) => n().createWorkflowData(t, r, e));
	}
	function fe(e) {
		!r() && t.model.editable && !H(_) && n().editControl && ce("calendar", (t) => n().editControl(t, "calendarId", e));
	}
	var pe = wc(), me = R(pe), he = R(me);
	P(me);
	var ge = B(me, 2), _e = R(ge), ve = R(_e), ye = B(ve), be = R(ye, !0);
	P(ye), P(_e);
	var xe = B(_e, 2), Se = R(xe), Ce = (e) => {
		var i = oc(), a = R(i, !0);
		P(i), V(() => {
			i.disabled = r() || !t.model.editable || !t.model.available || !n().loadWorkflowData || !!H(_), q(a, H(_) === "load" ? "Loading…" : "Load initial values");
		}), W("click", i, () => {
			t.model.available && n().loadWorkflowData && ce("load", (e, t) => n().loadWorkflowData(e, t));
		}), K(e, i);
	};
	J(Se, (e) => {
		H(a) || e(Ce);
	});
	var we = B(Se, 2), Te = (e) => {
		var t = sc(), n = z(t), r = B(R(n));
		X(r), P(n);
		var i = B(n, 2), a = B(R(i));
		X(a), P(i);
		var l = B(i, 2), u = B(R(l));
		X(u), Z(u, "min", 1 / 60), P(l), Me(2), V(() => {
			Ci(r, H(o)), r.disabled = !H(E), Ci(a, H(s)), a.disabled = !H(E), Ci(u, H(c)), u.disabled = !H(E);
		}), W("input", r, (e) => te("day", e.currentTarget.value)), W("input", a, (e) => te("time", e.currentTarget.value)), W("input", u, (e) => te("hours", e.currentTarget.value)), K(e, t);
	}, Ee = (e) => {
		var n = cc(), r = z(n), i = R(r, !0), a = B(i);
		at(a), P(r);
		var o = B(r, 2), s = R(o);
		P(o), V(() => {
			q(i, t.model.kind === "outcomes" ? "Starting records" : "Content"), Z(a, "aria-label", t.model.kind === "outcomes" ? "Initial outcomes" : "Initial document content"), Ci(a, H(u)), a.disabled = !H(E), Z(a, "placeholder", t.model.kind === "outcomes" ? "[]" : "Empty by default"), q(s, `Initial content only. Saved ${t.model.kind === "outcomes" ? "outcomes" : "notes"} stay unchanged.`);
		}), W("input", a, (e) => te("content", e.currentTarget.value)), K(e, n);
	};
	J(we, (e) => {
		t.model.kind === "clock" ? e(Te) : e(Ee, -1);
	}), P(xe), P(ge);
	var De = B(ge, 2), N = R(De), Oe = B(R(N)), ke = R(Oe);
	P(Oe), P(N);
	var Ae = B(N, 2), je = R(Ae), Ne = R(je), Pe = R(Ne, !0);
	P(Ne);
	var Fe = B(Ne, 2), Ie = (e) => {
		var n = lc(), r = R(n, !0);
		P(n), V((e) => {
			Z(n, "aria-label", H(w) + " source"), q(r, e);
		}, [() => t.model.sources.find((e) => e.value === t.model.targetId)?.label ?? t.model.name ?? t.model.targetId]), K(e, n);
	}, Le = (e) => {
		var i = dc();
		Y(i, 21, () => t.model.sources, (e) => e.value, (e, i) => {
			var a = uc(), o = R(a, !0);
			P(a), V(() => {
				Z(a, "data-workflow-source", H(i).value), Z(a, "aria-pressed", H(i).value === t.model.targetId), a.disabled = r() || !t.model.editable || !n().bindWorkflowData || !!H(_), q(o, H(i).label);
			}), W("click", a, () => ue(H(i).value)), K(e, a);
		}), P(i), V(() => Z(i, "aria-label", H(w) + " source")), K(e, i);
	}, Re = (e) => {
		var i = pc(), a = R(i), o = (e) => {
			var n = fc(), r = R(n, !0);
			P(n);
			var i = {};
			V(() => {
				q(r, t.model.name || t.model.targetId), i !== (i = t.model.targetId) && (n.value = (n.__value = t.model.targetId) ?? "");
			}), K(e, n);
		}, s = /* @__PURE__ */ F(() => !t.model.sources.some((e) => e.value === t.model.targetId));
		J(a, (e) => {
			H(s) && e(o);
		}), Y(B(a), 17, () => t.model.sources, (e) => e.value, (e, t) => {
			var n = fc(), r = R(n, !0);
			P(n);
			var i = {};
			V(() => {
				q(r, H(t).label), i !== (i = H(t).value) && (n.value = (n.__value = H(t).value) ?? "");
			}), K(e, n);
		}), P(i);
		var c;
		gi(i), V(() => {
			Z(i, "aria-label", H(w) + " source"), i.disabled = r() || !t.model.editable || !n().bindWorkflowData || !!H(_), c !== (c = t.model.targetId) && (i.value = (i.__value = t.model.targetId) ?? "", hi(i, t.model.targetId));
		}), W("change", i, (e) => ue(e.currentTarget.value)), K(e, i);
	};
	J(Fe, (e) => {
		t.model.sources.length <= 1 ? e(Ie) : t.model.sources.length <= 3 ? e(Le, 1) : e(Re, -1);
	});
	var ze = B(Fe, 2);
	P(je);
	var Be = B(je, 2), Ve = (e) => {
		var t = mc(), n = R(t), r = B(R(n));
		X(r), P(n);
		var i = B(n, 2), a = R(i), o = R(a, !0);
		P(a);
		var s = B(a);
		P(i), P(t), V((e) => {
			Z(r, "aria-label", "New " + H(T) + " name"), Ci(r, H(g)), r.disabled = !!H(_), a.disabled = e, q(o, H(_) === "create" ? "Creating…" : "Create " + H(T)), s.disabled = !!H(_);
		}, [() => !H(g).trim() || !!H(_) || H(f) === "actor-private" && !H(p).trim()]), W("input", r, (e) => {
			L(g, e.currentTarget.value, !0);
		}), W("click", a, de), W("click", s, () => {
			L(h, !1), L(v, "");
		}), K(e, t);
	};
	J(Be, (e) => {
		H(h) && e(Ve);
	});
	var He = B(Be, 2), Ge = R(He, !0);
	P(He);
	var Ke = B(He, 4), qe = (e) => {
		var t = hc(), n = z(t), r = B(R(n));
		Y(r, 21, () => k, qr, (e, t) => {
			var n = fc(), r = R(n, !0);
			P(n);
			var i = {};
			V(() => {
				q(r, H(t).label), i !== (i = H(t).value) && (n.value = (n.__value = H(t).value) ?? "");
			}), K(e, n);
		}), P(r);
		var i;
		gi(r), P(n), Me(), V(() => {
			r.disabled = !H(E), i !== (i = H(d)) && (r.value = (r.__value = H(d)) ?? "", hi(r, H(d)));
		}), W("change", r, (e) => ne(e.currentTarget.value)), K(e, t);
	}, Je = (e) => {
		var n = gc(), r = z(n), i = B(R(r));
		P(r);
		var a = B(r), o = R(a, !0);
		P(a), V(() => {
			Z(i, "aria-label", H(w) + " format"), q(o, t.model.kind === "clock" ? "Required for clock data." : "Outcomes use a JSON list.");
		}), K(e, n);
	};
	J(Ke, (e) => {
		t.model.kind === "notes" ? e(qe) : e(Je, -1);
	});
	var Ye = B(Ke, 2), Xe = B(Ye, 2);
	Y(Xe, 21, () => O, qr, (e, t) => {
		var n = uc(), r = R(n, !0);
		P(n), V(() => {
			Z(n, "data-workflow-visibility", H(t).value), Z(n, "aria-pressed", H(f) === H(t).value), n.disabled = !H(D), q(r, H(t).label);
		}), W("click", n, () => re(H(t).value)), K(e, n);
	}), P(Xe);
	var Ze = B(Xe, 2), Qe = (e) => {
		var t = _c(), n = B(R(t));
		X(n), P(t), V(() => {
			Ci(n, H(p)), n.disabled = !H(D);
		}), W("input", n, (e) => te("actor", e.currentTarget.value)), K(e, t);
	};
	J(Ze, (e) => {
		H(f) === "actor-private" && e(Qe);
	});
	var $e = B(Ze, 2), et = (e) => {
		var t = vc(), n = B(R(t));
		X(n), P(t), V(() => {
			Ci(n, H(m)), n.disabled = !H(E);
		}), W("input", n, (e) => te("columns", e.currentTarget.value)), K(e, t);
	};
	J($e, (e) => {
		H(d) === "csv" && e(et);
	});
	var tt = B($e, 2), nt = B(R(tt));
	X(nt), P(tt);
	var rt = B(tt, 2), it = (e) => {
		var i = yc(), a = z(i), o = B(R(a));
		X(o), P(a);
		var s = B(a), c = B(R(s));
		X(c), P(s), Me(), V(() => {
			Ci(o, H(l)), o.disabled = !H(E), Ci(c, t.model.expectedCalendar ?? ""), c.disabled = r() || !t.model.editable || !n().editControl || !!H(_);
		}), W("input", o, (e) => te("calendar", e.currentTarget.value)), W("change", c, (e) => fe(e.currentTarget.value)), K(e, i);
	};
	J(rt, (e) => {
		t.model.kind === "clock" && e(it);
	}), P(Ae), P(De);
	var ot = B(De, 2), st = R(ot), ct = R(st, !0);
	P(st), P(ot);
	var lt = B(ot, 2), ut = (e) => {
		K(e, bc());
	};
	J(lt, (e) => {
		t.model.available || e(ut);
	});
	var dt = B(lt, 2), ft = (e) => {
		var n = xc();
		fo(R(n), { get issue() {
			return t.model.issue;
		} }), P(n), K(e, n);
	};
	J(dt, (e) => {
		t.model.issue && e(ft);
	});
	var pt = B(dt, 2), mt = (e) => {
		var t = Sc();
		fo(R(t), { get issue() {
			return H(v);
		} }), P(t), K(e, t);
	};
	J(pt, (e) => {
		H(v) && e(mt);
	});
	var ht = B(pt, 2), gt = (e) => {
		var n = Cc(), r = R(n, !0);
		P(n), V(() => q(r, H(y) || t.model.notice)), K(e, n);
	};
	J(ht, (e) => {
		(H(y) || !H(b) && t.model.notice) && e(gt);
	}), P(pe), V((e, a, o) => {
		Z(pe, "data-workflow-data", t.model.kind), q(he, `Uses ${(t.model.name || t.model.targetId) ?? ""}`), ge.open = t.model.kind === "clock", q(ve, `${t.model.kind === "clock" ? "Starting values" : t.model.kind === "outcomes" ? "Initial outcomes" : "Initial content"} `), q(be, e), q(ke, `${a ?? ""} · ${o ?? ""}`), q(Pe, H(w)), Z(ze, "aria-label", "Create separate " + H(T)), Z(ze, "title", "Create separate " + H(T)), ze.disabled = r() || !t.model.editable || !t.model.available || !n().createWorkflowData || !!H(_), q(Ge, t.model.kind === "clock" ? "Same clock: shared time. Different clocks: independent time." : t.model.kind === "outcomes" ? "Shared by nodes using these outcomes." : "Shared by nodes using this document."), Z(Ye, "id", i() + "-visibility"), Z(Xe, "aria-labelledby", i() + "-visibility"), Z(nt, "aria-label", H(w) + " document ID"), Ci(nt, t.model.targetId), st.disabled = !H(se), q(ct, H(_) === "save" ? "Saving…" : "Save settings");
	}, [
		() => t.model.kind === "clock" && H(a) ? "Day " + H(o) + " · " + H(s) : H(a) && !H(u).trim() ? "Empty by default" : H(a) ? t.model.kind === "outcomes" && H(u).trim() === "[]" ? "None" : "Initial template" : "Load initial values to edit",
		() => A(H(d)),
		() => j(H(f))
	]), W("click", ze, () => {
		!r() && t.model.editable && t.model.available && !H(_) && (L(h, !H(h)), L(g, ""), L(v, ""));
	}), W("click", st, le), K(e, pe), We();
}
Er([
	"click",
	"input",
	"change"
]);
//#endregion
//#region ui/NodeDetails.svelte
var Ec = /* @__PURE__ */ G("<small data-canonical-title=\"\" class=\"svelte-59ntjv\"> </small>"), Dc = /* @__PURE__ */ G("<div class=\"pc-detail-error svelte-59ntjv\"><!></div>"), Oc = /* @__PURE__ */ G("<label class=\"svelte-59ntjv\">Workflow stage<select aria-label=\"Workflow stage\" class=\"svelte-59ntjv\"><option class=\"svelte-59ntjv\">Preparation · before Generate Reply</option><option class=\"svelte-59ntjv\">Response · after Generate Reply</option></select></label><!>", 1), kc = /* @__PURE__ */ G("<span class=\"svelte-59ntjv\">Read-only body</span>"), Ac = /* @__PURE__ */ G("<span class=\"pc-detail-blocked svelte-59ntjv\">Blocks run · Disabled</span>"), jc = /* @__PURE__ */ G("<p class=\"pc-detail-state svelte-59ntjv\"><!><!></p>"), Mc = /* @__PURE__ */ G("<option class=\"svelte-59ntjv\"> </option>"), Nc = /* @__PURE__ */ G("<fieldset class=\"pc-detail-group svelte-59ntjv\" data-boundary-controls=\"\"><legend class=\"svelte-59ntjv\"> </legend> <label class=\"svelte-59ntjv\">Type<select aria-label=\"Subgraph port type\" class=\"svelte-59ntjv\"></select></label> <label class=\"pc-detail-check svelte-59ntjv\"><input aria-label=\"Required subgraph port\" type=\"checkbox\" class=\"svelte-59ntjv\"/> Required</label> <div class=\"pc-detail-actions svelte-59ntjv\"><button type=\"button\" data-save-boundary=\"\" class=\"svelte-59ntjv\"> </button></div> <small class=\"svelte-59ntjv\">Labels appear on the subgraph block. Disconnect incompatible connections before changing the type. Deleting this node removes its port and attached connections.</small> <!></fieldset>"), Pc = /* @__PURE__ */ G("<p role=\"status\" class=\"svelte-59ntjv\">Loading file…</p>"), Fc = /* @__PURE__ */ G("<div data-file-input-controls=\"\" class=\"svelte-59ntjv\"><label class=\"svelte-59ntjv\"> <input type=\"file\" accept=\".txt,.md,.json,text/plain,text/markdown,application/json\" class=\"svelte-59ntjv\"/></label> <p class=\"svelte-59ntjv\"> </p> <small class=\"svelte-59ntjv\">The file's UTF-8 text is embedded in this workflow. Runs use the saved snapshot; replace the file to refresh it.</small> <small class=\"svelte-59ntjv\">Choose a .txt, .md or .json file up to 400,000 bytes and 100,000 UTF-16 code units.</small> <!> <!></div>"), Ic = /* @__PURE__ */ G("<details class=\"pc-detail-group svelte-59ntjv\"><summary class=\"svelte-59ntjv\"> </summary> <!></details>"), Lc = /* @__PURE__ */ G("<!> <fieldset class=\"pc-detail-group pc-detail-main svelte-59ntjv\" data-operation-controls=\"\"><!> <!></fieldset> <!>", 1), Rc = /* @__PURE__ */ G("<label class=\"svelte-59ntjv\">Model identifier<input class=\"svelte-59ntjv\"/></label>"), zc = /* @__PURE__ */ G("<small class=\"svelte-59ntjv\"> </small>"), Bc = /* @__PURE__ */ G("<fieldset class=\"svelte-59ntjv\"><legend class=\"svelte-59ntjv\"> </legend> <label class=\"svelte-59ntjv\">Connection profile<select class=\"svelte-59ntjv\"><option class=\"svelte-59ntjv\">Use helper connection</option><!><!></select></label> <label class=\"svelte-59ntjv\">Model mode<select class=\"svelte-59ntjv\"></select></label> <!> <small class=\"svelte-59ntjv\"> </small><small class=\"svelte-59ntjv\"> </small><!> <!></fieldset>"), Vc = /* @__PURE__ */ G("<small class=\"svelte-59ntjv\">This helper has no text model calls to configure.</small>"), Hc = /* @__PURE__ */ G("<details class=\"pc-detail-group svelte-59ntjv\" data-helper-model-controls=\"\" open=\"\"><summary class=\"svelte-59ntjv\">Helper model bindings</summary> <small class=\"svelte-59ntjv\">Choose connections for inherited text model roles in the pinned helper. Explicit helper-node bindings take precedence. These selections belong to this For Each node.</small> <!> <!></details>"), Uc = /* @__PURE__ */ G("<label class=\"svelte-59ntjv\">Model identifier<input aria-label=\"Model identifier\" class=\"svelte-59ntjv\"/></label>"), Wc = /* @__PURE__ */ G("<!> <details class=\"pc-detail-group svelte-59ntjv\" data-model-controls=\"\"><summary class=\"svelte-59ntjv\">Advanced model settings</summary> <button type=\"button\" data-reset-profile=\"\" class=\"svelte-59ntjv\"> </button> <small class=\"svelte-59ntjv\">Choose a connection with the bar under this node. Reset removes this node's connection override.</small> <label class=\"svelte-59ntjv\">Model mode<select aria-label=\"Model mode\" class=\"svelte-59ntjv\"></select></label> <!> <label class=\"svelte-59ntjv\">Model role<input aria-label=\"Model role\" class=\"svelte-59ntjv\"/></label> <!><!> <!></details>", 1), Gc = /* @__PURE__ */ G("<p class=\"pc-detail-port svelte-59ntjv\"> <small class=\"svelte-59ntjv\"> </small></p>"), Kc = /* @__PURE__ */ G("<details class=\"pc-detail-group svelte-59ntjv\"><summary class=\"svelte-59ntjv\">Inputs and outputs</summary><!></details>"), qc = /* @__PURE__ */ G("<p role=\"status\" class=\"svelte-59ntjv\"> </p>"), Jc = /* @__PURE__ */ G("<header class=\"svelte-59ntjv\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-59ntjv\"><path class=\"svelte-59ntjv\"></path></svg> <div class=\"pc-detail-identity svelte-59ntjv\"><input class=\"pc-detail-name svelte-59ntjv\" aria-label=\"Node name\"/> <!> <small class=\"svelte-59ntjv\"> </small></div></header> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>", 1), Yc = /* @__PURE__ */ G("<p class=\"pc-detail-empty svelte-59ntjv\">Select a node to inspect its settings.</p>"), Xc = /* @__PURE__ */ G("<section class=\"pc-node-details svelte-59ntjv\" aria-label=\"Node details\"><!></section>");
function Zc(e, t) {
	Ue(t, !0);
	let n = (e, n = d) => {
		{
			let s = /* @__PURE__ */ F(() => H(a)[n().key]?.text ?? k(n())), c = /* @__PURE__ */ F(() => H(a)[n().key]?.error || H(o)[n().key] || ""), l = /* @__PURE__ */ F(() => !!t.view?.readOnly || !r().editControl), u = /* @__PURE__ */ F(() => !!H(a)[n().key]?.pending), d = /* @__PURE__ */ F(() => i() + "-" + n().key);
			Ls(e, {
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
				ontext: (e) => te(n(), e),
				onvalue: (e) => re(n(), e),
				onnumber: (e) => ie(n(), e),
				onsave: () => ne(n())
			});
		}
	}, r = Ni(t, "actions", 19, () => ({})), i = Ni(t, "idPrefix", 3, "pc-node-details"), a = /* @__PURE__ */ I(tn({})), o = /* @__PURE__ */ I(tn({})), s = "", c = "", l = "", u = 0, f = 0, p = 0, h = /* @__PURE__ */ new Map(), g = /* @__PURE__ */ I(!1), _ = 0, v = 0, y = 0, b = /* @__PURE__ */ new Map(), x = /* @__PURE__ */ new Map(), S = /* @__PURE__ */ new Map(), C = (e) => Object.fromEntries(Object.entries(e).map(([e, t]) => [e, {
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
	Fi(() => {
		E = !1, h.clear(), S.clear(), x.clear(), b.clear();
	}), Cn(() => {
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
		(i || n !== c || r !== l) && ((i || r !== l) && (f++, y++), i && (p++, s && S.set(s, _r(() => C(H(a))))), s = e, c = n, l = r, h.clear(), u++, L(o, {}, !0), L(g, !1), v++, L(a, w(i ? S.get(e) ?? {} : _r(() => H(a)), t.view), !0));
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
	function j(e) {
		let t = (x.get(e) ?? 0) + 1;
		return x.set(e, t), t;
	}
	async function M(e, n, r) {
		let i = t.view;
		if (!i || (n ? !i.canPresent : e === "profileId" || e === "model" ? !ge(i) : i.readOnly)) return;
		let s = D(i), c = ++u, l = p, d = A(i, e), f = H(a)[e] && d ? j(e) : null;
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
			m = "The edit could not be accepted. Check the current settings before trying the edit again.";
		}
		if (g && f !== null && H(a)[e] && E && t.view && p === l && T(t.view) === T(s) && x.get(e) === f && A(t.view, e) === d) {
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
	function ee(e) {
		let n = e.files?.[0];
		e.value = "", n && t.view?.fileInput && !t.view.readOnly && r().loadFile && !H(a).fileInput?.pending && (L(a, {
			...H(a),
			fileInput: {
				text: "",
				error: "",
				pending: !1
			}
		}, !0), M("fileInput", !1, (e) => r().loadFile(e, n)));
	}
	function te(e, n) {
		t.view && !t.view.readOnly && (j(e.key), h.delete(e.key), L(a, {
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
	function ne(e) {
		if (!t.view || t.view.readOnly || !r().editControl) return;
		let n = H(a)[e.key]?.text ?? k(e), i = n;
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
		M(e.key, !1, (t) => r().editControl(t, e.key, i));
	}
	function re(e, t) {
		r().editControl && M(e.key, !1, (n) => r().editControl(n, e.key, t));
	}
	function ie(e, n) {
		if (!t.view || t.view.readOnly || !r().editControl) return;
		let i = Number(n.value);
		!n.value.trim() || !Number.isFinite(i) ? L(o, {
			...H(o),
			[e.key]: "Enter a finite number before saving."
		}, !0) : n.validity.valid ? re(e, i) : L(o, {
			...H(o),
			[e.key]: "Enter a number within the allowed range and step."
		}, !0);
	}
	let ae = (e, t) => JSON.stringify([
		"helper-binding",
		e,
		t
	]), oe = (e) => t.view?.helperBindings?.roles.find((t) => t.role === e), se = () => !!t.view?.helperBindings?.editable && !t.view.readOnly && !!r().editHelperBinding, ce = (e, t) => se() && oe(e)?.[t === "profileId" ? "profile" : "model"].editable !== !1, le = (e) => H(a)[ae(e, "model")] ? "override" : oe(e)?.model.mode;
	function ue(e, t, n, i) {
		ce(e, t) && oe(e) && M(ae(e, t), !1, (a) => r().editHelperBinding(a, e, t, n, i));
	}
	function de(e, n) {
		if (!ce(e, "model") || !oe(e)) return;
		let r = ae(e, "model");
		j(r), h.delete(r), L(a, {
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
		let n = oe(e);
		if (!ce(e, "model") || !n?.model.allowedModes.some((e) => e.value === t)) return;
		let r = ae(e, "model");
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
		if (!ce(e, "model") || le(e) !== "override") return;
		de(e, t);
		let n = ae(e, "model");
		!t.trim() || t.length > 256 ? L(o, {
			...H(o),
			[n]: "Enter a model identifier of 1–256 characters."
		}, !0) : ue(e, "model", "override", t);
	}
	function me(e, t, n) {
		he(e)?.allowedModes.some((e) => e.value === t) && r().editBinding && M(e, !1, (i) => r().editBinding(i, e, t, n));
	}
	let he = (e) => e === "profileId" ? t.view?.model?.profile : t.view?.model?.model, ge = (e = t.view) => !!e?.model && (e.model.editable ?? !e.readOnly) && !!r().editBinding, _e = (e) => H(a)[e] ? "override" : he(e)?.mode, ve = (e) => H(a)[e]?.text ?? he(e)?.value ?? "", ye = () => t.view?.model?.profile.mode === "override" || !!t.view?.model?.profileDefaultModel;
	function be(e, t) {
		ge() && he(e)?.allowedModes.some((e) => e.value === "override") && (j(e), h.delete(e), L(a, {
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
	function xe(e, t) {
		let n = he(e);
		if (!ge() || !n?.allowedModes.some((e) => e.value === t)) return;
		if (t === "override") {
			be(e, ve(e));
			return;
		}
		h.delete(e);
		let r = { ...H(a) };
		delete r[e], L(a, r, !0), L(o, {
			...H(o),
			[e]: ""
		}, !0), t !== n.mode && me(e, t, null);
	}
	function Se(e, n) {
		if (ge() && (e !== "model" || _e(e) === "override") && he(e)?.allowedModes.some((e) => e.value === "override")) {
			if (be(e, n), !n.trim()) {
				let r = t.view?.readOnly ? "block" : "inherit";
				if (e === "model" && ye() && he(e)?.allowedModes.some((e) => e.value === r)) {
					xe(e, r);
					return;
				}
				L(a, {
					...H(a),
					[e]: {
						text: n,
						error: "Enter a model identifier before saving an override.",
						pending: !1
					}
				}, !0);
			} else me(e, "override", n);
		}
	}
	let Ce = () => !!t.view?.modifiers?.editable && !t.view.readOnly && !!r().editModifiers, we = () => JSON.parse(JSON.stringify(t.view?.modifiers?.items ?? []));
	function Te(e) {
		let t = H(a)["modifier:" + e.id];
		if (t) try {
			return JSON.parse(t.text);
		} catch {}
		return e.settings;
	}
	let Ee = () => Object.fromEntries((t.view?.modifiers?.items ?? []).map((e) => {
		let t = H(a)["modifier:" + e.id];
		return [e.id, {
			settings: Te(e),
			error: t?.error || H(o)["modifier:" + e.id] || "",
			pending: !!t?.pending,
			dirty: !!t
		}];
	}));
	function De(e) {
		if (!Ce() || H(g) || e.length > 16 || !r().editModifiers) return;
		let t = ++v;
		L(g, !0), M("modifiers", !1, (t) => r().editModifiers(t, e)).finally(() => {
			t === v && L(g, !1);
		});
	}
	function N(e) {
		if (!Ce() || !t.view?.modifiers || t.view.modifiers.items.length >= 16) return;
		let n = t.view.modifiers.options.find((t) => t.type === e);
		if (!n) return;
		let r = we(), i;
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
		if (!Ce() || !t.view?.modifiers || !t.view.modifiers.options.some((t) => t.type === e)) return;
		let r = we();
		r.some((t) => t.type === e) ? De(r.map((t) => t.type === e ? {
			...t,
			enabled: n
		} : t)) : n && N(e);
	}
	function ke(e, n) {
		Ce() && t.view?.modifiers?.items.some((t) => t.id === e) && De(we().map((t) => t.id === e ? {
			...t,
			enabled: n
		} : t));
	}
	function Ae(e) {
		Ce() && t.view?.modifiers?.items.some((t) => t.id === e) && De(we().filter((t) => t.id !== e));
	}
	function je(e, t) {
		if (!Ce()) return;
		let n = we(), r = n.findIndex((t) => t.id === e), i = r + t;
		r < 0 || i < 0 || i >= n.length || ([n[r], n[i]] = [n[i], n[r]], De(n));
	}
	function Ne(e, n, r) {
		if (!Ce()) return;
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
					...Te(i),
					[n]: r
				}),
				error: "",
				pending: !1,
				modifierType: i.type
			}
		}, !0);
	}
	function Pe(e) {
		if (!Ce() || !r().editModifiers) return;
		let n = t.view?.modifiers?.items.find((t) => t.id === e), i = "modifier:" + e;
		if (!n || !H(a)[i] || H(a)[i].pending) return;
		let o = (b.get(i) ?? 0) + 1, s = y, c = n.type;
		b.set(i, o);
		let l = Te(n), u = we().map((t) => t.id === e ? {
			...t,
			settings: l
		} : t);
		M(i, !1, async (n) => {
			let l = await r().editModifiers(n, u);
			if (l.ok && E && t.view && T(t.view) === T(n) && y === s && b.get(i) === o && t.view.modifiers?.items.some((t) => t.id === e && t.type === c)) {
				let e = { ...H(a) };
				delete e[i], L(a, e, !0);
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
	}, Ie = (e) => e.some((e) => !!(H(a)[e.key]?.error || H(o)[e.key]));
	function Le(e) {
		t.view && !t.view.boundary && r().present && M("alias", !0, (n) => r().present(n, "alias", e === t.view?.canonicalTitle ? "" : e));
	}
	function Re() {
		return {
			label: H(a).boundary?.text ?? t.view?.boundary?.label ?? "",
			artifactKind: H(a).boundary?.artifactKind ?? t.view?.boundary?.kind ?? "",
			required: H(a).boundary?.required ?? t.view?.boundary?.required ?? !1
		};
	}
	function ze(e, n) {
		if (!t.view?.boundary || t.view.readOnly || !r().editInterface || e === "artifactKind" && !t.view.boundary.kinds.includes(String(n))) return;
		let i = {
			...Re(),
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
	function Be() {
		if (!t.view?.boundary || t.view.readOnly || !r().editInterface || H(a).boundary?.pending) return;
		let e = t.view.boundary.id, n = Re();
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
		}, !0), M("boundary", !1, async (o) => {
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
	var Ve = Xc(), He = R(Ve), Ge = (e) => {
		var s = Jc(), c = z(s);
		let l;
		var u = R(c), d = R(u);
		P(u);
		var f = B(u, 2), p = R(f);
		X(p);
		var h = B(p, 2), _ = (e) => {
			var n = Ec(), r = R(n);
			P(n), V(() => q(r, `Canonical type: ${t.view.canonicalTitle ?? ""}`)), K(e, n);
		};
		J(h, (e) => {
			!t.view.boundary && (t.view.alias || t.view.title || t.view.canonicalTitle) !== t.view.canonicalTitle && e(_);
		});
		var v = B(h, 2), y = R(v, !0);
		P(v), P(f), P(c);
		var b = B(c, 2), x = (e) => {
			var n = Oc(), i = z(n), a = B(R(i)), s = R(a);
			s.value = s.__value = "pre";
			var c = B(s);
			c.value = c.__value = "post", P(a);
			var l;
			gi(a), P(i);
			var u = B(i), d = (e) => {
				var n = Dc(), r = R(n);
				{
					let e = /* @__PURE__ */ F(() => ({ nodeTitle: t.view?.title }));
					fo(r, {
						get issue() {
							return H(o).phase;
						},
						get context() {
							return H(e);
						}
					});
				}
				P(n), K(e, n);
			};
			J(u, (e) => {
				H(o).phase && e(d);
			}), V(() => {
				a.disabled = t.view.readOnly || !r().editPhase, l !== (l = t.view.phase) && (a.value = (a.__value = t.view.phase) ?? "", hi(a, t.view.phase));
			}), W("change", a, (e) => {
				let t = e.currentTarget.value;
				M("phase", !1, (e) => r().editPhase(e, t));
			}), K(e, n);
		};
		J(b, (e) => {
			t.view.phaseEditable && e(x);
		});
		var S = B(b, 2), C = (e) => {
			{
				let n = /* @__PURE__ */ F(() => ({
					queue: () => r().queueRecall?.(D(t.view)) ?? {
						ok: !1,
						error: {
							code: "RECALL_UNAVAILABLE",
							message: "Memory recall is unavailable."
						}
					},
					cancel: () => r().cancelRecall?.(D(t.view)) ?? {
						ok: !1,
						error: {
							code: "RECALL_UNAVAILABLE",
							message: "Memory recall is unavailable."
						}
					},
					revealShortcut: r().revealRecallShortcut
				}));
				Us(e, {
					get view() {
						return t.view.recall;
					},
					get actions() {
						return H(n);
					}
				});
			}
		};
		J(S, (e) => {
			t.view.recall && e(C);
		});
		var w = B(S, 2), T = (e) => {
			var n = jc(), r = R(n), i = (e) => {
				K(e, kc());
			};
			J(r, (e) => {
				t.view.readOnly && e(i);
			});
			var a = B(r), o = (e) => {
				K(e, Ac());
			};
			J(a, (e) => {
				t.view.enabled || e(o);
			}), P(n), K(e, n);
		};
		J(w, (e) => {
			(t.view.readOnly || !t.view.enabled) && e(T);
		});
		var E = B(w, 2), O = (e) => {
			var n = Dc(), r = R(n);
			{
				let e = /* @__PURE__ */ F(() => ({ nodeTitle: t.view?.title }));
				fo(r, {
					get issue() {
						return H(o).alias;
					},
					get context() {
						return H(e);
					}
				});
			}
			P(n), K(e, n);
		};
		J(E, (e) => {
			H(o).alias && e(O);
		});
		var k = B(E, 2), A = (e) => {
			var n = Nc(), i = R(n), s = R(i);
			P(i);
			var c = B(i, 2), l = B(R(c));
			Y(l, 21, () => t.view.boundary.kinds, qr, (e, t) => {
				var n = Mc(), r = R(n, !0);
				P(n);
				var i = {};
				V(() => {
					q(r, H(t)), i !== (i = H(t)) && (n.value = (n.__value = H(t)) ?? "");
				}), K(e, n);
			}), P(l);
			var u;
			gi(l), P(c);
			var d = B(c, 2), f = R(d);
			X(f), Me(), P(d);
			var p = B(d, 2), m = R(p), h = R(m, !0);
			P(m), P(p);
			var g = B(p, 4), _ = (e) => {
				var n = Dc(), r = R(n);
				{
					let e = /* @__PURE__ */ F(() => H(a).boundary?.error || H(o).boundary), n = /* @__PURE__ */ F(() => ({ nodeTitle: t.view?.title }));
					fo(r, {
						get issue() {
							return H(e);
						},
						get context() {
							return H(n);
						}
					});
				}
				P(n), K(e, n);
			};
			J(g, (e) => {
				(H(a).boundary?.error || H(o).boundary) && e(_);
			}), P(n), V((e, n, i) => {
				q(s, `Subgraph ${t.view.boundary.direction ?? ""}`), l.disabled = t.view.readOnly || !r().editInterface, u !== (u = e) && (l.value = (l.__value = e) ?? "", hi(l, e)), wi(f, n), f.disabled = t.view.readOnly || !r().editInterface, m.disabled = i, q(h, H(a).boundary?.pending ? "Validating…" : "Save port");
			}, [
				() => Re().artifactKind,
				() => Re().required,
				() => t.view.readOnly || !r().editInterface || !Re().label.trim() || !!H(a).boundary?.pending
			]), W("change", l, (e) => ze("artifactKind", e.currentTarget.value)), W("change", f, (e) => ze("required", e.currentTarget.checked)), W("click", m, () => Be()), K(e, n);
		};
		J(k, (e) => {
			t.view.boundary && e(A);
		});
		var j = B(k, 2), te = (e) => {
			var s = Lc(), c = z(s), l = (e) => {
				{
					let n = /* @__PURE__ */ F(() => D(t.view)), a = /* @__PURE__ */ F(() => i() + "-workflow-data");
					Tc(e, {
						get model() {
							return t.view.workflowData;
						},
						get selection() {
							return H(n);
						},
						get actions() {
							return r();
						},
						get disabled() {
							return t.view.readOnly;
						},
						get idPrefix() {
							return H(a);
						}
					});
				}
			};
			J(c, (e) => {
				t.view.workflowData && e(l);
			});
			var u = B(c, 2), d = R(u), f = (e) => {
				var n = Fc(), s = R(n), c = R(s, !0), l = B(c);
				P(s);
				var u = B(s, 2), d = R(u, !0);
				P(u);
				var f = B(u, 6), p = (e) => {
					K(e, Pc());
				};
				J(f, (e) => {
					H(a).fileInput?.pending && e(p);
				});
				var m = B(f, 2), h = (e) => {
					var n = Dc(), r = R(n);
					{
						let e = /* @__PURE__ */ F(() => ({ nodeTitle: t.view?.title }));
						fo(r, {
							get issue() {
								return H(o).fileInput;
							},
							get context() {
								return H(e);
							}
						});
					}
					P(n), V(() => Z(n, "id", i() + "-error-fileInput")), K(e, n);
				};
				J(m, (e) => {
					H(o).fileInput && e(h);
				}), P(n), V(() => {
					q(c, t.view.fileInput.loaded ? "Replace file" : "Choose file"), Z(l, "aria-label", t.view.fileInput.loaded ? "Replace file" : "Choose file"), l.disabled = t.view.readOnly || !r().loadFile || !!H(a).fileInput?.pending, Z(l, "aria-invalid", !!H(o).fileInput), Z(l, "aria-describedby", H(o).fileInput ? i() + "-error-fileInput" : void 0), q(d, t.view.fileInput.loaded ? "Loaded file: " + t.view.fileInput.fileName : "No file loaded.");
				}), W("change", l, (e) => ee(e.currentTarget)), K(e, n);
			};
			J(d, (e) => {
				t.view.fileInput && e(f);
			}), Y(B(d, 2), 17, () => Fe().filter(([e]) => e === "Main"), ([e, t]) => e, (e, t) => {
				var r = /* @__PURE__ */ F(() => m(H(t), 2));
				let i = () => H(r)[1];
				var a = Lr();
				Y(z(a), 17, i, (e) => e.key, (e, t) => {
					n(e, () => H(t));
				}), K(e, a);
			}), P(u), Y(B(u, 2), 17, () => Fe().filter(([e]) => e !== "Main"), ([e, t]) => e, (e, t) => {
				var r = /* @__PURE__ */ F(() => m(H(t), 2));
				let i = () => H(r)[0], a = () => H(r)[1];
				var o = Ic(), s = R(o), c = R(s, !0);
				P(s), Y(B(s, 2), 17, a, (e) => e.key, (e, t) => {
					n(e, () => H(t));
				}), P(o), V((e) => {
					Z(o, "data-control-group", i()), o.open = e, q(c, i());
				}, [() => Ie(a())]), K(e, o);
			}), K(e, s);
		};
		J(j, (e) => {
			t.view.boundary || e(te);
		});
		var ne = B(j, 2), re = (e) => {
			var n = Hc(), r = B(R(n), 4);
			Y(r, 17, () => t.view.helperBindings.roles, (e) => e.role, (e, n) => {
				var r = Bc(), i = R(r), s = R(i, !0);
				P(i);
				var c = B(i, 2), l = B(R(c)), u = R(l);
				u.value = u.__value = "";
				var d = B(u), f = (e) => {
					var t = Mc(), r = R(t);
					P(t);
					var i = {};
					V(() => {
						q(r, `Unavailable connection · ${H(n).profile.value ?? ""}`), i !== (i = H(n).profile.value) && (t.value = (t.__value = H(n).profile.value) ?? "");
					}), K(e, t);
				}, p = /* @__PURE__ */ F(() => H(n).profile.value && !(H(n).profile.options ?? []).some((e) => e.value === H(n).profile.value));
				J(d, (e) => {
					H(p) && e(f);
				}), Y(B(d), 17, () => H(n).profile.options ?? [], (e) => e.value, (e, t) => {
					var n = Mc(), r = R(n, !0);
					P(n);
					var i = {};
					V(() => {
						q(r, H(t).label), i !== (i = H(t).value) && (n.value = (n.__value = H(t).value) ?? "");
					}), K(e, n);
				}), P(l);
				var m;
				gi(l), P(c);
				var h = B(c, 2), g = B(R(h));
				Y(g, 21, () => H(n).model.allowedModes, (e) => e.value, (e, t) => {
					var n = Mc(), r = R(n, !0);
					P(n);
					var i = {};
					V(() => {
						q(r, H(t).label), i !== (i = H(t).value) && (n.value = (n.__value = H(t).value) ?? "");
					}), K(e, n);
				}), P(g);
				var _;
				gi(g), P(h);
				var v = B(h, 2), y = (e) => {
					var t = Rc(), r = B(R(t));
					X(r), P(t), V((e, t) => {
						Z(r, "aria-label", H(n).role + " model identifier"), Ci(r, e), r.disabled = t;
					}, [() => H(a)[ae(H(n).role, "model")]?.text ?? H(n).model.value ?? "", () => !ce(H(n).role, "model")]), W("input", r, (e) => de(H(n).role, e.currentTarget.value)), W("change", r, (e) => pe(H(n).role, e.currentTarget.value)), K(e, t);
				}, b = /* @__PURE__ */ F(() => le(H(n).role) === "override");
				J(v, (e) => {
					H(b) && e(y);
				});
				var x = B(v, 2), S = R(x);
				P(x);
				var C = B(x), w = R(C, !0);
				P(C);
				var T = B(C), E = (e) => {
					var t = zc(), r = R(t, !0);
					P(t), V(() => q(r, H(n).caveat)), K(e, t);
				};
				J(T, (e) => {
					H(n).caveat && e(E);
				});
				var D = B(T, 2), O = (e) => {
					var r = Dc(), i = R(r);
					{
						let e = /* @__PURE__ */ F(() => H(o)[ae(H(n).role, "profileId")] || H(o)[ae(H(n).role, "model")]), r = /* @__PURE__ */ F(() => ({ nodeTitle: t.view?.title }));
						fo(i, {
							get issue() {
								return H(e);
							},
							get context() {
								return H(r);
							}
						});
					}
					P(r), K(e, r);
				}, k = /* @__PURE__ */ F(() => H(o)[ae(H(n).role, "profileId")] || H(o)[ae(H(n).role, "model")]);
				J(D, (e) => {
					H(k) && e(O);
				}), P(r), V((e, t, r) => {
					q(s, H(n).label), Z(l, "aria-label", H(n).role + " connection profile"), l.disabled = e, m !== (m = H(n).profile.value ?? "") && (l.value = (l.__value = H(n).profile.value ?? "") ?? "", hi(l, H(n).profile.value ?? "")), Z(g, "aria-label", H(n).role + " model mode"), g.disabled = t, _ !== (_ = r) && (g.value = (g.__value = r) ?? "", hi(g, r)), q(S, `Effective connection: ${H(n).effective ?? ""}`), q(w, H(n).source);
				}, [
					() => !ce(H(n).role, "profileId"),
					() => !ce(H(n).role, "model"),
					() => le(H(n).role)
				]), W("change", l, (e) => ue(H(n).role, "profileId", e.currentTarget.value ? "override" : "inherit", e.currentTarget.value || null)), W("change", g, (e) => fe(H(n).role, e.currentTarget.value)), K(e, r);
			});
			var i = B(r, 2), s = (e) => {
				var n = Dc(), r = R(n);
				{
					let e = /* @__PURE__ */ F(() => ({ nodeTitle: t.view?.title }));
					fo(r, {
						get diagnostic() {
							return t.view.helperBindings.issueDiagnostic;
						},
						get issue() {
							return t.view.helperBindings.issue;
						},
						get context() {
							return H(e);
						}
					});
				}
				P(n), K(e, n);
			}, c = (e) => {
				K(e, Vc());
			};
			J(i, (e) => {
				t.view.helperBindings.issueDiagnostic || t.view.helperBindings.issue ? e(s) : t.view.helperBindings.roles.length || e(c, 1);
			}), P(n), K(e, n);
		};
		J(ne, (e) => {
			t.view.helperBindings && e(re);
		});
		var ie = B(ne, 2), oe = (e) => {
			var n = Wc(), i = z(n), s = (e) => {
				var n = Dc(), r = R(n);
				{
					let e = /* @__PURE__ */ F(() => ({ nodeTitle: t.view?.title }));
					fo(r, {
						get diagnostic() {
							return t.view.model.issueDiagnostic;
						},
						get issue() {
							return t.view.model.issue;
						},
						get context() {
							return H(e);
						}
					});
				}
				P(n), K(e, n);
			};
			J(i, (e) => {
				(t.view.model.issueDiagnostic || t.view.model.issue) && e(s);
			});
			var c = B(i, 2), l = B(R(c), 2), u = R(l, !0);
			P(l);
			var d = B(l, 4), f = B(R(d));
			Y(f, 21, () => t.view.model.model.allowedModes, (e) => e.value, (e, n) => {
				var r = Mc(), i = R(r, !0);
				P(r);
				var a = {};
				V((e) => {
					q(i, e), a !== (a = H(n).value) && (r.value = (r.__value = H(n).value) ?? "");
				}, [() => H(n).value === "inherit" && !t.view.readOnly ? ye() || !t.view.model.model.effectiveValue ? "Use profile model" : "Existing role model" : H(n).label]), K(e, r);
			}), P(f);
			var p;
			gi(f), P(d);
			var m = B(d, 2), h = (e) => {
				var t = Uc(), n = B(R(t));
				X(n), P(t), V((e, t) => {
					Ci(n, e), n.disabled = t;
				}, [() => ve("model"), () => !ge()]), W("input", n, (e) => be("model", e.currentTarget.value)), W("change", n, (e) => Se("model", e.currentTarget.value)), K(e, t);
			}, g = /* @__PURE__ */ F(() => _e("model") === "override");
			J(m, (e) => {
				H(g) && e(h);
			});
			var _ = B(m, 2), v = B(R(_));
			X(v), P(_);
			var y = B(_, 2), b = (e) => {
				var n = zc(), r = R(n);
				P(n), V(() => q(r, `Effective connection: ${t.view.model.effective ?? ""}`)), K(e, n);
			}, x = /* @__PURE__ */ F(() => !t.view.model.issue || t.view.model.effective.trim() !== t.view.model.issue.trim());
			J(y, (e) => {
				H(x) && e(b);
			});
			var S = B(y), C = (e) => {
				var n = zc(), r = R(n, !0);
				P(n), V(() => q(r, t.view.model.source)), K(e, n);
			};
			J(S, (e) => {
				t.view.model.source && e(C);
			});
			var w = B(S, 2), T = (e) => {
				var n = Dc(), r = R(n);
				{
					let e = /* @__PURE__ */ F(() => H(o).modelRole || H(o).profileId || H(a).model?.error || H(o).model), n = /* @__PURE__ */ F(() => ({ nodeTitle: t.view?.title }));
					fo(r, {
						get issue() {
							return H(e);
						},
						get context() {
							return H(n);
						}
					});
				}
				P(n), K(e, n);
			};
			J(w, (e) => {
				(H(o).modelRole || H(o).profileId || H(a).model?.error || H(o).model) && e(T);
			}), P(c), V((e, n, i) => {
				l.disabled = e, q(u, t.view.readOnly ? "Use definition connection" : "Use inherited connection"), f.disabled = n, p !== (p = i) && (f.value = (f.__value = i) ?? "", hi(f, i)), Ci(v, t.view.model.role), v.disabled = t.view.readOnly || !t.view.model.roleEditable || !r().editField;
			}, [
				() => !ge() || t.view.model.profile.mode === "inherit" || !t.view.model.profile.allowedModes.some((e) => e.value === "inherit"),
				() => !ge(),
				() => _e("model")
			]), W("click", l, () => me("profileId", "inherit", null)), W("change", f, (e) => xe("model", e.currentTarget.value)), W("change", v, (e) => {
				let n = e.currentTarget.value;
				t.view?.model?.roleEditable && r().editField && M("modelRole", !1, (e) => r().editField(e, "modelRole", n));
			}), K(e, n);
		};
		J(ie, (e) => {
			t.view.model && e(oe);
		});
		var se = B(ie, 2), he = (e) => {
			var n = Kc();
			Y(B(R(n)), 17, () => t.view.ports, (e) => e.direction + ":" + e.id, (e, t) => {
				var n = Gc(), r = R(n), i = B(r), a = R(i, !0);
				P(i), P(n), V(() => {
					q(r, `${H(t).direction === "input" ? "In" : "Out"} · ${H(t).label ?? ""}`), q(a, H(t).kind);
				}), K(e, n);
			}), P(n), K(e, n);
		};
		J(se, (e) => {
			t.view.ports.length && e(he);
		});
		var we = B(se, 2), Te = (e) => {
			var n = qc(), r = R(n, !0);
			P(n), V(() => q(r, t.view.status)), K(e, n);
		};
		J(we, (e) => {
			t.view.status && e(Te);
		});
		var De = B(we, 2);
		Y(De, 17, () => ao((t.view.issues ?? []).filter((e) => e !== t.view?.model?.issue && e !== t.view?.helperBindings?.issue), { nodeTitle: t.view.title }), (e) => e.id, (e, t) => {
			var n = Dc();
			fo(R(n), { get diagnostic() {
				return H(t);
			} }), P(n), K(e, n);
		});
		var Ve = B(De, 2), He = (e) => {
			{
				let n = /* @__PURE__ */ F(() => !Ce()), r = /* @__PURE__ */ F(Ee), a = /* @__PURE__ */ F(() => H(o).modifiers || "");
				ac(e, {
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
					onquick: Oe,
					onadd: N,
					onenable: ke,
					onremove: Ae,
					onmove: je,
					ondraft: Ne,
					onsave: Pe
				});
			}
		};
		J(Ve, (e) => {
			t.view.modifiers && e(He);
		}), V((e) => {
			l = mi(c, "", l, { "--pc-detail-family": t.view.familyColor ?? "var(--pc-accent)" }), Z(d, "d", t.view.iconPath), Z(p, "id", i() + "-name"), Z(p, "maxlength", t.view.boundary ? void 0 : 80), Ci(p, e), p.disabled = t.view.boundary ? t.view.readOnly || !r().editInterface : !t.view.canPresent || !r().present, q(y, t.view.boundary ? "Subgraph " + t.view.boundary.direction : t.view.family + " · " + t.view.phase + " phase");
		}, [() => t.view.boundary ? Re().label : t.view.alias || t.view.title || t.view.canonicalTitle]), W("input", p, (e) => {
			t.view?.boundary && ze("label", e.currentTarget.value);
		}), W("change", p, (e) => {
			t.view?.boundary || Le(e.currentTarget.value);
		}), K(e, s);
	}, Ke = (e) => {
		K(e, Yc());
	};
	J(He, (e) => {
		t.view ? e(Ge) : e(Ke, -1);
	}), P(Ve), K(e, Ve), We();
}
Er([
	"input",
	"change",
	"click"
]);
//#endregion
//#region ui/CommentDetails.svelte
var Qc = /* @__PURE__ */ G("<p class=\"pc-detail-meta svelte-17djc3u\">Read-only comment</p>"), $c = /* @__PURE__ */ G("<section class=\"pc-comment-details svelte-17djc3u\" aria-label=\"Comment details\"><h3 class=\"svelte-17djc3u\">Comment</h3> <!> <fieldset class=\"pc-detail-group svelte-17djc3u\"><legend class=\"svelte-17djc3u\">Comment</legend> <label class=\"svelte-17djc3u\">Title<input aria-label=\"Comment title\" class=\"svelte-17djc3u\"/></label> <label class=\"svelte-17djc3u\">Notes<textarea aria-label=\"Comment notes\" rows=\"5\" class=\"svelte-17djc3u\"></textarea></label> <label class=\"pc-comment-color-label svelte-17djc3u\">Color<input aria-label=\"Comment color\" type=\"color\" class=\"svelte-17djc3u\"/></label> <label class=\"pc-detail-check svelte-17djc3u\"><input aria-label=\"Move contents\" type=\"checkbox\" class=\"svelte-17djc3u\"/> Move contents</label> <small class=\"svelte-17djc3u\">Moves fully contained nodes when you drag the comment header.</small></fieldset> <div class=\"pc-comment-commands svelte-17djc3u\"><button type=\"button\" class=\"pc-btn svelte-17djc3u\">Fit to contents</button> <button type=\"button\" class=\"pc-btn pc-danger svelte-17djc3u\">Delete comment</button></div> <small class=\"svelte-17djc3u\">Deleting this comment keeps its contents.</small></section>");
function el(e, t) {
	Ue(t, !0);
	let n = Ni(t, "readOnly", 3, !1), r = /* @__PURE__ */ F(() => n() || t.comment.readOnly), i = (e) => e.stopPropagation();
	function a(e) {
		H(r) || t.onPatch(e);
	}
	function o(e) {
		H(r) || t.onCommand(e);
	}
	var s = $c(), c = B(R(s), 2), l = (e) => {
		K(e, Qc());
	};
	J(c, (e) => {
		H(r) && e(l);
	});
	var u = B(c, 2), d = B(R(u), 2), f = B(R(d));
	X(f), P(d);
	var p = B(d, 2), m = B(R(p));
	at(m), P(p);
	var h = B(p, 2), g = B(R(h));
	X(g), P(h);
	var _ = B(h, 2), v = R(_);
	X(v), Me(), P(_), Me(2), P(u);
	var y = B(u, 2), b = R(y), x = B(b, 2);
	P(y), Me(2), P(s), V(() => {
		u.disabled = H(r), Ci(f, t.comment.title), f.disabled = H(r), Ci(m, t.comment.content), m.disabled = H(r), Ci(g, t.comment.color), g.disabled = H(r), wi(v, t.comment.moveContents), v.disabled = H(r), b.disabled = H(r), x.disabled = H(r);
	}), U("keydown", f, i, !0), W("change", f, (e) => a({ title: e.currentTarget.value })), U("keydown", m, i, !0), W("change", m, (e) => a({ content: e.currentTarget.value })), W("change", g, (e) => a({ color: e.currentTarget.value })), W("change", v, (e) => a({ moveContents: e.currentTarget.checked })), W("click", b, () => o("fit")), W("click", x, () => o("delete")), K(e, s), We();
}
Er(["change", "click"]);
//#endregion
//#region ui/OutputPreview.svelte
var tl = /* @__PURE__ */ G("<option class=\"svelte-ee2ehy\"> </option>"), nl = /* @__PURE__ */ G("<label class=\"pc-preview-choice svelte-ee2ehy\"><span class=\"pc-preview-sr-only svelte-ee2ehy\">Preview output</span><select aria-label=\"Preview output\" class=\"svelte-ee2ehy\"><option disabled=\"\" class=\"svelte-ee2ehy\">Choose an output</option><!></select></label>"), rl = /* @__PURE__ */ G("<button type=\"button\" aria-label=\"Collapse preview\" title=\"Collapse preview\" class=\"svelte-ee2ehy\">▴</button>"), il = /* @__PURE__ */ G("<button type=\"button\" role=\"tab\" class=\"svelte-ee2ehy\"> </button>"), al = /* @__PURE__ */ G("<div class=\"pc-preview-tabs svelte-ee2ehy\" role=\"tablist\" aria-label=\"Recorded artifacts\"></div>"), ol = /* @__PURE__ */ G("<pre class=\"svelte-ee2ehy\"> </pre>"), sl = /* @__PURE__ */ G("<small class=\"pc-preview-note svelte-ee2ehy\"> </small>"), cl = /* @__PURE__ */ G("<div role=\"tabpanel\" tabindex=\"0\" class=\"svelte-ee2ehy\"><article class=\"svelte-ee2ehy\"><div class=\"pc-preview-section-heading svelte-ee2ehy\"><span class=\"svelte-ee2ehy\"> </span><small class=\"svelte-ee2ehy\"> </small></div> <!> <!></article></div>"), ll = /* @__PURE__ */ G("<p class=\"pc-preview-empty svelte-ee2ehy\"> </p>"), ul = /* @__PURE__ */ G("<p class=\"pc-preview-note svelte-ee2ehy\"> </p> <!>", 1), dl = /* @__PURE__ */ G("<section aria-label=\"Accepted consequences\" class=\"pc-preview-settlement svelte-ee2ehy\"><strong class=\"svelte-ee2ehy\"> </strong> <!></section>"), fl = /* @__PURE__ */ G("<p class=\"pc-preview-note svelte-ee2ehy\"> </p>"), pl = /* @__PURE__ */ G("<div class=\"pc-preview-note svelte-ee2ehy\"><span class=\"svelte-ee2ehy\"> </span><!></div>"), ml = /* @__PURE__ */ G("<div class=\"svelte-ee2ehy\"><!></div>"), hl = /* @__PURE__ */ G("<button type=\"button\" data-run-here=\"\" title=\"Runs the selected output's dependencies within the displayed request limit.\" class=\"svelte-ee2ehy\"> </button><!>", 1), gl = /* @__PURE__ */ G("<button type=\"button\" data-preview-apply=\"\" class=\"svelte-ee2ehy\"> </button><!><button type=\"button\" class=\"svelte-ee2ehy\"> </button>", 1), _l = /* @__PURE__ */ G("<header class=\"svelte-ee2ehy\"><h3 class=\"svelte-ee2ehy\"> </h3> <!> <div class=\"pc-preview-tools svelte-ee2ehy\"><button type=\"button\" aria-label=\"Pin preview\" class=\"svelte-ee2ehy\"> </button><!></div></header> <!> <div class=\"pc-preview-sections svelte-ee2ehy\"><!> <!> <!> <!> <!> <!> <!></div> <footer class=\"svelte-ee2ehy\"><span class=\"pc-preview-status svelte-ee2ehy\"> </span> <span class=\"svelte-ee2ehy\"> </span> <!> <!></footer>", 1), vl = /* @__PURE__ */ G("<p class=\"pc-preview-empty svelte-ee2ehy\">Select a node output to inspect its recorded result.</p>"), yl = /* @__PURE__ */ G("<section class=\"pc-output-preview svelte-ee2ehy\" aria-label=\"Output preview\"><!></section>");
function bl(e, t) {
	let n = Rr();
	Ue(t, !0);
	let r = Ni(t, "actions", 19, () => ({})), i = /* @__PURE__ */ F(() => {
		let e = t.view?.diagnostics ?? ao([
			t.view?.runHere?.issue,
			...t.view?.issues ?? [],
			t.view?.review?.issue
		].filter((e) => !!e), { nodeTitle: t.view?.title });
		return e.filter((t, n) => e.findIndex((e) => e.id === t.id) === n);
	}), a = /* @__PURE__ */ F(() => JSON.stringify([t.view?.sourceKey, t.view?.selectedKey])), o = /* @__PURE__ */ I(tn({
		scope: "",
		id: null
	})), s = /* @__PURE__ */ F(() => (H(o).scope === H(a) ? t.view?.sections.find((e) => e.id === H(o).id) : null) ?? t.view?.sections[0] ?? null);
	Cn(() => {
		let e = H(o).scope === H(a) && t.view?.sections.some((e) => e.id === H(o).id) ? H(o).id : t.view?.sections[0]?.id ?? null;
		(H(o).scope !== H(a) || H(o).id !== e) && L(o, {
			scope: H(a),
			id: e
		}, !0);
	});
	let c = (e) => n + "-tab-" + encodeURIComponent(e);
	function l(e, n) {
		e.stopPropagation();
		let r = t.view?.sections ?? [];
		if (!r.length || ![
			"ArrowLeft",
			"ArrowRight",
			"Home",
			"End"
		].includes(e.key)) return;
		e.preventDefault();
		let i = e.key === "Home" ? 0 : e.key === "End" ? r.length - 1 : (n + (e.key === "ArrowRight" ? 1 : -1) + r.length) % r.length;
		L(o, {
			scope: H(a),
			id: r[i].id
		}, !0), e.currentTarget.parentElement?.querySelectorAll("[role=\"tab\"]")[i]?.focus();
	}
	let u = /* @__PURE__ */ F(() => t.view?.choices.find((e) => e.key === t.view?.selectedKey) ?? null), d = (e) => ({
		"not-run": "Not run",
		current: "Current",
		stale: "Stale",
		removed: "Source removed"
	})[e] ?? e, f = (e) => "kind" in e ? JSON.stringify([
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
	]), p = (e) => "kind" in e ? {
		kind: "terminal",
		address: {
			...e.address,
			instancePath: [...e.address.instancePath]
		}
	} : {
		...e,
		instancePath: [...e.instancePath]
	}, m = /* @__PURE__ */ F(() => !!(t.view && H(u) && t.view.status !== "removed" && !t.view.busy && t.view.runHere?.enabled && r().runHere)), h = /* @__PURE__ */ F(() => !!(t.view && H(u) && t.view.review?.mode === "root" && t.view.review.selectedRootTerminal && "kind" in H(u).target && H(u).target.address.instancePath.length === 0 && f(H(u).target) === f(t.view.review.selector.terminal))), g = /* @__PURE__ */ F(() => !!(t.view && t.view.status === "current" && !t.view.busy && H(h) && t.view.review?.fresh && t.view.review.canApply && r().apply)), _ = /* @__PURE__ */ F(() => !!(t.view && !t.view.busy && H(h) && r().reject)), v = /* @__PURE__ */ F(() => H(m) ? void 0 : t.view?.runHere?.reason || (t.view?.busy ? "Wait for the current run to finish." : H(u) ? r().runHere ? "This output cannot run with the current workflow settings." : "Run to here is unavailable in this workspace." : "Choose an output before running.")), y = /* @__PURE__ */ F(() => H(g) ? void 0 : t.view?.review?.reason || (t.view?.busy ? "Wait for the current run to finish." : t.view?.status !== "current" || !t.view?.review?.fresh ? "Run this workflow again to review a current result." : H(h) ? r().apply ? "This reviewed reply cannot be applied with the current workflow settings." : "Apply is unavailable in this workspace." : "Select the root workflow’s reviewed reply to apply it.")), b = /* @__PURE__ */ F(() => H(i).findIndex((e) => e.message === H(v))), x = /* @__PURE__ */ F(() => H(i).findIndex((e) => e.message === H(y))), S = /* @__PURE__ */ F(() => H(v) ? n + (H(b) >= 0 ? "-diagnostic-" + H(b) : "-run-reason") : void 0), C = /* @__PURE__ */ F(() => H(y) ? n + (H(x) >= 0 ? "-diagnostic-" + H(x) : "-apply-reason") : void 0);
	function w(e) {
		let n = t.view?.choices.find((t) => t.key === e);
		t.view && n && r().select?.(t.view.sourceKey, n.key, p(n.target));
	}
	function T(e) {
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
	var E = yl(), D = R(E), O = (e) => {
		var f = _l(), h = z(f), E = R(h), D = R(E, !0);
		P(E);
		var O = B(E, 2), k = (e) => {
			var n = nl(), i = B(R(n)), a = R(i);
			a.value = a.__value = "", Y(B(a), 17, () => t.view.choices, (e) => e.key, (e, t) => {
				var n = tl(), r = R(n);
				P(n);
				var i = {};
				V(() => {
					q(r, `${H(t).label ?? ""} · ${H(t).kind ?? ""}`), i !== (i = H(t).key) && (n.value = (n.__value = H(t).key) ?? "");
				}), K(e, n);
			}), P(i);
			var o;
			gi(i), P(n), V(() => {
				i.disabled = !r().select, o !== (o = t.view.selectedKey ?? "") && (i.value = (i.__value = t.view.selectedKey ?? "") ?? "", hi(i, t.view.selectedKey ?? ""));
			}), W("change", i, (e) => w(e.currentTarget.value)), K(e, n);
		};
		J(O, (e) => {
			t.view.choices.length && e(k);
		});
		var A = B(O, 2), j = R(A), M = R(j, !0);
		P(j);
		var ee = B(j), te = (e) => {
			var n = rl();
			W("click", n, function(...e) {
				t.collapse?.apply(this, e);
			}), K(e, n);
		};
		J(ee, (e) => {
			t.collapse && e(te);
		}), P(A), P(h);
		var ne = B(h, 2), re = (e) => {
			var r = al();
			Y(r, 23, () => t.view.sections, (e) => e.id, (e, t, r) => {
				var i = il(), u = R(i, !0);
				P(i), V((e) => {
					Z(i, "id", e), Z(i, "aria-selected", H(s)?.id === H(t).id), Z(i, "aria-controls", n + "-panel"), Z(i, "tabindex", H(s)?.id === H(t).id ? 0 : -1), q(u, H(t).label);
				}, [() => c(H(t).id)]), W("click", i, () => {
					L(o, {
						scope: H(a),
						id: H(t).id
					}, !0);
				}), U("keydown", i, (e) => l(e, H(r)), !0), K(e, i);
			}), P(r), K(e, r);
		};
		J(ne, (e) => {
			t.view.sections.length && e(re);
		});
		var ie = B(ne, 2), ae = R(ie), oe = (e) => {
			let t = /* @__PURE__ */ F(() => H(s));
			var r = cl(), i = R(r), a = R(i), o = R(a), l = R(o, !0);
			P(o);
			var u = B(o), d = R(u, !0);
			P(u), P(a);
			var f = B(a, 2), p = (e) => {
				fo(e, { get issue() {
					return H(t).text;
				} });
			}, m = (e) => {
				var n = ol(), r = R(n, !0);
				P(n), V(() => q(r, H(t).text)), K(e, n);
			};
			J(f, (e) => {
				H(t).format === "omitted" ? e(p) : e(m, -1);
			});
			var h = B(f, 2), g = (e) => {
				var n = sl(), r = R(n);
				P(n), V(() => q(r, `Only part of the recorded output is displayed here. This display limit does not mean the model stopped early.${H(t).format === "json-prefix-text" ? " The JSON prefix is shown as text." : ""}`)), K(e, n);
			};
			J(h, (e) => {
				H(t).truncated && e(g);
			}), P(i), P(r), V((e) => {
				Z(r, "id", n + "-panel"), Z(r, "aria-labelledby", e), Z(i, "data-artifact-kind", H(t).kind), q(l, H(t).label), q(d, H(t).kind);
			}, [() => c(H(t).id)]), U("keydown", r, (e) => e.stopPropagation(), !0), U("paste", r, (e) => e.stopPropagation(), !0), K(e, r);
		}, se = (e) => {
			var n = ll(), r = R(n, !0);
			P(n), V(() => q(r, t.view.emptyMessage ?? (t.view.status === "not-run" ? "This output has not run yet. Use Run to here, or enable Lattice and send a message in SillyTavern." : "No output was kept for this step. Run it again if you need to inspect its result."))), K(e, n);
		};
		J(ae, (e) => {
			H(s) ? e(oe) : H(i).length || e(se, 1);
		});
		var ce = B(ae, 2), le = (e) => {
			var n = dl(), r = R(n), i = R(r);
			P(r), Y(B(r, 2), 17, () => t.view.settlement.receipts, (e) => e.intentId + ":" + e.targetId, (e, t) => {
				var n = ul(), r = z(n), i = R(r);
				P(r);
				var a = B(r, 2), o = (e) => {
					{
						let n = /* @__PURE__ */ F(() => ({
							operation: "save",
							nodeTitle: H(t).targetId
						}));
						fo(e, {
							get issue() {
								return H(t).error;
							},
							get context() {
								return H(n);
							}
						});
					}
				};
				J(a, (e) => {
					H(t).error && e(o);
				}), V(() => q(i, `${H(t).targetId ?? ""} · ${(H(t).status === "confirmed" || H(t).status === "persisted" ? "Saved" : H(t).status === "failed" ? "Save failed" : H(t).status === "unknown" ? "Save outcome unknown" : H(t).status === "save-unverified" || H(t).status === "unverified" ? "Save not verified" : H(t).status === "unchanged" ? "Already current" : H(t).status) ?? ""}`)), K(e, n);
			}), P(n), V(() => q(i, `Accepted consequences · ${t.view.settlement.status === "settled" ? "Saved" : t.view.settlement.status === "partial" ? "Some targets failed" : "Save confirmation needed"}`)), K(e, n);
		};
		J(ce, (e) => {
			t.view.settlement && e(le);
		});
		var ue = B(ce, 2), de = (e) => {
			var n = fl(), r = R(n, !0);
			P(n), V(() => q(r, t.view.statusDetail)), K(e, n);
		};
		J(ue, (e) => {
			t.view.statusDetail && e(de);
		});
		var fe = B(ue, 2), pe = (e) => {
			var n = fl(), r = R(n, !0);
			P(n), V(() => q(r, t.view.historyNotice)), K(e, n);
		};
		J(fe, (e) => {
			t.view.historyNotice && e(pe);
		});
		var me = B(fe, 2);
		Y(me, 17, () => t.view.sections.filter((e) => e.id !== H(s)?.id && (e.format === "omitted" || e.truncated)), (e) => e.id, (e, t) => {
			var n = Lr(), r = z(n), i = (e) => {
				var n = pl(), r = R(n), i = R(r, !0);
				P(r), fo(B(r), { get issue() {
					return H(t).text;
				} }), P(n), V(() => q(i, H(t).label)), K(e, n);
			}, a = (e) => {
				var n = fl(), r = R(n);
				P(n), V(() => q(r, `${H(t).label ?? ""}: Only part of the recorded output is displayed here; this is a display limit.${H(t).format === "json-prefix-text" ? " The JSON prefix is shown as text." : ""}`)), K(e, n);
			};
			J(r, (e) => {
				H(t).format === "omitted" ? e(i) : e(a, -1);
			}), K(e, n);
		});
		var he = B(me, 2);
		Y(he, 19, () => H(i), (e) => e.id, (e, t, i) => {
			var a = ml();
			fo(R(a), {
				get diagnostic() {
					return H(t);
				},
				get reveal() {
					return r().reveal;
				}
			}), P(a), V(() => Z(a, "id", n + "-diagnostic-" + H(i))), K(e, a);
		});
		var ge = B(he, 2), _e = (e) => {
			var n = sl(), r = R(n, !0);
			P(n), V(() => q(r, t.view.review.persistOnly ? "Retry keeps the accepted reply and retries only authorized targets whose saves failed. It makes no model request. Unknown or unverified saves cannot be retried here." : "Apply checks that the source, connection and reviewed reply are still current. The displayed preview may show only part of the recorded output.")), K(e, n);
		};
		J(ge, (e) => {
			t.view.review && e(_e);
		}), P(ie);
		var ve = B(ie, 2), ye = R(ve), be = R(ye, !0);
		P(ye);
		var xe = B(ye, 2), Se = R(xe, !0);
		P(xe);
		var Ce = B(xe, 2), we = (e) => {
			var i = hl(), a = z(i), o = R(a);
			P(a);
			var s = B(a), c = (e) => {
				var t = fl(), r = R(t, !0);
				P(t), V(() => {
					Z(t, "id", n + "-run-reason"), q(r, H(v));
				}), K(e, t);
			};
			J(s, (e) => {
				H(v) && H(b) < 0 && e(c);
			}), V(() => {
				Z(a, "aria-describedby", H(S)), a.disabled = !H(m), q(o, `Run to here · maximum ${t.view.runHere.callBound ?? ""} ${t.view.runHere.callBound === 1 ? "request" : "requests"}`);
			}), W("click", a, () => {
				t.view && H(u) && H(m) && r().runHere?.(t.view.sourceKey, p(H(u).target));
			}), K(e, i);
		};
		J(Ce, (e) => {
			t.view.runHere && e(we);
		});
		var Te = B(Ce, 2), Ee = (e) => {
			var i = gl(), a = z(i), o = R(a, !0);
			P(a);
			var s = B(a), c = (e) => {
				var t = fl(), r = R(t, !0);
				P(t), V(() => {
					Z(t, "id", n + "-apply-reason"), q(r, H(y));
				}), K(e, t);
			};
			J(s, (e) => {
				H(y) && H(x) < 0 && e(c);
			});
			var l = B(s), u = R(l, !0);
			P(l), V(() => {
				Z(a, "aria-describedby", H(C)), a.disabled = !H(g), q(o, t.view.review.persistOnly ? "Retry failed saves" : "Apply reviewed reply"), l.disabled = !H(_), q(u, t.view.review.persistOnly ? "Close save review" : "Reject reply");
			}), W("click", a, () => {
				t.view?.review && H(g) && r().apply?.(T(t.view.review.selector));
			}), W("click", l, () => {
				t.view?.review && H(_) && r().reject?.(T(t.view.review.selector));
			}), K(e, i);
		};
		J(Te, (e) => {
			t.view.review && e(Ee);
		}), P(ve), V((e) => {
			q(D, H(u)?.label ?? t.view.title), Z(j, "title", t.view.pinned ? "Unpin and follow selection" : "Keep this output visible"), Z(j, "aria-pressed", t.view.pinned), j.disabled = t.view.pinned ? !r().follow : !H(u) || !r().pin, q(M, t.view.pinned ? "Pinned output" : "Pin output"), Z(ye, "data-status", t.view.status), q(be, e), q(Se, t.view.pinned ? "Pinned preview" : t.view.followSelection ? "Following selection" : "Selection not followed");
		}, [() => d(t.view.status)]), W("click", j, () => {
			t.view?.pinned ? r().follow?.() : t.view && H(u) && r().pin?.(t.view.sourceKey, p(H(u).target));
		}), K(e, f);
	}, k = (e) => {
		K(e, vl());
	};
	J(D, (e) => {
		t.view ? e(O) : e(k, -1);
	}), P(E), K(e, E), We();
}
Er(["change", "click"]);
//#endregion
//#region ui/RunDetails.svelte
var xl = /* @__PURE__ */ G("<p class=\"pc-run-empty svelte-f9s2fm\">No execution plan has been recorded.</p>"), Sl = /* @__PURE__ */ G("<span aria-hidden=\"true\" class=\"svelte-f9s2fm\">▱</span>"), Cl = /* @__PURE__ */ G("<small class=\"svelte-f9s2fm\"> </small>"), wl = /* @__PURE__ */ G("<div class=\"pc-run-error svelte-f9s2fm\"><!></div>"), Tl = /* @__PURE__ */ G("<details class=\"svelte-f9s2fm\"><summary class=\"svelte-f9s2fm\">Reported usage</summary><div class=\"pc-run-usage svelte-f9s2fm\"><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small></div></details>"), El = /* @__PURE__ */ G("<li class=\"svelte-f9s2fm\"><div class=\"pc-run-row-heading svelte-f9s2fm\"><button type=\"button\" class=\"svelte-f9s2fm\"><!> </button><span class=\"pc-run-status svelte-f9s2fm\"> </span></div> <!> <div class=\"pc-run-row-meta svelte-f9s2fm\"><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small></div> <!> <!></li>"), Dl = /* @__PURE__ */ G("<header class=\"svelte-f9s2fm\"><h3 class=\"svelte-f9s2fm\">Run details</h3><span class=\"pc-run-status svelte-f9s2fm\"> </span></header> <div class=\"pc-run-summary svelte-f9s2fm\"><p class=\"svelte-f9s2fm\"> </p><p class=\"svelte-f9s2fm\"> </p><p class=\"svelte-f9s2fm\"> </p></div> <!> <!> <ol class=\"pc-run-rows svelte-f9s2fm\"></ol>", 1), Ol = /* @__PURE__ */ G("<p class=\"pc-run-empty svelte-f9s2fm\">Enable Lattice and Send with the open workflow, or use Run to here to inspect its processing stages.</p>"), kl = /* @__PURE__ */ G("<section class=\"pc-run-details svelte-f9s2fm\" aria-label=\"Run details\"><!></section>");
function Al(e, t) {
	Ue(t, !0);
	let n = Ni(t, "actions", 19, () => ({})), r = (e) => e === "not-run" ? "Not run" : e === "empty" ? "Ready" : e.charAt(0).toUpperCase() + e.slice(1), i = (e) => e !== null && Number.isFinite(e) && e >= 0 ? (e / 1e3).toFixed(2) + "s" : "Unknown", a = (e) => e != null && Number.isFinite(e) && e >= 0 ? String(e) : "Unknown", o = /* @__PURE__ */ F(() => t.view?.diagnostics ?? ao(t.view?.issue ? [t.view.issue] : []));
	var s = kl(), c = R(s), l = (e) => {
		var s = Dl(), c = z(s), l = B(R(c)), u = R(l, !0);
		P(l), P(c);
		var d = B(c, 2), f = R(d), p = R(f);
		P(f);
		var m = B(f), h = R(m);
		P(m);
		var g = B(m), _ = R(g);
		P(g), P(d);
		var v = B(d, 2);
		Y(v, 17, () => H(o), (e) => e.id, (e, r) => {
			{
				let i = /* @__PURE__ */ F(() => n().jump ? (e) => {
					t.view && n().jump?.(t.view.runId, e);
				} : void 0);
				fo(e, {
					get diagnostic() {
						return H(r);
					},
					get reveal() {
						return H(i);
					}
				});
			}
		});
		var y = B(v, 2), b = (e) => {
			K(e, xl());
		};
		J(y, (e) => {
			!t.view.rows.length && !H(o).length && e(b);
		});
		var x = B(y, 2);
		Y(x, 21, () => t.view.rows, (e) => e.key, (e, s) => {
			var c = El();
			let l;
			var u = R(c), d = R(u), f = R(d), p = (e) => {
				K(e, Sl());
			};
			J(f, (e) => {
				H(s).kind === "instance" && e(p);
			});
			var m = B(f, 1, !0);
			P(d);
			var h = B(d), g = R(h, !0);
			P(h), P(u);
			var _ = B(u, 2), v = (e) => {
				var t = Cl(), n = R(t, !0);
				P(t), V((e) => q(n, e), [() => r(H(s).subphase)]), K(e, t);
			};
			J(_, (e) => {
				H(s).subphase && e(v);
			});
			var y = B(_, 2), b = R(y), x = R(b);
			P(b);
			var S = B(b), C = R(S);
			P(S), P(y);
			var w = B(y, 2);
			Y(w, 17, () => H(s).diagnostics ?? ao(H(s).issue ? [H(s).issue] : [], { nodeTitle: H(s).title }), (e) => e.id, (e, t) => {
				var n = Lr(), r = z(n), i = (e) => {
					var n = wl();
					fo(R(n), { get diagnostic() {
						return H(t);
					} }), P(n), K(e, n);
				}, a = /* @__PURE__ */ F(() => !H(o).some((e) => e.id === H(t).id));
				J(r, (e) => {
					H(a) && e(i);
				}), K(e, n);
			});
			var T = B(w, 2), E = (e) => {
				var t = Tl(), n = B(R(t)), r = R(n), i = R(r);
				P(r);
				var o = B(r), c = R(o);
				P(o);
				var l = B(o), u = R(l);
				P(l);
				var d = B(l), f = R(d);
				P(d), P(n), P(t), V((e, t, n) => {
					q(i, `Input tokens: ${e ?? ""}`), q(c, `Output tokens: ${t ?? ""}`), q(u, `Total tokens: ${n ?? ""}`), q(f, `Cost: ${H(s).usage?.cost ?? "Unknown" ?? ""}`);
				}, [
					() => a(H(s).usage?.inputTokens),
					() => a(H(s).usage?.outputTokens),
					() => a(H(s).usage?.totalTokens)
				]), K(e, t);
			};
			J(T, (e) => {
				H(s).kind === "primitive" && e(E);
			}), P(c), V((e, t, r) => {
				Z(c, "data-run-row", H(s).key), Z(c, "data-depth", H(s).depth), Z(c, "data-status", H(s).status), l = mi(c, "", l, e), Z(d, "aria-label", "Open " + H(s).title + " in graph"), d.disabled = !n().jump, q(m, H(s).title), Z(h, "data-status", H(s).status), q(g, t), q(x, `Duration: ${r ?? ""}`), q(C, `${H(s).attempts ?? ""} of ${H(s).callBound ?? ""} requests`);
			}, [
				() => ({ "margin-left": `${Math.max(0, Math.min(8, H(s).depth)) * 12}px` }),
				() => r(H(s).status),
				() => i(H(s).durationMs)
			]), W("click", d, () => {
				t.view && n().jump?.(t.view.runId, {
					...H(s).address,
					instancePath: [...H(s).address.instancePath]
				});
			}), K(e, c);
		}), P(x), V((e, n) => {
			Z(l, "data-status", t.view.status), q(u, e), q(p, `${t.view.completedCount ?? ""} of ${t.view.executableCount ?? ""} stages complete`), q(h, `${t.view.actualCalls ?? ""} of ${t.view.callBound ?? ""} requests`), q(_, `Elapsed: ${n ?? ""}`);
		}, [() => r(t.view.status), () => i(t.view.elapsedMs)]), K(e, s);
	}, u = (e) => {
		K(e, Ol());
	};
	J(c, (e) => {
		t.view ? e(l) : e(u, -1);
	}), P(s), K(e, s), We();
}
Er(["click"]);
//#endregion
//#region ui/RunMeter.svelte
var jl = /* @__PURE__ */ G("<span class=\"pc-run-meter-elapsed svelte-1tkcp3\" data-run-elapsed=\"\"> </span>"), Ml = /* @__PURE__ */ G("<span class=\"pc-run-pixel svelte-1tkcp3\" data-run-pixel=\"\"></span>"), Nl = /* @__PURE__ */ G("<button class=\"pc-run-meter svelte-1tkcp3\"><span class=\"pc-run-meter-label svelte-1tkcp3\"> </span> <!> <span class=\"pc-run-meter-pixels svelte-1tkcp3\" aria-hidden=\"true\"></span></button>");
function Pl(e, t) {
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
	var o = Lr(), s = z(o), c = (e) => {
		var r = Nl(), o = R(r), s = R(o, !0);
		P(o);
		var c = B(o, 2), l = (e) => {
			var n = jl(), r = R(n);
			P(n), V((e) => q(r, `${e ?? ""}s`), [() => (t.view.elapsedMs / 1e3).toFixed(1)]), K(e, n);
		}, u = /* @__PURE__ */ F(() => t.view.elapsedMs !== null && Number.isFinite(t.view.elapsedMs) && t.view.elapsedMs >= 0);
		J(c, (e) => {
			H(u) && e(l);
		});
		var d = B(c, 2);
		Y(d, 21, () => H(i), (e) => e.key, (e, t) => {
			var n = Ml();
			V(() => {
				Z(n, "data-status", H(t).status), Z(n, "title", H(t).title);
			}), K(e, n);
		}), P(d), P(r), V((e) => {
			Z(r, "aria-label", H(a)), Z(r, "title", H(a)), r.disabled = !t.open, q(s, e);
		}, [() => n(t.view.status)]), W("click", r, () => t.open?.()), K(e, r);
	};
	J(s, (e) => {
		t.view && e(c);
	}), K(e, o), We();
}
Er(["click"]);
//#endregion
//#region ui/PortalManager.svelte
var Fl = /* @__PURE__ */ G("<button type=\"button\" class=\"svelte-mnv790\">Close</button>"), Il = /* @__PURE__ */ G("<option class=\"svelte-mnv790\"> </option>"), Ll = /* @__PURE__ */ G("<label class=\"svelte-mnv790\">Portal name<input aria-label=\"Portal name\" class=\"svelte-mnv790\"/></label> <p class=\"pc-note svelte-mnv790\"> </p> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-rename=\"\" class=\"svelte-mnv790\">Rename</button></div>", 1), Rl = /* @__PURE__ */ G("<p class=\"pc-note svelte-mnv790\">Select a portal or create one from an output.</p>"), zl = /* @__PURE__ */ G("<button type=\"button\" data-portal-jump-source=\"\" class=\"svelte-mnv790\">Jump to source</button>"), Bl = /* @__PURE__ */ G("<label class=\"pc-check svelte-mnv790\"><input type=\"checkbox\" aria-label=\"Replace existing connection\" class=\"svelte-mnv790\"/>Replace existing connection</label>"), Vl = /* @__PURE__ */ G("<button type=\"button\" data-portal-jump-consumer=\"\" class=\"svelte-mnv790\">Jump</button>"), Hl = /* @__PURE__ */ G("<div class=\"pc-consumer svelte-mnv790\"><span class=\"svelte-mnv790\"> </span><div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-restore=\"\" class=\"svelte-mnv790\">Restore wire</button> <!></div></div>"), Ul = /* @__PURE__ */ G("<p class=\"pc-note svelte-mnv790\">No consumers.</p>"), Wl = /* @__PURE__ */ G("<label class=\"svelte-mnv790\">Existing consumers<select aria-label=\"Existing consumers\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Choose before deleting…</option><option class=\"svelte-mnv790\">Restore visible wires</option><option class=\"svelte-mnv790\">Disconnect consumers</option></select></label>"), Gl = /* @__PURE__ */ G("<details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Consumers</summary> <label class=\"svelte-mnv790\">Compatible receiver<select aria-label=\"Compatible receiver\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select input…</option><!></select></label> <!> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-connect=\"\" class=\"svelte-mnv790\">Connect receiver</button></div> <!> <!> <!> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-delete=\"\" class=\"svelte-mnv790\">Delete portal</button></div></details>"), Kl = /* @__PURE__ */ G("<details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Convert to portal</summary><p class=\"pc-note svelte-mnv790\"> </p><div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-convert=\"\" class=\"svelte-mnv790\"> </button></div></details>"), ql = /* @__PURE__ */ G("<div class=\"pc-error svelte-mnv790\"><!></div>"), Jl = /* @__PURE__ */ G("<p class=\"pc-note svelte-mnv790\" role=\"status\">Preparing change…</p>"), Yl = /* @__PURE__ */ G("<p class=\"pc-note svelte-mnv790\"> </p> <label class=\"svelte-mnv790\">Portal<select aria-label=\"Selected portal\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select portal…</option><!></select></label> <!> <details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Source</summary> <label class=\"svelte-mnv790\">Output<select aria-label=\"Portal source\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select output…</option><!></select></label> <label class=\"svelte-mnv790\">New portal name<input aria-label=\"New portal name\" class=\"svelte-mnv790\"/></label> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-create=\"\" class=\"svelte-mnv790\">Create portal</button> <button type=\"button\" data-portal-retarget=\"\" class=\"svelte-mnv790\">Retarget</button> <!></div></details> <!> <!> <!> <!> <!>", 1), Xl = /* @__PURE__ */ G("<p class=\"pc-note svelte-mnv790\">Open a graph to manage its portals.</p>"), Zl = /* @__PURE__ */ G("<section class=\"pc-manager svelte-mnv790\" aria-label=\"Manage portals\"><header class=\"svelte-mnv790\"><h2 class=\"svelte-mnv790\">Manage portals</h2><!></header> <!></section>");
function Ql(e, t) {
	Ue(t, !0);
	let n = Ni(t, "actions", 19, () => ({})), r = /* @__PURE__ */ I(""), i = /* @__PURE__ */ I(""), a = /* @__PURE__ */ I(""), o = /* @__PURE__ */ I(""), s = /* @__PURE__ */ I(""), c = /* @__PURE__ */ I(!1), l = /* @__PURE__ */ I(""), u = /* @__PURE__ */ I(""), d = "", f = 0, p = !0, m = (e) => JSON.stringify(e.kind === "graph" ? [
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
	]), h = /* @__PURE__ */ F(() => t.view?.publishers.find((e) => e.id === t.view.selectedPortalId)), g = /* @__PURE__ */ F(() => !!t.view && !!H(h) && t.view.capabilities.rename && (t.view.renameMode === "presentation" ? t.view.canPresent : t.view.scope.kind === "graph" && !t.view.readOnly) && !!n().rename), _ = /* @__PURE__ */ F(() => t.view?.sources.find((e) => e.key === H(a) && e.direction === "output")), v = /* @__PURE__ */ F(() => t.view?.receivers.find((e) => e.key === H(o) && e.direction === "input" && e.kind === H(h)?.kind)), y = /* @__PURE__ */ F(() => !!H(h) && !!H(v) && (!H(v).occupied || H(c)) && C("connect") && !!n().connect), b = /* @__PURE__ */ F(() => !!H(h) && C("remove") && !!n().deletePublisher && (!t.view?.consumers.length || H(s) === "restore" || H(s) === "disconnect"));
	Cn(() => {
		let e = t.view ? JSON.stringify([
			t.view.managerKey,
			t.view.revision,
			m(t.view.scope),
			t.view.selectedPortalId,
			t.view.renameMode
		]) : "";
		d !== e && (d = e, L(r, H(h)?.label ?? "", !0), L(i, ""), L(a, t.view?.sources.find((e) => e.nodeId === H(h)?.source.nodeId && e.portId === H(h)?.source.portId)?.key ?? "", !0), L(o, ""), L(s, ""), L(c, !1), L(l, ""), L(u, ""), f++);
	}), Fi(() => {
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
	var E = Zl(), D = R(E), O = B(R(D)), k = (e) => {
		var t = Fl();
		W("click", t, () => n().close?.()), K(e, t);
	};
	J(O, (e) => {
		n().close && e(k);
	}), P(D);
	var A = B(D, 2), j = (e) => {
		var d = Yl(), f = z(d), p = R(f);
		P(f);
		var m = B(f, 2), E = B(R(m)), D = R(E);
		D.value = D.__value = "", Y(B(D), 17, () => t.view.publishers, (e) => e.id, (e, t) => {
			var n = Il(), r = R(n);
			P(n);
			var i = {};
			V(() => {
				q(r, `${H(t).label ?? ""} · ${H(t).kind ?? ""}`), i !== (i = H(t).id) && (n.value = (n.__value = H(t).id) ?? "");
			}), K(e, n);
		}), P(E);
		var O;
		gi(E), P(m);
		var k = B(m, 2), A = (e) => {
			var i = Ll(), a = z(i), o = B(R(a));
			X(o), P(a);
			var s = B(a, 2), c = R(s);
			P(s);
			var l = B(s, 2), d = R(l);
			P(l), V(() => {
				Ci(o, H(r)), o.disabled = !H(g), q(c, `${t.view.renameMode === "presentation" ? "Local workspace label · not exported" : "Authored portal label"} · ${H(h).kind ?? ""}`), d.disabled = !H(g) || !!H(u);
			}), W("input", o, (e) => {
				L(r, e.currentTarget.value, !0), w();
			}), W("click", d, () => {
				let e = H(h)?.id, i = t.view?.renameMode, a = H(r);
				e && i && n().rename && T("rename", H(g), (t) => n().rename(t, e, a, i));
			}), K(e, i);
		}, j = (e) => {
			K(e, Rl());
		};
		J(k, (e) => {
			H(h) ? e(A) : e(j, -1);
		});
		var M = B(k, 2), ee = B(R(M), 2), te = B(R(ee)), ne = R(te);
		ne.value = ne.__value = "", Y(B(ne), 17, () => t.view.sources, (e) => e.key, (e, t) => {
			var n = Il(), r = R(n);
			P(n);
			var i = {};
			V(() => {
				q(r, `${H(t).label ?? ""} · ${H(t).kind ?? ""}`), i !== (i = H(t).key) && (n.value = (n.__value = H(t).key) ?? "");
			}), K(e, n);
		}), P(te);
		var re;
		gi(te), P(ee);
		var ie = B(ee, 2), ae = B(R(ie));
		X(ae), P(ie);
		var oe = B(ie, 2), se = R(oe), ce = B(se, 2), le = B(ce, 2), ue = (e) => {
			var r = zl();
			W("click", r, () => {
				t.view && H(h) && n().jumpSource?.(x(t.view), S(H(h).source));
			}), K(e, r);
		};
		J(le, (e) => {
			H(h) && n().jumpSource && e(ue);
		}), P(oe), P(M);
		var de = B(M, 2), fe = (e) => {
			var r = Gl(), i = B(R(r), 2), a = B(R(i)), l = R(a);
			l.value = l.__value = "", Y(B(l), 17, () => t.view.receivers, (e) => e.key, (e, t) => {
				var n = Il(), r = R(n);
				P(n);
				var i = {};
				V(() => {
					q(r, `${H(t).label ?? ""}${H(t).occupied ? " · Connected" : ""}`), i !== (i = H(t).key) && (n.value = (n.__value = H(t).key) ?? "");
				}), K(e, n);
			}), P(a);
			var d;
			gi(a), P(i);
			var f = B(i, 2), p = (e) => {
				var t = Bl(), n = R(t);
				X(n), Me(), P(t), V((e) => {
					wi(n, H(c)), n.disabled = e;
				}, [() => !C("connect")]), W("change", n, (e) => {
					L(c, e.currentTarget.checked, !0), w();
				}), K(e, t);
			};
			J(f, (e) => {
				H(v)?.occupied && e(p);
			});
			var m = B(f, 2), g = R(m);
			P(m);
			var _ = B(m, 2);
			Y(_, 17, () => t.view.consumers, (e) => e.edgeId, (e, r) => {
				var i = Hl(), a = R(i), o = R(a, !0);
				P(a);
				var s = B(a), c = R(s), l = B(c, 2), d = (e) => {
					var i = Vl();
					W("click", i, () => {
						let e = t.view?.consumers.find((e) => e.edgeId === H(r).edgeId);
						t.view && e && n().jumpConsumer?.(x(t.view), e.edgeId, S(e.to));
					}), K(e, i);
				};
				J(l, (e) => {
					n().jumpConsumer && e(d);
				}), P(s), P(i), V((e) => {
					q(o, H(r).label), c.disabled = e;
				}, [() => !C("restore") || !n().restoreWire || !!H(u)]), W("click", c, () => {
					let e = t.view?.consumers.find((e) => e.edgeId === H(r).edgeId);
					e && n().restoreWire && T("restore", C("restore"), (t) => n().restoreWire(t, e.edgeId));
				}), K(e, i);
			});
			var E = B(_, 2), D = (e) => {
				K(e, Ul());
			};
			J(E, (e) => {
				t.view.consumers.length || e(D);
			});
			var O = B(E, 2), k = (e) => {
				var t = Wl(), n = B(R(t)), r = R(n);
				r.value = r.__value = "";
				var i = B(r);
				i.value = i.__value = "restore";
				var a = B(i);
				a.value = a.__value = "disconnect", P(n);
				var o;
				gi(n), P(t), V((e) => {
					n.disabled = e, o !== (o = H(s)) && (n.value = (n.__value = H(s)) ?? "", hi(n, H(s)));
				}, [() => !C("remove")]), W("change", n, (e) => {
					L(s, e.currentTarget.value, !0), w();
				}), K(e, t);
			};
			J(O, (e) => {
				t.view.consumers.length && e(k);
			});
			var A = B(O, 2), j = R(A);
			P(A), P(r), V((e) => {
				a.disabled = e, d !== (d = H(o)) && (a.value = (a.__value = H(o)) ?? "", hi(a, H(o))), g.disabled = !H(y) || !!H(u), j.disabled = !H(b) || !!H(u);
			}, [() => !C("connect") || !n().connect]), W("change", a, (e) => {
				L(o, e.currentTarget.value, !0), L(c, !1), w();
			}), W("click", g, () => {
				let e = H(v), t = H(h)?.id, r = H(c);
				e && t && n().connect && T("connect", H(y), (i) => n().connect(i, t, S(e), r));
			}), W("click", j, () => {
				let e = H(h)?.id, r = t.view?.consumers.length ? H(s) : "restore";
				e && (r === "restore" || r === "disconnect") && n().deletePublisher && T("remove", H(b), (t) => n().deletePublisher(t, e, r));
			}), K(e, r);
		};
		J(de, (e) => {
			H(h) && e(fe);
		});
		var pe = B(de, 2), me = (e) => {
			var r = Kl(), i = B(R(r)), a = R(i, !0);
			P(i);
			var o = B(i), s = R(o), c = R(s);
			P(s), P(o), P(r), V((e) => {
				q(a, t.view.conversion.label), s.disabled = e, q(c, `Convert ${t.view.conversion.kind === "wire" ? "wire" : "output"}`);
			}, [() => !C("convert") || !!H(u) || (t.view.conversion.kind === "wire" ? !n().convertWire : !n().convertOutput)]), W("click", s, () => {
				let e = t.view?.conversion;
				e?.kind === "wire" && n().convertWire ? T("convert", C("convert"), (t) => n().convertWire(t, e.edgeId)) : e?.kind === "output" && n().convertOutput && T("convert", C("convert"), (t) => n().convertOutput(t, S(e.endpoint)));
			}), K(e, r);
		};
		J(pe, (e) => {
			t.view.conversion && e(me);
		});
		var he = B(pe, 2), ge = (e) => {
			var n = ql();
			fo(R(n), { get issue() {
				return t.view.issue;
			} }), P(n), K(e, n);
		};
		J(he, (e) => {
			t.view.issue && e(ge);
		});
		var _e = B(he, 2), ve = (e) => {
			var t = ql();
			fo(R(t), { get issue() {
				return H(l);
			} }), P(t), K(e, t);
		};
		J(_e, (e) => {
			H(l) && e(ve);
		});
		var ye = B(_e, 2), be = (e) => {
			K(e, Jl());
		};
		J(ye, (e) => {
			H(u) && e(be);
		}), V((e, r, o, s) => {
			q(p, `${t.view.scopeLabel ?? ""}${t.view.readOnly ? " · Read-only graph" : ""}`), E.disabled = !n().selectPortal, O !== (O = t.view.selectedPortalId ?? "") && (E.value = (E.__value = t.view.selectedPortalId ?? "") ?? "", hi(E, t.view.selectedPortalId ?? "")), te.disabled = e, re !== (re = H(a)) && (te.value = (te.__value = H(a)) ?? "", hi(te, H(a))), Ci(ae, H(i)), ae.disabled = r, se.disabled = o, ce.disabled = s;
		}, [
			() => !C("create") && !C("retarget"),
			() => !C("create") || !n().create,
			() => !C("create") || !n().create || !H(_) || !H(i).trim() || !!H(u),
			() => !C("retarget") || !n().retarget || !H(_) || !H(h) || !!H(u)
		]), W("change", E, (e) => {
			let r = e.currentTarget.value;
			e.currentTarget.selectedIndex >= 0 && t.view && n().selectPortal && (!r || t.view.publishers.some((e) => e.id === r)) && n().selectPortal(x(t.view), r || null);
		}), W("change", te, (e) => {
			L(a, e.currentTarget.value, !0), w();
		}), W("input", ae, (e) => {
			L(i, e.currentTarget.value, !0), w();
		}), W("click", se, () => {
			let e = H(_), t = H(i);
			e && t.trim() && n().create && T("create", C("create"), (r) => n().create(r, t, S(e)));
		}), W("click", ce, () => {
			let e = H(_), t = H(h)?.id;
			e && t && n().retarget && T("retarget", C("retarget"), (r) => n().retarget(r, t, S(e)));
		}), K(e, d);
	}, M = (e) => {
		K(e, Xl());
	};
	J(A, (e) => {
		t.view ? e(j) : e(M, -1);
	}), P(E), K(e, E), We();
}
Er([
	"click",
	"change",
	"input"
]);
//#endregion
//#region ui/SubgraphSave.svelte
var $l = /* @__PURE__ */ G("<option class=\"svelte-1n658sg\"> </option>"), eu = /* @__PURE__ */ G("<div class=\"pc-save-error svelte-1n658sg\"><!></div>"), tu = /* @__PURE__ */ G("<div class=\"pc-workspace-overlay svelte-1n658sg\"><div class=\"pc-workspace-dialog pc-subgraph-save svelte-1n658sg\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Save subgraph\" tabindex=\"-1\"><header class=\"svelte-1n658sg\"><h2 class=\"svelte-1n658sg\">Save subgraph</h2><button type=\"button\" aria-label=\"Close save subgraph\" class=\"svelte-1n658sg\">×</button></header> <form class=\"svelte-1n658sg\"><label class=\"svelte-1n658sg\">Name<input aria-label=\"Subgraph name\" maxlength=\"80\" class=\"svelte-1n658sg\"/></label> <label class=\"svelte-1n658sg\">Save as<select aria-label=\"Save as\" class=\"svelte-1n658sg\"><option class=\"svelte-1n658sg\">Save new subgraph</option><!></select></label> <p class=\"svelte-1n658sg\">Edits stay local until you save. Existing placed copies stay unchanged.</p> <!> <footer class=\"svelte-1n658sg\"><button type=\"button\" class=\"svelte-1n658sg\">Cancel</button><button type=\"submit\" data-save-subgraph=\"\" class=\"svelte-1n658sg\"> </button></footer></form></div></div>");
function nu(e, t) {
	Ue(t, !0);
	let n, r = /* @__PURE__ */ I(""), i = /* @__PURE__ */ I(""), a = /* @__PURE__ */ I(!1), o = /* @__PURE__ */ I(""), s = "", c = 0;
	Cn(() => {
		if (t.view.key === s) return;
		s = t.view.key, c++, L(r, t.view.name, !0), L(i, t.view.targetId ?? "", !0), L(a, !1), L(o, "");
		let e = s;
		mr().then(() => {
			if (t.view.key === e) {
				let e = n?.querySelector("input");
				e?.focus({ preventScroll: !0 }), e?.select();
			}
		});
	}), Pi(() => {
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
			t.view.key === n && s === c && L(o, "The subgraph could not be saved. Check the current settings before trying the edit again.");
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
	var d = tu(), f = R(d), p = R(f), m = B(R(p));
	P(p);
	var h = B(p, 2), g = R(h), _ = B(R(g));
	X(_), P(g);
	var v = B(g, 2), y = B(R(v)), b = R(y);
	b.value = b.__value = "", Y(B(b), 17, () => t.view.entries, (e) => e.id, (e, t) => {
		var n = $l(), r = R(n);
		P(n);
		var i = {};
		V(() => {
			q(r, `Update ${H(t).name ?? ""}`), i !== (i = H(t).id) && (n.value = (n.__value = H(t).id) ?? "");
		}), K(e, n);
	}), P(y), P(v);
	var x = B(v, 4), S = (e) => {
		var n = eu(), r = R(n);
		{
			let e = /* @__PURE__ */ F(() => t.view.error || H(o));
			fo(r, { get issue() {
				return H(e);
			} });
		}
		P(n), K(e, n);
	};
	J(x, (e) => {
		(t.view.error || H(o)) && e(S);
	});
	var C = B(x, 2), w = R(C), T = B(w), E = R(T, !0);
	P(T), P(C), P(h), P(f), Mi(f, (e) => n = e, () => n), P(d), V((e) => {
		T.disabled = e, q(E, H(a) ? "Saving…" : "Save");
	}, [() => !t.actions || !H(r).trim() || H(a)]), U("keydown", f, u, !0), U("paste", f, (e) => e.stopPropagation()), W("click", m, () => t.actions?.close()), U("submit", h, l), Oi(_, () => H(r), (e) => L(r, e)), _i(y, () => H(i), (e) => L(i, e)), W("click", w, () => t.actions?.close()), K(e, d), We();
}
Er(["click"]);
//#endregion
//#region src/workflow/operations/json-data.js?v=0.27.0
function ru(e) {
	if (typeof e != "object" || !e) return JSON.stringify(e);
	if (Array.isArray(e)) {
		let t = "[";
		for (let n = 0; n < e.length; n++) t += `${n ? "," : ""}${ru(e[n])}`;
		return `${t}]`;
	}
	let t = "{", n = Object.keys(e);
	for (let r = 0; r < n.length; r++) {
		let i = n[r];
		t += `${r ? "," : ""}${JSON.stringify(i)}:${ru(e[i])}`;
	}
	return `${t}}`;
}
function iu(e) {
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
		if (new TextEncoder().encode(ru(t)).byteLength > 262144) throw Error("JSON byte limit exceeded.");
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
var au = (e, t) => ({
	ok: !1,
	error: {
		code: e,
		message: t
	}
}), ou = (e) => Number.isSafeInteger(e) && e >= 0, su = (e, t) => Object.hasOwn(e, t) ? e[t] : void 0, cu = (e) => typeof e == "object" && !!e && !Array.isArray(e), lu = (e) => typeof e == "string" && e.trim().length > 0 && e.length <= 256, uu = (e) => Array.isArray(e) && e.every((e) => typeof e == "string" && e.length > 0 && e.length <= 4096);
function du(e, t) {
	let n = fu(e);
	if (!n.ok) return n;
	let r = n.data, i = iu(t);
	if (!i.ok || !i.data.value || Array.isArray(i.data.value) || typeof i.data.value != "object") return au("INVALID_PROPOSAL", "Use a plain duration or destination proposal.");
	let a = i.data.value, o = su(a, "kind");
	if (o !== "duration" && o !== "destination") return au("UNRESOLVED_TIME", "An explicit duration or destination is required.");
	if (o === "duration" ? !ou(su(a, "minutes")) || Object.hasOwn(a, "absoluteMinute") : !ou(su(a, "absoluteMinute")) || Object.hasOwn(a, "minutes")) return au("INVALID_PROPOSAL", "Use one nonnegative safe-integer minute value.");
	let s = [
		"kind",
		"evidence",
		o === "duration" ? "minutes" : "absoluteMinute"
	];
	if (Object.keys(a).some((e) => !s.includes(e))) return au("INVALID_PROPOSAL", "Proposal contains ambiguous or unsupported timing fields.");
	let c = o === "destination" ? a.absoluteMinute : r.absoluteMinute + a.minutes;
	if (!ou(c) || c < r.absoluteMinute) return au("INVALID_DESTINATION", "Destination must be a forward safe-integer minute.");
	let l = mu(Object.hasOwn(a, "evidence") ? a.evidence : { kind: "explicit" });
	if (!l.ok) return l;
	let u = l.data, d = u.kind, f = structuredClone(r), p = structuredClone(u);
	return o === "duration" && r.timeEvidence?.kind === "estimate" && (p = d === "estimate" ? {
		...p,
		lineage: [.../* @__PURE__ */ new Set([...r.timeEvidence.lineage ?? [r.timeEvidence.origin], ...u.lineage ?? [u.origin]])]
	} : structuredClone(r.timeEvidence), p.lineage?.length > 64) ? au("EVIDENCE_LIMIT", "Estimate provenance exceeds 64 sources; hold the entire time projection.") : pu({
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
function fu(e) {
	let t = iu(e);
	if (!t.ok || !t.data.value || typeof t.data.value != "object" || Array.isArray(t.data.value)) return au("INVALID_CLOCK", "Clock must contain bounded own plain data.");
	let n = t.data.value;
	if (!lu(su(n, "clockId")) || !lu(su(n, "calendarId")) || !ou(su(n, "absoluteMinute")) || !ou(su(n, "dayLengthMinutes")) || n.dayLengthMinutes === 0) return au("INVALID_CLOCK", "Clock requires identities and safe-integer minute/calendar values.");
	if (Object.hasOwn(n, "schemaVersion") && n.schemaVersion !== 1) return au("INVALID_CLOCK", "Clock schema version must be 1.");
	if (Object.hasOwn(n, "revision") && (!ou(n.revision) || n.revision < 1)) return au("INVALID_CLOCK", "Clock revision must be a positive safe integer.");
	if (Object.hasOwn(n, "timeEvidence") && !mu(n.timeEvidence).ok) return au("INVALID_CLOCK", "Clock time evidence must retain accepted provenance.");
	if (Object.hasOwn(n, "settledTimeEventIds") && !uu(n.settledTimeEventIds)) return au("INVALID_CLOCK", "Settled occurrence IDs must be a bounded string array.");
	for (let [e, t] of [
		["unit", "minute"],
		["originMinute", 0],
		["originDay", 1]
	]) if (Object.hasOwn(n, e) && n[e] !== t) return au("INVALID_CALENDAR", "This calendar uses minute units with minute zero at Day 1.");
	return {
		ok: !0,
		data: n
	};
}
function pu(e) {
	let t = iu(e);
	return t.ok ? {
		ok: !0,
		data: t.data.value
	} : au("OUTPUT_LIMIT", "Projection exceeds the bounded plain-data DTO budget.");
}
function mu(e) {
	if (!cu(e)) return au("INVALID_EVIDENCE", "Evidence must be a plain record.");
	let t = su(e, "kind");
	if (![
		"explicit",
		"authored-rule",
		"validated-extraction",
		"estimate",
		"vague"
	].includes(t)) return au("INVALID_EVIDENCE", "Use a supported time evidence kind.");
	let n = t === "estimate" ? [
		"kind",
		"origin",
		"acceptancePolicy",
		"lineage"
	] : ["kind", "origin"];
	if (Object.keys(e).some((e) => !n.includes(e))) return au("INVALID_EVIDENCE", "Evidence contains unsupported or contradictory fields.");
	let r = typeof su(e, "origin") == "string" && e.origin.trim().length > 0;
	if (Object.hasOwn(e, "origin") && !r) return au("INVALID_EVIDENCE", "Evidence origin must be nonempty text.");
	if (t === "estimate" && Object.hasOwn(e, "acceptancePolicy") && !["accept", "unresolved"].includes(e.acceptancePolicy)) return au("INVALID_EVIDENCE", "Estimate acceptance policy must be accept or unresolved.");
	if (Object.hasOwn(e, "lineage")) {
		let t = e.lineage;
		if (!Array.isArray(t) || t.length === 0 || !t.every((e) => typeof e == "string" && e.trim().length > 0) || new Set(t).size !== t.length || !t.includes(e.origin)) return au("INVALID_EVIDENCE", "Estimate lineage must contain distinct nonempty text origins including the current origin.");
		if (t.length > 64) return au("EVIDENCE_LIMIT", "Estimate provenance exceeds 64 sources; hold the entire time projection.");
	}
	return t === "vague" || t === "estimate" && (!r || su(e, "acceptancePolicy") !== "accept") ? au("UNRESOLVED_TIME", "Estimated or vague time needs an explicit accepted authored rule.") : ["authored-rule", "validated-extraction"].includes(t) && !r ? au("INVALID_EVIDENCE", "Rule and extraction evidence must identify their origin.") : {
		ok: !0,
		data: e
	};
}
new TextEncoder();
//#endregion
//#region src/ui/story-document-setup.js
var hu = (e, t) => ({
	ok: !1,
	error: {
		code: e,
		message: t
	}
});
function gu(e, t, n = 0) {
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
	return du(r, {
		kind: "duration",
		minutes: 0
	}).ok ? {
		ok: !0,
		data: { text: JSON.stringify(r, null, 2) }
	} : hu("INVALID_CLOCK_TEMPLATE", "Choose explicit clock/calendar IDs and a nonnegative whole story minute.");
}
//#endregion
//#region ui/StoryDocuments.svelte
var _u = /* @__PURE__ */ G("<div class=\"svelte-1t33cem\"><!></div>"), vu = /* @__PURE__ */ G("<option class=\"svelte-1t33cem\"> </option>"), yu = /* @__PURE__ */ G("<label class=\"svelte-1t33cem\">Actor ID<input aria-label=\"Actor ID\" maxlength=\"128\" class=\"svelte-1t33cem\"/></label>"), bu = /* @__PURE__ */ G("<label class=\"svelte-1t33cem\">CSV columns, comma separated<input aria-label=\"CSV columns\" class=\"svelte-1t33cem\"/></label>"), xu = /* @__PURE__ */ G("<details class=\"svelte-1t33cem\"><summary class=\"svelte-1t33cem\">Story clock template</summary><label class=\"svelte-1t33cem\">Calendar ID<input aria-label=\"Calendar ID\" class=\"svelte-1t33cem\"/></label><label class=\"svelte-1t33cem\">Starting story minute<input aria-label=\"Starting story minute\" type=\"number\" min=\"0\" step=\"1\" class=\"svelte-1t33cem\"/></label><button type=\"button\" class=\"svelte-1t33cem\">Use story clock template</button><p class=\"svelte-1t33cem\">Midnight on the first day is minute 0. The clock advances through graph events, using explicit story time.</p></details>"), Su = /* @__PURE__ */ G("<p role=\"status\" class=\"svelte-1t33cem\"> </p>"), Cu = /* @__PURE__ */ G("<div class=\"pc-story-documents svelte-1t33cem\"><p class=\"svelte-1t33cem\"> </p> <p class=\"svelte-1t33cem\">Manage the documents used by your workflows here. Updating an authorization or its initial template leaves existing canonical document content intact. Read File and Write File use these target IDs.</p> <!> <label class=\"svelte-1t33cem\">Workflow data document<select aria-label=\"Workflow data document\" class=\"svelte-1t33cem\"><option class=\"svelte-1t33cem\">New document authorization</option><!></select></label> <div class=\"pc-document-actions svelte-1t33cem\"><button type=\"button\" class=\"svelte-1t33cem\">Load initial template</button><button type=\"button\" class=\"svelte-1t33cem\">Remove authorization</button><button type=\"button\" class=\"svelte-1t33cem\">Refresh scope</button></div> <form class=\"svelte-1t33cem\"><label class=\"svelte-1t33cem\">Logical target ID<input aria-label=\"Logical target ID\" maxlength=\"128\" placeholder=\"souls.json\" class=\"svelte-1t33cem\"/></label> <label class=\"svelte-1t33cem\">Document name<input aria-label=\"Document name\" maxlength=\"256\" class=\"svelte-1t33cem\"/></label> <label class=\"svelte-1t33cem\">Format<select aria-label=\"Document format\" class=\"svelte-1t33cem\"><option class=\"svelte-1t33cem\">JSON</option><option class=\"svelte-1t33cem\">JSON Lines</option><option class=\"svelte-1t33cem\">CSV</option><option class=\"svelte-1t33cem\">Plain text</option><option class=\"svelte-1t33cem\">Markdown</option></select></label> <label class=\"svelte-1t33cem\">Visibility<select aria-label=\"Document visibility\" class=\"svelte-1t33cem\"><option class=\"svelte-1t33cem\">Public</option><option class=\"svelte-1t33cem\">Hidden</option><option class=\"svelte-1t33cem\">Actor private</option></select></label> <!> <!> <!> <label class=\"svelte-1t33cem\">Initial template<textarea aria-label=\"Initial template\" rows=\"7\" maxlength=\"100000\" class=\"svelte-1t33cem\"></textarea></label> <p class=\"svelte-1t33cem\">JSON templates preserve your chosen object or list structure. CSV uses the named columns. Existing authorizations require explicit template loading before editing.</p> <!><!> <footer class=\"svelte-1t33cem\"><button type=\"button\" class=\"svelte-1t33cem\">Close</button><button type=\"submit\" class=\"svelte-1t33cem\"> </button></footer></form></div>");
function wu(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ I(""), r = /* @__PURE__ */ I(""), i = /* @__PURE__ */ I(""), a = /* @__PURE__ */ I("json"), o = /* @__PURE__ */ I(""), s = /* @__PURE__ */ I("public"), c = /* @__PURE__ */ I(""), l = /* @__PURE__ */ I(""), u = /* @__PURE__ */ I(!1), d = /* @__PURE__ */ I(""), f = /* @__PURE__ */ I(""), p = /* @__PURE__ */ I(!1), m = /* @__PURE__ */ I("story-calendar"), h = /* @__PURE__ */ I(0), g = "", _ = 0;
	function v() {
		L(r, ""), L(i, ""), L(a, "json"), L(o, ""), L(s, "public"), L(c, ""), L(l, ""), L(p, !1), L(d, ""), L(f, "");
	}
	Cn(() => {
		t.view.key !== g && (g = t.view.key, _++, L(u, !1), L(n, ""), v());
	});
	function y() {
		_++, L(u, !1), v();
		let e = t.view.documents.find((e) => e.targetId === H(n));
		e && (L(r, e.targetId, !0), L(i, e.name, !0), L(a, e.format, !0), L(s, e.visibility.kind, !0), L(c, e.visibility.kind === "actor-private" ? e.visibility.actorId : "", !0), L(l, e.columns?.join(", ") ?? "", !0));
	}
	function b() {
		let e = gu(H(r), H(m), H(h));
		e.ok ? (L(o, e.data.text, !0), L(d, "")) : L(d, e.error.code + ": " + e.error.message);
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
				L(d, (u?.error ? u.error.code + ": " + u.error.message : void 0) ?? "Workflow Data setup could not be applied.", !0);
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
	var S = Cu(), C = R(S), w = R(C);
	P(C);
	var T = B(C, 4), E = (e) => {
		var n = _u();
		fo(R(n), { get issue() {
			return t.view.issue;
		} }), P(n), K(e, n);
	};
	J(T, (e) => {
		t.view.issue && e(E);
	});
	var D = B(T, 2), O = B(R(D)), k = R(O);
	k.value = k.__value = "", Y(B(k), 17, () => t.view.documents, (e) => e.targetId, (e, t) => {
		var n = vu(), r = R(n);
		P(n);
		var i = {};
		V(() => {
			q(r, `${H(t).name ?? ""} (${H(t).targetId ?? ""}, ${H(t).format ?? ""}, ${H(t).visibility.kind ?? ""})`), i !== (i = H(t).targetId) && (n.value = (n.__value = H(t).targetId) ?? "");
		}), K(e, n);
	}), P(O), P(D);
	var A = B(D, 2), j = R(A), M = B(j), ee = B(M);
	P(A);
	var te = B(A, 2), ne = R(te), re = B(R(ne));
	X(re), P(ne);
	var ie = B(ne, 2), ae = B(R(ie));
	X(ae), P(ie);
	var oe = B(ie, 2), se = B(R(oe)), ce = R(se);
	ce.value = ce.__value = "json";
	var le = B(ce);
	le.value = le.__value = "jsonl";
	var ue = B(le);
	ue.value = ue.__value = "csv";
	var de = B(ue);
	de.value = de.__value = "text";
	var fe = B(de);
	fe.value = fe.__value = "markdown", P(se), P(oe);
	var pe = B(oe, 2), me = B(R(pe)), he = R(me);
	he.value = he.__value = "public";
	var ge = B(he);
	ge.value = ge.__value = "hidden";
	var _e = B(ge);
	_e.value = _e.__value = "actor-private", P(me), P(pe);
	var ve = B(pe, 2), ye = (e) => {
		var t = yu(), n = B(R(t));
		X(n), P(t), V(() => n.disabled = H(u)), Oi(n, () => H(c), (e) => L(c, e)), K(e, t);
	};
	J(ve, (e) => {
		H(s) === "actor-private" && e(ye);
	});
	var be = B(ve, 2), xe = (e) => {
		var t = bu(), n = B(R(t));
		X(n), P(t), V(() => n.disabled = H(u)), Oi(n, () => H(l), (e) => L(l, e)), K(e, t);
	};
	J(be, (e) => {
		H(a) === "csv" && e(xe);
	});
	var Se = B(be, 2), Ce = (e) => {
		var t = xu(), i = B(R(t)), a = B(R(i));
		X(a), P(i);
		var o = B(i), s = B(R(o));
		X(s), P(o);
		var c = B(o);
		Me(), P(t), V((e) => {
			a.disabled = H(u), s.disabled = H(u), c.disabled = e;
		}, [() => !H(r).trim() || H(u) || !!H(n) && !H(p)]), Oi(a, () => H(m), (e) => L(m, e)), Oi(s, () => H(h), (e) => L(h, e)), W("click", c, b), K(e, t);
	};
	J(Se, (e) => {
		H(a) === "json" && e(Ce);
	});
	var we = B(Se, 2), Te = B(R(we));
	at(Te), P(we);
	var Ee = B(we, 4), De = (e) => {
		var t = _u();
		fo(R(t), { get issue() {
			return H(d);
		} }), P(t), K(e, t);
	};
	J(Ee, (e) => {
		H(d) && e(De);
	});
	var N = B(Ee), Oe = (e) => {
		var n = Su(), r = R(n, !0);
		P(n), V(() => q(r, H(f) || t.view.notice)), K(e, n);
	};
	J(N, (e) => {
		(H(f) || t.view.notice) && e(Oe);
	});
	var ke = B(N, 2), Ae = R(ke), je = B(Ae), Ne = R(je, !0);
	P(je), P(ke), P(te), P(S), V((e) => {
		q(w, `Active user: ${(t.view.scope.userId || "Unavailable") ?? ""} · Chat: ${(t.view.scope.chatId || "Unavailable") ?? ""}`), O.disabled = H(u), j.disabled = !H(n) || H(u), M.disabled = !H(n) || H(u), ee.disabled = H(u), re.disabled = !!H(n) || H(u), ae.disabled = H(u), se.disabled = !!H(n) || H(u), me.disabled = H(u), Te.disabled = H(u) || !!H(n) && !H(p), Z(Te, "placeholder", H(a) === "json" ? "[]" : ""), je.disabled = e, q(Ne, H(u) ? "Saving…" : "Save authorization");
	}, [() => !t.actions || !t.view.key || !H(r).trim() || !H(i).trim() || H(u) || !!H(n) && !H(p) || H(s) === "actor-private" && !H(c).trim()]), W("change", O, y), _i(O, () => H(n), (e) => L(n, e)), W("click", j, () => x("load")), W("click", M, () => x("remove")), W("click", ee, () => t.actions?.refresh()), U("submit", te, (e) => {
		e.preventDefault(), x("save");
	}), Oi(re, () => H(r), (e) => L(r, e)), Oi(ae, () => H(i), (e) => L(i, e)), _i(se, () => H(a), (e) => L(a, e)), _i(me, () => H(s), (e) => L(s, e)), Oi(Te, () => H(o), (e) => L(o, e)), W("click", Ae, function(...e) {
		t.close?.apply(this, e);
	}), K(e, S), We();
}
Er(["change", "click"]);
//#endregion
//#region ui/RecallOverview.svelte
var Tu = /* @__PURE__ */ G("<p aria-label=\"Recall scope\" class=\"svelte-ejm25z\"> </p>"), Eu = /* @__PURE__ */ G("<div><!></div>"), Du = /* @__PURE__ */ G("<p class=\"svelte-ejm25z\">Add a Recall Shortcut to the open unified workflow for the active character. Configure its actor, memory set and policy in Details, then enable Lattice.</p>"), Ou = /* @__PURE__ */ G("<p class=\"svelte-ejm25z\"> </p>"), ku = /* @__PURE__ */ G("<li><button type=\"button\"> </button></li>"), Au = /* @__PURE__ */ G("<fieldset class=\"svelte-ejm25z\"><legend class=\"svelte-ejm25z\"> </legend><p role=\"status\" class=\"svelte-ejm25z\"> </p> <p class=\"svelte-ejm25z\"> </p> <!> <!> <!> <div class=\"pc-recall-overview-actions svelte-ejm25z\"><button type=\"button\" data-recall-queue=\"\">Queue recall</button><button type=\"button\">Cancel recall</button></div> <!><!> <ul aria-label=\"Matching nodes\"></ul> <small class=\"svelte-ejm25z\"> </small></fieldset>"), ju = /* @__PURE__ */ G("<p class=\"svelte-ejm25z\">Queue a memory set for the next reply, generated swipe, or both. Matching nodes share one request.</p> <!> <!> <!> <!> <p class=\"svelte-ejm25z\"><button type=\"button\">Refresh recall state</button></p> <small class=\"svelte-ejm25z\">Shortcuts use physical keys and pause while typing. Automatic Recall uses its own conditions. Queue and Cancel do not generate a reply.</small>", 1);
function Mu(e, t) {
	let n = Rr();
	Ue(t, !0);
	let r = /* @__PURE__ */ I(""), i = /* @__PURE__ */ I("");
	async function a(e, n, a) {
		if (!H(r)) {
			L(r, e, !0), L(i, "");
			try {
				let e = await t.actions?.change(n, a, "all");
				e?.ok !== !0 && L(i, (e?.error ? e.error.code + ": " + e.error.message : void 0) ?? "Memory recall is unavailable.", !0);
			} catch {
				L(i, "Memory recall could not be updated.");
			} finally {
				L(r, "");
			}
		}
	}
	var o = ju(), s = B(z(o), 2), c = (e) => {
		var n = Tu(), r = R(n);
		P(n), V(() => q(r, `User ${t.view.scope.userId ?? ""} · Chat ${t.view.scope.chatId ?? ""} · Actor ${t.view.scope.actorId ?? ""}`)), K(e, n);
	};
	J(s, (e) => {
		t.view?.scope && e(c);
	});
	var l = B(s, 2), u = (e) => {
		var n = Eu(), r = R(n);
		{
			let e = /* @__PURE__ */ F(() => H(i) || t.view?.issue);
			fo(r, { get issue() {
				return H(e);
			} });
		}
		P(n), K(e, n);
	};
	J(l, (e) => {
		(t.view?.issue || H(i)) && e(u);
	});
	var d = B(l, 2), f = (e) => {
		K(e, Du());
	};
	J(d, (e) => {
		t.view?.sets.length || e(f);
	});
	var p = B(d, 2);
	Y(p, 17, () => t.view?.sets ?? [], (e) => e.memorySetId, (e, i) => {
		let o = /* @__PURE__ */ F(() => H(r) ? "Wait for the Recall change to finish." : t.actions ? H(i).queueAllowed ? "" : H(i).reason || "Recall is already queued." : "Recall actions are unavailable in this workspace."), s = /* @__PURE__ */ F(() => H(r) ? "Wait for the Recall change to finish." : t.actions ? H(i).cancelAllowed ? "" : "No recall is queued to cancel." : "Recall actions are unavailable in this workspace.");
		var c = Au(), l = R(c), u = R(l, !0);
		P(l);
		var d = B(l), f = R(d, !0);
		P(d);
		var p = B(d, 2), m = R(p);
		P(p);
		var h = B(p, 2), g = (e) => {
			var t = Ou(), n = R(t);
			P(t), V(() => q(n, `Remaining: ${H(i).remainingText ?? ""}`)), K(e, t);
		};
		J(h, (e) => {
			H(i).queued && e(g);
		});
		var _ = B(h, 2), v = (e) => {
			var t = Ou(), n = R(t);
			P(t), V(() => q(n, `Pending generations: ${H(i).pendingCount ?? ""}`)), K(e, t);
		};
		J(_, (e) => {
			H(i).pendingCount && e(v);
		});
		var y = B(_, 2), b = (e) => {
			var t = Ou(), n = R(t, !0);
			P(t), V(() => q(n, H(i).reason)), K(e, t);
		};
		J(y, (e) => {
			H(i).reason && H(i).reason !== H(o) && e(b);
		});
		var x = B(y, 2), S = R(x), C = B(S);
		P(x);
		var w = B(x, 2), T = (e) => {
			var t = Ou(), r = R(t, !0);
			P(t), V(() => {
				Z(t, "id", n + "-queue-" + H(i).memorySetId), q(r, H(o));
			}), K(e, t);
		};
		J(w, (e) => {
			H(o) && e(T);
		});
		var E = B(w), D = (e) => {
			var t = Ou(), r = R(t, !0);
			P(t), V(() => {
				Z(t, "id", n + "-cancel-" + H(i).memorySetId), q(r, H(s));
			}), K(e, t);
		};
		J(E, (e) => {
			H(s) && e(D);
		});
		var O = B(E, 2);
		Y(O, 21, () => H(i).linkedNodes, (e) => e.nodeId, (e, n) => {
			var r = ku(), i = R(r), a = R(i);
			P(i), P(r), V(() => {
				i.disabled = !t.actions, q(a, `${H(n).title ?? ""} · ${H(n).nodeId ?? ""}`);
			}), W("click", i, () => t.actions?.reveal(H(n).nodeId)), K(e, r);
		}), P(O);
		var k = B(O, 2), A = R(k);
		P(k), P(c), V((e) => {
			Z(c, "data-recall-set", H(i).memorySetId), q(u, H(i).memorySetId), q(f, H(i).statusText), q(m, `${H(i).targetLabel ?? ""} · ${H(i).useLabel ?? ""} · ${H(i).consumeLabel ?? ""}`), S.disabled = !!H(r) || !t.actions || !H(i).queueAllowed, Z(S, "aria-label", "Queue recall " + H(i).memorySetId), Z(S, "aria-describedby", H(o) ? n + "-queue-" + H(i).memorySetId : void 0), C.disabled = !!H(r) || !t.actions || !H(i).cancelAllowed, Z(C, "aria-label", "Cancel recall " + H(i).memorySetId), Z(C, "aria-describedby", H(s) ? n + "-cancel-" + H(i).memorySetId : void 0), q(A, `${H(i).nodeIds.length ?? ""} linked ${H(i).nodeIds.length === 1 ? "node" : "nodes"}${e ?? ""}`);
		}, [() => H(i).hotkeys.length ? " · " + H(i).hotkeys.map((e) => e.label).join(", ") : ""]), W("click", S, () => a(H(i).memorySetId, H(i).nodeIds, "queue")), W("click", C, () => a(H(i).memorySetId, H(i).nodeIds, "cancel")), K(e, c);
	});
	var m = B(p, 2), h = R(m);
	P(m), Me(2), V(() => h.disabled = !!H(r) || !t.actions), W("click", h, () => t.actions?.refresh()), K(e, o), We();
}
Er(["click"]);
//#endregion
//#region ui/ConfigureNode.svelte
var Nu = /* @__PURE__ */ G("<option class=\"svelte-1srbsqt\"> </option>"), Pu = /* @__PURE__ */ G("<p class=\"svelte-1srbsqt\">Authorize a document in Workflow › Configure › Workflow Data, then reopen node creation.</p>"), Fu = /* @__PURE__ */ G("<label class=\"svelte-1srbsqt\">Workflow data document<select aria-label=\"Workflow data document\" class=\"svelte-1srbsqt\"><option class=\"svelte-1srbsqt\">Choose an authorized target</option><!></select></label><!>", 1), Iu = /* @__PURE__ */ G("<label class=\"svelte-1srbsqt\">Pinned Data helper<select aria-label=\"Pinned Data helper\" class=\"svelte-1srbsqt\"><option class=\"svelte-1srbsqt\">Choose an existing item/result helper</option><!></select></label><p class=\"svelte-1srbsqt\">Helpers use exact pinned versions with Data item and result ports. Set iteration mode and requestBoundPerIteration in the controls below.</p>", 1), Lu = /* @__PURE__ */ G("<div class=\"svelte-1srbsqt\"><!></div>"), Ru = /* @__PURE__ */ G("<div class=\"pc-workspace-overlay svelte-1srbsqt\"><div class=\"pc-workspace-dialog pc-configure-node svelte-1srbsqt\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Configure node\" tabindex=\"-1\"><header class=\"svelte-1srbsqt\"><h2 class=\"svelte-1srbsqt\"> </h2><button type=\"button\" aria-label=\"Close node configuration\" class=\"svelte-1srbsqt\">×</button></header> <p class=\"svelte-1srbsqt\">Complete the required settings before creating the node. Cancel leaves the graph unchanged.</p> <form class=\"svelte-1srbsqt\"><label class=\"svelte-1srbsqt\">Stage<select aria-label=\"Node stage\" class=\"svelte-1srbsqt\"><option class=\"svelte-1srbsqt\">Preparation</option><option class=\"svelte-1srbsqt\">Response</option></select></label> <!> <!> <label class=\"svelte-1srbsqt\">Declared node controls<textarea aria-label=\"Node controls JSON\" rows=\"14\" maxlength=\"200000\" class=\"svelte-1srbsqt\"></textarea></label> <!> <footer class=\"svelte-1srbsqt\"><button type=\"button\" class=\"svelte-1srbsqt\">Cancel</button><button type=\"submit\" class=\"svelte-1srbsqt\"> </button></footer></form></div></div>");
function zu(e, t) {
	Ue(t, !0);
	let n, r = /* @__PURE__ */ I(""), i = /* @__PURE__ */ I("pre"), a = /* @__PURE__ */ I(""), o = /* @__PURE__ */ I(""), s = /* @__PURE__ */ I(!1), c = /* @__PURE__ */ I(""), l = "", u = 0, d = /* @__PURE__ */ F(() => t.view.operation === "read-file" || t.view.operation === "story-clock" || t.view.operation === "commit-outcomes");
	Cn(() => {
		if (t.view.key === l) return;
		l = t.view.key, u++, L(r, t.view.controls, !0), L(i, t.view.phase, !0), L(s, !1), L(c, "");
		try {
			let e = JSON.parse(H(r));
			L(a, e.targetId ?? e.clockId ?? "", !0), L(o, t.view.helpers.find((t) => JSON.stringify(t.ref) === JSON.stringify(e.helper))?.key ?? "", !0);
		} catch {
			L(a, ""), L(o, "");
		}
		let e = l;
		mr().then(() => {
			t.view.key === e && n?.querySelector("select,textarea,input")?.focus({ preventScroll: !0 });
		});
	}), Pi(() => {
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
			n === t.view.key && a === u && !e?.ok && L(c, (e?.error ? e.error.code + ": " + e.error.message : void 0) ?? "The node could not be prepared.", !0);
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
	var h = Ru(), g = R(h), _ = R(g), v = R(_), y = R(v);
	P(v);
	var b = B(v);
	P(_);
	var x = B(_, 4), S = R(x), C = B(R(S)), w = R(C);
	w.value = w.__value = "pre";
	var T = B(w);
	T.value = T.__value = "post", P(C), P(S);
	var E = B(S, 2), D = (e) => {
		var n = Fu(), r = z(n), i = B(R(r)), o = R(i);
		o.value = o.__value = "", Y(B(o), 17, () => t.view.targets.filter((e) => !["story-clock", "commit-outcomes"].includes(t.view.operation) || e.format === "json"), (e) => e.targetId, (e, t) => {
			var n = Nu(), r = R(n);
			P(n);
			var i = {};
			V(() => {
				q(r, `${H(t).name ?? ""} (${H(t).targetId ?? ""})`), i !== (i = H(t).targetId) && (n.value = (n.__value = H(t).targetId) ?? "");
			}), K(e, n);
		}), P(i), P(r);
		var c = B(r), l = (e) => {
			K(e, Pu());
		};
		J(c, (e) => {
			t.view.targets.length || e(l);
		}), V(() => i.disabled = H(s)), W("change", i, () => f(t.view.operation === "story-clock" ? "clockId" : "targetId", H(a))), _i(i, () => H(a), (e) => L(a, e)), K(e, n);
	};
	J(E, (e) => {
		H(d) && e(D);
	});
	var O = B(E, 2), k = (e) => {
		var n = Iu(), r = z(n), i = B(R(r)), a = R(i);
		a.value = a.__value = "", Y(B(a), 17, () => t.view.helpers, (e) => e.key, (e, t) => {
			var n = Nu(), r = R(n);
			P(n);
			var i = {};
			V(() => {
				q(r, `${H(t).label ?? ""}${H(t).stateful ? " (projected state)" : ""}`), i !== (i = H(t).key) && (n.value = (n.__value = H(t).key) ?? "");
			}), K(e, n);
		}), P(i), P(r), Me(), V(() => i.disabled = H(s)), W("change", i, () => {
			let e = t.view.helpers.find((e) => e.key === H(o));
			e && f("helper", e.ref);
		}), _i(i, () => H(o), (e) => L(o, e)), K(e, n);
	};
	J(O, (e) => {
		t.view.operation === "for-each" && e(k);
	});
	var A = B(O, 2), j = B(R(A));
	at(j), P(A);
	var M = B(A, 2), ee = (e) => {
		var t = Lu();
		fo(R(t), { get issue() {
			return H(c);
		} }), P(t), K(e, t);
	};
	J(M, (e) => {
		H(c) && e(ee);
	});
	var te = B(M, 2), ne = R(te), re = B(ne), ie = R(re, !0);
	P(re), P(te), P(x), P(g), Mi(g, (e) => n = e, () => n), P(h), V(() => {
		q(y, `Configure ${t.view.title ?? ""}`), C.disabled = t.view.phaseLocked || H(s), j.disabled = H(s), re.disabled = !t.actions || H(s), q(ie, H(s) ? "Preparing…" : "Create node");
	}), U("keydown", g, m, !0), U("paste", g, (e) => e.stopPropagation()), W("click", b, () => t.actions?.cancel(t.view.key)), U("submit", x, p), _i(C, () => H(i), (e) => L(i, e)), Oi(j, () => H(r), (e) => L(r, e)), W("click", ne, () => t.actions?.cancel(t.view.key)), K(e, h), We();
}
Er(["click", "change"]);
//#endregion
//#region ui/DocumentPrompt.svelte
var Bu = /* @__PURE__ */ G("<p class=\"svelte-ppe66w\">Save keeps these changes in the current file. Don't Save continues and discards the unsaved changes to this document. Cancel keeps this document open.</p>"), Vu = /* @__PURE__ */ G("<p class=\"svelte-ppe66w\">Save As creates a JSON copy of this workflow. To switch documents after saving, repeat the action and choose Don't Save. Don't Save discards unsaved changes; Cancel keeps this document open.</p>"), Hu = /* @__PURE__ */ G("<div class=\"pc-workspace-overlay\"><div class=\"pc-workspace-dialog pc-document-prompt svelte-ppe66w\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Save workflow changes?\" tabindex=\"-1\"><h2 class=\"svelte-ppe66w\">Save workflow changes?</h2> <p class=\"svelte-ppe66w\"><strong class=\"svelte-ppe66w\"> </strong> has unsaved changes.</p> <!> <footer class=\"svelte-ppe66w\"><button type=\"button\" class=\"svelte-ppe66w\"> </button><button type=\"button\" class=\"svelte-ppe66w\">Don't Save</button><button type=\"button\" class=\"svelte-ppe66w\">Cancel</button></footer></div></div>");
function Uu(e, t) {
	Ue(t, !0);
	let n = Ni(t, "native", 3, !0), r, i;
	Pi(() => {
		let e = document.activeElement;
		return i.focus({ preventScroll: !0 }), () => e?.focus({ preventScroll: !0 });
	});
	function a(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), t.actions?.choose("cancel")), e.key === "Tab") {
			let t = [...r.querySelectorAll("button:not(:disabled)")], n = t.indexOf(document.activeElement);
			e.shiftKey && n <= 0 && (e.preventDefault(), t.at(-1)?.focus()), !e.shiftKey && (n < 0 || n === t.length - 1) && (e.preventDefault(), t[0]?.focus());
		}
	}
	var o = Hu(), s = R(o), c = B(R(s), 2), l = R(c), u = R(l, !0);
	P(l), Me(), P(c);
	var d = B(c, 2), f = (e) => {
		K(e, Bu());
	}, p = (e) => {
		K(e, Vu());
	};
	J(d, (e) => {
		n() ? e(f) : e(p, -1);
	});
	var m = B(d, 2), h = R(m), g = R(h, !0);
	P(h);
	var _ = B(h), v = B(_);
	Mi(v, (e) => i = e, () => i), P(m), P(s), Mi(s, (e) => r = e, () => r), P(o), V(() => {
		q(u, t.view.name), q(g, n() ? "Save" : "Save As…");
	}), U("keydown", s, a, !0), U("paste", s, (e) => e.stopPropagation(), !0), W("click", h, () => t.actions?.choose("save")), W("click", _, () => t.actions?.choose("discard")), W("click", v, () => t.actions?.choose("cancel")), K(e, o), We();
}
Er(["click"]);
//#endregion
//#region ui/NodeSearch.svelte
var Wu = /* @__PURE__ */ G("<label class=\"pc-context-check svelte-golf61\"><input type=\"checkbox\" class=\"svelte-golf61\"/>Context sensitive</label>"), Gu = /* @__PURE__ */ G("<span class=\"pc-search-context svelte-golf61\"> </span>"), Ku = /* @__PURE__ */ G("<label class=\"pc-search-field svelte-golf61\"><input type=\"search\" aria-label=\"Search nodes and subgraphs\" placeholder=\"Search…\" autocomplete=\"off\" role=\"combobox\" aria-expanded=\"true\" class=\"svelte-golf61\"/></label> <!> <!>", 1), qu = /* @__PURE__ */ G("<p class=\"pc-search-context svelte-golf61\">Choose the named port to connect.</p>"), Ju = /* @__PURE__ */ G("<small style=\"display:block;white-space:normal\"> </small>"), Yu = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-search-result svelte-golf61\" role=\"option\"><span class=\"svelte-golf61\"> <!></span> <span class=\"pc-family svelte-golf61\"> </span></button>"), Xu = /* @__PURE__ */ G("<p class=\"pc-empty svelte-golf61\"> </p>"), Zu = /* @__PURE__ */ G("<p class=\"pc-feedback svelte-golf61\" role=\"status\"> </p>"), Qu = /* @__PURE__ */ G("<div class=\"pc-node-search svelte-golf61\" role=\"dialog\" aria-modal=\"false\" tabindex=\"-1\"><!> <div class=\"pc-search-results svelte-golf61\" role=\"listbox\"></div> <!></div>");
function $u(e, t) {
	let n = Rr();
	Ue(t, !0);
	let r = Ni(t, "view", 3, null), i = Ni(t, "actions", 19, () => ({})), a = /* @__PURE__ */ I(void 0), o = /* @__PURE__ */ I(void 0), s = /* @__PURE__ */ I(""), c = /* @__PURE__ */ I(0), l = /* @__PURE__ */ I(8), u = /* @__PURE__ */ I(8), d, f, p = (e) => [
		e.label,
		e.family,
		e.purpose ?? "",
		e.shortcode ?? "",
		...e.searchAliases ?? []
	].join(" ").toLocaleLowerCase(), m = /* @__PURE__ */ F(() => (r()?.choices ?? []).filter((e) => p(e).includes(H(s).toLocaleLowerCase().trim()))), h = /* @__PURE__ */ F(() => r()?.mode === "ports" ? r().ports : H(m)), g = (e) => "id" in e ? e.id : e.portId, _ = (e) => !!r()?.readOnly || "disabledReason" in e && !!e.disabledReason, v = /* @__PURE__ */ F(() => H(h).filter((e) => !_(e))), y = /* @__PURE__ */ F(() => H(v)[Math.min(H(c), Math.max(0, H(v).length - 1))]), b = (e) => ({
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
	Cn(() => {
		let e = r()?.key, t = r()?.mode, n = r()?.screenAnchor;
		if (e === void 0 || !n) return;
		let i = d !== e || f !== t;
		d !== e && L(s, ""), i && L(c, 0), d = e, f = t, mr().then(() => {
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
	Cn(() => {
		if (!r()) return;
		let e = (e) => {
			H(a) && !H(a).contains(e.target) && i().dismiss?.();
		};
		return window.addEventListener("pointerdown", e, !0), () => window.removeEventListener("pointerdown", e, !0);
	});
	var T = Lr();
	U("resize", an, x);
	var E = z(T), D = (e) => {
		var t = Qu();
		let i;
		var d = R(t), f = (e) => {
			var t = Ku(), i = z(t), a = R(i);
			X(a), Mi(a, (e) => L(o, e), () => H(o)), P(i);
			var l = B(i, 2), u = (e) => {
				var t = Wu(), n = R(t);
				X(n), Me(), P(t), V(() => {
					wi(n, r().contextSensitive), n.disabled = r().readOnly;
				}), W("change", n, C), K(e, t);
			};
			J(l, (e) => {
				r().origin && e(u);
			});
			var d = B(l, 2), f = (e) => {
				var t = Gu(), n = R(t, !0);
				P(t), V(() => q(n, (r().origin.dir === "out" ? "Accepts " : "Produces ") + r().origin.kind)), K(e, t);
			};
			J(d, (e) => {
				r().origin && e(f);
			}), V((e) => {
				Z(a, "aria-controls", n + "-results"), Z(a, "aria-activedescendant", e);
			}, [() => H(y) ? n + "-item-" + H(h).indexOf(H(y)) : void 0]), W("input", a, () => L(c, 0)), Oi(a, () => H(s), (e) => L(s, e)), K(e, t);
		}, p = (e) => {
			K(e, qu());
		};
		J(d, (e) => {
			r().mode === "nodes" ? e(f) : e(p, -1);
		});
		var m = B(d, 2);
		Y(m, 21, () => H(h), (e) => g(e), (e, t) => {
			var r = Yu(), i = R(r), a = R(i, !0), o = B(a), s = (e) => {
				var n = Ju(), r = R(n, !0);
				P(n), V(() => q(r, H(t).disabledReason)), K(e, n);
			};
			J(o, (e) => {
				"disabledReason" in H(t) && H(t).disabledReason && e(s);
			}), P(i);
			var l = B(i, 1, !0);
			l.nodeValue = " ";
			var u = B(l);
			let d;
			var f = R(u, !0);
			P(u), P(r), V((e, n, i, o) => {
				Z(r, "aria-selected", H(y) === H(t)), Z(r, "id", e), Z(r, "data-choice", "id" in H(t) ? H(t).id : void 0), Z(r, "data-port", "portId" in H(t) ? H(t).portId : void 0), r.disabled = n, Z(r, "title", "disabledReason" in H(t) ? H(t).disabledReason : void 0), q(a, i), d = mi(u, "", d, o), q(f, "family" in H(t) ? H(t).family : H(t).kind);
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
			var t = Xu(), n = R(t, !0);
			P(t), V((e) => q(n, e), [() => r().mode === "ports" ? "This node has no compatible ports for this connection." : r().contextSensitive && r().origin ? "No compatible nodes match. Clear the search or turn off Context sensitive to browse all nodes." : H(s).trim() ? "No nodes match your search. Try another name or clear the search." : "No nodes are available in this view."]), K(e, t);
		}), P(m);
		var x = B(m, 2), T = (e) => {
			var t = Zu(), n = R(t, !0);
			P(t), V(() => q(n, r().feedback)), K(e, t);
		};
		J(x, (e) => {
			r().feedback && e(T);
		}), P(t), Mi(t, (e) => L(a, e), () => H(a)), V(() => {
			Z(t, "aria-label", r().mode === "ports" ? "Choose connection port" : "Add node"), i = mi(t, "", i, {
				left: `${H(l) ?? ""}px`,
				top: `${H(u) ?? ""}px`
			}), Z(m, "id", n + "-results"), Z(m, "aria-label", r().mode === "ports" ? "Compatible ports" : "Nodes and subgraphs");
		}), W("keydown", t, w), K(e, t);
	};
	J(E, (e) => {
		r() && e(D);
	}), K(e, T), We();
}
Er([
	"keydown",
	"input",
	"change",
	"click"
]);
//#endregion
//#region ui/PinMenu.svelte
var ed = /* @__PURE__ */ G("<p class=\"pc-kind svelte-i73q0t\"> </p>"), td = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-pin-action svelte-i73q0t\"> </button><!>", 1), nd = /* @__PURE__ */ G("<p class=\"pc-empty svelte-i73q0t\">No attached links.</p>"), rd = /* @__PURE__ */ G("<div class=\"pc-pin-menu svelte-i73q0t\" role=\"dialog\" aria-label=\"Pin actions\" aria-modal=\"false\" tabindex=\"-1\"><div class=\"pc-menu-head svelte-i73q0t\"><h2 class=\"svelte-i73q0t\"> </h2><button type=\"button\" aria-label=\"Close pin actions\" class=\"svelte-i73q0t\">Close</button></div> <p class=\"pc-kind svelte-i73q0t\"> </p> <!></div>");
function id(e, t) {
	let n = Rr();
	Ue(t, !0);
	let r = Ni(t, "view", 3, null), i = Ni(t, "actions", 19, () => ({})), a = /* @__PURE__ */ I(void 0), o = /* @__PURE__ */ I(8), s = /* @__PURE__ */ I(8), c, l = (e) => !!e.disabled || !!r()?.readOnly && e.capability !== "navigation";
	function u() {
		if (!r() || !H(a)) return;
		let e = H(a).getBoundingClientRect(), t = document.documentElement.clientWidth || window.innerWidth, n = document.documentElement.clientHeight || window.innerHeight;
		L(o, Math.max(8, Math.min(r().screenAnchor.x, t - e.width - 8)), !0), L(s, Math.max(8, Math.min(r().screenAnchor.y, n - e.height - 8)), !0);
	}
	Cn(() => {
		let e = r()?.key, t = r()?.screenAnchor;
		if (e === void 0 || !t) return;
		let n = c !== e;
		c = e, mr().then(() => {
			r()?.key === e && (u(), n && (H(a)?.querySelector("[data-entry]:not(:disabled)") ?? H(a))?.focus());
		});
	});
	function d(e) {
		r() && !l(e) && i().pick?.(e.id);
	}
	function f(e) {
		if (e.stopPropagation(), e.key === "Escape") {
			e.preventDefault(), i().dismiss?.();
			return;
		}
		let t = [...H(a)?.querySelectorAll("[data-entry]:not(:disabled)") ?? []], n = t.indexOf(document.activeElement);
		if ([
			"ArrowDown",
			"ArrowUp",
			"Home",
			"End"
		].includes(e.key)) e.preventDefault(), t[e.key === "Home" ? 0 : e.key === "End" ? t.length - 1 : (n + (e.key === "ArrowDown" ? 1 : -1) + t.length) % t.length]?.focus();
		else if (e.key === "Enter") {
			let t = r()?.entries.find((e) => e.id === document.activeElement?.dataset.entry);
			t && (e.preventDefault(), d(t));
		}
	}
	var p = Lr();
	U("resize", an, u);
	var m = z(p), h = (e) => {
		var t = rd();
		let c;
		var u = R(t), p = R(u), m = R(p, !0);
		P(p);
		var h = B(p);
		P(u);
		var g = B(u, 2), _ = R(g);
		P(g), Y(B(g, 2), 17, () => r().entries, (e) => e.id, (e, t) => {
			var r = td(), i = z(r), a = R(i, !0);
			P(i);
			var o = B(i), s = (e) => {
				var r = ed(), i = R(r, !0);
				P(r), V(() => {
					Z(r, "id", n + "-reason-" + H(t).id), q(i, H(t).reason);
				}), K(e, r);
			};
			J(o, (e) => {
				H(t).reason && e(s);
			}), V((e) => {
				Z(i, "data-entry", H(t).id), i.disabled = e, Z(i, "aria-describedby", H(t).reason ? n + "-reason-" + H(t).id : void 0), q(a, H(t).label);
			}, [() => l(H(t))]), W("click", i, () => d(H(t))), K(e, r);
		}, (e) => {
			K(e, nd());
		}), P(t), Mi(t, (e) => L(a, e), () => H(a)), V(() => {
			c = mi(t, "", c, {
				left: `${H(o) ?? ""}px`,
				top: `${H(s) ?? ""}px`
			}), q(m, r().title), q(_, `${r().kind ?? ""}${r().readOnly ? " · Read only" : ""}`);
		}), W("keydown", t, f), W("click", h, () => i().dismiss?.()), K(e, t);
	};
	J(m, (e) => {
		r() && e(h);
	}), K(e, p), We();
}
Er(["keydown", "click"]);
//#endregion
//#region src/ui/node-palette.js
var ad = "M3 7 12 2l9 5v10l-9 5-9-5ZM3 7l9 5 9-5M12 12v10", od = "M3 6l4-2 4 2v5l-4 2-4-2ZM3 6l4 2 4-2M7 8v5M13 6l4-2 4 2v5l-4 2-4-2ZM13 6l4 2 4-2M17 8v5M8 15l4-2 4 2v5l-4 2-4-2ZM8 15l4 2 4-2M12 17v5", sd = Object.freeze([
	{
		name: "Input",
		color: "#96ad52",
		icon: ad
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
		icon: ad
	},
	{
		name: "Subgraphs",
		color: "#a3aa99",
		icon: od
	}
].map((e) => Object.freeze(e))), cd = {
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
	Library: od,
	Routing: "M3 12h18m-7-7 7 7-7 7",
	Blocks: ad,
	Reflect: "M21 12s-4-7-9-7-9 7-9 7 4 7 9 7 9-7 9-7ZM15 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0",
	Internalize: "M4 4h16v16H4M8 8l4 4 4-4M12 12v5",
	Express: "M4 4h16v12H9l-5 4ZM8 8h8M8 12h5",
	Memory: "M5 3h14v18H5ZM8 7h8M8 11h8M8 15h5",
	State: "M3 12h4l3-7 4 14 3-7h4"
}, ld = Object.freeze(Object.fromEntries(Object.entries(cd).map(([e, t]) => [e, Object.freeze({
	name: e,
	icon: t
})]))), ud = {
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
		"M8 3h13v13h-8l-5 5v-7M2 8h12m-3-3 3 3-3 3"
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
		cd.Planning
	],
	compose: [
		"Assembly",
		"co",
		cd.Assembly
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
		cd.Validation
	],
	"json-decode": [
		"Parsing",
		"jd",
		cd.Parsing
	],
	"select-fields": [
		"Extraction",
		"sf",
		cd.Extraction
	],
	guidance: [
		"Guidance",
		"gd",
		"M21 12a9 9 0 1 0-18 0 9 9 0 0 0 18 0ZM15 9l-2 4-4 2 2-4Z"
	],
	"review-gate": [
		"Review",
		"rg",
		"M2 10s4-6 9-6 9 6 9 6-4 6-9 6-9-6-9-6ZM13 10a2 2 0 1 0-4 0 2 2 0 0 0 4 0m1 9 3 3 5-6"
	],
	"apply-reply": [
		"Delivery",
		"ar",
		cd.Delivery
	],
	reroute: [
		"Routing",
		"rt",
		cd.Routing
	],
	reflect: [
		"Reflect",
		"rf",
		cd.Reflect
	],
	internalize: [
		"Internalize",
		"in",
		cd.Internalize
	],
	express: [
		"Express",
		"ex",
		cd.Express
	],
	context: [
		"Context",
		"cx",
		cd.Context
	],
	memory: [
		"Memory",
		"mm",
		cd.Memory
	],
	state: [
		"State",
		"sv",
		cd.State
	],
	condition: [
		"Validation",
		"cn",
		"M12 2 22 12 12 22 2 12Zm-4 10 3 3 5-6"
	],
	branch: [
		"Routing",
		"br",
		"M3 12h6m0 0 6-7h6m-4-3 4 3-4 3M9 12l6 7h6m-4-3 4 3-4 3"
	],
	join: [
		"Assembly",
		"jn",
		"M3 5h5l6 7-6 7H3M14 12h7m-4-4 4 4-4 4"
	],
	collect: [
		"Assembly",
		"cl",
		"M3 14v7h18v-7M7 3v12m-3-3 3 3 3-3M17 3v12m-3-3 3 3 3-3"
	],
	"confidence-gate": [
		"Validation",
		"cg",
		"M4 18a9 9 0 1 1 16 0M12 12l5-5M5 19h14M8 19v3m8-3v3"
	],
	"for-each": [
		"Routing",
		"fe",
		"M20 7a8 8 0 0 0-14-2L3 8m0-5v5h5M4 17a8 8 0 0 0 14 2l3-3m0 5v-5h-5M8 12h1m3 0h1m3 0h1"
	],
	decision: [
		"Analysis",
		"dc",
		"M4 3h16v18H4ZM7 8l2 2 3-4M14 8h3M7 15h3m4 0h3"
	],
	combine: [
		"Assembly",
		"cb",
		"M3 3h6v7H3ZM3 14h6v7H3ZM9 6h3l4 6-4 6H9M16 12h5m-3-3 3 3-3 3"
	],
	append: [
		"Assembly",
		"ap",
		"M14 2H4v20h14V6Zm0 0v4h4M7 10h5m-5 4h5M18 12v8m-4-4h8"
	],
	"render-notes": [
		"Delivery",
		"rn",
		"M4 3h16v12l-6 6H4Zm10 18v-6h6M8 7h8M8 11h8M8 15h3"
	],
	enrich: [
		"Assembly",
		"en",
		"M3 5h7M3 12h10M3 19h16M17 2l1.5 4.5L23 8l-4.5 1.5L17 14l-1.5-4.5L11 8l4.5-1.5Z"
	],
	"draft-text": [
		"Extraction",
		"dt",
		"M14 2H4v20h16V8Zm0 0v6h6M7 11h10M12 11v7M9 18h6"
	],
	extract: [
		"Extraction",
		"ec",
		"M3 3h18l-7 8v4h-4v-4ZM8 19h8v3H8Z"
	],
	"model-call": [
		"Analysis",
		"mc",
		"M8 3H4v14h5l-5 4M4 17h16V9M16 2l1.5 4.5L22 8l-4.5 1.5L16 14l-1.5-4.5L10 8l4.5-1.5Z"
	],
	"revise-draft": [
		"Revision",
		"rv",
		"M13 2H4v20h6M13 2v5h5V5ZM7 11h5m-5 4h3M12 18l7-7 3 3-7 7h-3Zm5-5 3 3"
	],
	"player-event-source": [
		"Sources",
		"pe",
		"M11 6a3 3 0 1 0-6 0 3 3 0 0 0 6 0M2 21v-4a6 6 0 0 1 12 0v4M19 8l-4 6h4l-1 7 5-8h-4Z"
	],
	"on-send": [
		"Sources",
		"os",
		"M3 5h18v14H3ZM3 5l9 7 9-7M12 14v8m-3-3 3 3 3-3"
	],
	"generate-reply": [
		"Sources",
		"gr",
		"M20 9V3H4v14h5l-5 4M14 12a5 5 0 1 0 7 7m0-5v5h-5"
	],
	"review-publish": [
		"Delivery",
		"pb",
		"M8 3H4v18h11M8 2h7v4H8ZM7 11l2 2 4-5M15 15h7m-3-3 3 3-3 3"
	],
	format: [
		"Parsing",
		"fm",
		"M5 3H2v18h3M19 3h3v18h-3M8 6h8M8 10h5M8 14h8M8 18h5"
	],
	"read-file": [
		"Sources",
		"rd",
		"M14 2H4v20h16v-5M14 2v5h6V7ZM8 12h14m-4-4 4 4-4 4"
	],
	"write-file": [
		"Delivery",
		"wf",
		"M14 2H6v7M6 17v5h14V8L14 2M14 2v6h6M2 13h12m-4-4 4 4-4 4"
	],
	"project-document": [
		"Assembly",
		"pd",
		"M13 2H3v12h14V6Zm0 0v4h4M6 9h7M8 18h13v4H8ZM11 14v4m-3-3 3 3 3-3"
	],
	"commit-clock": [
		"Delivery",
		"cc",
		"M20 10a8 8 0 1 0-8 10M12 5v7l-4 2M14 19l3 3 5-6"
	],
	"story-clock": [
		"Sources",
		"ck",
		"M21 12a9 9 0 1 0-18 0 9 9 0 0 0 18 0ZM12 6v6l4 3"
	],
	"time-trigger": [
		"Routing",
		"tt",
		"M19 13a7 7 0 1 0-14 0 7 7 0 0 0 14 0ZM12 9v4l3 2M2 5l4-3m12 0 4 3M7 19l-2 3m12-3 2 3"
	],
	"advance-time": [
		"Routing",
		"at",
		"M15 5a8 8 0 1 0 0 14M10 6v6l-3 2M14 12h8m-4-4 4 4-4 4"
	],
	"actor-context": [
		"Context",
		"ac",
		"M5 3H2v18h3M19 3h3v18h-3M15 8a3 3 0 1 0-6 0 3 3 0 0 0 6 0M7 19v-2a5 5 0 0 1 10 0v2"
	],
	"draft-event-source": [
		"Sources",
		"de",
		"M14 2H4v20h16V8Zm0 0v6h6M12 10l-4 5h4l-1 5 6-7h-5Z"
	],
	"event-normalize": [
		"Parsing",
		"ev",
		"M2 4h6M4 12h4M3 20h5M10 12h4m-2-2 2 2-2 2M17 4h5M17 12h5M17 20h5"
	],
	"prompted-memory": [
		"Memory",
		"pm",
		"M3 3h18v13h-8l-6 5v-5H3ZM7 7h4v6H7Zm6 0h4v6h-4M11 7l1 1 1-1"
	],
	"item-mention-trigger": [
		"Routing",
		"mt",
		"M3 3h9l9 9-9 9-9-9ZM7 7h.01M12 8v4h-2m7 1v4h-2"
	],
	"item-use-trigger": [
		"Routing",
		"ut",
		"M3 8v13h13l5-5M3 8l5-5h5M17 2l-5 8h5l-1 7 6-10h-5Z"
	],
	"confirm-events": [
		"Validation",
		"ce",
		"M3 2h18v20H3ZM6 7l2 2 3-4M14 7h4M6 16l2 2 3-4M14 16h4"
	],
	"current-holder": [
		"Context",
		"ch",
		"M7 3h8v7H7ZM2 14h4l3-3h4l2 3h5a2 2 0 0 1 1 4l-8 4-7-3H2ZM9 14h6"
	],
	"scene-presence": [
		"Context",
		"sp",
		"M19 9c0 5-7 13-7 13S5 14 5 9a7 7 0 1 1 14 0ZM15 9a3 3 0 1 0-6 0 3 3 0 0 0 6 0"
	],
	"character-direction": [
		"Guidance",
		"cd",
		"M12 6a3 3 0 1 0-6 0 3 3 0 0 0 6 0M3 20v-3a6 6 0 0 1 12 0v3M15 10h7m-4-4 4 4-4 4"
	],
	"parse-effect-library": [
		"Library",
		"el",
		"M3 4h4v17H3ZM9 4h4v17H9ZM17 12l4 9M17 2v6m-3-3h6"
	],
	"random-pick": [
		"Routing",
		"pk",
		"M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM7 7h.01M12 12h.01M17 17h.01"
	],
	"commit-outcomes": [
		"Delivery",
		"oc",
		"M3 3h16v10M3 3v16h9M7 7h.01M12 12h.01M14 19l3 3 5-6"
	],
	"saved-outcome": [
		"Memory",
		"ou",
		"M5 2h14v20l-7-5-7 5ZM9 7h6v6H9ZM12 10h.01"
	],
	"effect-author": [
		"Revision",
		"ea",
		"M3 21l2-7L16 3l5 5-11 11Zm2-7 5 5m-7 2 4-4M4 2v6M1 5h6M21 15v6m-3-3h6"
	],
	"stage-outcome": [
		"Assembly",
		"su",
		"M3 17v5h18v-5M7 4h10v9H7ZM12 13v5m-3-3 3 3 3-3M10 8h.01m4 1h.01"
	],
	collection: [
		"Extraction",
		"ct",
		"M21 5c0 2-4 3-9 3S3 7 3 5s4-3 9-3 9 1 9 3Zm-18 0v7c0 2 4 3 9 3s9-1 9-3V5M3 12v7c0 2 4 3 9 3s9-1 9-3v-7"
	],
	recall: [
		"Memory",
		"rc",
		"M4 8v13h15V10M7 14h8M7 18h5M7 8a7 7 0 0 1 13-2M7 3v5h5"
	],
	"hotkey-arm": [
		"Routing",
		"hk",
		"M2 7h20v14H2ZM6 11h.01m4 0h.01m4 0h.01m4 0h.01M6 17h12M17 2v3m-2-1h4"
	]
}, dd = Object.freeze(Object.fromEntries(Object.entries(ud).map(([e, [t, n, r]]) => [e, Object.freeze({
	group: t,
	shortcode: n,
	icon: r
})]))), fd = Object.freeze({
	group: "Blocks",
	shortcode: "",
	icon: ad
}), pd = (e) => Object.hasOwn(dd, e) ? dd[e] : fd, md = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-family-row\" aria-haspopup=\"menu\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path></path></svg><span> </span></button>"), hd = /* @__PURE__ */ G("<button type=\"button\" role=\"menuitem\">‹ Families</button>"), gd = /* @__PURE__ */ G("<input class=\"text_pole\" aria-label=\"Search nodes\" placeholder=\"Search nodes…\"/>"), _d = /* @__PURE__ */ G("<div class=\"pc-shelf-group svelte-hk6fzp\" role=\"presentation\"> </div>"), vd = /* @__PURE__ */ G("<span class=\"pc-shelf-reason svelte-hk6fzp\"> </span>"), yd = /* @__PURE__ */ G("<!> <button type=\"button\" role=\"menuitem\" class=\"svelte-hk6fzp\"><svg class=\"pc-leaf-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path></path></svg><span class=\"pc-catalog-name\"> <!></span><small> </small></button>", 1), bd = /* @__PURE__ */ G("<p class=\"pc-shelf-empty svelte-hk6fzp\"> </p>"), xd = /* @__PURE__ */ G("<div role=\"menu\" tabindex=\"-1\"><!> <!> <!></div>"), Sd = /* @__PURE__ */ G("<div class=\"pc-shelf-menu pc-shelf-subgraph-menu svelte-hk6fzp\" role=\"menu\" tabindex=\"-1\"><button type=\"button\" role=\"menuitem\" data-shelf-subgraph-action=\"open\">Open saved definition</button> <button type=\"button\" role=\"menuitem\" data-shelf-subgraph-action=\"delete\">Delete</button></div>"), Cd = /* @__PURE__ */ G("<div class=\"pc-shelf-drag-preview svelte-hk6fzp\" aria-hidden=\"true\"> </div>"), wd = /* @__PURE__ */ G("<nav aria-label=\"Node families\"></nav> <!> <!> <!>", 1);
function Td(e, t) {
	Ue(t, !0);
	let n = Ni(t, "choices", 19, () => []), r = Ni(t, "readOnly", 3, !1), i, a = /* @__PURE__ */ I(null), o = /* @__PURE__ */ I(""), s = /* @__PURE__ */ I(!1), c = /* @__PURE__ */ I(""), l = /* @__PURE__ */ I(!1), u = /* @__PURE__ */ I(0), d = /* @__PURE__ */ I(0), f = null, p = 0, m = /* @__PURE__ */ I(null), h = /* @__PURE__ */ I(null), g = null, _ = sd.map((e) => e.name), v = (e) => sd.find((t) => t.name === e)?.color, y = null, b = null, x = null, S = /* @__PURE__ */ I(null);
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
		}, !H(S) && Math.hypot(e.clientX - y.start.x, e.clientY - y.start.y) >= 5 && w(), H(S) && (e.preventDefault(), L(S, {
			...H(S),
			...y.point
		}, !0)));
	}
	function D(e) {
		if (!y || e.pointerId !== y.pointerId) return;
		let t = y.entry, n = !!H(S), r = n ? document.elementFromPoint(e.clientX, e.clientY) : null, a = i.closest(".pc-canvas-area")?.querySelector(".pc-canvas-host");
		C(), n && (e.preventDefault(), e.stopPropagation(), r && a?.contains(r) && ae(t, {
			x: e.clientX,
			y: e.clientY
		}));
	}
	function O(e, t) {
		e.currentTarget === x && e.detail !== 0 ? x = null : ae(t);
	}
	function k(e = H(o)) {
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
			let i = n.id.startsWith("operation:") ? n.id.split(":")[1] : "", a = pd(i), o = i ? n.label.split(" · ")[0] : n.label, s = n.id.startsWith("boundary:");
			return {
				...n,
				title: o,
				compatible: !n.disabledReason && !!t.choose,
				shortcode: i ? a.shortcode || n.shortcode || "" : n.shortcode ?? a.shortcode,
				group: e === "Subgraphs" ? s ? "Interface" : "Library" : void 0,
				icon: e === "Subgraphs" ? s ? pd("subgraph-" + n.id.split(":")[1]).icon : ld.Library.icon : a.icon,
				searchAliases: r
			};
		});
	}
	function A(e = !1) {
		L(m, null), e && g?.focus({ preventScroll: !0 });
	}
	function j(e = !1) {
		C(), p++, L(o, ""), L(s, !1), A(), e && f?.focus({ preventScroll: !0 });
	}
	let M;
	Cn(() => {
		let e = JSON.stringify([t.insertionContextKey, t.view?.graphId]), n = r(), i = JSON.stringify(_.flatMap((e) => k(e).map((e) => [
			e.id,
			e.title,
			e.compatible,
			e.phase,
			e.family,
			e.shortcode,
			e.icon,
			e.group,
			e.purpose,
			e.searchAliases,
			e.disabledReason,
			e.definitionRef?.id,
			e.definitionRef?.version,
			e.definitionRef?.semanticHash
		])));
		M && (e !== M.scope || i !== M.catalog || n !== M.locked) && j(), M = {
			scope: e,
			catalog: i,
			locked: n
		};
	}), Fi(() => j());
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
		if (A(), H(o) === e) {
			n && H(a)?.querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
			return;
		}
		let r = ++p;
		if (L(o, e, !0), L(s, !1), f = t, await mr(), r !== p || H(o) !== e || !H(a)?.isConnected) return;
		let i = t.getBoundingClientRect(), c = H(a).getBoundingClientRect(), m = te({
			top: ne(i, H(a), c),
			left: i.left,
			right: i.right
		}, c.width, c.height, i.width);
		L(u, m.x, !0), L(d, m.y, !0), L(l, m.compact, !0), n && H(a).querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
	}
	async function ie() {
		let e = ++p;
		if (L(o, ""), L(s, !0), L(c, ""), await mr(), e !== p || !H(s) || !H(a)?.isConnected) return;
		let t = ee(), n = i.getBoundingClientRect(), r = H(a).getBoundingClientRect();
		L(u, Math.max(4, Math.min(n.right - t.left + 3, t.width - r.width - 4)), !0), L(d, n.top - t.top), H(a).querySelector("input")?.focus();
	}
	function ae(e, n) {
		let i = k(e.family).find((t) => t.id === e.id);
		i?.compatible && !r() && (j(!0), n ? t.choose?.(i.id, n) : t.choose?.(i.id));
	}
	async function oe(e, n) {
		let r = k("Subgraphs").find((t) => t.id === e.dataset.shelfChoice);
		if (!r?.definitionRef || !t.shelfSubgraph) return;
		let i = ee(), a = e.getBoundingClientRect();
		if (g = e, L(m, {
			id: r.id,
			title: r.title,
			x: (n?.x ?? a.right) - i.left,
			y: (n?.y ?? a.top) - i.top
		}, !0), await mr(), !H(m) || H(m).id !== r.id || !H(h)?.isConnected) return;
		let o = H(h).getBoundingClientRect();
		L(m, {
			...H(m),
			x: Math.max(4, Math.min(H(m).x, i.width - o.width - 4)),
			y: Math.max(4, Math.min(H(m).y, i.height - o.height - 4))
		}, !0), H(h).querySelector("button")?.focus({ preventScroll: !0 });
	}
	function se(e) {
		let n = e.target.closest("[data-shelf-choice]");
		n && k("Subgraphs").some((e) => e.id === n.dataset.shelfChoice && e.definitionRef) && t.shelfSubgraph && (e.preventDefault(), e.stopPropagation(), oe(n, {
			x: e.clientX,
			y: e.clientY
		}));
	}
	function ce(e) {
		let n = k("Subgraphs").find((e) => e.id === H(m)?.id);
		j(!0), n?.definitionRef && t.shelfSubgraph?.(n.id, e);
	}
	function le(e) {
		if ((e.key === "ContextMenu" || e.key === "F10" && e.shiftKey) && e.target.dataset.shelfChoice) {
			e.preventDefault(), e.stopPropagation(), oe(e.target);
			return;
		}
		if (H(m) && e.key === "Escape") {
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
		if (e.key === "ArrowLeft" && H(o)) {
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
	var ue = { openSearch: ie }, de = wd();
	U("pointerdown", an, (e) => {
		e.target.closest(".pc-node-shelf, .pc-shelf-menu") || j();
	}), U("pointermove", an, E), U("pointerup", an, D), U("pointercancel", an, () => C()), U("blur", an, () => j()), U("resize", an, () => j()), U("keydown", an, (e) => {
		y && e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), j(!0));
	});
	var fe = z(de);
	Y(fe, 21, () => sd, qr, (e, t) => {
		var n = md();
		let r;
		var i = R(n), a = R(i);
		P(i);
		var s = B(i), c = R(s, !0);
		P(s), P(n), V((e) => {
			Z(n, "data-family", H(t).name), n.disabled = e, Z(n, "title", "Browse " + H(t).name + " nodes"), Z(n, "aria-expanded", H(o) === H(t).name), r = mi(n, "", r, { "--pc-family": H(t).color }), Z(a, "d", H(t).icon), q(c, H(t).name);
		}, [() => !k(H(t).name).length]), W("click", n, (e) => re(H(t).name, e.currentTarget)), U("pointerenter", n, (e) => {
			e.pointerType !== "touch" && !e.currentTarget.disabled && re(H(t).name, e.currentTarget, !1);
		}), W("keydown", n, le), K(e, n);
	}), P(fe), Mi(fe, (e) => i = e, () => i);
	var pe = B(fe, 2), me = (e) => {
		let n = /* @__PURE__ */ F(() => H(s) ? _.flatMap((e) => k(e)).filter((e) => [
			e.title,
			e.id,
			e.family,
			e.purpose,
			e.shortcode,
			...e.searchAliases ?? []
		].join(" ").toLowerCase().includes(H(c).toLowerCase())) : k());
		var i = xd();
		let f;
		var p = R(i), m = (e) => {
			var t = hd();
			W("click", t, () => j(!0)), K(e, t);
		};
		J(p, (e) => {
			H(l) && H(o) && e(m);
		});
		var h = B(p, 2), g = (e) => {
			var t = gd();
			X(t), Oi(t, () => H(c), (e) => L(c, e)), K(e, t);
		};
		J(h, (e) => {
			H(s) && e(g);
		}), Y(B(h, 2), 19, () => H(n), (e) => e.family + e.id, (e, i, a) => {
			let o = /* @__PURE__ */ F(() => !H(i).compatible || r()), c = /* @__PURE__ */ F(() => !!H(i).definitionRef && !!t.shelfSubgraph), l = /* @__PURE__ */ F(() => r() ? H(c) ? "This graph is read-only. Right-click for subgraph actions." : "This graph is read-only." : H(i).disabledReason || (H(i).compatible ? "" : "Choose a graph in the " + H(i).phase + " stage to add this node."));
			var u = yd(), d = z(u), f = (e) => {
				var t = _d(), n = R(t, !0);
				P(t), V(() => {
					Z(t, "data-shelf-group", H(i).group), q(n, H(i).group);
				}), K(e, t);
			};
			J(d, (e) => {
				!H(s) && H(i).group && H(n)[H(a) - 1]?.group !== H(i).group && e(f);
			});
			var p = B(d, 2);
			let m;
			var h = R(p), g = R(h);
			P(h);
			var _ = B(h), y = R(_, !0), b = B(y), x = (e) => {
				var t = vd(), n = R(t, !0);
				P(t), V(() => q(n, H(l))), K(e, t);
			};
			J(b, (e) => {
				H(l) && e(x);
			}), P(_);
			var S = B(_), w = R(S, !0);
			P(S), P(p), V((e) => {
				Z(p, "data-shelf-choice", H(i).id), Z(p, "data-insertion-disabled", H(o)), p.disabled = H(o) && !H(c), Z(p, "aria-disabled", H(o) && !H(c)), Z(p, "aria-haspopup", H(c) ? "menu" : void 0), Z(p, "title", H(l) || H(i).purpose || "Add " + H(i).title), m = mi(p, "", m, e), Z(g, "d", H(i).icon), q(y, H(i).title), q(w, H(i).shortcode);
			}, [() => ({ "--pc-family": v(H(i).family) })]), W("pointerdown", p, (e) => T(e, H(i))), U("lostpointercapture", p, () => C()), W("click", p, (e) => O(e, H(i))), K(e, u);
		}, (e) => {
			var t = bd(), n = R(t, !0);
			P(t), V(() => q(n, H(s) ? "No nodes match your search. Try another name or clear the search." : "No nodes are available in this family for the current graph.")), K(e, t);
		}), P(i), Mi(i, (e) => L(a, e), () => H(a)), V((e) => {
			fi(i, 1, `pc-shelf-menu ${H(s) ? "pc-leaf-menu" : "pc-family-menu"}`, "svelte-hk6fzp"), Z(i, "aria-label", H(s) ? "Search nodes" : H(o) + " nodes"), f = mi(i, "", f, e);
		}, [() => ({
			left: `${H(u)}px`,
			top: `${H(d)}px`,
			"--pc-family": v(H(o))
		})]), W("keydown", i, le), W("contextmenu", i, se), K(e, i);
	};
	J(pe, (e) => {
		(H(o) || H(s)) && e(me);
	});
	var he = B(pe, 2), ge = (e) => {
		var t = Sd();
		let n;
		var r = R(t), i = B(r, 2);
		P(t), Mi(t, (e) => L(h, e), () => H(h)), V(() => {
			Z(t, "aria-label", H(m).title + " actions"), n = mi(t, "", n, {
				left: `${H(m).x}px`,
				top: `${H(m).y}px`
			});
		}), W("keydown", t, le), W("click", r, () => ce("open")), W("click", i, () => ce("delete")), K(e, t);
	};
	J(he, (e) => {
		H(m) && e(ge);
	});
	var _e = B(he, 2), ve = (e) => {
		var t = Cd();
		let n;
		var r = R(t, !0);
		P(t), V((e) => {
			n = mi(t, "", n, e), q(r, H(S).title);
		}, [() => ({
			"--pc-family": v(H(S).family),
			left: `${H(S).x + 12}px`,
			top: `${H(S).y + 12}px`
		})]), K(e, t);
	};
	return J(_e, (e) => {
		H(S) && e(ve);
	}), V(() => fi(fe, 1, `pc-node-shelf${H(l) && H(o) ? " pc-shelf-replaced" : ""}`, "svelte-hk6fzp")), K(e, de), We(ue);
}
Er([
	"click",
	"keydown",
	"contextmenu",
	"pointerdown"
]);
//#endregion
//#region ui/ExamplesBrowser.svelte
var Ed = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-btn menu_button svelte-18p7ib8\">Reload examples</button>"), Dd = /* @__PURE__ */ G("<div class=\"pc-examples-issue svelte-18p7ib8\"><!><!></div>"), Od = /* @__PURE__ */ G("<option> </option>"), kd = /* @__PURE__ */ G("<li class=\"svelte-18p7ib8\"> </li>"), Ad = /* @__PURE__ */ G("<li data-checkpoint=\"\" class=\"svelte-18p7ib8\"><strong> </strong><span class=\"svelte-18p7ib8\"> </span></li>"), jd = /* @__PURE__ */ G("<li class=\"svelte-18p7ib8\"><strong> </strong><span class=\"svelte-18p7ib8\"> </span></li>"), Md = /* @__PURE__ */ G("<p class=\"pc-example-focus svelte-18p7ib8\"><strong> </strong> </p> <h4 class=\"svelte-18p7ib8\">Learn</h4><ul class=\"svelte-18p7ib8\"></ul> <h4 class=\"svelte-18p7ib8\">Setup</h4><ul class=\"svelte-18p7ib8\"></ul> <h4 class=\"svelte-18p7ib8\">Try the lesson</h4><ol class=\"svelte-18p7ib8\"></ol> <h4 class=\"svelte-18p7ib8\">Checkpoints</h4><ul class=\"svelte-18p7ib8\"></ul> <h4 class=\"svelte-18p7ib8\">Experiments</h4><ul class=\"svelte-18p7ib8\"></ul> <h4 class=\"svelte-18p7ib8\">Expected cases</h4><ul class=\"svelte-18p7ib8\"></ul> <p class=\"svelte-18p7ib8\"><strong>Auxiliary call budget:</strong> </p>", 1), Nd = /* @__PURE__ */ G("<div><!></div>"), Pd = /* @__PURE__ */ G("<section class=\"pc-example-details svelte-18p7ib8\"><header class=\"svelte-18p7ib8\"><h3 tabindex=\"-1\" class=\"svelte-18p7ib8\"> </h3><button type=\"button\" class=\"pc-btn menu_button\" aria-label=\"Close lesson details\">Close</button></header> <p class=\"svelte-18p7ib8\"> </p> <!> <!> <button type=\"button\" class=\"pc-btn menu_button\">Open independent copy</button></section>"), Fd = /* @__PURE__ */ G("<p class=\"pc-examples-empty svelte-18p7ib8\"> </p>"), Id = /* @__PURE__ */ Fr("<g class=\"pc-example-group svelte-18p7ib8\"><rect rx=\"6\" class=\"svelte-18p7ib8\"></rect><text class=\"svelte-18p7ib8\"> </text></g>"), Ld = /* @__PURE__ */ Fr("<g class=\"pc-example-comment svelte-18p7ib8\"><rect rx=\"4\" class=\"svelte-18p7ib8\"></rect><text class=\"svelte-18p7ib8\"> </text></g>"), Rd = /* @__PURE__ */ Fr("<path class=\"pc-wire pc-wire-native\"></path>"), zd = /* @__PURE__ */ Fr("<!><text class=\"pc-example-pin-label svelte-18p7ib8\"> </text>", 1), Bd = /* @__PURE__ */ Fr("<g><rect class=\"pc-example-card svelte-18p7ib8\" rx=\"4\"></rect><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\"><path class=\"pc-example-icon svelte-18p7ib8\"></path></svg><text class=\"pc-example-node-title svelte-18p7ib8\" lengthAdjust=\"spacingAndGlyphs\"> </text><!></g>"), Vd = /* @__PURE__ */ Fr("<svg class=\"pc-example-preview svelte-18p7ib8\" preserveAspectRatio=\"xMidYMid meet\" aria-hidden=\"true\" focusable=\"false\"><!><!><!><!></svg>"), Hd = /* @__PURE__ */ G("<span class=\"pc-example-unavailable-preview svelte-18p7ib8\"><strong class=\"svelte-18p7ib8\">Unavailable</strong><span class=\"svelte-18p7ib8\">Open Lesson details for this example.</span></span>"), Ud = /* @__PURE__ */ G("<span class=\"pc-example-band svelte-18p7ib8\"> </span>"), Wd = /* @__PURE__ */ G("<article class=\"pc-example-entry svelte-18p7ib8\"><button type=\"button\"><!> <span class=\"pc-example-title svelte-18p7ib8\"> </span> <!> <span class=\"pc-example-goal svelte-18p7ib8\"> </span></button> <!> <button type=\"button\" class=\"pc-example-details-button svelte-18p7ib8\">Lesson details</button></article>"), Gd = /* @__PURE__ */ G("<!> <div class=\"pc-examples-filters svelte-18p7ib8\"><label class=\"svelte-18p7ib8\">Search lessons<input aria-label=\"Search lessons\" type=\"search\" placeholder=\"Goal, node or technique\" class=\"svelte-18p7ib8\"/></label> <label class=\"svelte-18p7ib8\">Difficulty<select aria-label=\"Difficulty\" class=\"svelte-18p7ib8\"><option>All difficulties</option><!></select></label> <span class=\"pc-examples-count svelte-18p7ib8\" role=\"status\"> </span></div> <div class=\"pc-examples-grid svelte-18p7ib8\"><!> <!> <!></div>", 1);
function Kd(e, t) {
	Ue(t, !0);
	let n = Ni(t, "examples", 19, () => []), r = Ni(t, "issue", 3, ""), i = Ni(t, "scrollTop", 3, 0), a, o = /* @__PURE__ */ I(void 0), s = /* @__PURE__ */ I(void 0), c = /* @__PURE__ */ I(""), l = /* @__PURE__ */ I(""), u = /* @__PURE__ */ I(""), d = /* @__PURE__ */ I(""), f = [
		"Foundations",
		"Composition",
		"Advanced",
		"Capstone"
	], p = /* @__PURE__ */ F(() => n().filter((e) => {
		if (H(u) && e.lesson?.difficulty !== H(u)) return !1;
		let t = H(l).toLocaleLowerCase().trim().split(/\s+/).filter(Boolean), n = [
			e.number,
			e.title,
			e.goal,
			JSON.stringify(e.lesson ?? {}),
			...e.thumbnail?.nodes.map((e) => e.title) ?? []
		].join(" ").toLocaleLowerCase();
		return t.every((e) => n.includes(e));
	})), m = /* @__PURE__ */ F(() => n().find((e) => e.id === H(d)));
	Pi(() => {
		a.scrollTop = i();
	});
	async function h(e) {
		L(d, H(d) === e ? "" : e, !0), H(d) && (await mr(), a.scrollTop = 0, H(o)?.focus());
	}
	async function g(e) {
		L(d, ""), await mr(), (Array.from(a.querySelectorAll(".pc-example-details-button")).find((t) => t.dataset.exampleId === e) ?? H(s))?.focus();
	}
	async function _(e) {
		if (!H(c)) {
			L(c, e, !0);
			try {
				await t.open(e);
			} finally {
				L(c, "");
			}
		}
	}
	var v = Gd(), y = z(v), b = (e) => {
		var n = Dd(), i = R(n);
		fo(i, { get issue() {
			return r();
		} });
		var a = B(i), o = (e) => {
			var n = Ed();
			W("click", n, () => t.retry?.()), K(e, n);
		};
		J(a, (e) => {
			t.retry && e(o);
		}), P(n), K(e, n);
	};
	J(y, (e) => {
		r() && e(b);
	});
	var x = B(y, 2), S = R(x), C = B(R(S));
	X(C), Mi(C, (e) => L(s, e), () => H(s)), P(S);
	var w = B(S, 2), T = B(R(w)), E = R(T);
	E.value = E.__value = "", Y(B(E), 17, () => f, qr, (e, t) => {
		var n = Od(), r = R(n, !0);
		P(n);
		var i = {};
		V(() => {
			q(r, H(t)), i !== (i = H(t)) && (n.value = (n.__value = H(t)) ?? "");
		}), K(e, n);
	}), P(T), P(w);
	var D = B(w, 2), O = R(D);
	P(D), P(x);
	var k = B(x, 2), A = R(k), j = (e) => {
		var t = Pd(), n = R(t), r = R(n), i = R(r);
		P(r), Mi(r, (e) => L(o, e), () => H(o));
		var a = B(r);
		P(n);
		var s = B(n, 2), l = R(s, !0);
		P(s);
		var u = B(s, 2), d = (e) => {
			var t = Md(), n = z(t), r = R(n), i = R(r, !0);
			P(r);
			var a = B(r);
			P(n);
			var o = B(n, 3);
			Y(o, 21, () => H(m).lesson.learn, qr, (e, t) => {
				var n = kd(), r = R(n, !0);
				P(n), V(() => q(r, H(t))), K(e, n);
			}), P(o);
			var s = B(o, 3);
			Y(s, 21, () => H(m).lesson.requirements, qr, (e, t) => {
				var n = kd(), r = R(n, !0);
				P(n), V(() => q(r, H(t))), K(e, n);
			}), P(s);
			var c = B(s, 3);
			Y(c, 21, () => H(m).lesson.steps, qr, (e, t) => {
				var n = kd(), r = R(n, !0);
				P(n), V(() => q(r, H(t))), K(e, n);
			}), P(c);
			var l = B(c, 3);
			Y(l, 21, () => H(m).lesson.checkpoints, qr, (e, t) => {
				var n = Ad(), r = R(n), i = R(r);
				P(r);
				var a = B(r), o = R(a, !0);
				P(a), P(n), V(() => {
					q(i, `${H(t).node ?? ""} → ${H(t).port ?? ""}`), q(o, H(t).expect);
				}), K(e, n);
			}), P(l);
			var u = B(l, 3);
			Y(u, 21, () => H(m).lesson.experiments, qr, (e, t) => {
				var n = jd(), r = R(n), i = R(r, !0);
				P(r);
				var a = B(r), o = R(a, !0);
				P(a), P(n), V(() => {
					q(i, H(t).change), q(o, H(t).expect);
				}), K(e, n);
			}), P(u);
			var d = B(u, 3);
			Y(d, 21, () => H(m).lesson.cases, qr, (e, t) => {
				var n = jd(), r = R(n), i = R(r, !0);
				P(r);
				var a = B(r), o = R(a, !0);
				P(a), P(n), V(() => {
					q(i, H(t).when), q(o, H(t).expect);
				}), K(e, n);
			}), P(d);
			var f = B(d, 2), p = B(R(f));
			P(f), V(() => {
				q(i, H(m).lesson.difficulty), q(a, ` · ${H(m).lesson.focus ?? ""}`), q(p, ` ${H(m).lesson.callBudget ?? ""}`);
			}), K(e, t);
		};
		J(u, (e) => {
			H(m).lesson && e(d);
		});
		var f = B(u, 2), p = (e) => {
			var t = Nd();
			fo(R(t), { get issue() {
				return H(m).issue;
			} }), P(t), V(() => Z(t, "id", `pc-example-issue-${H(m).number}`)), K(e, t);
		};
		J(f, (e) => {
			H(m).issue && e(p);
		});
		var h = B(f, 2);
		P(t), V(() => {
			Z(t, "aria-label", `Lesson ${H(m).number} details`), q(i, `${H(m).number ?? ""}. ${H(m).title ?? ""}`), q(l, H(m).goal), h.disabled = !!H(c) || !H(m).thumbnail;
		}), W("click", a, () => g(H(m).id)), W("click", h, () => _(H(m).id)), K(e, t);
	};
	J(A, (e) => {
		H(m) && e(j);
	});
	var M = B(A, 2), ee = (e) => {
		var t = Fd(), n = R(t, !0);
		P(t), V((e) => q(n, e), [() => H(l).trim() || H(u) ? "No lessons match your search and difficulty. Clear a filter to see more lessons." : "No lessons are available yet. Reload examples to check again."]), K(e, t);
	};
	J(M, (e) => {
		!H(p).length && !r() && e(ee);
	}), Y(B(M, 2), 17, () => H(p), (e) => e.id, (e, t) => {
		let n = /* @__PURE__ */ F(() => H(t).thumbnail);
		var r = Wd(), i = R(r);
		let a;
		var o = R(i), s = (e) => {
			var t = Vd(), r = R(t);
			Y(r, 17, () => H(n).groups, (e) => e.id, (e, t) => {
				var n = Id(), r = R(n), i = B(r), a = R(i, !0);
				P(i), P(n), V(() => {
					Z(n, "data-id", H(t).id), Z(r, "x", H(t).x), Z(r, "y", H(t).y), Z(r, "width", H(t).w), Z(r, "height", H(t).h), Z(i, "x", H(t).x + 12), Z(i, "y", H(t).y + 24), q(a, H(t).title);
				}), K(e, n);
			});
			var i = B(r);
			Y(i, 17, () => H(n).comments, (e) => e.id, (e, t) => {
				var n = Ld(), r = R(n);
				let i;
				var a = B(r), o = R(a, !0);
				P(a), P(n), V(() => {
					Z(n, "data-id", H(t).id), Z(r, "x", H(t).x), Z(r, "y", H(t).y), Z(r, "width", H(t).w), Z(r, "height", H(t).h), i = mi(r, "", i, { stroke: H(t).color }), Z(a, "x", H(t).x + 12), Z(a, "y", H(t).y + 24), q(o, H(t).title);
				}), K(e, n);
			});
			var a = B(i);
			Y(a, 17, () => H(n).wires, (e) => e.id, (e, t) => {
				var n = Rd();
				V(() => {
					Z(n, "data-kind", H(t).kind), Z(n, "data-id", H(t).id), Z(n, "d", H(t).d);
				}), K(e, n);
			}), Y(B(a), 17, () => H(n).nodes, (e) => e.id, (e, t) => {
				var n = Bd(), r = R(n), i = B(r), a = R(i);
				P(i);
				var o = B(i), s = R(o, !0);
				P(o), Y(B(o), 17, () => H(t).ports, (e) => e.id, (e, t) => {
					var n = zd(), r = z(n);
					{
						let e = /* @__PURE__ */ F(() => H(t).x - 9), n = /* @__PURE__ */ F(() => H(t).y - 9);
						Hi(r, {
							get kind() {
								return H(t).kind;
							},
							className: "pc-example-pin-cue",
							get x() {
								return H(e);
							},
							get y() {
								return H(n);
							}
						});
					}
					var i = B(r), a = R(i, !0);
					P(i), V(() => {
						Z(i, "x", H(t).x + (H(t).dir === "in" ? 9 : -9)), Z(i, "y", H(t).y + 4), Z(i, "text-anchor", H(t).dir === "in" ? "start" : "end"), q(a, H(t).label);
					}), K(e, n);
				}), P(n), V(() => {
					fi(n, 0, oi(H(t).className), "svelte-18p7ib8"), Z(n, "data-id", H(t).id), Z(r, "x", H(t).x), Z(r, "y", H(t).y), Z(r, "width", H(t).w), Z(r, "height", H(t).h), Z(i, "x", H(t).x + 8), Z(i, "y", H(t).y + 7), Z(a, "d", H(t).iconPath), Z(o, "x", H(t).x + 28), Z(o, "y", H(t).y + 20), Z(o, "textLength", H(t).title.length * 6 > H(t).w - 36 ? H(t).w - 36 : void 0), q(s, H(t).title);
				}), K(e, n);
			}), P(t), V(() => Z(t, "viewBox", `${H(n).bounds.x} ${H(n).bounds.y} ${H(n).bounds.w} ${H(n).bounds.h}`)), K(e, t);
		}, l = (e) => {
			K(e, Hd());
		};
		J(o, (e) => {
			H(n) ? e(s) : e(l, -1);
		});
		var u = B(o, 2), f = R(u);
		P(u);
		var p = B(u, 2), m = (e) => {
			var n = Ud(), r = R(n);
			P(n), V(() => q(r, `${H(t).lesson.difficulty ?? ""} · ${H(t).lesson.focus ?? ""}`)), K(e, n);
		};
		J(p, (e) => {
			H(t).lesson && e(m);
		});
		var g = B(p, 2), v = R(g, !0);
		P(g), P(i);
		var y = B(i, 2), b = (e) => {
			var n = Nd();
			fo(R(n), { get issue() {
				return H(t).issue;
			} }), P(n), V(() => Z(n, "id", `pc-example-issue-${H(t).number}`)), K(e, n);
		};
		J(y, (e) => {
			H(t).issue && H(d) !== H(t).id && e(b);
		});
		var x = B(y, 2);
		P(r), V(() => {
			a = fi(i, 1, "pc-example-tile svelte-18p7ib8", null, a, { "pc-example-unavailable": !H(n) }), Z(i, "aria-label", H(t).title), Z(i, "aria-describedby", H(t).issue ? `pc-example-issue-${H(t).number}` : void 0), Z(i, "title", H(t).goal), i.disabled = !!H(c) || !H(n), q(f, `${H(t).number ?? ""}. ${H(t).title ?? ""}`), q(v, H(t).goal), Z(x, "data-example-id", H(t).id), Z(x, "aria-label", `Details for ${H(t).title}`), Z(x, "aria-expanded", H(d) === H(t).id);
		}), W("click", i, () => _(H(t).id)), W("click", x, () => h(H(t).id)), K(e, r);
	}), P(k), Mi(k, (e) => a = e, () => a), V(() => {
		q(O, `${H(p).length ?? ""} of ${n().length ?? ""} lessons`), Z(k, "aria-busy", !!H(c));
	}), Oi(C, () => H(l), (e) => L(l, e)), _i(T, () => H(u), (e) => L(u, e)), U("scroll", k, (e) => t.scroll(e.currentTarget.scrollTop)), K(e, v), We();
}
Er(["click"]);
//#endregion
//#region ui/ImportReview.svelte
var qd = /* @__PURE__ */ G("<p> </p>"), Jd = /* @__PURE__ */ G("<li> </li>"), Yd = /* @__PURE__ */ G("<h3>Saved bindings to review</h3><ul></ul>", 1), Xd = /* @__PURE__ */ G("<p>Saved model metadata is present. Review local connections before running.</p>"), Zd = /* @__PURE__ */ G("<h3>Imported terminal effects</h3><ul></ul>", 1), Qd = /* @__PURE__ */ G("<p>No imported terminal effects.</p>"), $d = /* @__PURE__ */ G("<div><!></div>"), ef = /* @__PURE__ */ G("<button type=\"button\" class=\"pc-btn menu_button\">Prepare again</button>"), tf = /* @__PURE__ */ G("<div class=\"pc-workspace-overlay pc-import-overlay\"><div class=\"pc-workspace-dialog pc-import-review\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Import into graph\" tabindex=\"-1\"><header><h2>Import into graph</h2><button type=\"button\" class=\"pc-btn menu_button\" aria-label=\"Cancel import\">×</button></header> <p><strong> </strong> <small> </small></p> <dl><dt>Phase</dt><dd> </dd><dt>Additions</dt><dd> </dd><dt>Conservative request bound</dt><dd> </dd></dl> <p class=\"pc-import-explanation\">This authoring bound includes unfinished branches. Bindings and reachable execution are checked when you explicitly run the workflow.</p> <!> <!> <!> <p>Insertion keeps internal wiring and relative layout. Review the inserted nodes before running the workflow.</p> <!> <footer><button type=\"button\" class=\"pc-btn menu_button\">Cancel</button><!><button type=\"button\" class=\"pc-btn menu_button pc-import-accept\">Insert into graph</button></footer></div></div>");
function nf(e, t) {
	let n = Rr();
	Ue(t, !0);
	let r;
	Pi(() => {
		let e = document.activeElement;
		return r.querySelector("button")?.focus(), () => e?.focus({ preventScroll: !0 });
	});
	function i(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), t.actions.cancelImport?.()), e.key === "Tab") {
			let t = [...r.querySelectorAll("button:not(:disabled)")], n = t[0], i = t.at(-1);
			e.shiftKey && document.activeElement === n && (e.preventDefault(), i?.focus()), !e.shiftKey && document.activeElement === i && (e.preventDefault(), n?.focus());
		}
	}
	var a = tf(), o = R(a), s = R(o), c = B(R(s));
	P(s);
	var l = B(s, 2), u = R(l), d = R(u, !0);
	P(u);
	var f = B(u, 2), p = R(f, !0);
	P(f), P(l);
	var m = B(l, 2), h = B(R(m)), g = R(h, !0);
	P(h);
	var _ = B(h, 2), v = R(_);
	P(_);
	var y = B(_, 2), b = R(y);
	P(y), P(m);
	var x = B(m, 4), S = (e) => {
		var n = qd(), r = R(n);
		P(n), V((e) => q(r, `Imported model roles: ${e ?? ""}.`), [() => t.view.requiredRoles.join(", ")]), K(e, n);
	};
	J(x, (e) => {
		t.view.requiredRoles.length && e(S);
	});
	var C = B(x, 2), w = (e) => {
		var n = Yd(), r = B(z(n));
		Y(r, 21, () => t.view.unresolvedBindings, qr, (e, t) => {
			var n = Jd(), r = R(n);
			P(n), V((e) => q(r, `${H(t).title ?? ""} · ${H(t).role ?? ""}: missing ${e ?? ""}`), [() => H(t).missing.join(" and ")]), K(e, n);
		}), P(r), K(e, n);
	}, T = (e) => {
		K(e, Xd());
	};
	J(C, (e) => {
		t.view.unresolvedBindings.length ? e(w) : t.view.bindingReviewRequired && e(T, 1);
	});
	var E = B(C, 2), D = (e) => {
		var n = Zd(), r = B(z(n));
		Y(r, 21, () => t.view.terminals, qr, (e, t) => {
			var n = Jd(), r = R(n);
			P(n), V(() => q(r, `${H(t).title ?? ""} · ${H(t).operation ?? ""}`)), K(e, n);
		}), P(r), K(e, n);
	}, O = (e) => {
		K(e, Qd());
	};
	J(E, (e) => {
		t.view.terminals.length ? e(D) : e(O, -1);
	});
	var k = B(E, 4), A = (e) => {
		var r = $d();
		fo(R(r), { get issue() {
			return t.view.error;
		} }), P(r), V(() => Z(r, "id", n + "-error")), K(e, r);
	};
	J(k, (e) => {
		t.view.error && e(A);
	});
	var j = B(k, 2), M = R(j), ee = B(M), te = (e) => {
		var n = ef();
		W("click", n, () => t.actions.prepareImportAgain?.()), K(e, n);
	};
	J(ee, (e) => {
		t.view.error && e(te);
	});
	var ne = B(ee);
	P(j), P(o), Mi(o, (e) => r = e, () => r), P(a), V(() => {
		q(d, t.view.name), q(p, t.view.fileName), q(g, t.view.phase), q(v, `${t.view.nodeCount ?? ""} blocks · ${t.view.wireCount ?? ""} wires · ${t.view.groupCount ?? ""} groups`), q(b, `${t.view.callBound ?? ""} total · ${t.view.importedCallBound ?? ""} imported`), Z(ne, "aria-describedby", t.view.error ? n + "-error" : void 0), ne.disabled = !!t.view.error;
	}), W("keydown", o, i), U("paste", o, (e) => e.stopPropagation()), W("click", c, () => t.actions.cancelImport?.()), W("click", M, () => t.actions.cancelImport?.()), W("click", ne, () => t.actions.acceptImport?.()), K(e, a), We();
}
Er(["keydown", "click"]);
//#endregion
//#region ui/WorkspaceReport.svelte
var rf = /* @__PURE__ */ G("<li class=\"svelte-1xdk4mm\"><!></li>"), af = /* @__PURE__ */ G("<ul></ul>"), of = /* @__PURE__ */ G("<p role=\"status\" class=\"svelte-1xdk4mm\">No validation issues found.</p>"), sf = /* @__PURE__ */ G("<p class=\"svelte-1xdk4mm\">Root workflow: <strong> </strong> </p> <!> <p class=\"svelte-1xdk4mm\">Validation checks the current workflow without running it. Diagnostic previews and Apply recheck their inputs when used.</p>", 1), cf = /* @__PURE__ */ G("<p class=\"svelte-1xdk4mm\">Workflow validation is unavailable.</p>"), lf = /* @__PURE__ */ G("<p class=\"svelte-1xdk4mm\"><strong> </strong></p> <p class=\"svelte-1xdk4mm\">Named-pin workflows, optional scene guidance and reviewed reply repairs for SillyTavern.</p> <p class=\"svelte-1xdk4mm\"><a target=\"_blank\" rel=\"noreferrer\" class=\"svelte-1xdk4mm\">Project guide</a></p>", 1), uf = /* @__PURE__ */ G("<p class=\"svelte-1xdk4mm\">Browse the node shelf by family. Select a node to read its controls, connections and help in Details.</p> <p class=\"svelte-1xdk4mm\"><a target=\"_blank\" rel=\"noreferrer\" class=\"svelte-1xdk4mm\">Open the complete node reference</a></p>", 1), df = /* @__PURE__ */ G("<table class=\"svelte-1xdk4mm\"><thead><tr><th class=\"svelte-1xdk4mm\">Action</th><th class=\"svelte-1xdk4mm\">Shortcut</th></tr></thead><tbody><tr><td class=\"svelte-1xdk4mm\">Undo / Redo</td><td class=\"svelte-1xdk4mm\">Ctrl Z / Ctrl Shift Z</td></tr><tr><td class=\"svelte-1xdk4mm\">Cut / Copy / Paste</td><td class=\"svelte-1xdk4mm\">Ctrl X / Ctrl C / Ctrl V</td></tr><tr><td class=\"svelte-1xdk4mm\">Duplicate / Delete selection</td><td class=\"svelte-1xdk4mm\">Ctrl D / Delete</td></tr><tr><td class=\"svelte-1xdk4mm\">Select all</td><td class=\"svelte-1xdk4mm\">Ctrl A</td></tr><tr><td class=\"svelte-1xdk4mm\">Group / Ungroup</td><td class=\"svelte-1xdk4mm\">Ctrl G / Ctrl Shift G</td></tr><tr><td class=\"svelte-1xdk4mm\">Comment selection / Add comment</td><td class=\"svelte-1xdk4mm\">C</td></tr><tr><td class=\"svelte-1xdk4mm\">Fit and center selection</td><td class=\"svelte-1xdk4mm\">F</td></tr><tr><td class=\"svelte-1xdk4mm\">Rename selection</td><td class=\"svelte-1xdk4mm\">F2</td></tr><tr><td class=\"svelte-1xdk4mm\">Pan / Zoom</td><td class=\"svelte-1xdk4mm\">Middle mouse / Wheel</td></tr><tr><td class=\"svelte-1xdk4mm\">Dismiss a menu or panel</td><td class=\"svelte-1xdk4mm\">Escape</td></tr></tbody></table> <p class=\"svelte-1xdk4mm\">In menus, use arrows to move, Home/End to jump, type a label to find it, and Enter/Space to choose it. Tab dismisses the menu.</p>", 1), ff = /* @__PURE__ */ G("<p class=\"svelte-1xdk4mm\">Browse node families on the floating shelf. Middle mouse pans the graph; the wheel zooms around the pointer. Use the dividers or their arrow keys to resize Preview and Details. View controls panel visibility and restores the default layout.</p> <p class=\"svelte-1xdk4mm\">File opens workflow documents, saves the current file, imports a fragment into the current graph, and exports a portable copy without local connections. Graph tabs open child views of the current document.</p> <p class=\"svelte-1xdk4mm\">Enable Lattice while the unified document is open, then Send in SillyTavern. Choose model connections on the node bar and advanced overrides in Details. Workflow › Configure opens Workflow Data, and Memory recall offers queue actions and an overview.</p> <p class=\"svelte-1xdk4mm\">Graph groups nodes, creates and saves subgraphs, adds comments and manages portals. Right-click actions remain available beside the relevant node or pin.</p> <p class=\"svelte-1xdk4mm\">Preview follows selection until you pin an output. Workflow › Run to current output tests its dependencies within the displayed request bound. Apply and Reject stay beside the exact result they review.</p> <p class=\"svelte-1xdk4mm\"><a target=\"_blank\" rel=\"noreferrer\" class=\"svelte-1xdk4mm\">Open the project guide</a> · <a target=\"_blank\" rel=\"noreferrer\" class=\"svelte-1xdk4mm\">Node reference</a></p>", 1);
function pf(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ F(() => t.workflow?.diagnostics ?? ao(t.workflow?.issues ?? []));
	var r = Lr(), i = z(r), a = (e) => {
		var r = Lr(), i = z(r), a = (e) => {
			var r = sf(), i = z(r), a = B(R(i)), o = R(a, !0);
			P(a);
			var s = B(a);
			P(i);
			var c = B(i, 2), l = (e) => {
				var t = af();
				Y(t, 21, () => H(n), (e) => e.id, (e, t) => {
					var n = rf();
					fo(R(n), { get diagnostic() {
						return H(t);
					} }), P(n), K(e, n);
				}), P(t), K(e, t);
			}, u = (e) => {
				K(e, of());
			};
			J(c, (e) => {
				H(n).length ? e(l) : e(u, -1);
			}), Me(2), V(() => {
				q(o, t.workflow.name), q(s, ` · ${t.workflow.phase ?? ""} · maximum ${t.workflow.callBound ?? ""} model requests.`);
			}), K(e, r);
		}, o = (e) => {
			K(e, cf());
		};
		J(i, (e) => {
			t.workflow ? e(a) : e(o, -1);
		}), K(e, r);
	}, o = (e) => {
		var n = lf(), r = z(n), i = R(r), a = R(i);
		P(i), P(r);
		var o = B(r, 4), s = R(o);
		P(o), V(() => {
			q(a, `Lattice ${t.version ?? ""}`), Z(s, "href", t.guideUrl);
		}), K(e, n);
	}, s = (e) => {
		var n = uf(), r = B(z(n), 2), i = R(r);
		P(r), V(() => Z(i, "href", t.referenceUrl)), K(e, n);
	}, c = (e) => {
		var t = df();
		Me(2), K(e, t);
	}, l = (e) => {
		var n = ff(), r = B(z(n), 10), i = R(r), a = B(i, 2);
		P(r), V(() => {
			Z(i, "href", t.guideUrl), Z(a, "href", t.referenceUrl);
		}), K(e, n);
	};
	J(i, (e) => {
		t.panel === "validate-workflow" ? e(a) : t.panel === "about" ? e(o, 1) : t.panel === "node-reference" ? e(s, 2) : t.panel === "shortcuts" ? e(c, 3) : e(l, -1);
	}), K(e, r), We();
}
var mf = {
	display_name: "Lattice",
	loading_order: 120,
	generate_interceptor: "latticeGenerationInterceptor",
	requires: [],
	optional: [],
	js: "index.js?v=0.27.0",
	css: "style.css",
	author: "Dulgadurbit",
	version: "0.27.0",
	homePage: "https://github.com/MentallyQuill/Lattice",
	auto_update: !1,
	description: "Build named-pin workflows for optional scene guidance and reviewed reply repairs in SillyTavern, with per-node model connections."
}, hf = /* @__PURE__ */ G("<div class=\"pc-native-diagnostic svelte-1dr9aew\"><!></div>"), gf = /* @__PURE__ */ G("<p>Browse node families on the floating shelf. Middle mouse pans the graph; the wheel zooms around the pointer. Use the dividers or their arrow keys to resize Preview and Details. View controls panel visibility; View › Reset panel layout restores the default layout.</p><p>Open examples from File to start a workflow document. A unified workflow's preparation stage feeds Generate Reply, and its response stage reshapes the captured Draft before Review and Publish. Choose each model node's connection with the bar under it. Details contains advanced model overrides and inheritance settings. Enable Lattice runs the open document for Send in SillyTavern. Run to here tests supported nodes; Workflow › Stop workflow cancels the current run. Retired pre and post workflows remain available only for archived export.</p><p>File › New workflow, Open workflow, Open Recent and Open examples replace the open document after offering Save, Don't Save or Cancel for unsaved changes. Save writes the current file; Save As chooses a destination. Save As creates a JSON copy when direct file saving is unavailable. Export workflow JSON makes a portable sharing copy without local connections. Import into graph reviews a compatible fragment before one undoable insertion. Recover previous workflows opens unified documents preserved from earlier settings. File › Export archived workflows preserves retired originals for reference. Recovery drafts remain available in SillyTavern, while the filename and document status describe the current file.</p><p>Select nodes and right-click Create Subgraph to open their connected body in a new tab. Double-click a subgraph to open it. Add Input and Output nodes from the Subgraphs shelf inside an editable subgraph, then name and configure their ports in Details.</p><p>Right-click a subgraph block and choose Add to Subgraphs to save it for reuse. Right-click a saved shelf entry to delete it. Saving updates the shelf only when you choose to save; existing placed copies stay unchanged. Portals connect pins through named references. Preview artifact tabs show results for the selected node; Run to here checks the request bound before running. Apply reviews the fresh result against the full root workflow.</p><p><a target=\"_blank\" rel=\"noreferrer\" class=\"svelte-1dr9aew\">Open the project guide</a> · <a target=\"_blank\" rel=\"noreferrer\" class=\"svelte-1dr9aew\">Node reference</a></p>", 1), _f = /* @__PURE__ */ G("<div class=\"pc-workspace-overlay\"><div role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\"><header class=\"svelte-1dr9aew\"><h2 class=\"svelte-1dr9aew\"> </h2><button type=\"button\" class=\"pc-btn menu_button\"> </button></header> <!></div></div>"), vf = /* @__PURE__ */ G("<div class=\"pc-workspace-overlay\"><div class=\"pc-manager-dialog svelte-1dr9aew\" role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\" aria-label=\"Manage portals\"><!></div></div>"), yf = /* @__PURE__ */ G("<div role=\"dialog\" aria-modal=\"true\" aria-label=\"Lattice\" data-pc-workbench=\"svelte\"><!> <div class=\"pc-body\" role=\"region\" aria-label=\"Workspace panels\" tabindex=\"0\"><div class=\"pc-stage\"><section aria-label=\"Output preview\"><header class=\"pc-preview-pane-head\"><strong>Preview</strong><button type=\"button\" class=\"pc-btn menu_button\"> </button></header> <div class=\"pc-preview-content\"><!></div></section> <!> <!> <!> <div class=\"pc-canvas-area\" id=\"pc-workspace-graph\" role=\"tabpanel\"><div class=\"pc-workspace-run svelte-1dr9aew\"><!></div> <div class=\"pc-canvas-host\" aria-label=\"Node canvas\"></div> <!> <div><!></div></div></div> <!> <div class=\"pc-inspector pc-workspace-details svelte-1dr9aew\"><header class=\"pc-details-heading svelte-1dr9aew\"><strong class=\"svelte-1dr9aew\">Details</strong><button type=\"button\" aria-label=\"Close Details\" title=\"Close Details\">×</button></header> <!> <div class=\"pc-node-details-holder svelte-1dr9aew\"><!></div></div></div> <!> <!> <!> <!> <!> <!> <!> <!></div>");
function bf(e, t) {
	Ue(t, !0);
	let n = Ni(t, "actions", 7), r = /* @__PURE__ */ I({
		graphId: "",
		enabled: !1,
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
		});
	}
	function m(e) {
		return u?.startRename(e);
	}
	async function h(e, t) {
		if (await mr(), !t()) return;
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
	let v = _(), y = /* @__PURE__ */ I(tn(v.height)), b = /* @__PURE__ */ I(tn(v.collapsed)), x = /* @__PURE__ */ I(500), S = /* @__PURE__ */ I(tn(v.shelfOpen)), C = /* @__PURE__ */ I(null), w = /* @__PURE__ */ I(520), T = /* @__PURE__ */ F(() => Math.max(220, Math.min(H(w), H(C) ?? H(r).detailsWidth ?? 258)));
	function E(e) {
		L(C, null), L(r, {
			...H(r),
			detailsWidth: e
		}), n().resizeDetails?.(e);
	}
	let D = /* @__PURE__ */ I(""), O = /* @__PURE__ */ F(() => ({
		examples: "Examples",
		"run-details": "Run details",
		"story-documents": "Workflow Data",
		"memory-recall": "Memory recall",
		"validate-workflow": "Workflow validation",
		"node-reference": "Node reference",
		shortcuts: "Keyboard shortcuts",
		about: "About Lattice"
	})[H(D)] ?? "Workspace guide"), k = /* @__PURE__ */ F(() => H(r).rootWorkflow ?? H(r).workflow), A = /* @__PURE__ */ F(() => `${H(r).menuContextKey ?? ""}:${H(r).graphId}:${H(r).graphViews?.active.key ?? ""}:${H(r).graphViews?.viewEpoch ?? ""}`), j = /* @__PURE__ */ F(() => n().logoUrl ? new URL("../docs/node-reference.md", n().logoUrl).href : ""), M = /* @__PURE__ */ F(() => n().logoUrl ? new URL("../README.md", n().logoUrl).href : ""), ee = /* @__PURE__ */ I(null), te = null, ne = 0, re = /* @__PURE__ */ I(0), ie;
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
		e === "pin-preview" ? n().outputPreview?.pin?.(t.sourceKey, a) : e === "run-preview" && t.runHere?.enabled && !t.busy && !H(k)?.ownedBusy && (se(!1), n().outputPreview?.runHere?.(t.sourceKey, a));
	}
	async function ue(e) {
		if (e === "show-preview") se(!1);
		else if (e === "collapse-preview") se(!0);
		else if (e === "toggle-preview") se(!H(b));
		else if (e === "toggle-shelf") oe(), L(S, !H(S)), ae();
		else if (e === "reset-layout") oe(), L(y, 240), L(b, !1), L(S, !0), E(258), H(r).inspectorOpen || n().command("inspector"), ae();
		else if (e === "add-node") L(S, !0), ae(), await mr(), ie.openSearch();
		else if ([
			"follow-preview",
			"pin-preview",
			"run-preview"
		].includes(e)) le(e);
		else {
			te = document.activeElement, e === "examples" && n().refreshExamples?.(), e === "story-documents" && n().storyDocuments?.refresh?.(), e === "memory-recall" && n().recall?.refresh?.();
			let t = ++ne;
			L(D, e, !0), await mr(), t === ne && H(D) === e && H(ee)?.querySelector("button")?.focus();
		}
	}
	function de() {
		ne++, L(D, ""), te?.focus({ preventScroll: !0 });
	}
	async function fe(e) {
		let t = ne;
		try {
			let r = await n().openExample?.(e);
			return r === !0 && t === ne && H(D) === "examples" && de(), r === !0;
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
			let t = [...H(ee).querySelectorAll("a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex=\"0\"]")], n = t[0], r = t.at(-1);
			e.shiftKey && document.activeElement === n && (e.preventDefault(), r?.focus()), !e.shiftKey && document.activeElement === r && (e.preventDefault(), n?.focus());
		}
	}
	Pi(() => {
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
	}, ge = yf();
	let _e, ve;
	var ye = R(ge);
	{
		let e = /* @__PURE__ */ F(() => ({
			previewOpen: !H(b),
			shelfOpen: H(S)
		}));
		Mi(Ho(ye, {
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
	var be = B(ye, 2), xe = R(be), Se = R(xe);
	let Ce, we;
	var Te = R(Se), Ee = B(R(Te)), De = R(Ee, !0);
	P(Ee), P(Te);
	var N = B(Te, 2), Oe = R(N);
	{
		let e = /* @__PURE__ */ F(() => H(r).outputPreview ?? null);
		bl(Oe, {
			get view() {
				return H(e);
			},
			get actions() {
				return n().outputPreview;
			},
			collapse: () => se(!0)
		});
	}
	P(N), P(Se);
	var ke = B(Se, 2), Ae = (e) => {
		{
			let t = /* @__PURE__ */ F(() => Math.min(H(y), H(x)));
			Wo(e, {
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
	J(ke, (e) => {
		H(b) || e(Ae);
	});
	var je = B(ke, 2);
	Mi(ns(je, {
		get views() {
			return H(r).graphViews;
		},
		get actions() {
			return n().graphViewActions;
		},
		panelId: "pc-workspace-graph"
	}), (e) => u = e, () => u);
	var Me = B(je, 2);
	{
		let e = /* @__PURE__ */ F(() => H(r).graphViews?.active);
		ss(Me, {
			get view() {
				return H(e);
			},
			get actions() {
				return n().graphViewActions;
			}
		});
	}
	var Ne = B(Me, 2), Pe = R(Ne), Fe = R(Pe);
	{
		let e = /* @__PURE__ */ F(() => H(r).runMeter ?? null);
		Pl(Fe, {
			get view() {
				return H(e);
			},
			open: () => {
				L(D, "run-details");
			}
		});
	}
	P(Pe);
	var Ie = B(Pe, 2);
	Mi(Ie, (e) => o = e, () => o);
	var Le = B(Ie, 2), Re = (e) => {
		var t = hf();
		fo(R(t), { get issue() {
			return H(r).nativeDiagnostic;
		} }), P(t), K(e, t);
	};
	J(Le, (e) => {
		H(r).nativeDiagnostic && e(Re);
	});
	var ze = B(Le, 2);
	Mi(Td(R(ze), {
		get view() {
			return H(r).workflow;
		},
		get insertionContextKey() {
			return H(A);
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
		}
	}), (e) => ie = e, () => ie), P(ze), P(Ne), P(xe), Mi(xe, (e) => s = e, () => s);
	var Be = B(xe, 2), Ve = (e) => {
		var t = Lr();
		Kr(z(t), () => H(r).graphViews?.active.key ?? H(r).graphId, (e) => {
			Ko(e, {
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
	J(Be, (e) => {
		H(r).inspectorOpen && e(Ve);
	});
	var He = B(Be, 2), Ge = R(He), Ke = B(R(Ge));
	P(Ge);
	var qe = B(Ge, 2), Je = (e) => {
		let t = /* @__PURE__ */ F(() => H(r).commentDetails);
		el(e, {
			get comment() {
				return H(t).comment;
			},
			onPatch: (e) => n().commentDetails?.patch(H(t).selection, e),
			onCommand: (e) => n().commentDetails?.command(H(t).selection, e)
		});
	};
	J(qe, (e) => {
		H(r).commentDetails && e(Je);
	});
	var Ye = B(qe, 2), Xe = R(Ye);
	{
		let e = /* @__PURE__ */ F(() => H(r).commentDetails ? null : H(r).nodeDetails ?? null);
		Zc(Xe, {
			get view() {
				return H(e);
			},
			get actions() {
				return n().nodeDetails;
			}
		});
	}
	P(Ye), P(He), Mi(He, (e) => c = e, () => c), P(be), Mi(be, (e) => a = e, () => a);
	var Ze = B(be, 2), Qe = (e) => {
		var t = _f(), i = R(t);
		let a;
		var o = R(i), s = R(o), c = R(s, !0);
		P(s);
		var l = B(s), u = R(l, !0);
		P(l), P(o);
		var d = B(o, 2), f = (e) => {
			Kd(e, {
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
		}, p = (e) => {
			{
				let t = /* @__PURE__ */ F(() => H(r).recall ?? null), i = /* @__PURE__ */ F(() => ({
					...n().recall,
					reveal: (e) => {
						de(), n().recall?.reveal(e);
					}
				}));
				Mu(e, {
					get view() {
						return H(t);
					},
					get actions() {
						return H(i);
					}
				});
			}
		}, m = (e) => {
			{
				let t = /* @__PURE__ */ F(() => H(r).storyDocuments ?? {
					key: "",
					revision: "",
					scope: {
						userId: "",
						chatId: ""
					},
					documents: [],
					issue: "Workflow Data setup is unavailable."
				});
				wu(e, {
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
				let t = /* @__PURE__ */ F(() => H(r).runDetails ?? null);
				Al(e, {
					get view() {
						return H(t);
					},
					get actions() {
						return n().runDetails;
					}
				});
			}
		}, g = (e) => {
			pf(e, {
				get panel() {
					return H(D);
				},
				get workflow() {
					return H(k);
				},
				get version() {
					return mf.version;
				},
				get referenceUrl() {
					return H(j);
				},
				get guideUrl() {
					return H(M);
				}
			});
		}, _ = (e) => {
			var t = gf(), n = B(z(t), 5), r = R(n), i = B(r, 2);
			P(n), V(() => {
				Z(r, "href", H(M)), Z(i, "href", H(j));
			}), K(e, t);
		};
		J(d, (e) => {
			H(D) === "examples" ? e(f) : H(D) === "memory-recall" ? e(p, 1) : H(D) === "story-documents" ? e(m, 2) : H(D) === "run-details" ? e(h, 3) : H(D) === "help" ? e(_, -1) : e(g, 4);
		}), P(i), Mi(i, (e) => L(ee, e), () => H(ee)), P(t), V(() => {
			a = fi(i, 1, "pc-workspace-dialog svelte-1dr9aew", null, a, { "pc-examples-dialog": H(D) === "examples" }), Z(i, "aria-label", H(O)), q(c, H(O)), Z(l, "aria-label", H(D) === "memory-recall" ? "Close" : "Close panel"), q(u, H(D) === "memory-recall" ? "Close" : "×");
		}), W("keydown", i, me), U("paste", i, (e) => e.stopPropagation()), W("click", l, de), K(e, t);
	};
	J(Ze, (e) => {
		H(D) && e(Qe);
	});
	var $e = B(Ze, 2);
	$u($e, {
		get view() {
			return H(r).nativeSearch;
		},
		get actions() {
			return n().nativeSearch;
		}
	});
	var et = B($e, 2);
	id(et, {
		get view() {
			return H(r).nativePinMenu;
		},
		get actions() {
			return n().nativePinMenu;
		}
	});
	var tt = B(et, 2), nt = (e) => {
		var t = vf(), i = R(t);
		Ql(R(i), {
			get view() {
				return H(r).portalManager;
			},
			get actions() {
				return n().portalManager;
			}
		}), P(i), P(t), W("keydown", i, pe), U("paste", i, (e) => e.stopPropagation()), K(e, t);
	};
	J(tt, (e) => {
		H(r).portalManager && e(nt);
	});
	var rt = B(tt, 2), it = (e) => {
		zu(e, {
			get view() {
				return H(r).configureNode;
			},
			get actions() {
				return n().configureNode;
			}
		});
	};
	J(rt, (e) => {
		H(r).configureNode && e(it);
	});
	var at = B(rt, 2), ot = (e) => {
		nu(e, {
			get view() {
				return H(r).subgraphSave;
			},
			get actions() {
				return n().subgraphSave;
			}
		});
	};
	J(at, (e) => {
		H(r).subgraphSave && e(ot);
	});
	var st = B(at, 2), ct = (e) => {
		nf(e, {
			get view() {
				return H(r).importReview;
			},
			get actions() {
				return n();
			}
		});
	};
	J(st, (e) => {
		H(r).importReview && e(ct);
	});
	var lt = B(st, 2), ut = (e) => {
		{
			let t = /* @__PURE__ */ F(() => H(r).document?.native ?? !1);
			Uu(e, {
				get view() {
					return H(r).documentPrompt;
				},
				get actions() {
					return n().documentPrompt;
				},
				get native() {
					return H(t);
				}
			});
		}
	};
	return J(lt, (e) => {
		H(r).documentPrompt && e(ut);
	}), P(ge), Mi(ge, (e) => i = e, () => i), V((e) => {
		_e = fi(ge, 1, "pc-root pc-native-workspace svelte-1dr9aew", null, _e, { "pc-native-flat": H(r).nativeFlatCanvas }), ve = mi(ge, "", ve, { "--pc-details-width": `${H(T)}px` }), Ce = fi(Se, 1, "pc-preview-pane", null, Ce, { "pc-preview-collapsed": H(b) }), we = mi(Se, "", we, e), Z(Ee, "aria-label", H(b) ? "Expand preview" : "Collapse preview"), Z(Ee, "title", H(b) ? "Expand preview" : "Collapse preview"), Z(Ee, "aria-expanded", !H(b)), q(De, H(b) ? "▾" : "▴"), Z(N, "hidden", H(b)), Z(ze, "hidden", !H(S)), Z(He, "hidden", !H(r).inspectorOpen), Z(Ye, "hidden", !!H(r).commentDetails);
	}, [() => ({ "--pc-preview-height": `${Math.min(H(y), H(x))}px` })]), W("click", Ee, () => se(!H(b))), W("click", Ke, () => n().command("inspector")), K(e, ge), We(he);
}
Er(["click", "keydown"]);
//#endregion
//#region ui/entry.js
function xf(e, t) {
	let n = document.createElement("div");
	n.style.cssText = "position:absolute;left:0;top:0;visibility:hidden;pointer-events:none", n.setAttribute("aria-hidden", "true"), n.inert = !0, e.append(n);
	let r;
	try {
		r = zr($i, {
			target: n,
			props: {
				card: t,
				actions: {
					hoverPin() {},
					hostResult() {}
				}
			}
		}), zt();
		let { width: e, height: i } = n.querySelector(".pc-node").getBoundingClientRect();
		return {
			width: e,
			height: i
		};
	} finally {
		r && Ur(r), n.remove();
	}
}
function Sf(e, t) {
	let n = zr(So, {
		target: e,
		props: { actions: t }
	});
	return zt(), {
		...n.getLayers(),
		setComments: (e, t) => zt(() => n.setComments(e, t)),
		setRecallStatus: (e) => zt(() => n.setRecallStatus(e)),
		setNodes: (e) => zt(() => n.setNodes(e)),
		setNodeProfiles: (e) => zt(() => n.setNodeProfiles(e)),
		setGroups: (e) => zt(() => n.setGroups(e)),
		setWires: (e, t, r) => zt(() => n.setWires(e, t, r)),
		setPositions: (e, t) => zt(() => n.setPositions(e, t)),
		destroy: () => Ur(n)
	};
}
function Cf(e, t) {
	let n = zr(bf, {
		target: e,
		props: { actions: t }
	});
	return zt(), {
		...n.getParts(),
		update: (e) => zt(() => n.update(e)),
		updateActions: (e) => zt(() => n.updateActions(e)),
		revealPreview: () => zt(() => n.revealPreview()),
		renameGraphView: (e) => n.renameGraphView(e),
		focusCommentTitle: (e, t) => n.focusCommentTitle(e, t),
		destroy: () => Ur(n)
	};
}
//#endregion
export { xf as measureNodeCard, Sf as mountCanvas, Cf as mountWorkbench };
