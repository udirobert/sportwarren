"use strict";exports.id=2704,exports.ids=[2704],exports.modules={32354:(e,r,n)=>{n.d(r,{Z:()=>t});let t=(0,n(5670).Z)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]])},60840:(e,r,n)=>{n.d(r,{Z:()=>t});let t=(0,n(5670).Z)("copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]])},53036:(e,r,n)=>{n.d(r,{Z:()=>t});let t=(0,n(5670).Z)("lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]])},65144:(e,r,n)=>{n.d(r,{Z:()=>i});var t=n(26510);let i=t.forwardRef(function({title:e,titleId:r,...n},i){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:i,"aria-labelledby":r},n),e?t.createElement("title",{id:r},e):null,t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"}))})},35136:(e,r,n)=>{n.d(r,{Z:()=>i});var t=n(26510);let i=t.forwardRef(function({title:e,titleId:r,...n},i){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:i,"aria-labelledby":r},n),e?t.createElement("title",{id:r},e):null,t.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"}))})},56370:(e,r,n)=>{n.d(r,{Cr:()=>o,LH:()=>a,R1:()=>s});var t=n(10),i=n(91299);function s(e){return e?`${e.slice(0,5)}…${e.slice(-4)}`:""}function o({wei:e,precision:r=3}){return parseFloat((0,t.d)(e)).toFixed(r).replace(/0+$/,"").replace(/\.$/,"")}function a({amount:e,decimals:r}){return(0,i.b)(BigInt(e),r)}},62709:(e,r,n)=>{n.d(r,{A:()=>d});var t=n(4913),i=n(32354),s=n(60840),o=n(26510),a=n(96419),l=n(22554),c=n(38102);let d=({address:e,showCopyIcon:r,url:n,className:a})=>{let[d,p]=(0,o.useState)(!1);function m(r){r.stopPropagation(),navigator.clipboard.writeText(e).then(()=>p(!0)).catch(console.error)}return(0,o.useEffect)(()=>{if(d){let e=setTimeout(()=>p(!1),3e3);return()=>clearTimeout(e)}},[d]),(0,t.jsxs)(h,n?{children:[(0,t.jsx)(u,{title:e,className:a,href:`${n}/address/${e}`,target:"_blank",children:(0,l.w)(e)}),r&&(0,t.jsx)(c.S,{onClick:m,size:"sm",style:{gap:"0.375rem"},children:(0,t.jsxs)(t.Fragment,d?{children:["Copied",(0,t.jsx)(i.Z,{size:16})]}:{children:["Copy",(0,t.jsx)(s.Z,{size:16})]})})]}:{children:[(0,t.jsx)(x,{title:e,className:a,children:(0,l.w)(e)}),r&&(0,t.jsx)(c.S,{onClick:m,size:"sm",style:{gap:"0.375rem",fontSize:"14px"},children:(0,t.jsxs)(t.Fragment,d?{children:["Copied",(0,t.jsx)(i.Z,{size:14})]}:{children:["Copy",(0,t.jsx)(s.Z,{size:14})]})})]})},h=a.zo.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
`,x=a.zo.span`
  font-size: 14px;
  font-weight: 500;
  color: var(--privy-color-foreground);
`,u=a.zo.a`
  font-size: 14px;
  color: var(--privy-color-foreground);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`},85817:(e,r,n)=>{n.d(r,{C:()=>s});var t=n(4913),i=n(96419);let s=({className:e,checked:r,color:n="var(--privy-color-accent)",...i})=>(0,t.jsx)("label",{children:(0,t.jsxs)(o,{className:e,children:[(0,t.jsx)(l,{checked:r,...i}),(0,t.jsx)(c,{color:n,checked:r,children:(0,t.jsx)(a,{viewBox:"0 0 24 24",children:(0,t.jsx)("polyline",{points:"20 6 9 17 4 12"})})})]})});i.zo.label`
  && {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    text-align: left;
    border-radius: 0.5rem;
    border: 1px solid var(--privy-color-foreground-4);
    width: 100%;
  }
`;let o=i.zo.div`
  display: inline-block;
  vertical-align: middle;
`,a=i.zo.svg`
  fill: none;
  stroke: white;
  stroke-width: 3px;
`,l=i.zo.input.attrs({type:"checkbox"})`
  border: 0;
  clip: rect(0 0 0 0);
  clippath: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`,c=i.zo.div`
  display: inline-block;
  width: 18px;
  height: 18px;
  transition: all 150ms;
  cursor: pointer;
  border-color: ${e=>e.color};
  border-radius: 3px;
  background: ${e=>e.checked?e.color:"var(--privy-color-background)"};

  && {
    /* This is necessary to override css reset for border width */
    border-width: 1px;
  }

  ${l}:focus + & {
    box-shadow: 0 0 0 1px ${e=>e.color};
  }

  ${a} {
    visibility: ${e=>e.checked?"visible":"hidden"};
  }
`},61143:(e,r,n)=>{n.d(r,{E:()=>o});var t=n(4913),i=n(35136),s=n(96419);let o=({children:e,theme:r})=>(0,t.jsxs)(a,{$theme:r,children:[(0,t.jsx)(i.Z,{width:"20px",height:"20px",color:"var(--privy-color-icon-error)",strokeWidth:2,style:{flexShrink:0}}),(0,t.jsx)(l,{$theme:r,children:e})]}),a=s.zo.div`
  display: flex;
  gap: 0.75rem;
  background-color: var(--privy-color-error-bg);
  align-items: flex-start;
  padding: 1rem;
  border-radius: 0.75rem;
`,l=s.zo.div`
  color: ${e=>"dark"===e.$theme?"var(--privy-color-foreground-2)":"var(--privy-color-foreground)"};
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  flex: 1;
  text-align: left;
`},73993:(e,r,n)=>{n.d(r,{E:()=>i});var t=n(96419);let i=t.zo.span`
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.125rem; /* 150% */

  color: var(--privy-color-error);
`},91778:(e,r,n)=>{n.r(r),n.d(r,{ErrorScreen:()=>m,ErrorScreenView:()=>p,default:()=>m});var t=n(4913),i=n(84156);let s=(0,n(5670).Z)("phone",[["path",{d:"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",key:"9njp5v"}]]);var o=n(53036),a=n(96419),l=n(14348),c=n(45592),d=n(49171),h=n(55182),x=n(96071),u=n(77681);n(26510),n(50470),n(36577),n(46898),n(42330),n(84440);let p=({error:e,allowlistConfig:r,onRetry:n,onCaptchaReset:a,onBack:l})=>{let h=((e,r)=>{if(e instanceof x.R)return{title:"Transaction failed",detail:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("span",{children:e.message}),(0,t.jsxs)("span",{children:[" ","Check the"," ",(0,t.jsx)(g,{href:e.relayLink,target:"_blank",children:"refund status"}),"."]})]}),ctaText:"Try again",icon:i.Z};if(e instanceof d.b)switch(e.privyErrorCode){case d.c.CLIENT_REQUEST_TIMEOUT:return{title:"Timed out",detail:e.message,ctaText:"Try again",icon:i.Z};case d.c.INSUFFICIENT_BALANCE:return{title:"Insufficient balance",detail:e.message,ctaText:"Try again",icon:i.Z};case d.c.TRANSACTION_FAILURE:return{title:"Transaction failure",detail:e.message,ctaText:"Try again",icon:i.Z};default:return{title:"Something went wrong",detail:"Try again later",ctaText:"Try again",icon:i.Z}}else{if(e instanceof c.P&&"twilio_verification_failed"===e.type)return{title:"Something went wrong",detail:e.message,ctaText:"Try again",icon:s};if(!(e instanceof d.g))return e instanceof d.e&&e.status&&[400,422].includes(e.status)?{title:"Something went wrong",detail:e.message,ctaText:"Try again",icon:i.Z}:{title:"Something went wrong",detail:"Try again later",ctaText:"Try again",icon:i.Z};switch(e.privyErrorCode){case d.c.INVALID_CAPTCHA:return{title:"Something went wrong",detail:"Please try again.",ctaText:"Try again",icon:i.Z};case d.c.DISALLOWED_LOGIN_METHOD:return{title:"Not allowed",detail:e.message,ctaText:"Try another method",icon:i.Z};case d.c.ALLOWLIST_REJECTED:return{title:r.errorTitle||"You don't have access to this app",detail:r.errorDetail||"Have you been invited?",ctaText:r.errorCtaText||"Try another account",icon:o.Z};case d.c.CAPTCHA_FAILURE:return{title:"Something went wrong",detail:"You did not pass CAPTCHA. Please try again.",ctaText:"Try again",icon:null};case d.c.CAPTCHA_TIMEOUT:return{title:"Something went wrong",detail:"Something went wrong! Please try again later.",ctaText:"Try again",icon:null};case d.c.LINKED_TO_ANOTHER_USER:return{title:"Authentication failed",detail:"This account has already been linked to another user.",ctaText:"Try again",icon:i.Z};case d.c.NOT_SUPPORTED:return{title:"This region is not supported",detail:"SMS authentication from this region is not available",ctaText:"Try another method",icon:i.Z};case d.c.TOO_MANY_REQUESTS:return{title:"Request failed",detail:"Too many attempts.",ctaText:"Try again later",icon:i.Z};default:return{title:"Something went wrong",detail:"Try again later",ctaText:"Try again",icon:i.Z}}}})(e,r);return(0,t.jsx)(u.S,{title:h.title,subtitle:h.detail,icon:h.icon,onBack:l,iconVariant:"error",primaryCta:{label:h.ctaText,onClick:()=>{e instanceof d.g&&(e.privyErrorCode===d.c.INVALID_CAPTCHA&&a?.(),e.privyErrorCode===d.c.ALLOWLIST_REJECTED&&r.errorCtaLink)?window.location.href=r.errorCtaLink:n?.()},variant:"error"},watermark:!0})},m={component:()=>{let{navigate:e,data:r,lastScreen:n,currentScreen:i}=(0,h.a)(),s=(0,l.u)(),{reset:o}=(0,c.a)(),a=r?.errorModalData?.previousScreen||(n===i?void 0:n);return(0,t.jsx)(p,{error:r?.errorModalData?.error||Error(),allowlistConfig:s.allowlistConfig,onRetry:()=>{e(a||"LandingScreen",!1)},onCaptchaReset:o})}},g=a.zo.a`
  color: var(--privy-color-accent) !important;
  font-weight: 600;
`},59169:(e,r,n)=>{n.d(r,{L:()=>i});var t=n(96419);let i=t.zo.span`
  color: var(--privy-color-foreground-3);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.125rem; /* 150% */
`},66461:(e,r,n)=>{n.d(r,{L:()=>s});var t=n(96419);let i=(0,t.F4)`
  from, to {
    background: var(--privy-color-foreground-4);
    color: var(--privy-color-foreground-4);
  }

  50% {
    background: var(--privy-color-foreground-accent);
    color: var(--privy-color-foreground-accent);
  }
`,s=(0,t.iv)`
  ${e=>e.$isLoading?(0,t.iv)`
          width: 35%;
          animation: ${i} 2s linear infinite;
          border-radius: var(--privy-border-radius-sm);
        `:""}
`},51766:(e,r,n)=>{n.d(r,{R:()=>s,a:()=>i});var t=n(96419);let i=t.zo.span`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: 100%;
`,s=t.zo.span`
  display: flex;
  width: 100%;
  justify-content: space-between;
  gap: 0.5rem;
`},82145:(e,r,n)=>{n.d(r,{C:()=>o,S:()=>s});var t=n(4913),i=n(96419);let s=({title:e,description:r,children:n,...i})=>(0,t.jsx)(a,{...i,children:(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("h3",{children:e}),"string"==typeof r?(0,t.jsx)("p",{children:r}):r,n]})});(0,i.zo)(s)`
  margin-bottom: 24px;
`;let o=({title:e,description:r,icon:n,children:i,...s})=>(0,t.jsxs)(l,{...s,children:[n||null,(0,t.jsx)("h3",{children:e}),r&&"string"==typeof r?(0,t.jsx)("p",{children:r}):r,i]}),a=i.zo.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  text-align: left;
  gap: 8px;
  width: 100%;
  margin-bottom: 24px;

  && h3 {
    font-size: 17px;
    color: var(--privy-color-foreground);
  }

  /* Sugar assuming children are paragraphs. Otherwise, handling styling on your own */
  && p {
    color: var(--privy-color-foreground-2);
    font-size: 14px;
  }
`,l=(0,i.zo)(a)`
  align-items: center;
  text-align: center;
  gap: 16px;

  h3 {
    margin-bottom: 24px;
  }
`},83059:(e,r,n)=>{n.d(r,{S:()=>i});var t=n(96419);let i=t.zo.span`
  margin-top: 4px;
  color: var(--privy-color-foreground);
  text-align: center;

  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.375rem; /* 157.143% */

  && a {
    color: var(--privy-color-accent);
  }
`},59759:(e,r,n)=>{n.d(r,{T:()=>i});var t=n(96419);let i=t.zo.span`
  color: var(--privy-color-foreground);
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.875rem; /* 166.667% */
  text-align: center;
`},18013:(e,r,n)=>{n.d(r,{S:()=>H,T:()=>K,a:()=>_});var t=n(4913),i=n(26510);let s=i.forwardRef(function({title:e,titleId:r,...n},t){return i.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:t,"aria-labelledby":r},n),e?i.createElement("title",{id:r},e):null,i.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"}))});var o=n(88364);let a=i.forwardRef(function({title:e,titleId:r,...n},t){return i.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:t,"aria-labelledby":r},n),e?i.createElement("title",{id:r},e):null,i.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"}))});var l=n(96419),c=n(56370),d=n(38102),h=n(63622),x=n(51766),u=n(73993),p=n(59169),m=n(83059),g=n(59759),j=n(62709),f=n(18034),v=n(14348),y=n(13813),w=n(66461),k=n(24451),b=n(55276),T=n(85817),L=n(61143),A=n(49536),R=n(65144);let C=i.forwardRef(function({title:e,titleId:r,...n},t){return i.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:t,"aria-labelledby":r},n),e?i.createElement("title",{id:r},e):null,i.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z"}))});var S=n(35136),z=n(82849),E=n(49171);let I=(0,l.zo)(h.L)`
  cursor: pointer;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  color: var(--privy-color-accent);
  svg {
    fill: var(--privy-color-accent);
  }
