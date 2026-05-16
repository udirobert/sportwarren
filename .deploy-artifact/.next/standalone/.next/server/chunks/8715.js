"use strict";exports.id=8715,exports.ids=[8715],exports.modules={17846:(e,r,t)=>{t.d(r,{S:()=>j});var i=t(4913),a=t(26510),n=t(96419),o=t(13813),l=t(38102),s=t(90684);let c=n.zo.div`
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
`,u=n.zo.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,p=(0,n.zo)(l.M)`
  margin: 0 -8px;
`,g=n.zo.div`
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
`,h=n.zo.div`
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
`,f=n.zo.p`
  && {
    margin: 0;
    font-size: 16px;
    font-weight: 300;
    line-height: 24px;
    color: var(--privy-color-foreground);
  }
`,y=n.zo.div`
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
`,S=(0,n.zo)(l.B)`
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
`,T=({step:e})=>e?(0,i.jsx)(z,{children:(0,i.jsx)(k,{pct:Math.min(100,e.current/e.total*100)})}):null;j.Header=({title:e,subtitle:r,icon:t,iconVariant:a,iconLoadingStatus:n,showBack:o,onBack:l,showInfo:s,onInfo:c,showClose:d,onClose:g,step:h,headerTitle:y,...b})=>(0,i.jsxs)(u,{...b,children:[(0,i.jsx)(p,{backFn:o?l:void 0,infoFn:s?c:void 0,onClose:d?g:void 0,title:y,closeable:d}),(t||a||e||r)&&(0,i.jsxs)(v,{children:[t||a?(0,i.jsx)(j.Icon,{icon:t,variant:a,loadingStatus:n}):null,!(!e&&!r)&&(0,i.jsxs)(x,{children:[e&&(0,i.jsx)(m,{children:e}),r&&(0,i.jsx)(f,{children:r})]})]}),h&&(0,i.jsx)(T,{step:h})]}),(j.Body=a.forwardRef(({children:e,...r},t)=>(0,i.jsx)(g,{ref:t,...r,children:e}))).displayName="Screen.Body",j.Footer=({children:e,...r})=>(0,i.jsx)(h,{id:"privy-content-footer-container",...r,children:e}),j.Actions=({children:e,...r})=>(0,i.jsx)(E,{...r,children:e}),j.HelpText=({children:e,...r})=>(0,i.jsx)(A,{...r,children:e}),j.FooterText=({children:e,...r})=>(0,i.jsx)(C,{...r,children:e}),j.Watermark=()=>(0,i.jsx)(S,{}),j.Icon=({icon:e,variant:r="subtle",loadingStatus:t})=>"logo"===r&&e?(0,i.jsx)(b,"string"==typeof e?{children:(0,i.jsx)("img",{src:e,alt:""})}:a.isValidElement(e)?{children:e}:{children:a.createElement(e)}):"loading"===r?e?(0,i.jsx)(w,{children:(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,i.jsx)(o.N,{success:t?.success,fail:t?.fail}),"string"==typeof e?(0,i.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):a.isValidElement(e)?a.cloneElement(e,{style:{width:"38px",height:"38px"}}):a.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,i.jsx)(y,{$variant:r,children:(0,i.jsx)(s.N,{size:"64px"})}):(0,i.jsx)(y,{$variant:r,children:e&&("string"==typeof e?(0,i.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):a.isValidElement(e)?e:a.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let E=n.zo.div`
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
`,C=n.zo.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; // 11px
    line-height: 1rem; // 16px
  }
`},77681:(e,r,t)=>{t.d(r,{S:()=>o});var i=t(4913),a=t(38102),n=t(17846);let o=({primaryCta:e,secondaryCta:r,helpText:t,footerText:o,watermark:l=!0,children:s,...c})=>{let d=e||r?(0,i.jsxs)(i.Fragment,{children:[e&&(()=>{let{label:r,...t}=e,n=t.variant||"primary";return(0,i.jsx)(a.a,{...t,variant:n,style:{width:"100%",...t.style},children:r})})(),r&&(()=>{let{label:e,...t}=r,n=t.variant||"secondary";return(0,i.jsx)(a.a,{...t,variant:n,style:{width:"100%",...t.style},children:e})})()]}):null;return(0,i.jsxs)(n.S,{id:c.id,className:c.className,children:[(0,i.jsx)(n.S.Header,{...c}),s?(0,i.jsx)(n.S.Body,{children:s}):null,t||d||l?(0,i.jsxs)(n.S.Footer,{children:[t?(0,i.jsx)(n.S.HelpText,{children:t}):null,d?(0,i.jsx)(n.S.Actions,{children:d}):null,l?(0,i.jsx)(n.S.Watermark,{}):null]}):null,o?(0,i.jsx)(n.S.FooterText,{children:o}):null]})}},38715:(e,r,t)=>{t.r(r),t.d(r,{TelegramAuthScreen:()=>g,TelegramAuthScreenView:()=>p,default:()=>g});var i=t(4913),a=t(26510),n=t(45592),o=t(14348),l=t(49171),s=t(55182),c=t(83813),d=t(77681),u=t(83091);t(36577),t(46898),t(42330),t(84440),t(50470);let p=({success:e,errorMessage:r,onRetry:t})=>{let a=e?"Successfully connected with Telegram":r?r.message:"Verifying connection to Telegram";return(0,i.jsx)(d.S,{title:a,subtitle:e?"You're good to go!":r?r.detail:"Just a few moments more",icon:u.T,iconVariant:"loading",iconLoadingStatus:{success:e,fail:!!r},secondaryCta:r?.retryable&&t?{label:"Retry",onClick:t}:void 0,watermark:!0})},g={component:()=>{let{authenticated:e,logout:r,ready:t,user:d}=(0,s.u)(),{setModalData:u,navigate:g,resetNavigation:h,data:v}=(0,s.a)(),x=(0,o.u)(),{initLoginWithTelegram:m,loginWithTelegram:f,updateWallets:y,setReadyToTrue:b,closePrivyModal:w,createAnalyticsEvent:j,getAuthMeta:z}=(0,l.u)(),[S,k]=(0,a.useState)(!1),[T,E]=(0,a.useState)(void 0),A=(0,n.a)();async function C(){try{let r=await async function(){let r;if(!e){if(A.enabled&&"error"===A.status)throw new n.C(A.error,null,l.c.CAPTCHA_FAILURE);return A.enabled&&"success"!==A.status&&(A.execute(),r=await A.waitForResult()),r}}();await f({captchaToken:r}),k(!0),b(!0)}catch(t){if(t?.privyErrorCode===l.c.ALLOWLIST_REJECTED)return E(void 0),h(),void g("AllowlistRejectionScreen");if(t?.privyErrorCode===l.c.USER_LIMIT_REACHED)return console.error(new l.k(t).toString()),E(void 0),h(),void g("UserLimitReachedScreen");if(t?.privyErrorCode===l.c.USER_DOES_NOT_EXIST)return E(void 0),h(),void g("AccountNotFoundScreen");if(t?.privyErrorCode===l.c.ACCOUNT_TRANSFER_REQUIRED&&t.data?.data?.nonce)return E(void 0),h(),u({accountTransfer:{nonce:t.data?.data?.nonce,account:t.data?.data?.subject,telegramAuthResult:z()?.telegramAuthResult,telegramWebAppData:z()?.telegramWebAppData,displayName:t.data?.data?.account?.displayName,linkMethod:"telegram",embeddedWalletAddress:t.data?.data?.otherUser?.embeddedWalletAddress}}),void g("LinkConflictScreen");let{retryable:e,detail:r}=(0,n.m)(t);E({retryable:e,detail:r,message:"Authentication failed"})}}return(0,a.useEffect)(()=>{C()},[]),(0,a.useEffect)(()=>{if(!(t&&e&&S&&d))return;if(x?.legal.requireUsersAcceptTerms&&!d.hasAcceptedTerms){let e=setTimeout(()=>{g("AffirmativeConsentScreen")},o.q);return()=>clearTimeout(e)}if((0,c.s)(d,x.embeddedWallets)){let e=setTimeout(()=>{u({createWallet:{onSuccess:()=>{},onFailure:e=>{console.error(e),j({eventName:"embedded_wallet_creation_failure_logout",payload:{error:e,provider:"telegram",screen:"TelegramAuthScreen"}}),r()},callAuthOnSuccessOnClose:!0}}),g("EmbeddedWalletOnAccountCreateScreen")},o.q);return()=>clearTimeout(e)}y();let i=setTimeout(()=>w({shouldCallAuthOnSuccess:!0,isSuccess:!0}),o.q);return()=>clearTimeout(i)},[t,e,S,d]),(0,i.jsx)(p,{success:S,errorMessage:T,onRetry:T?.retryable?async()=>{try{E(void 0),v?.telegramAuthModalData?.seamlessAuth||await m(void 0,v?.login?.disableSignup),await C()}catch(t){let{retryable:e,detail:r}=(0,n.m)(t);E({retryable:e,detail:r,message:"Authentication failed"})}}:void 0})},isCaptchaRequired:!0,isShownBeforeReady:!0}},90684:(e,r,t)=>{t.d(r,{N:()=>n});var i=t(4913),a=t(96419);let n=({size:e,centerIcon:r})=>(0,i.jsx)(o,{$size:e,children:(0,i.jsxs)(l,{children:[(0,i.jsx)(c,{}),(0,i.jsx)(d,{}),r?(0,i.jsx)(s,{children:r}):null]})}),o=a.zo.div`
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
`},83813:(e,r,t)=>{t.d(r,{s:()=>a});var i=t(45592);let a=(e,r)=>(0,i.s)(e,r.ethereum.createOnLogin)||(0,i.k)(e,r.solana.createOnLogin)},83091:(e,r,t)=>{t.d(r,{T:()=>a});var i=t(4913);function a(e){return(0,i.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",...e,children:[(0,i.jsx)("rect",{width:"512",height:"512",rx:"15%",fill:"#37aee2"}),(0,i.jsx)("path",{fill:"#c8daea",d:"M199 404c-11 0-10-4-13-14l-32-105 245-144"}),(0,i.jsx)("path",{fill:"#a9c9dd",d:"M199 404c7 0 11-4 16-8l45-43-56-34"}),(0,i.jsx)("path",{fill:"#f6fbfe",d:"M204 319l135 99c14 9 26 4 30-14l55-258c5-22-9-32-24-25L79 245c-21 8-21 21-4 26l83 26 190-121c9-5 17-3 11 4"})]})}}};