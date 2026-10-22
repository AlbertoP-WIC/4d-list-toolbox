const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements=new Map();function element(){return {value:'',checked:false,children:[],style:{},classList:{toggle(){}},append(...x){this.children.push(...x)},replaceChildren(...x){this.children=x},setAttribute(){},focus(){},select(){},click(){},showModal(){},close(){}};}
const context=vm.createContext({document:{getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id)},createElement:element},window:{addEventListener(){}},alert(m){throw Error(m)},confirm(){return true},console,Blob,URL,setTimeout});
vm.runInContext(fs.readFileSync(__dirname+'/dist/app.js','utf8'),context);
context.source=fs.readFileSync('/Users/albertopineda/Desktop/lists.json','utf8');
(async()=>{await vm.runInContext("load({name:'lists.json',text:async()=>source})",context);
assert.equal(vm.runInContext('Object.keys(data).length',context),103);assert.equal(vm.runInContext('Object.values(data).reduce((n,l)=>n+count(l),0)',context),1601);
assert.equal(vm.runInContext('output()',context),context.source);
vm.runInContext("list='Terms2';path=[0];change(()=>entry().text='TEST EDIT')",context);
let edited=JSON.parse(vm.runInContext('output()',context)),original=JSON.parse(context.source);assert.equal(edited.Terms2.items[0].text,'TEST EDIT');edited.Terms2.items[0].text=original.Terms2.items[0].text;assert.deepStrictEqual(edited,original);
vm.runInContext('restore(history,future)',context);assert.equal(vm.runInContext('output()',context),context.source);
vm.runInContext('restore(future,history)',context);assert.equal(vm.runInContext('entry().text',context),'TEST EDIT');
assert.throws(()=>vm.runInContext("validate({Bad:{items:'invalid'}})",context));
vm.runInContext("change(()=>entry().custom={retain:true});change(()=>entry().ref=17)",context);assert.equal(vm.runInContext('entry().custom.retain',context),true);
vm.runInContext("change(()=>entry().items=[{text:'Child',ref:90,editable:true}]);path=[0,0];change(()=>entry().text='Child edited')",context);assert.equal(vm.runInContext('data.Terms2.items[0].items[0].text',context),'Child edited');
context.written=null;context.disk=context.source;vm.runInContext('handle={getFile:async()=>({text:async()=>disk}),createWritable:async()=>({write:async t=>{written=t},close:async()=>{}})}',context);await vm.runInContext('save()',context);assert.equal(JSON.parse(context.written).Terms2.items[0].items[0].text,'Child edited');assert.equal(vm.runInContext('dirty()',context),false);
console.log('PASS: actual file import, 103 lists / 1601 entries, unchanged byte round-trip, isolated edit, undo/redo, unknown property preservation, nested edit, validation, and save.');})();
