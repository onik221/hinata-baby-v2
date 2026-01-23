module.exports = {
  config: {
    name: "pending",
    aliases: ["pen", "approve"],
    version: "1.7",
    author: "MahMUD",
    countDown: 10,
    role: 2,
    category: "utility"
  },

  onReply: async function ({ message, api, event, Reply, usersData }) {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); 
     if (module.exports.config.author !== obfuscatedAuthor) {
     return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
     }
    
    const { author, pending } = Reply;
    const { body, threadID, messageID, senderID } = event;

    if (String(senderID) !== String(author)) return;

    let count = 0;
    const index = body.split(/\s+/);

    for (const i of index) {
      if (isNaN(i) || i <= 0 || i > pending.length) continue;

      const target = pending[i - 1];
      api.unsendMessage(messageID);
      
      api.sendMessage("Bot is now connected! Use !help to see commands.", target.threadID);
      const name = await usersData.getName(senderID);
      api.sendMessage(`Group approved by ${name}`, target.threadID);
      count++;
    }

    return api.sendMessage(`Successfully approved ${count} groups`, threadID, messageID);
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, senderID } = event;

    try {
      const spam = await api.getThreadList(100, null, ["OTHER"]) || [];
      const pend = await api.getThreadList(100, null, ["PENDING"]) || [];
      const list = [...spam, ...pend].filter(g => g.isSubscribed && g.isGroup);

      if (list.length === 0) return api.sendMessage("No groups in queue.", threadID, messageID);

      let msg = `Total Pending: ${list.length}\n`;
      list.forEach((g, i) => msg += `${i + 1}. ${g.name || "Unknown"} (${g.threadID})\n`);
      msg += "\nReply with index number to approve.";

      api.sendMessage(msg, threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          author: senderID,
          pending: list
        });
      }, messageID);
    } catch (e) {
      api.sendMessage("Error fetching list.", threadID, messageID);
    }
  }
};
