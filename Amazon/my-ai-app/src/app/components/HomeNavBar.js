// app/components/HomeNavBar.js
import Link from "next/link";
import '../globals.css'
import './home.css'

export default function HomeNavBar() {
  return (
    <div className='home'>
      

    <nav style={{display:"flex",width:'100%',justifyContent:'space-between'}}>
    <h1 className="Appname">VERCEL AI SDK CORE</h1>
      <ul>
        <li>
          <Link href="/Demand-forecasting">Demand-forecasting</Link>
        </li>
        <li>
          <Link href="/Query-resolver">Query-resolver</Link>
        </li>
        <li>
          <Link href="/Logistic-suggestions">Logistic-suggestions</Link>
        </li>
        <li>
          <Link href="/Compilence">Compilence</Link>
        </li>
      </ul>
    </nav>
    </div>
  );
}