`;var V=({iconUrl:e,value:r,symbol:n,usdValue:i,nftName:s,nftCount:o,decimals:a,$isLoading:l})=>{if(l)return(0,t.jsx)($,{$isLoading:l});let c=r&&i&&a?function(e,r,n){let t=parseFloat(e),i=parseFloat(n);if(0===t||0===i||Number.isNaN(t)||Number.isNaN(i))return e;let s=Math.ceil(-Math.log10(.01/(i/t))),o=Math.pow(10,s=Math.max(s=Math.min(s,r),1)),a=+(Math.floor(t*o)/o).toFixed(s).replace(/\.?0+$/,"");return Intl.NumberFormat(void 0,{maximumFractionDigits:r}).format(a)}(r,a,i):r;return(0,t.jsxs)("div",{children:[(0,t.jsxs)($,{$isLoading:l,children:[e&&(0,t.jsx)(N,{src:e,alt:"Token icon"}),o&&o>1?o+"x":void 0," ",s,c," ",n]}),i&&(0,t.jsxs)(M,{$isLoading:l,children:["$",i]})]})};let $=l.zo.span`
  color: var(--privy-color-foreground);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.375rem;
  word-break: break-all;
  text-align: right;
  display: flex;
  justify-content: flex-end;

  ${w.L}
