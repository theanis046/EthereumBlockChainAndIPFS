import React, { Component } from 'react';
import web3 from './web3';
import ipfs from './ipfs';
import storehash from './storehash';
import { Button } from 'reactstrap';

class App extends Component {

  state = {
      ipfsHash:null,
      buffer:'',
      ethAddress:'',
      transactionHash:'',
      txReceipt: ''
    };


  captureFile =(event) => {
        event.stopPropagation()
        event.preventDefault()
        const file = event.target.files[0]
        let reader = new window.FileReader()
        reader.readAsArrayBuffer(file)
        reader.onloadend = () => this.convertToBuffer(reader)

        const accounts = web3.eth.getAccounts();
      };

     
      //Convert the file to buffer to store on IPFS
  convertToBuffer = async(reader) => {
      //file is converted to a buffer for upload to IPFS
        const buffer = await Buffer.from(reader.result);
      //set this buffer-using es6 syntax
        this.setState({buffer});
    };
  //ES6 async function
  onClick = async () => {
  try{
          this.setState({blockNumber:"waiting.."});
          this.setState({gasUsed:"waiting..."});
  await web3.eth.getTransactionReceipt(this.state.transactionHash, (err, txReceipt)=>{
            console.log(err,txReceipt);
            this.setState({txReceipt});
          });
        }
  catch(error){
        console.log(error);
      }
  }
  onSubmit = async (event) => {
        event.preventDefault();

        storehash.methods.get().call().then(function(a){
          console.log('from get' + a);
        });
            //bring in user's metamask account address
        const accounts = await web3.eth.getAccounts();

        console.log("meta")
            //obtain contract address from storehash.js
        const ethAddress= await storehash.options.address;
        this.setState({ethAddress});
            //save document to IPFS,return its hash#, and set hash# to state
        await ipfs.add(this.state.buffer, (err, ipfsHash) => {
        console.log(err,ipfsHash);
            //setState by setting ipfsHash to ipfsHash[0].hash
        console.log(ipfsHash[0].hash);
        this.setState({ ipfsHash:ipfsHash[0].hash });
            // call Ethereum contract method "sendHash" and .send IPFS hash to etheruem contract
            //return the transaction hash from the ethereum contract
        

        storehash.methods.setFileHash(this.state.ipfsHash).send({
          from: accounts[0]
        }, (error, transactionHash) => {
          console.log(transactionHash);
          this.setState({transactionHash});
        });
        
        storehash.methods.get().call().then(function(a){
          console.log('from get' + a);
        });
        })
      };
    
  render() {

    let hCount;
    storehash.methods.hashcount().call(function(err, res){
      console.log(' hashcount variable res' + res) ;
      hCount = res;
      var hashes = [];


      console.log('hcount' + hCount);
      for(var i=0 ; i<hCount-1; i++){
        console.log('calling for ' + i);
        storehash.methods.getFileHashes(i).call().then(function(a){
          var divContainer = document.getElementById("imagesContainer");


          var elem = document.createElement("img");
          elem.setAttribute("src", 'http://localhost:8080/ipfs/' + a);
          elem.setAttribute("height", "200");
          elem.setAttribute("width", "200");
          elem.setAttribute("alt", "IPFSFile");
          

          document.getElementById("imagesContainer").appendChild(elem);

          console.log('http://localhost:8080/ipfs/' + a);
          hashes.push(a);
          //console.log(hashes.concat(','))
        });
      }
  });


  return (
        <div className="App">
          <header className="App-header">
       
          </header>
          <hr />
            <h3> Choose file</h3>
            <form onSubmit={this.onSubmit}>
              <input
                type="file"
                onChange={this.captureFile}
              />
              <Button
                type="submit">
                Send it
                  </Button>
            </form>
            <hr />
            <hr />
            <table>
              <thead>
                <tr>
                  <th>Tx Receipt Category</th>
                  <th> </th>
                  <th>Values</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>IPFS Hash stored on Ethereum</td>
                  <td> : </td>
                  <td>{this.state.ipfsHash}</td>
                </tr>
                <tr>
                  <td>Ethereum Contract Address</td>
                  <td> : </td>
                  <td>{this.state.ethAddress}</td>
                </tr>
                <tr>
                  <td>Tx # </td>
                  <td> : </td>
                  <td>{this.state.transactionHash}</td>
                </tr>
              </tbody>
            </table>

            <div id ="imagesContainer">
              </div>
        </div>
        );
      }
}
export default App;