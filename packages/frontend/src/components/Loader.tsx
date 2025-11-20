import './Loader.css';

interface LoaderProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const Loader = ({ message = 'Loading...', size = 'medium' }: LoaderProps) => {
  return (
    <div className={`loader-container loader-${size}`}>
      <div className="loader-spinner">
        <div className="heart-loader">
          <div className="heart"/>
          <div className="heart"/>
        </div>
      </div>
      {message && <p className="loader-message">{message}</p>}
    </div>
  );
};

export default Loader;

