var f=Object.defineProperty;var h=(o,e,s)=>e in o?f(o,e,{enumerable:!0,configurable:!0,writable:!0,value:s}):o[e]=s;var u=(o,e,s)=>(h(o,typeof e!="symbol"?e+"":e,s),s);import{defineComponent as d,ref as g,openBlock as p,createElementBlock as m,createElementVNode as i,toDisplayString as a,Fragment as _,createVNode as v,pushScopeId as w,popScopeId as y,createApp as L}from"vue";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))r(t);new MutationObserver(t=>{for(const n of t)if(n.type==="childList")for(const c of n.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&r(c)}).observe(document,{childList:!0,subtree:!0});function s(t){const n={};return t.integrity&&(n.integrity=t.integrity),t.referrerPolicy&&(n.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?n.credentials="include":t.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function r(t){if(t.ep)return;t.ep=!0;const n=s(t);fetch(t.href,n)}})();const M="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20aria-hidden='true'%20role='img'%20class='iconify%20iconify--logos'%20width='37.07'%20height='36'%20preserveAspectRatio='xMidYMid%20meet'%20viewBox='0%200%20256%20198'%3e%3cpath%20fill='%2341B883'%20d='M204.8%200H256L128%20220.8L0%200h97.92L128%2051.2L157.44%200h47.36Z'%3e%3c/path%3e%3cpath%20fill='%2341B883'%20d='m0%200l128%20220.8L256%200h-51.2L128%20132.48L50.56%200H0Z'%3e%3c/path%3e%3cpath%20fill='%2335495E'%20d='M50.56%200L128%20133.12L204.8%200h-47.36L128%2051.2L97.92%200H50.56Z'%3e%3c/path%3e%3c/svg%3e",P={class:"card"},b=d({__name:"HelloWorld",props:{msg:{},desc:{}},setup(o){const e=g(0);return(s,r)=>(p(),m("div",P,[i("h1",null,a(s.msg),1),i("p",null,a(s.desc),1),i("button",{type:"button",onClick:r[0]||(r[0]=t=>e.value++)},"count is "+a(e.value),1)]))}}),x=o=>(w("data-v-17ea096f"),o=o(),y(),o),E=x(()=>i("div",{class:"card"},[i("img",{src:M,class:"logo vue",alt:"Vue logo"})],-1)),O=d({__name:"App",setup(o){return(e,s)=>(p(),m(_,null,[E,v(b,{msg:"Page Module",desc:"This module is built with Vue. And uses the global shared vue-module from webdocker"})],64))}}),S=(o,e)=>{const s=o.__vccOpts||o;for(const[r,t]of e)s[r]=t;return s},A=S(O,[["__scopeId","data-v-17ea096f"]]),l="page-module-share-vue";class N extends HTMLElement{constructor(){super(...arguments);u(this,"app",null);u(this,"mountPoint",null)}connectedCallback(){this.mountPoint=document.querySelector(l),this.setup()}setup(){this.app&&this.app.unmount(),this.mountPoint?(this.app=L(A),this.app.mount(this.mountPoint),console.log("page-module-share-vue: Mounted")):console.log("page-module-share-vue: Mount point not found")}}window.customElements.get(l)?console.warn(`${l}: Custom element already defined`):window.customElements.define(l,N);