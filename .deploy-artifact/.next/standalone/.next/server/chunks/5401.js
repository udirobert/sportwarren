"use strict";exports.id=5401,exports.ids=[5401],exports.modules={94749:(e,r,t)=>{t.d(r,{Z:()=>i});let i=(0,t(5670).Z)("circle-x",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]])},25401:(e,r,t)=>{t.r(r),t.d(r,{EmbeddedWalletOnAccountCreateScreen:()=>g,EmbeddedWalletOnAccountCreateView:()=>h,default:()=>g});var i=t(4913),a=t(94749),n=t(26510);async function o(e,r){let t=`${e}-auto-${"ethereum"===r?"eth":"sol"}`,i=(new TextEncoder).encode(t);return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",i))).map(e=>e.toString(16).padStart(2,"0")).join("")}var l=t(14348),s=t(45592),c=t(49171),d=t(55182),p=t(16820),u=t(77681);t(50470),t(36577),t(46898),t(42330),t(84440);let h=({errorMessage:e,onClose:r})=>(0,i.jsx)(u.S,e?{title:"Something went wrong",subtitle:e,icon:a.Z,iconVariant:"error",primaryCta:{label:"Close",onClick:r},watermark:!0}:{title:"Creating your wallet",subtitle:"Please wait...",iconVariant:"loading",watermark:!1}),g={component:()=>{let{setModalData:e,navigate:r,data:t,onUserCloseViaDialogOrKeybindRef:a}=(0,d.a)(),u=(0,l.u)(),[g,v]=(0,n.useState)(""),{embeddedWallets:x}=(0,l.u)(),{authenticated:m,user:y}=(0,d.u)(),{closePrivyModal:f,walletProxy:b,client:w}=(0,c.u)(),{onSuccess:j,onFailure:z,callAuthOnSuccessOnClose:k,shouldCreateEth:S,shouldCreateSol:C}=t.createWallet,E=(0,p.u)(),A=y?E(s.A)?.shouldCreateWallet({user:y}):void 0,W=!!y&&(0,s.s)(y,u.embeddedWallets.ethereum.createOnLogin,A),F=!!y&&(0,s.k)(y,u.embeddedWallets.solana.createOnLogin,A),O="legacy-embedded-wallets-only"===u.embeddedWallets.mode&&!0===u?.embeddedWallets.requireUserOwnedRecoveryOnCreate,[$,T]=(0,n.useState)(null),{create:I}=(0,s.o)(),R=S??W,U=C??F,V=new s.R(async()=>{let e=await w.getAccessToken();if(y&&e&&b)try{let e,t=await o(y.id,"ethereum"),i=await o(y.id,"solana");if(R&&U)e=await I({chainType:"ethereum",walletIndex:0,latestUser:y,idempotencyKey:t}),e=await I({chainType:"solana",walletIndex:0,latestUser:e.user,idempotencyKey:i});else if(U)e=await I({chainType:"solana",walletIndex:0,latestUser:y,idempotencyKey:i});else{if(!R)return void f({shouldCallAuthOnSuccess:k});e=await I({chainType:"ethereum",walletIndex:0,latestUser:y,idempotencyKey:t})}T(e),r("EmbeddedWalletCreatedScreen")}catch(e){v(e.message)}});return(0,n.useEffect)(()=>m&&y?O?(e({...t,createWallet:{...t.createWallet,shouldCreateEth:R,shouldCreateSol:U},recoverySelection:{...t?.recoverySelection,isInAccountCreateFlow:!0,shouldCreateEth:R,shouldCreateSol:U}}),r((0,s.D)({walletAction:"create",showAutomaticRecovery:!1,availableRecoveryMethods:x.userOwnedRecoveryOptions,legacySetWalletPasswordFlow:!1,isResettingPassword:!1}))):void V.execute():(r("LandingScreen"),void z(Error("User must be authenticated before creating a Privy wallet"))),[O,m]),a.current=()=>null,(0,i.jsx)(h,{errorMessage:g||void 0,onClose:()=>{$?(j($),f({shouldCallAuthOnSuccess:k})):(z(new c.m("User wallet creation failed")),f({shouldCallAuthOnSuccess:!1}))}})}}},17846:(e,r,t)=>{t.d(r,{S:()=>j});var i=t(4913),a=t(26510),n=t(96419),o=t(13813),l=t(38102),s=t(90684);let c=n.zo.div`
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
`,u=(0,n.zo)(l.M)`
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
`,g=n.zo.div`
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
`,m=n.zo.h3`
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
`,f=n.zo.div`
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
`,j=({children:e,...r})=>(0,i.jsx)(c,{children:(0,i.jsx)(d,{...r,children:e})}),z=n.zo.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,k=(0,n.zo)(l.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,S=n.zo.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,C=({step:e})=>e?(0,i.jsx)(z,{children:(0,i.jsx)(S,{pct:Math.min(100,e.current/e.total*100)})}):null;j.Header=({title:e,subtitle:r,icon:t,iconVariant:a,iconLoadingStatus:n,showBack:o,onBack:l,showInfo:s,onInfo:c,showClose:d,onClose:h,step:g,headerTitle:f,...b})=>(0,i.jsxs)(p,{...b,children:[(0,i.jsx)(u,{backFn:o?l:void 0,infoFn:s?c:void 0,onClose:d?h:void 0,title:f,closeable:d}),(t||a||e||r)&&(0,i.jsxs)(v,{children:[t||a?(0,i.jsx)(j.Icon,{icon:t,variant:a,loadingStatus:n}):null,!(!e&&!r)&&(0,i.jsxs)(x,{children:[e&&(0,i.jsx)(m,{children:e}),r&&(0,i.jsx)(y,{children:r})]})]}),g&&(0,i.jsx)(C,{step:g})]}),(j.Body=a.forwardRef(({children:e,...r},t)=>(0,i.jsx)(h,{ref:t,...r,children:e}))).displayName="Screen.Body",j.Footer=({children:e,...r})=>(0,i.jsx)(g,{id:"privy-content-footer-container",...r,children:e}),j.Actions=({children:e,...r})=>(0,i.jsx)(E,{...r,children:e}),j.HelpText=({children:e,...r})=>(0,i.jsx)(A,{...r,children:e}),j.FooterText=({children:e,...r})=>(0,i.jsx)(W,{...r,children:e}),j.Watermark=()=>(0,i.jsx)(k,{}),j.Icon=({icon:e,variant:r="subtle",loadingStatus:t})=>"logo"===r&&e?(0,i.jsx)(b,"string"==typeof e?{children:(0,i.jsx)("img",{src:e,alt:""})}:a.isValidElement(e)?{children:e}:{children:a.createElement(e)}):"loading"===r?e?(0,i.jsx)(w,{children:(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,i.jsx)(o.N,{success:t?.success,fail:t?.fail}),"string"==typeof e?(0,i.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):a.isValidElement(e)?a.cloneElement(e,{style:{width:"38px",height:"38px"}}):a.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,i.jsx)(f,{$variant:r,children:(0,i.jsx)(s.N,{size:"64px"})}):(0,i.jsx)(f,{$variant:r,children:e&&("string"==typeof e?(0,i.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):a.isValidElement(e)?e:a.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let E=n.zo.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,A=n.zo.div`
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
`,W=n.zo.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; // 11px
    line-height: 1rem; // 16px
  }
`},77681:(e,r,t)=>{t.d(r,{S:()=>o});var i=t(4913),a=t(38102),n=t(17846);let o=({primaryCta:e,secondaryCta:r,helpText:t,footerText:o,watermark:l=!0,children:s,...c})=>{let d=e||r?(0,i.jsxs)(i.Fragment,{children:[e&&(()=>{let{label:r,...t}=e,n=t.variant||"primary";return(0,i.jsx)(a.a,{...t,variant:n,style:{width:"100%",...t.style},children:r})})(),r&&(()=>{let{label:e,...t}=r,n=t.variant||"secondary";return(0,i.jsx)(a.a,{...t,variant:n,style:{width:"100%",...t.style},children:e})})()]}):null;return(0,i.jsxs)(n.S,{id:c.id,className:c.className,children:[(0,i.jsx)(n.S.Header,{...c}),s?(0,i.jsx)(n.S.Body,{children:s}):null,t||d||l?(0,i.jsxs)(n.S.Footer,{children:[t?(0,i.jsx)(n.S.HelpText,{children:t}):null,d?(0,i.jsx)(n.S.Actions,{children:d}):null,l?(0,i.jsx)(n.S.Watermark,{}):null]}):null,o?(0,i.jsx)(n.S.FooterText,{children:o}):null]})}},90684:(e,r,t)=>{t.d(r,{N:()=>n});var i=t(4913),a=t(96419);let n=({size:e,centerIcon:r})=>(0,i.jsx)(o,{$size:e,children:(0,i.jsxs)(l,{children:[(0,i.jsx)(c,{}),(0,i.jsx)(d,{}),r?(0,i.jsx)(s,{children:r}):null]})}),o=a.zo.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,l=a.zo.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,s=a.zo.div`
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
`}};