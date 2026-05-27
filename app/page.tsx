export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-8 py-6">
        <span className="text-xl font-semibold">fear.social v2</span>
        <div className="flex gap-8 items-center">
          <a href="#" className="text-sm">Services</a>
          <a href="#" className="text-sm">About</a>
          <a href="#" className="text-sm">Contact</a>
          <button className="bg-orange-500 text-white px-5 py-2 rounded">
            Book now
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24">
        <h2 className="text-5xl md:text-7xl font-semibold leading-tight">
          Empowering <br />
          Tomorrow’s Founders, <br />
          Today
        </h2>
      </section>

    </main>
  );
}