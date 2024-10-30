import { useState, useEffect } from "react";
import { getContributions, countWords, getLastXmins } from "./memberStats.js";

//THIS WIDGET PROVIDES GENERAL STATS ABOUT THE MONITORED GROUP AS A WHOLE
const BoardStats = ({ items }) => {
  const [peak, setPeak] = useState(0);
  const [current, setCurrent] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(new Date("2001-09-09T08:00:00"));

  // Fetch latest peak and lastUpdate from storage
  useEffect(() => {
    (async () => {
      try {
        console.log("Fetching Peak Rate and lastUpdate from storage");
        const storage = miro.board.storage.collection('my-collection');
        const peakRate = await storage.get("peakRate");
        const lastUpdated = await storage.get("lastUpdate");
        if (peakRate) setPeak(peakRate);
        if (lastUpdated) setLastUpdate(new Date(lastUpdated));
      } catch (error) {
        console.log("Error fetching peak and lastUpdate from storage");
      }
    })();
  }, []);

  // Update peak contributions every time the items array changes
  useEffect(() => {

    const items10Mins = getLastXmins(items,10);

    const contribs = getContributions(null,items10Mins);
    setCurrent(contribs.length);

    if (contribs.length > peak) {
      setPeak(contribs.length);
      // Update peak in DB
      (async () => {
        try {
          console.log("Updating Peak Rate in storage");
          const storage = miro.board.storage.collection('my-collection');
          await storage.set("peakRate", contribs.length);
        } catch (error) {
          console.log("Error updating peak c/10mins in storage");
        }
      })();
    }
  }, [items, peak]);

  // Update lastUpdate whenever items are modified
  useEffect(() => {
    let latestUpdate = lastUpdate;
    items.forEach(item => {
      const modTime = new Date(item.modifiedAt);
      if (modTime.getTime() > latestUpdate.getTime()) {
        latestUpdate = modTime;
        setLastUpdate(modTime);

        // Update lastUpdate in storage
        (async () => {
          try {
            console.log("Updating lastUpdate in storage");
            const storage = miro.board.storage.collection('my-collection');
            await storage.set("lastUpdate", modTime.toISOString());
          } catch (error) {
            console.log("Error updating lastUpdate in storage");
          }
        })();
      }
    });
  }, [items, lastUpdate]);

  const getLastUpdateLabel = () => {
    const now = new Date();
    const diffMs = now - lastUpdate;
    const diffHrs = diffMs / (1000 * 60 * 60);

    if (now.toDateString() === lastUpdate.toDateString()) {
      return `[${lastUpdate.getHours()}:${String(lastUpdate.getMinutes()).padStart(2, '0')}]`;
    } else if (diffHrs < 24) {
      return `yest [${lastUpdate.getHours()}:${String(lastUpdate.getMinutes()).padStart(2, '0')}]`;
    } else {
      return `>24 hrs`;
    }
  };

  return (
    <div className='widget'>
      <h1 className='widget-title'>Board Stats</h1>
      <p className='board-info' style={{ display: 'flex', justifyContent: 'space-between', marginTop: "-5px" }}>
        Items Created: <span className="boardStat">{items.length}</span>
      </p>
      <p className='board-info' style={{ display: 'flex', justifyContent: 'space-between', marginTop: "-5px" }}>
        Total Edits: <span className="boardStat">{items.filter(item => new Date(item.modifiedAt).getTime() - new Date(item.createdAt).getTime() > 60000).length}</span>
      </p>
      <p className='board-info' style={{ display: 'flex', justifyContent: 'space-between', margin: "10px 0 -5px 0" }}>
        Peak c/10mins: <span className="boardStat">{peak}</span>
      </p>
      <p className='board-info' style={{ display: 'flex', justifyContent: 'space-between', margin: "0 0 -5px 0" }}>
        Current c/10mins: <span className="boardStat">{current}</span>
      </p>
      <p className='board-info' style={{ margin: "-5px 0 0 0", fontWeight: "400" }}>
        *c - contributions
      </p>
      <p className="board-info" style={{ display: 'flex', justifyContent: 'space-between', marginTop: "10px" }}>
        Last update: <span className="boardStat">{getLastUpdateLabel()}</span>
      </p>
    </div>
  );
};

export default BoardStats;