`,M=l.zo.span`
  color: var(--privy-color-foreground-2);
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
  word-break: break-all;
  text-align: right;
  display: flex;
  justify-content: flex-end;

  ${w.L}
`,N=l.zo.img`
  height: 14px;
  width: 14px;
  margin-right: 4px;
  object-fit: contain;
`,O=e=>{let{chain:r,transactionDetails:n,isTokenContractInfoLoading:i,symbol:s}=e,{action:o,functionName:a}=n;return(0,t.jsx)(b.B,{children:(0,t.jsxs)(x.a,{children:["transaction"!==o&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Action"}),(0,t.jsx)(h.V,{children:a})]}),"mint"===a&&"args"in n&&n.args.filter(e=>e).map((e,n)=>(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:`Param ${n}`}),(0,t.jsx)(h.V,{children:"string"==typeof e&&(0,k.U)(e)?(0,t.jsx)(j.A,{address:e,url:r?.blockExplorers?.default?.url,showCopyIcon:!1}):e?.toString()})]},n)),"setApprovalForAll"===a&&n.operator&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Operator"}),(0,t.jsx)(h.V,{children:(0,t.jsx)(j.A,{address:n.operator,url:r?.blockExplorers?.default?.url,showCopyIcon:!1})})]}),"setApprovalForAll"===a&&void 0!==n.approved&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Set approval to"}),(0,t.jsx)(h.V,{children:n.approved?"true":"false"})]}),"transfer"===a||"transferWithMemo"===a||"transferFrom"===a||"safeTransferFrom"===a||"approve"===a?(0,t.jsxs)(t.Fragment,{children:["formattedAmount"in n&&n.formattedAmount&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Amount"}),(0,t.jsxs)(h.V,{$isLoading:i,children:[n.formattedAmount," ",s]})]}),"tokenId"in n&&n.tokenId&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Token ID"}),(0,t.jsx)(h.V,{children:n.tokenId.toString()})]})]}):null,"safeBatchTransferFrom"===a&&(0,t.jsxs)(t.Fragment,{children:["amounts"in n&&n.amounts&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Amounts"}),(0,t.jsx)(h.V,{children:n.amounts.join(", ")})]}),"tokenIds"in n&&n.tokenIds&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Token IDs"}),(0,t.jsx)(h.V,{children:n.tokenIds.join(", ")})]})]}),"approve"===a&&n.spender&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Spender"}),(0,t.jsx)(h.V,{children:(0,t.jsx)(j.A,{address:n.spender,url:r?.blockExplorers?.default?.url,showCopyIcon:!1})})]}),("transferFrom"===a||"safeTransferFrom"===a||"safeBatchTransferFrom"===a)&&n.transferFrom&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Transferring from"}),(0,t.jsx)(h.V,{children:(0,t.jsx)(j.A,{address:n.transferFrom,url:r?.blockExplorers?.default?.url,showCopyIcon:!1})})]}),("transferFrom"===a||"safeTransferFrom"===a||"safeBatchTransferFrom"===a)&&n.transferTo&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Transferring to"}),(0,t.jsx)(h.V,{children:(0,t.jsx)(j.A,{address:n.transferTo,url:r?.blockExplorers?.default?.url,showCopyIcon:!1})})]})]})})},F=({variant:e,setPreventMaliciousTransaction:r,colorScheme:n="light",preventMaliciousTransaction:i})=>"warn"===e?(0,t.jsx)(Z,{children:(0,t.jsxs)(A.W,{theme:n,children:[(0,t.jsx)("span",{style:{fontWeight:"500"},children:"Warning: Suspicious transaction"}),(0,t.jsx)("br",{}),"This has been flagged as a potentially deceptive request. Approving could put your assets or funds at risk."]})}):"error"===e?(0,t.jsx)(t.Fragment,{children:(0,t.jsxs)(Z,{children:[(0,t.jsx)(L.E,{theme:n,children:(0,t.jsxs)("div",{children:[(0,t.jsx)("strong",{children:"This is a malicious transaction"}),(0,t.jsx)("br",{}),"This transaction transfers tokens to a known malicious address. Proceeding may result in the loss of valuable assets."]})}),(0,t.jsxs)(D,{children:[(0,t.jsx)(T.C,{color:"var(--privy-color-error)",checked:!i,readOnly:!0,onClick:()=>r(!i)}),(0,t.jsx)("span",{children:"I understand and want to proceed anyways."})]})]})}):null,Z=l.zo.div`
  margin-top: 1.5rem;
