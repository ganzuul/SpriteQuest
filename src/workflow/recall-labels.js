const labels={
 activation:{armed:'Manual queue',keyword:'Keyword',event:'Confirmed event',character:'Character presence','armed-or-keyword':'Manual queue or keyword','armed-or-event':'Manual queue or confirmed event','armed-or-character':'Manual queue or character presence'},
 uses:{'next-match':'Next matching generation','one-per-type':'Once for each generation type','until-disarmed':'Until cancelled'},
 consumeOn:{success:'Successful completion',accepted:'Accepted result'},
 target:{reply:'Reply',swipe:'Generated swipe',both:'Reply and generated swipe'},
};
const label=(kind,value)=>Object.hasOwn(labels[kind],value)?labels[kind][value]:'Unavailable';
export const recallActivationLabel=value=>label('activation',value);
export const recallUseLabel=value=>label('uses',value);
export const recallConsumeLabel=value=>label('consumeOn',value);
export const recallTargetLabel=value=>label('target',value);
export const recallControlLabel=(key,value)=>Object.hasOwn(labels,key)?label(key,value):null;
