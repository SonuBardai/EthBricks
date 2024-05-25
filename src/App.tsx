import { Route, Routes } from "react-router-dom";
import NavBar from "./shared/core/Navbar";
import { ethers } from "ethers";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Page404 from "./pages/Page404";
import { ErrorBoundary } from "react-error-boundary";
import Error from "./pages/Error";
import { useEffect, useState } from "react";
import config from "./shared/config.json";
import RealEstate from "./shared/abis/RealEstate.json";
import Escrow from "./shared/abis/Escrow.json";
import axios from "axios";
import useTheme from "./shared/core/theme/useTheme";
import Property from "Shared/types/property";

const App = () => {
  const { theme } = useTheme();

  const [properties, setProperties] = useState<Property[]>([]);
  const [account, setAccount] = useState<string>();
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [escrow, setEscrow] = useState<ethers.Contract>();

  const connectHandler = async () => {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(accounts[0]);
  };

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);
    const network = await provider.getNetwork();
    const realEstate = new ethers.Contract(config[network.chainId].realEstate.address, RealEstate, provider);

    const propertiesArray = [];
    const totalSupply = await realEstate.totalSupply();
    for (let i = 1; i <= totalSupply; i++) {
      const uri = await realEstate.tokenURI(i);
      const response = await axios.get(uri);
      propertiesArray.push(response.data);
    }
    setProperties(propertiesArray);

    const escrow = new ethers.Contract(config[network.chainId].escrow.address, Escrow, provider);
    setEscrow(escrow);
  };

  useEffect(() => {
    if (window.ethereum) {
      loadBlockchainData();
    }
  }, []);

  useEffect(() => {
    const ethereum = window.ethereum;
    if (ethereum && ethereum.on && ethereum.removeListener) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      };

      ethereum.on("accountsChanged", handleAccountsChanged);

      return () => ethereum.removeListener("accountsChanged", handleAccountsChanged);
    }
  }, []);

  return (
    <div data-theme={theme}>
      <ErrorBoundary FallbackComponent={Error}>
        <NavBar account={account} connectHandler={connectHandler} />
        <Routes>
          <Route path="/" element={<Home account={account} connectHandler={connectHandler} properties={properties} provider={provider} escrow={escrow} />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Page404 />} />
        </Routes>
      </ErrorBoundary>
    </div>
  );
};

export default App;
