"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[4351],{34972:function(e,r,t){var i=t(4753);let o=i.forwardRef(function(e,r){let{title:t,titleId:o,...n}=e;return i.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:r,"aria-labelledby":o},n),t?i.createElement("title",{id:o},t):null,i.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"}))});r.Z=o},14882:function(e,r,t){t.r(r),t.d(r,{OAuthStatusScreen:function(){return b},OAuthStatusScreenView:function(){return x},default:function(){return b}});var i=t(89418),o=t(4753),n=t(9201),a=t(7570),c=t(34972),l=t(85408),s=t(64982),d=t(3010),u=t(74531),p=t(35868),g=t(62617),h=t(5430);t(96257),t(78439),t(55982),t(94936),t(21628);let v=({style:e})=>(0,i.jsx)(c.Z,{style:{color:"var(--privy-color-error)",...e}}),m={google:{name:"Google",component:a.G},discord:{name:"Discord",component:a.D},github:{name:"Github",component:a.b},linkedin:{name:"LinkedIn",component:a.L},twitter:{name:"Twitter",component:a.a},spotify:{name:"Spotify",component:a.S},instagram:{name:"Instagram",component:a.I},tiktok:{name:"Tiktok",component:a.T},line:{name:"LINE",component:l.L},twitch:{name:"Twitch",component:l.T},apple:{name:"Apple",component:a.A}},f=({iconUrl:e,...r})=>o.createElement("svg",{width:"33",height:"32",viewBox:"0 0 33 32",fill:"none",xmlns:"http://www.w3.org/2000/svg",...r},o.createElement("foreignObject",{x:"2",y:"2",width:"29",height:"28"},o.createElement("img",{src:e,width:"29",height:"28",style:{display:"block",objectFit:"contain",borderRadius:"4px"},alt:"Provider icon"}))),y=(e,r)=>{if(e in m)return m[e];if((0,n.i)(e)&&r){let t=r.find(r=>r.provider===e);if(t)return{name:t.provider_display_name,component:e=>o.createElement(f,{...e,iconUrl:t.provider_icon_url})}}return{name:"Unknown",component:v}},x=({providerName:e,ProviderLogo:r,success:t,errorMessage:o,onRetry:n})=>{let a=t?`Successfully connected with ${e}`:o?o.message:`Verifying connection to ${e}`;return(0,i.jsx)(p.S,{title:a,subtitle:t?"You're good to go!":o?o.detail:"Just a few moments more",icon:r,iconVariant:"loading",iconLoadingStatus:{success:t,fail:!!o},secondaryCta:o?.retryable&&n?{label:"Retry",onClick:n}:void 0,watermark:!0})},b={component:()=>{let{authenticated:e,logout:r,ready:t,user:a}=(0,n.u)(),{setModalData:c,navigate:l,resetNavigation:p}=(0,n.a)(),v=(0,s.u)(),{getAuthMeta:m,initLoginWithOAuth:f,loginWithOAuth:b,updateWallets:w,setReadyToTrue:E,closePrivyModal:k,createAnalyticsEvent:S}=(0,d.u)(),[j,A]=(0,o.useState)(!1),[z,T]=(0,o.useState)(void 0),C=m()?.provider||"google",{name:_,component:O}=y(C,v.customOAuthProviders);return(0,o.useEffect)(()=>{b(C).then(()=>{A(!0),E(!0)}).catch(e=>{if(E(!1),e?.privyErrorCode===d.c.ALLOWLIST_REJECTED)return T(void 0),p(),void l("AllowlistRejectionScreen");if(e?.privyErrorCode===d.c.USER_LIMIT_REACHED)return console.error(new d.k(e).toString()),T(void 0),p(),void l("UserLimitReachedScreen");if(e?.privyErrorCode===d.c.USER_DOES_NOT_EXIST)return T(void 0),p(),void l("AccountNotFoundScreen");if(e?.privyErrorCode===d.c.ACCOUNT_TRANSFER_REQUIRED&&e.data?.data?.nonce)return T(void 0),p(),c({accountTransfer:{nonce:e.data?.data?.nonce,account:e.data?.data?.subject,displayName:e.data?.data?.account?.displayName,linkMethod:m()?.provider,embeddedWalletAddress:e.data?.data?.otherUser?.embeddedWalletAddress,oAuthUserInfo:e.data?.data?.otherUser?.oAuthUserInfo}}),void l("LinkConflictScreen");let{retryable:r,detail:t}=function(e,r,t){let i={detail:"",retryable:!1},o=(0,g.e)(r);if(e?.privyErrorCode===d.c.LINKED_TO_ANOTHER_USER&&(i.detail="This account has already been linked to another user."),e?.privyErrorCode===d.c.INVALID_CREDENTIALS&&(i.retryable=!0,i.detail="Something went wrong. Try again."),e.privyErrorCode===d.c.OAUTH_USER_DENIED&&(i.detail=`Retry and check ${o} to finish connecting your account.`,i.retryable=!0),e?.privyErrorCode===d.c.TOO_MANY_REQUESTS&&(i.detail="Too many requests. Please wait before trying again."),e?.privyErrorCode===d.c.TOO_MANY_REQUESTS&&e.message.includes("provider rate limit")){let e=y(r,t).name;i.detail=`Request limit reached for ${e}. Please wait a moment and try again.`}if(e?.privyErrorCode===d.c.OAUTH_ACCOUNT_SUSPENDED){let e=y(r,t).name;i.detail=`Your ${e} account is suspended. Please try another login method.`}return e?.privyErrorCode===d.c.CANNOT_LINK_MORE_OF_TYPE&&(i.detail="You cannot authorize more than one account for this user."),e?.privyErrorCode===d.c.OAUTH_UNEXPECTED&&r.startsWith("privy:")&&(i.detail="Something went wrong. Please try again."),i}(e,C,v.customOAuthProviders);T({retryable:r,detail:t,message:"Authentication failed"})}).finally(()=>{(0,h.l)()})},[_,C]),(0,o.useEffect)(()=>{if(t&&e&&j&&a){if(v?.legal.requireUsersAcceptTerms&&!a.hasAcceptedTerms){let e=setTimeout(()=>{l("AffirmativeConsentScreen")},s.q);return()=>clearTimeout(e)}if((0,u.s)(a,v.embeddedWallets)){let e=setTimeout(()=>{c({createWallet:{onSuccess:()=>{},onFailure:e=>{console.error(e),S({eventName:"embedded_wallet_creation_failure_logout",payload:{error:e,provider:C,screen:"OAuthStatusScreen"}}),r()},callAuthOnSuccessOnClose:!0}}),l("EmbeddedWalletOnAccountCreateScreen")},s.q);return()=>clearTimeout(e)}{let e=setTimeout(()=>k({shouldCallAuthOnSuccess:!0,isSuccess:!0}),s.q);return w(),()=>clearTimeout(e)}}},[t,e,j,a]),(0,i.jsx)(x,{providerName:_,ProviderLogo:O,success:j,errorMessage:z,onRetry:z?.retryable?()=>{(0,h.l)(),f(C),T(void 0)}:void 0})},isShownBeforeReady:!0}},18532:function(e,r,t){t.d(r,{S:function(){return E}});var i=t(89418),o=t(4753),n=t(43803),a=t(61318),c=t(13188),l=t(99539);let s=n.zo.div`
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
`,p=(0,n.zo)(c.M)`
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
`,m=n.zo.div`
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
`,x=n.zo.div`
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
`,E=({children:e,...r})=>(0,i.jsx)(s,{children:(0,i.jsx)(d,{...r,children:e})}),k=n.zo.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,S=(0,n.zo)(c.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,j=n.zo.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,A=({step:e})=>e?(0,i.jsx)(k,{children:(0,i.jsx)(j,{pct:Math.min(100,e.current/e.total*100)})}):null;E.Header=({title:e,subtitle:r,icon:t,iconVariant:o,iconLoadingStatus:n,showBack:a,onBack:c,showInfo:l,onInfo:s,showClose:d,onClose:g,step:h,headerTitle:x,...b})=>(0,i.jsxs)(u,{...b,children:[(0,i.jsx)(p,{backFn:a?c:void 0,infoFn:l?s:void 0,onClose:d?g:void 0,title:x,closeable:d}),(t||o||e||r)&&(0,i.jsxs)(v,{children:[t||o?(0,i.jsx)(E.Icon,{icon:t,variant:o,loadingStatus:n}):null,!(!e&&!r)&&(0,i.jsxs)(m,{children:[e&&(0,i.jsx)(f,{children:e}),r&&(0,i.jsx)(y,{children:r})]})]}),h&&(0,i.jsx)(A,{step:h})]}),(E.Body=o.forwardRef(({children:e,...r},t)=>(0,i.jsx)(g,{ref:t,...r,children:e}))).displayName="Screen.Body",E.Footer=({children:e,...r})=>(0,i.jsx)(h,{id:"privy-content-footer-container",...r,children:e}),E.Actions=({children:e,...r})=>(0,i.jsx)(z,{...r,children:e}),E.HelpText=({children:e,...r})=>(0,i.jsx)(T,{...r,children:e}),E.FooterText=({children:e,...r})=>(0,i.jsx)(C,{...r,children:e}),E.Watermark=()=>(0,i.jsx)(S,{}),E.Icon=({icon:e,variant:r="subtle",loadingStatus:t})=>"logo"===r&&e?(0,i.jsx)(b,"string"==typeof e?{children:(0,i.jsx)("img",{src:e,alt:""})}:o.isValidElement(e)?{children:e}:{children:o.createElement(e)}):"loading"===r?e?(0,i.jsx)(w,{children:(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,i.jsx)(a.N,{success:t?.success,fail:t?.fail}),"string"==typeof e?(0,i.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):o.isValidElement(e)?o.cloneElement(e,{style:{width:"38px",height:"38px"}}):o.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,i.jsx)(x,{$variant:r,children:(0,i.jsx)(l.N,{size:"64px"})}):(0,i.jsx)(x,{$variant:r,children:e&&("string"==typeof e?(0,i.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):o.isValidElement(e)?e:o.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let z=n.zo.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,T=n.zo.div`
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
`},62617:function(e,r,t){t.d(r,{e:function(){return i}});function i(e){return e.charAt(0).toUpperCase()+e.slice(1)}},99539:function(e,r,t){t.d(r,{N:function(){return n}});var i=t(89418),o=t(43803);let n=({size:e,centerIcon:r})=>(0,i.jsx)(a,{$size:e,children:(0,i.jsxs)(c,{children:[(0,i.jsx)(s,{}),(0,i.jsx)(d,{}),r?(0,i.jsx)(l,{children:r}):null]})}),a=o.zo.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,c=o.zo.div`
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
`,s=o.zo.div`
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
`},74531:function(e,r,t){t.d(r,{s:function(){return o}});var i=t(5430);let o=(e,r)=>(0,i.s)(e,r.ethereum.createOnLogin)||(0,i.k)(e,r.solana.createOnLogin)}}]);