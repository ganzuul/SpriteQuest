const arrays = new WeakMap();
/** Value-qualified slots: incoming DTOs are ordinary mutable data, so retain a detached signature. */
export function retainSlots(values, slots) {
    const keep = new Set();
    const result = values.map(value => {
        keep.add(value.id);
        const signature = JSON.stringify(value), previous = slots.get(value.id);
        if (previous?.signature === signature) return previous.value;
        // Detached fields prevent an external prepared-pin mutation from changing a published slot in place.
        const slot = { signature, value: structuredClone(value) };
        slots.set(value.id, slot); return slot.value;
    });
    for (const id of slots.keys()) if (!keep.has(id)) slots.delete(id);
    const previous = arrays.get(slots);
    if (previous?.length === result.length && result.every((value, index) => value === previous[index])) return previous;
    arrays.set(slots, result); return result;
}
/** Content, arrangement and layout environment qualify pins even when outer bounds are unchanged. */
export function cardLayoutKey(card, environment) {
    return JSON.stringify([environment, card.type, card.title, card.titleHint, card.label, card.body, card.w,
        card.compact, card.ports, card.modifierSummary, card.boundary]);
}

/** Keep membership/order separate from local reactive values. Structural arrays change only on insertion, removal or reorder. */
export function updateRenderSlots(values, order, slots, createSlot) {
    const keep = new Set(), next = values.map(value => {
        keep.add(value.id);
        let slot = slots.get(value.id);
        if (!slot) { slot = createSlot(value); slots.set(value.id, slot); }
        else if (slot.value !== value) slot.value = value;
        return slot;
    });
    for (const id of slots.keys()) if (!keep.has(id)) slots.delete(id);
    return order.length === next.length && next.every((slot,index) => slot === order[index]) ? order : next;
}
