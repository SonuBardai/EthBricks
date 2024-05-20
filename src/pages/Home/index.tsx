import PropertyType from "Shared/types/property";
import { PROJECT_NAME } from "../../shared/constants";
import Hero from "./public/hero.jpg";

const Property = ({ property }: { property: PropertyType }) => {
  const dialogId = `dialog-${property.id}`;
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
            <button className="btn btn-secondary px-12">Buy</button>
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

const Dashboard = ({ account, properties }) => {
  return (
    <div className="px-4 min-h-screen">
      <div className="hero">
        <div className="hero-content flex-col max-w-full w-full mr-auto">
          <div className="flex flex-col gap-4 w-full bg-base-200 p-4 rounded-md">
            <h1 className="text-5xl font-bold">Hi {account.slice(0, 6) + "..." + account.slice(38, 42)}!</h1>
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
        {properties.map((property) => (
          <Property key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
};

const Home = ({ account, connectHandler, properties, provider, escrow }) => {
  return account ? (
    <Dashboard account={account} properties={properties} />
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
