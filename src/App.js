import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect, isconnected } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import $ from "jquery";



const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

function App() {

  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(``);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;

    if (mintAmount > 1) {
      cost = 3000000000000000;
    }

    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Have some patience...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `You got it!!!`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 10) {
      newMintAmount = 10;
    }
    setMintAmount(newMintAmount);
  };


  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  const connected = () => {
    document.getElementById("connectbtn").style.display = "none";
    document.getElementById("connect-phone").style.display = "none";
  };

  const changeText = () => {
    document.getElementById("text1").style.display = "none";
    document.getElementById("text2").style.display = "block";
  };

  const changeText2 = () => {
    document.getElementById("text2").style.display = "none";
    document.getElementById("text1").style.display = "block";
  };


  return (
    <div>
      <div className="home">

        {/*Socials*/}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row-reverse', position: 'absolute', zIndex: '1031' }}>
          <a href="https://twitter.com/DeadApe_YC" target="_blank">
            <img id="twitter" className="icon" style={{ width: '80px', marginRight: '10px', marginTop: '15px', cursor: 'pointer', zIndex: '1031' }} src="/config/images/twitterp.png"></img>
          </a>
          <a href="" target="_blank">
            <img id="opensea" className="icon" style={{ width: '73px', marginRight: '1px', marginTop: '16px', cursor: 'pointer', zIndex: '1031' }} src="/config/images/opensea.png"></img>
          </a>
        </div>

        <div id="connectbtn" style={{}}
          onClick={(e) => {
            e.preventDefault();
            dispatch(connect());
            getData();
            connected();
          }}
        >
          CONNECT
        </div>



        <img id="background" src="/config/images/apebg.png" style={{ width: '100%', height: '100%' }}/>


        <div id="text1" onClick={changeText} style={{position: 'absolute', width: '51%', lineHeight: '45px', cursor: 'pointer'}}>
          <p id="text-1p" style={{fontFamily: "'sugar', cursive", color: 'black'}}>Deep in the Otherside lives a cemetery where apes go to lay their final rest. All the most legendary 
            Bored Apes have been buried here but legend has it they walk the metaverse when the sun goes down. <br></br><br></br>
            They are not zombies, nor mutants, but the dead ripped of their fur and stripped down to their bones. 
            They appear dead but they are oh so alive, convening deep in their Dead Ape swamp.......</p>
        </div>

        <div id="text2" onClick={changeText2} style={{display: 'none', position: 'absolute', width: '51%', lineHeight: '45px', cursor: 'pointer'}}>
          <p id="text-2p" style={{fontFamily: "'sugar', cursive", color: 'black'}}>The month is October 
            and the seasons have changed, the wind has chilled, the Dead Apes are thrilled. 
            Make sure you eat before you are meat because the Dead Apes don't compete.<br></br><br></br>120+ traits created for the 
            community and lead by the community. Founded by 3 friends, one MAYC holder.</p>
        </div>


        {/*Mint Section*/}
        <div className="mint">
          {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
            <>
              <div
                className="soldout" style={{ fontFamily: "'help', cursive", color: 'black'}}
              >
                PATIENCEE!
              </div>
              <s.SpacerSmall />
            </>
          ) : (
            <>
              <s.SpacerXSmall />
              <s.SpacerSmall />
              {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                <s.Container ai={"center"} jc={"center"}>
                  <s.SpacerSmall />

                  {blockchain.errorMsg !== "" ? (
                    <>
                      <s.SpacerSmall />
                    </>
                  ) : null}
                </s.Container>
              ) : (
                <>
                  <div onLoad={connected()}></div>
                  <s.SpacerMedium />
                  <s.Container ai={"center"} jc={"center"} fd={"row"}>
                    <btn id="roundbtn" className="round-button"
                      style={{ fontFamily: "'help', cursive", color: 'black', cursor: 'pointer' }}
                      disabled={claimingNft ? 1 : 0}
                      onClick={(e) => {
                        e.preventDefault();
                        decrementMintAmount();
                      }}
                    >
                      -
                    </btn>
                    <s.SpacerMedium />
                    <s.TextDescription id="mint-amount"
                      style={{
                        textAlign: "center",
                        color: 'black', fontFamily: "'help', cursive"
                      }}
                    >
                      {mintAmount}
                    </s.TextDescription>
                    <s.SpacerMedium />
                    <btn className="round-button"
                      style={{ fontFamily: "'help', cursive", color: 'black', cursor: 'pointer' }}
                      disabled={claimingNft ? 1 : 0}
                      onClick={(e) => {
                        e.preventDefault();
                        incrementMintAmount();
                      }}
                    >
                      +
                    </btn>
                  </s.Container>
                  <s.Container ai={"center"} jc={"center"} fd={"row"}>
                    <div className="mintbtn" style={{ fontFamily: "'help', cursive", color: 'black', fontSize: '2em', cursor: 'pointer', marginTop: '2px', marginLeft: '8px' }}
                      disabled={claimingNft ? 1 : 0}
                      onClick={(e) => {
                        e.preventDefault();
                        claimNFTs();
                        getData();
                      }}
                    >
                      MINT HERE SER
                    </div>
                  </s.Container>
                </>
              )}
            </>
          )}
        </div>
      </div>






      <Phone>
      <div id="connect-phone" style={{}}
          onClick={(e) => {
            e.preventDefault();
            dispatch(connect());
            getData();
            connected();
          }}
        >
          CONNECT
        </div>

         {/*Mint Section*/}
         <div className="mint-phone">
          {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
            <>
              <div
                className="soldout-phone" style={{ fontFamily: "'help', cursive", color: 'black'}}
              >
                PATIENCEE!
              </div>
              <s.SpacerSmall />
            </>
          ) : (
            <>
              <s.SpacerXSmall />
              <s.SpacerSmall />
              {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                <s.Container ai={"center"} jc={"center"}>
                  <s.SpacerSmall />

                  {blockchain.errorMsg !== "" ? (
                    <>
                      <s.SpacerSmall />
                    </>
                  ) : null}
                </s.Container>
              ) : (
                <>
                  <div onLoad={connected()}></div>
                  <s.SpacerMedium />
                  <s.Container ai={"center"} jc={"center"} fd={"row"}>
                    <btn id="roundbtn" className="round-button"
                      style={{ fontFamily: "'help', cursive", color: 'black', cursor: 'pointer' }}
                      disabled={claimingNft ? 1 : 0}
                      onClick={(e) => {
                        e.preventDefault();
                        decrementMintAmount();
                      }}
                    >
                      -
                    </btn>
                    <s.SpacerMedium />
                    <s.TextDescription id="mint-amount"
                      style={{
                        textAlign: "center",
                        color: 'black', fontFamily: "'help', cursive"
                      }}
                    >
                      {mintAmount}
                    </s.TextDescription>
                    <s.SpacerMedium />
                    <btn className="round-button"
                      style={{ fontFamily: "'help', cursive", color: 'black', cursor: 'pointer' }}
                      disabled={claimingNft ? 1 : 0}
                      onClick={(e) => {
                        e.preventDefault();
                        incrementMintAmount();
                      }}
                    >
                      +
                    </btn>
                  </s.Container>
                  <s.Container ai={"center"} jc={"center"} fd={"row"}>
                    <div className="mintbtn" style={{ fontFamily: "'help', cursive", color: 'black', fontSize: '2em', cursor: 'pointer', marginTop: '2px', marginLeft: '8px' }}
                      disabled={claimingNft ? 1 : 0}
                      onClick={(e) => {
                        e.preventDefault();
                        claimNFTs();
                        getData();
                      }}
                    >
                      MINT HERE SER
                    </div>
                  </s.Container>
                </>
              )}
            </>
          )}
        </div>
      </Phone>
    </div>
  );
}


export const Phone = styled.div`
display: flex; 
flex-direction: column; 
justify-self: center; 
align-items: center; 
height: 100vh;
minWidth: 100%;
background-image: url("/config/images/apebg.png");
background-position: 50%; 
background-repeat: no-repeat;
background-size: cover; 
text-align: center; 
@media (orientation: landscape) {
  display: none;
}
`;

export default App;
