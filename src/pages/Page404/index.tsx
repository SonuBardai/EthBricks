import { useNavigate } from "react-router-dom";

const Page404 = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-5xl font-bold text-center">404</h1>
      <button className="btn btn-primary" onClick={() => navigate("/")}>
        Go back
      </button>
    </div>
  );
};

export default Page404;
