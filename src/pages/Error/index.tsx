import { EMAIL } from "../../shared/constants";

const Error = () => (
  <div className="hero min-h-screen bg-base-200">
    <div className="hero-content text-center">
      <div className="max-w-md">
        <h1 className="text-5xl font-bold">Oh no! You found a bug</h1>
        <p className="py-6">
          Please contact us{" "}
          <a href={`mailto:${EMAIL}`} className="link">
            here
          </a>
        </p>
        <button className="btn btn-primary">Get Started</button>
      </div>
    </div>
  </div>
);

export default Error;
