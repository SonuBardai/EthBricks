import PropertyType from "Shared/types/property";
import { PROJECT_NAME } from "../../shared/constants";
import Hero from "./public/hero.jpg";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

const Property = ({ account, provider, property, escrow }: { account: string; provider: ethers.providers.Web3Provider; property: PropertyType; escrow: ethers.Contract }) => {
  const dialogId = `dialog-${property.id}`;
  const [hasBought, setHasBought] = useState(false);
  const [hasLended, setHasLended] = useState(false);
  const [hasInspected, setHasInspected] = useState(false);
  const [hasSold, setHasSold] = useState(false);

  const [buyer, setBuyer] = useState(null);
  const [lender, setLender] = useState(null);
  const [inspector, setInspector] = useState(null);
  const [seller, setSeller] = useState(null);
  const [owner, setOwner] = useState("");

  const fetchDetails = async () => {
    const buyer = await escrow.buyer(property.id);
    const inspector = await escrow.inspector();
    const seller = await escrow.seller();
    const lender = await escrow.lender();
    setBuyer(buyer);
    setInspector(inspector);
    setSeller(seller);
    setLender(lender);

    const hasBought = await escrow.approvals(property.id, buyer);
    setHasBought(hasBought);
    const hasSold = await escrow.approvals(property.id, seller);
    setHasSold(hasSold);
    const hasLended = await escrow.approvals(property.id, lender);
    setHasLended(hasLended);
    const hasInspected = await escrow.inspectionStatus(property.id);
    setHasInspected(hasInspected);
  };

  const fetchOwner = async () => {
    if (!(await escrow.isListed(property.id))) {
      const owner = await escrow.buyer(property.id);
      setOwner(owner);
    }
  };

  useEffect(() => {
    fetchDetails();
    fetchOwner();
  }, [account, property]);

  const buyHandler = async () => {
    const escrowAmount = await escrow.escrowAmount(property.id);
    const signer = await provider.getSigner();

    // Buyer deposit earnest
    let transaction = await escrow.connect(signer).depositEarnestAmount(property.id, { value: escrowAmount });
    await transaction.wait();

    // Buyer approves...
    transaction = await escrow.connect(signer).approveSale(property.id);
    await transaction.wait();

    setHasBought(true);
  };

  const lendHandler = async () => {
    const signer = await provider.getSigner();

    // approve sale
    const transaction = await escrow.connect(signer).approveSale(property.id, true);
    await transaction.wait();

    // lend funds
    const purchasePrice = await escrow.purchasePrice(property.id);
    const escrowAmount = await escrow.escrowAmount(property.id);
    const lendAmount = purchasePrice - escrowAmount;
    await signer.sendTransaction({ to: escrow.address, value: lendAmount.toString(), gasLimit: 1000000 });
  };

  const inspectHandler = async () => {
    const signer = await provider.getSigner();
    const transaction = await escrow.connect(signer).updateInspectionStatus(property.id, true);
    await transaction.wait();
    setHasInspected(true);
  };

  const sellHandler = async () => {
    const signer = await provider.getSigner();
    const transaction = await escrow.connect(signer).approveSale(property.id);
    await transaction.wait();
    setHasSold(true);
  };

  return (
    <>
      <dialog id={dialogId} className="modal">
        <div className="modal-box max-w-[75vw] w-full border border-white relative">
          <div className="modal-action">
            <form method="dialog">
              <button className="btn absolute top-0 right-0">&#10005;</button>
            </form>
          </div>

          <div className="flex justify-evenly">
            <img src={property.image} alt="Property" className="w-1/2" />
            <div>
              <h3 className="font-bold text-lg">{property.name}</h3>
              <p className="py-4">{property.description}</p>
              <table className="table">
                <tbody>
                  {property.attributes.map((attribute) => (
                    <tr key={attribute.trait_type}>
                      <td>{attribute.trait_type}</td>
                      <td>{attribute.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex flex-col items-center my-4">
            {owner ? (
              <div className="btn btn-ghost">Owned by {owner && owner.slice(0, 6) + "..." + owner.slice(38, 42)}</div>
            ) : (
              <div>
                {account === inspector ? (
                  <button className="btn btn-secondary px-12" onClick={inspectHandler} disabled={hasInspected}>
                    Approve Inspection
                  </button>
                ) : account === lender ? (
                  <button className="btn btn-secondary px-12" onClick={lendHandler} disabled={hasLended}>
                    Approve & Lend
                  </button>
                ) : account === seller ? (
                  <button className="btn btn-secondary px-12" onClick={sellHandler} disabled={hasSold}>
                    Approve & Sell
                  </button>
                ) : (
                  <button className="btn btn-secondary px-12" onClick={buyHandler} disabled={hasBought}>
                    Buy
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </dialog>

      <div className="card w-96 bg-base-200 shadow-xl">
        <figure>
          <img src={property.image} alt="Property" />
        </figure>
        <div className="card-body">
          <h2 className="card-title">{property.name}</h2>
          <p>{property.description}</p>
          <div className="card-actions justify-end">
            <button
              className="btn btn-primary"
              onClick={() => {
                (document.getElementById(dialogId) as HTMLDialogElement).showModal();
              }}
            >
              Details
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const Dashboard = ({
  account,
  provider,
  properties,
  escrow,
}: {
  account?: string;
  provider?: ethers.providers.Web3Provider;
  properties?: PropertyType[];
  escrow?: ethers.Contract;
}) => {
  return (
    account &&
    provider &&
    escrow && (
      <div className="px-4 min-h-screen">
        <div className="hero">
          <div className="hero-content flex-col max-w-full w-full mr-auto">
            <div className="flex flex-col gap-4 w-full bg-base-200 p-4 rounded-md">
              <h1 className="text-5xl font-bold">Hi {account ? account.slice(0, 6) + "..." + account.slice(38, 42) : "there"}!</h1>
              <div>Your search for the dream house starts here!</div>
              <div className="flex gap-4 items-center">
                <label className="input input-bordered w-full flex items-center gap-2">
                  <input type="text" className="grow" placeholder="Search properties..." />
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70">
                    <path
                      fillRule="evenodd"
                      d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </label>
                <button className="btn btn-primary">Search</button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-row justify-evenly">
          {properties?.map((property) => (
            <Property account={account} provider={provider} key={property.id} property={property} escrow={escrow} />
          ))}
        </div>
      </div>
    )
  );
};

const Home = ({
  account,
  connectHandler,
  properties,
  provider,
  escrow,
}: {
  account?: string;
  connectHandler?: () => void;
  properties?: PropertyType[];
  provider?: ethers.providers.Web3Provider;
  escrow?: ethers.Contract;
}) => {
  return account ? (
    <Dashboard account={account} provider={provider} properties={properties} escrow={escrow} />
  ) : (
    <div className="hero text-white min-h-screen bg-base-200 relative">
      <img src={Hero} className="w-full max-h-screen h-full object-cover" />
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="hero-content h-full w-full text-center relative">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Welcome to {PROJECT_NAME}!</h1>
          <p className="py-6">We are an online real estate listing website that uses web3 nfts to help you buy your dream home!</p>
          <button className="btn btn-primary" onClick={connectHandler}>
            Connect your wallet
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