`,D=l.zo.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
`,P=({transactionIndex:e,maxIndex:r})=>"number"!=typeof e||0===r?"":` (${e+1} / ${r+1})`,H=({img:e,submitError:r,prepareError:n,onClose:l,action:c,title:p,subtitle:f,to:w,tokenAddress:k,network:b,missingFunds:T,fee:L,from:A,cta:R,disabled:C,chain:S,isSubmitting:z,isPreparing:E,isTokenPriceLoading:$,isTokenContractInfoLoading:M,isSponsored:N,symbol:Z,balance:D,onClick:H,transactionDetails:_,transactionIndex:W,maxIndex:Q,onBack:Y,chainName:K,validation:X,hasScanDetails:ee,setIsScanDetailsOpen:er,preventMaliciousTransaction:en,setPreventMaliciousTransaction:et,tokensSent:ei,tokensReceived:es,isScanning:eo,isCancellable:ea,functionName:el})=>{let{showTransactionDetails:ec,setShowTransactionDetails:ed,hasMoreDetails:eh,isErc20Ish:ex}=(e=>{let[r,n]=(0,i.useState)(!1),t=!0,s=!1;return(!e||e.isErc20Ish||"transaction"===e.action)&&(t=!1),t&&(s=Object.entries(e||{}).some(([e,r])=>r&&!["action","isErc20Ish","isNFTIsh"].includes(e))),{showTransactionDetails:r,setShowTransactionDetails:n,hasMoreDetails:t&&s,isErc20Ish:e?.isErc20Ish}})(_),eu=(0,v.u)(),ep=ex&&M||E||$||eo;return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(d.M,{onClose:l,backFn:Y}),e&&(0,t.jsx)(q,{children:e}),(0,t.jsxs)(g.T,{style:{marginTop:e?"1.5rem":0},children:[p,(0,t.jsx)(P,{maxIndex:Q,transactionIndex:W})]}),(0,t.jsx)(m.S,{children:f}),(0,t.jsxs)(x.a,{style:{marginTop:"2rem"},children:[(!!ei[0]||ep)&&(0,t.jsxs)(x.R,{children:[es.length>0?(0,t.jsx)(h.L,{children:"Send"}):(0,t.jsx)(h.L,{children:"approve"===c?"Approval amount":"Amount"}),(0,t.jsx)("div",{className:"flex flex-col",children:ei.map((e,r)=>(0,t.jsx)(V,{iconUrl:e.iconUrl,value:"setApprovalForAll"===el?"All":e.value,usdValue:e.usdValue,symbol:e.symbol,nftName:e.nftName,nftCount:e.nftCount,decimals:e.decimals},r))})]}),es.length>0&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Receive"}),(0,t.jsx)("div",{className:"flex flex-col",children:es.map((e,r)=>(0,t.jsx)(V,{iconUrl:e.iconUrl,value:e.value,usdValue:e.usdValue,symbol:e.symbol,nftName:e.nftName,nftCount:e.nftCount,decimals:e.decimals},r))})]}),_&&"spender"in _&&_?.spender?(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Spender"}),(0,t.jsx)(h.V,{children:(0,t.jsx)(j.A,{address:_.spender,url:S?.blockExplorers?.default?.url})})]}):null,w&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"To"}),(0,t.jsx)(h.V,{children:(0,t.jsx)(j.A,{address:w,url:S?.blockExplorers?.default?.url,showCopyIcon:!0})})]}),k&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Token address"}),(0,t.jsx)(h.V,{children:(0,t.jsx)(j.A,{address:k,url:S?.blockExplorers?.default?.url})})]}),(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Network"}),(0,t.jsx)(h.V,{children:b})]}),(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Estimated fee"}),(0,t.jsx)(h.V,{$isLoading:E||$||void 0===N,children:N?(0,t.jsxs)(G,{children:[(0,t.jsxs)(J,{children:["Sponsored by ",eu.name]}),(0,t.jsx)(s,{height:16,width:16})]}):L})]}),eh&&!ee&&(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(x.R,{className:"cursor-pointer",onClick:()=>ed(!ec),children:(0,t.jsxs)(h.a,{className:"flex items-center gap-x-1",children:["Details"," ",(0,t.jsx)(o.Z,{style:{width:"0.75rem",marginLeft:"0.25rem",transform:ec?"rotate(180deg)":void 0}})]})}),ec&&_&&(0,t.jsx)(O,{action:c,chain:S,transactionDetails:_,isTokenContractInfoLoading:M,symbol:Z})]}),ee&&(0,t.jsx)(x.R,{children:(0,t.jsxs)(I,{onClick:()=>er(!0),children:[(0,t.jsx)("span",{className:"text-color-primary",children:"Details"}),(0,t.jsx)(a,{height:"14px",width:"14px",strokeWidth:"2"})]})})]}),(0,t.jsx)(y.G,{}),r?(0,t.jsx)(u.E,{style:{marginTop:"2rem"},children:r.message}):n&&0===W?(0,t.jsx)(u.E,{style:{marginTop:"2rem"},children:n.shortMessage??U}):null,(0,t.jsx)(F,{variant:X,preventMaliciousTransaction:en,setPreventMaliciousTransaction:et}),(0,t.jsx)(B,{$useSmallMargins:!(!n&&!r&&"warn"!==X&&"error"!==X),address:A,balance:D,errMsg:E||n||r||!T?void 0:`Add funds on ${S?.name??K} to complete transaction.`}),(0,t.jsx)(d.P,{style:{marginTop:"1rem"},loading:z,disabled:C||E,onClick:H,children:R}),ea&&(0,t.jsx)(d.E,{style:{marginTop:"1rem"},onClick:l,isSubmitting:!1,children:"Not now"}),(0,t.jsx)(d.B,{})]})},_=({img:e,title:r,subtitle:n,cta:a,instructions:l,network:f,blockExplorerUrl:w,isMissingFunds:k,submitError:b,parseError:T,total:L,swap:A,transactingWalletAddress:R,fee:C,balance:S,disabled:z,isSubmitting:E,isPreparing:V,isTokenPriceLoading:$,onClick:M,onClose:N,onBack:O,isSponsored:F})=>{let Z=V||$,[D,P]=(0,i.useState)(!1),H=(0,v.u)();return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(d.M,{onClose:N,backFn:O}),e&&(0,t.jsx)(q,{children:e}),(0,t.jsx)(g.T,{style:{marginTop:e?"1.5rem":0},children:r}),(0,t.jsx)(m.S,{children:n}),(0,t.jsxs)(x.a,{style:{marginTop:"2rem",marginBottom:".5rem"},children:[(L||Z)&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Amount"}),(0,t.jsx)(h.V,{$isLoading:Z,children:L})]}),A&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Swap"}),(0,t.jsx)(h.V,{children:A})]}),f&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Network"}),(0,t.jsx)(h.V,{children:f})]}),(C||Z||void 0!==F)&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Estimated fee"}),(0,t.jsx)(h.V,{$isLoading:Z,children:F&&!Z?(0,t.jsxs)(G,{children:[(0,t.jsxs)(J,{children:["Sponsored by ",H.name]}),(0,t.jsx)(s,{height:16,width:16})]}):C})]})]}),(0,t.jsx)(x.R,{children:(0,t.jsxs)(I,{onClick:()=>P(e=>!e),children:[(0,t.jsx)("span",{children:"Advanced"}),(0,t.jsx)(o.Z,{height:"16px",width:"16px",strokeWidth:"2",style:{transition:"all 300ms",transform:D?"rotate(180deg)":void 0}})]})}),D&&(0,t.jsx)(t.Fragment,{children:l.map((e,r)=>"sol-transfer"===e.type?(0,t.jsxs)(W,{children:[(0,t.jsx)(x.R,{children:(0,t.jsxs)(p.L,{children:["Transfer ",e.withSeed?"with seed":""]})}),(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Amount"}),(0,t.jsxs)(h.V,{children:[(0,c.LH)({amount:e.value,decimals:e.token.decimals})," ",e.token.symbol]})]}),!!e.toAccount&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Destination"}),(0,t.jsx)(h.V,{children:(0,t.jsx)(j.A,{address:e.toAccount,url:w})})]})]},r):"spl-transfer"===e.type?(0,t.jsxs)(W,{children:[(0,t.jsx)(x.R,{children:(0,t.jsxs)(p.L,{children:["Transfer ",e.token.symbol]})}),(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Amount"}),(0,t.jsx)(h.V,{children:e.value.toString()})]}),!!e.fromAta&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Source"}),(0,t.jsx)(h.V,{children:(0,t.jsx)(j.A,{address:e.fromAta,url:w})})]}),!!e.toAta&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Destination"}),(0,t.jsx)(h.V,{children:(0,t.jsx)(j.A,{address:e.toAta,url:w})})]}),!!e.token.address&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Token"}),(0,t.jsx)(h.V,{children:(0,t.jsx)(j.A,{address:e.token.address,url:w})})]})]},r):"ata-creation"===e.type?(0,t.jsxs)(W,{children:[(0,t.jsx)(x.R,{children:(0,t.jsx)(p.L,{children:"Create token account"})}),(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Program ID"}),(0,t.jsx)(h.V,{children:(0,t.jsx)(j.A,{address:e.program,url:w})})]}),!!e.owner&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Owner"}),(0,t.jsx)(h.V,{children:(0,t.jsx)(j.A,{address:e.owner,url:w})})]})]},r):"create-account"===e.type?(0,t.jsxs)(W,{children:[(0,t.jsx)(x.R,{children:(0,t.jsxs)(p.L,{children:["Create account ",e.withSeed?"with seed":""]})}),!!e.account&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Account"}),(0,t.jsx)(h.V,{children:(0,t.jsx)(j.A,{address:e.account,url:w})})]}),(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Amount"}),(0,t.jsxs)(h.V,{children:[(0,c.LH)({amount:e.value,decimals:9})," SOL"]})]})]},r):"spl-init-account"===e.type?(0,t.jsxs)(W,{children:[(0,t.jsx)(x.R,{children:(0,t.jsx)(p.L,{children:"Initialize token account"})}),!!e.account&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Account"}),(0,t.jsx)(h.V,{children:(0,t.jsx)(j.A,{address:e.account,url:w})})]}),!!e.mint&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Mint"}),(0,t.jsx)(h.V,{children:(0,t.jsx)(j.A,{address:e.mint,url:w})})]}),!!e.owner&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Owner"}),(0,t.jsx)(h.V,{children:(0,t.jsx)(j.A,{address:e.owner,url:w})})]})]},r):"spl-close-account"===e.type?(0,t.jsxs)(W,{children:[(0,t.jsx)(x.R,{children:(0,t.jsx)(p.L,{children:"Close token account"})}),!!e.source&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Source"}),(0,t.jsx)(h.V,{children:(0,t.jsx)(j.A,{address:e.source,url:w})})]}),!!e.destination&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Destination"}),(0,t.jsx)(h.V,{children:(0,t.jsx)(j.A,{address:e.destination,url:w})})]}),!!e.owner&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Owner"}),(0,t.jsx)(h.V,{children:(0,t.jsx)(j.A,{address:e.owner,url:w})})]})]},r):"spl-sync-native"===e.type?(0,t.jsxs)(W,{children:[(0,t.jsx)(x.R,{children:(0,t.jsx)(p.L,{children:"Sync native"})}),(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Program ID"}),(0,t.jsx)(h.V,{children:(0,t.jsx)(j.A,{address:e.program,url:w})})]})]},r):"raydium-swap-base-input"===e.type?(0,t.jsxs)(W,{children:[(0,t.jsx)(x.R,{children:(0,t.jsxs)(p.L,{children:["Raydium swap"," ",e.tokenIn&&e.tokenOut?`${e.tokenIn.symbol} → ${e.tokenOut.symbol}`:""]})}),(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Amount in"}),(0,t.jsx)(h.V,{children:e.amountIn.toString()})]}),(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Minimum amount out"}),(0,t.jsx)(h.V,{children:e.minimumAmountOut.toString()})]}),e.mintIn&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Token in"}),(0,t.jsx)(h.V,{children:(0,t.jsx)(j.A,{address:e.mintIn,url:w})})]}),e.mintOut&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Token out"}),(0,t.jsx)(h.V,{children:(0,t.jsx)(j.A,{address:e.mintOut,url:w})})]})]},r):"raydium-swap-base-output"===e.type?(0,t.jsxs)(W,{children:[(0,t.jsx)(x.R,{children:(0,t.jsxs)(p.L,{children:["Raydium swap"," ",e.tokenIn&&e.tokenOut?`${e.tokenIn.symbol} → ${e.tokenOut.symbol}`:""]})}),(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Max amount in"}),(0,t.jsx)(h.V,{children:e.maxAmountIn.toString()})]}),(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Amount out"}),(0,t.jsx)(h.V,{children:e.amountOut.toString()})]}),e.mintIn&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Token in"}),(0,t.jsx)(h.V,{children:(0,t.jsx)(j.A,{address:e.mintIn,url:w})})]}),e.mintOut&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Token out"}),(0,t.jsx)(h.V,{children:(0,t.jsx)(j.A,{address:e.mintOut,url:w})})]})]},r):"jupiter-swap-shared-accounts-route"===e.type?(0,t.jsxs)(W,{children:[(0,t.jsx)(x.R,{children:(0,t.jsxs)(p.L,{children:["Jupiter swap"," ",e.tokenIn&&e.tokenOut?`${e.tokenIn.symbol} → ${e.tokenOut.symbol}`:""]})}),(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"In amount"}),(0,t.jsx)(h.V,{children:e.inAmount.toString()})]}),(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Quoted out amount"}),(0,t.jsx)(h.V,{children:e.quotedOutAmount.toString()})]}),e.mintIn&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Token in"}),(0,t.jsx)(h.V,{children:(0,t.jsx)(j.A,{address:e.mintIn,url:w})})]}),e.mintOut&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Token out"}),(0,t.jsx)(h.V,{children:(0,t.jsx)(j.A,{address:e.mintOut,url:w})})]})]},r):"jupiter-swap-exact-out-route"===e.type?(0,t.jsxs)(W,{children:[(0,t.jsx)(x.R,{children:(0,t.jsxs)(p.L,{children:["Jupiter swap"," ",e.tokenIn&&e.tokenOut?`${e.tokenIn.symbol} → ${e.tokenOut.symbol}`:""]})}),(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Quoted in amount"}),(0,t.jsx)(h.V,{children:e.quotedInAmount.toString()})]}),(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Amount out"}),(0,t.jsx)(h.V,{children:e.outAmount.toString()})]}),e.mintIn&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Token in"}),(0,t.jsx)(h.V,{children:(0,t.jsx)(j.A,{address:e.mintIn,url:w})})]}),e.mintOut&&(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Token out"}),(0,t.jsx)(h.V,{children:(0,t.jsx)(j.A,{address:e.mintOut,url:w})})]})]},r):(0,t.jsxs)(W,{children:[(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Program ID"}),(0,t.jsx)(h.V,{children:(0,t.jsx)(j.A,{address:e.program,url:w})})]}),(0,t.jsxs)(x.R,{children:[(0,t.jsx)(h.L,{children:"Data"}),(0,t.jsx)(h.V,{children:e.discriminator})]})]},r))}),(0,t.jsx)(y.G,{}),b?(0,t.jsx)(u.E,{style:{marginTop:"2rem"},children:b.message}):T?(0,t.jsx)(u.E,{style:{marginTop:"2rem"},children:U}):null,(0,t.jsx)(B,{$useSmallMargins:!(!T&&!b),title:"",address:R,balance:S,errMsg:V||T||b||!k?void 0:"Add funds on Solana to complete transaction."}),(0,t.jsx)(d.P,{style:{marginTop:"1rem"},loading:E,disabled:z||V,onClick:M,children:a}),(0,t.jsx)(d.B,{})]})},B=(0,l.zo)(f.W)`
  ${e=>e.$useSmallMargins?"margin-top: 0.5rem;":"margin-top: 2rem;"}
`,W=(0,l.zo)(x.a)`
  margin-top: 0.5rem;
  border: 1px solid var(--privy-color-foreground-4);
  border-radius: var(--privy-border-radius-sm);
  padding: 0.5rem;
`,U="There was an error preparing your transaction. Your transaction request will likely fail.",q=l.zo.div`
  display: flex;
  width: 100%;
  justify-content: center;
  max-height: 40px;

  > img {
    object-fit: contain;
    border-radius: var(--privy-border-radius-sm);
  }
`,G=l.zo.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
`,J=l.zo.span`
  font-size: 14px;
  font-weight: 500;
  color: var(--privy-color-foreground);
