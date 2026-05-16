"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[5422,3852],{5422:function(e,n,t){t.r(n),t.d(n,{ConnectOnlyStatusScreen:function(){return v},ConnectOnlyStatusScreenView:function(){return h},default:function(){return v}});var o=t(89418),r=t(4753),a=t(55982),i=t(40099),l=t(64982),c=t(61318),s=t(3010),d=t(9201),u=t(35868),p=t(5430),g=t(23852);t(78439),t(96257),t(94936),t(21628);let h=({walletLogo:e,success:n,errorMessage:t,title:r,subtitle:a,onRetry:l,onUseDifferentWallet:c,onBack:s,numRetries:d,maxRetries:p})=>(0,o.jsx)(u.S,{title:r,subtitle:a,icon:e,iconVariant:"loading",iconLoadingStatus:{success:n,fail:!!t},primaryCta:t===i.C.ERROR_USER_EXISTS?{label:"Use a different wallet",onClick:c}:!n&&t?.retryable&&d<p?{label:"Retry",onClick:l,disabled:!t?.retryable||d>=p}:!n&&t&&d>=p?{label:"Use a different wallet",onClick:c}:void 0,onBack:s,watermark:!0}),v={component:()=>{let e,{navigateBack:n,navigate:t,lastScreen:i,currentScreen:u,data:v,setModalData:f}=(0,d.a)(),{walletConnectionStatus:y,closePrivyModal:w}=(0,s.u)(),[m,x]=(0,r.useState)(void 0),[b,S]=(0,r.useState)(0),C=(0,c.z)(y?.connector?.walletClientType||"unknown"),k="connected"===y?.status,E="switching_to_supported_chain"===y?.status;(0,r.useEffect)(()=>{if(k){let e;if(v?.externalConnectWallet?.onCompleteNavigateTo){let n=v.externalConnectWallet.onCompleteNavigateTo,o=y.connectedWallet?.address;e=setTimeout(()=>{if(v.funding&&y.connector){let e=y.connector.wallets.find(e=>e.address===o);f({...v,funding:{...v.funding,connectedWallet:e}})}t(n({address:o,walletClientType:y.connector?.walletClientType,walletChainType:y.connector?.chainType}))},l.q)}else e=setTimeout(w,l.q);return()=>clearTimeout(e)}},[k]),(0,r.useEffect)(()=>{var e;y?.connectError&&(e=y?.connectError,x((0,g.getErrorDetails)(e)))},[y]);let T=y?.connector?.connectorType||"injected",R=y?.connector?.walletClientType||"unknown",_=C?.metadata?.shortName||C?.name||y?.connector?.walletBranding.name||"Browser Extension",j=C?.image_url?.md||y?.connector?.walletBranding.icon||(e=>(0,o.jsx)(p.B,{...e})),W="Browser Extension"===_?_.toLowerCase():_;e=k?`Successfully connected with ${W}`:m?m.message:E?"Switching networks":`Waiting for ${W}`;let z="Don’t see your wallet? Check your other browser windows.";return k?z="You’re good to go!":b>=2&&m?z="Unable to connect wallet":m?z=m.detail:E?z="Switch your wallet to the requested network.":"metamask"===R&&a.tq?z="Click to continue to open and connect MetaMask.":"metamask"===R?z="For the best experience, connect only one wallet at a time.":"wallet_connect_v2"===T?z="Open your mobile wallet app to continue":"coinbase_wallet"===T&&(z="Confirm in the Coinbase app/popup to continue."),(0,o.jsx)(h,{walletName:_,walletLogo:j,success:k,errorMessage:m,title:e,subtitle:z,onRetry:()=>{S(b+1),x(void 0),y?.connectRetry()},onUseDifferentWallet:n,onBack:u===i?void 0:n,numRetries:b,maxRetries:2})}}},23852:function(e,n,t){t.r(n),t.d(n,{ConnectionStatusScreen:function(){return k},ConnectionStatusView:function(){return C},default:function(){return k},getErrorDetails:function(){return S}});var o=t(89418),r=t(4753),a=t(55982),i=t(43803),l=t(5430),c=t(86717),s=t(64982),d=t(77532),u=t(40099),p=t(36702),g=t(18855),h=t(3010),v=t(61318),f=t(9201),y=t(74531),w=t(98401),m=t(58610),x=t(35868);t(78439),t(94936),t(21628),t(96257);let b=e=>{let n=localStorage.getItem("-walletlink:https://www.walletlink.org:Addresses")?.split(" ").filter(e=>p.v(e,{strict:!0})).map(e=>g.K(e));return!!n?.length&&!!e?.linkedAccounts.filter(e=>"wallet"==e.type&&n.includes(e.address)).length},S=e=>e?.privyErrorCode===h.c.LINKED_TO_ANOTHER_USER?u.C.ERROR_USER_EXISTS:e instanceof u.P&&!e.details.default?e.details:e instanceof u.x?u.C.ERROR_TIMED_OUT:e?.privyErrorCode===h.c.CANNOT_LINK_MORE_OF_TYPE?u.C.ERROR_USER_LIMIT_REACHED:u.C.ERROR_WALLET_CONNECTION,C=({walletLogo:e,title:n,subtitle:t,signSuccess:r,errorMessage:a,connectSuccess:i,separateConnectAndSign:l,signing:s,walletConnectRedirectUri:p,walletConnectFallbackUniversalUri:g,hasTabbedAway:h,showCoinbaseWalletResetCta:v,numRetries:f,onBack:y,onSign:w,onRetry:m,onCoinbaseReset:b,onDifferentWallet:S})=>{let{t:C}=(0,d.u)(),k=v?{label:"Use a different wallet",onClick:b,disabled:r}:a===u.C.ERROR_USER_EXISTS&&y?{label:"Use a different wallet",onClick:S}:i&&!r&&l?{label:s?"Signing":"Sign with your wallet",onClick:w,disabled:s}:!r&&a?.retryable&&f<2?{label:"Retry",onClick:m,disabled:!1}:r||a?void 0:{label:C("connectionStatus.connecting"),onClick:()=>{},disabled:!0};return(0,o.jsx)(x.S,{title:n,subtitle:t,icon:e,iconVariant:"loading",iconLoadingStatus:{success:r,fail:!!a},primaryCta:k,onBack:y,watermark:!0,children:!i&&p&&!h&&(0,o.jsxs)(E,{children:[C("connectionStatus.stillHere")," ",(0,o.jsx)(c.L,{href:p,target:"_blank",variant:"underlined",size:"sm",children:C("connectionStatus.tryConnectingAgain")}),g&&(0,o.jsxs)(o.Fragment,{children:[" ",C("connectionStatus.or")," ",(0,o.jsx)(c.L,{href:g,target:"_blank",variant:"underlined",size:"sm",children:C("connectionStatus.useDifferentLink")})]})]})})},k={component:()=>{var e,n;let t,i,[c,p]=(0,r.useState)(!1),[g,x]=(0,r.useState)(!1),[k,E]=(0,r.useState)(void 0),{authenticated:T,logout:R}=(0,f.u)(),{navigate:_,navigateBack:j,lastScreen:W,currentScreen:z,setModalData:A,data:N}=(0,f.a)(),L=(0,s.u)(),{t:$}=(0,d.u)(),{getAuthFlow:O,walletConnectionStatus:I,closePrivyModal:U,initLoginWithWallet:F,loginWithWallet:M,updateWallets:B,createAnalyticsEvent:D}=(0,h.u)(),{walletConnectors:q}=(0,f.u)(),[H,V]=(0,r.useState)(0),{user:P}=(0,f.u)(),Y=(0,w.u)(),[X]=(0,r.useState)(P?.linkedAccounts.length||0),[K,G]=(0,r.useState)(""),[J,Q]=(0,r.useState)(""),[Z,ee]=(0,r.useState)(!1),{hasTabbedAway:en}=function(){let[e,n]=(0,r.useState)(!1),t=(0,r.useCallback)(()=>{document.hidden&&n(!0)},[]);return(0,r.useEffect)(()=>(document.addEventListener("visibilitychange",t),()=>document.removeEventListener("visibilitychange",t)),[t]),{hasTabbedAway:e,reset:()=>n(!1)}}(),{enabled:et,token:eo}=(0,l.a)(),er=(0,v.z)(I?.connector?.walletClientType||"unknown"),ea=a.tq&&"wallet_connect_v2"===I?.connector?.connectorType||a.tq&&"coinbase_wallet"===I?.connector?.connectorType||a.tq&&"base_account"===I?.connector?.connectorType||a.tq&&"injected"===I?.connector?.connectorType&&"phantom"===I?.connector?.walletClientType||a.tq&&"solana_adapter"===I?.connector?.connectorType&&"mobile_wallet_adapter"===I.connector.walletClientType,ei="connected"===I?.status,el="switching_to_supported_chain"===I?.status;(0,r.useEffect)(()=>{let e=O(),n=e instanceof l.b||e instanceof l.S?e:void 0;ei&&"solana"===I.connector?.chainType&&"phantom"===I.connector?.walletClientType&&Y(m.l)&&void 0===N?.login?.isSigningInWithLedgerSolana?_("ConnectLedgerScreen",!1):(ei&&!n&&(!et||eo||T?F(I.connectedWallet,eo,N?.login?.disableSignup,N?.login?.isSigningInWithLedgerSolana?"transaction":"plain").then(()=>{ee(!0)}):(A({captchaModalData:{callback:e=>F(I.connectedWallet,e,N?.login?.disableSignup,N?.login?.isSigningInWithLedgerSolana?"transaction":"plain").then(()=>{ee(!0)}),userIntentRequired:!1,onSuccessNavigateTo:"ConnectionStatusScreen",onErrorNavigateTo:"ErrorScreen"}}),_("CaptchaScreen",!1))),n instanceof l.S&&N?.login?.isSigningInWithLedgerSolana&&(n.messageType="transaction"),n&&ea&&ei&&!n.preparedMessage?n.buildMessage():n&&!ea&&ei&&(g||(async()=>{x(!0),E(void 0);try{"wallet_connect_v2"===I?.connector?.connectorType&&"metamask"===I?.connector?.walletClientType&&await (0,u.m)(2500),await es()}catch(e){console.warn("Auto-prompted signature failed",e)}finally{x(!1)}})()))},[H,ei,Z]),(0,r.useEffect)(()=>{if(P&&c){let e=s.q-500;if(L?.legal.requireUsersAcceptTerms&&!P.hasAcceptedTerms){let n=setTimeout(()=>{_("AffirmativeConsentScreen")},e);return()=>clearTimeout(n)}if((0,y.s)(P,L.embeddedWallets)){let n=setTimeout(()=>{A({createWallet:{onSuccess:()=>{},onFailure:e=>{console.error(e),D({eventName:"embedded_wallet_creation_failure_logout",payload:{error:e,screen:"ConnectionStatusScreen"}}),R()},callAuthOnSuccessOnClose:!0}}),_("EmbeddedWalletOnAccountCreateScreen")},e);return()=>clearTimeout(n)}B();let n=setTimeout(()=>U({shouldCallAuthOnSuccess:!0,isSuccess:!0}),s.q);return()=>clearTimeout(n)}},[P,c]);let ec=e=>{if(e?.privyErrorCode!==h.c.ALLOWLIST_REJECTED){if(e?.privyErrorCode===h.c.USER_LIMIT_REACHED)return console.error(new h.k(e).toString()),void _("UserLimitReachedScreen");if(e?.privyErrorCode!==h.c.USER_DOES_NOT_EXIST)return e?.privyErrorCode===h.c.ACCOUNT_TRANSFER_REQUIRED&&e.data?.data?.nonce?(A({accountTransfer:{nonce:e.data?.data?.nonce,account:O()?.meta.address,displayName:e.data?.data?.account?.displayName,externalWalletMetadata:{walletClientType:O()?.meta.walletClientType,chainId:O()?.meta.chainId,connectorType:O()?.meta.connectorType},linkMethod:O() instanceof l.b?"siwe":"siws",embeddedWalletAddress:e.data?.data?.otherUser?.embeddedWalletAddress}}),void _("LinkConflictScreen")):void E(S(e));_("AccountNotFoundScreen")}else _("AllowlistRejectionScreen")};async function es(){try{await M(),p(!0)}catch(e){ec(e)}finally{x(!1)}}(0,r.useEffect)(()=>{I?.connectError&&ec(I?.connectError)},[I]),e=()=>{let e="wallet_connect_v2"===ed&&I?.connector instanceof l.W?I.connector.redirectUri:void 0;e&&G(e);let n="wallet_connect_v2"===ed&&I?.connector instanceof l.W?I.connector.fallbackUniversalRedirectUri:void 0;n&&Q(n)},n=I?.connector instanceof l.W&&!K?500:null,t=(0,r.useRef)(()=>{}),(0,r.useEffect)(()=>{t.current=e}),(0,r.useEffect)(()=>{if(null!==n){let e=setInterval(()=>t.current(),n||0);return()=>clearInterval(e)}},[n]);let ed=I?.connector?.connectorType||"injected",eu=I?.connector?.walletClientType||"unknown",ep=er?.metadata?.shortName||er?.name||I?.connector?.walletBranding.name||"Browser Extension",eg=er?.image_url?.md||I?.connector?.walletBranding.icon||(e=>(0,o.jsx)(l.B,{...e})),eh="Browser Extension"===ep?ep.toLowerCase():ep;i=c?$("connectionStatus.successfullyConnected",{walletName:eh}):k?$("connectionStatus.errorTitle",{errorMessage:k.message}):el?"Switching networks":ei?g&&ea?"Signing":"Sign to verify":`Waiting for ${eh}`;let ev=$("connectionStatus.checkOtherWindows");c?ev=X===(P?.linkedAccounts.length||0)?"Wallet was already linked.":"You're good to go!":H>=2&&k?ev="Unable to connect wallet":k?ev=k.detail:el?ev="Switch your wallet to the requested network.":ei&&ea?ev="Sign the message in your wallet to verify it belongs to you.":"metamask"===eu&&a.tq?ev="Click continue to open and connect MetaMask.":"metamask"===eu?ev="For the best experience, connect only one wallet at a time.":"wallet_connect"===ed?ev="Open your mobile wallet app to continue":"coinbase_wallet"===ed?(0,u.z)()||(ev=b(P)?"Continue with the Coinbase app. Not the right wallet? Reset your connection below.":"Confirm in the Coinbase app/popup to continue."):N?.login?.isSigningInWithLedgerSolana&&(ev="Ledger requires a transaction to verify your identity. You'll sign a transaction that performs no onchain action.");let ef=q?.walletConnectors?.find(e=>"coinbase_wallet"===e.walletClientType),ey="coinbase_wallet"===eu&&(b(P)||k===u.C.ERROR_USER_EXISTS);return(0,o.jsx)(C,{walletLogo:eg,title:i,subtitle:ev,signSuccess:c,errorMessage:k,connectSuccess:ei,separateConnectAndSign:ea,signing:g,walletConnectRedirectUri:K,walletConnectFallbackUniversalUri:J,hasTabbedAway:en,showCoinbaseWalletResetCta:ey,numRetries:H,onBack:W&&z!==W?j:void 0,onSign:()=>{x(!0),es()},onRetry:()=>{V(H+1),E(void 0),ei?(x(!0),es()):I?.connectRetry()},onCoinbaseReset:()=>{ef&&ef?.disconnect()},onDifferentWallet:j})}},E=i.zo.p`
  text-align: center;
  color: var(--privy-color-foreground-2);
  font-size: 14px;
  line-height: 22px;
  margin: 16px 0;
