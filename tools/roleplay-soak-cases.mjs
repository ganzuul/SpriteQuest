import { readFileSync } from 'node:fs';
import { completedMessage, graphBy, seedMemory, sourceRefs, upsert } from '../tests/helpers/workflow-example-fixtures.mjs';

const authoring = JSON.parse(readFileSync(new URL('../docs/research/2026-10-09-lattice-example-catalog.json', import.meta.url), 'utf8'));
const reply = {
    2: 'He let out a breath he didn\'t know he was holding, then opened the letter. "No more delays," Mira said.',
    4: 'The envoy returned to Greyhaven carrying a sun stone. The painting Greyhaven at Dusk hung by the door.',
    9: 'After taking a moment to look at the door, she reached out her hand and slowly turned the handle. She waited for the latch to click.',
    10: 'The room felt eerie. Rain tapped the cracked window. Mira waited beside the table. "Keep the lamp lit," Sol said.',
    11: 'Tessa pointed at the water across the road. "Due to the fact that the road is flooded, our departure must be delayed." She set the travel bag on the bench.',
    12: 'Rin steadied the lantern. "I disagree with your assessment. The bridge is unsafe." She kept her boots on the near bank.',
    13: 'He saw her name on the envelope and put it down unopened. "Later," he said.',
    14: 'Jon stood by the door. The latch was cold beneath his hand. "Wait here," Mira said from the corridor.',
    15: 'At night in the kitchen, Mira closes the door. "They\'re here," she says.',
    16: 'She waited at the gate while the cold wind blew. The courier had not arrived.',
    30: 'Mira rested the unopened letter on the table. Sol waited at the gate. "You kept your promise this time. What happens next?" Mira said.',
};
const scenes = {
    5: ['Tessa', 'Tessa guards the night checkpoint and may lower its barrier.', ['Tessa demands an explanation for the broken seal.', 'Rowan has not answered. The player controls Rowan.']],
    6: ['Sol', 'Sol owns a locked chest and wants his stolen map returned before opening it.', ['Rowan inspected the lock twice and asked what is inside.', 'Sol remains beside the chest. No one has accepted a bargain.']],
    7: ['Rook', 'Rook stands in the doorway with a short spear; the player controls Mira.', ['Mira is behind a heavy table. The exit is to her left.', 'The table remains between Mira and Rook. No strike or defense is settled.']],
    8: ['Mira', 'Mira and Sol share the debt-table focal exchange.', ['Mira, Sol, Rin, Kesh and Oren sit at the table. Rin sorts papers; Kesh holds the lamp; Oren watches the door.', "Rowan asks Mira whether she will repay Sol's debt. Rowan owns his next response."]],
    18: ['Mira', 'Mira values independence and practical cooperation; she dislikes having decisions made for her.', ["Sol takes Mira's tools and says he will finish the repair for her without asking.", 'Mira has not yet answered or accepted the offer. The player’s next response remains open.']],
    19: ['Rin', 'Rin wants to protect Sol and promised Mira to report what she witnessed.', ['Mira asks Rin who opened the archive door.', 'Rin saw Sol present at the archive door but did not see the lock opened. Rin has not answered; both commitments and the player’s next response remain unresolved.']],
    20: ['Rin', 'Rin prefers practical movement and retains established physical limits.', ['Rin twists her ankle on the quay.', 'Rin favors the ankle and asks for support.', 'The narrow ferry-cabin steps lead to the deck. No recovery has occurred.']],
    21: ['Mira', 'Mira distinguishes a promise from its completion.', ['Will you bring the ferry before dawn?', 'Mira promises to bring the ferry before dawn; arrival is unresolved.']],
    22: ['Mira', 'Mira connects sensory cues only to supported recollections.', ['Mira remembers waiting beside her father at the harbor lamp; its lamp-oil smell was distinct.', 'The ferry cabin now smells of lamp-oil while Mira waits to board.']],
    23: ['Mira', 'Mira keeps boundaries about her letters; an apology does not automatically restore trust.', ['Sol handled Mira’s letters after she asked him not to.', 'Mira was angry and kept her letters out of reach.', 'Sol apologizes for handling the letters.', 'Mira accepts the apology but asks him to leave her letters alone.', 'Sol asks to continue sorting the other letters.']],
    24: ['Mira', 'Mira is practical and guarded. One kept promise does not erase disappointment.', ['Sol previously failed to return the borrowed chart and Mira was disappointed.', 'This time Sol returns the chart exactly as promised.']],
    26: ['Rin', 'Rin wants to locate the missing ferry and preserves unresolved goals.', ['The ferry is missing; Rin wants to locate it.', 'Rin leaves to ask the ferry keeper about the missing boat.', 'Rowan waits on the landing. No answer or return has occurred.']],
    27: ['Mira', 'Mira and Eli had an old argument last winter; she is hospitable but wants practical limits.', ['Eli arrives unexpectedly.', 'Mira says, "Of course you can stay."']],
    29: ['Mira', 'Mira is curious about the unopened letter but promised not to break its seal.', ['Mira holds the unopened letter at the closed gate.', 'The player has not given permission to open it.']],
    30: ['Mira', 'Mira is practical and guarded. One fulfilled promise does not erase disappointment.', ['Sol previously failed to return Mira’s chart.', 'Sol now returns the chart as promised.', 'The ferry is delayed; Mira holds the unopened letter.', 'Rin left to check the harbor and has not returned.']],
};

