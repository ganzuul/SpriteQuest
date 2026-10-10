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
var m = 1024, h = 2048, g = 4096, _ = 8192, v = 16384, y = 32768, b = 1 << 25, x = 65536, S = 1 << 19, C = 1 << 20, w = 1 << 25, T = 65536, E = 1 << 21, D = 1 << 22, O = 1 << 23, k = Symbol("$state"), A = Symbol("legacy props"), ee = Symbol(""), te = Symbol("attributes"), ne = Symbol("class"), re = Symbol("style"), ie = Symbol("text"), ae = Symbol("form reset"), oe = new class extends Error {
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
var j = !1;
function De(e) {
	j = e;
}
var M;
function Oe(e) {
	if (e === null) throw we(), be;
	return M = e;
}
function ke() {
	return Oe(/* @__PURE__ */ ln(M));
}
function N(e) {
	if (j) {
		if (/* @__PURE__ */ ln(M) !== null) throw we(), be;
		M = e;
	}
}
function Ae(e = 1) {
	if (j) {
		for (var t = e, n = M; t--;) n = /* @__PURE__ */ ln(n);
		M = n;
	}
}
function je(e = !0) {
	for (var t = 0, n = M;;) {
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
		r: U,
		l: null
	};
}
function He(e) {
	var t = ze, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) bn(r);
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
	var t = U;
	if (t === null) return H.f |= O, e;
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
var Xe = ~(h | g | m);
function Ze(e, t) {
	e.f = e.f & Xe | t;
}
function Qe(e) {
	e.f & 512 || e.deps === null ? Ze(e, m) : Ze(e, g);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
function $e(e) {
	if (e !== null) for (let t of e) t.f & 2 && t.f & 65536 && (t.f ^= T, $e(t.deps));
}
function et(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), $e(e.deps), Ze(e, m);
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
	j && /* @__PURE__ */ cn(e) !== null && un(e);
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
	var t = H, n = U;
	Un(null), Wn(null);
	try {
		return e();
	} finally {
		Un(t), Wn(n);
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
		_n() && (W(n), wn(() => (t === 0 && (r = dr(() => e(() => Xt(n)))), t += 1, () => {
			Ke(() => {
				--t, t === 0 && (r?.(), r = void 0, Xt(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var lt = x | S;
function ut(e, t, n, r) {
	new dt(e, t, n, r);
}
var dt = class {
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
	#h = ct(() => (this.#m = Kt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = U;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = U.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = Tn(() => {
			if (j) {
				let e = this.#t;
				ke();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, lt), j && (this.#e = M);
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
			t ? Ee() : (t = !0, n && ye(), this.#s !== null && Nn(this.#s, () => {
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
			}), this.#x(F));
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
			} else this.#x(F);
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
		var t = U, n = H, r = ze;
		Wn(this.#i), Un(this.#i), Be(this.#i.ctx);
		try {
			return Ft.ensure(), e();
		} catch (e) {
			return Je(e), null;
		} finally {
			Wn(t), Un(n), Be(r);
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
		return this.#h(), W(this.#m);
	}
	error(e) {
		if (!this.#n.onerror && !this.#n.failed) throw e;
		F?.is_fork ? (this.#a && F.skip_effect(this.#a), this.#o && F.skip_effect(this.#o), this.#s && F.skip_effect(this.#s), F.oncommit(() => {
			this.#w(e);
		})) : this.#w(e);
	}
	#w(e) {
		this.#a &&= (An(this.#a), null), this.#o &&= (An(this.#o), null), this.#s &&= (An(this.#s), null), j && (Oe(this.#t), Ae(), Oe(je()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return En(() => {
						var r = U;
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
	var s = U, c = pt(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
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
	var e = U, t = H, n = ze, r = F;
	return function(i = !0) {
		Wn(e), Un(t), Be(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function mt(e = !0) {
	Wn(null), Un(null), Be(null), e && F?.deactivate();
}
function ht() {
	var e = U, t = e.b, n = F, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function gt(e) {
	var t = 2 | h;
	return U !== null && (U.f |= S), {
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
		parent: U,
		ac: null
	};
}
var _t = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function vt(e, t, n) {
	let r = U;
	r === null && le();
	var i = void 0, a = Kt(xe), o = !H, s = /* @__PURE__ */ new Set();
	return Cn(() => {
		var t = U, n = p();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== oe && n.reject(e);
			}).finally(mt);
		} catch (e) {
			n.reject(e), mt();
		}
		var c = F;
		if (o) {
			if (t.f & 32768) var l = ht();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(_t);
			else for (let e of s.values()) e.reject(_t);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== _t && (c.activate(), t ? (a.f |= O, Jt(a, t)) : (a.f & 8388608 && (a.f ^= O), Jt(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), vn(() => {
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
function P(e) {
	let t = /* @__PURE__ */ gt(e);
	return Kn(t), t;
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
		for (var n = 0; n < t.length; n += 1) An(t[n]);
	}
}
function xt(e) {
	var t, n = U, r = e.parent;
	if (!Bn && r !== null && e.v !== xe && r.f & 24576) return Ce(), e.v;
	Wn(r);
	try {
		e.f &= ~T, bt(e), t = ir(e);
	} finally {
		Wn(n);
	}
	return t;
}
function St(e) {
	var t = xt(e);
	!e.equals(t) && (e.wv = tr(), (!F?.is_fork || e.deps === null) && (F === null ? e.v = t : (F.capture(e, t, !0), Et?.capture(e, t, !0)), e.deps === null)) ? Ze(e, m) : Bn || (Dt === null ? Qe(e) : (_n() || F?.is_fork) && Dt.set(e, t));
}
function Ct(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && ot(() => {
		t.ac.abort(oe), t.ac = null;
	}), t.fn !== null && (t.teardown = d), or(t, 0), On(t));
}
function wt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && sr(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
var Tt = null, F = null, Et = null, Dt = null, Ot = null, kt = !1, At = !1, jt = null, Mt = null, Nt = 0, Pt = 1, Ft = class e {
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
			for (var r of n.d) Ze(r, h), t(r);
			for (r of n.m) Ze(r, g), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, Nt++ > 1e3 && (this.#x(), Lt());
		for (let e of this.#u) this.#d.delete(e), Ze(e, h), this.schedule(e);
		for (let e of this.#d) Ze(e, g), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = jt = [], r = [], i = Mt = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw Ht(e), this.#h() || this.discard(), t;
		}
		if (F = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (jt = null, Mt = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) Vt(e, t);
			i.length > 0 && F.#g();
			return;
		}
		let o = this.#v();
		if (o) this.#b(r), this.#b(n), o.#y(this);
		else {
			this.#u.clear(), this.#d.clear();
			for (let e of this.#r) e(this);
			this.#r.clear(), Et = this, zt(r), zt(n), Et = null, this.#s?.resolve();
			var s = F;
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
		e.f ^= m;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= m : i & 4 ? t.push(r) : nr(r) && (i & 16 && this.#d.add(r), sr(r));
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), Ze(i, h), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), F = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) et(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== xe && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), Dt?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		F = this;
	}
	deactivate() {
		F = null, Dt = null;
	}
	flush() {
		try {
			At = !0, F = this, this.#g();
		} finally {
			Nt = 0, Ot = null, jt = null, Mt = null, At = !1, F = null, Dt = null, Wt.clear();
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
		if (F === null) {
			let t = F = new e();
			!At && !kt && Ke(() => {
				t.#e || t.flush();
			});
		}
		return F;
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
				if (jt !== null && t === U && (H === null || !(H.f & 2))) return;
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
			e === null || (e.#n = t), t === null ? Tt = e : t.#t = e, this.linked = !1;
		}
	}
};
function It(e) {
	var t = kt;
	kt = !0;
	try {
		var n;
		for (e && (F !== null && !F.is_fork && F.flush(), n = e());;) {
			if (qe(), F === null) return n;
			F.flush();
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
	F.schedule(e);
}
function Vt(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), Ze(e, m);
		for (var n = e.first; n !== null;) Vt(n, t), n = n.next;
	}
}
function Ht(e) {
	Ze(e, m);
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
function I(e, t) {
	let n = Kt(e, t);
	return Kn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function qt(e, t = !1, n = !0) {
	let r = Kt(e);
	return t || (r.equals = Fe), r;
}
function L(e, t, n = !1) {
	return H !== null && (!Hn || H.f & 131072) && Ue() && H.f & 4325394 && (Gn === null || !Gn.has(e)) && ve(), Jt(e, n ? Qt(t) : t, Mt);
}
function Jt(e, t, n = null) {
	if (!e.equals(t)) {
		Bn ? Wt.set(e, t) : Wt.has(e) || Wt.set(e, e.v);
		var r = Ft.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && xt(t), Dt === null && Qe(t);
		}
		e.wv = tr(), Zt(e, h, n), Ue() && U !== null && U.f & 1024 && !(U.f & 96) && (Yn === null ? Xn([e]) : Yn.push(e)), !r.is_fork && Ut.size > 0 && !Gt && Yt();
	}
	return t;
}
function Yt() {
	Gt = !1;
	for (let e of Ut) {
		e.f & 1024 && Ze(e, g);
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
	L(e, e.v + 1);
}
function Zt(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = Ue(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (i || s !== U) {
			var l = (c & h) === 0;
			if (l && Ze(s, t), c & 131072) Ut.add(s);
			else if (c & 2) {
				var u = s;
				Dt?.delete(u), c & 65536 || (c & 512 && (U === null || !(U.f & 2097152)) && (s.f |= T), Zt(u, g, n));
			} else if (l) {
				var d = s;
				c & 16 && Rt !== null && Rt.add(d), n === null ? Bt(d) : n.push(d);
			}
		}
	}
}
function Qt(t) {
	if (typeof t != "object" || !t || k in t) return t;
	let n = l(t);
	if (n !== s && n !== c) return t;
	var r = /* @__PURE__ */ new Map(), i = e(t), o = /* @__PURE__ */ I(0), u = null, d = $n, f = (e) => {
		if ($n === d) return e();
		var t = H, n = $n;
		Un(null), er(d);
		var r = e();
		return Un(t), er(n), r;
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
					r.set(t, e), Xt(o);
				}
			} else L(n, xe), Xt(o);
			return !0;
		},
		get(e, n, i) {
			if (n === k) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ I(Qt(s ? e[n] : xe), u)), r.set(n, o)), o !== void 0) {
				var c = W(o);
				return c === xe ? void 0 : c;
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
			return (n !== void 0 || U !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ I(i ? Qt(e[t]) : xe, u)), r.set(t, n)), W(n) === xe) ? !1 : i;
		},
		set(e, t, n, s) {
			var c = r.get(t), l = t in e;
			if (i && t === "length") for (var d = n; d < c.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ I(xe, u)), r.set(d + "", p)) : L(p, xe);
			}
			if (c === void 0) (!l || a(e, t)?.writable) && (c = f(() => /* @__PURE__ */ I(void 0, u)), L(c, Qt(n)), r.set(t, c));
			else {
				l = c.v !== xe;
				var m = f(() => Qt(n));
				L(c, m);
			}
			var h = Reflect.getOwnPropertyDescriptor(e, t);
			if (h?.set && h.set.call(s, n), !l) {
				if (i && typeof t == "string") {
					var g = r.get("length"), _ = Number(t);
					Number.isInteger(_) && _ >= g.v && L(g, _ + 1);
				}
				Xt(o);
			}
			return !0;
		},
		ownKeys(e) {
			W(o);
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
		if (typeof e == "object" && e && k in e) return e[k];
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
		rn = a(t, "firstChild").get, an = a(t, "nextSibling").get, u(e) && (e[ne] = void 0, e[te] = null, e[re] = void 0, e.__e = void 0), u(n) && (n[ie] = void 0);
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
function R(e, t) {
	if (!j) return /* @__PURE__ */ cn(e);
	var n = /* @__PURE__ */ cn(M);
	if (n === null) n = M.appendChild(sn());
	else if (t && n.nodeType !== 3) {
		var r = sn();
		return n?.before(r), Oe(r), r;
	}
	return t && pn(n), Oe(n), n;
}
function z(e, t = !1) {
	if (!j) {
		var n = /* @__PURE__ */ cn(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ ln(n) : n;
	}
	if (t) {
		if (M?.nodeType !== 3) {
			var r = sn();
			return M?.before(r), Oe(r), r;
		}
		pn(M);
	}
	return M;
}
function B(e, t = 1, n = !1) {
	let r = j ? M : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ ln(r);
	if (!j) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = sn();
			return r === null ? i?.after(a) : r.before(a), Oe(a), a;
		}
		pn(r);
	}
	return Oe(r), r;
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
	U === null && (H === null && pe(e), fe()), Bn && de(e);
}
function hn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function gn(e, t) {
	var n = U;
	n !== null && n.f & 8192 && (e |= _);
	var r = {
		ctx: ze,
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
	F?.register_created_effect(r);
	var i = r;
	if (e & 4) jt === null ? Ft.ensure().schedule(r) : jt.push(r);
	else if (t !== null) {
		try {
			sr(r);
		} catch (e) {
			throw An(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= x));
	}
	if (i !== null && (i.parent = n, n !== null && hn(i, n), H !== null && H.f & 2 && !(e & 64))) {
		var a = H;
		(a.effects ??= []).push(i);
	}
	return r;
}
function _n() {
	return H !== null && !Hn;
}
function vn(e) {
	let t = gn(8, null);
	return Ze(t, m), t.teardown = e, t;
}
function yn(e) {
	mn("$effect");
	var t = U.f;
	if (!H && t & 32 && ze !== null && !ze.i) {
		var n = ze;
		(n.e ??= []).push(e);
	} else return bn(e);
}
function bn(e) {
	return gn(4 | C, e);
}
function xn(e) {
	Ft.ensure();
	let t = gn(64 | S, e);
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
	return gn(D | S, e);
}
function wn(e, t = 0) {
	return gn(8 | t, e);
}
function V(e, t = [], n = [], r = []) {
	ft(r, t, n, (t) => {
		gn(8, () => {
			e(...t.map(W));
		});
	});
}
function Tn(e, t = 0) {
	return gn(16 | t, e);
}
function En(e) {
	return gn(32 | S, e);
}
function Dn(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = Bn, n = H;
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
		e !== null && ot(() => {
			e.abort(oe);
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
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (jn(e.nodes.start, e.nodes.end), n = !0), e.f |= b, On(e, t && !n), or(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	Dn(e), e.f ^= b, e.f |= v;
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
		e.f ^= _;
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
		e.f ^= _, e.f & 1024 || (Ze(e, h), Ft.ensure().schedule(e));
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
var H = null, Hn = !1;
function Un(e) {
	H = e;
}
var U = null;
function Wn(e) {
	U = e;
}
var Gn = null;
function Kn(e) {
	H !== null && (Gn ??= /* @__PURE__ */ new Set()).add(e);
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
	if (t & 2 && (e.f &= ~T), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (nr(a) && St(a), a.wv > e.wv) return !0;
		}
		t & 512 && Dt === null && Ze(e, m);
	}
	return !1;
}
function rr(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Gn !== null && Gn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? rr(a, t, !1) : t === a && (n ? Ze(a, h) : a.f & 1024 && Ze(a, g), Bt(a));
	}
}
function ir(e) {
	var t = qn, n = Jn, r = Yn, i = H, a = Gn, o = ze, s = Hn, c = $n, l = e.f;
	qn = null, Jn = 0, Yn = null, H = l & 96 ? null : e, Gn = null, Be(e.ctx), Hn = !1, $n = ++Qn, e.ac !== null && (ot(() => {
		e.ac.abort(oe);
	}), e.ac = null);
	try {
		e.f |= E;
		var u = e.fn, d = u();
		e.f |= y;
		var f = e.deps, p = F?.is_fork;
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
		return e.f & 8388608 && (e.f ^= O), d;
	} catch (e) {
		return Je(e);
	} finally {
		e.f ^= E, qn = t, Jn = n, Yn = r, H = i, Gn = a, Be(o), Hn = s, $n = c;
	}
}
function ar(e, r) {
	let i = r.reactions;
	if (i !== null) {
		var a = t.call(i, e);
		if (a !== -1) {
			var o = i.length - 1;
			o === 0 ? i = r.reactions = null : (i[a] = i[o], i.pop());
		}
	}
	if (i === null && r.f & 2 && (qn === null || !n.call(qn, r))) {
		var s = r;
		s.f & 512 && (s.f ^= 512, s.f &= ~T), s.v !== xe && Qe(s), s.ac !== null && ot(() => {
			s.ac.abort(oe), s.ac = null, Ze(s, h);
		}), Ct(s), or(s, 0);
	}
}
function or(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) ar(e, n[r]);
}
function sr(e) {
	var t = e.f;
	if (!(t & 16384)) {
		Ze(e, m);
		var n = U, r = zn;
		U = e, zn = !(t & 96);
		try {
			t & 16777232 ? kn(e) : On(e), Dn(e);
			var i = ir(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = Zn;
		} finally {
			zn = r, U = n;
		}
	}
}
async function cr() {
	await Promise.resolve(), It();
}
function W(e) {
	var t = !!(e.f & 2);
	if (Rn?.add(e), H !== null && !Hn && !(U !== null && U.f & 16384) && (Gn === null || !Gn.has(e))) {
		var r = H.deps;
		if (H.f & 2097152) e.rv < Qn && (e.rv = Qn, qn === null && r !== null && r[Jn] === e ? Jn++ : qn === null ? qn = [e] : qn.push(e));
		else {
			H.deps ??= [], n.call(H.deps, e) || H.deps.push(e);
			var i = e.reactions;
			i === null ? e.reactions = [H] : n.call(i, H) || i.push(H);
		}
	}
	if (Bn && Wt.has(e)) return Wt.get(e);
	if (t) {
		var a = e;
		if (Bn) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || ur(a)) && (o = xt(a)), Wt.set(a, o), o;
		}
		var s = !(a.f & 512) && !Hn && H !== null && (zn || !!(H.f & 512)), c = (a.f & y) === 0;
		nr(a) && (s && (a.f |= 512), St(a)), s && !c && (wt(a), lr(a));
	}
	if (Dt?.has(e)) return Dt.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function lr(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (wt(t), lr(t));
}
function ur(e) {
	if (e.v === xe) return !0;
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
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var fr = ["touchstart", "touchmove"];
function pr(e) {
	return fr.includes(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
var mr = Symbol("events"), hr = /* @__PURE__ */ new Set(), gr = /* @__PURE__ */ new Set();
function _r(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || xr.call(t, e), !e.cancelBubble) return ot(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Ke(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function G(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = _r(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && vn(() => {
		t.removeEventListener(e, o, a);
	});
}
function K(e, t, n) {
	(t[mr] ??= {})[e] = n;
}
function vr(e) {
	for (var t = 0; t < e.length; t++) hr.add(e[t]);
	for (var n of gr) n(e);
}
var yr = null, br = !1;
function xr(e) {
	var t = this, n = t.ownerDocument, r = e.type, a = e.composedPath?.() || [], o = a[0] || e.target;
	yr = e, br || (br = !0, setTimeout(() => {
		br = !1, yr = null;
	}));
	var s = 0, c = yr === e && e[mr];
	if (c) {
		var l = a.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[mr] = t;
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
		var d = H, f = U;
		Un(null), Wn(null);
		try {
			for (var p, m = []; o !== null && o !== t;) {
				try {
					var h = o[mr]?.[r];
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
			e[mr] = t, delete e.currentTarget, Un(d), Wn(f);
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
	var t = fn("template");
	return t.innerHTML = Cr(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function Tr(e, t) {
	var n = U;
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
		if (j) return Tr(M, null), M;
		i === void 0 && (i = wr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ cn(i)));
		var t = r || nn ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ cn(t), s = t.lastChild;
			Tr(o, s);
		} else Tr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Er(e, t, n = "svg") {
	var r = !e.startsWith("<!>"), i = !!(t & 1), a = `<${n}>${r ? e : "<!>" + e}</${n}>`, o;
	return () => {
		if (j) return Tr(M, null), M;
		if (!o) {
			var e = /* @__PURE__ */ cn(wr(a));
			if (i) for (o = document.createDocumentFragment(); /* @__PURE__ */ cn(e);) o.appendChild(/* @__PURE__ */ cn(e));
			else o = /* @__PURE__ */ cn(e);
		}
		var t = o.cloneNode(!0);
		if (i) {
			var n = /* @__PURE__ */ cn(t), r = t.lastChild;
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
	if (!j) {
		var t = sn(e + "");
		return Tr(t, t), t;
	}
	var n = M;
	return n.nodeType === 3 ? pn(n) : (n.before(n = sn()), Oe(n)), Tr(n, n), n;
}
function kr() {
	if (j) return Tr(M, null), M;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = sn();
	return e.append(t, n), Tr(t, n), e;
}
function J(e, t) {
	if (j) {
		var n = U;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = M), ke();
	} else e !== null && e.before(t);
}
function Ar() {
	if (j && M && M.nodeType === 8 && M.textContent?.startsWith("$")) {
		let e = M.textContent.substring(1);
		return ke(), e;
	}
	return (window.__svelte ??= {}).uid ??= 1, `c${window.__svelte.uid++}`;
}
function Y(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[ie] ??= e.nodeValue) && (e[ie] = n, e.nodeValue = `${n}`);
}
function jr(e, t) {
	return Nr(e, t);
}
var Mr = /* @__PURE__ */ new Map();
function Nr(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	on();
	var l = void 0, u = xn(() => {
		var s = n ?? t.appendChild(sn());
		ut(s, { pending: () => {} }, (t) => {
			Ve({});
			var n = ze;
			if (o && (n.c = o), a && (i.$$events = a), j && Tr(t, null), l = e(t, i) || {}, j && (U.nodes.end = M, M === null || M.nodeType !== 8 || M.data !== "]")) throw we(), be;
			He();
		}, c);
		var u = /* @__PURE__ */ new Set(), d = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!u.has(r)) {
					u.add(r);
					var i = pr(r);
					for (let e of [t, document]) {
						var a = Mr.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), Mr.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, xr, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return d(r(hr)), gr.add(d), () => {
			for (var e of u) for (let n of [t, document]) {
				var r = Mr.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, xr), r.delete(e), r.size === 0 && Mr.delete(n)) : r.set(e, i);
			}
			gr.delete(d), s !== n && s.parentNode?.removeChild(s);
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
		var n = F, r = dn();
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
		} else j && (this.anchor = M), this.#a(n);
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
function X(e, t, n = !1) {
	var r;
	j && (r = M, ke());
	var i = new Ir(e), a = n ? x : 0;
	function o(e, t) {
		if (j) {
			var n = Me(r);
			if (e !== parseInt(n.substring(1))) {
				var a = je();
				Oe(a), i.anchor = a, De(!1), i.ensure(e, t), De(!0);
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
//#region node_modules/svelte/src/internal/client/dom/blocks/key.js
var Lr = Symbol("NaN");
function Rr(e, t, n) {
	j && ke();
	var r = new Ir(e), i = !Ue();
	Tn(() => {
		var e = t();
		e !== e && (e = Lr), i && typeof e == "object" && e && (e = {}), r.ensure(e, n);
	});
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
function zr(e, t) {
	return t;
}
function Br(e, t, n) {
	for (var i = [], a = t.length, o, s = t.length, c = 0; c < a; c++) {
		let n = t[c];
		Nn(n, () => {
			if (o) {
				if (o.pending.delete(n), o.done.add(n), o.pending.size === 0) {
					var t = e.outrogroups;
					Vr(e, r(o.done)), t.delete(o), t.size === 0 && (e.outrogroups = null);
				}
			} else --s;
		}, !1);
	}
	if (s === 0) {
		var l = i.length === 0 && n !== null && e.pending.size === 0;
		if (l) {
			var u = n, d = u.parentNode;
			un(d), d.append(u), e.items.clear();
		}
		Vr(e, t, !l);
	} else o = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(o);
}
function Vr(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= w, Ln(a, document.createDocumentFragment())) : An(t[i], n);
	}
}
var Hr;
function Z(t, n, i, a, o, s = null) {
	var c = t, l = /* @__PURE__ */ new Map();
	if (n & 4) {
		var u = t;
		c = j ? Oe(/* @__PURE__ */ cn(u)) : u.appendChild(sn());
	}
	j && ke();
	var d = null, f = /* @__PURE__ */ yt(() => {
		var t = i();
		return e(t) ? t : t == null ? [] : r(t);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, Wr(v, p, c, n, a), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= w, Kr(d, null, c)) : Fn(d) : Nn(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: Tn(() => {
			p = W(f);
			var e = p.length;
			let t = !1;
			j && Me(c) === "[!" != (e === 0) && (c = je(), Oe(c), De(!1), t = !0);
			for (var r = /* @__PURE__ */ new Set(), u = F, v = dn(), y = 0; y < e; y += 1) {
				j && M.nodeType === 8 && M.data === "]" && (c = M, t = !0, De(!1));
				var b = p[y], x = a(b, y), S = h ? null : l.get(x);
				S ? (S.v && Jt(S.v, b), S.i && Jt(S.i, y), v && u.unskip_effect(S.e)) : (S = Gr(l, h ? c : Hr ??= sn(), b, x, y, o, n, i), h || (S.e.f |= w), l.set(x, S)), r.add(x);
			}
			if (e === 0 && s && !d && (h ? d = En(() => s(c)) : (d = En(() => s(Hr ??= sn())), d.f |= w)), e > r.size && ue("", "", ""), j && e > 0 && Oe(je()), !h) {
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
	h = !1, j && (c = M);
}
function Ur(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function Wr(e, t, n, i, a) {
	var o = !!(i & 8), s = t.length, c = e.items, l = Ur(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (o) for (v = 0; v < s; v += 1) h = t[v], g = a(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = a(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (Fn(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= w, _ === l) Kr(_, null, n);
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
		for (let t of e.outrogroups) t.pending.size === 0 && (Vr(e, r(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var T = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || T.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && T.push(l), l = Ur(l.next);
		var E = T.length;
		if (E > 0) {
			var D = i & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < E; v += 1) T[v].nodes?.a?.measure();
				for (v = 0; v < E; v += 1) T[v].nodes?.a?.fix();
			}
			Br(e, T, D);
		}
	}
	o && Ke(() => {
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
function Xr(e) {
	return typeof e == "object" ? Yr(e) : e ?? "";
}
var Zr = [..." 	\n\r\f\xA0\v﻿"];
function Qr(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || Zr.includes(r[o - 1])) && (s === r.length || Zr.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function $r(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function ei(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function ti(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\/\*.*?\*\//g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(ei)), i && c.push(...Object.keys(i).map(ei));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = ei(e.substring(l, u).trim());
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
		return r && (n += $r(r)), i && (n += $r(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/class.js
function ni(e, t, n, r, i, a) {
	var o = e[ne];
	if (j || o !== n || o === void 0) {
		var s = Qr(n, r, a);
		(!j || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[ne] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/style.js
function ri(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function ii(e, t, n, r) {
	var i = e[re];
	if (j || i !== t) {
		var a = ti(t, r);
		(!j || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[re] = t;
	} else r && (Array.isArray(r) ? (ri(e, n?.[0], r[0]), ri(e, n?.[1], r[1], "important")) : ri(e, n, r));
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function ai(t, n, r = !1) {
	if (t.multiple) {
		if (n == null) return;
		if (!e(n)) return Te();
		for (var i of t.options) i.selected = n.includes(ci(i));
	} else {
		for (i of t.options) if (en(ci(i), n)) {
			i.selected = !0;
			return;
		}
		(!r || n !== void 0) && (t.selectedIndex = -1);
	}
}
function oi(e) {
	var t = new MutationObserver(() => {
		"__value" in e && ai(e, e.__value);
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
function si(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet(), i = !0;
	st(e, "change", (t) => {
		var i = t ? "[selected]" : ":checked", a;
		if (e.multiple) a = [].map.call(e.querySelectorAll(i), ci);
		else {
			var o = e.querySelector(i) ?? e.querySelector("option:not([disabled])");
			a = o && ci(o);
		}
		n(a), e.__value = a, F !== null && r.add(F);
	}), Sn(() => {
		var a = t();
		if (e === document.activeElement) {
			var o = F;
			if (r.has(o)) return;
		}
		if (ai(e, a, i), i && a === void 0) {
			var s = e.querySelector(":checked");
			s !== null && (a = ci(s), n(a));
		}
		e.__value = a, i = !1;
	}), oi(e);
}
function ci(e) {
	return "__value" in e ? e.__value : e.value;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var li = Symbol("is custom element"), ui = Symbol("is html"), di = se ? "link" : "LINK", fi = se ? "progress" : "PROGRESS";
function pi(e) {
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
		e[ae] = n, Ke(n), at();
	}
}
function mi(e, t) {
	var n = gi(e);
	n.value !== (n.value = t ?? void 0) && (e.value !== t || t === 0 && e.nodeName === fi) && (e.value = t ?? "");
}
function hi(e, t) {
	var n = gi(e);
	n.checked !== (n.checked = t ?? void 0) && (e.checked = t);
}
function Q(e, t, n, r) {
	var i = gi(e);
	j && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === di) || i[t] !== (i[t] = n) && (t === "loading" && (e[ee] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && vi(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function gi(e) {
	return e[te] ??= {
		[li]: e.nodeName.includes("-"),
		[ui]: e.namespaceURI === Se
	};
}
var _i = /* @__PURE__ */ new Map();
function vi(e) {
	var t = e.getAttribute("is") || e.nodeName, n = _i.get(t);
	if (n) return n;
	_i.set(t, n = []);
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var s in r = o(i), r) r[s].set && s !== "innerHTML" && s !== "textContent" && s !== "innerText" && n.push(s);
		i = l(i);
	}
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function yi(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet();
	st(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = bi(e) ? xi(a) : a, n(a), F !== null && r.add(F), await cr(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (j && e.defaultValue !== e.value || dr(t) == null && e.value) && (n(bi(e) ? xi(e.value) : e.value), F !== null && r.add(F)), wn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = F;
			if (r.has(i)) return;
		}
		bi(e) && n === xi(e.value) || (e.type !== "date" || n || e.value) && n !== e.value && (e.value = n ?? "");
	});
}
function bi(e) {
	var t = e.type;
	return t === "number" || t === "range";
}
function xi(e) {
	return e === "" ? null : +e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function Si(e, t) {
	return e === t || e?.[k] === t;
}
function $(e = {}, t, n, r) {
	var i = ze.r, a = U;
	return Sn(() => {
		var o, s;
		return wn(() => {
			o = s, s = r?.() || [], dr(() => {
				Si(n(...s), e) || (t(e, ...s), o && Si(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && Si(n(...s), e) && t(null, ...s);
			}, c = r.teardown;
			r.teardown = () => {
				o(), c?.();
			};
		};
	}), e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/props.js
function Ci(e, t, n, r) {
	var i = !0, o = !!(n & 8), s = !!(n & 16), c = r, l = !0, u = void 0, d = () => s && i ? (u ??= /* @__PURE__ */ gt(r), W(u)) : (l && (l = !1, c = s ? dr(r) : r), c);
	let f;
	if (o) {
		var p = k in e || A in e;
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
	o && W(y);
	var b = U;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? W(y) : i && o ? Qt(e) : e;
			return L(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return Bn && v || b.f & 16384 ? y.v : W(y);
	});
}
function wi(e) {
	ze === null && ce("onMount"), yn(() => {
		let t = dr(e);
		if (typeof t == "function") return t;
	});
}
function Ti(e) {
	ze === null && ce("onDestroy"), wi(() => () => dr(e));
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region ui/NodeCard.svelte
var Ei = /* @__PURE__ */ q("<div><span class=\"pc-native-pin-label\"> </span> <div role=\"img\"></div></div>"), Di = /* @__PURE__ */ q("<div class=\"pc-node-body\"> </div>"), Oi = /* @__PURE__ */ q("<span class=\"pc-native-alias\"> </span>"), ki = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-node-action pc-host-result\" aria-label=\"Preview host result\"><i class=\"fa-solid fa-eye\" aria-hidden=\"true\"></i> Host result</button>"), Ai = /* @__PURE__ */ q("<div role=\"group\" tabindex=\"0\"><div class=\"pc-native-heading\"><svg class=\"pc-native-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path></path></svg><span class=\"pc-node-title\"> </span></div> <div class=\"pc-native-pins\"></div> <!> <!> <!></div>");
function ji(e, t) {
	Ve(t, !0);
	let n = (e) => e.stopPropagation();
	var r = Ai();
	let i;
	var a = R(r), o = R(a), s = R(o);
	N(o);
	var c = B(o), l = R(c, !0);
	N(c), N(a);
	var u = B(a, 2);
	Z(u, 21, () => t.card.ports, (e) => e.id, (e, n) => {
		var r = Ei();
		let i;
		var a = R(r), o = R(a, !0);
		N(a);
		var s = B(a, 2);
		N(r), V(() => {
			ni(r, 1, `pc-native-row pc-native-row-${W(n).dir}`), i = ii(r, "", i, { "grid-row": W(n).row }), Y(o, W(n).label), ni(s, 1, Xr(W(n).className)), Q(s, "data-node", t.card.id), Q(s, "data-dir", W(n).dir), Q(s, "data-port", W(n).port), Q(s, "data-side", W(n).side), Q(s, "data-kind", W(n).kind), Q(s, "title", W(n).title), Q(s, "aria-label", W(n).title);
		}), G("mouseenter", s, () => t.actions.hoverPin({
			nodeId: t.card.id,
			dir: W(n).dir,
			port: W(n).port
		})), G("mouseleave", s, () => t.actions.hoverPin(null)), J(e, r);
	}), N(u);
	var d = B(u, 2), f = (e) => {
		var n = Di(), r = R(n, !0);
		N(n), V(() => Y(r, t.card.body)), J(e, n);
	};
	X(d, (e) => {
		t.card.type === "note" && e(f);
	});
	var p = B(d, 2), m = (e) => {
		var n = Oi(), r = R(n, !0);
		N(n), V(() => {
			Q(n, "title", t.card.titleHint), Y(r, t.card.title);
		}), J(e, n);
	};
	X(p, (e) => {
		t.card.compact && e(m);
	});
	var h = B(p, 2), g = (e) => {
		var r = ki();
		K("mousedown", r, n), K("click", r, (e) => {
			n(e), t.actions.hostResult(t.card.id);
		}), J(e, r);
	};
	X(h, (e) => {
		t.card.hostResult && e(g);
	}), N(r), V(() => {
		ni(r, 1, Xr(t.card.className)), Q(r, "data-id", t.card.id), Q(r, "title", t.card.offHint), Q(r, "aria-label", `${t.card.label}: ${t.card.title}`), i = ii(r, "", i, {
			left: `${t.card.x}px`,
			top: `${t.card.y}px`
		}), Q(s, "d", t.card.iconPath), Q(c, "title", t.card.titleHint), Y(l, t.card.title);
	}), J(e, r), He();
}
vr(["mousedown", "click"]);
//#endregion
//#region ui/GroupCard.svelte
var Mi = /* @__PURE__ */ q("<div class=\"pc-node-body\"> </div>"), Ni = /* @__PURE__ */ q("<div role=\"group\"><div><i class=\"fa-solid fa-object-group\" aria-hidden=\"true\"></i> <span> </span> <span class=\"pc-group-frame-count\"> </span> <button type=\"button\"></button></div> <!></div>");
function Pi(e, t) {
	Ve(t, !0);
	function n(e, n) {
		e.stopPropagation(), e.preventDefault(), t.actions.group(t.group.id, n);
	}
	function r(e, n) {
		e.stopPropagation(), e.detail === 0 && t.actions.group(t.group.id, n);
	}
	var i = Ni();
	let a;
	var o = R(i), s = B(R(o), 2), c = R(s, !0);
	N(s);
	var l = B(s, 2), u = R(l, !0);
	N(l);
	var d = B(l, 2);
	N(o);
	var f = B(o, 2), p = (e) => {
		var n = Mi(), r = R(n, !0);
		N(n), V(() => Y(r, t.group.body)), J(e, n);
	};
	X(f, (e) => {
		t.group.collapsed && e(p);
	}), N(i), V(() => {
		ni(i, 1, Xr(t.group.className)), Q(i, "data-group", t.group.id), Q(i, "aria-label", `Group: ${t.group.title}`), a = ii(i, "", a, {
			left: `${t.group.x}px`,
			top: `${t.group.y}px`,
			width: `${t.group.w}px`,
			height: t.group.collapsed ? void 0 : `${t.group.h}px`
		}), ni(o, 1, Xr(t.group.collapsed ? "pc-node-head" : "pc-group-frame-head")), ni(s, 1, Xr(t.group.collapsed ? "pc-node-title" : "pc-group-frame-title")), Y(c, t.group.title), Y(u, t.group.count), ni(d, 1, `pc-node-action fa-solid pc-group-btn ${t.group.collapsed ? "fa-up-right-and-down-left-from-center" : "fa-down-left-and-up-right-to-center"}`), Q(d, "data-action", t.group.collapsed ? "open" : "collapse"), Q(d, "title", t.group.collapsed ? "Open group" : "Fold group"), Q(d, "aria-label", t.group.collapsed ? "Open group" : "Fold group");
	}), K("mousedown", d, (e) => n(e, t.group.collapsed ? "open" : "collapse")), K("click", d, (e) => r(e, t.group.collapsed ? "open" : "collapse")), J(e, i), He();
}
vr(["mousedown", "click"]);
//#endregion
//#region ui/WireLayer.svelte
var Fi = /* @__PURE__ */ Dr("<path class=\"pc-wire-hit\"></path><path><title> </title></path><text text-anchor=\"middle\"> </text>", 1), Ii = /* @__PURE__ */ Dr("<path></path>"), Li = /* @__PURE__ */ Dr("<!><!>", 1);
function Ri(e, t) {
	Ve(t, !0);
	var n = Li(), r = z(n);
	Z(r, 17, () => t.wires, (e) => e.id, (e, t) => {
		var n = Fi(), r = z(n), i = B(r), a = R(i), o = R(a);
		N(a), N(i);
		var s = B(i), c = R(s, !0);
		N(s), V(() => {
			Q(r, "d", W(t).d), Q(r, "data-id", W(t).id), Q(i, "d", W(t).d), ni(i, 0, Xr(W(t).className)), Q(i, "data-id", W(t).id), Q(i, "data-kind", W(t).kind), Y(o, `${W(t).kind ?? ""} artifact`), Q(s, "x", W(t).label.x), Q(s, "y", W(t).label.y), ni(s, 0, Xr(W(t).label.className)), Y(c, W(t).label.text);
		}), J(e, n);
	});
	var i = B(r), a = (e) => {
		var n = Ii();
		V(() => {
			Q(n, "d", t.ghost.d), ni(n, 0, Xr(t.ghost.className));
		}), J(e, n);
	};
	X(i, (e) => {
		t.ghost && e(a);
	}), J(e, n), He();
}
//#endregion
//#region ui/CommentFrame.svelte
var zi = /* @__PURE__ */ q("<span class=\"pc-comment-title svelte-118xm2r\"> </span>"), Bi = /* @__PURE__ */ q("<input class=\"pc-comment-title-input svelte-118xm2r\" aria-label=\"Comment title\"/>"), Vi = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-comment-resize svelte-118xm2r\" title=\"Drag to resize comment\"></button>"), Hi = /* @__PURE__ */ q("<div role=\"group\"><header class=\"pc-comment-header svelte-118xm2r\"><button type=\"button\" class=\"pc-comment-select svelte-118xm2r\" title=\"Drag header to move comment\">⋮⋮</button> <!></header> <div class=\"pc-comment-notes svelte-118xm2r\"> </div> <!></div>");
function Ui(e, t) {
	Ve(t, !0);
	let n = (e) => e.stopPropagation();
	var r = Hi();
	let i, a;
	var o = R(r), s = R(o), c = B(s, 2), l = (e) => {
		var n = zi(), r = R(n, !0);
		N(n), V(() => Y(r, t.comment.title)), J(e, n);
	}, u = (e) => {
		var r = Bi();
		pi(r), V(() => mi(r, t.comment.title)), G("focus", r, () => t.actions.select(t.comment.id)), G("pointerdown", r, n, !0), G("mousedown", r, n, !0), G("click", r, n, !0), G("keydown", r, n, !0), K("change", r, (e) => {
			t.comment.readOnly || t.actions.update(t.comment.id, { title: e.currentTarget.value });
		}), J(e, r);
	};
	X(c, (e) => {
		t.comment.readOnly ? e(l) : e(u, -1);
	}), N(o);
	var d = B(o, 2), f = R(d, !0);
	N(d);
	var p = B(d, 2), m = (e) => {
		var n = Vi();
		V(() => Q(n, "aria-label", `Resize comment: ${t.comment.title}`)), K("click", n, (e) => {
			e.detail === 0 && t.actions.select(t.comment.id);
		}), J(e, n);
	};
	X(p, (e) => {
		t.comment.readOnly || e(m);
	}), N(r), V(() => {
		i = ni(r, 1, "pc-comment-frame svelte-118xm2r", null, i, {
			"pc-comment-selected": t.comment.selected,
			"pc-comment-readonly": t.comment.readOnly
		}), Q(r, "data-id", t.comment.id), Q(r, "aria-label", `Comment: ${t.comment.title}`), a = ii(r, "", a, {
			left: `${t.comment.x}px`,
			top: `${t.comment.y}px`,
			width: `${t.comment.w}px`,
			height: `${t.comment.h}px`,
			"--frame-color": t.comment.color
		}), Q(s, "aria-label", `Select comment: ${t.comment.title}`), Y(f, t.comment.content);
	}), K("click", s, (e) => {
		e.detail === 0 && t.actions.select(t.comment.id);
	}), J(e, r), He();
}
vr(["click", "change"]);
//#endregion
//#region ui/CanvasLayer.svelte
var Wi = /* @__PURE__ */ q("<div class=\"pc-viewport\" data-pc-renderer=\"svelte\"><div class=\"pc-comment-layer svelte-o7b704\"></div> <svg class=\"pc-wires\" aria-label=\"Canvas connections\"><!></svg> <div class=\"pc-nodes\"><!> <!> <!></div></div>");
function Gi(e, t) {
	Ve(t, !0);
	let n = /* @__PURE__ */ I([]), r = /* @__PURE__ */ I([]), i = /* @__PURE__ */ I([]), a = /* @__PURE__ */ I([]), o = /* @__PURE__ */ I({
		select() {},
		update() {},
		command() {}
	}), s = /* @__PURE__ */ I(null), c = /* @__PURE__ */ I({
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
		L(a, e), L(o, t);
	}
	function h(e) {
		L(n, e);
	}
	function g(e) {
		L(r, e);
	}
	function _(e, t, n) {
		L(i, e), L(c, t), L(s, n);
	}
	function v(e, t) {
		let i = new Map(e.map((e) => [e.id, e])), o = new Map(t.map((e) => [e.id, e]));
		L(n, W(n).map((e) => i.has(e.id) ? {
			...e,
			...i.get(e.id)
		} : e)), L(a, W(a).map((e) => i.has(e.id) ? {
			...e,
			...i.get(e.id)
		} : e)), L(r, W(r).map((e) => o.has(e.id) ? {
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
	}, b = Wi(), x = R(b);
	Z(x, 21, () => W(a), (e) => e.id, (e, t) => {
		Ui(e, {
			get comment() {
				return W(t);
			},
			get actions() {
				return W(o);
			}
		});
	}), N(x), $(x, (e) => f = e, () => f);
	var S = B(x, 2);
	Ri(R(S), {
		get wires() {
			return W(i);
		},
		get ghost() {
			return W(s);
		}
	}), N(S), $(S, (e) => u = e, () => u);
	var C = B(S, 2), w = R(C);
	Z(w, 17, () => W(r).filter((e) => !e.collapsed), (e) => e.id, (e, n) => {
		Pi(e, {
			get group() {
				return W(n);
			},
			get actions() {
				return t.actions;
			}
		});
	});
	var T = B(w, 2);
	return Z(T, 17, () => W(n), (e) => e.id, (e, n) => {
		ji(e, {
			get card() {
				return W(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), Z(B(T, 2), 17, () => W(r).filter((e) => e.collapsed), (e) => e.id, (e, n) => {
		Pi(e, {
			get group() {
				return W(n);
			},
			get actions() {
				return t.actions;
			}
		});
	}), N(C), $(C, (e) => d = e, () => d), N(b), $(b, (e) => l = e, () => l), V(() => {
		Q(S, "width", W(c).w), Q(S, "height", W(c).h), Q(S, "viewBox", `0 0 ${W(c).w} ${W(c).h}`);
	}), J(e, b), He(y);
}
//#endregion
//#region ui/WorkspaceMenus.svelte
var Ki = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-flat-menu\" aria-haspopup=\"menu\"> </button>"), qi = /* @__PURE__ */ q("<button type=\"button\" role=\"menuitem\"><span> </span><small> </small></button>"), Ji = /* @__PURE__ */ q("<div class=\"pc-workspace-menu-panel\" role=\"menu\" tabindex=\"-1\"></div>"), Yi = /* @__PURE__ */ q("<nav class=\"pc-workspace-menus\" aria-label=\"Workspace menus\"><!> <!></nav>");
function Xi(e, t) {
	Ve(t, !0);
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
				u("Run workflow", "run-workflow", "", !W(n) || !!W(n)?.busy || !!W(n)?.issues.length),
				u("Stop workflow", "stop-workflow", "", !W(n)?.busy)
			];
			case "Tools": return [u("Theme and colours", "theme"), u("Toggle inspector", "inspector")];
			default: return [u("Workspace guide", "help")];
		}
	}
	function f(e = !1) {
		L(r, ""), e && o?.focus({ preventScroll: !0 });
	}
	async function p(e, t, n = !1) {
		if (W(r) === e && !n) {
			f();
			return;
		}
		L(r, e, !0), o = t, await cr();
		let i = t.getBoundingClientRect(), l = W(a).getBoundingClientRect();
		L(s, Math.max(4, Math.min(i.left, window.innerWidth - l.width - 4)), !0), L(c, i.bottom + 2), n && W(a).querySelector("button:not(:disabled)")?.focus();
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
		if (e.key === "Escape" && W(r)) e.preventDefault(), e.stopPropagation(), f(!0);
		else if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
			e.preventDefault();
			let n = W(r) || t.textContent || l[0], a = l[(l.indexOf(n) + (e.key === "ArrowRight" ? 1 : l.length - 1)) % l.length], o = i.querySelector(`[data-menu="${a}"]`);
			W(r) ? p(a, o, !0) : o.focus();
		} else if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Home" || e.key === "End") {
			if (e.preventDefault(), !W(r)) {
				p(t.dataset.menu || l[0], t, !0);
				return;
			}
			let n = [...W(a).querySelectorAll("button:not(:disabled)")], i = n.indexOf(t);
			n[e.key === "Home" ? 0 : e.key === "End" ? n.length - 1 : (i + (e.key === "ArrowUp" ? n.length - 1 : 1)) % n.length]?.focus();
		} else e.key === "Tab" && f();
	}
	var g = Yi();
	G("pointerdown", tn, (e) => {
		W(r) && !i.contains(e.target) && !W(a)?.contains(e.target) && f();
	}), G("resize", tn, () => f());
	var _ = R(g);
	Z(_, 17, () => l, zr, (e, t) => {
		var n = Ki(), i = R(n, !0);
		N(n), V(() => {
			Q(n, "data-menu", W(t)), Q(n, "aria-expanded", W(r) === W(t)), Y(i, W(t));
		}), K("click", n, (e) => p(W(t), e.currentTarget)), K("keydown", n, h), J(e, n);
	});
	var v = B(_, 2), y = (e) => {
		var t = Ji();
		let n;
		Z(t, 21, () => d(W(r)), zr, (e, t) => {
			var n = qi(), r = R(n), i = R(r, !0);
			N(r);
			var a = B(r), o = R(a, !0);
			N(a), N(n), V(() => {
				n.disabled = W(t).disabled, Y(i, W(t).label), Y(o, W(t).shortcut);
			}), K("click", n, () => m(W(t).command)), J(e, n);
		}), N(t), $(t, (e) => L(a, e), () => W(a)), V(() => {
			Q(t, "aria-label", W(r)), n = ii(t, "", n, {
				left: `${W(s)}px`,
				top: `${W(c)}px`
			});
		}), K("keydown", t, h), J(e, t);
	};
	X(v, (e) => {
		W(r) && e(y);
	}), N(g), $(g, (e) => i = e, () => i), J(e, g), He();
}
vr(["click", "keydown"]);
//#endregion
//#region ui/Toolbar.svelte
var Zi = /* @__PURE__ */ q("<option> </option>"), Qi = /* @__PURE__ */ q("<header class=\"pc-header\" data-pc-ui=\"svelte\"><div class=\"pc-menubar\"><div class=\"pc-brand\"><img width=\"30\" height=\"30\" alt=\"\"/><span>LATTICE</span></div> <!> <button type=\"button\" class=\"pc-btn menu_button pc-close\" title=\"Close\" aria-label=\"Close canvas\">×</button></div> <div class=\"pc-workflow-bar\"><select class=\"pc-select pc-graph-select text_pole\" aria-label=\"Workflow\"></select> <div class=\"pc-header-actions pc-history\"><button type=\"button\" aria-label=\"Undo\">↶</button> <button type=\"button\" aria-label=\"Redo\">↷</button> <span> </span></div> <button type=\"button\" class=\"pc-btn menu_button pc-root-run\"> </button> <span class=\"pc-root-workflow-status\" role=\"status\"> </span> <button type=\"button\" class=\"pc-btn menu_button\" title=\"Workflow setup\">Setup</button> <div class=\"pc-header-actions pc-surface-actions\"><button type=\"button\" title=\"Show or hide the inspector\" aria-label=\"Toggle inspector\">Details</button></div> <label class=\"pc-arm\"><input class=\"pc-arm-input\" type=\"checkbox\"/><span>Arm</span></label></div></header>");
function $i(e, t) {
	Ve(t, !0);
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
	}, u = Qi(), d = R(u), f = R(d), p = R(f);
	Ae(), N(f);
	var m = B(f, 2);
	Xi(m, {
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
	Z(_, 21, () => t.state.graphs, (e) => e.id, (e, t) => {
		var n = Zi(), r = R(n, !0);
		N(n);
		var i = {};
		V(() => {
			Y(r, W(t).name), i !== (i = W(t).id) && (n.value = (n.__value = W(t).id) ?? "");
		}), J(e, n);
	}), N(_), $(_, (e) => i = e, () => i);
	var v;
	oi(_);
	var y = B(_, 2), b = R(y), x = B(b, 2), S = B(x, 2), C = R(S, !0);
	N(S), N(y);
	var w = B(y, 2), T = R(w, !0);
	N(w);
	var E = B(w, 2), D = R(E);
	N(E);
	var O = B(E, 2), k = B(O, 2), A = R(k);
	$(A, (e) => o = e, () => o), N(k);
	var ee = B(k, 2), te = R(ee);
	return pi(te), $(te, (e) => a = e, () => a), Ae(), N(ee), N(g), N(u), $(u, (e) => r = e, () => r), V((e) => {
		Q(p, "src", t.actions.logoUrl), v !== (v = t.state.graphId) && (_.value = (_.__value = t.state.graphId) ?? "", ai(_, t.state.graphId)), ni(b, 1, `pc-btn menu_button pc-undo${t.state.history.undo ? "" : " pc-disabled"}`), b.disabled = !t.state.history.undo, Q(b, "title", t.state.history.undoTitle), ni(x, 1, `pc-btn menu_button pc-redo${t.state.history.redo ? "" : " pc-disabled"}`), x.disabled = !t.state.history.redo, Q(x, "title", t.state.history.redoTitle), ni(S, 1, `pc-history-note${t.state.history.showNote ? " pc-show" : ""}`), Y(C, t.state.history.note), w.disabled = !W(n) || !W(n).busy && !!W(n).issues.length, Q(w, "title", e), Y(T, W(n)?.busy ? "■ Stop" : "▶ Run"), Y(D, `${W(n) ? `${W(n).phase} · ${W(n).assigned ? "Assigned" : "Unassigned"} · ≤ ${W(n).callBound} requests` : "Workflow unavailable"} · Autosave in SillyTavern`), ni(A, 1, `pc-btn menu_button pc-pane-toggle${t.state.inspectorOpen ? " pc-on" : ""}`), Q(A, "aria-pressed", t.state.inspectorOpen), hi(te, t.state.armed);
	}, [() => W(n)?.issues.join("\n") || "Run the root workflow"]), K("click", h, () => t.actions.command("close")), K("change", _, (e) => t.actions.pickGraph(e.currentTarget.value)), K("click", b, () => t.actions.command("undo")), K("click", x, () => t.actions.command("redo")), K("click", w, () => t.actions.command(W(n)?.busy ? "stop-workflow" : "run-workflow")), K("click", O, () => t.local("workflow-setup")), K("click", A, () => t.actions.command("inspector")), K("change", te, (e) => t.actions.arm(e.currentTarget.checked)), J(e, u), He(l);
}
vr(["click", "change"]);
//#endregion
//#region ui/PaneDivider.svelte
var ea = /* @__PURE__ */ q("<div class=\"pc-pane-divider\" role=\"separator\" aria-label=\"Resize preview\" aria-orientation=\"horizontal\" tabindex=\"0\"></div>");
function ta(e, t) {
	Ve(t, !0);
	let n = Ci(t, "min", 3, 90), r = Ci(t, "max", 3, 500), i, a = null, o = (e) => Math.max(n(), Math.min(r(), e));
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
	Ti(u);
	var f = ea();
	G("blur", tn, u), $(f, (e) => i = e, () => i), V((e, t) => {
		Q(f, "aria-valuemin", n()), Q(f, "aria-valuemax", e), Q(f, "aria-valuenow", t);
	}, [() => Math.round(r()), () => Math.round(t.height)]), K("pointerdown", f, s), K("pointermove", f, c), K("pointerup", f, (e) => l(!1, e.pointerId)), G("pointercancel", f, (e) => l(!0, e.pointerId)), G("lostpointercapture", f, (e) => l(!0, e.pointerId)), K("keydown", f, d), J(e, f), He();
}
vr([
	"pointerdown",
	"pointermove",
	"pointerup",
	"keydown"
]);
//#endregion
//#region ui/DetailsDivider.svelte
var na = /* @__PURE__ */ q("<div class=\"pc-details-divider svelte-1iyzcro\" role=\"separator\" aria-label=\"Resize Details\" aria-orientation=\"vertical\" tabindex=\"0\"></div>");
function ra(e, t) {
	Ve(t, !0);
	let n = Ci(t, "min", 3, 220), r = Ci(t, "max", 3, 520), i, a = null, o = (e) => Math.max(n(), Math.min(r(), e));
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
	Ti(c);
	var f = na();
	G("blur", tn, c), $(f, (e) => i = e, () => i), V((e, t) => {
		Q(f, "aria-valuemin", n()), Q(f, "aria-valuemax", e), Q(f, "aria-valuenow", t);
	}, [() => Math.round(r()), () => Math.round(t.width)]), K("pointerdown", f, l), K("pointermove", f, u), K("pointerup", f, (e) => s(!1, e.pointerId)), G("pointercancel", f, (e) => s(!0, e.pointerId)), G("lostpointercapture", f, (e) => s(!0, e.pointerId)), K("keydown", f, d), J(e, f), He();
}
vr([
	"pointerdown",
	"pointermove",
	"pointerup",
	"keydown"
]);
//#endregion
//#region ui/GraphTabs.svelte
var ia = /* @__PURE__ */ q("<span class=\"pc-graph-tab-lock svelte-7ptwed\" aria-label=\"Read only\">◇</span>"), aa = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-graph-tab-close svelte-7ptwed\">×</button>"), oa = /* @__PURE__ */ q("<div><button type=\"button\" role=\"tab\" aria-haspopup=\"menu\"><span class=\"svelte-7ptwed\"> </span><!></button> <!></div>"), sa = /* @__PURE__ */ q("<button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button>"), ca = /* @__PURE__ */ q("<button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Save workflow</button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\"> </button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close tab</button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close other tabs</button> <!>", 1), la = /* @__PURE__ */ q("<!> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close active view</button> <button type=\"button\" role=\"menuitem\" class=\"svelte-7ptwed\">Close other views</button> <!>", 1), ua = /* @__PURE__ */ q("<div role=\"menu\" tabindex=\"-1\"><!></div>"), da = /* @__PURE__ */ q("<nav aria-label=\"Open graph views\"><div class=\"pc-graph-tab-list svelte-7ptwed\" role=\"tablist\" aria-label=\"Graph views\"></div> <button type=\"button\" class=\"pc-graph-view-overflow svelte-7ptwed\" aria-label=\"Graph view actions\" title=\"Focus, close or reopen graph views\" aria-haspopup=\"menu\">⋯</button> <!></nav>");
function fa(e, t) {
	Ve(t, !0);
	let n = Ci(t, "actions", 19, () => ({})), r = Ci(t, "idPrefix", 3, "pc-graph-view"), i = /* @__PURE__ */ I(null), a = /* @__PURE__ */ I(null), o = /* @__PURE__ */ I(null), s = /* @__PURE__ */ I(!1), c = /* @__PURE__ */ I(""), l = /* @__PURE__ */ I(""), u = /* @__PURE__ */ I(0), d = /* @__PURE__ */ I(0), f = "", p = /* @__PURE__ */ P(() => t.views?.tabs.find((e) => e.key === W(l))), m = {};
	yn(() => {
		let e = t.views?.active.key ?? "";
		f === e ? t.views && !t.views.tabs.some((e) => e.key === W(c)) && L(c, e, !0) : (L(c, e, !0), y()), W(l) && !W(p) && y(), f = e;
	});
	function h(e) {
		let t = e.breadcrumbs.map((e) => e.label).join(" / ") || e.label, n = e.identity;
		return n.kind === "instance" ? `${t} (${n.instancePath.map((e) => JSON.stringify(e)).join(" → ")})` : n.kind === "library" ? `${t} · Library v${n.definitionRef.version} (${n.definitionRef.id})` : t;
	}
	function g(e) {
		L(c, e, !0), n().focusView?.(e), m[e]?.focus({ preventScroll: !0 });
	}
	function _(e, n) {
		if (t.views && (e.key === "ContextMenu" || e.key === "F10" && e.shiftKey)) {
			e.preventDefault(), e.stopPropagation();
			let r = t.views.tabs[n], i = m[r.key]?.getBoundingClientRect();
			x(r, i?.left ?? 8, i?.bottom ?? 8);
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
			t.views.tabs[n].identity.kind !== "root" && v(t.views.tabs[n]);
			return;
		}
		let r = e.key === "Home" ? 0 : e.key === "End" ? t.views.tabs.length - 1 : (n + (e.key === "ArrowLeft" ? t.views.tabs.length - 1 : 1)) % t.views.tabs.length;
		g(t.views.tabs[r].key);
	}
	async function v(e) {
		if (e.identity.kind === "root") return;
		n().closeView?.(e.key), await cr();
		let r = t.views?.active.key;
		r && t.views?.tabs.some((e) => e.key === r) && (L(c, r, !0), m[r]?.focus({ preventScroll: !0 }));
	}
	function y(e = !1) {
		let t = W(l) ? m[W(l)] : W(o);
		L(s, !1), L(l, ""), e && t?.focus({ preventScroll: !0 });
	}
	function b(e, t) {
		e.preventDefault(), e.stopPropagation(), x(t, e.clientX, e.clientY);
	}
	async function x(e, t, n) {
		if (L(l, e.key, !0), L(u, t, !0), L(d, n, !0), L(s, !0), await cr(), !W(s) || W(l) !== e.key) return;
		let r = W(a)?.getBoundingClientRect();
		L(u, Math.min(Math.max(8, t), Math.max(8, window.innerWidth - (r?.width ?? 0) - 8)), !0), L(d, Math.min(Math.max(8, n), Math.max(8, window.innerHeight - (r?.height ?? 0) - 8)), !0), W(a)?.querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
	}
	async function S() {
		let e = !!W(l);
		L(l, ""), L(s, e || !W(s), !0), W(s) && (await cr(), W(s) && W(a)?.querySelector("button:not(:disabled)")?.focus());
	}
	function C(e) {
		if (e.stopPropagation(), e.key === "Escape") {
			e.preventDefault(), y(!0);
			return;
		}
		if (e.key === "Tab") {
			y();
			return;
		}
		if (![
			"ArrowDown",
			"ArrowUp",
			"Home",
			"End"
		].includes(e.key)) return;
		e.preventDefault();
		let t = [...W(a).querySelectorAll("button:not(:disabled)")], n = t.indexOf(e.target);
		t[e.key === "Home" ? 0 : e.key === "End" ? t.length - 1 : (n + (e.key === "ArrowUp" ? t.length - 1 : 1)) % t.length]?.focus();
	}
	function w(e) {
		y(!0), e();
	}
	function T(e) {
		let t = W(p);
		t && (y(!0), e(t));
	}
	var E = kr();
	G("pointerdown", tn, (e) => {
		W(s) && !W(a)?.contains(e.target) && e.target !== W(o) && y();
	}), G("resize", tn, () => y());
	var D = z(E), O = (e) => {
		var f = da();
		let y;
		var x = R(f);
		Z(x, 23, () => t.views.tabs, (e) => e.key, (e, n, i) => {
			var a = oa();
			let o;
			var u = R(a);
			let d;
			var f = R(u), p = R(f, !0);
			N(f);
			var y = B(f), x = (e) => {
				J(e, ia());
			};
			X(y, (e) => {
				W(n).readOnly && e(x);
			}), N(u), $(u, (e, t) => m[t.key] = e, (e) => m?.[e.key], () => [W(n)]);
			var S = B(u, 2), C = (e) => {
				var r = aa();
				V((e, i) => {
					Q(r, "aria-label", e), Q(r, "title", i), Q(r, "tabindex", W(n).key === (W(c) || t.views.active.key) ? 0 : -1);
				}, [() => `Close ${W(n).label} · ${h(W(n))}`, () => `Close ${h(W(n))}`]), K("click", r, () => v(W(n))), K("contextmenu", r, (e) => b(e, W(n))), K("keydown", r, (e) => _(e, W(i))), J(e, r);
			};
			X(S, (e) => {
				W(n).identity.kind !== "root" && e(C);
			}), N(a), V((e) => {
				o = ni(a, 1, "pc-graph-tab-item svelte-7ptwed", null, o, { "pc-graph-tab-active": W(n).key === t.views.active.key }), d = ni(u, 1, "pc-graph-tab svelte-7ptwed", null, d, { "pc-graph-tab-closeable": W(n).identity.kind !== "root" }), Q(u, "id", `${r()}-${W(i)}`), Q(u, "aria-controls", t.panelId), Q(u, "aria-selected", W(n).key === t.views.active.key), Q(u, "aria-expanded", W(s) && W(l) === W(n).key), Q(u, "tabindex", W(n).key === (W(c) || t.views.active.key) ? 0 : -1), Q(u, "title", e), Y(p, W(n).label);
			}, [() => h(W(n))]), K("click", u, () => g(W(n).key)), K("pointerdown", u, (e) => {
				e.button === 2 && e.preventDefault();
			}), K("contextmenu", u, (e) => b(e, W(n))), K("keydown", u, (e) => _(e, W(i))), J(e, a);
		}), N(x);
		var E = B(x, 2);
		$(E, (e) => L(o, e), () => W(o));
		var D = B(E, 2), O = (e) => {
			var r = ua();
			let i;
			var o = R(r), s = (e) => {
				let r = /* @__PURE__ */ P(() => W(p)), i = /* @__PURE__ */ P(() => n().canRenameView?.(W(r).key) === !1);
				var a = ca(), o = z(a), s = B(o, 2), c = R(s, !0);
				N(s);
				var l = B(s, 2), u = R(l, !0);
				N(l);
				var d = B(l, 2), f = B(d, 2);
				Z(B(f, 2), 17, () => t.views.closedViews, (e) => e.key, (e, t) => {
					var r = sa(), i = R(r);
					N(r), V((e, a) => {
						r.disabled = !n().reopenView, Q(r, "title", e), Y(i, `Reopen ${W(t).label ?? ""} · ${a ?? ""}`);
					}, [() => h(W(t)), () => h(W(t))]), K("click", r, () => w(() => n().reopenView?.(W(t).key))), J(e, r);
				}), V((e) => {
					o.disabled = !n().saveView, s.disabled = !n().exportView, Y(c, W(r).identity.kind === "root" ? "Export workflow JSON" : "Export subgraph JSON"), l.disabled = W(r).identity.kind === "library" || W(i) || !n().renameView, Q(l, "title", W(r).identity.kind === "library" ? "Library inspection is read only." : W(i) ? "Make a local copy of the containing graph to rename this subgraph." : void 0), Y(u, W(r).identity.kind === "root" ? "Rename graph" : "Rename subgraph"), d.disabled = W(r).identity.kind === "root" || !n().closeView, f.disabled = e;
				}, [() => t.views.tabs.every((e) => e.identity.kind === "root" || e.key === W(r).key) || !n().closeOtherViews]), K("click", o, () => T((e) => n().saveView?.(e.key))), K("click", s, () => T((e) => n().exportView?.(e.key))), K("click", l, () => T((e) => n().renameView?.(e.key))), K("click", d, () => T((e) => v(e))), K("click", f, () => T((e) => n().closeOtherViews?.(e.key))), J(e, a);
			}, c = (e) => {
				var r = la(), i = z(r);
				Z(i, 17, () => t.views.tabs, (e) => e.key, (e, t) => {
					var n = sa(), r = R(n);
					N(n), V((e, t) => {
						Q(n, "title", e), Y(r, `Focus ${t ?? ""}`);
					}, [() => h(W(t)), () => h(W(t))]), K("click", n, () => w(() => g(W(t).key))), J(e, n);
				});
				var a = B(i, 2), o = B(a, 2);
				Z(B(o, 2), 17, () => t.views.closedViews, (e) => e.key, (e, t) => {
					var r = sa(), i = R(r);
					N(r), V((e, n) => {
						Q(r, "title", e), Y(i, `Reopen ${W(t).label ?? ""} · ${n ?? ""}`);
					}, [() => h(W(t)), () => h(W(t))]), K("click", r, () => w(() => n().reopenView?.(W(t).key))), J(e, r);
				}), V((e) => {
					a.disabled = t.views.active.identity.kind === "root" || !n().closeView, o.disabled = e;
				}, [() => t.views.tabs.every((e) => e.identity.kind === "root" || e.key === t.views.active.key) || !n().closeOtherViews]), K("click", a, () => w(() => v(t.views.active))), K("click", o, () => w(() => n().closeOtherViews?.(t.views.active.key))), J(e, r);
			};
			X(o, (e) => {
				W(p) ? e(s) : e(c, -1);
			}), N(r), $(r, (e) => L(a, e), () => W(a)), V(() => {
				i = ni(r, 1, "pc-graph-view-menu svelte-7ptwed", null, i, { "pc-graph-tab-menu": !!W(l) }), ii(r, W(l) ? `left: ${W(u)}px; top: ${W(d)}px;` : void 0), Q(r, "aria-label", W(p) ? `Actions for ${W(p).label}` : "Graph view actions");
			}), K("keydown", r, C), J(e, r);
		};
		X(D, (e) => {
			W(s) && e(O);
		}), N(f), $(f, (e) => L(i, e), () => W(i)), V(() => {
			y = ni(f, 1, "pc-graph-tabs pc-graph-tabs-multi svelte-7ptwed", null, y, { "pc-graph-tabs-menu-open": W(s) }), Q(E, "aria-expanded", W(s) && !W(l));
		}), K("click", E, S), J(e, f);
	};
	X(D, (e) => {
		t.views && e(O);
	}), J(e, E), He();
}
vr([
	"click",
	"pointerdown",
	"contextmenu",
	"keydown"
]);
//#endregion
//#region ui/GraphBreadcrumbs.svelte
var pa = /* @__PURE__ */ q("<span aria-current=\"page\" class=\"svelte-18ovafz\"> </span>"), ma = /* @__PURE__ */ q("<button type=\"button\" class=\"svelte-18ovafz\"> </button>"), ha = /* @__PURE__ */ q("<li class=\"svelte-18ovafz\"><!></li>"), ga = /* @__PURE__ */ q("<div class=\"pc-graph-location svelte-18ovafz\"><nav aria-label=\"Graph location\" class=\"svelte-18ovafz\"><ol class=\"svelte-18ovafz\"></ol></nav> <span class=\"pc-graph-scope svelte-18ovafz\"> <!><!></span></div>");
function _a(e, t) {
	Ve(t, !0);
	let n = Ci(t, "actions", 19, () => ({})), r = /* @__PURE__ */ P(() => t.view?.identity.kind === "library" ? t.view.identity.definitionRef : t.definitionRef ?? t.view?.definitionRef);
	function i(e) {
		return e.identity.kind === "instance" ? !!n().openInstance : !!n().focusView;
	}
	function a(e) {
		e.identity.kind === "instance" ? n().openInstance?.(e.identity.instancePath) : n().focusView?.(e.key);
	}
	var o = kr(), s = z(o), c = (e) => {
		var n = ga(), o = R(n), s = R(o);
		Z(s, 23, () => t.view.breadcrumbs, (e) => e.key, (e, n, r) => {
			var o = ha(), s = R(o), c = (e) => {
				var t = pa(), r = R(t, !0);
				N(t), V(() => Y(r, W(n).label)), J(e, t);
			}, l = (e) => {
				var t = ma(), r = R(t, !0);
				N(t), V((e) => {
					t.disabled = e, Y(r, W(n).label);
				}, [() => !i(W(n))]), K("click", t, () => a(W(n))), J(e, t);
			};
			X(s, (e) => {
				W(r) === t.view.breadcrumbs.length - 1 ? e(c) : e(l, -1);
			}), N(o), J(e, o);
		}), N(s), N(o);
		var c = B(o, 2), l = R(c, !0), u = B(l), d = (e) => {
			var t = Or();
			V(() => Y(t, `· v${W(r).version ?? ""}`)), J(e, t);
		};
		X(u, (e) => {
			W(r) && e(d);
		});
		var f = B(u), p = (e) => {
			J(e, Or("· Read only"));
		};
		X(f, (e) => {
			(t.view.readOnly || t.view.identity.kind === "library") && e(p);
		}), N(c), N(n), V(() => {
			Q(c, "title", W(r) ? `${W(r).id} · v${W(r).version} · ${W(r).semanticHash}` : void 0), Y(l, t.view.identity.kind === "library" ? "Library inspection" : "Instance graph");
		}), J(e, n);
	};
	X(s, (e) => {
		t.view && t.view.identity.kind !== "root" && e(c);
	}), J(e, o), He();
}
vr(["click"]);
//#endregion
//#region ui/NodeDetails.svelte
var va = /* @__PURE__ */ q("<option class=\"svelte-59ntjv\"> </option>"), ya = /* @__PURE__ */ q("<p class=\"pc-detail-error svelte-59ntjv\" role=\"alert\"> </p>"), ba = /* @__PURE__ */ q("<fieldset class=\"pc-detail-group svelte-59ntjv\" data-boundary-controls=\"\"><legend class=\"svelte-59ntjv\"> </legend> <label class=\"svelte-59ntjv\">Port label<input aria-label=\"Subgraph port label\" class=\"svelte-59ntjv\"/></label> <label class=\"svelte-59ntjv\">Type<select aria-label=\"Subgraph port type\" class=\"svelte-59ntjv\"></select></label> <label class=\"pc-detail-check svelte-59ntjv\"><input aria-label=\"Required subgraph port\" type=\"checkbox\" class=\"svelte-59ntjv\"/> Required</label> <div class=\"pc-detail-actions svelte-59ntjv\"><button type=\"button\" data-save-boundary=\"\" class=\"svelte-59ntjv\"> </button></div> <small class=\"svelte-59ntjv\">Labels appear on the subgraph block. Disconnect incompatible connections before changing the type. Deleting this node removes its port and attached connections.</small> <!></fieldset>"), xa = /* @__PURE__ */ q("<label class=\"svelte-59ntjv\">Alias<input aria-label=\"Alias\" maxlength=\"80\" class=\"svelte-59ntjv\"/></label> <button type=\"button\" class=\"svelte-59ntjv\">Reset alias</button>", 1), Sa = /* @__PURE__ */ q("<p role=\"status\" class=\"svelte-59ntjv\">Loading file…</p>"), Ca = /* @__PURE__ */ q("<div data-file-input-controls=\"\" class=\"svelte-59ntjv\"><label class=\"svelte-59ntjv\"> <input type=\"file\" accept=\".txt,.md,.json,text/plain,text/markdown,application/json\" class=\"svelte-59ntjv\"/></label> <p class=\"svelte-59ntjv\"> </p> <small class=\"svelte-59ntjv\">The file's UTF-8 text is embedded in this workflow. Runs use the saved snapshot; replace the file to refresh it.</small> <small class=\"svelte-59ntjv\">Choose a .txt, .md or .json file up to 400,000 bytes and 100,000 UTF-16 code units.</small> <!> <!></div>"), wa = /* @__PURE__ */ q("<select class=\"svelte-59ntjv\"></select>"), Ta = /* @__PURE__ */ q("<input type=\"checkbox\" class=\"svelte-59ntjv\"/>"), Ea = /* @__PURE__ */ q("<input type=\"number\" class=\"svelte-59ntjv\"/>"), Da = /* @__PURE__ */ q("<textarea class=\"svelte-59ntjv\"></textarea>"), Oa = /* @__PURE__ */ q("<button type=\"button\" class=\"svelte-59ntjv\"> </button>"), ka = /* @__PURE__ */ q("<small class=\"svelte-59ntjv\"> </small>"), Aa = /* @__PURE__ */ q("<small class=\"svelte-59ntjv\"> <!></small>"), ja = /* @__PURE__ */ q("<label class=\"svelte-59ntjv\"> <!></label> <!> <!> <!> <!> <!>", 1), Ma = /* @__PURE__ */ q("<fieldset class=\"pc-detail-group svelte-59ntjv\"><legend class=\"svelte-59ntjv\">Operation</legend> <label class=\"pc-detail-check svelte-59ntjv\"><input aria-label=\"Enabled\" type=\"checkbox\" class=\"svelte-59ntjv\"/> Enabled</label> <small class=\"svelte-59ntjv\">Disabled operations block execution.</small> <!> <!> <!></fieldset>"), Na = /* @__PURE__ */ q("<label class=\"svelte-59ntjv\">Connection profile<select aria-label=\"Connection profile\" class=\"svelte-59ntjv\"><option class=\"svelte-59ntjv\">Choose a connection</option><!></select></label>"), Pa = /* @__PURE__ */ q("<label class=\"svelte-59ntjv\">Model identifier<input aria-label=\"Model identifier\" class=\"svelte-59ntjv\"/></label>"), Fa = /* @__PURE__ */ q("<p class=\"pc-detail-error svelte-59ntjv\"> </p>"), Ia = /* @__PURE__ */ q("<fieldset class=\"pc-detail-group svelte-59ntjv\" data-model-controls=\"\"><legend class=\"svelte-59ntjv\">Model</legend> <label class=\"svelte-59ntjv\">Model role<input aria-label=\"Model role\" class=\"svelte-59ntjv\"/></label> <label class=\"svelte-59ntjv\">Connection mode<select aria-label=\"Connection mode\" class=\"svelte-59ntjv\"></select></label> <!> <label class=\"svelte-59ntjv\">Model mode<select aria-label=\"Model mode\" class=\"svelte-59ntjv\"></select></label> <!> <small class=\"svelte-59ntjv\"> </small><small class=\"svelte-59ntjv\"> </small> <!> <!></fieldset>"), La = /* @__PURE__ */ q("<p class=\"pc-detail-port svelte-59ntjv\"> <small class=\"svelte-59ntjv\"> </small></p>"), Ra = /* @__PURE__ */ q("<details class=\"svelte-59ntjv\"><summary class=\"svelte-59ntjv\">Inputs and outputs</summary><!></details>"), za = /* @__PURE__ */ q("<p role=\"status\" class=\"svelte-59ntjv\"> </p>"), Ba = /* @__PURE__ */ q("<button type=\"button\" class=\"svelte-59ntjv\">Duplicate</button>"), Va = /* @__PURE__ */ q("<header class=\"svelte-59ntjv\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" class=\"svelte-59ntjv\"><path class=\"svelte-59ntjv\"></path></svg><div class=\"svelte-59ntjv\"><h3 class=\"svelte-59ntjv\"> </h3><small class=\"svelte-59ntjv\"><!></small></div></header> <p class=\"pc-detail-meta svelte-59ntjv\"> <!></p> <!> <fieldset class=\"pc-detail-group svelte-59ntjv\"><legend class=\"svelte-59ntjv\">Presentation</legend> <!> <label class=\"pc-detail-check svelte-59ntjv\"><input aria-label=\"Compact card\" type=\"checkbox\" class=\"svelte-59ntjv\"/> Compact card</label> <!></fieldset> <!> <!> <!> <!> <!> <footer class=\"svelte-59ntjv\"><!><button type=\"button\" class=\"pc-detail-danger svelte-59ntjv\">Delete</button></footer>", 1), Ha = /* @__PURE__ */ q("<p class=\"pc-detail-empty svelte-59ntjv\">Select a node to inspect its settings.</p>"), Ua = /* @__PURE__ */ q("<section class=\"pc-node-details svelte-59ntjv\" aria-label=\"Node details\"><!></section>");
function Wa(e, t) {
	Ve(t, !0);
	let n = Ci(t, "actions", 19, () => ({})), r = Ci(t, "idPrefix", 3, "pc-node-details"), i = /* @__PURE__ */ I(Qt({})), a = /* @__PURE__ */ I(Qt({})), o = "", s = "", c = "", l = 0, u = 0, d = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Map(), p = (e) => Object.fromEntries(Object.entries(e).map(([e, t]) => [e, {
		...t,
		pending: !1
	}]));
	function m(e, t) {
		return t ? Object.fromEntries(Object.entries(p(e)).flatMap(([e, n]) => e === "model" || e === "profileId" ? (e === "model" ? t.model?.model : t.model?.profile)?.allowedModes.some((e) => e.value === "override") ? [[e, n]] : [] : e === "boundary" ? t.boundary && n.boundaryId === t.boundary.id && n.boundaryDirection === t.boundary.direction ? [[e, {
			...n,
			artifactKind: t.boundary.kinds.includes(n.artifactKind ?? "") ? n.artifactKind : t.boundary.kind
		}]] : [] : e === "fileInput" ? t.fileInput ? [[e, n]] : [] : t.controls.some((t) => t.key === e && t.editor === n.editor && t.representation === n.representation && (t.editor === "json" || t.editor === "lines")) ? [[e, n]] : [])) : {};
	}
	let h = (e) => JSON.stringify([e.selectionKey, "kind" in e.address ? [
		e.address.kind,
		e.address.definitionRef.id,
		e.address.definitionRef.version,
		e.address.definitionRef.semanticHash,
		e.address.nodeId
	] : [
		e.address.workflowId,
		e.address.instancePath,
		e.address.nodeId
	]]), g = !0;
	Ti(() => {
		g = !1, d.clear(), f.clear();
	}), yn(() => {
		let e = t.view ? h(t.view) : "", n = t.view?.revision ?? "", r = JSON.stringify([
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
			!!t.view?.fileInput
		]), g = e !== o;
		(g || n !== s || r !== c) && ((g || r !== c) && u++, g && o && f.set(o, dr(() => p(W(i)))), o = e, s = n, c = r, d.clear(), l++, L(a, {}, !0), L(i, m(g ? f.get(e) ?? {} : dr(() => W(i)), t.view), !0));
	});
	let _ = (e) => ({
		selectionKey: e.selectionKey,
		revision: e.revision,
		address: "kind" in e.address ? {
			...e.address,
			definitionRef: { ...e.address.definitionRef }
		} : {
			...e.address,
			instancePath: [...e.address.instancePath]
		}
	}), v = (e) => g && !!t.view && t.view.selectionKey === e.selectionKey && t.view.revision === e.revision && h(t.view) === h(e);
	function y(e) {
		return e.editor === "json" ? e.representation === "json-text" ? String(e.value ?? "") : JSON.stringify(e.value, null, 2) : e.editor === "lines" && Array.isArray(e.value) ? e.value.join("\n") : String(e.value ?? "");
	}
	async function b(e, n, r) {
		let o = t.view;
		if (!o || (n ? !o.canPresent : o.readOnly)) return;
		let s = _(o), c = ++l;
		d.set(e, c), L(a, {
			...W(a),
			[e]: ""
		}, !0), W(i)[e] && L(i, {
			...W(i),
			[e]: {
				...W(i)[e],
				pending: !0,
				error: ""
			}
		}, !0);
		let u = "";
		try {
			let e = await r(s);
			e.ok || (u = e.error.code + ": " + e.error.message);
		} catch {
			u = "The edit could not be accepted. Please try again.";
		}
		if (v(s) && d.get(e) === c && (d.delete(e), L(a, {
			...W(a),
			[e]: u
		}, !0), W(i)[e])) {
			if (u) L(i, {
				...W(i),
				[e]: {
					...W(i)[e],
					error: u,
					pending: !1
				}
			}, !0);
			else {
				let t = { ...W(i) };
				delete t[e], L(i, t, !0);
			}
		}
	}
	function x(e) {
		let r = e.files?.[0];
		e.value = "", r && t.view?.fileInput && !t.view.readOnly && n().loadFile && !W(i).fileInput?.pending && (L(i, {
			...W(i),
			fileInput: {
				text: "",
				error: "",
				pending: !1
			}
		}, !0), b("fileInput", !1, (e) => n().loadFile(e, r)));
	}
	function S(e, n) {
		t.view && !t.view.readOnly && (d.delete(e.key), L(i, {
			...W(i),
			[e.key]: {
				text: n,
				error: "",
				pending: !1,
				editor: e.editor,
				representation: e.representation
			}
		}, !0), L(a, {
			...W(a),
			[e.key]: ""
		}, !0));
	}
	function C(e) {
		if (!t.view || t.view.readOnly || !n().editControl) return;
		let r = W(i)[e.key]?.text ?? y(e), a = r;
		if (e.editor === "json") try {
			if (!(e.representation === "json-text" && e.allowEmpty && r.trim() === "")) {
				let t = JSON.parse(r);
				e.representation !== "json-text" && (a = t);
			}
		} catch {
			L(i, {
				...W(i),
				[e.key]: {
					text: r,
					error: "Enter valid JSON before saving.",
					pending: !1,
					editor: e.editor,
					representation: e.representation
				}
			}, !0);
			return;
		}
		else e.editor === "lines" && (a = r.split("\n").filter((e) => e.trim()));
		b(e.key, !1, (t) => n().editControl(t, e.key, a));
	}
	function w(e, t) {
		n().editControl && b(e.key, !1, (r) => n().editControl(r, e.key, t));
	}
	function T(e, r) {
		if (!t.view || t.view.readOnly || !n().editControl) return;
		let i = Number(r.value);
		!r.value.trim() || !Number.isFinite(i) ? L(a, {
			...W(a),
			[e.key]: "Enter a finite number before saving."
		}, !0) : r.validity.valid ? w(e, i) : L(a, {
			...W(a),
			[e.key]: "Enter a number within the allowed range and step."
		}, !0);
	}
	function E(e, t, r) {
		D(e)?.allowedModes.some((e) => e.value === t) && n().editBinding && b(e, !1, (i) => n().editBinding(i, e, t, r));
	}
	let D = (e) => e === "profileId" ? t.view?.model?.profile : t.view?.model?.model, O = (e) => W(i)[e] ? "override" : D(e)?.mode, k = (e) => W(i)[e]?.text ?? D(e)?.value ?? "";
	function A(e, r) {
		t.view && !t.view.readOnly && n().editBinding && D(e)?.allowedModes.some((e) => e.value === "override") && (d.delete(e), L(i, {
			...W(i),
			[e]: {
				text: r,
				error: "",
				pending: !1
			}
		}, !0), L(a, {
			...W(a),
			[e]: ""
		}, !0));
	}
	function ee(e, r) {
		let o = D(e);
		if (!t.view || t.view.readOnly || !n().editBinding || !o?.allowedModes.some((e) => e.value === r)) return;
		if (r === "override") {
			A(e, k(e));
			return;
		}
		d.delete(e);
		let s = { ...W(i) };
		delete s[e], L(i, s, !0), L(a, {
			...W(a),
			[e]: ""
		}, !0), r !== o.mode && E(e, r, null);
	}
	function te(e, r) {
		t.view && !t.view.readOnly && O(e) === "override" && n().editBinding && D(e)?.allowedModes.some((e) => e.value === "override") && (A(e, r), r.trim() ? E(e, "override", r) : L(i, {
			...W(i),
			[e]: {
				text: r,
				error: e === "profileId" ? "Choose a connection before saving an override." : "Enter a model identifier before saving an override.",
				pending: !1
			}
		}, !0));
	}
	function ne() {
		return {
			label: W(i).boundary?.text ?? t.view?.boundary?.label ?? "",
			artifactKind: W(i).boundary?.artifactKind ?? t.view?.boundary?.kind ?? "",
			required: W(i).boundary?.required ?? t.view?.boundary?.required ?? !1
		};
	}
	function re(e, r) {
		if (!t.view?.boundary || t.view.readOnly || !n().editInterface || e === "artifactKind" && !t.view.boundary.kinds.includes(String(r))) return;
		let o = {
			...ne(),
			[e]: r
		};
		u++, d.delete("boundary"), L(a, {
			...W(a),
			boundary: ""
		}, !0), L(i, {
			...W(i),
			boundary: {
				text: String(o.label),
				artifactKind: String(o.artifactKind),
				required: o.required === !0,
				error: "",
				pending: !1,
				boundaryId: t.view.boundary.id,
				boundaryDirection: t.view.boundary.direction
			}
		}, !0);
	}
	function ie() {
		if (!t.view?.boundary || t.view.readOnly || !n().editInterface || W(i).boundary?.pending) return;
		let e = t.view.boundary.id, r = ne();
		if (!r.label.trim() || !t.view.boundary.kinds.includes(r.artifactKind)) return;
		let a = ++u;
		L(i, {
			...W(i),
			boundary: {
				text: r.label,
				artifactKind: r.artifactKind,
				required: r.required,
				error: "",
				pending: !1,
				boundaryId: e,
				boundaryDirection: t.view.boundary.direction
			}
		}, !0), b("boundary", !1, async (o) => {
			let s = await n().editInterface(o, {
				kind: "update",
				id: e,
				...r
			});
			if (s.ok && g && t.view?.boundary?.id === e && h(t.view) === h(o) && u === a) {
				let e = { ...W(i) };
				delete e.boundary, L(i, e, !0);
			}
			return s;
		});
	}
	var ae = Ua(), oe = R(ae), se = (e) => {
		var o = Va(), s = z(o), c = R(s), l = R(c);
		N(c);
		var u = B(c), d = R(u), f = R(d, !0);
		N(d);
		var p = B(d), m = R(p), h = (e) => {
			var n = Or();
			V(() => Y(n, `Subgraph ${t.view.boundary.direction ?? ""}`)), J(e, n);
		}, g = (e) => {
			var n = Or();
			V(() => Y(n, `Canonical type: ${t.view.canonicalTitle ?? ""}`)), J(e, n);
		};
		X(m, (e) => {
			t.view.boundary ? e(h) : e(g, -1);
		}), N(p), N(u), N(s);
		var v = B(s, 2), E = R(v), D = B(E), ae = (e) => {
			J(e, Or("· Read-only body"));
		};
		X(D, (e) => {
			t.view.readOnly && e(ae);
		}), N(v);
		var oe = B(v, 2), se = (e) => {
			var o = ba(), s = R(o), c = R(s);
			N(s);
			var l = B(s, 2), u = B(R(l));
			pi(u), N(l);
			var d = B(l, 2), f = B(R(d));
			Z(f, 21, () => t.view.boundary.kinds, zr, (e, t) => {
				var n = va(), r = R(n, !0);
				N(n);
				var i = {};
				V(() => {
					Y(r, W(t)), i !== (i = W(t)) && (n.value = (n.__value = W(t)) ?? "");
				}), J(e, n);
			}), N(f);
			var p;
			oi(f), N(d);
			var m = B(d, 2), h = R(m);
			pi(h), Ae(), N(m);
			var g = B(m, 2), _ = R(g), v = R(_, !0);
			N(_), N(g);
			var y = B(g, 4), b = (e) => {
				var t = ya(), n = R(t, !0);
				N(t), V(() => Y(n, W(i).boundary?.error || W(a).boundary)), J(e, t);
			};
			X(y, (e) => {
				(W(i).boundary?.error || W(a).boundary) && e(b);
			}), N(o), V((e, a, o, s) => {
				Y(c, `Subgraph ${t.view.boundary.direction ?? ""}`), Q(u, "id", r() + "-boundary-label"), mi(u, e), u.disabled = t.view.readOnly || !n().editInterface, f.disabled = t.view.readOnly || !n().editInterface, p !== (p = a) && (f.value = (f.__value = a) ?? "", ai(f, a)), hi(h, o), h.disabled = t.view.readOnly || !n().editInterface, _.disabled = s, Y(v, W(i).boundary?.pending ? "Validating…" : "Save port");
			}, [
				() => ne().label,
				() => ne().artifactKind,
				() => ne().required,
				() => t.view.readOnly || !n().editInterface || !ne().label.trim() || !!W(i).boundary?.pending
			]), K("input", u, (e) => re("label", e.currentTarget.value)), K("change", f, (e) => re("artifactKind", e.currentTarget.value)), K("change", h, (e) => re("required", e.currentTarget.checked)), K("click", _, () => ie()), J(e, o);
		};
		X(oe, (e) => {
			t.view.boundary && e(se);
		});
		var ce = B(oe, 2), le = B(R(ce), 2), ue = (e) => {
			var r = xa(), i = z(r), a = B(R(i));
			pi(a), N(i);
			var o = B(i, 2);
			V(() => {
				mi(a, t.view.alias), a.disabled = !t.view.canPresent || !n().present, o.disabled = !t.view.canPresent || !n().present;
			}), K("change", a, (e) => {
				let t = e.currentTarget.value;
				n().present && b("alias", !0, (e) => n().present(e, "alias", t));
			}), K("click", o, () => {
				n().present && b("alias", !0, (e) => n().present(e, "alias", ""));
			}), J(e, r);
		};
		X(le, (e) => {
			t.view.boundary || e(ue);
		});
		var de = B(le, 2), fe = R(de);
		pi(fe), Ae(), N(de);
		var pe = B(de, 2), me = (e) => {
			var t = ya(), n = R(t, !0);
			N(t), V(() => Y(n, W(a).alias || W(a).compact)), J(e, t);
		};
		X(pe, (e) => {
			(W(a).alias || W(a).compact) && e(me);
		}), N(ce);
		var he = B(ce, 2), ge = (e) => {
			var o = Ma(), s = B(R(o), 2), c = R(s);
			pi(c), Ae(), N(s);
			var l = B(s, 4), u = (e) => {
				var t = ya(), n = R(t, !0);
				N(t), V(() => Y(n, W(a).enabled)), J(e, t);
			};
			X(l, (e) => {
				W(a).enabled && e(u);
			});
			var d = B(l, 2), f = (e) => {
				var o = Ca(), s = R(o), c = R(s, !0), l = B(c);
				N(s);
				var u = B(s, 2), d = R(u, !0);
				N(u);
				var f = B(u, 6), p = (e) => {
					J(e, Sa());
				};
				X(f, (e) => {
					W(i).fileInput?.pending && e(p);
				});
				var m = B(f, 2), h = (e) => {
					var t = ya(), n = R(t, !0);
					N(t), V(() => {
						Q(t, "id", r() + "-error-fileInput"), Y(n, W(a).fileInput);
					}), J(e, t);
				};
				X(m, (e) => {
					W(a).fileInput && e(h);
				}), N(o), V(() => {
					Y(c, t.view.fileInput.loaded ? "Replace file" : "Choose file"), Q(l, "aria-label", t.view.fileInput.loaded ? "Replace file" : "Choose file"), l.disabled = t.view.readOnly || !n().loadFile || !!W(i).fileInput?.pending, Q(l, "aria-invalid", !!W(a).fileInput), Q(l, "aria-describedby", W(a).fileInput ? r() + "-error-fileInput" : void 0), Y(d, t.view.fileInput.loaded ? "Loaded file: " + t.view.fileInput.fileName : "No file loaded.");
				}), K("change", l, (e) => x(e.currentTarget)), J(e, o);
			};
			X(d, (e) => {
				t.view.fileInput && e(f);
			}), Z(B(d, 2), 17, () => t.view.controls, (e) => e.key, (e, o) => {
				var s = ja(), c = z(s), l = R(c), u = B(l), d = (e) => {
					var r = wa();
					Z(r, 21, () => W(o).options ?? [], (e) => e.value, (e, t) => {
						var n = va(), r = R(n, !0);
						N(n);
						var i = {};
						V(() => {
							Y(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
						}), J(e, n);
					}), N(r);
					var i;
					oi(r), V((e) => {
						Q(r, "aria-label", W(o).label), r.disabled = t.view.readOnly || !n().editControl, i !== (i = e) && (r.value = (r.__value = e) ?? "", ai(r, e));
					}, [() => String(W(o).value)]), K("change", r, (e) => w(W(o), e.currentTarget.value)), J(e, r);
				}, f = (e) => {
					var r = Ta();
					pi(r), V((e) => {
						Q(r, "aria-label", W(o).label), hi(r, e), r.disabled = t.view.readOnly || !n().editControl;
					}, [() => !!W(o).value]), K("change", r, (e) => w(W(o), e.currentTarget.checked)), J(e, r);
				}, p = (e) => {
					var i = Ea();
					pi(i), V((e) => {
						Q(i, "aria-label", W(o).label), Q(i, "min", W(o).min), Q(i, "max", W(o).max), Q(i, "step", W(o).step ?? 1), Q(i, "aria-invalid", !!W(a)[W(o).key]), Q(i, "aria-describedby", W(a)[W(o).key] ? r() + "-error-" + W(o).key : void 0), mi(i, e), i.disabled = t.view.readOnly || !n().editControl;
					}, [() => Number(W(o).value)]), K("change", i, (e) => T(W(o), e.currentTarget)), J(e, i);
				}, m = (e) => {
					var s = Da();
					rt(s), V((e) => {
						Q(s, "aria-label", W(o).label), Q(s, "aria-invalid", !!(W(i)[W(o).key]?.error || W(a)[W(o).key])), Q(s, "aria-describedby", W(i)[W(o).key]?.error || W(a)[W(o).key] ? r() + "-error-" + W(o).key : void 0), mi(s, e), s.disabled = t.view.readOnly || !n().editControl;
					}, [() => W(i)[W(o).key]?.text ?? y(W(o))]), K("input", s, (e) => S(W(o), e.currentTarget.value)), J(e, s);
				}, h = (e) => {
					var r = Da();
					rt(r), V((e) => {
						Q(r, "aria-label", W(o).label), mi(r, e), r.disabled = t.view.readOnly || !n().editControl;
					}, [() => y(W(o))]), K("change", r, (e) => w(W(o), e.currentTarget.value)), J(e, r);
				};
				X(u, (e) => {
					W(o).editor === "enum" ? e(d) : W(o).editor === "boolean" ? e(f, 1) : W(o).editor === "number" ? e(p, 2) : W(o).editor === "json" || W(o).editor === "lines" ? e(m, 3) : e(h, -1);
				}), N(c);
				var g = B(c, 2), _ = (e) => {
					var r = Oa(), a = R(r, !0);
					N(r), V(() => {
						Q(r, "data-save-control", W(o).key), r.disabled = t.view.readOnly || !n().editControl || !!W(i)[W(o).key]?.pending, Y(a, W(i)[W(o).key]?.pending ? "Validating…" : "Save " + W(o).label);
					}), K("click", r, () => C(W(o))), J(e, r);
				};
				X(g, (e) => {
					(W(o).editor === "json" || W(o).editor === "lines") && e(_);
				});
				var v = B(g, 2), b = (e) => {
					var t = ka(), n = R(t, !0);
					N(t), V(() => Y(n, W(o).help)), J(e, t);
				};
				X(v, (e) => {
					W(o).help && e(b);
				});
				var x = B(v, 2), E = (e) => {
					var t = ka(), n = R(t, !0);
					N(t), V(() => Y(n, W(o).exposureNote)), J(e, t);
				};
				X(x, (e) => {
					W(o).exposureNote && e(E);
				});
				var D = B(x, 2), O = (e) => {
					var t = Aa(), n = R(t), r = B(n), i = (e) => {
						var t = Or();
						V(() => Y(t, `· ${W(o).source ?? ""}`)), J(e, t);
					};
					X(r, (e) => {
						W(o).source && e(i);
					}), N(t), V(() => Y(n, `Effective: ${W(o).effective ?? ""}`)), J(e, t);
				};
				X(D, (e) => {
					W(o).effective !== void 0 && e(O);
				});
				var k = B(D, 2), A = (e) => {
					var t = ya(), n = R(t, !0);
					N(t), V(() => {
						Q(t, "id", r() + "-error-" + W(o).key), Y(n, W(i)[W(o).key]?.error || W(a)[W(o).key]);
					}), J(e, t);
				};
				X(k, (e) => {
					(W(i)[W(o).key]?.error || W(a)[W(o).key]) && e(A);
				}), V(() => Y(l, `${W(o).label ?? ""} `)), J(e, s);
			}), N(o), V(() => {
				hi(c, t.view.enabled), c.disabled = t.view.readOnly || !n().editField;
			}), K("change", c, (e) => {
				let t = e.currentTarget.checked;
				n().editField && b("enabled", !1, (e) => n().editField(e, "enabled", t));
			}), J(e, o);
		};
		X(he, (e) => {
			t.view.boundary || e(ge);
		});
		var _e = B(he, 2), ve = (e) => {
			var r = Ia(), o = B(R(r), 2), s = B(R(o));
			pi(s), N(o);
			var c = B(o, 2), l = B(R(c));
			Z(l, 21, () => t.view.model.profile.allowedModes, (e) => e.value, (e, t) => {
				var n = va(), r = R(n, !0);
				N(n);
				var i = {};
				V(() => {
					Y(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
				}), J(e, n);
			}), N(l);
			var u;
			oi(l), N(c);
			var d = B(c, 2), f = (e) => {
				var r = Na(), i = B(R(r)), a = R(i);
				a.value = a.__value = "", Z(B(a), 17, () => t.view.model.profile.options ?? [], (e) => e.value, (e, t) => {
					var n = va(), r = R(n, !0);
					N(n);
					var i = {};
					V(() => {
						Y(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
					}), J(e, n);
				}), N(i);
				var o;
				oi(i), N(r), V((e) => {
					i.disabled = t.view.readOnly || !n().editBinding, o !== (o = e) && (i.value = (i.__value = e) ?? "", ai(i, e));
				}, [() => k("profileId")]), K("change", i, (e) => te("profileId", e.currentTarget.value)), J(e, r);
			}, p = /* @__PURE__ */ P(() => O("profileId") === "override");
			X(d, (e) => {
				W(p) && e(f);
			});
			var m = B(d, 2), h = B(R(m));
			Z(h, 21, () => t.view.model.model.allowedModes, (e) => e.value, (e, t) => {
				var n = va(), r = R(n, !0);
				N(n);
				var i = {};
				V(() => {
					Y(r, W(t).label), i !== (i = W(t).value) && (n.value = (n.__value = W(t).value) ?? "");
				}), J(e, n);
			}), N(h);
			var g;
			oi(h), N(m);
			var _ = B(m, 2), v = (e) => {
				var r = Pa(), i = B(R(r));
				pi(i), N(r), V((e) => {
					mi(i, e), i.disabled = t.view.readOnly || !n().editBinding;
				}, [() => k("model")]), K("input", i, (e) => A("model", e.currentTarget.value)), K("change", i, (e) => te("model", e.currentTarget.value)), J(e, r);
			}, y = /* @__PURE__ */ P(() => O("model") === "override");
			X(_, (e) => {
				W(y) && e(v);
			});
			var x = B(_, 2), S = R(x);
			N(x);
			var C = B(x), w = R(C, !0);
			N(C);
			var T = B(C, 2), E = (e) => {
				var n = Fa(), r = R(n, !0);
				N(n), V(() => Y(r, t.view.model.issue)), J(e, n);
			};
			X(T, (e) => {
				t.view.model.issue && e(E);
			});
			var D = B(T, 2), ne = (e) => {
				var t = ya(), n = R(t, !0);
				N(t), V(() => Y(n, W(a).modelRole || W(i).profileId?.error || W(a).profileId || W(i).model?.error || W(a).model)), J(e, t);
			};
			X(D, (e) => {
				(W(a).modelRole || W(i).profileId?.error || W(a).profileId || W(i).model?.error || W(a).model) && e(ne);
			}), N(r), V((e, r) => {
				mi(s, t.view.model.role), s.disabled = t.view.readOnly || !t.view.model.roleEditable || !n().editField, l.disabled = t.view.readOnly || !n().editBinding, u !== (u = e) && (l.value = (l.__value = e) ?? "", ai(l, e)), h.disabled = t.view.readOnly || !n().editBinding, g !== (g = r) && (h.value = (h.__value = r) ?? "", ai(h, r)), Y(S, `Effective connection: ${t.view.model.effective ?? ""}`), Y(w, t.view.model.source);
			}, [() => O("profileId"), () => O("model")]), K("change", s, (e) => {
				let r = e.currentTarget.value;
				t.view?.model?.roleEditable && n().editField && b("modelRole", !1, (e) => n().editField(e, "modelRole", r));
			}), K("change", l, (e) => ee("profileId", e.currentTarget.value)), K("change", h, (e) => ee("model", e.currentTarget.value)), J(e, r);
		};
		X(_e, (e) => {
			t.view.model && e(ve);
		});
		var ye = B(_e, 2), be = (e) => {
			var n = Ra();
			Z(B(R(n)), 17, () => t.view.ports, (e) => e.direction + ":" + e.id, (e, t) => {
				var n = La(), r = R(n), i = B(r), a = R(i, !0);
				N(i), N(n), V(() => {
					Y(r, `${W(t).direction === "input" ? "In" : "Out"} · ${W(t).label ?? ""}`), Y(a, W(t).kind);
				}), J(e, n);
			}), N(n), J(e, n);
		};
		X(ye, (e) => {
			t.view.ports.length && e(be);
		});
		var xe = B(ye, 2), Se = (e) => {
			var n = za(), r = R(n, !0);
			N(n), V(() => Y(r, t.view.status)), J(e, n);
		};
		X(xe, (e) => {
			t.view.status && e(Se);
		});
		var Ce = B(xe, 2);
		Z(Ce, 17, () => t.view.issues ?? [], zr, (e, t) => {
			var n = Fa(), r = R(n, !0);
			N(n), V(() => Y(r, W(t))), J(e, n);
		});
		var we = B(Ce, 2), Te = R(we), Ee = (e) => {
			var r = Ba();
			V(() => r.disabled = t.view.readOnly || !n().duplicate), K("click", r, () => {
				t.view && !t.view.readOnly && n().duplicate?.(_(t.view));
			}), J(e, r);
		};
		X(Te, (e) => {
			t.view.boundary || e(Ee);
		});
		var j = B(Te);
		N(we), V(() => {
			Q(l, "d", t.view.iconPath), Y(f, t.view.title), Y(E, `${t.view.family ?? ""} · ${t.view.phase ?? ""} phase`), hi(fe, t.view.compact), fe.disabled = !t.view.canPresent || !n().present, j.disabled = t.view.readOnly || !n().remove;
		}), K("change", fe, (e) => {
			let t = e.currentTarget.checked;
			n().present && b("compact", !0, (e) => n().present(e, "compact", t));
		}), K("click", j, () => {
			t.view && !t.view.readOnly && n().remove?.(_(t.view));
		}), J(e, o);
	}, ce = (e) => {
		J(e, Ha());
	};
	X(oe, (e) => {
		t.view ? e(se) : e(ce, -1);
	}), N(ae), J(e, ae), He();
}
vr([
	"input",
	"change",
	"click"
]);
//#endregion
//#region ui/CommentDetails.svelte
var Ga = /* @__PURE__ */ q("<p class=\"pc-detail-meta svelte-17djc3u\">Read-only comment</p>"), Ka = /* @__PURE__ */ q("<section class=\"pc-comment-details svelte-17djc3u\" aria-label=\"Comment details\"><h3 class=\"svelte-17djc3u\">Comment</h3> <!> <fieldset class=\"pc-detail-group svelte-17djc3u\"><legend class=\"svelte-17djc3u\">Comment</legend> <label class=\"svelte-17djc3u\">Title<input aria-label=\"Comment title\" class=\"svelte-17djc3u\"/></label> <label class=\"svelte-17djc3u\">Notes<textarea aria-label=\"Comment notes\" rows=\"5\" class=\"svelte-17djc3u\"></textarea></label> <label class=\"pc-comment-color-label svelte-17djc3u\">Color<input aria-label=\"Comment color\" type=\"color\" class=\"svelte-17djc3u\"/></label> <label class=\"pc-detail-check svelte-17djc3u\"><input aria-label=\"Move contents\" type=\"checkbox\" class=\"svelte-17djc3u\"/> Move contents</label> <small class=\"svelte-17djc3u\">Moves fully contained nodes when you drag the comment header.</small></fieldset> <div class=\"pc-comment-commands svelte-17djc3u\"><button type=\"button\" class=\"pc-btn svelte-17djc3u\">Fit to contents</button> <button type=\"button\" class=\"pc-btn pc-danger svelte-17djc3u\">Delete comment</button></div> <small class=\"svelte-17djc3u\">Deleting this comment keeps its contents.</small></section>");
function qa(e, t) {
	Ve(t, !0);
	let n = Ci(t, "readOnly", 3, !1), r = /* @__PURE__ */ P(() => n() || t.comment.readOnly), i = (e) => e.stopPropagation();
	function a(e) {
		W(r) || t.onPatch(e);
	}
	function o(e) {
		W(r) || t.onCommand(e);
	}
	var s = Ka(), c = B(R(s), 2), l = (e) => {
		J(e, Ga());
	};
	X(c, (e) => {
		W(r) && e(l);
	});
	var u = B(c, 2), d = B(R(u), 2), f = B(R(d));
	pi(f), N(d);
	var p = B(d, 2), m = B(R(p));
	rt(m), N(p);
	var h = B(p, 2), g = B(R(h));
	pi(g), N(h);
	var _ = B(h, 2), v = R(_);
	pi(v), Ae(), N(_), Ae(2), N(u);
	var y = B(u, 2), b = R(y), x = B(b, 2);
	N(y), Ae(2), N(s), V(() => {
		u.disabled = W(r), mi(f, t.comment.title), f.disabled = W(r), mi(m, t.comment.content), m.disabled = W(r), mi(g, t.comment.color), g.disabled = W(r), hi(v, t.comment.moveContents), v.disabled = W(r), b.disabled = W(r), x.disabled = W(r);
	}), G("keydown", f, i, !0), K("change", f, (e) => a({ title: e.currentTarget.value })), G("keydown", m, i, !0), K("change", m, (e) => a({ content: e.currentTarget.value })), K("change", g, (e) => a({ color: e.currentTarget.value })), K("change", v, (e) => a({ moveContents: e.currentTarget.checked })), K("click", b, () => o("fit")), K("click", x, () => o("delete")), J(e, s), He();
}
vr(["change", "click"]);
//#endregion
//#region ui/OutputPreview.svelte
var Ja = /* @__PURE__ */ q("<option class=\"svelte-ee2ehy\"> </option>"), Ya = /* @__PURE__ */ q("<label class=\"pc-preview-choice svelte-ee2ehy\"><span class=\"pc-preview-sr-only svelte-ee2ehy\">Preview output</span><select aria-label=\"Preview output\" class=\"svelte-ee2ehy\"><option disabled=\"\" class=\"svelte-ee2ehy\">Choose an output</option><!></select></label>"), Xa = /* @__PURE__ */ q("<button type=\"button\" class=\"svelte-ee2ehy\">Collapse preview</button>"), Za = /* @__PURE__ */ q("<button type=\"button\" role=\"tab\" class=\"svelte-ee2ehy\"> </button>"), Qa = /* @__PURE__ */ q("<div class=\"pc-preview-tabs svelte-ee2ehy\" role=\"tablist\" aria-label=\"Recorded artifacts\"></div>"), $a = /* @__PURE__ */ q("<p class=\"pc-preview-note svelte-ee2ehy\"> </p>"), eo = /* @__PURE__ */ q("<pre class=\"svelte-ee2ehy\"> </pre>"), to = /* @__PURE__ */ q("<small class=\"pc-preview-note svelte-ee2ehy\"> </small>"), no = /* @__PURE__ */ q("<div role=\"tabpanel\" tabindex=\"0\" class=\"svelte-ee2ehy\"><article class=\"svelte-ee2ehy\"><div class=\"pc-preview-section-heading svelte-ee2ehy\"><span class=\"svelte-ee2ehy\"> </span><small class=\"svelte-ee2ehy\"> </small></div> <!> <!></article></div>"), ro = /* @__PURE__ */ q("<p class=\"pc-preview-empty svelte-ee2ehy\"> </p>"), io = /* @__PURE__ */ q("<p class=\"pc-preview-error svelte-ee2ehy\"> </p>"), ao = /* @__PURE__ */ q("<small class=\"pc-preview-note svelte-ee2ehy\">Apply rechecks the source and connection. Recorded preview text may be truncated.</small>"), oo = /* @__PURE__ */ q("<button type=\"button\" data-run-here=\"\" title=\"Runs the selected output's dependencies. Results are diagnostic previews.\" class=\"svelte-ee2ehy\"> </button>"), so = /* @__PURE__ */ q("<button type=\"button\" data-preview-apply=\"\" class=\"svelte-ee2ehy\">Apply reviewed candidate</button><button type=\"button\" class=\"svelte-ee2ehy\">Reject candidate</button>", 1), co = /* @__PURE__ */ q("<header class=\"svelte-ee2ehy\"><h3 class=\"svelte-ee2ehy\"> </h3> <!> <div class=\"pc-preview-tools svelte-ee2ehy\"><button type=\"button\" class=\"svelte-ee2ehy\">Follow selection</button><button type=\"button\" class=\"svelte-ee2ehy\"> </button><!></div></header> <!> <div class=\"pc-preview-sections svelte-ee2ehy\"><!> <!> <!> <!> <!> <!> <!></div> <footer class=\"svelte-ee2ehy\"><span class=\"pc-preview-status svelte-ee2ehy\"> </span> <span class=\"svelte-ee2ehy\"> </span> <!> <!></footer>", 1), lo = /* @__PURE__ */ q("<p class=\"pc-preview-empty svelte-ee2ehy\">Select a node output to inspect its recorded result.</p>"), uo = /* @__PURE__ */ q("<section class=\"pc-output-preview svelte-ee2ehy\" aria-label=\"Output preview\"><!></section>");
function fo(e, t) {
	let n = Ar();
	Ve(t, !0);
	let r = Ci(t, "actions", 19, () => ({})), i = /* @__PURE__ */ P(() => JSON.stringify([t.view?.sourceKey, t.view?.selectedKey])), a = /* @__PURE__ */ I(Qt({
		scope: "",
		id: null
	})), o = /* @__PURE__ */ P(() => (W(a).scope === W(i) ? t.view?.sections.find((e) => e.id === W(a).id) : null) ?? t.view?.sections[0] ?? null);
	yn(() => {
		let e = W(a).scope === W(i) && t.view?.sections.some((e) => e.id === W(a).id) ? W(a).id : t.view?.sections[0]?.id ?? null;
		(W(a).scope !== W(i) || W(a).id !== e) && L(a, {
			scope: W(i),
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
			scope: W(i),
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
	}, p = /* @__PURE__ */ P(() => !!(t.view && W(l) && t.view.status !== "removed" && !t.view.busy && t.view.runHere?.enabled && r().runHere)), m = /* @__PURE__ */ P(() => !!(t.view && W(l) && t.view.review?.mode === "root" && t.view.review.selectedRootTerminal && "kind" in W(l).target && W(l).target.address.instancePath.length === 0 && d(W(l).target) === d(t.view.review.selector.terminal))), h = /* @__PURE__ */ P(() => !!(t.view && t.view.status === "current" && !t.view.busy && W(m) && t.view.review?.fresh && t.view.review.canApply && r().apply)), g = /* @__PURE__ */ P(() => !!(t.view && !t.view.busy && W(m) && r().reject));
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
	var y = uo(), b = R(y), x = (e) => {
		var d = co(), m = z(d), y = R(m), b = R(y, !0);
		N(y);
		var x = B(y, 2), S = (e) => {
			var n = Ya(), i = B(R(n)), a = R(i);
			a.value = a.__value = "", Z(B(a), 17, () => t.view.choices, (e) => e.key, (e, t) => {
				var n = Ja(), r = R(n);
				N(n);
				var i = {};
				V(() => {
					Y(r, `${W(t).label ?? ""} · ${W(t).kind ?? ""}`), i !== (i = W(t).key) && (n.value = (n.__value = W(t).key) ?? "");
				}), J(e, n);
			}), N(i);
			var o;
			oi(i), N(n), V(() => {
				i.disabled = !r().select, o !== (o = t.view.selectedKey ?? "") && (i.value = (i.__value = t.view.selectedKey ?? "") ?? "", ai(i, t.view.selectedKey ?? ""));
			}), K("change", i, (e) => _(e.currentTarget.value)), J(e, n);
		};
		X(x, (e) => {
			t.view.choices.length && e(S);
		});
		var C = B(x, 2), w = R(C), T = B(w), E = R(T, !0);
		N(T);
		var D = B(T), O = (e) => {
			var n = Xa();
			K("click", n, function(...e) {
				t.collapse?.apply(this, e);
			}), J(e, n);
		};
		X(D, (e) => {
			t.collapse && e(O);
		}), N(C), N(m);
		var k = B(m, 2), A = (e) => {
			var r = Qa();
			Z(r, 23, () => t.view.sections, (e) => e.id, (e, t, r) => {
				var l = Za(), u = R(l, !0);
				N(l), V((e) => {
					Q(l, "id", e), Q(l, "aria-selected", W(o)?.id === W(t).id), Q(l, "aria-controls", n + "-panel"), Q(l, "tabindex", W(o)?.id === W(t).id ? 0 : -1), Y(u, W(t).label);
				}, [() => s(W(t).id)]), K("click", l, () => {
					L(a, {
						scope: W(i),
						id: W(t).id
					}, !0);
				}), G("keydown", l, (e) => c(e, W(r)), !0), J(e, l);
			}), N(r), J(e, r);
		};
		X(k, (e) => {
			t.view.sections.length && e(A);
		});
		var ee = B(k, 2), te = R(ee), ne = (e) => {
			let t = /* @__PURE__ */ P(() => W(o));
			var r = no(), i = R(r), a = R(i), c = R(a), l = R(c, !0);
			N(c);
			var u = B(c), d = R(u, !0);
			N(u), N(a);
			var f = B(a, 2), p = (e) => {
				var n = $a(), r = R(n, !0);
				N(n), V(() => Y(r, W(t).text)), J(e, n);
			}, m = (e) => {
				var n = eo(), r = R(n, !0);
				N(n), V(() => Y(r, W(t).text)), J(e, n);
			};
			X(f, (e) => {
				W(t).format === "omitted" ? e(p) : e(m, -1);
			});
			var h = B(f, 2), g = (e) => {
				var n = to(), r = R(n);
				N(n), V(() => Y(r, `Truncated diagnostic${W(t).format === "json-prefix-text" ? " · JSON prefix shown as text" : ""}`)), J(e, n);
			};
			X(h, (e) => {
				W(t).truncated && e(g);
			}), N(i), N(r), V((e) => {
				Q(r, "id", n + "-panel"), Q(r, "aria-labelledby", e), Q(i, "data-artifact-kind", W(t).kind), Y(l, W(t).label), Y(d, W(t).kind);
			}, [() => s(W(t).id)]), G("keydown", r, (e) => e.stopPropagation(), !0), G("paste", r, (e) => e.stopPropagation(), !0), J(e, r);
		}, re = (e) => {
			var n = ro(), r = R(n, !0);
			N(n), V(() => Y(r, t.view.status === "not-run" ? "Run this workflow or use Run to here to inspect an output." : "No recorded artifact is available for this output.")), J(e, n);
		};
		X(te, (e) => {
			W(o) ? e(ne) : e(re, -1);
		});
		var ie = B(te, 2), ae = (e) => {
			var n = $a(), r = R(n, !0);
			N(n), V(() => Y(r, t.view.statusDetail)), J(e, n);
		};
		X(ie, (e) => {
			t.view.statusDetail && e(ae);
		});
		var oe = B(ie, 2);
		Z(oe, 17, () => t.view.sections.filter((e) => e.id !== W(o)?.id && (e.format === "omitted" || e.truncated)), (e) => e.id, (e, t) => {
			var n = $a(), r = R(n);
			N(n), V(() => Y(r, `${W(t).label ?? ""}: ${(W(t).format === "omitted" ? W(t).text : "Truncated diagnostic" + (W(t).format === "json-prefix-text" ? " · JSON prefix shown as text" : "")) ?? ""}`)), J(e, n);
		});
		var se = B(oe, 2), ce = (e) => {
			var n = $a(), r = R(n, !0);
			N(n), V(() => Y(r, t.view.runHere.issue)), J(e, n);
		};
		X(se, (e) => {
			t.view.runHere?.issue && e(ce);
		});
		var le = B(se, 2);
		Z(le, 17, () => t.view.issues, zr, (e, t) => {
			var n = io(), r = R(n, !0);
			N(n), V(() => Y(r, W(t))), J(e, n);
		});
		var ue = B(le, 2), de = (e) => {
			var n = io(), r = R(n, !0);
			N(n), V(() => Y(r, t.view.review.issue)), J(e, n);
		};
		X(ue, (e) => {
			t.view.review?.issue && e(de);
		});
		var fe = B(ue, 2), pe = (e) => {
			J(e, ao());
		};
		X(fe, (e) => {
			t.view.review && e(pe);
		}), N(ee);
		var me = B(ee, 2), he = R(me), ge = R(he, !0);
		N(he);
		var _e = B(he, 2), ve = R(_e, !0);
		N(_e);
		var ye = B(_e, 2), be = (e) => {
			var n = oo(), i = R(n);
			N(n), V(() => {
				n.disabled = !W(p), Y(i, `Run to here · maximum ${t.view.runHere.callBound ?? ""} ${t.view.runHere.callBound === 1 ? "request" : "requests"}`);
			}), K("click", n, () => {
				t.view && W(l) && W(p) && r().runHere?.(t.view.sourceKey, f(W(l).target));
			}), J(e, n);
		};
		X(ye, (e) => {
			t.view.runHere && e(be);
		});
		var xe = B(ye, 2), Se = (e) => {
			var n = so(), i = z(n), a = B(i);
			V(() => {
				i.disabled = !W(h), a.disabled = !W(g);
			}), K("click", i, () => {
				t.view?.review && W(h) && r().apply?.(v(t.view.review.selector));
			}), K("click", a, () => {
				t.view?.review && W(g) && r().reject?.(v(t.view.review.selector));
			}), J(e, n);
		};
		X(xe, (e) => {
			t.view.review && e(Se);
		}), N(me), V((e) => {
			Y(b, W(l)?.label ?? t.view.title), Q(w, "aria-pressed", t.view.followSelection), w.disabled = !r().follow, Q(T, "aria-pressed", t.view.pinned), T.disabled = t.view.pinned ? !r().follow : !W(l) || !r().pin, Y(E, t.view.pinned ? "Unpin preview" : "Pin preview"), Q(he, "data-status", t.view.status), Y(ge, e), Y(ve, t.view.pinned ? "Pinned preview" : t.view.followSelection ? "Following selection" : "Selection not followed");
		}, [() => u(t.view.status)]), K("click", w, () => r().follow?.()), K("click", T, () => {
			t.view?.pinned ? r().follow?.() : t.view && W(l) && r().pin?.(t.view.sourceKey, f(W(l).target));
		}), J(e, d);
	}, S = (e) => {
		J(e, lo());
	};
	X(b, (e) => {
		t.view ? e(x) : e(S, -1);
	}), N(y), J(e, y), He();
}
vr(["change", "click"]);
//#endregion
//#region ui/RunDetails.svelte
var po = /* @__PURE__ */ q("<p class=\"pc-run-memory svelte-f9s2fm\" role=\"status\"> </p>"), mo = /* @__PURE__ */ q("<p class=\"pc-run-error svelte-f9s2fm\"> </p>"), ho = /* @__PURE__ */ q("<p class=\"pc-run-empty svelte-f9s2fm\">No execution plan has been recorded.</p>"), go = /* @__PURE__ */ q("<span aria-hidden=\"true\" class=\"svelte-f9s2fm\">▱</span>"), _o = /* @__PURE__ */ q("<small class=\"svelte-f9s2fm\"> </small>"), vo = /* @__PURE__ */ q("<details class=\"svelte-f9s2fm\"><summary class=\"svelte-f9s2fm\">Reported usage</summary><div class=\"pc-run-usage svelte-f9s2fm\"><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small></div></details>"), yo = /* @__PURE__ */ q("<li class=\"svelte-f9s2fm\"><div class=\"pc-run-row-heading svelte-f9s2fm\"><button type=\"button\" class=\"svelte-f9s2fm\"><!> </button><span class=\"pc-run-status svelte-f9s2fm\"> </span></div> <!> <div class=\"pc-run-row-meta svelte-f9s2fm\"><small class=\"svelte-f9s2fm\"> </small><small class=\"svelte-f9s2fm\"> </small></div> <!> <!></li>"), bo = /* @__PURE__ */ q("<header class=\"svelte-f9s2fm\"><h3 class=\"svelte-f9s2fm\">Run details</h3><span class=\"pc-run-status svelte-f9s2fm\"> </span></header> <div class=\"pc-run-summary svelte-f9s2fm\"><p class=\"svelte-f9s2fm\"> </p><p class=\"svelte-f9s2fm\"> </p><p class=\"svelte-f9s2fm\"> </p></div> <!> <!> <!> <ol class=\"pc-run-rows svelte-f9s2fm\"></ol>", 1), xo = /* @__PURE__ */ q("<p class=\"pc-run-empty svelte-f9s2fm\">Run a workflow to inspect its processing stages.</p>"), So = /* @__PURE__ */ q("<section class=\"pc-run-details svelte-f9s2fm\" aria-label=\"Run details\"><!></section>");
function Co(e, t) {
	Ve(t, !0);
	let n = Ci(t, "actions", 19, () => ({})), r = (e) => e === "not-run" ? "Not run" : e === "empty" ? "Ready" : e.charAt(0).toUpperCase() + e.slice(1), i = (e) => e !== null && Number.isFinite(e) && e >= 0 ? (e / 1e3).toFixed(2) + "s" : "Unknown", a = (e) => e != null && Number.isFinite(e) && e >= 0 ? String(e) : "Unknown";
	var o = So(), s = R(o), c = (e) => {
		var o = bo(), s = z(o), c = B(R(s)), l = R(c, !0);
		N(c), N(s);
		var u = B(s, 2), d = R(u), f = R(d);
		N(d);
		var p = B(d), m = R(p);
		N(p);
		var h = B(p), g = R(h);
		N(h), N(u);
		var _ = B(u, 2), v = (e) => {
			var n = po(), r = R(n, !0);
			N(n), V(() => Y(r, t.view.memoryStatus)), J(e, n);
		};
		X(_, (e) => {
			t.view.memoryStatus && e(v);
		});
		var y = B(_, 2), b = (e) => {
			var n = mo(), r = R(n, !0);
			N(n), V(() => Y(r, t.view.issue)), J(e, n);
		};
		X(y, (e) => {
			t.view.issue && e(b);
		});
		var x = B(y, 2), S = (e) => {
			J(e, ho());
		};
		X(x, (e) => {
			t.view.rows.length || e(S);
		});
		var C = B(x, 2);
		Z(C, 21, () => t.view.rows, (e) => e.key, (e, o) => {
			var s = yo();
			let c;
			var l = R(s), u = R(l), d = R(u), f = (e) => {
				J(e, go());
			};
			X(d, (e) => {
				W(o).kind === "instance" && e(f);
			});
			var p = B(d, 1, !0);
			N(u);
			var m = B(u), h = R(m, !0);
			N(m), N(l);
			var g = B(l, 2), _ = (e) => {
				var t = _o(), n = R(t, !0);
				N(t), V((e) => Y(n, e), [() => r(W(o).subphase)]), J(e, t);
			};
			X(g, (e) => {
				W(o).subphase && e(_);
			});
			var v = B(g, 2), y = R(v), b = R(y);
			N(y);
			var x = B(y), S = R(x);
			N(x), N(v);
			var C = B(v, 2), w = (e) => {
				var t = mo(), n = R(t, !0);
				N(t), V(() => Y(n, W(o).issue)), J(e, t);
			};
			X(C, (e) => {
				W(o).issue && e(w);
			});
			var T = B(C, 2), E = (e) => {
				var t = vo(), n = B(R(t)), r = R(n), i = R(r);
				N(r);
				var s = B(r), c = R(s);
				N(s);
				var l = B(s), u = R(l);
				N(l);
				var d = B(l), f = R(d);
				N(d), N(n), N(t), V((e, t, n) => {
					Y(i, `Input tokens: ${e ?? ""}`), Y(c, `Output tokens: ${t ?? ""}`), Y(u, `Total tokens: ${n ?? ""}`), Y(f, `Cost: ${W(o).usage?.cost ?? "Unknown" ?? ""}`);
				}, [
					() => a(W(o).usage?.inputTokens),
					() => a(W(o).usage?.outputTokens),
					() => a(W(o).usage?.totalTokens)
				]), J(e, t);
			};
			X(T, (e) => {
				W(o).kind === "primitive" && e(E);
			}), N(s), V((e, t, r) => {
				Q(s, "data-run-row", W(o).key), Q(s, "data-depth", W(o).depth), Q(s, "data-status", W(o).status), c = ii(s, "", c, e), Q(u, "aria-label", "Open " + W(o).title + " in graph"), u.disabled = !n().jump, Y(p, W(o).title), Q(m, "data-status", W(o).status), Y(h, t), Y(b, `Duration: ${r ?? ""}`), Y(S, `${W(o).attempts ?? ""} of ${W(o).callBound ?? ""} requests`);
			}, [
				() => ({ "margin-left": `${Math.max(0, Math.min(8, W(o).depth)) * 12}px` }),
				() => r(W(o).status),
				() => i(W(o).durationMs)
			]), K("click", u, () => {
				t.view && n().jump?.(t.view.runId, {
					...W(o).address,
					instancePath: [...W(o).address.instancePath]
				});
			}), J(e, s);
		}), N(C), V((e, n) => {
			Q(c, "data-status", t.view.status), Y(l, e), Y(f, `${t.view.completedCount ?? ""} of ${t.view.executableCount ?? ""} stages complete`), Y(m, `${t.view.actualCalls ?? ""} of ${t.view.callBound ?? ""} requests`), Y(g, `Elapsed: ${n ?? ""}`);
		}, [() => r(t.view.status), () => i(t.view.elapsedMs)]), J(e, o);
	}, l = (e) => {
		J(e, xo());
	};
	X(s, (e) => {
		t.view ? e(c) : e(l, -1);
	}), N(o), J(e, o), He();
}
vr(["click"]);
//#endregion
//#region ui/RunMeter.svelte
var wo = /* @__PURE__ */ q("<span class=\"pc-run-meter-elapsed svelte-1tkcp3\" data-run-elapsed=\"\"> </span>"), To = /* @__PURE__ */ q("<span class=\"pc-run-pixel svelte-1tkcp3\" data-run-pixel=\"\"></span>"), Eo = /* @__PURE__ */ q("<button class=\"pc-run-meter svelte-1tkcp3\"><span class=\"pc-run-meter-label svelte-1tkcp3\"> </span> <!> <span class=\"pc-run-meter-pixels svelte-1tkcp3\" aria-hidden=\"true\"></span></button>");
function Do(e, t) {
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
	var o = kr(), s = z(o), c = (e) => {
		var r = Eo(), o = R(r), s = R(o, !0);
		N(o);
		var c = B(o, 2), l = (e) => {
			var n = wo(), r = R(n);
			N(n), V((e) => Y(r, `${e ?? ""}s`), [() => (t.view.elapsedMs / 1e3).toFixed(1)]), J(e, n);
		}, u = /* @__PURE__ */ P(() => t.view.elapsedMs !== null && Number.isFinite(t.view.elapsedMs) && t.view.elapsedMs >= 0);
		X(c, (e) => {
			W(u) && e(l);
		});
		var d = B(c, 2);
		Z(d, 21, () => W(i), (e) => e.key, (e, t) => {
			var n = To();
			V(() => {
				Q(n, "data-status", W(t).status), Q(n, "title", W(t).title);
			}), J(e, n);
		}), N(d), N(r), V((e) => {
			Q(r, "aria-label", W(a)), Q(r, "title", W(a)), r.disabled = !t.open, Y(s, e);
		}, [() => n(t.view.status)]), K("click", r, () => t.open?.()), J(e, r);
	};
	X(s, (e) => {
		t.view && e(c);
	}), J(e, o), He();
}
vr(["click"]);
//#endregion
//#region ui/PortalManager.svelte
var Oo = /* @__PURE__ */ q("<button type=\"button\" class=\"svelte-mnv790\">Close</button>"), ko = /* @__PURE__ */ q("<option class=\"svelte-mnv790\"> </option>"), Ao = /* @__PURE__ */ q("<label class=\"svelte-mnv790\">Portal name<input aria-label=\"Portal name\" class=\"svelte-mnv790\"/></label> <p class=\"pc-note svelte-mnv790\"> </p> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-rename=\"\" class=\"svelte-mnv790\">Rename</button></div>", 1), jo = /* @__PURE__ */ q("<p class=\"pc-note svelte-mnv790\">Select a portal or create one from an output.</p>"), Mo = /* @__PURE__ */ q("<button type=\"button\" data-portal-jump-source=\"\" class=\"svelte-mnv790\">Jump to source</button>"), No = /* @__PURE__ */ q("<label class=\"pc-check svelte-mnv790\"><input type=\"checkbox\" aria-label=\"Replace existing connection\" class=\"svelte-mnv790\"/>Replace existing connection</label>"), Po = /* @__PURE__ */ q("<button type=\"button\" data-portal-jump-consumer=\"\" class=\"svelte-mnv790\">Jump</button>"), Fo = /* @__PURE__ */ q("<div class=\"pc-consumer svelte-mnv790\"><span class=\"svelte-mnv790\"> </span><div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-restore=\"\" class=\"svelte-mnv790\">Restore wire</button> <!></div></div>"), Io = /* @__PURE__ */ q("<p class=\"pc-note svelte-mnv790\">No consumers.</p>"), Lo = /* @__PURE__ */ q("<label class=\"svelte-mnv790\">Existing consumers<select aria-label=\"Existing consumers\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Choose before deleting…</option><option class=\"svelte-mnv790\">Restore visible wires</option><option class=\"svelte-mnv790\">Disconnect consumers</option></select></label>"), Ro = /* @__PURE__ */ q("<details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Consumers</summary> <label class=\"svelte-mnv790\">Compatible receiver<select aria-label=\"Compatible receiver\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select input…</option><!></select></label> <!> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-connect=\"\" class=\"svelte-mnv790\">Connect receiver</button></div> <!> <!> <!> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-delete=\"\" class=\"svelte-mnv790\">Delete portal</button></div></details>"), zo = /* @__PURE__ */ q("<details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Convert to portal</summary><p class=\"pc-note svelte-mnv790\"> </p><div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-convert=\"\" class=\"svelte-mnv790\"> </button></div></details>"), Bo = /* @__PURE__ */ q("<p class=\"pc-error svelte-mnv790\"> </p>"), Vo = /* @__PURE__ */ q("<p class=\"pc-error svelte-mnv790\" role=\"alert\"> </p>"), Ho = /* @__PURE__ */ q("<p class=\"pc-note svelte-mnv790\" role=\"status\">Preparing change…</p>"), Uo = /* @__PURE__ */ q("<p class=\"pc-note svelte-mnv790\"> </p> <label class=\"svelte-mnv790\">Portal<select aria-label=\"Selected portal\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select portal…</option><!></select></label> <!> <details open=\"\" class=\"svelte-mnv790\"><summary class=\"svelte-mnv790\">Source</summary> <label class=\"svelte-mnv790\">Output<select aria-label=\"Portal source\" class=\"svelte-mnv790\"><option class=\"svelte-mnv790\">Select output…</option><!></select></label> <label class=\"svelte-mnv790\">New portal name<input aria-label=\"New portal name\" class=\"svelte-mnv790\"/></label> <div class=\"pc-actions svelte-mnv790\"><button type=\"button\" data-portal-create=\"\" class=\"svelte-mnv790\">Create portal</button> <button type=\"button\" data-portal-retarget=\"\" class=\"svelte-mnv790\">Retarget</button> <!></div></details> <!> <!> <!> <!> <!>", 1), Wo = /* @__PURE__ */ q("<p class=\"pc-note svelte-mnv790\">Open a graph to manage its portals.</p>"), Go = /* @__PURE__ */ q("<section class=\"pc-manager svelte-mnv790\" aria-label=\"Manage portals\"><header class=\"svelte-mnv790\"><h2 class=\"svelte-mnv790\">Manage portals</h2><!></header> <!></section>");
function Ko(e, t) {
	Ve(t, !0);
	let n = Ci(t, "actions", 19, () => ({})), r = /* @__PURE__ */ I(""), i = /* @__PURE__ */ I(""), a = /* @__PURE__ */ I(""), o = /* @__PURE__ */ I(""), s = /* @__PURE__ */ I(""), c = /* @__PURE__ */ I(!1), l = /* @__PURE__ */ I(""), u = /* @__PURE__ */ I(""), d = "", f = 0, p = !0, m = (e) => JSON.stringify(e.kind === "graph" ? [
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
	]), h = /* @__PURE__ */ P(() => t.view?.publishers.find((e) => e.id === t.view.selectedPortalId)), g = /* @__PURE__ */ P(() => !!t.view && !!W(h) && t.view.capabilities.rename && (t.view.renameMode === "presentation" ? t.view.canPresent : t.view.scope.kind === "graph" && !t.view.readOnly) && !!n().rename), _ = /* @__PURE__ */ P(() => t.view?.sources.find((e) => e.key === W(a) && e.direction === "output")), v = /* @__PURE__ */ P(() => t.view?.receivers.find((e) => e.key === W(o) && e.direction === "input" && e.kind === W(h)?.kind)), y = /* @__PURE__ */ P(() => !!W(h) && !!W(v) && (!W(v).occupied || W(c)) && C("connect") && !!n().connect), b = /* @__PURE__ */ P(() => !!W(h) && C("remove") && !!n().deletePublisher && (!t.view?.consumers.length || W(s) === "restore" || W(s) === "disconnect"));
	yn(() => {
		let e = t.view ? JSON.stringify([
			t.view.managerKey,
			t.view.revision,
			m(t.view.scope),
			t.view.selectedPortalId,
			t.view.renameMode
		]) : "";
		d !== e && (d = e, L(r, W(h)?.label ?? "", !0), L(i, ""), L(a, t.view?.sources.find((e) => e.nodeId === W(h)?.source.nodeId && e.portId === W(h)?.source.portId)?.key ?? "", !0), L(o, ""), L(s, ""), L(c, !1), L(l, ""), L(u, ""), f++);
	}), Ti(() => {
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
		L(l, ""), L(u, ""), f++;
	}
	async function T(e, n, r) {
		if (!t.view || !n || W(u)) return;
		let i = x(t.view), a = ++f, o = t.view.selectedPortalId;
		L(u, e, !0), L(l, "");
		try {
			let e = await r(i);
			p && a === f && t.view?.managerKey === i.managerKey && t.view.revision === i.revision && m(t.view.scope) === m(i.scope) && t.view.selectedPortalId === o && (L(u, ""), L(l, e.ok ? "" : e.error.code + ": " + e.error.message, !0));
		} catch (e) {
			p && a === f && t.view?.managerKey === i.managerKey && t.view.revision === i.revision && m(t.view.scope) === m(i.scope) && t.view.selectedPortalId === o && (L(u, ""), L(l, e instanceof Error ? e.message : "The portal change could not be accepted.", !0));
		}
	}
	var E = Go(), D = R(E), O = B(R(D)), k = (e) => {
		var t = Oo();
		K("click", t, () => n().close?.()), J(e, t);
	};
	X(O, (e) => {
		n().close && e(k);
	}), N(D);
	var A = B(D, 2), ee = (e) => {
		var d = Uo(), f = z(d), p = R(f);
		N(f);
		var m = B(f, 2), E = B(R(m)), D = R(E);
		D.value = D.__value = "", Z(B(D), 17, () => t.view.publishers, (e) => e.id, (e, t) => {
			var n = ko(), r = R(n);
			N(n);
			var i = {};
			V(() => {
				Y(r, `${W(t).label ?? ""} · ${W(t).kind ?? ""}`), i !== (i = W(t).id) && (n.value = (n.__value = W(t).id) ?? "");
			}), J(e, n);
		}), N(E);
		var O;
		oi(E), N(m);
		var k = B(m, 2), A = (e) => {
			var i = Ao(), a = z(i), o = B(R(a));
			pi(o), N(a);
			var s = B(a, 2), c = R(s);
			N(s);
			var l = B(s, 2), d = R(l);
			N(l), V(() => {
				mi(o, W(r)), o.disabled = !W(g), Y(c, `${t.view.renameMode === "presentation" ? "Local workspace label · not exported" : "Authored portal label"} · ${W(h).kind ?? ""}`), d.disabled = !W(g) || !!W(u);
			}), K("input", o, (e) => {
				L(r, e.currentTarget.value, !0), w();
			}), K("click", d, () => {
				let e = W(h)?.id, i = t.view?.renameMode, a = W(r);
				e && i && n().rename && T("rename", W(g), (t) => n().rename(t, e, a, i));
			}), J(e, i);
		}, ee = (e) => {
			J(e, jo());
		};
		X(k, (e) => {
			W(h) ? e(A) : e(ee, -1);
		});
		var te = B(k, 2), ne = B(R(te), 2), re = B(R(ne)), ie = R(re);
		ie.value = ie.__value = "", Z(B(ie), 17, () => t.view.sources, (e) => e.key, (e, t) => {
			var n = ko(), r = R(n);
			N(n);
			var i = {};
			V(() => {
				Y(r, `${W(t).label ?? ""} · ${W(t).kind ?? ""}`), i !== (i = W(t).key) && (n.value = (n.__value = W(t).key) ?? "");
			}), J(e, n);
		}), N(re);
		var ae;
		oi(re), N(ne);
		var oe = B(ne, 2), se = B(R(oe));
		pi(se), N(oe);
		var ce = B(oe, 2), le = R(ce), ue = B(le, 2), de = B(ue, 2), fe = (e) => {
			var r = Mo();
			K("click", r, () => {
				t.view && W(h) && n().jumpSource?.(x(t.view), S(W(h).source));
			}), J(e, r);
		};
		X(de, (e) => {
			W(h) && n().jumpSource && e(fe);
		}), N(ce), N(te);
		var pe = B(te, 2), me = (e) => {
			var r = Ro(), i = B(R(r), 2), a = B(R(i)), l = R(a);
			l.value = l.__value = "", Z(B(l), 17, () => t.view.receivers, (e) => e.key, (e, t) => {
				var n = ko(), r = R(n);
				N(n);
				var i = {};
				V(() => {
					Y(r, `${W(t).label ?? ""}${W(t).occupied ? " · Connected" : ""}`), i !== (i = W(t).key) && (n.value = (n.__value = W(t).key) ?? "");
				}), J(e, n);
			}), N(a);
			var d;
			oi(a), N(i);
			var f = B(i, 2), p = (e) => {
				var t = No(), n = R(t);
				pi(n), Ae(), N(t), V((e) => {
					hi(n, W(c)), n.disabled = e;
				}, [() => !C("connect")]), K("change", n, (e) => {
					L(c, e.currentTarget.checked, !0), w();
				}), J(e, t);
			};
			X(f, (e) => {
				W(v)?.occupied && e(p);
			});
			var m = B(f, 2), g = R(m);
			N(m);
			var _ = B(m, 2);
			Z(_, 17, () => t.view.consumers, (e) => e.edgeId, (e, r) => {
				var i = Fo(), a = R(i), o = R(a, !0);
				N(a);
				var s = B(a), c = R(s), l = B(c, 2), d = (e) => {
					var i = Po();
					K("click", i, () => {
						let e = t.view?.consumers.find((e) => e.edgeId === W(r).edgeId);
						t.view && e && n().jumpConsumer?.(x(t.view), e.edgeId, S(e.to));
					}), J(e, i);
				};
				X(l, (e) => {
					n().jumpConsumer && e(d);
				}), N(s), N(i), V((e) => {
					Y(o, W(r).label), c.disabled = e;
				}, [() => !C("restore") || !n().restoreWire || !!W(u)]), K("click", c, () => {
					let e = t.view?.consumers.find((e) => e.edgeId === W(r).edgeId);
					e && n().restoreWire && T("restore", C("restore"), (t) => n().restoreWire(t, e.edgeId));
				}), J(e, i);
			});
			var E = B(_, 2), D = (e) => {
				J(e, Io());
			};
			X(E, (e) => {
				t.view.consumers.length || e(D);
			});
			var O = B(E, 2), k = (e) => {
				var t = Lo(), n = B(R(t)), r = R(n);
				r.value = r.__value = "";
				var i = B(r);
				i.value = i.__value = "restore";
				var a = B(i);
				a.value = a.__value = "disconnect", N(n);
				var o;
				oi(n), N(t), V((e) => {
					n.disabled = e, o !== (o = W(s)) && (n.value = (n.__value = W(s)) ?? "", ai(n, W(s)));
				}, [() => !C("remove")]), K("change", n, (e) => {
					L(s, e.currentTarget.value, !0), w();
				}), J(e, t);
			};
			X(O, (e) => {
				t.view.consumers.length && e(k);
			});
			var A = B(O, 2), ee = R(A);
			N(A), N(r), V((e) => {
				a.disabled = e, d !== (d = W(o)) && (a.value = (a.__value = W(o)) ?? "", ai(a, W(o))), g.disabled = !W(y) || !!W(u), ee.disabled = !W(b) || !!W(u);
			}, [() => !C("connect") || !n().connect]), K("change", a, (e) => {
				L(o, e.currentTarget.value, !0), L(c, !1), w();
			}), K("click", g, () => {
				let e = W(v), t = W(h)?.id, r = W(c);
				e && t && n().connect && T("connect", W(y), (i) => n().connect(i, t, S(e), r));
			}), K("click", ee, () => {
				let e = W(h)?.id, r = t.view?.consumers.length ? W(s) : "restore";
				e && (r === "restore" || r === "disconnect") && n().deletePublisher && T("remove", W(b), (t) => n().deletePublisher(t, e, r));
			}), J(e, r);
		};
		X(pe, (e) => {
			W(h) && e(me);
		});
		var he = B(pe, 2), ge = (e) => {
			var r = zo(), i = B(R(r)), a = R(i, !0);
			N(i);
			var o = B(i), s = R(o), c = R(s);
			N(s), N(o), N(r), V((e) => {
				Y(a, t.view.conversion.label), s.disabled = e, Y(c, `Convert ${t.view.conversion.kind === "wire" ? "wire" : "output"}`);
			}, [() => !C("convert") || !!W(u) || (t.view.conversion.kind === "wire" ? !n().convertWire : !n().convertOutput)]), K("click", s, () => {
				let e = t.view?.conversion;
				e?.kind === "wire" && n().convertWire ? T("convert", C("convert"), (t) => n().convertWire(t, e.edgeId)) : e?.kind === "output" && n().convertOutput && T("convert", C("convert"), (t) => n().convertOutput(t, S(e.endpoint)));
			}), J(e, r);
		};
		X(he, (e) => {
			t.view.conversion && e(ge);
		});
		var _e = B(he, 2), ve = (e) => {
			var n = Bo(), r = R(n, !0);
			N(n), V(() => Y(r, t.view.issue)), J(e, n);
		};
		X(_e, (e) => {
			t.view.issue && e(ve);
		});
		var ye = B(_e, 2), be = (e) => {
			var t = Vo(), n = R(t, !0);
			N(t), V(() => Y(n, W(l))), J(e, t);
		};
		X(ye, (e) => {
			W(l) && e(be);
		});
		var xe = B(ye, 2), Se = (e) => {
			J(e, Ho());
		};
		X(xe, (e) => {
			W(u) && e(Se);
		}), V((e, r, o, s) => {
			Y(p, `${t.view.scopeLabel ?? ""}${t.view.readOnly ? " · Read-only graph" : ""}`), E.disabled = !n().selectPortal, O !== (O = t.view.selectedPortalId ?? "") && (E.value = (E.__value = t.view.selectedPortalId ?? "") ?? "", ai(E, t.view.selectedPortalId ?? "")), re.disabled = e, ae !== (ae = W(a)) && (re.value = (re.__value = W(a)) ?? "", ai(re, W(a))), mi(se, W(i)), se.disabled = r, le.disabled = o, ue.disabled = s;
		}, [
			() => !C("create") && !C("retarget"),
			() => !C("create") || !n().create,
			() => !C("create") || !n().create || !W(_) || !W(i).trim() || !!W(u),
			() => !C("retarget") || !n().retarget || !W(_) || !W(h) || !!W(u)
		]), K("change", E, (e) => {
			let r = e.currentTarget.value;
			e.currentTarget.selectedIndex >= 0 && t.view && n().selectPortal && (!r || t.view.publishers.some((e) => e.id === r)) && n().selectPortal(x(t.view), r || null);
		}), K("change", re, (e) => {
			L(a, e.currentTarget.value, !0), w();
		}), K("input", se, (e) => {
			L(i, e.currentTarget.value, !0), w();
		}), K("click", le, () => {
			let e = W(_), t = W(i);
			e && t.trim() && n().create && T("create", C("create"), (r) => n().create(r, t, S(e)));
		}), K("click", ue, () => {
			let e = W(_), t = W(h)?.id;
			e && t && n().retarget && T("retarget", C("retarget"), (r) => n().retarget(r, t, S(e)));
		}), J(e, d);
	}, te = (e) => {
		J(e, Wo());
	};
	X(A, (e) => {
		t.view ? e(ee) : e(te, -1);
	}), N(E), J(e, E), He();
}
vr([
	"click",
	"change",
	"input"
]);
//#endregion
//#region ui/SubgraphSave.svelte
var qo = /* @__PURE__ */ q("<option class=\"svelte-1n658sg\"> </option>"), Jo = /* @__PURE__ */ q("<p class=\"pc-save-error svelte-1n658sg\" role=\"alert\"> </p>"), Yo = /* @__PURE__ */ q("<div class=\"pc-workspace-overlay svelte-1n658sg\"><div class=\"pc-workspace-dialog pc-subgraph-save svelte-1n658sg\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Save subgraph\" tabindex=\"-1\"><header class=\"svelte-1n658sg\"><h2 class=\"svelte-1n658sg\">Save subgraph</h2><button type=\"button\" aria-label=\"Close save subgraph\" class=\"svelte-1n658sg\">×</button></header> <form class=\"svelte-1n658sg\"><label class=\"svelte-1n658sg\">Name<input aria-label=\"Subgraph name\" maxlength=\"80\" class=\"svelte-1n658sg\"/></label> <label class=\"svelte-1n658sg\">Save as<select aria-label=\"Save as\" class=\"svelte-1n658sg\"><option class=\"svelte-1n658sg\">Save new subgraph</option><!></select></label> <p class=\"svelte-1n658sg\">Edits stay local until you save. Existing placed copies stay unchanged.</p> <!> <footer class=\"svelte-1n658sg\"><button type=\"button\" class=\"svelte-1n658sg\">Cancel</button><button type=\"submit\" data-save-subgraph=\"\" class=\"svelte-1n658sg\"> </button></footer></form></div></div>");
function Xo(e, t) {
	Ve(t, !0);
	let n, r = /* @__PURE__ */ I(""), i = /* @__PURE__ */ I(""), a = /* @__PURE__ */ I(!1), o = /* @__PURE__ */ I(""), s = "", c = 0;
	yn(() => {
		if (t.view.key === s) return;
		s = t.view.key, c++, L(r, t.view.name, !0), L(i, t.view.targetId ?? "", !0), L(a, !1), L(o, "");
		let e = s;
		cr().then(() => {
			if (t.view.key === e) {
				let e = n?.querySelector("input");
				e?.focus({ preventScroll: !0 }), e?.select();
			}
		});
	}), wi(() => {
		let e = document.activeElement;
		return () => e?.focus({ preventScroll: !0 });
	});
	async function l(e) {
		if (e.preventDefault(), !t.actions || !W(r).trim() || W(a) || W(i) && !t.view.entries.some((e) => e.id === W(i))) return;
		let n = t.view.key, s = ++c;
		L(a, !0), L(o, "");
		try {
			await t.actions.save(n, W(r), W(i) || null);
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
	var d = Yo(), f = R(d), p = R(f), m = B(R(p));
	N(p);
	var h = B(p, 2), g = R(h), _ = B(R(g));
	pi(_), N(g);
	var v = B(g, 2), y = B(R(v)), b = R(y);
	b.value = b.__value = "", Z(B(b), 17, () => t.view.entries, (e) => e.id, (e, t) => {
		var n = qo(), r = R(n);
		N(n);
		var i = {};
		V(() => {
			Y(r, `Update ${W(t).name ?? ""}`), i !== (i = W(t).id) && (n.value = (n.__value = W(t).id) ?? "");
		}), J(e, n);
	}), N(y), N(v);
	var x = B(v, 4), S = (e) => {
		var n = Jo(), r = R(n, !0);
		N(n), V(() => Y(r, t.view.error || W(o))), J(e, n);
	};
	X(x, (e) => {
		(t.view.error || W(o)) && e(S);
	});
	var C = B(x, 2), w = R(C), T = B(w), E = R(T, !0);
	N(T), N(C), N(h), N(f), $(f, (e) => n = e, () => n), N(d), V((e) => {
		T.disabled = e, Y(E, W(a) ? "Saving…" : "Save");
	}, [() => !t.actions || !W(r).trim() || W(a)]), G("keydown", f, u, !0), G("paste", f, (e) => e.stopPropagation()), K("click", m, () => t.actions?.close()), G("submit", h, l), yi(_, () => W(r), (e) => L(r, e)), si(y, () => W(i), (e) => L(i, e)), K("click", w, () => t.actions?.close()), J(e, d), He();
}
vr(["click"]);
//#endregion
//#region ui/NodeSearch.svelte
var Zo = /* @__PURE__ */ q("<label class=\"pc-context-check svelte-golf61\"><input type=\"checkbox\" class=\"svelte-golf61\"/>Context sensitive</label>"), Qo = /* @__PURE__ */ q("<span class=\"pc-search-context svelte-golf61\"> </span>"), $o = /* @__PURE__ */ q("<label class=\"pc-search-field svelte-golf61\"><input type=\"search\" aria-label=\"Search nodes and subgraphs\" placeholder=\"Search…\" autocomplete=\"off\" role=\"combobox\" aria-expanded=\"true\" class=\"svelte-golf61\"/></label> <!> <!>", 1), es = /* @__PURE__ */ q("<p class=\"pc-search-context svelte-golf61\">Choose the named port to connect.</p>"), ts = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-search-result svelte-golf61\" role=\"option\"><span class=\"svelte-golf61\"> </span> <span class=\"pc-family svelte-golf61\"> </span></button>"), ns = /* @__PURE__ */ q("<p class=\"pc-empty svelte-golf61\">No nodes match.</p>"), rs = /* @__PURE__ */ q("<p class=\"pc-feedback svelte-golf61\" role=\"status\"> </p>"), is = /* @__PURE__ */ q("<div class=\"pc-node-search svelte-golf61\" role=\"dialog\" aria-modal=\"false\" tabindex=\"-1\"><!> <div class=\"pc-search-results svelte-golf61\" role=\"listbox\"></div> <!></div>");
function as(e, t) {
	let n = Ar();
	Ve(t, !0);
	let r = Ci(t, "view", 3, null), i = Ci(t, "actions", 19, () => ({})), a = /* @__PURE__ */ I(void 0), o = /* @__PURE__ */ I(void 0), s = /* @__PURE__ */ I(""), c = /* @__PURE__ */ I(0), l = /* @__PURE__ */ I(8), u = /* @__PURE__ */ I(8), d, f, p = (e) => [
		e.label,
		e.family,
		e.purpose ?? "",
		e.shortcode ?? "",
		...e.searchAliases ?? []
	].join(" ").toLocaleLowerCase(), m = /* @__PURE__ */ P(() => (r()?.choices ?? []).filter((e) => p(e).includes(W(s).toLocaleLowerCase().trim()))), h = /* @__PURE__ */ P(() => r()?.mode === "ports" ? r().ports : W(m)), g = (e) => "id" in e ? e.id : e.portId, _ = (e) => !!r()?.readOnly || "disabledReason" in e && !!e.disabledReason, v = /* @__PURE__ */ P(() => W(h).filter((e) => !_(e))), y = /* @__PURE__ */ P(() => W(v)[Math.min(W(c), Math.max(0, W(v).length - 1))]), b = (e) => ({
		Input: "#96ad52",
		Shaping: "#589aab",
		Surface: "#92c9ad",
		Transpose: "#9080b6",
		Derive: "#b65b9e",
		Output: "#c96d82",
		Subgraphs: "#a3aa99"
	})[e] ?? "#a1a59b";
	function x() {
		if (!r() || !W(a)) return;
		let e = W(a).getBoundingClientRect(), t = document.documentElement.clientWidth || window.innerWidth, n = document.documentElement.clientHeight || window.innerHeight;
		L(l, Math.max(8, Math.min(r().screenAnchor.x, t - e.width - 8)), !0), L(u, Math.max(8, Math.min(r().screenAnchor.y, n - e.height - 8)), !0);
	}
	yn(() => {
		let e = r()?.key, t = r()?.mode, n = r()?.screenAnchor;
		if (e === void 0 || !n) return;
		let i = d !== e || f !== t;
		d !== e && L(s, ""), i && L(c, 0), d = e, f = t, cr().then(() => {
			r()?.key === e && r().mode === t && (x(), i && (t === "nodes" ? W(o)?.focus() : (W(a)?.querySelector("[data-port]:not(:disabled)") ?? W(a))?.focus()));
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
		].includes(e.key) ? (e.preventDefault(), L(c, e.key === "Home" ? 0 : e.key === "End" ? Math.max(0, W(v).length - 1) : W(v).length ? (W(c) + (e.key === "ArrowDown" ? 1 : -1) + W(v).length) % W(v).length : 0, !0)) : e.key === "Enter" && (e.preventDefault(), S(W(y)));
	}
	yn(() => {
		if (!r()) return;
		let e = (e) => {
			W(a) && !W(a).contains(e.target) && i().dismiss?.();
		};
		return window.addEventListener("pointerdown", e, !0), () => window.removeEventListener("pointerdown", e, !0);
	});
	var T = kr();
	G("resize", tn, x);
	var E = z(T), D = (e) => {
		var t = is();
		let i;
		var d = R(t), f = (e) => {
			var t = $o(), i = z(t), a = R(i);
			pi(a), $(a, (e) => L(o, e), () => W(o)), N(i);
			var l = B(i, 2), u = (e) => {
				var t = Zo(), n = R(t);
				pi(n), Ae(), N(t), V(() => {
					hi(n, r().contextSensitive), n.disabled = r().readOnly;
				}), K("change", n, C), J(e, t);
			};
			X(l, (e) => {
				r().origin && e(u);
			});
			var d = B(l, 2), f = (e) => {
				var t = Qo(), n = R(t, !0);
				N(t), V(() => Y(n, (r().origin.dir === "out" ? "Accepts " : "Produces ") + r().origin.kind)), J(e, t);
			};
			X(d, (e) => {
				r().origin && e(f);
			}), V((e) => {
				Q(a, "aria-controls", n + "-results"), Q(a, "aria-activedescendant", e);
			}, [() => W(y) ? n + "-item-" + W(h).indexOf(W(y)) : void 0]), K("input", a, () => L(c, 0)), yi(a, () => W(s), (e) => L(s, e)), J(e, t);
		}, p = (e) => {
			J(e, es());
		};
		X(d, (e) => {
			r().mode === "nodes" ? e(f) : e(p, -1);
		});
		var m = B(d, 2);
		Z(m, 21, () => W(h), (e) => g(e), (e, t) => {
			var r = ts(), i = R(r), a = R(i, !0);
			N(i);
			var o = B(i, 1, !0);
			o.nodeValue = " ";
			var s = B(o);
			let l;
			var u = R(s, !0);
			N(s), N(r), V((e, n, i, o) => {
				Q(r, "aria-selected", W(y) === W(t)), Q(r, "id", e), Q(r, "data-choice", "id" in W(t) ? W(t).id : void 0), Q(r, "data-port", "portId" in W(t) ? W(t).portId : void 0), r.disabled = n, Q(r, "title", "disabledReason" in W(t) ? W(t).disabledReason : void 0), Y(a, i), l = ii(s, "", l, o), Y(u, "family" in W(t) ? W(t).family : W(t).kind);
			}, [
				() => n + "-item-" + W(h).indexOf(W(t)),
				() => _(W(t)),
				() => W(t).label || g(W(t)),
				() => ({ color: "family" in W(t) ? b(W(t).family) : void 0 })
			]), K("click", r, () => S(W(t))), G("focus", r, () => {
				let e = W(v).indexOf(W(t));
				e >= 0 && L(c, e, !0);
			}), J(e, r);
		}, (e) => {
			J(e, ns());
		}), N(m);
		var x = B(m, 2), T = (e) => {
			var t = rs(), n = R(t, !0);
			N(t), V(() => Y(n, r().feedback)), J(e, t);
		};
		X(x, (e) => {
			r().feedback && e(T);
		}), N(t), $(t, (e) => L(a, e), () => W(a)), V(() => {
			Q(t, "aria-label", r().mode === "ports" ? "Choose connection port" : "Add node"), i = ii(t, "", i, {
				left: `${W(l) ?? ""}px`,
				top: `${W(u) ?? ""}px`
			}), Q(m, "id", n + "-results"), Q(m, "aria-label", r().mode === "ports" ? "Compatible ports" : "Nodes and subgraphs");
		}), K("keydown", t, w), J(e, t);
	};
	X(E, (e) => {
		r() && e(D);
	}), J(e, T), He();
}
vr([
	"keydown",
	"input",
	"change",
	"click"
]);
//#endregion
//#region ui/PinMenu.svelte
var os = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-pin-action svelte-i73q0t\"> </button>"), ss = /* @__PURE__ */ q("<p class=\"pc-empty svelte-i73q0t\">No attached links.</p>"), cs = /* @__PURE__ */ q("<div class=\"pc-pin-menu svelte-i73q0t\" role=\"dialog\" aria-label=\"Pin actions\" aria-modal=\"false\" tabindex=\"-1\"><div class=\"pc-menu-head svelte-i73q0t\"><h2 class=\"svelte-i73q0t\"> </h2><button type=\"button\" aria-label=\"Close pin actions\" class=\"svelte-i73q0t\">Close</button></div> <p class=\"pc-kind svelte-i73q0t\"> </p> <!></div>");
function ls(e, t) {
	Ve(t, !0);
	let n = Ci(t, "view", 3, null), r = Ci(t, "actions", 19, () => ({})), i = /* @__PURE__ */ I(void 0), a = /* @__PURE__ */ I(8), o = /* @__PURE__ */ I(8), s, c = (e) => !!e.disabled || !!n()?.readOnly && e.capability !== "navigation";
	function l() {
		if (!n() || !W(i)) return;
		let e = W(i).getBoundingClientRect(), t = document.documentElement.clientWidth || window.innerWidth, r = document.documentElement.clientHeight || window.innerHeight;
		L(a, Math.max(8, Math.min(n().screenAnchor.x, t - e.width - 8)), !0), L(o, Math.max(8, Math.min(n().screenAnchor.y, r - e.height - 8)), !0);
	}
	yn(() => {
		let e = n()?.key, t = n()?.screenAnchor;
		if (e === void 0 || !t) return;
		let r = s !== e;
		s = e, cr().then(() => {
			n()?.key === e && (l(), r && (W(i)?.querySelector("[data-entry]:not(:disabled)") ?? W(i))?.focus());
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
		let t = [...W(i)?.querySelectorAll("[data-entry]:not(:disabled)") ?? []], a = t.indexOf(document.activeElement);
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
	G("resize", tn, l);
	var p = z(f), m = (e) => {
		var t = cs();
		let s;
		var l = R(t), f = R(l), p = R(f, !0);
		N(f);
		var m = B(f);
		N(l);
		var h = B(l, 2), g = R(h);
		N(h), Z(B(h, 2), 17, () => n().entries, (e) => e.id, (e, t) => {
			var n = os(), r = R(n, !0);
			N(n), V((e) => {
				Q(n, "data-entry", W(t).id), n.disabled = e, Q(n, "title", W(t).reason), Y(r, W(t).label);
			}, [() => c(W(t))]), K("click", n, () => u(W(t))), J(e, n);
		}, (e) => {
			J(e, ss());
		}), N(t), $(t, (e) => L(i, e), () => W(i)), V(() => {
			s = ii(t, "", s, {
				left: `${W(a) ?? ""}px`,
				top: `${W(o) ?? ""}px`
			}), Y(p, n().title), Y(g, `${n().kind ?? ""}${n().readOnly ? " · Read only" : ""}`);
		}), K("keydown", t, d), K("click", m, () => r().dismiss?.()), J(e, t);
	};
	X(p, (e) => {
		n() && e(m);
	}), J(e, f), He();
}
vr(["keydown", "click"]);
//#endregion
//#region src/ui/node-palette.js
var us = "M3 7 12 2l9 5v10l-9 5-9-5ZM3 7l9 5 9-5M12 12v10", ds = "M3 6l4-2 4 2v5l-4 2-4-2ZM3 6l4 2 4-2M7 8v5M13 6l4-2 4 2v5l-4 2-4-2ZM13 6l4 2 4-2M17 8v5M8 15l4-2 4 2v5l-4 2-4-2ZM8 15l4 2 4-2M12 17v5", fs = Object.freeze([
	{
		name: "Input",
		color: "#96ad52",
		icon: us
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
		icon: us
	},
	{
		name: "Subgraphs",
		color: "#a3aa99",
		icon: ds
	}
].map((e) => Object.freeze(e))), ps = {
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
	Library: ds,
	Routing: "M3 12h18m-7-7 7 7-7 7",
	Blocks: us,
	Reflect: "M21 12s-4-7-9-7-9 7-9 7 4 7 9 7 9-7 9-7ZM15 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0",
	Internalize: "M4 4h16v16H4M8 8l4 4 4-4M12 12v5",
	Express: "M4 4h16v12H9l-5 4ZM8 8h8M8 12h5",
	Memory: "M5 3h14v18H5ZM8 7h8M8 11h8M8 15h5",
	State: "M3 12h4l3-7 4 14 3-7h4"
}, ms = Object.freeze(Object.fromEntries(Object.entries(ps).map(([e, t]) => [e, Object.freeze({
	name: e,
	icon: t
})]))), hs = {
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
		ps.Planning
	],
	compose: [
		"Assembly",
		"co",
		ps.Assembly
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
		ps.Validation
	],
	"json-decode": [
		"Parsing",
		"jd",
		ps.Parsing
	],
	"select-fields": [
		"Extraction",
		"sf",
		ps.Extraction
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
		ps.Delivery
	],
	reroute: [
		"Routing",
		"rt",
		ps.Routing
	],
	reflect: [
		"Reflect",
		"rf",
		ps.Reflect
	],
	internalize: [
		"Internalize",
		"in",
		ps.Internalize
	],
	express: [
		"Express",
		"ex",
		ps.Express
	],
	context: [
		"Context",
		"cx",
		ps.Context
	],
	memory: [
		"Memory",
		"mm",
		ps.Memory
	],
	state: [
		"State",
		"sv",
		ps.State
	]
}, gs = Object.freeze(Object.fromEntries(Object.entries(hs).map(([e, [t, n, r]]) => [e, Object.freeze({
	group: t,
	shortcode: n,
	icon: r
})]))), _s = Object.freeze({
	group: "Blocks",
	shortcode: "",
	icon: us
}), vs = (e) => Object.hasOwn(gs, e) ? gs[e] : _s, ys = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-family-row\" aria-haspopup=\"menu\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path></path></svg><span> </span></button>"), bs = /* @__PURE__ */ q("<button type=\"button\" role=\"menuitem\">‹ Families</button>"), xs = /* @__PURE__ */ q("<input class=\"text_pole\" aria-label=\"Search nodes\" placeholder=\"Search nodes…\"/>"), Ss = /* @__PURE__ */ q("<div class=\"pc-shelf-group svelte-hk6fzp\" role=\"presentation\"> </div>"), Cs = /* @__PURE__ */ q("<!> <button type=\"button\" role=\"menuitem\" class=\"svelte-hk6fzp\"><svg class=\"pc-leaf-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path></path></svg><span class=\"pc-catalog-name\"> </span><small> </small></button>", 1), ws = /* @__PURE__ */ q("<div role=\"menu\" tabindex=\"-1\"><!> <!> <!></div>"), Ts = /* @__PURE__ */ q("<div class=\"pc-shelf-menu pc-shelf-subgraph-menu svelte-hk6fzp\" role=\"menu\" tabindex=\"-1\"><button type=\"button\" role=\"menuitem\" data-shelf-subgraph-action=\"open\">Open saved definition</button> <button type=\"button\" role=\"menuitem\" data-shelf-subgraph-action=\"delete\">Delete</button></div>"), Es = /* @__PURE__ */ q("<div class=\"pc-shelf-drag-preview svelte-hk6fzp\" aria-hidden=\"true\"> </div>"), Ds = /* @__PURE__ */ q("<nav aria-label=\"Node families\"></nav> <!> <!> <!>", 1);
function Os(e, t) {
	Ve(t, !0);
	let n = Ci(t, "readOnly", 3, !1), r, i = /* @__PURE__ */ I(null), a = /* @__PURE__ */ I(""), o = /* @__PURE__ */ I(!1), s = /* @__PURE__ */ I(""), c = /* @__PURE__ */ I(!1), l = /* @__PURE__ */ I(0), u = /* @__PURE__ */ I(0), d = null, f = 0, p = /* @__PURE__ */ I(null), m = /* @__PURE__ */ I(null), h = null, g = fs.map((e) => e.name), _ = (e) => fs.find((t) => t.name === e)?.color, v = null, y = null, b = null, x = /* @__PURE__ */ I(null);
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
		}, !W(x) && Math.hypot(e.clientX - v.start.x, e.clientY - v.start.y) >= 5 && C(), W(x) && (e.preventDefault(), L(x, {
			...W(x),
			...v.point
		}, !0)));
	}
	function E(e) {
		if (!v || e.pointerId !== v.pointerId) return;
		let t = v.entry, n = !!W(x), i = n ? document.elementFromPoint(e.clientX, e.clientY) : null, a = r.closest(".pc-canvas-area")?.querySelector(".pc-canvas-host");
		S(), n && (e.preventDefault(), e.stopPropagation(), i && a?.contains(i) && ae(t, {
			x: e.clientX,
			y: e.clientY
		}));
	}
	function D(e, t) {
		e.currentTarget === b && e.detail !== 0 ? b = null : ae(t);
	}
	function O(e = W(a)) {
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
				let i = n.id.startsWith("operation:") ? n.id.split(":")[1] : "", a = vs(i), o = i ? n.label.split(" · ")[0] : n.label, s = n.id.startsWith("boundary:");
				return {
					...n,
					title: o,
					compatible: !n.disabledReason && !!t.choose,
					catalog: !0,
					shortcode: i ? a.shortcode || n.shortcode || "" : n.shortcode ?? a.shortcode,
					group: e === "Subgraphs" ? s ? "Interface" : "Library" : void 0,
					icon: e === "Subgraphs" ? s ? ms.Routing.icon : ms.Library.icon : a.icon,
					searchAliases: r
				};
			});
		}
		let n = t.view?.families.find((t) => t.name === e);
		return n ? n.operations.filter((t) => e !== "Surface" || !["pattern-scan", "validate-patches"].includes(t.id)).map((t) => ({
			...t,
			...vs(t.id),
			family: e
		})) : [];
	}
	function k(e = !1) {
		L(p, null), e && h?.focus({ preventScroll: !0 });
	}
	function A(e = !1) {
		S(), f++, L(a, ""), L(o, !1), k(), e && d?.focus({ preventScroll: !0 });
	}
	yn(() => (t.view?.graphId, t.choices, n(), () => A()));
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
	async function re(e, t, n = !0) {
		if (v) return;
		if (k(), W(a) === e) {
			n && W(i)?.querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
			return;
		}
		let r = ++f;
		if (L(a, e, !0), L(o, !1), d = t, await cr(), r !== f || W(a) !== e || !W(i)?.isConnected) return;
		let s = t.getBoundingClientRect(), p = W(i).getBoundingClientRect(), m = te({
			top: ne(s, W(i), p),
			left: s.left,
			right: s.right
		}, p.width, p.height, 128);
		L(l, m.x, !0), L(u, m.y, !0), L(c, m.compact, !0), n && W(i).querySelector("button:not(:disabled)")?.focus({ preventScroll: !0 });
	}
	async function ie() {
		let e = ++f;
		if (L(a, ""), L(o, !0), L(s, ""), await cr(), e !== f || !W(o) || !W(i)?.isConnected) return;
		let t = ee();
		L(l, Math.min(136, Math.max(4, t.width - 254)), !0), L(u, 13), W(i).querySelector("input")?.focus();
	}
	function ae(e, r) {
		let i = O(e.family).find((t) => t.id === e.id);
		i?.compatible && !n() && (A(!0), r ? i.catalog ? t.choose?.(i.id, r) : t.add(i.id, r) : i.catalog ? t.choose?.(i.id) : t.add(i.id));
	}
	async function oe(e, n) {
		let r = O("Subgraphs").find((t) => t.id === e.dataset.shelfChoice);
		if (!r?.definitionRef || !t.shelfSubgraph) return;
		let i = ee(), a = e.getBoundingClientRect();
		if (h = e, L(p, {
			id: r.id,
			title: r.title,
			x: (n?.x ?? a.right) - i.left,
			y: (n?.y ?? a.top) - i.top
		}, !0), await cr(), !W(p) || W(p).id !== r.id || !W(m)?.isConnected) return;
		let o = W(m).getBoundingClientRect();
		L(p, {
			...W(p),
			x: Math.max(4, Math.min(W(p).x, i.width - o.width - 4)),
			y: Math.max(4, Math.min(W(p).y, i.height - o.height - 4))
		}, !0), W(m).querySelector("button")?.focus({ preventScroll: !0 });
	}
	function se(e) {
		let n = e.target.closest("[data-shelf-choice]");
		n && O("Subgraphs").some((e) => e.id === n.dataset.shelfChoice && e.definitionRef) && t.shelfSubgraph && (e.preventDefault(), e.stopPropagation(), oe(n, {
			x: e.clientX,
			y: e.clientY
		}));
	}
	function ce(e) {
		let n = O("Subgraphs").find((e) => e.id === W(p)?.id);
		A(!0), n?.definitionRef && t.shelfSubgraph?.(n.id, e);
	}
	function le(e) {
		if ((e.key === "ContextMenu" || e.key === "F10" && e.shiftKey) && e.target.dataset.shelfChoice) {
			e.preventDefault(), e.stopPropagation(), oe(e.target);
			return;
		}
		if (W(p) && e.key === "Escape") {
			e.preventDefault(), e.stopPropagation(), k(!0);
			return;
		}
		if (e.key === "Escape") {
			e.preventDefault(), e.stopPropagation(), A(!0);
			return;
		}
		let t = e.target;
		if (e.key === "ArrowRight" && t.dataset.family && !t.disabled) {
			e.preventDefault(), e.stopPropagation(), re(t.dataset.family, t);
			return;
		}
		if (e.key === "ArrowLeft" && W(a)) {
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
	var ue = { openSearch: ie }, de = Ds();
	G("pointerdown", tn, (e) => {
		e.target.closest(".pc-node-shelf, .pc-shelf-menu") || A();
	}), G("pointermove", tn, T), G("pointerup", tn, E), G("pointercancel", tn, () => S()), G("blur", tn, () => A()), G("resize", tn, () => A()), G("keydown", tn, (e) => {
		v && e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), A(!0));
	});
	var fe = z(de);
	Z(fe, 21, () => fs, zr, (e, t) => {
		var n = ys();
		let r;
		var i = R(n), o = R(i);
		N(i);
		var s = B(i), c = R(s, !0);
		N(s), N(n), V((e) => {
			Q(n, "data-family", W(t).name), n.disabled = e, Q(n, "title", "Browse " + W(t).name + " nodes"), Q(n, "aria-expanded", W(a) === W(t).name), r = ii(n, "", r, { "--pc-family": W(t).color }), Q(o, "d", W(t).icon), Y(c, W(t).name);
		}, [() => !O(W(t).name).length]), K("click", n, (e) => re(W(t).name, e.currentTarget)), G("pointerenter", n, (e) => {
			e.pointerType !== "touch" && !e.currentTarget.disabled && re(W(t).name, e.currentTarget, !1);
		}), K("keydown", n, le), J(e, n);
	}), N(fe), $(fe, (e) => r = e, () => r);
	var pe = B(fe, 2), me = (e) => {
		let r = /* @__PURE__ */ P(() => W(o) ? g.flatMap((e) => O(e)).filter((e) => [
			e.title,
			e.id,
			e.family,
			e.purpose,
			e.shortcode,
			...e.searchAliases ?? []
		].join(" ").toLowerCase().includes(W(s).toLowerCase())) : O());
		var d = ws();
		let f;
		var p = R(d), m = (e) => {
			var t = bs();
			K("click", t, () => A(!0)), J(e, t);
		};
		X(p, (e) => {
			W(c) && W(a) && e(m);
		});
		var h = B(p, 2), v = (e) => {
			var t = xs();
			pi(t), yi(t, () => W(s), (e) => L(s, e)), J(e, t);
		};
		X(h, (e) => {
			W(o) && e(v);
		}), Z(B(h, 2), 19, () => W(r), (e) => e.family + e.id, (e, i, a) => {
			let s = /* @__PURE__ */ P(() => !W(i).compatible || n()), c = /* @__PURE__ */ P(() => !!W(i).definitionRef && !!t.shelfSubgraph);
			var l = Cs(), u = z(l), d = (e) => {
				var t = Ss(), n = R(t, !0);
				N(t), V(() => {
					Q(t, "data-shelf-group", W(i).group), Y(n, W(i).group);
				}), J(e, t);
			};
			X(u, (e) => {
				!W(o) && W(i).group && W(r)[W(a) - 1]?.group !== W(i).group && e(d);
			});
			var f = B(u, 2);
			let p;
			var m = R(f), h = R(m);
			N(m);
			var g = B(m), v = R(g, !0);
			N(g);
			var y = B(g), b = R(y, !0);
			N(y), N(f), V((e) => {
				Q(f, "data-shelf-choice", W(i).id), Q(f, "data-insertion-disabled", W(s)), f.disabled = W(s) && !W(c), Q(f, "aria-disabled", W(s) && !W(c)), Q(f, "aria-haspopup", W(c) ? "menu" : void 0), Q(f, "title", n() ? W(c) ? "This graph is read-only. Right-click for subgraph actions." : "This graph is read-only." : W(i).disabledReason || (W(i).compatible ? W(i).purpose || "Add " + W(i).title : "Requires the " + W(i).phase + " phase")), p = ii(f, "", p, e), Q(h, "d", W(i).icon), Y(v, W(i).title), Y(b, W(i).shortcode);
			}, [() => ({ "--pc-family": _(W(i).family) })]), K("pointerdown", f, (e) => w(e, W(i))), G("lostpointercapture", f, () => S()), K("click", f, (e) => D(e, W(i))), J(e, l);
		}), N(d), $(d, (e) => L(i, e), () => W(i)), V((e) => {
			ni(d, 1, `pc-shelf-menu ${W(o) ? "pc-leaf-menu" : "pc-family-menu"}`, "svelte-hk6fzp"), Q(d, "aria-label", W(o) ? "Search nodes" : W(a) + " nodes"), f = ii(d, "", f, e);
		}, [() => ({
			left: `${W(l)}px`,
			top: `${W(u)}px`,
			"--pc-family": _(W(a))
		})]), K("keydown", d, le), K("contextmenu", d, se), J(e, d);
	};
	X(pe, (e) => {
		(W(a) || W(o)) && e(me);
	});
	var he = B(pe, 2), ge = (e) => {
		var t = Ts();
		let n;
		var r = R(t), i = B(r, 2);
		N(t), $(t, (e) => L(m, e), () => W(m)), V(() => {
			Q(t, "aria-label", W(p).title + " actions"), n = ii(t, "", n, {
				left: `${W(p).x}px`,
				top: `${W(p).y}px`
			});
		}), K("keydown", t, le), K("click", r, () => ce("open")), K("click", i, () => ce("delete")), J(e, t);
	};
	X(he, (e) => {
		W(p) && e(ge);
	});
	var _e = B(he, 2), ve = (e) => {
		var t = Es();
		let n;
		var r = R(t, !0);
		N(t), V((e) => {
			n = ii(t, "", n, e), Y(r, W(x).title);
		}, [() => ({
			"--pc-family": _(W(x).family),
			left: `${W(x).x + 12}px`,
			top: `${W(x).y + 12}px`
		})]), J(e, t);
	};
	return X(_e, (e) => {
		W(x) && e(ve);
	}), V(() => ni(fe, 1, `pc-node-shelf${W(c) && W(a) ? " pc-shelf-replaced" : ""}`, "svelte-hk6fzp")), J(e, de), He(ue);
}
vr([
	"click",
	"keydown",
	"contextmenu",
	"pointerdown"
]);
//#endregion
//#region ui/WorkflowSetup.svelte
var ks = /* @__PURE__ */ q("<option> </option>"), As = /* @__PURE__ */ q("<label> <select class=\"text_pole\"><option>Choose a connection</option><!></select></label> <label> <input class=\"text_pole\" placeholder=\"Use profile model\"/></label>", 1), js = /* @__PURE__ */ q("<p class=\"pc-error\"> </p>"), Ms = /* @__PURE__ */ q("<article class=\"pc-workflow-starter\"><strong> </strong><p> </p><small> </small><button type=\"button\" class=\"pc-btn menu_button\"> </button></article>"), Ns = /* @__PURE__ */ q("<h3> </h3> <p> </p> <p> </p> <!> <button type=\"button\" class=\"pc-btn menu_button\"> </button> <p> </p> <!> <h3>Workflow examples</h3> <!>", 1);
function Ps(e, t) {
	Ve(t, !0);
	var n = kr(), r = z(n), i = (e) => {
		var n = Ns(), r = z(n), i = R(r, !0);
		N(r);
		var a = B(r, 2), o = R(a, !0);
		N(a);
		var s = B(a, 2), c = R(s);
		N(s);
		var l = B(s, 2);
		Z(l, 17, () => t.view.roles, (e) => e.name, (e, n) => {
			var r = As(), i = z(r), a = R(i), o = B(a), s = R(o);
			s.value = s.__value = "", Z(B(s), 17, () => t.view.profiles, (e) => e.id, (e, t) => {
				var n = ks(), r = R(n, !0);
				N(n);
				var i = {};
				V(() => {
					Y(r, W(t).name), i !== (i = W(t).id) && (n.value = (n.__value = W(t).id) ?? "");
				}), J(e, n);
			}), N(o);
			var c;
			oi(o), N(i);
			var l = B(i, 2), u = R(l), d = B(u);
			pi(d), N(l), V(() => {
				Y(a, `${W(n).name ?? ""} connection`), Q(o, "aria-label", W(n).name + " connection"), c !== (c = W(n).profileId) && (o.value = (o.__value = W(n).profileId) ?? "", ai(o, W(n).profileId)), Y(u, `${W(n).name ?? ""} model override`), mi(d, W(n).model);
			}), K("change", o, (e) => t.actions.workflowSetup?.bindRole(W(n).name, e.currentTarget.value, W(n).model)), K("input", d, (e) => t.actions.workflowSetup?.bindRole(W(n).name, W(n).profileId, e.currentTarget.value)), J(e, r);
		});
		var u = B(l, 2), d = R(u);
		N(u);
		var f = B(u, 2), p = R(f);
		N(f);
		var m = B(f, 2);
		Z(m, 17, () => t.view.issues, zr, (e, t) => {
			var n = js(), r = R(n, !0);
			N(n), V(() => Y(r, W(t))), J(e, n);
		}), Z(B(m, 4), 17, () => t.view.starters, (e) => e.id, (e, n) => {
			var r = Ms(), i = R(r), a = R(i, !0);
			N(i);
			var o = B(i), s = R(o, !0);
			N(o);
			var c = B(o), l = R(c);
			N(c);
			var u = B(c), d = R(u);
			N(u), N(r), V(() => {
				Y(a, W(n).title), Y(s, W(n).purpose), Y(l, `${W(n).phase === "pre" ? "Before reply" : "After reply"} · Maximum ${W(n).callBound ?? ""} auxiliary requests`), Y(d, `Install ${W(n).title ?? ""}`);
			}), K("click", u, () => t.actions.workflowSetup?.install(W(n).id)), J(e, r);
		}), V(() => {
			Y(i, t.view.name), Y(o, t.view.phase === "pre" ? "Guidance helps SillyTavern plan its normal reply." : "Review a revision of the latest completed assistant reply."), Y(c, `Maximum auxiliary requests: ${t.view.callBound ?? ""}`), Y(d, `Assign ${t.view.phase ?? ""} phase`), Y(p, `${t.view.assigned ? "Assigned to this phase." : "Phase is not assigned."} Arming is a separate action.`);
		}), K("click", u, () => t.actions.workflowSetup?.assign(t.view?.phase || "")), J(e, n);
	};
	X(r, (e) => {
		t.view && e(i);
	}), J(e, n), He();
}
vr([
	"change",
	"input",
	"click"
]);
//#endregion
//#region ui/ExamplesBrowser.svelte
var Fs = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-btn menu_button svelte-18p7ib8\">Retry</button>"), Is = /* @__PURE__ */ q("<div class=\"pc-examples-issue svelte-18p7ib8\" role=\"alert\"><span class=\"svelte-18p7ib8\"> </span><!></div>"), Ls = /* @__PURE__ */ Dr("<g class=\"pc-example-comment svelte-18p7ib8\"><rect rx=\"4\" class=\"svelte-18p7ib8\"></rect><text class=\"svelte-18p7ib8\"> </text></g>"), Rs = /* @__PURE__ */ Dr("<path class=\"pc-wire pc-wire-native svelte-18p7ib8\"></path>"), zs = /* @__PURE__ */ Dr("<circle r=\"4\" class=\"svelte-18p7ib8\"></circle><text class=\"pc-example-pin-label svelte-18p7ib8\"> </text>", 1), Bs = /* @__PURE__ */ Dr("<g><rect class=\"pc-example-card svelte-18p7ib8\" rx=\"4\"></rect><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\"><path class=\"pc-example-icon svelte-18p7ib8\"></path></svg><text class=\"pc-example-node-title svelte-18p7ib8\" lengthAdjust=\"spacingAndGlyphs\"> </text><!></g>"), Vs = /* @__PURE__ */ Dr("<svg class=\"pc-example-preview svelte-18p7ib8\" preserveAspectRatio=\"xMidYMid meet\" aria-hidden=\"true\" focusable=\"false\"><!><!><!></svg>"), Hs = /* @__PURE__ */ q("<span class=\"pc-example-unavailable-preview svelte-18p7ib8\"><strong class=\"svelte-18p7ib8\">Unavailable</strong><span class=\"svelte-18p7ib8\"> </span></span>"), Us = /* @__PURE__ */ q("<button type=\"button\"><!> <span class=\"pc-example-title svelte-18p7ib8\"> </span></button>"), Ws = /* @__PURE__ */ q("<!> <div class=\"pc-examples-grid svelte-18p7ib8\"></div>", 1);
function Gs(e, t) {
	Ve(t, !0);
	let n = Ci(t, "examples", 19, () => []), r = Ci(t, "issue", 3, ""), i = Ci(t, "scrollTop", 3, 0), a, o = /* @__PURE__ */ I("");
	wi(() => {
		a.scrollTop = i();
	});
	async function s(e) {
		if (!W(o)) {
			L(o, e, !0);
			try {
				await t.open(e);
			} finally {
				L(o, "");
			}
		}
	}
	var c = Ws(), l = z(c), u = (e) => {
		var n = Is(), i = R(n), a = R(i, !0);
		N(i);
		var o = B(i), s = (e) => {
			var n = Fs();
			K("click", n, () => t.retry?.()), J(e, n);
		};
		X(o, (e) => {
			t.retry && e(s);
		}), N(n), V(() => Y(a, r())), J(e, n);
	};
	X(l, (e) => {
		r() && e(u);
	});
	var d = B(l, 2);
	Z(d, 21, n, (e) => e.id, (e, t) => {
		let n = /* @__PURE__ */ P(() => W(t).thumbnail);
		var r = Us();
		let i;
		var a = R(r), c = (e) => {
			var t = Vs(), r = R(t);
			Z(r, 17, () => W(n).comments, (e) => e.id, (e, t) => {
				var n = Ls(), r = R(n);
				let i;
				var a = B(r), o = R(a, !0);
				N(a), N(n), V(() => {
					Q(n, "data-id", W(t).id), Q(r, "x", W(t).x), Q(r, "y", W(t).y), Q(r, "width", W(t).w), Q(r, "height", W(t).h), i = ii(r, "", i, { stroke: W(t).color }), Q(a, "x", W(t).x + 12), Q(a, "y", W(t).y + 24), Y(o, W(t).title);
				}), J(e, n);
			});
			var i = B(r);
			Z(i, 17, () => W(n).wires, (e) => e.id, (e, t) => {
				var n = Rs();
				V(() => {
					Q(n, "data-kind", W(t).kind), Q(n, "data-id", W(t).id), Q(n, "d", W(t).d);
				}), J(e, n);
			}), Z(B(i), 17, () => W(n).nodes, (e) => e.id, (e, t) => {
				var n = Bs(), r = R(n), i = B(r), a = R(i);
				N(i);
				var o = B(i), s = R(o, !0);
				N(o), Z(B(o), 17, () => W(t).ports, (e) => e.id, (e, t) => {
					var n = zs(), r = z(n), i = B(r), a = R(i, !0);
					N(i), V(() => {
						Q(r, "data-kind", W(t).kind), Q(r, "cx", W(t).x), Q(r, "cy", W(t).y), Q(i, "x", W(t).x + (W(t).dir === "in" ? 9 : -9)), Q(i, "y", W(t).y + 4), Q(i, "text-anchor", W(t).dir === "in" ? "start" : "end"), Y(a, W(t).label);
					}), J(e, n);
				}), N(n), V(() => {
					ni(n, 0, Xr(W(t).className), "svelte-18p7ib8"), Q(n, "data-id", W(t).id), Q(r, "x", W(t).x), Q(r, "y", W(t).y), Q(r, "width", W(t).w), Q(r, "height", W(t).h), Q(i, "x", W(t).x + 8), Q(i, "y", W(t).y + 7), Q(a, "d", W(t).iconPath), Q(o, "x", W(t).x + 28), Q(o, "y", W(t).y + 20), Q(o, "textLength", W(t).title.length * 6 > W(t).w - 36 ? W(t).w - 36 : void 0), Y(s, W(t).title);
				}), J(e, n);
			}), N(t), V(() => Q(t, "viewBox", `${W(n).bounds.x} ${W(n).bounds.y} ${W(n).bounds.w} ${W(n).bounds.h}`)), J(e, t);
		}, l = (e) => {
			var n = Hs(), r = B(R(n)), i = R(r, !0);
			N(r), N(n), V(() => {
				Q(r, "id", `pc-example-issue-${W(t).number}`), Y(i, W(t).issue);
			}), J(e, n);
		};
		X(a, (e) => {
			W(n) ? e(c) : e(l, -1);
		});
		var u = B(a, 2), d = R(u, !0);
		N(u), N(r), V(() => {
			i = ni(r, 1, "pc-example-tile svelte-18p7ib8", null, i, { "pc-example-unavailable": !W(n) }), Q(r, "aria-label", W(t).title), Q(r, "aria-describedby", W(t).issue ? `pc-example-issue-${W(t).number}` : void 0), Q(r, "title", W(t).issue || W(t).goal), r.disabled = !!W(o) || !W(n), Y(d, W(t).title);
		}), K("click", r, () => s(W(t).id)), J(e, r);
	}), N(d), $(d, (e) => a = e, () => a), V(() => Q(d, "aria-busy", !!W(o))), G("scroll", d, () => t.scroll(a.scrollTop)), J(e, c), He();
}
vr(["click"]);
//#endregion
//#region ui/ImportReview.svelte
var Ks = /* @__PURE__ */ q("<p> </p>"), qs = /* @__PURE__ */ q("<li> </li>"), Js = /* @__PURE__ */ q("<h3>Saved bindings to review</h3><ul></ul>", 1), Ys = /* @__PURE__ */ q("<p>Saved model metadata is present. Review local connections before running.</p>"), Xs = /* @__PURE__ */ q("<h3>Imported terminal effects</h3><ul></ul>", 1), Zs = /* @__PURE__ */ q("<p>No imported terminal effects.</p>"), Qs = /* @__PURE__ */ q("<p role=\"alert\"> </p>"), $s = /* @__PURE__ */ q("<button type=\"button\" class=\"pc-btn menu_button\">Prepare again</button>"), ec = /* @__PURE__ */ q("<div class=\"pc-workspace-overlay pc-import-overlay\"><div class=\"pc-workspace-dialog pc-import-review\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Import into graph\" tabindex=\"-1\"><header><h2>Import into graph</h2><button type=\"button\" class=\"pc-btn menu_button\" aria-label=\"Cancel import\">×</button></header> <p><strong> </strong> <small> </small></p> <dl><dt>Phase</dt><dd> </dd><dt>Additions</dt><dd> </dd><dt>Conservative request bound</dt><dd> </dd></dl> <p class=\"pc-import-explanation\">This authoring bound includes unfinished branches. Bindings and reachable execution are checked when you explicitly run the workflow.</p> <!> <!> <!> <p>Insertion keeps internal wiring and relative layout. It does not connect matching names, arm or assign the graph, run requests, publish Guidance, or Apply a reply.</p> <!> <footer><button type=\"button\" class=\"pc-btn menu_button\">Cancel</button><!><button type=\"button\" class=\"pc-btn menu_button pc-import-accept\">Insert into graph</button></footer></div></div>");
function tc(e, t) {
	Ve(t, !0);
	let n;
	wi(() => {
		let e = document.activeElement;
		return n.querySelector("button")?.focus(), () => e?.focus({ preventScroll: !0 });
	});
	function r(e) {
		if (e.stopPropagation(), e.key === "Escape" && (e.preventDefault(), t.actions.cancelImport?.()), e.key === "Tab") {
			let t = [...n.querySelectorAll("button:not(:disabled)")], r = t[0], i = t.at(-1);
			e.shiftKey && document.activeElement === r && (e.preventDefault(), i?.focus()), !e.shiftKey && document.activeElement === i && (e.preventDefault(), r?.focus());
		}
	}
	var i = ec(), a = R(i), o = R(a), s = B(R(o));
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
		var n = Ks(), r = R(n);
		N(n), V((e) => Y(r, `Imported model roles: ${e ?? ""}.`), [() => t.view.requiredRoles.join(", ")]), J(e, n);
	};
	X(b, (e) => {
		t.view.requiredRoles.length && e(x);
	});
	var S = B(b, 2), C = (e) => {
		var n = Js(), r = B(z(n));
		Z(r, 21, () => t.view.unresolvedBindings, zr, (e, t) => {
			var n = qs(), r = R(n);
			N(n), V((e) => Y(r, `${W(t).title ?? ""} · ${W(t).role ?? ""}: missing ${e ?? ""}`), [() => W(t).missing.join(" and ")]), J(e, n);
		}), N(r), J(e, n);
	}, w = (e) => {
		J(e, Ys());
	};
	X(S, (e) => {
		t.view.unresolvedBindings.length ? e(C) : t.view.bindingReviewRequired && e(w, 1);
	});
	var T = B(S, 2), E = (e) => {
		var n = Xs(), r = B(z(n));
		Z(r, 21, () => t.view.terminals, zr, (e, t) => {
			var n = qs(), r = R(n);
			N(n), V(() => Y(r, `${W(t).title ?? ""} · ${W(t).operation ?? ""}`)), J(e, n);
		}), N(r), J(e, n);
	}, D = (e) => {
		J(e, Zs());
	};
	X(T, (e) => {
		t.view.terminals.length ? e(E) : e(D, -1);
	});
	var O = B(T, 4), k = (e) => {
		var n = Qs(), r = R(n, !0);
		N(n), V(() => Y(r, t.view.error)), J(e, n);
	};
	X(O, (e) => {
		t.view.error && e(k);
	});
	var A = B(O, 2), ee = R(A), te = B(ee), ne = (e) => {
		var n = $s();
		K("click", n, () => t.actions.prepareImportAgain?.()), J(e, n);
	};
	X(te, (e) => {
		t.view.error && e(ne);
	});
	var re = B(te);
	N(A), N(a), $(a, (e) => n = e, () => n), N(i), V(() => {
		Y(u, t.view.name), Y(f, t.view.fileName), Y(h, t.view.phase), Y(_, `${t.view.nodeCount ?? ""} blocks · ${t.view.wireCount ?? ""} wires · ${t.view.groupCount ?? ""} groups`), Y(y, `${t.view.callBound ?? ""} total · ${t.view.importedCallBound ?? ""} imported`), re.disabled = !!t.view.error;
	}), K("keydown", a, r), G("paste", a, (e) => e.stopPropagation()), K("click", s, () => t.actions.cancelImport?.()), K("click", ee, () => t.actions.cancelImport?.()), K("click", re, () => t.actions.acceptImport?.()), J(e, i), He();
}
vr(["keydown", "click"]);
//#endregion
//#region ui/Workbench.svelte
var nc = /* @__PURE__ */ q("<p class=\"pc-native-diagnostic svelte-1dr9aew\" role=\"alert\"> </p>"), rc = /* @__PURE__ */ q("<p>Browse node families on the floating shelf. Middle mouse pans the graph; the wheel zooms around the pointer. Use the divider or its arrow keys to resize Preview.</p><p>Setup contains workflow examples, phase assignment and role defaults. Arm enables the selected host workflow; Run tests it explicitly.</p><p>File › Open workflow chooses a JSON file and opens a separate workflow. Save workflow keeps committed edits and connections in SillyTavern. Export workflow JSON downloads a portable sharing copy without local connections. Import into graph reviews a same-phase fragment before one undoable insertion.</p><p>Select nodes and right-click Create Subgraph to open their connected body in a new tab. Double-click a subgraph to open it. Add Input and Output nodes from the Subgraphs shelf inside an editable subgraph, then name and configure their ports in Details.</p><p>Right-click a subgraph block and choose Add to Subgraphs to save it for reuse. Right-click a saved shelf entry to delete it. Saving updates the shelf only when you choose to save; existing placed copies stay unchanged. Portals connect pins through named references. Preview artifact tabs show results for the selected node; Run to here checks the request bound before running. Apply reviews the fresh result against the full root workflow.</p>", 1), ic = /* @__PURE__ */ q("<div class=\"pc-workspace-overlay\"><div role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\"><header class=\"svelte-1dr9aew\"><h2 class=\"svelte-1dr9aew\"> </h2><button type=\"button\" class=\"pc-btn menu_button\" aria-label=\"Close panel\">×</button></header> <!></div></div>"), ac = /* @__PURE__ */ q("<div class=\"pc-workspace-overlay\"><div class=\"pc-manager-dialog svelte-1dr9aew\" role=\"dialog\" tabindex=\"-1\" aria-modal=\"true\" aria-label=\"Manage portals\"><!></div></div>"), oc = /* @__PURE__ */ q("<div role=\"dialog\" aria-modal=\"true\" aria-label=\"Lattice\" data-pc-workbench=\"svelte\"><!> <div class=\"pc-body\" role=\"region\" aria-label=\"Workspace panels\" tabindex=\"0\"><div class=\"pc-stage\"><section aria-label=\"Output preview\"><header class=\"pc-preview-pane-head\"><strong>Preview</strong><button type=\"button\" class=\"pc-btn menu_button\"> </button></header> <div class=\"pc-preview-content\"><!></div></section> <!> <!> <!> <div class=\"pc-canvas-area\" id=\"pc-workspace-graph\" role=\"tabpanel\"><div class=\"pc-workspace-run svelte-1dr9aew\"><!></div> <div class=\"pc-canvas-host\" aria-label=\"Node canvas\"></div> <!> <!></div></div> <!> <div class=\"pc-inspector pc-workspace-details svelte-1dr9aew\"><header class=\"pc-details-heading svelte-1dr9aew\"><strong class=\"svelte-1dr9aew\">Details</strong><button type=\"button\" class=\"svelte-1dr9aew\">Portals</button></header> <!> <div><!></div></div></div> <!> <!> <!> <!> <!> <!></div>");
function sc(e, t) {
	Ve(t, !0);
	let n = Ci(t, "actions", 7), r = /* @__PURE__ */ I({
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
	}), i, a, o, s, c, l;
	function u() {
		return {
			root: i,
			parts: {
				...l.getParts(),
				inspector: c,
				canvasHost: o
			}
		};
	}
	function d(e) {
		n({
			...n(),
			...e
		});
	}
	function f(e) {
		L(r, {
			...W(r),
			...e
		});
	}
	async function p(e, t) {
		if (await cr(), !t()) return;
		let n = [...o.querySelectorAll(".pc-comment-frame[data-id]")].find((t) => t.dataset.id === e)?.querySelector(".pc-comment-title-input");
		n && !n.disabled && (n.focus({ preventScroll: !0 }), n.select());
	}
	let m = "lattice.workspace.preview";
	function h() {
		try {
			let e = JSON.parse(localStorage.getItem(m) || "null");
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
	let g = h(), _ = /* @__PURE__ */ I(Qt(g.height)), v = /* @__PURE__ */ I(Qt(g.collapsed)), y = /* @__PURE__ */ I(500), b = /* @__PURE__ */ I(null), x = /* @__PURE__ */ I(520), S = /* @__PURE__ */ P(() => Math.max(220, Math.min(W(x), W(b) ?? W(r).detailsWidth ?? 258)));
	function C(e) {
		L(b, null), L(r, {
			...W(r),
			detailsWidth: e
		}), n().resizeDetails?.(e);
	}
	let w = /* @__PURE__ */ I(""), T = /* @__PURE__ */ I(null), E = null, D = 0, O = /* @__PURE__ */ I(0), k;
	function A() {
		try {
			localStorage.setItem(m, JSON.stringify({
				height: W(_),
				collapsed: W(v)
			}));
		} catch {}
	}
	function ee() {
		n().resizeStart?.();
	}
	function te(e) {
		ee(), L(v, e, !0), A();
	}
	function ne() {
		te(!1);
	}
	function re() {
		return ie("workflow-setup");
	}
	async function ie(e) {
		e === "show-preview" ? te(!1) : e === "collapse-preview" ? te(!0) : e === "add-node" ? k.openSearch() : (E = document.activeElement, e === "examples" && n().refreshExamples?.(), D++, L(w, e, !0), await cr(), W(T).querySelector("button")?.focus());
	}
	function ae() {
		D++, L(w, ""), E?.focus({ preventScroll: !0 });
	}
	async function oe(e) {
		let t = D;
		try {
			let r = await n().openExample?.(e);
			return r === !0 && t === D && W(w) === "examples" && ae(), r === !0;
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
			let t = [...W(T).querySelectorAll("button:not(:disabled), input, select, textarea, [tabindex=\"0\"]")], n = t[0], r = t.at(-1);
			e.shiftKey && document.activeElement === n && (e.preventDefault(), r?.focus()), !e.shiftKey && document.activeElement === r && (e.preventDefault(), n?.focus());
		}
	}
	wi(() => {
		let e = () => {
			L(y, Math.max(90, s.clientHeight - 190), !0), L(x, Math.max(220, Math.min(520, (a.clientWidth || i.clientWidth || window.innerWidth) - 368)), !0);
		}, t = globalThis.ResizeObserver;
		if (!t) return e(), window.addEventListener("resize", e), () => window.removeEventListener("resize", e);
		let n = new t(e);
		return n.observe(s), n.observe(a), e(), () => n.disconnect();
	});
	var le = {
		getParts: u,
		updateActions: d,
		update: f,
		focusCommentTitle: p,
		revealPreview: ne,
		revealWorkflowSetup: re
	}, ue = oc();
	let de, fe;
	var pe = R(ue);
	$($i(pe, {
		get state() {
			return W(r);
		},
		get actions() {
			return n();
		},
		local: ie
	}), (e) => l = e, () => l);
	var me = B(pe, 2), he = R(me), ge = R(he);
	let _e, ve;
	var ye = R(ge), be = B(R(ye)), xe = R(be, !0);
	N(be), N(ye);
	var Se = B(ye, 2), Ce = R(Se);
	{
		let e = /* @__PURE__ */ P(() => W(r).outputPreview ?? null);
		fo(Ce, {
			get view() {
				return W(e);
			},
			get actions() {
				return n().outputPreview;
			},
			collapse: () => te(!0)
		});
	}
	N(Se), N(ge);
	var we = B(ge, 2), Te = (e) => {
		{
			let t = /* @__PURE__ */ P(() => Math.min(W(_), W(y)));
			ta(e, {
				get height() {
					return W(t);
				},
				get max() {
					return W(y);
				},
				start: ee,
				change: (e) => {
					L(_, e, !0), A();
				}
			});
		}
	};
	X(we, (e) => {
		W(v) || e(Te);
	});
	var Ee = B(we, 2);
	fa(Ee, {
		get views() {
			return W(r).graphViews;
		},
		get actions() {
			return n().graphViewActions;
		},
		panelId: "pc-workspace-graph"
	});
	var j = B(Ee, 2);
	{
		let e = /* @__PURE__ */ P(() => W(r).graphViews?.active);
		_a(j, {
			get view() {
				return W(e);
			},
			get actions() {
				return n().graphViewActions;
			}
		});
	}
	var De = B(j, 2), M = R(De), Oe = R(M);
	{
		let e = /* @__PURE__ */ P(() => W(r).runMeter ?? null);
		Do(Oe, {
			get view() {
				return W(e);
			},
			open: () => {
				L(w, "run-details");
			}
		});
	}
	N(M);
	var ke = B(M, 2);
	$(ke, (e) => o = e, () => o);
	var je = B(ke, 2), Me = (e) => {
		var t = nc(), n = R(t, !0);
		N(t), V(() => Y(n, W(r).nativeDiagnostic)), J(e, t);
	};
	X(je, (e) => {
		W(r).nativeDiagnostic && e(Me);
	}), $(Os(B(je, 2), {
		get view() {
			return W(r).workflow;
		},
		get choices() {
			return W(r).nativeChoices;
		},
		get choose() {
			return n().chooseNative;
		},
		get shelfSubgraph() {
			return n().shelfSubgraph;
		},
		get readOnly() {
			return W(r).readOnly;
		},
		add: (e, t) => n().addNode?.(e, t)
	}), (e) => k = e, () => k), N(De), N(he), $(he, (e) => s = e, () => s);
	var Ne = B(he, 2), Pe = (e) => {
		var t = kr();
		Rr(z(t), () => W(r).graphViews?.active.key ?? W(r).graphId, (e) => {
			ra(e, {
				get width() {
					return W(S);
				},
				get max() {
					return W(x);
				},
				start: ee,
				preview: (e) => L(b, e, !0),
				change: C
			});
		}), J(e, t);
	};
	X(Ne, (e) => {
		W(r).inspectorOpen && e(Pe);
	});
	var Fe = B(Ne, 2), Ie = R(Fe), Le = B(R(Ie));
	N(Ie);
	var Re = B(Ie, 2), ze = (e) => {
		let t = /* @__PURE__ */ P(() => W(r).commentDetails);
		qa(e, {
			get comment() {
				return W(t).comment;
			},
			onPatch: (e) => n().commentDetails?.patch(W(t).selection, e),
			onCommand: (e) => n().commentDetails?.command(W(t).selection, e)
		});
	};
	X(Re, (e) => {
		W(r).commentDetails && e(ze);
	});
	var Be = B(Re, 2), Ue = R(Be);
	{
		let e = /* @__PURE__ */ P(() => W(r).commentDetails ? null : W(r).nodeDetails ?? null);
		Wa(Ue, {
			get view() {
				return W(e);
			},
			get actions() {
				return n().nodeDetails;
			}
		});
	}
	N(Be), N(Fe), $(Fe, (e) => c = e, () => c), N(me), $(me, (e) => a = e, () => a);
	var We = B(me, 2), Ge = (e) => {
		var t = ic(), i = R(t);
		let a;
		var o = R(i), s = R(o), c = R(s, !0);
		N(s);
		var l = B(s);
		N(o);
		var u = B(o, 2), d = (e) => {
			Gs(e, {
				get examples() {
					return W(r).examples;
				},
				get issue() {
					return W(r).examplesIssue;
				},
				get retry() {
					return n().refreshExamples;
				},
				get scrollTop() {
					return W(O);
				},
				scroll: (e) => L(O, e, !0),
				open: oe
			});
		}, f = (e) => {
			{
				let t = /* @__PURE__ */ P(() => W(r).runDetails ?? null);
				Co(e, {
					get view() {
						return W(t);
					},
					get actions() {
						return n().runDetails;
					}
				});
			}
		}, p = (e) => {
			{
				let t = /* @__PURE__ */ P(() => W(r).rootWorkflow ?? W(r).workflow);
				Ps(e, {
					get view() {
						return W(t);
					},
					get actions() {
						return n();
					}
				});
			}
		}, m = (e) => {
			var t = rc();
			Ae(4), J(e, t);
		};
		X(u, (e) => {
			W(w) === "examples" ? e(d) : W(w) === "run-details" ? e(f, 1) : W(w) === "workflow-setup" ? e(p, 2) : e(m, -1);
		}), N(i), $(i, (e) => L(T, e), () => W(T)), N(t), V(() => {
			a = ni(i, 1, "pc-workspace-dialog svelte-1dr9aew", null, a, { "pc-examples-dialog": W(w) === "examples" }), Q(i, "aria-label", W(w) === "examples" ? "Examples" : W(w) === "workflow-setup" ? "Workflow setup" : W(w) === "run-details" ? "Run details" : "Workspace guide"), Y(c, W(w) === "examples" ? "Examples" : W(w) === "workflow-setup" ? "Workflow setup" : W(w) === "run-details" ? "Run details" : "Workspace guide");
		}), K("keydown", i, ce), G("paste", i, (e) => e.stopPropagation()), K("click", l, ae), J(e, t);
	};
	X(We, (e) => {
		W(w) && e(Ge);
	});
	var Ke = B(We, 2);
	as(Ke, {
		get view() {
			return W(r).nativeSearch;
		},
		get actions() {
			return n().nativeSearch;
		}
	});
	var qe = B(Ke, 2);
	ls(qe, {
		get view() {
			return W(r).nativePinMenu;
		},
		get actions() {
			return n().nativePinMenu;
		}
	});
	var Je = B(qe, 2), Ye = (e) => {
		var t = ac(), i = R(t);
		Ko(R(i), {
			get view() {
				return W(r).portalManager;
			},
			get actions() {
				return n().portalManager;
			}
		}), N(i), N(t), K("keydown", i, se), G("paste", i, (e) => e.stopPropagation()), J(e, t);
	};
	X(Je, (e) => {
		W(r).portalManager && e(Ye);
	});
	var Xe = B(Je, 2), Ze = (e) => {
		Xo(e, {
			get view() {
				return W(r).subgraphSave;
			},
			get actions() {
				return n().subgraphSave;
			}
		});
	};
	X(Xe, (e) => {
		W(r).subgraphSave && e(Ze);
	});
	var Qe = B(Xe, 2), $e = (e) => {
		tc(e, {
			get view() {
				return W(r).importReview;
			},
			get actions() {
				return n();
			}
		});
	};
	return X(Qe, (e) => {
		W(r).importReview && e($e);
	}), N(ue), $(ue, (e) => i = e, () => i), V((e) => {
		de = ni(ue, 1, "pc-root pc-native-workspace svelte-1dr9aew", null, de, { "pc-native-flat": W(r).nativeFlatCanvas }), fe = ii(ue, "", fe, { "--pc-details-width": `${W(S)}px` }), _e = ni(ge, 1, "pc-preview-pane", null, _e, { "pc-preview-collapsed": W(v) }), ve = ii(ge, "", ve, e), Q(be, "aria-expanded", !W(v)), Y(xe, W(v) ? "Expand preview" : "Collapse preview"), Q(Se, "hidden", W(v)), Q(Fe, "hidden", !W(r).inspectorOpen), Q(Be, "hidden", !!W(r).commentDetails);
	}, [() => ({ "--pc-preview-height": `${Math.min(W(_), W(y))}px` })]), K("click", be, () => te(!W(v))), K("click", Le, () => n().managePortals?.()), J(e, ue), He(le);
}
vr(["click", "keydown"]);
//#endregion
//#region ui/entry.js
function cc(e, t) {
	let n = document.createElement("div");
	n.style.cssText = "position:absolute;left:0;top:0;visibility:hidden;pointer-events:none", n.setAttribute("aria-hidden", "true"), n.inert = !0, e.append(n);
	let r;
	try {
		r = jr(ji, {
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
		r && Fr(r), n.remove();
	}
}
function lc(e, t) {
	let n = jr(Gi, {
		target: e,
		props: { actions: t }
	});
	return It(), {
		...n.getLayers(),
		setComments: (e, t) => It(() => n.setComments(e, t)),
		setNodes: (e) => It(() => n.setNodes(e)),
		setGroups: (e) => It(() => n.setGroups(e)),
		setWires: (e, t, r) => It(() => n.setWires(e, t, r)),
		setPositions: (e, t) => It(() => n.setPositions(e, t)),
		destroy: () => Fr(n)
	};
}
function uc(e, t) {
	let n = jr(sc, {
		target: e,
		props: { actions: t }
	});
	return It(), {
		...n.getParts(),
		update: (e) => It(() => n.update(e)),
		updateActions: (e) => It(() => n.updateActions(e)),
		revealPreview: () => It(() => n.revealPreview()),
		revealWorkflowSetup: () => It(() => n.revealWorkflowSetup()),
		focusCommentTitle: (e, t) => n.focusCommentTitle(e, t),
		destroy: () => Fr(n)
	};
}
//#endregion
export { cc as measureNodeCard, lc as mountCanvas, uc as mountWorkbench };