`},86717:function(e,n,t){t.d(n,{L:function(){return i}});var o=t(89418),r=t(43803);let a=r.zo.a`
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
      color: ${({$variant:e,$disabled:n})=>"underlined"===e?"var(--privy-color-foreground)":"var(--privy-link-navigation-color, var(--privy-color-accent))"};
      text-decoration: ${({$disabled:e})=>e?"none":"underline"};
      text-underline-offset: 4px;
    }

    &:active {
      color: ${({$variant:e,$disabled:n})=>n?"underlined"===e?"var(--privy-color-foreground)":"var(--privy-link-navigation-color, var(--privy-color-accent))":"var(--privy-color-foreground)"};
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px #949df9;
      border-radius: 2px;
    }
  }
`,i=({size:e="md",variant:n="navigation",disabled:t=!1,as:r,children:i,onClick:l,...c})=>(0,o.jsx)(a,{as:r,$size:e,$variant:n,$disabled:t,onClick:e=>{t?e.preventDefault():l?.(e)},...c,children:i})},18532:function(e,n,t){t.d(n,{S:function(){return S}});var o=t(89418),r=t(4753),a=t(43803),i=t(61318),l=t(13188),c=t(99539);let s=a.zo.div`
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
`,S=({children:e,...n})=>(0,o.jsx)(s,{children:(0,o.jsx)(d,{...n,children:e})}),C=a.zo.div`
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
`,E=a.zo.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,T=({step:e})=>e?(0,o.jsx)(C,{children:(0,o.jsx)(E,{pct:Math.min(100,e.current/e.total*100)})}):null;S.Header=({title:e,subtitle:n,icon:t,iconVariant:r,iconLoadingStatus:a,showBack:i,onBack:l,showInfo:c,onInfo:s,showClose:d,onClose:g,step:h,headerTitle:m,...x})=>(0,o.jsxs)(u,{...x,children:[(0,o.jsx)(p,{backFn:i?l:void 0,infoFn:c?s:void 0,onClose:d?g:void 0,title:m,closeable:d}),(t||r||e||n)&&(0,o.jsxs)(v,{children:[t||r?(0,o.jsx)(S.Icon,{icon:t,variant:r,loadingStatus:a}):null,!(!e&&!n)&&(0,o.jsxs)(f,{children:[e&&(0,o.jsx)(y,{children:e}),n&&(0,o.jsx)(w,{children:n})]})]}),h&&(0,o.jsx)(T,{step:h})]}),(S.Body=r.forwardRef(({children:e,...n},t)=>(0,o.jsx)(g,{ref:t,...n,children:e}))).displayName="Screen.Body",S.Footer=({children:e,...n})=>(0,o.jsx)(h,{id:"privy-content-footer-container",...n,children:e}),S.Actions=({children:e,...n})=>(0,o.jsx)(R,{...n,children:e}),S.HelpText=({children:e,...n})=>(0,o.jsx)(_,{...n,children:e}),S.FooterText=({children:e,...n})=>(0,o.jsx)(j,{...n,children:e}),S.Watermark=()=>(0,o.jsx)(k,{}),S.Icon=({icon:e,variant:n="subtle",loadingStatus:t})=>"logo"===n&&e?(0,o.jsx)(x,"string"==typeof e?{children:(0,o.jsx)("img",{src:e,alt:""})}:r.isValidElement(e)?{children:e}:{children:r.createElement(e)}):"loading"===n?e?(0,o.jsx)(b,{children:(0,o.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,o.jsx)(i.N,{success:t?.success,fail:t?.fail}),"string"==typeof e?(0,o.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):r.isValidElement(e)?r.cloneElement(e,{style:{width:"38px",height:"38px"}}):r.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,o.jsx)(m,{$variant:n,children:(0,o.jsx)(c.N,{size:"64px"})}):(0,o.jsx)(m,{$variant:n,children:e&&("string"==typeof e?(0,o.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):r.isValidElement(e)?e:r.createElement(e,{width:32,height:32,stroke:(()=>{switch(n){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let R=a.zo.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,_=a.zo.div`
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
`,j=a.zo.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; // 11px
    line-height: 1rem; // 16px
  }
`},35868:function(e,n,t){t.d(n,{S:function(){return i}});var o=t(89418),r=t(13188),a=t(18532);let i=({primaryCta:e,secondaryCta:n,helpText:t,footerText:i,watermark:l=!0,children:c,...s})=>{let d=e||n?(0,o.jsxs)(o.Fragment,{children:[e&&(()=>{let{label:n,...t}=e,a=t.variant||"primary";return(0,o.jsx)(r.a,{...t,variant:a,style:{width:"100%",...t.style},children:n})})(),n&&(()=>{let{label:e,...t}=n,a=t.variant||"secondary";return(0,o.jsx)(r.a,{...t,variant:a,style:{width:"100%",...t.style},children:e})})()]}):null;return(0,o.jsxs)(a.S,{id:s.id,className:s.className,children:[(0,o.jsx)(a.S.Header,{...s}),c?(0,o.jsx)(a.S.Body,{children:c}):null,t||d||l?(0,o.jsxs)(a.S.Footer,{children:[t?(0,o.jsx)(a.S.HelpText,{children:t}):null,d?(0,o.jsx)(a.S.Actions,{children:d}):null,l?(0,o.jsx)(a.S.Watermark,{}):null]}):null,i?(0,o.jsx)(a.S.FooterText,{children:i}):null]})}},99539:function(e,n,t){t.d(n,{N:function(){return a}});var o=t(89418),r=t(43803);let a=({size:e,centerIcon:n})=>(0,o.jsx)(i,{$size:e,children:(0,o.jsxs)(l,{children:[(0,o.jsx)(s,{}),(0,o.jsx)(d,{}),n?(0,o.jsx)(c,{children:n}):null]})}),i=r.zo.div`
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
`},74531:function(e,n,t){t.d(n,{s:function(){return r}});var o=t(5430);let r=(e,n)=>(0,o.s)(e,n.ethereum.createOnLogin)||(0,o.k)(e,n.solana.createOnLogin)},77532:function(e,n,t){t.d(n,{u:function(){return a}});var o=t(64982);let r={"connectionStatus.successfullyConnected":"Successfully connected with {walletName}","connectionStatus.errorTitle":"{errorMessage}","connectionStatus.connecting":"Connecting","connectionStatus.connectOneWallet":"For the best experience, connect only one wallet at a time.","connectionStatus.checkOtherWindows":"Don't see your wallet? Check your other browser windows.","connectionStatus.stillHere":"Still here?","connectionStatus.tryConnectingAgain":"Try connecting again","connectionStatus.or":"or","connectionStatus.useDifferentLink":"use this different link","connectWallet.connectYourWallet":"Connect a wallet","connectWallet.waitingForWallet":"Waiting for {walletName}","connectWallet.connectToAccount":"Connect a wallet to your {appName} account","connectWallet.installAndConnect":"To connect to {walletName}, install and open the app. Then confirm the connection when prompted.","connectWallet.tryConnectingAgain":"Please try connecting again.","connectWallet.openInApp":"Open in app","connectWallet.copyLink":"Copy link","connectWallet.retry":"Retry","connectWallet.searchPlaceholder":"Search through {count} wallets","connectWallet.noWalletsFound":"No wallets found. Try another search.","connectWallet.lastUsed":"Last used","connectWallet.selectYourWallet":"Select your wallet","connectWallet.selectNetwork":"Select network","connectWallet.goToWallet":"Go to {walletName} to continue","connectWallet.scanToConnect":"Scan code to connect to {walletName}","connectWallet.openOrInstall":"Open or install {walletName}"};function a(){let e=(0,o.u)();return{t:(n,t)=>{var o;let a;return o=e.intl.textLocalization,a=o?.[n]??r[n],t&&0!==Object.keys(t).length?a.replace(/\{(\w+)\}/g,(e,n)=>t[n]??e):a}}}}}]);