`,Q=e=>e?.code===z.s.COMPLIANCE_BLOCKED,Y=()=>(0,t.jsxs)(en,{children:[(0,t.jsx)(ei,{}),(0,t.jsx)(et,{})]}),K=({transactionError:e,chainId:r,onClose:n,onRetry:s,chainType:o,transactionHash:a})=>{let{chains:l}=(0,E.u)(),[c,h]=(0,i.useState)(!1),{errorCode:x,errorMessage:u}=((e,r)=>{if("ethereum"===r)return Q(e)?{errorCode:"Transaction blocked",errorMessage:e.message}:{errorCode:e.details??e.message,errorMessage:e.shortMessage};let n=e.txSignature,t=e?.transactionMessage||"Something went wrong.";if(Array.isArray(e.logs)){let r=e.logs.find(e=>/insufficient (lamports|funds)/gi.test(e));r&&(t=r)}return{transactionHash:n,errorMessage:t}})(e,o),p=Q(e),m=(({chains:e,chainId:r,chainType:n,transactionHash:t})=>{var i;return"ethereum"===n?e.find(e=>e.id===r)?.blockExplorers?.default.url??"https://etherscan.io":(i=t||"",`https://explorer.solana.com/tx/${i}?chain=${r}`)})({chains:l,chainId:r,chainType:o,transactionHash:a});return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(d.M,{onClose:n}),(0,t.jsxs)(X,{children:[(0,t.jsx)(Y,{}),(0,t.jsx)(ee,{children:x}),(0,t.jsx)(er,{children:p?"This transaction cannot be completed.":"Please try again."}),(0,t.jsxs)(ea,{children:[(0,t.jsx)(eo,{children:"Error message"}),(0,t.jsx)(ec,{$clickable:!1,children:u})]}),a&&(0,t.jsxs)(ea,{children:[(0,t.jsx)(eo,{children:"Transaction hash"}),(0,t.jsxs)(el,{children:["Copy this hash to view details about the transaction on a"," ",(0,t.jsx)("u",{children:(0,t.jsx)("a",{href:m,children:"block explorer"})}),"."]}),(0,t.jsxs)(ec,{$clickable:!0,onClick:async()=>{await navigator.clipboard.writeText(a),h(!0)},children:[a,(0,t.jsx)(ex,{clicked:c})]})]}),!p&&(0,t.jsx)(es,{onClick:()=>s({resetNonce:!!a}),children:"Retry transaction"})]}),(0,t.jsx)(d.b,{})]})},X=l.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`,ee=l.zo.span`
  color: var(--privy-color-foreground);
  text-align: center;
  font-size: 1.125rem;
  font-weight: 500;
  line-height: 1.25rem; /* 111.111% */
  text-align: center;
  margin: 10px;
