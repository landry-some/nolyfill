"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),Object.defineProperty(exports,"default",{enumerable:!0,get:function(){return r}});const e=require("@nolyfill/shared"),t=Promise.allSettled||function(e){let t=Promise.reject.bind(this),r=Promise.resolve.bind(this),i=Promise.all.bind(this);return i(Array.from(e).map(e=>{let i=r(e);try{return i.then(e=>({status:"fulfilled",value:e}),e=>({status:"rejected",reason:e}))}catch(e){return t(e)}}))},r=(0,e.defineEsShim)(t,!0,t.bind(Promise));
Object.assign(exports.default, exports);
module.exports = exports.default;
