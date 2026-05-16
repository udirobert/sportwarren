"use strict";exports.id=4160,exports.ids=[4160],exports.modules={22277:(e,r,t)=>{t.d(r,{Z:()=>n});var o=t(26510);let n=o.forwardRef(function({title:e,titleId:r,...t},n){return o.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:n,"aria-labelledby":r},t),e?o.createElement("title",{id:r},e):null,o.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"}))})},23258:(e,r,t)=>{t.d(r,{Z:()=>n});var o=t(26510);let n=o.forwardRef(function({title:e,titleId:r,...t},n){return o.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:n,"aria-labelledby":r},t),e?o.createElement("title",{id:r},e):null,o.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"}))})},24160:(e,r,t)=>{t.r(r),t.d(r,{SetAutomaticRecoveryScreen:()=>f,default:()=>f});var o=t(4913),n=t(22277),l=t(23258),i=t(26510),a=t(55182),s=t(38102),c=t(96419),d=t(83059),u=t(59759),y=t(14348),h=t(49171),v=t(13813);t(50470),t(36577),t(46898);let g=c.zo.div`
  && {
    border-width: 4px;
  }

  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  aspect-ratio: 1;
  border-style: solid;
  border-color: ${e=>e.$color??"var(--privy-color-accent)"};
  border-radius: 50%;
`,f={component:()=>{let{user:e}=(0,a.u)(),{client:r,walletProxy:t,refreshSessionAndUser:c,closePrivyModal:f}=(0,h.u)(),m=(0,a.a)(),{entropyId:w,entropyIdVerifier:p}=m.data?.recoverWallet??{},[x,j]=(0,i.useState)(!1),[b,k]=(0,i.useState)(null),[S,E]=(0,i.useState)(null);function T(){if(!x){if(S)return m.data?.setWalletPassword?.onFailure(S),void f();if(!b)return m.data?.setWalletPassword?.onFailure(Error("User exited set recovery flow")),void f()}}return m.onUserCloseViaDialogOrKeybindRef.current=T,(0,o.jsxs)(o.Fragment,S?{children:[(0,o.jsx)(s.M,{onClose:T},"header"),(0,o.jsx)(g,{$color:"var(--privy-color-error)",style:{alignSelf:"center"},children:(0,o.jsx)(n.Z,{height:38,width:38,stroke:"var(--privy-color-error)"})}),(0,o.jsx)(u.T,{style:{marginTop:"0.5rem"},children:"Something went wrong"}),(0,o.jsx)(v.G,{style:{minHeight:"2rem"}}),(0,o.jsx)(s.c,{onClick:()=>E(null),children:"Try again"}),(0,o.jsx)(s.B,{})]}:{children:[(0,o.jsx)(s.M,{onClose:T},"header"),(0,o.jsx)(l.Z,{style:{width:"3rem",height:"3rem",alignSelf:"center"}}),(0,o.jsx)(u.T,{style:{marginTop:"0.5rem"},children:"Automatically secure your account"}),(0,o.jsx)(d.S,{style:{marginTop:"1rem"},children:"When you log into a new device, you’ll only need to authenticate to access your account. Never get logged out if you forget your password."}),(0,o.jsx)(v.G,{style:{minHeight:"2rem"}}),(0,o.jsx)(s.c,{loading:x,disabled:!(!x&&!b),onClick:()=>(async function(){j(!0);try{let o=await r.getAccessToken(),n=(0,a.j)(e,w);if(!o||!t||!n)return;if(!(await t.setRecovery({accessToken:o,entropyId:w,entropyIdVerifier:p,existingRecoveryMethod:n.recoveryMethod,recoveryMethod:"privy"})).entropyId)throw Error("Unable to set recovery on wallet");let l=await c();if(!l)throw Error("Unable to set recovery on wallet");let i=(0,a.j)(l,n.address);if(!i)throw Error("Unabled to set recovery on wallet");k(!!l),setTimeout(()=>{m.data?.setWalletPassword?.onSuccess(i),f()},y.q)}catch(e){E(e)}finally{j(!1)}})(),children:b?"Success":"Confirm"}),(0,o.jsx)(s.B,{})]})}}},83059:(e,r,t)=>{t.d(r,{S:()=>n});var o=t(96419);let n=o.zo.span`
  margin-top: 4px;
  color: var(--privy-color-foreground);
  text-align: center;

  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.375rem; /* 157.143% */

  && a {
    color: var(--privy-color-accent);
  }
`},59759:(e,r,t)=>{t.d(r,{T:()=>n});var o=t(96419);let n=o.zo.span`
  color: var(--privy-color-foreground);
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.875rem; /* 166.667% */
  text-align: center;
`}};