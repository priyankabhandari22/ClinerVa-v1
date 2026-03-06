import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {

const [menuOpen,setMenuOpen] = useState(false);

return (

<nav className="sticky top-0 z-50 bg-slate-900 text-white px-8 py-4">

<div className="flex justify-between items-center">

<h1 className="text-xl font-bold text-indigo-400">
HealthSync
</h1>

<div className="hidden md:flex space-x-8">

<Link to="/">Home</Link>
<Link to="/about">About</Link>
<Link to="/features">Features</Link>
<Link to="/feedback">Patient Feedback</Link>
<Link to="/reviews">Reviews</Link>
<Link to="/contact">Contact</Link>

</div>

<button
className="md:hidden"
onClick={()=>setMenuOpen(!menuOpen)}
>
☰
</button>

</div>

{menuOpen && (

<div className="flex flex-col mt-4 space-y-3 md:hidden">

<Link to="/">Home</Link>
<Link to="/about">About</Link>
<Link to="/features">Features</Link>
<Link to="/feedback">Patient Feedback</Link>
<Link to="/reviews">Reviews</Link>
<Link to="/contact">Contact</Link>

</div>

)}

</nav>

);
}