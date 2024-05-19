import { useNavigate } from "react-router-dom";
import { PROJECT_NAME } from "../constants";

const NavBar = () => {
  const navigate = useNavigate();

  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl" onClick={() => navigate("/")}>
          {PROJECT_NAME}
        </a>
      </div>

      <div className="flex-none">
        <button className="btn btn-outline btn-ghost" onClick={() => navigate("/login")}>
          Connect Wallet
        </button>
      </div>
    </div>
  );
};

export default NavBar;
