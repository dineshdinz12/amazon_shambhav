// app/pages/index.js
import HomeNavBar from "../app/components/HomeNavBar.js";
import OverviewPage from "./components/overviewPage.js";

export default function HomePage() {
  return (
    <div>
      {/* <HomeNavBar /> */}
      <OverviewPage />
    </div>
  );
}
