import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useEffect, useState } from 'react';
import { getContributions, countWords, getLastXmins } from "./memberStats.js";


const labelStyle = {
    color: '#229799', // Default value: #1a1a1a (black)
    fillColor: 'transparent', // Default value: transparent (no fill)
    fillOpacity: 1, // Default value: 1 (solid color)
    fontFamily: 'noto sans', // Default font type for the text
    fontSize: 18, // Default font size
    textAlign: 'left', // Default alignment: left
  };


  const statsStyle = {
    color: '#00000',
    fillColor: 'transparent',
    fillOpacity: 1,
    fontFamily: 'courier',
    fontSize: 18,
    textAlign: 'left',
};

const Settings = ({items, members}) => {
  const [leaderboard, setLeaderboard] = useState(null);
  const [texts, setTexts] = useState([]);
  const [memberStats, setMemberStats] = useState([]);
  const [deletedPreExisting, setDeletetedPreExisting] = useState(false);

  //remove existing leaderboards and children on mount
  useEffect(()=>{
    if (!deletedPreExisting && items.length!==0) {
        const leaderboards = items.filter((item)=>{
            return item.type === "frame" && item.title === "Leaderboard"; 
        })
        console.log("leaderboards to be deleted on mount:", leaderboards);

        leaderboards.forEach(async(board)=>{
            const children = await board.getChildren();
            children.forEach(async (child) => {
                await miro.board.remove(child);
            });
    
            await miro.board.remove(board);
        });
        setDeletetedPreExisting(true);
    }
  },[items])

  //update frame height if new members join
  useEffect(() => {
    if (leaderboard !== null) {
        console.log("updating frame height");
        leaderboard.height = 130 + members.length * 50;
        
        (async () => {
            await leaderboard.sync();
        })();
    }
}, [members]);

//update leaderboard info
useEffect(()=>{
    if (leaderboard !==null && texts.length > 0 && memberStats.length > 0) {
        try {
            console.log("Updating leaderboard info");
            
            const sortedStats = memberStats.sort((a, b) => b.score - a.score);

            texts.forEach(async (text, idx)=>{
                const stat = sortedStats[idx];
                
                const content = `${idx+1}. ${stat.member.name.toString().padEnd(26-stat.member.name.length, ' ')}${stat.score.toString().padEnd(51-stat.score.toString().length, ' ')}${stat.contributions.toString().padEnd(40-stat.contributions.toString().length, ' ')}${stat.wordCount.toString().padEnd(40-stat.wordCount.toString().length, ' ')}${stat.peak}`;
                text.content = content;

                await text.sync();
            })

        } catch (error) {
            console.log(error);
            
        }
    }
    
},[items, members])

//determine memberStats
useEffect(()=>{
  let peaks =[];
  (async () => {
    try {
      console.log("Fetching leaderboard peaks from storage");
      const storage = miro.board.storage.collection("my-collection");
      peaks = await storage.get("memberPeaks");

      const stats = peaks.map(({member, peak})=>{
        const contributions = getContributions(member, items);
        const wordCount = countWords(contributions);
        const score = contributions.length + peak + wordCount/10;
        return {score, peak, wordCount, contributions: contributions.length, member};
      })
      setMemberStats(stats);
      console.log("Leaderboard stats:",stats);
    } catch (error) {
      console.log("error fetching leaderboard peaks", error);
    }
  })()


  
},[items]);


const toggleLeaderBoard = async (e) => {
    if (e.target.checked) {
        console.log("Showing Leaderboard");

        if (leaderboard === null) {
            const position = await miro.board.findEmptySpace({
                x: 0,
                y: 0,
                width: 800,
                height: 450,
            });

            const frame = await miro.board.createFrame({
                title: 'Leaderboard',
                style: {
                    fillColor: '#ffffff',
                },
                x: position.x,
                y: position.y,
                width: 1020,
                height: 300,
            });

            console.log("leaderboard frame:", frame);

            const banner = await miro.board.createShape({
                content: '<b>   Participation Leaderboard</b>',
                shape: 'rectangle',
                style: {
                    color: '#f5f5f5',
                    fillColor: '#424242',
                    fontFamily: 'fredoka one',
                    fontSize: 20,
                    textAlign: 'left',
                    textAlignVertical: 'middle',
                    fillOpacity: 1.0,
                },
                x: frame.x,
                y: frame.y - frame.height / 2 + 70 / 2,
                width: 1020,
                height: 70,
            });

            const memberCol = await miro.board.createText({
                content: '<b>Member</b>',
                style: labelStyle,
                x: banner.x - banner.width / 2 + 95,
                y: banner.y + 50,
                width: 150,
            });

            const scoreCol = await miro.board.createText({
                content: '<b>Participation Score</b>',
                style: labelStyle,
                x: banner.x - banner.width / 2 + 2.5 * 95,
                y: banner.y + 50,
                width: 180,
            });

            const contribsCol = await miro.board.createText({
                content: '<b>Contributions</b>',
                style: labelStyle,
                x: banner.x - banner.width / 2 + 5 * 95,
                y: banner.y + 50,
                width: 180,
            });

            const wordsCol = await miro.board.createText({
                content: '<b>Words Typed</b>',
                style: labelStyle,
                x: banner.x - banner.width / 2 + 7 * 95,
                y: banner.y + 50,
                width: 180,
            });

            const peakRateCol = await miro.board.createText({
                content: '<b>Peak Contributions/10 mins</b>',
                style: labelStyle,
                x: banner.x - banner.width / 2 + 9.25 * 95,
                y: banner.y + 50,
                width: 250,
            });

            const statTexts = await Promise.all(members.map(async(member, idx)=>{
                const stat = await miro.board.createText({
                    content: `Loading Stats...`,
                    style: statsStyle,
                    x: banner.x + 20,
                    y: memberCol.y + (idx+1)*40,
                    width: 1020,
                });

                return stat;
            }));

            setTexts(statTexts);

            

            // Add elements directly to the frame

            frame.add(banner);
            frame.add(memberCol);
            frame.add(scoreCol);
            frame.add(contribsCol);
            frame.add(wordsCol);
            frame.add(peakRateCol);
            statTexts.forEach((text)=>{
                frame.add(text);
            })

            await miro.board.viewport.zoomTo(frame);
            await miro.board.viewport.setZoom(0.5);

            setLeaderboard(frame); // Store new frame as the current leaderboard
            console.log("Created new Leaderboard", frame);
        }
    } else {
        console.log("Hiding Leaderboard");

        // Remove the existing leaderboard
        if (leaderboard !== null) {
            try {
                const children = await leaderboard.getChildren();
                children.forEach(async (child) => {
                    await miro.board.remove(child);
                });

                await miro.board.remove(leaderboard);
            } catch (error) {
                console.error("Error removing leaderboard or its children:", error);
            }

            setLeaderboard(null); // Reset state to null after deletion
            setMemberStats([]); // Clear member stats
        }
    }
};


  return ( 
  <>
          <div className='settings'>
              <FormControlLabel onChange={toggleLeaderBoard} control={<Switch size='small' />} label="Show Participation Leaderboard"/>
          </div>
  </> );
}

export default Settings;