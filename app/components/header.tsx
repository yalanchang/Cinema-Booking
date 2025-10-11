export default function Header({ 
}) {
  return (
    <header className="bg-neutral-900 text-white p-6 shadow-2xl ">
      <div className="container mx-auto gap-4 flex items-center">
        <img src="./logo.png" className="w-20 h-20" ></img>
       <div>影城介紹</div>
       <div>電影介紹</div>
      </div>
    </header>
  );
}