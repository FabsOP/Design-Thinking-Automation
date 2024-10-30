import React, { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import { getContributions, countWords, getLastXmins } from "./memberStats.js";

const options = {
  width: 280,
  height: 130,
  bar: { groupWidth: "95%" },
  legend: { position: "none" },
  chartArea: { left: 0, top: 20, width: "70%", height: "70%" },
};

const tfs = [null,"yesterday" ,"today", 5, 10, 15, 30, 60];
const titles = ["All time", "Yesterday", "Today" ,"Last 5 mins", "Last 10 mins", "Last 15 mins", "Last 30 mins", "Last hour"];

const ContribsAndWords = ({members, items, you}) => {
  const [contributions, setContributions] = useState([]) // [[]]
  const [tfIdx, setTfIDX] = useState(0);
 
  useEffect(()=>{
    const timeFrame = tfs[tfIdx];
    const contribs = members.map((member)=>{
      const contrs = getContributions(member, items);
      const tfItems = getLastXmins(contrs, timeFrame);
      const wordCount = countWords(tfItems);

      return [member.name, tfItems.length, wordCount/10];
    })
    setContributions(contribs);

  },[items, tfIdx,members]);

  

  const incrementTfIdx = (increment) => {
    setTfIDX((prevTfIdx) => {
      const newIdx = (prevTfIdx + increment + tfs.length) % tfs.length;
      return newIdx;
    });
  };

  return (
    <div className="widget widget-full">
      <h1 className="widget-title">Contributions</h1>
      {members.length >= 1 && <h3 className="chart-pager">Timeframe:
        <span className="left interactable" onClick={() => incrementTfIdx(-1)}>
          {"<"}
        </span>
        {titles[tfIdx]}
        <span className="right interactable" onClick={() => incrementTfIdx(1)}>
          {">"}
        </span>
      </h3>}
      {members.length < 1 && <p className="member-info">Add more members to see stats</p>}
      {members.length >= 1 && contributions.length !== 0 &&(
        <Chart
          chartType="BarChart"
          width="100px"
          height="130px"
          data={[
                ["City", "Contributions", "Words typed (*0.1)"],
                ...contributions
                
            ]}
          options={{
                width: 280,
                height: 130,
                chartArea: { width: "50%", left: 30 },
                colors: ["3C3D37", "FF4C4C"],
            }}
        />
      )}
    </div>
  );
};

export default ContribsAndWords;
