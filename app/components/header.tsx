import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import UserMenu from './UserMenu';


export default function Header({ 
}) {
  return (
    <header className="bg-neutral-900 text-white p-6 shadow-2xl ">
      <div className="container mx-auto gap-4 flex flex-row items-center  justify-between">
      <div className="container mx-auto gap-8 flex flex-row items-center">
        <img src="./logo.png" className="w-20 h-20" ></img>
       <div>影城介紹</div>
       <div>電影介紹</div>
       <div>活動公告</div>
       <div>會員專區</div>
       

         </div>
       {/* <FontAwesomeIcon icon={faMagnifyingGlass} size="sm" color="#ffffff" /> */}
       <UserMenu />

       </div>
    </header>
  );
}