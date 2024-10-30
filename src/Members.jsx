import * as React from 'react';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState, useEffect } from 'react';

import { getContributions, countWords, getLastXmins } from "./memberStats.js";

//**********************TOOLTIP STYLE*******************///
const HtmlTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: '#f5f5f9',
        color: 'rgba(0, 0, 0, 0.87)',
        maxWidth: 220,
        fontSize: theme.typography.pxToRem(9),
        border: '1px solid #dadde9',
    },
}));

//*****************************************************//

const Members = ({ members,  you, items }) => {
    const [maxScore, setMaxScore] = useState(0);
    const [memberPeaks, setMemberPeaks] = useState([]);
    const [stats, setStats] = useState([]);

    useEffect(()=>{
        if (stats.length >0){

            const max = stats.sort((a, b) => b.score - a.score)[0].score;
            setMaxScore(max);
        }

    }, [stats, items])

    // Get member peaks from storage
    useEffect(() => {
        (async () => {
            try {
                console.log("getting member peaks from storage");
                const storage = miro.board.storage.collection("my-collection");
                const peaks = await storage.get("memberPeaks");
                setMemberPeaks(peaks || []);
            } catch (error) {
                console.log("error getting member peaks from storage:", error);
            }
        })();
    }, []);

    // Calculate stats and update member peaks
    useEffect(() => {
        const stats = [];
        let newPeaks = [...memberPeaks]; // Create a new array for updated peaks
        let updatePeaks = false;

        members.forEach((member) => {
            const contribs = getContributions(member, items);
            const current = getLastXmins(contribs, 10).length;
            const wordCount = countWords(contribs);

            // Find the current peak for the member
            const filteredPeaks = newPeaks.find((memberPeak) => memberPeak.member.id === member.id);
            let peak = filteredPeaks ? filteredPeaks.peak : 0; // Set peak to 0 if no previous peak found

            // Update peak if current contributions exceed the recorded peak
            if (current > peak) {
                peak = current;
                updatePeaks = true;


                // Update existing peak or add new member if not found
                if (filteredPeaks) {
                    filteredPeaks.peak = peak; // Update existing peak
                } else {
                    newPeaks.push({ member: member, peak: peak }); // Add new peak if it doesn't exist
                }
            }

            const score = contribs.length + wordCount / 10 + peak;

            if (score > maxScore) {
                setMaxScore(score);
            }

            const colour = score >= 0.75 * maxScore ? "green"
                : score >= 0.5 * maxScore && score < 0.75 * maxScore ? "orange" : "red";

            stats.push({ member: member, contribs: contribs, wordCount: wordCount, peak: peak, score: score, colour: colour, current: current });
        });

        setStats(stats);
        if (updatePeaks){
            setMemberPeaks(newPeaks); // Update state with the new peaks
            (async () => {
                const storage = miro.board.storage.collection("my-collection");
                await storage.set("memberPeaks", newPeaks);
                console.log("Updated member peaks stored successfully.");
            })();
        }
            
    }, [items, members]); // Dependencies to run the effect

    return (
        <div className="widget widget-full">
            <h1 className='widget-title'>Participation Scores</h1>
                    {members.length === 0 && <p className="member-info">Add more members to see stats</p>}
            <div className='widget-scrollable'>
                <div className='scoreGrid'>
                    {stats .sort((a, b) => b.score - a.score).map(({ member, contribs, colour, current, score, wordCount, peak }) => (
                        <HtmlTooltip
                            key={member.id} // Ensure unique key
                            slotProps={{
                                popper: {
                                    modifiers: [
                                        {
                                            name: 'offset',
                                            options: {
                                                offset: [50, -35],
                                            },
                                        },
                                    ],
                                },
                            }}
                            title={
                                <React.Fragment>
                                    <Typography color={colour}>{member.name}</Typography>
                                    <b>Contributions:</b> {contribs.length}
                                    <br />
                                    <b>Words Typed:</b> {wordCount}
                                    <br />
                                    <br />
                                    <span>Contributions/10 mins:</span>
                                    <br />
                                    <b style={{ margin: "0 0 0 10px" }}>Peak</b>: {peak}
                                    <br />
                                    <b style={{ margin: "0 0 0 10px" }}>Current</b>: {current}
                                    <br />
                                </React.Fragment>
                            }
                        >
                            <div className="scoreGridItem">
                                <p className="score">{score}</p>
                                <p className='scoreName' style={{ color: colour }}>{member.name}</p>
                            </div>
                        </HtmlTooltip>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Members;
