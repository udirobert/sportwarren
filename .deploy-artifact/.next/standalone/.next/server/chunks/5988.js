"use strict";exports.id=5988,exports.ids=[5988],exports.modules={35136:(e,t,n)=>{n.d(t,{Z:()=>r});var a=n(26510);let r=a.forwardRef(function({title:e,titleId:t,...n},r){return a.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:r,"aria-labelledby":t},n),e?a.createElement("title",{id:t},e):null,a.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"}))})},10081:(e,t,n)=>{n.d(t,{Z:()=>r});var a=n(26510);let r=a.forwardRef(function({title:e,titleId:t,...n},r){return a.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":"true","data-slot":"icon",ref:r,"aria-labelledby":t},n),e?a.createElement("title",{id:t},e):null,a.createElement("path",{fillRule:"evenodd",d:"M15.97 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06l3.22-3.22H7.5a.75.75 0 0 1 0-1.5h11.69l-3.22-3.22a.75.75 0 0 1 0-1.06Zm-7.94 9a.75.75 0 0 1 0 1.06l-3.22 3.22H16.5a.75.75 0 0 1 0 1.5H4.81l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 0Z",clipRule:"evenodd"}))})},61143:(e,t,n)=>{n.d(t,{E:()=>o});var a=n(4913),r=n(35136),i=n(96419);let o=({children:e,theme:t})=>(0,a.jsxs)(d,{$theme:t,children:[(0,a.jsx)(r.Z,{width:"20px",height:"20px",color:"var(--privy-color-icon-error)",strokeWidth:2,style:{flexShrink:0}}),(0,a.jsx)(s,{$theme:t,children:e})]}),d=i.zo.div`
  display: flex;
  gap: 0.75rem;
  background-color: var(--privy-color-error-bg);
  align-items: flex-start;
  padding: 1rem;
  border-radius: 0.75rem;
`,s=i.zo.div`
  color: ${e=>"dark"===e.$theme?"var(--privy-color-foreground-2)":"var(--privy-color-foreground)"};
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  flex: 1;
  text-align: left;
`},42365:(e,t,n)=>{n.d(t,{t:()=>o});var a=n(4913),r=n(55182),i=n(38102);function o({title:e}){let{currentScreen:t,navigateBack:n,navigate:o,data:d,setModalData:s}=(0,r.a)();return(0,a.jsx)(i.M,{title:e,backFn:"ManualTransferScreen"===t?n:t===d?.funding?.methodScreen?d.funding.comingFromSendTransactionScreen?()=>o("SendTransactionScreen"):void 0:d?.funding?.methodScreen?()=>{let e=d.funding;e.usingDefaultFundingMethod&&(e.usingDefaultFundingMethod=!1),s({funding:e,solanaFundingData:d?.solanaFundingData}),o(e.methodScreen)}:void 0})}},85988:(e,t,n)=>{n.r(t),n.d(t,{FundingMethodSelectionScreen:()=>B,default:()=>B});var a=n(4913),r=n(26510);let i=r.forwardRef(function({title:e,titleId:t,...n},a){return r.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:a,"aria-labelledby":t},n),e?r.createElement("title",{id:t},e):null,r.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"}))}),o=r.forwardRef(function({title:e,titleId:t,...n},a){return r.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:a,"aria-labelledby":t},n),e?r.createElement("title",{id:t},e):null,r.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"}),r.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"}))});var d=n(10081),s=n(57889),l=n(38102),c=n(42365),u=n(61143),h=n(71771),p=n(99171),m=n(14348),f=n(13813),g=n(49171),v=n(55182),y=n(2207),x=n(83484),w=n(88366),b=n(1305),M=n(85109),C=n(489),F=n(79336),k=n(41941),S=n(44734),j=n(1616);let z=new Set([b.R.id,M.u.id,C.v.id,F.y.id,k.y.id,S.p.id,j.m.id]),A=new Set([b.R.id,M.u.id,F.y.id,C.v.id,k.y.id,S.p.id,j.m.id]),D={buy:"CARD",send:"CRYPTO_ACCOUNT"},W={USDC:"2b92315d-eab7-5bef-84fa-089a131333f5",ETH:"d85dce9b-5b73-5c3c-8978-522ce1d1c1b4",BTC:"5b71fc48-3dd3-540c-809b-f8c94d0e68b5",SOL:"4f039497-3af8-5bb3-951c-6df9afa9be1c",POL:"026bcc1e-9163-591c-a709-34dd18b2e7a1",MON:"92aa538f-b005-45cc-a237-71d6466f54d9"};b.R.id,M.u.id,C.v.id,F.y.id,k.y.id,S.p.id,j.m.id;let E=(e,t)=>{switch(t){case"native-currency":return z.has(e);case"USDC":return A.has(e);default:return console.warn("Unknown asset passed to Coinbase Onramp"),!1}};var T=n(71552),O=n(66780),L=n(31058),I=n(44780);n(50470),n(36577),n(46898);let P=e=>{let[t,n]=(0,r.useState)();return(0,r.useEffect)(()=>{e().then(e=>{n(e)}).catch(()=>{})},[]),t},_={[b.R.id]:"ethereum",[M.u.id]:"base",[C.v.id]:"optimism",[F.y.id]:"polygon",[k.y.id]:"arbitrum",[S.p.id]:"avacchain",[j.m.id]:"monad"},Z=(e,t,n,a,r,i)=>new Promise(async(o,d)=>{let s=(0,O.X)();if(!s)return void d(Error("Unable to initialize flow"));let l="ethereum"===t.chainType?function(e){let t=_[e];if(!t)throw new g.b(`Unsupported chainId: ${e} for Coinbase Onramp`);return t}(t.chain.id):"solana",c=t.isUSDC?"USDC":"ethereum"===t.chainType?function(e,t){return"USDC"===t?"USDC":e===F.y.id?"POL":e===j.m.id?"MON":"ETH"}(t.chain.id,"native-currency"):"SOL",u=await e.initCoinbaseOnRamp({addresses:[{address:t.address,blockchains:[l]}],assets:[c]}),{url:h}=function({appId:e,input:t,amount:n,blockchain:a,asset:r,experience:i}){let o=new URL("https://pay.coinbase.com/buy/select-asset");return o.searchParams.set("appId",t.app_id),o.searchParams.set("sessionToken",t.session_token),o.searchParams.set("endPartnerName",`privy:${e}`),o.searchParams.set("defaultExperience",i),o.searchParams.set("presetCryptoAmount",n.startsWith(".")?`0${n}`:n),o.searchParams.set("defaultNetwork",a),o.searchParams.set("defaultPaymentMethod",D[i]),o.searchParams.set("defaultAsset",W[r]),o.searchParams.set("partnerUserId",t.partner_user_id),{url:o}}({appId:e.getAppId(),input:u,amount:t.amount,blockchain:l,asset:c,experience:i});s.location=h.toString();let p={...r?.funding,showAlternateFundingMethod:!0};t.usingDefaultFundingMethod&&(p.usingDefaultFundingMethod=!1),n({funding:p,solanaFundingData:r?.solanaFundingData,coinbaseOnrampStatus:{popup:s}}),a("CoinbaseOnrampStatusScreen"),e.createAnalyticsEvent({eventName:"sdk_fiat_on_ramp_started",payload:{provider:"coinbase-onramp",value:t.amount,chainType:t.chainType,chainId:"ethereum"===t.chainType?t.chain.id:t.chain}}),setTimeout(()=>{n({funding:p,solanaFundingData:r?.solanaFundingData,coinbaseOnrampStatus:{partnerUserId:u.partner_user_id,popup:s}})},5e3),o()}),U=async(e,t,n,a,r,i,o,d)=>{let s=(0,O.X)();if(!s)throw Error("Unable to initialize flow");let l="ethereum"===t.chainType?(0,T.Fy)(t.chain.id,a):t.isUSDC?"USDC_SOL":"SOL",{signedUrl:c,externalTransactionId:u}=await e.signMoonpayOnRampUrl({address:t.address,useSandbox:n.fundingMethodConfig.moonpay.useSandbox??!1,config:{uiConfig:{accentColor:n.appearance.palette.accent,theme:n.appearance.palette.colorScheme},paymentMethod:d,currencyCode:l,quoteCurrencyAmount:(0,L.a)(t.amount)}});e.createAnalyticsEvent({eventName:"sdk_fiat_on_ramp_started",payload:{provider:"moonpay",value:t.amount,chainType:t.chainType,chainId:"ethereum"===t.chainType?t.chain.id:t.chain}}),s.location=c;let h={...o?.funding,showAlternateFundingMethod:!0};t.usingDefaultFundingMethod&&(h.usingDefaultFundingMethod=!1),r({moonpayStatus:{},funding:h,solanaFundingData:o?.solanaFundingData}),i("MoonpayStatusScreen"),setTimeout(()=>{r({moonpayStatus:{externalTransactionId:u},funding:h,solanaFundingData:o?.solanaFundingData})},8e3)},R=async e=>"undefined"!=typeof window&&"PaymentRequest"in window&&await new window.PaymentRequest([{supportedMethods:e}],{id:"0",total:{label:"Item",amount:{currency:"USD",value:"1.00"}}}).canMakePayment(),H=()=>R("https://apple.com/apple-pay"),$=()=>R("https://google.com/pay"),B={component:()=>{let{wallets:e}=(0,y.u)(),{connectors:t}=(0,g.u)(),n=t.filter(f.c).flatMap(e=>e.wallets),{navigate:b,data:M,setModalData:C}=(0,v.a)(),{client:F}=(0,g.u)(),k=(0,m.u)(),S=M?.funding,j=P(H),z=P($),A="solana"===S.chainType,D=A?void 0:S,W=(0,r.useMemo)(()=>((e,t,n,a,r,i)=>{let o,d,s="solana"===n.chainType,l=s?void 0:n,c=n.isUSDC?"USDC":l?.erc20Address?void 0:"native-currency",u=!!s||c&&(0,T.OF)(Number(n.chain.id),c),h=!!s||c&&E(Number(n.chain.id),c),p=[];for(let o of(n.preferredCardProvider&&n.supportedOptions.sort(e=>e.provider===n.preferredCardProvider?-1:1),n.supportedOptions))"card"===o.method&&"coinbase"===o.provider&&h&&p.push(()=>Z(t,n,a,r,i,"buy")),"card"===o.method&&"moonpay"===o.provider&&u&&c&&p.push(()=>U(t,n,e,c,a,r,i,"credit_debit_card"));for(let e of n.supportedOptions)"exchange"===e.method&&"coinbase"===e.provider&&h&&(o=()=>Z(t,n,a,r,i,"buy"));for(let e of i?.funding?.supportedOptions??[])"wallets"===e.method&&(d=()=>r("TransferFromWalletScreen"));return{onFundWithCard:p,onFundWithExchange:o,onFundWithWallet:d}})(k,F,S,C,b,M),[k,F,S,M,C,b]),O=A?n.find(({address:e})=>e===S.address):e.find(({address:e})=>(0,s.K)(e)===(0,s.K)(S.address)),L=(0,f.z)(O?.walletClientType||"unknown"),_=L?.name||"wallet",R=O&&"privy"!==O.walletClientType?_:k.name,B=(0,r.useMemo)(()=>S.uiConfig?.landing?.title?S.uiConfig?.landing?.title:`Add funds to your ${R?.toLowerCase().endsWith("wallet")?R:R+" wallet"}`,[S.uiConfig?.landing?.title,R]);(0,r.useEffect)(()=>{if(S?.defaultFundingMethod&&S.usingDefaultFundingMethod)switch(C({funding:{...S,usingDefaultFundingMethod:!1},solanaFundingData:M?.solanaFundingData}),S?.defaultFundingMethod){case"card":W.onFundWithCard[0]&&W.onFundWithCard[0]();break;case"exchange":W.onFundWithExchange&&W.onFundWithExchange();break;case"wallet":W.onFundWithWallet&&W.onFundWithWallet();break;case"manual":b("ManualTransferScreen")}},[]),(0,r.useEffect)(()=>{D?.erc20Address&&!D.erc20ContractInfo&&(0,w.g)({address:D.erc20Address,chain:D.chain,rpcConfig:k.rpcConfig,privyAppId:k.id}).then(e=>{C({...M,funding:{...D,erc20ContractInfo:e?{symbol:e.symbol,decimals:e.decimals}:void 0}})}).catch(console.error)},[D?.erc20Address,D?.chain]);let N=!(!D?.erc20Address||D?.erc20ContractInfo);return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(c.t,{}),(0,a.jsx)("h3",{children:B}),(0,a.jsxs)(I.e,{children:[S.errorMessage&&(0,a.jsx)(u.E,{theme:k.appearance.palette.colorScheme,children:S.errorMessage}),W.onFundWithCard?.[0]&&(0,a.jsxs)(f.A,{disabled:N,onClick:W.onFundWithCard[0],children:[(0,a.jsx)(I.I,{children:(0,a.jsx)(i,{style:{width:24}})}),"Pay with card",j?(0,a.jsx)(p.A,{style:{marginLeft:"auto",maxWidth:"100%",width:"auto",height:"0.875rem"}}):z?(0,a.jsx)(p.G,{style:{marginLeft:"auto",maxWidth:"100%",width:"auto",height:"0.875rem"}}):null]}),W.onFundWithExchange&&(0,a.jsxs)(f.A,{disabled:N,onClick:W.onFundWithExchange,children:[(0,a.jsx)(I.I,{children:(0,a.jsx)(d.Z,{style:{width:24}})}),"Transfer from an exchange"]}),W.onFundWithWallet&&(0,a.jsxs)(f.A,{disabled:N,onClick:W.onFundWithWallet,children:[(0,a.jsx)(I.I,{children:(0,a.jsx)(x.W,{style:{width:24}})}),"Transfer from wallet"]}),(0,a.jsxs)(f.A,{disabled:N,onClick:()=>b("ManualTransferScreen"),children:[(0,a.jsx)(I.I,{children:(0,a.jsx)(o,{style:{width:24}})}),"Receive funds"]}),S?.showAlternateFundingMethod&&W.onFundWithCard?.[1]&&(0,a.jsx)(h.I,{theme:k.appearance.palette.colorScheme,children:(0,a.jsxs)(I.f,{children:["Having trouble or facing location restrictions?"," ",(0,a.jsx)(I.g,{onClick:W.onFundWithCard[1],children:"Try a different provider."})]})})]}),(0,a.jsx)(l.B,{})]})}}},99171:(e,t,n)=>{n.d(t,{A:()=>r,G:()=>i});var a=n(4913);let r=e=>(0,a.jsx)("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 210.2",xmlSpace:"preserve",...e,children:(0,a.jsx)("path",{d:"M93.6,27.1C87.6,34.2,78,39.8,68.4,39c-1.2-9.6,3.5-19.8,9-26.1c6-7.3,16.5-12.5,25-12.9  C103.4,10,99.5,19.8,93.6,27.1 M102.3,40.9c-13.9-0.8-25.8,7.9-32.4,7.9c-6.7,0-16.8-7.5-27.8-7.3c-14.3,0.2-27.6,8.3-34.9,21.2  c-15,25.8-3.9,64,10.6,85c7.1,10.4,15.6,21.8,26.8,21.4c10.6-0.4,14.8-6.9,27.6-6.9c12.9,0,16.6,6.9,27.8,6.7  c11.6-0.2,18.9-10.4,26-20.8c8.1-11.8,11.4-23.3,11.6-23.9c-0.2-0.2-22.4-8.7-22.6-34.3c-0.2-21.4,17.5-31.6,18.3-32.2  C123.3,42.9,107.7,41.3,102.3,40.9 M182.6,11.9v155.9h24.2v-53.3h33.5c30.6,0,52.1-21,52.1-51.4c0-30.4-21.1-51.2-51.3-51.2H182.6z   M206.8,32.3h27.9c21,0,33,11.2,33,30.9c0,19.7-12,31-33.1,31h-27.8V32.3z M336.6,169c15.2,0,29.3-7.7,35.7-19.9h0.5v18.7h22.4V90.2  c0-22.5-18-37-45.7-37c-25.7,0-44.7,14.7-45.4,34.9h21.8c1.8-9.6,10.7-15.9,22.9-15.9c14.8,0,23.1,6.9,23.1,19.6v8.6l-30.2,1.8  c-28.1,1.7-43.3,13.2-43.3,33.2C298.4,155.6,314.1,169,336.6,169z M343.1,150.5c-12.9,0-21.1-6.2-21.1-15.7c0-9.8,7.9-15.5,23-16.4  l26.9-1.7v8.8C371.9,140.1,359.5,150.5,343.1,150.5z M425.1,210.2c23.6,0,34.7-9,44.4-36.3L512,54.7h-24.6l-28.5,92.1h-0.5  l-28.5-92.1h-25.3l41,113.5l-2.2,6.9c-3.7,11.7-9.7,16.2-20.4,16.2c-1.9,0-5.6-0.2-7.1-0.4v18.7C417.3,210,423.3,210.2,425.1,210.2z"})}),i=e=>(0,a.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 80 38.1",xmlSpace:"preserve",...e,children:[(0,a.jsx)("path",{style:{fill:"#5F6368"},d:"M37.8,19.7V29h-3V6h7.8c1.9,0,3.7,0.7,5.1,2c1.4,1.2,2.1,3,2.1,4.9c0,1.9-0.7,3.6-2.1,4.9c-1.4,1.3-3.1,2-5.1,2  L37.8,19.7L37.8,19.7z M37.8,8.8v8h5c1.1,0,2.2-0.4,2.9-1.2c1.6-1.5,1.6-4,0.1-5.5c0,0-0.1-0.1-0.1-0.1c-0.8-0.8-1.8-1.3-2.9-1.2  L37.8,8.8L37.8,8.8z"}),(0,a.jsx)("path",{style:{fill:"#5F6368"},d:"M56.7,12.8c2.2,0,3.9,0.6,5.2,1.8s1.9,2.8,1.9,4.8V29H61v-2.2h-0.1c-1.2,1.8-2.9,2.7-4.9,2.7  c-1.7,0-3.2-0.5-4.4-1.5c-1.1-1-1.8-2.4-1.8-3.9c0-1.6,0.6-2.9,1.8-3.9c1.2-1,2.9-1.4,4.9-1.4c1.8,0,3.2,0.3,4.3,1v-0.7  c0-1-0.4-2-1.2-2.6c-0.8-0.7-1.8-1.1-2.9-1.1c-1.7,0-3,0.7-3.9,2.1l-2.6-1.6C51.8,13.8,53.9,12.8,56.7,12.8z M52.9,24.2  c0,0.8,0.4,1.5,1,1.9c0.7,0.5,1.5,0.8,2.3,0.8c1.2,0,2.4-0.5,3.3-1.4c1-0.9,1.5-2,1.5-3.2c-0.9-0.7-2.2-1.1-3.9-1.1  c-1.2,0-2.2,0.3-3,0.9C53.3,22.6,52.9,23.3,52.9,24.2z"}),(0,a.jsx)("path",{style:{fill:"#5F6368"},d:"M80,13.3l-9.9,22.7h-3l3.7-7.9l-6.5-14.7h3.2l4.7,11.3h0.1l4.6-11.3H80z"}),(0,a.jsx)("path",{style:{fill:"#4285F4"},d:"M25.9,17.7c0-0.9-0.1-1.8-0.2-2.7H13.2v5.1h7.1c-0.3,1.6-1.2,3.1-2.6,4v3.3H22C24.5,25.1,25.9,21.7,25.9,17.7z"}),(0,a.jsx)("path",{style:{fill:"#34A853"},d:"M13.2,30.6c3.6,0,6.6-1.2,8.8-3.2l-4.3-3.3c-1.2,0.8-2.7,1.3-4.5,1.3c-3.4,0-6.4-2.3-7.4-5.5H1.4v3.4  C3.7,27.8,8.2,30.6,13.2,30.6z"}),(0,a.jsx)("path",{style:{fill:"#FBBC04"},d:"M5.8,19.9c-0.6-1.6-0.6-3.4,0-5.1v-3.4H1.4c-1.9,3.7-1.9,8.1,0,11.9L5.8,19.9z"}),(0,a.jsx)("path",{style:{fill:"#EA4335"},d:"M13.2,9.4c1.9,0,3.7,0.7,5.1,2l0,0l3.8-3.8c-2.4-2.2-5.6-3.5-8.8-3.4c-5,0-9.6,2.8-11.8,7.3l4.4,3.4  C6.8,11.7,9.8,9.4,13.2,9.4z"})]})},71771:(e,t,n)=>{n.d(t,{I:()=>d});var a=n(4913),r=n(26510);let i=r.forwardRef(function({title:e,titleId:t,...n},a){return r.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:a,"aria-labelledby":t},n),e?r.createElement("title",{id:t},e):null,r.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"}))});var o=n(96419);let d=({children:e,theme:t})=>(0,a.jsxs)(s,{$theme:t,children:[(0,a.jsx)(i,{width:"20px",height:"20px",color:"var(--privy-color-icon-muted)",strokeWidth:1.5,style:{flexShrink:0}}),(0,a.jsx)(l,{$theme:t,children:e})]}),s=o.zo.div`
  display: flex;
  gap: 0.75rem;
  background-color: var(--privy-color-background-2);
  align-items: flex-start;
  padding: 1rem;
  border-radius: 0.75rem;
