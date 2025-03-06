import Navbar from './Components/Navbar';
import Homepage from './Components/Home'

export default function Home() {
  return (
    <main>
      <Navbar />
      <Homepage/>
      <div className="container mx-auto p-4">
        {/* Your other page content goes here */}
      </div>
    </main>
  );
}