`,er=l.zo.span`
  margin-top: 4px;
  margin-bottom: 10px;
  color: var(--privy-color-foreground-3);
  text-align: center;

  font-size: 0.875rem;
  font-style: normal;
  font-weight: 400;
  line-height: 20px; /* 142.857% */
  letter-spacing: -0.008px;
`,en=l.zo.div`
  position: relative;
  width: 60px;
  height: 60px;
  margin: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
`,et=(0,l.zo)(S.Z)`
  position: absolute;
  width: 35px;
  height: 35px;
  color: var(--privy-color-error);
`,ei=l.zo.div`
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--privy-color-error);
  opacity: 0.1;
`,es=(0,l.zo)(d.P)`
  && {
    margin-top: 24px;
  }
  transition:
    color 350ms ease,
    background-color 350ms ease;
`,eo=l.zo.span`
  width: 100%;
  text-align: left;
  font-size: 0.825rem;
  color: var(--privy-color-foreground);
  padding: 4px;
`,ea=l.zo.div`
  width: 100%;
  margin: 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`,el=l.zo.text`
  position: relative;
  width: 100%;
  padding: 5px;
  font-size: 0.8rem;
  color: var(--privy-color-foreground-3);
  text-align: left;
  word-wrap: break-word;
`,ec=l.zo.span`
  position: relative;
  width: 100%;
  background-color: var(--privy-color-background-2);
  padding: 8px 12px;
  border-radius: 10px;
  margin-top: 5px;
  font-size: 14px;
  color: var(--privy-color-foreground-3);
  text-align: left;
  word-wrap: break-word;
  ${e=>e.$clickable&&"cursor: pointer;\n  transition: background-color 0.3s;\n  padding-right: 45px;\n\n  &:hover {\n    background-color: var(--privy-color-foreground-4);\n  }"}
