"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[9157],{99157:function(e,t,o){o.r(t),o.d(t,{AppKitModal:function(){return eH},W3mListWallet:function(){return eK},W3mModal:function(){return eM},W3mModalBase:function(){return ej},W3mRouterContainer:function(){return eY}});var r=o(13044),i=o(64167),a=o(16609),n=o(15599),s=o(59804),l=o(40567),c=o(49903),d=o(92201),u=o(76778),p=o(30146),w=o(59228),h=o(4768),m=o(88030);let g={isUnsupportedChainView:()=>"UnsupportedChain"===w.RouterController.state.view||"SwitchNetwork"===w.RouterController.state.view&&w.RouterController.state.history.includes("UnsupportedChain"),async safeClose(){if(this.isUnsupportedChainView()||await m.w.isSIWXCloseDisabled()){c.I.shake();return}("DataCapture"===w.RouterController.state.view||"DataCaptureOtpConfirm"===w.RouterController.state.view)&&h.ConnectionController.disconnect(),c.I.close()}};var y=o(46283),b=o(72895),v=o(69778),f=o(14702),k=o(20094),C=o(89658),x=o(19514),T=o(46027),S=o(97630),A=o(92405),P=o(12455);let $={getGasPriceInEther:(e,t)=>Number(t*e)/1e18,getGasPriceInUSD(e,t,o){let r=$.getGasPriceInEther(t,o);return C.C.bigNumber(e).times(r).toNumber()},getPriceImpact({sourceTokenAmount:e,sourceTokenPriceInUSD:t,toTokenPriceInUSD:o,toTokenAmount:r}){let i=C.C.bigNumber(e).times(t),a=C.C.bigNumber(r).times(o);return i.minus(a).div(i).times(100).toNumber()},getMaxSlippage(e,t){let o=C.C.bigNumber(e).div(100);return C.C.multiply(t,o).toNumber()},getProviderFee:(e,t=.0085)=>C.C.bigNumber(e).times(t).toString(),isInsufficientNetworkTokenForGas:(e,t)=>!!C.C.bigNumber(e).eq(0)||C.C.bigNumber(C.C.bigNumber(t||"0")).gt(e),isInsufficientSourceTokenForSwap(e,t,o){let r=o?.find(e=>e.address===t)?.quantity?.numeric;return C.C.bigNumber(r||"0").lt(e)}};var R=o(1096),I=o(6319),E=o(10271),N=o(36445);let O={initializing:!1,initialized:!1,loadingPrices:!1,loadingQuote:!1,loadingApprovalTransaction:!1,loadingBuildTransaction:!1,loadingTransaction:!1,switchingTokens:!1,fetchError:!1,approvalTransaction:void 0,swapTransaction:void 0,transactionError:void 0,sourceToken:void 0,sourceTokenAmount:"",sourceTokenPriceInUSD:0,toToken:void 0,toTokenAmount:"",toTokenPriceInUSD:0,networkPrice:"0",networkBalanceInUSD:"0",networkTokenSymbol:"",inputError:void 0,slippage:A.bq.CONVERT_SLIPPAGE_TOLERANCE,tokens:void 0,popularTokens:void 0,suggestedTokens:void 0,foundTokens:void 0,myTokensWithBalance:void 0,tokensPriceMap:{},gasFee:"0",gasPriceInUSD:0,priceImpact:void 0,maxSlippage:void 0,providerFee:void 0},W=(0,f.sj)({...O}),B={state:W,subscribe:e=>(0,f.Ld)(W,()=>e(W)),subscribeKey:(e,t)=>(0,k.VW)(W,e,t),getParams(){let e=d.R.state.activeChain,t=d.R.getAccountData(e)?.caipAddress??d.R.state.activeCaipAddress,o=v.j.getPlainAddress(t),r=(0,S.EO)(),i=u.ConnectorController.getConnectorId(d.R.state.activeChain);if(!o)throw Error("No address found to swap the tokens from.");let a=!W.toToken?.address||!W.toToken?.decimals,n=!W.sourceToken?.address||!W.sourceToken?.decimals||!C.C.bigNumber(W.sourceTokenAmount).gt(0),l=!W.sourceTokenAmount;return{networkAddress:r,fromAddress:o,fromCaipAddress:t,sourceTokenAddress:W.sourceToken?.address,toTokenAddress:W.toToken?.address,toTokenAmount:W.toTokenAmount,toTokenDecimals:W.toToken?.decimals,sourceTokenAmount:W.sourceTokenAmount,sourceTokenDecimals:W.sourceToken?.decimals,invalidToToken:a,invalidSourceToken:n,invalidSourceTokenAmount:l,availableToSwap:t&&!a&&!n&&!l,isAuthConnector:i===s.b.CONNECTOR_ID.AUTH}},async setSourceToken(e){if(!e){W.sourceToken=e,W.sourceTokenAmount="",W.sourceTokenPriceInUSD=0;return}W.sourceToken=e,await D.setTokenPrice(e.address,"sourceToken")},setSourceTokenAmount(e){W.sourceTokenAmount=e},async setToToken(e){if(!e){W.toToken=e,W.toTokenAmount="",W.toTokenPriceInUSD=0;return}W.toToken=e,await D.setTokenPrice(e.address,"toToken")},setToTokenAmount(e){W.toTokenAmount=e?C.C.toFixed(e,6):""},async setTokenPrice(e,t){let o=W.tokensPriceMap[e]||0;o||(W.loadingPrices=!0,o=await D.getAddressPrice(e)),"sourceToken"===t?W.sourceTokenPriceInUSD=o:"toToken"===t&&(W.toTokenPriceInUSD=o),W.loadingPrices&&(W.loadingPrices=!1),D.getParams().availableToSwap&&!W.switchingTokens&&D.swapTokens()},async switchTokens(){if(!W.initializing&&W.initialized&&!W.switchingTokens){W.switchingTokens=!0;try{let e=W.toToken?{...W.toToken}:void 0,t=W.sourceToken?{...W.sourceToken}:void 0,o=e&&""===W.toTokenAmount?"1":W.toTokenAmount;D.setSourceTokenAmount(o),D.setToTokenAmount(""),await D.setSourceToken(e),await D.setToToken(t),W.switchingTokens=!1,D.swapTokens()}catch(e){throw W.switchingTokens=!1,e}}},resetState(){W.myTokensWithBalance=O.myTokensWithBalance,W.tokensPriceMap=O.tokensPriceMap,W.initialized=O.initialized,W.initializing=O.initializing,W.switchingTokens=O.switchingTokens,W.sourceToken=O.sourceToken,W.sourceTokenAmount=O.sourceTokenAmount,W.sourceTokenPriceInUSD=O.sourceTokenPriceInUSD,W.toToken=O.toToken,W.toTokenAmount=O.toTokenAmount,W.toTokenPriceInUSD=O.toTokenPriceInUSD,W.networkPrice=O.networkPrice,W.networkTokenSymbol=O.networkTokenSymbol,W.networkBalanceInUSD=O.networkBalanceInUSD,W.inputError=O.inputError},resetValues(){let{networkAddress:e}=D.getParams(),t=W.tokens?.find(t=>t.address===e);D.setSourceToken(t),D.setToToken(void 0)},getApprovalLoadingState:()=>W.loadingApprovalTransaction,clearError(){W.transactionError=void 0},async initializeState(){if(!W.initializing){if(W.initializing=!0,!W.initialized)try{await D.fetchTokens(),W.initialized=!0}catch(e){W.initialized=!1,b.SnackController.showError("Failed to initialize swap"),w.RouterController.goBack()}W.initializing=!1}},async fetchTokens(){let{networkAddress:e}=D.getParams();await D.getNetworkTokenPrice(),await D.getMyTokensWithBalance();let t=W.myTokensWithBalance?.find(t=>t.address===e);t&&(W.networkTokenSymbol=t.symbol,D.setSourceToken(t),D.setSourceTokenAmount("0"))},async getTokenList(){let e=d.R.state.activeCaipNetwork?.caipNetworkId;if(W.caipNetworkId!==e||!W.tokens)try{W.tokensLoading=!0;let t=await P.n.getTokenList(e);W.tokens=t,W.caipNetworkId=e,W.popularTokens=t.sort((e,t)=>e.symbol<t.symbol?-1:e.symbol>t.symbol?1:0),W.suggestedTokens=t.filter(e=>!!A.bq.SWAP_SUGGESTED_TOKENS.includes(e.symbol))}catch(e){W.tokens=[],W.popularTokens=[],W.suggestedTokens=[]}finally{W.tokensLoading=!1}},async getAddressPrice(e){let t=W.tokensPriceMap[e];if(t)return t;let o=await E.L.fetchTokenPrice({addresses:[e]}),r=o?.fungibles||[],i=[...W.tokens||[],...W.myTokensWithBalance||[]],a=i?.find(t=>t.address===e)?.symbol,n=parseFloat((r.find(e=>e.symbol.toLowerCase()===a?.toLowerCase())?.price||0).toString());return W.tokensPriceMap[e]=n,n},async getNetworkTokenPrice(){let{networkAddress:e}=D.getParams(),t=await E.L.fetchTokenPrice({addresses:[e]}).catch(()=>(b.SnackController.showError("Failed to fetch network token price"),{fungibles:[]})),o=t.fungibles?.[0],r=o?.price.toString()||"0";W.tokensPriceMap[e]=parseFloat(r),W.networkTokenSymbol=o?.symbol||"",W.networkPrice=r},async getMyTokensWithBalance(e){let t=await T.Q.getMyTokensWithBalance(e),o=P.n.mapBalancesToSwapTokens(t);o&&(await D.getInitialGasPrice(),D.setBalances(o))},setBalances(e){let{networkAddress:t}=D.getParams(),o=d.R.state.activeCaipNetwork;if(!o)return;let r=e.find(e=>e.address===t);e.forEach(e=>{W.tokensPriceMap[e.address]=e.price||0}),W.myTokensWithBalance=e.filter(e=>e.address.startsWith(o.caipNetworkId)),W.networkBalanceInUSD=r?C.C.multiply(r.quantity.numeric,r.price).toString():"0"},async getInitialGasPrice(){let e=await P.n.fetchGasPrice();if(!e)return{gasPrice:null,gasPriceInUSD:null};switch(d.R.state?.activeCaipNetwork?.chainNamespace){case s.b.CHAIN.SOLANA:return W.gasFee=e.standard??"0",W.gasPriceInUSD=C.C.multiply(e.standard,W.networkPrice).div(1e9).toNumber(),{gasPrice:BigInt(W.gasFee),gasPriceInUSD:Number(W.gasPriceInUSD)};case s.b.CHAIN.EVM:default:let t=e.standard??"0",o=BigInt(t),r=BigInt(15e4),i=$.getGasPriceInUSD(W.networkPrice,r,o);return W.gasFee=t,W.gasPriceInUSD=i,{gasPrice:o,gasPriceInUSD:i}}},async swapTokens(){let e=d.R.getAccountData()?.address,t=W.sourceToken,o=W.toToken,r=C.C.bigNumber(W.sourceTokenAmount).gt(0);if(r||D.setToTokenAmount(""),!o||!t||W.loadingPrices||!r||!e)return;W.loadingQuote=!0;let i=C.C.bigNumber(W.sourceTokenAmount).times(10**t.decimals).round(0);try{let r=await E.L.fetchSwapQuote({userAddress:e,from:t.address,to:o.address,gasPrice:W.gasFee,amount:i.toString()});W.loadingQuote=!1;let a=r?.quotes?.[0]?.toAmount;if(!a){I.AlertController.open({displayMessage:"Incorrect amount",debugMessage:"Please enter a valid amount"},"error");return}let n=C.C.bigNumber(a).div(10**o.decimals).toString();D.setToTokenAmount(n),D.hasInsufficientToken(W.sourceTokenAmount,t.address)?W.inputError="Insufficient balance":(W.inputError=void 0,D.setTransactionDetails())}catch(t){let e=await P.n.handleSwapError(t);W.loadingQuote=!1,W.inputError=e||"Insufficient balance"}},async getTransaction(){let{fromCaipAddress:e,availableToSwap:t}=D.getParams(),o=W.sourceToken,r=W.toToken;if(e&&t&&o&&r&&!W.loadingQuote)try{let t;return W.loadingBuildTransaction=!0,t=await P.n.fetchSwapAllowance({userAddress:e,tokenAddress:o.address,sourceTokenAmount:W.sourceTokenAmount,sourceTokenDecimals:o.decimals})?await D.createSwapTransaction():await D.createAllowanceTransaction(),W.loadingBuildTransaction=!1,W.fetchError=!1,t}catch(e){w.RouterController.goBack(),b.SnackController.showError("Failed to check allowance"),W.loadingBuildTransaction=!1,W.approvalTransaction=void 0,W.swapTransaction=void 0,W.fetchError=!0;return}},async createAllowanceTransaction(){let{fromCaipAddress:e,sourceTokenAddress:t,toTokenAddress:o}=D.getParams();if(e&&o){if(!t)throw Error("createAllowanceTransaction - No source token address found.");try{let r=await E.L.generateApproveCalldata({from:t,to:o,userAddress:e}),i=v.j.getPlainAddress(r.tx.from);if(!i)throw Error("SwapController:createAllowanceTransaction - address is required");let a={data:r.tx.data,to:i,gasPrice:BigInt(r.tx.eip155.gasPrice),value:BigInt(r.tx.value),toAmount:W.toTokenAmount};return W.swapTransaction=void 0,W.approvalTransaction={data:a.data,to:a.to,gasPrice:a.gasPrice,value:a.value,toAmount:a.toAmount},{data:a.data,to:a.to,gasPrice:a.gasPrice,value:a.value,toAmount:a.toAmount}}catch(e){w.RouterController.goBack(),b.SnackController.showError("Failed to create approval transaction"),W.approvalTransaction=void 0,W.swapTransaction=void 0,W.fetchError=!0;return}}},async createSwapTransaction(){let{networkAddress:e,fromCaipAddress:t,sourceTokenAmount:o}=D.getParams(),r=W.sourceToken,i=W.toToken;if(!t||!o||!r||!i)return;let a=h.ConnectionController.parseUnits(o,r.decimals)?.toString();try{let o=await E.L.generateSwapCalldata({userAddress:t,from:r.address,to:i.address,amount:a,disableEstimate:!0}),n=r.address===e,s=BigInt(o.tx.eip155.gas),l=BigInt(o.tx.eip155.gasPrice),c=v.j.getPlainAddress(o.tx.to);if(!c)throw Error("SwapController:createSwapTransaction - address is required");let d={data:o.tx.data,to:c,gas:s,gasPrice:l,value:n?BigInt(a??"0"):BigInt("0"),toAmount:W.toTokenAmount};return W.gasPriceInUSD=$.getGasPriceInUSD(W.networkPrice,s,l),W.approvalTransaction=void 0,W.swapTransaction=d,d}catch(e){w.RouterController.goBack(),b.SnackController.showError("Failed to create transaction"),W.approvalTransaction=void 0,W.swapTransaction=void 0,W.fetchError=!0;return}},onEmbeddedWalletApprovalSuccess(){b.SnackController.showLoading("Approve limit increase in your wallet"),w.RouterController.replace("SwapPreview")},async sendTransactionForApproval(e){let{fromAddress:t,isAuthConnector:o}=D.getParams();W.loadingApprovalTransaction=!0,o?w.RouterController.pushTransactionStack({onSuccess:D.onEmbeddedWalletApprovalSuccess}):b.SnackController.showLoading("Approve limit increase in your wallet");try{await h.ConnectionController.sendTransaction({address:t,to:e.to,data:e.data,value:e.value,chainNamespace:s.b.CHAIN.EVM}),await D.swapTokens(),await D.getTransaction(),W.approvalTransaction=void 0,W.loadingApprovalTransaction=!1}catch(e){W.transactionError=e?.displayMessage,W.loadingApprovalTransaction=!1,b.SnackController.showError(e?.displayMessage||"Transaction error"),N.X.sendEvent({type:"track",event:"SWAP_APPROVAL_ERROR",properties:{message:e?.displayMessage||e?.message||"Unknown",network:d.R.state.activeCaipNetwork?.caipNetworkId||"",swapFromToken:D.state.sourceToken?.symbol||"",swapToToken:D.state.toToken?.symbol||"",swapFromAmount:D.state.sourceTokenAmount||"",swapToAmount:D.state.toTokenAmount||"",isSmartAccount:(0,S.r9)(s.b.CHAIN.EVM)===x.y_.ACCOUNT_TYPES.SMART_ACCOUNT}})}},async sendTransactionForSwap(e){if(!e)return;let{fromAddress:t,toTokenAmount:o,isAuthConnector:r}=D.getParams();W.loadingTransaction=!0;let i=`Swapping ${W.sourceToken?.symbol} to ${C.C.formatNumberToLocalString(o,3)} ${W.toToken?.symbol}`,a=`Swapped ${W.sourceToken?.symbol} to ${C.C.formatNumberToLocalString(o,3)} ${W.toToken?.symbol}`;r?w.RouterController.pushTransactionStack({onSuccess(){w.RouterController.replace("Account"),b.SnackController.showLoading(i),B.resetState()}}):b.SnackController.showLoading("Confirm transaction in your wallet");try{let o=[W.sourceToken?.address,W.toToken?.address].join(","),i=await h.ConnectionController.sendTransaction({address:t,to:e.to,data:e.data,value:e.value,chainNamespace:s.b.CHAIN.EVM});return W.loadingTransaction=!1,b.SnackController.showSuccess(a),N.X.sendEvent({type:"track",event:"SWAP_SUCCESS",properties:{network:d.R.state.activeCaipNetwork?.caipNetworkId||"",swapFromToken:D.state.sourceToken?.symbol||"",swapToToken:D.state.toToken?.symbol||"",swapFromAmount:D.state.sourceTokenAmount||"",swapToAmount:D.state.toTokenAmount||"",isSmartAccount:(0,S.r9)(s.b.CHAIN.EVM)===x.y_.ACCOUNT_TYPES.SMART_ACCOUNT}}),B.resetState(),r||w.RouterController.replace("Account"),B.getMyTokensWithBalance(o),i}catch(e){W.transactionError=e?.displayMessage,W.loadingTransaction=!1,b.SnackController.showError(e?.displayMessage||"Transaction error"),N.X.sendEvent({type:"track",event:"SWAP_ERROR",properties:{message:e?.displayMessage||e?.message||"Unknown",network:d.R.state.activeCaipNetwork?.caipNetworkId||"",swapFromToken:D.state.sourceToken?.symbol||"",swapToToken:D.state.toToken?.symbol||"",swapFromAmount:D.state.sourceTokenAmount||"",swapToAmount:D.state.toTokenAmount||"",isSmartAccount:(0,S.r9)(s.b.CHAIN.EVM)===x.y_.ACCOUNT_TYPES.SMART_ACCOUNT}});return}},hasInsufficientToken:(e,t)=>$.isInsufficientSourceTokenForSwap(e,t,W.myTokensWithBalance),setTransactionDetails(){let{toTokenAddress:e,toTokenDecimals:t}=D.getParams();e&&t&&(W.gasPriceInUSD=$.getGasPriceInUSD(W.networkPrice,BigInt(W.gasFee),BigInt(15e4)),W.priceImpact=$.getPriceImpact({sourceTokenAmount:W.sourceTokenAmount,sourceTokenPriceInUSD:W.sourceTokenPriceInUSD,toTokenPriceInUSD:W.toTokenPriceInUSD,toTokenAmount:W.toTokenAmount}),W.maxSlippage=$.getMaxSlippage(W.slippage,W.toTokenAmount),W.providerFee=$.getProviderFee(W.sourceTokenAmount))}},D=(0,R.P)(B);var z=o(81078),F=o(44953),U=o(44346),L=o(5603),j=(0,L.iv)`
  :host {
    display: block;
    border-radius: clamp(0px, ${({borderRadius:e})=>e["8"]}, 44px);
    box-shadow: 0 0 0 1px ${({tokens:e})=>e.theme.foregroundPrimary};
    overflow: hidden;
  }