/** Synthetic evidence follows each authored lesson; all seeded refs come from native completed messages. */
export function liveCaseSpec(number, phase) {
    const lesson = authoring.entries.find(entry => entry.number === number);
    const spec = { number, phase, id: lesson.id, title: lesson.title, graph: graphBy(number, phase), options: {}, teachingGoal: lesson.goal };
    if (reply[number] && phase === 'post') spec.options.text = reply[number];
    if (scenes[number] && !(number === 30 && phase === 'post')) {
        const [name, description, chat] = scenes[number];
        spec.options.character = { name, avatar: `${name.toLowerCase()}.png`, description };
        spec.options.chat = chat.map((text, index) => completedMessage(text, index, index % 2 === 0));
    }
    if ([17, 28].includes(number)) {
        spec.options.chat = Array.from({ length: 6 }, (_, index) => completedMessage(`Old harbor discussion ${index}: ${'Repeated weather and prior route discussion without new causal evidence. '.repeat(38)}`, index, true));
        const gateEvidence = number === 28
            ? 'The ferry is delayed. The inspector keeps the gate closed. Mira holds the sealed letter. The unopened letter remains intact.'
            : 'The ferry is delayed. The inspector keeps the gate closed; Mira still has the sealed unopened letter.';
        spec.options.chat.push(completedMessage(gateEvidence, 6, true), completedMessage('Rin left to check the harbor.', 7), completedMessage('What can Mira do while we wait?', 8, true));
    }
    spec.seed = async f => {
        if (number === 25 && phase === 'pre') {
            const post = graphBy(25, 'post');
            f.setGraph(post);
            const result = await f.controller.runPost(post);
            if (!result.ok) throw Error('Deterministic counter prerequisite failed.');
            f.setGraph(spec.graph);
            return;
        }
        const changes = ({ events }) => {
            const refs = sourceRefs(events);
            if (number === 20 && phase === 'pre') return [upsert('conditions', 'ankle-limit', 'Rin favors the injured ankle and needs support.', refs.slice(0, 2))];
            if (number === 21 && phase === 'pre') return [upsert('episodes', 'ferry-promise', events[1].text, [refs[1]])];
            if (number === 22) return [upsert('episodes', 'harbor-lamp-memory', events[0].text, [refs[0]])];
            if (number === 23) return [
                ...phase === 'post' ? [upsert('conditions', 'temporary-anger', 'Mira is temporarily angry about the letter boundary.', refs.slice(0, 2))] : [],
                upsert('beliefs', 'guarded-trust', 'Mira remains guarded about Sol handling her letters.', refs.slice(0, 2), 'interpretation'),
            ];
            if ((number === 24 || number === 30) && phase === 'pre') return [upsert('episodes', 'chart-setback', events[0].text, [refs[0]]), upsert('episodes', 'chart-return', events[1].text, [refs[1]]), upsert('relationships', 'guarded-reliability', 'One kept promise after a setback suggests possible reliability while Mira remains guarded.', refs.slice(0, 2), 'interpretation')];
            if (number === 26) return [upsert('goals', 'locate-ferry', 'Rin intends to locate the missing ferry; the inquiry is unresolved.', refs.slice(0, 2)), upsert('episodes', 'ferry-inquiry-departure', events[1].text, [refs[1]])];
            return [];
        };
        const needsSeed = number === 22 || number === 23 || number === 26 || phase === 'pre' && [20, 21, 24, 30].includes(number);
        if (needsSeed) await seedMemory(f, changes);
        if (number === 26 && phase === 'post') f.append('Rin returns and reports that the ferry keeper has not seen the boat. The boat location remains unverified.');
    };
    return spec;
}