`,l=o.zo.div`
  color: ${e=>"dark"===e.$theme?"var(--privy-color-foreground-2)":"var(--privy-color-foreground)"};
  flex: 1;
  text-align: left;

  /* text-sm/font-regular */
  font-size: 0.875rem;
  font-style: normal;
  font-weight: 400;
  line-height: 1.375rem; /* 157.143% */
`},83484:(e,t,n)=>{n.d(t,{W:()=>r});var a=n(4913);let r=({...e})=>(0,a.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",...e,children:[(0,a.jsx)("rect",{width:"18",height:"18",x:"3",y:"3",rx:"2"}),(0,a.jsx)("path",{d:"M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2"}),(0,a.jsx)("path",{d:"M3 11h3c.8 0 1.6.3 2.1.9l1.1.9c1.6 1.6 4.1 1.6 5.7 0l1.1-.9c.5-.5 1.3-.9 2.1-.9H21"})]})},26844:(e,t,n)=>{n.d(t,{O:()=>a});let a="sdk_fiat_on_ramp_completed_with_status"},88366:(e,t,n)=>{n.d(t,{g:()=>o});var a=n(65655),r=n(96467),i=n(2207);let o=async({address:e,chain:t,rpcConfig:n,privyAppId:o})=>{try{let s=(0,a.v)({chain:t,transport:(0,r.d)((0,i.i)(t,n,o))}),[l,c]=await Promise.all([s.readContract({abi:d,address:e,functionName:"symbol"}),s.readContract({abi:d,address:e,functionName:"decimals"})]);return{decimals:c,symbol:l}}catch(e){return console.log(e),null}},d=[{inputs:[],name:"decimals",outputs:[{internalType:"uint8",name:"",type:"uint8"}],stateMutability:"view",type:"function"},{inputs:[],name:"symbol",outputs:[{internalType:"string",name:"",type:"string"}],stateMutability:"view",type:"function"}]},31058:(e,t,n)=>{n.d(t,{a:()=>c,u:()=>u});var a=n(75),r=n(26510),i=n(14348),o=n(49171),d=n(55182),s=n(26844);let l="moonpay";function c(e){return parseFloat(e)}function u(e,t=!1){let[n,c]=(0,r.useState)(null),{createAnalyticsEvent:u}=(0,o.u)(),{data:h,navigate:p,setModalData:m}=(0,d.a)(),f=h?.funding,g=(0,r.useRef)(0);return(0,r.useEffect)(()=>{let n=setInterval(async()=>{if(e)try{let[r]=await async function(e,t){return(0,a.Wg)(`${t?i.M:i.v}/transactions/ext/${e}`,{query:{apiKey:t?i.w:i.x}})}(e,t),o="waitingAuthorization"===r.status&&"credit_debit_card"===r.paymentMethod?"pending":r.status;if(["failed","completed","awaitingAuthorization"].includes(o)&&(u({eventName:s.O,payload:{status:o,provider:l,paymentMethod:r.paymentMethod,cardPaymentType:r.cardPaymentType,currency:r.currency?.code,baseCurrencyAmount:r.baseCurrencyAmount,quoteCurrencyAmount:r.quoteCurrencyAmount,feeAmount:r.feeAmount,extraFeeAmount:r.extraFeeAmount,networkFeeAmount:r.networkFeeAmount,isSandbox:t}}),clearInterval(n)),"failed"===o||"serviceFailure"===o)return m({funding:{...f,errorMessage:"Something went wrong adding funds from Moonpay. Please try again or use another method to fund your wallet."},solanaFundingData:h?.solanaFundingData}),void p("FundingMethodSelectionScreen");c(o)}catch(e){404!==e.response?.status&&(g.current+=1),g.current>=3&&(u({eventName:s.O,payload:{status:"serviceFailure",provider:l}}),clearInterval(n),m({funding:{...f,errorMessage:"Something went wrong adding funds from Moonpay. Please try again or use another method to fund your wallet."},solanaFundingData:h?.solanaFundingData}),p("FundingMethodSelectionScreen"))}},3e3);return()=>clearInterval(n)},[e,g]),n}},44780:(e,t,n)=>{n.d(t,{F:()=>s,I:()=>d,a:()=>l,b:()=>c,c:()=>h,d:()=>p,e:()=>o,f:()=>f,g:()=>g,h:()=>u});var a=n(96419),r=n(38102),i=n(64870);let o=a.zo.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 24px;
  padding-bottom: 24px;
`,d=a.zo.div`
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;

  svg {
    border-radius: var(--privy-border-radius-sm);
  }
`,s=a.zo.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
`,l=a.zo.div`
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  padding: 0 16px;
  border-width: 1px !important;
  border-radius: 12px;
  cursor: text;

  &:focus-within {
    border-color: var(--privy-color-accent);
  }
`;a.zo.div`
  font-size: 42px !important;
`;let c=a.zo.input`
  background-color: var(--privy-color-background);
  width: 100%;

  &:focus {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }

  && {
    font-size: 26px;
  }
`,u=(0,a.zo)(c)`
  && {
    font-size: 42px;
  }
`;a.zo.button`
  cursor: pointer;
  padding-left: 4px;
`;let h=a.zo.div`
  font-size: 18px;
`,p=a.zo.div`
  font-size: 12px;
  color: var(--privy-color-foreground-3);
  // we need this container to maintain a static height if there's no content
  height: 20px;
`;a.zo.div`
  display: flex;
  flex-direction: row;
  line-height: 22px;
  font-size: 16px;
  text-align: center;
  svg {
    margin-right: 6px;
    margin: auto;
  }
`,(0,a.zo)(i.LinkButton)`
  margin-top: 16px;
`;let m=(0,a.F4)`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;(0,a.zo)(r.d)`
  border-radius: var(--privy-border-radius-md) !important;
  animation: ${m} 0.3s ease-in-out;
`;let f=a.zo.div``,g=a.zo.a`
  && {
    color: var(--privy-color-accent);
  }

  cursor: pointer;
`}};