`;let M=class extends r.oi{render(){return(0,r.dy)`<slot></slot>`}};M.styles=[F.ET,j],M=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n}([(0,U.M)("wui-card")],M),o(10808),o(5012),o(76061),o(36547);var H=(0,L.iv)`
  :host {
    width: 100%;
  }

  :host > wui-flex {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({spacing:e})=>e[2]};
    padding: ${({spacing:e})=>e[3]};
    border-radius: ${({borderRadius:e})=>e[6]};
    border: 1px solid ${({tokens:e})=>e.theme.borderPrimary};
    box-sizing: border-box;
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.25);
    color: ${({tokens:e})=>e.theme.textPrimary};
  }

  :host > wui-flex[data-type='info'] {
    .icon-box {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};

      wui-icon {
        color: ${({tokens:e})=>e.theme.iconDefault};
      }
    }
  }
  :host > wui-flex[data-type='success'] {
    .icon-box {
      background-color: ${({tokens:e})=>e.core.backgroundSuccess};

      wui-icon {
        color: ${({tokens:e})=>e.core.borderSuccess};
      }
    }
  }
  :host > wui-flex[data-type='warning'] {
    .icon-box {
      background-color: ${({tokens:e})=>e.core.backgroundWarning};

      wui-icon {
        color: ${({tokens:e})=>e.core.borderWarning};
      }
    }
  }
  :host > wui-flex[data-type='error'] {
    .icon-box {
      background-color: ${({tokens:e})=>e.core.backgroundError};

      wui-icon {
        color: ${({tokens:e})=>e.core.borderError};
      }
    }
  }

  wui-flex {
    width: 100%;
  }

  wui-text {
    word-break: break-word;
    flex: 1;
  }

  .close {
    cursor: pointer;
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  .icon-box {
    height: 40px;
    width: 40px;
    border-radius: ${({borderRadius:e})=>e["2"]};
    background-color: var(--local-icon-bg-value);
  }
`,_=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let V={info:"info",success:"checkmark",warning:"warningCircle",error:"warning"},K=class extends r.oi{constructor(){super(...arguments),this.message="",this.type="info"}render(){return(0,r.dy)`
      <wui-flex
        data-type=${(0,a.o)(this.type)}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        gap="2"
      >
        <wui-flex columnGap="2" flexDirection="row" alignItems="center">
          <wui-flex
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            class="icon-box"
          >
            <wui-icon color="inherit" size="md" name=${V[this.type]}></wui-icon>
          </wui-flex>
          <wui-text variant="md-medium" color="inherit" data-testid="wui-alertbar-text"
            >${this.message}</wui-text
          >
        </wui-flex>
        <wui-icon
          class="close"
          color="inherit"
          size="sm"
          name="close"
          @click=${this.onClose}
        ></wui-icon>
      </wui-flex>
    `}onClose(){I.AlertController.close()}};K.styles=[F.ET,H],_([(0,i.Cb)()],K.prototype,"message",void 0),_([(0,i.Cb)()],K.prototype,"type",void 0),K=_([(0,U.M)("wui-alertbar")],K);var X=(0,z.iv)`
  :host {
    display: block;
    position: absolute;
    top: ${({spacing:e})=>e["3"]};
    left: ${({spacing:e})=>e["4"]};
    right: ${({spacing:e})=>e["4"]};
    opacity: 0;
    pointer-events: none;
  }
`,G=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let Y={info:{backgroundColor:"fg-350",iconColor:"fg-325",icon:"info"},success:{backgroundColor:"success-glass-reown-020",iconColor:"success-125",icon:"checkmark"},warning:{backgroundColor:"warning-glass-reown-020",iconColor:"warning-100",icon:"warningCircle"},error:{backgroundColor:"error-glass-reown-020",iconColor:"error-125",icon:"warning"}},q=class extends r.oi{constructor(){super(),this.unsubscribe=[],this.open=I.AlertController.state.open,this.onOpen(!0),this.unsubscribe.push(I.AlertController.subscribeKey("open",e=>{this.open=e,this.onOpen(!1)}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let{message:e,variant:t}=I.AlertController.state,o=Y[t];return(0,r.dy)`
      <wui-alertbar
        message=${e}
        backgroundColor=${o?.backgroundColor}
        iconColor=${o?.iconColor}
        icon=${o?.icon}
        type=${t}
      ></wui-alertbar>
    `}onOpen(e){this.open?(this.animate([{opacity:0,transform:"scale(0.85)"},{opacity:1,transform:"scale(1)"}],{duration:150,fill:"forwards",easing:"ease"}),this.style.cssText="pointer-events: auto"):e||(this.animate([{opacity:1,transform:"scale(1)"},{opacity:0,transform:"scale(0.85)"}],{duration:150,fill:"forwards",easing:"ease"}),this.style.cssText="pointer-events: none")}};q.styles=X,G([(0,i.SB)()],q.prototype,"open",void 0),q=G([(0,z.Mo)("w3m-alertbar")],q);var Q=o(28430),Z=o(99717),J=(0,L.iv)`
  :host {
    position: relative;
  }

  button {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    padding: ${({spacing:e})=>e[1]};
  }

  /* -- Colors --------------------------------------------------- */
  button[data-type='accent'] wui-icon {
    color: ${({tokens:e})=>e.core.iconAccentPrimary};
  }

  button[data-type='neutral'][data-variant='primary'] wui-icon {
    color: ${({tokens:e})=>e.theme.iconInverse};
  }

  button[data-type='neutral'][data-variant='secondary'] wui-icon {
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  button[data-type='success'] wui-icon {
    color: ${({tokens:e})=>e.core.iconSuccess};
  }

  button[data-type='error'] wui-icon {
    color: ${({tokens:e})=>e.core.iconError};
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='xs'] {
    width: 16px;
    height: 16px;

    border-radius: ${({borderRadius:e})=>e[1]};
  }

  button[data-size='sm'] {
    width: 20px;
    height: 20px;
    border-radius: ${({borderRadius:e})=>e[1]};
  }

  button[data-size='md'] {
    width: 24px;
    height: 24px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  button[data-size='lg'] {
    width: 28px;
    height: 28px;
    border-radius: ${({borderRadius:e})=>e[2]};
  }

  button[data-size='xs'] wui-icon {
    width: 8px;
    height: 8px;
  }

  button[data-size='sm'] wui-icon {
    width: 12px;
    height: 12px;
  }

  button[data-size='md'] wui-icon {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] wui-icon {
    width: 20px;
    height: 20px;
  }

  /* -- Hover --------------------------------------------------- */
  @media (hover: hover) {
    button[data-type='accent']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.foregroundAccent010};
    }

    button[data-variant='primary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }

    button[data-variant='secondary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }

    button[data-type='success']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.backgroundSuccess};
    }

    button[data-type='error']:hover:enabled {
      background-color: ${({tokens:e})=>e.core.backgroundError};
    }
  }

  /* -- Focus --------------------------------------------------- */
  button:focus-visible {
    box-shadow: 0 0 0 4px ${({tokens:e})=>e.core.foregroundAccent020};
  }

  /* -- Properties --------------------------------------------------- */
  button[data-full-width='true'] {
    width: 100%;
  }

  :host([fullWidth]) {
    width: 100%;
  }

  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`,ee=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let et=class extends r.oi{constructor(){super(...arguments),this.icon="card",this.variant="primary",this.type="accent",this.size="md",this.iconSize=void 0,this.fullWidth=!1,this.disabled=!1}render(){return(0,r.dy)`<button
      data-variant=${this.variant}
      data-type=${this.type}
      data-size=${this.size}
      data-full-width=${this.fullWidth}
      ?disabled=${this.disabled}
    >
      <wui-icon color="inherit" name=${this.icon} size=${(0,a.o)(this.iconSize)}></wui-icon>
    </button>`}};et.styles=[F.ET,F.ZM,J],ee([(0,i.Cb)()],et.prototype,"icon",void 0),ee([(0,i.Cb)()],et.prototype,"variant",void 0),ee([(0,i.Cb)()],et.prototype,"type",void 0),ee([(0,i.Cb)()],et.prototype,"size",void 0),ee([(0,i.Cb)()],et.prototype,"iconSize",void 0),ee([(0,i.Cb)({type:Boolean})],et.prototype,"fullWidth",void 0),ee([(0,i.Cb)({type:Boolean})],et.prototype,"disabled",void 0),et=ee([(0,U.M)("wui-icon-button")],et),o(81899);var eo=(0,L.iv)`
  button {
    display: block;
    display: flex;
    align-items: center;
    padding: ${({spacing:e})=>e[1]};
    transition: background-color ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: background-color;
    border-radius: ${({borderRadius:e})=>e[32]};
  }

  wui-image {
    border-radius: 100%;
  }

  wui-text {
    padding-left: ${({spacing:e})=>e[1]};
  }

  .left-icon-container,
  .right-icon-container {
    width: 24px;
    height: 24px;
    justify-content: center;
    align-items: center;
  }

  wui-icon {
    color: ${({tokens:e})=>e.theme.iconDefault};
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='lg'] {
    height: 32px;
  }

  button[data-size='md'] {
    height: 28px;
  }

  button[data-size='sm'] {
    height: 24px;
  }

  button[data-size='lg'] wui-image {
    width: 24px;
    height: 24px;
  }

  button[data-size='md'] wui-image {
    width: 20px;
    height: 20px;
  }

  button[data-size='sm'] wui-image {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] .left-icon-container {
    width: 24px;
    height: 24px;
  }

  button[data-size='md'] .left-icon-container {
    width: 20px;
    height: 20px;
  }

  button[data-size='sm'] .left-icon-container {
    width: 16px;
    height: 16px;
  }

  /* -- Variants --------------------------------------------------------- */
  button[data-type='filled-dropdown'] {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  button[data-type='text-dropdown'] {
    background-color: transparent;
  }

  /* -- Focus states --------------------------------------------------- */
  button:focus-visible:enabled {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    box-shadow: 0 0 0 4px ${({tokens:e})=>e.core.foregroundAccent040};
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled,
    button:active:enabled {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }

  /* -- Disabled states --------------------------------------------------- */
  button:disabled {
    background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    opacity: 0.5;
  }
`,er=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let ei={lg:"lg-regular",md:"md-regular",sm:"sm-regular"},ea={lg:"lg",md:"md",sm:"sm"},en=class extends r.oi{constructor(){super(...arguments),this.imageSrc="",this.text="",this.size="lg",this.type="text-dropdown",this.disabled=!1}render(){return(0,r.dy)`<button ?disabled=${this.disabled} data-size=${this.size} data-type=${this.type}>
      ${this.imageTemplate()} ${this.textTemplate()}
      <wui-flex class="right-icon-container">
        <wui-icon name="chevronBottom"></wui-icon>
      </wui-flex>
    </button>`}textTemplate(){let e=ei[this.size];return this.text?(0,r.dy)`<wui-text color="primary" variant=${e}>${this.text}</wui-text>`:null}imageTemplate(){if(this.imageSrc)return(0,r.dy)`<wui-image src=${this.imageSrc} alt="select visual"></wui-image>`;let e=ea[this.size];return(0,r.dy)` <wui-flex class="left-icon-container">
      <wui-icon size=${e} name="networkPlaceholder"></wui-icon>
    </wui-flex>`}};en.styles=[F.ET,F.ZM,eo],er([(0,i.Cb)()],en.prototype,"imageSrc",void 0),er([(0,i.Cb)()],en.prototype,"text",void 0),er([(0,i.Cb)()],en.prototype,"size",void 0),er([(0,i.Cb)()],en.prototype,"type",void 0),er([(0,i.Cb)({type:Boolean})],en.prototype,"disabled",void 0),en=er([(0,U.M)("wui-select")],en),o(71899),o(15853);var es=o(64105),el=(0,z.iv)`
  :host {
    height: 60px;
  }

  :host > wui-flex {
    box-sizing: border-box;
    background-color: var(--local-header-background-color);
  }

  wui-text {
    background-color: var(--local-header-background-color);
  }

  wui-flex.w3m-header-title {
    transform: translateY(0);
    opacity: 1;
  }

  wui-flex.w3m-header-title[view-direction='prev'] {
    animation:
      slide-down-out 120ms forwards ${({easings:e})=>e["ease-out-power-2"]},
      slide-down-in 120ms forwards ${({easings:e})=>e["ease-out-power-2"]};
    animation-delay: 0ms, 200ms;
  }

  wui-flex.w3m-header-title[view-direction='next'] {
    animation:
      slide-up-out 120ms forwards ${({easings:e})=>e["ease-out-power-2"]},
      slide-up-in 120ms forwards ${({easings:e})=>e["ease-out-power-2"]};
    animation-delay: 0ms, 200ms;
  }

  wui-icon-button[data-hidden='true'] {
    opacity: 0 !important;
    pointer-events: none;
  }

  @keyframes slide-up-out {
    from {
      transform: translateY(0px);
      opacity: 1;
    }
    to {
      transform: translateY(3px);
      opacity: 0;
    }
  }

  @keyframes slide-up-in {
    from {
      transform: translateY(-3px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slide-down-out {
    from {
      transform: translateY(0px);
      opacity: 1;
    }
    to {
      transform: translateY(-3px);
      opacity: 0;
    }
  }

  @keyframes slide-down-in {
    from {
      transform: translateY(3px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`,ec=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let ed=["SmartSessionList"],eu={PayWithExchange:z.gR.tokens.theme.foregroundPrimary};function ep(){let e=w.RouterController.state.data?.connector?.name,t=w.RouterController.state.data?.wallet?.name,o=w.RouterController.state.data?.network?.name,r=t??e,i=u.ConnectorController.getConnectors(),a=1===i.length&&i[0]?.id==="w3m-email",n=d.R.getAccountData()?.socialProvider;return{Connect:`Connect ${a?"Email":""} Wallet`,Create:"Create Wallet",ChooseAccountName:void 0,Account:void 0,AccountSettings:void 0,AllWallets:"All Wallets",ApproveTransaction:"Approve Transaction",BuyInProgress:"Buy",ConnectingExternal:r??"Connect Wallet",ConnectingWalletConnect:r??"WalletConnect",ConnectingWalletConnectBasic:"WalletConnect",ConnectingSiwe:"Sign In",Convert:"Convert",ConvertSelectToken:"Select token",ConvertPreview:"Preview Convert",Downloads:r?`Get ${r}`:"Downloads",EmailLogin:"Email Login",EmailVerifyOtp:"Confirm Email",EmailVerifyDevice:"Register Device",GetWallet:"Get a Wallet",Networks:"Choose Network",OnRampProviders:"Choose Provider",OnRampActivity:"Activity",OnRampTokenSelect:"Select Token",OnRampFiatSelect:"Select Currency",Pay:"How you pay",ProfileWallets:"Wallets",SwitchNetwork:o??"Switch Network",Transactions:"Activity",UnsupportedChain:"Switch Network",UpgradeEmailWallet:"Upgrade Your Wallet",UpdateEmailWallet:"Edit Email",UpdateEmailPrimaryOtp:"Confirm Current Email",UpdateEmailSecondaryOtp:"Confirm New Email",WhatIsABuy:"What is Buy?",RegisterAccountName:"Choose Name",RegisterAccountNameSuccess:"",WalletReceive:"Receive",WalletCompatibleNetworks:"Compatible Networks",Swap:"Swap",SwapSelectToken:"Select Token",SwapPreview:"Preview Swap",WalletSend:"Send",WalletSendPreview:"Review Send",WalletSendSelectToken:"Select Token",WalletSendConfirmed:"Confirmed",WhatIsANetwork:"What is a network?",WhatIsAWallet:"What is a Wallet?",ConnectWallets:"Connect Wallet",ConnectSocials:"All Socials",ConnectingSocial:n?n.charAt(0).toUpperCase()+n.slice(1):"Connect Social",ConnectingMultiChain:"Select Chain",ConnectingFarcaster:"Farcaster",SwitchActiveChain:"Switch Chain",SmartSessionCreated:void 0,SmartSessionList:"Smart Sessions",SIWXSignMessage:"Sign In",PayLoading:"Payment in Progress",DataCapture:"Profile",DataCaptureOtpConfirm:"Confirm Email",FundWallet:"Fund Wallet",PayWithExchange:"Deposit from Exchange",PayWithExchangeSelectAsset:"Select Asset"}}let ew=class extends r.oi{constructor(){super(),this.unsubscribe=[],this.heading=ep()[w.RouterController.state.view],this.network=d.R.state.activeCaipNetwork,this.networkImage=Q.f.getNetworkImage(this.network),this.showBack=!1,this.prevHistoryLength=1,this.view=w.RouterController.state.view,this.viewDirection="",this.unsubscribe.push(Z.W.subscribeNetworkImages(()=>{this.networkImage=Q.f.getNetworkImage(this.network)}),w.RouterController.subscribeKey("view",e=>{setTimeout(()=>{this.view=e,this.heading=ep()[e]},es.b.ANIMATION_DURATIONS.HeaderText),this.onViewChange(),this.onHistoryChange()}),d.R.subscribeKey("activeCaipNetwork",e=>{this.network=e,this.networkImage=Q.f.getNetworkImage(this.network)}))}disconnectCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=eu[w.RouterController.state.view]??z.gR.tokens.theme.backgroundPrimary;return this.style.setProperty("--local-header-background-color",e),(0,r.dy)`
      <wui-flex
        .padding=${["0","4","0","4"]}
        justifyContent="space-between"
        alignItems="center"
      >
        ${this.leftHeaderTemplate()} ${this.titleTemplate()} ${this.rightHeaderTemplate()}
      </wui-flex>
    `}onWalletHelp(){N.X.sendEvent({type:"track",event:"CLICK_WALLET_HELP"}),w.RouterController.push("WhatIsAWallet")}async onClose(){await g.safeClose()}rightHeaderTemplate(){let e=l.OptionsController?.state?.features?.smartSessions;return"Account"===w.RouterController.state.view&&e?(0,r.dy)`<wui-flex>
      <wui-icon-button
        icon="clock"
        size="lg"
        iconSize="lg"
        type="neutral"
        variant="primary"
        @click=${()=>w.RouterController.push("SmartSessionList")}
        data-testid="w3m-header-smart-sessions"
      ></wui-icon-button>
      ${this.closeButtonTemplate()}
    </wui-flex> `:this.closeButtonTemplate()}closeButtonTemplate(){return(0,r.dy)`
      <wui-icon-button
        icon="close"
        size="lg"
        type="neutral"
        variant="primary"
        iconSize="lg"
        @click=${this.onClose.bind(this)}
        data-testid="w3m-header-close"
      ></wui-icon-button>
    `}titleTemplate(){let e=ed.includes(this.view);return(0,r.dy)`
      <wui-flex
        view-direction="${this.viewDirection}"
        class="w3m-header-title"
        alignItems="center"
        gap="2"
      >
        <wui-text
          display="inline"
          variant="lg-regular"
          color="primary"
          data-testid="w3m-header-text"
        >
          ${this.heading}
        </wui-text>
        ${e?(0,r.dy)`<wui-tag variant="accent" size="md">Beta</wui-tag>`:null}
      </wui-flex>
    `}leftHeaderTemplate(){let{view:e}=w.RouterController.state,t="Connect"===e,o=l.OptionsController.state.enableEmbedded,i=l.OptionsController.state.enableNetworkSwitch;return"Account"===e&&i?(0,r.dy)`<wui-select
        id="dynamic"
        data-testid="w3m-account-select-network"
        active-network=${(0,a.o)(this.network?.name)}
        @click=${this.onNetworks.bind(this)}
        imageSrc=${(0,a.o)(this.networkImage)}
      ></wui-select>`:this.showBack&&!("ApproveTransaction"===e||"ConnectingSiwe"===e||t&&o)?(0,r.dy)`<wui-icon-button
        data-testid="header-back"
        id="dynamic"
        icon="chevronLeft"
        size="lg"
        iconSize="lg"
        type="neutral"
        variant="primary"
        @click=${this.onGoBack.bind(this)}
      ></wui-icon-button>`:(0,r.dy)`<wui-icon-button
      data-hidden=${!t}
      id="dynamic"
      icon="helpCircle"
      size="lg"
      iconSize="lg"
      type="neutral"
      variant="primary"
      @click=${this.onWalletHelp.bind(this)}
    ></wui-icon-button>`}onNetworks(){this.isAllowedNetworkSwitch()&&(N.X.sendEvent({type:"track",event:"CLICK_NETWORKS"}),w.RouterController.push("Networks"))}isAllowedNetworkSwitch(){let e=d.R.getAllRequestedCaipNetworks(),t=!!e&&e.length>1,o=e?.find(({id:e})=>e===this.network?.id);return t||!o}onViewChange(){let{history:e}=w.RouterController.state,t=es.b.VIEW_DIRECTION.Next;e.length<this.prevHistoryLength&&(t=es.b.VIEW_DIRECTION.Prev),this.prevHistoryLength=e.length,this.viewDirection=t}async onHistoryChange(){let{history:e}=w.RouterController.state,t=this.shadowRoot?.querySelector("#dynamic");e.length>1&&!this.showBack&&t?(await t.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.showBack=!0,t.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"})):e.length<=1&&this.showBack&&t&&(await t.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.showBack=!1,t.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"}))}onGoBack(){w.RouterController.goBack()}};ew.styles=el,ec([(0,i.SB)()],ew.prototype,"heading",void 0),ec([(0,i.SB)()],ew.prototype,"network",void 0),ec([(0,i.SB)()],ew.prototype,"networkImage",void 0),ec([(0,i.SB)()],ew.prototype,"showBack",void 0),ec([(0,i.SB)()],ew.prototype,"prevHistoryLength",void 0),ec([(0,i.SB)()],ew.prototype,"view",void 0),ec([(0,i.SB)()],ew.prototype,"viewDirection",void 0),ew=ec([(0,z.Mo)("w3m-header")],ew),o(32305),o(77672);var eh=(0,L.iv)`
  :host {
    display: flex;
    align-items: center;
    gap: ${({spacing:e})=>e[1]};
    padding: ${({spacing:e})=>e[2]} ${({spacing:e})=>e[3]}
      ${({spacing:e})=>e[2]} ${({spacing:e})=>e[2]};
    border-radius: ${({borderRadius:e})=>e[20]};
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
    box-shadow:
      0px 0px 8px 0px rgba(0, 0, 0, 0.1),
      inset 0 0 0 1px ${({tokens:e})=>e.theme.borderPrimary};
    max-width: 320px;
  }

  wui-icon-box {
    border-radius: ${({borderRadius:e})=>e.round} !important;
    overflow: hidden;
  }

  wui-loading-spinner {
    padding: ${({spacing:e})=>e[1]};
    background-color: ${({tokens:e})=>e.core.foregroundAccent010};
    border-radius: ${({borderRadius:e})=>e.round} !important;
  }
`,em=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let eg=class extends r.oi{constructor(){super(...arguments),this.message="",this.variant="success"}render(){return(0,r.dy)`
      ${this.templateIcon()}
      <wui-text variant="lg-regular" color="primary" data-testid="wui-snackbar-message"
        >${this.message}</wui-text
      >
    `}templateIcon(){return"loading"===this.variant?(0,r.dy)`<wui-loading-spinner size="md" color="accent-primary"></wui-loading-spinner>`:(0,r.dy)`<wui-icon-box
      size="md"
      color=${({success:"success",error:"error",warning:"warning",info:"default"})[this.variant]}
      icon=${({success:"checkmark",error:"warning",warning:"warningCircle",info:"info"})[this.variant]}
    ></wui-icon-box>`}};eg.styles=[F.ET,eh],em([(0,i.Cb)()],eg.prototype,"message",void 0),em([(0,i.Cb)()],eg.prototype,"variant",void 0),eg=em([(0,U.M)("wui-snackbar")],eg);var ey=(0,r.iv)`
  :host {
    display: block;
    position: absolute;
    opacity: 0;
    pointer-events: none;
    top: 11px;
    left: 50%;
    width: max-content;
  }
`,eb=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let ev=class extends r.oi{constructor(){super(),this.unsubscribe=[],this.timeout=void 0,this.open=b.SnackController.state.open,this.unsubscribe.push(b.SnackController.subscribeKey("open",e=>{this.open=e,this.onOpen()}))}disconnectedCallback(){clearTimeout(this.timeout),this.unsubscribe.forEach(e=>e())}render(){let{message:e,variant:t}=b.SnackController.state;return(0,r.dy)` <wui-snackbar message=${e} variant=${t}></wui-snackbar> `}onOpen(){clearTimeout(this.timeout),this.open?(this.animate([{opacity:0,transform:"translateX(-50%) scale(0.85)"},{opacity:1,transform:"translateX(-50%) scale(1)"}],{duration:150,fill:"forwards",easing:"ease"}),this.timeout&&clearTimeout(this.timeout),b.SnackController.state.autoClose&&(this.timeout=setTimeout(()=>b.SnackController.hide(),2500))):this.animate([{opacity:1,transform:"translateX(-50%) scale(1)"},{opacity:0,transform:"translateX(-50%) scale(0.85)"}],{duration:150,fill:"forwards",easing:"ease"})}};ev.styles=ey,eb([(0,i.SB)()],ev.prototype,"open",void 0),ev=eb([(0,z.Mo)("w3m-snackbar")],ev);let ef=(0,f.sj)({message:"",open:!1,triggerRect:{width:0,height:0,top:0,left:0},variant:"shade"}),ek=(0,R.P)({state:ef,subscribe:e=>(0,f.Ld)(ef,()=>e(ef)),subscribeKey:(e,t)=>(0,k.VW)(ef,e,t),showTooltip({message:e,triggerRect:t,variant:o}){ef.open=!0,ef.message=e,ef.triggerRect=t,ef.variant=o},hide(){ef.open=!1,ef.message="",ef.triggerRect={width:0,height:0,top:0,left:0}}});o(39874);var eC=(0,z.iv)`
  :host {
    pointer-events: none;
  }

  :host > wui-flex {
    display: var(--w3m-tooltip-display);
    opacity: var(--w3m-tooltip-opacity);
    padding: 9px ${({spacing:e})=>e["3"]} 10px ${({spacing:e})=>e["3"]};
    border-radius: ${({borderRadius:e})=>e["3"]};
    color: ${({tokens:e})=>e.theme.backgroundPrimary};
    position: absolute;
    top: var(--w3m-tooltip-top);
    left: var(--w3m-tooltip-left);
    transform: translate(calc(-50% + var(--w3m-tooltip-parent-width)), calc(-100% - 8px));
    max-width: calc(var(--apkt-modal-width) - ${({spacing:e})=>e["5"]});
    transition: opacity ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    will-change: opacity;
    opacity: 0;
    animation-duration: ${({durations:e})=>e.xl};
    animation-timing-function: ${({easings:e})=>e["ease-out-power-2"]};
    animation-name: fade-in;
    animation-fill-mode: forwards;
  }

  :host([data-variant='shade']) > wui-flex {
    background-color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  :host([data-variant='shade']) > wui-flex > wui-text {
    color: ${({tokens:e})=>e.theme.textSecondary};
  }

  :host([data-variant='fill']) > wui-flex {
    background-color: ${({tokens:e})=>e.theme.textPrimary};
    border: none;
  }

  wui-icon {
    position: absolute;
    width: 12px !important;
    height: 4px !important;
    color: ${({tokens:e})=>e.theme.foregroundPrimary};
  }

  wui-icon[data-placement='top'] {
    bottom: 0px;
    left: 50%;
    transform: translate(-50%, 95%);
  }

  wui-icon[data-placement='bottom'] {
    top: 0;
    left: 50%;
    transform: translate(-50%, -95%) rotate(180deg);
  }

  wui-icon[data-placement='right'] {
    top: 50%;
    left: 0;
    transform: translate(-65%, -50%) rotate(90deg);
  }

  wui-icon[data-placement='left'] {
    top: 50%;
    right: 0%;
    transform: translate(65%, -50%) rotate(270deg);
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`,ex=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let eT=class extends r.oi{constructor(){super(),this.unsubscribe=[],this.open=ek.state.open,this.message=ek.state.message,this.triggerRect=ek.state.triggerRect,this.variant=ek.state.variant,this.unsubscribe.push(ek.subscribe(e=>{this.open=e.open,this.message=e.message,this.triggerRect=e.triggerRect,this.variant=e.variant}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){this.dataset.variant=this.variant;let e=this.triggerRect.top,t=this.triggerRect.left;return this.style.cssText=`
    --w3m-tooltip-top: ${e}px;
    --w3m-tooltip-left: ${t}px;
    --w3m-tooltip-parent-width: ${this.triggerRect.width/2}px;
    --w3m-tooltip-display: ${this.open?"flex":"none"};
    --w3m-tooltip-opacity: ${this.open?1:0};
    `,(0,r.dy)`<wui-flex>
      <wui-icon data-placement="top" size="inherit" name="cursor"></wui-icon>
      <wui-text color="primary" variant="sm-regular">${this.message}</wui-text>
    </wui-flex>`}};eT.styles=[eC],ex([(0,i.SB)()],eT.prototype,"open",void 0),ex([(0,i.SB)()],eT.prototype,"message",void 0),ex([(0,i.SB)()],eT.prototype,"triggerRect",void 0),ex([(0,i.SB)()],eT.prototype,"variant",void 0),eT=ex([(0,z.Mo)("w3m-tooltip")],eT);let eS={getTabsByNamespace:e=>e&&e===s.b.CHAIN.EVM?l.OptionsController.state.remoteFeatures?.activity===!1?es.b.ACCOUNT_TABS.filter(e=>"Activity"!==e.label):es.b.ACCOUNT_TABS:[],isValidReownName:e=>/^[a-zA-Z0-9]+$/gu.test(e),isValidEmail:e=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/gu.test(e),validateReownName:e=>e.replace(/\^/gu,"").toLowerCase().replace(/[^a-zA-Z0-9]/gu,""),hasFooter(){let e=w.RouterController.state.view;if(es.b.VIEWS_WITH_LEGAL_FOOTER.includes(e)){let{termsConditionsUrl:e,privacyPolicyUrl:t}=l.OptionsController.state,o=l.OptionsController.state.features?.legalCheckbox;return(!!e||!!t)&&!o}return es.b.VIEWS_WITH_DEFAULT_FOOTER.includes(e)}};o(94396);var eA=(0,z.iv)`
  :host wui-ux-by-reown {
    padding-top: 0;
  }

  :host wui-ux-by-reown.branding-only {
    padding-top: ${({spacing:e})=>e["3"]};
  }

  a {
    text-decoration: none;
    color: ${({tokens:e})=>e.core.textAccentPrimary};
    font-weight: 500;
  }
`,eP=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let e$=class extends r.oi{constructor(){super(),this.unsubscribe=[],this.remoteFeatures=l.OptionsController.state.remoteFeatures,this.unsubscribe.push(l.OptionsController.subscribeKey("remoteFeatures",e=>this.remoteFeatures=e))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let{termsConditionsUrl:e,privacyPolicyUrl:t}=l.OptionsController.state,o=l.OptionsController.state.features?.legalCheckbox;return(e||t)&&!o?(0,r.dy)`
      <wui-flex flexDirection="column">
        <wui-flex .padding=${["4","3","3","3"]} justifyContent="center">
          <wui-text color="secondary" variant="md-regular" align="center">
            By connecting your wallet, you agree to our <br />
            ${this.termsTemplate()} ${this.andTemplate()} ${this.privacyTemplate()}
          </wui-text>
        </wui-flex>
        ${this.reownBrandingTemplate()}
      </wui-flex>
    `:(0,r.dy)`
        <wui-flex flexDirection="column"> ${this.reownBrandingTemplate(!0)} </wui-flex>
      `}andTemplate(){let{termsConditionsUrl:e,privacyPolicyUrl:t}=l.OptionsController.state;return e&&t?"and":""}termsTemplate(){let{termsConditionsUrl:e}=l.OptionsController.state;return e?(0,r.dy)`<a href=${e} target="_blank" rel="noopener noreferrer"
      >Terms of Service</a
    >`:null}privacyTemplate(){let{privacyPolicyUrl:e}=l.OptionsController.state;return e?(0,r.dy)`<a href=${e} target="_blank" rel="noopener noreferrer"
      >Privacy Policy</a
    >`:null}reownBrandingTemplate(e=!1){return this.remoteFeatures?.reownBranding?e?(0,r.dy)`<wui-ux-by-reown class="branding-only"></wui-ux-by-reown>`:(0,r.dy)`<wui-ux-by-reown></wui-ux-by-reown>`:null}};e$.styles=[eA],eP([(0,i.SB)()],e$.prototype,"remoteFeatures",void 0),e$=eP([(0,z.Mo)("w3m-legal-footer")],e$),o(25963);var eR=(0,r.iv)``;let eI=class extends r.oi{render(){let{termsConditionsUrl:e,privacyPolicyUrl:t}=l.OptionsController.state;return e||t?(0,r.dy)`
      <wui-flex
        .padding=${["4","3","3","3"]}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="3"
      >
        <wui-text color="secondary" variant="md-regular" align="center">
          We work with the best providers to give you the lowest fees and best support. More options
          coming soon!
        </wui-text>

        ${this.howDoesItWorkTemplate()}
      </wui-flex>
    `:null}howDoesItWorkTemplate(){return(0,r.dy)` <wui-link @click=${this.onWhatIsBuy.bind(this)}>
      <wui-icon size="xs" color="accent-primary" slot="iconLeft" name="helpCircle"></wui-icon>
      How does it work?
    </wui-link>`}onWhatIsBuy(){N.X.sendEvent({type:"track",event:"SELECT_WHAT_IS_A_BUY",properties:{isSmartAccount:(0,S.r9)(d.R.state.activeChain)===x.y_.ACCOUNT_TYPES.SMART_ACCOUNT}}),w.RouterController.push("WhatIsABuy")}};eI.styles=[eR],eI=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n}([(0,z.Mo)("w3m-onramp-providers-footer")],eI);var eE=(0,z.iv)`
  :host {
    display: block;
  }

  div.container {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: hidden;
    height: auto;
    display: block;
  }

  div.container[status='hide'] {
    animation: fade-out;
    animation-duration: var(--apkt-duration-dynamic);
    animation-timing-function: ${({easings:e})=>e["ease-out-power-2"]};
    animation-fill-mode: both;
    animation-delay: 0s;
  }

  div.container[status='show'] {
    animation: fade-in;
    animation-duration: var(--apkt-duration-dynamic);
    animation-timing-function: ${({easings:e})=>e["ease-out-power-2"]};
    animation-fill-mode: both;
    animation-delay: var(--apkt-duration-dynamic);
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      filter: blur(6px);
    }
    to {
      opacity: 1;
      filter: blur(0px);
    }
  }

  @keyframes fade-out {
    from {
      opacity: 1;
      filter: blur(0px);
    }
    to {
      opacity: 0;
      filter: blur(6px);
    }
  }
`,eN=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let eO=class extends r.oi{constructor(){super(...arguments),this.resizeObserver=void 0,this.unsubscribe=[],this.status="hide",this.view=w.RouterController.state.view}firstUpdated(){this.status=eS.hasFooter()?"show":"hide",this.unsubscribe.push(w.RouterController.subscribeKey("view",e=>{this.view=e,this.status=eS.hasFooter()?"show":"hide","hide"===this.status&&document.documentElement.style.setProperty("--apkt-footer-height","0px")})),this.resizeObserver=new ResizeObserver(e=>{for(let t of e)if(t.target===this.getWrapper()){let e=`${t.contentRect.height}px`;document.documentElement.style.setProperty("--apkt-footer-height",e)}}),this.resizeObserver.observe(this.getWrapper())}render(){return(0,r.dy)`
      <div class="container" status=${this.status}>${this.templatePageContainer()}</div>
    `}templatePageContainer(){return eS.hasFooter()?(0,r.dy)` ${this.templateFooter()}`:null}templateFooter(){switch(this.view){case"Networks":return this.templateNetworksFooter();case"Connect":case"ConnectWallets":case"OnRampFiatSelect":case"OnRampTokenSelect":return(0,r.dy)`<w3m-legal-footer></w3m-legal-footer>`;case"OnRampProviders":return(0,r.dy)`<w3m-onramp-providers-footer></w3m-onramp-providers-footer>`;default:return null}}templateNetworksFooter(){return(0,r.dy)` <wui-flex
      class="footer-in"
      padding="3"
      flexDirection="column"
      gap="3"
      alignItems="center"
    >
      <wui-text variant="md-regular" color="secondary" align="center">
        Your connected wallet may not support some of the networks available for this dApp
      </wui-text>
      <wui-link @click=${this.onNetworkHelp.bind(this)}>
        <wui-icon size="sm" color="accent-primary" slot="iconLeft" name="helpCircle"></wui-icon>
        What is a network
      </wui-link>
    </wui-flex>`}onNetworkHelp(){N.X.sendEvent({type:"track",event:"CLICK_NETWORK_HELP"}),w.RouterController.push("WhatIsANetwork")}getWrapper(){return this.shadowRoot?.querySelector("div.container")}};eO.styles=[eE],eN([(0,i.SB)()],eO.prototype,"status",void 0),eN([(0,i.SB)()],eO.prototype,"view",void 0),eO=eN([(0,z.Mo)("w3m-footer")],eO);var eW=(0,z.iv)`
  :host {
    display: block;
    width: inherit;
  }
`,eB=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let eD=class extends r.oi{constructor(){super(),this.unsubscribe=[],this.viewState=w.RouterController.state.view,this.history=w.RouterController.state.history.join(","),this.unsubscribe.push(w.RouterController.subscribeKey("view",()=>{this.history=w.RouterController.state.history.join(","),document.documentElement.style.setProperty("--apkt-duration-dynamic","var(--apkt-durations-lg)")}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),document.documentElement.style.setProperty("--apkt-duration-dynamic","0s")}render(){return(0,r.dy)`${this.templatePageContainer()}`}templatePageContainer(){return(0,r.dy)`<w3m-router-container
      history=${this.history}
      .setView=${()=>{this.viewState=w.RouterController.state.view}}
    >
      ${this.viewTemplate(this.viewState)}
    </w3m-router-container>`}viewTemplate(e){switch(e){case"AccountSettings":return(0,r.dy)`<w3m-account-settings-view></w3m-account-settings-view>`;case"Account":return(0,r.dy)`<w3m-account-view></w3m-account-view>`;case"AllWallets":return(0,r.dy)`<w3m-all-wallets-view></w3m-all-wallets-view>`;case"ApproveTransaction":return(0,r.dy)`<w3m-approve-transaction-view></w3m-approve-transaction-view>`;case"BuyInProgress":return(0,r.dy)`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`;case"ChooseAccountName":return(0,r.dy)`<w3m-choose-account-name-view></w3m-choose-account-name-view>`;case"Connect":default:return(0,r.dy)`<w3m-connect-view></w3m-connect-view>`;case"Create":return(0,r.dy)`<w3m-connect-view walletGuide="explore"></w3m-connect-view>`;case"ConnectingWalletConnect":return(0,r.dy)`<w3m-connecting-wc-view></w3m-connecting-wc-view>`;case"ConnectingWalletConnectBasic":return(0,r.dy)`<w3m-connecting-wc-basic-view></w3m-connecting-wc-basic-view>`;case"ConnectingExternal":return(0,r.dy)`<w3m-connecting-external-view></w3m-connecting-external-view>`;case"ConnectingSiwe":return(0,r.dy)`<w3m-connecting-siwe-view></w3m-connecting-siwe-view>`;case"ConnectWallets":return(0,r.dy)`<w3m-connect-wallets-view></w3m-connect-wallets-view>`;case"ConnectSocials":return(0,r.dy)`<w3m-connect-socials-view></w3m-connect-socials-view>`;case"ConnectingSocial":return(0,r.dy)`<w3m-connecting-social-view></w3m-connecting-social-view>`;case"DataCapture":return(0,r.dy)`<w3m-data-capture-view></w3m-data-capture-view>`;case"DataCaptureOtpConfirm":return(0,r.dy)`<w3m-data-capture-otp-confirm-view></w3m-data-capture-otp-confirm-view>`;case"Downloads":return(0,r.dy)`<w3m-downloads-view></w3m-downloads-view>`;case"EmailLogin":return(0,r.dy)`<w3m-email-login-view></w3m-email-login-view>`;case"EmailVerifyOtp":return(0,r.dy)`<w3m-email-verify-otp-view></w3m-email-verify-otp-view>`;case"EmailVerifyDevice":return(0,r.dy)`<w3m-email-verify-device-view></w3m-email-verify-device-view>`;case"GetWallet":return(0,r.dy)`<w3m-get-wallet-view></w3m-get-wallet-view>`;case"Networks":return(0,r.dy)`<w3m-networks-view></w3m-networks-view>`;case"SwitchNetwork":return(0,r.dy)`<w3m-network-switch-view></w3m-network-switch-view>`;case"ProfileWallets":return(0,r.dy)`<w3m-profile-wallets-view></w3m-profile-wallets-view>`;case"Transactions":return(0,r.dy)`<w3m-transactions-view></w3m-transactions-view>`;case"OnRampProviders":return(0,r.dy)`<w3m-onramp-providers-view></w3m-onramp-providers-view>`;case"OnRampTokenSelect":return(0,r.dy)`<w3m-onramp-token-select-view></w3m-onramp-token-select-view>`;case"OnRampFiatSelect":return(0,r.dy)`<w3m-onramp-fiat-select-view></w3m-onramp-fiat-select-view>`;case"UpgradeEmailWallet":return(0,r.dy)`<w3m-upgrade-wallet-view></w3m-upgrade-wallet-view>`;case"UpdateEmailWallet":return(0,r.dy)`<w3m-update-email-wallet-view></w3m-update-email-wallet-view>`;case"UpdateEmailPrimaryOtp":return(0,r.dy)`<w3m-update-email-primary-otp-view></w3m-update-email-primary-otp-view>`;case"UpdateEmailSecondaryOtp":return(0,r.dy)`<w3m-update-email-secondary-otp-view></w3m-update-email-secondary-otp-view>`;case"UnsupportedChain":return(0,r.dy)`<w3m-unsupported-chain-view></w3m-unsupported-chain-view>`;case"Swap":return(0,r.dy)`<w3m-swap-view></w3m-swap-view>`;case"SwapSelectToken":return(0,r.dy)`<w3m-swap-select-token-view></w3m-swap-select-token-view>`;case"SwapPreview":return(0,r.dy)`<w3m-swap-preview-view></w3m-swap-preview-view>`;case"WalletSend":return(0,r.dy)`<w3m-wallet-send-view></w3m-wallet-send-view>`;case"WalletSendSelectToken":return(0,r.dy)`<w3m-wallet-send-select-token-view></w3m-wallet-send-select-token-view>`;case"WalletSendPreview":return(0,r.dy)`<w3m-wallet-send-preview-view></w3m-wallet-send-preview-view>`;case"WalletSendConfirmed":return(0,r.dy)`<w3m-send-confirmed-view></w3m-send-confirmed-view>`;case"WhatIsABuy":return(0,r.dy)`<w3m-what-is-a-buy-view></w3m-what-is-a-buy-view>`;case"WalletReceive":return(0,r.dy)`<w3m-wallet-receive-view></w3m-wallet-receive-view>`;case"WalletCompatibleNetworks":return(0,r.dy)`<w3m-wallet-compatible-networks-view></w3m-wallet-compatible-networks-view>`;case"WhatIsAWallet":return(0,r.dy)`<w3m-what-is-a-wallet-view></w3m-what-is-a-wallet-view>`;case"ConnectingMultiChain":return(0,r.dy)`<w3m-connecting-multi-chain-view></w3m-connecting-multi-chain-view>`;case"WhatIsANetwork":return(0,r.dy)`<w3m-what-is-a-network-view></w3m-what-is-a-network-view>`;case"ConnectingFarcaster":return(0,r.dy)`<w3m-connecting-farcaster-view></w3m-connecting-farcaster-view>`;case"SwitchActiveChain":return(0,r.dy)`<w3m-switch-active-chain-view></w3m-switch-active-chain-view>`;case"RegisterAccountName":return(0,r.dy)`<w3m-register-account-name-view></w3m-register-account-name-view>`;case"RegisterAccountNameSuccess":return(0,r.dy)`<w3m-register-account-name-success-view></w3m-register-account-name-success-view>`;case"SmartSessionCreated":return(0,r.dy)`<w3m-smart-session-created-view></w3m-smart-session-created-view>`;case"SmartSessionList":return(0,r.dy)`<w3m-smart-session-list-view></w3m-smart-session-list-view>`;case"SIWXSignMessage":return(0,r.dy)`<w3m-siwx-sign-message-view></w3m-siwx-sign-message-view>`;case"Pay":return(0,r.dy)`<w3m-pay-view></w3m-pay-view>`;case"PayLoading":return(0,r.dy)`<w3m-pay-loading-view></w3m-pay-loading-view>`;case"FundWallet":return(0,r.dy)`<w3m-fund-wallet-view></w3m-fund-wallet-view>`;case"PayWithExchange":return(0,r.dy)`<w3m-deposit-from-exchange-view></w3m-deposit-from-exchange-view>`;case"PayWithExchangeSelectAsset":return(0,r.dy)`<w3m-deposit-from-exchange-select-asset-view></w3m-deposit-from-exchange-select-asset-view>`}}};eD.styles=[eW],eB([(0,i.SB)()],eD.prototype,"viewState",void 0),eB([(0,i.SB)()],eD.prototype,"history",void 0),eD=eB([(0,z.Mo)("w3m-router")],eD);var ez=(0,z.iv)`
  :host {
    z-index: ${({tokens:e})=>e.core.zIndex};
    display: block;
    backface-visibility: hidden;
    will-change: opacity;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    opacity: 0;
    background-color: ${({tokens:e})=>e.theme.overlay};
    backdrop-filter: blur(0px);
    transition:
      opacity ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      backdrop-filter ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]};
    will-change: opacity;
  }

  :host(.open) {
    opacity: 1;
    backdrop-filter: blur(8px);
  }

  :host(.appkit-modal) {
    position: relative;
    pointer-events: unset;
    background: none;
    width: 100%;
    opacity: 1;
  }

  wui-card {
    max-width: var(--apkt-modal-width);
    width: 100%;
    position: relative;
    outline: none;
    transform: translateY(4px);
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.05);
    transition:
      transform ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-2"]},
      border-radius ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-1"]},
      background-color ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-1"]},
      box-shadow ${({durations:e})=>e.lg}
        ${({easings:e})=>e["ease-out-power-1"]};
    will-change: border-radius, background-color, transform, box-shadow;
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    padding: var(--local-modal-padding);
    box-sizing: border-box;
  }

  :host(.open) wui-card {
    transform: translateY(0px);
  }

  wui-card::before {
    z-index: 1;
    pointer-events: none;
    content: '';
    position: absolute;
    inset: 0;
    border-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
    transition: box-shadow ${({durations:e})=>e.lg}
      ${({easings:e})=>e["ease-out-power-2"]};
    transition-delay: ${({durations:e})=>e.md};
    will-change: box-shadow;
  }

  :host([data-mobile-fullscreen='true']) wui-card::before {
    border-radius: 0px;
  }

  :host([data-border='true']) wui-card::before {
    box-shadow: inset 0px 0px 0px 4px ${({tokens:e})=>e.theme.foregroundSecondary};
  }

  :host([data-border='false']) wui-card::before {
    box-shadow: inset 0px 0px 0px 1px ${({tokens:e})=>e.theme.borderPrimaryDark};
  }

  :host([data-border='true']) wui-card {
    animation:
      fade-in ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      card-background-border var(--apkt-duration-dynamic)
        ${({easings:e})=>e["ease-out-power-2"]};
    animation-fill-mode: backwards, both;
    animation-delay: var(--apkt-duration-dynamic);
  }

  :host([data-border='false']) wui-card {
    animation:
      fade-in ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      card-background-default var(--apkt-duration-dynamic)
        ${({easings:e})=>e["ease-out-power-2"]};
    animation-fill-mode: backwards, both;
    animation-delay: 0s;
  }

  :host(.appkit-modal) wui-card {
    max-width: var(--apkt-modal-width);
  }

  wui-card[shake='true'] {
    animation:
      fade-in ${({durations:e})=>e.lg} ${({easings:e})=>e["ease-out-power-2"]},
      w3m-shake ${({durations:e})=>e.xl}
        ${({easings:e})=>e["ease-out-power-2"]};
  }

  wui-flex {
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  @media (max-height: 700px) and (min-width: 431px) {
    wui-flex {
      align-items: flex-start;
    }

    wui-card {
      margin: var(--apkt-spacing-6) 0px;
    }
  }

  @media (max-width: 430px) {
    :host([data-mobile-fullscreen='true']) {
      height: 100dvh;
    }
    :host([data-mobile-fullscreen='true']) wui-flex {
      align-items: stretch;
    }
    :host([data-mobile-fullscreen='true']) wui-card {
      max-width: 100%;
      height: 100%;
      border-radius: 0;
      border: none;
    }
    :host(:not([data-mobile-fullscreen='true'])) wui-flex {
      align-items: flex-end;
    }

    :host(:not([data-mobile-fullscreen='true'])) wui-card {
      max-width: 100%;
      border-bottom: none;
    }

    :host(:not([data-mobile-fullscreen='true'])) wui-card[data-embedded='true'] {
      border-bottom-left-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
      border-bottom-right-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
    }

    :host(:not([data-mobile-fullscreen='true'])) wui-card:not([data-embedded='true']) {
      border-bottom-left-radius: 0px;
      border-bottom-right-radius: 0px;
    }

    wui-card[shake='true'] {
      animation: w3m-shake 0.5s ${({easings:e})=>e["ease-out-power-2"]};
    }
  }

  @keyframes fade-in {
    0% {
      transform: scale(0.99) translateY(4px);
    }
    100% {
      transform: scale(1) translateY(0);
    }
  }

  @keyframes w3m-shake {
    0% {
      transform: scale(1) rotate(0deg);
    }
    20% {
      transform: scale(1) rotate(-1deg);
    }
    40% {
      transform: scale(1) rotate(1.5deg);
    }
    60% {
      transform: scale(1) rotate(-1.5deg);
    }
    80% {
      transform: scale(1) rotate(1deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
    }
  }

  @keyframes card-background-border {
    from {
      background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    }
    to {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
  }

  @keyframes card-background-default {
    from {
      background-color: ${({tokens:e})=>e.theme.foregroundSecondary};
    }
    to {
      background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    }
  }
`,eF=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let eU="scroll-lock",eL={PayWithExchange:"0",PayWithExchangeSelectAsset:"0"};class ej extends r.oi{constructor(){super(),this.unsubscribe=[],this.abortController=void 0,this.hasPrefetched=!1,this.enableEmbedded=l.OptionsController.state.enableEmbedded,this.open=c.I.state.open,this.caipAddress=d.R.state.activeCaipAddress,this.caipNetwork=d.R.state.activeCaipNetwork,this.shake=c.I.state.shake,this.filterByNamespace=u.ConnectorController.state.filterByNamespace,this.padding=z.gR.spacing[1],this.mobileFullScreen=l.OptionsController.state.enableMobileFullScreen,this.initializeTheming(),p.ApiController.prefetchAnalyticsConfig(),this.unsubscribe.push(c.I.subscribeKey("open",e=>e?this.onOpen():this.onClose()),c.I.subscribeKey("shake",e=>this.shake=e),d.R.subscribeKey("activeCaipNetwork",e=>this.onNewNetwork(e)),d.R.subscribeKey("activeCaipAddress",e=>this.onNewAddress(e)),l.OptionsController.subscribeKey("enableEmbedded",e=>this.enableEmbedded=e),u.ConnectorController.subscribeKey("filterByNamespace",e=>{this.filterByNamespace===e||d.R.getAccountData(e)?.caipAddress||(p.ApiController.fetchRecommendedWallets(),this.filterByNamespace=e)}),w.RouterController.subscribeKey("view",()=>{this.dataset.border=eS.hasFooter()?"true":"false",this.padding=eL[w.RouterController.state.view]??z.gR.spacing[1]}))}firstUpdated(){if(this.dataset.border=eS.hasFooter()?"true":"false",this.mobileFullScreen&&this.setAttribute("data-mobile-fullscreen","true"),this.caipAddress){if(this.enableEmbedded){c.I.close(),this.prefetch();return}this.onNewAddress(this.caipAddress)}this.open&&this.onOpen(),this.enableEmbedded&&this.prefetch()}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),this.onRemoveKeyboardListener()}render(){return(this.style.setProperty("--local-modal-padding",this.padding),this.enableEmbedded)?(0,r.dy)`${this.contentTemplate()}
        <w3m-tooltip></w3m-tooltip> `:this.open?(0,r.dy)`
          <wui-flex @click=${this.onOverlayClick.bind(this)} data-testid="w3m-modal-overlay">
            ${this.contentTemplate()}
          </wui-flex>
          <w3m-tooltip></w3m-tooltip>
        `:null}contentTemplate(){return(0,r.dy)` <wui-card
      shake="${this.shake}"
      data-embedded="${(0,a.o)(this.enableEmbedded)}"
      role="alertdialog"
      aria-modal="true"
      tabindex="0"
      data-testid="w3m-modal-card"
    >
      <w3m-header></w3m-header>
      <w3m-router></w3m-router>
      <w3m-footer></w3m-footer>
      <w3m-snackbar></w3m-snackbar>
      <w3m-alertbar></w3m-alertbar>
    </wui-card>`}async onOverlayClick(e){e.target!==e.currentTarget||this.mobileFullScreen||await this.handleClose()}async handleClose(){await g.safeClose()}initializeTheming(){let{themeVariables:e,themeMode:t}=y.ThemeController.state,o=z.Hg.getColorTheme(t);(0,z.n)(e,o)}onClose(){this.open=!1,this.classList.remove("open"),this.onScrollUnlock(),b.SnackController.hide(),this.onRemoveKeyboardListener()}onOpen(){this.open=!0,this.classList.add("open"),this.onScrollLock(),this.onAddKeyboardListener()}onScrollLock(){let e=document.createElement("style");e.dataset.w3m=eU,e.textContent=`
      body {
        touch-action: none;
        overflow: hidden;
        overscroll-behavior: contain;
      }
      w3m-modal {
        pointer-events: auto;
      }
    `,document.head.appendChild(e)}onScrollUnlock(){let e=document.head.querySelector(`style[data-w3m="${eU}"]`);e&&e.remove()}onAddKeyboardListener(){this.abortController=new AbortController;let e=this.shadowRoot?.querySelector("wui-card");e?.focus(),window.addEventListener("keydown",t=>{if("Escape"===t.key)this.handleClose();else if("Tab"===t.key){let{tagName:o}=t.target;!o||o.includes("W3M-")||o.includes("WUI-")||e?.focus()}},this.abortController)}onRemoveKeyboardListener(){this.abortController?.abort(),this.abortController=void 0}async onNewAddress(e){let t=d.R.state.isSwitchingNamespace,o="ProfileWallets"===w.RouterController.state.view;e?await this.onConnected({caipAddress:e,isSwitchingNamespace:t,isInProfileView:o}):t||this.enableEmbedded||o||c.I.close(),await m.w.initializeIfEnabled(e),this.caipAddress=e,d.R.setIsSwitchingNamespace(!1)}async onConnected(e){if(e.isInProfileView)return;let{chainNamespace:t,chainId:o,address:r}=n.u.parseCaipAddress(e.caipAddress),i=`${t}:${o}`,a=!v.j.getPlainAddress(this.caipAddress),s=await m.w.getSessions({address:r,caipNetworkId:i}),l=!m.w.getSIWX()||s.some(e=>e.data.accountAddress===r),d=e.isSwitchingNamespace&&l&&!this.enableEmbedded,u=this.enableEmbedded&&a;d?w.RouterController.goBack():u&&c.I.close()}onNewNetwork(e){let t=this.caipNetwork,o=t?.caipNetworkId?.toString(),r=t?.chainNamespace,i=e?.caipNetworkId?.toString(),a=e?.chainNamespace,n=o!==i,l=t?.name===s.b.UNSUPPORTED_NETWORK_NAME,u="ConnectingExternal"===w.RouterController.state.view,p="ProfileWallets"===w.RouterController.state.view,h=!d.R.getAccountData(e?.chainNamespace)?.caipAddress,m="UnsupportedChain"===w.RouterController.state.view,g=c.I.state.open,y=!1;this.enableEmbedded&&"SwitchNetwork"===w.RouterController.state.view&&(y=!0),n&&D.resetState(),!g||u||p||(h?n&&(y=!0):m?y=!0:!n||r!==a||l||(y=!0)),y&&"SIWXSignMessage"!==w.RouterController.state.view&&w.RouterController.goBack(),this.caipNetwork=e}prefetch(){this.hasPrefetched||(p.ApiController.prefetch(),p.ApiController.fetchWalletsByPage({page:1}),this.hasPrefetched=!0)}}ej.styles=ez,eF([(0,i.Cb)({type:Boolean})],ej.prototype,"enableEmbedded",void 0),eF([(0,i.SB)()],ej.prototype,"open",void 0),eF([(0,i.SB)()],ej.prototype,"caipAddress",void 0),eF([(0,i.SB)()],ej.prototype,"caipNetwork",void 0),eF([(0,i.SB)()],ej.prototype,"shake",void 0),eF([(0,i.SB)()],ej.prototype,"filterByNamespace",void 0),eF([(0,i.SB)()],ej.prototype,"padding",void 0),eF([(0,i.SB)()],ej.prototype,"mobileFullScreen",void 0);let eM=class extends ej{};eM=eF([(0,z.Mo)("w3m-modal")],eM);let eH=class extends ej{};eH=eF([(0,z.Mo)("appkit-modal")],eH),o(94188);var e_=(0,z.iv)`
  :host {
    width: 100%;
  }
`,eV=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let eK=class extends r.oi{constructor(){super(...arguments),this.hasImpressionSent=!1,this.walletImages=[],this.imageSrc="",this.name="",this.size="md",this.tabIdx=void 0,this.disabled=!1,this.showAllWallets=!1,this.loading=!1,this.loadingSpinnerColor="accent-100",this.rdnsId="",this.displayIndex=void 0,this.walletRank=void 0}connectedCallback(){super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback(),this.cleanupIntersectionObserver()}updated(e){super.updated(e),(e.has("name")||e.has("imageSrc")||e.has("walletRank"))&&(this.hasImpressionSent=!1),e.has("walletRank")&&this.walletRank&&!this.intersectionObserver&&this.setupIntersectionObserver()}setupIntersectionObserver(){this.intersectionObserver=new IntersectionObserver(e=>{e.forEach(e=>{!e.isIntersecting||this.loading||this.hasImpressionSent||this.sendImpressionEvent()})},{threshold:.1}),this.intersectionObserver.observe(this)}cleanupIntersectionObserver(){this.intersectionObserver&&(this.intersectionObserver.disconnect(),this.intersectionObserver=void 0)}sendImpressionEvent(){this.name&&!this.hasImpressionSent&&this.walletRank&&(this.hasImpressionSent=!0,(this.rdnsId||this.name)&&N.X.sendWalletImpressionEvent({name:this.name,walletRank:this.walletRank,rdnsId:this.rdnsId,view:w.RouterController.state.view,displayIndex:this.displayIndex}))}render(){return(0,r.dy)`
      <wui-list-wallet
        .walletImages=${this.walletImages}
        imageSrc=${(0,a.o)(this.imageSrc)}
        name=${this.name}
        size=${(0,a.o)(this.size)}
        tagLabel=${(0,a.o)(this.tagLabel)}
        .tagVariant=${this.tagVariant}
        .walletIcon=${this.walletIcon}
        .tabIdx=${this.tabIdx}
        .disabled=${this.disabled}
        .showAllWallets=${this.showAllWallets}
        .loading=${this.loading}
        loadingSpinnerColor=${this.loadingSpinnerColor}
      ></wui-list-wallet>
    `}};eK.styles=e_,eV([(0,i.Cb)({type:Array})],eK.prototype,"walletImages",void 0),eV([(0,i.Cb)()],eK.prototype,"imageSrc",void 0),eV([(0,i.Cb)()],eK.prototype,"name",void 0),eV([(0,i.Cb)()],eK.prototype,"size",void 0),eV([(0,i.Cb)()],eK.prototype,"tagLabel",void 0),eV([(0,i.Cb)()],eK.prototype,"tagVariant",void 0),eV([(0,i.Cb)()],eK.prototype,"walletIcon",void 0),eV([(0,i.Cb)()],eK.prototype,"tabIdx",void 0),eV([(0,i.Cb)({type:Boolean})],eK.prototype,"disabled",void 0),eV([(0,i.Cb)({type:Boolean})],eK.prototype,"showAllWallets",void 0),eV([(0,i.Cb)({type:Boolean})],eK.prototype,"loading",void 0),eV([(0,i.Cb)({type:String})],eK.prototype,"loadingSpinnerColor",void 0),eV([(0,i.Cb)()],eK.prototype,"rdnsId",void 0),eV([(0,i.Cb)()],eK.prototype,"displayIndex",void 0),eV([(0,i.Cb)()],eK.prototype,"walletRank",void 0),eK=eV([(0,z.Mo)("w3m-list-wallet")],eK);var eX=(0,z.iv)`
  :host {
    --local-duration-height: 0s;
    --local-duration: ${({durations:e})=>e.lg};
    --local-transition: ${({easings:e})=>e["ease-out-power-2"]};
  }

  .container {
    display: block;
    overflow: hidden;
    overflow: hidden;
    position: relative;
    height: var(--local-container-height);
    transition: height var(--local-duration-height) var(--local-transition);
    will-change: height, padding-bottom;
  }

  .container[data-mobile-fullscreen='true'] {
    overflow: scroll;
  }

  .page {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: auto;
    width: inherit;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    background-color: ${({tokens:e})=>e.theme.backgroundPrimary};
    border-bottom-left-radius: var(--local-border-bottom-radius);
    border-bottom-right-radius: var(--local-border-bottom-radius);
    transition: border-bottom-left-radius var(--local-duration) var(--local-transition);
  }

  .page[data-mobile-fullscreen='true'] {
    height: 100%;
  }

  .page-content {
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  .footer {
    height: var(--apkt-footer-height);
  }

  div.page[view-direction^='prev-'] .page-content {
    animation:
      slide-left-out var(--local-duration) forwards var(--local-transition),
      slide-left-in var(--local-duration) forwards var(--local-transition);
    animation-delay: 0ms, var(--local-duration, ${({durations:e})=>e.lg});
  }

  div.page[view-direction^='next-'] .page-content {
    animation:
      slide-right-out var(--local-duration) forwards var(--local-transition),
      slide-right-in var(--local-duration) forwards var(--local-transition);
    animation-delay: 0ms, var(--local-duration, ${({durations:e})=>e.lg});
  }

  @keyframes slide-left-out {
    from {
      transform: translateX(0px) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
    to {
      transform: translateX(8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
  }

  @keyframes slide-left-in {
    from {
      transform: translateX(-8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
    to {
      transform: translateX(0) translateY(0) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
  }

  @keyframes slide-right-out {
    from {
      transform: translateX(0px) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
    to {
      transform: translateX(-8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
  }

  @keyframes slide-right-in {
    from {
      transform: translateX(8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
    to {
      transform: translateX(0) translateY(0) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
  }
`,eG=function(e,t,o,r){var i,a=arguments.length,n=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,o):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,o,r);else for(var s=e.length-1;s>=0;s--)(i=e[s])&&(n=(a<3?i(n):a>3?i(t,o,n):i(t,o))||n);return a>3&&n&&Object.defineProperty(t,o,n),n};let eY=class extends r.oi{constructor(){super(...arguments),this.resizeObserver=void 0,this.transitionDuration="0.15s",this.transitionFunction="",this.history="",this.view="",this.setView=void 0,this.viewDirection="",this.historyState="",this.previousHeight="0px",this.mobileFullScreen=l.OptionsController.state.enableMobileFullScreen,this.onViewportResize=()=>{this.updateContainerHeight()}}updated(e){if(e.has("history")){let e=this.history;""!==this.historyState&&this.historyState!==e&&this.onViewChange(e)}e.has("transitionDuration")&&this.style.setProperty("--local-duration",this.transitionDuration),e.has("transitionFunction")&&this.style.setProperty("--local-transition",this.transitionFunction)}firstUpdated(){this.transitionFunction&&this.style.setProperty("--local-transition",this.transitionFunction),this.style.setProperty("--local-duration",this.transitionDuration),this.historyState=this.history,this.resizeObserver=new ResizeObserver(e=>{for(let t of e)if(t.target===this.getWrapper()){let e=t.contentRect.height,o=parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--apkt-footer-height")||"0");this.mobileFullScreen?(e=(window.visualViewport?.height||window.innerHeight)-this.getHeaderHeight()-o,this.style.setProperty("--local-border-bottom-radius","0px")):(e+=o,this.style.setProperty("--local-border-bottom-radius",o?"var(--apkt-borderRadius-5)":"0px")),this.style.setProperty("--local-container-height",`${e}px`),"0px"!==this.previousHeight&&this.style.setProperty("--local-duration-height",this.transitionDuration),this.previousHeight=`${e}px`}}),this.resizeObserver.observe(this.getWrapper()),this.updateContainerHeight(),window.addEventListener("resize",this.onViewportResize),window.visualViewport?.addEventListener("resize",this.onViewportResize)}disconnectedCallback(){let e=this.getWrapper();e&&this.resizeObserver&&this.resizeObserver.unobserve(e),window.removeEventListener("resize",this.onViewportResize),window.visualViewport?.removeEventListener("resize",this.onViewportResize)}render(){return(0,r.dy)`
      <div class="container" data-mobile-fullscreen="${(0,a.o)(this.mobileFullScreen)}">
        <div
          class="page"
          data-mobile-fullscreen="${(0,a.o)(this.mobileFullScreen)}"
          view-direction="${this.viewDirection}"
        >
          <div class="page-content">
            <slot></slot>
          </div>
        </div>
      </div>
    `}onViewChange(e){let t=e.split(",").filter(Boolean),o=this.historyState.split(",").filter(Boolean),r=o.length,i=t.length,a=t[t.length-1]||"",n=z.Hg.cssDurationToNumber(this.transitionDuration),s="";i>r?s="next":i<r?s="prev":i===r&&t[i-1]!==o[r-1]&&(s="next"),this.viewDirection=`${s}-${a}`,setTimeout(()=>{this.historyState=e,this.setView?.(a)},n),setTimeout(()=>{this.viewDirection=""},2*n)}getWrapper(){return this.shadowRoot?.querySelector("div.page")}updateContainerHeight(){let e=this.getWrapper();if(!e)return;let t=parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--apkt-footer-height")||"0"),o=0;this.mobileFullScreen?(o=(window.visualViewport?.height||window.innerHeight)-this.getHeaderHeight()-t,this.style.setProperty("--local-border-bottom-radius","0px")):(o=e.getBoundingClientRect().height+t,this.style.setProperty("--local-border-bottom-radius",t?"var(--apkt-borderRadius-5)":"0px")),this.style.setProperty("--local-container-height",`${o}px`),"0px"!==this.previousHeight&&this.style.setProperty("--local-duration-height",this.transitionDuration),this.previousHeight=`${o}px`}getHeaderHeight(){return 60}};eY.styles=[eX],eG([(0,i.Cb)({type:String})],eY.prototype,"transitionDuration",void 0),eG([(0,i.Cb)({type:String})],eY.prototype,"transitionFunction",void 0),eG([(0,i.Cb)({type:String})],eY.prototype,"history",void 0),eG([(0,i.Cb)({type:String})],eY.prototype,"view",void 0),eG([(0,i.Cb)({attribute:!1})],eY.prototype,"setView",void 0),eG([(0,i.SB)()],eY.prototype,"viewDirection",void 0),eG([(0,i.SB)()],eY.prototype,"historyState",void 0),eG([(0,i.SB)()],eY.prototype,"previousHeight",void 0),eG([(0,i.SB)()],eY.prototype,"mobileFullScreen",void 0),eY=eG([(0,z.Mo)("w3m-router-container")],eY)}}]);