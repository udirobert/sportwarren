"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[1507],{74863:function(e,r,t){t.d(r,{Z:function(){return i}});let i=(0,t(79095).Z)("fingerprint-pattern",[["path",{d:"M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4",key:"1nerag"}],["path",{d:"M14 13.12c0 2.38 0 6.38-1 8.88",key:"o46ks0"}],["path",{d:"M17.29 21.02c.12-.6.43-2.3.5-3.02",key:"ptglia"}],["path",{d:"M2 12a10 10 0 0 1 18-6",key:"ydlgp0"}],["path",{d:"M2 16h.01",key:"1gqxmh"}],["path",{d:"M21.8 16c.2-2 .131-5.354 0-6",key:"drycrb"}],["path",{d:"M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2",key:"1tidbn"}],["path",{d:"M8.65 22c.21-.66.45-1.32.57-2",key:"13wd9y"}],["path",{d:"M9 6.8a6 6 0 0 1 9 5.2v2",key:"1fr1j5"}]])},31507:function(e,r,t){t.r(r),t.d(r,{PasskeyStatusScreen:function(){return h},PasskeyStatusScreenView:function(){return p},default:function(){return h}});var i=t(89418),n=t(74863),o=t(4753),a=t(43803),s=t(64982),l=t(3010),c=t(9201),d=t(74531),u=t(35868);t(96257),t(78439),t(55982),t(94936),t(21628);let p=({status:e,passkeySignupFlow:r=!1,error:t,onRetry:o})=>(0,i.jsx)(u.S,{title:(()=>{switch(e){case"loading":return"Waiting for passkey";case"success":return"Success";case"error":return"Something went wrong"}})(),subtitle:(0,i.jsx)(g,{children:(()=>{switch(e){case"loading":return r?"Please follow prompts to register your passkey.":"Please follow prompts to verify your passkey.\nYou will have to sign up with another method first to register a passkey for your account.";case"success":return"You've successfully logged in with your passkey.";case"error":if(t instanceof l.g){if(t.privyErrorCode===l.c.CANNOT_LINK_MORE_OF_TYPE)return"Cannot link more passkeys to account.";if(t.privyErrorCode===l.c.PASSKEY_NOT_ALLOWED)return"Passkey request timed out or rejected by user.\nYou will have to sign up with another method first to register a passkey for your account."}return"An unknown error occurred.\nYou will have to sign up with another method first to register a passkey for your account."}})()}),icon:n.Z,iconVariant:"loading",iconLoadingStatus:{success:"success"===e,fail:"error"===e},primaryCta:"error"===e&&o?{label:"Retry",onClick:o}:"success"===e?{label:"Continue",disabled:!0}:void 0,watermark:!0}),h={component:()=>{let{data:e,setModalData:r,navigate:t}=(0,c.a)(),n=(0,s.u)(),{loginWithPasskey:a,signupWithPasskey:u,closePrivyModal:h,createAnalyticsEvent:g}=(0,l.u)(),{user:v,logout:f,ready:y,authenticated:x}=(0,c.u)(),{passkeySignupFlow:m}=e?.passkeyAuthModalData??{},b=s.q-500,[w,k]=(0,o.useState)("loading"),[j,S]=(0,o.useState)(null),z=(0,o.useRef)([]),E=e=>{z.current=[e,...z.current]};(0,o.useEffect)(()=>()=>{z.current.forEach(e=>clearTimeout(e)),z.current=[]},[]);let C=async()=>{k("loading");try{m?await u():await a(),k("success")}catch(e){if(e?.privyErrorCode===l.c.USER_DOES_NOT_EXIST)return void t("AccountNotFoundScreen");if(e?.privyErrorCode===l.c.ALLOWLIST_REJECTED)return void t("AllowlistRejectionScreen");if(e?.privyErrorCode===l.c.USER_LIMIT_REACHED)return void t("UserLimitReachedScreen");S(e),k("error")}};return(0,o.useEffect)(()=>{if(y&&x&&"success"===w&&v){if(n?.legal.requireUsersAcceptTerms&&!v.hasAcceptedTerms)return void E(setTimeout(()=>{t("AffirmativeConsentScreen")},b));if(!(0,d.s)(v,n?.embeddedWallets))return void E(setTimeout(()=>{h({shouldCallAuthOnSuccess:!0,isSuccess:!0})},s.q));E(setTimeout(()=>{r({createWallet:{onSuccess:()=>{},onFailure:e=>{console.error(e),g({eventName:"embedded_wallet_creation_failure_logout",payload:{error:e,screen:"PasskeyStatusScreen"}}),f()},callAuthOnSuccessOnClose:!0}}),t("EmbeddedWalletOnAccountCreateScreen")},b))}},[y,x,v,w]),(0,o.useEffect)(()=>{C()},[]),(0,i.jsx)(p,{status:w,passkeySignupFlow:m,error:j,onRetry:C})}},g=a.zo.span`
  white-space: pre-wrap;
