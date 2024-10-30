import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client'; 
import Members from './Members.jsx';
import ActivityLog from './ActivityLog.jsx'
import BoardStats from './BoardStats.jsx'
import Heatmap from './Heatmap.jsx';
import Proportion from './Proportion.jsx';
import UserDynamics from './UserDynamics.jsx';
import ContribsAndWords from './ContribsAndWords.jsx';
import Leaderboard from './Leaderboard.jsx';
import '../src/assets/style.css';

//THE APP COMPONENT HOUSES ALL THE WIDGETS FOR THE MONITORING APP
const App = () => {
  //STATE VARIABLES STORING ITEMS, MEMBERS, ONLINE, AND FACILITATOR DETAILS (YOU)
  const [items, setItems] = useState([]);
  const [members, setMembers] = useState([]);
  const [online, setOnline] = useState([]);
  const [you, setYou] = useState(null);
  
  //THIS HOOK PERIODICALLY (EVERY 5 SECONDS) FETCHES ITEMS, MEMBERS, AND ONLINE USERS DATA FROM THE MIRO BOARD
  useEffect(() => {
    const fetchData = async () => {
      console.log("FETCHING DATA FROM STORAGE");
      try {
        const collection = miro.board.storage.collection('my-collection');
        let m = await collection.get('members');
        if (!m) {
          await collection.set('members', []);
          m = [];
        }
        console.log("[members]", m);
        setMembers(m);
      } catch (error) {
        console.error("ERROR FETCHING DATA FROM STORAGE", error);
      }

      console.log("FETCHING DATA FROM BOARD");
      try {
        const items = await miro.board.get();
        console.log("Getting board items:", items[0]);
        setItems(items);

        const userInfo = await miro.board.getUserInfo();
        console.log("Getting your acc info:", userInfo);
        setYou(userInfo);

        const onlineUsers = await miro.board.getOnlineUsers();
        console.log("Getting online users:", onlineUsers);
        setOnline(onlineUsers);
      } catch (error) {
        console.error("ERROR FETCHING DATA FROM BOARD", error);
      }
    };

    fetchData(); // Fetch immediately when the component mounts

    const intervalId = setInterval(fetchData, 5000); // Fetch data every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []); // Empty dependency array ensures this runs once on mount

  
  //THIS HOOK UPDATES THE MEMBERS ARRAY IN THE MIRO STORAGE AS NEW MEMBERS COME ONLINE
  useEffect(() => {
    const updateMembers = async () => {
      try {
        const collection = miro.board.storage.collection('my-collection');
        const updatedMembers = [...members];

        online.forEach(person => {
          if (!updatedMembers.some(member => member.id === person.id)) {
            updatedMembers.push(person);
          }
        });

        // If there are new members, update state and storage
        if (updatedMembers.length !== members.length) {
          setMembers(updatedMembers);
          await collection.set('members', updatedMembers);
        }
      } catch (error) {
        console.error("ERROR UPDATING MEMBERS STORAGE", error);
      }
    };

    updateMembers(); // Call the function to update members
  }, [online]); // Depend on `online` so it runs when online users change

  return (
    <>
      <div className='widget-container'>
        {you && items && <Members members={members.filter((member)=>{return member.id !== you.id})} you={you} items={items}/>}
        {items && you && <BoardStats items={items}/>}
        {you && <Proportion members={members.filter((member)=>{return member.id !== you.id})} items={items} you={you}/>}
        {you && items &&<ContribsAndWords items={items} members = {members.filter((member)=>{return member.id !== you.id})} you={you}/>}
        {items && <Heatmap members={members} items={items} />}
        {you && items && <UserDynamics items={items.filter((item)=>{return item.createdBy !== you.id || item.modifiedBy !== you.id})} you={you} members={members.filter((member)=>{return member.id !== you.id})}/>}
        <ActivityLog items={items} online={online} you={you} members={members} />
        {you && items && <Leaderboard items={items} members={members.filter((member)=>{return member.id !== you.id})}/>}
      </div>
    </>
  );
};

const container = document.getElementById('root'); 
const root = createRoot(container); 
root.render(<App />);
