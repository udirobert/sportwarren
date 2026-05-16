"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[397],{12859:function(e,n,t){t.d(n,{Z:function(){return r}});let r=(0,t(79095).Z)("check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]])},72305:function(e,n,t){t.r(n),t.d(n,{AwaitingSolToEvmBridgingScreen:function(){return x},default:function(){return x}});var r=t(89418),a=t(40765),i=t(4753),s=t(11116),o=t(5683),d=t(94923),l=t(13188),c=t(31128),u=t(87718),f=t(99539),p=t(64982),h=t(3010),g=t(61318),m=t(9201),v=t(50472),b=t(3538),w=t(98401),y=t(58610),I=t(40099),S=t(4918);t(96257),t(55982),t(78439);let x={component:function(){let e=(0,p.u)(),{closePrivyModal:n,createAnalyticsEvent:t,connectors:x}=(0,h.u)(),{navigate:T,setModalData:C,data:N}=(0,m.a)(),$=(0,p.u)(),E=(0,i.useRef)(!1),j=(0,w.u)(),[A,F]=(0,i.useState)(!1),[z,U]=(0,i.useState)(!1),[k,B]=(0,i.useState)(null),[R,W]=(0,i.useState)(),[_,D]=(0,i.useState)();if(!N?.funding||"ethereum"!==N.funding.chainType)throw Error("Invalid funding data");let{amount:M,connectedWallet:L,chain:O,solanaChain:P,isUSDC:q}=N.funding,H=N.funding.address,J=N.funding.erc20Address,Z=N.funding.isUSDC?"USDC":O.nativeCurrency.symbol,G=(0,i.useMemo)(()=>"solana"===L?.type?L.provider:function({connectors:e,connectedWalletAddress:n}){let t=e.find(e=>"solana"===e.chainType&&e.wallets.some(e=>e.address===n)),r=t?.wallet.accounts.find(e=>e.address===n);if(!t||!r)throw new h.b("Unable to find source wallet connector");return new o.O({wallet:t.wallet,account:r})}({connectors:x,connectedWalletAddress:L?.address||""}),[L,x]),Q=(0,i.useMemo)(()=>{let n=j(y.S);if(!n)throw new h.b("Unable to load solana plugin");let t=e.solanaRpcs["solana:mainnet"];if(!t)throw new h.b("Unable to load mainnet RPC");return n.getSolanaRpcClient({rpc:t.rpc,rpcSubscriptions:t.rpcSubscriptions,chain:"solana:mainnet",blockExplorerUrl:t.blockExplorerUrl??"https://explorer.solana.com"})},[]),V=(0,g.z)((0,I.I)(G?.standardWallet.name||"unknown")),Y=V?.name||"wallet";return(0,i.useEffect)(()=>{(async function(){if(!G||!O||E.current)return;let e=j(y.S);if(!e)return void B(new h.b("Unable to solana plugin"));E.current=!0,O?.testnet&&console.warn("Solana testnets are not supported for bridging");let n=q?1e6*parseFloat(M):(0,s.f)(M),t=await (0,b.g)({isTestnet:!!O.testnet,input:(0,b.t)({appId:$.id,amount:n.toString(),user:G.address,recipient:H,destinationChainId:O.id,originChainId:b.c,originCurrency:q?b.e:b.b,destinationCurrency:q?J:void 0})}).catch(console.error);if(!t)return void B(new h.b(`Unable to fetch quotes for bridging. Wallet ${(0,I.J)(G.address)} does not have enough funds.`,void 0,h.c.INSUFFICIENT_BALANCE));let r=await e.createTransactionFromRelayQuote({quote:t,source:G.address,solanaClient:Q});if(r)try{F(!0);let n=await e.simulateTransaction({solanaClient:Q,tx:r});if(n.hasError)return n.hasFunds?(console.error("Transaction failed:",n.error),void B(new h.b("Something went wrong",void 0,h.c.TRANSACTION_FAILURE))):void B(new h.b(`Wallet ${(0,I.J)(G?.address)} does not have enough funds. ${t.details.currencyIn.amountFormatted} ${Z} are needed to complete the transaction.`,void 0,h.c.INSUFFICIENT_BALANCE));let{signature:a}=await G.signAndSendTransaction({chain:"solana:mainnet",transaction:r}),i=e.getAddressFromBuffer(a);W(i),D("pending")}catch(e){if(console.error(e),/user rejected the request/gi.test(e.message||""))return void B(new h.b("Transaction was rejected by the user",void 0,h.c.TRANSACTION_FAILURE));B(new h.b("Something went wrong",void 0,h.c.TRANSACTION_FAILURE))}else B(new h.b(`Unable to select bridge option from quotes. Wallet ${(0,I.J)(G.address)} does not have enough funds.`,void 0,h.c.INSUFFICIENT_BALANCE))})().catch(console.error)},[]),(0,b.u)({transactionHash:R,isTestnet:!1,bridgingStatus:_,setBridgingStatus:D,onSuccess({transactionHash:e}){F(!1),U(!0),t({eventName:v.O,payload:{provider:"external",status:"success",txHash:e,address:G.address,chainType:"solana",clusterName:P,token:"SOL",destinationAddress:H,destinationChainId:O.id,destinationChainType:"ethereum",destinationValue:M,destinationToken:q?"USDC":"ETH"}})},onFailure({error:e}){F(!1),B(e)}}),(0,i.useEffect)(()=>{if(!z)return;let e=setTimeout(n,p.t);return()=>clearTimeout(e)},[z]),(0,i.useEffect)(()=>{k&&(C({funding:N?.funding,solanaFundingData:N?.solanaFundingData,sendTransaction:N?.sendTransaction,errorModalData:{error:k,previousScreen:"TransferFromWalletScreen"}}),T("ErrorScreen",!1))},[k]),z?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(u.t,{}),(0,r.jsx)(d.b,{}),(0,r.jsxs)(d.c,{children:[(0,r.jsx)(a.Z,{color:"var(--privy-color-success)",width:"64px",height:"64px"}),(0,r.jsx)(c.C,{title:"Success!",description:`You’ve successfully added ${M} ${Z} to your ${$.name} wallet. It may take a minute before the funds are available to use.`})]}),(0,r.jsx)(d.R,{}),(0,r.jsx)(l.B,{})]}):A&&G?(0,r.jsx)(S.T,{walletClientType:(0,I.I)(G?.standardWallet.name||"unknown"),displayName:Y,addressToFund:H,isBridging:A,isErc20Flow:!1,chainId:O.id,chainName:O.name,totalPriceInUsd:void 0,totalPriceInNativeCurrency:void 0,gasPriceInUsd:void 0,gasPriceInNativeCurrency:void 0}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(u.t,{}),(0,r.jsx)(f.N,{}),(0,r.jsx)("div",{style:{marginTop:"1rem"}}),(0,r.jsx)(l.B,{})]})}}},99539:function(e,n,t){t.d(n,{N:function(){return i}});var r=t(89418),a=t(43803);let i=({size:e,centerIcon:n})=>(0,r.jsx)(s,{$size:e,children:(0,r.jsxs)(o,{children:[(0,r.jsx)(l,{}),(0,r.jsx)(c,{}),n?(0,r.jsx)(d,{children:n}):null]})}),s=a.zo.div`
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
`},11116:function(e,n,t){t.d(n,{f:function(){return s}});var r=t(30395),a=t(83546);class i extends a.G{constructor({value:e}){super(`Number \`${e}\` is not a valid decimal number.`,{name:"InvalidDecimalNumberError"})}}function s(e,n="wei"){return function(e,n){if(!/^(-?)([0-9]*)\.?([0-9]*)$/.test(e))throw new i({value:e});let[t,r="0"]=e.split("."),a=t.startsWith("-");if(a&&(t=t.slice(1)),r=r.replace(/(0+)$/,""),0===n)1===Math.round(Number(`.${r}`))&&(t=`${BigInt(t)+1n}`),r="";else if(r.length>n){let[e,a,i]=[r.slice(0,n-1),r.slice(n-1,n),r.slice(n)],s=Math.round(Number(`${a}.${i}`));(r=s>9?`${BigInt(e)+BigInt(1)}0`.padStart(e.length+1,"0"):`${e}${s}`).length>n&&(r=r.slice(1),t=`${BigInt(t)+1n}`),r=r.slice(0,n)}else r=r.padEnd(n,"0");return BigInt(`${a?"-":""}${t}${r}`)}(e,r.ez[n])}}}]);