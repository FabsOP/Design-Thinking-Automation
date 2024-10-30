import gibberish from "@lanred/gibberish-detective";

export const getContributions = (member, items)=>{
    const set = new Set();
    return items.filter((item)=>{
        const content = extractTextFromHTML(item.content);
        const inSet = set.has(content);
        let memberMatch;
        if (member === null) {
            memberMatch=true;
        } else {
            memberMatch = item.createdBy === member.id;
        }
        set.add(content);

        return (memberMatch && !gibberish.detect(content) && content.length >0 && !inSet);
    })
}

const extractTextFromHTML = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    return doc.body.textContent || '';
};

export const countWords = (items)=>{
    let count = 0;
    items.forEach(item => {
        const content = item.content;

        if (content !== undefined){
            const words = extractTextFromHTML(content).trim().split(/\s+/);
            count += words.filter(word => word.length > 0).length; // Count only non-empty words
        }
    });
    return count
}

export const getLastXmins = (items, time)=>{
    if (time === null){
        return items;
    }
    const now = new Date(new Date().toISOString());
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate()-1);
    return items.filter((item)=>{
      const created = new Date(item.createdAt);

        if (time==="today"){
            return created.getDate() == now.getDate();
        }

        if (time === "yesterday"){
            return created.getDate() === yesterday.getDate();
        }

      return now.getTime() - created.getTime() < time*60*1000;
    })

}