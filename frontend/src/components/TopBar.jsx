import { Link } from "react-router-dom";
function TopBar() {
  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <Link to="/offers">Special Offers</Link>
      </div>

      <div className="top-bar-right">
<Link to="/support">Customer Support</Link>
<Link to="/support">Contact Us</Link>
      </div>
    </div>
  );
}

export default TopBar;