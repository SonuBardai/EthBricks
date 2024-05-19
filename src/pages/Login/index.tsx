import { MdOutlineEmail } from "react-icons/md";
import { FaKey } from "react-icons/fa6";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  return (
    <div className="card mx-auto my-12 w-96 bg-base-100 shadow-xl">
      <div className="card-body items-center text-center">
        <h2 className="card-title">Login!</h2>
        <label className="input input-bordered flex items-center gap-2">
          <MdOutlineEmail />
          <input type="text" className="grow" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="input input-bordered flex items-center gap-2">
          <FaKey />
          <input type="password" className="grow" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button className="btn btn-primary">Login</button>
        <div>
          Don't have an account?{" "}
          <button onClick={() => navigate("/register")} className="link">
            Signup here
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
