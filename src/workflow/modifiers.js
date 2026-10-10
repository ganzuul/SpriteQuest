const fail = (code, message) => ({ ok: false, error: { code, message } });
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const enumeration = (key,label,options) => ({key,label,type:'enum',options});
const string = (key,label,min=0) => ({key,label,type:'string',min,max:4096});
const boolean = (key,label) => ({key,label,type:'boolean'});
const descriptor = (type,label,defaultSettings,fields) => ({type,label,version:1,defaultSettings,fields});
export const modifierTypes = freeze({
    trim:descriptor('trim','Trim',{edges:'both'},[enumeration('edges','Edges',['both','start','end'])]),
    whitespace:descriptor('whitespace','Whitespace',{lineEndings:'lf',trailingSpaces:true,blankLines:'collapse'},[enumeration('lineEndings','Line endings',['preserve','lf','crlf']),boolean('trailingSpaces','Remove trailing spaces'),enumeration('blankLines','Blank lines',['preserve','collapse','remove'])]),
    wrap:descriptor('wrap','Wrap',{prefix:'',suffix:''},[string('prefix','Prefix'),string('suffix','Suffix')]),
    replace:descriptor('replace','Replace',{pattern:'text',replacement:'',caseSensitive:true,occurrence:'all'},[string('pattern','Find',1),string('replacement','Replace with'),boolean('caseSensitive','Case sensitive'),enumeration('occurrence','Occurrence',['first','all'])]),
    'unwrap-fence':descriptor('unwrap-fence','Unwrap fence',{},[]),
});
function own(value,key,fallback) {
    const property=Object.getOwnPropertyDescriptor(value,key);
    if (!property) return fallback;
    if (!property.enumerable || !Object.hasOwn(property,'value')) throw new Error('Use own data.');
    return property.value;
}
function exact(value,keys) {
    if (!value || typeof value !== 'object' || Array.isArray(value) || ![Object.prototype,null].includes(Object.getPrototypeOf(value))) throw new Error('Use plain objects.');
    const actual=Reflect.ownKeys(value);
    if (actual.length !== keys.length || actual.some(key=>typeof key !== 'string' || !keys.includes(key))) throw new Error('Use exact keys.');
    return Object.fromEntries(keys.map(key=>[key,own(value,key)]));
}
function validateModifiers(value=[]) {
    try {
        if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) throw new Error('Use a modifier array.');
        const length=Object.getOwnPropertyDescriptor(value,'length').value;
        if (length>16 || Reflect.ownKeys(value).length !== length+1) throw new Error('Use at most 16 dense entries.');
        const ids=new Set(), modifiers=[];
        for(let i=0;i<length;i++) {
            const entry=exact(own(value,String(i)),['id','type','version','enabled','settings']);
            if (typeof entry.id !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(entry.id) || ids.has(entry.id)) throw new Error('Use unique local IDs.');
            ids.add(entry.id);
            if (typeof entry.type !== 'string' || !Object.hasOwn(modifierTypes,entry.type) || entry.version!==1 || typeof entry.enabled !== 'boolean') throw new Error('Use a known modifier version and boolean enabled state.');
            const fields=modifierTypes[entry.type].fields;
            entry.settings=exact(entry.settings,fields.map(field=>field.key));
            for(const field of fields) {
                const item=entry.settings[field.key];
                if (field.type==='enum' ? !field.options.includes(item) : field.type==='string' ? typeof item !== 'string' || item.length<field.min || item.length>field.max : typeof item !== 'boolean') throw new Error('Use bounded supported settings.');
            }
            modifiers.push(entry);
        }
        return {ok:true,data:freeze({modifiers})};
    } catch { return fail('INVALID_MODIFIERS','Use at most 16 unique version 1 modifiers with exact known bounded settings.'); }
}
export function validateNodeModifiers(node, outputPorts) {
    try {
        const checked=validateModifiers(own(node,'modifiers',[])); if(!checked.ok || !checked.data.modifiers.length)return checked;
        if (own(node,'type') !== 'workflow' || !Array.isArray(outputPorts) || outputPorts.length !== 1 || own(outputPorts[0],'kind') !== 'text' || own(outputPorts[0],'direction','output') !== 'output') return fail('INCOMPATIBLE_MODIFIERS','Modifiers require a primitive node with exactly one Text output.');
        return checked;
    }
    catch { return fail('INVALID_MODIFIERS','Modifiers must be plain authoring data.'); }
}
function whitespace(text,settings) {
    const parts=text.split(/(\r\n|\r|\n)/), output=[]; let previousBlank=false;
    for(let i=0;i<parts.length;i+=2) {
        let line=parts[i]; const ending=parts[i+1] ?? '';
        if (!line && !ending && i===parts.length-1) continue;
        const blank=/^[ \t]*$/.test(line);
        if (blank && (settings.blankLines==='remove' || settings.blankLines==='collapse' && previousBlank)) continue;
        previousBlank=blank;
        if (settings.trailingSpaces)line=line.replace(/[ \t]+$/,'');
        output.push(line,ending && (settings.lineEndings==='preserve' ? ending : settings.lineEndings==='lf' ? '\n' : '\r\n'));
    }
    return output.join('');
}
// Escape every UTF-16 code unit; authored patterns never become regex syntax.
function replaceLiteral(text,settings) {
    const escaped=settings.pattern.split('').map(character=>String.fromCharCode(92)+'u'+character.charCodeAt(0).toString(16).padStart(4,'0')).join('');
    const pattern=new RegExp(escaped,'g'+(settings.caseSensitive?'':'i')), pieces=[]; let cursor=0,length=text.length,match;
    while((match=pattern.exec(text))) {
        length+=settings.replacement.length-match[0].length;
        if(length>100000)throw new Error('Output limit.');
        pieces.push(text.slice(cursor,match.index),settings.replacement); cursor=match.index+match[0].length;
        if(settings.occurrence==='first')break;
    }
    pieces.push(text.slice(cursor)); return pieces.join('');
}
function unwrapFence(text) {
    const parts=text.split(/(\r\n|\r|\n)/);
    const opening=/^(\x60{3,}|~{3,})(.*)$/.exec(parts[0]);
    if (!opening || !parts[1] || opening[1][0]===String.fromCharCode(96) && opening[2].includes(String.fromCharCode(96)))return text;
    const last=parts.length-1-(parts.at(-1)===''?2:0);
    const closing=new RegExp('^'+opening[1][0]+'{'+opening[1].length+',}[ '+String.fromCharCode(9)+']*$');
    if (last<2 || !closing.test(parts[last]))return text;
    for(let i=2;i<last;i+=2)if(closing.test(parts[i]))return text;
    return parts.slice(2,last).join('');
}
export function applyTextModifiers(text, modifiers = []) {
    const checked=validateModifiers(modifiers); if(!checked.ok)return checked;
    if(typeof text !== 'string' || text.length>100000)return fail('MODIFIER_TEXT_LIMIT','Modifier sources must be Text of at most 100,000 UTF-16 units.');
    const rawText = text, trace = [];
    try {
        for (const entry of checked.data.modifiers) {
            if (!entry.enabled) continue;
            const before = text;
            if (entry.type === 'trim') text = entry.settings.edges === 'start' ? text.trimStart() : entry.settings.edges === 'end' ? text.trimEnd() : text.trim();
            if (entry.type === 'whitespace') text = whitespace(text,entry.settings);
            if (entry.type === 'wrap') { if(text.length+entry.settings.prefix.length+entry.settings.suffix.length>100000)throw new Error('Output limit.'); text = entry.settings.prefix + text + entry.settings.suffix; }
            if (entry.type === 'replace') text = replaceLiteral(text,entry.settings);
            if (entry.type === 'unwrap-fence') text = unwrapFence(text);
            if(text.length>100000)throw new Error('Output limit.');
            trace.push({id:entry.id,type:entry.type,version:1,settings:entry.settings,beforeLength:before.length,afterLength:text.length,changed:before !== text});
        }
        return {ok:true,data:freeze({text,rawText,trace})};
    } catch { return fail('MODIFIER_OUTPUT_LIMIT','Each modifier output must fit 100,000 UTF-16 units.'); }
}
export function modifierSummary(modifiers = []) {
    const checked=validateModifiers(modifiers);
    const labels=checked.ok ? checked.data.modifiers.filter(entry=>entry.enabled).map(entry=>modifierTypes[entry.type].label) : [];
    return freeze({count:labels.length,labels,text:labels.join(' · ')});
}