`,ed=(0,l.zo)(C)`
  position: absolute;
  top: 13px;
  right: 13px;
  width: 24px;
  height: 24px;
`,eh=(0,l.zo)(R.Z)`
  position: absolute;
  top: 13px;
  right: 13px;
  width: 24px;
  height: 24px;
`,ex=({clicked:e})=>(0,t.jsx)(e?eh:ed,{})},63622:(e,r,n)=>{n.d(r,{L:()=>s,V:()=>a,a:()=>o});var t=n(96419),i=n(66461);let s=t.zo.span`
  color: var(--privy-color-foreground-3);
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.375rem; /* 157.143% */
`,o=(0,t.zo)(s)`
  color: var(--privy-color-accent);
`,a=t.zo.span`
  color: var(--privy-color-foreground);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.375rem; /* 157.143% */
  word-break: break-all;
  text-align: right;

  ${i.L}
`},18034:(e,r,n)=>{n.d(r,{W:()=>y});var t=n(4913),i=n(32354),s=n(60840),o=n(26510),a=n(96419),l=n(38102),c=n(73993),d=n(59169),h=n(62709),x=n(55276);let u=(0,a.zo)(x.B)`
  && {
    padding: 0.75rem;
    height: 56px;
  }
`,p=a.zo.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`,m=a.zo.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`,g=a.zo.div`
  font-size: 12px;
  line-height: 1rem;
  color: var(--privy-color-foreground-3);
