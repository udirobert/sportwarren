"use strict";exports.id=5233,exports.ids=[5233],exports.modules={32354:(e,n,t)=>{t.d(n,{Z:()=>r});let r=(0,t(5670).Z)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]])},57209:(e,n,t)=>{t.r(n),t.d(n,{AwaitingSolToEvmBridgingScreen:()=>S,default:()=>S});var r=t(4913),a=t(60635),i=t(26510),s=t(48974),o=t(99710),d=t(38198),l=t(38102),c=t(82145),u=t(42365),p=t(90684),g=t(14348),h=t(49171),f=t(13813),m=t(55182),v=t(26844),b=t(96071),w=t(16820),x=t(55976),y=t(22554),I=t(52633);t(50470),t(46898),t(36577);let S={component:function(){let e=(0,g.u)(),{closePrivyModal:n,createAnalyticsEvent:t,connectors:S}=(0,h.u)(),{navigate:T,setModalData:C,data:N}=(0,m.a)(),$=(0,g.u)(),j=(0,i.useRef)(!1),A=(0,w.u)(),[E,F]=(0,i.useState)(!1),[z,U]=(0,i.useState)(!1),[B,R]=(0,i.useState)(null),[k,W]=(0,i.useState)(),[D,M]=(0,i.useState)();if(!N?.funding||"ethereum"!==N.funding.chainType)throw Error("Invalid funding data");let{amount:L,connectedWallet:O,chain:P,solanaChain:_,isUSDC:q}=N.funding,H=N.funding.address,J=N.funding.erc20Address,Z=N.funding.isUSDC?"USDC":P.nativeCurrency.symbol,G=(0,i.useMemo)(()=>"solana"===O?.type?O.provider:function({connectors:e,connectedWalletAddress:n}){let t=e.find(e=>"solana"===e.chainType&&e.wallets.some(e=>e.address===n)),r=t?.wallet.accounts.find(e=>e.address===n);if(!t||!r)throw new h.b("Unable to find source wallet connector");return new o.O({wallet:t.wallet,account:r})}({connectors:S,connectedWalletAddress:O?.address||""}),[O,S]),Q=(0,i.useMemo)(()=>{let n=A(x.S);if(!n)throw new h.b("Unable to load solana plugin");let t=e.solanaRpcs["solana:mainnet"];if(!t)throw new h.b("Unable to load mainnet RPC");return n.getSolanaRpcClient({rpc:t.rpc,rpcSubscriptions:t.rpcSubscriptions,chain:"solana:mainnet",blockExplorerUrl:t.blockExplorerUrl??"https://explorer.solana.com"})},[]),V=(0,f.z)((0,y.I)(G?.standardWallet.name||"unknown")),Y=V?.name||"wallet";return(0,i.useEffect)(()=>{(async function(){if(!G||!P||j.current)return;let e=A(x.S);if(!e)return void R(new h.b("Unable to solana plugin"));j.current=!0,P?.testnet&&console.warn("Solana testnets are not supported for bridging");let n=q?1e6*parseFloat(L):(0,s.f)(L),t=await (0,b.g)({isTestnet:!!P.testnet,input:(0,b.t)({appId:$.id,amount:n.toString(),user:G.address,recipient:H,destinationChainId:P.id,originChainId:b.c,originCurrency:q?b.e:b.b,destinationCurrency:q?J:void 0})}).catch(console.error);if(!t)return void R(new h.b(`Unable to fetch quotes for bridging. Wallet ${(0,y.J)(G.address)} does not have enough funds.`,void 0,h.c.INSUFFICIENT_BALANCE));let r=await e.createTransactionFromRelayQuote({quote:t,source:G.address,solanaClient:Q});if(r)try{F(!0);let n=await e.simulateTransaction({solanaClient:Q,tx:r});if(n.hasError)return n.hasFunds?(console.error("Transaction failed:",n.error),void R(new h.b("Something went wrong",void 0,h.c.TRANSACTION_FAILURE))):void R(new h.b(`Wallet ${(0,y.J)(G?.address)} does not have enough funds. ${t.details.currencyIn.amountFormatted} ${Z} are needed to complete the transaction.`,void 0,h.c.INSUFFICIENT_BALANCE));let{signature:a}=await G.signAndSendTransaction({chain:"solana:mainnet",transaction:r}),i=e.getAddressFromBuffer(a);W(i),M("pending")}catch(e){if(console.error(e),/user rejected the request/gi.test(e.message||""))return void R(new h.b("Transaction was rejected by the user",void 0,h.c.TRANSACTION_FAILURE));R(new h.b("Something went wrong",void 0,h.c.TRANSACTION_FAILURE))}else R(new h.b(`Unable to select bridge option from quotes. Wallet ${(0,y.J)(G.address)} does not have enough funds.`,void 0,h.c.INSUFFICIENT_BALANCE))})().catch(console.error)},[]),(0,b.u)({transactionHash:k,isTestnet:!1,bridgingStatus:D,setBridgingStatus:M,onSuccess({transactionHash:e}){F(!1),U(!0),t({eventName:v.O,payload:{provider:"external",status:"success",txHash:e,address:G.address,chainType:"solana",clusterName:_,token:"SOL",destinationAddress:H,destinationChainId:P.id,destinationChainType:"ethereum",destinationValue:L,destinationToken:q?"USDC":"ETH"}})},onFailure({error:e}){F(!1),R(e)}}),(0,i.useEffect)(()=>{if(!z)return;let e=setTimeout(n,g.t);return()=>clearTimeout(e)},[z]),(0,i.useEffect)(()=>{B&&(C({funding:N?.funding,solanaFundingData:N?.solanaFundingData,sendTransaction:N?.sendTransaction,errorModalData:{error:B,previousScreen:"TransferFromWalletScreen"}}),T("ErrorScreen",!1))},[B]),z?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(u.t,{}),(0,r.jsx)(d.b,{}),(0,r.jsxs)(d.c,{children:[(0,r.jsx)(a.Z,{color:"var(--privy-color-success)",width:"64px",height:"64px"}),(0,r.jsx)(c.C,{title:"Success!",description:`You’ve successfully added ${L} ${Z} to your ${$.name} wallet. It may take a minute before the funds are available to use.`})]}),(0,r.jsx)(d.R,{}),(0,r.jsx)(l.B,{})]}):E&&G?(0,r.jsx)(I.T,{walletClientType:(0,y.I)(G?.standardWallet.name||"unknown"),displayName:Y,addressToFund:H,isBridging:E,isErc20Flow:!1,chainId:P.id,chainName:P.name,totalPriceInUsd:void 0,totalPriceInNativeCurrency:void 0,gasPriceInUsd:void 0,gasPriceInNativeCurrency:void 0}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(u.t,{}),(0,r.jsx)(p.N,{}),(0,r.jsx)("div",{style:{marginTop:"1rem"}}),(0,r.jsx)(l.B,{})]})}}},90684:(e,n,t)=>{t.d(n,{N:()=>i});var r=t(4913),a=t(96419);let i=({size:e,centerIcon:n})=>(0,r.jsx)(s,{$size:e,children:(0,r.jsxs)(o,{children:[(0,r.jsx)(l,{}),(0,r.jsx)(c,{}),n?(0,r.jsx)(d,{children:n}):null]})}),s=a.zo.div`
  --spinner-size: ${e=>e.$size?e.$size:"96px"};

  display: inline-flex;
  justify-content: center;
  align-items: center;

  @media all and (display-mode: standalone) {
    margin-bottom: 30px;
  }
`,o=a.zo.div`
  position: relative;
  height: var(--spinner-size);
  width: var(--spinner-size);

  opacity: 1;
  animation: fadein 200ms ease;
`,d=a.zo.div`
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
`,l=a.zo.div`
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
`,c=a.zo.div`
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
`},48974:(e,n,t)=>{t.d(n,{f:()=>s});var r=t(73660),a=t(19632);class i extends a.G{constructor({value:e}){super(`Number \`${e}\` is not a valid decimal number.`,{name:"InvalidDecimalNumberError"})}}function s(e,n="wei"){return function(e,n){if(!/^(-?)([0-9]*)\.?([0-9]*)$/.test(e))throw new i({value:e});let[t,r="0"]=e.split("."),a=t.startsWith("-");if(a&&(t=t.slice(1)),r=r.replace(/(0+)$/,""),0===n)1===Math.round(Number(`.${r}`))&&(t=`${BigInt(t)+1n}`),r="";else if(r.length>n){let[e,a,i]=[r.slice(0,n-1),r.slice(n-1,n),r.slice(n)],s=Math.round(Number(`${a}.${i}`));(r=s>9?`${BigInt(e)+BigInt(1)}0`.padStart(e.length+1,"0"):`${e}${s}`).length>n&&(r=r.slice(1),t=`${BigInt(t)+1n}`),r=r.slice(0,n)}else r=r.padEnd(n,"0");return BigInt(`${a?"-":""}${t}${r}`)}(e,r.ez[n])}}};