"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[3248],{78125:function(e,r,t){t.d(r,{Z:function(){return i}});let i=(0,t(79095).Z)("circle-x",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]])},43248:function(e,r,t){t.r(r),t.d(r,{EmbeddedWalletConnectingScreen:function(){return p},EmbeddedWalletConnectingView:function(){return d},default:function(){return p}});var i=t(89418),n=t(78125),o=t(4753),a=t(5430),l=t(3010),s=t(9201),c=t(35868);t(78439),t(96257),t(55982),t(94936),t(21628);let d=({connectionFailed:e,onClose:r})=>(0,i.jsx)(c.S,e?{title:"Something went wrong",subtitle:"We're on it. Please try again later.",icon:n.Z,iconVariant:"error",primaryCta:{label:"Close",onClick:r},watermark:!0}:{title:"Connecting to your wallet",subtitle:"Please wait...",iconVariant:"loading",showClose:!0,onClose:r,watermark:!1}),p={component:()=>{let{authenticated:e,user:r}=(0,s.u)(),{client:t,closePrivyModal:n,createAnalyticsEvent:c,walletProxy:p}=(0,l.u)(),{navigate:u,data:h,setModalData:v,onUserCloseViaDialogOrKeybindRef:g}=(0,s.a)(),x=(0,o.useMemo)(()=>Date.now(),[]),[f,y]=(0,o.useState)(!1),{onCompleteNavigateTo:m,onFailure:b,shouldForceMFA:w,entropyId:j,entropyIdVerifier:k,recoveryMethod:z,connectingWalletAddress:C,isUnifiedWallet:S=!1}=h?.connectWallet??{},E=e=>{f||(y(!0),b("string"==typeof e?Error(e):e))};return(0,o.useEffect)(()=>{let r;return e?p?((async()=>{let e=await t.getAccessToken();if(!e)return E("User must be authenticated and have a Privy wallet before it can be connected");try{if(!S){if(!j||!k)return E("For on-device first-class chain wallets, entropyId and entropyIdVerifier are required");await p.connect({accessToken:e,entropyId:j,entropyIdVerifier:k})}w&&await p.verifyMfa({accessToken:e});let t=(Date.now()-x)/1e3;"EmbeddedWalletKeyExportScreen"===m&&t<1?r=setTimeout(()=>{u(m,!1)},1e3*(1-t)):u(m,!1)}catch(e){if((0,a.e)(e)&&"privy"===z){let e=await t.getAccessToken();if(!e)return E("User must be authenticated and have a Privy wallet before it can be recovered");try{c({eventName:"embedded_wallet_pinless_recovery_started",payload:{walletAddress:C}});let r=await p?.recover({accessToken:e,entropyId:j,entropyIdVerifier:k});r?.entropyId||E(Error("Unable to recover wallet")),m?u(m):n({shouldCallAuthOnSuccess:!1}),c({eventName:"embedded_wallet_recovery_completed",payload:{walletAddress:C}}),u(m)}catch(e){E("An error has occurred, please try again.")}}else(0,a.e)(e)&&"privy"!==z&&"privy-v2"!==z?(v({...h,recoverWallet:{entropyId:j,entropyIdVerifier:k,onCompleteNavigateTo:m,onFailure:b},recoveryOAuthStatus:{provider:z,action:"recover",isInAccountCreateFlow:!1,shouldCreateEth:!1,shouldCreateSol:!1}}),u((0,a.c)(z))):E(e)}})(),()=>clearTimeout(r)):void 0:E("User must be authenticated and have a Privy wallet before it can be connected")},[e,r,p]),g.current=()=>{E("User exited before wallet could be connected"),n({shouldCallAuthOnSuccess:!1})},(0,i.jsx)(d,{connectionFailed:f,onClose:()=>n({shouldCallAuthOnSuccess:!1})})}}},18532:function(e,r,t){t.d(r,{S:function(){return j}});var i=t(89418),n=t(4753),o=t(43803),a=t(61318),l=t(13188),s=t(99539);let c=o.zo.div`
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
`,p=o.zo.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,u=(0,o.zo)(l.M)`
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
`,v=o.zo.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,g=o.zo.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,x=o.zo.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,f=o.zo.h3`
  && {
    font-size: 20px;
    line-height: 32px;
    font-weight: 500;
    color: var(--privy-color-foreground);
    margin: 0;
  }
