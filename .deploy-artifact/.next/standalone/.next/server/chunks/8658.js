"use strict";exports.id=8658,exports.ids=[8658],exports.modules={98639:(e,r,i)=>{i.d(r,{Z:()=>t});var o=i(26510);let t=o.forwardRef(function({title:e,titleId:r,...i},t){return o.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:t,"aria-labelledby":r},i),e?o.createElement("title",{id:r},e):null,o.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"}))})},65213:(e,r,i)=>{i.d(r,{Z:()=>t});var o=i(26510);let t=o.forwardRef(function({title:e,titleId:r,...i},t){return o.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:t,"aria-labelledby":r},i),e?o.createElement("title",{id:r},e):null,o.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"}))})},98658:(e,r,i)=>{i.r(r),i.d(r,{AwaitingPasswordlessCodeScreen:()=>E,AwaitingPasswordlessCodeScreenView:()=>f,default:()=>E});var o=i(4913),t=i(26510);let n=t.forwardRef(function({title:e,titleId:r,...i},o){return t.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor","aria-hidden":"true","data-slot":"icon",ref:o,"aria-labelledby":r},i),e?t.createElement("title",{id:r},e):null,t.createElement("path",{fillRule:"evenodd",d:"M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z",clipRule:"evenodd"}))});var a=i(98639),l=i(65213),s=i(46898),c=i(96419),d=i(38198),p=i(15739),u=i(14348),v=i(49171),x=i(55182),g=i(83813),h=i(77681);i(50470),i(36577),i(42330),i(84440);let f=({contactMethod:e,authFlow:r,emailDomain:i,appName:c="Privy",whatsAppEnabled:u=!1,onBack:v,onCodeSubmit:x,onResend:g,errorMessage:f,success:b=!1,resendCountdown:w=0,onInvalidInput:j,onClearError:k})=>{let[E,N]=(0,t.useState)(y);(0,t.useEffect)(()=>{f||N(y)},[f]);let _=async e=>{e.preventDefault();let r=e.currentTarget.value.replace(" ","");if(""===r)return;if(isNaN(Number(r)))return void j?.("Code should be numeric");k?.();let i=Number(e.currentTarget.name?.charAt(5)),o=[...r||[""]].slice(0,m-i),t=[...E.slice(0,i),...o,...E.slice(i+o.length)];N(t);let n=Math.min(Math.max(i+o.length,0),m-1);if(!isNaN(Number(e.currentTarget.value))){let e=document.querySelector(`input[name=code-${n}]`);e?.focus()}if(t.every(e=>e&&!isNaN(+e))){let e=document.querySelector(`input[name=code-${n}]`);e?.blur(),await x?.(t.join(""))}};return(0,o.jsx)(h.S,{title:"Enter confirmation code",subtitle:(0,o.jsxs)("span","email"===r?{children:["Please check ",(0,o.jsx)(T,{children:e})," for an email from"," ",i??"privy.io"," and enter your code below."]}:{children:["Please check ",(0,o.jsx)(T,{children:e})," for a",u?" WhatsApp":""," message from ",c," and enter your code below."]}),icon:"email"===r?a.Z:l.Z,onBack:v,showBack:!0,helpText:(0,o.jsxs)($,{children:[(0,o.jsxs)("span",{children:["Didn't get ","email"===r?"an email":"a message","?"]}),w?(0,o.jsxs)(A,{children:[(0,o.jsx)(n,{color:"var(--privy-color-foreground)",strokeWidth:1.33,height:"12px",width:"12px"}),(0,o.jsx)("span",{children:"Code sent"})]}):(0,o.jsx)(p.L,{as:"button",size:"sm",onClick:g,children:"Resend code"})]}),children:(0,o.jsx)(z,{children:(0,o.jsx)(d.H,{children:(0,o.jsxs)(S,{children:[(0,o.jsx)("div",{children:E.map((e,r)=>(0,o.jsx)("input",{name:`code-${r}`,type:"text",value:E[r],onChange:_,onKeyUp:e=>{"Backspace"===e.key&&(e=>{if(k?.(),N([...E.slice(0,e),"",...E.slice(e+1)]),e>0){let r=document.querySelector(`input[name=code-${e-1}]`);r?.focus()}})(r)},inputMode:"numeric",autoFocus:0===r,pattern:"[0-9]",className:`${b?"success":""} ${f?"fail":""}`,autoComplete:s.tq?"one-time-code":"off"},r))}),(0,o.jsx)(C,{$fail:!!f,$success:b,children:(0,o.jsx)("span",{children:"Invalid or expired verification code"===f?"Incorrect code":f||(b?"Success!":"")})})]})})})})},m=6,y=Array(6).fill("");var b,w,j=((b=j||{})[b.RESET_AFTER_DELAY=0]="RESET_AFTER_DELAY",b[b.CLEAR_ON_NEXT_VALID_INPUT=1]="CLEAR_ON_NEXT_VALID_INPUT",b),k=((w=k||{})[w.EMAIL=0]="EMAIL",w[w.SMS=1]="SMS",w);let E={component:()=>{let{navigate:e,lastScreen:r,navigateBack:i,setModalData:n,onUserCloseViaDialogOrKeybindRef:a}=(0,x.a)(),l=(0,u.u)(),{closePrivyModal:s,resendEmailCode:c,resendSmsCode:d,getAuthMeta:p,loginWithCode:h,updateWallets:m,createAnalyticsEvent:y}=(0,v.u)(),{authenticated:b,logout:w,user:j}=(0,x.u)(),{whatsAppEnabled:k}=(0,u.u)(),[E,z]=(0,t.useState)(!1),[S,C]=(0,t.useState)(null),[$,A]=(0,t.useState)(null),[T,N]=(0,t.useState)(0);a.current=()=>null;let _=p()?.email?0:1,I=0===_?p()?.email||"":p()?.phoneNumber||"",R=u.q-500;return(0,t.useEffect)(()=>{if(T){let e=setTimeout(()=>{N(T-1)},1e3);return()=>clearTimeout(e)}},[T]),(0,t.useEffect)(()=>{if(b&&E&&j){if(l?.legal.requireUsersAcceptTerms&&!j.hasAcceptedTerms){let r=setTimeout(()=>{e("AffirmativeConsentScreen")},R);return()=>clearTimeout(r)}if((0,g.s)(j,l.embeddedWallets)){let r=setTimeout(()=>{n({createWallet:{onSuccess:()=>{},onFailure:e=>{console.error(e),y({eventName:"embedded_wallet_creation_failure_logout",payload:{error:e,screen:"AwaitingPasswordlessCodeScreen"}}),w()},callAuthOnSuccessOnClose:!0}}),e("EmbeddedWalletOnAccountCreateScreen")},R);return()=>clearTimeout(r)}{m();let e=setTimeout(()=>s({shouldCallAuthOnSuccess:!0,isSuccess:!0}),u.q);return()=>clearTimeout(e)}}},[b,E,j]),(0,t.useEffect)(()=>{if(S&&0===$){let e=setTimeout(()=>{C(null),A(null);let e=document.querySelector("input[name=code-0]");e?.focus()},1400);return()=>clearTimeout(e)}},[S,$]),(0,o.jsx)(f,{contactMethod:I,authFlow:0===_?"email":"sms",emailDomain:l?.appearance.emailDomain,appName:l?.name,whatsAppEnabled:k,onBack:()=>i(),onCodeSubmit:async i=>{try{await h(i),z(!0)}catch(i){if(i instanceof v.e&&i.privyErrorCode===v.c.INVALID_CREDENTIALS)C("Invalid or expired verification code"),A(0);else if(i instanceof v.e&&i.privyErrorCode===v.c.CANNOT_LINK_MORE_OF_TYPE)C(i.message);else{if(i instanceof v.e&&i.privyErrorCode===v.c.USER_LIMIT_REACHED)return console.error(new v.k(i).toString()),void e("UserLimitReachedScreen");if(i instanceof v.e&&i.privyErrorCode===v.c.USER_DOES_NOT_EXIST)return void e("AccountNotFoundScreen");if(i instanceof v.e&&i.privyErrorCode===v.c.LINKED_TO_ANOTHER_USER)return n({errorModalData:{error:i,previousScreen:r??"AwaitingPasswordlessCodeScreen"}}),void e("ErrorScreen",!1);if(i instanceof v.e&&i.privyErrorCode===v.c.DISALLOWED_PLUS_EMAIL)return n({inlineError:{error:i}}),void e("ConnectOrCreateScreen",!1);if(i instanceof v.e&&i.privyErrorCode===v.c.ACCOUNT_TRANSFER_REQUIRED&&i.data?.data?.nonce)return n({accountTransfer:{nonce:i.data?.data?.nonce,account:I,displayName:i.data?.data?.account?.displayName,linkMethod:0===_?"email":"sms",embeddedWalletAddress:i.data?.data?.otherUser?.embeddedWalletAddress}}),void e("LinkConflictScreen");C("Issue verifying code"),A(0)}}},onResend:async()=>{N(30),0===_?await c():await d()},errorMessage:S||void 0,success:E,resendCountdown:T,onInvalidInput:e=>{C(e),A(1)},onClearError:()=>{1===$&&(C(null),A(null))}})}},z=c.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: auto;
  gap: 16px;
  flex-grow: 1;
  width: 100%;
`,S=c.zo.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 12px;

  > div:first-child {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    border-radius: var(--privy-border-radius-sm);

    > input {
      border: 1px solid var(--privy-color-foreground-4);
      background: var(--privy-color-background);
      border-radius: var(--privy-border-radius-sm);
      padding: 8px 10px;
      height: 48px;
      width: 40px;
      text-align: center;
      font-size: 18px;
      font-weight: 600;
      color: var(--privy-color-foreground);
      transition: all 0.2s ease;
    }

    > input:focus {
      border: 1px solid var(--privy-color-foreground);
      box-shadow: 0 0 0 1px var(--privy-color-foreground);
    }

    > input:invalid {
      border: 1px solid var(--privy-color-error);
    }

    > input.success {
      border: 1px solid var(--privy-color-border-success);
      background: var(--privy-color-success-bg);
    }

    > input.fail {
      border: 1px solid var(--privy-color-border-error);
      background: var(--privy-color-error-bg);
      animation: shake 180ms;
      animation-iteration-count: 2;
    }
  }

  @keyframes shake {
    0% {
      transform: translate(1px, 0px);
    }
    33% {
      transform: translate(-1px, 0px);
    }
    67% {
      transform: translate(-1px, 0px);
    }
    100% {
      transform: translate(1px, 0px);
    }
  }
`,C=c.zo.div`
  line-height: 20px;
  min-height: 20px;
  font-size: 14px;
  font-weight: 400;
  color: ${e=>e.$success?"var(--privy-color-success-dark)":e.$fail?"var(--privy-color-error-dark)":"transparent"};
  display: flex;
  justify-content: center;
  width: 100%;
  text-align: center;
`,$=c.zo.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 100%;
  color: var(--privy-color-foreground-2);
`,A=c.zo.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--privy-border-radius-sm);
  padding: 2px 8px;
  gap: 4px;
  background: var(--privy-color-background-2);
  color: var(--privy-color-foreground-2);
`,T=c.zo.span`
  font-weight: 500;
  word-break: break-all;
  color: var(--privy-color-foreground);
`},38198:(e,r,i)=>{i.d(r,{B:()=>t,C:()=>l,F:()=>c,H:()=>a,R:()=>v,S:()=>p,a:()=>d,b:()=>u,c:()=>s,d:()=>x,e:()=>n});var o=i(96419);let t=o.zo.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  margin-top: auto;
  gap: 16px;
  flex-grow: 100;
`,n=o.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  width: 100%;
`,a=o.zo.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`,l=(0,o.zo)(n)`
  padding: 20px 0;
`,s=(0,o.zo)(n)`
  gap: 16px;
`,c=o.zo.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`,d=o.zo.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;o.zo.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;let p=o.zo.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  text-align: left;
  gap: 8px;
  padding: 16px;
  margin-top: 16px;
  margin-bottom: 16px;
  width: 100%;
  background: var(--privy-color-background-2);
  border-radius: var(--privy-border-radius-md);
  && h4 {
    color: var(--privy-color-foreground-3);
    font-size: 14px;
    text-decoration: underline;
    font-weight: medium;
  }
  && p {
    color: var(--privy-color-foreground-3);
    font-size: 14px;
  }
`,u=o.zo.div`
  height: 16px;
`,v=o.zo.div`
  height: 12px;
`;o.zo.div`
  position: relative;
`;let x=o.zo.div`
  height: ${e=>e.height??"12"}px;
`;o.zo.div`
  background-color: var(--privy-color-accent);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border-color: white;
  border-width: 2px !important;
`},15739:(e,r,i)=>{i.d(r,{L:()=>a});var o=i(4913),t=i(96419);let n=t.zo.a`
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
      color: ${({$variant:e,$disabled:r})=>"underlined"===e?"var(--privy-color-foreground)":"var(--privy-link-navigation-color, var(--privy-color-accent))"};
      text-decoration: ${({$disabled:e})=>e?"none":"underline"};
      text-underline-offset: 4px;
    }

    &:active {
      color: ${({$variant:e,$disabled:r})=>r?"underlined"===e?"var(--privy-color-foreground)":"var(--privy-link-navigation-color, var(--privy-color-accent))":"var(--privy-color-foreground)"};
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px #949df9;
      border-radius: 2px;
    }
  }
`,a=({size:e="md",variant:r="navigation",disabled:i=!1,as:t,children:a,onClick:l,...s})=>(0,o.jsx)(n,{as:t,$size:e,$variant:r,$disabled:i,onClick:e=>{i?e.preventDefault():l?.(e)},...s,children:a})},17846:(e,r,i)=>{i.d(r,{S:()=>j});var o=i(4913),t=i(26510),n=i(96419),a=i(13813),l=i(38102),s=i(90684);let c=n.zo.div`
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
`,v=n.zo.div`
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
`,x=n.zo.div`
  display: flex;
  flex-direction: column;
  gap: var(--screen-space-lg);
  margin-top: 1.5rem;
`,g=n.zo.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--screen-space);
`,h=n.zo.div`
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
`,m=n.zo.p`
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
`,j=({children:e,...r})=>(0,o.jsx)(c,{children:(0,o.jsx)(d,{...r,children:e})}),k=n.zo.div`
  position: absolute;
  top: 0;
  left: calc(-1 * var(--screen-space-lg));
  width: calc(100% + calc(var(--screen-space-lg) * 2));
  height: 4px;
  background: var(--privy-color-background-2);
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
  overflow: hidden;
`,E=(0,n.zo)(l.B)`
  padding: 0;
  && a {
    padding: 0;
    color: var(--privy-color-foreground-3);
  }
`,z=n.zo.div`
  height: 100%;
  width: ${({pct:e})=>e}%;
  background: var(--privy-color-foreground-3);
  border-radius: 2px;
  transition: width 300ms ease-in-out;
`,S=({step:e})=>e?(0,o.jsx)(k,{children:(0,o.jsx)(z,{pct:Math.min(100,e.current/e.total*100)})}):null;j.Header=({title:e,subtitle:r,icon:i,iconVariant:t,iconLoadingStatus:n,showBack:a,onBack:l,showInfo:s,onInfo:c,showClose:d,onClose:v,step:x,headerTitle:y,...b})=>(0,o.jsxs)(p,{...b,children:[(0,o.jsx)(u,{backFn:a?l:void 0,infoFn:s?c:void 0,onClose:d?v:void 0,title:y,closeable:d}),(i||t||e||r)&&(0,o.jsxs)(g,{children:[i||t?(0,o.jsx)(j.Icon,{icon:i,variant:t,loadingStatus:n}):null,!(!e&&!r)&&(0,o.jsxs)(h,{children:[e&&(0,o.jsx)(f,{children:e}),r&&(0,o.jsx)(m,{children:r})]})]}),x&&(0,o.jsx)(S,{step:x})]}),(j.Body=t.forwardRef(({children:e,...r},i)=>(0,o.jsx)(v,{ref:i,...r,children:e}))).displayName="Screen.Body",j.Footer=({children:e,...r})=>(0,o.jsx)(x,{id:"privy-content-footer-container",...r,children:e}),j.Actions=({children:e,...r})=>(0,o.jsx)(C,{...r,children:e}),j.HelpText=({children:e,...r})=>(0,o.jsx)($,{...r,children:e}),j.FooterText=({children:e,...r})=>(0,o.jsx)(A,{...r,children:e}),j.Watermark=()=>(0,o.jsx)(E,{}),j.Icon=({icon:e,variant:r="subtle",loadingStatus:i})=>"logo"===r&&e?(0,o.jsx)(b,"string"==typeof e?{children:(0,o.jsx)("img",{src:e,alt:""})}:t.isValidElement(e)?{children:e}:{children:t.createElement(e)}):"loading"===r?e?(0,o.jsx)(w,{children:(0,o.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,o.jsx)(a.N,{success:i?.success,fail:i?.fail}),"string"==typeof e?(0,o.jsx)("span",{style:{background:`url('${e}') 0 0 / contain`,height:"38px",width:"38px",borderRadius:"6px",margin:"auto",backgroundSize:"contain"}}):t.isValidElement(e)?t.cloneElement(e,{style:{width:"38px",height:"38px"}}):t.createElement(e,{style:{width:"38px",height:"38px"}})]})}):(0,o.jsx)(y,{$variant:r,children:(0,o.jsx)(s.N,{size:"64px"})}):(0,o.jsx)(y,{$variant:r,children:e&&("string"==typeof e?(0,o.jsx)("img",{src:e,alt:"",style:{width:"32px",height:"32px",borderRadius:"6px"}}):t.isValidElement(e)?e:t.createElement(e,{width:32,height:32,stroke:(()=>{switch(r){case"success":return"var(--privy-color-icon-success)";case"warning":return"var(--privy-color-icon-warning)";case"error":return"var(--privy-color-icon-error)";default:return"var(--privy-color-icon-muted)"}})(),strokeWidth:2}))});let C=n.zo.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: calc(var(--screen-space) / 2);
`,$=n.zo.div`
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
`,A=n.zo.div`
  && {
    margin-top: -1rem;
    width: 100%;
    text-align: center;
    color: var(--privy-color-foreground-2);
    font-size: 0.6875rem; // 11px
    line-height: 1rem; // 16px
  }