`},18532:function(e,r,t){t.d(r,{S:function(){return k}});var i=t(89418),n=t(4753),o=t(43803),a=t(61318),s=t(13188),l=t(99539);let c=o.zo.div`
  /* spacing tokens */
  --screen-space: 16px; /* base 1x = 16 */
  --screen-space-lg: calc(var(--screen-space) * 1.5); /* 24px */

  position: relative;
  overflow: hidden;
  margin: 0 calc(-1 * var(--screen-space)); /* extends over modal padding */
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,d=o.zo.div`
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) * 1.5);
  width: 100%;
  background: var(--privy-color-background);
  padding: 0 var(--screen-space-lg) var(--screen-space);
  height: 100%;
  border-radius: var(--privy-border-radius-lg);
`,u=o.zo.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,p=(0,o.zo)(s.M)`
  margin: 0 -8px;
`,h=o.zo.div`
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
`,g=o.zo.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,v=o.zo.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,f=o.zo.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,y=o.zo.h3`
  && {
    font-size: 20px;
    line-height: 32px;
    font-weight: 500;
    color: var(--privy-color-foreground);
    margin: 0;
  }
`,x=o.zo.p`
  && {
    margin: 0;
    font-size: 16px;
    font-weight: 300;
    line-height: 24px;
    color: var(--privy-color-foreground);
  }
`,m=o.zo.div`
  background: ${({$variant:e})=>{switch(e){case"success":return"var(--privy-color-success-bg, #EAFCEF)";case"warning":return"var(--privy-color-warn, #FEF3C7)";case"error":return"var(--privy-color-error-bg, #FEE2E2)";case"loading":case"logo":return"transparent";default:return"var(--privy-color-background-2)"}}};

  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
`,b=o.zo.div`
  display: flex;
  align-items: center;
  justify-content: center;

  img,
  svg {
    max-height: 90px;
    max-width: 180px;
  }
`,w=o.zo.div`
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
`,k=({children:e,...r})=>(0,i.jsx)(c,{children:(0,i.jsx)(d,{...r,children:e})}),j=o.zo.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,S=(0,o.zo)(s.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,z=o.zo.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,E=({step:e})=>e?(0,i.jsx)(j,{children:(0,i.jsx)(z,{pct:Math.min(100,e.current/e.total*100)})}):null;k.Header=({title:e,subtitle:r,icon:t,iconVariant:n,iconLoadingStatus:o,showBack:a,onBack:s,showInfo:l,onInfo:c,showClose:d,onClose:h,step:g,headerTitle:m,...b})=>(0,i.jsxs)(u,{...b,children:[(0,i.jsx)(p,{backFn:a?s:void 0,infoFn:l?c:void 0,onClose:d?h:void 0,title:m,closeable:d}),(t||n||e||r)&&(0,i.jsxs)(v,{children:[t||n?(0,i.jsx)(k.Icon,{icon:t,variant:n,loadingStatus:o}):null,!(!e&&!r)&&(0,i.jsxs)(f,{children:[e&&(0,i.jsx)(y,{children:e}),r&&(0,i.jsx)(x,{children:r})]})]}),g&&(0,i.jsx)(E,{step:g})]}),(k.Body=n.forwardRef(({children:e,...r},t)=>(0,i.jsx)(h,{ref:t,...r,children:e}))).displayName="Screen.Body",k.Footer=({children:e,...r})=>(0,i.jsx)(g,{id:"privy-content-footer-container",...r,children:e}),k.Actions=({children:e,...r})=>(0,i.jsx)(C,{...r,children:e}),k.HelpText=({children:e,...r})=>(0,i.jsx)(T,{...r,children:e}),k.FooterText=({children:e,...r})=>(0,i.jsx)(A,{...r,children:e}),k.Watermark=()=>(0,i.jsx)(S,{}),k.Icon=({icon:e,variant:r="subtle",loadingStatus:t})=>"logo"===r&&e?(0,i.jsx)(b,"string"==typeof e?{children:(0,i.jsx)("img",{src:e,alt:""})}:n.isValidElement(e)?{children:e}:{children:n.createElement(e)}):"loading"===r?e?(0,i.jsx)(w,{children:(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,i.jsx)(a.N,{success:t?.success,fail:t?.fail}),"string"==typeof e?(0,i.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):n.isValidElement(e)?n.cloneElement(e,{style:{width:"38px",height:"38px"}}):n.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,i.jsx)(m,{$variant:r,children:(0,i.jsx)(l.N,{size:"64px"})}):(0,i.jsx)(m,{$variant:r,children:e&&("string"==typeof e?(0,i.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):n.isValidElement(e)?e:n.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let C=o.zo.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,T=o.zo.div`
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
`,A=o.zo.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; // 11px
    line-height: 1rem; // 16px
  }
`},35868:function(e,r,t){t.d(r,{S:function(){return a}});var i=t(89418),n=t(13188),o=t(18532);let a=({primaryCta:e,secondaryCta:r,helpText:t,footerText:a,watermark:s=!0,children:l,...c})=>{let d=e||r?(0,i.jsxs)(i.Fragment,{children:[e&&(()=>{let{label:r,...t}=e,o=t.variant||"primary";return(0,i.jsx)(n.a,{...t,variant:o,style:{width:"100%",...t.style},children:r})})(),r&&(()=>{let{label:e,...t}=r,o=t.variant||"secondary";return(0,i.jsx)(n.a,{...t,variant:o,style:{width:"100%",...t.style},children:e})})()]}):null;return(0,i.jsxs)(o.S,{id:c.id,className:c.className,children:[(0,i.jsx)(o.S.Header,{...c}),l?(0,i.jsx)(o.S.Body,{children:l}):null,t||d||s?(0,i.jsxs)(o.S.Footer,{children:[t?(0,i.jsx)(o.S.HelpText,{children:t}):null,d?(0,i.jsx)(o.S.Actions,{children:d}):null,s?(0,i.jsx)(o.S.Watermark,{}):null]}):null,a?(0,i.jsx)(o.S.FooterText,{children:a}):null]})}},99539:function(e,r,t){t.d(r,{N:function(){return o}});var i=t(89418),n=t(43803);let o=({size:e,centerIcon:r})=>(0,i.jsx)(a,{$size:e,children:(0,i.jsxs)(s,{children:[(0,i.jsx)(c,{}),(0,i.jsx)(d,{}),r?(0,i.jsx)(l,{children:r}):null]})}),a=n.zo.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,s=n.zo.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,l=n.zo.div`
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
`,c=n.zo.div`
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
`,d=n.zo.div`
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
`},74531:function(e,r,t){t.d(r,{s:function(){return n}});var i=t(5430);let n=(e,r)=>(0,i.s)(e,r.ethereum.createOnLogin)||(0,i.k)(e,r.solana.createOnLogin)}}]);