`,y=o.zo.p`
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
`,j=({children:e,...r})=>(0,i.jsx)(c,{children:(0,i.jsx)(d,{...r,children:e})}),k=o.zo.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,z=(0,o.zo)(l.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,C=o.zo.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,S=({step:e})=>e?(0,i.jsx)(k,{children:(0,i.jsx)(C,{pct:Math.min(100,e.current/e.total*100)})}):null;j.Header=({title:e,subtitle:r,icon:t,iconVariant:n,iconLoadingStatus:o,showBack:a,onBack:l,showInfo:s,onInfo:c,showClose:d,onClose:h,step:v,headerTitle:m,...b})=>(0,i.jsxs)(p,{...b,children:[(0,i.jsx)(u,{backFn:a?l:void 0,infoFn:s?c:void 0,onClose:d?h:void 0,title:m,closeable:d}),(t||n||e||r)&&(0,i.jsxs)(g,{children:[t||n?(0,i.jsx)(j.Icon,{icon:t,variant:n,loadingStatus:o}):null,!(!e&&!r)&&(0,i.jsxs)(x,{children:[e&&(0,i.jsx)(f,{children:e}),r&&(0,i.jsx)(y,{children:r})]})]}),v&&(0,i.jsx)(S,{step:v})]}),(j.Body=n.forwardRef(({children:e,...r},t)=>(0,i.jsx)(h,{ref:t,...r,children:e}))).displayName="Screen.Body",j.Footer=({children:e,...r})=>(0,i.jsx)(v,{id:"privy-content-footer-container",...r,children:e}),j.Actions=({children:e,...r})=>(0,i.jsx)(E,{...r,children:e}),j.HelpText=({children:e,...r})=>(0,i.jsx)(F,{...r,children:e}),j.FooterText=({children:e,...r})=>(0,i.jsx)(I,{...r,children:e}),j.Watermark=()=>(0,i.jsx)(z,{}),j.Icon=({icon:e,variant:r="subtle",loadingStatus:t})=>"logo"===r&&e?(0,i.jsx)(b,"string"==typeof e?{children:(0,i.jsx)("img",{src:e,alt:""})}:n.isValidElement(e)?{children:e}:{children:n.createElement(e)}):"loading"===r?e?(0,i.jsx)(w,{children:(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,i.jsx)(a.N,{success:t?.success,fail:t?.fail}),"string"==typeof e?(0,i.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):n.isValidElement(e)?n.cloneElement(e,{style:{width:"38px",height:"38px"}}):n.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,i.jsx)(m,{$variant:r,children:(0,i.jsx)(s.N,{size:"64px"})}):(0,i.jsx)(m,{$variant:r,children:e&&("string"==typeof e?(0,i.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):n.isValidElement(e)?e:n.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let E=o.zo.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,F=o.zo.div`
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
`,I=o.zo.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; // 11px
    line-height: 1rem; // 16px
  }
`},35868:function(e,r,t){t.d(r,{S:function(){return a}});var i=t(89418),n=t(13188),o=t(18532);let a=({primaryCta:e,secondaryCta:r,helpText:t,footerText:a,watermark:l=!0,children:s,...c})=>{let d=e||r?(0,i.jsxs)(i.Fragment,{children:[e&&(()=>{let{label:r,...t}=e,o=t.variant||"primary";return(0,i.jsx)(n.a,{...t,variant:o,style:{width:"100%",...t.style},children:r})})(),r&&(()=>{let{label:e,...t}=r,o=t.variant||"secondary";return(0,i.jsx)(n.a,{...t,variant:o,style:{width:"100%",...t.style},children:e})})()]}):null;return(0,i.jsxs)(o.S,{id:c.id,className:c.className,children:[(0,i.jsx)(o.S.Header,{...c}),s?(0,i.jsx)(o.S.Body,{children:s}):null,t||d||l?(0,i.jsxs)(o.S.Footer,{children:[t?(0,i.jsx)(o.S.HelpText,{children:t}):null,d?(0,i.jsx)(o.S.Actions,{children:d}):null,l?(0,i.jsx)(o.S.Watermark,{}):null]}):null,a?(0,i.jsx)(o.S.FooterText,{children:a}):null]})}},99539:function(e,r,t){t.d(r,{N:function(){return o}});var i=t(89418),n=t(43803);let o=({size:e,centerIcon:r})=>(0,i.jsx)(a,{$size:e,children:(0,i.jsxs)(l,{children:[(0,i.jsx)(c,{}),(0,i.jsx)(d,{}),r?(0,i.jsx)(s,{children:r}):null]})}),a=n.zo.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,l=n.zo.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,s=n.zo.div`
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
`}}]);