`},77681:(e,r,i)=>{i.d(r,{S:()=>a});var o=i(4913),t=i(38102),n=i(17846);let a=({primaryCta:e,secondaryCta:r,helpText:i,footerText:a,watermark:l=!0,children:s,...c})=>{let d=e||r?(0,o.jsxs)(o.Fragment,{children:[e&&(()=>{let{label:r,...i}=e,n=i.variant||"primary";return(0,o.jsx)(t.a,{...i,variant:n,style:{width:"100%",...i.style},children:r})})(),r&&(()=>{let{label:e,...i}=r,n=i.variant||"secondary";return(0,o.jsx)(t.a,{...i,variant:n,style:{width:"100%",...i.style},children:e})})()]}):null;return(0,o.jsxs)(n.S,{id:c.id,className:c.className,children:[(0,o.jsx)(n.S.Header,{...c}),s?(0,o.jsx)(n.S.Body,{children:s}):null,i||d||l?(0,o.jsxs)(n.S.Footer,{children:[i?(0,o.jsx)(n.S.HelpText,{children:i}):null,d?(0,o.jsx)(n.S.Actions,{children:d}):null,l?(0,o.jsx)(n.S.Watermark,{}):null]}):null,a?(0,o.jsx)(n.S.FooterText,{children:a}):null]})}},90684:(e,r,i)=>{i.d(r,{N:()=>n});var o=i(4913),t=i(96419);let n=({size:e,centerIcon:r})=>(0,o.jsx)(a,{$size:e,children:(0,o.jsxs)(l,{children:[(0,o.jsx)(c,{}),(0,o.jsx)(d,{}),r?(0,o.jsx)(s,{children:r}):null]})}),a=t.zo.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,l=t.zo.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,s=t.zo.div`
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
`,c=t.zo.div`
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
`,d=t.zo.div`
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
`},83813:(e,r,i)=>{i.d(r,{s:()=>t});var o=i(45592);let t=(e,r)=>(0,o.s)(e,r.ethereum.createOnLogin)||(0,o.k)(e,r.solana.createOnLogin)}};