"use strict";exports.id=9737,exports.ids=[9737],exports.modules={26550:(e,r,o)=>{o.d(r,{C:()=>s});var n=o(4913),t=o(96419),a=o(66461);let s=({children:e,color:r,isLoading:o,isPulsing:t,...a})=>(0,n.jsx)(i,{$color:r,$isLoading:o,$isPulsing:t,...a,children:e}),i=t.zo.span`
  padding: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1rem; /* 150% */
  border-radius: var(--privy-border-radius-xs);
  display: flex;
  align-items: center;
  ${e=>{let r,o;"green"===e.$color&&(r="var(--privy-color-success-dark)",o="var(--privy-color-success-light)"),"red"===e.$color&&(r="var(--privy-color-error)",o="var(--privy-color-error-light)"),"gray"===e.$color&&(r="var(--privy-color-foreground-2)",o="var(--privy-color-background-2)");let n=(0,t.F4)`
      from, to {
        background-color: ${o};
      }

      50% {
        background-color: rgba(${o}, 0.8);
      }
    `;return(0,t.iv)`
      color: ${r};
      background-color: ${o};
      ${e.$isPulsing&&(0,t.iv)`
        animation: ${n} 3s linear infinite;
      `};
    `}}

  ${a.L}
`},66461:(e,r,o)=>{o.d(r,{L:()=>a});var n=o(96419);let t=(0,n.F4)`
  from, to {
    background: var(--privy-color-foreground-4);
    color: var(--privy-color-foreground-4);
  }

  50% {
    background: var(--privy-color-foreground-accent);
    color: var(--privy-color-foreground-accent);
  }
`,a=(0,n.iv)`
  ${e=>e.$isLoading?(0,n.iv)`
          width: 35%;
          animation: ${t} 2s linear infinite;
          border-radius: var(--privy-border-radius-sm);
        `:""}
`},99732:(e,r,o)=>{o.r(r),o.d(r,{MfaAuthEnrollmentFlowScreen:()=>m,default:()=>m});var n=o(4913),t=o(4341),a=o(11069),s=o(26510),i=o(38102),l=o(13813),c=o(14348),d=o(55182),u=o(9993),h=o(48224);o(36577),o(46898),o(50470),o(42330),o(84440),o(36535);let m={component:()=>{let{user:e,ready:r}=(0,d.u)(),{data:o,onUserCloseViaDialogOrKeybindRef:m}=(0,d.a)(),y=(0,c.u)(),[v,f]=(0,s.useState)(null),[g,p]=(0,s.useState)(null),[x,j]=(0,s.useState)(null),[k,b]=(0,s.useState)(!1),[M,w]=(0,s.useState)(!1),[$,F]=(0,s.useState)(),C=async()=>{$?S($):e?await A({user:e}):S(Error("Must be logged in to manage MFA")),setTimeout(()=>{f(null),p(null)},500)};if(m.current=C,!o?.mfaEnroll)throw Error("Missing modal data for MFA enrollment screen.");let{onFailure:S,onSuccess:A,onBack:P,mfaMethods:E,verify:R,generateTotpSecret:T,enrollTotp:L,unenrollTotp:B,enrollPasskey:I}=o.mfaEnroll,U=e?.mfaMethods.includes("sms"),Z=e?.mfaMethods.includes("totp"),z=e?.mfaMethods.includes("passkey"),O=!!e?.phone,W=e?.linkedAccounts.filter(e=>"passkey"===e.type).map(e=>e.credentialId)??[];function D(){f(null),p(null),F(void 0)}async function H(e=W){try{F(void 0),w(!0);let r=await I(e);return await A({user:r})}catch(e){F(e)}finally{w(!1),b(!1)}}if(!r||!e||!y)return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(i.M,{onClose:C,backFn:P},"header"),(0,n.jsx)(h.A,{children:(0,n.jsx)(u.M,{})}),(0,n.jsx)(h.C,{children:(0,n.jsx)(l.L,{})}),(0,n.jsx)(i.b,{})]});if("sms"===v)return null;if("totp"===v)return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(i.M,{backFn:D,onClose:C},"header"),(0,n.jsx)(h.I,{style:{marginBottom:"1.5rem"},children:(0,n.jsx)(t.Z,{})}),(0,n.jsx)(h.T,{children:"Remove authenticator app verification?"}),(0,n.jsxs)(h.S,{children:["MFA adds an extra layer of security to your ",y?.name," account. Make sure you have other methods to secure your account."]}),(0,n.jsx)(h.B,{children:(0,n.jsx)(i.P,{$warn:!0,onClick:async function(){try{F(void 0),w(!0);let e=await B();return await A({user:e})}catch(e){F(e)}finally{w(!1),f(null)}},loading:M,children:"Remove"})}),(0,n.jsx)(i.b,{})]});if("passkey"===v){let e=o.mfaEnroll.shouldUnlinkOnUnenrollMfa??!0;return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(i.M,{backFn:D,onClose:C},"header"),(0,n.jsx)(h.I,{style:{marginBottom:"1.5rem"},children:(0,n.jsx)(t.Z,{})}),(0,n.jsx)(h.T,{children:"Are you sure you want to remove this passkey?"}),(0,n.jsx)(h.S,{children:e?"Removing your passkey will remove as both a verification method and a login method.":"Removing your passkey will remove as a verification method."}),(0,n.jsx)(h.B,{children:(0,n.jsx)(i.P,{$warn:!0,onClick:async function(){try{F(void 0),w(!0);let e=await I([]);return await A({user:e})}catch(e){F(e)}finally{w(!1),f(null)}},loading:M,children:"Remove"})}),(0,n.jsx)(i.b,{})]})}return 0!==E.length||U||Z||z?"sms"===g?null:"totp"===g&&x?(0,n.jsx)(u.E,{onClose:C,onReset:D,submitEnrollmentWithTotp:e=>(async function(e){try{F(void 0),w(!0);let r=await L(e);return await A({user:r})}catch(e){F(e)}finally{w(!1),f(null)}})(e.mfaCode),error:$,totpInfo:{...x,appName:y?.name||"Privy"}}):"passkey"===g?(0,n.jsx)(u.a,{onReset:D,onClose:C,submitEnrollmentWithPasskey:H}):(0,n.jsx)(u.b,{showIntro:!0,userMfaMethods:e.mfaMethods,appMfaMethods:y.mfa.methods,userHasAuthSms:O,backFn:P,handleSelectMethod:async function(e){F(void 0);try{await R()}catch(e){return void F(e)}return"totp"===e?(p(e),j(null),void T().then(({totpSecret:e,totpAuthUrl:r})=>{j({authUrl:r,secret:e})}).catch(()=>{j(null),D()})):"passkey"===e&&1===W.length?await H():void p(e)},isTotpLoading:"totp"===g&&!x,isPasskeyLoading:k,error:$,onClose:C,setRemovingMfaMethod:async function(e){F(void 0);try{await R()}catch(e){return void F(e)}f(e)}}):(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(i.M,{onClose:C,backFn:P},"header"),(0,n.jsx)(h.I,{style:{marginBottom:"1.5rem"},children:(0,n.jsx)(a.Z,{})}),(0,n.jsx)(h.T,{children:"Add more security"}),(0,n.jsxs)(h.S,{children:[y?.name," does not have any verification methods enabled."]}),(0,n.jsx)(h.B,{children:(0,n.jsx)(i.P,{onClick:C,children:"Close"})}),(0,n.jsx)(i.b,{})]})}}}};