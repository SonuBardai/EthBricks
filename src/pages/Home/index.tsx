import { PROJECT_NAME } from "../../shared/constants";
import Hero from "./public/hero.jpg";

const Home = () => {
  return (
    <div className="hero text-white min-h-screen bg-base-200 relative">
      <img src={Hero} className="w-full max-h-screen h-full object-cover" />
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="hero-content h-full w-full text-center relative">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Welcome to {PROJECT_NAME}!</h1>
          <p className="py-6">We are an online real estate listing website that uses web3 nfts to help you buy your dream home!</p>
          <button className="btn btn-primary">Connect your wallet</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
