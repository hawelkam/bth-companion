import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import "./Dashboard.css";
import { auth, db, logout } from "./firebase";
import { query, collection, getDocs, where } from "firebase/firestore";
import withAuthGuard from "./withAuthGuard";

interface IRoute {
  distance: number;
  elevation: number;
  map: string;
  name: string;
}

function Dashboard() {
  const [user] = useAuthState(auth);
  const [name, setName] = useState("");
  const [routeId, setRouteId] = useState("");
  const [routeData, setRouteData] = useState<IRoute>();
  const fetchUserName = async () => {
    try {
      const q = query(collection(db, "users"), where("uid", "==", user?.uid));
      const doc = await getDocs(q);
      const data = doc.docs[0].data();
      setName(data.name);
    } catch (err) {
      console.error(err);
      alert("An error occured while fetching user data");
    }
  };
  const callRefresh = `https://www.strava.com/oauth/token?client_id=${process.env.REACT_APP_STRAVA_CLIENT_ID}&client_secret=${process.env.REACT_APP_STRAVA_CLIENT_SECRET}&refresh_token=${process.env.REACT_APP_STRAVA_REFRESH_TOKEN}&grant_type=refresh_token`;

  useEffect(() => {
    console.log("dashboard");
    fetchUserName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getRouteData = async () => {
    fetch(callRefresh, { method: "POST" })
      .then((res) => res.json())
      .then((result) =>
        fetch(
          `https://www.strava.com/api/v3/routes/${routeId}?access_token=${result.access_token}`
        )
          .then((res) => res.json())
          .then((res) =>
            setRouteData({
              name: res.name,
              distance: Math.floor(res.distance),
              elevation: Math.floor(res.elevation_gain),
              map: res.map_urls.retina_url,
            })
          )
      );
  };
  return (
    <div className="dashboard">
      <div className="dashboard__container">
        Logged in as
        <div>{name}</div>
        <div>{user?.email}</div>
        <button className="dashboard__btn" onClick={logout}>
          Logout
        </button>
      </div>
      <div className="dashboard_container">
        <input
          type="number"
          placeholder="Insert route id..."
          value={routeId}
          onChange={(e) => setRouteId(e.target.value)}
        />
        <button onClick={() => getRouteData()}>Get route data</button>
      </div>
      {routeData && (
        <div className="dashboard_container">
          <ul>
            <li>Name: {routeData.name}</li>
            <li>Distance: {routeData.distance}m</li>
            <li>Elevation: {routeData.elevation}m</li>
          </ul>
          <img src={routeData.map} alt="" />
        </div>
      )}
    </div>
  );
}
export default withAuthGuard(Dashboard);
