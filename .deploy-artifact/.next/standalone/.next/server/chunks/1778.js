"use strict";exports.id=1778,exports.ids=[1778],exports.modules={53036:(e,r,t)=>{t.d(r,{Z:()=>i});let i=(0,t(5670).Z)("lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]])},91778:(e,r,t)=>{t.r(r),t.d(r,{ErrorScreen:()=>v,ErrorScreenView:()=>u,default:()=>v});var i=t(4913),a=t(84156);let n=(0,t(5670).Z)("phone",[["path",{d:"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",key:"9njp5v"}]]);var o=t(53036),s=t(96419),l=t(14348),c=t(45592),d=t(49171),p=t(55182),g=t(96071),h=t(77681);t(26510),t(50470),t(36577),t(46898),t(42330),t(84440);let u=({error:e,allowlistConfig:r,onRetry:t,onCaptchaReset:s,onBack:l})=>{let p=((e,r)=>{if(e instanceof g.R)return{title:"Transaction failed",detail:(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)("span",{children:e.message}),(0,i.jsxs)("span",{children:[" ","Check the"," ",(0,i.jsx)(x,{href:e.relayLink,target:"_blank",children:"refund status"}),"."]})]}),ctaText:"Try again",icon:a.Z};if(e instanceof d.b)switch(e.privyErrorCode){case d.c.CLIENT_REQUEST_TIMEOUT:return{title:"Timed out",detail:e.message,ctaText:"Try again",icon:a.Z};case d.c.INSUFFICIENT_BALANCE:return{title:"Insufficient balance",detail:e.message,ctaText:"Try again",icon:a.Z};case d.c.TRANSACTION_FAILURE:return{title:"Transaction failure",detail:e.message,ctaText:"Try again",icon:a.Z};default:return{title:"Something went wrong",detail:"Try again later",ctaText:"Try again",icon:a.Z}}else{if(e instanceof c.P&&"twilio_verification_failed"===e.type)return{title:"Something went wrong",detail:e.message,ctaText:"Try again",icon:n};if(!(e instanceof d.g))return e instanceof d.e&&e.status&&[400,422].includes(e.status)?{title:"Something went wrong",detail:e.message,ctaText:"Try again",icon:a.Z}:{title:"Something went wrong",detail:"Try again later",ctaText:"Try again",icon:a.Z};switch(e.privyErrorCode){case d.c.INVALID_CAPTCHA:return{title:"Something went wrong",detail:"Please try again.",ctaText:"Try again",icon:a.Z};case d.c.DISALLOWED_LOGIN_METHOD:return{title:"Not allowed",detail:e.message,ctaText:"Try another method",icon:a.Z};case d.c.ALLOWLIST_REJECTED:return{title:r.errorTitle||"You don't have access to this app",detail:r.errorDetail||"Have you been invited?",ctaText:r.errorCtaText||"Try another account",icon:o.Z};case d.c.CAPTCHA_FAILURE:return{title:"Something went wrong",detail:"You did not pass CAPTCHA. Please try again.",ctaText:"Try again",icon:null};case d.c.CAPTCHA_TIMEOUT:return{title:"Something went wrong",detail:"Something went wrong! Please try again later.",ctaText:"Try again",icon:null};case d.c.LINKED_TO_ANOTHER_USER:return{title:"Authentication failed",detail:"This account has already been linked to another user.",ctaText:"Try again",icon:a.Z};case d.c.NOT_SUPPORTED:return{title:"This region is not supported",detail:"SMS authentication from this region is not available",ctaText:"Try another method",icon:a.Z};case d.c.TOO_MANY_REQUESTS:return{title:"Request failed",detail:"Too many attempts.",ctaText:"Try again later",icon:a.Z};default:return{title:"Something went wrong",detail:"Try again later",ctaText:"Try again",icon:a.Z}}}})(e,r);return(0,i.jsx)(h.S,{title:p.title,subtitle:p.detail,icon:p.icon,onBack:l,iconVariant:"error",primaryCta:{label:p.ctaText,onClick:()=>{e instanceof d.g&&(e.privyErrorCode===d.c.INVALID_CAPTCHA&&s?.(),e.privyErrorCode===d.c.ALLOWLIST_REJECTED&&r.errorCtaLink)?window.location.href=r.errorCtaLink:t?.()},variant:"error"},watermark:!0})},v={component:()=>{let{navigate:e,data:r,lastScreen:t,currentScreen:a}=(0,p.a)(),n=(0,l.u)(),{reset:o}=(0,c.a)(),s=r?.errorModalData?.previousScreen||(t===a?void 0:t);return(0,i.jsx)(u,{error:r?.errorModalData?.error||Error(),allowlistConfig:n.allowlistConfig,onRetry:()=>{e(s||"LandingScreen",!1)},onCaptchaReset:o})}},x=s.zo.a`
  color: var(--privy-color-accent) !important;
  font-weight: 600;
`},17846:(e,r,t)=>{t.d(r,{S:()=>T});var i=t(4913),a=t(26510),n=t(96419),o=t(13813),s=t(38102),l=t(90684);let c=n.zo.div`
  /* spacing tokens */
  --screen-space: 16px; /* base 1x = 16 */
  --screen-space-lg: calc(var(--screen-space) * 1.5); /* 24px */

  position: relative;
  overflow: hidden;
  margin: 0 calc(-1 * var(--screen-space)); /* extends over modal padding */
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,d=n.zo.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) * 1.5);
  width: 100%;
  background: var(--privy-color-background);
  padding: 0 var(--screen-space-lg) var(--screen-space);
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,p=n.zo.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,g=(0,n.zo)(s.M)`
  margin: 0 -8px;
`,h=n.zo.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;

  /* Enable scrolling */
  overflow-y: auto;

  /* Hide scrollbar but keep functionality when scrollable */
  /* Add padding for focus outline space, offset with negative margin */
  padding: 3px;
  margin: -3px;

  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-gutter: stable both-edges;
  scrollbar-width: none;
  -ms-overflow-style: none;

  /* Gradient effect for scroll indication */
  ${({$colorScheme:e})=>"light"===e?"background: linear-gradient(var(--privy-color-background), var(--privy-color-background) 70%) bottom, linear-gradient(rgba(0, 0, 0, 0) 20%, rgba(0, 0, 0, 0.06)) bottom;":"dark"===e?"background: linear-gradient(var(--privy-color-background), var(--privy-color-background) 70%) bottom, linear-gradient(rgba(255, 255, 255, 0) 20%, rgba(255, 255, 255, 0.06)) bottom;":void 0}

  background-repeat: no-repeat;
  background-size:
    100% 32px,
    100% 16px;
  background-attachment: local, scroll;
`,u=n.zo.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,v=n.zo.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,x=n.zo.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,f=n.zo.h3`
  && {
    font-size: 20px;
    line-height: 32px;
    font-weight: 500;
    color: var(--privy-color-foreground);
    margin: 0;
  }
`,y=n.zo.p`
  && {
    margin: 0;
    font-size: 16px;
    font-weight: 300;
    line-height: 24px;
    color: var(--privy-color-foreground);
  }
`,m=n.zo.div`
  background: ${({$variant:e})=>{switch(e){case"success":return"var(--privy-color-success-bg, #EAFCEF)";case"warning":return"var(--privy-color-warn, #FEF3C7)";case"error":return"var(--privy-color-error-bg, #FEE2E2)";case"loading":case"logo":return"transparent";default:return"var(--privy-color-background-2)"}}};

  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
`,b=n.zo.div`
  display: flex;
  align-items: center;
  justify-content: center;

  img,
  svg {
    max-height: 90px;
    max-width: 180px;
  }
`,w=n.zo.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 82px;

  > div {
    position: relative;
  }

  > div > :first-child {
    position: relative;
  }

  > div > :last-child {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
`,T=({children:e,...r})=>(0,i.jsx)(c,{children:(0,i.jsx)(d,{...r,children:e})}),j=n.zo.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,E=(0,n.zo)(s.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,k=n.zo.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,S=({step:e})=>e?(0,i.jsx)(j,{children:(0,i.jsx)(k,{pct:Math.min(100,e.current/e.total*100)})}):null;T.Header=({title:e,subtitle:r,icon:t,iconVariant:a,iconLoadingStatus:n,showBack:o,onBack:s,showInfo:l,onInfo:c,showClose:d,onClose:h,step:u,headerTitle:m,...b})=>(0,i.jsxs)(p,{...b,children:[(0,i.jsx)(g,{backFn:o?s:void 0,infoFn:l?c:void 0,onClose:d?h:void 0,title:m,closeable:d}),(t||a||e||r)&&(0,i.jsxs)(v,{children:[t||a?(0,i.jsx)(T.Icon,{icon:t,variant:a,loadingStatus:n}):null,!(!e&&!r)&&(0,i.jsxs)(x,{children:[e&&(0,i.jsx)(f,{children:e}),r&&(0,i.jsx)(y,{children:r})]})]}),u&&(0,i.jsx)(S,{step:u})]}),(T.Body=a.forwardRef(({children:e,...r},t)=>(0,i.jsx)(h,{ref:t,...r,children:e}))).displayName="Screen.Body",T.Footer=({children:e,...r})=>(0,i.jsx)(u,{id:"privy-content-footer-container",...r,children:e}),T.Actions=({children:e,...r})=>(0,i.jsx)(z,{...r,children:e}),T.HelpText=({children:e,...r})=>(0,i.jsx)(C,{...r,children:e}),T.FooterText=({children:e,...r})=>(0,i.jsx)(I,{...r,children:e}),T.Watermark=()=>(0,i.jsx)(E,{}),T.Icon=({icon:e,variant:r="subtle",loadingStatus:t})=>"logo"===r&&e?(0,i.jsx)(b,"string"==typeof e?{children:(0,i.jsx)("img",{src:e,alt:""})}:a.isValidElement(e)?{children:e}:{children:a.createElement(e)}):"loading"===r?e?(0,i.jsx)(w,{children:(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,i.jsx)(o.N,{success:t?.success,fail:t?.fail}),"string"==typeof e?(0,i.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):a.isValidElement(e)?a.cloneElement(e,{style:{width:"38px",height:"38px"}}):a.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,i.jsx)(m,{$variant:r,children:(0,i.jsx)(l.N,{size:"64px"})}):(0,i.jsx)(m,{$variant:r,children:e&&("string"==typeof e?(0,i.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):a.isValidElement(e)?e:a.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let z=n.zo.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,C=n.zo.div`
  && {
    margin: 0;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 13px;
    line-height: 20px;

    & a {
      text-decoration: underline;
    }
  }
`,I=n.zo.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; // 11px
    line-height: 1rem; // 16px
  }
`},77681:(e,r,t)=>{t.d(r,{S:()=>o});var i=t(4913),a=t(38102),n=t(17846);let o=({primaryCta:e,secondaryCta:r,helpText:t,footerText:o,watermark:s=!0,children:l,...c})=>{let d=e||r?(0,i.jsxs)(i.Fragment,{children:[e&&(()=>{let{label:r,...t}=e,n=t.variant||"primary";return(0,i.jsx)(a.a,{...t,variant:n,style:{width:"100%",...t.style},children:r})})(),r&&(()=>{let{label:e,...t}=r,n=t.variant||"secondary";return(0,i.jsx)(a.a,{...t,variant:n,style:{width:"100%",...t.style},children:e})})()]}):null;return(0,i.jsxs)(n.S,{id:c.id,className:c.className,children:[(0,i.jsx)(n.S.Header,{...c}),l?(0,i.jsx)(n.S.Body,{children:l}):null,t||d||s?(0,i.jsxs)(n.S.Footer,{children:[t?(0,i.jsx)(n.S.HelpText,{children:t}):null,d?(0,i.jsx)(n.S.Actions,{children:d}):null,s?(0,i.jsx)(n.S.Watermark,{}):null]}):null,o?(0,i.jsx)(n.S.FooterText,{children:o}):null]})}},90684:(e,r,t)=>{t.d(r,{N:()=>n});var i=t(4913),a=t(96419);let n=({size:e,centerIcon:r})=>(0,i.jsx)(o,{$size:e,children:(0,i.jsxs)(s,{children:[(0,i.jsx)(c,{}),(0,i.jsx)(d,{}),r?(0,i.jsx)(l,{children:r}):null]})}),o=a.zo.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,s=a.zo.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,l=a.zo.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  svg,
  img {
    width: calc(var(--spinner-size) * 0.4);
    height: calc(var(--spinner-size) * 0.4);
    border-radius: var(--privy-border-radius-full);
  }
`,c=a.zo.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: var(--spinner-size);
  height: var(--spinner-size);

  && {
    border: 4px solid var(--privy-color-border-default);
    border-radius: 50%;
  }
`,d=a.zo.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: var(--spinner-size);
  height: var(--spinner-size);
  animation: spin 1200ms linear infinite;

  && {
    border: 4px solid;
    border-color: var(--privy-color-icon-subtle) transparent transparent transparent;
    border-radius: 50%;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`},96071:(e,r,t)=>{t.d(r,{R:()=>f,a:()=>h,b:()=>o,c:()=>n,d:()=>u,e:()=>s,g:()=>g,t:()=>c,u:()=>x});var i=t(26510),a=t(49171);let n=792703809,o="11111111111111111111111111111111",s="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",l="0x0000000000000000000000000000000000000000",c=({appId:e,originCurrency:r,destinationCurrency:t,...i})=>({tradeType:"EXPECTED_OUTPUT",originCurrency:r??l,destinationCurrency:t??l,referrer:`privy|${e}`,...i}),d="https://api.relay.link",p="https://api.testnets.relay.link",g=async({input:e,isTestnet:r})=>{let t=await fetch((r?p:d)+"/quote",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)}),i=await t.json();if(!(t.ok||"string"==typeof i.message&&i.message.startsWith("Invalid address")))throw console.error("Relay error:",i),Error(i.message??"Error fetching quote from relay");return i},h=e=>{let r=e.steps[0]?.items?.[0];if(r)return{from:r.data.from,to:r.data.to,value:Number(r.data.value),chainId:Number(r.data.chainId),data:r.data.data}},u=e=>e.steps.flatMap(e=>e.items?.filter(e=>"incomplete"===e.status)??[]).map(e=>({from:e.data.from,to:e.data.to,value:Number(e.data.value),chainId:Number(e.data.chainId),data:e.data.data}));async function v({transactionHash:e,isTestnet:r}){let t=await fetch((r?p:d)+"/requests/v2?hash="+e),i=await t.json();if(!t.ok){if("message"in i&&"string"==typeof i.message)throw Error(i.message);throw Error("Error fetching request from relay")}return i.requests.at(0)?.status??"pending"}function x({transactionHash:e,isTestnet:r,bridgingStatus:t,setBridgingStatus:a,onSuccess:n,onFailure:o}){(0,i.useEffect)(()=>{if(e&&t){if(["delayed","waiting","pending"].includes(t)){let t=setInterval(async()=>{try{let t=await v({transactionHash:e,isTestnet:r});a(t)}catch(e){console.error(e)}},1e3);return()=>clearInterval(t)}"success"===t?n({transactionHash:e}):["refund","failure"].includes(t)&&o({error:new f(e,r)})}},[t,e,r])}class f extends a.b{constructor(e,r){super("We were unable to complete the bridging transaction. Funds will be refunded on your wallet.",void 0,a.c.TRANSACTION_FAILURE),this.relayLink=r?`https://testnets.relay.link/transaction/${e}`:`https://relay.link/transaction/${e}`}}}};