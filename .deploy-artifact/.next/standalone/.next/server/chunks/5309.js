"use strict";exports.id=5309,exports.ids=[5309,1430],exports.modules={85886:(e,t,n)=>{n.r(t),n.d(t,{ConnectOnlyStatusScreen:()=>v,ConnectOnlyStatusScreenView:()=>h,default:()=>v});var o=n(4913),r=n(26510),a=n(46898),i=n(22554),l=n(14348),c=n(13813),s=n(49171),d=n(55182),u=n(77681),p=n(45592),g=n(91430);n(36577),n(50470),n(42330),n(84440);let h=({walletLogo:e,success:t,errorMessage:n,title:r,subtitle:a,onRetry:l,onUseDifferentWallet:c,onBack:s,numRetries:d,maxRetries:p})=>(0,o.jsx)(u.S,{title:r,subtitle:a,icon:e,iconVariant:"loading",iconLoadingStatus:{success:t,fail:!!n},primaryCta:n===i.C.ERROR_USER_EXISTS?{label:"Use a different wallet",onClick:c}:!t&&n?.retryable&&d<p?{label:"Retry",onClick:l,disabled:!n?.retryable||d>=p}:!t&&n&&d>=p?{label:"Use a different wallet",onClick:c}:void 0,onBack:s,watermark:!0}),v={component:()=>{let e,{navigateBack:t,navigate:n,lastScreen:i,currentScreen:u,data:v,setModalData:f}=(0,d.a)(),{walletConnectionStatus:y,closePrivyModal:w}=(0,s.u)(),[m,x]=(0,r.useState)(void 0),[b,S]=(0,r.useState)(0),C=(0,c.z)(y?.connector?.walletClientType||"unknown"),k="connected"===y?.status,T="switching_to_supported_chain"===y?.status;(0,r.useEffect)(()=>{if(k){let e;if(v?.externalConnectWallet?.onCompleteNavigateTo){let t=v.externalConnectWallet.onCompleteNavigateTo,o=y.connectedWallet?.address;e=setTimeout(()=>{if(v.funding&&y.connector){let e=y.connector.wallets.find(e=>e.address===o);f({...v,funding:{...v.funding,connectedWallet:e}})}n(t({address:o,walletClientType:y.connector?.walletClientType,walletChainType:y.connector?.chainType}))},l.q)}else e=setTimeout(w,l.q);return()=>clearTimeout(e)}},[k]),(0,r.useEffect)(()=>{var e;y?.connectError&&(e=y?.connectError,x((0,g.getErrorDetails)(e)))},[y]);let E=y?.connector?.connectorType||"injected",R=y?.connector?.walletClientType||"unknown",j=C?.metadata?.shortName||C?.name||y?.connector?.walletBranding.name||"Browser Extension",W=C?.image_url?.md||y?.connector?.walletBranding.icon||(e=>(0,o.jsx)(p.B,{...e})),_="Browser Extension"===j?j.toLowerCase():j;e=k?`Successfully connected with ${_}`:m?m.message:T?"Switching networks":`Waiting for ${_}`;let z="Don’t see your wallet? Check your other browser windows.";return k?z="You’re good to go!":b>=2&&m?z="Unable to connect wallet":m?z=m.detail:T?z="Switch your wallet to the requested network.":"metamask"===R&&a.tq?z="Click to continue to open and connect MetaMask.":"metamask"===R?z="For the best experience, connect only one wallet at a time.":"wallet_connect_v2"===E?z="Open your mobile wallet app to continue":"coinbase_wallet"===E&&(z="Confirm in the Coinbase app/popup to continue."),(0,o.jsx)(h,{walletName:j,walletLogo:W,success:k,errorMessage:m,title:e,subtitle:z,onRetry:()=>{S(b+1),x(void 0),y?.connectRetry()},onUseDifferentWallet:t,onBack:u===i?void 0:t,numRetries:b,maxRetries:2})}}},91430:(e,t,n)=>{n.r(t),n.d(t,{ConnectionStatusScreen:()=>k,ConnectionStatusView:()=>C,default:()=>k,getErrorDetails:()=>S});var o=n(4913),r=n(26510),a=n(46898),i=n(96419),l=n(45592),c=n(15739),s=n(14348),d=n(38614),u=n(22554),p=n(6258),g=n(57889),h=n(49171),v=n(13813),f=n(55182),y=n(83813),w=n(16820),m=n(55976),x=n(77681);n(36577),n(42330),n(84440),n(50470);let b=e=>{let t=localStorage.getItem("-walletlink:https://www.walletlink.org:Addresses")?.split(" ").filter(e=>p.v(e,{strict:!0})).map(e=>g.K(e));return!!t?.length&&!!e?.linkedAccounts.filter(e=>"wallet"==e.type&&t.includes(e.address)).length},S=e=>e?.privyErrorCode===h.c.LINKED_TO_ANOTHER_USER?u.C.ERROR_USER_EXISTS:e instanceof u.P&&!e.details.default?e.details:e instanceof u.x?u.C.ERROR_TIMED_OUT:e?.privyErrorCode===h.c.CANNOT_LINK_MORE_OF_TYPE?u.C.ERROR_USER_LIMIT_REACHED:u.C.ERROR_WALLET_CONNECTION,C=({walletLogo:e,title:t,subtitle:n,signSuccess:r,errorMessage:a,connectSuccess:i,separateConnectAndSign:l,signing:s,walletConnectRedirectUri:p,walletConnectFallbackUniversalUri:g,hasTabbedAway:h,showCoinbaseWalletResetCta:v,numRetries:f,onBack:y,onSign:w,onRetry:m,onCoinbaseReset:b,onDifferentWallet:S})=>{let{t:C}=(0,d.u)(),k=v?{label:"Use a different wallet",onClick:b,disabled:r}:a===u.C.ERROR_USER_EXISTS&&y?{label:"Use a different wallet",onClick:S}:i&&!r&&l?{label:s?"Signing":"Sign with your wallet",onClick:w,disabled:s}:!r&&a?.retryable&&f<2?{label:"Retry",onClick:m,disabled:!1}:r||a?void 0:{label:C("connectionStatus.connecting"),onClick:()=>{},disabled:!0};return(0,o.jsx)(x.S,{title:t,subtitle:n,icon:e,iconVariant:"loading",iconLoadingStatus:{success:r,fail:!!a},primaryCta:k,onBack:y,watermark:!0,children:!i&&p&&!h&&(0,o.jsxs)(T,{children:[C("connectionStatus.stillHere")," ",(0,o.jsx)(c.L,{href:p,target:"_blank",variant:"underlined",size:"sm",children:C("connectionStatus.tryConnectingAgain")}),g&&(0,o.jsxs)(o.Fragment,{children:[" ",C("connectionStatus.or")," ",(0,o.jsx)(c.L,{href:g,target:"_blank",variant:"underlined",size:"sm",children:C("connectionStatus.useDifferentLink")})]})]})})},k={component:()=>{let e,[t,n]=(0,r.useState)(!1),[i,c]=(0,r.useState)(!1),[p,g]=(0,r.useState)(void 0),{authenticated:x,logout:k}=(0,f.u)(),{navigate:T,navigateBack:E,lastScreen:R,currentScreen:j,setModalData:W,data:_}=(0,f.a)(),z=(0,s.u)(),{t:A}=(0,d.u)(),{getAuthFlow:L,walletConnectionStatus:N,closePrivyModal:$,initLoginWithWallet:O,loginWithWallet:I,updateWallets:U,createAnalyticsEvent:F}=(0,h.u)(),{walletConnectors:M}=(0,f.u)(),[B,D]=(0,r.useState)(0),{user:q}=(0,f.u)(),H=(0,w.u)(),[V]=(0,r.useState)(q?.linkedAccounts.length||0),[P,Y]=(0,r.useState)(""),[X,K]=(0,r.useState)(""),[G,J]=(0,r.useState)(!1),{hasTabbedAway:Q}=function(){let[e,t]=(0,r.useState)(!1),n=(0,r.useCallback)(()=>{document.hidden&&t(!0)},[]);return(0,r.useEffect)(()=>(document.addEventListener("visibilitychange",n),()=>document.removeEventListener("visibilitychange",n)),[n]),{hasTabbedAway:e,reset:()=>t(!1)}}(),{enabled:Z,token:ee}=(0,l.a)(),et=(0,v.z)(N?.connector?.walletClientType||"unknown"),en=a.tq&&"wallet_connect_v2"===N?.connector?.connectorType||a.tq&&"coinbase_wallet"===N?.connector?.connectorType||a.tq&&"base_account"===N?.connector?.connectorType||a.tq&&"injected"===N?.connector?.connectorType&&"phantom"===N?.connector?.walletClientType||a.tq&&"solana_adapter"===N?.connector?.connectorType&&"mobile_wallet_adapter"===N.connector.walletClientType,eo="connected"===N?.status,er="switching_to_supported_chain"===N?.status;(0,r.useEffect)(()=>{let e=L(),t=e instanceof l.b||e instanceof l.S?e:void 0;eo&&"solana"===N.connector?.chainType&&"phantom"===N.connector?.walletClientType&&H(m.l)&&void 0===_?.login?.isSigningInWithLedgerSolana?T("ConnectLedgerScreen",!1):(eo&&!t&&(!Z||ee||x?O(N.connectedWallet,ee,_?.login?.disableSignup,_?.login?.isSigningInWithLedgerSolana?"transaction":"plain").then(()=>{J(!0)}):(W({captchaModalData:{callback:e=>O(N.connectedWallet,e,_?.login?.disableSignup,_?.login?.isSigningInWithLedgerSolana?"transaction":"plain").then(()=>{J(!0)}),userIntentRequired:!1,onSuccessNavigateTo:"ConnectionStatusScreen",onErrorNavigateTo:"ErrorScreen"}}),T("CaptchaScreen",!1))),t instanceof l.S&&_?.login?.isSigningInWithLedgerSolana&&(t.messageType="transaction"),t&&en&&eo&&!t.preparedMessage?t.buildMessage():t&&!en&&eo&&(i||(async()=>{c(!0),g(void 0);try{"wallet_connect_v2"===N?.connector?.connectorType&&"metamask"===N?.connector?.walletClientType&&await (0,u.m)(2500),await ei()}catch(e){console.warn("Auto-prompted signature failed",e)}finally{c(!1)}})()))},[B,eo,G]),(0,r.useEffect)(()=>{if(q&&t){let e=s.q-500;if(z?.legal.requireUsersAcceptTerms&&!q.hasAcceptedTerms){let t=setTimeout(()=>{T("AffirmativeConsentScreen")},e);return()=>clearTimeout(t)}if((0,y.s)(q,z.embeddedWallets)){let t=setTimeout(()=>{W({createWallet:{onSuccess:()=>{},onFailure:e=>{console.error(e),F({eventName:"embedded_wallet_creation_failure_logout",payload:{error:e,screen:"ConnectionStatusScreen"}}),k()},callAuthOnSuccessOnClose:!0}}),T("EmbeddedWalletOnAccountCreateScreen")},e);return()=>clearTimeout(t)}U();let t=setTimeout(()=>$({shouldCallAuthOnSuccess:!0,isSuccess:!0}),s.q);return()=>clearTimeout(t)}},[q,t]);let ea=e=>{if(e?.privyErrorCode!==h.c.ALLOWLIST_REJECTED){if(e?.privyErrorCode===h.c.USER_LIMIT_REACHED)return console.error(new h.k(e).toString()),void T("UserLimitReachedScreen");if(e?.privyErrorCode!==h.c.USER_DOES_NOT_EXIST)return e?.privyErrorCode===h.c.ACCOUNT_TRANSFER_REQUIRED&&e.data?.data?.nonce?(W({accountTransfer:{nonce:e.data?.data?.nonce,account:L()?.meta.address,displayName:e.data?.data?.account?.displayName,externalWalletMetadata:{walletClientType:L()?.meta.walletClientType,chainId:L()?.meta.chainId,connectorType:L()?.meta.connectorType},linkMethod:L() instanceof l.b?"siwe":"siws",embeddedWalletAddress:e.data?.data?.otherUser?.embeddedWalletAddress}}),void T("LinkConflictScreen")):void g(S(e));T("AccountNotFoundScreen")}else T("AllowlistRejectionScreen")};async function ei(){try{await I(),n(!0)}catch(e){ea(e)}finally{c(!1)}}(0,r.useEffect)(()=>{N?.connectError&&ea(N?.connectError)},[N]),((e,t)=>{let n=(0,r.useRef)(()=>{});(0,r.useEffect)(()=>{n.current=e}),(0,r.useEffect)(()=>{if(null!==t){let e=setInterval(()=>n.current(),t||0);return()=>clearInterval(e)}},[t])})(()=>{let e="wallet_connect_v2"===el&&N?.connector instanceof l.W?N.connector.redirectUri:void 0;e&&Y(e);let t="wallet_connect_v2"===el&&N?.connector instanceof l.W?N.connector.fallbackUniversalRedirectUri:void 0;t&&K(t)},N?.connector instanceof l.W&&!P?500:null);let el=N?.connector?.connectorType||"injected",ec=N?.connector?.walletClientType||"unknown",es=et?.metadata?.shortName||et?.name||N?.connector?.walletBranding.name||"Browser Extension",ed=et?.image_url?.md||N?.connector?.walletBranding.icon||(e=>(0,o.jsx)(l.B,{...e})),eu="Browser Extension"===es?es.toLowerCase():es;e=t?A("connectionStatus.successfullyConnected",{walletName:eu}):p?A("connectionStatus.errorTitle",{errorMessage:p.message}):er?"Switching networks":eo?i&&en?"Signing":"Sign to verify":`Waiting for ${eu}`;let ep=A("connectionStatus.checkOtherWindows");t?ep=V===(q?.linkedAccounts.length||0)?"Wallet was already linked.":"You're good to go!":B>=2&&p?ep="Unable to connect wallet":p?ep=p.detail:er?ep="Switch your wallet to the requested network.":eo&&en?ep="Sign the message in your wallet to verify it belongs to you.":"metamask"===ec&&a.tq?ep="Click continue to open and connect MetaMask.":"metamask"===ec?ep="For the best experience, connect only one wallet at a time.":"wallet_connect"===el?ep="Open your mobile wallet app to continue":"coinbase_wallet"===el?(0,u.z)()||(ep=b(q)?"Continue with the Coinbase app. Not the right wallet? Reset your connection below.":"Confirm in the Coinbase app/popup to continue."):_?.login?.isSigningInWithLedgerSolana&&(ep="Ledger requires a transaction to verify your identity. You'll sign a transaction that performs no onchain action.");let eg=M?.walletConnectors?.find(e=>"coinbase_wallet"===e.walletClientType),eh="coinbase_wallet"===ec&&(b(q)||p===u.C.ERROR_USER_EXISTS);return(0,o.jsx)(C,{walletLogo:ed,title:e,subtitle:ep,signSuccess:t,errorMessage:p,connectSuccess:eo,separateConnectAndSign:en,signing:i,walletConnectRedirectUri:P,walletConnectFallbackUniversalUri:X,hasTabbedAway:Q,showCoinbaseWalletResetCta:eh,numRetries:B,onBack:R&&j!==R?E:void 0,onSign:()=>{c(!0),ei()},onRetry:()=>{D(B+1),g(void 0),eo?(c(!0),ei()):N?.connectRetry()},onCoinbaseReset:()=>{eg&&eg?.disconnect()},onDifferentWallet:E})}},T=i.zo.p`
  text-align: center;
  color: var(--privy-color-foreground-2);
  font-size: 14px;
  line-height: 22px;
  margin: 16px 0;
`},15739:(e,t,n)=>{n.d(t,{L:()=>i});var o=n(4913),r=n(96419);let a=r.zo.a`
  && {
    color: ${({$variant:e})=>"underlined"===e?"var(--privy-color-foreground)":"var(--privy-link-navigation-color, var(--privy-color-accent))"};
    font-weight: 400;
    text-decoration: ${({$variant:e})=>"underlined"===e?"underline":"var(--privy-link-navigation-decoration, none)"};
    text-underline-offset: 4px;
    text-decoration-thickness: 1px;
    cursor: ${({$disabled:e})=>e?"not-allowed":"pointer"};
    opacity: ${({$disabled:e})=>e?.5:1};

    font-size: ${({$size:e})=>{switch(e){case"xs":return"12px";case"sm":return"14px";default:return"16px"}}};

    line-height: ${({$size:e})=>{switch(e){case"xs":return"18px";case"sm":return"22px";default:return"24px"}}};

    transition:
      color 200ms ease,
      text-decoration-color 200ms ease,
      opacity 200ms ease;

    &:hover {
      color: ${({$variant:e,$disabled:t})=>"underlined"===e?"var(--privy-color-foreground)":"var(--privy-link-navigation-color, var(--privy-color-accent))"};
      text-decoration: ${({$disabled:e})=>e?"none":"underline"};
      text-underline-offset: 4px;
    }

    &:active {
      color: ${({$variant:e,$disabled:t})=>t?"underlined"===e?"var(--privy-color-foreground)":"var(--privy-link-navigation-color, var(--privy-color-accent))":"var(--privy-color-foreground)"};
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px #949df9;
      border-radius: 2px;
    }
  }
`,i=({size:e="md",variant:t="navigation",disabled:n=!1,as:r,children:i,onClick:l,...c})=>(0,o.jsx)(a,{as:r,$size:e,$variant:t,$disabled:n,onClick:e=>{n?e.preventDefault():l?.(e)},...c,children:i})},17846:(e,t,n)=>{n.d(t,{S:()=>S});var o=n(4913),r=n(26510),a=n(96419),i=n(13813),l=n(38102),c=n(90684);let s=a.zo.div`
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
`,u=a.zo.div`
  position: relative;
  display: flex;
  flex-direction: column;
`,p=(0,a.zo)(l.M)`
  margin: 0 -8px;
`,g=a.zo.div`
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
`,h=a.zo.div`
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
`,f=a.zo.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`,y=a.zo.h3`
  && {
    font-size: 20px;
    line-height: 32px;
    font-weight: 500;
    color: var(--privy-color-foreground);
    margin: 0;
  }
`,w=a.zo.p`
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
`,x=a.zo.div`
  display: flex;
  align-items: center;
  justify-content: center;

  img,
  svg {
    max-height: 90px;
    max-width: 180px;
  }
`,b=a.zo.div`
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
`,S=({children:e,...t})=>(0,o.jsx)(s,{children:(0,o.jsx)(d,{...t,children:e})}),C=a.zo.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,k=(0,a.zo)(l.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,T=a.zo.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,E=({step:e})=>e?(0,o.jsx)(C,{children:(0,o.jsx)(T,{pct:Math.min(100,e.current/e.total*100)})}):null;S.Header=({title:e,subtitle:t,icon:n,iconVariant:r,iconLoadingStatus:a,showBack:i,onBack:l,showInfo:c,onInfo:s,showClose:d,onClose:g,step:h,headerTitle:m,...x})=>(0,o.jsxs)(u,{...x,children:[(0,o.jsx)(p,{backFn:i?l:void 0,infoFn:c?s:void 0,onClose:d?g:void 0,title:m,closeable:d}),(n||r||e||t)&&(0,o.jsxs)(v,{children:[n||r?(0,o.jsx)(S.Icon,{icon:n,variant:r,loadingStatus:a}):null,!(!e&&!t)&&(0,o.jsxs)(f,{children:[e&&(0,o.jsx)(y,{children:e}),t&&(0,o.jsx)(w,{children:t})]})]}),h&&(0,o.jsx)(E,{step:h})]}),(S.Body=r.forwardRef(({children:e,...t},n)=>(0,o.jsx)(g,{ref:n,...t,children:e}))).displayName="Screen.Body",S.Footer=({children:e,...t})=>(0,o.jsx)(h,{id:"privy-content-footer-container",...t,children:e}),S.Actions=({children:e,...t})=>(0,o.jsx)(R,{...t,children:e}),S.HelpText=({children:e,...t})=>(0,o.jsx)(j,{...t,children:e}),S.FooterText=({children:e,...t})=>(0,o.jsx)(W,{...t,children:e}),S.Watermark=()=>(0,o.jsx)(k,{}),S.Icon=({icon:e,variant:t="subtle",loadingStatus:n})=>"logo"===t&&e?(0,o.jsx)(x,"string"==typeof e?{children:(0,o.jsx)("img",{src:e,alt:""})}:r.isValidElement(e)?{children:e}:{children:r.createElement(e)}):"loading"===t?e?(0,o.jsx)(b,{children:(0,o.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,o.jsx)(i.N,{success:n?.success,fail:n?.fail}),"string"==typeof e?(0,o.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):r.isValidElement(e)?r.cloneElement(e,{style:{width:"38px",height:"38px"}}):r.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,o.jsx)(m,{$variant:t,children:(0,o.jsx)(c.N,{size:"64px"})}):(0,o.jsx)(m,{$variant:t,children:e&&("string"==typeof e?(0,o.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):r.isValidElement(e)?e:r.createElement(e,{width:32,height:32,stroke:(()=>{switch(t){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let R=a.zo.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,j=a.zo.div`
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
`,W=a.zo.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; // 11px
    line-height: 1rem; // 16px
  }
`},77681:(e,t,n)=>{n.d(t,{S:()=>i});var o=n(4913),r=n(38102),a=n(17846);let i=({primaryCta:e,secondaryCta:t,helpText:n,footerText:i,watermark:l=!0,children:c,...s})=>{let d=e||t?(0,o.jsxs)(o.Fragment,{children:[e&&(()=>{let{label:t,...n}=e,a=n.variant||"primary";return(0,o.jsx)(r.a,{...n,variant:a,style:{width:"100%",...n.style},children:t})})(),t&&(()=>{let{label:e,...n}=t,a=n.variant||"secondary";return(0,o.jsx)(r.a,{...n,variant:a,style:{width:"100%",...n.style},children:e})})()]}):null;return(0,o.jsxs)(a.S,{id:s.id,className:s.className,children:[(0,o.jsx)(a.S.Header,{...s}),c?(0,o.jsx)(a.S.Body,{children:c}):null,n||d||l?(0,o.jsxs)(a.S.Footer,{children:[n?(0,o.jsx)(a.S.HelpText,{children:n}):null,d?(0,o.jsx)(a.S.Actions,{children:d}):null,l?(0,o.jsx)(a.S.Watermark,{}):null]}):null,i?(0,o.jsx)(a.S.FooterText,{children:i}):null]})}},90684:(e,t,n)=>{n.d(t,{N:()=>a});var o=n(4913),r=n(96419);let a=({size:e,centerIcon:t})=>(0,o.jsx)(i,{$size:e,children:(0,o.jsxs)(l,{children:[(0,o.jsx)(s,{}),(0,o.jsx)(d,{}),t?(0,o.jsx)(c,{children:t}):null]})}),i=r.zo.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,l=r.zo.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,c=r.zo.div`
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
`,s=r.zo.div`
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
`,d=r.zo.div`
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
`},83813:(e,t,n)=>{n.d(t,{s:()=>r});var o=n(45592);let r=(e,t)=>(0,o.s)(e,t.ethereum.createOnLogin)||(0,o.k)(e,t.solana.createOnLogin)},38614:(e,t,n)=>{n.d(t,{u:()=>a});var o=n(14348);let r={"connectionStatus.successfullyConnected":"Successfully connected with {walletName}","connectionStatus.errorTitle":"{errorMessage}","connectionStatus.connecting":"Connecting","connectionStatus.connectOneWallet":"For the best experience, connect only one wallet at a time.","connectionStatus.checkOtherWindows":"Don't see your wallet? Check your other browser windows.","connectionStatus.stillHere":"Still here?","connectionStatus.tryConnectingAgain":"Try connecting again","connectionStatus.or":"or","connectionStatus.useDifferentLink":"use this different link","connectWallet.connectYourWallet":"Connect a wallet","connectWallet.waitingForWallet":"Waiting for {walletName}","connectWallet.connectToAccount":"Connect a wallet to your {appName} account","connectWallet.installAndConnect":"To connect to {walletName}, install and open the app. Then confirm the connection when prompted.","connectWallet.tryConnectingAgain":"Please try connecting again.","connectWallet.openInApp":"Open in app","connectWallet.copyLink":"Copy link","connectWallet.retry":"Retry","connectWallet.searchPlaceholder":"Search through {count} wallets","connectWallet.noWalletsFound":"No wallets found. Try another search.","connectWallet.lastUsed":"Last used","connectWallet.selectYourWallet":"Select your wallet","connectWallet.selectNetwork":"Select network","connectWallet.goToWallet":"Go to {walletName} to continue","connectWallet.scanToConnect":"Scan code to connect to {walletName}","connectWallet.openOrInstall":"Open or install {walletName}"};function a(){let e=(0,o.u)();return{t:(t,n)=>{var o;let a;return o=e.intl.textLocalization,a=o?.[t]??r[t],n&&0!==Object.keys(n).length?a.replace(/\{(\w+)\}/g,(e,t)=>n[t]??e):a}}}}};