import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import UserMenu from './UserMenu';
import Link from 'next/link';


export default function Header({ 
}) {
  return (
    <header className="bg-neutral-900 text-white  shadow-xl shadow-black/30 ">
      <div className="container mx-auto gap-4 flex flex-row items-center  justify-between">
      <div className="container mx-auto gap-8 flex flex-row items-center">
      <Link href="/" >
        <img src="/logo.png" className="w-20 h-20"  alt="Logo" ></img>
        </Link>

       <div>影城介紹</div>
       <Link href="/" className="text-white">
        電影介紹
        </Link>
       <div>活動公告</div>
       <div>會員專區</div>
       

         </div>
       {/* <FontAwesomeIcon icon={faMagnifyingGlass} size="sm" color="#ffffff" /> */}
       <UserMenu />

       </div>
    </header>
  );
}