`,j=(0,a.zo)(d.L)`
  text-align: left;
  margin-bottom: 0.5rem;
`,f=(0,a.zo)(c.E)`
  margin-top: 0.25rem;
`,v=(0,a.zo)(l.S)`
  && {
    gap: 0.375rem;
    font-size: 14px;
  }
`,y=({errMsg:e,balance:r,address:n,className:a,title:l,showCopyButton:c=!1})=>{let[d,x]=(0,o.useState)(!1);return(0,o.useEffect)(()=>{if(d){let e=setTimeout(()=>x(!1),3e3);return()=>clearTimeout(e)}},[d]),(0,t.jsxs)("div",{children:[l&&(0,t.jsx)(j,{children:l}),(0,t.jsx)(u,{className:a,$state:e?"error":void 0,children:(0,t.jsxs)(p,{children:[(0,t.jsxs)(m,{children:[(0,t.jsx)(h.A,{address:n,showCopyIcon:!1}),void 0!==r&&(0,t.jsx)(g,{children:r})]}),c&&(0,t.jsx)(v,{onClick:function(e){e.stopPropagation(),navigator.clipboard.writeText(n).then(()=>x(!0)).catch(console.error)},size:"sm",children:(0,t.jsxs)(t.Fragment,d?{children:["Copied",(0,t.jsx)(i.Z,{size:14})]}:{children:["Copy",(0,t.jsx)(s.Z,{size:14})]})})]})}),e&&(0,t.jsx)(f,{children:e})]})}},49536:(e,r,n)=>{n.d(r,{W:()=>o});var t=n(4913),i=n(22277),s=n(96419);let o=({children:e,theme:r,className:n})=>(0,t.jsxs)(a,{$theme:r,className:n,children:[(0,t.jsx)(i.Z,{width:"20px",height:"20px",color:"var(--privy-color-icon-warning)",strokeWidth:2,style:{flexShrink:0}}),(0,t.jsx)(l,{$theme:r,children:e})]}),a=s.zo.div`
  display: flex;
  gap: 0.75rem;
  background-color: var(--privy-color-warn-bg);
  align-items: flex-start;
  padding: 1rem;
  border-radius: 0.75rem;
`,l=s.zo.div`
  color: ${e=>"dark"===e.$theme?"var(--privy-color-foreground-2)":"var(--privy-color-foreground)"};
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  flex: 1;
  text-align: left;
`},96071:(e,r,n)=>{n.d(r,{R:()=>j,a:()=>u,b:()=>o,c:()=>s,d:()=>p,e:()=>a,g:()=>x,t:()=>c,u:()=>g});var t=n(26510),i=n(49171);let s=792703809,o="11111111111111111111111111111111",a="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",l="0x0000000000000000000000000000000000000000",c=({appId:e,originCurrency:r,destinationCurrency:n,...t})=>({tradeType:"EXPECTED_OUTPUT",originCurrency:r??l,destinationCurrency:n??l,referrer:`privy|${e}`,...t}),d="https://api.relay.link",h="https://api.testnets.relay.link",x=async({input:e,isTestnet:r})=>{let n=await fetch((r?h:d)+"/quote",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)}),t=await n.json();if(!(n.ok||"string"==typeof t.message&&t.message.startsWith("Invalid address")))throw console.error("Relay error:",t),Error(t.message??"Error fetching quote from relay");return t},u=e=>{let r=e.steps[0]?.items?.[0];if(r)return{from:r.data.from,to:r.data.to,value:Number(r.data.value),chainId:Number(r.data.chainId),data:r.data.data}},p=e=>e.steps.flatMap(e=>e.items?.filter(e=>"incomplete"===e.status)??[]).map(e=>({from:e.data.from,to:e.data.to,value:Number(e.data.value),chainId:Number(e.data.chainId),data:e.data.data}));async function m({transactionHash:e,isTestnet:r}){let n=await fetch((r?h:d)+"/requests/v2?hash="+e),t=await n.json();if(!n.ok){if("message"in t&&"string"==typeof t.message)throw Error(t.message);throw Error("Error fetching request from relay")}return t.requests.at(0)?.status??"pending"}function g({transactionHash:e,isTestnet:r,bridgingStatus:n,setBridgingStatus:i,onSuccess:s,onFailure:o}){(0,t.useEffect)(()=>{if(e&&n){if(["delayed","waiting","pending"].includes(n)){let n=setInterval(async()=>{try{let n=await m({transactionHash:e,isTestnet:r});i(n)}catch(e){console.error(e)}},1e3);return()=>clearInterval(n)}"success"===n?s({transactionHash:e}):["refund","failure"].includes(n)&&o({error:new j(e,r)})}},[n,e,r])}class j extends i.b{constructor(e,r){super("We were unable to complete the bridging transaction. Funds will be refunded on your wallet.",void 0,i.c.TRANSACTION_FAILURE),this.relayLink=r?`https://testnets.relay.link/transaction/${e}`:`https://relay.link/transaction/${e}`}}},55276:(e,r,n)=>{n.d(r,{B:()=>s,a:()=>i});var t=n(96419);let i=(0,t.iv)`
  && {
    border-width: 1px;
    padding: 0.5rem 1rem;
  }

  width: 100%;
  text-align: left;
  border: solid 1px var(--privy-color-foreground-4);
  border-radius: var(--privy-border-radius-md);
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${e=>"error"===e.$state?"\n        border-color: var(--privy-color-error);\n        background: var(--privy-color-error-bg);\n      ":""}
`,s=t.zo.div`
  ${i}
`}};