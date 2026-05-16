"use strict";exports.id=4616,exports.ids=[4616],exports.modules={87686:(e,r,t)=>{t.d(r,{Z:()=>i});let i=(0,t(5670).Z)("fingerprint-pattern",[["path",{d:"M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4",key:"1nerag"}],["path",{d:"M14 13.12c0 2.38 0 6.38-1 8.88",key:"o46ks0"}],["path",{d:"M17.29 21.02c.12-.6.43-2.3.5-3.02",key:"ptglia"}],["path",{d:"M2 12a10 10 0 0 1 18-6",key:"ydlgp0"}],["path",{d:"M2 16h.01",key:"1gqxmh"}],["path",{d:"M21.8 16c.2-2 .131-5.354 0-6",key:"drycrb"}],["path",{d:"M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2",key:"1tidbn"}],["path",{d:"M8.65 22c.21-.66.45-1.32.57-2",key:"13wd9y"}],["path",{d:"M9 6.8a6 6 0 0 1 9 5.2v2",key:"1fr1j5"}]])},44616:(e,r,t)=>{t.r(r),t.d(r,{PasskeyStatusScreen:()=>h,PasskeyStatusScreenView:()=>u,default:()=>h});var i=t(4913),o=t(87686),a=t(26510),n=t(96419),s=t(14348),l=t(49171),c=t(55182),d=t(83813),p=t(77681);t(50470),t(36577),t(46898),t(42330),t(84440);let u=({status:e,passkeySignupFlow:r=!1,error:t,onRetry:a})=>(0,i.jsx)(p.S,{title:(()=>{switch(e){case"loading":return"Waiting for passkey";case"success":return"Success";case"error":return"Something went wrong"}})(),subtitle:(0,i.jsx)(g,{children:(()=>{switch(e){case"loading":return r?"Please follow prompts to register your passkey.":"Please follow prompts to verify your passkey.\nYou will have to sign up with another method first to register a passkey for your account.";case"success":return"You've successfully logged in with your passkey.";case"error":if(t instanceof l.g){if(t.privyErrorCode===l.c.CANNOT_LINK_MORE_OF_TYPE)return"Cannot link more passkeys to account.";if(t.privyErrorCode===l.c.PASSKEY_NOT_ALLOWED)return"Passkey request timed out or rejected by user.\nYou will have to sign up with another method first to register a passkey for your account."}return"An unknown error occurred.\nYou will have to sign up with another method first to register a passkey for your account."}})()}),icon:o.Z,iconVariant:"loading",iconLoadingStatus:{success:"success"===e,fail:"error"===e},primaryCta:"error"===e&&a?{label:"Retry",onClick:a}:"success"===e?{label:"Continue",disabled:!0}:void 0,watermark:!0}),h={component:()=>{let{data:e,setModalData:r,navigate:t}=(0,c.a)(),o=(0,s.u)(),{loginWithPasskey:n,signupWithPasskey:p,closePrivyModal:h,createAnalyticsEvent:g}=(0,l.u)(),{user:v,logout:y,ready:x,authenticated:f}=(0,c.u)(),{passkeySignupFlow:m}=e?.passkeyAuthModalData??{},b=s.q-500,[w,k]=(0,a.useState)("loading"),[j,S]=(0,a.useState)(null),z=(0,a.useRef)([]),E=e=>{z.current=[e,...z.current]};(0,a.useEffect)(()=>()=>{z.current.forEach(e=>clearTimeout(e)),z.current=[]},[]);let C=async()=>{k("loading");try{m?await p():await n(),k("success")}catch(e){if(e?.privyErrorCode===l.c.USER_DOES_NOT_EXIST)return void t("AccountNotFoundScreen");if(e?.privyErrorCode===l.c.ALLOWLIST_REJECTED)return void t("AllowlistRejectionScreen");if(e?.privyErrorCode===l.c.USER_LIMIT_REACHED)return void t("UserLimitReachedScreen");S(e),k("error")}};return(0,a.useEffect)(()=>{if(x&&f&&"success"===w&&v){if(o?.legal.requireUsersAcceptTerms&&!v.hasAcceptedTerms)return void E(setTimeout(()=>{t("AffirmativeConsentScreen")},b));if(!(0,d.s)(v,o?.embeddedWallets))return void E(setTimeout(()=>{h({shouldCallAuthOnSuccess:!0,isSuccess:!0})},s.q));E(setTimeout(()=>{r({createWallet:{onSuccess:()=>{},onFailure:e=>{console.error(e),g({eventName:"embedded_wallet_creation_failure_logout",payload:{error:e,screen:"PasskeyStatusScreen"}}),y()},callAuthOnSuccessOnClose:!0}}),t("EmbeddedWalletOnAccountCreateScreen")},b))}},[x,f,v,w]),(0,a.useEffect)(()=>{C()},[]),(0,i.jsx)(u,{status:w,passkeySignupFlow:m,error:j,onRetry:C})}},g=n.zo.span`
  white-space: pre-wrap;
`},17846:(e,r,t)=>{t.d(r,{S:()=>k});var i=t(4913),o=t(26510),a=t(96419),n=t(13813),s=t(38102),l=t(90684);let c=a.zo.div`
  /* spacing tokens */
  --screen-space: 16px; /* base 1x = 16 */
  --screen-space-lg: calc(var(--screen-space) * 1.5); /* 24px */

  position: relative;
  overflow: hidden;
  margin: 0 calc(-1 * var(--screen-space)); /* extends over modal padding */
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,d=a.zo.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) * 1.5);
  width: 100%;
  background: var(--privy-color-background);
  padding: 0 var(--screen-space-lg) var(--screen-space);
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,p=a.zo.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,u=(0,a.zo)(s.M)`
  margin: 0 -8px;
`,h=a.zo.div`
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
`,g=a.zo.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,v=a.zo.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,y=a.zo.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,x=a.zo.h3`
  && {
    font-size: 20px;
    line-height: 32px;
    font-weight: 500;
    color: var(--privy-color-foreground);
    margin: 0;
  }
`,f=a.zo.p`
  && {
    margin: 0;
    font-size: 16px;
    font-weight: 300;
    line-height: 24px;
    color: var(--privy-color-foreground);
  }
`,m=a.zo.div`
  background: ${({$variant:e})=>{switch(e){case"success":return"var(--privy-color-success-bg, #EAFCEF)";case"warning":return"var(--privy-color-warn, #FEF3C7)";case"error":return"var(--privy-color-error-bg, #FEE2E2)";case"loading":case"logo":return"transparent";default:return"var(--privy-color-background-2)"}}};

  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
`,b=a.zo.div`
  display: flex;
  align-items: center;
  justify-content: center;

  img,
  svg {
    max-height: 90px;
    max-width: 180px;
  }
`,w=a.zo.div`
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
`,k=({children:e,...r})=>(0,i.jsx)(c,{children:(0,i.jsx)(d,{...r,children:e})}),j=a.zo.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,S=(0,a.zo)(s.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,z=a.zo.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,E=({step:e})=>e?(0,i.jsx)(j,{children:(0,i.jsx)(z,{pct:Math.min(100,e.current/e.total*100)})}):null;k.Header=({title:e,subtitle:r,icon:t,iconVariant:o,iconLoadingStatus:a,showBack:n,onBack:s,showInfo:l,onInfo:c,showClose:d,onClose:h,step:g,headerTitle:m,...b})=>(0,i.jsxs)(p,{...b,children:[(0,i.jsx)(u,{backFn:n?s:void 0,infoFn:l?c:void 0,onClose:d?h:void 0,title:m,closeable:d}),(t||o||e||r)&&(0,i.jsxs)(v,{children:[t||o?(0,i.jsx)(k.Icon,{icon:t,variant:o,loadingStatus:a}):null,!(!e&&!r)&&(0,i.jsxs)(y,{children:[e&&(0,i.jsx)(x,{children:e}),r&&(0,i.jsx)(f,{children:r})]})]}),g&&(0,i.jsx)(E,{step:g})]}),(k.Body=o.forwardRef(({children:e,...r},t)=>(0,i.jsx)(h,{ref:t,...r,children:e}))).displayName="Screen.Body",k.Footer=({children:e,...r})=>(0,i.jsx)(g,{id:"privy-content-footer-container",...r,children:e}),k.Actions=({children:e,...r})=>(0,i.jsx)(C,{...r,children:e}),k.HelpText=({children:e,...r})=>(0,i.jsx)(T,{...r,children:e}),k.FooterText=({children:e,...r})=>(0,i.jsx)(A,{...r,children:e}),k.Watermark=()=>(0,i.jsx)(S,{}),k.Icon=({icon:e,variant:r="subtle",loadingStatus:t})=>"logo"===r&&e?(0,i.jsx)(b,"string"==typeof e?{children:(0,i.jsx)("img",{src:e,alt:""})}:o.isValidElement(e)?{children:e}:{children:o.createElement(e)}):"loading"===r?e?(0,i.jsx)(w,{children:(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,i.jsx)(n.N,{success:t?.success,fail:t?.fail}),"string"==typeof e?(0,i.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):o.isValidElement(e)?o.cloneElement(e,{style:{width:"38px",height:"38px"}}):o.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,i.jsx)(m,{$variant:r,children:(0,i.jsx)(l.N,{size:"64px"})}):(0,i.jsx)(m,{$variant:r,children:e&&("string"==typeof e?(0,i.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):o.isValidElement(e)?e:o.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let C=a.zo.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,T=a.zo.div`
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
`,A=a.zo.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; // 11px
    line-height: 1rem; // 16px
  }
`},77681:(e,r,t)=>{t.d(r,{S:()=>n});var i=t(4913),o=t(38102),a=t(17846);let n=({primaryCta:e,secondaryCta:r,helpText:t,footerText:n,watermark:s=!0,children:l,...c})=>{let d=e||r?(0,i.jsxs)(i.Fragment,{children:[e&&(()=>{let{label:r,...t}=e,a=t.variant||"primary";return(0,i.jsx)(o.a,{...t,variant:a,style:{width:"100%",...t.style},children:r})})(),r&&(()=>{let{label:e,...t}=r,a=t.variant||"secondary";return(0,i.jsx)(o.a,{...t,variant:a,style:{width:"100%",...t.style},children:e})})()]}):null;return(0,i.jsxs)(a.S,{id:c.id,className:c.className,children:[(0,i.jsx)(a.S.Header,{...c}),l?(0,i.jsx)(a.S.Body,{children:l}):null,t||d||s?(0,i.jsxs)(a.S.Footer,{children:[t?(0,i.jsx)(a.S.HelpText,{children:t}):null,d?(0,i.jsx)(a.S.Actions,{children:d}):null,s?(0,i.jsx)(a.S.Watermark,{}):null]}):null,n?(0,i.jsx)(a.S.FooterText,{children:n}):null]})}},90684:(e,r,t)=>{t.d(r,{N:()=>a});var i=t(4913),o=t(96419);let a=({size:e,centerIcon:r})=>(0,i.jsx)(n,{$size:e,children:(0,i.jsxs)(s,{children:[(0,i.jsx)(c,{}),(0,i.jsx)(d,{}),r?(0,i.jsx)(l,{children:r}):null]})}),n=o.zo.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,s=o.zo.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,l=o.zo.div`
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
`,c=o.zo.div`
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
`,d=o.zo.div`
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
`},83813:(e,r,t)=>{t.d(r,{s:()=>o});var i=t(45592);let o=(e,r)=>(0,i.s)(e,r.ethereum.createOnLogin)||(0,i.k)(e,r.solana.createOnLogin)}};